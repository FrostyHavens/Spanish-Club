// ===== Meeting new words (one-unknown puzzles), review questions, and the notebook's page puzzles =====
// docs/LEARNING_DESIGN.md. A new word arrives as a little puzzle with one unknown, among things the child already knows,
// and is confirmed right away: it glows, its name is said again and it flies into the notebook (G.intro.note, the small
// celebration; the big gold card is for remembering, learn.js). Every meeting schedules its first real use (words.js:
// due again at +1.5 min, then +6 min; G.review asks those first).
//
// G.intro (generators unless noted; o.who is who's talking: their portrait and name):
//   show(id, {who, prompt, en, ask, known: [2 ids], how})   "show and name": the thing is held up and named
//        ("¡Mira! ¡[id]!", its picture over the box), then "¿Qué es?" with the new word (written, no picture) among
//        known ones (their pictures): pick the one you don't know yet. Without known words it is just named.
//   watch(id, {who, prompt, en, act: function* () {...}, ask, known})   "watch and do" (actions, commands): it is said,
//        act() shows it happen; then "¡Ahora tú!" (the mic is on): pick or say it, and act() happens again for you.
//   listen(id, {who, prompt, en, sound: () => {...}, answer: id of the right picture (default id), known})   "listen and
//        point": the word is heard (and sound() plays), the prompt shows a speaker; pick its picture among known ones.
//   find(id, {who, prompt, en, map, at: [x, y], wrong: [[x, y], ...]})   "find it": someone needs a thing ("¿Y mi
//        [id]?"); it returns at once, and the child walks to the right thing on the map and taps it (field.js asks
//        spotAt / runFind; hint.js and the bot see targets(f)). A wrong thing names itself and gets a gentle "¿...?".
//        found(id) once it was found; seeking(who) the word someone is waiting for (for their thought bubble).
//   meet(id, how, o)  meet a word from a puzzle of your own (not a generator): the model and the small celebration
//   note(ids) -> Wait  the small celebration for words just met (a paper card with the picture and the blue word
//        pops up, says the word and flies into the notebook button); yield it to let the word be heard (~0.6 s)
//   known(id, n) n met words to go with id in a one-unknown puzzle (another topic, stronger first)
// Content checks G.budget.canIntro(n) before introducing (words.js) and defers when it's false ("¡Mañana!").
// G.review.ask(id, {who, prompt, en, pool, layout}) one question for a met word, fit for its stage: met -> hear it
//   (a speaker in the prompt) and pick among picture + word cards; known -> its picture, pick its word; remembered+
//   -> its picture, say it or pick its word (the mic is on), or hear it and pick its picture. Counted as review.
// Page puzzles (G.pages): a notebook page's sparkle on the map (maps.js `pages`) is a puzzle: 4 pictures of words from
//   that page you've met, and their 4 words, shuffled; tap a picture and then its word (or drag the word onto it).
//   Right: they join and the word is said; wrong: a wobble and "¡Casi!". All four: a star. ready(page) (4+ met words,
//   not solved, or solved on an earlier day with 2+ of them due again), words(page), run(page) (yieldable), visible()
//   (the notebook's pages: those with a met word).
'use strict';
(function () {
  const D = () => G.data, S = () => G.st, Wd = () => G.words;
  const I = G.intro = {};
  const TT = (t, en) => ({ t, en });
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = G.r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sayAs = (who, pages, o) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, o || {}));

  // ---------- the small celebration: into the notebook ----------
  const notes = [];   // {id, t, delay}
  const LIFE = 84, FLY = 22;
  I.note = function (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(id => D().words[id]);
    const w = new G.Wait();
    ids.forEach((id, k) => notes.push({ id, t: -k * 36 }));
    if (!ids.length) { w.resolve(); return w; }
    const until = G.frame + 36 + (ids.length - 1) * 36;
    w.done = () => G.frame >= until || w.fin; // yieldable: a short pause so the word is heard
    return w;
  };
  I.step = function () {
    for (let i = notes.length - 1; i >= 0; i--) {
      const nt = notes[i]; nt.t++;
      if (nt.t === 1) { G.audio.sfx('note'); G.speak(G.baseForm(nt.id)); for (let k = 0; k < 4; k++) G.fx.twinkle(G.W / 2 + (Math.random() - 0.5) * 70, 40 + Math.random() * 30); }
      if (nt.t === LIFE) G.audio.sfx('select');
      if (nt.t > LIFE + 4) notes.splice(i, 1);
    }
  };
  I.busy = () => notes.length > 0;
  I.draw = function (ctx) {
    for (const nt of notes) {
      if (nt.t <= 0) continue;
      const wd = D().words[nt.id], t = nt.t, w = 30 + Math.max(40, G.textWidth(wd.es.split(' / ')[0])), h = 40;
      const pop = Math.min(1, t / 10), s0 = 0.3 + 0.7 * G.fx.easeBack(pop);
      const fly = t > LIFE - FLY ? (t - (LIFE - FLY)) / FLY : 0; // 0..1 into the notebook button (top right)
      const cx0 = G.W / 2, cy0 = 54, cx1 = G.W - 16, cy1 = 16, e = fly * fly;
      const cx = cx0 + (cx1 - cx0) * e, cy = cy0 + (cy1 - cy0) * e - Math.sin(fly * Math.PI) * 18, sc = s0 * (1 - 0.8 * fly);
      ctx.save(); ctx.globalAlpha = fly > 0.85 ? (1 - fly) / 0.15 : 1;
      ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(Math.sin(t / 7) * 0.03 + fly * 0.5);
      ctx.fillStyle = '#5a3810'; ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      ctx.fillStyle = '#f8f0dc'; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#e0d0b0'; for (let y = -h / 2 + 9; y < h / 2; y += 8) ctx.fillRect(-w / 2 + 3, y, w - 6, 1); // notebook lines
      ctx.fillStyle = '#e88080'; ctx.fillRect(-w / 2 + 26, -h / 2, 1, h);                                        // the margin
      const hop = t < 30 ? Math.round(Math.abs(Math.sin(t / 30 * Math.PI * 2)) * -2) : 0;
      G.drawIcon16(ctx, wd, -w / 2 + 5, -8 + hop);
      G.text(ctx, wd.es.split(' / ')[0], -w / 2 + 31, -4, '#2860a8', null);
      G.text(ctx, '+', w / 2 - 9, -h / 2 + 2, '#40a848', null);
      ctx.restore();
      if (t > 12 && t < LIFE - FLY && t % 9 === 0) G.fx.twinkle(cx + (Math.random() - 0.5) * w, cy + (Math.random() - 0.5) * h);
    }
  };
  I.meet = function (id, how, o = {}) { const fresh = Wd().meet(id, how || 'meet', o); if (fresh) I.note([id]); return fresh; };

  // ---------- picking the known words for a one-unknown puzzle ----------
  I.known = function (id, n = 2, o = {}) {
    const top = D().words[id] && D().words[id].topic, ex = o.exclude || [];
    const c = Wd().list(1).filter(k => k !== id && ex.indexOf(k) < 0 && G.iconDrawn(k) && G.baseForm(k) !== G.baseForm(id));
    const score = k => (D().words[k].topic === top ? 2 : 0) + (Wd().stage(k) >= 2 ? 0 : 1) + G.rand();
    return c.sort((a, b) => score(a) - score(b)).slice(0, n);
  };
  const ask = (id, o, choices, extra) => {
    const ch = shuffle(choices.slice());
    return Object.assign({ prompt: o.ask || '¿Qué es?', en: o.askEn || 'Which one is it?', choices: ch, answer: ch.findIndex(c => c.word === (o.answer || id)), layout: 'cards', who: o.who || null, intro: id, how: o.how }, extra || {});
  };

  // ---------- show and name ----------
  I.show = function* (id, o = {}) {
    if (!D().words[id]) return false;
    yield sayAs(o.who, [TT(o.prompt || '¡Mira! ¡[' + id + ']!', o.en || 'Look!')], { show: id });
    if (Wd().met(id)) return true;
    const known = o.known || I.known(id, 2);
    if (!known.length) { I.meet(id, o.how || 'show', { who: o.who }); yield 40; return true; }
    // the new word written, the known ones as pictures: which word is this thing? (the one you don't know yet)
    yield* G.ask(ask(id, Object.assign({ how: 'show' }, o), [{ word: id, look: 'text' }].concat(known.map(k => ({ word: k, look: 'both' }))), { show: id }));
    return true;
  };

  // ---------- watch and do ----------
  I.watch = function* (id, o = {}) {
    if (!D().words[id]) return false;
    yield sayAs(o.who, [TT(o.prompt || '¡Mira! ¡[' + id + ']!', o.en || 'Watch!')]);
    if (o.act) yield* o.act();
    const known = o.known || I.known(id, 2);
    if (known.length && !Wd().met(id)) {
      yield* G.ask(ask(id, Object.assign({ how: 'watch', ask: o.ask || '¡Ahora tú!', askEn: o.askEn || 'Now you! (say it, or tap it)' }, o), [{ word: id, look: 'both' }].concat(known.map(k => ({ word: k, look: 'both' })))));
    } else I.meet(id, o.how || 'watch', { who: o.who });
    if (o.act) yield* o.act();
    return true;
  };

  // ---------- listen and point ----------
  I.listen = function* (id, o = {}) {
    if (!D().words[id]) return false;
    const right = o.answer || id;
    const known = o.known || I.known(right, 2, { exclude: [id] });
    if (o.sound) o.sound();
    const prompt = o.prompt || '¡[' + id + ']!';
    if (!known.length) { yield sayAs(o.who, [TT(prompt, o.en || 'Listen!')]); I.meet(id, o.how || 'listen', { who: o.who }); yield 40; return true; }
    const q = ask(id, Object.assign({ how: 'listen', answer: right, ask: prompt, askEn: o.en || 'Listen! Which one?' }, o), [{ word: right, look: 'pic' }].concat(known.map(k => ({ word: k, look: 'pic' }))), { mask: [id] });
    yield* G.ask(q); // (when the sound is the new word, its animal, the right picture, is what's credited)
    if (right !== id && !Wd().met(id)) { I.meet(id, o.how || 'listen', { who: o.who }); yield 40; }
    return true;
  };

  // ---------- find it (on the map) ----------
  const finds = () => { const s = G.state; if (!s.finds || typeof s.finds !== 'object') s.finds = {}; return s.finds; };
  const key = (x, y) => x + ',' + y;
  I.find = function* (id, o = {}) {
    if (!D().words[id] || !o.map || !o.at) return false;
    finds()[id] = { who: o.who || null, map: o.map, at: key(...o.at), wrong: (o.wrong || []).map(p => key(...p)), found: false, how: o.how || 'find', pics: o.pics || null };
    S().autosave();
    if (G.vocabLog) G.vlog('find-start', id, { who: o.who || null });
    if (!o.silent) yield sayAs(o.who, [TT(o.prompt || '¿Y mi [' + id + ']?', o.en || 'Where is my...? (find it and tap it)')]);
    return true;
  };
  // o.pics: [[x, y, icon], ...] picture bubbles over the places to choose from (places: the right one shows its own
  // picture, the others theirs, no words), drawn until it's found
  I.drawUnder = function (f, ctx) {
    if (!G.state || !f || G.top() !== f) return;
    const F = finds();
    for (const id in F) {
      const s = F[id]; if (s.found || s.map !== f.mapId || !s.pics) continue;
      for (const [x, y, ic] of s.pics) G.drawAlert(ctx, ic, x * G.TILE - Math.round(f.cam.x), y * G.TILE - Math.round(f.cam.y) + 4, f.t + x * 7);
    }
  };
  I.clearFind = id => { if (G.state && finds()[id]) delete finds()[id]; };
  I.found = id => !!(G.state && finds()[id] && finds()[id].found);
  I.seeking = who => { if (!G.state) return null; const F = finds(); for (const id in F) if (F[id].who === who && !F[id].found) return id; return null; };
  I.spotAt = function (f, x, y) {
    if (!G.state || !f) return null;
    const F = finds(), k = key(x, y);
    for (const id in F) { const s = F[id]; if (s.found || s.map !== f.mapId) continue; if (s.at === k) return { id, right: true }; if (s.wrong.indexOf(k) >= 0) return { id, right: false }; }
    return null;
  };
  I.runFind = function* (f, m, x, y) {
    const s = finds()[m.id];
    if (!m.right) { // not that one: it says what it is (if it has a word), and a gentle "¿...?"
      if (G.vocabLog) G.vlog('find-wrong', m.id);
      if (!(G.world && G.world.nameTile(f, x, y, { noMic: true, noIntro: true }))) G.audio.sfx('boop');
      const [sx, sy] = [x * G.TILE + 12 - Math.round(f.cam.x), y * G.TILE - Math.round(f.cam.y)];
      G.fx.say('¿...?', sx, sy - 14, '#ffd8a8'); yield 30; return;
    }
    s.found = true; f.wig = { x, y, t: 18 };
    const [sx, sy] = [x * G.TILE + 12 - Math.round(f.cam.x), y * G.TILE + 8 - Math.round(f.cam.y)];
    G.audio.sfx('chime'); G.fx.burst(sx, sy);
    if (Wd().meet(m.id, s.how || 'find', { who: s.who })) yield I.note([m.id]); // (a word already met: found again, no new card)
    yield 20;
    S().autosave();
  };
  I.targets = function (f) {
    if (!G.state || !f) return [];
    const F = finds(), T = G.TILE, out = [];
    for (const id in F) { const s = F[id]; if (!s.found && s.map === f.mapId) { const [x, y] = s.at.split(',').map(Number); out.push({ x: x * T + 12, y: y * T + 12, find: id }); } }
    return out;
  };

  // ---------- a review question for a word, fit for its stage ----------
  G.review.ask = function* (id, o = {}) {
    const st = Wd().stage(id); if (st < 1) return false;
    const top = D().words[id].topic, met = Wd().list(1).filter(k => k !== id && G.baseForm(k) !== G.baseForm(id));
    let pool = o.pool || met.filter(k => D().words[k].topic === top);
    if (pool.length < 2) pool = pool.concat(shuffle(met.filter(k => pool.indexOf(k) < 0)).slice(0, 2 - pool.length));
    const c = G.wordChoices(id, [id].concat(pool), Math.min(3, pool.length + 1));
    const r = Wd().rec(id), hear = st === 1 || (st >= 3 && (r.n % 2 === 1 || !(G.mic && G.mic.on())));
    const q = hear ? { prompt: o.prompt || '¿[' + id + ']?', en: o.en || 'Which one? (listen)' } : { prompt: o.prompt || '¿Qué es?', en: o.en || 'What is it?', show: id };
    return yield* G.ask(Object.assign(q, { choices: c.choices, answer: c.answer, layout: o.layout || 'cards', who: o.who || null, review: true }));
  };

  // ---------- page puzzles ----------
  const P = G.pages = {};
  const pageWords = id => (D().pages[id] ? D().pages[id].words : []);
  P.visible = () => D().pageOrder.filter(p => pageWords(p).some(w => Wd().met(w)));
  P.solvedDay = id => { const v = G.state && G.state.pages[id]; return !v ? null : typeof v === 'object' ? v.d | 0 : 0; };
  // a page's sparkle waits for 4 of its words KNOWN (stage 2+: picked once without a cue), known before this session
  // (CURRICULUM.md 5: at the earliest in the next session after the 4th), and comes back on a later day with 2+ due
  const ripe = w => { const r = Wd().rec(w); return !!r && r.st >= 2 && (r.ms < Wd().sess() || r.how === 'old' || r.how === 'learn'); };
  P.ready = function (id) {
    if (!G.state || !D().pages[id]) return false;
    const met = pageWords(id).filter(ripe); if (met.length < 4) return false;
    const d = P.solvedDay(id); if (d == null) return true;
    return d < Wd().day() && met.filter(w => Wd().due(w)).length >= 2;
  };
  // the 4 words to match (never one only met): due ones first, then the weakest, then the least recently met
  P.words = function (id) {
    const met = pageWords(id).filter(w => Wd().stage(w) >= 2);
    const sc = w => (Wd().due(w) ? 0 : 10) + Wd().stage(w) * 2 + G.rand();
    return shuffle(met.sort((a, b) => sc(a) - sc(b)).slice(0, 4));
  };
  P.run = function* (id) {
    const ids = P.words(id); if (ids.length < 4) return false;
    if (G.vocabLog) { ids.forEach(w => G.vlog('prompt', w, { kind: 'review', st: Wd().stage(w), mode: 'match', via: 'page' })); G.vlog.ev({ ty: 'puzzle', page: id }); }
    const r = yield P.open(id, ids);
    if (!r.result) return false; // closed before the end
    S().solvePage(id);
    yield 10;
    return true;
  };
  class PagePuzzle {
    constructor(w, id, ids) {
      G.toastT = 0; this.transparent = true; this.w = w; this.page = id; this.t = 0;
      this.pics = ids.slice(); this.words = shuffle(ids.slice()); // word card j says words[j]
      this.match = {};        // picture k -> matched (true)
      this.tried = {};        // word id -> a wrong attempt was made with its picture
      this.sel = null;        // {kind: 'pic' | 'word', k}
      this.miss = null;       // {pk, wk, t}
      this.drag = null;       // word card j being dragged
      this.done = 0; this.ki = 0;
    }
    onEnter() { G.audio.sfx('note'); }
    picRect(k) { return { x: 22 + k * 72, y: 42, w: 60, h: 58 }; }
    wordRect(j) {
      const k = this.pics.indexOf(this.words[j]);
      if (this.match[k]) { const p = this.picRect(k); return { x: p.x - 2, y: p.y + 64, w: 64, h: 24, joined: true }; }
      return { x: 20 + j * 72, y: 150, w: 64, h: 26 };
    }
    closeXY() { return [G.W - 30, 8]; }
    hintXY() { return null; } // never point at an answer
    tryPair(k, j) {
      const pid = this.pics[k], wid = this.words[j];
      if (this.match[k]) return;
      if (pid === wid) {
        this.match[k] = true; this.sel = null;
        const r = this.picRect(k); G.audio.sfx('chime'); G.fx.burst(r.x + r.w / 2, r.y + r.h / 2); G.speak(G.baseForm(pid));
        const first = !this.tried[pid];
        Wd().answerRight(pid, { mode: 'match', firstTry: first, review: true, noStar: true });
        if (Object.keys(this.match).length === this.pics.length) { this.done = 1; G.audio.jingle('item'); G.fx.confetti(40, 200, 1, 20); G.fx.confetti(G.W - 40, 200, -1, 20); }
        return;
      }
      if (!this.tried[pid]) { this.tried[pid] = true; Wd().answerWrong(pid); }
      if (G.vocabLog) G.vlog('wrong', wid, { ans: pid, via: 'page' });
      this.miss = { pk: k, wj: j, t: 0 }; this.sel = null;
      G.audio.sfx('boop'); const r = this.picRect(k); G.fx.say('¡Casi!', r.x + r.w / 2, r.y - 6, '#ffd8a8');
    }
    tapPic(k) {
      if (this.match[k]) return;
      if (this.sel && this.sel.kind === 'word') { this.tryPair(k, this.sel.k); return; }
      this.sel = { kind: 'pic', k }; G.audio.sfx('cursor');
    }
    tapWord(j) {
      const k = this.pics.indexOf(this.words[j]); if (this.match[k]) { G.speak(G.baseForm(this.words[j])); return; }
      G.speak(G.baseForm(this.words[j])); // hearing a word never gives its picture away
      if (this.sel && this.sel.kind === 'pic') { this.tryPair(this.sel.k, j); return; }
      this.sel = { kind: 'word', k: j }; G.audio.sfx('cursor');
    }
    update() {
      this.t++; if (this.miss && ++this.miss.t > 18) this.miss = null;
      if (this.done) {
        if (++this.done === 30) { G.state.stars++; G.fx.flyStar(G.W / 2, 110, 0); S().autosave(); }
        if (this.done > 70 && (G.input.tap() || G.input.p('A') || G.input.p('B') || this.done > 150)) { G.pop(); this.w.resolve(true); }
        return;
      }
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(false); return; }
      const ptr = G.input.ptr;
      // dragging a word card onto a picture
      if (ptr.down && this.drag == null && ptr.held > 6) {
        const j = this.words.findIndex((w, j) => { const r = this.wordRect(j); return !r.joined && ptr.sx >= r.x && ptr.sx < r.x + r.w && ptr.sy >= r.y && ptr.sy < r.y + r.h; });
        if (j >= 0 && Math.abs(ptr.x - ptr.sx) + Math.abs(ptr.y - ptr.sy) > 6) { this.drag = j; this.sel = null; }
      }
      if (this.drag != null && !ptr.down) {
        const j = this.drag; this.drag = null;
        const k = this.pics.findIndex((p, k) => { const r = this.picRect(k); return ptr.x >= r.x - 4 && ptr.x < r.x + r.w + 4 && ptr.y >= r.y - 4 && ptr.y < r.y + r.h + 24; });
        if (k >= 0) this.tryPair(k, j);
        return;
      }
      if (this.drag != null) return;
      const tap = G.input.tap();
      if (tap && this.t > 8) {
        const k = this.pics.findIndex((p, k) => G.tapIn(this.picRect(k)));
        if (k >= 0) { this.tapPic(k); return; }
        const j = this.words.findIndex((w, j) => G.tapIn(this.wordRect(j)));
        if (j >= 0) { this.tapWord(j); return; }
      }
      // keys: left / right moves along the pictures (or, once one is chosen, the words); A takes it
      const words = this.sel && this.sel.kind === 'pic', d = G.input.repDir(14, 6);
      const free = [0, 1, 2, 3].filter(i => !this.match[words ? this.pics.indexOf(this.words[i]) : i]);
      if (!free.length) return;
      if (free.indexOf(this.ki) < 0) this.ki = free[0];
      if (d === 'left' || d === 'right') { const i = free.indexOf(this.ki); this.ki = free[(i + (d === 'left' ? -1 : 1) + free.length) % free.length]; G.audio.sfx('cursor'); }
      if (G.input.p('A') && this.t > 8) { if (words) this.tapWord(this.ki); else this.tapPic(this.ki); this.ki = -1; }
    }
    draw(ctx) {
      const u = Math.min(1, this.t / 10);
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      ctx.globalAlpha = u;
      const tp = D().topics[D().pages[this.page].topic];
      G.drawIcon16(ctx, 'pagina', 18, 12);
      G.textC(ctx, tp.name, G.W / 2, 18, '#a05020', null);
      if (G.enVisible()) G.textC(ctx, 'Match each picture with its word', G.W / 2, 28, '#a09070', null);
      G.closeBtn(ctx, ...this.closeXY());
      const keys = G.hint && G.hint.keyboard && G.hint.keyboard(), keyPic = keys && !(this.sel && this.sel.kind === 'pic'), wob = (m, on) => (m && on ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 18)) : 0);
      this.pics.forEach((id, k) => {
        const r = this.picRect(k), sel = this.sel && this.sel.kind === 'pic' && this.sel.k === k, ok = this.match[k], dx = wob(this.miss, this.miss && this.miss.pk === k);
        const bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        ctx.fillStyle = ok ? '#e8b830' : sel ? '#3a56c8' : '#8a6a40'; ctx.fillRect(r.x - 2 + dx, r.y - 2 - bob, r.w + 4, r.h + 4);
        ctx.fillStyle = ok ? '#fff4c8' : '#fffaf0'; ctx.fillRect(r.x + dx, r.y - bob, r.w, r.h);
        G.drawIcon16(ctx, id, r.x + 6 + dx, r.y + 5 - bob, 3);
        if (keyPic && k === this.ki && !ok && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 11, '#a05020', null);
      });
      this.words.forEach((id, j) => {
        let r = this.wordRect(j); const pk = this.pics.indexOf(id), ok = this.match[pk], sel = this.sel && this.sel.kind === 'word' && this.sel.k === j;
        if (this.drag === j) { const p = G.input.ptr; r = { x: p.x - r.w / 2, y: p.y - r.h / 2, w: r.w, h: r.h }; }
        const dx = wob(this.miss, this.miss && this.miss.wj === j), bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        ctx.fillStyle = ok ? '#e8b830' : sel ? '#3a56c8' : '#5a3810'; ctx.fillRect(r.x - 1 + dx, r.y - 1 - bob, r.w + 2, r.h + 2);
        ctx.fillStyle = ok ? '#fff4c8' : sel ? '#dce4ff' : '#ffffff'; ctx.fillRect(r.x + dx, r.y - bob, r.w, r.h);
        const st = Wd().stage(id);
        G.textC(ctx, G.baseForm(id), r.x + r.w / 2 + dx, r.y + r.h / 2 - 4 - bob, st >= 3 ? '#a06008' : '#2860a8', null);
        if (keys && !keyPic && !ok && j === this.ki && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 11, '#a05020', null);
        if (ok) { ctx.fillStyle = '#c89020'; ctx.fillRect(r.x + r.w / 2, r.y - 6, 1, 6); } // joined to its picture
      });
      ctx.globalAlpha = 1;
      if (this.done) { G.bigText(ctx, '¡Muy bien!', G.W / 2, 186, 2, '#f8d040', '#5a2c04'); }
    }
  }
  P.open = function (id, ids) { const w = new G.Wait(); G.push(new PagePuzzle(w, id, ids)); return w; };
})();
