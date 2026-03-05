import fs from 'fs/promises'
import path from 'path'

const ROOT = '/mnt/c/OPENCLAW/workspace/Au-th-atre-bruxelles'
const BASE_URL = 'https://autheatre.brussels'
const SUPABASE_URL = 'https://orcuuknomvpzduiyrfpw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_NkKpX5JgIFFqWk9D3R8VlQ_wgeJ8x_l'

const agendaTemplate = await fs.readFile(path.join(ROOT, 'agenda/index.html'), 'utf8')
const lieuTemplate = await fs.readFile(path.join(ROOT, 'lieu/index.html'), 'utf8')
const spectacleTemplate = await fs.readFile(path.join(ROOT, 'spectacle/index.html'), 'utf8')

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildShowSlug(rep) {
  if (!rep || !rep.id) return ''
  const base = slugify(rep.titre || '') || 'spectacle'
  return `${base}--${rep.id}`
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function writePage(dir, html) {
  await ensureDir(dir)
  await fs.writeFile(path.join(dir, 'index.html'), html)
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function parseTheatresInfoEntries(content) {
  const entries = []
  const re = /theatre_nom:\s*'([^']+)'[\s\S]*?slug:\s*'([^']+)'/g
  let match
  while ((match = re.exec(content))) {
    entries.push({ theatre_nom: match[1], slug: match[2] })
  }
  return entries
}

async function fetchRepresentationsForDate(dateStr, limit = 2000) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/representations`)
  url.searchParams.set('select', 'id,titre,date,heure,theatre_nom,url,description,image_url,theatre_adresse,is_theatre,hidden_at')
  url.searchParams.set('is_theatre', 'eq.true')
  url.searchParams.set('hidden_at', 'is.null')
  url.searchParams.set('date', `eq.${dateStr}`)
  url.searchParams.set('order', 'heure.asc')
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Supabase fetch failed for ${dateStr}: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dt)
}

function replaceOrInsertMeta(html, { name, property, content }) {
  if (!content) return html
  if (name) {
    const re = new RegExp(`<meta[^>]*name=\"${name}\"[^>]*>`, 'i')
    if (re.test(html)) {
      return html.replace(re, `<meta name=\"${name}\" content=\"${content}\">`)
    }
    return html.replace('</head>', `<meta name=\"${name}\" content=\"${content}\">\n</head>`)
  }
  if (property) {
    const re = new RegExp(`<meta[^>]*property=\"${property}\"[^>]*>`, 'i')
    if (re.test(html)) {
      return html.replace(re, `<meta property=\"${property}\" content=\"${content}\">`)
    }
    return html.replace('</head>', `<meta property=\"${property}\" content=\"${content}\">\n</head>`)
  }
  return html
}

function replaceTitle(html, title) {
  if (!title) return html
  if (/<title>[^<]*<\/title>/i.test(html)) {
    return html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
  }
  return html.replace('</head>', `<title>${title}</title>\n</head>`)
}

function ensureCanonical(html, url) {
  if (!url) return html
  if (/rel=\"canonical\"/i.test(html)) {
    return html.replace(/<link[^>]*rel=\"canonical\"[^>]*>/i, `<link rel=\"canonical\" href=\"${url}\">`)
  }
  return html.replace('</head>', `<link rel=\"canonical\" href=\"${url}\">\n</head>`)
}

function buildAgendaJsonLd(reps) {
  const events = []
  const seen = new Set()

  for (const rep of reps || []) {
    if (!rep) continue
    const key = [rep.titre, rep.date, rep.heure, rep.theatre_nom].join('|')
    if (seen.has(key)) continue
    seen.add(key)

    const startDate = rep.date && rep.heure ? `${rep.date}T${rep.heure}` : (rep.date || undefined)
    const slug = buildShowSlug(rep)
    const internalUrl = slug ? `${BASE_URL}/spectacle/${slug}/` : undefined

    events.push({
      '@type': 'Event',
      name: rep.titre || undefined,
      startDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: rep.theatre_nom || undefined,
        address: rep.theatre_adresse || undefined,
      },
      url: rep.url || internalUrl,
      image: rep.image_url || undefined,
    })
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': events,
  }

  return JSON.stringify(payload)
}

function injectJsonLd(html, jsonLd) {
  const script = `<script type="application/ld+json">${jsonLd}</script>`
  return html.replace('</head>', `${script}\n</head>`)
}

function injectAgendaMeta(html, dateStr) {
  const label = formatDateLabel(dateStr)
  const title = `Agenda théâtre du ${label} — Au théâtre ce soir`
  const desc = `Les spectacles de théâtre à Bruxelles pour le ${label}. Agenda mis à jour quotidiennement.`
  const url = `${BASE_URL}/agenda/${dateStr}/`

  let out = html
  out = replaceTitle(out, title)
  out = replaceOrInsertMeta(out, { name: 'description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:title', content: title })
  out = replaceOrInsertMeta(out, { property: 'og:description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:url', content: url })
  out = ensureCanonical(out, url)
  return out
}

async function generateAgendaPages(days = 60) {
  const today = new Date()
  const urls = []
  for (let i = 0; i <= days; i++) {
    const dateStr = toDateString(addDays(today, i))
    const dir = path.join(ROOT, 'agenda', dateStr)
    const reps = await fetchRepresentationsForDate(dateStr, 2000)
    const jsonLd = buildAgendaJsonLd(reps)
    const html = injectAgendaMeta(injectJsonLd(agendaTemplate, jsonLd), dateStr)
    await writePage(dir, html)
    urls.push(`${BASE_URL}/agenda/${dateStr}/`)
  }
  return urls
}

