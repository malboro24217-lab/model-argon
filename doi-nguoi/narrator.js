/* ================= NGƯỜI KỂ CHUYỆN (AI agent sinh tình huống) =================
   AI viết tình huống; engine là trọng tài. Mỗi lựa chọn chỉ được dùng bộ hiệu ứng cố định bên dưới,
   mọi con số bị cắt ngưỡng, và AI không bao giờ được biết chiến lược thật của NPC. */
const NAR = {
  enabled: true, mode: "quick", sample: null, status: "init", // init · ready · off · busy · error
  cooldownMin: 3, cooldownMax: 6, lastErr: null, calls: 0
};
async function narratorInit() {
  try {
    if (!window.claude || !window.claude.use) { NAR.status = "off"; return; }
    const s = await window.claude.use("sample");
    NAR.sample = s; NAR.status = s ? "ready" : "off";
  } catch (e) { NAR.status = "off"; }
  if (typeof render === "function") render();
}

/* ---- Bộ từ vựng hiệu ứng mà AI được phép dùng ---- */
const FX_LIMITS = { health: 15, happy: 15, know: 12, rel: 15, bw: 20, money: 1.2, income_mult: [0.7, 1.4], trust: 0.6 };
function clampFx(fx) {
  const o = {};
  if (!fx || typeof fx !== "object") return o;
  for (const k of ["health", "happy", "know", "rel", "bw"]) if (typeof fx[k] === "number") o[k] = clamp(fx[k], -FX_LIMITS[k], FX_LIMITS[k]);
  if (typeof fx.money === "number") o.money = clamp(fx.money, -FX_LIMITS.money, FX_LIMITS.money);
  if (typeof fx.income_mult === "number") o.income_mult = clamp(fx.income_mult, FX_LIMITS.income_mult[0], FX_LIMITS.income_mult[1]);
  if (fx.trust && typeof fx.trust === "object" && typeof fx.trust.delta === "number") o.trust = { npc: String(fx.trust.npc || ""), delta: clamp(fx.trust.delta, -FX_LIMITS.trust, FX_LIMITS.trust) };
  for (const k of ["coop", "fair", "risk", "bold"]) if (typeof fx[k] === "number") o[k] = clamp(Math.round(fx[k]), -3, 3);
  if (typeof fx.log === "string") o.log = fx.log.slice(0, 220);
  if (Array.isArray(fx.flags)) o.flags = fx.flags.filter(x => typeof x === "string").map(x => x.slice(0, 40)).slice(0, 4);
  if (fx.later && typeof fx.later === "object" && typeof fx.later.note === "string") o.later = { years: clamp(Math.round(+fx.later.years || 5), 1, 30), note: fx.later.note.slice(0, 200) };
  if (fx.gamble && typeof fx.gamble === "object") o.gamble = { p: clamp(+fx.gamble.p || 0.5, 0.05, 0.95), win: clampFx(fx.gamble.win), lose: clampFx(fx.gamble.lose) };
  if (fx.game && typeof fx.game === "object" && ["cooperate", "defect", "arbitrage"].includes(fx.game.move)) o.game = { npc: String(fx.game.npc || ""), move: fx.game.move, stake_frac: clamp(+fx.game.stake_frac || 0.3, 0.05, 1) };
  return o;
}
function applyFx(L, fx, npcMap) {
  const yearly = typeof seasonYearlyBase === "function" ? seasonYearlyBase(L) : Math.max(300, householdIncome(L));   // R24
  const tone = (fx.money || 0) < 0 || (fx.health || 0) < 0 || (fx.happy || 0) < -5 ? "bad" : (fx.money || 0) > 0 || (fx.happy || 0) > 5 ? "good" : "";
  if (fx.game && L.ar) { const npc = npcMap[fx.game.npc]; if (npc) { const r = argonPlay(L, npc, fx.game.move, yearly * fx.game.stake_frac, npc.id);
      const o = r.outcome; log(L, `${fx.log || ""} → ${AR.CELL_VN[o.cell]}. ${npc.name} đã ${o.npcMove === "cooperate" ? "hợp tác" : "phản bội"}. Bạn ${o.payoffA.capital >= 0 ? "nhận" : "mất"} ${fmtPPP(Math.abs(o.payoffA.capital))}.`, o.cell === "win_win" || o.cell === "arbitrage" ? "good" : o.cell === "sucker" || o.cell === "mutual_destruction" ? "bad" : "");
      if (o.cell === "sucker" || o.cell === "exploitation") L.ar.betrayedThisYear = o.cell === "sucker"; } }
  else if (fx.log) log(L, fx.log, tone);
  if (fx.gamble) { const win = L.r() < fx.gamble.p; log(L, win ? "May mắn đứng về phía bạn." : "Lần này vận không thuận.", win ? "good" : "bad"); applyFx(L, win ? fx.gamble.win : fx.gamble.lose, npcMap); return; }
  for (const k of ["health", "happy", "know", "rel"]) if (fx[k]) addSt(L, k, fx[k]);
  if (fx.bw && L.ar) { L.ar.state.capitals = Argon.applyDelta(L.ar.state.capitals, { bandwidth: fx.bw }); L.st.bw = L.ar.state.capitals.cognitiveBandwidth.value; }
  if (fx.money) L.savings += yearly * fx.money;
  if (fx.income_mult && L.income > 0) L.income *= fx.income_mult;
  if (fx.trust && L.ar) { const npc = npcMap[fx.trust.npc]; if (npc) Argon.propagate(L.ar.state.graph, npc.id, fx.trust.delta, L.ar.state.tick); }
  for (const k of ["coop", "fair", "risk", "bold"]) if (fx[k]) trait(L, k, fx[k]);
  if (fx.flags) { L.threads = L.threads || []; for (const f of fx.flags) if (!L.threads.some(t => t.flag === f)) L.threads.push({ flag: f, age: L.age }); }
  if (fx.later) { L.threads = L.threads || []; L.threads.push({ flag: "hẹn", age: L.age, due: L.age + fx.later.years, note: fx.later.note }); }
}

