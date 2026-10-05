// ===== Character creator: the first thing in a new game (boy or girl, then skin, hair and clothes) =====
// Up/down picks a row, left/right changes it (the preview updates live), A on ✓ starts the game.
// The dice button picks a random look.
'use strict';
(function () {
  const L = () => G.data.looks;
  const ROWS = ['gender', 'skin', 'style', 'hair', 'outfit', 'done'];
  const LABEL = { gender: '', skin: 'Piel', style: 'Pelo', hair: 'Color', outfit: 'Ropa' };
  const LIST = { gender: 'genders', skin: 'skins', style: 'styles', hair: 'hairs', outfit: 'outfits' };
  const KEY = { gender: 'gender', skin: 'skin', style: 'style', hair: 'hair', outfit: 'outfit' };

  class Creator {
    constructor(w) {
      this.w = w; this.t = 0; this.row = 0; this.btn = 1; // done row: 0 = dice, 1 = ✓
      this.look = G.data.defaultLook('nino');
      this.spin = 0;
    }
    options(row) { return L()[LIST[row]]; }
    index(row) { return this.options(row).indexOf(this.look[KEY[row]]); }
    set(row, k) {
      const opts = this.options(row), v = opts[(k + opts.length) % opts.length];
      if (row === 'gender') {
        if (v === this.look.gender) return;
        // switching boy/girl swaps in that default hairstyle and outfit, keeping skin and hair color
        const d = G.data.defaultLook(v);
        this.look = Object.assign({}, this.look, { gender: v, style: d.style, outfit: d.outfit });
      } else this.look[KEY[row]] = v;
      this.spin = 0; G.audio.sfx('cursor');
    }
    random() {
      const pick = a => a[G.r(a.length)];
      this.look = { gender: pick(L().genders), skin: pick(L().skins), style: pick(L().styles), hair: pick(L().hairs), outfit: pick(L().outfits) };
      G.audio.sfx('select'); this.spin = 0;
    }
    update() {
      this.t++; this.spin++;
      const d = G.input.repDir(14, 6), row = ROWS[this.row];
      if (d === 'up' || d === 'down') { this.row = (this.row + (d === 'up' ? -1 : 1) + ROWS.length) % ROWS.length; G.audio.sfx('cursor'); }
      if (d === 'left' || d === 'right') {
        const dx = d === 'left' ? -1 : 1;
        if (row === 'done') { this.btn = 1 - this.btn; G.audio.sfx('cursor'); }
        else this.set(row, this.index(row) + dx);
      }
      if (G.input.p('A')) {
        if (row !== 'done') { this.row = ROWS.length - 1; this.btn = 1; G.audio.sfx('cursor'); }
        else if (this.btn === 0) this.random();
        else { G.audio.sfx('ok'); G.pop(); this.w.resolve(this.look); }
      }
      if (G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); }
    }
    draw(ctx) {
      // sunny backdrop
      G.drawBattleBG(ctx, 'town', this.t);
      ctx.fillStyle = 'rgba(255,200,120,0.18)'; ctx.fillRect(0, 0, G.W, G.H);
      const spec = G.data.playerSpec(this.look);
      // preview: big walking sprite turning around, and the dialogue portrait
      G.win(ctx, 10, 10, 112, 204);
      const dirs = ['down', 'left', 'up', 'right'], dir = dirs[Math.floor(this.spin / 50) % 4];
      const img = G.unitSprite(spec.map, dir, (this.t >> 4) & 1);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(66, 112, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 30, 30, 72, 72);
      G.win(ctx, 36, 128, 60, 60, { alpha: 1 });
      G.drawPortrait(ctx, spec.portrait, 40, 132, this.t);
      G.textC(ctx, G.data.player.name, 66, 196, '#f8e060');

      // option rows
      const x0 = 132, w = G.W - x0 - 10;
      G.win(ctx, x0, 10, w, 204);
      ROWS.forEach((row, r) => {
        const y = 20 + r * 32, sel = r === this.row;
        if (sel) { ctx.fillStyle = 'rgba(248,224,96,0.18)'; ctx.fillRect(x0 + 5, y - 4, w - 10, 30); }
        if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x0 + 8, y + 8, '#f8e060');
        if (row === 'done') {
          const bx = x0 + 40, by = y;
          [['dado', 0], ['si', 1]].forEach(([ic, k]) => {
            const on = sel && this.btn === k, xx = bx + k * 60;
            G.win(ctx, xx, by - 2, 40, 26, on ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
            G.drawIcon16(ctx, ic === 'dado' ? { icon: 'dado', n: 5 } : 'si', xx + 12, by + 3);
          });
          return;
        }
        if (LABEL[row]) G.text(ctx, LABEL[row], x0 + 18, y + 8, sel ? '#f8e060' : '#c8d0f0');
        const opts = this.options(row), cur = this.index(row);
        if (row === 'gender') {
          opts.forEach((g, k) => {
            const xx = x0 + 22 + k * 82, on = k === cur;
            G.win(ctx, xx, y - 3, 74, 28, on ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : { alpha: 0.7 });
            const sp = G.data.playerSpec(Object.assign({}, G.data.defaultLook(g), { skin: this.look.skin, hair: this.look.hair }));
            ctx.drawImage(G.unitSprite(sp.map, 'down', 0), xx + 4, y - 1);
            G.text(ctx, g === 'nino' ? 'niño' : 'niña', xx + 32, y + 8, on ? '#f8e060' : '#ffffff');
          });
          return;
        }
        const ox = x0 + 52, step = 19;
        opts.forEach((v, k) => {
          const xx = ox + k * step, on = k === cur;
          if (row === 'style') {
            const sp = G.data.playerSpec(Object.assign({}, this.look, { style: v }));
            if (on) { ctx.fillStyle = '#f8e060'; ctx.fillRect(xx - 2, y - 3, 19, 26); ctx.fillStyle = '#1c2c8c'; ctx.fillRect(xx - 1, y - 2, 17, 24); }
            ctx.drawImage(G.unitSprite(sp.map, 'down', 0), xx - 4, y - 3);
          } else {
            if (on) { ctx.fillStyle = '#f8e060'; ctx.fillRect(xx - 2, y - 1, 19, 19); }
            ctx.fillStyle = '#000010'; ctx.fillRect(xx - 1, y, 17, 17);
            ctx.fillStyle = v; ctx.fillRect(xx, y + 1, 15, 15);
            ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(xx + 1, y + 2, 13, 2);
          }
        });
      });
    }
  }
  G.creator = function () { const w = new G.Wait(); G.push(new Creator(w)); return w; };
})();
