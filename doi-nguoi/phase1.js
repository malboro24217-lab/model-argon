/* ================= GIAI ĐOẠN 1: hệ quả nhìn thấy được, thẻ thập kỷ, màn kết v2, Tấm bia =================
   Kế hoạch: argon/docs/superpowers/plans/2026-10-18-gay-cuon.md. Bản chuẩn bị và ảnh: scratchpad/ux/phase1/. */

/* ================= HỆ QUẢ NHÌN THẤY ĐƯỢC (Giai đoạn 1) =================
   Hai phần, đều chỉ là hiển thị: không rút rng, không đổi kết quả, chơi lại không bị ảnh hưởng.
   1) Dòng "↩ Vì năm 22 tuổi bạn …" nằm TRÊN tiêu đề thẻ, thay cho câu nối vào cuối p.text.
   2) Báo nhẹ "X sẽ nhớ điều này." sau một lựa chọn để lại ký ức, CHỈ KHI trong kho có thẻ về sau đọc lại đúng ký ức ấy.
   Xem causality-line.md để biết chỗ dán. */

/* ---------- 1. Dòng "Vì…" ---------- */
/* Một câu ngắn từ dấu ấn gần nhất (marks đã sắp theo tuổi tăng dần). Không lặp tiêu đề cảnh; cắt câu chọn dài. */
function becauseLine(L, marks) {
  if (!marks || !marks.length) return "";
  const m = marks[marks.length - 1];
  const ch = String(m.choice || "").trim();
  const what = ch ? `bạn đã chọn “${ch.length > 48 ? ch.slice(0, 47).replace(/\s+\S*$/, "") + "…" : ch}”` : "bạn để mọi chuyện trôi";
  const more = marks.length > 1 ? `, và ${marks.length - 1} chuyện trước đó` : "";
  const title = String(m.title || "").trim();
  return `Vì năm ${m.age} tuổi ${what}${title ? ` (${title})` : ""}${more}.`;
}
/* Markup cho render() trong index.html, đặt ngay trước <h3 id="decT">. */
function becauseHTML(L, p) {
  if (!p.causes || !p.causes.length) return "";
  return `<p class="because" title="${esc(causeLine(L, p.causes))}"><span class="because-mark" aria-hidden="true">↩</span>${esc(becauseLine(L, p.causes))}</p>`;
}

/* ---------- 2. "Họ sẽ nhớ điều này" ---------- */
/* Kho thẻ đọc lại ý kiến/ký ức của một NPC, theo VAI của NPC đó (dữ liệu tĩnh, rút từ argon/src/engine/narrative/storylets.ts và micro.ts,
   ngày 18/10/2026). Mỗi mục: vai → [id thẻ, dấu ý kiến mà thẻ phản ứng (+1 tốt, −1 xấu, 0 cả hai), tuổi người chơi tối thiểu, tối đa, chỉ một lần].
   "any_nonfamily" = thẻ chọn bất kỳ người ngoài gia đình có ý kiến đủ mạnh (enemy_obstruct, ally_rescue, ally_deal, isolation…).
   Khi thêm storylet có causes: prov.opinion(...) hoặc op(c, role(...)), thêm vào đây. Test đi kèm (causality-test.js) so bảng này với mã nguồn. */
const MEM_READERS = {
  neighbor:         [["well", 1, 18, 45, true], ["stag", 1, 20, 60, false], ["land", -1, 28, 60, true]],
  childhood_friend: [["loan_friend", 1, 18, 55, false], ["m_friend_pitch", 1, 22, 55, false]],
  partner:          [["shop_offer", 1, 22, 50, true], ["shop_end", 0, 18, 90, true]],
  sibling:          [["estate", -1, 18, 99, true]],
  child:            [["care", 1, 68, 99, true]],
  creditor:         [["creditor_knock", -1, 20, 99, false]],
  official:         [["bribe", -1, 26, 55, true], ["enemy_gate", -1, 25, 99, false]],
  bully:            [["bully_rises", -1, 24, 36, true]],
  any_nonfamily:    [["enemy_obstruct", -1, 22, 99, false], ["ally_rescue", 1, 20, 99, false], ["ally_deal", 1, 22, 62, false], ["isolation", -1, 22, 99, false]],
  any:              [["m_reconcile", -1, 55, 90, false]]
};
const FAMILY_ROLES = new Set(["mother", "father", "sibling", "spouse", "child"]);

/* Có thẻ nào về sau còn đọc lại ký ức (npcId, dấu weight) không? Xét vai, khoảng tuổi còn lại, thẻ "once" đã nổ chưa, NPC còn sống không. */
function hasReader(L, npcId, weight) {
  const m = L.lw && L.lw.cast.get(npcId); if (!m || !m.alive) return false;
  const sign = Math.sign(weight), age = L.age, fired = new Set((L.lw.history || []).map(h => h.id));
  const ok = ([id, s, lo, hi, once]) => (s === 0 || s === sign) && hi > age && !(once && fired.has(id));
  for (const r of m.roles || [m.role]) if ((MEM_READERS[r] || []).some(ok)) return true;
  if ((m.roles || [m.role]).every(r => !FAMILY_ROLES.has(r)) && MEM_READERS.any_nonfamily.some(ok)) return true;
  if (sign < 0 && MEM_READERS.any.some(ok)) return true;
  return false;
}

