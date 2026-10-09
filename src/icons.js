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

  // pixel rows (one letter per pixel, '.' = empty) painted with a palette, at x0, y0 (flip: mirrored)
  function rows(p, x0, y0, rs, pal, flip) {
    rs.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = pal[r[flip ? r.length - 1 - x : x]]; if (c) p.put(x0 + x, y0 + y, c); } });
  }
  // sound waves: arcs going up and right from cx, cy (an animal making its sound)
  function waves(p, cx, cy, col, radii = [3.5, 6]) {
    for (const r of radii) for (let a = -1.35; a <= 0.15; a += 0.08) p.put(cx + Math.cos(a) * r, cy + Math.sin(a) * r, col);
  }
  // little faces for the sound words (about 9x9, bottom left)
  const MINI = {
    perro(p) { p.ell(5, 11, 3.8, 3.4, '#c07838'); p.ell(1.6, 11, 1.3, 2.6, '#7a4420'); p.ell(8.4, 11, 1.3, 2.6, '#7a4420'); p.ell(5, 13, 2, 1.5, '#f0d8b0'); p.rect(3, 10, 1, 1, '#201010'); p.rect(6, 10, 1, 1, '#201010'); p.rect(4, 12, 2, 1, '#201010'); p.rect(4, 14, 2, 1, '#f07080'); },
    gato(p) { p.tri(1, 10, 3, 6, 5, 9, '#f09840'); p.tri(9, 10, 7, 6, 5, 9, '#f09840'); p.ell(5, 11.5, 4, 3.4, '#f09840'); p.rect(4, 8, 2, 1, '#b8601c'); p.ell(5, 13.5, 1.6, 1, '#fff0d8'); p.rect(3, 11, 1, 1, '#2a7020'); p.rect(6, 11, 1, 1, '#2a7020'); p.put(4.5, 12, '#f07890'); },
    pajaro(p) { p.ell(5, 12, 4, 3, '#4a7ee0'); p.disc(6.5, 9, 2.6, '#4a7ee0'); p.ell(5, 13, 2.5, 1.5, '#f4a060'); p.tri(8.5, 8, 8.5, 10.5, 11, 9, '#f0b040'); p.put(7, 8, '#101010'); p.tri(0, 10, 2, 11, 1, 14, '#22408c'); },
    pato(p) { p.ell(5, 12.5, 4.2, 2.6, '#ffffff'); p.disc(7, 8.5, 2.4, '#ffffff'); p.rect(9, 8.5, 2.5, 1.3, '#f89020'); p.put(7, 8, '#101010'); p.shade(5, 12.5, 4.2, '#d0d0e0'); p.rect(0, 15, 10, 1, '#68b0f0'); },
    rana(p) { p.ell(5, 12, 4.4, 3, '#58b840'); p.disc(2.5, 9, 1.8, '#58b840'); p.disc(7.5, 9, 1.8, '#58b840'); p.put(2.5, 9, '#101010'); p.put(7.5, 9, '#101010'); p.rect(2, 13, 6, 1, '#2a6a20'); p.ell(5, 14, 2.5, 0.8, '#b8e890'); },
    cabra(p) { p.tri(2.5, 9, 3.5, 9, 1.5, 5, '#8a7a60'); p.tri(6.5, 9, 7.5, 9, 8.5, 5, '#8a7a60'); p.ell(5, 11, 2.8, 3.2, '#ece8e0'); p.ell(1, 10, 1.6, 0.8, '#ece8e0'); p.ell(9, 10, 1.6, 0.8, '#ece8e0'); p.rect(3, 10, 1, 1, '#302010'); p.rect(6, 10, 1, 1, '#302010'); p.ell(5, 13.2, 1.3, 0.9, '#d8a8a8'); p.tri(4, 14, 6, 14, 5, 16, '#d8d4cc'); },
  };
  const BROWN = '#c07838', BROWN2 = '#8a5022', CREAM = '#f0d8b0', INK = '#201010';
  // Canelo, the town's dog, sitting and facing left (sientate) or other poses
  function dogSit(p, ox = 0, oy = 0) {
    rows(p, ox, oy, [
      '....ddbb.......',
      '...dbbbbb......',
      '..ddbkbbbd.....',
      'kwwbbbbbdd.....',
      'wwwwbbbbdd.....',
      '.wpwbbbb.......',
      '...wwbbb.......',
      '...wwbbbb...b..',
      '...wwbbbbb..b..',
      '...wwbbbbbb.b..',
      '...wwbbbbbbbb..',
      '...wb.wbbbbb...',
      '...wb.wbbbbb...',
      '..wwb.wwbbbb...',
    ], { b: BROWN, d: BROWN2, w: CREAM, k: INK, p: '#f07080' });
  }
  function dogRun(p, ox = 0, oy = 0, legs = 0) {
    rows(p, ox, oy, [
      '..dd...........',
      '.dbbbd.........',
      'dbkbbd.........',
      'wwbbbb.........',
      'kwwbbbbbbbbbb.b',
      '..wbbbbbbbbbbbb',
      '...wbbbbbbbbbb.',
      '...wwbbbbbbbb..',
      legs ? '...wb.....bw...' : '..wb.......wb..',
      legs ? '....wb...bw....' : '.wb.........wb.',
    ], { b: BROWN, d: BROWN2, w: CREAM, k: INK });
  }
  function smiley(p, col, sh) { p.disc(8, 8.5, 6.5, col); p.shade(8, 8.5, 6.5, sh); }

  const DRAW = {
    hola(p) { hand(p, false); [[1, 2], [2, 4], [0, 4]].forEach(([x, y]) => p.put(x, y, '#f8d030')); p.put(1, 3, '#f8d030'); },
    adios(p) { hand(p, true); for (let y = 3; y < 9; y += 2) { p.put(15, y, '#68b0f0'); p.put(14, y + 1, '#68b0f0'); } },
    sol(p) {
      for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; for (let r = 5.5; r < 7.5; r += 0.5) p.put(8 + Math.cos(t) * r - 0.5, 8 + Math.sin(t) * r - 0.5, '#f8a020'); }
      p.disc(8, 8, 4.5, '#f8d830'); p.shade(8, 8, 4.5, '#f0b020'); p.put(6, 6, '#fff8c0');
    },
    noche(p) { // buenas noches: a crescent moon and two little stars
      p.disc(8, 8.5, 6, '#f8e070'); p.shade(8, 8.5, 6, '#e8c040');
      p.disc(11.2, 6.2, 5.2, null); // (the bite that makes it a crescent)
      p.put(4, 6, '#fff8c8'); p.put(4, 7, '#fff8c8');
      for (const [x, y] of [[13, 11], [12, 2]]) { p.put(x, y, '#ffffff'); p.put(x - 1, y, '#c8d8ff'); p.put(x + 1, y, '#c8d8ff'); p.put(x, y - 1, '#c8d8ff'); p.put(x, y + 1, '#c8d8ff'); }
    },
    busca(p) { // ¡busca!: Canelo's nose down to the ground, sniffing a trail of paw prints
      p.ell(9.5, 6.5, 4.5, 3.6, BROWN); p.shade(9.5, 6.5, 4.6, BROWN2);
      p.ell(13, 4, 1.6, 2.6, BROWN2); // his ear
      p.tri(6, 5, 6, 9, 1.5, 11, BROWN); p.disc(2, 11, 1.4, INK); // the snout, nose down
      p.put(8, 5, INK); p.put(8, 4, '#ffffff');
      for (const [x, y] of [[5, 14], [9, 13], [13, 14]]) { p.disc(x, y, 1, '#a07040'); p.put(x - 1, y - 2, '#a07040'); p.put(x + 1, y - 2, '#a07040'); }
      p.put(0, 8, '#88b8f0'); p.put(1, 7, '#88b8f0'); p.put(0, 13, '#88b8f0'); p.put(1, 14, '#88b8f0'); // sniff sniff
    },
    manana(p) { // "tomorrow": the sun coming up behind a green hill, a little moon going down
      for (let a = 0; a < 5; a++) { const t = Math.PI + a * Math.PI / 4; for (let r = 5; r < 7; r += 0.5) p.put(8 + Math.cos(t) * r - 0.5, 10 + Math.sin(t) * r - 0.5, '#f8a020'); }
      p.disc(8, 10, 4, '#f8d830'); p.shade(8, 10, 4, '#f0b020'); p.put(6, 8, '#fff8c0');
      p.ell(8, 15, 9, 4.5, '#58b048'); p.rect(0, 13, 16, 3, '#58b048'); p.rect(0, 15, 16, 1, '#3a8a30');
      p.disc(13.5, 2.5, 2, '#e8ecff'); p.disc(14.5, 1.8, 1.6, null);
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
    si(p) {
      p.disc(8, 8, 6.5, '#40b048'); p.shade(8, 8, 6.5, '#2a8a34');
      for (let i = 0; i < 3; i++) p.rect(4 + i, 8 + i, 2, 2, '#ffffff');
      for (let i = 0; i < 5; i++) p.rect(7 + i, 9 - i, 2, 2, '#ffffff');
    },
    no(p) {
      p.disc(8, 8, 6.5, '#e03838'); p.shade(8, 8, 6.5, '#b02020');
      for (let i = 0; i < 6; i++) { p.rect(5 + i, 5 + i, 2, 2, '#ffffff'); p.rect(10 - i, 5 + i, 2, 2, '#ffffff'); }
    },
    pagina(p) {
      p.rect(3, 1, 10, 14, '#f8f0d8'); p.tri(10, 1, 13, 1, 13, 4, '#d8c8a0');
      [4, 7, 10].forEach(y => p.rect(5, y, 6, 1, '#a89878')); p.disc(6, 12, 1.5, '#e85060'); p.disc(10, 12.5, 1.2, '#3a78e0');
    },
    flecha(p) { p.rect(2, 7, 8, 3, '#f8e060'); p.tri(9, 3.5, 9, 13.5, 15, 8.5, '#f8e060'); },
    dado(p, w) {
      p.rect(2, 2, 12, 12, '#f8f8f0'); p.rect(2, 13, 12, 1, '#c8c8d0'); p.rect(13, 2, 1, 12, '#c8c8d0');
      const pos = { 1: [[7, 7]], 2: [[4, 4], [10, 10]], 3: [[4, 4], [7, 7], [10, 10]], 4: [[4, 4], [10, 4], [4, 10], [10, 10]], 5: [[4, 4], [10, 4], [7, 7], [4, 10], [10, 10]], 6: [[4, 3], [10, 3], [4, 7], [10, 7], [4, 11], [10, 11]] }[w.n] || [];
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
    // ===================== Round B =====================
    diez(p, w) { // 7..10: a ten frame (two rows of five), the right number of red dots filled in
      p.rect(0, 3, 16, 10, '#f8f8f0'); p.rect(0, 12, 16, 1, '#c8c8d0');
      for (let k = 0; k < 10; k++) { const x = 1 + (k % 5) * 3, y = k < 5 ? 4 : 8; p.rect(x, y, 2, 3, k < w.n ? '#d02838' : '#bcbcca'); }
      p.rect(0, 7, 16, 1, '#c8c8d0');
    },
    leche(p) {
      p.tri(3, 5, 13, 5, 8, 1, '#e8eef8'); p.rect(3, 5, 10, 10, '#ffffff'); p.rect(11, 5, 2, 10, '#d8e0ec');
      p.rect(3, 8, 10, 3, '#3a78e0'); p.rect(11, 8, 2, 3, '#2a58b0'); p.rect(7, 1, 2, 1, '#3a78e0');
      p.disc(6, 13, 1, '#3a78e0');
    },
    queso(p) {
      p.tri(1, 7, 15, 4, 15, 7, '#fff090'); p.rect(1, 7, 15, 7, '#f8d040'); p.rect(1, 13, 15, 1, '#d8a820');
      [[4, 9, 1.4], [9, 11, 1.2], [12, 8.5, 1], [6, 12, 0.8]].forEach(([x, y, r]) => p.disc(x, y, r, '#d8a020'));
    },
    huevo(p) { p.ell(8, 9, 5, 6.5, '#fff6e4'); p.shade(8, 9, 6.6, '#e6d2b0'); p.put(6, 5, '#ffffff'); p.put(5, 6, '#ffffff'); p.put(5, 7, '#ffffff'); },
    agua(p) {
      p.disc(8, 10.5, 4.8, '#3a90f0'); p.tri(3.6, 9, 12.4, 9, 8, 0.5, '#3a90f0'); p.shade(8, 10.5, 4.8, '#2060c0');
      p.put(6, 8, '#d0f0ff'); p.put(5, 9, '#d0f0ff'); p.put(5, 10, '#d0f0ff'); p.put(7, 6, '#a0d8ff');
    },
    galleta(p) {
      p.disc(8, 8.5, 6.5, '#d8a058'); p.shade(8, 8.5, 6.5, '#b88038');
      [[5, 6], [9, 5], [11, 9], [6, 10], [9, 12], [4, 9]].forEach(([x, y]) => { p.rect(x, y, 2, 1, '#5a3010'); p.put(x, y + 1, '#5a3010'); });
    },
    arbol(p) {
      p.rect(7, 10, 3, 6, '#8a5028'); p.put(6, 15, '#8a5028'); p.put(10, 15, '#8a5028'); p.rect(9, 10, 1, 6, '#6a3818');
      p.disc(8.5, 6.5, 6, '#40a838'); p.disc(4, 8.5, 3.2, '#40a838'); p.disc(13, 8.5, 3, '#40a838'); p.shade(8.5, 6.5, 6.5, '#2a7a28');
      p.put(6, 3, '#90e070'); p.put(5, 4, '#90e070'); p.put(7, 3, '#90e070');
    },
    flor(p, w) { // pink, unless the word or picture carries a colour (Lucía's flowers: {icon: 'flor', col})
      const c = (w && w.col) || '#f070a8', mid = c === '#f8d030' ? '#e07818' : '#f8d030';
      p.rect(7, 9, 2, 7, '#38a040'); p.ell(4.5, 12.5, 2.5, 1.2, '#38a040'); p.ell(11.5, 13, 2.5, 1.2, '#38a040');
      [[8, 2.5], [11.6, 5.3], [10.2, 9.3], [5.8, 9.3], [4.4, 5.3]].forEach(([x, y]) => p.disc(x, y, 2.4, c));
      p.disc(8, 6.5, 2.2, mid); p.put(7, 5, '#fff8c0');
    },
    // ----- pictures that aren't words (badges, the bag, Misiones) -----
    canasta(p) { // a picnic basket with a red cloth
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.05) p.put(8 + Math.cos(a) * 5.5 - 0.5, 7 + Math.sin(a) * 5 - 0.5, '#8a5022');
      p.rect(2, 7, 12, 7, '#c88a40'); p.rect(3, 14, 10, 1, '#8a5022');
      for (let y = 8; y < 14; y += 2) p.rect(2, y, 12, 1, '#a86a28');
      p.tri(2, 7, 9, 7, 4, 11, '#e03838'); p.put(4, 8, '#ffffff'); p.put(6, 7, '#ffffff');
    },
    cinta(p, w) { // a prize ribbon (its colour from w.col)
      const c = (w && w.col) || '#3068e0';
      p.tri(4, 9, 8, 9, 3, 16, c); p.tri(8, 9, 12, 9, 13, 16, c);
      p.disc(8, 6, 5.5, c); p.disc(8, 6, 3.5, '#f8d030'); p.put(7, 5, '#fff8c0'); p.shade(8, 6, 5.5, G.shade ? G.shade(c, 0.75) : c);
    },
    nota(p) { // a music note
      p.rect(9, 2, 2, 10, '#5a3a8a'); p.rect(11, 2, 3, 2, '#5a3a8a'); p.rect(13, 4, 1, 2, '#5a3a8a');
      p.ell(7, 12.5, 3.4, 2.4, '#7a50c0'); p.put(6, 11, '#c0a0f0');
      p.rect(1, 4, 1, 1, '#f8d030'); p.rect(3, 2, 1, 1, '#f8d030'); p.rect(2, 7, 1, 1, '#f8d030');
    },
    sobre(p) { // an envelope with wings
      p.ell(3, 6, 3, 2, '#ffffff'); p.ell(13, 6, 3, 2, '#ffffff'); p.ell(2.5, 8, 2.5, 1.5, '#e0e8f8'); p.ell(13.5, 8, 2.5, 1.5, '#e0e8f8');
      p.rect(4, 6, 8, 7, '#f8f0d8'); p.tri(4, 6, 12, 6, 8, 10, '#e8d8b0'); p.put(8, 9, '#e03838');
    },
    estrella(p) { // a gold star
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const dx = x + 0.5 - 8, dy = y + 0.5 - 8.5, a = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
        const k = Math.cos(5 * (a + Math.PI / 2)), lim = 3.6 + 3.8 * Math.max(0, k);
        if (r <= lim) p.put(x, y, dy > 1 ? '#f0b020' : '#f8d838');
      }
      p.put(7, 5, '#fff8c0');
    },
    bolsa(p) { // a cloth bag
      for (let a = Math.PI * 1.05; a <= Math.PI * 1.95; a += 0.05) p.put(8 + Math.cos(a) * 3.5 - 0.5, 6 + Math.sin(a) * 3.5 - 0.5, '#8a5022');
      p.ell(8, 11, 6, 4.6, '#d89a50'); p.rect(4, 6, 8, 3, '#d89a50'); p.shade(8, 11, 6, '#b07030'); p.rect(4, 7, 8, 1, '#a86028'); p.put(6, 9, '#f8d8a0');
    },
    huella(p) { // a paw print on the ground
      p.ell(8, 11, 3.6, 3, '#6a4020'); [[3.6, 6.8], [6.6, 4.6], [9.6, 4.6], [12.4, 6.8]].forEach(([x, y]) => p.ell(x, y, 1.5, 1.8, '#6a4020'));
    },
    plato(p) { // a plate (the picnic: Rosa counts them)
      p.ell(8, 9, 7.5, 5, '#d8d8e4'); p.ell(8, 8.6, 6.4, 4, '#ffffff'); p.ell(8, 9, 4.2, 2.6, '#eef0f8'); p.rect(4, 6, 3, 1, '#ffffff');
    },
    nido(p, w) { // a nest of straw with w.n eggs in it (Rosa's hens: uno, dos)
      const n = (w && w.n) || 1;
      p.ell(8, 11, 7.5, 4, '#a07030'); p.ell(8, 10.2, 6, 2.6, '#6a4818');
      if (n >= 1) { p.ell(n > 1 ? 5.6 : 8, 8.6, 2.4, 3, '#fff8ec'); p.put(n > 1 ? 4 : 7, 7, '#ffffff'); }
      if (n >= 2) { p.ell(10.6, 8.6, 2.4, 3, '#fff4e0'); p.put(10, 7, '#ffffff'); }
      for (const [x, y] of [[2, 11], [4, 13], [7, 14], [11, 13], [13, 11], [9, 12]]) p.put(x, y, '#d0a050');
    },
    cubeta(p) { // a pail of milk
      p.rect(3, 6, 10, 9, '#a0a8b8'); p.rect(3, 6, 10, 2, '#e8ecf4'); p.rect(4, 7, 8, 1, '#ffffff'); p.shade(8, 10, 8, '#808898');
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.06) p.put(8 + Math.cos(a) * 5 - 0.5, 6 + Math.sin(a) * 4 - 0.5, '#606878');
    },
    fuente(p) {
      p.ell(8, 12.5, 7.5, 3, '#b8b8c8'); p.ell(8, 12, 6, 1.8, '#4a90e8'); p.rect(7, 6, 2, 6, '#b8b8c8'); p.ell(8, 6.5, 4, 1.4, '#b8b8c8'); p.ell(8, 6.2, 2.6, 0.8, '#4a90e8');
      p.rect(7, 1, 2, 5, '#68c0ff'); p.put(7, 1, '#ffffff'); p.put(6, 2, '#68c0ff'); p.put(9, 2, '#68c0ff');
      p.put(3, 9, '#68c0ff'); p.put(13, 9, '#68c0ff'); p.put(4, 8, '#68c0ff'); p.put(12, 8, '#68c0ff');
      p.rect(1, 13, 14, 2, '#9898a8');
    },
    banco(p) {
      p.rect(1, 3, 14, 2, '#c07838'); p.rect(1, 6, 14, 2, '#c07838'); p.rect(0, 9, 16, 2, '#d89048'); p.rect(0, 10, 16, 1, '#a05a28');
      p.rect(2, 11, 2, 4, '#404048'); p.rect(12, 11, 2, 4, '#404048'); p.rect(2, 2, 1, 7, '#404048'); p.rect(13, 2, 1, 7, '#404048');
    },
    puerta(p) {
      p.rect(3, 4, 10, 12, '#a05a28'); p.disc(8, 4.5, 5, '#a05a28'); p.rect(3, 15, 10, 1, '#a05a28');
      p.rect(5, 4, 2, 10, '#8a4a20'); p.rect(9, 4, 2, 10, '#8a4a20'); p.rect(8, 1, 0, 0, '#000'); p.rect(4, 6, 1, 1, '#c07838');
      p.disc(11, 10, 1, '#f8d030');
    },
    ventana(p) {
      p.rect(2, 2, 12, 12, '#f0e8d8'); p.rect(3, 3, 10, 10, '#78c0f8'); p.rect(7, 3, 2, 10, '#f0e8d8'); p.rect(3, 7, 10, 2, '#f0e8d8');
      p.put(4, 4, '#e0f4ff'); p.put(5, 4, '#e0f4ff'); p.put(4, 5, '#e0f4ff'); p.put(10, 4, '#e0f4ff');
      p.rect(1, 13, 14, 2, '#a05a28'); p.rect(0, 2, 2, 11, '#d84040'); p.rect(14, 2, 2, 11, '#d84040');
    },
    granja(p) {
      p.tri(0, 7, 16, 7, 8, 1, '#c03028'); p.rect(2, 7, 12, 8, '#d84030'); p.rect(2, 14, 12, 1, '#a02820');
      p.rect(5, 9, 6, 6, '#f8f0e0'); for (let i = 0; i < 6; i++) { p.put(5 + i, 9 + i, '#f8f0e0'); }
      p.rect(6, 10, 4, 5, '#8a2018'); for (let i = 0; i < 4; i++) { p.put(6 + i, 10 + i, '#f8f0e0'); p.put(9 - i, 10 + i, '#f8f0e0'); }
      p.rect(7, 4, 2, 2, '#f8f0e0');
    },
    perro(p) {
      p.ell(8, 8.5, 5.5, 5.2, BROWN); p.shade(8, 8.5, 5.5, '#a86028');
      p.ell(2.6, 9.5, 1.9, 4.4, BROWN2); p.ell(13.4, 9.5, 1.9, 4.4, BROWN2);
      p.ell(8, 11.5, 3.4, 2.5, CREAM); p.rect(7, 9, 2, 2, INK); p.rect(7, 11, 2, 1, INK);
      p.rect(7, 12, 2, 2, '#f07080'); p.put(8, 13, '#d04860');
      p.rect(5, 6, 1, 2, INK); p.rect(10, 6, 1, 2, INK); p.put(5, 6, '#ffffff'); p.put(10, 6, '#ffffff');
    },
    gato(p) {
      p.tri(1, 9, 3, 1, 8, 5, '#f09840'); p.tri(15, 9, 13, 1, 8, 5, '#f09840'); p.tri(3, 6, 3.6, 3, 5.5, 5, '#f8a0b0'); p.tri(13, 6, 12.4, 3, 10.5, 5, '#f8a0b0');
      p.ell(8, 9.5, 6.4, 5, '#f09840'); p.shade(8, 9.5, 6.4, '#d07828');
      p.rect(7, 5, 2, 2, '#b8601c'); p.put(5, 5, '#b8601c'); p.put(10, 5, '#b8601c');
      p.ell(8, 12.2, 2.8, 1.8, '#fff0d8'); p.rect(7, 11, 2, 1, '#f07890');
      p.rect(4, 8, 2, 2, '#58c040'); p.rect(10, 8, 2, 2, '#58c040'); p.rect(5, 8, 1, 2, '#101010'); p.rect(10, 8, 1, 2, '#101010');
      p.put(0, 11, '#fff8f0'); p.put(1, 11, '#fff8f0'); p.put(15, 11, '#fff8f0'); p.put(14, 11, '#fff8f0');
    },
    pajaro(p) {
      p.tri(0, 7, 4, 8, 2, 12, '#22408c'); p.ell(7.5, 9.5, 5, 3.8, '#4a7ee0'); p.disc(11, 6, 3.2, '#4a7ee0');
      p.ell(8.5, 11, 3.6, 2.2, '#f4a060'); p.ell(6, 9, 3, 2, '#2a4ca0'); p.tri(13.5, 5, 13.5, 7.5, 16, 6.3, '#f0b040');
      p.put(12, 5, '#101010'); p.put(11, 4, '#ffffff'); p.rect(7, 13, 1, 2, '#806040'); p.rect(9, 13, 1, 2, '#806040');
    },
    mariposa(p) {
      for (const f of [false, true]) {
        const X = x => f ? 16 - x : x;
        p.ell(X(4.2), 5.5, 3.8, 3.6, '#f88c28'); p.ell(X(5), 11.2, 2.8, 2.8, '#f8a838');
        p.disc(X(3.5), 4.5, 1, '#3a1808'); p.put(X(4.5) - (f ? 1 : 0), 11, '#ffffff');
      }
      p.rect(7, 3, 2, 11, '#3a2418'); p.put(6, 1, '#3a2418'); p.put(5, 0, '#3a2418'); p.put(9, 1, '#3a2418'); p.put(10, 0, '#3a2418');
    },
    pez(p) {
      p.tri(10, 8, 15.5, 3, 15.5, 13, '#f8a040'); p.ell(7, 8, 5.5, 4, '#f88828'); p.tri(5, 4.5, 9, 4.5, 8, 2, '#f8a040');
      p.shade(7, 8, 5.5, '#d06818'); p.disc(4, 7, 1.2, '#ffffff'); p.put(4, 7, '#101010'); p.put(1, 9, '#c05010');
      [[7, 8], [9, 7], [9, 9]].forEach(([x, y]) => p.put(x, y, '#ffc080'));
      p.disc(2, 2, 1, '#a8d8ff');
    },
    conejo(p) {
      p.ell(5, 4.5, 1.8, 4.5, '#e8e0ec'); p.ell(11, 4.5, 1.8, 4.5, '#e8e0ec'); p.ell(5, 4.5, 0.7, 3.2, '#f8a0b8'); p.ell(11, 4.5, 0.7, 3.2, '#f8a0b8');
      p.ell(8, 11, 5.5, 4.4, '#ece6f0'); p.shade(8, 11, 5.5, '#c8c0d4');
      p.rect(5, 10, 1, 2, '#201828'); p.rect(10, 10, 1, 2, '#201828'); p.put(5, 10, '#ffffff'); p.put(10, 10, '#ffffff');
      p.rect(7, 12, 2, 1, '#f070a0'); p.put(3, 12, '#f8b0c8'); p.put(12, 12, '#f8b0c8');
    },
    pato(p) {
      p.rect(0, 14, 16, 1, '#68b0f0'); p.ell(9, 11, 6.5, 3.2, '#ffffff'); p.tri(13, 11, 16, 6.5, 15, 11, '#ffffff');
      p.rect(4, 5, 3, 6, '#ffffff'); p.disc(5, 4.5, 3, '#ffffff'); p.rect(0, 4.5, 3, 2, '#f89020'); p.put(0, 6, '#f89020');
      p.shade(9, 11, 6.6, '#cfd2e4'); p.ell(10, 10, 3, 1.4, '#dcdeec'); p.put(5, 3, '#101010'); p.rect(1, 15, 14, 1, '#3a88e0');
    },
    rana(p) {
      p.disc(4, 5, 3, '#58b840'); p.disc(12, 5, 3, '#58b840'); p.ell(8, 10, 7.2, 4.8, '#58b840'); p.shade(8, 10, 7.2, '#3a9030');
      p.disc(4, 5, 1.8, '#ffffff'); p.disc(12, 5, 1.8, '#ffffff'); p.rect(4, 5, 1, 1, '#101010'); p.rect(11, 5, 1, 1, '#101010');
      p.rect(4, 11, 8, 1, '#1a5a18'); p.put(3, 10, '#1a5a18'); p.put(12, 10, '#1a5a18'); p.put(2, 9, '#f890a0'); p.put(13, 9, '#f890a0');
      p.ell(8, 13.5, 3.5, 1, '#b8e890');
    },
    gallina(p) {
      p.tri(10, 9, 15, 3, 15.5, 10, '#8a4820'); p.ell(8.5, 10.5, 6, 4.5, '#c87838'); p.disc(5, 5.5, 2.8, '#c87838'); p.rect(4, 6, 3, 4, '#c87838');
      p.disc(4, 2.6, 1.1, '#e83030'); p.disc(5.6, 2.3, 1.1, '#e83030'); p.rect(3, 8, 1, 2, '#e83030');
      p.tri(0.5, 5.5, 2.6, 4.6, 2.6, 6.6, '#f0b040'); p.put(4, 5, '#101010');
      p.ell(10, 10.5, 3.4, 2, '#a05828'); p.ell(6, 12, 2.6, 2, '#e0a060'); p.rect(7, 15, 1, 1, '#f0b040'); p.rect(10, 15, 1, 1, '#f0b040');
    },
    caballo(p) {
      p.tri(6, 16, 15, 16, 12, 4, '#a0602c'); p.rect(9, 6, 5, 10, '#a0602c');
      p.disc(9.5, 4.5, 3, '#a0602c'); p.ell(5, 7, 4, 2.5, '#a0602c'); p.ell(2.6, 8, 2.4, 2.2, '#b87848');
      p.tri(9, 2.5, 11.5, 2.5, 11, -0.5, '#a0602c'); p.shade(10, 10, 9, '#844a20');
      for (let y = 2; y < 16; y++) { const x = 11.5 + y * 0.28; p.rect(x, y, 2, 1, '#3a2010'); }
      p.rect(8, 2, 2, 1, '#3a2010'); p.put(8, 4, '#101010'); p.put(1, 8, '#4a2810'); p.rect(7, 6, 1, 1, '#d8a878');
    },
    cabra(p) {
      p.tri(4.5, 5, 6.5, 5, 2.5, 0.5, '#8a7a60'); p.tri(9.5, 5, 11.5, 5, 13.5, 0.5, '#8a7a60');
      p.ell(2.5, 6.5, 2.4, 1.2, '#ece8e0'); p.ell(13.5, 6.5, 2.4, 1.2, '#ece8e0'); p.put(2, 6.5, '#e8b0b0'); p.put(13, 6.5, '#e8b0b0');
      p.ell(8, 8.5, 4, 5, '#ece8e0'); p.shade(8, 8.5, 4.5, '#ccc6ba');
      p.rect(5, 7, 2, 1, '#f0c040'); p.rect(9, 7, 2, 1, '#f0c040'); p.put(6, 7, '#201008'); p.put(9, 7, '#201008');
      p.ell(8, 11.6, 2.2, 1.4, '#d8a8a8'); p.put(7, 11, '#806060'); p.put(9, 11, '#806060');
      p.tri(6.5, 13, 9.5, 13, 8, 16, '#d8d4cc');
    },
    guau(p) { MINI.perro(p); waves(p, 7, 9, '#f8a020', [4, 6.5]); },
    miau(p) { MINI.gato(p); waves(p, 7, 9, '#f8a020', [4, 6.5]); },
    pio(p) { MINI.pajaro(p); waves(p, 7, 9, '#f8a020', [4.5, 7]); },
    cuac(p) { MINI.pato(p); waves(p, 8, 9, '#f8a020', [4.5, 7]); },
    croac(p) { MINI.rana(p); waves(p, 7, 10, '#f8a020', [4.5, 7]); },
    bee(p) { MINI.cabra(p); waves(p, 7, 9, '#f8a020', [4.5, 7]); },
    hueso(p) {
      for (let t = 0; t <= 1; t += 0.05) p.disc(4 + t * 8, 12 - t * 8, 1.6, '#f8f0dc');
      p.disc(2.5, 11.2, 2, '#f8f0dc'); p.disc(4.8, 13.5, 2, '#f8f0dc'); p.disc(11.2, 2.5, 2, '#f8f0dc'); p.disc(13.5, 4.8, 2, '#f8f0dc');
      p.shade(8, 8, 9, '#dccaa4'); p.put(10, 3, '#ffffff'); p.put(2, 10, '#ffffff');
    },
    cama(p) {
      p.rect(1, 3, 3, 12, '#8a5028'); p.rect(1, 3, 3, 1, '#a86838'); p.rect(4, 11, 11, 3, '#8a5028'); p.rect(13, 9, 2, 6, '#8a5028');
      p.rect(4, 8, 10, 3, '#ffffff'); p.rect(7, 7, 7, 4, '#5080e0'); p.rect(7, 10, 7, 1, '#3860b8'); p.ell(5.5, 7.5, 1.8, 1.3, '#ffffff');
      p.rect(4, 14, 1, 1, '#6a3818');
    },
    sientate(p) { dogSit(p, 0, 1); },
    ven(p) {
      dogRun(p, 1, 3, 1);
      p.rect(0, 14, 3, 1, '#c8b890'); p.put(14, 4, '#f8a020'); p.put(15, 5, '#f8a020'); p.put(14, 6, '#f8a020');
    },
    salta(p) { // Canelo in the air over a little hurdle
      p.rect(3, 11, 1, 5, '#e8e8f0'); p.rect(12, 11, 1, 5, '#e8e8f0'); p.rect(2, 11, 12, 2, '#e03838'); p.rect(5, 11, 2, 2, '#f8f8f8'); p.rect(9, 11, 2, 2, '#f8f8f8');
      dogRun(p, 1, 0, 0);
    },
    pata(p) {
      p.ell(8, 11, 4.2, 3.6, BROWN); p.shade(8, 11, 4.4, '#a86028');
      [[3.2, 6.4], [6.4, 3.8], [9.8, 3.8], [12.8, 6.4]].forEach(([x, y]) => p.ell(x, y, 1.7, 2, BROWN));
      p.ell(8, 11.5, 2.4, 1.8, '#3a2010'); [[3.2, 6.6], [6.4, 4], [9.8, 4], [12.8, 6.6]].forEach(([x, y]) => p.disc(x, y, 0.9, '#3a2010'));
    },
    gira(p) {
      for (let a = 0.5; a < Math.PI * 1.75; a += 0.06) p.put(8 + Math.cos(a) * 6.8 - 0.5, 8 + Math.sin(a) * 6.8 - 0.5, '#f8a020');
      p.tri(11, 0, 15, 3.5, 10.5, 5.5, '#f8a020');
      p.ell(8, 9, 3.4, 2.4, BROWN); p.disc(6, 6.5, 2, BROWN); p.put(5, 6, INK); p.put(3.5, 7, INK); p.ell(7, 5, 0.8, 1.3, BROWN2); p.rect(10, 7, 2, 1, BROWN);
    },
    feliz(p) {
      smiley(p, '#f8d030', '#e0b018');
      p.put(4, 7, '#302018'); p.put(5, 6, '#302018'); p.put(6, 7, '#302018'); p.put(9, 7, '#302018'); p.put(10, 6, '#302018'); p.put(11, 7, '#302018');
      p.rect(4, 10, 8, 1, '#302018'); p.rect(5, 11, 6, 2, '#a02838'); p.rect(6, 12, 4, 1, '#f07080');
      p.rect(2, 9, 2, 1, '#f09080'); p.rect(12, 9, 2, 1, '#f09080');
    },
    triste(p) {
      smiley(p, '#88b8f0', '#6890d0');
      p.rect(5, 6, 2, 2, '#302018'); p.rect(10, 6, 2, 2, '#302018'); p.put(4, 5, '#302018'); p.put(12, 5, '#302018');
      p.rect(6, 11, 4, 1, '#302018'); p.put(5, 12, '#302018'); p.put(10, 12, '#302018');
      p.rect(4, 9, 1, 2, '#e8f8ff'); p.put(4, 11, '#ffffff');
    },
    cansado(p) {
      smiley(p, '#f0c870', '#d0a050');
      p.rect(4, 7, 3, 1, '#302018'); p.rect(9, 7, 3, 1, '#302018'); p.ell(8, 11, 1.4, 1.6, '#803030');
      p.rect(11, 0, 3, 1, '#4060c0'); p.put(12, 1, '#4060c0'); p.rect(11, 2, 3, 1, '#4060c0'); p.put(14, 3, '#4060c0'); p.put(15, 3, '#4060c0'); p.put(15, 4, '#4060c0'); p.put(14, 5, '#4060c0'); p.put(15, 5, '#4060c0');
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
  // true when a word (or icon name) has its own picture, not the plain placeholder tile (tools/test-roundb-world.js)
  G.iconDrawn = w => { if (typeof w === 'string') w = G.data.words[w] || { icon: w }; return !!(w && DRAW[w.icon]); };
  // draw an icon scaled (pixel-perfect) inside an optional frame
  // Two kinds of picture made of pictures (chapters 11-21, content/es/story-c11-c21.js):
  //   {icon, count: n, col}  n of that thing in a little heap ("¿Cuántos?": count them; never the number's own picture)
//   {list: [w, ...]}       several different things in a heap (Rosa's picnic basket)
  //   {icon, sign: true}     a picture sign on a wooden post (Sofía's and Luna's trick signs: a sign, not the word)
  G.drawIcon16 = function (ctx, w, x, y, scale = 1, frame) {
    const s = S * scale;
    if (frame) {
      ctx.fillStyle = '#000010'; ctx.fillRect(x - 3, y - 3, s + 6, s + 6);
      ctx.fillStyle = frame === 'sel' ? '#f0d060' : '#8898e0'; ctx.fillRect(x - 2, y - 2, s + 4, s + 4);
      ctx.fillStyle = frame === 'sel' ? '#3a56c8' : '#f4ecd8'; ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    }
    ctx.imageSmoothingEnabled = false;
    if (w && typeof w === 'object' && (w.count != null || w.list)) { // a heap: a grid of small ones, filled row by row
      const n = w.list ? w.list.length : Math.max(1, Math.min(12, w.count | 0)), cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols);
      const cell = Math.floor(s / Math.max(cols, rows)), ox = x + (s - cols * cell) / 2, oy = y + (s - rows * cell) / 2, one = w.list ? null : G.icon({ icon: w.icon, col: w.col });
      for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), k = i % cols, inRow = r === rows - 1 ? n - r * cols : cols; ctx.drawImage(one || G.icon(w.list[i]), Math.round(ox + k * cell + (cols - inRow) * cell / 2 + 1), Math.round(oy + r * cell + 1), cell - 2, cell - 2); }
      return;
    }
    if (w && typeof w === 'object' && w.sign) { // a wooden sign: a post, a board, the picture painted on it
      const u = s / 16, R = (a, b, c, d, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x + a * u), Math.round(y + b * u), Math.round(c * u), Math.round(d * u)); };
      R(7, 11, 2, 5, '#3a2410'); R(7.5, 11, 1, 5, '#7a5028');                 // the post
      R(0.5, 0.5, 15, 11.5, '#3a2410'); R(1, 1, 14, 10.5, '#a06a34'); R(1.6, 1.6, 12.8, 9.3, '#f4e8c8'); // the board
      R(1, 1, 14, 0.6, '#c88a48');
      ctx.drawImage(G.icon({ icon: w.icon, col: w.col }), Math.round(x + 3.5 * u), Math.round(y + 1.8 * u), Math.round(9 * u), Math.round(9 * u));
      return;
    }
    ctx.drawImage(G.icon(w), Math.round(x), Math.round(y), s, s);
  };
})();
