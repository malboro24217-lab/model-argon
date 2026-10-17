let CF_FOCUS=null;
/* ================= CHOICE MATTERS (host) =================
   Dấu ấn · nhân quả · cửa đã đóng · lời hứa · biệt danh · xưng hô · cuộc đời suýt có · tiền kiếp */
const CH = {
  DOOR_VN: id => (Argon.DOORS[id] || { vi: id, desc: "" }),
  EPITHETS: [
    { id: "keeper", vi: "Người giữ lời", when: L => promiseStats(L).kept >= 2 && promiseStats(L).broken === 0 },
    { id: "oathbreaker", vi: "Kẻ bội ước", when: L => promiseStats(L).broken >= 2 },
    { id: "extractor", vi: "Kẻ bòn rút", when: L => L.lw.cz.doors.has("partner_circle") },
    { id: "fair", vi: "Người giữ lẽ công bằng", when: L => (L.traits || {}).fair >= 4 },
    { id: "hawk", vi: "Diều hâu", when: L => (L.traits || {}).bold >= 5 },
    { id: "exile", vi: "Người bỏ xứ", when: L => L.lw.cz.doors.has("return_home") || L.migrated },
    { id: "secretive", vi: "Người mang bí mật", when: L => L.lw.mem.secrets.filter(s => !s.exploded).length >= 2 },
    { id: "pariah", vi: "Kẻ bị xóm quay lưng", when: L => L.lw.cz.doors.has("village_trust") },
    { id: "debtor", vi: "Con nợ", when: L => L.ar && L.ar.state.perception.rat_race_ticks >= 16 },
    { id: "sovereign", vi: "Người tự chủ", when: L => L.ar && Argon.tierOf(L.ar.state) === "sovereign" },
    { id: "pillar", vi: "Chỗ dựa của xóm", when: L => L.ar && L.ar.state.capitals.socialLedger.reputation >= 70 },
    { id: "cooperator", vi: "Người tử tế", when: L => (L.traits || {}).coop >= 5 },
  ],
};
function sceneKey(L, p) { return p.key || (p.id + "@" + L.age); }

/* ---- Dấu ấn: gọi từ resolve() trước khi áp dụng hiệu ứng ---- */
function markChoice(L, p, i) {
  if (!L.lw) return null;
  const g = argonGate(L);
  const visible = p.choices.map((c, k) => ({ c, k })).filter(x => choiceState(L, x.c, g) === "show");
  const ch = p.choices[i];
  const mark = Argon.addMark(L.lw.cz, { age: L.age, storylet: p.id, title: p.title, choice: ch ? ch.label : "", alternatives: visible.map(x => x.c.label), choice_index: i, witnesses: p.npc ? [p.npc.id] : [], doors_closed: [] });
  mark.alt_indices = visible.map(x => x.k).filter(k => k !== i);
  mark.key = sceneKey(L, p);
  mark.altLabels = Object.fromEntries(p.choices.map((c, k) => [k, c.label]));
  L.choices.push({ key: mark.key, index: i });
  if (!L.replay && ch && visible.length >= 2 && !/^(Không năm nay|Bạn để sang năm|Ghi nhớ|Tổng kết|Chịu|Nhận)$/.test(ch.label)) log(L, `${p.title} — bạn chọn: ${ch.label}`, "choice");
  L.curMark = mark;
  return mark;
}
function stampP(L, key) { if (L.curMark) Argon.stamp(L.lw.cz, key, L.curMark.id); }
function closeDoorNow(L, d) {
  const m = L.curMark || Argon.addMark(L.lw.cz, { age: L.age, storylet: "world", title: "Đời đưa đẩy", choice: "", alternatives: [], choice_index: 0, witnesses: [], doors_closed: [] });
  if (Argon.closeDoor(L.lw.cz, d, m.id)) log(L, `Cánh cửa đã đóng: ${CH.DOOR_VN(d).vi}. ${CH.DOOR_VN(d).desc}`, "door");
}
/* Nhân quả khi một storylet nổ */
function causeLine(L, marks) {
  if (!marks || !marks.length) return "";
  return "Vì " + marks.map(m => `năm ${m.age} tuổi bạn ${m.choice ? `đã chọn "${m.choice}"` : "để mọi chuyện xảy ra"}${m.title ? ` (${m.title.toLowerCase()})` : ""}`).join(", và ") + ".";
}

