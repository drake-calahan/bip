/* ---------- Mon jardin : le mode création ---------- */
const SB_W = 8, SB_H = 6;
const SB_DEFAULT = () => {
  const rows = Array.from({ length: SB_H }, () => '.'.repeat(SB_W));
  rows[2] = 'R' + '.'.repeat(SB_W - 1);
  return rows;
};
const SB_ITEMS = [
  { ch: 'R', label: 'Départ de Bip', icon: () => `<span style="width:70%;height:70%;display:block">${robotSVG()}</span>` },
  { ch: 'b', label: TOY_NAME.b, icon: () => toyUse('b') },
  { ch: 'n', label: TOY_NAME.n, icon: () => toyUse('n') },
  { ch: 'c', label: TOY_NAME.c, icon: () => toyUse('c') },
  { ch: 't', label: TOY_NAME.t, icon: () => toyUse('t') },
  { ch: 'a', label: TOY_NAME.a, icon: () => toyUse('a') },
  { ch: '#', label: 'Un buisson', icon: () => symUse('bush') },
  { ch: 'o', label: 'Un rocher', icon: () => symUse('rock') },
  { ch: '~', label: 'Une flaque', icon: () => symUse('puddle') },
  { ch: '-', label: 'Un nénuphar', icon: () => symUse('pad') },
  { ch: 's', label: 'Un champignon', icon: () => symUse('switchc') },
  { ch: 'G', label: 'Une barrière', icon: () => symUse('gate') },
  { ch: 'C', label: 'Une caisse', icon: () => symUse('crate') },
  { ch: '*', label: 'Une fleur', icon: () => symUse('flower') },
  { ch: 'F', label: 'Une balise', icon: () => symUse('flag') },
  { ch: '.', label: 'Gomme', icon: () => I.eraser, eraser: true },
];
function openSandbox() {
  show('sandbox');
  if (!G.sb.rows.length) loadSbSlot(G.sb.cur, true);
  renderSbSlots(); renderSbTools(); renderSbBoard();
  sbSay('Mon jardin ! Touche un élément en bas, puis touche l\'herbe pour le poser.');
}
function sbSay(text, quiet) { $('#sbMsg').textContent = text; if (!quiet) speak(text); }
function loadSbSlot(i, fallback) {
  G.sb.cur = i;
  const data = save.sandbox[i];
  G.sb.rows = data && Array.isArray(data.rows) && data.rows.length === SB_H ? data.rows.map(r => String(r)) : SB_DEFAULT();
  G.sb.tool = 'R';
}
function persistSb() {
  save.sandbox[G.sb.cur] = { rows: G.sb.rows.slice() };
  persist();
  renderSbSlots();
  award('sandbox1');
  stat('built');
}
function renderSbSlots() {
  $('#sbSlots').innerHTML = save.sandbox.map((s, i) =>
    `<button data-s="${i}" class="${i === G.sb.cur ? 'on' : ''} ${s ? 'has' : ''}" aria-label="Jardin ${i + 1}">${i + 1}</button>`).join('');
  $$('#sbSlots button').forEach(b => b.addEventListener('click', () => {
    if (G.sb.cur !== +b.dataset.s) { G.sb.cur = +b.dataset.s; loadSbSlot(G.sb.cur, true); renderSbBoard(); }
    renderSbSlots(); renderSbTools(); SFX.tap();
  }));
}
function renderSbTools() {
  $('#sbTray').innerHTML = SB_ITEMS.map(it =>
    `<button class="sb-item${it.eraser ? ' eraser' : ''}${G.sb.tool === it.ch ? ' on' : ''}" data-ch="${it.ch}" aria-label="${it.label}">${it.icon()}</button>`).join('') +
    `<button class="sb-item sb-code" id="btnSbShare" aria-label="Partager ce jardin avec un code">${I.share}</button>` +
    `<button class="sb-item sb-code" id="btnSbPaste" aria-label="Charger un jardin depuis un code">${I.paste}</button>`;
  $$('#sbTray .sb-item[data-ch]').forEach(b => b.addEventListener('click', () => {
    G.sb.tool = b.dataset.ch; SFX.tap();
    sbSay(SB_ITEMS.find(i => i.ch === G.sb.tool).label + ' : touche l\'herbe pour le poser.', true);
    renderSbTools();
  }));
  const sh = $('#btnSbShare'), pa = $('#btnSbPaste');
  if (sh) sh.addEventListener('click', () => { audio(); openSbCode('share'); });
  if (pa) pa.addEventListener('click', () => { audio(); openSbCode('paste'); });
}

/* ---------- Codes de partage (V10) : un jardin = un petit code à copier/coller ----------
   BIP2 = jardin 8×6 (taille courante) ; BIP1 = ancien jardin 6×5, relu et complété à 8×6. */
