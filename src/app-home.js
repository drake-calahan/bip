/* ---------- La carte : un chemin dans quatre mondes ---------- */
const unlocked = i => save.all || i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0;
const nextIndex = () => { const i = LEVELS.findIndex(l => l.ch >= 0 && !(save.stars[l.id] > 0)); return i < 0 ? LAST_STORY : i; };
const chapterDone = ci => LEVELS.filter(l => l.ch === ci).every(l => (save.stars[l.id] || 0) > 0);
const worldOf = ci => CHAPTERS[ci].w;
const WORLD_WHO_MAP = ['zoe', 'lulu', 'papi', 'noctule'];
const NODE_STEP = 82, NODE_PAD = 46;
const nodeX = g => 50 + 33 * Math.sin(g * 0.95);   // le sentier serpente selon l'index global

/* Décor léger par monde : brins d'herbe, bulles d'eau, écrous, étoiles */
function worldDeco(w, h) {
  const n = Math.max(6, Math.round(h / 90));
  let out = '';
  for (let k = 0; k < n; k++) {
    const x = (k * 137 + w * 29) % 100, y = ((k * 211 + 17) % Math.max(1, h - 20)) + 10;
    if (w === 0) out += `<path d="M${x} ${y}q2-8 4-14M${x + 4} ${y}q0-9 3-12" stroke="#9CC78D" stroke-width="2" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    else if (w === 1) out += `<circle cx="${x}" cy="${y}" r="${1.5 + (k % 3)}" fill="#fff" opacity=".7"/>`;
    else if (w === 2) out += `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#D9A968" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
    else out += `<circle cx="${x}" cy="${y}" r="${1 + (k % 2)}" fill="#FFE9A8" opacity=".9"/>`;
  }
  return `<svg class="deco" viewBox="0 0 100 ${h}" preserveAspectRatio="none">${out}</svg>`;
}

