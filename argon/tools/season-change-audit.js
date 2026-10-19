/**
 * Kiểm toán "thay đổi tình thế" của 105 mùa (Task 20d, ruling R25 của Tùng).
 *
 * R25: mỗi Mùa có ít nhất một thay đổi tình thế có tác dụng thật, phù hợp với tiền đề và được sử dụng trong diễn biến.
 * Thay đổi hợp lệ: việc, nơi ở, tiền/nợ, một mối quan hệ, một nghĩa vụ, quyền tiếp cận (được hay mất một thứ),
 * hay một luật riêng của mùa. Cờ chỉ tính khi có tình huống hay luật đọc nó và dùng nó.
 *
 * Chạy (từ gốc repo):
 *   node --experimental-strip-types argon/tools/season-change-audit.js                 # in bảng tóm tắt
 *   node --experimental-strip-types argon/tools/season-change-audit.js --md <file>     # ghi bảng markdown (file có hai dấu mốc
 *                                                                                      # "bảng sinh bằng…" thì chỉ thay phần giữa chúng)
 *   node --experimental-strip-types argon/tools/season-change-audit.js --json          # in JSON
 *   ... --root <thư mục repo khác>   # kiểm một bản khác của repo (vd. bản trước khi sửa)
 * Thoát 1 khi còn mùa lớp (c) hay mùa của bản demo không ở lớp (a). Hàm dò thay đổi tình thế và mâu thuẫn nằm ở
 * argon/src/canon-r25.ts, dùng chung với canon-content-test (luôn lấy từ repo chứa công cụ này, kể cả khi có --root).
 *
 * Phần kiểm tĩnh (script làm):
 *  1. Thay đổi khai báo lúc vào mùa, chắc chắn xảy ra với mọi người vào mùa:
 *     - reset.cash; reset.effects (tiền, vay/trả nợ, việc, nơi ở, hôn nhân, thời gian/thân thể, cờ);
 *     - luật mùa: rules.income ≤ 0.8 hay ≥ 1.2 (cùng ngưỡng isDurable), rules.yearly có tiền/nợ/custom;
 *     - thẻ mở màn (nhịp 0) không có `when` mà MỌI lựa chọn đều mang một thay đổi tình thế.
 *     Không tính: dàn nhân vật mới (mùa nào cũng có), cờ thế giới rules.flags (không ai đọc), luật chỉ đổi chỉ số
 *     (happy/know/rel), hệ số thu nhập nhỏ (0.8 < k < 1.2), lựa chọn tùy người chơi, chung kết.
 *  2. Ai dùng thay đổi đó: dựng mọi thẻ của mùa dưới nhiều bối cảnh fuzz, với một FactContext bọc Proxy ghi lại
 *     mọi trường, cờ, bộ đếm mà `when` và chữ của thẻ đọc. Luật mùa thì host áp mỗi năm (canon.js enterSeason bước 4,
 *     seasonYearly); tiền, nợ, việc thì kinh tế host đọc mỗi năm.
 *  3. Cờ / bộ đếm do mùa đặt mà không thẻ nào ở nhịp sau đọc (cũng là luật của canon-content-test).
 *  4. Mâu thuẫn đã biết (lớp c): mỗi mục có một hàm dò, nên chạy trên bản cũ thì hiện "mâu thuẫn", bản đã sửa thì không.
 *
 * Phần phán đoán tay nằm ở CONTRADICTIONS (lời kể khẳng định một thay đổi mà trạng thái host nói khác) và NOTES.
 * Chất lượng "phù hợp tiền đề" và "được dùng có ý nghĩa" vượt quá phần dò được thì phải đọc và chơi thử.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const ROOT = resolve(opt("--root") ?? join(HERE, "../.."));
const E = await import(pathToFileURL(join(ROOT, "argon/src/engine/index.ts")).href);
const { randomCtx } = await import(pathToFileURL(join(ROOT, "argon/src/fuzz-ctx.ts")).href);
const { SEASONS, WEIRD, createRng } = E;
const ALL = [...SEASONS, ...WEIRD.map((b) => b.season)];
const R25 = await import(pathToFileURL(join(HERE, "../src/canon-r25.ts")).href);
const DEMO = new Set(R25.DEMO_SEASONS);

/* ------------------------------------------------------------------ nguồn: file và dòng khai báo của mỗi mùa */
const CANON = join(ROOT, "argon/src/engine/narrative/canon");
const SRC_FILES = [...readdirSync(join(CANON, "seasons")).map((f) => join(CANON, "seasons", f)), ...readdirSync(join(CANON, "weird")).map((f) => join(CANON, "weird", f))].filter((f) => f.endsWith(".ts"));
const SRC = new Map(SRC_FILES.map((f) => [f, readFileSync(f, "utf8")]));
function where(id) {
  for (const [f, s] of SRC) { const i = s.indexOf(`id: "${id}"`); if (i >= 0) return `${relative(join(ROOT, "argon/src/engine/narrative/canon"), f)}:${s.slice(0, i).split("\n").length}`; }
  return "?";
}
/** Chuỗi "key" có xuất hiện trong mã nguồn ngoài file khai báo mùa không (host, Codex, mùa khác đọc). */
const OTHER = [join(ROOT, "doi-nguoi"), join(ROOT, "argon/src/engine")];
let otherText = null;
function readElsewhere(key, ownFile) {
  if (!otherText) {
    otherText = new Map();
    const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) { if (!/node_modules|dist|publish|tests/.test(e.name)) walk(p); } else if (/\.(ts|js)$/.test(e.name)) otherText.set(p, readFileSync(p, "utf8")); } };
    for (const d of OTHER) walk(d);
  }
  for (const [f, s] of otherText) if (f !== ownFile && s.includes(`"${key}"`)) return relative(ROOT, f);
  return null;
}
const fileOf = (id) => { for (const [f, s] of SRC) if (s.includes(`id: "${id}"`)) return f; return null; };

