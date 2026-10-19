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
  // Landing có repay:<x> (khép chuyện cũ): host trả min(nợ, x năm thu nhập) vào nợ, nên savings tăng thêm đúng phần đó.
  const debtOf = () => P.ar.state.capitals.capitalAssets.debt, debt0 = debtOf();
  const repayX = +((L_BAN.effects.custom || '').split('|').find(p => p.startsWith('repay:')) || 'repay:0').slice(6);
  applyEffect(P, L_BAN.effects);
  assert.strictEqual(P.lw.season, null, 'season ended');
  const last = P.lw.canon.seasons[P.lw.canon.seasons.length - 1];
  assert.strictEqual(last.reason, 'landing'); assert.strictEqual(last.landing, 'ban_y_tuong', 'landing id recorded');
  assert(near(P.income, base, 0.01), 'income multiplier removed');
  const repaid = debt0 - debtOf();
  assert(near(repaid, Math.min(debt0, yearlyBase * repayX), 0.02), 'landing repay computed on base income: ' + repaid);
  assert(near(P.savings - sv0, yearlyBase * L_BAN.effects.money + repaid, 0.02), 'landing money computed on base income');
}

// 3. Người phụ thuộc (trọng tâm 3): 12 tuổi vào lam_lai / xu_nguoi / tron_chay.
for (const id of ['lam_lai', 'xu_nguoi', 'tron_chay']) {
  const P = grow(5501, 12, P => !!P.ar && P.ar.started);
  assert.strictEqual(factContext(P).independent, false, id + ': dependent at 12');
  const hh0 = P.ar.hh, job0 = P.job, mig0 = P.migrated, city0 = P.lw.sflags.has('path_city'), c0 = P.c.id;
  enterSeason(P, id);
  assert.strictEqual(P.ar.hh, hh0, id + ': family fund unchanged');
  assert.strictEqual(P.job, job0, id + ': job unchanged');
  assert.strictEqual(P.migrated, mig0, id + ': no migration'); assert.strictEqual(P.c.id, c0, id + ': same country');
  assert.strictEqual(P.lw.sflags.has('path_city'), city0, id + ': no move_city');
  // Landing có tiền/repay: không đụng quỹ chung.
  const land = def(id).landings.find(l => l.effects.money || /repay/.test(l.effects.custom || ''));
  assert(land, id + ': has a landing with money or repay');
  { const hh1 = P.ar.hh, mig1 = P.migrated; applyEffect(P, land.effects); settleDependent(P); assert(P.ar.hh >= hh1 - 1e-6, id + ': landing does not drain family fund'); assert.strictEqual(P.migrated, mig1, id + ': no migration at landing'); assert.strictEqual(P.lw.season, null, id + ': landed'); }
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

// 8. I1: hệ số thu nhập của mùa sống suốt mùa, kể cả khi thu nhập đặt lại giữa mùa (mất việc → việc mới, di cư).
function takeCareer(P) { if (P.pending && P.pending.id === 'career') { const p = P.pending; P.pending = null; p.choices[p.def].fx(P); } }
{ const pred = P => P.income > 0 && P.job && !P.retired && P.lw.season === null && !P.migrated;
  const A = grow(4401, 34, pred), B = grow(4401, 34, pred);
  assert.strictEqual(A.seed, B.seed); assert(near(A.income, B.income, 1e-9), 'twins');
  enterSeason(A, 'ngoi_sao'); const m = A.lw.season.mult; assert.strictEqual(m, def('ngoi_sao').rules.income, 'mult = rules.income'); assert(m !== 1, 'ngoi_sao has an income factor');
  for (const P of [A, B]) { customEffect(P, 'job_lose'); customEffect(P, 'job_new'); takeCareer(P); }
  assert(B.income > 0 && A.job === B.job, 'same new job');
  assert(near(A.income, B.income * m, 0.01), 'job taken mid-season carries the season factor: ' + A.income + ' vs ' + B.income + ' x ' + m);
  exitSeason(A, 'cut'); assert(near(A.income, B.income, 0.01), 'exit restores the post-job base: ' + A.income + ' vs ' + B.income); }
{ const pred = P => P.income > 0 && P.job && !P.retired && P.lw.season === null && !P.migrated && P.c.g < 15000;
  const dest = COUNTRIES.filter(d => d.g > 40000)[0]; let done = false;
  for (let s = 0; s < 40 && !done; s++) {
    const A = grow(6600 + s * 17, 30, pred), B = grow(6600 + s * 17, 30, pred);
    enterSeason(A, 'ngoi_sao'); const m = A.lw.season.mult;
    for (const P of [A, B]) { resolveCore(P, { id: 'migrate', data: dest.id }, 0, P.r, P.c); takeCareer(P); }
    if (!A.migrated || !B.migrated || !(B.income > 0)) continue; done = true;
    assert(near(A.income, B.income * m, 0.01), 'job after migrating mid-season carries the factor');
    exitSeason(A, 'cut'); assert(near(A.income, B.income, 0.01), 'exit after migrating restores base: ' + A.income + ' vs ' + B.income); }
  assert(done, 'found a life that migrates'); }
{ // Chưa có thu nhập lúc vào mùa thì hệ số vẫn được nhớ (không ép 1).
  const P = grow(5501, 12, P => !!P.ar && P.ar.started); enterSeason(P, 'ngoi_sao');
  assert.strictEqual(P.lw.season.mult, def('ngoi_sao').rules.income, 'mult kept even when income is 0 at entry'); }

// 9. I2: bạn đời cưới bằng marry:<tên> mất thì bạn góa, −15 hạnh phúc, đúng một dòng tin.
{ const roles = ['childhood_friend', 'neighbor', 'partner', 'rival'];
  const P = grow(8801, 26, P => !P.married && [...P.lw.cast.values()].some(m => m.alive && roles.includes(m.role)));
  const fr = [...P.lw.cast.values()].find(m => m.alive && roles.includes(m.role));
  customEffect(P, 'marry:' + fr.name); assert.strictEqual(fr.role, 'spouse', 'primary role is spouse');
  const happy = [], orig = addSt; addSt = function (L, k, v) { if (L === P && k === 'happy') happy.push(v); return orig(L, k, v); };
  fr.health = -1e9; const age0 = P.age; try { stepYear(P); } finally { addSt = orig; }
  assert(P.alive && P.age === age0 + 1, 'player survives the year');
  assert(!fr.alive, 'spouse died'); assert(!P.married && P.widowed, 'widowed');
  assert(happy.includes(-15), 'spouse death costs 15 happiness: ' + happy.join(','));
  assert.strictEqual(P.log.filter(e => e.text.includes(fr.name) && /qua đời/.test(e.text)).length, 1, 'one death line'); }

// 10. M2: marry:<tên> không bao giờ cưới người trong nhà; trùng tên thì ưu tiên người của mùa.
{ const P = grow(8811, 27, P => !P.married && !!castRole(P, 'mother') && P.income > 0);
  const mom = castRole(P, 'mother'); customEffect(P, 'marry:' + mom.name);
  assert(!mom.roles.includes('spouse') && mom.role === 'mother', 'never marries a parent');
  const Q = grow(8811, 27, P => !P.married && !!castRole(P, 'mother') && P.income > 0);
  const other = [...Q.lw.cast.values()].find(m => m.alive && ['neighbor', 'partner', 'rival', 'childhood_friend'].includes(m.role));
  enterSeason(Q, 'lam_lai'); const sid = Object.values(Q.lw.season.cast)[0]; const sm = Q.lw.cast.get(sid); sm.name = other.name;
  customEffect(Q, 'marry:' + other.name); assert(sm.roles.includes('spouse') && !other.roles.includes('spouse'), 'season member preferred'); }

// 11. M3: người mới của mùa có vai theo mùa: không là người phụ thuộc, không chiếm vai chuẩn trong ctx.cast.
{ const kid = [...Argon.SEASONS, ...Argon.WEIRD.map(b => b.season)].find(d => (d.reset.cast || []).some(c => c.role === 'child'));
  assert(kid, 'a season adds a child');
  const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null);
  enterSeason(P, kid.id); const ids = Object.values(P.lw.season.cast);
  for (const id of ids) { const m = P.lw.cast.get(id); assert.strictEqual(m.role, 'season'); assert.strictEqual(m.dependent, false, 'not dependent'); }
  const ctx = factContext(P); for (const r of ['mother', 'father', 'sibling', 'childhood_friend', 'bully', 'neighbor', 'first_boss', 'official', 'partner', 'creditor', 'mentor', 'rival', 'spouse', 'child']) assert(!ids.includes(ctx.cast[r]), 'season npc does not fill ctx.cast.' + r);
  assert(!Argon.dependentCosts(P.lw.cast, P.age + 5, false).some(d => ids.includes(d.id)), 'no dependent cost'); }

