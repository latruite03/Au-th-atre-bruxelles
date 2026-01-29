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
