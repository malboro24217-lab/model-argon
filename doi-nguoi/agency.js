/* ================= Ô "TÔI MUỐN…" =================
   Người chơi gõ tự do; AI toàn quyền viết kết quả; engine (Argon.sanitizeAct) kẹp trần.
   Spec: argon/docs/superpowers/specs/2026-10-17-tu-quyet-design.md */

/* ---- Việc lớn: điều kiện và ánh xạ sang hiệu ứng host ---- */
function bigActionOk(L, a) {
  if (!a || !L.alive) return false;
  const x = L.age, fl = L.lw ? L.lw.sflags : new Set();
  switch (a.loai) {
    case "doi_nghe": return x >= 16 && FAM[a.gia_tri] !== undefined;
    case "mat_viec": return !!L.job && !L.retired;
    case "vay": return x >= 18;
    case "tra_no": case "co_cau_no": return (L.debt || 0) > 0;
    case "di_nuoc_ngoai": return x >= 18 && x <= 50 && !L.migrated;
    case "ve_que": return !!L.migrated || fl.has("left_home") || fl.has("path_migrant");
    case "chuyen_thanh_pho": return x >= 16 && !fl.has("path_city");
    case "di_hoc": return x >= 16 && x <= 45 && !L.school.in && !L.school.uni && !(L.lw && L.lw.studying);
    case "ket_hon": return x >= 18 && !L.married;
    case "ly_hon": return !!L.married;
    case "co_con": { const fAge = L.sex === "F" ? x : x - 3; return !!L.married && fAge >= 18 && fAge <= 44; }
    case "nghi_huu": return x >= 50 && !L.retired && !!L.job;
    case "xin_loi": return true;
    case "mua": case "ban": case "muc_song": case "gui_tiet_kiem": case "rut_tiet_kiem": case "bao_hiem": case "bo_bao_hiem": case "chu_cap": return x >= 18 && !!holdingsOf(L);
    case "cho_vay": case "cho_tien": { const m = L.lw && L.lw.cast.get(a.id); return x >= 18 && !!holdingsOf(L) && !!m && m.alive; }
    case "theo_duong": { const d = Argon.PATHS[a.gia_tri]; return !!d && x >= d.ages[0] && x <= d.ages[1] + 5 && !fl.has("life_" + d.id); }
  }
  return false;
}
function bigActionToCustom(a) {
  switch (a.loai) {
    case "doi_nghe": return "job_switch:" + a.gia_tri;
    case "mat_viec": return "job_lose";
    case "vay": return "borrow:" + a.gia_tri;
    case "tra_no": return "repay:" + a.gia_tri;
    case "co_cau_no": return "restructure";
    case "di_nuoc_ngoai": return "migrate_now";
    case "ve_que": return "return_home";
    case "chuyen_thanh_pho": return "move_city";
    case "di_hoc": return "study";
    case "ket_hon": { const n = String(a.gia_tri || "").replace(/[|:]/g, "").trim(); return "marry" + (n ? ":" + n : ""); }
    case "ly_hon": return "spouse_leave";
    case "co_con": return "have_child";
    case "nghi_huu": return "retire";
    case "xin_loi": return "apologize";
    case "theo_duong": return "become:" + a.gia_tri;
  }
  return "";
}

