import type { TheatreGroup } from '@/lib/types'
import { RepresentationItem } from './RepresentationItem'

interface TheatreCardProps {
  theatre: TheatreGroup
}

export function TheatreCard({ theatre }: TheatreCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {theatre.theatre_nom}
            </h3>
            {theatre.theatre_adresse && (
              <p className="text-sm text-white/80 mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {theatre.theatre_adresse}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        {theatre.representations.map((rep) => (
          <RepresentationItem key={rep.id} representation={rep} />
        ))}
      </div>
    </div>
  )
}
