export { AXES, AXIS_VN, CANON_THRESHOLD, CANON_GAP, CANON_MAX, CANON_AGES, FORCE_FIRST_AT, FORCE_SECOND_AT, DISCHARGE, WEIRD_DOOR_AT, basePressure, pressureOf, dueAxis } from "./Pressure.ts";
/* ---- Task 4: khung Mùa ---- */
export { BEATS, BEAT_VN, SEASON_END_MAX, SEASON_MIN, seasonLength, beatGap, isDurable, addCustom, seasonKitFromNames, compileSeason } from "./Season.ts";
export type { BeatName, SeasonKit, BeatCard, NewCast, Landing, SeasonDef } from "./Season.ts";
import { compileSeason as compileSeasonFn, type SeasonDef as SeasonDefT } from "./Season.ts";
import { FIXTURE_SEASON } from "./seasons/_fixture.ts";
/** Mùa thường đã đăng ký. Task 6 thay mùa mẫu bằng 5 mùa thật (và thêm WEIRD). */
export const SEASONS: SeasonDefT[] = [FIXTURE_SEASON];
/** Mọi thẻ mùa, host nối vào kho major (Task 7). */
export const SEASON_STORYLETS = SEASONS.flatMap(compileSeasonFn);
