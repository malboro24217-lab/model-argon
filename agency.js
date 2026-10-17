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
    case "ket_hon": return "marry" + (a.gia_tri ? ":" + a.gia_tri : "");
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
- money tính theo SỐ NĂM thu nhập hộ (vd -0.3 = mất 3,6 tháng thu nhập). Dưới 12 tuổi: không tiền, không đổi lòng tin.
- Nếu việc này sẽ còn chuyện về sau (mở quán, yêu ai đó, kiện tụng…), mở "chuyen" với hen_nam 1–5.
- Nếu đang có tinh_huong_dang_cho: câu gõ là cách người chơi xử lý tình huống đó. Nếu tình huống có "can_chon": true thì BẮT BUỘC trả "chon" = chỉ số nút gần nhất với cách xử lý (0-based).
CHỈ TRẢ VỀ JSON đúng khuôn:
{"ke":"...","ket_qua":"thanh|nua_voi|hong|khong_lam_duoc","chi_so":{"money":0,"health":0,"happy":0,"know":0,"rel":0,"bw":0,"income_mult":1,"agency":0},
 "nguoi":[{"id":"cast_...","tin":0.1,"nho":"chuyện cụ thể để người đó nhớ","phan_ung":"một câu phản ứng"}],
 "co":[],"bo_co":[],"viec_lon":[{"loai":"...","gia_tri":"..."}],"thoi_quen":{},"bi_mat":null,"chuyen":null,"chon":null}`;

/* ---- Gói bối cảnh gửi AI ---- */
function isFreeScene(p) { return !!p && (p.ai || p.story || p.choices.some(c => c._fx)); }
function actPacket(L, text) {
  const pk = statePacket(L);
  pk.nguoi_than = [...L.lw.cast.values()].filter(m => m.alive).map(m => ({ id: m.id, ten: m.name, vai: LW.ROLE_VN[m.role] || m.role, tuoi: L.age + m.age_offset, tin: +(Argon.opinionOf(L.ar.state, L.lw.mem, m.id)).toFixed(2) })).slice(0, 14);
  pk.chuyen_dang_do = (L.stories || []).filter(s => !s.closed).map(s => ({ ten: s.title, tom_tat: s.summary, chang: s.stage }));
  const ty = L.actsThisYear && L.actsThisYear.age === L.age ? L.actsThisYear : { texts: [] };
  pk.nam_nay_da_lam = ty.texts.slice(-8);
  const bw = L.ar.state.capitals.cognitiveBandwidth.value; pk.suc_luc = Math.round(bw); pk.kiet_suc = bw < 30;
  if (L.pending) pk.tinh_huong_dang_cho = { tieu_de: L.pending.title, noi_dung: String(L.pending.text || "").slice(0, 500), nut: L.pending.choices.map(c => c.label), can_chon: !isFreeScene(L.pending) };
  pk.co_cho_phep = Argon.ALLOWED_FLAGS;
  pk.viec_lon_cho_phep = Argon.BIG_ACTIONS;
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
    if (bigActionOk(L, a)) customEffect(L, bigActionToCustom(a));
    else log(L, `(Việc "${Argon.BIG_ACTIONS[a.loai].split(" —")[0]}" chưa thể xảy ra lúc này.)`);
  }
}
function statSnap(L) { return { health: L.st.health, happy: L.st.happy, know: L.st.know, rel: L.st.rel, savings: L.savings, income: L.income }; }
function statDeltas(a, b) { const d = {}; for (const k in a) { const v = b[k] - a[k]; if (Math.abs(v) >= (k === "savings" || k === "income" ? 1 : 0.5)) d[k] = Math.round(v); } return d; }
const OUTCOME_VN = { thanh: "Thành", nua_voi: "Nửa vời", hong: "Hỏng", khong_lam_duoc: "Không làm được" };

/** Áp một việc gõ đã làm sạch (đồng bộ — dùng cả khi tua lại đời). kind: "proactive" | "scene". */
function applyAct(L, act, kind, text, chon) {
  const before = statSnap(L);
  if (!L.actsThisYear || L.actsThisYear.age !== L.age) L.actsThisYear = { age: L.age, n: 0, texts: [] };
  L.actsThisYear.n++; L.actsThisYear.texts.push(text);
  const seq = (L.actSeq = (L.actSeq || 0) + 1);
  const p = kind === "scene" ? L.pending : { id: "tu_quyet", key: `act@${L.age}#${seq}`, title: "Tự quyết", text: "", choices: [{ label: "Không làm gì" }], npc: null };
  const engineScene = kind === "scene" && !isFreeScene(p);
  L.pending = null;
  const mark = markChoice(L, p, -1, text);
  try {
    log(L, act.ke, act.ket_qua === "thanh" ? "good" : act.ket_qua === "hong" || act.ket_qua === "khong_lam_duoc" ? "bad" : "");
    applyEffect(L, actToEffect(act), p.npc ? p.npc.id : undefined);
    applyEffect(L, { bw: -Argon.bwCost(L.actsThisYear.n) });
    const reactions = applyPeople(L, act.nguoi);
    applyBig(L, act.viec_lon);
    let story = null;
    if (act.chuyen) {
      L.stories = L.stories || [];
      const st = { id: "st" + seq, title: act.chuyen.ten, summary: act.chuyen.tom_tat, openedAge: L.age, nextAge: L.age + act.chuyen.hen_nam, stage: 0,
        log: [{ age: L.age, text: act.ke, choice: text }], people: (act.nguoi || []).map(x => x.id).filter(Boolean), originMark: mark ? mark.id : null, closed: false, failures: 0 };
      L.stories.push(st); story = st.title;
    }
    L.actLog = L.actLog || [];
    L.actLog.push({ age: L.age, seq, kind, key: mark ? mark.key : p.key, text, result: act, chon: engineScene ? chon : null });
    if (engineScene) { const k = chon !== null && chon !== undefined && p.choices[chon] ? chon : p.def; L.curMark = mark; L.pending = null; const ch = p.choices[k]; if (ch && ch.fx) ch.fx(L); else resolveCore(L, p, k, L.r, L.c); }
    return { text: act.ke, outcome: act.ket_qua, outcomeVN: OUTCOME_VN[act.ket_qua], deltas: statDeltas(before, statSnap(L)), reactions: reactions.slice(0, 3), story };
  } finally { L.curMark = null; if (kind === "scene") livingFollowUp(L); }
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
  const prompt = AGENCY_RULES + "\n\nBỐI CẢNH:\n" + JSON.stringify(actPacket(L, text));
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await withTimeout(sample.json(prompt, { modelTier: "default", cache: false }), AGENCY_TIMEOUT);
      const act = Argon.sanitizeAct(raw, castIds, L.age);
      if (!act) continue;
      if (!L.alive) return { ok: false, error: "Đời đã khép lại." };
      const chon = raw && Number.isInteger(raw.chon) ? raw.chon : null;
      const card = applyAct(L, act, L.pending ? "scene" : "proactive", text, chon);
      return { ok: true, card };
    } catch (e) { /* thử lại */ }
  }
  return { ok: false, error: "Người kể chuyện chưa trả lời — thử lại" };
}
