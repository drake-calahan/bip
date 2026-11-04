# Bip V5 — « L'harmonie du jardin » — revue adversariale + plan

Ce document répond à la revue externe de V4 (« 80 vs 87 niveaux » + « harmonie
brisée ») : il en fait la critique adversariale, propose une solution améliorée,
et sert de plan V5 à approuver. Aucune ligne de code n'est modifiée avant
approbation de ce plan.

## 1. Revue adversariale de la revue externe

### 1.1 « 80 vs 87 » — confirmé, et anodin

Le code est correct : `LAST_STORY` (`src/app-core.js`) vaut bien l'index du niveau 80,
les défis (`ch === -1`, ids 81–87) sont exclus de la progression aventure, et
`node tools/check-levels.js` valide les 87 niveaux. C'est un problème de
terminologie dans les docs, pas un bug. Correction agréée : une seule ligne dans
le README (« 80 niveaux d'aventure + 7 défis de Zoé = 87 niveaux »).

### 1.2 « Harmonie brisée » — le diagnostic est partiellement faux, et il manque l'essentiel

La revue mesure la difficulté au **nombre de blocs de la solution de référence
(par)**. Pour un enfant de 5–7 ans, ce métrique est trompeur :

- **Ch7 « Jusqu'au bout » apparaît en « chute » (−2.4 blocs) mais c'est le chapitre
  `while`** — le concept le plus abstrait du jeu — à par 2–5. Un `while` à par 2
  est plus difficile que 6 flèches à par 6. « Lisser la courbe de par » aplatirait
  exactement les mauvais endroits.
- Les vrais problèmes, mesurés sur les données (voir §2) et **absents de la revue** :

| # | Problème réel (mesuré) | Où |
|---|---|---|
| 1 | **Batterie à zéro mou** : 28 niveaux ont `max == par` (tous les ch4, ch7, ch8, ch9, et le final L75/L79/L80 à max=par=9). Seule la solution exacte gagne → « fausse difficulté », viole la règle maison « ≥ 1 bloc de marge » (`.agent/AGENTS.md` règle 4) | L16–20, L31–34, L36–44, L47, L50, L60, L67–68, L72, L75, L77, L79–80, défis L83/84/86 |
| 2 | **Changement de repère au niveau près** : absolu↔relatif change level-by-level dès L21 (L21 ABS→REL, L26 REL→ABS, L31 ABS→REL, puis L46–51, L68–69, L72–80 alternent). L'enfant qui vient d'apprendre « Bip avance là où il regarde » retombe sur les flèches absolues, par à-coups | ch6, ch10, ch14, ch15, ch16 |
| 3 | **Débuts trop lourds** : ch2 débute à par 6, ch9 à par 7 — viole « nouveau concept = niveau showcase quasi trivial (≤ 4 blocs) » (`.agent/level-authoring.md`) | L6, L41 |
| 4 | **Rampes intra-chapitre** : ch15 monte 2,2,6,7,9 (+7, la plus raide du jeu) ; ch3/ch5/ch8/ch16 montent +5 | L71–75, L11–15, L21–25, L36–40, L76–80 |
| 5 | **Spikes signalés par le propre checker** : L25 par 8 après L24 par 3, L40 par 9 après L39 par 4 (`SPIKE?`) | L25, L40 |
| 6 | **Variantes** : ch8 = 10 jardins variants (15 cartes à simuler mentalement) | L36–40 |
| 7 | **Défis de Zoé dans le désordre** : samedi (L86, par 2) est le jour le plus facile de la semaine | L81–87 |
| 8 | Le final L80 déclenche `WARN plain fits` : résoluble sans le concept visé | L80 |

- **La solution proposée par la revue (réordonner les mondes/chapitres, déplacer
  ch12/ch13 à la fin) est à rejeter** : les ids de niveaux = index du tableau
  (`levels.js`), `save.stars` est indexé par id, les autocollants par chapitre,
  les tests UI référencent les ids 2, 4, 16, 60, et la narration des mondes
  (le monde 3 EST les ateliers de Grand-Papa : toboggans et détective y ont leur
  place). Réordonner casserait sauvegardes, stickers, tests et histoire.

## 2. Le modèle V5 : mesurer la « charge », pas les blocs

**Score de charge** d'un niveau (calculé par le nouveau `tools/check-curve.js`) :

```
charge = par
       + 2 × profondeur d'imbrication
       + 3 × (nombre de blocs nouveaux pour le joueur)
       + 1 × (jardins variants supplémentaires)
       + 2 × (changement de repère vs niveau précédent)
       + 2 × (marge batterie nulle, max == par)
```

**Invariants V5 (le checker échoue sinon) :**

- delta de charge moyenne entre deux chapitres consécutifs ≤ 2.0 ;
- rampe intra-chapitre (dernier − premier) ≤ 5 en charge, ≤ 4 en par ;
- niveau de début de chapitre ≤ 4 blocs (sauf final ch16) ;
- si `max` existe, `max ≥ par + 1` (règle de marge restaurée) ;
- un seul changement de repère dans toute l'aventure (celui enseigné au ch5) ;
- aucun `SPIKE?` dans `check-levels.js`.

## 3. Principes V5

1. **Aucun niveau ne bouge.** Ordre du tableau, ids, chapitres, mondes inchangés
   → sauvegardes `bip-robot-v2`, autocollants, tests UI, `LAST_STORY` tous
   valides. On ne change que le *contenu* des niveaux (map, sol, pal, face, max,
   texte) et les métadonnées de chapitres. Les 7 défis peuvent être réordonnés
   entre eux sans risque (`save.daily` est indexé par jour de la semaine, pas par id).
2. **Un seul repère après l'apprentissage** : flèches absolues (ch1–4, l'on-ramp),
   puis repère relatif `f/tl/tr` de ch5 à ch16 — le chapitre 5 l'enseigne, plus
   aucun retour en arrière ; seuls les deux derniers niveaux du final (ch16)
   peuvent mélanger les deux repères, comme contrôle de maîtrise.
