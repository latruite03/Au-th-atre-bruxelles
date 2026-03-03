/* ============================================================
   Configuration Supabase
   ============================================================
   Remplacez les valeurs ci-dessous par vos credentials Supabase.
   La cle anon est une cle publique securisee par les Row Level
   Security policies de votre base de donnees.
   ============================================================ */

const SUPABASE_URL = 'https://orcuuknomvpzduiyrfpw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY3V1a25vbXZwemR1aXlyZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzgzMTEsImV4cCI6MjA4NTI1NDMxMX0.XysFZ7h5aXciGjLlgoQ5pPxAb7NJhiCeDOZOX-f60YM'

// Client Supabase global (utilise par toutes les pages)
// Le script supabase-js doit etre charge avant ce fichier
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ============================================================
   Analytics (Umami)
   ============================================================ */
;(function injectUmami() {
  try {
    // Avoid double-inject
    if (document.querySelector('script[data-website-id="e0bd5182-608e-4ec4-a1bd-2485bd85bf6a"]')) return

    var s = document.createElement('script')
    s.defer = true
    s.src = 'https://cloud.umami.is/script.js'
    s.setAttribute('data-website-id', 'e0bd5182-608e-4ec4-a1bd-2485bd85bf6a')
    document.head.appendChild(s)
  } catch (e) {
    // no-op
  }
})()
