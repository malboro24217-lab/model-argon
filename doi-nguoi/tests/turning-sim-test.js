const fs=require('fs'),assert=require('assert');
eval(fs.readFileSync(__dirname+'/.head.js','utf8')+`
const N=+(process.env.N||200), rootIds=new Set(Argon.TURNING_POINTS.map(s=>s.id));
const counts=[],echoes=[],coverage=new Set(),packs={c:0,a:0,m:0,l:0};let errs=0,stuck=0,repeats=0,replayDiff=0,unresolved=0,maxLate=0;
for(let i=0;i<N;i++){
 try{
  const seed=800003+i*7919, P=createLife(seed,{auto:true});let guard=0;
  while(P.alive&&guard++<130)stepYear(P);
  assert(!P.alive,'life must end within guard');if(P.pending)stuck++;
  const hist=P.lw.history,roots=hist.filter(h=>rootIds.has(h.id)), es=hist.filter(h=>/^tp_.*_echo_[012]$/.test(h.id));
  counts.push(roots.length);echoes.push(es.length);
  const seen=new Set();for(const h of roots){if(seen.has(h.id))repeats++;seen.add(h.id);coverage.add(h.id);packs[h.id[3]]++;}
  for(const h of es){const root=h.id.replace(/_echo_[012]$/,'');assert(seen.has(root),'no orphan consequence');const at=P.lw.counters[root+'_due'];maxLate=Math.max(maxLate,h.age-at);}
  unresolved+=P.lw.counters.tp_open||0;
  assert((P.lw.counters.tp_open||0)>=0&&(P.lw.counters.tp_open||0)<=3,'bounded open threads');
  if(i<20){const R=replayLife(seed,P.choices,null,P.actLog);const a=JSON.stringify([P.age,P.savings,P.lw.history,[...P.lw.sflags]]),b=JSON.stringify([R.age,R.savings,R.lw.history,[...R.lw.sflags]]);if(a!==b)replayDiff++;}
 }catch(e){errs++;console.error('seed',800003+i*7919,e.stack);}
}
counts.sort((a,b)=>a-b);echoes.sort((a,b)=>a-b);
const result={lives:N,errs,stuck,repeats,replayDiff,openingMedian:counts[Math.floor(N/2)],echoMedian:echoes[Math.floor(N/2)],distinctOpeningsObserved:coverage.size,packs,maxDelayBeyondDue:maxLate,unfinishedAtDeath:unresolved};
console.log(JSON.stringify(result,null,2));
assert.strictEqual(errs+stuck+repeats+replayDiff,0,'no errors, stuck lives, repeated openings or replay divergence');
for(const k in packs)assert(packs[k]>0,'each pack appears in ordinary play');
console.log('PASS turning-sim');
`);