3. **Marge partout** : `max = par + 1` (ou +2 pour les débuts) dès qu'une batterie existe.
4. **Débuts showcase** : chaque nouveau concept débute ≤ 4 blocs.
5. **Ponts narratifs** autour des changements de mode (toboggan L61, détective L66,
   nuit L71) : la mascotte annonce le changement dans sa bulle d'intro/de fin.
6. **La main qui montre** (`coachTarget`) étendue à tous les débuts de chapitre,
   pas seulement L1/L16/L36.

## 4. Plan par phases

| Phase | Contenu | Fichiers | Risque |
|---|---|---|---|
| 0 — Garde-fous + docs | `tools/check-curve.js` (score de charge + invariants §2) ; README : « 80 niveaux d'aventure + 7 défis de Zoé = 87 » ; ce document ; `level-authoring.md` mis à jour (modèle de charge + règle de marge) | tools/, README, docs/, .agent/ | nul |
| 1 — Marge & débuts | `max ≥ par+1` sur les 28 niveaux concernés ; L6 redesigné ≤ 4 blocs (début buisson trivial) ; L41 redesigné ≤ 5 (début étoile trivial) | src/levels.js | faible |
| 2 — Un seul repère | ch6, ch10, ch11, ch12, ch14, ch15, ch16 passés en repère relatif (`pal: [...REL, …]`, `face`, sols réécrits en `f/tl/tr`) ; ch16 L79–80 autorisés en mixte | src/levels.js | moyen (mécanique, validé par BFS + simulate) |
| 3 — Courbe lissée | ch2 : 6,6,6,6,8 → ~4,4,5,6,7 ; ch15 : 2,2,6,7,9 → ~3,4,5,6,7 ; L25 8→6 ; L40 9→7 ; rampes ch3/ch5/ch8/ch16 ramenées ≤ +4 en par | src/levels.js | moyen |
| 4 — Ponts de mode | Textes d'intro/fin des ch13, ch14, ch15 (annonce du mode) ; ordre ch13/ch14 inchangé (décision §6) | src/levels.js | nul |
| 5 — Défis ordonnés | 7 défis réordonnés lundi→dimanche par par croissant : 2,3,3,4,4,4,6 | src/levels.js | nul (save.daily par semaine) |
| 6 — Main guidée | `coachTarget()` générique : premier niveau de chaque chapitre → la main pointe le nouveau bloc de la palette | src/app-game.js | faible |
| 7 — (optionnel) Niveaux-ponts | 2–4 niveaux de consolidation ajoutés en ids 81+ (avant les défis, qui passent 85–91 : sans risque, `save.daily` par semaine, `LAST_STORY` auto) : ex. un « retour au jardin » entre monde 3 et nuit | src/levels.js | faible |

## 5. Métriques avant → après (mesuré après implémentation)

