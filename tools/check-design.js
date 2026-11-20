/* Audit design des niveaux (complète check-levels.js / check-curve.js) :
   règles de forme et de lisibilité dérivées de .agent/level-authoring.md.

   ERREURS (échouent) :
   - map hors limites 8x6 ou lignes de largeurs inégales ;
   - un seul départ (R en classique, S+N en toboggan) ;
   - barriè/champignon en mode toboggan (anti-pattern) ;
   - run de >= 2 flaques strictement entre le départ et un jouet sur la même
     ligne/colonne : le saut ne couvre qu'UNE case (engine.js), la ligne droite
     serait insautable (ex. l'ancien L13 "R~~..b") ;
   - balise F sur la case de départ ;
   - jouet au-delà d'une balise sur la ligne du départ en ch17-19 (règle V9).

   WARN (affichés, n'échouent pas) : texte > 2 phrases ; bloc 'j' dans la palette
   mais jamais utilisé (ni BFS ni sol de réf) sur un niveau à 1 jardin. */
const E = require('../src/engine.js');
const { LEVELS, CHAPTERS } = require('../src/levels.js');

let errors = 0, warns = 0;
const err = m => { errors++; console.log('  ERR  ' + m); };
const warn = m => { warns++; console.log('  warn ' + m); };

for (const lv of LEVELS) {
  const maps = lv.variants || [lv.map];
  const tag = `L${lv.id}${lv.daily ? ' (défi)' : ''}`;

  for (const m of maps) {
    const w = m[0].length, h = m.length;
    if (w > 8 || h > 6) err(`${tag}: map ${w}x${h} hors limites 8x6`);
    if (m.some(r => r.length !== w)) err(`${tag}: lignes de largeurs inégales ${JSON.stringify(m)}`);
    const flat = m.join('');
    if (lv.mode === 'ball') {
      if ((flat.match(/S/g) || []).length !== 1 || (flat.match(/N/g) || []).length !== 1)
        err(`${tag}: mode toboggan sans S/N unique`);
      if (/[Gs]/.test(flat)) err(`${tag}: barri/champignon interdit en mode toboggan`);
    } else if ((flat.match(/R/g) || []).length !== 1) {
      err(`${tag}: ${flat.match(/R/g) ? (flat.match(/R/g) || []).length : 0} départ(s) R`);
    }

    // ligne droite départ -> jouet avec 2+ flaques entre les deux (insautable)
    let sx = -1, sy = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      if (m[y][x] === (lv.mode === 'ball' ? 'S' : 'R')) { sx = x; sy = y; }
    if (sx >= 0) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!/[bncta]/.test(m[y][x])) continue;
        if (y === sy) {
          const seg = m[y].slice(Math.min(sx, x) + 1, Math.max(sx, x));
          if (/~~/.test(seg)) err(`${tag}: 2+ flaques entre le départ et le jouet (${x},${y}) sur la même ligne — insautable`);
        }
        if (x === sx) {
          let seg = '';
          for (let yy = Math.min(sy, y) + 1; yy < Math.max(sy, y); yy++) seg += m[yy][x];
          if (/~~/.test(seg)) err(`${tag}: 2+ flaques entre le départ et le jouet (${x},${y}) sur la même colonne — insautable`);
        }
      }
      // balise sur la case de départ / jouet au-delà du drapeau (ch17-19)
      if (m[sy][sx] === 'F') err(`${tag}: balise sur la case de départ`);
      if (lv.ch >= 16 && lv.ch <= 18) {
        const row = m[sy], fX = row.indexOf('F');
        if (fX > sx && /[bncta]/.test(row.slice(fX + 1)))
          err(`${tag}: jouet au-delà de la balise sur la ligne du départ (règle V9 ch17-19)`);
      }
    }
  }

  // texte : <= 2 phrases (warn, voir P2 de l'audit)
  const sents = (lv.text || '').split(/[.!?…]+/).map(s => s.trim()).filter(Boolean);
  if (!lv.text) err(`${tag}: pas de texte`);
  else if (sents.length > 2) warn(`${tag}: texte en ${sents.length} phrases (> 2)`);

  // 'j' inutile dans la palette (warn)
  if (lv.mode !== 'ball' && (lv.pal || []).includes('j') && !(lv.variants && lv.variants.length > 1)) {
    const bfs = E.solve(lv, lv.pal, 0);
    const refHasJ = lv.sol ? /(^|[\s(])j([\s)]|$)/.test(lv.sol) : false;
    if (bfs && !bfs.includes('j') && !refHasJ) warn(`${tag}: 'j' dans la palette mais jamais utilisé`);
  }
}

console.log(`\n${LEVELS.length} niveaux audités : ${errors} erreur(s), ${warns} avertissement(s)`);
if (errors) { console.log('PROBLEMS'); process.exitCode = 1; }
else console.log('DESIGN OK');
