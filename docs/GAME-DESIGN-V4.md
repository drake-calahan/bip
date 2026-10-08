# Bip V4 — « Le grand jardin » — Document de conception

V4 n'ajoute pas de contenu : elle reprend tout ce qui marchait dans V1, V2 et V3
et le porte dans **une seule expérience fluide, pensée pour des mains de six ans**.
Le moteur (`engine.js`, `ball.js`), les 87 niveaux (`levels.js`) et les modèles des
ateliers (`lab.js`) sont inchangés. Tout ce que l'enfant voit et touche est refait.

## 1. Ce que les trois versions nous ont appris

| Version | Ce qui est précieux (gardé) | Ce qui coinçait (corrigé) |
|---|---|---|
| **V1** | Le cœur du jeu : plateau, blocs tactiles géants, toucher = ajouter, glisser = déplacer, bulle de Bip lue à voix haute, pas-à-pas, ampoule-chemin, piles pour forcer la boucle, 3 jardins pour le Si, détective, bloc magique. Rien à changer. | — |
| **V2** | L'histoire et ses 8 personnages, les mécaniques (nénuphars, champignons/barrières, caisses-ponts, pollen, toboggans), 80 niveaux + 7 défis validés, Mon jardin, l'album. | La carte est une liste de cadenas ; l'histoire est une pile de cartes modales (« Suite → Suite → Suite ») avant de jouer ; le niveau 1 arrive après 4 écrans. |
| **V3** | La boucle *regarder → construire → prédire → observer → comparer*. Quatre jolis modèles exacts (balance, lumière, engrenages, rythmes). | Réalisée comme un formulaire : boutons radio « 12 dents », « Je pense que… », onglets, carnet « Mes découvertes ». Un enfant qui ne lit pas est perdu. Deuxième langage visuel (lab.css). |

## 2. Le contrat V4 (six règles)

1. **Zéro lecture pour naviguer.** Tout ce qui se touche est une image, un visage ou
   une icône. Le texte existe, mais il est toujours lu par la voix, jamais nécessaire.
2. **Un geste = une chose, partout.** Toucher ajoute, toucher encore enlève, glisser
   déplace. Le même vocabulaire gestuel dans l'aventure, les toboggans, les machines
   et Mon jardin.
3. **Le jeu d'abord.** Accueil → bouton « Jouer » → le prochain niveau, en un seul
   geste. L'histoire se raconte *dans* le niveau, par la bulle du personnage.
   Une seule carte-histoire par monde (4 dans tout le jeu), et le pique-nique final.
4. **La carte est un chemin.** Un sentier sinueux traverse 4 mondes aux couleurs
   différentes ; Bip est posé sur le prochain niveau ; les niveaux réussis portent
   leurs étoiles ; les suivants sont des cailloux pâles, jamais des cadenas.
5. **L'écran de jeu respire.** Trois zones : le plateau (grand), la ligne de programme,
   la palette (blocs de 60 px, à portée de pouce). Le bouton vert est le plus gros
   bouton de l'écran. La bulle flotte sur le plateau avec le visage de celui qui parle.
6. **Les ateliers sont des machines, pas des réglages.** On glisse les paniers sur la
   planche, on tourne un miroir d'un doigt, on change une roue d'un tap, on décale un
   ami sur la ligne du temps. Le bouton vert « lâche » la machine : elle réagit.
   La prédiction reste possible, en touchant une image avant de lâcher — jamais
   un questionnaire.

Et toujours : aucun chrono, aucune vie, aucun méchant, une erreur est une information
(« Oups ! »), le pastel doux, le tutoiement, deux phrases courtes maximum par bulle.

## 3. Les écrans

### 3.1 La carte (accueil)

- **Bandeau** : Bip qui salue, le gros bouton « Jouer » (« Continuer » après le
  premier niveau), le jardin fleuri (une fleur par chapitre terminé).
- **Quatre ronds-images** sous le bandeau, sans texte obligatoire : Zoé (défi du
  jour, avec ses 7 points), la fleur (Mon jardin), l'engrenage (les machines de
  Grand-Papa), l'étoile (l'album). Un tout petit « i » pour les adultes.
- **Le chemin** : un sentier qui serpente de haut en bas. Chaque chapitre commence
  par une bannière avec sa mascotte et son nom ; chaque niveau est un caillou rond.
  Caillou réussi : numéro + étoiles. Prochain caillou : Bip est assis dessus et il
  respire (halo). Cailloux à venir : plus petits, pâles, sans numéro.
  Le fond change de monde en monde : pré vert, mare bleue, atelier ocre, nuit indigo.
- À l'ouverture, la carte se positionne sur Bip.

### 3.2 Le niveau

```
 [maison] [jouets à ramasser → coffre]            [ampoule]
 ┌──────────────────────────────────────────────┐
 │ (bulle : visage + 2 lignes)                   │
 │                 PLATEAU                        │
 └──────────────────────────────────────────────┘
 [ programme : ▭ ▭ ▭ + ]  [piles]  [poubelle]   ( ▶ )  [»]
 [ palette : grands blocs ]
```

