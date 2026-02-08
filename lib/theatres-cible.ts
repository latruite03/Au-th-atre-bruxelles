/**
 * Liste des 63 theatres cibles pour l'agenda bruxellois.
 * Source : lieux_theatre_bruxelles_2026.csv
 *
 * Les noms ci-dessous correspondent aux noms « officiels » de la liste.
 * Le matching avec la base se fait en mode fuzzy (includes, case-insensitive)
 * pour absorber les petites differences avec les theatre_nom du pipeline
 * (ex. "Théâtre de Poche" <-> "Théâtre de Poche Bruxelles").
 */
export const THEATRES_CIBLE: string[] = [
  // --- Anderlecht (1070) ---
  'Auditorium Jacques Brel (CERIA)',
  'Au B\'Izou',
  'Escale du Nord',
  'Zinnema',

  // --- Auderghem (1160) ---
  'Centre culturel d\'Auderghem (CCA)',

  // --- Berchem-Sainte-Agathe (1082) ---
  'Archipel 19 – Le Fourquet',

  // --- Bruxelles-Ville (1000) ---
  'Théâtre National Wallonie-Bruxelles',
  'KVS (Koninklijke Vlaamse Schouwburg)',
  'Théâtre Royal du Parc',
  'Théâtre Royal des Galeries',
  'Théâtre des Martyrs',
  'Théâtre Royal de Toone',
  'Théâtre de Poche',
  'Théâtre Les Tanneurs',
  'Les Riches-Claires',
  'Beursschouwburg',
  'Kaaitheater',
  'Cirque Royal',
  'BRONKS',
  'La Montagne Magique',
  'Le Jardin de ma Sœur',

  // --- Etterbeek (1040) ---
  'Atelier 210',
  'Espace Senghor',
  'Théâtre Saint-Michel',

  // --- Evere (1140) ---
  'L\'Entrela\'',

  // --- Forest (1190) ---
  'Au Dé à Coudre',
  'BRASS',
  'Théâtre L\'Improviste',

  // --- Ganshoren (1083) ---
  'La Villa',

  // --- Ixelles (1050) ---
  'Le Boson',
  'La Clarencière',
  'Théâtre Marni',
  'Le Rideau',
  'Théâtre de la Toison d\'Or',
  'Théâtre Mercelis',
  'Théâtre Varia',

  // --- Jette (1090) ---
  'Centre culturel de Jette (L\'Armillaire)',
  'PLOEF!',

  // --- Koekelberg (1081) ---
  'Archipel 19 – Maison Stepman',
  'Koek\'s Théâtre',

  // --- Molenbeek-Saint-Jean (1080) ---
  'Le Café de la Rue',
  'L\'Épicerie (Ras El Hanout)',
  'Maison des Cultures et de la Cohésion Sociale',

  // --- Saint-Gilles (1060) ---
  'Cellule 133a',
  'Centre culturel Jacques Franck',
  'Maison Poème',

  // --- Saint-Josse-ten-Noode (1210) ---
  'Atelier Théâtre de la Vie',
  'Théâtre Le Public',

  // --- Schaerbeek (1030) ---
  'Centre Culturel de Schaerbeek',
  'Halles de Schaerbeek',
  'GC De Kriekelaar',
  'Magic Land Théâtre',
  'L\'Os à Moelle',
  'Théâtre 140',
  'Théâtre de la Balsamine',
  'Théâtre Océan Nord',

  // --- Uccle (1180) ---
  'Centre Culturel d\'Uccle',
  'Côté Village',

  // --- Watermael-Boitsfort (1170) ---
  'La Vénerie',

  // --- Woluwe-Saint-Lambert (1200) ---
  'Wolubilis',

  // --- Woluwe-Saint-Pierre (1150) ---
  'W:Halll',
  'Comédie Claude Volter',
  'Théâtre de Joli-Bois',
]
