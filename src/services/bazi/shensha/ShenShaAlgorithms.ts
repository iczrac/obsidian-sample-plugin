/**
 * 神煞基础算法库
 * 提供所有神煞的基础判断方法，纯算法实现，无业务逻辑
 *
 * 📋 算法库说明：
 * - 包含52个基础神煞算法（原51个 + 新增日德）
 * - 纯函数实现，无副作用，易于测试
 * - 统一参数格式，便于ShenShaCalculationEngine调用
 * - 与SpecialShenShaCalculator协作，避免重复实现
 *
 * 🔄 整合历史：
 * - 2024-12: 消除与SpecialShenShaCalculator的重叠算法
 * - 统一魁罡、阴差阳错、十恶大败、孤鸾煞的实现
 * - 新增日德算法，完善基础算法库
 *
 * 📝 使用说明：
 * - 基础神煞：直接使用本算法库
 * - 复杂神煞（童子煞、将军箭）：使用SpecialShenShaCalculator
 * - 所有算法通过ShenShaCalculationEngine统一调用
 */
export class ShenShaAlgorithms {
  
  /**
   * 判断天乙贵人
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为天乙贵人
   */
  static isTianYiGuiRen(dayStem: string, branch: string): boolean {
    // 天乙贵人的计算规则：
    // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎
    const map: {[key: string]: string[]} = {
      '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
      '乙': ['子', '申'], '己': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '壬': ['巳', '卯'], '癸': ['巳', '卯'],
      '辛': ['午', '寅']
    };
    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断禄神
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为禄神
   */
  static isLuShen(stem: string, branch: string): boolean {
    const map: {[key: string]: string} = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    return map[stem] === branch;
  }

  /**
   * 判断羊刃
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为羊刃
   */
  static isYangRen(dayStem: string, branch: string): boolean {
    const map: {[key: string]: string} = {
      '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
      '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥'
    };
    return map[dayStem] === branch;
  }

  /**
   * 判断桃花
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为桃花
   */
  static isTaoHua(yearBranch: string, branch: string): boolean {
    // 桃花的计算规则：寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子
    const map: {[key: string]: string} = {
      '寅': '卯', '午': '卯', '戌': '卯',
      '申': '酉', '子': '酉', '辰': '酉',
      '巳': '午', '酉': '午', '丑': '午',
      '亥': '子', '卯': '子', '未': '子'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断华盖
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为华盖
   */
  static isHuaGai(yearBranch: string, branch: string): boolean {
    // 华盖的计算规则：寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未
    const map: {[key: string]: string} = {
      '寅': '戌', '午': '戌', '戌': '戌',
      '申': '辰', '子': '辰', '辰': '辰',
      '巳': '丑', '酉': '丑', '丑': '丑',
      '亥': '未', '卯': '未', '未': '未'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断文昌
   * @param yearStem 年干
   * @param branch 地支
   * @returns 是否为文昌
   */
  static isWenChang(yearStem: string, branch: string): boolean {
    // 文昌的计算规则：甲乙见巳，丙丁见申，戊己见申，庚辛见亥，壬癸见寅
    const map: {[key: string]: string} = {
      '甲': '巳', '乙': '巳',
      '丙': '申', '丁': '申',
      '戊': '申', '己': '申',
      '庚': '亥', '辛': '亥',
      '壬': '寅', '癸': '寅'
    };
    return map[yearStem] === branch;
  }

  /**
   * 判断将星
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为将星
   */
  static isJiangXing(yearBranch: string, branch: string): boolean {
    // 将星的计算规则：寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯
    const map: {[key: string]: string} = {
      '寅': '午', '午': '午', '戌': '午',
      '申': '子', '子': '子', '辰': '子',
      '巳': '酉', '酉': '酉', '丑': '酉',
      '亥': '卯', '卯': '卯', '未': '卯'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断驿马
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为驿马
   */
  static isYiMa(yearBranch: string, branch: string): boolean {
    // 驿马的计算规则：寅午戌见申，申子辰见寅，巳酉丑见亥，亥卯未见巳
    const map: {[key: string]: string} = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断天德
   * @param monthBranch 月支
   * @param stem 天干
   * @returns 是否为天德
   */
  static isTianDe(monthBranch: string, stem: string): boolean {
    // 天德的计算规则：根据月份查询对应的天干
    // 正月丁，二月申，三月壬，四月辛，五月亥，六月甲，七月癸，八月寅，九月丙，十月乙，十一月巳，十二月庚
    const monthToNumber: {[key: string]: number} = {
      '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
      '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
    };

    const tianDeMap: {[key: number]: string} = {
      1: '丁',   // 正月
      2: '申',   // 二月（地支）
      3: '壬',   // 三月
      4: '辛',   // 四月
      5: '亥',   // 五月（地支）
      6: '甲',   // 六月
      7: '癸',   // 七月
      8: '寅',   // 八月（地支）
      9: '丙',   // 九月
      10: '乙',  // 十月
      11: '巳',  // 十一月（地支）
      12: '庚'   // 十二月
    };

    const monthNumber = monthToNumber[monthBranch];
    return monthNumber ? tianDeMap[monthNumber] === stem : false;
  }

  /**
   * 判断月德
   * @param monthBranch 月支
   * @param stem 天干
   * @returns 是否为月德
   */
  static isYueDe(monthBranch: string, stem: string): boolean {
    // 月德的计算规则：根据月份查询对应的天干
    // 正月丙，二月甲，三月丁，四月辛，五月己，六月丁，七月壬，八月辛，九月戊，十月乙，十一月己，十二月丁
    const monthToNumber: {[key: string]: number} = {
      '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
      '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
    };

    const yueDeMap: {[key: number]: string} = {
      1: '丙',   // 正月
      2: '甲',   // 二月
      3: '丁',   // 三月
      4: '辛',   // 四月
      5: '己',   // 五月
      6: '丁',   // 六月
      7: '壬',   // 七月
      8: '辛',   // 八月
      9: '戊',   // 九月
      10: '乙',  // 十月
      11: '己',  // 十一月
      12: '丁'   // 十二月
    };

    const monthNumber = monthToNumber[monthBranch];
    return monthNumber ? yueDeMap[monthNumber] === stem : false;
  }

  /**
   * 判断天医
   * @param yearStem 年干
   * @param branch 地支
   * @returns 是否为天医
   */
  static isTianYi(yearStem: string, branch: string): boolean {
    // 天医的计算规则：根据年干查询对应的地支
    // 甲见丑，乙见子，丙见亥，丁见戌，戊见酉，己见申，庚见未，辛见午，壬见巳，癸见辰
    const tianYiMap: {[key: string]: string} = {
      '甲': '丑',
      '乙': '子',
      '丙': '亥',
      '丁': '戌',
      '戊': '酉',
      '己': '申',
      '庚': '未',
      '辛': '午',
      '壬': '巳',
      '癸': '辰'
    };

    return tianYiMap[yearStem] === branch;
  }

  /**
   * 判断劫煞
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为劫煞
   */
  static isJieSha(yearBranch: string, branch: string): boolean {
    // 劫煞的计算规则：寅午戌见亥，申子辰见巳，巳酉丑见寅，亥卯未见申
    const map: {[key: string]: string} = {
      '寅': '亥', '午': '亥', '戌': '亥',
      '申': '巳', '子': '巳', '辰': '巳',
      '巳': '寅', '酉': '寅', '丑': '寅',
      '亥': '申', '卯': '申', '未': '申'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断灾煞
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为灾煞
   */
  static isZaiSha(yearBranch: string, branch: string): boolean {
    // 灾煞的计算规则：寅午戌见子，申子辰见午，巳酉丑见卯，亥卯未见酉
    const map: {[key: string]: string} = {
      '寅': '子', '午': '子', '戌': '子',
      '申': '午', '子': '午', '辰': '午',
      '巳': '卯', '酉': '卯', '丑': '卯',
      '亥': '酉', '卯': '酉', '未': '酉'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断天刑
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为天刑
   */
  static isTianXing(yearBranch: string, branch: string): boolean {
    // 天刑的计算规则：寅午戌见寅，申子辰见申，巳酉丑见巳，亥卯未见亥
    const map: {[key: string]: string} = {
      '寅': '寅', '午': '寅', '戌': '寅',
      '申': '申', '子': '申', '辰': '申',
      '巳': '巳', '酉': '巳', '丑': '巳',
      '亥': '亥', '卯': '亥', '未': '亥'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断孤辰
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为孤辰
   */
  static isGuChen(yearBranch: string, branch: string): boolean {
    // 孤辰的计算规则：寅卯辰见寅，巳午未见巳，申酉戌见申，亥子丑见亥
    const map: {[key: string]: string} = {
      '寅': '寅', '卯': '寅', '辰': '寅',
      '巳': '巳', '午': '巳', '未': '巳',
      '申': '申', '酉': '申', '戌': '申',
      '亥': '亥', '子': '亥', '丑': '亥'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断寡宿
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为寡宿
   */
  static isGuaSu(yearBranch: string, branch: string): boolean {
    // 寡宿的计算规则：寅卯辰见戌，巳午未见丑，申酉戌见辰，亥子丑见未
    const map: {[key: string]: string} = {
      '寅': '戌', '卯': '戌', '辰': '戌',
      '巳': '丑', '午': '丑', '未': '丑',
      '申': '辰', '酉': '辰', '戌': '辰',
      '亥': '未', '子': '未', '丑': '未'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断魁罡
   * @param ganZhi 干支组合
   * @returns 是否为魁罡
   */
  static isKuiGang(ganZhi: string): boolean {
    const kuiGangDays = ['庚戌', '庚辰', '戊戌', '壬辰'];
    return kuiGangDays.includes(ganZhi);
  }

  /**
   * 判断阴差阳错
   * @param ganZhi 干支组合
   * @returns 是否为阴差阳错
   */
  static isYinChaYangCuo(ganZhi: string): boolean {
    const yinChaYangCuoDays = [
      '丙子', '丁丑', '戊寅', '辛卯', '壬辰', '癸巳',
      '丙午', '丁未', '戊申', '辛酉', '壬戌', '癸亥'
    ];
    return yinChaYangCuoDays.includes(ganZhi);
  }

  /**
   * 获取神煞类型（吉神、凶神、吉凶神）
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  static getShenShaType(shenSha: string): string {
    // 去除可能的前缀（如"年柱:"）
    const pureShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;

    // 吉神列表
    const goodShenSha = [
      '天乙贵人', '文昌', '文曲', '天德', '月德', '天福', '天官', '天厨',
      '天巫', '天月', '天喜', '天赦', '天恩', '驿马', '禄神', '国印',
      '天医', '天贵', '天才', '天寿', '天馨', '天钺', '天亨', '天解',
      '天报', '天庆', '天祥', '天佑', '天富', '天爵', '天德合', '月德合',
      '太极贵人', '金舆', '国印贵人', '三奇贵人', '福星贵人', '学堂词馆',
      '德秀贵人', '解神', '金神'
    ];

    // 凶神列表
    const badShenSha = [
      '天刑', '天哭', '天虚', '亡神', '劫煞', '灾煞', '五鬼',
      '天罗', '地网', '地丁', '阴差', '魁罡', '孤辰', '寡宿', '白虎',
      '天狗', '天狱', '天棒', '天牢', '天祸', '天煞', '天吏',
      '天奸', '天讼', '羊刃', '阴差阳错', '空亡', '十恶大败',
      '披麻', '吊客', '丧门', '元辰', '孤鸾煞', '四废', '天罗地网',
      '天空', '地劫'
    ];

    // 吉凶神列表（根据不同情况可能吉可能凶）
    const mixedShenSha = [
      '将星', '华盖', '桃花', '三台', '八座', '恩光', '天贵', '台辅',
      '封诰', '天使', '天伤', '截路', '旬空', '三奇', '六仪',
      '三合', '六合', '暗合', '拱合', '三会', '三刑', '六冲', '暗冲',
      '童子煞', '将军箭', '红艳', '红鸾', '天姚', '咸池', '天喜'
    ];

    if (goodShenSha.includes(pureShenSha)) {
      return '吉神';
    } else if (badShenSha.includes(pureShenSha)) {
      return '凶神';
    } else if (mixedShenSha.includes(pureShenSha)) {
      return '吉凶神';
    }

    return '未知';
  }

  /**
   * 判断空亡
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param branch 地支
   * @returns 是否为空亡
   */
  static isKongWang(dayStem: string, dayBranch: string, branch: string): boolean {
    // 空亡的计算规则：根据日柱查旬空
    // 甲子旬空戌亥，甲戌旬空申酉，甲申旬空午未，甲午旬空辰巳，甲辰旬空寅卯，甲寅旬空子丑
    const dayGanZhi = dayStem + dayBranch;

    // 确定日柱所在的旬
    const xunMap: {[key: string]: string[]} = {
      // 甲子旬（甲子、乙丑、丙寅、丁卯、戊辰、己巳、庚午、辛未、壬申、癸酉）
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],

      // 甲戌旬（甲戌、乙亥、丙子、丁丑、戊寅、己卯、庚辰、辛巳、壬午、癸未）
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],

      // 甲申旬（甲申、乙酉、丙戌、丁亥、戊子、己丑、庚寅、辛卯、壬辰、癸巳）
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],

      // 甲午旬（甲午、乙未、丙申、丁酉、戊戌、己亥、庚子、辛丑、壬寅、癸卯）
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],

      // 甲辰旬（甲辰、乙巳、丙午、丁未、戊申、己酉、庚戌、辛亥、壬子、癸丑）
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],

      // 甲寅旬（甲寅、乙卯、丙辰、丁巳、戊午、己未、庚申、辛酉、壬戌、癸亥）
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[dayGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断年空亡
   * @param yearStem 年干
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为年空亡
   */
  static isNianKongWang(yearStem: string, yearBranch: string, branch: string): boolean {
    // 年空亡：根据年柱查旬空
    const yearGanZhi = yearStem + yearBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[yearGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断月空亡
   * @param monthStem 月干
   * @param monthBranch 月支
   * @param branch 地支
   * @returns 是否为月空亡
   */
  static isYueKongWang(monthStem: string, monthBranch: string, branch: string): boolean {
    // 月空亡：根据月柱查旬空
    const monthGanZhi = monthStem + monthBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[monthGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断日空亡（原有的空亡算法）
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param branch 地支
   * @returns 是否为日空亡
   */
  static isRiKongWang(dayStem: string, dayBranch: string, branch: string): boolean {
    // 日空亡：根据日柱查旬空（与原有空亡算法相同）
    return ShenShaAlgorithms.isKongWang(dayStem, dayBranch, branch);
  }

  /**
   * 判断时空亡
   * @param hourStem 时干
   * @param hourBranch 时支
   * @param branch 地支
   * @returns 是否为时空亡
   */
  static isShiKongWang(hourStem: string, hourBranch: string, branch: string): boolean {
    // 时空亡：根据时柱查旬空
    const hourGanZhi = hourStem + hourBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[hourGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断命宫空亡
   * @param mingGongStem 命宫干
   * @param mingGongBranch 命宫支
   * @param branch 地支
   * @returns 是否为命宫空亡
   */
  static isMingGongKongWang(mingGongStem: string, mingGongBranch: string, branch: string): boolean {
    // 命宫空亡：根据命宫干支查旬空
    const mingGongGanZhi = mingGongStem + mingGongBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[mingGongGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断身宫空亡
   * @param shenGongStem 身宫干
   * @param shenGongBranch 身宫支
   * @param branch 地支
   * @returns 是否为身宫空亡
   */
  static isShenGongKongWang(shenGongStem: string, shenGongBranch: string, branch: string): boolean {
    // 身宫空亡：根据身宫干支查旬空
    const shenGongGanZhi = shenGongStem + shenGongBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[shenGongGanZhi]?.includes(branch) || false;
  }

  /**
   * 判断胎元空亡
   * @param taiYuanStem 胎元干
   * @param taiYuanBranch 胎元支
   * @param branch 地支
   * @returns 是否为胎元空亡
   */
  static isTaiYuanKongWang(taiYuanStem: string, taiYuanBranch: string, branch: string): boolean {
    // 胎元空亡：根据胎元干支查旬空
    const taiYuanGanZhi = taiYuanStem + taiYuanBranch;

    // 完整的旬空映射表
    const xunMap: {[key: string]: string[]} = {
      '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
      '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
      '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
      '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
      '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
      '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
      '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
      '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
      '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
      '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
      '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
      '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
    };

    return xunMap[taiYuanGanZhi]?.includes(branch) || false;
  }

  /**
   * 综合空亡判断 - 检查所有柱的空亡情况
   * @param params 包含所有柱信息的参数对象
   * @param branch 要检查的地支
   * @returns 空亡详情对象
   */
  static getKongWangDetails(params: {
    yearStem: string, yearBranch: string,
    monthStem: string, monthBranch: string,
    dayStem: string, dayBranch: string,
    hourStem: string, hourBranch: string,
    mingGongStem?: string, mingGongBranch?: string,
    shenGongStem?: string, shenGongBranch?: string,
    taiYuanStem?: string, taiYuanBranch?: string
  }, branch: string): {
    hasKongWang: boolean,
    details: {
      年空: boolean,
      月空: boolean,
      日空: boolean,
      时空: boolean,
      命宫空?: boolean,
      身宫空?: boolean,
      胎元空?: boolean
    }
  } {
    const details = {
      年空: ShenShaAlgorithms.isNianKongWang(params.yearStem, params.yearBranch, branch),
      月空: ShenShaAlgorithms.isYueKongWang(params.monthStem, params.monthBranch, branch),
      日空: ShenShaAlgorithms.isRiKongWang(params.dayStem, params.dayBranch, branch),
      时空: ShenShaAlgorithms.isShiKongWang(params.hourStem, params.hourBranch, branch)
    };

    // 可选的命宫、身宫、胎元空亡检查
    if (params.mingGongStem && params.mingGongBranch) {
      details['命宫空'] = ShenShaAlgorithms.isMingGongKongWang(params.mingGongStem, params.mingGongBranch, branch);
    }

    if (params.shenGongStem && params.shenGongBranch) {
      details['身宫空'] = ShenShaAlgorithms.isShenGongKongWang(params.shenGongStem, params.shenGongBranch, branch);
    }

    if (params.taiYuanStem && params.taiYuanBranch) {
      details['胎元空'] = ShenShaAlgorithms.isTaiYuanKongWang(params.taiYuanStem, params.taiYuanBranch, branch);
    }

    const hasKongWang = Object.values(details).some(value => value === true);

    return {
      hasKongWang,
      details
    };
  }

  /**
   * 判断太极贵人
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为太极贵人
   */
  static isTaiJiGuiRen(dayStem: string, branch: string): boolean {
    // 太极贵人的计算规则：
    // 甲乙日干见子午，丙丁日干见酉卯，戊己日干见辰戌丑未，庚辛日干见寅亥，壬癸日干见巳申
    const map: {[key: string]: string[]} = {
      '甲': ['子', '午'], '乙': ['子', '午'],
      '丙': ['酉', '卯'], '丁': ['酉', '卯'],
      '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
      '庚': ['寅', '亥'], '辛': ['寅', '亥'],
      '壬': ['巳', '申'], '癸': ['巳', '申']
    };
    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断金舆
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为金舆
   */
  static isJinYu(dayStem: string, branch: string): boolean {
    // 金舆的计算规则：
    // 甲日干金舆在辰，乙日干金舆在巳，丙戊日干金舆在未，丁己日干金舆在申，
    // 庚日干金舆在戌，辛日干金舆在亥，壬日干金舆在丑，癸日干金舆在寅
    const map: {[key: string]: string} = {
      '甲': '辰', '乙': '巳', '丙': '未', '戊': '未',
      '丁': '申', '己': '申', '庚': '戌', '辛': '亥',
      '壬': '丑', '癸': '寅'
    };
    return map[dayStem] === branch;
  }

  /**
   * 判断国印贵人
   * @param stem 天干（年干或日干）
   * @param branch 地支
   * @returns 是否为国印贵人
   */
  static isGuoYinGuiRen(stem: string, branch: string): boolean {
    // 国印贵人的计算规则：
    // 甲见戌，乙见亥，丙见丑，丁见寅，戊见丑，己见寅，庚见辰，辛见巳，壬见未，癸见申
    const map: {[key: string]: string} = {
      '甲': '戌', '乙': '亥', '丙': '丑', '丁': '寅',
      '戊': '丑', '己': '寅', '庚': '辰', '辛': '巳',
      '壬': '未', '癸': '申'
    };
    return map[stem] === branch;
  }

  /**
   * 判断三奇贵人
   * @param stems 天干数组（连续的三个天干）
   * @returns 是否为三奇贵人
   */
  static isSanQiGuiRen(stems: string[]): boolean {
    if (stems.length < 3) return false;

    // 三奇贵人的计算规则：
    // 天上三奇乙丙丁；地下三奇甲戊庚；人中三奇壬癸辛
    const tianShangSanQi = ['乙', '丙', '丁'];
    const diXiaSanQi = ['甲', '戊', '庚'];
    const renZhongSanQi = ['壬', '癸', '辛'];

    // 检查是否包含任一组三奇
    for (let i = 0; i <= stems.length - 3; i++) {
      const threeStem = stems.slice(i, i + 3);
      if (ShenShaAlgorithms.arrayEquals(threeStem, tianShangSanQi) ||
          ShenShaAlgorithms.arrayEquals(threeStem, diXiaSanQi) ||
          ShenShaAlgorithms.arrayEquals(threeStem, renZhongSanQi)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断福星贵人
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为福星贵人
   */
  static isFuXingGuiRen(dayStem: string, branch: string): boolean {
    // 福星贵人的计算规则：
    // 甲丙两干见寅或子，乙癸两干见卯或丑，戊干见申，己干见未，丁干见亥，庚干见午，辛干见巳，壬干见辰
    const map: {[key: string]: string[]} = {
      '甲': ['寅', '子'], '丙': ['寅', '子'],
      '乙': ['卯', '丑'], '癸': ['卯', '丑'],
      '戊': ['申'], '己': ['未'], '丁': ['亥'],
      '庚': ['午'], '辛': ['巳'], '壬': ['辰']
    };
    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断文曲
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为文曲
   */
  static isWenQu(yearBranch: string, branch: string): boolean {
    // 文曲的计算规则：
    // 寅午戌年支见丑，申子辰年支见未，亥卯未年支见辰，巳酉丑年支见戌
    const map: {[key: string]: string} = {
      '寅': '丑', '午': '丑', '戌': '丑',
      '申': '未', '子': '未', '辰': '未',
      '亥': '辰', '卯': '辰', '未': '辰',
      '巳': '戌', '酉': '戌', '丑': '戌'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断天喜
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为天喜
   */
  static isTianXi(yearBranch: string, branch: string): boolean {
    // 天喜的计算规则：
    // 子年支天喜在酉，丑年支天喜在申，寅年支天喜在未，卯年支天喜在午，
    // 辰年支天喜在巳，巳年支天喜在辰，午年支天喜在卯，未年支天喜在寅，
    // 申年支天喜在丑，酉年支天喜在子，戌年支天喜在亥，亥年支天喜在戌
    const map: {[key: string]: string} = {
      '子': '酉', '丑': '申', '寅': '未', '卯': '午',
      '辰': '巳', '巳': '辰', '午': '卯', '未': '寅',
      '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断红鸾
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为红鸾
   */
  static isHongLuan(yearBranch: string, branch: string): boolean {
    // 红鸾的计算规则：与天喜相同
    // 子年支红鸾在酉，丑年支红鸾在申，寅年支红鸾在未，卯年支红鸾在午，
    // 辰年支红鸾在巳，巳年支红鸾在辰，午年支红鸾在卯，未年支红鸾在寅，
    // 申年支红鸾在丑，酉年支红鸾在子，戌年支红鸾在亥，亥年支红鸾在戌
    return ShenShaAlgorithms.isTianXi(yearBranch, branch);
  }

  /**
   * 判断红艳
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为红艳
   */
  static isHongYan(yearBranch: string, branch: string): boolean {
    // 红艳的计算规则：与天喜、红鸾相同
    return ShenShaAlgorithms.isTianXi(yearBranch, branch);
  }

  /**
   * 判断天姚
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为天姚
   */
  static isTianYao(yearBranch: string, branch: string): boolean {
    // 天姚的计算规则：
    // 子年支天姚在巳，丑年支天姚在午，寅年支天姚在未，卯年支天姚在申，
    // 辰年支天姚在酉，巳年支天姚在戌，午年支天姚在亥，未年支天姚在子，
    // 申年支天姚在丑，酉年支天姚在寅，戌年支天姚在卯，亥年支天姚在辰
    const map: {[key: string]: string} = {
      '子': '巳', '丑': '午', '寅': '未', '卯': '申',
      '辰': '酉', '巳': '戌', '午': '亥', '未': '子',
      '申': '丑', '酉': '寅', '戌': '卯', '亥': '辰'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断学堂词馆
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为学堂词馆
   */
  static isXueTangCiGuan(dayStem: string, branch: string): boolean {
    // 学堂词馆的计算规则：
    // 甲见卯乙见辰，丙戊见巳丁己见午，庚见申辛见酉，壬见亥癸见子
    const map: {[key: string]: string} = {
      '甲': '卯', '乙': '辰', '丙': '巳', '戊': '巳',
      '丁': '午', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    return map[dayStem] === branch;
  }

  /**
   * 判断德秀贵人
   * @param monthBranch 月支
   * @param stem 天干
   * @returns 是否为德秀贵人
   */
  static isDeXiuGuiRen(monthBranch: string, stem: string): boolean {
    // 德秀贵人的计算规则：
    // 寅午戌月丙丁为德戊癸为秀，申子辰月壬癸戊己为德丙辛甲己为秀，
    // 巳酉丑月庚辛为德乙庚为秀，亥卯未月甲乙为德丁壬为秀
    const deMap: {[key: string]: string[]} = {
      '寅': ['丙', '丁'], '午': ['丙', '丁'], '戌': ['丙', '丁'],
      '申': ['壬', '癸', '戊', '己'], '子': ['壬', '癸', '戊', '己'], '辰': ['壬', '癸', '戊', '己'],
      '巳': ['庚', '辛'], '酉': ['庚', '辛'], '丑': ['庚', '辛'],
      '亥': ['甲', '乙'], '卯': ['甲', '乙'], '未': ['甲', '乙']
    };

    const xiuMap: {[key: string]: string[]} = {
      '寅': ['戊', '癸'], '午': ['戊', '癸'], '戌': ['戊', '癸'],
      '申': ['丙', '辛', '甲', '己'], '子': ['丙', '辛', '甲', '己'], '辰': ['丙', '辛', '甲', '己'],
      '巳': ['乙', '庚'], '酉': ['乙', '庚'], '丑': ['乙', '庚'],
      '亥': ['丁', '壬'], '卯': ['丁', '壬'], '未': ['丁', '壬']
    };

    return (deMap[monthBranch]?.includes(stem) || xiuMap[monthBranch]?.includes(stem)) || false;
  }

  /**
   * 判断十恶大败
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为十恶大败
   */
  static isShiEDaBai(dayStem: string, dayBranch: string): boolean {
    // 十恶大败的计算规则：特定的日柱组合
    // 甲辰、乙巳、丙申、丁亥、戊戌、己丑、庚辰、辛巳、壬申、癸亥日柱
    const shiEDaBaiList = [
      '甲辰', '乙巳', '丙申', '丁亥', '戊戌',
      '己丑', '庚辰', '辛巳', '壬申', '癸亥'
    ];
    return shiEDaBaiList.includes(dayStem + dayBranch);
  }

  /**
   * 判断孤鸾煞
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为孤鸾煞
   */
  static isGuLuanSha(dayStem: string, dayBranch: string): boolean {
    // 孤鸾煞的计算规则：特定的日柱组合
    // 乙巳，丁巳，辛亥，戊申，壬寅，戊午，壬子，丙午日柱为孤鸾煞
    const guLuanShaList = [
      '乙巳', '丁巳', '辛亥', '戊申',
      '壬寅', '戊午', '壬子', '丙午'
    ];
    return guLuanShaList.includes(dayStem + dayBranch);
  }

  /**
   * 判断四废
   * @param season 季节（春夏秋冬）
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为四废
   */
  static isSiFei(season: string, dayStem: string, dayBranch: string): boolean {
    // 四废的计算规则：
    // 春庚申，辛酉，夏壬子，癸亥，秋甲寅，乙卯，冬丙午，丁巳
    const siFeiMap: {[key: string]: string[]} = {
      '春': ['庚申', '辛酉'],
      '夏': ['壬子', '癸亥'],
      '秋': ['甲寅', '乙卯'],
      '冬': ['丙午', '丁巳']
    };
    return siFeiMap[season]?.includes(dayStem + dayBranch) || false;
  }

  /**
   * 判断天罗地网
   * @param nayin 纳音五行
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为天罗地网
   */
  static isTianLuoDiWang(nayin: string, dayStem: string, dayBranch: string): boolean {
    // 天罗地网的计算规则：
    // 戌亥为天罗，辰巳为地网
    // 凡纳音火命，见戌亥日为天罗；纳音水土命，见辰巳日为地网，纳音金木二命无之
    const dayPillar = dayStem + dayBranch;

    if (nayin === '火') {
      return dayPillar.includes('戌') || dayPillar.includes('亥');
    } else if (nayin === '水' || nayin === '土') {
      return dayPillar.includes('辰') || dayPillar.includes('巳');
    }
    return false;
  }

  /**
   * 判断亡神
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为亡神
   */
  static isWangShen(yearBranch: string, branch: string): boolean {
    // 亡神的计算规则：
    // 申子辰见亥，寅午戌见巳，巳酉丑见申，亥卯未见寅，即为亡神
    const map: {[key: string]: string} = {
      '申': '亥', '子': '亥', '辰': '亥',
      '寅': '巳', '午': '巳', '戌': '巳',
      '巳': '申', '酉': '申', '丑': '申',
      '亥': '寅', '卯': '寅', '未': '寅'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断披麻
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为披麻
   */
  static isPiMa(yearBranch: string, branch: string): boolean {
    // 披麻的计算规则：年日支后三位为披麻
    // 子见酉，丑见戌，寅见亥，卯见子，辰见丑，巳见寅，午见卯，未见辰，申见巳，酉见午，戌见未，亥见申
    const map: {[key: string]: string} = {
      '子': '酉', '丑': '戌', '寅': '亥', '卯': '子',
      '辰': '丑', '巳': '寅', '午': '卯', '未': '辰',
      '申': '巳', '酉': '午', '戌': '未', '亥': '申'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断吊客
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为吊客
   */
  static isDiaoKe(yearBranch: string, branch: string): boolean {
    // 吊客的计算规则：年支后两位为吊客
    // 子见戌，丑见亥，寅见子，卯见丑，辰见寅，巳见卯，午见辰，未见巳，申见午，酉见未，戌见申，亥见酉
    const map: {[key: string]: string} = {
      '子': '戌', '丑': '亥', '寅': '子', '卯': '丑',
      '辰': '寅', '巳': '卯', '午': '辰', '未': '巳',
      '申': '午', '酉': '未', '戌': '申', '亥': '酉'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断丧门
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为丧门
   */
  static isSangMen(yearBranch: string, branch: string): boolean {
    // 丧门的计算规则：年支前两位为丧门
    // 子见寅，丑见卯，寅见辰，卯见巳，辰见午，巳见未，午见申，未见酉，申见戌，酉见亥，戌见子，亥见丑
    const map: {[key: string]: string} = {
      '子': '寅', '丑': '卯', '寅': '辰', '卯': '巳',
      '辰': '午', '巳': '未', '午': '申', '未': '酉',
      '申': '戌', '酉': '亥', '戌': '子', '亥': '丑'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断元辰（大耗）
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为元辰
   */
  static isYuanChen(yearBranch: string, branch: string): boolean {
    // 元辰（大耗）的计算规则：
    // 子年大耗在未，丑年大耗在申，寅年大耗在酉，卯年大耗在戌，辰年大耗在亥，巳年大耗在子，
    // 午年大耗在丑，未年大耗在寅，申年大耗在卯，酉年大耗在辰，戌年大耗在巳，亥年大耗在午
    const map: {[key: string]: string} = {
      '子': '未', '丑': '申', '寅': '酉', '卯': '戌',
      '辰': '亥', '巳': '子', '午': '丑', '未': '寅',
      '申': '卯', '酉': '辰', '戌': '巳', '亥': '午'
    };
    return map[yearBranch] === branch;
  }



  /**
   * 判断天空
   * @param branch 地支
   * @returns 是否为天空
   */
  static isTianKong(branch: string): boolean {
    return branch === '戌';
  }

  /**
   * 判断地劫
   * @param branch 地支
   * @returns 是否为地劫
   */
  static isDiJie(branch: string): boolean {
    return branch === '辰';
  }

  /**
   * 判断天哭
   * @param branch 地支
   * @returns 是否为天哭
   */
  static isTianKu(branch: string): boolean {
    return branch === '未';
  }

  /**
   * 判断天虚
   * @param branch 地支
   * @returns 是否为天虚
   */
  static isTianXu(branch: string): boolean {
    return branch === '丑';
  }

  /**
   * 判断咸池
   * @param branch 地支
   * @returns 是否为咸池
   */
  static isXianChi(branch: string): boolean {
    return ['丑', '未', '辰', '戌'].includes(branch);
  }

  /**
   * 判断解神
   * @param monthBranch 月支
   * @param branch 地支
   * @returns 是否为解神
   */
  static isJieShen(monthBranch: string, branch: string): boolean {
    // 解神的计算规则：
    // 正月见酉，二月见戌，三月见亥，四月见子，五月见丑，六月见寅，
    // 七月见卯，八月见辰，九月见巳，十月见午，十一月见未，十二月见申
    const map: {[key: string]: string} = {
      '寅': '酉', '卯': '戌', '辰': '亥', '巳': '子',
      '午': '丑', '未': '寅', '申': '卯', '酉': '辰',
      '戌': '巳', '亥': '午', '子': '未', '丑': '申'
    };
    return map[monthBranch] === branch;
  }

  /**
   * 判断金神
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为金神
   */
  static isJinShen(dayStem: string, dayBranch: string): boolean {
    // 金神的计算规则：乙丑、己巳、癸酉三日三时
    const jinShenList = ['乙丑', '己巳', '癸酉'];
    return jinShenList.includes(dayStem + dayBranch);
  }

  /**
   * 判断日德
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 是否为日德
   */
  static isRiDe(dayStem: string, dayBranch: string): boolean {
    // 日德的计算规则：甲寅、戊辰、丙辰、庚辰、壬戌
    const riDeList = ['甲寅', '戊辰', '丙辰', '庚辰', '壬戌'];
    return riDeList.includes(dayStem + dayBranch);
  }

  /**
   * 判断五鬼
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为五鬼
   */
  static isWuGui(yearBranch: string, branch: string): boolean {
    // 五鬼的计算规则：申子辰见卯，寅午戌见酉，巳酉丑见子，亥卯未见午
    const map: {[key: string]: string} = {
      '申': '卯', '子': '卯', '辰': '卯',
      '寅': '酉', '午': '酉', '戌': '酉',
      '巳': '子', '酉': '子', '丑': '子',
      '亥': '午', '卯': '午', '未': '午'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断白虎
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为白虎
   */
  static isBaiHu(yearBranch: string, branch: string): boolean {
    // 白虎的计算规则：年支后九位
    const map: {[key: string]: string} = {
      '子': '申', '丑': '酉', '寅': '戌', '卯': '亥',
      '辰': '子', '巳': '丑', '午': '寅', '未': '卯',
      '申': '辰', '酉': '巳', '戌': '午', '亥': '未'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断天狗
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为天狗
   */
  static isTianGou(yearBranch: string, branch: string): boolean {
    // 天狗的计算规则：年支后十位
    const map: {[key: string]: string} = {
      '子': '戌', '丑': '亥', '寅': '子', '卯': '丑',
      '辰': '寅', '巳': '卯', '午': '辰', '未': '巳',
      '申': '午', '酉': '未', '戌': '申', '亥': '酉'
    };
    return map[yearBranch] === branch;
  }

  /**
   * 判断三台
   * @param yearStem 年干
   * @param branch 地支
   * @returns 是否为三台
   */
  static isSanTai(yearStem: string, branch: string): boolean {
    // 三台的计算规则
    const map: {[key: string]: string} = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    return map[yearStem] === branch;
  }

  /**
   * 判断八座
   * @param yearStem 年干
   * @param branch 地支
   * @returns 是否为八座
   */
  static isBaZuo(yearStem: string, branch: string): boolean {
    // 八座的计算规则
    const map: {[key: string]: string} = {
      '甲': '丑', '乙': '寅', '丙': '辰', '丁': '巳', '戊': '辰',
      '己': '巳', '庚': '未', '辛': '申', '壬': '戌', '癸': '亥'
    };
    return map[yearStem] === branch;
  }

  /**
   * 判断三刑
   * @param branch1 地支1
   * @param branch2 地支2
   * @returns 是否为三刑
   */
  static isSanXing(branch1: string, branch2: string): boolean {
    // 三刑的计算规则
    const xingGroups = [
      ['寅', '巳', '申'], // 寅巳申三刑
      ['丑', '戌', '未'], // 丑戌未三刑
      ['子', '卯'],       // 子卯相刑
      ['辰', '午', '酉', '亥'] // 辰午酉亥自刑
    ];

    for (const group of xingGroups) {
      if (group.includes(branch1) && group.includes(branch2) && branch1 !== branch2) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断六冲
   * @param branch1 地支1
   * @param branch2 地支2
   * @returns 是否为六冲
   */
  static isLiuChong(branch1: string, branch2: string): boolean {
    // 六冲的计算规则
    const chongPairs: {[key: string]: string} = {
      '子': '午', '午': '子',
      '丑': '未', '未': '丑',
      '寅': '申', '申': '寅',
      '卯': '酉', '酉': '卯',
      '辰': '戌', '戌': '辰',
      '巳': '亥', '亥': '巳'
    };
    return chongPairs[branch1] === branch2;
  }

  /**
   * 判断六合
   * @param branch1 地支1
   * @param branch2 地支2
   * @returns 是否为六合
   */
  static isLiuHe(branch1: string, branch2: string): boolean {
    // 六合的计算规则
    const hePairs: {[key: string]: string} = {
      '子': '丑', '丑': '子',
      '寅': '亥', '亥': '寅',
      '卯': '戌', '戌': '卯',
      '辰': '酉', '酉': '辰',
      '巳': '申', '申': '巳',
      '午': '未', '未': '午'
    };
    return hePairs[branch1] === branch2;
  }

  /**
   * 判断三合
   * @param branches 地支数组
   * @returns 是否为三合
   */
  static isSanHe(branches: string[]): boolean {
    // 三合的计算规则
    const heGroups = [
      ['申', '子', '辰'], // 申子辰三合水局
      ['寅', '午', '戌'], // 寅午戌三合火局
      ['巳', '酉', '丑'], // 巳酉丑三合金局
      ['亥', '卯', '未']  // 亥卯未三合木局
    ];

    for (const group of heGroups) {
      if (group.every(branch => branches.includes(branch))) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断天赦
   * @param season 季节
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天赦
   */
  static isTianShe(season: string, stem: string, branch: string): boolean {
    // 天赦的计算规则：春戊寅，夏甲午，秋戊申，冬甲子
    const map: {[key: string]: string} = {
      '春': '戊寅',
      '夏': '甲午',
      '秋': '戊申',
      '冬': '甲子'
    };
    return map[season] === stem + branch;
  }

  /**
   * 判断天恩
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天恩
   */
  static isTianEn(stem: string, branch: string): boolean {
    // 天恩的计算规则
    const map: {[key: string]: string} = {
      '甲': '丑', '己': '丑',
      '乙': '寅', '庚': '寅',
      '丙': '巳', '辛': '巳',
      '丁': '申', '壬': '申',
      '戊': '亥', '癸': '亥'
    };
    return map[stem] === branch;
  }

  /**
   * 判断天福
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天福
   */
  static isTianFu(stem: string, branch: string): boolean {
    // 天福的计算规则
    const map: {[key: string]: string} = {
      '甲': '亥', '乙': '子', '丙': '寅', '丁': '卯', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    return map[stem] === branch;
  }

  /**
   * 判断太岁
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为太岁
   */
  static isTaiSui(yearBranch: string, branch: string): boolean {
    // 太岁的计算规则：与年支相同即为太岁
    return yearBranch === branch;
  }

  /**
   * 判断岁破
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为岁破
   */
  static isSuiPo(yearBranch: string, branch: string): boolean {
    // 岁破的计算规则：与年支相冲即为岁破
    const chongPairs: {[key: string]: string} = {
      '子': '午', '午': '子',
      '丑': '未', '未': '丑',
      '寅': '申', '申': '寅',
      '卯': '酉', '酉': '卯',
      '辰': '戌', '戌': '辰',
      '巳': '亥', '亥': '巳'
    };
    return chongPairs[yearBranch] === branch;
  }

  /**
   * 判断天德合
   * @param monthBranch 月支
   * @param stem 天干
   * @returns 是否为天德合
   */
  static isTianDeHe(monthBranch: string, stem: string): boolean {
    // 天德合的计算规则：天德的合化
    // 先找到天德，再找其合化
    const monthToNumber: {[key: string]: number} = {
      '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
      '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
    };

    const tianDeMap: {[key: number]: string} = {
      1: '丁', 2: '申', 3: '壬', 4: '辛', 5: '亥', 6: '甲',
      7: '癸', 8: '寅', 9: '丙', 10: '乙', 11: '巳', 12: '庚'
    };

    // 天干合化：甲己合，乙庚合，丙辛合，丁壬合，戊癸合
    const heHuaMap: {[key: string]: string} = {
      '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛',
      '辛': '丙', '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊'
    };

    const monthNumber = monthToNumber[monthBranch];
    if (!monthNumber) return false;

    const tianDe = tianDeMap[monthNumber];
    const tianDeHe = heHuaMap[tianDe];

    return tianDeHe === stem;
  }

  /**
   * 判断月德合
   * @param monthBranch 月支
   * @param stem 天干
   * @returns 是否为月德合
   */
  static isYueDeHe(monthBranch: string, stem: string): boolean {
    // 月德合的计算规则：月德的合化
    const monthToNumber: {[key: string]: number} = {
      '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
      '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
    };

    const yueDeMap: {[key: number]: string} = {
      1: '丙', 2: '甲', 3: '丁', 4: '辛', 5: '己', 6: '丁',
      7: '壬', 8: '辛', 9: '戊', 10: '乙', 11: '己', 12: '丁'
    };

    // 天干合化：甲己合，乙庚合，丙辛合，丁壬合，戊癸合
    const heHuaMap: {[key: string]: string} = {
      '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛',
      '辛': '丙', '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊'
    };

    const monthNumber = monthToNumber[monthBranch];
    if (!monthNumber) return false;

    const yueDe = yueDeMap[monthNumber];
    const yueDeHe = heHuaMap[yueDe];

    return yueDeHe === stem;
  }

  /**
   * 判断禄马同乡
   * @param stem 天干
   * @param branches 四柱地支数组
   * @returns 是否为禄马同乡
   */
  static isLuMaTongXiang(stem: string, branches: string[]): boolean {
    // 禄马同乡：禄神和驿马在同一地支
    // 先找到禄神
    const luShenMap: {[key: string]: string} = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };

    const luShen = luShenMap[stem];
    if (!luShen) return false;

    // 检查是否有驿马在同一地支
    // 驿马规则：寅午戌见申，申子辰见寅，巳酉丑见亥，亥卯未见巳
    const yiMaMap: {[key: string]: string} = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };

    // 检查四柱中是否有年支能产生驿马，且驿马位置与禄神相同
    for (const branch of branches) {
      const yiMa = yiMaMap[branch];
      if (yiMa === luShen && branches.includes(luShen)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 判断福德秀气
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param monthBranch 月支
   * @returns 是否为福德秀气
   */
  static isFuDeXiuQi(dayStem: string, dayBranch: string, monthBranch: string): boolean {
    // 福德秀气：日干得月令生扶，且坐下有德神
    // 先检查日干是否得月令生扶
    const wuXingMap: {[key: string]: string} = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };

    const branchWuXingMap: {[key: string]: string} = {
      '寅': '木', '卯': '木', '巳': '火', '午': '火', '辰': '土',
      '戌': '土', '丑': '土', '未': '土', '申': '金', '酉': '金',
      '亥': '水', '子': '水'
    };

    const dayWuXing = wuXingMap[dayStem];
    const monthWuXing = branchWuXingMap[monthBranch];

    // 检查是否得月令生扶（同类或生我）
    const shengKeMap: {[key: string]: string[]} = {
      '木': ['水', '木'], // 水生木，木助木
      '火': ['木', '火'], // 木生火，火助火
      '土': ['火', '土'], // 火生土，土助土
      '金': ['土', '金'], // 土生金，金助金
      '水': ['金', '水']  // 金生水，水助水
    };

    const isSupported = shengKeMap[dayWuXing]?.includes(monthWuXing);
    if (!isSupported) return false;

    // 检查日支是否有德神（简化为检查是否为贵人地支）
    const guiRenBranches = ['丑', '未', '子', '申', '亥', '酉', '巳', '卯', '午', '寅'];
    const hasDeShen = guiRenBranches.includes(dayBranch);

    return hasDeShen;
  }

  /**
   * 判断学堂
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为学堂
   */
  static isXueTang(dayStem: string, branch: string): boolean {
    // 学堂的计算规则：甲见巳，乙见午，丙见申，丁见酉，戊见申，己见酉，庚见亥，辛见子，壬见寅，癸见卯
    const xueTangMap: {[key: string]: string} = {
      '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
      '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
    };

    return xueTangMap[dayStem] === branch;
  }

  /**
   * 判断词馆
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为词馆
   */
  static isCiGuan(dayStem: string, branch: string): boolean {
    // 词馆的计算规则：甲见午，乙见巳，丙见酉，丁见申，戊见酉，己见申，庚见子，辛见亥，壬见卯，癸见寅
    const ciGuanMap: {[key: string]: string} = {
      '甲': '午', '乙': '巳', '丙': '酉', '丁': '申', '戊': '酉',
      '己': '申', '庚': '子', '辛': '亥', '壬': '卯', '癸': '寅'
    };

    return ciGuanMap[dayStem] === branch;
  }

  /**
   * 判断财富通门户
   * @param dayStem 日干
   * @param branches 四柱地支数组
   * @param stems 四柱天干数组
   * @returns 是否为财富通门户
   */
  static isCaiFuTongMenHu(dayStem: string, branches: string[], stems: string[]): boolean {
    // 财富通门户：财星通根且有门户星相助
    // 1. 先找到财星（日干所克的五行）
    const wuXingMap: {[key: string]: string} = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };

    const keMap: {[key: string]: string} = {
      '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
    };

    const dayWuXing = wuXingMap[dayStem];
    const caiXingWuXing = keMap[dayWuXing]; // 财星五行

    // 2. 找到财星对应的天干
    const caiXingGans: string[] = [];
    Object.entries(wuXingMap).forEach(([gan, wuxing]) => {
      if (wuxing === caiXingWuXing) {
        caiXingGans.push(gan);
      }
    });

    // 3. 检查四柱中是否有财星
    const hasCaiXing = stems.some(stem => caiXingGans.includes(stem));
    if (!hasCaiXing) return false;

    // 4. 检查财星是否通根（在地支中有根）
    const branchWuXingMap: {[key: string]: string} = {
      '寅': '木', '卯': '木', '巳': '火', '午': '火', '辰': '土',
      '戌': '土', '丑': '土', '未': '土', '申': '金', '酉': '金',
      '亥': '水', '子': '水'
    };

    const hasCaiXingRoot = branches.some(branch => branchWuXingMap[branch] === caiXingWuXing);
    if (!hasCaiXingRoot) return false;

    // 5. 检查是否有门户星（驿马、天乙贵人、禄神等）
    // 驿马
    const yiMaMap: {[key: string]: string} = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };

    const hasYiMa = branches.some(yearBranch => {
      const yiMa = yiMaMap[yearBranch];
      return yiMa && branches.includes(yiMa);
    });

    // 天乙贵人
    const tianYiMap: {[key: string]: string[]} = {
      '甲': ['丑', '未'], '乙': ['子', '申'], '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '戊': ['丑', '未'], '己': ['子', '申'], '庚': ['丑', '未'], '辛': ['午', '寅'],
      '壬': ['卯', '巳'], '癸': ['卯', '巳']
    };

    const hasTianYi = stems.some(stem => {
      const tianYiBranches = tianYiMap[stem];
      return tianYiBranches && tianYiBranches.some(branch => branches.includes(branch));
    });

    // 禄神
    const luShenMap: {[key: string]: string} = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };

    const hasLuShen = stems.some(stem => {
      const luShen = luShenMap[stem];
      return luShen && branches.includes(luShen);
    });

    // 有门户星之一即可
    const hasMenHu = hasYiMa || hasTianYi || hasLuShen;

    return hasMenHu;
  }

  /**
   * 辅助方法：判断数组是否相等
   */
  private static arrayEquals(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  /**
   * 获取所有基础神煞算法列表
   * @returns 算法方法映射
   */
  static getAllAlgorithms(): {[key: string]: Function} {
    return {
      '天乙贵人': ShenShaAlgorithms.isTianYiGuiRen,
      '禄神': ShenShaAlgorithms.isLuShen,
      '羊刃': ShenShaAlgorithms.isYangRen,
      '桃花': ShenShaAlgorithms.isTaoHua,
      '华盖': ShenShaAlgorithms.isHuaGai,
      '文昌': ShenShaAlgorithms.isWenChang,
      '将星': ShenShaAlgorithms.isJiangXing,
      '驿马': ShenShaAlgorithms.isYiMa,
      '天德': ShenShaAlgorithms.isTianDe,
      '月德': ShenShaAlgorithms.isYueDe,
      '天医': ShenShaAlgorithms.isTianYi,
      '劫煞': ShenShaAlgorithms.isJieSha,
      '灾煞': ShenShaAlgorithms.isZaiSha,
      '天刑': ShenShaAlgorithms.isTianXing,
      '孤辰': ShenShaAlgorithms.isGuChen,
      '寡宿': ShenShaAlgorithms.isGuaSu,
      '魁罡': ShenShaAlgorithms.isKuiGang,
      '阴差阳错': ShenShaAlgorithms.isYinChaYangCuo,
      // '空亡': ShenShaAlgorithms.isKongWang, // 备注：使用更细致的分类空亡
      '年空亡': ShenShaAlgorithms.isNianKongWang,
      '月空亡': ShenShaAlgorithms.isYueKongWang,
      '日空亡': ShenShaAlgorithms.isRiKongWang,
      '时空亡': ShenShaAlgorithms.isShiKongWang,
      '命宫空亡': ShenShaAlgorithms.isMingGongKongWang,
      '身宫空亡': ShenShaAlgorithms.isShenGongKongWang,
      '胎元空亡': ShenShaAlgorithms.isTaiYuanKongWang,
      '太极贵人': ShenShaAlgorithms.isTaiJiGuiRen,
      '金舆': ShenShaAlgorithms.isJinYu,
      '国印贵人': ShenShaAlgorithms.isGuoYinGuiRen,
      '三奇贵人': ShenShaAlgorithms.isSanQiGuiRen,
      '福星贵人': ShenShaAlgorithms.isFuXingGuiRen,
      '文曲': ShenShaAlgorithms.isWenQu,
      '天喜': ShenShaAlgorithms.isTianXi,
      '红鸾': ShenShaAlgorithms.isHongLuan,
      '红艳': ShenShaAlgorithms.isHongYan,
      '天姚': ShenShaAlgorithms.isTianYao,
      '学堂词馆': ShenShaAlgorithms.isXueTangCiGuan,
      '德秀贵人': ShenShaAlgorithms.isDeXiuGuiRen,
      '十恶大败': ShenShaAlgorithms.isShiEDaBai,
      '孤鸾煞': ShenShaAlgorithms.isGuLuanSha,
      '四废': ShenShaAlgorithms.isSiFei,
      '天罗地网': ShenShaAlgorithms.isTianLuoDiWang,
      '亡神': ShenShaAlgorithms.isWangShen,
      '披麻': ShenShaAlgorithms.isPiMa,
      '吊客': ShenShaAlgorithms.isDiaoKe,
      '丧门': ShenShaAlgorithms.isSangMen,
      '元辰': ShenShaAlgorithms.isYuanChen,
      '天德合': ShenShaAlgorithms.isTianDeHe,
      '天空': ShenShaAlgorithms.isTianKong,
      '地劫': ShenShaAlgorithms.isDiJie,
      '天哭': ShenShaAlgorithms.isTianKu,
      '天虚': ShenShaAlgorithms.isTianXu,
      '咸池': ShenShaAlgorithms.isXianChi,
      '解神': ShenShaAlgorithms.isJieShen,
      '金神': ShenShaAlgorithms.isJinShen,
      '日德': ShenShaAlgorithms.isRiDe,
      '五鬼': ShenShaAlgorithms.isWuGui,
      '白虎': ShenShaAlgorithms.isBaiHu,
      '天狗': ShenShaAlgorithms.isTianGou,
      '三台': ShenShaAlgorithms.isSanTai,
      '八座': ShenShaAlgorithms.isBaZuo,
      '天赦': ShenShaAlgorithms.isTianShe,
      '天恩': ShenShaAlgorithms.isTianEn,
      '天福': ShenShaAlgorithms.isTianFu,
      '太岁': ShenShaAlgorithms.isTaiSui,
      '岁破': ShenShaAlgorithms.isSuiPo,
      '月德合': ShenShaAlgorithms.isYueDeHe,
      '禄马同乡': ShenShaAlgorithms.isLuMaTongXiang,
      '福德秀气': ShenShaAlgorithms.isFuDeXiuQi,
      '学堂': ShenShaAlgorithms.isXueTang,
      '词馆': ShenShaAlgorithms.isCiGuan,
      '财富通门户': ShenShaAlgorithms.isCaiFuTongMenHu
    };
  }
}
