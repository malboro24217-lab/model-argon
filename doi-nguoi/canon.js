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

/** Các trường canon của FactContext. nemesis: kẻ thù truyền kiếp (Argon.nemesisOf trên cast/opinion factContext vừa dựng; Task 20). */
function canonFacts(L, cast, opinion) {
  const lw = L.lw; if (!lw.canon) canonInit(L);
  const se = lw.season;
  return {
    pressure: { ...lw.pressure }, plants: lw.plants.slice(), season: se ? se.id : null, season_beat: se ? (lw.counters.season_beat || 0) : 0,
    canon_n: lw.canon.n, last_canon_age: lw.canon.last, weird: L.weird ?? 1, nemesis: cast && opinion ? Argon.nemesisOf({ cast, opinion }) : undefined, can_migrate: canMigrate(L)
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
  if (e.money) { const amt = seasonYearlyBase(L) * e.money; L.savings += amt > 0 ? amt : -Math.min(-amt, Math.max(0, L.savings)); delete out.money; }
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
  if (e.custom && customParts(e.custom).includes("swap_other") && !lw.swapping) return canonSwap(L, e);   // Task 8b: đổi đời trước, phần còn lại áp lên đời mới
  if (!lw.canonQuiet) { const p = Argon.pressureOf(e); for (const k in p) lw.pressure[k] = (lw.pressure[k] || 0) + p[k]; }
  if (e.plant) { lw.plants.push({ ...e.plant, age: L.age, weight: 1 }); const f = Argon.plantFlag(e.plant); lw.sflags.add(f); stampP(L, Argon.prov.flag(f)); }
  if (lw.season && !lw.canonQuiet) Argon.dropPlants(lw.plants, Argon.settledPlant(e, lw.season.scars && lw.season.scars.no));   // Task 20c: trả nợ / giữ lời trong mùa thì mầm ở vết "no" hết "chưa trả"
  const land = Argon.landingOf(e);
  if (land !== null) {
    // Gỡ hệ số thu nhập và cờ của mùa TRƯỚC khi áp tiền / thu nhập của chung kết (S39 ×50 không nhân vào tiền chung kết).
    if (lw.season) exitSeason(L, "landing", land);
    return sureMigrate(canonOwnOnly(L, e, false));
  }
  return e;
}
function canonApplyQuiet(L, e) { const lw = L.lw; lw.canonQuiet = true; try { applyEffect(L, e); } finally { lw.canonQuiet = false; } }

/* ---- vào / ra mùa ---- */
// Hết từ: khoảng trắng / dấu câu / hết chuỗi (\b của JS không hiểu chữ có dấu: "cô\b" hỏng sau "ô").
const CANON_FEMALE = /^(bà|cô|chị|mẹ|dì|thím|mợ|em gái|người phụ nữ|nữ|góa phụ|bé gái)(?=[\s,.;:]|$)/i, CANON_MALE = /^(ông|anh|chú|cậu|bác trai|bố|cha|người đàn ông|nam|bé trai|lão)(?=[\s,.;:]|$)/i;
/** Người mới của mùa: NPC thật trong dàn nhân vật, tên theo nước đang sống. */
function seasonCastMember(L, nc, r, ar) {
  const sex = CANON_FEMALE.test(nc.label) ? "F" : CANON_MALE.test(nc.label) || nc.role === "official" || nc.role === "bully" ? "M" : (r() < 0.5 ? "M" : "F");
  const name = canonFreshName(L, r, sex);   // không trùng tên gọi của bạn hay của người đang sống trong đời bạn, không trùng tên người thật nổi tiếng
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
  const scars = Argon.pickScars(ctx, lw.plants, lw.promises.filter(p => p.kept === null).map(p => ({ to: p.to, what: p.what })), x => castName(L, x), lw.canon.lastScars); // 2
  Argon.usePlants(lw.plants, Argon.scarPlants(scars), L.age); lw.canon.lastScars = scars;        // Task 20c: mầm đã thành vết; mùa sau tránh vết của mùa này
  const rs = canonRng(L, "season:" + id), r = () => rs.next(), ar = canonRng(L, "cast:" + id);
  // 3. đặt lại: tiền (chỉ người đã tự lập, tính trên tiền riêng), hiệu ứng đầu mùa, người mới
  if (d.reset.cash !== undefined && ctx.independent) L.savings += Argon.resetCashDelta(d.reset.cash * Math.max(300, householdIncome(L)), ctx.own_cash);
  if (d.reset.effects) canonApplyQuiet(L, sureMigrate(canonOwnOnly(L, d.reset.effects, true)));   // di cư của mùa chắc chắn thành (migrate_sure)
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
  seasonEnterLog(L, n, d);   // cùng năm với mùa vừa bị cắt: gộp thành một dòng, dòng cắt đọc trước
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
  otherSelfOnExit(L, se, rec);   // Task 8b: dòng "Bản kia của bạn" lúc hết mùa
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
  if (ev.slots.what && ev.slots.what.kind !== "asset" && canonMentionsText(view, ev.slots.what.label)) keys.push(Argon.prov.flag(Argon.plantFlag(ev.slots.what)));
  if (ev.slots.who && canonMentions(L, view, ev.slots.who)) { for (const p of lw.plants) if (p.npc === ev.slots.who) keys.push(Argon.prov.flag(Argon.plantFlag(p))); keys.push(Argon.prov.opinion(ev.slots.who)); }
  let marks = []; try { marks = Argon.resolveCauses(lw.cz, keys); } catch { marks = []; }
  if (marks.length) { Argon.attachConsequence(marks, L.age, ev.id, sc.title); sc.causes = marks; }
  lw.canon.fromPlayer = (lw.canon.fromPlayer || 0) + (ev.slots.fromPlayer > 0 ? 1 : 0);
  canonSceneHook(L, sc, ev);   // Task 8b: bản kia của bạn ở mỗi cửa, chữ AI đã lưu (bản tua lại)
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
    if (ev) { Argon.usePlants(lw.plants, Argon.eventPlants(ev.slots, lw.plants), L.age); scene(L, canonScene(L, ev)); return true; }   // Task 20c: mầm đã điền chỗ trống
  }
  const st = nextSeasonCard(L);
  if (st) { fireSeasonCard(L, st); return true; }
  return false;
}

