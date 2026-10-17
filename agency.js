/* ================= Ô "TÔI MUỐN…" =================
   Người chơi gõ tự do; AI toàn quyền viết kết quả; engine (Argon.sanitizeAct) kẹp trần.
   Spec: argon/docs/superpowers/specs/2026-10-17-tu-quyet-design.md */

/* ---- Việc lớn: điều kiện và ánh xạ sang hiệu ứng host ---- */
function bigActionOk(L, a) {
  if (!a || !L.alive) return false;
  const x = L.age, fl = L.lw ? L.lw.sflags : new Set();
  switch (a.loai) {
    case "doi_nghe": return x >= 16 && FAM[a.gia_tri] !== undefined;
    case "mat_viec": return !!L.job && !L.retired;
    case "vay": return x >= 18;
    case "tra_no": case "co_cau_no": return (L.debt || 0) > 0;
    case "di_nuoc_ngoai": return x >= 18 && x <= 50 && !L.migrated;
    case "ve_que": return !!L.migrated || fl.has("left_home") || fl.has("path_migrant");
    case "chuyen_thanh_pho": return x >= 16 && !fl.has("path_city");
    case "di_hoc": return x >= 16 && x <= 45 && !L.school.in && !L.school.uni && !(L.lw && L.lw.studying);
    case "ket_hon": return x >= 18 && !L.married;
    case "ly_hon": return !!L.married;
    case "co_con": { const fAge = L.sex === "F" ? x : x - 3; return !!L.married && fAge >= 18 && fAge <= 44; }
    case "nghi_huu": return x >= 50 && !L.retired && !!L.job;
    case "xin_loi": return true;
    case "theo_duong": { const d = Argon.PATHS[a.gia_tri]; return !!d && x >= d.ages[0] && x <= d.ages[1] + 5 && !fl.has("life_" + d.id); }
  }
  return false;
}
function bigActionToCustom(a) {
  switch (a.loai) {
    case "doi_nghe": return "job_switch:" + a.gia_tri;
    case "mat_viec": return "job_lose";
    case "vay": return "borrow:" + a.gia_tri;
    case "tra_no": return "repay:" + a.gia_tri;
    case "co_cau_no": return "restructure";
    case "di_nuoc_ngoai": return "migrate_now";
    case "ve_que": return "return_home";
    case "chuyen_thanh_pho": return "move_city";
    case "di_hoc": return "study";
    case "ket_hon": return "marry" + (a.gia_tri ? ":" + a.gia_tri : "");
    case "ly_hon": return "spouse_leave";
    case "co_con": return "have_child";
    case "nghi_huu": return "retire";
    case "xin_loi": return "apologize";
    case "theo_duong": return "become:" + a.gia_tri;
  }
  return "";
}
