import { BaziInfo } from '../types/BaziInfo';

/**
 * 格局解释服务
 * 整合格局解释、判断和分析功能
 */

export interface GeJuExplanation {
  name: string;
  explanation: string;
  characteristics: string;
  advantages: string;
  disadvantages: string;
  advice: string;
  calculation: string;
}

export interface GeJuJudgeResult {
  mainGeJu: string;
  mainGeJuDetail: string;
  mainGeJuStrength: number;
  assistGeJuList: {
    geJu: string;
    detail: string;
    strength: number;
  }[];
  yongShen: string;
  yongShenDetail: string;
  factors: {
    factor: string;
    description: string;
    contribution: number;
  }[];
}

export class GeJuExplanationService {
  /**
   * 获取格局的详细解释
   * @param geJu 格局名称
   * @returns 格局详细解释
   */
  static getGeJuExplanation(geJu: string): GeJuExplanation | null {
    const explanations: { [key: string]: GeJuExplanation } = {
      '正官格': {
        name: '正官格',
        explanation: '正官格是以正官为用神的格局，正官代表权威、地位、责任心。',
        characteristics: '性格正直，有责任心，重视名誉，具有领导才能，做事有条理。',
        advantages: '容易获得权威地位，受人尊敬，事业发展稳定，适合从事管理工作。',
        disadvantages: '过于拘谨，缺乏创新精神，容易受传统束缚，变通能力较差。',
        advice: '应该培养创新思维，适当放松对规则的执着，学会灵活变通。',
        calculation: '正官格的判断：月令正官当权，或天干正官透出且有力，日主有一定强度能够承受正官的约束。'
      },
      '七杀格': {
        name: '七杀格',
        explanation: '七杀格是以七杀为用神的格局，七杀代表权威、压力、挑战。',
        characteristics: '性格刚强，有魄力，敢于面对挑战，具有强烈的进取心。',
        advantages: '适应能力强，能在困境中成长，具有开拓精神，容易在竞争中获胜。',
        disadvantages: '性格过于刚烈，容易与人发生冲突，压力过大时容易情绪失控。',
        advice: '需要学会控制情绪，培养耐心，适当缓解压力，与人和谐相处。',
        calculation: '七杀格的判断：月令七杀当权，或天干七杀透出且有力，需要有制化才能成格。'
      },
      '正财格': {
        name: '正财格',
        explanation: '正财格是以正财为用神的格局，正财代表稳定收入、理财能力。',
        characteristics: '务实稳重，善于理财，重视物质生活，做事踏实可靠。',
        advantages: '财运稳定，善于积累财富，理财能力强，生活安定。',
        disadvantages: '过于重视物质，可能缺乏精神追求，有时显得保守。',
        advice: '在追求物质的同时，也要注重精神层面的提升，适当冒险尝试新事物。',
        calculation: '正财格的判断：月令正财当权，或天干正财透出且有力，日主有一定强度。'
      },
      '偏财格': {
        name: '偏财格',
        explanation: '偏财格是以偏财为用神的格局，偏财代表意外之财、投资收益。',
        characteristics: '善于经营，有商业头脑，喜欢投资，人际关系广泛。',
        advantages: '财运较好，善于把握商机，适合从事商业活动，人缘佳。',
        disadvantages: '有时过于投机，财来财去不稳定，容易因财生灾。',
        advice: '要学会稳健投资，不要过度投机，建立稳定的财务基础。',
        calculation: '偏财格的判断：月令偏财当权，或天干偏财透出且有力，日主旺盛。'
      },
      '正印格': {
        name: '正印格',
        explanation: '正印格是以正印为用神的格局，正印代表学识、文化、母爱。',
        characteristics: '重视学习，有文化修养，心地善良，具有包容心。',
        advantages: '学习能力强，容易获得学历和文凭，适合从事教育、文化工作。',
        disadvantages: '有时过于依赖他人，缺乏独立性，行动力不足。',
        advice: '要培养独立思考能力，增强行动力，不要过度依赖他人。',
        calculation: '正印格的判断：月令正印当权，或天干正印透出且有力，日主偏弱。'
      },
      '偏印格': {
        name: '偏印格',
        explanation: '偏印格是以偏印为用神的格局，偏印代表特殊技能、宗教、艺术。',
        characteristics: '思维独特，有艺术天赋，喜欢神秘事物，具有直觉力。',
        advantages: '在艺术、宗教、技术等特殊领域容易有成就，直觉敏锐。',
        disadvantages: '有时过于孤僻，难以与人深入交流，容易钻牛角尖。',
        advice: '要多与人交流，保持开放心态，将特长转化为实际成就。',
        calculation: '偏印格的判断：月令偏印当权，或天干偏印透出且有力，需要适当制化。'
      },
      '食神格': {
        name: '食神格',
        explanation: '食神格是以食神为用神的格局，食神代表才华、口福、享受。',
        characteristics: '性格温和，有才华，善于表达，重视生活品质。',
        advantages: '才华横溢，容易在文艺、饮食等领域有成就，生活愉快。',
        disadvantages: '有时过于安逸，缺乏进取心，容易沉溺于享乐。',
        advice: '要保持适度的进取心，将才华转化为实际成就，不要过度享乐。',
        calculation: '食神格的判断：月令食神当权，或天干食神透出且有力，日主旺盛。'
      },
      '伤官格': {
        name: '伤官格',
        explanation: '伤官格是以伤官为用神的格局，伤官代表才华、创新、叛逆。',
        characteristics: '聪明才智，有创新精神，不拘一格，具有艺术天赋。',
        advantages: '创造力强，适合从事创新性工作，在艺术领域容易有成就。',
        disadvantages: '有时过于叛逆，不服管束，容易与权威发生冲突。',
        advice: '要学会适当妥协，将创新精神用在正确的方向上，避免无谓的冲突。',
        calculation: '伤官格的判断：月令伤官当权，或天干伤官透出且有力，需要适当制化。'
      },
      '从强格': {
        name: '从强格',
        explanation: '从强格是特殊格局，日主极旺，顺其旺势而行。',
        characteristics: '个性强烈，自信心强，有领导欲望，不易妥协。',
        advantages: '领导能力强，能够独当一面，在竞争中容易获胜。',
        disadvantages: '过于刚强，不易与人合作，容易孤立无援。',
        advice: '要学会团队合作，适当收敛锋芒，培养包容心。',
        calculation: '从强格的判断：日主极旺，四柱多比劫，无官杀制约，顺其旺势。'
      },
      '从弱格': {
        name: '从弱格',
        explanation: '从弱格是特殊格局，日主极弱，顺其弱势而行。',
        characteristics: '性格温和，适应性强，善于借助外力，懂得变通。',
        advantages: '适应能力强，善于与人合作，容易得到贵人相助。',
        disadvantages: '缺乏主见，过于依赖他人，自立能力较差。',
        advice: '要培养独立思考能力，增强自信心，适当展现个人能力。',
        calculation: '从弱格的判断：日主极弱，四柱多官杀财食伤，无印比帮扶，顺其弱势。'
      }
    };

    return explanations[geJu] || null;
  }

