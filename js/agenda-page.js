/* ============================================================
   Agenda page bootstrap (reads /agenda/YYYY-MM-DD)
   ============================================================ */

;(function () {
  'use strict'

  var dateStr = getDateFromPath()
  if (!dateStr) {
    try {
      var params = new URLSearchParams(window.location.search)
      var q = params.get('date')
      if (/^\d{4}-\d{2}-\d{2}$/.test(q || '')) dateStr = q
    } catch (e) {}
  }

  if (dateStr) {
    window.AGENDA_DATE = dateStr
  }
})()
