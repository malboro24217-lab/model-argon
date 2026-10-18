/**
 * Của cải: tài sản có tên, vay mua nhà, mức sống, tiền gửi, bảo hiểm, cho người khác vay.
 * Spec: docs/superpowers/specs/2026-10-18-tien-bac-design.md.
 *
 * Thuần, không phụ thuộc giao diện. Mọi hàm nhận trạng thái và trả lại con số tiền mặt để host cộng vào sổ
 * (capitalAssets.liquid). Tiền vay mua tài sản nằm trên chính tài sản (Asset.loan), KHÔNG nằm trong
 * capitalAssets.debt: nợ tiêu dùng bị trả gốc 5 %/quý, một khoản vay mua nhà 20 năm thì không.
 */
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";
import type { EconomicPhase } from "../types/SpawnVector.ts";
import type { Archetype } from "../types/AgentArchetype.ts";

export type AssetKind = "house" | "land" | "vehicle" | "shop" | "gold" | "deposit" | "stake";
export const ASSET_KINDS: readonly AssetKind[] = ["house", "land", "vehicle", "shop", "gold", "deposit", "stake"];
export type Lifestyle = "tan_tien" | "vua_phai" | "thoai_mai" | "pho_truong";
export const LIFESTYLES: readonly Lifestyle[] = ["tan_tien", "vua_phai", "thoai_mai", "pho_truong"];
export type SupportLevel = "it" | "du" | "hau";
export type PolicyKind = "health" | "property";

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  /** Giá thị trường hiện tại, CU. */
  value: number;
  cost: number;
  bought_age: number;
  /** Gốc còn nợ của khoản vay mua món này, CU. */
  loan: number;
  loan_rate: number;
  loan_years_left: number;
  /** Số năm liền không trả nổi tiền góp. 2 = bị ngân hàng siết. */
  missed: number;
  /** Người góp chung (kind "stake"). */
  co_owner?: string;
  /** Món này đến từ đâu: mua, thừa kế, được cho. */
  origin: "bought" | "inherited" | "gift";
}
export interface Receivable { npc: string; amount: number; lent_age: number; due_age: number; repaid: number; closed: boolean }
export interface Policy { kind: PolicyKind; since: number }
export interface Holdings {
  assets: Asset[];
  lifestyle: Lifestyle;
  lifestyle_since: number;
  receivables: Receivable[];
  policies: Policy[];
  support: { parents: SupportLevel; kids: SupportLevel };
  next_id: number;
  /** Sổ ghi lại món đã bán / bị siết để kể cuối đời. */
  closed: Array<{ name: string; kind: AssetKind; cost: number; got: number; age: number; how: "sold" | "seized" | "lost" }>;
}

/** Thị trường của nước đang sống. Tiền là CU (= $ PPP trong trò chơi). */
export interface MarketCtx {
  gdp: number;
  /** Thu nhập năm trung vị của nước, CU: giá nhà neo vào con số này, không vào thu nhập riêng của người chơi. */
  median_yearly: number;
  urban: boolean;
  institutional_trust: number;
  interest_rate: number;
  inflation_rate: number;
}

export function createHoldings(): Holdings {
  return { assets: [], lifestyle: "thoai_mai", lifestyle_since: 0, receivables: [], policies: [], support: { parents: "du", kids: "du" }, next_id: 1, closed: [] };
}

/* ------------------------------------------------------------------ Mức sống */

/**
 * Hệ số nhân lên lifestyleSpend (TickManager). "thoai_mai" = 1 là hành vi cũ của engine (chi ngầm theo dopamine),
 * nên đời nào không động vào mức sống thì kinh tế y như trước.
 */
export const LIFESTYLE_MULT: Readonly<Record<Lifestyle, number>> = Object.freeze({ tan_tien: 0.35, vua_phai: 0.7, thoai_mai: 1, pho_truong: 1.5 });
export const LIFESTYLE_VN: Readonly<Record<Lifestyle, string>> = Object.freeze({ tan_tien: "tằn tiện", vua_phai: "vừa phải", thoai_mai: "thoải mái", pho_truong: "phô trương" });

/**
 * Tác động phi tiền bạc mỗi năm. Tằn tiện lâu thì mệt mỏi dần (năm thứ 6 trở đi), phô trương thì vui và được để ý,
 * nhất là nơi lòng tin thể chế thấp: ở đó của cải nhìn thấy được là tín hiệu (Signaling), không phải chuyện riêng.
 */