/* Gọi trong resolve() (index.html) quanh ch.fx(L): chụp ký ức trước, so sau, chọn một ký ức mới có người đọc lại. Tối đa 1 lần mỗi năm. */
function memSnapshot(L) { const out = new Map(); if (L.lw) for (const [id, arr] of L.lw.mem.tokens) out.set(id, arr.length); return out; }
function rememberToast(L, before) {
  if (!L.lw || L.replay || (L.lw.toastAge === L.age)) return null;
  let pick = null;
  for (const [id, arr] of L.lw.mem.tokens) {
    const n0 = before.get(id) || 0; if (arr.length <= n0) continue;
    for (const t of arr.slice(n0)) if (Math.abs(t.weight) >= 0.2 && hasReader(L, id, t.weight) && (!pick || Math.abs(t.weight) > Math.abs(pick.t.weight))) pick = { id, t };
  }
  if (!pick) return null;
  L.lw.toastAge = L.age;
  const name = castName(L, pick.id);
  return { npc: pick.id, text: `${name} sẽ nhớ điều này.`, sign: Math.sign(pick.t.weight) };
}
/* Hiện báo: một dòng mờ dưới thẻ vừa chọn (desktop) / trên ô Tôi muốn (điện thoại). aria-live để trình đọc màn hình đọc được. */
function showToast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  el.textContent = msg.text; el.classList.toggle("bad", msg.sign < 0); el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(showToast.t); showToast.t = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ================= THẺ THẬP KỶ (Giai đoạn 1) =================
   Mỗi tròn chục tuổi (10, 20, …) một băng rôn trong nhật ký, KHÔNG dừng đồng hồ, không phải quyết định.
   Một câu duy nhất, vui hoặc chùng xuống, kèm dải 5 thanh đời (bạn + 4 em bé cùng giây).
   Chỉ đọc trạng thái, không rút rng: chơi lại không đổi. Xem decade.md.

   Số liệu của em bé cùng giây ở mỗi mốc chục tuổi lấy bằng peerWithSnaps(seed): gọi simulatePeer(seed, onYear) với một móc chỉ đọc. */

/* Phân phối chuẩn tích lũy (Abramowitz–Stegun 7.1.26, sai số < 1.5e-7). */
function normCdf(z) { const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2); return z >= 0 ? (1 + y) / 2 : (1 - y) / 2; }

/* Thu nhập của bạn (nếu có việc) hoặc của nhà bạn tính theo đầu người. */
function ownIncome(L) { return L.income > 0 ? L.income : L.famIncome; }
/* Phân vị thu nhập trong nước bạn: nghịch đảo đúng công thức incomeAt(c,p) của engine (log-normal theo Gini). 0..100. */
function incomePct(L) {
  const c = L.c, x = ownIncome(L); if (!(x > 0)) return 0;
  const sig = Math.SQRT2 * probit((c.gi + 1) / 2), mean = c.g * 0.6;
  return Math.max(1, Math.min(99, Math.round(100 * normCdf((Math.log(x / mean) + sig * sig / 2) / sig))));
}
/* Phân vị hạnh phúc so với người cùng tuổi trong trò chơi, đã trừ mức hài lòng chung của nước (c.h·8).
   Bảng đo bằng tools/happy-stats.js trên 1.500 đời tự chơi (18/10/2026). Đo lại khi đổi updateHappiness. */
const HAPPY_NORM = { 10: [5.7, 5], 20: [6, 10.8], 30: [13.5, 13.5], 40: [15, 15.4], 50: [9.8, 15.4], 60: [5.8, 16.7], 70: [-2.9, 15], 80: [0.5, 12.4], 90: [1.2, 10.5] };
function happyPct(L) { const k = Math.min(90, Math.max(10, Math.round(L.age / 10) * 10)), [m, sd] = HAPPY_NORM[k]; return Math.max(1, Math.min(99, Math.round(100 * normCdf((L.st.happy - L.c.h * 8 - m) / sd)))); }

/* Thay cho simulatePeer(...) trong birth(): giống hệt, thêm snap[10,20,…] để thẻ thập kỷ so được. Engine cũ (không có onYear) vẫn chạy, chỉ thiếu snap. */
function peerWithSnaps(seed) {
  const snap = {};
  const p = simulatePeer(seed, P => { if (P.age % 10 === 0 && P.alive) snap[P.age] = { h: Math.round(P.st.happy), hp: happyPct(P), ip: incomePct(P) }; });
  p.snap = snap; return p;
}

/* Dữ liệu một thẻ. Thứ tự ưu tiên của câu: có em bé mất trong thập kỷ → phân vị thu nhập rất cao/thấp → xếp hạng hạnh phúc trong 5 người → câu mặc định. */
function decadeCard(L) {
  const a = L.age, from = a - 10;
  const me = { name: "Bạn", me: true, alive: true, h: Math.round(L.st.happy), hp: happyPct(L), ip: incomePct(L), country: L.c.n };
  const peers = (G.peers || []).map(p => { const s = p.snap && p.snap[a]; const alive = p.deathAge > a || (p.deathAge === a && p.tl[a] != null);
    return { name: p.name, country: p.c.n, alive, deathAge: p.deathAge, cause: p.cause, line: alive ? (p.tl[a] || "") : `mất năm ${p.deathAge} tuổi`, h: s ? s.h : null, hp: s ? s.hp : null, ip: s ? s.ip : null }; });
  const died = peers.filter(p => !p.alive && p.deathAge > from && p.deathAge <= a);
  const alive = peers.filter(p => p.alive);
  let text, tone;
  if (died.length) {
    const d = died[0]; tone = "sober";
    text = died.length > 1 ? `${died.map(x => x.name).join(" và ")} đã mất trong mười năm qua. Bạn còn đây.` : `${d.name} (${d.country}) mất năm ${d.deathAge} tuổi vì ${d.cause}. Bạn còn đây.`;
  } else if (a >= 20 && me.ip >= 85) { tone = "good"; text = `${a} tuổi, ${L.income > 0 ? "bạn" : "nhà bạn"} kiếm nhiều hơn ${me.ip}% người ở ${L.c.n}.`; }
  else if (a >= 20 && me.ip <= 15) { tone = "sober"; text = `${a} tuổi, ${L.income > 0 ? "bạn" : "nhà bạn"} nghèo hơn ${100 - me.ip}% người ở ${L.c.n}.`; }
  else {
    const withH = [me].concat(alive.filter(p => p.h != null));
    if (withH.length >= 3) {
      const rank = withH.slice().sort((x, y) => y.h - x.h).findIndex(x => x.me) + 1;
      if (rank === 1) { tone = "good"; text = `Trong năm em bé chào đời cùng giây, ở tuổi ${a} bạn đang vui nhất.`; }
      else if (rank === withH.length) { tone = "sober"; text = `Trong năm em bé chào đời cùng giây, ở tuổi ${a} bạn đang buồn nhất.`; }
      else { const above = withH.slice().sort((x, y) => y.h - x.h)[rank - 2]; tone = "plain"; text = `${a} tuổi. Trong năm em bé cùng giây, bạn vui thứ ${rank}; ${above.name} (${above.country}) đứng ngay trên bạn.`; }
    } else { tone = me.hp >= 60 ? "good" : me.hp <= 30 ? "sober" : "plain"; text = `${a} tuổi. Bạn vui hơn khoảng ${me.hp}% người cùng tuổi ở nơi như bạn.`; }
  }
  return { age: a, text, tone, me, peers };
}

