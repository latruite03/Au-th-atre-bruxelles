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

function parseSlugsFromTheatresInfo(content) {
  const slugs = []
  const re = /slug:\s*'([^']+)'/g
  let match
  while ((match = re.exec(content))) {
    slugs.push(match[1])
  }
  return Array.from(new Set(slugs))
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

async function generateAgendaPages(days = 60) {
  const today = new Date()
  const urls = []
  for (let i = 0; i <= days; i++) {
    const dateStr = toDateString(addDays(today, i))
    const dir = path.join(ROOT, 'agenda', dateStr)
    const reps = await fetchRepresentationsForDate(dateStr, 2000)
    const jsonLd = buildAgendaJsonLd(reps)
    const html = injectJsonLd(agendaTemplate, jsonLd)
    await writePage(dir, html)
    urls.push(`${BASE_URL}/agenda/${dateStr}/`)
  }
  return urls
}

async function generateLieuPages() {
  const theatresInfo = await fs.readFile(path.join(ROOT, 'js/theatres-info.js'), 'utf8')
  const slugs = parseSlugsFromTheatresInfo(theatresInfo)
  const urls = []
  for (const slug of slugs) {
    const dir = path.join(ROOT, 'lieu', slug)
    await writePage(dir, lieuTemplate)
    urls.push(`${BASE_URL}/lieu/${slug}/`)
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

async function generateSpectaclePages() {
  const reps = await fetchUpcomingRepresentations(90, 2000)
  const urls = []
  for (const rep of reps) {
    const slug = buildShowSlug(rep)
    if (!slug) continue
    const dir = path.join(ROOT, 'spectacle', slug)
    await writePage(dir, spectacleTemplate)
    urls.push(`${BASE_URL}/spectacle/${slug}/`)
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
