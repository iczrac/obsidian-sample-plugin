/**
 * 五行解释服务
 * 整合五行和日主旺衰的解释功能
 */

export interface WuXingInfo {
  name: string;
  explanation: string;
  influence: string;
  calculation: string;
  characteristics: string;
  advantages: string;
  disadvantages: string;
  advice: string;
}

export interface RiZhuInfo {
  name: string;
  explanation: string;
  influence: string;
  calculation: string;
  characteristics: string;
  advantages: string;
  disadvantages: string;
  advice: string;
}

export interface WuXingBalanceAnalysis {
  strongestWuXing: string;
  weakestWuXing: string;
  balance: string;
  advice: string;
  recommendations: string[];
}

export class WuXingExplanationService {
  /**
   * 获取五行的详细信息
   * @param wuXing 五行名称
   * @returns 五行详细信息
   */
  static getWuXingInfo(wuXing: string): WuXingInfo | null {
    const wuXingData: { [key: string]: WuXingInfo } = {
      '金': {
        name: '金',
        explanation: '金五行代表坚强、刚毅、决断力。金主义，性格刚正不阿。',
        influence: '金五行强的人，性格刚毅，有决断力，做事果断，但可能过于固执；金五行弱的人，缺乏决断力，优柔寡断，但为人温和。',
        calculation: '金五行强度通过天干（庚辛）、地支藏干、纳音五行、季节影响等综合计算。秋季金旺，冬季金相，春季金囚，夏季金死。',
        characteristics: '刚毅果断，有正义感，重视原则，做事有条理，但可能过于严格。',
        advantages: '决断力强，有领导才能，做事效率高，重视信用，适合管理工作。',
        disadvantages: '过于刚硬，不够灵活，容易固执己见，人际关系可能紧张。',
        advice: '要学会灵活变通，适当放松对原则的坚持，多倾听他人意见，培养包容心。'
      },
      '木': {
        name: '木',
        explanation: '木五行代表生长、创造、进取心。木主仁，性格仁慈善良。',
        influence: '木五行强的人，有进取心，创造力强，但可能过于固执；木五行弱的人，缺乏进取心，随遇而安，但为人随和。',
        calculation: '木五行强度通过天干（甲乙）、地支藏干、纳音五行、季节影响等综合计算。春季木旺，冬季木相，秋季木囚，夏季木死。',
        characteristics: '有进取心，富有创造力，善良仁慈，但可能过于理想化。',
        advantages: '创造力强，有进取精神，善于成长发展，人际关系和谐，有同情心。',
        disadvantages: '有时过于理想化，缺乏现实感，容易受挫，可能过于固执。',
        advice: '要结合实际情况，适当调整理想目标，增强抗挫折能力，保持灵活性。'
      },
      '水': {
        name: '水',
        explanation: '水五行代表智慧、沟通、适应力。水主智，性格聪明机智。',
        influence: '水五行强的人，聪明智慧，善于沟通，适应力强，但可能过于多虑；水五行弱的人，缺乏智慧，沟通能力差，但为人踏实。',
        calculation: '水五行强度通过天干（壬癸）、地支藏干、纳音五行、季节影响等综合计算。冬季水旺，秋季水相，春季水囚，夏季水死。',
        characteristics: '聪明机智，善于沟通，适应力强，但可能过于多变。',
        advantages: '智慧过人，沟通能力强，适应环境快，善于变通，学习能力强。',
        disadvantages: '有时过于多虑，缺乏坚持性，容易变化无常，可能不够踏实。',
        advice: '要培养坚持性，适当减少多虑，将智慧用在正确的方向上，保持稳定性。'
      },
      '火': {
        name: '火',
        explanation: '火五行代表热情、活力、表现力。火主礼，性格热情开朗。',
        influence: '火五行强的人，热情活力，表现力强，但可能过于浮躁；火五行弱的人，缺乏热情，表现力差，但为人稳重。',
        calculation: '火五行强度通过天干（丙丁）、地支藏干、纳音五行、季节影响等综合计算。夏季火旺，春季火相，秋季火囚，冬季火死。',
        characteristics: '热情开朗，表现力强，有活力，但可能过于急躁。',
        advantages: '热情洋溢，表现力强，有感染力，善于激励他人，适合表演艺术。',
        disadvantages: '有时过于急躁，缺乏耐心，容易冲动行事，可能不够稳重。',
        advice: '要培养耐心，控制冲动情绪，将热情用在持久的事业上，保持稳定发展。'
      },
      '土': {
        name: '土',
        explanation: '土五行代表稳重、踏实、包容力。土主信，性格诚实可靠。',
        influence: '土五行强的人，稳重踏实，包容力强，但可能过于保守；土五行弱的人，缺乏稳定性，做事不踏实，但为人灵活。',
        calculation: '土五行强度通过天干（戊己）、地支藏干、纳音五行、季节影响等综合计算。四季末月土旺，夏季土相，冬季土囚，秋季土死。',
        characteristics: '稳重踏实，包容力强，诚实可靠，但可能过于保守。',
        advantages: '稳重可靠，包容心强，有耐心，善于积累，适合长期发展的事业。',
        disadvantages: '有时过于保守，缺乏创新精神，变化适应能力较差，可能过于固执。',
        advice: '要适当增加创新意识，提高变化适应能力，在稳重的基础上寻求发展。'
      }
    };

    return wuXingData[wuXing] || null;
  }

