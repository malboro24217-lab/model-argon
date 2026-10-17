/* ================= LIVING WEB (host) =================
   Dàn nhân vật bền suốt đời · người phụ thuộc · ký ức & bí mật · storyteller · storylet → cảnh.
   Mọi thay đổi thế giới đi qua applyEffect(); kịch bản chỉ là dữ liệu. */
const LW = {
  ROLE_VN: { mother: "mẹ", father: "cha", sibling: "anh/chị/em", childhood_friend: "bạn thân từ nhỏ", bully: "kẻ bắt nạt ngày xưa", neighbor: "hàng xóm", first_boss: "sếp đầu tiên", official: "cán bộ", partner: "đối tác", creditor: "chủ nợ", mentor: "người thầy", rival: "đối thủ", spouse: "bạn đời", child: "con" },
  TAG_VN: { HELPED_IN_CRISIS: "đã giúp lúc khó", WIN_WIN_DEAL: "làm ăn sòng phẳng", KEPT_PROMISE: "giữ lời", STOOD_UP_FOR_ME: "đứng về phía họ", BETRAYED_PARTNERSHIP: "phản bội khi hùn vốn", REFUSED_HELP: "từ chối giúp", CHEATED_ME: "lừa họ", HUMILIATED_ME: "làm họ bẽ mặt", TOOK_MY_LAND: "lấy đất", BULLIED_ME: "bắt nạt", GOSSIP_HEARD_BAD: "nghe tiếng xấu", GOSSIP_HEARD_GOOD: "nghe tiếng tốt" },
  SECRET_VN: { CHEATED_EXAM: "chép bài thi", PAID_BRIBE: "đưa hối lộ", DEFRAUDED_FRIEND: "lừa bạn", STOLE_SHARED_PROFIT: "giấu tiền chung", FORGED_PAPERS: "làm giấy tờ giả", ABANDONED_PARENT: "bỏ mặc cha mẹ" }
};

/* ---- khởi tạo ở lúc sinh ---- */
function livingInit(L) {
  if (L.lw) return;
  argonInit(L, true);
  const s = L.ar.state, rng = L.ar.rng;
  const nm = NAMES[L.c.nm];
  const cast = Argon.createCast(s, rng, { male: nm.M, female: nm.F }, L.fam);
  for (const m of cast.values()) L.ar.npcStart.set(m.id, s.npcs.get(m.id).liquid);
  L.lw = { cast, mem: Argon.createMemory(), st: Argon.createStoryteller(rng), history: [], recentVig: [], sflags: new Set(), counters: {}, queue: [], lastVig: -9, depLogged: -9 };
}
function castName(L, id) { const m = L.lw && L.lw.cast.get(id); if (m) return m.name; const n = L.ar && L.ar.state.npcs.get(id); return n ? n.name : "ai đó"; }
function castRole(L, r) { return Argon.byRole(L.lw.cast, r); }
function fill(L, text) {
  const map = { mother: "mother", father: "father", sibling: "sibling", friend: "childhood_friend", bully: "bully", neighbor: "neighbor", mentor: "mentor", spouse: "spouse", child: "child" };
  return text.replace(/\{(\w+)\}/g, (_, k) => { if (k === "job") return L.job || "việc"; const m = map[k] && castRole(L, map[k]); return m ? m.name : ({ mother: "mẹ", father: "cha", sibling: "em", friend: "bạn", bully: "nó", neighbor: "hàng xóm", mentor: "người thầy", spouse: "vợ/chồng", child: "con" })[k] || k; });
}

