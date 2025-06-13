/**
 * 神煞解释服务
 * 整合神煞解释和分析功能
 */

export interface ShenShaInfo {
  name: string;
  type: string; // 吉神、凶神、吉凶神
  explanation: string;
  influence: string;
  advice: string;
  calculation: string;
}

export interface ShenShaCombinationAnalysis {
  totalShenSha: number;
  jiShenCount: number;
  xiongShenCount: number;
  jiXiongShenCount: number;
  overallInfluence: string;
  keyPoints: string[];
  advice: string;
}

export class ShenShaExplanationService {
  /**
   * 获取神煞的详细信息
   * @param shenSha 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaInfo(shenSha: string): ShenShaInfo | null {
    const shenShaData: { [key: string]: ShenShaInfo } = {
      '天乙贵人': {
        name: '天乙贵人',
        type: '吉神',
        explanation: '天乙贵人是八字中最重要的吉神之一，代表贵人相助、逢凶化吉。',
        influence: '主贵人相助，遇到困难时容易得到帮助，事业发展顺利，社会地位较高。',
        advice: '要珍惜贵人关系，多行善事，以德报德，扩大人脉圈。',
        calculation: '以日干为主，查年支月支时支。甲戊见牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢虎马，此是贵人方。'
      },
      '羊刃': {
        name: '羊刃',
        type: '凶神',
        explanation: '羊刃是日干的强根，但过旺则凶，主性格刚烈，易有血光之灾。',
        influence: '性格刚烈，做事果断，但容易冲动，与人发生冲突，需要制化。',
        advice: '要控制脾气，避免冲动行事，多修身养性，化解刚烈之气。',
        calculation: '甲见卯、乙见寅、丙戊见午、丁己见巳、庚见酉、辛见申、壬见子、癸见亥。'
      },
      '桃花': {
        name: '桃花',
        type: '吉凶神',
        explanation: '桃花主异性缘分和艺术才华，但也可能带来感情纠纷。',
        influence: '异性缘佳，有艺术天赋，魅力十足，但容易有感情纠纷。',
        advice: '要正确处理感情关系，将艺术天赋发挥在正当途径上。',
        calculation: '寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子。'
      },
      '华盖': {
        name: '华盖',
        type: '吉凶神',
        explanation: '华盖主孤独和艺术、宗教才能，有超凡脱俗的气质。',
        influence: '有艺术天赋，喜欢神秘学，但性格孤僻，不善社交。',
        advice: '要平衡孤独与社交，将特殊才能转化为实际成就。',
        calculation: '寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未。'
      },
      '文昌': {
        name: '文昌',
        type: '吉神',
        explanation: '文昌主文学才华和学业功名，利于考试升学。',
        influence: '学业有成，文笔佳，利考试升学，适合从事文化教育工作。',
        advice: '要充分发挥文学才华，多读书学习，提升文化修养。',
        calculation: '甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯。'
      },
      '禄神': {
        name: '禄神',
        type: '吉神',
        explanation: '禄神主财禄和地位，代表稳定的收入和社会地位。',
        influence: '有稳定收入，地位尊贵，衣食无忧，事业发展稳定。',
        advice: '要珍惜现有地位，稳步发展，不要贪图不义之财。',
        calculation: '甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子。'
      },
      '将星': {
        name: '将星',
        type: '吉神',
        explanation: '将星主领导才能和权威，有统御他人的能力。',
        influence: '有领导能力，能统御他人，适合管理工作，容易获得权威地位。',
        advice: '要培养领导才能，承担责任，以德服人，建立威信。',
        calculation: '寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯。'
      },
      '孤辰': {
        name: '孤辰',
        type: '凶神',
        explanation: '孤辰主孤独，人际关系不佳，容易孤立无援。',
        influence: '性格孤僻，人际关系不佳，容易感到孤独，缺乏朋友。',
        advice: '要主动与人交往，培养社交能力，多参加集体活动。',
        calculation: '亥子丑人见寅，寅卯辰人见巳，巳午未人见申，申酉戌人见亥。'
      },
      '寡宿': {
        name: '寡宿',
        type: '凶神',
        explanation: '寡宿主孤独，特别影响婚姻感情，容易独身。',
        influence: '婚姻感情不顺，容易独身，即使结婚也容易分离。',
        advice: '要重视感情经营，多沟通理解，避免过于固执己见。',
        calculation: '亥子丑人见戌，寅卯辰人见丑，巳午未人见辰，申酉戌人见未。'
      },
      '天德': {
        name: '天德',
        type: '吉神',
        explanation: '天德是重要的吉神，主逢凶化吉，遇难呈祥。',
        influence: '逢凶化吉，遇难呈祥，一生较为平安顺利。',
        advice: '要心存善念，多行善事，积累功德，回报社会。',
        calculation: '正月生者见丁，二月生者见申，三月生者见壬，四月生者见辛，五月生者见亥，六月生者见甲，七月生者见癸，八月生者见寅，九月生者见丙，十月生者见乙，十一月生者见巳，十二月生者见庚。'
      }
    };

    return shenShaData[shenSha] || null;
  }

  /**
   * 获取神煞建议
   * @param shenSha 神煞名称
   * @returns 神煞建议
   */
  static getShenShaAdvice(shenSha: string): string {
    const info = this.getShenShaInfo(shenSha);
    return info ? info.advice : '建议根据具体情况进行分析。';
  }

