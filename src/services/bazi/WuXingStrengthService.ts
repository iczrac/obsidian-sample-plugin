import { WuXingStrengthCalculator } from './WuXingStrengthCalculator';
import { BaziInfo } from '../../types/BaziInfo';

/**
 * 五行强度服务
 * 对WuXingStrengthCalculator的封装，提供更友好的接口
 */
export class WuXingStrengthService {
  
  /**
   * 获取五行强度计算过程的详细说明
   * @param wuXing 五行名称
   * @param baziInfo 八字信息
   * @returns 详细计算过程说明
   */
  static getWuXingCalculationExplanation(wuXing: string, baziInfo: BaziInfo): string {
    if (!baziInfo || !baziInfo.wuXingStrength) {
      return `无法获取${wuXing}五行强度信息。`;
    }

    // 检查是否有详细信息
    if (!('details' in baziInfo.wuXingStrength)) {
      return `无法获取${wuXing}五行强度详情，请更新八字计算引擎。`;
    }

    // 获取五行强度详情
    const details = (baziInfo.wuXingStrength as any).details;
    const wuXingStrength = baziInfo.wuXingStrength as any;

    // 检查 details 是否存在
    if (!details) {
      return `无法获取五行强度详情，请检查八字信息是否完整。`;
    }

    // 获取特定五行的详情
    let wuXingDetails: {
      tianGan?: number;
      diZhi?: number;
      diZhiCang?: number;
      naYin?: number;
      season?: number;
      combination?: number;
      total?: number;
      monthDominant?: number;
    } = {};

    // 获取当前五行的强度值
    let currentWuXingValue = 0;

    switch (wuXing) {
      case '金':
        wuXingDetails = details.jin || {};
        currentWuXingValue = wuXingStrength.jin || 0;
        break;
      case '木':
        wuXingDetails = details.mu || {};
        currentWuXingValue = wuXingStrength.mu || 0;
        break;
      case '水':
        wuXingDetails = details.shui || {};
        currentWuXingValue = wuXingStrength.shui || 0;
        break;
      case '火':
        wuXingDetails = details.huo || {};
        currentWuXingValue = wuXingStrength.huo || 0;
        break;
      case '土':
        wuXingDetails = details.tu || {};
        currentWuXingValue = wuXingStrength.tu || 0;
        break;
      default:
        return `不支持的五行类型：${wuXing}`;
    }

    // 提取各项数值
    const tianGan = wuXingDetails.tianGan || 0;
    const diZhi = wuXingDetails.diZhi || 0;
    const diZhiCang = wuXingDetails.diZhiCang || 0;
    const naYin = wuXingDetails.naYin || 0;
    const season = wuXingDetails.season || 0;
    const combination = wuXingDetails.combination || 0;
    const total = wuXingDetails.total || currentWuXingValue;

    // 构建详细计算过程
    let calculation = `${wuXing}五行强度实际计算过程：\n\n`;

    // 基础分数
    calculation += `【基础分数】\n`;
    calculation += `- 天干贡献：${tianGan.toFixed(2)}分\n`;
    calculation += `- 地支贡献：${diZhi.toFixed(2)}分\n`;
    calculation += `- 地支藏干贡献：${diZhiCang.toFixed(2)}分\n`;
    calculation += `- 纳音贡献：${naYin.toFixed(2)}分\n`;

    // 季节调整
    calculation += `\n【季节调整】\n`;
    const seasonValue = season;
    if (seasonValue > 0) {
      calculation += `- 季节加成：+${seasonValue.toFixed(2)}分（当季五行得到加强）\n`;
    } else if (seasonValue < 0) {
      calculation += `- 季节减弱：${seasonValue.toFixed(2)}分（非当季五行受到抑制）\n`;
    } else {
      calculation += `- 季节影响：0.00分（该五行在当前季节处于平衡状态）\n`;
    }

    // 组合调整
    calculation += `\n【组合调整】\n`;
    if (combination > 0) {
      calculation += `- 组合关系：${combination.toFixed(2)}分\n`;
    } else {
      calculation += `- 组合关系贡献：0.00分（八字中无${wuXing}相关的天干五合或地支三合三会）\n`;
    }

    // 总分计算
    const totalScore = tianGan + diZhi + diZhiCang + naYin + seasonValue + combination;
    calculation += `\n【总分计算】\n`;
    calculation += `- ${wuXing}五行总得分：${totalScore.toFixed(2)}分\n`;
    calculation += `- 所有五行总得分：${total.toFixed(2)}分\n`;

    // 计算相对强度
    const relativeStrength = total > 0 ? (currentWuXingValue / total * 10) : 0;
    calculation += `- ${wuXing}五行相对强度：${currentWuXingValue.toFixed(2)} / ${total.toFixed(2)} * 10 = ${relativeStrength.toFixed(2)}\n`;

    // 强度评价
    calculation += `\n【强度评价】\n`;
    if (relativeStrength >= 3.0) {
      calculation += `- ${wuXing}五行偏强，在命局中占主导地位\n`;
    } else if (relativeStrength >= 2.0) {
      calculation += `- ${wuXing}五行适中，在命局中有一定影响力\n`;
    } else if (relativeStrength >= 1.0) {
      calculation += `- ${wuXing}五行偏弱，在命局中影响力较小\n`;
    } else {
      calculation += `- ${wuXing}五行很弱，在命局中几乎没有影响力\n`;
    }

    return calculation;
  }

