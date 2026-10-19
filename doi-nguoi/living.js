/* ================= LIVING WEB (host) =================
   Dàn nhân vật bền suốt đời · người phụ thuộc · ký ức & bí mật · storyteller · storylet → cảnh.
   Mọi thay đổi thế giới đi qua applyEffect(); kịch bản chỉ là dữ liệu. */
const POOL = { major: null, micro: null, generic: null };
function pools() { if (!POOL.major) { const G = Argon.MICRO_GATES; const gated = Argon.MICRO.map(s => G[s.id] ? { ...s, prerequisites: c => s.prerequisites(c) && G[s.id](c) } : s); POOL.major = Argon.STORYLETS.concat(gated.filter(s => s.category !== "micro"), Argon.BRANCHES.filter(s => s.category !== "micro"), Argon.LIFE_VARIANTS || []); POOL.micro = gated.filter(s => s.category === "micro").concat(Argon.BRANCHES.filter(s => s.category === "micro"), Argon.BRANCHES2 || [], Argon.TEMPER_LIFE || [], Argon.TEMPER2_ECHO || [], (Argon.PATH_STORYLETS || []).filter(s => s.category === "micro")); POOL.major = POOL.major.concat((Argon.PATH_STORYLETS || []).filter(s => s.category !== "micro"), Argon.SEASON_STORYLETS || []); POOL.generic = gated.filter(s => s.category === "micro"); } return POOL; }
let _moneyIds = null;
function MONEY_IDS() { if (!_moneyIds) _moneyIds = new Set((Argon.PATH_STORYLETS || []).filter(s => s.meta && s.meta.kind === "money").map(s => s.id)); return _moneyIds; }
function yearBudget(L) { const a = L.age; if (a < 6) return 0; if (a < 13) return 1; if (a < 18) return 2; if (a < 65) return 2 + (L.ar && L.ar.rngStory.next() < 0.35 ? 1 : 0); return 1; }
const LW = {
  ROLE_VN: { mother: "mẹ", father: "cha", sibling: "anh/chị/em", childhood_friend: "bạn thân từ nhỏ", bully: "kẻ bắt nạt ngày xưa", neighbor: "hàng xóm", first_boss: "sếp đầu tiên", official: "cán bộ", partner: "đối tác", creditor: "chủ nợ", mentor: "người thầy", rival: "đối thủ", spouse: "bạn đời", child: "con", ex_spouse: "người cũ", season: "người quen" },
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
  // tên không trùng nhau và không trùng tên người chơi
  const given = L.name.split(" ").pop(); const used = new Set([given]);
  for (const m of cast.values()) { if (used.has(m.name)) { const pool = (ROLE_SEX_OF(m.role, rng) === "F" ? nm.F : nm.M).filter(x => !used.has(x)); if (pool.length) { m.name = pool[Math.floor(rng.next() * pool.length)]; s.npcs.get(m.id).name = m.name; } } used.add(m.name); }
  { const tf = L.c.tf; const absent = { sibling: tf < 1.6 ? 0.5 : tf < 2.6 ? 0.25 : 0.1, mentor: 0.5, bully: 0.4, rival: 0.4, partner: 0.3, childhood_friend: 0.15 };
    for (const m of cast.values()) { const p = absent[m.role]; if (p && rng.next() < p) { m.alive = false; m.absent = true; m.dependent = false; if (m.role === "sibling") L.flagsInit = (L.flagsInit || []).concat("only_child"); } } }
  for (const m of cast.values()) L.ar.npcStart.set(m.id, s.npcs.get(m.id).liquid);
  L.lw = { cast, mem: Argon.createMemory(), st: Argon.createStoryteller(rng), history: [], recentVig: [], sflags: new Set(), counters: {}, queue: [], lastVig: -9, depLogged: -9, cz: Argon.createCausality(), promises: [] };
  // Ký ức tiền kiếp là đầu vào của đời: đời thật đọc từ trình duyệt và ghi lại vào actLog, bản tua lại đọc đúng bản ghi đó.
  metaApply(L, L.replay ? metaFromActs(L.replayActs) : metaSnapshot(L));
  for (const fl of (L.flagsInit || [])) L.lw.sflags.add(fl);
  { const urbanShare = clamp(0.1 + 0.28 * Math.log10(Math.max(900, L.c.g) / 800), 0.15, 0.85); const urban = rng.next() < urbanShare; const o = L.fam > 0.75 ? "rich" : L.fam < 0.4 ? (urban ? "poor_urban" : "poor_rural") : "middle"; L.lw.sflags.add("origin_" + o); L.lw.sflags.add(urban ? "urban" : "rural"); L.origin = o; }
  canonInit(L);
}
/* Tên người thật nổi tiếng mà các bể tên có thể ghép ra (không dùng cho bất kỳ ai trong game). So không dấu, không hoa, cả hai thứ tự. */
const REAL_NAMES = new Set(["joseph kabila", "laurent kabila", "felix tshisekedi", "nelson mandela", "jacob zuma", "cyril ramaphosa", "barack obama", "michelle obama", "donald trump", "joe biden", "kamala harris", "bill clinton", "hillary clinton", "george bush",
  "vladimir putin", "xi jinping", "mao zedong", "kim jong un", "kim jong il", "kim il sung", "shinzo abe", "narendra modi", "indira gandhi", "rahul gandhi", "imran khan", "angela merkel", "emmanuel macron", "boris johnson",
  "elon musk", "jeff bezos", "bill gates", "mark zuckerberg", "taylor swift", "michael jackson", "lionel messi", "cristiano ronaldo", "mohamed salah", "jackie chan", "bruce lee", "ho chi minh", "vo nguyen giap", "lee kuan yew",
  "fidel castro", "raul castro", "hugo chavez", "jair bolsonaro", "paul kagame", "william ruto", "yoweri museveni", "abiy ahmed", "muhammadu buhari", "bola tinubu", "recep erdogan", "lee jae myung", "moon jae in", "park chung hee"]);