/* ---- FactContext ---- */
function factContext(L) {
  const g = argonGate(L); const s = L.ar.state; const cast = L.lw.cast; const yearly = Math.max(300, householdIncome(L));
  const kids = [...cast.values()].filter(m => m.alive && m.role === "child").map(m => L.age + m.age_offset);
  const parents = [...cast.values()].filter(m => m.alive && (m.role === "mother" || m.role === "father"));
  const castMap = {}, opinion = {}, roles = {}, hooksMap = {};
  for (const m of cast.values()) { if (!m.alive) continue; roles[m.id] = m.roles; opinion[m.id] = Argon.opinionOf(s, L.lw.mem, m.id); for (const r of m.roles) if (!castMap[r]) castMap[r] = m.id; }
  for (const h of Argon.hooks(s, L.lw.mem)) (hooksMap[h.holder] = hooksMap[h.holder] || []).push(h.secret.tag);
  const last_move = {}; for (const n of s.npcs.values()) { const h = n.history[n.history.length - 1]; if (h) last_move[n.id] = h.npcMove; }
  const rep = s.capitals.socialLedger.reputation;
  const debt = L.debt || 0, savings = L.savings;
  return {
    age: L.age, sex: L.sex, country: L.c.id, gdp: L.c.g, poor_country: L.c.g < 8000, family_wealth: L.fam,
    in_school: L.school.in, years_school: L.school.years, has_degree: L.school.deg, has_job: !!L.job && !L.retired, job: L.job || "", farmer: L.job === "nông dân" || L.job === "phụ giúp việc đồng áng", worker: /công nhân|kho|nhà máy|thợ/.test(L.job || ""), retired: L.retired,
    married: L.married, widowed: !!L.widowed, kids_alive: kids.length, kids_teen: kids.filter(a => a >= 13 && a <= 19).length, kids_school: kids.filter(a => a >= 6 && a < 18).length,
    parents_alive: parents.length, parent_old: parents.some(m => L.age + m.age_offset >= 65), parent_sick: parents.some(m => m.health < 40), sibling_alive: !!castMap.sibling,
    income: yearly, savings, debt, debt_ratio: debt / yearly, rich: savings >= 3 * yearly, broke: savings < 0.1 * yearly,
    health: L.st.health, happy: L.st.happy, know: L.st.know, rel: L.st.rel, bandwidth: g.bw, bandwidth_locked: g.bw < 30, scarcity: !!g.scarcity, rat_race: g.ratRace,
    tier: g.tier, agency: g.agency, reputation: rep, allies: Object.values(opinion).filter(v => v >= 0.5).length, enemies: Object.values(opinion).filter(v => v <= -0.35).length,
    econ_phase: s.economic_phase, ill: !!L.ill, migrated: L.migrated, flags: L.lw.sflags, counters: L.lw.counters, cast: castMap, opinion, roles, hooks: hooksMap, last_move,
    years_since_major: L.age - L.lw.st.last_major_age, tension: L.lw.st.tension, crises_survived: s.perception.crises_survived, traits: L.traits || { coop: 0, fair: 0, risk: 0, bold: 0 }
  };
}

