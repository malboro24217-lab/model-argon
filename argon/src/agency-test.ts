/** Task 2: làm sạch kết quả AI cho ô "Tôi muốn…". Run: node --experimental-strip-types src/agency-test.ts */
import assert from "node:assert/strict";
import { sanitizeAct, sanitizeStoryScene, bwCost, dueStories, ALLOWED_FLAGS, BIG_ACTIONS, MAX_STORY_STAGES, type Story } from "./engine/narrative/Agency.ts";
import { createRng } from "./engine/core/Rng.ts";

const cast = new Set(["cast_father", "cast_spouse"]);
const base = { ke: "Bạn mở quán.", ket_qua: "thanh" };

// bwCost: 3, 5, 8, 12, 17, 23
assert.deepEqual([1, 2, 3, 4, 5, 6].map(bwCost), [3, 5, 8, 12, 17, 23]);
assert.equal(bwCost(0), 0);

// required fields
assert.equal(sanitizeAct({ ket_qua: "thanh" }, cast, 30), null);
assert.equal(sanitizeAct({ ke: "x", ket_qua: "win" }, cast, 30), null);
for (const junk of ["str", 42, null, undefined, [], true]) assert.equal(sanitizeAct(junk, cast, 30), null);

// clamps
{ const a = sanitizeAct({ ...base, chi_so: { money: 1000, health: -999, income_mult: 9, happy: 50, bw: -100, agency: 1, know: Number.NaN } }, cast, 30)!;
  assert.equal(a.chi_so.money, 3); assert.equal(a.chi_so.health, -40); assert.equal(a.chi_so.income_mult, 2);
  assert.equal(a.chi_so.happy, 20); assert.equal(a.chi_so.bw, -25); assert.equal(a.chi_so.agency, 0.05); assert.equal(a.chi_so.know, undefined); }

// flags whitelist (forbidden prefixes never pass)
{ const a = sanitizeAct({ ...base, co: ["own_business", "origin_rich", "job_tech", "temper_bold", "spouse_warm", "path_uni", "lạ", "leader", "gang", "heir"] }, cast, 30)!;
  assert.deepEqual(a.co, ["own_business", "leader", "gang", "heir"]); }
assert.equal(Object.keys(ALLOWED_FLAGS).length, 15);

// people: ≤3, ≤1 new, unknown ids dropped
{ const a = sanitizeAct({ ...base, nguoi: [
  { id: "cast_father", tin: 0.9, nho: "x", phan_ung: "Bố im lặng." }, { id: "cast_ghost", tin: 0.1, nho: "y", phan_ung: "z" },
  { moi: { ten: "Hùng", vai: "doi_tac" }, tin: 0.2, nho: "góp vốn", phan_ung: "ok" }, { moi: { ten: "Lan", vai: "ban" }, tin: 0.1, nho: "a", phan_ung: "b" },
  { id: "cast_spouse", tin: -0.1, nho: "c", phan_ung: "d" }, { id: "cast_spouse", tin: -0.1, nho: "e", phan_ung: "f" } ] }, cast, 30)!;
  assert.ok(a.nguoi.length <= 3); assert.equal(a.nguoi.filter((p) => p.moi).length, 1);
  assert.ok(!a.nguoi.some((p) => p.id === "cast_ghost")); assert.equal(a.nguoi[0]!.tin, 0.5); }

// big actions
{ const a = sanitizeAct({ ...base, viec_lon: [{ loai: "giet" }, { loai: "vay", gia_tri: 99 }, { loai: "doi_nghe", gia_tri: "phi_hanh_gia" }, { loai: "ly_hon" }] }, cast, 30)!;
  assert.deepEqual(a.viec_lon, [{ loai: "vay", gia_tri: 3 }, { loai: "ly_hon" }]); }
{ const a = sanitizeAct({ ...base, viec_lon: [{ loai: "theo_duong", gia_tri: "monk" }, { loai: "theo_duong", gia_tri: "wizard" }] }, cast, 30)!;
  assert.deepEqual(a.viec_lon, [{ loai: "theo_duong", gia_tri: "monk" }]); }
assert.ok("theo_duong" in BIG_ACTIONS && "doi_nghe" in BIG_ACTIONS && Object.keys(BIG_ACTIONS).length === 15);

// story hen_nam clamp; secret clamp; habits
{ assert.equal(sanitizeAct({ ...base, chuyen: { ten: "Quán phở", tom_tat: "t", hen_nam: 0 } }, cast, 30)!.chuyen!.hen_nam, 1);
  assert.equal(sanitizeAct({ ...base, chuyen: { ten: "Quán phở", tom_tat: "t", hen_nam: 40 } }, cast, 30)!.chuyen!.hen_nam, 5);
  assert.equal(sanitizeAct({ ...base, chuyen: { tom_tat: "no title" } }, cast, 30)!.chuyen, null);
  const s = sanitizeAct({ ...base, bi_mat: { loai: "PAID_BRIBE", nang: 5, fuse: 99, ghi: "x" } }, cast, 30)!.bi_mat!;
  assert.equal(s.nang, 0.8); assert.equal(s.fuse, 12);
  assert.equal(sanitizeAct({ ...base, bi_mat: { loai: "MURDER", nang: 0.3 } }, cast, 30)!.bi_mat, null);
  assert.deepEqual(sanitizeAct({ ...base, thoi_quen: { smoke: -9, drink: 2, flying: 3 } }, cast, 30)!.thoi_quen, { smoke: -3, drink: 2 }); }

