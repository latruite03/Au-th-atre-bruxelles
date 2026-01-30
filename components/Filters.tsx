'use client'

import type { Filters } from '@/lib/types'

interface FiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FiltersComponent({ filters, onFiltersChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      <div className="flex items-center gap-2">
        <label htmlFor="genre" className="text-xs text-gray-500 uppercase tracking-wider">
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
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 focus:outline-none focus:border-black"
        >
          <option value="">Tous</option>
          <option value="comedie">Comédie</option>
          <option value="drame">Drame</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="style" className="text-xs text-gray-500 uppercase tracking-wider">
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
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 focus:outline-none focus:border-black"
        >
          <option value="">Tous</option>
          <option value="classique">Classique</option>
          <option value="contemporain">Contemporain</option>
        </select>
      </div>
    </div>
  )
}
