/** Kiểm thử lớp canon event / Mùa (narrative/canon). Chạy: node --experimental-strip-types src/canon-test.ts */
import { createRng, AXES, basePressure, pressureOf, dueAxis, strongestPlant, plantFlag, pickScars, scarText, type FactContext, type Axis, type Plant } from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";
import { generateCanon, fillSlots, canonView, GENERIC_DOORS, playedFlag, isDurable, type CanonSeed, type WeirdBranch, type Slots } from "./engine/index.ts";
import { SEASONS_NORMAL } from "./engine/narrative/canon/seasons/index.ts";
import { CODEX_PLANTS, CODEX_SEASON_TAGS, NORMAL_SEASON_IDS, TURNING_CATALOG, TURNING_STORYLETS, turningLegacy, CANON_SEEDS } from "./engine/index.ts";
import { linkedEffect } from "./engine/narrative/turning/links.ts";
import { actorRole, ELEVATED_SEEDS } from "./engine/narrative/turning/kit.ts";

let fails = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fails++; console.log("FAIL " + msg); } };
/** Bằng nhau sâu trên object thuần, không phụ thuộc thứ tự khóa. */
const eq = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => kb.includes(k) && eq((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
};
const ctx = (over: Partial<FactContext>): FactContext => ({ ...randomCtx(createRng(1)), ...over });
const P = (p: Partial<Record<Axis, number>>): Record<Axis, number> => ({ tien: 0, tinh: 0, mau: 0, danh: 0, luat: 0, than: 0, dat: 0, ky: 0, ...p });

/* ---- pressure ---- */
ok(eq(AXES, ["tien", "tinh", "mau", "danh", "luat", "than", "dat", "ky"]), "thứ tự 8 trục");
ok(eq(basePressure({ family_wealth: 0.1, gdp: 3000, sibling: true, rural: true }), { tien: 3, tinh: 0, mau: 1, danh: 0, luat: 0, than: 0, dat: 2, ky: 1 }), "nền nghèo nông thôn nước nghèo");
ok(basePressure({ family_wealth: 0.8, gdp: 50000, sibling: false, rural: false }).mau === 3, "nhà giàu");
ok(eq(pressureOf({ pressure: { danh: 2 }, money: -0.5 }), { danh: 2 }), "pressure khai báo thắng phần suy ra");
ok(pressureOf({ money: -0.2 }).tien === 1 && pressureOf({ custom: "borrow:0.3" }).tien === 1, "mất tiền/vay → Tiền");
ok(pressureOf({ secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 9] } }).mau === 1, "bí mật → Máu mủ");
ok(pressureOf({ custom: "migrate_now" }).dat === 1 && pressureOf({ health: -8 }).than === 1, "di cư → Đất, sức khỏe → Thân");
ok(dueAxis(ctx({ age: 30, pressure: P({ tien: 11, tinh: 12 }) })) === "tinh", "trục cao nhất vượt ngưỡng");
ok(dueAxis(ctx({ age: 30, last_canon_age: 25, pressure: P({ tien: 20 }) })) === null, "cách < 8 năm");
ok(dueAxis(ctx({ age: 35, canon_n: 0, pressure: P({ dat: 3 }) })) === "dat", "ép nổ lần đầu ở 35");
ok(dueAxis(ctx({ age: 60, canon_n: 1, last_canon_age: 40, pressure: P({ than: 2 }) })) === "than", "ép nổ lần hai ở 60");
ok(dueAxis(ctx({ age: 40, canon_n: 4, pressure: P({ tien: 30 }) })) === null, "tối đa 4");
ok(dueAxis(ctx({ age: 30, weird: 0, pressure: P({ ky: 40 }) })) === null, "Độ điên 0: Kỳ không nổ");
ok(dueAxis(ctx({ age: 30, weird: 2, pressure: P({ ky: 6 }) })) === "ky", "Điên: Kỳ ×2");
/* Độ điên 0 trên đường ép nổ: Kỳ bị loại hẳn khỏi so sánh */
ok(dueAxis(ctx({ age: 35, canon_n: 0, weird: 0, pressure: P({ ky: 40 }) })) === "tien", "ép nổ, Độ điên 0, chỉ Kỳ cao → tien");
ok(dueAxis(ctx({ age: 35, canon_n: 0, weird: 0, pressure: P({ tien: -3, tinh: -3, mau: -3, danh: -3, luat: -3, than: -3, dat: -3, ky: 40 }) })) !== "ky", "ép nổ, Độ điên 0, các trục khác âm → không phải Kỳ");
ok(dueAxis(ctx({ age: 35, canon_n: 0, weird: 0, pressure: P({}) })) === "tien", "ép nổ, Độ điên 0, toàn 0 → tien");
ok(dueAxis(ctx({ age: 35, canon_n: 0, weird: 2, pressure: P({ ky: 3 }) })) === "ky", "ép nổ, Điên: Kỳ ×2 vẫn là trục cao nhất");

