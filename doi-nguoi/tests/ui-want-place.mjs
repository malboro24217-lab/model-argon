// canon-int-ui (R28): chỗ đặt ô tự nhập trên mọi loại thẻ, mọi khổ màn hình, hai giao diện sáng/tối và các trạng thái AI.
// Loại thẻ: biến cố (canon), chung kết mùa (finale), thẻ thường (ordinary), chuyện nhỏ (micro), thẻ "Bạn tự quyết" (act).
// Trạng thái AI: chưa có (off), sẵn sàng (ready), đang trả lời (busy), lỗi (error), bị từ chối quyền (denied).
// Mỗi tổ hợp kiểm, cả khi không có lẫn khi có thẻ "Mùa N khép lại" ngay trên thẻ quyết định:
//   ô nằm trong thẻ quyết định (thẻ "Bạn tự quyết": ô về chỗ cũ, vẫn bấm được); cuộn tới thì bấm trúng ô (không gì đè lên);
//   thẻ chung kết nằm trên thẻ quyết định và không chồng lên ô; không cuộn ngang.
// Run: node doi-nguoi/tests/ui-want-place.mjs [--out DIR] [--widths 390,821,1366] [--themes light,dark] [--page path/to/index.html]
// AI giả qua window.claude.use("sample") như ui-want-states.mjs. Đời lấy từ hạt giống cố định, tự chơi tới khi gặp đúng loại thẻ.
import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
import os from "os";
import path from "path";
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const OUT = path.resolve(opt("out", path.join(os.tmpdir(), "want-place"))); fs.mkdirSync(OUT, { recursive: true });
const PAGE = path.resolve(opt("page", new URL("../index.html", import.meta.url).pathname));
const WIDTHS = String(opt("widths", "390,821,1366")).split(",").map(Number);
const THEMES = String(opt("themes", "light,dark")).split(",");
const body = fs.readFileSync(PAGE, "utf8");
const mock = `<script>
window.__fail = false; window.__hang = false; window.__deny = false; window.__calls = 0;
const fake = async (i, o) => { const t = "Lời cuối (AI)."; if (o && o.onText) o.onText({ text: t, delta: t }); return { text: t, truncated: false }; };
fake.json = async (prompt) => {
  if (/"cau_go":"[^"]/.test(prompt)) { window.__calls++;
    if (window.__hang) await new Promise(() => {});
    if (window.__deny) throw Object.assign(new Error("denied"), { code: "not_granted" });
    if (window.__fail) throw new Error("down");
    return { ke: "Bạn nói thẳng điều mình nghĩ.", ket_qua: "thanh", chi_so: { happy: 2 }, nguoi: [], co: [], chon: 0 }; }
  throw Object.assign(new Error("no"), { code: "x" });
};
fake.limits = async () => ({}); window.claude = { use: async n => n === "sample" ? fake : null };
</script>`;
const KINDS = ["canon", "finale", "ordinary", "micro"];
const fails = [], errors = [], rows = [];
const fail = m => { fails.push(m); console.error("FAIL", m); };

