/**
 * 100 nhánh kỳ dị (spec 2026-10-18-canon-event §7), mỗi đợt 10 nhánh một file. Đợt mới chỉ sửa file của mình,
 * không sửa file này. WEIRD_ALL dựng từ import (không push về sau): SEASON_STORYLETS tính lúc nạp module.
 */
import type { WeirdBranch } from "../Canon.ts";
import { SF_01 } from "./sf_01.ts";
import { SF_11 } from "./sf_11.ts";
import { SF_21 } from "./sf_21.ts";
import { SF_31 } from "./sf_31.ts";
import { SF_41 } from "./sf_41.ts";
import { ABS_01 } from "./abs_01.ts";
import { ABS_11 } from "./abs_11.ts";
import { ABS_21 } from "./abs_21.ts";
import { ABS_31 } from "./abs_31.ts";
import { ABS_41 } from "./abs_41.ts";

export const WEIRD_ALL: WeirdBranch[] = [
  ...SF_01, ...SF_11, ...SF_21, ...SF_31, ...SF_41,
  ...ABS_01, ...ABS_11, ...ABS_21, ...ABS_31, ...ABS_41,
];
