const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const first={},ever={},tem={},org={},sp={};let n=0;
for(let i=0;i<200;i++){const P=createLife(i*17+5,{auto:true});let g=0;const seen=new Set();let f0=null;
 while(P.alive&&g++<130){stepYear(P);const fl=P.lw&&P.lw.sflags;if(!fl)continue;for(const k of fl){if(k.startsWith('job_')){seen.add(k);if(!f0)f0=k}}}
 if(P.age<40)continue;n++;first[f0]=(first[f0]||0)+1;for(const k of seen)ever[k]=(ever[k]||0)+1;
 const fl=P.lw.sflags;for(const k of fl){if(/^temper_/.test(k))tem[k]=(tem[k]||0)+1;if(/^origin_/.test(k))org[k]=(org[k]||0)+1;if(/^spouse_/.test(k))sp[k]=(sp[k]||0)+1}}
console.log(n,{first,ever,tem,org,sp});
`);
