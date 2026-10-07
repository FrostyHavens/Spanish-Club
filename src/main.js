// ===== Boot, title screen, save slots =====
'use strict';
(function () {
  class Blank { constructor() { this.tasks = new G.Tasks(); } update() { this.tasks.update(); } draw(ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.W, G.H); } }
  const STAR = '\u0005';

  // ---------- Starting and continuing a game ----------
  // A new game in a slot: creator -> name -> home (the slot is filled once the name is chosen; backing out of
  // the creator leaves it empty).
  function newGame(slot) {
    G.st.newGame();
    const sc = new Blank(); G.replace(sc);
    sc.tasks.add((function* () {
      G.fade.a = 0;
      const r = yield G.creator();
      if (!r.result) { G.toTitle(); return; }
      G.state.look = r.result.look; G.state.name = r.result.name;
      G.st.begin(slot); // this game owns the slot from now on: saved right away, then all the time
      const f = G.goto('casa', 4, 4, 'up');
      f.locked = true; // from the start, so a quick tap or key can't reach Mamá and start her intro a second time
      f.tasks.add((function* () { yield 40; yield* G.story.mamaIntro(); f.locked = false; })());
    })());
  }
  // Continue the game in a slot, where the player was
  function cont(slot) {
    if (!G.st.loadSlot(slot)) { G.audio.sfx('error'); return false; }
    try { const l = G.state.loc; G.goto(l.map, l.x, l.y, l.dir); return true; }
    catch (e) { console.warn(e); G.st.newGame(); G.toTitle(); G.audio.sfx('error'); return false; } // a save that won't open
  }
  G.newGame = newGame; G.continueGame = cont;

  // ---------- Title: tap anywhere (or Z / Enter) to play; the gear, held 2 s, is for grown-ups ----------
  // With no saves yet a child goes straight into the character creator (slot 1); otherwise to the slot screen.
  class Title {
    constructor() { this.t = 0; this.focus = 0; this.confetti = []; this.gear = new G.Hold(120); this.logo = this.makeLogo(); }
    onEnter() { G.audio.play('title'); G.fade.a = 1; G.fadeTo(0, 0.03); }
    makeLogo() {
      // Big pixel title from the bitmap font, scaled x4 with a sunny gradient and outline
      const s1 = 'ESPANOL', s2 = 'CLUB DE';
      const w1 = G.textWidth(s1), w2 = G.textWidth(s2);
      const c = G.makeCanvas(260, 64), x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      const tmp2 = G.makeCanvas(w2 + 2, 9); G.text(tmp2.getContext('2d'), s2, 0, 0, '#ffffff', '#702010');
      x.drawImage(tmp2, Math.floor((260 - w2 * 2) / 2), 0, tmp2.width * 2, tmp2.height * 2);
      // the 7-row font has no room above capitals, so draw ESPANOL and add the tilde by hand
      const tmp = G.makeCanvas(w1 + 2, 11), tc = tmp.getContext('2d'); G.text(tc, 'ESPANOL', 0, 3, '#ffffff', null);
      const nx = G.textWidth('ESPA') + 1; tc.fillStyle = '#ffffff';
      [[1, 0], [2, 0], [0, 1], [3, 1], [4, 0]].forEach(([dx, dy]) => tc.fillRect(nx + dx, dy, 1, 1));
      const sc = 4, ox = Math.floor((260 - w1 * sc) / 2), oy = 20;
      const outl = G.tinted(tmp, '#5a1408', 'logo1');
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2], [1, 2], [2, 1]]) x.drawImage(outl, ox + dx * 2, oy + dy * 2, tmp.width * sc, tmp.height * sc);
      const fill = G.makeCanvas(tmp.width * sc, tmp.height * sc), fx = fill.getContext('2d');
      fx.imageSmoothingEnabled = false; fx.drawImage(tmp, 0, 0, fill.width, fill.height);
      fx.globalCompositeOperation = 'source-in';
      const gr = fx.createLinearGradient(0, 0, 0, fill.height);
      [['#fff8c0', 0], ['#ffd840', 0.35], ['#ff9a20', 0.65], ['#e03818', 1]].forEach(([col, p]) => gr.addColorStop(p, col));
      fx.fillStyle = gr; fx.fillRect(0, 0, fill.width, fill.height);
      fx.globalCompositeOperation = 'source-atop'; fx.fillStyle = 'rgba(255,255,255,0.45)'; fx.fillRect(0, 4, fill.width, 3);
      x.drawImage(fill, ox, oy);
      return c;
    }
    // tap areas (shared with draw): the play button (a tap anywhere else but the gear plays too), the gear
    playRect() { return { x: G.W / 2 - 52, y: 124, w: 104, h: 30 }; }
    gearXY() { return [G.W - 34, 12]; }
    gearHit() { const [x, y] = this.gearXY(); return { x: x - 4, y: y - 4, w: 32, h: 28 }; }
    update() {
      this.t++;
      if (G.r(4) === 0) this.confetti.push({ x: G.r(G.W), y: -4, vx: (G.rand() - 0.5) * 0.5, vy: 0.4 + G.rand() * 0.6, c: ['#f8e060', '#f06080', '#60c0f0', '#70e070', '#ffffff'][G.r(5)], life: 500 });
      this.confetti.forEach(e => { e.x += e.vx + Math.sin((this.t + e.life) / 25) * 0.3; e.y += e.vy; e.life--; });
      this.confetti = this.confetti.filter(e => e.life > 0 && e.y < G.H + 5);
      if (this.t < 30) return;
      if (G.input.p('M')) G.audio.toggleMute();
      if (this.gear.update(this.gearHit(), this.focus === 1)) { G.audio.sfx('ok'); G.grownUps({ title: true }); return; }
      const d = G.input.repDir(14, 6); // keyboard: up / right moves onto the gear, down / left back to play
      if (d) { const f = d === 'up' || d === 'right' ? 1 : 0; if (f !== this.focus) { this.focus = f; G.audio.sfx('cursor'); } }
      if ((G.input.tap() && !G.tapIn(this.gearHit())) || (G.input.p('A') && this.focus === 0)) this.play();
    }
    play() { G.audio.sfx('ok'); if (G.st.anySave()) G.push(new Slots()); else newGame(1); }
    draw(ctx) {
      G.drawBattleBG(ctx, 'town', this.t);
      ctx.fillStyle = 'rgba(255,200,120,0.18)'; ctx.fillRect(0, 0, G.W, G.H);
      this.confetti.forEach(e => { ctx.fillStyle = e.c; ctx.fillRect(Math.round(e.x), Math.round(e.y), 2, (this.t + e.life) % 20 < 10 ? 2 : 1); });
      const bob = Math.round(Math.sin(this.t / 40) * 2);
      ctx.drawImage(this.logo, Math.floor((G.W - 260) / 2), 24 + bob);
      if (this.t > 30) {
        const P = this.playRect(), on = this.focus === 0, s = on ? Math.round(Math.sin(this.t / 9) + 1) : 0;
        G.win(ctx, P.x - s, P.y - s, P.w + s * 2, P.h + s * 2, on ? { fill1: '#f8a838', fill2: '#d85818', alpha: 1 } : { fill1: '#907060', fill2: '#584840', alpha: 1 });
        G.bigText(ctx, '¡A jugar!', G.W / 2, P.y + 11, 2, on ? '#ffffff' : '#d8d0c8', '#6a1808');
        if (on) tapHint(ctx, P.x + P.w + 16, P.y + 15, this.t);
        const [gx, gy] = this.gearXY();
        G.drawIcon(ctx, 'gear', gx + this.gear.wiggle(), gy, this.focus === 1);
        G.drawHold(ctx, this.gear, gx + 12, gy + 10, 15);
      }
      G.textC(ctx, 'Un juego para aprender español', G.W / 2, G.H - 22, '#fff8e0');
      if (!G.touch) G.textC(ctx, 'Z: OK   X: menú   C: escuchar   M: sonido', G.W / 2, G.H - 11, '#f8e8c0');
    }
  }
  // "tap here" on a touch screen (a fingertip in a pulsing ring), else the Z key
  function tapHint(ctx, x, y, t) {
    if (G.touch && !(G.prefs && G.prefs.dpad)) {
      ctx.strokeStyle = '#fff8c0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 5 + ((t >> 3) % 3) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    } else { G.win(ctx, x - 10, y - 10, 21, 20, { fill1: '#e8e8f0', fill2: '#b8b8c8', alpha: 1 }); G.textC(ctx, 'Z', x + 1, y - 4, '#202040', null); }
  }

  // ---------- Who's playing? Three save slots ----------
  // A filled card (face, name, words learned, stars) continues that game; "+ Nuevo" starts one there.
  // Deleting is for grown-ups: hold the little trash can for 3 s (keyboard: down onto it, hold Z), then sí / no.
  const TRASH = ['...bbbb...', '.bbbbbbbb.', 'bwwwwwwwwb', '.bbbbbbbb.', '.bwgwgwgb.', '.bwgwgwgb.', '.bwgwgwgb.', '.bwgwgwgb.', '.bwgwgwgb.', '..bbbbbb..'];
  const TRASH_PAL = { b: '#202848', w: '#e0e4f4', g: '#8890b8' };
  class Slots {
    constructor() {
      this.t = 0; this.trash = false; this.holds = [0, 1, 2].map(() => new G.Hold(180)); this.refresh();
      let best = -1; this.i = 0; // start on the game played last
      this.cards.forEach((c, k) => { if (c && c.savedAt > best) { best = c.savedAt; this.i = k; } });
    }
    onEnter() { G.speak('¿Quién juega?'); }
    refresh() { this.cards = [1, 2, 3].map(n => G.st.summary(n)); }
    // tap areas (shared with draw): card k, its trash can (hold area), the back button
    cardRect(k) { return { x: 14 + k * 100, y: 40, w: 92, h: 154 }; }
    trashRect(k) { const r = this.cardRect(k); return { x: r.x + r.w - 27, y: r.y + r.h - 27, w: 24, h: 24 }; }
    backXY() { return [8, 8]; }
    update() {
      this.t++;
      if (this.asking) { // back from "¿Borrar?"
        const yes = this.asking.result === true, k = this.askK; this.asking = null;
        if (yes) { G.st.erase(k + 1); this.refresh(); this.trash = false; G.audio.sfx('door'); this.poof = { k, t: 30 }; }
        return;
      }
      if (this.poof && --this.poof.t <= 0) this.poof = null;
      for (let k = 0; k < 3; k++) if (this.cards[k] && this.holds[k].update(this.trashRect(k), this.trash && this.i === k)) {
        G.audio.sfx('error'); this.askK = k; this.asking = G.confirmErase(this.cards[k]); return;
      }
      if (G.input.tap()) {
        if (G.btnHit(...this.backXY())) { this.back(); return; }
        for (let k = 0; k < 3; k++) {
          if (this.cards[k] && G.tapIn(this.trashRect(k))) break; // the trash can only answers to a long hold
          if (G.tapIn(this.cardRect(k))) { this.i = k; this.trash = false; this.open(k); return; }
        }
      }
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { this.i = (this.i + (d === 'left' ? 2 : 1)) % 3; if (!this.cards[this.i]) this.trash = false; G.audio.sfx('cursor'); }
      if (d === 'down' && this.cards[this.i] && !this.trash) { this.trash = true; G.audio.sfx('cursor'); }
      if (d === 'up' && this.trash) { this.trash = false; G.audio.sfx('cursor'); }
      if (G.input.p('A') && !this.trash) this.open(this.i);
      else if (G.input.p('B')) this.back();
      if (G.input.p('M')) G.audio.toggleMute();
    }
    back() { G.audio.sfx('cancel'); G.pop(); }
    open(k) { G.audio.sfx('ok'); if (this.cards[k]) cont(k + 1); else newGame(k + 1); }
    draw(ctx) {
      G.drawBattleBG(ctx, 'town', this.t);
      ctx.fillStyle = 'rgba(20,24,72,0.35)'; ctx.fillRect(0, 0, G.W, G.H);
      G.bigText(ctx, '¿Quién juega?', G.W / 2, 18, 2, '#fff8e0', '#5a1408');
      G.iconBtn(ctx, 'back', ...this.backXY());
      for (let k = 0; k < 3; k++) this.card(ctx, k);
    }
    card(ctx, k) {
      const c = this.cards[k], R = this.cardRect(k), sel = k === this.i, bob = sel && !this.trash ? Math.round(Math.sin(this.t / 8) * 1.5) : 0;
      const x = R.x, y = R.y - bob, cx = x + R.w / 2;
      if (sel) { ctx.fillStyle = '#f8e060'; ctx.fillRect(x - 2, y - 2, R.w + 4, R.h + 4); }
      if (!c) {
        G.win(ctx, x, y, R.w, R.h, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { fill1: '#2a3478', fill2: '#141c50', alpha: 0.85 });
        ctx.fillStyle = sel ? '#f8e060' : '#8898e0'; ctx.fillRect(cx - 14, y + 58, 28, 6); ctx.fillRect(cx - 3, y + 47, 6, 28); // +
        G.bigText(ctx, 'Nuevo', cx, y + 100, 2, sel ? '#f8e060' : '#c8d0f0');
        if (this.poof && this.poof.k === k) for (let i = 0; i < 10; i++) { // a puff where the game was
          const a = i * 0.63, r = (30 - this.poof.t) * 1.6; ctx.fillStyle = 'rgba(232,236,248,' + (this.poof.t / 30) + ')'; ctx.fillRect(Math.round(cx + Math.cos(a) * r) - 2, Math.round(y + 60 + Math.sin(a) * r) - 2, 5, 5);
        }
        return;
      }
      G.win(ctx, x, y, R.w, R.h, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { alpha: 1 });
      const spec = G.data.playerSpec(c.look);
      ctx.fillStyle = '#000010'; ctx.fillRect(cx - 27, y + 9, 54, 54);
      G.drawPortrait(ctx, spec.portrait, cx - 26, y + 10, this.t + k * 50);
      G.textC(ctx, c.name, cx, y + 69, sel ? '#f8e060' : '#ffffff');
      // words learned (the notebook) and stars
      G.drawIcon(ctx, 'book', x + 10, y + 82); G.bigText(ctx, String(c.words), x + 56, y + 89, 2, '#ffffff');
      G.bigText(ctx, STAR, x + 22, y + 113, 2, '#f8d030'); G.bigText(ctx, String(c.stars), x + 56, y + 113, 2, '#ffffff');
      // the trash can (grown-ups: hold it)
      const T = this.trashRect(k), tx = T.x + 4 + this.holds[k].wiggle(), ty = T.y + 4 - bob, on = this.trash && sel;
      ctx.fillStyle = on ? '#f8e060' : '#000010'; ctx.fillRect(tx - 1, ty - 1, 18, 18);
      ctx.fillStyle = on ? '#304cc0' : '#1c2c8c'; ctx.fillRect(tx, ty, 16, 16);
      ctx.drawImage(G.sprite('trash', TRASH, TRASH_PAL), tx + 3, ty + 3);
      G.drawHold(ctx, this.holds[k], tx + 8, ty + 8, 13, '#f86040');
    }
  }

  // ---------- "¿Borrar?": the slot's face and name, then two picture cards (sí deletes; no is picked first) ----------
  class ConfirmErase {
    constructor(c, w) { this.transparent = true; this.c = c; this.w = w; this.t = 0; this.i = 1; }
    onEnter() { G.speak('¿Borrar?'); }
    rects() { return [0, 1].map(k => ({ x: G.W / 2 - 64 + k * 70, y: 138, w: 58, h: 54 })); } // tap areas: sí, no
    update() {
      this.t++;
      if (this.t < 10) return;
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { this.i = 1 - this.i; G.audio.sfx('cursor'); }
      let k = -1;
      if (G.input.tap()) k = this.rects().findIndex(r => G.tapIn(r));
      if (G.input.p('A')) k = this.i;
      if (G.input.p('B')) k = 1;
      if (k >= 0) { G.audio.sfx(k === 0 ? 'ok' : 'cancel'); G.pop(); this.w.resolve(k === 0); }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(0,0,16,0.55)'; ctx.fillRect(0, 0, G.W, G.H);
      G.win(ctx, 64, 18, 192, 186);
      const cx = G.W / 2, spec = G.data.playerSpec(this.c.look);
      ctx.fillStyle = '#000010'; ctx.fillRect(cx - 27, 27, 54, 54); G.drawPortrait(ctx, spec.portrait, cx - 26, 28, this.t);
      G.textC(ctx, this.c.name, cx, 88, '#f8e060');
      const tw = (G.textWidth('¿Borrar?') + 2) * 2, x0 = Math.round(cx - (tw + 26) / 2); // the trash can, then the question
      ctx.drawImage(G.sprite('trash', TRASH, TRASH_PAL), x0, 106, 20, 20);
      G.bigText(ctx, '¿Borrar?', x0 + 26 + tw / 2, 112, 2, '#ffffff');
      this.rects().forEach((r, k) => {
        const sel = k === this.i, bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        G.win(ctx, r.x, r.y - bob, r.w, r.h, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
        G.drawIcon16(ctx, k === 0 ? 'si' : 'no', r.x + r.w / 2 - 16, r.y + 11 - bob, 2, sel ? 'sel' : 'card');
        if (sel && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 9 - bob, '#f8e060');
      });
    }
  }
  G.confirmErase = function (c) { const w = new G.Wait(); G.push(new ConfirmErase(c, w)); return w; };

  // ---------- Controls and tips (from the grown-ups menu) ----------
  class Controls {
    constructor(w) { this.transparent = true; this.w = w; }
    update() { if (G.input.p('A') || G.input.p('B') || G.input.tap()) { G.audio.sfx('cancel'); G.pop(); this.w && this.w.resolve(); } } // a tap anywhere closes
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12);
      G.closeBtn(ctx, G.W - 30, 8);
      const L = [['CONTROLES  /  CONTROLS', ''], ['', ''],
        ['Flechas / WASD', 'caminar, elegir - walk, choose'], ['Z / Enter', 'hablar, OK - talk, OK'],
        ['X / Esc', 'menú, volver - menu, back'], ['C', 'escuchar otra vez - hear it again'], ['M', 'sonido - sound on/off'], ['V', 'el micrófono - say it (mic)'], ['', ''],
        ['Words start as pictures. Use a word right', ''], ['and it turns gold: you learned it!', ''],
        ['Find the notebook pages hidden in town.', ''], ['Progress saves itself. Grown-ups: hold the gear.', '']];
      L.forEach(([a, b], i) => {
        G.text(ctx, a, 20, 16 + i * 14, b || i === 0 ? '#f8e060' : (i % 2 ? '#c8d0f0' : '#ffffff'));
        if (b) G.text(ctx, b, 104, 16 + i * 14, '#ffffff');
      });
    }
  }
  G.controlsHelp = function () { const w = new G.Wait(); G.push(new Controls(w)); return w; };
  G.Title = Title;
  // back to the title: the game is saved, and nothing is saved again until a slot is picked
  G.toTitle = function () { G.st.close(); G.st.newGame(); G.audio.stop(); G.replace(new Title()); };

  // ---------- Boot ----------
  G.boot = function () {
    G.st.migrate();
    G.st.newGame();
    G.replace(new Title());
    G.start();
  };
  if (!window.NO_BOOT) G.boot();
})();