/* ---- plants & scars ---- */
const pl = (kind: Plant["kind"], key: string, weight: number, age: number, over: Partial<Plant> = {}): Plant => ({ kind, key, label: "nhãn " + key, age, weight, ...over });
const nm = (id: string) => ({ n1: "Lan", n2: "Hùng", n3: "Mai" } as Record<string, string>)[id] ?? id;
ok(strongestPlant([], ["debt"]) === undefined, "không có mầm → undefined");
ok(strongestPlant([pl("debt", "a", 1, 20), pl("object", "b", 5, 20)], ["debt"])?.key === "a", "lọc theo loại");
ok(strongestPlant([pl("debt", "a", 1, 20), pl("promise", "b", 3, 22), pl("debt", "c", 2, 25)], ["debt", "promise"])?.key === "b", "weight cao nhất");
ok(strongestPlant([pl("debt", "a", 3, 30), pl("debt", "b", 3, 22), pl("debt", "c", 3, 26)], ["debt"])?.key === "b", "hòa weight → gài sớm hơn");
ok(plantFlag({ kind: "object", key: "dong_ho" }) === "plant:object:dong_ho", "plantFlag");
const sc = (over: Partial<FactContext>): FactContext => { const o = ctx({ cast: {}, opinion: {}, asset_names: {}, job: "", debt: 0, ...over }); if (!over.nemesis) delete o.nemesis; return o; };
ok(eq(pickScars(sc({}), [], [], nm), {}), "không có gì → trường trống");
{
  const base = { cast: { mother: "n1", rival: "n2", bully: "n3" }, opinion: { n1: 0.3, n2: -0.8, n3: 0.5 } };
  const c = sc({ ...base, nemesis: "n1" });
  ok(eq(pickScars(c, [], [], nm).nguoi, { npc: "n1", label: "Lan" }), "người: kẻ thù còn sống thắng");
  const c2 = sc({ ...base, nemesis: "n9" });
  ok(pickScars(c2, [], [], nm).nguoi?.npc === "n2", "kẻ thù đã chết → |opinion| lớn nhất");
  const c3 = sc({ ...base, opinion: { n1: 0.3, n2: -0.8, n3: 0.5, n7: 0.99 } });
  ok(pickScars(c3, [], [], nm).nguoi?.npc === "n2", "id không sống bị bỏ qua");
  ok(pickScars(sc({ ...base, opinion: { n1: 0.1, n2: 0.7, n3: -0.7 } }), [], [], nm).nguoi?.npc === "n2", "hòa |opinion| → id nhỏ hơn");
  ok(pickScars(sc({ ...base, opinion: {} }), [], [], nm).nguoi === undefined, "không ý kiến → trống");
}
{
  const c = sc({ asset_names: { house: "căn nhà gỗ" }, job: "thợ may" });
  ok(eq(pickScars(c, [pl("object", "dong_ho", 2, 20), pl("skill", "han", 4, 25), pl("debt", "x", 9, 20)], [], nm).do, { key: "han", label: "nhãn han" }), "đồ: plant object/skill/animal mạnh nhất");
  ok(eq(pickScars(c, [], [], nm).do, { key: "house", label: "căn nhà gỗ" }), "đồ: tài sản đầu tiên");
  ok(eq(pickScars(sc({ job: "thợ may" }), [], [], nm).do, { key: "job", label: "thợ may" }), "đồ: chức danh nghề");
}
{
  const c = sc({ debt: 2 });
  ok(eq(pickScars(c, [pl("debt", "vay", 1, 22), pl("promise", "hua", 2, 30), pl("object", "o", 9, 20)], [{ to: "n1", what: "lo cho em" }], nm).no, { key: "hua", label: "nhãn hua" }), "nợ/hứa: plant debt/promise mạnh nhất");
  ok(eq(pickScars(c, [], [{ to: "n1", what: "lo cho em" }, { to: "n2", what: "khác" }], nm).no, { key: "promise:n1", label: "lo cho em" }), "nợ/hứa: lời hứa đầu tiên");
  ok(eq(pickScars(c, [], [], nm).no, { key: "bank", label: "món nợ ngân hàng" }), "nợ/hứa: nợ ngân hàng");
  ok(pickScars(sc({ debt: 0 }), [], [], nm).no === undefined, "không nợ → trống");
}
{
  const alive = (id: string) => id !== "n2";
  const s = { nguoi: { npc: "n1", label: "Lan" }, do: { key: "k", label: "cây đàn" }, no: { key: "b", label: "món nợ ngân hàng" } };
  ok(scarText(s, "nguoi", nm, alive) === "Lan", "scarText người sống");
  ok(scarText({ nguoi: { npc: "n2", label: "Hùng" } }, "nguoi", nm, alive) === "một người cũ", "scarText người chết");
  ok(scarText(s, "do", nm, alive) === "cây đàn" && scarText(s, "no", nm, alive) === "món nợ ngân hàng", "scarText đồ/nợ");
  ok(scarText({}, "nguoi", nm, alive) === "" && scarText({}, "do", nm, alive) === "" && scarText({}, "no", nm, alive) === "", "scarText trống");
}