/* ---- Hiệu ứng khai báo → thế giới ---- */
function applyEffect(L, e, npcId) {
  const s = L.ar.state, yearly = Math.max(300, householdIncome(L)), ctxNpc = id => (id && s.npcs.get(id)) || (npcId && s.npcs.get(npcId));
  if (e.gamble) { const win = L.r() < e.gamble.p; applyEffect(L, { ...e, gamble: undefined, log: undefined }, npcId); applyEffect(L, win ? e.gamble.win : e.gamble.lose, npcId); return; }
  if (e.game) { const npc = ctxNpc(e.game.npc); if (npc) { const r = argonPlay(L, npc, e.game.move, yearly * e.game.stake_frac, npc.id); const o = r.outcome;
      log(L, `${e.log ? e.log + ". " : ""}${npc.name} ${o.npcMove === "cooperate" ? "chơi thật" : "chơi xấu"} → ${AR.CELL_VN[o.cell]}: bạn ${o.payoffA.capital >= 0 ? "nhận" : "mất"} ${fmtPPP(Math.abs(o.payoffA.capital))}${o.breach_detected ? " (bạn phát hiện kịp)" : ""}.`, o.cell === "win_win" || o.cell === "arbitrage" ? "good" : o.cell === "sucker" || o.cell === "mutual_destruction" ? "bad" : "");
      const tag = o.cell === "exploitation" ? "BETRAYED_PARTNERSHIP" : o.cell === "win_win" ? "WIN_WIN_DEAL" : o.cell === "arbitrage" ? "KEPT_PROMISE" : null;
      if (tag) Argon.addMemory(L.lw.mem, npc.id, tag, L.age, o.cell === "exploitation" ? -0.6 : 0.25, o.cell === "exploitation" ? `bị bạn bòn rút năm ${L.age} tuổi` : `ván làm ăn năm ${L.age} tuổi`);
      if (o.cell === "exploitation") Argon.addSecret(L.lw.mem, "STOLE_SHARED_PROFIT", L.age, 0.5, [6, 20], L.ar.rng, `giấu tiền chung với ${npc.name}`, [npc.id]); } }
  else if (e.log) log(L, fill(L, e.log), (e.money || 0) < 0 || (e.health || 0) < 0 || (e.happy || 0) < -4 ? "bad" : (e.money || 0) > 0 || (e.happy || 0) > 3 ? "good" : "");
  for (const k of ["health", "happy", "know", "rel"]) if (e[k]) addSt(L, k, e[k]);
  if (e.bw) { s.capitals = Argon.applyDelta(s.capitals, { bandwidth: e.bw }); L.st.bw = s.capitals.cognitiveBandwidth.value; }
  if (e.agency) { s.capitals = Argon.applyDelta(s.capitals, { agency: e.agency }); }
  if (e.money) L.savings += yearly * e.money;
  if (e.income_mult && L.income > 0) L.income *= e.income_mult;
  if (e.trust) { const npc = ctxNpc(e.trust.npc); if (npc) Argon.propagate(s.graph, npc.id, e.trust.delta, s.tick); }
  if (e.memory) { const npc = ctxNpc(e.memory.npc); if (npc) Argon.addMemory(L.lw.mem, npc.id, e.memory.tag, L.age, e.memory.weight, e.memory.note ? `${e.memory.note} (năm bạn ${L.age} tuổi)` : "", e.memory.decayPerYear); }
  if (e.secret) Argon.addSecret(L.lw.mem, e.secret.tag, L.age, e.secret.severity, e.secret.fuse_years, L.ar.rng, e.secret.note || "", (e.secret.known_by || []).filter(id => s.npcs.has(id)));
  if (e.flags) for (const f of e.flags) L.lw.sflags.add(f);
  if (e.unflags) for (const f of e.unflags) L.lw.sflags.delete(f);
  if (e.counters) for (const k in e.counters) L.lw.counters[k] = (L.lw.counters[k] || 0) + e.counters[k];
  if (e.later) { if (e.later.storylet) L.lw.queue.push({ at: L.age + e.later.years, storylet: e.later.storylet }); else if (e.later.note) { L.threads = L.threads || []; L.threads.push({ flag: "hẹn", age: L.age, due: L.age + e.later.years, note: e.later.note }); } }
  if (e.trait) for (const k in e.trait) if (e.trait[k]) trait(L, k, e.trait[k]);
  if (e.learn) learn(L, e.learn);
  if (e.tension) L.lw.st.tension = clamp(L.lw.st.tension + e.tension, 0, 100);
  if (e.role) { const m = L.lw.cast.get(e.role.npc); if (m && !m.roles.includes(e.role.add)) m.roles.push(e.role.add); }
  if (e.custom) customEffect(L, e.custom, npcId);
}
function customEffect(L, c, npcId) {
  const s = L.ar.state, yearly = Math.max(300, householdIncome(L));
  const [kind, arg] = c.split(":"); const x = +arg || 0;
  switch (kind) {
    case "borrow": s.capitals.capitalAssets.debt += yearly * x; s.capitals.capitalAssets.liquid += yearly * x; syncFromArgon(L); break;
    case "repay": { const pay = Math.min(s.capitals.capitalAssets.debt, yearly * x); s.capitals.capitalAssets.debt -= pay; syncFromArgon(L); break; }
    case "restructure": s.capitals.capitalAssets.debt *= 0.85; L.lw.sflags.add("debt_restructured"); syncFromArgon(L); break;
    case "job_lose": if (L.job) { log(L, "Bạn mất việc.", "bad"); L.income *= 0.3; L.lw.queue.push({ at: L.age + 1, custom: "job_new" }); } break;
    case "job_lose_maybe": if (L.r() < 0.5) customEffect(L, "job_lose"); break;
    case "job_new": getJob(L); break;
    case "apologize": for (const m of L.lw.cast.values()) { if (!m.alive) continue; const op = Argon.opinionOf(s, L.lw.mem, m.id); if (op < -0.2 && L.r() < 0.5) { Argon.addMemory(L.lw.mem, m.id, "STOOD_UP_FOR_ME", L.age, 0.35, `bạn đến xin lỗi năm ${L.age} tuổi`); log(L, `${m.name} nghe bạn xin lỗi.`, "good"); } } break;
    case "explode_hook": { const h = Argon.hooks(s, L.lw.mem)[0]; if (h) { h.secret.exploded = true; for (const id of h.secret.holders) if (s.npcs.has(id)) Argon.propagate(s.graph, id, -0.5 * h.secret.severity, s.tick); L.lw.sflags.add("scandal_pending"); L.lw.counters.scandal_age = h.secret.age; } break; }
    case "confess_hook": for (const h of Argon.hooks(s, L.lw.mem)) { h.secret.exploded = true; Argon.propagate(s.graph, h.holder, -0.15 * h.secret.severity, s.tick); } break;
    case "shop_end": { const p = castRole(L, "partner"); if (!p) break; const npc = s.npcs.get(p.id); const coop = npc.history.filter(h => h.playerMove !== "defect" && h.npcMove === "cooperate").length;
      const a = AR.ARCH_VN[npc.true_archetype]; learn(L, "strategy"); log(L, `Nhìn lại bốn năm, bạn nhận ra ${npc.name} là người "${a[0]}": ${a[1]}`);
      if (coop >= 3) { L.income *= 1.3; addSt(L, "rel", 6); log(L, "Tiệm phát đạt. Hai người tiếp tục làm chung, thu nhập của bạn tăng.", "good big"); }
      else if (npc.history.filter(h => h.playerMove === "defect").length >= 2 && npc.history.filter(h => h.npcMove === "defect").length >= 2) { addSt(L, "happy", -5); log(L, "Tiệm tan rã trong cãi vã. Không ai tin ai nữa.", "bad"); }
      else log(L, "Hết hợp đồng, hai người chia tay tiệm trong hòa bình."); break; }
  }
}
function syncFromArgon(L) { const a = L.ar.state.capitals.capitalAssets; L.savings = a.liquid - a.debt; L.debt = a.debt; L.ar.syncedSavings = L.savings; }