/* ---- Luật cho AI (spec §4.3) ---- */
const AGENCY_RULES = `Bạn là người kể chuyện và trọng tài của một trò chơi mô phỏng cuộc đời dựa trên số liệu thật. Người chơi vừa gõ điều họ muốn làm ("cau_go"). Bạn quyết định chuyện gì xảy ra.
LUẬT:
- Viết tiếng Việt, ngôi thứ hai "bạn", 2–4 câu, điềm tĩnh, cụ thể, đúng với nước, thu nhập, tuổi, sức khỏe, nợ của nhân vật. Không giáo điều.
- Tỉ lệ thành công theo đời thật của nước đó và hoàn cảnh đó (vd quán ăn mới mở phần lớn đóng cửa trong 3 năm). "thanh" KHÔNG phải mặc định. Nghèo, nợ, kiệt sức (kiet_suc) hay đã làm nhiều việc trong năm (nam_nay_da_lam) thì kết quả kém đi; lặp lại một việc thì hiệu quả giảm dần.
- Người chơi chỉ quyết việc MÌNH làm, không quyết kết quả hay hành động của người khác. "Tôi trúng xổ số" = mua vé số; trúng hay không do bạn quyết theo tỉ lệ thật.
- Việc bất khả thi → ket_qua "khong_lam_duoc", kể vì sao.
- Việc phạm pháp hay bạo lực → kể hậu quả thật (bị phát hiện, mất danh tiếng, tòa án, người thân mất lòng tin), không mô tả cách làm. Không nội dung tình dục.
- Bạn không thể giết nhân vật trực tiếp; chỉ trừ sức khỏe.
- Người cũ: dùng đúng "id" trong nguoi_than. Người mới: "moi": {"ten","vai"} (tối đa 1).
- Chỉ dùng cờ trong co_cho_phep và việc lớn trong viec_lon_cho_phep. Muốn đổi nghề, đi nước ngoài, cưới, ly hôn, đi tu, thành ca sĩ… thì phải dùng viec_lon.
- Việc dùng tiền có tên (mua/bán nhà, xe, đất, vàng; gửi/rút tiết kiệm; đổi mức sống; bảo hiểm; cho vay, cho tiền; chu cấp bố mẹ/con) PHẢI đi qua viec_lon (mua, ban, muc_song, gui_tiet_kiem, rut_tiet_kiem, bao_hiem, bo_bao_hiem, cho_vay, cho_tien, chu_cap), KHÔNG ghi vào chi_so.money. Đọc cua_cai: không đủ tien_mat_rong thì chỉ mua được nếu vay (vay=true) và ngân hàng chấp nhận; giá lấy quanh gia_dien_hinh_nam_thu_nhap. Mua thứ quá sức (vd siêu xe khi nghèo) → ket_qua "khong_lam_duoc". Chỉ bán món có trong cua_cai.tai_san. Việc tiền dùng trường riêng thay cho gia_tri, vd {"loai":"mua","tai_san":"house","ten":"căn hộ hai phòng","so":9,"vay":true} hoặc {"loai":"cho_vay","id":"cast_...","so":0.5,"nam":2}.
- money tính theo SỐ NĂM thu nhập hộ (vd -0.3 = mất 3,6 tháng thu nhập). Dưới 12 tuổi: không tiền, không đổi lòng tin.
- Nếu việc này sẽ còn chuyện về sau (mở quán, yêu ai đó, kiện tụng…), mở "chuyen" với hen_nam 1–5.
- Nếu tinh_huong_dang_cho.la_chuyen_dang_do: trả "chuyen" {"ten","tom_tat","hen_nam"} nếu chuyện còn tiếp, hoặc "chuyen": null nếu cách xử lý này khép chuyện lại.
- Nếu đang có tinh_huong_dang_cho: câu gõ là cách người chơi xử lý tình huống đó. Nếu tình huống có "can_chon": true thì BẮT BUỘC trả "chon" = chỉ số nút gần nhất với cách xử lý (0-based).
CHỈ TRẢ VỀ JSON đúng khuôn:
{"ke":"...","ket_qua":"thanh|nua_voi|hong|khong_lam_duoc","chi_so":{"money":0,"health":0,"happy":0,"know":0,"rel":0,"bw":0,"income_mult":1,"agency":0},
 "nguoi":[{"id":"cast_...","tin":0.1,"nho":"chuyện cụ thể để người đó nhớ","phan_ung":"một câu phản ứng"}],
 "co":[],"bo_co":[],"viec_lon":[{"loai":"...","gia_tri":"..."}],"thoi_quen":{},"bi_mat":null,"chuyen":null,"chon":null}`;

/* ---- Gói bối cảnh gửi AI ---- */
function isFreeScene(p) { return !!p && (p.ai || p.story || p.choices.some(c => c._fx)); }
function actPacket(L, text) {
  const pk = statePacket(L);
  pk.nguoi_than = [...L.lw.cast.values()].filter(m => m.alive).map(m => ({ id: m.id, ten: m.name, vai: roleVN(m), tuoi: L.age + m.age_offset, tin: +(Argon.opinionOf(L.ar.state, L.lw.mem, m.id)).toFixed(2) })).slice(0, 14);
  pk.chuyen_dang_do = (L.stories || []).filter(s => !s.closed).map(s => ({ ten: s.title, tom_tat: s.summary, chang: s.stage }));
  const ty = L.actsThisYear && L.actsThisYear.age === L.age ? L.actsThisYear : { texts: [] };
  pk.nam_nay_da_lam = ty.texts.slice(-8);
  const bw = L.ar.state.capitals.cognitiveBandwidth.value; pk.suc_luc = Math.round(bw); pk.kiet_suc = bw < 30;
  if (L.pending) pk.tinh_huong_dang_cho = { tieu_de: L.pending.title, noi_dung: String(L.pending.text || "").slice(0, 500), nut: L.pending.choices.map(c => c.label), can_chon: !isFreeScene(L.pending), la_chuyen_dang_do: !!L.pending.story };
  pk.co_cho_phep = Argon.ALLOWED_FLAGS;
  pk.viec_lon_cho_phep = Argon.BIG_ACTIONS;
  pk.cua_cai = moneyPacket(L);
  pk.con_duong = Argon.PATH_LIST.map(d => d.id + ": " + d.vn).join("; ");
  pk.cau_go = text;
  return pk;
}

