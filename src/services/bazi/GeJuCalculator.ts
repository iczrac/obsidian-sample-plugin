import { EightChar } from 'lunar-typescript';
import { BaziUtils } from './BaziUtils';
import { ShiShenCalculator } from './ShiShenCalculator';

/**
 * 格局计算器
 * 专门负责计算八字格局
 */
export class GeJuCalculator {
  /**
   * 计算八字格局
   * @param eightChar 八字对象
   * @returns 格局信息
   */
  static calculateGeJu(eightChar: EightChar): {
    geJu: string;
    geJuType: string;
    detail: string;
    geJuStrength: number;
    isSpecialGeJu: boolean;
    analysis: string;
  } {
    // 获取日干和月支
    const dayStem = eightChar.getDayGan();
    const monthBranch = eightChar.getMonthZhi();
    const monthStem = eightChar.getMonthGan();

    // 首先检查是否为特殊格局
    const specialGeJu = this.checkSpecialGeJu(eightChar);
    if (specialGeJu.isSpecial) {
      return {
        geJu: specialGeJu.name,
        geJuType: '特殊格局',
        detail: specialGeJu.detail,
        geJuStrength: specialGeJu.strength,
        isSpecialGeJu: true,
        analysis: specialGeJu.analysis
      };
    }

    // 检查正格
    const normalGeJu = this.checkNormalGeJu(eightChar);
    return {
      geJu: normalGeJu.name,
      geJuType: '正格',
      detail: normalGeJu.detail,
      geJuStrength: normalGeJu.strength,
      isSpecialGeJu: false,
      analysis: normalGeJu.analysis
    };
  }

  /**
   * 检查特殊格局
   * @param eightChar 八字对象
   * @returns 特殊格局信息
   */
  private static checkSpecialGeJu(eightChar: EightChar): {
    isSpecial: boolean;
    name: string;
    detail: string;
    strength: number;
    analysis: string;
  } {
    // 获取四柱干支
    const stems = [
      eightChar.getYearGan(),
      eightChar.getMonthGan(),
      eightChar.getDayGan(),
      eightChar.getTimeGan()
    ];
    const branches = [
      eightChar.getYearZhi(),
      eightChar.getMonthZhi(),
      eightChar.getDayZhi(),
      eightChar.getTimeZhi()
    ];

    // 检查从格
    const congGeJu = this.checkCongGeJu(eightChar, stems, branches);
    if (congGeJu.isSpecial) {
      return congGeJu;
    }

    // 检查化格
    const huaGeJu = this.checkHuaGeJu(eightChar, stems, branches);
    if (huaGeJu.isSpecial) {
      return huaGeJu;
    }

    // 检查其他特殊格局
    const otherSpecial = this.checkOtherSpecialGeJu(eightChar, stems, branches);
    if (otherSpecial.isSpecial) {
      return otherSpecial;
    }

    return {
      isSpecial: false,
      name: '',
      detail: '',
      strength: 0,
      analysis: ''
    };
  }

