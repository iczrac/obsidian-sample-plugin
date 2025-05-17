/**
 * 八字信息接口
 */
export interface BaziInfo {
  // 基本信息
  solarDate?: string;
  solarTime?: string;
  lunarDate?: string;
  gender?: string;

  // 八字信息
  yearStem?: string;
  yearBranch?: string;
  monthStem?: string;
  monthBranch?: string;
  dayStem?: string;
  dayBranch?: string;
  hourStem?: string;
  hourBranch?: string;

  // 五行信息
  yearWuXing?: string;
  monthWuXing?: string;
  dayWuXing?: string;
  hourWuXing?: string;

  // 藏干信息
  yearHideGan?: string | string[];
  monthHideGan?: string | string[];
  dayHideGan?: string | string[];
  hourHideGan?: string | string[];

  // 纳音信息
  yearNaYin?: string;
  monthNaYin?: string;
  dayNaYin?: string;
  hourNaYin?: string;

  // 生肖信息
  yearShengXiao?: string;
  monthShengXiao?: string;
  dayShengXiao?: string;
  hourShengXiao?: string;

  // 旬空信息
  yearXunKong?: string;
  monthXunKong?: string;
  dayXunKong?: string;
  hourXunKong?: string;

  // 特殊信息
  taiYuan?: string;
  mingGong?: string;

  // 大运信息
  daYun?: DaYunInfo[];

  // 流年信息
  liuNian?: LiuNianInfo[];

  // 小运信息
  xiaoYun?: XiaoYunInfo[];

  // 流月信息
  liuYue?: LiuYueInfo[];
}

/**
 * 大运信息接口
 */
export interface DaYunInfo {
  startYear: number;
  endYear?: number;
  startAge: number;
  endAge?: number;
  index?: number;
  ganZhi: string;
  naYin?: string;
  xunKong?: string;
}

/**
 * 流年信息接口
 */
export interface LiuNianInfo {
  year: number;
  age: number;
  index?: number;
  ganZhi: string;
  naYin?: string;
  xunKong?: string;
}

/**
 * 小运信息接口
 */
export interface XiaoYunInfo {
  year: number;
  age: number;
  index?: number;
  ganZhi: string;
  naYin?: string;
  xunKong?: string;
}

/**
 * 流月信息接口
 */
export interface LiuYueInfo {
  year?: number;
  month: string | number;
  index?: number;
  ganZhi: string;
  xunKong?: string;
}
