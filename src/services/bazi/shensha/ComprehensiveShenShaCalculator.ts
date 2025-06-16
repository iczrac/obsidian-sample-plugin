import { EightChar } from 'lunar-typescript';
import { ShenShaCalculator } from './ShenShaCalculator';

/**
 * 综合神煞计算器
 * 整合所有神煞计算功能，提供完整的神煞分析
 */
export class ComprehensiveShenShaCalculator {
  /**
   * 计算完整的四柱神煞信息
   * @param eightChar 八字对象
   * @returns 完整神煞信息
   */
  static calculateCompleteShenSha(eightChar: EightChar): {
    allShenSha: string[];
    yearShenSha: string[];
    monthShenSha: string[];
    dayShenSha: string[];
    timeShenSha: string[];
    jiShen: string[];
    xiongShen: string[];
    jiXiongShen: string[];
  } {
    // 获取四柱干支
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 计算各柱神煞
    const yearShenSha = this.calculatePillarShenSha(dayStem, yearStem, yearBranch, '年');
    const monthShenSha = this.calculatePillarShenSha(dayStem, monthStem, monthBranch, '月');
    const dayShenSha = this.calculatePillarShenSha(dayStem, dayStem, dayBranch, '日');
    const timeShenSha = this.calculatePillarShenSha(dayStem, timeStem, timeBranch, '时');

    // 为神煞添加柱位前缀
    const yearShenShaWithPrefix = yearShenSha.map(s => `年柱:${s}`);
    const monthShenShaWithPrefix = monthShenSha.map(s => `月柱:${s}`);
    const dayShenShaWithPrefix = dayShenSha.map(s => `日柱:${s}`);
    const timeShenShaWithPrefix = timeShenSha.map(s => `时柱:${s}`);

    // 合并所有神煞并去重
    const allShenShaSet = new Set([
      ...yearShenShaWithPrefix,
      ...monthShenShaWithPrefix,
      ...dayShenShaWithPrefix,
      ...timeShenShaWithPrefix
    ]);
    const allShenSha = Array.from(allShenShaSet);

    // 分类神煞
    const jiShen: string[] = [];
    const xiongShen: string[] = [];
    const jiXiongShen: string[] = [];

    allShenSha.forEach(shenSha => {
      // 提取神煞名称（去掉柱位前缀）
      const shenShaName = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
      const type = ShenShaCalculator.getShenShaType(shenShaName);
      switch (type) {
        case '吉神':
          jiShen.push(shenSha);
          break;
        case '凶神':
          xiongShen.push(shenSha);
          break;
        case '吉凶神':
          jiXiongShen.push(shenSha);
          break;
      }
    });

    return {
      allShenSha,
      yearShenSha: yearShenShaWithPrefix,
      monthShenSha: monthShenShaWithPrefix,
      dayShenSha: dayShenShaWithPrefix,
      timeShenSha: timeShenShaWithPrefix,
      jiShen,
      xiongShen,
      jiXiongShen
    };
  }

  /**
   * 计算单柱神煞
   * @param dayStem 日干
   * @param pillarStem 柱天干
   * @param pillarBranch 柱地支
   * @param pillarType 柱类型
   * @returns 神煞数组
   */
  private static calculatePillarShenSha(
    dayStem: string,
    pillarStem: string,
    pillarBranch: string,
    pillarType: string
  ): string[] {
    const shenSha: string[] = [];

    // 基础神煞（适用于所有柱）
    if (ShenShaCalculator.isTianYiGuiRen(dayStem, pillarBranch)) {
      shenSha.push('天乙贵人');
    }

    if (ShenShaCalculator.isYangRen(dayStem, pillarBranch)) {
      shenSha.push('羊刃');
    }

    if (ShenShaCalculator.isTaoHua(pillarBranch)) {
      shenSha.push('桃花');
    }

    if (ShenShaCalculator.isHuaGai(pillarBranch)) {
      shenSha.push('华盖');
    }

    if (ShenShaCalculator.isWenChang(pillarBranch)) {
      shenSha.push('文昌');
    }

    if (ShenShaCalculator.isLuShen(pillarStem, pillarBranch)) {
      shenSha.push('禄神');
    }

    if (ShenShaCalculator.isGuChen(pillarBranch)) {
      shenSha.push('孤辰');
    }

    if (ShenShaCalculator.isGuaSu(pillarBranch)) {
      shenSha.push('寡宿');
    }

    if (ShenShaCalculator.isJiangXing(dayStem, pillarBranch)) {
      shenSha.push('将星');
    }

    if (ShenShaCalculator.isJinShen(pillarBranch)) {
      shenSha.push('金神');
    }

    if (ShenShaCalculator.isTianDe(pillarStem, pillarBranch)) {
      shenSha.push('天德');
    }

    if (ShenShaCalculator.isTianDeHe(pillarStem, pillarBranch)) {
      shenSha.push('天德合');
    }

    if (ShenShaCalculator.isYueDe(pillarStem)) {
      shenSha.push('月德');
    }

    if (ShenShaCalculator.isTianYi(pillarBranch)) {
      shenSha.push('天医');
    }

    if (ShenShaCalculator.isHongYan(pillarBranch)) {
      shenSha.push('红艳');
    }

    if (ShenShaCalculator.isTianLuo(pillarBranch)) {
      shenSha.push('天罗');
    }

    if (ShenShaCalculator.isDiWang(pillarBranch)) {
      shenSha.push('地网');
    }

    if (ShenShaCalculator.isTianKong(pillarBranch)) {
      shenSha.push('天空');
    }

    if (ShenShaCalculator.isDiJie(pillarBranch)) {
      shenSha.push('地劫');
    }

    if (ShenShaCalculator.isTianXing(pillarBranch)) {
      shenSha.push('天刑');
    }

    if (ShenShaCalculator.isTianKu(pillarBranch)) {
      shenSha.push('天哭');
    }

    if (ShenShaCalculator.isTianXu(pillarBranch)) {
      shenSha.push('天虚');
    }

    if (ShenShaCalculator.isXianChi(pillarBranch)) {
      shenSha.push('咸池');
    }

    if (ShenShaCalculator.isWangShen(pillarBranch)) {
      shenSha.push('亡神');
    }

    if (ShenShaCalculator.isJieSha(pillarBranch)) {
      shenSha.push('劫煞');
    }

    if (ShenShaCalculator.isZaiSha(pillarBranch)) {
      shenSha.push('灾煞');
    }

    // 特殊神煞（需要年支参数的）
    if (pillarType === '年') {
      // 年柱特有的神煞计算
      if (ShenShaCalculator.isYiMa(pillarBranch, pillarBranch)) {
        shenSha.push('驿马');
      }
      if (ShenShaCalculator.isTianXi(pillarBranch, pillarBranch)) {
        shenSha.push('天喜');
      }
    }

    return shenSha;
  }

