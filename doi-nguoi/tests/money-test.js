/* Kiểm tính năng tiền (spec 2026-10-18-tien-bac §10). Chạy: node doi-nguoi/tests/money-test.js */
const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const N=500;let errs=0,stuck=0,nan=0,neg=0,bankrupt=0,ownHouse40={poor:[0,0],mid:[0,0],rich:[0,0]},moneyCards=0,twoMoneyInYear=0,assetsAtDeath=[],lent=0,repaid=0,lost=0,bought={},refused=0;
const band=g=>g<8000?'poor':g<30000?'mid':'rich';
const moneyIds=new Set(Argon.PATH_STORYLETS.filter(s=>s.meta&&s.meta.kind==='money').map(s=>s.id));
for(let i=0;i<N;i++){try{const P=createLife(i*13+7,{auto:true});let g=0,at40=null;
  while(P.alive&&g++<130){stepYear(P);const h=P.ar&&P.ar.state.holdings;
    if(h){for(const a of h.assets){if(!Number.isFinite(a.value)||!Number.isFinite(a.loan))nan++;if(a.value<0||a.loan<0)neg++;}}
    if(!Number.isFinite(P.savings))nan++;
    if(P.age===40&&h){const b=band(P.c.g);ownHouse40[b][1]++;if(h.assets.some(a=>a.kind==='house'))ownHouse40[b][0]++;}}
  if(P.pending)stuck++;if(P.bankrupt)bankrupt++;
  const ids=P.lw.history.filter(x=>moneyIds.has(x.id));moneyCards+=ids.length;
  const per={};for(const x of ids){per[x.age]=(per[x.age]||0)+1;if(per[x.age]===2)twoMoneyInYear++;}
  const h=P.ar.state.holdings;assetsAtDeath.push(Argon.netWorth(h).assets/Math.max(300,householdIncome(P)));
  lent+=h.receivables.length;repaid+=P.lw.counters.loans_repaid||0;lost+=P.lw.counters.loans_lost||0;
  for(const e of P.log)if(/^Bạn mua /.test(e.text)){const k=e.text.split(' giá')[0].slice(8);bought[k]=(bought[k]||0)+1}else if(/^Bạn định mua/.test(e.text))refused++;
}catch(e){errs++;if(errs<4)console.log(e.stack.split('\\n').slice(0,5).join(' | '))}}
assetsAtDeath.sort((a,b)=>a-b);
const pct=x=>x[1]?Math.round(100*x[0]/x[1])+'% of '+x[1]:'n/a';
const top=Object.entries(bought).sort((a,b)=>b[1]-a[1]).slice(0,12);
console.log({errs,stuck,nan,neg,bankruptLives:bankrupt,moneyCardsPerLife:(moneyCards/N).toFixed(2),twoMoneyInYear,
  ownHouseAt40:{poor:pct(ownHouse40.poor),mid:pct(ownHouse40.mid),rich:pct(ownHouse40.rich)},
  assetsAtDeathYears:{p50:assetsAtDeath[N>>1].toFixed(1),p90:assetsAtDeath[Math.floor(N*.9)].toFixed(1)},loans:{lent,repaid,lost},buyRefused:refused,topBuys:top});
/* Chống cày: mua rồi bán liên tục thì tài sản ròng phải giảm */
{const P=createLife(99,{auto:true});while(P.alive&&P.age<30)stepYear(P);P.savings=Math.max(P.savings,0)+40*householdIncome(P);
 const before=P.savings;for(let k=0;k<200;k++){moneyEffect(P,{buy:{kind:'land',name:'mảnh đất',price:1}});moneyEffect(P,{sell:{kind:'land'}});}
 console.log('churn loses money', P.savings<before, Math.round(before-P.savings));if(!(P.savings<before))errs++;}
/* Chơi lại khớp khi có thao tác tiền */
{const P=createLife(4242,{auto:true});G.life=P;while(P.alive)stepYear(P);const R=replayLife(4242,P.choices,null);
 const ok=R.age===P.age&&Math.round(R.savings)===Math.round(P.savings)&&R.ar.state.holdings.assets.length===P.ar.state.holdings.assets.length;console.log('replay ok',ok);if(!ok)errs++;}
if(errs||stuck||nan||neg||twoMoneyInYear){console.log('FAIL money-test');process.exitCode=1}else console.log('PASS money-test');
`);
