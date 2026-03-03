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

  function renderShowItem(rep) {
    var title = normalizeTitle(rep.titre)
    var showSlug = buildShowSlug(rep)
    var titleHtml = showSlug
      ? '<a href="/spectacle/' + escapeHtml(showSlug) + '/">' + escapeHtml(title) + '</a>'
      : escapeHtml(title)
    var dateHtml = rep.date ? '<p class="show-time">' + escapeHtml(formatDate(rep.date)) + '</p>' : ''
    var heureHtml = rep.heure
      ? '<p class="show-time">' + escapeHtml(formatHeure(rep.heure)) + '</p>'
      : '<p class="show-time show-time--tbc">Heure à confirmer</p>'

    var imageHtml = rep.image_url
      ? '<div class="show-image-wrap">' +
          '<img class="show-image" src="' + escapeHtml(rep.image_url) + '" ' +
            'alt="' + escapeHtml(title) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
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
              '<h4 class="show-title">' + titleHtml + '</h4>' +
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
