/** Kiểm thử của cải (economy/Holdings.ts). Chạy: node --experimental-strip-types src/holdings-test.ts */
import {
  createHoldings, createRng, housePriceToIncome, basePrice, priceBounds, quoteBuy, buyAsset, sellAsset, holdingsYear, seizeForDebt,
  deposit, withdraw, depositRate, repayChance, lend, owedToMe, netWorth, annuity, loanTerms, addAsset, healthPayout, findAsset,
  sanitizeAct, moneyActionEffect, isMoneyAction, type MarketCtx,
} from "./engine/index.ts";

let fails = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fails++; console.log("FAIL " + msg); } };
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

const VN: MarketCtx = { gdp: 14000, median_yearly: 6000, urban: true, institutional_trust: 0.56, interest_rate: 0.14, inflation_rate: 0.04 };
const NO: MarketCtx = { gdp: 65000, median_yearly: 40000, urban: true, institutional_trust: 0.9, interest_rate: 0.07, inflation_rate: 0.04 };
const CD: MarketCtx = { gdp: 1500, median_yearly: 900, urban: false, institutional_trust: 0.1, interest_rate: 0.22, inflation_rate: 0.08 };

/* 1. Giá nhà neo theo Numbeo: nước giàu ~6, VN ~16, nước nghèo ~27 */
ok(near(housePriceToIncome(60000), 6, 0.01), "ratio 60k = 6");
ok(housePriceToIncome(14000) > 14 && housePriceToIncome(14000) < 18, "ratio VN in 14..18: " + housePriceToIncome(14000));
ok(near(housePriceToIncome(1500), 27, 0.01), "ratio poor capped at 27");
ok(basePrice("house", { ...CD, urban: false }) < basePrice("house", { ...CD, urban: true }), "rural cheaper");

/* 2. Mua bằng tiền mặt, không đủ tiền thì bị từ chối */
{
  const h = createHoldings();
  const q = quoteBuy(h, { kind: "vehicle", name: "xe máy", price: 2000, borrow: false }, VN, 1500, 6000);
  ok(!q.ok && q.reason === "khong_du_tien", "cash buy refused when short");
  const q2 = quoteBuy(h, { kind: "vehicle", name: "xe máy", price: 2000, borrow: false }, VN, 5000, 6000);
  ok(q2.ok && q2.loan === 0 && q2.down === 2000, "cash buy ok");
  const b = buyAsset(h, { kind: "vehicle", name: "xe máy", price: 2000, borrow: false }, q2, VN, 25);
  ok(b.cash === -2000 && h.assets.length === 1, "buy records asset and spends cash");
  const s = sellAsset(h, b.asset.id, 25)!;
  ok(s.cash < 2000 * 0.9, "buy-then-sell loses money: " + s.cash);
  ok(h.assets.length === 0 && h.closed.length === 1, "sold asset leaves the book");
}

/* 3. Giá bịa bị kẹp vào khung */
{
  const h = createHoldings(); const [lo, hi] = priceBounds("house", VN);
  const q = quoteBuy(h, { kind: "house", name: "biệt thự", price: hi * 10, borrow: false }, VN, hi * 20, 6000);
  ok(q.clamped && near(q.price, hi, 1e-6), "absurd price clamped to ceiling");
  const q2 = quoteBuy(h, { kind: "house", name: "chòi", price: 1, borrow: false }, VN, hi, 6000);
  ok(q2.clamped && near(q2.price, lo, 1e-6), "absurd low price clamped to floor");
}

