const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const common={};let N=0;
for(let i=0;i<40;i++){const P=createLife(i*29+3,{auto:true});G.life=P;let g=0;while(P.alive&&g++<130)stepYear(P);const first=P.lw.cz.marks.find(m=>m.alt_indices&&m.alt_indices.length);if(!first)continue;
 const R=replayLife(P.seed,P.choices,{key:first.key,index:first.alt_indices[0]});N++;
 const b=new Set(R.lw.history.filter(h=>h.age>first.age).map(h=>h.id));
 for(const h of P.lw.history.filter(h=>h.age>first.age))if(b.has(h.id))common[h.id]=(common[h.id]||0)+1;
 if(i<3){const tf=s=>[...s].filter(x=>/^temper|^job_|^origin_/.test(x)).join(',');console.log(first.key, tf(P.lw.sflags),'|',tf(R.lw.sflags), P.age, R.age, P.job, R.job)}}
console.log(N,Object.entries(common).sort((a,b)=>b[1]-a[1]).slice(0,60).map(([k,v])=>k+':'+v).join(' '));
`);
