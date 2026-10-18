// Task 7: canon event và Mùa ở phía host (vòng năm, vào/ra mùa). Run: node doi-nguoi/tests/canon-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge, pred) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && !P.pending && (!pred || pred(P))) return P; } throw new Error('no life'); }
const def = id => Argon.SEASONS.find(s => s.id === id) || Argon.WEIRD.map(b => b.season).find(s => s.id === id);
const near = (a, b, tol) => Math.abs(a - b) <= Math.abs(b) * tol + 1e-9;

// 0. Bề mặt: các hàm host có mặt, RNG_SUB.canon = 9.
assert.strictEqual(RNG_SUB.canon, 9, 'RNG_SUB.canon = 9');
for (const f of ['canonInit', 'canonFacts', 'canonOnEffect', 'canonYear', 'canonScene', 'enterSeason', 'exitSeason', 'seasonKit']) assert.strictEqual(typeof eval(f), 'function', f + ' exists');

// 1. Tự chơi 120 đời: số canon event, khoảng cách, ngân sách quyết định.
const lives = [], dec = [], ns = [];
let reach60 = 0, two60 = 0, over4 = 0, badGap = 0, seasonsEntered = 0, landed = 0, cut = 0, weirdLives = 0, canonTotal = 0;
for (let i = 0; i < 120; i++) {
  const P = createLife(i * 31 + 11, { auto: true }); G.life = P; let g = 0; while (P.alive && g++ < 130) stepYear(P);
  lives.push(P); dec.push(P.choices.length);
  const cn = P.lw.canon; assert(cn, 'lw.canon exists'); ns.push(cn.n);
  const ages = P.lw.history.filter(h => /^canon_/.test(h.id)).map(h => h.age);
  canonTotal += ages.length;
  assert.strictEqual(ages.length, cn.n, 'one history entry per canon event (life ' + i + ')');
  for (let k = 1; k < ages.length; k++) if (ages[k] - ages[k - 1] < 8) badGap++;
  if (cn.n > 4) over4++;
  if (P.age >= 60) { reach60++; if (cn.n >= 2) two60++; }
  seasonsEntered += cn.seasons.length + (P.lw.season ? 1 : 0);
  landed += cn.seasons.filter(s => s.reason === 'landing').length; cut += cn.seasons.filter(s => s.reason === 'cut').length;
  if ([...P.lw.sflags].some(f => /^weird_/.test(f))) weirdLives++;
}
dec.sort((a, b) => a - b);
const p50 = dec[dec.length >> 1];
console.log({ lives: lives.length, reach60, two60, over4, badGap, canonPerLife: +(canonTotal / lives.length).toFixed(2), seasonsEntered, landed, cut, weirdLives, decisions_p10: dec[12], decisions_p50: p50, decisions_p90: dec[108] });
assert(reach60 > 0, 'some lives reach 60');
assert.strictEqual(two60, reach60, 'every life reaching 60 has ≥ 2 canon events (' + two60 + '/' + reach60 + ')');
assert.strictEqual(over4, 0, 'no life has > 4 canon events');
assert.strictEqual(badGap, 0, 'canon events ≥ 8 years apart');
assert(landed > 0, 'some seasons reach a finale landing');
assert(p50 >= 120 && p50 <= 130, 'decisions p50 ' + p50 + ' in 120–130');

// 2. Cắt mùa (trọng tâm 2): thu nhập sau = thu nhập gốc × hệ số của mùa mới.
{ const P = grow(3301, 32, P => P.income > 0 && canonFacts(P).season === null && !P.retired);
  const inc0 = P.income;
  enterSeason(P, 'ngoi_sao');
  assert.strictEqual(P.lw.season.id, 'ngoi_sao', 'in ngoi_sao');
  assert(P.lw.sflags.has(Argon.playedFlag('ngoi_sao')), 'played flag set on enter (R7)');
  for (const f of def('ngoi_sao').rules.flags || []) assert(P.lw.sflags.has(f), 'season flag ' + f);
  enterSeason(P, 'lam_lai');
  const old = P.lw.canon.seasons.find(s => s.id === 'ngoi_sao');
  assert(old && old.reason === 'cut', 'old season cut');
  for (const f of def('ngoi_sao').rules.flags || []) assert(!P.lw.sflags.has(f), 'old season flag removed ' + f);
  assert.strictEqual(P.lw.season.id, 'lam_lai', 'now lam_lai');
  assert(near(P.income, inc0 * (def('lam_lai').rules.income ?? 1), 0.01), 'income ' + P.income + ' ≈ ' + inc0 + ' × ' + def('lam_lai').rules.income);
  assert.strictEqual(P.lw.counters.season_beat, 0, 'beat reset'); assert.strictEqual(P.lw.counters.season_next, P.age, 'season_next = age');
  const len = P.lw.season.end - P.lw.season.from; assert(len >= 5 && len <= 20, 'season length ' + len);
  // Người mới của mùa có tên, là NPC thật, kit đọc được.
  const k = seasonKit(P);
  for (const m of def('lam_lai').reset.cast) { const id = P.lw.season.cast[m.key]; assert(id && P.lw.cast.has(id), 'new cast ' + m.key); assert.strictEqual(k.npc(m.key), P.lw.cast.get(id).name, 'kit names ' + m.key); }
  // Chung kết: gỡ hệ số trước rồi mới áp landing.
  const base = P.income / (def('lam_lai').rules.income ?? 1);
  const L_BAN = def('lam_lai').landings.find(l => l.id === 'ban_y_tuong');
  const sv0 = P.savings; const yearlyBase = Math.max(300, base);
  applyEffect(P, L_BAN.effects);
  assert.strictEqual(P.lw.season, null, 'season ended');
  const last = P.lw.canon.seasons[P.lw.canon.seasons.length - 1];
  assert.strictEqual(last.reason, 'landing'); assert.strictEqual(last.landing, 'ban_y_tuong', 'landing id recorded');
  assert(near(P.income, base, 0.01), 'income multiplier removed');
  assert(near(P.savings - sv0, yearlyBase * L_BAN.effects.money, 0.02), 'landing money computed on base income');
}