export function lifestyleYear(l: Lifestyle, yearsIn: number, inst: number): { happy: number; rel: number; reputation_trust: number } {
  switch (l) {
    case "tan_tien": return { happy: yearsIn >= 6 ? -3 : -1.5, rel: -1, reputation_trust: 0 };
    case "vua_phai": return { happy: -0.5, rel: 0, reputation_trust: 0 };
    case "thoai_mai": return { happy: 0, rel: 0, reputation_trust: 0 };
    case "pho_truong": return { happy: 2, rel: 0.5, reputation_trust: 0.02 * (1 - inst) };
  }
}

/* ------------------------------------------------------------------ Giá */

/**
 * Giá một căn hộ thành phố chia cho thu nhập năm của hộ, theo GDP đầu người (PPP).
 * Neo vào Numbeo Property Prices Index (căn hộ ~90 m² / thu nhập ròng trung bình của hộ):
 * nước giàu ~4–8; Kenya 13,6, Morocco 14,5, Algeria 16, Ethiopia 28,9 (Numbeo 2023, theo Pulse Uganda).
 *   ratio = 6 + 14 · clamp((log10 60 000 − log10 gdp) / 0,9, 0, 1,5)
 * → 60k$: 6 · 14k$ (VN): ≈ 15,8 · 3k$: ≈ 26 · ≤ 2k$: 27.
 */
export function housePriceToIncome(gdp: number): number {
  return 6 + 14 * clamp((Math.log10(60000) - Math.log10(Math.max(500, gdp))) / 0.9, 0, 1.5);
}

/** Nhà ở nông thôn / thị trấn: giả định của trò chơi, 35 % giá căn hộ thành phố. */
const RURAL_HOUSE = 0.35;

/** Giá điển hình (CU) của một món mới theo loại. Những loại không có giá điển hình (vàng, tiền gửi, góp vốn) trả 0. */
export function basePrice(kind: AssetKind, m: MarketCtx): number {
  const house = housePriceToIncome(m.gdp) * m.median_yearly * (m.urban ? 1 : RURAL_HOUSE);
  switch (kind) {
    case "house": return house;
    case "land": return 0.4 * house;
    case "shop": return 0.5 * house;
    // Xe: nước nghèo thường là xe máy (≈ 0,3 năm thu nhập trung vị), nước giàu là ô tô cũ (≈ 0,5).
    case "vehicle": return m.median_yearly * (m.gdp < 8000 ? 0.3 : m.gdp < 30000 ? 0.4 : 0.5);
    default: return 0;
  }
}

/** Khung giá chấp nhận được (CU). Ngoài khung thì thẻ hay AI đang bịa giá: engine kẹp lại. */
export function priceBounds(kind: AssetKind, m: MarketCtx): [number, number] {
  const b = basePrice(kind, m);
  switch (kind) {
    case "house": return [0.25 * b, 2.5 * b];
    case "land": return [0.1 * b, 3 * b];
    case "shop": return [0.2 * b, 3 * b];
    case "vehicle": return [0.15 * b, 8 * b];
    default: return [1, Number.POSITIVE_INFINITY];
  }
}

/** Phần mất khi bán (môi giới, bán vội, thuế). Mua xong bán ngay luôn lỗ. */
export const HAIRCUT: Readonly<Record<AssetKind, number>> = Object.freeze({ house: 0.08, land: 0.08, vehicle: 0.15, shop: 0.25, gold: 0.03, deposit: 0, stake: 0.4 });
/** Chi giữ mỗi năm, tỉ lệ trên giá trị (sửa chữa, thuế, xăng, bảo dưỡng). */
const UPKEEP: Readonly<Record<AssetKind, number>> = Object.freeze({ house: 0.01, land: 0.002, vehicle: 0.06, shop: 0.02, gold: 0, deposit: 0, stake: 0 });
/** Thu mỗi năm, tỉ lệ trên giá trị: cửa hàng cho thuê. Nhà để ở không sinh tiền; tiền gửi và góp vốn tính riêng. */
const YIELD: Readonly<Record<AssetKind, number>> = Object.freeze({ house: 0, land: 0, vehicle: 0, shop: 0.07, gold: 0, deposit: 0, stake: 0 });

