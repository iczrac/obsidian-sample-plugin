/**
 * 神煞数据管理服务
 * 统一管理神煞的详细信息、分类、化解方法等数据
 */

export interface ShenShaDetail {
  name: string;
  type: string;
  description: string;
  effect: string;
  calculation: string;
  category: string;
  level: number; // 重要程度 1-10
}

export interface ResolutionMethod {
  method: string;
  items: string[];
  timing: string;
  precautions: string[];
  effectiveness: number; // 有效性 1-10
}

export interface ImpactLevel {
  positive: number; // 正面影响 0-10
  negative: number; // 负面影响 0-10
  overall: number;  // 综合影响 -10到10
  description: string;
}

export class ShenShaDataService {
  
  /**
   * 神煞详细信息数据库
   */
  private static readonly SHENSHA_DETAILS: {[key: string]: ShenShaDetail} = {
    '天乙贵人': {
      name: '天乙贵人',
      type: '吉神',
      description: '命中贵人，主得贵人相助',
      effect: '逢凶化吉，遇难呈祥，多得贵人扶持，事业有成',
      calculation: '甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎',
      category: '贵人类',
      level: 10
    },
    '禄神': {
      name: '禄神',
      type: '吉神',
      description: '天干之禄，主财禄丰厚',
      effect: '财运亨通，衣食无忧，事业有成，收入稳定',
      calculation: '甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子',
      category: '财禄类',
      level: 9
    },
    '羊刃': {
      name: '羊刃',
      type: '凶神',
      description: '刚强之星，主性格刚烈',
      effect: '性格急躁，易有血光之灾，但也主武勇，有领导才能',
      calculation: '甲刃在卯，乙刃在寅，丙戊刃在午，丁己刃在巳，庚刃在酉，辛刃在申，壬刃在子，癸刃在亥',
      category: '刑冲类',
      level: 8
    },
    '桃花': {
      name: '桃花',
      type: '吉凶神',
      description: '异性缘星，主感情丰富',
      effect: '异性缘佳，魅力十足，但易有感情纠纷，婚姻波折',
      calculation: '寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子',
      category: '感情类',
      level: 6
    },
    '华盖': {
      name: '华盖',
      type: '吉凶神',
      description: '艺术之星，主聪明孤高',
      effect: '聪明好学，有艺术天赋，宗教缘分深，但性格孤僻，不善交际',
      calculation: '寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未',
      category: '才艺类',
      level: 7
    },
    '文昌': {
      name: '文昌',
      type: '吉神',
      description: '文学之星，主聪明好学',
      effect: '学业有成，文思敏捷，利考试升学，文笔出众',
      calculation: '甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯',
      category: '学业类',
      level: 8
    },
    '将星': {
      name: '将星',
      type: '吉凶神',
      description: '权威之星，主领导才能',
      effect: '有领导才能，权威性强，但易孤独，责任重大',
      calculation: '寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯',
      category: '权威类',
      level: 7
    },
    '驿马': {
      name: '驿马',
      type: '吉神',
      description: '奔波之星，主变动迁移',
      effect: '多变动，利远行，事业多变化，但也主奔波劳碌',
      calculation: '申子辰见寅，寅午戌见申，巳酉丑见亥，亥卯未见巳',
      category: '变动类',
      level: 6
    },
    '天德': {
      name: '天德',
      type: '吉神',
      description: '天德之星，主逢凶化吉',
      effect: '逢凶化吉，遇难呈祥，天德护佑，灾难自消',
      calculation: '正月生见丁，二月生见申，三月生见壬，四月生见辛，五月生见亥，六月生见甲，七月生见癸，八月生见寅，九月生见丙，十月生见乙，十一月生见巳，十二月生见庚',
      category: '德星类',
      level: 9
    },
    '月德': {
      name: '月德',
      type: '吉神',
      description: '月德之星，主品德高尚',
      effect: '品德高尚，人缘好，逢凶化吉，多得人助',
      calculation: '寅午戌月生见丙，申子辰月生见壬，巳酉丑月生见庚，亥卯未月生见甲',
      category: '德星类',
      level: 8
    },
    '天医': {
      name: '天医',
      type: '吉神',
      description: '医药之星，主健康长寿',
      effect: '身体健康，长寿，有医药缘分，能治病救人',
      calculation: '正月亥，二月子，三月丑，四月寅，五月卯，六月辰，七月巳，八月午，九月未，十月申，十一月酉，十二月戌',
      category: '健康类',
      level: 7
    },
    '劫煞': {
      name: '劫煞',
      type: '凶神',
      description: '劫夺之星，主破财损失',
      effect: '易破财，多劫夺，投资失利，财来财去',
      calculation: '申子辰见巳，寅午戌见亥，巳酉丑见寅，亥卯未见申',
      category: '破财类',
      level: 7
    },
    '灾煞': {
      name: '灾煞',
      type: '凶神',
      description: '灾难之星，主意外灾祸',
      effect: '易有意外灾祸，疾病缠身，需注意安全',
      calculation: '申子辰见午，寅午戌见子，巳酉丑见卯，亥卯未见酉',
      category: '灾祸类',
      level: 8
    },
    '天刑': {
      name: '天刑',
      type: '凶神',
      description: '刑罚之星，主官司诉讼',
      effect: '易有官司诉讼，刑罚之灾，需谨慎行事',
      calculation: '寅见巳，巳见申，申见亥，亥见寅',
      category: '刑罚类',
      level: 8
    },
    '孤辰': {
      name: '孤辰',
      type: '凶神',
      description: '孤独之星，主孤独无依',
      effect: '性格孤僻，人际关系差，易孤独终老',
      calculation: '亥子丑人见寅，寅卯辰人见巳，巳午未人见申，申酉戌人见亥',
      category: '孤独类',
      level: 6
    },
    '寡宿': {
      name: '寡宿',
      type: '凶神',
      description: '寡居之星，主婚姻不利',
      effect: '婚姻不利，易寡居，感情波折多',
      calculation: '亥子丑人见戌，寅卯辰人见丑，巳午未人见辰，申酉戌人见未',
      category: '婚姻类',
      level: 6
    },
    '魁罡': {
      name: '魁罡',
      type: '凶神',
      description: '刚强之星，主性格刚烈',
      effect: '性格刚烈，有领导才能，但易孤独，婚姻不顺',
      calculation: '庚戌、庚辰、戊戌、壬辰四日',
      category: '刚强类',
      level: 7
    },
    '阴差阳错': {
      name: '阴差阳错',
      type: '凶神',
      description: '婚姻不顺之星',
      effect: '婚姻感情容易出现波折，夫妻不和，易有第三者',
      calculation: '丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥',
      category: '婚姻类',
      level: 7
    }
  };

