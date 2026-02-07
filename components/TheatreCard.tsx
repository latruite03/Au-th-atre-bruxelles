import type { TheatreGroup } from '@/lib/types'
import { RepresentationItem } from './RepresentationItem'

interface TheatreCardProps {
  theatre: TheatreGroup
}

export function TheatreCard({ theatre }: TheatreCardProps) {
  const seen = new Set<string>()
  const uniqueReps = theatre.representations.filter((rep) => {
    const key = [rep.titre, rep.heure, rep.url].map((v) => v || '').join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <div className="border border-black mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black text-white">
        <h3 className="text-base sm:text-lg font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          {theatre.theatre_nom}
        </h3>
        {theatre.theatre_adresse && (
          <p className="text-sm text-gray-300 mt-1">
            {theatre.theatre_adresse}
          </p>
        )}
      </div>

      <div className="px-4 sm:px-6 py-2">
        {uniqueReps.map((rep) => (
          <RepresentationItem key={rep.id} representation={rep} />
        ))}
      </div>
    </div>
  )
}
