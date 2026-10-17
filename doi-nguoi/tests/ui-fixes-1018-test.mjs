// Review 18/10/2026 — UI fixes (each case failed before its fix). Run: node tests/ui-fixes-1018-test.mjs
// Paths: set PW_CORE (playwright-core index.mjs) and PW_CHROME (chrome binary) if your machine differs.
import fs from "fs";
import assert from "assert";
const PW_CORE = process.env.PW_CORE || "/opt/npm-tools/node_modules/playwright-core/index.mjs";
const PW_CHROME = process.env.PW_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const { chromium } = await import(PW_CORE);
const browser = await chromium.launch({ executablePath: PW_CHROME });
const mock = `<script>
const fake = async (i, o) => { const t = "Lời cuối (AI)."; if (o && o.onText) o.onText({ text: t, delta: t }); return { text: t, truncated: false }; };
fake.json = async (prompt) => {
  if (/chuyện đang dở/.test(prompt)) return { title: "Quán phở, năm sau", text: "Khách đông dần.", choices: [{ label: "Mở thêm giờ khuya", log: "Bạn bán đến nửa đêm.", ket: "Quán thành chỗ quen." }, { label: "Giữ như cũ", log: "Bạn giữ nhịp.", ket: "Quán vẫn thế." }], def: 0 };
  return { title: "AI: Một chuyện", text: "...", concept: null, npc: null, choices: [{ label: "A", fx: { happy: 1 } }, { label: "B", fx: { happy: -1 } }], def: 0 };
};
fake.limits = async () => ({}); window.claude = { use: async n => n === "sample" ? fake : null };
</script>`;
const html = "<!doctype html><html><head><meta charset=utf-8>" + mock + "</head><body>" + fs.readFileSync(new URL("../index.html", import.meta.url), "utf8") + "</body></html>";
const errors = [];
const ONLY = process.env.CASES ? process.env.CASES.split(",") : null; const want = id => !ONLY || ONLY.includes(id);

async function freshLife(toAge, tries = 8) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setContent(html, { waitUntil: "load" }); await page.waitForTimeout(300);
  await page.click("#born"); await page.waitForTimeout(200); await page.click("#go"); await page.waitForTimeout(150);
  await page.click('#speed [data-s="16"]');
  await page.evaluate(() => { G.autoDecide = true; G.life.auto = true; NAR.enabled = false; });
  for (let k = 0; k < 400 && (await page.evaluate(() => G.life.alive && G.life.age)) < toAge; k++) await page.waitForTimeout(60);
  if (!(await page.evaluate(() => G.life.alive)) && tries > 0) { await page.close(); return freshLife(toAge, tries - 1); } // đời ngẫu nhiên mất sớm: sinh lại
  await page.evaluate(() => { G.autoDecide = false; G.life.auto = false; G.paused = true; while (G.life.pending) resolve(G.life, G.life.pending.def); G.life.storyDue = null; render(); });
  return page;
}
const scene = (id, choices) => `({ id: "${id}", key: "${id}@" + G.life.age, title: "Thử", text: "Một cảnh thử.", def: 0, npc: null, choices: ${choices} })`;

// U2: a click that kills the character goes to the ending screen
if (want("U2")) { const page = await freshLife(20);
  assert(await page.evaluate(() => G.life.alive), "setup alive");
  await page.evaluate(s => { G.life.pending = eval(s); render(); }, scene("u2", `[{ label: "Chết", fx: L => die(L, "thử nghiệm") }, { label: "Sống", fx: () => {} }]`));
  await page.click('#dec [data-i="0"]'); await page.waitForTimeout(2500);
  assert(await page.$("section.end"), "ending screen shown after a deadly click");
  await page.close(); }

// U3: the ending timer of a dead life never fires on the next life
if (want("U3")) { const page = await freshLife(20);
  await page.evaluate(() => { window.__dq = deathQ; deathQ = () => 1; G.paused = false; render(); });
  for (let k = 0; k < 100 && (await page.evaluate(() => G.life.alive)); k++) await page.waitForTimeout(30);
  await page.evaluate(() => { deathQ = window.__dq; });
  await page.click("#quit"); await page.click("#born"); await page.click("#go");
  const n0 = await page.evaluate(() => store.get().length);
  await page.waitForTimeout(2500);
  assert(!(await page.$("section.end")), "new life is not sent to the ending screen");
  assert(await page.evaluate(() => G.life.alive), "new life still alive");
  assert.strictEqual(await page.evaluate(() => store.get().length), n0, "nothing saved for the living life");
  await page.close(); }

// U4: the low-bandwidth countdown stops while paused
if (want("U4")) { const page = await freshLife(25);
  await page.evaluate(s => { const c = G.life.ar.state.capitals.cognitiveBandwidth; c.value = 10; G.paused = true; G.life.pending = eval(s); render(); }, scene("u4", `[{ label: "A", fx: () => {} }, { label: "B", fx: () => {} }]`));
  assert(await page.$("#timerbar"), "setup: countdown visible");
  await page.waitForTimeout(10000);
  assert(await page.evaluate(() => !!G.life.pending && G.life.pending.id === "u4"), "scene still waiting while paused");
  assert(!(await page.evaluate(() => G.life.log.some(e => /không kịp nghĩ/.test(e.text)))), "no auto-pick while paused");
  await page.close(); }

// U5: a story that falls due while paused still loads, and the want box is usable
if (want("U5")) { const page = await freshLife(25);
  await page.evaluate(() => { const L = G.life; NAR.enabled = true; L.stories = [{ id: "stx", title: "Quán phở đầu ngõ", summary: "Vừa mở.", openedAge: L.age - 1, nextAge: L.age, stage: 0, log: [], people: [], originMark: null, closed: false, failures: 0 }];
    G.paused = true; while (L.pending) resolve(L, L.pending.def); L.storyQueue = []; L.storyDue = null; storyCheck(L); render(); });
  assert(await page.evaluate(() => (G.life.storyDue && G.life.storyDue.id === "stx") || (G.life.pending && G.life.pending.story === "stx")), "setup: story due while paused");
  let ok = false; for (let k = 0; k < 60 && !ok; k++) { await page.waitForTimeout(100); ok = await page.evaluate(() => !!G.life.pending && G.life.pending.story === "stx" && !document.getElementById("wantIn").disabled); }
  assert(ok, "story scene loaded and want box enabled while paused");
  assert(await page.evaluate(() => G.paused), "still paused");
  await page.close(); }

console.log("errors:", errors.length ? errors.join("\n") : "none");
assert.strictEqual(errors.length, 0, "no console errors");
await browser.close();
console.log("PASS ui-fixes-1018");
