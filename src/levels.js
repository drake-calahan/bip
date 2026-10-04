/* ===== Chapitres et niveaux =====
   Légende : R départ · b n c t a jouets · # buisson · o rocher · ~ flaque · K coffre · . herbe */
const ARROWS = ['l', 'u', 'd', 'r'];
const CHAPTERS = [
  { name: 'Premiers pas', hint: 'Les flèches font avancer Bip.', tone: 'sky' },
  { name: 'Les buissons', hint: 'Bip fait le tour des obstacles.', tone: 'leaf' },
  { name: 'Les flaques', hint: 'Bip évite les pièges.', tone: 'water' },
  { name: 'Le saut', hint: 'Bip saute là où il regarde.', tone: 'lilac' },
  { name: 'Répéter', hint: 'Une boucle refait les mêmes blocs.', tone: 'sun' },
];
const LEVELS = [
  // Chapitre 1
  { ch: 0, pal: ['r'], map: ['.....', 'R..b.', '.....'],
    text: "Bip veut le ballon ! Touche la flèche pour l'ajouter, puis le bouton vert." },
  { ch: 0, pal: ['u', 'd'], map: ['..R..', '.....', '.....', '..n..'],
    text: 'Le nounours est en bas. Quelle flèche faut-il ?' },
  { ch: 0, pal: ARROWS, map: ['R.b..', '.....', '.....', '..c..'],
    text: "Deux jouets ! D'abord le ballon, puis le canard." },
  { ch: 0, pal: ARROWS, map: ['.....', 'b.R.t', '.....', '.....'],
    text: 'Un jouet de chaque côté. Bip peut revenir sur ses pas.' },
  // Chapitre 2
  { ch: 1, pal: ARROWS, map: ['.....', 'R.#.b', '.....'],
    text: 'Oh, un buisson ! Bip ne peut pas passer dedans. Fais le tour.' },
  { ch: 1, pal: ARROWS, map: ['R.#..', '..#.a', '.....', 'o....'],
    text: 'Les buissons font un mur. Trouve le passage.' },
  { ch: 1, pal: ARROWS, map: ['..n..', '.#.#.', 'c....', '.#.o.', '..R..'],
    text: 'Deux jouets cachés entre les buissons.' },
  { ch: 1, pal: ARROWS, map: ['R.#..', '..#.t', '..o..', 'b....'],
    text: 'Un petit labyrinthe. Montre le chemin avec ton doigt avant de commencer.' },
  // Chapitre 3
  { ch: 2, pal: ARROWS, map: ['.....', 'R.~.b', '.....'],
    text: 'Attention, une flaque ! Si Bip marche dedans, il est tout mouillé.' },
  { ch: 2, pal: ARROWS, map: ['R.~..', '..~.c', '~...~'],
    text: 'Des flaques partout. Trouve un chemin bien sec.' },
  { ch: 2, pal: ARROWS, map: ['R.~..', '.#..n', '..~#.', 'b....'],
    text: 'Buissons et flaques : prends ton temps.' },
  { ch: 2, pal: ARROWS, map: ['K.b..', '.~#~.', '..R.n'],
    text: 'Voici le coffre ! Ramasse les jouets, puis range-les dans le coffre.' },
  // Chapitre 4
  { ch: 3, pal: [...ARROWS, 'j'], map: ['##o##', 'R.~.b', '#o###'],
    text: 'Bip sait sauter ! Il saute par-dessus une case, tout droit devant lui.' },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['R.~..', '..~.n', '..~..'],
    text: 'Une rivière de flaques. Avance, puis saute !' },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['..R..', '.....', '~~~~~', '.....', '..c..'],
    text: "Bip saute toujours du côté où il regarde. Fais-le d'abord regarder en bas." },
  { ch: 3, pal: [...ARROWS, 'j'], map: ['R.~.b', '####.', 'Ka~..'],
    text: 'Saute, marche, saute… puis range tout dans le coffre.' },
  // Chapitre 5
  { ch: 4, pal: ['r', 'loop'], max: 2, sol: '5(r)', map: ['......', 'R....b', '......'],
    text: "Bip n'a que 2 piles ! Le bloc Répéter refait la même flèche plusieurs fois." },
  { ch: 4, pal: [...ARROWS, 'loop'], max: 3, sol: '4(rd)', map: ['R....', '.b...', '#.n..', '##.c.', '###.a'],
    text: 'Un escalier ! Mets deux flèches dans le bloc Répéter.' },
  { ch: 4, pal: [...ARROWS, 'loop'], max: 4, sol: '4(r) 4(d)', map: ['R...b', '.~~~.', '.~#~.', '.~~~.', '....n'],
    text: "Deux blocs Répéter, l'un après l'autre." },
  { ch: 4, pal: [...ARROWS, 'j', 'loop'], max: 4, sol: '2(rj) d', map: ['##o####', 'R.~b.~n', '######K'],
    text: 'Le grand défi ! Saute, ramasse et range tout dans le coffre.' },
];
LEVELS.forEach((l, i) => { l.id = i + 1; });

/* "2(rj) d" → programme */
function parseSol(s) {
  let uid = 0;
  return s.trim().split(/\s+/).map(tok => {
    const m = tok.match(/^(\d)\((\w+)\)$/);
    if (m) return { t: 'loop', n: +m[1], id: 's' + uid++, body: [...m[2]].map(c => ({ t: c, id: 's' + uid++ })) };
    return { t: tok, id: 's' + uid++ };
  });
}

if (typeof module !== 'undefined') module.exports = { LEVELS, CHAPTERS, parseSol };
