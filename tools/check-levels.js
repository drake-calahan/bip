const E = require('../src/engine.js');
const { LEVELS, parseSol } = require('../src/levels.js');
let ok = true;
const out = {};
for (const lv of LEVELS) {
  const bfs = E.solve(lv, lv.pal);
  let line = `L${lv.id} ch${lv.ch + 1} ${lv.map[0].length}x${lv.map.length} `;
  if (!bfs) { line += 'UNSOLVABLE'; ok = false; console.log(line); continue; }
  line += `bfs=${bfs.length} [${bfs.join('')}]`;
  let ref;
  if (lv.sol) {
    ref = parseSol(lv.sol);
    const r = E.simulate(lv, ref);
    const n = E.countBlocks(ref);
    line += ` | loopSol=${lv.sol} blocks=${n} -> ${r.result}`;
    if (r.result !== 'win') ok = false;
    if (lv.max && n > lv.max) { line += ' OVER MAX'; ok = false; }
    if (lv.max && bfs.length <= lv.max) line += ' (WARN: loop not needed)';
    out[lv.id] = { par: n, sol: lv.sol };
  } else {
    ref = bfs.map((t, i) => ({ t, id: 'x' + i }));
    const r = E.simulate(lv, ref);
    if (r.result !== 'win') { ok = false; line += ' SIMFAIL ' + r.result; }
    out[lv.id] = { par: bfs.length, sol: bfs.join(' ') };
  }
  // vérifier que la ligne droite naïve échoue (le niveau a un intérêt)
  console.log(line);
}
console.log(ok ? 'ALL OK' : 'PROBLEMS');
require('fs').writeFileSync(__dirname + '/par.json', JSON.stringify(out));