/* ---- Lời hứa ---- */
function promiseStats(L) { const ps = (L.lw && L.lw.promises) || []; return { kept: ps.filter(p => p.kept === true).length, broken: ps.filter(p => p.kept === false).length, open: ps.filter(p => p.kept === null).length }; }
function addPromise(L, pr) {
  if (!pr.to || !L.ar.state.npcs.has(pr.to)) return;
  L.lw.promises.push({ to: pr.to, what: pr.what, due: L.age + pr.years, cost: pr.cost_money || 0, mark: L.curMark ? L.curMark.id : null, kept: null, made: L.age });
  log(L, `Bạn hứa với ${castName(L, pr.to)}: ${pr.what}, trước ${pr.years} năm.`, "promise");
}
/* Cảnh đến hạn (host sinh ra, không nằm trong bể storylet) */
function promiseDueScene(L) {
  const pr = L.lw.promises.find(p => p.kept === null && p.due <= L.age);
  if (!pr) return false;
  const npc = L.ar.state.npcs.get(pr.to); if (!npc) { pr.kept = true; return false; }
  const yearly = Math.max(300, householdIncome(L)); const can = L.savings >= pr.cost * yearly;
  const mark = Argon.markById(L.lw.cz, pr.mark);
  scene(L, { id: "promise", key: "promise@" + L.age, title: `Lời hứa với ${npc.name} đến hạn`, npc,
    text: `Năm ${pr.made} tuổi bạn đã hứa với ${npc.name}: ${pr.what}. ${can ? "Bạn có thể giữ lời." : "Giữ lời lúc này sẽ rất đau."} ${npc.name} không nhắc, nhưng nhớ.`,
    causes: mark ? [mark] : [],
    choices: [
      { label: "Giữ lời", longterm: true, hint: pr.cost ? `Mất ${fmtPPP(pr.cost * yearly)}` : "Mất thời gian", fx: L2 => { pr.kept = true; L2.savings -= pr.cost * yearly; Argon.addMemory(L2.lw.mem, npc.id, "KEPT_PROMISE", L2.age, 0.45, `bạn giữ lời năm ${L2.age} tuổi`); Argon.propagate(L2.ar.state.graph, npc.id, 0.2, L2.ar.state.tick); stampP(L2, Argon.prov.memory(npc.id, "KEPT_PROMISE")); L2.lw.cz.origin.set(Argon.prov.opinion(npc.id), L2.curMark.id); log(L2, `Bạn giữ lời với ${npc.name}. ${npc.name} không nói gì, nhưng từ đó nhìn bạn khác.`, "good"); } },
      { label: "Xin thêm thời gian", hint: "Có thể được, có thể không", fx: L2 => { if (L2.r() < 0.6 && !pr.extended) { pr.extended = true; pr.due = L2.age + 2; log(L2, `${npc.name} gật đầu, lần này.`); } else { pr.kept = false; Argon.addMemory(L2.lw.mem, npc.id, "CHEATED_ME", L2.age, -0.4, `bạn khất rồi không giữ lời`); L2.lw.cz.origin.set(Argon.prov.opinion(npc.id), L2.curMark.id); log(L2, `${npc.name} không gật. Với ${npc.name}, bạn đã bội ước.`, "bad"); } } },
      { label: "Lờ đi", hint: "Giữ tiền, mất một người", fx: L2 => { pr.kept = false; Argon.addMemory(L2.lw.mem, npc.id, "CHEATED_ME", L2.age, -0.6, `bạn bội ước năm ${L2.age} tuổi`); Argon.propagate(L2.ar.state.graph, npc.id, -0.3, L2.ar.state.tick); L2.lw.cz.origin.set(Argon.prov.opinion(npc.id), L2.curMark.id); const m = L2.lw.cast.get(npc.id); if (m && ["mother", "father", "sibling"].includes(m.role)) closeDoorNow(L2, "family_table"); log(L2, `Bạn lờ đi. Cả xóm biết ${npc.name} đã tin bạn.`, "bad"); } },
    ], def: can ? 0 : 1 });
  return true;
}

/* ---- Xưng hô & biệt danh ---- */
function addressOf(L, id) {
  const op = Argon.opinionOf(L.ar.state, L.lw.mem, id); const m = L.lw.cast.get(id); const older = m && m.age_offset > 8;
  if (op >= 0.5) return older ? "con" : "anh em";
  if (op >= 0.1) return older ? "cháu" : "cậu";
  if (op > -0.35) return older ? "cô/cậu" : "anh";
  return older ? "thằng này" : "mày";
}
function epithets(L) { if (!L.lw) return []; return CH.EPITHETS.filter(e => { try { return e.when(L); } catch { return false; } }).map(e => e.vi).slice(0, 2); }

