// Task 20d (ruling R25): lúc vào mùa, host không tự đổi nghề hay tiền khi mùa không khai báo.
// Với mỗi mùa trong 105 mùa: nuôi một đời tự lập, có việc (mùa đang chạy thì cắt trước), gọi enterSeason, rồi so trước / sau:
//   - nghề (L.job) chỉ đổi khi reset.effects khai báo job_* / become / retire;
//   - tiền ròng (L.savings) chỉ đổi khi reset khai báo cash, money, borrow, repay hay di chuyển (move_city / migrate_now);
//   - thu nhập chỉ nhân đúng rules.income (khi reset không có custom đổi thu nhập).
// Run: node doi-nguoi/tests/season-entry-test.js
const fs = require('fs'); const assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
function grow(seed, toAge) {
  for (let k = 0; k < 400; k++) {
    const P = createLife(seed + k * 101, { auto: true }); let g = 0;
    while (P.alive && P.age < toAge && g++ < 130) stepYear(P);
    if (!(P.alive && P.age === toAge && !P.pending && P.income > 0 && P.job && !P.retired && canonIndependent(P))) continue;
    if (P.lw.season) exitSeason(P, 'cut');   // mùa đang chạy: cắt trước khi chụp trạng thái, để so đúng một lần vào mùa
    return P;
  }
  throw new Error('no life');
}
const defs = [...Argon.SEASONS, ...Argon.WEIRD.map(b => b.season)];
assert.strictEqual(defs.length, 105, '105 mùa');
// Di cư (migrate_now, host đổi thành migrate_sure từ Task 8b/I2) là thay đổi nơi ở có khai báo: sang nước mới thì host tìm việc lại (getJob),
// nên nghề đổi theo là hợp lệ. Trước 8b di cư đầu mùa trượt 45% nên hạt giống của xu_nguoi tình cờ không đổi nghề.
const MONEY = /^(borrow|repay|restructure|move_city|migrate_now|migrate_sure|return_home)(:|$)/, JOB = /^(job_[a-z_]+|become|retire|migrate_now|migrate_sure)(:|$)/;
let checked = 0, jobSame = 0, moneySame = 0, incomeExact = 0;
for (const [i, d] of defs.entries()) {
  const P = grow(5000 + i * 37, 30 + (i % 20)); G.life = P;
  const parts = ((d.reset.effects && d.reset.effects.custom) || '').split('|').filter(Boolean);
  const declMoney = d.reset.cash !== undefined || (d.reset.effects && d.reset.effects.money) || parts.some(p => MONEY.test(p));
  const declJob = parts.some(p => JOB.test(p));
  const before = { job: P.job, savings: P.savings, income: P.income };
  assert(enterSeason(P, d.id), d.id + ': enterSeason');
  assert.strictEqual(P.lw.season && P.lw.season.id, d.id, d.id + ': đang ở trong mùa');
  if (!declJob) { assert.strictEqual(P.job, before.job, d.id + ': nghề đổi dù mùa không khai báo (' + before.job + ' → ' + P.job + ')'); jobSame++; }
  if (!declMoney) { assert(Math.abs(P.savings - before.savings) < 1e-6 * Math.max(1, Math.abs(before.savings)), d.id + ': tiền đổi dù mùa không khai báo (' + before.savings + ' → ' + P.savings + ')'); moneySame++; }
  if (!parts.length) {
    const want = before.income * (d.rules.income > 0 ? d.rules.income : 1);
    assert(Math.abs(P.income - want) <= Math.abs(want) * 1e-9 + 1e-9, d.id + ': thu nhập ' + P.income + ' khác ' + want + ' (chỉ được nhân rules.income)');
    incomeExact++;
  }
  checked++;
}
console.log({ checked, jobSame, moneySame, incomeExact });
console.log('season-entry-test: PASS');
`);
