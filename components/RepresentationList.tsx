import type { TheatreGroup } from '@/lib/types'
import { TheatreCard } from './TheatreCard'

interface RepresentationListProps {
  theatres: TheatreGroup[]
  loading: boolean
}

export function RepresentationList({
  theatres,
  loading,
}: RepresentationListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent" />
      </div>
    )
  }

  if (theatres.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200">
        <p className="text-lg text-gray-400" style={{ fontFamily: 'var(--font-heading)' }}>
          Aucune représentation
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Pas de spectacle prévu pour cette date.
        </p>
      </div>
    )
  }

  const totalShows = theatres.reduce(
    (acc, t) => acc + t.representations.length,
    0
  )

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
        {totalShows} représentation{totalShows > 1 ? 's' : ''} — {theatres.length} théâtre{theatres.length > 1 ? 's' : ''}
      </p>

      {theatres.map((theatre) => (
        <TheatreCard key={theatre.theatre_nom} theatre={theatre} />
      ))}
    </div>
  )
}