/* ---- Gói trạng thái gửi cho AI (không bao giờ chứa chiến lược thật của NPC) ---- */
function statePacket(L) {
  const g = argonGate(L);
  const npcs = [];
  if (L.ar) for (const n of L.ar.state.npcs.values()) {
    const e = Argon.getEdge(L.ar.state.graph, n.id, "player");
    const seen = n.history.slice(-3).map(h => (h.npcMove === "cooperate" ? "hợp tác" : "phản bội")).join(",");
    npcs.push({ id: n.id, ten: n.name, vai: n.id.split("_")[0] === "doitac" ? "đối tác cũ" : n.id.split("_")[0] === "ban" ? "bạn thân" : n.id.split("_")[0], niem_tin: +((e ? e.trust : 0).toFixed(2)), da_thay: seen || "chưa từng chơi ván nào" });
  }
  const threads = (L.threads || []).map(t => t.due ? `hẹn ${t.due} tuổi: ${t.note}` : `${t.flag} (từ ${t.age} tuổi)`).slice(-8);
  const c = L.c;
  return {
    tuoi: L.age, gioi: L.sex === "M" ? "nam" : "nữ", ten: L.name, nuoc: c.n, noi_sinh: L.birthC.n, gdp_ppp: c.g, gia_dinh: famWord(L.fam),
    hoc: L.school.uni ? "đang học đại học" : L.school.in ? `lớp ${L.school.years}` : L.school.deg ? "có bằng đại học" : L.school.never ? "chưa từng đi học" : `học hết lớp ${L.school.years}`,
    nghe: L.retired ? "đã nghỉ hưu" : (L.job || "chưa đi làm"), thu_nhap_nam: Math.round(householdIncome(L)), tiet_kiem: Math.round(L.savings), no: Math.round(L.debt || 0),
    quy_doi: `1$ PPP ≈ ${VND_PER_PPP.toLocaleString("vi-VN")}đ`,
    hon_nhan: L.married ? `đã kết hôn với ${L.spouse}` : L.widowed ? "góa" : "độc thân", con: L.kids.filter(k => k.alive).map(k => `${k.name} ${L.age - k.born} tuổi`),
    chi_so: { suc_khoe: Math.round(L.st.health), hanh_phuc: Math.round(L.st.happy), kien_thuc: Math.round(L.st.know), quan_he: Math.round(L.st.rel), bang_thong: Math.round(g.bw) },
    tang: AR.TIER_VN[g.tier], bay_khan_hiem: !!g.scarcity, vong_xoay_no: g.ratRace, benh: L.ill ? L.ill.name : null,
    phong_cach: L.traits || {}, nhat_ky_gan_day: L.log.slice(-8).map(e => `${e.age}t: ${e.text}`), soi_day_con_treo: threads, npc: npcs,
    khai_niem_da_hoc: Object.keys(L.codex || {}).map(k => CONCEPTS[k][0])
  };
}

