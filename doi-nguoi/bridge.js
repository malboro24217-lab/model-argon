/* ================= CẦU NỐI ARGON ↔ TRÒ CHƠI =================
   Argon (window.Argon) là nguồn sự thật cho: tiền mặt, nợ, sức khỏe sinh học, băng thông nhận thức, tự chủ.
   Trò chơi vẫn giữ: nước, gia đình, học hành, nghề, hôn nhân, các kịch bản. Mỗi năm trò chơi = 4 quý Argon.
   Argon bắt đầu ở tuổi 12 (từ đó bẫy khan hiếm và băng thông mới ảnh hưởng tới lựa chọn). */
const escB=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const AR = {
  START_AGE: 12,
  TIER_VN: { autopilot: "Tự lái", awakened: "Thức tỉnh", sovereign: "Tự chủ" },
  ARCH_VN: {
    tit_for_tat: ["ăn miếng trả miếng", "Hợp tác trước, rồi làm đúng như bạn vừa làm với họ."],
    generous_tit_for_tat: ["tử tế có chừng mực", "Như ăn miếng trả miếng, nhưng tha thứ khoảng 1 trong 6 lần bị phản bội."],
    grudger: ["không tha thứ", "Hợp tác cho đến khi bị phản bội một lần, rồi quay lưng mãi mãi."],
    always_defect: ["luôn tham", "Phản bội bất kể bạn làm gì."],
    opportunist: ["kẻ săn mồi cơ hội", "Giả vờ tin cậy để chờ ván có lợi nhất rồi phản bội, chấp nhận mất quan hệ."]
  },
  CELL_VN: { win_win: "Cùng thắng", sucker: "Bị lừa", exploitation: "Bạn bòn rút", mutual_destruction: "Cùng tổn thất", arbitrage: "Tái cấu trúc" }
};

/* ---- Spawn Vector từ nhân vật trong trò chơi ---- */
function argonSpawn(L) {
  const c = L.birthC, r = L.r;
  const inst = clamp((Math.log10(c.g) - 3.2) / 1.7, 0.1, 0.9);          // 1.6k$ → 0.1 · 14k$ (VN) → 0.56 · 60k$ → 0.9
  const mobility = clamp(1 - (c.gi - 0.25) / 0.4, 0.15, 0.9);            // Gini 0.30 → 0.88 · 0.50 → 0.38
  const survival = incomeAt(c, 0.5) * 0.55 / 4;                            // 1 CU = 1 $ PPP; chi phí tối thiểu một quý
  const tags = [];
  if (c.s >= 8) tags.push("literate_household");
  if (L.fam > 0.6) tags.push("entrepreneurial");
  if (L.fam > 0.8) tags.push("academic");
  if (c.g < 10000 && r() < 0.6) tags.push("religious_network");
  const chronic = r() < 0.12 ? ["cardiometabolic"] : [];
  return {
    macro: { country_iso: c.id, institutional_trust: inst, social_mobility_idx: mobility,
      economic_phase: r() < 0.25 ? "boom" : r() < 0.9 ? "stagnation" : "crisis",
      inflation_rate: c.g < 8000 ? 0.08 : 0.04, interest_rate: c.g < 8000 ? 0.22 : c.g < 30000 ? 0.14 : 0.07,
      survival_cost_quarterly: survival },
    bloodline: { economic_net_worth: L.famIncome * 1.5, cultural_capital: tags, social_network_nodes: Math.round(1 + L.fam * 4),
      debt_inherited: L.fam < 0.3 ? L.famIncome * 0.4 : 0 },
    biology: { baseline_dopamine_sensitivity: 0.4 + 0.5 * r(), cortisol_threshold: 55 + 20 * r(), chronic_genetics: chronic, base_metabolism: 0.85 + 0.3 * r() },
    agency_initial: 0.05 + 0.15 * r(), age_initial: AR.START_AGE, seed: (L.seed * 2654435761) >>> 0
  };
}