/** Xu hướng giá mỗi năm theo pha kinh tế, và độ biến động (độ lệch chuẩn). */
const DRIFT: Readonly<Record<AssetKind, Record<EconomicPhase, number>>> = Object.freeze({
  house:   { boom: 0.06, stagnation: 0.01, crisis: -0.08 },
  land:    { boom: 0.08, stagnation: 0.01, crisis: -0.12 },
  shop:    { boom: 0.04, stagnation: 0, crisis: -0.12 },
  vehicle: { boom: -0.12, stagnation: -0.12, crisis: -0.14 },
  gold:    { boom: -0.02, stagnation: 0.02, crisis: 0.1 },
  deposit: { boom: 0, stagnation: 0, crisis: 0 },
  stake:   { boom: 0, stagnation: 0, crisis: 0 },
});
const VOL: Readonly<Record<AssetKind, number>> = Object.freeze({ house: 0.04, land: 0.08, shop: 0.06, vehicle: 0.02, gold: 0.12, deposit: 0, stake: 0 });

/* ------------------------------------------------------------------ Vay mua */

/**
 * Điều kiện vay mua tài sản. Lãi vay mua nhà thấp hơn lãi tiêu dùng (có tài sản bảo đảm): 65 % lãi chung.
 * Nơi lòng tin thể chế thấp: kỳ hạn ngắn, trả trước nhiều (50 % ở 0,1 → 20 % ở 0,9).
 */
export function loanTerms(m: MarketCtx): { rate: number; years: number; min_down: number } {
  const t = clamp(m.institutional_trust, 0, 1);
  return { rate: m.interest_rate * 0.65, years: t >= 0.5 ? 20 : t >= 0.3 ? 15 : 10, min_down: clamp(0.5 - 0.375 * (t - 0.1), 0.2, 0.5) };
}
/** Tiền góp mỗi năm (gốc + lãi đều) cho một khoản vay. */
export function annuity(principal: number, rate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (rate <= 0) return principal / years;
  return (principal * rate) / (1 - Math.pow(1 + rate, -years));
}
/** Tổng tiền góp các khoản vay mua tài sản trong một năm. */
export function loanService(h: Holdings): number {
  let s = 0; for (const a of h.assets) if (a.loan > 0) s += annuity(a.loan, a.loan_rate, a.loan_years_left); return s;
}
export function loanTotal(h: Holdings): number { let s = 0; for (const a of h.assets) s += a.loan; return s; }

export interface BuyRequest { kind: AssetKind; name: string; price: number; borrow: boolean; co_owner?: string }
export interface BuyQuote { ok: boolean; reason: "" | "khong_du_tien" | "ngan_hang_tu_choi" | "gia_khong_hop_le"; price: number; down: number; loan: number; payment: number; clamped: boolean }

/**
 * Báo giá trước khi mua. `cash` = tiền mặt ròng có thể dùng (liquid − nợ tiêu dùng), `yearly` = thu nhập năm của người chơi.
 * Ngân hàng chỉ cho vay khi tiền góp mọi khoản vay mua sau khi vay ≤ 40 % thu nhập (cùng ngưỡng với Rat Race).
 */
export function quoteBuy(h: Holdings, r: BuyRequest, m: MarketCtx, cash: number, yearly: number): BuyQuote {
  const [lo, hi] = priceBounds(r.kind, m);
  if (!(r.price > 0) || !Number.isFinite(r.price)) return { ok: false, reason: "gia_khong_hop_le", price: 0, down: 0, loan: 0, payment: 0, clamped: false };
  const price = clamp(r.price, lo, hi);
  const clamped = Math.abs(price - r.price) > 1e-6 * Math.max(1, r.price);
  const financeable = r.kind === "house" || r.kind === "land" || r.kind === "shop" || r.kind === "vehicle";
  const t = loanTerms(m);
  if (!r.borrow || !financeable) {
    return cash >= price ? { ok: true, reason: "", price, down: price, loan: 0, payment: 0, clamped } : { ok: false, reason: "khong_du_tien", price, down: price, loan: 0, payment: 0, clamped };
  }
  // Vay: trả trước đúng mức tối thiểu, hoặc nhiều hơn nếu có sẵn tiền (giữ lại 3 tháng thu nhập phòng thân).
  const down = Math.max(price * t.min_down, Math.min(price, cash - 0.25 * yearly));
  if (cash < price * t.min_down) return { ok: false, reason: "khong_du_tien", price, down: price * t.min_down, loan: 0, payment: 0, clamped };
  const loan = Math.max(0, price - down);
  const payment = annuity(loan, t.rate, t.years);
  if (loanService(h) + payment > 0.4 * Math.max(1, yearly)) return { ok: false, reason: "ngan_hang_tu_choi", price, down, loan, payment, clamped };
  return { ok: true, reason: "", price, down, loan, payment, clamped };
}

