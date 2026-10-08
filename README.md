# Bip le robot — V4 « Le grand jardin »

Jeu d'initiation à la programmation (puis à quelques idées de physique et de
mathématiques) pour les 5-7 ans. Tout se joue au doigt, **sans savoir lire** :
images, visages et voix. Aucun chrono, aucune vie, aucun méchant. Une erreur
est une information (« Oups ! »), jamais une punition. Fonctionne hors connexion,
s'installe sur Android comme une application.

La V4 ne change pas le contenu : elle reprend le cœur de V1 (programmer Bip avec
des blocs), l'histoire et les mécaniques de V2, les ateliers de V3, et les porte
dans **une seule expérience fluide pensée pour des mains de six ans**. La conception
complète est dans [docs/GAME-DESIGN-V4.md](docs/GAME-DESIGN-V4.md).

## Ce qu'on y fait

- **La carte** : un chemin qui serpente dans quatre mondes (le jardin, la mare,
  les ateliers, la nuit). Bip est posé sur le prochain caillou ; les cailloux
  réussis portent leurs étoiles ; les suivants sont pâles, jamais cadenassés.
  Un seul geste (« Jouer ») ouvre le prochain niveau.
- **L'aventure** : 4 mondes · 16 chapitres · 80 niveaux. Flèches, buissons et
  flaques, saut, Répéter, repère relatif, nénuphars qui coulent, Répéter jusqu'à,
  Si… sinon (3 jardins, 1 programme), bloc magique, champignons et barrières,
  caisses qui deviennent des ponts, pollen doré, toboggans de Ballon (on programme
  le décor), détective, puis le jardin de nuit jusqu'au grand pique-nique.
  L'histoire se raconte dans la bulle du niveau, par le personnage qui parle.
- **Les machines de Grand-Papa** : la balance (glisser les paniers), la lumière
  (tourner les miroirs), les roues (changer leur taille), le rendez-vous (décaler
  un ami). On construit, on peut deviner en touchant une image, on lâche la
  machine et on regarde. Douze défis, et un mode « inventer » par machine.
- **Le défi de Zoé** (un niveau par jour de la semaine), **Mon jardin** (crée ton
  niveau et fais-le résoudre par Bip), **l'album de Zoé** (29 images à gagner).

## Contenu du dépôt

- `index.html` — le jeu complet (un seul fichier, généré)
- `manifest.webmanifest`, `sw.js`, `icons/` — installation et hors connexion
- `src/engine.js` — moteur pur (simulation, solveur) · `src/ball.js` — toboggans ·
  `src/lab.js` — modèles des machines · `src/levels.js` — chapitres et niveaux
- `src/body.html` — interface (HTML + CSS + symboles SVG) · `src/app-*.js` — écrans
- `tools/` — build et vérifications · `docs/` — conception V4, plan de bêta-test et grille de retours (`docs/archive/` : V2 et V3)

## Bêta-test sur tablette

Le jeu est publié sur `https://drake-calahan.github.io/bip/`. Le déroulé de séance, la
grille d'observation et les points à vérifier sont dans [docs/BETA-TEST-V4.md](docs/BETA-TEST-V4.md) ;
les retours se consignent dans [docs/RETOURS-BETA.md](docs/RETOURS-BETA.md).

## Lancer en local

```powershell
python -m http.server 8103 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8103`. La première ouverture met le jeu en cache pour
les ouvertures suivantes hors connexion. La progression (étoiles, autocollants,
jardins créés, machines réussies) est gardée dans le navigateur, clé `bip-robot-v2`
(la sauvegarde V2/V3 est reprise telle quelle).

## Mettre en ligne (HTTPS obligatoire pour l'installation)

N'importe quel hébergement de fichiers statiques : GitHub Pages (Settings → Pages →
branche `main`, dossier racine), Cloudflare Pages, Netlify Drop…

## Installer sur la tablette ou le téléphone Android

1. Ouvrir l'adresse dans Chrome.
2. Menu ⋮ → « Installer l'application ».
3. Lancer Bip depuis son icône : plein écran, et ça marche ensuite sans réseau.

## Modifier le jeu

```
node tools/check-levels.js    # chaque niveau a une solution valide (ALL OK)
node tools/smoke-engine.js    # mécaniques du moteur
node tools/check-labs.js      # modèles des machines
node tools/check-sandbox.js   # Mon jardin
node tools/check-session.js   # navigation pendant une animation
python tools/build.py         # régénère index.html et manifest.webmanifest
node tools/check-ui.js        # parcours Playwright complets (serveur local lancé)
```

Après avoir modifié `src/`, changer `VERSION` dans `sw.js` pour que les appareils
récupèrent la nouvelle version. Les règles d'écriture (ton, une idée par niveau,
piles, étoiles) sont dans `.agent/AGENTS.md` et `.agent/level-authoring.md`.
