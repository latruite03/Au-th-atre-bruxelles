import Image from 'next/image'
import type { Representation } from '@/lib/types'
import { formatHeure, normalizeTitle } from '@/lib/utils'

interface RepresentationItemProps {
  representation: Representation
}

export function RepresentationItem({ representation }: RepresentationItemProps) {

  return (
    <div className="py-4 border-b border-gray-200 last:border-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full">
          {representation.image_url && (
            <div className="relative w-full sm:w-40 h-40 sm:h-28 flex-shrink-0 border border-gray-200 bg-gray-50 overflow-hidden">
              <Image
                src={representation.image_url}
                alt={normalizeTitle(representation.titre)}
                fill
                sizes="(max-width: 640px) 100vw, 160px"
                quality={90}
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-lg font-semibold text-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
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
          </div>
        </div>

        {representation.url && (
          <a
            href={representation.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto text-center flex-shrink-0 px-4 py-2 text-sm text-white transition-colors ${
              representation.is_complet ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {representation.is_complet ? 'Complet' : 'Réserver'}
          </a>
        )}
      </div>
    </div>
  )
}
