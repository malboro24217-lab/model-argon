/* Đo độ rẽ nhánh của canon event: đổi sang một cửa khác ở đúng canon event, tua lại, so phần đời về sau.
   Chạy: node argon/tools/divergence-canon.js doi-nguoi/tests/.head.js [số đời=50] [số ngã rẽ mỗi đời=3] [weird=1]
   Giống divergence-tp.js nhưng chọn dấu (mark) có storylet id bắt đầu bằng "canon_" (canon event nổ qua scene(), id "canon_<mầm>..._<tuổi>").
   weird = 0|1|2 đặt L.weird lúc sinh, cả ở đời gốc lẫn đời tua lại (mặc định 1, mức "Phim", để cửa kỳ dị có thể xuất hiện).
   Mỗi ngã rẽ: đời gốc tua lại một lần (B), rồi tua lại với cửa khác (X, lấy alt_indices[(i + tuổi) % số cửa khác]); chỉ lấy
   canon event cách cuối đời > 3 năm. Đo trên phần SAU tuổi rẽ:
     laterDiff = % id tình huống về sau của B không còn xuất hiện ở X (chuẩn: trung vị >= 0.8)
     dAge = |Δ tuổi chết|, dNet = |Δ tiền ròng| / thu nhập hộ, dPaths = số cờ life_* khác nhau.
   In: laterDiff p25/p50/p75, share80 (tỉ lệ ngã rẽ >= 0.8), share70, dAge_p50, dNet_p50, perSeed (trung vị, số lần đo), perCard (từng canon event).
   Chưa có dữ liệu canon (trước Task 7): in { ok:false, noCanonData:true, message } rồi thoát với mã 0.
   Ghi chú ESM: argon/package.json có "type": "module", nên dùng import (require sẽ lỗi như divergence-tp.js cũ). */
import fs from 'node:fs';
eval(fs.readFileSync(process.argv[2], 'utf8') + '\n;(' + function () {
  const NL = +(process.argv[3] || 50), PER = +(process.argv[4] || 3), WEIRD = process.argv[5] === undefined ? 1 : +process.argv[5];
  if (![0, 1, 2].includes(WEIRD)) { console.log(JSON.stringify({ ok: false, error: 'weird phải là 0, 1 hoặc 2' })); return; }
  const baseCreate = createLife;
  createLife = function (seed, opts) { const L = baseCreate(seed, opts); L.weird = WEIRD; return L; };

  const isCanon = id => typeof id === 'string' && id.startsWith('canon_');
  const seedOf = id => { const m = /^canon_(.+?)[_@](\d+)$/.exec(id); return m ? m[1] : id.replace(/^canon_/, ''); };
  const paths = P => [...P.lw.sflags].filter(f => f.startsWith('life_')).sort();
  const q = (a, p) => { a = [...a].sort((x, y) => x - y); return a.length ? +a[Math.floor(p * (a.length - 1))].toFixed(2) : null; };
  const share = (a, thr) => +(a.filter(x => x >= thr).length / (a.length || 1)).toFixed(2);
  const rows = []; let canonMarks = 0, livesWithCanon = 0;
  for (let i = 0; i < NL; i++) {
    const P = createLife(i * 7919 + 17, { auto: true }); G.life = P;
    if (!P.lw || !P.lw.canon) { console.log(JSON.stringify({ ok: false, noCanonData: true, weird: WEIRD,
      message: 'Chưa có dữ liệu canon: L.lw.canon không tồn tại trong bản dựng này (host chưa nối canon-event, Task 7 chưa merge). Không có gì để đo.' }, null, 1)); return; }
    while (P.alive) stepYear(P);
    CF_FOCUS = P.focusLog;
    const B = replayLife(P.seed, P.choices, null, P.actLog || []);
    const cm = P.lw.cz.marks.filter(m => isCanon(m.storylet));
    canonMarks += cm.length; if (cm.length) livesWithCanon++;
    const forks = cm.filter(m => m.key && m.alt_indices && m.alt_indices.length && m.age < P.age - 3);
    const pick = forks.filter((_, k) => k % Math.max(1, Math.floor(forks.length / PER)) === 0).slice(0, PER);
    for (const m of pick) {
      const alt = m.alt_indices[(i + m.age) % m.alt_indices.length];
      const X = replayLife(P.seed, P.choices, { key: m.key, index: alt }, P.actLog || []);
      const la = B.lw.history.filter(h => h.age > m.age).map(h => h.id), lb = new Set(X.lw.history.filter(h => h.age > m.age).map(h => h.id));
      const pa = paths(B), pb = paths(X);
      rows.push({ id: m.storylet, seed: seedOf(m.storylet), laterDiff: la.length ? 1 - la.filter(x => lb.has(x)).length / la.length : 0, dAge: Math.abs(B.age - X.age),
        dNet: Math.abs(B.savings - X.savings) / Math.max(300, householdIncome(B)), dPaths: pa.filter(x => !pb.includes(x)).length + pb.filter(x => !pa.includes(x)).length });
    }
  }
  const ld = rows.map(x => x.laterDiff);
  const bySeed = {}, byId = {};
  for (const r of rows) { (bySeed[r.seed] = bySeed[r.seed] || []).push(r.laterDiff); (byId[r.id] = byId[r.id] || []).push(r.laterDiff); }
  const med = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [q(v, .5), v.length]]).sort((a, b) => a[1][0] - b[1][0]));
  console.log(JSON.stringify({ ok: true, weird: WEIRD, lives: NL, livesWithCanonMark: livesWithCanon, canonMarks, forksMeasured: rows.length,
    laterDiff: { p25: q(ld, .25), p50: q(ld, .5), p75: q(ld, .75) }, share80: share(ld, .8), share70: share(ld, .7),
    dAge_p50: q(rows.map(x => x.dAge), .5), dNet_p50: q(rows.map(x => x.dNet), .5), dPaths_mean: +(rows.reduce((s, x) => s + x.dPaths, 0) / (rows.length || 1)).toFixed(2),
    perSeed: med(bySeed), perCard: med(byId),
    note: rows.length ? undefined : 'Có L.lw.canon nhưng không có ngã rẽ nào đo được (canon event chưa nổ, hoặc dấu chưa có key/alt_indices).' }, null, 1));
}.toString() + ')()');