/* ------------------------------------------------------------------ bối cảnh fuzz có ghi lại lượt đọc */
const rng = createRng(2025);
const CTX = [];
while (CTX.length < 40) { const c = randomCtx(rng); if (c.age >= 8) CTX.push(c); }
for (const c of CTX.slice(0, 10)) { CTX.push({ ...c, age: 18 + (c.age % 40), has_job: true, independent: true, debt: c.income, debt_ratio: 1 }); }
for (const c of CTX.slice(0, 6)) { CTX.push({ ...c, age: 30, has_job: false, independent: false, debt: 0, debt_ratio: 0, married: false, home_owner: false }); }

/** Bọc ctx: ghi "ctx:<trường>", "flag:<cờ>", "counter:<khóa>" mỗi khi thẻ đọc. */
function tracked(c, rec) {
  class TSet extends Set { has(x) { rec.add("flag:" + x); return super.has(x); } }
  const flags = new TSet(c.flags);
  const counters = new Proxy({ ...c.counters }, { get(t, k) { if (typeof k === "string") rec.add("counter:" + k); return t[k]; } });
  return new Proxy({ ...c, flags, counters }, { get(t, k) { if (typeof k === "string" && k !== "flags" && k !== "counters") rec.add("ctx:" + k); return t[k]; } });
}
function kit(def, rec, empty) {
  return {
    N: () => (empty ? "ai đó" : "Hòa"),
    scar: (k) => { rec.add("kit:scar_" + k); return empty ? "" : "món đồ cũ"; },
    npc: (k) => { rec.add("kit:npc"); return (def.reset.cast ?? []).find((m) => m.key === k)?.label ?? "người lạ"; },
    get noi() { rec.add("kit:noi"); return empty ? "" : "Phố Mới"; },
    gag: () => def.gag.lines[0] ?? "",
  };
}
/** Khóa (cờ / bộ đếm) do một effect đặt. */
function keysSet(e, out) {
  for (const f of e.flags ?? []) out.add("flag:" + f);
  for (const k of Object.keys(e.counters ?? {})) out.add("counter:" + k);
  if (e.gamble) { keysSet(e.gamble.win, out); keysSet(e.gamble.lose, out); }
  return out;
}
/** Dựng một thẻ; trả về view hay null (when sai / lỗi). */
function build(def, card, c, rec = new Set(), empty = false) {
  const t = tracked(c, rec);
  try { if (card.when && !card.when(t)) return null; return card.build(t, kit(def, rec, empty)); } catch { return null; }
}