  /**
   * 获取日主旺衰的详细信息
   * @param riZhu 日主旺衰状态
   * @returns 日主旺衰详细信息
   */
  static getRiZhuInfo(riZhu: string): RiZhuInfo | null {
    const riZhuData: { [key: string]: RiZhuInfo } = {
      '旺': {
        name: '旺',
        explanation: '日主旺表示命主的五行力量强盛，个性刚强，自信心强。',
        influence: '日主旺的人，性格刚强，自信心强，有领导能力，做事果断，但可能过于自信或固执。',
        calculation: '通过计算日主五行在八字中的强度，结合季节影响、生克关系等因素综合判断。',
        characteristics: '自信心强，有主见，领导能力强，做事果断，但可能过于固执。',
        advantages: '领导能力强，自信心足，做事有魄力，能够独当一面，适合创业。',
        disadvantages: '可能过于自信，不易接受他人意见，容易固执己见，人际关系可能紧张。',
        advice: '要学会倾听他人意见，适当收敛锋芒，培养团队合作精神，避免过于独断专行。'
      },
      '相': {
        name: '相',
        explanation: '日主相表示命主的五行力量较强，性格较为平衡。',
        influence: '日主相的人，性格较为平衡，有自信但不过分，能够适应各种环境。',
        calculation: '日主五行强度适中偏强，能够很好地平衡各种关系和环境变化。',
        characteristics: '性格平衡，有自信但不过分，适应能力强，做事有分寸。',
        advantages: '性格平衡，适应能力强，既有主见又能接受他人意见，人际关系和谐。',
        disadvantages: '有时可能缺乏突出的特点，在竞争中可能不够突出。',
        advice: '要发挥平衡的优势，在稳定中寻求发展，适当展现个人特色。'
      },
      '休': {
        name: '休',
        explanation: '日主休表示命主的五行力量适中，性格温和平衡。',
        influence: '日主休的人，性格温和，适应力强，能够融入各种环境。',
        calculation: '日主五行强度适中，处于相对平衡的状态，不强不弱。',
        characteristics: '性格温和，适应力强，为人平和，但可能缺乏突出特点。',
        advantages: '性格温和，人际关系好，适应能力强，能够在各种环境中生存。',
        disadvantages: '可能缺乏主见，不够突出，在竞争中可能处于劣势。',
        advice: '要培养自己的特长，增强自信心，在温和的基础上展现个人魅力。'
      },
      '囚': {
        name: '囚',
        explanation: '日主囚表示命主的五行力量较弱，个性较为内向。',
        influence: '日主囚的人，个性较为内向，自信心不足，容易受外界影响。',
        calculation: '日主五行强度偏弱，受到一定的制约和限制。',
        characteristics: '个性内向，自信心不足，容易受影响，但为人谦和。',
        advantages: '为人谦和，善于倾听，容易得到他人帮助，适合辅助性工作。',
        disadvantages: '自信心不足，缺乏主见，容易受他人影响，可能错失机会。',
        advice: '要培养自信心，增强主见，适当展现个人能力，寻求支持和帮助。'
      },
      '死': {
        name: '死',
        explanation: '日主死表示命主的五行力量很弱，需要外力扶助。',
        influence: '日主死的人，五行力量很弱，需要依靠外力支持，但也容易得到帮助。',
        calculation: '日主五行强度很弱，处于最不利的状态，需要其他五行的扶助。',
        characteristics: '五行力量弱，依赖性强，但容易得到他人帮助。',
        advantages: '容易得到他人帮助和支持，善于借助外力，适应能力强。',
        disadvantages: '自立能力差，过于依赖他人，缺乏独立性，可能缺乏主见。',
        advice: '要逐步培养独立能力，在接受帮助的同时提升自己，寻求平衡发展。'
      }
    };

    return riZhuData[riZhu] || null;
  }

