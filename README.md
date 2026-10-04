# Bip le robot — version installable

Jeu d'initiation à la programmation pour le CP : on programme Bip avec des blocs
(flèches, saut, répéter) pour ramasser les jouets du jardin en évitant buissons et flaques.
20 niveaux en 5 chapitres, voix qui lit les consignes, fonctionne hors connexion.

## Contenu

- `index.html` — le jeu complet (un seul fichier)
- `manifest.webmanifest` — nom, icônes, plein écran
- `sw.js` — mise en cache pour jouer sans connexion
- `icons/` — icônes Android (normales et adaptatives)

## Mettre en ligne (HTTPS obligatoire pour l'installation)

N'importe quel hébergement de fichiers statiques convient. Par exemple :

- **GitHub Pages** : pousser ce dossier dans un dépôt, puis Settings → Pages → branche `main`, dossier racine.
- **Cloudflare Pages** : `npx wrangler pages deploy . --project-name bip-robot`
- **Netlify Drop** : glisser le dossier sur app.netlify.com/drop

Pour tester en local : `python3 -m http.server 8000` puis ouvrir `http://localhost:8000`.

## Installer sur la tablette ou le téléphone Android

1. Ouvrir l'adresse dans Chrome.
2. Menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
3. Lancer Bip depuis son icône : plein écran, et ça marche ensuite sans réseau.

## Mettre à jour

Après avoir modifié `index.html`, changer `VERSION` dans `sw.js` (par exemple `bip-v2`)
pour que les appareils récupèrent la nouvelle version.

La progression (étoiles, réglages) est gardée sur l'appareil, dans le navigateur.

## Modifier le jeu

Les sources sont dans `src/` (niveaux dans `src/levels.js`). Après modification :

```
node tools/check-levels.js   # vérifie que chaque niveau a une solution
python3 tools/build.py       # régénère index.html et manifest.webmanifest
```
