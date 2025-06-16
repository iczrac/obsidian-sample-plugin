import { EightChar, Solar } from 'lunar-typescript';
import { ShenShaUnifiedAPI } from './shensha/ShenShaUnifiedAPI';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';
import { ShenShaAnalysisService } from './shensha/ShenShaAnalysisService';
import { ShenShaDataService } from './shensha/ShenShaDataService';

/**
 * 统一神煞计算服务（兼容性代理）
 * 为了保持向后兼容，代理到新的神煞架构
 * @deprecated 建议直接使用 ShenShaUnifiedAPI
 */
export class UnifiedShenShaService {

  /**
   * 计算单柱神煞（通用方法）
   * @param dayStem 日干（作为参考点）
   * @param stem 当前柱天干
   * @param branch 当前柱地支
   * @param pillarType 柱类型（年、月、日、时、大运、流年等）
   * @param options 额外选项
   * @returns 神煞数组
   */
  static calculatePillarShenSha(
    dayStem: string,
    stem: string,
    branch: string,
    pillarType: string = '',
    options: {
      includeSpecial?: boolean;
      solar?: Solar;
      eightChar?: EightChar;
    } = {}
  ): string[] {
    return ShenShaTimeService.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType,
      includeSpecial: options.includeSpecial
    });
  }





  /**
   * 为四柱计算完整神煞
   * @param eightChar 八字对象
   * @param solar 阳历对象（可选）
   * @returns 完整神煞信息
   */
  static calculateCompleteFourPillarShenSha(eightChar: EightChar, solar?: Solar): {
    allShenSha: string[];
    yearShenSha: string[];
    monthShenSha: string[];
    dayShenSha: string[];
    timeShenSha: string[];
    jiShen: string[];
    xiongShen: string[];
    jiXiongShen: string[];
  } {
    const analysis = ShenShaAnalysisService.analyzeFourPillarShenSha(eightChar);
    return {
      allShenSha: analysis.allShenSha,
      yearShenSha: analysis.yearShenSha,
      monthShenSha: analysis.monthShenSha,
      dayShenSha: analysis.dayShenSha,
      timeShenSha: analysis.timeShenSha,
      jiShen: analysis.jiShen,
      xiongShen: analysis.xiongShen,
      jiXiongShen: analysis.jiXiongShen
    };
  }

  /**
   * 为大运计算神煞
   * @param dayStem 日干
   * @param ganZhi 大运干支
   * @returns 大运神煞数组
   */
  static calculateDaYunShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateDaYunShenSha(dayStem, ganZhi);
  }

  /**
   * 为流年计算神煞
   * @param dayStem 日干
   * @param ganZhi 流年干支
   * @returns 流年神煞数组
   */
  static calculateLiuNianShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi);
  }

  /**
   * 为流月计算神煞
   * @param dayStem 日干
   * @param ganZhi 流月干支
   * @returns 流月神煞数组
   */
  static calculateLiuYueShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateLiuYueShenSha(dayStem, ganZhi);
  }

  /**
   * 为流日计算神煞
   * @param dayStem 日干
   * @param ganZhi 流日干支
   * @returns 流日神煞数组
   */
  static calculateLiuRiShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateLiuRiShenSha(dayStem, ganZhi);
  }

  /**
   * 为流时计算神煞
   * @param dayStem 日干
   * @param ganZhi 流时干支
   * @returns 流时神煞数组
   */
  static calculateLiuShiShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateLiuShiShenSha(dayStem, ganZhi);
  }

  /**
   * 为小运计算神煞
   * @param dayStem 日干
   * @param ganZhi 小运干支
   * @returns 小运神煞数组
   */
  static calculateXiaoYunShenSha(dayStem: string, ganZhi: string): string[] {
    return ShenShaTimeService.calculateXiaoYunShenSha(dayStem, ganZhi);
  }

  /**
   * 获取神煞的详细信息
   * @param shenShaName 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaDetail(shenShaName: string): {
    name: string;
    type: string;
    description: string;
    effect: string;
    calculation: string;
  } {
    const detail = ShenShaDataService.getShenShaDetail(shenShaName);
    return {
      name: detail.name,
      type: detail.type,
      description: detail.description,
      effect: detail.effect,
      calculation: detail.calculation
    };
  }

  /**
   * 计算神煞强度评分
   * @param shenShaList 神煞列表
   * @returns 强度评分
   */
  static calculateShenShaStrength(shenShaList: string[]): {
    jiShenScore: number;
    xiongShenScore: number;
    totalScore: number;
    evaluation: string;
  } {
    const strength = ShenShaAnalysisService.calculateShenShaStrength(shenShaList);
    return {
      jiShenScore: strength.jiShenScore,
      xiongShenScore: strength.xiongShenScore,
      totalScore: strength.totalScore,
      evaluation: strength.evaluation
    };
  }
}