/** customEffect: canon:<trục> | season:<id> | season_end:<landing> | swap_other | remark | age_skip:<n> | longevity:<n>. true nếu đã xử lý. */
function canonCustom(L, kind, arg) {
  const lw = L.lw;
  switch (kind) {
    case "canon": { if (!lw.canon) canonInit(L); if (arg in lw.pressure) lw.pressure[arg] = Math.max(0, lw.pressure[arg] - Argon.DISCHARGE); lw.canon.n++; lw.canon.last = L.age; return true; }
    case "season": enterSeason(L, arg); return true;
    case "season_end": if (lw.season) exitSeason(L, "landing", arg || null); return true;   // thường đã kết ở canonOnEffect
    case "swap_other": return true;                       // đã xử lý ở canonOnEffect (canonSwap); gọi lẻ thì không làm gì
    case "remark": canonRemark(L); return true;
    case "migrate_sure": migrateSure(L); return true;
    case "money_season": L.savings += seasonMoneyYearly(L) * (+arg || 0); return true;   // R24: phần thưởng nhân hệ số mùa, phải khai báo rõ
    case "age_skip": ageSkip(L, +arg || 0); return true;
    case "longevity": addLongevity(L, +arg || 0); return true;
  }
  return false;
}

/* ================= Task 8b: Độ điên, bản kia của bạn, chữ AI, custom của host =================
   Mọi thứ ở đây tất định và tua lại được: Độ điên đi qua uiOp (actLog kind "ui"), chữ AI đi qua actLog kind "canon_text",
   swap_other / remark / age_skip / longevity chỉ đọc trạng thái đời và các luồng rng đã có. */
function customParts(c) { return typeof c === "string" && c ? c.split("|") : []; }

/** Độ điên: 0 Đời thật, 1 Phim, 2 Điên. Ghi uiOp { k: "weird", v } (choice.js) để bản tua lại áp lại đúng chỗ. Ô chọn ở menu gọi window.setWeird. */
function setWeird(L, v) {
  v = +v;
  if (!L || L.alive === false || L.replay || !(v === 0 || v === 1 || v === 2)) return false;
  return uiOp(L, { k: "weird", v });
}

/* ---- Bản kia của bạn ---- */
/** Cửa "kế tiếp không được chọn" của một cảnh có n cửa: cửa liền sau, vòng về đầu. -1 nếu chỉ có một cửa. */
function otherDoor(n, picked) { return n > 1 && picked >= 0 ? (picked + 1) % n : -1; }
/** Dòng lúc vào mùa: tên mùa của cửa kế tiếp không được chọn. ev là canon event (doors) hoặc cảnh canon (canon.seasons). */
function otherSelfLine(L, ev, picked) {
  const seasons = ev && (ev.canon ? ev.canon.seasons : Array.isArray(ev.doors) ? ev.doors.map(d => d.season) : null);
  if (!seasons) return "";
  const k = otherDoor(seasons.length, picked), d = k >= 0 ? seasonDef(seasons[k]) : null;
  return d ? `Ở dòng thời gian kia, bạn vừa bước vào Mùa: ${d.vn}.` : "";
}
/**
 * Dòng lúc hết mùa: tua đời phản thực (replayLife với cửa khác ở canon event mở mùa này) tới đúng tuổi hiện tại,
 * lấy mùa và chung kết của bản kia trong cùng khoảng tuổi. "" khi đang tua lại / tự chơi / theo kịch bản (đắt, và
 * không đổi gì của đời này). Lưu rồi khôi phục G.life (replayLife đọc focusLog của G.life).
 */