/* Gọi trong render() sau stepYear (index.html). Lưu thẻ vào L.decades (chỉ giao diện dùng), không gọi log() để không đụng L.seen. */
function decadeTick(L) {
  if (!L.alive || L.age < 10 || L.age % 10 !== 0) return null;
  L.decades = L.decades || {}; if (L.decades[L.age]) return null;
  const card = decadeCard(L); L.decades[L.age] = card; return card;
}

/* Băng rôn trong nhật ký: chèn làm <li> đầu tiên của nhóm năm đó trong renderLog(). */
function decadeHTML(card) {
  const n = Math.max(90, card.age + 10);
  const bar = p => `<span class="dk-p${p.me ? " me" : ""}${p.alive ? "" : " dead"}" title="${esc(p.name)}, ${esc(p.country)}: ${esc(p.me ? "bạn" : p.line)}"><i style="--a:${Math.round((p.alive ? card.age : p.deathAge) / n * 100)}%"></i><b>${esc(p.me ? "Bạn" : p.name.split(" ")[0])}</b></span>`;
  return `<li class="e decade ${card.tone}"><span class="dk-t">${esc(card.text)}</span><span class="dk-bars" aria-hidden="true">${[card.me].concat(card.peers).map(bar).join("")}</span></li>`;
}

/* ================= TẤM BIA (Giai đoạn 1) =================
   Ảnh dọc 1080×1920 để đăng Story. Vẽ trên <canvas>, hiện thành <img src=dataURL> trong hộp thoại để người chơi nhấn giữ mà lưu
   (trang artifact chặn tải file). Giấy hồ sơ sáng, mực in xanh lục đậm, mực bút xanh cho những gì bạn làm, dấu đỏ cho cái chết.
   Phụ thuộc (đã có trong trang): G, Argon, eulogyVN, LW, castName, fmtPPP (không dùng), rulerN.
   Dùng ở ending(): nút #tombBtn gọi showTombstone(L, G.cf).

   API
     tombstoneData(L, cf)      → dữ liệu thuần (test được ở node)
     nearMissOf(L, cf)         → { age, text, key, index | removeAct } | null   (dòng "Suýt nữa thì…", dùng chung với màn kết)
     rememberedBy(L)           → { id, name, role, note, sign, weight } | null   (người nhớ bạn nhất)
     tombstoneCanvas(L, cf)    → Promise<HTMLCanvasElement>
     showTombstone(L, cf, btn) → mở hộp thoại; trả về Promise<void>
*/
const TOMB = {
  W: 1080, H: 1920, X: 96,
  ink: { paper: "#E3E8E1", sheet: "#EEF1EB", print: "#24302B", muted: "#56655D", rule: "#BAC6BC", soft: "#D3DBD3", pen: "#2343B0", seal: "#B8282B", good: "#2C7548" },
  serif: "Literata", sans: '"Be Vietnam Pro"'
};

