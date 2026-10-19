// Task 8a: giao diện mùa (màn kết "Các mùa của đời bạn", banner, màu mùa). Run: node doi-nguoi/tests/canon-ui-test.js
// Dùng tests/.head.js; nếu build.py chưa nhúng canon-ui.js (Task 8b nối) thì nạp thẳng file nguồn.
const fs = require('fs'); const assert = require('assert');
const head = fs.readFileSync(__dirname + '/.head.js', 'utf8');
const ui = head.includes('function seasonBanner(') ? '' : fs.readFileSync(__dirname + '/../canon-ui.js', 'utf8');
// Hàm giao diện thật của trang (không nằm trong .head.js): thước đời (rulerN, rulerCells) và một dòng nhật ký (logItem).
const page = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const cut = (a, b) => { const i = page.indexOf(a), j = page.indexOf(b, i); assert(i >= 0 && j > i, 'index.html has ' + a); return page.slice(i, j) + '\n'; };
const pageFns = cut('function rulerN(L)', 'function rulerHTML(') + cut('function logItem(e)', 'function trustOf(');

// DOM giả tối thiểu cho seasonTheme / seasonBanner / weirdMenu.
const mkEl = () => ({ hidden: true, innerHTML: '', dataset: {}, attrs: {}, classList: { add() {}, remove() {} }, offsetWidth: 0, setAttribute(k, v) { this.attrs[k] = v; } });
const banner = mkEl(), weirdBox = mkEl();
weirdBox.querySelector = () => weirdBox.innerHTML ? (weirdBox._sel = weirdBox._sel || { value: '', disabled: false }) : null;
const bodyStyle = {}, body = { dataset: {}, style: { setProperty(k, v) { bodyStyle[k] = v; }, removeProperty(k) { delete bodyStyle[k]; } } };
global.document = { body, getElementById: id => id === 'season-banner' ? banner : id === 'weirdBox' ? weirdBox : null, activeElement: null };

