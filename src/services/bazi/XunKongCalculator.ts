import { EightChar } from 'lunar-typescript';

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
  static calculateHourXunKong(eightChar: EightChar): string {
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
    hourXunKong: string;
  } {
    return {
      yearXunKong: this.calculateYearXunKong(eightChar),
      monthXunKong: this.calculateMonthXunKong(eightChar),
      dayXunKong: this.calculateDayXunKong(eightChar),
      hourXunKong: this.calculateHourXunKong(eightChar)
    };
  }

  /**
   * 根据干支计算旬空（备用方法）
   * @param ganZhi 干支
   * @returns 旬空
   */
  static calculateXunKongByGanZhi(ganZhi: string): string {
    if (ganZhi.length !== 2) {
      return '';
    }

    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);

    // 旬空表 - 根据天干确定旬，然后确定旬空
    const xunKongMap: { [key: string]: string } = {
      // 甲子旬：戌亥空
      '甲': '戌亥',
      '乙': '戌亥',
      '丙': '戌亥',
      '丁': '戌亥',
      '戊': '戌亥',
      '己': '戌亥',
      '庚': '戌亥',
      '辛': '戌亥',
      '壬': '戌亥',
      '癸': '戌亥'
    };

    // 更精确的旬空计算
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const stemIndex = stems.indexOf(stem);
    const branchIndex = branches.indexOf(branch);

    if (stemIndex === -1 || branchIndex === -1) {
      return '';
    }

    // 计算旬首
    const xunShouBranchIndex = stemIndex % 12;
    
    // 旬空是旬首后面的两个地支
    const kongWang1Index = (xunShouBranchIndex + 10) % 12;
    const kongWang2Index = (xunShouBranchIndex + 11) % 12;

    return branches[kongWang1Index] + branches[kongWang2Index];
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
    hour: { xun: string; xunKong: string; isKong: boolean };
  } {
    const yearBranch = eightChar.getYearZhi();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const hourBranch = eightChar.getTimeZhi();

    const yearXunKong = this.calculateYearXunKong(eightChar);
    const monthXunKong = this.calculateMonthXunKong(eightChar);
    const dayXunKong = this.calculateDayXunKong(eightChar);
    const hourXunKong = this.calculateHourXunKong(eightChar);

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
      hour: {
        xun: eightChar.getTimeXun() || '',
        xunKong: hourXunKong,
        isKong: this.isBranchInXunKong(hourBranch, hourXunKong)
      }
    };
  }
}
