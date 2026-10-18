/* Contract: real authored choices must reach distinct, delayed consequences in the host. */
const fs = require('fs'), assert = require('assert');
eval(fs.readFileSync(__dirname + '/.head.js', 'utf8') + `
assert(Array.isArray(Argon.TURNING_POINTS), 'turning-point pack is exported by the engine');
assert.strictEqual(Argon.TURNING_POINTS.length, 200, '200 separate opening situations');
assert(MONEY_IDS().has('tp_m01'),'new financial openings participate in the existing one-money-card-per-year budget');
const ALL = Argon.PATH_STORYLETS;
const ids = new Set(ALL.map(s => s.id));
assert.strictEqual(ids.size, ALL.length, 'no duplicate ids in integrated pool');
let branches = 0, closures = 0, plants = 0, personBound = 0;
for (const root of Argon.TURNING_POINTS) {
  const P = createLife(4242, {auto:false}); livingInit(P);
  P.age = 30; P.income = 12000; P.savings = 50000; P.job = 'thợ';
  const ctx = factContext(P);
  const v = root.build(ctx, id => castName(P,id));
  assert.strictEqual(v.choices.length, 3, root.id + ' has three routes');
  const targets = v.choices.map(c => c.effects.later && c.effects.later.storylet);
  // Route có vật gài (canon event) không còn cảnh hậu quả 1 bước: không later, không storylet _echo_; vật gài đi vào effect.
  const plantedAt = v.choices.map(c => !!c.effects.plant);
  plantedAt.forEach((p,i) => {
    if (!p) return;
    assert(!v.choices[i].effects.later && !ALL.find(s => s.id === root.id + '_echo_' + i), root.id + ' route ' + i + ' has a plant instead of an echo');
    assert(!v.choices[i].effects.counters.tp_open, 'a planted route never holds the open-fork budget');
    plants++;
  });
  assert.strictEqual(new Set(targets.filter(Boolean)).size, 3 - plantedAt.filter(Boolean).length, root.id + ' unplanted branches have separate consequences');
  for (let i=0;i<3;i++) for (let ending=0;ending<2;ending++) {
    if (plantedAt[i]) {
      // Lời tổng kết cuối đời: route có vật gài không bao giờ bị kể là "dang dở", dù không có cảnh hậu quả.
      if (ending === 0) {
        const L = createLife(4242, {auto:false}); livingInit(L); L.age=30; L.income=12000; L.savings=50000; L.job='thợ';
        const sc = sceneFromStorylet(L, root, factContext(L));
        L.curMark = markChoice(L, sc, i);
        applyEffect(L, sc.choices[i]._fx, sc.npc && sc.npc.id);
        const legacy = Argon.turningLegacy(factContext(L));
        assert(legacy.some(t => t.startsWith(Argon.TURNING_CATALOG.find(d => d.id === root.id).title + ': ')) && !legacy.some(t => t.includes('dang dở khi đời bạn khép lại')), root.id + ' route ' + i + ' has a resolved line in the life account');
        if (sc.choices[i]._fx.plant.npc) personBound++;
      }
      continue;
    }
    const L = createLife(4242, {auto:false}); livingInit(L); L.age=30; L.income=12000; L.savings=50000; L.job='thợ';
    const sc = sceneFromStorylet(L, root, factContext(L));
    L.curMark = markChoice(L, sc, i);
    applyEffect(L, sc.choices[i]._fx, sc.npc && sc.npc.id);
    const target = ALL.find(s => s.id === targets[i]);
    assert(target, root.id + ' has a real target');
    assert(!target.prerequisites(factContext(L)), 'consequence cannot arrive before its due year');
    L.age += sc.choices[i]._fx.later.years;
    assert(target.prerequisites(factContext(L)), root.id + ' chosen consequence is reachable');
    assert(targets.filter(Boolean).filter(id => ALL.find(s=>s.id===id).prerequisites(factContext(L))).length===1, 'siblings stay locked');
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
assert(personBound > 100, 'person plants carry the original actor npc when the fork has one');
assert.strictEqual(plants + branches, 600, 'every route is either planted or has a delayed echo');
console.log('turning points:', Argon.TURNING_POINTS.length, 'delayed branches:', branches, 'planted routes:', plants, 'closure paths:',closures);
`);
