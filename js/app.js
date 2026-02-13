/* ============================================================
   Page publique — Agenda des spectacles
   ============================================================ */

;(function () {
  'use strict'

  // --- State ---
  var selectedDate = new Date()
  var allGroups = []
  var selectedTheatre = null

  // --- DOM refs ---
  var dateInput = document.getElementById('date-input')
  var theatreSelect = document.getElementById('theatre-select')
  var resultsTitle = document.getElementById('results-title')
  var resultsContainer = document.getElementById('results-container')

  // --- Init ---
  dateInput.value = toDateString(selectedDate)
  dateInput.min = toDateString(new Date())
  dateInput.addEventListener('change', onDateChange)
  theatreSelect.addEventListener('change', onTheatreChange)

  fetchRepresentations(toDateString(selectedDate))

  // --- Event handlers ---

  function onDateChange() {
    var val = dateInput.value
    if (!val) return
    selectedDate = new Date(val + 'T00:00:00')
    selectedTheatre = null
    theatreSelect.value = ''
    fetchRepresentations(val)
  }

  function onTheatreChange() {
    selectedTheatre = theatreSelect.value || null
    renderResults()
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
        .order('theatre_nom', { ascending: true })
        .order('heure', { ascending: true, nullsFirst: false })

      var result = await query
      if (result.error) throw new Error(result.error.message)

      allGroups = groupByTheatre(result.data || [])
      populateTheatreFilter(allGroups)
      renderResults()
    } catch (err) {
      resultsContainer.innerHTML =
        '<div class="error-box">' + escapeHtml(err.message) + '</div>'
    }
  }

  // --- Group by theatre ---

  function groupByTheatre(representations) {
    var groups = new Map()
    for (var i = 0; i < representations.length; i++) {
      var rep = representations[i]
      if (!groups.has(rep.theatre_nom)) {
        groups.set(rep.theatre_nom, {
          theatre_nom: rep.theatre_nom,
          theatre_adresse: rep.theatre_adresse,
          representations: [],
        })
      }
      groups.get(rep.theatre_nom).representations.push(rep)
    }
    return Array.from(groups.values())
  }

  // --- Populate filter ---

  function populateTheatreFilter(groups) {
    var names = groups.map(function (g) { return g.theatre_nom })
    names.sort(function (a, b) { return a.localeCompare(b, 'fr') })

    // Remove old options (keep first "Tous")
    while (theatreSelect.options.length > 1) {
      theatreSelect.remove(1)
    }

    for (var i = 0; i < names.length; i++) {
      var opt = document.createElement('option')
      opt.value = names[i]
      opt.textContent = names[i]
      theatreSelect.appendChild(opt)
    }
  }

  // --- Render ---

  function showLoading() {
    resultsContainer.innerHTML =
      '<div class="spinner-wrap"><div class="spinner"></div></div>'
  }

  function renderResults() {
    var groups = selectedTheatre
      ? allGroups.filter(function (g) { return g.theatre_nom === selectedTheatre })
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
