/* Same future-ID metric/seeds as argon/tools/divergence.js, adapted only to this pack's exports.
   Measures openings, not randomly generated fixtures or renamed duplicate IDs. */
const fs=require('fs');
eval(fs.readFileSync(process.argv[2]||'doi-nguoi/tests/.head.js','utf8')+`
const NL=+(process.argv[3]||60),PER=+(process.argv[4]||4), roots=new Set(Argon.TURNING_POINTS.map(s=>s.id));
const rows=[];
for(let i=0;i<NL;i++){
 const P=createLife(i*7919+17,{auto:true});G.life=P;while(P.alive)stepYear(P);
 CF_FOCUS=P.focusLog;const B=replayLife(P.seed,P.choices,null,P.actLog||[]);
 const forks=P.lw.cz.marks.filter(m=>m.key&&m.alt_indices&&m.alt_indices.length&&roots.has(m.storylet)&&m.age<P.age-3);
 const pick=forks.filter((_,k)=>k%Math.max(1,Math.floor(forks.length/PER))===0).slice(0,PER);
 for(const m of pick){
  const alt=m.alt_indices[(i+m.age)%m.alt_indices.length],X=replayLife(P.seed,P.choices,{key:m.key,index:alt},P.actLog||[]);
  const la=B.lw.history.filter(h=>h.age>m.age).map(h=>h.id),lb=new Set(X.lw.history.filter(h=>h.age>m.age).map(h=>h.id));
  rows.push({seed:P.seed,id:m.storylet,age:m.age,laterCount:la.length,laterDiff:la.length?1-la.filter(x=>lb.has(x)).length/la.length:0,dAge:Math.abs(B.age-X.age),dNet:Math.abs(B.savings-X.savings)/Math.max(300,householdIncome(B))});
 }
}
const q=(xs,p)=>{const a=[...xs].sort((a,b)=>a-b);return a.length?a[Math.floor(p*(a.length-1))]:null;};
const byOpening=[...new Set(rows.map(x=>x.id))].map(id=>{const rs=rows.filter(x=>x.id===id);return {id,samples:rs.length,medianLaterDiff:q(rs.map(x=>x.laterDiff),.5)};});
console.log(JSON.stringify({lives:NL,forksMeasured:rows.length,metric:'Fraction of base future storylet IDs absent in the alternative life, after fork age',laterDiff:{p25:q(rows.map(x=>x.laterDiff),.25),p50:q(rows.map(x=>x.laterDiff),.5),p75:q(rows.map(x=>x.laterDiff),.75)},atLeast70:rows.filter(x=>x.laterDiff>=.7).length,openingCoverage:byOpening.length,byOpening,limitations:'One alternative per sampled opening, at most PER openings per life; sparse per-opening coverage does not certify all 200 cards. This report is a quality measurement, not a passing regression test.',rows},null,2));
`);
