/* ---------- Les machines de Grand-Papa : on manipule, on lâche, on regarde ----------
   Les modèles (lab.js) sont inchangés : chaque machine traduit les gestes de l'enfant
   en « setup » (clé → valeur parmi les options du défi), puis evaluateLab() dit ce qui
   se passe et la scène l'anime. Aucun réglage écrit : des objets que l'on touche. */
save.labs = Object.assign({ solved: {} }, save.labs || {});
const L = { level: null, setup: {}, guess: null, free: false, running: false, token: 0, last: null, drag: null };
const labFamily = id => LAB_FAMILIES.find(f => f.id === id);
const labSolved = id => !!save.labs.solved[id];
const labLevelsOf = fam => LAB_LEVELS.filter(l => l.family === fam);
const LAB_WHO = { balance: 'papi', light: 'noctule', gears: 'papi', rhythm: 'zoe' };
const LAB_NAME = { balance: 'La balance', light: 'La lumière', gears: 'Les roues', rhythm: 'Le rendez-vous' };
const LAB_RUN = { balance: 'Lâcher', light: 'Allumer', gears: 'Tourner', rhythm: 'Partir' };
const LAB_FREE_TEXT = {
  balance: 'Glisse les paniers où tu veux, puis lâche la planche. Que se passe-t-il ?',
  light: 'Touche les miroirs pour les tourner, puis allume la lampe. Où va la lumière ?',
  gears: 'Touche les roues pour changer leur taille, puis fais-les tourner.',
  rhythm: 'Touche un ami pour le décaler, puis pars. Quand se retrouvent-ils ?',
};
const LAB_GUESS = {
  balance: [
    { v: 'left', label: 'Penche à gauche', icon: () => `<svg viewBox="0 0 100 100"><path d="M14 36L86 60" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M50 50V84M34 84h32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="22" cy="30" r="9" fill="currentColor"/></svg>` },
    { v: 'balanced', label: 'Reste droite', icon: () => `<svg viewBox="0 0 100 100"><path d="M14 46H86" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M50 50V84M34 84h32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="24" cy="36" r="7" fill="currentColor"/><circle cx="76" cy="36" r="7" fill="currentColor"/></svg>` },
    { v: 'right', label: 'Penche à droite', icon: () => `<svg viewBox="0 0 100 100"><path d="M14 60L86 36" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M50 50V84M34 84h32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="78" cy="30" r="9" fill="currentColor"/></svg>` },
  ],
  light: [
    { v: 'none', label: 'Aucune luciole', icon: () => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="8"/><path d="M30 70L70 30" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>` },
    { v: 'some', label: 'Une luciole', icon: () => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="currentColor"/></svg>` },
    { v: 'all', label: 'Toutes les lucioles', icon: () => `<svg viewBox="0 0 100 100"><circle cx="30" cy="50" r="16" fill="currentColor"/><circle cx="70" cy="50" r="16" fill="currentColor"/></svg>` },
  ],
  gears: [
    { v: 'slow', label: 'Moins vite', icon: () => `<svg viewBox="0 0 100 100"><path d="M18 50h40M44 32l18 18-18 18" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/><circle cx="78" cy="50" r="8" fill="currentColor"/></svg>` },
    { v: 'same', label: 'Aussi vite', icon: () => `<svg viewBox="0 0 100 100"><path d="M20 38h60M20 62h60" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>` },
    { v: 'fast', label: 'Plus vite', icon: () => `<svg viewBox="0 0 100 100"><path d="M12 50h30M28 32l18 18-18 18M50 50h30M66 32l18 18-18 18" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  ],
  rhythm: [
    { v: 'apart', label: 'Chacun de son côté', icon: () => `<svg viewBox="0 0 100 100"><circle cx="28" cy="40" r="12" fill="currentColor"/><circle cx="72" cy="64" r="12" fill="currentColor"/></svg>` },
    { v: 'together', label: 'Ensemble', icon: () => I.heart },
  ],
};
const GEAR_TEETH = [6, 12, 24];
const gearR = teeth => 18 + teeth * 3.4;
const labCopy = v => JSON.parse(JSON.stringify(v));

/* ---------- Hub : quatre machines ---------- */
function renderMachines() {
  $('#machinesGrid').innerHTML = LAB_FAMILIES.map(f => {
    const lvls = labLevelsOf(f.id);
    const next = lvls.find(l => !labSolved(l.id)) || lvls[0];
    return `<article class="mcard" data-m="${f.id}">
      <button class="mart" data-open="${next.id}" aria-label="${LAB_NAME[f.id]}">${sceneSVG(lvls[0], labCopy(lvls[0].initial), { mini: true })}</button>
      <div class="mname">${machineIcon(f.id).replace('<svg', '<svg style="width:26px;height:26px;flex:none"')}<span>${LAB_NAME[f.id]}</span></div>
      <div class="mdots">${lvls.map((l, i) => `<button class="${labSolved(l.id) ? 'done' : ''}" data-open="${l.id}" aria-label="Défi ${i + 1}${labSolved(l.id) ? ', réussi' : ''}"><i class="${labSolved(l.id) ? 'done' : ''}">${labSolved(l.id) ? I.check : ''}</i></button>`).join('')}
        <button class="free" data-free="${lvls[lvls.length - 1].id}" aria-label="Inventer avec cette machine">${I.eraser}</button></div>
    </article>`;
  }).join('');
  $$('[data-open]', $('#machinesGrid')).forEach(b => b.onclick = () => { audio(); openLab(b.dataset.open, false); });
  $$('[data-free]', $('#machinesGrid')).forEach(b => b.onclick = () => { audio(); openLab(b.dataset.free, true); });
}
function openMachines() {
  renderMachines(); $('#machines').hidden = false; stopVoice();
  speak('Les machines de Grand-Papa. Choisis une machine !');
}

/* ---------- Un défi ---------- */
function openLab(id, free) {
  const lv = LAB_LEVELS.find(l => l.id === id); if (!lv) return;
  L.level = lv; L.free = !!free; L.setup = labCopy(lv.initial); L.guess = null; L.last = null; L.token++; L.running = false; L.drag = null;
  show('lab');
  const fam = lv.family;
  $('#lab').dataset.m = fam;
  $('#lab').classList.remove('lab-done');
  $('#labPill').innerHTML = `<i style="background:var(--macc)"></i>${LAB_NAME[fam]}`;
  $('#btnLabRun').innerHTML = `${I.play}<span>${LAB_RUN[fam]}</span>`;
  $('#btnLabNext').innerHTML = `<span>Suivant</span>${I.next}`;
  renderLabDots();
  renderGuess();
  renderScene();
  labSay(L.free ? LAB_FREE_TEXT[fam] : lv.text, LAB_WHO[fam]);
  if (STANDALONE) { try { history.pushState({ g: 1 }, ''); } catch (e) { /* */ } }
}
function labSay(text, who) {
  $('#labMsg').textContent = text;
  const mini = $('#labMini'), w = who || LAB_WHO[L.level.family];
  if (mini.dataset.who !== w) { mini.innerHTML = CHARS[w].art(); mini.dataset.who = w; }
  const b = $('#labBubble'); b.classList.remove('new'); void b.offsetWidth; b.classList.add('new');
  speak(text);
}
function renderLabDots() {
  const lvls = labLevelsOf(L.level.family);
  $('#labDots').innerHTML = L.free ? `<span class="lvl-pill" style="font-size:14px">Inventer</span>` : lvls.map(l => `<i class="${labSolved(l.id) ? 'done' : ''}${l === L.level ? ' now' : ''}" data-open="${l.id}" role="button" aria-label="Défi"></i>`).join('');
  $$('#labDots i').forEach(d => d.onclick = () => { if (!L.running) openLab(d.dataset.open, false); });
}
function renderGuess() {
  const g = $('#labGuess');
  if (L.free) { g.innerHTML = ''; return; }
  g.innerHTML = `<span class="glab">Je pense…</span>` + LAB_GUESS[L.level.family].map(o =>
    `<button data-v="${o.v}" class="${L.guess === o.v ? 'on' : ''}" aria-label="${o.label}">${o.icon()}</button>`).join('');
  $$('#labGuess button').forEach(b => b.onclick = () => {
    if (L.running) return;
    L.guess = L.guess === b.dataset.v ? null : b.dataset.v; SFX.tap();
    $$('#labGuess button').forEach(x => { x.classList.toggle('on', x.dataset.v === L.guess); x.classList.remove('hit', 'miss'); });
    const o = LAB_GUESS[L.level.family].find(x => x.v === L.guess);
    if (o) speak(o.label);
  });
}
function markGuess(outcome) {
  $$('#labGuess button').forEach(b => {
    b.classList.toggle('hit', b.dataset.v === outcome);
    b.classList.toggle('miss', L.guess && b.dataset.v === L.guess && L.guess !== outcome);
  });
}
function setControl(key, value) {
  if (L.running) return;
  L.setup[key] = value; L.last = null; SFX.tap();
  $('#lab').classList.remove('lab-done');
  $$('#labGuess button').forEach(x => x.classList.remove('hit', 'miss'));
  renderScene();
}
function cycleControl(key) {
  const c = L.level.controls.find(c => c.key === key); if (!c) return;
  const vals = c.options.map(o => o.value);
  const i = vals.indexOf(L.setup[key]);
  setControl(key, vals[(i + 1) % vals.length]);
}
function labReset() {
  if (L.running) { L.token++; L.running = false; }
  L.setup = labCopy(L.level.initial); L.guess = null; L.last = null;
  $('#lab').classList.remove('lab-done');
  renderGuess(); renderScene(); SFX.del();
  labSay('On recommence. Réfléchis, puis essaie !');
}
function labHint() {
  if (L.running) return;
  const lv = L.level;
  if (L.free) { labSay('Ici tu inventes : il n\'y a pas de bonne réponse. Change une seule chose, et regarde !'); return; }
  const key = (lv.controls || []).map(c => c.key).find(k => L.setup[k] !== lv.solution[k]);
  if (!key) { labSay('Tout est bien réglé. Appuie sur le bouton vert !'); return; }
  const el = $(`#scene [data-key="${key}"]`);
  if (el) { el.classList.remove('pulse'); void el.getBoundingClientRect(); el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 2400); }
  labSay({
    balance: 'Essaie de déplacer le panier qui brille. Plus loin, ou plus près du centre ?',
    light: 'Touche le miroir qui brille : il n\'envoie pas la lumière du bon côté.',
    gears: 'Touche la roue qui brille pour changer sa taille.',
    rhythm: 'Touche l\'ami qui brille pour le décaler d\'un pas.',
  }[lv.family]);
}

/* ---------- Lancer la machine ---------- */
async function runLab() {
  if (L.running) { L.token++; L.running = false; renderScene(); labSay('Stop !'); return; }
  const lv = L.level;
  const res = evaluateLab(lv, L.setup);
  if (res.result === 'invalid') return;
  L.last = res; L.running = true;
  const token = ++L.token;
  $('#lab').classList.add('running');
  $('#btnLabRun').innerHTML = `${I.stop}<span>Stop</span>`;
  stopVoice();
  await animateScene(res, token);
  if (token !== L.token) return;
  L.running = false;
  $('#lab').classList.remove('running');
  $('#btnLabRun').innerHTML = `${I.play}<span>${LAB_RUN[lv.family]}</span>`;
  const outcome = res.metrics.outcome;
  if (!L.free) markGuess(outcome);
  let msg = '';
  if (!L.free && L.guess) {
    const g = LAB_GUESS[lv.family], mine = g.find(o => o.v === L.guess), real = g.find(o => o.v === outcome);
    msg = L.guess === outcome ? 'Tu avais deviné ! ' : `Tu pensais « ${mine.label.toLowerCase()} »… regarde : ${real.label.toLowerCase()}. `;
  }
  if (L.free) { labSay(res.feedback + ' Change une chose et recommence !'); return; }
  if (res.success) {
    const first = !labSolved(lv.id);
    save.labs.solved[lv.id] = true; persist();
    SFX.win(); buzz([30, 60, 30]); confetti();
    $('#lab').classList.add('lab-done');
    renderLabDots();
    labSay(msg + res.feedback + ' ' + lv.discovery);
    if (labLevelsOf(lv.family).every(l => labSolved(l.id))) setTimeout(() => award('m-' + lv.family), first ? 1200 : 0);
  } else {
    SFX.nope();
    labSay(msg + res.feedback + ' ' + res.observations[0]);
  }
}
function labNext() {
  const lvls = labLevelsOf(L.level.family);
  const i = lvls.indexOf(L.level);
  const next = lvls.slice(i + 1).find(l => !labSolved(l.id)) || lvls[i + 1];
  if (next) openLab(next.id, false);
  else { show('home'); openMachines(); }
}

/* ---------- Scènes : SVG + gestes ---------- */
function fitScene() {
  const wrap = $('.scene-wrap'), sc = $('#scene');
  if (!L.level || $('#lab').hidden) return;
  const r = wrap.getBoundingClientRect(); if (!r.width || !r.height) return;
  const [aw, ah] = sceneAspect(L.level).split('/').map(Number);
  const ar = aw / ah;
  let w = Math.min(r.width, 760), h = w / ar;
  if (h > r.height) { h = r.height; w = h * ar; }
  sc.style.setProperty('--sw', Math.floor(w) + 'px'); sc.style.setProperty('--sh', Math.floor(h) + 'px');
}
function renderScene() {
  const sc = $('#scene');
  const lv = L.level;
  sc.style.setProperty('--ar', sceneAspect(lv));
  sc.innerHTML = sceneSVG(lv, L.setup, {});
  bindScene(lv);
  fitScene();
}
function sceneAspect(lv) {
  if (lv.family === 'balance') return '640 / 330';
  if (lv.family === 'light') return `${lv.scene.width * 70 + 40} / ${lv.scene.height * 70 + 40}`;
  if (lv.family === 'gears') { const d = gearsLayout(lv, L.setup || lv.initial); return `${d.W} / ${d.H}`; }
  const d = rhythmLayout(lv); return `${d.W} / ${d.H}`;
}
function sceneSVG(lv, setup, o) {
  return { balance: balanceSVG, light: lightSVG, gears: gearsSVG, rhythm: rhythmSVG }[lv.family](lv, setup, o || {});
}
const avatarUse = (who, x, y, s) => `<use href="#${who === 'bip' ? 'bip-body' : 'avatar-' + who}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
const SCREW = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#B4854A"/><path d="M${x - 2.5} ${y}h5" stroke="#F2C98A" stroke-width="1.6"/>`;

/* --- La balance --- */
const BAL_X0 = 320, BAL_Y = 200, BAL_DX = 60, BAL_PIVOT_Y = 200;
function balanceSVG(lv, setup, o) {
  const weights = lv.scene.weights.map(w => ({ ...w, pos: w.control ? setup[w.control] : w.position }));
  const notches = lv.scene.positions.map(p => `<rect x="${BAL_X0 + p * BAL_DX - 3.5}" y="${BAL_Y - 8}" width="7" height="16" rx="3.5" fill="#B4854A" opacity=".55"/>` +
    (o.mini ? '' : `<text x="${BAL_X0 + p * BAL_DX}" y="${BAL_Y + 38}" font-size="17" text-anchor="middle">${Math.abs(p)}</text>`)).join('');
  const baskets = weights.map(w => {
    const big = w.mass > 1, W = big ? 74 : 54, H = big ? 62 : 44;
    const x = BAL_X0 + w.pos * BAL_DX, y = BAL_Y - 11;
    const fill = big ? '#E5566B' : '#44BC7D', dark = big ? '#B03A4E' : '#2E9A60';
    const movable = !!w.control && !o.mini;
    return `<g class="basket${movable ? ' grab' : ''}" data-key="${w.control || ''}" data-id="${w.id}" transform="translate(${x} ${y})">
      <path d="M${-W / 2 + 4} ${-H}h${W - 8}l6 ${H}h${-W - 4}z" fill="${fill}"/>
      <path d="M${-W / 2 + 4} ${-H}h${W - 8}" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>
      <path d="M${-W / 4} ${-H}q${W / 4} ${-H * .55} ${W / 2} 0" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>
      ${big ? `<text x="0" y="${-H / 2 + 9}" font-size="24" text-anchor="middle" fill="#fff">2</text>` : `<text x="0" y="${-H / 2 + 7}" font-size="19" text-anchor="middle" fill="#fff">1</text>`}
      ${movable ? `<circle cx="0" cy="${-H - 16}" r="7" fill="#fff" stroke="${dark}" stroke-width="3" class="handle"/>` : SCREW(0, -6)}
    </g>`;
  }).join('');
  const dots = o.torque ? ['left', 'right'].map(side => {
    const n = side === 'left' ? o.torque.leftTorque : o.torque.rightTorque;
    const cx = BAL_X0 + (side === 'left' ? -1 : 1) * 2.4 * BAL_DX;
    return Array.from({ length: Math.min(n, 12) }, (_, k) => `<circle cx="${cx - Math.min(n, 12) * 9 + k * 18 + 9}" cy="${BAL_Y + 64}" r="7" fill="var(--pollen)" stroke="#E9A923" stroke-width="2"><animate attributeName="r" from="0" to="7" dur=".3s" begin="${k * .08}s" fill="freeze"/></circle>`).join('');
  }).join('') : '';
  const angle = o.angle || 0;
  return `<svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="292" width="640" height="38" fill="#D9EFCF"/>
    <path d="M320 ${BAL_PIVOT_Y + 8}L270 294H370Z" fill="#9CC78D"/>
    <g class="beam" style="transform-origin:${BAL_X0}px ${BAL_PIVOT_Y}px;transform:rotate(${angle}deg);transition:transform .9s cubic-bezier(.3,1.3,.5,1)">
      <rect x="${BAL_X0 - 4.7 * BAL_DX}" y="${BAL_Y - 11}" width="${9.4 * BAL_DX}" height="22" rx="11" fill="#D9A968"/>
      <rect x="${BAL_X0 - 4.7 * BAL_DX}" y="${BAL_Y - 11}" width="${9.4 * BAL_DX}" height="7" rx="3.5" fill="#EBC58E"/>
      ${notches}${baskets}
    </g>
    <circle cx="${BAL_X0}" cy="${BAL_PIVOT_Y}" r="9" fill="#F2C98A" stroke="#B4854A" stroke-width="3"/>
    ${dots}
    ${o.mini ? '' : `<text x="${BAL_X0}" y="318" font-size="15" text-anchor="middle">le centre</text>`}
  </svg>`;
}
function bindBalance(lv) {
  const svg = $('#scene svg');
  const toLocal = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  $$('#scene .basket.grab').forEach(g => {
    g.addEventListener('pointerdown', e => {
      if (L.running) return;
      e.preventDefault(); audio();
      const key = g.dataset.key, ctrl = lv.controls.find(c => c.key === key);
      const vals = ctrl.options.map(o => o.value);
      L.drag = { key, vals, g, pid: e.pointerId, cur: L.setup[key] };
      g.setPointerCapture(e.pointerId);
      g.classList.add('lift');
      SFX.tap();
    });
    g.addEventListener('pointermove', e => {
      if (!L.drag || e.pointerId !== L.drag.pid) return;
      const p = toLocal(e);
      const raw = (p.x - BAL_X0) / BAL_DX;
      let best = L.drag.vals[0];
      for (const v of L.drag.vals) if (Math.abs(v - raw) < Math.abs(best - raw)) best = v;
      const x = BAL_X0 + Math.max(L.drag.vals[0], Math.min(L.drag.vals[L.drag.vals.length - 1], raw)) * BAL_DX;
      g.setAttribute('transform', `translate(${x} ${BAL_Y - 26})`);
      if (best !== L.drag.cur) { L.drag.cur = best; SFX.tap(); }
    });
    const up = e => {
      if (!L.drag || e.pointerId !== L.drag.pid) return;
      const d = L.drag; L.drag = null;
      g.classList.remove('lift');
      if (d.cur !== L.setup[d.key]) setControl(d.key, d.cur); else renderScene();
    };
    g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
  });
}
async function animateBalance(res, token) {
  const m = res.metrics;
  const angle = m.outcome === 'balanced' ? 0 : (m.outcome === 'right' ? 1 : -1) * Math.min(16, 6 + Math.abs(m.delta) * 3);
  $('#scene').innerHTML = balanceSVG(L.level, L.setup, { angle: 0, held: false });
  SFX.pad();
  await sleep(250 * T); if (token !== L.token) return;
  const beam = $('#scene .beam');
  beam.style.transform = `rotate(${angle}deg)`;
  await sleep(1000 * T); if (token !== L.token) return;
  if (m.outcome === 'balanced') { beam.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0deg)' }], { duration: 900 * T }); SFX.collect(); }
  else SFX.bump();
  $('#scene').innerHTML = balanceSVG(L.level, L.setup, { angle, held: false, torque: m });
  bindBalance(L.level);
  await sleep(600 * T);
}

/* --- La lumière --- */
const LC = 70, LPAD = 20;
function lightSVG(lv, setup, o) {
  const sc = lv.scene, W = sc.width * LC + LPAD * 2, H = sc.height * LC + LPAD * 2;
  const cx = x => LPAD + x * LC + LC / 2, cy = y => LPAD + y * LC + LC / 2;
  let g = '';
  for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) g += `<rect x="${LPAD + x * LC + 2}" y="${LPAD + y * LC + 2}" width="${LC - 4}" height="${LC - 4}" rx="10" fill="${(x + y) % 2 ? '#FFF6DF' : '#FFFBEF'}"/>`;
  const src = sc.source, rot = { r: 0, d: 90, l: 180, u: 270 }[src.dir];
  const lamp = `<g transform="translate(${cx(src.x)} ${cy(src.y)}) rotate(${rot})"><path d="M14 -14L30 -24V24L14 14Z" fill="#FFE08A"/><rect x="-26" y="-16" width="40" height="32" rx="10" fill="#5F7086"/><rect x="-20" y="-10" width="18" height="20" rx="6" fill="#8FA1B8"/><circle cx="14" cy="0" r="12" fill="#FFC94F" stroke="#E9A923" stroke-width="3"/></g>`;
  const mirrors = (sc.mirrors || []).map(m => {
    const v = m.control ? setup[m.control] : m.orientation;
    const movable = !!m.control && !o.mini;
    return `<g class="mirror${movable ? ' tap' : ''}" data-key="${m.control || ''}" transform="translate(${cx(m.x)} ${cy(m.y)})">
      <rect x="-28" y="-28" width="56" height="56" rx="12" fill="#E8F3FA" stroke="#9AD2EE" stroke-width="3"/>
      <path d="${v === '/' ? 'M-18 18L18 -18' : 'M-18 -18L18 18'}" stroke="#4E86C7" stroke-width="7" stroke-linecap="round"/>
      <path d="${v === '/' ? 'M-18 18L18 -18' : 'M-18 -18L18 18'}" stroke="#fff" stroke-width="2.5" stroke-linecap="round" transform="translate(-3 -3)"/>
      ${movable ? `<circle cx="20" cy="-20" r="7" fill="#fff" stroke="#4E86C7" stroke-width="2.5"/><path d="M17 -20a3 3 0 1 1 3 3" fill="none" stroke="#4E86C7" stroke-width="2"/>` : ''}
    </g>`;
  }).join('');
  const splitters = (sc.splitters || []).map(s => `<g transform="translate(${cx(s.x)} ${cy(s.y)})"><path d="M0 -26L26 0L0 26L-26 0Z" fill="#CFC6F7" stroke="#8670D6" stroke-width="3"/><path d="M0 -14L0 14M-14 0L14 0" stroke="#fff" stroke-width="3" opacity=".8"/></g>`).join('');
  const targets = (sc.targets || []).map(t => `<g class="firefly${o.lit && o.lit.includes(t.id) ? ' lit' : ''}" data-id="${t.id}" transform="translate(${cx(t.x) - 30} ${cy(t.y) - 30})"><circle class="halo" cx="30" cy="31" r="34" fill="#FFE9A8" opacity="0"/><use href="#toy-e" width="60" height="60"/></g>`).join('');
  const walls = (sc.walls || []).map(w => `<use href="#bush" x="${cx(w.x) - 30}" y="${cy(w.y) - 30}" width="60" height="60"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}<g class="rays"></g>${walls}${splitters}${mirrors}${targets}${lamp}</svg>`;
}
function bindLight(lv) {
  $$('#scene .mirror.tap').forEach(m => m.addEventListener('click', () => { if (!L.running) cycleControl(m.dataset.key); }));
}
async function animateLight(res, token) {
  renderScene();
  const svg = $('#scene svg'), rays = $('.rays', svg);
  const sc = L.level.scene;
  const cx = x => LPAD + x * LC + LC / 2, cy = y => LPAD + y * LC + LC / 2;
  const lit = [];
  for (const st of res.steps) {
    if (token !== L.token) return;
    if (st.kind === 'ray') {
      const x1 = cx(st.from[0]), y1 = cy(st.from[1]);
      const x2 = st.outside ? x1 + (cx(st.to[0]) - x1) * .5 : cx(st.to[0]), y2 = st.outside ? y1 + (cy(st.to[1]) - y1) * .5 : cy(st.to[1]);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x1); line.setAttribute('y2', y1);
      line.setAttribute('stroke', '#FFD36B'); line.setAttribute('stroke-width', '10'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('opacity', '.9');
      rays.appendChild(line);
      line.animate([{ x2: x1, y2: y1 }, { x2, y2 }], { duration: 160 * T, fill: 'forwards' });
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      SFX.tap();
      await sleep(170 * T);
      if (st.outside) { SFX.nope(); }
    } else if (st.kind === 'reflect') { SFX.turn(); }
    else if (st.kind === 'split') { SFX.look(true); }
    else if (st.kind === 'light') {
      lit.push(st.id);
      const f = $(`#scene .firefly[data-id="${st.id}"]`);
      if (f) { f.classList.add('lit'); const h = $('.halo', f); h.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: .7, transform: 'scale(1)' }], { duration: 400 * T, fill: 'forwards' }); }
      SFX.collect();
      await sleep(300 * T);
    }
  }
  await sleep(300 * T);
}

