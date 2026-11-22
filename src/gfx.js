// ===== Graphics helpers: bitmap font, windows, sprite compiler =====
'use strict';
(function () {
  // ---- 5x7 (+descender) bitmap font; proportional widths computed from bits ----
  const F = {
    'A': [14, 17, 17, 17, 31, 17, 17], 'B': [30, 17, 17, 30, 17, 17, 30], 'C': [14, 17, 16, 16, 16, 17, 14], 'D': [28, 18, 17, 17, 17, 18, 28],
    'E': [31, 16, 16, 30, 16, 16, 31], 'F': [31, 16, 16, 30, 16, 16, 16], 'G': [14, 17, 16, 23, 17, 17, 15], 'H': [17, 17, 17, 31, 17, 17, 17],
    'I': [14, 4, 4, 4, 4, 4, 14], 'J': [7, 2, 2, 2, 2, 18, 12], 'K': [17, 18, 20, 24, 20, 18, 17], 'L': [16, 16, 16, 16, 16, 16, 31],
    'M': [17, 27, 21, 21, 17, 17, 17], 'N': [17, 17, 25, 21, 19, 17, 17], 'O': [14, 17, 17, 17, 17, 17, 14], 'P': [30, 17, 17, 30, 16, 16, 16],
    'Q': [14, 17, 17, 17, 21, 18, 13], 'R': [30, 17, 17, 30, 20, 18, 17], 'S': [15, 16, 16, 14, 1, 1, 30], 'T': [31, 4, 4, 4, 4, 4, 4],
    'U': [17, 17, 17, 17, 17, 17, 14], 'V': [17, 17, 17, 17, 17, 10, 4], 'W': [17, 17, 17, 21, 21, 21, 10], 'X': [17, 17, 10, 4, 10, 17, 17],
    'Y': [17, 17, 17, 10, 4, 4, 4], 'Z': [31, 1, 2, 4, 8, 16, 31],
    'a': [0, 0, 14, 1, 15, 17, 15], 'b': [16, 16, 22, 25, 17, 17, 30], 'c': [0, 0, 14, 16, 16, 17, 14], 'd': [1, 1, 13, 19, 17, 17, 15],
    'e': [0, 0, 14, 17, 31, 16, 14], 'f': [6, 9, 8, 28, 8, 8, 8], 'g': [0, 0, 15, 17, 17, 15, 1, 14], 'h': [16, 16, 22, 25, 17, 17, 17],
    'i': [4, 0, 12, 4, 4, 4, 14], 'j': [2, 0, 6, 2, 2, 2, 18, 12], 'k': [16, 16, 18, 20, 24, 20, 18], 'l': [12, 4, 4, 4, 4, 4, 14],
    'm': [0, 0, 26, 21, 21, 17, 17], 'n': [0, 0, 22, 25, 17, 17, 17], 'o': [0, 0, 14, 17, 17, 17, 14], 'p': [0, 0, 30, 17, 17, 30, 16, 16],
    'q': [0, 0, 15, 17, 17, 15, 1, 1], 'r': [0, 0, 22, 25, 16, 16, 16], 's': [0, 0, 15, 16, 14, 1, 30], 't': [8, 8, 28, 8, 8, 9, 6],
    'u': [0, 0, 17, 17, 17, 19, 13], 'v': [0, 0, 17, 17, 17, 10, 4], 'w': [0, 0, 17, 17, 21, 21, 10], 'x': [0, 0, 17, 10, 4, 10, 17],
    'y': [0, 0, 17, 17, 17, 15, 1, 14], 'z': [0, 0, 31, 2, 4, 8, 31],
    '0': [14, 17, 19, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14], '2': [14, 17, 1, 2, 4, 8, 31], '3': [31, 2, 4, 2, 1, 17, 14],
    '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 30, 1, 1, 17, 14], '6': [6, 8, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8],
    '8': [14, 17, 17, 14, 17, 17, 14], '9': [14, 17, 17, 15, 1, 2, 12],
    '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4], '.': [0, 0, 0, 0, 0, 12, 12], ',': [0, 0, 0, 0, 12, 4, 8],
    "'": [12, 4, 8, 0, 0, 0, 0], '"': [10, 10, 0, 0, 0, 0, 0], '-': [0, 0, 0, 14, 0, 0, 0], '+': [0, 4, 4, 31, 4, 4, 0],
    '/': [0, 1, 2, 4, 8, 16, 0], ':': [0, 12, 12, 0, 12, 12, 0], ';': [0, 12, 12, 0, 12, 4, 8], '%': [24, 25, 2, 4, 8, 19, 3],
    '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8], '=': [0, 0, 31, 0, 31, 0, 0], '*': [0, 4, 21, 14, 21, 4, 0],
    '#': [10, 10, 31, 10, 31, 10, 10], '&': [12, 18, 20, 8, 21, 18, 13], '<': [2, 4, 8, 16, 8, 4, 2], '>': [8, 4, 2, 1, 2, 4, 8],
    '[': [14, 8, 8, 8, 8, 8, 14], ']': [14, 2, 2, 2, 2, 2, 14], '_': [0, 0, 0, 0, 0, 0, 31], '~': [0, 0, 8, 21, 2, 0, 0],
    // Spanish letters & punctuation (accent sits in the two blank rows above lowercase letters)
    'á': [2, 4, 14, 1, 15, 17, 15], 'é': [2, 4, 14, 17, 31, 16, 14], 'í': [2, 4, 0, 12, 4, 4, 14], 'ó': [2, 4, 14, 17, 17, 17, 14],
    'ú': [2, 4, 17, 17, 17, 19, 13], 'ü': [10, 0, 17, 17, 17, 19, 13], 'ñ': [13, 22, 0, 22, 25, 17, 17],
    'Á': [2, 4, 14, 17, 31, 17, 17], 'É': [2, 4, 31, 16, 30, 16, 31], 'Í': [2, 4, 14, 4, 4, 4, 14], 'Ó': [2, 4, 14, 17, 17, 17, 14],
    'Ú': [2, 4, 17, 17, 17, 17, 14], 'Ñ': [13, 22, 17, 25, 21, 19, 17],
    '¿': [4, 0, 4, 8, 16, 17, 14], '¡': [4, 0, 4, 4, 4, 4, 4], '«': [0, 0, 5, 10, 20, 10, 5], '»': [0, 0, 20, 10, 5, 10, 20],
    // icons (private chars)
    '\u0001': [0, 31, 31, 14, 4, 0, 0],       // down triangle (more text)
    '\u0002': [16, 24, 28, 30, 28, 24, 16],  // right cursor
    '\u0003': [0, 10, 31, 31, 14, 4, 0],     // heart
    '\u0004': [4, 14, 31, 14, 4, 0, 0],      // gem/gold
    '\u0005': [4, 4, 31, 14, 14, 27, 17],    // star
  };
  const glyphs = {};
  for (const ch in F) {
    const rows = F[ch];
    let minc = 5, maxc = -1;
    rows.forEach(r => { for (let c = 0; c < 5; c++) if (r & (1 << (4 - c))) { minc = Math.min(minc, c); maxc = Math.max(maxc, c); } });
    if (maxc < 0) { minc = 0; maxc = 2; }
    // keep uppercase & digits monospaced-ish for tidy numbers
    if (/[0-9]/.test(ch)) { minc = 0; maxc = 4; }
    glyphs[ch] = { rows, x0: minc, w: maxc - minc + 1 };
  }
  glyphs[' '] = { rows: [], x0: 0, w: 3 };
  const cache = {};
  function glyphCanvas(ch, color) {
    const key = ch + color;
    if (cache[key]) return cache[key];
    const g = glyphs[ch] || glyphs['?'];
    const c = G.makeCanvas(g.w, 8); const x = c.getContext('2d'); x.fillStyle = color;
    g.rows.forEach((r, y) => { for (let col = 0; col < g.w; col++) if (r & (1 << (4 - (col + g.x0)))) x.fillRect(col, y, 1, 1); });
    cache[key] = c; return c;
  }
  G.textWidth = function (s) { let w = 0; for (const ch of String(s)) { const g = glyphs[ch] || glyphs['?']; w += g.w + 1; } return Math.max(0, w - 1); };
  // draw text with 1px drop shadow (SF-style legibility)
  G.text = function (ctx, s, x, y, color = '#fff', shadow = '#10102a') {
    s = String(s); x = Math.round(x); y = Math.round(y);
    let cx = x;
    for (const ch of s) {
      const g = glyphs[ch] || glyphs['?'];
      if (ch !== ' ') {
        if (shadow) ctx.drawImage(glyphCanvas(ch, shadow), cx + 1, y + 1);
        ctx.drawImage(glyphCanvas(ch, color), cx, y);
      }
      cx += g.w + 1;
    }
    return cx - x;
  };
  G.textR = (ctx, s, xr, y, c, sh) => G.text(ctx, s, xr - G.textWidth(s), y, c, sh);
  G.textC = (ctx, s, xc, y, c, sh) => G.text(ctx, s, xc - Math.floor(G.textWidth(s) / 2), y, c, sh);
  // scaled pixel text (titles, big vocabulary words), centred on xc
  G.bigText = function (ctx, s, xc, y, scale = 2, color = '#fff', shadow = '#10102a') {
    const w = G.textWidth(s) + 2, c = G.makeCanvas(w, 10);
    G.text(c.getContext('2d'), s, 0, 1, color, shadow);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, Math.round(xc - w * scale / 2), Math.round(y - scale), w * scale, 10 * scale);
  };
  // word-wrap into lines that fit width
  G.wrap = function (s, maxW) {
    const out = [];
    String(s).split('\n').forEach(par => {
      const words = par.split(' '); let line = '';
      words.forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (G.textWidth(t) > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  };

  // ---- label fitting: a short label on a small card (docs/AUDIT_2026-10.md 3.3) ----
  // Where a Spanish word may be broken: only between syllables, with a hyphen, never leaving fewer than 3 letters on
  // either side, and never inside a vowel run (a diphthong or a hiatus: both are legal breaks to skip).
  const VOW = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ';
  const isV = (w, i) => VOW.indexOf(w[i]) >= 0 || (w[i] === 'y' && i > 0 && (i === w.length - 1 || VOW.indexOf(w[i + 1]) < 0));
  const CLUSTER = /^(?:[pbfcgkt][lr]|dr)$/i;
  // the places a word can be cut: indexes k, so that w.slice(0, k) + '-' and w.slice(k)
  G.syllableBreaks = function (w) {
    const out = [], n = w.length;
    const unit = i => { const d = w.substr(i, 2).toLowerCase(); return d === 'ch' || d === 'll' || d === 'rr' ? 2 : 1; }; // a digraph is one consonant
    let i = 0;
    while (i < n) {
      if (isV(w, i)) { i++; continue; }
      const run = []; let j = i; // a run of consonants, i to j (the next vowel, or the end)
      while (j < n && !isV(w, j)) { const u = unit(j); run.push([j, j + u]); j += u; }
      if (j < n && i > 0) { // between two vowels: the last consonant goes with the next vowel, or the last two when they are a cluster (pl, br, tr...)
        let at = run.length - 1;
        if (run.length >= 2 && CLUSTER.test(w.slice(run[run.length - 2][0], run[run.length - 1][1]))) at = run.length - 2;
        out.push(run[at][0]);
      }
      i = j;
    }
    return out.filter(k => k >= 3 && n - k >= 3);
  };
  // s in at most maxLines lines (2, or 3) of at most maxW pixels each: the fewest lines that fit, breaking at a space first
  // and only if that can't fit inside a word at a syllable boundary (with a hyphen). Returns { lines, sq, hy }: sq < 1 only
  // when nothing fits (the widest line is then squeezed to maxW, a last resort the tests count), hy true when a word was broken.
  G.fitLabel = function (s, maxW, maxLines = 2) {
    s = String(s); const tw = G.textWidth;
    if (tw(s) <= maxW) return { lines: [s], sq: 1, hy: false };
    const cuts = []; // every place a line may end: at a space (dropped) or inside a word (a hyphen added)
    for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) cuts.push({ i, hy: false });
    let off = 0;
    s.split(' ').forEach(w => { G.syllableBreaks(w).forEach(k => cuts.push({ i: off + k, hy: true })); off += w.length + 1; });
    cuts.sort((p, q) => p.i - q.i);
    const make = set => {
      const out = []; let from = 0;
      set.forEach(c => { out.push(s.slice(from, c.i) + (c.hy ? '-' : '')); from = c.hy ? c.i : c.i + 1; });
      out.push(s.slice(from)); return out;
    };
    const sets = cuts.map(c => [c]);
    if (maxLines >= 3) cuts.forEach((c, a) => cuts.forEach((d, b) => { if (b > a && d.i - c.i >= 3) sets.push([c, d]); }));
    let best = null;
    sets.forEach(set => {
      const lines = make(set), wid = Math.max(...lines.map(tw)), hy = set.filter(c => c.hy).length;
      const key = wid <= maxW ? lines.length * 10 + hy : 1000; // fewer lines first, then fewer hyphens; nothing fits: the narrowest
      if (!best || key < best.key || (key === best.key && wid < best.wid)) best = { key, wid, lines, hy };
    });
    if (!best) return { lines: [s], sq: Math.max(0.01, maxW / tw(s)), hy: false };
    return { lines: best.lines, sq: Math.min(1, maxW / best.wid), hy: best.hy > 0 };
  };

  // ---- Windows (deep blue, beveled light frame) ----
  const WIN = { fill1: '#1c2c8c', fill2: '#0c1450', edge: '#f0f0ff', edge2: '#8898e0', dark: '#000010' };
  G.win = function (ctx, x, y, w, h, opts = {}) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const grd = ctx.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, opts.fill1 || WIN.fill1); grd.addColorStop(1, opts.fill2 || WIN.fill2);
    ctx.globalAlpha = opts.alpha == null ? 0.94 : opts.alpha;
    ctx.fillStyle = grd; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.globalAlpha = 1;
    // outer dark line
    ctx.fillStyle = WIN.dark;
    ctx.fillRect(x + 2, y, w - 4, 1); ctx.fillRect(x + 2, y + h - 1, w - 4, 1); ctx.fillRect(x, y + 2, 1, h - 4); ctx.fillRect(x + w - 1, y + 2, 1, h - 4);
    ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + w - 2, y + 1, 1, 1); ctx.fillRect(x + 1, y + h - 2, 1, 1); ctx.fillRect(x + w - 2, y + h - 2, 1, 1);
    // light bevel
    ctx.fillStyle = WIN.edge;
    ctx.fillRect(x + 2, y + 1, w - 4, 1); ctx.fillRect(x + 1, y + 2, 1, h - 4); ctx.fillRect(x + 2, y + h - 2, w - 4, 1); ctx.fillRect(x + w - 2, y + 2, 1, h - 4);
    ctx.fillStyle = WIN.edge2;
    ctx.fillRect(x + 3, y + 2, w - 6, 1); ctx.fillRect(x + 2, y + 3, 1, h - 6); ctx.fillRect(x + 3, y + h - 3, w - 6, 1); ctx.fillRect(x + w - 3, y + 3, 1, h - 6);
  };
  G.bar = function (ctx, x, y, w, v, max, color = '#f8d030') {
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w + 2, 5);
    ctx.fillStyle = '#403858'; ctx.fillRect(x + 1, y + 1, w, 3);
    const f = max > 0 ? Math.round(w * G.clamp(v / max, 0, 1)) : 0;
    ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, f, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 1, y + 1, f, 1);
  };

  // ---- Sprite compiler: string rows + palette -> canvas (cached) ----
  const sprCache = {};
  G.sprite = function (key, rows, pal, flip = false) {
    const k = key + (flip ? '|f' : '');
    if (sprCache[k]) return sprCache[k];
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    const c = G.makeCanvas(w, h), x = c.getContext('2d');
    const img = x.createImageData(w, h);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const ch = rows[yy][flip ? w - 1 - xx : xx];
      if (!ch || ch === '.' || ch === ' ') continue;
      const col = pal[ch]; if (!col) continue;
      const n = parseInt(col.slice(1), 16);
      const i = (yy * w + xx) * 4;
      if (col.length === 4) { // #rgb
        img.data[i] = ((n >> 8) & 15) * 17; img.data[i + 1] = ((n >> 4) & 15) * 17; img.data[i + 2] = (n & 15) * 17;
      } else { img.data[i] = (n >> 16) & 255; img.data[i + 1] = (n >> 8) & 255; img.data[i + 2] = n & 255; }
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    sprCache[k] = c; return c;
  };
  G.cached = function (key, w, h, fn) { // generic cached procedural canvas
    if (sprCache[key]) return sprCache[key];
    const c = G.makeCanvas(w, h); fn(c.getContext('2d'), c); sprCache[key] = c; return c;
  };
  // silhouette tint (for flashing hit, white-out etc.)
  G.tinted = function (src, color, key) {
    const k = 'tint|' + key + '|' + color;
    if (sprCache[k]) return sprCache[k];
    const c = G.makeCanvas(src.width, src.height), x = c.getContext('2d');
    x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    sprCache[k] = c; return c;
  };
  // colour utils
  G.shade = function (hex, f) { // f<1 darker, >1 lighter
    let n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (hex.length === 4) { r = ((n >> 8) & 15) * 17; g = ((n >> 4) & 15) * 17; b = (n & 15) * 17; }
    const m = v => G.clamp(Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)), 0, 255);
    return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  };
})();
