/** Authored forks, backed by the existing Effect/causality/queue contract. */
import type { CastRole, Effect, FactContext, Storylet } from '../types.ts';
import { C, T, slice } from '../paths/kit.ts';
import { prov } from '../Causality.ts';
import { linkedEffect } from './links.ts';
import { CODEX_PLANTS, CODEX_SEASON_TAGS, pressureFor } from '../canon/codexPlants.ts';

export type Tone = 'build' | 'bond' | 'probe' | 'show' | 'exit' | 'defy' | 'care' | 'deal' | 'risk' | 'truth';
export interface Route { label: string; hook: string; after: string; keep: string; pivot: string; tone: Tone; extra: Effect; endings: [Tone,Tone] }
export interface Fork { id: string; title: string; text: string; gates: string; routes: [Route, Route, Route] }
export const B = (label: string, hook: string, after: string, keep: string, pivot: string, tone: Tone, endings: [Tone,Tone], extra: Effect = {}): Route => ({ label, hook, after, keep, pivot, tone, endings, extra });
export const E = (id: string, title: string, text: string, gates: string, routes: [Route, Route, Route]): Fork => ({ id: 'tp_' + id, title, text, gates, routes });
const ROLES: Record<string, CastRole> = { friend:'childhood_friend', neighbor:'neighbor', rival:'rival', mentor:'mentor', boss:'first_boss', official:'official', spouse:'spouse', sibling:'sibling', child:'child', mother:'mother', father:'father', partner:'partner', creditor:'creditor' };
function actor(d: Fork, c: FactContext): string | undefined {
  for (const g of d.gates.split(',')) if (ROLES[g]) return c.cast[ROLES[g]!];
  return undefined;
}
export function fits(d: Fork, c: FactContext): boolean {
  const gs = d.gates.split(',');
  const [lo, hi] = gs.includes('kid') ? [8,15] : gs.includes('teen') ? [16,22] : gs.includes('young') ? [18,25] : gs.includes('old') ? [60,85] : gs.includes('late') ? [40,72] : [18,65];
  if (c.age < lo! || c.age > hi!) return false;
  if (gs.includes('friend') && gs.includes('spouse') && c.cast.childhood_friend === c.cast.spouse) return false;
  for (const g of gs) {
    if (ROLES[g] && !c.cast[ROLES[g]!]) return false;
    if (g === 'single' && c.married) return false;
    if (g === 'spouse' && !c.married) return false;
    if (g === 'child' && c.kids_alive < 1) return false;
    if (g === 'job' && !c.has_job) return false;
    if (g === 'school' && !c.in_school) return false;
    if (g === 'vn' && c.country !== 'VN') return false;
    if (g === 'home' && !c.home_owner) return false;
    if (g === 'land' && !c.owns.has('land')) return false;
    if (g === 'shop' && !c.owns.has('shop')) return false;
    if (g === 'deposit' && c.deposit <= 0) return false;
    if (g === 'money' && !(c.independent ?? true)) return false;
    if (g === 'debt' && c.debt <= 0) return false;
    if (g === 'funds' && c.savings < c.income * 0.2) return false;
    if (g === 'before50' && c.age > 50) return false;
    if (g === 'before70' && c.age > 70) return false;
    if (g === 'widowed' && !c.widowed) return false;
  }
  return true;
}
function flavour(t: Tone, c: FactContext, npc?: string): Effect {
  const cost = c.age < 18 ? -0.01 : -0.03;
  const profiles: Record<Tone, Effect> = {
    build: { money: cost, know: 3, bw: -2, counters: { tp_enterprise: 1 } },
    bond: { rel: 3, happy: 2, bw: -2, counters: { tp_connections: 1 } },
    probe: { know: 4, bw: -3, counters: { tp_inquiries: 1 } },
    show: { happy: 4, rel: -1, counters: { tp_spotlight: 1 } },
    exit: { bw: 3, happy: 1, counters: { tp_boundaries: 1 } },
    defy: { agency: 0.02, rel: -2, counters: { tp_defiance: 1 } },
    care: { money: cost, rel: 4, counters: { tp_care: 1 } },
    deal: { rel: 1, know: 1, bw: -2, counters: { tp_bargains: 1 } },
    risk: { bw: -3, agency: 0.01, counters: { tp_wagers: 1 } },
    truth: { agency: 0.01, happy: -1, know: 2, counters: { tp_truth: 1 } },
  };
  const e: Effect = { ...profiles[t] };
  if (npc) {
    const warm = t === 'bond' || t === 'care';
    e.memory = { npc, tag: warm ? 'HELPED_IN_CRISIS' : t === 'deal' ? 'WIN_WIN_DEAL' : 'KEPT_PROMISE', weight: warm ? 0.2 : 0.08, note: 'một ngã rẽ hai người từng chứng kiến' };
  }
  return e;
}
function merge(a: Effect, b: Effect): Effect { return { ...a, ...b, counters: { ...a.counters, ...b.counters }, flags: [...(a.flags ?? []), ...(b.flags ?? [])] }; }