/* --- Les roues --- */
function gearsLayout(lv, setup) {
  const list = [{ id: lv.scene.input.id, teeth: lv.scene.input.teeth, control: null }].concat(lv.scene.gears.map(g => ({ id: g.id, teeth: g.control ? setup[g.control] : g.teeth, control: g.control })));
  const rs = list.map(g => gearR(g.teeth));
  const xs = []; let x = 40 + rs[0];
  rs.forEach((r, i) => { if (i) x += rs[i - 1] + r + 4; xs.push(x); });
  const W = x + rs[rs.length - 1] + 40, maxR = Math.max(...rs), H = maxR * 2 + 150;
  return { list, rs, xs, W, H, cy: 70 + maxR };
}
function gearPath(teeth, r) {
  const n = teeth, tooth = 9, inner = r - tooth;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + .25) / n) * Math.PI * 2, a2 = ((i + .5) / n) * Math.PI * 2, a3 = ((i + .75) / n) * Math.PI * 2;
    const p = (a, rr) => `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
    d += (i ? 'L' : 'M') + p(a0, inner) + ' L' + p(a1 - .02, r) + ' L' + p(a2 - .02, r) + ' L' + p(a3, inner) + ' ';
  }
  return d + 'Z';
}
const GEAR_FILL = { bip: '#77AFEA', zoe: '#E5566B', message: '#C9B98A' }, GEAR_DARK = { bip: '#4E86C7', zoe: '#B03A4E', message: '#A0906A' };
function gearsSVG(lv, setup, o) {
  const d = gearsLayout(lv, setup);
  const goal = lv.goal;
  const gears = d.list.map((g, i) => {
    const r = d.rs[i], x = d.xs[i], movable = !!g.control && !o.mini;
    const who = g.id === 'message' ? null : g.id;
    const face = who ? avatarUse(who, -r * .42, -r * .42, r * .84) : `<circle r="${r * .3}" fill="#fff" opacity=".8"/><circle r="${r * .12}" fill="${GEAR_DARK.message}"/>`;
    const rot = o.rot ? o.rot[i] || 0 : 0;
    return `<g class="gear${movable ? ' tap' : ''}" data-key="${g.control || ''}" data-i="${i}" transform="translate(${x} ${d.cy})">
      <g class="spin" style="transform:rotate(${rot}deg);transform-origin:0 0">
        <path d="${gearPath(g.teeth, r)}" fill="${GEAR_FILL[g.id] || '#C9B98A'}" stroke="${GEAR_DARK[g.id] || '#A0906A'}" stroke-width="3" stroke-linejoin="round"/>
        <circle r="${r - 16}" fill="#fff" opacity=".35"/>
        <path d="M0 ${-(r - 20)}V${-(r - 36)}" stroke="#2C3A4C" stroke-width="5" stroke-linecap="round"/>
        ${face}
      </g>
      ${movable ? `<circle cx="${r * .72}" cy="${-r * .72}" r="12" fill="#fff" stroke="${GEAR_DARK[g.id] || '#A0906A'}" stroke-width="3"/><path d="M${r * .72 - 5} ${-r * .72}h10M${r * .72} ${-r * .72 - 5}v10" stroke="${GEAR_DARK[g.id] || '#A0906A'}" stroke-width="3" stroke-linecap="round"/>` : SCREW(0, r + 14)}
      ${o.mini ? '' : `<text x="0" y="${r + 34}" font-size="15" text-anchor="middle">${g.teeth} dents</text>`}
    </g>`;
  }).join('');
  const last = d.list.length - 1;
  const goalTurns = goal.turns.numerator / goal.turns.denominator;
  const goalBox = o.mini || !goal ? '' : `<g transform="translate(${d.xs[last]} 30)"><rect x="-58" y="-24" width="116" height="40" rx="14" fill="#fff" stroke="var(--line)" stroke-width="2"/>
      <text x="-44" y="2" font-size="14">Zoé :</text>
      <g transform="translate(-4 -4) scale(${goal.direction > 0 ? 1 : -1} 1)"><path d="M-10 0a10 10 0 1 1 3 7" fill="none" stroke="#2C3A4C" stroke-width="3"/><path d="M-11 7l4-6 3 7z" fill="#2C3A4C"/></g>
      ${Array.from({ length: Math.round(goalTurns) }, (_, k) => `<circle cx="${18 + k * 14}" cy="-4" r="5" fill="#E5566B"/>`).join('')}
    </g>`;
  const turnDots = o.turns != null && !o.mini ? `<g transform="translate(${d.xs[last]} ${d.cy + d.rs[last] + 56})">${Array.from({ length: Math.ceil(Math.abs(o.turns)) }, (_, k) => `<circle cx="${(k - (Math.ceil(Math.abs(o.turns)) - 1) / 2) * 16}" cy="0" r="6" fill="#E5566B" opacity="${k + 1 <= Math.abs(o.turns) ? 1 : .35}"/>`).join('')}</g>` : '';
  return `<svg viewBox="0 0 ${d.W} ${d.H}" xmlns="http://www.w3.org/2000/svg">${goalBox}${gears}${turnDots}</svg>`;
}
function bindGears(lv) {
  $$('#scene .gear.tap').forEach(g => g.addEventListener('click', () => { if (!L.running) cycleControl(g.dataset.key); }));
}
async function animateGears(res, token) {
  renderScene();
  const spins = $$('#scene .gear .spin');
  const dur = 2600 * T;
  res.metrics.gears.forEach((g, i) => {
    const el = spins[i]; if (!el) return;
    const deg = g.signedTurns * 360;
    el.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${deg}deg)` }], { duration: dur, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
  });
  const ticks = Math.max(2, Math.round(Math.abs(res.metrics.outputTurns) * 4));
  for (let k = 0; k < ticks; k++) { if (token !== L.token) return; SFX.balltap(); await sleep(dur / ticks); }
  if (token !== L.token) return;
  const rot = res.metrics.gears.map(g => g.signedTurns * 360);
  $('#scene').innerHTML = gearsSVG(L.level, L.setup, { rot, turns: res.metrics.outputTurns });
  bindGears(L.level);
  await sleep(200 * T);
}

