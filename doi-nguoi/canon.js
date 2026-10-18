/* ================= CANON EVENT & MÙA (host) =================
   Lựa chọn đẩy áp lực 8 trục → một trục nổ thành canon event (dựng từ vật gài của chính đời này) → 3 cửa →
   mỗi cửa mở một Mùa chiếm mấy năm sau (luật, người mới, 3 vết, 5 nhịp) → chung kết đáp xuống đời thường.
   Engine: argon/src/engine/narrative/canon. Spec: argon/docs/superpowers/specs/2026-10-18-canon-event-design.md §2, §3, §5.
   Tất định: mọi lượt rút đi qua luồng RNG_SUB.canon, rekey theo (hạt giống, tuổi[, mùa]); không đụng luồng khác. */

let _seasonDefs = null, _seasonCards = null;
/** Độ căng storyteller tiêu đi khi một canon event nổ (thẻ mùa dùng tension của chính thẻ). */
const CANON_TENSION = 9;
/** Hệ số thu nhập của mùa đang chạy (1 ngoài mùa). Mọi chỗ đặt thu nhập tuyệt đối (assignJob, getJob, becomePath) nhân thêm hệ số này. */
function seasonIncomeMult(L) { return (L.lw && L.lw.season && L.lw.season.mult) || 1; }
/** SeasonDef theo id (5 mùa thường + mùa của 100 nhánh kỳ dị). */
function seasonDef(id) {
  if (!_seasonDefs) { _seasonDefs = new Map(); for (const d of Argon.SEASONS) _seasonDefs.set(d.id, d); for (const b of Argon.WEIRD) _seasonDefs.set(b.season.id, b.season); }
  return _seasonDefs.get(id) || null;
}
/** Thẻ của một mùa theo đúng thứ tự khai báo (R9: cùng nhịp thì thẻ khai báo trước ra trước). */
function seasonCards(id) {
  if (!_seasonCards) { _seasonCards = new Map(); for (const s of Argon.SEASON_STORYLETS) { const k = s.meta.season[0]; if (!_seasonCards.has(k)) _seasonCards.set(k, []); _seasonCards.get(k).push(s); } }
  return _seasonCards.get(id) || [];
}
/** Luồng rng riêng của canon event cho (hạt giống, tuổi, nhãn). Không rút từ luồng nào khác. */
function canonRng(L, tag) { return Argon.createRng(tag ? mix32(subSeed(L.seed, L.age, RNG_SUB.canon) ^ strHash(tag)) : subSeed(L.seed, L.age, RNG_SUB.canon)); }
/** Đã tự lập: cùng định nghĩa với moneyFacts().independent. */
function canonIndependent(L) { return !!(L.ar && !livesOnFamily(L) && L.age >= 18); }
/** Còn đường di cư (R14): cùng bộ lọc với custom migrate_now. */
function canMigrate(L) { return !L.migrated && COUNTRIES.some(d => d.g > Math.max(L.c.g * 1.5, 15000)); }
/** Nơi đang sống, cho chỗ trống {noi}. Host không có tên thành phố: thành phố hay làng. */
function placeName(L) { const fl = L.lw.sflags; return L.migrated || fl.has("path_city") || fl.has("urban") ? "thành phố" : "làng"; }

/* ---- khởi tạo lúc sinh (gọi cuối livingInit, sau khi đã có cờ origin_* / rural / only_child) ---- */
function canonInit(L) {
  const lw = L.lw; if (!lw || lw.canon) return;
  const fl = lw.sflags;
  const rural = fl.has("rural") || fl.has("origin_poor_rural");
  if (rural) fl.add("rural");
  lw.pressure = Argon.basePressure({ family_wealth: L.fam, gdp: L.c.g, sibling: !fl.has("only_child"), rural });
  lw.plants = [];
  lw.canon = { n: 0, last: -99, seasons: [] };
  lw.season = null;
  L.weird ??= 1;
}

