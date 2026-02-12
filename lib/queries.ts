import { createClient } from '@/lib/supabase/client'
import type { Representation, TheatreGroup, CsvRow } from './types'

export async function getRepresentationsByDate(
  date: string // format YYYY-MM-DD
): Promise<TheatreGroup[]> {
  const supabase = createClient()

  let query = supabase
    .from('representations')
    .select('*')
    .eq('date', date)
    // Hide non-theatre entries from the public site
    .eq('is_theatre', true)
    .order('theatre_nom', { ascending: true })
    .order('heure', { ascending: true, nullsFirst: false })


  const { data, error } = await query

  if (error) throw new Error(error.message)

  return groupByTheatre(data || [])
}

function groupByTheatre(representations: Representation[]): TheatreGroup[] {
  const groups = new Map<string, TheatreGroup>()

  for (const rep of representations) {
    if (!groups.has(rep.theatre_nom)) {
      groups.set(rep.theatre_nom, {
        theatre_nom: rep.theatre_nom,
        theatre_adresse: rep.theatre_adresse,
        representations: [],
      })
    }
    groups.get(rep.theatre_nom)!.representations.push(rep)
  }

  return Array.from(groups.values())
}

export async function importRepresentations(
  rows: CsvRow[]
): Promise<{ inserted: number; errors: string[] }> {
  const supabase = createClient()
  const errors: string[] = []
  let inserted = 0

  // Insertion par batch de 100
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)

    const { data, error } = await supabase
      .from('representations')
      .insert(batch)
      .select()

    if (error) {
      errors.push(`Batch ${Math.floor(i / 100) + 1}: ${error.message}`)
    } else {
      inserted += data?.length || 0
    }
  }

  return { inserted, errors }
}

export async function addRepresentation(
  rep: CsvRow
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from('representations').insert(rep)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
