;(function () {
  'use strict'

  var wrap = document.getElementById('tonight-grid')
  var subtitle = document.getElementById('tonight-subtitle')
  var statReps = document.getElementById('tonight-stat-reps')
  var statVenues = document.getElementById('tonight-stat-venues')
  var statDate = document.getElementById('tonight-stat-date')
  var agendaLink = document.getElementById('tonight-agenda-link')
  var ctaAgendaLink = document.getElementById('tonight-cta-agenda')
  if (!wrap || !subtitle || !statReps || !statVenues || !statDate) return

  var VENUE_PRIORITY = [
    'Théâtre Les Tanneurs',
    'Théâtre de Poche',
    'Théâtre de la Vie',
    'Le Rideau',
    'Studio Varia',
    'Théâtre National Wallonie-Bruxelles',
    'Atelier 210',
    'Théâtre Océan Nord'
  ]

  function normalizeKey(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’‘`´]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  function venueScore(theatreNom) {
    var key = normalizeKey(theatreNom)
    for (var i = 0; i < VENUE_PRIORITY.length; i++) {
      if (normalizeKey(VENUE_PRIORITY[i]) === key) return i
    }
    return 999
  }

  function truncateText(text, max) {
    var cleaned = decodeHtmlEntities(String(text || '')).replace(/\s+/g, ' ').trim()
    if (!cleaned) return ''
    if (cleaned.length <= max) return cleaned
    return cleaned.slice(0, max).trim() + '…'
  }

  function buildAgendaUrl(dateStr) {
    return dateStr ? '/agenda/' + dateStr + '/' : '/'
  }

  function buildCard(rep, dateLabel) {
    var heure = rep.heure ? formatHeure(rep.heure) : 'Heure à confirmer'
    var desc = truncateText(rep.description, 190)
    var showUrl = '/spectacle/' + buildShowSlug(rep) + '/'
    var cover = rep.image_url
      ? '<div class="weekly-card-media">' +
          '<img src="' + escapeHtml(rep.image_url) + '" alt="" loading="lazy" class="weekly-card-image" onerror="this.parentNode.classList.add(\'weekly-card-media-empty\'); this.remove()" />' +
        '</div>'
      : '<div class="weekly-card-media weekly-card-media-empty"><span class="weekly-card-media-label">Au théâtre ce soir</span></div>'

    var cardDate = new Date(rep.date + 'T00:00:00')
    var dayName = cardDate.toLocaleDateString('fr-BE', { weekday: 'long' })
    var dayNumber = cardDate.toLocaleDateString('fr-BE', { day: 'numeric' })
    var monthName = cardDate.toLocaleDateString('fr-BE', { month: 'short' })

    return (
      '<article class="weekly-card">' +
        '<div class="weekly-card-date">' +
          '<span class="weekly-card-day">' + escapeHtml(dayName) + '</span>' +
          '<strong class="weekly-card-number">' + escapeHtml(dayNumber) + '</strong>' +
          '<span class="weekly-card-month">' + escapeHtml(monthName) + '</span>' +
        '</div>' +
        '<div class="weekly-card-main">' +
          cover +
          '<div class="weekly-card-body">' +
            '<div class="weekly-card-meta">' +
              '<span class="weekly-card-time">' + escapeHtml(heure) + '</span>' +
              '<span class="weekly-card-venue">' + escapeHtml(rep.theatre_nom || '') + '</span>' +
            '</div>' +
            '<h3 class="weekly-card-title">' + escapeHtml(normalizeTitle(rep.titre)) + '</h3>' +
            (desc ? '<p class="weekly-card-description">' + escapeHtml(desc) + '</p>' : '') +
            '<div class="weekly-card-footer">' +
              '<p class="weekly-card-date-label">' + escapeHtml(dateLabel) + '</p>' +
              '<a href="' + escapeHtml(showUrl) + '" class="weekly-card-link">Voir la fiche</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    )
  }

  function dedupeRows(rows) {
    var seen = new Set()
    var out = []
    for (var i = 0; i < rows.length; i++) {
      var rep = rows[i]
      var heureKey = String(rep.heure || '').trim()
      if (/^\d\d:\d\d/.test(heureKey)) heureKey = heureKey.slice(0, 5)
      var key = [
        rep.date,
        heureKey,
        normalizeKey(rep.theatre_nom),
        normalizeKey(decodeHtmlEntities(rep.titre || ''))
      ].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      out.push(rep)
    }
    return out
  }

  function isTooEarlyTime(heure) {
    if (!heure) return false
    return String(heure) < '13:00:00'
  }

  function scoreRow(rep) {
    var score = 0
    if (rep.image_url) score += 10
    if (rep.description && String(rep.description).trim().length >= 90) score += 6
    if (rep.heure) score += 2
    score -= venueScore(rep.theatre_nom) / 100
    return -score
  }

  function renderEmpty(dateStr, dateLabel) {
    var agendaUrl = buildAgendaUrl(dateStr)
    wrap.innerHTML = '<div class="tonight-card-empty">' +
      'Aucune représentation visible pour <strong style="color: var(--text);">' + escapeHtml(dateLabel) + '</strong> dans la sélection du moment. ' +
      'Tu peux quand même revenir à l’<a href="' + escapeHtml(agendaUrl) + '">agenda complet du jour</a> ou élargir à <a href="cette-semaine.html">la semaine</a>.' +
      '</div>'
  }

  async function load() {
    wrap.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    var now = new Date()
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    var dateStr = toDateString(today)
    var dateLabel = formatDate(dateStr)
    var agendaUrl = buildAgendaUrl(dateStr)

    statDate.textContent = today.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })
    subtitle.textContent = 'Sélection en direct pour ' + dateLabel + ', avec accès rapide aux spectacles, aux lieux et à l’agenda du jour.'
    if (agendaLink) agendaLink.href = agendaUrl
    if (ctaAgendaLink) ctaAgendaLink.href = agendaUrl

    try {
      var res = await supabaseClient
        .from('representations')
        .select('id,date,heure,titre,theatre_nom,theatre_adresse,description,image_url')
        .eq('date', dateStr)
        .eq('is_theatre', true)
        .is('hidden_at', null)
        .or('heure.is.null,heure.gte.13:00:00')
        .order('heure', { ascending: true, nullsFirst: false })
        .limit(200)

      if (res.error) throw new Error(res.error.message)
      var rows = dedupeRows(res.data || []).filter(function (rep) {
        return !isTooEarlyTime(rep.heure)
      })

      var venueSet = new Set()
      rows.forEach(function (rep) { venueSet.add(rep.theatre_nom || '') })
      statReps.textContent = String(rows.length)
      statVenues.textContent = String(venueSet.size)

      if (!rows.length) {
        renderEmpty(dateStr, dateLabel)
        return
      }

      rows.sort(function (a, b) {
        var sa = scoreRow(a)
        var sb = scoreRow(b)
        if (sa !== sb) return sa - sb
        var ha = String(a.heure || '99:99:99')
        var hb = String(b.heure || '99:99:99')
        if (ha !== hb) return ha.localeCompare(hb)
        return normalizeKey(a.titre).localeCompare(normalizeKey(b.titre))
      })

      var picked = rows.slice(0, 8)
      wrap.innerHTML = picked.map(function (rep) { return buildCard(rep, dateLabel) }).join('')
    } catch (err) {
      wrap.innerHTML = '<div class="error-box">' + escapeHtml(err.message) + '</div>'
    }
  }

  load()
})()