/* ---- canon: generator canon event (Task 5) ---- */
{
  const FX = SEASONS_NORMAL[0]!;
  const N = (id: string) => (id === "place" ? "Hải Phòng" : ({ n1: "Lan", n2: "Hùng", n3: "Mai", cast_creditor: "ông Tư" } as Record<string, string>)[id] ?? id);
  const base = (over: Partial<FactContext> = {}): FactContext => {
    const o = ctx({ age: 30, cast: { mother: "n1", creditor: "cast_creditor", rival: "n2" }, opinion: { n1: 0.2, cast_creditor: -0.6, n2: 0.4 },
      roles: { n1: ["mother"], cast_creditor: ["creditor"], n2: ["rival"] }, asset_names: {}, owns: new Set(), flags: new Set(), independent: true,
      weird: 1, pressure: P({ tien: 12, luat: 3 }), ...over });
    if (!over.nemesis) delete o.nemesis;
    return o;
  };
  const debt = pl("debt", "vay_nong", 3, 22, { label: "giấy nợ vay nóng" });
  const SEED: CanonSeed = {
    id: "no_cu", axes: ["tien", "luat"],
    who: { roles: ["creditor"], plants: ["person"], required: false },
    what: { plants: ["debt"], owns: ["house"], required: true },
    title: (s) => `Món nợ cũ: ${s.what?.label ?? ""}`,
    text: (s, c, n) => `Ở ${s.noi}, ${s.who ? n(s.who) : "ai đó"} cầm ${s.what?.label ?? ""} tới cửa.`,
    doors: [
      { kind: "doi_dau", label: (s, c, n) => `Gặp thẳng ${s.who ? n(s.who) : "chủ nợ"}`, hint: "Căng", season: "vu_an_gia_toc" },
      { kind: "bo_chay", label: () => "Bỏ đi trong đêm", hint: "Mất hết", season: "tron_chay", effects: () => ({ money: -0.2 }) },
      { kind: "thoa_hiep", label: () => "Xin khất thêm một năm", hint: "Còn nợ", season: "lam_lai" },
      { kind: "thoa_hiep", label: () => "Xin trả góp", hint: "Còn nợ", season: "lam_lai" },
      { kind: "danh_cuoc", label: () => "Bán nhà trả nợ", hint: "Hết nhà", season: "xu_nguoi", when: (c) => c.owns.has("house") },
    ],
  };
  const NEED_SECRET: CanonSeed = { ...SEED, id: "can_bi_mat", axes: ["tien", "luat", "tinh"], what: { plants: ["secret"], required: true } };
  const W1: WeirdBranch = { id: "w_mot", kind: "sf", axes: ["tien"], when: () => true, door: () => "Chiếc radio cũ bắt được tín hiệu",
    trigger: () => ({ title: "Tín hiệu", text: "Radio kêu lúc nửa đêm." }), season: { ...FX, id: "w_mot_mua", weird: "sf" } };
  const W2: WeirdBranch = { id: "w_hai", kind: "abs", axes: ["tinh"], when: (c) => c.age >= 18, door: () => "Con vịt biết nói",
    trigger: () => ({ title: "Con vịt", text: "Con vịt mở miệng." }), season: { ...FX, id: "w_hai_mua", weird: "abs" } };
  const W3: WeirdBranch = { id: "w_ba", kind: "abs", axes: ["ky"], when: () => true, door: () => "Cánh cửa ra năm cũ",
    trigger: () => ({ title: "Cửa cũ", text: "Cánh cửa mở ra năm khác." }), season: { ...FX, id: "w_ba_mua", weird: "abs" } };
  const gen = (c: FactContext, axis: Axis, plants: Plant[], seed = 7, seeds = [SEED], weird = [W1, W2]) => generateCanon(c, axis, plants, createRng(seed), N, seeds, weird);

  /* tất định */
  ok(JSON.stringify(gen(base(), "tien", [debt])) === JSON.stringify(gen(base(), "tien", [debt])), "canon: cùng ctx + rng seed → cùng biến cố");
  ok(JSON.stringify(gen(base({ pressure: P({ ky: 9, tien: 12 }) }), "tien", [debt], 3)) === JSON.stringify(gen(base({ pressure: P({ ky: 9, tien: 12 }) }), "tien", [debt], 3)), "canon: tất định cả khi có cửa kỳ dị");

  /* chỗ trống */
  {
    const s = fillSlots(SEED, base(), [debt]);
    ok(!!s && s.what?.kind === "debt" && (s.fromPlayer ?? 0) >= 1, "fillSlots: plant debt của người chơi điền what");
    ok(s?.who === "cast_creditor", "fillSlots: không có plant người, không nemesis → creditor");
    const s2 = fillSlots(SEED, base({ nemesis: "n2" }), [debt]);
    ok(s2?.who === "n2" && s2.fromPlayer === 1, "fillSlots: nemesis trước NPC theo vai");
    const s3 = fillSlots(SEED, base({ nemesis: "n2" }), [debt, pl("person", "ban_cu", 2, 15, { npc: "n1" })]);
    ok(s3?.who === "n1" && s3.fromPlayer === 2, "fillSlots: plant người của người chơi thắng nemesis");
    const s4 = fillSlots(SEED, base({ asset_names: { house: "căn nhà gỗ" }, owns: new Set(["house"]) }), []);
    ok(s4?.what?.kind === "asset" && s4.what.label === "căn nhà gỗ" && s4.fromPlayer === 0, "fillSlots: không plant → tài sản");
    ok(fillSlots(SEED, base(), []) === null, "fillSlots: thiếu chỗ bắt buộc → null");
    const ev = gen(base(), "tien", [debt]);
    ok(!!ev && ev.slots.what?.kind === "debt" && ev.slots.fromPlayer >= 1, "canon: slot what từ plant debt");
    ok(ev?.slots.noi === "Hải Phòng", "canon: noi = N(place)");
    ok(ev?.seed === "no_cu" && ev.axis === "tien" && ev.age === 30, "canon: seed/axis/age");
  }

  /* mầm thiếu chỗ bắt buộc */
  ok(gen(base(), "tien", [debt], 7, [NEED_SECRET, SEED])?.seed === "no_cu", "canon: mầm thiếu chỗ bắt buộc không được chọn");
  ok(gen(base(), "tien", [debt], 7, [NEED_SECRET]) === null, "canon: không mầm nào khả thi → null");
  ok(gen(base(), "tien", [], 7, [SEED]) === null, "canon: mầm duy nhất thiếu what → null");
  ok(gen(base(), "tien", [debt], 7, []) === null, "canon: không có mầm → null");
  ok(gen(base({ age: 10 }), "tien", [debt], 7, [{ ...SEED, ages: [18, 60] }]) === null, "canon: ngoài khoảng tuổi của mầm → null");

  /* điểm mầm */
  {
    const OTHER: CanonSeed = { ...SEED, id: "khac", what: { owns: ["house"], required: false } };
    ok(gen(base(), "tien", [debt], 7, [OTHER, SEED])?.seed === "no_cu", "canon: +3 mỗi chỗ trống từ người chơi");
    ok(gen(base({ flags: new Set(["canon_no_cu"]) }), "tien", [debt], 7, [OTHER, SEED])?.seed === "khac", "canon: mầm đã dùng bị trừ 100");
    /* fix 1: ưu tiên trục là điểm cộng nhỏ hơn án phạt đã dùng */
    const USED: CanonSeed = { ...SEED, id: "da_dung", axes: ["tien"] }, FRESH: CanonSeed = { ...SEED, id: "moi", axes: ["mau"] };
    const evU = gen(base({ flags: new Set(["canon_da_dung"]), pressure: P({ tien: 12 }) }), "tien", [debt], 7, [USED, FRESH]);
    ok(evU?.seed === "moi" && evU.axis === "tien", "canon: mầm chưa dùng lệch trục thắng mầm đã dùng đúng trục; axis giữ trục nổ");
    ok(gen(base({ pressure: P({ tien: 12 }) }), "tien", [debt], 7, [FRESH, USED])?.seed === "da_dung", "canon: cùng chưa dùng → ưu tiên mầm đúng trục");
    const A: CanonSeed = { ...OTHER, id: "a" }, B: CanonSeed = { ...OTHER, id: "b" };
    const picks = new Set<string>();
    for (let i = 1; i <= 40; i++) picks.add(gen(base(), "tien", [], i, [A, B])?.seed ?? "");
    ok(picks.has("a") && picks.has("b"), "canon: hòa điểm → rút bằng rng");
  }

  /* cửa */
  for (let i = 1; i <= 30; i++) {
    const ev = gen(base({ weird: 0 }), "tien", [debt], i);
    const kinds = ev?.doors.map((d) => d.kind) ?? [];
    ok(kinds.length === 3 && new Set(kinds).size === 3, `canon: đúng 3 cửa, kind không trùng (rng ${i})`);
    ok(!ev?.doors.some((d) => d.label === "Bán nhà trả nợ"), `canon: cửa có when sai bị lọc (rng ${i})`);
  }
  {
    const ev = gen(base({ weird: 0, owns: new Set(["house"]) }), "tien", [debt], 5);
    ok(!!ev && ev.doors.length === 3 && new Set(ev.doors.map((d) => d.kind)).size === 3, "canon: có nhà vẫn 3 cửa khác kind");
    /* thiếu cửa → bù GENERIC_DOORS */
    const ONE: CanonSeed = { ...SEED, id: "mot_cua", doors: [SEED.doors[0]!] };
    const e1 = gen(base({ weird: 0 }), "tien", [debt], 5, [ONE]);
    ok(!!e1 && e1.doors.length === 3 && e1.doors.some((d) => d.kind === "doi_dau" && d.label.includes("ông Tư")) && new Set(e1.doors.map((d) => d.kind)).size === 3, "canon: thiếu cửa → bù cửa chung");
    /* R7: mùa đã chơi */
    const e2 = gen(base({ weird: 0, flags: new Set(["season_played_lam_lai", "season_played_tron_chay"]) }), "tien", [debt], 5);
    ok(!!e2 && e2.doors.every((d) => d.season !== "lam_lai" && d.season !== "tron_chay") && e2.doors.length === 3, "canon: không mở lại mùa đã chơi (R7)");
    const allPlayed = new Set(["tron_chay", "vu_an_gia_toc", "ngoi_sao", "lam_lai"].map((x) => "season_played_" + x));
    const e3 = gen(base({ weird: 0, flags: allPlayed, can_migrate: true }), "tien", [debt], 5, [ONE]);
    ok(!!e3 && e3.doors.length === 3 && e3.doors.every((d) => d.season === "xu_nguoi"), "canon: cửa chung lùi về mùa thường chưa chơi đầu tiên");
    /* R14: không còn đường di cư thì không có cửa tới xu_nguoi (cửa mầm, cửa chung, cửa lùi) */
    const e4 = gen(base({ weird: 0, flags: allPlayed, can_migrate: false }), "tien", [debt], 5, [ONE]);
    ok(e4 === null, "canon R14: 4 mùa thường đã chơi, không còn đường di cư → không dựng được 3 cửa (không lùi về xu_nguoi)");
    let migDoor = 0;
    for (let i = 1; i <= 20; i++) {
      const ev = gen(base({ weird: 0, can_migrate: false, owns: new Set(["house"]) }), "tien", [debt], i);
      ok(!!ev && ev.doors.length === 3 && ev.doors.every((d) => d.season !== "xu_nguoi"), `canon R14: mầm + cửa chung không dẫn tới xu_nguoi (rng ${i})`);
      const ev2 = gen(base({ weird: 0, can_migrate: true, owns: new Set(["house"]) }), "tien", [debt], i);
      if (ev2?.doors.some((d) => d.season === "xu_nguoi")) migDoor++;
    }
    ok(migDoor > 0, `canon R14: còn đường di cư thì cửa xu_nguoi vẫn mở (${migDoor}/20)`);
  }
  {
    const kinds = GENERIC_DOORS.map((d) => d.kind);
    ok(kinds.length === 8 && new Set(kinds).size === 8, "GENERIC_DOORS: mỗi kind một cửa");
    ok(new Set(GENERIC_DOORS.map((d) => d.season)).size === 5, "GENERIC_DOORS: trải đủ 5 mùa thường");
    const kid = base({ age: 14, independent: false, weird: 0 });
    for (let i = 1; i <= 20; i++) {
      const ev = gen(kid, "tien", [debt], i, [{ ...SEED, id: "rong", doors: [] }]);
      ok(!!ev && ev.doors.length === 3 && ev.doors.every((d) => d.season !== "tron_chay" && d.season !== "xu_nguoi"), `GENERIC_DOORS: chưa tự lập thì không có tron_chay/xu_nguoi (rng ${i})`);
      ok(new Set(ev?.doors.map((d) => d.season)).size === 3, `GENERIC_DOORS: cửa bù ưu tiên mùa khác nhau (rng ${i})`);
    }
  }

  /* kỳ dị */
  {
    let anyWeird = false;
    for (let i = 1; i <= 20; i++) anyWeird ||= !!gen(base({ weird: 0, pressure: P({ tien: 12, ky: 50 }) }), "tien", [debt], i)?.doors.some((d) => d.weird);
    ok(!anyWeird, "canon: Độ điên 0, ky 50 → không cửa kỳ dị");
    for (let i = 1; i <= 20; i++) {
      const ev = gen(base({ weird: 1, pressure: P({ tien: 12, ky: 6 }) }), "tien", [debt], i);
      ok(ev?.doors.filter((d) => d.weird).length === 1 && !!ev.doors[2]?.weird, `canon: weird 1, ky 6 → đúng 1 cửa kỳ dị ở vị trí 3 (rng ${i})`);
      ok(ev?.doors[2]?.weird === "w_mot", `canon: ưu tiên nhánh có axes chứa trục (rng ${i})`);
    }
    ok(gen(base({ weird: 1, pressure: P({ tien: 12, ky: 5 }) }), "tien", [debt])?.doors.some((d) => d.weird) === false, "canon: ky 5 × 1 < 6 → không kỳ dị");
    ok(gen(base({ weird: 2, pressure: P({ tien: 12, ky: 3 }) }), "tien", [debt])?.doors.filter((d) => d.weird).length === 1, "canon: Điên ×2 → ky 3 đủ");
    const ev = gen(base({ weird: 1, pressure: P({ tien: 12, ky: 6 }), flags: new Set(["season_played_w_mot_mua"]) }), "tien", [debt]);
    ok(ev?.doors[2]?.weird === "w_hai", "canon: nhánh kỳ dị có mùa đã chơi bị loại (R7)");
    const evK = gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], 7, [SEED], [W1, W2, W3]);
    ok(!!evK && evK.doors.length === 3 && evK.doors.every((d) => !!d.weird && d.kind === "ky"), "canon: trục ky → cả 3 cửa kỳ dị");
    ok(!!evK && evK.doors[0]!.weird === evK.seed && new Set(evK.doors.map((d) => d.weird)).size === 3, "canon: trục ky → nhánh trigger là cửa đầu, 3 nhánh khác nhau");
    const trig = [W1, W2, W3].find((w) => w.id === evK?.seed);
    ok(!!trig && evK!.title === trig.trigger(evK!.slots, base(), N).title, "canon: trục ky → tiêu đề từ trigger");
    ok(gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], 7, [SEED], []) === null, "canon: trục ky không nhánh khả thi → null");
    ok(gen(base({ weird: 0, pressure: P({ ky: 40 }) }), "ky", [debt], 7, [SEED], [W1, W2, W3]) === null, "canon: trục ky với Độ điên 0 → null");
    /* R11: < 3 nhánh kỳ dị khả thi → cửa chung bù, trigger vẫn là cửa đầu */
    for (let i = 1; i <= 10; i++) {
      const e = gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], i, [SEED], [W1]);
      ok(!!e && e.doors.length === 3 && e.doors[0]!.weird === "w_mot" && e.seed === "w_mot" && e.doors.filter((d) => d.weird).length === 1
        && new Set(e.doors.map((d) => d.kind)).size === 3, `canon: trục ky, 1 nhánh khả thi → 1 cửa kỳ dị + 2 cửa chung (rng ${i})`);
      const e2 = gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], i, [SEED], [W1, W2]);
      ok(!!e2 && e2.doors.length === 3 && e2.doors.filter((d) => d.weird).length === 2 && !!e2.doors[0]!.weird && !e2.doors[2]!.weird, `canon: trục ky, 2 nhánh khả thi → 2 kỳ dị + 1 cửa chung (rng ${i})`);
    }
    /* hint cửa kỳ dị ≤ 70 */
    const LONG: WeirdBranch = { ...W1, id: "w_dai", season: { ...W1.season, id: "w_dai_mua", vn: "Một cái tên mùa rất rất dài để thử xem gợi ý có bị cắt cho vừa bảy mươi ký tự không" } };
    const eL = gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], 1, [SEED], [LONG]);
    const hL = eL?.doors[0]?.hint ?? "";
    ok(hL.length > 0 && hL.length <= 70 && hL.endsWith("…"), "canon: hint kỳ dị tự sinh bị kẹp ≤ 70, kết bằng …");
    const eH = gen(base({ pressure: P({ ky: 12 }) }), "ky", [debt], 1, [SEED], [{ ...LONG, hint: "Một gợi ý riêng" }]);
    ok(eH?.doors[0]?.hint === "Một gợi ý riêng", "canon: WeirdBranch.hint được dùng khi có");
    ok(playedFlag("lam_lai") === "season_played_lam_lai", "playedFlag");

    ok(JSON.stringify(gen(base({ pressure: P({ ky: 12 }) }), "ky", [], 4, [], [W1, W2, W3])) === JSON.stringify(gen(base({ pressure: P({ ky: 12 }) }), "ky", [], 4, [], [W1, W2, W3])), "canon: trục ky tất định");
  }

  /* canonView */
  {
    const ev = gen(base({ weird: 1, pressure: P({ tien: 12, ky: 6 }) }), "tien", [debt], 9)!;
    const v = canonView(ev);
    ok(v.choices.length === 3 && v.choices.every((ch) => (ch.effects.custom ?? "").startsWith("canon:")), "canonView: custom bắt đầu canon:");
    ok(v.title === ev.title && v.text === ev.text, "canonView: tiêu đề và chữ");
    ev.doors.forEach((d, i) => {
      const e = v.choices[i]!.effects;
      ok((e.custom ?? "").split("|").includes(`season:${d.season}`) && (e.custom ?? "").startsWith(`canon:tien|season:${d.season}`), `canonView: custom canon:<axis>|season:<id> (${d.kind})`);
      ok(!!e.flags?.includes("canon_no_cu") && e.flags.includes(`canon_door_${d.kind}`), `canonView: cờ canon_<seed>, canon_door_<kind> (${d.kind})`);
      ok(!d.weird || e.flags!.includes(`weird_${d.weird}`), `canonView: cửa kỳ dị có cờ weird_<id> (${d.kind})`);
    });
    const bo = gen(base({ weird: 0 }), "tien", [debt], 1, [{ ...SEED, doors: [{ ...SEED.doors[1]!, effects: () => ({ money: -0.2, custom: "move_city", flags: ["x"] }) }] }])!;
    const ch = canonView(bo).choices.find((c) => c.effects.flags?.includes("canon_door_bo_chay"))!;
    ok(ch.effects.money === -0.2 && ch.effects.custom === "canon:tien|season:tron_chay|move_city" && ch.effects.flags!.includes("x"), "canonView: gộp effects của cửa (custom nối |, cờ cộng)");
    const evK = gen(base({ pressure: P({ ky: 12 }) }), "ky", [], 4, [], [W1, W2, W3])!;
    ok(canonView(evK).choices.every((c) => c.effects.flags!.includes(`canon_${evK.seed}`) && (c.effects.custom ?? "").startsWith("canon:ky|")), "canonView: trục ky dùng canon_<triggerId>");
  }
}
/* ---- Task 9: ánh xạ 200 thẻ Codex → áp lực, vật gài, tag mùa ---- */
{
  const KINDS = ["debt", "secret", "person", "object", "promise", "animal", "place", "skill"];
  const TONE: Record<string, Partial<Record<Axis, number>>> = { risk: { tien: 2 }, bond: { tinh: 1 }, care: { tinh: 1 }, show: { danh: 2 }, defy: { luat: 2 }, truth: { mau: 1 }, deal: { tien: 1 }, build: { tien: 1 }, probe: { ky: 1 }, exit: { dat: 1 } };
  const routeKeys = new Set<string>();
  for (const d of TURNING_CATALOG) d.routes.forEach((_, i) => routeKeys.add(d.id + "_" + i));
  ok(routeKeys.size === 600, "600 route trong kho Codex");
  const planted = Object.entries(CODEX_PLANTS).filter(([, v]) => v.plant);
  ok(planted.length >= 300, `≥ 300/600 route có plant (có ${planted.length})`);
  ok(Object.keys(CODEX_PLANTS).every((k) => routeKeys.has(k)), "mọi khóa CODEX_PLANTS là một route thật");
  ok(planted.every(([, v]) => /^[a-z0-9_]+$/.test(v.plant!.key)), "plant.key khớp /^[a-z0-9_]+$/");
  ok(planted.every(([, v]) => KINDS.includes(v.plant!.kind) && v.plant!.label.length >= 5 && v.plant!.label.length <= 60), "plant.kind hợp lệ, label 5–60 ký tự");
  ok(planted.every(([, v]) => v.plant!.label === v.plant!.label.trim() && !/[{}]/.test(v.plant!.label)), "label sạch");
  const tagged = Object.keys(CODEX_SEASON_TAGS);
  ok(tagged.length >= 80, `≥ 80 fork có tag mùa (có ${tagged.length})`);
  ok(Object.values(CODEX_SEASON_TAGS).every((t) => t.length >= 1 && t.every((id) => NORMAL_SEASON_IDS.includes(id))), "tag chỉ dùng mùa thường");
  ok(eq(NORMAL_SEASON_IDS, ["tron_chay", "vu_an_gia_toc", "ngoi_sao", "lam_lai", "xu_nguoi"]), "5 id mùa thường");
  ok(tagged.every((k) => TURNING_CATALOG.some((d) => d.id === k)), "mọi khóa tag là fork thật");

  const ROLE_CAST: Record<string, string> = { friend: "childhood_friend", neighbor: "neighbor", rival: "rival", mentor: "mentor", boss: "first_boss", official: "official", spouse: "spouse", sibling: "sibling", child: "child", mother: "mother", father: "father", partner: "partner", creditor: "creditor" };
  const c0 = ctx({ cast: Object.fromEntries(Object.values(ROLE_CAST).map((r) => [r, "NPC_" + r])) });
  const ids = new Set(TURNING_STORYLETS.map((s) => s.id));
  const KEEP_ECHO = new Set(["tp_c01_1"]); // host test turning-points-test dùng cảnh tp_c01_echo_1
  let npcBad = 0, personPlants = 0, objectPlants = 0, legacyBad = 0, unplantedUnlinked = 0, linkLost = 0, withLater = 0, planted2 = 0, echoesLeft = 0, pressureBad = 0, plantBad = 0, tagBad = 0;
  for (const d of TURNING_CATALOG) {
    const root = TURNING_STORYLETS.find((s) => s.id === d.id)!;
    ok(eq(root.meta?.season, CODEX_SEASON_TAGS[d.id]), `meta.season của ${d.id}`);
    const view = root.build(c0, (x) => x);
    const view2 = root.build({ ...c0, cast: {} }, (x) => x); // không có người nào trong đời: không gắn npc
    d.routes.forEach((b, i) => {
      const key = d.id + "_" + i, fx = view.choices[i]!.effects, cx = CODEX_PLANTS[key];
      const want: Partial<Record<Axis, number>> = { ...TONE[b.tone] };
      if (d.id.startsWith("tp_a")) want.ky = (want.ky ?? 0) + 2;
      if (!eq(fx.pressure, cx?.pressure ?? want)) pressureBad++;
      const echo = ids.has(d.id + "_echo_" + i);
      if (cx?.plant) {
        planted2++;
        const { npc: gotNpc, ...gotPlant } = fx.plant ?? { kind: "" };
        if (!eq(gotPlant, cx.plant)) plantBad++;
        /* người của thẻ ({person}) mang npc của chính họ; vật gài khác không bao giờ bị gắn npc nhầm */
        const role = actorRole(d), roleKey = cx.plant.kind === "person" && cx.plant.key === d.id + "_" + role;
        const castFull = view2.choices[i]!.effects.plant?.npc;
        if (roleKey ? gotNpc !== (c0.cast as Record<string, string>)[ROLE_CAST[role!]!] || castFull !== undefined : gotNpc !== undefined || castFull !== undefined) npcBad++;
        if (cx.plant.kind === "person") personPlants++; else objectPlants++;
        /* lời tổng kết cuối đời: route có vật gài không bao giờ "dang dở" và tính theo tuổi đã chọn */
        const lc = ctx({ flags: new Set([d.id + "_seen", d.id + "_route_" + i]), counters: { [d.id + "_at"]: 30 } });
        const legacy = turningLegacy(lc);
        if (legacy.length !== 1 || legacy[0]!.includes("câu chuyện còn dang dở khi đời bạn khép lại") || !legacy[0]!.startsWith(d.title + ": ")) legacyBad++;
        if (fx.later) withLater++;
        if (echo) echoesLeft++;
        if (fx.counters?.tp_open) withLater++;
        /* bước keep/pivot sống ở cảnh _echo_: route có plant không được mang liên kết keep/pivot (sẽ mất) */
        for (const st of ["keep", "pivot"] as const) if (Object.keys(linkedEffect(d.id, i, st, c0)).length) linkLost++;
      } else {
        if (fx.plant) plantBad++;
        /* route không gài phải là route giữ echo vì mang liên kết keep/pivot (hoặc nằm trong danh sách giữ echo cho test host) */
        const linked = ["keep", "pivot"].some((st) => Object.keys(linkedEffect(d.id, i, st as "keep" | "pivot", c0)).length);
        if (!linked && !KEEP_ECHO.has(key)) unplantedUnlinked++;
        if (!fx.later || fx.later.storylet !== d.id + "_echo_" + i || !echo) withLater++;
      }
    });
    if (!CODEX_SEASON_TAGS[d.id] && root.meta?.season) tagBad++;
  }
  ok(planted2 === planted.length, "mọi plant đi vào effect của bước open");
  ok(withLater === 0, `route có plant không còn later/tp_open; route không plant giữ later + echo (lệch ${withLater})`);
  ok(npcBad === 0, `npc chỉ gắn cho vật gài là {person} của thẻ khi thẻ có người (lệch ${npcBad})`);
  ok(legacyBad === 0, `lời tổng kết route có vật gài không "dang dở" (lệch ${legacyBad})`);
  ok(unplantedUnlinked === 0, `mọi route không gài đều mang liên kết keep/pivot hoặc nằm trong danh sách giữ echo (lệch ${unplantedUnlinked})`);
  ok(personPlants >= 200 && objectPlants >= 250, `đếm vật gài: ${objectPlants} không phải người, ${personPlants} người`);
  ok(linkLost === 0, `route có plant không mang liên kết keep/pivot bị mất cùng echo (có ${linkLost})`);
  ok(echoesLeft === 0, "route có plant không còn storylet _echo_");
  ok(ids.size === 200 + (600 - planted.length), `số storylet = 200 gốc + ${600 - planted.length} echo còn lại (có ${ids.size})`);
  ok(pressureBad === 0, `pressure mỗi lựa chọn đúng bảng tông (+ky 2 cho tp_a*) (lệch ${pressureBad})`);
  ok(plantBad === 0 && tagBad === 0, "plant/tag khớp bảng");
  /* các route test cũ dựa vào echo vẫn phải còn echo */
  for (const id of ["tp_c01_1", "tp_c43_1", "tp_c38_0", "tp_l06_1", "tp_l36_1", "tp_c41_1", "tp_c37_0", "tp_c31_0"]) ok(!CODEX_PLANTS[id]?.plant, `${id} còn echo (có liên kết keep/pivot)`);
}