  /**
   * 检查从格
   * @param eightChar 八字对象
   * @param stems 四柱天干
   * @param branches 四柱地支
   * @returns 从格信息
   */
  private static checkCongGeJu(
    eightChar: EightChar,
    stems: string[],
    branches: string[]
  ): {
    isSpecial: boolean;
    name: string;
    detail: string;
    strength: number;
    analysis: string;
  } {
    const dayStem = eightChar.getDayGan();
    const dayWuXing = BaziUtils.getStemWuXing(dayStem);

    // 统计五行力量
    const wuXingCount: { [key: string]: number } = {
      '金': 0, '木': 0, '水': 0, '火': 0, '土': 0
    };

    // 统计天干五行
    stems.forEach(stem => {
      const wuXing = BaziUtils.getStemWuXing(stem);
      wuXingCount[wuXing]++;
    });

    // 统计地支五行（简化处理）
    branches.forEach(branch => {
      const wuXing = BaziUtils.getBranchWuXing(branch);
      wuXingCount[wuXing] += 0.5; // 地支力量按一半计算
    });

    // 日干力量
    const dayWuXingCount = wuXingCount[dayWuXing];

    // 判断是否为从格（日干力量很弱，其他某种五行很强）
    if (dayWuXingCount <= 1.5) {
      // 找出最强的五行
      let maxWuXing = '';
      let maxCount = 0;
      Object.entries(wuXingCount).forEach(([wuXing, count]) => {
        if (wuXing !== dayWuXing && count > maxCount) {
          maxWuXing = wuXing;
          maxCount = count;
        }
      });

      if (maxCount >= 3) {
        // 判断从格类型
        if (BaziUtils.isWuXingKe(maxWuXing, dayWuXing)) {
          return {
            isSpecial: true,
            name: '从杀格',
            detail: `日干${dayWuXing}从${maxWuXing}，为从杀格`,
            strength: 8,
            analysis: '从杀格喜官杀旺，忌印比扶身'
          };
        } else if (BaziUtils.isWuXingKe(dayWuXing, maxWuXing)) {
          return {
            isSpecial: true,
            name: '从财格',
            detail: `日干${dayWuXing}从${maxWuXing}，为从财格`,
            strength: 7,
            analysis: '从财格喜财星旺，忌印比扶身'
          };
        } else if (BaziUtils.isWuXingSheng(maxWuXing, dayWuXing)) {
          return {
            isSpecial: true,
            name: '从印格',
            detail: `日干${dayWuXing}从${maxWuXing}，为从印格`,
            strength: 6,
            analysis: '从印格喜印星旺，忌财星破印'
          };
        }
      }
    }

    return {
      isSpecial: false,
      name: '',
      detail: '',
      strength: 0,
      analysis: ''
    };
  }

  /**
   * 检查化格
   * @param eightChar 八字对象
   * @param stems 四柱天干
   * @param branches 四柱地支
   * @returns 化格信息
   */
  private static checkHuaGeJu(
    eightChar: EightChar,
    stems: string[],
    branches: string[]
  ): {
    isSpecial: boolean;
    name: string;
    detail: string;
    strength: number;
    analysis: string;
  } {
    // 天干化合表
    const huaHeMap: { [key: string]: string } = {
      '甲己': '土',
      '乙庚': '金',
      '丙辛': '水',
      '丁壬': '木',
      '戊癸': '火'
    };

    const dayStem = eightChar.getDayGan();
    
    // 检查日干是否与其他干有化合
    for (let i = 0; i < stems.length; i++) {
      if (i === 2) continue; // 跳过日干自己
      
      const otherStem = stems[i];
      const pair1 = dayStem + otherStem;
      const pair2 = otherStem + dayStem;
      
      const huaWuXing = huaHeMap[pair1] || huaHeMap[pair2];
      if (huaWuXing) {
        // 检查化神是否得令（在月支中有根）
        const monthBranchWuXing = BaziUtils.getBranchWuXing(eightChar.getMonthZhi());
        if (monthBranchWuXing === huaWuXing) {
          const pillarName = ['年', '月', '日', '时'][i];
          return {
            isSpecial: true,
            name: `${huaWuXing}化格`,
            detail: `日干${dayStem}与${pillarName}干${otherStem}化${huaWuXing}`,
            strength: 9,
            analysis: `${huaWuXing}化格以化神为用，喜化神旺相`
          };
        }
      }
    }

    return {
      isSpecial: false,
      name: '',
      detail: '',
      strength: 0,
      analysis: ''
    };
  }

  /**
   * 检查其他特殊格局
   * @param eightChar 八字对象
   * @param stems 四柱天干
   * @param branches 四柱地支
   * @returns 特殊格局信息
   */
  private static checkOtherSpecialGeJu(
    eightChar: EightChar,
    stems: string[],
    branches: string[]
  ): {
    isSpecial: boolean;
    name: string;
    detail: string;
    strength: number;
    analysis: string;
  } {
    // 检查建禄格
    const dayStem = eightChar.getDayGan();
    const monthBranch = eightChar.getMonthZhi();
    
    // 建禄表
    const jianLuMap: { [key: string]: string } = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
      '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };

    if (jianLuMap[dayStem] === monthBranch) {
      return {
        isSpecial: true,
        name: '建禄格',
        detail: `日干${dayStem}在月支${monthBranch}建禄`,
        strength: 6,
        analysis: '建禄格身旺，喜财官食伤，忌比劫印绶'
      };
    }

    return {
      isSpecial: false,
      name: '',
      detail: '',
      strength: 0,
      analysis: ''
    };
  }

