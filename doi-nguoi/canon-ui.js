/* ================= MÙA: giao diện (canon event, Task 8a) =================
   Màu nhấn theo mùa đang chạy, banner "Mùa N: …", ô chọn "Độ điên" trong menu.
   Chỉ ĐỌC dữ liệu host do canon.js ghi: L.lw.season = { id, from, end, … } | null, L.lw.canon.seasons, L.weird (0|1|2).
   Tên và màu mùa lấy qua canonSeasonDef(id) (phase1.js), tức seasonDef(id) của canon.js.
   Mọi hàm an toàn khi chưa có document / Argon / L.lw (không ném lỗi, không vẽ gì).

   API
     seasonTheme(L)   → đặt body[data-season], body[data-weird] và biến --season, --season-ink-l/-d (chữ, ≥ 4,5), --season-mark-l/-d
                        (vạch, viền, thanh tiến độ, ≥ 3) cho giấy sáng / tối; L không có mùa thì gỡ hết
     seasonBanner(L)  → điền #season-banner ("Mùa N: tên" + khoảng tuổi + năm thứ mấy + nhịp); không có mùa thì ẩn
     seasonNotes(L)   → thẻ chung kết (L.uiNotes, canon.js ghi lúc mùa đáp xuống): hiện một thẻ nhỏ không chặn, tự tắt; không phải quyết định
     weirdMenu(L)     → ô chọn Độ điên trong menu (#weirdBox); đổi thì gọi window.setWeird(G.life, v) (Task 8b, qua uiOp);
                        chưa có window.setWeird thì ẩn ô
*/
const WEIRD_LEVELS = [[0, "Đời thật", "Không có chuyện kỳ dị: chỉ những mùa có thể xảy ra ngoài đời."], [1, "Phim", "Thỉnh thoảng đời rẽ sang một mùa kỳ dị, như trong phim."], [2, "Điên", "Chuyện kỳ dị đến thường hơn."]];
const _SEASON_VARS = ["--season", "--season-ink-l", "--season-ink-d", "--season-mark-l", "--season-mark-d"];
/* Nền giấy hai giao diện (khớp :root trong index.html): chữ màu mùa phải đọc được trên cả paper lẫn sheet. */
const _SEASON_BG = { l: ["#E3E8E1", "#F6F8F3", "#ECF0E9"], d: ["#0F1512", "#18201C", "#1F2924"] };
const _SEASON_TO = { l: "#24302B", d: "#DCE5DE" };

function _hexRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function _lum(h) { const c = _hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function _contrast(a, b) { const x = _lum(a), y = _lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function _hsl(h) {
  const [r, g, b] = _hexRgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1)), hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(hh * 60 + 360) % 360, s, l];
}
function _hslHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}
/* Màu mùa đọc được trên giấy của một giao diện: giữ sắc độ (hue, độ bão hòa), chỉ đổi độ sáng
   (giấy sáng: tối dần, giấy tối: sáng dần) tới khi tương phản ≥ min trên mọi nền giấy.
   min 4,5 cho chữ (seasonInk), 3 cho vạch, viền, thanh tiến độ (seasonMark). */
function seasonInk(hex, theme, min) {
  const bg = _SEASON_BG[theme], need = min || 4.5, ok = c => bg.every(b => _contrast(c, b) >= need);
  if (ok(hex)) return hex.toLowerCase();
  const [h, s, l0] = _hsl(hex), dir = theme === "d" ? 1 : -1;
  for (let l = l0; l >= 0 && l <= 1; l += dir * 0.01) { const c = _hslHex(h, s, Math.min(1, Math.max(0, l))); if (ok(c)) return c; }
  return _SEASON_TO[theme];
}
function seasonMark(hex, theme) { return seasonInk(hex, theme, 3); }
function _seasonNow(L) {
  const s = L && L.alive !== false && L.lw && L.lw.season;
  if (!s || !s.id || typeof canonSeasonDef !== "function") return null;
  const def = canonSeasonDef(s.id);
  return def ? { s, def } : null;
}

function seasonTheme(L) {
  if (typeof document === "undefined" || !document.body) return;
  const b = document.body, now = _seasonNow(L), hex = now && /^#[0-9a-f]{6}$/i.test(now.def.color) ? now.def.color : null;
  if (!hex) {
    if (b.dataset.season != null) { delete b.dataset.season; delete b.dataset.weird; for (const p of _SEASON_VARS) b.style.removeProperty(p); }
    return;
  }
  if (b.dataset.season === now.def.id) return;
  b.dataset.season = now.def.id;
  if (now.def.weird) b.dataset.weird = now.def.weird; else delete b.dataset.weird;
  b.style.setProperty("--season", hex);
  b.style.setProperty("--season-ink-l", seasonInk(hex, "l"));
  b.style.setProperty("--season-ink-d", seasonInk(hex, "d"));
  b.style.setProperty("--season-mark-l", seasonMark(hex, "l"));
  b.style.setProperty("--season-mark-d", seasonMark(hex, "d"));
}

