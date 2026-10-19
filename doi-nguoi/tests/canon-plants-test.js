// Task 20c (final review I3): vật gài được dùng dần. Run: node doi-nguoi/tests/canon-plants-test.js  (khoảng 1,5 phút)
// Đo trên 60 đời tự chơi (cùng hạt giống với canon-test.js):
//  - vết lặp giữa hai mùa liền nhau (đồ, nợ): < 30%;
//  - `what` của canon event dùng lại trong cùng một đời: < 25% (bỏ các đời có ≤ 1 vật gài);
//  - fromPlayer chỉ đếm mầm còn tươi; mầm đã điền chỗ trống mang `used` = tuổi biến cố.
// Rồi kiểm: mầm nợ / lời hứa ở vết "no" bị bỏ khi trả nợ / giữ lời trong mùa (không tính luật năm), và tua lại ra đúng sổ mầm.
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
Argon = Object.assign({}, Argon); const gen0 = Argon.generateCanon;
let evs = [];
Argon.generateCanon = function (c, axis, plants) {
  const ev = gen0.apply(this, arguments);
  if (ev) {
    const before = plants.map(p => ({ kind: p.kind, key: p.key, used: p.used }));
    const fresh = Argon.eventPlants(ev.slots, plants).some(r => before.some(p => p.kind === r.kind && p.key === r.key && p.used === undefined));
    evs.push({ age: c.age, what: ev.slots.what ? (ev.slots.what.kind === 'asset' ? 'asset:' + ev.slots.what.key : ev.slots.what.kind + ':' + ev.slots.what.key) : null, whatPlant: ev.slots.what && ev.slots.what.kind !== 'asset' ? ev.slots.what : null, fp: ev.slots.fromPlayer, fresh });
  }
  return ev;
};

// 1. 60 đời tự chơi
const N = 60;
let pairs = 0, doRep = 0, noRep = 0, evWhat = 0, whatReuse = 0, events = 0, fromPlayer = 0, fpWithoutFresh = 0, unmarked = 0, onePlantLives = 0;
const kept = [];
for (let i = 0; i < N; i++) {
  const P = createLife(i * 31 + 11, { auto: true }); G.life = P; evs = [];
  const seasons = []; let g = 0;
  while (P.alive && g++ < 130) {
    stepYear(P);
    const se = P.lw.season;
    if (se && !seasons.some(s => s.from === se.from && s.id === se.id)) seasons.push({ id: se.id, from: se.from, sc: se.scars });
  }
  for (let k = 1; k < seasons.length; k++) {
    pairs++; const a = seasons[k - 1].sc, b = seasons[k].sc;
    if (a.do && b.do && a.do.key === b.do.key) doRep++;
    if (a.no && b.no && a.no.key === b.no.key) noRep++;
  }
  const plantsEver = new Set(P.lw.plants.map(p => p.kind + ':' + p.key)); for (const e of evs) if (e.whatPlant) plantsEver.add(e.what);
  events += evs.length;
  for (const e of evs) {
    if (e.fp > 0) fromPlayer++;
    if (e.fp > 0 && !e.fresh) fpWithoutFresh++;
    if (e.whatPlant && e.whatPlant.used === undefined) unmarked++;   // cùng object với sổ mầm: host phải ghi used sau biến cố
  }
  if (plantsEver.size <= 1) { onePlantLives++; continue; }
  const whats = evs.filter(e => e.what).map(e => e.what);
  evWhat += whats.length; whatReuse += whats.length - new Set(whats).size;
  if (kept.length < 3 && seasons.length >= 2) kept.push(P);
}
const r = (a, b) => b ? a / b : 0;
const stats = { lives: N, onePlantLives, seasonPairs: pairs, scarDoRepeat: +r(doRep, pairs).toFixed(3), scarNoRepeat: +r(noRep, pairs).toFixed(3),
  eventsWithWhat: evWhat, whatReuse: +r(whatReuse, evWhat).toFixed(3), events, fromPlayerShare: +r(fromPlayer, events).toFixed(3) };
console.log(JSON.stringify(stats));
assert(pairs >= 40, 'đủ cặp mùa liền nhau để đo (' + pairs + ')');
assert(stats.scarDoRepeat < 0.30, 'vết đồ lặp giữa hai mùa liền nhau < 30% (' + stats.scarDoRepeat + ')');
assert(stats.scarNoRepeat < 0.30, 'vết nợ lặp giữa hai mùa liền nhau < 30% (' + stats.scarNoRepeat + ')');
assert(evWhat >= 60, 'đủ biến cố có what để đo (' + evWhat + ')');
assert(stats.whatReuse < 0.25, 'what dùng lại trong một đời < 25% (' + stats.whatReuse + ')');
assert.strictEqual(fpWithoutFresh, 0, 'fromPlayer chỉ đếm khi chỗ trống điền bằng mầm còn tươi');
assert.strictEqual(unmarked, 0, 'mầm đã điền what được ghi used');

