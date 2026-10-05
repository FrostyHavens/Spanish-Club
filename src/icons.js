// ===== Word pictures: 16x16 pixel icons drawn in code (outlined, 16-bit style) =====
'use strict';
(function () {
  const S = 16;
  const hex = h => { const n = parseInt(h.slice(1), 16); return h.length === 4 ? [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

  // tiny paint buffer: put/disc/ellipse/rect, then a dark outline pass like the sprite engine
  class P {
    constructor() { this.px = new Array(S * S).fill(null); }
    put(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < S && y < S) this.px[y * S + x] = c; }
    get(x, y) { return x >= 0 && y >= 0 && x < S && y < S ? this.px[y * S + x] : null; }
    rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, c); }
    ell(cx, cy, rx, ry, c) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.put(x, y, c); } }
    disc(cx, cy, r, c) { this.ell(cx, cy, r, r, c); }
    shade(cx, cy, r, c) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (this.get(x, y) && dx * dx + dy * dy <= r * r && dx + dy > r * 0.55) this.put(x, y, c); } }
    tri(x0, y0, x1, y1, x2, y2, c) {
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const px = x + 0.5, py = y + 0.5;
        const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
        const a = ((x1 - px) * (y2 - py) - (y1 - py) * (x2 - px)) / d, b = ((x2 - px) * (y0 - py) - (y2 - py) * (x0 - px)) / d;
        if (a >= 0 && b >= 0 && a + b <= 1) this.put(x, y, c);
      }
    }
    outline(c = '#201828') {
      const add = [];
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (!this.get(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.get(x + dx, y + dy) && this.get(x + dx, y + dy) !== c)) add.push([x, y]);
      add.forEach(([x, y]) => this.put(x, y, c));
    }
    canvas() {
      const cv = G.makeCanvas(S, S), x = cv.getContext('2d'), img = x.createImageData(S, S);
      this.px.forEach((c, i) => { if (!c) return; const [r, g, b] = hex(c); img.data.set([r, g, b, 255], i * 4); });
      x.putImageData(img, 0, 0); return cv;
    }
  }

  const SKIN = '#f0c8a0', SKIN2 = '#d8a078';
  function hand(p, flip) { // open palm, four fingers with gaps, thumb out to the side
    const f = (x, w) => flip ? 16 - x - w : x;
    p.ell(8, 11.5, 4.6, 3.6, SKIN);
    for (const [x, top] of [[4, 5], [7, 3], [10, 3], [13, 5]]) p.rect(f(x - 0.5, 2) | 0, top, 2, 9 - top, SKIN);
    p.rect(f(1, 3), 9, 3, 2, SKIN);
    p.shade(8, 11.5, 4.8, SKIN2);
  }
  function face(p, col, smile) {
    p.disc(8, 8.5, 6.5, col); p.shade(8, 8.5, 6.5, G.shade(col, 0.8));
    p.rect(5, 6, 2, 2, '#302018'); p.rect(10, 6, 2, 2, '#302018');
    if (smile) { p.rect(5, 10, 1, 1, '#302018'); p.rect(6, 11, 4, 1, '#302018'); p.rect(10, 10, 1, 1, '#302018'); }
    p.put(5, 6, '#ffffff'); p.put(10, 6, '#ffffff');
  }

  const DRAW = {
    hola(p) { hand(p, false); [[1, 2], [2, 4], [0, 4]].forEach(([x, y]) => p.put(x, y, '#f8d030')); p.put(1, 3, '#f8d030'); },
    adios(p) { hand(p, true); for (let y = 3; y < 9; y += 2) { p.put(15, y, '#68b0f0'); p.put(14, y + 1, '#68b0f0'); } },
    sol(p) {
      for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; for (let r = 5.5; r < 7.5; r += 0.5) p.put(8 + Math.cos(t) * r - 0.5, 8 + Math.sin(t) * r - 0.5, '#f8a020'); }
      p.disc(8, 8, 4.5, '#f8d830'); p.shade(8, 8, 4.5, '#f0b020'); p.put(6, 6, '#fff8c0');
    },
    pregunta(p) {
      p.ell(8, 7, 7, 5.5, '#f8f8ff'); p.tri(4, 10, 8, 11, 3, 15, '#f8f8ff');
      p.rect(6, 3, 4, 1, '#3068e0'); p.rect(9, 4, 1, 2, '#3068e0'); p.rect(8, 6, 1, 2, '#3068e0'); p.rect(8, 9, 1, 1, '#3068e0'); p.rect(5, 4, 1, 1, '#3068e0');
    },
    bien(p) { face(p, '#f8d030', true); },
    gracias(p) {
      p.disc(5.5, 6, 3.5, '#e83850'); p.disc(10.5, 6, 3.5, '#e83850'); p.tri(2, 7, 14, 7, 8, 14.5, '#e83850');
      p.shade(8, 8, 7, '#b82040'); p.put(4, 4, '#ffd0d8'); p.put(5, 4, '#ffd0d8');
    },
    porfavor(p) {
      face(p, '#f8c060', true);
      p.put(13, 1, '#ffffff'); p.put(13, 3, '#ffffff'); p.put(12, 2, '#ffffff'); p.put(14, 2, '#ffffff'); p.put(13, 2, '#f8e060');
      p.rect(3, 9, 2, 1, '#f08080'); p.rect(11, 9, 2, 1, '#f08080');
    },
    dado(p, w) {
      p.rect(2, 2, 12, 12, '#f8f8f0'); p.rect(2, 13, 12, 1, '#c8c8d0'); p.rect(13, 2, 1, 12, '#c8c8d0');
      const pos = { 1: [[7, 7]], 2: [[4, 4], [10, 10]], 3: [[4, 4], [7, 7], [10, 10]], 4: [[4, 4], [10, 4], [4, 10], [10, 10]], 5: [[4, 4], [10, 4], [7, 7], [4, 10], [10, 10]] }[w.n] || [];
      pos.forEach(([x, y]) => p.rect(x, y, 2, 2, '#d02838'));
    },
    manzana(p) {
      p.disc(8, 9.5, 5.8, '#e03828'); p.shade(8, 9.5, 5.8, '#a82020');
      p.rect(8, 2, 1, 3, '#7a4a20'); p.ell(10.5, 3.5, 2, 1.2, '#48b040');
      p.put(5, 7, '#ffb0a0'); p.put(5, 8, '#ffb0a0');
    },
    naranja(p) {
      p.disc(8, 9, 6, '#f88820'); p.shade(8, 9, 6, '#d06010');
      p.ell(8, 3, 1.8, 1.2, '#48b040'); p.put(5, 6, '#ffd0a0'); p.put(6, 6, '#ffd0a0');
      [[9, 8], [6, 11], [11, 11], [8, 13]].forEach(([x, y]) => p.put(x, y, '#e07018'));
    },
    platano(p) {
      for (let t = 0; t <= 1.0001; t += 0.04) {
        const a = Math.PI * (0.18 + t * 0.64), x = 8 - Math.cos(a) * 7, y = 2 + Math.sin(a) * 10;
        const r = 0.8 + Math.sin(t * Math.PI) * 1.9;
        p.disc(x, y, r, '#f8d838');
      }
      for (let t = 0.1; t <= 0.9; t += 0.04) { const a = Math.PI * (0.18 + t * 0.64); p.put(8 - Math.cos(a) * 7, 2 + Math.sin(a) * 10 + 1.2, '#d0a018'); }
      p.rect(1, 6, 2, 2, '#6a4a20'); p.put(14, 6, '#6a4a20');
    },
    uvas(p) {
      [[5, 6], [8, 6], [11, 6], [6.5, 8.6], [9.5, 8.6], [5, 11], [8, 11], [11, 11], [6.5, 13.4], [9.5, 13.4]].slice(0, 9).forEach(([x, y]) => { p.disc(x, y, 1.9, '#8a40c0'); p.put(x - 1, y - 1, '#c890f0'); });
      p.disc(8, 13.5, 1.9, '#8a40c0'); p.put(7, 12, '#c890f0');
      p.rect(8, 1, 1, 3, '#6a4a20'); p.ell(10.5, 2.5, 2, 1, '#48b040');
    },
    pan(p) {
      p.ell(8, 9.5, 7, 4.5, '#d89040'); p.ell(8, 8.5, 6, 3.2, '#e8a850');
      [[4, 7], [7, 6], [10, 7]].forEach(([x, y]) => { p.put(x, y + 1, '#f8d8a0'); p.put(x + 1, y, '#f8d8a0'); p.put(x + 2, y - 1, '#f8d8a0'); });
    },
    color(p, w) {
      const c = w.col; p.disc(8, 8, 5.5, c); p.disc(3.5, 4, 1.6, c); p.disc(13, 5, 1.3, c); p.disc(12, 13, 1.7, c); p.disc(3, 12.5, 1.2, c);
      p.shade(8, 8, 5.5, G.shade(c, 0.75)); p.put(6, 6, G.shade(c, 1.5)); p.put(7, 6, G.shade(c, 1.5));
    },
    pelota(p, w) {
      const c = w.col; p.disc(8, 8, 6.5, c); p.shade(8, 8, 6.5, G.shade(c, 0.72));
      for (let y = 2; y < 15; y++) { const x = Math.round(8 + Math.sin((y - 2) / 12 * Math.PI) * 2.5); p.put(x, y, '#f8f8f8'); }
      p.put(5, 5, '#ffffff'); p.put(5, 6, '#ffffff'); p.put(6, 5, '#ffffff');
    },
    casa(p) {
      p.tri(1, 8, 15, 8, 8, 1.5, '#d84030'); p.rect(3, 8, 10, 7, '#f0e0c0'); p.rect(7, 10, 3, 5, '#8a5028');
      p.rect(4, 9, 2, 2, '#68b0f0'); p.rect(11, 9, 1, 2, '#68b0f0'); p.rect(11, 2, 2, 4, '#806060');
    },
    escuela(p) {
      p.rect(2, 7, 12, 8, '#e8d8b8'); p.tri(1, 7, 15, 7, 8, 2.5, '#3a68c0'); p.rect(7, 11, 2, 4, '#8a5028');
      [[3, 9], [5, 9], [10, 9], [12, 9]].forEach(([x, y]) => p.rect(x, y, 1, 2, '#68b0f0'));
      p.rect(8, 0, 1, 3, '#806060'); p.rect(9, 0, 3, 2, '#e03838'); p.disc(8, 5.5, 1.2, '#f8d030');
    },
    parque(p) {
      p.rect(7, 9, 2, 6, '#8a5028'); p.disc(8, 6, 5.5, '#40a838'); p.shade(8, 6, 5.5, '#2a7a28'); p.put(6, 4, '#90e070');
      p.rect(0, 14, 16, 2, '#58b040'); p.put(3, 13, '#f8e060'); p.put(12, 13, '#f070a0'); p.put(14, 13, '#f8e060');
    },
    panaderia(p) {
      for (let i = 0; i < 16; i += 2) { p.rect(i, 1, 2, 3, i % 4 ? '#f8f0e0' : '#e04040'); }
      p.ell(8, 11, 6.5, 3.5, '#d89040'); p.ell(8, 10, 5.5, 2.4, '#e8a850');
      [[5, 9], [8, 9], [11, 9]].forEach(([x, y]) => { p.put(x, y, '#f8d8a0'); p.put(x + 1, y - 1, '#f8d8a0'); });
    },
    biblioteca(p) {
      [[1, 4, '#d04040'], [4, 2, '#3a68c0'], [7, 5, '#40a040'], [10, 3, '#e0a030'], [13, 6, '#8a40c0']].forEach(([x, top, c]) => {
        p.rect(x, top, 3, 14 - top, c); p.rect(x, top + 2, 3, 1, '#f8e8b0'); p.rect(x, 12, 3, 1, '#f8e8b0');
      });
      p.rect(0, 14, 16, 2, '#8a5028');
    },
    carta(p) {
      p.rect(1, 4, 14, 9, '#f8f8f0');
      for (let i = 0; i < 7; i++) { p.put(1 + i, 4 + i * 0.7, '#a8a8b8'); p.put(14 - i, 4 + i * 0.7, '#a8a8b8'); }
      p.disc(8, 9, 1.8, '#d02838');
    },
  };

  // G.icon(name | word, size?) -> canvas (cached). A word object may carry n / col params.
  const cache = {};
  G.icon = function (w) {
    if (typeof w === 'string') w = G.data.words[w] || { icon: w };
    const key = w.icon + '|' + (w.n || '') + (w.col || '');
    if (cache[key]) return cache[key];
    const p = new P(); const fn = DRAW[w.icon];
    if (fn) fn(p, w); else { p.rect(2, 2, 12, 12, '#a0a8d0'); }
    p.outline();
    return (cache[key] = p.canvas());
  };
  // draw an icon scaled (pixel-perfect) inside an optional frame
  G.drawIcon16 = function (ctx, w, x, y, scale = 1, frame) {
    const img = G.icon(w), s = S * scale;
    if (frame) {
      ctx.fillStyle = '#000010'; ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
      ctx.fillStyle = frame === 'sel' ? '#f0d060' : '#8898e0'; ctx.fillRect(x - 2, y - 2, s + 4, s + 4);
      ctx.fillStyle = frame === 'sel' ? '#3a56c8' : '#f4ecd8'; ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(x), Math.round(y), s, s);
  };
})();
