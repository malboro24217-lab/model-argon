/* ================= TIỀN BẠC (host) =================
   Của cải có tên, vay mua, mức sống, tiền gửi, bảo hiểm, cho người khác vay, mức chi cho bố mẹ và con.
   Engine: Argon (economy/Holdings.ts). Spec: argon/docs/superpowers/specs/2026-10-18-tien-bac-design.md
   Mọi thay đổi tiền đi qua L.savings (tiền mặt ròng của bạn); argonYear đồng bộ sang sổ Argon như mọi hiệu ứng money khác. */

const KIND_VN = { house: "nhà", land: "đất", vehicle: "xe", shop: "cửa hàng", gold: "vàng", deposit: "tiền gửi", stake: "vốn góp" };
const SUPPORT_MULT = { it: 0.5, du: 1, hau: 1.6 };
const SUPPORT_VN = { it: "ít", du: "đủ", hau: "hậu hĩnh" };

function holdingsOf(L) { return L.ar && L.ar.state ? L.ar.state.holdings : null; }
/** Thị trường nơi đang sống (sau khi di cư thì là nước mới). Cùng công thức với argonSpawn. */
function marketCtx(L) {
  const g = L.c.g, fl = L.lw ? L.lw.sflags : new Set();
  return {
    gdp: g, median_yearly: incomeAt(L.c, 0.5), urban: fl.has("urban") || fl.has("path_city") || !!L.migrated,
    institutional_trust: clamp((Math.log10(g) - 3.2) / 1.7, 0.1, 0.9),
    interest_rate: g < 8000 ? 0.22 : g < 30000 ? 0.14 : 0.07, inflation_rate: g < 8000 ? 0.08 : 0.04
  };
}
function yearlyOf(L) { return Math.max(300, householdIncome(L)); }
function canHandleMoney(L) { return !!(L.alive && L.age >= 18 && holdingsOf(L)); }
function moneyName(L, id) { return castName(L, id); }

