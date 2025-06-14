import { BaziUtils } from './BaziUtils';
import { BaziCalculator } from './BaziCalculator';
import { WuXingConfig } from '../../config/WuXingConfig';

/**
 * 五行强度计算模块
 * 专门处理五行强度计算和日主旺衰判断
 */
export class WuXingStrengthCalculator {
  /**
   * 计算五行强度
   * @param eightChar 八字对象
   * @returns 五行强度对象（包含详细计算过程）
   */
  static calculateWuXingStrength(eightChar: any): {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
    details?: {
      jin: any;
      mu: any;
      shui: any;
      huo: any;
      tu: any;
    };
  } {
    const strength = {
      jin: 0,
      mu: 0,
      shui: 0,
      huo: 0,
      tu: 0
    };

    // 详细计算过程跟踪（包含计算过程描述）
    const details = {
      jin: {
        tianGan: 0, diZhi: 0, diZhiCang: 0, naYin: 0, season: 0, combination: 0, total: 0,
        tianGanDetails: [], diZhiDetails: [], diZhiCangDetails: [], naYinDetails: [],
        seasonDetails: '', combinationDetails: []
      },
      mu: {
        tianGan: 0, diZhi: 0, diZhiCang: 0, naYin: 0, season: 0, combination: 0, total: 0,
        tianGanDetails: [], diZhiDetails: [], diZhiCangDetails: [], naYinDetails: [],
        seasonDetails: '', combinationDetails: []
      },
      shui: {
        tianGan: 0, diZhi: 0, diZhiCang: 0, naYin: 0, season: 0, combination: 0, total: 0,
        tianGanDetails: [], diZhiDetails: [], diZhiCangDetails: [], naYinDetails: [],
        seasonDetails: '', combinationDetails: []
      },
      huo: {
        tianGan: 0, diZhi: 0, diZhiCang: 0, naYin: 0, season: 0, combination: 0, total: 0,
        tianGanDetails: [], diZhiDetails: [], diZhiCangDetails: [], naYinDetails: [],
        seasonDetails: '', combinationDetails: []
      },
      tu: {
        tianGan: 0, diZhi: 0, diZhiCang: 0, naYin: 0, season: 0, combination: 0, total: 0,
        tianGanDetails: [], diZhiDetails: [], diZhiCangDetails: [], naYinDetails: [],
        seasonDetails: '', combinationDetails: []
      },
      // 全局信息
      eightChar: { yearStem: '', yearBranch: '', monthStem: '', monthBranch: '',
                   dayStem: '', dayBranch: '', hourStem: '', hourBranch: '' },
      season: '',
      monthBranch: ''
    };

    try {
      console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 WuXingStrengthCalculator.calculateWuXingStrength 开始 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
      console.log('🚀 开始计算五行强度 - WuXingStrengthCalculator.calculateWuXingStrengthWithDetails');
      // 获取四柱干支
      const yearStem = eightChar.getYearGan();
      const yearBranch = eightChar.getYearZhi();
      const monthStem = eightChar.getMonthGan();
      const monthBranch = eightChar.getMonthZhi();
      const dayStem = eightChar.getDayGan();
      const dayBranch = eightChar.getDayZhi();
      const hourStem = eightChar.getTimeGan();
      const hourBranch = eightChar.getTimeZhi();
      console.log(`🔍 八字: ${yearStem}${yearBranch} ${monthStem}${monthBranch} ${dayStem}${dayBranch} ${hourStem}${hourBranch}`);

      // 计算天干五行强度（使用统一配置）
      console.log(`🔍 天干: 年干${yearStem}(${BaziUtils.getStemWuXing(yearStem)})=${WuXingConfig.tianGanWeight.year}`);
      console.log(`🔍 天干: 月干${monthStem}(${BaziUtils.getStemWuXing(monthStem)})=${WuXingConfig.tianGanWeight.month}`);
      this.addWuXingStrengthWithDetails(BaziUtils.getStemWuXing(yearStem), WuXingConfig.tianGanWeight.year, strength, details, 'tianGan');
      this.addWuXingStrengthWithDetails(BaziUtils.getStemWuXing(monthStem), WuXingConfig.tianGanWeight.month, strength, details, 'tianGan');
      this.addWuXingStrengthWithDetails(BaziUtils.getStemWuXing(dayStem), WuXingConfig.tianGanWeight.day, strength, details, 'tianGan');
      this.addWuXingStrengthWithDetails(BaziUtils.getStemWuXing(hourStem), WuXingConfig.tianGanWeight.hour, strength, details, 'tianGan');

      // 计算地支五行强度（使用统一配置）
      this.addWuXingStrengthWithDetails(BaziUtils.getBranchWuXing(yearBranch), WuXingConfig.diZhiWeight.year, strength, details, 'diZhi');
      this.addWuXingStrengthWithDetails(BaziUtils.getBranchWuXing(monthBranch), WuXingConfig.diZhiWeight.month, strength, details, 'diZhi');
      this.addWuXingStrengthWithDetails(BaziUtils.getBranchWuXing(dayBranch), WuXingConfig.diZhiWeight.day, strength, details, 'diZhi');
      this.addWuXingStrengthWithDetails(BaziUtils.getBranchWuXing(hourBranch), WuXingConfig.diZhiWeight.hour, strength, details, 'diZhi');

      // 计算地支藏干五行强度
      this.processHideGanForStrengthWithDetails([yearBranch, monthBranch, dayBranch, hourBranch], strength, details);

      // 计算纳音五行强度
      this.addNaYinWuXingStrengthWithDetails(eightChar, strength, details);

      // 根据月令季节调整五行强度（月令的核心体现）
      this.adjustByMonthSeasonWithDetails(monthBranch, strength, details);

      // 根据组合关系调整五行强度
      this.adjustByCombinationWithDetails(eightChar, strength, details);

    } catch (error) {
      console.error('计算五行强度出错:', error);
    }

    // 更新详细信息的总计
    details.jin.total = strength.jin;
    details.mu.total = strength.mu;
    details.shui.total = strength.shui;
    details.huo.total = strength.huo;
    details.tu.total = strength.tu;

    const result = {
      ...strength,
      details
    };

    console.log('🎯🎯🎯🎯🎯 WuXingStrengthCalculator.calculateWuXingStrength 返回结果:');
    console.log('🎯 金:', result.jin);
    console.log('🎯 木:', result.mu);
    console.log('🎯 水:', result.shui);
    console.log('🎯 火:', result.huo);
    console.log('🎯 土:', result.tu);
    console.log('🎯 是否有详细信息:', 'details' in result);
    console.log('🎯 详细信息:', result.details);

    return result;
  }



