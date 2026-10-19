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

// 2. Trả nợ / giữ lời trong mùa thì mầm ở vết "no" không còn "chưa trả"
function grow(seed, toAge, pred) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && !P.pending && !P.lw.season && (!pred || pred(P))) return P; } throw new Error('no life'); }
function withPlant(kind, key) {
  const P = grow(7001, 30, Q => canonIndependent(Q)); G.life = P;
  P.lw.plants = P.lw.plants.filter(p => p.kind !== 'debt' && p.kind !== 'promise');
  P.lw.plants.push({ kind, key, label: 'nhãn ' + key, age: 20, weight: 1 });
  assert(enterSeason(P, 'vu_an_gia_toc'), 'vào mùa');
  assert.strictEqual(P.lw.season.scars.no.key, key, kind + ': mầm làm vết no');
  assert.strictEqual(P.lw.plants.find(p => p.key === key).used, P.age, kind + ': vết ghi used');
  return P;
}
{
  const P = withPlant('debt', 'no_thu');
  canonApplyQuiet(P, { custom: 'repay:0.1' });
  assert(P.lw.plants.some(p => p.key === 'no_thu'), 'luật năm (canonQuiet) không tính là trả xong');
  applyEffect(P, { memory: { npc: [...P.lw.cast.keys()][0], tag: 'KEPT_PROMISE', weight: 0.1 } });
  assert(P.lw.plants.some(p => p.key === 'no_thu'), 'giữ lời không trả mầm nợ');
  applyEffect(P, { custom: 'repay:0.5', log: 'Bạn trả xong.' });
  assert(!P.lw.plants.some(p => p.key === 'no_thu'), 'repay trong mùa: mầm nợ ở vết no bị bỏ');
}
{
  const P = withPlant('promise', 'loi_hua_thu');
  applyEffect(P, { memory: { npc: [...P.lw.cast.keys()][0], tag: 'KEPT_PROMISE', weight: 0.1 } });
  assert(!P.lw.plants.some(p => p.key === 'loi_hua_thu'), 'giữ lời trong mùa: mầm lời hứa ở vết no bị bỏ');
}
{
  // Chung kết có repay: mầm được bỏ trước khi mùa kết (vết của mùa còn đọc được tới lúc đó)
  const P = withPlant('debt', 'no_chung_ket');
  const d = Argon.SEASONS.find(s => s.id === 'vu_an_gia_toc'), land = d.landings.find(l => /repay/.test((l.effects && l.effects.custom) || ''));
  assert(land, 'vu_an_gia_toc có chung kết trả nợ');
  applyEffect(P, land.effects || {});
  assert(!P.lw.season, 'chung kết kết mùa');
  assert(!P.lw.plants.some(p => p.key === 'no_chung_ket'), 'chung kết repay: mầm nợ bị bỏ');
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
