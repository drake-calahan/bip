/* ---------- Mon jardin : le mode création ---------- */
const SB_W = 6, SB_H = 5;
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
  { ch: 'e', label: TOY_NAME.e, icon: () => toyUse('e') },
  { ch: '#', label: 'Un buisson', icon: () => symUse('bush') },
  { ch: 'o', label: 'Un rocher', icon: () => symUse('rock') },
  { ch: '~', label: 'Une flaque', icon: () => symUse('puddle') },
  { ch: '-', label: 'Un nénuphar', icon: () => symUse('pad') },
  { ch: 's', label: 'Un champignon', icon: () => symUse('switchc') },
  { ch: 'G', label: 'Une barrière', icon: () => symUse('gate') },
  { ch: 'C', label: 'Une caisse', icon: () => symUse('crate') },
  { ch: '*', label: 'Une fleur', icon: () => symUse('flower') },
  { ch: 'K', label: 'Le coffre', icon: () => symUse('box') },
  { ch: '.', label: 'Gomme', icon: () => I.eraser, eraser: true },
];
function openSandbox() {
  show('sandbox');
  if (!G.sb.rows.length) loadSbSlot(G.sb.cur, true);
  renderSbSlots(); renderSbTools(); renderSbBoard();
  sbSay('Construis ton jardin ! Touche un élément en bas, puis touche l\'herbe pour le poser.');
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
}
function renderSbSlots() {
  $('#sbSlots').innerHTML = '<span>Jardins</span>' + save.sandbox.map((s, i) =>
    `<button data-s="${i}" class="${i === G.sb.cur ? 'on' : ''} ${s ? 'has' : ''}" aria-label="Jardin ${i + 1}">${i + 1}</button>`).join('');
  $$('#sbSlots button').forEach(b => b.addEventListener('click', () => {
    if (G.sb.cur !== +b.dataset.s) { G.sb.cur = +b.dataset.s; loadSbSlot(G.sb.cur, true); renderSbBoard(); }
    renderSbSlots(); renderSbTools(); SFX.tap();
  }));
}
function renderSbTools() {
  $('#sbTray').innerHTML = SB_ITEMS.map(it =>
    `<button class="sb-item${it.eraser ? ' eraser' : ''}${G.sb.tool === it.ch ? ' on' : ''}" data-ch="${it.ch}" aria-label="${it.label}">${it.icon()}</button>`).join('');
  $$('#sbTray .sb-item').forEach(b => b.addEventListener('click', () => {
    G.sb.tool = b.dataset.ch; SFX.tap();
    sbSay(SB_ITEMS.find(i => i.ch === G.sb.tool).label + ' : touche l\'herbe pour le poser.', true);
    renderSbTools();
  }));
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
    const sym = { bush: 'bush', rock: 'rock', puddle: 'puddle', box: 'box', pad: 'pad', switchc: 'switchc', gate: 'gate', flower: 'flower' }[k];
    h += `<div class="it ${k}" style="--x:${x};--y:${y}">${symUse(sym)}</div>`;
  });
  P.crates.forEach(c => { h += `<div class="it crate" style="--x:${c[0]};--y:${c[1]}">${symUse('crate')}</div>`; });
  P.toys.forEach((t, i) => { h += `<div class="it toy" style="--x:${t.x};--y:${t.y}">${toyUse(t.k)}</div>`; });
  h += `<div class="it robot" style="--x:${P.start[0]};--y:${P.start[1]}"><div class="sprite">${robotSVG()}</div></div>`;
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
}
function playSandbox() {
  const P = parseLevel({ map: G.sb.rows });
  const toysOrFlowers = P.toys.length + P.flowers.length;
  if (!P.start) { SFX.nope(); sbSay('Il manque le départ de Bip ! Pose le petit robot quelque part.'); return; }
  if (!toysOrFlowers) { SFX.nope(); sbSay('Ton jardin est vide de mission : pose au moins un jouet ou une fleur !'); return; }
  const lv = { ch: -2, pal: FULL_PAL, map: G.sb.rows.slice(), face: 'r', sandbox: true, nv: 1, text: 'À toi de programmer Bip dans TON jardin !' };
  openLevelObj(lv, { sandbox: true });
}
