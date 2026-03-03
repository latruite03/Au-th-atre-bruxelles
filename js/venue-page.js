/* ============================================================
   Lieu page bootstrap (reads /lieu/<slug>/)
   ============================================================ */

;(function () {
  'use strict'
  var segs = getPathSegments()
  if (segs[0] === 'lieu' && segs[1]) {
    window.VENUE_SLUG = segs[1]
  }
})()
