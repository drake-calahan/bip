/* QA navigateur V4 — parcours complets avec Playwright (npm i -D playwright, ou PLAYWRIGHT_BROWSERS_PATH).
   Usage : python -m http.server 8103 --bind 127.0.0.1   puis   node tools/check-ui.js [http://127.0.0.1:8103/]
   Vérifie : carte, niveau 1 joué et gagné, fin de chapitre (mascotte), toboggan gagné, les quatre machines
   gagnées par les gestes (glisser, toucher), Mon jardin, album, feuille adultes, aucune erreur JS,
   en 390×844 (tactile) et 1280×800. Captures dans .artifact/. */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const URL = process.argv[2] || 'http://127.0.0.1:8103/';
const OUT = path.join(__dirname, '..', '.artifact');
fs.mkdirSync(OUT, { recursive: true });
const shot = (pg, name) => pg.screenshot({ path: path.join(OUT, name + '.png') });
const assert = (cond, msg) => { if (!cond) throw new Error('ÉCHEC : ' + msg); console.log('  ok  ' + msg); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function dismissStory(pg) { if (await pg.locator('#story').isVisible()) { await pg.click('#storyCard'); await sleep(300); } }

async function run() {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errors.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });

  console.log('Carte');
  await pg.goto(URL); await sleep(500);
  assert(await pg.locator('#trail .node').count() === 80, '80 cailloux sur le chemin');
  assert(await pg.locator('#trail .node.next').count() === 1, 'Bip est posé sur un seul caillou');
  assert(await pg.locator('#trail .chap-banner').count() === 16, '16 bannières de chapitre');
  await shot(pg, 'v4-home-390');

  console.log('Niveau 1');
  await pg.click('#btnPlay'); await sleep(500); await dismissStory(pg);
  assert(!(await pg.locator('#game').isHidden()), 'le niveau 1 s\'ouvre en un geste');
  assert((await pg.locator('#palette .blk').count()) === 1, 'palette : une seule flèche au niveau 1');
  for (let k = 0; k < 3; k++) { await pg.click('#palette .blk'); await sleep(120); }
  assert((await pg.locator('#main .blk').count()) === 3, 'trois blocs dans le programme');
  await shot(pg, 'v4-level1-390');
  await pg.click('#btnRun'); await sleep(4200);
  assert(await pg.locator('#win').isVisible(), 'carte Bravo après la victoire');
  assert((await pg.locator('#winStars svg.on').count()) === 3, 'trois étoiles');
  await shot(pg, 'v4-win-390');
  await pg.click('#btnNext'); await sleep(500);
  assert(await pg.evaluate(() => window.__bip.G.lv.id === 2), 'Suivant ouvre le niveau 2 sans écran intermédiaire');

  console.log('Fin de chapitre');
  await pg.evaluate(() => { const s = window.__bip.save; for (let i = 1; i <= 4; i++) s.stars[i] = 3; s.seen.ce = {}; window.__bip.persist(); window.__bip.openLevel(4); });
  await sleep(400); await dismissStory(pg);
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('r r d l', () => 'q' + Math.random()); B.runAll(); });
  await sleep(4500);
  assert(await pg.locator('#winWho').isVisible(), 'la mascotte parle sur la carte de fin de chapitre');
  await shot(pg, 'v4-chapter-end-390');

  console.log('Toboggan');
  await pg.evaluate(() => window.__bip.openLevel(60)); await sleep(500); await dismissStory(pg);
  assert(await pg.locator('#game.ball-only').count() === 1, 'mode toboggan : palette de flèches au sol');
  const bb = await pg.locator('#board').boundingBox(); const cell = await pg.evaluate(() => window.__bip.G.cellPx);
  await pg.click('#palette .blk[data-t="d"]'); await sleep(150);
  await pg.mouse.click(bb.x + 7 + cell * 1.5, bb.y + 7 + cell * .5); await sleep(300);
  await pg.click('#btnRun'); await sleep(3000);
  assert(await pg.locator('#win').isVisible(), 'Ballon arrive au nid');

  console.log('Machines');
  await pg.goto(URL); await sleep(400);
  await pg.click('#btnMachines'); await sleep(400);
  assert((await pg.locator('#machinesGrid .mcard').count()) === 4, 'quatre machines');
  await shot(pg, 'v4-machines-390');
  await pg.evaluate(() => window.__bip.openLab('balance-1', false)); await sleep(400);
  const g = await pg.locator('#scene .basket.grab').boundingBox();
  await pg.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await pg.mouse.down();
  await pg.mouse.move(g.x + g.width / 2 + 40, g.y + g.height / 2, { steps: 6 }); await pg.mouse.up(); await sleep(300);
  assert(await pg.evaluate(() => window.__bip.L.setup.small === 2), 'le panier glisse d\'un cran');
  await pg.click('#labGuess button[data-v="balanced"]'); await sleep(150);
  await pg.click('#btnLabRun'); await sleep(2600);
  assert(await pg.evaluate(() => !!window.__bip.save.labs.solved['balance-1']), 'balance 1 réussie après le lâcher');
  assert(await pg.locator('#labGuess button.hit').count() === 1, 'la prédiction juste s\'allume');
  await shot(pg, 'v4-balance-390');
  await pg.evaluate(() => window.__bip.openLab('light-1', false)); await sleep(300);
  await pg.click('#scene .mirror.tap'); await sleep(200);
  await pg.click('#btnLabRun'); await sleep(2500);
  assert(await pg.evaluate(() => !!window.__bip.save.labs.solved['light-1']), 'lumière 1 : un tap sur le miroir suffit');
  await shot(pg, 'v4-light-390');
  await pg.evaluate(() => window.__bip.openLab('gears-1', false)); await sleep(300);
  await pg.click('#scene .gear.tap'); await sleep(200);     // 24 → 6
  await pg.click('#scene .gear.tap'); await sleep(200);     // 6 → 12
  await pg.click('#btnLabRun'); await sleep(3600);
  assert(await pg.evaluate(() => !!window.__bip.save.labs.solved['gears-1']), 'roues 1 : deux taps changent la roue');
  await shot(pg, 'v4-gears-390');
  await pg.evaluate(() => window.__bip.openLab('rhythm-1', false)); await sleep(300);
  await pg.click('#scene .row.tap'); await sleep(200);      // 1 → 2
  await pg.click('#scene .row.tap'); await sleep(200);      // 2 → 0
  await pg.click('#btnLabRun'); await sleep(3200);
  assert(await pg.evaluate(() => !!window.__bip.save.labs.solved['rhythm-1']), 'rendez-vous 1 : décaler Zoé suffit');
  await shot(pg, 'v4-rhythm-390');

  console.log('Mon jardin, album, adultes');
  await pg.goto(URL); await sleep(400);
  await pg.click('#btnSandbox'); await sleep(400);
  assert(await pg.locator('#sandbox').isVisible(), 'Mon jardin s\'ouvre');
  await shot(pg, 'v4-sandbox-390');
  await pg.goto(URL); await sleep(400);
  await pg.click('#btnAlbum'); await sleep(400);
  assert((await pg.locator('#albumGrid .stk').count()) >= 29, 'album : chapitres, mondes, spéciaux et machines');
  await shot(pg, 'v4-album-390');
  await pg.keyboard.press('Escape');
  await pg.click('#btnAdults'); await sleep(300);
  assert(await pg.locator('#sheet').isVisible(), 'feuille adultes');
  await pg.keyboard.press('Escape');
  await pg.reload(); await sleep(500);
  assert(await pg.evaluate(() => (window.__bip.save.stars[1] || 0) > 0 && !!window.__bip.save.labs.solved['balance-1']), 'la progression survit au rechargement');
  await ctx.close();

  console.log('Paysage 1280×800');
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg2 = await ctx2.newPage();
  pg2.on('pageerror', e => errors.push('desk: ' + String(e)));
  await pg2.goto(URL); await sleep(500);
  await shot(pg2, 'v4-home-desktop');
  await pg2.evaluate(() => window.__bip.openLevel(16)); await sleep(500); await dismissStory(pg2);
  const prog = await pg2.locator('#progCard').boundingBox(), board = await pg2.locator('#board').boundingBox();
  assert(prog.x > board.x + board.width - 1, 'paysage : programme à droite du plateau');
  await shot(pg2, 'v4-level-desktop');
  await pg2.evaluate(() => window.__bip.openLab('gears-3', false)); await sleep(500);
  await shot(pg2, 'v4-gears-desktop');
  const over = await pg2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!over, 'pas de débordement horizontal');
  await browser.close();

  if (errors.length) { console.log('\nErreurs JS :'); errors.forEach(e => console.log('  ' + e)); process.exit(1); }
  console.log('\nUI OK — captures dans .artifact/');
}
run().catch(e => { console.error(e); process.exit(1); });
