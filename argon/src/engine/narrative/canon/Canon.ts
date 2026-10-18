/**
 * Generator canon event (spec 2026-10-18-canon-event §4). Tất định: mọi lựa chọn ngẫu nhiên đi qua `rng` do host
 * đưa vào (luồng RNG_SUB.canon, rekey theo seed và tuổi). Không đọc giờ, không Math.random.
 *
 * Trục thường: chọn mầm (CanonSeed) có điểm cao nhất trong các mầm điền đủ chỗ trống bắt buộc, rồi 3 cửa khác kiểu.
 * Trục Kỳ: không dùng mầm; một nhánh kỳ dị (WeirdBranch) làm biến cố, cả 3 cửa là nhánh kỳ dị.
 * Không mở lại mùa đã chơi trong đời này (R7): host đặt cờ "season_played_<id>" khi vào mùa.
 * Cửa dẫn tới mùa di cư (xu_nguoi) chỉ khả thi khi c.can_migrate (R14).
 */
import type { Axis, CastRole, Effect, FactContext, Plant, PlantKind, StoryletView } from "../types.ts";
import type { AssetKind } from "../../economy/Holdings.ts";
import { ASSET_KINDS } from "../../economy/Holdings.ts";
import type { Rng } from "../../core/Rng.ts";
import type { SeasonDef } from "./Season.ts";
import { strongestPlant } from "./Plants.ts";
import { WEIRD_DOOR_AT } from "./Pressure.ts";

/** 8 kiểu hành động của cửa: đối đầu, bỏ chạy, thỏa hiệp, lật bàn, nhận tội, trả đũa, buông, đánh cược. */
export type DoorKind = "doi_dau" | "bo_chay" | "thoa_hiep" | "lat_ban" | "nhan_toi" | "tra_dua" | "buong" | "danh_cuoc";
type Names = (id: string) => string;

/** Chỗ trống đã điền. `who` là id NPC; `fromPlayer` = số chỗ điền bằng vật gài của người chơi. */
export interface Slots { who?: string; what?: Plant | { kind: "asset"; key: AssetKind; label: string }; noi: string; fromPlayer: number }
export interface SeedDoor {
  kind: DoorKind; label: (s: Slots, c: FactContext, N: Names) => string; hint: string; season: string;
  when?: (c: FactContext, s: Slots) => boolean; effects?: (c: FactContext, s: Slots) => Effect;
}
export interface CanonSeed {
  id: string; axes: Axis[]; ages?: [number, number];
  who?: { roles?: CastRole[]; plants?: PlantKind[]; required: boolean };
  what?: { plants?: PlantKind[]; owns?: AssetKind[]; required: boolean };
  title: (s: Slots, c: FactContext, N: Names) => string;
  text: (s: Slots, c: FactContext, N: Names) => string;
  doors: SeedDoor[];
}
export interface WeirdBranch {
  id: string; kind: "sf" | "abs"; axes: Axis[]; when: (c: FactContext, s: Slots) => boolean;
  /** Gợi ý dưới nhãn cửa (≤ 70 ký tự). Không có thì sinh "Viễn tưởng|Phi lý: <tên mùa>", kẹp ở 70. */
  hint?: string;
  /** Nhãn cửa. */
  door: (s: Slots, c: FactContext, N: Names) => string;
  /** Biến cố khi trục Kỳ nổ và nhánh này làm trigger (cả 3 cửa kỳ dị). */
  trigger: (s: Slots, c: FactContext, N: Names) => { title: string; text: string };
  season: SeasonDef;
}
export interface ResolvedDoor { kind: DoorKind | "ky"; label: string; hint: string; season: string; weird?: string; effects?: Effect }
export interface CanonEvent { id: string; seed: string; axis: Axis; age: number; slots: Slots; title: string; text: string; doors: ResolvedDoor[] }

/** Mầm đã dùng trong đời này bị trừ chừng này. */
const USED_PENALTY = 100;
/** Mầm có trục vừa nổ được cộng chừng này: đủ thắng mầm lệch trục, nhưng luôn nhỏ hơn USED_PENALTY (mầm chưa dùng luôn thắng). */
const ON_AXIS_BONUS = 50;
/** 5 mùa thường theo thứ tự lùi về của cửa chung. */
const NORMAL_SEASONS = ["tron_chay", "vu_an_gia_toc", "ngoi_sao", "lam_lai", "xu_nguoi"] as const;
/** Mùa cần đã tự lập (bỏ đi, sang nước khác). */
const NEEDS_INDEPENDENT = new Set<string>(["tron_chay", "xu_nguoi"]);
/** Cờ host đặt khi vào một mùa (R7: mùa đã chơi không mở lại trong đời này). */
export const playedFlag = (seasonId: string): string => "season_played_" + seasonId;
const played = (c: FactContext, season: string): boolean => c.flags.has(playedFlag(season));
/** Mùa mà phần chính là di cư sang nước khác (R14): chỉ mở khi đời này còn đường di cư. */
const EMIGRATION_SEASONS = new Set<string>(["xu_nguoi"]);
/** Mùa còn mở được cho đời này: chưa chơi, và nếu là mùa di cư thì c.can_migrate. */
const seasonOpen = (c: FactContext, season: string): boolean => !played(c, season) && (!EMIGRATION_SEASONS.has(season) || c.can_migrate);
const whoName = (s: Slots, N: Names, dflt: string): string => (s.who ? N(s.who) : dflt);

