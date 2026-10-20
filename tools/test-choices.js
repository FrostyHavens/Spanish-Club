// Answer cards never give the answer away: when one card shows only its word, no card shows a picture.
'use strict';
const { run, open, check } = require('./harness');

run('choices', async browser => {
  const { ctx, g } = await open(browser, 'choices', true);
  try {
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; ['hola', 'gato', 'pelota'].forEach(id => G.words.meet(id, 'test')); G.goto('villa', 5, 18, 'down'); });
    await g.fieldIdle('villa');
    // the new word written, the known ones as words too (not pictures)
    await g.ev(() => { window.__q = G.choose({ prompt: '¿Qué es?', answer: 0, layout: 'cards', choices: [{ word: 'manzana', look: 'text' }, { word: 'gato', look: 'both' }, { word: 'pelota', look: 'both' }] }); });
    await g.until(() => G.top().constructor.name === 'Choice', null, 'the question');
    const vs = await g.ev(() => G.top().ch.map((c, k) => { const v = G.top().view(k); return { icon: !!v.icon, label: v.label }; }));
    check('choices: a word-only card makes every card word-only', vs.every(v => !v.icon && v.label), JSON.stringify(vs));
    await g.ev(() => { G.pop(); window.__q.resolve(-1); });
    // all-picture questions keep their pictures
    await g.ev(() => { window.__q = G.choose({ prompt: '¿Qué es?', answer: 0, layout: 'cards', choices: [{ word: 'gato', look: 'pic' }, { word: 'pelota', look: 'pic' }, { word: 'hola', look: 'pic' }] }); });
    await g.until(() => G.top().constructor.name === 'Choice', null, 'the second question');
    const vp = await g.ev(() => G.top().ch.map((c, k) => !!G.top().view(k).icon));
    check('choices: picture questions keep their pictures', vp.every(Boolean), JSON.stringify(vp));
    check('choices: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
