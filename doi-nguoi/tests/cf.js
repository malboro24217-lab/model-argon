const fs=require('fs');eval(fs.readFileSync('/home/claude/doi-nguoi/tests/.head.js','utf8')+`
const P=createLife(1203,{auto:true});G.life=P;let g=0;while(P.alive&&g++<130)stepYear(P);
console.log(counterfactualVN(P).replace(/<[^>]+>/g,' | ').replace(/( \\| )+/g,' | '));
`);