/**
 * Cửa chung: một cửa cho mỗi kiểu, trải trên 5 mùa thường. Dùng để bù khi mầm thiếu cửa khả thi.
 * Mùa của cửa đã chơi thì lùi về mùa thường chưa chơi đầu tiên (xem genericSeason).
 */
export const GENERIC_DOORS: SeedDoor[] = [
  { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Không lùi nữa, chuyện sẽ ra tới nơi tới chốn",
    label: (s, c, N) => (s.who ? `Đối mặt thẳng với ${N(s.who)}` : "Đứng lại và đối mặt") },
  { kind: "bo_chay", season: "tron_chay", hint: "Thoát được hôm nay, mang theo mọi thứ chưa xong",
    label: (s) => `Bỏ ${s.noi || "nơi này"} mà đi trong đêm`, when: (c) => c.independent },
  { kind: "thoa_hiep", season: "lam_lai", hint: "Giữ được hòa khí, mất phần lớn những gì đã gây dựng",
    label: () => "Xuống nước, tìm cách dàn xếp" },
  { kind: "lat_ban", season: "ngoi_sao", hint: "Từ mai, cả thiên hạ sẽ nhìn vào bạn",
    label: () => "Lật bàn, kể hết cho mọi người cùng biết" },
  { kind: "nhan_toi", season: "lam_lai", hint: "Nhẹ lòng, nhưng phải bắt đầu lại từ đầu",
    label: () => "Nhận hết phần lỗi về mình" },
  { kind: "tra_dua", season: "vu_an_gia_toc", hint: "Hả giận một lúc, dây dưa nhiều năm",
    label: (s, c, N) => `Trả đũa ${whoName(s, N, "cho bằng được")}` },
  { kind: "buong", season: "xu_nguoi", hint: "Bắt đầu ở một nơi không ai biết mình",
    label: () => "Buông hết, đi thật xa", when: (c) => c.independent },
  { kind: "danh_cuoc", season: "ngoi_sao", hint: "Thắng thì đổi đời, thua cũng đổi đời",
    label: () => "Đánh cược tất cả vào một lần" },
];

/** Mùa thật của một cửa chung: mùa của nó nếu còn mở, không thì mùa thường chưa chơi đầu tiên; null nếu hết. */
function genericSeason(d: SeedDoor, c: FactContext): string | null {
  for (const s of [d.season, ...NORMAL_SEASONS]) if (seasonOpen(c, s) && (c.independent || !NEEDS_INDEPENDENT.has(s))) return s;
  return null;
}

