// The spoken-voice fallback: a line that's slow to start must retry with a Spanish voice (never the device's
// default, which on iPadOS 15 reads Spanish in English), right after the mic it must wait longer before
// retrying, and a step down must not be saved on the device.
'use strict';
const { run, open, check } = require('./harness');

run('voice fallback', async browser => {
  const { ctx, g } = await open(browser, 'voice', true);
  try {
    // a fake speech engine: two Spanish voices and an English one; lines start after `delay` ms (or never)
    await g.ev(() => {
      const V = [{ name: 'Paulina', lang: 'es-MX' }, { name: 'Mónica', lang: 'es-ES' }, { name: 'Samantha', lang: 'en-US' }];
      const ss = window.speechSynthesis;
      window.spoken = []; window.startDelay = 0; window.retryDelay = 0;
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } }; // a real one only takes real voices
      ss.getVoices = () => V; ss.cancel = () => { }; ss.resume = () => { };
      ss.speak = u => {
        if (!u.text.trim()) return;
        window.spoken.push({ voice: u.voice && u.voice.name, lang: u.lang, at: performance.now() });
        const d = window.spoken.length === 1 ? window.startDelay : window.retryDelay;
        if (d >= 0) setTimeout(() => u.onstart && u.onstart(), d);
      };
      G.prefs.voice = 10; G.audio.muted = false; G.voiceMode = 0;
    });
    const say = () => g.ev(() => G.speak('¡Hola!'));
    const wait = ms => g.page.waitForTimeout(ms);

    await say(); await wait(300);
    check('voice: a line uses the Mexican voice', await g.ev(() => window.spoken.length === 1 && window.spoken[0].voice === 'Paulina'));

    // a line that never starts: every retry still names a Spanish voice
    await g.ev(() => { window.spoken = []; window.startDelay = window.retryDelay = -1; });
    await say(); await wait(3600);
    const tries = await g.ev(() => window.spoken);
    check('voice: a silent line is retried', tries.length === 3, JSON.stringify(tries));
    check('voice: every retry names a Spanish voice', tries.every(t => t.voice && /^es/.test(t.lang)), JSON.stringify(tries));
    check('voice: the last step tries the other Spanish voice', tries[2].voice === 'Mónica', JSON.stringify(tries));
    check('voice: nothing is saved on the device', await g.ev(() => !G.prefs.voiceMode));

    // a step down that works is kept for this visit only
    await g.ev(() => { window.spoken = []; window.startDelay = 2000; window.retryDelay = 100; G.voiceMode = 0; G.micEndedAt = -1e9; });
    await say(); await wait(2600);
    check('voice: a slow start (no mic) steps down once', await g.ev(() => window.spoken.length === 2 && G.voiceMode === 1 && !G.prefs.voiceMode));

    // right after the mic, a 2 s start is waited for, not retried
    await g.ev(() => { window.spoken = []; window.startDelay = 2000; G.voiceMode = 0; G.micEndedAt = performance.now(); });
    await say(); await wait(2600);
    check('voice: right after the mic a slow start is waited for', await g.ev(() => window.spoken.length === 1 && G.voiceMode === 0), JSON.stringify(await g.ev(() => window.spoken)));

    // an old saved step from earlier versions is dropped on load
    await g.ev(() => localStorage.setItem('spanishclub_prefs', JSON.stringify(Object.assign({}, G.prefs, { voiceMode: 1 }))));
    await g.page.reload(); await g.until(() => window.G && G.prefs, null, 'the game to load');
    check('voice: an old saved step is dropped', await g.ev(() => !G.prefs.voiceMode && G.voiceMode === 0));
    check('voice: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