function otherSelfEnd(L, se) {
  se = se || (L && L.lw && L.lw.season);
  if (!L || L.replay || L.auto || L.script || !se || !se.other) return "";
  const o = se.other, to = L.age, from = se.from;
  const was = typeof G !== "undefined" ? G.life : null;
  let snap = null;
  try {
    if (typeof G !== "undefined") G.life = L;
    replayLife(L.seed, L.choices, { key: o.key, index: o.index }, L.actLog || [], P => {
      if (snap || (P.alive && P.age < to)) return;
      snap = { age: P.age, alive: P.alive, season: P.lw.season ? { id: P.lw.season.id, from: P.lw.season.from } : null, seasons: (P.lw.canon ? P.lw.canon.seasons : []).map(s => ({ ...s })) };
      P.alive = false;   // đủ rồi: dừng bản tua lại ở tuổi này (giới hạn thời gian)
    });
  } catch (e) { snap = null; }
  finally { if (typeof G !== "undefined") G.life = was; }
  if (!snap) return "";
  if (!snap.alive) return `Ở dòng thời gian kia, bạn đã mất năm ${snap.age} tuổi.`;
  const name = id => { const d = seasonDef(id); return d ? d.vn : "một mùa không tên"; };
  if (snap.season && snap.season.from <= to) return `Ở dòng thời gian kia, bạn vẫn đang ở giữa Mùa: ${name(snap.season.id)}.`;
  const ov = snap.seasons.filter(s => s.to >= from && s.from <= to);
  const s = ov.find(x => x.id === o.season) || ov[ov.length - 1];
  if (!s) return "Ở dòng thời gian kia, những năm ấy trôi qua bình thường, không có mùa nào.";
  const d = seasonDef(s.id), land = s.reason === "landing" && d ? d.landings.find(x => x.id === s.landing) : null;
  if (land && land.line) return `Ở dòng thời gian kia, Mùa: ${name(s.id)} đã khép lại năm ${s.to} tuổi. ${land.line}`;
  return `Ở dòng thời gian kia, Mùa: ${name(s.id)} dang dở, khép lại năm ${s.to} tuổi.${s.line ? " " + s.line : ""}`;
}
/** Gọi ở cuối exitSeason. Chết thì thôi (đời đã hết); đang đổi chỗ (swap_other) cũng thôi. */
function otherSelfOnExit(L, se, rec) {
  if (!rec) return;
  if (rec.reason === "cut") { const e = L.log[L.log.length - 1]; if (e && e.age === L.age) e.cut = true; }   // seasonEnterLog gộp dòng này với "Mùa N"
  if (rec.reason === "landing" && !L.replay) seasonLandingNote(L, se, rec);
  if (se && se.mult && se.mult !== 1) rec.mult = se.mult;   // money_season ở chung kết dùng hệ số của mùa vừa kết
  if (rec.reason !== "landing" && se) rec.line = seasonEndLine(L, se, rec.reason);   // câu kết cho mùa cắt / dang dở / tự khép (tất định)
  if (rec.reason === "death" || !se || !se.other || (L.lw && L.lw.swapping)) return;
  const line = otherSelfEnd(L, se);
  if (line) log(L, line, "other");
}
/**
 * Gọi ở cuối canonScene. Mỗi cửa: sau khi vào mùa thì nhớ cửa kế tiếp không được chọn (se.other, cho otherSelfEnd)
 * và ghi dòng "Bản kia của bạn". Bản tua lại: nếu actLog có chữ AI (canon_text) cho cảnh này thì hiện đúng chữ đó.
 */
function canonSceneHook(L, sc, ev) {
  const seasons = sc.canon.seasons;
  sc.canon.ctx = { who: ev.slots.who ? castName(L, ev.slots.who) : "", what: ev.slots.what ? (ev.slots.what.label || ev.slots.what.key || "") : "" };
  sc.choices.forEach((ch, i) => {
    const fx = ch.fx;
    ch.fx = L2 => {
      fx(L2);
      const se = L2.lw && L2.lw.season, k = otherDoor(seasons.length, i);
      if (!se || se.id !== seasons[i] || se.from !== L2.age || k < 0) return;
      se.other = { key: sc.key, index: k, season: seasons[k] };
      if (!L2.replay) { const line = otherSelfLine(L2, sc, i); if (line) log(L2, line, "other"); }
    };
  });
  if (L.replay && L.replayActs) { const rec = L.replayActs.find(a => a.kind === "canon_text" && a.key === sc.key && a.age === L.age); if (rec) applyCanonText(sc, rec.raw); }
}