/* ---- Báo trước (foreshadow) ---- */
function foreshadow(L) {
  for (const s of L.lw.mem.secrets) { if (s.exploded || s.fore || L.age < s.fuse_age - 2) continue; s.fore = true; log(L, `Ở chợ, có người nhắc lại chuyện năm bạn ${s.age} tuổi, rồi im bặt khi thấy bạn.`, "bad"); }
}

/* ---- Cuộc đời suýt có: chạy lại đúng hạt giống với lựa chọn khác ---- */
function lifeSummary(P) {
  const T = P.ar ? Argon.lifeTopology(P.ar.state, P.ar.npcStart) : null;
  return { age: P.age, cause: P.cause, country: P.c.n, job: P.job || P.lastJob || "không nghề", hist: P.lw.history.map(h => [h.id, h.age]), net: Math.round(P.savings), married: P.married || P.widowed, kids: P.kids.filter(k => k.alive).length, rep: P.ar ? Math.round(P.ar.state.capitals.socialLedger.reputation) : 50, tier: P.ar ? Argon.tierOf(P.ar.state) : "autopilot", quadrant: T ? T.quadrant : null, epithets: epithets(P), doors: [...P.lw.cz.doors] };
}
function replayLife(seed, choices, override) {
  const script = {}; for (const c of choices) script[c.key] = c.index;
  const focus = {}; for (const k in (G.life && G.life.seed === seed ? G.life.focusLog : CF_FOCUS) || {}) focus[k] = (G.life && G.life.seed === seed ? G.life.focusLog : CF_FOCUS)[k];
  const was = NAR.enabled; NAR.enabled = false;
  const P = createLife(seed, { auto: true, script, override, focus });
  let g = 0; while (P.alive && g++ < 130) stepYear(P);
  NAR.enabled = was;
  return P;
}
function counterfactuals(L) {
  CF_FOCUS = L.focusLog;
  const cz = L.lw.cz; const secretsFrom = m => [...cz.origin.entries()].filter(([k, v]) => v === m.id && k.startsWith("secret:")).length;
  const pivots = Argon.pivotalMarks(cz, 6, m => secretsFrom(m) * 2 + (m.alt_indices && m.alt_indices.length ? 0 : -99)).filter(m => m.alt_indices && m.alt_indices.length);
  const root = cz.marks.find(m => m.age <= 5 && m.alt_indices && m.alt_indices.length);
  const pv = (root ? [root].concat(pivots.filter(m => m !== root)) : pivots).slice(0, 3); pivots.length = 0; pivots.push(...pv);
  if (!pivots.length) return null;
  const base = lifeSummary(replayLife(L.seed, L.choices, null));
  const alts = pivots.map(m => { const alt = m.alt_indices[0]; const P = replayLife(L.seed, L.choices, { key: keyOfMark(L, m), index: alt }); const altLabel = m.altLabels && m.altLabels[alt] || m.alternatives.filter(a => a !== m.choice)[0] || "khác"; return { mark: m, altLabel, life: lifeSummary(P) }; });
  return { base, alts };
}
function keyOfMark(L, m) { return m.key || null; }
function diffVN(a, b, fromAge) {
  const out = [];
  if (fromAge !== undefined && a.hist && b.hist) { const sa = new Set(a.hist.filter(h => h[1] > fromAge).map(h => h[0])); const later = b.hist.filter(h => h[1] > fromAge); const changed = later.filter(h => !sa.has(h[0])).length; if (later.length >= 5) out.push(`${changed} trong ${later.length} tình huống về sau sẽ là chuyện khác hẳn`); }
  if (Math.abs(a.age - b.age) >= 3) out.push(`sống đến ${b.age} tuổi thay vì ${a.age}`);
  if (b.job !== a.job) out.push(`làm ${b.job} thay vì ${a.job}`);
  if (Math.abs(b.net - a.net) > Math.max(500, Math.abs(a.net) * 0.4)) out.push(b.net > a.net ? (b.net < 0 ? `nợ ít hơn (${fmtPPP(b.net)} so với ${fmtPPP(a.net)})` : `để lại nhiều tiền hơn (${fmtPPP(b.net)} so với ${fmtPPP(a.net)})`) : `nghèo hơn hẳn (${fmtPPP(b.net)} so với ${fmtPPP(a.net)})`);
  if (b.tier !== a.tier) out.push(`kết thúc ở tầng ${AR.TIER_VN[b.tier]} thay vì ${AR.TIER_VN[a.tier]}`);
  if (Math.abs(b.rep - a.rep) >= 12) out.push(`danh tiếng ${b.rep} thay vì ${a.rep}`);
  if (b.kids !== a.kids) out.push(`${b.kids} con thay vì ${a.kids}`);
  const dd = b.doors.filter(d => !a.doors.includes(d)); const od = a.doors.filter(d => !b.doors.includes(d));
  if (od.length) out.push(`cánh cửa ${od.map(d => CH.DOOR_VN(d).vi.toLowerCase()).join(", ")} vẫn mở`);
  if (dd.length) out.push(`đóng thêm cửa ${dd.map(d => CH.DOOR_VN(d).vi.toLowerCase()).join(", ")}`);
  if (b.quadrant !== a.quadrant && b.quadrant) out.push(`là ${({ builder: "người kiến tạo", extractor: "người bòn rút", sleeper: "người ngủ quên", casualty: "người bị cuốn đi" })[b.quadrant]}`);
  return out;
}
function counterfactualVN(L) {
  const cf = counterfactuals(L); if (!cf) return "";
  const rows = cf.alts.map(a => { const d = diffVN(cf.base, a.life, a.mark.age); return `<div class="c"><b>Năm ${a.mark.age} tuổi · ${esc(a.mark.title)}</b><span>Bạn đã chọn "${esc(a.mark.choice)}". Nếu chọn "${esc(a.altLabel)}": ${d.length ? d.join("; ") + "." : "cuộc đời gần như không đổi. Có những ngã rẽ chỉ là ngã rẽ trong đầu."}</span></div>`; });
  return `<div class="panel"><span class="label">Cuộc đời suýt có</span><p style="margin:0" class="muted">Cùng một hạt giống, cùng mọi lựa chọn khác, chỉ đổi một.</p>${rows.join("")}</div>`;
}
function causalityVN(L) {
  const ms = L.lw.cz.marks.filter(m => m.consequences.length || m.doors_closed.length).sort((a, b) => a.age - b.age).slice(0, 12);
  if (!ms.length) return "";
  return `<div class="panel"><span class="label">Bản đồ nhân quả</span>${ms.map(m => `<div class="c"><b>${m.age}t · ${esc(m.title)} — ${esc(m.choice)}</b>${m.doors_closed.length ? `<span class="muted">đóng cửa: ${m.doors_closed.map(d => CH.DOOR_VN(d).vi).join(", ")}</span>` : ""}${m.consequences.map(c => `<span>→ ${c.age}t: ${esc(c.text)}</span>`).join("")}</div>`).join("")}</div>`;
}

