const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
function run(seed){const P=createLife(seed,{auto:true});G.life=P;let g=0;while(P.alive&&g++<130)stepYear(P);return P}
function show(P,tag){const t=[...P.lw.sflags].filter(x=>/^temper_[a-z]+$|^job_|^origin_|^spouse_|^path_/.test(x)&&x!=="temper_deep").join(' ');
 console.log('== '+tag+' | '+P.c.n+' | '+t+' | nghề: '+P.job+' | sống '+P.age+' tuổi | '+P.choices.length+' quyết định | '+new Set(P.lw.history.map(h=>h.id)).size+' tình huống khác nhau');
 const hs=P.lw.history; console.log(hs.filter(h=>h.age>=6).slice(0,40).map(h=>h.age+':'+h.id).join('  '))}
for(const seed of [1203, 4471]){const P=run(seed);show(P,'gốc seed '+seed);
const first=P.lw.cz.marks.find(m=>m.alt_indices&&m.alt_indices.length);
for(const k of first.alt_indices.slice(0,1)){const R=replayLife(P.seed,P.choices,{key:first.key,index:k});show(R,'đổi lựa chọn lúc 3 tuổi');
const a=new Set(P.lw.history.map(h=>h.id)),b=new Set(R.lw.history.map(h=>h.id));let inter=0;for(const x of a)if(b.has(x))inter++;console.log('trùng tình huống:',inter,'/',a.size+b.size-inter)}}
`);
