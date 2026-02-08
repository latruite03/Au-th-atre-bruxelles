'use client'

import { useEffect, useState } from 'react'
import {
  getMissingFieldsStats,
  getDuplicates,
  getPastShowsCount,
  getTotalCount,
  type FieldMissingStat,
  type DuplicateGroup,
} from '@/lib/admin-queries'
import { createClient } from '@/lib/supabase/client'

export function ProblemsPanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [missingFields, setMissingFields] = useState<FieldMissingStat[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [pastCount, setPastCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [missing, dupes, past, total] = await Promise.all([
        getMissingFieldsStats(),
        getDuplicates(),
        getPastShowsCount(),
        getTotalCount(),
      ])
      setMissingFields(missing)
      setDuplicates(dupes)
      setPastCount(past)
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

  const deleteDuplicate = async (idsToDelete: number[]) => {
    setDeletingIds((prev) => {
      const next = new Set(prev)
      for (const id of idsToDelete) next.add(id)
      return next
    })

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('representations')
        .delete()
        .in('id', idsToDelete)

      if (error) throw new Error(error.message)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setDeletingIds(new Set())
    }
  }

  const deletePastShows = async () => {
    if (
      !confirm(
        `Supprimer les ${pastCount} representations passees ? Cette action est irreversible.`
      )
    )
      return

    try {
      setLoading(true)
      const supabase = createClient()
      const today = new Date().toISOString().slice(0, 10)
      const { error } = await supabase
        .from('representations')
        .delete()
        .lt('date', today)

      if (error) throw new Error(error.message)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    }
  }

  const totalProblems =
    missingFields.reduce((a, b) => a + b.count, 0) +
    duplicates.length +
    pastCount

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
            Problemes &amp; incoherences
          </h2>
          <p className="text-sm text-gray-500">
            Donnees manquantes, doublons et anomalies dans la base.
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

      {/* Summary badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          totalProblems === 0
            ? 'bg-green-50 text-green-700'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            totalProblems === 0 ? 'bg-green-500' : 'bg-amber-500'
          }`}
        />
        {totalProblems === 0
          ? 'Aucun probleme detecte'
          : `${totalProblems.toLocaleString('fr-BE')} point(s) d'attention`}
      </div>

      {/* Missing fields */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Donnees manquantes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {missingFields.map((f) => {
            const pct =
              totalCount > 0
                ? Math.round(((totalCount - f.count) / totalCount) * 100)
                : 100
            return (
              <div
                key={f.field}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {f.label}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-xl font-bold ${
                      f.count === 0 ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {f.count === 0
                      ? 'OK'
                      : f.count.toLocaleString('fr-BE')}
                  </span>
                  {f.count > 0 && (
                    <span className="text-xs text-gray-400">
                      manquant(s)
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct === 100
                          ? 'bg-green-500'
                          : pct >= 80
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {pct}% complet
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Past shows */}
      {pastCount > 0 && (
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Representations passees
              </h3>
              <p className="text-sm text-amber-700 mt-0.5">
                {pastCount.toLocaleString('fr-BE')} representation(s) avec une
                date anterieure a aujourd&apos;hui.
              </p>
            </div>
            <button
              onClick={deletePastShows}
              className="px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Nettoyer
            </button>
          </div>
        </div>
      )}

      {/* Duplicates */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Doublons potentiels{' '}
          <span className="text-gray-400 font-normal">
            ({duplicates.length})
          </span>
        </h3>

        {duplicates.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun doublon detecte.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {duplicates.slice(0, 50).map((d, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {d.titre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {d.theatre_nom} &middot; {d.date}{' '}
                    {d.heure ? `a ${d.heure.slice(0, 5)}` : ''}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {d.count} exemplaires (IDs: {d.ids.join(', ')})
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Keep the first, delete the rest
                    const toDelete = d.ids.slice(1)
                    deleteDuplicate(toDelete)
                  }}
                  disabled={d.ids.some((id) => deletingIds.has(id))}
                  className="text-xs px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
                >
                  Garder 1, suppr. {d.count - 1}
                </button>
              </div>
            ))}
            {duplicates.length > 50 && (
              <div className="text-xs text-gray-500">
                Affichage limite a 50 sur {duplicates.length} groupes.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
