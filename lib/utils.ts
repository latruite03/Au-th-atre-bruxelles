import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'EEEE d MMMM yyyy', { locale: fr })
}

export function formatHeure(heure: string | null): string {
  if (!heure) return 'Heure à confirmer'
  // heure is in format HH:MM:SS, we want HH:MM
  return heure.slice(0, 5)
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getGenreLabel(genre: string | null): string {
  switch (genre) {
    case 'comedie':
      return 'Comédie'
    case 'drame':
      return 'Drame'
    case 'autre':
      return 'Autre'
    default:
      return ''
  }
}

export function getStyleLabel(style: string | null): string {
  switch (style) {
    case 'classique':
      return 'Classique'
    case 'contemporain':
      return 'Contemporain'
    default:
      return ''
  }
}

// Normalise les titres : tout en minuscules sauf la première lettre.
// Exemple: "L’EFFET MIROIR" -> "L’effet miroir"
export function normalizeTitle(title: string): string {
  const raw = (title || '').trim()
  if (!raw) return ''

  const lower = raw.toLocaleLowerCase('fr-BE')

  // Capitalise la première lettre alphabétique (en gardant les guillemets/punctuations au début).
  const chars = Array.from(lower)
  const idx = chars.findIndex((c) => /[\p{L}\p{N}]/u.test(c))
  if (idx === -1) return lower

  chars[idx] = chars[idx].toLocaleUpperCase('fr-BE')
  return chars.join('')
}
