/* Test rapide des nouvelles mécaniques v2 (nénuphars, champignons/barrières,
   caisses, peinture, mode toboggan). Usage : node tools/smoke-engine.js */
const E = require('../src/engine.js');
const B = require('../src/ball.js');
let fails = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} → ${got}${ok ? '' : ' (attendu ' + want + ')'}`);
}
const P = (src) => E.parseProg(src);

// Nénuphars
check('pad traverse', E.simulate({ map: ['R-b'] }, P('r r'), [], 0).result, 'win');
check('pad coule → splash au retour', E.simulate({ map: ['R-b'] }, P('r l r'), [], 0).result, 'splash');
check('saut par-dessus nénuphar coulé', E.simulate({ map: ['R-~b'] }, P('r j'), [], 0).result, 'win');

// Champignon + barrière
check('barrière fermée bloque', E.simulate({ map: ['RGb'] }, P('r'), [], 0).result, 'bump');
check('champignon ouvre', E.simulate({ map: ['R.sGb'] }, P('r r r r'), [], 0).result, 'win');

// Caisses
check('pousser caisse', E.simulate({ map: ['RC..', '...', '..b'] }, P('r r d d'), [], 0).result, 'win');
check('caisse sur jouet → coincée', E.simulate({ map: ['RC.b.'] }, P('r r'), [], 0).result, 'bump');
check('caisse dans l’eau → pont', E.simulate({ map: ['RC~b.'] }, P('r r r'), [], 0).result, 'win');
check('caisse → champignon → barrière', E.simulate({ map: ['RCs', '#G.', '#n.'] }, P('r d d'), [], 0).result, 'win');
check('sauter sur une caisse → aïe', E.simulate({ map: ['R.C.'] }, P('j'), [], 0).result, 'bump');

// Peinture
check('peindre les fleurs', E.simulate({ map: ['R*.*'] }, P('r r r'), [], 0).result, 'win');
check('fleur manquante', E.simulate({ map: ['R*.*'] }, P('r r'), [], 0).result, 'unpainted');
check('peinture + coffre', E.simulate({ map: ['R*.*K'] }, P('r r r r'), [], 0).result, 'win');

// Solveur étendu
check('solve nénuphars', E.solve({ map: ['R-b'], pal: ['r', 'l', 'u', 'd'] }, ['r', 'l', 'u', 'd'], 0).join(''), 'rr');
check('solve peinture', E.solve({ map: ['R*.'], pal: ['r', 'l', 'u', 'd'] }, ['r', 'l', 'u', 'd'], 0).join(''), 'r');
check('solve refuse caisses', E.solve({ map: ['RC.b'], pal: ['r'] }, ['r'], 0), null);

// Mode toboggan
check('bille droite au nid', B.rollBall({ map: ['S..N.'] }, [[1, 0, 'r']]).result, 'win');
check('bille déviée', B.rollBall({ map: ['S.#..', '....N'] }, [[1, 0, 'd'], [1, 1, 'r']]).result, 'win');
check('bille bloquée', B.rollBall({ map: ['S.#N.'] }, [[1, 0, 'r']]).result, 'stop');
check('bille sort', B.rollBall({ map: ['S...N'] }, [[1, 0, 'u']]).result, 'out');
check('bille tourne en rond', B.rollBall({ map: ['S..', '...', '..N'] }, [[1, 0, 'd'], [1, 1, 'r'], [2, 1, 'u'], [2, 0, 'l']]).result, 'loop');
check('aucune tuile', B.rollBall({ map: ['S..N.'] }, []).result, 'none');

console.log(fails ? `${fails} ÉCHEC(S)` : 'TOUT OK');
process.exitCode = fails ? 1 : 0;
