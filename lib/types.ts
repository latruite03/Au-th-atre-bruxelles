export interface Representation {
  id: number
  date: string // format YYYY-MM-DD
  heure: string | null // format HH:MM:SS ou null
  titre: string
  theatre_nom: string
  theatre_adresse: string | null
  url: string | null
  genre: 'comedie' | 'drame' | 'autre' | null
  style: 'classique' | 'contemporain' | null
  image_url: string | null
  description: string | null // mini-pitch de 3-4 lignes

  // Pipeline fields (optional, may be null depending on ingestion path)
  source?: string | null
  source_url?: string | null
  fingerprint?: string | null

  created_at?: string
}

export interface TheatreGroup {
  theatre_nom: string
  theatre_adresse: string | null
  representations: Representation[]
}

export interface Filters {
  genre: string | null
  style: string | null
}

export type CsvRow = Omit<Representation, 'id' | 'created_at'>
