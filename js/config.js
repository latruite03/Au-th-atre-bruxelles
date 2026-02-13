/* ============================================================
   Configuration Supabase
   ============================================================
   Remplacez les valeurs ci-dessous par vos credentials Supabase.
   La cle anon est une cle publique securisee par les Row Level
   Security policies de votre base de donnees.
   ============================================================ */

const SUPABASE_URL = 'https://orcuuknomvpzduiyrfpw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_NkKpX5JgIFFqWk9D3R8VlQ_wgeJ8x_l'

// Client Supabase global (utilise par toutes les pages)
// Le script supabase-js doit etre charge avant ce fichier
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
