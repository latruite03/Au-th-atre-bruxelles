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
    <div className="space-y-8">
      {/* Section Date - Grande et centrée */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Choisissez une date
        </h2>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* Filtres - Plus petits, en dessous */}
      <div className="border-t border-gray-200 pt-6">
        <FiltersComponent filters={filters} onFiltersChange={setFilters} />
      </div>

      {error && (
        <div className="border border-black p-4 text-black text-sm">
          {error}
        </div>
      )}

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-medium text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Spectacles du {formatDate(toDateString(selectedDate))}
        </h2>
        <RepresentationList theatres={results} loading={loading} />
      </div>
    </div>
  )
}