/** Mua theo một báo giá đã ok. Trả tiền mặt phải chi (âm). */
export function buyAsset(h: Holdings, r: BuyRequest, q: BuyQuote, m: MarketCtx, age: number): { asset: Asset; cash: number } {
  const t = loanTerms(m);
  // Giá trị sổ sách ngay sau khi mua: mất phí giao dịch (nửa haircut), như purchaseDelta của engine.
  const value = q.price * (1 - HAIRCUT[r.kind] / 2);
  const asset: Asset = {
    id: `as_${h.next_id++}`, kind: r.kind, name: r.name.slice(0, 40) || defaultName(r.kind), value, cost: q.price, bought_age: age,
    loan: q.loan, loan_rate: q.loan > 0 ? t.rate : 0, loan_years_left: q.loan > 0 ? t.years : 0, missed: 0, origin: "bought",
    ...(r.co_owner ? { co_owner: r.co_owner } : {}),
  };
  h.assets.push(asset);
  return { asset, cash: -q.down };
}

/** Thêm một món không qua mua (thừa kế, được cho). Không tốn tiền. */
export function addAsset(h: Holdings, kind: AssetKind, name: string, value: number, age: number, origin: "inherited" | "gift"): Asset {
  const asset: Asset = { id: `as_${h.next_id++}`, kind, name: name.slice(0, 40) || defaultName(kind), value: Math.max(0, value), cost: 0, bought_age: age, loan: 0, loan_rate: 0, loan_years_left: 0, missed: 0, origin };
  h.assets.push(asset);
  return asset;
}

export function defaultName(k: AssetKind): string {
  return { house: "căn nhà", land: "mảnh đất", vehicle: "chiếc xe", shop: "cửa hàng", gold: "số vàng", deposit: "sổ tiết kiệm", stake: "phần vốn góp" }[k];
}

/** Bán một món: nhận giá trị trừ haircut, trả hết khoản vay của món đó. Trả tiền mặt ròng (có thể âm nếu nợ vượt giá). */
export function sellAsset(h: Holdings, id: string, age: number, how: "sold" | "seized" | "lost" = "sold"): { asset: Asset; cash: number } | null {
  const i = h.assets.findIndex((a) => a.id === id); if (i < 0) return null;
  const a = h.assets[i]!;
  const gross = how === "lost" ? 0 : a.value * (1 - HAIRCUT[a.kind] * (how === "seized" ? 2 : 1));
  const cash = gross - a.loan;
  h.assets.splice(i, 1);
  h.closed.push({ name: a.name, kind: a.kind, cost: a.cost, got: gross, age, how });
  return { asset: a, cash };
}

/** Tìm món theo tên (gần đúng, không phân biệt hoa thường) hoặc theo loại. */
export function findAsset(h: Holdings, q: { name?: string; kind?: AssetKind }): Asset | undefined {
  const n = (q.name ?? "").trim().toLowerCase();
  if (n) { const hit = h.assets.find((a) => a.name.toLowerCase() === n) ?? h.assets.find((a) => a.name.toLowerCase().includes(n) || n.includes(a.name.toLowerCase())); if (hit) return hit; }
  if (q.kind) return h.assets.find((a) => a.kind === q.kind);
  return undefined;
}

/* ------------------------------------------------------------------ Tiền gửi */

/** Lãi thực của tiền gửi: 60 % lãi vay trừ lạm phát, không âm. */
export function depositRate(m: MarketCtx): number { return Math.max(0, m.interest_rate * 0.6 - m.inflation_rate); }
export function deposit(h: Holdings, amount: number, age: number): { cash: number } {
  if (!(amount > 0)) return { cash: 0 };
  const d = h.assets.find((a) => a.kind === "deposit");
  if (d) d.value += amount; else h.assets.push({ id: `as_${h.next_id++}`, kind: "deposit", name: "sổ tiết kiệm", value: amount, cost: amount, bought_age: age, loan: 0, loan_rate: 0, loan_years_left: 0, missed: 0, origin: "bought" });
  return { cash: -amount };
}
export function withdraw(h: Holdings, amount: number): { cash: number } {
  const d = h.assets.find((a) => a.kind === "deposit"); if (!d || !(amount > 0)) return { cash: 0 };
  const take = Math.min(d.value, amount); d.value -= take;
  if (d.value < 1) h.assets.splice(h.assets.indexOf(d), 1);
  return { cash: take };
}

/* ------------------------------------------------------------------ Bảo hiểm */

