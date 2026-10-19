/* Đầu dò phá sản của canon event (cân chỉnh tiền, 2026-10-19). Không giao diện, không đổi kết quả khi không bật thí nghiệm.
   Chạy: node argon/tools/canon-money-probe.js doi-nguoi/tests/.head.js [số đời=200] [weird=1] [seed offset=0]
   Cùng seed với canon-stats.js (i*7919+17+offset), cùng cách đếm phá sản (L.bankrupt > 0), cùng baseline (Argon.generateCanon trả null).

   In ra:
   - brokeOn / brokeOff và bảng ghép đôi theo seed (chỉ bật mới phá sản, chỉ tắt mới phá sản, cả hai).
   - Lần phá sản đầu tiên của mỗi đời (bật canon): đang trong mùa (theo nhóm hệ số < 1, = 1, > 1), ≤ 3 năm sau khi ra mùa, muộn hơn,
     hay đời chưa từng vào mùa; kèm phân bố tuổi, so với baseline.
   - Theo id mùa: số đời vào mùa, tỉ lệ phá sản của các đời đó khi bật, tỉ lệ phá sản của CÙNG seed khi tắt (dư = chênh), số lần phá sản
     xảy ra trong mùa hay ≤ 3 năm sau mùa đó.
   - Dòng tiền của mùa (đơn vị: năm lương gốc, cộng trên mọi đời): luật năm, reset.cash, chung kết, money:<x> trong mùa (âm / dương),
     và phần "lỗ thêm" do R24 tính khoản âm trên lương gốc thay vì lương thực trong mùa hệ số < 1.
   - Chẩn đoán ngưỡng: lần phá sản trong mùa hệ số < 1 mà nợ ≤ 5 × lương gốc (tức chỉ vỡ vì ngưỡng tính trên lương thực đã bị hạ).

   Thí nghiệm (biến môi trường, chỉ để đo; không phải bản chơi):
   - PROBE_YEARLY=off        bỏ luật năm của mọi mùa
   - PROBE_YEARLY=min        khoản tiền âm của luật năm tính trên min(lương gốc, lương thực)
   - PROBE_LOSSMIN=1         mọi money:<x> âm trong mùa tính trên min(gốc, thực) (đã thành mã ở R29 đề xuất; chỉ dùng trên bản trước R29)
   - PROBE_KEEP=<0..1>       RESET_CASH_KEEP
   - PROBE_NORESET=1         bỏ reset.cash
   - PROBE_LANDMONEY=<k>     nhân money:<x> dương của chung kết với k
   - PROBE_MULT1=1           mùa hệ số < 1 không hạ lương (chẩn đoán)
   - PROBE_THRESH_BASE=1     ngưỡng vỡ nợ tính trên lương gốc trong mùa
   - PROBE_MULTS=id=k,...    đổi rules.income của mùa (thử hệ số)
   - PROBE_NO_BASELINE=1     bỏ lượt canon tắt */