  /**
   * 获取日主旺衰计算过程的详细说明
   * @param baziInfo 八字信息
   * @returns 详细计算过程说明
   */
  static getRiZhuStrengthExplanation(baziInfo: BaziInfo): string {
    if (!baziInfo.riZhuStrengthDetails) {
      return '无法获取日主旺衰详细信息。';
    }

    const wuXing = baziInfo.dayWuXing || '未知';
    const details = baziInfo.riZhuStrengthDetails;

    // 构建计算过程
    let calculation = `日主旺衰实际计算过程：\n\n`;

    // 基本信息
    calculation += `【基本信息】\n`;
    calculation += `- 日主五行：${wuXing.charAt(0)}\n`;  // 只取第一个字符，避免显示"火火"
    calculation += `- 所处季节：${details.season || '未知'}\n\n`;

    // 五行强度分析
    calculation += `【五行强度分析】\n`;
    if (baziInfo.wuXingStrength) {
      const wuXingStrength = baziInfo.wuXingStrength as any;
      calculation += `- 金五行强度：${wuXingStrength.jin.toFixed(2)}\n`;
      calculation += `- 木五行强度：${wuXingStrength.mu.toFixed(2)}\n`;
      calculation += `- 水五行强度：${wuXingStrength.shui.toFixed(2)}\n`;
      calculation += `- 火五行强度：${wuXingStrength.huo.toFixed(2)}\n`;
      calculation += `- 土五行强度：${wuXingStrength.tu.toFixed(2)}\n\n`;
    }

    // 日主强度计算
    calculation += `【日主强度计算】\n`;
    calculation += `- 日主五行强度：${details.dayWuXingStrength?.toFixed(2) || '未知'}\n`;
    calculation += `- 其他五行总强度：${details.otherWuXingStrength?.toFixed(2) || '未知'}\n`;
    calculation += `- 日主相对强度：${details.relativeStrength?.toFixed(2) || '未知'}\n\n`;

    // 旺衰判断
    calculation += `【旺衰判断】\n`;
    const riZhuStrength = baziInfo.riZhuStrength || '未知';
    calculation += `- 判断结果：${riZhuStrength}\n`;

    // 判断标准说明
    calculation += `\n【判断标准】\n`;
    calculation += `- 太旺：相对强度 ≥ 4.5\n`;
    calculation += `- 偏旺：相对强度 ≥ 3.5\n`;
    calculation += `- 中和：1.5 < 相对强度 < 3.5\n`;
    calculation += `- 偏弱：相对强度 ≤ 1.5\n`;
    calculation += `- 太弱：相对强度 ≤ 0.5\n`;

    return calculation;
  }

  /**
   * 检查天干五合
   * @param baziInfo 八字信息
   * @returns 五合组合
   */
  static checkTianGanWuHe(baziInfo: BaziInfo): string {
    const { yearStem, monthStem, dayStem, timeStem } = baziInfo;
    const stems = [yearStem, monthStem, dayStem, timeStem];

    // 检查五合
    if (stems.includes('甲') && stems.includes('己')) return '甲己';
    if (stems.includes('乙') && stems.includes('庚')) return '乙庚';
    if (stems.includes('丙') && stems.includes('辛')) return '丙辛';
    if (stems.includes('丁') && stems.includes('壬')) return '丁壬';
    if (stems.includes('戊') && stems.includes('癸')) return '戊癸';

    return '';
  }

  /**
   * 获取五合对应的五行
   * @param wuHe 五合组合
   * @returns 五行
   */
  static getWuXingFromWuHe(wuHe: string): string {
    const map: {[key: string]: string} = {
      '甲己': '土',
      '乙庚': '金',
      '丙辛': '水',
      '丁壬': '木',
      '戊癸': '火'
    };
    return map[wuHe] || '';
  }

  /**
   * 计算五行强度（使用现有的计算器）
   * @param yearStem 年干
   * @param yearBranch 年支
   * @param monthStem 月干
   * @param monthBranch 月支
   * @param dayStem 日干
   * @param dayBranch 日支
   * @param timeStem 时干
   * @param timeBranch 时支
   * @returns 五行强度结果
   */
  static calculateWuXingStrength(
    yearStem: string, yearBranch: string,
    monthStem: string, monthBranch: string,
    dayStem: string, dayBranch: string,
    timeStem: string, timeBranch: string
  ): any {
    return WuXingStrengthCalculator.calculateWuXingStrengthFromBazi(
      yearStem, yearBranch, monthStem, monthBranch,
      dayStem, dayBranch, timeStem, timeBranch
    );
  }

  /**
   * 计算日主旺衰（使用现有的计算器）
   * @param wuXingStrength 五行强度结果
   * @param dayStem 日干
   * @returns 日主旺衰结果
   */
  static calculateRiZhuStrength(wuXingStrength: any, dayStem: string): any {
    return WuXingStrengthCalculator.calculateRiZhuStrengthFromWuXing(wuXingStrength, dayStem);
  }
}
