// Final review fixes (each test failed before its fix). Run: node tests/review-fixes-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge, pred) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && (!pred || pred(P))) return P; } throw new Error('no life'); }
const fake = (fn, delay = 0) => ({ json: async (p) => { if (delay) await new Promise(r => setTimeout(r, delay)); return fn(p); } });
(async () => {
  { // R1: scene answered by a button while the AI is thinking → typed result is dropped
    let P; for (let s = 0; s < 200 && !P; s++) { const Q = createLife(5000 + s, { auto: false }); let g = 0; while (Q.alive && g++ < 60) { stepYear(Q); if (Q.pending && Q.pending.choices.some(c => c._fx)) break; while (Q.pending && !Q.pending.choices.some(c => c._fx)) resolve(Q, Q.pending.def); } if (Q.pending && Q.pending.choices.some(c => c._fx)) P = Q; }
    const n0 = (P.actLog || []).length;
    const pr = agencyAct(P, "cách của tôi", fake(() => ({ ke: "x", ket_qua: "thanh", co: ["leader"] }), 50));
    resolve(P, 0); const r = await pr;
    assert(!r.ok, 'stale typed answer must be dropped'); assert.strictEqual((P.actLog || []).length, n0, 'no act logged');
  }
  { // R2: ket_hon name cannot inject host effects
    const P = grow(61, 25, P => !P.married); const debt0 = P.debt || 0, inc0 = P.income;
    const cs = new Set([...P.lw.cast.values()].map(m => m.id));
    const a = Argon.sanitizeAct({ ke: "x", ket_qua: "thanh", viec_lon: [{ loai: "ket_hon", gia_tri: "A|borrow:999" }] }, cs, P.age);
    assert(!/[|:]/.test(String(a.viec_lon[0].gia_tri)), 'sanitized name has no separators');
    customEffect(P, bigActionToCustom({ loai: "ket_hon", gia_tri: "B|study_done|borrow:999" }));
    assert(Math.abs((P.debt || 0) - debt0) < 1, 'no injected borrow'); assert(P.married, 'still marries');
  }
  { // R3: replay keeps a proactive act typed after a big action opened a scene the same year
    let P, acts = 0;
    for (let sd = 7100; sd < 7400 && !P; sd += 13) { const Q = createLife(sd, { auto: true }); G.life = Q; let g = 0;
      while (Q.alive && Q.age < 30 && g++ < 60) stepYear(Q); if (!Q.alive || Q.migrated || Q.c.g >= 25000) continue;
      await agencyAct(Q, "đi Nhật làm thợ hàn", fake(() => ({ ke: "Bạn sang Nhật.", ket_qua: "thanh", viec_lon: [{ loai: "di_nuoc_ngoai" }] })));
      while (Q.pending) resolve(Q, autoChoice(Q));
      await agencyAct(Q, "đứng ra lập hội đồng hương", fake(() => ({ ke: "Bạn lập hội.", ket_qua: "thanh", co: ["leader"] })));
      if (!Q.migrated) continue; g = 0; while (Q.alive && g++ < 130) { stepYear(Q); while (Q.pending) resolve(Q, autoChoice(Q)); } P = Q; }
    assert(P, 'found a migrating life');
    const R = replayLife(P.seed, P.choices, null, P.actLog);
    assert.strictEqual(R.lw.sflags.has('leader'), P.lw.sflags.has('leader'), 'leader flag survives replay');
    assert.strictEqual(R.age, P.age, 'same death age');
  }
  { // R4: auto mode resolves story scenes after they load
    const P = grow(81, 30, P => !P.pending);
    await agencyAct(P, "mở quán", fake(() => ({ ke: "x", ket_qua: "thanh", chuyen: { ten: "Quán", tom_tat: "t", hen_nam: 1 } })));
    let g = 0; while (!P.storyDue && g++ < 5) stepYear(P);
    assert(P.storyDue, 'story due'); P.auto = true;
    await storyTick(P, fake(() => ({ title: "Quán năm sau", text: "t", choices: [{ label: "A", log: "a", ket: "hết" }, { label: "B", log: "b", ket: "hết" }], def: 0 })));
    assert(!P.pending, 'auto resolved the story scene');
  }
  { // R5: positive income/money gains are capped per year across many acts
    const P = grow(91, 30, P => !P.pending && P.income > 0); const inc0 = P.income, sav0 = P.savings, y = Math.max(300, householdIncome(P));
    for (let k = 0; k < 10; k++) await agencyAct(P, "làm thêm " + k, fake(() => ({ ke: "x", ket_qua: "thanh", chi_so: { income_mult: 2, money: 3 } })));
    assert(P.income <= inc0 * 2 + 1, 'income at most x2 per year, got x' + (P.income / inc0).toFixed(2));
    assert(P.savings - sav0 <= y * 3.3, 'money gain at most ~3 years of income per year');
  }
  { // R6: switching path A → B gives about the same income as entering B directly
    const A = grow(101, 30, P => P.income > 0); const B = grow(101, 30, P => P.income > 0);
    becomePath(A, "singer"); becomePath(A, "journalist"); becomePath(B, "journalist");
    assert(Math.abs(A.income / B.income - 1) < 0.05, 'switch keeps base income, ratio ' + (A.income / B.income).toFixed(2));
  }
  { // R7: an exception while applying does not call the AI again
    const P = grow(111, 30, P => !P.pending); let calls = 0;
    const orig = applyPeople; applyPeople = () => { throw new Error("boom"); };
    try { await agencyAct(P, "x", { json: async () => { calls++; return { ke: "x", ket_qua: "thanh" }; } }); } catch (e) { /* surfaced is fine */ }
    applyPeople = orig;
    assert.strictEqual(calls, 1, 'AI called once, got ' + calls);
  }
  console.log('PASS review-fixes');
})().catch(e => { console.error(e); process.exit(1); });
`);