function seasonBanner(L) {
  if (typeof document === "undefined") return;
  const el = document.getElementById("season-banner"); if (!el) return;
  const now = _seasonNow(L);
  if (!now || !L.alive) { el.hidden = true; el.innerHTML = ""; delete el.dataset.key; return; }
  const { s, def } = now, E = typeof esc === "function" ? esc : (x => String(x));
  const n = Number.isInteger(s.n) && s.n > 0 ? s.n : ((L.lw.canon && L.lw.canon.seasons) || []).length + 1;
  const from = Number.isFinite(s.from) ? s.from : L.age, end = Number.isFinite(s.end) && s.end > from ? s.end : null;
  // Năm vào mùa là "năm 1" (không có "năm 0"); không vượt quá độ dài mùa.
  const len = end ? end - from : 0, yr = Math.max(1, Math.min(len || Infinity, L.age - from + 1));
  const bi = L.lw.counters && L.lw.counters.season_beat;
  const beat = typeof Argon !== "undefined" && Argon.BEATS && Argon.BEAT_VN && Number.isInteger(bi) ? Argon.BEAT_VN[Argon.BEATS[Math.min(bi, Argon.BEATS.length - 1)]] || "" : "";
  // Nhãn loại nhánh: điện thoại chỉ hiện phần ngắn ("viễn tưởng" / "phi lý") để mùa kỳ dị không chỉ khác nhau ở màu.
  const kind = def.weird === "sf" ? "<span class=\"sb-kf\">nhánh </span>viễn tưởng" : def.weird === "abs" ? "<span class=\"sb-kf\">nhánh </span>phi lý" : "";
  const ages = end ? `${from}–${end} tuổi` : `từ ${from} tuổi`;
  const pct = len ? Math.round(yr / len * 100) : 0;
  el.setAttribute("aria-label", `Mùa ${n}: ${def.vn}, ${ages}`);
  el.innerHTML = `<div class="sb-head"><h2 class="sb-t"><span class="sb-n">Mùa ${n}:</span> <span class="sb-name">${E(def.vn)}</span></h2>${kind ? `<span class="sb-kind">${kind}</span>` : ""}</div>
    <div class="sb-meta"><span class="sb-ages">${ages}</span>${len ? `<span class="sb-yr">năm ${yr}/${len}</span>` : ""}${beat ? `<span class="sb-beat">${E(beat)}</span>` : ""}</div>
    ${len ? `<div class="sb-track" aria-hidden="true"><i style="width:${pct}%"></i></div>` : ""}`;
  const key = s.id + "@" + from;
  if (el.dataset.key !== key) { el.dataset.key = key; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
  el.hidden = false;
}

function weirdMenu(L) {
  if (typeof document === "undefined") return;
  const box = document.getElementById("weirdBox"); if (!box) return;
  const v = L && (L.weird === 0 || L.weird === 1 || L.weird === 2) ? L.weird : 1;
  const has = typeof window !== "undefined" && typeof window.setWeird === "function";
  if (!has) { box.hidden = true; return; }   // chưa có setWeird (Task 8b): không hiện một ô bấm không được
  const can = !!L && L.alive !== false && !L.replay;
  let sel = box.querySelector("select");
  if (!sel) {
    box.innerHTML = `<label for="weirdSel">Độ điên</label><select id="weirdSel">${WEIRD_LEVELS.map(([k, n, h]) => `<option value="${k}" title="${h}">${n}</option>`).join("")}</select>`;
    sel = box.querySelector("select");
    sel.onchange = () => {
      const life = typeof G !== "undefined" && G ? G.life : L, nv = +sel.value;
      if (typeof window.setWeird === "function" && life) window.setWeird(life, nv);
      weirdMenu(life);
    };
  }
  if (document.activeElement !== sel) sel.value = String(v);
  sel.disabled = !can;
  const lv = WEIRD_LEVELS.find(x => x[0] === v);
  box.title = can ? lv[2] : "Độ điên chưa đổi được lúc này.";   // đời đã hết hoặc đang tua lại
  box.hidden = false;
}

/* Thẻ chung kết: mỗi ghi chú hiện đúng một lần (đánh dấu shown trên ghi chú, không đụng mô phỏng). Không chặn đồng hồ, không nhận phím. */
function seasonNotes(L) {
  if (typeof document === "undefined" || !document.body || !L || !Array.isArray(L.uiNotes)) return;
  const note = L.uiNotes.find(x => x && !x.shown && x.kind === "landing"); if (!note) return;
  note.shown = true;
  const E = typeof esc === "function" ? esc : (x => String(x));
  let el = document.getElementById("landing-card");
  if (!el) { el = document.createElement("div"); el.id = "landing-card"; el.className = "landing-card"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); el.onclick = () => el.classList.remove("show"); }
  const kind = note.weird === "sf" ? " · nhánh viễn tưởng" : note.weird === "abs" ? " · nhánh phi lý" : "";
  el.innerHTML = `<p class="lc-h">${note.n ? `Mùa ${note.n} khép lại` : "Một mùa khép lại"}: ${E(note.vn)}${kind}</p><p class="lc-t">${E(note.line)}</p>`;
  if (/^#[0-9a-f]{6}$/i.test(note.color || "")) {
    const th = document.documentElement.dataset.theme, dark = th === "dark" || (th !== "light" && typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
    el.style.borderLeftColor = seasonMark(note.color, dark ? "d" : "l");
  }
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(seasonNotes.t); seasonNotes.t = setTimeout(() => el.classList.remove("show"), 7000);
}
