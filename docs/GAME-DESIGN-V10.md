# Bip V10 — « L'aube » — richesse et simplicité, pour l'enfant comme pour l'adulte

Suite de la lignée (V9 « Un seul objectif »). Deux idées directrices cette fois :
**plus de richesse** (un nouveau monde, deux nouveaux pouvoirs, le partage de jardins)
et **la même simplicité** (même cadre, même but unique, l'accueil garde ses deux boutons ;
tout ce qui est nouveau vit à la fin du chemin ou dans la feuille adultes).

## 1. Deux nouveaux pouvoirs, en fin de parcours (jamais deux nouveautés à la fois)

- **Le bloc loupe `c`** (ch20 « Le nez de Bip », monde 5 « L'aube ») : Bip va **tout seul au
  jouet le plus proche** (chemin BFS sur un niveau temporaire, comme `g` ; les jouets sont
  ramassés au passage, la loupe peut sauter). Début en niveau showcase par 1 (`c` seul),
  puis `N2(c)`, détour ×3 jardins, et `Wt(c)` = « ramasse tout, tout seul ».
  Règle d'anti-pattern reprise de `g` : pas de caisse/barrière sur le chemin visé.
  Si aucun jouet n'est atteignable : `bump`/`toy` (« Oups ! Aucun jouet à portée de la loupe »).
- **Le rond « fleur » du bloc Jusqu'à `Wf(...)`** (ch21 « Jusqu'aux fleurs dorées ») :
  répéter **jusqu'à ce que toutes les fleurs soient peintes**. La 4e position de la molette
  n'apparaît que si le niveau a des fleurs (comme le drapeau pour `Wg`).
- Le **dernier niveau L103 finit haut** : 3 jardins, `Wg(*) c` + fn `Ip(j|f)`, par 6,
  charge 12 ≥ 70 % du max (16) — `check-curve.js` veille (FIN TROP BASSE, CHUTE, DEAD LEVEL).

## 2. Le monde 5 « L'aube » (w=4)

- Nouveau monde après la nuit : fond pêche (`--w4`), déco petits soleils, Ballon parle
  (`WORLD_WHO_MAP`), le pique-nique reste la fin du monde 4, un soleil « L'aube » ferme le chemin.
- 8 niveaux ajoutés **avant** les défis de Zoé dans `LEVELS` (les ids d'aventure 1–95 et la
  sauvegarde `save.stars` ne bougent pas ; les défis n'ont pas d'id persisté — `save.daily`
  est indexé par jour de la semaine). Total : **103 niveaux d'aventure + 7 défis = 110**,
  21 chapitres, 5 mondes. 2 autocollants de chapitre + 1 de monde (album 35 images).
- La carte de fin du tout-dernier niveau devient « L'aube » (au lieu du pique-nique).

## 3. Richesse pour l'adulte, sans encombrer l'enfant

- **Mon jardin : codes de partage** (`BIP1.<base64url>`). Deux icônes en bout de barre
  d'outils (avion « partager », presse-papiers « coller ») ouvrent une petite feuille :
  le code du jardin courant s'affiche (copie presse-papiers quand c'est possible, sinon
  sélection manuelle), et un code collé est **validé** (préfixe, 5 lignes × 6 caractères
  autorisés, exactement un départ `R`) avant de remplacer le jardin courant.
  Un mauvais code est refusé avec explication, le jardin courant est intact.
- **Compteurs dans la feuille adultes** (« En chiffres ») : niveaux terminés, étoiles,
  défis de Zoé, programmes lancés, victoires, jardins créés (`save.stats`).
- Le solveur BFS ignore `c` (ce n'est pas un mouvement simple) ; les niveaux à loupe ont
  une `sol` explicite.

## 4. Garde-fous et vérification

- `node tools/check-v10.js` (nouveau) : moteur `c`/`Wf`, parseProg, 110 niveaux, codec de partage.
- `check-levels.js` / `check-curve.js` : regex mises à jour (`c`, `W[otgf]`) → ALL OK (110 niveaux).
- `check-ui.js` : 103 cailloux, 21 bannières, 5 mondes, L96 à la loupe, L103 final gagné en UI,
  partage/coller de codes (bon et mauvais code), compteurs, note V10 → UI OK.
- Correctif en passant : le mode pas-à-pas ne plantait plus sur les étapes `g`/`c`
  (`CHECK_SAY` avait une garde manquante).
- sw `bip-v10-1`, publié sur GitHub Pages.
