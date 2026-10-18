export { AXES, AXIS_VN, CANON_THRESHOLD, CANON_GAP, CANON_MAX, CANON_AGES, FORCE_FIRST_AT, FORCE_SECOND_AT, DISCHARGE, WEIRD_DOOR_AT, basePressure, pressureOf, dueAxis } from "./Pressure.ts";
export { strongestPlant, plantFlag } from "./Plants.ts";
export { pickScars, scarText, type Scars } from "./Scars.ts";
/* ---- Task 4: khung Mùa ---- */
export { BEATS, BEAT_VN, SEASON_END_MAX, SEASON_MIN, seasonLength, beatGap, isDurable, addCustom, landingOf, gagStart, seasonKitFromNames, compileSeason } from "./Season.ts";
export type { BeatName, SeasonKit, BeatCard, NewCast, Landing, SeasonDef } from "./Season.ts";
import { compileSeason as compileSeasonFn, type SeasonDef as SeasonDefT } from "./Season.ts";
import { SEASONS_NORMAL } from "./seasons/index.ts";
export { SEASONS_NORMAL };
/** Mùa thường đã đăng ký (5 mùa đợt A). */
export const SEASONS: SeasonDefT[] = [...SEASONS_NORMAL];
/** Mọi thẻ mùa, host nối vào kho major (Task 7). */
export const SEASON_STORYLETS = SEASONS.flatMap(compileSeasonFn);
