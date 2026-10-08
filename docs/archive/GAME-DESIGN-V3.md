# Bip v3 - L'Atelier des possibles

## Intention

La v3 ajoute un laboratoire de jeux de physique et de mathématiques au voyage de
Bip. Elle conserve le jardin, les programmes en blocs, les personnages, les
ateliers de Grand-Papa Engrenage et le grand pique-nique de la v2. L'aventure,
les défis de Zoé, le créateur de jardins et l'album restent des expériences à
part entière.

L'Atelier des possibles donne à l'enfant une nouvelle façon d'agir : construire
une situation, prévoir son effet, puis regarder ce que fait la machine. Il est
accessible dans l'onglet « Les ateliers » pour permettre un essai local sans
terminer l'aventure. Les onglets « L'aventure » et « Mes découvertes » donnent
accès au voyage et au carnet. Ses défis servent de tremplin à l'expérimentation
libre.

Le public visé reste les enfants de 5 à 7 ans, avec un adulte disponible lors
de la découverte. L'âge indique une intention de conception, pas une validation
du niveau de difficulté ni une promesse d'apprentissage démontrée.

## Le contrat de jeu

- Aucune vie, aucun compte à rebours et aucun classement.
- Une erreur produit une observation utile ; elle ne retire pas de récompense.
- Une seule idée nouvelle à la fois, avec un premier défi presque immédiat.
- Des objets visibles et manipulables avant les symboles et les nombres.
- Des consignes françaises courtes, relisibles avec la voix lorsque disponible.
- Son, voix et mouvement restent réglables ; la couleur ne porte pas seule une
  information essentielle.
- La progression appartient à cet appareil. Aucun compte ni collecte de données
  personnelles n'est requis pour la bêta locale.

## Boucle de découverte

1. **Regarder.** L'objectif et les objets montrent la question à résoudre.
2. **Construire.** L'enfant manipule un petit nombre de paramètres concrets.
3. **Prédire.** Il peut choisir ce qu'il pense voir dans « Je pense que… » avant
   de lancer son essai.
4. **Observer.** Le résultat rend visible la relation entre son choix et son effet.
5. **Comparer.** Il peut modifier un paramètre et refaire l'expérience.
6. **Retenir.** Le carnet garde la découverte associée à un défi réussi.

Le bouton « Essayer » lance l'expérience. L'ampoule donne un indice et la flèche
circulaire remet la situation à son point de départ. Après la réussite,
« Expérience suivante » propose la suite et « Mon invention » ouvre le mode
libre. La prédiction reste facultative et n'est pas une interrogation notée.
Une prédiction différente du résultat invite à un nouvel essai. L'enfant peut
réussir le défi après avoir révisé son idée et continuer à jouer avec la machine.

L'adulte peut dire : « Qu'est-ce qui changerait si tu déplaçais seulement ceci ? »
Cette question contrefactuelle est le fil commun aux quatre ateliers. Elle aide
à distinguer une explication d'un réglage obtenu au hasard, sans exiger que
l'enfant connaisse le vocabulaire scientifique.

## Quatre familles de puzzles

Le PoC organise chaque famille en trois défis progressifs, soit douze défis.
Un défi introduit la relation, le suivant fait varier un paramètre, le dernier
demande un transfert dans une situation moins immédiate. Les sources de
`src/lab.js` définissent les objectifs, les réglages et les références de succès.

### La balance de Grand-Papa

**Question :** peut-on équilibrer deux côtés avec des objets placés à des
distances différentes ?

L'enfant dispose de masses et de positions sur une poutre. La balance indique
quel côté descend ou si les deux côtés se compensent. Dans « Les deux paniers »,
l'enfant déplace seulement le petit panier pour compenser un gros panier fixe.
« Près ou loin ? » inverse cette recherche. « Deux amis sur la planche » fait
composer deux petits paniers face à un gros.

**Sens physique :** une masse agit davantage quand elle est loin du pivot.
**Sens mathématique :** comparer, composer, chercher des équivalences ; préparer
la multiplication sans demander de calcul formel.

