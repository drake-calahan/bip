/* Vérifie chaque niveau : solution de référence gagnante dans tous les jardins,
   programme de départ (niveaux détective) qui échoue, contrainte de piles qui oblige la notion. */
const E = require('../src/engine.js');
const { LEVELS } = require('../src/levels.js');
let ok = true;
for (const lv of LEVELS) {
  const nv = lv.variants ? lv.variants.length : 1;
  let line = `L${lv.id} ch${lv.ch + 1} `;
  const fn = lv.fn ? E.parseProg(lv.fn) : [];
  let ref, par;
  if (lv.sol) { ref = E.parseProg(lv.sol); par = E.countBlocks(ref) + E.countBlocks(fn); }
  for (let v = 0; v < nv; v++) {
    const bfs = E.solve(lv, lv.pal, v);
    if (!lv.sol && nv === 1) {
      if (!bfs) { line += 'UNSOLVABLE'; ok = false; continue; }
      ref = E.parseProg(bfs.join(' ')); par = bfs.length;
    }
    const r = E.simulate(lv, ref, fn, v);
    line += `[v${v + 1} ref:${r.result}${bfs ? ' bfs=' + bfs.length : ' bfs=∅'}] `;
    if (r.result !== 'win') ok = false;
    if (lv.max && bfs && bfs.length <= lv.max && !lv.start) line += '(WARN plain fits) ';
    if (lv.start) {
      const s = E.simulate(lv, E.parseProg(lv.start), [], v);
      line += `start:${s.result} `;
    }
  }
  if (lv.start) {
    const fails = Array.from({ length: nv }, (_, v) => E.simulate(lv, E.parseProg(lv.start), [], v).result).some(r => r !== 'win');
    if (!fails) { line += 'START WINS!'; ok = false; }
  }
  line += `par=${par}${lv.max ? ' max=' + lv.max : ''}`;
  if (lv.max && par > lv.max) { line += ' OVER MAX'; ok = false; }
  console.log(line);
}
console.log(ok ? 'ALL OK' : 'PROBLEMS');
process.exitCode = ok ? 0 : 1;