  /**
   * 分析神煞组合
   * @param shenShaList 神煞列表
   * @returns 组合分析
   */
  static analyzeShenShaCombination(shenShaList: string[]): ShenShaCombinationAnalysis {
    let jiShenCount = 0;
    let xiongShenCount = 0;
    let jiXiongShenCount = 0;
    const keyPoints: string[] = [];

    // 统计各类神煞
    shenShaList.forEach(shenSha => {
      const info = this.getShenShaInfo(shenSha);
      if (info) {
        switch (info.type) {
          case '吉神':
            jiShenCount++;
            break;
          case '凶神':
            xiongShenCount++;
            break;
          case '吉凶神':
            jiXiongShenCount++;
            break;
        }
      }
    });

    // 分析关键神煞
    if (shenShaList.includes('天乙贵人')) {
      keyPoints.push('有天乙贵人相助，遇困难时容易得到帮助');
    }
    if (shenShaList.includes('羊刃')) {
      keyPoints.push('有羊刃，性格刚烈，需要制化');
    }
    if (shenShaList.includes('桃花')) {
      keyPoints.push('有桃花，异性缘佳，但需注意感情纠纷');
    }
    if (shenShaList.includes('华盖')) {
      keyPoints.push('有华盖，有艺术天赋，但性格孤僻');
    }

    // 综合评价
    let overallInfluence = '';
    let advice = '';

    const totalScore = jiShenCount * 2 + jiXiongShenCount - xiongShenCount;
    
    if (totalScore >= 3) {
      overallInfluence = '神煞配置较好，整体偏吉';
      advice = '要充分发挥吉神的作用，注意化解凶神的不利影响。';
    } else if (totalScore >= 0) {
      overallInfluence = '神煞配置平衡，吉凶参半';
      advice = '要平衡发展，既要发挥优势，也要注意防范风险。';
    } else {
      overallInfluence = '神煞配置偏弱，需要注意化解';
      advice = '要特别注意化解凶神的影响，多行善事，积累功德。';
    }

    return {
      totalShenSha: shenShaList.length,
      jiShenCount,
      xiongShenCount,
      jiXiongShenCount,
      overallInfluence,
      keyPoints,
      advice
    };
  }

  /**
   * 获取神煞类型
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  static getShenShaType(shenSha: string): string {
    const info = this.getShenShaInfo(shenSha);
    return info ? info.type : '未知';
  }

  /**
   * 获取所有支持的神煞列表
   * @returns 神煞列表
   */
  static getAllSupportedShenSha(): string[] {
    return [
      '天乙贵人', '羊刃', '桃花', '华盖', '文昌', '禄神', '将星',
      '孤辰', '寡宿', '天德', '月德', '天医', '红艳', '天罗',
      '地网', '天空', '地劫', '天刑', '天哭', '天虚', '咸池',
      '亡神', '劫煞', '灾煞', '驿马', '天喜', '红鸾', '天狗',
      '吊客', '丧门', '披麻', '元辰', '空亡', '十恶大败'
    ];
  }

