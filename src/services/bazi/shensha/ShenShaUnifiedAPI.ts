import { EightChar, Solar } from 'lunar-typescript';
import { ShenShaAnalysisService, FourPillarShenShaAnalysis, ShenShaStrength, CombinationAnalysis } from './ShenShaAnalysisService';
import { ShenShaTimeService } from './ShenShaTimeService';
import { ShenShaDataService, ShenShaDetail, ResolutionMethod, ImpactLevel } from './ShenShaDataService';
import { SpecialShenShaCalculator } from './SpecialShenShaCalculator';

/**
 * 神煞统一对外接口
 * 提供简洁的API供其他模块调用，封装所有神煞服务
 */

export interface CompleteShenShaAnalysis {
  fourPillarAnalysis: FourPillarShenShaAnalysis;
  specialShenSha: any;
  combinationAnalysis: CombinationAnalysis;
  recommendations: string[];
  riskWarnings: string[];
}

export interface TimeLayer {
  type: string;
  ganZhi: string;
  dayStem: string;
}

export interface TimeLayerParams {
  dayStem: string;
  ganZhi: string;
}

export interface ShenShaInfo {
  detail: ShenShaDetail;
  impact: ImpactLevel;
  resolution?: ResolutionMethod;
}

export interface ShenShaReport {
  summary: string;
  analysis: FourPillarShenShaAnalysis;
  recommendations: string[];
  warnings: string[];
  resolutionPlan: ResolutionMethod[];
}

export interface ReportOptions {
  includeSpecial?: boolean;
  includeCombination?: boolean;
  includeResolution?: boolean;
  detailLevel?: 'simple' | 'detailed' | 'comprehensive';
}

export class ShenShaUnifiedAPI {
  
  /**
   * 完整神煞分析（四柱+特殊）
   * @param eightChar 八字对象
   * @param solar 阳历对象（可选）
   * @returns 完整神煞分析结果
   */
  static getCompleteShenShaAnalysis(eightChar: EightChar, solar?: Solar): CompleteShenShaAnalysis {
    // 四柱神煞分析
    const fourPillarAnalysis = ShenShaAnalysisService.analyzeFourPillarShenSha(eightChar);
    
    // 特殊神煞分析
    const specialShenSha = SpecialShenShaCalculator.calculateSpecialShenSha(eightChar, solar);
    
    // 组合分析
    const combinationAnalysis = ShenShaAnalysisService.analyzeShenShaCombination(
      fourPillarAnalysis.allShenSha
    );
    
    // 生成建议和警告
    const recommendations = this.generateRecommendations(fourPillarAnalysis, specialShenSha);
    const riskWarnings = this.generateRiskWarnings(fourPillarAnalysis, specialShenSha);
    
    return {
      fourPillarAnalysis,
      specialShenSha,
      combinationAnalysis,
      recommendations,
      riskWarnings
    };
  }

