/**
 * 3 vết mang sang mùa mới: một người, một đồ hay kỹ năng, một món nợ hay lời hứa (spec §5).
 */
import type { FactContext, Plant, PlantKind } from "../types.ts";
import { rankPlants, type PlantRef } from "./Plants.ts";

/** `kind` có khi vết lấy từ một mầm (để host đánh dấu mầm đã dùng và bỏ mầm nợ / lời hứa khi trả xong). */
export interface Scars {
  nguoi?: { npc: string; label: string };
  do?: { key: string; label: string; kind?: PlantKind };
  no?: { key: string; label: string; kind?: PlantKind };
}

/** Ứng viên đầu tiên khác khóa `avoid`; không có thì ứng viên đầu tiên (đời chỉ có một thứ để mang thì mang lại thứ đó). */
function pickNot<T extends { key: string }>(cands: T[], avoid: string | undefined): T | undefined {
  return cands.find((x) => x.key !== avoid) ?? cands[0];
}

/**
 * Chọn 3 vết lúc vào mùa. `names` cho tên hiển thị; chỉ id có trong c.cast mới tính là còn sống.
 * `prev` là 3 vết của mùa trước (Task 20c, I3): đồ và nợ không lặp lại vết của mùa trước khi còn ứng viên khác.
 */
export function pickScars(c: FactContext, plants: Plant[], promises: { to: string; what: string }[], names: (id: string) => string, prev?: Scars): Scars {
  const out: Scars = {};
  const alive = new Set(Object.values(c.cast).filter((v): v is string => !!v));

  // Người: kẻ thù còn sống, rồi |opinion| lớn nhất (hòa thì id nhỏ hơn để tất định).
  if (c.nemesis && alive.has(c.nemesis)) out.nguoi = { npc: c.nemesis, label: names(c.nemesis) };
  else {
    let best: string | undefined, bestAbs = 0;
    for (const id of Object.keys(c.opinion).sort()) {
      if (!alive.has(id)) continue;
      const a = Math.abs(c.opinion[id] ?? 0);
      if (a > bestAbs) { best = id; bestAbs = a; }
    }
    if (best) out.nguoi = { npc: best, label: names(best) };
  }

  // Đồ hay kỹ năng: vật gài (chưa dùng trước, rồi dùng lâu nhất; xem rankPlants), rồi tài sản, rồi nghề.
  type Cand = { key: string; label: string; kind?: PlantKind };
  const fromPlant = (p: Plant): Cand => ({ key: p.key, label: p.label, kind: p.kind });
  const doC: Cand[] = rankPlants(plants, ["object", "skill", "animal"]).map(fromPlant);
  for (const [k, v] of Object.entries(c.asset_names)) if (v) doC.push({ key: k, label: v as string });
  if (c.job) doC.push({ key: "job", label: c.job });
  const d = pickNot(doC, prev?.do?.key);
  if (d) out.do = d;

  // Nợ hay lời hứa: vật gài, rồi lời hứa chưa trả, rồi nợ ngân hàng.
  const noC: Cand[] = rankPlants(plants, ["debt", "promise"]).map(fromPlant);
  for (const p of promises) noC.push({ key: `promise:${p.to}`, label: p.what });
  if (c.debt > 0) noC.push({ key: "bank", label: "món nợ ngân hàng" });
  const n = pickNot(noC, prev?.no?.key);
  if (n) out.no = n;

  return out;
}

/** Mầm mà 3 vết đã dùng (host ghi `used` lúc vào mùa, để mùa sau ưu tiên mầm khác). */
export function scarPlants(s: Scars): PlantRef[] {
  const out: PlantRef[] = [];
  for (const x of [s.do, s.no]) if (x && x.kind) out.push({ kind: x.kind, key: x.key });
  return out;
}

/** Chữ để nhét vào chỗ trống. Người đã chết → "một người cũ"; vết trống → "". */
export function scarText(s: Scars, k: "nguoi" | "do" | "no", names: (id: string) => string, alive: (id: string) => boolean): string {
  if (k === "nguoi") {
    if (!s.nguoi) return "";
    return alive(s.nguoi.npc) ? names(s.nguoi.npc) : "một người cũ";
  }
  return s[k]?.label ?? "";
}
