'use client'

interface FiltersProps {
  theatres: string[]
  selectedTheatre: string | null
  onTheatreChange: (theatre: string | null) => void
}

export function FiltersComponent({
  theatres,
  selectedTheatre,
  onTheatreChange,
}: FiltersProps) {
  const options = Array.from(new Set(theatres)).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="theatre" className="text-xs text-gray-500 uppercase tracking-wider">
          Théâtre
        </label>
        <select
          id="theatre"
          value={selectedTheatre || ''}
          onChange={(e) => onTheatreChange(e.target.value || null)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 focus:outline-none focus:border-black"
        >
          <option value="">Tous</option>
          {options.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