/* ---- Chữ AI cho canon event ---- */
/** Kiểm JSON AI trả về: { title, text, doors: [nhãn × số cửa] }. Trả bản sạch hoặc null. */
function canonTextOk(raw, n) {
  if (!raw || typeof raw !== "object") return null;
  const t = typeof raw.title === "string" ? raw.title.trim() : "", x = typeof raw.text === "string" ? raw.text.trim() : "";
  const d = Array.isArray(raw.doors) ? raw.doors.map(v => typeof v === "string" ? v.trim() : "") : [];
  if (t.length < 3 || t.length > 70 || x.length < 20 || x.length > 700 || d.length !== n || d.some(v => v.length < 2 || v.length > 60)) return null;
  if ([t, x, ...d].some(v => /[{}<>]|undefined/.test(v))) return null;
  return { title: t, text: x, doors: d };
}
/** Áp chữ (title, text, nhãn cửa) lên cảnh. Hiệu ứng của cửa (fx, _fx) giữ nguyên. */
function applyCanonText(sc, raw) {
  const r = canonTextOk(raw, sc.choices.length); if (!r) return false;
  sc.title = r.title; sc.text = r.text; r.doors.forEach((l, i) => { sc.choices[i].label = l; });
  sc.canon.ai = "done";
  return true;
}
function canonAiPrompt(L, sc) {
  const lw = L.lw, se = lw.season;
  const doors = sc.choices.map((c, i) => ({ nhan: c.label, goi_y: c.hint || "", mo_mua: (seasonDef(sc.canon.seasons[i]) || {}).vn || "" }));
  const vet = lw.plants.slice(-6).map(p => p.label || p.key);
  const ctx = { nuoc: L.c.n, tuoi: L.age, gioi: L.sex === "M" ? "nam" : "nữ", nghe: L.retired ? "đã nghỉ hưu" : (L.job || "chưa đi làm"), hon_nhan: L.married ? "đã kết hôn" : L.widowed ? "góa" : "độc thân",
    cho_trong: sc.canon.ctx || {}, vat_gai: vet, mua_dang_chay: se ? (seasonDef(se.id) || {}).vn || "" : "", tieu_de: sc.title, doan_mo: sc.text, cua: doors };
  return `Bạn là biên kịch của một trò chơi mô phỏng cuộc đời. Đây là một biến cố lớn (canon event) của nhân vật, dựng từ chính những gì đời họ đã gieo. Hãy viết lại tiêu đề, đoạn mở và nhãn của từng cửa bằng tiếng Việt có dấu, giọng điện ảnh nhưng cụ thể, đúng nước và hoàn cảnh. Giữ nguyên ý nghĩa của từng cửa và thứ tự cửa (cửa i vẫn dẫn tới đúng mùa mo_mua của nó), giữ tên người trong cho_trong nếu có. Không dùng người thật, tổ chức thật, thương hiệu thật, tôn giáo cụ thể; không nội dung tình dục; chuyện phạm pháp chỉ kể hậu quả.

Trả lời CHỈ bằng một object JSON, không có chữ nào khác:
{"title":"≤ 60 ký tự","text":"2–4 câu, ≤ 500 ký tự","doors":[${doors.map(() => '"≤ 40 ký tự"').join(",")}]}

BỐI CẢNH:
${JSON.stringify(ctx)}`;
}
/** Phần "text" đang viết dở trong luồng JSON (để hiện dần lên cảnh). */
function canonTextPartial(s) { const m = /"text"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(s || ""); if (!m) return ""; try { return JSON.parse('"' + m[1].replace(/\\$/, "") + '"'); } catch { return m[1]; } }
function canonTextParse(s) { if (!s) return null; const a = s.indexOf("{"), b = s.lastIndexOf("}"); if (a < 0 || b <= a) return null; try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; } }
/**
 * AI viết lại chữ của canon event đang chờ (sc = L.pending có sc.canon). Chỉ khi có NAR.sample và không phải bản tua lại.
 * Hiệu ứng giữ nguyên. Chữ chạy dần vào sceneEl (#decTxt). Xong mà cảnh vẫn đang chờ thì áp chữ và ghi actLog
 * { kind: "canon_text", age, key, raw }; bản tua lại đọc bản ghi này (canonSceneHook). Trả về Promise<boolean>.
 */
async function canonAiRewrite(L, sc, sceneEl) {
  if (!L || L.replay || !sc || !sc.canon || sc.canon.ai || typeof NAR === "undefined" || !NAR.sample || !NAR.enabled || NAR.status === "off") return false;
  sc.canon.ai = "busy";
  const key = sc.key, age = L.age, q = s => sceneEl && sceneEl.querySelector ? sceneEl.querySelector(s) : null;
  const txt = q("#decTxt"), orig = sc.text;
  let raw = null;
  try {
    const out = await NAR.sample(canonAiPrompt(L, sc), { modelTier: NAR.mode === "deep" ? "default" : "quick", onText: ({ text }) => { const p = canonTextPartial(text); if (txt && p && L.pending === sc) txt.textContent = p; } });
    raw = canonTextParse(out && typeof out === "object" ? out.text : out);
  } catch (e) { raw = null; }
  const ok = L.pending === sc && L.age === age && !!canonTextOk(raw, sc.choices.length);
  if (!ok) { sc.canon.ai = "fail"; if (txt && L.pending === sc) txt.textContent = orig; return false; }
  applyCanonText(sc, raw);
  L.actLog = L.actLog || []; L.actLog.push({ kind: "canon_text", age, key, raw: canonTextOk(raw, sc.choices.length) });
  if (typeof render === "function" && typeof document !== "undefined") render();
  return true;
}