/* --- Le rendez-vous --- */
const RC = 32, RL = 84, RTOP = 54;
function rhythmLayout(lv) {
  const n = lv.scene.horizon + 1, rows = lv.scene.cycles.length;
  return { n, rows, W: RL + n * RC + 16, H: RTOP + rows * 62 + 16 };
}
const CYC_COLOR = { bip: '#77AFEA', zoe: '#E5566B', lulu: '#69BD7B' };
function rhythmSVG(lv, setup, o) {
  const d = rhythmLayout(lv);
  const cycles = lv.scene.cycles.map(c => ({ ...c, phase: c.control ? setup[c.control] : c.phase }));
  const targets = lv.goal.targetTicks;
  const focus = lv.goal.focusTick == null ? targets[0] : lv.goal.focusTick;
  const colX = t => RL + t * RC + RC / 2;
  let head = '';
  for (let t = 0; t < d.n; t++) head += `<text x="${colX(t)}" y="${RTOP - 30}" font-size="12" text-anchor="middle" opacity=".7">${t}</text>`;
  const marker = o.mini ? '' : `<g transform="translate(${colX(focus)} ${RTOP - 14})"><path d="M0 8C-5 2-14 4-11 10L0 20L11 10C14 4 5 2 0 8Z" fill="#FF8878"/></g>`;
  const rows = cycles.map((c, i) => {
    const y = RTOP + i * 62 + 14, movable = !!c.control && !o.mini;
    let cells = '';
    for (let t = 0; t < d.n; t++) {
      const on = t % c.period === c.phase;
      const reached = o.tick != null && t <= o.tick;
      cells += `<rect x="${colX(t) - RC / 2 + 2}" y="${y}" width="${RC - 4}" height="44" rx="9" fill="${targets.includes(t) ? '#FFF1C2' : '#F3F7F7'}"/>` +
        (on ? `<circle class="beat" cx="${colX(t)}" cy="${y + 22}" r="${o.tick != null && t === o.tick ? 15 : 11}" fill="${CYC_COLOR[c.id]}" opacity="${o.tick != null && !reached ? .35 : 1}"/>` : '');
    }
    return `<g class="row${movable ? ' tap' : ''}" data-key="${c.control || ''}">
      <rect x="4" y="${y - 4}" width="${d.W - 8}" height="52" rx="14" fill="${movable ? '#fff' : 'transparent'}" opacity=".6"/>
      ${avatarUse(c.id, 10, y - 2, 48)}
      ${movable ? `<circle cx="66" cy="${y + 6}" r="9" fill="#fff" stroke="${CYC_COLOR[c.id]}" stroke-width="2.5"/><path d="M61 ${y + 6}h10M66 ${y + 1}v10" stroke="${CYC_COLOR[c.id]}" stroke-width="2.5" stroke-linecap="round"/>` : SCREW(66, y + 6)}
      ${cells}
    </g>`;
  }).join('');
  const cursor = o.tick != null ? `<rect x="${colX(o.tick) - RC / 2}" y="${RTOP - 6}" width="${RC}" height="${d.rows * 62 + 2}" rx="12" fill="none" stroke="var(--go)" stroke-width="3"/>` : '';
  const hearts = (o.together || []).map(t => `<g transform="translate(${colX(t)} ${RTOP + d.rows * 62 + 2})"><path d="M0 6C-6 -1-16 1-13 8L0 20L13 8C16 1 6 -1 0 6Z" fill="#FF8878"><animate attributeName="opacity" from="0" to="1" dur=".3s" fill="freeze"/></path></g>`).join('');
  return `<svg viewBox="0 0 ${d.W} ${d.H}" xmlns="http://www.w3.org/2000/svg">${head}${marker}${rows}${cursor}${hearts}</svg>`;
}
function bindRhythm(lv) {
  $$('#scene .row.tap').forEach(r => r.addEventListener('click', () => { if (!L.running) cycleControl(r.dataset.key); }));
}
async function animateRhythm(res, token) {
  const together = [];
  for (const fr of res.metrics.timeline) {
    if (token !== L.token) return;
    if (fr.together) together.push(fr.tick);
    $('#scene').innerHTML = rhythmSVG(L.level, L.setup, { tick: fr.tick, together });
    if (fr.together) SFX.collect(); else if (fr.active.length) SFX.step(); else SFX.tap();
    await sleep((fr.active.length ? 330 : 220) * T);
  }
  if (token !== L.token) return;
  $('#scene').innerHTML = rhythmSVG(L.level, L.setup, { tick: null, together });
  bindRhythm(L.level);
  await sleep(200 * T);
}