/** Trường FactContext / kit cho biết một loại thay đổi được thẻ đọc lại. */
const READS_FOR = {
  "tiền": ["ctx:savings", "ctx:own_cash", "ctx:broke", "ctx:rich", "ctx:debt"],
  "nợ": ["ctx:debt", "ctx:debt_ratio", "ctx:loans", "kit:scar_no"],
  "việc": ["ctx:has_job", "ctx:job", "ctx:retired", "ctx:worker", "ctx:farmer", "ctx:income"],
  "nơi ở": ["kit:noi", "ctx:migrated", "ctx:country", "ctx:can_migrate"],
  "quan hệ": ["ctx:married", "ctx:widowed", "ctx:kids_alive", "ctx:cast"],
  "luật mùa": ["ctx:age", "ctx:health"],
  "quyền tiếp cận": ["ctx:owns", "ctx:home_owner", "ctx:asset_names"],
};
const HOST_USE = {
  "tiền": "kinh tế host đọc tiền mỗi năm",
  "nợ": "kinh tế host tính nợ mỗi năm (repay/vỡ nợ)",
  "việc": "host trả lương theo nghề mỗi năm",
  "nơi ở": "host đổi nơi ở / nước (k.noi, thu nhập)",
  "quan hệ": "host đổi dàn nhân vật (bạn đời, con)",
  "luật mùa": "host áp mỗi năm trong mùa",
  "quyền tiếp cận": "host giữ tài sản",
};

/* ------------------------------------------------------------------ phân tích một mùa */
function analyse(def) {
  const own = fileOf(def.id);
  // 1–3. reset, luật mùa, thẻ mở màn: dùng chung với bộ kiểm (argon/src/canon-r25.ts)
  const { changes, weak, conditional } = R25.entryChanges(def, CTX, (d, card, c) => build(d, card, c));
  for (const f of def.reset.effects?.flags ?? []) changes.push({ kind: "cờ", what: f, src: "reset.effects", flag: "flag:" + f });
  // 4. đọc: mọi thẻ, mọi bối cảnh, ba chế độ cờ (không cờ, đủ cờ của mùa, một nửa)
  const setBy = new Map(); // khóa → {card, beat}
  const reads = new Map(); // khóa đọc → Set(card id)
  const allKeys = new Set();
  def.beats.forEach((beat, bi) => beat.forEach((card) => CTX.slice(0, 12).forEach((c) => {
    const v = build(def, card, { ...c, season: def.id, season_beat: bi });
    // chung kết (nhịp 4) không tính: cờ của landing là cho đời sau mùa, trong mùa không còn thẻ nào để đọc.
    if (v && bi < 4) for (const ch of v.choices) for (const k of keysSet(ch.effects, new Set())) { allKeys.add(k); if (!setBy.has(k)) setBy.set(k, { card: card.id, beat: bi }); }
  })));
  for (const k of keysSet(def.reset.effects ?? {}, new Set())) { allKeys.add(k); if (!setBy.has(k)) setBy.set(k, { card: "reset", beat: -1 }); }
  const keyList = [...allKeys];
  const modes = (r) => [new Set(), new Set(keyList), new Set(keyList.filter(() => r.next() < 0.5)), new Set(keyList.filter(() => r.next() < 0.5))];
  const mr = createRng(77);
  def.beats.forEach((beat, bi) => beat.forEach((card) => CTX.forEach((c, i) => {
    for (const on of modes(mr)) for (const v of [1, 3, 6]) {
      const flags = new Set(c.flags), counters = { ...c.counters, season_next: c.age };
      for (const k of on) { if (k.startsWith("flag:")) flags.add(k.slice(5)); else counters[k.slice(8)] = v; }
      const rec = new Set();
      build(def, card, { ...c, flags, counters, season: def.id, season_beat: bi }, rec, i % 2 === 0);
      for (const r of rec) { if (!reads.has(r)) reads.set(r, new Set()); reads.get(r).add(card.id + "@" + bi); }
    }
  })));
  const readersOf = (key, afterBeat, exceptCard) => [...(reads.get(key) ?? [])].filter((x) => { const [id, b] = x.split("@"); return id !== exceptCard && +b >= afterBeat; }).map((x) => x.split("@")[0]);
  // 5. thay đổi nào được dùng
  for (const ch of changes) {
    if (ch.kind === "cờ") { const r = readersOf(ch.flag, 0, ""); ch.used = r.length ? `đọc bởi ${[...new Set(r)].slice(0, 3).join(", ")}` : (readElsewhere(ch.what, own) ? `đọc ở ${readElsewhere(ch.what, own)}` : ""); continue; }
    // luật mùa: hệ số lương thì xem ai đọc việc / thu nhập; luật năm có tiền thì xem ai đọc tiền / nợ; age_skip, longevity thì tuổi / sức khỏe.
    const fields = ch.kind !== "luật mùa" ? READS_FOR[ch.kind] ?? []
      : ch.src === "rules.income" ? READS_FOR["việc"] : ch.src === "rules.yearly" ? [...READS_FOR["tiền"], ...READS_FOR["nợ"]] : READS_FOR["luật mùa"];
    const cards = [...new Set(fields.flatMap((f) => readersOf(f, 0, "")))];
    ch.used = HOST_USE[ch.kind] + (cards.length ? `; thẻ đọc lại: ${cards.slice(0, 3).join(", ")}${cards.length > 3 ? "…" : ""}` : "");
  }
  // 6. cờ / bộ đếm do lựa chọn đặt mà không thẻ nào ở nhịp sau đọc
  const unread = [];
  for (const [k, s] of setBy) {
    const r = readersOf(k, Math.max(0, s.beat), s.card);
    if (r.length) continue;
    const name = k.replace(/^(flag|counter):/, "");
    if (readElsewhere(name, own)) continue;
    unread.push(`${name} (${s.card})`);
  }
  return { changes: changes.filter((c) => c.kind !== "cờ" || c.used), weak, conditional, unread };
}

