import { CINEMA } from './cinema.ts';
import { ABSURD } from './absurd.ts';
import { MONEY_FORKS } from './money.ts';
import { LOVE } from './love.ts';
import { compileFork } from './kit.ts';
import type { FactContext } from '../types.ts';
export { fits } from './kit.ts';
export const TURNING_CATALOG = [...CINEMA,...ABSURD,...MONEY_FORKS,...LOVE];
export const TURNING_STORYLETS = TURNING_CATALOG.flatMap(compileFork);
const openingIds = new Set(TURNING_CATALOG.map(d=>d.id));
export const TURNING_POINTS = TURNING_STORYLETS.filter(s => openingIds.has(s.id));
/** Closing flags are read by the end-of-life account. */
export function turningLegacy(c: FactContext): string[] {
  return TURNING_CATALOG.filter(d => c.flags.has(d.id+'_seen'))
    .sort((a,b)=>(c.counters[b.id+'_due'] ?? 0)-(c.counters[a.id+'_due'] ?? 0))
    .slice(0,3).map(d=>{
      const i=d.routes.findIndex((_,j)=>c.flags.has(d.id+'_route_'+j));
      const b=d.routes[i]!;
      const end=c.flags.has(d.id+'_continued_'+i) ? b.keep : c.flags.has(d.id+'_changed_'+i) ? b.pivot : 'câu chuyện còn dang dở khi đời bạn khép lại';
      return d.title+': '+end.charAt(0).toLowerCase()+end.slice(1)+'.';
    });
}
