/**
 * Ô "Tôi muốn…": AI toàn quyền viết kết quả, engine chỉ làm sạch và kẹp trần (spec 2026-10-17-tu-quyet §5).
 * Không phụ thuộc giao diện; mọi hàm thuần, kiểm thử bằng src/agency-test.ts.
 */
import type { SecretTag } from "./types.ts";
import { PATHS } from "./paths/registry.ts";

export type ActOutcome = "thanh" | "nua_voi" | "hong" | "khong_lam_duoc";
export type BigActionKind = "doi_nghe" | "mat_viec" | "vay" | "tra_no" | "co_cau_no" | "di_nuoc_ngoai" | "ve_que" | "chuyen_thanh_pho" | "di_hoc" | "ket_hon" | "ly_hon" | "co_con" | "nghi_huu" | "xin_loi" | "theo_duong";
export interface ActStats { money?: number; health?: number; happy?: number; know?: number; rel?: number; bw?: number; income_mult?: number; agency?: number }
export interface ActPerson { id?: string; moi?: { ten: string; vai: string }; tin: number; nho: string; phan_ung: string }
export interface BigAction { loai: BigActionKind; gia_tri?: string | number }
export interface ActSecret { loai: SecretTag; nang: number; fuse: number; ghi: string }
export interface ActEffects { chi_so: ActStats; nguoi: ActPerson[]; co: string[]; bo_co: string[]; viec_lon: BigAction[]; thoi_quen: Record<string, number>; bi_mat: ActSecret | null }
export interface ActResult extends ActEffects { ke: string; ket_qua: ActOutcome; chuyen: { ten: string; tom_tat: string; hen_nam: number } | null }
export interface StoryChoice extends ActEffects { label: string; hint: string; log: string; tiep: { hen_nam: number; tom_tat: string } | null; ket: string | null }
export interface StoryScene { title: string; text: string; choices: StoryChoice[]; def: number }
export interface Story { id: string; title: string; summary: string; openedAge: number; nextAge: number; stage: number; log: Array<{ age: number; text: string; choice: string }>; people: string[]; originMark: string; closed: boolean; failures: number }

export const MAX_STORY_STAGES = 8;
export const MAX_STORIES_PER_YEAR = 2;

/** Cờ AI được bật — mỗi cờ đều có tình huống trong kho đọc tới (narrative-test kiểm). */
export const ALLOWED_FLAGS: Record<string, string> = {
  own_business: "đang tự làm chủ một cơ sở kinh doanh", left_home: "đã rời quê", path_city: "đã lên thành phố sống", leader: "được mọi người xem là người đứng ra",
  affair: "đang có quan hệ ngoài hôn nhân", carer: "đang chăm người thân", athlete: "đang chơi thể thao nghiêm túc", tinker: "mê sửa chữa, chế tạo",
  heir: "đã nhận tiếp quản cơ nghiệp gia đình", orchard: "vừa chuyển sang trồng cây ăn trái", land_sold: "đã bán đất", startup: "đang làm công ty khởi nghiệp",
  credit_book: "đang bán chịu, có sổ nợ", brawler: "nổi tiếng hay đánh nhau", gang: "dính vào băng nhóm",
};

/** Việc lớn AI được gây ra; host đối chiếu điều kiện tuổi/hôn nhân trước khi làm. */
export const BIG_ACTIONS: Record<BigActionKind, string> = {
  doi_nghe: "đổi nghề — gia_tri ∈ farm|market|driver|build|factory|teach|health|office|tech|domestic", mat_viec: "mất việc / bỏ việc",
  vay: "vay — gia_tri = số năm thu nhập (≤3)", tra_no: "trả nợ — gia_tri = số năm thu nhập (≤3)", co_cau_no: "xin giãn nợ",
  di_nuoc_ngoai: "sang nước khác sống và làm việc", ve_que: "về lại quê / nước mình", chuyen_thanh_pho: "chuyển lên thành phố", di_hoc: "đi học lại",
  ket_hon: "kết hôn — gia_tri = tên người kia (nếu là người mới)", ly_hon: "ly hôn", co_con: "sinh con", nghi_huu: "nghỉ hưu", xin_loi: "đi xin lỗi những người mình làm tổn thương",
  theo_duong: "bước vào một con đường đời — gia_tri = id con đường",
};