/* ---- Áp một kết quả đã làm sạch ---- */
const VAI_ROLE = [[/đối tác|doi_tac|partner|cộng sự|cong_su/i, "partner"], [/kẻ thù|ke_thu|đối thủ|doi_thu|rival|enemy/i, "rival"], [/thầy|thay|mentor|người dạy/i, "mentor"],
  [/chủ nợ|chu_no|creditor/i, "creditor"], [/cán bộ|can_bo|official|quan chức/i, "official"], [/sếp|sep|boss|chủ/i, "first_boss"], [/hàng xóm|hang_xom|neighbor/i, "neighbor"]];
function roleOfVai(vai, tin) { for (const [re, r] of VAI_ROLE) if (re.test(vai)) return r; return tin < 0 ? "rival" : "partner"; }
function actToEffect(a) {
  const e = {}; const cs = a.chi_so || {};
  for (const k of ["health", "happy", "know", "rel", "bw", "money", "income_mult", "agency"]) if (cs[k] !== undefined) e[k] = cs[k];
  if (a.co && a.co.length) e.flags = a.co.slice(); if (a.bo_co && a.bo_co.length) e.unflags = a.bo_co.slice();
  if (a.thoi_quen && Object.keys(a.thoi_quen).length) e.counters = { ...a.thoi_quen };
  if (a.bi_mat) e.secret = { tag: a.bi_mat.loai, severity: a.bi_mat.nang, fuse_years: [a.bi_mat.fuse, a.bi_mat.fuse + 3], note: a.bi_mat.ghi };
  return e;
}
function applyPeople(L, people) {
  const out = [];
  for (const p of people || []) {
    let id = p.id;
    if (!id && p.moi) { const m = Argon.addCastMember(L.ar.state, L.lw.cast, L.ar.rng, roleOfVai(p.moi.vai, p.tin), p.moi.ten, Math.round(nrm(L.r) * 6), 0.5); id = m.id; }
    const m = id && L.lw.cast.get(id); if (!m || !m.alive) continue;
    const e = {};
    if (p.tin) e.trust = { npc: id, delta: p.tin };
    if (p.nho && Math.abs(p.tin) >= 0.05) e.memory = { npc: id, tag: p.tin > 0 ? "KEPT_PROMISE" : "REFUSED_HELP", weight: p.tin * 0.6, note: p.nho };
    applyEffect(L, e, id);
    if (p.phan_ung) out.push(`${m.name}: ${p.phan_ung}`);
  }
  return out;
}
function applyBig(L, list) {
  for (const a of list || []) {
    if (bigActionOk(L, a)) { if (Argon.isMoneyAction(a)) { const e = Argon.moneyActionEffect(a); if (e) applyEffect(L, e); } else customEffect(L, bigActionToCustom(a)); }
    else log(L, `(Việc "${Argon.BIG_ACTIONS[a.loai].split(" —")[0]}" chưa thể xảy ra lúc này.)`);
  }
}
function statSnap(L) { return { health: L.st.health, happy: L.st.happy, know: L.st.know, rel: L.st.rel, savings: L.savings, income: L.income }; }
function statDeltas(a, b) { const d = {}; for (const k in a) { const v = b[k] - a[k]; if (Math.abs(v) >= (k === "savings" || k === "income" ? 1 : 0.5)) d[k] = Math.round(v); } return d; }
const OUTCOME_VN = { thanh: "Thành", nua_voi: "Nửa vời", hong: "Hỏng", khong_lam_duoc: "Không làm được" };