  /**
   * 检查神煞是否为重要神煞
   * @param shenSha 神煞名称
   * @returns 是否为重要神煞
   */
  static isImportantShenSha(shenSha: string): boolean {
    const importantShenSha = [
      '天乙贵人', '羊刃', '桃花', '华盖', '文昌', '禄神',
      '将星', '天德', '月德', '孤辰', '寡宿'
    ];
    return importantShenSha.includes(shenSha);
  }

  /**
   * 获取神煞的影响强度
   * @param shenSha 神煞名称
   * @returns 影响强度（1-10）
   */
  static getShenShaStrength(shenSha: string): number {
    const strengthMap: { [key: string]: number } = {
      '天乙贵人': 9,
      '羊刃': 8,
      '桃花': 7,
      '华盖': 6,
      '文昌': 7,
      '禄神': 8,
      '将星': 7,
      '天德': 9,
      '月德': 8,
      '孤辰': 6,
      '寡宿': 6
    };
    return strengthMap[shenSha] || 5;
  }

  /**
   * 获取神煞组合分析（兼容旧接口）
   * @param shenShaList 神煞列表
   * @returns 神煞组合分析数组
   */
  static getShenShaCombinationAnalysis(shenShaList: string[]): Array<{
    combination: string;
    level: number;
    type: string;
    description: string;
    analysis: string;
    source?: string;
    influence?: string;
  }> {
    const combinations: Array<{
      combination: string;
      level: number;
      type: string;
      description: string;
      analysis: string;
      source?: string;
      influence?: string;
    }> = [];

    // 检查重要的神煞组合
    if (shenShaList.includes('天乙贵人') && shenShaList.includes('文昌')) {
      combinations.push({
        combination: '天乙贵人+文昌',
        level: 4,
        type: 'good',
        description: '贵人相助，文昌加持，学业事业双丰收',
        analysis: '天乙贵人主贵人相助，文昌主文学才华，两者结合形成极佳的学业事业运势。',
        source: '古籍记载：天乙文昌同现，主文贵双全',
        influence: '学业有成，事业顺利，容易得到权威人士的赏识和提拔'
      });
    }

    if (shenShaList.includes('羊刃') && shenShaList.includes('将星')) {
      combinations.push({
        combination: '羊刃+将星',
        level: 3,
        type: 'good',
        description: '刚毅果断，有领导才能，但需控制脾气',
        analysis: '羊刃主刚烈果断，将星主统御能力，两者结合形成强势的领导格局。',
        source: '命理典籍：羊刃将星，威权显赫',
        influence: '具有强烈的领导欲望和能力，但需要注意控制脾气，避免过于专断'
      });
    }

    if (shenShaList.includes('桃花') && shenShaList.includes('华盖')) {
      combinations.push({
        combination: '桃花+华盖',
        level: 3,
        type: 'mixed',
        description: '艺术天赋突出，但感情复杂，性格孤僻',
        analysis: '桃花主异性缘和艺术才华，华盖主孤独和超凡脱俗，形成矛盾的性格特征。',
        source: '命理古书：桃花华盖，艺术超群而情感孤独',
        influence: '在艺术领域容易有突出成就，但感情生活复杂，容易感到孤独'
      });
    }

    if (shenShaList.includes('孤辰') && shenShaList.includes('寡宿')) {
      combinations.push({
        combination: '孤辰+寡宿',
        level: 2,
        type: 'bad',
        description: '容易孤独，人际关系不佳，需要主动社交',
        analysis: '孤辰寡宿同现，主孤独之象，人际关系较为困难。',
        source: '古籍云：孤辰寡宿，六亲无靠',
        influence: '容易感到孤独，人际关系不佳，需要主动改善社交能力'
      });
    }

    return combinations;
  }

  /**
   * 获取神煞详细解释（兼容旧接口）
   * @param shenSha 神煞名称
   * @returns 神煞详细解释
   */
  static getShenShaExplanation(shenSha: string): {
    name: string;
    type: string;
    description: string;
    detailDescription: string;
    calculation?: string;
    influence?: string[];
  } | null {
    const info = this.getShenShaInfo(shenSha);
    if (!info) return null;

    return {
      name: info.name,
      type: info.type,
      description: info.explanation,
      detailDescription: info.influence,
      calculation: info.calculation,
      influence: [info.advice]
    };
  }
}