// 12. rules.yearly đúng một lần mỗi năm trong mùa.
{ const d = Argon.WEIRD.map(b => b.season).find(s => s.rules.yearly && !s.reset.effects && !/custom/.test(JSON.stringify(s.rules.yearly)));
  assert(d, 'a season with a plain yearly rule');
  const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null);
  enterSeason(P, d.id); let calls = 0, years = 0; const orig = canonApplyQuiet;
  canonApplyQuiet = function (L, e) { if (L === P && e === d.rules.yearly) calls++; return orig(L, e); };
  try { seasonYearly(P); assert.strictEqual(calls, 0, 'not in the entry year');
    for (let k = 0; k < 6 && P.alive; k++) { const on = P.lw.season && P.lw.season.id === d.id; while (P.pending) resolve(P, autoChoice(P)); stepYear(P); if (on && P.alive) years++; seasonYearly(P); }
  } finally { canonApplyQuiet = orig; }
  assert(years > 0, 'season ran'); assert.strictEqual(calls, years, 'once per season year: ' + calls + ' vs ' + years); }

// 13. R9: cùng nhịp thì thẻ khai báo trước ra trước.
{ const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null && !P.lw.history.some(h => h.id.startsWith('ss_lam_lai_'))); enterSeason(P, 'lam_lai');   // chưa từng chơi lam_lai (thẻ đã ra thì không ra lại)
  const ctx = factContext(P), all = seasonCards('lam_lai');
  const want = all.filter(s => s.id.startsWith('ss_lam_lai_0_') && s.prerequisites(ctx)).map(s => s.id);
  const got = []; for (let k = 0; k < 10; k++) { const st = nextSeasonCard(P); if (!st || !st.id.startsWith('ss_lam_lai_0_')) break; got.push(st.id); P.lw.history.push({ id: st.id, age: P.age }); }
  assert(want.length >= 2, 'beat 0 has ≥ 2 cards'); assert.deepStrictEqual(got, want, 'declaration order: ' + got.join(','));
  assert.strictEqual(P.lw.counters.season_beat, 1, 'beat advances when the beat runs out'); assert(P.lw.counters.season_next > P.age, 'next beat waits beatGap'); }

