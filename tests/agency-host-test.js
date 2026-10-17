// Ô "Tôi muốn…" phía trang game (Tasks 3–6). Run: node tests/agency-host-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge, pred) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && (!pred || pred(P))) return P; } throw new Error('no life matching at age ' + toAge); }
const ok = (P, loai, gia_tri) => bigActionOk(P, gia_tri === undefined ? { loai } : { loai, gia_tri });
const doBig = (P, loai, gia_tri) => customEffect(P, bigActionToCustom(gia_tri === undefined ? { loai } : { loai, gia_tri }));

/* ---------------- Task 3: việc lớn ---------------- */
{ // move_city
  const P = grow(11, 26, P => !P.lw.sflags.has('path_city') && P.income > 0); const inc = P.income;
  assert(ok(P, 'chuyen_thanh_pho'), 'move_city allowed first time'); doBig(P, 'chuyen_thanh_pho');
  assert(P.lw.sflags.has('path_city') && P.lw.sflags.has('left_home'), 'city flags'); assert(Math.abs(P.income - inc * 1.15) < 1e-6, 'income x1.15');
  assert(!ok(P, 'chuyen_thanh_pho'), 'move_city not twice'); }
{ // study
  const P = grow(21, 30, P => P.school.years >= 12 && !P.school.deg);
  assert(ok(P, 'di_hoc'), 'study at 30'); doBig(P, 'di_hoc'); stepYear(P); stepYear(P); stepYear(P);
  assert(P.school.deg, 'degree after studying'); const Q = grow(31, 50); assert(!ok(Q, 'di_hoc'), 'no study at 50'); }
{ // marry by name
  const P = grow(41, 25, P => !P.married); assert(ok(P, 'ket_hon', 'Lan'), 'marry allowed when single');
  doBig(P, 'ket_hon', 'Lan'); assert(P.married && P.spouse === 'Lan', 'married Lan');
  assert([...P.lw.cast.values()].some(m => m.role === 'spouse' && m.name === 'Lan'), 'spouse in cast');
  assert(['warm','proud','restless','fair'].some(k => P.lw.sflags.has('spouse_' + k)), 'spouse kind flag');
  assert(!ok(P, 'ket_hon', 'Mai'), 'cannot marry twice'); }
{ // child
  const P = grow(51, 30, P => P.married && P.sex === 'F'); const n = P.kids.length; assert(ok(P, 'co_con'), 'child allowed');
  doBig(P, 'co_con'); assert.strictEqual(P.kids.length, n + 1, 'one more kid');
  const Q = grow(61, 30, P => !P.married); assert(!ok(Q, 'co_con'), 'no child when single'); }
{ // retire
  const P = grow(71, 45, P => !!P.job); assert(!ok(P, 'nghi_huu'), 'no retire at 45');
  const Q = grow(81, 55, P => !!P.job && !P.retired); assert(ok(Q, 'nghi_huu')); doBig(Q, 'nghi_huu'); assert(Q.retired, 'retired'); }
{ // migrate now
  const P = grow(91, 30, P => !P.migrated && P.c.g < 25000); assert(ok(P, 'di_nuoc_ngoai'));
  const logs = P.log.length; doBig(P, 'di_nuoc_ngoai');
  assert(P.migrated || P.log.slice(logs).some(e => /Thủ tục/.test(e.text)), 'migrated or failed paperwork');
  if (P.migrated) assert(!ok(P, 'di_nuoc_ngoai'), 'cannot migrate twice'); }
{ // theo_duong
  const P = grow(101, 30); assert(ok(P, 'theo_duong', 'monk')); doBig(P, 'theo_duong', 'monk'); assert(P.lw.sflags.has('life_monk'), 'became monk');
  assert(!ok(P, 'theo_duong', 'footballer'), 'too old for footballer'); assert(!ok(P, 'theo_duong', 'wizard'), 'unknown path'); }
console.log('PASS task3 big actions');
`);