/** Một thao tác tiền từ thẻ hoặc từ ô gõ. e là Effect (buy/sell/lifestyle/deposit/withdraw/lend/give/insure/uninsure/support). */
function moneyEffect(L, e, npcId) {
  if (!canHandleMoney(L)) return;
  const h = holdingsOf(L), m = marketCtx(L), yearly = yearlyOf(L), s = L.ar.state;
  const npcOf = id => { const x = id || npcId; return x && s.npcs.has(x) && (!L.lw.cast.has(x) || L.lw.cast.get(x).alive) ? x : null; };
  if (e.lifestyle && Argon.LIFESTYLE_MULT[e.lifestyle] !== undefined && h.lifestyle !== e.lifestyle) {
    h.lifestyle = e.lifestyle; h.lifestyle_since = L.age; L.ar.frugal = e.lifestyle === "tan_tien";
    log(L, `Từ nay bạn sống ${Argon.LIFESTYLE_VN[e.lifestyle]}.`); stampP(L, Argon.prov.flag("lifestyle_" + e.lifestyle)); L.lw.sflags.add("lifestyle_" + e.lifestyle);
  }
  if (e.support && SUPPORT_MULT[e.support.level] && (e.support.who === "parents" || e.support.who === "kids")) {
    h.support[e.support.who] = e.support.level;
    log(L, `Bạn chi ${SUPPORT_VN[e.support.level]} cho ${e.support.who === "parents" ? "bố mẹ" : "con cái"}.`);
  }
  if (e.sell) {
    const a = Argon.findAsset(h, { name: e.sell.name, kind: e.sell.kind });
    if (a) { const r = Argon.sellAsset(h, a.id, L.age, "sold"); L.savings += r.cash;
      log(L, `Bạn bán ${a.name}${r.asset.loan > 0 ? `, trả hết ${fmtPPP(r.asset.loan)} tiền vay` : ""}, cầm về ${fmtPPP(Math.max(0, r.cash))}.`, r.cash >= a.cost ? "good" : "");
      L.lw.sflags.add("sold_" + a.kind); stampP(L, Argon.prov.flag("sold_" + a.kind)); if (!h.assets.some(x => x.kind === a.kind)) L.lw.sflags.delete("own_" + a.kind); }
  }
  if (e.withdraw > 0) { const r = Argon.withdraw(h, e.withdraw * yearly); if (r.cash > 0) { L.savings += r.cash; log(L, `Bạn rút ${fmtPPP(r.cash)} tiết kiệm.`); } }
  if (e.buy) buyFor(L, e.buy, e.buy.with_npc ? npcOf(e.buy.with_npc) : e.buy.kind === "stake" ? npcOf(null) : null);
  if (e.deposit > 0) {
    const amt = Math.min(e.deposit * yearly, Math.max(0, fundsFor(L)));
    if (amt >= 1) { L.savings += Argon.deposit(h, amt, L.age).cash; log(L, `Bạn gửi ${fmtPPP(amt)} vào sổ tiết kiệm.`); L.lw.sflags.add("own_deposit"); stampP(L, Argon.prov.flag("own_deposit")); }
    else log(L, "Bạn không có đồng nào để gửi.");
  }
  if (e.lend) {
    const id = npcOf(e.lend.npc); const amt = Math.min(e.lend.amount * yearly, Math.max(0, fundsFor(L)));
    if (!id) { /* người không còn */ }
    else if (amt < 1) log(L, `Bạn không có tiền để cho ${moneyName(L, id)} vay.`);
    else { L.savings += Argon.lend(h, id, amt, L.age, e.lend.years || 2).cash;
      Argon.addMemory(L.lw.mem, id, "HELPED_IN_CRISIS", L.age, 0.2, `bạn cho vay ${fmtPPP(amt)} năm ${L.age} tuổi`); stampP(L, Argon.prov.memory(id, "HELPED_IN_CRISIS"));
      log(L, `Bạn cho ${moneyName(L, id)} vay ${fmtPPP(amt)}, hẹn ${e.lend.years || 2} năm.`); }
  }
  if (e.give) {
    const id = npcOf(e.give.npc); const amt = Math.min(e.give.amount * yearly, Math.max(0, fundsFor(L)) + 0.5 * yearly);
    if (id && amt >= 1) { L.savings -= amt; Argon.propagate(s.graph, id, 0.1, s.tick);
      Argon.addMemory(L.lw.mem, id, "HELPED_IN_CRISIS", L.age, 0.25, `bạn cho ${fmtPPP(amt)} năm ${L.age} tuổi`); stampP(L, Argon.prov.memory(id, "HELPED_IN_CRISIS"));
      log(L, `Bạn đưa ${moneyName(L, id)} ${fmtPPP(amt)}, không đòi lại.`); }
  }
  if (e.insure && !Argon.hasPolicy(h, e.insure)) {
    h.policies.push({ kind: e.insure, since: L.age });
    const t = Argon.policyTerms(e.insure, m, yearly, Argon.netWorth(h).assets);
    log(L, `Bạn mua bảo hiểm ${e.insure === "health" ? "sức khỏe" : "tài sản"}: phí ${fmtPPP(t.premium)} mỗi năm, trả khoảng ${Math.round(t.cover * 100)}% khi có chuyện.`);
    L.lw.sflags.add("insured_" + e.insure);
  }
  if (e.uninsure && Argon.hasPolicy(h, e.uninsure)) { h.policies = h.policies.filter(p => p.kind !== e.uninsure); L.lw.sflags.delete("insured_" + e.uninsure); log(L, `Bạn bỏ bảo hiểm ${e.uninsure === "health" ? "sức khỏe" : "tài sản"}.`); }
  syncHoldingsIlliquid(L);
}