/* ---------- Dữ liệu ---------- */
/* Câu văn bia đáng in: bỏ câu mở đầu chỉ lặp lại tên nước và số năm ("Bạn sống 64 năm ở Trung Quốc."), ưu tiên câu nói về người khác. */
function epitaphLine(eul) {
  const cands = [];
  (eul || []).forEach((p, k) => {
    const ss = String(p || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?…])\s+(?=[A-ZÀ-ỸĐ"“])/);
    ss.forEach((s, i) => { if (/\?$/.test(s)) { if (ss[i + 1]) cands.push({ s: s + " " + ss[i + 1], k, q: 1 }); } else cands.push({ s, k, q: 0 }); });
  });
  const stub = /^Bạn sống \d+ năm ở [^,.]+\.$/;
  const score = c => (stub.test(c.s) ? -9 : 0) + (/nhớ|tin bạn|không bao giờ|trắng tay|khá lên|nhắc|đến cuối|ngồi vào bàn|đi qua/.test(c.s) ? 3 : 0) + (c.s.length >= 30 && c.s.length <= 160 ? 1 : -2) + c.q * 1.5;
  const best = cands.sort((a, b) => score(b) - score(a))[0];
  return best ? best.s.replace(/\s*\(năm bạn (\d+) tuổi\)/g, " năm bạn $1 tuổi") : "";
}
function firstSentence(s) { const t = String(s || "").replace(/\s+/g, " ").trim(); const m = t.match(/^(.+?[.!?…])(\s|$)/); return m ? m[1] : t; }

/* Người nhớ bạn nhất: ký ức có |trọng số| lớn nhất còn sống trong sổ ký ức, ưu tiên người còn sống, có ghi chú cụ thể. */
function rememberedBy(L) {
  if (!L.lw || !L.lw.mem) return null;
  let best = null;
  for (const [id, arr] of L.lw.mem.tokens) {
    const m = L.lw.cast.get(id); if (!m || m.absent) continue;
    for (const t of arr) {
      const score = Math.abs(t.weight) * (m.alive ? 1 : 0.6) * (t.note ? 1 : 0.7);
      if (!best || score > best.score) best = { id, name: m.name, role: m.role, label: m.label, alive: m.alive, note: t.note || LW.TAG_VN[t.tag] || "", sign: Math.sign(t.weight), weight: t.weight, age: t.age, score };
    }
  }
  if (!best || Math.abs(best.weight) < 0.12) return null;
  best.note = best.note.replace(/\s*\(năm bạn \d+ tuổi\)\s*$/, "");
  return best;
}
function rememberedLine(r) {
  if (!r) return "";
  const who = `${r.name} (${roleVN(r)})`;
  return r.sign > 0 ? `${who}, vì ${r.note}.` : `${who}, vẫn chưa quên ${r.note}.`;
}

/* Dòng "Suýt nữa thì…": chọn nhánh khác biệt rõ nhất trong counterfactuals(L). cf có thể null (đời quá ngắn, không có ngã rẽ). */
function nearMissOf(L, cf) {
  if (!cf || !cf.alts || !cf.alts.length) return null;
  const b = cf.base;
  const scored = cf.alts.map(a => {
    const s = a.life, dAge = s.age - b.age, dNet = s.net - b.net, dKids = s.kids - b.kids;
    const rel = Math.abs(dNet) / Math.max(1000, Math.abs(b.net));
    const w0 = Math.abs(dAge) * 3 + Math.min(10, rel * 4) + Math.abs(dKids) * 2 + (s.job !== b.job ? 2 : 0);
    return { a, dAge, dNet, dKids, w: w0 * (a.mark.age < 12 ? 0.5 : 1) }; // ngã rẽ thời thơ ấu kém "sắc" hơn: ưu tiên ngã rẽ khi đã lớn
  }).sort((x, y) => y.w - x.w);
  const t = scored[0]; if (!t || t.w < 2) return null;
  const a = t.a, s = a.life, age = a.mark.age;
  const what = a.typedProactive ? `nếu không “${a.mark.choice}”` : `nếu chọn “${a.altLabel}”`;
  let out;
  if (Math.abs(t.dAge) >= 3) out = `bạn đã sống đến ${s.age} tuổi`;
  else if (s.job !== b.job && s.job && s.job !== "không nghề") out = `bạn đã làm ${s.job}`;
  else if (Math.abs(t.dKids) >= 1) out = `bạn đã có ${s.kids} con thay vì ${b.kids}`;
  else out = t.dNet > 0 ? `bạn đã để lại nhiều hơn ${fmtPPP(t.dNet)}` : `bạn đã nghèo hơn ${fmtPPP(-t.dNet)}`;
  const text = `Năm ${age} tuổi, ${what}, ${out}.`;
  return a.typedProactive ? { age, text, key: a.mark.key, removeAct: (L.actLog || []).find(x => x.kind === "proactive" && x.key === a.mark.key)?.seq } : { age, text, key: a.mark.key, index: a.mark.alt_indices[0] };
}

function lifeCode(L) { return "CD-" + ((L.seed >>> 0).toString(36).toUpperCase()).padStart(7, "0"); }

function tombstoneData(L, cf) {
  const n = typeof rulerN === "function" ? rulerN(L) : Math.max(90, L.age + 1, L.le + 15);
  const cells = [];
  for (let i = 0; i < n; i++) { const m = L.map[i - 1]; cells.push(i === 0 ? { h: 50 } : m && m.end ? { end: true } : m ? { h: m.h } : null); }
  const eul = typeof eulogyVN === "function" ? eulogyVN(L) : [];
  const peers = (G.peers || []).map(p => ({ name: p.name, country: p.c.n, age: p.deathAge, cause: p.cause }));
  const nm = nearMissOf(L, cf);
  return {
    name: L.name, birth: L.birthC.n, death: L.migrated ? L.c.n : null, age: L.age, cause: L.cause, le: L.le, n, cells,
    epitaph: epitaphLine(eul) || firstSentence(eul && eul[0]), nearMiss: nm ? nm.text : "", remembered: rememberedLine(rememberedBy(L)),
    peers, seasons: canonSeasonsOf(L).filter(x => x.reason !== "running").map(x => ({ vn: x.vn, color: x.color })),
    code: lifeCode(L), year: new Date().getFullYear(), stamp: L.wishDone === true ? "Đã thành" : L.wishDone === false ? "Dang dở" : "Khép sổ"
  };
}

/* ---------- Vẽ ---------- */
function _wrap(ctx, text, maxW, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur);
  if (maxLines && lines.length > maxLines) { const keep = lines.slice(0, maxLines); let last = keep[maxLines - 1]; while (last.length && ctx.measureText(last + "…").width > maxW) last = last.replace(/\s*\S+$/, ""); keep[maxLines - 1] = last + "…"; return keep; }
  return lines;
}
function _mix(a, b, t) { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
function _rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

async function _fontsReady(d) {
  if (!document.fonts || !document.fonts.load) return;
  const all = [d.name, d.epitaph, d.nearMiss, d.remembered, d.birth, d.cause, ...d.peers.map(p => p.name + p.country), ...(d.seasons || []).map(s => s.vn)].join(" ") + " 0123456789 Một Lần Chào Đời Suýt nữa Cùng giây ấy Người nhớ bạn nhất Các mùa";
  const T = TOMB.serif, S = TOMB.sans;
  try {
    await Promise.race([Promise.all([
      document.fonts.load(`600 100px ${T}`, all), document.fonts.load(`italic 400 50px ${T}`, all), document.fonts.load(`400 40px ${T}`, all),
      document.fonts.load(`400 36px ${S}`, all), document.fonts.load(`600 36px ${S}`, all), document.fonts.load(`700 30px ${S}`, all)
    ]), new Promise(r => setTimeout(r, 4000))]);
    await document.fonts.ready;
  } catch (e) { /* vẽ bằng font dự phòng */ }
}

/* Bố cục co giãn: thử từ rộng rãi đến gọn nhất cho tới khi mọi thứ nằm trên vạch chân giấy. Mục tùy chọn bị bỏ theo thứ tự: dòng "Các mùa" → người nhớ → dòng 3 của "suýt nữa". */
const TOMB_PRESETS = [
  { name: 112, cell: 30, rg: 8, epi: 52, epiLines: 3, body: 40, peer: 70, rem: true },
  { name: 100, cell: 24, rg: 6, epi: 48, epiLines: 3, body: 38, peer: 62, rem: true },
  { name: 92, cell: 20, rg: 5, epi: 44, epiLines: 3, body: 36, peer: 56, rem: true },
  { name: 88, cell: 18, rg: 4, epi: 42, epiLines: 2, body: 34, peer: 54, rem: false }
];
async function tombstoneCanvas(L, cf) {
  const d = tombstoneData(L, cf); await _fontsReady(d);
  const cv = document.createElement("canvas"); cv.width = TOMB.W; cv.height = TOMB.H;
  const c = cv.getContext("2d");
  // Bố cục chọn như khi không có dòng "Các mùa"; dòng mùa chỉ thêm vào nếu bố cục ấy vẫn vừa (không đẩy mục khác ra ngoài).
  const base = { ...d, seasons: [] }, fits = P => _drawTomb(c, base, L.seed, P) <= TOMB.H - 200;
  const P = TOMB_PRESETS.find(fits) || TOMB_PRESETS[TOMB_PRESETS.length - 1];
  if (!(d.seasons && d.seasons.length && _drawTomb(c, d, L.seed, P) <= TOMB.H - 200)) _drawTomb(c, base, L.seed, P);
  return cv;
}
function _drawTomb(c, d, seed, P) {
  const { W, H, X, ink } = TOMB, T = TOMB.serif, S = TOMB.sans, CW = W - 2 * X;
  c.textBaseline = "alphabetic"; c.textAlign = "left";
  // Giấy: nền, hạt giấy cố định theo seed, khung kẻ đôi như sổ hộ tịch
  c.fillStyle = ink.paper; c.fillRect(0, 0, W, H);
  const r = _rng(seed ^ 0x51ab); c.fillStyle = "rgba(36,48,43,0.035)";
  for (let i = 0; i < 9000; i++) c.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6);
  c.strokeStyle = ink.print; c.lineWidth = 3; c.strokeRect(44, 44, W - 88, H - 88); c.lineWidth = 1; c.strokeRect(56, 56, W - 112, H - 112);

  let y = 150;
  c.font = `600 30px ${S}`; c.fillStyle = ink.muted; c.fillText("Trích lục một cuộc đời", X, y);
  c.textAlign = "right"; c.font = `400 30px ${S}`; c.fillText(`số hồ sơ ${d.code}`, W - X, y); c.textAlign = "left";
  y += 28; c.fillStyle = ink.print; c.fillRect(X, y, CW, 3);

  // Tên: một dòng nếu được (≥ 76px), không thì hai dòng
  y += 34;
  let fs = P.name, nameLines;
  c.font = `600 ${fs}px ${T}`;
  while (fs > 76 && c.measureText(d.name).width > CW) { fs -= 4; c.font = `600 ${fs}px ${T}`; }
  if (c.measureText(d.name).width <= CW) nameLines = [d.name];
  else { fs = P.name; for (; fs >= 60; fs -= 6) { c.font = `600 ${fs}px ${T}`; nameLines = _wrap(c, d.name, CW); if (nameLines.length <= 2) break; } }
  c.fillStyle = ink.pen; for (const ln of nameLines) { y += fs * 0.98; c.fillText(ln, X, y); }
  y += 58; c.font = `400 ${P.body}px ${S}`; c.fillStyle = ink.print;
  const life = `Sinh ở ${d.birth}${d.death ? `, mất ở ${d.death}` : ""}. Mất năm ${d.age} tuổi vì ${d.cause}.`;
  for (const ln of _wrap(c, life, CW, 2)) { c.fillText(ln, X, y); y += P.body * 1.35; }

  // Thước đời: mỗi hàng một thập kỷ, mỗi ô một năm
  y += 18;
  const rows = Math.ceil(d.n / 10), lab = 70, gap = 8, cw = (CW - lab - 9 * gap) / 10, ch = P.cell, rg = P.rg;
  c.font = `400 ${Math.min(26, ch + 4)}px ${T}`;
  for (let row = 0; row < rows; row++) {
    const yy = y + row * (ch + rg);
    c.fillStyle = ink.muted; c.textAlign = "right"; c.fillText(String(row * 10), X + lab - 18, yy + ch * 0.82); c.textAlign = "left";
    for (let k = 0; k < 10; k++) {
      const i = row * 10 + k; if (i >= d.n) break;
      const xx = X + lab + k * (cw + gap), cell = d.cells[i];
      if (cell && cell.end) c.fillStyle = ink.print;
      else if (cell) c.fillStyle = _mix(ink.rule, ink.pen, Math.max(0.12, Math.min(1, (cell.h - 20) * 0.02)));
      else c.fillStyle = ink.soft;
      c.fillRect(xx, yy, cw, ch);
      if (i === d.le) { c.strokeStyle = ink.seal; c.lineWidth = 4; c.strokeRect(xx + 2, yy + 2, cw - 4, ch - 4); }
    }
  }
  y += rows * (ch + rg) + 4;
  c.font = `400 26px ${S}`; c.fillStyle = ink.muted;
  c.fillText(`Mỗi ô một năm, đậm là năm vui. Viền đỏ: tuổi thọ trung bình (${d.le}).`, X + lab, y + 24);
  y += 64;
  // Các mùa: một dòng, ô màu + tên mùa; không vừa thì dừng ở "+N"
  if (d.seasons && d.seasons.length) {
    let sx = X + lab; const sy = y - 4;
    c.font = `600 26px ${S}`; c.fillStyle = ink.muted; c.fillText("Các mùa:", sx, sy); sx += c.measureText("Các mùa:").width + 18;
    c.font = `400 26px ${S}`;
    for (let k = 0; k < d.seasons.length; k++) {
      const s = d.seasons[k], w = 26 + c.measureText(s.vn).width, more = d.seasons.length - k - 1, moreW = more ? c.measureText(` +${more}`).width + 22 : 0;
      if (sx + w + moreW > W - X) { c.fillStyle = ink.muted; c.fillText(`+${d.seasons.length - k}`, sx, sy); break; }
      c.fillStyle = s.color; c.fillRect(sx, sy - 18, 16, 16);
      c.fillStyle = ink.print; c.fillText(s.vn, sx + 26, sy); sx += w + 22;
    }
    y += 40;
  }

  // Văn bia: một câu, in lớn
  if (d.epitaph) {
    c.font = `italic 400 ${P.epi}px ${T}`; const lines = _wrap(c, d.epitaph, CW - 44, P.epiLines);
    c.fillStyle = ink.seal; c.font = `600 ${P.epi * 2.2}px ${T}`; c.fillText("“", X - 8, y + P.epi * 1.3);
    c.font = `italic 400 ${P.epi}px ${T}`; c.fillStyle = ink.print; y += P.epi * 1.25;
    for (const ln of lines) { c.fillText(ln, X + 44, y); y += P.epi * 1.36; }
    y += 4;
  }
  const section = (label, color) => { c.fillStyle = ink.print; c.fillRect(X, y, CW, 2); y += 44; c.font = `700 30px ${S}`; c.fillStyle = color || ink.print; c.fillText(label, X, y); y += 10; };
  if (d.nearMiss) {
    section("Suýt nữa thì…", ink.pen);
    c.font = `400 ${P.body}px ${T}`; c.fillStyle = ink.print; y += P.body * 1.1;
    for (const ln of _wrap(c, d.nearMiss, CW, P.rem ? 3 : 2)) { c.fillText(ln, X, y); y += P.body * 1.35; }
    y += 8;
  }
  // Bốn em bé cùng giây: thanh đời cùng thang với thước; đỏ chỉ cho em bé không qua tuổi 5
  const people = [{ name: "Bạn", country: d.birth, age: d.age, me: true }].concat(d.peers);
  section("Cùng giây ấy"); y += 14;
  const maxA = Math.max(d.n, ...people.map(p => p.age + 1));
  for (const p of people) {
    c.font = `${p.me ? 700 : 600} 30px ${S}`; c.fillStyle = p.me ? ink.pen : ink.print; c.fillText(p.name, X, y + 26);
    const nw = c.measureText(p.name).width; c.font = `400 28px ${S}`; c.fillStyle = ink.muted; c.fillText(`, ${p.country}`, X + nw, y + 26);
    c.textAlign = "right"; c.font = `600 30px ${S}`; c.fillStyle = ink.print; c.fillText(`${p.age} tuổi`, W - X, y + 26); c.textAlign = "left";
    const by = y + 38; c.fillStyle = ink.soft; c.fillRect(X, by, CW, 9);
    c.fillStyle = p.me ? ink.pen : p.age < 5 ? ink.seal : ink.muted; c.fillRect(X, by, CW * Math.min(1, p.age / maxA), 9);
    y += P.peer;
  }
  if (d.remembered && P.rem) {
    y += 6; section("Người nhớ bạn nhất");
    c.font = `400 ${P.body}px ${T}`; c.fillStyle = ink.print; y += P.body * 1.1;
    for (const ln of _wrap(c, d.remembered, CW, 2)) { c.fillText(ln, X, y); y += P.body * 1.35; }
  }
  const end = y;
  // Chân giấy: tên trò chơi, lời rào, con dấu bên phải
  c.fillStyle = ink.print; c.fillRect(X, H - 190, CW, 2);
  c.font = `600 42px ${T}`; c.fillStyle = ink.print; c.fillText("Một Lần Chào Đời", X, H - 122);
  c.font = `400 25px ${S}`; c.fillStyle = ink.muted; c.fillText("Mô phỏng theo số liệu thật. Không phải người thật.", X, H - 82);
  c.save(); c.translate(W - X - 78, H - 118); c.rotate(-0.21); c.globalAlpha = 0.85; c.strokeStyle = ink.seal; c.fillStyle = ink.seal;
  c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 60, 0, Math.PI * 2); c.stroke();
  c.textAlign = "center"; c.font = `700 24px ${S}`; c.fillText(d.stamp, 0, -2); c.font = `600 21px ${S}`; c.fillText(String(d.year), 0, 26); c.restore();
  return end;
}

