const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const per={};let lives=0,near=0;
for(let i=0;i<150;i++){const P=createLife(i*17+5,{auto:true});let g=0;while(P.alive&&g++<130)stepYear(P);lives++;
 const c={};for(const h of P.lw.history){c[h.id]=(c[h.id]||0)+1}
 for(const k in c)if(c[k]>=2){per[k]=(per[k]||0)+c[k]-1}
 const titles=P.log.filter(e=>/bạn chọn/.test(e.text)).map(e=>[e.age,e.text.split(' — ')[0]]);
 for(let a=0;a<titles.length;a++)for(let b=a+1;b<titles.length;b++)if(titles[a][1]===titles[b][1]&&titles[b][0]-titles[a][0]<=5)near++}
console.log('repeats per life',(Object.values(per).reduce((a,b)=>a+b,0)/lives).toFixed(1),'same title within 5y per life',(near/lives).toFixed(1));
console.log(Object.entries(per).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>k+':'+(v/lives).toFixed(2)).join(' '));
`);
