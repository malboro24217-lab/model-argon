// Chơi thật trên Chromium để soi canon event và Mùa bằng mắt (Task 21b).
// Run: node doi-nguoi/tests/canon-play.mjs [--weird 0|1|2] [--seeds a,b,c] [--out DIR] [--width 390|1366] [--dark]
//        [--page path/to/index.html] [--max-min 8]        (mặc định: --weird 1 --seeds 11,22 --width 390, out = $TMPDIR/canon-play)
//   --weird nhận cả danh sách "0,1,2"; mỗi (độ điên × hạt giống) là một đời.
//   --page mặc định là doi-nguoi/index.html đã ghép (bản build.py sinh ra).
// Mỗi đời: bấm như người chơi (Chào đời → Bắt đầu → 16×), chọn trọng tâm năm, thẻ, cửa canon theo một RNG có hạt giống
// (cùng tham số thì ra cùng đời), chụp ảnh ở các thời điểm canon/mùa, ghi <out>/<đời>/summary.json; cuối cùng dựng
// <out>/index.html (bảng ảnh của mọi đời trong <out>, kể cả của các lần chạy trước).
// Thoát mã 1 nếu có: lỗi console/page, chữ "undefined"/"NaN"/"null" lộ ra, id vai ASCII (season/spouse/ex_spouse/rival),
// tên biến cố hay nhãn cửa thiếu dấu, banner lệch với mùa đang chạy, cửa/mùa kỳ dị ở Độ điên 0, đời không chơi xong.
// Chạy được cả khi chưa có setWeird (Task 8b: khi đó gán L.weird) và khi canon-ui.js chưa được ghép (không có banner).
import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
import path from "path";
import os from "os";

