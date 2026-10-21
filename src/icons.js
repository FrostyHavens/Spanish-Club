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
  // a bear's head (el oso; grande / pequeño show a big one and a little one): round ears, a pale muzzle, a black nose
  function bearHead(p, cx, cy, r, col, dk, sleepy) {
    p.disc(cx - r * 0.7, cy - r * 0.72, r * 0.36, col); p.disc(cx + r * 0.7, cy - r * 0.72, r * 0.36, col);
    if (r > 3) { p.disc(cx - r * 0.7, cy - r * 0.72, r * 0.18, dk); p.disc(cx + r * 0.7, cy - r * 0.72, r * 0.18, dk); }
    p.disc(cx, cy, r, col); p.shade(cx, cy, r, dk);
    p.ell(cx, cy + r * 0.38, r * 0.45, r * 0.34, '#f0d8b0'); p.disc(cx, cy + r * 0.22, Math.max(0.6, r * 0.16), '#101010');
    const e = Math.max(1, Math.round(r * 0.14));
    if (sleepy) { p.rect(Math.round(cx - r * 0.45), Math.round(cy - r * 0.15), e + 1, 1, '#302018'); p.rect(Math.round(cx + r * 0.25), Math.round(cy - r * 0.15), e + 1, 1, '#302018'); }
    else { p.rect(Math.round(cx - r * 0.42), Math.round(cy - r * 0.2), e, e, '#101010'); p.rect(Math.round(cx + r * 0.3), Math.round(cy - r * 0.2), e, e, '#101010'); }
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
  const KID = { H: '#5a3418', S: '#f0c8a0', R: '#e04040', B: '#3870d8', K: '#303040', W: '#ffffff' }; // (the park's action pictures: a kid doing it)
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
    manzana(p, w) { // red, unless the picture carries a colour (listen-and-do: green and yellow apples, src/listen.js)
      const c = (w && w.col) || '#e03828', k = c !== '#e03828';
      p.disc(8, 9.5, 5.8, c); p.shade(8, 9.5, 5.8, k ? G.shade(c, 0.74) : '#a82020');
      p.rect(8, 2, 1, 3, '#7a4a20'); p.ell(10.5, 3.5, 2, 1.2, k && c === '#38b040' ? '#287a28' : '#48b040');
      p.put(5, 7, k ? G.shade(c, 1.5) : '#ffb0a0'); p.put(5, 8, k ? G.shade(c, 1.5) : '#ffb0a0');
    },
    naranja(p) {
      p.disc(8, 9, 6, '#f88820'); p.shade(8, 9, 6, '#d06010');
      p.ell(8, 3, 1.8, 1.2, '#48b040'); p.put(5, 6, '#ffd0a0'); p.put(6, 6, '#ffd0a0');
      [[9, 8], [6, 11], [11, 11], [8, 13]].forEach(([x, y]) => p.put(x, y, '#e07018'));
    },
    platano(p, w) { // yellow, unless the picture carries a colour (a green banana: listen-and-do, src/listen.js)
      const c = (w && w.col) || '#f8d838', ln = w && w.col ? G.shade(c, 0.78) : '#d0a018';
      for (let t = 0; t <= 1.0001; t += 0.04) {
        const a = Math.PI * (0.18 + t * 0.64), x = 8 - Math.cos(a) * 7, y = 2 + Math.sin(a) * 10;
        const r = 0.8 + Math.sin(t * Math.PI) * 1.9;
        p.disc(x, y, r, c);
      }
      for (let t = 0.1; t <= 0.9; t += 0.04) { const a = Math.PI * (0.18 + t * 0.64); p.put(8 - Math.cos(a) * 7, 2 + Math.sin(a) * 10 + 1.2, ln); }
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
    escucha(p) { // listen: an ear with sound coming in (a listen-and-do favour's bubble, src/listen.js: listen, then do it)
      p.ell(6, 8.5, 4.4, 6.2, '#f0c8a0'); p.shade(6, 8.5, 4.4, '#d8a078');
      p.ell(6.6, 8, 2.4, 4, '#c88068'); p.ell(7.1, 8.6, 1.2, 2.4, '#f0c8a0'); p.rect(4, 13, 3, 2, '#f0c8a0');
      for (const r of [3.6, 6.2]) for (let a = -0.8; a <= 0.81; a += 0.1) p.put(9.6 + Math.cos(a) * r, 8 + Math.sin(a) * r, '#2f6fe0');
    },
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
    lupa(p) { // a magnifying glass (hide-and-seek: ¿Dónde están?)
      p.rect(9, 10, 2, 2, '#6a4020'); p.rect(11, 12, 2, 2, '#6a4020'); p.rect(13, 13, 2, 2, '#8a5a28');
      p.disc(6.5, 6.5, 5.5, '#c8a040'); p.disc(6.5, 6.5, 4.2, '#b8e0f8'); p.disc(5, 5, 1.6, '#ffffff'); p.put(8, 8, '#88c0e8'); p.put(9, 7, '#88c0e8');
    },
    palo(p) { // a stick to throw for Canelo (no word: a toy, src/carry.js)
      for (let i = 0; i < 12; i++) { p.put(2 + i, 13 - i, '#8a5a28'); p.put(3 + i, 13 - i, '#a87038'); p.put(2 + i, 12 - i, '#6a4018'); }
      p.put(9, 6, '#6a4018'); p.put(9, 5, '#6a4018'); p.put(10, 4, '#6a4018'); // a little twig
      p.ell(11, 3.5, 1.6, 1, '#58b048'); p.put(11, 3, '#88d870');            // and a leaf on it
    },
    dormir(p) { // asleep until tomorrow: a pillow, a crescent moon and "z z" (a chapter that opens after the night)
      p.ell(8, 13, 7, 2.6, '#f4ecd8'); p.shade(8, 13, 7, '#d8ccb0');
      p.disc(5.5, 6, 4.2, '#f8e070'); p.shade(5.5, 6, 4.2, '#e8c040'); p.disc(7.6, 4.6, 3.6, null);
      p.rect(10, 1, 5, 1, '#ffffff'); p.put(13, 2, '#ffffff'); p.put(12, 3, '#ffffff'); p.put(11, 4, '#ffffff'); p.rect(10, 5, 5, 1, '#ffffff'); // a big "Z"
      p.rect(13, 8, 3, 1, '#c8d8ff'); p.put(14, 9, '#c8d8ff'); p.rect(13, 10, 3, 1, '#c8d8ff');                                         // and a little one
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
    // ---- the open world (src/zones.js, docs/WORLD_PLAN.md): the zones' pictures, the bus, the map ----
    autobus(p) { // a little yellow bus: windows, a door, two wheels
      p.rect(1, 4, 14, 8, '#f8c830'); p.rect(1, 4, 14, 1, '#fff0a0'); p.rect(1, 11, 14, 1, '#c08818');
      for (const x of [2, 5, 8]) p.rect(x, 5, 2, 3, '#88d0f8'); p.rect(11, 5, 3, 6, '#88d0f8'); p.rect(12, 5, 1, 6, '#5898d0');
      p.rect(1, 9, 9, 1, '#e05030'); p.disc(4.5, 12.5, 2, '#303040'); p.disc(11.5, 12.5, 2, '#303040'); p.put(4, 12, '#a0a0b0'); p.put(11, 12, '#a0a0b0');
      p.put(15, 9, '#fff8c0');
    },
    trofeo(p) { // a gold cup with two handles on a little stand (the world's trophy: "¡Mi mundo!")
      p.ell(8, 4.5, 5.5, 1.6, '#f8d838'); p.rect(3, 4, 10, 4, '#f0b020'); p.ell(8, 8, 5, 3.6, '#f0b020'); p.rect(4, 4, 2, 5, '#f8e070');
      p.rect(1, 4, 2, 4, '#e0a018'); p.rect(13, 4, 2, 4, '#e0a018'); p.put(2, 8, '#e0a018'); p.put(13, 8, '#e0a018');
      p.rect(7, 11, 2, 2, '#d09010'); p.rect(4, 13, 8, 2, '#8a5a2c'); p.rect(5, 13, 6, 1, '#b07838'); p.put(8, 7, '#fff8c0');
    },
    mapa(p) { // a folded paper map: green land, a blue lake, a red dotted path and an X
      p.rect(1, 2, 14, 12, '#f4e8c0'); p.rect(5, 2, 1, 12, '#d8c890'); p.rect(10, 2, 1, 12, '#d8c890');
      p.ell(4, 6, 3, 2.4, '#78c058'); p.ell(12, 11, 3, 2.2, '#78c058'); p.ell(11.5, 5, 2.4, 1.8, '#68a8e8');
      for (const [x, y] of [[3, 11], [5, 10], [7, 9], [9, 8]]) p.put(x, y, '#e03028'); p.put(12, 6.5, '#e03028');
    },
    playa(p) { // the beach: the sun, the sea, the sand and a red pail
      p.rect(0, 0, 16, 9, '#a8e0f8'); p.disc(12, 4, 2.6, '#f8d030'); p.rect(0, 8, 16, 3, '#3888e0'); p.rect(0, 8, 16, 1, '#f8f8ff');
      p.rect(0, 11, 16, 5, '#f8e0a0'); p.rect(3, 11, 3, 3, '#e03028'); p.rect(3, 11, 3, 1, '#f86048'); p.put(4, 10, '#303040');
    },
    bosque(p) { // the forest: two pine trees and a mushroom
      p.tri(1, 12, 9, 12, 5, 1, '#2a8a3a'); p.tri(6, 14, 15, 14, 10.5, 3, '#38a848'); p.rect(4, 12, 2, 3, '#7a4a20'); p.rect(10, 14, 2, 2, '#7a4a20');
      p.ell(7.5, 13, 2.2, 1.2, '#e03028'); p.rect(7, 13, 1, 2, '#f8f0e0'); p.put(7, 12, '#ffffff');
    },
    juegos(p) { // the playground: a swing on a frame and a slide
      p.rect(1, 2, 1, 13, '#e04040'); p.rect(8, 2, 1, 13, '#e04040'); p.rect(1, 2, 8, 1, '#e04040');
      p.rect(3, 3, 1, 7, '#a0a0b0'); p.rect(6, 3, 1, 7, '#a0a0b0'); p.rect(3, 10, 4, 1, '#3870d8');
      p.tri(9, 14, 15, 14, 15, 6, '#f8c830'); p.rect(14, 6, 1, 9, '#3870d8'); p.rect(0, 15, 16, 1, '#58b040');
    },
    abuelos(p) { // the grandparents' house: a cottage with a chimney, a heart over it
      p.tri(1, 8, 15, 8, 8, 2, '#c05030'); p.rect(3, 8, 10, 7, '#f8e0b0'); p.rect(11, 3, 2, 4, '#8a5030');
      p.rect(7, 10, 3, 5, '#8a5030'); p.rect(4, 10, 2, 2, '#88d0f8'); p.put(13, 1, '#d0d0d8'); p.put(14, 0, '#d0d0d8');
      p.disc(3, 3, 1.2, '#f05080'); p.disc(5, 3, 1.2, '#f05080'); p.tri(2, 3.5, 6, 3.5, 4, 6, '#f05080');
    },
    montana(p) { // the mountain: two peaks with snow, a cloud
      p.tri(0, 15, 10, 15, 5, 3, '#7a8aa0'); p.tri(5, 15, 16, 15, 11, 1, '#8a9ab8'); p.tri(9, 4, 13, 4, 11, 1, '#ffffff'); p.tri(3.5, 6, 6.5, 6, 5, 3, '#ffffff');
      p.ell(3, 2, 2.4, 1.2, '#ffffff'); p.rect(0, 15, 16, 1, '#58b040');
    },
    explorar(p) { // going exploring: a winding path to green hills, the sun
      p.rect(0, 0, 16, 9, '#a8e0f8'); p.disc(12, 3, 2, '#f8d030'); p.ell(4, 10, 6, 4, '#58b040'); p.ell(13, 10, 5, 3, '#48a038'); p.rect(0, 10, 16, 6, '#78c058');
      for (const [x, y] of [[7, 15], [8, 14], [8, 13], [9, 12], [9, 11], [10, 10]]) { p.put(x, y, '#e8c888'); p.put(x + 1, y, '#e8c888'); }
    },
    // ---- El bosque (content/es/zone-bosque.js): the woods, big and small, its animals ----
    hoja(p, w) { // a leaf: pointed, a midrib and veins, a little stem (its colour from w.col: Lola's leaves)
      const c = (w && w.col) || '#58b040', d = G.shade(c, 0.75), l = G.shade(c, 1.2);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const u = (x + 0.5 + (y + 0.5)) / 2 - 1, v = ((x + 0.5) - (y + 0.5)) / 1.414; // along the leaf (bottom-left to top-right), across it
        const t = (u - 1) / 12; if (t < 0 || t > 1) continue;
        const half = Math.sin(Math.PI * Math.pow(t, 0.8)) * 4.2;
        if (Math.abs(v) <= half) p.put(x, y, v > 0 ? d : c);
      }
      for (let i = 2; i < 13; i++) p.put(i, 15 - i, l);                         // the midrib
      for (const [x, y] of [[5, 8], [8, 5], [7, 10], [10, 7]]) p.put(x, y, l);
      p.put(1, 15, '#7a5028'); p.put(2, 14, '#7a5028');
    },
    hongo(p, w) { // a mushroom: a red cap with white spots on a pale stem (w.n 's': a little one, 'b': a big one)
      const k = w && w.n === 's' ? 0.55 : 1, cx = 8, by = 15.5, cy = by - 9.5 * k;
      p.rect(Math.round(cx - 2 * k), Math.round(by - 7 * k), Math.max(2, Math.round(4 * k)), Math.round(7 * k), '#ffffff'); p.rect(Math.round(cx + 1.2 * k), Math.round(by - 7 * k), 1, Math.round(7 * k), '#c0ae90');
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const dx = (x + 0.5 - cx) / (7 * k), dy = (y + 0.5 - cy) / (5 * k); if (dy <= 0.45 && dx * dx + dy * dy <= 1) p.put(x, y, dx > 0.45 ? '#a82418' : '#e03a30'); }
      for (const [dx, dy, r] of [[-3.5, -2, 1.3], [1, -3.4, 1.2], [3.6, -0.6, 1.1], [-1, 0, 0.9]]) p.disc(cx + dx * k, cy + dy * k, Math.max(0.6, r * k), '#fff8f0');
    },
    tronco(p) { // a log lying on its side: bark, rings on its end, moss on top
      p.rect(1, 6, 11, 8, '#8a5a30'); p.rect(1, 6, 11, 2, '#b07a48'); p.rect(1, 12, 11, 2, '#6a4020');
      for (const x of [3, 6, 9]) p.rect(x, 8, 1, 4, '#6a4020');
      p.ell(12.5, 10, 3.2, 4.2, '#d8b07a'); p.ell(12.5, 10, 2.1, 2.9, '#b8905a'); p.ell(12.5, 10, 0.9, 1.4, '#8a6034');
      for (const x of [2, 4, 5, 8, 10]) p.put(x, 5, '#5a9a38'); p.rect(3, 6, 3, 1, '#86c050');
    },
    bellota(p) { // an acorn: a shiny brown nut under a bumpy cap with a little stalk
      p.ell(8, 10.5, 4.6, 5, '#b8742a'); p.shade(8, 10.5, 4.6, '#8a5018'); p.put(6, 9, '#f0b060'); p.put(6, 10, '#e0a050');
      p.ell(8, 6, 6, 3, '#7a5028'); for (const [x, y] of [[4, 5], [6, 4], [8, 5], [10, 4], [12, 5], [5, 7], [9, 7], [11, 7]]) p.put(x, y, '#a07040');
      p.rect(8, 1, 1, 3, '#5a3818'); p.put(9, 1, '#5a3818'); p.put(8, 15, '#6a3a10');
    },
    mora(p) { // a blackberry: a cluster of shiny dark purple beads, two leaves
      p.ell(5, 3, 3.2, 1.8, '#58b040'); p.ell(11, 3, 3.2, 1.8, '#3a9030'); p.rect(7, 2, 2, 3, '#3a7a28');
      for (const [x, y] of [[6, 6], [10, 6], [4.5, 9], [8, 8.5], [11.5, 9], [6, 12], [10, 12], [8, 14.5], [8, 11]]) { p.disc(x, y, 2.1, '#4a2a70'); }
      for (const [x, y] of [[6, 6], [10, 6], [4.5, 9], [8, 8.5], [11.5, 9], [6, 12], [10, 12], [8, 14.5], [8, 11]]) { p.put(x - 1, y - 1, '#9a6ad0'); }
    },
    cueva(p) { // a cave: a dark round mouth in grey rock, grass on top, pebbles at its foot
      p.ell(8, 10, 8, 8, '#8e836e'); p.rect(0, 10, 16, 6, '#8e836e'); p.shade(8, 10, 8, '#6c6252');
      p.rect(0, 2, 16, 2, '#58b040'); p.put(3, 1, '#58b040'); p.put(11, 1, '#58b040'); p.put(14, 2, '#3a9030');
      p.ell(8, 14, 5, 8, '#0c0a10'); p.rect(3, 14, 10, 2, '#0c0a10'); p.ell(8, 14, 3.4, 6.5, '#1e1822');
      p.put(2, 15, '#b0a68e'); p.put(13, 15, '#b0a68e'); p.put(14, 14, '#b0a68e'); p.put(5, 8, '#b0a68e'); p.put(11, 7, '#b0a68e');
    },
    grande(p) { // big: a big bear in colour beside a little grey one (the big one is the answer)
      bearHead(p, 6.5, 8, 6, '#9a6030', '#6a3e18');
      bearHead(p, 13.5, 13, 2.2, '#c8c0b8', '#a8a098');
    },
    pequeno(p) { // small: a little bear cub in colour beside a big grey one (the little one is the answer)
      bearHead(p, 6, 8, 6, '#d8d0c8', '#b8b0a8', true);
      bearHead(p, 13, 12.5, 2.8, '#b87838', '#7a4a20');
    },
    oso(p, w) { // a brown bear's head: round ears, a pale muzzle, a black nose (w.n 's': a cub, smaller and lighter)
      if (w && w.n === 's') { bearHead(p, 8, 9, 4.6, '#b87838', '#8a5420'); return; }
      bearHead(p, 8, 8.5, 6.6, '#9a6030', '#6a3e18');
    },
    ardilla(p) { // a squirrel sitting up: a big curly bushy tail behind, holding an acorn
      p.ell(4.5, 6, 4, 5.5, '#c0662a'); p.ell(4, 4, 2.6, 3.4, '#e08a40'); p.ell(5, 11, 3, 3, '#c0662a');
      p.ell(10, 11, 3.4, 4, '#d0782e'); p.ell(10.5, 12, 2, 2.6, '#f8e0b8');
      p.disc(11, 5.5, 3, '#d0782e'); p.put(9, 2, '#d0782e'); p.put(9, 1, '#a04a18'); p.put(12, 2, '#d0782e'); p.put(12, 1, '#a04a18');
      p.put(12, 5, '#101010'); p.put(14, 6, '#402018'); p.ell(12.5, 6.8, 1.4, 0.9, '#f8e0b8');
      p.disc(12.5, 9.5, 1.3, '#8a5018'); p.rect(12, 8, 2, 1, '#5a3818');
      p.rect(8, 15, 2, 1, '#a04a18'); p.rect(11, 15, 2, 1, '#a04a18');
    },
    mapache(p) { // a raccoon's face: grey, a black bandit mask, white brows and muzzle, round ears
      p.disc(3.5, 3.5, 2.2, '#5a5a62'); p.disc(12.5, 3.5, 2.2, '#5a5a62'); p.put(3, 3, '#e8e0d8'); p.put(12, 3, '#e8e0d8');
      p.ell(8, 9, 7, 6, '#8a8a92'); p.shade(8, 9, 7, '#6a6a72');
      p.ell(8, 6.5, 5, 1.2, '#f4f0ea'); p.ell(5, 9, 2.6, 1.8, '#202028'); p.ell(11, 9, 2.6, 1.8, '#202028'); p.rect(5, 8.5, 6, 1, '#202028');
      p.put(5, 9, '#ffffff'); p.put(11, 9, '#ffffff'); p.ell(8, 12.5, 3, 2.2, '#f4f0ea'); p.rect(7, 11, 2, 1, '#101010');
    },
    venado(p) { // a deer's head: big ears, little antlers, a white-spotted brown face
      for (const [x, y] of [[4, 4], [3, 3], [2, 1], [4, 2], [5, 1], [12, 4], [13, 3], [14, 1], [12, 2], [11, 1]]) p.put(x, y, '#7a5028');
      p.ell(3.5, 7, 2.6, 1.4, '#b87838'); p.ell(12.5, 7, 2.6, 1.4, '#b87838'); p.put(3, 7, '#f0c8a0'); p.put(12, 7, '#f0c8a0');
      p.ell(8, 8.5, 3.8, 4.2, '#c08040'); p.ell(8, 12.5, 2.6, 2.6, '#c08040'); p.shade(8, 8.5, 3.8, '#9a6028');
      p.put(6, 8, '#101010'); p.put(10, 8, '#101010'); p.put(6, 7, '#ffffff'); p.ell(8, 13.5, 1.6, 1, '#302018'); p.put(8, 5, '#f8e8c8'); p.put(7, 11, '#f0d8b0'); p.put(9, 11, '#f0d8b0');
    },
    zorro(p) { // a fox's face: orange, pointed ears, a white cheek ruff, a little black nose
      p.tri(1, 1, 6, 4, 2, 8, '#e06a20'); p.tri(15, 1, 10, 4, 14, 8, '#e06a20'); p.tri(2, 2.5, 4.5, 4.5, 2.6, 6.5, '#401810'); p.tri(14, 2.5, 11.5, 4.5, 13.4, 6.5, '#401810');
      p.ell(8, 8, 6, 4.4, '#e87a28'); p.tri(2, 8, 14, 8, 8, 15, '#e87a28');
      p.tri(2, 9, 7.5, 10, 8, 15, '#fff4e8'); p.tri(14, 9, 8.5, 10, 8, 15, '#fff4e8');
      p.put(5, 7, '#101010'); p.put(11, 7, '#101010'); p.put(5, 6, '#f8c060'); p.disc(8, 14, 1, '#101010');
    },
    erizo(p) { // a hedgehog: a round spiky brown back, a little pointed face, a black nose
      for (let a = Math.PI * 0.95; a <= Math.PI * 2.05; a += 0.22) for (let r = 4; r <= 7.4; r += 0.6) p.put(7 + Math.cos(a) * r, 11 + Math.sin(a) * r * 0.95, r > 6.6 ? '#4a3018' : '#7a5530');
      p.ell(7, 11.5, 5.8, 3.8, '#6a4826');
      for (const [x, y] of [[4, 7], [7, 6], [10, 7], [5, 9], [9, 9]]) p.put(x, y, '#c8a070');
      p.ell(12, 12.5, 3, 2.4, '#e8c8a0'); p.tri(13, 11, 13, 14, 16, 13, '#e8c8a0'); p.put(15, 13, '#101010'); p.put(12, 11, '#101010');
      p.rect(4, 15, 2, 1, '#8a6040'); p.rect(9, 15, 2, 1, '#8a6040');
    },
    buho(p) { // an owl: big round eyes, ear tufts, brown feathers with a pale chest, on a branch
      p.tri(2.5, 1, 5.5, 4, 2.5, 5, '#7a5028'); p.tri(13.5, 1, 10.5, 4, 13.5, 5, '#7a5028');
      p.ell(8, 8.5, 6, 6.5, '#9a6a38'); p.shade(8, 8.5, 6, '#7a4e24'); p.ell(8, 11, 3.6, 3.4, '#e8d0a0');
      for (const [x, y] of [[7, 10], [9, 11], [7, 12], [9, 13]]) p.put(x, y, '#b08858');
      p.disc(5.3, 6.5, 2.5, '#fff4d0'); p.disc(10.7, 6.5, 2.5, '#fff4d0'); p.disc(5.3, 6.5, 1.4, '#f8b020'); p.disc(10.7, 6.5, 1.4, '#f8b020');
      p.put(5, 6, '#101010'); p.put(10, 6, '#101010'); p.tri(7, 8, 9, 8, 8, 10, '#e89020');
      p.rect(0, 15, 16, 1, '#6a4020'); p.put(5, 14, '#e89020'); p.put(10, 14, '#e89020');
    },
    luciernaga(p) { // a firefly: a little black-and-red beetle with see-through wings and a glowing yellow tail
      p.disc(8, 11, 4.6, '#f8f080'); p.disc(8, 11.5, 3.4, '#fff8b0');
      p.ell(4.5, 6, 3, 2, '#d8f0ff'); p.ell(11.5, 6, 3, 2, '#d8f0ff');
      p.ell(8, 7, 2.2, 3.6, '#302830'); p.disc(8, 3, 1.8, '#e04030'); p.put(7, 3, '#101010'); p.put(9, 3, '#101010');
      p.put(6, 0, '#302830'); p.put(7, 1, '#302830'); p.put(10, 0, '#302830'); p.put(9, 1, '#302830');
      p.disc(8, 11.5, 2, '#f8e020'); p.put(8, 11, '#ffffff');
    },
    // ---- El parque de juegos (content/es/zone-juegos.js): action words (a kid doing it), the playground, its critters ----
    corre(p) { // a kid running to the right, arms pumping, speed lines behind
      rows(p, 0, 1, ['.........HHH....', '........HHHHH...', '........HSSSH...', '.........SSS..S.', '.......RRRRR.S..', '..WW..SRRRRRS...', '.....S..RRR.....', '.WWW.....RRR....', '.........BBBB...', '........BB..BB..', '..WW...BB....BB.', '......BB......K.', '.....KK.......K.'], KID);
    },
    sube(p) { // a kid climbing a ladder, seen from behind, a green arrow up
      p.rect(2, 0, 1, 16, '#a86838'); p.rect(9, 0, 1, 16, '#a86838'); for (let y = 2; y < 16; y += 3) p.rect(3, y, 6, 1, '#c88850');
      rows(p, 2, 3, ['.S.....S', '.SHHHHS.', '..HHHH..', '..RRRR..', '..RRRR..', '..BBBB..', '..B..B..', '.KK..KK.'], KID);
      p.tri(11, 6, 16, 6, 13.5, 1, '#38b048'); p.rect(12.5, 6, 2, 6, '#38b048');
    },
    baja(p) { // a kid whooshing down a slide, arms up, a red arrow down
      for (let x = 0; x < 13; x++) { const y = 3 + Math.round(x * 0.85); p.rect(x, y, 1, 3, '#f8c830'); p.put(x, y + 3, '#d89a18'); }
      rows(p, 3, 1, ['S...S..', 'S.HH.S.', '.HHHHS.', '.HSSH..', '.RRRR..', 'RRRRBBB', '....BBK'], KID);
      p.rect(13, 3, 2, 6, '#e04040'); p.tri(11, 9, 16, 9, 13.5, 14, '#e04040');
    },
    empuja(p) { // a kid leaning into a big box, pushing it, motion lines
      p.rect(9, 5, 7, 9, '#c08040'); p.rect(9, 5, 7, 1, '#e0a860'); p.rect(12, 5, 1, 9, '#a06030'); p.rect(9, 9, 7, 1, '#a06030');
      rows(p, 0, 3, ['..HHH....', '.HHHHH...', '.HSSSH...', '..SSS....', '.RRRRRSSS', 'RRRRRR...', '..RRR....', '..BBBB...', '.BB..BB..', 'KK....BB.', '.......KK'], KID);
      p.put(15, 3, '#ffffff'); p.put(14, 2, '#ffffff');
    },
    lanza(p) { // a kid throwing a ball up and away, the ball flying off along a dotted arc
      rows(p, 1, 3, ['S.........', 'SHHH......', '.HHHHH....', '.HSSSH....', '..SSS.....', '.RRRRRS...', 'RRRRR..S..', '..RRR.....', '..BBBB....', '.BB..BB...', 'KK....KK..'], KID);
      for (const [x, y] of [[4, 1], [7, 0], [10, 1]]) p.put(x, y, '#ffffff');
      p.disc(13, 4, 2.2, '#e04040'); p.put(12, 3, '#ffffff');
    },
    atrapa(p) { // a kid from the front, both arms up, a ball dropping into the hands
      p.disc(8, 2.5, 2.2, '#e04040'); p.put(7, 2, '#ffffff'); p.put(4, 1, '#f8f080'); p.put(12, 1, '#f8f080');
      rows(p, 3, 5, ['.S....S...', '.S.HH.S...', '..SHHHS...', '..HSSH....', '..RRRR....', '.RRRRRR...', '..RRRR....', '..BBBB....', '..B..B....', '.KK..KK...'], KID);
    },
    baila(p) { // a kid dancing: arms up in a V, one leg kicked out, music notes
      rows(p, 3, 1, ['S.......S.', '.S.HHH.S..', '..SHHHHS..', '...HSSH...', '....SS....', '...RRRR...', '...RRRR...', '...RRRR...', '...BBBB...', '...B..BB..', '..BB...BB.', '..K.....KK', '.KK.......'], KID);
      for (const [x, y] of [[1, 9], [14, 4]]) { p.rect(x, y, 1, 3, '#7a3ac0'); p.put(x - 1, y + 3, '#7a3ac0'); p.put(x, y + 3, '#7a3ac0'); p.put(x + 1, y, '#7a3ac0'); }
    },
    rapido(p) { // fast: a red race car whooshing, speed lines
      p.rect(4, 7, 11, 4, '#e03030'); p.rect(7, 5, 5, 2, '#e03030'); p.rect(8, 5, 3, 2, '#88d0f8'); p.rect(4, 7, 11, 1, '#f86060'); p.rect(14, 8, 1, 2, '#f8e060');
      p.disc(6.5, 11.5, 1.8, '#303040'); p.disc(12.5, 11.5, 1.8, '#303040'); p.put(6, 11, '#c0c0d0'); p.put(12, 11, '#c0c0d0');
      for (const [x, y, w] of [[0, 6, 3], [0, 9, 3], [1, 12, 2]]) p.rect(x, y, w, 1, '#ffffff');
    },
    despacio(p) { // slowly: a snail with a long trail behind it
      p.rect(0, 13, 6, 1, '#c8e0f0'); p.ell(10, 12.5, 5, 1.6, '#c8a878');
      p.disc(10, 8.5, 3.8, '#c07838'); p.disc(10, 8.5, 2.4, '#e09850'); p.disc(10, 8.5, 1, '#a05828');
      p.rect(14, 8, 1, 4, '#c8a878'); p.put(14, 7, '#c8a878'); p.put(15, 6, '#303040'); p.put(13, 6, '#303040');
    },
    columpio(p) { // a swing: the red frame, two chains, a blue seat
      p.rect(0, 1, 16, 2, '#e04040'); p.tri(0, 15, 3, 15, 2, 2, '#e04040'); p.tri(13, 15, 16, 15, 14, 2, '#e04040');
      p.rect(6, 3, 1, 9, '#a0a0b0'); p.rect(10, 3, 1, 9, '#a0a0b0');
      p.rect(5, 12, 7, 2, '#3870d8'); p.rect(5, 12, 7, 1, '#78a8f0');
    },
    resbaladilla(p) { // a slide: a ladder up to the top, a yellow chute down to the right
      p.rect(1, 3, 1, 13, '#a0a0b0'); p.rect(4, 3, 1, 13, '#a0a0b0'); for (let y = 5; y < 16; y += 3) p.rect(2, y, 2, 1, '#a0a0b0');
      p.rect(1, 2, 6, 2, '#3870d8');
      for (let x = 5; x < 16; x++) { const y = 3 + Math.round((x - 5) * 1.05); p.rect(x, y, 1, 2, '#f8c830'); p.put(x, y + 2, '#d89a18'); }
    },
    subibaja(p) { // a seesaw: a plank on a red stand, one end up, one end down
      p.tri(5, 15, 11, 15, 8, 9, '#e04040');
      for (let x = 0; x < 16; x++) { const y = 4 + Math.round(x * 0.62); p.rect(x, y, 1, 2, '#f8c830'); }
      p.rect(1, 2, 1, 3, '#3870d8'); p.rect(14, 10, 1, 3, '#3870d8');
    },
    papalote(p) { // a kite: a diamond in four colours, a string, a tail of bows
      p.tri(8, 0, 2, 6, 8, 6, '#e04040'); p.tri(8, 0, 14, 6, 8, 6, '#f8c830'); p.tri(2, 6, 8, 12, 8, 6, '#3870d8'); p.tri(14, 6, 8, 12, 8, 6, '#38a858');
      for (const [x, y] of [[8, 13], [7, 14], [6, 15]]) p.put(x, y, '#806040');
      p.rect(9, 13, 2, 1, '#e04040'); p.rect(4, 15, 2, 1, '#f8c830');
    },
    burbujas(p) { // bubbles: three see-through rainbow rings with a shine
      for (const [x, y, r] of [[5, 10, 4.2], [11.5, 5, 3.4], [12, 12.5, 2.4]]) { p.disc(x, y, r, '#a8e0f8'); p.disc(x, y, r - 1, '#e0f6ff'); p.put(x - r * 0.4, y - r * 0.4, '#ffffff'); p.put(x + r * 0.5, y + r * 0.3, '#f8a8e0'); }
    },
    cuerda(p) { // a jump rope swinging over: a thin yellow rope from two wooden handles
      for (let a = Math.PI; a < Math.PI * 2; a += 0.04) p.put(8 + Math.cos(a) * 6, 13 + Math.sin(a) * 11, '#f0b020');
      p.tri(0, 15, 3, 15, 2, 11, '#a86838'); p.tri(13, 15, 16, 15, 14, 11, '#a86838'); p.put(1, 14, '#e04040'); p.put(14, 14, '#e04040');
    },
    paloma(p) { // a pigeon: grey, a shiny green-purple neck, dark bars on its wing, pink feet
      p.ell(7.5, 9.5, 5.5, 3.6, '#a8acc0'); p.ell(12, 6, 2.4, 2.6, '#9098b0'); p.rect(10, 7, 3, 2, '#68a888'); p.put(11, 8, '#8868b0');
      p.put(13, 5, '#f07020'); p.rect(14, 6, 2, 1, '#e8d0c0'); p.put(12, 5, '#101010');
      p.rect(4, 8, 5, 1, '#606478'); p.rect(4, 10, 5, 1, '#606478'); p.tri(0, 8, 3, 9, 3, 11, '#707488');
      p.rect(7, 13, 1, 2, '#f08090'); p.rect(9, 13, 1, 2, '#f08090');
    },
    catarina(p) { // a ladybug from above: a red shell with black dots, a black head
      p.disc(8, 9, 6, '#e02828'); p.rect(7.5, 3, 1, 12, '#202020'); p.disc(8, 3.5, 2.6, '#202020');
      for (const [x, y] of [[5, 7], [11, 7], [4.5, 11], [11.5, 11], [7, 13], [9, 13]]) p.disc(x, y, 1, '#202020');
      p.put(7, 3, '#ffffff'); p.put(9, 3, '#ffffff'); p.put(5, 6, '#f87070'); p.put(6, 0, '#202020'); p.put(10, 0, '#202020');
    },
    hormiga(p) { // an ant: three round parts with gaps between, six thin legs, feelers
      p.disc(3, 9, 2.3, '#4a2418'); p.disc(7.5, 9, 1.6, '#4a2418'); p.ell(12.5, 9.5, 3.2, 2.5, '#4a2418');
      p.put(2, 8, '#a86048'); p.put(12, 8, '#a86048'); p.put(11, 8, '#a86048');
      for (const [x, d] of [[6, -1], [8, 1], [10, 1]]) { p.put(x, 11, '#4a2418'); p.put(x + d, 12, '#4a2418'); p.put(x + d, 13, '#4a2418'); p.put(x, 7, '#4a2418'); p.put(x + d, 6, '#4a2418'); }
      p.put(1, 6, '#4a2418'); p.put(0, 5, '#4a2418'); p.put(3, 6, '#4a2418'); p.put(3, 5, '#4a2418'); p.put(2, 9, '#ffffff');
    },
    abeja(p) { // a bee: yellow and black stripes, clear wings, a little stinger
      p.ell(4.5, 4.5, 3, 2.5, '#e0f4ff'); p.ell(9.5, 4, 3, 2.5, '#e0f4ff');
      p.ell(8, 10, 6, 4, '#f8c820'); for (const x of [6, 9, 12]) p.rect(x, 6, 1.6, 8, '#302020');
      p.disc(2.5, 10, 2, '#302020'); p.put(2, 9, '#ffffff'); p.put(14.5, 10, '#302020'); p.put(15, 10, '#302020');
    },
    lagartija(p) { // a little lizard from above: a long tail curling, four splayed legs
      p.ell(11, 5, 2.4, 2.2, '#78b040'); p.ell(8.5, 8.5, 2.2, 3.2, '#78b040');
      for (const [x, y] of [[6.5, 11], [6, 12.5], [5, 13.5], [3.5, 14.2], [2, 14], [1, 13]]) p.disc(x, y, x > 4 ? 1.2 : 0.8, '#68a038');
      p.rect(5, 6, 2, 1, '#68a038'); p.rect(4, 5, 1, 1, '#68a038'); p.rect(10, 9, 2, 1, '#68a038'); p.rect(12, 10, 1, 1, '#68a038');
      p.rect(5, 10, 2, 1, '#68a038'); p.rect(10, 7, 2, 1, '#68a038'); p.put(12, 4, '#101010'); p.put(10, 4, '#101010'); p.put(8, 8, '#a8d870');
    },
    lombriz(p) { // a worm wriggling out of the earth
      p.ell(8, 14, 7, 2, '#7a4a20'); p.ell(8, 13.5, 4, 1, '#4a2a10');
      for (const [x, y] of [[7, 13], [6.5, 11.5], [7, 10], [8.5, 9], [9.5, 7.5], [9, 6], [7.5, 5]]) p.disc(x, y, 1.6, '#f08898');
      for (const [x, y] of [[6, 11], [9, 8], [8, 6]]) p.put(x, y, '#d06878'); p.put(7, 4, '#101010');
    },
    grillo(p) { // a green cricket: a long body, a big bent jumping leg, long feelers
      p.ell(8, 10, 5.5, 2.2, '#58a038'); p.ell(13, 9.5, 2, 2, '#68b848'); p.put(14, 9, '#101010');
      p.tri(2, 10, 9, 10, 6, 5, '#3a7a28'); p.rect(2, 11, 1, 3, '#3a7a28'); p.rect(1, 13, 2, 1, '#3a7a28');
      p.rect(10, 12, 1, 2, '#3a7a28'); p.rect(12, 12, 1, 2, '#3a7a28');
      for (let i = 0; i < 7; i++) p.put(14 - i * 0.2, 8 - i, '#3a7a28'); for (let i = 0; i < 6; i++) p.put(15, 8 - i * 1.2, '#3a7a28');
    },
    colibri(p) { // a hummingbird hovering: a little green body, a red throat, a long needle beak, blurred wings up
      p.ell(6, 4, 3.4, 3, '#d8f4ff'); p.ell(6, 4, 1.8, 1.6, '#ffffff');
      p.ell(7, 9.5, 3, 2.4, '#38b068'); p.tri(2, 13, 5, 10, 5, 13, '#287048');
      p.disc(10, 7.5, 2, '#48c880'); p.rect(9, 9, 2, 2, '#e02848'); p.put(10, 7, '#101010'); p.rect(12, 8, 4, 1, '#302020');
    },
    // ---- La casa de los abuelos (content/es/zone-abuelos.js): the family, the body, clothes, the grandparents' animals ----
    abuela(p) { // grandma: a grey bun, round glasses, rosy cheeks, a smile, a pink shawl
      p.ell(8, 15, 7, 3, '#d05080'); p.disc(8, 2.5, 2.4, '#d8d8e0');
      p.disc(8, 8.5, 5.6, '#d8d8e0'); p.ell(8, 9.5, 4.6, 4.6, SKIN); p.rect(3, 5, 10, 2, '#d8d8e0');
      for (const x of [5.5, 10.5]) { p.disc(x, 9, 1.8, '#f8f8ff'); p.put(x - 0.5, 9, '#302018'); }
      p.rect(7, 9, 2, 1, '#806060'); p.rect(4, 11, 1, 1, '#f09090'); p.rect(11, 11, 1, 1, '#f09090'); p.rect(6, 12, 4, 1, '#a04040');
    },
    abuelo(p) { // grandpa: a straw hat, white hair at the sides, glasses, a big white moustache
      p.ell(8, 15, 7, 3, '#4a7ab0'); p.ell(8, 9.5, 4.8, 5, SKIN); p.rect(3, 7, 2, 4, '#e8e8f0'); p.rect(11, 7, 2, 4, '#e8e8f0');
      p.ell(8, 4.5, 7.5, 1.5, '#e8c870'); p.ell(8, 3, 4, 2.6, '#e8c870'); p.rect(4, 4, 8, 1, '#a07030');
      for (const x of [5.5, 10.5]) { p.disc(x, 8.5, 1.7, '#f8f8ff'); p.put(x - 0.5, 8.5, '#302018'); }
      p.ell(8, 11.5, 3.6, 1.3, '#f0f0f8'); p.put(8, 10, '#d8a078'); p.rect(7, 13, 2, 1, '#a04040');
    },
    bebe(p) { // a baby: a big round head with one curl, rosy cheeks, a pacifier, a yellow blanket
      p.ell(8, 14, 6.5, 3, '#f8e070'); p.disc(8, 8, 5.6, SKIN); p.shade(8, 8, 5.6, SKIN2);
      p.put(8, 2, '#a05a28'); p.put(9, 1, '#a05a28'); p.put(9, 2, '#a05a28');
      p.rect(5, 7, 1, 1, '#302018'); p.rect(10, 7, 1, 1, '#302018'); p.rect(4, 9, 1, 1, '#f09090'); p.rect(11, 9, 1, 1, '#f09090');
      p.disc(8, 10.5, 1.6, '#f878b8'); p.put(8, 10, '#ffffff');
    },
    familia(p) { // the family: grandpa, grandma, a child and the baby, side by side, a heart over them
      const head = (x, y, r, hair) => { p.disc(x, y, r, SKIN); p.rect(x - r + 0.5, y - r, 2 * r - 1, 1, hair); };
      head(3, 8, 2.4, '#e8e8f0'); head(13, 8, 2.4, '#d8d8e0'); head(6.5, 11, 2, '#5a3418'); head(10, 12, 1.6, '#a05a28');
      p.rect(1, 11, 5, 5, '#4a7ab0'); p.rect(11, 11, 5, 5, '#d05080'); p.rect(5, 13, 3, 3, '#38a858'); p.rect(9, 14, 2, 2, '#f8e070');
      p.disc(7, 2, 1.3, '#f05080'); p.disc(9, 2, 1.3, '#f05080'); p.tri(5.6, 2.5, 10.4, 2.5, 8, 5.5, '#f05080');
    },
    cabeza(p) { // the head: a child's head, both hands on top of it
      p.disc(8, 9, 5.5, SKIN); p.ell(8, 5, 5.5, 2.4, '#5a3418');
      p.rect(5, 9, 1, 1, '#302018'); p.rect(10, 9, 1, 1, '#302018'); p.rect(6, 12, 4, 1, '#a04040');
      for (const x of [3, 10]) { p.ell(x + 1.5, 2.5, 2.2, 1.6, SKIN); p.rect(x, 1, 1, 2, SKIN2); }
    },
    ojos(p) { // the eyes: two big eyes, brown, with a shine and lashes
      for (const x of [4.5, 11.5]) { p.ell(x, 8.5, 3.6, 3, '#ffffff'); p.disc(x, 8.5, 2, '#7a4a20'); p.disc(x, 8.5, 1, '#101010'); p.put(x - 1, 7.5, '#ffffff'); p.rect(x - 3, 4, 6, 1, '#5a3418'); }
      p.put(1, 6, '#302018'); p.put(14, 6, '#302018');
    },
    nariz(p) { // the nose: a face seen from the side, a round nose standing out
      p.ell(6, 8, 6, 7, SKIN); p.ell(12, 8.5, 2.8, 2.4, SKIN); p.shade(12, 8.5, 2.8, SKIN2); p.put(12, 10, '#a06048');
      p.rect(7, 5, 2, 1, '#302018'); p.rect(9, 13, 3, 1, '#a04040'); p.ell(4, 2, 4, 2, '#5a3418');
    },
    boca(p) { // the mouth: a big smile, red lips, white teeth, a pink tongue
      p.ell(8, 8, 7, 4.5, '#d84050'); p.ell(8, 7.4, 5.8, 3, '#701820'); p.rect(4, 5, 8, 2, '#ffffff'); p.ell(8, 9.5, 3, 1.4, '#f07888');
      p.rect(2, 7, 1, 1, '#f07080'); p.rect(13, 7, 1, 1, '#f07080');
    },
    mano(p) { hand(p, false); },
    pie(p) { // a bare foot from above: the sole, five round toes
      p.ell(8, 10.5, 4, 5, SKIN); p.ell(8, 6, 4.4, 2.6, SKIN);
      for (const [x, y, r] of [[4.5, 3, 1.5], [7, 2, 1.3], [9.3, 2, 1.2], [11.3, 2.7, 1.1], [13, 4, 1]]) p.disc(x, y, r, SKIN);
      p.shade(8, 10.5, 5, SKIN2);
    },
    camisa(p, w) { // a shirt: short sleeves, a collar, buttons (its colour from w.col: the trunk's)
      const c = (w && w.col) || '#e04040', d = G.shade(c, 0.75);
      p.rect(4, 3, 8, 12, c); p.tri(0, 6, 4, 2, 4, 8, c); p.tri(16, 6, 12, 2, 12, 8, c); p.rect(0, 6, 2, 3, d); p.rect(14, 6, 2, 3, d);
      p.tri(6, 2, 8, 2, 8, 5, '#ffffff'); p.tri(10, 2, 8, 2, 8, 5, '#ffffff'); for (const y of [6, 9, 12]) p.put(8, y, '#f8f0d0');
    },
    pantalon(p, w) { // trousers: a waistband, two long legs
      const c = (w && w.col) || '#3870d8', d = G.shade(c, 0.75);
      p.rect(3, 1, 10, 3, c); p.rect(3, 1, 10, 1, d); p.rect(3, 4, 4, 11, c); p.rect(9, 4, 4, 11, c); p.rect(7, 4, 2, 2, c);
      p.rect(7, 6, 2, 9, null); p.rect(3, 14, 4, 1, d); p.rect(9, 14, 4, 1, d); p.put(8, 2, '#f8d040');
    },
    calcetines(p, w) { // a pair of striped socks
      const c = (w && w.col) || '#f878b8';
      for (const ox of [0, 7]) { p.rect(ox + 2, 1, 4, 9, '#ffffff'); p.ell(ox + 4.5, 12, 3.5, 2.5, '#ffffff'); p.rect(ox + 2, 9, 4, 3, '#ffffff'); for (const y of [2, 5, 8]) p.rect(ox + 2, y, 4, 1, c); p.ell(ox + 6, 12.5, 1.6, 1.6, c); }
    },
    vestido(p, w) { // a dress: thin straps, a bow at the waist, a wide twirly skirt
      const c = (w && w.col) || '#e060a0', d = G.shade(c, 0.75);
      p.rect(5, 2, 6, 5, c); p.rect(5, 0, 1, 2, c); p.rect(10, 0, 1, 2, c); p.tri(1, 15, 15, 15, 8, 6, c); p.rect(5, 7, 6, 3, c);
      p.rect(4, 7, 8, 1, '#ffffff'); p.put(8, 7, '#f8d040'); for (const x of [3, 8, 13]) p.put(x, 15, d);
    },
    zapatos(p, w) { // a pair of shoes, side by side, laces
      const c = (w && w.col) || '#a05a28', d = G.shade(c, 0.7);
      for (const [ox, oy] of [[0, 3], [7, 7]]) { p.ell(ox + 4.5, oy + 5, 4.5, 2.6, c); p.rect(ox + 1, oy + 1, 4, 4, c); p.rect(ox, oy + 7, 9, 1, d); p.put(ox + 3, oy + 2, '#ffffff'); p.put(ox + 4, oy + 3, '#ffffff'); }
    },
    sombrero(p, w) { // a wide straw hat with a ribbon
      const c = (w && w.col) || '#e8c870', d = G.shade(c, 0.78);
      p.ell(8, 11, 8, 3, c); p.ell(8, 7, 4.2, 4.5, c); p.rect(4, 8, 8, 2, '#e04040'); p.ell(8, 11.5, 6, 1.4, d); p.put(6, 4, G.shade(c, 1.15));
    },
    chamarra(p, w) { // a jacket: long sleeves, a hood, a zip down the front, pockets
      const c = (w && w.col) || '#38a858', d = G.shade(c, 0.72);
      p.rect(4, 3, 8, 12, c); p.rect(1, 4, 3, 10, c); p.rect(12, 4, 3, 10, c); p.ell(8, 2.5, 3.5, 2.2, d);
      p.rect(7.5, 4, 1, 11, '#d8d8e0'); p.rect(5, 11, 2, 2, d); p.rect(9, 11, 2, 2, d); p.rect(1, 13, 3, 1, d); p.rect(12, 13, 3, 1, d);
    },
    vaca(p) { // a cow: white with black patches, a pink nose, little horns
      p.ell(8, 9, 6.5, 6.5, '#f8f8f4'); p.ell(4.5, 6, 2.5, 2.4, '#202028'); p.ell(12, 12, 2, 2.4, '#202028');
      p.rect(3, 1, 2, 2, '#f0e0c0'); p.rect(11, 1, 2, 2, '#f0e0c0'); p.ell(1, 5, 1.5, 1, '#202028'); p.ell(15, 5, 1.5, 1, '#202028');
      p.ell(8, 12.5, 4, 2.5, '#f8a8b8'); p.put(6, 12, '#a04060'); p.put(10, 12, '#a04060'); p.rect(5, 7, 1, 1, '#101010'); p.rect(10, 7, 1, 1, '#101010');
    },
    cerdo(p) { // a pig: a round pink face, floppy ears, a big snout
      p.disc(8, 9, 6.5, '#f8a8b8'); p.shade(8, 9, 6.5, '#e08898'); p.tri(2, 2, 6, 3, 3, 7, '#f08898'); p.tri(14, 2, 10, 3, 13, 7, '#f08898');
      p.ell(8, 11, 3, 2.2, '#f87890'); p.put(7, 11, '#802838'); p.put(9, 11, '#802838'); p.rect(5, 7, 1, 1, '#101010'); p.rect(10, 7, 1, 1, '#101010');
    },
    oveja(p) { // a sheep: a fluffy white cloud of wool, a black face, black legs
      for (const [x, y] of [[4, 6], [8, 5], [12, 6], [3, 9], [8, 9], [13, 9], [6, 11], [10, 11]]) p.disc(x, y, 2.8, '#f8f8f0');
      p.rect(3, 12, 1, 3, '#202028'); p.rect(6, 13, 1, 2, '#202028'); p.rect(10, 13, 1, 2, '#202028'); p.rect(12, 12, 1, 3, '#202028');
      p.ell(13, 7, 2.2, 2.6, '#302830'); p.put(14, 6, '#ffffff'); p.rect(14, 4, 2, 1, '#302830');
    },
    burro(p) { // a donkey's head: long grey ears, a pale muzzle, a dark mane
      p.ell(8, 9.5, 4.5, 5.5, '#9a98a8'); p.ell(8, 12.5, 3.6, 2.6, '#e0dcd8'); p.ell(5, 3, 1.4, 3.5, '#9a98a8'); p.ell(11, 3, 1.4, 3.5, '#9a98a8');
      p.put(5, 2, '#404050'); p.put(11, 2, '#404050'); p.rect(7, 4, 2, 3, '#404050'); p.rect(6, 8, 1, 1, '#101010'); p.rect(10, 8, 1, 1, '#101010'); p.put(7, 13, '#606070'); p.put(9, 13, '#606070');
    },
    pavo(p) { // a turkey: its tail fanned out like a rainbow of brown and orange, a red wattle
      for (const [r, c] of [[7.5, '#8a4a20'], [6, '#e08830'], [4.5, '#a85a28']]) p.ell(8, 9, r, r * 0.95, c);
      p.ell(8, 11, 3.2, 3.5, '#5a3418'); p.disc(8, 6.5, 1.8, '#c8b0a0'); p.put(9, 6, '#101010'); p.rect(9, 7, 1, 3, '#e02828'); p.put(10, 7, '#f8a020');
      p.rect(6, 14, 1, 2, '#f8a020'); p.rect(9, 14, 1, 2, '#f8a020');
    },
    raton(p) { // a mouse: grey, big round pink ears, a long tail curling
      p.ell(8, 11, 5, 3.5, '#a8a8b8'); p.disc(12, 9, 2.6, '#a8a8b8'); p.disc(10.5, 5.5, 2.4, '#a8a8b8'); p.disc(10.5, 5.5, 1.3, '#f8a8b8');
      p.put(13, 8, '#101010'); p.put(15, 9, '#f87890'); for (let a = 0; a < 3.2; a += 0.25) p.put(3 - Math.sin(a) * 2.5, 12 - a * 1.6, '#f8a8b8');
    },
    gallo(p) { // a rooster: a big red comb, a golden neck, a tall tail of green and black feathers
      p.ell(8, 10, 4.5, 3.6, '#c86a28'); p.ell(11, 6, 2.2, 3, '#f0b040'); p.rect(10, 2, 3, 2, '#e02828'); p.put(11, 1, '#e02828');
      p.put(13, 5, '#f8c020'); p.put(14, 5, '#f8c020'); p.put(11, 5, '#101010'); p.rect(12, 7, 1, 2, '#e02828');
      p.tri(0, 2, 6, 9, 3, 11, '#287048'); p.tri(1, 5, 6, 10, 2, 12, '#202028'); p.rect(7, 13, 1, 3, '#f8a020'); p.rect(9, 13, 1, 3, '#f8a020');
    },
    tlacuache(p) { // a possum: a grey body, a white pointy face, a pink nose, round dark ears, a long bare tail
      p.ell(6.5, 10, 5, 3.4, '#8a8a98'); p.ell(12.5, 9, 2.6, 2, '#f0f0f0'); p.put(15, 9, '#f87890'); p.put(13, 8, '#101010');
      p.disc(11.5, 6.5, 1.3, '#303038'); p.rect(3, 13, 1, 2, '#f0a0b0'); p.rect(9, 13, 1, 2, '#f0a0b0');
      for (let a = 0; a < 3; a += 0.2) p.put(1.5 - Math.sin(a) * 1.4, 10 - a * 2, '#f0a0b0');
    },
    // things at the grandparents' with no word of their own (a picture only)
    camara(p) { // the camera for the family photo: black, a big lens, a flash
      p.rect(1, 5, 14, 9, '#303038'); p.rect(4, 3, 4, 2, '#303038'); p.rect(11, 3, 3, 2, '#f8f8f0'); p.disc(8, 9.5, 3.4, '#606070'); p.disc(8, 9.5, 2.2, '#68a8e8'); p.put(7, 8, '#ffffff'); p.rect(1, 5, 14, 1, '#505060');
    },
    foto(p) { // the family photo in a wooden frame: everyone and the dog, smiling
      p.rect(0, 1, 16, 14, '#a06a34'); p.rect(2, 3, 12, 10, '#a8e0f8'); p.rect(2, 10, 12, 3, '#78c058');
      for (const [x, c, h] of [[4, '#e8e8f0', 5], [7, '#5a3418', 7], [10, '#d8d8e0', 5]]) { p.disc(x, h, 1.4, SKIN); p.put(x, h - 1, c); p.rect(x - 1, h + 1, 3, 4, ['#4a7ab0', '#e04040', '#d05080'][(x - 4) / 3]); }
      p.ell(12, 11, 1.6, 1.2, BROWN);
    },
    espejo(p) { // a mirror: an oval glass in a gold frame, a shine across it
      p.ell(8, 8, 6, 7.5, '#e8b030'); p.ell(8, 8, 4.6, 6.2, '#c8e8f8'); p.rect(5, 4, 1, 3, '#ffffff'); p.put(6, 3, '#ffffff'); p.rect(7, 15, 2, 1, '#a07418');
    },
    zanahoria(p) { // a carrot pulled out of the garden: orange, green feathery top
      p.tri(3.5, 6, 12.5, 6, 8, 16.5, '#f08828'); p.ell(8, 6.5, 4.5, 2, '#f08828'); p.rect(5, 6, 2, 3, '#f8a850');
      for (const [x, y, w] of [[8, 8, 3], [6, 10, 2], [9, 12, 2], [7, 14, 1]]) p.rect(x, y, w, 1, '#c86010');
      for (const [x, y, c] of [[5, 0, '#38a838'], [6, 1, '#38a838'], [7, 2, '#38a838'], [7, 3, '#38a838'], [4, 2, '#58c048'], [5, 3, '#58c048'], [8, 0, '#58c048'], [8, 1, '#58c048'], [8, 2, '#58c048'], [8, 3, '#2e8a2e'], [8, 4, '#2e8a2e'], [11, 0, '#2e8a2e'], [10, 1, '#2e8a2e'], [9, 2, '#2e8a2e'], [9, 3, '#2e8a2e'], [12, 2, '#38a838'], [11, 3, '#38a838'], [7, 4, '#2e8a2e'], [9, 4, '#2e8a2e']]) p.put(x, y, c);
    },
    elote(p, w) { // corn on the cob (el elote): rows of kernels (yellow; w.col: white corn), green husks folded back, silk on top
      const c = (w && w.col) || '#f8d040', d = G.shade(c, 0.78), l = G.shade(c, 1.12);
      p.ell(8, 7.5, 3.4, 6.6, c);
      for (let y = 2; y < 14; y += 2) for (let x = 5; x <= 11; x += 2) if (p.get(x + (y % 4 ? 1 : 0), y)) p.put(x + (y % 4 ? 1 : 0), y, d);
      p.rect(6, 3, 1, 8, l);
      for (const [x, y] of [[7, 0], [8, 0], [9, 1]]) p.put(x, y, '#c89a50');
      p.tri(2, 9, 8, 15, 4, 15, '#58b040'); p.tri(14, 8, 8, 15, 12, 15, '#3e9030'); p.tri(5, 11, 8, 15, 6, 15, '#9cdc6a');
      p.rect(7, 14, 2, 2, '#2e7a2a');
    },
    jitomate(p, w) { // a tomato (el jitomate): round and shiny (red; w.col: a green one, not ripe yet), a green star of leaves, a stalk
      const c = (w && w.col) || '#e03a28';
      p.ell(8, 9.5, 6.6, 5.8, c); p.shade(8, 9.5, 6.6, G.shade(c, 0.72));
      p.rect(4, 6, 2, 2, G.shade(c, 1.35)); p.put(4, 8, G.shade(c, 1.35));
      const k = '#1e6a24';
      p.rect(6, 4, 5, 1, k); p.put(5, 5, k); p.put(11, 5, k); p.put(8, 5, k); p.put(7, 5, k); p.put(9, 5, k); p.put(4, 4, k); p.put(12, 4, k);
      p.rect(8, 1, 1, 3, '#2e7a2a'); p.put(9, 1, '#2e7a2a');
    },
    canastaverduras(p) { // Abuelo's basket full of vegetables: a carrot, a tomato, a lettuce, corn
      p.ell(8, 11, 7, 4.5, '#c08040'); p.rect(1, 9, 14, 2, '#a06030');
      p.disc(5, 7, 2.6, '#58b040'); p.disc(10.5, 7.5, 2.2, '#e03a28'); p.rect(12, 3, 2, 6, '#f8d040'); p.tri(7, 4, 9, 4, 8, 9, '#f08828'); p.put(10, 5, '#38a838');
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.12) p.put(8 + Math.cos(a) * 6, 9 + Math.sin(a) * 7, '#8a5022');
    },
    galletas(p) { // a plate of Abuela's cookies, warm from the oven
      p.ell(8, 12, 7.5, 2.6, '#f8f8f0'); for (const [x, y] of [[4.5, 9], [11.5, 9], [8, 7]]) { p.disc(x, y, 3, '#e0a050'); p.put(x - 1, y, '#5a3418'); p.put(x + 1, y - 1, '#5a3418'); p.put(x, y + 1, '#5a3418'); }
      p.put(6, 2, '#ffffff'); p.put(7, 1, '#ffffff'); p.put(10, 2, '#ffffff');
    },
    // things in the forest with no word of their own (a picture only)
    binoculares(p) { // Elena's binoculars: two black barrels, blue lenses, a strap
      for (let a = Math.PI * 1.1; a < Math.PI * 1.9; a += 0.1) p.put(8 + Math.cos(a) * 7, 8 + Math.sin(a) * 6, '#8a5a28');
      p.rect(2, 6, 5, 8, '#303038'); p.rect(9, 6, 5, 8, '#303038'); p.rect(6, 8, 4, 3, '#404048');
      p.disc(4.5, 13, 2.3, '#68a8e8'); p.disc(11.5, 13, 2.3, '#68a8e8'); p.put(4, 12, '#ffffff'); p.put(11, 12, '#ffffff'); p.rect(2, 6, 5, 1, '#505060'); p.rect(9, 6, 5, 1, '#505060');
    },
    canastamoras(p) { // Doña Lupe's basket, heaped with blackberries
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.05) p.put(8 + Math.cos(a) * 5.5 - 0.5, 7 + Math.sin(a) * 5 - 0.5, '#8a5022');
      for (const [x, y] of [[5, 7], [8, 6], [11, 7], [6.5, 8], [9.5, 8]]) p.disc(x, y, 1.6, '#4a2a70');
      p.put(5, 6, '#9a6ad0'); p.put(8, 5, '#9a6ad0'); p.put(11, 6, '#9a6ad0');
      p.rect(2, 8, 12, 6, '#c88a40'); p.rect(3, 14, 10, 1, '#8a5022'); for (let y = 9; y < 14; y += 2) p.rect(2, y, 12, 1, '#a86a28');
    },
    pay(p) { // Doña Lupe's blackberry pie: a golden crust with a lattice, purple filling peeking through
      p.ell(8, 10, 7.5, 4.5, '#e0a050'); p.ell(8, 9.5, 6.2, 3.4, '#5a2a70');
      for (const x of [4, 7, 10, 13]) for (let y = 7; y < 13; y++) p.put(x - (y - 7) * 0.3, y, '#f0c070');
      for (const y of [8, 10, 12]) for (let x = 3; x < 14; x++) if (Math.abs(x - 8) < 6.5 - Math.abs(y - 10)) p.put(x, y, '#f0c070');
      p.rect(1, 13, 14, 2, '#c08038'); p.put(4, 5, '#ffffff'); p.put(8, 4, '#ffffff'); p.put(12, 5, '#ffffff');
    },
    frasco(p) { // a glass jar with a lid, fireflies glowing inside
      p.rect(3, 4, 10, 11, '#c8e8f8'); p.rect(4, 3, 8, 1, '#c8e8f8'); p.rect(4, 1, 8, 2, '#a07040'); p.rect(4, 1, 8, 1, '#c09050');
      p.rect(4, 5, 8, 9, '#203048'); for (const [x, y] of [[6, 7], [10, 9], [7, 11], [9, 6], [5, 12]]) { p.put(x, y, '#f8f080'); p.put(x + 1, y, '#fff8c0'); }
      p.rect(3, 5, 1, 8, '#ffffff');
    },
    // ---- La playa (content/es/zone-playa.js): the sea, the sand, its animals ----
    mar(p) { // the sea: deep blue bands, white wave crests rolling
      p.rect(0, 2, 16, 14, '#2460c0'); p.rect(0, 7, 16, 9, '#3478d8'); p.rect(0, 12, 16, 4, '#4c94ec');
      for (const [y0, off] of [[3, 0], [8, 4], [13, 2]]) for (let x = 0; x < 16; x++) { const k = (x + off) % 8; const dy = [1, 0, 0, 0, 1, 2, 2, 2][k]; p.put(x, y0 + dy - 1, '#ffffff'); if (k < 5) p.put(x, y0 + dy, '#a8d8ff'); }
    },
    arena(p) { // the sand: a heap of it, grains glinting, a little yellow spade stuck in
      p.ell(8, 12.5, 7.6, 4.2, '#e8c880'); p.rect(0, 14, 16, 2, '#e8c880'); p.shade(8, 12.5, 7.6, '#c8a058');
      for (const [x, y] of [[4, 11], [7, 13], [10, 11], [12, 13], [6, 14], [9, 15], [3, 14]]) p.put(x, y, '#a88040');
      for (const [x, y] of [[6, 10], [11, 12]]) p.put(x, y, '#fff4d0');
      p.rect(10, 3, 1, 6, '#c08040'); p.rect(9, 8, 3, 3, '#f8d030'); p.put(11, 9, '#d8a818');
    },
    ola(p) { // a big wave curling over, white foam on its tip
      p.rect(0, 13, 16, 3, '#3478d8');
      p.disc(9, 8.5, 7, '#3478d8'); p.disc(7.5, 8, 3.6, null); p.rect(2, 9, 6, 4, '#3478d8');
      p.shade(9, 8.5, 7, '#2460c0');
      for (let a = Math.PI * 1.05; a <= Math.PI * 2.1; a += 0.07) p.put(9 + Math.cos(a) * 6.6 - 0.5, 8.5 + Math.sin(a) * 6.6 - 0.5, '#ffffff');
      p.put(3, 6, '#ffffff'); p.put(4, 5, '#ffffff'); p.put(2, 5, '#d8f0ff'); p.put(1, 7, '#d8f0ff');
      for (const x of [1, 5, 9, 13]) p.put(x, 13, '#a8d8ff');
    },
    solgafas(p) { // el sol: a smiling sun in dark sunglasses
      for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4 + Math.PI / 8; for (let r = 5.8; r < 7.8; r += 0.5) p.put(8 + Math.cos(t) * r - 0.5, 8 + Math.sin(t) * r - 0.5, '#f89020'); }
      p.disc(8, 8, 5.2, '#f8d830'); p.shade(8, 8, 5.2, '#f0b020');
      p.rect(3, 6, 4, 3, '#202030'); p.rect(9, 6, 4, 3, '#202030'); p.rect(7, 6, 2, 1, '#202030'); p.put(4, 6, '#6070a0'); p.put(10, 6, '#6070a0');
      p.rect(6, 11, 4, 1, '#a04010'); p.put(5, 10, '#a04010'); p.put(10, 10, '#a04010');
    },
    concha(p, w) { // a scallop shell (its colour from w.col: the shells Lola collects)
      const c = (w && w.col) || '#f8a8c8', d = G.shade(c, 0.78), l = G.shade(c, 1.15);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const dx = x + 0.5 - 8, dy = y + 0.5 - 13.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
        if (dy > 0 || r > 7.6 + Math.abs(Math.sin(a * 7)) * 0.7) continue;
        const rib = Math.floor((a + Math.PI) / (Math.PI / 7)) & 1;
        p.put(x, y, rib ? d : c);
        if (r > 6.8 && !rib) p.put(x, y, l);
      }
      p.rect(5, 13, 6, 2, c); p.rect(4, 13, 2, 2, d); p.rect(10, 13, 2, 2, d); p.put(6, 8, '#ffffff'); p.put(7, 7, '#ffffff');
    },
    caracola(p) { // a big spiral shell (the hermit crab's new home): its pointed spire up right, a pink opening
      p.tri(6, 5, 11, 9, 15, 0.5, '#f0dcc0'); p.ell(7, 10, 5.6, 4.6, '#f4e4d0'); p.shade(7, 10, 5.6, '#d8bc98');
      for (const [x, y] of [[9, 5], [11, 4], [12, 2], [13, 1]]) { p.put(x, y, '#b07858'); p.put(x - 1, y + 1, '#b07858'); }
      for (let a = 0.3; a < Math.PI * 1.6; a += 0.15) p.put(8 + Math.cos(a) * 3.2 - 0.5, 9 + Math.sin(a) * 2.6 - 0.5, '#c08868');
      p.ell(4, 12, 2.6, 2.2, '#f8a8a0'); p.ell(4, 12, 1.4, 1.1, '#d06868'); p.put(7, 7, '#ffffff'); p.put(8, 7, '#ffffff');
    },
    cubetaplaya(p) { // la cubeta: a red sand pail with a white rim, its handle, a yellow spade
      for (let a = Math.PI * 1.05; a <= Math.PI * 1.95; a += 0.05) p.put(7.5 + Math.cos(a) * 5 - 0.5, 7 + Math.sin(a) * 4.5 - 0.5, '#303040');
      p.tri(2, 6, 13, 6, 11, 15, '#e83a30'); p.tri(2, 6, 4, 15, 11, 15, '#e83a30'); p.rect(2, 6, 11, 2, '#fafaf4'); p.ell(7.5, 6.6, 5, 1, '#e8c880');
      p.shade(7.5, 11, 7, '#b82420'); p.put(4, 9, '#ff8070'); p.put(4, 10, '#ff8070');
      p.rect(13, 1, 1, 9, '#c08040'); p.rect(12, 9, 3, 4, '#f8d030'); p.put(14, 11, '#d8a818');
    },
    castillo(p) { // a sandcastle: two towers, battlements, a door, a red flag
      const S1 = '#e8c880', S2 = '#c8a058';
      p.rect(1, 6, 4, 9, S1); p.rect(11, 6, 4, 9, S1); p.rect(4, 9, 8, 6, S1);
      for (const x of [1, 3, 11, 13]) p.rect(x, 4, 1, 2, S1); for (const x of [5, 7, 9]) p.rect(x, 7, 1, 2, S1);
      p.rect(7, 11, 2, 4, '#8a6030'); p.put(2, 8, '#8a6030'); p.put(13, 8, '#8a6030');
      p.rect(4, 14, 8, 1, S2); p.rect(1, 14, 4, 1, S2); p.rect(11, 14, 4, 1, S2); p.rect(4, 9, 1, 6, S2); p.rect(14, 6, 1, 9, S2);
      p.rect(2, 0, 1, 4, '#6a4020'); p.rect(3, 0, 3, 2, '#e83a30'); p.put(3, 0, '#ff7060');
      p.rect(0, 15, 16, 1, '#d8b070');
    },
    helado(p) { // an ice-cream cone: a big round strawberry scoop, a cherry on top
      p.tri(3.5, 8, 12.5, 8, 8, 16, '#e0a050'); for (const y of [9, 11, 13]) for (let x = 3; x < 13; x++) if ((x + y) % 3 === 0) p.put(x, y, '#b07830');
      p.disc(8, 5.2, 4.9, '#f8a0c0'); p.rect(3.5, 7, 9, 2, '#f8a0c0'); p.shade(8, 5.2, 4.9, '#e070a0');
      p.put(4, 9, '#f8a0c0'); p.put(4, 10, '#e070a0'); p.put(11, 9, '#e070a0'); // a drip
      p.put(6, 3, '#ffe0ec'); p.put(5, 4, '#ffe0ec'); p.disc(8.5, 0.9, 1.3, '#e02838'); p.put(8, 0, '#ff9090');
    },
    caliente(p) { // hot: a red face sweating under wavy heat lines, its tongue out
      for (const x of [3, 8, 13]) [0, 1, 1, 0].forEach((dx, y) => p.put(x + dx, y, '#f86030'));
      p.disc(8, 10, 5.6, '#f87048'); p.shade(8, 10, 5.6, '#d84828');
      p.rect(5, 8, 2, 1, '#401010'); p.rect(9, 8, 2, 1, '#401010'); p.rect(6, 12, 4, 1, '#401010'); p.rect(7, 13, 2, 2, '#f890a0');
      p.put(13, 7, '#68c0ff'); p.put(13, 8, '#68c0ff'); p.put(14, 9, '#68c0ff'); p.put(2, 9, '#68c0ff'); p.put(2, 10, '#68c0ff');
    },
    cangrejo(p) { // a red crab, claws up, eyes on stalks
      p.ell(8, 10, 5.4, 3.6, '#e84830'); p.shade(8, 10, 5.4, '#b82818'); p.put(6, 8, '#ff9070'); p.put(7, 8, '#ff9070');
      p.disc(2.5, 4.5, 2.2, '#e84830'); p.disc(13.5, 4.5, 2.2, '#e84830'); p.put(2, 2, null); p.put(3, 3, null); p.put(13, 2, null); p.put(12, 3, null);
      p.rect(3, 6, 1, 3, '#e84830'); p.rect(12, 6, 1, 3, '#e84830');
      p.rect(6, 5, 1, 2, '#c03020'); p.rect(9, 5, 1, 2, '#c03020'); p.rect(5, 4, 2, 2, '#ffffff'); p.rect(9, 4, 2, 2, '#ffffff'); p.put(6, 5, '#101010'); p.put(9, 5, '#101010');
      for (const [x, y] of [[2, 11], [1, 13], [3, 13], [14, 11], [15, 13], [13, 13]]) p.put(x, y, '#c03020');
      p.rect(6, 11, 4, 1, '#801810');
    },
    estrellamar(p) { // a starfish: a plump orange star with little bumps
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const dx = x + 0.5 - 8, dy = y + 0.5 - 8.5, a = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
        const k = Math.cos(5 * (a + Math.PI / 2)), lim = 3 + 4.6 * Math.max(0, k) ** 0.8;
        if (r <= lim) p.put(x, y, dy > 1.5 ? '#e05830' : '#f07840');
      }
      for (const [x, y] of [[8, 3], [4, 7], [12, 7], [6, 12], [10, 12], [8, 8]]) p.put(x, y, '#ffc090');
      p.put(7, 6, '#ffe0c0');
    },
    tortuga(p) { // a sea turtle swimming: a green shell with tiles, flippers out, its head up
      p.ell(3, 3.5, 2.4, 1.6, '#78c058'); p.ell(13, 3.5, 2.4, 1.6, '#78c058'); p.ell(3, 13, 2, 1.4, '#78c058'); p.ell(13, 13, 2, 1.4, '#78c058');
      p.ell(8, 9, 5.4, 5.6, '#3a8a40'); p.shade(8, 9, 5.4, '#2a6a30');
      for (const [x, y] of [[8, 7], [6, 10], [10, 10], [8, 12]]) { p.disc(x, y, 1.3, '#68b050'); }
      p.disc(8, 2.5, 2.2, '#78c058'); p.put(7, 2, '#101010'); p.put(9, 2, '#101010'); p.put(8, 4, '#58a040');
    },
    gaviota(p) { // a seagull: white, grey wings, a yellow beak with a red spot
      p.tri(1, 9, 5, 7, 4, 12, '#a0a8b8'); p.ell(8, 10, 5, 3.4, '#ffffff'); p.disc(11.5, 5.5, 2.8, '#ffffff');
      p.ell(7, 9, 3.6, 2, '#a8b0c0'); p.rect(4, 9, 4, 1, '#808898'); p.put(3, 10, '#303040');
      p.rect(14, 5, 2, 1, '#f8c830'); p.put(15, 6, '#e83030'); p.put(12, 4, '#101010');
      p.rect(8, 13, 1, 3, '#f0a040'); p.rect(10, 13, 1, 3, '#f0a040'); p.shade(8, 10, 5, '#d8dce8');
    },
    nadar(p) { // to swim: a child's head and an arm stroking through the waves, splashes
      p.rect(0, 10, 16, 6, '#3888e0'); p.rect(0, 10, 16, 1, '#a8d8ff');
      p.disc(6, 7.5, 3.4, '#f0c8a0'); p.rect(3, 4, 7, 2, '#5a3418'); p.put(3, 6, '#5a3418');
      p.put(5, 8, '#302018'); p.put(7, 8, '#302018'); p.rect(5, 10, 3, 1, '#c87850');
      for (let i = 0; i < 6; i++) { p.put(10 + i * 0.8, 9 - i, '#f0c8a0'); p.put(11 + i * 0.8, 9 - i, '#f0c8a0'); }
      p.disc(15, 3, 1, '#f0c8a0');
      for (const [x, y] of [[1, 9], [12, 9], [14, 10], [2, 8]]) p.put(x, y, '#ffffff');
      for (const x of [2, 7, 12]) { p.put(x, 12, '#68a8f0'); p.put(x + 1, 12, '#68a8f0'); }
    },
    medusa(p) { // a jellyfish: a pink see-through dome and wavy tentacles
      p.ell(8, 6, 6.5, 5, '#f0a0e0'); p.rect(1.5, 6, 13, 3, '#f0a0e0'); p.shade(8, 6, 6.5, '#c070c0');
      p.ell(6, 4, 2.4, 1.6, '#ffe0f8'); p.put(9, 3, '#ffffff');
      for (const x of [3, 6, 9, 12]) for (let y = 9; y < 16; y++) p.put(x + ((y + x) % 4 < 2 ? 0 : 1), y, y > 13 ? '#e080d0' : '#d070c8');
      p.put(6, 6, '#602060'); p.put(10, 6, '#602060');
    },
    delfin(p) { // a dolphin leaping out of the sea: an arched grey-blue back, a pale belly, a fin, its tail flukes
      p.rect(0, 13, 16, 3, '#3478d8'); p.rect(0, 13, 16, 1, '#a8d8ff');
      for (let t = 0; t <= 1.001; t += 0.02) { const x = 2 + 11 * t, y = 12.5 - 7 * t - 3 * Math.sin(Math.PI * t), r = 0.6 + 1.7 * Math.sin(Math.PI * Math.pow(t, 0.75)); p.disc(x, y, r, '#6a8cc0'); }
      for (let t = 0.15; t <= 0.95; t += 0.03) { const x = 2 + 11 * t, y = 12.5 - 7 * t - 3 * Math.sin(Math.PI * t); p.put(x + 0.9, y + 1.2, '#dce8f4'); }
      p.rect(13, 4, 3, 1, '#6a8cc0'); p.put(15, 4, '#5070a0');
      p.tri(6, 5.5, 9, 4.5, 5.5, 2, '#4a6ca0');
      p.tri(0, 11, 3, 13, 1, 15, '#4a6ca0'); p.put(3, 14, '#4a6ca0');
      p.put(12, 4, '#101010'); p.put(12, 3, '#ffffff');
      p.put(1, 12, '#ffffff'); p.put(4, 12, '#ffffff'); p.put(14, 12, '#ffffff');
    },
    pulpo(p) { // an octopus: a round purple head, big eyes, curly arms
      for (let k = 0; k < 6; k++) { const x0 = 2 + k * 2.4; for (let y = 9; y < 15; y++) p.put(x0 + Math.sin((y + k) * 0.9) * 1.1, y, '#b048a0'); p.put(x0 + Math.sin((15 + k) * 0.9) * 1.1 + 1, 15, '#b048a0'); }
      p.ell(8, 6.5, 5.6, 5, '#c858b0'); p.shade(8, 6.5, 5.6, '#983888');
      p.disc(5.5, 7, 1.6, '#ffffff'); p.disc(10.5, 7, 1.6, '#ffffff'); p.put(6, 7, '#101010'); p.put(11, 7, '#101010');
      p.put(6, 3, '#f0a0e0'); p.put(7, 2, '#f0a0e0'); p.put(8, 10, '#802070');
    },
    redpesca(p) { // Don Paco's fishing net: a knotted mesh with orange floats
      for (let y = 2; y < 15; y++) for (let x = 1; x < 15; x++) { const inside = Math.hypot((x + 0.5 - 8) / 7, (y + 0.5 - 9) / 6.5) < 1; if (inside && ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0)) p.put(x, y, '#e8dcb8'); }
      p.rect(2, 2, 12, 1, '#a07840');
      for (const x of [3, 8, 13]) { p.ell(x, 2, 1.4, 1.2, '#f88830'); }
    },
    nidoarena(p) { // the turtles' nest: round white eggs half in a heap of sand
      p.ell(8, 12.5, 7.8, 3.8, '#e0b870'); p.rect(0, 14, 16, 2, '#e0b870');
      for (const [x, y] of [[4.5, 9.5], [8, 8.2], [11.5, 9.5], [6.2, 11.8], [9.8, 11.8]]) p.disc(x, y, 2.6, '#9a7040');
      for (const [x, y] of [[4.5, 9.5], [8, 8.2], [11.5, 9.5], [6.2, 11.8], [9.8, 11.8]]) { p.disc(x, y, 1.9, '#fffaf0'); p.put(x - 0.6, y - 0.8, '#ffffff'); p.put(x + 0.7, y + 0.6, '#e0d8c8'); }
      for (const [x, y] of [[2, 13], [13, 14], [4, 15], [11, 15]]) p.put(x, y, '#a07838');
    },
    bandera(p) { // a little red flag on a stick (the top of the sandcastle)
      p.rect(4, 1, 1, 15, '#7a4a20'); p.tri(5, 1, 5, 8, 14, 4.5, '#e83a30'); p.put(6, 3, '#ff8070'); p.put(7, 3, '#ff8070'); p.put(4, 0, '#f8d030');
    },
    rocas(p) { // wet rocks and a tide pool (where the crabs and the octopus live)
      p.ell(8, 12, 7.5, 3.4, '#58b8e0'); p.ell(8, 12, 5.5, 2, '#88d8f0');
      p.ell(4, 7.5, 3.6, 3, '#6a6a7c'); p.ell(11, 6, 4.4, 3.6, '#7a7a8c'); p.shade(11, 6, 4.4, '#4a4a58'); p.shade(4, 7.5, 3.6, '#4a4a58');
      p.put(10, 4, '#b8b8c8'); p.put(3, 6, '#b8b8c8'); p.put(13, 7, '#e8e0d0'); p.put(6, 9, '#3a8a40'); p.put(14, 9, '#3a8a40');
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
    // ---- La montaña (content/es/zone-montana.js): the weather, snow and the cold, its animals ----
    nieve(p) { // snow: big snowflakes falling onto a white mound
      p.ell(8, 15, 9, 3.5, '#f4f8fc'); p.ell(8, 15.5, 8, 2, '#d0e2f4');
      const flake = (cx, cy, r, c) => { for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; for (let k = 0; k <= r; k += 0.5) p.put(cx + Math.cos(t) * k - 0.5, cy + Math.sin(t) * k - 0.5, c); } p.put(cx - 0.5, cy - 0.5, '#ffffff'); };
      flake(5, 5, 3.6, '#a8d0f8'); flake(12, 3, 2.2, '#c0dcf8'); flake(11.5, 9.5, 2.6, '#a8d0f8'); flake(3, 11, 1.6, '#c0dcf8');
    },
    frio(p) { // cold: a blue shivering face, teeth chattering, an icicle nose drip, a snowflake
      smiley(p, '#9ccaf0', '#78a8d8');
      p.rect(4, 6, 3, 1, '#302018'); p.rect(9, 6, 3, 1, '#302018'); p.put(5, 7, '#302018'); p.put(10, 7, '#302018');
      p.rect(4, 10, 8, 3, '#302018'); for (let x = 5; x < 11; x += 2) { p.put(x, 10, '#ffffff'); p.put(x + 1, 12, '#ffffff'); }
      for (const y of [4, 8, 12]) { p.put(0, y, '#5890d0'); p.put(15, y + 1, '#5890d0'); }
      p.put(8, 9, '#e8f8ff'); p.put(8, 10, '#c8e8ff');
      p.put(14, 1, '#ffffff'); p.put(13, 1, '#c0dcf8'); p.put(15, 1, '#c0dcf8'); p.put(14, 0, '#c0dcf8'); p.put(14, 2, '#c0dcf8');
    },
    nube(p) { // a fluffy white cloud
      for (const [x, y, r] of [[5, 9, 3.6], [9, 6.5, 4.4], [12.5, 9.5, 3.2], [8, 10.5, 3.6]]) p.disc(x, y, r, '#fafcff');
      p.rect(2, 10, 13, 3, '#fafcff'); p.rect(3, 12, 11, 1, '#c8dcf0'); p.put(6, 5, '#ffffff'); p.put(8, 4, '#ffffff');
      for (const [x, y] of [[13, 11], [14, 10], [12, 12], [5, 12]]) p.put(x, y, '#c8dcf0');
    },
    viento(p) { // wind: three swooshing gusts curling at their ends, a leaf tumbling along
      const gust = (y, x0, x1, c) => { p.rect(x0, y, x1 - x0, 1, c); p.put(x1, y - 1, c); p.put(x1 + 1, y - 2, c); p.put(x1 + 1, y - 3, c); p.put(x1, y - 4, c); p.put(x1 - 1, y - 4, c); p.put(x1 - 2, y - 3, c); };
      gust(5, 1, 11, '#5898e0'); gust(10, 3, 13, '#78b8f0'); gust(14, 0, 8, '#5898e0');
      p.ell(13, 13.5, 2, 1.3, '#58b040'); p.put(14, 12, '#2e7a2a');
    },
    lluvia(p) { // rain: a grey cloud, blue drops falling slantwise
      for (const [x, y, r] of [[5, 5, 3.2], [9, 3.5, 3.8], [12, 5.5, 2.8]]) p.disc(x, y, r, '#a8b4c8');
      p.rect(2, 5, 12, 3, '#a8b4c8'); p.rect(3, 7, 11, 1, '#8090a8'); p.put(7, 2, '#c8d4e4'); p.put(9, 1, '#c8d4e4');
      for (const [x, y] of [[3, 10], [7, 9], [11, 10], [5, 13], [9, 12], [13, 13]]) { p.put(x, y, '#3a8ae8'); p.put(x - 1, y + 1, '#3a8ae8'); p.put(x, y - 1, '#a8d8ff'); }
    },
    arcoiris(p) { // a rainbow: six bands in an arc, a little cloud at each foot
      const C = ['#e83a30', '#f89020', '#f8d830', '#48b848', '#3a7ae0', '#8a50c8'];
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const r = Math.hypot(x + 0.5 - 8, y + 0.5 - 14); const i = Math.floor((7.8 - r) / 0.88); if (r <= 7.8 && r >= 2.5 && i >= 0 && i < 6 && y < 14) p.put(x, y, C[i]); }
      p.disc(2, 13, 2.2, '#fafcff'); p.disc(4, 13.5, 1.8, '#fafcff'); p.disc(13.5, 13, 2.2, '#fafcff'); p.disc(11.5, 13.5, 1.8, '#fafcff');
    },
    gorro(p, w) { // a knitted winter hat (its colour from w.col): a turned-up band, stripes, a white pom-pom
      const c = (w && w.col) || '#3870d8', d = G.shade(c, 0.75), l = G.shade(c, 1.25);
      p.ell(8, 10, 6.5, 6.5, c); p.rect(1, 10, 14, 5, null); p.rect(1, 10, 14, 4, l); p.rect(1, 13, 14, 1, d);
      for (let x = 2; x < 15; x += 2) p.rect(x, 10, 1, 3, c);
      p.rect(3, 6, 10, 1, '#f8f8f8'); p.disc(8, 2.2, 2.3, '#f8f8f8'); p.put(7, 1, '#ffffff'); p.shade(8, 2.2, 2.3, '#d8d8e0');
    },
    bufanda(p, w) { // a scarf (its colour from w.col): wrapped in a loop, two ends hanging with a fringe, white stripes
      const c = (w && w.col) || '#e04040', d = G.shade(c, 0.72);
      p.ell(8, 4.5, 6, 3, c); p.ell(8, 4.5, 3.6, 1.3, null); p.rect(4, 6, 3, 8, c); p.rect(9, 6, 3, 7, d);
      for (const [x, y] of [[4, 9], [4, 11], [9, 9], [9, 11]]) p.rect(x, y, 3, 1, '#ffffff');
      for (const x of [4, 6, 9, 11]) { p.put(x, 14, c); p.put(x, 15, c); }
      p.put(2, 3, G.shade(c, 1.25)); p.put(3, 2, G.shade(c, 1.25));
    },
    guantes(p, w) { // a pair of mittens (their colour from w.col): a thumb out to the side, white cuffs
      const c = (w && w.col) || '#8a50c8', d = G.shade(c, 0.75), l = G.shade(c, 1.3);
      for (const [ox, f] of [[0, 1], [8, -1]]) {
        p.ell(ox + 4, 6.5, 3.2, 4.5, c); p.rect(ox + 1, 7, 6, 4, c); p.ell(ox + (f > 0 ? 1.2 : 6.8), 8, 1.3, 1.8, c);
        p.rect(ox + 1, 11, 6, 4, '#f4f4f8'); p.rect(ox + 1, 14, 6, 1, '#c8c8d8'); p.put(ox + 3, 12, d); p.put(ox + 5, 12, d);
        p.put(ox + 3, 3, l); p.put(ox + 2, 4, l);
      }
    },
    muneco(p) { // a snowman: three snowballs, coal eyes and buttons, a carrot nose, a red scarf, stick arms, a little hat
      p.disc(8, 12.5, 3.6, '#fafcff'); p.disc(8, 7.8, 2.8, '#fafcff'); p.disc(8, 3.8, 2.2, '#fafcff');
      p.shade(8, 12.5, 3.6, '#c8dcf0'); p.shade(8, 7.8, 2.8, '#c8dcf0');
      p.rect(5, 0, 6, 1, '#303038'); p.rect(6, 0, 4, 1, '#303038'); p.rect(6, 1, 4, 1, '#303038');
      p.put(7, 3, '#202028'); p.put(9, 3, '#202028'); p.rect(9, 4, 3, 1, '#f88020'); p.put(8, 7, '#202028'); p.put(8, 9, '#202028'); p.put(8, 12, '#202028');
      p.rect(5, 5, 6, 1, '#e04040'); p.rect(9, 6, 1, 3, '#e04040');
      for (let k = 0; k < 4; k++) { p.put(4 - k, 7 - k * 0.6, '#7a4a20'); p.put(12 + k, 7 - k * 0.6, '#7a4a20'); }
    },
    chocolate(p) { // a mug of hot chocolate: steam curling up, a marshmallow on top
      p.rect(2, 7, 10, 8, '#e05030'); p.rect(2, 7, 10, 1, '#f08060'); p.ell(7, 7.5, 5, 1.4, '#6a3818'); p.rect(11, 9, 3, 4, null);
      for (let a = -1.4; a <= 1.4; a += 0.2) p.put(12 + Math.cos(a) * 2.4, 11 + Math.sin(a) * 2.4, '#e05030');
      p.rect(5, 6, 3, 2, '#fafaf4'); p.rect(3, 14, 8, 1, '#b83820'); p.rect(4, 10, 6, 1, '#f8f0e0');
      for (const [x, y] of [[4, 4], [5, 3], [4, 2], [8, 3], [9, 2], [8, 1], [9, 0]]) p.put(x, y, '#d8d8e8');
    },
    trineo(p) { // a wooden sled: slats on two curled red runners, a rope at the front
      p.rect(1, 6, 12, 4, '#c0823a'); for (const x of [4, 8]) p.rect(x, 6, 1, 4, '#8a5428'); p.rect(1, 6, 12, 1, '#dca65c');
      p.rect(2, 12, 11, 1, '#d83030'); p.rect(2, 10, 1, 2, '#d83030'); p.rect(11, 10, 1, 2, '#d83030');
      p.put(13, 11, '#d83030'); p.put(14, 10, '#d83030'); p.put(14, 9, '#d83030'); p.put(13, 8, '#d83030');
      for (let k = 0; k < 4; k++) p.put(14 - k * 0.2, 7 - k, '#e8d8a0');
    },
    hielo(p) { // ice: two clear blue ice cubes with shiny edges
      for (const [x, y, s] of [[1, 6, 8], [8, 3, 7]]) {
        p.rect(x, y, s, s, '#b8e4f8'); p.rect(x, y, s, 1, '#f4fcff'); p.rect(x, y, 1, s, '#e0f4ff'); p.rect(x + s - 1, y + 1, 1, s - 1, '#78b8e0'); p.rect(x + 1, y + s - 1, s - 1, 1, '#78b8e0');
        p.put(x + 2, y + 2, '#ffffff'); p.put(x + 3, y + 2, '#ffffff'); p.put(x + 2, y + 3, '#ffffff');
      }
    },
    llama(p) { // a llama's head and long neck: fluffy cream wool, long banana ears with red tassels, a gentle face
      p.rect(5, 8, 6, 8, '#f0e4cc'); p.ell(8, 6, 4.2, 3.4, '#f0e4cc'); p.ell(10.5, 7.5, 2.6, 2, '#e0d0b0');
      p.ell(5.5, 2, 1, 2.6, '#f0e4cc'); p.ell(9.5, 2, 1, 2.6, '#f0e4cc'); p.put(5, 1, '#e04040'); p.put(9, 1, '#38a858');
      p.put(7, 5, '#201818'); p.put(10, 5, '#201818'); p.put(12, 8, '#806050'); p.put(11, 9, '#806050');
      for (const [x, y] of [[4, 10], [4, 12], [11, 11], [11, 13], [6, 14]]) p.put(x, y, '#d8c8a8');
      p.rect(5, 11, 6, 1, '#e04040'); p.rect(5, 12, 6, 1, '#f8d030');
    },
    marmota(p) { // a marmot standing up: chubby brown, a pale belly, little paws held up, round ears
      p.ell(8, 10.5, 5, 5, '#a06a38'); p.ell(8, 5, 3.6, 3.2, '#a06a38'); p.ell(8, 11, 3, 3.8, '#e0c098');
      p.disc(5, 2.6, 1, '#7a4a20'); p.disc(11, 2.6, 1, '#7a4a20'); p.put(6, 4, '#101010'); p.put(10, 4, '#101010');
      p.ell(8, 6.4, 1.6, 1, '#e8d0b0'); p.put(8, 6, '#402018'); p.rect(7, 7, 2, 1, '#ffffff');
      p.rect(5, 8, 2, 1, '#7a4a20'); p.rect(9, 8, 2, 1, '#7a4a20'); p.rect(4, 15, 3, 1, '#7a4a20'); p.rect(9, 15, 3, 1, '#7a4a20');
    },
    zorrillo(p) { // a skunk: black, a white stripe from its nose up over its back, a big fluffy tail held up
      p.ell(11, 5.5, 4.4, 5, '#282830'); p.ell(11, 5.5, 1.6, 4.4, '#f4f4f4');
      p.ell(7, 11, 5, 3.4, '#282830'); p.ell(6, 9.4, 3.6, 1, '#f4f4f4'); p.disc(3, 11, 2.6, '#282830');
      p.rect(2, 9, 1, 2, '#f4f4f4'); p.put(2, 11, '#101010'); p.put(1, 12, '#f090a0'); p.put(3, 8, '#282830');
      p.rect(4, 14, 1, 2, '#282830'); p.rect(9, 14, 1, 2, '#282830');
    },
    carpintero(p) { // a woodpecker on a tree trunk: a red cap, black and white wings, a long beak, pecking
      p.rect(9, 0, 6, 16, '#8a5a30'); p.rect(9, 0, 1, 16, '#6a4220'); for (const y of [3, 9, 13]) p.rect(11, y, 3, 1, '#6a4220');
      p.ell(6, 9, 3, 5, '#202028'); p.ell(5.5, 9.5, 1.4, 3.5, '#f4f4f4'); for (const y of [7, 9, 11]) p.put(7, y, '#f4f4f4');
      p.disc(6, 3.8, 2.4, '#202028'); p.rect(4, 1, 4, 2, '#e02828'); p.rect(5, 4, 2, 1, '#f4f4f4'); p.put(7, 3, '#ffffff'); p.put(7.5, 3.5, '#101010');
      p.rect(8, 4, 2, 1, '#606060'); p.rect(4, 14, 2, 2, '#202028');
    },
    monarca(p) { // a monarch butterfly: bright orange wings with black veins, black edges dotted white
      for (const f of [false, true]) {
        const X = x => f ? 15 - x : x;
        p.ell(X(4) + 0.5, 5.5, 4, 4.4, '#202020'); p.ell(X(4) + 0.5, 5.5, 3, 3.4, '#f88010');
        p.ell(X(5) + 0.5, 11.5, 3, 3, '#202020'); p.ell(X(5) + 0.5, 11.5, 2, 2, '#f8a020');
        p.put(X(3), 5, '#202020'); p.put(X(4), 6, '#202020'); p.put(X(5), 4, '#202020'); p.put(X(5), 11, '#202020');
        for (const [x, y] of [[1, 3], [1, 6], [2, 9], [3, 13], [5, 14]]) p.put(X(x), y, '#ffffff');
      }
      p.rect(7, 3, 2, 11, '#202020'); p.put(6, 1, '#202020'); p.put(9, 1, '#202020'); p.put(6, 2, '#202020'); p.put(9, 2, '#202020');
    },
    puma(p) { // a puma's face: tawny, round ears, a white muzzle, a pink nose, golden eyes
      p.disc(3, 3.5, 2.2, '#c08850'); p.disc(13, 3.5, 2.2, '#c08850'); p.disc(3, 3.5, 1, '#5a3418'); p.disc(13, 3.5, 1, '#5a3418');
      p.ell(8, 8.5, 6.5, 6, '#d09a60'); p.ell(8, 11.5, 3.6, 2.8, '#f8f0e0'); p.shade(8, 8.5, 6.5, '#b07840');
      p.rect(4, 7, 2, 2, '#e8c040'); p.rect(10, 7, 2, 2, '#e8c040'); p.put(5, 7, '#101010'); p.put(11, 7, '#101010');
      p.tri(6.5, 10, 9.5, 10, 8, 12, '#e07080'); p.put(8, 13, '#5a3418'); p.put(7, 14, '#5a3418'); p.put(9, 14, '#5a3418');
      p.put(3, 11, '#5a3418'); p.put(13, 11, '#5a3418');
    },
    aguila(p) { // an eagle soaring: wide brown wings, a golden head, a hooked yellow beak, its tail fanned
      p.tri(0, 6, 8, 5, 3, 10, '#6a4020'); p.tri(16, 6, 8, 5, 13, 10, '#6a4020'); for (const x of [1, 3, 13, 15]) p.put(x, 7, '#3a2010');
      p.ell(8, 8, 2.6, 4, '#7a4a20'); p.tri(6, 11, 10, 11, 8, 15, '#7a4a20'); p.disc(8, 3.5, 2.2, '#d8a040');
      p.put(7, 3, '#101010'); p.rect(8, 4, 2, 1, '#f8d020'); p.put(9, 5, '#f8d020'); p.put(5, 6, '#8a5a30'); p.put(11, 6, '#8a5a30');
    },
    lobo(p) { // a wolf's face: grey, tall pointed ears, a pale muzzle and cheeks, amber eyes, a black nose
      p.tri(2, 0, 6, 4, 2, 7, '#6a6a78'); p.tri(14, 0, 10, 4, 14, 7, '#6a6a78'); p.tri(3, 2, 5, 4, 3, 6, '#e0d8d0'); p.tri(13, 2, 11, 4, 13, 6, '#e0d8d0');
      p.ell(8, 8, 6, 4.6, '#8a8a98'); p.tri(2, 8, 14, 8, 8, 15, '#8a8a98'); p.tri(4, 9, 12, 9, 8, 15, '#f0ece8');
      p.put(5, 7, '#e8a020'); p.put(11, 7, '#e8a020'); p.put(5, 6, '#202028'); p.put(11, 6, '#202028'); p.disc(8, 13.5, 1.2, '#101010');
      p.rect(7, 4, 2, 3, '#6a6a78');
    },
    // things on the mountain with no word of their own (a picture only)
    bolanieve(p) { // a snowball: white, soft blue shading, a sparkle
      p.disc(8, 8.5, 6, '#fafcff'); p.shade(8, 8.5, 6, '#c8dcf0'); p.put(5, 5, '#ffffff'); p.put(6, 4, '#ffffff'); for (const [x, y] of [[10, 7], [7, 10], [11, 11]]) p.put(x, y, '#e0ecf8');
    },
    veleta(p) { // the weather vane: an arrow on a pole with a rooster, N S E W letters' crossbars
      p.rect(7, 4, 2, 12, '#606878'); p.rect(2, 9, 12, 1, '#606878'); p.tri(11, 1, 15, 3, 11, 5, '#e04040'); p.rect(2, 2, 10, 2, '#303840'); p.tri(0, 1, 3, 3, 0, 5, '#303840');
      p.ell(7, 6, 2.4, 1.6, '#f8c830'); p.put(9, 5, '#e04040');
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
    if (w && typeof w === 'object' && w.letter) { // a letter for someone: the envelope and their face in a little circle (connect.js)
      ctx.drawImage(G.icon('carta'), Math.round(x), Math.round(y), s, s);
      const spec = G.data.npcs[w.letter] && G.data.npcs[w.letter].map, r = Math.max(4, Math.round(s * 0.3)), cx = Math.round(x + s - r + 1), cy = Math.round(y + s - r + 1);
      if (!spec) return;
      ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8e8a0'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      const img = G.unitSprite(spec, 'down', 0), k = (2 * r) / 14; // (the head: the sprite's top 14 px, 24 wide)
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, Math.round(cx - 12 * k), Math.round(cy - r - 1 * k), Math.round(24 * k), Math.round(24 * k)); ctx.restore();
      return;
    }
    ctx.drawImage(G.icon(w), Math.round(x), Math.round(y), s, s);
  };
})();