/** Các trường canon của FactContext. nemesis để trống: mầm chưa kiểm vai cho kẻ thù (xem báo cáo Task 7). */
function canonFacts(L) {
  const lw = L.lw; if (!lw.canon) canonInit(L);
  const se = lw.season;
  return {
    pressure: { ...lw.pressure }, plants: lw.plants.slice(), season: se ? se.id : null, season_beat: se ? (lw.counters.season_beat || 0) : 0,
    canon_n: lw.canon.n, last_canon_age: lw.canon.last, weird: L.weird ?? 1, nemesis: undefined, can_migrate: canMigrate(L)
  };
}

/**
 * Người chưa tự lập không được để chung kết / luật năm / đầu mùa đụng tới quỹ chung của gia đình:
 * money đi vào tiền riêng (âm thì chỉ trừ tới hết tiền riêng), bỏ repay / borrow / restructure (nợ của nhà) và migrate_now
 * (đi nước ngoài tốn tiền vé của nhà; một đứa trẻ không tự di cư).
 * dropMoves: bỏ thêm move_city / migrate_now / job_* / become:* (đầu mùa, R15). Trả về effect còn lại để applyEffect áp.
 */
function canonOwnOnly(L, e, dropMoves) {
  if (canonIndependent(L)) return e;
  const out = { ...e };
  if (e.money) { const amt = Math.max(300, householdIncome(L)) * e.money; L.savings += amt > 0 ? amt : -Math.min(-amt, Math.max(0, L.savings)); delete out.money; }
  if (e.custom) {
    const keep = e.custom.split("|").filter(p => !/^(repay|borrow|restructure|migrate_now|migrate)(:|$)/.test(p) && !(dropMoves && /^(move_city|job_[a-z_]*|become)(:|$)/.test(p)));
    if (keep.length) out.custom = keep.join("|"); else delete out.custom;
  }
  return out;
}

/** Gọi ở đầu applyEffect. Cộng áp lực, ghi vật gài, kết mùa trước khi áp tiền của chung kết. Trả về effect để áp tiếp. */
function canonOnEffect(L, e) {
  const lw = L.lw; if (!lw || !e) return e;
  if (!lw.canon) canonInit(L);
  if (e.gamble) return e;   // phần chung và nhánh thắng/thua đi qua applyEffect riêng, mỗi phần cộng một lần
  if (!lw.canonQuiet) { const p = Argon.pressureOf(e); for (const k in p) lw.pressure[k] = (lw.pressure[k] || 0) + p[k]; }
  if (e.plant) { lw.plants.push({ ...e.plant, age: L.age, weight: 1 }); const f = Argon.plantFlag(e.plant); lw.sflags.add(f); stampP(L, Argon.prov.flag(f)); }
  const land = Argon.landingOf(e);
  if (land !== null) {
    // Gỡ hệ số thu nhập và cờ của mùa TRƯỚC khi áp tiền / thu nhập của chung kết (S39 ×50 không nhân vào tiền chung kết).
    if (lw.season) exitSeason(L, "landing", land);
    return canonOwnOnly(L, e, false);
  }
  return e;
}
function canonApplyQuiet(L, e) { const lw = L.lw; lw.canonQuiet = true; try { applyEffect(L, e); } finally { lw.canonQuiet = false; } }

