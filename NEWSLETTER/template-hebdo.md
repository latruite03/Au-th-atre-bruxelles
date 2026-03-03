# Template newsletter hebdomadaire — Au théâtre ce soir

> **Outil :** Brevo (ex-Sendinblue)
> **Fréquence :** Chaque lundi matin (envoi vers 9h–10h)
> **Sélection :** 6 à 10 spectacles, même logique que "Cette semaine" — petites scènes en priorité, sans indication du jour exact

---

## Objet type

```
Cette semaine à Bruxelles — du [X] au [Y] [mois]
```

Exemples :
- `Cette semaine à Bruxelles — du 3 au 9 mars`
- `Théâtre à Bruxelles — semaine du 10 mars`

Éviter les emojis dans l'objet : certains filtres antispam les pénalisent.

---

## Texte d'introduction

### Pour les semaines ordinaires (2–3 phrases max)

> L'agenda de cette semaine est chargé. Voici ce qu'on vous recommande —
> les petites scènes d'abord, comme d'habitude.

> Quelques bonnes choses à voir cette semaine à Bruxelles.
> Sélection à la main, petites scènes en priorité.

> Pas grand-chose à ajouter cette semaine — l'agenda parle pour lui-même.

*(Choisir selon le nombre de spectacles et l'humeur du rédacteur.
Rester court. Ne pas "vendre". Ne pas mettre de points d'exclamation.)*

### Pour la première newsletter (présentation du projet)

> Bonjour,
>
> C'est la première newsletter d'**Au théâtre ce soir**.
>
> On a lancé ce site il y a quelques mois dans la discrétion : un agenda de théâtre
> pour Bruxelles, gratuit et sans publicité, avec un seul parti pris — mettre les
> petites scènes indépendantes en avant dans les résultats, devant les grandes institutions.
>
> Pourquoi ? Parce que c'est là que la scène bruxelloise est la plus vivante.
> Les créations fragiles, les prises de risque, les spectacles qui se jouent
> trois soirs et disparaissent. Ces lieux ont rarement le temps ou les moyens
> d'optimiser leur présence en ligne. On essaie de changer ça, modestement.
>
> Voici ce qu'on a sélectionné pour cette première semaine.

---

## Format de la liste de spectacles

Chaque spectacle sur une ligne (ou bloc compact), sans indication du jour :

```
[TITRE] — [Lieu] — [période ou dates] → [lien]
```

Exemples :
```
La Cerisaie — Théâtre de la Vie — jusqu'au 15 mars → https://...
Hamlet — Les Riches-Claires — 7 et 8 mars → https://...
Le Bourgeois Gentilhomme — Atelier 210 — du 12 au 22 mars → https://...
```

6 à 10 spectacles. Pas de descriptions longues. Les gens décident vite.

---

## Template HTML (à copier dans Brevo — éditeur HTML)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Au théâtre ce soir — Newsletter</title>
</head>
<body style="margin:0; padding:0; background:#f5f0eb; font-family: Georgia, 'Times New Roman', serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- En-tête -->
          <tr>
            <td style="background:#B11E2D; border-radius:10px 10px 0 0; padding: 28px 36px;">
              <p style="margin:0; font-family: Georgia, serif; font-size:22px; color:#fff; letter-spacing:0.01em;">Au théâtre ce soir</p>
              <p style="margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.75);">Semaine du [X] au [Y] [mois] [année]</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="background:#ffffff; padding: 32px 36px;">

              <!-- Intro -->
              <p style="margin: 0 0 28px; font-size:15px; line-height:1.8; color:#333;">
                [TEXTE D'INTRODUCTION — voir modèles ci-dessus]
              </p>

              <!-- Séparateur -->
              <hr style="border:none; border-top:1px solid #e8e2da; margin: 0 0 28px;">

              <!-- Liste des spectacles -->
              <!-- Répéter ce bloc pour chaque spectacle -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="border-left: 3px solid #B11E2D; padding-left: 14px;">
                    <p style="margin:0 0 3px; font-size:16px; font-weight:bold; color:#1a1a1a; font-family: Georgia, serif;">
                      [TITRE DU SPECTACLE]
                    </p>
                    <p style="margin:0 0 8px; font-size:13px; color:#666;">
                      [Nom du lieu] &nbsp;·&nbsp; [dates ou période]
                    </p>
                    <a href="[LIEN UTM]" style="font-size:13px; color:#B11E2D; text-decoration:none; font-family: Arial, sans-serif;">
                      Voir le spectacle →
                    </a>
                  </td>
                </tr>
              </table>
              <!-- /bloc spectacle -->

              <!-- Répétez autant de fois que nécessaire -->

              <!-- Séparateur -->
              <hr style="border:none; border-top:1px solid #e8e2da; margin: 28px 0;">

              <!-- CTA agenda -->
              <p style="margin:0; text-align:center;">
                <a href="https://autheatre.brussels/?utm_source=newsletter&utm_medium=email&utm_campaign=hebdo"
                   style="display:inline-block; background:#B11E2D; color:#fff; text-decoration:none;
                          padding: 12px 28px; border-radius:6px; font-family: Arial, sans-serif;
                          font-size:14px; font-weight:bold;">
                  Voir tout l'agenda →
                </a>
              </p>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background:#f5f0eb; border-radius: 0 0 10px 10px; padding: 20px 36px; border-top: 1px solid #e8e2da;">
              <p style="margin:0 0 8px; font-size:12px; color:#888; line-height:1.6; font-family: Arial, sans-serif;">
                Vous recevez cet email parce que vous vous êtes inscrit·e sur
                <a href="https://autheatre.brussels" style="color:#888;">autheatre.brussels</a>.<br>
                Sélection faite à la main. Priorité aux petites scènes. Sans publicité.
              </p>
              <p style="margin:0; font-size:12px; font-family: Arial, sans-serif;">
                <a href="{{ unsubscribe }}" style="color:#B11E2D; text-decoration:none;">Se désabonner</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## Liens UTM (tracking)

Ajouter systématiquement des paramètres UTM aux liens dans la newsletter pour
distinguer le trafic newsletter dans Umami :

```
?utm_source=newsletter&utm_medium=email&utm_campaign=hebdo-AAAA-MM-JJ
```

Exemple :
```
https://autheatre.brussels/spectacle/la-cerisaie--42?utm_source=newsletter&utm_medium=email&utm_campaign=hebdo-2026-03-03
```

---

## Checklist avant envoi

- [ ] Objet personnalisé avec les dates de la semaine
- [ ] Intro relue et adaptée (pas copiée-collée d'une semaine à l'autre)
- [ ] Tous les liens testés (pas de 404)
- [ ] Liens UTM présents sur tous les spectacles et le CTA
- [ ] Envoi test sur sa propre adresse avant envoi général
- [ ] Heure d'envoi : lundi entre 9h et 10h30