  /**
   * 添加五行强度（带详细跟踪）
   * @param wuXing 五行
   * @param value 强度值
   * @param strength 强度对象
   * @param details 详细信息对象
   * @param category 分类
   */
  private static addWuXingStrengthWithDetails(wuXing: string, value: number, strength: any, details: any, category: string): void {
    if (!wuXing) return;

    switch (wuXing) {
      case '金':
        strength.jin += value;
        details.jin[category] += value;
        break;
      case '木':
        strength.mu += value;
        details.mu[category] += value;
        break;
      case '水':
        strength.shui += value;
        details.shui[category] += value;
        break;
      case '火':
        strength.huo += value;
        details.huo[category] += value;
        break;
      case '土':
        strength.tu += value;
        details.tu[category] += value;
        break;
    }
  }



  /**
   * 处理地支藏干的五行强度（带详细跟踪）
   * @param branches 地支数组
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static processHideGanForStrengthWithDetails(branches: string[], strength: any, details: any): void {
    const branchWeights = [
      WuXingConfig.diZhiCangWeight.year,   // 年支藏干权重
      WuXingConfig.diZhiCangWeight.month,  // 月支藏干权重
      WuXingConfig.diZhiCangWeight.day,    // 日支藏干权重
      WuXingConfig.diZhiCangWeight.hour    // 时支藏干权重
    ];

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      const hideGanStr = BaziCalculator.getHideGan(branch);
      if (hideGanStr) {
        const hideGanArray = hideGanStr.split(',');
        const branchWeight = branchWeights[branchIndex];

        for (let i = 0; i < hideGanArray.length; i++) {
          const hideGan = hideGanArray[i].trim();
          const wuXing = BaziUtils.getStemWuXing(hideGan);
          // 藏干的强度递减：本气1.0，中气0.6，余气0.3
          const hideGanRatio = i === 0 ? 1.0 : (i === 1 ? 0.6 : 0.3);
          const finalWeight = branchWeight * hideGanRatio;
          this.addWuXingStrengthWithDetails(wuXing, finalWeight, strength, details, 'diZhiCang');
        }
      }
    }
  }

  /**
   * 添加纳音五行强度（带详细跟踪）
   * @param eightChar 八字对象
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static addNaYinWuXingStrengthWithDetails(eightChar: any, strength: any, details: any): void {
    try {
      // 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
      const yearNaYin = eightChar.getYearNaYin();
      const monthNaYin = eightChar.getMonthNaYin();
      const dayNaYin = eightChar.getDayNaYin();
      const hourNaYin = eightChar.getTimeNaYin();

      // 提取纳音五行
      const yearNaYinWuXing = this.extractNaYinWuXing(yearNaYin);
      const monthNaYinWuXing = this.extractNaYinWuXing(monthNaYin);
      const dayNaYinWuXing = this.extractNaYinWuXing(dayNaYin);
      const hourNaYinWuXing = this.extractNaYinWuXing(hourNaYin);

      // 按权重添加纳音五行强度（使用统一配置）
      this.addWuXingStrengthWithDetails(yearNaYinWuXing, WuXingConfig.naYinWeight.year, strength, details, 'naYin');
      this.addWuXingStrengthWithDetails(monthNaYinWuXing, WuXingConfig.naYinWeight.month, strength, details, 'naYin');
      this.addWuXingStrengthWithDetails(dayNaYinWuXing, WuXingConfig.naYinWeight.day, strength, details, 'naYin');
      this.addWuXingStrengthWithDetails(hourNaYinWuXing, WuXingConfig.naYinWeight.hour, strength, details, 'naYin');

    } catch (error) {
      console.error('计算纳音五行强度出错:', error);
    }
  }

  /**
   * 提取纳音五行
   * @param naYin 纳音
   * @returns 五行
   */
  private static extractNaYinWuXing(naYin: string): string {
    if (!naYin) return '';

    // 纳音五行映射
    const naYinWuXingMap: {[key: string]: string} = {
      '海中金': '金', '炉中火': '火', '大林木': '木', '路旁土': '土', '剑锋金': '金',
      '山头火': '火', '涧下水': '水', '城头土': '土', '白蜡金': '金', '杨柳木': '木',
      '泉中水': '水', '屋上土': '土', '霹雳火': '火', '松柏木': '木', '长流水': '水',
      '沙中金': '金', '山下火': '火', '平地木': '木', '壁上土': '土', '金箔金': '金',
      '覆灯火': '火', '天河水': '水', '大驿土': '土', '钗钏金': '金', '桑柘木': '木',
      '大溪水': '水', '沙中土': '土', '天上火': '火', '石榴木': '木', '大海水': '水'
    };

    return naYinWuXingMap[naYin] || '';
  }





