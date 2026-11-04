# Bip V8 — « Jusqu'à la balise » + robustesse des imbrications UI + publication

## 1. Deux nouveaux éléments (idée V7 poussée au bout)

- **`Wg(...)` — Jusqu'à la balise** : 3e position de la molette du bloc Jusqu'à
  (drapeau), proposée seulement si le niveau a une balise (`F` ou bloc `p`).
  `Wg(f)` = avancer jusqu'au drapeau. Voix `while-flag`, pastille drapeau.
- **`p` — pose une balise** : Bip plante un drapeau sur sa case (animé, step `plant`).
  `g` ignore la balise sous Bip comme cible sans la marquer visitée : `p f g` pose,
  explore, revient. `p` est dans Mon jardin (FULL_PAL) et le symbole `F` dans le tiroir.

Niveaux ch19 « Les yeux de Bip » complété : L93 `Wg(f)`, L94 `Wg(Ip(j|f))`, L95 `p f g`
(ids 93–95). Total : 102 niveaux (95 aventure + 7 défis), 19 chapitres.

## 2. Robustesse des imbrications boucle/until/if dans l'UI (audit + correctifs)

Constats corrigés (les « cas bizarres » vus) :

1. **Dépose silencieuse** : lâcher un bloc là où `canNest` l'interdit le relocalisait
   « tout en haut » sans rien dire → message parlé explicite maintenant
   (« Le bloc … ne rentre pas dans un bloc … : il est posé tout en haut »).
2. **Bloc fautif noyé dans les boucles** : `badMark` ne marquait que le bloc le plus
   interne → les conteneurs parents du chemin d'imbrication sont maintenant entourés
   en pointillés orange (`.badpath`).
3. **Conteneur vide** : un Jusqu'à/Si/Répéter sans contenu faisait tourner le moteur
   en no-op silencieux → le lancement est bloqué avec explication parlée et le bloc
   est marqué en orange.
4. Test Playwright ajouté : niveau final hyper-imbriqué `N2(Wo(*) tr) Wo(*)` + `Ip(j|f)`
   joué et gagné en UI ; conteneur vide bloqué ; L95 `p f g` gagné avec la balise
   plantée visible sur le plateau.

## 3. Vérification

- `check-levels` ALL OK (102 niveaux) · `check-curve` ALL OK · smoke/labs/sandbox/session OK
- build OK · `check-ui` UI OK avec les nouveaux tests d'imbrication (390×844 + 1280×800)
- sanity navigateur : Wg/p gagnés en UI, 0 erreur JS. sw `bip-v8-1`. Publié sur GitHub Pages (push main).