/* ---- age_skip:<n> và longevity:<n> ---- */
/** Tuổi sinh học (tử vong, sức khỏe nền): tuổi thật trừ phần được sống thêm, không trẻ hơn 25 (hoặc tuổi thật nếu chưa tới). */
function bioAge(L) { const n = L.longevity || 0; return n > 0 ? Math.max(Math.min(L.age, 25), L.age - n) : L.age; }
/** Nhảy n năm: tuổi tăng n, dàn nhân vật già theo từng năm (có thể có người mất), thước đời không có năm trống. */
function ageSkip(L, n) {
  n = Math.max(0, Math.min(40, Math.round(n), 110 - L.age)); if (!n || !L.alive || !L.lw) return;
  for (let k = 0; k < n; k++) { L.age++; castYear(L); L.map.push({ h: L.st.happy, skip: true }); }
  log(L, `${n} năm trôi qua mà bạn không hề hay biết. Giờ bạn đã ${L.age} tuổi.`, "big");
}
/** Sống thêm n năm: tuổi sinh học lùi n năm (deathQ, growth đọc bioAge). */
function addLongevity(L, n) {
  n = Math.max(0, Math.min(60, Math.round(n))); if (!n) return;
  L.longevity = (L.longevity || 0) + n;
  log(L, `Cơ thể bạn chậm lại: bạn sẽ già muộn hơn người thường ${n} năm.`, "big");
}

/* ---- remark: chọn lại một lựa chọn cũ ---- */
const REMARK_DROP = /^(season|season_end|canon|swap_other|remark|age_skip|longevity)(:|$)/;
/**
 * Viết lại một dấu ấn cũ: lấy dấu ấn có nhiều hệ quả nhất (hòa thì sớm nhất) của một storylet còn dựng lại được,
 * đổi choice sang cửa khác đã từng hiện, mở lại các cửa nó đã đóng, rồi áp hiệu ứng của lựa chọn mới (bỏ các custom của mùa).
 * Tất định: chỉ đọc dấu ấn và dựng lại storylet; L.choices không đổi nên bản tua lại làm đúng như vậy.
 */
function canonRemark(L) {
  const lw = L.lw; if (!lw) return null;
  const P = pools(), byId = new Map();
  for (const s of P.major.concat(P.micro)) if (!byId.has(s.id)) byId.set(s.id, s);
  const cands = lw.cz.marks.filter(m => !m.remark && m.age < L.age && m.key && m.alt_indices && m.alt_indices.length && m.altLabels && !/^(canon_|ss_)/.test(m.storylet) && byId.has(m.storylet))
    .sort((a, b) => (b.consequences.length + b.doors_closed.length) - (a.consequences.length + a.doors_closed.length) || a.age - b.age);
  const ctx = factContext(L), names = id => castName(L, id);
  for (const m of cands) {
    let view; try { view = byId.get(m.storylet).build(ctx, names); } catch { continue; }
    const alt = m.alt_indices.find(k => view.choices[k] && view.choices[k].effects && view.choices[k].label === m.altLabels[k]);
    if (alt === undefined) continue;
    const e = { ...view.choices[alt].effects };
    if (e.custom) { const keep = customParts(e.custom).filter(p => !REMARK_DROP.test(p)); if (keep.length) e.custom = keep.join("|"); else delete e.custom; }
    const old = m.choice, label = m.altLabels[alt];
    m.remark = { age: L.age, from: old, index: m.choice_index };
    m.choice = label; m.choice_index = alt; m.alt_indices = [];   // không đưa dấu ấn đã viết lại vào "Cuộc đời suýt có"
    for (const d of m.doors_closed) lw.cz.doors.delete(d);
    m.doors_closed = [];
    log(L, `Ký ức năm ${m.age} tuổi được viết lại: trong chuyện “${m.title}”, bạn đã chọn “${label}” thay vì “${old}”.`, "big");
    const w = m.witnesses && m.witnesses[0];
    applyEffect(L, e, w && L.ar.state.npcs.has(w) ? w : undefined);
    return m;
  }
  log(L, "Không còn ký ức nào đủ rõ để viết lại.");
  return null;
}

/* ---- swap_other: đổi chỗ với bản kia (nhánh S22) ---- */
/** Những trường của đời gốc giữ lại khi đổi chỗ: đầu vào để tua lại (lựa chọn, actLog, trọng tâm từng năm), trạng thái tua lại, nhật ký đã đọc. */
const SWAP_KEEP = ["choices", "actLog", "actSeq", "focusLog", "log", "seen", "decades", "auto", "script", "override", "replay", "replayActs", "replayDone", "uiDone", "scriptFocus", "scriptStrict", "nextAi", "aiReady", "aiPending", "weird", "forkOf", "uiNotes"];
/**
 * custom "swap_other" (canonOnEffect gọi trước mọi phần khác của effect):
 *  1. đang ở mùa và effect là chung kết thì kết mùa trước (giữ 3 vết của mùa);
 *  2. lấy canon event trước canon event mở mùa này (dấu ấn của nó), dựng đời phản thực bằng resumeFrom với cửa kế tiếp;
 *  3. tự chơi bản kia tới tuổi hiện tại, chép 3 vết sang, thay nội dung của chính object L (G.life vẫn trỏ vào L);
 *  4. trả phần còn lại của effect (bỏ swap_other, season_end) để applyEffect áp lên đời mới.
 * Không có canon event trước, hoặc bản kia không sống tới tuổi này: không đổi gì, phần còn lại vẫn áp lên đời cũ.
 * Bản tua lại đi đúng đường đời gốc tới chung kết này rồi đổi chỗ y như vậy (đầu vào giữ nguyên trong SWAP_KEEP).
 */
