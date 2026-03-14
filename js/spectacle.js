/* ============================================================
   Spectacle page — details for /spectacle/<slug>
   ============================================================ */

;(function () {
  'use strict'

  var container = document.getElementById('spectacle-container')
  var titleEl = document.getElementById('spectacle-title')
  var metaEl = document.getElementById('spectacle-meta')

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

  function setJsonLd(rep) {
    try {
      var json = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: normalizeTitle(rep.titre),
        startDate: rep.date && rep.heure ? rep.date + 'T' + rep.heure : (rep.date || undefined),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: rep.theatre_nom || undefined,
          address: rep.theatre_adresse || undefined,
        },
        url: rep.url || undefined,
        image: rep.image_url || undefined,
      }

      var script = document.querySelector('script[data-jsonld="spectacle"]')
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-jsonld', 'spectacle')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(json)
    } catch (e) {}
  }

  async function resolveCanonicalId(rep) {
    var fallbackId = rep && rep.id ? rep.id : null
    if (!rep || !rep.id) return fallbackId

    try {
      if (rep.source_url) {
        var bySource = await supabaseClient
          .from('representations')
          .select('id,date,titre,theatre_nom')
          .eq('is_theatre', true)
          .is('hidden_at', null)
          .eq('source_url', rep.source_url)
          .eq('theatre_nom', rep.theatre_nom)
          .order('date', { ascending: true })
          .order('id', { ascending: true })
          .limit(50)

        if (!bySource.error && Array.isArray(bySource.data) && bySource.data.length) {
          var sameTitle = bySource.data.filter(function (r) {
            return normalizeTitle(r.titre || '') === normalizeTitle(rep.titre || '')
          })
          var pool = sameTitle.length ? sameTitle : bySource.data
          if (pool[0] && pool[0].id) return pool[0].id
        }
      }

      var byTitleVenue = await supabaseClient
        .from('representations')
        .select('id,date')
        .eq('is_theatre', true)
        .is('hidden_at', null)
        .eq('theatre_nom', rep.theatre_nom)
        .eq('titre', rep.titre)
        .order('date', { ascending: true })
        .order('id', { ascending: true })
        .limit(50)

      if (!byTitleVenue.error && Array.isArray(byTitleVenue.data) && byTitleVenue.data.length) {
        return byTitleVenue.data[0].id
      }
    } catch (e) {
      // keep fallback
    }

    return fallbackId
  }

  async function render(rep) {
    var title = normalizeTitle(rep.titre)
    titleEl.textContent = title

    var dateLabel = rep.date ? formatDate(rep.date) : 'Date à confirmer'
    var heureLabel = rep.heure ? formatHeure(rep.heure) : 'Heure à confirmer'
    var theatreInfo = window.getTheatreInfoByName ? window.getTheatreInfoByName(rep.theatre_nom) : null
    var theatreLink = theatreInfo && theatreInfo.slug ? '/lieu/' + theatreInfo.slug + '/' : null

    var metaHtml =
      '<p class="spectacle-date">' + escapeHtml(dateLabel) + '</p>' +
      '<p class="spectacle-time">' + escapeHtml(heureLabel) + '</p>' +
      '<p class="spectacle-theatre">' +
        (theatreLink
          ? '<a href="' + theatreLink + '">' + escapeHtml(rep.theatre_nom || '') + '</a>'
          : escapeHtml(rep.theatre_nom || '')) +
      '</p>'

    metaEl.innerHTML = metaHtml

    var desc = decodeHtmlEntities(rep.description || '')
    var descHtml = desc ? '<p class="spectacle-desc">' + escapeHtml(desc) + '</p>' : ''

    var cover = rep.image_url
      ? '<div class="spectacle-cover"><img src="' + escapeHtml(rep.image_url) + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>'
      : ''

    var btn = rep.url
      ? '<a class="show-btn" href="' + escapeHtml(rep.url) + '" target="_blank" rel="noopener noreferrer">Voir la billetterie</a>'
      : ''

    container.innerHTML =
      '<div class="spectacle-card">' +
        cover +
        '<div class="spectacle-body">' +
          descHtml +
          btn +
        '</div>' +
      '</div>'

    var canonicalId = await resolveCanonicalId(rep)
    var canonical = 'https://autheatre.brussels/spectacle/' + buildShowSlug({ id: canonicalId, titre: rep.titre }) + '/'
    document.title = title + ' — Spectacle — Au théâtre ce soir'
    setMetaTag('description', 'Infos, dates et billetterie pour « ' + title + ' » à Bruxelles.')
    setMetaProperty('og:title', title + ' — Spectacle — Au théâtre ce soir')
    setMetaProperty('og:description', 'Infos, dates et billetterie pour « ' + title + ' » à Bruxelles.')
    setMetaProperty('og:type', 'website')
    setMetaProperty('og:locale', 'fr_BE')
    setMetaProperty('og:site_name', 'Au théâtre ce soir')
    setMetaProperty('og:url', canonical)
    setCanonical(canonical)
    setJsonLd(rep)
  }

  async function load() {
    var segs = getPathSegments()
    var slug = segs[0] === 'spectacle' ? segs[1] : null
    var id = parseShowIdFromSlug(slug)

    if (!id) {
      container.innerHTML = '<div class="error-box">Spectacle introuvable.</div>'
      return
    }

    container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>'

    try {
      var res = await supabaseClient
        .from('representations')
        .select('*')
        .eq('id', id)
        .single()

      if (res.error || !res.data) throw new Error('Spectacle introuvable')

      await render(res.data)
    } catch (err) {
      container.innerHTML = '<div class="error-box">' + escapeHtml(err.message || 'Erreur de chargement') + '</div>'
    }
  }

  load()
})()
