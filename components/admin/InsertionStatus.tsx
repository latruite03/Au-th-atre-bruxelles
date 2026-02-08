'use client'

import { useEffect, useState } from 'react'
import { THEATRES_CIBLE } from '@/lib/theatres-cible'
import {
  getDistinctTheatres,
  getLatestRepresentations,
  getSourceStatuses,
  getTotalCount,
  type SourceStatus,
} from '@/lib/admin-queries'
import type { Representation } from '@/lib/types'
import { formatDate, formatHeure } from '@/lib/utils'

export function InsertionStatus() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dbTheatres, setDbTheatres] = useState<string[]>([])
  const [latestReps, setLatestReps] = useState<Representation[]>([])
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [showMissing, setShowMissing] = useState(false)
  const [showPresent, setShowPresent] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [theatres, latest, sources, total] = await Promise.all([
        getDistinctTheatres(),
        getLatestRepresentations(15),
        getSourceStatuses(),
        getTotalCount(),
      ])
      setDbTheatres(theatres)
      setLatestReps(latest)
      setSourceStatuses(sources)
      setTotalCount(total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  // Matching logic: check if any DB theatre name includes or matches a target
  const matchedTargets = THEATRES_CIBLE.filter((target) =>
    dbTheatres.some(
      (db) =>
        db.toLowerCase() === target.toLowerCase() ||
        db.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(db.toLowerCase())
    )
  )

  const missingTargets = THEATRES_CIBLE.filter(
    (t) => !matchedTargets.includes(t)
  )

  // Theatres in DB but not in target list
  const extraTheatres = dbTheatres.filter(
    (db) =>
      !THEATRES_CIBLE.some(
        (target) =>
          db.toLowerCase() === target.toLowerCase() ||
          db.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(db.toLowerCase())
      )
  )

  // Determine connectors needing refresh (last update > 7 days ago)
  const now = Date.now()
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
  const staleConnectors = sourceStatuses.filter(
    (s) => now - new Date(s.lastCreatedAt).getTime() > SEVEN_DAYS
  )

  const coveragePct = Math.round(
    (matchedTargets.length / THEATRES_CIBLE.length) * 100
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Situation d&apos;insertion
          </h2>
          <p className="text-sm text-gray-500">
            Couverture des theatres, dernieres insertions et etat des
            connecteurs.
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Rafraichir
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Representations"
          value={totalCount.toLocaleString('fr-BE')}
        />
        <KpiCard
          label="Theatres en DB"
          value={`${dbTheatres.length}`}
        />
        <KpiCard
          label="Couverture cible"
          value={`${matchedTargets.length}/${THEATRES_CIBLE.length}`}
          sub={`${coveragePct}%`}
        />
        <KpiCard
          label="Connecteurs"
          value={`${sourceStatuses.length}`}
          sub={
            staleConnectors.length > 0
              ? `${staleConnectors.length} a rafraichir`
              : 'tous a jour'
          }
          subColor={staleConnectors.length > 0 ? 'text-amber-600' : 'text-green-600'}
        />
      </div>

      {/* Coverage bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">
            Progression vers les {THEATRES_CIBLE.length} theatres
          </span>
          <span className="text-gray-500">{coveragePct}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all"
            style={{ width: `${coveragePct}%` }}
          />
        </div>
      </div>

      {/* Missing / present toggles */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowMissing(!showMissing)}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            showMissing
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {missingTargets.length} manquant(s)
        </button>
        <button
          onClick={() => setShowPresent(!showPresent)}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            showPresent
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {matchedTargets.length} present(s)
        </button>
        {extraTheatres.length > 0 && (
          <span className="text-xs text-gray-400 self-center">
            + {extraTheatres.length} theatre(s) hors liste cible en DB
          </span>
        )}
      </div>

      {showMissing && missingTargets.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Theatres manquants ({missingTargets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {missingTargets.map((t) => (
              <div key={t} className="text-sm text-red-700">
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {showPresent && matchedTargets.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Theatres presents ({matchedTargets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {matchedTargets.map((t) => (
              <div key={t} className="text-sm text-green-700">
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connector / Source statuses */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Etat des connecteurs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Theatre</th>
                <th className="py-2 pr-4 font-medium text-right">Lignes</th>
                <th className="py-2 font-medium">Derniere maj</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sourceStatuses.map((s) => {
                const isStale =
                  now - new Date(s.lastCreatedAt).getTime() > SEVEN_DAYS
                const dateStr = s.lastCreatedAt
                  ? new Date(s.lastCreatedAt).toLocaleDateString('fr-BE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'

                return (
                  <tr
                    key={s.source}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">
                      {s.source}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{s.theatreNom}</td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {s.count}
                    </td>
                    <td className="py-2 text-gray-500">{dateStr}</td>
                    <td className="py-2 pl-2">
                      {isStale && (
                        <span className="text-xs text-amber-600 font-medium">
                          A rafraichir
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest representations */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Dernieres representations ajoutees
        </h3>
        <div className="space-y-2">
          {latestReps.map((r) => (
            <div
              key={r.id}
              className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {r.titre}
                </div>
                <div className="text-sm text-gray-500">
                  {r.theatre_nom} &middot; {formatDate(r.date)}{' '}
                  {r.heure ? `a ${formatHeure(r.heure)}` : ''}
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {r.created_at
                  ? new Date(r.created_at).toLocaleDateString('fr-BE', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      {sub && (
        <div className={`text-xs mt-0.5 ${subColor || 'text-gray-500'}`}>
          {sub}
        </div>
      )}
    </div>
  )
}