/* ---------- Hộp thoại ---------- */
let _tombOpen = null;
async function showTombstone(L, cf, trigger) {
  if (_tombOpen) return;
  const touch = matchMedia("(hover: none)").matches;
  const box = document.createElement("div"); box.className = "tomb-modal"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "tombT");
  box.innerHTML = `<div class="tomb-sheet"><div class="tomb-head"><h2 id="tombT">Tấm bia của ${esc(L.name)}</h2><button class="btn" id="tombClose">Đóng</button></div>
    <div class="tomb-frame"><p class="note" id="tombWait">Đang khắc chữ…</p></div>
    <p class="tomb-hint">${touch ? "Nhấn giữ ảnh để lưu vào máy, rồi đăng lên Story." : "Nhấp chuột phải vào ảnh, chọn “Lưu ảnh thành…” hoặc “Sao chép ảnh”."}</p></div>`;
  document.body.appendChild(box); _tombOpen = box; document.body.classList.add("modal-open");
  const close = () => { box.remove(); _tombOpen = null; document.body.classList.remove("modal-open"); document.removeEventListener("keydown", onKey, true); if (trigger) trigger.focus({ preventScroll: true }); };
  const onKey = e => { if (e.key === "Escape") { e.preventDefault(); close(); } else if (e.key === "Tab") { e.preventDefault(); document.getElementById("tombClose").focus(); } };
  document.addEventListener("keydown", onKey, true);
  box.addEventListener("click", e => { if (e.target === box) close(); });
  document.getElementById("tombClose").onclick = close; document.getElementById("tombClose").focus();
  try {
    const cv = await tombstoneCanvas(L, cf); if (!box.isConnected) return;
    const img = new Image(); img.alt = `Tấm bia: ${L.name}, ${L.birthC.n}, ${L.age} tuổi`; img.src = cv.toDataURL("image/png"); img.className = "tomb-img";
    const fr = box.querySelector(".tomb-frame"); fr.innerHTML = ""; fr.appendChild(img);
    L.tombSaved = true; // để đo chỉ tiêu "≥ 15% số đời lưu tấm bia" khi chơi thử
  } catch (e) { console.error(e); const w = document.getElementById("tombWait"); if (w) w.textContent = "Không vẽ được tấm bia trên trình duyệt này."; }
}

