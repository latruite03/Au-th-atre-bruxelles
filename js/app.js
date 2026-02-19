/* ============================================================
   Page publique — Agenda des spectacles
   ============================================================ */

;(function () {
  'use strict'

  // --- State ---
  var selectedDate = new Date()
  var allGroups = []
  var selectedCommune = null
  var theatreRanking = new Map() // theatre_nom -> rang (lower = first)
  var theatreRankingNorm = new Map() // normalized theatre_nom -> rang

  // --- DOM refs ---
  var dateInput = document.getElementById('date-input')
  var theatreSelect = document.getElementById('theatre-select')
  var resultsTitle = document.getElementById('results-title')
  var resultsContainer = document.getElementById('results-container')

  // --- Init ---
  dateInput.value = toDateString(selectedDate)
  dateInput.min = toDateString(new Date())
  dateInput.addEventListener('change', onDateChange)
  theatreSelect.addEventListener('change', onCommuneChange)

  // Load editorial ranking then fetch representations
  loadRanking().then(function () {
    fetchRepresentations(toDateString(selectedDate))
  })

  // --- Event handlers ---

  function onDateChange() {
    var val = dateInput.value
    if (!val) return
    selectedDate = new Date(val + 'T00:00:00')
    selectedCommune = null
    theatreSelect.value = ''
    fetchRepresentations(val)
  }

  function onCommuneChange() {
    selectedCommune = theatreSelect.value || null
    renderResults()
  }

  // --- Load editorial ranking ---

  function normTheatreName(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .trim()
  }

  async function loadRanking() {
    try {
      var res = await supabaseClient
        .from('theatre_rang')
        .select('theatre_nom, rang')
        .order('rang', { ascending: true })
      if (!res.error && res.data) {
        res.data.forEach(function (r) {
          theatreRanking.set(r.theatre_nom, r.rang)
          theatreRankingNorm.set(normTheatreName(r.theatre_nom), r.rang)
        })
      }
    } catch (e) {
      // Silently fall back to alphabetical if ranking unavailable
    }
  }

  // --- Data fetching ---

  async function fetchRepresentations(dateStr) {
    showLoading()
    resultsTitle.textContent = 'Spectacles du ' + formatDate(dateStr)

    try {
      var query = supabaseClient
        .from('representations')
        .select('*')
        .eq('date', dateStr)
        .eq('is_theatre', true)
        // Do not show masked rows (hidden_at set)
        .is('hidden_at', null)
        // Exclude school-time performances at the query level too (defense in depth)
        .or('heure.is.null,heure.gte.13:00:00')
        .order('theatre_nom', { ascending: true })
        .order('heure', { ascending: true, nullsFirst: false })

      var result = await query
      if (result.error) throw new Error(result.error.message)

      allGroups = groupByTheatre(result.data || [])
      populateCommuneFilter(allGroups)
      renderResults()
    } catch (err) {
      resultsContainer.innerHTML =
        '<div class="error-box">' + escapeHtml(err.message) + '</div>'
    }
  }

  // --- Commune parsing (Option A: from theatre_adresse) ---

  function parseCommuneLabel(adresse) {
    var a = String(adresse || '').trim()
    if (!a) return 'Inconnue'

    // Common patterns: ", 1070 Anderlecht" or "1070 Anderlecht" or "1000 Bruxelles"
    var m = a.match(/\b(\d{4})\s+([^,]+)\s*$/)
    if (m) {
      var cp = m[1]
      var commune = (m[2] || '').trim()
      // normalize some common variants
      if (/bruxelles/i.test(commune)) commune = 'Bruxelles'
      if (/ixelles/i.test(commune)) commune = 'Ixelles'
      if (/etterbeek/i.test(commune)) commune = 'Etterbeek'
      if (/schaerbeek/i.test(commune)) commune = 'Schaerbeek'
      if (/saint[-\s]?gilles/i.test(commune)) commune = 'Saint-Gilles'
      if (/molenbeek/i.test(commune)) commune = 'Molenbeek-Saint-Jean'
      if (/anderlecht/i.test(commune)) commune = 'Anderlecht'
      if (/woluwe[-\s]?saint[-\s]?lambert/i.test(commune)) commune = 'Woluwe-Saint-Lambert'
      if (/woluwe[-\s]?saint[-\s]?pierre/i.test(commune)) commune = 'Woluwe-Saint-Pierre'
      if (/watermael/i.test(commune)) commune = 'Watermael-Boitsfort'
      if (/uccle/i.test(commune)) commune = 'Uccle'

      return commune + ' (' + cp + ')'
    }

    // If we can't parse, fallback to last chunk
    var parts = a.split(',').map(function (p) { return p.trim() }).filter(Boolean)
    return parts[parts.length - 1] || 'Inconnue'
  }

  function normCommuneKey(label) {
    return String(label || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .trim()
  }

  // --- Group by theatre ---

  function isTooEarlyTime(heure) {
    // Global editorial rule: exclude performances strictly before 13:00 (school time).
    // Keep 13:00 and later.
    if (!heure) return false
    return String(heure) < '13:00:00'
  }

  function groupByTheatre(representations) {
    var groups = new Map()

    // Dedupe obvious duplicates (same date + time + theatre + title)
    var seen = new Set()

    for (var i = 0; i < representations.length; i++) {
      var rep = representations[i]
      if (isTooEarlyTime(rep.heure)) continue

      var k = [
        rep.date,
        rep.heure || '',
        String(rep.theatre_nom || '').trim().toLowerCase(),
        String(rep.titre || '').trim().toLowerCase(),
      ].join('|')

      if (seen.has(k)) continue
      seen.add(k)

      if (!groups.has(rep.theatre_nom)) {
        groups.set(rep.theatre_nom, {
          theatre_nom: rep.theatre_nom,
          theatre_adresse: rep.theatre_adresse,
          commune_label: parseCommuneLabel(rep.theatre_adresse),
          commune_key: normCommuneKey(parseCommuneLabel(rep.theatre_adresse)),
          representations: [],
        })
      }
      groups.get(rep.theatre_nom).representations.push(rep)
    }
    return Array.from(groups.values()).sort(function (a, b) {
      // Always keep Théâtre National at the end (editorial rule)
      var na = normTheatreName(a.theatre_nom)
      var nb = normTheatreName(b.theatre_nom)
      var NAT = normTheatreName('Théâtre National Wallonie-Bruxelles')
      if (na === NAT && nb !== NAT) return 1
      if (nb === NAT && na !== NAT) return -1

      var rankA = theatreRanking.get(a.theatre_nom)
      if (rankA == null) rankA = theatreRankingNorm.get(na)
      var rankB = theatreRanking.get(b.theatre_nom)
      if (rankB == null) rankB = theatreRankingNorm.get(nb)
      // Ranked theatres first (lower rank = first), unranked at the end alphabetically
      if (rankA != null && rankB != null) return rankA - rankB
      if (rankA != null) return -1
      if (rankB != null) return 1
      return a.theatre_nom.localeCompare(b.theatre_nom, 'fr')
    })
  }

  // --- Populate filter ---

  function populateCommuneFilter(groups) {
    var map = new Map() // key -> label
    groups.forEach(function (g) {
      if (!g) return
      var k = g.commune_key || normCommuneKey(g.commune_label)
      var label = g.commune_label || 'Inconnue'
      if (k && !map.has(k)) map.set(k, label)
    })

    var options = Array.from(map.entries()).map(function (kv) { return { key: kv[0], label: kv[1] } })
    options.sort(function (a, b) { return a.label.localeCompare(b.label, 'fr') })

    // Remove old options (keep first "Toutes")
    while (theatreSelect.options.length > 1) {
      theatreSelect.remove(1)
    }

    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option')
      opt.value = options[i].key
      opt.textContent = options[i].label
      theatreSelect.appendChild(opt)
    }
  }

  // --- Render ---

  function showLoading() {
    resultsContainer.innerHTML =
      '<div class="spinner-wrap"><div class="spinner"></div></div>'
  }

  function renderResults() {
    var groups = selectedCommune
      ? allGroups.filter(function (g) { return g.commune_key === selectedCommune })
      : allGroups

    if (groups.length === 0) {
      resultsContainer.innerHTML =
        '<div class="empty-state">' +
          '<p class="empty-state-title">Aucune repr\u00e9sentation</p>' +
          '<p class="empty-state-text">Pas de spectacle pr\u00e9vu pour cette date.</p>' +
        '</div>'
      return
    }

    var totalShows = groups.reduce(function (acc, g) {
      return acc + g.representations.length
    }, 0)

    var html =
      '<p class="results-summary">' +
        totalShows + ' repr\u00e9sentation' + (totalShows > 1 ? 's' : '') +
        ' \u2014 ' +
        groups.length + ' th\u00e9\u00e2tre' + (groups.length > 1 ? 's' : '') +
      '</p>'

    for (var i = 0; i < groups.length; i++) {
      html += renderTheatreCard(groups[i])
    }

    resultsContainer.innerHTML = html

    // Attach image error handlers
    var imgs = resultsContainer.querySelectorAll('.show-image')
    imgs.forEach(function (img) {
      img.addEventListener('error', function () {
        var wrap = img.parentElement
        wrap.innerHTML =
          '<div class="show-image-placeholder" style="width:100%;height:100%">Image indisponible</div>'
      })
    })
  }

  function renderTheatreCard(group) {
    // Deduplicate
    var seen = {}
    var uniqueReps = group.representations.filter(function (rep) {
      var key = (rep.titre || '') + '|' + (rep.heure || '') + '|' + (rep.url || '')
      if (seen[key]) return false
      seen[key] = true
      return true
    })

    var html =
      '<div class="theatre-card">' +
        '<div class="theatre-card-header">' +
          '<h3 class="theatre-card-name">' + escapeHtml(group.theatre_nom) + '</h3>' +
          (group.theatre_adresse
            ? '<p class="theatre-card-address">' + escapeHtml(group.theatre_adresse) + '</p>'
            : '') +
        '</div>' +
        '<div class="theatre-card-body">'

    for (var i = 0; i < uniqueReps.length; i++) {
      html += renderShowItem(uniqueReps[i])
    }

    html += '</div></div>'
    return html
  }

  function renderShowItem(rep) {
    var title = normalizeTitle(rep.titre)
    var heureHtml = rep.heure
      ? '<p class="show-time">' + escapeHtml(formatHeure(rep.heure)) + '</p>'
      : '<p class="show-time show-time--tbc">Heure \u00e0 confirmer</p>'

    var imageHtml = rep.image_url
      ? '<div class="show-image-wrap">' +
          '<img class="show-image" src="' + escapeHtml(rep.image_url) + '" ' +
            'alt="' + escapeHtml(title) + '" loading="lazy">' +
        '</div>'
      : '<div class="show-image-placeholder">Image indisponible</div>'

    var descHtml = rep.description
      ? '<p class="show-description">' + escapeHtml(decodeHtmlEntities(rep.description)) + '</p>'
      : ''

    var btnHtml = ''
    if (rep.url) {
      var isComplet = rep.is_complet
      btnHtml =
        '<a href="' + escapeHtml(rep.url) + '" target="_blank" rel="noopener noreferrer" ' +
          'class="show-btn' + (isComplet ? ' show-btn--complet' : '') + '">' +
          (isComplet ? 'Complet' : 'R\u00e9server') +
        '</a>'
    }

    return (
      '<div class="show-item">' +
        '<div class="show-item-inner">' +
          '<div class="show-item-content">' +
            imageHtml +
            '<div class="show-info">' +
              '<h4 class="show-title">' + escapeHtml(title) + '</h4>' +
              heureHtml +
              descHtml +
            '</div>' +
          '</div>' +
          btnHtml +
        '</div>' +
      '</div>'
    )
  }
})()