// 14. R1: vai nội bộ (season, ex_spouse, spouse…) không lộ ra chữ người chơi đọc (đám tang, người nhớ, gói AI, bảng dàn nhân vật).
{ const RAW = /\\b(mother|father|sibling|childhood_friend|bully|neighbor|first_boss|official|partner|creditor|mentor|rival|spouse|child|season|ex_spouse|undefined)\\b/;   // \\\\b: đang ở trong template literal
  let checked = 0, seasonRows = 0;
  for (let i = 0; i < 12; i++) { const P = lives[i]; const sms = [...P.lw.cast.values()].filter(m => m.role === 'season');
    for (const m of sms) assert.strictEqual(roleVN(m), m.label, 'season npc shows its label');
    const live = sms.find(m => m.alive && !m.absent);
    if (live) Argon.addMemory(P.lw.mem, live.id, 'HELPED_IN_CRISIS', P.age, 0.9, 'bạn giúp lúc khó');
    const f = funeralOf(P), rows = f.came.concat(f.away); seasonRows += rows.filter(r => sms.some(m => m.id === r.id)).length;
    const text = rows.map(r => funeralLine(r, true)).join(' ') + ' ' + rememberedLine(rememberedBy(P)) + ' ' + JSON.stringify(actPacket(P, 'x').nguoi_than || []).replace(/"(id|ten|vai|tuoi|tin)":/g, '').replace(/"cast_[a-z_0-9]+"/g, '');
    assert(!RAW.test(text), 'raw role id leaked: ' + (text.match(RAW) || [])[0] + ' in ' + text.slice(0, 300)); checked++; }
  assert(checked > 0 && seasonRows > 0, 'a season npc appears at a funeral (' + seasonRows + ')'); }