/* Ai đến đám tang: người còn sống có ý kiến ≥ 0,3 (đến) và người có ý kiến ≤ −0,3 hoặc không đến (vắng mặt). Mỗi người một câu từ ký ức mạnh nhất. */
function funeralOf(L) {
  if (!L.lw || !L.ar) return { came: [], away: [] };
  const s = L.ar.state, rows = [];
  for (const m of L.lw.cast.values()) {
    if (!m.alive || m.absent) continue;
    const op = Argon.opinionOf(s, L.lw.mem, m.id);
    const sign = op >= 0 ? 1 : -1, t = Argon.strongestMemory(L.lw.mem, m.id, sign);
    const note = t ? (t.note || LW.TAG_VN[t.tag] || "").replace(/\s*\(năm bạn \d+ tuổi\)\s*$/, "") : "";
    rows.push({ id: m.id, name: m.name, years: L.age + m.age_offset, role: roleVN(m), family: ["mother", "father", "sibling", "spouse", "child"].includes(m.role), op, note, age: t ? t.age : null });
  }
  const came = rows.filter(r => r.op >= 0.3).sort((a, b) => b.op - a.op).slice(0, 5);
  const away = rows.filter(r => r.op <= -0.3).sort((a, b) => a.op - b.op).slice(0, 3);
  return { came, away };
}
function funeralLine(r, came) {
  r = { ...r, role: `${r.role}, ${r.years} tuổi` };
  const when = r.age != null && !/năm (bạn )?\d+ tuổi/.test(r.note) ? ` năm bạn ${r.age} tuổi` : "";
  if (r.note) return came ? `${r.name}, ${r.role}: nhớ ${r.note}${when}.` : `${r.name}, ${r.role}: chưa quên ${r.note}${when}.`;
  return came ? `${r.name}, ${r.role}.` : `${r.name}, ${r.role}, không đến.`;
}

