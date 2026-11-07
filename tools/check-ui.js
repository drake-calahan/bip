/* QA navigateur — parcours complets avec Playwright (npm i -D playwright, ou PLAYWRIGHT_BROWSERS_PATH / CHROME_PATH).
   Usage : python -m http.server 8103 --bind 127.0.0.1   puis   node tools/check-ui.js [http://127.0.0.1:8103/]
   Vérifie : carte (5 mondes, 103 cailloux, 21 chapitres), niveau 1 joué et gagné, fin de chapitre (mascotte),
   toboggan gagné, imbrications V8, tournoi V9, V10 (loupe ch20, final aube ch21, codes de partage Mon jardin,
   compteurs feuille adultes), les quatre machines gagnées par les gestes, album, feuille adultes, aucune erreur JS,
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
async function waitWin(pg, maxMs = 10000) { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { if (await pg.locator('#win').isVisible()) return true; await sleep(250); } return pg.locator('#win').isVisible(); }
async function waitSolved(pg, id, maxMs = 9000) { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { if (await pg.evaluate(i => !!(window.__bip.save.labs.solved || {})[i], id)) return true; await sleep(300); } return pg.evaluate(i => !!(window.__bip.save.labs.solved || {})[i], id); }

async function run() {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errors.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });

  console.log('Carte');
  await pg.goto(URL); await sleep(500);
  assert(await pg.locator('#trail .node').count() === 103, '103 cailloux sur le chemin (aventure V10)');
  assert(await pg.locator('#trail .node.next').count() === 1, 'Bip est posé sur un seul caillou');
  assert(await pg.locator('#trail .chap-banner').count() === 21, '21 bannières de chapitre');
  assert(await pg.locator('#trail .world').count() === 5, '5 mondes dont L’aube (V10)');
  assert(await pg.locator('#trail .world[data-w="4"]').count() === 1, 'le monde de l’aube est présent');
  assert((await pg.locator('#trail .world[data-w="4"]').textContent()).includes('L’aube'), 'le monde 5 s’appelle L’aube');
  await shot(pg, 'v10-home-390');

  console.log('Niveau 1');
  await pg.click('#btnPlay'); await sleep(500); await dismissStory(pg);
  assert(!(await pg.locator('#game').isHidden()), 'le niveau 1 s\'ouvre en un geste');
  assert((await pg.locator('#palette .blk').count()) === 1, 'palette : une seule flèche au niveau 1');
  for (let k = 0; k < 3; k++) { await pg.click('#palette .blk'); await sleep(120); }
  assert((await pg.locator('#main .blk').count()) === 3, 'trois blocs dans le programme');
  await shot(pg, 'v10-level1-390');
  await pg.click('#btnRun');
  assert(await waitWin(pg), 'carte Bravo après la victoire');
  assert((await pg.locator('#winStars svg.on').count()) === 3, 'trois étoiles');
  await shot(pg, 'v10-win-390');
  await pg.click('#btnNext'); await sleep(500);
  assert(await pg.evaluate(() => window.__bip.G.lv.id === 2), 'Suivant ouvre le niveau 2 sans écran intermédiaire');

  console.log('Fin de chapitre');
  await pg.evaluate(() => { const s = window.__bip.save; for (let i = 1; i <= 4; i++) s.stars[i] = 3; s.seen.ce = {}; window.__bip.persist(); window.__bip.openLevel(4); });
  await sleep(400); await dismissStory(pg);
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('r r d l', () => 'q' + Math.random()); B.runAll(); });
  assert(await waitWin(pg), 'carte Bravo après L5');
  assert(await pg.evaluate(() => !document.querySelector('#winWho').hidden && /Zo/.test(document.querySelector('#winWho').textContent)), 'la mascotte parle sur la carte de fin de chapitre');
  await shot(pg, 'v10-chapter-end-390');

  console.log('Toboggan');
  await pg.evaluate(() => window.__bip.openLevel(65)); await sleep(500); await dismissStory(pg);
  assert(await pg.locator('#game.ball-only').count() === 1, 'mode toboggan : palette de flèches au sol');
  const bb = await pg.locator('#board').boundingBox(); const cell = await pg.evaluate(() => window.__bip.G.cellPx);
  await pg.click('#palette .blk[data-t="d"]'); await sleep(150);
  await pg.mouse.click(bb.x + 7 + cell * 1.5, bb.y + 7 + cell * .5); await sleep(300);
  await pg.click('#btnRun');
  assert(await waitWin(pg), 'Ballon arrive au nid');

  console.log('Imbrications (robustesse UI V8)');
  await pg.evaluate(() => window.__bip.openLevel(79)); await sleep(500); await dismissStory(pg);
  // conteneur vide -> le run est bloque avec explication, pas de boucle infinie
  await pg.click('#palette .blk[data-t="loop"]'); await sleep(250);
  await pg.click('#btnRun'); await sleep(600);
  assert(await pg.evaluate(() => !window.__bip.G.busy && window.__bip.G.prog.length === 1), 'un bloc Répéter vide bloque le lancement avec explication');
  assert(await pg.locator('#progCard .ctr.bad').count() === 1, 'le conteneur vide est marqué en orange');
  // niveau final tres imbrique : N2(Wo(*) tr) Wo(*) avec fn Ip(j|f) -> gagne
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('N2(Wo(*) tr) Wo(*)'); B.G.fn = B.parseProg('Ip(j|f)'); B.runAll(); });
  assert(await waitWin(pg, 20000), 'niveau final imbrique (boucle>jusqu’à>étoile>si) gagné en UI');
  await shot(pg, 'v8-nested-final-390');
  // capteur + balises : L95 pose-balise
  await pg.evaluate(() => window.__bip.openLevel(94)); await sleep(500); await dismissStory(pg);
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('p f g N2(It(f|tr))'); B.G.fn = []; B.runAll(); });
  assert(await waitWin(pg, 20000), 'L95 tournoi final (p f g N2(It(f|tr))) gagné');
  assert(await pg.locator('#board .it.flag').count() >= 1, 'la balise posée apparaît sur le plateau');

  console.log('V10 — la loupe (ch20) et le final de l’aube (ch21)');
  await pg.evaluate(() => window.__bip.openLevel(95)); await sleep(500); await dismissStory(pg);
  assert((await pg.locator('#palette .blk[data-t="c"]').count()) === 1, 'palette ch20 : le bloc loupe');
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('c'); B.runAll(); });
  assert(await waitWin(pg), 'L96 gagné avec un seul bloc loupe');
  await shot(pg, 'v10-loupe-390');
  await pg.evaluate(() => window.__bip.openLevel(102)); await sleep(500); await dismissStory(pg);
  assert((await pg.locator('#palette .blk[data-t="while"]').count()) === 1, 'L103 : le bloc Jusqu’à est là');
  await pg.evaluate(() => { const B = window.__bip; B.G.prog = B.parseProg('Wg(*) c'); B.G.fn = B.parseProg('Ip(j|f)'); B.runAll(); });
  assert(await waitWin(pg, 30000), 'L103 final de l’aube gagné (Wg(*) c + fn Ip(j|f), 3 jardins)');
  assert(await pg.locator('#board .it.flag').count() >= 1, 'la balise du final est sur le plateau');
  await shot(pg, 'v10-dawn-final-390');

  console.log('Machines (bonus archivé dans la feuille adultes)');
  await pg.goto(URL); await sleep(400);
  assert(await pg.locator('#home #btnDaily').count() === 0, 'plus de bouton défi de Zoé sur l’accueil (archivé V9)');
  assert(await pg.locator('#home #btnMachines').count() === 0, 'plus de bouton machines sur l’accueil (archivé V9)');
  await pg.click('#btnAdults'); await sleep(300);
  assert(await pg.locator('#sheet #btnDaily').count() === 1 && await pg.locator('#sheet #btnMachines').count() === 1, 'bonus archivés présents dans la feuille adultes');
  await pg.click('#sheet #btnMachines'); await sleep(400);
  await pg.keyboard.press('Escape'); await sleep(300);   // fermer la feuille adultes, laisser la machine au premier plan
  assert((await pg.locator('#machinesGrid .mcard').count()) === 4, 'quatre machines');
  await shot(pg, 'v10-machines-390');
  await pg.evaluate(() => window.__bip.openLab('balance-1', false)); await sleep(400);
  const g = await pg.locator('#scene .basket.grab').boundingBox();
  await pg.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await pg.mouse.down();
  await pg.mouse.move(g.x + g.width / 2 + 40, g.y + g.height / 2, { steps: 6 }); await pg.mouse.up(); await sleep(300);
  assert(await pg.evaluate(() => window.__bip.L.setup.small === 2), 'le panier glisse d\'un cran');
  await pg.click('#labGuess button[data-v="balanced"]'); await sleep(150);
  await pg.click('#btnLabRun');
  assert(await waitSolved(pg, 'balance-1'), 'balance 1 réussie après le lâcher');
  assert(await pg.locator('#labGuess button.hit').count() === 1, 'la prédiction juste s\'allume');
  await shot(pg, 'v10-balance-390');
  await pg.evaluate(() => window.__bip.openLab('light-1', false)); await sleep(300);
  await pg.click('#scene .mirror.tap'); await sleep(200);
  await pg.click('#btnLabRun');
  assert(await waitSolved(pg, 'light-1'), 'lumière 1 : un tap sur le miroir suffit');
  await shot(pg, 'v10-light-390');
  await pg.evaluate(() => window.__bip.openLab('gears-1', false)); await sleep(300);
  await pg.click('#scene .gear.tap'); await sleep(200);     // 24 → 6
  await pg.click('#scene .gear.tap'); await sleep(200);     // 6 → 12
  await pg.click('#btnLabRun');
  assert(await waitSolved(pg, 'gears-1'), 'roues 1 : deux taps changent la roue');
  await shot(pg, 'v10-gears-390');
  await pg.evaluate(() => window.__bip.openLab('rhythm-1', false)); await sleep(300);
  await pg.click('#scene .row.tap'); await sleep(200);      // 1 → 2
  await pg.click('#scene .row.tap'); await sleep(200);      // 2 → 0
  await pg.click('#btnLabRun');
  assert(await waitSolved(pg, 'rhythm-1'), 'rendez-vous 1 : décaler Zoé suffit');
  await shot(pg, 'v10-rhythm-390');

  console.log('Mon jardin (codes de partage V10), album, adultes');
  await pg.goto(URL); await sleep(400);
  await pg.click('#btnSandbox'); await sleep(400);
  assert(await pg.locator('#sandbox').isVisible(), 'Mon jardin s\'ouvre');
  assert((await pg.locator('#sbTray #btnSbShare').count()) === 1 && (await pg.locator('#sbTray #btnSbPaste').count()) === 1, 'boutons partager/coller dans la barre d’outils (V10)');
  // NB test : ce chromium headless n’a pas fontconfig, un <input> visible le fait planter (sans lien avec
  // les vrais mobiles) -> on masque le champ ici et on pilote sa valeur par evaluate.
  await pg.addStyleTag({ content: '#sbCodeInput{display:none!important}' });
  await pg.click('#btnSbShare'); await sleep(300);
  assert(await pg.locator('#sbCode').isVisible(), 'la feuille « code de mon jardin » s’ouvre');
  const codeShown = await pg.evaluate(() => document.querySelector('#sbCodeInput').value);
  assert(/^BIP2\.[A-Za-z0-9_-]+$/.test(codeShown), 'le code affiché est bien formé (BIP2, jardin 8×6) : ' + codeShown);
  await shot(pg, 'v10-sbcode-390');
  const friend = await pg.evaluate(() => window.__bip.sbEncode(['R....b..', '..#.....', '........', '..*.....', '....n...', '........']));
  await pg.evaluate(v => { document.querySelector('#sbCodeInput').value = v; }, friend);
  await pg.click('#btnSbLoad'); await sleep(400);
  assert(await pg.locator('#sbCode').isHidden(), 'la feuille se ferme après un bon code');
  assert((await pg.evaluate(() => window.__bip.G.sb.rows[0])) === 'R....b..', 'le jardin reçu est chargé dans le bac à sable (8×6)');
  assert((await pg.evaluate(() => window.__bip.G.sb.rows.length)) === 6, 'le jardin reçu fait 6 lignes');
  await pg.click('#btnSbShare'); await sleep(250);
  await pg.evaluate(() => { document.querySelector('#sbCodeInput').value = 'BIP2.zzzz-ceci-nest-pas-un-jardin'; });
  await pg.click('#btnSbLoad'); await sleep(400);
  assert(await pg.locator('#sbCode').isVisible(), 'un mauvais code est refusé (la feuille reste ouverte)');
  assert((await pg.evaluate(() => window.__bip.G.sb.rows[0])) === 'R....b..', 'le jardin courant n’est pas écrasé par un mauvais code');
  await pg.keyboard.press('Escape'); await sleep(250);
  assert(await pg.locator('#sbCode').isHidden(), 'Échap ferme la feuille code');
  await shot(pg, 'v10-sandbox-390');
  await pg.goto(URL); await sleep(400);
  await pg.click('#btnAlbum'); await sleep(400);
  assert((await pg.locator('#albumGrid .stk').count()) >= 33, 'album : 21 chapitres, 5 mondes, spéciaux et machines (V10)');
  await shot(pg, 'v10-album-390');
  await pg.keyboard.press('Escape');
  await pg.click('#btnAdults'); await sleep(300);
  assert(await pg.locator('#sheet').isVisible(), 'feuille adultes');
  assert((await pg.locator('#versionNotes li').count()) >= 4 && (await pg.locator('#versionNotes').textContent()).includes('V10'), 'note de version V10 affichée dans la feuille adultes');
  const stats = await pg.locator('#statsLine').textContent();
  assert(/programme/.test(stats) && /victoire/.test(stats) && /étoile/.test(stats), 'compteurs affichés dans la feuille adultes : ' + stats);
  await shot(pg, 'v10-adults-sheet-390');
  await pg.keyboard.press('Escape');
  await pg.reload(); await sleep(500);
  assert(await pg.evaluate(() => (window.__bip.save.stars[1] || 0) > 0 && !!window.__bip.save.labs.solved['balance-1']), 'la progression survit au rechargement');
  await ctx.close();

  console.log('Paysage 1280×800');
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg2 = await ctx2.newPage();
  pg2.on('pageerror', e => errors.push('desk: ' + String(e)));
  await pg2.goto(URL); await sleep(500);
  await shot(pg2, 'v10-home-desktop');
  await pg2.evaluate(() => window.__bip.openLevel(16)); await sleep(500); await dismissStory(pg2);
  const prog = await pg2.locator('#progCard').boundingBox(), board = await pg2.locator('#board').boundingBox();
  assert(prog.x > board.x + board.width - 1, 'paysage : programme à droite du plateau');
  await shot(pg2, 'v10-level-desktop');
  await pg2.evaluate(() => window.__bip.openLevel(96)); await sleep(500); await dismissStory(pg2);
  await shot(pg2, 'v10-loupe-desktop');
  await pg2.evaluate(() => window.__bip.openLab('gears-3', false)); await sleep(500);
  await shot(pg2, 'v10-gears-desktop');
  const over = await pg2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!over, 'pas de débordement horizontal');
  await browser.close();

  if (errors.length) { console.log('\nErreurs JS :'); errors.forEach(e => console.log('  ' + e)); process.exit(1); }
  console.log('\nUI OK — captures dans .artifact/');
}
run().catch(e => { console.error(e); process.exit(1); });