const REFUSE_VN = { khong_du_tien: "không đủ tiền trả trước", ngan_hang_tu_choi: "ngân hàng không cho vay vì tiền góp sẽ quá 40% thu nhập", gia_khong_hop_le: "giá không hợp lý" };
function buyFor(L, b, coOwner) {
  const h = holdingsOf(L), m = marketCtx(L), yearly = yearlyOf(L);
  if (!Argon.ASSET_KINDS.includes(b.kind)) return false;
  if (b.kind === "deposit") { moneyEffect(L, { deposit: b.price }); return true; }
  const name = String(b.name || Argon.defaultName(b.kind)).slice(0, 40);
  const req = { kind: b.kind, name, price: b.price * yearly, borrow: !!b.borrow, ...(coOwner ? { co_owner: coOwner } : {}) };
  const q = Argon.quoteBuy(h, req, m, fundsFor(L), yearly);
  if (!q.ok) { log(L, `Bạn định mua ${name} giá ${fmtPPP(q.price || req.price)}, nhưng ${REFUSE_VN[q.reason]}.`, "bad"); L.lw.sflags.add("buy_refused"); return false; }
  const r = Argon.buyAsset(h, req, q, m, L.age);
  L.savings += r.cash;
  log(L, `Bạn mua ${name} giá ${fmtPPP(q.price)}${q.loan > 0 ? `: trả trước ${fmtPPP(q.down)}, vay ${fmtPPP(q.loan)}, góp ${fmtPPP(q.payment)} mỗi năm` : ""}${coOwner ? `, góp chung với ${moneyName(L, coOwner)}` : ""}.`, "big");
  L.lw.sflags.add("own_" + b.kind); stampP(L, Argon.prov.flag("own_" + b.kind));
  if (b.kind === "house") { L.lw.sflags.add("home_owner"); stampP(L, Argon.prov.flag("home_owner")); }
  return true;
}
function syncHoldingsIlliquid(L) { const h = holdingsOf(L); if (h && L.ar.indep) L.ar.state.capitals.capitalAssets.illiquid = Argon.illiquidValue(h); }

