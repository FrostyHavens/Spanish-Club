// Back up and restore (src/backup.js, docs/AUDIT_2026-10.md C4 / 1.7, L8): the backup file's shape and name; the share
// sheet (stubbed navigator.share / canShare, inside the tap) or a download; Show as text and Copy; a restore into a
// fresh page (a file picked on the keyboard, Windows-style) gives back the same games; a corrupt or wrong backup is
// refused and changes nothing; Undo restore; a restore during play; failing saves ("Not saved since", the child's
// grey cloud after 3, gone after a good save); the Learning page's reminder; persist(); an unreadable slot kept (L8).
//   NODE_PATH=$(npm root -g) node tools/test-backup.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

const GIRL = { gender: 'nina', skin: '#a87050', style: 'braid', hair: '#201010', outfit: '#8a50c8' };
const SAVE = (name, extra) => Object.assign({
  flags: { intro: true }, searched: {}, playTime: 60, loc: { map: 'casa', x: 4, y: 4, dir: 'down' },
  words: { hola: { learned: true, right: 1, wrong: 0 }, adios: { learned: false, right: 0, wrong: 0 } },
  pages: { saludos: true }, quests: { c1: 'done', c2: 'done' }, ch: { v: 2 }, stars: 1, opts: { english: false }, look: GIRL, name, savedAt: 1000,
}, extra || {});
const LUZ = () => SAVE('Luz', { dogName: 'Pancho', stars: 37, album: { perro: { first: 5, map: 'villa', n: 3 } }, hearts: { mama: 2 }, words: { hola: { learned: true, right: 3, wrong: 0, said: 2 }, gracias: { learned: true, right: 2, wrong: 1 }, perro: { learned: true, right: 1, wrong: 0 } } });

// ---------- helpers ----------
const scene = (g, name, what) => g.until(n => G.top() && G.top().constructor.name === n, name, what || name);
const keys = g => g.ev(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^spanishclub_/.test(k)) o[k] = localStorage.getItem(k); } return o; });
async function reload(g) {
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after a reload');
}
async function seed(g, slots, prefs) {
  await g.ev(([s, p]) => { localStorage.setItem('spanishclub_migrated', '1'); for (const n in s) localStorage.setItem('spanishclub_slot' + n, typeof s[n] === 'string' ? s[n] : JSON.stringify(s[n])); if (p) localStorage.setItem('spanishclub_prefs', JSON.stringify(p)); }, [slots, prefs || null]);
  await reload(g);
}
async function play(g, k) { // the title, the slot screen, card k
  if (g.touch) await g.tap(160, 180); else await g.press('Enter');
  await scene(g, 'Slots');
  await g.tapRect(await g.ev(k => G.top().cardRect(k), k));
  await g.fieldIdle('casa');
}
const btn = (g, id) => g.ev(id => G.top().rect(id), id);
const panelBtn = (g, id) => g.ev(id => G.top().panelBtn(id), id);
const strings = g => g.ev(() => { const seen = [], t = G.text; G.text = function (ctx, s, ...r) { seen.push(String(s)); return t.call(this, ctx, s, ...r); }; try { G.drawFrame(); } finally { G.text = t; } return seen; }); // what one frame writes
// file pickers the page opens, caught by one listener for the whole page (a waitForEvent per picker can miss one: the
// interception is switched on again a moment too late). next() -> a Promise of the next picker.
function choosers(page) {
  const q = [], waiting = [];
  page.on('filechooser', fc => { const w = waiting.shift(); if (w) w(fc); else q.push(fc); });
  return () => (q.length ? Promise.resolve(q.shift()) : new Promise((res, rej) => { waiting.push(res); setTimeout(() => rej(new Error('no file picker opened')), 5000); }));
}

