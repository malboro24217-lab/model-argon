/* Tất định và chơi lại (ledger 2026-10-18-tat-dinh). Chạy: node doi-nguoi/tests/replay-test.js
   1. 200 đời "như người chơi" (không tự chơi): có cảnh AI giả với ma trận sương mù + người mới + ván tù nhân,
      thẩm định, đổi mức sống, bật/tắt sống dưới mức thu nhập, việc gõ mua nhà / gửi tiết kiệm, đổi trọng tâm năm.
   2. Mỗi đời chạy hai lần: lần A gọi mọi hàm vẽ giao diện (fogMatrix, npcSignalVN, temptationVN, wealthPanelHTML,
      moneySuggestions, statePacket, actPacket) ở mỗi tình huống chờ; lần B không gọi. A và B phải giống hệt nhau.
   3. replayLife(seed, choices, null, actLog) phải khớp 100%: tuổi, tiền, cờ, lịch sử tình huống, của cải, lựa chọn.
   4. Đời giả định (đổi một nút / gỡ một việc gõ): mọi năm trước lựa chọn bị đổi giống hệt bản tua lại gốc. */
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
const N = +(process.env.N || 200);
const FAKE_AI = k => ({ title: "AI: hùn vốn " + k, text: "Một người quen rủ bạn góp vốn.", concept: null,
  npc: { new: { ten: "Tài", vai: "doi_tac" } },
  matrix: { me: ["Góp thật", "Giấu bớt"], them: ["Góp thật", "Giấu bớt"], cells: [[[25, 25], [-40, 60]], [[60, -40], [-20, -20]]] },
  choices: [{ label: "Góp vốn", fx: { game: { move: "cooperate", stake_frac: 0.3 }, log: "Bạn góp vốn." } },
            { label: "Từ chối", fx: { happy: -2, money: -0.05, log: "Bạn từ chối." } },
            { label: "Góp rồi giấu", fx: { game: { move: "defect", stake_frac: 0.3 }, log: "Bạn góp rồi giấu." } }], def: 0 });
