/* Đo các chuẩn §8 của canon-event trên N đời tự chơi, không giao diện.
   Chạy: node argon/tools/canon-stats.js doi-nguoi/tests/.head.js [số đời=200] [weird=1]
     weird = 0 (Đời thật) | 1 (Phim) | 2 (Mơ): đặt L.weird ngay sau khi sinh (cả lúc tua lại, nếu có).
   Chạy 3 lần (0/1/2) để có weirdLifeShare cho cả ba mức. Đặt CANON_STATS_NO_BASELINE=1 để bỏ lượt đo baseline (nhanh gấp đôi khi cân chỉnh).
   Đời thứ i dùng seed i*7919+17 (giống divergence.js), nên các lần chạy so sánh được với nhau.
   CANON_STATS_SEED_OFFSET=<n> cộng n vào mọi seed (bộ seed thứ hai, để xác nhận một lần cân chỉnh không chỉ khớp bộ seed đầu).

   Cách đo (ghi rõ để người sau không phải đoán):
   - Dữ liệu host (Task 7): L.lw.canon = { n, last, seasons: [{id, from, to, reason, landing}] }, L.lw.season, L.lw.plants,
     L.weird, L.lw.history (id "canon_*" là canon event, "ss_*" thẻ mùa).
   - canonPerLife: L.lw.canon.n lúc đời kết thúc. shareTwoPlusAt60 chỉ tính các đời sống tới >= 60.
     Có thêm canonPerLifeAt60 (min/p50/max riêng cho các đời đó), minGapYears (khoảng cách nhỏ nhất giữa hai canon event, chuẩn >= 8).
   - seasonShareAdult: sau mỗi stepYear mà tuổi tăng và >= 18, năm đó tính "trong mùa" nếu L.lw.season != null lúc cuối năm.
     (Tương đương nửa mở [from, to): năm vào mùa tính, năm mùa kết thúc không tính.) Gộp trên mọi đời: tổng năm trong mùa / tổng năm >= 18.
   - Chỗ trống của canon event (fromPlayerShare, combos): công cụ bọc Argon.generateCanon bằng một hàm ghi lại sự kiện nó trả về
     (ev.slots = { who, what, fromPlayer }, ev.doors, ev.seed). Host gọi Argon.generateCanon lúc chạy nên bọc được; không đổi kết quả.
     fromPlayerShare = số canon event có slots.fromPlayer >= 1 / tổng canon event. Vật gài không bao giờ bị dùng hết (trước Task 20c)
     nên số này gần như luôn 1.0; fromPlayerFreshShare chặt hơn: chỉ tính khi vật gài điền chỗ được gieo SAU canon event trước đó.
     Nếu một canon event không có bản ghi (host gọi theo đường khác), dùng cách dự phòng: chụp L.lw.plants trước mỗi năm, rồi xem
     mầm có sẵn có khớp who.plants / what.plants của mầm canon (Argon.CANON_SEEDS) hay không; mầm không tra được (nhánh kỳ dị) tính
     "có" khi trước năm đó có bất kỳ vật gài nào. Số sự kiện đi theo đường dự phòng in ở events.fallback.
   - combos: số bộ (seed, vai của người ở slots.who, loại vật ở slots.what, bộ loại cửa đã đưa ra, mùa người chơi thực sự vào sau đó)
     khác nhau. Vật là loại chứ không phải khóa riêng của đời (asset:<loại> hoặc loại mầm), nếu không tổ hợp nào cũng "khác".
     combosNoSeason bỏ thành phần mùa.
   - axisShare: tỉ lệ canon event theo trục nổ (8 trục, kể cả 0). seedShare: tỉ lệ theo mầm (8 mầm, "weird" = biến cố trục Kỳ dựng từ nhánh kỳ dị).
   - seasonEnds: số mùa theo cách kết (landing | cut | lapsed | death; running = còn chạy lúc hết vòng đo). eventsWithWeirdDoor: canon event có ít nhất một cửa kỳ dị.
   - weirdLifeShare: tỉ lệ đời từng vào một mùa kỳ dị (id mùa bắt đầu "w_", tính cả mùa đang chạy lúc chết) ở mức weird đã chọn.
   - decisionsP50: trung vị L.choices.length cuối đời, đúng cách micro-test.js đo "decisions_p50" (chuẩn 120-130).
     KHÔNG dùng L.lw.decisions: livingYear đặt nó về 0 mỗi năm, nó chỉ là bộ đếm trong năm (đối chiếu với lw.budget).
   - brokeShare: tỉ lệ đời có L.bankrupt > 0 (vỡ nợ, cùng khái niệm money-test.js); đối chiếu "main + 0.05" bằng trường baseline.
   - baseline: chạy lại đúng N đời với canon bị tắt. Host chưa có công tắc riêng, nên tắt bằng cách cho Argon.generateCanon luôn trả null
     (dueAxis vẫn chạy, nhưng không có canon event nào nổ, nên không có mùa). Nếu host không hề gọi hàm này thì baseline = null.
     Đời baseline không đồng nhất với đời main (canon đổi quyết định về sau), nhưng cùng seed nên đủ để so brokeShare và decisionsP50.
   Chưa có dữ liệu canon (trước Task 7): in { ok:false, noCanonData:true, message } rồi thoát với mã 0. */