/* ------------------------------------------------------------------ mâu thuẫn đã sửa (lớp c): hàm dò dùng chung với bộ kiểm */
const CONTRADICTIONS = R25.CONTRADICTIONS;
/** Bối cảnh để dựng chữ cho hàm dò (một người lớn bất kỳ trong bộ fuzz). */
const PROBE_BASE = CTX[12];

/** Ghi chú tay cho các mùa còn ở lớp b hay có điều kiện (đọc chữ, không dò được). */
const NOTES = {
  xu_nguoi: "migrate_now đầu mùa phụ thuộc Task 8b (di cư tất định, I2); cửa vào mùa đã gate can_migrate (R14).",
  "w_S06": "age_skip:3 là no-op cho tới Task 8b.",
  "w_S08": "age_skip:20 / longevity:20 là no-op cho tới Task 8b; repay:50 và tiền 0.3 có tác dụng ngay.",
  "w_X20": "Hôn nhân trên giấy chờ hủy: host không có trạng thái này; cố ý không đặt married để chung kết cưới thật vẫn đúng.",
  "w_X04": "Thừa kế 30 m² đất chỉ bằng lời kể (host không cho tài sản miễn phí).",
};

/** Thay đổi Task 20d thêm cho mùa chưa có thay đổi tình thế nào (không phải sửa mâu thuẫn): mùa của bản demo và mức sàn. */
const ADDED = {
  "w_S05": "luật năm −0.05: con vật đòi một suất ăn như người (s05_mo_cau_dau)",
  "w_S47": "luật năm −0.05: phí tài khoản lưu trữ ký ức (s47_mo_thu)",
  "w_X14": "luật năm −0.05: tiền giữ biệt thự và án phí (x14_mo_biet_thu)",
  "w_X33": "luật năm +0.05: tiền giữ danh hiệu (x33_mo_bi_ngo)",
  "w_X47": "luật năm +0.05: nhuận bút bức thư (x47_mo_khanh_thanh)",
  "w_S03": "luật năm −0.03: học phí theo lời dặn của thư (s03_mo_doc_trom)",
  "w_S04": "luật năm −0.03: phí của chiếc đồng hồ (s04_mo_thu)",
  "w_S12": "luật năm −0.03: vé năm qua cánh cửa (s12_mo_thu)",
  "w_S18": "luật năm +0.03: tiền phòng bằng đá biết hát (s18_mo_hop_dong)",
  "w_S22": "luật năm −0.03: bản kia tiêu bằng thẻ của bạn (s22_mo_guong)",
  "w_S28": "lương ×0.7: lương về thứ Sáu, kẹt trong thứ Tư (s28_mo_bon_muoi)",
  "w_S32": "luật năm −0.03: phí duy trì trạm tín hiệu (s32_mo_sang)",
  "w_S43": "luật năm −0.03: hai bữa cá tươi mỗi tuần (s43_mo_vong)",
  "w_S46": "luật năm −0.05: thêm một miệng ăn (s46_mo_bep)",
  "w_X02": "luật năm −0.03: phí giữ sổ (x02_mo_so)",
  "w_X17": "luật năm −0.03: quỹ khu phố gấp đôi (x17_mo_quy_tac)",
  "w_X20": "luật năm −0.03: lệ phí giữ hồ sơ hủy (x20_mo_chung_nha)",
  "w_X29": "luật năm −0.03: quỹ họp lớp (x29_mo_san_truong)",
  "w_X38": "luật năm −0.03: quà ngoại giao (x38_mo_quoc_thu)",
  "w_X43": "luật năm −0.03: lệ phí giấy tờ của con (x43_mo_dung_hinh)",
  "w_X50": "luật năm −0.03: đóng góp cho lễ tưởng niệm của chính mình (x50_mo_khe_cua)",
};