/* ---- vào / ra mùa ---- */
const CANON_FEMALE = /^(bà|cô|chị|mẹ|dì|thím|mợ|em gái|người phụ nữ|nữ|góa phụ|bé gái)\b/i, CANON_MALE = /^(ông|anh|chú|cậu|bác trai|bố|cha|người đàn ông|nam|bé trai|lão)\b/i;
/** Người mới của mùa: NPC thật trong dàn nhân vật, tên theo nước đang sống. */
function seasonCastMember(L, nc, r, ar) {
  const sex = CANON_FEMALE.test(nc.label) ? "F" : CANON_MALE.test(nc.label) || nc.role === "official" || nc.role === "bully" ? "M" : (r() < 0.5 ? "M" : "F");
  const used = new Set([L.name, ...[...L.lw.cast.values()].filter(m => m.alive).map(m => m.name)]);
  let name = makeName(r, L.c, sex); for (let k = 0; k < 40 && used.has(name); k++) name = makeName(r, L.c, sex);
  const off = nc.role === "child" ? Math.min(-1, 8 - L.age) : ["mentor", "official", "first_boss", "creditor"].includes(nc.role) ? 10 + Math.floor(r() * 16) : -4 + Math.floor(r() * 10);
  const trust = nc.role === "rival" || nc.role === "bully" ? -0.1 : nc.role === "mentor" ? 0.3 : 0.1;
  const m = Argon.addCastMember(L.ar.state, L.lw.cast, ar, nc.role, name, off, trust);
  // Vai theo mùa: vai gốc (nc.role) chỉ để rút archetype. Người mới không thành người phụ thuộc, không chiếm ctx.cast.<vai chuẩn>.
  m.role = "season"; m.roles = ["season"]; m.seasonRole = nc.role; m.label = nc.label; m.dependent = false;
  L.ar.npcStart.set(m.id, L.ar.state.npcs.get(m.id).liquid);
  return m;
}

/** Vào mùa `id` (customEffect season:<id>, hoặc gọi thẳng). Mùa đang chạy bị cắt. */
function enterSeason(L, id) {
  const d = seasonDef(id); const lw = L.lw; if (!d || !lw) return false;
  if (!lw.canon) canonInit(L);
  if (lw.season) exitSeason(L, "cut");                                                           // 1
  const ctx = factContext(L);
  const scars = Argon.pickScars(ctx, lw.plants, lw.promises.filter(p => p.kept === null).map(p => ({ to: p.to, what: p.what })), x => castName(L, x)); // 2
  const rs = canonRng(L, "season:" + id), r = () => rs.next(), ar = canonRng(L, "cast:" + id);
  // 3. đặt lại: tiền (chỉ người đã tự lập, tính trên tiền riêng), hiệu ứng đầu mùa, người mới
  if (d.reset.cash !== undefined && ctx.independent) L.savings += d.reset.cash * Math.max(300, householdIncome(L)) - ctx.own_cash;
  if (d.reset.effects) canonApplyQuiet(L, canonOwnOnly(L, d.reset.effects, true));
  const cast = {};
  for (const nc of d.reset.cast || []) cast[nc.key] = seasonCastMember(L, nc, r, ar).id;
  // 4. hệ số thu nhập: sống suốt mùa (chưa có thu nhập thì việc làm sau này cũng nhân hệ số, xem seasonIncomeMult); gỡ khi ra mùa
  const want = d.rules.income ?? 1, mult = want > 0 ? want : 1;
  if (mult !== 1 && L.income > 0) L.income *= mult;
  // 5. cờ thế giới của mùa + cờ đã chơi (R7)
  for (const f of d.rules.flags || []) lw.sflags.add(f);
  lw.sflags.add(Argon.playedFlag(id));
  // 6. nhịp
  lw.counters.season_beat = 0; lw.counters.season_next = L.age;
  // 7. trạng thái
  const len = Argon.seasonLength(d, L.age, r());
  const n = lw.canon.seasons.length + 1;
  lw.season = { id, n, from: L.age, end: L.age + len, scars, mult, cast, lastAt: L.age, beatAt: null, yearAt: L.age };
  // 8.
  log(L, `Mùa ${n}: ${d.vn}.`, "big");
  return true;
}

