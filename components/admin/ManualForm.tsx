'use client'

import { useState } from 'react'
import { addRepresentation } from '@/lib/queries'
import type { CsvRow } from '@/lib/types'

export function ManualForm() {
  const [formData, setFormData] = useState<CsvRow>({
    date: '',
    heure: null,
    titre: '',
    theatre_nom: '',
    theatre_adresse: null,
    url: null,
    genre: null,
    style: null,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const result = await addRepresentation(formData)

      if (result.success) {
        setMessage({ type: 'success', text: 'Représentation ajoutée' })
        setFormData({
          date: formData.date, // Keep the date for convenience
          heure: null,
          titre: '',
          theatre_nom: formData.theatre_nom, // Keep the theatre for convenience
          theatre_adresse: formData.theatre_adresse,
          url: null,
          genre: null,
          style: null,
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur inconnue' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label
            htmlFor="heure"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Heure
          </label>
          <input
            type="time"
            id="heure"
            name="heure"
            value={formData.heure || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="titre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Titre de la pièce *
        </label>
        <input
          type="text"
          id="titre"
          name="titre"
          required
          value={formData.titre}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="theatre_nom"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom du théâtre *
          </label>
          <input
            type="text"
            id="theatre_nom"
            name="theatre_nom"
            required
            value={formData.theatre_nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label
            htmlFor="theatre_adresse"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Adresse du théâtre
          </label>
          <input
            type="text"
            id="theatre_adresse"
            name="theatre_adresse"
            value={formData.theatre_adresse || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          URL (billetterie)
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url || ''}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Non spécifié</option>
            <option value="comedie">Comédie</option>
            <option value="drame">Drame</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Style
          </label>
          <select
            id="style"
            name="style"
            value={formData.style || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Non spécifié</option>
            <option value="classique">Classique</option>
            <option value="contemporain">Contemporain</option>
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ajout en cours...' : 'Ajouter la représentation'}
      </button>
    </form>
  )
}
