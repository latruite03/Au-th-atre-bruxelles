import type { TheatreGroup } from '@/lib/types'
import { RepresentationItem } from './RepresentationItem'

interface TheatreCardProps {
  theatre: TheatreGroup
}

export function TheatreCard({ theatre }: TheatreCardProps) {
  return (
    <div className="border border-black mb-6">
      <div className="px-6 py-4 bg-black text-white">
        <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          {theatre.theatre_nom}
        </h3>
        {theatre.theatre_adresse && (
          <p className="text-sm text-gray-300 mt-1">
            {theatre.theatre_adresse}
          </p>
        )}
      </div>

      <div className="px-6 py-2">
        {theatre.representations.map((rep) => (
          <RepresentationItem key={rep.id} representation={rep} />
        ))}
      </div>
    </div>
  )
}
