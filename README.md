# Bip le robot — V3 « Le jardin des possibles »

PoC jouable d'initiation à la programmation, à la physique et aux mathématiques
pour les 5-7 ans (CP-CE1). La V3 prolonge l'aventure originale avec quatre ateliers
où l'enfant prévoit, manipule, observe et compare ses idées, sans chrono ni vies.

## Les ateliers V3

- **Les équilibres** : un petit poids peut équilibrer un gros poids en s'éloignant du centre.
- **La lumière** : des miroirs, des détours et un cristal magique à deux sorties.
- **Les roues complices** : sens de rotation, rapports simples et roue intermédiaire.
- **Le rendez-vous** : des rythmes de deux, trois ou quatre pas à synchroniser.

**12 puzzles progressifs**, une prédiction facultative, une comparaison entre essais,
un **carnet de découvertes** et une **exploration libre** dans chaque famille.
Une invention par famille peut être conservée sur cet appareil. Tous les ateliers
sont accessibles dès l'accueil pour cette bêta locale.

Les modèles sont volontairement idéaux et discrets. Le bénéfice pédagogique
reste à éprouver avec des enfants : [conception V3](docs/GAME-DESIGN-V3.md) et
[protocole de bêta-test](docs/BETA-TEST-V3.md).

## L'aventure conservée

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
- `docs/GAME-DESIGN-V3.md` — les ateliers, les règles et les intentions pédagogiques
- `docs/BETA-TEST-V3.md` — une séance enfant/adulte de 15 à 25 minutes

## Bêta Locale

```powershell
python -m http.server 8103 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8103`. L'onglet **Les ateliers** présente la V3 ;
**L'aventure** retrouve le parcours original ; **Mes découvertes** contient le carnet.
Pour une vérification rapide : essayer le premier puzzle de chaque famille,
garder une invention, recharger, puis reprendre un niveau de l'aventure.

La progression V2 est conservée dans la même sauvegarde locale `bip-robot-v2`.
Les nouvelles découvertes et inventions y sont ajoutées. Aucun compte ou serveur
de données n'est nécessaire. La première ouverture HTTP met le jeu en cache
pour les ouvertures suivantes hors connexion.

## Mettre en ligne (HTTPS obligatoire pour l'installation)

N'importe quel hébergement de fichiers statiques convient. Par exemple :

- **GitHub Pages** : pousser ce dossier dans un dépôt, puis Settings → Pages → branche `main`, dossier racine.
- **Cloudflare Pages** : `npx wrangler pages deploy . --project-name bip-robot`
- **Netlify Drop** : glisser le dossier sur app.netlify.com/drop

Le fichier `index.html` est également autonome pour une ouverture directe ;
l'installation et le cache hors connexion nécessitent HTTP local ou HTTPS.

## Installer sur la tablette ou le téléphone Android

1. Ouvrir l'adresse dans Chrome.
2. Menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
3. Lancer Bip depuis son icône : plein écran, et ça marche ensuite sans réseau.

## Mettre à jour

Après avoir modifié `src/`, changer `VERSION` dans `sw.js` (par exemple `bip-v3-poc-2`)
pour que les appareils récupèrent la nouvelle version.

La progression (étoiles, autocollants, jardins créés) est gardée sur l'appareil, dans le navigateur.

## Modifier le jeu

```
node tools/check-levels.js    # vérifie que chaque niveau a une solution valide (ALL OK)
node tools/smoke-engine.js    # tests des mécaniques du moteur
node tools/check-labs.js      # 12 puzzles et 54 configurations, vérification indépendante
node tools/check-sandbox.js   # supprimer/replacer Bip dans l'éditeur
node tools/check-session.js   # navigation pendant une animation et victoire différée
python tools/build.py         # régénère index.html et manifest.webmanifest
```

`node tools/check-ui.js` exécute les parcours dans Chrome avec Playwright installé,
sur le serveur local ci-dessus. Il vérifie les ateliers, la sauvegarde, l'ancien
jeu, les écrans mobiles, les animations et le rechargement hors connexion.
Ses captures sont enregistrées dans `.artifact/` (non versionné).

- `src/engine.js` — moteur pur (simulation, solveur) : nénuphars, champignons/barrières,
  caisses-ponts, peinture, lucioles.
- `src/ball.js` — le mode toboggans (Ballon roule dans le décor programmé).
- `src/lab.js` — les modèles purs et les 12 expériences V3.
- `src/app-lab.js` + `src/lab.css` — les ateliers, le carnet et les inventions.
- `src/levels.js` — chapitres, niveaux, jardins variants, défis quotidiens.
- `src/body.html` + `src/app-*.js` — l'interface (assemblées en un fichier par le build).
