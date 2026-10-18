/** Kiểm thử lớp canon event / Mùa (narrative/canon). Chạy: node --experimental-strip-types src/canon-test.ts */
import { createRng, AXES, basePressure, pressureOf, dueAxis, strongestPlant, plantFlag, pickScars, scarText, type FactContext, type Axis, type Plant } from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";
import { generateCanon, fillSlots, canonView, GENERIC_DOORS, playedFlag, type CanonSeed, type WeirdBranch } from "./engine/index.ts";
import { FIXTURE_SEASON } from "./engine/narrative/canon/seasons/_fixture.ts";

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
  const FX = FIXTURE_SEASON;
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
    const e3 = gen(base({ weird: 0, flags: allPlayed }), "tien", [debt], 5, [ONE]);
    ok(!!e3 && e3.doors.length === 3 && e3.doors.every((d) => d.season === "xu_nguoi"), "canon: cửa chung lùi về mùa thường chưa chơi đầu tiên");
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

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log("canon-test: OK");