  /**
   * 根据月令季节调整五行强度（带详细跟踪）
   * @param monthBranch 月支
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static adjustByMonthSeasonWithDetails(monthBranch: string, strength: any, details: any): void {
    const seasonMap: {[key: string]: string} = {
      '寅': '春', '卯': '春', '辰': '春',
      '巳': '夏', '午': '夏', '未': '夏',
      '申': '秋', '酉': '秋', '戌': '秋',
      '亥': '冬', '子': '冬', '丑': '冬'
    };

    const season = seasonMap[monthBranch];
    console.log(`🔍 季节调整: 月支=${monthBranch}, 季节=${season}`);
    if (!season) return;

    // 月令是八字中最重要的因素，按旺相休囚死五个状态调整（使用统一配置）
    switch (season) {
      case '春':
        // 春季：木当令
        strength.mu += WuXingConfig.seasonAdjust.wang;    // 木旺
        details.mu.season += WuXingConfig.seasonAdjust.wang;
        strength.huo += WuXingConfig.seasonAdjust.xiang;  // 火相
        details.huo.season += WuXingConfig.seasonAdjust.xiang;
        strength.shui += WuXingConfig.seasonAdjust.ping;  // 水休
        details.shui.season += WuXingConfig.seasonAdjust.ping;
        strength.jin += WuXingConfig.seasonAdjust.qiu;    // 金囚
        details.jin.season += WuXingConfig.seasonAdjust.qiu;
        strength.tu += WuXingConfig.seasonAdjust.si;      // 土死
        details.tu.season += WuXingConfig.seasonAdjust.si;
        break;
      case '夏':
        // 夏季：火当令
        console.log(`🔍 夏季调整开始: 土相值=${WuXingConfig.seasonAdjust.xiang}`);
        strength.huo += WuXingConfig.seasonAdjust.wang;   // 火旺
        details.huo.season += WuXingConfig.seasonAdjust.wang;
        strength.tu += WuXingConfig.seasonAdjust.xiang;   // 土相
        details.tu.season += WuXingConfig.seasonAdjust.xiang;
        console.log(`🔍 夏季调整后: details.tu.season=${details.tu.season}`);
        strength.mu += WuXingConfig.seasonAdjust.ping;    // 木休
        details.mu.season += WuXingConfig.seasonAdjust.ping;
        strength.shui += WuXingConfig.seasonAdjust.qiu;   // 水囚
        details.shui.season += WuXingConfig.seasonAdjust.qiu;
        strength.jin += WuXingConfig.seasonAdjust.si;     // 金死
        details.jin.season += WuXingConfig.seasonAdjust.si;
        break;
      case '秋':
        // 秋季：金当令
        strength.jin += WuXingConfig.seasonAdjust.wang;   // 金旺
        details.jin.season += WuXingConfig.seasonAdjust.wang;
        strength.shui += WuXingConfig.seasonAdjust.xiang; // 水相
        details.shui.season += WuXingConfig.seasonAdjust.xiang;
        strength.tu += WuXingConfig.seasonAdjust.ping;    // 土休
        details.tu.season += WuXingConfig.seasonAdjust.ping;
        strength.mu += WuXingConfig.seasonAdjust.qiu;     // 木囚
        details.mu.season += WuXingConfig.seasonAdjust.qiu;
        strength.huo += WuXingConfig.seasonAdjust.si;     // 火死
        details.huo.season += WuXingConfig.seasonAdjust.si;
        break;
      case '冬':
        // 冬季：水当令
        strength.shui += WuXingConfig.seasonAdjust.wang;  // 水旺
        details.shui.season += WuXingConfig.seasonAdjust.wang;
        strength.mu += WuXingConfig.seasonAdjust.xiang;   // 木相
        details.mu.season += WuXingConfig.seasonAdjust.xiang;
        strength.jin += WuXingConfig.seasonAdjust.ping;   // 金休
        details.jin.season += WuXingConfig.seasonAdjust.ping;
        strength.huo += WuXingConfig.seasonAdjust.qiu;    // 火囚
        details.huo.season += WuXingConfig.seasonAdjust.qiu;
        strength.tu += WuXingConfig.seasonAdjust.si;      // 土死
        details.tu.season += WuXingConfig.seasonAdjust.si;
        break;
    }
  }



  /**
   * 根据组合关系调整五行强度（带详细跟踪）
   * @param eightChar 八字对象
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static adjustByCombinationWithDetails(eightChar: any, strength: any, details: any): void {
    try {
      // 获取四柱干支
      const yearStem = eightChar.getYearGan();
      const yearBranch = eightChar.getYearZhi();
      const monthStem = eightChar.getMonthGan();
      const monthBranch = eightChar.getMonthZhi();
      const dayStem = eightChar.getDayGan();
      const dayBranch = eightChar.getDayZhi();
      const hourStem = eightChar.getTimeGan();
      const hourBranch = eightChar.getTimeZhi();

      const stems = [yearStem, monthStem, dayStem, hourStem];
      const branches = [yearBranch, monthBranch, dayBranch, hourBranch];

      // 检查天干五合
      this.checkStemCombinationWithDetails(stems, strength, details);

      // 检查地支三合、三会
      this.checkBranchCombinationWithDetails(branches, strength, details);

    } catch (error) {
      console.error('调整组合关系出错:', error);
    }
  }



  /**
   * 检查天干组合（带详细跟踪）
   * @param stems 天干数组
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static checkStemCombinationWithDetails(stems: string[], strength: any, details: any): void {
    // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
    const combinations: {[key: string]: {result: string, value: number}} = {
      '甲己': {result: '土', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '己甲': {result: '土', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '乙庚': {result: '金', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '庚乙': {result: '金', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '丙辛': {result: '水', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '辛丙': {result: '水', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '丁壬': {result: '木', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '壬丁': {result: '木', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '戊癸': {result: '火', value: WuXingConfig.combinationWeight.tianGanWuHe},
      '癸戊': {result: '火', value: WuXingConfig.combinationWeight.tianGanWuHe}
    };

    for (let i = 0; i < stems.length; i++) {
      for (let j = i + 1; j < stems.length; j++) {
        const combination = stems[i] + stems[j];
        if (combinations[combination]) {
          const {result, value} = combinations[combination];
          this.addWuXingStrengthWithDetails(result, value, strength, details, 'combination');
        }
      }
    }
  }



  /**
   * 检查地支组合（带详细跟踪）
   * @param branches 地支数组
   * @param strength 强度对象
   * @param details 详细信息对象
   */
  private static checkBranchCombinationWithDetails(branches: string[], strength: any, details: any): void {
    // 地支三合：寅午戌合火局，申子辰合水局，亥卯未合木局，巳酉丑合金局
    const sanHePatterns = [
      {branches: ['寅', '午', '戌'], element: '火', value: WuXingConfig.combinationWeight.diZhiSanHe},
      {branches: ['申', '子', '辰'], element: '水', value: WuXingConfig.combinationWeight.diZhiSanHe},
      {branches: ['亥', '卯', '未'], element: '木', value: WuXingConfig.combinationWeight.diZhiSanHe},
      {branches: ['巳', '酉', '丑'], element: '金', value: WuXingConfig.combinationWeight.diZhiSanHe}
    ];

    // 地支三会：寅卯辰三会木局，巳午未三会火局，申酉戌三会金局，亥子丑三会水局
    const sanHuiPatterns = [
      {branches: ['寅', '卯', '辰'], element: '木', value: WuXingConfig.combinationWeight.diZhiSanHui},
      {branches: ['巳', '午', '未'], element: '火', value: WuXingConfig.combinationWeight.diZhiSanHui},
      {branches: ['申', '酉', '戌'], element: '金', value: WuXingConfig.combinationWeight.diZhiSanHui},
      {branches: ['亥', '子', '丑'], element: '水', value: WuXingConfig.combinationWeight.diZhiSanHui}
    ];

    // 检查三合局
    for (const pattern of sanHePatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        this.addWuXingStrengthWithDetails(pattern.element, pattern.value, strength, details, 'combination');
      }
    }

