/* ---------- Mode toboggans : programmer le lieu ---------- */
function renderTiles() {
  $$('#board .tilemark').forEach(t => t.remove());
  const board = $('#board');
  Object.entries(G.tiles).forEach(([key, d]) => {
    const [x, y] = key.split(',').map(Number);
    const t = document.createElement('div');
    t.className = 'tilemark'; t.style.cssText = `--x:${x};--y:${y}`;
    t.innerHTML = `<i>${blockHTML(d, null, false)}</i>`;
    board.appendChild(t);
  });
  updateBatt();
}
function hintTiles() {
  if (G.busy) return;
  hideHint();
  $('#btnHint').classList.remove('glow');
  (G.lv.tiles || []).forEach(s => {
    const [x, y] = s.split(',').map(Number);
    const t = document.createElement('div');
    t.className = 'tilemark hint'; t.style.cssText = `--x:${x};--y:${y}`;
    t.innerHTML = `<i>${symUse('star')}</i>`;
    $('#board').appendChild(t);
  });
  say('Les étoiles montrent où poser une flèche. Devine la direction de chaque flèche !');
  clearTimeout(G.hintT);
  G.hintT = setTimeout(hideHint, 6000);
}
function ballCellFromEvent(e) {
  const r = $('#board').getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left - 7) / G.cellPx);
  const y = Math.floor((e.clientY - r.top - 7) / G.cellPx);
  if (x < 0 || y < 0 || x >= G.P.w || y >= G.P.h) return null;
  return [x, y];
}
function onBoardTap(e) {
  if (G.mode !== 'ball' || G.busy) return;
  const cell = ballCellFromEvent(e);
  if (!cell) return;
  const [x, y] = cell;
  const idx = y * G.P.w + x;
  const kind = G.P.cells[idx];
  const isStart = G.P.start[0] === x && G.P.start[1] === y;
  const isNest = G.P.nest && G.P.nest[0] === x && G.P.nest[1] === y;
  const key = x + ',' + y;
  if (kind !== 'grass' || isStart || isNest) { SFX.nope(); return; }
  audio();
  if (G.tool === 'erase') {
    if (key in G.tiles) { delete G.tiles[key]; SFX.del(); renderTiles(); }
    return;
  }
  if (key in G.tiles) {
    const i = BALL_DIRS.indexOf(G.tiles[key]);
    const nd = BALL_DIRS[(i + 1) % BALL_DIRS.length];
    if (nd === BALL_DIRS[0] && i === BALL_DIRS.length - 1) delete G.tiles[key]; else G.tiles[key] = nd;
  } else G.tiles[key] = G.tool;
  SFX.tap();
  renderTiles();
}
async function runBall() {
  if (G.busy) { G.abort = true; return; }
  const tiles = Object.entries(G.tiles).map(([k, d]) => { const [x, y] = k.split(',').map(Number); return [x, y, d]; });
  if (!tiles.length) {
    SFX.nope();
    say('Pose d\'abord des flèches sur l\'herbe : touche une case, puis le bouton vert !');
    return;
  }
  stopVoice(); G.busy = true; G.abort = false; setRunning(true);
  const session = ++G.session;
  G.dirty = true;
  resetBoard(); renderTiles();
  say('C\'est parti, Ballon !', true);
  const res = rollBall(G.lv, tiles, G.v);
  const ball = $('#ballSprite');
  for (const st of res.steps) {
    if (G.session !== session) return;
    if (G.abort) break;
    ball.style.setProperty('--x', st.to[0]); ball.style.setProperty('--y', st.to[1]);
    if (!RM) { ball.classList.remove('roll'); void ball.offsetWidth; ball.classList.add('roll'); }
    if (st.tile) {
      SFX.turn();
      const tm = $(`#board .tilemark[style*="--x:${st.tile[0]}"][style*="--y:${st.tile[1]}"]`);
      if (tm) { tm.classList.add('pick'); setTimeout(() => tm.classList.remove('pick'), 400); }
      if (st.nd) { G.tiles[st.tile.join(',')] = st.nd; renderTiles(); }
    } else SFX.balltap();
    await sleep(240 * T);
    if (G.session !== session) return;
  }
  const aborted = G.abort; G.busy = false; setRunning(false);
  if (aborted) { resetBoard(); renderTiles(); say('Stop ! Ballon s\'arrête.', true); return; }
  ballFinish(res, tiles.length);
}
function ballFinish(res, n) {
  const ball = $('#ballSprite');
  const par = G.lv.tiles ? G.lv.tiles.length : n;
  if (res.result === 'win') {
    const stars = n <= par ? 3 : n <= par + 2 ? 2 : 1;
    const prev = save.stars[G.lv.id] || 0;
    save.stars[G.lv.id] = Math.max(prev, stars); persist();
    checkStickers();
    SFX.win(); buzz([30, 60, 30]); confetti();
    $('#winBip').innerHTML = robotSVG();
    $('#winStars').innerHTML = [1, 2, 3].map(k => I.star(k <= stars)).join('');
    $('#winTitle').textContent = 'Plein tonneau !';
    $('#winText').textContent = stars === 3 ? `Ballon est arrivé au nid avec ${n} flèche${n > 1 ? 's' : ''} seulement !` : `Ballon est au nid ! On peut réussir avec ${par} flèches. Tu essaies ?`;
    $('#btnAgain').innerHTML = `${I.replay}<span>Encore</span>`;
    $('#btnNext').innerHTML = `<span>Suivant</span>${I.next}`;
    $('#win').hidden = false;
    speak($('#winTitle').textContent + ' ' + $('#winText').textContent);
    const session = G.session;
    setTimeout(() => { if (G.session === session && !$('#win').hidden) $('#btnNext').focus({ preventScroll: true }); }, 50);
    return;
  }
  G.fails++;
  let msg = '';
  if (res.result === 'out') { msg = 'Oups ! Ballon est sorti du jardin. Il manque une flèche quelque part !'; }
  else if (res.result === 'stop') { msg = 'Ballon est bloqué contre un obstacle. Une flèche peut le détourner !'; }
  else if (res.result === 'splash') { msg = 'Plouf ! Ballon a roulé dans l\'eau. Détourne-le avec une flèche !'; }
  else if (res.result === 'loop') { SFX.loopdizzy(); msg = 'Ballon tourne en rond ! Regarde bien tes flèches.'; }
  else if (res.result === 'none') { msg = 'Pose des flèches sur l\'herbe d\'abord !'; }
  if (G.fails >= 3) $('#btnHint').classList.add('glow');
  say(msg);
}
