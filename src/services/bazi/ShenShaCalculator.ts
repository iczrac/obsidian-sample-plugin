/**
 * 基础神煞计算模块
 * 提供所有神煞的基础判断方法，供其他计算器调用
 */
export class ShenShaCalculator {
  /**
   * 判断天乙贵人
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为天乙贵人
   */
  static isTianYiGuiRen(dayStem: string, branch: string): boolean {
    // 天乙贵人的计算规则：
    // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，
    // 六辛逢马虎，此是贵人方
    const map: {[key: string]: string[]} = {
      '甲': ['丑', '未'],
      '戊': ['丑', '未'],
      '庚': ['丑', '未'],
      '乙': ['子', '申'],
      '己': ['子', '申'],
      '丙': ['亥', '酉'],
      '丁': ['亥', '酉'],
      '壬': ['巳', '卯'],
      '癸': ['巳', '卯'],
      '辛': ['午', '寅']
    };

    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断文昌星
   * @param branch 地支
   * @returns 是否为文昌星
   */
  static isWenChang(branch: string): boolean {
    // 文昌星的计算规则：
    // 寅午戌见巳，申子辰见申，
    // 亥卯未见亥，巳酉丑见寅
    return ['巳', '申', '亥', '寅'].includes(branch);
  }

  /**
   * 判断华盖星
   * @param branch 地支
   * @returns 是否为华盖星
   */
  static isHuaGai(branch: string): boolean {
    // 华盖星的计算规则：
    // 寅午戌见戌，申子辰见辰，
    // 亥卯未见未，巳酉丑见丑
    return ['戌', '辰', '未', '丑'].includes(branch);
  }

  /**
   * 判断禄神
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为禄神
   */
  static isLuShen(stem: string, branch: string): boolean {
    const map: {[key: string]: string} = {
      '甲': '寅',
      '乙': '卯',
      '丙': '巳',
      '丁': '午',
      '戊': '巳',
      '己': '午',
      '庚': '申',
      '辛': '酉',
      '壬': '亥',
      '癸': '子'
    };

    return map[stem] === branch;
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
   * 判断孤辰
   * @param branch 地支
   * @returns 是否为孤辰
   */
  static isGuChen(branch: string): boolean {
    return ['辰', '戌', '丑', '未'].includes(branch);
  }

  /**
   * 判断寡宿
   * @param branch 地支
   * @returns 是否为寡宿
   */
  static isGuaSu(branch: string): boolean {
    return ['寅', '申', '巳', '亥'].includes(branch);
  }

  /**
   * 判断驿马
   * @param branch 地支
   * @param yearBranch 年支（可选）
   * @returns 是否为驿马
   */
  static isYiMa(branch: string, yearBranch?: string): boolean {
    // 驿马的计算规则：
    // 寅午戌年马在申，申子辰年马在寅，巳酉丑年马在亥，亥卯未年马在巳
    if (!yearBranch) {
      // 如果没有年支，按通用规则判断
      return ['申', '寅', '亥', '巳'].includes(branch);
    }

    const yiMaMap: {[key: string]: string} = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };

    return yiMaMap[yearBranch] === branch;
  }

  /**
   * 判断将星
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为将星
   */
  static isJiangXing(dayStem: string, branch: string): boolean {
    // 将星与日干的对应关系
    const jiangXingMap: {[key: string]: string[]} = {
      '甲': ['子', '辰', '申'],
      '乙': ['丑', '巳', '酉'],
      '丙': ['寅', '午', '戌'],
      '丁': ['卯', '未', '亥'],
      '戊': ['子', '辰', '申'],
      '己': ['丑', '巳', '酉'],
      '庚': ['寅', '午', '戌'],
      '辛': ['卯', '未', '亥'],
      '壬': ['子', '辰', '申'],
      '癸': ['丑', '巳', '酉']
    };

    return jiangXingMap[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断金神
   * @param branch 地支
   * @returns 是否为金神
   */
  static isJinShen(branch: string): boolean {
    return ['申', '酉', '戌'].includes(branch);
  }

  /**
   * 判断天德
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德
   */
  static isTianDe(stem: string, branch: string): boolean {
    // 天德与天干的对应关系
    const tianDeMap: {[key: string]: string} = {
      '甲': '丁',
      '乙': '申',
      '丙': '壬',
      '丁': '辛',
      '戊': '亥',
      '己': '甲',
      '庚': '乙',
      '辛': '戊',
      '壬': '丙',
      '癸': '己'
    };

    // 天德与地支的对应关系
    const tianDeBranchMap: {[key: string]: string} = {
      '子': '丁',
      '丑': '申',
      '寅': '壬',
      '卯': '辛',
      '辰': '亥',
      '巳': '甲',
      '午': '乙',
      '未': '戊',
      '申': '丙',
      '酉': '己',
      '戌': '庚',
      '亥': '癸'
    };

    return tianDeMap[stem] === branch || tianDeBranchMap[branch] === stem;
  }

  /**
   * 判断天德合
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德合
   */
  static isTianDeHe(stem: string, branch: string): boolean {
    // 天德合与天干的对应关系
    const tianDeHeMap: {[key: string]: string} = {
      '甲': '壬',
      '乙': '癸',
      '丙': '丁',
      '丁': '戊',
      '戊': '己',
      '己': '庚',
      '庚': '辛',
      '辛': '壬',
      '壬': '癸',
      '癸': '甲'
    };

    // 天德合与地支的对应关系
    const tianDeHeBranchMap: {[key: string]: string} = {
      '子': '壬',
      '丑': '癸',
      '寅': '丁',
      '卯': '戊',
      '辰': '己',
      '巳': '庚',
      '午': '辛',
      '未': '壬',
      '申': '癸',
      '酉': '甲',
      '戌': '乙',
      '亥': '丙'
    };

    return tianDeHeMap[stem] === branch || tianDeHeBranchMap[branch] === stem;
  }

  /**
   * 判断月德
   * @param stem 天干
   * @returns 是否为月德
   */
  static isYueDe(stem: string): boolean {
    // 月德与天干的对应关系
    const yueDeMap: {[key: string]: string} = {
      '甲': '丙',
      '乙': '甲',
      '丙': '甲',
      '丁': '庚',
      '戊': '丙',
      '己': '甲',
      '庚': '丁',
      '辛': '庚',
      '壬': '乙',
      '癸': '庚'
    };

    return Object.values(yueDeMap).includes(stem);
  }

  /**
   * 判断天医
   * @param branch 地支
   * @returns 是否为天医
   */
  static isTianYi(branch: string): boolean {
    // 天医与地支的对应关系
    const tianYiMap: {[key: string]: string} = {
      '子': '亥',
      '丑': '子',
      '寅': '丑',
      '卯': '寅',
      '辰': '卯',
      '巳': '辰',
      '午': '巳',
      '未': '午',
      '申': '未',
      '酉': '申',
      '戌': '酉',
      '亥': '戌'
    };

    return Object.values(tianYiMap).includes(branch);
  }

  /**
   * 判断天喜
   * @param branch 地支
   * @param yearBranch 年支
   * @returns 是否为天喜
   */
  static isTianXi(branch: string, yearBranch: string): boolean {
    // 天喜与年支的对应关系
    const tianXiMap: {[key: string]: string} = {
      '子': '酉',
      '丑': '申',
      '寅': '未',
      '卯': '午',
      '辰': '巳',
      '巳': '辰',
      '午': '卯',
      '未': '寅',
      '申': '丑',
      '酉': '子',
      '戌': '亥',
      '亥': '戌'
    };

    return tianXiMap[yearBranch] === branch;
  }

  /**
   * 判断红艳
   * @param branch 地支
   * @returns 是否为红艳
   */
  static isHongYan(branch: string): boolean {
    return ['卯', '巳', '申', '戌'].includes(branch);
  }

  /**
   * 判断天罗
   * @param branch 地支
   * @returns 是否为天罗
   */
  static isTianLuo(branch: string): boolean {
    return branch === '戌';
  }

  /**
   * 判断地网
   * @param branch 地支
   * @returns 是否为地网
   */
  static isDiWang(branch: string): boolean {
    return branch === '未';
  }

  /**
   * 判断羊刃
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为羊刃
   */
  static isYangRen(dayStem: string, branch: string): boolean {
    // 羊刃与日干的对应关系
    // 羊刃口诀：甲羊刃在卯，乙羊刃在寅。丙戊羊刃在午，丁己羊刃在巳。庚羊刃在酉，辛羊刃在申。壬羊刃在亥，癸羊刃在子。
    const yangRenMap: {[key: string]: string} = {
      '甲': '卯',
      '乙': '寅',
      '丙': '午',
      '戊': '午',
      '丁': '巳',
      '己': '巳',
      '庚': '酉',
      '辛': '申',
      '壬': '亥',
      '癸': '子'
    };

    return yangRenMap[dayStem] === branch;
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
   * 判断天刑
   * @param branch 地支
   * @returns 是否为天刑
   */
  static isTianXing(branch: string): boolean {
    return branch === '巳';
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
   * 判断亡神
   * @param branch 地支
   * @returns 是否为亡神
   */
  static isWangShen(branch: string): boolean {
    return ['寅', '申'].includes(branch);
  }

  /**
   * 判断劫煞
   * @param branch 地支
   * @returns 是否为劫煞
   */
  static isJieSha(branch: string): boolean {
    return ['子', '午'].includes(branch);
  }

  /**
   * 判断灾煞
   * @param branch 地支
   * @returns 是否为灾煞
   */
  static isZaiSha(branch: string): boolean {
    return ['卯', '酉'].includes(branch);
  }

  /**
   * 获取神煞类型（吉神、凶神、吉凶神）
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  static getShenShaType(shenSha: string): string {
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
      '天奸', '天讼', '羊刃', '金神'
    ];

    // 吉凶神列表（根据不同情况可能吉可能凶）
    const mixedShenSha = [
      '将星', '华盖', '桃花', '三台', '八座', '恩光', '天贵', '台辅',
      '封诰', '天使', '天伤', '天空', '截路', '旬空', '三奇', '六仪',
      '三合', '六合', '暗合', '拱合', '三会', '三刑', '六冲', '暗冲',
      '童子煞', '将军箭', '红艳'
    ];

    // 去除可能的前缀（如"年柱:"）
    const pureShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;

    if (goodShenSha.includes(pureShenSha)) {
      return '吉神';
    } else if (badShenSha.includes(pureShenSha)) {
      return '凶神';
    } else if (mixedShenSha.includes(pureShenSha)) {
      return '吉凶神';
    }

    return '未知';
  }
}
