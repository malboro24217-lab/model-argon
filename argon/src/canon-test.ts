/** Kiểm thử lớp canon event / Mùa (narrative/canon). Chạy: node --experimental-strip-types src/canon-test.ts */
import { createRng, AXES, basePressure, pressureOf, dueAxis, type FactContext, type Axis } from "./engine/index.ts";
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

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log("canon-test: OK");