L'innovation de jeu réside dans la recherche d'équivalences : une construction
peut devenir un exemple pour en inventer une autre dans le mode libre. Les défis
de balance du PoC ont un réglage gagnant dans leurs choix proposés ; la relation
physique générale admet d'autres constructions si l'on change les données.

### Les chemins de lumière

**Question :** où va le rayon quand on tourne un miroir ?

L'enfant oriente des miroirs sur une grille pour guider un rayon vers des
récepteurs. Le premier défi rend visible le changement de direction. Les
suivants demandent d'anticiper plusieurs rencontres et explorent le partage
d'un chemin lumineux en plusieurs branches.

**Sens physique :** associer une orientation à un trajet ; constater qu'un
obstacle arrête la lumière dans ce modèle.
**Sens mathématique :** repérage spatial, transformations, trajectoires et
raisonnement sur un réseau de chemins.

Le rayon observé sert de trace de raisonnement. Avant de déplacer un objet,
l'enfant peut chercher la première rencontre où son trajet prévu et le trajet
observé se séparent.

### Les roues complices

**Question :** dans quel sens et à quelle vitesse tourne la dernière roue ?

Les engrenages rendent les rapports visibles avec des roues de tailles
différentes. Le premier défi introduit l'inversion du sens entre deux roues en
contact. Les suivants font comparer les vitesses et composer plusieurs
transmissions. « La roue messagère » accepte plusieurs tailles de roue
intermédiaire : elles changent son mouvement, sans changer le résultat final
quand les roues d'entrée et de sortie restent les mêmes.

**Sens physique :** les dents transmettent le mouvement, les grandes et petites
roues ne font pas le même nombre de tours dans le même temps.
**Sens mathématique :** alternance, parité du nombre de contacts, proportions et
composition de relations.

La forme de la roue et son mouvement donnent un accès concret à une relation
numérique. L'enfant peut vérifier une hypothèse de sens indépendamment de son
hypothèse de vitesse.

### Le rendez-vous des lucioles

**Question :** quand deux rythmes se rencontrent-ils ?

L'enfant règle le décalage de cycles périodiques et observe leurs rendez-vous sur
une ligne de temps. « Main dans la main » rapproche deux rythmes de trois pas.
« Deux pas, trois pas » fait chercher un rendez-vous au pas 4. « Le trio du
pique-nique » réunit les périodes de deux, trois et quatre pas au pas 6.

**Sens physique :** observer un système qui évolue régulièrement dans le temps.
**Sens mathématique :** suites, motifs, multiples et synchronisation.

Le temps est un objet à examiner, jamais un délai imposé au joueur. L'enfant
peut réfléchir aussi longtemps que nécessaire avant de lancer l'expérience.

## Modèles pédagogiques et limites

Les ateliers sont des modèles idéaux volontairement réduits. Leurs résultats
doivent être cohérents et déterministes pour rendre les comparaisons lisibles.
Ils ne constituent pas une simulation générale de la physique.

| Atelier | Hypothèses | Ce que le modèle laisse de côté |
|---|---|---|
| Balance | Poutre rigide, pivot fixe, masses ponctuelles, gravité identique des deux côtés ; équilibre par égalité des sommes masse × distance. | Déformation, frottement du pivot, mouvement oscillant réel et poids propre d'une poutre non uniforme. |
| Lumière | Grille discrète, déplacements orthogonaux, miroirs idéaux ; une branche suit les règles définies pour le puzzle. | Ondes, diffraction, réfraction, intensité, couleurs et conservation quantitative de l'énergie lors du partage du rayon. |
| Engrenages | Roues idéales, dents compatibles, contacts sans glissement ; nombres de dents entiers et rapports simples fondés sur ces nombres. | Jeux mécaniques, frottements, inertie, couple transmis et nécessité d'un montage réalisable dans toutes les géométries. |
| Rythmes | Horloges discrètes, périodes entières et décalages explicites ; rencontres calculées sur les mêmes instants. | Dérive des horloges, signaux continus, incertitudes et propagation réelle d'un signal. |

