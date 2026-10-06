# Bip le robot — v2 « Le grand pique-nique »

Jeu d'initiation à la programmation et aux petites machines pour les 5-7 ans (CP-CE1).
On programme Bip avec des blocs pour ramasser les jouets du jardin… puis on part avec
Zoé la coccinelle retrouver les jouets éparpillés par le vent Zéphyr, on construit des
machines dans les ateliers de Grand-Papa Engrenage, et on finit par un grand
pique-nique sous les étoiles. Fonctionne hors connexion.

**4 mondes · 16 chapitres · 80 niveaux d'aventure · 7 défis quotidiens · 1 mode création · 25 autocollants**

- Monde 1 — Le jardin de Bip : flèches, buissons, flaques, saut, boucle Répéter.
- Monde 2 — La grande promenade : repère relatif, nénuphars qui coulent (on ne revient
  pas en arrière), Répéter jusqu'à, Si… sinon (3 jardins, 1 programme), bloc magique.
- Monde 3 — Les ateliers de Grand-Papa : champignons qui ouvrent les barrières, caisses
  à pousser (dans l'eau elles deviennent des ponts !), pollen doré à peindre,
  toboggans de Ballon (on programme le décor, plus le robot), détective (débogage).
- Monde 4 — Le jardin de nuit : tout ce qu'on sait, sous les étoiles, jusqu'au grand final.

Plus : **le défi de Zoé** (un niveau par jour de la semaine, hors ligne), **Mon jardin**
(crée tes propres niveaux et fais-les résoudre par Bip), **l'album de Zoé** (autocollants),
une histoire douce avec personnages, voix qui lit les consignes, aucun chrono, aucune vie.

## Contenu

- `index.html` — le jeu complet (un seul fichier, généré)
- `manifest.webmanifest` — nom, icônes, plein écran
- `sw.js` — mise en cache pour jouer sans connexion
- `icons/` — icônes Android (normales et adaptatives)
- `src/` — sources (moteur, niveaux, interface) · `tools/` — tests et génération
- `docs/GAME-DESIGN-V2.md` — le document de conception

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

Après avoir modifié `src/`, changer `VERSION` dans `sw.js` (par exemple `bip-v2-1`)
pour que les appareils récupèrent la nouvelle version.

La progression (étoiles, autocollants, jardins créés) est gardée sur l'appareil, dans le navigateur.

## Modifier le jeu

```
node tools/check-levels.js    # vérifie que chaque niveau a une solution valide (ALL OK)
node tools/smoke-engine.js    # tests des mécaniques du moteur
python3 tools/build.py        # régénère index.html et manifest.webmanifest
```

- `src/engine.js` — moteur pur (simulation, solveur) : nénuphars, champignons/barrières,
  caisses-ponts, peinture, lucioles.
- `src/ball.js` — le mode toboggans (Ballon roule dans le décor programmé).
- `src/levels.js` — chapitres, niveaux, jardins variants, défis quotidiens.
- `src/body.html` + `src/app-*.js` — l'interface (assemblées en un fichier par le build).