async function fetchLatestAddress(theatreNom, fallbackAddress) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/representations`)
  url.searchParams.set('select', 'theatre_adresse,date')
  url.searchParams.set('theatre_nom', `eq.${theatreNom}`)
  url.searchParams.set('not.theatre_adresse', 'is.null')
  url.searchParams.set('order', 'date.desc')
  url.searchParams.set('limit', '1')

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
  if (!res.ok) return fallbackAddress || null
  const rows = await res.json()
  return rows && rows[0] && rows[0].theatre_adresse ? rows[0].theatre_adresse : (fallbackAddress || null)
}

function buildLieuJsonLd(name, address, url) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: name || undefined,
    address: address || undefined,
    url: url || undefined,
  }
  return JSON.stringify(payload)
}

function injectLieuMeta(html, name, url) {
  if (!name) return html
  const title = `${name} — Lieu — Au théâtre ce soir`
  const desc = `Prochains spectacles et informations pratiques pour ${name} à Bruxelles.`
  let out = html
  out = replaceTitle(out, title)
  out = replaceOrInsertMeta(out, { name: 'description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:title', content: title })
  out = replaceOrInsertMeta(out, { property: 'og:description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:url', content: url })
  out = ensureCanonical(out, url)
  return out
}

async function generateLieuPages() {
  const theatresInfo = await fs.readFile(path.join(ROOT, 'js/theatres-info.js'), 'utf8')
  const entries = parseTheatresInfoEntries(theatresInfo)
  const urls = []
  for (const entry of entries) {
    const slug = entry.slug
    const name = entry.theatre_nom
    const url = `${BASE_URL}/lieu/${slug}/`
    const address = await fetchLatestAddress(name, entry.address)
    const jsonLd = buildLieuJsonLd(name, address, url)
    const html = injectJsonLd(injectLieuMeta(lieuTemplate, name, url), jsonLd)
    const dir = path.join(ROOT, 'lieu', slug)
    await writePage(dir, html)
    urls.push(url)
  }
  return urls
}

async function fetchUpcomingRepresentations(days = 90, limit = 2000) {
  const today = new Date()
  const start = toDateString(today)
  const end = toDateString(addDays(today, days))

  const url = new URL(`${SUPABASE_URL}/rest/v1/representations`)
  url.searchParams.set('select', 'id,titre,date,heure,theatre_nom,url,description,image_url,theatre_adresse,is_theatre,hidden_at')
  url.searchParams.set('is_theatre', 'eq.true')
  url.searchParams.set('hidden_at', 'is.null')
  url.searchParams.set('date', `gte.${start}`)
  url.searchParams.append('date', `lte.${end}`)
  url.searchParams.set('order', 'date.asc')
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function buildSpectacleJsonLd(rep, url) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: rep.titre || undefined,
    startDate: rep.date && rep.heure ? `${rep.date}T${rep.heure}` : rep.date || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: rep.theatre_nom || undefined,
      address: rep.theatre_adresse || undefined,
    },
    url: rep.url || url,
    image: rep.image_url || undefined,
  }
  return JSON.stringify(payload)
}

function injectSpectacleMeta(html, rep, url) {
  const title = rep.titre ? `${rep.titre} — Spectacle — Au théâtre ce soir` : 'Spectacle — Au théâtre ce soir'
  const desc = rep.titre
    ? `Infos, dates et billetterie pour « ${rep.titre} » à Bruxelles.`
    : 'Fiche spectacle : dates, lieu et billetterie.'

  let out = html
  out = replaceTitle(out, title)
  out = replaceOrInsertMeta(out, { name: 'description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:title', content: title })
  out = replaceOrInsertMeta(out, { property: 'og:description', content: desc })
  out = replaceOrInsertMeta(out, { property: 'og:url', content: url })
  out = ensureCanonical(out, url)
  return out
}

async function generateSpectaclePages() {
  const reps = await fetchUpcomingRepresentations(90, 2000)
  const urls = []
  for (const rep of reps) {
    const slug = buildShowSlug(rep)
    if (!slug) continue
    const url = `${BASE_URL}/spectacle/${slug}/`
    const jsonLd = buildSpectacleJsonLd(rep, url)
    const html = injectJsonLd(injectSpectacleMeta(spectacleTemplate, rep, url), jsonLd)
    const dir = path.join(ROOT, 'spectacle', slug)
    await writePage(dir, html)
    urls.push(url)
  }
  return urls
}

function buildSitemap(urls) {
  const unique = Array.from(new Set(urls))
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  for (const loc of unique) {
    lines.push('  <url>')
    lines.push(`    <loc>${loc}</loc>`)
    lines.push('    <changefreq>daily</changefreq>')
    lines.push('    <priority>0.6</priority>')
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return lines.join('\n') + '\n'
}

async function main() {
  const urls = []
  urls.push(`${BASE_URL}/`)
  urls.push(`${BASE_URL}/lieux.html`)
  urls.push(`${BASE_URL}/cette-semaine.html`)
  urls.push(`${BASE_URL}/a-propos.html`)

  const agendaUrls = await generateAgendaPages(60)
  const lieuUrls = await generateLieuPages()
  const spectacleUrls = await generateSpectaclePages()

  const sitemap = buildSitemap([...urls, ...agendaUrls, ...lieuUrls, ...spectacleUrls])
  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), sitemap)

  console.log(`Generated ${agendaUrls.length} agenda pages, ${lieuUrls.length} lieu pages, ${spectacleUrls.length} spectacle pages.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
