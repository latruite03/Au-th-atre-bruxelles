-- ============================================
-- Théâtre Bruxelles - Configuration Supabase
-- ============================================
-- Copier ce fichier dans Supabase > SQL Editor > New Query
-- Puis exécuter

-- 1. Création de la table representations
CREATE TABLE representations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date DATE NOT NULL,
  heure TIME,                    -- nullable = "heure à confirmer"
  titre TEXT NOT NULL,
  theatre_nom TEXT NOT NULL,
  theatre_adresse TEXT,
  url TEXT,
  genre TEXT CHECK (genre IN ('comedie', 'drame', 'autre')),
  style TEXT CHECK (style IN ('classique', 'contemporain')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index pour optimiser les requêtes par date
CREATE INDEX idx_representations_date ON representations(date);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE representations ENABLE ROW LEVEL SECURITY;

-- 4. Politique SELECT: lecture publique pour tous
CREATE POLICY "Lecture publique des representations"
ON representations FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Politique INSERT: uniquement utilisateurs authentifiés
CREATE POLICY "Insertion par utilisateurs authentifies"
ON representations FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Politique UPDATE: uniquement utilisateurs authentifiés
CREATE POLICY "Modification par utilisateurs authentifies"
ON representations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Politique DELETE: uniquement utilisateurs authentifiés
CREATE POLICY "Suppression par utilisateurs authentifies"
ON representations FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- FIN DE LA CONFIGURATION
-- ============================================
-- Après exécution:
-- 1. Allez dans Authentication > Users > Invite user
-- 2. Créez un compte admin avec email/password
-- 3. Copiez les clés API depuis Settings > API
