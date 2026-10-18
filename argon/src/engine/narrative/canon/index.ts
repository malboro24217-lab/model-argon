export { AXES, AXIS_VN, CANON_THRESHOLD, CANON_GAP, CANON_MAX, CANON_AGES, FORCE_FIRST_AT, FORCE_SECOND_AT, DISCHARGE, WEIRD_DOOR_AT, basePressure, pressureOf, dueAxis } from "./Pressure.ts";
export { strongestPlant, plantFlag } from "./Plants.ts";
export { pickScars, scarText, type Scars } from "./Scars.ts";
/* ---- Task 4: khung Mùa ---- */
export { BEATS, BEAT_VN, SEASON_END_MAX, SEASON_MIN, seasonLength, beatGap, isDurable, addCustom, landingOf, gagStart, seasonKitFromNames, compileSeason } from "./Season.ts";
export type { BeatName, SeasonKit, BeatCard, NewCast, Landing, SeasonDef } from "./Season.ts";
import { compileSeason as compileSeasonFn, type SeasonDef as SeasonDefT } from "./Season.ts";
import { FIXTURE_SEASON } from "./seasons/_fixture.ts";
/** Mùa thường đã đăng ký. Task 6 thay mùa mẫu bằng 5 mùa thật (và thêm WEIRD). */
export const SEASONS: SeasonDefT[] = [FIXTURE_SEASON];
/* ---- Task 5: generator canon event ---- */
export { generateCanon, fillSlots, canonView, GENERIC_DOORS, playedFlag } from "./Canon.ts";
export type { DoorKind, Slots, SeedDoor, CanonSeed, WeirdBranch, ResolvedDoor, CanonEvent } from "./Canon.ts";
import type { CanonSeed as CanonSeedT, WeirdBranch as WeirdBranchT } from "./Canon.ts";
/** Mầm canon event đã đăng ký (Task 6b điền). */
export const CANON_SEEDS: CanonSeedT[] = [];
import { WEIRD_ALL } from "./weird/index.ts";
/** Nhánh kỳ dị đã đăng ký: nối 10 đợt trong canon/weird/ (mỗi đợt sửa file của mình, không sửa ở đây). */
export const WEIRD: WeirdBranchT[] = WEIRD_ALL;
/** Mọi thẻ mùa (mùa thường và mùa của nhánh kỳ dị), host nối vào kho major (Task 7). */
export const SEASON_STORYLETS = [...SEASONS, ...WEIRD.map((b) => b.season)].flatMap(compileSeasonFn);
