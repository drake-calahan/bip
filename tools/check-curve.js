/* ===== V5 « L'harmonie du jardin » — courbe de CHARGE, pas courbe de blocs =====
   Pour un enfant de 5-7 ans, la difficulté n'est pas le nombre de blocs (par) :
   un "tant que" à par 2 est plus dur que 6 flèches à par 6. On mesure une charge :

     charge = par
            + 2 × profondeur d'imbrication des blocs
            + 3 × nombre de blocs nouveaux pour le joueur
            + 1 × jardins variants en plus
            + 2 × changement de repère (absolu <-> relatif) vs niveau précédent
            + 2 × batterie sans marge (max == par)

   Invariants (le script échoue sinon) :
   - si `max` existe, max >= par + 1 (règle de marge, .agent/AGENTS.md #4) ;
   - premier niveau de chaque chapitre <= 4 blocs (sauf les deux derniers chapitres, final + épilogue) ;
   - rampe intra-chapitre (dernier - premier, en par) <= 4 ;
   - delta de par moyen entre chapitres consécutifs <= 3.0 en hausse ; toute baisse est acceptée
     (un nouveau monde ou l'épilogue commence plus doucement, c'est voulu) ;
   - au plus 1 changement de repère dans toute l'aventure (celui enseigné au ch5) ;
   - aucun SPIKE (par[i] > par[i-1] + 4) dans l'aventure. */
const E = require('../src/engine.js');
const { LEVELS, CHAPTERS } = require('../src/levels.js');

/* par / ref comme dans app-core.js */
LEVELS.forEach(lv => {
  lv.nv = lv.variants ? lv.variants.length : 1;
  if (lv.mode === 'ball') { lv.ref = []; lv.refFn = []; lv.par = (lv.tiles || []).length; return; }
  lv.refFn = lv.fn ? E.parseProg(lv.fn) : [];
  lv.ref = lv.sol ? E.parseProg(lv.sol) : (E.solve(lv, lv.pal) || []).map((t, i) => ({ t, id: 'h' + i }));
  lv.par = E.countBlocks(lv.ref) + E.countBlocks(lv.refFn);
});

const ARROWS = new Set(['r', 'l', 'u', 'd']);
const RELSET = new Set(['f', 'tl', 'tr']);
function frameOf(lv) {
  if (lv.mode === 'ball') return 'ball';
  const p = new Set(lv.pal || []);
  const a = [...p].some(x => ARROWS.has(x)), r = [...p].some(x => RELSET.has(x));
  return a && !r ? 'ABS' : r && !a ? 'REL' : 'MIX';
}
function depth(list) {
  let m = 0;
  for (const it of list || []) {
    const d = it.body ? 1 + depth(it.body) : it.els ? 1 + depth(it.els) : 0;
    if (d > m) m = d;
  }
  return m;
}

const seen = new Set();
const rows = LEVELS.map(lv => {
  const story = lv.ch >= 0;
  const nb = lv.mode === 'ball' ? 1 : (lv.pal || []).filter(b => !seen.has(b)).length;
  (lv.pal || []).forEach(b => seen.add(b));
  const fr = frameOf(lv);
  const zeroSlack = lv.max != null && lv.max < lv.par + 1 ? 1 : 0;
  const load = lv.par
    + 2 * (lv.mode === 'ball' ? 0 : depth(lv.ref) + depth(lv.refFn))
    + 3 * nb
    + 1 * (lv.nv - 1)
    + 2 * zeroSlack;
  return { lv, story, ch: lv.ch, par: lv.par, load, nb, fr, zeroSlack,
    rampPrev: null, name: lv.ch >= 0 ? CHAPTERS[lv.ch].name : 'défi' };
});

/* changements de repère dans l'aventure (modes classiques uniquement) */
const switches = [];
const storyRows = rows.filter(r => r.story);
for (let i = 1; i < storyRows.length; i++) {
  const a = storyRows[i - 1], b = storyRows[i];
  if (a.fr !== 'ball' && b.fr !== 'ball' && a.fr !== b.fr)
    switches.push(`L${b.lv.id} ${a.fr}->${b.fr} (${b.name})`);
  b.frameSwitch = a.fr !== 'ball' && b.fr !== 'ball' && a.fr !== b.fr ? 1 : 0;
  b.load += 2 * b.frameSwitch;
}
/* spikes */
const spikes = [];
for (let i = 1; i < storyRows.length; i++)
  if (storyRows[i].par > storyRows[i - 1].par + 4)
    spikes.push(`L${storyRows[i].lv.id} par ${storyRows[i - 1].par} -> ${storyRows[i].par}`);