// 2. Chỉ chung kết của mùa mới khép vết "no": repay khép mầm nợ, KEPT_PROMISE khép mầm lời hứa.
//    Thẻ giữa mùa (thẻ chủ nợ chung "Trả một phần ngay" repay:0.3, ký ức KEPT_PROMISE của một lựa chọn không liên quan) không khép gì.
function grow(seed, toAge, pred) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && !P.pending && !P.lw.season && (!pred || pred(P))) return P; } throw new Error('no life'); }
const SID = 'vu_an_gia_toc', SDEF = Argon.SEASONS.find(s => s.id === SID);
function withPlant(kind, key) {
  const P = grow(7001, 30, Q => canonIndependent(Q)); G.life = P;
  P.lw.plants = P.lw.plants.filter(p => p.kind !== 'debt' && p.kind !== 'promise');
  P.lw.plants.push({ kind, key, label: 'nhãn ' + key, age: 20, weight: 1 });
  assert(enterSeason(P, SID), 'vào mùa');
  assert.strictEqual(P.lw.season.scars.no.key, key, kind + ': mầm làm vết no');
  assert.strictEqual(P.lw.plants.find(p => p.key === key).used, P.age, kind + ': vết ghi used');
  return P;
}
const has = (P, key) => P.lw.plants.some(p => p.key === key);
const someNpc = P => [...P.lw.cast.values()].find(m => m.alive).id;
const KEPT = P => ({ memory: { npc: someNpc(P), tag: 'KEPT_PROMISE', weight: 0.1, note: 'một lựa chọn không liên quan' } });
// Thẻ chủ nợ chung (storylets.ts creditor_knock), lựa chọn "Trả một phần ngay": phần trả nợ của nó, không có season_end.
const creditor = Argon.STORYLETS.find(s => s.id === 'creditor_knock');
assert(creditor, 'có thẻ chủ nợ chung creditor_knock');
function partialPay(P) {   // dựng đúng thẻ, chủ nợ là một người còn sống trong dàn
  const c = factContext(P); const ctx = { ...c, cast: { ...c.cast, creditor: someNpc(P) } };
  const e = creditor.build(ctx, id => castName(P, id)).choices[0].effects;
  assert(/(^|\|)repay:0\.3/.test(e.custom || '') && !Argon.landingOf(e), 'lựa chọn "Trả một phần ngay" là repay:0.3, không phải chung kết');
  return e;
}
{
  const P = withPlant('debt', 'no_thu');
  canonApplyQuiet(P, { custom: 'repay:0.1' });
  assert(has(P, 'no_thu'), 'luật năm (canonQuiet) không khép mầm nợ');
  applyEffect(P, partialPay(P));
  assert(has(P, 'no_thu'), 'thẻ chủ nợ chung giữa mùa (repay:0.3) không khép mầm nợ');
  applyEffect(P, KEPT(P));
  assert(has(P, 'no_thu'), 'ký ức KEPT_PROMISE giữa mùa không khép mầm nợ');
  const land = SDEF.landings.find(l => /(^|\|)repay/.test(l.effects.custom || ''));
  assert(land, SID + ' có chung kết trả nợ');
  applyEffect(P, land.effects);
  assert(!P.lw.season, 'chung kết kết mùa');
  assert(!has(P, 'no_thu'), 'chung kết repay: mầm nợ ở vết no bị bỏ');
}
{
  const P = withPlant('promise', 'loi_hua_thu');
  applyEffect(P, KEPT(P));
  assert(has(P, 'loi_hua_thu'), 'ký ức KEPT_PROMISE giữa mùa không khép mầm lời hứa');
  const land = SDEF.landings.find(l => /(^|\|)repay/.test(l.effects.custom || ''));
  applyEffect(P, land.effects);
  assert(!P.lw.season && has(P, 'loi_hua_thu'), 'chung kết repay không khép mầm lời hứa');
}
{
  const P = withPlant('promise', 'loi_hua_giu');
  const land = SDEF.landings[0];
  applyEffect(P, { ...KEPT(P), custom: 'season_end:' + land.id });
  assert(!P.lw.season, 'chung kết kết mùa');
  assert(!has(P, 'loi_hua_giu'), 'chung kết giữ lời (KEPT_PROMISE): mầm lời hứa ở vết no bị bỏ');
}
{
  // Vết vẫn in "Vì năm N…" khi mầm đã bị bỏ: scarCauses không tra sổ mầm
  const P = withPlant('debt', 'no_van_in');
  const sc = P.lw.season.scars; P.lw.plants = P.lw.plants.filter(p => p.key !== 'no_van_in');
  assert(scarCauses(P, P.lw.season).includes(Argon.prov.flag(Argon.plantFlag(sc.no))), 'scarCauses dùng loại của vết, không cần mầm còn trong sổ');
}

// 3. Tua lại: cùng sổ mầm (khóa, used) với bản gốc
for (const P of kept) {
  G.life = P;
  const R = replayLife(P.seed, P.choices, null, P.actLog || []);
  const sig = Q => Q.lw.plants.map(p => p.kind + ':' + p.key + '@' + p.age + '/' + p.used).join(',');
  assert.strictEqual(sig(R), sig(P), 'tua lại ra đúng sổ mầm (đời ' + P.seed + ')');
}
console.log('canon-plants-test: OK');
`);
