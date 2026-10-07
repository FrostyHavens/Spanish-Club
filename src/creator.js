// ===== Character creator: the first thing in a new game (boy or girl, then skin, hair and clothes) =====
// Up/down picks a row, left/right changes it (the preview updates live), A on ✓ starts the game.
// The dice button picks a random look. On a touch screen every option, the dice and ✓ are tapped directly.
'use strict';
(function () {
  const L = () => G.data.looks;
  const ROWS = ['gender', 'skin', 'style', 'hair', 'outfit', 'done'];
  const LABEL = { gender: '', skin: 'Piel', style: 'Pelo', hair: 'Color', outfit: 'Ropa' };
  const LIST = { gender: 'genders', skin: 'skins', style: 'styles', hair: 'hairs', outfit: 'outfits' };
  const KEY = { gender: 'gender', skin: 'skin', style: 'style', hair: 'hair', outfit: 'outfit' };

  const X0 = 132, STEP = 20; // option panel left edge; option spacing (a 20 px touch target each)
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
    // tap areas (shared with draw): the whole row, each option in it (done row: 0 = dice, 1 = ✓), the back button
    rowRect(r) { return { x: X0 + 5, y: 16 + r * 32, w: G.W - X0 - 20, h: 30 }; }
    optRects(r) {
      const row = ROWS[r], y = 20 + r * 32;
      if (row === 'done') return [0, 1].map(k => ({ x: X0 + 40 + k * 60, y: y - 2, w: 40, h: 26 }));
      if (row === 'gender') return this.options(row).map((g, k) => ({ x: X0 + 22 + k * 82, y: y - 3, w: 74, h: 28 }));
      return this.options(row).map((v, k) => ({ x: X0 + 50 + k * STEP, y: y - 4, w: STEP, h: 30 }));
    }
    backXY() { return [14, 14]; }
    pick(r, k) { // a tapped option: same as moving there with the arrows and pressing A on dice / ✓
      this.row = r; const row = ROWS[r];
      if (row !== 'done') { this.set(row, k); return; }
      this.btn = k;
      if (k === 0) this.random(); else { G.audio.sfx('ok'); this.naming = G.nameEntry(this.look, this.name); }
    }
    update() {
      this.t++; this.spin++;
      if (this.naming && this.naming.done()) { // back from the name screen: a name starts the game, null returns here
        const r = this.naming.result; this.naming = null;
        if (r != null) { this.name = r; G.pop(); this.w.resolve({ look: this.look, name: r }); }
        return;
      }
      if (G.input.tap()) {
        if (G.btnHit(...this.backXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); return; }
        for (let r = 0; r < ROWS.length; r++) {
          const k = this.optRects(r).findIndex(o => G.tapIn(o));
          if (k >= 0) { this.pick(r, k); return; }
          if (G.tapIn(this.rowRect(r)) && r !== this.row) { this.row = r; G.audio.sfx('cursor'); }
        }
      }
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
        else { G.audio.sfx('ok'); this.naming = G.nameEntry(this.look, this.name); }
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
      G.textC(ctx, this.name || '?', 66, 196, '#f8e060');
      G.iconBtn(ctx, 'back', ...this.backXY());

      // option rows
      const x0 = X0, w = G.W - x0 - 10;
      G.win(ctx, x0, 10, w, 204);
      ROWS.forEach((row, r) => {
        const y = 20 + r * 32, sel = r === this.row;
        if (sel) { ctx.fillStyle = 'rgba(248,224,96,0.18)'; ctx.fillRect(x0 + 5, y - 4, w - 10, 30); }
        if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x0 + 8, y + 8, '#f8e060');
        const R = this.optRects(r);
        if (row === 'done') {
          [['dado', 0], ['si', 1]].forEach(([ic, k]) => {
            const on = sel && this.btn === k, o = R[k];
            G.win(ctx, o.x, o.y, o.w, o.h, on ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
            G.drawIcon16(ctx, ic === 'dado' ? { icon: 'dado', n: 5 } : 'si', o.x + 12, o.y + 5);
          });
          return;
        }
        if (LABEL[row]) G.text(ctx, LABEL[row], x0 + 18, y + 8, sel ? '#f8e060' : '#c8d0f0');
        const opts = this.options(row), cur = this.index(row);
        if (row === 'gender') {
          opts.forEach((g, k) => {
            const xx = R[k].x, on = k === cur;
            G.win(ctx, xx, y - 3, 74, 28, on ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : { alpha: 0.7 });
            const sp = G.data.playerSpec(Object.assign({}, G.data.defaultLook(g), { skin: this.look.skin, hair: this.look.hair }));
            ctx.drawImage(G.unitSprite(sp.map, 'down', 0), xx + 4, y - 1);
            G.text(ctx, g === 'nino' ? 'niño' : 'niña', xx + 32, y + 8, on ? '#f8e060' : '#ffffff');
          });
          return;
        }
        opts.forEach((v, k) => {
          const xx = R[k].x + 2, on = k === cur;
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
  // ---------- Name entry: type on a keyboard, or pick letters from the grid (touch / arrow keys) ----------
  const GRID = [
    'ABCDEFGHIJ'.split(''), 'KLMNÑOPQRS'.split(''), 'TUVWXYZÁÉÍ'.split(''),
    ['Ó', 'Ú', '-', '\'', 'SP', 'DEL', 'OK'],
  ];
  const MAX = 10;
  class NameEntry {
    constructor(look, name, w) {
      this.transparent = true; this.look = look; this.w = w; this.t = 0; this.r = 0; this.c = 0; this.grid = GRID;
      this.name = name || '';
      G.textInput = key => this.key(key);
    }
    done(v) { G.textInput = null; G.pop(); this.w.resolve(v); }
    add(ch) {
      if (this.name.length >= MAX) { G.audio.sfx('error'); return; }
      // first letter (and the first after a space or dash) is a capital, the rest lowercase
      const cap = !this.name || /[ -]$/.test(this.name);
      this.name += cap ? ch.toUpperCase() : ch.toLowerCase();
      G.audio.sfx('cursor');
    }
    back() { if (this.name) { this.name = this.name.slice(0, -1); G.audio.sfx('cancel'); } }
    ok() { const n = this.name.trim(); G.audio.sfx('ok'); this.done(n || G.data.player.name); }
    key(k) { // physical keyboard
      if (k === 'Enter') this.ok();
      else if (k === 'Backspace') this.back();
      else if (k === ' ') { if (this.name && !/ $/.test(this.name)) this.add(' '); }
      else if (/^[\p{L}'-]$/u.test(k)) this.add(k);
    }
    press(cell) {
      if (cell === 'OK') this.ok();
      else if (cell === 'DEL') this.back();
      else if (cell === 'SP') { if (this.name && !/ $/.test(this.name)) this.add(' '); }
      else this.add(cell);
    }
    // tap areas (shared with draw): a letter cell, the close button (back to the creator)
    cellRect(r, c) {
      const cell = GRID[r][c], x = (G.W - 268) / 2, y = 14;
      return { x: x + 14 + (r === 3 ? [0, 24, 48, 72, 96, 140, 196][c] : c * 24), y: y + 80 + r * 26, w: cell.length > 1 ? (cell === 'SP' ? 40 : 52) : 20, h: 22 };
    }
    backXY() { return [(G.W + 268) / 2 - 26, 20]; }
    update() {
      this.t++;
      if (G.input.tap() && this.t > 5) { // tap a letter; the close button returns to the creator
        if (G.btnHit(...this.backXY())) { G.audio.sfx('cancel'); this.done(null); return; }
        GRID.forEach((row, r) => row.forEach((cell, c) => { const o = this.cellRect(r, c); if (G.tapIn(o.x - 2, o.y - 2, o.w + 4, o.h + 4)) { this.r = r; this.c = c; this.press(cell); } }));
        if (this.w.done()) return;
      }
      const d = G.input.repDir(14, 5);
      if (d === 'up' || d === 'down') { this.r = (this.r + (d === 'up' ? -1 : 1) + GRID.length) % GRID.length; this.c = Math.min(this.c, GRID[this.r].length - 1); G.audio.sfx('cursor'); }
      if (d === 'left' || d === 'right') { const n = GRID[this.r].length; this.c = (this.c + (d === 'left' ? -1 : 1) + n) % n; G.audio.sfx('cursor'); }
      if (G.input.p('A') && this.t > 5) this.press(GRID[this.r][this.c]);
      if (G.input.p('B')) { if (this.name) this.back(); else { G.audio.sfx('cancel'); this.done(null); } }
    }
    draw(ctx) {
      const W = 268, H = 196, x = (G.W - W) / 2, y = 14;
      G.win(ctx, x, y, W, H);
      const spec = G.data.playerSpec(this.look);
      G.win(ctx, x + 10, y + 8, 60, 60, { alpha: 1 });
      G.drawPortrait(ctx, spec.portrait, x + 14, y + 12, this.t);
      G.text(ctx, '¿Cómo te llamas?', x + 82, y + 14, '#f8e060');
      if (G.enVisible()) G.text(ctx, 'What\'s your name?', x + 82, y + 26, '#f8e8b0');
      // the name field
      ctx.fillStyle = '#000830'; ctx.fillRect(x + 82, y + 38, 170, 22);
      ctx.fillStyle = '#8898e0'; ctx.fillRect(x + 82, y + 59, 170, 1);
      G.bigText(ctx, this.name, x + 84 + G.textWidth(this.name), y + 49, 2, '#ffffff');
      if ((this.t >> 4) % 2 === 0 && this.name.length < MAX) { ctx.fillStyle = '#f8e060'; ctx.fillRect(x + 86 + G.textWidth(this.name) * 2, y + 42, 2, 15); }
      G.closeBtn(ctx, ...this.backXY());
      // letter grid
      GRID.forEach((row, r) => row.forEach((cell, c) => {
        const o = this.cellRect(r, c), cx = o.x, cy = o.y, cw = o.w, sel = r === this.r && c === this.c;
        G.win(ctx, cx, cy, cw, 22, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : { alpha: 0.75 });
        const col = sel ? '#f8e060' : '#ffffff';
        if (cell === 'SP') { ctx.fillStyle = col; ctx.fillRect(cx + 10, cy + 13, 20, 2); ctx.fillRect(cx + 10, cy + 10, 1, 4); ctx.fillRect(cx + 29, cy + 10, 1, 4); }
        else if (cell === 'DEL') { G.textC(ctx, '<', cx + 14, cy + 7, col); ctx.fillStyle = col; ctx.fillRect(cx + 18, cy + 10, 16, 2); }
        else if (cell === 'OK') G.drawIcon16(ctx, 'si', cx + 18, cy + 3);
        else G.textC(ctx, cell, cx + 10, cy + 7, col);
      }));
    }
  }
  G.nameEntry = function (look, name) { const w = new G.Wait(); G.push(new NameEntry(look, name, w)); return w; };

  G.creator = function () { const w = new G.Wait(); G.push(new Creator(w)); return w; };
})();