/* ---- Tiền kiếp (meta-progression, lưu trên trình duyệt) ---- */
const META = { key: "mlcd.meta", get() { try { return JSON.parse(localStorage.getItem(this.key) || "null") || { lives: 0, perks: [], codex: {} }; } catch { return { lives: 0, perks: [], codex: {} }; } }, set(m) { try { localStorage.setItem(this.key, JSON.stringify(m)); } catch { } } };
const PERKS = [
  { id: "insight", vi: "Nhìn thấu một lần", desc: "Lần thẩm định đầu tiên của mỗi đời không tốn băng thông." },
  { id: "codex", vi: "Trang sổ tay cũ", desc: "Các khái niệm đã học ở kiếp trước còn nguyên." },
  { id: "mentor", vi: "Người quen cũ", desc: "Người thầy tin bạn từ đầu." },
  { id: "door", vi: "Một cửa để ngỏ", desc: "Cánh cửa đầu tiên bị đóng trong đời sẽ không đóng." },
];
function metaOnDeath(L) { const m = META.get(); m.lives++; const next = PERKS[Math.min(m.perks.length, PERKS.length - 1)]; if (next && !m.perks.includes(next.id) && m.perks.length < PERKS.length) m.perks.push(next.id); for (const k in (L.codex || {})) m.codex[k] = true; META.set(m); return m; }
function metaApply(L) { const m = META.get(); if (!m.lives) return; if (m.perks.includes("codex")) { L.codex = L.codex || {}; for (const k in m.codex) if (!L.codex[k]) L.codex[k] = 0; } if (m.perks.includes("mentor")) { const me = castRole(L, "mentor"); if (me) Argon.setEdge(L.ar.state.graph, me.id, "player", 0.5, 0); } L.perks = m.perks.slice(); }
