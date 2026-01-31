import Image from 'next/image'
import type { Representation } from '@/lib/types'
import { formatHeure, getGenreLabel, getStyleLabel, isJeunePublic, normalizeTitle } from '@/lib/utils'

interface RepresentationItemProps {
  representation: Representation
}

export function RepresentationItem({ representation }: RepresentationItemProps) {
  const genreLabel = getGenreLabel(representation.genre)
  const styleLabel = getStyleLabel(representation.style)
  const jeunePublic = isJeunePublic(representation.titre, representation.description)

  return (
    <div className="py-4 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {representation.image_url && (
            <div className="relative w-40 h-28 flex-shrink-0 border border-gray-200 bg-gray-50 overflow-hidden">
              <Image
                src={representation.image_url}
                alt={normalizeTitle(representation.titre)}
                fill
                sizes="160px"
                quality={90}
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
          <h4 className="text-base font-medium text-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {normalizeTitle(representation.titre)}
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
            {jeunePublic && (
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Jeune public
              </span>
            )}
            {(genreLabel || jeunePublic) && styleLabel && (
              <span className="text-xs text-gray-300">•</span>
            )}
            {styleLabel && (
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {styleLabel}
              </span>
            )}
          </div>
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
