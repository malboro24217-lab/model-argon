/**
 * Sổ vật gài (canon event). Mầm là thứ đời gieo ra để một mùa sau này mọc lên (xem types.ts: Plant).
 */
import type { Plant, PlantKind } from "../types.ts";

/** Mầm nặng nhất trong các loại cho trước; hòa thì lấy mầm gài sớm hơn (age nhỏ hơn). */
export function strongestPlant(plants: Plant[], kinds: PlantKind[]): Plant | undefined {
  let best: Plant | undefined;
  for (const p of plants) {
    if (!kinds.includes(p.kind)) continue;
    if (!best || p.weight > best.weight || (p.weight === best.weight && p.age < best.age)) best = p;
  }
  return best;
}

/** Cờ do thẻ gài đặt: "plant:<loai>:<khoa>". */
export function plantFlag(p: { kind: PlantKind; key: string }): string {
  return `plant:${p.kind}:${p.key}`;
}