  /**
   * 判断八字格局（简化版，整合自GeJuJudgeService）
   * @param baziInfo 八字信息
   * @returns 格局判断结果
   */
  static judgeGeJu(baziInfo: BaziInfo): GeJuJudgeResult {
    // 初始化结果
    const result: GeJuJudgeResult = {
      mainGeJu: '',
      mainGeJuDetail: '',
      mainGeJuStrength: 0,
      assistGeJuList: [],
      yongShen: '',
      yongShenDetail: '',
      factors: []
    };

    // 检查必要信息
    if (!baziInfo.dayStem || !baziInfo.dayWuXing) {
      result.mainGeJu = '信息不足';
      result.mainGeJuDetail = '无法判断格局，缺少必要的八字信息。';
      return result;
    }

    // 简化的格局判断逻辑
    const monthShiShen = baziInfo.monthShiShenGan || '';
    
    switch (monthShiShen) {
      case '正官':
        result.mainGeJu = '正官格';
        result.mainGeJuDetail = '月令正官当权，为正官格';
        result.mainGeJuStrength = 75;
        result.yongShen = '正官';
        result.yongShenDetail = '以正官为用神，喜印绶护官';
        break;
      case '七杀':
        result.mainGeJu = '七杀格';
        result.mainGeJuDetail = '月令七杀当权，为七杀格';
        result.mainGeJuStrength = 70;
        result.yongShen = '食神';
        result.yongShenDetail = '以食神制杀为用神';
        break;
      case '正财':
        result.mainGeJu = '正财格';
        result.mainGeJuDetail = '月令正财当权，为正财格';
        result.mainGeJuStrength = 65;
        result.yongShen = '正财';
        result.yongShenDetail = '以正财为用神，喜官护财';
        break;
      case '偏财':
        result.mainGeJu = '偏财格';
        result.mainGeJuDetail = '月令偏财当权，为偏财格';
        result.mainGeJuStrength = 65;
        result.yongShen = '偏财';
        result.yongShenDetail = '以偏财为用神，喜食伤生财';
        break;
      case '正印':
        result.mainGeJu = '正印格';
        result.mainGeJuDetail = '月令正印当权，为正印格';
        result.mainGeJuStrength = 70;
        result.yongShen = '正印';
        result.yongShenDetail = '以正印为用神，喜官杀生印';
        break;
      case '偏印':
        result.mainGeJu = '偏印格';
        result.mainGeJuDetail = '月令偏印当权，为偏印格';
        result.mainGeJuStrength = 60;
        result.yongShen = '偏印';
        result.yongShenDetail = '以偏印为用神，需要制化';
        break;
      case '食神':
        result.mainGeJu = '食神格';
        result.mainGeJuDetail = '月令食神当权，为食神格';
        result.mainGeJuStrength = 70;
        result.yongShen = '食神';
        result.yongShenDetail = '以食神为用神，喜财星泄秀';
        break;
      case '伤官':
        result.mainGeJu = '伤官格';
        result.mainGeJuDetail = '月令伤官当权，为伤官格';
        result.mainGeJuStrength = 65;
        result.yongShen = '伤官';
        result.yongShenDetail = '以伤官为用神，需要制化';
        break;
      default:
        result.mainGeJu = '普通格局';
        result.mainGeJuDetail = '无明显格局特征，需综合分析';
        result.mainGeJuStrength = 50;
        result.yongShen = '待定';
        result.yongShenDetail = '需要详细分析确定用神';
    }

    return result;
  }