import fs from 'node:fs';
let SRC = fs.readFileSync(process.argv[2], 'utf8');
// PROBE_THRESH_BASE=1: ngưỡng vỡ nợ (nợ > 5 năm thu nhập) đo bằng lương gốc trong mùa (seasonYearlyBase) thay vì lương thực.
if (process.env.PROBE_THRESH_BASE) { const a = 'const a = s.capitals.capitalAssets, yi = Math.max(300, householdIncome(L));'; if (!SRC.includes(a)) throw new Error('PROBE_THRESH_BASE: không thấy dòng ngưỡng'); SRC = SRC.replace(a, 'const a = s.capitals.capitalAssets, yi = seasonYearlyBase(L);'); }
eval(SRC + '\n;(' + function () {
  const NL = +(process.argv[3] || 200), WEIRD = process.argv[4] === undefined ? 1 : +process.argv[4], OFF = +(process.argv[5] || 0);
  const X = process.env;
  const baseCreate = createLife;
  createLife = function (seed, opts) { const L = baseCreate(seed, opts); L.weird = WEIRD; return L; };
  let genOff = false;
  const realGen = Argon.generateCanon, realReset = Argon.resetCashDelta;
  const KEEP = X.PROBE_KEEP !== undefined ? +X.PROBE_KEEP : null;
  Argon = Object.assign(Object.create(null), Argon, {
    generateCanon: function () { return genOff ? null : realGen.apply(this, arguments); },
    resetCashDelta: function (target, own) {
      if (X.PROBE_NORESET) return 0;
      const d = KEEP === null ? realReset(target, own) : (own > target ? -(own - target) * (1 - KEEP) : target - own);
      if (cur) { const u = seasonYearlyBase(cur.L) || 1; cur.flow.reset += d / u; }
      return d;
    }
  });
  // PROBE_MULTS=lam_lai=0.8,xu_nguoi=1: đổi rules.income của các mùa trước khi chạy (thử hệ số).
  for (const kv of (X.PROBE_MULTS || '').split(',').filter(Boolean)) { const [id, v] = kv.split('='); const d = seasonDef(id); if (!d) throw new Error('PROBE_MULTS: không có mùa ' + id); d.rules.income = +v; }
  const multOf = id => { const d = seasonDef(id); const w = d && d.rules.income; return w > 0 ? w : 1; };
  const bucket = m => m < 1 ? 'lt1' : m > 1 ? 'gt1' : 'eq1';
  let cur = null;   // đời đang chạy: { L, flow, ... }

  // luật năm
  const realYearly = seasonYearly;
  seasonYearly = function (L) {
    const se = L.lw && L.lw.season;
    if (!se || se.yearAt >= L.age) return realYearly(L);
    const d = seasonDef(se.id), y = d && d.rules.yearly;
    if (X.PROBE_YEARLY === 'off' && y) { se.yearAt = L.age; return; }
    const s0 = L.savings, u = seasonYearlyBase(L) || 1;
    if (X.PROBE_YEARLY === 'min' && y && y.money < 0) {
      se.yearAt = L.age;
      const real = Math.max(300, householdIncome(L)), k = Math.min(u, real) / u;
      canonApplyQuiet(L, canonOwnOnly(L, { ...y, money: y.money * k }, false));
    } else realYearly(L);
    if (cur && y) { const dv = (L.savings - s0) / u; cur.flow.yearly += dv; cur.yearlyBy[se.id] = (cur.yearlyBy[se.id] || 0) + dv; }
  };
  // money:<x> trong mùa và ở chung kết
  const realApply = applyEffect;
  applyEffect = function (L, e, npcId) {
    if (cur && e && !e.gamble && L.lw && L.lw.canon) {
      const land = Argon.landingOf(e) !== null, se = L.lw.season;
      if (land && e.money > 0 && X.PROBE_LANDMONEY !== undefined) e = { ...e, money: e.money * +X.PROBE_LANDMONEY };
      if (e.money && sceneId) { const k = sceneId.replace(/@\d+$/, '') + (se ? '' : ' (ngoài mùa)'); cur.byCard[k] = (cur.byCard[k] || 0) + e.money; }
      if (land && e.money) cur.flow.landing += e.money;
      else if (se && e.money) {
        const m = se.mult || 1;
        if (e.money < 0) {
          cur.flow.seasonNeg += e.money;
          if (m < 1 && canonIndependent(L)) cur.flow.r24extra += e.money * (1 - m);   // base − real = base(1−m), tính theo năm gốc
          if (X.PROBE_LOSSMIN && m < 1 && earnsOwnLiving(L)) e = { ...e, money: e.money * m };
        } else cur.flow.seasonPos += e.money;
      }
    }
    return realApply(L, e, npcId);
  };
  if (X.PROBE_MULT1) {
    const realEnter = enterSeason;
    enterSeason = function (L, id) {
      const d = seasonDef(id); const w = d && d.rules.income;
      if (d && w > 0 && w < 1) { const save = d.rules.income; d.rules.income = 1; try { return realEnter(L, id); } finally { d.rules.income = save; } }
      return realEnter(L, id);
    };
  }
  // thẻ đang giải (để quy tiền money:<x> về từng thẻ)
  let sceneId = null;
  const realResolve = resolve;
  resolve = function (L, i) { const was = sceneId; sceneId = L.pending ? String(L.pending.key || L.pending.id) : null; try { return realResolve(L, i); } finally { sceneId = was; } };
  // phá sản: chụp mùa trước argonYear (lần kiểm vỡ nợ nằm trong đó)
  let preDebt = null;   // nợ ngay lúc kiểm vỡ nợ (seizeOnDefault chạy trước khi nợ bị khoanh)
  const realSeize = seizeOnDefault;
  seizeOnDefault = function (L, target) { preDebt = L.ar.state.capitals.capitalAssets.debt; return realSeize(L, target); };
  const realArgonYear = argonYear;
  argonYear = function (L) {
    const b0 = L.bankrupt || 0, se = L.lw && L.lw.season ? { id: L.lw.season.id, mult: L.lw.season.mult || 1, from: L.lw.season.from } : null;
    const r = realArgonYear(L);
    if (cur && (L.bankrupt || 0) > b0) {
      const a = L.ar.state.capitals.capitalAssets;
      const recs = (L.lw && L.lw.canon && L.lw.canon.seasons) || [];
      const last = [...recs].reverse().find(s => s.to <= L.age);
      cur.bk.push({ age: L.age, se, last: last ? { id: last.id, mult: multOf(last.id), to: last.to, since: L.age - last.to, reason: last.reason } : null,
        debtOverBase: +((preDebt ?? a.debt) / (seasonYearlyBase(L) || 1)).toFixed(2) });
    }
    return r;
  };

  function run(canonOff) {
    genOff = canonOff;
    const lives = [];
    for (let i = 0; i < NL; i++) {
      const seed = i * 7919 + 17 + OFF;
      const L = createLife(seed, { auto: true }); G.life = L;
      cur = { L, flow: { yearly: 0, reset: 0, landing: 0, seasonNeg: 0, seasonPos: 0, r24extra: 0 }, yearlyBy: {}, bk: [], byCard: {}, at: {} };
      let g = 0, still = 0;
      while (L.alive && g++ < 200) { const a0 = L.age; stepYear(L); if (L.age === a0 && L.alive) { if (++still >= 3) break; } else still = 0;
        if (L.alive && L.age > a0 && [30, 45, 60].includes(L.age) && L.ar) { const a = L.ar.state.capitals.capitalAssets, u = seasonYearlyBase(L) || 1; cur.at[L.age] = { base: u, real: Math.max(300, householdIncome(L)), debt: a.debt, net: a.liquid - a.debt, inSeason: !!L.lw.season }; } }
      const seasons = [...((L.lw.canon && L.lw.canon.seasons) || []), ...(L.lw.season ? [{ id: L.lw.season.id, from: L.lw.season.from, to: L.age, reason: 'running' }] : [])];
      lives.push({ seed, broke: (L.bankrupt || 0) > 0, age: L.age, seasons: seasons.map(s => ({ id: s.id, from: s.from, to: s.to, mult: multOf(s.id), reason: s.reason })), bk: cur.bk, flow: cur.flow, yearlyBy: cur.yearlyBy, byCard: cur.byCard, at: cur.at });
      cur = null;
    }
    return lives;
  }
  const r3 = x => +x.toFixed(3);
  const on = run(false);
  const off = X.PROBE_NO_BASELINE ? null : run(true);
  const res = { lives: NL, weird: WEIRD, seedOffset: OFF, experiment: Object.fromEntries(Object.entries(X).filter(([k]) => k.startsWith('PROBE_'))) };
  res.brokeOn = r3(on.filter(l => l.broke).length / NL);
  if (off) {
    res.brokeOff = r3(off.filter(l => l.broke).length / NL); res.delta = r3(res.brokeOn - res.brokeOff);
    const pair = { onlyOn: 0, onlyOff: 0, both: 0, neither: 0 };
    on.forEach((l, i) => { const b = off[i].broke; pair[l.broke && b ? 'both' : l.broke ? 'onlyOn' : b ? 'onlyOff' : 'neither']++; });
    res.paired = pair;
  }
  // lần phá sản đầu tiên: ở đâu
  const where = {}, ageB = (a) => a < 25 ? '<25' : a < 35 ? '25-34' : a < 45 ? '35-44' : a < 55 ? '45-54' : a < 65 ? '55-64' : '65+';
  const ageOn = {}, ageOff = {};
  let thrOnly = 0, inLt1 = 0;
  for (const l of on) {
    if (!l.bk.length) continue;
    const b = l.bk[0];
    const k = b.se ? 'in_' + bucket(b.se.mult) : !l.seasons.some(s => s.from <= b.age) ? 'neverSeasoned' : b.last && b.last.since <= 3 ? 'after0_3_' + bucket(b.last.mult) : 'later';
    where[k] = (where[k] || 0) + 1; ageOn[ageB(b.age)] = (ageOn[ageB(b.age)] || 0) + 1;
    for (const x of l.bk) if (x.se && x.se.mult < 1) { inLt1++; if (x.debtOverBase <= 5) thrOnly++; }
  }
  if (off) for (const l of off) if (l.bk.length) { const a = ageB(l.bk[0].age); ageOff[a] = (ageOff[a] || 0) + 1; }
  res.firstBankruptcyWhere = where; res.firstBankruptcyAge = { on: ageOn, off: ageOff };
  res.thresholdDiag = { bankruptciesInLt1Season: inLt1, debtAtMost5Base: thrOnly };
  // theo mùa
  const by = {};
  on.forEach((l, i) => {
    const ids = new Set(l.seasons.map(s => s.id));
    for (const id of ids) { const o = by[id] || (by[id] = { mult: multOf(id), lives: 0, brokeOn: 0, brokeOffSameSeed: 0, bkIn: 0, bkAfter3: 0, yearly: 0 }); o.lives++; if (l.broke) o.brokeOn++; if (off && off[i].broke) o.brokeOffSameSeed++; o.yearly += l.yearlyBy[id] || 0; }
    for (const b of l.bk) {
      if (b.se) by[b.se.id].bkIn++;
      else if (b.last && b.last.since <= 3 && by[b.last.id]) by[b.last.id].bkAfter3++;
    }
  });
  res.bySeason = Object.entries(by).map(([id, o]) => ({ id, ...o, excess: o.brokeOn - o.brokeOffSameSeed, yearly: +o.yearly.toFixed(2) }))
    .sort((a, b) => b.excess - a.excess || b.lives - a.lives);
  // theo nhóm hệ số
  const byM = {};
  for (const s of res.bySeason) { const k = bucket(s.mult); const o = byM[k] || (byM[k] = { seasons: 0, lifeEntries: 0, brokeOn: 0, brokeOffSameSeed: 0, bkIn: 0, bkAfter3: 0 }); o.seasons++; o.lifeEntries += s.lives; o.brokeOn += s.brokeOn; o.brokeOffSameSeed += s.brokeOffSameSeed; o.bkIn += s.bkIn; o.bkAfter3 += s.bkAfter3; }
  res.byMultBucket = byM;
  const sum = k => r3(on.reduce((t, l) => t + l.flow[k], 0) / NL);
  res.flowPerLife = { yearly: sum('yearly'), reset: sum('reset'), landing: sum('landing'), seasonNeg: sum('seasonNeg'), seasonPos: sum('seasonPos'), r24extraLoss: sum('r24extra') };
  // năm trong mùa theo nhóm hệ số
  const yrs = { lt1: 0, eq1: 0, gt1: 0 };
  for (const l of on) for (const s of l.seasons) yrs[bucket(s.mult)] += Math.max(0, s.to - s.from);
  res.seasonYearsPerLife = Object.fromEntries(Object.entries(yrs).map(([k, v]) => [k, r3(v / NL)]));
  // lương và nợ ở 30 / 45 / 60 tuổi (trung vị trên các đời còn sống), bật so với tắt
  const med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? Math.round(a[Math.floor(a.length / 2)]) : null; };
  const atStats = lives => Object.fromEntries([30, 45, 60].map(age => { const r = lives.map(l => l.at[age]).filter(Boolean);
    return [age, { n: r.length, base: med(r.map(x => x.base)), real: med(r.map(x => x.real)), debtOverBase: +(med(r.map(x => 100 * x.debt / x.base)) / 100).toFixed(2), netOverBase: +(med(r.map(x => 100 * x.net / x.base)) / 100).toFixed(2), inSeason: r.filter(x => x.inSeason).length }]; }));
  res.atAge = { on: atStats(on), off: off ? atStats(off) : null };
  // money:<x> theo thẻ (năm lương gốc, cộng mọi đời), 15 thẻ âm nhất và 8 dương nhất
  const cards = {}; for (const l of on) for (const k in l.byCard) cards[k] = (cards[k] || 0) + l.byCard[k];
  const cs = Object.entries(cards).sort((a, b) => a[1] - b[1]);
  res.moneyByCardMostNeg = cs.slice(0, 15).map(([k, v]) => [k, +v.toFixed(2)]); res.moneyByCardMostPos = cs.slice(-8).reverse().map(([k, v]) => [k, +v.toFixed(2)]);
  const sumIf = f => +cs.filter(([k]) => f(k)).reduce((t, [, v]) => t + v, 0).toFixed(1);
  res.moneyByCardGroups = { seasonCards: sumIf(k => k.startsWith('ss_') && !k.includes('ngoài mùa')), otherInSeason: sumIf(k => !k.startsWith('ss_') && !k.includes('ngoài mùa')), outOfSeason: sumIf(k => k.includes('ngoài mùa')) };
  if (X.PROBE_DUMP) fs.writeFileSync(X.PROBE_DUMP, JSON.stringify({ on, off }));
  res.bySeason = res.bySeason.slice(0, +(X.PROBE_TOP || 25));
  console.log(JSON.stringify(res, null, 1));
}.toString() + ')()');
