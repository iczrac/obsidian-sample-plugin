import { BaziCalculator } from './BaziCalculator';

/**
 * 十二长生计算模块
 * 专门处理各种十二长生状态的计算
 */
export class ShiErChangShengCalculator {
  
  /**
   * 十二长生状态枚举
   */
  static readonly CHANG_SHENG_STATES = [
    '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'
  ] as const;

  /**
   * 十二长生计算模式
   */
  static readonly CALCULATION_MODES = {
    DI_SHI: 'diShi',      // 地势：日干在各地支的十二长生状态
    ZI_ZUO: 'ziZuo',      // 自坐：各柱天干相对于各柱地支的十二长生状态
    YUE_LING: 'yueLing'   // 月令：各柱天干相对于月令的十二长生状态
  } as const;

  /**
   * 计算地势（日干在各地支的十二长生状态）
   * @param dayStem 日干
   * @param yearBranch 年支
   * @param monthBranch 月支
   * @param dayBranch 日支
   * @param timeBranch 时支
   * @returns 各柱地势
   */
  static calculateDiShi(
    dayStem: string,
    yearBranch: string,
    monthBranch: string,
    dayBranch: string,
    timeBranch: string
  ): {
    yearDiShi: string;
    monthDiShi: string;
    dayDiShi: string;
    timeDiShi: string;
  } {
    return {
      yearDiShi: BaziCalculator.getDiShi(dayStem, yearBranch),
      monthDiShi: BaziCalculator.getDiShi(dayStem, monthBranch),
      dayDiShi: BaziCalculator.getDiShi(dayStem, dayBranch),
      timeDiShi: BaziCalculator.getDiShi(dayStem, timeBranch)
    };
  }

  /**
   * 计算自坐（各柱天干相对于各柱地支的十二长生状态）
   * @param yearStem 年干
   * @param yearBranch 年支
   * @param monthStem 月干
   * @param monthBranch 月支
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param timeStem 时干
   * @param timeBranch 时支
   * @returns 各柱自坐
   */
  static calculateZiZuo(
    yearStem: string,
    yearBranch: string,
    monthStem: string,
    monthBranch: string,
    dayStem: string,
    dayBranch: string,
    timeStem: string,
    timeBranch: string
  ): {
    yearZiZuo: string;
    monthZiZuo: string;
    dayZiZuo: string;
    timeZiZuo: string;
  } {
    return {
      yearZiZuo: BaziCalculator.getDiShi(yearStem, yearBranch),
      monthZiZuo: BaziCalculator.getDiShi(monthStem, monthBranch),
      dayZiZuo: BaziCalculator.getDiShi(dayStem, dayBranch),
      timeZiZuo: BaziCalculator.getDiShi(timeStem, timeBranch)
    };
  }

  /**
   * 计算月令（各柱天干相对于月令的十二长生状态）
   * @param yearStem 年干
   * @param monthStem 月干
   * @param dayStem 日干
   * @param timeStem 时干
   * @param monthBranch 月支（月令）
   * @returns 各柱月令
   */
  static calculateYueLing(
    yearStem: string,
    monthStem: string,
    dayStem: string,
    timeStem: string,
    monthBranch: string
  ): {
    yearYueLing: string;
    monthYueLing: string;
    dayYueLing: string;
    timeYueLing: string;
  } {
    return {
      yearYueLing: BaziCalculator.getDiShi(yearStem, monthBranch),
      monthYueLing: BaziCalculator.getDiShi(monthStem, monthBranch),
      dayYueLing: BaziCalculator.getDiShi(dayStem, monthBranch),
      timeYueLing: BaziCalculator.getDiShi(timeStem, monthBranch)
    };
  }

  /**
   * 计算完整的十二长生信息
   * @param yearStem 年干
   * @param yearBranch 年支
   * @param monthStem 月干
   * @param monthBranch 月支
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param timeStem 时干
   * @param timeBranch 时支
   * @returns 完整的十二长生信息
   */
  static calculateComplete(
    yearStem: string,
    yearBranch: string,
    monthStem: string,
    monthBranch: string,
    dayStem: string,
    dayBranch: string,
    timeStem: string,
    timeBranch: string
  ): {
    diShi: {
      yearDiShi: string;
      monthDiShi: string;
      dayDiShi: string;
      timeDiShi: string;
    };
    ziZuo: {
      yearZiZuo: string;
      monthZiZuo: string;
      dayZiZuo: string;
      timeZiZuo: string;
    };
    yueLing: {
      yearYueLing: string;
      monthYueLing: string;
      dayYueLing: string;
      timeYueLing: string;
    };
  } {
    // 计算地势
    const diShi = this.calculateDiShi(dayStem, yearBranch, monthBranch, dayBranch, timeBranch);
    
    // 计算自坐
    const ziZuo = this.calculateZiZuo(
      yearStem, yearBranch,
      monthStem, monthBranch,
      dayStem, dayBranch,
      timeStem, timeBranch
    );
    
    // 计算月令
    const yueLing = this.calculateYueLing(yearStem, monthStem, dayStem, timeStem, monthBranch);

    return {
      diShi,
      ziZuo,
      yueLing
    };
  }

  /**
   * 获取十二长生状态的说明
   * @param state 十二长生状态
   * @returns 状态说明
   */
  static getStateDescription(state: string): string {
    const descriptions: {[key: string]: string} = {
      '长生': '如人初生，充满生机和潜力',
      '沐浴': '如人洗浴，易受外界影响，不稳定',
      '冠带': '如人成年，开始承担责任',
      '临官': '如人当官，能力强，有权威',
      '帝旺': '如帝王般强盛，达到顶峰',
      '衰': '开始衰落，力量减弱',
      '病': '如人生病，虚弱无力',
      '死': '如人死亡，毫无生机',
      '墓': '如入坟墓，被收藏起来',
      '绝': '断绝生机，最弱状态',
      '胎': '如在母胎，孕育新生',
      '养': '如人养育，逐渐恢复'
    };

    return descriptions[state] || '未知状态';
  }

  /**
   * 获取十二长生状态的吉凶性质
   * @param state 十二长生状态
   * @returns 吉凶性质
   */
  static getStateNature(state: string): '吉' | '凶' | '中性' {
    const goodStates = ['长生', '冠带', '临官', '帝旺', '养'];
    const badStates = ['沐浴', '衰', '病', '死', '绝'];
    const neutralStates = ['墓', '胎'];

    if (goodStates.includes(state)) {
      return '吉';
    } else if (badStates.includes(state)) {
      return '凶';
    } else {
      return '中性';
    }
  }

  /**
   * 获取计算模式的中文名称
   * @param mode 计算模式
   * @returns 中文名称
   */
  static getModeName(mode: string): string {
    const modeNames: {[key: string]: string} = {
      [this.CALCULATION_MODES.DI_SHI]: '地势',
      [this.CALCULATION_MODES.ZI_ZUO]: '自坐',
      [this.CALCULATION_MODES.YUE_LING]: '月令'
    };

    return modeNames[mode] || '未知模式';
  }

  /**
   * 获取计算模式的说明
   * @param mode 计算模式
   * @returns 模式说明
   */
  static getModeDescription(mode: string): string {
    const descriptions: {[key: string]: string} = {
      [this.CALCULATION_MODES.DI_SHI]: '日干在各地支的十二长生状态',
      [this.CALCULATION_MODES.ZI_ZUO]: '各柱天干相对于各柱地支的十二长生状态',
      [this.CALCULATION_MODES.YUE_LING]: '各柱天干相对于月令的十二长生状态'
    };

    return descriptions[mode] || '未知模式说明';
  }
}
