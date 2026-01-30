import type { Representation } from '@/lib/types'
import { formatHeure, getGenreLabel, getStyleLabel } from '@/lib/utils'

interface RepresentationItemProps {
  representation: Representation
}

export function RepresentationItem({ representation }: RepresentationItemProps) {
  const genreLabel = getGenreLabel(representation.genre)
  const styleLabel = getStyleLabel(representation.style)

  return (
    <div className="py-4 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {representation.titre}
          </h4>
          <p className={`text-sm mt-1 ${representation.heure ? 'text-black' : 'text-gray-400 italic'}`}>
            {formatHeure(representation.heure)}
          </p>

          {representation.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {representation.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {genreLabel && (
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {genreLabel}
              </span>
            )}
            {genreLabel && styleLabel && (
              <span className="text-xs text-gray-300">•</span>
            )}
            {styleLabel && (
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {styleLabel}
              </span>
            )}
          </div>
        </div>

        {representation.url && (
          <a
            href={representation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 text-sm text-white bg-black hover:bg-gray-800 transition-colors"
          >
            Réserver
          </a>
        )}
      </div>
    </div>
  )
}
