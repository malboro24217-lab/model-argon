// Task 8b (sửa sau lượt chơi thử 21b): giao diện mùa trong Chromium.
// Tấm bia giữ dòng "Các mùa", thẻ chung kết hiện (kể cả chế độ đường hầm) mà không thành quyết định, banner điện thoại có nhãn nhánh kỳ dị và "năm 1/N".
// Chạy: node doi-nguoi/tests/ui-canon-test.mjs (cần playwright-core và Chromium như ui-test.mjs)
import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const html = "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><script>window.claude={use:async n=>null};</script></head><body>" + fs.readFileSync(new URL("../index.html", import.meta.url), "utf8") + "</body></html>";
const errors = [], fail = m => { console.error("FAIL", m); process.exitCode = 1; };
async function open(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, isMobile: width < 500, hasTouch: width < 500 });
  const page = await ctx.newPage(); page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setContent(html, { waitUntil: "load" }); await page.waitForTimeout(300);
  await page.click("#born"); await page.waitForTimeout(100); await page.click("#go"); await page.waitForTimeout(100);
  await page.evaluate(() => { G.paused = true; render(); });
  return { ctx, page };
}

// 1. Tấm bia: đời có mùa giữ dòng "Các mùa" (trước đây mất ở 5/7 đời).
{ const { ctx, page } = await open(1366);
  const r = await page.evaluate(async () => { const out = { lives: 0, withSeasons: 0, kept: 0, dropped: [] };
    for (let i = 0; i < 9; i++) { const L = createLife(7001 + i * 97, { auto: true }); let g = 0; while (L.alive && g++ < 130) stepYear(L);
      const d = tombstoneData(L, null); out.lives++; if (!d.seasons.length) continue; out.withSeasons++;
      const cv = await tombstoneCanvas(L, null); if (cv.tombPreset && !cv.tombPreset.noSeasons) out.kept++; else out.dropped.push(L.seed); }
    return out; });
  console.log("tombstone", r);
  if (r.withSeasons < 5) fail("too few lives with seasons: " + r.withSeasons);
  if (r.kept !== r.withSeasons) fail("Tấm bia dropped the seasons line for " + r.dropped.join(","));
  await ctx.close(); }

// 2. Thẻ chung kết: hiện, đọc được trong đường hầm, không phải quyết định.
{ const { ctx, page } = await open(390);
  const before = await page.evaluate(() => { const L = G.life; L.auto = true; let g = 0; while (L.alive && L.age < 30 && g++ < 60) stepYear(L); L.auto = false;
    while (L.pending) resolve(L, autoChoice(L)); if (L.lw.season) exitSeason(L, "landing");
    enterSeason(L, "lam_lai"); render(); return { c: L.choices.length, d: L.lw.decisions, line: seasonDef("lam_lai").landings[0].line }; });
  await page.evaluate(() => { const L = G.life; applyEffect(L, seasonDef("lam_lai").landings[0].effects); document.body.classList.add("tunnel"); render(); document.body.classList.add("tunnel"); });
  await page.waitForTimeout(500);
  const card = await page.evaluate(() => { const el = document.getElementById("landing-card"); if (!el) return null; const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { show: el.classList.contains("show"), text: el.textContent, op: +cs.opacity, top: r.top, bottom: r.bottom, h: innerHeight, pending: !!G.life.pending, c: G.life.choices.length, d: G.life.lw.decisions }; });
  console.log("landing card", card && { ...card, text: card.text.slice(0, 80) });
  if (!card || !card.show) fail("landing card not shown");
  else { if (!card.text.includes(before.line) || !card.text.includes("khép lại")) fail("landing card text");
    if (card.op < 0.99) fail("landing card dimmed: " + card.op); if (card.top < 0 || card.bottom > card.h) fail("landing card off screen");
    if (card.c !== before.c || card.pending) fail("landing card became a decision"); }
  await page.screenshot({ path: "/tmp/claude-0/ui-canon-landing.png" });
  await page.evaluate(() => render()); await page.waitForTimeout(100);
  const again = await page.evaluate(() => G.life.uiNotes.filter(n => !n.shown).length); if (again) fail("note shown more than once");
  await ctx.close(); }

// 3. Banner trên điện thoại: mùa kỳ dị có nhãn ngắn, năm vào mùa là "năm 1/N".
{ const { ctx, page } = await open(390);
  await page.evaluate(() => { const L = G.life; L.auto = true; let g = 0; while (L.alive && L.age < 30 && g++ < 60) stepYear(L); L.auto = false; while (L.pending) resolve(L, autoChoice(L)); enterSeason(L, "w_S19"); render(); });
  await page.waitForTimeout(300);
  const b = await page.evaluate(() => { const k = document.querySelector("#season-banner .sb-kind"); const y = document.querySelector("#season-banner .sb-yr"); const se = G.life.lw.season;
    return { kind: k && getComputedStyle(k).display !== "none" ? k.innerText.trim() : null, yr: y && y.textContent, want: "năm 1/" + (se.end - se.from + 1), over: document.documentElement.scrollWidth > innerWidth }; });
  console.log("phone banner", b);
  if (b.kind !== "viễn tưởng") fail("phone banner kind marker: " + b.kind);
  if (b.yr !== b.want) fail("banner year " + b.yr + " vs " + b.want);
  if (b.over) fail("horizontal scroll at 390px");
  await ctx.close(); }

// 4. "Xem lại" mở thì vẫn mở sau render() (review I-5); thẻ chung kết cũ không hiện, màn kết ẩn thẻ (review I-6).
{ const { ctx, page } = await open(390);
  const got = await page.evaluate(() => { const L = G.life; let g = 0;
    while (L.alive && g++ < 3000) { if (L.pending) { if (L.pending.causes && L.pending.causes.length && L.age > 15) break; resolve(L, autoChoice(L)); continue; } if (L.storyDue) { L.storyDue = null; continue; } stepYear(L); }
    G.paused = true; render(); return !!(L.pending && L.pending.causes); });
  if (!got) fail("no scene with a cause line");
  else { await page.click("details.because summary"); await page.waitForTimeout(100);
    await page.evaluate(() => { render(); render(); }); await page.waitForTimeout(100);
    const open = await page.evaluate(() => { const d = document.querySelector("details.because"); return !!(d && d.open); });
    if (!open) fail("Xem lại collapsed after render()"); else console.log("because stays open after render: true"); }
  const st = await page.evaluate(() => { const L = G.life; document.getElementById("landing-card")?.classList.remove("show");
    L.uiNotes = [{ kind: "landing", age: L.age - 5, n: 1, vn: "Mùa cũ", line: "Một chung kết đã cũ.", color: "#4a6ad8" }]; render();
    const el = document.getElementById("landing-card"); const stale = !!(el && el.classList.contains("show"));
    L.uiNotes.push({ kind: "landing", age: L.age, n: 2, vn: "Mùa mới", line: "Một chung kết vừa xong.", color: "#4a6ad8" }); render();
    const fresh = document.getElementById("landing-card").classList.contains("show");
    L.alive = false; G.paused = true; ending(); const afterEnd = document.getElementById("landing-card").classList.contains("show");
    return { stale, fresh, afterEnd }; });
  console.log("landing notes", st);
  if (st.stale) fail("stale landing note shown"); if (!st.fresh) fail("fresh landing note not shown"); if (st.afterEnd) fail("landing card visible on the end screen");
  await ctx.close(); }

console.log("errors:", errors.length ? errors.join("\n") : "none");
if (errors.length) process.exitCode = 1;
await browser.close();