/* ================= CÁC MÙA CỦA ĐỜI BẠN (canon event, Task 8a) =================
   Chỉ đọc L.lw.canon.seasons = [{ id, from, to, reason: "landing" | "cut" | "death", landing }] và L.lw.season (canon.js ghi).
   Không có dữ liệu mùa thì mọi hàm trả rỗng: màn kết, thước đời và Tấm bia giữ nguyên như trước.
     canonSeasonDef(id)  → SeasonDef qua seasonDef(id) của canon.js (id kỳ dị viết hoa kiểu "w_S01") | null
     canonSeasonsOf(L)   → [{ n, id, vn, color, weird, from, to, reason, line }] theo thứ tự; mùa còn chạy lúc chết mà host chưa ghi thì thêm "death"
     seasonSpans(L)      → [{ from, to, color, ahead }] để tô thước đời (mùa đang chạy: phần chưa sống là ahead)
     seasonsEndHTML(L)   → mục "Các mùa của đời bạn" ở màn kết, "" khi không có mùa */
/* Định nghĩa mùa: dùng seasonDef của canon.js (một nguồn duy nhất); chưa có canon.js thì không có mùa nào. */
function canonSeasonDef(id) { return id && typeof seasonDef === "function" ? seasonDef(id) : null; }
function canonSeasonsOf(L) {
  const lw = L && L.lw; if (!lw) return [];
  const raw = lw.canon && Array.isArray(lw.canon.seasons) ? lw.canon.seasons.slice() : [];
  const cur = lw.season;
  if (cur && cur.id && !raw.some(s => s && s.id === cur.id && s.from === cur.from))
    raw.push({ id: cur.id, from: cur.from, to: L.alive ? null : L.age, end: cur.end, reason: L.alive ? "running" : "death", landing: null });
  return raw.filter(s => s && s.id).map((s, i) => {
    const def = canonSeasonDef(s.id);
    const land = def && s.landing ? (def.landings || []).find(x => x.id === s.landing) : null;
    return {
      n: i + 1, id: s.id, vn: def ? def.vn : "Một mùa không tên", color: def && /^#[0-9a-f]{6}$/i.test(def.color) ? def.color : "#56655D",
      weird: def && def.weird ? def.weird : null, from: Number.isFinite(s.from) ? s.from : null, to: Number.isFinite(s.to) ? s.to : null,
      end: Number.isFinite(s.end) ? s.end : null, reason: s.reason || "", line: land ? land.line : ""
    };
  });
}
function seasonAgesVN(s) {
  if (s.from == null) return "";
  if (s.to != null && s.to !== s.from) return `${s.from}–${s.to} tuổi`;
  return s.to != null ? `năm ${s.from} tuổi` : `từ ${s.from} tuổi`;
}
function seasonSpans(L) {
  return canonSeasonsOf(L).filter(s => s.from != null).map(s => {
    if (s.reason === "running") return { from: s.from, to: Math.max(s.from, L.age), color: s.color, aheadTo: s.end != null && s.end > L.age ? s.end : null };
    return { from: s.from, to: s.to != null ? s.to : s.from, color: s.color, aheadTo: null };
  });
}
const SEASON_END_VN = { death: ["dang dở", "seal"], cut: ["bị cắt ngang", "cut"] };
function seasonsEndHTML(L) {
  const ss = canonSeasonsOf(L).filter(s => s.reason !== "running"); if (!ss.length) return "";
  const kind = { sf: "nhánh viễn tưởng", abs: "nhánh phi lý" };
  return `<div class="panel seasons-end"><span class="label">Các mùa của đời bạn</span><ol class="slist">${ss.map(s => {
    const r = SEASON_END_VN[s.reason], ages = seasonAgesVN(s);
    return `<li class="sm" style="--sc:${s.color}"><span class="sm-n">Mùa ${s.n}</span><span class="sm-b"><b>${esc(s.vn)}</b>${s.weird ? ` <span class="sm-k">${kind[s.weird] || ""}</span>` : ""}</span>`
      + `<span class="sm-a">${ages ? esc(ages) : ""}${r ? `<span class="sm-st ${r[1]}">${r[0]}</span>` : ""}</span>${!r && s.line ? `<span class="sm-l">${esc(s.line)}</span>` : ""}</li>`;
  }).join("")}</ol></div>`;
}