/* ---------- tham số ---------- */
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const flag = k => argv.includes("--" + k);
const WEIRDS = String(opt("weird", "1")).split(",").map(Number);
const SEEDS = String(opt("seeds", "11,22")).split(",").map(s => Number(s) >>> 0);
const WIDTH = Number(opt("width", "390"));
const DARK = flag("dark");
const OUT = path.resolve(opt("out", path.join(os.tmpdir(), "canon-play")));
const PAGE = path.resolve(opt("page", new URL("../index.html", import.meta.url).pathname));
const MAX_MS = Number(opt("max-min", "8")) * 60000;
const PHONE = WIDTH <= 820;
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
if (WEIRDS.some(w => ![0, 1, 2].includes(w)) || SEEDS.some(s => !Number.isFinite(s))) { console.error("bad --weird/--seeds"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

/* ---------- kiểm chữ ---------- */
const BAD_TOKEN = /\b(undefined|NaN|null)\b/g;
const ROLE_ID = /\b(season|spouse|ex_spouse|rival)\b/g;
const VN_MARK = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
/** Chữ Việt ≥ 3 từ mà không có dấu nào: gần như chắc là chép nhầm chữ không dấu. */
const lacksDiacritics = s => { const t = String(s || "").trim(); return t.split(/\s+/).length >= 3 && !VN_MARK.test(t); };
const ctxOf = (t, i, n = 50) => t.slice(Math.max(0, i - n), i + n).replace(/\s+/g, " ");
const WEIRD_VN = { 0: "Đời thật", 1: "Phim", 2: "Điên" };
const BENIGN_CONSOLE = []; // thêm regex ở đây nếu có lỗi môi trường đã biết (vd. font không tải được khi mất mạng)

/* ---------- RNG có hạt giống cho cách chọn ---------- */
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- đọc trạng thái trong trang ---------- */
function snapshot(logFrom) {
  /* eslint-disable no-undef */
  const out = { ended: !!document.querySelector("section.end"), tomb: !!document.querySelector(".tomb-modal") };
  const L = typeof G !== "undefined" && G ? G.life : null; if (!L) return out;
  const def = id => (typeof seasonDef === "function" && seasonDef(id)) || null;
  const lw = L.lw || {}, se = lw.season;
  out.alive = L.alive; out.age = L.age; out.weird = L.weird; out.paused = !!G.paused; out.cause = L.cause || null;
  out.season = se ? { id: se.id, n: se.n, from: se.from, end: se.end, vn: (def(se.id) || {}).vn || null, weird: (def(se.id) || {}).weird || null, beat: (lw.counters && lw.counters.season_beat) || 0 } : null;
  out.seasons = ((lw.canon && lw.canon.seasons) || []).map(s => { const d = def(s.id); const l = d && s.landing ? d.landings.find(x => x.id === s.landing) : null;
    return { id: s.id, vn: d ? d.vn : null, weird: d ? d.weird || null : null, from: s.from, to: s.to, reason: s.reason, landing: s.landing, landingLine: l ? l.line || null : null }; });
  out.canonN = lw.canon ? lw.canon.n : 0;
  const p = L.pending;
  if (p) {
    out.pending = { id: p.id, key: p.key || (p.id + "@" + L.age), title: p.title, micro: !!p.micro, ai: !!p.ai,
      labels: p.choices.map(c => c.label), hints: p.choices.map(c => c.hint || ""),
      canon: p.canon ? { axis: p.canon.axis, seed: p.canon.seed, seasons: p.canon.seasons.slice() } : null,
      seasonCard: !!(se && typeof seasonCards === "function" && seasonCards(se.id).some(s => s.id === p.id)) };
    if (p.canon) out.pending.doors = p.canon.seasons.map(id => { const d = def(id); return { season: id, vn: d ? d.vn : null, weird: d ? d.weird || null : null }; });
    const m = p.npc && p.npc.id && lw.cast ? lw.cast.get(p.npc.id) : null;
    if (m) out.pending.who = { name: m.name, role: m.role, roles: m.roles, age: L.age + m.age_offset, alive: m.alive };
    out.player = L.name; out.pending.life = { savings: Math.round(L.savings), income: Math.round(L.income || 0), kids: (L.kids || []).filter(x => x.alive).length, spouse: L.spouse || null, job: L.job || null, country: L.c.n, migrated: !!L.migrated };
  }
  out.log = (L.log || []).slice(logFrom).map(e => ({ age: e.age, text: String(e.text), tone: e.tone || "" }));
  out.logLen = (L.log || []).length;
  out.bannerWired = typeof seasonBanner === "function";
  const b = document.getElementById("season-banner"); out.banner = b ? { hidden: b.hidden, text: b.innerText.replace(/\s+/g, " ").trim() } : null;
  out.hasSetWeird = typeof window.setWeird === "function";
  out.enabled = [...document.querySelectorAll("#dec [data-i]:not([disabled])")].map(x => +x.dataset.i);
  out.foci = [...document.querySelectorAll("#foci button:not([disabled])")].map(x => x.dataset.f);
  out.focus = L.focus || null;
  return out;
}
function pageText() {
  const app = document.getElementById("app") || document.body;
  const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT), all = []; let n;
  while ((n = w.nextNode())) { const p = n.parentElement; if (p && p.closest("script,style")) continue; all.push(n.nodeValue); }
  const tomb = document.querySelector(".tomb-modal");
  return { visible: document.body.innerText, all: all.join(" ") + (tomb ? " " + tomb.innerText : "") };
}

/* ---------- một đời ---------- */
async function playLife(browser, html, seed, weird) {
  const tag = `w${weird}-s${seed}-${WIDTH}${DARK ? "-dark" : ""}`, dir = path.join(OUT, tag);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: PHONE ? 844 : 900 }, deviceScaleFactor: PHONE ? 2 : 1, isMobile: PHONE, hasTouch: PHONE, colorScheme: DARK ? "dark" : "light" });
  const page = await ctx.newPage();
  const S = { seed, weird, weirdLabel: WEIRD_VN[weird], width: WIDTH, theme: DARK ? "dark" : "light", page: PAGE, tag,
    started: new Date().toISOString(), weirdMethod: null, bannerWired: null, hasSetWeird: null, name: null, country: null,
    deathAge: null, cause: null, decisions: 0, choices: [], focusChanges: [], canonEvents: [], seasons: [], weirdSeen: { doorsOffered: 0, doorsPicked: 0, seasons: [] },
    otherSelf: [], notes: [], tombSeasonsLine: null, shots: [], consoleErrors: [], pageErrors: [], warnings: [], textIssues: [], failures: [], domClicks: 0 };
  page.on("pageerror", e => S.pageErrors.push(String(e.message || e)));
  page.on("console", m => { if (m.type() === "error" && !BENIGN_CONSOLE.some(r => r.test(m.text()))) S.consoleErrors.push(m.text()); else if (m.type() === "warning") S.warnings.push(m.text().slice(0, 300)); });
  const rnd = mulberry32((seed ^ Math.imul(weird + 1, 0x9E3779B1)) >>> 0);
  const pickOf = a => a[Math.floor(rnd() * a.length)];
  let k = 0, logLen = 0, snap = null;
  const seenIssue = new Set();
  const flagText = (where, age) => page.evaluate(pageText).then(({ visible, all }) => {
    for (const [txt, scope] of [[visible, "hiện"], [all, "trong trang (kể cả tab ẩn)"]]) {
      for (const [re, kind] of [[BAD_TOKEN, "token"], [ROLE_ID, "role-id"]]) {
        for (const m of txt.matchAll(re)) { const c = ctxOf(txt, m.index); const key = [kind, m[0], where, age].join("|"); if (seenIssue.has(key)) continue; seenIssue.add(key);
          S.textIssues.push({ kind, token: m[0], scope, where, age, context: c }); }
      }
    }
  });
  const click = async sel => {
    try { await page.locator(sel).first().click({ timeout: 2500 }); return true; }
    catch { const ok = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel); if (ok) S.domClicks++; return ok; }
  };
  const refresh = async () => { snap = await page.evaluate(snapshot, logLen); if (snap.log) { onLog(snap.log); logLen = snap.logLen; } return snap; };
  const onLog = ents => { for (const e of ents) if (/Bản kia|dòng thời gian kia/i.test(e.text)) S.otherSelf.push({ age: e.age, text: e.text }); };
  const setPaused = async want => { const s = await page.evaluate(() => !!G.paused); if (s !== want) { if (!(await click("#pause"))) await page.evaluate(v => { G.paused = v; render(); }, want); } };
  const shot = async (kind, caption, o = {}) => {
    const age = snap && snap.age != null ? snap.age : 0;
    const file = `${String(++k).padStart(2, "0")}-${kind}-a${age}.png`, p = path.join(dir, file);
    try {
      if (o.wait) await page.waitForTimeout(o.wait);
      if (o.el) await page.waitForFunction(() => !document.querySelector("#toast.show"), null, { timeout: 4000 }).catch(() => {});
      if (o.el) {
        // Ảnh một phần tử: ẩn tạm thanh trên cùng / ô Tôi muốn / tab dính (sticky, fixed) để chúng không đè lên phần tử.
        await page.evaluate(() => { let st = document.getElementById("__cp"); if (!st) { st = document.createElement("style"); st.id = "__cp"; document.head.appendChild(st); }
          st.textContent = "#top,.dock,#want,#toast{visibility:hidden!important}"; });
        const loc = page.locator(o.el).first();
        try { await loc.scrollIntoViewIfNeeded({ timeout: 2000 }); await loc.screenshot({ path: p, timeout: 5000 }); }
        finally { await page.evaluate(() => { const st = document.getElementById("__cp"); if (st) st.textContent = ""; }); }
      }
      else { if (o.top !== false) await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: p, fullPage: !!o.full }); }
      S.shots.push({ file, kind, age, caption });
    } catch (e) { S.warnings.push(`shot ${kind} a${age}: ${String(e.message).split("\n")[0]}`); }
    await flagText(kind, age);
  };
  const checkBanner = async (where) => {
    await refresh(); const se = snap.season;
    if (!snap.bannerWired) return "chưa ghép canon-ui: không có banner";
    if (!se) { if (snap.banner && !snap.banner.hidden) S.failures.push(`${where}: banner hiện "${snap.banner.text}" khi không có mùa (a${snap.age})`); return "không có mùa"; }
    if (!snap.banner || snap.banner.hidden) { S.failures.push(`${where}: đang ở Mùa ${se.n} ${se.vn} mà banner ẩn (a${snap.age})`); return "banner ẩn"; }
    const t = snap.banner.text;
    if (!t.includes(se.vn) || !t.includes(`Mùa ${se.n}`)) S.failures.push(`${where}: banner "${t}" lệch với mùa đang chạy Mùa ${se.n}: ${se.vn} (a${snap.age})`);
    return t;
  };
  const t0 = Date.now();
  try {
    await page.setContent(html, { waitUntil: "load" }); await page.waitForTimeout(400);
    await click('#len [data-ms="1300"]');
    await page.evaluate(sd => { const orig = Math.random; Math.random = () => { Math.random = orig; return sd / 2 ** 32; }; }, seed);
    await click("#born"); await page.waitForTimeout(250);
    const born = await page.evaluate(w => { const L = G.life; let how;
      if (typeof window.setWeird === "function") { window.setWeird(L, w); how = "setWeird"; } else { L.weird = w; how = "L.weird"; }
      return { seed: L.seed, name: L.name, country: L.c.n, how, weird: L.weird }; }, weird);
    if (born.seed !== seed) S.failures.push(`hạt giống không vào được đời: muốn ${seed}, ra ${born.seed}`);
    if (born.weird !== weird) S.failures.push(`Độ điên không đặt được: muốn ${weird}, ra ${born.weird}`);
    Object.assign(S, { name: born.name, country: born.country, weirdMethod: born.how });
    await shot("birth", `Giấy khai sinh: ${born.name}, ${born.country}`);
    await click("#go"); await page.waitForTimeout(200);
    if (!(await click('#speed [data-s="16"]'))) await page.evaluate(() => { G.speed = 16; });
    await refresh(); S.bannerWired = snap.bannerWired; S.hasSetWeird = snap.hasSetWeird;
    let lastKey = null, prevSeasonKey = null, midShot = new Set(), finShot = new Set();
    for (;;) {
      if (Date.now() - t0 > MAX_MS) { S.failures.push(`hết giờ (${MAX_MS / 60000} phút) ở tuổi ${snap.age}`); break; }
      await page.waitForTimeout(30);
      await refresh();
      if (snap.ended) break;
      // mùa mở không qua cửa canon (custom season:<id> từ thẻ khác): vẫn chụp banner
      const sk = snap.season ? snap.season.id + "@" + snap.season.from : null;
      if (sk && sk !== prevSeasonKey) {
        prevSeasonKey = sk; const se = snap.season;
        if (se.weird) S.weirdSeen.seasons.push(se.id);
        if (weird === 0 && se.weird) S.failures.push(`mùa kỳ dị ${se.id} ở Độ điên 0 (a${snap.age})`);
        await setPaused(true); const bt = await checkBanner("mùa mở ngoài canon");
        await shot(se.weird ? "season-weird" : "season", `Vào Mùa ${se.n}: ${se.vn} (không qua cửa canon) · ${bt}`, { wait: 700 });
        await setPaused(false);
      } else if (sk !== prevSeasonKey) prevSeasonKey = sk;
      const p = snap.pending;
      if (!p || p.key === lastKey || !snap.enabled.length) continue;
      lastKey = p.key; S.decisions++;
      await flagText("decision", snap.age);
      // thỉnh thoảng đổi trọng tâm năm như người chơi (lúc đang có quyết định chờ, nên tất định)
      if (snap.foci.length > 1 && rnd() < 0.12) { const f = pickOf(snap.foci); if (f !== snap.focus && (await click(`#foci button[data-f="${f}"]`))) S.focusChanges.push([snap.age, f]); }
      if (p.canon) {
        await setPaused(true); await refresh();
        const doors = p.doors.map((d, i) => ({ label: p.labels[i], hint: p.hints[i], ...d }));
        const ev = { age: snap.age, who: p.who || null, life: p.life, title: p.title, axis: p.canon.axis, seed: p.canon.seed, doors, enabled: snap.enabled.slice(), picked: null, seasonEntered: null, banner: null, cutSeason: snap.season ? snap.season.id : null };
        if (p.who && snap.player && p.who.name.split(" ")[0] === snap.player.split(" ")[0]) S.notes.push(`biến cố a${snap.age}: người trong biến cố (${p.who.name}, ${p.who.role}, ${p.who.age} tuổi) trùng tên gọi với người chơi (${snap.player})`);
        for (const s of [p.title, ...p.labels]) if (lacksDiacritics(s)) S.failures.push(`canon thiếu dấu (a${snap.age}): "${s}"`);
        const wd = snap.enabled.filter(i => doors[i].weird);
        S.weirdSeen.doorsOffered += doors.filter(d => d.weird).length;
        if (weird === 0 && doors.some(d => d.weird)) S.failures.push(`cửa kỳ dị ở Độ điên 0 (a${snap.age}): ${doors.filter(d => d.weird).map(d => d.season).join(", ")}`);
        await shot(wd.length ? "canon-weird" : "canon", `Biến cố (${p.canon.axis}): ${p.title} · cửa: ${doors.map(d => d.label + " → " + (d.vn || d.season) + (d.weird ? ` [${d.weird}]` : "")).join(" | ")}`, { el: "#dec .decision" });
        const i = weird > 0 && wd.length && rnd() < 0.5 ? pickOf(wd) : pickOf(snap.enabled);
        ev.picked = i; if (doors[i].weird) S.weirdSeen.doorsPicked++;
        S.choices.push([snap.age, p.id, i]);
        await click(`#dec [data-i="${i}"]`); await page.waitForTimeout(80); await refresh();
        const se = snap.season;
        if (se) {
          ev.seasonEntered = { id: se.id, vn: se.vn, n: se.n, from: se.from, end: se.end, weird: se.weird };
          if (se.id !== doors[i].season) S.failures.push(`chọn cửa → ${doors[i].season} nhưng mùa đang chạy là ${se.id} (a${snap.age})`);
          if (se.weird) S.weirdSeen.seasons.push(se.id);
          if (weird === 0 && se.weird) S.failures.push(`mùa kỳ dị ${se.id} ở Độ điên 0 (a${snap.age})`);
          prevSeasonKey = se.id + "@" + se.from;
          ev.banner = await checkBanner("vào mùa");
          await shot(se.weird ? "season-weird" : "season", `Vào Mùa ${se.n}: ${se.vn}${se.weird ? ` [${se.weird}]` : ""}, ${se.from}–${se.end} tuổi · banner: ${ev.banner}`, { wait: 700 });
          await shot("season-log", `Nhật ký năm vào Mùa ${se.n}: ${se.vn}`, { el: "#log .yr" });
          if (S.otherSelf.some(o => o.age === snap.age)) await shot("other-self", `Bản kia của bạn: ${S.otherSelf.filter(o => o.age === snap.age).map(o => o.text).join(" / ")}`, { el: "#log" });
        } else S.failures.push(`chọn cửa ${i} của biến cố "${p.title}" mà không vào mùa nào (a${snap.age})`);
        S.canonEvents.push(ev);
        await setPaused(false);
        continue;
      }
      if (p.seasonCard && snap.season) {
        const se = snap.season, nBefore = snap.seasons.length;
        await setPaused(true);
        if (se.beat >= 4 && !finShot.has(se.id + se.from)) { finShot.add(se.id + se.from); await shot("finale", `Chung kết Mùa ${se.n}: ${se.vn} · ${p.title}`, { el: "#dec .decision" }); }
        else if (se.beat >= 1 && se.beat <= 3 && !midShot.has(se.id + se.from)) { midShot.add(se.id + se.from); await shot("season-card", `Thẻ giữa mùa (nhịp ${se.beat}) · Mùa ${se.n}: ${se.vn} · ${p.title}`, { el: "#dec .decision" }); }
        const i = pickOf(snap.enabled); S.choices.push([snap.age, p.id, i]);
        await click(`#dec [data-i="${i}"]`); await page.waitForTimeout(80); await refresh();
        if (snap.seasons.length > nBefore) { const r = snap.seasons[snap.seasons.length - 1];
          await shot("landing", `Ra Mùa: ${r.vn} (${r.reason}${r.landingLine ? `: ${r.landingLine}` : ""})`, { el: "#log .yr", wait: 300 }); }
        await setPaused(false);
        continue;
      }
      const nBefore = snap.seasons.length;
      const i = pickOf(snap.enabled); S.choices.push([snap.age, p.id, i]);
      await click(`#dec [data-i="${i}"]`);
      await refresh();
      if (snap.seasons.length > nBefore && !snap.season && snap.alive) { const r = snap.seasons[snap.seasons.length - 1]; await setPaused(true); await shot("landing", `Ra Mùa: ${r.vn} (${r.reason})`, { el: "#log .yr", wait: 300 }); await setPaused(false); }
    }
    // màn kết
    await page.waitForSelector("section.end", { timeout: 15000 }); await page.waitForTimeout(1200);
    await refresh();
    Object.assign(S, { deathAge: snap.age, cause: snap.cause, seasons: snap.seasons });
    await shot("end", `Màn kết: ${S.name}, ${snap.age} tuổi`, { wait: 200 });
    const hasList = await page.$(".seasons-end");
    if (hasList) await shot("end-seasons", `Các mùa của đời bạn: ${snap.seasons.map(s => `${s.vn} ${s.from}–${s.to} (${s.reason})`).join(" · ")}`, { el: ".seasons-end" });
    else if (snap.seasons.length) S.failures.push(`đời có ${snap.seasons.length} mùa mà màn kết không có "Các mùa của đời bạn"`);
    if (hasList) { const t = await page.textContent(".seasons-end"); if (!t.includes("Các mùa của đời bạn")) S.failures.push("thiếu tiêu đề \"Các mùa của đời bạn\""); }
    const otherEnd = await page.evaluate(() => { const t = document.querySelector("section.end").innerText; return t.split("\n").filter(l => /Bản kia|dòng thời gian kia/i.test(l)); });
    for (const l of otherEnd) S.otherSelf.push({ age: "end", text: l });
    if (otherEnd.length) await shot("other-self", `Bản kia của bạn (màn kết): ${otherEnd.join(" / ")}`, { full: true });
    await click("#tombBtn");
    S.tombSeasonsLine = await page.evaluate(() => { try { const L = G.life, d = tombstoneData(L, G.cf); if (!d.seasons || !d.seasons.length) return null;
      const c = document.createElement("canvas").getContext("2d"), base = { ...d, seasons: [] }, fits = P => _drawTomb(c, base, L.seed, P) <= TOMB.H - 200;
      const P = TOMB_PRESETS.find(fits) || TOMB_PRESETS[TOMB_PRESETS.length - 1]; return _drawTomb(c, d, L.seed, P) <= TOMB.H - 200; } catch (e) { return "?" + e.message; } });
    if (S.tombSeasonsLine === false) S.notes.push(`Tấm bia bỏ dòng "Các mùa" (${S.seasons.length} mùa) vì bố cục không còn chỗ`);
    try { await page.waitForSelector(".tomb-img", { timeout: 15000 }); await shot("tomb", "Tấm bia", { el: ".tomb-sheet", wait: 300 }); }
    catch { S.failures.push("Tấm bia không vẽ ra"); await shot("tomb", "Tấm bia (không vẽ ra)"); }
  } catch (e) {
    S.failures.push(`harness: ${String(e.message || e).split("\n")[0]}`);
    try { await shot("crash", "Lỗi harness"); } catch {}
  }
  S.durationMs = Date.now() - t0;
  for (const e of S.consoleErrors) S.failures.push(`console: ${e.slice(0, 200)}`);
  for (const e of S.pageErrors) S.failures.push(`pageerror: ${e.slice(0, 200)}`);
  for (const t of S.textIssues) S.failures.push(`chữ lộ "${t.token}" (${t.scope}, ${t.where}, a${t.age}): …${t.context}…`);
  fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify(S, null, 1));
  await ctx.close();
  return S;
}