const ACTS = [
  { ke: "Bạn mua một căn hộ nhỏ.", ket_qua: "thanh", viec_lon: [{ loai: "mua", tai_san: "house", ten: "căn hộ nhỏ", so: 8, vay: true }] },
  { ke: "Bạn gửi tiết kiệm.", ket_qua: "thanh", viec_lon: [{ loai: "gui_tiet_kiem", so: 0.3 }] },
  { ke: "Bạn mua ít vàng.", ket_qua: "thanh", viec_lon: [{ loai: "mua", tai_san: "gold", ten: "vàng", so: 0.2 }] },
];
function touchRender(P) { // mọi hàm giao diện/AI đọc trạng thái trong lúc có tình huống chờ
  const p = P.pending; if (!p) return; const key = p.key || p.id + P.age; const g = argonGate(P);
  p.choices.forEach(c => choiceState(P, c, g));
  if (p.matrix && p.fog) { fogMatrix(P, p.matrix, key); fogMatrix(P, p.matrix, key); }
  if (p.npc && P.ar) { npcSignalVN(P, p.npc, key); if (p.tempt) temptationVN(P, p.npc, p.tempt.stake, p.tempt.roundsLeft); }
  wealthPanelHTML(P); moneySuggestions(P); statePacket(P); actPacket(P, "thử");
}
function playLive(seed, render) {
  const t = makeRng(seed ^ 0x5eed); const P = createLife(seed, { auto: false }); G.life = P;
  const lyAge = 20 + Math.floor(t() * 30), frAge = 20 + Math.floor(t() * 30), actAges = new Set([22 + Math.floor(t() * 20), 30 + Math.floor(t() * 25)]);
  let g = 0, aiK = 0, fogScenes = 0, ddDone = 0, ops = 0, acts = 0;
  while (P.alive && g++ < 140) {
    if (!P.aiReady && P.age >= 8 && t() < 0.5) { P.aiReady = { raw: FAKE_AI(aiK++) }; P.nextAi = P.age + 1; }
    if (P.age >= 6 && t() < 0.15) P.focus = ["study", "work", "family", "health", "rest"][Math.floor(t() * 5)];
    stepYear(P);
    assert(P.alive || !P.pending, 'dead life left a pending scene (age ' + P.age + ')');   // die() gỡ cảnh chờ; bản tua lại dừng ở lúc chết
    let k = 0;
    while (P.pending && k++ < 15) {
      const p = P.pending, key = p.key || p.id + P.age;
      if (render) touchRender(P);
      if (p.matrix && p.fog) { fogScenes++; if (t() < 0.5 && P.ar && P.ar.state.capitals.cognitiveBandwidth.value >= 35 && uiOp(P, { t: "dd", key, cost: 35 })) ddDone++; }
      if (P.age === lyAge && canHandleMoney(P) && uiOp(P, { t: "ly", v: t() < 0.5 ? "tan_tien" : "pho_truong" })) ops++;
      resolve(P, autoChoice(P));
    }
    if (!P.alive) break;
    if (P.age === frAge && P.ar && uiOp(P, { t: "frugal", v: !P.ar.frugal })) ops++;
    if (actAges.has(P.age) && !P.pending && canHandleMoney(P)) {
      const castIds = new Set([...P.lw.cast.values()].filter(m => m.alive).map(m => m.id));
      const act = Argon.sanitizeAct(ACTS[Math.floor(t() * ACTS.length)], castIds, P.age);
      if (act) { applyAct(P, act, "proactive", "việc tiền thử"); acts++; k = 0; while (P.pending && k++ < 15) { if (render) touchRender(P); resolve(P, autoChoice(P)); } assert(P.alive || !P.pending, 'dead life left a pending scene after an act'); }
    }
    if (P.storyDue && !P.pending) storyFail(P, P.storyDue);
  }
  P.stats = { fogScenes, ddDone, ops, acts, ai: (P.actLog || []).filter(a => a.kind === "ai").length };
  return P;
}
const sig = P => JSON.stringify({
  perks: P.perks || [], doorPerkUsed: !!P.doorPerkUsed, age: P.age, alive: P.alive, cause: P.cause, sav: Math.round(P.savings * 100) / 100, debt: Math.round((P.debt || 0) * 100) / 100,
  st: Object.fromEntries(Object.entries(P.st).map(([k, v]) => [k, Math.round(v * 1000) / 1000])),
  job: P.job, married: P.married, kids: P.kids.length, migrated: P.migrated,
  flags: [...P.lw.sflags].sort(), hist: P.lw.history.map(h => h.id + "@" + h.age), nChoices: P.choices.length,
  doors: [...P.lw.cz.doors].sort(), rep: P.ar ? Math.round(P.ar.state.capitals.socialLedger.reputation * 1000) / 1000 : null,
  assets: P.ar ? P.ar.state.holdings.assets.map(a => [a.kind, Math.round(a.value), Math.round(a.loan)]) : [],
  lifestyle: P.ar ? P.ar.state.holdings.lifestyle : null, npcs: P.ar ? P.ar.state.npcs.size : 0,
});
/* Ký ức tiền kiếp: 1/4 số đời chơi như kiếp thứ 4 (đủ 4 perk, có "door" và "mentor" đổi mô phỏng). Lúc tua lại, trình duyệt
   trả về "chưa có kiếp nào": bản tua lại phải lấy perk từ actLog chứ không từ localStorage. */
