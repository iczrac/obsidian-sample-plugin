/**
 * 神煞基础算法库
 * 提供所有神煞的基础判断方法，纯算法实现，无业务逻辑
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
   * @param branch 地支
   * @returns 是否为桃花
   */
  static isTaoHua(branch: string): boolean {
    return ['卯', '酉', '子', '午'].includes(branch);
  }

  /**
   * 判断华盖
   * @param branch 地支
   * @returns 是否为华盖
   */
  static isHuaGai(branch: string): boolean {
    return ['戌', '辰', '未', '丑'].includes(branch);
  }

  /**
   * 判断文昌
   * @param branch 地支
   * @returns 是否为文昌
   */
  static isWenChang(branch: string): boolean {
    return ['巳', '申', '亥', '寅'].includes(branch);
  }

  /**
   * 判断将星
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为将星
   */
  static isJiangXing(dayStem: string, branch: string): boolean {
    const map: {[key: string]: string[]} = {
      '甲': ['子'], '乙': ['酉'], '丙': ['午'], '丁': ['卯'],
      '戊': ['子'], '己': ['酉'], '庚': ['午'], '辛': ['卯'],
      '壬': ['子'], '癸': ['酉']
    };
    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断驿马
   * @param branch 地支
   * @returns 是否为驿马
   */
  static isYiMa(branch: string): boolean {
    return ['寅', '申', '巳', '亥'].includes(branch);
  }

  /**
   * 判断天德
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德
   */
  static isTianDe(stem: string, branch: string): boolean {
    const stemMap: {[key: string]: string[]} = {
      '甲': ['丁'], '乙': ['申'], '丙': ['壬'], '丁': ['辛'],
      '戊': ['亥'], '己': ['甲'], '庚': ['乙'], '辛': ['戊'],
      '壬': ['丙'], '癸': ['己']
    };
    const branchMap: {[key: string]: string[]} = {
      '子': ['壬'], '丑': ['癸'], '寅': ['甲'], '卯': ['乙'],
      '辰': ['戊'], '巳': ['丙'], '午': ['丁'], '未': ['己'],
      '申': ['庚'], '酉': ['辛'], '戌': ['戊'], '亥': ['壬']
    };
    return stemMap[stem]?.includes(stem) || branchMap[branch]?.includes(stem) || false;
  }

  /**
   * 判断月德
   * @param stem 天干
   * @returns 是否为月德
   */
  static isYueDe(stem: string): boolean {
    const yueDeStems = ['丙', '甲', '庚', '丁', '乙'];
    return yueDeStems.includes(stem);
  }

  /**
   * 判断天医
   * @param branch 地支
   * @returns 是否为天医
   */
  static isTianYi(branch: string): boolean {
    return ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'].includes(branch);
  }

  /**
   * 判断劫煞
   * @param branch 地支
   * @returns 是否为劫煞
   */
  static isJieSha(branch: string): boolean {
    return ['巳', '寅', '亥', '申'].includes(branch);
  }

  /**
   * 判断灾煞
   * @param branch 地支
   * @returns 是否为灾煞
   */
  static isZaiSha(branch: string): boolean {
    return ['午', '卯', '子', '酉'].includes(branch);
  }

  /**
   * 判断天刑
   * @param branch 地支
   * @returns 是否为天刑
   */
  static isTianXing(branch: string): boolean {
    return ['寅', '巳', '申', '亥'].includes(branch);
  }

  /**
   * 判断孤辰
   * @param branch 地支
   * @returns 是否为孤辰
   */
  static isGuChen(branch: string): boolean {
    return ['寅', '巳', '申', '亥'].includes(branch);
  }

  /**
   * 判断寡宿
   * @param branch 地支
   * @returns 是否为寡宿
   */
  static isGuaSu(branch: string): boolean {
    return ['辰', '未', '戌', '丑'].includes(branch);
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
      '天报', '天庆', '天祥', '天佑', '天富', '天爵', '天德合', '月德合'
    ];

    // 凶神列表
    const badShenSha = [
      '天刑', '天哭', '天虚', '咸池', '亡神', '劫煞', '灾煞', '五鬼',
      '天罗', '地网', '地丁', '阴差', '魁罡', '孤辰', '寡宿', '白虎',
      '天狗', '天狱', '天棒', '天姚', '天牢', '天祸', '天煞', '天吏',
      '天奸', '天讼', '羊刃', '金神', '阴差阳错'
    ];

    // 吉凶神列表（根据不同情况可能吉可能凶）
    const mixedShenSha = [
      '将星', '华盖', '桃花', '三台', '八座', '恩光', '天贵', '台辅',
      '封诰', '天使', '天伤', '天空', '截路', '旬空', '三奇', '六仪',
      '三合', '六合', '暗合', '拱合', '三会', '三刑', '六冲', '暗冲',
      '童子煞', '将军箭', '红艳'
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
   * 获取所有基础神煞算法列表
   * @returns 算法方法映射
   */
  static getAllAlgorithms(): {[key: string]: Function} {
    return {
      '天乙贵人': this.isTianYiGuiRen,
      '禄神': this.isLuShen,
      '羊刃': this.isYangRen,
      '桃花': this.isTaoHua,
      '华盖': this.isHuaGai,
      '文昌': this.isWenChang,
      '将星': this.isJiangXing,
      '驿马': this.isYiMa,
      '天德': this.isTianDe,
      '月德': this.isYueDe,
      '天医': this.isTianYi,
      '劫煞': this.isJieSha,
      '灾煞': this.isZaiSha,
      '天刑': this.isTianXing,
      '孤辰': this.isGuChen,
      '寡宿': this.isGuaSu,
      '魁罡': this.isKuiGang,
      '阴差阳错': this.isYinChaYangCuo
    };
  }
}
