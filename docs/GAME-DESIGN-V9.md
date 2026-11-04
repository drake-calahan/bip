# Bip V9 — « Un seul objectif » — cohérence, anti-filler, produit simplifié

Suite du retour bêta (voir `docs/REFLEXION.MD`, appliqué ici) : un cadre identique et
clairement identifiable, un seul objectif, plus de niveaux filler, et les à-côtés
non-programmation archivés.

## 1. Un seul objectif, partout : « ramasse tous les jouets »

- **Coffre `K` retiré** (moteur, maps, tiroir Mon jardin, textes) : la cible « finir sur
  le coffre » était une seconde règle incohérente (échecs « notbox » incompris).
- **Luciole-jouet `e` retirée** : les mondes de nuit ramassent les mêmes jouets
  (b n c t a) que le reste du jeu. Noctule reste un personnage, plus un jouet spécial.
- Conséquence moteur : `win = tous les jouets ramassés + toutes les fleurs peintes`.

## 2. Plus de niveaux filler : tournoi de nuit (ch17–19, en place, ids/saves inchangés)

pars avant → après : ch17 [2,4,5]→[5,7,8] · ch18 [1,1,1,3]→[1,2,4,4] · ch19 [3,3,4,4,2,2,4,3]→[4,4,4,4,2,4,4,7].
Chaque niveau combine ≥ 2 acquis (exemples validés moteur : L83 `Wo(*) tr Wo(*)` + fn
`Ip(j|f)` par 8 ; L95 final `p f g N2(It(f|tr))` par 7). Règle de design trouvée en
testant : jamais de jouet au-delà d'un drapeau (la route `g` le dépasserait).

## 3. Garde-fous gravés dans `tools/check-curve.js`

- **DEAD LEVEL** : aucune nouveauté (bloc/symbole/condition, comptés dans l'ordre de
  l'aventure) + par+profondeur ≤ 2 + 1 variante → violation (ch1–5 exemptés : on-ramp).
- **FIN TROP BASSE** : charge du dernier niveau < 70 % de la charge max → violation.
- **CHUTE** : niveau trivial (par ≤ 2) et sans nouveauté dans le dernier chapitre.

## 4. Archivé : défis de Zoé + machines (non-programmation)

- Le hub d'accueil n'a plus que **Mon jardin** + **l'album** (+ « Pour les adultes »).
- Les boutons « Défi de Zoé » et « Les machines de Grand-Papa » sont déplacés dans la
  feuille adultes, section **« Bonus archivés (V9) »** — mêmes ids, handlers et saves
  intacts, contenu toujours jouable, récompenses dans l'album.

## 5. DA / cadre identique

Un seul plateau, un seul but, une seule grammaire de blocs ; les mondes ne changent
que la couleur du plateau (identifiables visuellement). Le mode détective garde le
même cadre (programme pré-rempli à réparer) ; les toboggans restent le seul écart
deliberé (programmer le décor), en passerelle vers la nuit.

## 6. Vérification

- check-levels ALL OK (102 niveaux) · check-curve ALL OK (3 nouvelles règles, test
  négatif vérifié : un niveau filler injecté déclenche FIN TROP BASSE/DEAD)
- smoke/labs/sandbox/session OK · build OK · check-ui UI OK (home à 2 boutons, bonus
  dans la feuille adultes, L95 tournoi gagné en UI)
- sweep navigateur 102 niveaux OK, 0 erreur JS. sw `bip-v9-1`, publié sur GitHub Pages.
