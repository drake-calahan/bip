# Bip V10 — « L'aube » — plan de bêta-test sur mobile

V10 ajoute un 5e monde (L'aube, chapitres 20-21), deux nouveaux blocs (la **loupe** `c`
et le rond **fleur** du Jusqu'à `Wf`), des **codes de partage** dans Mon jardin (désormais
en **8×6**, codes `BIP2.…`, les anciens `BIP1.…` 6×5 sont relus) et des **compteurs**
dans la feuille adultes. La bêta se fait sur ton téléphone, à partir de
l'app installée (la mise à jour arrive toute seule via le service worker `bip-v10-2` ;
sinon : menu ⋮ → « Recharger » deux fois, ou désinstaller/réinstaller).

**Grille de retours prête à remplir : [RETOURS-BETA.md](RETOURS-BETA.md) (section « Grille V10 »).**

## Mise à jour sur le mobile

1. Ouvrir `https://drake-calahan.github.io/bip/` dans Chrome (ou lancer l'app installée).
2. Vérifier dans « Pour les adultes » → Version que la note **V10** est en haut de liste.
3. Mode avion, fermer/réouvrir l'app : le jeu doit se lancer hors connexion avec le
   nouveau monde (sinon vider le cache du navigateur pour le site, puis recharger).

## Ce que l'on cherche à savoir (V10)

1. **La loupe plaît et se comprend** : au chapitre 20, l'enfant comprend-il que le bloc
   loupe envoie Bip au jouet le plus proche ? Le « tout seul » le surprend-il en bien ?
   Que fait-il si aucun jouet n'est atteignable (message « Aucun jouet à portée ») ?
2. **Le rond fleur du Jusqu'à** : au chapitre 21, comprend-il « répéter jusqu'à ce que
   toutes les fleurs soient dorées » ? La molette n'a la fleur que quand le niveau a des fleurs.
   **Équilibrage à observer** : Wf ne doit pas résoudre le niveau tout seul — L100 a un jouet
   à attraper à la loupe, L101 a une fleur derrière une flaque, L102 a les deux. L'enfant
   le ressent-il comme « la boucle peint, la loupe attrape » ?
3. **Le monde de l'aube** : la carte se termine bien par le soleil « L'aube » ; la carte
   de victoire finale dit « L'aube » ; les 2 nouveaux autocollants tombent dans l'album
   (album = 35 images).
4. **Mon jardin en 8×6 + codes de partage** (deux icônes en bout de barre) : le plateau
   8×6 tient-il bien sur l'écran ? Copier son code, l'envoyer (SMS/mail), le coller chez
   un ami, « Charger ce code » → le jardin apparaît. Un code invalide est-il bien refusé
   sans rien casser ? Un ancien code BIP1 (6×5) est-il bien repris complété en 8×6 ?
5. **Les compteurs** (« Pour les adultes » → « En chiffres ») montent bien (programmes
   lancés, victoires, jardins créés).
6. **Régression générale** : un niveau de chaque mode (classique, mare, caisses, pollen,
   détective, toboggan, nuit, tournoi, loupe, fleurs), les 4 machines, le défi de Zoé,
   Mon jardin qui se retrouve après fermeture, portrait/paysage, voix FR, hors connexion.

## Grille de retours

Même grille que `docs/BETA-TEST-V4.md` — une ligne par fait brut dans
[docs/RETOURS-BETA.md](docs/RETOURS-BETA.md) (séance, âge, écran, moment, observation,
aide, gravité : bloquant · gênant · détail · positif).

## Vérifications techniques avant la première séance

- [ ] `node tools/check-levels.js` → ALL OK (110 niveaux) · `node tools/check-curve.js` → ALL OK
- [ ] `node tools/check-v10.js` → V10 OK (équilibrage Wf + codec BIP2/BIP1) · `node tools/check-ui.js` → UI OK
- [ ] Sur le mobile : V10 affiché dans la feuille adultes, 5 mondes sur la carte,
      L96 jouable à la loupe, L100–L102 needing boucle+saut+loupe, L103 final à 3 jardins,
      Mon jardin en 8×6 + partage de codes, compteurs, puis mode avion et réouverture.