/** Áp một việc gõ đã làm sạch (đồng bộ — dùng cả khi tua lại đời). kind: "proactive" | "scene". */
function applyAct(L, act, kind, text, chon, forcedSeq) {
  const before = statSnap(L);
  if (!L.actsThisYear || L.actsThisYear.age !== L.age) L.actsThisYear = { age: L.age, n: 0, texts: [] };
  L.actsThisYear.n++; L.actsThisYear.texts.push(text);
  const seq = forcedSeq !== undefined ? forcedSeq : (L.actSeq = (L.actSeq || 0) + 1);
  if (forcedSeq !== undefined) L.actSeq = Math.max(L.actSeq || 0, forcedSeq);
  const p = kind === "scene" ? L.pending : { id: "tu_quyet", key: `act@${L.age}#${seq}`, title: "Tự quyết", text: "", choices: [{ label: "Không làm gì" }], npc: null };
  const engineScene = kind === "scene" && !isFreeScene(p);
  L.pending = null;
  const mark = markChoice(L, p, -1, text);
  try {
    log(L, act.ke, act.ket_qua === "thanh" ? "good" : act.ket_qua === "hong" || act.ket_qua === "khong_lam_duoc" ? "bad" : "");
    // Trần theo năm cho phần được lợi: thu nhập tối đa ×2, tiền tối đa +3 năm thu nhập, dù gõ bao nhiêu lần.
    const y = L.actsThisYear; y.mult = y.mult || 1; y.money = y.money || 0;
    const eff = actToEffect(act);
    if (eff.income_mult > 1) { eff.income_mult = Math.max(1, Math.min(eff.income_mult, 2 / y.mult)); y.mult *= eff.income_mult; }
    if (eff.money > 0) { eff.money = Math.max(0, Math.min(eff.money, 3 - y.money)); y.money += eff.money; }
    applyEffect(L, eff, p.npc ? p.npc.id : undefined);
    applyEffect(L, { bw: -Argon.bwCost(L.actsThisYear.n) });
    const reactions = applyPeople(L, act.nguoi);
    if (L.alive) applyBig(L, act.viec_lon);
    let story = null;
    const inStory = kind === "scene" && p.story && (L.stories || []).find(s => s.id === p.story);
    if (inStory) {
      const stage = +(String(p.key).split("#")[1]) || inStory.stage + 1;
      advanceStory(L, inStory, stage, act.ke, text, act.chuyen ? { hen_nam: act.chuyen.hen_nam, tom_tat: act.chuyen.tom_tat } : null, act.chuyen ? null : "Chuyện khép lại theo cách của bạn.");
      if (!inStory.closed) story = inStory.title;
    } else if (act.chuyen && L.alive) {
      L.stories = L.stories || [];
      const st = { id: "st" + seq, title: act.chuyen.ten, summary: act.chuyen.tom_tat, openedAge: L.age, nextAge: L.age + act.chuyen.hen_nam, stage: 0,
        log: [{ age: L.age, text: act.ke, choice: text }], people: (act.nguoi || []).map(x => x.id).filter(Boolean), originMark: mark ? mark.id : null, closed: false, failures: 0 };
      L.stories.push(st); story = st.title;
    }
    L.actLog = L.actLog || [];
    L.actLog.push({ age: L.age, seq, kind, key: mark ? mark.key : p.key, text, result: act, chon: engineScene ? chon : null });
    if (engineScene) { const k = chon !== null && chon !== undefined && p.choices[chon] ? chon : p.def; L.curMark = mark; L.pending = null; const ch = p.choices[k]; if (ch && ch.fx) ch.fx(L); else resolveCore(L, p, k, L.r, L.c); }
    return { text: act.ke, outcome: act.ket_qua, outcomeVN: OUTCOME_VN[act.ket_qua], deltas: statDeltas(before, statSnap(L)), reactions: reactions.slice(0, 3), story };
  } finally { L.curMark = null; if (kind === "scene") { if (p.story) nextStory(L); livingFollowUp(L); } }
}

