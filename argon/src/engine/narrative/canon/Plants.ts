/**
 * Sổ vật gài (canon event). Mầm là thứ đời gieo ra để một mùa sau này mọc lên (xem types.ts: Plant).
 *
 * Mầm được dùng dần (Task 20c, final review I3): khi một mầm điền chỗ trống của canon event hay thành vết của mùa,
 * host ghi `used = tuổi` lên chính mầm đó (usePlants). Lần chọn sau ưu tiên mầm chưa dùng, rồi mầm dùng lâu nhất rồi.
 * Mầm nợ / lời hứa đang là vết "no" của mùa thì bị bỏ khỏi sổ khi trong mùa có lựa chọn trả nợ (custom repay)
 * hay giữ lời (memory KEPT_PROMISE): settlePlant. Mọi trạng thái nằm trong mảng mầm của đời (L.lw.plants),
 * nên tua lại và rẽ nhánh dựng lại y hệt.
 */
import type { Effect, Plant, PlantKind } from "../types.ts";

/** Khóa nhận diện một mầm trong sổ: loại + khóa (một route Codex gieo đúng một mầm, khóa lặp lại giữa các route cùng thẻ). */
export interface PlantRef { kind: PlantKind; key: string }

/**
 * p tốt hơn q khi chọn mầm:
 *  1. mầm chưa dùng thắng mầm đã dùng;
 *  2. nặng hơn thắng;
 *  3. cả hai đã dùng: mầm dùng lâu hơn (used nhỏ hơn) thắng, để các mầm thay phiên nhau;
 *  4. gieo gần đây hơn (age lớn hơn) thắng; hòa hết thì giữ mầm đứng trước trong sổ.
 */
function better(p: Plant, q: Plant): boolean {
  const pu = p.used === undefined, qu = q.used === undefined;
  if (pu !== qu) return pu;
  if (p.weight !== q.weight) return p.weight > q.weight;
  if (!pu && p.used !== q.used) return p.used! < q.used!;
  return p.age > q.age;
}

/** Mầm tốt nhất trong các loại cho trước (xem `better`): chưa dùng trước, rồi nặng hơn, rồi dùng lâu nhất, rồi gieo gần nhất. */
export function strongestPlant(plants: Plant[], kinds: PlantKind[]): Plant | undefined {
  let best: Plant | undefined;
  for (const p of plants) {
    if (!kinds.includes(p.kind)) continue;
    if (!best || better(p, best)) best = p;
  }
  return best;
}

/** Mọi mầm thuộc các loại cho trước, xếp từ tốt tới kém như strongestPlant (phần tử đầu = strongestPlant). */
export function rankPlants(plants: Plant[], kinds: PlantKind[]): Plant[] {
  const xs = plants.filter((p) => kinds.includes(p.kind));
  return xs.map((p, i) => ({ p, i })).sort((a, b) => (better(a.p, b.p) ? -1 : better(b.p, a.p) ? 1 : a.i - b.i)).map((x) => x.p);
}

/** Mầm còn tươi: chưa từng điền chỗ trống hay thành vết. Chỉ mầm tươi mới tính là "từ lựa chọn của người chơi" (Slots.fromPlayer). */
export const freshPlant = (p: Plant): boolean => p.used === undefined;

/** Ghi `used = age` lên mọi mầm khớp loại + khóa. Sửa tại chỗ (sổ mầm của đời). */
export function usePlants(plants: Plant[], refs: PlantRef[], age: number): void {
  if (!refs.length) return;
  for (const p of plants) if (refs.some((r) => r.kind === p.kind && r.key === p.key)) p.used = age;
}

/**
 * Mầm một canon event đã dùng: vật ở `what` (nếu là mầm, không phải tài sản) và mọi mầm người gắn với NPC ở `who`
 * (người đó là nhân vật của biến cố, nên mầm về họ coi như đã trả lần này).
 */
export function eventPlants(slots: { who?: string; what?: { kind: string; key: string } }, plants: Plant[]): PlantRef[] {
  const out: PlantRef[] = [];
  const w = slots.what;
  if (w && w.kind !== "asset") out.push({ kind: w.kind as PlantKind, key: w.key });
  if (slots.who) for (const p of plants) if (p.npc === slots.who) out.push({ kind: p.kind, key: p.key });
  return out;
}

/** Custom có phần trả nợ (repay hay repay:<n>). */
const repays = (e: Effect): boolean => typeof e.custom === "string" && e.custom.split("|").some((x) => /^repay(:|$)/.test(x));

/**
 * Mầm nợ / lời hứa được trả bởi effect `e` trong mùa có vết `no` (spec §5 "nợ hay lời hứa: chưa trả"):
 *  - vết `no` là mầm nợ hay lời hứa, và `e` có custom repay (chung kết "trả sạch", "khép xong chuyện cũ"); hoặc
 *  - vết `no` là mầm lời hứa, và `e` ghi ký ức KEPT_PROMISE.
 * Trả về mầm đó (để host bỏ khỏi sổ) hoặc null. Không sửa gì.
 */
export function settledPlant(e: Effect, no: { key: string; kind?: PlantKind } | undefined): PlantRef | null {
  if (!no || (no.kind !== "debt" && no.kind !== "promise")) return null;
  if (repays(e) || (no.kind === "promise" && e.memory?.tag === "KEPT_PROMISE")) return { kind: no.kind, key: no.key };
  return null;
}

/** Bỏ khỏi sổ mọi mầm khớp `ref` (sửa tại chỗ). Trả về số mầm đã bỏ. */
export function dropPlants(plants: Plant[], ref: PlantRef | null): number {
  if (!ref) return 0;
  let n = 0;
  for (let i = plants.length - 1; i >= 0; i--) if (plants[i]!.kind === ref.kind && plants[i]!.key === ref.key) { plants.splice(i, 1); n++; }
  return n;
}

/** Cờ do thẻ gài đặt: "plant:<loai>:<khoa>". */
export function plantFlag(p: { kind: PlantKind; key: string }): string {
  return `plant:${p.kind}:${p.key}`;
}