/** Ra khỏi mùa đang chạy. reason: "landing" (chung kết) | "cut" (canon event mới cắt ngang) | "lapsed" (chung kết không ra được thẻ) | "death". */
function exitSeason(L, reason, landing) {
  const lw = L.lw, se = lw && lw.season; if (!se) return null;
  const d = seasonDef(se.id);
  if (se.mult && se.mult !== 1 && L.income > 0) L.income /= se.mult;
  for (const f of (d && d.rules.flags) || []) lw.sflags.delete(f);
  const rec = { id: se.id, from: se.from, to: L.age, reason, landing: landing ?? null };
  lw.canon.seasons.push(rec);
  lw.season = null; lw.counters.season_beat = 0; delete lw.counters.season_next;
  if (reason === "landing" && d) { const l = d.landings.find(x => x.id === landing); if (l && l.line) log(L, l.line, "good big"); }
  else if (reason === "cut" && d) log(L, `${d.vn} khép lại giữa chừng.`, "big");
  return rec;
}
/** Gọi khi qua đời (die). */
function canonDeath(L) { if (L.lw && L.lw.season) exitSeason(L, "death"); }

/** Bộ công cụ tên của mùa đang chạy (như thẻ mùa thấy), hoặc null. */
function seasonKit(L) { const se = L.lw && L.lw.season; const d = se && seasonDef(se.id); return d ? Argon.seasonKitFromNames(d, id => castName(L, id), 0) : null; }

/** Tên cho các khóa đặc biệt của thẻ mùa / canon: scar:<k>, npc:<key>, place. castName chuyển các khóa này sang đây. */
function canonName(L, id) {
  if (id === "place") return placeName(L);
  const se = L.lw && L.lw.season;
  if (id.startsWith("scar:")) {
    if (!se) return "";
    return Argon.scarText(se.scars, id.slice(5), x => castName(L, x), x => { const m = L.lw.cast.get(x); return !!m && m.alive; });
  }
  if (id.startsWith("npc:")) { const cid = se && se.cast[id.slice(4)]; const m = cid && L.lw.cast.get(cid); return m ? m.name : ""; }
  return "";
}
function isCanonKey(id) { return typeof id === "string" && (id === "place" || id.startsWith("scar:") || id.startsWith("npc:")); }

/* ---- vòng năm ---- */
/** Luật năm của mùa (rules.yearly), đúng một lần mỗi năm trong mùa (không tính năm vào mùa). */
function seasonYearly(L) {
  const lw = L.lw, se = lw && lw.season; if (!se || se.yearAt >= L.age) return;
  se.yearAt = L.age;
  const d = seasonDef(se.id), y = d && d.rules.yearly;
  if (y) canonApplyQuiet(L, canonOwnOnly(L, y, false));
}

/**
 * Thẻ mùa kế tiếp (thứ tự khai báo), hoặc null. Hết thẻ khả thi của nhịp hiện tại thì sang nhịp sau:
 * season_next = (tuổi lúc nhịp hiện tại mở) + beatGap(độ dài mùa), để các nhịp cách đều nhau dù một nhịp tràn sang năm sau.
 */
function nextSeasonCard(L) {
  const lw = L.lw, se = lw.season; if (!se) return null;
  const done = new Set(lw.history.map(h => h.id));
  for (let guard = 0; guard < 6 && lw.season; guard++) {
    if ((lw.counters.season_next ?? 0) > L.age) return null;
    const beat = lw.counters.season_beat || 0, ctx = factContext(L);
    const st = seasonCards(se.id).find(s => !done.has(s.id) && (() => { try { return s.prerequisites(ctx); } catch { return false; } })());
    if (st) return st;
    if (beat >= 4) { if (L.age >= se.end + 2) exitSeason(L, "lapsed"); return null; }   // chung kết không ra được thẻ nào: đóng mùa
    lw.counters.season_beat = beat + 1;
    lw.counters.season_next = (se.beatAt ?? L.age) + Argon.beatGap(se.end - se.from);
    se.beatAt = null;
  }
  return null;
}
/** Khóa nhân quả của 3 vết: nhịp cú lật và chung kết dùng vết, nên cảnh in "Vì năm N…" về lựa chọn đã gieo vết đó. */
function scarCauses(L, se) {
  const keys = [], sc = se.scars || {};
  for (const k of ["do", "no"]) { const x = sc[k]; const p = x && L.lw.plants.find(q => q.key === x.key); if (p) keys.push(Argon.prov.flag(Argon.plantFlag(p))); }
  if (sc.nguoi) keys.push(Argon.prov.opinion(sc.nguoi.npc));
  return keys;
}
function fireSeasonCard(L, st, ctx) {
  const se = L.lw.season; se.lastAt = L.age; if (se.beatAt == null) se.beatAt = L.age;
  const beat = L.lw.counters.season_beat || 0;
  fire(L, beat === 2 || beat === 4 ? { ...st, causes: () => scarCauses(L, se) } : st, ctx || factContext(L));
}

