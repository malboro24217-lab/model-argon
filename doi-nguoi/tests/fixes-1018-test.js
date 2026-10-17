// Review 18/10/2026 — host fixes (each case failed before its fix). Run: node tests/fixes-1018-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge, pred, auto) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: !!auto }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) { stepYear(P); while (P.pending) resolve(P, P.pending.def); } if (P.alive && P.age === toAge && !P.pending && (!pred || pred(P))) return P; } throw new Error('no life'); }
const fake = (fn) => ({ json: async (p) => fn(p) });
const typed = (extra) => fake(() => Object.assign({ ke: "Bạn làm theo cách riêng.", ket_qua: "nua_voi" }, extra || {}));
(async () => {
  { // F1a: typed answer to a path beat still advances the beat counter, and the next beat fires
    let done = false;
    for (let s = 0; s < 3000 && !done; s++) { const Q = createLife(9000 + s, { auto: false }); let g = 0;
      while (Q.alive && g++ < 90 && !done) { stepYear(Q);
        if (Q.pending && /_b1$/.test(Q.pending.id || "")) {
          const path = Q.pending.id.replace(/_b1$/, "");
          const r = await agencyAct(Q, "tôi làm theo cách riêng", typed());
          assert(r.ok, 'typed act applied');
          assert.strictEqual(Q.lw.counters["p_" + path], 1, 'beat counter advanced by a typed answer');
          let next = false, h = 0; while (Q.alive && h++ < 30 && !next) { stepYear(Q); while (Q.pending) { if (Q.pending.id === path + "_b2") next = true; resolve(Q, Q.pending.def); } }
          assert(next || !Q.alive || !Q.lw.sflags.has("life_" + path), 'next beat fires after a typed answer');
          h = 0; while (Q.alive && h++ < 130) { stepYear(Q); while (Q.pending) resolve(Q, Q.pending.def); } // sống hết đời rồi tua lại
          G.life = Q; const R = replayLife(Q.seed, Q.choices, null, Q.actLog); G.life = null;
          assert.strictEqual(R.age, Q.age, 'replay reaches the same death age');
          assert.strictEqual(R.lw.counters["p_" + path], Q.lw.counters["p_" + path], 'replay keeps the same beat counter');
          done = true;
        }
        while (Q.pending) resolve(Q, Q.pending.def); } }
    assert(done, 'found a life with a path beat');
  }
  { // F1b: typed answer to the scandal card clears scandal_pending (no yearly repeat)
    const P = grow(601, 35); P.lw.sflags.add("scandal_pending"); P.lw.counters.scandal_age = 20; let fires = 0;
    for (let y = 0; y < 4; y++) { stepYear(P); let g = 0; while (P.pending && g++ < 10) { if (P.pending.id === "scandal") { fires++; await agencyAct(P, "tôi im lặng", typed()); } else resolve(P, P.pending.def); } }
    assert(fires <= 1, 'scandal fired ' + fires + ' times'); assert(!P.lw.sflags.has("scandal_pending"), 'scandal_pending cleared');
  }
  { // F6: prototype keys from the AI are rejected, and nothing throws
    const cs = new Set();
    const a = Argon.sanitizeAct({ ke: "x", ket_qua: "thanh", co: ["__proto__", "constructor", "leader"], bo_co: ["toString"],
      viec_lon: [{ loai: "toString" }, { loai: "theo_duong", gia_tri: "constructor" }, { loai: "__proto__" }] }, cs, 30);
    assert.deepStrictEqual(a.co, ["leader"], 'only real flags'); assert.deepStrictEqual(a.bo_co, [], 'no proto unflag');
    assert.deepStrictEqual(a.viec_lon, [], 'no proto big actions');
    const P = grow(201, 30);
    const r = await agencyAct(P, "thử", fake(() => ({ ke: "Bạn thử.", ket_qua: "thanh", viec_lon: [{ loai: "toString" }, { loai: "theo_duong", gia_tri: "hasOwnProperty" }] })));
    assert(r.ok, 'act still applies'); assert(!P.lw.sflags.has("__proto__"), 'no proto flag');
    assert(bigActionOk(P, { loai: "theo_duong", gia_tri: "constructor" }) === false, 'host rejects proto path id');
  }
  { // F6b: an exception while applying is reported, not thrown into the UI
    const P = grow(211, 30); const orig = applyPeople; applyPeople = () => { throw new Error("boom"); };
    let r, threw = false; try { r = await agencyAct(P, "x", typed()); } catch (e) { threw = true; } applyPeople = orig;
    assert(!threw, 'agencyAct does not throw'); assert(r && !r.ok && /lỗi/i.test(r.error), 'error returned to the player: ' + (r && r.error));
  }
  { // F7: a typed answer cannot pick a hidden (or locked) engine choice
    const P = grow(301, 30); let ran = false;
    P.pending = { id: "test_hidden", key: "test_hidden@" + P.age, title: "Thử", text: "", def: 0, npc: null,
      choices: [{ label: "A", fx: () => {} }, { label: "B", fx: () => {} }, { label: "BÍ MẬT", tier: "sovereign", fx: () => { ran = true; } }] };
    assert.strictEqual(choiceState(P, P.pending.choices[2], argonGate(P)), "hidden", 'setup: choice is hidden');
    const r = await agencyAct(P, "chọn cái bí mật", fake(() => ({ ke: "x", ket_qua: "thanh", chon: 2 })));
    assert(r.ok, 'act applied'); assert(!ran, 'hidden choice must not run');
  }
  console.log("PASS fixes-1018");
})().catch(e => { console.error(e); process.exit(1); });
`);