/* ---- Storylet → cảnh ---- */
function sceneFromStorylet(L, st, ctx) {
  const view = st.build(ctx, id => castName(L, id));
  const yearly = Math.max(300, householdIncome(L)), u = yearly * 0.15;
  const npcId = view.npc;
  const choices = view.choices.map(ch => ({ label: ch.label, hint: ch.hint || "", tier: ch.tier, longterm: ch.longterm, fx: L2 => applyEffect(L2, ch.effects, npcId) }));
  let matrix = null;
  if (view.matrix) matrix = { who: npcId ? castName(L, npcId) : "Họ", me: view.matrix.me, them: view.matrix.them, unit: view.matrix.unit === "u" ? "$ PPP" : view.matrix.unit, cells: view.matrix.cells.map(r => r.map(c => c.map(v => view.matrix.unit === "u" ? Math.round(v * u) : v))) };
  const npc = npcId ? L.ar.state.npcs.get(npcId) : null;
  const memLine = npc ? memoryLine(L, npc.id) : "";
  return { id: st.id, key: st.id + "@" + L.age, title: view.title, text: fill(L, view.text) + (memLine ? " " + memLine : ""), choices, def: view.def, matrix, npc, fog: !!matrix, concept: view.concept, tempt: npc && matrix ? { stake: yearly * 0.5, roundsLeft: 2 } : null, storylet: true };
}
function memoryLine(L, id) {
  const bad = Argon.strongestMemory(L.lw.mem, id, -1), good = Argon.strongestMemory(L.lw.mem, id, 1);
  const name = castName(L, id);
  if (bad && Math.abs(bad.weight) >= 0.12) return `${name} vẫn chưa quên ${bad.note || LW.TAG_VN[bad.tag]}.`;
  if (good && good.weight >= 0.12) return `${name} còn nhớ ${good.note || LW.TAG_VN[good.tag]}.`;
  return "";
}

