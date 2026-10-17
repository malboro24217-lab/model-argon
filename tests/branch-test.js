const fs=require('fs');eval(fs.readFileSync('/home/claude/doi-nguoi/tests/.head.js','utf8')+`
function idsOf(P){return new Set(P.lw.history.map(h=>h.id))}
const lives=[];for(let i=0;i<200;i++){const P=createLife(i*17+5,{auto:true});let g=0;while(P.alive&&g++<130)stepYear(P);if(P.age>=40)lives.push(P)}
let js=[];for(let i=0;i<lives.length;i++)for(let j=i+1;j<Math.min(lives.length,i+20);j++){const a=idsOf(lives[i]),b=idsOf(lives[j]);let inter=0;for(const x of a)if(b.has(x))inter++;js.push(inter/(a.size+b.size-inter))}
js.sort((a,b)=>a-b);
const freq={};for(const P of lives)for(const x of idsOf(P))freq[x]=(freq[x]||0)+1;
const universal=Object.entries(freq).filter(([k,v])=>v/lives.length>=0.6).length;
const allIds=new Set(Object.keys(freq));
console.log({lives:lives.length,jaccard_p50:js[js.length>>1].toFixed(2),jaccard_p90:js[Math.floor(js.length*.9)].toFixed(2),distinctScenesSeen:allIds.size,scenesInOver60pctOfLives:universal});
// butterfly: flip earliest visible choice
let div=[];for(let i=0;i<40;i++){const P=createLife(i*29+3,{auto:true});G.life=P;let g=0;while(P.alive&&g++<130)stepYear(P);const first=P.lw.cz.marks.find(m=>m.alt_indices&&m.alt_indices.length);if(!first)continue;
 const R=replayLife(P.seed,P.choices,{key:first.key,index:first.alt_indices[0]});const a=P.lw.history.filter(h=>h.age>first.age).map(h=>h.id),b=new Set(R.lw.history.filter(h=>h.age>first.age).map(h=>h.id));const diff=a.filter(x=>!b.has(x)).length/Math.max(1,a.length);div.push(diff)}
div.sort((a,b)=>a-b);console.log('flip first choice → share of later scenes that differ: p50',div[div.length>>1].toFixed(2),'p90',div[Math.floor(div.length*.9)].toFixed(2));
`);
