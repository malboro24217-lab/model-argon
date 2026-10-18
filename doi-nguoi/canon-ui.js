/* ================= MÙA: giao diện (canon event, Task 8a) =================
   Màu nhấn theo mùa đang chạy, banner "Mùa N: …", ô chọn "Độ điên" trong menu.
   Chỉ ĐỌC dữ liệu host do canon.js ghi: L.lw.season = { id, from, end, … } | null, L.lw.canon.seasons, L.weird (0|1|2).
   Tên và màu mùa lấy từ engine qua canonSeasonDef(id) (phase1.js): Argon.SEASONS và Argon.WEIRD[i].season.
   Mọi hàm an toàn khi chưa có document / Argon / L.lw (không ném lỗi, không vẽ gì).

   API
     seasonTheme(L)   → đặt body[data-season], body[data-weird] và biến --season, --season-ink-l, --season-ink-d; L không có mùa thì gỡ hết
     seasonBanner(L)  → điền #season-banner ("Mùa N: tên" + khoảng tuổi + năm thứ mấy + nhịp); không có mùa thì ẩn
     weirdMenu(L)     → ô chọn Độ điên trong menu (#weirdBox); đổi thì gọi window.setWeird(G.life, v) (Task 8b, qua uiOp)
*/
const WEIRD_LEVELS = [[0, "Đời thật", "Không có chuyện kỳ dị: chỉ những mùa có thể xảy ra ngoài đời."], [1, "Phim", "Thỉnh thoảng đời rẽ sang một mùa kỳ dị, như trong phim."], [2, "Điên", "Chuyện kỳ dị đến thường hơn."]];
const _SEASON_VARS = ["--season", "--season-ink-l", "--season-ink-d"];
/* Nền giấy hai giao diện (khớp :root trong index.html): chữ màu mùa phải đọc được trên cả paper lẫn sheet. */
const _SEASON_BG = { l: ["#E3E8E1", "#F6F8F3", "#ECF0E9"], d: ["#0F1512", "#18201C", "#1F2924"] };
const _SEASON_TO = { l: "#24302B", d: "#DCE5DE" };

function _hexRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function _lum(h) { const c = _hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function _contrast(a, b) { const x = _lum(a), y = _lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function _mixHex(a, b, t) { const A = _hexRgb(a), B = _hexRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
/* Màu chữ của mùa cho một giao diện: pha dần về màu chữ in (sáng: tối hơn, tối: sáng hơn) tới khi tương phản ≥ 4,5 trên mọi nền giấy. */
function seasonInk(hex, theme) {
  const bg = _SEASON_BG[theme], to = _SEASON_TO[theme];
  for (let t = 0; t <= 1.0001; t += 0.05) { const c = _mixHex(hex, to, Math.min(1, t)); if (bg.every(b => _contrast(c, b) >= 4.5)) return c; }
  return to;
}
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
}

function seasonBanner(L) {
  if (typeof document === "undefined") return;
  const el = document.getElementById("season-banner"); if (!el) return;
  const now = _seasonNow(L);
  if (!now || !L.alive) { el.hidden = true; el.innerHTML = ""; delete el.dataset.key; return; }
  const { s, def } = now, E = typeof esc === "function" ? esc : (x => String(x));
  const n = ((L.lw.canon && L.lw.canon.seasons) || []).length + 1;
  const from = Number.isFinite(s.from) ? s.from : L.age, end = Number.isFinite(s.end) && s.end > from ? s.end : null;
  const len = end ? end - from : 0, yr = Math.max(0, Math.min(len || Infinity, L.age - from));
  const bi = L.lw.counters && L.lw.counters.season_beat;
  const beat = typeof Argon !== "undefined" && Argon.BEATS && Argon.BEAT_VN && Number.isInteger(bi) ? Argon.BEAT_VN[Argon.BEATS[Math.min(bi, Argon.BEATS.length - 1)]] || "" : "";
  const kind = def.weird === "sf" ? "nhánh viễn tưởng" : def.weird === "abs" ? "nhánh phi lý" : "";
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
  const can = typeof window !== "undefined" && typeof window.setWeird === "function" && !!L && L.alive !== false && !L.replay;
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
  box.title = can ? lv[2] : "Độ điên chưa đổi được lúc này.";
  box.hidden = false;
}
