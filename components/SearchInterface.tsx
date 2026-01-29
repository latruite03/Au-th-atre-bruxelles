'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatePicker } from './DatePicker'
import { FiltersComponent } from './Filters'
import { RepresentationList } from './RepresentationList'
import { getRepresentationsByDate } from '@/lib/queries'
import { toDateString, formatDate } from '@/lib/utils'
import type { TheatreGroup, Filters } from '@/lib/types'

export function SearchInterface() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState<Filters>({ genre: null, style: null })
  const [results, setResults] = useState<TheatreGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dateString = toDateString(selectedDate)
      const data = await getRepresentationsByDate(dateString, filters)
      setResults(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue'
      )
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisissez une date
            </label>
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par
            </label>
            <FiltersComponent filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Spectacles du {formatDate(toDateString(selectedDate))}
        </h2>
        <RepresentationList theatres={results} loading={loading} />
      </div>
    </div>
  )
}
