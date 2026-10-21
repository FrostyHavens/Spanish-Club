// ===== Back up and restore (grown-ups), the browser's promise to keep the data, failed saves, the problem log =====
// (docs/AUDIT_2026-10.md C4 / item 1.7, and H7 / item 1.8's log.) Her whole game (dog, album, words, history: one JSON
// value per slot, state.js) lives only in this browser's localStorage. Safari deletes a site's storage after 7 days of
// Safari use without a visit and "Clear History" wipes it; the iPad and the Windows PC hold separate games. So:
//   Back up      one file with every slot and this device's settings, a format name, a version number and the date,
//                named club-de-espanol-<names>-<YYYY-MM-DD>.json. Where the browser can share files (iPad Safari 15)
//                it opens the share sheet with the file (Save to Files, AirDrop, Mail, Messages); else it downloads it.
//                "Show as text" gives the same backup as text with a Copy button, to paste into a note or a message.
//                Started inside the tap itself (G.speech.gestureTap, like the mic): Safari only shares, or opens a
//                file picker, from a real tap.
//   Restore      a file (the picker opens inside the tap) or pasted text. Checked in full before anything changes
//                (JSON, format, version, date, every game in it reads as a game), then shown: each slot's name and
//                words met in the backup and on this device now, and the backup's date; a clear "Yes, restore".
//                The rule: the backup's three slots replace this device's three (an empty one there empties it here);
//                this device keeps its own settings (volumes, voice, buttons, mic) unless it has none yet. Before
//                anything is replaced, what's here now (each slot's exact text, the game in play as it is, the
//                settings) is kept in 'spanishclub_beforerestore', and "Undo restore" puts it back. A restore during
//                play goes back to the title. This is also how her game moves between the iPad and Windows.
//   Kept?        navigator.storage.persist() once, after the first real tap or key (where the browser has it); grown-ups
//                see "Storage: kept" or "Storage: may be cleared".
//   Saved?       G.st.saveLine() (state.js): "Saved just now" / "Not saved since 10:42 (storage full)"; after 3 failed
//                saves in a row the child sees G.saveCloud, a small grey cloud by the map's menu button (no words, nothing
//                red), gone as soon as a save works.
//   Reminder     prefs.lastBackup (per device, like the volumes). The Learning page (dashboard.js) and this screen say
//                when the last backup was, ask for one after 7 days, and say to back up before a trip or a break.
//                Nothing here ever interrupts the child's play.
//   Problem log  the errors the game caught and played on through (G.errlog, core.js): the newest first, Copy (the
//                share sheet where there is one) and Clear, like the mic test's log.
// API: G.backup.open(o) -> Wait (the screen 'Backup'), .problems() -> Wait ('ProblemLog'), .make() -> a backup object,
//   .text(b), .fileName(b), .check(text) -> {ok: false, why} | {ok: true, b, info}, .restore(b) / .undo() -> {ok, why},
//   .undoInfo(), .deliver(b) (inside a tap) -> Promise of 'shared' | 'downloaded' | 'cancelled' | 'failed',
//   .lastLine(), .overdue(), .persistLine(), .persisted, .errText(), .shareText(title, text, done, scene).
'use strict';
(function () {
  const B = G.backup = {};
  const FORMAT = 'club-de-espanol-backup', VERSION = 1;
  const PREF_KEY = 'spanishclub_prefs', UNDO_KEY = 'spanishclub_beforerestore', MIGRATED_KEY = 'spanishclub_migrated';
  const ABOUT = 'Club de Español backup: every save slot and the settings. To restore it, open the game, hold the gear (grown-ups), Back up / restore, then Restore from a file or Paste text.';
  B.FORMAT = FORMAT; B.VERSION = VERSION; B.UNDO_KEY = UNDO_KEY;
  const KEPT = () => [1, 2, 3].map(n => G.st.slotKey(n)).concat([PREF_KEY, MIGRATED_KEY]); // what a restore replaces (Undo puts back)
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const COL = { yel: '#f8e060', dim: '#a8b0d8', white: '#ffffff', good: '#80e080', warn: '#f8a040', faint: '#6870a0' };
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const clone = o => JSON.parse(JSON.stringify(o));
  const p2 = n => String(n).padStart(2, '0');
  const dateLine = ms => { const d = new Date(ms); return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + d.getHours() + ':' + p2(d.getMinutes()); };
  const stamp = ms => { const d = new Date(ms); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); };
  const ymd = ms => { const d = new Date(ms); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20);
  const fit = (s, w) => { s = String(s); if (G.textWidth(s) <= w) return s; while (s.length > 1 && G.textWidth(s + '..') > w) s = s.slice(0, -1); return s + '..'; };
  const no = why => ({ ok: false, why });
  const words = n => n + (n === 1 ? ' word' : ' words');

  // =====================================================================
  //  The backup
  // =====================================================================
  // Every slot as it is stored (the game in play as it is right now, even when its saves have been failing), this
  // device's settings, and any unreadable slot text kept by state.js (L8), so nothing of hers is left behind.
  B.make = function () {
    const playing = G.st.playing();
    if (playing) G.st.saveNow();
    const slots = {}, damaged = {};
    for (let n = 1; n <= 3; n++) {
      let s = null;
      if (playing && G.st.slot === n) { try { s = clone(playing); } catch (e) { s = null; } }
      if (!s) { const o = G.store.get(G.st.slotKey(n)); s = o && G.st.parse(clone(o)) ? o : null; }
      slots[n] = s;
      if (!s && G.st.damaged(n)) damaged[G.st.slotKey(n)] = G.store.raw(G.st.slotKey(n));
    }
    G.st.badKeys().forEach(k => { damaged[k] = G.store.raw(k); });
    const names = [1, 2, 3].map(n => slots[n] && typeof slots[n].name === 'string' ? slots[n].name : null).filter(Boolean);
    const b = { format: FORMAT, version: VERSION, date: new Date(G.now()).toISOString(), game: G.build(), from: G.speech ? G.speech.device() : '', names, about: ABOUT, slots, prefs: G.store.get(PREF_KEY) };
    if (Object.keys(damaged).length) b.damaged = damaged;
    return b;
  };
  B.text = b => JSON.stringify(b);
  B.fileName = b => 'club-de-espanol-' + (b.names || []).map(slug).filter(Boolean).concat([ymd(Date.parse(b.date))]).join('-') + '.json';
  // Out of the browser, inside the tap: the share sheet with the file where the browser can share files, else a download
  B.deliver = function (b) {
    const txt = B.text(b), name = B.fileName(b);
    let file = null;
    try { file = new File([txt], name, { type: 'application/json' }); } catch (e) { }
    try {
      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] }))
        return navigator.share({ files: [file] }).then(() => 'shared', e => (e && e.name === 'AbortError' ? 'cancelled' : B.download(txt, name)));
    } catch (e) { }
    return Promise.resolve(B.download(txt, name));
  };
  B.download = function (txt, name) {
    try {
      const url = URL.createObjectURL(new Blob([txt], { type: 'application/json' })), a = document.createElement('a');
      a.href = url; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 60000);
      return 'downloaded';
    } catch (e) { return 'failed'; }
  };
  B.backedUp = () => G.audio.setPref('lastBackup', G.now()); // (per device, in the settings)
  B.daysSince = () => { const t = G.prefs.lastBackup; return typeof t === 'number' && t > 0 ? Math.max(0, Math.floor((G.now() - t) / 864e5)) : null; };
  B.overdue = () => { const d = B.daysSince(); return d == null || d >= 7; };
  B.lastLine = () => { const d = B.daysSince(); return 'Last backup: ' + (d == null ? 'never' : d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago') + (B.overdue() ? ' - back up now' : ''); };

  // =====================================================================
  //  Checking a backup (before anything changes) and restoring it
  // =====================================================================
  B.check = function (txt) {
    if (typeof txt !== 'string' || !txt.trim()) return no('There is nothing in it.');
    if (txt.length > 20e6) return no('It is far too big to be a Club de Español backup.');
    const s = txt.replace(/^﻿/, '').trim();
    let o = null;
    try { o = JSON.parse(s); } catch (e) { const a = s.indexOf('{'), z = s.lastIndexOf('}'); if (a >= 0 && z > a) try { o = JSON.parse(s.slice(a, z + 1)); } catch (e2) { } } // (pasted with a few words around it)
    if (!isObj(o)) return no('It doesn\'t read as a backup. It may be cut short (only part of the text was copied), or be another file.');
    if (o.format !== FORMAT) return no('It isn\'t a Club de Español backup.');
    if (!Number.isInteger(o.version) || o.version < 1) return no('Its version number is missing.');
    if (o.version > VERSION) return no('It was made by a newer version of the game. Reload the game page to get the newest version, then try again.');
    const at = Date.parse(o.date); if (!isFinite(at)) return no('Its date is missing.');
    if (!isObj(o.slots)) return no('Its games are missing.');
    const slots = [], info = [];
    for (let n = 1; n <= 3; n++) {
      const g = o.slots[n];
      if (g == null) { slots.push(null); info.push(null); continue; }
      const p = isObj(g) ? G.st.parse(clone(g)) : null;
      if (!p) return no('Game ' + n + ' in it is damaged.');
      slots.push(g); info.push(G.st.summaryOf(p, n));
    }
    if (!slots.some(Boolean)) return no('It has no games in it.');
    if (o.prefs != null && !isObj(o.prefs)) return no('Its settings are damaged.');
    return { ok: true, b: { at, from: typeof o.from === 'string' ? o.from : '', slots, prefs: o.prefs || null }, info };
  };
  B.undoInfo = function () { const u = G.store.get(UNDO_KEY); return isObj(u) && isObj(u.keys) ? u : null; };
  // what's on this device now, as exact text (an unreadable slot too), with the game in play as it is right now
  function snapshot() {
    const keys = {}, playing = G.st.playing();
    KEPT().forEach(k => { keys[k] = G.store.raw(k); });
    if (playing) { try { keys[G.st.slotKey(G.st.slot)] = JSON.stringify(playing); } catch (e) { } }
    return { at: G.now(), keys };
  }
  function putBack(keys) { let ok = true; for (const k in keys) { if (keys[k] == null) G.store.del(k); else if (!G.store.setRaw(k, keys[k])) ok = false; } return ok; }
  function reloadPrefs() { // the settings as stored now (in place: modules keep G.prefs)
    const p = G.store.get(PREF_KEY) || {};
    for (const k in G.prefs) delete G.prefs[k];
    Object.assign(G.prefs, { music: 7, sfx: 7, voice: 10 }, p);
    if (G.audio.applyVolumes) G.audio.applyVolumes();
    if (G.setDpad) G.setDpad(G.prefs.dpad, true);
  }
  const full = () => (/quota/i.test(G.store.err || '') ? ' (Storage is full.)' : '');
  // b: check()'s b. Nothing changes unless it all worked. Afterwards nothing of the game in play is saved again (G.st.detach):
  // the caller goes to the title.
  B.restore = function (b) {
    const keep = snapshot(), prevUndo = G.store.raw(UNDO_KEY); // (a failed restore puts the earlier undo copy back)
    if (!G.store.setRaw(UNDO_KEY, JSON.stringify(keep))) return no('There isn\'t room on this device to keep a copy of what\'s here now, so nothing was changed.' + full());
    let ok = true;
    for (let n = 1; n <= 3 && ok; n++) { const g = b.slots[n - 1], k = G.st.slotKey(n); if (g) ok = G.store.setRaw(k, JSON.stringify(g)); else G.store.del(k); }
    if (ok) ok = G.store.setRaw(MIGRATED_KEY, '1'); // (an old pre-slot save never comes back over them)
    if (ok && b.prefs && G.store.raw(PREF_KEY) == null) ok = G.store.set(PREF_KEY, b.prefs); // (a device with no settings yet: the backup's)
    if (!ok) { const why = full(); putBack(keep.keys); G.store.del(UNDO_KEY); if (prevUndo != null) G.store.setRaw(UNDO_KEY, prevUndo); return no('The backup didn\'t fit in this browser\'s storage, so nothing was changed.' + why); }
    G.st.detach(); reloadPrefs();
    if (!(G.prefs.lastBackup >= b.at)) G.audio.setPref('lastBackup', b.at); // (this device's games are now the ones in that backup)
    return { ok: true };
  };
  B.undo = function () {
    const u = B.undoInfo(); if (!u) return no('There is nothing to undo.');
    const now = snapshot();
    if (!putBack(u.keys)) { const why = full(); putBack(now.keys); reloadPrefs(); return no('It didn\'t fit in this browser\'s storage, so nothing was changed.' + why); }
    G.st.detach(); G.store.del(UNDO_KEY); reloadPrefs();
    return { ok: true };
  };
  // a slot as the screens show it: {name, words...} (state.js summary), {damaged: true}, or null (empty)
  const slotInfo = n => G.st.summary(n) || (G.st.damaged(n) ? { damaged: true } : null);
  const undoSlots = u => [1, 2, 3].map(n => { const r = u.keys[G.st.slotKey(n)]; if (r == null) return null; let o = null; try { o = JSON.parse(r); } catch (e) { } const p = o && G.st.parse(o); return p ? G.st.summaryOf(p, n) : { damaged: true }; });
  const slotText = s => (!s ? 'empty' : s.damaged ? 'unreadable' : s.name + ', ' + words(s.words));

  // =====================================================================
  //  The browser's promise to keep this site's data (navigator.storage.persist, where there is one)
  // =====================================================================
  B.persisted = null; // true: kept; false: may be cleared; null: not known (this browser can't promise)
  try { const sm = navigator.storage; if (sm && sm.persisted) sm.persisted().then(v => { B.persisted = !!v; }, () => { }); } catch (e) { }
  const asked = { done: false }, EVS = ['pointerup', 'keydown'];
  function ask() { // once, after the first real tap or key
    if (asked.done) return; asked.done = true; EVS.forEach(t => window.removeEventListener(t, ask, true));
    try { const sm = navigator.storage; if (sm && sm.persist) sm.persist().then(v => { B.persisted = !!v; }, () => { }); } catch (e) { }
  }
  EVS.forEach(t => window.addEventListener(t, ask, true));
  B.persistLine = () => 'Storage: ' + (B.persisted ? 'kept' : 'may be cleared');

  // =====================================================================
  //  The child's sign that saves keep failing: a small grey cloud (field.js draws it by the menu button)
  // =====================================================================
  const CLOUD = ['.....oooo.......', '....owwwwo.oo...', '..oowwwwwwowwo..', '.owwwwwwwwwwwwo.', 'owwwwwwwwwwwwwwo', 'owwwwwwwwwwwwwwo', 'oggwwwwwwwwwwggo', '.oggggggggggggo.', '..oooooooooooo..'];
  G.saveCloud = function (ctx, x, y, t) { ctx.drawImage(G.sprite('savecloud', CLOUD, { o: '#4a5068', w: '#c8ccd8', g: '#a0a6b8' }), x, y + Math.round(Math.sin(t / 40))); };

  // =====================================================================
  //  Text out of the game, and a text box over it
  // =====================================================================
  function copyText(txt, ta) { // -> Promise of true when it reached the clipboard
    const byHand = () => { try { if (ta) { ta.focus(); ta.setSelectionRange(0, ta.value.length); return !!(document.execCommand && document.execCommand('copy')); } } catch (e) { } return false; };
    try { const cb = navigator.clipboard; if (cb && cb.writeText) return cb.writeText(txt).then(() => true, () => byHand()); } catch (e) { }
    return Promise.resolve(byHand());
  }
  // the share sheet (iPad: Messages, Mail, Notes, Copy...), else the clipboard, else a text box to copy from by hand.
  // Call it inside the tap. done(note) says what happened; scene.textBox(txt, why) shows the box.
  B.shareText = function (title, txt, done, scene) {
    const clip = () => copyText(txt).then(ok => (ok ? done('Copied: paste it into a message') : scene.textBox(txt, 'Select the text below and copy it.')));
    try { if (navigator.share) { navigator.share({ title, text: txt }).then(() => done('Shared'), e => { if (!(e && e.name === 'AbortError')) clip(); }); return; } } catch (e) { }
    clip();
  };
  // a real text box over the game: o = {why, text, edit, placeholder, buttons: [[label, fn(textarea, line)]], close}.
  // Keys typed there stay there (Escape closes); the game's own taps and keys wait underneath.
  function overlay(o) {
    const d = document.createElement('div'); d.id = 'backuptext';
    d.style.cssText = 'position:fixed;inset:0;z-index:20;display:flex;flex-direction:column;gap:8px;padding:12px;box-sizing:border-box;background:rgba(8,12,48,.97);color:#f0f0ff;font:15px sans-serif';
    const p = document.createElement('div'); p.textContent = o.why;
    const ta = document.createElement('textarea'); ta.value = o.text || ''; ta.readOnly = !o.edit; ta.spellcheck = false;
    if (o.placeholder) ta.placeholder = o.placeholder;
    ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocorrect', 'off'); ta.setAttribute('autocomplete', 'off');
    ta.style.cssText = 'flex:1;width:100%;box-sizing:border-box;font:12px monospace;background:#000;color:#e8e8f8;border:2px solid #8898e0;user-select:text;-webkit-user-select:text;-webkit-touch-callout:default;touch-action:auto';
    const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap';
    o.buttons.forEach(([label, fn]) => {
      const b = document.createElement('button'); b.textContent = label; b.dataset.k = label;
      b.style.cssText = 'font:bold 16px sans-serif;padding:10px 22px;border-radius:8px;border:2px solid #f0f0ff;background:#304cc0;color:#fff';
      b.addEventListener('click', () => fn(ta, p)); row.appendChild(b);
    });
    d.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') o.close(); });
    d.append(p, ta, row); document.body.appendChild(d);
    try { ta.focus(); } catch (e) { }
    return { el: d, ta, p };
  }
  function readText(f) { // a picked file's text (Blob.text where there is one)
    if (f.text) return f.text();
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsText(f); });
  }
  // a small text button (like the mic test's and the Learning page's)
  function textBtn(ctx, r, label, o = {}) {
    const on = o.sel || G.input.holding(r.x, r.y, r.w, r.h) > 0;
    ctx.globalAlpha = o.off ? 0.45 : 1;
    ctx.fillStyle = '#000010'; ctx.fillRect(r.x + 1, r.y, r.w - 2, r.h); ctx.fillRect(r.x, r.y + 1, r.w, r.h - 2);
    ctx.fillStyle = on ? '#f0d060' : (o.rim || '#8898e0'); ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    ctx.fillStyle = on ? '#304cc0' : (o.fill || '#1c2c8c'); ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, 3);
    G.textC(ctx, fit(label, r.w - 8), r.x + r.w / 2, r.y + (r.h >> 1) - 3, o.col || '#ffffff');
    ctx.globalAlpha = 1;
  }
  // the shared parts of the two screens: a note at the bottom, the text box
  const Screen = {
    notice(s, col) { this.note = s; this.noteCol = col || COL.yel; this.noteT = 240; },
    drawNote(ctx, y) {
      if (!(this.noteT > 0)) return;
      const s = fit(this.note, G.W - 30), w = G.textWidth(s) + 16;
      G.win(ctx, (G.W - w) / 2, y, w, 18, { fill1: '#1c2c6c', fill2: '#0c143c', alpha: 1 }); G.textC(ctx, s, G.W / 2, y + 5, this.noteCol);
    },
    textBox(txt, why) { this.hideHtml(); this.html = overlay({ why, text: txt, buttons: [['Done', () => this.hideHtml()]], close: () => this.hideHtml() }); },
    hideHtml() { if (this.html) { this.html.el.remove(); this.html = null; try { G.canvas.focus(); } catch (e) { } } },
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); },
  };

  // =====================================================================
  //  The screen: Back up / restore
  // =====================================================================
  const BTN = { backup: { x: 8, y: 100, w: 148, h: 24 }, text: { x: 164, y: 100, w: 148, h: 24 }, file: { x: 8, y: 130, w: 148, h: 24 }, paste: { x: 164, y: 130, w: 148, h: 24 }, undo: { x: 8, y: 160, w: 304, h: 20 } };
  const GRID = { backup: [0, 0], text: [1, 0], file: [0, 1], paste: [1, 1], undo: [0, 2] };
  const LABEL = { backup: 'Back up', text: 'Show as text', file: 'Restore from a file', paste: 'Paste text' };
  class Backup {
    constructor(w, o) {
      this.w = w; this.o = o || {}; this.t = 0; this.sel = 'backup'; this.note = ''; this.noteT = 0; this.panel = null; this.html = null;
      this.fired = null; this.lastAct = -1e9; this.pending = null; this.refresh();
      if (this.o.note) this.notice(this.o.note, COL.good);
    }
    refresh() { this.slots = [1, 2, 3].map(slotInfo); this.undo = B.undoInfo(); }
    buttons() { return ['backup', 'text', 'file', 'paste'].concat(this.undo ? ['undo'] : []); }
    rect(id) { return BTN[id]; }
    panelBtn(id) { return this.panel && this.panel.yes ? (id === 'yes' ? { x: 30, y: 180, w: 122, h: 24 } : { x: 168, y: 180, w: 122, h: 24 }) : { x: 100, y: 180, w: 120, h: 24 }; }
    onEnter() {
      G.toastT = 0;
      const free = () => G.top() === this && !this.panel && !this.html;
      this.zones = [ // inside the real tap or key press: share or download the file, open the file picker
        G.speech.gestureTap(() => (free() ? BTN.backup : null), () => { this.fired = 'backup'; this.backup(); }, { key: () => free() && this.sel === 'backup' }),
        G.speech.gestureTap(() => (free() ? BTN.file : null), () => { this.fired = 'file'; this.pickFile(); }, { key: () => free() && this.sel === 'file' }),
      ];
      const inp = this.input = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json,text/plain'; inp.id = 'restorefile';
      inp.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
      inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; inp.value = ''; if (f) this.readFile(f); });
      document.body.appendChild(inp);
    }
    onExit() { this.zones.forEach(z => z.off()); this.hideHtml(); if (this.input) { this.input.remove(); this.input = null; } }
    update() {
      this.t++; if (this.noteT > 0) this.noteT--;
      if (this.html) return; // (the text box has the keys and taps)
      if (this.pending) { const p = this.pending; this.pending = null; this.show(p); return; } // a file was read
      const fired = this.fired; this.fired = null;
      if (this.panel) { this.updPanel(); return; }
      if (G.input.p('B') || G.closeHit()) { this.close(); return; }
      const ids = this.buttons();
      if (G.input.tap()) { const id = ids.find(k => G.tapIn(BTN[k])); if (id) { this.sel = id; if (id !== fired) this.press(id); } return; }
      const d = G.input.repDir(14, 6);
      if (d) { // a grid: two columns, Undo across both
        let [c, r] = GRID[this.sel];
        if (d === 'left' || d === 'right') c = 1 - c; else r += d === 'up' ? -1 : 1;
        const k = ids.find(id => GRID[id][1] === r && (GRID[id][0] === c || id === 'undo'));
        if (k && k !== this.sel) { this.sel = k; G.audio.sfx('cursor'); }
      }
      if (G.input.p('A') && this.sel !== fired) { // (the on-screen A button: not inside a tap, so iPad Safari won't open the share sheet or the file picker)
        if (G.touch && (this.sel === 'file' || this.sel === 'backup')) { G.audio.sfx('cursor'); this.notice('Tap the button itself', COL.dim); }
        else this.press(this.sel);
      }
    }
    press(id) {
      if (id === 'backup') this.backup();
      else if (id === 'text') this.showText();
      else if (id === 'file') this.pickFile();
      else if (id === 'paste') this.pasteBox();
      else if (id === 'undo' && this.undo) { G.audio.sfx('cursor'); this.panel = { kind: 'undo', u: this.undo, now: undoSlots(this.undo), yes: () => this.doUndo(), i: 1 }; }
    }
    once() { const now = performance.now(); if (now - this.lastAct < 600) return false; this.lastAct = now; return true; }
    make() { try { return B.make(); } catch (e) { G.oops(e, 'backup'); this.notice('Could not make the backup', COL.warn); return null; } }
    backup() { // inside the tap when possible
      if (!this.once()) return;
      const b = this.make(); if (!b) return;
      this.notice('Making the backup...', COL.dim);
      B.deliver(b).then(how => {
        if (how === 'shared' || how === 'downloaded') { B.backedUp(); G.audio.sfx('ok'); this.notice(how === 'shared' ? 'Backup shared: keep it somewhere safe' : 'Saved as ' + B.fileName(b), COL.good); }
        else if (how === 'cancelled') this.notice('Not backed up (the share sheet was closed)', COL.dim);
        else this.notice('Could not save the file: try Show as text', COL.warn);
      }, e => { G.oops(e, 'backup'); this.notice('Could not save the file: try Show as text', COL.warn); });
    }
    showText() {
      const b = this.make(); if (!b) return;
      const txt = B.text(b);
      G.audio.sfx('ok');
      this.html = overlay({
        why: 'The backup as text (' + Math.max(1, Math.round(txt.length / 1024)) + ' KB). Copy it into a note or a message and keep it. To restore it: Back up / restore, Paste text.',
        text: txt, close: () => this.hideHtml(),
        buttons: [['Copy', (ta, p) => copyText(txt, ta).then(ok => { p.textContent = ok ? 'Copied. Paste it into a note or a message, and keep it.' : 'Select all the text and copy it.'; if (ok) B.backedUp(); })], ['Done', () => this.hideHtml()]],
      });
    }
    pickFile() { // inside the tap when possible (Safari only opens the picker from a real tap)
      if (!this.once() || !this.input) return;
      try { this.input.click(); } catch (e) { G.oops(e, 'restore'); }
    }
    readFile(f) {
      if (f.size > 20e6) { this.pending = no('It is far too big to be a Club de Español backup.'); return; }
      this.notice('Reading ' + f.name + '...', COL.dim);
      readText(f).then(t => { this.pending = B.check(t); }, () => { this.pending = no('The file could not be read.'); });
    }
    pasteBox() {
      G.audio.sfx('ok');
      const cb = navigator.clipboard && navigator.clipboard.readText ? [['Paste', ta => navigator.clipboard.readText().then(t => { ta.value = t; }, () => { })]] : [];
      this.html = overlay({
        why: 'Paste the backup text here (touch and hold, then Paste), then Restore. Nothing changes before you say yes.', edit: true,
        placeholder: '{"format":"club-de-espanol-backup", ...}', close: () => this.hideHtml(),
        buttons: cb.concat([['Restore', ta => { const v = ta.value; this.hideHtml(); this.show(B.check(v)); }], ['Cancel', () => this.hideHtml()]]),
      });
    }
    show(res) { // a checked backup: ask; or why it can't be restored
      this.refresh();
      if (!res.ok) { G.audio.sfx('error'); this.panel = { kind: 'refuse', why: res.why, i: 0 }; return; }
      G.audio.sfx('ok'); this.panel = { kind: 'restore', res, yes: () => this.doRestore(res), i: 1 }; // (Cancel is picked first)
    }
    doRestore(res) {
      const r = B.restore(res.b); this.panel = null;
      if (!r.ok) { this.show(r); return; }
      G.audio.sfx('ok'); after('Restored the backup of ' + dateLine(res.b.at) + '. Pick a game on the title.');
    }
    doUndo() {
      const r = B.undo(); this.panel = null;
      if (!r.ok) { this.show(r); return; }
      G.audio.sfx('ok'); after('Undone: the games from before the restore are back.');
    }
    updPanel() {
      const P = this.panel, ids = P.yes ? ['yes', 'no'] : ['no'];
      if (G.input.p('B')) { this.panel = null; G.audio.sfx('cancel'); return; }
      const d = G.input.repDir(14, 6);
      if ((d === 'left' || d === 'right') && ids.length > 1) { P.i = 1 - P.i; G.audio.sfx('cursor'); }
      let k = null;
      if (G.input.tap()) k = ids.find(id => G.tapIn(this.panelBtn(id)));
      else if (G.input.p('A')) k = ids[Math.min(P.i, ids.length - 1)];
      if (k === 'yes') P.yes();
      else if (k === 'no') { this.panel = null; G.audio.sfx('cancel'); }
    }

    draw(ctx) {
      G.win(ctx, 0, 0, G.W, G.H, { alpha: 1 });
      G.text(ctx, 'BACK UP / RESTORE', 8, 7, COL.yel); G.text(ctx, 'for grown-ups', 8 + G.textWidth('BACK UP / RESTORE') + 8, 7, COL.dim);
      G.closeBtn(ctx);
      const sl = G.st.saveLine(), od = B.overdue();
      G.text(ctx, fit(sl ? sl + '.' : 'On the title: no game is open.', 300), 8, 24, !sl ? COL.dim : G.st.status.fails ? COL.warn : COL.good);
      G.text(ctx, fit(B.persistLine() + (B.persisted ? ' (the browser promised to keep it).' : ' (Safari: after 7 days unused).'), 300), 8, 35, B.persisted ? COL.white : COL.dim);
      G.text(ctx, B.lastLine() + '.', 8, 46, od ? COL.yel : COL.white);
      G.text(ctx, 'Going on a trip or a break? Back up first.', 8, 57, COL.dim);
      this.slots.forEach((s, k) => {
        const x = 8 + k * 104, y = 70, cur = G.st.slot === k + 1;
        G.win(ctx, x, y, 96, 24, { fill1: '#202a78', fill2: '#121a50', alpha: 1 });
        G.text(ctx, String(k + 1), x + 6, y + 8, COL.dim);
        if (!s) G.text(ctx, 'empty', x + 18, y + 8, COL.faint);
        else if (s.damaged) { G.text(ctx, 'unreadable', x + 18, y + 4, COL.warn); G.text(ctx, '(in backups)', x + 18, y + 13, COL.dim); }
        else { G.text(ctx, fit(s.name, 72), x + 18, y + 4, cur ? COL.yel : COL.white); G.text(ctx, words(s.words), x + 18, y + 13, COL.dim); }
      });
      const kb = !G.touch;
      ['backup', 'text', 'file', 'paste'].forEach(id => textBtn(ctx, BTN[id], LABEL[id], { sel: kb && this.sel === id && !this.panel, fill: id === 'backup' ? '#2a7a3a' : null, rim: id === 'backup' ? '#a8e8b0' : null }));
      if (this.undo) textBtn(ctx, BTN.undo, 'Undo the restore of ' + G.st.when(this.undo.at), { sel: kb && this.sel === 'undo' && !this.panel, fill: '#24308a' });
      G.text(ctx, 'To move her game: Back up here, then Restore on the', 8, 184, COL.dim);
      G.text(ctx, 'other device (the iPad or the computer).', 8, 193, COL.dim);
      if (this.panel) this.drawPanel(ctx); else this.drawNote(ctx, 203);
    }
    drawPanel(ctx) {
      const P = this.panel, kb = !G.touch;
      ctx.fillStyle = 'rgba(0,0,16,0.6)'; ctx.fillRect(0, 0, G.W, G.H);
      G.win(ctx, 10, 12, 300, 200, { alpha: 1 });
      const btns = (yes, nope) => {
        if (P.yes) textBtn(ctx, this.panelBtn('yes'), yes, { sel: kb && P.i === 0, fill: '#2a7a3a', rim: '#a8e8b0' });
        textBtn(ctx, this.panelBtn('no'), nope, { sel: kb && (P.i === 1 || !P.yes) });
      };
      const wrap = (s, y, col, n) => G.wrap(s, 280).slice(0, n || 4).forEach((l, i) => G.text(ctx, l, 20, y + i * 10, col));
      if (P.kind === 'refuse') {
        G.text(ctx, 'CAN\'T RESTORE THIS', 20, 22, COL.warn);
        wrap(P.why, 40, COL.white, 6);
        G.text(ctx, 'Nothing was changed.', 20, 110, COL.good);
        btns('', 'OK');
        return;
      }
      const table = (A, Bs, ha, hb) => {
        G.text(ctx, ha, 70, 54, COL.dim); G.text(ctx, hb, 190, 54, COL.dim);
        for (let n = 0; n < 3; n++) {
          const y = 66 + n * 13;
          G.text(ctx, 'Slot ' + (n + 1), 20, y, COL.dim);
          G.text(ctx, fit(slotText(A[n]), 114), 70, y, A[n] ? (A[n].damaged ? COL.warn : COL.white) : COL.faint);
          G.text(ctx, fit(slotText(Bs[n]), 110), 190, y, Bs[n] ? (Bs[n].damaged ? COL.warn : COL.white) : COL.faint);
        }
      };
      if (P.kind === 'restore') {
        const b = P.res.b;
        G.text(ctx, 'RESTORE THIS BACKUP?', 20, 22, COL.yel);
        G.text(ctx, fit('Made ' + dateLine(b.at) + (b.from ? ' on ' + b.from : ''), 280), 20, 36, COL.white);
        table(P.res.info, this.slots, 'In the backup', 'On this device now');
        wrap('The backup\'s games replace all three slots on this device. What\'s here now is kept: Undo restore puts it back.', 112, COL.dim, 3);
        if (G.st.slot) G.text(ctx, 'The game being played closes (back to the title).', 20, 146, COL.dim);
        btns('Yes, restore', 'Cancel');
        return;
      }
      // undo
      G.text(ctx, 'UNDO THE RESTORE?', 20, 22, COL.yel);
      wrap('Puts back what was on this device before the restore of ' + G.st.when(P.u.at) + '.', 34, COL.white, 2);
      table(P.now, this.slots, 'Put back', 'On this device now');
      wrap('Anything played since that restore is lost (make a backup first to keep it).', 112, COL.warn, 3);
      btns('Yes, undo', 'Cancel');
    }
  }
  Object.assign(Backup.prototype, Screen);
  // a restore or its undo replaced the slots: back to the title (nothing of the old game is saved again), this screen on top
  function after(note) { G.toTitle(); B.open({ note }); }
  B.open = function (o) { const w = new G.Wait(); G.push(new Backup(w, o)); return w; };

  // =====================================================================
  //  The problem log (G.errlog, core.js)
  // =====================================================================
  B.errText = function () {
    const a = G.errlog.list().reverse(), L = ['Club de Español problem log: ' + a.length + (a.length === 1 ? ' problem' : ' problems') + ' (copied ' + stamp(Date.now()) + ')',
      'Build: ' + G.build() + ' | Device: ' + (G.speech ? G.speech.device() : '?'), 'Browser: ' + navigator.userAgent, ''];
    a.forEach((e, i) => {
      L.push('#' + (i + 1) + ' ' + stamp(e.at) + (e.n > 1 ? ' (x' + e.n + ', last ' + stamp(e.last) + ')' : '') + ' | ' + e.where + ' | screen ' + (e.scene || '-') + ' | map ' + (e.map || '-') + (e.build && e.build !== G.build() ? ' | build ' + e.build : ''));
      L.push('   ' + e.msg);
      (e.stack || []).forEach(s => L.push('     ' + s));
    });
    return L.join('\n');
  };
  class ProblemLog {
    constructor(w) { this.w = w; this.t = 0; this.note = ''; this.noteT = 0; this.clearT = 0; this.sel = 0; this.lastAct = -1e9; this.html = null; }
    onEnter() { G.toastT = 0; this.zone = G.speech.gestureTap(() => (G.top() === this && !this.html ? this.copyRect() : null), () => { this.fired = true; this.copy(); }, { key: () => G.top() === this && !this.html && this.sel === 0 }); }
    onExit() { this.zone.off(); this.hideHtml(); }
    copyRect() { return { x: 8, y: 202, w: 66, h: 18 }; }
    clearRect() { return { x: 78, y: 202, w: 52, h: 18 }; }
    update() {
      this.t++; if (this.noteT > 0) this.noteT--; if (this.clearT > 0) this.clearT--;
      if (this.html) return;
      const fired = this.fired; this.fired = false;
      if (G.input.p('B') || G.closeHit()) { this.close(); return; }
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { this.sel = 1 - this.sel; G.audio.sfx('cursor'); }
      if (G.tapIn(this.copyRect()) || (G.input.p('A') && this.sel === 0)) { if (!fired) this.copy(); return; }
      if (G.tapIn(this.clearRect()) || (G.input.p('A') && this.sel === 1)) {
        if (this.clearT > 0) { G.errlog.clear(); this.clearT = 0; this.notice('Log cleared'); G.audio.sfx('ok'); }
        else { this.clearT = 150; G.audio.sfx('cursor'); }
      }
    }
    copy() {
      const now = performance.now(); if (now - this.lastAct < 500) return; this.lastAct = now;
      const n = G.errlog.list().length; if (!n) { this.notice('Nothing to copy: no problems'); G.audio.sfx('error'); return; }
      B.shareText('Club de Español problem log', B.errText(), s => { this.notice(s); G.audio.sfx('ok'); }, this);
    }
    draw(ctx) {
      G.win(ctx, 0, 0, G.W, G.H, { alpha: 1 });
      G.text(ctx, 'PROBLEM LOG', 8, 7, COL.yel); G.text(ctx, 'for grown-ups', 8 + G.textWidth('PROBLEM LOG') + 8, 7, COL.dim);
      G.closeBtn(ctx);
      const a = G.errlog.list().reverse();
      G.text(ctx, 'Errors the game caught and got past (the last 20).', 8, 20, COL.dim);
      if (!a.length) G.textC(ctx, 'None. Nothing has gone wrong.', G.W / 2, 90, COL.good);
      a.slice(0, 7).forEach((e, k) => {
        const y = 33 + k * 23;
        ctx.fillStyle = k % 2 ? 'rgba(136,152,224,0.08)' : 'rgba(136,152,224,0.16)'; ctx.fillRect(6, y - 2, G.W - 12, 22);
        G.text(ctx, fit(stamp(e.at).slice(5, 16) + '  ' + e.where + '  ' + (e.scene || '-') + (e.map ? ' / ' + e.map : '') + (e.n > 1 ? '  x' + e.n : ''), 300), 10, y, COL.dim);
        G.text(ctx, fit(e.msg, 300), 10, y + 10, COL.white);
      });
      if (a.length > 7) G.text(ctx, '+ ' + (a.length - 7) + ' more (all of them are in the copy)', 10, 193, COL.dim);
      const kb = !G.touch;
      textBtn(ctx, this.copyRect(), navigator.share ? 'Share' : 'Copy', { sel: kb && this.sel === 0 });
      textBtn(ctx, this.clearRect(), this.clearT > 0 ? 'Sure?' : 'Clear', { sel: kb && this.sel === 1, fill: this.clearT > 0 ? '#902838' : null });
      if (this.noteT > 0) G.text(ctx, fit(this.note, 170), 138, 208, COL.yel);
      else G.textR(ctx, 'build ' + G.build(), G.W - 8, 208, COL.faint);
    }
  }
  Object.assign(ProblemLog.prototype, Screen);
  B.problems = function () { const w = new G.Wait(); G.push(new ProblemLog(w)); return w; };
})();