/* 4. Vay mua: ngân hàng giữ ngưỡng 40 % thu nhập; nơi lòng tin thấp phải trả trước nhiều hơn */
{
  ok(loanTerms(CD).min_down > loanTerms(NO).min_down, "low trust → bigger down payment");
  ok(loanTerms(CD).years < loanTerms(NO).years, "low trust → shorter term");
  const h = createHoldings(); const price = basePrice("house", NO);
  const rich = quoteBuy(h, { kind: "house", name: "căn hộ", price, borrow: true }, NO, price * 0.3, 60000);
  ok(rich.ok && rich.loan > 0 && rich.payment <= 0.4 * 60000 + 1e-6, "Norway mortgage approved within 40 %: " + JSON.stringify(rich));
  const poor = quoteBuy(h, { kind: "house", name: "căn hộ", price, borrow: true }, NO, price * 0.3, 8000);
  ok(!poor.ok && poor.reason === "ngan_hang_tu_choi", "low earner refused by bank");
  ok(near(annuity(1000, 0, 10), 100, 1e-9) && annuity(1000, 0.1, 10) > 100, "annuity");
}

/* 5. Góp vay: trả đều thì hết nợ đúng hạn; không trả nổi 2 năm thì bị siết */
{
  const h = createHoldings(); const price = basePrice("house", NO);
  const q = quoteBuy(h, { kind: "house", name: "căn hộ", price, borrow: true }, NO, price * 0.3, 60000);
  buyAsset(h, { kind: "house", name: "căn hộ", price, borrow: true }, q, NO, 30);
  const rng = createRng(1);
  for (let y = 0; y < loanTerms(NO).years; y++) holdingsYear(h, NO, "stagnation", 1e9, 60000, 31 + y, rng);
  ok(h.assets[0]!.loan === 0, "mortgage paid off after term: " + h.assets[0]!.loan);
  const h2 = createHoldings();
  const q2 = quoteBuy(h2, { kind: "house", name: "căn hộ", price, borrow: true }, NO, price * 0.3, 60000);
  buyAsset(h2, { kind: "house", name: "căn hộ", price, borrow: true }, q2, NO, 30);
  const r1 = holdingsYear(h2, NO, "stagnation", 0, 60000, 31, rng);
  ok(r1.foreclosed.length === 0 && h2.assets[0]!.missed === 1, "one missed year: warning only");
  const r2 = holdingsYear(h2, NO, "stagnation", 0, 60000, 32, rng);
  ok(r2.foreclosed.length === 1 && h2.assets.length === 0, "two missed years: foreclosed");
}

/* 6. Định giá theo pha kinh tế (trung bình nhiều lần) */
{
  const mean = (phase: "boom" | "crisis", kind: "house" | "gold" | "vehicle") => {
    const rng = createRng(7); let s = 0; const N = 400;
    for (let i = 0; i < N; i++) { const h = createHoldings(); addAsset(h, kind, "x", 1000, 30, "gift"); holdingsYear(h, NO, phase, 0, 1, 30, rng); s += h.assets[0] ? h.assets[0].value : 0; }
    return s / N;
  };
  ok(mean("boom", "house") > mean("crisis", "house"), "houses gain in booms, lose in crises");
  ok(mean("crisis", "gold") > 1000, "gold rises in crises");
  ok(mean("boom", "vehicle") < 900, "vehicles depreciate");
}

/* 7. Tiền gửi: lãi thực, ngân hàng chỉ đổ khi khủng hoảng */
{
  ok(depositRate(VN) > 0 && depositRate(NO) >= 0, "deposit rates non-negative");
  const h = createHoldings(); ok(deposit(h, 500, 30).cash === -500, "deposit takes cash");
  ok(withdraw(h, 200).cash === 200 && near(netWorth(h).deposit, 300, 1e-9), "withdraw returns cash");
  let failedOutsideCrisis = 0; const rng = createRng(3);
  for (let i = 0; i < 3000; i++) { const x = createHoldings(); deposit(x, 1000, 30); if (holdingsYear(x, CD, "stagnation", 0, 1, 30, rng).bank_failed > 0) failedOutsideCrisis++; }
  ok(failedOutsideCrisis === 0, "no bank failure outside crises");
}

/* 8. Vỡ nợ: siết thứ dễ bán trước, nhà sau cùng */
{
  const h = createHoldings();
  addAsset(h, "house", "nhà", 10000, 30, "gift"); addAsset(h, "vehicle", "xe", 1000, 30, "gift"); addAsset(h, "gold", "vàng", 500, 30, "gift");
  const r = seizeForDebt(h, 1100, 40);
  ok(r.seized.map((a) => a.kind).join(",") === "gold,vehicle", "seize order gold → vehicle, house kept: " + r.seized.map((a) => a.kind).join(","));
  ok(findAsset(h, { kind: "house" }) !== undefined, "house survives small seizure");
}

