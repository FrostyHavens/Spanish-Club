// ===== The animal album: a Pokédex of the whole world, one page per zone, and the Amigos page (everyone's hearts) =====
// (docs/WORLD_PLAN.md: wonder, adventure, lots of different animals, always something left to find)
// Tabs along the top: one per zone (its picture and "met/of"; a gold ribbon once the zone is complete) and Amigos.
// A zone's page: its animals as numbered entries (Nº 1, 2, ... in world order: Villa Sol first, then each zone, so
// every animal has its own number). Not met yet: a dark silhouette, "? ? ?" and a little picture of where it lives (the
// hint: water, a tree, the farm...); a rare one (only at night, only in the morning, only in one spot) has a sparkle
// in its corner. Seen (tapped) but its word not met yet: its picture and "?". Met: its picture, its name ("el gato") and
// its sound ("¡Miau!"); a little mic once its name was said out loud, a gold star once counted (Luna's count). Entries a
// zone hasn't built yet (G.zones def.planned) are numbered "?" cards. Tap a met card (or A on it): it hops and you
// hear its name and its sound. A zone page complete: confetti and "¡Completo!" the first time you open it; the whole
// album complete: the party and "¡Amig{o/a} de los animales!" as before.
// The first time an animal is met anywhere (G.animals.meet), "¡Nuevo animal!" pops in over the game (never blocking
// it): its number, its picture big, its cry, its name (or "?" while its word isn't met), then the card flips and flies
// into the corner (G.album.discover; core.js draws it above every screen).
// API: G.album(start?) -> Wait (start: 'amigos', or a zone id), G.album.count(id), .counted(id), .full(), .metCount(),
//   .zoneOf(id) (the zone whose page it's on), .zoneIds(id) / .zoneCount(zone) -> {met, of} (world map, tabs),
//   .number(id) (its Pokédex number), .discover(id), .step() / .draw(ctx) (core.js).
'use strict';
(function () {
  const AN = () => G.animals, T = (t, en) => ({ t, en });
  const rec = id => (G.state && G.state.album && G.state.album[id]) || null;
  const cry = id => (AN().KINDS[id] || {}).cry;
  const ZS = () => (G.zones ? G.zones.LIST.filter(z => (z.animals && z.animals.length) || z.planned) : []);
  // the zone whose page an animal is on (the first zone listing it; an animal no zone lists goes on Villa Sol's)
  const zoneOf = id => { const z = ZS().find(z => (z.animals || []).includes(id)); return z ? z.id : 'villa'; };
  // a zone's page: its animal ids, and its planned "?" entries (null)
  function entries(zid) {
    const z = G.zones && G.zones.def(zid); if (!z) return AN().list();
    const ids = (z.animals || []).filter(id => AN().KINDS[id]);
    if (zid === 'villa') for (const id of AN().list()) if (!ids.includes(id) && zoneOf(id) === 'villa') ids.push(id); // (an animal no zone lists)
    const out = ids.slice(0, 11); for (let i = 0; i < (z.planned || 0) && out.length < 11; i++) out.push(null);
    return out;
  }
  const number = id => { let n = 0; for (const z of ZS()) { const E = entries(z.id); const k = E.indexOf(id); if (k >= 0) return n + k + 1; n += E.length; } return 0; };
  const zoneCount = zid => { const E = entries(zid); return { met: E.filter(id => id && rec(id)).length, of: E.length }; };

  class Album {
    constructor(w, start) {
      G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.sel = 0; this.hop = {}; this.fi = 0;
      this.party = 0; this.done = 0;
      const here = G.field && G.zones ? G.zones.of(G.field.mapId) : null;
      this.page = start === 'amigos' ? 'amigos' : 'animales';
      this.zone = start && start !== 'amigos' && G.zones && G.zones.def(start) ? start : here && ZS().some(z => z.id === here) ? here : 'villa';
    }
    onEnter() {
      if (G.album.full() && !G.state.flags.albumFull) { // the last animal: a party, once
        G.state.flags.albumFull = true; G.st.autosave(); this.party = 1;
        G.audio.jingle('promote');
      }
      this.checkZone();
    }
    // a zone page complete for the first time: "¡Completo!" with confetti
    checkZone() {
      const c = zoneCount(this.zone), f = G.state.flags; if (!f.dexDone || typeof f.dexDone !== 'object') f.dexDone = {};
      if (c.of && c.met === c.of && !f.dexDone[this.zone] && entries(this.zone).every(Boolean)) { f.dexDone[this.zone] = 1; G.st.autosave(); this.done = 1; if (!this.party) G.audio.jingle('promote'); }
    }
    ids() { return entries(this.zone); }
    tabs() { return ZS().map(z => z.id).concat(['amigos']); }
    tabRect(k) { const n = this.tabs().length, w = Math.min(44, Math.floor((G.W - 60) / n)); return { x: 12 + k * w, y: 6, w: w - 2, h: 24 }; }
    cell(k) { return { x: 14 + (k % 4) * 74, y: 46 + Math.floor(k / 4) * 56, w: 70, h: 52 }; }
    friendRect(k) { return { x: 12 + (k % 2) * 150, y: 32 + Math.floor(k / 2) * 31, w: 146, h: 29 }; }
    closeXY() { return [G.W - 28, 6]; }
    backXY() { return [8, 6]; }
    hintXY() { return null; }
    tapCard(k) {
      this.sel = k;
      if (k === 11) { G.audio.sfx('ok'); this.page = 'amigos'; this.fi = 0; return; }
      const id = this.ids()[k]; if (id === undefined) return;
      if (!id || !rec(id)) { G.audio.sfx('boop'); this.hop[k] = { t: 0, no: true }; return; }
      const w = G.data.words[AN().KINDS[id].word];
      this.hop[k] = { t: 0 }; AN().cry(id);
      if (G.st.seen(AN().KINDS[id].word)) G.speak(w.es.split(' / ')[0] + (cry(id) ? '. ' + cry(id) : '')); // (unnamed yet: only its cry)
      const r = this.cell(k); for (let i = 0; i < 3; i++) G.fx.twinkle(r.x + 10 + Math.random() * 50, r.y + 6 + Math.random() * 30);
    }
    tapTab(k) { const id = this.tabs()[k]; G.audio.sfx('cursor'); if (id === 'amigos') { this.page = 'amigos'; this.fi = 0; return; } this.page = 'animales'; this.zone = id; this.sel = 0; this.hop = {}; this.done = 0; this.checkZone(); }
    update() {
      this.t++;
      for (const k in this.hop) if (++this.hop[k].t > 24) delete this.hop[k];
      if (this.party && this.party < 200) {
        this.party++;
        if (this.party % 30 === 2) { G.fx.confetti(30 + Math.random() * 40, 200, -1, 16); G.fx.confetti(G.W - 30 - Math.random() * 40, 200, 1, 16); }
        if (this.party === 2) G.speak(G.fill('¡Amig{o/a} de los animales!'));
      }
      if (this.done && this.done < 120) { this.done++; if (this.done % 40 === 2) { G.fx.confetti(40, 200, -1, 14); G.fx.confetti(G.W - 40, 200, 1, 14); } if (this.done === 2) G.speak('¡Completo!'); }
      const tap = G.input.tap(), d = G.input.repDir(14, 6);
      if (this.page === 'amigos') {
        const n = G.hearts ? G.hearts.WHO.length : 0;
        if ((tap && (G.btnHit(...this.backXY()) || G.closeHit(...this.closeXY()))) || G.input.p('B')) { G.audio.sfx('cancel'); this.page = 'animales'; return; }
        if (d) { this.fi = G.clamp(this.fi + (d === 'left' ? -1 : d === 'right' ? 1 : d === 'up' ? -2 : 2), 0, n - 1); G.audio.sfx('cursor'); }
        const k = tap ? Array.from({ length: n }, (_, i) => i).find(i => G.tapIn(this.friendRect(i))) : -1;
        if (k != null && k >= 0) this.fi = k;
        if ((k != null && k >= 0) || G.input.p('A') || G.input.p('C')) { const who = G.hearts.WHO[this.fi]; G.speak(who === 'canelo' ? G.dogName() : (G.nameOf(who) || '')); G.audio.sfx('cursor'); }
        return;
      }
      if ((tap && G.closeHit(...this.closeXY())) || G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
      if (tap) { const tk = this.tabs().findIndex((_, k) => G.tapIn(this.tabRect(k))); if (tk >= 0) { this.tapTab(tk); return; } }
      if (d) {
        const n = 12, dx = d === 'left' ? -1 : d === 'right' ? 1 : d === 'up' ? -4 : 4;
        this.sel = (this.sel + dx + n) % n; G.audio.sfx('cursor');
      }
      if (tap) { for (let k = 0; k < 12; k++) if (G.tapIn(this.cell(k))) { this.tapCard(k); return; } }
      if (G.input.p('A') || G.input.p('C')) this.tapCard(this.sel);
    }
    drawTabs(ctx) {
      this.tabs().forEach((id, k) => {
        const r = this.tabRect(k), on = id === (this.page === 'amigos' ? 'amigos' : this.zone), z = G.zones && G.zones.def(id);
        const been = id === 'amigos' || id === 'villa' || (G.zones && G.zones.visited(id));
        ctx.fillStyle = on ? '#fffaf0' : '#d8c8a8'; ctx.fillRect(r.x, r.y, r.w, r.h + (on ? 4 : 0));
        ctx.strokeStyle = on ? '#c06000' : '#a08868'; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1 + (on ? 4 : 0));
        if (id === 'amigos') { if (G.hearts) G.hearts.heart(ctx, r.x + r.w / 2 - 7, r.y + 5, true, 2); return; }
        if (been) G.drawIcon16(ctx, z.icon, r.x + 2, r.y + 4); else { ctx.globalAlpha = 0.8; ctx.drawImage(G.tinted(G.icon(z.icon), '#3a3048', 'tabsil' + id), r.x + 2, r.y + 4); ctx.globalAlpha = 1; }
        const c = zoneCount(id);
        if (r.w >= 36) G.text(ctx, String(c.met), r.x + 20, r.y + 9, c.met === c.of && c.of ? '#c08000' : '#2860a8', null);
        if (c.of && c.met === c.of && entries(id).every(Boolean)) { ctx.fillStyle = '#f8c820'; ctx.fillRect(r.x, r.y, r.w, 2); }
      });
    }
    draw(ctx) {
      G.win(ctx, 6, 4, G.W - 12, G.H - 8, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      if (this.page === 'amigos') { this.drawFriends(ctx); return; }
      this.drawTabs(ctx);
      const ids = this.ids(), z = G.zones && G.zones.def(this.zone), c = zoneCount(this.zone), full = G.album.full() && this.zone === 'villa' && this.party;
      // the page's title: the zone's name, its count and a bar that fills (or the album's badge, or "¡Completo!")
      const ty = 33;
      if (full) G.textC(ctx, G.fill('¡Amig{o/a} de los animales!'), (G.W - 24) / 2, ty, '#c03030', null);
      else {
        G.text(ctx, z ? z.name : 'Mis animales', 14, ty, '#a05020', null);
        const tx = 14 + G.textWidth(z ? z.name : 'Mis animales') + 6;
        G.text(ctx, c.met + '/' + c.of, tx, ty, '#2860a8', null);
        const bx = tx + 34, bw = Math.max(40, G.W - 40 - bx); ctx.fillStyle = '#7a4a20'; ctx.fillRect(bx, ty + 1, bw + 2, 7); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(bx + 1, ty + 2, bw, 5);
        ctx.fillStyle = '#e8a020'; ctx.fillRect(bx + 1, ty + 2, Math.round(bw * c.met / Math.max(1, c.of)), 5);
        if (this.done || (c.of && c.met === c.of && ids.every(Boolean))) G.text(ctx, '¡Completo!', bx + bw / 2 - 24, ty, '#c08000', '#fff8d0');
      }
      G.closeBtn(ctx, ...this.closeXY());
      for (let k = 0; k < 12; k++) {
        const r = this.cell(k), sel = k === this.sel, h = this.hop[k], hop = h && !h.no ? Math.round(Math.sin(h.t / 24 * Math.PI) * -5) : 0, wob = h && h.no ? Math.round(Math.sin(h.t * 1.5) * 2 * (1 - h.t / 24)) : 0;
        const x = r.x + wob, y = r.y;
        if (k === 11) { // Amigos: a heart and the hearts so far
          ctx.fillStyle = sel ? '#f8d080' : '#f8e4ec'; ctx.fillRect(x, y, r.w, r.h); ctx.strokeStyle = sel ? '#c06000' : '#d090a8'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, r.w - 1, r.h - 1);
          if (G.hearts) { G.hearts.heart(ctx, x + r.w / 2 - 10, y + 4, true, 3); }
          G.textC(ctx, 'Amigos', x + r.w / 2, y + 32, '#a03060', null);
          if (G.hearts) G.textC(ctx, String(G.hearts.WHO.reduce((s, n) => s + G.hearts.get(n), 0)) + ' \u0003', x + r.w / 2, y + 42, '#c04870', null);
          continue;
        }
        if (k >= ids.length) continue;
        const id = ids[k], R = id && rec(id);
        ctx.fillStyle = sel ? '#f8e0a0' : R ? '#fffaf0' : '#d8ccb0'; ctx.fillRect(x, y, r.w, r.h);
        ctx.strokeStyle = sel ? '#c06000' : '#b09068'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, r.w - 1, r.h - 1);
        const num = id ? number(id) : G.album.zoneStart(this.zone) + k + 1;
        G.text(ctx, String(num), x + 3, y + 3, R ? '#a07040' : '#9a8a70', null);
        if (!id) { G.bigText(ctx, '?', x + r.w / 2, y + 12, 2, '#b8a888', null); continue; } // (an animal this zone will have)
        const w = G.data.words[AN().KINDS[id].word], rare = z && z.rare && z.rare[id];
        if (rare) G.drawIcon16(ctx, rare === true ? 'estrella' : rare, x + r.w - 17, y + 1);
        if (R) {
          G.drawIcon16(ctx, w, x + r.w / 2 - 16, y + 2 + hop, 2);
          const named = G.st.seen(AN().KINDS[id].word); // seen but its word not met yet: "?" (the story names it)
          G.textC(ctx, named ? w.es.split(' / ')[0] : '?', x + r.w / 2, y + 34, !named ? '#a08868' : G.st.knows(AN().KINDS[id].word) ? '#a06008' : '#2860a8', null);
          if (cry(id)) G.textC(ctx, cry(id), x + r.w / 2, y + 43, '#e06010', null);
          if (R.said) G.mic.glyph(ctx, x + r.w - 10, y + 14, '#2a8a9a');
          if (R.counted) G.text(ctx, '\u0005', x + 3, y + 14, '#e0a010', '#5a2c04');
        } else {
          ctx.globalAlpha = 0.8; ctx.imageSmoothingEnabled = false;
          ctx.drawImage(G.tinted(G.icon(w), '#3a3048', 'albsil' + id), x + r.w / 2 - 16, y + 2, 32, 32); ctx.globalAlpha = 1;
          G.textC(ctx, '? ? ?', x + r.w / 2, y + 37, '#a08868', null);
          const hint = z && z.habitat && z.habitat[id]; // where it lives: a little picture (the hint)
          if (hint) { ctx.globalAlpha = 0.9; G.drawIcon16(ctx, hint, x + r.w - 18, y + r.h - 18); ctx.globalAlpha = 1; }
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
        const nm = who === 'canelo' ? G.dogName() : (G.nameOf(who) || who).replace('Profesora ', 'Prof. ').replace(' el cartero', '').replace(' la panadera', '').replace('Señor ', 'Sr. ').replace('Abuela ', '');
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
  G.album.zoneOf = zoneOf;
  G.album.entries = entries;
  G.album.zoneCount = zoneCount;
  G.album.number = number;
  G.album.zoneStart = zid => { let n = 0; for (const z of ZS()) { if (z.id === zid) return n; n += entries(z.id).length; } return n; };

  // ---------- "¡Nuevo animal!": the first time an animal is met (never blocks the game: drawn over it) ----------
  const DQ = []; let cur = null;
  G.album.discover = function (id) { if (!AN().KINDS[id] || DQ.includes(id) || (cur && cur.id === id)) return; DQ.push(id); if (DQ.length > 3) DQ.shift(); };
  G.album.discovering = () => cur;
  G.album.step = function () {
    if (cur) { cur.t++; if (cur.t === 12) { AN().cry(cur.id); G.audio.sfx('star'); } if (cur.t === 30) { const w = G.data.words[AN().KINDS[cur.id].word]; if (w && G.st.seen(AN().KINDS[cur.id].word)) G.speak(w.es.split(' / ')[0]); } if (cur.t > 170) cur = null; return; }
    if (DQ.length && G.fade.a === 0 && G.state && G.field && G.top() === G.field) { /* (on the map: never over a talk or a menu) */ cur = { id: DQ.shift(), t: 0 }; G.fx.confetti(G.W / 2 - 50, 60, -1, 10); G.fx.confetti(G.W / 2 + 50, 60, 1, 10); }
  };
  G.album.draw = function (ctx) {
    const c = cur; if (!c || !G.state) return;
    const id = c.id, K = AN().KINDS[id], w = G.data.words[K.word], named = G.st.seen(K.word), t = c.t;
    // pop in (0-14), stay, then flip (shrink sideways) and fly to the corner (140-170)
    const pop = Math.min(1, t / 14), e = 1 - Math.pow(1 - pop, 3), fly = Math.max(0, (t - 140) / 30);
    const cw = 134, ch = 74, x0 = G.W / 2 - cw / 2, y0 = 14;
    const sx = fly ? Math.max(0.05, 1 - fly) : e, cx = x0 + cw / 2 + (G.W - 24 - (x0 + cw / 2)) * fly * fly, cy = y0 + ch / 2 + (14 - (y0 + ch / 2)) * fly * fly;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, e * (1 - fly * 0.6)); ctx.translate(-cw / 2, -ch / 2);
    ctx.fillStyle = '#10102a'; ctx.fillRect(-2, -2, cw + 4, ch + 4);
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#e8a020'; ctx.fillRect(0, 0, cw, 13); ctx.fillStyle = '#f8d870'; ctx.fillRect(0, 0, cw, 2);
    G.textC(ctx, '¡Nuevo animal!', cw / 2, 3, '#ffffff', '#7a3a08');
    const b = t > 14 && t < 40 ? Math.round(Math.sin((t - 14) / 26 * Math.PI) * -4) : 0;
    G.drawIcon16(ctx, w, 6, 18 + b, 3);
    { const ns = String(number(id) || '?'), nw = G.textWidth(ns) + 8; ctx.fillStyle = '#a07040'; ctx.fillRect(60, 18, nw, 11); G.text(ctx, ns, 64, 20, '#ffffff', null); }
    G.text(ctx, named ? w.es.split(' / ')[0] : '?', 60, 34, named ? '#2860a8' : '#a08868', null);
    if (K.cry) G.text(ctx, K.cry, 60, 48, '#e06010', null);
    const z = G.zones && G.zones.def(zoneOf(id)); if (z) G.drawIcon16(ctx, z.icon, cw - 20, ch - 20);
    ctx.restore();
  };
  void T;
})();
