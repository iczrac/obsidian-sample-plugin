/**
 * 格局判断服务类
 * 提供更复杂的格局判断逻辑，包括组合格局判断、格局优先级判断等
 */
import { BaziInfo } from '../types/BaziInfo';

/**
 * 格局判断结果接口
 */
export interface GeJuJudgeResult {
  // 主格局
  mainGeJu: string;
  // 主格局详情
  mainGeJuDetail: string;
  // 主格局强度（0-100）
  mainGeJuStrength: number;
  // 辅助格局列表
  assistGeJuList: {
    geJu: string;
    detail: string;
    strength: number;
  }[];
  // 用神
  yongShen: string;
  // 用神详情
  yongShenDetail: string;
  // 格局形成因素
  factors: {
    factor: string;
    description: string;
    contribution: number;
  }[];
}

/**
 * 格局优先级配置
 */
export interface GeJuPriorityConfig {
  // 格局名称
  geJu: string;
  // 基础优先级（1-10，数字越大优先级越高）
  basePriority: number;
  // 日主旺衰条件（如果符合则增加优先级）
  riZhuCondition?: {
    states: string[];
    priorityBonus: number;
  };
  // 月令条件（如果符合则增加优先级）
  monthCondition?: {
    branches: string[];
    priorityBonus: number;
  };
}