function renderHome() {
  const nb = CHAPTERS.filter((_, ci) => chapterDone(ci)).length;
  $('#garden').innerHTML = Array.from({ length: nb }, (_, k) => `<span style="animation-delay:${k * .1}s">${symUse('flower')}</span>`).join('');
  const started = Object.keys(save.stars).length > 0;
  $('#btnPlay').lastElementChild.textContent = started ? 'Continuer' : 'Jouer';
  $('#heroSub').textContent = started ? `${CHAPTERS[LEVELS[nextIndex()].ch].name}` : 'Le grand jardin';
  $('#dailyDots').innerHTML = DAILY_NAMES.map((_, k) => `<i class="${save.daily[k] ? 'on' : ''}" style="--a:${Math.round(k * 360 / 7)}deg"></i>`).join('');
  const nStick = save.stickers.length;
  $('#albumBadge').hidden = !nStick; $('#albumBadge').textContent = nStick;
  const nLab = (typeof LAB_LEVELS !== 'undefined') ? LAB_LEVELS.filter(l => save.labs && save.labs.solved && save.labs.solved[l.id]).length : 0;
  $('#machinesBadge').hidden = !nLab; $('#machinesBadge').textContent = nLab;

  const nx = nextIndex();
  let h = '', g = 0;
  WORLDS.forEach((W, w) => {
    const chaps = CHAPTERS.map((c, ci) => [c, ci]).filter(([c]) => c.w === w);
    let inner = '';
    let worldH = 70;
    chaps.forEach(([c, ci]) => {
      const lvls = LEVELS.map((l, i) => [l, i]).filter(([l]) => l.ch === ci);
      const H = NODE_PAD * 2 + (lvls.length - 1) * NODE_STEP;
      worldH += H + 64;
      const pts = lvls.map((_, i) => [nodeX(g + i) * 10, NODE_PAD + i * NODE_STEP]);
      let d = `M${pts[0][0]} ${-30}`;
      pts.forEach((p, i) => {
        if (i === 0) { d += ` L${p[0]} ${p[1]}`; return; }
        const q = pts[i - 1], my = (q[1] + p[1]) / 2;
        d += ` C${q[0]} ${my} ${p[0]} ${my} ${p[0]} ${p[1]}`;
      });
      d += ` L${pts[pts.length - 1][0]} ${H + 30}`;
      const nodes = lvls.map(([l, i], k) => {
        const st = save.stars[l.id] || 0, open = unlocked(i), isNext = i === nx && open;
        const cls = `node${isNext ? ' next' : ''}${st ? ' done' : ''}${!open ? ' far' : ''}`;
        const inside = isNext ? `<span class="rb">${robotSVG()}</span>` : open ? l.id : '';
        const stars = open ? `<span class="st">${st ? [1, 2, 3].map(s => I.star(s <= st)).join('') : ''}</span>` : '';
        return `<button class="${cls}" data-i="${i}" style="--x:${pts[k][0] / 10}%;--y:${pts[k][1]}px" ${open ? '' : 'disabled'} aria-label="Niveau ${l.id}${open ? (st ? ', ' + st + ' étoiles' : '') : ', plus tard'}"><span class="n">${inside}</span>${stars}</button>`;
      }).join('');
      g += lvls.length;
      inner += `<div class="chap" data-tone="${c.tone}">
        <div class="chap-banner"><span class="cn">${ci + 1}</span><span class="av">${CHARS[c.who].art()}</span><span><b>${c.name}</b><small>${c.hint}</small></span></div>
        <div class="nodes" style="--h:${H}px"><svg class="path" viewBox="0 0 1000 ${H}" preserveAspectRatio="none"><path d="${d}" vector-effect="non-scaling-stroke"/><path class="dash" d="${d}" vector-effect="non-scaling-stroke"/></svg>${nodes}</div>
      </div>`;
    });
    const picnic = w === WORLDS.length - 1 ? `<div class="picnic-end">${symUse('picnic')}<span>Le grand pique-nique</span></div>` : '';
    h += `<section class="world" data-w="${w}">${worldDeco(w, worldH)}<div class="world-head"><span class="wa">${CHARS[WORLD_WHO_MAP[w]].art()}</span><span>${W.name}</span></div>${inner}${picnic}</section>`;
  });
  $('#trail').innerHTML = h;
  $$('.node:not(.far)', $('#trail')).forEach(b => b.addEventListener('click', () => { audio(); openLevel(+b.dataset.i); }));
}
function scrollToBip(smooth) {
  const n = $('#trail .node.next');
  if (!n) return;
  const home = $('#home');
  const r = n.getBoundingClientRect(), hr = home.getBoundingClientRect();
  const target = home.scrollTop + (r.top - hr.top) - hr.height * .45;
  if (r.top - hr.top < hr.height * .8 && home.scrollTop === 0) return;   // Bip est déjà visible : on garde le bandeau
  home.scrollTo({ top: Math.max(0, target), behavior: smooth && !RM ? 'smooth' : 'auto' });
}

/* ---------- L'album de Zoé : de vraies images, les manquantes en filigrane ---------- */
function renderAlbum() {
  $('#albumGrid').innerHTML = STICKERS.map(st => {
    const got = hasSticker(st.id);
    return `<div class="stk${got ? ' got' : ''}"><span class="ico">${st.icon()}</span><b>${st.name}</b><small>${st.how}</small></div>`;
  }).join('');
}
function openAlbum() {
  renderAlbum(); $('#album').hidden = false; stopVoice();
  const n = save.stickers.length;
  speak(n ? `L'album de Zoé. Tu as ${n} image${n > 1 ? 's' : ''} !` : 'L\'album de Zoé. Chaque chapitre terminé te donne une image.');
}

/* ---------- Feuille adultes ---------- */
function syncToggles() {
  $('#tgVoice').setAttribute('aria-checked', String(!!save.voice));
  $('#tgSound').setAttribute('aria-checked', String(!!save.sound));
  $('#tgAll').setAttribute('aria-checked', String(!!save.all));
}
let resetArm = 0;
function openSheet() { syncToggles(); $('#sheet').hidden = false; hideHand(); stopVoice(); }
function closeSheet() { $('#sheet').hidden = true; if (!$('#home').hidden) renderHome(); }
