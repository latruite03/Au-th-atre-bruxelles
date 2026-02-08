import { createClient } from '@/lib/supabase/client'
import type { Representation } from './types'

// ---------------------------------------------------------------------------
// Insertion status
// ---------------------------------------------------------------------------

/** All distinct theatre names currently in the database */
export async function getDistinctTheatres(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('representations')
    .select('theatre_nom')

  if (error) throw new Error(error.message)

  const set = new Set<string>()
  for (const row of data || []) {
    set.add(row.theatre_nom)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
}

/** The N most recently created representations */
export async function getLatestRepresentations(
  limit = 20
): Promise<Representation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('representations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data || []) as Representation[]
}

/** Per-source summary: last created_at, total count */
export interface SourceStatus {
  source: string
  count: number
  lastCreatedAt: string
  theatreNom: string
}

export async function getSourceStatuses(): Promise<SourceStatus[]> {
  const supabase = createClient()

  // Fetch source + created_at + theatre_nom for all rows that have a source
  const { data, error } = await supabase
    .from('representations')
    .select('source,created_at,theatre_nom')
    .not('source', 'is', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const map = new Map<
    string,
    { count: number; lastCreatedAt: string; theatreNom: string }
  >()

  for (const row of data || []) {
    const src = row.source as string
    const prev = map.get(src)
    if (!prev) {
      map.set(src, {
        count: 1,
        lastCreatedAt: row.created_at as string,
        theatreNom: row.theatre_nom as string,
      })
    } else {
      prev.count += 1
    }
  }

  return Array.from(map.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => a.source.localeCompare(b.source, 'fr'))
}

// ---------------------------------------------------------------------------
// Problems & data quality
// ---------------------------------------------------------------------------

export interface FieldMissingStat {
  field: string
  label: string
  count: number
}

/** Count rows where key fields are null or empty */
export async function getMissingFieldsStats(): Promise<FieldMissingStat[]> {
  const supabase = createClient()

  const fields: { field: string; label: string }[] = [
    { field: 'heure', label: 'Heure' },
    { field: 'description', label: 'Description' },
    { field: 'image_url', label: 'Image' },
    { field: 'genre', label: 'Genre' },
    { field: 'style', label: 'Style' },
    { field: 'url', label: 'URL de reservation' },
  ]

  const results: FieldMissingStat[] = []

  for (const f of fields) {
    const { count, error } = await supabase
      .from('representations')
      .select('*', { count: 'exact', head: true })
      .or(`${f.field}.is.null,${f.field}.eq.`)

    if (error) throw new Error(error.message)
    results.push({ field: f.field, label: f.label, count: count ?? 0 })
  }

  return results
}

export interface DuplicateGroup {
  titre: string
  theatre_nom: string
  date: string
  heure: string | null
  count: number
  ids: number[]
}

/** Find rows that share titre + theatre_nom + date + heure (potential duplicates) */
export async function getDuplicates(): Promise<DuplicateGroup[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('representations')
    .select('id,titre,theatre_nom,date,heure')
    .order('theatre_nom')
    .order('titre')
    .order('date')

  if (error) throw new Error(error.message)

  const map = new Map<string, { ids: number[]; row: (typeof data)[0] }>()

  for (const row of data || []) {
    const key = `${row.theatre_nom}||${row.titre}||${row.date}||${row.heure ?? ''}`
    const prev = map.get(key)
    if (!prev) {
      map.set(key, { ids: [row.id], row })
    } else {
      prev.ids.push(row.id)
    }
  }

  return Array.from(map.values())
    .filter((v) => v.ids.length > 1)
    .map((v) => ({
      titre: v.row.titre,
      theatre_nom: v.row.theatre_nom,
      date: v.row.date,
      heure: v.row.heure,
      count: v.ids.length,
      ids: v.ids,
    }))
    .sort((a, b) => b.count - a.count)
}

/** Rows with dates in the past (before today) — informational, not necessarily a problem */
export async function getPastShowsCount(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10)
  const supabase = createClient()

  const { count, error } = await supabase
    .from('representations')
    .select('*', { count: 'exact', head: true })
    .lt('date', today)

  if (error) throw new Error(error.message)
  return count ?? 0
}

/** Total rows in the table */
export async function getTotalCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('representations')
    .select('*', { count: 'exact', head: true })

  if (error) throw new Error(error.message)
  return count ?? 0
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export interface MonthStat {
  month: string // YYYY-MM
  label: string // e.g. "Fev 2026"
  count: number
}

export interface WeekStat {
  week: string // YYYY-WNN
  label: string // e.g. "S07 2026"
  count: number
}

export interface TheatreStat {
  theatre_nom: string
  count: number
}

/** All rows with date + theatre_nom for stats computation */
export async function getStatsData(): Promise<
  Pick<Representation, 'date' | 'theatre_nom' | 'genre'>[]
> {
  const supabase = createClient()

  // Fetch in chunks because supabase defaults to 1000
  const allData: Pick<Representation, 'date' | 'theatre_nom' | 'genre'>[] = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('representations')
      .select('date,theatre_nom,genre')
      .range(from, from + pageSize - 1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    allData.push(...(data as Pick<Representation, 'date' | 'theatre_nom' | 'genre'>[]))
    if (data.length < pageSize) break
    from += pageSize
  }

  return allData
}
