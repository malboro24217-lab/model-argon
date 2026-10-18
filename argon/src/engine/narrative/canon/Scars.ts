/**
 * 3 vết mang sang mùa mới: một người, một đồ hay kỹ năng, một món nợ hay lời hứa (spec §5).
 */
import type { FactContext, Plant } from "../types.ts";
import { strongestPlant } from "./Plants.ts";

export interface Scars {
  nguoi?: { npc: string; label: string };
  do?: { key: string; label: string };
  no?: { key: string; label: string };
}

/** Chọn 3 vết lúc vào mùa. `names` cho tên hiển thị; chỉ id có trong c.cast mới tính là còn sống. */
export function pickScars(c: FactContext, plants: Plant[], promises: { to: string; what: string }[], names: (id: string) => string): Scars {
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

  // Đồ hay kỹ năng: vật gài, rồi tài sản, rồi nghề.
  const obj = strongestPlant(plants, ["object", "skill", "animal"]);
  if (obj) out.do = { key: obj.key, label: obj.label };
  else {
    const asset = Object.entries(c.asset_names).find(([, v]) => !!v);
    if (asset) out.do = { key: asset[0], label: asset[1] as string };
    else if (c.job) out.do = { key: "job", label: c.job };
  }

  // Nợ hay lời hứa: vật gài, rồi lời hứa chưa trả, rồi nợ ngân hàng.
  const owe = strongestPlant(plants, ["debt", "promise"]);
  if (owe) out.no = { key: owe.key, label: owe.label };
  else if (promises[0]) out.no = { key: `promise:${promises[0].to}`, label: promises[0].what };
  else if (c.debt > 0) out.no = { key: "bank", label: "món nợ ngân hàng" };

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