  /**
   * 检查正格
   * @param eightChar 八字对象
   * @returns 正格信息
   */
  private static checkNormalGeJu(eightChar: EightChar): {
    name: string;
    detail: string;
    strength: number;
    analysis: string;
  } {
    const dayStem = eightChar.getDayGan();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();

    // 以月令为准判断格局
    const monthShiShen = ShiShenCalculator.getShiShen(dayStem, monthStem);
    
    // 如果月干没有明显十神，看月支藏干
    let geJuShiShen = monthShiShen;
    if (monthShiShen === '比肩' || monthShiShen === '劫财') {
      // 月干为比劫时，看月支藏干
      const monthHideGan = eightChar.getMonthHideGan();
      if (monthHideGan && monthHideGan.length > 0) {
        geJuShiShen = ShiShenCalculator.getShiShen(dayStem, monthHideGan[0]);
      }
    }

    let geJu = '';
    let detail = '';
    let strength = 5;
    let analysis = '';

    switch (geJuShiShen) {
      case '正官':
        geJu = '正官格';
        detail = '月令正官，为贵格';
        strength = 8;
        analysis = '正官格喜印绶护官，财星生官，忌伤官克官';
        break;
      case '七杀':
        geJu = '七杀格';
        detail = '月令七杀，需制化';
        strength = 7;
        analysis = '七杀格喜食神制杀或印绶化杀，忌杀重身轻';
        break;
      case '正财':
        geJu = '正财格';
        detail = '月令正财，利财运';
        strength = 6;
        analysis = '正财格喜身旺官护，忌比劫夺财';
        break;
      case '偏财':
        geJu = '偏财格';
        detail = '月令偏财，善经营';
        strength = 6;
        analysis = '偏财格喜身旺食伤生财，忌比劫夺财';
        break;
      case '正印':
        geJu = '正印格';
        detail = '月令正印，利学业';
        strength = 7;
        analysis = '正印格喜官杀生印，忌财星破印';
        break;
      case '偏印':
        geJu = '偏印格';
        detail = '月令偏印，多才艺';
        strength = 5;
        analysis = '偏印格喜官杀生印，食神制印，忌财星破印';
        break;
      case '食神':
        geJu = '食神格';
        detail = '月令食神，主福寿';
        strength = 7;
        analysis = '食神格喜财星泄秀，忌偏印夺食';
        break;
      case '伤官':
        geJu = '伤官格';
        detail = '月令伤官，主才华';
        strength = 6;
        analysis = '伤官格喜财星泄秀或印绶制伤，忌官星混杂';
        break;
      default:
        geJu = '普通格局';
        detail = '无明显格局特征';
        strength = 4;
        analysis = '普通格局需综合分析五行平衡';
    }

    return {
      name: geJu,
      detail,
      strength,
      analysis
    };
  }

  /**
   * 获取格局用神
   * @param eightChar 八字对象
   * @param geJu 格局名称
   * @returns 用神信息
   */
  static getGeJuYongShen(eightChar: EightChar, geJu: string): {
    yongShen: string;
    xiShen: string;
    jiShen: string;
    analysis: string;
  } {
    // 根据格局确定用神
    const yongShenMap: { [key: string]: any } = {
      '正官格': {
        yongShen: '正官',
        xiShen: '正印',
        jiShen: '正财',
        analysis: '正官格以官为用，印为喜，财为辅'
      },
      '七杀格': {
        yongShen: '食神',
        xiShen: '正印',
        jiShen: '比肩',
        analysis: '七杀格以食神制杀为用，印化杀为喜'
      },
      '正财格': {
        yongShen: '正财',
        xiShen: '正官',
        jiShen: '食神',
        analysis: '正财格以财为用，官护财为喜，食伤生财为辅'
      },
      '正印格': {
        yongShen: '正印',
        xiShen: '正官',
        jiShen: '七杀',
        analysis: '正印格以印为用，官杀生印为喜'
      },
      '食神格': {
        yongShen: '食神',
        xiShen: '正财',
        jiShen: '比肩',
        analysis: '食神格以食神为用，财星泄秀为喜'
      }
    };

    const info = yongShenMap[geJu];
    if (info) {
      return info;
    }

    return {
      yongShen: '未定',
      xiShen: '未定',
      jiShen: '未定',
      analysis: '需要详细分析确定用神'
    };
  }
}