/* ---- Task 6b: 8 mầm đợt A ---- */
{
  const NORMAL = ["tron_chay", "vu_an_gia_toc", "ngoi_sao", "lam_lai", "xu_nguoi"];
  const NEEDS_INDEP = new Set(["tron_chay", "xu_nguoi"]);
  ok(eq(CANON_SEEDS.map((s) => s.id), ["no_cu", "troi_cho", "phan_boi", "noi_tieng", "di_chuc", "nam_cuoi", "ve_xa", "nuoc_len"]), "mầm: đúng 8 id");
  for (const a of AXES) if (a !== "ky") ok(CANON_SEEDS.some((s) => s.axes.includes(a)), `mầm: trục ${a} có ≥ 1 mầm`);
  ok(!CANON_SEEDS.some((s) => s.axes.includes("ky")), "mầm: trục ky không có mầm");
  /* R16: thẻ Codex gốc ở lại làm thẻ gài; mầm nâng cấp là phần trả */
  const ELEVATED: Record<string, string> = { di_chuc: "tp_c39", nam_cuoi: "tp_c27", ve_xa: "tp_c14", nuoc_len: "tp_c05" };
  for (const id of Object.values(ELEVATED)) ok(TURNING_CATALOG.some((d) => d.id === id), `mầm: ${id} vẫn ở lại trong TURNING_CATALOG (thẻ gài)`);
  for (const sd of CANON_SEEDS) {
    ok(!!sd.ages && sd.axes.length >= 1 && sd.axes.length <= 2, `${sd.id}: có tuổi, 1–2 trục`);
    ok(sd.doors.length >= 4, `${sd.id}: ≥ 4 cửa`);
    ok(new Set(sd.doors.map((d) => d.kind)).size >= 3, `${sd.id}: ≥ 3 kiểu cửa`);
    const ss = new Set(sd.doors.map((d) => d.season));
    ok(ss.size >= 2 && [...ss].every((x) => NORMAL.includes(x)), `${sd.id}: ≥ 2 mùa, chỉ mùa thường`);
    for (const d of sd.doors) {
      ok(d.hint.length > 0 && d.hint.length <= 70, `${sd.id}/${d.kind}: hint ≤ 70`);
      if (NEEDS_INDEP.has(d.season)) ok(!!d.when, `${sd.id}/${d.kind}: cửa ${d.season} phải có when (independent)`);
    }
  }

  /* fuzz: chữ sạch, đọc chỗ trống, người phụ thuộc không có cửa tron_chay/xu_nguoi */
  const BROKEN = /[{}]|undefined|NaN|null|\[object|\s[.,!?;:]|\s{2}|""|^\s|\s$/;
  const LOWER = /^\p{Ll}|(?<!\.)\.\s+\p{Ll}/u;
  const seenBad = new Set<string>();
  const txt = (t: string, where: string, max: number) => {
    const bad = !t || t.length > max || BROKEN.test(t) || LOWER.test(t);
    const key = where.replace(/#\d+/, "");
    if (bad && !seenBad.has(key)) { seenBad.add(key); ok(false, `${where}: chữ hỏng hoặc quá ${max} ký tự «${t}»`); }
  };
  const NAMES: Record<string, string> = { cast_creditor: "ông Tư Sẹo", cast_sibling: "Thảo", cast_spouse: "Minh", cast_father: "ông Bảy", cast_mother: "bà Năm", n_cu: "Sáu Lành" };
  const names = (place: string) => (id: string) => (id === "place" ? place : NAMES[id] ?? "Hòa");
  const LABEL: Record<string, string> = { debt: "tờ giấy nợ trong áo bố", promise: "lời hứa lo cho em", object: "chiếc đồng hồ của ông ngoại", animal: "con vẹt biết mật khẩu",
    place: "bếp ăn ở chỗ tạm cư", skill: "nghề sửa đồng hồ", secret: "chuyện thi hộ năm lớp chín", person: "người bạn cũ" };
  const LONG = "chiếc hộp gỗ sơn mài ông ngoại để lại trên gác xép năm ấy";
  const r = createRng(60606);
  const inAge = (lo: number, hi: number): FactContext => { for (;;) { const c = randomCtx(r); if (c.age >= lo && c.age <= hi) return c; } };
  const check = (ev: NonNullable<ReturnType<typeof generateCanon>>, c: FactContext, N: (id: string) => string, where: string) => {
    txt(ev.title, `${where} title`, 60); txt(ev.text, `${where} text`, 600);
    ev.doors.forEach((d) => { txt(d.label, `${where} cửa ${d.kind}`, 60); txt(d.hint, `${where} hint ${d.kind}`, 70); });
    ok(new Set(ev.doors.map((d) => d.kind)).size === ev.doors.length, `${where}: cửa khác kiểu`);
    if (!c.independent) ok(ev.doors.every((d) => !NEEDS_INDEP.has(d.season)), `${where}: người chưa tự lập không có cửa tron_chay/xu_nguoi`);
    const all = ev.title + " " + ev.text;
    if (ev.slots.who) ok(all.toLowerCase().includes(N(ev.slots.who).toLowerCase()), `${where}: chữ đọc chỗ who «${ev.text}»`);
    const w = ev.slots.what;
    if (w && (w.kind !== "asset" || c.age >= 16)) ok(all.toLowerCase().includes(w.label.toLowerCase()), `${where}: chữ đọc chỗ what (${w.kind}) «${ev.text}»`);
    for (const ch of canonView(ev).choices) if (ch.effects.memory) ok(ch.effects.memory.npc === ev.slots.who, `${where}: memory gắn người ở chỗ who`);
  };

  for (const sd of CANON_SEEDS) {
    const [lo, hi] = sd.ages!;
    /* test kế hoạch: mỗi trục của mầm, 50 randomCtx đúng tuổi, pressure trục = 12 → biến cố 3 cửa ≥ 60% */
    for (const ax of sd.axes) {
      let good = 0;
      for (let i = 0; i < 50; i++) {
        const c = inAge(lo, hi); c.pressure = P({ [ax]: 12 });
        const card = ELEVATED[sd.id];
        if (card && i % 3 === 0) { c.flags = new Set([...c.flags, card + "_seen"]); if (i % 2 === 0) c.flags.add(`${card}_route_${i % 4 === 0 ? 0 : 2}`); }
        const N = names(i % 5 === 0 ? "" : "Phố Mới");
        const ev = generateCanon(c, ax, [], createRng(i + 1), N, [sd], []);
        if (ev && ev.seed === sd.id && ev.doors.length === 3) good++;
        if (ev) check(ev, c, N, `${sd.id}/${ax}#${i}`);
      }
      ok(good >= 30, `${sd.id}/${ax}: ${good}/50 ra biến cố 3 cửa (cần ≥ 60%)`);
    }
    /* vật gài của người chơi điền chỗ trống, và chữ đọc được nó (kể cả nhãn dài) */
    for (const kind of sd.what?.plants ?? []) for (const label of [LABEL[kind]!, LONG]) for (let i = 0; i < 6; i++) {
      const c = inAge(lo, hi); c.pressure = P({ [sd.axes[0]!]: 12 });
      c.cast = { ...c.cast, creditor: "n_cu" }; c.roles = { ...c.roles, n_cu: ["creditor"] };
      const plants: Plant[] = [{ kind, key: "vat", label, age: Math.max(0, c.age - 7), weight: 3 }];
      if (sd.who?.plants) plants.push({ kind: sd.who.plants[0]!, key: "nguoi", label: LABEL[sd.who.plants[0]!]!, npc: "n_cu", age: Math.max(0, c.age - 9), weight: 2 });
      const N = names("Phố Mới");
      const ev = generateCanon(c, sd.axes[0]!, plants, createRng(100 + i), N, [sd], []);
      ok(!!ev && ev.slots.fromPlayer >= 1 && ev.slots.what?.label === label, `${sd.id}: vật gài ${kind} điền chỗ what`);
      if (ev) { check(ev, c, N, `${sd.id}/gài ${kind}#${i}`); if (sd.who?.plants) ok(ev.slots.who === "n_cu", `${sd.id}: người gài điền chỗ who`); }
    }
  }
  /* tất định: chỗ trống rỗng hết (không who/what), noi rỗng hoặc có, tự lập hay không, tuổi biên của mầm,
     có/không con, đã gặp thẻ gốc hay chưa → mọi tiêu đề, chữ, nhãn và hint của cửa khả thi đều sạch */
  for (const sd of CANON_SEEDS) {
    const card = ELEVATED[sd.id];
    for (const slots of [{ noi: "", fromPlayer: 0 }, { noi: "Phố Mới", fromPlayer: 0 }] as Slots[])
      for (const independent of [true, false]) for (const age of sd.ages!) for (const kids_alive of [0, 2])
        for (const flags of [new Set<string>(), ...(card ? [new Set([card + "_seen", card + "_route_0"])] : [])]) {
          const c = ctx({ age, independent, kids_alive, flags });
          const N = names(slots.noi);
          const where = `${sd.id} rỗng (noi «${slots.noi}», indep ${independent}, ${age} tuổi, con ${kids_alive}, cờ ${[...flags].join("+") || "-"})`;
          txt(sd.title(slots, c, N), `${where} title`, 60);
          txt(sd.text(slots, c, N), `${where} text`, 700);
          for (const d of sd.doors) {
            if (d.when && !d.when(c, slots)) continue;
            txt(d.label(slots, c, N), `${where} cửa ${d.kind}`, 60);
            txt(d.hint, `${where} hint ${d.kind}`, 70);
            if (d.effects) ok(!d.effects(c, slots).memory, `${where} cửa ${d.kind}: không who thì không memory`);
          }
        }
  }
  /* phan_boi, bản trẻ con với vật gài bí mật: cửa theo chuyện bí mật bị kể ra, không theo chuyện giấu đồ */
  {
    const sd = CANON_SEEDS.find((x) => x.id === "phan_boi")!, c = ctx({ age: 12, independent: false }), N = names("Phố Mới");
    const secret: Slots = { who: "cast_sibling", what: { kind: "secret", key: "k", label: LABEL.secret!, age: 9, weight: 2 }, noi: "Phố Mới", fromPlayer: 1 };
    const obj: Slots = { ...secret, what: { kind: "object", key: "k", label: LABEL.object!, age: 9, weight: 2 } };
    const lab = (s: Slots, k: string) => sd.doors.find((d) => d.kind === k)!.label(s, c, N);
    ok(sd.text(secret, c, N).includes("cả lớp") && !lab(secret, "doi_dau").includes("chỗ giấu") && !lab(secret, "nhan_toi").includes("Nhận lỗi thay"), "phan_boi trẻ con + bí mật: cửa khớp chuyện bí mật");
    ok(lab(obj, "doi_dau").includes("chỗ giấu") && lab(obj, "nhan_toi").includes("Nhận lỗi thay"), "phan_boi trẻ con + đồ vật: cửa theo chuyện giấu đồ");
  }
  /* mầm nâng cấp: tiêu đề khác thẻ gốc; đã gặp thẻ gốc thì chữ gọi lại, mỗi route một kiểu */
  for (const [sid, card] of Object.entries(ELEVATED)) {
    const sd = CANON_SEEDS.find((x) => x.id === sid)!, codex = TURNING_CATALOG.find((d) => d.id === card)!;
    const [lo, hi] = sd.ages!;
    for (let i = 0; i < 12; i++) {
      const c = inAge(lo, hi), N = names("Phố Mới");
      const slots = fillSlots(sd, c, [], N)!;
      const variants = [new Set<string>(), new Set([card + "_seen"]), ...[0, 1, 2].map((k) => new Set([card + "_seen", `${card}_route_${k}`]))];
      const texts = variants.map((f) => { const cc = { ...c, flags: new Set([...c.flags, ...f]) }; return { title: sd.title(slots, cc, N), text: sd.text(slots, cc, N) }; });
      ok(texts.every((t) => t.title !== codex.title), `${sid}: tiêu đề khác thẻ gốc «${codex.title}»`);
      ok(new Set(texts.map((t) => t.text)).size === 5, `${sid}: chưa gặp / đã gặp / 3 route cho 5 đoạn chữ khác nhau`);
      texts.forEach((t, k) => { txt(t.title, `${sid} gọi lại ${k} title`, 60); txt(t.text, `${sid} gọi lại ${k} text`, 700); });
      ok(!texts[0]!.text.includes("Lần trước") && !texts[0]!.text.includes("Mấy năm trước") && !texts[0]!.text.includes("Lần nước lên trước"), `${sid}: chưa gặp thẻ gốc thì không gọi lại`);
    }
  }
  /* thẻ gốc không ra nữa khi mầm nâng cấp của nó đã nổ (canon_<mầm>); cờ khác không đổi gì */
  for (const [sid, card] of Object.entries(ELEVATED)) {
    const root = TURNING_STORYLETS.find((x) => x.id === card)!;
    let open = 0, sameOther = 0, n = 0;
    for (let i = 0; i < 4000 && open < 20; i++) {
      const c = randomCtx(r);
      const base0 = root.prerequisites(c);
      const other = Object.values(ELEVATED).find((x) => x !== card)!;
      const otherSeed = Object.keys(ELEVATED).find((k) => ELEVATED[k] === other)!;
      n++; if (root.prerequisites({ ...c, flags: new Set([...c.flags, "canon_" + otherSeed]) }) === base0) sameOther++;
      if (!base0) continue;
      open++;
      ok(!root.prerequisites({ ...c, flags: new Set([...c.flags, "canon_" + sid]) }), `${card}: không ra khi canon_${sid} đã có`);
    }
    ok(open >= 5, `${card}: tìm được ctx mở thẻ gốc (có ${open})`);
    ok(sameOther === n, `${card}: cờ canon của mầm khác không đổi prerequisites`);
  }
  ok(eq(ELEVATED_SEEDS, Object.fromEntries(Object.entries(ELEVATED).map(([k, v]) => [v, k]))), "ELEVATED_SEEDS khớp 4 mầm nâng cấp");
  /* cả kho: mọi trục thường, tuổi 8–72 → luôn dựng được biến cố */
  for (const ax of AXES) {
    if (ax === "ky") continue;
    let good = 0;
    for (let i = 0; i < 50; i++) {
      const c = inAge(8, 72); c.pressure = P({ [ax]: 12 });
      const ev = generateCanon(c, ax, [], createRng(500 + i), names("Phố Mới"), CANON_SEEDS, []);
      if (ev && ev.doors.length === 3) good++;
    }
    ok(good >= 30, `kho mầm, trục ${ax}: ${good}/50 ra biến cố 3 cửa`);
  }
}

/* R20: chung kết cưới một người có tên vẫn là thay đổi bền */
ok(isDurable({ custom: "marry:Lan" }) && isDurable({ custom: "season_end:x|marry:Lan" }), "isDurable nhận marry:<tên>");

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log("canon-test: OK");
