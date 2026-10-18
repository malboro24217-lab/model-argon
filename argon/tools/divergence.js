/* Đo độ rẽ nhánh của từng bước ngoặt bằng tua lại phản thực.
   Chạy: node divergence.js <đường dẫn .head.js> [số đời=60] [số ngã rẽ mỗi đời=4]
   Mỗi ngã rẽ: tua lại đời gốc, rồi tua lại với lựa chọn khác ở đúng thẻ đó; so phần đời SAU tuổi rẽ:
     laterDiff = % id tình huống về sau của đời gốc không còn xuất hiện trong đời rẽ
     dAge = |Δ tuổi chết|, dNet = |Δ tiền ròng| / thu nhập năm, dDoors+dPaths = số cửa/con đường khác nhau.
   In phân phối theo hạng (lon/vua/bond) và danh sách thẻ dưới chuẩn (lớn < 70%, vừa < 40%). */
const fs = require('fs');
eval(fs.readFileSync(process.argv[2], 'utf8') + `
const NL = +(process.argv[3] || 60), PER = +(process.argv[4] || 4);
const tierOf = id => { const s = [...Argon.FATE, ...Argon.FATE_ECHO].find(x => x.id === id); return s ? (id.startsWith('bond_') ? 'bond' : s.meta.tier) : null; };
const paths = P => [...P.lw.sflags].filter(f => f.startsWith('life_')).sort();
const rows = [];
for (let i = 0; i < NL; i++) {
  const P = createLife(i * 7919 + 17, { auto: true }); G.life = P; while (P.alive) stepYear(P);
  CF_FOCUS = P.focusLog;
  const B = replayLife(P.seed, P.choices, null, P.actLog || []);
  const forks = P.lw.cz.marks.filter(m => m.key && m.alt_indices && m.alt_indices.length && tierOf(m.storylet) && m.age < P.age - 3);
  const pick = forks.filter((_, k) => k % Math.max(1, Math.floor(forks.length / PER)) === 0).slice(0, PER);
  for (const m of pick) {
    const alt = m.alt_indices[(i + m.age) % m.alt_indices.length];
    const X = replayLife(P.seed, P.choices, { key: m.key, index: alt }, P.actLog || []);
    const la = B.lw.history.filter(h => h.age > m.age).map(h => h.id), lb = new Set(X.lw.history.filter(h => h.age > m.age).map(h => h.id));
    const inc = Math.max(300, householdIncome(B));
    const dDoors = [...B.lw.cz.doors].filter(d => !X.lw.cz.doors.has(d)).length + [...X.lw.cz.doors].filter(d => !B.lw.cz.doors.has(d)).length;
    const pa = paths(B), pb = paths(X), dPaths = pa.filter(x => !pb.includes(x)).length + pb.filter(x => !pa.includes(x)).length;
    rows.push({ id: m.storylet, tier: tierOf(m.storylet), age: m.age, laterDiff: la.length ? 1 - la.filter(x => lb.has(x)).length / la.length : 0, dAge: Math.abs(B.age - X.age), dNet: Math.abs(B.savings - X.savings) / inc, dDoorsPaths: dDoors + dPaths });
  }
}
const q = (a, p) => { a = [...a].sort((x, y) => x - y); return a.length ? +a[Math.floor(p * (a.length - 1))].toFixed(2) : null; };
const summary = {};
for (const t of ['lon', 'vua', 'bond']) { const r = rows.filter(x => x.tier === t); if (!r.length) continue;
  summary[t] = { n: r.length, laterDiff: { p25: q(r.map(x => x.laterDiff), .25), p50: q(r.map(x => x.laterDiff), .5), p75: q(r.map(x => x.laterDiff), .75) }, dAge_p50: q(r.map(x => x.dAge), .5), dNet_p50: q(r.map(x => x.dNet), .5), dDoorsPaths_mean: +(r.reduce((s, x) => s + x.dDoorsPaths, 0) / r.length).toFixed(2) }; }
const byId = {}; for (const r of rows) (byId[r.id] = byId[r.id] || []).push(r.laterDiff);
const bar = { lon: 0.7, vua: 0.4, bond: 0.4 };
const under = Object.entries(byId).map(([id, v]) => [id, q(v, .5), v.length]).filter(([id, m]) => m < bar[tierOf(id)]).sort((a, b) => a[1] - b[1]);
console.log(JSON.stringify({ forksMeasured: rows.length, summary, underBar: under.slice(0, 25) }, null, 1));
`);