  /**
   * 分析五行平衡
   * @param wuXingData 五行数据
   * @returns 五行平衡分析
   */
  static analyzeWuXingBalance(wuXingData: { [key: string]: number }): WuXingBalanceAnalysis {
    const wuXingList = Object.entries(wuXingData).sort((a, b) => b[1] - a[1]);
    const strongestWuXing = wuXingList[0][0];
    const weakestWuXing = wuXingList[wuXingList.length - 1][0];
    
    const maxScore = wuXingList[0][1];
    const minScore = wuXingList[wuXingList.length - 1][1];
    const difference = maxScore - minScore;

    let balance = '';
    let advice = '';
    const recommendations: string[] = [];

    if (difference <= 2) {
      balance = '五行平衡';
      advice = '五行相对平衡，发展较为稳定，要保持现状并适当发展优势。';
      recommendations.push('保持五行平衡，全面发展');
      recommendations.push('适当强化优势五行');
    } else if (difference <= 4) {
      balance = '五行偏强';
      advice = `${strongestWuXing}五行偏强，要注意平衡发展，避免过度偏向。`;
      recommendations.push(`适当抑制${strongestWuXing}五行的过度发展`);
      recommendations.push(`加强${weakestWuXing}五行的培养`);
      recommendations.push('寻求五行平衡发展');
    } else {
      balance = '五行失衡';
      advice = `五行严重失衡，${strongestWuXing}过强而${weakestWuXing}过弱，需要重点调整。`;
      recommendations.push(`重点抑制${strongestWuXing}五行的过度发展`);
      recommendations.push(`大力加强${weakestWuXing}五行的培养`);
      recommendations.push('通过生活方式、职业选择等调整五行平衡');
      recommendations.push('寻求专业指导进行五行调理');
    }

    return {
      strongestWuXing,
      weakestWuXing,
      balance,
      advice,
      recommendations
    };
  }

  /**
   * 获取五行建议
   * @param wuXing 五行名称
   * @returns 五行建议
   */
  static getWuXingAdvice(wuXing: string): string {
    const info = this.getWuXingInfo(wuXing);
    return info ? info.advice : '建议根据具体情况进行分析。';
  }

  /**
   * 获取日主建议
   * @param riZhu 日主旺衰
   * @returns 日主建议
   */
  static getRiZhuAdvice(riZhu: string): string {
    const info = this.getRiZhuInfo(riZhu);
    return info ? info.advice : '建议根据具体情况进行分析。';
  }

  /**
   * 获取五行相克关系
   * @param wuXing1 五行1
   * @param wuXing2 五行2
   * @returns 相克关系
   */
  static getWuXingRelation(wuXing1: string, wuXing2: string): string {
    const keMap: { [key: string]: string } = {
      '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
    };
    const shengMap: { [key: string]: string } = {
      '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
    };

    if (keMap[wuXing1] === wuXing2) {
      return `${wuXing1}克${wuXing2}`;
    } else if (keMap[wuXing2] === wuXing1) {
      return `${wuXing2}克${wuXing1}`;
    } else if (shengMap[wuXing1] === wuXing2) {
      return `${wuXing1}生${wuXing2}`;
    } else if (shengMap[wuXing2] === wuXing1) {
      return `${wuXing2}生${wuXing1}`;
    } else {
      return '无直接关系';
    }
  }

  /**
   * 获取五行详细信息（兼容旧接口）
   * @param wuXing 五行名称
   * @returns 五行详细信息
   */
  static getWuXingInfoCompat(wuXing: string): {
    name: string;
    description: string;
    characteristics: string;
    advantages: string;
    disadvantages: string;
    advice: string;
  } | null {
    const info = this.getWuXingInfo(wuXing);
    if (!info) return null;

    return {
      name: info.name,
      description: info.explanation,
      characteristics: info.characteristics,
      advantages: info.advantages,
      disadvantages: info.disadvantages,
      advice: info.advice
    };
  }
}
