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
]


window.getTheatreInfoByName = function (theatreNom) {
  if (!window.THEATRES_INFO) return null
  for (var i = 0; i < window.THEATRES_INFO.length; i++) {
    if (window.THEATRES_INFO[i].theatre_nom === theatreNom) return window.THEATRES_INFO[i]
  }
  return null
}
