// Every word, phrase and album label is readable (docs/AUDIT_2026-10.md 3.3): none is squeezed sideways below 90% of its
// natural width, none overflows its box, and a word is only ever broken at a syllable with a hyphen, 3 letters or more
// on each side. No browser: the font table (src/gfx.js) and the word list (content/es/words.js) load in plain node.
//   node tools/test-labels.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
global.window = global; global.G = { W: 320, H: 224, makeCanvas() { return { getContext() { return {}; } }; } };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = f => vm.runInThisContext(read(f), { filename: f });
load('src/gfx.js'); load('content/es/words.js');
const D = G.content.es, tw = G.textWidth;
let fails = 0;
const fail = m => { fails++; console.log('  FAIL ' + m); };
const num = (src, re, what) => { const m = re.exec(src); if (!m) { fail('cannot read ' + what + ' from the source'); return 0; } return +m[1]; };

// the boxes, read from the code so the test follows the layout
const cards = read('src/cards.js'), album = read('src/album.js');
const CW = num(cards, /C\.W = (\d+);/, 'C.W'), LINES = num(cards, /C\.LINES = (\d+);/, 'C.LINES');
const cellW = num(album, /cell\(k\) \{ return \{[^}]*w: (\d+),/, 'the album cell width'), popW = num(album, /const cw = (\d+), nf = /, 'the album popup width');
const PHRASE_LINES = 2;

const baseForm = id => D.words[id].es.split(' / ')[0].replace(/^(el|la|los|las) /, '');
const phraseLabel = id => D.phrases[id].es.replace('___', '').replace(/\s+([?])/, '$1').replace(/^,\s*/, '').replace(/\s+/g, ' ').trim();
const words = Object.keys(D.words).map(id => ({ id, s: baseForm(id) }));
const phrases = Object.keys(D.phrases).map(id => ({ id, s: phraseLabel(id) }));
let src = read('src/animals.js'); fs.readdirSync(path.join(ROOT, 'content/es')).filter(f => /^zone-/.test(f)).forEach(f => { src += read('content/es/' + f); });
const animalWords = new Set(); { const re = /word: '(\w+)'/g; let m; while ((m = re.exec(src))) if (D.words[m[1]]) animalWords.add(m[1]); }
const names = [...animalWords].map(id => ({ id, s: D.words[id].es.split(' / ')[0] }));

function check(name, list, inner, maxLines) {
  let two = 0, three = 0, hy = 0, squeezed = 0, worst = 1;
  list.forEach(l => {
    const r = G.fitLabel(l.s, inner, maxLines), w = Math.max(...r.lines.map(tw));
    if (r.lines.length === 2) two++; if (r.lines.length === 3) three++; if (r.hy) hy++;
    if (r.sq < 1) squeezed++; worst = Math.min(worst, r.sq);
    const at = name + ' "' + l.s + '" (' + l.id + ')';
    if (r.lines.length > maxLines) fail(at + ' uses ' + r.lines.length + ' lines');
    if (r.sq < 0.9) fail(at + ' would be squeezed to ' + Math.round(r.sq * 100) + '%: ' + JSON.stringify(r.lines));
    if (w * r.sq > inner + 1e-9) fail(at + ' overflows: ' + w + ' of ' + inner + ' px');
    if (r.lines.join('').replace(/-/g, '').replace(/ /g, '') !== l.s.replace(/-/g, '').replace(/ /g, '')) fail(at + ' lost letters: ' + JSON.stringify(r.lines));
    r.lines.forEach((ln, i) => { // a broken word: a hyphen, and 3 letters or more on each side
      if (ln.endsWith('-') && i < r.lines.length - 1) {
        const a = ln.slice(0, -1).split(' ').pop(), b = r.lines[i + 1].split(' ')[0];
        if (a.replace(/[^a-záéíóúüñ]/gi, '').length < 3 || b.replace(/[^a-záéíóúüñ]/gi, '').length < 3) fail(at + ' leaves fewer than 3 letters: ' + JSON.stringify(r.lines));
      }
    });
  });
  console.log(name.padEnd(28) + String(list.length).padStart(4) + ' labels in ' + inner + ' px: ' + two + ' in two lines, ' + three + ' in three, ' + hy + ' with a hyphen, ' + squeezed + ' squeezed (worst ' + Math.round(worst * 100) + '%)');
}
check('word cards', words, CW - 6, LINES);
// a three-line label ends a clear pixel above the tallest plant (the plant's top is C.H - 35: src/cards.js)
{
  const CH = num(cards, /C\.H = (\d+);/, 'C.H'), step = num(cards, /C\.LABEL_STEP = (\d+);/, 'the label step'), y3 = num(cards, /C\.LABEL_Y = \{[^}]*3: (-?\d+)/, 'the three-line offset'), top = num(cards, /'\? \? \?', [^\n]*, (\d+), C\.LINES\)/, 'the word card label top');
  const end = top + y3 + 2 * step + 7, plant = CH - 35, three = words.filter(l => G.fitLabel(l.s, CW - 6, LINES).lines.length === 3);
  if (end >= plant) fail('a three-line label ends at y = ' + end + ' but the plant starts at y = ' + plant + ' (needs a clear pixel)');
  console.log('three-line labels'.padEnd(28) + String(three.length).padStart(4) + ' words (' + three.map(l => l.s).join(', ') + '): the last line ends at y = ' + end + ', the plant starts at y = ' + plant);
}
// the label fitting is remembered per text, width and line count
if (G.fitLabel('carpintero', 40, 2) !== G.fitLabel('carpintero', 40, 2)) fail('G.fitLabel does not remember its result');
check('phrase cards', phrases, CW - 6, PHRASE_LINES);
check('album cells', names, cellW - 4, 2);
check('album "new animal" card', names, popW - 64, 2);
// the animals' cries on their album cell: one line, squeezed to 90% at the most (and never wider than the cell)
{
  const cries = []; const re = /cry: '([^']*)'/g; let m; while ((m = re.exec(src))) cries.push(m[1]);
  let worst = 1; cries.forEach(c => { const sq = Math.min(1, (cellW - 4) / tw(c)); worst = Math.min(worst, sq); if (sq < 0.9) fail('cry "' + c + '" would be squeezed to ' + Math.round(sq * 100) + '% on its cell'); });
  console.log('album cries'.padEnd(28) + String(cries.length).padStart(4) + ' cries in ' + (cellW - 4) + ' px: worst ' + Math.round(worst * 100) + '%');
}
// the syllable breaker never cuts inside a vowel run or leaves fewer than 3 letters
[['mariposa', [4]], ['carpintero', [3, 6, 7]], ['calcetines', [3, 5, 7]]].forEach(([w, ok]) => { const b = G.syllableBreaks(w); if (b.some(k => !ok.includes(k))) fail('syllable breaks of ' + w + ': ' + b); });
if (G.syllableBreaks('caliente').length) fail('caliente has no break with 3 letters on each side');
console.log(fails ? fails + ' FAILED' : 'PASS: every label fits');
process.exit(fails ? 1 : 0);
