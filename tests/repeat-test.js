// Task 1: repetition budget. Run: node tests/repeat-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
let lives = 0, repeats = 0, near = 0, cry = 0, cryMax = 0; const dec = []; const per = {};
for (let i = 0; i < 150; i++) {
  const P = createLife(i * 17 + 5, { auto: true }); let g = 0; while (P.alive && g++ < 130) stepYear(P); lives++;
  // Lặp = người chơi gặp lại đúng một tiêu đề đã gặp (thứ người chơi thấy), không phải id nội bộ.
  const picks = P.log.filter(e => / — bạn chọn: /.test(e.text)).map(e => [e.age, e.text.split(' — ')[0]]);
  const c = {}; for (const [, t] of picks) c[t] = (c[t] || 0) + 1;
  for (const k in c) if (c[k] > 1) { repeats += c[k] - 1; per[k] = (per[k] || 0) + c[k] - 1; }
  for (let a = 0; a < picks.length; a++) for (let b = a + 1; b < picks.length; b++) if (picks[a][1] === picks[b][1] && picks[b][0] - picks[a][0] <= 5) near++;
  const cries = P.log.filter(e => /khóc/.test(e.text) && / — bạn chọn: /.test(e.text)).length + (P.lw.scenesText || []).filter(t => /khóc/.test(t)).length;
  cry += cries; cryMax = Math.max(cryMax, cries);
  dec.push(P.choices.length);
}
dec.sort((a, b) => a - b);
const r = { repeatsPerLife: +(repeats / lives).toFixed(2), sameTitleWithin5y: +(near / lives).toFixed(2), cryScenesPerLife: +(cry / lives).toFixed(2), cryMax, decisions_p50: dec[dec.length >> 1] };
console.log(r);
console.log('top repeats:', Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => k + ':' + (v / lives).toFixed(2)).join(' '));
assert(r.repeatsPerLife <= 8, 'repeatsPerLife ' + r.repeatsPerLife + ' > 8');
assert(r.sameTitleWithin5y <= 0.5, 'sameTitleWithin5y ' + r.sameTitleWithin5y + ' > 0.5');
assert(r.cryMax <= 2, 'cry scenes in one life ' + r.cryMax + ' > 2');
console.log('PASS repeat-test');
`);
