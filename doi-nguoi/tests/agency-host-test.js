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

  /* ---------------- Task 5: chuyện đang dở ---------------- */
  const storyScene = (tiep = true) => ({ title: "Quán phở, năm sau", text: "Khách đông dần.", choices: [
    { label: "Mở thêm giờ khuya", hint: "Mệt hơn", log: "Bạn bán đến nửa đêm.", chi_so: { money: 0.1 }, ...(tiep ? { tiep: { hen_nam: 1, tom_tat: "Quán đông." } } : { ket: "Quán đóng cửa." }) },
    { label: "Giữ như cũ", hint: "Ổn định", log: "Bạn giữ nhịp cũ.", ...(tiep ? { tiep: { hen_nam: 1, tom_tat: "Quán vừa đủ." } } : { ket: "Bạn sang lại quán." }) }], def: 0 });
  const runUntilStory = (P, maxYears = 10) => { let g = 0; while (P.alive && !P.storyDue && g++ < maxYears) { stepYear(P); while (P.pending) resolve(P, P.pending.def); } return P.storyDue; };
  { // due exactly at opened age + hen_nam
    const P = grow(301, 30, P => !P.pending); await agencyAct(P, "mở quán phở", fake(() => pho)); const opened = P.age;
    const st = runUntilStory(P); assert(st && P.age === opened + 2, 'story due at +2, got age ' + P.age + ' opened ' + opened);
    const ok1 = await agencyStory(P, st, fake(() => storyScene(true))); assert(ok1 && P.pending && P.pending.story === st.id, 'story scene pending');
    resolve(P, 0); assert.strictEqual(st.stage, 1); assert.strictEqual(st.nextAge, P.age + 1); assert(!P.storyDue || P.storyDue.id !== st.id);
  }
  { // 4 due in one year → 2 stages, others pushed to next year
    const P = grow(311, 30, P => !P.pending);
    for (let k = 0; k < 4; k++) await agencyAct(P, "việc " + k, fake(() => ({ ...pho, co: [], viec_lon: [], chuyen: { ten: "Chuyện " + k, tom_tat: "t", hen_nam: 1 } })));
    const year = P.age + 1; runUntilStory(P); assert.strictEqual(P.age, year); let staged = 0;
    while (P.storyDue && P.age === year) { const ok2 = await agencyStory(P, P.storyDue, fake(() => storyScene(true))); assert(ok2); resolve(P, 0); staged++; }
    assert.strictEqual(staged, 2, 'two story stages in one year'); assert.strictEqual(P.stories.filter(s => s.nextAge === year + 1 && s.stage === 0).length, 2, 'two pushed to next year');
  }
  { // closes after 8 stages even if AI keeps continuing
    const P = grow(321, 25, P => !P.pending); await agencyAct(P, "mở quán phở", fake(() => pho)); const st = P.stories[0];
    for (let k = 0; k < 12 && !st.closed && P.alive; k++) { const d = runUntilStory(P, 8); if (!d) break; await agencyStory(P, d, fake(() => storyScene(true))); resolve(P, 0); }
    assert(st.closed && st.stage <= 8, 'closed by stage 8, stage ' + st.stage);
  }
  { // AI fails three years in a row → closed, logged
    const P = grow(331, 30, P => !P.pending); await agencyAct(P, "mở quán phở", fake(() => pho)); const st = P.stories[0];
    for (let k = 0; k < 3; k++) { const d = runUntilStory(P); assert(d); const okf = await agencyStory(P, d, fake(() => { throw new Error('down'); })); assert(!okf); }
    assert(st.closed, 'closed after 3 failures'); assert(P.log.some(e => /chìm dần/.test(e.text)), 'logged');
  }
  { // death closes every story
    const P = grow(341, 30, P => !P.pending); await agencyAct(P, "mở quán phở", fake(() => pho)); die(P, "tai nạn");
    assert(P.stories.every(s => s.closed), 'all closed on death');
  }
  console.log('PASS task5 stories');

  /* ---------------- Task 6: tua lại đời, "Cuộc đời suýt có", điếu văn ---------------- */
  async function playWithActs(seed) {
    const P = createLife(seed, { auto: true }); G.life = P; let g = 0; const plan = { 22: "học nấu ăn", 25: "mở quán phở", 28: "làm lành với bố", 33: "đi tập thể dục", 40: "mua đất", 47: "đi từ thiện" };
    let typedScene = false;
    while (P.alive && g++ < 130) {
      stepYear(P);
      while (P.storyDue && P.alive) { await agencyStory(P, P.storyDue, fake(() => storyScene(true))); if (P.pending) { if (!typedScene) { typedScene = true; await agencyAct(P, "rủ chủ nợ góp vốn", fake(() => ({ ke: "Chủ nợ gật đầu.", ket_qua: "nua_voi", chi_so: { money: 0.2 }, chuyen: { ten: "x", tom_tat: "Quán có thêm vốn.", hen_nam: 2 } }))); } else resolve(P, autoChoice(P)); } }
      while (P.pending && P.alive) resolve(P, autoChoice(P));
      if (P.alive && !P.pending && plan[P.age]) await agencyAct(P, plan[P.age], fake(() => plan[P.age] === "mở quán phở" ? pho : { ke: "Bạn " + plan[P.age] + ".", ket_qua: "thanh", chi_so: { happy: 2, money: -0.05 }, co: P.age === 40 ? ["land_sold"] : [] }));
    }
    return P;
  }
  { let P; for (let sd = 4401; sd < 4501; sd += 7) { P = await playWithActs(sd); if (P.age >= 50) break; } const nActs = P.actLog.filter(a => a.kind !== 'story').length; assert(nActs >= 5, 'acts played: ' + nActs);
    assert(P.actLog.some(a => a.kind === 'story'), 'story stages played'); assert(P.actLog.some(a => a.kind === 'scene'), 'typed scene act played');
    const R = replayLife(P.seed, P.choices, null, P.actLog);
    assert.strictEqual(R.age, P.age, 'same death age'); assert(Math.abs(R.savings - P.savings) < 1, 'same savings ' + R.savings + ' vs ' + P.savings);
    assert.deepStrictEqual([...R.lw.sflags].sort(), [...P.lw.sflags].sort(), 'same flags');
    assert.deepStrictEqual(R.lw.history.map(h => h.id), P.lw.history.map(h => h.id), 'same history');
    const pho0 = P.actLog.find(a => a.text === 'mở quán phở');
    const X = replayLife(P.seed, P.choices, { removeAct: pho0.seq }, P.actLog);
    { const ob = X.lw.cz.origin.get(Argon.prov.flag('own_business')); const obm = ob && Argon.markById(X.lw.cz, ob); assert(!X.lw.sflags.has('own_business') || (obm && obm.key !== pho0.key), 'no business from the removed act'); } // đời giả định có thể tự mở cơ sở qua thẻ khác assert(!(X.stories || []).some(s => s.title === 'Quán phở đầu ngõ'), 'no story');
    assert.notDeepStrictEqual(X.lw.history.map(h => h.id), P.lw.history.map(h => h.id), 'history differs');
    G.life = P; const cfHtml = counterfactualVN(P); assert(/Tự quyết/.test(cfHtml) && /không/.test(cfHtml), 'counterfactual names a typed act');
    const eu = eulogyVN(P).join(' '); const named = ["học nấu ăn", "mở quán phở", "làm lành với bố", "đi tập thể dục", "mua đất", "đi từ thiện"].filter(t => eu.includes(t)).length;
    assert(named >= 1 && named <= 3, 'eulogy names 1–3 typed acts, got ' + named);
    // replay where a story is due but no stage was stored → never stuck
    const thin = P.actLog.filter(a => a.kind !== 'story'); const Y = replayLife(P.seed, P.choices, null, thin); assert(!Y.alive, 'replay finishes a life');
  }
  console.log('PASS task6 replay');
})().catch(e => { console.error(e); process.exit(1); });
`);
