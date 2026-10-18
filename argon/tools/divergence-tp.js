/* Đo độ rẽ nhánh của thẻ bước ngoặt Codex (id dạng tp_c01, tp_a12, tp_m03, tp_l40).
   Chạy: node argon/tools/divergence-tp.js doi-nguoi/tests/.head.js [số đời=50] [số ngã rẽ mỗi đời=4]
   Giống divergence.js nhưng nhận diện thẻ theo tiền tố tp_ thay vì Argon.FATE.
   In: trung vị/p25/p75 "thẻ về sau khác", tỉ lệ ngã rẽ đạt ≥70% và ≥40%, và từng thẻ (trung vị, số lần đo). */
const fs = require('fs');
eval(fs.readFileSync(process.argv[2], 'utf8') + `
const NL = +(process.argv[3] || 50), PER = +(process.argv[4] || 4);
const isTp = id => /^tp_[a-z][0-9]+$/.test(id);
const paths = P => [...P.lw.sflags].filter(f => f.startsWith('life_')).sort();
const rows = [];
for (let i = 0; i < NL; i++) {
  const P = createLife(i * 7919 + 17, { auto: true }); G.life = P; while (P.alive) stepYear(P);
  CF_FOCUS = P.focusLog;
  const B = replayLife(P.seed, P.choices, null, P.actLog || []);
  const forks = P.lw.cz.marks.filter(m => m.key && m.alt_indices && m.alt_indices.length && isTp(m.storylet) && m.age < P.age - 3);
  const pick = forks.filter((_, k) => k % Math.max(1, Math.floor(forks.length / PER)) === 0).slice(0, PER);
  for (const m of pick) {
    const alt = m.alt_indices[(i + m.age) % m.alt_indices.length];
    const X = replayLife(P.seed, P.choices, { key: m.key, index: alt }, P.actLog || []);
    const la = B.lw.history.filter(h => h.age > m.age).map(h => h.id), lb = new Set(X.lw.history.filter(h => h.age > m.age).map(h => h.id));
    const pa = paths(B), pb = paths(X);
    rows.push({ id: m.storylet, laterDiff: la.length ? 1 - la.filter(x => lb.has(x)).length / la.length : 0, dAge: Math.abs(B.age - X.age),
      dNet: Math.abs(B.savings - X.savings) / Math.max(300, householdIncome(B)), dPaths: pa.filter(x => !pb.includes(x)).length + pb.filter(x => !pa.includes(x)).length });
  }
}
const q = (a, p) => { a = [...a].sort((x, y) => x - y); return a.length ? +a[Math.floor(p * (a.length - 1))].toFixed(2) : null; };
const ld = rows.map(x => x.laterDiff);
const byId = {}; for (const r of rows) (byId[r.id] = byId[r.id] || []).push(r.laterDiff);
console.log(JSON.stringify({ forksMeasured: rows.length,
  laterDiff: { p25: q(ld, .25), p50: q(ld, .5), p75: q(ld, .75) }, share70: +(ld.filter(x => x >= .7).length / (ld.length || 1)).toFixed(2), share40: +(ld.filter(x => x >= .4).length / (ld.length || 1)).toFixed(2),
  dAge_p50: q(rows.map(x => x.dAge), .5), dNet_p50: q(rows.map(x => x.dNet), .5), dPaths_mean: +(rows.reduce((s, x) => s + x.dPaths, 0) / (rows.length || 1)).toFixed(2),
  perCard: Object.fromEntries(Object.entries(byId).map(([id, v]) => [id, [q(v, .5), v.length]]).sort((a, b) => a[1][0] - b[1][0])) }, null, 1));
`);
