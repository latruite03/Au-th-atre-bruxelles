/* ============================================================
   Cette semaine — sélection (7 spectacles) sur la semaine à venir
   - 100% DB (Supabase)
   - Filtre: is_theatre=true + hidden_at IS NULL
   - Dédoublonne par (theatre_nom + titre)
   - Priorise petites salles (liste)
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

  function esc(s) {
    return escapeHtml(String(s || ''))
  }

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

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function addDays(d, n) {
    var x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
  }

  function mondayOfCurrentWeek(d) {
    // JS: 0=Sun..6=Sat, Monday-based week
    var day = d.getDay()
    var delta = (day + 6) % 7 // Mon=0, Tue=1, ..., Sun=6
    return startOfDay(addDays(d, -delta))
  }

  function shouldSwitchToNextWeek(now) {
    // Rule: switch to next week on Saturday at 23:00 (Europe/Brussels local browser time)
    var day = now.getDay() // 6 = Saturday, 0 = Sunday
    if (day === 6) return now.getHours() >= 23
    if (day === 0) return true
    return false
  }

  function formatRange(start, end) {
    // ex: "Semaine du 2 au 8 mars 2026"
    var optsDayMonth = { day: 'numeric', month: 'long' }
    var optsDayMonthYear = { day: 'numeric', month: 'long', year: 'numeric' }

    var s = start.toLocaleDateString('fr-BE', optsDayMonth)
    var e = end.toLocaleDateString('fr-BE', optsDayMonthYear)

    return 'Semaine du ' + s + ' au ' + e
  }

  function repKey(r) {
    return normalizeKey(r.theatre_nom) + '|' + normalizeKey(r.titre)
  }

  function showKey(r) {
    return normalizeKey(r.theatre_nom) + '|' + normalizeKey(r.titre)
  }

  function renderCard(item) {
    var dateLabel = ''
    try {
      var d = new Date(item.date + 'T00:00:00')
      dateLabel = d.toLocaleDateString('fr-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    } catch {
      dateLabel = item.date
    }

    var heure = item.heure ? formatHeure(item.heure) : 'Heure à confirmer'

    var btn = ''
    if (item.url) {
      btn =
        '<a href="' +
        esc(item.url) +
        '" target="_blank" rel="noopener noreferrer" ' +
        'style="background: var(--accent); color: #FFFBF5; padding: 0.5rem 1.25rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; text-decoration:none;">Infos</a>'
    }

    // Some sources store HTML entities in DB (e.g., &egrave;). Decode before truncating.
    var desc = decodeHtmlEntities((item.description || '')).trim()
    if (desc.length > 260) desc = desc.slice(0, 260).trim() + '…'

    var cover = ''
    if (item.image_url) {
      // Avoid weird crops: show the full poster/visual.
      cover =
        '<div style="height: 220px; background: #0f172a; display:flex; align-items:center; justify-content:center;">' +
        '<img src="' +
        esc(item.image_url) +
        '" alt="" loading="lazy" style="width:100%; height:220px; object-fit:contain; display:block;" onerror="this.style.display=\'none\'" />' +
        '</div>'
    }

    var descHtml = ''
    if (desc) {
      descHtml =
        '<p style="margin:0.55rem 0 0 0; color: var(--text-2); line-height:1.55; font-size:0.9rem;">' +
        esc(desc) +
        '</p>'
    }

    return (
      '<div style="background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 1rem;">' +
      cover +
      '<div style="padding: 1rem 1.25rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">' +
      '<div style="min-width: 0; flex: 1 1 18rem;">' +
      '<p style="font-weight: 700; color: var(--text); font-size: 0.9rem; margin:0 0 0.15rem 0;">' +
      esc(dateLabel) +
      '</p>' +
      '<p style="font-weight: 600; color: var(--accent); font-size: 0.875rem; margin:0 0 0.35rem 0;">' +
      esc(heure) +
      '</p>' +
      '<h4 style="font-size: 1.05rem; margin:0 0 0.25rem 0;">' +
      esc(normalizeTitle(item.titre)) +
      '</h4>' +
      '<p style="font-size: 0.8125rem; color: var(--text-3); margin:0;">' +
      esc(item.theatre_nom) +
      '</p>' +
      descHtml +
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

    var clean = []
    var seen = new Set()
    for (var i = 0; i < s.items.length; i++) {
      var it = s.items[i]
      if (!it || !it.date || !it.titre || !it.theatre_nom) continue
      var k = showKey(it) + '|' + (it.date || '')
      if (seen.has(k)) continue
      seen.add(k)
      clean.push(it)
    }

    return clean.length ? clean : null
  }

  async function load() {
    wrap.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    var now = new Date()
    var today = startOfDay(now)
    var start = mondayOfCurrentWeek(today)
    if (shouldSwitchToNextWeek(now)) start = addDays(start, 7)
    var end = addDays(start, 6)

    var startStr = toDateString(start)
    var endStr = toDateString(end)

    subtitle.textContent = formatRange(start, end) + ' — sélection (7 spectacles) — mise à jour chaque vendredi soir'

    var editorial = getEditorialSelection(startStr, endStr)
    if (editorial) {
      var htmlManual = ''
      for (var m = 0; m < editorial.length; m++) htmlManual += renderCard(editorial[m])
      htmlManual +=
        '<p style="color: var(--text-3); font-size:0.875rem; margin-top:1.5rem;">' +
        'Sélection éditoriale hebdomadaire. Pour le détail jour par jour et tous les spectacles, utilise l’<a href="/">agenda</a>.' +
        '</p>'
      wrap.innerHTML = htmlManual
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
        wrap.innerHTML =
          '<p style="color: var(--text-2);">Pas (encore) de représentations à venir pour cette semaine.</p>'
        return
      }

      // Sort: Monday → Sunday (date asc), then time asc, then (optional) small venues priority
      rows.sort(function (a, b) {
        var da = (a.date || '').localeCompare(b.date || '')
        if (da !== 0) return da

        var ha = a.heure || ''
        var hb = b.heure || ''
        var ht = ha.localeCompare(hb)
        if (ht !== 0) return ht

        var sa = venueScore(a.theatre_nom)
        var sb = venueScore(b.theatre_nom)
        if (sa !== sb) return sa - sb

        return normalizeKey(a.titre).localeCompare(normalizeKey(b.titre))
      })

      // Pick exactly 1 show per day (Mon..Sun), all different if possible.
      var picked = []
      var usedShows = new Set()

      function scoreRow(r) {
        var s = 0
        if (r.image_url) s += 10
        if (r.description && String(r.description).trim().length >= 80) s += 6
        if (r.heure) s += 2
        s -= venueScore(r.theatre_nom) / 100 // tiny preference
        return -s // lower is better for Array.sort ascending
      }

      for (var day = 0; day < 7; day++) {
        var d = addDays(start, day)
        var ds = toDateString(d)

        var candidates = []
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].date === ds) candidates.push(rows[i])
        }

        candidates.sort(function (a, b) {
          var sa = scoreRow(a)
          var sb = scoreRow(b)
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
        // If nothing unique is available for that day, we still show something.
        if (!chosen && candidates.length) chosen = candidates[0]

        if (chosen) picked.push(chosen)
      }

      var html = ''
      for (var j = 0; j < picked.length; j++) html += renderCard(picked[j])

      // Note
      html +=
        '<p style="color: var(--text-3); font-size:0.875rem; margin-top:1.5rem;">' +
        'Pour le détail jour par jour et tous les spectacles, utilise l’<a href="/">agenda</a>.' +
        '</p>'

      wrap.innerHTML = html
    } catch (err) {
      wrap.innerHTML = '<div class="error-box">' + esc(err.message) + '</div>'
    }
  }

  load()
})()