function argonInit(L, force) {
  if (L.ar || (L.age < AR.START_AGE && !force)) return;
  const spawn = argonSpawn(L);
  const w = Argon.createWorld(spawn);
  const s = w.state;
  s.capitals.bioEnergy.value = clamp(L.st.health, 10, s.capitals.bioEnergy.cap);
  s.capitals.capitalAssets.liquid = Math.max(0, L.savings);
  s.capitals.capitalAssets.debt += Math.max(0, -L.savings);
  s.capitals.capitalAssets.income_quarterly = householdIncome(L) / 4;
  L.ar = { state: s, rng: w.rng, npcStart: new Map(), syncedHealth: L.st.health, syncedSavings: L.savings, frugal: false, lastReport: null, dd: {}, indep: false,
    hh: s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt - L.savings };
  L.st.bw = s.capitals.cognitiveBandwidth.value;
  L.debt = 0;
  // Luồng riêng cho từng hệ con; stepYear đặt lại cả bốn mỗi năm (rekeyYear, xem ledger 2026-10-18-tat-dinh).
  L.ar.rngTick = Argon.createRng(subSeed(L.seed, L.age, RNG_SUB.tick));
  L.ar.rngStory = Argon.createRng(subSeed(L.seed, L.age, RNG_SUB.story));
  L.ar.rngMoney = Argon.createRng(subSeed(L.seed, L.age, RNG_SUB.money));
}
/* Trước khi đi làm, gia đình nuôi: thu nhập hộ tính theo thu nhập gia đình */
const CHILD_JOBS = new Set(["phụ giúp việc đồng áng", "làm việc vặt"]);
function earnsOwnLiving(L) { return L.income > 0 && !CHILD_JOBS.has(L.job); }
function householdIncome(L) { return earnsOwnLiving(L) ? L.income : L.famIncome * 0.6; }
/* Khi chưa tự lập, sổ Argon là quỹ chung của cả hộ: phần của gia đình là A.hh, phần còn lại (L.savings) là tiền riêng của bạn.
   Quỹ chung: bạn tiêu quá thì nhà trả; nhà đang nợ thì tiền bạn có đi trả nợ trước. Từ năm có việc làm thật, sổ là của riêng bạn. */
function livesOnFamily(L) { return !!(L.ar && !L.ar.indep && !earnsOwnLiving(L)); }
function fundsFor(L) { return livesOnFamily(L) ? L.savings + (L.ar.hh || 0) : L.savings; }
function settleDependent(L) {
  const A = L.ar; if (!A || !A.started || A.indep) return;
  const hh = A.hh || 0, move = L.savings < 0 ? L.savings : hh < 0 ? Math.min(L.savings, -hh) : 0;
  if (!move) return;
  const dS = L.savings - A.syncedSavings; if (dS) A.state.capitals = Argon.applyDelta(A.state.capitals, { liquid: dS });
  A.hh = hh + move; L.savings -= move; A.syncedSavings = L.savings; L.debt = 0;
}

