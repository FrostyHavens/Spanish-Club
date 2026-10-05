// ===== UI: dialogue boxes, list menus, 4-way icon menus, number/confirm prompts =====
'use strict';
(function () {
  // Awaitable handle returned by UI calls; generators can `yield` it.
  class Wait { constructor() { this.fin = false; this.result = undefined; } done() { return this.fin; } resolve(v) { this.result = v; this.fin = true; } }
  G.Wait = Wait;

  // ---------- English (parents' option only) ----------
  // The game teaches like Tunic: no translations by default. Opciones > Inglés turns on an English strip.
  G.enVisible = () => !!(G.state && G.state.opts && G.state.opts.english);
  G.enBox = function (ctx, en, y, top) { // translation strip above (or below) a window
    const lines = G.wrap(en, G.W - 40); const h = lines.length * 11 + 10;
    const yy = top ? y : y - h - 2;
    G.win(ctx, 14, yy, G.W - 28, h, { fill1: '#3a2a10', fill2: '#1c1408' });
    lines.forEach((l, i) => G.text(ctx, l, 22, yy + 6 + i * 11, '#f8e8b0'));
  };

  // ---------- Rich text: words grow from pictures ----------
  // In dialogue, [id] or [id:shown form] marks a vocabulary word. A word the player hasn't learned yet
  // is drawn as its picture plus the word in blue; once learned, the picture drops away and the word is gold.
  const TOK = /\[([a-z0-9]+)(?::([^\]]+))?\]/g;
  const COL = { text: '#ffffff', seen: '#a8d8ff', known: '#f8d860' };
  G.baseForm = id => { const w = G.data.words[id]; return w ? w.es.split(' / ')[0].replace(/^(el|la|los|las) /, '') : id; };
  G.richIds = s => { const out = []; String(s).replace(TOK, (m, id) => { out.push(id); return m; }); return out; };
  G.plain = s => String(s).replace(TOK, (m, id, shown) => shown || G.baseForm(id));
  function items(s) { // -> [{text, id?, gap}]  gap: a space precedes this item (wrapping happens only at gaps)
    const out = []; let gap = false, last = 0, m;
    const text = t => { for (const part of t.split(/(\s+)/)) { if (!part) continue; if (/^\s+$/.test(part)) { gap = true; continue; } out.push({ text: part, gap }); gap = false; } };
    TOK.lastIndex = 0;
    while ((m = TOK.exec(s))) { text(s.slice(last, m.index)); out.push({ text: m[2] || G.baseForm(m[1]), id: m[1], gap }); gap = false; last = TOK.lastIndex; }
    text(s.slice(last));
    return out;
  }
  const known = id => G.st && G.st.knows(id);
  const itemW = it => G.textWidth(it.text) + (it.id && !known(it.id) ? 18 : 0);
  G.richLayout = function (s, maxW) {
    const lines = [{ items: [], w: 0 }];
    for (const p of String(s).split('\n')) {
      if (lines[lines.length - 1].items.length) lines.push({ items: [], w: 0 });
      // chunks: runs of items with no space between them wrap together
      const its = items(p), chunks = [];
      its.forEach(it => { if (it.gap || !chunks.length) chunks.push([it]); else chunks[chunks.length - 1].push(it); });
      for (const ch of chunks) {
        const cw = ch.reduce((a, it) => a + itemW(it), 0);
        let L = lines[lines.length - 1];
        const sp = L.items.length ? 4 : 0;
        if (L.items.length && L.w + sp + cw > maxW) { L = { items: [], w: 0 }; lines.push(L); }
        ch.forEach((it, k) => { it.sp = k === 0 && L.items.length ? 4 : 0; L.items.push(it); L.w += it.sp + itemW(it); });
      }
    }
    lines.forEach(L => { L.chars = L.items.reduce((a, it) => a + it.text.length + (it.id ? 1 : 0), 0); });
    return lines;
  };
  // draw lines[from..from+n) ; chars limits the typewriter reveal; returns nothing
  G.richDraw = function (ctx, lines, x, y, o = {}) {
    const lh = o.lineH || 16, from = o.from || 0, n = o.n || lines.length;
    let chars = o.chars == null ? 1e9 : o.chars;
    for (let i = from; i < Math.min(lines.length, from + n); i++) {
      const L = lines[i]; let cx = o.center ? Math.round(x - L.w / 2) : x; const cy = y + (i - from) * lh;
      for (const it of L.items) {
        if (chars <= 0) return;
        cx += it.sp;
        if (it.id) {
          const k = known(it.id);
          if (!k) { G.drawIcon16(ctx, G.data.words[it.id] || it.id, cx, cy); cx += 18; chars--; }
          const t = it.text.slice(0, Math.max(0, chars)); G.text(ctx, t, cx, cy + 5, k ? COL.known : COL.seen);
        } else G.text(ctx, it.text.slice(0, Math.max(0, chars)), cx, cy + 5, o.color || COL.text);
        chars -= it.text.length; cx += G.textWidth(it.text);
      }
    }
  };

  // ---------- Dialogue ----------
  // G.say(pages, {name, portrait, pos:'bottom'|'top', auto, silent, noVoice}) -> Wait
  // A page is a string or {t: 'Spanish text with [words]', en: 'English (parents option)'}.
  class TextBox {
    constructor(pages, opts, w) {
      this.transparent = true; this.opts = opts || {}; this.w = w;
      this.pages = (Array.isArray(pages) ? pages : [pages]).map(p => typeof p === 'object' ? { t: String(p.t), en: p.en } : { t: String(p) });
      this.pi = 0; this.setPage();
    }
    setPage() {
      const hasP = !!this.opts.portrait;
      this.boxX = hasP ? 70 : 8; this.boxW = G.W - this.boxX - 8;
      const t = this.pages[this.pi].t;
      G.richIds(t).forEach(id => G.st && G.st.see(id));
      this.lines = G.richLayout(t, this.boxW - 18);
      this.shown = 0; this.scroll = 0; this.t = 0;
      this.spoke = !!this.opts.noVoice;
    }
    chars(a, b) { return this.lines.slice(a, b).reduce((s, L) => s + L.chars, 0); }
    update() {
      this.t++;
      if (!this.spoke) { this.spoke = true; G.speak(G.plain(this.pages[this.pi].t)); }
      if (G.input.p('C')) G.speak(G.plain(this.pages[this.pi].t));
      const target = this.chars(0, this.scroll + 3);
      if (this.shown < target) {
        const sp = G.input.h('A') || G.input.h('B') ? 4 : 1;
        this.shown = Math.min(target, this.shown + sp);
        if (this.t % 3 === 0 && !this.opts.silent) G.audio.sfx('text');
        if ((G.input.p('A') || G.input.p('B')) && this.t > 4) this.shown = target;
        return;
      }
      if (this.opts.auto) { if (this.t > this.opts.auto) this.next(); return; }
      if (G.input.p('A') || G.input.p('B')) this.next();
    }
    next() {
      if (this.scroll + 3 < this.lines.length) { this.scroll += 3; this.t = 0; return; }
      this.pi++;
      if (this.pi >= this.pages.length) { G.pop(); this.w.resolve(); return; }
      this.setPage();
    }
    draw(ctx) {
      const top = this.opts.pos === 'top';
      const h = 60, y = top ? 6 : G.H - h - 6;
      if (this.opts.portrait) {
        const py = top ? 6 : G.H - 60 - 6;
        G.win(ctx, 6, py, 60, 60);
        G.drawPortrait(ctx, this.opts.portrait, 10, py + 4, this.t);
      }
      G.win(ctx, this.boxX, y, this.boxW, h);
      const name = this.opts.name;
      if (name) { const nw = G.textWidth(name) + 14; G.win(ctx, this.boxX + 6, y - 13, nw, 16); G.text(ctx, name, this.boxX + 13, y - 9, '#f8e060'); }
      G.richDraw(ctx, this.lines, this.boxX + 9, y + 6, { from: this.scroll, n: 3, chars: this.shown - this.chars(0, this.scroll) });
      const done = this.shown >= this.chars(0, this.scroll + 3);
      if (done && !this.opts.auto && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', this.boxX + this.boxW - 14, y + h - 12, '#f8e060');
      const en = this.pages[this.pi].en;
      if (en && G.enVisible()) G.enBox(ctx, en, top ? y + h + 2 : y - (name ? 14 : 0), top);
    }
  }
  G.say = function (pages, opts) { const w = new Wait(); G.push(new TextBox(pages, opts, w)); return w; };

  // ---------- Spoken Spanish (browser speech synthesis; silently skipped if unavailable) ----------
  // Default: a North American voice (Mexico, then the US, then other Latin American), Spain only as a
  // last resort. Opciones > Elegir voz lets a person pick any Spanish voice by ear; that choice wins.
  const VOICE_PREF = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-GT', 'es-CR', 'es-PR', 'es-CU', 'es-DO', 'es-PA', 'es-SV', 'es-HN', 'es-NI', 'es-VE', 'es-PE', 'es-EC', 'es-CL', 'es-AR', 'es-UY', 'es-PY', 'es-BO'];
  G.spanishVoices = function () {
    try { return (window.speechSynthesis.getVoices() || []).filter(v => /^es([-_]|$)/i.test(v.lang)); } catch (e) { return []; }
  };
  function rank(v) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    let i = VOICE_PREF.findIndex(l => l.toLowerCase() === lang);
    if (i < 0) i = lang === 'es-es' ? 100 : 50;
    if (/natural|neural|premium|enhanced|google/i.test(v.name)) i -= 0.5; // nicer-sounding voices first
    return i;
  }
  G.currentVoice = function () {
    const all = G.spanishVoices(), want = G.state && G.state.opts && G.state.opts.voiceName;
    return all.find(v => v.name === want) || all.slice().sort((a, b) => rank(a) - rank(b))[0] || null;
  };
  G.speak = function (text) {
    try {
      if (!G.state || !G.state.opts || !G.state.opts.voice || G.audio.muted) return;
      const ss = window.speechSynthesis; if (!ss) return;
      ss.cancel();
      const clean = G.plain(text).replace(/[\u0001-\u0005«»]/g, '');
      const u = new SpeechSynthesisUtterance(clean); u.lang = 'es-MX'; u.rate = 0.85;
      const v = G.currentVoice(); if (v) { u.voice = v; u.lang = v.lang.replace('_', '-'); }
      ss.speak(u);
    } catch (e) { }
  };

  // ---------- List menu ----------
  // items: [{label, right?, disabled?, color?}] or strings. opts: {x,y,w,title,cols,onMove(i),maxRows,cancel:true,help(i)->str}
  class ListMenu {
    cancel() { G.pop(); this.w.resolve(-1); }
    constructor(items, opts, w) {
      this.transparent = true; this.w = w; this.opts = opts || {};
      this.items = items.map(it => typeof it === 'string' ? { label: it } : it);
      this.i = G.clamp(this.opts.start || 0, 0, Math.max(0, this.items.length - 1)); this.top = 0; this.t = 0;
      this.rows = Math.min(this.items.length, this.opts.maxRows || 8);
      const iw = Math.max(...this.items.map(it => G.textWidth(it.label) + (it.right ? G.textWidth(it.right) + 14 : 0)), this.opts.title ? G.textWidth(this.opts.title) : 0);
      this.wd = this.opts.w || iw + 30;
      this.ht = this.rows * 12 + 14 + (this.opts.title ? 12 : 0);
      this.x = this.opts.x != null ? this.opts.x : Math.floor((G.W - this.wd) / 2);
      this.y = this.opts.y != null ? this.opts.y : Math.floor((G.H - this.ht) / 2);
      this.opts.onMove && this.opts.onMove(this.i);
    }
    update() {
      this.t++;
      const n = this.items.length; if (!n) { if (G.input.p('B') || G.input.p('A')) { G.pop(); this.w.resolve(-1); } return; }
      const d = G.input.repDir(14, 4);
      if (d === 'up' || d === 'down') {
        this.i = (this.i + (d === 'up' ? -1 : 1) + n) % n; G.audio.sfx('cursor');
        this.opts.onMove && this.opts.onMove(this.i);
      }
      if (this.i < this.top) this.top = this.i; if (this.i >= this.top + this.rows) this.top = this.i - this.rows + 1;
      if (G.input.p('A')) {
        const it = this.items[this.i];
        if (it.disabled) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok'); if (!this.opts.keep) G.pop(); this.w.resolve(this.i);
      } else if (G.input.p('B') && this.opts.cancel !== false) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); }
    }
    draw(ctx) {
      G.win(ctx, this.x, this.y, this.wd, this.ht);
      let y = this.y + 8;
      if (this.opts.title) { G.text(ctx, this.opts.title, this.x + 9, y, '#f8e060'); y += 12; }
      for (let r = 0; r < this.rows; r++) {
        const idx = this.top + r, it = this.items[idx]; if (!it) break;
        const col = it.disabled ? '#7078a0' : (it.color || '#fff');
        G.text(ctx, it.label, this.x + 17, y + r * 12, col);
        if (it.right) G.textR(ctx, it.right, this.x + this.wd - 9, y + r * 12, col);
        if (idx === this.i && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', this.x + 8, y + r * 12, '#f8e060');
      }
      if (this.top > 0) G.textC(ctx, '^', this.x + this.wd / 2, this.y + 2, '#f8e060');
      if (this.top + this.rows < this.items.length) G.textC(ctx, '\u0001', this.x + this.wd / 2, this.y + this.ht - 8, '#f8e060');
      const cur = this.items[this.i];
      if (cur && cur.en && G.enVisible()) G.enBox(ctx, cur.en, this.y);
      if (this.opts.help) {
        const hs = this.opts.help(this.i); if (hs) { const lines = G.wrap(hs, G.W - 34); const hh = lines.length * 11 + 12; G.win(ctx, 8, G.H - hh - 6, G.W - 16, hh); lines.forEach((l, k) => G.text(ctx, l, 17, G.H - hh + 1 + k * 11)); }
      }
    }
  }
  G.menu = function (items, opts) { const w = new Wait(); G.push(new ListMenu(items, opts, w)); return w; };

  // ---------- Yes/No ----------
  G.confirm = function (opts = {}) { return G.menu([{ label: 'Sí', en: 'Yes' }, { label: 'No', en: 'No' }], Object.assign({ x: G.W - 70, y: G.H - 110 }, opts)); };

  // ---------- 4-way icon menu (SF-style cross) ----------
  // entries: {up:{label, icon}, left:..., right:..., down:...}; returns 'up'/'left'/... or null
  class CrossMenu {
    cancel() { G.pop(); this.w.resolve(null); }
    constructor(entries, opts, w) { this.transparent = true; this.e = entries; this.opts = opts || {}; this.w = w; this.sel = 'up'; this.t = 0; }
    update() {
      this.t++;
      const d = G.input.repDir(20, 10);
      if (d && this.e[d]) { if (d !== this.sel) G.audio.sfx('cursor'); this.sel = d; }
      if (G.input.p('A')) {
        const en = this.e[this.sel];
        if (en.disabled) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok'); G.pop(); this.w.resolve(this.sel);
      } else if (G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); }
    }
    draw(ctx) {
      const cx = this.opts.x != null ? this.opts.x : G.W / 2, cy = this.opts.y != null ? this.opts.y : G.H - 52;
      const pos = { up: [0, -22], left: [-30, 0], right: [30, 0], down: [0, 22] };
      for (const d of ['up', 'left', 'right', 'down']) {
        const en = this.e[d]; if (!en) continue;
        const [dx, dy] = pos[d]; const s = d === this.sel;
        const bob = s ? Math.round(Math.sin(this.t / 5) * 1.5) : 0;
        G.drawIcon(ctx, en.icon, cx + dx - 12, cy + dy - 10 + bob, s, en.disabled);
      }
      const lab = this.e[this.sel].label;
      const lw = G.textWidth(lab) + 18;
      G.win(ctx, cx + 48, cy - 8, Math.max(56, lw), 20);
      G.text(ctx, lab, cx + 57, cy - 2, this.e[this.sel].disabled ? '#7078a0' : '#fff');
    }
  }
  G.cross = function (entries, opts) { const w = new Wait(); G.push(new CrossMenu(entries, opts, w)); return w; };

  // ---------- Icons (procedural 24x20 framed tiles) ----------
  const ICON_ART = {
    attack: ['.........ww', '........wWw', '.......wWw.', '......wWw..', '.....wWw...', '.y..wWw....', '.yyWWw.....', '..yyy......', '.bybyy.....', 'bb...y.....', 'b..........'],
    magic: ['....s.....', '...sSs....', '....s.....', '...ooo....', '...oOo....', '....b.....', '....b.....', '....b.....', '....b.....', '....b.....', '...bbb....'],
    item: ['...bbbb...', '..b....b..', '.rrrrrrrr.', 'rRRRRRRRRr', 'rRRyyRRRRr', 'rRRyyRRRRr', 'rRRRRRRRRr', 'rRRRRRRRRr', '.rrrrrrrr.'],
    stay: ['....hh....', '...hssh...', '...ssss...', '....ss....', '..bbbbbb..', '.bbbbbbbb.', '.s.bbbb.s.', '...bbbb...', '...b..b...', '...b..b...', '..bb..bb..'],
    member: ['...hhhh...', '..hhhhhh..', '..hssssh..', '..sesses..', '..ssssss..', '...smms...', '....ss....', '..bbbbbb..', '.bbbbbbbb.', 'bbbbbbbbbb'],
    search: ['..gggg....', '.gWWWWg...', 'gWwwwwWg..', 'gWwwwwWg..', 'gWwwwwWg..', '.gWWWWg...', '..ggggbb..', '......bbb.', '.......bbb', '........bb'],
    talk: ['.wwwwwwww.', 'wwwwwwwwww', 'ww.w.w.www', 'wwwwwwwwww', '.wwwwwwww.', '...ww.....', '..w.......'],
    give: ['..rr......', '.rRRr.....', '.rRRr.....', '..rr.ss...', '....sssss.', '...ssssss.', '...sssss..'],
    equip: ['.gg....gg.', 'gWWg..gWWg', 'gWWWggWWWg', '.gWWWWWWg.', '..gWWWWg..', '..gWWWWg..', '.gWWggWWg.', '.gWg..gWg.'],
    drop: ['....b.....', '....b.....', '....b.....', '..bbbbb...', '...bbb....', '....b.....', '..........', '.rrrrrrr..'],
    use: ['...gg.....', '..gggg....', '..gGGg....', '.gGGGGg...', '.gGGGGg...', '.gGGGGg...', '..gggg....'],
    depot: ['rrrrrrrrrr', 'rRRRRRRRRr', 'rryyyyyyrr', 'rRRRRRRRRr', 'rRRRRRRRRr', 'rrrrrrrrrr'],
    join: ['..h....h..', '.hsh..hsh.', '.sss..sss.', '..s....s..', '.bbb..ccc.', 'bbbbbcccccc', '.bb....cc.'],
    book: ['.rrrr.cccc.', 'rRRRRrcCCCc', 'rRwwRrcwwCc', 'rRRRRrcCCCc', 'rRwwRrcwwCc', 'rRRRRrcCCCc', 'rRRRRrcCCCc', '.rrrrwcccc.', '.....w.....'],
    quest: ['.bbbbbbbb.', 'b........b', '.wwwwwwww.', '.wWWWWWWw.', '.wwwwwwww.', '.wWWWWWw..', '.wwwwwwww.', 'b........b', '.bbbbbbbb.'],
    save: ['........ys', '.......yy.', '......yy..', '.....yy...', '....yy....', '...yy.....', '..yy......', '.bb.......', 'bb........'],
    gear: ['...gg.gg...', '..gWWgWWg..', '.gWWWWWWWg.', '..gWWgWWg..', 'gWWg...gWWg', '..gWWgWWg..', '.gWWWWWWWg.', '..gWWgWWg..', '...gg.gg...'],
    quit: ['w........w', '.w......w.', '..w....w..', '...w..w...', '....ww....', '...w..w...', '..w....w..', '.w......w.', 'w........w'],
  };
  const ICON_PAL = { w: '#e8e8f8', W: '#a8b0d0', y: '#e8b830', b: '#8a5a30', s: '#f0c8a0', S: '#fff8a0', o: '#58a8f8', O: '#b8e0ff', r: '#a83828', R: '#d86040', h: '#704018', e: '#202040', m: '#c05050', g: '#b0b8c8', G: '#50e080', c: '#3868c8' };
  G.drawIcon = function (ctx, name, x, y, sel, disabled) {
    const frame = G.cached('iconframe' + (sel ? 1 : 0) + (disabled ? 1 : 0), 24, 20, (c) => {
      c.fillStyle = '#000010'; c.fillRect(1, 0, 22, 20); c.fillRect(0, 1, 24, 18);
      c.fillStyle = sel ? '#f0d060' : '#8898e0'; c.fillRect(1, 1, 22, 18);
      c.fillStyle = disabled ? '#303858' : (sel ? '#304cc0' : '#1c2c8c'); c.fillRect(2, 2, 20, 16);
    });
    ctx.drawImage(frame, Math.round(x), Math.round(y));
    const art = ICON_ART[name]; if (!art) return;
    const spr = G.sprite('icon_' + name, art, ICON_PAL);
    ctx.globalAlpha = disabled ? 0.45 : 1;
    ctx.drawImage(spr, Math.round(x + 12 - spr.width / 2), Math.round(y + 10 - spr.height / 2));
    ctx.globalAlpha = 1;
  };

})();