function bindScene(lv) { ({ balance: bindBalance, light: bindLight, gears: bindGears, rhythm: bindRhythm })[lv.family](lv); }
function animateScene(res, token) { return ({ balance: animateBalance, light: animateLight, gears: animateGears, rhythm: animateRhythm })[L.level.family](res, token); }

function wireLabs() {
  $('#btnMachines').addEventListener('click', () => { audio(); openMachines(); });
  $('#btnMachinesClose').addEventListener('click', () => { $('#machines').hidden = true; });
  $('#machines').addEventListener('click', e => { if (e.target.id === 'machines') $('#machines').hidden = true; });
  $('#btnLabHome').addEventListener('click', () => { L.token++; L.running = false; show('home'); openMachines(); });
  $('#btnLabRun').addEventListener('click', () => { audio(); runLab(); });
  $('#btnLabReset').addEventListener('click', () => { audio(); labReset(); });
  $('#btnLabHint').addEventListener('click', () => { audio(); labHint(); });
  $('#btnLabNext').addEventListener('click', () => { audio(); labNext(); });
  $('#labBubble').addEventListener('click', () => speak($('#labMsg').textContent));
  $('#btnLabReset').innerHTML = I.replay; $('#btnLabHint').innerHTML = I.bulb; $('#labSpk').innerHTML = I.speaker; $('#btnLabHome').innerHTML = I.home;
  $('#icoPapi').innerHTML = symUse('avatar-papi');
}