/* ---- Một năm của mạng lưới sống. Gọi từ lifeEvents. Trả về true nếu đã đặt L.pending ---- */
function livingYear(L) {
  livingInit(L);
  const s = L.ar.state, rng = L.ar.rng, lw = L.lw;
  // 1. Dàn nhân vật già đi
  for (const ev of Argon.ageCast(lw.cast, L.age, rng, L.c.g < 8000)) {
    const r = LW.ROLE_VN[ev.role];
    if (ev.kind === "died") { log(L, `${ev.name} (${r}) qua đời.`, "bad big"); addSt(L, "happy", ev.role === "mother" || ev.role === "father" || ev.role === "spouse" || ev.role === "child" ? -15 : -5);
      if (ev.role === "mother" || ev.role === "father") lw.sflags.add("parent_died"); if (ev.role === "spouse") { L.married = false; L.widowed = true; } if (ev.role === "child") { const k = L.kids.find(k => k.name === ev.name); if (k) k.alive = false; } }
    else if (ev.kind === "fell_ill") log(L, `${ev.name} (${r}) đổ bệnh.`, "bad");
    else log(L, `${ev.name} (${r}) khỏe lại.`, "good");
  }
  // 2. Người phụ thuộc: tiền chảy ra
  const deps = Argon.dependentCosts(lw.cast, L.age, L.c.g > 30000); const yearly = Math.max(300, householdIncome(L));
  let depTotal = 0; for (const d of deps) depTotal += d.frac * yearly;
  if (depTotal > 0) { L.savings -= depTotal; if (L.age - lw.depLogged >= 3) { lw.depLogged = L.age; log(L, `Năm nay ${fmtPPP(depTotal)} đi cho ${deps.map(d => `${d.name} (${d.why})`).join(", ")}.`); } }
  // 3. Ký ức mờ dần, bí mật rò rỉ, ngòi nổ
  Argon.decayMemories(lw.mem);
  for (const leak of Argon.leakSecrets(s, lw.mem, rng)) if (rng.chance(0.3)) log(L, `${castName(L, leak.to)} nghe được chuyện ${LW.SECRET_VN[leak.secret.tag]} của bạn.`, "bad");
  for (const sec of Argon.fuseCheck(s, lw.mem, L.age, rng)) { lw.sflags.add("scandal_pending"); lw.counters.scandal_age = sec.age; log(L, `Chuyện ${LW.SECRET_VN[sec.tag]} năm ${sec.age} tuổi bỗng được kể lại.`, "bad big"); }
  if (L.pending) return true;
  if (L.age < 5) return false;
  // 4. Hẹn trước (dây cháy chậm có chủ đích)
  const due = lw.queue.filter(q => q.at <= L.age); lw.queue = lw.queue.filter(q => q.at > L.age);
  const ctx = factContext(L);
  for (const q of due) { if (q.custom) { customEffect(L, q.custom); continue; } const st = Argon.STORYLETS.find(x => x.id === q.storylet); if (st && st.prerequisites(ctx)) { fire(L, st, ctx); return true; } }
  // 5. Storyteller quyết định nhịp
  const d = Argon.decide(lw.st, ctx, rng);
  const hist = lw.history;
  // Tình huống AI (nếu có) chỉ chen vào khi đang "bão" và không có storylet khẩn
  const urgent = Argon.selectStorylet(Argon.STORYLETS, ctx, { minUrgency: 80, history: hist, age: L.age }, rng);
  if (urgent) { fire(L, urgent, ctx); return true; }
  if (d.phase === "storm" && L.aiReady && narratorPresent(L)) { Argon.onFired(lw.st, L.age, 10, rng); return true; }
  const st = Argon.selectStorylet(Argon.STORYLETS, ctx, { minUrgency: d.minUrgency, history: hist, age: L.age }, rng);
  if (st) { fire(L, st, ctx); return true; }
  // 6. Năm lặng: một dòng tự sự
  if (d.vignette && L.age - lw.lastVig >= 1) { const v = Argon.selectVignette(Argon.VIGNETTES, ctx, rng, lw.recentVig); if (v) { lw.recentVig.push(v.id); if (lw.recentVig.length > 12) lw.recentVig.shift(); lw.lastVig = L.age; log(L, fill(L, rng.pick(v.lines)), v.tone || ""); } }
  return false;
}
function fire(L, st, ctx) {
  L.lw.history.push({ id: st.id, age: L.age });
  Argon.onFired(L.lw.st, L.age, st.tension, L.ar.rng);
  if (st.category === "reflection") { L.lw.sflags.add("reflect_" + L.age); }
  scene(L, sceneFromStorylet(L, st, ctx));
}