Une balance immobile dans le jeu indique l'équilibre des moments, pas l'absence
de forces. Un partage lumineux dessiné ne prouve pas que deux branches
transportent chacune toute l'énergie initiale. Une roue qui tourne ne démontre
pas que le montage fournirait assez de force pour une machine réelle. Une
rencontre périodique dans le jeu suppose que les deux horloges restent exactes.

Ces précisions servent aux adultes et aux auteurs du projet. Elles ne doivent
pas transformer l'interface enfant en cours technique.

## Accompagnement progressif

Au début, un adulte peut lire et reformuler l'objectif sans donner le réglage.
L'enfant doit pouvoir pointer une position, un trajet ou un mouvement pour
exprimer sa prédiction. La verbalisation est utile, mais ne doit pas devenir
une condition de réussite.

Pour un enfant qui découvre, privilégier les quantités petites, les comparaisons
à vue et un seul paramètre modifiable. Pour un enfant déjà à l'aise, demander
une autre solution ou une explication avant l'essai. Le passage à plusieurs
paramètres se fait après une observation comprise, sans associer rigidement une
difficulté à un âge.

Le carnet de découvertes garde une phrase courte et concrète. Il rappelle une
relation rencontrée ; il ne mesure ni une compétence acquise ni un niveau
scolaire. L'onglet « Mes découvertes » distingue les expériences réussies de
celles qui restent à explorer. Un enfant peut refaire un défi même si sa
découverte est déjà inscrite.

## Expérimentation libre

Le mode libre réutilise les mêmes manipulations et les mêmes règles que les
défis. Il permet de construire, observer et recommencer sans objectif imposé.
Chaque famille conserve une situation initiale compréhensible et un retour
facile aux défis. « Inventer » ouvre ce mode depuis l'accueil. Les changements
portent sur les réglages disponibles ; il ne s'agit pas d'un éditeur général de
machines.

« Garder mon invention » enregistre une recette locale par famille, soit quatre
recettes au maximum. Garder une autre invention de la même famille remplace la
recette précédente. Ces recettes et les découvertes sont ajoutées à la
sauvegarde existante `bip-robot-v2`, qui conserve aussi la progression du voyage.

L'adulte peut proposer un petit défi personnel : faire pencher la balance dans
l'autre sens, changer un seul miroir, garder le sens mais changer la vitesse,
ou obtenir un autre rendez-vous. Ces suggestions ne sont ni des niveaux
supplémentaires garantis ni des fonctions d'édition à supposer dans le PoC.

## Critères de qualité du PoC

- Chaque défi dispose d'une configuration de référence qui atteint son objectif.
- Les moteurs restent testables sans interface ni effets de bord.
- L'état affiché, la prédiction, le résultat et le succès décrivent la même
  situation, y compris après une modification ou une remise à zéro.
- Les commandes sont utilisables au toucher et au clavier, et leurs libellés
  restent lisibles sur téléphone comme sur ordinateur.
- L'atelier et son carnet peuvent être quittés et retrouvés sans perdre le
  fonctionnement de l'aventure, du jardin créé ou du défi quotidien.
- Le build local et la mise en cache doivent inclure les nouvelles sources ;
  l'absence de réseau ne doit pas invalider un essai déjà disponible.

`node tools/check-labs.js` vérifie les modèles et les défis de l'atelier.
`node tools/check-levels.js` et `node tools/smoke-engine.js` restent nécessaires
pour l'aventure. Une commande passée ne remplace pas une observation de
l'interface ni une séance enfant ; les résultats effectifs sont à consigner
avec la version testée.

Les vérifications techniques documentent la cohérence des règles et de
l'interface. La clarté pour les 5-7 ans, le plaisir et l'effet pédagogique
restent à observer en bêta avec des enfants. Le protocole est décrit dans
[BETA-TEST-V3.md](BETA-TEST-V3.md).
