/** Explicit connections for choices that promise an existing engine operation.
 * No text-to-action inference runs in the game. IDs/routes are author-maintained.
 */
import type { Effect, FactContext } from '../types.ts';
import { PATHS } from '../paths/registry.ts';
type Stage = 'open' | 'keep' | 'pivot';
type Link = Partial<Record<Stage, Effect | ((c: FactContext) => Effect)>>;
const career = (id: string) => (c: FactContext): Effect => {
  return {flags:['tp_practice_'+id],know:2};
};
/** Full career transitions are opt-in, and the visible label must say so. */
const takeCareer = (id: string) => (c: FactContext): Effect => {
  const p = PATHS[id]!;
  return c.age >= p.ages[0] && c.age <= p.ages[1] ? {custom:'become:'+id} : { flags:['tp_practice_'+id], know:2, log:'Bạn theo việc này ở quy mô nhỏ, ngoài con đường nghề chính.' };
};
const loan = (amount: number) => (c: FactContext): Effect => c.cast.sibling && c.savings > 0 ? {lend:{npc:c.cast.sibling,amount,years:3}} : {log:'Bạn chưa có tiền riêng để cho vay; lời đề nghị được giữ lại, chưa có khoản vay nào được giao.'};
const help = (amount: number, role: 'childhood_friend'|'sibling'|'child') => (c: FactContext): Effect => c.cast[role] && c.savings > 0 ? {give:{npc:c.cast[role]!,amount}} : {log:'Bạn giúp bằng công sức lúc này vì không có khoản tiền riêng dư để trao.'};
const LINKS: Record<string,Link> = {
  tp_c04_0:{open:{custom:'move_city'}}, tp_c04_2:{open:{custom:'move_city'}},
  tp_c08_0:{open:{custom:'borrow:0.3|study'}}, tp_c08_1:{keep:{custom:'study'}}, tp_c08_2:{open:{custom:'borrow:0.1|study'}},
  tp_c09_0:{open:{custom:'move_city'}},
  tp_c10_2:{keep:career('artisan')}, tp_c13_2:{open:{custom:'job_lose'}},
  tp_c16_1:{keep:career('startup')},
  tp_c17_0:{open:takeCareer('restaurateur')}, tp_c17_1:{keep:career('investor')},
  tp_c22_0:{keep:career('factory_owner')}, tp_c25_1:{keep:{flags:['tp_shared_home_plan']}},
  tp_c26_0:{open:career('activist')}, tp_c29_0:{open:takeCareer('street_vendor')},
  tp_c29_1:{open:{custom:'study'}}, tp_c30_0:{keep:career('startup')},
  tp_c31_0:{keep:{support:{who:'kids',level:'hau'}}}, tp_c31_1:{keep:{support:{who:'kids',level:'hau'}}},
  tp_c34_0:{open:help(0.12,'childhood_friend')}, tp_c37_0:{open:{sell:{kind:'shop'}},keep:career('artisan')},
  tp_c38_0:{keep:career('artisan')}, tp_c38_1:{open:c=>({custom:'job_switch:teach',unflags:[...c.flags].filter(f=>f.startsWith('life_')&&PATHS[f.slice(5)]?.kind==='career'),flags:['tp_teaches_trade'],know:3})},
  tp_c41_1:{keep:career('social_worker')}, tp_c42_2:{open:{custom:'study'}},
  tp_c43_1:{keep:career('artisan')}, tp_c47_0:{keep:career('restaurateur')},
  tp_a02_0:{keep:career('agritech')}, tp_a02_1:{open:{flags:['tp_duck_bell_kept'],money:0.1}},
  tp_a05_0:{keep:career('influencer')}, tp_a06_0:{keep:career('tv_host')},
  tp_a07_0:{keep:career('street_vendor')}, tp_a08_1:{keep:career('ecommerce')},
  tp_a09_0:{keep:career('investor')}, tp_a11_2:{keep:career('vlogger')},
  tp_a14_0:{keep:{custom:'study'}}, tp_a17_2:{open:{money:-0.06,flags:['tp_water_repaired']}},
  tp_a19_0:{keep:career('shipper')}, tp_a20_0:{keep:career('tv_host')},
  tp_a23_2:{keep:career('social_worker')}, tp_a24_0:{keep:career('ecommerce')},
  tp_a25_1:{keep:{flags:['tp_pet_care_business']}}, tp_a26_0:{keep:career('singer')},
  tp_a27_1:{keep:career('artisan')}, tp_a29_1:{open:takeCareer('security_guard')},
  tp_a31_1:{keep:career('street_vendor')}, tp_a33_0:{keep:career('restaurateur')},
  tp_a35_0:{keep:{flags:['tp_event_decor_business']}}, tp_a36_1:{keep:career('actor')},
  tp_a39_1:{keep:career('singer')}, tp_a41_0:{keep:career('street_vendor')},
  tp_a43_0:{open:{custom:'study'}}, tp_a48_0:{keep:career('painter')},
  tp_m03_0:{keep:career('agritech')}, tp_m06_2:{keep:career('agritech')},
  tp_m10_1:{keep:career('street_vendor')}, tp_m13_0:{keep:{support:{who:'kids',level:'hau'}}},
  tp_m15_1:{open:{flags:['tp_split_household_budget']}},
  tp_m17_0:{keep:career('border_trader')}, tp_m18_1:{keep:career('restaurateur')},
  tp_m19_2:{keep:career('investor')}, tp_m20_1:{keep:career('startup')},
  tp_m21_2:{keep:career('startup')}, tp_m24_1:{keep:career('restaurateur')},
  tp_m25_0:{keep:{custom:'study'}}, tp_m27_2:{keep:career('ecommerce')},
  tp_m28_2:{keep:career('startup')}, tp_m29_2:{keep:career('artisan')},
  tp_m30_1:{keep:career('investor')}, tp_m31_0:{open:{money:-0.02}},
  tp_m32_1:{open:{support:{who:'kids',level:'hau'}}},
  tp_m33_0:{open:loan(0.15)}, tp_m33_1:{open:help(0.08,'sibling')}, tp_m33_2:{keep:career('fashion')},
  tp_m34_2:{keep:career('restaurateur')}, tp_m36_0:{keep:{support:{who:'kids',level:'hau'}}},
  tp_m40_2:{open:help(0.1,'childhood_friend')}, tp_m41_1:{keep:career('artisan')},
  tp_m43_1:{keep:career('street_vendor')}, tp_m49_1:{open:{flags:['tp_family_stake_agreement']}},
  tp_m50_0:{open:c=>{const x=Math.min(0.2,c.debt/Math.max(300,c.income));return {money:-x,custom:'repay:'+x};}},
  tp_l06_1:{keep:career('tv_host')}, tp_l08_1:{open:{flags:['tp_chess_circle']}},
  tp_l12_2:{open:{flags:['tp_delayed_proposal']}}, tp_l13_0:{open:{flags:['tp_confessed_fake_date']}},
  tp_l15_2:{keep:career('restaurateur')}, tp_l19_1:{keep:career('writer')},
  tp_l20_2:{keep:career('writer')}, tp_l26_1:{keep:career('coach')},
  tp_l28_1:{open:{custom:'study'}}, tp_l28_2:{keep:career('writer')},
  tp_l34_0:{open:{flags:['tp_child_names_agreed']}}, tp_l35_1:{open:{flags:['tp_split_household_budget']}},
  tp_l36_1:{keep:career('tour_guide')}, tp_l39_0:{keep:{support:{who:'kids',level:'hau'}}},
  tp_l47_2:{open:{know:3,flags:['tp_online_correspondence']}},
};
export function linkedEffect(id: string, route: number, stage: Stage, ctx: FactContext): Effect {
  const e = LINKS[id+'_'+route]?.[stage];
  return typeof e === 'function' ? e(ctx) : e ?? {};
}
