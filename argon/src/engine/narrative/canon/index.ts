export { AXES, AXIS_VN, CANON_THRESHOLD, KY_THRESHOLD, CANON_GAP, CANON_MAX, CANON_AGES, FORCE_FIRST_AT, FORCE_SECOND_AT, DISCHARGE, WEIRD_DOOR_AT, AXIS_GAIN, AXIS_FATIGUE, axisFlag, axisFired, NEMESIS_AT, nemesisOf, basePressure, pressureOf, dueAxis } from "./Pressure.ts";
export { strongestPlant, plantFlag } from "./Plants.ts";
export { pickScars, scarText, type Scars } from "./Scars.ts";
/* ---- Task 20c: vật gài được dùng dần ---- */
export { rankPlants, freshPlant, usePlants, eventPlants, settledPlant, dropPlants, type PlantRef } from "./Plants.ts";
export { scarPlants } from "./Scars.ts";
/* ---- Task 4: khung Mùa ---- */
export { BEATS, BEAT_VN, SEASON_END_MAX, SEASON_MIN, RESET_CASH_KEEP, resetCashDelta, seasonLength, beatGap, isDurable, addCustom, landingOf, gagStart, seasonKitFromNames, compileSeason } from "./Season.ts";
export type { BeatName, SeasonKit, BeatCard, NewCast, Landing, SeasonDef } from "./Season.ts";
import { compileSeason as compileSeasonFn, type SeasonDef as SeasonDefT } from "./Season.ts";
import { SEASONS_NORMAL } from "./seasons/index.ts";
export { SEASONS_NORMAL };
/** Mùa thường đã đăng ký (5 mùa đợt A). */
export const SEASONS: SeasonDefT[] = [...SEASONS_NORMAL];
/* ---- Task 5: generator canon event ---- */
export { generateCanon, fillSlots, canonView, GENERIC_DOORS, playedFlag } from "./Canon.ts";
export type { DoorKind, Slots, SeedDoor, CanonSeed, WeirdBranch, ResolvedDoor, CanonEvent } from "./Canon.ts";
import type { WeirdBranch as WeirdBranchT } from "./Canon.ts";
/** Mầm canon event đã đăng ký (Task 6b: 8 mầm đợt A). */
export { CANON_SEEDS } from "./seeds.ts";
import { WEIRD_ALL } from "./weird/index.ts";
/** Nhánh kỳ dị đã đăng ký: nối 10 đợt trong canon/weird/ (mỗi đợt sửa file của mình, không sửa ở đây). */
export const WEIRD: WeirdBranchT[] = WEIRD_ALL;
/** Mọi thẻ mùa (mùa thường và mùa của nhánh kỳ dị), host nối vào kho major (Task 7). */
export const SEASON_STORYLETS = [...SEASONS, ...WEIRD.map((b) => b.season)].flatMap(compileSeasonFn);
export { CODEX_PLANTS, CODEX_SEASON_TAGS, NORMAL_SEASON_IDS, ABS_SEASON_IDS, ABSURD_TAG_EXCLUDE, TONE_PRESSURE, ABSURD_KY, pressureFor, type CodexMap } from "./codexPlants.ts";
