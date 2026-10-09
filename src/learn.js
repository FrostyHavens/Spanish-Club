// ===== Learning UI: picture questions that adapt to how well a word is known, the gold-word card, badges =====
// Words are never translated. A word starts as a picture in speech; it is met in a little puzzle (intro.js), grows
// by being used (words.js: met -> known -> remembered -> solid), and turns gold once it is remembered.
'use strict';
(function () {
  const D = () => G.data, S = () => G.st;
  const STAR = '\u0005';

  // ---------- "¡Palabra de oro!" card: a word just remembered (stage 3, gold) ----------
  // A big moment: the room dims, rays turn, the card springs open (overshooting a little), confetti pops from its
  // corners, the picture bounces and sparkles, and the word is spoken. With the mic on (mic.js), a mic beside the
  // picture lets the child say the word for a speaking star; a tap anywhere else still goes on. (A word just MET gets
  // the small notebook celebration instead: G.intro.note, intro.js.)
  class WordCard {
    constructor(ids, w, o) {
      G.toastT = 0; this.transparent = true; this.ids = ids; this.i = 0; this.w = w; this.t = 0;
      this.mic = !(o && o.noMic) && G.mic && G.mic.on() ? new G.MicBtn(this, { rect: () => this.micRect(), ready: () => this.t >= 20, heard: a => this.heard(a), again: () => G.speak(G.baseForm(this.ids[this.i])) }) : null;
      this.open();
    }
    onEnter() { if (this.mic) this.mic.arm(); }
    onExit() { if (this.mic) this.mic.off(); }
    open() { this.t = 0; if (this.mic) this.mic.reset(); G.speak(G.baseForm(this.ids[this.i])); }
    micRect() { const b = this.box(); return { x: b.x + 14, y: b.y + 36, w: 36, h: 36 }; } // left of the picture
    heard(alts) {
      if (!G.speech.match(this.word().es, alts).pass) { this.mic.miss(); return; }
      const r = this.micRect(); this.mic.win();
      G.mic.award(this.ids[this.i], r.x + r.w / 2, r.y + r.h / 2);
      G.fx.say('¡Bien dicho!', G.W / 2, this.box().y + 126, '#a8f0ff', true); // under the word
    }
    word() { return D().words[this.ids[this.i]]; }
    box() { return { x: (G.W - 200) / 2, y: 24, w: 200, h: 140 }; }
    spk() { return [(G.W + 200) / 2 - 26, 30]; }
    update() {
      this.t++;
      const b = this.box();
      if (this.t === 1) { G.audio.sfx('pop'); G.fx.confetti(b.x + 8, b.y + b.h - 8, -1, 20); G.fx.confetti(b.x + b.w - 8, b.y + b.h - 8, 1, 20); }
      if (this.t > 16 && this.t % 11 === 0) G.fx.twinkle(G.W / 2 + (Math.random() < 0.5 ? -1 : 1) * (24 + Math.random() * 14), b.y + 24 + Math.random() * 50);
      if (this.t < 20) return;
      if (this.mic && this.mic.update()) return;
      if (G.input.p('C') || G.speakerHit(...this.spk())) { G.speak(G.baseForm(this.ids[this.i])); return; }
      if (G.input.p('A') || G.input.p('B') || G.input.tap()) {
        G.audio.sfx('ok');
        if (++this.i >= this.ids.length) { G.pop(); this.w.resolve(); return; }
        this.open();
      }
    }
    draw(ctx) {
      const wd = this.word(), b = this.box(), x = b.x, y = b.y, cx = G.W / 2, cy = y + b.h / 2;
      const u = Math.min(1, this.t / 16), s = 0.3 + 0.7 * G.fx.easeBack(u), first = this.i === 0;
      // the room dims and soft rays turn behind the card (kept up between words)
      const a = first ? Math.min(1, this.t / 8) : 1;
      ctx.globalAlpha = 0.45 * a; ctx.fillStyle = '#080c28'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1;
      ctx.save(); ctx.globalAlpha = 0.12 * a; ctx.fillStyle = '#f8c838'; ctx.translate(cx, cy); ctx.rotate(G.frame / 300);
      ctx.beginPath();
      for (let k = 0; k < 12; k++) { const a0 = k / 12 * Math.PI * 2, a1 = a0 + Math.PI / 14; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 300, Math.sin(a0) * 300); ctx.lineTo(Math.cos(a1) * 300, Math.sin(a1) * 300); ctx.closePath(); }
      ctx.fill(); ctx.restore();
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.t / 4);
      if (s !== 1) { ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
      G.win(ctx, x, y, b.w, b.h);
      G.textC(ctx, '¡' + STAR + ' Palabra de oro ' + STAR + '!', cx, y + 9, '#f8e060');
      // the picture hops, squashing a little as it lands, over a shadow that shrinks as it rises
      const ph = this.t > 16 ? ((this.t - 16) % 34) / 34 : 0, hop = Math.round(Math.sin(ph * Math.PI) * 7), sq = this.t > 16 && hop === 0 ? 1 : 0;
      const pw = 48 + sq * 4, pht = 48 - sq * 3, px = cx - pw / 2, py = y + 26 + (48 - pht) - hop;
      ctx.fillStyle = 'rgba(0,0,16,0.35)'; ctx.fillRect(cx - 22 + hop, y + 79, 44 - hop * 2, 2);
      ctx.fillStyle = '#000010'; ctx.fillRect(px - 3, py - 3, pw + 6, pht + 6);
      ctx.fillStyle = '#8898e0'; ctx.fillRect(px - 2, py - 2, pw + 4, pht + 4);
      ctx.fillStyle = '#f4ecd8'; ctx.fillRect(px - 1, py - 1, pw + 2, pht + 2);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(G.icon(wd), px, py, pw, pht);
      G.bigText(ctx, wd.es, cx, y + 92, 2, '#f8d860');
      if (G.enVisible()) G.textC(ctx, wd.en, cx, y + 112, '#a8b0d8');
      ctx.restore();
      if (this.t >= 20) G.moreArrow(ctx, x + b.w - 17, y + b.h - 12, this.t);
      if (u >= 1) G.speakerBtn(ctx, ...this.spk());
      if (this.mic && this.t >= 20) this.mic.draw(ctx);
    }
  }
  // The gold card for words that have reached stage 3 and haven't had theirs yet (words.js). Yieldable. o.noMic: the card
  // has no mic (the word was just said out loud); o.force: make the words gold first (older content, tests).
  G.learnWords = function (ids, o = {}) {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(id => {
      if (!D().words[id]) return false;
      if (o.force) S().learn(id);
      const r = G.words.rec(id); if (!r || r.st < 3 || r.gold) return false;
      r.gold = true; return true;
    });
    const w = new G.Wait();
    if (!ids.length) { w.resolve(); return w; }
    G.audio.jingle('item');
    G.push(new WordCard(ids, w, o)); return w;
  };
  G.goldCard = G.learnWords;

  // ---------- Choice screen ----------
  // opts: {prompt (rich text), en, show: picture above, choices, layout: 'cards'|'list', display, mask}
  // A choice is {word: id} or a free {label, icon}. How a word choice looks (opts.display, chosen by G.ask from the
  // answer's stage): 'both' picture + word, 'text' the word only, 'pic' the picture only; an unmet word is never
  // written on a card unless it is the answer (its picture only). Without a display (a free choice, a shop): unmet =
  // picture, met = picture + blue word, gold = the gold word alone. A choice's own pic: true / text: true (or
  // look: 'both' | 'text' | 'pic') always wins. opts.mask: word ids heard but not shown in the prompt (a speaker).
  // With opts.answer, the right pick pops (a star burst and a chime); the Wait resolves at once and the screen
  // closes itself a moment later. With opts.onWrong too (G.ask), a wrong pick wobbles and greys out in place
  // and the question stays up; opts.onRight(rect, x, y, spoken) hears about the right pick (x, y: just above it).
  // Speaking (mic.js): in a G.ask question whose answer is a word, a mic button sits at the bottom right (unless
  // opts.noMic). What the child says is matched against EVERY choice's spoken form: the right one counts as picking it
  // plus a speaking star; a wrong one is just like tapping it; nothing heard or no match: "¡Otra vez!", no penalty.
  const GOLD = '#f8d860', BLUE = '#a8d8ff';
  function view(c, disp, isAns) {
    const W = D().words[c.word] && c.img ? c.img : D().words[c.word]; // (c.img: a picture of its own, e.g. the red ball for rojo)
    if (!W) return { label: c.label, icon: c.icon, col: '#ffffff' };
    const st = S().stage(c.word), label = c.label || G.baseForm(c.word), col = st >= 3 ? GOLD : BLUE;
    const d = c.pic ? 'pic' : c.text ? 'text' : c.look || disp;
    if (d === 'pic') return { label: null, icon: W, col };
    if (d === 'text') return { label, icon: null, col };
    if (st < 1 && !isAns) return { label: null, icon: W, col }; // an unmet word: its picture only
    if (d === 'both') return { label, icon: W, col };
    return { label, icon: st >= 3 ? null : W, col };
  }
  G.choiceView = view;
  class Choice {
    constructor(opts, w) {
      opts = Object.assign({}, opts, { prompt: G.fill(opts.prompt), en: G.fill(opts.en), choices: opts.choices.map(c => c.label ? Object.assign(c, { label: G.fill(c.label) }) : c) });
      this.transparent = true; this.o = opts; this.w = w; this.t = 0; this.i = 0; this.won = null; this.miss = null;
      this.ch = opts.choices; this.cards = opts.layout === 'cards'; this.disp = opts.display || null;
      // (opts.mic: a free choice, no right answer, like the shops in errands.js: saying any choice picks it, with a star)
      const word = (opts.answer != null && opts.onWrong && !opts.noMic && this.ch[opts.answer] && this.ch[opts.answer].word) || (opts.mic && opts.answer == null && this.ch.some(c => c.word));
      this.mic = word && G.mic && G.mic.on() ? new G.MicBtn(this, { rect: () => this.micRect(), ready: () => !this.won && this.t > 8 && (!this.miss || this.miss.t > 8), heard: a => this.heard(a) }) : null;
      while (this.ch[this.i] && this.ch[this.i].off) this.i++;
      if (G.vocabLog) this.vlog(); // (the dev-only log, vocablog.js)
      G.richIds(opts.prompt || '').forEach(id => S().see(id)); // (met words met again; unmet ones stay unmet)
      this.ch.forEach(c => c.word && S().see(c.word));
      this.lines = G.richLayout(opts.prompt || '', G.W - 96, { mask: opts.mask }); // room for the speaker (and back) buttons
      if (!opts.noVoice) G.speak(opts.prompt || ''); // (G.speak reads the [id] words as plain text)
    }
    showId() { const sh = this.o.show; return !sh ? null : typeof sh === 'string' ? (D().words[sh] ? sh : null) : Object.keys(D().words).find(id => D().words[id] === sh) || null; } // (a word's picture above the prompt)
    vlog() {
      const o = this.o, who = o.who || null, show = this.showId();
      G.vlog('shown', G.richIds(o.prompt || ''), { via: 'question', who });
      if (show) G.vlog('shown', show, { via: 'picture', who });
      this.ch.forEach((c, k) => c.word && G.vlog('choice-shown', c.word, { who, pic: !!this.view(k).icon, ans: k === o.answer || null }));
    }
    // the dev-only log: what was picked (spoken right answers are logged as 'said' by G.st.said)
    vlogPick(k, spoken) {
      const o = this.o, c = this.ch[k], who = o.who || null; if (!c.word) return;
      if (o.answer == null || (k !== o.answer && !o.onWrong)) { if (!spoken) G.vlog('picked', c.word, { who }); return; }
      if (k !== o.answer) { G.vlog('wrong', c.word, { who, ans: this.ch[o.answer] && this.ch[o.answer].word, spoken: spoken || null }); return; }
      if (spoken) return;
      const cue = this.cue(k);
      G.vlog('recognized', c.word, { who, pic: !!this.view(k).icon, show: cue.show || null, prompt: cue.prompt || null, cued: cue.cued || null });
    }
    view(k) { return view(this.ch[k], this.disp, k === this.o.answer); }
    // can choice k be found by matching the prompt? Its picture is the prompt's picture (or a token drawn with its
    // picture), or its word is written in the prompt -> {cued, show, prompt}
    cue(k) {
      const c = this.ch[k], v = this.view(k), id = c.word; if (!id) return {};
      const its = []; this.lines.forEach(L => L.items.forEach(it => { if (it.id === id) its.push(it.look); }));
      const pic = this.showId() === id || its.some(l => l === 'pic' || l === 'both'), txt = its.some(l => l === 'both' || l === 'text' || l === 'gold');
      return { cued: (!!v.icon && pic) || (!!v.label && txt), show: this.showId() === id && !!v.icon, prompt: txt && !!v.label };
    }
    onEnter() { if (this.mic) this.mic.arm(); }
    onExit() { if (this.mic) this.mic.off(); }
    micRect() { return { x: G.W - 42, y: G.H - 62, w: 36, h: 36 }; } // the cards and the list keep clear of it (rects)
    heard(alts) { // what the mic heard, against every choice
      const k = G.mic.best(this.ch.map(G.mic.target), alts, this.o.answer);
      if (k < 0 || this.ch[k].off) this.mic.miss(); else this.pick(k, true);
    }
    move(d) {
      const n = this.ch.length; let k = this.i;
      for (let s = 0; s < n; s++) { k = (k + d + n) % n; if (!this.ch[k].off) break; }
      if (k !== this.i) { this.i = k; G.audio.sfx('cursor'); const v = this.view(k); if (v.label && this.ch[k].word) G.speak(v.label); }
    }
    // tap areas: one rect per choice (picture cards or list rows), the speaker and the back button (o.cancel)
    rects() {
      const vs = this.ch.map((c, k) => this.view(k));
      if (this.cards) {
        const n = this.ch.length, cw = 58, gap = this.mic && n > 3 ? 6 : 12, tw = n * cw + (n - 1) * gap, y0 = G.H - 92;
        const x0 = this.mic ? Math.min((G.W - tw) / 2, G.W - 54 - tw) : (G.W - tw) / 2; // (left of the mic)
        return vs.map((v, k) => ({ x: x0 + k * (cw + gap), y: y0, w: cw, h: v.label ? 78 : 62 }));
      }
      const wd = Math.max(...vs.map(v => (v.label ? G.textWidth(v.label) : 0) + (v.icon ? 20 : 0))) + 34;
      const h = this.ch.length * 20 + 8, x = this.mic ? Math.min((G.W - wd) / 2, G.W - 50 - wd) : (G.W - wd) / 2, y = G.H - h - 10;
      return vs.map((v, k) => ({ x, y: y + 4 + k * 20, w: wd, h: 20 }));
    }
    spk() { return [G.W - 38, 12]; }
    backXY() { return [18, 12]; }
    pick(k, spoken) {
      const o = this.o, c = this.ch[k], R = this.rects(), r = R[k];
      if (c.off) { G.audio.sfx('boop'); return; }
      if (G.vocabLog) this.vlogPick(k, spoken);
      this.i = k;
      if (o.answer == null || (k !== o.answer && !o.onWrong)) {
        if (spoken && c.word && this.mic) { const m = this.micRect(); this.mic.win(); G.mic.award(c.word, m.x + m.w / 2, m.y + m.h / 2); G.fx.say('¡Bien dicho!', r.x + r.w / 2, r.y - 12, '#a8f0ff', true); }
        G.pop(); this.w.resolve(k); return;
      }
      const x = r.x + r.w / 2, y = (this.cards ? r.y : R[0].y - 4) - 12; // just above the card (or the list)
      if (k === o.answer) { // resolved now; the scene stays up for the pop, then closes itself (see update)
        this.won = { k, t: 0, spoken: !!spoken }; this.w.resolve(k);
        G.audio.sfx('chime'); G.fx.burst(this.cards ? x : r.x + r.w - 14, r.y + r.h / 2);
        if (o.onRight) o.onRight(r, x, y, !!spoken);
        if (spoken) { const m = this.micRect(); this.mic.win(); G.mic.award(c.word, m.x + m.w / 2, m.y + m.h / 2); } // a speaking star
        return;
      }
      c.off = true; this.miss = { k, t: 0 };
      G.audio.sfx('boop'); G.fx.say('¡Casi!', this.cards ? x : r.x + r.w + 18, this.cards ? y + 4 : r.y + 8, '#ffd8a8');
      o.onWrong(k);
      const n = this.ch.length; // the cursor moves off the greyed card, quietly
      for (let s = 1; s < n; s++) if (!this.ch[(k + s) % n].off) { this.i = (k + s) % n; break; }
    }
    update() {
      this.t++; if (this.miss) this.miss.t++;
      if (this.won) { if (this.mic) { this.mic.t++; if (this.mic.pop) this.mic.pop--; } if (++this.won.t >= (this.won.spoken ? 40 : 24)) G.pop(); return; } // the right card's moment; already answered
      if (this.mic && this.mic.update()) return;
      const calm = !this.miss || this.miss.t > 8; // no answering again mid-wobble
      const d = G.input.repDir(14, 6);
      if (d === (this.cards ? 'left' : 'up')) this.move(-1);
      if (d === (this.cards ? 'right' : 'down')) this.move(1);
      if (G.input.p('C') || (G.speakerHit(...this.spk()) && G.input.eat())) G.speak(this.o.prompt || '');
      if (G.input.tap() && this.t > 8) { // tapping a card (or row) answers with it
        if (this.o.cancel && G.btnHit(...this.backXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); return; }
        const pad = this.cards ? 6 : 0;
        const k = this.rects().findIndex(r => G.tapIn(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad));
        if (k >= 0 && calm) this.pick(k);
        return;
      }
      if (G.input.p('A') && this.t > 8 && calm) { this.pick(this.i); return; }
      if (G.input.p('B') && this.o.cancel) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); }
    }
    draw(ctx) {
      const o = this.o, top = 8;
      const ph = this.lines.length * 16 + 10 + (o.show ? 58 : 0);
      G.win(ctx, 12, top, G.W - 24, ph);
      G.speakerBtn(ctx, ...this.spk());
      if (o.cancel) G.iconBtn(ctx, 'back', ...this.backXY());
      if (o.show) G.drawIcon16(ctx, o.show, G.W / 2 - 24, top + 8, 3, 'card');
      G.richDraw(ctx, this.lines, G.W / 2, top + 5 + (o.show ? 58 : 0), { center: true });
      if (o.en && G.enVisible()) G.enBox(ctx, o.en, top + ph + 1, true);
      const vs = this.ch.map((c, k) => this.view(k)), R = this.rects(), won = this.won, wt = won ? won.t : 0;
      const wob = k => { const m = this.miss; return m && m.k === k && m.t < 16 ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 16)) : 0; }; // a wrong pick wobbles
      const grey = k => { const m = this.miss; return m && m.k === k && m.t < 8 ? m.t / 8 : 1; }; // ...and greys out quickly (0..1)
      const back = k => won && won.k !== k ? Math.min(0.6, wt / 10) : 0; // when the right one pops, the rest step back
      ctx.globalAlpha = 1;
      if (this.cards) {
        const cw = 58, y0 = R[0].y;
        this.ch.forEach((c, k) => {
          const v = vs[k], x = R[k].x + wob(k), h = R[k].h, sel = k === this.i, mine = won && won.k === k;
          const bob = sel && !won ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
          const s = mine ? (wt < 5 ? 1 + 0.24 * wt / 5 : 1.24 - 0.12 * Math.min(1, (wt - 5) / 7)) : 1; // the right card pops
          ctx.save();
          if (s !== 1) { const px = x + cw / 2, py = y0 + h / 2; ctx.translate(px, py); ctx.scale(s, s); ctx.translate(-px, -py); }
          if (mine) { ctx.fillStyle = (wt >> 2) & 1 ? (won.spoken ? '#d8f8ff' : '#fff8c0') : (won.spoken ? '#70e0ff' : '#f8d040'); ctx.fillRect(x - 2, y0 - 1, cw + 4, h + 2); ctx.fillRect(x - 1, y0 - 2, cw + 2, h + 4); }
          G.win(ctx, x, y0 - bob, cw, h, c.off ? { fill1: '#5c6074', fill2: '#363a4c' } : sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {}); // (leaves globalAlpha at 1)
          ctx.globalAlpha = c.off ? 1 - 0.5 * grey(k) : 1;
          const ic = v.icon || (!v.label || !c.word ? D().words[c.word] || c.icon : null); // (a word-only card has no picture: read it, or say it)
          if (ic) {
            G.drawIcon16(ctx, ic, x + cw / 2 - 16, y0 + 12 - bob, 2, sel && !c.off ? 'sel' : 'card');
            if (v.label) G.textC(ctx, v.label, x + cw / 2, y0 + 56 - bob, c.off ? '#a8acb8' : v.col);
          } else if (v.label) {
            const big = G.textWidth(v.label) * 2 <= cw - 6, col = c.off ? '#a8acb8' : v.col;
            if (big) G.bigText(ctx, v.label, x + cw / 2, y0 + 30 - bob, 2, col); else G.textC(ctx, v.label, x + cw / 2, y0 + 34 - bob, col);
          }
          const d = back(k); if (d) { ctx.globalAlpha = d; ctx.fillStyle = '#080c28'; ctx.fillRect(x + 1, y0 - bob + 1, cw - 2, h - 2); }
          ctx.restore();
          if (sel && !won && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', x + cw / 2, y0 - 10 - bob, '#f8e060');
        });
      } else {
        const wd = R[0].w, h = this.ch.length * 20 + 8, x = R[0].x, y = R[0].y - 4;
        G.win(ctx, x, y, wd, h);
        this.ch.forEach((c, k) => {
          const v = vs[k], yy = y + 6 + k * 20, sel = k === this.i, mine = won && won.k === k, dx = wob(k);
          const hop = mine && wt < 10 ? Math.round(Math.sin(wt / 10 * Math.PI) * 3) : 0;
          if (mine) { ctx.fillStyle = (wt >> 2) & 1 ? (won.spoken ? '#d8f8ff' : '#fff8c0') : (won.spoken ? '#70e0ff' : '#f8d040'); ctx.fillRect(x + 4, yy - 3, wd - 8, 22); ctx.fillStyle = '#3a56c8'; ctx.fillRect(x + 5, yy - 2, wd - 10, 20); } // a gold-rimmed row
          ctx.globalAlpha = (c.off ? 1 - 0.7 * grey(k) : 1) * (1 - back(k));
          let tx = x + 18 + dx;
          if (v.icon) { G.drawIcon16(ctx, v.icon, tx, yy - hop); tx += 20; }
          if (v.label) G.text(ctx, v.label, tx, yy + 5 - hop, sel && v.col === '#ffffff' ? '#f8e060' : v.col);
          ctx.globalAlpha = 1;
          if (sel && !won && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x + 8, yy + 5, '#f8e060');
        });
      }
      if (this.mic && (!won || won.spoken)) this.mic.draw(ctx);
    }
  }
  G.choose = function (opts) { const w = new G.Wait(); const s = new Choice(opts, w); w.scene = s; G.push(s); return w; };

  // ---------- Ask until right ----------
  // q: {prompt, en, show, choices, answer: index, layout, learn, who, display, mask, intro, review, credit}
  // Wrong picks wobble and grey out with a soft boop (no lecture) while the question stays up, so every
  // question can be finished. The right pick pops with praise; a first-try answer earns a star (one per word a day).
  // Saying the right answer out loud (the mic, mic.js) answers too, and earns a speaking star on top.
  // The answer word (when it is a {word}) is what the question practises (words.js): an unmet answer is MET by the
  // right pick (the small notebook celebration), a met one is an active retrieval, cued when it could be found by
  // matching the prompt. q.learn lists other words: they are only met (no credit). q.credit: false leaves the model alone.
  // How the cards look comes from the answer's stage unless q.display or a choice's own text / pic / look says:
  //   unmet, met     'both' (picture + word); a met answer in the prompt's words is heard, not shown (q.mask)
  //   known          'text' (the word only: recall from the prompt's picture or the context), or 'pic' when the
  //                  prompt says the word (read it -> pick the picture)
  //   remembered+    'text' when the prompt's picture is the answer (say it / pick its word), else 'pic' with the
  //                  answer heard, not shown (listen -> pick the picture)
  // q.noMic: no mic on this question (say, when saying the answer would only be reading it out).
  // q.wrongAct(k, word): called on a wrong pick (the story reacting to it: Canelo barks instead of coming).
  // Returns true if right on the first try.
  const PRAISE = ['¡Muy bien!', '¡Excelente!', '¡Perfecto!', '¡Fantástico!', '¡Bravo!'];
  const showOf = sh => (!sh ? null : typeof sh === 'string' ? (D().words[sh] ? sh : null) : Object.keys(D().words).find(id => D().words[id] === sh) || null);
  G.askDisplay = function (q) {
    const a = q.choices[q.answer], aid = a && a.word && D().words[a.word] ? a.word : null;
    if (!aid || q.display || q.choices.some(c => c.text || c.pic || c.look)) return { aid, display: q.display || null, mask: q.mask || null };
    const st = S().stage(aid), inPrompt = G.richIds(G.fill(q.prompt || '')).indexOf(aid) >= 0, shown = showOf(q.show) === aid;
    if (st <= 0) return { aid, display: 'both', mask: q.mask || null };
    if (st === 1) return { aid, display: 'both', mask: inPrompt ? [aid] : q.mask || null };
    if (st === 2) return { aid, display: shown ? 'text' : inPrompt ? 'pic' : 'text', mask: q.mask || null };
    return { aid, display: shown ? 'text' : 'pic', mask: inPrompt ? [aid] : q.mask || null };
  };
  G.ask = function* (q) {
    const ch = q.choices.map(c => Object.assign({}, c));
    const ad = G.askDisplay(q), aid = q.credit === false ? null : ad.aid;
    const st0 = aid ? S().stage(aid) : 0, kind = q.intro ? 'intro' : !aid ? null : st0 < 1 ? 'new' : q.review || G.words.isOld(aid) ? 'review' : 'new';
    const ids = (q.learn ? (Array.isArray(q.learn) ? q.learn : [q.learn]) : []).filter(id => id !== aid && D().words[id]);
    let tries = 0, spoken = false, scene = null;
    const wq = G.choose(Object.assign({}, q, {
      choices: ch, display: ad.display, mask: ad.mask,
      onWrong(k) { if (!tries && aid) G.words.answerWrong(aid); tries++; G.fx.shake = 4; if (q.wrongAct) q.wrongAct(k, ch[k] && ch[k].word); }, // (q.wrongAct: what a wrong pick does in the story, chapters.js)
      onRight(rect, x, y, sp) {
        spoken = sp;
        G.fx.say(sp ? '¡Bien dicho!' : PRAISE[G.r(PRAISE.length)], x, y, sp ? '#a8f0ff' : '#f8e060', true);
        if (!tries && aid && !G.words.starToday(aid)) G.fx.flyStar(rect.x + rect.w / 2, rect.y + rect.h / 2, 0); // the word's star (one a day)
      },
    }));
    scene = wq.scene;
    if (G.vocabLog && aid) { const v = scene.view(q.answer); G.vlog('prompt', aid, { kind, st: st0, mode: v.icon && v.label ? 'both' : v.label ? 'text' : 'pic', cued: scene.cue(q.answer).cued || null, who: q.who || null }); }
    const r = yield wq;
    if (r.result !== q.answer) return false; // closed without answering (a question with a way out)
    const first = tries === 0;
    let res = null;
    if (aid) {
      const v = scene.view(q.answer), mode = spoken && !v.label ? 'say' : v.icon && v.label ? 'both' : v.label ? 'text' : 'pic';
      res = G.words.answerRight(aid, { cued: !!scene.cue(q.answer).cued, said: spoken, firstTry: first, mode, review: kind === 'review', how: q.intro ? q.how || 'show' : 'answer' });
    }
    yield 10;
    // a word met just now: its small celebration (it goes in the notebook); co-listed words are only met
    const met = [];
    if (aid && st0 < 1) met.push(aid);
    ids.forEach(id => { if (G.words.meet(id, 'co', { who: q.who })) met.push(id); else G.words.encounter(id); });
    if (met.length && G.intro) G.intro.note(met);
    if (res && res.gold) yield G.learnWords([aid]);
    return first;
  };
  // Choices for a word question from a pool of word ids (distractors shuffled in). opts are copied onto each choice.
  // The distractors are words the child has met when the pool has enough of them; otherwise unmet words of another
  // topic (shown as their pictures only: clearly different, and they stay unmet), then the rest.
  G.wordChoices = function (answerId, pool, n = 3, opts = {}) {
    const top = D().words[answerId] ? D().words[answerId].topic : null;
    const rank = id => (S().seen(id) ? 0 : D().words[id] && D().words[id].topic !== top ? 1 : 2);
    const others = pool.filter((id, i) => id !== answerId && pool.indexOf(id) === i).map(id => ({ id, k: rank(id) + G.rand() * 0.9 })).sort((a, b) => a.k - b.k).slice(0, n - 1).map(o => o.id);
    const ids = others.concat([answerId]).sort(() => G.rand() - 0.5);
    return { choices: ids.map(id => Object.assign({ word: id }, opts, opts.label ? { label: opts.label(id) } : {})), answer: ids.indexOf(answerId) };
  };
  // A sí / no question, shown as two picture cards.
  G.siNo = function* (prompt, yes, extra = {}) {
    return yield* G.ask(Object.assign({ prompt, layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], answer: yes ? 0 : 1 }, extra));
  };

  // ---------- Badge award ----------
  class BadgeCard {
    constructor(q, w) { G.toastT = 0; this.transparent = true; this.q = q; this.w = w; this.t = 0; }
    update() {
      this.t++;
      if (this.t === 1) { G.fx.confetti(G.W / 2 - 96, 140, -1, 18); G.fx.confetti(G.W / 2 + 96, 140, 1, 18); } // a party for a finished errand
      if (this.t > 40 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const q = D().quests[this.q], W = 200, H = 100, x = (G.W - W) / 2, y = 44;
      G.win(ctx, x, y, W, H, { fill1: '#7a4a10', fill2: '#3a2008' });
      G.drawBadge(ctx, this.q, G.W / 2 - 16, y + 14, this.t, 2);
      G.bigText(ctx, q.name, G.W / 2, y + 66, 2, '#fff8e0', '#3a1a00');
      if (G.enVisible()) G.textC(ctx, q.en, G.W / 2, y + 84, '#f8d8a0');
    }
  }
  const BADGE_COL = { saludos: '#e85060', mercado: '#e89030', pelota: '#3a78e0', carta: '#40a848', fiesta: '#b050d0',
    canelo: '#b87038', picnic: '#e05a30', show: '#3a56c8', cansado: '#2a9a9a', cuenta: '#8a50c8', sonidos: '#e0a020', flores: '#e060a0', fiestab: '#c03030' };
  const BADGE_ICON = { saludos: 'hola', mercado: 'manzana', pelota: 'pelota', carta: 'carta', fiesta: 'sol',
    canelo: 'pata', picnic: 'canasta', show: 'cinta', cansado: 'sobre', cuenta: 'diez', sonidos: 'nota', flores: 'flor', fiestab: 'estrella' };
  const qd = id => (G.data.quests[id] || {}); // a chapter's badge: its own colour and picture (content/es/words.js)
  G.drawBadge = function (ctx, id, x, y, t, scale = 1) {
    const s = 16 * scale, col = BADGE_COL[id] || qd(id).col || '#888';
    ctx.fillStyle = '#201008'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 3 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8d040'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 2 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 0.5 * scale, 0, Math.PI * 2); ctx.fill();
    const img = G.icon(BADGE_ICON[id] || qd(id).icon || 'estrella'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x + 2 * scale, y + 2 * scale, 12 * scale, 12 * scale);
    if (t != null && (t % 90) < 12) { ctx.fillStyle = '#ffffff'; const k = (t % 90); ctx.fillRect(x + k * scale * 1.2, y + 2, scale, s - 4); }
  };
  G.badge = function (id) { const w = new G.Wait(); G.audio.jingle('promote'); G.push(new BadgeCard(id, w)); return w; };

  // ---------- New errand card: who asked -> what they want, in pictures ----------
  class QuestCard {
    constructor(id, w) { G.toastT = 0; this.transparent = true; this.id = id; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 30 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const q = D().quests[this.id], gw = G.goalWidth(q.goal), W = Math.max(150, gw + 80), H = 64, x = (G.W - W) / 2, y = 50 + Math.max(0, 10 - this.t);
      G.win(ctx, x, y, W, H, { fill1: '#2a6a3a', fill2: '#103a1c' });
      G.textC(ctx, '¡Misión!', G.W / 2, y + 8, '#f8e060');
      const gx = (G.W - (gw + 48)) / 2;
      ctx.drawImage(G.unitSprite(D().npcs[q.giver].map, 'down', (this.t >> 4) & 1), gx, y + 24);
      G.drawIcon16(ctx, 'flecha', gx + 28, y + 28);
      G.drawGoal(ctx, q.goal, gx + 48, y + 28);
      if (G.enVisible()) G.textC(ctx, q.en, G.W / 2, y + H + 4, '#f8e8b0');
    }
  }
  G.questCard = function (id) { const w = new G.Wait(); G.audio.sfx('buff'); G.push(new QuestCard(id, w)); return w; };

  // ---------- Picture goals (Misiones, thought bubbles) ----------
  // goal: [[word, count], '>', ...] -> draws icons left to right; returns width
  G.drawGoal = function (ctx, goal, x, y) {
    let cx = x;
    for (const g of goal) {
      if (g === '>') { G.drawIcon16(ctx, 'flecha', cx, y); cx += 18; continue; }
      const [id, n] = g;
      for (let i = 0; i < n; i++) { G.drawIcon16(ctx, D().words[id] || id, cx, y); cx += n > 1 ? 12 : 18; }
      if (n > 1) cx += 8;
    }
    return cx - x;
  };

  G.goalWidth = goal => goal.reduce((w, g) => w + (g === '>' ? 18 : g[1] > 1 ? g[1] * 12 + 8 : 18), 0);

  G.nameOf = function (who) {
    if (who === 'player') return S().playerName();
    return D().npcs[who] ? D().npcs[who].name : null;
  };
})();
