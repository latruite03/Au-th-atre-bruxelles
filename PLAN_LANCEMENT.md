# Plan de lancement — Au théâtre ce soir
> Basé sur le rapport DeepResearch + audit technique du repo
> Rédigé pour être exécuté par l'agent OpenClaw
> Date : 2026-02-20

---

## Contexte technique réel

Le site est **HTML/JS vanilla + Supabase** (pas Next.js). Ce qui existe déjà :
- ✅ Site public fonctionnel (`index.html`, `lieux.html`, `cette-semaine.html`, `a-propos.html`)
- ✅ Admin complet (login, dashboard, import CSV, classement éditorial)
- ✅ Base Supabase : tables `representations` + `theatre_rang`
- ✅ PWA manifest, robots.txt, sitemap.xml statique (4 URLs)
- ✅ Tri éditorial "petits lieux d'abord" opérationnel
- ❌ Pas d'analytics
- ❌ Newsletter sans backend (form HTML orphelin)
- ❌ Pas de données structurées `schema.org/Event`
- ❌ Pas de pages URL stables par lieu/représentation
- ❌ Pas de Search Console configurée

---

## PHASE 1 — Fondations techniques (Jours 1–7)
*Objectif : être indexable, mesurable, conforme*

### 1.1 Google Search Console + Sitemap dynamique

**Tâche agent :** Améliorer le `sitemap.xml` pour inclure les pages lieux.

```
Fichier à modifier : sitemap.xml
Action : Ajouter une section <url> par théâtre référencé dans la table theatre_rang
Format : https://autheatre.bruxellesensolo.be/lieu/{slug-du-theatre}
Note : Pour l'instant ajouter les 10-15 lieux principaux manuellement
```

**Instructions manuelles (non-dev) :**
1. Aller sur https://search.google.com/search-console
2. Ajouter la propriété `autheatre.bruxellesensolo.be`
3. Vérifier via balise HTML (coller dans `<head>` de `index.html`)
4. Soumettre `https://autheatre.bruxellesensolo.be/sitemap.xml`

---

### 1.2 Données structurées `schema.org/Event`

**Tâche agent :** Ajouter du JSON-LD dynamique dans `js/app.js`

Quand les représentations sont affichées, injecter dans le `<head>` un bloc `<script type="application/ld+json">` avec la liste des événements du jour au format Event schema.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "{titre}",
  "startDate": "{date}T{heure}",
  "location": {
    "@type": "Place",
    "name": "{theatre_nom}",
    "address": "{theatre_adresse}"
  },
  "url": "{url_billetterie}",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
}
```

**Fichiers à modifier :** `js/app.js` (fonction de rendu des résultats)

---

### 1.3 Pages stables par lieu (`/lieu/nom-du-theatre`)

**Tâche agent :** Créer `lieu.html` — page template pour un théâtre

- URL : `autheatre.bruxellesensolo.be/lieu/?theatre=le-fou-rire`
- Contenu : nom, adresse, rang éditorial, prochaines représentations
- JSON-LD : `schema.org/TheaterEvent` + `schema.org/Place`
- Mettre à jour `sitemap.xml` avec ces URLs

**Fichiers à créer :** `lieu.html`, `js/lieu.js`

---

### 1.4 Analytics sans cookie (conforme APD Belgique)

**Solution recommandée : Umami** (auto-hébergé ou cloud, sans cookie, GDPR-exempt)

**Tâche agent :**
- Option A (simple) : Créer un compte sur https://cloud.umami.is (gratuit jusqu'à 100k vues/mois)
- Ajouter le script Umami dans le `<head>` de tous les fichiers HTML
- **Aucune bannière cookie nécessaire** (pas de cookie déposé)

```html
<!-- À ajouter dans <head> de chaque .html -->
<script defer src="https://cloud.umami.is/script.js"
        data-website-id="VOTRE-ID-UMAMI"></script>