/** Gọi trong argonYear sau 4 quý: tài sản lên xuống, thu chi, góp vay, nợ người khác, mức sống. Đổi trực tiếp sổ Argon (liquid). */
function moneyYear(L) {
  const h = holdingsOf(L); if (!h || L.age < 18) return;
  // Nhà của bố mẹ: chờ một năm sau khi người cuối cùng mất, để thẻ chia thừa kế (nếu có) đi trước.
  if (L.lw && L.lw.sflags.has("parent_died") && !L.lw.sflags.has("inherited_home") && ![...L.lw.cast.values()].some(m => m.alive && (m.role === "mother" || m.role === "father"))) {
    if (L.lw.counters.parents_gone_at === undefined) L.lw.counters.parents_gone_at = L.age; else if (L.age > L.lw.counters.parents_gone_at) inheritFamilyHome(L);
  }
  const s = L.ar.state, a = s.capitals.capitalAssets, m = marketCtx(L), yearly = yearlyOf(L), rng = L.ar.rng;
  const cashNow = a.liquid - a.debt;
  const rep = Argon.holdingsYear(h, m, s.economic_phase, cashNow, yearly, L.age, rng);
  let cash = rep.cash;
  for (const v of rep.revalued) log(L, `${v.name[0].toUpperCase() + v.name.slice(1)} giờ đáng ${fmtPPP(v.after)} (${v.after > v.before ? "lên" : "xuống"} từ ${fmtPPP(v.before)}).`, v.after > v.before ? "good" : "bad");
  for (const d of rep.disasters) log(L, `${d.name[0].toUpperCase() + d.name.slice(1)} gặp nạn, mất ${fmtPPP(d.loss)}${d.paid > 0 ? `; bảo hiểm trả ${fmtPPP(d.paid)}` : ""}.`, "bad");
  for (const f of rep.foreclosed) { log(L, `Hai năm không góp nổi tiền vay, ngân hàng siết ${f.name}.`, "bad big"); addSt(L, "happy", -10); L.lw.sflags.add("foreclosed"); stampP(L, Argon.prov.flag("foreclosed")); }
  if (rep.bank_failed > 0) { log(L, `Ngân hàng đổ giữa khủng hoảng. Bạn mất ${fmtPPP(rep.bank_failed)} tiền gửi.`, "bad big"); L.lw.sflags.add("bank_failed"); }
  if (!h.assets.some(x => x.kind === "house")) L.lw.sflags.delete("home_owner");
  // Xe cũ mòn hết giá trị thì bỏ đi (bán ve chai)
  for (const v of h.assets.filter(x => x.kind === "vehicle" && x.loan <= 0 && x.value < 0.03 * m.median_yearly)) { const r = Argon.sellAsset(h, v.id, L.age, "sold"); cash += r.cash; log(L, `${v.name[0].toUpperCase() + v.name.slice(1)} cũ nát, bạn bán ve chai được ${fmtPPP(Math.max(0, r.cash))}.`); }
  if (!h.assets.some(x => x.kind === "vehicle")) L.lw.sflags.delete("own_vehicle");
  // Góp vốn: người góp chung làm thật hay giấu bớt (trò chơi lặp lại, như cho vay)
  for (const st of h.assets.filter(x => x.kind === "stake")) {
    const npc = st.co_owner && s.npcs.get(st.co_owner);
    if (!npc || (L.lw.cast.has(npc.id) && !L.lw.cast.get(npc.id).alive)) { st.value *= 0.9; continue; }
    const op = Argon.opinionOf(s, L.lw.mem, npc.id), defected = npc.history.some(x => x.playerMove === "defect");
    if (rng.chance(Argon.repayChance(npc.true_archetype, op, m.institutional_trust, defected, 0))) { const div = st.value * 0.08; cash += div; st.value *= 1.04; }
    else { const lost = st.value * 0.35; st.value -= lost; log(L, `${npc.name} giấu bớt lợi nhuận. ${st.name[0].toUpperCase() + st.name.slice(1)} hụt ${fmtPPP(lost)}.`, "bad"); L.lw.counters.stake_cheated = (L.lw.counters.stake_cheated || 0) + 1; }
  }
  // Người nợ mình: đến hạn thì trả, khất, hoặc quỵt
  for (const r of h.receivables) {
    if (r.closed || r.due_age > L.age) continue;
    const npc = s.npcs.get(r.npc), alive = npc && (!L.lw.cast.has(r.npc) || L.lw.cast.get(r.npc).alive);
    const left = r.amount - r.repaid;
    if (!alive) { r.closed = true; log(L, `Món ${fmtPPP(left)} cho ${castName(L, r.npc)} vay không còn ai trả.`, "bad"); continue; }
    const op = Argon.opinionOf(s, L.lw.mem, r.npc), defected = npc.history.some(x => x.playerMove === "defect");
    const p = Argon.repayChance(npc.true_archetype, op, m.institutional_trust, defected, left / Math.max(300, m.median_yearly));
    if (rng.chance(p)) { cash += left; r.repaid = r.amount; r.closed = true; log(L, `${npc.name} trả đủ ${fmtPPP(left)} như đã hẹn.`, "good"); L.lw.counters.loans_repaid = (L.lw.counters.loans_repaid || 0) + 1; }
    else if (L.age - r.due_age >= 3) { r.closed = true; log(L, `${npc.name} quỵt món ${fmtPPP(left)}. Bạn thôi đòi.`, "bad"); L.lw.counters.loans_lost = (L.lw.counters.loans_lost || 0) + 1; L.lw.sflags.add("stiffed"); stampP(L, Argon.prov.flag("stiffed")); }
    else if (rng.chance(0.5)) { const part = left * 0.3; cash += part; r.repaid += part; if (L.age === r.due_age) log(L, `${npc.name} chỉ trả được ${fmtPPP(part)}, xin khất phần còn lại.`); }
    else if (L.age === r.due_age) log(L, `Đến hẹn, ${npc.name} chưa trả đồng nào.`, "bad");
  }
  // Mức sống: tác động phi tiền bạc
  const ly = Argon.lifestyleYear(h.lifestyle, L.age - (h.lifestyle_since || L.age), m.institutional_trust);
  if (ly.happy) addSt(L, "happy", ly.happy); if (ly.rel) addSt(L, "rel", ly.rel);
  // Mức chi cho bố mẹ: hậu hĩnh thì bố mẹ khỏe và tin hơn; ít thì ngược lại (chỉ khi bố mẹ cần)
  if (h.support.parents !== "du") for (const c of L.lw.cast.values()) {
    if (!c.alive || (c.role !== "mother" && c.role !== "father") || L.age + c.age_offset < 65 && c.health >= 40) continue;
    const up = h.support.parents === "hau"; c.health = clamp(c.health + (up ? 1.5 : -1.5), 0, 100); Argon.propagate(s.graph, c.id, up ? 0.02 : -0.03, s.tick);
  }
  if (cash) { s.capitals = Argon.applyDelta(s.capitals, { liquid: cash }); if (!L.ar.indep) { L.savings += cash; L.ar.syncedSavings = L.savings; } }
  syncHoldingsIlliquid(L);
}

