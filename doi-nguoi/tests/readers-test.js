// Mọi storylet đọc ý kiến/ký ức của một NPC (prov.opinion(...) trong causes, op(c, …) / c.opinion trong prerequisites/specificity/build)
// phải có mặt trong MEM_READERS của causality.js, để "X sẽ nhớ điều này" không hứa suông và không bỏ sót.
// Chạy: node doi-nguoi/tests/readers-test.js
const fs = require("fs"), path = require("path");
const dir = process.argv[2] || path.join(__dirname, "../../argon/src/engine/narrative");
const src0 = fs.readFileSync(path.join(__dirname, "../phase1.js"), "utf8");
const MEM_READERS = (0, eval)("(" + src0.slice(src0.indexOf("const MEM_READERS = ") + "const MEM_READERS = ".length, src0.indexOf("};", src0.indexOf("const MEM_READERS = ")) + 1) + ")");
const listed = new Set(Object.values(MEM_READERS).flat().map(r => r[0]));
const files = ["storylets.ts", "micro.ts", "branches.ts", "branches2.ts", "branches3.ts", "vignettes.ts"].map(f => path.join(dir, f)).filter(fs.existsSync)
  .concat(fs.existsSync(path.join(dir, "paths")) ? fs.readdirSync(path.join(dir, "paths")).filter(f => f.endsWith(".ts")).map(f => path.join(dir, "paths", f)) : []);
const readers = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  // cắt theo từng storylet: "id: \"x\"" (storylets.ts) hoặc M("x", …) (micro.ts)
  const re = /(?:id:\s*"([a-z0-9_]+)"|\bM\("([a-z0-9_]+)")/g; const marks = []; let m;
  while ((m = re.exec(src))) marks.push({ id: m[1] || m[2], at: m.index });
  marks.forEach((x, i) => { const body = src.slice(x.at, i + 1 < marks.length ? marks[i + 1].at : src.length);
    if (/prov\.opinion\(|\bop\(c,|c\.opinion\b|ctx\.opinion\b/.test(body)) readers.add(x.id); });
}
const missing = [...readers].filter(id => !listed.has(id)), stale = [...listed].filter(id => !readers.has(id));
console.log({ readers: readers.size, listed: listed.size, missing, stale });
if (missing.length) { console.log("FAIL readers-test: thêm các id thiếu vào MEM_READERS"); process.exit(1); }
console.log("PASS readers-test");
