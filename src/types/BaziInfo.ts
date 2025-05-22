/**
 * 八字信息接口
 */
export interface BaziInfo {
  // 基本信息
  solarDate?: string;
  solarTime?: string;
  lunarDate?: string;
  gender?: string;
  birthYear?: string; // 出生年份
  matchingYears?: number[]; // 匹配的年份列表
  specifiedYear?: number; // 用户指定的年份

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
  taiYuanNaYin?: string;
  mingGongNaYin?: string;

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
  timeXunKong?: string;

  // 十神信息
  yearShiShenGan?: string;
  monthShiShenGan?: string;
  dayShiShenGan?: string;
  timeShiShenGan?: string;
  yearShiShen?: string;
  monthShiShen?: string;
  dayShiShen?: string;
  hourShiShen?: string;

  // 地支十神信息
  yearShiShenZhi?: string | string[];
  monthShiShenZhi?: string | string[];
  dayShiShenZhi?: string | string[];
  hourShiShenZhi?: string | string[];

  // 地势（长生十二神）信息
  yearDiShi?: string;
  monthDiShi?: string;
  dayDiShi?: string;
  timeDiShi?: string;
  hourDiShi?: string;

  // 神煞信息
  shenSha?: string[];
  yearShenSha?: string[];
  monthShenSha?: string[];
  dayShenSha?: string[];
  hourShenSha?: string[];

  // 格局信息
  geJu?: string;
  geJuDetail?: string;
  geJuStrength?: number | string; // 格局强度
  yongShen?: string;       // 用神
  yongShenDetail?: string; // 用神详情
  geJuFactors?: { // 格局形成因素
    factor: string;
    description: string;
    contribution: number;
  }[];

  // 特殊信息
  taiYuan?: string;
  mingGong?: string;
  shenGong?: string;
  taiXi?: string; // 胎息
  zodiac?: string; // 星座
  jieQi?: string; // 节气
  nextJieQi?: string; // 下一节气
  dayYi?: string[]; // 宜
  dayJi?: string[]; // 忌

  // 大运信息
  daYun?: DaYunInfo[] | string; // 可以是DaYunInfo数组或者逗号分隔的干支字符串
  daYunStartAge?: number; // 大运起始年龄
  qiYunYear?: number; // 起运年份
  qiYunDate?: string; // 起运日期
  qiYunAge?: number; // 起运年龄
  qiYunMonth?: number; // 起运月份
  qiYunDay?: number; // 起运天数
  qiYunHour?: number; // 起运小时数

  // 流年信息
  liuNian?: LiuNianInfo[];

  // 小运信息
  xiaoYun?: XiaoYunInfo[];

  // 流月信息
  liuYue?: LiuYueInfo[];

  // 五行强度
  wuXingStrength?: {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
  };

  // 日主旺衰
  riZhuStrength?: string;

  // 日主旺衰详情
  riZhuStrengthDetails?: any;

  // 柱信息
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;

  // 设置信息
  baziSect?: string;
  showWuxing?: boolean;
  showSpecialInfo?: boolean;
  calculationMethod?: string;
  originalDate?: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };

  // 完整信息
  fullString?: string;
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
  shiShenGan?: string;
  shiShenZhi?: string | string[];
  diShi?: string;
  shenSha?: string[];
  geJu?: string;
  wuXingStrength?: {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
  };
  riZhuStrength?: string;
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
  shiShenGan?: string;
  shiShenZhi?: string | string[];
  diShi?: string;
  shenSha?: string[];
  geJu?: string;
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
  shiShenGan?: string;
  shiShenZhi?: string | string[];
  diShi?: string;
  shenSha?: string[];
}

/**
 * 流月信息接口
 */
export interface LiuYueInfo {
  year?: number;
  month: string | number;
  index?: number;
  ganZhi: string;
  naYin?: string;
  xunKong?: string;
  shiShenGan?: string;
  shiShenZhi?: string | string[];
  diShi?: string;
  shenSha?: string[];
}
