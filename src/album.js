// ===== Round B: the animal album (from the field menu's paw) and the Amigos page (everyone's hearts) =====
// One card per animal in G.animals.list() order. Not met yet: a dark silhouette and "? ? ?". Met: its picture, its
// name ("el gato") and its sound ("¡Miau!"); a little mic once its name was said out loud (say-it-back), a gold star
// once it was counted (Luna's animal count: G.album.count(id)). Tap a met card (or A on it): it hops and you hear its
// name and its sound. "7/11" at the top, and a bar that fills; the day the last one is met the album throws a party
// (confetti, a fanfare) and its title becomes "¡Amig{o/a} de los animales!" with a gold ribbon.
// The twelfth card is "Amigos": a page with everyone's face, name and hearts (and a sticker / a gold photo frame for
// the 3- and 5-heart surprises, hearts.js). Back (or B) goes back to the animals; the close button (or B) closes.
// API: G.album(start?) -> Wait (start: 'amigos' opens the friends page), G.album.count(id) (a gold star, for the animal
// count errand), G.album.counted(id), G.album.full(), G.album.metCount().
'use strict';
(function () {
  const AN = () => G.animals, T = (t, en) => ({ t, en });
  const rec = id => (G.state && G.state.album && G.state.album[id]) || null;
  const cry = id => (AN().KINDS[id] || {}).cry;
  class Album {
    constructor(w, start) {
      G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.sel = 0; this.hop = {}; this.page = start === 'amigos' ? 'amigos' : 'animales'; this.fi = 0;
      this.party = 0;
    }
    onEnter() {
      if (G.album.full() && !G.state.flags.albumFull) { // the last animal: a party, once
        G.state.flags.albumFull = true; G.st.autosave(); this.party = 1;
        G.audio.jingle('promote');
      }
    }
    ids() { return AN().list(); }
    cell(k) { return { x: 14 + (k % 4) * 74, y: 34 + Math.floor(k / 4) * 62, w: 70, h: 58 }; }
    friendRect(k) { return { x: 12 + (k % 2) * 150, y: 32 + Math.floor(k / 2) * 31, w: 146, h: 29 }; }
    closeXY() { return [G.W - 28, 6]; }
    backXY() { return [8, 6]; }
    hintXY() { return null; }
    tapCard(k) {
      this.sel = k;
      if (k === 11) { G.audio.sfx('ok'); this.page = 'amigos'; this.fi = 0; return; }
      const id = this.ids()[k], w = G.data.words[AN().KINDS[id].word];
      if (!rec(id)) { G.audio.sfx('boop'); this.hop[k] = { t: 0, no: true }; return; }
      this.hop[k] = { t: 0 }; AN().cry(id);
      G.speak(w.es.split(' / ')[0] + (cry(id) ? '. ' + cry(id) : ''));
      const r = this.cell(k); for (let i = 0; i < 3; i++) G.fx.twinkle(r.x + 10 + Math.random() * 50, r.y + 6 + Math.random() * 30);
    }
    update() {
      this.t++;
      for (const k in this.hop) if (++this.hop[k].t > 24) delete this.hop[k];
      if (this.party && this.party < 200) {
        this.party++;
        if (this.party % 30 === 2) { G.fx.confetti(30 + Math.random() * 40, 200, -1, 16); G.fx.confetti(G.W - 30 - Math.random() * 40, 200, 1, 16); }
        if (this.party === 2) G.speak(G.fill('¡Amig{o/a} de los animales!'));
      }
      const tap = G.input.tap(), d = G.input.repDir(14, 6);
      if (this.page === 'amigos') {
        const n = G.hearts ? G.hearts.WHO.length : 0;
        if ((tap && (G.btnHit(...this.backXY()) || G.closeHit(...this.closeXY()))) || G.input.p('B')) { G.audio.sfx('cancel'); this.page = 'animales'; return; }
        if (d) { this.fi = G.clamp(this.fi + (d === 'left' ? -1 : d === 'right' ? 1 : d === 'up' ? -2 : 2), 0, n - 1); G.audio.sfx('cursor'); }
        const k = tap ? Array.from({ length: n }, (_, i) => i).find(i => G.tapIn(this.friendRect(i))) : -1;
        if (k != null && k >= 0) this.fi = k;
        if ((k != null && k >= 0) || G.input.p('A') || G.input.p('C')) { const who = G.hearts.WHO[this.fi]; G.speak(who === 'canelo' ? 'Canelo' : (G.nameOf(who) || '')); G.audio.sfx('cursor'); }
        return;
      }
      if ((tap && G.closeHit(...this.closeXY())) || G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
      if (d) {
        const n = 12, dx = d === 'left' ? -1 : d === 'right' ? 1 : d === 'up' ? -4 : 4;
        this.sel = (this.sel + dx + n) % n; G.audio.sfx('cursor');
      }
      if (tap) { for (let k = 0; k < 12; k++) if (G.tapIn(this.cell(k))) { this.tapCard(k); return; } }
      if (G.input.p('A') || G.input.p('C')) this.tapCard(this.sel);
    }
    draw(ctx) {
      G.win(ctx, 6, 4, G.W - 12, G.H - 8, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      if (this.page === 'amigos') { this.drawFriends(ctx); return; }
      const ids = this.ids(), met = ids.filter(id => rec(id)).length, full = met === ids.length;
      // the title: a paw, "Mis animales" (or the badge), the count and a bar that fills
      if (full) {
        ctx.fillStyle = '#c03030'; ctx.fillRect(40, 8, G.W - 104, 18); ctx.fillStyle = '#e85050'; ctx.fillRect(40, 8, G.W - 104, 2);
        ctx.fillStyle = '#801818'; ctx.beginPath(); ctx.moveTo(40, 8); ctx.lineTo(32, 17); ctx.lineTo(40, 26); ctx.fill(); ctx.beginPath(); ctx.moveTo(G.W - 64, 8); ctx.lineTo(G.W - 56, 17); ctx.lineTo(G.W - 64, 26); ctx.fill();
        G.textC(ctx, G.fill('¡Amig{o/a} de los animales!'), (G.W - 24) / 2, 13, '#fff070', '#401010');
      } else {
        G.drawIcon16(ctx, 'pata', 14, 9);
        G.text(ctx, 'Mis animales', 34, 10, '#a05020', null);
        G.text(ctx, met + '/' + ids.length, 110, 10, '#2860a8', null);
        const bw = 120; ctx.fillStyle = '#7a4a20'; ctx.fillRect(140, 11, bw + 2, 7); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(141, 12, bw, 5);
        ctx.fillStyle = '#e8a020'; ctx.fillRect(141, 12, Math.round(bw * met / ids.length), 5); ctx.fillStyle = '#f8d870'; ctx.fillRect(141, 12, Math.round(bw * met / ids.length), 1);
        for (let i = 1; i < ids.length; i++) { ctx.fillStyle = 'rgba(122,74,32,0.35)'; ctx.fillRect(141 + Math.round(bw * i / ids.length), 12, 1, 5); }
      }
      G.closeBtn(ctx, ...this.closeXY());
      if (G.enVisible()) G.text(ctx, 'Animals met', 16, 26, '#a09070', null);
      for (let k = 0; k < 12; k++) {
        const r = this.cell(k), sel = k === this.sel, h = this.hop[k], hop = h && !h.no ? Math.round(Math.sin(h.t / 24 * Math.PI) * -5) : 0, wob = h && h.no ? Math.round(Math.sin(h.t * 1.5) * 2 * (1 - h.t / 24)) : 0;
        const x = r.x + wob, y = r.y;
        if (k === 11) { // Amigos: a heart and three little faces
          ctx.fillStyle = sel ? '#f8d080' : '#f8e4ec'; ctx.fillRect(x, y, r.w, r.h); ctx.strokeStyle = sel ? '#c06000' : '#d090a8'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, r.w - 1, r.h - 1);
          if (G.hearts) { G.hearts.heart(ctx, x + r.w / 2 - 10, y + 6, true, 3); }
          G.textC(ctx, 'Amigos', x + r.w / 2, y + 36, '#a03060', null);
          if (G.hearts) G.textC(ctx, String(G.hearts.WHO.reduce((s, n) => s + G.hearts.get(n), 0)) + ' \u0003', x + r.w / 2, y + 46, '#c04870', null);
          continue;
        }
        const id = this.ids()[k], R = rec(id), w = G.data.words[AN().KINDS[id].word];
        ctx.fillStyle = sel ? '#f8e0a0' : R ? '#fffaf0' : '#d8ccb0'; ctx.fillRect(x, y, r.w, r.h);
        ctx.strokeStyle = sel ? '#c06000' : '#b09068'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, r.w - 1, r.h - 1);
        if (R) {
          G.drawIcon16(ctx, w, x + r.w / 2 - 16, y + 3 + hop, 2);
          G.textC(ctx, w.es.split(' / ')[0], x + r.w / 2, y + 37, G.st.knows(w ? AN().KINDS[id].word : id) ? '#a06008' : '#2860a8', null);
          if (cry(id)) G.textC(ctx, cry(id), x + r.w / 2, y + 47, '#e06010', null);
          if (R.said) G.mic.glyph(ctx, x + r.w - 10, y + 3, '#2a8a9a');
          if (R.counted) G.text(ctx, '\u0005', x + 3, y + 3, '#e0a010', '#5a2c04');
        } else {
          ctx.globalAlpha = 0.8; ctx.imageSmoothingEnabled = false;
          ctx.drawImage(G.tinted(G.icon(w), '#3a3048', 'albsil' + id), x + r.w / 2 - 16, y + 3, 32, 32); ctx.globalAlpha = 1;
          G.textC(ctx, '? ? ?', x + r.w / 2, y + 40, '#a08868', null);
        }
      }
    }
    drawFriends(ctx) {
      G.iconBtn(ctx, 'back', ...this.backXY());
      G.hearts.heart(ctx, G.W / 2 - 40, 10, true, 1);
      G.textC(ctx, 'Amigos', G.W / 2, 10, '#a03060', null);
      G.hearts.heart(ctx, G.W / 2 + 33, 10, true, 1);
      G.closeBtn(ctx, ...this.closeXY());
      G.hearts.WHO.forEach((who, k) => {
        const r = this.friendRect(k), sel = k === this.fi, best = G.hearts.photo(who);
        ctx.fillStyle = best ? '#f8d050' : sel ? '#f8e0a0' : '#fffaf0'; ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = best ? '#b07000' : sel ? '#c06000' : '#d0b898'; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
        ctx.fillStyle = '#5a3810'; ctx.fillRect(r.x + 2, r.y + 2, 25, 25);
        G.hearts.face(ctx, who, r.x + 3, r.y + 3, 23, this.t);
        const nm = who === 'canelo' ? 'Canelo' : (G.nameOf(who) || who).replace('Profesora ', 'Prof. ').replace(' el cartero', '').replace(' la panadera', '').replace('Señor ', 'Sr. ').replace('Abuela ', '');
        G.text(ctx, nm, r.x + 31, r.y + 5, '#604020', null);
        G.hearts.row(ctx, who, r.x + 31, r.y + 17);
        if (G.hearts.sticker(who)) { ctx.fillStyle = '#f8c820'; ctx.beginPath(); ctx.arc(r.x + r.w - 10, r.y + 10, 6, 0, Math.PI * 2); ctx.fill(); G.text(ctx, '\u0005', r.x + r.w - 13, r.y + 7, '#ffffff', '#a06000'); }
      });
    }
  }
  G.album = function (start) { const w = new G.Wait(); G.push(new Album(w, start)); return w; };
  G.album.metCount = () => AN().list().filter(id => rec(id)).length;
  G.album.full = () => G.album.metCount() === AN().list().length;
  G.album.counted = id => !!(rec(id) && rec(id).counted);
  G.album.count = function (id) { if (!AN().KINDS[id]) return false; if (!rec(id)) AN().meet(id); const r = rec(id); if (r.counted) return false; r.counted = true; G.st.autosave(); return true; };
  void T;
})();