const NAR_RULES = `Bạn là biên kịch của một trò chơi mô phỏng cuộc đời dựa trên số liệu thực và lý thuyết trò chơi. Hãy viết MỘT tình huống mới cho nhân vật dưới đây, bằng tiếng Việt, giọng điềm tĩnh, cụ thể, không giáo điều, đúng với nước và hoàn cảnh (nghề, tiền, gia đình, các sợi dây còn treo). Ưu tiên: (1) nối tiếp một sợi dây còn treo nếu đến hạn hoặc hợp lý, (2) đưa một NPC đã có quay lại với vai mới, dựa trên niềm tin họ dành cho nhân vật, (3) nếu không thì tạo tình huống mới có cấu trúc lý thuyết trò chơi (song đề tù nhân, tối hậu thư, săn hươu, của cải chung, lòng tin, tín hiệu, chiến tranh tiêu hao, BATNA, gà, hàng hóa công, người tình nguyện, lời nguyền người thắng). Không lặp lại tình huống trong nhật ký. Lựa chọn phải có đánh đổi thật: cái lợi trước mắt và cái giá về sau.

Trả lời CHỈ bằng một object JSON đúng dạng sau, không có chữ nào khác:
{"title":"≤60 ký tự","text":"2–4 câu kể tình huống","concept":"một trong: pd,ultimatum,stag,commons,trust,signal,attrition,batna,chicken,public,volunteer,winner,hawkdove,bos,ev,nash hoặc null",
 "npc":{"id":"id của NPC đã có"} hoặc {"new":{"ten":"tên theo văn hóa nước đó","vai":"vai trò"}} hoặc null,
 "matrix": null hoặc {"me":["nước đi A","nước đi B"],"them":["nước đi A","nước đi B"],"cells":[[[a,b],[c,d]],[[e,f],[g,h]]],"unit":"$ PPP"} (mỗi ô: [bạn, họ]; chỉ dùng khi có đối thủ thật),
 "choices":[ 2 đến 4 lựa chọn, mỗi cái {"label":"≤40 ký tự","hint":"≤70 ký tự, nói rõ đánh đổi","tier":null|"awakened"|"sovereign","longterm":true|false,"fx":{...}} ],
 "def": chỉ số lựa chọn mặc định (0-based)}
fx là object chỉ gồm các khóa sau (bỏ qua khóa không dùng): health, happy, know, rel (−15..15); bw (−20..20, băng thông nhận thức); money (−1.2..1.2, tính theo TỶ LỆ thu nhập một năm, ví dụ −0.3 là mất 30% thu nhập năm); income_mult (0.7..1.4, nhân vào thu nhập về sau); trust {"npc":id,"delta":−0.6..0.6}; coop, fair, risk, bold (−3..3, tính cách); log "một câu kể kết quả"; flags ["cờ ngắn để nhớ về sau"]; later {"years":n,"note":"điều sẽ quay lại sau n năm"}; gamble {"p":xác suất thắng,"win":{fx},"lose":{fx}} cho lựa chọn may rủi; game {"npc":id,"move":"cooperate"|"defect"|"arbitrage","stake_frac":0.05..1} để engine tự phân xử một ván với NPC đó (KHÔNG tự gán kết quả khi dùng game; chỉ dùng npc.id có thật hoặc NPC mới ở trường npc).
Quy tắc: tier "sovereign" dành cho lựa chọn thứ ba thoát khỏi khung thắng-thua (viết luật mới, ký quỹ, liên minh, bỏ đi với phương án thay thế); tier "awakened" cho lựa chọn cần nhìn xa hơn tháng tới; longterm true cho lựa chọn chịu thiệt trước lợi sau. Ít nhất một lựa chọn có fx.later hoặc fx.flags để câu chuyện quay lại sau này. Nếu nhân vật dưới 12 tuổi: không dùng game, trust, matrix, money; viết chuyện tuổi thơ (gia đình, trường, bạn bè) với fx về chỉ số và flags.`;