```

**Alternative si Umami non disponible :** Plausible.io (9€/mois, sans cookie, conforme APD)

---

## PHASE 2 — Contenu & partenaires (Semaines 2–3)
*Objectif : 3 liens entrants, premier trafic organique*

### 2.1 Page "À propos" améliorée

**Tâche agent :** Réécrire `a-propos.html` avec :
- Mission : "L'agenda des petites scènes bruxelloises, sans pub, sans algorithme commercial"
- Explication du classement éditorial (pourquoi les petits lieux d'abord)
- ASBL, valeurs, contact
- Section "Ajouter votre lieu" avec formulaire de contact simple

**Fichier à modifier :** `a-propos.html`

---

### 2.2 Page "Partenaires / Lieux référencés"

**Tâche agent :** Améliorer `lieux.html` pour en faire une vraie page de référence :
- Liste des théâtres avec lien vers leur page `/lieu/?theatre=...`
- Badge "Mis en avant" pour les petits lieux indépendants
- Mention du classement éditorial
- Meta description optimisée SEO : "Tous les théâtres et cafés-théâtres à Bruxelles..."

**Fichier à modifier :** `lieux.html`, `js/app.js` (ou nouveau `js/lieux.js`)

---

### 2.3 Kit email partenaire (13 cafés-théâtres prioritaires)

**Tâche agent :** Créer le fichier `OUTREACH/email-partenaire-type.md`

Liste des 13 lieux prioritaires (festival Bruxelles sur Scènes) :
- Atelier Marcel Hastir
- Café de La Rue
- Côté Village
- Jazz Station
- Le Fou Rire
- Le Jardin de ma Sœur
- Les Lundis d'Hortense
- L'Os à Moelle
- Le Petit Chapeau Rond Rouge
- Le Rayon Vert
- Au B'izou
- The Music Village
- ZoArt

**Ce qu'on leur propose :**
1. Une page dédiée sur le site (URL stable, bien référencée)
2. Classement en haut de liste dans l'agenda
3. Un mini-widget "Prochaines dates" à intégrer sur leur site (iframe ou JS)

**Ce qu'on demande :**
1. Un lien "Agenda" vers notre page depuis leur site
2. Une mention dans leur newsletter ou stories (1× au lancement)

---

### 2.4 Mini-widget "Prochaines dates" (pour les lieux partenaires)

**Tâche agent :** Créer `widget.html` + `js/widget.js`

- URL : `autheatre.bruxellesensolo.be/widget/?theatre=le-fou-rire`
- Affiche les 5 prochaines représentations du théâtre
- Intégrable en iframe sur n'importe quel site
- Style minimaliste (fond blanc, couleurs neutres)
- Lien "Voir tout sur Au théâtre ce soir" → notre site (avec UTM)

```html
<!-- Code à donner aux théâtres pour intégrer -->
<iframe src="https://autheatre.bruxellesensolo.be/widget/?theatre=le-fou-rire"
        width="100%" height="300" frameborder="0"></iframe>
```

**Fichiers à créer :** `widget.html`, `js/widget.js`

---

## PHASE 3 — Rétention & newsletter (Semaines 3–4)
*Objectif : abonnés newsletter, rituels de publication*

### 3.1 Newsletter hebdomadaire (backend)

**Solution recommandée : Brevo (ex-Sendinblue)** — gratuit jusqu'à 300 emails/jour

**Tâche agent :**
- Créer un compte sur https://www.brevo.com (gratuit)
- Connecter le formulaire newsletter existant (dans footer de tous les .html)
- Ajouter le script Brevo au `<head>`
- Configurer une liste "Abonnés Au théâtre ce soir"

**Fichiers à modifier :** `index.html`, `cette-semaine.html`, `lieux.html`, `a-propos.html`

---

### 3.2 Template newsletter hebdo

**Tâche agent :** Créer `NEWSLETTER/template-hebdo.md`

Structure type (chaque lundi) :
```
Objet : 🎭 Cette semaine à Bruxelles — [date semaine]

Bonjour,

