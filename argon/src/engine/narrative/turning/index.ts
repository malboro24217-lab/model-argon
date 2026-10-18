import { CINEMA } from './cinema.ts';
import { ABSURD } from './absurd.ts';
import { MONEY_FORKS } from './money.ts';
import { LOVE } from './love.ts';
import { compileFork } from './kit.ts';
import { CODEX_PLANTS } from '../canon/codexPlants.ts';
import type { FactContext } from '../types.ts';
export { fits } from './kit.ts';
export const TURNING_CATALOG = [...CINEMA,...ABSURD,...MONEY_FORKS,...LOVE];
export const TURNING_STORYLETS = TURNING_CATALOG.flatMap(compileFork);
const openingIds = new Set(TURNING_CATALOG.map(d=>d.id));
export const TURNING_POINTS = TURNING_STORYLETS.filter(s => openingIds.has(s.id));
/** Closing flags are read by the end-of-life account. */
export function turningLegacy(c: FactContext): string[] {
  /** Sắp theo mốc tuổi của thẻ: `_due` (route có cảnh hậu quả) hoặc `_at` (route có vật gài, không có cảnh hậu quả). */
  const when=(d: {id: string})=>c.counters[d.id+'_due'] ?? c.counters[d.id+'_at'] ?? 0;
  return TURNING_CATALOG.filter(d => c.flags.has(d.id+'_seen'))
    .sort((a,b)=>when(b)-when(a))
    .slice(0,3).map(d=>{
      const i=d.routes.findIndex((_,j)=>c.flags.has(d.id+'_route_'+j));
      const b=d.routes[i]!;
      // Route có vật gài không có cảnh hậu quả: chỉ còn lựa chọn đã làm, nên tổng kết kể lựa chọn ấy.
      if(CODEX_PLANTS[d.id+'_'+i]?.plant) return d.title+': '+b.label.charAt(0).toLowerCase()+b.label.slice(1)+'.';
      const end=c.flags.has(d.id+'_continued_'+i) ? b.keep : c.flags.has(d.id+'_changed_'+i) ? b.pivot : 'câu chuyện còn dang dở khi đời bạn khép lại';
      return d.title+': '+end.charAt(0).toLowerCase()+end.slice(1)+'.';
    });
}
