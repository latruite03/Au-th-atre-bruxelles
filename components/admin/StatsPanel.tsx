'use client'

import { useEffect, useMemo, useState } from 'react'
import { getStatsData } from '@/lib/admin-queries'
import type { Representation } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Avr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aou',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

const COLORS = [
  '#d97706',
  '#059669',
  '#2563eb',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#65a30d',
  '#ea580c',
  '#4f46e5',
]

const PIE_COLORS = ['#d97706', '#2563eb', '#6b7280']

function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}

export function StatsPanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<
    Pick<Representation, 'date' | 'theatre_nom' | 'genre'>[]
  >([])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStatsData()
      setRawData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  // --- Computed stats ---

  const monthData = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rawData) {
      const m = r.date.slice(0, 7) // YYYY-MM
      map.set(m, (map.get(m) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [y, m] = month.split('-')
        return {
          month,
          label: `${MONTH_LABELS[m] || m} ${y}`,
          count,
        }
      })
  }, [rawData])

  const weekData = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rawData) {
      const year = r.date.slice(0, 4)
      const week = getWeekNumber(r.date)
      const key = `${year}-S${String(week).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({
        week,
        label: week.replace('-', ' '),
        count,
      }))
  }, [rawData])

  const theatreData = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rawData) {
      map.set(r.theatre_nom, (map.get(r.theatre_nom) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [rawData])

  const genreData = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rawData) {
      const g = r.genre || 'non defini'
      const label =
        g === 'comedie'
          ? 'Comedie'
          : g === 'drame'
          ? 'Drame'
          : g === 'autre'
          ? 'Autre'
          : 'Non defini'
      map.set(label, (map.get(label) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [rawData])

  // Day-of-week distribution
  const dayOfWeekData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const counts = new Array(7).fill(0)
    for (const r of rawData) {
      const d = new Date(r.date)
      counts[d.getDay()] += 1
    }
    return days.map((name, i) => ({ name, count: counts[i] }))
  }, [rawData])

  // Top 10 theatres for chart
  const topTheatres = theatreData.slice(0, 15)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
          <p className="text-sm text-gray-500">
            Vue d&apos;ensemble sur {rawData.length.toLocaleString('fr-BE')}{' '}
            representations, {theatreData.length} theatres.
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

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total representations"
          value={rawData.length.toLocaleString('fr-BE')}
        />
        <KpiCard
          label="Theatres"
          value={`${theatreData.length}`}
        />
        <KpiCard
          label="Mois couverts"
          value={`${monthData.length}`}
        />
        <KpiCard
          label="Moy. / mois"
          value={
            monthData.length > 0
              ? Math.round(rawData.length / monthData.length).toLocaleString(
                  'fr-BE'
                )
              : '0'
          }
        />
      </div>

      {/* Monthly chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Representations par mois
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="count" name="Representations" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly chart */}
      {weekData.length <= 60 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Representations par semaine
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                  }}
                />
                <Bar dataKey="count" name="Representations" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Day of week */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Repartition par jour de la semaine
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="count" name="Representations" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Genre pie */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Repartition par genre
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label={(props) => {
                  const name = props.name ?? ''
                  const percent = props.percent ?? 0
                  return `${name} (${(percent * 100).toFixed(0)}%)`
                }}
                labelLine
              >
                {genreData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top theatres horizontal bar */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Top {topTheatres.length} theatres (par nombre de representations)
        </h3>
        <div style={{ height: topTheatres.length * 32 + 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topTheatres}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="count" name="Representations" radius={[0, 4, 4, 0]}>
                {topTheatres.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full theatre table */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Tous les theatres ({theatreData.length})
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Theatre</th>
                <th className="py-2 font-medium text-right">Representations</th>
              </tr>
            </thead>
            <tbody>
              {theatreData.map((t, i) => (
                <tr
                  key={t.name}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-1.5 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 pr-4 text-gray-900">{t.name}</td>
                  <td className="py-1.5 text-right text-gray-700">
                    {t.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  )
}