export function compileFork(d: Fork): Storylet[] {
  const seen = d.id + '_seen', done = d.id + '_done', due = d.id + '_due';
  const branchFlag = (i: number) => d.id + '_route_' + i;
  const delay = 1 + (d.id.charCodeAt(d.id.length - 1) % 3);
  const root: Storylet = {
    id: d.id, category: 'micro', urgency: 24, cooldownYears: 99, once: true, maxPerLife: 1, tension: 4,
    meta: { kind: d.gates.split(',').includes('money') ? 'money' : 'turning_point', ...(CODEX_SEASON_TAGS[d.id] ? { season: CODEX_SEASON_TAGS[d.id]! } : {}) },
    prerequisites: c => !c.flags.has(seen) && (c.counters.tp_seen ?? 0) < 50 && (c.counters.tp_open ?? 0) < 3 &&
      c.age - (c.counters.tp_last_at ?? -9) >= 2 && slice(c, d.id, 0.55) && fits(d, c),
    specificity: () => 5,
    build: (c, N) => {
      const npc = actor(d,c), person = npc ? N(npc) : 'người quen';
      const choices = d.routes.map((b,i) => {
        const e = merge(merge(flavour(b.tone,c,npc), b.extra), linkedEffect(d.id,i,'open',c));
        if (e.memory) e.memory = { ...e.memory, note: d.title.toLowerCase() + ': ' + b.label.toLowerCase() };
        // Persist the original person's identity: a later spouse/partner must not inherit their part.
        const flags = [seen, branchFlag(i), ...(npc ? [d.id + '_who:' + npc] : [])];
        // Canon event: áp lực theo tông (hoặc khai báo riêng) và vật gài. Route có vật gài không hẹn cảnh 1 bước nữa
        // (không `later`, không mở `tp_open`/`due`): vật gài sẽ được trả bằng canon event hoặc mùa.
        const cx = CODEX_PLANTS[d.id + '_' + i];
        const open: Effect = { flags, counters: { tp_seen: 1, tp_last_at: c.age - (c.counters.tp_last_at ?? 0), ...(cx?.plant ? {} : { tp_open: 1, [due]: c.age + delay }) },
          pressure: cx?.pressure ?? pressureFor(d.id, b.tone), ...(cx?.plant ? { plant: cx.plant } : { later: { years: delay, storylet: d.id + '_echo_' + i } }), log: b.label + '. ' + b.hook + '.' };
        return C(b.label, merge(e, open), b.hook);
      });
      return T(d.title, d.text.replaceAll('{person}',person), choices, 1, npc ? { npc } : {});
    },
  };
  const echoes = d.routes.flatMap((b,i): Storylet[] => CODEX_PLANTS[d.id + '_' + i]?.plant ? [] : [{
    id: d.id + '_echo_' + i, category: 'arc', urgency: 82, cooldownYears: 99, once: true, maxPerLife: 1, tension: 5,
    meta: { kind: 'turning_echo' },
    prerequisites: c => c.flags.has(branchFlag(i)) && !c.flags.has(done) && c.age >= (c.counters[due] ?? Infinity),
    specificity: () => 8,
    causes: () => [prov.flag(branchFlag(i))],
    build: (c,N) => {
      const bound = [...c.flags].find(f => f.startsWith(d.id + '_who:'))?.slice((d.id + '_who:').length);
      const alive = bound && Object.values(c.cast).includes(bound);
      const text = b.after.replaceAll('{person}',bound ? N(bound) : 'người quen');
      const closure = (keep: boolean): Effect => {
        const e = merge(flavour(b.endings[keep ? 0 : 1],c,alive ? bound : undefined),linkedEffect(d.id,i,keep ? 'keep' : 'pivot',c));
        if (e.memory) e.memory = { ...e.memory, note: d.title.toLowerCase() + ': ' + (keep ? b.keep : b.pivot).toLowerCase() };
        return merge(e, { flags: [done, d.id + (keep ? '_continued_' : '_changed_') + i], counters: { tp_open: -1, tp_resolved: 1 }, log: d.title + ' — ' + (keep ? b.keep : b.pivot) + '.' });
      };
      return T(d.title + ' · Chuyện tiếp', bound && !alive ? `Người từng cùng bạn trải qua chuyện này không còn hiện diện trong đời bạn. Trong ghi chép cũ còn dòng: “${text}” Bạn quyết định giữ lại điều gì từ ngã rẽ ấy?` : text,
        [C(b.keep,closure(true),'Tiếp tục con đường đã mở'), C(b.pivot,closure(false),'Đổi hướng, giữ lại trải nghiệm')], 1, alive ? {npc:bound} : {});
    },
  }]);
  return [root,...echoes];
}
