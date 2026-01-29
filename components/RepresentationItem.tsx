import Image from 'next/image'
import type { Representation } from '@/lib/types'
import { formatHeure, getGenreLabel, getStyleLabel } from '@/lib/utils'

interface RepresentationItemProps {
  representation: Representation
}

export function RepresentationItem({ representation }: RepresentationItemProps) {
  const genreLabel = getGenreLabel(representation.genre)
  const styleLabel = getStyleLabel(representation.style)

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Vignette image */}
      <div className="flex-shrink-0 w-20 h-28 relative rounded-lg overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm">
        {representation.image_url ? (
          <Image
            src={representation.image_url}
            alt={representation.titre}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold text-gray-900 leading-tight">
              {representation.titre}
            </h4>
            <p
              className={`text-sm mt-1 ${
                representation.heure
                  ? 'text-amber-600 font-medium'
                  : 'text-gray-400 italic'
              }`}
            >
              {formatHeure(representation.heure)}
            </p>
          </div>

          {representation.url && (
            <a
              href={representation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow"
            >
              <span>Réserver</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {representation.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {representation.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {genreLabel && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              {genreLabel}
            </span>
          )}
          {styleLabel && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {styleLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