| Métrique | Avant (mesuré) | Après V5 (mesuré) |
|---|---|---|
| Niveaux à marge nulle (`max == par`) | 28 | **0** (39 batteries ajustées à `par+1`, 4 batteries inutiles retirées) |
| Changements de repère dans l'aventure | 19 (niveau par niveau) | **1** (ch5, celui qu'on enseigne) |
| Débuts de chapitre > 4 blocs | 2 (L6=6, L41=7) | **0** |
| Rampe intra-chapitre max (par) | +7 (ch15) | **≤ +4 partout** |
| `SPIKE?` dans check-levels | 2 (L25, L40) | **0** |
| Niveaux validés | 87 ALL OK | **90 ALL OK** (83 aventure + 7 défis, 17 chapitres) |
| Défi le plus facile de la semaine | samedi (par 2) | **dimanche est le plus costaud** (défi réordonnés lun→dim) |
| `check-curve.js` | n'existait pas | **ALL OK** (garde-fou permanent) |

## 6. Décisions approuvées (Thomas, revue V5) — IMPLÉMENTÉ

1. **Périmètre** : V5 complet (phases 0–6) + phase 7. ✔
2. **Repère unique** : relatif `f/tl/tr` de ch5 à la fin (55 niveaux convertis en place,
   sols réécrits, validés par BFS + simulate). Seul L80 (grand final) garde un mix. ✔
3. **Ch13/ch14 inversés en place** : détective (L61–65, mêmes gestes que le mode
   classique) d'abord, toboggans de Ballon (L66–70) en passerelle vers la nuit,
   avec ponts narratifs (bulles de Ballon/Noctule/Zoé). Ids inchangés. ✔
4. **Niveaux-ponts** : épilogue « Le rêve de Bip » (ch17, 3 niveaux ids 81–83,
   insérés après L80, avant les défis → ids 84–90 ; `save.daily` est indexée par
   jour de semaine donc sans risque ; `LAST_STORY` recalculé automatiquement). ✔

Ajouts transverses : `tools/check-curve.js` (garde-fou), marge `max = par+1`,
débuts allégés (ch2 : 4,4,5,6,7 ; ch9 : étoile en `* *`), courbes lissées
(ch6, ch10, ch12, ch15 redessinés), défis de Zoé triés lun→dim, main guidée
(`coachTarget`) étendue à tous les débuts de chapitre, README « 83 + 7 = 90 ».

## 7. Vérification (definition of done V5)

- `node tools/check-levels.js` → `ALL OK` (aucun SPIKE, aucune régression) ;
- `node tools/check-curve.js` → tous les invariants §2 OK ;
- `node tools/smoke-engine.js`, `check-labs.js`, `check-sandbox.js`, `check-session.js` OK ;
- `python tools/build.py`, bump `VERSION` dans `sw.js`, `node tools/check-ui.js` → `UI OK` + captures `.artifact/` ;
- Relecture des bulles modifiées à voix haute (≤ 2 phrases courtes, tutoiement) ;
- Commit « V5 « L'harmonie du jardin » : charge lissée, un seul repère, marge batterie, débuts showcase, défis ordonnés ».

## 8. Focus QA post-V5 (audit complet, 2026-11)

Audit statique custom + balayage navigateur des 102 niveaux + QA sauvegarde :

- **Corrigé pendant le QA** : 4 maps à lignes de largeur inégale (L6, L7, L15, L92) ;
  doublon de palette sur L80 (`[...REL, 'f', 'tr', …]` rendait des blocs en double) ;
  texte de L65 (« flèches » → « blocs avance », la palette est relative depuis V5).
- **Vérifié OK** : toutes les refs gagnent sur toutes les variantes, tous les `start`
  de détective échouent ; `max >= par+1` partout ; dailies triés [2,3,3,4,4,4,6] ;
  0 palette absolue en ch5+ ; LAST_STORY id=95 ; mondes 20/25/25/25.
- **Navigateur (Playwright)** : rendu des 102 niveaux conforme (palette = pal, cellPx OK,
  ball-only sur toboggans) ; 8 niveaux V5 joués et gagnés en UI (L21, L26, L46, L61, L71,
  L81, L84, L93) ; ampoule OK (L26) ; main guidée visible sur débuts de chapitre (L1, L21),
  absente en milieu de chapitre (L22) et en mode ball (L66) ; 0 erreur JS.
- **Save-compat** : vieux save V4 (étoiles ids 1–80) → « Continuer » reprend à L81
  (épilogue) ; `save.daily` toujours indexé par jour de semaine ; déverrouillage de la
  carte OK avec 95 niveaux d'aventure ; L95 gagné → bouton « Carte » ; frontière du swap
  ch13/14 propre (L65 détective → L66 toboggan).
- **Note** : L19 (3×7) dépasse la règle « map ≤ 8×6 » — pré-existant V2, rendu OK via
  `fitBoard`, laissé tel quel.