/* ---- Gọi AI: timeout 20 giây, thử lại 1 lần ---- */
const AGENCY_TIMEOUT = 20000;
function withTimeout(pr, ms) { return Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
async function agencyAct(L, text, sample) {
  sample = sample || NAR.sample;
  text = String(text || "").trim().slice(0, 200);
  if (!text || !L.alive) return { ok: false, error: "Chưa có gì để làm." };
  if (!sample) return { ok: false, error: "Người kể chuyện chưa trả lời — thử lại" };
  const castIds = new Set([...L.lw.cast.values()].filter(m => m.alive).map(m => m.id));
  const p0 = L.pending;
  const prompt = AGENCY_RULES + "\n\nBỐI CẢNH:\n" + JSON.stringify(actPacket(L, text));
  let act = null, raw = null;
  for (let attempt = 0; attempt < 2 && !act; attempt++) {
    try { raw = await withTimeout(sample.json(prompt, { modelTier: "default", cache: false }), AGENCY_TIMEOUT); act = Argon.sanitizeAct(raw, castIds, L.age); }
    catch (e) {
      act = null;
      // Bị từ chối quyền dùng Claude (hoặc tài khoản tắt / trang không khai báo): không thử lại, báo cho giao diện là AI chưa có.
      if (e && (e.code === "not_granted" || e.code === "sampling_disabled" || e.code === "not_declared")) { NAR.status = "off"; return { ok: false, off: true, error: "Trang chưa được phép dùng Claude." }; }
      /* thử lại */
    }
  }
  if (!act) return { ok: false, error: "Người kể chuyện chưa trả lời — thử lại" };
  if (!L.alive) return { ok: false, error: "Đời đã khép lại." };
  if (L.pending !== p0) return { ok: false, error: "Tình huống đã đổi trong lúc chờ — gõ lại nhé." };
  const chon = raw && Number.isInteger(raw.chon) ? raw.chon : null;
  return { ok: true, card: applyAct(L, act, L.pending ? "scene" : "proactive", text, chon) };
}

/* ================= CHUYỆN ĐANG DỞ ================= */
/** Gọi trong lifeEvents (đồng bộ): chọn tối đa 2 chuyện đến hẹn năm nay, lùi phần còn lại sang năm sau. */
function storyCheck(L) {
  if (!L.stories || !L.stories.length || L.pending || L.storyDue) return;
  const due = Argon.dueStories(L.stories, L.age);
  for (const s of L.stories) if (!s.closed && s.nextAge <= L.age && !due.includes(s)) s.nextAge = L.age + 1;
  L.storyQueue = due.slice(1).map(s => s.id);
  L.storyDue = due[0] || null;
  if (L.storyDue && L.replay) storyReplay(L);
}
function nextStory(L) {
  L.storyDue = null;
  while (L.storyQueue && L.storyQueue.length && !L.pending) {
    const s = L.stories.find(x => x.id === L.storyQueue.shift());
    if (s && !s.closed && s.nextAge <= L.age) { L.storyDue = s; if (L.replay) storyReplay(L); return; }
  }
}
function storyFail(L, story) {
  story.failures++; story.nextAge = L.age + 1;
  if (story.failures >= 3) { story.closed = true; log(L, `Chuyện "${story.title}" chìm dần, không ai nhắc lại nữa.`); }
  nextStory(L);
}
function sceneFromStory(L, story, sc, stage) {
  return { id: "story", story: story.id, key: `story:${story.id}#${stage}`, title: sc.title, text: sc.text, def: sc.def, npc: null,
    choices: sc.choices.map(c => ({ label: c.label, hint: c.hint, fx: L2 => applyStoryChoice(L2, story.id, c, stage) })) };
}
function advanceStory(L, story, stage, text, choiceLabel, tiep, ket) {
  story.stage = stage; story.log.push({ age: L.age, text, choice: choiceLabel });
  if (ket || stage >= Argon.MAX_STORY_STAGES) { story.closed = true; if (ket) log(L, ket); }
  else { story.nextAge = L.age + (tiep ? tiep.hen_nam : 2); if (tiep && tiep.tom_tat) story.summary = tiep.tom_tat; }
}
function applyStoryChoice(L, storyId, c, stage) {
  const story = (L.stories || []).find(s => s.id === storyId); if (!story) return;
  if (c.log) log(L, c.log);
  applyEffect(L, actToEffect(c));
  applyPeople(L, c.nguoi); applyBig(L, c.viec_lon);
  advanceStory(L, story, stage, c.log || c.label, c.label, c.tiep, c.ket);
  nextStory(L);
}
function storyPacket(L, story) {
  const pk = actPacket(L, "");
  delete pk.cau_go; delete pk.tinh_huong_dang_cho;
  pk.chuyen = { ten: story.title, tom_tat: story.summary, da_xay_ra: story.log.map(l => `${l.age}t: ${l.text}${l.choice ? ` (bạn: ${l.choice})` : ""}`), chang_nay: story.stage + 1, chang_toi_da: Argon.MAX_STORY_STAGES,
    nguoi_trong_chuyen: story.people.map(id => { const m = L.lw.cast.get(id); return m ? `${m.name}${m.alive ? "" : " (đã mất)"}` : null; }).filter(Boolean) };
  return pk;
}
const STORY_RULES = `Bạn viết chặng tiếp theo của một "chuyện đang dở" trong đời nhân vật (xem "chuyen"). Giữ mạch: đọc kỹ những gì đã xảy ra. Luật giọng văn, tiền, người, cờ, việc lớn giống hệt luật bên dưới.
Trả về JSON: {"title":"...","text":"2–4 câu","choices":[{"label":"...","hint":"đánh đổi ≤70 ký tự","log":"một câu kể kết quả","chi_so":{},"nguoi":[],"co":[],"viec_lon":[],"tiep":{"hen_nam":1-5,"tom_tat":"..."} HOẶC "ket":"câu khép chuyện"}],"def":0}
2–4 lựa chọn, mỗi lựa chọn một đánh đổi thật. Mỗi lựa chọn hoặc có "tiep" (chuyện còn tiếp) hoặc "ket" (chuyện khép lại). Chặng cuối (chang_nay = chang_toi_da) mọi lựa chọn phải có "ket".`;
/** Lấy chặng kế của chuyện từ AI và đặt làm tình huống chờ. Lỗi: thử lại 1 lần, rồi hoãn 1 năm (3 lần → chìm dần). */
async function agencyStory(L, story, sample) {
  sample = sample || NAR.sample;
  if (!L.alive || !story || story.closed) { nextStory(L); return false; }
  const stage = story.stage + 1;
  const castIds = new Set([...L.lw.cast.values()].filter(m => m.alive).map(m => m.id));
  const prompt = STORY_RULES + "\n\n" + AGENCY_RULES.split("CHỈ TRẢ VỀ JSON")[0] + "\nBỐI CẢNH:\n" + JSON.stringify(storyPacket(L, story));
  if (sample) for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await withTimeout(sample.json(prompt, { modelTier: "default", cache: false }), AGENCY_TIMEOUT);
      const sc = Argon.sanitizeStoryScene(raw, castIds, stage, L.age);
      if (!sc) continue;
      L.actLog = L.actLog || []; L.actLog.push({ age: L.age, kind: "story", key: `story:${story.id}#${stage}`, storyId: story.id, stage, scene: sc });
      L.storyDue = null; L.pending = sceneFromStory(L, story, sc, stage);
      return true;
    } catch (e) { /* thử lại */ }
  }
  storyFail(L, story);
  return false;
}
/** Tua lại đời: dùng chặng đã lưu, không gọi AI. Không có thì chuyện hoãn một năm. */
function storyReplay(L) {
  const story = L.storyDue; const stage = story.stage + 1;
  const rec = (L.replayActs || []).find(a => a.kind === "story" && a.key === `story:${story.id}#${stage}`);
  if (!rec) { L.storyDue = null; storyFail(L, story); return; }
  L.storyDue = null; L.pending = sceneFromStory(L, story, rec.scene, stage);
}

