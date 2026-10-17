const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const lives=[];for(let i=0;i<200;i++){const P=createLife(i*17+5,{auto:true});let g=0;while(P.alive&&g++<130)stepYear(P);if(P.age>=50)lives.push(P)}
const dec=P=>P.choices.length;
let uniq=[],tot=[],distinct=[];
for(let i=0;i<lives.length;i++)for(let j=i+1;j<Math.min(lives.length,i+15);j++){const A=lives[i],B=lives[j];
 const a=new Set(A.lw.history.map(h=>h.id)),b=new Set(B.lw.history.map(h=>h.id));
 const ua=A.lw.history.filter(h=>!b.has(h.id)).length, ub=B.lw.history.filter(h=>!a.has(h.id)).length;
 uniq.push((ua+ub)/(A.lw.history.length+B.lw.history.length));}
for(const P of lives){distinct.push(new Set(P.lw.history.map(h=>h.id)).size);tot.push(P.choices.length)}
const q=(a,p)=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length*p)]};
const src={branch:0,generic:0,major:0,engine:0};
for(const P of lives){const hs=new Set(P.lw.history.map(h=>h.id));for(const h of P.lw.history){const id=h.id;if(/^m_|^t_/.test(id))src.generic++;else if(/^(fa|mk|dr|bu|fc|te|he|of|tc|do|sp|mg|un|dp|or|cu|bo|ki|to|tm|tc|t5|ps|sw|si)\\d?_/.test(id))src.branch++;else src.major++}src.engine+=P.choices.length-P.lw.history.length}
console.log({lives:lives.length,choices_p50:q(tot,.5),distinctIds_p50:q(distinct,.5),pairShareUnique_p50:q(uniq,.5).toFixed(2),pairShareUnique_p10:q(uniq,.1).toFixed(2),src});
`);