/* ---------- bảng ảnh ---------- */
const H = s => String(s ?? "").replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
function contactSheet() {
  const lives = fs.readdirSync(OUT).filter(d => fs.existsSync(path.join(OUT, d, "summary.json")))
    .map(d => JSON.parse(fs.readFileSync(path.join(OUT, d, "summary.json"), "utf8")))
    .sort((a, b) => a.width - b.width || a.theme.localeCompare(b.theme) || a.weird - b.weird || a.seed - b.seed);
  const sec = S => `<section id="${H(S.tag)}"><h2>${H(S.name)}, ${H(S.country)} · chết ${H(S.deathAge)} tuổi <small>Độ điên ${S.weird} (${H(S.weirdLabel)}) · hạt giống ${S.seed} · ${S.width}px ${H(S.theme)} · banner ${S.bannerWired ? "có" : "chưa ghép"} · Độ điên đặt bằng ${H(S.weirdMethod)}</small></h2>
   <p class="meta">${S.canonEvents.length} biến cố · ${S.seasons.length} mùa · kỳ dị: ${S.weirdSeen.doorsOffered} cửa thấy, ${S.weirdSeen.doorsPicked} cửa chọn, mùa ${H(S.weirdSeen.seasons.join(", ") || "không")} · ${S.decisions} quyết định · ${Math.round(S.durationMs / 1000)} giây</p>
   <ol class="ev">${S.canonEvents.map(e => `<li>${e.age} tuổi · <b>${H(e.title)}</b> (${H(e.axis)}): ${e.doors.map((d, i) => `<span class="${i === e.picked ? "pk" : ""}${d.weird ? " wd" : ""}">${H(d.label)} → ${H(d.vn || d.season)}</span>`).join(" · ")}</li>`).join("")}</ol>
   <ol class="ss">${S.seasons.map(s => `<li>${H(s.vn)}${s.weird ? ` [${H(s.weird)}]` : ""} ${s.from}–${s.to} · ${H(s.reason)}${s.landingLine ? ` · <i>${H(s.landingLine)}</i>` : ""}</li>`).join("")}</ol>
   ${S.otherSelf.length ? `<p class="meta">Bản kia: ${S.otherSelf.map(o => H(o.text)).join(" / ")}</p>` : ""}
   ${(S.notes || []).length ? `<ul class="meta">${S.notes.map(f => `<li>${H(f)}</li>`).join("")}</ul>` : ""}
   ${S.failures.length ? `<ul class="fail">${S.failures.map(f => `<li>${H(f)}</li>`).join("")}</ul>` : `<p class="ok">Không lỗi.</p>`}
   <div class="grid">${S.shots.map(s => `<figure><a href="${H(S.tag)}/${H(s.file)}"><img loading="lazy" src="${H(S.tag)}/${H(s.file)}" alt=""></a><figcaption><b>${H(s.kind)}</b> · ${s.age} tuổi<br>${H(s.caption)}</figcaption></figure>`).join("")}</div></section>`;
  const page = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canon play</title>
<style>:root{--bg:#f4f5f2;--card:#fff;--ink:#222;--mut:#666;--bad:#b3261e;--ok:#2c7548;--pk:#2343b0}
@media (prefers-color-scheme:dark){:root{--bg:#121513;--card:#1c211e;--ink:#dde4de;--mut:#98a59d;--bad:#ff8a80;--ok:#72c994;--pk:#9cb0ff}}
body{background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,sans-serif;margin:0;padding:16px}h1{font-size:20px}h2{font-size:16px;margin:28px 0 4px}h2 small{display:block;color:var(--mut);font-weight:400;font-size:12px}
nav a{margin-right:10px;color:var(--pk)}.meta{color:var(--mut);margin:4px 0}.ev,.ss{margin:4px 0;padding-left:20px}.pk{font-weight:700;color:var(--pk)}.wd{font-style:italic}.wd::after{content:" ✦"}
.fail{color:var(--bad)}.ok{color:var(--ok)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:8px}
figure{margin:0;background:var(--card);border-radius:6px;padding:6px;overflow:hidden}figure img{width:100%;height:260px;object-fit:contain;object-position:top left;display:block;border-radius:4px}figcaption{font-size:12px;color:var(--mut);margin-top:4px;overflow-wrap:anywhere}</style></head>
<body><h1>Canon play · ${lives.length} đời</h1><nav>${lives.map(S => `<a href="#${H(S.tag)}">${H(S.tag)}${S.failures.length ? " ✗" : ""}</a>`).join("")}</nav>${lives.map(sec).join("")}</body></html>`;
  fs.writeFileSync(path.join(OUT, "index.html"), page);
}

/* ---------- chạy ---------- */
const html = "<!doctype html><html><head><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"></head><body>" + fs.readFileSync(PAGE, "utf8") + "</body></html>";
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
for (const w of WEIRDS) for (const s of SEEDS) {
  const S = await playLife(browser, html, s, w); results.push(S);
  console.log(`${S.tag}: ${S.name}, ${S.country}, chết ${S.deathAge} · ${S.canonEvents.length} biến cố [${S.canonEvents.map(e => `${e.age}:${e.doors[e.picked]?.season}`).join(", ")}] · mùa [${S.seasons.map(x => `${x.id} ${x.from}-${x.to} ${x.reason}`).join(", ")}] · kỳ dị ${S.weirdSeen.doorsOffered}/${S.weirdSeen.doorsPicked}/${S.weirdSeen.seasons.length} · ${S.shots.length} ảnh · ${S.failures.length} lỗi`);
  for (const f of S.failures) console.log("   ✗ " + f);
  for (const f of S.notes) console.log("   · " + f);
}
await browser.close();
contactSheet();
console.log(`bảng ảnh: ${path.join(OUT, "index.html")}`);
const bad = results.filter(r => r.failures.length).length;
console.log(bad ? `FAIL canon-play: ${bad}/${results.length} đời có lỗi` : `PASS canon-play (${results.length} đời)`);
process.exit(bad ? 1 : 0);