/** Vỡ nợ: siết theo thứ tự (dễ bán trước, nhà sau cùng) cho đến khi nợ còn 1,5 năm thu nhập. Trả về danh sách tên món bị siết. */
function seizeOnDefault(L, target) {
  const h = holdingsOf(L), a = L.ar.state.capitals.capitalAssets; if (!h) return [];
  const need = Math.max(0, a.debt - target);
  const r = Argon.seizeForDebt(h, need, L.age);
  a.debt = Math.max(0, a.debt - Math.max(0, r.raised));
  if (r.raised < 0) a.debt -= r.raised; // món đang nợ ngân hàng nhiều hơn giá: phần thiếu thành nợ
  if (r.seized.some(x => x.kind === "house")) { L.lw.sflags.add("lost_home"); L.lw.sflags.delete("home_owner"); stampP(L, Argon.prov.flag("lost_home")); }
  syncHoldingsIlliquid(L);
  return r.seized.map(x => x.name);
}

/** Bảo hiểm sức khỏe trả lại một phần viện phí. */
function healthRefund(L, bill) { const h = holdingsOf(L); if (!h || !(bill > 0)) return 0; const p = Argon.healthPayout(h, marketCtx(L), bill); if (p > 0) { L.savings += p; log(L, `Bảo hiểm trả lại ${fmtPPP(p)} tiền viện.`, "good"); } return p; }

/** Hệ số nhân khoản người phụ thuộc theo mức chi đã chọn. */
function supportMult(L, role) { const h = holdingsOf(L); if (!h) return 1; return SUPPORT_MULT[role === "child" ? h.support.kids : h.support.parents] || 1; }

/** Các trường của cải trong FactContext. */
function moneyFacts(L) {
  const h = holdingsOf(L), m = L.ar ? marketCtx(L) : null, yearly = yearlyOf(L);
  const owns = new Set(), asset_names = {};
  const out = { owns, asset_names, assets_value: 0, loans: 0, loan_burden: 0, deposit: 0, lifestyle: "thoai_mai", lifestyle_years: 0, insured: new Set(), owed_to_me: 0, debtors_overdue: [], home_owner: false, support: { parents: "du", kids: "du" },
    price_years: { house: 10, land: 4, vehicle: 0.4, shop: 5 } };
  if (m) for (const k of ["house", "land", "vehicle", "shop"]) out.price_years[k] = Argon.basePrice(k, m) / yearly;
  if (!h) return out;
  for (const a of h.assets) { owns.add(a.kind); if (!asset_names[a.kind]) asset_names[a.kind] = a.name; }
  const nw = Argon.netWorth(h);
  Object.assign(out, { assets_value: nw.assets, loans: nw.loans, loan_burden: Argon.loanService(h) / yearly, deposit: nw.deposit, lifestyle: h.lifestyle, lifestyle_years: L.age - (h.lifestyle_since || L.age),
    owed_to_me: nw.owed_to_me, home_owner: owns.has("house"), support: { ...h.support } });
  for (const p of h.policies) out.insured.add(p.kind);
  out.debtors_overdue = h.receivables.filter(r => !r.closed && r.due_age <= L.age && L.lw && L.lw.cast.has(r.npc) && L.lw.cast.get(r.npc).alive).map(r => r.npc);
  return out;
}

