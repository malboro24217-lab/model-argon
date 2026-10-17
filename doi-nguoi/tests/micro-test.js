const fs=require('fs');eval(fs.readFileSync('/home/claude/doi-nguoi/tests/.head.js','utf8')+`
let errs=0,stuck=0,dec=[],micro=0,ages=[],fuses={},repeats=0;
for(let i=0;i<500;i++){try{const P=createLife(i*13+7,{auto:true});let g=0;while(P.alive&&g++<130)stepYear(P);
 if(P.pending)stuck++;dec.push(P.choices.length);ages.push(P.age);
 const ids=P.lw.history.map(h=>h.id);micro+=ids.filter(x=>x.startsWith('m_')).length;for(const x of ids)if(x.startsWith('t_'))fuses[x]=(fuses[x]||0)+1;
 const seen={};for(const x of ids){seen[x]=(seen[x]||0)+1}repeats+=Object.values(seen).filter(v=>v>=4).length;
}catch(e){errs++;if(errs<3)console.log(e.stack.split('\\n').slice(0,4).join(' | '))}}
dec.sort((a,b)=>a-b);ages.sort((a,b)=>a-b);
console.log({errs,stuck,decisions_p10:dec[50],decisions_p50:dec[250],decisions_p90:dec[450],medianAge:ages[250],microPerLife:(micro/500).toFixed(1),idsRepeated4x:(repeats/500).toFixed(2),fuses});
const P=createLife(4242,{auto:true});G.life=P;while(P.alive)stepYear(P);
console.log('life',P.age,'decisions',P.choices.length);
console.log(P.log.filter(e=>e.tone==='choice').slice(0,40).map(e=>e.age+'t '+e.text).join('\\n'));
const R=replayLife(4242,P.choices,null);console.log('replay ok', R.age===P.age, Math.round(R.savings)===Math.round(P.savings));
`);