  /**
   * 获取神煞详细信息
   * @param shenShaName 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaDetail(shenShaName: string): {
    name: string;
    type: string;
    description: string;
    effect: string;
  } {
    const shenShaDetails: { [key: string]: any } = {
      '天乙贵人': {
        type: '吉神',
        description: '天乙贵人是八字中最重要的吉神之一',
        effect: '主贵人相助，逢凶化吉，事业顺利'
      },
      '羊刃': {
        type: '凶神',
        description: '羊刃是日干的强根，但过旺则凶',
        effect: '主性格刚烈，易有血光之灾，需制化'
      },
      '桃花': {
        type: '吉凶神',
        description: '桃花主异性缘分和艺术才华',
        effect: '主异性缘佳，有艺术天赋，但易有感情纠纷'
      },
      '华盖': {
        type: '吉凶神',
        description: '华盖主孤独和艺术、宗教才能',
        effect: '主有艺术天赋，喜欢神秘学，但性格孤僻'
      },
      '文昌': {
        type: '吉神',
        description: '文昌主文学才华和学业功名',
        effect: '主学业有成，文笔佳，利考试升学'
      },
      '禄神': {
        type: '吉神',
        description: '禄神主财禄和地位',
        effect: '主有稳定收入，地位尊贵，衣食无忧'
      },
      '将星': {
        type: '吉神',
        description: '将星主领导才能和权威',
        effect: '主有领导能力，能统御他人，适合管理工作'
      }
    };

    const detail = shenShaDetails[shenShaName];
    if (detail) {
      return {
        name: shenShaName,
        type: detail.type,
        description: detail.description,
        effect: detail.effect
      };
    }

    return {
      name: shenShaName,
      type: ShenShaCalculator.getShenShaType(shenShaName),
      description: '暂无详细说明',
      effect: '影响因人而异'
    };
  }

  /**
   * 计算神煞强度评分
   * @param eightChar 八字对象
   * @returns 神煞强度评分
   */
  static calculateShenShaStrength(eightChar: EightChar): {
    jiShenScore: number;
    xiongShenScore: number;
    totalScore: number;
    evaluation: string;
  } {
    const shenShaInfo = this.calculateCompleteShenSha(eightChar);
    
    let jiShenScore = 0;
    let xiongShenScore = 0;

    // 吉神加分
    shenShaInfo.jiShen.forEach(shenSha => {
      switch (shenSha) {
        case '天乙贵人':
          jiShenScore += 10;
          break;
        case '文昌':
        case '禄神':
        case '天德':
          jiShenScore += 8;
          break;
        case '将星':
        case '天医':
          jiShenScore += 6;
          break;
        default:
          jiShenScore += 4;
      }
    });

    // 凶神减分
    shenShaInfo.xiongShen.forEach(shenSha => {
      switch (shenSha) {
        case '羊刃':
          xiongShenScore += 8;
          break;
        case '天刑':
        case '劫煞':
          xiongShenScore += 6;
          break;
        default:
          xiongShenScore += 4;
      }
    });

    // 吉凶神根据情况加减分
    shenShaInfo.jiXiongShen.forEach(shenSha => {
      switch (shenSha) {
        case '桃花':
          jiShenScore += 3;
          xiongShenScore += 2;
          break;
        case '华盖':
          jiShenScore += 4;
          xiongShenScore += 3;
          break;
        default:
          jiShenScore += 2;
          xiongShenScore += 2;
      }
    });

    const totalScore = jiShenScore - xiongShenScore;
    
    let evaluation = '';
    if (totalScore >= 20) {
      evaluation = '神煞配置极佳，多贵人助力';
    } else if (totalScore >= 10) {
      evaluation = '神煞配置良好，整体偏吉';
    } else if (totalScore >= 0) {
      evaluation = '神煞配置平衡，吉凶参半';
    } else if (totalScore >= -10) {
      evaluation = '神煞配置偏弱，需注意化解';
    } else {
      evaluation = '神煞配置不佳，多有阻碍';
    }

    return {
      jiShenScore,
      xiongShenScore,
      totalScore,
      evaluation
    };
  }
}