import fs from 'node:fs'; // argon/package.json có "type": "module", nên dùng import (require sẽ lỗi)
eval(fs.readFileSync(process.argv[2], 'utf8') + '\n;(' + function () {
  const NL = +(process.argv[3] || 200), WEIRD = process.argv[4] === undefined ? 1 : +process.argv[4];
  const SEED_OFFSET = +(process.env.CANON_STATS_SEED_OFFSET || 0);   // bộ seed thứ hai để xác nhận (cân chỉnh tiền 2026-10-19 dùng 1000003)
  if (![0, 1, 2].includes(WEIRD)) { console.log(JSON.stringify({ ok: false, error: 'weird phải là 0, 1 hoặc 2' })); return; }

  // --- đặt L.weird lúc sinh (cả khi tua lại) ---
  const baseCreate = createLife;
  createLife = function (seed, opts) { const L = baseCreate(seed, opts); L.weird = WEIRD; return L; };

  // --- ghi lại canon event do Argon.generateCanon trả về; có thể tắt để đo baseline ---
  let recorded = [], genCalls = 0, genOff = false;
  const realGen = Argon.generateCanon;
  if (typeof realGen === 'function') {
    const wrapped = function () { genCalls++; if (genOff) return null; const ev = realGen.apply(this, arguments); if (ev) recorded.push(ev); return ev; };
    Argon = Object.assign(Object.create(null), Argon, { generateCanon: wrapped });
  }

  const q = (a, p) => { a = [...a].sort((x, y) => x - y); return a.length ? +a[Math.floor(p * (a.length - 1))].toFixed(2) : null; };
  const share = (a, b) => b ? +(a / b).toFixed(3) : null;
  const parseSeed = id => { const m = /^canon_(.+?)[_@](\d+)$/.exec(id); return m ? m[1] : id.replace(/^canon_/, ''); };
  const seedsById = {}; for (const s of (Argon.CANON_SEEDS || [])) seedsById[s.id] = s;
  const plantMatch = (seedId, plantsBefore) => {
    const sd = seedsById[seedId];
    if (!sd) return plantsBefore.length > 0;
    const kinds = [...((sd.who && sd.who.plants) || []), ...((sd.what && sd.what.plants) || [])];
    return plantsBefore.some(p => kinds.includes(p.kind));
  };
  const roleOf = (L, id) => { try { const m = L.lw.cast && L.lw.cast.get && L.lw.cast.get(id); return m && m.role ? m.role : 'khac'; } catch (e) { return 'khac'; } };

  function run(canonOff) {
    genOff = canonOff;
    const out = { lives: 0, noCanon: false, canonN: [], canonN60: [], ageAt: [], over4: 0, minGap: null, adultYears: 0, adultInSeason: 0,
      events: 0, fromPlayer: 0, fallback: 0, mismatch: 0, tuples: new Set(), tuplesNoSeason: new Set(), weird: 0, choices: [], broke: 0, stuck: 0, byAxis: {}, seeds: {}, ends: {}, weirdEvents: 0, under17: 0, fresh: 0 };
    for (let i = 0; i < NL; i++) {
      const L = createLife(i * 7919 + 17 + SEED_OFFSET, { auto: true }); G.life = L;
      if (!L.lw || !L.lw.canon) { out.noCanon = true; return out; }
      recorded = [];
      const plantSnap = {};          // tuổi -> mầm có trước năm đó
      let g = 0, still = 0;
      while (L.alive && g++ < 200) {
        const a0 = L.age; plantSnap[a0 + 1] = (L.lw.plants || []).map(p => ({ kind: p.kind, weight: p.weight }));
        stepYear(L);
        if (L.age > a0 && L.age >= 18) { out.adultYears++; if (L.lw.season) out.adultInSeason++; }
        if (L.age === a0 && L.alive) { if (++still >= 3) { out.stuck++; break; } } else still = 0;
      }
      out.lives++;
      const cn = L.lw.canon, n = cn.n || 0;
      out.canonN.push(n); out.ageAt.push(L.age); if (L.age >= 60) out.canonN60.push(n); if (n > 4) out.over4++;
      out.choices.push(L.choices.length); if (L.bankrupt > 0) out.broke++;
      const evs = L.lw.history.filter(h => typeof h.id === 'string' && h.id.startsWith('canon_'));
      if (evs.length !== n) out.mismatch++;
      for (let k = 1; k < evs.length; k++) { const gap = evs[k].age - evs[k - 1].age; if (out.minGap === null || gap < out.minGap) out.minGap = gap; }
      const seasons = [...(cn.seasons || []), ...(L.lw.season ? [{ id: L.lw.season.id, from: L.lw.season.from }] : [])];
      if (seasons.some(s => /^w_/.test(s.id))) out.weird++;
      for (const s of (cn.seasons || [])) out.ends[s.reason] = (out.ends[s.reason] || 0) + 1;
      if (L.lw.season) out.ends.running = (out.ends.running || 0) + 1;
      for (const h of evs) {
        const ev = recorded.filter(e => e.age === h.age).pop();
        const seedId = ev ? ev.seed : parseSeed(h.id);
        out.events++; out.seeds[seedId] = (out.seeds[seedId] || 0) + 1;
        if (h.age < 17) out.under17++;
        if (ev) { if (ev.slots && ev.slots.fromPlayer >= 1) out.fromPlayer++;
          // "mới": vật gài điền chỗ trống được gieo SAU canon event trước đó (hoặc là biến cố đầu tiên), tức biến cố mọc từ lựa chọn gần đây.
          const prev = evs.filter(x => x.age < h.age).pop(), since = prev ? prev.age : -1, sl0 = ev.slots || {};
          const whoPlant = sl0.who ? (L.lw.plants || []).filter(p => p.npc === sl0.who && p.age <= h.age).map(p => p.age) : [];
          const ages0 = [...(sl0.what && sl0.what.kind !== 'asset' && typeof sl0.what.age === 'number' ? [sl0.what.age] : []), ...whoPlant];
          if (sl0.fromPlayer >= 1 && ages0.some(a => a > since)) out.fresh++; }
        else { out.fallback++; if (plantMatch(seedId, plantSnap[h.age] || [])) out.fromPlayer++; }
        const sl = (ev && ev.slots) || {};
        const role = sl.who ? roleOf(L, sl.who) : '-';
        const what = sl.what ? (sl.what.kind === 'asset' ? 'asset:' + sl.what.key : sl.what.kind) : '-';
        const doors = ev ? ev.doors.map(d => d.kind).sort().join('+') : '?';
        const ss = seasons.find(s => s.from === h.age); const chosen = ss ? ss.id : '-';
        out.tuplesNoSeason.add([seedId, role, what, doors].join('|'));
        out.tuples.add([seedId, role, what, doors, chosen].join('|'));
        if (ev) out.byAxis[ev.axis] = (out.byAxis[ev.axis] || 0) + 1;
        if (ev && ev.doors.some(d => d.weird)) out.weirdEvents++;
      }
    }
    return out;
  }

  const m = run(false);
  if (m.noCanon) {
    console.log(JSON.stringify({ ok: false, noCanonData: true, weird: WEIRD,
      message: 'Chưa có dữ liệu canon: L.lw.canon không tồn tại trong bản dựng này (host chưa nối canon-event, Task 7 chưa merge). Không có gì để đo.' }, null, 1));
    return;
  }
  const sixty = m.canonN60;
  const res = {
    ok: true, lives: m.lives, weird: WEIRD, seedOffset: SEED_OFFSET,
    canonPerLife: { min: Math.min(...m.canonN), p50: q(m.canonN, .5), max: Math.max(...m.canonN), shareTwoPlusAt60: share(sixty.filter(x => x >= 2).length, sixty.length) },
    canonPerLifeAt60: { lives: sixty.length, min: sixty.length ? Math.min(...sixty) : null, p50: q(sixty, .5), max: sixty.length ? Math.max(...sixty) : null },
    livesOver4: m.over4, minGapYears: m.minGap,
    seasonShareAdult: share(m.adultInSeason, m.adultYears),
    fromPlayerShare: share(m.fromPlayer, m.events), fromPlayerFreshShare: share(m.fresh, m.events),
    events: { total: m.events, fallback: m.fallback, historyVsCanonN_mismatchLives: m.mismatch, byAxis: m.byAxis },
    axisShare: Object.fromEntries(['tien', 'tinh', 'mau', 'danh', 'luat', 'than', 'dat', 'ky'].map(a => [a, share(m.byAxis[a] || 0, m.events) || 0])),
    seedShare: Object.fromEntries((Argon.CANON_SEEDS || []).map(sd => [sd.id, share(m.seeds[sd.id] || 0, m.events) || 0]).concat([['weird', share(Object.entries(m.seeds).filter(([k]) => !seedsById[k]).reduce((t, [, v]) => t + v, 0), m.events) || 0]])),
    seasonEnds: m.ends, eventsWithWeirdDoor: m.weirdEvents, eventsUnder17: m.under17,
    combos: m.tuples.size, combosNoSeason: m.tuplesNoSeason.size,
    weirdLifeShare: share(m.weird, m.lives),
    decisionsP50: q(m.choices, .5), decisionsSource: 'L.choices.length (lw.decisions chỉ đếm trong năm)',
    brokeShare: share(m.broke, m.lives),
    stuckLives: m.stuck, medianAge: q(m.ageAt, .5),
    seedCounts: Object.fromEntries(Object.entries(m.seeds).sort((a, b) => b[1] - a[1]).slice(0, 40)),
    baseline: null
  };
  // baseline: cùng N đời, canon tắt
  const before = genCalls;
  if (process.env.CANON_STATS_NO_BASELINE) { res.baselineNote = 'Bỏ qua baseline (CANON_STATS_NO_BASELINE)'; console.log(JSON.stringify(res, null, 1)); return; }
  const b = run(true);
  if (genCalls > before) {
    res.baseline = { note: 'Argon.generateCanon bị ép trả null; không canon event, không mùa canon', lives: b.lives,
      decisionsP50: q(b.choices, .5), brokeShare: share(b.broke, b.lives), medianAge: q(b.ageAt, .5), canonN_max: Math.max(...b.canonN) };
    res.brokeVsBaseline = +(res.brokeShare - res.baseline.brokeShare).toFixed(3);
  } else res.baselineNote = 'Không thể tắt canon: host không gọi Argon.generateCanon lúc chạy; baseline = null. Đối chiếu brokeShare với số đo trên main.';
  console.log(JSON.stringify(res, null, 1));
}.toString() + ')()');