function nameKey(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z]+/g, " ").trim(); }
/** true nếu họ tên trùng một người thật nổi tiếng (bất kể thứ tự họ / tên). */
function nameBlocked(name) { const k = nameKey(name); if (!k) return false; return REAL_NAMES.has(k) || REAL_NAMES.has(k.split(" ").reverse().join(" ")); }
/** Tên gọi cho người mới trong nhà (con, bạn đời): rút như cũ; chỉ khi trùng tên gọi đang có chủ mới rút thêm một lần trong phần còn trống. */
function freshGiven(L, r, pool) {
  let n = pick(r, pool); if (!L || !L.lw) return n;
  const taken = freeTier(L, pool); if (!taken.has(n)) return n;   // tránh chặt nhất mà bể tên còn cho phép (xem nameTiers ở canon.js)
  const free = pool.filter(x => !taken.has(x)); return free.length ? free[Math.floor(r() * free.length)] : n;
}
function ROLE_SEX_OF(role, rng) { return role === "mother" ? "F" : (role === "father" || role === "bully" || role === "official") ? "M" : (rng.next() < 0.5 ? "M" : "F"); }
function castName(L, id) { if (isCanonKey(id)) return canonName(L, id); const m = L.lw && L.lw.cast.get(id); if (m) return m.name; const n = L.ar && L.ar.state.npcs.get(id); return n ? n.name : "ai đó"; }
function castRole(L, r) { return Argon.byRole(L.lw.cast, r); }
function fill(L, text) {
  const map = { mother: "mother", father: "father", sibling: "sibling", friend: "childhood_friend", bully: "bully", neighbor: "neighbor", mentor: "mentor", spouse: "spouse", child: "child" };
  return text.replace(/\{(\w+)\}/g, (_, k) => { if (k === "job") return L.job || "việc"; const m = map[k] && castRole(L, map[k]); return m ? m.name : ({ mother: "mẹ", father: "cha", sibling: "em", friend: "bạn", bully: "nó", neighbor: "hàng xóm", mentor: "người thầy", spouse: "vợ/chồng", child: "con" })[k] || k; });
}

/* ---- FactContext ---- */
/** 0..1 cố định theo đời (từ seed): quyết định đời này gặp lát nội dung tùy chọn nào. */
function lifeLuck(L) { if (L.luck === undefined) L.luck = (Math.imul((L.seed >>> 0) ^ 0x5bd1e995, 2654435761) >>> 0) / 4294967296; return L.luck; }
function factContext(L) {
  const g = argonGate(L); const s = L.ar.state; const cast = L.lw.cast; const yearly = Math.max(300, householdIncome(L));
  const kids = [...cast.values()].filter(m => m.alive && m.role === "child").map(m => L.age + m.age_offset);
  const parents = [...cast.values()].filter(m => m.alive && (m.role === "mother" || m.role === "father"));
  const castMap = {}, opinion = {}, roles = {}, hooksMap = {};
  for (const m of cast.values()) { if (!m.alive) continue; roles[m.id] = m.roles; opinion[m.id] = Argon.opinionOf(s, L.lw.mem, m.id); for (const r of m.roles) if (!castMap[r]) castMap[r] = m.id; }
  for (const h of Argon.hooks(s, L.lw.mem)) (hooksMap[h.holder] = hooksMap[h.holder] || []).push(h.secret.tag);
  const last_move = {}; for (const n of s.npcs.values()) { const h = n.history[n.history.length - 1]; if (h) last_move[n.id] = h.npcMove; }
  const rep = s.capitals.socialLedger.reputation;
  const debt = livesOnFamily(L) ? s.capitals.capitalAssets.debt : (L.debt || 0), savings = fundsFor(L);
  return {
    age: L.age, sex: L.sex, country: L.c.id, luck: lifeLuck(L), gdp: L.c.g, poor_country: L.c.g < 8000, family_wealth: L.fam,
    in_school: L.school.in, years_school: L.school.years, has_degree: L.school.deg, has_job: !!L.job && !L.retired, job: L.job || "", farmer: L.job === "nông dân" || L.job === "phụ giúp việc đồng áng", worker: /công nhân|kho|nhà máy|thợ/.test(L.job || ""), retired: L.retired,
    married: L.married, widowed: !!L.widowed, kids_alive: kids.length, kids_teen: kids.filter(a => a >= 13 && a <= 19).length, kids_school: kids.filter(a => a >= 6 && a < 18).length,
    parents_alive: parents.length, parent_old: parents.some(m => L.age + m.age_offset >= 65), parent_sick: parents.some(m => m.health < 40), sibling_alive: !!castMap.sibling,
    income: yearly, savings, debt, debt_ratio: debt / yearly, rich: savings >= 3 * yearly, broke: savings < 0.1 * yearly,
    health: L.st.health, happy: L.st.happy, know: L.st.know, rel: L.st.rel, bandwidth: g.bw, bandwidth_locked: g.bw < 30, scarcity: !!g.scarcity, rat_race: g.ratRace,
    tier: g.tier, agency: g.agency, reputation: rep, allies: Object.values(opinion).filter(v => v >= 0.5).length, enemies: Object.values(opinion).filter(v => v <= -0.35).length,
    econ_phase: s.economic_phase, ill: !!L.ill, migrated: L.migrated, flags: L.lw.sflags, counters: L.lw.counters, cast: castMap, opinion, roles, hooks: hooksMap, last_move, doors: L.lw.cz.doors,
    years_since_major: L.age - L.lw.st.last_major_age, tension: L.lw.st.tension, crises_survived: s.perception.crises_survived, traits: L.traits || { coop: 0, fair: 0, risk: 0, bold: 0 },
    ...moneyFacts(L),
    ...canonFacts(L)
  };
}

