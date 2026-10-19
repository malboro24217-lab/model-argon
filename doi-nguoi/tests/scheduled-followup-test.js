const fs=require('fs'), assert=require('assert');
eval(fs.readFileSync(__dirname+'/.head.js','utf8') + `
const P=createLife(4242,{auto:false}); livingInit(P); P.age=30; P.pending=null; P.storyDue=null; P.lw.canon.last=P.age; // canon event ép nổ từ 25 tuổi (Task 20): đặt như vừa có một cái để năm này chỉ đo hàng đợi
const card=id=>({id,category:'arc',urgency:82,cooldownYears:99,once:true,tension:1,prerequisites:()=>true,specificity:()=>8,build:()=>({title:id,text:'Một cuộc hẹn quay lại.',choices:[{label:'Đón cuộc hẹn',effects:{happy:1}},{label:'Hẹn việc khác',effects:{know:1}}],def:0})});
pools().major.push(card('queue_test_a'),card('queue_test_b'));
P.lw.queue=[{at:30,storylet:'queue_test_a'},{at:30,storylet:'queue_test_b'}];
livingYear(P);
assert(P.pending && P.pending.id==='queue_test_a','first due scene fires through real host');
assert(P.lw.queue.some(q=>q.storylet==='queue_test_b'),'another due scene must stay queued after the first fires');
P.pending=null; P.age=31; livingYear(P);
assert(P.pending && P.pending.id==='queue_test_b','second due scene fires in the next available year');
const waiting=card('queue_test_wait');waiting.prerequisites=c=>c.flags.has('ready_for_test');
pools().micro.push(waiting); P.pending=null; P.lw.queue=[{at:31,storylet:'queue_test_wait'}]; P.age=32;
livingYear(P);assert(P.lw.queue.some(q=>q.storylet==='queue_test_wait'),'temporarily ineligible appointment is retained');
P.pending=null;P.storyDue=null;P.lw.sflags.add('ready_for_test');P.age=33;livingYear(P);
assert(P.pending&&P.pending.id==='queue_test_wait','a deferred micro appointment can later fire');
console.log('scheduled follow-up retention: PASS');
`);
