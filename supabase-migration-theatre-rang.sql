-- ============================================
-- Migration : Table theatre_rang (classement éditorial)
-- ============================================
-- Copier ce fichier dans Supabase > SQL Editor > New Query
-- Puis exécuter

-- 1. Création de la table theatre_rang
CREATE TABLE theatre_rang (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  theatre_nom TEXT NOT NULL UNIQUE,
  rang INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index pour optimiser le tri par rang
CREATE INDEX idx_theatre_rang_rang ON theatre_rang(rang);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE theatre_rang ENABLE ROW LEVEL SECURITY;

-- 4. Politique SELECT : lecture publique pour tous
CREATE POLICY "Lecture publique du classement"
ON theatre_rang FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Politique INSERT : uniquement utilisateurs authentifiés
CREATE POLICY "Insertion classement par utilisateurs authentifies"
ON theatre_rang FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Politique UPDATE : uniquement utilisateurs authentifiés
CREATE POLICY "Modification classement par utilisateurs authentifies"
ON theatre_rang FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Politique DELETE : uniquement utilisateurs authentifiés
CREATE POLICY "Suppression classement par utilisateurs authentifies"
ON theatre_rang FOR DELETE
TO authenticated
USING (true);