export class GeJuJudgeService {
  /**
   * 格局优先级配置
   * 用于在多个格局同时存在时确定主导格局
   */
  private static geJuPriorityConfig: GeJuPriorityConfig[] = [
    {
      geJu: '财官双美格',
      basePriority: 10,
      riZhuCondition: {
        states: ['平衡', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '伤官佩印格',
      basePriority: 9,
      riZhuCondition: {
        states: ['平衡'],
        priorityBonus: 2
      }
    },
    {
      geJu: '日元建禄格',
      basePriority: 8,
      monthCondition: {
        branches: ['寅', '巳', '申', '亥'],
        priorityBonus: 2
      }
    },
    {
      geJu: '日元建元格',
      basePriority: 8,
      monthCondition: {
        branches: ['子', '卯', '午', '酉'],
        priorityBonus: 2
      }
    },
    {
      geJu: '从旺格',
      basePriority: 7,
      riZhuCondition: {
        states: ['极旺', '旺'],
        priorityBonus: 3
      }
    },
    {
      geJu: '从弱格',
      basePriority: 7,
      riZhuCondition: {
        states: ['极弱', '弱'],
        priorityBonus: 3
      }
    },
    {
      geJu: '七杀格',
      basePriority: 6,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '正官格',
      basePriority: 6,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '偏财格',
      basePriority: 5,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '正财格',
      basePriority: 5,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '食神格',
      basePriority: 5,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '伤官格',
      basePriority: 5,
      riZhuCondition: {
        states: ['旺', '极旺', '偏旺'],
        priorityBonus: 2
      }
    },
    {
      geJu: '正印格',
      basePriority: 4,
      riZhuCondition: {
        states: ['弱', '极弱', '偏弱'],
        priorityBonus: 2
      }
    },
    {
      geJu: '偏印格',
      basePriority: 4,
      riZhuCondition: {
        states: ['弱', '极弱', '偏弱'],
        priorityBonus: 2
      }
    },
    {
      geJu: '印绶格',
      basePriority: 4,
      riZhuCondition: {
        states: ['弱', '极弱', '偏弱'],
        priorityBonus: 2
      }
    },
    {
      geJu: '比肩格',
      basePriority: 3,
      riZhuCondition: {
        states: ['弱', '极弱', '偏弱'],
        priorityBonus: 2
      }
    },
    {
      geJu: '劫财格',
      basePriority: 3,
      riZhuCondition: {
        states: ['弱', '极弱', '偏弱'],
        priorityBonus: 2
      }
    },
    {
      geJu: '专旺格',
      basePriority: 3,
      riZhuCondition: {
        states: ['极旺'],
        priorityBonus: 3
      }
    },
    {
      geJu: '杂气格',
      basePriority: 1
    }
  ];

  /**
   * 判断八字格局
   * @param baziInfo 八字信息
   * @returns 格局判断结果
   */
  public static judgeGeJu(baziInfo: BaziInfo): GeJuJudgeResult {
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

    // 检查必要信息是否存在
    if (!baziInfo.dayStem || !baziInfo.dayWuXing || !baziInfo.riZhuStrength) {
      result.mainGeJu = '信息不足';
      result.mainGeJuDetail = '无法判断格局，缺少必要的八字信息。';
      return result;
    }

    // 1. 判断各种可能的格局及其强度
    const possibleGeJuList = this.judgePossibleGeJu(baziInfo);

    // 2. 根据优先级和强度确定主格局和辅助格局
    const { mainGeJu, assistGeJuList } = this.determineMainGeJu(possibleGeJuList, baziInfo);

    // 3. 确定用神
    const { yongShen, yongShenDetail } = this.determineYongShen(mainGeJu, baziInfo);

    // 4. 收集格局形成的关键因素
    const factors = this.collectGeJuFactors(mainGeJu, baziInfo);

    // 设置结果
    result.mainGeJu = mainGeJu.geJu;
    result.mainGeJuDetail = mainGeJu.detail;
    result.mainGeJuStrength = mainGeJu.strength;
    result.assistGeJuList = assistGeJuList;
    result.yongShen = yongShen;
    result.yongShenDetail = yongShenDetail;
    result.factors = factors;

    return result;
  }

  /**
   * 判断可能的格局列表
   * @param baziInfo 八字信息
   * @returns 可能的格局列表
   */
  private static judgePossibleGeJu(baziInfo: BaziInfo): {
    geJu: string;
    detail: string;
    strength: number;
    priority: number;
  }[] {
    const possibleGeJuList: {
      geJu: string;
      detail: string;
      strength: number;
      priority: number;
    }[] = [];

    // 获取基本信息
    const dayStem = baziInfo.dayStem || '';
    const dayBranch = baziInfo.dayBranch || '';
    const dayWuXing = baziInfo.dayWuXing || '';
    const riZhuStrength = baziInfo.riZhuStrength || '平衡';
    const monthBranch = baziInfo.monthBranch || '';

    // 获取十神信息
    const yearShiShenGan = baziInfo.yearShiShenGan || '';
    const monthShiShenGan = baziInfo.monthShiShenGan || '';
    const timeShiShenGan = baziInfo.timeShiShenGan || '';

    // 获取地支藏干十神信息
    const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
    const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
    const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
    const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);

    // 1. 判断特殊格局

    // 1.1 财官双美格
    if (this.hasShiShen(['正财', '偏财'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]) &&
        this.hasShiShen(['正官', '七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {

      // 计算财星和官星的强度
      const caiStrength = this.calculateShiShenStrength(['正财', '偏财'], baziInfo);
      const guanStrength = this.calculateShiShenStrength(['正官', '七杀'], baziInfo);

      // 财官双美格需要财星和官星都较强
      if (caiStrength >= 2 && guanStrength >= 2) {
        const strength = Math.min(85, 60 + (caiStrength + guanStrength) * 5);
        const priority = this.getGeJuPriority('财官双美格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '财官双美格',
          detail: '八字中财星和官星都旺盛有力，且日主适中，能够承受财官之力，为财官双美格。',
          strength,
          priority
        });
      }
    }

    // 1.2 伤官佩印格
    if (this.hasShiShen(['伤官'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]) &&
        this.hasShiShen(['正印', '偏印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {

      // 计算伤官和印星的强度
      const shangGuanStrength = this.calculateShiShenStrength(['伤官'], baziInfo);
      const yinStrength = this.calculateShiShenStrength(['正印', '偏印'], baziInfo);

      // 伤官佩印格需要伤官和印星都较强
      if (shangGuanStrength >= 2 && yinStrength >= 2) {
        const strength = Math.min(85, 60 + (shangGuanStrength + yinStrength) * 5);
        const priority = this.getGeJuPriority('伤官佩印格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '伤官佩印格',
          detail: '八字中同时有伤官和印星，且两者力量均衡，相互制约，为伤官佩印格。',
          strength,
          priority
        });
      }
    }

    // 1.3 日元建禄格
    if (this.isDayElementBuildLu(dayStem, monthBranch)) {
      const strength = 80;
      const priority = this.getGeJuPriority('日元建禄格', riZhuStrength, monthBranch);

      possibleGeJuList.push({
        geJu: '日元建禄格',
        detail: '日主天干与所处月令地支构成建禄关系，为日元建禄格。',
        strength,
        priority
      });
    }

    // 1.4 日元建元格
    if (this.isDayElementBuildYuan(dayStem, monthBranch)) {
      const strength = 75;
      const priority = this.getGeJuPriority('日元建元格', riZhuStrength, monthBranch);

      possibleGeJuList.push({
        geJu: '日元建元格',
        detail: '日主天干与所处月令地支构成建元关系，为日元建元格。',
        strength,
        priority
      });
    }

    // 1.5 从旺格
    if (riZhuStrength === '极旺' || riZhuStrength === '旺') {
      const biJianCount = this.countShiShen(['比肩', '劫财'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]);

      if (biJianCount >= 3) {
        const strength = Math.min(90, 70 + biJianCount * 5);
        const priority = this.getGeJuPriority('从旺格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '从旺格',
          detail: '日主极旺，且有多个比劫帮扶，为从旺格。',
          strength,
          priority
        });
      }
    }

    // 1.6 从弱格
    if (riZhuStrength === '极弱' || riZhuStrength === '弱') {
      const guanShaCount = this.countShiShen(['正官', '七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]);

      if (guanShaCount >= 3) {
        const strength = Math.min(90, 70 + guanShaCount * 5);
        const priority = this.getGeJuPriority('从弱格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '从弱格',
          detail: '日主极弱，且有多个官杀克制，为从弱格。',
          strength,
          priority
        });
      }
    }

    // 2. 判断基本格局

    // 2.1 正印格
    if (this.hasShiShen(['正印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
      const yinStrength = this.calculateShiShenStrength(['正印'], baziInfo);

      if (yinStrength >= 2) {
        let strength = 0;

        // 根据日主旺衰调整强度
        if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
          strength = Math.min(80, 60 + yinStrength * 5);
        } else {
          strength = Math.min(60, 40 + yinStrength * 5);
        }

        const priority = this.getGeJuPriority('正印格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '正印格',
          detail: '八字中正印星当令或有力，且日主偏弱，取正印为用神，为正印格。',
          strength,
          priority
        });
      }
    }

    // 2.2 偏印格
    if (this.hasShiShen(['偏印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
      const yinStrength = this.calculateShiShenStrength(['偏印'], baziInfo);

      if (yinStrength >= 2) {
        let strength = 0;

        // 根据日主旺衰调整强度
        if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
          strength = Math.min(80, 60 + yinStrength * 5);
        } else {
          strength = Math.min(60, 40 + yinStrength * 5);
        }

        const priority = this.getGeJuPriority('偏印格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '偏印格',
          detail: '八字中偏印星当令或有力，且日主偏弱，取偏印为用神，为偏印格。',
          strength,
          priority
        });
      }
    }

    // 2.3 正官格
    if (this.hasShiShen(['正官'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
      const guanStrength = this.calculateShiShenStrength(['正官'], baziInfo);

      if (guanStrength >= 2) {
        let strength = 0;

        // 根据日主旺衰调整强度
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          strength = Math.min(80, 60 + guanStrength * 5);
        } else {
          strength = Math.min(60, 40 + guanStrength * 5);
        }

        const priority = this.getGeJuPriority('正官格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '正官格',
          detail: '八字中正官星当令或有力，且日主旺盛，取正官为用神，为正官格。',
          strength,
          priority
        });
      }
    }

    // 2.4 七杀格
    if (this.hasShiShen(['七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
      const shaStrength = this.calculateShiShenStrength(['七杀'], baziInfo);

      if (shaStrength >= 2) {
        let strength = 0;

        // 根据日主旺衰调整强度
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          strength = Math.min(80, 60 + shaStrength * 5);
        } else {
          strength = Math.min(60, 40 + shaStrength * 5);
        }

        const priority = this.getGeJuPriority('七杀格', riZhuStrength, monthBranch);

        possibleGeJuList.push({
          geJu: '七杀格',
          detail: '八字中七杀星当令或有力，且日主旺盛，取七杀为用神，为七杀格。',
          strength,
          priority
        });
      }
    }

    // 如果没有找到任何格局，添加杂气格
    if (possibleGeJuList.length === 0) {
      const priority = this.getGeJuPriority('杂气格', riZhuStrength, monthBranch);

      possibleGeJuList.push({
        geJu: '杂气格',
        detail: '八字中无明显格局特征，为杂气格。',
        strength: 60,
        priority
      });
    }

    return possibleGeJuList;
  }

  /**
   * 标准化十神地支信息
   * @param shiShenZhi 十神地支信息
   * @returns 标准化后的十神地支数组
   */
  private static normalizeShiShenZhi(shiShenZhi: string | string[] | undefined): string[] {
    if (!shiShenZhi) {
      return [];
    }

    if (typeof shiShenZhi === 'string') {
      return [shiShenZhi];
    }

    return shiShenZhi;
  }

  /**
   * 检查是否包含指定十神
   * @param targetShiShen 目标十神数组
   * @param shiShenList 十神列表
   * @returns 是否包含
   */
  private static hasShiShen(targetShiShen: string[], shiShenList: string[]): boolean {
    return shiShenList.some(shiShen => targetShiShen.includes(shiShen));
  }

  /**
   * 计算指定十神的数量
   * @param targetShiShen 目标十神数组
   * @param shiShenList 十神列表
   * @returns 数量
   */
  private static countShiShen(targetShiShen: string[], shiShenList: string[]): number {
    return shiShenList.filter(shiShen => targetShiShen.includes(shiShen)).length;
  }

  /**
   * 计算指定十神的强度
   * @param targetShiShen 目标十神数组
   * @param baziInfo 八字信息
   * @returns 强度
   */
  private static calculateShiShenStrength(targetShiShen: string[], baziInfo: BaziInfo): number {
    let strength = 0;

    // 获取十神信息
    const yearShiShenGan = baziInfo.yearShiShenGan || '';
    const monthShiShenGan = baziInfo.monthShiShenGan || '';
    const timeShiShenGan = baziInfo.timeShiShenGan || '';

    // 获取地支藏干十神信息
    const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
    const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
    const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
    const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);

    // 天干十神
    if (targetShiShen.includes(yearShiShenGan)) strength += 1;
    if (targetShiShen.includes(monthShiShenGan)) strength += 2; // 月令加倍
    if (targetShiShen.includes(timeShiShenGan)) strength += 1;

    // 地支藏干十神
    yearShiShenZhi.forEach(shiShen => {
      if (targetShiShen.includes(shiShen)) strength += 0.5;
    });

    monthShiShenZhi.forEach(shiShen => {
      if (targetShiShen.includes(shiShen)) strength += 1; // 月令加倍
    });

    dayShiShenZhi.forEach(shiShen => {
      if (targetShiShen.includes(shiShen)) strength += 0.5;
    });

    hourShiShenZhi.forEach(shiShen => {
      if (targetShiShen.includes(shiShen)) strength += 0.5;
    });

    return strength;
  }

  /**
   * 判断日元是否建禄
   * @param dayStem 日干
   * @param monthBranch 月支
   * @returns 是否建禄
   */
  private static isDayElementBuildLu(dayStem: string, monthBranch: string): boolean {
    const buildLuMap: {[key: string]: string} = {
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

    return buildLuMap[dayStem] === monthBranch;
  }

  /**
   * 判断日元是否建元
   * @param dayStem 日干
   * @param monthBranch 月支
   * @returns 是否建元
   */
  private static isDayElementBuildYuan(dayStem: string, monthBranch: string): boolean {
    const buildYuanMap: {[key: string]: string} = {
      '甲': '子',
      '乙': '丑',
      '丙': '寅',
      '丁': '卯',
      '戊': '辰',
      '己': '巳',
      '庚': '午',
      '辛': '未',
      '壬': '申',
      '癸': '酉'
    };

    return buildYuanMap[dayStem] === monthBranch;
  }

  /**
   * 获取格局优先级
   * @param geJu 格局名称
   * @param riZhuStrength 日主旺衰
   * @param monthBranch 月支
   * @returns 优先级
   */
  private static getGeJuPriority(geJu: string, riZhuStrength: string, monthBranch: string): number {
    // 查找格局配置
    const config = this.geJuPriorityConfig.find(item => item.geJu === geJu);

    if (!config) {
      return 1; // 默认最低优先级
    }

    let priority = config.basePriority;

    // 检查日主旺衰条件
    if (config.riZhuCondition && config.riZhuCondition.states.includes(riZhuStrength)) {
      priority += config.riZhuCondition.priorityBonus;
    }

    // 检查月令条件
    if (config.monthCondition && config.monthCondition.branches.includes(monthBranch)) {
      priority += config.monthCondition.priorityBonus;
    }

    return priority;
  }

  /**
   * 确定主格局和辅助格局
   * @param possibleGeJuList 可能的格局列表
   * @param baziInfo 八字信息
   * @returns 主格局和辅助格局
   */
  private static determineMainGeJu(
    possibleGeJuList: {
      geJu: string;
      detail: string;
      strength: number;
      priority: number;
    }[],
    baziInfo: BaziInfo
  ): {
    mainGeJu: {
      geJu: string;
      detail: string;
      strength: number;
    };
    assistGeJuList: {
      geJu: string;
      detail: string;
      strength: number;
    }[];
  } {
    // 如果没有可能的格局，返回杂气格
    if (possibleGeJuList.length === 0) {
      return {
        mainGeJu: {
          geJu: '杂气格',
          detail: '八字中无明显格局特征，为杂气格。',
          strength: 60
        },
        assistGeJuList: []
      };
    }

    // 按优先级和强度排序
    const sortedGeJuList = [...possibleGeJuList].sort((a, b) => {
      // 首先按优先级排序
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 其次按强度排序
      return b.strength - a.strength;
    });

    // 主格局是排序后的第一个
    const mainGeJu = {
      geJu: sortedGeJuList[0].geJu,
      detail: sortedGeJuList[0].detail,
      strength: sortedGeJuList[0].strength
    };

    // 辅助格局是排序后的其余格局
    const assistGeJuList = sortedGeJuList.slice(1).map(geJu => ({
      geJu: geJu.geJu,
      detail: geJu.detail,
      strength: geJu.strength
    }));

    return {
      mainGeJu,
      assistGeJuList
    };
  }

  /**
   * 确定用神
   * @param mainGeJu 主格局
   * @param baziInfo 八字信息
   * @returns 用神和用神详情
   */
  private static determineYongShen(
    mainGeJu: {
      geJu: string;
      detail: string;
      strength: number;
    },
    baziInfo: BaziInfo
  ): {
    yongShen: string;
    yongShenDetail: string;
  } {
    // 获取日主旺衰
    const riZhuStrength = baziInfo.riZhuStrength || '平衡';

    // 根据格局名称和日主旺衰确定用神
    switch (mainGeJu.geJu) {
      case '正印格':
      case '偏印格':
      case '印绶格':
        return {
          yongShen: '印星',
          yongShenDetail: '八字中印星当令或有力，且日主偏弱，取印星为用神，印星生助日主，增强日主力量。'
        };

      case '正官格':
      case '七杀格':
        return {
          yongShen: '官杀',
          yongShenDetail: '八字中官杀当令或有力，且日主旺盛，取官杀为用神，官杀克制日主，泄秀日主之气。'
        };

      case '正财格':
      case '偏财格':
        return {
          yongShen: '财星',
          yongShenDetail: '八字中财星当令或有力，且日主旺盛，取财星为用神，财星为日主所生，泄秀日主之气。'
        };

      case '食神格':
      case '伤官格':
        return {
          yongShen: '食伤',
          yongShenDetail: '八字中食伤当令或有力，且日主旺盛，取食伤为用神，食伤为日主所生，泄秀日主之气。'
        };

      case '比肩格':
      case '劫财格':
        return {
          yongShen: '比劫',
          yongShenDetail: '八字中比劫当令或有力，且日主偏弱，取比劫为用神，比劫与日主同气相助，增强日主力量。'
        };

      case '财官双美格':
        return {
          yongShen: '财官',
          yongShenDetail: '八字中财星和官星都旺盛有力，且日主适中，能够承受财官之力，取财官为用神，财官相生相助，形成良好格局。'
        };

      case '伤官佩印格':
        return {
          yongShen: '伤官印',
          yongShenDetail: '八字中同时有伤官和印星，且两者力量均衡，相互制约，取伤官印为用神，伤官代表才华创新，印星代表学问文凭，两者相互制约，形成良好平衡。'
        };

      case '从旺格':
        return {
          yongShen: '比劫',
          yongShenDetail: '日主极旺，且有多个比劫帮扶，顺从日主之旺，取比劫为用神，比劫与日主同气相助，增强日主力量。'
        };

      case '从弱格':
        return {
          yongShen: '官杀',
          yongShenDetail: '日主极弱，且有多个官杀克制，顺从日主之弱，取官杀为用神，官杀克制日主，使日主更加衰弱。'
        };

      case '日元建禄格':
      case '日元建元格':
        return {
          yongShen: '日元',
          yongShenDetail: '日主与月令地支构成特殊关系，日主得令，根基稳固，取日元为用神，充分发挥日主的优势。'
        };

      case '杂气格':
        // 根据日主旺衰确定用神
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          return {
            yongShen: '财官食伤',
            yongShenDetail: '八字中无明显格局特征，日主偏旺，取财官食伤为用神，泄秀日主之气，使八字趋于平衡。'
          };
        } else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
          return {
            yongShen: '印比劫',
            yongShenDetail: '八字中无明显格局特征，日主偏弱，取印比劫为用神，生助日主之气，使八字趋于平衡。'
          };
        } else {
          return {
            yongShen: '月令当令',
            yongShenDetail: '八字中无明显格局特征，日主平衡，取月令当令五行为用神，顺应自然之势。'
          };
        }

      default:
        return {
          yongShen: '',
          yongShenDetail: '无法确定用神，请咨询专业命理师。'
        };
    }
  }

  /**
   * 收集格局形成的关键因素
   * @param mainGeJu 主格局
   * @param baziInfo 八字信息
   * @returns 格局形成的关键因素
   */
  private static collectGeJuFactors(
    mainGeJu: {
      geJu: string;
      detail: string;
      strength: number;
    },
    baziInfo: BaziInfo
  ): {
    factor: string;
    description: string;
    contribution: number;
  }[] {
    const factors: {
      factor: string;
      description: string;
      contribution: number;
    }[] = [];

    // 获取基本信息
    const dayStem = baziInfo.dayStem || '';
    const dayBranch = baziInfo.dayBranch || '';
    const dayWuXing = baziInfo.dayWuXing || '';
    const riZhuStrength = baziInfo.riZhuStrength || '平衡';
    const monthBranch = baziInfo.monthBranch || '';

    // 1. 日主旺衰是重要因素
    factors.push({
      factor: '日主旺衰',
      description: `日主${riZhuStrength}，${this.getRiZhuDescription(riZhuStrength)}`,
      contribution: 25
    });

    // 2. 月令当令是重要因素
    factors.push({
      factor: '月令',
      description: `月支为${monthBranch}，${this.getMonthDescription(monthBranch, dayWuXing)}`,
      contribution: 20
    });

    // 3. 根据格局类型添加特定因素
    switch (mainGeJu.geJu) {
      case '正印格':
      case '偏印格':
      case '印绶格':
        // 添加印星因素
        this.addShiShenFactors(['正印', '偏印'], baziInfo, factors);
        break;

      case '正官格':
      case '七杀格':
        // 添加官杀因素
        this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
        break;

      case '正财格':
      case '偏财格':
        // 添加财星因素
        this.addShiShenFactors(['正财', '偏财'], baziInfo, factors);
        break;

      case '食神格':
      case '伤官格':
        // 添加食伤因素
        this.addShiShenFactors(['食神', '伤官'], baziInfo, factors);
        break;

      case '比肩格':
      case '劫财格':
        // 添加比劫因素
        this.addShiShenFactors(['比肩', '劫财'], baziInfo, factors);
        break;

      case '财官双美格':
        // 添加财星和官星因素
        this.addShiShenFactors(['正财', '偏财'], baziInfo, factors);
        this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
        break;

      case '伤官佩印格':
        // 添加伤官和印星因素
        this.addShiShenFactors(['伤官'], baziInfo, factors);
        this.addShiShenFactors(['正印', '偏印'], baziInfo, factors);
        break;

      case '从旺格':
        // 添加比劫因素
        this.addShiShenFactors(['比肩', '劫财'], baziInfo, factors);
        break;

      case '从弱格':
        // 添加官杀因素
        this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
        break;

      case '日元建禄格':
        // 添加建禄因素
        factors.push({
          factor: '建禄',
          description: `日主${dayStem}在月支${monthBranch}建禄，日主根基稳固，得令有力。`,
          contribution: 30
        });
        break;

      case '日元建元格':
        // 添加建元因素
        factors.push({
          factor: '建元',
          description: `日主${dayStem}在月支${monthBranch}建元，日主根基稳固，得令有力。`,
          contribution: 30
        });
        break;
    }

    // 4. 添加纳音五行因素
    if (baziInfo.dayNaYin) {
      factors.push({
        factor: '纳音五行',
        description: `日柱纳音为${baziInfo.dayNaYin}，对格局形成有一定影响。`,
        contribution: 10
      });
    }

    // 5. 添加三合局因素
    const sanHeJu = this.checkSanHeJu(baziInfo);
    if (sanHeJu) {
      factors.push({
        factor: '三合局',
        description: sanHeJu,
        contribution: 15
      });
    }

    // 6. 添加三会局因素
    const sanHuiJu = this.checkSanHuiJu(baziInfo);
    if (sanHuiJu) {
      factors.push({
        factor: '三会局',
        description: sanHuiJu,
        contribution: 15
      });
    }

    return factors;
  }

  /**
   * 获取日主旺衰描述
   * @param riZhuStrength 日主旺衰
   * @returns 描述
   */
  private static getRiZhuDescription(riZhuStrength: string): string {
    switch (riZhuStrength) {
      case '极旺':
        return '日主力量极其旺盛，需要泄秀之物来平衡。';
      case '旺':
        return '日主力量旺盛，需要泄秀之物来平衡。';
      case '偏旺':
        return '日主力量较为旺盛，需要适当泄秀。';
      case '平衡':
        return '日主力量适中，八字较为平衡。';
      case '偏弱':
        return '日主力量较为衰弱，需要适当扶助。';
      case '弱':
        return '日主力量衰弱，需要扶助之物来增强。';
      case '极弱':
        return '日主力量极其衰弱，需要大量扶助之物来增强。';
      default:
        return '日主旺衰状态不明。';
    }
  }

  /**
   * 获取月令描述
   * @param monthBranch 月支
   * @param dayWuXing 日主五行
   * @returns 描述
   */
  private static getMonthDescription(monthBranch: string, dayWuXing: string): string {
    // 定义月支所属季节
    const seasonMap: {[key: string]: string} = {
      '寅': '春季',
      '卯': '春季',
      '辰': '春季',
      '巳': '夏季',
      '午': '夏季',
      '未': '夏季',
      '申': '秋季',
      '酉': '秋季',
      '戌': '秋季',
      '亥': '冬季',
      '子': '冬季',
      '丑': '冬季'
    };

    // 定义月支所属五行
    const branchWuXingMap: {[key: string]: string} = {
      '寅': '木',
      '卯': '木',
      '辰': '土',
      '巳': '火',
      '午': '火',
      '未': '土',
      '申': '金',
      '酉': '金',
      '戌': '土',
      '亥': '水',
      '子': '水',
      '丑': '土'
    };

    // 获取月支所属季节和五行
    const season = seasonMap[monthBranch] || '未知季节';
    const monthWuXing = branchWuXingMap[monthBranch] || '未知五行';

    // 判断月令对日主的影响
    let influence = '';
    if (this.isWuXingSheng(monthWuXing, dayWuXing)) {
      influence = `${monthWuXing}生${dayWuXing}，对日主有生助作用。`;
    } else if (this.isWuXingKe(monthWuXing, dayWuXing)) {
      influence = `${monthWuXing}克${dayWuXing}，对日主有克制作用。`;
    } else if (this.isWuXingSheng(dayWuXing, monthWuXing)) {
      influence = `${dayWuXing}生${monthWuXing}，日主泄气。`;
    } else if (this.isWuXingKe(dayWuXing, monthWuXing)) {
      influence = `${dayWuXing}克${monthWuXing}，日主耗气。`;
    } else if (monthWuXing === dayWuXing) {
      influence = `与日主同气，对日主有帮扶作用。`;
    }

    return `属于${season}，五行属${monthWuXing}，${influence}`;
  }

  /**
   * 添加十神因素
   * @param targetShiShen 目标十神数组
   * @param baziInfo 八字信息
   * @param factors 因素数组
   */
  private static addShiShenFactors(
    targetShiShen: string[],
    baziInfo: BaziInfo,
    factors: {
      factor: string;
      description: string;
      contribution: number;
    }[]
  ): void {
    // 获取十神信息
    const yearShiShenGan = baziInfo.yearShiShenGan || '';
    const monthShiShenGan = baziInfo.monthShiShenGan || '';
    const timeShiShenGan = baziInfo.timeShiShenGan || '';

    // 获取地支藏干十神信息
    const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
    const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
    const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
    const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);

    // 检查年干
    if (targetShiShen.includes(yearShiShenGan)) {
      factors.push({
        factor: `年干${yearShiShenGan}`,
        description: `年干为${yearShiShenGan}，对格局形成有贡献。`,
        contribution: 10
      });
    }

    // 检查月干
    if (targetShiShen.includes(monthShiShenGan)) {
      factors.push({
        factor: `月干${monthShiShenGan}`,
        description: `月干为${monthShiShenGan}，月令当令，对格局形成贡献较大。`,
        contribution: 20
      });
    }

    // 检查时干
    if (targetShiShen.includes(timeShiShenGan)) {
      factors.push({
        factor: `时干${timeShiShenGan}`,
        description: `时干为${timeShiShenGan}，对格局形成有贡献。`,
        contribution: 10
      });
    }

    // 检查地支藏干
    const zhiFactors: {branch: string; shiShen: string[]}[] = [
      { branch: '年支', shiShen: yearShiShenZhi.filter(s => targetShiShen.includes(s)) },
      { branch: '月支', shiShen: monthShiShenZhi.filter(s => targetShiShen.includes(s)) },
      { branch: '日支', shiShen: dayShiShenZhi.filter(s => targetShiShen.includes(s)) },
      { branch: '时支', shiShen: hourShiShenZhi.filter(s => targetShiShen.includes(s)) }
    ];

    zhiFactors.forEach(factor => {
      if (factor.shiShen.length > 0) {
        factors.push({
          factor: `${factor.branch}藏干`,
          description: `${factor.branch}藏干中有${factor.shiShen.join('、')}，对格局形成有辅助作用。`,
          contribution: factor.branch === '月支' ? 15 : 8
        });
      }
    });
  }

  /**
   * 检查三合局
   * @param baziInfo 八字信息
   * @returns 三合局描述
   */
  private static checkSanHeJu(baziInfo: BaziInfo): string | null {
    const branches = [
      baziInfo.yearBranch || '',
      baziInfo.monthBranch || '',
      baziInfo.dayBranch || '',
      baziInfo.hourBranch || ''
    ].filter(branch => branch !== '');

    // 定义三合局
    const sanHeJuList = [
      { name: '寅午戌三合火局', branches: ['寅', '午', '戌'], wuXing: '火' },
      { name: '申子辰三合水局', branches: ['申', '子', '辰'], wuXing: '水' },
      { name: '亥卯未三合木局', branches: ['亥', '卯', '未'], wuXing: '木' },
      { name: '巳酉丑三合金局', branches: ['巳', '酉', '丑'], wuXing: '金' }
    ];

    // 检查是否有三合局
    for (const sanHeJu of sanHeJuList) {
      const matchCount = sanHeJu.branches.filter(branch => branches.includes(branch)).length;

      if (matchCount >= 2) {
        return `八字中有${sanHeJu.branches.filter(branch => branches.includes(branch)).join('、')}，形成${matchCount === 3 ? '完整' : '部分'}${sanHeJu.name}，增强${sanHeJu.wuXing}的力量。`;
      }
    }

    return null;
  }

  /**
   * 检查三会局
   * @param baziInfo 八字信息
   * @returns 三会局描述
   */
  private static checkSanHuiJu(baziInfo: BaziInfo): string | null {
    const branches = [
      baziInfo.yearBranch || '',
      baziInfo.monthBranch || '',
      baziInfo.dayBranch || '',
      baziInfo.hourBranch || ''
    ].filter(branch => branch !== '');

    // 定义三会局
    const sanHuiJuList = [
      { name: '寅卯辰三会木局', branches: ['寅', '卯', '辰'], wuXing: '木' },
      { name: '巳午未三会火局', branches: ['巳', '午', '未'], wuXing: '火' },
      { name: '申酉戌三会金局', branches: ['申', '酉', '戌'], wuXing: '金' },
      { name: '亥子丑三会水局', branches: ['亥', '子', '丑'], wuXing: '水' }
    ];

    // 检查是否有三会局
    for (const sanHuiJu of sanHuiJuList) {
      const matchCount = sanHuiJu.branches.filter(branch => branches.includes(branch)).length;

      if (matchCount >= 2) {
        return `八字中有${sanHuiJu.branches.filter(branch => branches.includes(branch)).join('、')}，形成${matchCount === 3 ? '完整' : '部分'}${sanHuiJu.name}，增强${sanHuiJu.wuXing}的力量。`;
      }
    }

    return null;
  }

  /**
   * 判断五行相生关系
   * @param wuXing1 五行1
   * @param wuXing2 五行2
   * @returns 是否相生
   */
  private static isWuXingSheng(wuXing1: string, wuXing2: string): boolean {
    const shengRelations: {[key: string]: string} = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };

    return shengRelations[wuXing1] === wuXing2;
  }

  /**
   * 判断五行相克关系
   * @param wuXing1 五行1
   * @param wuXing2 五行2
   * @returns 是否相克
   */
  private static isWuXingKe(wuXing1: string, wuXing2: string): boolean {
    const keRelations: {[key: string]: string} = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };

    return keRelations[wuXing1] === wuXing2;
  }
}