/* ---- Mỗi năm: đẩy thay đổi của trò chơi vào Argon, chạy 4 quý, lấy kết quả về ---- */
/* Thu chi của năm vừa qua, để bảng "Tiền" giải thích vì sao tiền lên xuống. Chỉ ghi sổ, không rút rng, không đổi kết quả. */
function recordFlow(L, reports, fl, net0, net1, dS) {
  const A = L.ar, rep = A.holdRep || null, dep = L.lw && L.lw.depYear && L.lw.depYear.age === L.age ? L.lw.depYear.amt : 0;
  const sum = k => reports.reduce((t, r) => t + (r[k] || 0), 0);
  const shocks = reports.reduce((t, r) => t + (r.shock ? r.shock.liquid : 0), 0);
  const rows = [
    ["Thu nhập", sum("income_received")],
    ["Sinh hoạt", -sum("survival_paid")],
    ["Lãi nợ tiêu dùng", -fl.interest],
    ["Lạm phát ăn vào tiền mặt", -fl.inflation],
    ["Ốm đau, chuyện bất ngờ", shocks],
    ["Góp tiền vay mua", rep ? -rep.loan_paid : 0],
    ["Thu từ tài sản", rep ? rep.rent : 0],
    ["Giữ tài sản, bảo hiểm", rep ? -(rep.upkeep + rep.premiums) : 0],
    ["Nuôi người thân", -dep],
    ["Lựa chọn và sự kiện trong năm", (dS || 0) + dep]
  ];
  const net = net1 - net0, known = rows.reduce((t, r) => t + r[1], 0);
  rows.push(["Chuyện khác trong năm", net - known]);
  A.lastFlow = { age: L.age, indep: !!A.indep, rows: rows.filter(r => Math.abs(r[1]) >= 1), net, principal: fl.principal, lifestyle: A.state.holdings ? A.state.holdings.lifestyle : "thoai_mai" };
  A.holdRep = null;
}
function argonYear(L) {
  argonInit(L); if (!L.ar || L.age < AR.START_AGE) return null;
  const s = L.ar.state, A = L.ar;
  if (!A.started) { A.started = true; s.capitals.bioEnergy.value = clamp(L.st.health, 10, s.capitals.bioEnergy.cap); const a0 = s.capitals.capitalAssets; a0.liquid = Math.max(0, L.savings) + (earnsOwnLiving(L) ? 0 : L.famIncome * 0.6); a0.debt += Math.max(0, -L.savings); if (L.savings < 0) L.savings = 0; A.hh = a0.liquid - a0.debt - L.savings; A.syncedHealth = L.st.health; A.syncedSavings = L.savings; }
  // Tự lập: từ năm có việc làm thật, sổ là của riêng bạn. Quỹ, nợ và nhà đất của gia đình ở lại với gia đình (thừa kế đi qua kịch bản riêng).
  if (!A.indep && earnsOwnLiving(L)) { settleDependent(L); const a = s.capitals.capitalAssets; A.indep = true; A.hh = 0; a.liquid = Math.max(0, L.savings); a.debt = Math.max(0, -L.savings); a.illiquid = s.holdings ? Argon.illiquidValue(s.holdings) : 0; A.syncedSavings = L.savings; }
  // 1. Đồng bộ các thay đổi trong năm từ phía trò chơi (sự kiện, kịch bản)
  const dH = L.st.health - A.syncedHealth, dS = L.savings - A.syncedSavings;
  const net0 = s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt; // trước khi cộng các khoản trong năm từ phía trò chơi
  if (dH || dS) s.capitals = Argon.applyDelta(s.capitals, { bio: dH, liquid: dS });
  s.capitals.capitalAssets.income_quarterly = householdIncome(L) / 4;
  // 2. Chính sách làm việc từ trọng tâm năm nay
  const work = L.focus === "work" ? "overtime" : (L.focus === "health" || L.focus === "rest") ? "recover" : "standard";
  const reports = [], fl = { interest: 0, inflation: 0, principal: 0 };
  for (let q = 0; q < 4 && !s.dead; q++) {
    { const a = s.capitals.capitalAssets, mc = s.spawn.macro; fl.interest += a.debt * mc.interest_rate / 4; fl.inflation += Math.max(0, a.liquid) * mc.inflation_rate / 4; fl.principal += a.debt * 0.05; }
    reports.push(Argon.tick(s, { work, borrow: 0, repay: A.repay || 0, betrayed: !!A.betrayedThisYear, frugal: A.frugal, purchase: 0 }, A.rngTick));
    A.betrayedThisYear = false;
  }
  A.repay = 0;
  // 2a. Của cải: tài sản lên xuống, thu chi, góp vay, người nợ mình, mức sống (money.js)
  if (!s.dead) moneyYear(L);
  // Bảo hiểm sức khỏe trả lại một phần viện phí của các cú ốm trong năm
  for (const r of reports) if (r.shock && r.shock.kind === "health" && r.shock.liquid < 0 && s.holdings && Argon.hasPolicy(s.holdings, "health")) { const p = Argon.healthPayout(s.holdings, marketCtx(L), -r.shock.liquid); s.capitals = Argon.applyDelta(s.capitals, { liquid: p }); if (!A.indep) { L.savings += p; A.syncedSavings = L.savings; } }
  // 2b. Vỡ nợ: nợ không thể lớn vô hạn. Quá 5 năm thu nhập thì chủ nợ siết, xóa bớt, và đời bạn mang dấu.
  // R30 (Tùng duyệt 19/10, ledger 2026-10-19-canon-tuning.md): "năm thu nhập" ở đây là lương gốc (seasonYearlyBase, cùng đơn vị R24 dùng cho borrow / repay),
  // không phải lương đã nhân hệ số mùa; ngoài mùa hai số bằng nhau.
  { const a = s.capitals.capitalAssets, yi = typeof seasonYearlyBase === "function" ? seasonYearlyBase(L) : Math.max(300, householdIncome(L));
    if (a.debt > 5 * yi) { a.liquid = 0; const seized = seizeOnDefault(L, 1.5 * yi); a.debt = Math.min(a.debt, 1.5 * yi); L.bankrupt = (L.bankrupt || 0) + 1; log(L, `Vỡ nợ. Chủ nợ siết ${seized.length ? seized.join(", ") : "hết những gì còn lại"}, phần nợ còn lại bị khoanh. Từ nay ai cũng biết.`, "bad big"); addSt(L, "happy", -15); addSt(L, "rel", -8); if (L.lw) { L.lw.sflags.add("bankrupt"); closeDoorNow(L, "partner_circle"); } } }
  // 3. Lấy về
  L.st.health = s.capitals.bioEnergy.value;
  L.st.bw = s.capitals.cognitiveBandwidth.value;
  if (A.indep) { L.savings = s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt; L.debt = s.capitals.capitalAssets.debt; }
  else { A.hh = s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt - L.savings; L.debt = 0; }
  A.syncedHealth = L.st.health; A.syncedSavings = L.savings;
  recordFlow(L, reports, fl, net0, s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt, dS);
  settleDependent(L);
  // 4. Ghi nhật ký những chuyển biến đáng kể
  const last = reports[reports.length - 1];
  const crisis = reports.find(r => r.awakening.phase_change);
  if (crisis) log(L, `Khủng hoảng (${crisisVN(crisis.awakening.crisis)}) làm bạn nhìn lại cuộc đời mình. Có những lựa chọn trước đây bạn không hề thấy.`, "big");
  const relapse = reports.find(r => r.awakening.relapse);
  if (relapse) log(L, "Guồng quay cũ kéo bạn về. Những lựa chọn từng thấy rõ giờ lại mờ đi.", "bad");
  const rr = reports.filter(r => r.rat_race.active).length;
  if (rr >= 3 && !A.rrLogged) { A.rrLogged = true; log(L, "Bạn đang trong vòng xoáy chuột chạy: làm bao nhiêu cũng chỉ đủ trả nợ.", "bad"); }
  if (rr === 0) A.rrLogged = false;
  for (const r of reports) if (r.shock) log(L, shockVN(r.shock), r.shock.liquid < 0 ? "bad" : "good");
  if (reports.some(r => r.macro_label === "job_loss_shock")) log(L, "Kinh tế suy thoái, bạn mất việc một thời gian.", "bad");
  if (s.dead && L.alive) { L.ar.deadByArgon = true; }
  A.lastReport = last;
  return last;
}
function crisisVN(k) { return { bio_collapse: "kiệt sức", insolvency: "vỡ nợ", betrayal: "bị phản bội", job_loss: "mất việc", chronic_scarcity: "thiếu thốn kéo dài" }[k] || k; }
function shockVN(sh) {
  const m = fmtPPP(Math.abs(sh.liquid));
  if (sh.kind === "health") return `Bạn ốm nặng, viện phí hết ${m}.`;
  if (sh.kind === "family_obligation") return `Việc nhà (cưới hỏi, ma chay, nợ của người thân) tốn ${m}.`;
  return `Một khoản tiền bất ngờ: +${m}.`;
}