function canonSwap(L, e) {
  const lw = L.lw, se = lw.season, land = Argon.landingOf(e);
  const scars = se ? se.scars : null, cur = se ? se.from : L.age + 1;
  let rec = null;
  lw.swapping = true;
  try { if (se && land !== null) rec = exitSeason(L, "landing", land); } finally { lw.swapping = false; }
  const rest = { ...e }, keep = customParts(e.custom).filter(p => p !== "swap_other" && !p.startsWith("season_end"));
  if (keep.length) rest.custom = keep.join("|"); else delete rest.custom;
  swapOther(L, scars, cur, rec);
  let out = canonOnEffect(L, rest);
  if (land !== null) out = sureMigrate(canonOwnOnly(L, out, false));
  return out;
}
function swapOther(L, scars, before, rec) {
  const prev = L.lw.cz.marks.filter(m => /^canon_/.test(m.storylet) && m.key && m.age < before && m.alt_indices && m.alt_indices.length).pop();
  if (!prev) return false;
  const n = Object.keys(prev.altLabels || {}).length, k = otherDoor(n, prev.choice_index);
  const alt = prev.alt_indices.includes(k) ? k : prev.alt_indices[0];
  const A = L.age, src = L.replay ? { ...L, actLog: L.replayActs || [] } : L;
  const was = typeof NAR !== "undefined" ? NAR.enabled : false;
  let P = null;
  try {
    P = resumeFrom(src, { key: prev.key, index: alt, age: prev.age });
    if (P) {
      if (typeof NAR !== "undefined") NAR.enabled = false;
      P.auto = true; autoChain(P); let g = 0;   // resumeFrom dừng ngay sau lựa chọn rẽ, có thể còn cảnh đang chờ
      while (P.alive && P.age < A && g++ < 130) { stepYear(P); if (P.storyDue && !P.pending) { const st = P.storyDue; storyReplay(P); autoChain(P); if (P.storyDue === st) P.storyDue = null; } }
      P.auto = false;
    }
  } catch (err) { P = null; }
  finally { if (typeof NAR !== "undefined") NAR.enabled = was; }
  if (!P || !P.alive || P.age < A || P.pending) { log(L, P && !P.alive ? `Bản kia của bạn đã mất năm ${P.age} tuổi. Khe gương khép lại.` : "Khe gương mờ đi trước khi bạn kịp bước qua.", "other"); return false; }
  swapScars(L, P, scars);
  const kept = {}; for (const f of SWAP_KEEP) kept[f] = L[f];
  const codex = Object.assign({}, P.codex || {}, L.codex || {});   // trang sổ tay đã học thì vẫn nhớ
  for (const f of Object.keys(L)) delete L[f];
  Object.assign(L, P, kept);
  L.curMark = null; L.pending = null; L.codex = codex;
  if (rec) { L.lw.canon.seasons.push({ ...rec, swapped: true }); L.lw.canon.seasons.sort((a, b) => a.from - b.from); }
  L.lw.swap = { age: A, fork: prev.age, key: prev.key, index: alt };
  log(L, "Bạn đổi chỗ với bản kia.", "other big");
  return true;
}
/** Chép 3 vết của mùa sang đời mới: vật gài (đồ, nợ), lời hứa còn treo, và ký ức của người mang vết nếu người đó có trong đời kia. */
function swapScars(L, P, scars) {
  if (!scars) return;
  for (const k of ["do", "no"]) {
    const x = scars[k]; if (!x) continue;
    const p = L.lw.plants.find(q => q.key === x.key);
    if (p && !P.lw.plants.some(q => q.key === p.key && q.kind === p.kind)) { P.lw.plants.push({ ...p }); P.lw.sflags.add(Argon.plantFlag(p)); }
    if (x.key.startsWith("promise:")) for (const pr of L.lw.promises) if (pr.kept === null && "promise:" + pr.to === x.key && P.ar.state.npcs.has(pr.to)) P.lw.promises.push({ ...pr, mark: null });
  }
  const who = scars.nguoi && scars.nguoi.npc, toks = who && L.lw.mem.tokens.get(who);
  if (toks && P.lw.cast.has(who)) P.lw.mem.tokens.set(who, (P.lw.mem.tokens.get(who) || []).concat(toks.map(t => ({ ...t }))));
}

