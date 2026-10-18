// Chạy: node doi-nguoi/tests/fork-test.js [số đời]
// Thử lại từ năm N: đời rẽ phải (a) giống bản gốc ở mọi năm trước chỗ rẽ, (b) chơi tiếp được tới chết, (c) tua lại được 100%.
const fs = require("fs"); const assert = require("assert");
eval(fs.readFileSync(__dirname + "/.head.js", "utf8") + `
const N = +(process.argv[2] || 20); let ok = 0, nul = 0, mid = 0; const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const seed = (i * 2654435761 + 13) >>> 0;
  const L = createLife(seed, { auto: true }); G.life = L; G.peers = [1,2,3,4].map(k => peerWithSnaps((seed + k * 7919) >>> 0));
  let g = 0; while (L.alive && g++ < 130) { stepYear(L); autoChain(L); }
  const cf = counterfactuals(L); const nm = nearMissOf(L, cf); if (!nm) { nul++; continue; }
  const P = resumeFrom(L, nm); if (!P) { nul++; continue; }
  if (nm.age >= 12) mid++;
  // (a) trước chỗ rẽ giống hệt: lịch sử tình huống và nhật ký
  const hA = L.lw.history.filter(h => h.age < nm.age).map(h => h.id + "@" + h.age).join("|"), hB = P.lw.history.filter(h => h.age < nm.age).map(h => h.id + "@" + h.age).join("|");
  assert.strictEqual(hB, hA, "history before fork, seed " + seed);
  assert(!P.replay && !P.auto && !P.script && P.alive && P.age >= nm.age, "live after fork");
  // (b) chơi tiếp tới chết (tự chơi)
  P.auto = true; g = 0; while (P.alive && g++ < 130) { stepYear(P); autoChain(P); }
  assert(!P.alive, "forked life ends");
  // (c) tua lại đời rẽ phải khớp
  G.life = P; const R = replayLife(seed, P.choices, null, P.actLog);
  assert.strictEqual(R.age, P.age, "replay age " + seed); assert.strictEqual(Math.round(R.savings), Math.round(P.savings), "replay savings " + seed);
  assert.strictEqual(R.lw.history.map(h => h.id + "@" + h.age).join("|"), P.lw.history.map(h => h.id + "@" + h.age).join("|"), "replay history " + seed);
  ok++;
}
console.log({ lives: N, forked_ok: ok, no_fork: nul, fork_after_12: mid, ms: Date.now() - t0 });
console.log("PASS fork-test");
`);