/* ---- Trạng thái để giao diện gác cổng lựa chọn ---- */
function argonGate(L) {
  if (!L.ar || !L.ar.started) return { tier: "autopilot", locked: false, reason: null, bw: 100, ratRace: false, scarcity: null, agency: 0 };
  const s = L.ar.state;
  const tier = Argon.tierOf(s);
  const sc = Argon.scarcityTax(s);
  const rr = Argon.ratRace(s);
  const bw = s.capitals.cognitiveBandwidth.value;
  let reason = null;
  if (bw < Argon.BANDWIDTH_LOCK_LEVEL) reason = `Băng thông nhận thức của bạn chỉ còn ${Math.round(bw)}/100. Khi đầu óc bị lo toan ${sc.reason === "stress" ? "căng thẳng" : "tiền bạc"} chiếm hết, bạn không còn sức để tính đường dài: lựa chọn tối ưu về lâu dài vẫn ở đó, nhưng bạn không với tới được.`;
  else if (rr.active) reason = rr.reason === "debt_service" ? `Bạn đang trong vòng xoáy chuột chạy: ${Math.round(rr.debt_service_ratio * 100)}% thu nhập chỉ để trả nợ. Mọi lựa chọn cần kiên nhẫn hay chịu thiệt trước đều bị gạt sang một bên.` : "Bạn đã thiếu thốn nhiều quý liên tiếp. Cơ thể và đầu óc chỉ còn lo cho tuần tới, không lo được cho năm tới.";
  return { tier, locked: !!reason, reason, bw, ratRace: rr.active, scarcity: sc.triggered ? sc : null, agency: s.capitals.agency, s };
}
const TIER_RANK = { autopilot: 0, awakened: 1, sovereign: 2 };
/* Một lựa chọn được xử lý thế nào: "show" · "hidden" (chưa đủ tự chủ để thấy) · "locked" (thấy nhưng không với tới) */
function choiceState(L, ch, gate) {
  const need = ch.tier ? TIER_RANK[ch.tier] : 0;
  if (need > TIER_RANK[gate.tier]) return "hidden";
  if (gate.locked && (ch.longterm || need >= 1)) return "locked";
  return "show";
}

