// Task 21c: ô tự nhập trong thẻ quyết định và ba trạng thái AI (chưa có AI · đang trả lời · lỗi), ở 390px và 1366px.
// Run: node doi-nguoi/tests/ui-want-states.mjs [--out DIR] [--page path/to/index.html]   (ảnh lưu ở DIR, mặc định $TMPDIR/want-states)
// AI giả qua window.claude.use("sample"), như ui-agency-test.mjs. Không đổi logic agency: chỉ kiểm chỗ đặt, chữ và trạng thái.
import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const OUT = path.resolve(opt("out", path.join(os.tmpdir(), "want-states"))); fs.mkdirSync(OUT, { recursive: true });
const PAGE = path.resolve(opt("page", new URL("../index.html", import.meta.url).pathname));
const body = fs.readFileSync(PAGE, "utf8");
const mock = `<script>
window.__fail = false; window.__hang = false; window.__calls = 0;
const fake = async (i, o) => { const t = "Lời cuối (AI)."; if (o && o.onText) o.onText({ text: t, delta: t }); return { text: t, truncated: false }; };
fake.json = async (prompt) => {
  if (/"cau_go":"[^"]/.test(prompt)) { window.__calls++;
    if (window.__hang) await new Promise(() => {});
    if (window.__fail) throw new Error("down");
    return { ke: "Bạn nói thẳng điều mình nghĩ.", ket_qua: "thanh", chi_so: { happy: 2 }, nguoi: [], co: [], chon: 0 }; }
  // người kể chuyện tự viết cảnh: trả lỗi để game dùng kịch bản sẵn (không cần cho test này)
  throw Object.assign(new Error("no"), { code: "x" });
};
fake.limits = async () => ({}); window.claude = { use: async n => n === "sample" ? fake : null };
</script>`;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const errors = [];
async function open(width, withAI) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 844 : 900 }, deviceScaleFactor: width < 800 ? 2 : 1, colorScheme: width < 800 ? "light" : "dark" });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(`${width}: ${e.message}`)); page.on("console", m => { if (m.type() === "error") errors.push(`${width}: ${m.text()}`); });
  // trang mở từ file:// (không phải about:blank) để localStorage dùng được như trên trang thật
  const f = path.join(OUT, `.page-${withAI ? "ai" : "noai"}.html`);
  fs.writeFileSync(f, "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" + (withAI ? mock : "") + "</head><body>" + body + "</body></html>");
  await page.goto("file://" + f, { waitUntil: "load" });
  await page.waitForTimeout(300);
  // hạt giống cố định cho mỗi lần mở (như canon-play), để ảnh chụp lặp lại được; đời chết sớm thì sinh lại
  for (let tries = 0, seed = 7; tries < 8; tries++, seed += 101) {
  if (tries) { await page.evaluate(() => intro()); await page.waitForTimeout(100); }
  await page.evaluate(sd => { const orig = Math.random; Math.random = () => { Math.random = orig; return sd / 2 ** 32; }; }, seed * 7919);
  await page.click("#born"); await page.waitForTimeout(150); await page.click("#go"); await page.waitForTimeout(150);
  await page.evaluate(() => { G.speed = 16; NAR.enabled = false; });   // không chờ cảnh AI viết; ô tự nhập vẫn dùng NAR.sample
  // chờ một quyết định không phải chuyện nhỏ, từ 8 tuổi
  let ok = false;
  for (let k = 0; k < 600; k++) {
    const st = await page.evaluate(() => { const L = G.life; return { alive: L.alive && !!document.getElementById("dec"), age: L.age, p: !!L.pending, micro: !!(L.pending && L.pending.micro) }; });
    if (!st.alive) break;
    if (st.p && st.age >= 8 && !st.micro) { ok = true; break; }
    if (st.p) await page.evaluate(() => { const b = document.querySelector("#dec [data-i]:not([disabled])"); if (b) b.click(); });
    await page.waitForTimeout(40);
  }
  if (ok) break; }
  await page.evaluate(() => { G.paused = true; render(); });
  return { ctx, page };
}
const shotCard = async (page, file) => {
  const card = page.locator("#dec .decision").first(); await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: path.join(OUT, file) });
};
for (const width of [390, 1366]) {
  // 1. Chưa có AI: lời giải thích hiện rõ trong thẻ, không có ô mờ
  { const { ctx, page } = await open(width, false);
    const s = await page.evaluate(() => ({ inCard: !!document.querySelector("#dec .decision #want.incard"), off: !document.getElementById("wantOff").hidden,
      row: document.getElementById("wantIn").hidden && document.getElementById("wantGo").hidden, text: document.getElementById("want").innerText, ai: document.getElementById("aiBtn").textContent }));
    assert(s.inCard, `${width}: ô tự nhập nằm trong thẻ quyết định`); assert(s.off && s.row, `${width}: không AI thì hiện lời giải thích, ẩn ô nhập`);
    assert(/Bạn muốn làm theo cách khác\?/.test(s.text), `${width}: vẫn có câu hỏi`); assert(/cần người kể chuyện AI/.test(s.text), `${width}: giải thích vì sao`);
    assert(/AI chưa kết nối/.test(s.ai), `${width}: menu AI`);
    await page.click("#wantOff summary"); await page.waitForTimeout(100);
    assert(/claude\.ai/.test(await page.textContent("#wantOff")), `${width}: nói cách bật`);
    await shotCard(page, `w${width}-1-off.png`);
    await page.screenshot({ path: path.join(OUT, `w${width}-1-off-page.png`) });
    await ctx.close(); }
  // 2–3. Có AI: ô nhập trong thẻ; đang trả lời; lỗi rồi gửi lại
  { const { ctx, page } = await open(width, true);
    const lab = await page.textContent("#wantLead"), ph = await page.getAttribute("#wantIn", "placeholder");
    assert.strictEqual(lab, "Bạn muốn làm theo cách khác?"); assert.strictEqual(ph, "Nhập hành động hoặc lời bạn muốn nói…");
    assert(await page.$("#dec .decision #want.incard #wantIn"), `${width}: ô nhập trong thẻ`);
    await shotCard(page, `w${width}-0-ready.png`);
    if (width > 800) {
      // thẻ mới hiện dưới con trỏ đứng yên: phương án 1 không được tô như đang được khuyên chọn; tiêu điểm ở thẻ, không ở phương án 1
      const r = await page.evaluate(() => ({ focus: document.activeElement && document.activeElement.className, fresh: document.getElementById("dec").classList.contains("fresh") }));
      assert(!/\bch\b/.test(r.focus || ""), `${width}: tiêu điểm mặc định không nằm ở phương án 1`); assert(r.fresh, `${width}: thẻ mới có .fresh`);
      const box = await page.locator("#dec [data-i]").first().boundingBox();
      await page.evaluate(() => document.getElementById("dec").classList.add("fresh"));
      const bg = () => page.evaluate(() => getComputedStyle(document.querySelector("#dec [data-i]")).backgroundColor);
      await page.mouse.move(box.x + 30, box.y + 10); await page.waitForTimeout(50);
      // pointermove đầu tiên gỡ .fresh: rê chuột thật thì vẫn có phản hồi
      assert.notStrictEqual(await bg(), "rgba(0, 0, 0, 0)", `${width}: rê chuột thật vẫn tô`);
      await page.evaluate(() => document.getElementById("dec").classList.add("fresh"));
      assert.strictEqual(await bg(), "rgba(0, 0, 0, 0)", `${width}: con trỏ đứng yên trên thẻ mới thì không tô`);
      // khung "Xem chi tiết" nhớ trạng thái qua render()
      await page.click('details[data-fold="money"] > summary'); await page.evaluate(() => render());
      assert(await page.evaluate(() => document.querySelector('details[data-fold="money"]').open), `${width}: khung gập nhớ trạng thái mở`);
      assert(/"money":true/.test(await page.evaluate(() => localStorage.getItem("mlcd.fold") || "")), `${width}: lưu trong localStorage`);
    }
    // đang trả lời
    await page.evaluate(() => { window.__hang = true; });
    await page.fill("#wantIn", "tôi xin thêm một ngày để nghĩ"); await page.press("#wantIn", "Enter"); await page.waitForTimeout(250);
    const b = await page.evaluate(() => ({ dis: document.getElementById("wantIn").disabled, go: document.getElementById("wantGo").disabled, msg: document.getElementById("wantMsg").innerText,
      choices: [...document.querySelectorAll("#dec [data-i]")].every(x => x.disabled), calls: window.__calls }));
    assert(b.dis && b.go && b.choices, `${width}: đang trả lời thì khóa ô nhập, nút và các lựa chọn`); assert(/đang viết/.test(b.msg), `${width}: báo đang viết`);
    await page.press("#wantIn", "Enter").catch(() => {}); await page.click("#wantGo", { timeout: 300 }).catch(() => {});
    assert.strictEqual(await page.evaluate(() => window.__calls), b.calls, `${width}: không gửi hai lần`);
    await shotCard(page, `w${width}-2-busy.png`);
    await ctx.close(); }
  { const { ctx, page } = await open(width, true);
    await page.evaluate(() => { window.__fail = true; });
    await page.fill("#wantIn", "tôi xin thêm một ngày để nghĩ"); await page.press("#wantIn", "Enter");
    await page.waitForSelector("#wantRetry:not([hidden])", { timeout: 5000 });
    const e = await page.evaluate(() => ({ msg: document.getElementById("wantMsg").innerText, val: document.getElementById("wantIn").value, dis: document.getElementById("wantIn").disabled }));
    assert(/chưa trả lời/.test(e.msg), `${width}: báo lỗi đọc được`); assert.strictEqual(e.val, "tôi xin thêm một ngày để nghĩ", `${width}: giữ chữ đã gõ`); assert(!e.dis, `${width}: gõ lại được`);
    // render lại (vd. người kể chuyện xong việc) không làm mất chữ đã gõ
    await page.evaluate(() => render()); assert.strictEqual(await page.inputValue("#wantIn"), "tôi xin thêm một ngày để nghĩ");
    await shotCard(page, `w${width}-3-error.png`);
    await page.evaluate(() => { window.__fail = false; }); await page.click("#wantRetry");
    await page.waitForSelector("#actcard", { timeout: 5000 }).catch(async e => { throw new Error(`${width}: không ra thẻ sau khi gửi lại: ${await page.textContent("#wantMsg")} · ${await page.evaluate(() => window.__calls)}`); });
    assert(/tôi xin thêm một ngày để nghĩ/.test(await page.textContent("#actcard")), `${width}: gửi lại thành công`);
    await ctx.close(); }
}
await browser.close();
console.log("errors:", errors.length ? errors.join("\n") : "none");
assert.strictEqual(errors.length, 0, "no console errors");
console.log("PASS ui-want-states", OUT);
