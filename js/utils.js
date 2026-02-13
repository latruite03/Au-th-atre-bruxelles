/* ============================================================
   Utilitaires partages
   ============================================================ */

/**
 * Formate une date YYYY-MM-DD en texte francais
 * Ex: "2026-02-13" → "vendredi 13 fevrier 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formate une heure HH:MM:SS → HH:MM
 */
function formatHeure(heure) {
  if (!heure) return 'Heure \u00e0 confirmer'
  return heure.slice(0, 5)
}

/**
 * Convertit un objet Date en YYYY-MM-DD
 */
function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Decode les entites HTML courantes
 */
function decodeHtmlEntities(input) {
  if (!input) return ''
  return input
    .replace(/&#8212;/g, '\u2014')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * Normalise un titre: tout en minuscules sauf la premiere lettre.
 * Ex: "L'EFFET MIROIR" → "L'effet miroir"
 */
function normalizeTitle(title) {
  const raw = decodeHtmlEntities((title || '').trim())
  if (!raw) return ''
  const lower = raw.toLocaleLowerCase('fr-BE')
  const chars = Array.from(lower)
  const idx = chars.findIndex(function (c) { return /[\p{L}\p{N}]/u.test(c) })
  if (idx === -1) return lower
  chars[idx] = chars[idx].toLocaleUpperCase('fr-BE')
  return chars.join('')
}

function getGenreLabel(genre) {
  switch (genre) {
    case 'comedie': return 'Com\u00e9die'
    case 'drame': return 'Drame'
    case 'autre': return 'Autre'
    default: return ''
  }
}

function getStyleLabel(style) {
  switch (style) {
    case 'classique': return 'Classique'
    case 'contemporain': return 'Contemporain'
    default: return ''
  }
}

/**
 * Echappe le HTML pour eviter les injections XSS
 */
function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