function sceneFromAi(L, raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.choices) || raw.choices.length < 2) return null;
  const npcMap = {}; if (L.ar) for (const n of L.ar.state.npcs.values()) npcMap[n.id] = n;
  let npc = null;
  if (raw.npc && raw.npc.id && npcMap[raw.npc.id]) npc = npcMap[raw.npc.id];
  else if (raw.npc && raw.npc.new && L.ar) { npc = argonNpc(L, String(raw.npc.new.ten || anyName(L)).slice(0, 30), String(raw.npc.new.vai || "nguoi").replace(/\s+/g, "_").slice(0, 16)); npcMap[npc.id] = npc; }
  const choices = raw.choices.slice(0, 4).map(c => {
    const fx = clampFx(c.fx); if (fx.game) fx.game.npc = npc ? npc.id : fx.game.npc; if (fx.trust && npc && !npcMap[fx.trust.npc]) fx.trust.npc = npc.id;
    const ch = { label: String(c.label || "…").slice(0, 48), hint: String(c.hint || "").slice(0, 80), fx: L2 => applyFx(L2, fx, npcMap) };
    if (c.tier === "awakened" || c.tier === "sovereign") ch.tier = c.tier; if (c.longterm) ch.longterm = true; return ch;
  });
  if (!choices.every(c => c.label)) return null;
  let matrix = null;
  if (raw.matrix && Array.isArray(raw.matrix.cells) && raw.matrix.cells.length === 2 && npc) {
    const ok = raw.matrix.cells.every(r => Array.isArray(r) && r.length === 2 && r.every(x => Array.isArray(x) && x.length === 2 && x.every(v => typeof v === "number")));
    if (ok) matrix = { who: npc.name, me: (raw.matrix.me || ["A", "B"]).slice(0, 2).map(String), them: (raw.matrix.them || ["A", "B"]).slice(0, 2).map(String), cells: raw.matrix.cells, unit: String(raw.matrix.unit || "$ PPP") };
  }
  const concept = raw.concept && CONCEPTS[raw.concept] ? raw.concept : null;
  const def = clamp(Math.round(+raw.def || 0), 0, choices.length - 1);
  return { id: "ai", ai: true, key: "ai" + L.age, title: String(raw.title || "Một chuyện xảy ra").slice(0, 70), text: String(raw.text || "").slice(0, 600), choices, def, matrix, npc, fog: !!matrix, concept, tempt: npc && matrix ? { stake: Math.max(300, householdIncome(L)) * 0.3, roundsLeft: 2 } : null };
}

/* ---- Đạo diễn: quyết định khi nào xin tình huống mới, sinh trước một năm ---- */
function narratorPlan(L) {
  if (!NAR.enabled || NAR.status !== "ready" || !L.alive) return;
  if (L.age < 6) return;
  if (L.nextAi == null) L.nextAi = L.age + 1 + Math.floor(aiRand(L) * 2);
  const due = (L.threads || []).find(t => t.due && t.due <= L.age + 1);
  if (due && L.nextAi > L.age + 1) L.nextAi = L.age + 1;
  if (L.age === L.nextAi - 1 && !L.aiPending && !L.aiReady) narratorFetch(L);
}
async function narratorFetch(L) {
  L.aiPending = true; NAR.status = "busy"; if (typeof render === "function") render();
  const packet = JSON.stringify(statePacket(L));
  try {
    NAR.calls++;
    const raw = await NAR.sample.json(NAR_RULES + "\n\nNHÂN VẬT:\n" + packet, { modelTier: NAR.mode === "deep" ? "default" : "quick", cache: false });
    // Chỉ giữ JSON thô. Dựng cảnh (tạo người mới, rút rng) để đến lúc trình diễn, trong stepYear, cho tua lại khớp.
    if (aiRawOk(raw)) L.aiReady = { raw: JSON.parse(JSON.stringify(raw)) }; else NAR.lastErr = "Tình huống AI không hợp lệ, dùng kịch bản sẵn.";
    NAR.status = "ready";
  } catch (e) {
    NAR.lastErr = e && e.code ? e.code : "lỗi";
    NAR.status = (e && (e.code === "not_granted" || e.code === "sampling_disabled" || e.code === "not_declared")) ? "off" : "ready";
    if (e && e.code === "rate_limited") NAR.cooldownMin = 5;
  }
  L.aiPending = false; if (typeof render === "function") render();
}
/** Số ngẫu nhiên cho nhịp gọi AI: rút từ (hạt giống, tuổi), không dùng Math.random và không đụng các luồng mô phỏng. */
function aiRand(L) { return makeRng(subSeed(L.seed, L.age, RNG_SUB.ai))(); }
function aiRawOk(raw) { return !!raw && typeof raw === "object" && Array.isArray(raw.choices) && raw.choices.length >= 2; }
/* Gọi từ livingYear: nếu có tình huống AI đã sẵn sàng và đến hạn thì trình diễn.
   Đời thật: lấy JSON AI đã viết, ghi nguyên văn vào actLog (kind "ai"). Bản tua lại: lấy bản ghi cùng tuổi, không gọi AI. */