eval(head + ui + pageFns + `
function grow(seed, toAge) { for (let k = 0; k < 400; k++) { const P = createLife(seed + k * 101, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); if (P.alive && P.age === toAge && !P.pending) return P; } throw new Error('no life'); }
const clean = h => !/undefined|NaN|null/.test(h);
const order = h => [...h.matchAll(/Mùa (\\d+)</g)].map(m => +m[1]);

// 1. Không có dữ liệu mùa: không hiện gì thêm.
{ const L = grow(5, 20); delete L.lw.canon; delete L.lw.season;
  assert.strictEqual(seasonsEndHTML(L), '', 'no canon → empty'); assert.deepStrictEqual(canonSeasonsOf(L), []); assert.deepStrictEqual(seasonSpans(L), []);
  const d = tombstoneData(L, null); assert.deepStrictEqual(d.seasons, [], 'tomb: no seasons'); }

// 2. Đời thật: vào mùa, bị cắt ngang, rồi chết giữa mùa (host chưa gọi canonDeath → màn kết tự ghi "dang dở").
const L = grow(77, 30); G.life = L;
if (L.lw.season) exitSeason(L, 'landing'); L.lw.canon.seasons = [];     // bắt đầu từ sổ mùa trống để đánh số 1..k
enterSeason(L, 'ngoi_sao');
enterSeason(L, 'w_S19');                                   // cắt ngang ngoi_sao ngay năm ấy (không bước năm: không để canon event tự nổ chen vào)
assert.strictEqual(L.lw.canon.seasons[0].reason, 'cut', 'first season cut');

// 2a. Banner trong lúc mùa đang chạy.
L.weird = 1; global.window = { setWeird: (P, v) => { P.weird = v; } };
seasonTheme(L); seasonBanner(L); weirdMenu(L);
assert.strictEqual(body.dataset.season, 'w_S19', 'body[data-season]'); assert.strictEqual(body.dataset.weird, 'sf');
for (const k of ['--season', '--season-ink-l', '--season-ink-d', '--season-mark-l', '--season-mark-d']) assert(/^#[0-9a-f]{6}$/.test(bodyStyle[k]), k + ' set');
assert.strictEqual(banner.hidden, false, 'banner shown');
assert(banner.innerHTML.includes('Mùa 2:') && banner.innerHTML.includes(seasonDef('w_S19').vn), 'banner: Mùa 2 + name');
assert(clean(banner.innerHTML), 'banner: no undefined/NaN/null');
assert.strictEqual(L.lw.season.n, 2, 'host n'); L.lw.season.n = 7; seasonBanner(L);
assert(banner.innerHTML.includes('Mùa 7:'), 'banner prefers lw.season.n'); L.lw.season.n = 2;
assert.strictEqual(weirdBox.hidden, false, 'weird box shown when setWeird exists'); assert.strictEqual(weirdBox._sel.value, '1', 'select reflects L.weird'); assert.strictEqual(weirdBox._sel.disabled, false);
weirdBox._sel.onchange && (weirdBox._sel.value = '0', weirdBox._sel.onchange()); assert.strictEqual(L.weird, 0, 'onchange → setWeird'); L.weird = 1;
global.window = {}; weirdBox.innerHTML = ''; weirdMenu(L); assert.strictEqual(weirdBox.hidden, true, 'weird box hidden without setWeird');

// 2b. Ruler: năm cắt ngang và năm vào mùa mới trùng nhau → tô theo mùa mới (findLast).
{ const y = L.lw.season.from, cells = rulerCells(L).cells.split('</i>');
  const cell = cells[y]; assert(cell && cell.includes('title="' + y + ' tuổi"'), 'ruler cell ' + y);
  assert(seasonDef('ngoi_sao').color !== seasonDef('w_S19').color, 'two different colours');
  assert(cell.includes('--sc:' + seasonDef('w_S19').color), 'same-year cut: the page ruler colours the year with the new season: ' + cell); }

// 2b'. Nhật ký: dòng "Bản kia của bạn" (tone other) có nhãn riêng.
{ const li = logItem({ age: 30, text: 'Ở dòng thời gian kia, bạn vừa bước vào Mùa: Ngôi sao.', tone: 'other' });
  assert(li.includes('class="e other"') && li.includes('Bản kia của bạn') && li.includes('Ở dòng thời gian kia'), 'other-self log item: ' + li); }

// 2c. Chết giữa mùa.
L.alive = false;
seasonTheme(L); seasonBanner(L);
assert.strictEqual(banner.hidden, true, 'banner hidden after death'); assert.strictEqual(body.dataset.season, undefined, 'theme cleared');
let h = seasonsEndHTML(L);
assert(h.includes('Các mùa của đời bạn'), 'section title');
assert(h.includes('dang dở'), 'death row: dang dở'); assert(h.includes('bị cắt ngang'), 'cut row: bị cắt ngang');
assert(clean(h), 'end list: no undefined/NaN/null');
assert.deepStrictEqual(order(h), [1, 2], 'n runs 1..k');
// Dedupe thật: sổ mùa đã có bản ghi "death" của đúng mùa đang mở (lw.season vẫn còn) → không thêm dòng thứ hai.
{ const se = L.lw.season; assert(se, 'season still open');
  L.lw.canon.seasons.push({ id: se.id, from: se.from, to: L.age, reason: 'death', landing: null });
  const hd = seasonsEndHTML(L); assert.deepStrictEqual(order(hd), [1, 2], 'death record + open season → one row');
  assert.strictEqual((hd.match(/dang dở/g) || []).length, 1, 'one "dang dở"');
  L.lw.canon.seasons.pop(); }
// host ghi cái chết (canonDeath) → không bị đếm hai lần
canonDeath(L); assert.strictEqual(L.lw.season, null);
h = seasonsEndHTML(L); assert.deepStrictEqual(order(h), [1, 2], 'no duplicate after canonDeath'); assert(h.includes('dang dở') && clean(h));

// 2d. Mùa có chung kết: hiện dòng chung kết; 3 mùa đánh số 1..3.
{ const land = seasonDef('lam_lai').landings[0];
  L.lw.canon.seasons.unshift({ id: 'lam_lai', from: 18, to: 26, reason: 'landing', landing: land.id });
  h = seasonsEndHTML(L);
  assert(h.includes(land.line), 'landing line shown'); assert.deepStrictEqual(order(h), [1, 2, 3], 'n runs 1..3'); assert(clean(h));
  const d = tombstoneData(L, null); assert.deepStrictEqual(d.seasons.map(s => s.vn), ['lam_lai', 'ngoi_sao', 'w_S19'].map(id => seasonDef(id).vn), 'tomb seasons'); }

// 2e. Mùa "lapsed" (chung kết không ra được thẻ, Task 7 M1): nhãn "tự khép lại", không có dòng chung kết.
{ L.lw.canon.seasons.unshift({ id: 'tron_chay', from: 12, to: 17, reason: 'lapsed', landing: null });
  h = seasonsEndHTML(L);
  assert(h.includes('tự khép lại'), 'lapsed row: tự khép lại'); assert.deepStrictEqual(order(h), [1, 2, 3, 4], 'n runs 1..4'); assert(clean(h));
  L.lw.canon.seasons.shift(); }

// 3. Màu: mọi mùa có chữ ≥ 4,5 và vạch ≥ 3 trên mọi nền giấy của cả hai giao diện.
{ let n = 0;
  for (const def of [...Argon.SEASONS, ...Argon.WEIRD.map(b => b.season)]) {
    for (const t of ['l', 'd']) for (const bg of _SEASON_BG[t]) {
      assert(_contrast(seasonInk(def.color, t), bg) >= 4.5, def.id + ' ink ' + t);
      assert(_contrast(seasonMark(def.color, t), bg) >= 3, def.id + ' mark ' + t);
    }
    n++;
  }
  assert(n >= 105, 'all seasons checked');
  const [h0] = _hsl('#2f2a6b'), [h1] = _hsl(seasonMark('#2f2a6b', 'd')); assert(Math.abs(h0 - h1) < 4, 'dark mark keeps hue'); }

console.log('PASS canon-ui-test');
`);
