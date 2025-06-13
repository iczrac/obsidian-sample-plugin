import { BaziUtils } from './BaziUtils';
import { BaziCalculator } from './BaziCalculator';

/**
 * 十神计算模块
 * 专门处理十神相关计算
 */
export class ShiShenCalculator {
  /**
   * 计算十神
   * @param dayStem 日干
   * @param otherStem 其他天干
   * @returns 十神名称
   */
  static getShiShen(dayStem: string, otherStem: string): string {
    // 如果是日干自己，返回日主
    if (dayStem === otherStem) {
      return '日主';
    }

    // 获取天干的五行
    const dayWuXing = BaziUtils.getStemWuXing(dayStem);
    const otherWuXing = BaziUtils.getStemWuXing(otherStem);

    // 获取天干的阴阳性
    const dayYinYang = this.getStemYinYang(dayStem);
    const otherYinYang = this.getStemYinYang(otherStem);

    // 判断同性还是异性
    const isSameYinYang = dayYinYang === otherYinYang;

    // 根据五行关系和阴阳性确定十神
    if (dayWuXing === otherWuXing) {
      // 同五行
      return isSameYinYang ? '比肩' : '劫财';
    } else if (BaziUtils.isWuXingSheng(dayWuXing, otherWuXing)) {
      // 日干生其他干
      return isSameYinYang ? '食神' : '伤官';
    } else if (BaziUtils.isWuXingKe(dayWuXing, otherWuXing)) {
      // 日干克其他干
      return isSameYinYang ? '偏财' : '正财';
    } else if (BaziUtils.isWuXingKe(otherWuXing, dayWuXing)) {
      // 其他干克日干
      return isSameYinYang ? '七杀' : '正官';
    } else if (BaziUtils.isWuXingSheng(otherWuXing, dayWuXing)) {
      // 其他干生日干
      return isSameYinYang ? '偏印' : '正印';
    }

    return '未知';
  }

  /**
   * 计算地支藏干的十神
   * @param dayStem 日干
   * @param branch 地支
   * @returns 十神数组
   */
  static getHiddenShiShen(dayStem: string, branch: string): string[] {
    // 获取地支藏干
    const hideGanStr = BaziCalculator.getHideGan(branch);
    if (!hideGanStr) {
      return [];
    }

    // 分割藏干
    const hideGanArray = hideGanStr.split(',');
    
    // 计算每个藏干的十神
    const shiShens: string[] = [];
    for (const hideGan of hideGanArray) {
      const shiShen = this.getShiShen(dayStem, hideGan.trim());
      shiShens.push(shiShen);
    }

    return shiShens;
  }

  /**
   * 获取天干的阴阳性
   * @param stem 天干
   * @returns 阴阳性（阳/阴）
   */
  private static getStemYinYang(stem: string): string {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem) ? '阳' : '阴';
  }

  /**
   * 获取十神的详细说明
   * @param shiShen 十神名称
   * @returns 详细说明
   */
  static getShiShenDescription(shiShen: string): string {
    const descriptions: {[key: string]: string} = {
      '日主': '命主本人，八字的核心',
      '比肩': '同性同类，代表兄弟姐妹、朋友、竞争对手',
      '劫财': '异性同类，代表争夺、竞争、破财',
      '食神': '同性相生，代表才华、表达、享受',
      '伤官': '异性相生，代表聪明、叛逆、创新',
      '偏财': '同性相克，代表偏财、投机、情人',
      '正财': '异性相克，代表正财、妻子、实业',
      '七杀': '同性相克，代表权威、压力、小人',
      '正官': '异性相克，代表官职、名声、丈夫',
      '偏印': '同性相生，代表偏门学问、继母',
      '正印': '异性相生，代表学问、母亲、贵人'
    };

    return descriptions[shiShen] || '未知十神';
  }

  /**
   * 判断十神的吉凶性质
   * @param shiShen 十神名称
   * @returns 吉凶性质
   */
  static getShiShenNature(shiShen: string): string {
    const goodShiShen = ['正官', '正印', '正财', '食神'];
    const badShiShen = ['七杀', '伤官', '劫财'];
    const neutralShiShen = ['比肩', '偏印', '偏财'];

    if (goodShiShen.includes(shiShen)) {
      return '吉';
    } else if (badShiShen.includes(shiShen)) {
      return '凶';
    } else if (neutralShiShen.includes(shiShen)) {
      return '中性';
    }

    return '未知';
  }

  /**
   * 获取十神的五行属性
   * @param shiShen 十神名称
   * @param dayStem 日干
   * @returns 五行属性
   */
  static getShiShenWuXing(shiShen: string, dayStem: string): string {
    const dayWuXing = BaziUtils.getStemWuXing(dayStem);

    switch (shiShen) {
      case '比肩':
      case '劫财':
        return dayWuXing; // 同类
      case '食神':
      case '伤官':
        // 日干所生
        return this.getShengWuXing(dayWuXing);
      case '偏财':
      case '正财':
        // 日干所克
        return this.getKeWuXing(dayWuXing);
      case '七杀':
      case '正官':
        // 克日干
        return this.getKeRiGanWuXing(dayWuXing);
      case '偏印':
      case '正印':
        // 生日干
        return this.getShengRiGanWuXing(dayWuXing);
      default:
        return dayWuXing;
    }
  }

  /**
   * 获取五行所生的五行
   * @param wuXing 五行
   * @returns 所生的五行
   */
  private static getShengWuXing(wuXing: string): string {
    const shengMap: {[key: string]: string} = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    return shengMap[wuXing] || wuXing;
  }

  /**
   * 获取五行所克的五行
   * @param wuXing 五行
   * @returns 所克的五行
   */
  private static getKeWuXing(wuXing: string): string {
    const keMap: {[key: string]: string} = {
      '木': '土',
      '火': '金',
      '土': '水',
      '金': '木',
      '水': '火'
    };
    return keMap[wuXing] || wuXing;
  }

  /**
   * 获取克日干的五行
   * @param dayWuXing 日干五行
   * @returns 克日干的五行
   */
  private static getKeRiGanWuXing(dayWuXing: string): string {
    const keRiGanMap: {[key: string]: string} = {
      '木': '金',
      '火': '水',
      '土': '木',
      '金': '火',
      '水': '土'
    };
    return keRiGanMap[dayWuXing] || dayWuXing;
  }

  /**
   * 获取生日干的五行
   * @param dayWuXing 日干五行
   * @returns 生日干的五行
   */
  private static getShengRiGanWuXing(dayWuXing: string): string {
    const shengRiGanMap: {[key: string]: string} = {
      '木': '水',
      '火': '木',
      '土': '火',
      '金': '土',
      '水': '金'
    };
    return shengRiGanMap[dayWuXing] || dayWuXing;
  }
}
