import { Solar } from 'lunar-typescript';

/**
 * 年份匹配计算器
 * 专门负责根据八字推算可能的年份
 */
export class YearMatchCalculator {
  /**
   * 根据年柱干支计算匹配的年份列表
   * @param yearStem 年干
   * @param yearBranch 年支
   * @returns 匹配的年份数组
   */
  static calculateMatchingYears(yearStem: string, yearBranch: string): number[] {
    let matchingYears: number[] = [];

    // 首先尝试使用lunar-typescript库的方法
    try {
      const yearPillar = yearStem + yearBranch;
      const solarList = Solar.fromBaZi(yearPillar, '', '', '');
      
      if (solarList && solarList.length > 0) {
        matchingYears = solarList.map(solar => solar.getYear());
        console.log('使用lunar-typescript库获取匹配年份:', matchingYears);
        return matchingYears;
      }
    } catch (error) {
      console.error('使用lunar-typescript获取匹配年份出错:', error);
    }

    // 如果lunar-typescript方法失败，使用传统计算方法
    console.log('使用传统方法计算匹配年份');
    return this.calculateMatchingYearsByTraditionalMethod(yearStem, yearBranch);
  }

  /**
   * 使用传统方法计算匹配年份
   * @param yearStem 年干
   * @param yearBranch 年支
   * @returns 匹配的年份数组
   */
  private static calculateMatchingYearsByTraditionalMethod(yearStem: string, yearBranch: string): number[] {
    const matchingYears: number[] = [];

    // 天干序号（甲=0, 乙=1, ..., 癸=9）
    const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
    // 地支序号（子=0, 丑=1, ..., 亥=11）
    const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      console.error('无效的年干或年支:', yearStem, yearBranch);
      return matchingYears;
    }

    // 计算匹配的年份列表
    const currentYear = new Date().getFullYear();
    const startYear = 1700; // 从1700年开始查找，确保覆盖17XX-19XX年
    const endYear = currentYear + 120;   // 查找到120年后（2个甲子）

    // 查找符合年柱的年份
    for (let year = startYear; year <= endYear; year++) {
      // 计算天干序号：年份减去4，除以10的余数
      const stemCheck = (year - 4) % 10;
      // 计算地支序号：年份减去4，除以12的余数
      const branchCheck = (year - 4) % 12;

      if (stemCheck === stemIndex && branchCheck === branchIndex) {
        matchingYears.push(year);
      }
    }

    return matchingYears;
  }

  /**
   * 根据指定年份和八字信息推算最可能的年份
   * @param yearStem 年干
   * @param yearBranch 年支
   * @param specifiedYear 指定的年份（可选）
   * @returns 最可能的年份
   */
  static findMostLikelyYear(yearStem: string, yearBranch: string, specifiedYear?: string): number | null {
    const matchingYears = this.calculateMatchingYears(yearStem, yearBranch);
    
    if (matchingYears.length === 0) {
      return null;
    }

    // 如果指定了年份，查找最接近的匹配年份
    if (specifiedYear) {
      const targetYear = parseInt(specifiedYear);
      if (!isNaN(targetYear)) {
        // 查找最接近指定年份的匹配年份
        let closestYear = matchingYears[0];
        let minDiff = Math.abs(matchingYears[0] - targetYear);

        for (const year of matchingYears) {
          const diff = Math.abs(year - targetYear);
          if (diff < minDiff) {
            minDiff = diff;
            closestYear = year;
          }
        }

        return closestYear;
      }
    }

    // 如果没有指定年份，返回最接近当前年份的匹配年份
    const currentYear = new Date().getFullYear();
    let closestYear = matchingYears[0];
    let minDiff = Math.abs(matchingYears[0] - currentYear);

    for (const year of matchingYears) {
      const diff = Math.abs(year - currentYear);
      if (diff < minDiff) {
        minDiff = diff;
        closestYear = year;
      }
    }

    return closestYear;
  }

  /**
   * 验证年份是否与年柱匹配
   * @param year 年份
   * @param yearStem 年干
   * @param yearBranch 年支
   * @returns 是否匹配
   */
  static validateYearMatch(year: number, yearStem: string, yearBranch: string): boolean {
    const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
    const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      return false;
    }

    const stemCheck = (year - 4) % 10;
    const branchCheck = (year - 4) % 12;

    return stemCheck === stemIndex && branchCheck === branchIndex;
  }

  /**
   * 获取年份对应的干支
   * @param year 年份
   * @returns 年份对应的干支
   */
  static getYearGanZhi(year: number): string {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;

    return stems[stemIndex] + branches[branchIndex];
  }

  /**
   * 获取年份范围内的所有干支年份
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @returns 年份和干支的映射
   */
  static getYearGanZhiRange(startYear: number, endYear: number): Array<{ year: number; ganZhi: string }> {
    const result: Array<{ year: number; ganZhi: string }> = [];

    for (let year = startYear; year <= endYear; year++) {
      result.push({
        year,
        ganZhi: this.getYearGanZhi(year)
      });
    }

    return result;
  }

  /**
   * 获取指定干支的下一个出现年份
   * @param currentYear 当前年份
   * @param targetGanZhi 目标干支
   * @returns 下一个出现的年份
   */
  static getNextYearForGanZhi(currentYear: number, targetGanZhi: string): number | null {
    if (targetGanZhi.length !== 2) {
      return null;
    }

    const yearStem = targetGanZhi.charAt(0);
    const yearBranch = targetGanZhi.charAt(1);

    // 从当前年份的下一年开始查找
    for (let year = currentYear + 1; year <= currentYear + 60; year++) {
      if (this.validateYearMatch(year, yearStem, yearBranch)) {
        return year;
      }
    }

    return null;
  }
}
