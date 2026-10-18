import fs from 'node:fs';
import { TURNING_CATALOG } from '../argon/src/engine/narrative/turning/index.ts';
const sections={c:'Điện ảnh và sitcom',a:'Hài vô lý',m:'Tiền bạc',l:'Tình yêu'};
let out='# 200 bước ngoặt — bản tích hợp cục bộ\n\n200 cảnh mở đầu, 600 cảnh hậu quả, 1.200 lựa chọn tại cảnh hậu quả. Mỗi nhánh mở đầu có một cuộc hẹn quay lại sau 1–3 năm; hoàn cảnh và tuổi quyết định cảnh nào xuất hiện. `{person}` được thay bằng NPC của đúng đời đang chơi.\n\n';
for(const [k,title] of Object.entries(sections)){
 out+='## '+title+'\n\n';
 for(const d of TURNING_CATALOG.filter(d=>d.id[3]===k)){
  out+='### '+d.id+' — '+d.title+'\n\n'+d.text+'\n\nĐiều kiện: `'+d.gates+'`.\n\n';
  d.routes.forEach((b,i)=>{out+=(i+1)+'. **'+b.label+'** — '+b.hook+'.\n   - Chuyện quay lại: '+b.after+'\n   - Quyết định tiếp: **'+b.keep+'** hoặc **'+b.pivot+'**.\n';});
  out+='\n';
 }
}
fs.mkdirSync(new URL('../argon/docs/content/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../argon/docs/content/2026-10-18-200-buoc-ngoat.md',import.meta.url),out.trimEnd()+'\n');
console.log('Exported 200 opening scenes / 600 branch continuations');