const OUTCOMES = new Set<ActOutcome>(["thanh", "nua_voi", "hong", "khong_lam_duoc"]);
const FAMILIES = new Set(["farm", "market", "driver", "build", "factory", "teach", "health", "office", "tech", "domestic"]);
const HABITS = new Set(["smoke", "drink", "exercise", "read", "save", "gamble", "honest", "kind"]);
const SECRETS = new Set<SecretTag>(["CHEATED_EXAM", "PAID_BRIBE", "DEFRAUDED_FRIEND", "STOLE_SHARED_PROFIT", "FORGED_PAPERS", "ABANDONED_PARENT"]);
const STAT_CAPS: Record<keyof ActStats, [number, number]> = { money: [-3, 3], health: [-40, 20], happy: [-20, 20], know: [-20, 20], rel: [-20, 20], bw: [-25, 15], income_mult: [0.5, 2], agency: [-0.05, 0.05] };

const obj = (x: unknown): Record<string, unknown> | null => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null);
const num = (x: unknown): number | undefined => (typeof x === "number" && Number.isFinite(x) ? x : undefined);
const str = (x: unknown, max: number): string => (typeof x === "string" ? x.trim().slice(0, max) : "");
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
/** Khóa riêng của bảng, không lọt "toString", "constructor", "__proto__"… từ chữ AI viết. */
const own = (table: object, key: unknown): key is string => typeof key === "string" && Object.hasOwn(table, key);

/** Chi phí sức lực bắt buộc của việc gõ thứ n trong năm: 3, 5, 8, 12, 17, 23… */
export function bwCost(n: number): number { let c = 0; for (let k = 1; k <= n; k++) c = k === 1 ? 3 : c + k; return c; }

function sanitizeEffects(o: Record<string, unknown>, castIds: ReadonlySet<string>, age: number): ActEffects {
  const child = age < 12;
  const chi_so: ActStats = {};
  const cs = obj(o.chi_so);
  if (cs) for (const k of Object.keys(STAT_CAPS) as Array<keyof ActStats>) {
    const v = num(cs[k]); if (v === undefined) continue;
    if (child && k === "money") continue;
    chi_so[k] = clamp(v, STAT_CAPS[k][0], STAT_CAPS[k][1]);
  }
  const nguoi: ActPerson[] = []; let fresh = 0; const usedIds = new Set<string>();
  if (Array.isArray(o.nguoi)) for (const raw of o.nguoi) {
    if (nguoi.length >= 3) break;
    const p = obj(raw); if (!p) continue;
    const tin = child ? 0 : clamp(num(p.tin) ?? 0, -0.5, 0.5);
    const base = { tin, nho: str(p.nho, 120), phan_ung: str(p.phan_ung, 120) };
    const id = typeof p.id === "string" ? p.id : undefined;
    if (id && castIds.has(id) && !usedIds.has(id)) { usedIds.add(id); nguoi.push({ id, ...base }); continue; }
    const m = obj(p.moi);
    if (!id && m && fresh < 1) { const ten = str(m.ten, 30); if (!ten) continue; fresh++; nguoi.push({ moi: { ten, vai: str(m.vai, 20) || "người quen" }, ...base }); }
  }
  const flagList = (x: unknown) => (Array.isArray(x) ? [...new Set(x.filter((f): f is string => own(ALLOWED_FLAGS, f)))].slice(0, 4) : []);
  const viec_lon: BigAction[] = [];
  if (Array.isArray(o.viec_lon)) for (const raw of o.viec_lon) {
    if (viec_lon.length >= 2) break;
    const a = obj(raw); if (!a || !own(BIG_ACTIONS, a.loai)) continue;
    const loai = a.loai as BigActionKind;
    if (viec_lon.some((v) => v.loai === loai)) continue; // mỗi loại việc lớn một lần mỗi kết quả
    if (loai === "doi_nghe") { if (typeof a.gia_tri === "string" && FAMILIES.has(a.gia_tri)) viec_lon.push({ loai, gia_tri: a.gia_tri }); continue; }
    if (loai === "theo_duong") { if (own(PATHS, a.gia_tri)) viec_lon.push({ loai, gia_tri: a.gia_tri }); continue; }
    if (loai === "vay" || loai === "tra_no") { if (child) continue; const v = num(a.gia_tri); if (v !== undefined && v > 0) viec_lon.push({ loai, gia_tri: Math.min(3, v) }); continue; }
    if (loai === "ket_hon") { const ten = str(a.gia_tri, 30).replace(/[|:]/g, "").trim(); viec_lon.push(ten ? { loai, gia_tri: ten } : { loai }); continue; }
    viec_lon.push({ loai });
  }
  const thoi_quen: Record<string, number> = {};
  const tq = obj(o.thoi_quen);
  if (tq) for (const [k, v] of Object.entries(tq)) { const n = num(v); if (HABITS.has(k) && n !== undefined && n !== 0) thoi_quen[k] = clamp(Math.round(n), -3, 3); }
  let bi_mat: ActSecret | null = null;
  const bm = obj(o.bi_mat);
  if (bm && typeof bm.loai === "string" && SECRETS.has(bm.loai as SecretTag)) {
    bi_mat = { loai: bm.loai as SecretTag, nang: clamp(num(bm.nang) ?? 0.3, 0.1, 0.8), fuse: Math.round(clamp(num(bm.fuse) ?? num(bm.ngoi_nam) ?? 6, 3, 12)), ghi: str(bm.ghi, 120) };
  }
  return { chi_so, nguoi, co: flagList(o.co), bo_co: flagList(o.bo_co), viec_lon, thoi_quen, bi_mat };
}