    // 检查三会局
    for (const pattern of sanHuiPatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        this.addWuXingStrengthWithDetails(pattern.element, pattern.value, strength, details, 'combination');
      }
    }
  }

  /**
   * 计算日主旺衰
   * @param eightChar 八字对象
   * @returns 日主旺衰结果
   */
  static calculateRiZhuStrength(eightChar: any): {
    result: string;
    details: any;
  } {
    try {
      // 获取五行强度
      const wuXingStrength = this.calculateWuXingStrength(eightChar);
      
      // 获取日干五行
      const dayStem = eightChar.getDayGan();
      const dayWuXing = BaziUtils.getStemWuXing(dayStem);
      
      // 计算日主强度（日干本身 + 同类五行）
      let riZhuStrength = 0;
      switch (dayWuXing) {
        case '金':
          riZhuStrength = wuXingStrength.jin;
          break;
        case '木':
          riZhuStrength = wuXingStrength.mu;
          break;
        case '水':
          riZhuStrength = wuXingStrength.shui;
          break;
        case '火':
          riZhuStrength = wuXingStrength.huo;
          break;
        case '土':
          riZhuStrength = wuXingStrength.tu;
          break;
      }

      // 计算其他五行总强度
      const totalOtherStrength = (wuXingStrength.jin + wuXingStrength.mu + wuXingStrength.shui + wuXingStrength.huo + wuXingStrength.tu) - riZhuStrength;

      // 判断旺衰
      let result = '';
      if (riZhuStrength >= totalOtherStrength * 0.6) {
        result = '身旺';
      } else if (riZhuStrength >= totalOtherStrength * 0.3) {
        result = '身平';
      } else {
        result = '身弱';
      }

      return {
        result,
        details: {
          dayWuXing,
          riZhuStrength,
          totalOtherStrength,
          wuXingStrength,
          ratio: riZhuStrength / (totalOtherStrength || 1)
        }
      };

    } catch (error) {
      console.error('计算日主旺衰出错:', error);
      return {
        result: '未知',
        details: {}
      };
    }
  }
}