// 3. Người phụ thuộc (trọng tâm 3): 12 tuổi vào lam_lai / xu_nguoi / tron_chay.
for (const id of ['lam_lai', 'xu_nguoi', 'tron_chay']) {
  const P = grow(5501, 12, P => !!P.ar && P.ar.started);
  assert(!canonFacts(P) || !factContext(P).independent, 'dependent');
  const hh0 = P.ar.hh, job0 = P.job, mig0 = P.migrated, city0 = P.lw.sflags.has('path_city'), c0 = P.c.id;
  enterSeason(P, id);
  assert.strictEqual(P.ar.hh, hh0, id + ': family fund unchanged');
  assert.strictEqual(P.job, job0, id + ': job unchanged');
  assert.strictEqual(P.migrated, mig0, id + ': no migration'); assert.strictEqual(P.c.id, c0, id + ': same country');
  assert.strictEqual(P.lw.sflags.has('path_city'), city0, id + ': no move_city');
  // Landing có tiền/repay: không đụng quỹ chung.
  const land = def(id).landings.find(l => l.effects.money || /repay/.test(l.effects.custom || ''));
  if (land) { const hh1 = P.ar.hh, mig1 = P.migrated; applyEffect(P, land.effects); settleDependent(P); assert(P.ar.hh >= hh1 - 1e-6, id + ': landing does not drain family fund'); assert.strictEqual(P.migrated, mig1, id + ': no migration at landing'); assert.strictEqual(P.lw.season, null, id + ': landed'); }
}

// 4. become:<p> ngoài khoảng tuổi chỉ để lại cờ tập tành (R15 mở rộng).
{ const P = grow(7707, 12); const job0 = P.job;
  customEffect(P, 'become:journalist');
  assert.strictEqual(P.job, job0, 'no career switch at 12'); assert(P.lw.sflags.has('tp_practice_journalist'), 'practice flag');
  assert(!P.lw.sflags.has('life_journalist'), 'no life flag'); }

// 5. marry:<tên> dùng lại người đang có tên đó (R20).
{ const P = grow(8801, 26, P => !P.married && [...P.lw.cast.values()].some(m => m.alive && ['childhood_friend', 'neighbor', 'partner', 'rival'].includes(m.role))); const fr = [...P.lw.cast.values()].find(m => m.alive && ['childhood_friend', 'neighbor', 'partner', 'rival'].includes(m.role));
  const n0 = P.lw.cast.size;
  customEffect(P, 'marry:' + fr.name);
  assert(P.married, 'married'); assert.strictEqual(P.lw.cast.size, n0, 'no new cast member');
  assert(fr.roles.includes('spouse'), 'existing member is spouse'); assert.strictEqual(castRole(P, 'spouse').id, fr.id, 'spouse role resolves');
  assert(Argon.isDurable({ custom: 'marry:Ai đó' }), 'isDurable accepts marry:<name>'); }

// 6. Custom của Task 8 là no-op vô hại; canon:<trục> xả áp lực.
{ const P = grow(9901, 30);
  for (const c of ['swap_other', 'remark', 'age_skip:3', 'longevity:20']) customEffect(P, c);
  P.lw.pressure.tien = 11; const n0 = P.lw.canon.n;
  customEffect(P, 'canon:tien');
  assert.strictEqual(P.lw.pressure.tien, 11 - Argon.DISCHARGE, 'discharge'); assert.strictEqual(P.lw.canon.n, n0 + 1); assert.strictEqual(P.lw.canon.last, P.age);
  P.lw.pressure.luat = 3; customEffect(P, 'canon:luat'); assert.strictEqual(P.lw.pressure.luat, 0, 'not below 0');
  const fc = canonFacts(P); for (const k of ['pressure', 'plants', 'season', 'season_beat', 'canon_n', 'last_canon_age', 'weird']) assert(k in fc, 'fact ' + k);
  assert.strictEqual(typeof factContext(P).can_migrate, 'boolean', 'can_migrate fact');
  // Vật gài: effect.plant → sổ vật gài + cờ.
  applyEffect(P, { plant: { kind: 'object', key: 'dong_ho', label: 'chiếc đồng hồ của ông' } });
  assert(P.lw.plants.some(p => p.key === 'dong_ho' && p.age === P.age && p.weight === 1), 'plant recorded');
  assert(P.lw.sflags.has(Argon.plantFlag({ kind: 'object', key: 'dong_ho' })), 'plant flag'); }

// 7. Tua lại: history và tiền khớp trên 30 đời.
let mism = 0;
for (let i = 0; i < 30; i++) { const P = lives[i]; G.life = P; const R = replayLife(P.seed, P.choices, null, P.actLog || []);
  const a = JSON.stringify(P.lw.history), b = JSON.stringify(R.lw.history);
  if (a !== b || Math.round(R.savings) !== Math.round(P.savings)) { mism++; if (mism < 3) console.log('replay mismatch seed', P.seed, a.length, b.length); } }
assert.strictEqual(mism, 0, 'replay matches history and savings on 30 lives');
console.log('PASS canon-test');
`);
