'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Representation } from '@/lib/types'

type ShowKey = {
  key: string
  theatre_nom: string
  titre: string
  source_url: string | null
  count: number
  sampleDates: string[]
}

function makeKey(r: Pick<Representation, 'source_url' | 'theatre_nom' | 'titre'>) {
  return r.source_url || `${r.theatre_nom}||${r.titre}`
}

export function TodoImages() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Representation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const shows: ShowKey[] = useMemo(() => {
    const map = new Map<string, ShowKey>()
    for (const r of items) {
      const k = makeKey(r)
      const prev = map.get(k)
      if (!prev) {
        map.set(k, {
          key: k,
          theatre_nom: r.theatre_nom,
          titre: r.titre,
          source_url: r.source_url ?? null,
          count: 1,
          sampleDates: [r.date],
        })
      } else {
        prev.count += 1
        if (prev.sampleDates.length < 3 && !prev.sampleDates.includes(r.date)) {
          prev.sampleDates.push(r.date)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [items])

  const fetchMissing = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('representations')
        .select('id,date,titre,theatre_nom,source_url,image_url')
        .or('image_url.is.null,image_url.eq.')
        .order('theatre_nom', { ascending: true })
        .order('titre', { ascending: true })
        .order('date', { ascending: true })
        .limit(2000)

      if (error) throw new Error(error.message)
      setItems((data || []) as unknown as Representation[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMissing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyImageUrl = async (show: ShowKey) => {
    const imageUrl = (inputs[show.key] || '').trim()
    if (!imageUrl) return

    setSavingKey(show.key)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('representations')
        .update({ image_url: imageUrl })

      if (show.source_url) {
        query = query.eq('source_url', show.source_url)
      } else {
        query = query.eq('theatre_nom', show.theatre_nom).eq('titre', show.titre)
      }

      const { error } = await query
      if (error) throw new Error(error.message)

      await fetchMissing()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSavingKey(null)
    }
  }

  const exportCsv = () => {
    const header = ['source_url', 'theatre_nom', 'titre', 'image_url'].join(',')
    const rows = shows.map((s) => {
      const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
      return [
        esc(s.source_url || ''),
        esc(s.theatre_nom),
        esc(s.titre),
        esc(''),
      ].join(',')
    })

    const blob = new Blob([header + '\n' + rows.join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'images-a-completer.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Images à compléter
          </h2>
          <p className="text-sm text-gray-500">
            Colle une URL d’affiche (ex: og:image) et on l’applique à toutes les dates du même spectacle.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={shows.length === 0}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Export CSV (mission agent)
          </button>
          <button
            onClick={fetchMissing}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Chargement…</div>
      ) : shows.length === 0 ? (
        <div className="text-sm text-gray-500">Rien à compléter 🎯</div>
      ) : (
        <div className="space-y-3">
          {shows.map((s) => (
            <div
              key={s.key}
              className="border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-gray-500">{s.theatre_nom}</div>
                  <div className="font-medium text-gray-900 truncate">
                    {s.titre}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {s.count} représentation(s) • ex: {s.sampleDates.join(', ')}
                  </div>
                  {s.source_url && (
                    <div className="text-xs mt-1">
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-700 hover:underline"
                      >
                        Page source
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="url"
                    placeholder="https://.../affiche.jpg"
                    value={inputs[s.key] || ''}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [s.key]: e.target.value }))
                    }
                    className="w-72 max-w-[50vw] px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => applyImageUrl(s)}
                    disabled={savingKey === s.key}
                    className="px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {savingKey === s.key ? 'OK…' : 'Appliquer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Astuce agent: récupérer l’image via &lt;meta property="og:image"&gt; sur la page source.
      </div>
    </div>
  )
}