/* ---- Sương mù thông tin: ma trận hiển thị nhiễu theo băng thông, thẩm định để làm rõ ---- */
function fogMatrix(L, m, sceneKey) {
  if (!L.ar) return m;
  const A = L.ar, dd = A.dd[sceneKey];
  const bw = A.state.cognitiveBandwidth ? A.state.cognitiveBandwidth.value : A.state.capitals.cognitiveBandwidth.value;
  const amp = dd ? 0 : clamp(1 - bw / 100, 0, 1) * 0.6;
  if (!A.noise) A.noise = {};
  // Nhiễu lấy từ (hạt giống, khóa cảnh), KHÔNG rút A.rng: vẽ lại giao diện bao nhiêu lần cũng không đổi tương lai.
  if (!A.noise[sceneKey]) { const rn = makeRng(mix32(subSeed(L.seed, 0, RNG_SUB.fog) ^ strHash(sceneKey))); A.noise[sceneKey] = m.cells.map(row => row.map(() => [nrm(rn), nrm(rn)])); }
  const n = A.noise[sceneKey];
  const cells = m.cells.map((row, i) => row.map((c, j) => c.map((v, k) => amp === 0 ? v : v + Math.abs(v) * amp * n[i][j][k])));
  return { ...m, cells, fogged: amp > 0, hideOffDiag: !dd && bw < Argon.BANDWIDTH_LOCK_LEVEL };
}
function dueDiligence(L, sceneKey, cost) {
  if (!L.ar) return false;
  const s = L.ar.state;
  if (s.capitals.cognitiveBandwidth.value < cost) return false;
  s.capitals = Argon.applyDelta(s.capitals, { bandwidth: -cost });
  L.st.bw = s.capitals.cognitiveBandwidth.value;
  L.ar.dd[sceneKey] = (L.ar.dd[sceneKey] || 0) + cost;
  return true;
}

