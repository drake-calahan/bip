# Bip V4 — Plan de bêta-test sur tablette

## Ce que l'on cherche à savoir

Trois questions, dans cet ordre :

1. **Autonomie** : un enfant de 5-7 ans qui ne lit pas (ou peu) se déplace-t-il
   seul dans le jeu — carte, niveau, machines, retour — grâce aux images et à la voix ?
2. **Fluidité** : les gestes (toucher un bloc, glisser un panier, tourner un
   miroir, lâcher la machine) sont-ils compris du premier coup, sans explication ?
3. **Plaisir** : l'enfant veut-il continuer, revient-il de lui-même, rit-il,
   parle-t-il à Bip ?

La séance ne mesure ni un niveau scolaire ni un apprentissage. Elle observe
l'usage. Aucun score, aucune durée imposée : on arrête quand l'enfant le souhaite.

## Installer sur la tablette

1. Ouvrir `https://drake-calahan.github.io/bip/` dans Chrome.
2. Menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
3. Lancer Bip depuis son icône : plein écran, puis hors connexion.
4. Vérifier le volume et que la voix française parle (si ce n'est pas le cas :
   Paramètres Android → Synthèse vocale → installer une voix française).
5. Première séance : progression vierge (ou « Effacer la progression » dans
   « Pour les adultes »). Ne pas effacer entre deux séances du même enfant.

Un seul enfant par tablette : la sauvegarde est locale (`bip-robot-v2`).

## Déroulé conseillé (15 à 25 minutes)

| Temps | Ce que fait l'enfant | Ce que l'adulte regarde |
|---|---|---|
| 1 min | Tablette en main, aucune consigne : « C'est Bip. Vas-y. » | Trouve-t-il « Jouer » seul ? Écoute-t-il la bulle ? |
| 6-8 min | Niveaux 1 à 5 (flèches, premier jouet, coffre). | Comprend-il toucher = ajouter, toucher encore = enlever ? Réécoute-t-il la bulle ? Que fait-il quand Bip se cogne ? |
| 2 min | Retour à la carte (maison), regarde le chemin. | Reconnaît-il où il en est ? Essaie-t-il un caillou pâle ? |
| 5-8 min | « Les machines » (l'engrenage) : la balance, puis une autre au choix. | Glisse-t-il le panier sans aide ? Appuie-t-il sur « Lâcher » spontanément ? Utilise-t-il « Je pense… » ? Comprend-il le résultat ? |
| 2-3 min | Libre : Mon jardin, le défi de Zoé, l'album… ou rien. | Où va-t-il de lui-même ? |

Séances suivantes : reprendre là où il en est, sans consigne. Noter à quel
niveau il s'arrête et pourquoi (fatigue, blocage, autre envie).

**Posture de l'adulte** : ne pas toucher l'écran. Reformuler la bulle si
l'enfant le demande. Si blocage > 1 minute : « Tu veux que Bip te montre ? »
(l'ampoule). Noter chaque aide apportée, c'est une donnée.

## Grille de retours — une ligne par observation

Copier ce tableau dans `docs/RETOURS-BETA.md` (ou un fichier par séance), une
ligne par fait observé. Pas d'interprétation dans la ligne : une action, une
phrase, un geste.

| Séance | Âge | Écran | Moment (niveau / machine / carte) | Observation (fait brut) | Aide donnée | Gravité |
|---|---|---|---|---|---|---|
| S1 | 6 | tablette 10" | Niveau 3 | A touché le ballon sur le plateau au lieu de la flèche, deux fois. | reformulé | gênant |

Gravité : **bloquant** (ne peut pas continuer seul) · **gênant** (hésite,
demande, se trompe plusieurs fois) · **détail** (remarque, souhait) ·
**positif** (rire, « encore », phrase spontanée).

Dans l'observation, noter aussi les phrases de l'enfant telles quelles :
« il est tombé dans l'eau », « je veux la rouge » — elles disent ce que les
images veulent dire pour lui.

## Les points que V4 veut vérifier en particulier

- [ ] La **carte-chemin** : comprend-il que Bip est « sur » le prochain niveau ? Les cailloux pâles le frustrent-ils ?
- [ ] La **bulle** : écoute-t-il jusqu'au bout ? Comprend-il que toucher la bulle relit / passe à la suite ?
- [ ] Les **quatre ronds** de l'accueil : sait-il ce qu'ils ouvrent après une première fois ?
- [ ] **Glisser le panier** (balance) : geste naturel ou tente-t-il de toucher ?
- [ ] **Tourner un miroir** d'un tap : comprend-il que le miroir a changé ?
- [ ] **« Je pense… »** : l'utilise-t-il ? L'ignore-t-il ? Est-ce un parasite ?
- [ ] Le **bouton vert** des machines (« Lâcher », « Allumer »…) : le trouve-t-il seul ?
- [ ] La **carte de fin de chapitre** avec la mascotte : comprend-il que c'est une réussite ?
- [ ] La **voix** : trop rapide ? Mots inconnus ? (noter lesquels)
- [ ] **Fatigue** : à quel moment, sur quel écran ?

## Vérifications adulte (une fois, avant la première séance)

- [ ] `node tools/check-levels.js` → `ALL OK` ; `node tools/check-ui.js` → `UI OK`.
- [ ] Sur la tablette : son, voix, rotation portrait/paysage, mode avion après un premier chargement.
- [ ] Un niveau de chaque mode se joue : classique, nénuphars (26), caisses (51), pollen (56), détective (61), toboggan (66), nuit (71).
- [ ] Les quatre machines : glisser, toucher, lâcher, indice, recommencer, suivant.
- [ ] Mon jardin : poser, effacer, jouer ; retrouver le jardin après fermeture de l'app.
- [ ] « Pour les adultes » : voix et sons coupés, le jeu reste jouable.

## Décider de la suite

- **Bloquant** observé chez un enfant → corrigé avant la séance suivante.
- **Gênant** observé chez deux enfants (ou deux fois chez le même) → entre dans la prochaine itération.
- **Détail** → liste d'idées, sans engagement.
- Un enfant qui réussit sans comprendre (clics au hasard) n'est pas un succès ;
  un enfant qui se trompe puis corrige en est un.
