export { PATH_LIST, PATHS, PATH_GROUPS, type PathDef, type PathKind } from "./registry.ts";
import type { Storylet } from "../types.ts";
import { SINGER } from "./singer.ts";
import { PACK_NEWS_A } from "./news_a.ts";
import { PACK_NEWS_B } from "./news_b.ts";
import { PACK_STREET_A } from "./street_a.ts";
import { PACK_AWAY_B } from "./away_b.ts";
import { PACK_AWAY_A } from "./away_a.ts";
import { PACK_SPORT_B } from "./sport_b.ts";
import { PACK_UNDER_B } from "./under_b.ts";
import { PACK_UNDER_A } from "./under_a.ts";
import { PACK_MIND_B } from "./mind_b.ts";
import { PACK_MIND_A } from "./mind_a.ts";
import { PACK_ROAD_B } from "./road_b.ts";
import { PACK_ARTS_B } from "./arts_b.ts";
import { PACK_ARTS_A } from "./arts_a.ts";
import { PACK_MEDIA_A } from "./media_a.ts";
import { PACK_MEDIA_B } from "./media_b.ts";
import { PACK_MONEY_A } from "./money_a.ts";
import { PACK_MONEY_B } from "./money_b.ts";
import { PACK_ROAD_A } from "./road_a.ts";
import { PACK_SERVE_A } from "./serve_a.ts";
import { PACK_SERVE_B } from "./serve_b.ts";
import { PACK_SPORT_A } from "./sport_a.ts";
import { PACK_STATE_A } from "./state_a.ts";
import { PACK_STATE_B } from "./state_b.ts";

/** Mọi thẻ của 96 con đường + thời sự. Các gói mới thêm vào mảng này. */
export const PATH_STORYLETS: Storylet[] = [
  ...SINGER,
  ...PACK_NEWS_A,
  ...PACK_NEWS_B,
  ...PACK_STREET_A,
  ...PACK_AWAY_B,
  ...PACK_AWAY_A,
  ...PACK_SPORT_B,
  ...PACK_UNDER_B,
  ...PACK_UNDER_A,
  ...PACK_MIND_B,
  ...PACK_MIND_A,
  ...PACK_ROAD_B,
  ...PACK_ARTS_B,
  ...PACK_ARTS_A,
  ...PACK_MEDIA_A,
  ...PACK_MEDIA_B,
  ...PACK_MONEY_A,
  ...PACK_MONEY_B,
  ...PACK_ROAD_A,
  ...PACK_SERVE_A,
  ...PACK_SERVE_B,
  ...PACK_SPORT_A,
  ...PACK_STATE_A,
  ...PACK_STATE_B,
];
