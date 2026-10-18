import assert from 'node:assert/strict';
import { randomCtx } from './fuzz-ctx.ts';
import { createRng, TURNING_POINTS, TURNING_CATALOG } from './engine/index.ts';
const r=createRng(918371), hits=new Set<string>();
const titles=new Set<string>(), counts:Record<string,number>={};
for(const d of TURNING_CATALOG){
 assert(!titles.has(d.title),'duplicate opening title: '+d.title);titles.add(d.title);
 counts[d.id[3]!]=(counts[d.id[3]!]??0)+1;
 for(const b of d.routes){
  assert(b.hook.length<=70&&b.label.length<=60,'choice/hint fits the existing UI: '+d.id);
  assert(b.keep.length<=60&&b.pivot.length<=60,'closure labels fit: '+d.id);
  assert(b.after.length>=45,'follow-up has an authored situation: '+d.id);
 }
}
assert.deepEqual(counts,{c:50,a:50,m:50,l:50});
for(let i=0;i<30000;i++){
 const c=randomCtx(r);
 for(const s of TURNING_POINTS){
  if(!s.prerequisites(c))continue;
  hits.add(s.id);
  const v=s.build(c,id=>id);
  assert(v.choices.length===3&&v.def>=0&&v.def<3);
  assert(!v.text.includes('undefined')&&!v.text.includes('{person}'));
  if(v.npc)assert(Object.values(c.cast).includes(v.npc),'opening actor must be present');
  if(c.age<18)for(const b of v.choices)assert(Math.abs(b.effects.money??0)<=0.05);
  const fx=v.choices.map(b=>JSON.stringify(b.effects));assert(new Set(fx).size===3,'routes have distinct durable outcomes');
 }
}
assert.equal(hits.size,200,'all opening events reachable in valid random contexts: missing '+TURNING_POINTS.filter(s=>!hits.has(s.id)).map(s=>s.id));
console.log('PASS turning-content: 200 reachable roots, 600 authored routes, 30000 contexts');
