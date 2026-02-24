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

  if (!info) {
    titleEl.textContent = 'Lieu introuvable'
    listEl.innerHTML = '<div class="error-box">Slug inconnu.</div>'
    return
  }

  titleEl.textContent = info.theatre_nom
  if (info.official_url) {
    officialEl.innerHTML = '<a href="' + escapeHtml(info.official_url) + '" target="_blank" rel="noopener noreferrer">Site officiel</a>'
  }

  // Adresse: on essaie de la retrouver dans la DB via une représentation récente
  loadAddressAndUpcoming(info.theatre_nom)

  async function loadAddressAndUpcoming(theatreNom) {
    listEl.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    try {
      // 1) Adresse (best-effort)
      var addressResult = await supabaseClient
        .from('representations')
        .select('theatre_adresse')
        .eq('theatre_nom', theatreNom)
        .not('theatre_adresse', 'is', null)
        .order('date', { ascending: false })
        .limit(1)

      if (!addressResult.error && addressResult.data && addressResult.data[0] && addressResult.data[0].theatre_adresse) {
        addressEl.textContent = addressResult.data[0].theatre_adresse
      }

      // 2) Upcoming
      var todayStr = toDateString(new Date())
      var result = await supabaseClient
        .from('representations')
        .select('*')
        .eq('theatre_nom', theatreNom)
        .eq('is_theatre', true)
        .gte('date', todayStr)
        .order('date', { ascending: true })
        .order('heure', { ascending: true, nullsFirst: false })
        .limit(80)

      if (result.error) throw new Error(result.error.message)

      var reps = result.data || []
      if (reps.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p class="empty-state-title">Aucune date à venir</p></div>'
        return
      }

      var html = ''
      for (var i = 0; i < reps.length; i++) {
        html += renderShowItem(reps[i])
      }
      listEl.innerHTML = html

      // Image fallback
      var imgs = listEl.querySelectorAll('.show-image')
      imgs.forEach(function (img) {
        img.addEventListener('error', function () {
          var wrap = img.parentElement
          wrap.innerHTML = '<div class="show-image-placeholder" style="width:100%;height:100%">Image indisponible</div>'
        })
      })
    } catch (err) {
      listEl.innerHTML = '<div class="error-box">' + escapeHtml(err.message) + '</div>'
    }
  }

  function renderShowItem(rep) {
    var title = normalizeTitle(rep.titre)
    var dateHtml = rep.date ? '<p class="show-time">' + escapeHtml(formatDate(rep.date)) + '</p>' : ''
    var heureHtml = rep.heure
      ? '<p class="show-time">' + escapeHtml(formatHeure(rep.heure)) + '</p>'
      : '<p class="show-time show-time--tbc">Heure à confirmer</p>'

    var imageHtml = rep.image_url
      ? '<div class="show-image-wrap">' +
          '<img class="show-image" src="' + escapeHtml(rep.image_url) + '" ' +
            'alt="' + escapeHtml(title) + '" loading="lazy">' +
        '</div>'
      : '<div class="show-image-placeholder">Image indisponible</div>'

    var btnHtml = ''
    if (rep.url) {
      var isComplet = rep.is_complet
      btnHtml =
        '<a href="' + escapeHtml(rep.url) + '" target="_blank" rel="noopener noreferrer" ' +
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
              '<h4 class="show-title">' + escapeHtml(title) + '</h4>' +
              dateHtml +
              heureHtml +
            '</div>' +
          '</div>' +
          btnHtml +
        '</div>' +
      '</div>'
    )
  }
})()
