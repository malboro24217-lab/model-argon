export { PATH_LIST, PATHS, PATH_GROUPS, type PathDef, type PathKind } from "./registry.ts";
import type { Storylet } from "../types.ts";
import { SINGER } from "./singer.ts";

/** Mọi thẻ của 96 con đường + thời sự. Các gói mới thêm vào mảng này. */
export const PATH_STORYLETS: Storylet[] = [
  ...SINGER,
];