/* ---- Task 8b, đợt sửa sau lượt chơi thử (21b) ---- */
/** Tên gọi trong một họ tên đầy đủ theo kiểu tên của nước c (họ trước: tên gọi là chữ cuối). */
function givenOf(name, c) { const t = String(name || "").trim().split(/\s+/), p = c && NAMES[c.nm]; return (p && p.first === false ? t[t.length - 1] : t[0]) || ""; }
/** Các tên gọi đang có chủ: bạn, và mọi người còn sống trong dàn nhân vật. */
function takenGivens(L) {
  const s = new Set([givenOf(L.name, L.birthC || L.c)]);
  for (const m of L.lw.cast.values()) if (m.alive) { s.add(m.name); s.add(givenOf(m.name, L.c)); if (L.birthC) s.add(givenOf(m.name, L.birthC)); }
  return s;
}
/** Họ tên cho người mới của mùa: tên gọi chưa ai dùng, không là tên người thật nổi tiếng. Chỉ rút thêm khi trùng. */
function canonFreshName(L, r, sex) {
  const p = NAMES[L.c.nm], pool = p[sex], sur = (sex === "F" && p.SF) || p.S, fmt = (g, s) => p.first === false ? `${s} ${g}` : `${g} ${s}`;
  let name = makeName(r, L.c, sex);
  const tier = freeTier(L, pool);
  if (tier.has(givenOf(name, L.c)) || nameBlocked(name)) {
    const free = pool.filter(g => !tier.has(g));
    for (let k = 0; k < 12; k++) { name = fmt(free.length ? free[Math.floor(r() * free.length)] : pick(r, pool), pick(r, sur)); if (!nameBlocked(name)) break; }
  }
  return name;
}
/** Tên gọi phải tránh, chặt nhất mà bể tên còn cho phép: (1) bạn và mọi người đang sống trong đời bạn; (2) bạn, người trong nhà và người của mùa;
 *  (3) chỉ bạn. Bể tên mỗi nước chỉ 3–8 tên, dàn nhân vật lúc sinh đã dùng gần hết, nên khi hết tên thì nới dần chứ không trùng với chính bạn. */
const FAMILY_ROLES_NAME = new Set(["mother", "father", "sibling", "spouse", "child", "season"]);
function nameTiers(L) {
  const me = givenOf(L.name, L.birthC || L.c), all = new Set([me]), close = new Set([me]);
  for (const m of L.lw.cast.values()) { if (!m.alive) continue; const gs = [m.name, givenOf(m.name, L.c), L.birthC ? givenOf(m.name, L.birthC) : m.name];
    for (const g of gs) { all.add(g); if (FAMILY_ROLES_NAME.has(m.role) || (m.roles || []).some(x => FAMILY_ROLES_NAME.has(x))) close.add(g); } }
  return [all, close, new Set([me])];
}
function freeTier(L, pool) { const T = nameTiers(L); return T.find(t => pool.some(g => !t.has(g))) || new Set(); }
/** Canon event chỉ nối nhân quả về người ở chỗ trống `who` khi chữ của cảnh (tiêu đề, đoạn mở, cửa) thật sự nhắc tới người đó. */
function canonMentions(L, view, who) {
  const name = castName(L, who); if (!name || name === "ai đó") return false;
  return canonMentionsText(view, name);
}
/** Chữ của cảnh (tiêu đề, đoạn mở, nhãn và gợi ý của cửa) có nhắc tới `s` không (không phân biệt hoa thường). */
function canonMentionsText(view, s) {
  if (!s || typeof s !== "string") return false;
  const k = s.toLowerCase();
  return [view.title, view.text, ...(view.choices || []).map(c => (c.label || "") + " " + (c.hint || ""))].some(x => typeof x === "string" && x.toLowerCase().includes(k));
}
/** Dòng "Mùa N: …". Cùng năm có mùa vừa bị cắt (dòng cắt đánh dấu ở otherSelfOnExit) thì gộp: "X khép lại giữa chừng. Mùa N: Y." đặt sau cùng. */
function seasonEnterLog(L, n, d) {
  log(L, `Mùa ${n}: ${d.vn}.`, "big");
  const lg = L.log, me = lg[lg.length - 1];
  for (let i = lg.length - 2; i >= 0 && lg[i].age === L.age; i--) if (lg[i].cut) { const c = lg.splice(i, 1)[0]; me.text = c.text + " " + me.text; break; }
}
/** Chung kết của mùa: ghi một ghi chú giao diện (không phải quyết định, không đụng mô phỏng) để trang hiện thẻ chung kết. */
function seasonLandingNote(L, se, rec) {
  const d = seasonDef(rec.id), l = d && rec.landing ? d.landings.find(x => x.id === rec.landing) : null;
  if (!l || !l.line) return;
  (L.uiNotes = L.uiNotes || []).push({ kind: "landing", age: L.age, n: se && Number.isInteger(se.n) ? se.n : null, vn: d.vn, color: d.color, weird: d.weird || null, line: l.line });
  if (L.uiNotes.length > 6) L.uiNotes.splice(0, L.uiNotes.length - 6);
}

/* ---- Câu kết cho mọi mùa (góp ý 19/10): "bạn đã để lại điều gì ở giai đoạn này?" ----
   Chung kết đã có câu riêng (landing.line). Mùa bị cắt, dang dở lúc chết, hay tự khép lại thì dựng một câu từ trạng thái mùa:
   nhịp đang dở (từ các thẻ mùa đã ra), người mới của mùa, 3 vết. Không rút rng: biến thể chọn theo băm (id mùa, tuổi vào mùa). */
