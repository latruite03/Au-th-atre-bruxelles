-- ============================================================
-- Migration : table signalements
-- Permet aux visiteurs de soumettre un spectacle via le
-- formulaire /soumettre.html sans authentification.
-- ============================================================
-- Exécuter dans Supabase > SQL Editor > New Query

CREATE TABLE signalements (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre           TEXT NOT NULL,
  lieu            TEXT NOT NULL,
  adresse         TEXT NOT NULL,
  dates           TEXT NOT NULL,
  heure           TEXT,
  lien            TEXT NOT NULL,
  contact_nom     TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  message         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour trier par date de soumission
CREATE INDEX idx_signalements_created_at ON signalements(created_at DESC);

-- RLS : lecture réservée aux utilisateurs authentifiés (admins)
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture admin des signalements"
ON signalements FOR SELECT
TO authenticated
USING (true);

-- INSERT public : n'importe quel visiteur peut soumettre
CREATE POLICY "Soumission publique"
ON signalements FOR INSERT
TO anon
WITH CHECK (true);
