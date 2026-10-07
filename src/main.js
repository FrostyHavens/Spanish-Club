// ===== Boot & title screen =====
'use strict';
(function () {
  class Blank { constructor() { this.tasks = new G.Tasks(); } update() { this.tasks.update(); } draw(ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.W, G.H); } }

  // ---------- Title ----------
  class Title {
    constructor() {
      this.t = 0; this.i = 0; this.confetti = [];
      this.hasSave = G.st.hasSave();
      this.opts = [{ l: 'Nuevo juego', en: 'New game' }, { l: 'Continuar', en: 'Continue', d: !this.hasSave }, { l: 'Controles', en: 'Controls' }];
      if (this.hasSave) this.i = 1;
      this.logo = this.makeLogo();
    }
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
    update() {
      this.t++;
      if (G.r(4) === 0) this.confetti.push({ x: G.r(G.W), y: -4, vx: (G.rand() - 0.5) * 0.5, vy: 0.4 + G.rand() * 0.6, c: ['#f8e060', '#f06080', '#60c0f0', '#70e070', '#ffffff'][G.r(5)], life: 500 });
      this.confetti.forEach(e => { e.x += e.vx + Math.sin((this.t + e.life) / 25) * 0.3; e.y += e.vy; e.life--; });
      this.confetti = this.confetti.filter(e => e.life > 0 && e.y < G.H + 5);
      if (this.t < 30) return;
      const d = G.input.repDir(14, 6), k = this.opts.findIndex((o, i) => G.tapIn(this.rowRect(i))); // tap a row = pick it
      if (d === 'up' || d === 'down') { let n = this.i; do { n = (n + (d === 'up' ? -1 : 1) + this.opts.length) % this.opts.length; } while (this.opts[n].d); this.i = n; G.audio.sfx('cursor'); }
      if (k >= 0 && this.opts[k].d) { G.audio.sfx('error'); return; }
      if (k >= 0) this.i = k;
      if (G.input.p('A') || k >= 0) {
        const o = this.opts[this.i]; if (o.d) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok');
        if (this.i === 0) this.newGame();
        else if (this.i === 1) this.cont();
        else G.push(new Controls());
      }
      if (G.input.p('M')) G.audio.toggleMute();
    }
    newGame() {
      G.st.newGame();
      const sc = new Blank(); G.replace(sc);
      sc.tasks.add((function* () {
        G.fade.a = 0;
        const r = yield G.creator();
        if (!r.result) { G.toTitle(); return; }
        G.state.look = r.result.look; G.state.name = r.result.name;
        const f = G.goto('casa', 4, 4, 'up');
        f.locked = true; // from the start, so a quick tap or key can't reach Mamá and start her intro a second time
        f.tasks.add((function* () { yield 40; yield* G.story.mamaIntro(); f.locked = false; })());
      })());
    }
    rowRect(i) { return { x: G.W / 2 - 52, y: 122 + i * 20, w: 104, h: 20 }; }
    cont() {
      if (!G.st.load()) { G.audio.sfx('error'); return; }
      const l = G.state.loc;
      G.goto(l.map, l.x, l.y, l.dir);
    }
    draw(ctx) {
      G.drawBattleBG(ctx, 'town', this.t);
      ctx.fillStyle = 'rgba(255,200,120,0.18)'; ctx.fillRect(0, 0, G.W, G.H);
      this.confetti.forEach(e => { ctx.fillStyle = e.c; ctx.fillRect(Math.round(e.x), Math.round(e.y), 2, (this.t + e.life) % 20 < 10 ? 2 : 1); });
      const bob = Math.round(Math.sin(this.t / 40) * 2);
      ctx.drawImage(this.logo, Math.floor((G.W - 260) / 2), 24 + bob);
      if (this.t > 30) {
        G.win(ctx, G.W / 2 - 56, 118, 112, 8 + this.opts.length * 20);
        this.opts.forEach((o, i) => {
          const y = this.rowRect(i).y + 6;
          G.text(ctx, o.l, G.W / 2 - 36, y, o.d ? '#6068a0' : '#fff');
          if (i === this.i && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', G.W / 2 - 46, y, '#f8e060');
        });
      }
      G.textC(ctx, 'Un juego para aprender español', G.W / 2, G.H - 22, '#fff8e0');
      if (!G.touch) G.textC(ctx, 'Z: OK   X: menú   C: escuchar   M: sonido', G.W / 2, G.H - 11, '#f8e8c0');
    }
  }
  class Controls {
    constructor() { this.transparent = true; }
    update() { if (G.input.p('A') || G.input.p('B') || G.input.tap()) { G.audio.sfx('cancel'); G.pop(); } } // a tap anywhere closes
    draw(ctx) {
      G.win(ctx, 16, 16, G.W - 32, G.H - 32);
      G.closeBtn(ctx, G.W - 32, 10);
      const L = [['CONTROLES  /  CONTROLS', '#f8e060'], ['', ''],
        ['Flechas / WASD', 'caminar, elegir  -  walk, choose'], ['Z, Espacio, Enter', 'hablar, buscar, OK  -  talk, search, OK'],
        ['X, Esc', 'menú, volver  -  menu, back'], ['C', 'escuchar otra vez  -  hear it again'], ['M', 'sonido  -  sound on/off'], ['', ''],
        ['Words start as pictures. Use a word right', ''], ['and it turns gold: you learned it!', ''],
        ['Find the notebook pages hidden in town.', ''], ['English for grown-ups: Opciones > Inglés.', '']];
      L.forEach(([a, b], i) => {
        G.text(ctx, a, 28, 26 + i * 13, b ? '#f8e060' : (i === 0 ? '#f8e060' : (i % 2 ? '#c8d0f0' : '#ffffff')));
        if (b) G.text(ctx, b, 120, 26 + i * 13, '#ffffff');
      });
    }
  }
  G.Title = Title;
  G.toTitle = function () { G.audio.stop(); G.replace(new Title()); };

  // ---------- Boot ----------
  G.boot = function () {
    G.st.newGame();
    G.replace(new Title());
    G.start();
  };
  if (!window.NO_BOOT) G.boot();
})();
