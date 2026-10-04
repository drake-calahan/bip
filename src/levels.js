/* ===== Chapitres et niveaux =====
   Légende : R départ · b n c t a jouets · # buisson · o rocher · ~ flaque · K coffre · . herbe
   sol / fn / start : programmes écrits dans le petit langage de parseProg (engine.js)
   variants : plusieurs jardins, le même programme doit réussir dans tous */
const ARROWS = ['l', 'u', 'd', 'r'];
const REL = ['f', 'tl', 'tr'];
const CHAPTERS = [
  { name: 'Premiers pas', hint: 'Les flèches font avancer Bip.', tone: 'sky' },
  { name: 'Les buissons', hint: 'Bip fait le tour des obstacles.', tone: 'leaf' },
  { name: 'Les flaques', hint: 'Bip évite les pièges.', tone: 'water' },
  { name: 'Le saut', hint: 'Bip saute là où il regarde.', tone: 'lilac' },
  { name: 'Répéter', hint: 'Une boucle refait les mêmes blocs.', tone: 'sun' },
  { name: 'Tourner', hint: 'Bip avance là où il regarde et pivote.', tone: 'teal' },
  { name: 'Répéter jusqu’à', hint: 'Bip répète tant que la route est libre.', tone: 'coral' },
  { name: 'Si… sinon', hint: 'Bip regarde devant lui et choisit.', tone: 'pink' },
  { name: 'Le bloc magique', hint: 'Bip apprend un nouveau bloc.', tone: 'peach' },
  { name: 'Détective', hint: 'Trouve et corrige les erreurs.', tone: 'slate' },
];
const LEVELS = [
  // Chapitre 1 — Premiers pas
  { ch: 0, pal: ['r'], map: ['.....', 'R..b.', '.....'],
    text: "Bip veut le ballon ! Touche la flèche pour l'ajouter, puis le bouton vert." },
  { ch: 0, pal: ['u', 'd'], map: ['..R..', '.....', '.....', '..n..'],
    text: 'Le nounours est en bas. Quelle flèche faut-il ?' },
  { ch: 0, pal: ARROWS, map: ['R.b..', '.....', '.....', '..c..'],
    text: "Deux jouets ! D'abord le ballon, puis le canard." },
  { ch: 0, pal: ARROWS, map: ['.....', 'b.R.t', '.....', '.....'],
    text: 'Un jouet de chaque côté. Bip peut revenir sur ses pas.' },
  // Chapitre 2 — Les buissons
  { ch: 1, pal: ARROWS, map: ['.....', 'R.#.b', '.....'],
    text: 'Oh, un buisson ! Bip ne peut pas passer dedans. Fais le tour.' },
  { ch: 1, pal: ARROWS, map: ['R.#..', '..#.a', '.....', 'o....'],
    text: 'Les buissons font un mur. Trouve le passage.' },
  { ch: 1, pal: ARROWS, map: ['..n..', '.#.#.', 'c....', '.#.o.', '..R..'],
    text: 'Deux jouets cachés entre les buissons.' },
  { ch: 1, pal: ARROWS, map: ['R.#..', '..#.t', '..o..', 'b....'],
    text: 'Un petit labyrinthe. Montre le chemin avec ton doigt avant de commencer.' },
  // Chapitre 3 — Les flaques
  { ch: 2, pal: ARROWS, map: ['.....', 'R.~.b', '.....'],
    text: 'Attention, une flaque ! Si Bip marche dedans, il est tout mouillé.' },
  { ch: 2, pal: ARROWS, map: ['R.~..', '..~.c', '~...~'],
    text: 'Des flaques partout. Trouve un chemin bien sec.' },
  { ch: 2, pal: ARROWS, map: ['R.~..', '.#..n', '..~#.', 'b....'],
    text: 'Buissons et flaques : prends ton temps.' },
  { ch: 2, pal: ARROWS, map: ['K.b..', '.~#~.', '..R.n'],
    text: 'Voici le coffre ! Ramasse les jouets, puis range-les dans le coffre.' },
  // Chapitre 4 — Le saut
  { ch: 3, pal: [...ARROWS, 'j'], map: ['##o##', 'R.~.b', '#o###'],
    text: 'Bip sait sauter ! Il saute par-dessus une case, tout droit devant lui.' },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['R.~..', '..~.n', '..~..'],
    text: 'Une rivière de flaques. Avance, puis saute !' },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['..R..', '.....', '~~~~~', '.....', '..c..'],
    text: "Bip saute toujours du côté où il regarde. Fais-le d'abord regarder en bas." },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['R.~.b', '####.', 'Ka~..'],
    text: 'Saute, marche, saute… puis range tout dans le coffre.' },
  // Chapitre 5 — Répéter
  { ch: 4, pal: ['r', 'loop'], max: 2, sol: 'N5(r)', map: ['......', 'R....b', '......'],
    text: "Bip n'a que 2 piles ! Le bloc Répéter refait la même flèche plusieurs fois." },
  { ch: 4, pal: [...ARROWS, 'loop'], max: 3, sol: 'N4(r d)', map: ['R....', '.b...', '#.n..', '##.c.', '###.a'],
    text: 'Un escalier ! Mets deux flèches dans le bloc Répéter.' },
  { ch: 4, pal: [...ARROWS, 'loop'], max: 4, sol: 'N4(r) N4(d)', map: ['R...b', '.~~~.', '.~#~.', '.~~~.', '....n'],
    text: "Deux blocs Répéter, l'un après l'autre." },
  { ch: 4, pal: [...ARROWS, 'j', 'loop'], max: 4, sol: 'N2(r j) d', map: ['##o####', 'R.~b.~n', '######K'],
    text: 'Le grand défi ! Saute, ramasse et range tout dans le coffre.' },

  // Chapitre 6 — Tourner (repère relatif)
  { ch: 5, pal: REL, face: 'u', map: ['..b..', '.....', '.....', '..R..'],
    text: 'Nouveaux blocs ! Avance fait aller Bip tout droit, là où il regarde. Ici, il regarde vers le haut.' },
  { ch: 5, pal: REL, face: 'r', map: ['....n', '.....', 'R....'],
    text: 'Tourne fait pivoter Bip sur place, sans avancer. Tourne-le, puis avance.' },
  { ch: 5, pal: REL, face: 'r', map: ['R.##.', '#.#..', '#t..b'],
    text: 'Un chemin en zigzag. Imagine que tu es Bip : à gauche ou à droite ?' },
  { ch: 5, pal: [...REL, 'j'], face: 'd', map: ['..b..', '..~..', '..R..', '.....'],
    text: 'Le ballon est derrière Bip ! Fais-lui faire demi-tour, puis saute la flaque.' },

  // Chapitre 7 — Répéter jusqu'à (boucle conditionnelle)
  { ch: 6, pal: [...REL, 'while'], max: 2, sol: 'Wo(f)', map: ['.......', 'R.....b', '.......'],
    text: "Nouveau : Répéter jusqu'à. Bip répète jusqu'à ce qu'un obstacle soit devant lui. Ici, le bord du jardin." },
  { ch: 6, pal: [...REL, 'while'], max: 5, sol: 'Wo(f) tr Wo(f)',
    variants: [
      ['R..b#..', '.......', '.......', '.......', '...n...'],
      ['R....b#', '.......', '.......', '.....n.', '.....o.'],
      ['R.b#...', '.......', '.......', '.......', '..n....'],
    ],
    text: "Trois jardins, un seul programme ! Les chemins n'ont pas la même longueur." },
  { ch: 6, pal: [...REL, 'while'], max: 2, sol: 'Wt(f)',
    variants: [
      ['.......', 'R..b..~', '.......'],
      ['.......', 'R....b~', '.......'],
      ['.......', 'R.b.~..', '.......'],
    ],
    text: "Attention à la flaque ! Touche le rond du bloc pour changer : jusqu'à un obstacle, ou jusqu'à avoir tous les jouets." },
  { ch: 6, pal: [...REL, 'while', 'loop'], max: 4, sol: 'N3(Wo(f) tr)', map: ['R...b', '.~~~.', '.~#~.', '.~~~.', 'n...c'],
    text: "Un Répéter jusqu'à, dans un Répéter ! Bip fait le tour de la mare." },

  // Chapitre 8 — Si… sinon (conditions), plusieurs jardins
  { ch: 7, pal: [...REL, 'j', 'while', 'if'], max: 4, sol: 'Wo(Ip(j|f))',
    variants: [
      ['........', 'R.~.~..b', '........'],
      ['........', 'R..~..~b', '........'],
      ['........', 'R~..~.b.', '........'],
    ],
    text: 'Nouveau : le bloc Si. Si une flaque est devant Bip, il fait la ligne verte. Sinon, il fait la ligne grise.' },
  { ch: 7, pal: [...REL, 'while', 'if'], max: 4, sol: 'Wt(Io(tr|f))',
    variants: [
      ['R....', '####.', '####.', 'b....'],
      ['R..#.', '##.##', '##.##', 'b....'],
      ['R....', '####.', '#b...', '#....'],
    ],
    text: 'Le bloc Si peut aussi regarder les obstacles. Si un obstacle est devant, Bip tourne. Sinon, il avance.' },
  { ch: 7, pal: [...REL, 'j', 'while', 'if'], max: 9, sol: 'Wo(Ip(j|f)) tr Wo(Ip(j|f))',
    variants: [
      ['R.~.n.', '......', '.....~', '.....b'],
      ['R..~.b', '.....~', '......', '.....n'],
      ['R~..~.', '......', '.....~', '.....n'],
    ],
    text: 'Des flaques et un virage, dans trois jardins différents.' },
  { ch: 7, pal: [...REL, 'while', 'if'], max: 4, sol: 'Wt(Io(tr|f))',
    variants: [
      ['R....', '####.', '.a.#.', '.###.', '.....'],
      ['R..#.', '##.#.', '##.#.', 'b..#.', '####.'],
      ['R....', '####.', '...#.', '.#.#.', '#t...'],
    ],
    text: "Le grand escargot ! Répète jusqu'à avoir tous les jouets." },

  // Chapitre 9 — Le bloc magique (fonction)
  { ch: 8, pal: [...REL, 'star'], max: 7, sol: '* * *', fn: 'f tl f tr', face: 'r', map: ['...a', '..n.', '.c.#', 'R.##'],
    text: 'Nouveau : le bloc magique. Range des blocs dans la ligne étoile, puis utilise l’étoile autant de fois que tu veux.' },
  { ch: 8, pal: [...REL, 'j', 'star'], max: 8, sol: '* tr * tr *', fn: 'f j f', map: ['R.~.b', '.###.', '.#o#~', '.###.', 'n.~.c'],
    text: "Les trois côtés se ressemblent. Apprends le trajet d'un côté au bloc magique." },
  { ch: 8, pal: [...REL, 'star'], max: 9, sol: '* * * *', fn: 'f tl tl f tr', face: 'u', map: ['#~.~#', '~.b.~', '.nRc.', '~.a.~', '#~.~#'],
    text: 'Bip va chercher un jouet, puis revient au milieu. Quatre fois !' },
  { ch: 8, pal: [...REL, 'j', 'while', 'if', 'star'], max: 8, sol: 'Wo(*) tr Wo(*)', fn: 'Ip(j|f)',
    variants: [
      ['R..~.b', '......', '.....~', '.....n'],
      ['R~.~c.', '.....~', '......', '.....a'],
      ['R.~...', '......', '.....~', '.....t'],
    ],
    text: 'Tu te souviens du niveau 31 ? Avec un bloc magique qui contient un Si, le programme est plus court.' },

  // Chapitre 10 — Détective (débogage) et défi final
  { ch: 9, pal: ARROWS, start: 'd r r r r u', map: ['R.#..', '..#.a', '.....', 'o....'],
    text: 'Bip a écrit un programme, mais il y a une erreur. Lance-le, regarde où ça coince, puis corrige-le.' },
  { ch: 9, pal: [...ARROWS, 'loop'], max: 4, sol: 'N4(r) N4(d)', start: 'N3(r) N4(d)', map: ['R...b', '.~~~.', '.~#~.', '.~~~.', '....n'],
    text: "Ce programme s'arrête trop tôt. Quel nombre faut-il changer ?" },
  { ch: 9, pal: [...REL, 'j', 'while', 'if'], max: 4, sol: 'Wo(Ip(j|f))', start: 'Wo(Ip(f|j))',
    variants: [
      ['........', 'R.~.~..b', '........'],
      ['........', 'R..~..~b', '........'],
      ['........', 'R~..~.b.', '........'],
    ],
    text: "Le bloc Si s'est trompé de ligne. Répare-le pour les trois jardins." },
  { ch: 9, pal: [...REL, 'j', 'loop', 'while', 'if', 'star'], sol: 'N2(Wo(*) tr) Wo(*)', fn: 'Ip(j|f)',
    map: ['R.~n..', '#####.', '..o.#~', '#####.', 'K.~.b.'],
    text: 'Le grand défi final ! Ramasse tout et range dans le coffre. Tous tes blocs sont là.' },
];
LEVELS.forEach((l, i) => { l.id = i + 1; });

if (typeof module !== 'undefined') module.exports = { LEVELS, CHAPTERS };