// ---------- 1. the backup on the iPad: one file, through the share sheet, inside the tap ----------
async function shareSheet(browser) {
  const { ctx, g } = await open(browser, 'backup-share', true);
  try {
    await seed(g, { 1: LUZ(), 2: SAVE('Sofía') }, { music: 4, sfx: 7, voice: 10, english: true });
    await play(g, 0);
    await g.ev(() => {
      G.state.flags.unsaved = 1; // (changed after the last save: the backup takes the game in play as it is)
      window.__shared = []; window.__dl = [];
      Object.defineProperty(navigator, 'canShare', { configurable: true, writable: true, value: d => !!(d && d.files && d.files.length) });
      Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: d => { window.__shared.push({ d, during: window.event ? window.event.type : '' }); return Promise.resolve(); } });
      HTMLAnchorElement.prototype.click = function () { window.__dl.push(this.download); };
      G.grownUps();
    });
    await scene(g, 'GrownUps');
    const row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'backup'); return { k, r: s.rows()[k], rect: s.rowRect(k), first: s.rowRect(0), last: s.rowRect(s.rows().length - 1), n: s.rows().length, close: s.closeXY() }; });
    check('backup: the grown-ups menu has Back up / restore and the Problem log, all rows fit (the close button clear of the first)', row.k >= 0 && row.r.right === 'no backup yet' && row.last.y + row.last.h <= 204 && row.n === 14 && row.close[1] + 20 <= row.first.y + (row.first.h >> 1) - 3, JSON.stringify(row));
    await g.frames(4); await g.shot('grownups');
    await g.tapRect(row.rect);
    await scene(g, 'Backup', 'the Back up / restore screen');
    await g.frames(4); await g.shot('backup_screen');
    const shown = await strings(g);
    check('backup: the screen says it is saving, the last backup (never: back up now) and to back up before a trip', shown.includes('Saved just now.') && shown.some(s => /^Last backup: never - back up now/.test(s)) && shown.includes('Going on a trip or a break? Back up first.') && shown.some(s => /^Storage: may be cleared/.test(s)), shown.join(' | '));
    await g.tapRect(await btn(g, 'backup'));
    await g.until(() => window.__shared.length === 1, null, 'the share sheet', 3000);
    const sh = await g.ev(async () => { const s = window.__shared[0], f = s.d.files[0]; return { during: s.during, n: s.d.files.length, name: f.name, type: f.type, text: await f.text(), keys: Object.keys(s.d), dl: window.__dl.length }; });
    check('backup: Back up opens the share sheet with one file, inside the tap', sh.n === 1 && sh.during === 'touchend' && sh.keys.join() === 'files' && sh.dl === 0, JSON.stringify({ during: sh.during, keys: sh.keys, dl: sh.dl }));
    check('backup: the file is named club-de-espanol-<names>-<date>.json', /^club-de-espanol-luz-sofia-\d{4}-\d\d-\d\d\.json$/.test(sh.name) && sh.type === 'application/json', sh.name);
    const b = JSON.parse(sh.text);
    check('backup: format, version, date, the build, where it was made', b.format === 'club-de-espanol-backup' && b.version === 1 && !isNaN(Date.parse(b.date)) && typeof b.game === 'string' && /iPad|Android|Linux|Mac|Windows/.test(b.from) && b.names.join() === 'Luz,Sofía' && /Restore/.test(b.about), JSON.stringify(Object.assign({}, b, { slots: '...' })));
    check('backup: every slot (the empty one too) and the settings', b.slots[1].name === 'Luz' && b.slots[1].dogName === 'Pancho' && b.slots[1].album.perro.n === 3 && b.slots[2].name === 'Sofía' && b.slots[3] === null && b.prefs.music === 4 && b.prefs.english === true);
    check('backup: the game in play as it is right now', b.slots[1].flags.unsaved === 1 && b.slots[1].stars === 37);
    check('backup: the last backup is remembered on the device (in the settings)', await g.ev(() => G.prefs.lastBackup > 0 && JSON.parse(localStorage.getItem('spanishclub_prefs')).lastBackup === G.prefs.lastBackup && G.backup.lastLine() === 'Last backup: today' && !G.backup.overdue()));
    check('backup: ...and the screen says so', await g.until(() => G.top().noteT > 0 && /shared/.test(G.top().note), null, 'the note', 3000).then(() => true));
    // the share sheet closed without sharing: nothing remembered; another error: a download instead
    await g.ev(() => { G.audio.setPref('lastBackup', 0); navigator.share = () => Promise.reject(new DOMException('closed', 'AbortError')); });
    check('backup: the share sheet closed: not backed up, nothing downloaded', await g.ev(async () => (await G.backup.deliver(G.backup.make())) === 'cancelled' && window.__dl.length === 0 && !G.prefs.lastBackup));
    await g.ev(() => { navigator.share = () => Promise.reject(new DOMException('no', 'NotAllowedError')); });
    check('backup: the share sheet refused: a download instead', await g.ev(async () => (await G.backup.deliver(G.backup.make())) === 'downloaded' && window.__dl.length === 1 && /^club-de-espanol-luz-sofia-/.test(window.__dl[0])));
    // the reminder: 9 days later
    await g.ev(() => { G.audio.setPref('lastBackup', G.now() - 9 * 864e5 - 1000); });
    check('backup: 9 days on, the reminder asks for one', await g.ev(() => G.backup.lastLine() === 'Last backup: 9 days ago - back up now' && G.backup.overdue()));
    await g.tapBtn([294, 6]); await scene(g, 'GrownUps');
    check('backup: the menu row says how old the backup is', await g.ev(() => { const r = G.top().rows().find(r => r.id === 'backup'); return r.right === 'last backup 9 days ago' && r.rcol && /Saved just now\. Last backup: 9 days ago - back up now/.test(r.help); }));
    await g.ev(() => { G.top().close(); G.dashboard.open(); });
    await scene(g, 'LearningDash');
    await g.frames(4); await g.shot('learning_reminder');
    const dash = await strings(g);
    check('backup: the Learning page says it is saving, the last backup, back up now, and before a trip', dash.includes('Saved just now.') && dash.includes('Last backup: 9 days ago - back up now.') && dash.includes('Going on a trip or a break? Back up first.') && dash.includes('Back up'), dash.join(' | '));
    await g.tapRect(await g.ev(() => G.top().backupRect()));
    await scene(g, 'Backup', 'Back up / restore from the Learning page');
    await g.tapBtn([294, 6]);
    await scene(g, 'LearningDash');
    check('backup: ...its Back up button opens Back up / restore, and closing it comes back', true);
    check('backup (iPad): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 2. the desktop: a download (no file sharing), by the keyboard; Show as text and Copy ----------
let BACKUP = null, LUZ_STORED = null; // (a backup made here, restored into a fresh page below)
async function download(browser) {
  const { ctx, g } = await open(browser, 'backup-download', false);
  try {
    await seed(g, { 1: LUZ(), 3: SAVE('Nico') }, { music: 6, sfx: 7, voice: 10 });
    await play(g, 0);
    await g.ev(() => { G.st.learn('perro'); G.state.dogName = 'Pancho'; G.st.saveNow(); });
    await g.ev(() => {
      window.__shared = []; window.__dl = []; window.__clip = null;
      Object.defineProperty(navigator, 'canShare', { configurable: true, writable: true, value: () => false }); // (Chrome can't share a .json file)
      Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: d => { window.__shared.push(d); return Promise.resolve(); } });
      HTMLAnchorElement.prototype.click = function () { window.__dl.push({ name: this.download, href: this.href, during: window.event ? window.event.type : '' }); };
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__clip = t; return Promise.resolve(); } } });
      G.backup.open();
    });
    await scene(g, 'Backup');
    await g.frames(30);
    await g.press('Enter'); // (Back up is picked first)
    await g.until(() => window.__dl.length === 1, null, 'the download', 3000);
    const dl = await g.ev(async () => { const d = window.__dl[0]; return { name: d.name, during: d.during, text: await (await fetch(d.href)).text(), shared: window.__shared.length }; });
    check('download: no file sharing here: Back up downloads the file (Z / Enter, inside the key press)', dl.shared === 0 && /^club-de-espanol-luz-nico-\d{4}-\d\d-\d\d\.json$/.test(dl.name) && dl.during === 'keydown', JSON.stringify({ name: dl.name, during: dl.during, shared: dl.shared }));
    BACKUP = dl.text; LUZ_STORED = await g.ev(() => localStorage.getItem('spanishclub_slot1')); // (the backup saved the game first)
    check('download: the file reads back as a backup of both games', await g.ev(t => { const r = G.backup.check(t); return r.ok && r.info[0].name === 'Luz' && r.info[1] === null && r.info[2].name === 'Nico'; }, BACKUP));
    check('download: remembered as backed up', await g.ev(() => G.prefs.lastBackup > 0));
    await g.press('ArrowRight'); await g.press('Enter'); // Show as text
    await g.until(() => !!document.getElementById('backuptext'), null, 'the text box');
    await g.shot('show_as_text');
    const txt = await g.ev(() => document.querySelector('#backuptext textarea').value);
    check('text: Show as text shows the whole backup, readable as one', await g.ev(t => G.backup.check(t).ok, txt) && JSON.parse(txt).slots[1].name === 'Luz');
    await g.ev(() => { G.audio.setPref('lastBackup', 0); });
    await g.page.click('#backuptext button[data-k="Copy"]');
    await g.until(() => window.__clip != null, null, 'the copy', 3000);
    check('text: Copy puts it on the clipboard and says so', await g.ev(t => window.__clip === t && /Copied/.test(document.querySelector('#backuptext div').textContent) && G.prefs.lastBackup > 0, txt));
    await g.page.keyboard.press('KeyX'); await g.frames(3);
    check('text: keys typed in the text box stay there (the screen stays open)', await g.ev(() => G.top().constructor.name === 'Backup' && !!G.top().html));
    await g.page.click('#backuptext button[data-k="Done"]'); await g.frames(3);
    check('text: Done closes it', await g.ev(() => !document.getElementById('backuptext') && !G.top().html));
    check('download (desktop): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 3. a fresh page (another computer): restore from a file, the same games come back ----------
async function restoreFresh(browser) {
  const { ctx, g } = await open(browser, 'backup-restore', false);
  try {
    const picker = choosers(g.page);
    check('restore: a fresh page has no games', await g.ev(() => !G.st.anySave()));
    await g.ev(() => G.grownUps({ title: true }));
    await scene(g, 'GrownUps');
    check('restore: Back up / restore and the Problem log are in the menu on the title too', await g.ev(() => { const ids = G.top().rows().map(r => r.id); return ids.includes('backup') && ids.includes('problems') && ids.length === 11; }));
    for (let n = 0; n < 20 && await g.ev(() => G.top().rows()[G.top().i].id !== 'backup'); n++) await g.press('ArrowDown');
    await g.press('Enter');
    await scene(g, 'Backup');
    await g.frames(30);
    await g.press('ArrowDown'); // Restore from a file
    const fcP = picker(); await g.press('Enter'); const fc = await fcP;
    check('restore: Restore from a file opens a file picker (inside the key press), for .json and text', await g.ev(() => document.getElementById('restorefile').accept === '.json,application/json,text/plain'));
    await fc.setFiles({ name: 'club-de-espanol-luz-nico.json', mimeType: 'application/json', buffer: Buffer.from(BACKUP) });
    await g.until(() => G.top().panel && G.top().panel.kind === 'restore', null, 'the restore question', 5000);
    await g.frames(4); await g.shot('restore_ask');
    const ask = await strings(g);
    check('restore: it shows what is in it (names, words, the date) against this device, and asks', ask.includes('RESTORE THIS BACKUP?') && ask.some(s => /^Made [A-Z][a-z]{2} \d+, \d{4} \d+:\d\d/.test(s)) && ask.some(s => /^Luz, \d+ words$/.test(s)) && ask.some(s => /^Nico, \d+ words?$/.test(s)) && ask.filter(s => s === 'empty').length >= 4 && ask.includes('Yes, restore') && ask.includes('Cancel'), ask.join(' | '));
    check('restore: nothing has changed yet', await g.ev(() => !localStorage.getItem('spanishclub_slot1') && !localStorage.getItem('spanishclub_beforerestore')));
    await g.press('Enter'); // (Cancel is picked first)
    check('restore: Cancel first: nothing changes', await g.ev(() => !G.top().panel && !localStorage.getItem('spanishclub_slot1')));
    await g.frames(40);
    const fc2P = picker(); await g.press('Enter'); const fc2 = await fc2P;
    await fc2.setFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(BACKUP) });
    await g.until(() => G.top().panel && G.top().panel.kind === 'restore', null, 'the restore question again', 5000);
    await g.press('ArrowLeft'); await g.press('Enter'); // Yes, restore
    await g.until(() => G.scenes.length === 2 && G.scenes[0].constructor.name === 'Title' && G.top().constructor.name === 'Backup' && /Restored/.test(G.top().note), null, 'the title with the screen over it', 5000);
    await g.frames(4); await g.shot('restored');
    const b = JSON.parse(BACKUP);
    const after = await keys(g);
    check('restore: every slot is the backup\'s (the empty one stays empty)', JSON.stringify(JSON.parse(after.spanishclub_slot1)) === JSON.stringify(b.slots[1]) && after.spanishclub_slot1 === LUZ_STORED && JSON.parse(after.spanishclub_slot3).name === 'Nico' && !after.spanishclub_slot2);
    check('restore: a device with no settings takes the backup\'s; the last backup is its date', await g.ev(d => G.prefs.music === 6 && G.prefs.lastBackup === Date.parse(d), b.date));
    check('restore: what was here before is kept for Undo', JSON.parse(after.spanishclub_beforerestore).keys.spanishclub_slot1 === null && await g.ev(() => G.top().buttons().includes('undo')));
    await g.press('Escape');
    await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await play(g, 0);
    const st = await g.ev(() => ({ name: G.state.name, dog: G.dogName(), stars: G.state.stars, perro: G.words.stage('perro'), gracias: G.words.met('gracias'), album: G.state.album.perro && G.state.album.perro.n, look: G.state.look.style }));
    check('restore: the game opens as it was (name, dog, stars, words, album, look)', st.name === 'Luz' && st.dog === 'Pancho' && st.stars >= 37 && st.perro >= 3 && st.gracias && st.album === 3 && st.look === 'braid', JSON.stringify(st));
    check('restore (desktop): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 4. a corrupt or wrong backup is refused, and nothing changes ----------
async function refused(browser) {
  const { ctx, g } = await open(browser, 'backup-refused', true);
  try {
    await seed(g, { 1: SAVE('Win') }, { music: 3, sfx: 7, voice: 10 });
    const before = await keys(g);
    const b = JSON.parse(BACKUP);
    const bad = {
      'empty': '', 'cut short': BACKUP.slice(0, Math.floor(BACKUP.length / 2)), 'not JSON': 'hello', 'another JSON file': JSON.stringify({ name: 'x', list: [1, 2] }),
      'wrong format': JSON.stringify(Object.assign({}, b, { format: 'other-game' })), 'no version': JSON.stringify(Object.assign({}, b, { version: undefined })),
      'a newer version': JSON.stringify(Object.assign({}, b, { version: 99 })), 'no date': JSON.stringify(Object.assign({}, b, { date: 'soon' })),
      'a damaged game': JSON.stringify(Object.assign({}, b, { slots: { 1: b.slots[1], 2: 'oops', 3: null } })), 'no games': JSON.stringify(Object.assign({}, b, { slots: { 1: null, 2: null, 3: null } })),
      'damaged settings': JSON.stringify(Object.assign({}, b, { prefs: [1] })),
    };
    const res = await g.ev(bad => { const o = {}; for (const k in bad) o[k] = G.backup.check(bad[k]); return o; }, bad);
    check('refused: every wrong or damaged backup is refused, with a reason', Object.keys(res).every(k => res[k].ok === false && res[k].why.length > 10), JSON.stringify(res));
    check('refused: a newer version says to reload', /newer version/.test(res['a newer version'].why) && /Reload/.test(res['a newer version'].why));
    check('refused: ...but a backup pasted with a few words around it is fine', await g.ev(t => G.backup.check('Here it is:\n' + t + '\nbye').ok && G.backup.check('﻿' + t).ok, BACKUP));
    // through the screen: a file that isn't a backup, then cut-short pasted text
    await g.ev(() => G.backup.open());
    await scene(g, 'Backup');
    const picker = choosers(g.page), fileBtn = await btn(g, 'file'), fcP = picker();
    await g.tapRect(fileBtn); const fc = await fcP;
    await fc.setFiles({ name: 'photo.json', mimeType: 'application/json', buffer: Buffer.from('\x89PNG not a backup') });
    await g.until(() => G.top().panel && G.top().panel.kind === 'refuse', null, 'the refusal', 5000);
    await g.frames(4); await g.shot('refused_file');
    const shown = await strings(g);
    check('refused: the screen says why and that nothing was changed', shown.includes('CAN\'T RESTORE THIS') && shown.includes('Nothing was changed.'), shown.join(' | '));
    await g.tapRect(await panelBtn(g, 'no'));
    await g.tapRect(await btn(g, 'paste'));
    await g.until(() => !!document.querySelector('#backuptext textarea'), null, 'the paste box');
    await g.page.fill('#backuptext textarea', BACKUP.slice(0, 2000));
    await g.page.click('#backuptext button[data-k="Restore"]');
    await g.until(() => G.top().panel && G.top().panel.kind === 'refuse', null, 'the refusal of cut-short text', 5000);
    check('refused: cut-short pasted text is refused too', await g.ev(() => /cut short/.test(G.top().panel.why)));
    check('refused: nothing changed on the device', JSON.stringify(await keys(g)) === JSON.stringify(before));
    check('refused (iPad): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 5. a restore during play (the Windows game replaced), then Undo restore ----------
async function undo(browser) {
  const { ctx, g } = await open(browser, 'backup-undo', true);
  try {
    await seed(g, { 1: SAVE('Win'), 2: '{oops' }, { music: 3, sfx: 7, voice: 10, dpad: false });
    await play(g, 0);
    await g.ev(() => { G.state.flags.unsaved = 1; G.backup.open(); }); // (played on, not saved yet)
    await scene(g, 'Backup');
    await g.tapRect(await btn(g, 'paste'));
    await g.until(() => !!document.querySelector('#backuptext textarea'), null, 'the paste box');
    await g.page.fill('#backuptext textarea', BACKUP);
    await g.page.click('#backuptext button[data-k="Restore"]');
    await g.until(() => G.top().panel && G.top().panel.kind === 'restore', null, 'the restore question', 5000);
    const ask = await strings(g);
    check('undo: the question shows the game being played and the unreadable slot here', ask.some(s => /^Win, \d+ words?$/.test(s)) && ask.includes('unreadable') && ask.includes('The game being played closes (back to the title).'), ask.join(' | '));
    await g.tapRect(await panelBtn(g, 'yes'));
    await g.until(() => G.scenes[0].constructor.name === 'Title' && G.top().constructor.name === 'Backup' && G.st.slot === null, null, 'the title', 5000);
    check('undo: the restore replaced the slots and went back to the title', await g.ev(() => JSON.parse(localStorage.getItem('spanishclub_slot1')).name === 'Luz' && !localStorage.getItem('spanishclub_slot2') && JSON.parse(localStorage.getItem('spanishclub_slot3')).name === 'Nico'));
    check('undo: this device kept its own settings', await g.ev(() => G.prefs.music === 3 && JSON.parse(localStorage.getItem('spanishclub_prefs')).music === 3));
    await g.frames(80);
    check('undo: the old game is never saved again over the restored one', await g.ev(() => { G.st.saveNow(); document.dispatchEvent(new Event('visibilitychange')); return JSON.parse(localStorage.getItem('spanishclub_slot1')).name === 'Luz'; }));
    const kept = await g.ev(() => JSON.parse(localStorage.getItem('spanishclub_beforerestore')).keys);
    check('undo: the copy kept for Undo has the game as it was being played (unsaved changes too), the unreadable slot as it was', JSON.parse(kept.spanishclub_slot1).flags.unsaved === 1 && kept.spanishclub_slot2 === '{oops' && kept.spanishclub_slot3 === null);
    await g.frames(4); await g.shot('undo_button');
    await g.tapRect(await btn(g, 'undo'));
    await g.until(() => G.top().panel && G.top().panel.kind === 'undo', null, 'the undo question');
    await g.frames(4); await g.shot('undo_ask');
    const ask2 = await strings(g);
    check('undo: it asks first, showing what comes back and what is lost', ask2.includes('UNDO THE RESTORE?') && ask2.some(s => /^Win, /.test(s)) && ask2.some(s => /^Luz, /.test(s)) && ask2.includes('Yes, undo'), ask2.join(' | '));
    await g.tapRect(await panelBtn(g, 'yes'));
    await g.until(() => G.top().constructor.name === 'Backup' && /Undone/.test(G.top().note), null, 'undone', 5000);
    const back = await keys(g);
    check('undo: everything is back as it was (the unsaved changes too); the copy is gone', JSON.parse(back.spanishclub_slot1).name === 'Win' && JSON.parse(back.spanishclub_slot1).flags.unsaved === 1 && back.spanishclub_slot2 === '{oops' && !back.spanishclub_slot3 && !back.spanishclub_beforerestore && await g.ev(() => !G.top().buttons().includes('undo')));
    check('undo (iPad): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 6. saves that fail: "Not saved since", the child's cloud after 3, gone after a good save ----------
async function failing(browser) {
  const { ctx, g } = await open(browser, 'backup-failing', true);
  try {
    await seed(g, { 1: LUZ() });
    await play(g, 0);
    await g.ev(() => { window.__cloud = 0; const f = G.saveCloud; G.saveCloud = function () { window.__cloud++; return f.apply(this, arguments); }; });
    check('failing: saving fine, no cloud', await g.ev(() => G.st.saveNow() && G.st.saveLine() === 'Saved just now' && !G.st.troubled()) && (await g.frames(10), await g.ev(() => window.__cloud === 0)));
    await g.ev(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (/^spanishclub_slot/.test(k)) throw new DOMException('full', 'QuotaExceededError'); return window.__set.call(this, k, v); }; G.state.flags.lost = 1; });
    check('failing: a failed save says "Not saved since" (storage full)', await g.ev(() => !G.st.saveNow() && /^Not saved since \d+:\d\d \(storage full\)$/.test(G.st.saveLine()) && G.st.status.fails === 1 && !G.st.troubled()), await g.ev(() => G.st.saveLine()));
    await g.ev(() => G.grownUps());
    await scene(g, 'GrownUps');
    check('failing: the grown-ups menu says NOT SAVED', await g.ev(() => { const r = G.top().rows().find(r => r.id === 'backup'); return r.right === 'NOT SAVED' && /^Not saved since/.test(r.help); }));
    await g.ev(() => { G.top().close(); G.dashboard.open(); });
    await scene(g, 'LearningDash');
    const dash = await strings(g);
    check('failing: the Learning page says "Not saved since ..."', dash.some(s => /^Not saved since \d+:\d\d \(storage full\)\.$/.test(s)), dash.join(' | '));
    await g.ev(() => G.top().close());
    await g.fieldIdle('casa');
    await g.frames(10);
    check('failing: fewer than 3 failures: no cloud yet', await g.ev(() => G.st.status.fails < 3 && !G.st.troubled() && window.__cloud === 0), await g.ev(() => G.st.status.fails));
    await g.ev(() => { while (G.st.status.fails < 2) G.st.saveNow(); });
    await g.ev(() => { G.st.autosave(); });
    await g.until(() => G.st.status.fails >= 3, null, 'the third failed save (an autosave)', 3000);
    await g.frames(10);
    check('failing: after 3 failed saves in a row the child sees the small cloud by the menu button', await g.ev(() => G.st.troubled() && window.__cloud > 0));
    await g.shot('save_cloud');
    check('failing: play goes on (no errors, the map is free)', await g.ev(() => G.top() === G.field && !G.field.locked));
    await g.ev(() => { Storage.prototype.setItem = window.__set; });
    check('failing: the next save that works clears it', await g.ev(() => G.st.saveNow() && !G.st.troubled() && G.st.saveLine() === 'Saved just now' && JSON.parse(localStorage.getItem('spanishclub_slot1')).flags.lost === 1));
    await g.frames(4);
    const c = await g.ev(() => window.__cloud); await g.frames(10);
    check('failing: ...and the cloud is gone', await g.ev(c => window.__cloud === c, c));
    check('failing (iPad): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 7. persist(), once after a real tap; an unreadable slot kept before a new game (L8) ----------
async function keepIt(browser) {
  const { ctx, g } = await open(browser, 'backup-persist', true);
  try {
    await g.page.addInitScript(() => {
      window.__persist = [];
      Object.defineProperty(navigator, 'storage', { configurable: true, value: { persisted: () => Promise.resolve(false), persist: () => { window.__persist.push(window.event ? window.event.type : ''); return Promise.resolve(true); } } });
    });
    await seed(g, { 1: SAVE('Ana'), 2: '{"words": {"hola": {' });
    check('persist: not asked before a tap; "may be cleared"', await g.ev(() => window.__persist.length === 0 && G.backup.persistLine() === 'Storage: may be cleared'));
    await g.tap(160, 180);
    await scene(g, 'Slots');
    await g.until(() => G.backup.persisted === true, null, 'the answer', 3000);
    await g.tap(160, 20); await g.tap(160, 20);
    check('persist: asked once, inside the first tap; then "Storage: kept"', await g.ev(() => window.__persist.length === 1 && /^pointerup|touchend$/.test(window.__persist[0]) && G.backup.persistLine() === 'Storage: kept'), await g.ev(() => JSON.stringify(window.__persist)));
    check('unreadable: the slot shows as empty (a child can start there)', await g.ev(() => !G.top().cards[1] && G.st.damaged(2) && !G.st.damaged(1) && !G.st.damaged(3)));
    check('unreadable: a backup carries its text', await g.ev(() => G.backup.make().damaged.spanishclub_slot2 === '{"words": {"hola": {'));
    await g.ev(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (/_bad/.test(k)) throw new DOMException('full', 'QuotaExceededError'); return window.__set.call(this, k, v); }; });
    check('unreadable: if its text can\'t be kept, the new game isn\'t written over it (a failed save)', await g.ev(() => { G.st.newGame(); G.state.name = 'Mia'; const ok = G.st.begin(2); return !ok && localStorage.getItem('spanishclub_slot2') === '{"words": {"hola": {' && G.st.status.fails === 1; }));
    await g.ev(() => { Storage.prototype.setItem = window.__set; });
    check('unreadable: once it can, its text is kept in spanishclub_slot2_bad, then the new game is saved', await g.ev(() => G.st.saveNow() && localStorage.getItem('spanishclub_slot2_bad') === '{"words": {"hola": {' && JSON.parse(localStorage.getItem('spanishclub_slot2')).name === 'Mia' && G.st.badKeys().join() === 'spanishclub_slot2_bad'));
    check('unreadable: the kept copy goes into backups too', await g.ev(() => G.backup.make().damaged.spanishclub_slot2_bad === '{"words": {"hola": {'));
    await g.ev(() => { G.st.close(); localStorage.setItem('spanishclub_slot2', 'garbage 2'); G.st.newGame(); G.state.name = 'Leo'; G.st.begin(2); G.st.close(); });
    check('unreadable: a second one doesn\'t overwrite the first copy', await g.ev(() => { const k = G.st.badKeys(); return k.length === 2 && localStorage.getItem('spanishclub_slot2_bad') === '{"words": {"hola": {' && localStorage.getItem(k[1]) === 'garbage 2'; }));
    check('persist (iPad): no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Back up and restore', [
  ['the backup through the share sheet (iPad)', shareSheet], ['a download, Show as text (desktop)', download], ['restore into a fresh page (desktop)', restoreFresh],
  ['a corrupt or wrong backup is refused (iPad)', refused], ['restore during play, then Undo (iPad)', undo], ['failing saves (iPad)', failing],
  ['persist(), an unreadable slot (iPad)', keepIt],
]);