/* ---- trong trang ---- */
function setup() {
  const isFinale = p => p.choices.some(c => c._fx && Argon.landingOf && Argon.landingOf(c._fx) !== null);
  const PRED = { canon: (L, p) => !!p.canon, finale: (L, p) => !p.canon && isFinale(p),
    ordinary: (L, p) => !p.canon && !p.micro && !p.ai && !isFinale(p) && !(L.lw && L.lw.season), micro: (L, p) => !!p.micro && !p.canon };
  window.__mount = kind => {
    for (let s = 1; s < 300; s++) {
      const L = createLife((s * 2654435761) >>> 0); let g = 0, hit = false;
      while (L.alive && g++ < 4000) { if (L.pending) { if (L.age >= 14 && PRED[kind](L, L.pending)) { hit = true; break; } resolve(L, autoChoice(L)); continue; }
        if (L.storyDue) { L.storyDue = null; continue; } stepYear(L); }
      if (!hit) continue;
      G.life = L; play(); G.paused = true; G.speed = 1; NAR.enabled = false; render();
      return { seed: L.seed, age: L.age, title: L.pending.title };
    }
    return null;
  };
  window.__landing = () => { const L = G.life; (L.uiNotes = L.uiNotes || []).push({ kind: "landing", age: L.age, n: 2, vn: "Vụ án gia tộc", line: "Bạn đọc luật nhiều tới mức đi thi luôn, và từ đó họ hàng gọi bạn bằng chức danh mỗi khi có chuyện.", color: "#8a3b4a" }); render(); };
  window.__check = () => {
    const w = document.getElementById("want"), art = document.querySelector("#dec .decision"), lc = document.getElementById("landing-card");
    const inp = document.getElementById("wantIn"), off = document.getElementById("wantOff");
    const tgt = !w.hidden && !inp.hidden && inp.offsetParent ? inp : !w.hidden && !off.hidden ? off : null;
    const r = { act: !!document.getElementById("actcard"), inCard: !!(art && art.contains(w)), wantHidden: w.hidden, target: tgt ? tgt.id : null,
      hscroll: document.documentElement.scrollWidth > innerWidth + 1, reach: null, cover: null, landing: !!(lc && !lc.hidden), lcAbove: null, lcOverlap: null };
    if (tgt) {
      tgt.scrollIntoView({ block: "center" }); const t = tgt.getBoundingClientRect();
      const y = tgt === off ? t.top + 14 : t.top + t.height / 2;
      for (const x of [t.left + 10, t.left + t.width / 2, t.right - 10]) { const h = document.elementFromPoint(x, y);
        if (!h || !w.contains(h)) { r.reach = false; r.cover = h ? (h.id ? "#" + h.id : h.tagName.toLowerCase() + "." + String(h.className).split(" ")[0]) + (h.closest("[id]") ? " in #" + h.closest("[id]").id : "") : "nothing"; break; } }
      if (r.reach === null) r.reach = true;
    }
    if (r.landing) { const a = lc.getBoundingClientRect(), f = w.getBoundingClientRect();
      r.lcOverlap = !w.hidden && !(a.bottom <= f.top || a.top >= f.bottom || a.right <= f.left || a.left >= f.right);
      if (art) r.lcAbove = a.bottom <= art.getBoundingClientRect().top + 0.5; }
    if (r.act) { const ok = document.getElementById("actOk"); ok.scrollIntoView({ block: "center" }); const b = ok.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); r.actOkReach = !!(h && ok.contains(h)); }
    return r;
  };
  // Ảnh: cuộn để thẻ chung kết (hoặc đầu thẻ quyết định) nằm ngay dưới thanh trên cùng.
  window.__frame = () => { const top = document.getElementById("top"), lc = document.getElementById("landing-card"), art = document.querySelector("#dec .decision");
    const el = lc && !lc.hidden ? lc : art; if (!el) return; const hh = top && getComputedStyle(top).position === "sticky" ? top.getBoundingClientRect().height : 0;
    scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - hh - 8)); };
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
async function open(width, theme, withAI) {
  const phone = width <= 820;
  const ctx = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, deviceScaleFactor: phone ? 2 : 1, isMobile: width < 500, hasTouch: width < 500, colorScheme: theme });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(`${width} ${theme}: ${e.message}`)); page.on("console", m => { if (m.type() === "error") errors.push(`${width} ${theme}: ${m.text()}`); });
  const f = path.join(OUT, `.page-${withAI ? "ai" : "noai"}.html`);
  fs.writeFileSync(f, "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" + (withAI ? mock : "") + "</head><body>" + body + "</body></html>");
  await page.goto("file://" + f, { waitUntil: "load" }); await page.waitForTimeout(300);
  await page.click("#born"); await page.waitForTimeout(100); await page.click("#go"); await page.waitForTimeout(150);
  await page.evaluate(setup);
  return { ctx, page };
}
async function record(page, tag, kind, state, info) {
  for (const withLanding of [false, true]) {
    if (withLanding) { await page.evaluate(() => window.__landing()); await page.waitForTimeout(400); }
    const r = await page.evaluate(() => window.__check());
    const id = `${tag} ${kind} ${state}${withLanding ? " +landing" : ""}`;
    const want = kind === "act" ? "home" : "card";
    if (kind !== "act" && !r.inCard) fail(`${id}: free-input box not in the decision card`);
    if (kind === "act" && r.inCard) fail(`${id}: free-input box inside the act card`);
    if (r.target && !r.reach) fail(`${id}: free-input box covered by ${r.cover}`);
    if (!r.target && !(kind === "act" && state === "off")) fail(`${id}: no free-input box or AI notice to reach`);
    if (r.hscroll) fail(`${id}: horizontal scroll`);
    if (withLanding && kind !== "act") { if (!r.landing) fail(`${id}: landing card not shown`); if (r.lcOverlap) fail(`${id}: landing card overlaps the free-input box`); if (r.lcAbove === false) fail(`${id}: landing card not above the decision`); }
    if (r.act && r.actOkReach === false) fail(`${id}: "Tiếp tục" on the act card is covered`);
    rows.push({ id, want, ...r, ...info });
    const file = `${tag}-${kind}-${state}${withLanding ? "-landing" : ""}.png`;
    await page.evaluate(() => window.__frame()); await page.screenshot({ path: path.join(OUT, file) });
    if (withLanding && width(tag) <= 820 && kind !== "act") {   // cả thẻ, kể cả ô tự nhập; tạm ẩn thanh trên cùng (dính) và thanh tab (cố định) để chúng không đè lên ảnh
      await page.addStyleTag({ content: "#top,.dock{visibility:hidden!important}" }).then(h => page.locator("#dec .decision").first().screenshot({ path: path.join(OUT, `${tag}-${kind}-${state}-card.png`) }).finally(() => h.evaluate(e => e.remove()))); }
  }
}
const width = tag => Number(tag.split("-")[0]);
const submit = async (page, text) => { await page.fill("#wantIn", text); await page.press("#wantIn", "Enter"); };