/* ================= THỬ LẠI TỪ NĂM N (Giai đoạn 1, dựa trên tua lại tất định của Giai đoạn 0) =================
   resumeFrom(L, fork) → một đời MỚI đang sống, giống hệt L tới ngay trước lựa chọn fork.key; ở đó chọn fork.index
   (hoặc bỏ việc gõ fork.removeAct), rồi dừng ngay khi hết kịch bản để người chơi chơi tiếp bằng tay. Trả null nếu không dựng được.
   Cách làm: cắt L.choices tới lựa chọn rẽ, cắt actLog tới trước chỗ rẽ, tua lại với L.scriptStrict (hết kịch bản thì tắt tự chơi),
   rồi gỡ mọi dấu "đang tua lại". Việc gõ (proactive) trong một năm luôn xảy ra SAU chuỗi quyết định của năm đó
   (ô Tôi muốn khóa khi có tình huống chờ), nên việc gõ ở năm rẽ bị bỏ. */
function resumeFrom(L, fork) {
  if (!L || !L.lw || !fork || !fork.key) return null;
  const ageOf = {}; for (const m of L.lw.cz.marks) if (m.key) ageOf[m.key] = m.age;
  const forkAge = fork.age != null ? fork.age : ageOf[fork.key]; if (forkAge == null) return null;
  const acts0 = L.actLog || [];
  let choices, acts;
  if (fork.removeAct != null) {
    const rec = acts0.find(a => a.seq === fork.removeAct); if (!rec) return null;
    choices = L.choices.filter(c => (ageOf[c.key] ?? 0) <= forkAge);
    acts = acts0.filter(a => a.kind === "meta" || a.age < forkAge || (a.age === forkAge && (a.kind === "ai" || a.kind === "ui" || a.kind === "story" || (a.seq != null && a.seq < rec.seq))));
  } else {
    const idx = L.choices.findIndex(c => c.key === fork.key); if (idx < 0 || fork.index == null) return null;
    choices = L.choices.slice(0, idx + 1);
    const keys = new Set(choices.map(c => c.key));
    acts = acts0.filter(a => a.kind === "meta" || a.age < forkAge || (a.age === forkAge && (a.kind === "ai" || a.kind === "story" || (a.kind === "ui" && a.at <= idx) || (a.kind === "scene" && keys.has(a.key)))));
  }
  acts = JSON.parse(JSON.stringify(acts));
  const script = replayScript(choices, acts);
  const focus = {}; for (const k in L.focusLog || {}) if (+k <= forkAge) focus[k] = L.focusLog[k];
  const was = NAR.enabled; NAR.enabled = false;
  let P;
  try {
    P = createLife(L.seed, { auto: true, script, override: fork.index != null ? { key: fork.key, index: fork.index } : null, focus, replayActs: acts });
    P.replayActs = acts; P.scriptStrict = true;
    let g = 0;
    while (P.alive && P.auto && g++ < 130) {
      stepYear(P);
      if (P.storyDue && !P.pending) { const st = P.storyDue; storyReplay(P); autoChain(P); if (P.storyDue === st) P.storyDue = null; }
      if (P.choices.length >= choices.length && P.age >= forkAge) break;
    }
  } finally { NAR.enabled = was; }
  if (!P || !P.alive || P.age < forkAge) return null;
  // Kiểm: các lựa chọn trước chỗ rẽ phải khớp nguyên bản (Giai đoạn 0 bảo đảm)
  const n = choices.length - (fork.removeAct != null ? 0 : 1);
  for (let i = 0; i < n; i++) if (!P.choices[i] || P.choices[i].key !== choices[i].key) return null;
  // Gỡ dấu tua lại: từ đây là đời thật
  P.auto = false; P.script = null; P.override = null; P.replay = false; P.scriptStrict = false; P.replayActs = null; P.replayDone = null; P.uiDone = null; P.scriptFocus = null;
  P.actLog = acts; P.actSeq = acts.reduce((m, a) => Math.max(m, a.seq || 0), 0);
  P.forkOf = { seed: L.seed, age: forkAge, from: L.age };
  // Nhật ký trước chỗ rẽ lấy từ bản gốc (bản tua lại không ghi dòng "bạn chọn")
  P.log = L.log.filter(e => e.age < forkAge).concat(P.log.filter(e => e.age >= forkAge));
  P.seen = Object.assign({}, L.seen || {});
  if (L.decades) { P.decades = {}; for (const k in L.decades) if (+k < forkAge) P.decades[k] = L.decades[k]; }
  return P;
}