/* 9. Cho vay là trò chơi lặp lại */
{
  ok(repayChance("tit_for_tat", 0.5, 0.8, false, 0.2) > repayChance("always_defect", 0.5, 0.8, false, 0.2), "honest types repay more");
  ok(repayChance("grudger", 0.2, 0.5, true, 0.2) < repayChance("grudger", 0.2, 0.5, false, 0.2), "grudger remembers your betrayal");
  ok(repayChance("opportunist", 0, 0.9, false, 0.2) > repayChance("opportunist", 0, 0.1, false, 0.2), "rule of law helps repayment");
  ok(repayChance("tit_for_tat", 0, 0.5, false, 3) < repayChance("tit_for_tat", 0, 0.5, false, 0.2), "huge loans default more");
  const h = createHoldings(); const l = lend(h, "cast_friend", 800, 30, 2);
  ok(l.cash === -800 && owedToMe(h) === 800 && l.rec.due_age === 32, "lend records receivable");
}

/* 10. Bảo hiểm sức khỏe */
{
  const h = createHoldings(); ok(healthPayout(h, NO, 1000) === 0, "no policy, no payout");
  h.policies.push({ kind: "health", since: 30 }); ok(healthPayout(h, NO, 1000) > healthPayout(h, CD, 1000) * 0 && healthPayout(h, NO, 1000) <= 800, "policy pays part");
}

/* 11. Không có của cải → không rút số ngẫu nhiên (đời cũ giữ nguyên chuỗi) */
{
  const a = createRng(9), b = createRng(9); holdingsYear(createHoldings(), VN, "boom", 0, 1, 30, a);
  ok(a.next() === b.next(), "empty holdings consume no randomness");
}

/* 12. Ô gõ: việc tiền được làm sạch, sai là bỏ */
{
  const cast = new Set(["cast_friend"]);
  const base = { ke: "Bạn đi xem nhà.", ket_qua: "thanh" };
  const a = sanitizeAct({ ...base, viec_lon: [{ loai: "mua", tai_san: "house", ten: "căn hộ hai phòng", so: 9, vay: true }, { loai: "cho_vay", id: "cast_friend", so: 9, nam: 50 }] }, cast, 30)!;
  ok(a.viec_lon.length === 2 && isMoneyAction(a.viec_lon[0]!), "money actions kept");
  const buy = moneyActionEffect(a.viec_lon[0]!)!; ok(!!buy.buy && buy.buy.kind === "house" && buy.buy.borrow === true && buy.buy.price === 9, "mua → buy effect");
  const lendE = moneyActionEffect(a.viec_lon[1]!)!; ok(!!lendE.lend && lendE.lend.amount === 3 && lendE.lend.years === 10, "cho_vay clamped (≤3 years income, ≤10 years)");
  const bad = sanitizeAct({ ...base, viec_lon: [{ loai: "mua", tai_san: "spaceship", so: 1 }, { loai: "cho_vay", id: "cast_ghost", so: 1 }] }, cast, 30)!;
  ok(bad.viec_lon.length === 0, "invalid asset kind / unknown person dropped");
  const kid = sanitizeAct({ ...base, viec_lon: [{ loai: "muc_song", muc: "pho_truong" }] }, cast, 10)!;
  ok(kid.viec_lon.length === 0, "children cannot do money actions");
  const ls = sanitizeAct({ ...base, viec_lon: [{ loai: "muc_song", muc: "tan_tien" }] }, cast, 30)!;
  ok(moneyActionEffect(ls.viec_lon[0]!)!.lifestyle === "tan_tien", "muc_song → lifestyle");
}

if (fails) { console.log(`holdings-test: ${fails} failure(s)`); process.exit(1); }
console.log("PASS holdings-test");
