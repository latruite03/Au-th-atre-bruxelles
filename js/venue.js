/* ============================================================
   Page lieu — détails + prochaines représentations
   ============================================================ */

;(function () {
  'use strict'

  function getInfo() {
    if (!window.VENUE_SLUG || !window.THEATRES_INFO) return null
    for (var i = 0; i < window.THEATRES_INFO.length; i++) {
      if (window.THEATRES_INFO[i].slug === window.VENUE_SLUG) return window.THEATRES_INFO[i]
    }
    return null
  }

  var info = getInfo()
  var titleEl = document.getElementById('venue-title')
  var addressEl = document.getElementById('venue-address')
  var officialEl = document.getElementById('venue-official')
  var listEl = document.getElementById('venue-list')
  var agendaLinkEl = document.getElementById('venue-agenda-link')
  var kickerEl = document.getElementById('venue-kicker')
  var summaryEl = document.getElementById('venue-summary')
  var sideCopyEl = document.getElementById('venue-sidecopy')
  var editorialCopyEl = document.getElementById('venue-editorial-copy')
  var statShowsEl = document.getElementById('venue-stat-shows')
  var statDatesEl = document.getElementById('venue-stat-dates')
  var statAreaEl = document.getElementById('venue-stat-area')

  function setMetaTag(name, content) {
    if (!content) return
    var tag = document.querySelector('meta[name="' + name + '"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', name)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  function setMetaProperty(property, content) {
    if (!content) return
    var tag = document.querySelector('meta[property="' + property + '"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('property', property)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  function setCanonical(url) {
    if (!url) return
    var link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url)
  }

  if (!info) {
    titleEl.textContent = 'Lieu introuvable'
    listEl.innerHTML = '<div class="error-box">Slug inconnu.</div>'
    return
  }

  titleEl.textContent = info.theatre_nom
  if (info.address && addressEl) {
    addressEl.textContent = info.address
  }
  if (agendaLinkEl) {
    var today = toDateString(new Date())
    agendaLinkEl.href = '/agenda/' + today + '/'
  }

  var pageCopy = window.VENUE_PAGE_COPY || {}
  var initialArea = pageCopy.area || detectArea(info.address || '') || 'Bruxelles'
  if (kickerEl) kickerEl.textContent = pageCopy.kicker || (initialArea + ' — fiche lieu')
  if (summaryEl) summaryEl.textContent = pageCopy.summary || buildVenueSummary(info.theatre_nom, initialArea)
  if (sideCopyEl) sideCopyEl.textContent = pageCopy.sideCopy || buildSideCopy(info.theatre_nom, initialArea)
  if (editorialCopyEl) editorialCopyEl.textContent = pageCopy.editorialCopy || buildEditorialCopy(info.theatre_nom, initialArea)
  if (statAreaEl) statAreaEl.textContent = initialArea

  // SEO meta
  setMetaTag('description', 'Prochains spectacles et informations pratiques pour ' + info.theatre_nom + ' 0 Bruxelles.')
  setMetaProperty('og:title', info.theatre_nom + ' — Lieu — Au théâtre ce soir')
  setMetaProperty('og:description', 'Prochains spectacles et informations pratiques pour ' + info.theatre_nom + ' 0 Bruxelles.')
  setMetaProperty('og:type', 'website')
  setMetaProperty('og:locale', 'fr_BE')
  setMetaProperty('og:site_name', 'Au théâtre ce soir')
  setMetaProperty('og:url', 'https://autheatre.brussels/lieu/' + info.slug + '/')
  document.title = info.theatre_nom + ' — Lieu — Au théâtre ce soir'
  setCanonical('https://autheatre.brussels/lieu/' + info.slug + '/')

  if (info.official_url) {
    officialEl.innerHTML = '<a href="' + escapeHtml(info.official_url) + '" target="_blank" rel="noopener noreferrer">Site officiel</a>'
  }

  // Adresse: on essaie de la retrouver dans la DB via une représentation récente
  loadAddressAndUpcoming(info.theatre_nom, info.aliases || [])

  async function loadAddressAndUpcoming(theatreNom, aliases) {
    listEl.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    var names = [theatreNom].concat(aliases || [])

    try {
      // 1) Adresse (best-effort)
      var addressResult = await supabaseClient
        .from('representations')
        .select('theatre_adresse')
        .in('theatre_nom', names)
        .not('theatre_adresse', 'is', null)
        .order('date', { ascending: false })
        .limit(1)

      if (!addressResult.error && addressResult.data && addressResult.data[0] && addressResult.data[0].theatre_adresse) {
        addressEl.textContent = addressResult.data[0].theatre_adresse
        var liveArea = detectArea(addressResult.data[0].theatre_adresse)
        if (liveArea) {
          var resolvedArea = pageCopy.area || liveArea
          if (kickerEl) kickerEl.textContent = pageCopy.kicker || (resolvedArea + ' — fiche lieu')
          if (summaryEl) summaryEl.textContent = pageCopy.summary || buildVenueSummary(info.theatre_nom, resolvedArea)
          if (sideCopyEl) sideCopyEl.textContent = pageCopy.sideCopy || buildSideCopy(info.theatre_nom, resolvedArea)
          if (editorialCopyEl) editorialCopyEl.textContent = pageCopy.editorialCopy || buildEditorialCopy(info.theatre_nom, resolvedArea)
          if (statAreaEl) statAreaEl.textContent = resolvedArea
        }
      }

      // 2) Upcoming
      var todayStr = toDateString(new Date())
      var result = await supabaseClient
        .from('representations')
        .select('*')
        .in('theatre_nom', names)
        .eq('is_theatre', true)
        .gte('date', todayStr)
        .order('date', { ascending: true })
        .order('heure', { ascending: true, nullsFirst: false })
        .limit(300)

      if (result.error) throw new Error(result.error.message)

      var reps = (result.data || []).filter(function (r) { return !isLikelyNonTheatre(r) })
      if (statShowsEl && pageCopy.statShowsLabel) statShowsEl.nextElementSibling.textContent = pageCopy.statShowsLabel
      if (statDatesEl && pageCopy.statDatesLabel) statDatesEl.nextElementSibling.textContent = pageCopy.statDatesLabel
      if (statAreaEl && pageCopy.statAreaLabel) statAreaEl.nextElementSibling.textContent = pageCopy.statAreaLabel
      updateStats(reps)
      if (reps.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p class="empty-state-title">Aucune date à venir</p></div>'
        return
      }

      var grouped = groupByShow(reps)
      var html = ''
      for (var i = 0; i < grouped.length; i++) {
        html += renderShowGroup(grouped[i])
      }
      listEl.innerHTML = html

      // Image fallback + watchdog (avoid blank boxes on some mobile browsers)
      var imgs = listEl.querySelectorAll('.show-image')
      imgs.forEach(function (img) {
        function replace() {
          var wrap = img.parentElement
          if (!wrap) return
          wrap.innerHTML = '<div class="show-image-placeholder" style="width:100%;height:100%">Image indisponible</div>'
        }

        img.addEventListener('error', replace)

        setTimeout(function () {
          try {
            if (!img.complete || (img.naturalWidth || 0) === 0) replace()
          } catch {
            replace()
          }
        }, 6000)
      })
    } catch (err) {
      listEl.innerHTML = '<div class="error-box">' + escapeHtml(err.message) + '</div>'
    }
  }

  function detectArea(address) {
    var text = String(address || '')
    if (!text) return ''
    var patterns = [
      ['Ixelles', /(ixelles|1050)/i],
      ['Bruxelles centre', /(1000 bruxelles|centre de bruxelles|bruxelles-centre)/i],
      ['Schaerbeek', /(schaerbeek|1030)/i],
      ['Etterbeek', /(etterbeek|1040)/i],
      ['Saint-Gilles', /(saint-gilles|1060)/i],
      ['Forest', /(forest|1190)/i],
      ['Molenbeek', /(molenbeek|1080)/i],
      ['Saint-Josse', /(saint-josse|1210)/i],
      ['Watermael-Boitsfort', /(watermael|boitsfort|1170)/i],
      ['Laeken', /(laeken|1020)/i],
      ['Uccle', /(uccle|1180)/i],
    ]
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i][1].test(text)) return patterns[i][0]
    }
    return 'Bruxelles'
  }

  function buildVenueSummary(name, area) {
    return name + ' fait partie des lieux à garder en tête quand on cherche du théâtre à ' + area + ', avec un accès rapide aux prochaines dates et aux infos utiles.'
  }

  function buildSideCopy(name, area) {
    return 'On a réuni ici l’essentiel pour ' + name + ' : adresse, accès utiles et prochaines représentations, afin de voir rapidement si ce lieu mérite un détour dans ' + area + '.'
  }

  function buildEditorialCopy(name, area) {
    return 'Une bonne fiche lieu doit donner envie sans en faire trop : situer ' + name + ' dans Bruxelles, rendre ses prochaines dates lisibles et permettre de repartir facilement vers l’agenda complet.'
  }

  function updateStats(reps) {
    if (statShowsEl) statShowsEl.textContent = String(groupByShow(reps).length || 0)
    if (statDatesEl) statDatesEl.textContent = String(reps.length || 0)
  }

  function isLikelyNonTheatre(rep) {
    var text = (rep.titre || '') + ' ' + (rep.description || '')
    text = text.toLowerCase()

    var theatreSignals = ['théâtre', 'theatre', 'pièce', 'spectacle', 'mise en scène', 'comédie', 'tragédie', 'monologue', 'scène']
    var hasTheatre = theatreSignals.some(function (k) { return text.indexOf(k) !== -1 })

    var nonTheatre = [
      'atelier', 'workshop', 'stage', 'cours', 'conférence', 'conference', 'rencontre', 'débat', 'debat',
      'projection', 'cinéma', 'cinema', 'expo', 'exposition', 'vernissage', 'concert', 'dj', 'bal',
      'jeu', 'jeux', 'podcast', 'visite', 'repair café'
    ]
    var hasNonTheatre = nonTheatre.some(function (k) { return text.indexOf(k) !== -1 })

    return hasNonTheatre && !hasTheatre
  }

  function groupByShow(reps) {
    var map = new Map()
    reps.forEach(function (rep) {
      var key = normalizeTitle(rep.titre || '').toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          titre: rep.titre,
          url: rep.url,
          image_url: rep.image_url,
          is_complet: rep.is_complet,
          reps: [],
        })
      }
      map.get(key).reps.push(rep)
    })

    return Array.from(map.values()).sort(function (a, b) {
      var da = (a.reps[0] && a.reps[0].date) || ''
      var db = (b.reps[0] && b.reps[0].date) || ''
      return da.localeCompare(db)
    })
  }

  function summarizeDates(reps) {
    var seen = {}
    var dates = reps.map(function (r) { return r.date }).filter(Boolean).filter(function (d) {
      if (seen[d]) return false
      seen[d] = true
      return true
    }).sort()
    if (!dates.length) return ''
    var first = dates[0]
    var last = dates[dates.length - 1]
    if (first === last) return 'Le ' + formatDate(first)

    if (dates.length <= 4) {
      var parts = dates.map(function (d) { return formatDate(d) })
      return 'Dates : ' + parts.join(', ')
    }
    return 'Du ' + formatDate(first) + ' au ' + formatDate(last)
  }

  function renderShowGroup(group) {
    var title = normalizeTitle(group.titre)
    var showSlug = buildShowSlug(group.reps[0])
    var titleHtml = showSlug
      ? '<a href="/spectacle/' + escapeHtml(showSlug) + '/">' + escapeHtml(title) + '</a>'
      : escapeHtml(title)

    var dateSummary = summarizeDates(group.reps)
    var dateHtml = dateSummary ? '<p class="show-time">' + escapeHtml(dateSummary) + '</p>' : ''

    var imageHtml = group.image_url
      ? '<div class="show-image-wrap">' +
          '<img class="show-image" src="' + escapeHtml(group.image_url) + '" ' +
            'alt="' + escapeHtml(title) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
        '</div>'
      : '<div class="show-image-placeholder">Image indisponible</div>'

    var btnHtml = ''
    if (group.url) {
      var isComplet = group.is_complet
      btnHtml =
        '<a href="' + escapeHtml(group.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'class="show-btn' + (isComplet ? ' show-btn--complet' : '') + '">' +
          (isComplet ? 'Complet' : 'Réserver') +
        '</a>'
    }

    return (
      '<div class="show-item">' +
        '<div class="show-item-inner">' +
          '<div class="show-item-content">' +
            imageHtml +
            '<div class="show-info">' +
              '<h4 class="show-title">' + titleHtml + '</h4>' +
              dateHtml +
            '</div>' +
          '</div>' +
          btnHtml +
        '</div>' +
      '</div>'
    )
  }
})()
