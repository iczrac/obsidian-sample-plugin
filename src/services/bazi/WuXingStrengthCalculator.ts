import { BaziUtils } from './BaziUtils';
import { BaziCalculator } from './BaziCalculator';

/**
 * 五行强度计算模块
 * 专门处理五行强度计算和日主旺衰判断
 */
export class WuXingStrengthCalculator {
  /**
   * 计算五行强度
   * @param eightChar 八字对象
   * @returns 五行强度对象
   */
  static calculateWuXingStrength(eightChar: any): {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
  } {
    const strength = {
      jin: 0,
      mu: 0,
      shui: 0,
      huo: 0,
      tu: 0
    };

    try {
      // 获取四柱干支
      const yearStem = eightChar.getYearGan();
      const yearBranch = eightChar.getYearZhi();
      const monthStem = eightChar.getMonthGan();
      const monthBranch = eightChar.getMonthZhi();
      const dayStem = eightChar.getDayGan();
      const dayBranch = eightChar.getDayZhi();
      const hourStem = eightChar.getTimeGan();
      const hourBranch = eightChar.getTimeZhi();

      // 计算天干五行强度（每个天干基础分值为1.0）
      this.addWuXingStrength(BaziUtils.getStemWuXing(yearStem), 1.0, strength);
      this.addWuXingStrength(BaziUtils.getStemWuXing(monthStem), 1.0, strength);
      this.addWuXingStrength(BaziUtils.getStemWuXing(dayStem), 1.0, strength);
      this.addWuXingStrength(BaziUtils.getStemWuXing(hourStem), 1.0, strength);

      // 计算地支五行强度（每个地支基础分值为0.8）
      this.addWuXingStrength(BaziUtils.getBranchWuXing(yearBranch), 0.8, strength);
      this.addWuXingStrength(BaziUtils.getBranchWuXing(monthBranch), 0.8, strength);
      this.addWuXingStrength(BaziUtils.getBranchWuXing(dayBranch), 0.8, strength);
      this.addWuXingStrength(BaziUtils.getBranchWuXing(hourBranch), 0.8, strength);

      // 计算地支藏干五行强度
      this.processHideGanForStrength([yearBranch, monthBranch, dayBranch, hourBranch], strength);

      // 根据月令季节调整五行强度
      this.adjustByMonthSeason(monthBranch, strength);

      // 根据组合关系调整五行强度
      this.adjustByCombination(eightChar, strength);

    } catch (error) {
      console.error('计算五行强度出错:', error);
    }

    return strength;
  }

  /**
   * 添加五行强度
   * @param wuXing 五行
   * @param value 强度值
   * @param strength 强度对象
   */
  private static addWuXingStrength(wuXing: string, value: number, strength: any): void {
    if (!wuXing) return;

    switch (wuXing) {
      case '金':
        strength.jin += value;
        break;
      case '木':
        strength.mu += value;
        break;
      case '水':
        strength.shui += value;
        break;
      case '火':
        strength.huo += value;
        break;
      case '土':
        strength.tu += value;
        break;
    }
  }

  /**
   * 处理地支藏干的五行强度
   * @param branches 地支数组
   * @param strength 强度对象
   */
  private static processHideGanForStrength(branches: string[], strength: any): void {
    for (const branch of branches) {
      const hideGanStr = BaziCalculator.getHideGan(branch);
      if (hideGanStr) {
        const hideGanArray = hideGanStr.split(',');
        for (let i = 0; i < hideGanArray.length; i++) {
          const hideGan = hideGanArray[i].trim();
          const wuXing = BaziUtils.getStemWuXing(hideGan);
          // 藏干的强度递减：本气1.0，中气0.6，余气0.3
          const hideGanValue = i === 0 ? 1.0 : (i === 1 ? 0.6 : 0.3);
          this.addWuXingStrength(wuXing, hideGanValue * 0.5, strength); // 藏干整体权重减半
        }
      }
    }
  }

  /**
   * 根据月令季节调整五行强度
   * @param monthBranch 月支
   * @param strength 强度对象
   */
  private static adjustByMonthSeason(monthBranch: string, strength: any): void {
    // 根据月令季节调整五行强度
    // 春季(寅卯辰)：木旺(+1.0)，火相(+0.5)，土休，金囚，水死
    // 夏季(巳午未)：火旺(+1.0)，土相(+0.5)，金休，水囚，木死
    // 秋季(申酉戌)：金旺(+1.0)，水相(+0.5)，木休，火囚，土死
    // 冬季(亥子丑)：水旺(+1.0)，木相(+0.5)，火休，土囚，金死

    const seasonMap: {[key: string]: string} = {
      '寅': '春', '卯': '春', '辰': '春',
      '巳': '夏', '午': '夏', '未': '夏',
      '申': '秋', '酉': '秋', '戌': '秋',
      '亥': '冬', '子': '冬', '丑': '冬'
    };

    const season = seasonMap[monthBranch];
    if (!season) return;

    switch (season) {
      case '春':
        strength.mu += 1.0;  // 木旺
        strength.huo += 0.5; // 火相
        break;
      case '夏':
        strength.huo += 1.0; // 火旺
        strength.tu += 0.5;  // 土相
        break;
      case '秋':
        strength.jin += 1.0; // 金旺
        strength.shui += 0.5; // 水相
        break;
      case '冬':
        strength.shui += 1.0; // 水旺
        strength.mu += 0.5;   // 木相
        break;
    }
  }