for (const w of WIDTHS) for (const theme of THEMES) {
  const tag = `${w}-${theme}`;
  // chưa có AI
  { const { ctx, page } = await open(w, theme, false);
    for (const kind of KINDS) { const info = await page.evaluate(k => window.__mount(k), kind); if (!info) { fail(`${tag}: no ${kind} card found`); continue; } await record(page, tag, kind, "off", info); }
    await ctx.close(); }
  // có AI: sẵn sàng, lỗi, đang trả lời, thẻ "Bạn tự quyết", rồi bị từ chối (cuối cùng: từ đó trang ở trạng thái chưa có AI)
  { const { ctx, page } = await open(w, theme, true);
    for (const kind of KINDS) {
      let info = await page.evaluate(k => window.__mount(k), kind); if (!info) { fail(`${tag}: no ${kind} card found`); continue; }
      await record(page, tag, kind, "ready", info);
      info = await page.evaluate(k => window.__mount(k), kind);
      await page.evaluate(() => { window.__fail = true; }); await submit(page, "tôi xin thêm một ngày để nghĩ");
      await page.waitForSelector("#wantRetry:not([hidden])", { timeout: 8000 }).catch(() => fail(`${tag} ${kind}: no error state`));
      await page.evaluate(() => { window.__fail = false; }); await record(page, tag, kind, "error", info);
      info = await page.evaluate(k => window.__mount(k), kind);
      await page.evaluate(() => { window.__hang = true; }); await submit(page, "tôi im lặng một lúc"); await page.waitForTimeout(250);
      if (!(await page.evaluate(() => G.acting))) fail(`${tag} ${kind}: no busy state`);
      await record(page, tag, kind, "busy", info);
      await page.evaluate(() => { window.__hang = false; G.acting = false; });
    }
    { const info = await page.evaluate(() => window.__mount("ordinary"));
      await submit(page, "tôi viết thư cho bạn cũ"); await page.waitForSelector("#actcard", { timeout: 8000 }).catch(() => fail(`${tag}: no act card`));
      await record(page, tag, "act", "ready", info); }
    for (const kind of KINDS) {
      const info = await page.evaluate(k => window.__mount(k), kind);
      if (kind === KINDS[0]) { await page.evaluate(() => { window.__deny = true; }); await submit(page, "tôi viết thư xin lỗi"); await page.waitForFunction(() => !G.acting, null, { timeout: 8000 }); await page.waitForTimeout(100);
        if ((await page.evaluate(() => NAR.status)) !== "off") fail(`${tag}: denied did not switch the page to off`); }
      await record(page, tag, kind, "denied", info);
    }
    await ctx.close(); }
  console.log(`${tag}: ${rows.filter(r => r.id.startsWith(tag + " ")).length} checks`);
}
await browser.close();
fs.writeFileSync(path.join(OUT, "checks.json"), JSON.stringify(rows, null, 1));
console.log("errors:", errors.length ? errors.join("\n") : "none");
console.log(fails.length ? `FAIL ui-want-place: ${fails.length}` : `PASS ui-want-place: ${rows.length} checks`, OUT);
if (fails.length || errors.length) process.exitCode = 1;
