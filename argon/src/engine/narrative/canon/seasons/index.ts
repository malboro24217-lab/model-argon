/** 5 mùa thường (đợt A). Mùa của nhánh kỳ dị nằm ở canon/weird/. */
import type { SeasonDef } from "../Season.ts";
import { TRON_CHAY } from "./tron_chay.ts";
import { VU_AN_GIA_TOC } from "./vu_an_gia_toc.ts";
import { NGOI_SAO } from "./ngoi_sao.ts";
import { LAM_LAI } from "./lam_lai.ts";
import { XU_NGUOI } from "./xu_nguoi.ts";

export const SEASONS_NORMAL: SeasonDef[] = [TRON_CHAY, VU_AN_GIA_TOC, NGOI_SAO, LAM_LAI, XU_NGUOI];