/* ------------------------------------------------------------------ chạy */
const rows = ALL.map((def) => {
  const a = analyse(def);
  const k = CONTRADICTIONS[def.id];
  const contra = k && k.open(R25.probeOf(def, a.changes, PROBE_BASE, (d, card, c) => build(d, card, c)));
  const cls = contra ? "c" : a.changes.length ? "a" : "b";
  return { id: def.id, vn: def.vn, src: where(def.id), demo: DEMO.has(def.id), cls, contra: k ? { ...k, open: !!contra } : null, ...a };
});
const count = (c) => rows.filter((r) => r.cls === c).length;
const CLS_VN = { a: "đạt", b: "chỉ bằng lời kể", c: "mâu thuẫn với trạng thái" };

if (argv.includes("--json")) { writeFileSync(1, JSON.stringify(rows, null, 1) + "\n"); process.exit(0); }

console.log(`season-change-audit (${relative(process.cwd(), ROOT) || "."}): ${rows.length} mùa — đạt ${count("a")}, chỉ bằng lời kể ${count("b")}, mâu thuẫn ${count("c")}`);
for (const r of rows.filter((x) => x.cls === "c")) console.log(`  (c) ${r.id}: ${r.contra.claim}`);
const demoMiss = rows.filter((r) => r.demo && r.cls !== "a");
if (demoMiss.length) console.log(`  mùa của bản demo chưa đạt: ${demoMiss.map((r) => r.id).join(", ")}`);
const unread = rows.reduce((n, r) => n + r.unread.length, 0);
console.log(`  cờ/bộ đếm không thẻ nào ở nhịp sau đọc: ${unread}`);

const md = opt("--md");
if (md) {
  const esc = (s) => String(s).replace(/\|/g, "\\|");
  const L = [];
  L.push(`| Mùa | Lớp | Thay đổi khai báo (nguồn) | Ai dùng | Ghi chú |`, `|---|---|---|---|---|`);
  for (const r of rows) {
    const ch = r.changes.length ? r.changes.map((x) => `${x.kind}: ${x.what} (${x.src})`).join("<br>") : "—";
    const used = r.changes.length ? [...new Set(r.changes.map((x) => x.used))].join("<br>") : "—";
    const note = [
      r.contra ? (r.contra.open ? `**Mâu thuẫn:** ${r.contra.claim}` : `Đã sửa (20d): ${r.contra.fix}`) : "",
      ADDED[r.id] ? `Thêm ở 20d: ${ADDED[r.id]}` : "",
      NOTES[r.id] ?? "",
      r.cls === "b" && r.conditional.length ? `Chỉ tùy lựa chọn: ${r.conditional.join("; ")}` : "",
      r.weak.length && r.cls !== "a" ? `Không tính: ${r.weak.join("; ")}` : "",
      r.unread.length ? `Cờ/bộ đếm không thẻ nào đọc lại: ${r.unread.length}` : "",
    ].filter(Boolean).join("<br>");
    L.push(`| ${r.demo ? "**" : ""}${r.id}${r.demo ? "**" : ""} ${esc(r.vn)}<br>\`${r.src}\` | ${r.cls} (${CLS_VN[r.cls]}) | ${esc(ch)} | ${esc(used)} | ${esc(note)} |`);
  }
  // File đã có hai dấu mốc thì chỉ thay phần bảng giữa chúng (phần chữ viết tay ở ngoài giữ nguyên).
  const A = "<!-- bảng sinh bằng argon/tools/season-change-audit.js: bắt đầu -->", B = "<!-- bảng sinh bằng argon/tools/season-change-audit.js: hết -->";
  let doc = "";
  try { doc = readFileSync(md, "utf8"); } catch { /* chưa có file */ }
  const table = L.join("\n") + "\n";
  const sum = `Đạt ${count("a")} · chỉ bằng lời kể ${count("b")} · mâu thuẫn ${count("c")} (tổng ${rows.length}).\n\n`;
  writeFileSync(md, doc.includes(A) && doc.includes(B) ? doc.slice(0, doc.indexOf(A) + A.length) + "\n" + sum + table + doc.slice(doc.indexOf(B)) : table);
  console.log(`  bảng: ${md}`);
}

// Lớp (c) còn mở, hay mùa của bản demo không ở lớp (a): thoát 1 (chạy với --root trên bản cũ thì thoát 1 là đúng).
if (count("c") || demoMiss.length) process.exit(1);
