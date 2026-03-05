/* ============================================================
   Lieux — mapping theatre_nom -> slug + URL officielle
   ============================================================ */

// NOTE: theatre_nom doit matcher EXACTEMENT Supabase (representations.theatre_nom)
// Si un nom change côté pipeline, mettre à jour ici.

window.THEATRES_INFO = [
  {
    theatre_nom: 'Théâtre de la Vie',
    slug: 'theatre-de-la-vie',
    official_url: 'https://theatredelavie.be',
  },
  {
    theatre_nom: 'Le Rideau',
    slug: 'le-rideau',
    official_url: 'https://lerideau.brussels',
  },
  {
    theatre_nom: 'Théâtre Les Tanneurs',
    slug: 'les-tanneurs',
    official_url: 'https://lestanneurs.be',
  },
  {
    theatre_nom: 'Théâtre de Poche',
    slug: 'theatre-de-poche',
    official_url: 'https://poche.be',
  },
  {
    theatre_nom: 'Studio Varia',
    slug: 'studio-varia',
    official_url: 'https://varia.be',
  },
  {
    theatre_nom: 'Théâtre Mercelis',
    slug: 'theatre-mercelis',
    official_url: 'https://culture.ixelles.be/fr/mercelis/',
  },
  {
    theatre_nom: 'Les Riches-Claires',
    slug: 'les-riches-claires',
    official_url: 'https://lesrichesclaires.be',
  },
  {
    theatre_nom: 'Atelier 210',
    slug: 'atelier-210',
    official_url: 'https://atelier210.be',
  },
  {
    theatre_nom: 'La Bellone',
    slug: 'la-bellone',
    official_url: 'https://bellone.be',
  },
  {
    theatre_nom: 'Théâtre Océan Nord',
    slug: 'theatre-ocean-nord',
    official_url: 'https://www.oceannord.org',
  },
  {
    theatre_nom: 'Théâtre la Balsamine',
    slug: 'theatre-la-balsamine',
    official_url: 'https://balsamine.be',
  },
  {
    theatre_nom: 'Le 140',
    slug: 'le-140',
    official_url: 'https://www.le140.be/qui-sommes-nous/',
    aliases: ['Théâtre 140'],
  },
  {
    theatre_nom: 'Le Marni',
    slug: 'le-marni',
    official_url: 'https://theatremarni.com/LE-MARNI',
  },
  {
    theatre_nom: 'La Vénerie',
    slug: 'la-venerie',
    official_url: 'https://www.lavenerie.be/',
  },

  // --- Ajouts (lieux prioritaires avec représentations) ---
  {
    theatre_nom: 'Maison de la Création - Bockstael',
    slug: 'maison-de-la-creation-bockstael',
    official_url: '',
  },
  {
    theatre_nom: 'Maison de la Création - Cité Modèle',
    slug: 'maison-de-la-creation-cite-modele',
    official_url: '',
  },
  {
    theatre_nom: 'Maison de la Création - Gare',
    slug: 'maison-de-la-creation-gare',
    official_url: '',
  },
  {
    theatre_nom: "Au B'Izou",
    slug: 'au-bizou',
    official_url: '',
  },
  {
    theatre_nom: 'La Clarencière',
    slug: 'la-clarenciere',
    official_url: '',
  },
  {
    theatre_nom: 'Comédie Royale Claude Volter',
    slug: 'comedie-royale-claude-volter',
    official_url: '',
  },
  {
    theatre_nom: 'Le Jardin de ma Sœur',
    slug: 'le-jardin-de-ma-soeur',
    official_url: '',
  },
  {
    theatre_nom: 'La Villa',
    slug: 'la-villa',
    official_url: '',
  },
  {
    theatre_nom: 'Archipel 19 – Le Fourquet',
    slug: 'archipel-19-le-fourquet',
    official_url: '',
  },
  {
    theatre_nom: 'Escale du Nord',
    slug: 'escale-du-nord',
    official_url: '',
  },
  {
    theatre_nom: 'Auditorium Jacques Brel (CERIA)',
    slug: 'auditorium-jacques-brel-ceria',
    official_url: '',
  },
  {
    theatre_nom: 'Maison des Cultures et de la Cohésion Sociale',
    slug: 'maison-des-cultures-et-de-la-cohesion-sociale',
    official_url: '',
  },
  {
    theatre_nom: 'Centre culturel Jacques Franck',
    slug: 'centre-culturel-jacques-franck',
    official_url: '',
  },
  {
    theatre_nom: 'Espace Senghor',
    slug: 'espace-senghor',
    official_url: '',
  },
]


window.getTheatreInfoByName = function (theatreNom) {
  if (!window.THEATRES_INFO) return null
  for (var i = 0; i < window.THEATRES_INFO.length; i++) {
    if (window.THEATRES_INFO[i].theatre_nom === theatreNom) return window.THEATRES_INFO[i]
  }
  return null
}
