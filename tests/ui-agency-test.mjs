// Task 7: ô "Tôi muốn…" trong trình duyệt (AI giả). Run: node tests/ui-agency-test.mjs
import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
import assert from "assert";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
const mock = `<script>
window.__calls = { act: 0, story: 0, other: 0 }; window.__fail = false; window.__delay = 0;
const fake = async (i, o) => { const t = "Lời cuối (AI)."; if (o && o.onText) o.onText({ text: t, delta: t }); return { text: t, truncated: false }; };
fake.json = async (prompt) => {
  if (window.__delay) await new Promise(r => setTimeout(r, window.__delay));
  if (/"cau_go":"[^"]/.test(prompt)) { window.__calls.act++; if (window.__fail) throw new Error("down");
    return { ke: "Bạn gom tiền thuê một góc vỉa hè đầu ngõ.", ket_qua: "nua_voi", chi_so: { money: -0.2, happy: 3 }, nguoi: [{ moi: { ten: "Hùng", vai: "doi_tac" }, tin: 0.2, nho: "góp vốn quán phở", phan_ung: "Vỗ vai: làm thì làm." }], co: ["own_business"], chuyen: { ten: "Quán phở đầu ngõ", tom_tat: "Vừa mở.", hen_nam: 1 }, chon: 0 }; }
  if (/chuyện đang dở/.test(prompt)) { window.__calls.story++; return { title: "Quán phở, năm sau", text: "Khách đông dần.", choices: [{ label: "Mở thêm giờ khuya", log: "Bạn bán đến nửa đêm.", ket: "Quán thành chỗ quen." }, { label: "Giữ như cũ", log: "Bạn giữ nhịp.", ket: "Quán vẫn thế." }], def: 0 }; }
  window.__calls.other++; return { title: "AI: Một chuyện", text: "...", concept: null, npc: null, choices: [{ label: "A", fx: { happy: 1 } }, { label: "B", fx: { happy: -1 } }], def: 0 };
};
fake.limits = async () => ({}); window.claude = { use: async n => n === "sample" ? fake : null };
</script>`;
const html = "<!doctype html><html><head><meta charset=utf-8>" + mock + "</head><body>" + fs.readFileSync("/home/claude/doi-nguoi/index.html", "utf8") + "</body></html>";
await page.setContent(html, { waitUntil: "load" }); await page.waitForTimeout(400);
await page.click("#born"); await page.waitForTimeout(300); await page.click("#go"); await page.waitForTimeout(200);
await page.click('#speed [data-s="16"]');
const age = async () => parseInt(await page.textContent("#age"), 10);
const clearPending = async () => { for (let k = 0; k < 20; k++) { const b = await page.$('#dec [data-i]:not([disabled])'); if (!b) return; await b.click(); await page.waitForTimeout(60); } };
// let the life grow to ~20
for (let k = 0; k < 300 && (await age()) < 20; k++) { await page.waitForTimeout(80); await clearPending(); }
await page.click("#pause"); await page.waitForTimeout(100); await clearPending();
assert(await page.isVisible("#want"), "want bar visible");

// 1. proactive act → card, clock stops while card open
await page.fill("#wantIn", "mở quán phở"); await page.press("#wantIn", "Enter");
await page.waitForSelector("#actcard", { timeout: 4000 });
const card = await page.textContent("#actcard");
assert(/Thành|Nửa vời|Hỏng|Không làm được/.test(card), "outcome label"); assert(/Hùng/.test(card), "reaction"); assert(/Quán phở đầu ngõ/.test(card), "story line");
await page.click("#pause"); const a0 = await age(); await page.waitForTimeout(1500); assert.strictEqual(await age(), a0, "clock stopped while card open");
await page.click("#actOk"); await page.waitForTimeout(200); assert(!(await page.$("#actcard")), "card closed");
await page.click("#pause"); await page.waitForTimeout(100); await clearPending();

// 2. double submit → one AI call
const before = await page.evaluate(() => window.__calls.act);
await page.evaluate(() => { window.__delay = 400; });
await page.fill("#wantIn", "đi học nấu ăn"); await page.click("#wantGo"); await page.click("#wantGo").catch(() => {});
await page.waitForSelector("#actcard", { timeout: 4000 }); await page.evaluate(() => { window.__delay = 0; });
assert.strictEqual(await page.evaluate(() => window.__calls.act) - before, 1, "one AI call for double submit");
await page.click("#actOk"); await page.waitForTimeout(100);

// 3. typed answer to a pending scene
await page.click("#pause"); let title = null;
for (let k = 0; k < 400 && !title; k++) { await page.waitForTimeout(60); if (await page.$('#dec [data-i]')) title = await page.textContent("#dec h3"); }
assert(title, "a scene appeared"); await page.click("#pause").catch(() => {});
await page.fill("#wantIn", "tôi làm theo cách của tôi"); await page.press("#wantIn", "Enter");
await page.waitForSelector("#actcard", { timeout: 4000 });
assert(/tôi làm theo cách của tôi/.test(await page.textContent("#log")), "log has the typed answer");
await page.click("#actOk");

// 4. AI failure → message, no card
await page.evaluate(() => { window.__fail = true; }); await page.click("#pause").catch(() => {}); await clearPending();
await page.fill("#wantIn", "bay lên mặt trăng"); await page.press("#wantIn", "Enter"); await page.waitForTimeout(800);
assert(/chưa trả lời/.test(await page.textContent("#wantMsg")), "error message"); assert(!(await page.$("#actcard")), "no card on error");
await page.evaluate(() => { window.__fail = false; });

// 5. play to the end (auto) → ending names the typed act; no console errors
await page.click("#auto"); if (await page.isVisible("#pause") && /Tiếp tục/.test(await page.textContent("#pause"))) await page.click("#pause");
for (let k = 0; k < 900 && (await page.$("#age")); k++) { await page.waitForTimeout(150); const ok = await page.$("#actOk"); if (ok) await ok.click(); }
await page.waitForTimeout(1500);
const end = await page.textContent("#app");
assert(/Tự quyết|tự quyết/.test(end), "ending mentions typed acts");
console.log({ calls: await page.evaluate(() => window.__calls) });
console.log("errors:", errors.length ? errors.join("\n") : "none");
assert.strictEqual(errors.length, 0, "no console errors");
await browser.close();
console.log("PASS ui-agency-test");
