/* ============================================================
   Admin Dashboard — Tous les onglets
   ============================================================ */

;(function () {
  'use strict'

  // ---------------------------------------------------------------
  // Theatres cible (63 theatres bruxellois)
  // ---------------------------------------------------------------
  // Season window used for admin stats (public-facing dataset)
  var MIN_DATE = '2026-01-01'
  var MAX_DATE = '2026-06-30'

  // IMPORTANT: "Couverture (connecteurs)" is a manual checklist: theatres we already have
  // a connector for (even if it currently returns 0 upcoming reps).
  // Update this list when you add a new connector.
  var THEATRES_CONNECTEURS = [
    // Petites salles / lieux intimistes
    'Au Dé à Coudre',
    "Au B'Izou",
    'Cellule 133a',
    "L'Épicerie (Ras El Hanout)",
    "Le Café de la Rue",
    "Koek's Théâtre",
    'Le Boson',
    'La Clarencière',
    'Maison Poème',
    "L'Os à Moelle",
    "L'Entrela'",
    'PLOEF!',
    'Le Jardin de ma Sœur',
    'La Villa',
    'Atelier Théâtre de la Vie',
    "Théâtre L'Improviste",
    'Côté Village',
    'Théâtre de Joli-Bois',
    'Théâtre Royal de Toone',
    'Magic Land Théâtre',

    // Centres culturels
    'Archipel 19 – Maison Stepman',
    'Archipel 19 – Le Fourquet',
    'Escale du Nord',
    'BRASS',
    'Auditorium Jacques Brel (CERIA)',
    'Maison des Cultures et de la Cohésion Sociale',
    "Centre culturel de Jette (L'Armillaire)",
    'Centre Culturel de Schaerbeek',
    'Centre culturel Jacques Franck',
    "Centre culturel d'Auderghem (CCA)",
    "Centre Culturel d'Uccle",
    'Espace Senghor',
    'Zinnema',
    'GC De Kriekelaar',
    'Wolubilis',
    // Maison de la Création (multiple venues)
    'Maison de la Création - Bockstael',
    'Maison de la Création - Cité Modèle',
    'Maison de la Création - Gare',

    // Théâtres moyens/grands
    'Théâtre de Poche',
    'Théâtre Océan Nord',
    'Théâtre Marni',
    'Comédie Claude Volter',
    'Théâtre Mercelis',
    'Le Rideau',
    'Théâtre de la Balsamine',
    'Théâtre 140',
    'Théâtre Varia',
    'Atelier 210',
    'Théâtre Saint-Michel',
    'W:Halll',
    'La Vénerie',
    'Les Riches-Claires',
    'BRONKS',

    // Institutions
    'La Montagne Magique',
    'Théâtre Le Public',
    'Théâtre Les Tanneurs',
    'Beursschouwburg',
    "Théâtre de la Toison d'Or",
    'Halles de Schaerbeek',
    'Kaaitheater',
    'Théâtre des Martyrs',
    'Cirque Royal',
    'Théâtre Royal du Parc',
    'Théâtre Royal des Galeries',
    'KVS (Koninklijke Vlaamse Schouwburg)',
    'Théâtre National Wallonie-Bruxelles',
  ]

  var THEATRES_CIBLE = [
    // --- Petites salles indépendantes, cafés-théâtres, lieux intimistes ---
    'Au D\u00e9 \u00e0 Coudre',
    'Au B\'Izou',
    'Cellule 133a',
    'L\'\u00c9picerie (Ras El Hanout)',
    'Le Caf\u00e9 de la Rue',
    'Koek\'s Th\u00e9\u00e2tre',
    'Le Boson',
    'La Clarenci\u00e8re',
    'Maison Po\u00e8me',
    'L\'Os \u00e0 Moelle',
    'L\'Entrela\'',
    'PLOEF!',
    'Le Jardin de ma S\u0153ur',
    'La Villa',
    'Atelier Th\u00e9\u00e2tre de la Vie',
    'Th\u00e9\u00e2tre L\'Improviste',
    'C\u00f4t\u00e9 Village',
    'Th\u00e9\u00e2tre de Joli-Bois',
    'Th\u00e9\u00e2tre Royal de Toone',
    'Magic Land Th\u00e9\u00e2tre',
    // --- Centres culturels communaux, salles moyennes-petites ---
    'Archipel 19 \u2013 Maison Stepman',
    'Archipel 19 \u2013 Le Fourquet',
    'Escale du Nord',
    'BRASS',
    'Auditorium Jacques Brel (CERIA)',
    'Maison des Cultures et de la Coh\u00e9sion Sociale',
    'Centre culturel de Jette (L\'Armillaire)',
    'Centre culturel Jacques Franck',
    'Centre culturel d\'Auderghem (CCA)',
    'Centre Culturel d\'Uccle',
    'Espace Senghor',
    'Zinnema',
    'Centre Culturel de Schaerbeek',
    'GC De Kriekelaar',
    'Wolubilis',
    // Maison de la Création (multiple venues)
    'Maison de la Création - Bockstael',
    'Maison de la Création - Cité Modèle',
    'Maison de la Création - Gare',
    // --- Théâtres établis de taille moyenne ---
    'Th\u00e9\u00e2tre de Poche',
    'Th\u00e9\u00e2tre Oc\u00e9an Nord',
    'Th\u00e9\u00e2tre Marni',
    'Com\u00e9die Claude Volter',
    'Th\u00e9\u00e2tre Mercelis',
    'Le Rideau',
    'Th\u00e9\u00e2tre de la Balsamine',
    'Th\u00e9\u00e2tre 140',
    'Th\u00e9\u00e2tre Varia',
    'Atelier 210',
    'Th\u00e9\u00e2tre Saint-Michel',
    'W:Halll',
    'La V\u00e9nerie',
    'Les Riches-Claires',
    'BRONKS',
    // --- Grandes institutions, théâtres subventionnés ---
    'La Montagne Magique',
    'Th\u00e9\u00e2tre Le Public',
    'Th\u00e9\u00e2tre Les Tanneurs',
    'Beursschouwburg',
    'Th\u00e9\u00e2tre de la Toison d\'Or',
    'Halles de Schaerbeek',
    'Kaaitheater',
    'Th\u00e9\u00e2tre des Martyrs',
    'Cirque Royal',
    'Th\u00e9\u00e2tre Royal du Parc',
    'Th\u00e9\u00e2tre Royal des Galeries',
    'KVS (Koninklijke Vlaamse Schouwburg)',
    'Th\u00e9\u00e2tre National Wallonie-Bruxelles',
  ]

  // ---------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------
  var loadingEl = document.getElementById('admin-loading')
  var appEl = document.getElementById('admin-app')
  var contentEl = document.getElementById('admin-content')
  var tabsNav = document.getElementById('admin-tabs')
  var logoutBtn = document.getElementById('btn-logout')

  var activeTab = 'status'
  var chartInstances = [] // keep track of Chart.js instances to destroy on re-render

  // ---------------------------------------------------------------
  // Auth check
  // ---------------------------------------------------------------
  ;(async function init() {
    try {
      var result = await supabaseClient.auth.getUser()
      if (!result.data || !result.data.user) {
        window.location.href = 'login.html'
        return
      }
      loadingEl.classList.add('hidden')
      appEl.classList.remove('hidden')
      renderTab(activeTab)
    } catch (e) {
      window.location.href = 'login.html'
    }
  })()

  // Logout
  logoutBtn.addEventListener('click', async function () {
    await supabaseClient.auth.signOut()
    window.location.href = 'login.html'
  })

  // Tab switching
  tabsNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.admin-tab')
    if (!btn) return
    var tab = btn.dataset.tab
    if (tab === activeTab) return

    // Update active tab styling
    tabsNav.querySelectorAll('.admin-tab').forEach(function (b) {
      b.classList.remove('admin-tab--active')
    })
    btn.classList.add('admin-tab--active')

    activeTab = tab
    renderTab(tab)
  })

  // ---------------------------------------------------------------
  // Tab router
  // ---------------------------------------------------------------
  function renderTab(tab) {
    destroyCharts()
    contentEl.innerHTML = '<div class="spinner-wrap"><div class="spinner spinner--amber"></div></div>'

    switch (tab) {
      case 'status': renderStatusTab(); break
      case 'problems': renderProblemsTab(); break
      case 'stats': renderStatsTab(); break
      case 'import': renderImportTab(); break
      case 'manual': renderManualTab(); break
      case 'todo': renderTodoTab(); break
      case 'classement': renderClassementTab(); break
    }
  }

  function destroyCharts() {
    chartInstances.forEach(function (c) { c.destroy() })
    chartInstances = []
  }

  // ---------------------------------------------------------------
  // Helper: show loading / error
  // ---------------------------------------------------------------
  function showSpinner() {
    return '<div class="spinner-wrap"><div class="spinner spinner--amber"></div></div>'
  }

  function showError(msg) {
    return '<div class="error-box error-box--red">' + escapeHtml(msg) + '</div>'
  }

  // ===============================================================
  //  TAB: SITUATION
  // ===============================================================
  async function renderStatusTab() {
    try {
      var results = await Promise.all([
        getDistinctTheatresVisibleSeason(),
        getLatestRepresentations(15),
        getSourceStatuses(),
        getTotalCountVisibleSeason(),
      ])

      var dbTheatres = results[0]
      var latestReps = results[1]
      var sourceStatuses = results[2]
      var totalCount = results[3]

      // Coverage 1: connecteurs (manual checklist)
      var connectorsNorm = new Set(THEATRES_CONNECTEURS.map(function (t) { return normTheatreName(t) }))
      var connectorsCovered = THEATRES_CIBLE.filter(function (t) { return connectorsNorm.has(normTheatreName(t)) })
      var connectorsMissing = THEATRES_CIBLE.filter(function (t) { return !connectorsNorm.has(normTheatreName(t)) })

      // Coverage 2: visible season (what we actually show)
      // Match by normalized exact name only (avoid fuzzy includes that creates false positives/negatives)
      var dbNorm = new Set(dbTheatres.map(function (t) { return normTheatreName(t) }))

      var matchedTargets = THEATRES_CIBLE.filter(function (target) {
        return dbNorm.has(normTheatreName(target))
      })

      var missingTargets = THEATRES_CIBLE.filter(function (t) {
        return matchedTargets.indexOf(t) === -1
      })

      var targetNorm = new Set(THEATRES_CIBLE.map(function (t) { return normTheatreName(t) }))
      var extraTheatres = dbTheatres.filter(function (db) {
        return !targetNorm.has(normTheatreName(db))
      })

      var now = Date.now()
      var SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
      var staleConnectors = sourceStatuses.filter(function (s) {
        return now - new Date(s.lastCreatedAt).getTime() > SEVEN_DAYS
      })

      var coveragePct = Math.round((matchedTargets.length / THEATRES_CIBLE.length) * 100)
      var connectorsPct = Math.round((connectorsCovered.length / THEATRES_CIBLE.length) * 100)

      var html = ''

      // Header
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Situation d\'insertion</h2>'
      html += '<p class="section-subtitle">Couverture des th\u00e9\u00e2tres, derni\u00e8res insertions et \u00e9tat des connecteurs.</p></div>'
      html += '<button class="btn" onclick="document.querySelector(\'[data-tab=status]\').click()">Rafra\u00eechir</button>'
      html += '</div>'

      // KPIs
      html += '<div class="kpi-grid">'
      html += kpiCard('Repr\u00e9sentations (visibles saison)', totalCount.toLocaleString('fr-BE'))
      html += kpiCard('Th\u00e9\u00e2tres (visibles saison)', dbTheatres.length)
      html += kpiCard('Couverture connecteurs', connectorsCovered.length + '/' + THEATRES_CIBLE.length, connectorsPct + '%')
      html += kpiCard('Couverture visible (saison)', matchedTargets.length + '/' + THEATRES_CIBLE.length, coveragePct + '%')
      html += '</div>'

      // Progress bar (visible season)
      html += '<div class="progress-bar-wrap">'
      html += '<div class="progress-bar-header"><span class="progress-bar-label">Couverture visible (saison ' + MIN_DATE + ' → ' + MAX_DATE + ')</span>'
      html += '<span class="progress-bar-pct">' + coveragePct + '%</span></div>'
      html += '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + coveragePct + '%"></div></div>'
      html += '</div>'

      // Toggle buttons
      html += '<div class="toggle-bar">'
      html += '<button class="btn-toggle" id="btn-show-missing">' + connectorsMissing.length + ' connecteur(s) manquant(s)</button>'
      html += '<button class="btn-toggle" id="btn-show-present">' + connectorsCovered.length + ' connecteur(s) ok</button>'
      html += '<button class="btn-toggle" id="btn-show-visible-missing">' + missingTargets.length + ' manquant(s) (visible saison)</button>'
      html += '<button class="btn-toggle" id="btn-show-visible-present">' + matchedTargets.length + ' pr\u00e9sent(s) (visible saison)</button>'
      if (extraTheatres.length > 0) {
        html += '<span class="toggle-extra">+ ' + extraTheatres.length + ' th\u00e9\u00e2tre(s) hors liste cible en DB</span>'
      }
      html += '</div>'

      // Connectors missing panel
      html += '<div id="panel-missing" class="theatre-list-panel theatre-list-panel--red hidden">'
      html += '<h3 class="theatre-list-panel-title" style="color:var(--color-red-800)">Connecteurs manquants (' + connectorsMissing.length + ')</h3>'
      html += '<div class="theatre-list-grid">'
      connectorsMissing.forEach(function (t) {
        html += '<div class="theatre-list-item" style="color:var(--color-red-700)">' + escapeHtml(t) + '</div>'
      })
      html += '</div></div>'

      // Connectors present panel
      html += '<div id="panel-present" class="theatre-list-panel theatre-list-panel--green hidden">'
      html += '<h3 class="theatre-list-panel-title" style="color:var(--color-green-800)">Connecteurs ok (' + connectorsCovered.length + ')</h3>'
      html += '<div class="theatre-list-grid">'
      connectorsCovered.forEach(function (t) {
        html += '<div class="theatre-list-item" style="color:var(--color-green-700)">' + escapeHtml(t) + '</div>'
      })
      html += '</div></div>'

      // Visible season missing panel
      html += '<div id="panel-visible-missing" class="theatre-list-panel theatre-list-panel--red hidden">'
      html += '<h3 class="theatre-list-panel-title" style="color:var(--color-red-800)">Manquants (visible saison ' + MIN_DATE + ' → ' + MAX_DATE + ') (' + missingTargets.length + ')</h3>'
      html += '<div class="theatre-list-grid">'
      missingTargets.forEach(function (t) {
        html += '<div class="theatre-list-item" style="color:var(--color-red-700)">' + escapeHtml(t) + '</div>'
      })
      html += '</div></div>'

      // Visible season present panel
      html += '<div id="panel-visible-present" class="theatre-list-panel theatre-list-panel--green hidden">'
      html += '<h3 class="theatre-list-panel-title" style="color:var(--color-green-800)">Pr\u00e9sents (visible saison ' + MIN_DATE + ' → ' + MAX_DATE + ') (' + matchedTargets.length + ')</h3>'
      html += '<div class="theatre-list-grid">'
      matchedTargets.forEach(function (t) {
        html += '<div class="theatre-list-item" style="color:var(--color-green-700)">' + escapeHtml(t) + '</div>'
      })
      html += '</div></div>'

      // Connectors table
      html += '<div class="section-space"><h3 class="chart-title">\u00c9tat des connecteurs</h3>'
      html += '<div class="table-wrap"><table><thead><tr>'
      html += '<th>Source</th><th>Th\u00e9\u00e2tre</th><th class="text-right">Lignes</th><th>Derni\u00e8re maj</th><th></th>'
      html += '</tr></thead><tbody>'
      sourceStatuses.forEach(function (s) {
        var isStale = now - new Date(s.lastCreatedAt).getTime() > SEVEN_DAYS
        var dateStr = s.lastCreatedAt
          ? new Date(s.lastCreatedAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '\u2014'
        html += '<tr>'
        html += '<td class="font-mono">' + escapeHtml(s.source) + '</td>'
        html += '<td style="color:var(--color-gray-700)">' + escapeHtml(s.theatreNom) + '</td>'
        html += '<td class="text-right" style="color:var(--color-gray-700)">' + s.count + '</td>'
        html += '<td style="color:var(--color-gray-500)">' + dateStr + '</td>'
        html += '<td>' + (isStale ? '<span style="font-size:0.75rem;color:var(--color-amber-600);font-weight:500">\u00c0 rafra\u00eechir</span>' : '') + '</td>'
        html += '</tr>'
      })
      html += '</tbody></table></div></div>'

      // Latest representations
      html += '<div><h3 class="chart-title">Derni\u00e8res repr\u00e9sentations ajout\u00e9es</h3>'
      latestReps.forEach(function (r) {
        var createdStr = r.created_at
          ? new Date(r.created_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : ''
        html += '<div class="list-item">'
        html += '<div style="min-width:0"><div class="list-item-title">' + escapeHtml(r.titre) + '</div>'
        html += '<div class="list-item-sub">' + escapeHtml(r.theatre_nom) + ' &middot; ' + formatDate(r.date)
        if (r.heure) html += ' \u00e0 ' + formatHeure(r.heure)
        html += '</div></div>'
        html += '<div class="list-item-date">' + createdStr + '</div>'
        html += '</div>'
      })
      html += '</div>'

      contentEl.innerHTML = html

      // Toggle event listeners
      document.getElementById('btn-show-missing').addEventListener('click', function () {
        var panel = document.getElementById('panel-missing')
        var btn = this
        panel.classList.toggle('hidden')
        btn.classList.toggle('btn-toggle--red')
      })
      document.getElementById('btn-show-present').addEventListener('click', function () {
        var panel = document.getElementById('panel-present')
        var btn = this
        panel.classList.toggle('hidden')
        btn.classList.toggle('btn-toggle--green')
      })

      document.getElementById('btn-show-visible-missing').addEventListener('click', function () {
        var panel = document.getElementById('panel-visible-missing')
        var btn = this
        panel.classList.toggle('hidden')
        btn.classList.toggle('btn-toggle--red')
      })
      document.getElementById('btn-show-visible-present').addEventListener('click', function () {
        var panel = document.getElementById('panel-visible-present')
        var btn = this
        panel.classList.toggle('hidden')
        btn.classList.toggle('btn-toggle--green')
      })

    } catch (err) {
      contentEl.innerHTML = showError(err.message)
    }
  }

  // ===============================================================
  //  TAB: PROBLEMES
  // ===============================================================
  async function renderProblemsTab() {
    try {
      var results = await Promise.all([
        getMissingFieldsStats(),
        getDuplicates(),
        getPastShowsCount(),
        getTotalCount(),
      ])

      var missingFields = results[0]
      var duplicates = results[1]
      var pastCount = results[2]
      var totalCount = results[3]

      var totalProblems = missingFields.reduce(function (a, b) { return a + b.count }, 0) + duplicates.length + pastCount

      var html = ''

      // Header
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Probl\u00e8mes &amp; incoh\u00e9rences</h2>'
      html += '<p class="section-subtitle">Donn\u00e9es manquantes, doublons et anomalies dans la base.</p></div>'
      html += '<button class="btn" onclick="document.querySelector(\'[data-tab=problems]\').click()">Rafra\u00eechir</button>'
      html += '</div>'

      // Badge
      if (totalProblems === 0) {
        html += '<div class="badge badge--green"><span class="badge-dot"></span>Aucun probl\u00e8me d\u00e9tect\u00e9</div>'
      } else {
        html += '<div class="badge badge--amber"><span class="badge-dot"></span>' + totalProblems.toLocaleString('fr-BE') + ' point(s) d\'attention</div>'
      }

      // Missing fields
      html += '<div class="section-space" style="margin-top:1.5rem"><h3 class="chart-title">Donn\u00e9es manquantes</h3>'
      html += '<div class="fields-grid">'
      missingFields.forEach(function (f) {
        var pct = totalCount > 0 ? Math.round(((totalCount - f.count) / totalCount) * 100) : 100
        var barClass = pct === 100 ? 'progress-fill--green' : pct >= 80 ? 'progress-fill--amber' : 'progress-fill--red'
        html += '<div class="field-card">'
        html += '<div class="field-label">' + escapeHtml(f.label) + '</div>'
        html += '<div style="display:flex;align-items:baseline;gap:0.5rem;margin-top:0.25rem">'
        html += '<span class="field-value' + (f.count === 0 ? ' field-value--ok' : '') + '">'
        html += (f.count === 0 ? 'OK' : f.count.toLocaleString('fr-BE'))
        html += '</span>'
        if (f.count > 0) html += '<span class="field-sub">manquant(s)</span>'
        html += '</div>'
        html += '<div style="margin-top:0.5rem"><div class="progress-bar progress-sm"><div class="progress-bar-fill ' + barClass + '" style="width:' + pct + '%"></div></div>'
        html += '<div class="field-sub" style="margin-top:0.125rem">' + pct + '% complet</div></div>'
        html += '</div>'
      })
      html += '</div></div>'

      // Past shows
      if (pastCount > 0) {
        html += '<div class="alert alert--amber section-space">'
        html += '<div style="display:flex;align-items:center;justify-content:space-between">'
        html += '<div><h3 class="alert-title" style="color:var(--color-amber-700)">Repr\u00e9sentations pass\u00e9es</h3>'
        html += '<p class="alert-text" style="color:var(--color-amber-700)">' + pastCount.toLocaleString('fr-BE') + ' repr\u00e9sentation(s) avec une date ant\u00e9rieure \u00e0 aujourd\'hui.</p></div>'
        html += '<button class="btn btn--primary" id="btn-clean-past">Nettoyer</button>'
        html += '</div></div>'
      }

      // Duplicates
      html += '<div><h3 class="chart-title">Doublons potentiels <span style="color:var(--color-gray-400);font-weight:400">(' + duplicates.length + ')</span></h3>'
      if (duplicates.length === 0) {
        html += '<div style="font-size:0.875rem;color:var(--color-gray-500)">Aucun doublon d\u00e9tect\u00e9.</div>'
      } else {
        html += '<div class="scroll-area">'
        duplicates.slice(0, 50).forEach(function (d, i) {
          html += '<div class="list-item">'
          html += '<div style="min-width:0"><div class="list-item-title">' + escapeHtml(d.titre) + '</div>'
          html += '<div class="list-item-sub">' + escapeHtml(d.theatre_nom) + ' &middot; ' + d.date
          if (d.heure) html += ' \u00e0 ' + d.heure.slice(0, 5)
          html += '</div>'
          html += '<div class="list-item-meta">' + d.count + ' exemplaires (IDs: ' + d.ids.join(', ') + ')</div>'
          html += '</div>'
          html += '<button class="btn btn--danger-sm" data-dup-ids="' + d.ids.slice(1).join(',') + '">Garder 1, suppr. ' + (d.count - 1) + '</button>'
          html += '</div>'
        })
        if (duplicates.length > 50) {
          html += '<div style="font-size:0.75rem;color:var(--color-gray-500)">Affichage limit\u00e9 \u00e0 50 sur ' + duplicates.length + ' groupes.</div>'
        }
        html += '</div>'
      }
      html += '</div>'

      contentEl.innerHTML = html

      // Event: clean past
      var cleanBtn = document.getElementById('btn-clean-past')
      if (cleanBtn) {
        cleanBtn.addEventListener('click', async function () {
          if (!confirm('Supprimer les ' + pastCount + ' repr\u00e9sentations pass\u00e9es ? Cette action est irr\u00e9versible.')) return
          cleanBtn.disabled = true
          cleanBtn.textContent = 'Nettoyage\u2026'
          try {
            var today = toDateString(new Date())
            var res = await supabaseClient.from('representations').delete().lt('date', today)
            if (res.error) throw new Error(res.error.message)
            renderProblemsTab()
          } catch (e) {
            alert('Erreur: ' + e.message)
          }
        })
      }

      // Event: delete duplicates
      contentEl.querySelectorAll('[data-dup-ids]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var ids = btn.dataset.dupIds.split(',').map(Number)
          btn.disabled = true
          btn.textContent = 'Suppression\u2026'
          try {
            var res = await supabaseClient.from('representations').delete().in('id', ids)
            if (res.error) throw new Error(res.error.message)
            renderProblemsTab()
          } catch (e) {
            alert('Erreur: ' + e.message)
          }
        })
      })

    } catch (err) {
      contentEl.innerHTML = showError(err.message)
    }
  }

  // ===============================================================
  //  TAB: STATISTIQUES
  // ===============================================================
  async function renderStatsTab() {
    try {
      var rawData = await getStatsData()

      // Compute stats
      var monthMap = new Map()
      var weekMap = new Map()
      var theatreMap = new Map()
      var genreMap = new Map()
      var dayCounts = [0, 0, 0, 0, 0, 0, 0]
      var MONTH_LABELS = {'01':'Jan','02':'F\u00e9v','03':'Mar','04':'Avr','05':'Mai','06':'Jun','07':'Jul','08':'Ao\u00fb','09':'Sep','10':'Oct','11':'Nov','12':'D\u00e9c'}

      rawData.forEach(function (r) {
        // Month
        var m = r.date.slice(0, 7)
        monthMap.set(m, (monthMap.get(m) || 0) + 1)

        // Week
        var d = new Date(r.date)
        var start = new Date(d.getFullYear(), 0, 1)
        var weekNum = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
        var wk = d.getFullYear() + '-S' + String(weekNum).padStart(2, '0')
        weekMap.set(wk, (weekMap.get(wk) || 0) + 1)

        // Theatre
        theatreMap.set(r.theatre_nom, (theatreMap.get(r.theatre_nom) || 0) + 1)

        // Genre
        var g = r.genre || 'non d\u00e9fini'
        var label = g === 'comedie' ? 'Com\u00e9die' : g === 'drame' ? 'Drame' : g === 'autre' ? 'Autre' : 'Non d\u00e9fini'
        genreMap.set(label, (genreMap.get(label) || 0) + 1)

        // Day of week
        dayCounts[d.getDay()] += 1
      })

      var monthData = Array.from(monthMap.entries()).sort().map(function (e) {
        var parts = e[0].split('-')
        return { label: (MONTH_LABELS[parts[1]] || parts[1]) + ' ' + parts[0], count: e[1] }
      })

      var weekData = Array.from(weekMap.entries()).sort().map(function (e) {
        return { label: e[0].replace('-', ' '), count: e[1] }
      })

      var theatreData = Array.from(theatreMap.entries()).map(function (e) {
        return { name: e[0], count: e[1] }
      }).sort(function (a, b) { return b.count - a.count })

      var genreData = Array.from(genreMap.entries()).map(function (e) {
        return { name: e[0], value: e[1] }
      }).sort(function (a, b) { return b.value - a.value })

      var dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

      var topTheatres = theatreData.slice(0, 15)

      // --- Build HTML ---
      var html = ''

      // Header
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Statistiques</h2>'
      html += '<p class="section-subtitle">Vue d\'ensemble sur ' + rawData.length.toLocaleString('fr-BE') + ' repr\u00e9sentations, ' + theatreData.length + ' th\u00e9\u00e2tres.</p></div>'
      html += '<button class="btn" onclick="document.querySelector(\'[data-tab=stats]\').click()">Rafra\u00eechir</button>'
      html += '</div>'

      // KPIs
      html += '<div class="kpi-grid">'
      html += kpiCard('Total repr\u00e9sentations', rawData.length.toLocaleString('fr-BE'))
      html += kpiCard('Th\u00e9\u00e2tres', theatreData.length)
      html += kpiCard('Mois couverts', monthData.length)
      html += kpiCard('Moy. / mois', monthData.length > 0 ? Math.round(rawData.length / monthData.length).toLocaleString('fr-BE') : '0')
      html += '</div>'

      // Chart containers
      html += '<div class="chart-wrap"><h3 class="chart-title">Repr\u00e9sentations par mois</h3><div class="chart-container"><canvas id="chart-month"></canvas></div></div>'

      if (weekData.length <= 60) {
        html += '<div class="chart-wrap"><h3 class="chart-title">Repr\u00e9sentations par semaine</h3><div class="chart-container"><canvas id="chart-week"></canvas></div></div>'
      }

      html += '<div class="chart-wrap"><h3 class="chart-title">R\u00e9partition par jour de la semaine</h3><div class="chart-container" style="height:12rem"><canvas id="chart-day"></canvas></div></div>'

      html += '<div class="chart-wrap"><h3 class="chart-title">R\u00e9partition par genre</h3><div class="chart-container"><canvas id="chart-genre"></canvas></div></div>'

      html += '<div class="chart-wrap"><h3 class="chart-title">Top ' + topTheatres.length + ' th\u00e9\u00e2tres</h3><div class="chart-container chart-container--tall"><canvas id="chart-theatres"></canvas></div></div>'

      // Full theatre table
      html += '<div><h3 class="chart-title">Tous les th\u00e9\u00e2tres (' + theatreData.length + ')</h3>'
      html += '<div class="table-wrap scroll-area"><table><thead><tr><th>#</th><th>Th\u00e9\u00e2tre</th><th class="text-right">Repr\u00e9sentations</th></tr></thead><tbody>'
      theatreData.forEach(function (t, i) {
        html += '<tr><td style="color:var(--color-gray-400)">' + (i + 1) + '</td>'
        html += '<td style="color:var(--color-gray-900)">' + escapeHtml(t.name) + '</td>'
        html += '<td class="text-right" style="color:var(--color-gray-700)">' + t.count + '</td></tr>'
      })
      html += '</tbody></table></div></div>'

      contentEl.innerHTML = html

      // --- Create Charts ---
      var COLORS = ['#d97706','#059669','#2563eb','#dc2626','#7c3aed','#db2777','#0891b2','#65a30d','#ea580c','#4f46e5']
      var PIE_COLORS = ['#d97706','#2563eb','#6b7280','#059669']

      // Monthly chart
      chartInstances.push(new Chart(document.getElementById('chart-month'), {
        type: 'bar',
        data: {
          labels: monthData.map(function (d) { return d.label }),
          datasets: [{ label: 'Repr\u00e9sentations', data: monthData.map(function (d) { return d.count }), backgroundColor: '#d97706', borderRadius: 4 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 45 } } } },
      }))

      // Weekly chart
      if (weekData.length <= 60) {
        chartInstances.push(new Chart(document.getElementById('chart-week'), {
          type: 'bar',
          data: {
            labels: weekData.map(function (d) { return d.label }),
            datasets: [{ label: 'Repr\u00e9sentations', data: weekData.map(function (d) { return d.count }), backgroundColor: '#2563eb', borderRadius: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 45, font: { size: 10 } } } } },
        }))
      }

      // Day of week
      chartInstances.push(new Chart(document.getElementById('chart-day'), {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [{ label: 'Repr\u00e9sentations', data: dayCounts, backgroundColor: '#059669', borderRadius: 4 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      }))

      // Genre pie
      chartInstances.push(new Chart(document.getElementById('chart-genre'), {
        type: 'doughnut',
        data: {
          labels: genreData.map(function (d) { return d.name }),
          datasets: [{ data: genreData.map(function (d) { return d.value }), backgroundColor: PIE_COLORS.slice(0, genreData.length) }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      }))

      // Top theatres horizontal bar
      chartInstances.push(new Chart(document.getElementById('chart-theatres'), {
        type: 'bar',
        data: {
          labels: topTheatres.map(function (d) { return d.name }),
          datasets: [{ label: 'Repr\u00e9sentations', data: topTheatres.map(function (d) { return d.count }), backgroundColor: topTheatres.map(function (_, i) { return COLORS[i % COLORS.length] }), borderRadius: 4 }],
        },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } },
      }))

    } catch (err) {
      contentEl.innerHTML = showError(err.message)
    }
  }

  // ===============================================================
  //  TAB: IMPORT CSV
  // ===============================================================
  function renderImportTab() {
    var html = ''
    html += '<div class="form-group">'
    html += '<label class="form-label">Fichier CSV</label>'
    html += '<div class="file-input-wrap"><input type="file" id="csv-file" accept=".csv"></div>'
    html += '<p class="form-hint">Colonnes attendues: date, heure, titre, theatre_nom, theatre_adresse, url, genre, style, description</p>'
    html += '</div>'
    html += '<div id="csv-preview"></div>'
    html += '<div id="csv-result"></div>'

    contentEl.innerHTML = html

    document.getElementById('csv-file').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0]
      if (!file) return

      document.getElementById('csv-result').innerHTML = ''

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          var errors = []
          var validRows = []

          results.data.forEach(function (row, index) {
            if (!row.date) { errors.push('Ligne ' + (index + 2) + ': date manquante'); return }
            if (!row.titre) { errors.push('Ligne ' + (index + 2) + ': titre manquant'); return }
            if (!row.theatre_nom) { errors.push('Ligne ' + (index + 2) + ': theatre_nom manquant'); return }

            var ng = normalizeGenre(row.genre)
            var ns = normalizeStyle(row.style)

            if (row.genre && !ng) errors.push('Ligne ' + (index + 2) + ': genre invalide "' + row.genre + '" \u2192 laiss\u00e9 vide')
            if (row.style && !ns) errors.push('Ligne ' + (index + 2) + ': style invalide "' + row.style + '" \u2192 laiss\u00e9 vide')

            validRows.push({
              date: row.date,
              heure: row.heure || null,
              titre: row.titre,
              theatre_nom: row.theatre_nom,
              theatre_adresse: row.theatre_adresse || null,
              url: row.url || null,
              genre: ng,
              style: ns,
              description: row.description || null,
              image_url: null,
            })
          })

          renderCsvPreview(validRows, errors)
        },
        error: function (err) {
          document.getElementById('csv-preview').innerHTML = showError(err.message)
        },
      })
    })
  }

  function renderCsvPreview(rows, errors) {
    var previewEl = document.getElementById('csv-preview')
    var html = ''

    if (errors.length > 0) {
      html += '<div class="alert alert--yellow" style="margin-bottom:1rem">'
      html += '<h4 class="alert-title" style="color:var(--color-yellow-800)">Avertissements (' + errors.length + ')</h4>'
      html += '<ul style="font-size:0.875rem;color:var(--color-yellow-700);list-style:disc;padding-left:1.5rem;max-height:8rem;overflow-y:auto">'
      errors.forEach(function (err) { html += '<li>' + escapeHtml(err) + '</li>' })
      html += '</ul></div>'
    }

    if (rows.length > 0) {
      html += '<div class="preview-box">'
      html += '<h4 class="preview-title">Aper\u00e7u (' + rows.length + ' lignes valides)</h4>'
      html += '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Heure</th><th>Titre</th><th>Th\u00e9\u00e2tre</th></tr></thead><tbody>'
      rows.slice(0, 5).forEach(function (r) {
        html += '<tr><td>' + escapeHtml(r.date) + '</td><td>' + escapeHtml(r.heure || '-') + '</td><td>' + escapeHtml(r.titre) + '</td><td>' + escapeHtml(r.theatre_nom) + '</td></tr>'
      })
      html += '</tbody></table>'
      if (rows.length > 5) html += '<p style="font-size:0.875rem;color:var(--color-gray-500);margin-top:0.5rem">... et ' + (rows.length - 5) + ' autres lignes</p>'
      html += '</div></div>'

      html += '<div style="display:flex;gap:0.75rem;margin-top:1rem">'
      html += '<button class="btn btn--primary" id="btn-import">Importer ' + rows.length + ' lignes</button>'
      html += '<button class="btn" id="btn-csv-reset">Annuler</button>'
      html += '</div>'
    }

    previewEl.innerHTML = html

    // Import button
    var importBtn = document.getElementById('btn-import')
    if (importBtn) {
      importBtn.addEventListener('click', async function () {
        importBtn.disabled = true
        importBtn.textContent = 'Import en cours\u2026'

        var resultEl = document.getElementById('csv-result')
        var inserted = 0
        var importErrors = []

        for (var i = 0; i < rows.length; i += 100) {
          var batch = rows.slice(i, i + 100)
          var res = await supabaseClient.from('representations').insert(batch).select()
          if (res.error) {
            importErrors.push('Batch ' + (Math.floor(i / 100) + 1) + ': ' + res.error.message)
          } else {
            inserted += (res.data || []).length
          }
        }

        var rhtml = '<div class="form-message ' + (importErrors.length > 0 ? 'form-message--error' : 'form-message--success') + '" style="margin-top:1rem">'
        rhtml += '<p style="font-weight:500">' + inserted + ' ligne(s) import\u00e9e(s)</p>'
        if (importErrors.length > 0) {
          rhtml += '<ul style="font-size:0.875rem;list-style:disc;padding-left:1.5rem;margin-top:0.5rem">'
          importErrors.forEach(function (err) { rhtml += '<li>' + escapeHtml(err) + '</li>' })
          rhtml += '</ul>'
        }
        rhtml += '</div>'
        resultEl.innerHTML = rhtml
        previewEl.innerHTML = ''
        document.getElementById('csv-file').value = ''
      })
    }

    // Reset button
    var resetBtn = document.getElementById('btn-csv-reset')
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        previewEl.innerHTML = ''
        document.getElementById('csv-file').value = ''
        document.getElementById('csv-result').innerHTML = ''
      })
    }
  }

  function normalizeGenre(value) {
    if (!value) return null
    var v = value.toLowerCase().trim()
    if (v === 'comedie' || v === 'drame' || v === 'autre') return v
    if (v.includes('com')) return 'comedie'
    if (v.includes('dram') || v.includes('trag')) return 'drame'
    if (v.includes('jeune public') || v.includes('experimental') || v.includes('exp\u00e9rimental') || v.includes('inclassable')) return 'autre'
    return null
  }

  function normalizeStyle(value) {
    if (!value) return null
    var v = value.toLowerCase().trim()
    if (v === 'classique' || v === 'contemporain') return v
    if (v.includes('class')) return 'classique'
    if (v.includes('contemp') || v.includes('moderne') || v.includes('creation') || v.includes('cr\u00e9ation')) return 'contemporain'
    return null
  }

  // ===============================================================
  //  TAB: SAISIE MANUELLE
  // ===============================================================
  function renderManualTab() {
    var html = '<form id="manual-form">'
    html += '<div id="manual-message"></div>'

    html += '<div class="form-row">'
    html += '<div class="form-group"><label for="m-date" class="form-label">Date *</label>'
    html += '<input type="date" id="m-date" name="date" required class="form-input"></div>'
    html += '<div class="form-group"><label for="m-heure" class="form-label">Heure</label>'
    html += '<input type="time" id="m-heure" name="heure" class="form-input"></div>'
    html += '</div>'

    html += '<div class="form-group"><label for="m-titre" class="form-label">Titre de la pi\u00e8ce *</label>'
    html += '<input type="text" id="m-titre" name="titre" required class="form-input"></div>'

    html += '<div class="form-row">'
    html += '<div class="form-group"><label for="m-theatre" class="form-label">Nom du th\u00e9\u00e2tre *</label>'
    html += '<input type="text" id="m-theatre" name="theatre_nom" required class="form-input"></div>'
    html += '<div class="form-group"><label for="m-adresse" class="form-label">Adresse du th\u00e9\u00e2tre</label>'
    html += '<input type="text" id="m-adresse" name="theatre_adresse" class="form-input"></div>'
    html += '</div>'

    html += '<div class="form-group"><label for="m-url" class="form-label">URL (billetterie)</label>'
    html += '<input type="url" id="m-url" name="url" placeholder="https://..." class="form-input"></div>'

    html += '<div class="form-group"><label for="m-description" class="form-label">Description (mini-pitch)</label>'
    html += '<textarea id="m-description" name="description" maxlength="300" rows="4" placeholder="2\u20133 phrases (max 300 caract\u00e8res)" class="form-input form-textarea"></textarea>'
    html += '<p class="form-hint">Max 300 caract\u00e8res. Laisse vide si tu ne sais pas.</p></div>'

    html += '<div class="form-row">'
    html += '<div class="form-group"><label for="m-genre" class="form-label">Genre</label>'
    html += '<select id="m-genre" name="genre" class="form-select">'
    html += '<option value="">Non sp\u00e9cifi\u00e9</option><option value="comedie">Com\u00e9die</option><option value="drame">Drame</option><option value="autre">Autre</option>'
    html += '</select></div>'
    html += '<div class="form-group"><label for="m-style" class="form-label">Style</label>'
    html += '<select id="m-style" name="style" class="form-select">'
    html += '<option value="">Non sp\u00e9cifi\u00e9</option><option value="classique">Classique</option><option value="contemporain">Contemporain</option>'
    html += '</select></div>'
    html += '</div>'

    html += '<button type="submit" id="btn-manual-submit" class="btn btn--primary btn--full">Ajouter la repr\u00e9sentation</button>'
    html += '</form>'

    contentEl.innerHTML = html

    document.getElementById('manual-form').addEventListener('submit', async function (e) {
      e.preventDefault()
      var btn = document.getElementById('btn-manual-submit')
      var msgEl = document.getElementById('manual-message')
      btn.disabled = true
      btn.textContent = 'Ajout en cours\u2026'
      msgEl.innerHTML = ''

      var rep = {
        date: document.getElementById('m-date').value,
        heure: document.getElementById('m-heure').value || null,
        titre: document.getElementById('m-titre').value,
        theatre_nom: document.getElementById('m-theatre').value,
        theatre_adresse: document.getElementById('m-adresse').value || null,
        url: document.getElementById('m-url').value || null,
        genre: document.getElementById('m-genre').value || null,
        style: document.getElementById('m-style').value || null,
        description: document.getElementById('m-description').value || null,
        image_url: null,
      }

      try {
        var res = await supabaseClient.from('representations').insert(rep)
        if (res.error) throw new Error(res.error.message)

        msgEl.innerHTML = '<div class="form-message form-message--success">Repr\u00e9sentation ajout\u00e9e</div>'

        // Keep date and theatre for convenience
        var keepDate = rep.date
        var keepTheatre = rep.theatre_nom
        var keepAdresse = rep.theatre_adresse

        document.getElementById('m-titre').value = ''
        document.getElementById('m-heure').value = ''
        document.getElementById('m-url').value = ''
        document.getElementById('m-description').value = ''
        document.getElementById('m-genre').value = ''
        document.getElementById('m-style').value = ''
      } catch (err) {
        msgEl.innerHTML = '<div class="form-message form-message--error">' + escapeHtml(err.message) + '</div>'
      } finally {
        btn.disabled = false
        btn.textContent = 'Ajouter la repr\u00e9sentation'
      }
    })
  }

  // ===============================================================
  //  TAB: A COMPLETER (Images + Descriptions)
  // ===============================================================
  async function renderTodoTab() {
    try {
      var results = await Promise.all([
        fetchMissingImages(),
        fetchMissingDescriptions(),
      ])

      var imageItems = results[0]
      var descItems = results[1]

      var imageShows = groupShowKeys(imageItems)
      var descShows = groupShowKeys(descItems)

      var html = ''

      // --- Images ---
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Images \u00e0 compl\u00e9ter</h2>'
      html += '<p class="section-subtitle">Colle une URL d\'affiche (ex: og:image) et on l\'applique \u00e0 toutes les dates du m\u00eame spectacle.</p></div>'
      html += '<div style="display:flex;gap:0.5rem">'
      html += '<button class="btn" id="btn-export-images"' + (imageShows.length === 0 ? ' disabled' : '') + '>Export CSV</button>'
      html += '<button class="btn" onclick="document.querySelector(\'[data-tab=todo]\').click()">Rafra\u00eechir</button>'
      html += '</div></div>'

      if (imageShows.length === 0) {
        html += '<div style="font-size:0.875rem;color:var(--color-gray-500);margin-bottom:2rem">Rien \u00e0 compl\u00e9ter</div>'
      } else {
        imageShows.forEach(function (s) {
          html += '<div class="todo-item">'
          html += '<div class="todo-item-header">'
          html += '<div style="min-width:0"><div class="todo-item-theatre">' + escapeHtml(s.theatre_nom) + '</div>'
          html += '<div class="todo-item-title">' + escapeHtml(s.titre) + '</div>'
          html += '<div class="todo-item-meta">' + s.count + ' repr\u00e9sentation(s) \u2022 ex: ' + s.sampleDates.join(', ') + '</div>'
          if (s.source_url) {
            html += '<div><a href="' + escapeHtml(s.source_url) + '" target="_blank" rel="noreferrer" class="todo-link">Page source</a></div>'
          }
          html += '</div>'
          html += '<div class="todo-item-actions">'
          html += '<input type="url" class="todo-url-input" placeholder="https://.../affiche.jpg" data-img-key="' + escapeHtml(s.key) + '" data-theatre="' + escapeHtml(s.theatre_nom) + '" data-titre="' + escapeHtml(s.titre) + '" data-source-url="' + escapeHtml(s.source_url || '') + '">'
          html += '<button class="btn btn--primary" data-apply-img="' + escapeHtml(s.key) + '">Appliquer</button>'
          html += '</div></div></div>'
        })
        html += '<div style="font-size:0.75rem;color:var(--color-gray-500);margin-bottom:2rem">Astuce: r\u00e9cup\u00e9rer l\'image via &lt;meta property="og:image"&gt; sur la page source.</div>'
      }

      // --- Descriptions ---
      html += '<div class="section-divider">'
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Descriptions \u00e0 compl\u00e9ter</h2>'
      html += '<p class="section-subtitle">Export CSV pour mission agent (remplir une colonne description).</p></div>'
      html += '<button class="btn" id="btn-export-desc"' + (descShows.length === 0 ? ' disabled' : '') + '>Export CSV</button>'
      html += '</div>'

      if (descShows.length === 0) {
        html += '<div style="font-size:0.875rem;color:var(--color-gray-500)">Rien \u00e0 compl\u00e9ter</div>'
      } else {
        descShows.slice(0, 30).forEach(function (s) {
          html += '<div class="list-item">'
          html += '<div style="min-width:0"><div class="list-item-sub">' + escapeHtml(s.theatre_nom) + '</div>'
          html += '<div class="list-item-title">' + escapeHtml(s.titre) + '</div>'
          html += '<div class="list-item-meta">' + s.count + ' repr\u00e9sentation(s) \u2022 ex: ' + s.sampleDates.join(', ') + '</div>'
          html += '</div></div>'
        })
        if (descShows.length > 30) {
          html += '<div style="font-size:0.75rem;color:var(--color-gray-500)">Affichage limit\u00e9 \u00e0 30, export CSV pour la liste compl\u00e8te.</div>'
        }
      }
      html += '</div>'

      contentEl.innerHTML = html

      // --- Event: apply image ---
      contentEl.querySelectorAll('[data-apply-img]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var key = btn.dataset.applyImg
          var input = contentEl.querySelector('[data-img-key="' + CSS.escape(key) + '"]')
          var imageUrl = (input.value || '').trim()
          if (!imageUrl) return

          btn.disabled = true
          btn.textContent = 'OK\u2026'

          try {
            var sourceUrl = input.dataset.sourceUrl
            var query = supabaseClient.from('representations').update({ image_url: imageUrl })

            if (sourceUrl) {
              query = query.eq('source_url', sourceUrl)
            } else {
              query = query.eq('theatre_nom', input.dataset.theatre).eq('titre', input.dataset.titre)
            }

            var res = await query
            if (res.error) throw new Error(res.error.message)

            renderTodoTab()
          } catch (e) {
            alert('Erreur: ' + e.message)
            btn.disabled = false
            btn.textContent = 'Appliquer'
          }
        })
      })

      // --- Event: export images CSV ---
      var exportImgBtn = document.getElementById('btn-export-images')
      if (exportImgBtn) {
        exportImgBtn.addEventListener('click', function () {
          exportCsv('images-a-completer.csv', ['source_url', 'theatre_nom', 'titre', 'image_url'], imageShows)
        })
      }

      // --- Event: export descriptions CSV ---
      var exportDescBtn = document.getElementById('btn-export-desc')
      if (exportDescBtn) {
        exportDescBtn.addEventListener('click', function () {
          exportCsv('descriptions-a-completer.csv', ['source_url', 'theatre_nom', 'titre', 'description'], descShows)
        })
      }

    } catch (err) {
      contentEl.innerHTML = showError(err.message)
    }
  }

  // ===============================================================
  //  TAB: CLASSEMENT
  // ===============================================================

  async function renderClassementTab() {
    try {
      // Only fetch the lightweight theatre_rang table (max ~65 rows)
      // No need to scan the full representations table here
      var rankingRows = await fetchRanking()

      // Build ranked set for quick lookup
      var rankMap = new Map()
      rankingRows.forEach(function (r) { rankMap.set(r.theatre_nom, r.rang) })

      // Build the merged ordered list
      var ranked = rankingRows.slice().sort(function (a, b) { return a.rang - b.rang })
      var orderedList = ranked.map(function (r) { return r.theatre_nom })

      // Add THEATRES_CIBLE not yet ranked
      THEATRES_CIBLE.forEach(function (name) {
        if (!rankMap.has(name) && orderedList.indexOf(name) === -1) {
          orderedList.push(name)
        }
      })

      // --- Build HTML ---
      var html = ''

      // Header
      html += '<div class="section-header">'
      html += '<div><h2 class="section-title">Classement des th\u00e9\u00e2tres</h2>'
      html += '<p class="section-subtitle">Rang 1 = affich\u00e9 en premier sur le site. Utilisez les fl\u00e8ches pour r\u00e9ordonner, puis enregistrez.</p></div>'
      html += '<div style="display:flex;gap:0.5rem">'
      html += '<button class="btn" id="btn-init-classement">R\u00e9initialiser</button>'
      html += '<button class="btn btn--primary" id="btn-save-classement">Enregistrer</button>'
      html += '</div></div>'

      // Count
      html += '<div style="font-size:0.75rem;color:var(--color-gray-500);margin-bottom:0.75rem">'
      html += orderedList.length + ' th\u00e9\u00e2tre(s) au total'
      html += '</div>'

      // List
      html += '<div class="classement-list" id="classement-list">'
      html += buildClassementRows(orderedList)
      html += '</div>'

      contentEl.innerHTML = html

      // --- Event: arrow clicks (delegation) ---
      var listEl = document.getElementById('classement-list')
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.classement-arrow')
        if (!btn || btn.disabled) return

        var row = btn.closest('.classement-row')
        var idx = parseInt(row.dataset.index, 10)
        var dir = btn.dataset.dir

        if (dir === 'up' && idx > 0) {
          var tmp = orderedList[idx]
          orderedList[idx] = orderedList[idx - 1]
          orderedList[idx - 1] = tmp
        } else if (dir === 'down' && idx < orderedList.length - 1) {
          var tmp = orderedList[idx]
          orderedList[idx] = orderedList[idx + 1]
          orderedList[idx + 1] = tmp
        }

        listEl.innerHTML = buildClassementRows(orderedList)
      })

      // --- Event: dropdown change (jump to position) ---
      listEl.addEventListener('change', function (e) {
        var select = e.target.closest('.classement-select')
        if (!select) return

        var row = select.closest('.classement-row')
        var fromIdx = parseInt(row.dataset.index, 10)
        var toPos = parseInt(select.value, 10)
        if (!Number.isFinite(toPos)) return

        var toIdx = Math.min(Math.max(toPos - 1, 0), orderedList.length - 1)
        if (fromIdx === toIdx) return

        var item = orderedList.splice(fromIdx, 1)[0]
        orderedList.splice(toIdx, 0, item)

        listEl.innerHTML = buildClassementRows(orderedList)
      })

      // --- Event: save ---
      document.getElementById('btn-save-classement').addEventListener('click', async function () {
        var btn = this
        btn.disabled = true
        btn.textContent = 'Enregistrement\u2026'

        try {
          var rows = orderedList.map(function (name, i) {
            return { theatre_nom: name, rang: i + 1, updated_at: new Date().toISOString() }
          })

          // Upsert in batches of 50
          for (var i = 0; i < rows.length; i += 50) {
            var batch = rows.slice(i, i + 50)
            var res = await supabaseClient
              .from('theatre_rang')
              .upsert(batch, { onConflict: 'theatre_nom' })
            if (res.error) throw new Error(res.error.message)
          }

          btn.textContent = 'Enregistr\u00e9 \u2713'
          setTimeout(function () {
            btn.disabled = false
            btn.textContent = 'Enregistrer'
          }, 1500)
        } catch (err) {
          alert('Erreur: ' + err.message)
          btn.disabled = false
          btn.textContent = 'Enregistrer'
        }
      })

      // --- Event: reset ---
      document.getElementById('btn-init-classement').addEventListener('click', function () {
        if (!confirm('R\u00e9initialiser le classement \u00e9ditorial par d\u00e9faut ? Les modifications non enregistr\u00e9es seront perdues.')) return

        orderedList.length = 0
        THEATRES_CIBLE.forEach(function (n) { orderedList.push(n) })

        listEl.innerHTML = buildClassementRows(orderedList)
      })

    } catch (err) {
      contentEl.innerHTML = showError(err.message)
    }
  }

  function buildClassementRows(orderedList) {
    var html = ''
    for (var i = 0; i < orderedList.length; i++) {
      var name = orderedList[i]
      var rank = i + 1
      html += '<div class="classement-row" data-index="' + i + '">'
      html += '<span class="classement-rank">' + rank + '</span>'
      html += '<span class="classement-name">' + escapeHtml(name) + '</span>'
      html += '<div class="classement-actions">'
      html += '<select class="classement-select" aria-label="Position">'
      for (var p = 1; p <= orderedList.length; p++) {
        html += '<option value="' + p + '"' + (p === rank ? ' selected' : '') + '>' + p + '</option>'
      }
      html += '</select>'
      html += '<button class="classement-arrow" data-dir="up"' + (i === 0 ? ' disabled' : '') + '>&#9650;</button>'
      html += '<button class="classement-arrow" data-dir="down"' + (i === orderedList.length - 1 ? ' disabled' : '') + '>&#9660;</button>'
      html += '</div></div>'
    }
    return html
  }

  function groupShowKeys(items) {
    var map = new Map()
    items.forEach(function (r) {
      var k = r.source_url || (r.theatre_nom + '||' + r.titre)
      var prev = map.get(k)
      if (!prev) {
        map.set(k, { key: k, theatre_nom: r.theatre_nom, titre: r.titre, source_url: r.source_url || null, count: 1, sampleDates: [r.date] })
      } else {
        prev.count += 1
        if (prev.sampleDates.length < 3 && prev.sampleDates.indexOf(r.date) === -1) {
          prev.sampleDates.push(r.date)
        }
      }
    })
    return Array.from(map.values()).sort(function (a, b) { return b.count - a.count })
  }

  function exportCsv(filename, headers, shows) {
    var esc = function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"' }
    var rows = shows.map(function (s) {
      return [esc(s.source_url), esc(s.theatre_nom), esc(s.titre), esc('')].join(',')
    })
    var blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ---------------------------------------------------------------
  //  SUPABASE QUERIES
  // ---------------------------------------------------------------

  function normTheatreName(s) {
    return String(s || '')
      .toLowerCase()
      // unify apostrophes
      .replace(/[’‘`´]/g, "'")
      // remove diacritics
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      // remove punctuation / spaces
      .replace(/[^a-z0-9]+/g, '')
      .trim()
  }

  async function getDistinctTheatresVisibleSeason() {
    // IMPORTANT:
    // Admin stats should be computed on what the public site would show,
    // but on the season window (Jan 1 → Jun 30):
    // - MIN_DATE..MAX_DATE
    // - is_theatre=true
    // - hidden_at IS NULL
    // - ignore performances strictly before 13:00 (school time)

    var res = await supabaseClient
      .from('representations')
      .select('theatre_nom,heure,date')
      .gte('date', MIN_DATE)
      .lte('date', MAX_DATE)
      .eq('is_theatre', true)
      .is('hidden_at', null)

    if (res.error) throw new Error(res.error.message)

    var set = new Map() // norm -> canonical (first seen)
    ;(res.data || []).forEach(function (row) {
      if (!row || !row.theatre_nom) return
      // Match the public site policy: ignore performances strictly before 13:00 (school time)
      if (row.heure && String(row.heure) < '13:00:00') return
      var k = normTheatreName(row.theatre_nom)
      if (!k) return
      if (!set.has(k)) set.set(k, row.theatre_nom)
    })

    return Array.from(set.values()).sort(function (a, b) { return a.localeCompare(b, 'fr') })
  }

  async function getLatestRepresentations(limit) {
    var res = await supabaseClient.from('representations').select('*').order('created_at', { ascending: false }).limit(limit)
    if (res.error) throw new Error(res.error.message)
    return res.data || []
  }

  async function getSourceStatuses() {
    var res = await supabaseClient.from('representations').select('source,created_at,theatre_nom').not('source', 'is', null).order('created_at', { ascending: false })
    if (res.error) throw new Error(res.error.message)

    var map = new Map()
    ;(res.data || []).forEach(function (row) {
      var prev = map.get(row.source)
      if (!prev) {
        map.set(row.source, { source: row.source, count: 1, lastCreatedAt: row.created_at, theatreNom: row.theatre_nom })
      } else {
        prev.count += 1
      }
    })
    return Array.from(map.values()).sort(function (a, b) { return a.source.localeCompare(b.source, 'fr') })
  }

  async function getTotalCountVisibleSeason() {
    var res = await supabaseClient
      .from('representations')
      .select('*', { count: 'exact', head: true })
      .gte('date', MIN_DATE)
      .lte('date', MAX_DATE)
      .eq('is_theatre', true)
      .is('hidden_at', null)
      .or('heure.is.null,heure.gte.13:00:00')

    if (res.error) throw new Error(res.error.message)
    return res.count || 0
  }

  async function getMissingFieldsStats() {
    var fields = [
      { field: 'heure', label: 'Heure' },
      { field: 'description', label: 'Description' },
      { field: 'image_url', label: 'Image' },
      { field: 'genre', label: 'Genre' },
      { field: 'style', label: 'Style' },
      { field: 'url', label: 'URL de r\u00e9servation' },
    ]
    var results = []
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      var res = await supabaseClient.from('representations').select('*', { count: 'exact', head: true }).or(f.field + '.is.null,' + f.field + '.eq.')
      if (res.error) throw new Error(res.error.message)
      results.push({ field: f.field, label: f.label, count: res.count || 0 })
    }
    return results
  }

  async function getDuplicates() {
    var res = await supabaseClient.from('representations').select('id,titre,theatre_nom,date,heure').order('theatre_nom').order('titre').order('date')
    if (res.error) throw new Error(res.error.message)

    var map = new Map()
    ;(res.data || []).forEach(function (row) {
      var key = row.theatre_nom + '||' + row.titre + '||' + row.date + '||' + (row.heure || '')
      var prev = map.get(key)
      if (!prev) {
        map.set(key, { ids: [row.id], row: row })
      } else {
        prev.ids.push(row.id)
      }
    })

    return Array.from(map.values())
      .filter(function (v) { return v.ids.length > 1 })
      .map(function (v) {
        return { titre: v.row.titre, theatre_nom: v.row.theatre_nom, date: v.row.date, heure: v.row.heure, count: v.ids.length, ids: v.ids }
      })
      .sort(function (a, b) { return b.count - a.count })
  }

  async function getPastShowsCount() {
    var today = toDateString(new Date())
    var res = await supabaseClient.from('representations').select('*', { count: 'exact', head: true }).lt('date', today)
    if (res.error) throw new Error(res.error.message)
    return res.count || 0
  }

  async function getStatsData() {
    var allData = []
    var from = 0
    var pageSize = 1000

    while (true) {
      var res = await supabaseClient.from('representations').select('date,theatre_nom,genre').range(from, from + pageSize - 1)
      if (res.error) throw new Error(res.error.message)
      if (!res.data || res.data.length === 0) break
      allData = allData.concat(res.data)
      if (res.data.length < pageSize) break
      from += pageSize
    }
    return allData
  }

  async function fetchMissingImages() {
    var res = await supabaseClient.from('representations')
      .select('id,date,titre,theatre_nom,source_url,image_url')
      .or('image_url.is.null,image_url.eq.')
      .order('theatre_nom', { ascending: true })
      .order('titre', { ascending: true })
      .order('date', { ascending: true })
      .limit(2000)
    if (res.error) throw new Error(res.error.message)
    return res.data || []
  }

  async function fetchRanking() {
    try {
      var res = await supabaseClient
        .from('theatre_rang')
        .select('theatre_nom, rang')
        .order('rang', { ascending: true })
      if (res.error) {
        console.warn('theatre_rang:', res.error.message)
        return []
      }
      return res.data || []
    } catch (e) {
      console.warn('theatre_rang fetch failed:', e.message)
      return []
    }
  }

  async function fetchMissingDescriptions() {
    var res = await supabaseClient.from('representations')
      .select('id,date,titre,theatre_nom,source_url,description')
      .or('description.is.null,description.eq.')
      .order('theatre_nom', { ascending: true })
      .order('titre', { ascending: true })
      .order('date', { ascending: true })
      .limit(2000)
    if (res.error) throw new Error(res.error.message)
    return res.data || []
  }

  // ---------------------------------------------------------------
  //  HELPERS
  // ---------------------------------------------------------------

  function kpiCard(label, value, sub, subClass) {
    var html = '<div class="kpi-card">'
    html += '<div class="kpi-label">' + escapeHtml(label) + '</div>'
    html += '<div class="kpi-value">' + escapeHtml(String(value)) + '</div>'
    if (sub) html += '<div class="kpi-sub ' + (subClass || '') + '">' + escapeHtml(sub) + '</div>'
    html += '</div>'
    return html
  }

})()
