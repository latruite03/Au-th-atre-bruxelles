'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { importRepresentations } from '@/lib/queries'
import type { CsvRow } from '@/lib/types'

interface ParsedData {
  data: CsvRow[]
  errors: string[]
}

// URL de base pour les images dans Supabase Storage
const SUPABASE_STORAGE_URL = 'https://orcuuknomvpzduiyrfpw.supabase.co/storage/v1/object/public/images/'

function normalizeGenre(value: string | undefined | null): CsvRow['genre'] {
  if (!value) return null
  const v = value.toLowerCase().trim()

  // Accept already-normalized values
  if (v === 'comedie' || v === 'drame' || v === 'autre') return v

  // Common variants
  if (v.includes('com')) return 'comedie' // comédie, comedy
  if (v.includes('dram') || v.includes('trag')) return 'drame'
  if (v.includes('jeune public') || v.includes('experimental') || v.includes('expérimental') || v.includes('inclassable')) return 'autre'

  return null
}

function normalizeStyle(value: string | undefined | null): CsvRow['style'] {
  if (!value) return null
  const v = value.toLowerCase().trim()

  if (v === 'classique' || v === 'contemporain') return v

  if (v.includes('class')) return 'classique'
  if (v.includes('contemp') || v.includes('moderne') || v.includes('creation') || v.includes('création')) return 'contemporain'

  return null
}

export function CsvImport() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    inserted: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const validRows: CsvRow[] = []

        results.data.forEach((row: unknown, index: number) => {
          const r = row as Record<string, string>

          // Validation
          if (!r.date) {
            errors.push(`Ligne ${index + 2}: date manquante`)
            return
          }
          if (!r.titre) {
            errors.push(`Ligne ${index + 2}: titre manquant`)
            return
          }
          if (!r.theatre_nom) {
            errors.push(`Ligne ${index + 2}: theatre_nom manquant`)
            return
          }

          const normalizedGenre = normalizeGenre(r.genre)
          const normalizedStyle = normalizeStyle(r.style)

          if (r.genre && !normalizedGenre) {
            errors.push(
              `Ligne ${index + 2}: genre invalide "${r.genre}" → laissé vide`
            )
          }
          if (r.style && !normalizedStyle) {
            errors.push(
              `Ligne ${index + 2}: style invalide "${r.style}" → laissé vide`
            )
          }

          // Construire l'URL de l'image si image_filename est fourni
          const imageUrl = r.image_filename
            ? SUPABASE_STORAGE_URL + r.image_filename.trim()
            : null

          validRows.push({
            date: r.date,
            heure: r.heure || null,
            titre: r.titre,
            theatre_nom: r.theatre_nom,
            theatre_adresse: r.theatre_adresse || null,
            url: r.url || null,
            genre: normalizedGenre,
            style: normalizedStyle,
            description: r.description || null,
            image_url: imageUrl,
          })
        })

        setParsedData({ data: validRows, errors })
      },
      error: (error) => {
        setParsedData({ data: [], errors: [error.message] })
      },
    })
  }

  const handleImport = async () => {
    if (!parsedData || parsedData.data.length === 0) return

    setImporting(true)
    try {
      const importResult = await importRepresentations(parsedData.data)
      setResult(importResult)
      setParsedData(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setResult({
        inserted: 0,
        errors: [err instanceof Error ? err.message : 'Erreur inconnue'],
      })
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setParsedData(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier CSV
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Colonnes: date, heure, titre, theatre_nom, theatre_adresse,
          url, genre, style, description, image_filename
        </p>
      </div>

      {parsedData && (
        <div className="space-y-4">
          {parsedData.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Avertissements ({parsedData.errors.length})
              </h4>
              <ul className="text-sm text-yellow-700 list-disc list-inside max-h-32 overflow-y-auto">
                {parsedData.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedData.data.length > 0 && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Aperçu ({parsedData.data.length} lignes valides)
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pr-4 py-1">Date</th>
                        <th className="pr-4 py-1">Heure</th>
                        <th className="pr-4 py-1">Titre</th>
                        <th className="pr-4 py-1">Théâtre</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {parsedData.data.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="pr-4 py-1">{row.date}</td>
                          <td className="pr-4 py-1">{row.heure || '-'}</td>
                          <td className="pr-4 py-1">{row.titre}</td>
                          <td className="pr-4 py-1">{row.theatre_nom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.data.length > 5 && (
                    <p className="text-gray-500 mt-2">
                      ... et {parsedData.data.length - 5} autres lignes
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing
                    ? 'Import en cours...'
                    : `Importer ${parsedData.data.length} lignes`}
                </button>
                <button
                  onClick={handleReset}
                  disabled={importing}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.errors.length > 0
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <p
            className={`font-medium ${
              result.errors.length > 0 ? 'text-yellow-800' : 'text-green-800'
            }`}
          >
            {result.inserted} ligne(s) importée(s)
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