/* ---- NPC Argon cho các kịch bản có đối tác thật (hùn vốn, cho mượn tiền) ---- */
function argonNpc(L, name, role) {
  argonInit(L);
  const r = L.ar.rng;
  const arch = Argon.ALL_ARCHETYPES[Math.floor(r.next() * 5)];
  const npc = Argon.makeNpc(`${role}_${L.ar.state.npcs.size}`, name, arch, r, incomeAt(L.c, 0.5) * (0.5 + r.next()));
  L.ar.state.npcs.set(npc.id, npc);
  Argon.addNpcToGraph(L.ar.state.graph, npc, 0.3 + 0.6 * r.next(), L.ar.state.tick, 0.1);
  L.ar.npcStart.set(npc.id, npc.liquid);
  return npc;
}
function npcSignalVN(L, npc, sceneKey) {
  const belief = Argon.beliefAbout(npc, L.ar.dd[sceneKey] || 0);
  const top = Object.entries(belief).sort((a, b) => b[1] - a[1]);
  const p = Argon.predictedCoopProb(npc, belief);
  const [a1, p1] = top[0], [a2, p2] = top[1];
  return `Tín hiệu về ${npc.name}: có vẻ là người ${AR.ARCH_VN[a1][0]} (${Math.round(p1 * 100)}%), hoặc ${AR.ARCH_VN[a2][0]} (${Math.round(p2 * 100)}%). Khả năng họ hợp tác ván này: khoảng ${Math.round(p * 100)}%.`;
}
/* Cám dỗ ngắn hạn vs giá trên sổ cái, hiển thị cho mọi ván có đối tác Argon */
function temptationVN(L, npc, stake, roundsLeft) {
  const s = L.ar.state;
  const ctx = { stake: stake * s.capitals.socialLedger.transaction_cost_multiplier, institutional_trust: s.spawn.macro.institutional_trust };
  const belief = Argon.beliefAbout(npc, L.ar.dd[npc.id] || 0);
  const p = Argon.predictedCoopProb(npc, belief);
  const evC = Argon.expectedCapital("cooperate", p, ctx), evD = Argon.expectedCapital("defect", p, ctx);
  const pRecip = belief.tit_for_tat + belief.generous_tit_for_tat + belief.grudger;
  const shadow = pRecip * roundsLeft * 0.25 * ctx.stake + 8 * 0.006 * 6 * 0.25 * ctx.stake;
  const inst = s.spawn.macro.institutional_trust;
  return `<div class="tempt"><b>Cám dỗ ngay bây giờ:</b> phản bội kỳ vọng ${fmtPPP(evD)}, hợp tác kỳ vọng ${fmtPPP(evC)}${evD > evC ? ` — ở nơi pháp luật yếu (niềm tin thể chế ${Math.round(inst * 100)}%), ăn một lần quả thật có lợi hơn.` : "."}<br><b>Giá trên sổ cái:</b> mất khoảng ${fmtPPP(shadow)} từ ${roundsLeft} lần gặp lại và danh tiếng, chưa kể ${pRecip > .5 ? "người này nhiều khả năng sẽ quay lưng mãi" : "lời đồn lan tới bạn bè của họ"}.</div>`;
}
/* Một ván với NPC Argon: trả về kết quả và đồng bộ tiền về trò chơi */
function argonPlay(L, npc, move, stake, sceneKey) {
  const A = L.ar, s = A.state;
  const before = s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt;
  const dS = L.savings - A.syncedSavings; if (dS) s.capitals = Argon.applyDelta(s.capitals, { liquid: dS });
  const r = Argon.resolveInteraction(s, npc, { npc_id: npc.id, move, stake, due_diligence_spent: 0, costly_signal_spent: 0 }, A.rng);
  const after = s.capitals.capitalAssets.liquid - s.capitals.capitalAssets.debt;
  L.savings = after - (A.indep ? 0 : (A.hh || 0)); A.syncedSavings = L.savings; L.st.bw = s.capitals.cognitiveBandwidth.value;
  if (r.outcome.cell === "sucker" && -r.outcome.payoffA.capital >= 0.3 * Math.max(before, householdIncome(L))) A.betrayedThisYear = true;
  trait(L, "coop", move === "cooperate" ? 1 : move === "defect" ? -1 : 0);
  gt(L, r.outcome.payoffA.capital > 0);
  return r;
}