const SB_CHARS = 'R.#o~sGC*Fbncta-';
function sbEncode(rows) {
  return 'BIP2.' + btoa(rows.join('/')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sbDecode(code) {
  const m = /^BIP([12])\.([A-Za-z0-9_-]{8,})$/.exec(String(code || '').trim());
  if (!m) return null;
  let bin;
  try { bin = atob(m[2].replace(/-/g, '+').replace(/_/g, '/')); } catch (e) { return null; }
  const legacy = m[1] === '1';
  const w = legacy ? 6 : SB_W, h = legacy ? 5 : SB_H;
  const rows = bin.split('/');
  const okChars = new RegExp('^[' + SB_CHARS + ']+$');
  if (rows.length !== h || rows.some(r => r.length !== w || !okChars.test(r))) return null;
  if (rows.join('').split('R').length !== 2) return null;   // exactement un départ de Bip
  if (!legacy) return rows;
  return rows.map(r => r.padEnd(SB_W, '.')).concat(Array.from({ length: SB_H - h }, () => '.'.repeat(SB_W)));
}
function openSbCode(mode) {
  $('#sbCode').hidden = false;
  const inp = $('#sbCodeInput');
  if (mode === 'share') { inp.value = sbEncode(G.sb.rows); inp.placeholder = ''; try { inp.select(); } catch (e) { /* */ } }
  else { inp.value = ''; inp.placeholder = 'Colle le code d’un jardin ici…'; }
  stopVoice();
  speak(mode === 'share' ? 'Voici le code de ton jardin. Copie-le pour l’envoyer à un ami.' : 'Colle ici le code d’un jardin reçu, puis « Charger ce code ».');
  setTimeout(() => { try { inp.focus(); } catch (e) { /* */ } }, 60);
}
function copySbCode() {
  const inp = $('#sbCodeInput');
  inp.value = sbEncode(G.sb.rows);
  try { inp.select(); } catch (e) { /* */ }
  const okMsg = () => sbSay('Code copié ! Envoie-le à un ami pour partager ton jardin.');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(inp.value).then(okMsg, () => sbSay('Copie le code affiché ci-dessus à la main.'));
  else sbSay('Copie le code affiché ci-dessus à la main.');
}
function loadSbCode() {
  const rows = sbDecode($('#sbCodeInput').value);
  if (!rows) { SFX.nope(); sbSay('Ce code ne ressemble pas à un jardin Bip. Vérifie-le et réessaie !'); return; }
  G.sb.rows = rows;
  persistSb();
  renderSbBoard();
  $('#sbCode').hidden = true;
  SFX.win();
  sbSay(`Jardin chargé dans le jardin ${G.sb.cur + 1} ! Lance Bip avec le bouton vert.`);
}
function renderSbBoard() {
  const P = parseLevel({ map: G.sb.rows });
  G.sb.P = P;
  const b = $('#sbBoard');
  b.style.setProperty('--cols', P.w); b.style.setProperty('--rows', P.h);
  let h = '';
  P.cells.forEach((k, idx) => {
    if (k === 'grass') return;
    const x = idx % P.w, y = (idx / P.w) | 0;
    const cls = k === 'switch' ? 'switchc' : k;
    const sym = { bush: 'bush', rock: 'rock', puddle: 'puddle', box: 'box', pad: 'pad', switch: 'switchc', gate: 'gate', flower: 'flower' }[k];
    h += `<div class="it ${cls}" style="--x:${x};--y:${y}">${symUse(sym)}</div>`;
  });
  P.crates.forEach(c => { h += `<div class="it crate" style="--x:${c[0]};--y:${c[1]}">${symUse('crate')}</div>`; });
  P.toys.forEach((t, i) => { h += `<div class="it toy" style="--x:${t.x};--y:${t.y}">${toyUse(t.k)}</div>`; });
  if (P.start) h += `<div class="it robot" style="--x:${P.start[0]};--y:${P.start[1]}"><div class="sprite">${robotSVG()}</div></div>`;
  b.innerHTML = h;
  fitSbBoard();
}
function fitSbBoard() {
  const r = $('#sbBoardWrap').getBoundingClientRect();
  if (!r.width || !r.height) return;
  const cell = Math.max(24, Math.floor(Math.min((r.width - 16) / SB_W, (r.height - 16) / SB_H, 112)));
  $('#sbBoard').style.setProperty('--cell', cell + 'px');
  G.sbCellPx = cell;
}
function onSbTap(e) {
  const r = $('#sbBoard').getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left - 7) / G.sbCellPx);
  const y = Math.floor((e.clientY - r.top - 7) / G.sbCellPx);
  if (x < 0 || y < 0 || x >= SB_W || y >= SB_H) return;
  const ch = G.sb.tool;
  let rows = G.sb.rows.map(r => String(r));
  if (ch === '.') {
    const row = rows[y]; rows[y] = row.slice(0, x) + '.' + row.slice(x + 1);
    SFX.del();
  } else {
    if (ch === 'R') rows = rows.map(row => row.replace('R', '.'));
    const row = rows[y];
    const prev = row[x];
    rows[y] = row.slice(0, x) + ch + row.slice(x + 1);
    if (prev === ch) { rows[y] = row.slice(0, x) + '.' + row.slice(x + 1); SFX.del(); }
    else SFX.tap();
  }
  G.sb.rows = rows;
  persistSb();
  renderSbBoard();
  if (!G.sb.P.start) sbSay('Il manque le départ de Bip. Pose le petit robot dans ton jardin !');
}
function playSandbox() {
  const P = parseLevel({ map: G.sb.rows });
  const toysOrFlowers = P.toys.length + P.flowers.length;
  if (!P.start) { SFX.nope(); sbSay('Il manque le départ de Bip ! Pose le petit robot quelque part.'); return; }
  if (!toysOrFlowers) { SFX.nope(); sbSay('Ton jardin est vide de mission : pose au moins un jouet ou une fleur !'); return; }
  const lv = { ch: -2, pal: FULL_PAL, map: G.sb.rows.slice(), face: 'r', sandbox: true, nv: 1, text: 'À toi de programmer Bip dans TON jardin !' };
  openLevelObj(lv, { sandbox: true });
}