/* par chapitre */
const chapters = CHAPTERS.map((c, ci) => {
  const ls = rows.filter(r => r.ch === ci);
  const pars = ls.map(r => r.par);
  return { ci, name: c.name, w: c.w, pars, debut: pars[0],
    avgLoad: ls.reduce((a, r) => a + r.load, 0) / ls.length,
    ramp: pars[pars.length - 1] - pars[0],
    minSlack: Math.min(...ls.map(r => r.lv.max != null ? r.lv.max - r.par : 99)),
    frames: [...new Set(ls.map(r => r.fr))].join('/') };
});

console.log('=== Charge par chapitre (V5) ===');
chapters.forEach(c => console.log(
  `Ch${String(c.ci + 1).padStart(2)} w${c.w} "${c.name}" pars=[${c.pars.join(',')}] debut=${c.debut} ` +
  `rampe=+${c.ramp} chargeMoy=${c.avgLoad.toFixed(1)} margeMin=${c.minSlack === 99 ? '-' : c.minSlack} repere=${c.frames}`));
console.log('\n=== Charge par niveau (aventure) ===');
console.log(storyRows.map(r => `${r.lv.id}:${r.load}`).join(' '));

const violations = [];
/* 1. marge batterie */
rows.forEach(r => { if (r.lv.max != null && r.lv.max < r.par + 1) violations.push(`MARGE NULLE L${r.lv.id} (${r.name}) par=${r.par} max=${r.lv.max}`); });
/* 2. débuts de chapitre (les deux derniers chapitres = final + épilogue sont exemptés) */
const lastCi = CHAPTERS.length - 1;
chapters.forEach(c => { if (c.ci < lastCi - 1 && c.debut > 4) violations.push(`DEBUT LOOURD Ch${c.ci + 1} "${c.name}" par=${c.debut}`); });
/* 3. rampes intra-chapitre */
chapters.forEach(c => { if (c.ramp > 4) violations.push(`RAMPE Ch${c.ci + 1} "${c.name}" +${c.ramp} (${c.pars.join(',')})`); });
/* 4. deltas de par moyen entre chapitres (hausse limitée ; baisse libre : nouveau monde / épilogue) */
for (let i = 1; i < chapters.length; i++) {
  const pavg = ci => chapters[ci].pars.reduce((a, b) => a + b, 0) / chapters[ci].pars.length;
  const d = pavg(i) - pavg(i - 1);
  if (d > 3.0) violations.push(`DELTA Ch${i}->Ch${i + 1} par moyen +${d.toFixed(1)}`);
}
/* 5. changements de repère */
if (switches.length > 1) violations.push(`REPERE x${switches.length} : ${switches.join(' | ')}`);
/* 6. spikes */
spikes.forEach(s => violations.push(`SPIKE ${s}`));

console.log('\n=== Invariants V5 ===');
console.log(`marge nulle        : ${rows.filter(r => r.zeroSlack).length} niveau(x)`);
console.log(`débuts > 4 blocs   : ${chapters.filter(c => c.ci < lastCi - 1 && c.debut > 4).map(c => 'Ch' + (c.ci + 1)).join(',') || 'aucun'}`);
console.log(`rampes > 4         : ${chapters.filter(c => c.ramp > 4).map(c => 'Ch' + (c.ci + 1) + ' (+' + c.ramp + ')').join(',') || 'aucune'}`);
console.log(`changements repère : ${switches.length}${switches.length ? ' (' + switches.join(', ') + ')' : ''}`);
console.log(`spikes par         : ${spikes.length}${spikes.length ? ' (' + spikes.join(', ') + ')' : ''}`);

if (violations.length) {
  console.log('\nVIOLATIONS :');
  violations.forEach(v => console.log('  - ' + v));
  console.log('PROBLEMS');
  process.exitCode = 1;
} else {
  console.log('\nALL OK');
}
