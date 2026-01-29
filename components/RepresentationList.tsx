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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (theatres.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-3 text-lg font-medium text-gray-900">
          Aucune représentation
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Pas de spectacle prévu pour cette date. Essayez une autre date.
        </p>
      </div>
    )
  }

  const totalShows = theatres.reduce(
    (acc, t) => acc + t.representations.length,
    0
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        {totalShows} représentation{totalShows > 1 ? 's' : ''} dans{' '}
        {theatres.length} théâtre{theatres.length > 1 ? 's' : ''}
      </p>

      {theatres.map((theatre) => (
        <TheatreCard key={theatre.theatre_nom} theatre={theatre} />
      ))}
    </div>
  )
}
