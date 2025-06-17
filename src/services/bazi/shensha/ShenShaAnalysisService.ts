import { EightChar } from 'lunar-typescript';
import { ShenShaCalculationEngine, ShenShaCalculationParams } from './ShenShaCalculationEngine';
import { ShenShaDataService, ImpactLevel } from './ShenShaDataService';

/**
 * 神煞分析服务
 * 提供神煞的分析、评估、组合分析等功能
 */

export interface FourPillarShenShaAnalysis {
  allShenSha: string[];
  yearShenSha: string[];
  monthShenSha: string[];
  dayShenSha: string[];
  timeShenSha: string[];
  jiShen: string[];
  xiongShen: string[];
  jiXiongShen: string[];
  categoryAnalysis: {[category: string]: string[]};
  strengthAnalysis: ShenShaStrength;
}

export interface ShenShaStrength {
  jiShenScore: number;
  xiongShenScore: number;
  totalScore: number;
  evaluation: string;
  level: string;
}

export interface CombinationAnalysis {
  synergies: string[]; // 相互增强的组合
  conflicts: string[]; // 相互冲突的组合
  neutrals: string[];  // 中性组合
  recommendations: string[];
}

export interface TrendAnalysis {
  trend: string; // 上升、下降、稳定
  keyPeriods: string[];
  riskPeriods: string[];
  opportunities: string[];
}

export class ShenShaAnalysisService {
  
  /**
   * 分析四柱神煞
   * @param eightChar 八字对象
   * @returns 四柱神煞完整分析
   */
  static analyzeFourPillarShenSha(eightChar: EightChar): FourPillarShenShaAnalysis {
    const dayStem = eightChar.getDayGan();
    
    // 计算各柱神煞
    const yearShenSha = this.calculatePillarShenSha(
      dayStem, 
      eightChar.getYearGan(), 
      eightChar.getYearZhi()
    );
    
    const monthShenSha = this.calculatePillarShenSha(
      dayStem, 
      eightChar.getMonthGan(), 
      eightChar.getMonthZhi()
    );
    
    const dayShenSha = this.calculatePillarShenSha(
      dayStem, 
      eightChar.getDayGan(), 
      eightChar.getDayZhi()
    );
    
    const timeShenSha = this.calculatePillarShenSha(
      dayStem, 
      eightChar.getTimeGan(), 
      eightChar.getTimeZhi()
    );

    // 合并所有神煞
    const allShenSha = [
      ...yearShenSha.map(s => `年柱:${s}`),
      ...monthShenSha.map(s => `月柱:${s}`),
      ...dayShenSha.map(s => `日柱:${s}`),
      ...timeShenSha.map(s => `时柱:${s}`)
    ];

    // 分类神煞
    const jiShen: string[] = [];
    const xiongShen: string[] = [];
    const jiXiongShen: string[] = [];

    allShenSha.forEach(shenSha => {
      const detail = ShenShaDataService.getShenShaDetail(shenSha);
      const type = detail.type;
      switch (type) {
        case '吉神':
          jiShen.push(shenSha);
          break;
        case '凶神':
          xiongShen.push(shenSha);
          break;
        case '吉凶神':
          jiXiongShen.push(shenSha);
          break;
      }
    });

    // 按分类分析
    const categoryAnalysis = this.analyzeShenShaByCategory(allShenSha);
    
    // 强度分析
    const strengthAnalysis = this.calculateShenShaStrength(allShenSha);

    return {
      allShenSha,
      yearShenSha,
      monthShenSha,
      dayShenSha,
      timeShenSha,
      jiShen,
      xiongShen,
      jiXiongShen,
      categoryAnalysis,
      strengthAnalysis
    };
  }

  /**
   * 计算单柱神煞
   * @param dayStem 日干
   * @param stem 天干
   * @param branch 地支
   * @returns 神煞数组
   */
  private static calculatePillarShenSha(dayStem: string, stem: string, branch: string): string[] {
    const params: ShenShaCalculationParams = {
      dayStem,
      stem,
      branch
    };

    return ShenShaCalculationEngine.calculateShenSha(params);
  }

  /**
   * 计算神煞强度评分
   * @param shenShaList 神煞列表
   * @returns 强度评分
   */
  static calculateShenShaStrength(shenShaList: string[]): ShenShaStrength {
    let jiShenScore = 0;
    let xiongShenScore = 0;

    shenShaList.forEach(shenSha => {
      const impact = ShenShaDataService.getShenShaImpact(shenSha);
      jiShenScore += impact.positive;
      xiongShenScore += impact.negative;
    });

    const totalScore = jiShenScore - xiongShenScore;
    
    let evaluation = '';
    let level = '';
    
    if (totalScore >= 20) {
      evaluation = '神煞配置极佳，多贵人助力，前程似锦';
      level = '优秀';
    } else if (totalScore >= 10) {
      evaluation = '神煞配置良好，整体偏吉，发展顺利';
      level = '良好';
    } else if (totalScore >= 0) {
      evaluation = '神煞配置平衡，吉凶参半，需努力进取';
      level = '一般';
    } else if (totalScore >= -10) {
      evaluation = '神煞配置偏弱，需注意化解，谨慎行事';
      level = '偏弱';
    } else {
      evaluation = '神煞配置不佳，多有阻碍，需积极化解';
      level = '较差';
    }

    return {
      jiShenScore,
      xiongShenScore,
      totalScore,
      evaluation,
      level
    };
  }

