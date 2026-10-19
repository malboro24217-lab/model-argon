// Task 7 + 8b: canon event và Mùa ở phía host (vòng năm, vào/ra mùa, Độ điên, bản kia, chữ AI, custom của host). Run: node doi-nguoi/tests/canon-test.js
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
{ const P = grow(3301, 32, P => P.income > 0 && canonFacts(P).season === null && !P.retired && !['ngoi_sao', 'lam_lai'].some(id => P.lw.sflags.has(Argon.playedFlag(id))));   // chưa chơi hai mùa này (bản ghép: đời đầu tiên khớp đã đáp ngoi_sao, find() trúng mùa cũ)
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
// ===== Task 8b: Độ điên, bản kia của bạn, chữ AI, swap_other / remark / age_skip / longevity, id viết hoa =====
async function t8b() {
  const played = Argon.playedFlag, t1 = Date.now();
  const runToDeath = P => { let g = 0; while (P.alive && g++ < 130) stepYear(P); return P; };
  const hist = P => JSON.stringify(P.lw.history);
  /** Cài một cảnh thử vào canonYear (đời thật, bản tua lại và bản kia cùng đi qua), trả về hàm gỡ. */
  const hook = fn => { const orig = canonYear; canonYear = L => fn(L) || orig(L); return () => { canonYear = orig; }; };
  const one = (id, L, title, eff, after) => { scene(L, { id, key: id + '@' + L.age, title, text: 'Cảnh thử của Task 8b.', choices: [{ label: 'Nhận', fx: L2 => { applyEffect(L2, eff); if (after) after(L2); } }], def: 0 }); return true; };
  const canonAges = P => P.lw.history.filter(h => /^canon_/.test(h.id)).map(h => h.age);
  function lifeWith(pred, from) { for (let k = 0; k < 300; k++) { const P = createLife((from || 1) + k * 37, { auto: true }); G.life = P; runToDeath(P); if (pred(P)) return P; } throw new Error('no life'); }

  // 8b.1 build.py nối canon-ui.js; setWeird là hàm toàn cục (ô Độ điên gọi window.setWeird).
  assert.strictEqual(typeof seasonBanner, 'function', 'canon-ui.js is in .head.js');
  assert.strictEqual(typeof setWeird, 'function', 'setWeird exists');

  // 8b.11b (21b) Tên trên 225 đời tự chơi của mục 8b.2: người mới của mùa, con, bạn đời không trùng tên gọi đang có chủ, ở mức chặt nhất
  // mà bể tên còn cho phép (bể 3–8 tên/giới; dàn nhân vật lúc sinh đã dùng gần hết); không bao giờ trùng tên gọi của bạn; không ai mang tên người thật.
  const NM = { season: 0, kids: 0, spouses: 0, clash: [], real: [], me: [], tier: [0, 0, 0] };
  const oSCM = seasonCastMember, oBorn = bornChild, oSp = spouseName;
  const judge = (L, T, g, what) => { const nm = NAMES[L.c.nm], pool = nm.M.includes(g) ? nm.M : nm.F.includes(g) ? nm.F : null; if (!pool) return;
    const k = T.findIndex(t => pool.some(x => !t.has(x))); if (k >= 0) { NM.tier[k]++; if (T[k].has(g)) NM.clash.push(what + ' ' + g); }
    if (T[2].has(g) && pool.some(x => !T[2].has(x))) NM.me.push(what + ' ' + g); };
  seasonCastMember = function (L, nc, r, ar) { const T = nameTiers(L), m = oSCM(L, nc, r, ar); NM.season++; judge(L, T, givenOf(m.name, L.c), 'season'); return m; };
  bornChild = function (L) { const T = nameTiers(L), n0 = L.kids.length; const out = oBorn(L); const k = L.kids[n0]; if (k) { NM.kids++; judge(L, T, k.name, 'child'); } return out; };
  spouseName = function (r, c, sex, L) { const T = L && L.lw ? nameTiers(L) : null, n = oSp(r, c, sex, L); if (T) { NM.spouses++; judge(L, T, n, 'spouse'); } return n; };
  const nameCheck = P => { for (const m of P.lw.cast.values()) if (nameBlocked(m.name)) NM.real.push(m.name); if (nameBlocked(P.name)) NM.real.push(P.name); };
  // 8b.2 Độ điên = 0 từ tuổi 20 (trọng tâm 5): 200 đời, pressure.ky ép = 30 mỗi năm → không còn cửa kỳ dị nào.
  { const origScene = canonScene, W = { canon: 0, weird: 0 }, C = { canon: 0, weird: 0 }; let lives = 0;
    canonScene = function (L, ev) { const w = L.t8bWatch; if (w) { w.canon++; if (ev.doors.some(d => d.weird || (seasonDef(d.season) || {}).weird)) w.weird++; } return origScene(L, ev); };
    try {
      for (let i = 0; i < 230 && lives < 200; i++) {
        const P = createLife(50001 + i * 13, { auto: true }); G.life = P; let g = 0;
        while (P.alive && P.age < 20 && g++ < 130) stepYear(P);
        if (!P.alive) continue;
        while (P.pending) resolve(P, autoChoice(P));
        assert.strictEqual(setWeird(P, 0), true, 'setWeird ok'); assert.strictEqual(P.weird, 0);
        const op = P.actLog[P.actLog.length - 1]; assert.deepStrictEqual([op.kind, op.age, op.op.k, op.op.v], ['ui', 20, 'weird', 0], 'uiOp recorded');
        P.t8bWatch = W;
        while (P.alive && g++ < 130) { P.lw.pressure.ky = 30; stepYear(P); }
        nameCheck(P); lives++;
      }
      // Đối chứng: Độ điên 1, cùng ép ky = 30 từ tuổi 20 → có cửa kỳ dị.
      for (let i = 0; i < 25; i++) { const P = createLife(50001 + i * 13, { auto: true }); G.life = P; let g = 0;
        while (P.alive && g++ < 130) { if (P.age >= 20) { P.t8bWatch = C; P.lw.pressure.ky = 30; } stepYear(P); } nameCheck(P); }
    } finally { canonScene = origScene; }
    console.log({ weird0_lives: lives, canon_after_20: W.canon, weird_doors_after_20: W.weird, control_canon: C.canon, control_weird_doors: C.weird });
    assert.strictEqual(lives, 200, '200 lives');
    assert(W.canon > 100, 'canon events still happen (' + W.canon + ')');
    assert.strictEqual(W.weird, 0, 'no weird door after setWeird(0)');
    assert(C.weird > 0, 'control: weird doors appear at Độ điên 1'); }
  seasonCastMember = oSCM; bornChild = oBorn; spouseName = oSp;
  console.log({ names_season: NM.season, names_kids: NM.kids, names_spouses: NM.spouses, tier_all_cast: NM.tier[0], tier_family: NM.tier[1], tier_player: NM.tier[2], clashes: NM.clash.length, real: NM.real.length });
  assert(NM.season > 200 && NM.kids > 50, 'names checked on many new people');
  assert.deepStrictEqual(NM.clash.slice(0, 5), [], 'no given-name clash at the strictest tier the pool allows');
  assert.deepStrictEqual(NM.me, [], 'never the player given name'); assert.deepStrictEqual(NM.real, [], 'no famous real names');

  // 8b.2b Đổi Độ điên giữa đời (2 lúc 25, 0 lúc 40) → replayLife khớp history và tiền; bỏ thao tác thì đời khác đi.
  { let differs = 0;
    for (let i = 0; i < 6; i++) {
      const P = createLife(7001 + i * 29, { auto: true }); G.life = P; let g = 0;
      while (P.alive && g++ < 130) { stepYear(P); if (P.age === 25 && !P.pending) setWeird(P, 2); if (P.age === 40 && !P.pending) setWeird(P, 0); }
      assert(setWeird(P, 1) === false, 'dead life: no setWeird');
      const R = replayLife(P.seed, P.choices, null, P.actLog);
      assert.strictEqual(hist(R), hist(P), 'replay history matches after mid-life Độ điên changes (seed ' + P.seed + ')');
      assert.strictEqual(Math.round(R.savings), Math.round(P.savings), 'replay savings');
      assert.strictEqual(R.weird, P.weird, 'replay ends on the same level');
      const Q = replayLife(P.seed, P.choices, null, P.actLog.filter(a => !(a.kind === 'ui' && a.op.k === 'weird')));
      if (hist(Q) !== hist(P)) differs++;
    }
    assert(differs > 0, 'the recorded level matters for at least one life');
    // Độ điên chọn ngay lúc chào đời (tuổi 0, trước năm đầu): bản tua lại cũng phải áp (review B1).
    let d0 = 0;
    for (let i = 0; i < 8; i++) { const P = createLife(7301 + i * 31, { auto: true }); G.life = P; assert(setWeird(P, i % 2 ? 0 : 2), 'setWeird at 0'); runToDeath(P);
      const R = replayLife(P.seed, P.choices, null, P.actLog);
      assert.strictEqual(hist(R), hist(P), 'age-0 Độ điên replays (seed ' + P.seed + ')'); assert.strictEqual(R.weird, P.weird, 'replayed level');
      if (hist(replayLife(P.seed, P.choices, null, P.actLog.filter(a => a.kind !== 'ui'))) !== hist(P)) d0++; }
    assert(d0 > 0, 'age-0 level matters'); }

  // 8b.3 Bản kia của bạn: dòng lúc vào mùa (log tone "other"), dòng lúc hết mùa (replayLife, G.life giữ nguyên).
  { const P = lifeWith(P => P.log.some(e => e.tone === 'other'), 11);
    const e = P.log.find(e => e.tone === 'other'); assert(/^Ở dòng thời gian kia, bạn vừa bước vào Mùa: \\S/.test(e.text), 'enter line: ' + e.text);
    assert(!/undefined|\\{/.test(e.text));
    // otherSelfLine trên canon event thật
    const ev = { doors: [{ season: 'ngoi_sao' }, { season: 'lam_lai' }, { season: 'w_S19' }] };
    assert.strictEqual(otherSelfLine(P, ev, 0), 'Ở dòng thời gian kia, bạn vừa bước vào Mùa: ' + seasonDef('lam_lai').vn + '.');
    assert.strictEqual(otherSelfLine(P, ev, 2), 'Ở dòng thời gian kia, bạn vừa bước vào Mùa: ' + seasonDef('ngoi_sao').vn + '.', 'wraps around');
    // otherSelfEnd: đời đang sống, đang ở mùa mở từ canon event.
    let L = null;
    for (let k = 0; k < 200 && !L; k++) { const Q = createLife(900 + k * 41, { auto: true }); G.life = Q; let g = 0;
      while (Q.alive && g++ < 130) { stepYear(Q); if (Q.lw.season && Q.lw.season.other && Q.age >= Q.lw.season.from + 3 && !Q.pending) { L = Q; break; } } }
    assert(L, 'a life inside a season opened by a canon door');
    const sentinel = { seed: -1, sentinel: true }; G.life = sentinel;
    const before = hist(L) + '|' + Math.round(L.savings) + '|' + L.choices.length;
    assert.strictEqual(otherSelfEnd(L), '', 'auto life → ""');
    L.auto = false; const line = otherSelfEnd(L);
    assert(/^Ở dòng thời gian kia, /.test(line) && !/undefined|NaN|\\{/.test(line), 'end line: ' + line);
    assert.strictEqual(G.life, sentinel, 'G.life restored');
    assert.strictEqual(hist(L) + '|' + Math.round(L.savings) + '|' + L.choices.length, before, 'otherSelfEnd does not change the life');
    L.replay = true; assert.strictEqual(otherSelfEnd(L), '', 'replay → ""'); L.replay = false;
    L.script = {}; assert.strictEqual(otherSelfEnd(L), '', 'script → ""'); L.script = null;
    // Ra mùa ở đời thật (không tự chơi) → nhật ký có dòng "Bản kia của bạn" lúc hết mùa.
    const n0 = L.log.filter(e => e.tone === 'other').length; exitSeason(L, 'cut');
    assert.strictEqual(L.log.filter(e => e.tone === 'other').length, n0 + 1, 'exit writes one other-self line');
    console.log('other self:', e.text, '|', line); G.life = L; }

  // 8b.4 Chữ AI của canon event: canonAiRewrite (NAR.sample giả) → effects giữ nguyên, actLog canon_text, bản tua lại hiện đúng title.
  { const fake = { title: 'Lá thư đến muộn hai mươi năm', text: 'Một phong bì cũ nằm trong hộp thư, tên bạn viết bằng nét chữ đã phai. Người gửi biết bạn rõ hơn bạn tưởng.', doors: ['Mở thư ngay', 'Đốt nó đi', 'Đi tìm người gửi'] };
    let P = null, sc = null;
    for (let k = 0; k < 120 && !P; k++) { const Q = createLife(3100 + k * 53, {}); G.life = Q; let g = 0;
      while (Q.alive && g++ < 2000) { if (Q.pending) { if (Q.pending.canon && Q.pending.choices.length === 3) { P = Q; sc = Q.pending; break; } resolve(Q, autoChoice(Q)); continue; }
        if (Q.storyDue) { Q.storyDue = null; continue; } stepYear(Q); } }
    assert(P, 'a non-auto life reaches a 3-door canon scene');
    const fx0 = sc.choices.map(c => c.fx), e0 = JSON.stringify(sc._choiceEffects), streamed = [];
    const was = { s: NAR.sample, en: NAR.enabled, st: NAR.status };
    NAR.sample = async (prompt, o) => { assert(prompt.includes(P.c.n) && prompt.includes('"tuoi":' + P.age), 'prompt has country and age'); const js = JSON.stringify(fake); o.onText({ text: js.slice(0, 60) }); streamed.push(1); o.onText({ text: js }); return { text: 'Đây: ' + js + ' xong.' }; };
    NAR.enabled = true; NAR.status = 'ready';
    const el = { textContent: sc.text }, dom = { querySelector: s => s === '#decTxt' ? el : null };
    let ok; try { ok = await canonAiRewrite(P, sc, dom); assert.strictEqual(await canonAiRewrite(P, sc, dom), false, 'runs once per scene'); } finally { NAR.sample = was.s; NAR.enabled = was.en; NAR.status = was.st; }
    assert.strictEqual(ok, true, 'rewrite applied'); assert(streamed.length, 'streamed');
    assert.strictEqual(sc.title, fake.title); assert.strictEqual(sc.text, fake.text); assert.deepStrictEqual(sc.choices.map(c => c.label), fake.doors);
    assert.strictEqual(el.textContent, fake.text, 'text streamed into the scene element');
    assert(sc.choices.every((c, i) => c.fx === fx0[i]) && JSON.stringify(sc._choiceEffects) === e0, 'effects unchanged');
    const rec = P.actLog.find(a => a.kind === 'canon_text'); assert(rec && rec.key === sc.key && rec.age === P.age && rec.raw.title === fake.title, 'actLog canon_text');
    // Không có sample / bản tua lại → không chạy.
    assert.strictEqual(await canonAiRewrite(P, { ...sc, canon: { ...sc.canon, ai: undefined } }, null), false, 'no NAR.sample → false');
    const key = sc.key; resolve(P, 1);
    { const F = resumeFrom(P, { key, index: 2 }); assert(F, 'fork at the rewritten canon scene');
      const fm = F.lw.cz.marks.find(m => m.key === key); assert(fm && fm.title === fake.title && fm.choice === fake.doors[2], 'fork keeps the AI text (canon_text at the fork age)'); G.life = P; }
    P.auto = true; autoChain(P); runToDeath(P);
    const R = replayLife(P.seed, P.choices, null, P.actLog);
    assert.strictEqual(hist(R), hist(P), 'replay with canon_text matches history');
    assert.strictEqual(Math.round(R.savings), Math.round(P.savings), 'replay savings');
    const mk = R.lw.cz.marks.find(m => m.key === key); assert(mk && mk.title === fake.title && mk.choice === fake.doors[1], 'replay shows the AI title and label');
    const R0 = replayLife(P.seed, P.choices, null, P.actLog.filter(a => a.kind !== 'canon_text'));
    assert.strictEqual(hist(R0), hist(P), 'text only: same history without canon_text'); assert.strictEqual(Math.round(R0.savings), Math.round(P.savings), 'text only: same savings');
    assert.notStrictEqual(R0.lw.cz.marks.find(m => m.key === key).title, fake.title, 'template title without canon_text');
    // canon_text giả, hỏng (thiếu nhãn) → bỏ qua, không lỗi.
    const bad = P.actLog.map(a => a.kind === 'canon_text' ? { ...a, raw: { title: 'X y z', text: 'quá ngắn' } } : a);
    assert.strictEqual(hist(replayLife(P.seed, P.choices, null, bad)), hist(P), 'bad canon_text ignored'); }

  // 8b.5 swap_other (S22): đời có ≥ 2 canon event; history trước canon event thứ nhất giữ nguyên, sống tiếp tới chết, tua lại khớp.
  { const S22 = seasonDef('w_S22'), DOI = S22.landings.find(l => l.id === 's22_doi_cho');
    assert(Argon.isDurable(DOI.effects), 'swap landing is durable');
    let base = null, T = 0, first = null;
    for (let k = 0; k < 300 && !base; k++) { const P = createLife(1201 + k * 17, { auto: true }); G.life = P; runToDeath(P); const ca = canonAges(P);
      if (ca.length >= 1 && ca[0] >= 20 && (ca.length === 1 || ca[1] > ca[0] + 10) && P.age >= ca[0] + 15) { base = P; first = ca[0]; T = ca[0] + 9; } }
    assert(base, 'a life whose first canon event leaves room for S22');
    const X = (base.lw.canon.seasons.find(s => s.from === first) || base.lw.season).id;
    let swapped = 0, captured = null, yearlyAt = 0, post = null, marksAtSwap = 0;
    const origSwap = swapOther; swapOther = function (L, ...a) { const r = origSwap(L, ...a); if (r && !L.replay) { captured = L.savings; yearlyAt = seasonYearlyBase(L); marksAtSwap = L.lw.cz.marks.length; swapped++; } return r; };
    // Canon event thứ hai (nhánh S22, một cửa) lúc T; chung kết "Đổi chỗ" lúc T + 1. Bản kia không có cờ của mùa X nên không gặp lại cảnh này.
    const s22ev = L => ({ id: 'canon_S22_' + L.age, seed: 'S22', axis: 'ky', age: L.age, slots: { fromPlayer: 0 }, title: 'Bản kia gõ cửa gương', text: 'Hình phản chiếu của bạn bước ra khỏi gương.', doors: [{ kind: 'ky', label: 'Bắt tay bản kia', hint: '', season: 'w_S22', weird: 'S22' }] });
    const fired = new WeakSet();
    const unhook = hook(L => L.seed !== base.seed || L.forkOf ? false
      : L.age >= T && !fired.has(L) && L.lw.canon.n === 1 ? (fired.add(L), scene(L, canonScene(L, s22ev(L))), true)
      : L.lw.season && L.lw.season.id === 'w_S22' && L.age > L.lw.season.from ? one('t8b_s22', L, 'Khe gương', DOI.effects, L2 => { if (!L2.replay) post = L2.savings; }) : false);
    try {
      const P = createLife(base.seed, { auto: true }); G.life = P; let g = 0;
      while (P.alive && !(P.lw.season && P.lw.season.id === 'w_S22' && P.age > P.lw.season.from) && g++ < 130) { stepYear(P); if (P.lw.season && P.lw.season.id === 'w_S22' && P.age === P.lw.season.from) break; }
            assert(P.alive && P.lw.season && P.lw.season.id === 'w_S22' && P.lw.canon.n === 2, 'in S22 after a second canon event');
      const firstIdx = P.lw.cz.marks.filter(m => /^canon_/.test(m.storylet))[0].choice_index;
      const pre = P.lw.history.filter(h => h.age < first).map(h => h.id).join(), atFirst = P.lw.history.filter(h => h.age === first)[0].id;
      stepYear(P);
      assert.strictEqual(swapped, 1, 'swapped once'); assert(P.lw.swap && P.lw.swap.fork === first, 'forked at the first canon event: ' + JSON.stringify(P.lw.swap));
      assert.strictEqual(P.lw.history.filter(h => h.age < first).map(h => h.id).join(), pre, 'history before the first canon event is unchanged');
      assert.strictEqual(P.lw.history.filter(h => h.age === first)[0].id, atFirst, 'the first canon event itself is the same');
      const mk = P.lw.cz.marks.find(m => m.key === P.lw.swap.key); assert(mk && mk.choice_index === P.lw.swap.index && mk.choice_index !== firstIdx, 'new life took the other door at the first canon event');
      assert(P.lw.canon.seasons.some(s => s.id === 'w_S22' && s.swapped && s.reason === 'landing'), 'S22 season kept in the season list');
      assert(P.log.some(e => e.text === 'Bạn đổi chỗ với bản kia.'), 'log line');
      { const ms = P.lw.cz.marks, fi = ms.findIndex(m => m.key === P.lw.swap.key), auto = ms.slice(fi + 1, marksAtSwap);   // chỉ dấu ấn có lúc đổi chỗ; lựa chọn thật sau đó trong cùng năm (bản ghép: ivn_apprentice@35) vẫn rẽ được
        assert(auto.length > 0 && auto.every(m => !m.alt_indices.length), 'marks of the auto-played years are not offered for forks (review I-4)'); }
      assert(Math.abs(post - (captured - yearlyAt)) < 1, 'money −1 applied to the new life after the swap: ' + post + ' vs ' + (captured - yearlyAt));
      runToDeath(P); assert(!P.alive && P.age > T, 'swapped life plays on to death (' + P.age + ')');
      const R = replayLife(P.seed, P.choices, null, P.actLog || []);
      assert.strictEqual(hist(R), hist(P), 'replay of the swapped life matches history');
      assert.strictEqual(Math.round(R.savings), Math.round(P.savings), 'replay savings');
      // Không có canon event trước mùa này: không đổi gì.
      const Q = createLife(base.seed, { auto: true }); G.life = Q; while (Q.alive && Q.age < first - 1) stepYear(Q);
      while (Q.pending) resolve(Q, autoChoice(Q));
      const qh = hist(Q), qs = Q.savings, yq = Math.max(300, householdIncome(Q)); enterSeason(Q, 'w_S22'); applyEffect(Q, DOI.effects);
      assert.strictEqual(Q.lw.swap, undefined, 'no earlier canon event → no swap'); assert.strictEqual(hist(Q), qh, 'history unchanged');
      assert(Q.lw.canon.seasons.some(s => s.id === 'w_S22' && s.reason === 'landing'), 'season still lands');
    } finally { unhook(); swapOther = origSwap; } }

  // 8b.6 remark: đổi choice của một dấu ấn cũ, chạy hiệu ứng của lựa chọn mới; tua lại khớp.
  { const P = createLife(4441, { auto: true }); G.life = P; while (P.alive && P.age < 40) stepYear(P);
    while (P.pending) resolve(P, autoChoice(P));
    const m = canonRemark(P); assert(m, 'a mark was rewritten');
    assert(m.remark && m.choice === m.altLabels[m.choice_index] && m.choice !== m.remark.from, 'choice changed: ' + m.remark.from + ' → ' + m.choice);
    assert.deepStrictEqual(m.alt_indices, [], 'rewritten mark leaves the counterfactual list');
    assert(P.log.some(e => e.text.startsWith('Ký ức năm ' + m.age + ' tuổi được viết lại')), 'log line');
    const m2 = canonRemark(P); assert(m2 && m2 !== m, 'next remark takes another mark');
    let T = 0; const unhook = hook(L => L.seed === 5551 && L.age === 38 && !L.lw.sflags.has('t8b_rm') && (L.lw.sflags.add('t8b_rm'), one('t8b_rm', L, 'Ông thợ đồng hồ', { custom: 'remark', money: -1 })));
    try { const Q = createLife(5551, { auto: true }); G.life = Q; runToDeath(Q);
      assert(Q.lw.cz.marks.some(x => x.remark), 'remark ran in the hooked life');
      const R = replayLife(Q.seed, Q.choices, null, Q.actLog || []);
      assert.strictEqual(hist(R), hist(Q), 'remark replay matches'); assert.strictEqual(Math.round(R.savings), Math.round(Q.savings));
      assert.deepStrictEqual(R.lw.cz.marks.filter(x => x.remark).map(x => x.key + '=' + x.choice), Q.lw.cz.marks.filter(x => x.remark).map(x => x.key + '=' + x.choice), 'same mark rewritten in replay');
    } finally { unhook(); } }

  // 8b.7 age_skip:<n> và longevity:<n>.
  { const P = createLife(6661, { auto: true }); G.life = P; while (P.alive && P.age < 30) stepYear(P);
    while (P.pending) resolve(P, autoChoice(P));
    const a0 = P.age, cast0 = [...P.lw.cast.values()].filter(m => m.alive).map(m => [m.id, P.age + m.age_offset]);
    customEffect(P, 'age_skip:3');
    assert.strictEqual(P.age, a0 + 3, 'age +3');
    for (const [id, age] of cast0) { const m = P.lw.cast.get(id); if (m.alive) assert.strictEqual(P.age + m.age_offset, age + 3, 'cast ages with you'); }
    assert.strictEqual(P.map.length, P.age, 'ruler has one cell per year'); assert(P.map.every(Boolean), 'no empty year');
    assert(P.log.some(e => e.text === '3 năm trôi qua mà bạn không hề hay biết. Giờ bạn đã ' + P.age + ' tuổi.'), 'skip line');
    const q0 = deathQ(P); P.age += 30; const qOld = deathQ(P); customEffect(P, 'longevity:30');
    assert.strictEqual(P.longevity, 30); assert.strictEqual(bioAge(P), P.age - 30);
    assert(Math.abs(deathQ(P) - q0) < 1e-12 && deathQ(P) < qOld, 'longevity:30 → death risk of a body 30 years younger');
    P.age -= 30;
    // S08 thật: age_skip:20|longevity:20|repay:50 trong reset của mùa, qua một cảnh; tua lại khớp; đời vẫn tới chết.
    const S08 = seasonDef('w_S08'); assert(/age_skip:20/.test(S08.reset.effects.custom));
    const unhook = hook(L => L.seed === 6771 && L.age === 26 && !L.lw.sflags.has('t8b_s08') && (L.lw.sflags.add('t8b_s08'), one('t8b_s08', L, 'Hợp đồng ngủ đông', { custom: 'canon:ky|season:w_S08' })));
    try { const Q = createLife(6771, { auto: true }); G.life = Q; let g = 0; while (Q.alive && Q.age < 26 && g++ < 130) stepYear(Q);
      if (Q.alive) { assert(Q.lw.sflags.has('t8b_s08') && Q.age === 46, 'S08 skipped 20 years: ' + Q.age); assert.strictEqual(Q.longevity, 20); assert.strictEqual(Q.map.length, Q.age, 'no hole after the skip');
        assert.strictEqual(Q.lw.season && Q.lw.season.from, Q.age, 'season starts after the skip'); }
      runToDeath(Q); const R = replayLife(Q.seed, Q.choices, null, Q.actLog || []);
      assert.strictEqual(hist(R), hist(Q), 'age_skip replay matches'); assert.strictEqual(R.age, Q.age); assert.strictEqual(Math.round(R.savings), Math.round(Q.savings));
    } finally { unhook(); } }

  // 8b.8 Id kỳ dị viết hoa (w_S01, ss_w_S01_…, weird_S01, season_played_w_S01): mọi chỗ host tra cứu dùng đúng id, không đổi hoa thường.
  { let n = 0;
    for (const b of Argon.WEIRD) { const id = b.season.id; assert(/[A-Z]/.test(id), id);
      assert.strictEqual(seasonDef(id), b.season, 'seasonDef ' + id); assert(seasonCards(id).length >= 5, 'seasonCards ' + id);
      assert(seasonCards(id).every(s => s.id.startsWith('ss_' + id + '_') && s.meta.season[0] === id), 'card ids keep case ' + id);
      assert.strictEqual(seasonDef(id.toLowerCase()), null, 'no lowercase alias ' + id); n++; }
    assert(n >= 100, 'all weird branches');
    const P = createLife(3301, { auto: true }); G.life = P; while (P.alive && P.age < 30) stepYear(P);
    while (P.pending) resolve(P, autoChoice(P)); if (P.lw.season) exitSeason(P, 'landing');
    const b = Argon.WEIRD.find(x => x.id === 'S19');
    const ev = { id: 'canon_S19_' + P.age, seed: 'S19', axis: 'ky', age: P.age, slots: { fromPlayer: 0 }, title: 'Thử', text: 'Thử id viết hoa.', doors: [{ kind: 'ky', label: 'Cửa A', hint: '', season: 'w_S19', weird: 'S19' }, { kind: 'ky', label: 'Cửa B', hint: '', season: 'w_S22', weird: 'S22' }, { kind: 'ky', label: 'Cửa C', hint: '', season: 'w_S06', weird: 'S06' }] };
    scene(P, canonScene(P, ev)); resolve(P, 0);
    assert.strictEqual(P.lw.season.id, 'w_S19', 'entered w_S19'); assert(P.lw.sflags.has('season_played_w_S19') && P.lw.sflags.has('weird_S19') && P.lw.sflags.has('canon_S19'), 'flags keep case');
    assert.strictEqual(P.lw.season.other.season, 'w_S22', 'other door id keeps case');
    assert(canonFacts(P).season === 'w_S19', 'fact context season');
    assert(canonYear(P) && P.pending && /^ss_w_S19_0_/.test(P.pending.id), 'season card fires: ' + (P.pending && P.pending.id));
    assert(P.lw.history.some(h => h.id === P.pending.id), 'history has the uppercase id'); }

  // 8b.9 marryMember: bạn đời đã mất không bị đổi thành "người cũ".
  { const P = grow(9101, 27, P => !P.married && P.income > 0);
    customEffect(P, 'marry'); const sp = castRole(P, 'spouse'); assert(sp, 'married'); sp.alive = false; P.married = false; P.widowed = true;
    const other = [...P.lw.cast.values()].find(m => m.alive && ['neighbor', 'partner', 'rival', 'childhood_friend', 'mentor'].includes(m.role));
    assert(other, 'someone to marry'); customEffect(P, 'marry:' + other.name);
    assert.strictEqual(other.role, 'spouse', 'new spouse'); assert.strictEqual(sp.role, 'spouse', 'late spouse keeps role spouse'); assert(sp.roles.includes('spouse'), 'late spouse keeps roles');
    assert.strictEqual(roleVN(sp), 'bạn đời', 'not labelled người cũ'); }


  // 8b.10 (21b) Giới tính theo nhãn người mới của mùa: chữ có dấu ở cuối từ vẫn khớp (cô, bà, chị, mẹ, góa phụ / bố, chú, lão).
  { for (const l of ['cô hướng dẫn hòa nhập', 'bà chủ vựa phế liệu', 'chị bán vé', 'mẹ nuôi', 'góa phụ đầu ngõ', 'cô']) { assert(CANON_FEMALE.test(l) && !CANON_MALE.test(l), 'female: ' + l); }
    for (const l of ['bố già', 'chú bảo vệ', 'lão thợ rèn', 'ông gác đêm', 'người đàn ông lạ', 'lão']) { assert(CANON_MALE.test(l) && !CANON_FEMALE.test(l), 'male: ' + l); }
    for (const l of ['cố vấn', 'bàn tay', 'chút', 'nữa đêm']) assert(!CANON_FEMALE.test(l) && !CANON_MALE.test(l), 'neither: ' + l);
    const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null); enterSeason(P, 'w_S08');
    const m = P.lw.cast.get(P.lw.season.cast.huong_dan), nm = NAMES[P.c.nm];
    assert(nm.F.concat(nm.SF || []).includes(givenOf(m.name, P.c)) || nm.F.some(x => m.name.includes(x)), 'cô hướng dẫn gets a female name: ' + m.name); }

  // 8b.11 (21b) Tên: không người thật nổi tiếng; makeName rút lại khi ghép trúng.
  { assert(nameBlocked('Joseph Kabila') && nameBlocked('Kabila Joseph') && nameBlocked('Hồ Chí Minh') && !nameBlocked('Joseph Kamau'), 'blocklist');
    NAMES.t8b = { M: ['Joseph', 'Joseph'], F: ['An'], S: ['Kabila', 'Kamau'] };
    const seq = [0.1, 0.1, 0.1, 0.9]; let k = 0; const r = () => seq[k++ % seq.length];
    assert.strictEqual(makeName(r, { nm: 't8b' }, 'M'), 'Joseph Kamau', 'blocked combination redrawn'); delete NAMES.t8b; }

  // 8b.12 (21b) Canon event chỉ in "Vì năm…" về người ở chỗ trống khi chữ của cảnh nhắc tới người đó.
  { const P = grow(4441, 34, P => P.lw.season === null);
    const who = [...P.lw.cast.values()].filter(m => m.alive).map(m => m.id).find(id => { try { return Argon.resolveCauses(P.lw.cz, [Argon.prov.opinion(id)]).length > 0; } catch { return false; } });
    assert(who, 'a cast member with a recorded opinion cause');
    const mk = (txt, id) => ({ id: 'canon_t8b' + id + '_' + P.age, seed: 't8b', axis: 'tinh', age: P.age, slots: { who, fromPlayer: 0 }, title: 'Một lá thư', text: txt, doors: [{ kind: 'a', label: 'Mở thư', hint: '', season: 'ngoi_sao' }, { kind: 'b', label: 'Cất đi', hint: '', season: 'lam_lai' }] });
    const a = canonScene(P, mk('Một lá thư không đề tên người gửi nằm trên bàn.', 'a'));
    assert(!a.causes || !a.causes.length, 'no cause line when the text does not mention the person');
    const b = canonScene(P, mk('Lá thư của ' + castName(P, who) + ' nằm trên bàn.', 'b'));
    assert(b.causes && b.causes.length > 0, 'cause line when the text mentions the person'); }

  // 8b.13 (21b) Nhật ký: mùa bị cắt rồi mùa mới cùng năm → một dòng, dòng cắt đọc trước.
  { const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null);
    enterSeason(P, 'ngoi_sao'); enterSeason(P, 'lam_lai');
    const at = P.log.filter(e => e.age === P.age), cut = at.filter(e => e.text.includes('khép lại giữa chừng'));
    assert.strictEqual(cut.length, 1, 'one line mentions the cut');
    assert(cut[0].text.startsWith(seasonDef('ngoi_sao').vn + ' khép lại giữa chừng.') && cut[0].text.endsWith('Mùa ' + P.lw.season.n + ': ' + seasonDef('lam_lai').vn + '.'), 'merged: ' + cut[0].text);
    assert.strictEqual(P.log[P.log.length - 1], cut[0], 'merged line is the newest entry (shown first)');
    assert(!at.some(e => e !== cut[0] && e.text.includes(seasonDef('lam_lai').vn)), 'no separate line for the new season'); }

  // 8b.14 (21b) Văn bia không bao giờ nói "0 năm".
  { const P = lives[0], A0 = Argon, orig = A0.lifeTopology;   // Argon là namespace chỉ đọc: thay cả biến bằng một bản sao có lifeTopology giả
    Argon = { ...A0, lifeTopology: (s, n) => { const T = orig(s, n); return { ...T, sovereignty: { ...T.sovereignty, ticks_sovereign: 1, ticks_autopilot: 1, agency_peak: 0.6, relapses: 0 } }; } };
    let txt; try { txt = eulogyVN(P)[0]; } finally { Argon = A0; }
    assert(!/(^|\\D)0 năm/.test(txt), 'no "0 năm": ' + txt); assert(txt.includes('chưa kịp'), 'rephrased: ' + txt); }

  // 8b.15 (21b) Chung kết: ghi chú giao diện (thẻ chung kết), không phải quyết định, không ghi khi tua lại.
  { const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null); enterSeason(P, 'lam_lai');
    // Từ Task 20 (canon nổ từ 25 tuổi, mùa không bị cắt) đời 32 tuổi có thể đã đáp một mùa: chỉ đếm ghi chú mới.
    const land = seasonDef('lam_lai').landings[0], c0 = P.choices.length, d0 = P.lw.decisions, h0 = P.lw.history.length, nn0 = (P.uiNotes || []).length;
    applyEffect(P, land.effects);
    const n = (P.uiNotes || []).slice(nn0).filter(x => x.kind === 'landing');
    assert.strictEqual(n.length, 1, 'one landing note'); assert.strictEqual(n[0].line, land.line); assert.strictEqual(n[0].vn, seasonDef('lam_lai').vn);
    assert(P.choices.length === c0 && P.lw.decisions === d0 && P.lw.history.length === h0, 'not a decision');
    const Q = grow(3301, 32, P => P.income > 0 && P.lw.season === null); enterSeason(Q, 'lam_lai'); const qn0 = (Q.uiNotes || []).length; Q.replay = true; applyEffect(Q, land.effects); Q.replay = false;
    assert.strictEqual((Q.uiNotes || []).length, qn0, 'no note while replaying'); }


  // 8b.16 (góp ý 19/10, luật dữ liệu thật) Câu kết của mọi mùa: không rỗng, không undefined, mọi tên riêng là người / vật có thật trong đời đó.
  { let rows = 0, bad = [];
    const capsOf = s => s.match(/(?<=[\\s(“])\\p{Lu}\\p{L}*/gu) || [];
    for (const P of lives) {
      const known = [...P.lw.cast.values()].map(m => m.name + ' ' + (m.label || '')).concat(P.lw.plants.map(p => p.label || ''), P.lw.promises.map(p => p.what || ''), [P.name]).join(' | ');
      for (const s of P.lw.canon.seasons) { if (s.reason === 'landing') continue; rows++;
        if (!s.line || /undefined|NaN|null|\\{/.test(s.line)) bad.push(s.id + ':' + s.reason + ':' + s.line);
        for (const w of capsOf(s.line)) if (!known.includes(w)) bad.push('unknown name ' + w + ' in ' + s.line); }
      const h = seasonsEndHTML(P), n = (h.match(/<li class="sm"/g) || []).length;
      if (n && (h.match(/class="sm-l"/g) || []).length !== n) bad.push('row without ending line, seed ' + P.seed);
      if (/undefined|NaN/.test(h)) bad.push('undefined in end list, seed ' + P.seed); }
    assert(rows > 40, 'many cut / dang dở / lapsed seasons checked (' + rows + ')');   // Task 20: mùa hiếm khi bị cắt, nên ngưỡng tính trên cả ba loại
    assert.deepStrictEqual(bad.slice(0, 5), [], 'ending lines'); }
  // Thiếu dữ liệu → câu trung tính, không bịa người hay vật.
  { const P = lives[3], se = { id: 'lam_lai', from: P.age + 1, cast: {}, scars: {} };
    assert.strictEqual(seasonEndLine(P, se, 'cut'), 'Mùa này bị cắt ngang khi mọi chuyện vừa mở màn.');
    assert.strictEqual(seasonEndLine(P, se, 'death'), 'Bạn ra đi khi mọi chuyện vừa mở màn, khi mùa này còn dang dở.');
    assert.strictEqual(seasonEndLine(P, se, 'lapsed'), 'Mùa này tự khép lại khi mọi chuyện vừa mở màn.');
    const m = [...P.lw.cast.values()].find(x => x.alive) || [...P.lw.cast.values()][0];
    const l2 = seasonEndLine(P, { ...se, scars: { nguoi: { npc: m.id, label: m.name } } }, 'cut');
    assert(l2.includes(m.name), 'scar person named: ' + l2);
    const l3 = seasonEndLine(P, { ...se, scars: { no: { key: 'bank', label: 'món nợ ngân hàng' } } }, 'death');
    const debt = P.ar.state.capitals.capitalAssets.debt;
    if (debt > 0) assert.strictEqual(l3, 'Bạn ra đi khi mọi chuyện vừa mở màn, vẫn còn vướng món nợ ngân hàng.');
    // Vết chỉ được nhắc nếu lúc ra mùa nó vẫn còn thật (review I-3): hết nợ, lời hứa đã giữ, vật gài đã dùng, tài sản đã bán → câu trung tính.
    P.ar.state.capitals.capitalAssets.debt = 0; const dl = P.debt; P.debt = 0;
    assert.strictEqual(seasonEndLine(P, { ...se, scars: { no: { key: 'bank', label: 'món nợ ngân hàng' } } }, 'death'), 'Bạn ra đi khi mọi chuyện vừa mở màn, khi mùa này còn dang dở.', 'paid bank debt is not mentioned');
    P.ar.state.capitals.capitalAssets.debt = debt; P.debt = dl;
    assert.strictEqual(seasonEndLine(P, { ...se, scars: { no: { key: 'promise:nobody', label: 'trả lại chiếc xe' } } }, 'cut'), 'Mùa này bị cắt ngang khi mọi chuyện vừa mở màn.', 'closed promise is not mentioned');
    assert.strictEqual(seasonEndLine(P, { ...se, scars: { no: { key: 'giay_no_da_tra', label: 'tờ giấy nợ' }, do: { key: 'house_gone', label: 'căn nhà cũ' } } }, 'lapsed'), 'Mùa này tự khép lại khi mọi chuyện vừa mở màn.', 'dropped plant / sold asset are not mentioned');
    const dead = [...P.lw.cast.values()].find(x => !x.alive);
    if (dead) assert(!seasonEndLine(P, { ...se, scars: { nguoi: { npc: dead.id, label: dead.name } } }, 'death').includes(dead.name), 'a dead person is not a companion'); }

  // 8b.17 (góp ý 19/10) Dòng "↩ Có liên quan…": dưới tiêu đề, thu gọn; mọi lựa chọn được trích là lựa chọn có thật của đời đó.
  { const seen = [], oScene = scene;
    scene = function (L, o) { if (o && o.causes && o.causes.length && L.t8bCause) seen.push({ L, o, html: becauseHTML(L, o), quoted: o.causes.map(m => m.choice) }); return oScene(L, o); };   // quoted: chữ lúc hiện thẻ (remark của S04/S28/S40 có thể sửa dấu mốc về sau)
    try { for (let i = 0; i < 12; i++) { const P = createLife(8800 + i * 7, { auto: true }); P.t8bCause = true; G.life = P; runToDeath(P); } } finally { scene = oScene; }
    assert(seen.length > 50, 'cause lines checked: ' + seen.length);
    for (const { L, o, html, quoted } of seen) {
      assert(/^<details class="because"[^>]*><summary><span class="because-mark"[^>]*>↩<\\/span><span class="because-s">Có liên quan đến (lựa chọn|chuyện) năm \\d+ tuổi/.test(html) && html.includes('Xem lại'), 'short collapsed line: ' + html.slice(0, 160));
      for (const m of o.causes) {
        assert(L.lw.cz.marks.includes(m), 'cause mark belongs to this life');
        if (m.choice) { assert(L.choices.some(c => c.key === m.key), 'quoted choice was made in this life: ' + m.key);
          if (m.altLabels && !m.remark) assert.strictEqual(m.altLabels[m.choice_index], m.choice, 'quoted text is the label that was chosen'); }
      }
      for (const [, q] of html.matchAll(/bạn đã chọn (“[^”]*”)/g)) assert(quoted.some(c => '“' + esc(c) + '”' === q), 'quoted text comes from a cause mark: ' + q);
    }
    const P = lives[0], w = { age: 7, title: 'Đời đưa đẩy', choice: '', consequences: [] };
    assert.strictEqual(becauseShort(P, [w]), 'Có liên quan đến chuyện năm 7 tuổi', 'no choice → neutral wording'); }


  // 8b.18 (review I1) Gõ "cách khác" ở canon event hay thẻ chung kết vẫn đi qua đúng một cửa: vào mùa của cửa đó, canon.n tăng; tua lại khớp.
  { const act = { ke: 'Bạn ngồi im rất lâu, rồi đứng dậy.', ket_qua: 'nua_voi', chi_so: {}, nguoi: [], co: [], bo_co: [], viec_lon: [], chon: null };
    let done = 0;
    for (let k = 0; k < 160 && done < 2; k++) { const P = createLife(3100 + k * 53, {}); G.life = P; let g = 0, sc = null;
      while (P.alive && g++ < 2000) { if (P.pending) { if (P.pending.canon && P.pending.choices.length === 3) { sc = P.pending; break; } resolve(P, autoChoice(P)); continue; } if (P.storyDue) { P.storyDue = null; continue; } stepYear(P); }
      if (!sc) continue;
      assert.strictEqual(isFreeScene(sc), false, 'canon scene is not a free scene');
      const n0 = P.lw.canon.n, h0 = P.lw.history.filter(h => h.id === sc.id).length, chon = done === 0 ? null : 2, want = sc.canon.seasons[chon === null ? sc.def : chon];
      applyAct(P, { ...act, chon }, 'scene', 'Tôi chọn cách khác: không làm gì cả', chon);
      assert.strictEqual(P.lw.canon.n, n0 + 1, 'canon.n advances');
      { const mk = P.lw.cz.marks.find(m => m.key === sc.key), k = chon === null ? sc.def : chon;
        assert(mk && mk.door === k && !mk.alt_indices.includes(k), 'typed mark records the door it went through and does not offer it again (review I-2)'); }
      assert.strictEqual(P.lw.history.filter(h => h.id === sc.id).length, h0, 'one history entry');
      assert(P.lw.season && P.lw.season.id === want && P.lw.season.from === P.age, 'entered the season of the mapped door: ' + (P.lw.season && P.lw.season.id) + ' vs ' + want);
      P.auto = true; autoChain(P); runToDeath(P);
      const R = replayLife(P.seed, P.choices, null, P.actLog);
      assert.strictEqual(hist(R), hist(P), 'replay matches after a typed act on a canon scene'); done++; }
    assert.strictEqual(done, 2, 'two canon scenes answered by typing');
    // Thẻ chung kết: gõ vẫn đáp xuống một chung kết (không thành "lapsed").
    let fin = 0;
    for (const id of ['lam_lai', 'ngoi_sao', 'tron_chay', 'vu_an_gia_toc']) { const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null); G.life = P; enterSeason(P, id);
      P.lw.counters.season_beat = 4; P.lw.counters.season_next = P.age; const st = nextSeasonCard(P); if (!st) continue;
      fireSeasonCard(P, st); const p = P.pending; if (!p || !p.choices.some(c => c._fx && Argon.landingOf(c._fx) !== null)) continue;
      assert.strictEqual(isFreeScene(p), false, 'finale card is not a free scene');
      applyAct(P, act, 'scene', 'Tôi làm theo ý mình', null);
      const last = P.lw.canon.seasons[P.lw.canon.seasons.length - 1];
      assert(last && last.id === id && last.reason === 'landing' && last.landing, 'typed finale still lands: ' + JSON.stringify(last)); fin++; }
    assert(fin >= 1, 'a finale card was answered by typing'); }

  // 8b.19 (review I2) Di cư của mùa (reset xu_nguoi, chung kết có migrate_now) luôn thành; lời mời di cư thường vẫn tung 55%.
  { let n = 0, ok = 0;
    for (let k = 0; k < 400 && n < 40; k++) { const P = createLife(9001 + k * 61, { auto: true }); let g = 0; while (P.alive && P.age < 30 && g++ < 60) stepYear(P);
      if (P.alive && !P.pending && P.lw.season) exitSeason(P, 'cut');   // từ Task 20 phần lớn đời 30 tuổi đang ở trong mùa (bản ghép: 21/400 đời trống): cắt mùa đó trước khi thử
      if (!P.alive || P.pending || P.lw.season || !canMigrate(P) || !canonIndependent(P)) continue;
      n++; G.life = P; enterSeason(P, 'xu_nguoi'); if (P.migrated && P.c !== P.birthC) ok++;
      assert(!P.log.some(e => e.age === P.age && /Thủ tục không thành/.test(e.text)), 'no failed paperwork line'); }
    assert.strictEqual(n, 40, '40 eligible adults'); assert.strictEqual(ok, 40, 'xu_nguoi migrates every time (' + ok + '/40)');
    const L0 = Argon.WEIRD.map(b => b.season).flatMap(d => d.landings.map(l => ({ d, l }))).find(x => /(^|\\|)migrate_now(\\||$)/.test(x.l.effects.custom || ''));
    assert(L0, 'a landing with migrate_now'); let m = 0, t = 0;
    for (let k = 0; k < 400 && t < 12; k++) { const P = createLife(9301 + k * 67, { auto: true }); let g = 0; while (P.alive && P.age < 30 && g++ < 60) stepYear(P);
      if (P.alive && !P.pending && P.lw.season) exitSeason(P, 'cut');   // từ Task 20 phần lớn đời 30 tuổi đang ở trong mùa (bản ghép: 21/400 đời trống): cắt mùa đó trước khi thử
      if (!P.alive || P.pending || P.lw.season || !canMigrate(P) || !canonIndependent(P)) continue;
      t++; enterSeason(P, L0.d.id); if (P.migrated) continue; applyEffect(P, L0.l.effects); if (P.migrated) m++; else t--; }
    assert(t >= 8 && m === t, 'landing migrate_now always succeeds (' + m + '/' + t + ')');
    assert.strictEqual(sureMigrate({ custom: 'season_end:x|migrate_now' }).custom, 'season_end:x|migrate_sure');
    assert.strictEqual(sureMigrate({ money: 1 }).money, 1); }


  // 8b.20 (R24) Hệ số thu nhập của mùa chỉ nhân vào lương; money / borrow / repay / chung kết tính trên lương gốc; money_season khai báo rõ thì nhân.
  { const all = [...Argon.SEASONS, ...Argon.WEIRD.map(b => b.season)], big = all.slice().sort((a, b) => (b.rules.income ?? 1) - (a.rules.income ?? 1))[0];
    assert(big.rules.income >= 50, 'the ×50 season: ' + big.id);
    const P = grow(3301, 32, P => P.income > 0 && P.lw.season === null && canonIndependent(P) && !P.retired); G.life = P;
    const base0 = seasonYearlyBase(P); enterSeason(P, big.id);
    assert(Math.abs(P.income - base0 * big.rules.income) < 1e-6 * P.income + 1, 'salary ×' + big.rules.income);
    assert(Math.abs(seasonYearlyBase(P) - base0) < 1, 'base unit stays the base salary');
    const d = (f) => { const s0 = P.savings; f(); return P.savings - s0; };
    assert(Math.abs(d(() => applyEffect(P, { money: 1 })) - base0) < 1, 'money:1 in season = 1 base year, not ×50');
    assert(Math.abs(d(() => applyEffect(P, { money: -0.5 })) + 0.5 * base0) < 1, 'fixed loss unchanged');
    const debt0 = P.ar.state.capitals.capitalAssets.debt; customEffect(P, 'borrow:1'); const debt1 = P.ar.state.capitals.capitalAssets.debt;
    assert(Math.abs(debt1 - debt0 - base0) < 1, 'borrow:1 = 1 base year');
    customEffect(P, 'repay:0.2'); assert(Math.abs(debt1 - P.ar.state.capitals.capitalAssets.debt - 0.2 * base0) < 1, 'repay:0.2 = 0.2 base year');
    assert(Math.abs(d(() => customEffect(P, 'money_season:1')) - P.income) < 1, 'money_season:1 = one ×50 year');
    // 5 năm trong mùa: thu nhập nhận về ≈ 5 × lương gốc × hệ số; chung kết tính trên lương gốc.
    P.lw.season.end = P.age + 50; P.lw.canon.last = P.age; let inc = 0, years = 0, why = [];   // không để canon event mới cắt mùa trong 5 năm đo
    for (let k = 0; k < 5 && P.alive; k++) { P.auto = true; while (P.pending) resolve(P, autoChoice(P)); stepYear(P); while (P.pending) resolve(P, autoChoice(P)); P.auto = false;
      if (P.lw.season && P.lw.season.id === big.id && P.ar.lastFlow && P.ar.lastFlow.age === P.age) { inc += (P.ar.lastFlow.rows.find(r => r[0] === 'Thu nhập') || [0, 0])[1]; years++; } else why.push(P.age + ':' + (P.lw.season && P.lw.season.id) + ':' + (P.ar.lastFlow && P.ar.lastFlow.age) + ':' + P.alive); }
    assert(P.alive && P.lw.season && P.lw.season.id === big.id && years === 5, 'five season years ' + why.join(' ') + ' ' + JSON.stringify(P.lw.canon.seasons.slice(-2)));
    const perYear = inc / 5, salary = P.income;
    console.log({ R24_base0: Math.round(base0), R24_income_per_year: Math.round(perYear), R24_salary_now: Math.round(salary) });
    assert(perYear > 0.6 * base0 * big.rules.income && perYear < 1.6 * salary, 'wages in season are ×' + big.rules.income);
    const land = big.landings.find(l => l.effects.money) || big.landings[0], k = land.effects.money || 0, baseAfter = seasonYearlyBase(P);
    const dl = d(() => applyEffect(P, land.effects));
    assert(!P.lw.season, 'landed');
    if (k) { assert(Math.abs(dl - k * baseAfter) <= Math.abs(k) * baseAfter * 0.02 + 1, 'landing money on base: ' + dl + ' vs ' + k * baseAfter);
      assert(Math.abs(dl) < Math.abs(k) * baseAfter * 2, 'landing is not ×' + big.rules.income); } }

  console.log('8b sections', ((Date.now() - t1) / 1000).toFixed(1) + 's');
}

t8b().then(() => console.log('PASS canon-test'), e => { console.error(e); process.exit(1); });
`);