  /**
   * 化解方法数据库
   */
  private static readonly RESOLUTION_METHODS: {[key: string]: ResolutionMethod} = {
    '羊刃': {
      method: '佩戴化解物品，修身养性',
      items: ['玉器', '佛珠', '平安符'],
      timing: '日常佩戴',
      precautions: ['控制脾气', '避免冲动', '多行善事'],
      effectiveness: 7
    },
    '桃花': {
      method: '正确处理感情，避免滥情',
      items: ['粉水晶', '和合符', '红绳'],
      timing: '感情期间',
      precautions: ['专一感情', '避免暧昧', '正当交往'],
      effectiveness: 6
    },
    '劫煞': {
      method: '谨慎理财，避免投机',
      items: ['貔貅', '五帝钱', '聚宝盆'],
      timing: '投资理财时',
      precautions: ['谨慎投资', '避免借贷', '稳健理财'],
      effectiveness: 7
    },
    '魁罡': {
      method: '修身养性，积德行善',
      items: ['佛珠', '经书', '善书'],
      timing: '日常修持',
      precautions: ['控制脾气', '多行善事', '避免争斗'],
      effectiveness: 8
    },
    '阴差阳错': {
      method: '择吉结婚，和谐相处',
      items: ['和合符', '鸳鸯玉', '红绳'],
      timing: '结婚前后',
      precautions: ['选择良辰吉日', '夫妻和睦', '互相包容'],
      effectiveness: 6
    }
  };

  /**
   * 获取神煞详细信息
   * @param shenShaName 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaDetail(shenShaName: string): ShenShaDetail {
    // 去除可能的前缀（如"年柱:"）
    const pureName = shenShaName.includes(':') ? shenShaName.split(':')[1] : shenShaName;
    
    return this.SHENSHA_DETAILS[pureName] || {
      name: pureName,
      type: '未知',
      description: '暂无详细信息',
      effect: '暂无详细信息',
      calculation: '暂无详细信息',
      category: '其他',
      level: 5
    };
  }

  /**
   * 获取神煞分类
   * @param shenShaName 神煞名称
   * @returns 神煞分类
   */
  static getShenShaCategory(shenShaName: string): string {
    const detail = this.getShenShaDetail(shenShaName);
    return detail.category;
  }

  /**
   * 获取化解方法
   * @param shenShaName 神煞名称
   * @returns 化解方法
   */
  static getResolutionMethod(shenShaName: string): ResolutionMethod | null {
    const pureName = shenShaName.includes(':') ? shenShaName.split(':')[1] : shenShaName;
    return this.RESOLUTION_METHODS[pureName] || null;
  }

  /**
   * 获取神煞影响程度
   * @param shenShaName 神煞名称
   * @returns 影响程度评估
   */
  static getShenShaImpact(shenShaName: string): ImpactLevel {
    const detail = this.getShenShaDetail(shenShaName);
    
    let positive = 0;
    let negative = 0;
    
    switch (detail.type) {
      case '吉神':
        positive = detail.level;
        negative = 0;
        break;
      case '凶神':
        positive = 0;
        negative = detail.level;
        break;
      case '吉凶神':
        positive = Math.floor(detail.level * 0.6);
        negative = Math.floor(detail.level * 0.4);
        break;
    }
    
    const overall = positive - negative;
    
    let description = '';
    if (overall >= 7) {
      description = '影响极为有利';
    } else if (overall >= 4) {
      description = '影响较为有利';
    } else if (overall >= 1) {
      description = '影响略为有利';
    } else if (overall >= -1) {
      description = '影响中性';
    } else if (overall >= -4) {
      description = '影响略为不利';
    } else if (overall >= -7) {
      description = '影响较为不利';
    } else {
      description = '影响极为不利';
    }
    
    return {
      positive,
      negative,
      overall,
      description
    };
  }

  /**
   * 获取所有神煞分类列表
   * @returns 分类列表
   */
  static getAllCategories(): string[] {
    const categories = new Set<string>();
    Object.values(this.SHENSHA_DETAILS).forEach(detail => {
      categories.add(detail.category);
    });
    return Array.from(categories);
  }

  /**
   * 根据分类获取神煞列表
   * @param category 分类名称
   * @returns 该分类下的神煞列表
   */
  static getShenShaByCategory(category: string): string[] {
    return Object.entries(this.SHENSHA_DETAILS)
      .filter(([_, detail]) => detail.category === category)
      .map(([name, _]) => name);
  }

  /**
   * 获取所有有化解方法的神煞
   * @returns 可化解的神煞列表
   */
  static getResolvableShenSha(): string[] {
    return Object.keys(this.RESOLUTION_METHODS);
  }
}