/* ---- Văn bia: 3 đoạn từ TopologyEndgame + dàn nhân vật ---- */
function eulogyVN(L) {
  if (!L.ar || !L.lw) return "";
  const T = Argon.lifeTopology(L.ar.state, L.ar.npcStart); const V = T.sovereignty, R = T.ripple, S = T.surplus;
  const cast = [...L.lw.cast.values()];
  const changed = cast.filter(m => m.id in Object.fromEntries(R.rows.map(r => [r.id, r]))).map(m => { const r = R.rows.find(x => x.id === m.id); return { m, r, op: Argon.opinionOf(L.ar.state, L.lw.mem, m.id) }; });
  const prospered = changed.filter(x => x.r.fate === "prospered" && x.op > -0.1).map(x => x.m.name), preyed = changed.filter(x => x.r.fate === "prospered" && x.op <= -0.1).map(x => x.m.name), bankrupt = changed.filter(x => x.r.fate === "bankrupt").map(x => x.m.name);
  const enemies = changed.filter(x => x.op <= -0.35).map(x => x.m.name), friends = changed.filter(x => x.op >= 0.5).map(x => x.m.name);
  const bad = cast.map(m => Argon.strongestMemory(L.lw.mem, m.id, -1)).filter(Boolean).sort((a, b) => a.weight - b.weight)[0];
  const good = cast.map(m => Argon.strongestMemory(L.lw.mem, m.id, 1)).filter(Boolean).sort((a, b) => b.weight - a.weight)[0];
  const yrs = n => (n / 4).toFixed(0);
  const p1 = V.ticks_sovereign === 0 && V.agency_peak < 0.3
    ? `Bạn sống ${L.age} năm ở ${L.c.n}${L.migrated ? `, xa nơi sinh là ${L.birthC.n}` : ""}, và phần lớn thời gian ấy là kịch bản sống bạn chứ không phải bạn sống nó. ${V.crises_survived ? `${V.crises_survived} lần khủng hoảng gõ cửa; mỗi lần bạn tỉnh một chút rồi guồng quay lại kéo về.` : "Không có cú đánh nào đủ mạnh để bạn phải nhìn lại."} ${V.ticks_rat_race > 8 ? `Có ${yrs(V.ticks_rat_race)} năm bạn chạy chỉ để đứng yên.` : ""}`
    : `Bạn sống ${L.age} năm ở ${L.c.n}. ${yrs(V.ticks_autopilot)} năm đầu là của người khác: của làng, của nhà, của những điều ai cũng làm. Rồi ${V.crises_survived ? `sau ${V.crises_survived} lần khủng hoảng` : "dần dần"}, bạn bắt đầu thấy luật chơi, và ${yrs(V.ticks_sovereign)} năm cuối cùng bạn tự viết lấy phần mình${V.relapses ? `, dù có ${V.relapses} lần suýt trượt về` : ""}.`;
  const p2 = `${S.rounds ? `Bạn ngồi vào ${S.rounds} ván với người khác và để lại ${S.net_systemic_surplus >= 0 ? "thêm " : "ít hơn "}${fmtPPP(Math.abs(S.net_systemic_surplus))} cho tất cả những người ngồi cùng bàn, trên ${fmtPPP(S.potential_surplus)} có thể có nếu ai cũng thật.` : "Bạn ít khi ngồi vào bàn với ai."} ${prospered.length ? `${prospered.join(", ")} khá lên nhờ có bạn.` : ""} ${preyed.length ? `${preyed.join(", ")} khá lên trên lưng bạn.` : ""} ${bankrupt.length ? `${bankrupt.join(", ")} trắng tay, và một phần là vì bạn.` : ""} ${friends.length ? `${friends.join(", ")} tin bạn đến cuối.` : ""} ${enemies.length ? `${enemies.join(", ")} thì không bao giờ.` : ""}`;
  const p3 = `Khi nấm mộ đã xanh cỏ, ${L.c.g < 8000 ? "làng" : "khu phố"} nhớ gì về bạn? ${good ? `Người ta nhớ ${good.note || LW.TAG_VN[good.tag]}.` : ""} ${bad ? `Người ta cũng nhớ ${bad.note || LW.TAG_VN[bad.tag]}.` : ""} ${!good && !bad ? "Không nhiều. Bạn là một người đi qua, và ở nơi này điều đó không hiếm." : R.reputation_final >= 65 ? `Tên bạn được nhắc khi người ta cần ví dụ về một người tử tế.` : R.reputation_final <= 35 ? `Tên bạn được nhắc khi người ta dặn con cẩn thận.` : "Tên bạn được nhắc, thỉnh thoảng, không tốt không xấu."}`;
  return [p1, p2, p3].map(x => x.replace(/\s+/g, " ").trim());
}
