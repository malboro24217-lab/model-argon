/* Contract: real authored choices must reach distinct, delayed consequences in the host. */
const fs = require('fs'), assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
assert(Array.isArray(Argon.TURNING_POINTS), 'turning-point pack is exported by the engine');
assert.strictEqual(Argon.TURNING_POINTS.length, 196, '196 separate opening situations (c05, c14, c27, c39 became canon seeds)');
assert(MONEY_IDS().has('tp_m01'),'new financial openings participate in the existing one-money-card-per-year budget');
const ALL = Argon.PATH_STORYLETS;
const ids = new Set(ALL.map(s => s.id));
assert.strictEqual(ids.size, ALL.length, 'no duplicate ids in integrated pool');
let branches = 0, closures = 0;
for (const root of Argon.TURNING_POINTS) {
  const P = createLife(4242, {auto:false}); livingInit(P);
  P.age = 30; P.income = 12000; P.savings = 50000; P.job = 'thợ';
  const ctx = factContext(P);
  const v = root.build(ctx, id => castName(P,id));
  assert.strictEqual(v.choices.length, 3, root.id + ' has three routes');
  const targets = v.choices.map(c => c.effects.later && c.effects.later.storylet);
  assert.strictEqual(new Set(targets).size, 3, root.id + ' branches have separate consequences');
  for (let i=0;i<3;i++) for (let ending=0;ending<2;ending++) {
    const L = createLife(4242, {auto:false}); livingInit(L); L.age=30; L.income=12000; L.savings=50000; L.job='thợ';
    const sc = sceneFromStorylet(L, root, factContext(L));
    L.curMark = markChoice(L, sc, i);
    applyEffect(L, sc.choices[i]._fx, sc.npc && sc.npc.id);
    const target = ALL.find(s => s.id === targets[i]);
    assert(target, root.id + ' has a real target');
    assert(!target.prerequisites(factContext(L)), 'consequence cannot arrive before its due year');
    L.age += sc.choices[i]._fx.later.years;
    assert(target.prerequisites(factContext(L)), root.id + ' chosen consequence is reachable');
    assert(targets.filter(id => ALL.find(s=>s.id===id).prerequisites(factContext(L))).length===1, 'siblings stay locked');
    const next = target.build(factContext(L), id=>castName(L,id));
    assert(next.choices.length===2 && next.choices[0].label !== next.choices[1].label, 'follow-up offers another decision');
    assert(Argon.resolveCauses(L.lw.cz,target.causes(factContext(L))).length===1, 'visible provenance points to the opening choice');
    const echoEffect = next.choices[ending].effects;
    applyEffect(L, echoEffect, next.npc);
    assert(!target.prerequisites(factContext(L)), 'resolved consequence stays closed');
    assert(!root.prerequisites(factContext(L)), 'opening never repeats');
    assert(Argon.turningLegacy(factContext(L)).some(t=>t.includes(next.choices[ending].label.charAt(0).toLowerCase()+next.choices[ending].label.slice(1))), 'chosen closure survives in the life account');
    if (ending===0) branches++;
    closures++;
  }
}
// Authored action regressions: borrowing really borrows; leaving is not the only closure.
{
 const L=createLife(4242,{auto:false});livingInit(L); L.age=20;L.income=12000;L.savings=50000;
 const root=ALL.find(s=>s.id==='tp_c08'), v=root.build(factContext(L),String), before=L.ar.state.capitals.capitalAssets.debt;
 assert(!v.choices[0].effects.gamble,'borrowing for study is not a cash lottery');
 applyEffect(L,v.choices[0].effects);
 assert(L.ar.state.capitals.capitalAssets.debt>before,'study loan changes real debt');
 assert(L.lw.studying,'study commitment changes the education system');
 const offer=ALL.find(s=>s.id==='tp_c01_echo_1').build(factContext(L),String);
 assert(offer.choices[1].effects.counters.tp_enterprise===1,'opening an evening class is an enterprise choice, not an exit');
 const move=ALL.find(s=>s.id==='tp_c04').build(factContext(L),String);
 applyEffect(L,move.choices[0].effects);
 assert(L.lw.sflags.has('path_city'),'moving to the city changes persistent residence facts');
  for(const id of ['tp_c43_echo_1','tp_c38_echo_0','tp_l06_echo_1','tp_l36_echo_1','tp_c41_echo_1']){
    const side=ALL.find(s=>s.id===id).build(factContext(L),String).choices[0].effects;
    assert(!String(side.custom||'').includes('become:'),id+' side activity must not replace the main career');
  }
}
{
 const L=createLife(4242,{auto:false});livingInit(L); L.age=10; const c=factContext(L);
 c.cast.mother='M';delete c.cast.father;
 assert(!ALL.find(s=>s.id==='tp_c07').prerequisites(c),'cannot choose to live with a missing father');
 c.age=30;c.married=true;c.cast.spouse='SPOUSE';c.cast.childhood_friend='FRIEND';
 const v=ALL.find(s=>s.id==='tp_l33').build(c,String);
 assert.strictEqual(v.npc,'FRIEND','wedding helper is the friend, not the spouse');
 assert(v.text.includes('FRIEND')&&!v.text.includes('SPOUSE mặc'),'no spouse standing next to themself');
}
console.log('turning points:', Argon.TURNING_POINTS.length, 'delayed branches:', branches, 'closure paths:',closures);
`);