- La bulle flotte en haut du plateau, avec l'avatar du personnage qui parle
  (Bip, Zoé, Lulu, Grand-Papa…). Toucher la bulle la relit.
- Premier niveau d'un chapitre : la mascotte dit sa phrase d'intro, puis Bip donne
  la consigne. Premier niveau d'un monde : une carte-histoire (une seule), que l'on
  ferme en touchant n'importe où.
- Fin de chapitre : la mascotte apparaît sur la carte « Bravo ! » et dit sa phrase
  de fin. Pas d'écran supplémentaire.
- Paysage large : plateau à gauche, bulle + programme + palette à droite.

### 3.3 Les machines de Grand-Papa (ex-ateliers)

Hub : quatre grandes images-machines, trois petits ronds (les défis) sous chacune,
un rond « ✎ » pour jouer librement. Dans un défi, le même chrome que le niveau :
maison, trois ronds de progression, ampoule ; bulle avec Grand-Papa (ou Noctule
pour la lumière, Zoé pour les rythmes) ; la machine au centre ; en bas le gros
bouton vert « Essayer » et la flèche « Recommencer ».

| Machine | Manipulation directe | Ce que fait le bouton vert |
|---|---|---|
| **La balance** | On glisse les paniers sur les crans de la planche (les paniers fixes sont vissés). | La planche est lâchée : elle penche ou reste droite, avec un son. |
| **La lumière** | Toucher un miroir le fait pivoter. | Le rayon part de la lampe et voyage case par case ; la luciole s'allume. |
| **Les roues** | Toucher une roue change sa taille (petite, moyenne, grande), avec ses vraies dents. | Les roues tournent (sens et vitesse exacts) ; on compte les tours de Zoé. |
| **Le rendez-vous** | Toucher un ami le décale d'un pas sur la ligne du temps. | Les amis font coucou pas à pas ; au rendez-vous, un cœur. |

- **Prédire** : avant de lâcher, trois images (par exemple : penche à gauche, reste
  droite, penche à droite). Toucher l'une d'elles est facultatif. Après l'essai,
  l'image juste s'allume ; la voix dit « Tu pensais à gauche… regarde, c'est à
  droite ! ». Jamais de note, jamais de « faux ».
- **Découverte** : quand un défi est réussi, la phrase de découverte (« Un petit
  poids, loin du centre, peut équilibrer un gros poids ») est lue et devient un
  autocollant de l'album. Le carnet séparé disparaît : l'album est le seul endroit
  des souvenirs.
- **Inventer** : le défi 3 de chaque machine, sans objectif. Les réglages restent
  les mêmes objets, au même endroit.

### 3.4 Mon jardin, le défi de Zoé, l'album

- **Mon jardin** garde ses 3 emplacements ; les éléments sont dans un tiroir
  horizontal à faire défiler avec le doigt ; le pouce reste en bas.
- **Le défi de Zoé** s'ouvre depuis le rond de Zoé ; ses 7 points de la semaine
  sont dessinés autour d'elle.
- **L'album** montre de vraies images (mascottes, jouets, machines), pas des
  cadenas gris : ce qui manque est en filigrane, pour donner envie.

## 4. Détails qui font la différence

- Chaque bouton rond de l'accueil **dit son nom** à voix haute quand on l'ouvre.
- Le bouton vert fait 72 px et ne bouge jamais de place.
- Les blocs de la palette font 60 px sur téléphone ; le programme défile en
  hauteur et montre toujours le bloc en cours.
- Un seul vocabulaire de couleurs (les tokens de V1) pour tout le jeu, machines
  comprises. Pas de thème sombre : le jardin de nuit est un plateau indigo, pas
  un écran noir.
- Le son et la voix restent réglables dans la feuille adultes ; `prefers-reduced-motion`
  est respecté partout.
- Compatible avec la sauvegarde `bip-robot-v2` : étoiles, autocollants, jardins
  créés, défis réussis et défis de machines sont conservés.

## 5. Ce que V4 enlève, et pourquoi

- Les onglets de l'accueil et le carnet « Mes découvertes » : remplacés par
  l'album, un seul lieu pour les souvenirs.
- Les inventions sauvegardées des ateliers : peu d'intérêt pour l'enfant, coût de
  compréhension élevé. Le mode libre reste, sans sauvegarde.
- Les enchaînements de cartes-histoire : remplacés par la bulle et la carte Bravo.
- La deuxième feuille de style (`lab.css`) : fusionnée.

## 6. Vérification

- `node tools/check-levels.js` → `ALL OK` (inchangé).
- `node tools/smoke-engine.js`, `node tools/check-labs.js` (modèles purs, inchangés).
- `node tools/check-ui.js` : parcours Playwright V4 — carte, niveau 1 joué et gagné,
  toboggan, machine (balance) gagnée, Mon jardin, album, feuille adultes, en
  390 × 844 et 1280 × 800. Captures dans `.artifact/`.
- Séance enfant/adulte : `docs/BETA-TEST-V4.md`, retours dans `docs/RETOURS-BETA.md`.
