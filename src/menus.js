// ===== Field menu (Cuaderno, Misiones, and the grown-ups' gear), the grown-ups menu, press-and-hold buttons =====
'use strict';
(function () {
  const D = () => G.data, S = () => G.st;
  const STAR = '\u0005';

  // ---------- Press-and-hold buttons for grown-ups (the gear, the slot screen's trash can) ----------
  // A finger held on the button, or A held while it has the keyboard focus, fills a ring; a full ring fires once,
  // and the finger or key has to be let go before it can fire again. A quick tap only makes it wiggle.
  G.Hold = class {
    constructor(frames) { this.frames = frames; this.p = 0; this.armed = true; this.poke = 0; }
    update(r, focused) { // r: the hit rect -> true on the frame the ring fills
      if (this.poke > 0) this.poke--;
      if (G.tapIn(r)) { this.poke = 40; G.audio.sfx('cursor'); }
      const f = Math.max(G.input.holding(r.x, r.y, r.w, r.h), focused ? G.input.keyHeld('A') : 0);
      if (!f) this.armed = true;
      this.p = this.armed ? Math.min(1, f / this.frames) : 0;
      if (this.p < 1) return false;
      this.armed = false; this.p = 0; return true;
    }
    wiggle() { return this.poke ? Math.round(Math.sin(this.poke * 0.8) * 2 * this.poke / 40) : 0; }
  };
  // the ring around a held button (filled clockwise from the top), or a faint one after a quick tap
  G.drawHold = function (ctx, h, cx, cy, r, col = '#f8e060') {
    if (!h.p && h.poke < 20) return;
    const n = Math.round(r * 1.4);
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (k + 0.5) / n * Math.PI * 2, x = Math.round(cx + Math.cos(a) * r) - 1, y = Math.round(cy + Math.sin(a) * r) - 1;
      ctx.fillStyle = '#10102a'; ctx.fillRect(x - 1, y - 1, 4, 4);
      ctx.fillStyle = (k + 1) / n <= h.p ? col : '#6070b0'; ctx.fillRect(x, y, 2, 2);
    }
  };

  // ---------- The kid's menu (B, or the notebook button on the map) ----------
  G.fieldMenu = function* (field) {
    while (true) {
      const r = yield G.kidMenu();
      if (r.result === 'book') yield G.notebook();
      else if (r.result === 'quest') yield G.questLog();
      else if (r.result === 'album') yield G.album();
      else return;
    }
  };
  // Three big picture buttons, Cuaderno, Misiones and the animal album (a paw, Round B), plus a small gear that opens
  // the grown-ups menu only after a 2 s press-and-hold (keyboard: move onto it and hold Z). Resolves 'book', 'quest',
  // 'album' or null.
  const KIDS = ['book', 'quest', 'album', 'gear'], TILES = ['book', 'quest', 'album'];
  const KID_LABEL = { book: 'Cuaderno', quest: 'Misiones', album: 'Animales' };
  class FieldMenu {
    constructor(w) { this.transparent = true; this.w = w; this.t = 0; this.sel = 'book'; this.gear = new G.Hold(120); }
    // tap areas (shared with draw): the 'book', 'quest' and 'album' tiles, the 'gear' (and its padded hold area), close
    box() { return { x: 22, y: 46, w: 276, h: 132 }; }
    rect(k) {
      const b = this.box();
      if (k === 'gear') return { x: b.x + b.w - 32, y: b.y + b.h - 28, w: 24, h: 20 };
      return { x: b.x + 14 + TILES.indexOf(k) * 86, y: b.y + 14, w: 76, h: 82 };
    }
    gearHit() { const r = this.rect('gear'); return { x: r.x - 4, y: r.y - 4, w: r.w + 8, h: r.h + 8 }; }
    closeXY() { return [G.W - 26, 6]; } // where the map's menu button was
    pick(k) { G.audio.sfx('ok'); G.pop(); this.w.resolve(k); }
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); }
    update() {
      this.t++;
      if (this.gear.update(this.gearHit(), this.sel === 'gear')) { G.audio.sfx('ok'); G.grownUps(); return; }
      if (G.input.tap()) {
        if (G.closeHit(...this.closeXY())) { this.close(); return; }
        for (const k of TILES) if (G.tapIn(this.rect(k))) { this.sel = k; this.pick(k); return; }
      }
      const d = G.input.repDir(14, 6);
      if (d) {
        const i = KIDS.indexOf(this.sel), n = d === 'down' ? 3 : d === 'up' ? (i === 3 ? 2 : i) : (i + (d === 'left' ? 3 : 1)) % 4;
        if (n !== i) { this.sel = KIDS[n]; G.audio.sfx('cursor'); }
      }
      if (G.input.p('A') && this.sel !== 'gear') this.pick(this.sel);
      else if (G.input.p('B')) this.close();
    }
    draw(ctx) {
      const b = this.box();
      G.win(ctx, b.x, b.y, b.w, b.h);
      TILES.forEach(k => {
        const r = this.rect(k), sel = this.sel === k, bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        G.win(ctx, r.x, r.y - bob, r.w, r.h, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : { alpha: 0.55 });
        const big = G.cached('kidbtn_' + k + (sel ? 1 : 0), 24, 20, c => G.drawIcon(c, k, 0, 0, sel));
        ctx.drawImage(big, r.x + (r.w - 48) / 2, r.y + 10 - bob, 48, 40);
        G.textC(ctx, KID_LABEL[k], r.x + r.w / 2, r.y + 62 - bob, sel ? '#f8e060' : '#ffffff');
        if (k === 'album' && G.state && G.animals) { const n = G.animals.list().filter(G.animals.met).length; G.textC(ctx, n + '/' + G.animals.list().length, r.x + r.w / 2, r.y + 72 - bob, '#a8d8ff'); }
        if (sel && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 9 - bob, '#f8e060');
      });
      const g = this.rect('gear');
      G.drawIcon(ctx, 'gear', g.x + this.gear.wiggle(), g.y, this.sel === 'gear');
      G.drawHold(ctx, this.gear, g.x + 12, g.y + 10, 15);
      G.closeBtn(ctx, ...this.closeXY());
    }
  }
  G.kidMenu = function () { const w = new G.Wait(); G.push(new FieldMenu(w)); return w; };

  // ---------- Cuaderno: one page per topic, found around town ----------
  class Notebook {
    constructor(w, start) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.pi = Math.max(0, D().pageOrder.indexOf(start)); this.wi = 0; }
    page() { return D().pageOrder[this.pi]; }
    words() { return D().pages[this.page()].words; }
    // tap areas (shared with draw): word k on the page, the < > page buttons around the page dots, close
    cellRect(k) { return { x: 18 + (k % 3) * 96, y: 34 + Math.floor(k / 3) * 58, w: 92, h: 56 }; }
    prevXY() { return [G.W / 2 - 82, 4]; } // the page dots sit between these (14 pages since Round B)
    nextXY() { return [G.W / 2 + 62, 4]; }
    closeXY() { return [G.W - 30, 8]; }
    turn(dx) { this.pi = (this.pi + dx + D().pageOrder.length) % D().pageOrder.length; this.wi = 0; G.audio.sfx('select'); }
    update() {
      this.t++;
      const d = G.input.repDir(14, 5), found = S().hasPage(this.page()), n = this.words().length;
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
      if (G.btnHit(...this.prevXY())) { this.turn(-1); return; }
      if (G.btnHit(...this.nextXY())) { this.turn(1); return; }
      if (found) for (let k = 0; k < n; k++) if (G.tapIn(this.cellRect(k))) { // tap a word: hear it
        if (this.wi !== k) G.audio.sfx('cursor');
        this.wi = k; if (S().seen(this.words()[k])) G.speak(G.baseForm(this.words()[k]));
      }
      // left/right moves within the page's 3-column grid, and past its edge turns the page
      if (d === 'left' || d === 'right') {
        const col = this.wi % 3, dx = d === 'left' ? -1 : 1;
        if (found && col + dx >= 0 && col + dx < 3 && this.wi + dx < n) { this.wi += dx; G.audio.sfx('cursor'); }
        else { this.turn(dx); return; }
      }
      if (found && (d === 'up' || d === 'down')) { const k = this.wi + (d === 'up' ? -3 : 3); if (k >= 0 && k < n) { this.wi = k; G.audio.sfx('cursor'); } }
      if (found && (G.input.p('A') || G.input.p('C'))) { const id = this.words()[this.wi]; if (S().seen(id)) G.speak(G.baseForm(id)); }
    }
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      const pid = this.page(), found = S().hasPage(pid);
      G.iconBtn(ctx, 'back', ...this.prevXY()); G.iconBtn(ctx, 'next', ...this.nextXY()); G.closeBtn(ctx, ...this.closeXY());
      // page dots
      const n = D().pageOrder.length, step = Math.min(14, Math.floor(118 / n)), dw = Math.max(5, step - 3);
      D().pageOrder.forEach((p, k) => {
        const x = Math.round(G.W / 2 - (n * step - (step - dw)) / 2 + k * step);
        ctx.fillStyle = k === this.pi ? '#a05020' : S().hasPage(p) ? '#c8a070' : '#e8dcc0';
        ctx.fillRect(x, 11, dw, 6); ctx.fillStyle = '#7a4a20'; ctx.fillRect(x, 17, dw, 1);
      });
      if (!found) {
        ctx.globalAlpha = 0.35; G.drawIcon16(ctx, 'pagina', G.W / 2 - 24, 64, 3); ctx.globalAlpha = 1;
        G.bigText(ctx, '?', G.W / 2, 140, 3, '#a08060', null);
        return;
      }
      const tp = D().topics[D().pages[pid].topic];
      G.textC(ctx, tp.name, G.W / 2, 24, '#a05020', null);
      if (G.enVisible()) G.text(ctx, tp.en, 16, 24, '#a09070', null);
      this.words().forEach((id, k) => {
        const R = this.cellRect(k), cx = R.x + 4, cy = R.y + 2, sel = k === this.wi;
        const wd = D().words[id], seen = S().seen(id), kn = S().knows(id);
        if (sel) { ctx.fillStyle = '#f8e0a0'; ctx.fillRect(cx - 4, cy - 2, 92, 56); }
        G.drawIcon16(ctx, wd, cx + 26, cy, 2);
        if (seen) G.textC(ctx, wd.es.split(' / ')[0], cx + 42, cy + 35, kn ? '#a06008' : '#2860a8', null);
        else G.textC(ctx, '? ? ?', cx + 42, cy + 35, '#b8a888', null);
        if (G.enVisible()) G.textC(ctx, wd.en, cx + 42, cy + 45, '#a09070', null);
        else if (kn) { const st = S().wordStars(id); for (let s = 0; s < 3; s++) G.text(ctx, STAR, cx + 30 + s * 8, cy + 45, s < st ? '#e0a010' : '#d8ccb0', null); }
        if (seen && S().saidCount(id)) { // said out loud (the mic): a little mic with a sound wave
          G.mic.glyph(ctx, cx + 72, cy + 2, '#2a8a9a');
          ctx.fillStyle = '#2a8a9a'; ctx.fillRect(cx + 81, cy + 2, 1, 1); ctx.fillRect(cx + 82, cy + 3, 1, 3); ctx.fillRect(cx + 81, cy + 6, 1, 1);
        }
      });
    }
  }
  G.notebook = function (start) { const w = new G.Wait(); G.push(new Notebook(w, start)); return w; };

  // ---------- Misiones: who asked, and what they want (pictures only) ----------
  // Up to four rows: the errands going on (their steps ticked off, errands.js parts()), then new ones waiting (the
  // giver with a "!"); then what's in the bag, today's side jobs (ticked when done) and a badge for every errand.
  class QuestLog {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (G.input.p('A') || G.input.p('B') || G.input.tap()) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); } } // a tap anywhere closes
    rows() {
      const E = G.errands, act = D().questOrder.filter(id => S().active(id));
      const fresh = E ? D().questOrder.filter(id => E.offer && E.offer(id)) : [];
      const done = D().questOrder.filter(id => S().done(id) && D().badgeOrder.indexOf(id) < 0 && id !== 'fiesta');
      return act.map(id => ({ id, st: 'on' })).concat(fresh.map(id => ({ id, st: 'new' }))).concat(done.map(id => ({ id, st: 'done' }))).slice(0, 4);
    }
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12);
      G.closeBtn(ctx, G.W - 30, 8);
      G.drawIcon(ctx, 'quest', G.W / 2 - 12, 8);
      const rows = this.rows(), E = G.errands;
      if (!rows.length) G.bigText(ctx, '?', G.W / 2, 70, 3, '#404878');
      rows.forEach((r, k) => {
        const q = D().quests[r.id], y = 32 + k * 26;
        ctx.fillStyle = r.st === 'new' ? '#1a2a60' : '#0a1040'; ctx.fillRect(14, y - 2, G.W - 28, 24);
        ctx.drawImage(G.unitSprite(D().npcs[q.giver].map, 'down', (this.t >> 5) & 1), 18, y - 2);
        if (r.st === 'new') { G.win(ctx, 36, y - 4, 11, 13, { fill1: '#f8f0c0', fill2: '#f8d860', alpha: 1 }); G.text(ctx, '!', 40, y - 1, '#c02020', null); }
        G.drawIcon16(ctx, 'flecha', 48, y + 3);
        const parts = r.st === 'on' && E && E.parts ? E.parts(r.id) : null;
        if (parts) parts.forEach((p, i) => {
          const px = 70 + i * 20;
          ctx.globalAlpha = p.done ? 0.55 : 1; G.drawIcon16(ctx, p.icon, px, y + 3); ctx.globalAlpha = 1;
          if (p.done) { ctx.fillStyle = '#10301a'; ctx.fillRect(px + 8, y + 11, 9, 9); ctx.fillStyle = '#50d060'; ctx.fillRect(px + 9, y + 15, 2, 2); ctx.fillRect(px + 11, y + 16, 2, 2); ctx.fillRect(px + 13, y + 12, 2, 4); ctx.fillRect(px + 12, y + 14, 2, 2); }
        });
        else { ctx.globalAlpha = r.st === 'new' ? 0.7 : 1; G.drawGoal(ctx, q.goal, 70, y + 3); ctx.globalAlpha = 1; }
        if (r.st === 'done') G.drawIcon16(ctx, 'si', G.W - 36, y + 3);
        if (G.enVisible()) G.textR(ctx, q.en.length > 34 ? q.en.slice(0, 33) + '..' : q.en, G.W - 18, y + 14, '#f8e8b0');
      });
      // the bag
      const bag = E ? E.bag.list() : [], yb = 138;
      G.drawIcon16(ctx, 'bolsa', 18, yb);
      if (!bag.length) G.text(ctx, '-', 42, yb + 5, '#404878');
      bag.forEach((it, i) => G.drawIcon16(ctx, E.bag.icon(it), 40 + i * 18, yb));
      // today's side jobs
      if (E && S().done('saludos')) {
        const yj = 160;
        G.drawIcon16(ctx, 'sol', 18, yj);
        E.JOBS.forEach((j, i) => {
          const done = E.jobDone(j), px = 40 + i * 22;
          ctx.globalAlpha = done ? 1 : 0.4; G.drawIcon16(ctx, E.JOB_ICON[j], px, yj); ctx.globalAlpha = 1;
          if (done) G.text(ctx, '\u0005', px + 11, yj - 2, '#f8d040', '#5a2c04');
        });
      }
      // a badge for every errand
      const ids = D().badgeOrder.concat(S().done('fiesta') ? ['fiesta'] : []), per = Math.min(24, Math.floor((G.W - 36) / ids.length)), x0 = G.W / 2 - (ids.length * per) / 2 + (per - 16) / 2;
      ids.forEach((id, k) => {
        const x = x0 + k * per, yy = G.H - 34;
        if (S().done(id)) G.drawBadge(ctx, id, x, yy, this.t + k * 18);
        else { ctx.fillStyle = '#0a1040'; ctx.beginPath(); ctx.arc(x + 8, yy + 8, 10, 0, Math.PI * 2); ctx.fill(); G.textC(ctx, '?', x + 8, yy + 4, '#404878'); }
      });
    }
  }
  G.questLog = function () { const w = new G.Wait(); G.push(new QuestLog(w)); return w; };

  // ---------- Grown-ups menu (behind the held gear; English labels) ----------
  // Volumes, voice, English help, on-screen buttons, speaking (the kids' mic), microphone test, controls, back to
  // title. Nothing to save by hand: volumes, the voice, English help, the D-pad and speaking are kept per device
  // (G.prefs), and the game saves itself.
  // Up/down picks a row, left/right moves a volume, A changes the others; tap a row, tap or drag along a volume bar.
  const ROW_H = 17, BAR = 168, CELL = 12; // volume bars: 10 cells from x = BAR; the speaker just left of it = 0
  class GrownUps {
    constructor(w, o) { this.transparent = true; this.w = w; this.o = o || {}; this.t = 0; this.i = 0; this.drag = null; this.tick = 0; }
    rows() {
      const voices = G.spanishVoices(), cur = G.currentVoice(), mic = typeof G.micTest === 'function';
      const R = [
        { id: 'music', label: 'Music', vol: 'music', help: 'Music volume (0 = off).' },
        { id: 'sfx', label: 'Sounds', vol: 'sfx', help: 'Sound effects volume (0 = off).' },
        { id: 'voice', label: 'Voice', vol: 'voice', help: voiceLine() },
        { id: 'pick', label: 'Choose voice', right: voices.length ? (voiceIndex(voices, cur) + 1) + ' / ' + voices.length : 'none found', off: !voices.length, help: voiceLine() },
        { id: 'english', label: 'English help', on: G.enVisible(), help: 'Shows English under the Spanish (for grown-ups).' },
        { id: 'dpad', label: 'On-screen buttons', on: !!G.prefs.dpad, help: 'Arrows and A B C on the screen. Taps work without.' },
        G.speech.supported() ? { id: 'speak', label: 'Speaking (mic)', on: G.prefs.mic !== false && !G.mic.blocked, help: G.mic.blocked ? 'The mic was blocked. Try the Microphone test.' : 'Say answers out loud for bonus stars. Taps always work.' }
          : { id: 'speak', label: 'Speaking (mic)', right: 'not available', off: true, help: 'No speech recognition here. iPad: Safari + Dictation on.' },
        { id: 'mic', label: 'Microphone test', right: mic ? '>' : 'not available', off: !mic, help: mic ? 'Does speech recognition hear Spanish words?' : 'The microphone test is not in this version.' },
        { id: 'help', label: 'Controls and tips', right: '>', help: 'The keys, and how the game teaches.' },
      ];
      if (!this.o.title) R.push({ id: 'title', label: 'Back to title', right: '>', help: 'Progress is saved automatically.' });
      return R;
    }
    // tap areas (shared with draw): row k, its volume bar (with the speaker = 0 and the number), close
    rowRect(k) { return { x: 10, y: 30 + k * ROW_H, w: G.W - 20, h: ROW_H }; }
    barRect(k) { const r = this.rowRect(k); return { x: BAR - 18, y: r.y, w: r.x + r.w - (BAR - 18), h: r.h }; }
    level(x) { return x < BAR ? 0 : Math.min(10, Math.floor((x - BAR) / CELL) + 1); }
    closeXY() { return [G.W - 30, 8]; }
    vol(kind, v, sample) { const b = G.prefs[kind]; G.audio.setVolume(kind, v); const ch = G.prefs[kind] !== b; if (ch && sample) this.sample(kind); return ch; }
    sample(kind) { if (kind === 'sfx') G.audio.sfx('coin'); else if (kind === 'voice') G.speak('¡Hola!'); }
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); }
    update() {
      this.t++;
      const rows = this.rows();
      if (this.i >= rows.length) this.i = rows.length - 1;
      // a finger on a volume bar sets it as it slides (sounds as it changes; the voice speaks when let go)
      const dk = rows.findIndex((r, k) => { const b = this.barRect(k); return r.vol && G.input.holding(b.x, b.y, b.w, b.h); });
      if (dk >= 0) {
        const kind = rows[dk].vol; this.i = dk;
        if (this.vol(kind, this.level(G.input.ptr.x), false)) { this.drag = kind; if (kind === 'sfx' && this.t - this.tick > 5) { this.tick = this.t; this.sample('sfx'); } }
      } else if (this.drag) { if (this.drag === 'voice') this.sample('voice'); this.drag = null; }
      const tap = G.input.tap();
      if (tap) {
        if (G.closeHit(...this.closeXY())) { this.close(); return; }
        const k = rows.findIndex((r, n) => G.tapIn(this.rowRect(n)));
        if (k >= 0 && k !== this.i) { this.i = k; G.audio.sfx('cursor'); }
        if (k >= 0 && rows[k].vol) { if (tap.x >= BAR - 18) this.vol(rows[k].vol, this.level(tap.x), true); }
        else if (k >= 0) { this.act(rows[k]); return; }
      }
      const d = G.input.repDir(14, 5), r = rows[this.i];
      if (d === 'up' || d === 'down') { this.i = (this.i + (d === 'up' ? -1 : 1) + rows.length) % rows.length; G.audio.sfx('cursor'); }
      if (r.vol && (d === 'left' || d === 'right')) this.vol(r.vol, G.prefs[r.vol] + (d === 'left' ? -1 : 1), true);
      if (G.input.p('A') && !r.vol) this.act(r);
      else if (G.input.p('B')) this.close();
    }
    act(r) { // A or a tap on a row
      if (r.id === 'pick') {
        const voices = G.spanishVoices(), cur = G.currentVoice();
        if (!voices.length) { G.audio.sfx('error'); return; }
        const name = voices[(voiceIndex(voices, cur) + 1) % voices.length].name;
        G.state.opts.voiceName = name; G.audio.setPref('voiceName', name); G.voiceMode = 0;
        if (!G.prefs.voice) G.audio.setVolume('voice', 7);
        G.speak('¡Hola! Hoy es tu primer día en el Club de Español.'); S().autosave();
      } else if (r.id === 'english') {
        const on = !G.state.opts.english; G.state.opts.english = on; G.audio.setPref('english', on); G.audio.sfx('ok'); S().autosave();
      } else if (r.id === 'dpad') { G.setDpad(!G.prefs.dpad); G.audio.sfx('ok'); }
      else if (r.id === 'speak') {
        if (r.off) { G.audio.sfx('error'); return; }
        G.audio.setPref('mic', !r.on); G.mic.blocked = false; G.audio.sfx('ok');
      }
      else if (r.id === 'mic') {
        if (r.off) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok'); try { G.micTest(); } catch (e) { console.warn(e); }
      } else if (r.id === 'help') { G.audio.sfx('ok'); G.controlsHelp(); }
      else if (r.id === 'title') { G.audio.sfx('ok'); G.toTitle(); }
    }
    draw(ctx) {
      const rows = this.rows();
      G.win(ctx, 6, 6, G.W - 12, G.H - 12);
      G.text(ctx, 'GROWN-UPS', 16, 14, '#f8e060');
      G.textR(ctx, 'Progress saves by itself', G.W - 40, 14, '#8890c0');
      G.closeBtn(ctx, ...this.closeXY());
      rows.forEach((r, k) => {
        const R = this.rowRect(k), y = R.y + 5, sel = k === this.i, col = r.off ? '#7078a0' : sel ? '#f8e060' : '#ffffff', xr = R.x + R.w - 4;
        if (sel) { ctx.fillStyle = 'rgba(248,224,96,0.13)'; ctx.fillRect(R.x + 2, R.y + 1, R.w - 4, R.h - 2); }
        else { ctx.fillStyle = 'rgba(136,152,224,0.22)'; ctx.fillRect(R.x + 14, R.y + R.h - 1, R.w - 28, 1); }
        if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', R.x + 4, y, '#f8e060');
        G.text(ctx, r.label, R.x + 14, y, col);
        if (r.vol) {
          const v = G.prefs[r.vol];
          volIcon(ctx, r.vol === 'sfx' ? 'sound' : r.vol, BAR - 15, R.y + 4, !v);
          for (let s = 0; s < 10; s++) { const h = 3 + s; ctx.fillStyle = s < v ? (sel ? '#f8d030' : '#c8d0f0') : '#303a78'; ctx.fillRect(BAR + s * CELL + 1, R.y + 15 - h, CELL - 2, h); }
          G.textR(ctx, String(v), xr, y, v ? '#ffffff' : '#7078a0');
        } else if (r.on != null) { // a switch
          const sx = xr - 26, sy = R.y + 3;
          ctx.fillStyle = '#000010'; ctx.fillRect(sx - 1, sy - 1, 28, 13);
          ctx.fillStyle = r.on ? '#40a848' : '#404870'; ctx.fillRect(sx, sy, 26, 11);
          ctx.fillStyle = '#f0f0ff'; ctx.fillRect(r.on ? sx + 15 : sx + 1, sy + 1, 10, 9);
          G.textR(ctx, r.on ? 'On' : 'Off', sx - 5, y, r.on ? '#80e080' : '#a8b0d8');
        } else G.textR(ctx, r.right, xr, y, col);
      });
      let h = rows[this.i].help || '';
      while (h.length > 3 && G.textWidth(h) > G.W - 32) h = h.slice(0, -3) + '..';
      G.text(ctx, h, 16, 206, '#a8b0d8');
    }
  }
  G.grownUps = function (o) { const w = new G.Wait(); G.push(new GrownUps(w, o)); return w; };
  // which voice is speaking, or why not (helps track down speech problems on a device)
  function voiceLine() {
    if (!window.speechSynthesis) return 'Voice: not available in this browser';
    const v = G.currentVoice(), st = G.voiceStatus, mode = G.voiceMode || 0, nv = G.spanishVoices().length;
    const who = !v ? '(no Spanish voice)' : v.name + ' (' + v.lang + ')' + (mode === 1 ? ' + pause' : mode === 2 ? ' > backup voice' : '');
    return 'Voice: ' + who + ' [' + nv + ']' + (st && st !== 'ok' ? ' ! ' + st : '');
  }
  // browsers may hand back new voice objects on each call, so match by name
  const voiceIndex = (voices, cur) => cur ? voices.findIndex(v => v.name === cur.name) : -1;
  // tiny speaker / note icons for the volume rows (crossed out at 0)
  function volIcon(ctx, kind, x, y, off) {
    ctx.fillStyle = off ? '#7078a0' : '#f8e060';
    if (kind === 'music') { ctx.fillRect(x + 6, y, 1, 7); ctx.fillRect(x + 7, y, 3, 1); ctx.fillRect(x + 9, y, 1, 6); ctx.fillRect(x + 4, y + 6, 3, 2); ctx.fillRect(x + 7, y + 5, 3, 2); }
    else { ctx.fillRect(x + 1, y + 2, 2, 4); ctx.fillRect(x + 3, y + 1, 1, 6); ctx.fillRect(x + 4, y, 1, 8); if (kind === 'voice') { ctx.fillRect(x + 7, y + 2, 1, 4); ctx.fillRect(x + 9, y + 1, 1, 6); } else { ctx.fillRect(x + 7, y + 3, 1, 2); } }
    if (off) { ctx.fillStyle = '#e04040'; for (let i = 0; i < 9; i++) ctx.fillRect(x + i, y + 8 - i, 1, 1); }
  }
})();
