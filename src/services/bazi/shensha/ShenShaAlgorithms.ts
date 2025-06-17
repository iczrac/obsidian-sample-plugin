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
   * @param dayBranch 日支
   * @param branch 地支
   * @returns 是否为空亡
   */
  static isKongWang(dayBranch: string, branch: string): boolean {
    // 空亡的计算规则：以日柱为主，柱中年、月、时支见者为空亡
    // 子丑空在戌亥，寅卯空在申酉，辰巳空在午未，午未空在辰巳，申酉空在寅卯，戌亥空在子丑
    const kongWangMap: {[key: string]: string[]} = {
      '子': ['戌', '亥'], '丑': ['戌', '亥'],
      '寅': ['申', '酉'], '卯': ['申', '酉'],
      '辰': ['午', '未'], '巳': ['午', '未'],
      '午': ['辰', '巳'], '未': ['辰', '巳'],
      '申': ['寅', '卯'], '酉': ['寅', '卯'],
      '戌': ['子', '丑'], '亥': ['子', '丑']
    };
    return kongWangMap[dayBranch]?.includes(branch) || false;
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
      if (this.arrayEquals(threeStem, tianShangSanQi) ||
          this.arrayEquals(threeStem, diXiaSanQi) ||
          this.arrayEquals(threeStem, renZhongSanQi)) {
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
    return this.isTianXi(yearBranch, branch);
  }

  /**
   * 判断红艳
   * @param yearBranch 年支
   * @param branch 地支
   * @returns 是否为红艳
   */
  static isHongYan(yearBranch: string, branch: string): boolean {
    // 红艳的计算规则：与天喜、红鸾相同
    return this.isTianXi(yearBranch, branch);
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
   * 判断天德合
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德合
   */
  static isTianDeHe(stem: string, branch: string): boolean {
    // 天德合与天干的对应关系
    const tianDeHeMap: {[key: string]: string} = {
      '甲': '壬', '乙': '癸', '丙': '丁', '丁': '戊', '戊': '己',
      '己': '庚', '庚': '辛', '辛': '壬', '壬': '癸', '癸': '甲'
    };

    // 天德合与地支的对应关系
    const tianDeHeBranchMap: {[key: string]: string} = {
      '子': '壬', '丑': '癸', '寅': '丁', '卯': '戊', '辰': '己',
      '巳': '庚', '午': '辛', '未': '壬', '申': '癸', '酉': '甲',
      '戌': '乙', '亥': '丙'
    };

    return tianDeHeMap[stem] === branch || tianDeHeBranchMap[branch] === stem;
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
      '阴差阳错': this.isYinChaYangCuo,
      '空亡': this.isKongWang,
      '太极贵人': this.isTaiJiGuiRen,
      '金舆': this.isJinYu,
      '国印贵人': this.isGuoYinGuiRen,
      '三奇贵人': this.isSanQiGuiRen,
      '福星贵人': this.isFuXingGuiRen,
      '文曲': this.isWenQu,
      '天喜': this.isTianXi,
      '红鸾': this.isHongLuan,
      '红艳': this.isHongYan,
      '天姚': this.isTianYao,
      '学堂词馆': this.isXueTangCiGuan,
      '德秀贵人': this.isDeXiuGuiRen,
      '十恶大败': this.isShiEDaBai,
      '孤鸾煞': this.isGuLuanSha,
      '四废': this.isSiFei,
      '天罗地网': this.isTianLuoDiWang,
      '亡神': this.isWangShen,
      '披麻': this.isPiMa,
      '吊客': this.isDiaoKe,
      '丧门': this.isSangMen,
      '元辰': this.isYuanChen,
      '天德合': this.isTianDeHe,
      '天空': this.isTianKong,
      '地劫': this.isDiJie,
      '天哭': this.isTianKu,
      '天虚': this.isTianXu,
      '咸池': this.isXianChi,
      '解神': this.isJieShen,
      '金神': this.isJinShen,
      '日德': this.isRiDe
    };
  }
}
