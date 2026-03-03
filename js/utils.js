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

  // Robust HTML entity decoding (covers &eacute;, &agrave;, etc.)
  // Safe because we only decode entities then escapeHtml() before injecting.
  try {
    var txt = document.createElement('textarea')
    txt.innerHTML = String(input)
    input = txt.value
  } catch (e) {
    // ignore (non-browser context)
  }

  return String(input)
    // numeric entities (common punctuation)
    .replace(/&#8211;/g, '\u2013') // en dash
    .replace(/&#8212;/g, '\u2014') // em dash
    // common leftovers
    .replace(/&nbsp;/g, ' ')
}

/**
 * Normalise un titre: tout en minuscules sauf la premiere lettre.
 * Ex: "L'EFFET MIROIR" → "L'effet miroir"
 */
function normalizeTitle(title) {
  // Editorial choice: keep original casing (it often carries meaning for names),
  // but still decode entities + trim.
  // Only downcase if the title is FULL CAPS (common in some sources).
  const raw = decodeHtmlEntities((title || '').trim())
  if (!raw) return ''

  const hasLetters = /[\p{L}]/u.test(raw)
  const isAllCaps = hasLetters && raw === raw.toLocaleUpperCase('fr-BE')
  if (!isAllCaps) return raw

  const lower = raw.toLocaleLowerCase('fr-BE')
  const chars = Array.from(lower)
  const idx = chars.findIndex(function (c) { return /[\p{L}\p{N}]/u.test(c) })
  if (idx === -1) return lower
  chars[idx] = chars[idx].toLocaleUpperCase('fr-BE')
  return chars.join('')
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildShowSlug(rep) {
  if (!rep || !rep.id) return ''
  var base = slugify(rep.titre || '') || 'spectacle'
  return base + '--' + rep.id
}

function parseShowIdFromSlug(slug) {
  var s = String(slug || '')
  if (!s) return null
  var parts = s.split('--')
  var tail = parts[parts.length - 1]
  if (!tail) return null
  var id = parseInt(tail, 10)
  return Number.isFinite(id) ? id : null
}

function getPathSegments() {
  try {
    return window.location.pathname.split('/').filter(Boolean)
  } catch (e) {
    return []
  }
}

function getDateFromPath() {
  var segs = getPathSegments()
  if (segs[0] !== 'agenda' || !segs[1]) return null
  var d = segs[1]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  return d
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