/* ---- Hiệu ứng khai báo → thế giới ---- */
function applyEffect(L, e, npcId) {
  e = canonOnEffect(L, e);   // áp lực, vật gài, kết mùa trước khi tính tiền của chung kết
  // R24: tiền thưởng / phạt (money:<x>, cược) tính trên lương gốc, không nhân hệ số mùa.
  const s = L.ar.state, yearly = seasonYearlyBase(L), ctxNpc = id => (id && s.npcs.get(id)) || (npcId && s.npcs.get(npcId));
  if (e.gamble) { const win = L.r() < e.gamble.p; applyEffect(L, { ...e, gamble: undefined, log: undefined }, npcId); applyEffect(L, win ? e.gamble.win : e.gamble.lose, npcId); return; }
  if (e.game) { const npc = ctxNpc(e.game.npc); if (npc) { const r = argonPlay(L, npc, e.game.move, yearly * e.game.stake_frac, npc.id); const o = r.outcome;
      log(L, `${e.log ? e.log + ". " : ""}${npc.name} ${o.npcMove === "cooperate" ? "chơi thật" : "chơi xấu"} → ${AR.CELL_VN[o.cell]}: bạn ${o.payoffA.capital >= 0 ? "nhận" : "mất"} ${fmtPPP(Math.abs(o.payoffA.capital))}${o.breach_detected ? " (bạn phát hiện kịp)" : ""}.`, o.cell === "win_win" || o.cell === "arbitrage" ? "good" : o.cell === "sucker" || o.cell === "mutual_destruction" ? "bad" : "");
      const tag = o.cell === "exploitation" ? "BETRAYED_PARTNERSHIP" : o.cell === "win_win" ? "WIN_WIN_DEAL" : o.cell === "arbitrage" ? "KEPT_PROMISE" : null;
      if (tag) { Argon.addMemory(L.lw.mem, npc.id, tag, L.age, o.cell === "exploitation" ? -0.6 : 0.25, o.cell === "exploitation" ? `bị bạn bòn rút năm ${L.age} tuổi` : `ván làm ăn năm ${L.age} tuổi`); stampP(L, Argon.prov.memory(npc.id, tag)); if (L.curMark) L.lw.cz.origin.set(Argon.prov.opinion(npc.id), L.curMark.id); }
      if (o.cell === "exploitation") { Argon.addSecret(L.lw.mem, "STOLE_SHARED_PROFIT", L.age, 0.5, [6, 20], L.ar.rng, `giấu tiền chung với ${npc.name}`, [npc.id]); stampP(L, Argon.prov.secret("STOLE_SHARED_PROFIT")); closeDoorNow(L, "clean_record"); if (L.lw.cast.has(npc.id)) closeDoorNow(L, "partner_circle"); } } }
  else if (e.log) log(L, fill(L, e.log), (e.money || 0) < 0 || (e.health || 0) < 0 || (e.happy || 0) < -4 ? "bad" : (e.money || 0) > 0 || (e.happy || 0) > 3 ? "good" : "");
  for (const k of ["health", "happy", "know", "rel"]) if (e[k]) addSt(L, k, e[k]);
  if (e.bw) { s.capitals = Argon.applyDelta(s.capitals, { bandwidth: e.bw }); L.st.bw = s.capitals.cognitiveBandwidth.value; }
  if (e.agency) { s.capitals = Argon.applyDelta(s.capitals, { agency: e.agency }); }
  if (e.money) L.savings += yearly * e.money;
  if (e.income_mult && L.income > 0) L.income *= e.income_mult;
  if (e.trust) { const npc = ctxNpc(e.trust.npc); if (npc) Argon.propagate(s.graph, npc.id, e.trust.delta, s.tick); }
  if (e.memory) { const npc = ctxNpc(e.memory.npc); if (npc) { Argon.addMemory(L.lw.mem, npc.id, e.memory.tag, L.age, e.memory.weight, e.memory.note ? (/năm (bạn )?\d+ tuổi/.test(e.memory.note) ? e.memory.note : `${e.memory.note} (năm bạn ${L.age} tuổi)`) : "", e.memory.decayPerYear); stampP(L, Argon.prov.memory(npc.id, e.memory.tag)); if (L.curMark && Math.abs(e.memory.weight) >= 0.25) L.lw.cz.origin.set(Argon.prov.opinion(npc.id), L.curMark.id); } }
  if (e.secret) { Argon.addSecret(L.lw.mem, e.secret.tag, L.age, e.secret.severity, e.secret.fuse_years, L.ar.rng, e.secret.note || "", (e.secret.known_by || []).filter(id => s.npcs.has(id))); stampP(L, Argon.prov.secret(e.secret.tag)); closeDoorNow(L, "clean_record"); }
  if (e.close_doors) for (const d of e.close_doors) { if (L.perks && L.perks.includes("door") && !L.doorPerkUsed) { L.doorPerkUsed = true; log(L, `Ký ức tiền kiếp giữ cánh cửa ${CH.DOOR_VN(d).vi.toLowerCase()} không đóng.`, "good"); } else closeDoorNow(L, d); }
  if (e.promise) addPromise(L, e.promise);
  if (e.flags) for (const f of e.flags) { L.lw.sflags.add(f); stampP(L, Argon.prov.flag(f)); }
  if (e.unflags) for (const f of e.unflags) L.lw.sflags.delete(f);
  if (e.counters) for (const k in e.counters) { const before = L.lw.counters[k] || 0; L.lw.counters[k] = before + e.counters[k]; const hk = k === "honest" && e.counters[k] < 0 ? "liar" : k; if ((before <= 0 && L.lw.counters[k] > 0) || (k === "honest" && before >= 0 && L.lw.counters[k] < 0)) { L.lw.sflags.add("habit_" + hk); stampP(L, Argon.prov.flag("habit_" + hk)); if (k === "smoke") L.lw.counters.smoke_since = L.age; } }
  if (e.later) { if (e.later.storylet) L.lw.queue.push({ at: L.age + e.later.years, storylet: e.later.storylet }); else if (e.later.note) { L.threads = L.threads || []; L.threads.push({ flag: "hẹn", age: L.age, due: L.age + e.later.years, note: e.later.note }); } }
  if (e.trait) for (const k in e.trait) if (e.trait[k]) trait(L, k, e.trait[k]);
  if (e.learn) learn(L, e.learn);
  if (e.tension) L.lw.st.tension = clamp(L.lw.st.tension + e.tension, 0, 100);
  if (e.role) { const m = L.lw.cast.get(e.role.npc); if (m && !m.roles.includes(e.role.add)) m.roles.push(e.role.add); }
  if (e.buy || e.sell || e.lifestyle || e.deposit || e.withdraw || e.lend || e.give || e.insure || e.uninsure || e.support) moneyEffect(L, e, npcId);
  if (e.custom) customEffect(L, e.custom, npcId);
}
/** Bước vào một trong 96 con đường đời (registry trong engine). Con đường nghề thay nghề cũ; con đường "đời" (tị nạn, đi tu…) chồng lên. */
function becomePath(L, id) {
  const d = Argon.PATHS[id]; if (!d || !L.lw) return false;
  const fl = L.lw.sflags;
  const cur = [...fl].map(k => k.startsWith("life_") && Argon.PATHS[k.slice(5)]).find(o => o && o.kind === "career");
  if (d.kind === "career") for (const k of [...fl]) { const o = k.startsWith("life_") && Argon.PATHS[k.slice(5)]; if (o && o.kind === "career") fl.delete(k); }
  fl.add("life_" + id); L.lw.counters["p_" + id] = 0; L.lw.counters["p_" + id + "_at"] = L.age;
  L.lw.queue = L.lw.queue.filter(q => q.custom !== "job_new"); // "job_lose|become:x" = đổi đường, không tìm việc mới nữa
  // Thu nhập nền: đang đi một con đường nghề thì gỡ hệ số của con đường đó ra, không gỡ hệ số họ nghề (tránh hao hụt khi đổi đường nhiều lần).
  const fam = famOf(L); let base;
  // pathBase luôn lưu không kèm hệ số mùa; base đang dùng thì có (thu nhập trong mùa đã nhân hệ số).
  const sm = seasonIncomeMult(L);
  if (cur && L.lw.pathBase > 0) base = cur.incomeMult > 0 && L.income > 0 ? L.income / cur.incomeMult : L.lw.pathBase * sm;
  else base = L.income > 0 ? L.income / ((FAM[fam] && FAM[fam].m) || 1) : incomeAt(L.c, L.incomePct || .4) * sm;
  L.lw.pathBase = base / sm;
  if (d.fam && FAM[d.fam]) { for (const k in FAM) fl.delete("job_" + k); fl.add("job_" + d.fam); }
  L.job = d.title; L.lastJob = d.title; L.income = base * d.incomeMult; if (d.kind === "career") L.retired = false;
  log(L, `Bạn bước vào con đường ${d.vn}.`, "big");
  return true;
}
/** Người từng là bạn đời: bỏ vai spouse (cả vai chính, để người cũ mất không làm bạn góa), thêm vai rival (trừ khi quiet). */
function leaveSpouse(m, quiet) {
  m.roles = m.roles.filter(r => r !== "spouse"); if (!quiet && !m.roles.includes("rival")) m.roles.push("rival");
  if (m.role === "spouse") m.role = "ex_spouse";
}
/** Nhãn vai cho người chơi đọc: không bao giờ lộ id nội bộ (season, ex_spouse…). */
function roleVN(m) { return (m && ((m.role === "season" && m.label) || LW.ROLE_VN[m.role] || m.label)) || "người quen"; }   // người của mùa: nhãn riêng ("bà chủ vựa phế liệu")
/** Cưới một người đã có trong dàn nhân vật (R20): thêm vai spouse cho chính người đó, không tạo NPC mới. */
function marryMember(L, m) {
  for (const o of L.lw.cast.values()) if (o !== m && o.alive && (o.roles.includes("spouse") || o.role === "spouse")) leaveSpouse(o, true);   // bạn đời đã mất vẫn là bạn đời đã mất, không thành "người cũ"
  // Vai chính thành spouse: ageCast báo cái chết theo m.role, nên người này mất thì bạn góa như mọi bạn đời khác.
  m.role = "spouse"; m.roles = m.roles.filter(r => r !== "season"); if (!m.roles.includes("spouse")) m.roles.push("spouse");
  L.married = true; L.spouse = m.name; L.flags.marriedAt = L.age; L.lw.counters.married_years = 0;
  const kind = { generous_tit_for_tat: "warm", grudger: "proud", opportunist: "restless", always_defect: "restless", tit_for_tat: "fair" }[m.true_archetype] || "fair";
  for (const k of ["warm", "proud", "restless", "fair"]) L.lw.sflags.delete("spouse_" + k); L.lw.sflags.add("spouse_" + kind);
  log(L, `Bạn kết hôn với ${m.name}.`, "good big"); addSt(L, "happy", 10); addSt(L, "rel", 8);
}
function customEffect(L, c, npcId) {
  const s = L.ar.state, yearly = seasonYearlyBase(L);   // R24: borrow / repay tính trên lương gốc
  if (c.includes("|")) { for (const part of c.split("|")) customEffect(L, part, npcId); return; }
  const [kind, arg] = c.split(":"); const x = +arg || 0;
  if (canonCustom(L, kind, arg)) return;
  switch (kind) {
    case "borrow": s.capitals.capitalAssets.debt += yearly * x; s.capitals.capitalAssets.liquid += yearly * x; syncFromArgon(L); break;
    case "repay": { const pay = Math.min(s.capitals.capitalAssets.debt, yearly * x); s.capitals.capitalAssets.debt -= pay; syncFromArgon(L); break; }
    case "restructure": s.capitals.capitalAssets.debt *= 0.85; L.lw.sflags.add("debt_restructured"); syncFromArgon(L); break;
    case "job_lose": if (L.job) { log(L, "Bạn mất việc.", "bad"); L.income *= 0.3; L.lw.queue.push({ at: L.age + 1, custom: "job_new" }); } break;
    case "job_lose_maybe": if (L.r() < 0.5) customEffect(L, "job_lose"); break;
    case "job_new": getJob(L); break;
    case "job_switch": if (FAM[arg]) assignJob(L, arg); break;
    case "become": { const d = Argon.PATHS[arg]; // R15: chỉ đổi nghề khi tuổi nằm trong khoảng của con đường (tới ages[1] + 5)
      if (d && (L.age < d.ages[0] || L.age > d.ages[1] + 5)) { L.lw.sflags.add("tp_practice_" + arg); log(L, L.age < d.ages[0] ? `Bạn bắt đầu tập tành theo con đường ${d.vn}, chờ ngày đủ lớn.` : `Bạn vẫn mê con đường ${d.vn}, nhưng giờ chỉ làm cho vui.`); }
      else becomePath(L, arg); break; }
    case "move_city": L.lw.sflags.add("path_city"); L.lw.sflags.add("left_home"); if (L.income > 0) L.income *= 1.15; addSt(L, "rel", -5); log(L, "Bạn chuyển lên thành phố.", "big"); break;
    case "study": L.lw.studying = true; if (L.income > 0) L.income *= 0.7; L.lw.queue.push({ at: L.age + 2, custom: "study_done" }); log(L, "Bạn đi học lại, vừa học vừa làm.", "big"); break;
    case "study_done": L.lw.studying = false; addSt(L, "know", 10); if (L.school.years >= 12) { L.school.deg = true; if (L.income > 0) L.income = L.income / 0.7 * 1.1; log(L, "Bạn lấy được tấm bằng.", "good big"); } else { L.school.years = Math.min(12, L.school.years + 2); if (L.income > 0) L.income /= 0.7; log(L, `Bạn học xong lớp ${L.school.years}.`, "good"); } break;
    case "marry": { // R20: cưới đúng người đang có tên đó; ưu tiên người mới của mùa, không bao giờ là người trong nhà
      const fam = new Set(["mother", "father", "sibling", "child", "spouse"]), sc = new Set(Object.values((L.lw.season && L.lw.season.cast) || {}));
      const cands = arg ? [...L.lw.cast.values()].filter(x => x.alive && x.name === arg && !fam.has(x.role)) : [];
      const m = cands.find(x => sc.has(x.id)) || cands[0];
      if (arg && L.married && [...L.lw.cast.values()].some(x => x.alive && x.role === "spouse" && x.name === arg)) break;   // đã cưới chính người này
      if (m) marryMember(L, m); else resolveCore(L, { id: "marry", data: arg || spouseName(L.r, L.c, L.sex, L) }, 0, L.r, L.c); break; }
    case "have_child": bornChild(L); break;
    case "retire": { L.retired = true; const pen = L.c.g > 30000 ? .55 : L.c.g > 10000 ? .35 : .1; L.income *= pen; log(L, "Bạn nghỉ hưu sớm.", "big"); break; }
    case "migrate_now": { L.flags.migAsked = true; const dest = pickWeighted(L.r, COUNTRIES.filter(d => d.g > L.c.g * 1.5 && d.g > 15000), d => d.b + (d.g > 40000 ? 1 : 0)); if (dest) resolveCore(L, { id: "migrate", data: dest.id }, 0, L.r, L.c); else log(L, "Không tìm được nơi nào nhận bạn.", "bad"); break; }
    case "scholar": L.school.target = 12; addSt(L, "know", 5); break;
    case "return_home": L.lw.sflags.delete("path_migrant"); if (L.migrated) { L.migrated = false; L.c = L.birthC; } L.income *= 0.55; log(L, `Bạn về lại ${L.birthC.n}.`, "big"); break;
    case "spouse_leave": { const sp = castRole(L, "spouse"); if (sp) leaveSpouse(sp); L.married = false; log(L, "Hai người chia tay.", "bad big"); break; }
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
function syncFromArgon(L) { const A = L.ar, a = A.state.capitals.capitalAssets, dS = L.savings - A.syncedSavings; if (dS) a.liquid += dS; L.savings = a.liquid - a.debt - (A.indep ? 0 : (A.hh || 0)); L.debt = A.indep ? a.debt : 0; A.syncedSavings = L.savings; settleDependent(L); }

/* ---- Storylet → cảnh ---- */
function sceneFromStorylet(L, st, ctx) {
  const view = st.build(ctx, id => castName(L, id));
  const yearly = seasonYearlyBase(L), u = yearly * 0.15;
  const npcId = view.npc;
  const choices = view.choices.map(ch => ({ label: ch.label, hint: ch.hint || "", tier: ch.tier, longterm: ch.longterm, _fx: ch.effects, fx: L2 => applyEffect(L2, ch.effects, npcId) }));
  let matrix = null;
  if (view.matrix) matrix = { who: npcId ? castName(L, npcId) : "Họ", me: view.matrix.me, them: view.matrix.them, unit: view.matrix.unit === "u" ? "$ PPP" : view.matrix.unit, cells: view.matrix.cells.map(r => r.map(c => c.map(v => view.matrix.unit === "u" ? Math.round(v * u) : v))) };
  const npc = npcId ? L.ar.state.npcs.get(npcId) : null;
  const memLine = npc ? memoryLine(L, npc.id) : "";
  return { id: st.id, key: st.id + "@" + L.age, _choiceEffects: view.choices.map(c => c.effects), title: view.title, text: fill(L, view.text) + (memLine ? " " + memLine : ""), choices, def: view.def, matrix, npc, fog: !!matrix, concept: view.concept, tempt: npc && matrix ? { stake: yearly * 0.5, roundsLeft: 2 } : null, storylet: true };
}
function memoryLine(L, id) {
  const bad = Argon.strongestMemory(L.lw.mem, id, -1), good = Argon.strongestMemory(L.lw.mem, id, 1);
  const name = castName(L, id);
  if (bad && Math.abs(bad.weight) >= 0.12) return `${name} vẫn chưa quên ${bad.note || LW.TAG_VN[bad.tag]}.`;
  if (good && good.weight >= 0.12) return `${name} còn nhớ ${good.note || LW.TAG_VN[good.tag]}.`;
  return "";
}

/** Hẹn không phải cảnh (study_done, job_new…) không chờ năm rảnh: áp mọi hẹn custom tới hạn. true nếu một hẹn mở cảnh. */
function runDueCustoms(L) {
  const q = L.lw.queue;
  for (let qi = 0; qi < q.length;) { const it = q[qi]; if (it.at <= L.age && it.custom) { q.splice(qi, 1); customEffect(L, it.custom); if (L.pending) return true; } else qi++; }
  return false;
}
/** Dàn nhân vật già thêm một năm ở tuổi L.age (luồng npc): người mất, đổ bệnh, khỏe lại. livingYear và age_skip (canon.js) dùng chung. */
function castYear(L) {
  const lw = L.lw;
  for (const ev of Argon.ageCast(lw.cast, L.age, L.ar.rng, L.c.g < 8000)) {
    const r = roleVN(lw.cast.get(ev.id) || { role: ev.role });
    if (ev.kind === "died") { log(L, `${ev.name} (${r}) qua đời.`, "bad big"); addSt(L, "happy", ev.role === "mother" || ev.role === "father" || ev.role === "spouse" || ev.role === "child" ? -15 : -5);
      if (ev.role === "mother" || ev.role === "father") lw.sflags.add("parent_died"); if (ev.role === "spouse") { L.married = false; L.widowed = true; } if (ev.role === "child") { const k = L.kids.find(k => k.name === ev.name); if (k) k.alive = false; } }
    else if (ev.kind === "fell_ill") log(L, `${ev.name} (${r}) đổ bệnh.`, "bad");
    else log(L, `${ev.name} (${r}) khỏe lại.`, "good");
  }
}
/* ---- Một năm của mạng lưới sống. Gọi từ lifeEvents. Trả về true nếu đã đặt L.pending ---- */
function livingYear(L) {
  livingInit(L);
  // rng: người thân, bí mật (luồng npc) · srng: nhịp kể và chọn tình huống (luồng story). Xem ledger 2026-10-18-tat-dinh.
  const s = L.ar.state, rng = L.ar.rng, srng = L.ar.rngStory, lw = L.lw;
  lw.decisions = 0; lw.budget = yearBudget(L);
  if (L.school.uni || L.school.deg) lw.sflags.add("path_uni"); if (L.migrated) lw.sflags.add("path_migrant"); if (!L.school.in && !L.school.deg && L.school.years < 9 && L.age >= 10) lw.sflags.add("path_dropout");
  habitYear(L);
  seasonYearly(L);   // luật năm của mùa: mỗi năm một lần, kể cả năm bận
  // 1. Dàn nhân vật già đi
  castYear(L);
  // 2. Người phụ thuộc: tiền chảy ra
  const deps = Argon.dependentCosts(lw.cast, L.age, L.c.g > 30000); const yearly = Math.max(300, householdIncome(L));
  let depTotal = 0; for (const d of deps) depTotal += d.frac * supportMult(L, d.role) * yearly;
  lw.depYear = { age: L.age, amt: depTotal };
  if (depTotal > 0) { L.savings -= depTotal; if (L.age - lw.depLogged >= 3) { lw.depLogged = L.age; log(L, `Năm nay ${fmtPPP(depTotal)} đi cho ${deps.map(d => `${d.name} (${d.why})`).join(", ")}.`); } }
  // 3. Ký ức mờ dần, bí mật rò rỉ, ngòi nổ
  Argon.decayMemories(lw.mem);
  for (const leak of Argon.leakSecrets(s, lw.mem, rng)) if (rng.chance(0.3)) log(L, `${castName(L, leak.to)} nghe được chuyện ${LW.SECRET_VN[leak.secret.tag]} của bạn.`, "bad");
  for (const sec of Argon.fuseCheck(s, lw.mem, L.age, rng)) { lw.sflags.add("scandal_pending"); lw.counters.scandal_age = sec.age; log(L, `Chuyện ${LW.SECRET_VN[sec.tag]} năm ${sec.age} tuổi bỗng được kể lại.`, "bad big"); }
  if (L.pending || L.storyDue) return true;
  if (L.age < 5) { if (L.age === 3) { const st = pools().major.find(x => x.id === "temper_3"); if (st && !lw.history.some(h => h.id === st.id)) { fire(L, st, factContext(L)); return true; } } return false; }
  foreshadow(L);
  if (promiseDueScene(L)) return true;
  // Hẹn không phải cảnh (study_done, job_new…) không chờ năm rảnh: áp trước canon event / thẻ mùa.
  if (runDueCustoms(L)) return true;
  if (canonYear(L)) return true;
  // 4. Hẹn trước (dây cháy chậm có chủ đích)
  const ctx = factContext(L);
  // Consume only the appointment being handled. Other due scenes survive a busy year.
  for (let qi = 0; qi < lw.queue.length;) {
    const q = lw.queue[qi];
    if (q.at > L.age) { qi++; continue; }
    if (q.custom) { qi++; continue; }   // hẹn custom đã chạy ở runDueCustoms (trước canonYear)
    const st = pools().major.find(x => x.id === q.storylet) || pools().micro.find(x => x.id === q.storylet);
    if (!st || lw.history.some(h => h.id === st.id) && st.once) { lw.queue.splice(qi, 1); continue; }
    if (!st.prerequisites(factContext(L))) { qi++; continue; }
    lw.queue.splice(qi, 1); fire(L, st, factContext(L)); return true;
  }
  // 5. Storyteller quyết định nhịp
  const d = Argon.decide(lw.st, ctx, srng);
  const hist = lw.history;
  // Tình huống AI (nếu có) chỉ chen vào khi đang "bão" và không có storylet khẩn. Bản tua lại lấy đúng cảnh đã lưu trong actLog.
  const urgent = Argon.selectStorylet(pools().major, ctx, { minUrgency: 80, history: hist, age: L.age }, srng);
  if (urgent) { fire(L, urgent, ctx); return true; }
  if (d.phase === "storm" && (L.aiReady || L.replay) && narratorPresent(L)) { Argon.onFired(lw.st, L.age, 10, srng); return true; }
  const st = Argon.selectStorylet(pools().major, ctx, { minUrgency: d.minUrgency, history: hist, age: L.age }, srng);
  if (st) { fire(L, st, ctx); return true; }
  // 6. Năm lặng: một dòng tự sự
  if (d.vignette && L.age - lw.lastVig >= 1) { const v = Argon.selectVignette(Argon.VIGNETTES, ctx, srng, lw.recentVig); if (v) { lw.recentVig.push(v.id); if (lw.recentVig.length > 12) lw.recentVig.shift(); lw.lastVig = L.age; log(L, fill(L, srng.pick(v.lines)), v.tone || ""); } }
  return microScene(L, ctx);
}
function fire(L, st, ctx) {
  L.lw.decisions = (L.lw.decisions || 0) + 1;
  L.lw.history.push({ id: st.id, age: L.age });
  Argon.onFired(L.lw.st, L.age, st.tension, L.ar.rngStory);
  if (st.category === "reflection") { L.lw.sflags.add("reflect_" + L.age); }
  const sc = sceneFromStorylet(L, st, ctx);
  let marks = [];
  if (st.causes) { try { marks = Argon.resolveCauses(L.lw.cz, st.causes(ctx) || []); } catch { marks = []; } }
  if (marks.length) { Argon.attachConsequence(marks, L.age, st.id, sc.title); sc.causes = marks; }
  scene(L, sc);
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
    : `Bạn sống ${L.age} năm ở ${L.c.n}. ${+yrs(V.ticks_autopilot) > 0 ? `${yrs(V.ticks_autopilot)} năm đầu là của người khác: của làng, của nhà, của những điều ai cũng làm. Rồi ` : "Từ rất sớm, "}${V.crises_survived ? `sau ${V.crises_survived} lần khủng hoảng` : "dần dần"}, bạn bắt đầu thấy luật chơi${+yrs(V.ticks_sovereign) > 0 ? `, và ${yrs(V.ticks_sovereign)} năm cuối cùng bạn tự viết lấy phần mình` : ", dù chưa kịp sống trọn năm nào theo luật của riêng mình"}${V.relapses ? `, dù có ${V.relapses} lần suýt trượt về` : ""}.`;   // không bao giờ "0 năm"
  const p2 = `${S.rounds ? `Bạn ngồi vào ${S.rounds} ván với người khác và để lại ${S.net_systemic_surplus >= 0 ? "thêm " : "ít hơn "}${fmtPPP(Math.abs(S.net_systemic_surplus))} cho tất cả những người ngồi cùng bàn, trên ${fmtPPP(S.potential_surplus)} có thể có nếu ai cũng thật.` : "Bạn ít khi ngồi vào bàn với ai."} ${prospered.length ? `${prospered.join(", ")} khá lên nhờ có bạn.` : ""} ${preyed.length ? `${preyed.join(", ")} khá lên trên lưng bạn.` : ""} ${bankrupt.length ? `${bankrupt.join(", ")} trắng tay, và một phần là vì bạn.` : ""} ${friends.length ? `${friends.join(", ")} tin bạn đến cuối.` : ""} ${enemies.length ? `${enemies.join(", ")} thì không bao giờ.` : ""}`;
  const p3 = `Khi nấm mộ đã xanh cỏ, ${L.c.g < 8000 ? "làng" : "khu phố"} nhớ gì về bạn? ${good ? `Người ta nhớ ${good.note || LW.TAG_VN[good.tag]}.` : ""} ${bad ? `Người ta cũng nhớ ${bad.note || LW.TAG_VN[bad.tag]}.` : ""} ${!good && !bad ? "Không nhiều. Bạn là một người đi qua, và ở nơi này điều đó không hiếm." : R.reputation_final >= 65 ? `Tên bạn được nhắc khi người ta cần ví dụ về một người tử tế.` : R.reputation_final <= 35 ? `Tên bạn được nhắc khi người ta dặn con cẩn thận.` : "Tên bạn được nhắc, thỉnh thoảng, không tốt không xấu."}`;
  const own = (L.actLog || []).filter(a => a.kind === "proactive").map(a => ({ a, m: L.lw.cz.marks.find(m => m.key === a.key) })).filter(x => x.m)
    .sort((x, y) => (y.m.consequences.length + y.m.doors_closed.length) - (x.m.consequences.length + x.m.doors_closed.length) || x.a.age - y.a.age).slice(0, 3).sort((x, y) => x.a.age - y.a.age);
  const p4 = own.length ? `Những điều bạn tự quyết, không ai bày cho: ${own.map(x => `${x.a.text} (năm ${x.a.age} tuổi)`).join(", ")}.` : "";
  const forks = Argon.turningLegacy ? Argon.turningLegacy(factContext(L)) : [];
  const p5 = forks.length ? "Những ngã rẽ còn được nhớ: " + forks.join(" ") : "";
  return [p1, p2, p3 + (p4 ? " " + p4 : "") + (p5 ? " " + p5 : "")].map(x => x.replace(/\s+/g, " ").trim());
}

/* ---- Chuyện nhỏ: 1–3 mỗi năm ---- */
function microScene(L, ctx) {
  const lw = L.lw; if (!lw || L.pending || !L.alive || (lw.decisions || 0) >= (lw.budget || 0)) return false;
  ctx = ctx || factContext(L);
  const cnt = {}, last = {}; for (const h of lw.history) { cnt[h.id] = (cnt[h.id] || 0) + 1; last[h.id] = h.age; }
  // Ngân sách lặp: mỗi thẻ tối đa maxPerLife lần (mặc định 1), lần lặp phải cách lần trước ≥ 10 năm.
  // Thẻ tiền: tối đa 1 thẻ mỗi năm (spec tiền bạc §13).
  const moneyDone = lw.history.some(h => h.age === L.age && MONEY_IDS().has(h.id));
  const pool = pools().micro.filter(s => (cnt[s.id] || 0) < (s.meta && (s.meta.path || s.meta.kind === "money") ? (s.maxPerLife ?? 1) : 1) && (last[s.id] === undefined || L.age - last[s.id] >= 10) && !(moneyDone && s.meta && s.meta.kind === "money"));
  // Chuyện mới trước: chỉ cho một thẻ quay lại khi không còn thẻ nào chưa gặp.
  const opts = { minUrgency: 0, history: lw.history, age: L.age };
  // Trong mùa: thẻ của mùa trước (thứ tự khai báo), rồi cảnh phụ gắn tag mùa; thẻ ngoài mùa chỉ khi rng < 0.3.
  const se = lw.season;
  if (se) { const ss = nextSeasonCard(L); if (ss) { fireSeasonCard(L, ss); return true; } if (!lw.season) ctx = factContext(L); }
  let st = null;
  if (lw.season) { const tagged = pool.filter(s => s.meta && s.meta.season && s.meta.season.includes(lw.season.id));
    st = Argon.selectStorylet(tagged.filter(s => !cnt[s.id]), ctx, opts, L.ar.rngStory) || Argon.selectStorylet(tagged, ctx, opts, L.ar.rngStory);
    if (!st && L.ar.rngStory.next() >= 0.3) return false; }
  if (!st) st = Argon.selectStorylet(pool.filter(s => !cnt[s.id]), ctx, opts, L.ar.rngStory) || Argon.selectStorylet(pool, ctx, opts, L.ar.rngStory);
  // Lấp chỗ trống: chuyện chung không theo nhánh, chỉ khi nhánh hết chuyện
  if (!st && L.ar.rngStory.next() < 0.6) { const fill = Argon.eligible(pools().generic.filter(s => !cnt[s.id]), ctx, { minUrgency: 0, history: lw.history, age: L.age }); if (fill.length) st = fill[Math.floor(L.ar.rngStory.next() * fill.length)].s; }
  if (!st) return false;
  lw.decisions = (lw.decisions || 0) + 1;
  lw.history.push({ id: st.id, age: L.age });
  const sc = sceneFromStorylet(L, st, ctx); sc.micro = true;
  let marks = []; if (st.causes) { try { marks = Argon.resolveCauses(lw.cz, st.causes(ctx) || []); } catch { } }
  if (marks.length) { Argon.attachConsequence(marks, L.age, st.id, sc.title); sc.causes = marks; }
  scene(L, sc); return true;
}
/* Sau mỗi lựa chọn, nếu năm nay còn ngân sách thì đưa tiếp một chuyện nhỏ */
function livingFollowUp(L) { if (!L.lw || L.pending || !L.alive) return; if (typeof storyCheck === "function") { storyCheck(L); if (L.storyDue || L.pending) return; } if (L.age < 6) return; microScene(L, null); }
/* ---- Thói quen trôi theo năm ---- */
function habitYear(L) {
  const c = L.lw.counters, yi = Math.max(300, householdIncome(L));
  const sm = c.smoke || 0, dr = c.drink || 0, ex = c.exercise || 0, rd = c.read || 0, sv = c.save || 0, gb = c.gamble || 0;
  if (sm > 0) { c.smoke = sm + 0.3; addSt(L, "health", -0.15 * Math.min(sm, 12)); }
  if (dr >= 2) { c.drink = dr + 0.2; addSt(L, "health", -0.12 * (dr - 2)); addSt(L, "rel", -0.1 * (dr - 2)); }
  if (ex > 0) { addSt(L, "health", 0.15 * Math.min(ex, 6)); c.exercise = ex + (L.focus === "health" ? 1 : -0.2); }
  if (rd > 0) { addSt(L, "know", 0.1 * Math.min(rd, 6)); c.read = rd + (L.focus === "study" ? 0.5 : -0.1); }
  if (sv > 0) { L.savings += 0.01 * Math.min(sv, 8) * yi; if (L.ar && L.ar.frugal) c.save = sv + 0.5; }
  if (gb >= 2) { c.gamble = gb + 0.15; L.savings -= 0.01 * gb * yi; }
  if (L.focus === "health" && sm > 0 && L.r() < 0.15) { c.smoke = Math.max(0, sm - 2); }
}

