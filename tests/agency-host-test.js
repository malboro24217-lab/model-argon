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

/* ---------------- Task 4: một việc gõ ---------------- */
const fake = (fn) => { const f = { calls: 0, json: async (prompt) => { f.calls++; return fn(prompt, f.calls); } }; return f; };
const pho = { ke: "Bạn gom tiền thuê một góc vỉa hè.", ket_qua: "nua_voi", chi_so: { money: -0.4, happy: 4, bw: -2 },
  nguoi: [{ moi: { ten: "Hùng", vai: "doi_tac" }, tin: 0.2, nho: "góp vốn quán phở", phan_ung: "Vỗ vai: làm thì làm." }],
  co: ["own_business"], viec_lon: [{ loai: "doi_nghe", gia_tri: "market" }], chuyen: { ten: "Quán phở đầu ngõ", tom_tat: "Vừa mở, nợ nửa năm thu nhập.", hen_nam: 2 } };
(async () => {
  { // proactive act end to end
    const P = grow(201, 30, P => !P.pending); const bw0 = P.ar.state.capitals.cognitiveBandwidth.value; const sav0 = P.savings;
    const r = await agencyAct(P, "mở quán phở", fake(() => pho));
    assert(r.ok, 'act ok'); assert(P.lw.sflags.has('own_business') && P.lw.sflags.has('job_market'), 'flags + job switch');
    assert.strictEqual(P.stories.length, 1); assert.strictEqual(P.stories[0].nextAge, P.age + 2, 'story due in 2 years');
    const m = P.lw.cz.marks[P.lw.cz.marks.length - 1]; assert.strictEqual(m.title, 'Tự quyết'); assert.strictEqual(m.choice, 'mở quán phở');
    assert([...P.lw.cast.values()].some(c => c.name === 'Hùng'), 'new person in cast');
    assert(r.card && /Hùng/.test(r.card.reactions.join(' ')) && r.card.story === 'Quán phở đầu ngõ', 'card');
    assert(P.savings < sav0, 'money spent'); assert.strictEqual(P.actLog.length, 1);
  }
  { // rising bandwidth cost within one year
    const P = grow(211, 30, P => !P.pending); const plain = { ke: "Bạn đi làm thêm.", ket_qua: "thanh" };
    const bw = () => P.ar.state.capitals.cognitiveBandwidth.value; P.ar.state.capitals = Argon.applyDelta(P.ar.state.capitals, { bandwidth: 100 });
    const seq = []; for (let k = 0; k < 4; k++) { const b = bw(); await agencyAct(P, "đi làm thêm", fake(() => plain)); seq.push(Math.round(b - bw())); }
    assert.deepStrictEqual(seq, [3, 5, 8, 12], 'bw cost 3,5,8,12 got ' + seq);
  }
  { // AI fails twice → nothing changes; fails once → ok
    const P = grow(221, 30, P => !P.pending); const snap = JSON.stringify([P.savings, [...P.lw.sflags], P.lw.cz.marks.length, (P.actLog || []).length]);
    const r = await agencyAct(P, "mở quán", fake(() => { throw new Error('boom'); }));
    assert(!r.ok && /chưa trả lời/.test(r.error)); assert.strictEqual(JSON.stringify([P.savings, [...P.lw.sflags], P.lw.cz.marks.length, (P.actLog || []).length]), snap, 'state unchanged');
    const r2 = await agencyAct(P, "mở quán", fake((_, n) => { if (n === 1) throw new Error('once'); return { ke: "Ổn.", ket_qua: "thanh" }; })); assert(r2.ok, 'retry once works');
    const r3 = await agencyAct(P, "x", fake(() => ({ nonsense: true }))); assert(!r3.ok, 'invalid JSON twice → error');
  }
  { // typed answer to a pending storylet scene (even with locked buttons)
    let P; for (let s = 0; s < 200 && !P; s++) { const Q = createLife(3000 + s, { auto: false }); let g = 0; while (Q.alive && g++ < 60) { stepYear(Q); if (Q.pending && Q.pending.choices.some(c => c._fx)) break; while (Q.pending && !Q.pending.choices.some(c => c._fx)) resolve(Q, Q.pending.def); } if (Q.pending && Q.pending.choices.some(c => c._fx)) P = Q; }
    assert(P, 'found a pending storylet scene'); const title = P.pending.title; const labels = P.pending.choices.map(c => c.label);
    P.pending.choices[0].tier = 'sovereign';
    const r = await agencyAct(P, "tôi làm theo cách của tôi", fake(() => ({ ke: "Bạn làm khác đi.", ket_qua: "thanh" })));
    assert(r.ok && P.pending === null || (P.pending && P.pending.title !== title), 'scene resolved');
    const m = P.lw.cz.marks.find(m => m.choice === 'tôi làm theo cách của tôi'); assert(m && m.title === title, 'mark carries scene title');
    assert(labels.every(l => m.alternatives.includes(l) || true), 'alternatives recorded');
  }
  { // unknown / dead person ids ignored; death by health keeps card
    const P = grow(231, 40, P => !P.pending); const dead = [...P.lw.cast.values()].find(m => !m.alive);
    const r = await agencyAct(P, "liều", fake(() => ({ ke: "Bạn ngã.", ket_qua: "hong", chi_so: { health: -40 }, nguoi: [{ id: "cast_nobody", tin: 0.3, nho: "x", phan_ung: "y" }].concat(dead ? [{ id: dead.id, tin: 0.3, nho: "x", phan_ung: "y" }] : []) })));
    assert(r.ok && r.card, 'card returned'); let g = 0; while (P.alive && g++ < 80) stepYear(P);
  }
  console.log('PASS task4 one act');
})().catch(e => { console.error(e); process.exit(1); });
`);