/* ---- Báo cáo Địa hình Cuộc đời (Phase 4) ---- */
function topologyVN(L) {
  if (!L.ar) return "";
  const T = Argon.lifeTopology(L.ar.state, L.ar.npcStart);
  const Q = { builder: ["Người kiến tạo", "Bạn vừa tự chủ, vừa để lại nhiều hơn những gì mình lấy."], extractor: ["Người bòn rút", "Bạn làm chủ cuộc đời mình, nhưng giá trị bạn có là lấy từ người khác."], sleeper: ["Người ngủ quên", "Bạn tử tế và làm lợi cho người quanh mình, nhưng chưa bao giờ thật sự tự quyết."], casualty: ["Người bị cuốn đi", "Hệ thống chơi bạn, chứ không phải bạn chơi nó."] }[T.quadrant];
  const S = T.surplus, V = T.sovereignty, R = T.ripple;
  const rows = R.rows.filter(x => x.rounds_with_player > 0).slice(0, 6).map(x => `<div class="c"><b>${escB(x.name)}</b> · ${AR.ARCH_VN[x.true_archetype][0]} · ${x.rounds_with_player} ván · ${x.capital_from_player >= 0 ? "+" : "−"}${fmtPPP(Math.abs(x.capital_from_player))} từ bạn · niềm tin ${x.trust_final >= 0 ? "+" : ""}${x.trust_final.toFixed(2)}${x.severed ? " (đã cắt đứt)" : ""} · ${{ prospered: "phát đạt", bankrupt: "phá sản", neutral: "như cũ" }[x.fate]}${x.shift !== "unchanged" ? ` · ${x.shift === "turned_hostile" ? "quay lưng với bạn" : "học được hợp tác"}` : ""}</div>`).join("");
  return `<div class="panel style"><span class="label">Địa hình cuộc đời</span><h3 style="font-size:24px">${Q[0]}</h3><p style="margin:0">${Q[1]}</p></div>
  <div class="panel"><span class="label">1 · Thặng dư hệ thống</span>
    <p style="margin:0">Các ván bạn chơi tạo ra <b>${S.net_systemic_surplus >= 0 ? "+" : "−"}${fmtPPP(Math.abs(S.net_systemic_surplus))}</b> cho cả bạn lẫn người khác (bạn ${S.player_capital_from_deals >= 0 ? "+" : "−"}${fmtPPP(Math.abs(S.player_capital_from_deals))}, người khác ${S.npc_capital_from_deals >= 0 ? "+" : "−"}${fmtPPP(Math.abs(S.npc_capital_from_deals))}), trên mức tối đa có thể là ${fmtPPP(S.potential_surplus)} nếu ván nào cũng cùng thắng: đạt <b>${Math.round(S.realisation_ratio * 100)}%</b>. Giá trị bị phá hủy hoặc rơi vào kiện tụng: ${fmtPPP(S.capital_destroyed)}.</p>
    <span class="muted mono" style="font-size:12px">${S.rounds} ván · cùng thắng ${S.cells.win_win} · bị lừa ${S.cells.sucker} · bòn rút ${S.cells.exploitation} · cùng tổn thất ${S.cells.mutual_destruction} · tái cấu trúc ${S.cells.arbitrage}</span></div>
  <div class="panel"><span class="label">2 · Mức tự chủ</span>
    <p style="margin:0">Tự chủ lúc 12 tuổi <b>${V.agency_start.toFixed(2)}</b> → cao nhất <b>${V.agency_peak.toFixed(2)}</b> → cuối đời <b>${V.agency_end.toFixed(2)}</b>. ${V.crises_survived} lần khủng hoảng làm bạn thức tỉnh${V.relapses ? `, ${V.relapses} lần guồng quay kéo bạn về` : ""}.</p>
    <div class="tiers"><i style="flex:${V.ticks_autopilot}" title="Tự lái"></i><i class="aw" style="flex:${V.ticks_awakened}" title="Thức tỉnh"></i><i class="sv" style="flex:${V.ticks_sovereign}" title="Tự chủ"></i></div>
    <span class="muted mono" style="font-size:12px">tự lái ${(V.ticks_autopilot / 4).toFixed(0)} năm · thức tỉnh ${(V.ticks_awakened / 4).toFixed(0)} năm · tự chủ ${(V.ticks_sovereign / 4).toFixed(0)} năm (${Math.round(V.sovereign_share * 100)}%) · vòng xoáy chuột chạy ${(V.ticks_rat_race / 4).toFixed(1)} năm</span></div>
  <div class="panel"><span class="label">3 · Gợn sóng trên sổ cái</span>
    <p style="margin:0">Danh tiếng cuối đời <b>${Math.round(R.reputation_final)}/100</b> · ${R.allies} đồng minh · ${R.enemies} kẻ thù · ${R.severed_edges} quan hệ cắt đứt. Vì bạn, ${R.npcs_shifted_hostile} người quay lưng, ${R.npcs_shifted_cooperative} người học được hợp tác, ${R.npcs_bankrupt} người phá sản, ${R.npcs_prospered} người phát đạt${R.npcs_reached_only_by_ripple ? `, và ${R.npcs_reached_only_by_ripple} người chưa từng gặp bạn nhưng đã nghe về bạn` : ""}.</p>
    ${rows}</div>`;
}