/** Làm sạch kết quả AI cho một việc gõ. null = không dùng được (thiếu lời kể hoặc kết quả). */
export function sanitizeAct(raw: unknown, castIds: ReadonlySet<string>, age: number): ActResult | null {
  const o = obj(raw); if (!o) return null;
  const ke = str(o.ke, 600); if (!ke) return null;
  if (typeof o.ket_qua !== "string" || !OUTCOMES.has(o.ket_qua as ActOutcome)) return null;
  const ch = obj(o.chuyen);
  const ten = ch ? str(ch.ten, 60) : "";
  const chuyen = ch && ten ? { ten, tom_tat: str(ch.tom_tat, 240), hen_nam: Math.round(clamp(num(ch.hen_nam) ?? 2, 1, 5)) } : null;
  return { ke, ket_qua: o.ket_qua as ActOutcome, ...sanitizeEffects(o, castIds, age), chuyen };
}

/** Làm sạch một chặng của chuyện đang dở. Chặng cuối (stage ≥ MAX_STORY_STAGES) bắt mọi nút phải khép chuyện. */
export function sanitizeStoryScene(raw: unknown, castIds: ReadonlySet<string>, stage: number, age: number): StoryScene | null {
  const o = obj(raw); if (!o || !Array.isArray(o.choices)) return null;
  const title = str(o.title, 70); if (!title) return null;
  const last = stage >= MAX_STORY_STAGES;
  const choices: StoryChoice[] = [];
  for (const rc of o.choices) {
    if (choices.length >= 4) break;
    const c = obj(rc); if (!c) continue;
    const label = str(c.label, 60); if (!label) continue;
    const t = obj(c.tiep); const ketRaw = str(c.ket, 220);
    let tiep = t ? { hen_nam: Math.round(clamp(num(t.hen_nam) ?? 2, 1, 5)), tom_tat: str(t.tom_tat, 240) } : null;
    let ket: string | null = ketRaw || null;
    if (last || (!tiep && !ket)) { tiep = null; ket = ket ?? "Chuyện khép lại."; }
    else if (ket) tiep = null;
    choices.push({ label, hint: str(c.hint, 70), log: str(c.log, 220), ...sanitizeEffects(c, castIds, age), tiep, ket });
  }
  if (choices.length < 2) return null;
  return { title, text: str(o.text, 600), choices, def: Math.round(clamp(num(o.def) ?? 0, 0, choices.length - 1)) };
}

/** Những chuyện đến hẹn năm nay: chưa đóng, nextAge ≤ tuổi, sớm nhất trước, tối đa 2. */
export function dueStories(stories: Story[], age: number): Story[] {
  return stories.filter((s) => !s.closed && s.nextAge <= age).sort((a, b) => a.nextAge - b.nextAge || a.openedAge - b.openedAge).slice(0, MAX_STORIES_PER_YEAR);
}