/** Cảnh canon event: bọc canonView như sceneFromStorylet, ghi lịch sử, tính ngân sách, nối nhân quả về vật gài đã dùng. */
function canonScene(L, ev) {
  const lw = L.lw, view = Argon.canonView(ev);
  lw.decisions = (lw.decisions || 0) + 1;
  lw.history.push({ id: ev.id, age: L.age });
  Argon.onFired(lw.st, L.age, CANON_TENSION, L.ar.rngStory);
  const sc = sceneFromStorylet(L, { id: ev.id, build: () => view }, null);
  sc.canon = { axis: ev.axis, seed: ev.seed, seasons: ev.doors.map(d => d.season) };
  const keys = [];
  if (ev.slots.what && ev.slots.what.kind !== "asset") keys.push(Argon.prov.flag(Argon.plantFlag(ev.slots.what)));
  if (ev.slots.who) { for (const p of lw.plants) if (p.npc === ev.slots.who) keys.push(Argon.prov.flag(Argon.plantFlag(p))); keys.push(Argon.prov.opinion(ev.slots.who)); }
  let marks = []; try { marks = Argon.resolveCauses(lw.cz, keys); } catch { marks = []; }
  if (marks.length) { Argon.attachConsequence(marks, L.age, ev.id, sc.title); sc.causes = marks; }
  lw.canon.fromPlayer = (lw.canon.fromPlayer || 0) + (ev.slots.fromPlayer > 0 ? 1 : 0);
  return sc;
}

/** Gọi trong livingYear ngay sau promiseDueScene. true nếu đã đặt cảnh. */
function canonYear(L) {
  const lw = L.lw; if (!lw.canon) canonInit(L);   // luật năm của mùa đã chạy ở livingYear (seasonYearly sau habitYear)
  const se = lw.season;
  if (se && L.age >= se.end && (lw.counters.season_beat || 0) < 4) { lw.counters.season_beat = 4; lw.counters.season_next = L.age; }   // quá hạn: ép chung kết
  const ctx = factContext(L);
  const axis = Argon.dueAxis(ctx);
  if (axis) {
    const ev = Argon.generateCanon(ctx, axis, lw.plants, canonRng(L), id => castName(L, id), Argon.CANON_SEEDS, Argon.WEIRD);
    if (ev) { scene(L, canonScene(L, ev)); return true; }
  }
  const st = nextSeasonCard(L);
  if (st) { fireSeasonCard(L, st); return true; }
  return false;
}

/** customEffect: canon:<trục> | season:<id> | season_end:<landing> | các custom của Task 8 (no-op). true nếu đã xử lý. */
function canonCustom(L, kind, arg) {
  const lw = L.lw;
  switch (kind) {
    case "canon": { if (!lw.canon) canonInit(L); if (arg in lw.pressure) lw.pressure[arg] = Math.max(0, lw.pressure[arg] - Argon.DISCHARGE); lw.canon.n++; lw.canon.last = L.age; return true; }
    case "season": enterSeason(L, arg); return true;
    case "season_end": if (lw.season) exitSeason(L, "landing", arg || null); return true;   // thường đã kết ở canonOnEffect
    case "swap_other": case "remark": case "age_skip": case "longevity": return true;          // Task 8
  }
  return false;
}
