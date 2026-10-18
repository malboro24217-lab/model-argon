/** Kiểm thử lớp canon event / Mùa (narrative/canon). Chạy: node --experimental-strip-types src/canon-test.ts */
import { createRng, AXES, basePressure, pressureOf, dueAxis, strongestPlant, plantFlag, pickScars, scarText, type FactContext, type Axis, type Plant } from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";

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

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log("canon-test: OK");