  /**
   * 时间层级神煞
   * @param timeLayer 时间层级
   * @param params 时间层级参数
   * @returns 神煞数组
   */
  static getTimeLayerShenSha(timeLayer: string, params: TimeLayerParams): string[] {
    const { dayStem, ganZhi } = params;
    
    if (!ShenShaTimeService.validateTimeLayerParams(timeLayer, ganZhi)) {
      return [];
    }
    
    switch (timeLayer) {
      case '大运':
        return ShenShaTimeService.calculateDaYunShenSha(dayStem, ganZhi);
      case '流年':
        return ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi);
      case '流月':
        return ShenShaTimeService.calculateLiuYueShenSha(dayStem, ganZhi);
      case '流日':
        return ShenShaTimeService.calculateLiuRiShenSha(dayStem, ganZhi);
      case '流时':
        return ShenShaTimeService.calculateLiuShiShenSha(dayStem, ganZhi);
      case '小运':
        return ShenShaTimeService.calculateXiaoYunShenSha(dayStem, ganZhi);
      default:
        return [];
    }
  }

  /**
   * 神煞详细信息
   * @param shenShaName 神煞名称
   * @returns 神煞信息
   */
  static getShenShaInfo(shenShaName: string): ShenShaInfo {
    const detail = ShenShaDataService.getShenShaDetail(shenShaName);
    const impact = ShenShaDataService.getShenShaImpact(shenShaName);
    const resolution = ShenShaDataService.getResolutionMethod(shenShaName);
    
    return {
      detail,
      impact,
      resolution: resolution || undefined
    };
  }

  /**
   * 神煞评估报告
   * @param eightChar 八字对象
   * @param options 报告选项
   * @returns 神煞报告
   */
  static getShenShaReport(eightChar: EightChar, options: ReportOptions = {}): ShenShaReport {
    const {
      includeSpecial = true,
      includeCombination = true,
      includeResolution = true,
      detailLevel = 'detailed'
    } = options;
    
    // 基础分析
    const analysis = ShenShaAnalysisService.analyzeFourPillarShenSha(eightChar);
    
    // 生成摘要
    const summary = this.generateSummary(analysis, detailLevel);
    
    // 生成建议
    let recommendations: string[] = [];
    if (analysis.strengthAnalysis.level === '较差') {
      recommendations.push('建议多行善事，积累福德');
      recommendations.push('可考虑佩戴化解物品');
    } else if (analysis.strengthAnalysis.level === '优秀') {
      recommendations.push('神煞配置良好，宜把握机遇');
      recommendations.push('可在贵人年月大展宏图');
    }
    
    // 生成警告
    const warnings: string[] = [];
    if (analysis.xiongShen.length > analysis.jiShen.length) {
      warnings.push('凶神较多，需注意化解');
    }
    
    // 化解方案
    let resolutionPlan: ResolutionMethod[] = [];
    if (includeResolution) {
      analysis.xiongShen.forEach(shenSha => {
        const resolution = ShenShaDataService.getResolutionMethod(shenSha);
        if (resolution) {
          resolutionPlan.push(resolution);
        }
      });
    }
    
    return {
      summary,
      analysis,
      recommendations,
      warnings,
      resolutionPlan
    };
  }

  /**
   * 批量计算多个时间层级神煞
   * @param dayStem 日干
   * @param timeLayerData 时间层级数据
   * @returns 批量结果
   */
  static getBatchTimeLayerShenSha(
    dayStem: string, 
    timeLayerData: {[key: string]: string}
  ): {[key: string]: string[]} {
    return ShenShaTimeService.calculateBatchShenSha(dayStem, timeLayerData);
  }

  /**
   * 获取神煞强度评分
   * @param shenShaList 神煞列表
   * @returns 强度评分
   */
  static getShenShaStrength(shenShaList: string[]): ShenShaStrength {
    return ShenShaAnalysisService.calculateShenShaStrength(shenShaList);
  }

  /**
   * 获取神煞组合分析
   * @param shenShaList 神煞列表
   * @returns 组合分析
   */
  static getShenShaCombination(shenShaList: string[]): CombinationAnalysis {
    return ShenShaAnalysisService.analyzeShenShaCombination(shenShaList);
  }

  /**
   * 生成建议
   * @param fourPillarAnalysis 四柱分析
   * @param specialShenSha 特殊神煞
   * @returns 建议列表
   */
  private static generateRecommendations(fourPillarAnalysis: FourPillarShenShaAnalysis, specialShenSha: any): string[] {
    const recommendations: string[] = [];
    
    // 基于强度评分的建议
    if (fourPillarAnalysis.strengthAnalysis.totalScore >= 10) {
      recommendations.push('神煞配置良好，宜积极进取，把握机遇');
    } else if (fourPillarAnalysis.strengthAnalysis.totalScore < 0) {
      recommendations.push('建议多行善事，积累福德，化解不利');
    }
    
    // 基于吉神的建议
    if (fourPillarAnalysis.jiShen.some(s => s.includes('天乙贵人'))) {
      recommendations.push('命中有贵人，宜广结善缘，多得贵人相助');
    }
    
    if (fourPillarAnalysis.jiShen.some(s => s.includes('文昌'))) {
      recommendations.push('文昌入命，宜多读书学习，发展文化事业');
    }
    
    // 基于凶神的建议
    if (fourPillarAnalysis.xiongShen.some(s => s.includes('羊刃'))) {
      recommendations.push('命带羊刃，宜控制脾气，避免冲动行事');
    }
    
    return recommendations;
  }

  /**
   * 生成风险警告
   * @param fourPillarAnalysis 四柱分析
   * @param specialShenSha 特殊神煞
   * @returns 警告列表
   */
  private static generateRiskWarnings(fourPillarAnalysis: FourPillarShenShaAnalysis, specialShenSha: any): string[] {
    const warnings: string[] = [];
    
    // 基于凶神的警告
    if (fourPillarAnalysis.xiongShen.some(s => s.includes('劫煞'))) {
      warnings.push('命带劫煞，需注意破财，谨慎投资');
    }
    
    if (fourPillarAnalysis.xiongShen.some(s => s.includes('灾煞'))) {
      warnings.push('命带灾煞，需注意安全，避免意外');
    }
    
    // 基于特殊神煞的警告
    if (specialShenSha.tongZiSha) {
      warnings.push('命带童子煞，感情婚姻需特别注意');
    }
    
    if (specialShenSha.jiangJunJian) {
      warnings.push('命带将军箭，健康安全需格外小心');
    }
    
    return warnings;
  }

  /**
   * 生成摘要
   * @param analysis 分析结果
   * @param detailLevel 详细程度
   * @returns 摘要文本
   */
  private static generateSummary(analysis: FourPillarShenShaAnalysis, detailLevel: string): string {
    let summary = `神煞总体评价：${analysis.strengthAnalysis.evaluation}`;
    
    if (detailLevel === 'comprehensive') {
      summary += `\n吉神${analysis.jiShen.length}个，凶神${analysis.xiongShen.length}个，吉凶神${analysis.jiXiongShen.length}个`;
      summary += `\n综合得分：${analysis.strengthAnalysis.totalScore}分`;
    }
    
    return summary;
  }

  /**
   * 获取支持的功能列表
   * @returns 功能列表
   */
  static getSupportedFeatures(): string[] {
    return [
      '四柱神煞分析',
      '特殊神煞计算',
      '时间层级神煞',
      '神煞组合分析',
      '神煞强度评分',
      '化解方案推荐',
      '风险警告提示'
    ];
  }
}