/** Xáo Fisher–Yates bằng rng (bản sao). */
function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = rng.int(i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

const aliveSet = (c: FactContext): Set<string> => new Set(Object.values(c.cast).filter((v): v is string => !!v));

/**
 * Điền chỗ trống của một mầm, hoặc null nếu thiếu chỗ bắt buộc. Thứ tự (spec §4):
 *  1. vật gài của người chơi đúng loại (fromPlayer++); với `who` vật gài phải có npc còn sống;
 *  2. kẻ thù (c.nemesis còn sống), chỉ cho `who`;
 *  3. NPC còn sống mang một vai trong who.roles có |opinion| lớn nhất (hòa thì id nhỏ hơn);
 *  4. tài sản đang có, theo thứ tự what.owns (c.asset_names);
 *  5. thiếu chỗ bắt buộc → null.
 * `noi` = N("place") nếu có N (generateCanon luôn đưa), không thì "".
 */
export function fillSlots(seed: CanonSeed, c: FactContext, plants: Plant[], N?: Names): Slots | null {
  const s: Slots = { noi: N ? N("place") : "", fromPlayer: 0 };
  const alive = aliveSet(c);
  let usedPlant: Plant | undefined;

  if (seed.who) {
    const w = seed.who;
    const p = w.plants ? strongestPlant(plants.filter((x) => !!x.npc && alive.has(x.npc)), w.plants) : undefined;
    if (p && p.npc) { s.who = p.npc; s.fromPlayer++; usedPlant = p; }
    else if (c.nemesis && alive.has(c.nemesis)) s.who = c.nemesis;
    else if (w.roles?.length) {
      const ids = new Set<string>();
      for (const r of w.roles) { const id = c.cast[r]; if (id) ids.add(id); }
      for (const [id, rs] of Object.entries(c.roles)) if (rs.some((r) => w.roles!.includes(r))) ids.add(id);
      let best: string | undefined, bestAbs = -1;
      for (const id of [...ids].sort()) {
        if (!alive.has(id)) continue;
        const a = Math.abs(c.opinion[id] ?? 0);
        if (a > bestAbs) { best = id; bestAbs = a; }
      }
      if (best) s.who = best;
    }
    if (w.required && !s.who) return null;
  }

  if (seed.what) {
    const w = seed.what;
    const p = w.plants ? strongestPlant(plants.filter((x) => x !== usedPlant), w.plants) : undefined;
    if (p) { s.what = p; s.fromPlayer++; }
    else for (const k of w.owns ?? []) {
      const label = c.asset_names[k];
      if (label) { s.what = { kind: "asset", key: k, label }; break; }
    }
    if (w.required && !s.what) return null;
  }
  return s;
}

/** Mầm tổng quát để điền chỗ trống cho biến cố trục Kỳ (không có mầm thật). */
const KY_SLOTS: CanonSeed = {
  id: "_ky", axes: ["ky"], title: () => "", text: () => "", doors: [],
  who: { roles: ["mother", "father", "sibling", "childhood_friend", "bully", "neighbor", "first_boss", "official", "partner", "creditor", "mentor", "rival", "spouse", "child"], plants: ["person"], required: false },
  what: { plants: ["object", "animal", "skill", "debt", "promise", "secret", "place"], owns: [...ASSET_KINDS], required: false },
};

/** Độ dài tối đa của hint (như bộ kiểm nội dung). */
const HINT_MAX = 70;
const clampHint = (h: string): string => (h.length <= HINT_MAX ? h : h.slice(0, HINT_MAX - 1).trimEnd() + "…");
const weirdDoor = (b: WeirdBranch, s: Slots, c: FactContext, N: Names): ResolvedDoor =>
  ({ kind: "ky", label: b.door(s, c, N), hint: clampHint(b.hint ?? `${b.kind === "sf" ? "Viễn tưởng" : "Phi lý"}: ${b.season.vn}`), season: b.season.id, weird: b.id });

const seedDoor = (d: SeedDoor, season: string, s: Slots, c: FactContext, N: Names): ResolvedDoor => {
  const out: ResolvedDoor = { kind: d.kind, label: d.label(s, c, N), hint: d.hint, season };
  if (d.effects) out.effects = d.effects(c, s);
  return out;
};

/** Bù cửa chung cho đủ `n` cửa, khác kiểu với `taken`; ưu tiên cửa dẫn tới mùa chưa có trong `doors`. */
function fillGeneric(doors: ResolvedDoor[], n: number, s: Slots, c: FactContext, N: Names, rng: Rng): void {
  const kinds = new Set(doors.map((d) => d.kind));
  const cands: { d: SeedDoor; season: string }[] = [];
  for (const d of shuffle(GENERIC_DOORS, rng)) {
    if (kinds.has(d.kind) || (d.when && !d.when(c, s))) continue;
    const season = genericSeason(d, c);
    if (season) cands.push({ d, season });
  }
  while (doors.length < n) {
    const open = cands.filter((x) => !kinds.has(x.d.kind));
    if (!open.length) break;
    const seasons = new Set(doors.map((d) => d.season));
    const { d, season } = open.find((x) => !seasons.has(x.season)) ?? open[0]!;
    doors.push(seedDoor(d, season, s, c, N)); kinds.add(d.kind);
  }
}

/**
 * Sinh canon event cho trục `axis` vừa nổ, hoặc null nếu không dựng được (không mầm khả thi, không đủ 3 cửa,
 * hay trục Kỳ mà không nhánh kỳ dị nào khả thi).
 *
 * Trục thường:
 *  - mầm khả thi: trong khoảng tuổi `ages` và điền đủ chỗ trống bắt buộc.
 *  - điểm = 3 × fromPlayer + Σ c.pressure[axes] + (axis ∈ axes ? 50 : 0) − (cờ canon_<id> ? 100 : 0); hòa thì rng.pick.
 *    Mầm chưa dùng luôn thắng mầm đã dùng; ev.axis vẫn là trục vừa nổ.
 *  - cửa: lọc `when` và mùa đã chơi, xáo bằng rng, lấy 3 cửa khác kiểu; thiếu thì bù GENERIC_DOORS.
 *  - Độ điên > 0 và pressure.ky × weird ≥ WEIRD_DOOR_AT: cửa thứ 3 thành một nhánh kỳ dị khả thi
 *    (ưu tiên nhánh có `axis` trong `axes`).
 * Trục Kỳ (null nếu Độ điên 0): trigger = rng.pick(nhánh khả thi), cửa đầu là trigger, 2 cửa sau là nhánh khả thi khác (thiếu thì bù cửa chung).
 */
export function generateCanon(c: FactContext, axis: Axis, plants: Plant[], rng: Rng, N: Names, seeds: CanonSeed[], weird: WeirdBranch[]): CanonEvent | null {
  const weirdOk = (s: Slots) => weird.filter((b) => seasonOpen(c, b.season.id) && b.when(c, s));

  if (axis === "ky") {
    if (c.weird === 0) return null;   // Đời thật: không bao giờ có biến cố kỳ dị
    const slots = fillSlots(KY_SLOTS, c, plants, N)!;
    const ok = weirdOk(slots);
    if (!ok.length) return null;
    const trig = rng.pick(ok);
    const doors = [trig, ...shuffle(ok.filter((b) => b !== trig), rng).slice(0, 2)].map((b) => weirdDoor(b, slots, c, N));
    if (doors.length < 3) fillGeneric(doors, 3, slots, c, N, rng);   // R11: thiếu nhánh kỳ dị thì cửa chung bù, cửa trộn được chấp nhận
    if (doors.length < 3) return null;
    const { title, text } = trig.trigger(slots, c, N);
    return { id: `canon_${trig.id}_${c.age}`, seed: trig.id, axis, age: c.age, slots, title, text, doors };
  }

  const feasible: { seed: CanonSeed; slots: Slots }[] = [];
  for (const seed of seeds) {
    if (seed.ages && (c.age < seed.ages[0] || c.age > seed.ages[1])) continue;
    const slots = fillSlots(seed, c, plants, N);
    if (slots) feasible.push({ seed, slots });
  }
  const pool = feasible;
  if (!pool.length) return null;
  const score = (f: { seed: CanonSeed; slots: Slots }) =>
    3 * f.slots.fromPlayer + f.seed.axes.reduce((t, a) => t + (c.pressure[a] ?? 0), 0)
    + (f.seed.axes.includes(axis) ? ON_AXIS_BONUS : 0) - (c.flags.has(`canon_${f.seed.id}`) ? USED_PENALTY : 0);
  const top = Math.max(...pool.map(score));
  const best = pool.filter((f) => score(f) === top);
  const { seed, slots } = best.length === 1 ? best[0]! : rng.pick(best);

  const doors: ResolvedDoor[] = [];
  const kinds = new Set<string>();
  for (const d of shuffle(seed.doors.filter((d) => seasonOpen(c, d.season) && (!d.when || d.when(c, slots))), rng)) {
    if (doors.length >= 3) break;
    if (kinds.has(d.kind)) continue;
    doors.push(seedDoor(d, d.season, slots, c, N)); kinds.add(d.kind);
  }
  if (doors.length < 3) fillGeneric(doors, 3, slots, c, N, rng);

  if (c.weird > 0 && c.pressure.ky * c.weird >= WEIRD_DOOR_AT) {
    const ok = weirdOk(slots);
    const pref = ok.filter((b) => b.axes.includes(axis));
    const pick = (pref.length ? pref : ok);
    if (pick.length) { doors.splice(2, doors.length, weirdDoor(rng.pick(pick), slots, c, N)); }
  }
  if (doors.length < 3) return null;
  return {
    id: `canon_${seed.id}_${c.age}`, seed: seed.id, axis, age: c.age, slots,
    title: seed.title(slots, c, N), text: seed.text(slots, c, N), doors,
  };
}

/**
 * Cảnh hiển thị của canon event. Mỗi cửa thành một lựa chọn với effects
 * `{ custom: "canon:<axis>|season:<id>", flags: ["canon_<seed>", "canon_door_<kind>"(, "weird_<nhánh>")] }`
 * gộp với effects của cửa: custom nối bằng "|", cờ cộng thêm, các trường khác lấy của cửa.
 */
export function canonView(ev: CanonEvent): StoryletView {
  const choices = ev.doors.map((d) => {
    const flags = [`canon_${ev.seed}`, `canon_door_${d.kind}`, ...(d.weird ? [`weird_${d.weird}`] : [])];
    const custom = `canon:${ev.axis}|season:${d.season}`;
    const x = d.effects;
    const effects: Effect = x
      ? { ...x, custom: x.custom ? `${custom}|${x.custom}` : custom, flags: [...flags, ...(x.flags ?? [])] }
      : { custom, flags };
    return { label: d.label, hint: d.hint, effects };
  });
  return { title: ev.title, text: ev.text, choices, def: 0, ...(ev.slots.who ? { npc: ev.slots.who } : {}) };
}
