/* ============================================================
   Cette semaine — sélection (7 spectacles)
   - Priorité: sélection éditoriale (weekly-selection.js)
   - Fallback: auto-sélection DB
   - Règle horaire: lun->sam >= 18:55, dimanche libre
   ============================================================ */

;(function () {
  'use strict'

  var wrap = document.getElementById('weekly-container')
  var subtitle = document.getElementById('weekly-subtitle')
  if (!wrap || !subtitle) return

  var SMALL_VENUES_PRIORITY = [
    'Théâtre Mercelis',
    'Le Rideau',
    'Théâtre Les Tanneurs',
    'Théâtre de Poche',
    'Studio Varia',
    'Les Riches-Claires',
    'La Bellone',
    'Atelier 210',
  ]

  function esc(s) { return escapeHtml(String(s || '')) }

  function normalizeKey(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function venueScore(theatreNom) {
    var key = normalizeKey(theatreNom)
    for (var i = 0; i < SMALL_VENUES_PRIORITY.length; i++) {
      if (normalizeKey(SMALL_VENUES_PRIORITY[i]) === key) return i
    }
    return 999
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x }

  function mondayOfCurrentWeek(d) {
    var day = d.getDay() // 0=Sun..6=Sat
    var delta = (day + 6) % 7
    return startOfDay(addDays(d, -delta))
  }

  function shouldSwitchToNextWeek(now) {
    var day = now.getDay()
    if (day === 6) return now.getHours() >= 23 // Saturday 23:00+
    if (day === 0) return true // Sunday
    return false
  }

  function formatRange(start, end) {
    var s = start.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' })
    var e = end.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
    return 'Semaine du ' + s + ' au ' + e
  }

  function showKey(r) { return normalizeKey(r.theatre_nom) + '|' + normalizeKey(r.titre) }

  function timeToMinutes(hhmmss) {
    if (!hhmmss) return null
    var p = String(hhmmss).split(':')
    if (p.length < 2) return null
    var h = Number(p[0]); var m = Number(p[1])
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null
    return h * 60 + m
  }

  function isEveningSlot(item, dayIdx) {
    if (dayIdx === 6) return true // Sunday
    var mins = timeToMinutes(item && item.heure)
    return mins !== null && mins >= (18 * 60 + 55)
  }

  function looksLikeNonTheatreItem(item) {
    var hay = normalizeKey((item && item.titre) || '') + ' ' + normalizeKey((item && item.description) || '')
    return /(atelier|fabrique|workshop|masterclass|initiation|stage|conference|rencontre|projection|exposition|dj set|concert)/.test(hay)
  }

  function renderCard(item) {
    var dateLabel = item.date
    try {
      dateLabel = new Date(item.date + 'T00:00:00').toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })
    } catch (e) {}

    var heure = item.heure ? formatHeure(item.heure) : 'Heure à confirmer'
    var desc = decodeHtmlEntities((item.description || '')).trim()
    if (desc.length > 260) desc = desc.slice(0, 260).trim() + '…'

    var cover = item.image_url
      ? '<div style="height:220px;background:#0f172a;display:flex;align-items:center;justify-content:center;">' +
          '<img src="' + esc(item.image_url) + '" alt="" loading="lazy" style="width:100%;height:220px;object-fit:contain;display:block;" onerror="this.style.display=\'none\'" />' +
        '</div>'
      : ''

    var btn = item.url
      ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer" style="background: var(--accent); color:#FFFBF5; padding:0.5rem 1.25rem; border-radius:9999px; font-size:0.875rem; font-weight:700; text-decoration:none;">Infos</a>'
      : ''

    return (
      '<div style="background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 1rem;">' +
        cover +
        '<div style="padding:1rem 1.25rem; display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap;">' +
          '<div style="min-width:0; flex:1 1 18rem;">' +
            '<p style="font-weight:700; color:var(--text); font-size:0.9rem; margin:0 0 0.15rem 0;">' + esc(dateLabel) + '</p>' +
            '<p style="font-weight:600; color:var(--accent); font-size:0.875rem; margin:0 0 0.35rem 0;">' + esc(heure) + '</p>' +
            '<h4 style="font-size:1.05rem; margin:0 0 0.25rem 0;">' + esc(normalizeTitle(item.titre)) + '</h4>' +
            '<p style="font-size:0.8125rem; color:var(--text-3); margin:0;">' + esc(item.theatre_nom) + '</p>' +
            (desc ? '<p style="margin:0.55rem 0 0 0; color:var(--text-2); line-height:1.55; font-size:0.9rem;">' + esc(desc) + '</p>' : '') +
          '</div>' +
          btn +
        '</div>' +
      '</div>'
    )
  }

  function getEditorialSelection(startStr, endStr) {
    if (!window.WEEKLY_SELECTION || !Array.isArray(window.WEEKLY_SELECTION.items)) return null
    var s = window.WEEKLY_SELECTION
    if (s.weekStart !== startStr || s.weekEnd !== endStr) return null

    var out = []
    var seen = new Set()
    for (var i = 0; i < s.items.length; i++) {
      var it = s.items[i]
      if (!it || !it.date || !it.titre || !it.theatre_nom) continue
      if (!isEveningSlot(it, i)) continue
      if (looksLikeNonTheatreItem(it)) continue
      var k = showKey(it) + '|' + it.date
      if (seen.has(k)) continue
      seen.add(k)
      out.push(it)
    }
    return out.length ? out : null
  }

  async function load() {
    wrap.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    var now = new Date()
    var start = mondayOfCurrentWeek(startOfDay(now))
    if (shouldSwitchToNextWeek(now)) start = addDays(start, 7)
    var end = addDays(start, 6)
    var startStr = toDateString(start)
    var endStr = toDateString(end)

    subtitle.textContent = formatRange(start, end) + ' — sélection (7 spectacles) — mise à jour chaque vendredi soir'

    var editorial = getEditorialSelection(startStr, endStr)
    if (editorial) {
      var htmlE = ''
      for (var e = 0; e < editorial.length; e++) htmlE += renderCard(editorial[e])
      htmlE += '<p style="color: var(--text-3); font-size:0.875rem; margin-top:1.5rem;">Sélection éditoriale hebdomadaire. Pour le détail jour par jour et tous les spectacles, utilise l’<a href="/">agenda</a>.</p>'
      wrap.innerHTML = htmlE
      return
    }

    try {
      var res = await supabaseClient
        .from('representations')
        .select('id,date,heure,titre,theatre_nom,url,description,image_url')
        .is('hidden_at', null)
        .eq('is_theatre', true)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true })
        .order('heure', { ascending: true, nullsFirst: false })
        .limit(600)

      if (res.error) throw new Error(res.error.message)
      var rows = res.data || []
      if (!rows.length) {
        wrap.innerHTML = '<p style="color: var(--text-2);">Pas (encore) de représentations à venir pour cette semaine.</p>'
        return
      }

      rows.sort(function (a, b) {
        var da = (a.date || '').localeCompare(b.date || '')
        if (da !== 0) return da
        var ht = (a.heure || '').localeCompare(b.heure || '')
        if (ht !== 0) return ht
        var sa = venueScore(a.theatre_nom), sb = venueScore(b.theatre_nom)
        if (sa !== sb) return sa - sb
        return normalizeKey(a.titre).localeCompare(normalizeKey(b.titre))
      })

      var picked = []
      var usedShows = new Set()

      function scoreRow(r) {
        var s = 0
        if (r.image_url) s += 10
        if (r.description && String(r.description).trim().length >= 80) s += 6
        if (r.heure) s += 2
        s -= venueScore(r.theatre_nom) / 100
        return -s
      }

      for (var day = 0; day < 7; day++) {
        var ds = toDateString(addDays(start, day))
        var candidates = []
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].date !== ds) continue
          if (!isEveningSlot(rows[i], day)) continue
          if (looksLikeNonTheatreItem(rows[i])) continue
          candidates.push(rows[i])
        }

        candidates.sort(function (a, b) {
          var sa = scoreRow(a), sb = scoreRow(b)
          if (sa !== sb) return sa - sb
          return normalizeKey(a.titre).localeCompare(normalizeKey(b.titre))
        })

        var chosen = null
        for (var c = 0; c < candidates.length; c++) {
          var k = showKey(candidates[c])
          if (usedShows.has(k)) continue
          chosen = candidates[c]
          usedShows.add(k)
          break
        }
        if (!chosen && candidates.length) chosen = candidates[0]
        if (chosen) picked.push(chosen)
      }

      var html = ''
      for (var j = 0; j < picked.length; j++) html += renderCard(picked[j])
      html += '<p style="color: var(--text-3); font-size:0.875rem; margin-top:1.5rem;">Pour le détail jour par jour et tous les spectacles, utilise l’<a href="/">agenda</a>.</p>'
      wrap.innerHTML = html
    } catch (err) {
      wrap.innerHTML = '<div class="error-box">' + esc(err.message) + '</div>'
    }
  }

  load()
})()
