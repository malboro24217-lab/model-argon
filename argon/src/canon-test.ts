/** Kiểm thử lớp canon event / Mùa (narrative/canon). Chạy: node --experimental-strip-types src/canon-test.ts */
import { createRng, AXES, basePressure, pressureOf, dueAxis, CODEX_PLANTS, CODEX_SEASON_TAGS, NORMAL_SEASON_IDS, TURNING_CATALOG, TURNING_STORYLETS, type FactContext, type Axis } from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";
import { linkedEffect } from "./engine/narrative/turning/links.ts";

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

  const c0 = ctx({});
  const ids = new Set(TURNING_STORYLETS.map((s) => s.id));
  let linkLost = 0, withLater = 0, planted2 = 0, echoesLeft = 0, pressureBad = 0, plantBad = 0, tagBad = 0;
  for (const d of TURNING_CATALOG) {
    const root = TURNING_STORYLETS.find((s) => s.id === d.id)!;
    ok(eq(root.meta?.season, CODEX_SEASON_TAGS[d.id]), `meta.season của ${d.id}`);
    const view = root.build(c0, (x) => x);
    d.routes.forEach((b, i) => {
      const key = d.id + "_" + i, fx = view.choices[i]!.effects, cx = CODEX_PLANTS[key];
      const want: Partial<Record<Axis, number>> = { ...TONE[b.tone] };
      if (d.id.startsWith("tp_a")) want.ky = (want.ky ?? 0) + 2;
      if (!eq(fx.pressure, cx?.pressure ?? want)) pressureBad++;
      const echo = ids.has(d.id + "_echo_" + i);
      if (cx?.plant) {
        planted2++;
        if (!eq(fx.plant, cx.plant)) plantBad++;
        if (fx.later) withLater++;
        if (echo) echoesLeft++;
        if (fx.counters?.tp_open) withLater++;
        /* bước keep/pivot sống ở cảnh _echo_: route có plant không được mang liên kết keep/pivot (sẽ mất) */
        for (const st of ["keep", "pivot"] as const) if (Object.keys(linkedEffect(d.id, i, st, c0)).length) linkLost++;
      } else {
        if (fx.plant) plantBad++;
        if (!fx.later || fx.later.storylet !== d.id + "_echo_" + i || !echo) withLater++;
      }
    });
    if (!CODEX_SEASON_TAGS[d.id] && root.meta?.season) tagBad++;
  }
  ok(planted2 === planted.length, "mọi plant đi vào effect của bước open");
  ok(withLater === 0, `route có plant không còn later/tp_open; route không plant giữ later + echo (lệch ${withLater})`);
  ok(linkLost === 0, `route có plant không mang liên kết keep/pivot bị mất cùng echo (có ${linkLost})`);
  ok(echoesLeft === 0, "route có plant không còn storylet _echo_");
  ok(ids.size === 200 + (600 - planted.length), `số storylet = 200 gốc + ${600 - planted.length} echo còn lại (có ${ids.size})`);
  ok(pressureBad === 0, `pressure mỗi lựa chọn đúng bảng tông (+ky 2 cho tp_a*) (lệch ${pressureBad})`);
  ok(plantBad === 0 && tagBad === 0, "plant/tag khớp bảng");
  /* các route test cũ dựa vào echo vẫn phải còn echo */
  for (const id of ["tp_c01_1", "tp_c43_1", "tp_c38_0", "tp_l06_1", "tp_l36_1", "tp_c41_1", "tp_c37_0", "tp_c31_0"]) ok(!CODEX_PLANTS[id]?.plant, `${id} còn echo (có liên kết keep/pivot)`);
}

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log("canon-test: OK");
