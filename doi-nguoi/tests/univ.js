const fs=require('fs');eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const lives=[];for(let i=0;i<150;i++){const P=createLife(i*17+5,{auto:true});let g=0;while(P.alive&&g++<130)stepYear(P);if(P.age>=40)lives.push(P)}
const freq={};for(const P of lives)for(const x of new Set(P.lw.history.map(h=>h.id)))freq[x]=(freq[x]||0)+1;
console.log(Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,55).map(([k,v])=>k+':'+Math.round(100*v/lives.length)).join('  '));
`);