  /**
   * 获取格局建议
   * @param geJu 格局名称
   * @returns 格局建议
   */
  static getGeJuAdvice(geJu: string): string {
    const explanation = this.getGeJuExplanation(geJu);
    return explanation ? explanation.advice : '建议根据具体情况进行分析。';
  }

  /**
   * 分析格局组合
   * @param mainGeJu 主格局
   * @param assistGeJuList 辅助格局列表
   * @returns 组合分析
   */
  static analyzeGeJuCombination(mainGeJu: string, assistGeJuList: string[]): {
    analysis: string;
    strength: number;
    advice: string;
  } {
    let analysis = `主格局为${mainGeJu}`;
    let strength = 60;
    let advice = '';

    if (assistGeJuList.length > 0) {
      analysis += `，辅助格局有：${assistGeJuList.join('、')}`;
      strength += assistGeJuList.length * 5;
      advice = '格局组合较好，应该充分发挥各格局的优势。';
    } else {
      advice = '格局相对单一，建议专注发展主格局的特长。';
    }

    return {
      analysis,
      strength: Math.min(strength, 100),
      advice
    };
  }

  /**
   * 分析格局（兼容旧接口）
   * @param geJu 格局名称
   * @param riZhuStrength 日主旺衰
   * @returns 格局分析
   */
  static analyzeGeJu(geJu: string, riZhuStrength: string): {
    analysis: string;
    advice: string;
    characteristics: string;
  } {
    const explanation = this.getGeJuExplanation(geJu);

    return {
      analysis: explanation ? explanation.explanation : '无法分析此格局',
      advice: explanation ? explanation.advice : '建议咨询专业人士',
      characteristics: explanation ? explanation.characteristics : '特征不明'
    };
  }

  /**
   * 分析大运对格局的影响（兼容旧接口）
   * @param geJu 格局名称
   * @param daYunGanZhi 大运干支
   * @param riZhuWuXing 日主五行
   * @returns 大运影响分析
   */
  static analyzeDaYunEffect(
    geJu: string,
    daYunGanZhi: string,
    riZhuWuXing: string
  ): {
    effect: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  } {
    // 简化的大运影响分析
    if (!daYunGanZhi || daYunGanZhi.length !== 2) {
      return {
        effect: '无法分析大运影响',
        level: 'neutral'
      };
    }

    const daYunGan = daYunGanZhi.charAt(0);

    // 根据格局类型进行简化分析
    switch (geJu) {
      case '正官格':
        if (['甲', '乙', '壬', '癸'].includes(daYunGan)) {
          return { effect: '印绶护官，有利发展', level: 'good' };
        } else if (['丙', '丁'].includes(daYunGan)) {
          return { effect: '伤官见官，需要谨慎', level: 'bad' };
        }
        break;
      case '正财格':
        if (['庚', '辛'].includes(daYunGan)) {
          return { effect: '官星护财，财运亨通', level: 'good' };
        } else if (['甲', '乙'].includes(daYunGan)) {
          return { effect: '比劫夺财，需防破财', level: 'bad' };
        }
        break;
      case '食神格':
        if (['戊', '己'].includes(daYunGan)) {
          return { effect: '财星泄秀，才华显现', level: 'good' };
        } else if (['壬', '癸'].includes(daYunGan)) {
          return { effect: '偏印夺食，需要化解', level: 'bad' };
        }
        break;
      default:
        return { effect: '运势平稳，需综合分析', level: 'neutral' };
    }

    return { effect: '运势一般，需要努力', level: 'mixed' };
  }
}
