import { EightChar } from 'lunar-typescript';
import { BaziCalculator } from './BaziCalculator';

/**
 * 旬空计算器
 * 专门负责计算四柱的旬空信息
 */
export class XunKongCalculator {
  /**
   * 计算年柱旬空
   * @param eightChar 八字对象
   * @returns 年柱旬空
   */
  static calculateYearXunKong(eightChar: EightChar): string {
    try {
      // 先获取旬，再获取旬空
      const yearXun = eightChar.getYearXun();
      if (yearXun) {
        return eightChar.getYearXunKong();
      }
    } catch (e) {
      console.error('计算年柱旬空出错:', e);
    }
    return '';
  }

  /**
   * 计算月柱旬空
   * @param eightChar 八字对象
   * @returns 月柱旬空
   */
  static calculateMonthXunKong(eightChar: EightChar): string {
    try {
      // 先获取旬，再获取旬空
      const monthXun = eightChar.getMonthXun();
      if (monthXun) {
        return eightChar.getMonthXunKong();
      }
    } catch (e) {
      console.error('计算月柱旬空出错:', e);
    }
    return '';
  }

  /**
   * 计算日柱旬空
   * @param eightChar 八字对象
   * @returns 日柱旬空
   */
  static calculateDayXunKong(eightChar: EightChar): string {
    try {
      // 先获取旬，再获取旬空
      const dayXun = eightChar.getDayXun();
      if (dayXun) {
        return eightChar.getDayXunKong();
      }
    } catch (e) {
      console.error('计算日柱旬空出错:', e);
    }
    return '';
  }

  /**
   * 计算时柱旬空
   * @param eightChar 八字对象
   * @returns 时柱旬空
   */
  static calculateTimeXunKong(eightChar: EightChar): string {
    try {
      // 先获取旬，再获取旬空
      const timeXun = eightChar.getTimeXun();
      if (timeXun) {
        return eightChar.getTimeXunKong();
      }
    } catch (e) {
      console.error('计算时柱旬空出错:', e);
    }
    return '';
  }

  /**
   * 计算所有四柱的旬空信息
   * @param eightChar 八字对象
   * @returns 四柱旬空信息
   */
  static calculateAllXunKong(eightChar: EightChar): {
    yearXunKong: string;
    monthXunKong: string;
    dayXunKong: string;
    timeXunKong: string;
  } {
    return {
      yearXunKong: this.calculateYearXunKong(eightChar),
      monthXunKong: this.calculateMonthXunKong(eightChar),
      dayXunKong: this.calculateDayXunKong(eightChar),
      timeXunKong: this.calculateTimeXunKong(eightChar)
    };
  }

  /**
   * 根据干支计算旬空（使用统一的BaziCalculator方法）
   * @param ganZhi 干支
   * @returns 旬空
   */
  static calculateXunKongByGanZhi(ganZhi: string): string {
    if (ganZhi.length !== 2) {
      return '';
    }

    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);

    // 使用统一的BaziCalculator方法
    return BaziCalculator.calculateXunKong(stem, branch);
  }

  /**
   * 检查地支是否在旬空中
   * @param branch 地支
   * @param xunKong 旬空
   * @returns 是否在旬空中
   */
  static isBranchInXunKong(branch: string, xunKong: string): boolean {
    return xunKong.includes(branch);
  }

  /**
   * 获取旬空的详细信息
   * @param eightChar 八字对象
   * @returns 旬空详细信息
   */
  static getXunKongDetails(eightChar: EightChar): {
    year: { xun: string; xunKong: string; isKong: boolean };
    month: { xun: string; xunKong: string; isKong: boolean };
    day: { xun: string; xunKong: string; isKong: boolean };
    time: { xun: string; xunKong: string; isKong: boolean };
  } {
    const yearBranch = eightChar.getYearZhi();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const timeBranch = eightChar.getTimeZhi();

    const yearXunKong = this.calculateYearXunKong(eightChar);
    const monthXunKong = this.calculateMonthXunKong(eightChar);
    const dayXunKong = this.calculateDayXunKong(eightChar);
    const timeXunKong = this.calculateTimeXunKong(eightChar);

    return {
      year: {
        xun: eightChar.getYearXun() || '',
        xunKong: yearXunKong,
        isKong: this.isBranchInXunKong(yearBranch, yearXunKong)
      },
      month: {
        xun: eightChar.getMonthXun() || '',
        xunKong: monthXunKong,
        isKong: this.isBranchInXunKong(monthBranch, monthXunKong)
      },
      day: {
        xun: eightChar.getDayXun() || '',
        xunKong: dayXunKong,
        isKong: this.isBranchInXunKong(dayBranch, dayXunKong)
      },
      time: {
        xun: eightChar.getTimeXun() || '',
        xunKong: timeXunKong,
        isKong: this.isBranchInXunKong(timeBranch, timeXunKong)
      }
    };
  }
}