/** Phí năm và mức chi trả. Nơi lòng tin thể chế thấp thì bảo hiểm trả ít hơn và hay cãi. */
export function policyTerms(kind: PolicyKind, m: MarketCtx, yearly: number, insuredValue: number): { premium: number; cover: number } {
  const cover = clamp(0.3 + 0.5 * m.institutional_trust, 0.3, 0.8);
  return kind === "health" ? { premium: 0.03 * Math.max(yearly, 0.5 * m.median_yearly), cover } : { premium: 0.006 * insuredValue, cover };
}
export function hasPolicy(h: Holdings, k: PolicyKind): boolean { return h.policies.some((p) => p.kind === k); }

/* ------------------------------------------------------------------ Một năm */

export interface YearReport {
  revalued: Array<{ id: string; name: string; before: number; after: number }>;
  rent: number; upkeep: number; interest: number; premiums: number; loan_paid: number;
  /** Những món bị ngân hàng siết vì 2 năm liền không góp nổi. */
  foreclosed: Array<{ name: string; cash: number }>;
  /** Thiên tai / hỏa hoạn / mất cắp: món nào mất bao nhiêu, bảo hiểm trả bao nhiêu. */
  disasters: Array<{ name: string; loss: number; paid: number }>;
  bank_failed: number;
  /** Tiền mặt ròng của cả năm (đã gồm mọi thứ ở trên). */
  cash: number;
}

/**
 * Chạy một năm cho của cải. Gọi sau 4 quý của TickManager.
 * `cash` = tiền mặt hiện có, để biết có góp nổi tiền vay hay không. Không rút rng khi chưa có gì (đời không có của cải
 * giữ nguyên chuỗi ngẫu nhiên như trước).
 */
export function holdingsYear(h: Holdings, m: MarketCtx, phase: EconomicPhase, cash: number, yearly: number, age: number, rng: Rng): YearReport {
  const rep: YearReport = { revalued: [], rent: 0, upkeep: 0, interest: 0, premiums: 0, loan_paid: 0, foreclosed: [], disasters: [], bank_failed: 0, cash: 0 };
  if (!h.assets.length && !h.policies.length) return rep;
  // 1. Định giá lại
  for (const a of h.assets) {
    if (a.kind === "deposit" || a.kind === "stake") continue;
    const before = a.value;
    a.value = Math.max(0, a.value * (1 + DRIFT[a.kind][phase] + VOL[a.kind] * rng.normal()));
    if (Math.abs(a.value - before) >= 0.1 * Math.max(1, before)) rep.revalued.push({ id: a.id, name: a.name, before, after: a.value });
  }
  // 2. Tiền gửi sinh lãi; ngân hàng có thể đổ khi khủng hoảng ở nơi lòng tin thấp.
  const dep = h.assets.find((a) => a.kind === "deposit");
  if (dep) {
    if (phase === "crisis" && rng.chance(0.03 * (1 - m.institutional_trust))) { const lost = dep.value * 0.5; dep.value -= lost; rep.bank_failed = lost; }
    const i = dep.value * depositRate(m); dep.value += i; rep.interest = i;
  }
  // 3. Thu, chi giữ
  for (const a of h.assets) { rep.rent += a.value * YIELD[a.kind]; rep.upkeep += a.value * UPKEEP[a.kind]; }
  // 4. Bảo hiểm và rủi ro mất tài sản
  const physical = h.assets.filter((a) => a.kind === "house" || a.kind === "shop" || a.kind === "vehicle");
  const propValue = physical.reduce((s, a) => s + a.value, 0);
  for (const p of h.policies) rep.premiums += policyTerms(p.kind, m, yearly, propValue).premium;
  for (const a of physical) {
    if (!rng.chance(a.kind === "vehicle" ? 0.02 : 0.01)) continue;
    const loss = a.value * (a.kind === "vehicle" ? 0.6 : 0.35);
    const paid = hasPolicy(h, "property") ? loss * policyTerms("property", m, yearly, propValue).cover : 0;
    a.value -= loss; rep.disasters.push({ name: a.name, loss, paid });
  }
  let net = rep.rent - rep.upkeep - rep.premiums + rep.disasters.reduce((s, d) => s + d.paid, 0);
  // 5. Góp tiền vay: trả nổi thì gốc giảm; không nổi 2 năm liền thì ngân hàng siết.
  let avail = cash + net;
  for (const a of [...h.assets]) {
    if (a.loan <= 0) continue;
    const pay = annuity(a.loan, a.loan_rate, a.loan_years_left);
    if (avail >= pay) {
      const interest = a.loan * a.loan_rate;
      a.loan = Math.max(0, a.loan - (pay - interest)); a.loan_years_left = Math.max(0, a.loan_years_left - 1); a.missed = 0;
      if (a.loan_years_left === 0) a.loan = 0;
      avail -= pay; net -= pay; rep.loan_paid += pay;
    } else {
      a.missed += 1; a.loan += a.loan * a.loan_rate; // lãi chồng lãi
      if (a.missed >= 2) { const s = sellAsset(h, a.id, age, "seized")!; net += s.cash; avail += s.cash; rep.foreclosed.push({ name: a.name, cash: s.cash }); }
    }
  }
  rep.cash = net;
  return rep;
}