  /**
   * 按分类分析神煞
   * @param shenShaList 神煞列表
   * @returns 分类分析结果
   */
  private static analyzeShenShaByCategory(shenShaList: string[]): {[category: string]: string[]} {
    const categoryAnalysis: {[category: string]: string[]} = {};
    
    shenShaList.forEach(shenSha => {
      const category = ShenShaDataService.getShenShaCategory(shenSha);
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = [];
      }
      categoryAnalysis[category].push(shenSha);
    });
    
    return categoryAnalysis;
  }

  /**
   * 分析神煞组合
   * @param shenShaList 神煞列表
   * @returns 组合分析结果
   */
  static analyzeShenShaCombination(shenShaList: string[]): CombinationAnalysis {
    const synergies: string[] = [];
    const conflicts: string[] = [];
    const neutrals: string[] = [];
    const recommendations: string[] = [];

    // 检查有利组合
    if (shenShaList.some(s => s.includes('天乙贵人')) && shenShaList.some(s => s.includes('文昌'))) {
      synergies.push('天乙贵人配文昌，学业事业双丰收');
    }
    
    if (shenShaList.some(s => s.includes('禄神')) && shenShaList.some(s => s.includes('天德'))) {
      synergies.push('禄神配天德，财运亨通且品德高尚');
    }

    // 检查不利组合
    if (shenShaList.some(s => s.includes('羊刃')) && shenShaList.some(s => s.includes('劫煞'))) {
      conflicts.push('羊刃配劫煞，易有血光破财之灾');
      recommendations.push('建议佩戴化解物品，控制脾气');
    }
    
    if (shenShaList.some(s => s.includes('桃花')) && shenShaList.some(s => s.includes('阴差阳错'))) {
      conflicts.push('桃花配阴差阳错，感情波折较多');
      recommendations.push('建议专一感情，择吉结婚');
    }

    // 其他组合归为中性
    shenShaList.forEach(shenSha => {
      const pureName = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
      if (!synergies.some(s => s.includes(pureName)) && !conflicts.some(s => s.includes(pureName))) {
        neutrals.push(shenSha);
      }
    });

    return {
      synergies,
      conflicts,
      neutrals,
      recommendations
    };
  }

  /**
   * 分析神煞趋势（需要历史数据）
   * @param shenShaHistory 神煞历史数据
   * @returns 趋势分析结果
   */
  static analyzeShenShaTrend(shenShaHistory: any[]): TrendAnalysis {
    // 这里是示例实现，实际需要根据历史数据分析
    return {
      trend: '稳定',
      keyPeriods: ['大运交替期', '流年冲合期'],
      riskPeriods: ['羊刃年', '劫煞月'],
      opportunities: ['贵人年', '禄神月']
    };
  }

  /**
   * 生成神煞分析报告
   * @param analysis 四柱神煞分析结果
   * @returns 分析报告
   */
  static generateAnalysisReport(analysis: FourPillarShenShaAnalysis): string {
    let report = '=== 神煞分析报告 ===\n\n';
    
    report += `总体评价：${analysis.strengthAnalysis.evaluation}\n`;
    report += `神煞等级：${analysis.strengthAnalysis.level}\n`;
    report += `吉神得分：${analysis.strengthAnalysis.jiShenScore}分\n`;
    report += `凶神得分：${analysis.strengthAnalysis.xiongShenScore}分\n`;
    report += `综合得分：${analysis.strengthAnalysis.totalScore}分\n\n`;
    
    if (analysis.jiShen.length > 0) {
      report += `吉神：${analysis.jiShen.join('、')}\n`;
    }
    
    if (analysis.xiongShen.length > 0) {
      report += `凶神：${analysis.xiongShen.join('、')}\n`;
    }
    
    if (analysis.jiXiongShen.length > 0) {
      report += `吉凶神：${analysis.jiXiongShen.join('、')}\n`;
    }
    
    report += '\n=== 分类分析 ===\n';
    Object.entries(analysis.categoryAnalysis).forEach(([category, shenShaList]) => {
      if (shenShaList.length > 0) {
        report += `${category}：${shenShaList.join('、')}\n`;
      }
    });
    
    return report;
  }
}