/** Gói "của cải" gửi cho AI ở ô gõ. */
function moneyPacket(L) {
  const h = holdingsOf(L); if (!h) return null;
  const yi = yearlyOf(L), m = marketCtx(L);
  return {
    muc_song: Argon.LIFESTYLE_VN[h.lifestyle],
    tai_san: h.assets.map(a => ({ ten: a.name, loai: a.kind, gia_tri_nam_thu_nhap: +(a.value / yi).toFixed(2), con_no_vay: +(a.loan / yi).toFixed(2) })),
    bao_hiem: h.policies.map(p => p.kind),
    nguoi_dang_no_minh: h.receivables.filter(r => !r.closed).map(r => ({ id: r.npc, ten: castName(L, r.npc), con_lai_nam_thu_nhap: +((r.amount - r.repaid) / yi).toFixed(2), han: r.due_age })),
    chi_cho_bo_me: SUPPORT_VN[h.support.parents], chi_cho_con: SUPPORT_VN[h.support.kids],
    gia_dien_hinh_nam_thu_nhap: Object.fromEntries(["house", "land", "vehicle", "shop"].map(k => [k, +(Argon.basePrice(k, m) / yi).toFixed(2)])),
    tien_mat_rong_nam_thu_nhap: +(fundsFor(L) / yi).toFixed(2)
  };
}

/** Mục "Của cải" trong bảng bên phải (chỉ xem). Rỗng khi chưa có gì đáng kể. */
function wealthPanelHTML(L) {
  const h = holdingsOf(L); if (!h || L.age < 18) return "";
  const rows = h.assets.map(a => `<div class="st"><b>${escB(a.name)}</b><span class="r">${KIND_VN[a.kind]} · ${fmtPPP(a.value)}${a.loan > 0 ? ` · còn vay ${fmtPPP(a.loan)}` : ""}${a.co_owner ? ` · góp với ${escB(castName(L, a.co_owner))}` : ""}</span></div>`);
  const owed = h.receivables.filter(r => !r.closed).map(r => `<div class="st"><b>${escB(castName(L, r.npc))} nợ bạn ${fmtPPP(r.amount - r.repaid)}</b><span class="r">hẹn năm ${r.due_age} tuổi</span></div>`);
  const pol = h.policies.map(p => p.kind === "health" ? "sức khỏe" : "tài sản");
  const extra = [h.lifestyle !== "thoai_mai" ? `sống ${Argon.LIFESTYLE_VN[h.lifestyle]}` : "", pol.length ? `bảo hiểm ${pol.join(", ")}` : "", h.support.parents !== "du" ? `chi ${SUPPORT_VN[h.support.parents]} cho bố mẹ` : "", h.support.kids !== "du" ? `chi ${SUPPORT_VN[h.support.kids]} cho con` : ""].filter(Boolean);
  if (!rows.length && !owed.length && !extra.length) return "";
  return `<div class="st"><b>Mức sống: ${Argon.LIFESTYLE_VN[h.lifestyle]}</b>${extra.length ? `<span class="r">${extra.join(" · ")}</span>` : ""}</div>${rows.join("")}${owed.join("")}`;
}