// 15. Người cũ (spouse_leave) mất sau khi bạn đã tái hôn: không góa, không −15, nhãn "người cũ".
{ const P = grow(9101, 27, P => !P.married && P.income > 0);
  customEffect(P, 'marry'); const ex = castRole(P, 'spouse'); assert(ex && P.married, 'first marriage');
  customEffect(P, 'spouse_leave'); assert.strictEqual(ex.role, 'ex_spouse'); assert(!ex.roles.includes('spouse') && !P.married, 'divorced');
  customEffect(P, 'marry'); const sp2 = castRole(P, 'spouse'); assert(sp2 && sp2 !== ex && P.married, 'remarried');
  const happy = [], orig = addSt; addSt = function (L, k, v) { if (L === P && k === 'happy') happy.push(v); return orig(L, k, v); };
  ex.health = -1e9; try { stepYear(P); } finally { addSt = orig; }
  assert(P.alive && !ex.alive, 'ex died'); assert(sp2.alive, 'new spouse alive');
  assert(P.married && !P.widowed, 'still married, not widowed'); assert(!happy.includes(-15), 'no spouse-death penalty: ' + happy.join(','));
  assert(P.log.some(e => e.text.includes(ex.name + ' (người cũ) qua đời')), 'ex labelled người cũ'); }

// 7. Tua lại: history và tiền khớp trên 30 đời.
let mism = 0;
for (let i = 0; i < 30; i++) { const P = lives[i]; G.life = P; const R = replayLife(P.seed, P.choices, null, P.actLog || []);
  const a = JSON.stringify(P.lw.history), b = JSON.stringify(R.lw.history);
  if (a !== b || Math.round(R.savings) !== Math.round(P.savings)) { mism++; if (mism < 3) console.log('replay mismatch seed', P.seed, a.length, b.length); } }
assert.strictEqual(mism, 0, 'replay matches history and savings on 30 lives');
// Task 20: vào mùa có reset.cash thì phần tiền riêng vượt mức đặt lại chỉ mất một nửa (Argon.resetCashDelta); nợ không đổi.
{ const P = grow(4409, 34, P => canonIndependent(P) && P.lw.season === null && P.income > 0);
  const target = def('lam_lai').reset.cash * Math.max(300, householdIncome(P));
  P.savings = target + 10 * Math.max(300, householdIncome(P)); const own0 = moneyFacts(P).own_cash, debt0 = factContext(P).debt;
  enterSeason(P, 'lam_lai');
  const own1 = moneyFacts(P).own_cash;
  assert(own0 > target && near(own1, target + (own0 - target) * Argon.RESET_CASH_KEEP, 0.01), 'reset.cash keeps half the excess: ' + own0 + ' -> ' + own1);
  assert(near(factContext(P).debt, debt0, 0.001), 'reset.cash leaves debt alone'); }
// Task 20: đang trong mùa thì canon event mới chờ chung kết (không cắt mùa), trừ lần ép nổ ở FORCE_SECOND_AT.
{ const P = grow(5501, 40, P => P.lw.season === null && P.lw.canon.n >= 1);
  enterSeason(P, 'ngoi_sao'); for (const k in P.lw.pressure) P.lw.pressure[k] = 30; P.lw.canon.last = P.age - 20;
  assert.strictEqual(Argon.dueAxis(factContext(P)), null, 'no canon event while a season runs');
  exitSeason(P, 'landing', null);
  assert(Argon.dueAxis(factContext(P)) !== null, 'canon event fires once the season has landed'); }
console.log('PASS canon-test');
`);