const META_GET = META.get; const PAST = { lives: 3, perks: ["insight", "codex", "mentor", "door"], codex: { [Object.keys(CONCEPTS)[0]]: true } };
const withMeta = (on, f) => { META.get = on ? () => JSON.parse(JSON.stringify(PAST)) : () => ({ lives: 0, perks: [], codex: {} }); try { return f(); } finally { META.get = META_GET; } };
const t0 = Date.now(); let renderDiff = 0, perkLives = 0, replayDiff = 0, tot = { fogScenes: 0, ddDone: 0, ops: 0, acts: 0, ai: 0, lifeWithFog: 0, lifeWithMoneyAct: 0 };
const lives = [];
for (let i = 0; i < N; i++) {
  const seed = (i * 7919 + 17) >>> 0;
  const past = i % 4 === 0;
  const A = withMeta(past, () => playLive(seed, true)), B = withMeta(past, () => playLive(seed, false));
  if (past) { perkLives++; assert(A.perks && A.perks.includes("door"), 'perks applied in the live life'); }
  if (sig(A) !== sig(B)) { renderDiff++; if (renderDiff <= 2) console.log('render changes outcome, seed', seed); }
  const R = withMeta(false, () => replayLife(A.seed, A.choices, null, A.actLog || []));
  if (past) assert(R.perks && R.perks.join() === A.perks.join(), 'replay uses the perks recorded at birth');
  if (sig(R) !== sig(A)) { replayDiff++; if (replayDiff <= 3) { const a = JSON.parse(sig(A)), r = JSON.parse(sig(R)); console.log('replay mismatch seed', seed, Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(r[k]))); } }
  for (const k of ['fogScenes', 'ddDone', 'ops', 'acts', 'ai']) tot[k] += A.stats[k]; if (A.stats.fogScenes) tot.lifeWithFog++; if (A.stats.acts) tot.lifeWithMoneyAct++;
  lives.push(A);
}
console.log({ lives: N, perkLives, renderDiff, replayDiff, ...tot, secs: Math.round((Date.now() - t0) / 1000) });
assert(tot.lifeWithFog >= N * 0.3, 'enough lives with fog matrices: ' + tot.lifeWithFog);
assert(tot.lifeWithMoneyAct >= N * 0.3, 'enough lives with money actions: ' + tot.lifeWithMoneyAct);
assert(tot.ddDone > 0 && tot.ops > 0 && tot.ai > 0, 'ui ops, due diligence and AI scenes exercised');
assert.strictEqual(renderDiff, 0, 'rendering must not change the life');
assert.strictEqual(replayDiff, 0, 'replay must match 100%');
console.log('PASS replay');

/* Đời giả định: mọi năm trước lựa chọn bị đổi phải giống hệt bản tua lại gốc. Đo thêm: sau lựa chọn, bao nhiêu tình huống khác. */
const snap = P => JSON.stringify({ age: P.age, sav: P.savings, st: P.st, hist: P.lw.history.length, flags: P.lw.sflags.size, nc: P.choices.length, bw: P.ar ? P.ar.state.capitals.cognitiveBandwidth.value : 0 });
let cfChecked = 0, cfBad = 0, actChecked = 0, laterSame = 0, laterAll = 0;
for (const A of lives.slice(0, 60)) {
  if (A.age < 30) continue;
  G.life = A; CF_FOCUS = A.focusLog;
  const base = []; replayLife(A.seed, A.choices, null, A.actLog || [], P => base.push(snap(P)));
  const marks = A.lw.cz.marks.filter(m => m.alt_indices && m.alt_indices.length && m.key && m.age >= 12 && m.age <= A.age - 10);
  const m = marks[Math.floor(marks.length / 2)];
  if (m) {
    const alt = []; const X = replayLife(A.seed, A.choices, { key: m.key, index: m.alt_indices[0] }, A.actLog || [], P => alt.push(snap(P)));
    const before = base.filter(s => JSON.parse(s).age < m.age).length;
    for (let y = 0; y < before; y++) if (base[y] !== alt[y]) { cfBad++; console.log('counterfactual differs before the changed choice, seed', A.seed, 'age', JSON.parse(base[y]).age, 'mark age', m.age); break; }
    cfChecked++;
    const la = A.lw.history.filter(h => h.age > m.age).map(h => h.id), lb = new Set(X.lw.history.filter(h => h.age > m.age).map(h => h.id));
    laterAll += la.length; laterSame += la.filter(id => lb.has(id)).length;
  }
  const rec = (A.actLog || []).find(a => a.kind === "proactive");
  if (rec) {
    const alt = []; replayLife(A.seed, A.choices, { removeAct: rec.seq }, A.actLog || [], P => alt.push(snap(P)));
    const before = base.filter(s => JSON.parse(s).age < rec.age).length;
    for (let y = 0; y < before; y++) if (base[y] !== alt[y]) { cfBad++; console.log('removeAct differs before the act, seed', A.seed); break; }
    actChecked++;
  }
}
console.log({ counterfactualsChecked: cfChecked, removeActChecked: actChecked, cfBad, laterStoryletsKept: laterAll ? (laterSame / laterAll).toFixed(2) : 'n/a' });
assert(cfChecked >= Math.min(20, N / 4) && actChecked >= Math.min(5, N / 10), 'enough counterfactuals checked: ' + cfChecked + ' / ' + actChecked);
assert.strictEqual(cfBad, 0, 'years before the changed choice must be identical');
console.log('PASS counterfactual');
`);