  /**
   * 根据组合关系调整五行强度
   * @param eightChar 八字对象
   * @param strength 强度对象
   */
  private static adjustByCombination(eightChar: any, strength: any): void {
    try {
      // 获取四柱干支
      const yearStem = eightChar.getYearGan();
      const yearBranch = eightChar.getYearZhi();
      const monthStem = eightChar.getMonthGan();
      const monthBranch = eightChar.getMonthZhi();
      const dayStem = eightChar.getDayGan();
      const dayBranch = eightChar.getDayZhi();
      const hourStem = eightChar.getTimeGan();
      const hourBranch = eightChar.getTimeZhi();

      const stems = [yearStem, monthStem, dayStem, hourStem];
      const branches = [yearBranch, monthBranch, dayBranch, hourBranch];

      // 检查天干五合
      this.checkStemCombination(stems, strength);

      // 检查地支三合、三会
      this.checkBranchCombination(branches, strength);

    } catch (error) {
      console.error('调整组合关系出错:', error);
    }
  }

  /**
   * 检查天干组合
   * @param stems 天干数组
   * @param strength 强度对象
   */
  private static checkStemCombination(stems: string[], strength: any): void {
    // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
    const combinations: {[key: string]: {result: string, value: number}} = {
      '甲己': {result: '土', value: 0.6},
      '己甲': {result: '土', value: 0.6},
      '乙庚': {result: '金', value: 0.6},
      '庚乙': {result: '金', value: 0.6},
      '丙辛': {result: '水', value: 0.6},
      '辛丙': {result: '水', value: 0.6},
      '丁壬': {result: '木', value: 0.6},
      '壬丁': {result: '木', value: 0.6},
      '戊癸': {result: '火', value: 0.6},
      '癸戊': {result: '火', value: 0.6}
    };

    for (let i = 0; i < stems.length; i++) {
      for (let j = i + 1; j < stems.length; j++) {
        const combination = stems[i] + stems[j];
        if (combinations[combination]) {
          const {result, value} = combinations[combination];
          this.addWuXingStrength(result, value, strength);
        }
      }
    }
  }

  /**
   * 检查地支组合
   * @param branches 地支数组
   * @param strength 强度对象
   */
  private static checkBranchCombination(branches: string[], strength: any): void {
    // 地支三合：寅午戌合火局，申子辰合水局，亥卯未合木局，巳酉丑合金局
    const sanHePatterns = [
      {branches: ['寅', '午', '戌'], element: '火', value: 1.2},
      {branches: ['申', '子', '辰'], element: '水', value: 1.2},
      {branches: ['亥', '卯', '未'], element: '木', value: 1.2},
      {branches: ['巳', '酉', '丑'], element: '金', value: 1.2}
    ];

    // 地支三会：寅卯辰三会木局，巳午未三会火局，申酉戌三会金局，亥子丑三会水局
    const sanHuiPatterns = [
      {branches: ['寅', '卯', '辰'], element: '木', value: 1.0},
      {branches: ['巳', '午', '未'], element: '火', value: 1.0},
      {branches: ['申', '酉', '戌'], element: '金', value: 1.0},
      {branches: ['亥', '子', '丑'], element: '水', value: 1.0}
    ];

    // 检查三合局
    for (const pattern of sanHePatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        this.addWuXingStrength(pattern.element, pattern.value, strength);
      }
    }

    // 检查三会局
    for (const pattern of sanHuiPatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        this.addWuXingStrength(pattern.element, pattern.value, strength);
      }
    }
  }

  /**
   * 计算日主旺衰
   * @param eightChar 八字对象
   * @returns 日主旺衰结果
   */
  static calculateRiZhuStrength(eightChar: any): {
    result: string;
    details: any;
  } {
    try {
      // 获取五行强度
      const wuXingStrength = this.calculateWuXingStrength(eightChar);
      
      // 获取日干五行
      const dayStem = eightChar.getDayGan();
      const dayWuXing = BaziUtils.getStemWuXing(dayStem);
      
      // 计算日主强度（日干本身 + 同类五行）
      let riZhuStrength = 0;
      switch (dayWuXing) {
        case '金':
          riZhuStrength = wuXingStrength.jin;
          break;
        case '木':
          riZhuStrength = wuXingStrength.mu;
          break;
        case '水':
          riZhuStrength = wuXingStrength.shui;
          break;
        case '火':
          riZhuStrength = wuXingStrength.huo;
          break;
        case '土':
          riZhuStrength = wuXingStrength.tu;
          break;
      }

      // 计算其他五行总强度
      const totalOtherStrength = Object.values(wuXingStrength).reduce((sum: number, value: number) => sum + value, 0) - riZhuStrength;

      // 判断旺衰
      let result = '';
      if (riZhuStrength >= totalOtherStrength * 0.6) {
        result = '身旺';
      } else if (riZhuStrength >= totalOtherStrength * 0.3) {
        result = '身平';
      } else {
        result = '身弱';
      }

      return {
        result,
        details: {
          dayWuXing,
          riZhuStrength,
          totalOtherStrength,
          wuXingStrength,
          ratio: riZhuStrength / (totalOtherStrength || 1)
        }
      };

    } catch (error) {
      console.error('计算日主旺衰出错:', error);
      return {
        result: '未知',
        details: {}
      };
    }
  }
}