/* ================= TUA LẠI ĐỜI ================= */
/** Áp lại các việc chủ động đã gõ ở đúng tuổi này (theo thứ tự), bỏ qua việc bị gỡ trong nhánh giả định. */
function replayProactive(L) {
  L.replayDone = L.replayDone || new Set();
  const recs = L.replayActs.filter(a => a.kind === "proactive" && a.age === L.age && !L.replayDone.has(a.seq)).sort((a, b) => a.seq - b.seq);
  for (const a of recs) {
    if (L.override && L.override.removeAct === a.seq) { L.replayDone.add(a.seq); continue; }
    if (L.pending) autoChain(L);
    if (!L.alive || L.pending) break;
    replayUiOps(L);
    L.replayDone.add(a.seq);
    applyAct(L, a.result, "proactive", a.text, null, a.seq);
  }
  replayUiOps(L);
}
/** Kịch bản tua lại: lựa chọn bấm nút giữ chỉ số; lựa chọn tự viết trỏ tới kết quả AI đã lưu. */
function replayScript(choices, actLog) {
  const script = {};
  for (const c of choices) {
    if (c.typed) { const rec = (actLog || []).find(a => a.kind === "scene" && a.key === c.key); if (rec) script[c.key] = { act: rec.result, text: rec.text, chon: rec.chon, seq: rec.seq }; }
    else script[c.key] = c.index;
  }
  return script;
}

/** Vòng lặp giao diện gọi khi có chuyện đến hẹn: lấy chặng từ AI; ở chế độ tự chơi thì tự chọn luôn. */
async function storyTick(L, sample) {
  const ok = await agencyStory(L, L.storyDue, sample);
  if (L.auto && L.pending) autoChain(L);
  return ok;
}