const SEASON_PHASE_VN = ["khi mọi chuyện vừa mở màn", "khi biến cố vừa nổ ra", "ngay giữa cú lật", "lúc đang chạm đáy", "khi chỉ còn một bước tới hồi kết"];
/** Nhịp xa nhất mùa này đã tới, đọc từ lịch sử thẻ mùa (ss_<mùa>_<nhịp>_<thẻ>). */
function seasonBeatReached(L, se) {
  const pre = "ss_" + se.id + "_"; let b = 0;
  for (const h of L.lw.history) if (h.age >= se.from && h.id.startsWith(pre)) { const k = parseInt(h.id.slice(pre.length), 10); if (k > b) b = k; }
  return Math.max(0, Math.min(4, b));
}
function seasonEndLine(L, se, reason) {
  if (!L || !L.lw || !se) return "";
  const phase = SEASON_PHASE_VN[seasonBeatReached(L, se)];
  // Người: người mới đầu tiên của mùa (tên + nhãn), không có thì người mang vết.
  let name = "", label = "";
  const cid = se.cast && Object.values(se.cast)[0], m = cid && L.lw.cast.get(cid);
  if (m && m.name) { name = m.name; label = m.label || ""; }
  else if (se.scars && se.scars.nguoi && se.scars.nguoi.npc) { const n = castName(L, se.scars.nguoi.npc); if (n && n !== "ai đó") name = n; }
  const sc = se.scars || {}, no = sc.no && sc.no.label ? (String(sc.no.key || "").startsWith("promise:") ? `lời hứa “${sc.no.label}”` : sc.no.label) : "";
  const thing = sc.do && sc.do.label && sc.do.key !== "job" ? sc.do.label : "";
  const v = strHash(se.id + "@" + se.from) % 2, pickWho = name && (v === 0 || (!no && !thing));
  // Chỉ nói điều có thật trong đời này (người mới của mùa, vết, nhịp); thiếu dữ liệu thì câu trung tính, không bịa thêm.
  const whoTxt = name ? `${name}${label ? ` (${label})` : ""}` : "";
  if (reason === "cut") {
    if (pickWho) return `Mùa này bị cắt ngang ${phase}; bạn chưa kịp gặp lại ${whoTxt} lần cuối.`;
    if (no) return `Mùa này bị cắt ngang ${phase}; ${no} vẫn còn treo lại.`;
    if (thing) return `Mùa này bị cắt ngang ${phase}; ${thing} ở lại với mùa ấy.`;
    return `Mùa này bị cắt ngang ${phase}.`;
  }
  if (reason === "death") {
    if (no) return `Bạn ra đi ${phase}, vẫn còn vướng ${no}.`;
    if (pickWho) return `Bạn ra đi ${phase}, khi còn đang đi cùng ${whoTxt}.`;
    if (thing) return `Bạn ra đi ${phase}, vẫn còn giữ ${thing}.`;
    return `Bạn ra đi ${phase}, khi mùa này còn dang dở.`;
  }
  if (pickWho) return `Mùa này tự khép lại ${phase}, cùng với ${whoTxt}.`;
  if (no) return `Mùa này tự khép lại ${phase}; ${no} vẫn còn đó.`;
  if (thing) return `Mùa này tự khép lại ${phase}; ${thing} ở lại với mùa ấy.`;
  return `Mùa này tự khép lại ${phase}.`;
}

/* ---- Di cư của mùa (reset, chung kết): chắc chắn thành, không tung 55% như lời mời di cư thường ---- */
function sureMigrate(e) {
  if (!e || !e.custom) return e;
  const parts = customParts(e.custom); if (!parts.includes("migrate_now")) return e;
  return { ...e, custom: parts.map(p => p === "migrate_now" ? "migrate_sure" : p).join("|") };
}
/** Như migrate_now (cùng bộ lọc nơi đến, cùng chi phí đi lại) nhưng không có nhánh "thủ tục không thành". */
function migrateSure(L) {
  L.flags.migAsked = true;
  const dest = pickWeighted(L.r, COUNTRIES.filter(d => d.g > L.c.g * 1.5 && d.g > 15000), d => d.b + (d.g > 40000 ? 1 : 0));
  if (!dest) { log(L, "Không tìm được nơi nào nhận bạn.", "bad"); return false; }
  L.savings -= incomeAt(L.c, .5) * .8;
  L.migrated = true; L.c = dest;
  log(L, `Bạn chuyển sang sống ở ${dest.n}.`, "good big"); addSt(L, "rel", -12); addSt(L, "happy", -4); getJob(L);
  return true;
}

/* ---- R24: hệ số thu nhập của mùa chỉ nhân vào lương trong mùa ---- */
/** Một năm thu nhập GỐC (bỏ hệ số mùa): đơn vị cho money:<x>, borrow / repay, cược với NPC, tiền AI cho. Ngoài mùa = householdIncome. */
function seasonYearlyBase(L) {
  const h = householdIncome(L), m = seasonIncomeMult(L);
  return Math.max(300, m !== 1 && earnsOwnLiving(L) ? h / m : h);
}
/** Một năm thu nhập CÓ hệ số mùa, cho custom money_season:<x>. Trong mùa: thu nhập hiện tại; ở chung kết (mùa vừa kết năm nay): gốc × hệ số mùa ấy. */
function seasonMoneyYearly(L) {
  if (L.lw && L.lw.season) return Math.max(300, householdIncome(L));
  const last = L.lw && L.lw.canon && L.lw.canon.seasons[L.lw.canon.seasons.length - 1];
  return seasonYearlyBase(L) * (last && last.to === L.age && last.mult ? last.mult : 1);
}