/** Cuối đời: bạn để lại gì. */
function legacyVN(L) {
  const h = holdingsOf(L); if (!h) return "";
  const nw = Argon.netWorth(h);
  const kids = L.lw ? [...L.lw.cast.values()].filter(m => m.alive && m.role === "child").map(m => m.name) : [];
  const spouse = L.lw && castRole(L, "spouse");
  const heirs = kids.length ? kids.join(", ") : spouse && spouse.alive ? spouse.name : "nhà nước hoặc họ hàng xa";
  const list = h.assets.filter(a => a.kind !== "deposit").map(a => a.name);
  const closed = h.closed.filter(c => c.cost > 0 && c.kind !== "deposit");
  const best = closed.slice().sort((x, y) => (y.got - y.cost) - (x.got - x.cost))[0];
  const worst = closed.slice().sort((x, y) => (x.got - x.cost) - (y.got - y.cost))[0];
  const parts = [];
  if (list.length || nw.deposit > 0) parts.push(`Bạn để lại ${list.length ? list.join(", ") : ""}${list.length && nw.deposit > 0 ? " và " : ""}${nw.deposit > 0 ? `${fmtPPP(nw.deposit)} tiền gửi` : ""}${nw.loans > 0 ? `, kèm ${fmtPPP(nw.loans)} tiền vay chưa trả` : ""}, cho ${heirs}.`);
  else parts.push("Bạn không để lại tài sản nào đáng kể.");
  if (best && best.got > best.cost && best.how === "sold") parts.push(`Món lời nhất: ${best.name} (mua ${fmtPPP(best.cost)}, bán ${fmtPPP(best.got)}).`);
  if (worst && worst !== best && worst.got < worst.cost) parts.push(`Món lỗ nhất: ${worst.name} (mua ${fmtPPP(worst.cost)}, ${worst.how === "seized" ? "bị siết còn" : worst.how === "lost" ? "mất trắng," : "bán được"} ${fmtPPP(worst.got)}).`);
  const lost = L.lw && L.lw.counters.loans_lost, back = L.lw && L.lw.counters.loans_repaid;
  if (lost || back) parts.push(`Những món cho vay: ${back || 0} người trả, ${lost || 0} người quỵt.`);
  return parts.join(" ");
}

/**
 * Nhà của gia đình: khi cha mẹ đều đã mất, phần của bạn trong căn nhà cũ về tay bạn (chia đều với anh chị em còn sống).
 * Tỉ lệ gia đình có nhà theo xuất thân (giả định của trò chơi): khá giả 1 · trung lưu 0,8 · nghèo nông thôn 0,7 · nghèo thành thị 0,3.
 * Cửa "inheritance" đã đóng (bỏ mặc cha mẹ, từ chối phần…) thì không nhận gì.
 */
function inheritFamilyHome(L) {
  const h = holdingsOf(L); if (!h || L.age < 18 || !L.lw || L.lw.sflags.has("inherited_home")) return;
  if ([...L.lw.cast.values()].some(m => m.alive && (m.role === "mother" || m.role === "father"))) return;
  L.lw.sflags.add("inherited_home");
  if (L.lw.cz.doors && L.lw.cz.doors.has("inheritance")) return;
  const own = { rich: 1, middle: 0.8, poor_rural: 0.7, poor_urban: 0.3 }[L.origin] ?? 0.6;
  if (L.ar.rng.next() >= own) return;
  const sibs = [...L.lw.cast.values()].filter(m => m.alive && m.role === "sibling").length;
  const m = { ...marketCtx(L), urban: L.origin === "rich" || L.origin === "poor_urban", gdp: L.birthC.g, median_yearly: incomeAt(L.birthC, 0.5) };
  const value = Argon.basePrice("house", m) * (L.origin === "rich" ? 1.5 : 1) / (1 + sibs);
  const name = sibs ? "phần nhà của bố mẹ" : "căn nhà của bố mẹ";
  Argon.addAsset(h, "house", name, value, L.age, "inherited");
  L.lw.sflags.add("home_owner"); L.lw.sflags.add("own_house"); stampP(L, Argon.prov.flag("own_house"));
  log(L, `${sibs ? `Bạn và ${sibs} anh chị em chia nhau căn nhà cũ của bố mẹ. Phần của bạn` : "Căn nhà cũ của bố mẹ về tay bạn. Nó"} đáng khoảng ${fmtPPP(value)}.`, "big");
  syncHoldingsIlliquid(L);
}
