# Bip V7 — « Les yeux de Bip » — capteur jouet + balises multiples

Enrichissement maximal de l'idée notée en V6 : le capteur « jouet devant », plus
l'extension des balises à plusieurs drapeaux. Implémenté, vérifié, commité.

## 1. Nouveau capteur : `It` (si un jouet est devant)

- Moteur : 3e condition du bloc Si (`c: 'toy'`), test sur la case devant pour un
  jouet **non ramassé** ; DSL `It(a|b)` ; `parseProg` accepte `I[pot](`.
- UI : la molette du bloc Si cycle maintenant sur 3 positions (flaque / obstacle /
  jouet), avec pastille icône (jouet), libellé et voix (`CHECK_SAY['if-toy']`) ;
  le marqueur « sense » s'affiche sur la case sondée. Fonctionne aussi dans Mon jardin.
- Sémantique : `Wt(It(f|tr))` = le « roomba » de Bip — descendre un couloir en
  ramassant tout, sans compter.

## 2. Balises multiples : `g` va à la balise la plus proche non visitée

- `parseLevel` collecte `flags[]` ; `pathToFlag` calcule la route **depuis la
  position courante de Bip** (bug V6 corrigé : la route partait du départ) vers
  chaque balise non visitée et choisit la plus courte ; une balise sous Bip est
  visitée. `N2(g)`, `N3(g)`… visitent plusieurs drapeaux.
- Temp level : balise cible = jouet, autres balises = herbe, vrais jouets gardés
  (ramassés au passage), C/G/K vidés.

## 3. Contenu : chapitre 19 « Les yeux de Bip » (monde nuit, ids 88–92)

| Niveau | Mécanique | par |
|---|---|---|
| L88 | `It(f|tr)` tutoriel : jouet devant → avance | 3 |
| L89 | `It(f|j)` : pas de jouet devant → saute | 3 |
| L90 | `N2(It(f|j))` : capteur dans un Répéter | 4 |
| L91 | `Wt(It(f|tr))` couloir ×3 variantes (roomba) | 4 |
| L92 | `N2(g)` deux balises, jouets au passage | 2 |

Chapitres finaux marqués `final`/`epilogue` dans CHAPTERS (check-curve exempte
la règle de début sur ces flags explicites, plus robuste que la position).

## 4. Vérification

- `check-levels` ALL OK (99 niveaux : 92 aventure + 7 défis, 19 chapitres, 0 WARN)
- `check-curve` ALL OK (0 marge nulle, 1 repère, 0 spike, débuts OK)
- smoke/labs/sandbox/session OK ; build OK ; `check-ui` UI OK (92 cailloux,
  19 bannières, 390×844 + 1280×800)
- sanity navigateur : L88 joué et gagné avec `It(f|tr)` en UI, molette Si à 3
  positions, multi-balises `N3(g)` validé moteur, `LAST_STORY`=92, 0 erreur JS.
