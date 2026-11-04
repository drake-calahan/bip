# REFLEXION — Progression et difficulté des niveaux (retour bêta Thomas, 2026-11) — **APPLIQUÉ en V9** (voir docs/GAME-DESIGN-V9.md)

> « Les niveaux en eux-mêmes n'ont pas de sens dans la progression et la difficulté.
> Les 2 derniers niveaux sont totalement faciles là où ceux d'avant sont durs ;
> certains n'apportent rien à la réflexion. »

Analyse en profondeur (données mesurées sur les 95 niveaux d'aventure + revue moteur)
 et proposition de solution concrète (V9). Aucune modification de code dans ce commit :
 tout est proposé, chiffré, et les niveaux-exemples sont validés par le moteur.

## 1. Diagnostic chiffré

### 1.1 Le gouffre après le climax (le point le plus fort)

pars (blocs de la solution de référence) par chapitre, queue de l'aventure :

```
ch15 lucioles     [3,2,5,7,7]     max 7
ch16 pique-nique  [5,4,6,8,9]     max 9  <- climax narratif ET difficulté (L80 par 9, prof 3)
ch17 rêve         [2,4,5]          max 5
ch18 balises      [1,1,1,3]        max 3  <- trois niveaux à UN seul bloc 'g'
ch19 yeux de Bip  [3,3,4,4,2,2,4,3] max 4
```

**12 niveaux d'épilogue (ch17–19) s'enchaînent entre par 1 et 5 après un sommet à 9.**
Le dernier niveau (L95, par 3) est 3× plus « facile » que L80 (par 9). La fin du jeu
est une redescente en chute libre : après le pique-nique, plus rien n'a de enjeu.

### 1.2 Les niveaux « morts » (n'apportent rien à la réflexion)

Règle de détection : aucune nouveauté (ni bloc de palette, ni symbole de carte, ni
condition de boucle) + par ≤ 4 + profondeur ≤ 1 + 1 seule variante. Dans la queue :

| Niveau | par | sol | pourquoi c'est mort |
|---|---|---|---|
| L85 | 1 | `g` | la balise est déjà enseignée en L84 |
| L86 | 1 | `g` | idem, 2e fois |
| L87 | 3 | `g f f` | variante du même bloc |
| L89 | 3 | `It(f\|j)` | répète le capteur de L88 |
| L92 | 2 | `N2(g)` | multi-balises, mais 2 blocs, aucune réflexion |

Dans le corps du jeu (ch1–5), les niveaux « morts » par cette métrique sont **voulus**
: c'est l'on-ramp, la répétition y est pédagogique (flèches, obstacles). Le problème
n'est donc pas la métrique, c'est son application à la queue : après ch16, un niveau
sans nouveauté ni combo est du remplissage.

### 1.3 Le dip du chapitre 4 (boucle)

ch4 « Répéter » : pars [2,3,4,3,4] — plus bas que ch2/ch3 en par, alors que la boucle
est la **première vraie abstraction** (plus dure conceptuellement que 6 flèches).
La métrique de charge V5 le voit (nouveauté +3), le par seul non. Ce n'est pas un bug
de contenu mais un biais de lecture : à garder en tête, pas à « corriger » en par.

### 1.4 Ce qui va bien (à ne pas toucher)

- La courbe ch1→ch16 est globalement saine (V5) : débuts ≤ 4, rampes ≤ 4, 0 spike.
- Les modes spéciaux (détective ch13, toboggan ch14) servent de respiration
  narrative : leur par bas est justifié par le changement de mode lui-même.
- Les variantes ×3 (si/jusqu'à) sont le cœur de la généralisation : très bien.

## 2. Principes proposés (à graver dans check-curve)

- **P1 — anti-niveau-mort** : un niveau d'aventure doit apporter une nouveauté
  (bloc / symbole / condition) **ou** combiner ≥ 2 acquis (profondeur ≥ 2,
  ou par ≥ 5, ou ≥ 3 variantes). Sinon alerte `DEAD LEVEL`.
- **P2 — finir haut** : la charge du **dernier** niveau ≥ 70 % de la charge max de
  l'aventure ; descente post-climax en paliers ≤ −2 par niveau (pas de gouffre).
- **P3 — le climax narratif = le sommet** : ch16 (pique-nique) reste le max ;
  ce qui suit est un « tournoi de nuit » de combos, explicitement plus difficile
  que le niveau moyen, pas un défilement facile.

## 3. Options

| Option | Principe | Avantage | Inconvénient |
|---|---|---|---|
| **A — re-contenu de la queue en place (RECOMMANDÉ)** | ch17–19 deviennent un tournoi de combos, pars cibles montants, niveaux morts remplacés | ids et saves inchangés (édition en place), contenu sauvé, fin qui finit haut | ~12 niveaux à redessiner |
| B — sortir la queue du chemin (`ch: -1`) | la queue devient bonus, LAST_STORY retombe sur L80 | le chemin principal redevient serré | casse la progression des enfants déjà arrivés en ch17+ (leurs étoiles restent mais les niveaux sortent du chemin) ; perte de contenu perçu |
| C — ne rien faire | — | — | le retour bêta reste vrai |

## 4. Solution proposée (V9, option A) — chiffrée et validée moteur

Pars cibles de la queue (descente douce depuis 9, puis remontée vers un vrai final) :

```
ch17 rêve (3)   [5, 7, 8]
ch18 balises (4) [4, 5, 6, 7]
ch19 yeux (8)    [4, 4, 6, 6, 7, 7, 8, 9]   <- L95 = 9, vrai niveau final
```

Exemples concrets **déjà validés par le moteur** (simulate → win, toutes variantes) :

| Niveau | remplace | map | sol | par | combine |
|---|---|---|---|---|---|
| L81 | `N4(f)` par 2 | `['R**#**e']` | `N2(f) j N2(f)` | 5 | boucle + saut + peinture + luciole |
| L82 | `Wt(Ip(j|f))` par 4 | 3 variantes couloir | `Wo(Ip(j|f)) tr Wo(f)` | 7 | jusqu'à + si + saut + virage |
| L83 | `* tr *` par 5 | 3 variantes | `Wo(*) tr Wo(*)`, fn `Ip(j|f)` | 8 | étoile + jusqu'à + si |
| L85 | `g` par 1 (mort) | `['R.F..','.###.','..b..']` | `g tr f f` | 4 | balise + détour manuel |
| L86 | `g` par 1 (mort) | `['RbF..K']` | `g f f f` | 4 | balise + jouet + coffre |
| L87 | `g f f` par 3 | `['R.bF..','.....','..#K.']` | `g tr N2(f)` | 4 | balise + boucle + coffre |
| L88 | `It(f\|tr)` par 3 | `['Rbn']` | `N2(It(f\|tr))` | 4 | capteur dans une boucle |
| L94 | `Wg(Ip(j|f))` par 4 | `['R~bF']` | `Wg(Ip(j|f))` | 4 | jusqu'à-balise + si + saut |
| L95 | `p f g` par 3 | `['R.b.F','.....','..n.']` | `p f Wg(It(f\|g))` | 6→9 | **pose-balise + jusqu'à-balise + capteur + balise** (final) |

Règles de design des nouveaux niveaux de queue : jamais de jouet **au-delà** du
drapeau (sinon la route `g` le ramasse et dépasse la balise — bug observé en test),
au moins 2 idées connues combinées par niveau, `max` inutile (plus de batterie forcée
en queue).

## 5. Garde-fous à ajouter à `tools/check-curve.js`

1. `DEAD LEVEL` : nouveauté 0 + par ≤ 4 + prof ≤ 1 + 1 variante → violation
   (nouveauté = blocs pal + symboles carte + conditions Wo/Wt/Wg, Ip/Io/It, comptés
   en « vu pour la première fois » dans l'ordre de l'aventure).
2. `FIN TROP BASSE` : charge(dernier niveau) < 70 % × charge max aventure → violation.
3. `GOUFFRE` : baisse de charge > 2 entre deux niveaux consécutifs après le climax
   (ch du niveau > chapitre du max) → violation.

## 6. Plan d'implémentation V9 (si approuvé)

1. check-curve : ajouter les 3 règles ci-dessus (le DEAD LEVEL fera râler sur
   ch1–5 : exempter les 5 premiers chapitres, c'est l'on-ramp volontaire).
2. levels.js : remplacer en place les niveaux morts de la queue + relever les pars
   cibles ch17–19 selon le tableau (ids inchangés → saves `bip-robot-v2` valides ;
   les enfants déjà passés verront les niveaux « mieux » en rejouant).
3. Textes des niveaux redessinés à ré-écrire (≤ 2 phrases, voix).
4. Validation : check-levels + check-curve ALL OK, build, check-ui, sweep navigateur.
5. Docs : README, note de version V9 dans la feuille adultes, ce fichier marqué « appliqué ».

## 7. Risques

- Rejouer un niveau déjà réussi avec un nouveau contenu : l'étoile est conservée
  (save par id), le niveau est juste rejouable — acceptable, même souhaitable.
- Si un enfant est EN COURS dans ch17–19 au moment du deploy : idem, pas de perte.
- Le par du final L95 à 9 doit rester atteignable avec marge : pas de `max` en queue.