function narratorPresent(L) {
  if (L.pending) return false;
  let raw;
  if (L.replay) { const rec = (L.replayActs || []).find(a => a.kind === "ai" && a.age === L.age); if (!rec) return false; raw = rec.raw; }
  else { if (!L.aiReady || L.age < (L.nextAi || 0)) return false; raw = L.aiReady.raw; L.aiReady = null; }
  const sc = sceneFromAi(L, raw);
  if (!sc) return false;
  if (!L.replay) { L.actLog = L.actLog || []; L.actLog.push({ age: L.age, kind: "ai", key: sc.key, raw }); }
  if (sc.concept) learn(L, sc.concept);
  L.threads = (L.threads || []).filter(t => !(t.due && t.due <= L.age));
  L.nextAi = L.age + NAR.cooldownMin + Math.floor(aiRand(L) * (NAR.cooldownMax - NAR.cooldownMin + 1));
  scene(L, sc); return true;
}
/* Nếu đến hạn mà AI chưa viết xong thì đồng hồ chờ (giao diện hiện "đang viết") */
function narratorWaiting(L) { return NAR.enabled && NAR.status !== "off" && L.aiPending && L.age >= (L.nextAi || 0) - 1 && !L.pending; }

/* ---- Lời cuối đời ---- */
async function narratorEpilogue(L, el) {
  if (!NAR.enabled || !NAR.sample || NAR.status === "off") return;
  el.textContent = "Đang viết lời cuối…";
  const T = L.ar ? Argon.lifeTopology(L.ar.state, L.ar.npcStart) : null;
  const ps = playStyle(L);
  const p = `Viết lời cuối đời (3 đoạn ngắn, tiếng Việt, ngôi thứ hai "bạn", giọng điềm tĩnh, không khuyên răn, không liệt kê số) cho nhân vật trong trò chơi mô phỏng cuộc đời này. Đoạn 1: cuộc đời đã sống. Đoạn 2: những ván bạn đã chơi với người khác và điều họ nhớ về bạn. Đoạn 3: nếu bạn được sinh ra lần nữa.\n\nDỮ LIỆU: ${JSON.stringify({ ten: L.name, nuoc: L.birthC.n, song_o: L.c.n, tuoi: L.age, mat_vi: L.cause, phong_cach: ps.name, nhat_ky: L.log.filter(e => e.tone && e.tone.includes("big")).slice(-14).map(e => e.age + "t: " + e.text), dia_hinh: T ? { nhom: T.quadrant, thang_du: Math.round(T.surplus.net_systemic_surplus), tu_chu: T.sovereignty, gon_song: { quay_lung: T.ripple.npcs_shifted_hostile, hop_tac: T.ripple.npcs_shifted_cooperative, pha_san: T.ripple.npcs_bankrupt, phat_dat: T.ripple.npcs_prospered, danh_tieng: Math.round(T.ripple.reputation_final) } } : null })}`;
  try { const { text } = await NAR.sample(p, { modelTier: NAR.mode === "deep" ? "default" : "quick", onText: ({ text }) => { el.textContent = text; } }); el.textContent = text; }
  catch (e) { el.textContent = e && e.text ? e.text : ""; }
}