// child: no money, no trust
{ const a = sanitizeAct({ ...base, chi_so: { money: 0.5, happy: 3 }, nguoi: [{ id: "cast_father", tin: 0.3, nho: "x", phan_ung: "y" }] }, cast, 9)!;
  assert.equal(a.chi_so.money, undefined); assert.equal(a.chi_so.happy, 3); assert.equal(a.nguoi[0]!.tin, 0); }

// story scenes
{ const mk = (n: number) => ({ title: "Quán phở năm hai", text: "t", choices: Array.from({ length: n }, (_, i) => ({ label: "L" + i, hint: "h", log: "x", chi_so: { money: 9 }, tiep: { hen_nam: 2, tom_tat: "s" } })), def: 0 });
  assert.equal(sanitizeStoryScene(mk(1), cast, 2, 30), null);
  const six = sanitizeStoryScene(mk(6), cast, 2, 30)!; assert.equal(six.choices.length, 4); assert.equal(six.choices[0]!.chi_so.money, 3);
  assert.ok(six.choices.every((c) => c.tiep && c.ket === null));
  const last = sanitizeStoryScene(mk(3), cast, MAX_STORY_STAGES, 30)!;
  assert.ok(last.choices.every((c) => c.tiep === null && typeof c.ket === "string" && c.ket.length > 0)); }

// dueStories: ≤2, earliest first, closed skipped
{ const st = (id: string, nextAge: number, closed = false): Story => ({ id, title: id, summary: "", openedAge: 20, nextAge, stage: 1, log: [], people: [], originMark: "m", closed, failures: 0 });
  const due = dueStories([st("a", 33), st("b", 30), st("c", 31), st("d", 29, true), st("e", 32), st("f", 40)], 33);
  assert.deepEqual(due.map((s) => s.id), ["b", "c"]); }

// fuzz: never throws, always within caps
{ const r = createRng(99); const pick = <T,>(a: T[]): T => a[Math.floor(r.next() * a.length)]!;
  const junk = (): unknown => pick<unknown>([null, "x".repeat(10000), 1e9, -1e9, Number.NaN, [], {}, true, [1, 2, 3], { a: 1 }]);
  for (let i = 0; i < 2000; i++) {
    const raw: Record<string, unknown> = { ke: pick(["ok", "", "x".repeat(5000), junk()]), ket_qua: pick(["thanh", "nua_voi", "hong", "khong_lam_duoc", junk()]),
      chi_so: { money: junk(), health: r.next() * 1e4 - 5e3, happy: junk(), bw: r.next() * 400 - 200, income_mult: junk() },
      nguoi: pick([junk(), Array.from({ length: 8 }, () => ({ id: pick(["cast_father", "zz", junk()]), moi: pick([undefined, { ten: "x".repeat(500), vai: junk() }]), tin: junk(), nho: junk(), phan_ung: junk() }))]),
      co: pick([junk(), ["own_business", junk(), "job_x"]]), viec_lon: pick([junk(), [{ loai: pick(["vay", "doi_nghe", junk()]), gia_tri: junk() }]]),
      thoi_quen: junk(), bi_mat: pick([junk(), { loai: "PAID_BRIBE", nang: junk(), fuse: junk(), ghi: junk() }]), chuyen: pick([junk(), { ten: junk(), tom_tat: junk(), hen_nam: junk() }]) };
    const a = sanitizeAct(raw, cast, Math.floor(r.next() * 90));
    if (!a) continue;
    assert.ok(a.ke.length > 0 && a.ke.length <= 600);
    const c = a.chi_so;
    if (c.money !== undefined) assert.ok(Math.abs(c.money) <= 3);
    if (c.health !== undefined) assert.ok(c.health >= -40 && c.health <= 20);
    if (c.bw !== undefined) assert.ok(c.bw >= -25 && c.bw <= 15);
    if (c.income_mult !== undefined) assert.ok(c.income_mult >= 0.5 && c.income_mult <= 2);
    assert.ok(a.nguoi.length <= 3 && a.co.length <= 4 && a.viec_lon.length <= 2);
    assert.ok(a.co.every((f) => f in ALLOWED_FLAGS));
    if (a.chuyen) assert.ok(a.chuyen.ten.length <= 60 && a.chuyen.tom_tat.length <= 240 && a.chuyen.hen_nam >= 1 && a.chuyen.hen_nam <= 5);
  } }

// duplicate big actions are deduped; marriage names cannot carry effect separators
{ const a = sanitizeAct({ ...base, viec_lon: [{ loai: "vay", gia_tri: 3 }, { loai: "vay", gia_tri: 3 }] }, cast, 30)!; assert.equal(a.viec_lon.length, 1);
  const b = sanitizeAct({ ...base, viec_lon: [{ loai: "ket_hon", gia_tri: "A|borrow:999" }] }, cast, 30)!; assert.ok(!/[|:]/.test(String(b.viec_lon[0]!.gia_tri))); }
console.log("PASS agency-test");
