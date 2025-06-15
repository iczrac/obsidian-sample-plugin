import { HeavenlyStem, EarthlyBranch } from './types';

const STEMS: HeavenlyStem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

export class BaziCalculator {
  private static isAfterSpringStart(year: number, month: number, day: number): boolean {
    // TODO: 实现立春判断逻辑
    return month > 2 || (month === 2 && day >= 4);
  }

  static calculate(year: number, month: number, day: number, time: number): {
    yearStem: HeavenlyStem;
    yearBranch: EarthlyBranch;
    monthStem: HeavenlyStem;
    monthBranch: EarthlyBranch;
    dayStem: HeavenlyStem;
    dayBranch: EarthlyBranch;
    timeStem: HeavenlyStem;
    timeBranch: EarthlyBranch;
  } {
    // 年柱计算（考虑立春分界）
    const calcYear = this.isAfterSpringStart(year, month, day) ? year : year - 1;
    const yearIndex = (calcYear - 4) % 60 % 10; // 天干循环周期
    const yearStem = STEMS[yearIndex];
    const yearBranch = BRANCHES[(calcYear - 4) % 12];

    return {
      yearStem,
      yearBranch,
      monthStem: '乙', // TODO: 实现月柱计算
      monthBranch: '丑',
      dayStem: '丙', // TODO: 实现日柱计算
      dayBranch: '寅',
      timeStem: '丁', // TODO: 实现时柱计算
      timeBranch: '卯'
    };
  }
}