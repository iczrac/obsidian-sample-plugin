import { BaziUtils } from './BaziUtils';

/**
 * 八字基础计算模块
 * 包含基础的八字计算逻辑
 */
export class BaziCalculator {
  /**
   * 计算胎元
   * @param monthStem 月干
   * @param monthBranch 月支
   * @returns 胎元干支
   */
  static calculateTaiYuan(monthStem: string, monthBranch: string): string {
    // 计算月干的索引
    const stemIndex = BaziUtils.getStemIndex(monthStem);
    // 计算月支的索引
    const branchIndex = BaziUtils.getBranchIndex(monthBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      return "未知";
    }

    // 计算胎元干（月干 + 5，超过10则减10）
    const taiYuanStemIndex = (stemIndex + 5) % 10;
    // 计算胎元支（月支 + 3，超过12则减12）
    const taiYuanBranchIndex = (branchIndex + 3) % 12;

    // 组合胎元干支
    return BaziUtils.getStemByIndex(taiYuanStemIndex) + BaziUtils.getBranchByIndex(taiYuanBranchIndex);
  }

  /**
   * 计算命宫
   * @param hourStem 时干
   * @param hourBranch 时支
   * @returns 命宫干支
   */
  static calculateMingGong(hourStem: string, hourBranch: string): string {
    // 计算时干的索引
    const stemIndex = BaziUtils.getStemIndex(hourStem);
    // 计算时支的索引
    const branchIndex = BaziUtils.getBranchIndex(hourBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      return "未知";
    }

    // 计算命宫干（时干 + 7，超过10则减10）
    const mingGongStemIndex = (stemIndex + 7) % 10;
    // 计算命宫支（时支 + 1，超过12则减12）
    const mingGongBranchIndex = (branchIndex + 1) % 12;

    // 组合命宫干支
    return BaziUtils.getStemByIndex(mingGongStemIndex) + BaziUtils.getBranchByIndex(mingGongBranchIndex);
  }

  /**
   * 计算旬空
   * @param gan 天干
   * @param zhi 地支
   * @returns 旬空地支
   */
  static calculateXunKong(gan: string, zhi: string): string {
    // 天干序号（甲=0, 乙=1, ..., 癸=9）
    const ganIndex = BaziUtils.getStemIndex(gan);
    // 地支序号（子=0, 丑=1, ..., 亥=11）
    const zhiIndex = BaziUtils.getBranchIndex(zhi);

    if (ganIndex === -1 || zhiIndex === -1) {
      return '';
    }

    // 计算旬首（甲子、甲戌、甲申、甲午、甲辰、甲寅）
    // 旬空的地支是该旬中没有对应天干的地支
    const xunShou = ganIndex; // 旬首的天干索引
    
    // 每旬有10个干支组合，地支从旬首地支开始
    const xunShouZhi = (zhiIndex - ganIndex + 12) % 12;
    
    // 旬空的两个地支
    const kongZhi1 = (xunShouZhi + 10) % 12;
    const kongZhi2 = (xunShouZhi + 11) % 12;

    return BaziUtils.getBranchByIndex(kongZhi1) + BaziUtils.getBranchByIndex(kongZhi2);
  }

  /**
   * 获取地支藏干
   * @param branch 地支
   * @returns 藏干字符串
   */
  static getHideGan(branch: string): string {
    // 检查地支是否有效
    if (!branch) {
      return '';
    }

    const map: {[key: string]: string} = {
      '子': '癸',
      '丑': '己,癸,辛',
      '寅': '甲,丙,戊',
      '卯': '乙',
      '辰': '戊,乙,癸',
      '巳': '丙,庚,戊',
      '午': '丁,己',
      '未': '己,丁,乙',
      '申': '庚,壬,戊',
      '酉': '辛',
      '戌': '戊,辛,丁',
      '亥': '壬,甲'
    };

    return map[branch] || '';
  }

  /**
   * 获取纳音
   * @param gz 干支组合
   * @returns 纳音
   */
  static getNaYin(gz: string): string {
    const map: {[key: string]: string} = {
      '甲子': '海中金', '乙丑': '海中金',
      '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木',
      '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金',
      '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水',
      '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金',
      '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水',
      '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火',
      '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水',
      '甲午': '砂中金', '乙未': '砂中金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };

    return map[gz] || '未知';
  }

  /**
   * 计算起运信息
   * @param solar 阳历对象
   * @param gender 性别
   * @returns 起运信息
   */
  static calculateQiYun(solar: any, gender: string): { date: string; age: number } {
    // 这里简化处理，实际应该根据八字命理规则计算
    
    // 获取出生年份
    const birthYear = solar.getYear();
    
    // 简化的起运年龄计算（实际应该根据节气和性别计算）
    // 一般来说，男命阳年生或女命阴年生为顺行，反之为逆行
    // 起运年龄通常在1-10岁之间
    const qiYunAge = 8; // 简化为8岁起运
    
    // 计算起运年份
    const qiYunYear = birthYear + qiYunAge;
    
    // 简化的起运日期（实际应该精确计算到日）
    const qiYunDate = `${qiYunYear}-01-01`;
    
    return {
      date: qiYunDate,
      age: qiYunAge
    };
  }

  /**
   * 获取地势（长生十二神）
   * @param dayStem 日干
   * @param branch 地支
   * @returns 地势
   */
  static getDiShi(dayStem: string, branch: string): string {
    // 阳干：甲丙戊庚壬
    // 阴干：乙丁己辛癸
    
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangGan = yangGan.includes(dayStem);
    
    // 长生十二神的顺序
    const diShiOrder = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
    
    // 各天干的长生位置（阳干顺行，阴干逆行）
    const changShengMap: {[key: string]: string} = {
      '甲': '亥', '乙': '午',
      '丙': '寅', '丁': '酉', 
      '戊': '寅', '己': '酉',
      '庚': '巳', '辛': '子',
      '壬': '申', '癸': '卯'
    };
    
    const changShengBranch = changShengMap[dayStem];
    if (!changShengBranch) return '';
    
    const changShengIndex = BaziUtils.getBranchIndex(changShengBranch);
    const branchIndex = BaziUtils.getBranchIndex(branch);
    
    if (changShengIndex === -1 || branchIndex === -1) return '';
    
    let diShiIndex;
    if (isYangGan) {
      // 阳干顺行
      diShiIndex = (branchIndex - changShengIndex + 12) % 12;
    } else {
      // 阴干逆行
      diShiIndex = (changShengIndex - branchIndex + 12) % 12;
    }
    
    return diShiOrder[diShiIndex];
  }
}
