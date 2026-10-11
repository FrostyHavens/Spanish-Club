// Kid's-eye audit (docs/INTUITIVE_AUDIT.md): days 1-3 on an iPad, played by the naive bot (tools/naivebot.js) that only
// taps what visibly calls for a tap (the guide's arrow, the hint hand, bubbles, peeking animals, sparkles) and otherwise
// wanders and stands about like a child who can't read Spanish. For every moment free on the map it logs how long it
// took to find the next thing (game seconds), how much of that was wandering or standing about, what finally showed
// the way, and the last line said before it (the instruction a child would have had to read). Moments where the bot
// lost more than a few seconds get a small screenshot.
//   NODE_PATH=$(npm root -g) node tools/audit-intuitive.js [out dir] [--days 3] [--label before]
// Writes <out dir>/audit-<label>.json and its PNGs (default out dir: the scratchpad's shots/audit).
'use strict';
const path = require('path'), fs = require('fs');
const { open, launch, OUT } = require('./harness');
const { settle, newGame, nextTap, nextDay } = require('./playflow');
const { NaiveBot, canvasShot } = require('./naivebot');

const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const DAYS = +(opt('--days') || 3), LABEL = opt('--label') || 'run';
const dir = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--days') && a !== opt('--label')) || path.join(OUT, 'audit'));
const LIMIT = 45; // game seconds of looking before the moment counts as stuck (then the bot is helped along)

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await launch();
  const { ctx, g } = await open(browser, 'audit', true);
  const log = [], t0 = Date.now();
  let n = 0;
  const shot = async name => { const f = path.join(dir, LABEL + '_' + String(++n).padStart(2, '0') + '_' + name + '.png'); await canvasShot(g, f); return path.basename(f); };
  try {
    await g.page.addInitScript(() => {});
    await newGame(g);
    await g.ev(() => { // the last lines said (what a child would have had to read)
      window.__lines = [];
      const say = G.say; G.say = function (pages, o) { try { (Array.isArray(pages) ? pages : [pages]).forEach(p => window.__lines.push(typeof p === 'string' ? { t: p } : { t: p.t, en: p.en })); window.__lines = window.__lines.slice(-4); } catch (e) { /* */ } return say.apply(this, arguments); };
    });
    const bot = new NaiveBot(g);
    let day = 1, stuckHere = 0;
    for (let step = 0; step < 400; step++) {
      await settle(g, 'audit step ' + step);
      const st = await g.ev(() => ({ day: G.words.day(), map: G.field.mapId, ch: G.chapters.current(), next: G.chapters.next(), gate: G.chapters.next() ? G.chapters.gate(G.chapters.next()) : null, beat: G.chapters.current() ? G.state.ch.step[G.chapters.current()] | 0 : null, done: Object.keys(G.state.quests).filter(k => G.state.quests[k] === 'done'), line: (window.__lines || []).slice(-1)[0] || null, over: G.day.over() }));
      if (st.day > DAYS) break;
      const moment = (st.ch ? st.ch + ' beat ' + st.beat : 'between chapters (' + (st.next ? st.next + ': ' + (st.gate || 'open') : 'none') + ')') + ' on ' + st.map;
      const pic = await shot('free');
      const goal = await nextTap(g);
      const r = await bot.free(goal ? LIMIT : 40);
      const rec = { day: st.day, moment, goal: goal ? goal.why : null, cue: r.cue === 'scene' ? 'by itself' : r.cue, what: r.what || null, sec: +r.sec.toFixed(1), idle: +r.idleSec.toFixed(1), wander: +r.wanderSec.toFixed(1), wanders: r.wanders, line: st.line, stuck: !!r.stuck, done: st.done.join(' ') };
      const lost = r.idleSec + r.wanderSec;
      if (lost >= 4 || r.stuck) rec.shot = pic; else fs.unlinkSync(path.join(dir, pic));
      log.push(rec);
      console.log(`day ${rec.day} | ${moment} | goal: ${rec.goal} | ${rec.cue}${rec.what ? ' ' + rec.what : ''} after ${rec.sec}s (idle ${rec.idle}, wander ${rec.wander})${rec.stuck ? ' STUCK' : ''}${rec.line ? ' | last line: ' + rec.line.t : ''}`);
      if (!r.stuck) { stuckHere = 0; continue; }
      // stuck: help it along like playflow (the test bot that knows the targets), or end the day
      if (goal) { // walk it there like the test bot (tools/playflow.js) until something starts
        rec.helped = true;
        for (let k = 0; k < 12; k++) {
          const t = await nextTap(g); if (!t) break;
          await g.tap(t.sx, t.sy);
          await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the helped walk', 30000);
          if (await g.ev(() => G.top() !== G.field || G.field.locked)) break;
        }
        if (++stuckHere > 6) throw new Error('the helped walk goes nowhere: ' + goal.why);
        continue;
      }
      stuckHere = 0;
      if (st.gate === 'soon') { // the next chapter opens in a few minutes of play: fast-forward
        rec.waitSoon = true;
        await g.ev(() => { window.__sm = G.speedMul; G.speedMul = 8; });
        await g.until(() => { const n = G.chapters.next(); return G.top() !== G.field || !n || G.chapters.gate(n) !== 'soon'; }, null, 'the next chapter', 10 * 60 * 1000);
        await g.ev(() => { G.speedMul = window.__sm; });
        continue;
      }
      if (await g.ev(() => G.chapters.nudgeSoon())) { await g.ev(() => { G.speedMul = 8; }); await g.until(() => !!G.chapters.nudge() || !G.chapters.nudgeSoon() || G.top() !== G.field, null, 'the nudge', 5 * 60 * 1000); await g.ev(() => { G.speedMul = 1; }); continue; }
      rec.endOfDay = true; // nothing left today: a new day
      console.log('  -- nothing left to do on day ' + st.day + ': the next day');
      await nextDay(g); day++;
    }
  } catch (e) { console.log('AUDIT ERROR: ' + (e.stack || e.message)); }
  finally {
    const sum = { free: log.length, stuck: log.filter(r => r.stuck).length, lostSec: +log.reduce((a, r) => a + r.idle + r.wander, 0).toFixed(1), totalSec: +log.reduce((a, r) => a + r.sec, 0).toFixed(1), byCue: {} };
    for (const r of log) sum.byCue[r.cue || 'none'] = (sum.byCue[r.cue || 'none'] || 0) + 1;
    fs.writeFileSync(path.join(dir, 'audit-' + LABEL + '.json'), JSON.stringify({ sum, log }, null, 1));
    console.log('\nSUMMARY ' + JSON.stringify(sum) + ' (' + Math.round((Date.now() - t0) / 1000) + ' s wall)');
    if (g.errors.length) console.log('errors:\n' + g.errors.join('\n'));
    await ctx.close(); await browser.close();
  }
})();
