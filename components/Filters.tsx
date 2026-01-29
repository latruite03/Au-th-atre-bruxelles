'use client'

import type { Filters } from '@/lib/types'

interface FiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FiltersComponent({ filters, onFiltersChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[150px]">
        <label
          htmlFor="genre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Genre
        </label>
        <select
          id="genre"
          value={filters.genre || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              genre: e.target.value || null,
            })
          }
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Tous les genres</option>
          <option value="comedie">Comédie</option>
          <option value="drame">Drame</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label
          htmlFor="style"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Style
        </label>
        <select
          id="style"
          value={filters.style || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              style: e.target.value || null,
            })
          }
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Tous les styles</option>
          <option value="classique">Classique</option>
          <option value="contemporain">Contemporain</option>
        </select>
      </div>
    </div>
  )
}
