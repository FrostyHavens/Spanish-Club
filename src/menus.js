// ===== Field menu: Cuaderno (notebook), Misiones (errands), Guardar (save), Opciones =====
'use strict';
(function () {
  const D = () => G.data, S = () => G.st;
  const STAR = '\u0005';

  G.fieldMenu = function* (field) {
    while (true) {
      const c = yield G.cross({
        up: { label: 'Cuaderno', icon: 'book' }, left: { label: 'Misiones', icon: 'quest' },
        right: { label: 'Guardar', icon: 'save' }, down: { label: 'Opciones', icon: 'gear' },
      }, { x: G.W / 2 - 40, y: G.H / 2 + 20 });
      const op = c.result; if (!op) return;
      if (op === 'up') yield G.notebook();
      else if (op === 'left') yield G.questLog();
      else if (op === 'right') {
        yield G.say({ t: '¿Quieres guardar tu progreso?', en: 'Do you want to save your progress?' }, { noVoice: true });
        const r = yield G.confirm();
        if (r.result === 0) { const ok = S().save(); G.audio.sfx(ok ? 'item' : 'error'); yield G.say(ok ? { t: '¡Guardado!', en: 'Saved!' } : { t: 'No se pudo guardar.', en: 'Could not save (browser storage is blocked).' }); }
      } else if (op === 'down') yield* G.options();
    }
  };

  // ---------- Cuaderno: words by topic, with pictures, stars and English ----------
  class Notebook {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.ti = 0; this.wi = 0; }
    topic() { return D().topicOrder[this.ti]; }
    all() { const tp = this.topic(); return Object.keys(D().words).filter(id => D().words[id].topic === tp); }
    update() {
      this.t++;
      const d = G.input.repDir(14, 5), ids = this.all();
      if (d === 'left' || d === 'right') { this.ti = (this.ti + (d === 'left' ? -1 : 1) + D().topicOrder.length) % D().topicOrder.length; this.wi = 0; G.audio.sfx('cursor'); }
      if (d === 'up' || d === 'down') { this.wi = (this.wi + (d === 'up' ? -1 : 1) + ids.length) % ids.length; G.audio.sfx('cursor'); }
      if (G.input.p('A')) { const id = ids[this.wi]; if (S().knows(id)) G.speak(D().words[id].es.split(' / ')[0]); else G.audio.sfx('error'); }
      if (G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      const tp = D().topics[this.topic()], ids = this.all(), known = ids.filter(S().knows).length;
      // tab strip
      ctx.fillStyle = '#7a4a20'; ctx.fillRect(14, 30, G.W - 28, 1);
      G.text(ctx, '<', 16, 14, '#7a4a20', null); G.textR(ctx, '>', G.W - 16, 14, '#7a4a20', null);
      G.textC(ctx, 'CUADERNO', G.W / 2, 11, '#a05020', null);
      G.textC(ctx, tp.name + '  (' + known + '/' + ids.length + ')', G.W / 2, 20, '#302018', null);
      // word rows
      ids.forEach((id, k) => {
        const wd = D().words[id], y = 36 + k * 22, sel = k === this.wi, kn = S().knows(id);
        if (sel) { ctx.fillStyle = '#f8e0a0'; ctx.fillRect(14, y - 2, G.W - 28, 21); }
        if (kn) {
          G.drawIcon16(ctx, wd, 20, y);
          G.text(ctx, wd.es, 42, y + 1, '#202040', null);
          G.text(ctx, wd.en, 42, y + 10, '#8a7a60', null);
          const st = S().wordStars(id);
          for (let s = 0; s < 3; s++) G.text(ctx, STAR, G.W - 46 + s * 8, y + 5, s < st ? '#e0a010' : '#c8bca0', null);
        } else {
          ctx.fillStyle = '#d8ccb0'; ctx.fillRect(20, y, 16, 16);
          G.text(ctx, '?', 26, y + 4, '#a89878', null);
          G.text(ctx, '. . . . .', 42, y + 5, '#b8a888', null);
        }
      });
      G.text(ctx, 'A', 14, G.H - 18, '#a05020', null); G.text(ctx, 'escuchar', 22, G.H - 18, '#806040', null);
      G.textR(ctx, STAR + ' ' + G.state.stars, G.W - 14, G.H - 18, '#c08010', null);
    }
  }
  G.notebook = function () { const w = new G.Wait(); G.push(new Notebook(w)); return w; };

  // ---------- Misiones: errands + badges ----------
  class QuestLog {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (G.input.p('A') || G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); } }
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12);
      G.textC(ctx, 'MISIONES', G.W / 2, 12, '#f8e060');
      const list = D().questOrder.filter(id => S().quest(id));
      if (!list.length) G.textC(ctx, 'Todavía no tienes misiones.', G.W / 2, 60, '#a0a8d0');
      let y = 28;
      list.forEach(id => {
        const q = D().quests[id], done = S().done(id);
        G.text(ctx, done ? '\u0005' : '\u0002', 16, y, done ? '#f8d030' : '#ffffff');
        G.text(ctx, q.name, 26, y, done ? '#a0a8d0' : '#ffffff');
        G.textR(ctx, done ? '¡Hecho!' : q.giver, G.W - 16, y, done ? '#80e080' : '#9098c8');
        if (!done) {
          G.text(ctx, G.enVisible() ? q.goalEn : q.goal, 26, y + 11, G.enVisible() ? '#f8e8b0' : '#c8d0f0');
          y += 11;
        }
        y += 15;
      });
      G.text(ctx, 'INSIGNIAS', 16, G.H - 50, '#f8e060');
      ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'].forEach((id, k) => {
        const x = 20 + k * 40, yy = G.H - 38;
        if (S().done(id)) G.drawBadge(ctx, id, x, yy, this.t + k * 18);
        else { ctx.fillStyle = '#0a1040'; ctx.beginPath(); ctx.arc(x + 8, yy + 8, 10, 0, Math.PI * 2); ctx.fill(); G.textC(ctx, '?', x + 8, yy + 4, '#404878'); }
      });
      G.enHint(ctx, G.W - 56, G.H - 20);
    }
  }
  G.questLog = function () { const w = new G.Wait(); G.push(new QuestLog(w)); return w; };

  // ---------- Opciones ----------
  G.options = function* () {
    let start = 0;
    while (true) {
      const o = G.state.opts, yes = v => v ? 'Sí' : 'No';
      const r = yield G.menu([
        { label: 'Inglés siempre', right: yes(o.english), en: 'Always show English translations' },
        { label: 'Voz en español', right: yes(o.voice), en: 'Read Spanish aloud (if your browser has a Spanish voice)' },
        { label: 'Música y sonido', right: yes(!G.audio.muted), en: 'Music and sound effects' },
      ], { title: 'OPCIONES', start, w: 190 });
      if (r.result < 0) return;
      start = r.result;
      if (r.result === 0) o.english = !o.english;
      else if (r.result === 1) { o.voice = !o.voice; if (o.voice) G.speak('¡Hola!'); else try { speechSynthesis.cancel(); } catch (e) { } }
      else G.audio.toggleMute();
    }
  };
})();
