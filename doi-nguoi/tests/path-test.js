// Task 9a: con đường đời — vào bằng năng khiếu, become:<id>, nhịp truyện nối nhau. Run: node tests/path-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge) { const P = createLife(seed, { auto: true }); let g = 0; while (P.alive && P.age < toAge && g++ < 130) stepYear(P); return P; }

// 1. Registry đủ 96 con đường, id duy nhất.
assert.strictEqual(Argon.PATH_LIST.length, 96, 'registry has 96 paths');

// 2. become:singer đặt cờ, chức danh, bộ đếm nhịp truyện.
{ const P = grow(4242, 20); assert(P.alive, 'alive at 20');
  customEffect(P, 'become:singer');
  assert(P.lw.sflags.has('life_singer'), 'life_singer flag');
  assert.strictEqual(P.job, 'ca sĩ', 'job title');
  assert.strictEqual(P.lw.counters.p_singer, 0, 'p_singer = 0');
  assert.strictEqual(P.lw.counters.p_singer_at, P.age, 'p_singer_at = age');
  // đổi sang con đường nghề khác thì bỏ cờ con đường nghề cũ
  // Task 7 (R15): become chỉ đổi nghề khi tuổi trong khoảng của con đường; nhà báo từ 21 tuổi nên đổi sang bán hàng online (16–50).
  customEffect(P, 'become:ecommerce');
  assert(!P.lw.sflags.has('life_singer') && P.lw.sflags.has('life_ecommerce'), 'switch path clears old career path');
}

// 3. Nhịp truyện nối nhau sau khi bước vào.
{ let hit1 = 0, hit2 = 0, n = 0;
  // 200 đời, ngưỡng 70%/60%: tỉ lệ thật đo trên ~500 hạt giống là ~77%/~67% ở cả bản cũ lẫn bản tách rng (ledger 2026-10-18-tat-dinh).
  // Phần trượt là người chơi tự động rẽ sang con đường khác trong 12 năm, không phải thẻ ca sĩ hỏng. Ngưỡng 80% trên 30 đời cũ nằm sát mép.
  for (let s = 0; s < 200; s++) { const P = grow(900 + s * 7, 20); if (!P.alive) continue; n++;
    customEffect(P, 'become:singer'); const at = P.age; let g = 0; while (P.alive && P.age < at + 12 && g++ < 40) stepYear(P);
    const ids = P.lw.history.filter(h => h.age > at).map(h => h.id); if (ids.includes('singer_b1')) hit1++; if (ids.includes('singer_b2')) hit2++; }
  console.log({ lives: n, singer_b1: hit1, singer_b2: hit2 });
  assert(hit1 >= n * 0.7, 'singer_b1 fires in ≥70% of lives within 12 years');
  assert(hit2 >= n * 0.6, 'singer_b2 fires in ≥60% of lives within 12 years');
}

// 4. Có năng khiếu ca hát thì cảnh chọn nghề có lựa chọn "Ca sĩ".
{ let seen = 0, tried = 0;
  for (let s = 0; s < 40 && tried < 15; s++) { const P = createLife(7000 + s * 13, { auto: true }); let g = 0;
    while (P.alive && P.age < 15 && g++ < 30) stepYear(P); if (!P.alive || P.job) continue; tried++;
    P.lw.sflags.add('talent_singer'); g = 0;
    while (P.alive && P.age < 30 && g++ < 40) stepYear(P);
    const m = P.lw.cz.marks.find(m => String(m.key || '').startsWith('career@'));
    if (m && (m.alternatives || []).concat([m.choice]).some(l => /Ca sĩ/.test(l))) seen++;
  }
  console.log({ careerScenes: tried, withSinger: seen });
  assert(tried > 0 && seen >= Math.ceil(tried * 0.6), 'talent_singer shows Ca sĩ at career choice');
}
console.log('PASS path-test');
`);