**À ne pas manquer cette semaine** (petites scènes d'abord)
→ [Titre 1] – [Lieu] – [Date/Heure] – [Lien UTM]
→ [Titre 2] – [Lieu] – [Date/Heure] – [Lien UTM]
→ [Titre 3] – [Lieu] – [Date/Heure] – [Lien UTM]

**Ce week-end**
→ [Titre] – [Lieu] – [Samedi/Dimanche] – [Lien UTM]

[Voir tout l'agenda →] (lien UTM)

Vous recevez cet email parce que vous vous êtes inscrit·e sur autheatre.bruxellesensolo.be
[Se désabonner]
```

---

### 3.3 Page "Cette semaine" améliorée

**Tâche agent :** Améliorer `cette-semaine.html` :
- Afficher automatiquement Lun→Dim de la semaine courante
- Mettre en avant les lieux avec rang éditorial <= 20 (petites scènes)
- Ajouter un formulaire d'abonnement newsletter en haut de page
- Meta description : "Le meilleur du théâtre à Bruxelles cette semaine — petites scènes en priorité"

**Fichier à modifier :** `cette-semaine.html`, `js/app.js` ou nouveau `js/semaine.js`

---

## PHASE 4 — Dossier subsides (Semaines 5–8)
*Objectif : dossier crédible pour Ville de Bruxelles / COCOF*

### 4.1 Preuves à rassembler

| Preuve | Source | Format |
|--------|--------|--------|
| Trafic mensuel | Umami dashboard | Capture écran + export CSV |
| Lieux référencés | Table `theatre_rang` | Export PDF ou tableau |
| Représentations actives | Table `representations` | Nombre total + période |
| Liens entrants | Google Search Console | Capture "Liens" |
| Partenariats | Emails + captures de liens | PDF consolidé |

### 4.2 Page "Valeur publique" (pour le dossier)

**Tâche agent :** Créer ou enrichir `a-propos.html` avec une section :
- "Pourquoi ce projet ?"
- "Sans publicité, sans algorithme commercial"
- "Mise en avant des petites scènes et lieux indépendants"
- "Outil d'accès à la culture de proximité"
- Statistiques publiques (nb de lieux, nb de représentations)

### 4.3 Guichets subsides prioritaires

| Organisme | Type | Deadline | Contact |
|-----------|------|----------|---------|
| Ville de Bruxelles — Soutien associations culturelles | Fonctionnement | 31 mars 2026 | [formulaire en ligne] |
| COCOF — Diffusion culturelle | Projet | À confirmer | IRISbox + dossier |
| hub.brussels — Industries créatives | Projet | Variable | hub.brussels/aides |

**Action immédiate :** Créer l'ASBL si pas encore fait (requis pour subsides Ville de Bruxelles)

---

## Récapitulatif des tâches pour l'agent OpenClaw

### Priorité 1 (cette semaine)
- [ ] **1.2** Ajouter JSON-LD `schema.org/Event` dans `js/app.js`
- [ ] **1.3** Créer `lieu.html` + `js/lieu.js` (pages stables par théâtre)
- [ ] **1.4** Intégrer Umami analytics dans tous les `.html`
- [ ] **Sitemap** Mettre à jour `sitemap.xml` avec les pages `/lieu/`

### Priorité 2 (semaine prochaine)
- [ ] **2.1** Réécrire `a-propos.html` (mission + valeurs + ASBL)
- [ ] **2.2** Améliorer `lieux.html` (SEO + liens lieux)
- [ ] **2.4** Créer `widget.html` + `js/widget.js`
- [ ] **2.3** Créer `OUTREACH/email-partenaire-type.md`

### Priorité 3 (dans 2 semaines)
- [ ] **3.1** Connecter newsletter Brevo dans les formulaires footer
- [ ] **3.2** Créer `NEWSLETTER/template-hebdo.md`
- [ ] **3.3** Améliorer `cette-semaine.html`

### Priorité 4 (dans 4–8 semaines)
- [ ] **4.1** Collecter et consolider les preuves pour dossier subsides
- [ ] **4.2** Section "valeur publique" dans `a-propos.html`
- [ ] **4.3** Contacter les guichets subsides

---

## Notes importantes

### Ce qu'OpenClaw NE doit PAS faire sans confirmation
- Créer des comptes (Umami, Brevo, Search Console) — l'utilisateur le fait lui-même
- Envoyer des emails aux théâtres — l'utilisateur valide d'abord le texte
- Modifier la base Supabase (schéma ou données)

### Ce qu'OpenClaw PEUT faire en autonomie
- Modifier les fichiers HTML, JS, CSS du repo local
- Créer de nouveaux fichiers (widget.html, lieu.html, etc.)
- Rédiger les textes (emails, pages, newsletters)
- Mettre à jour sitemap.xml
- Ajouter des balises meta et JSON-LD

### Domaine actuel
Le site est déployé sur `autheatre.bruxellesensolo.be` — pas besoin d'acheter un nouveau domaine (déjà propre et dédié).