/** Ốm: bảo hiểm sức khỏe trả lại bao nhiêu trên một khoản viện phí. */
export function healthPayout(h: Holdings, m: MarketCtx, bill: number): number {
  return hasPolicy(h, "health") && bill > 0 ? bill * clamp(0.3 + 0.5 * m.institutional_trust, 0.3, 0.8) : 0;
}

/* ------------------------------------------------------------------ Vỡ nợ */

/** Thứ tự chủ nợ siết: thứ dễ bán trước, chỗ ở sau cùng. */
const SEIZE_ORDER: readonly AssetKind[] = ["deposit", "stake", "gold", "vehicle", "shop", "land", "house"];
/**
 * Siết tài sản cho đến khi tiền thu về đủ `need`. Bán bị ép (haircut gấp đôi). Trả danh sách món bị siết và tiền thu được.
 */
export function seizeForDebt(h: Holdings, need: number, age: number): { seized: Asset[]; raised: number } {
  const seized: Asset[] = []; let raised = 0;
  for (const k of SEIZE_ORDER) {
    for (const a of h.assets.filter((x) => x.kind === k)) {
      if (raised >= need) return { seized, raised };
      const s = sellAsset(h, a.id, age, "seized")!; raised += s.cash; seized.push(s.asset);
    }
  }
  return { seized, raised };
}

/* ------------------------------------------------------------------ Cho vay */

/**
 * Xác suất một người trả món nợ đến hạn năm nay. Trò chơi lặp lại: người "ăn miếng trả miếng" trả nếu bạn chưa từng chơi xấu
 * với họ; kẻ "luôn tham" hiếm khi trả; nơi pháp luật mạnh thì quỵt khó hơn. Món nợ càng lớn so với thu nhập của họ càng dễ quỵt.
 */
export function repayChance(arch: Archetype, opinion: number, inst: number, playerDefected: boolean, sizeVsTheirIncome: number): number {
  const base: Record<Archetype, number> = { tit_for_tat: 0.65, generous_tit_for_tat: 0.7, grudger: 0.7, opportunist: 0.3, always_defect: 0.1 };
  let p = base[arch];
  if (playerDefected && (arch === "grudger" || arch === "tit_for_tat")) p = 0.2;
  p += 0.15 * clamp(opinion, -1, 1) + 0.3 * (inst - 0.5) - 0.12 * Math.max(0, sizeVsTheirIncome - 0.5);
  return clamp(p, 0.03, 0.97);
}
export function lend(h: Holdings, npc: string, amount: number, age: number, years: number): { cash: number; rec: Receivable } {
  const rec: Receivable = { npc, amount, lent_age: age, due_age: age + Math.max(1, Math.round(years)), repaid: 0, closed: false };
  h.receivables.push(rec);
  return { cash: -amount, rec };
}
export function owedToMe(h: Holdings): number { let s = 0; for (const r of h.receivables) if (!r.closed) s += r.amount - r.repaid; return s; }

/* ------------------------------------------------------------------ Tổng kết */

export interface NetWorth { assets: number; loans: number; deposit: number; owed_to_me: number }
export function netWorth(h: Holdings): NetWorth {
  let assets = 0, deposit = 0;
  for (const a of h.assets) { if (a.kind === "deposit") deposit += a.value; else assets += a.value; }
  return { assets, loans: loanTotal(h), deposit, owed_to_me: owedToMe(h) };
}
/** Phần của cải dạng tài sản (không gồm tiền gửi) — host ghi vào capitalAssets.illiquid để mã cũ đọc đúng. */
export function illiquidValue(h: Holdings): number { let s = 0; for (const a of h.assets) if (a.kind !== "deposit") s += a.value; return s; }
