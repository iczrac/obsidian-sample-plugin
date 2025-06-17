import { EightChar, Solar } from 'lunar-typescript';
import { BaziUtils } from '../BaziUtils';
import { ShenShaAlgorithms } from './ShenShaAlgorithms';

/**
 * 特殊神煞计算器
 * 专门负责计算复杂神煞和提供化解方案
 *
 * 📋 职责范围：
 * - 复杂神煞计算（需要季节、纳音等复杂判断）
 * - 神煞化解方法和影响评估
 * - 与ShenShaAlgorithms协作，避免重复实现
 *
 * 🔄 整合说明：
 * - 2024-12: 消除与ShenShaAlgorithms的重叠算法
 * - 重叠算法统一使用ShenShaAlgorithms版本
 * - 保持复杂算法（童子煞、将军箭）的独立实现
 * - 删除重复的魁罡、阴差阳错、十恶大败、孤鸾煞实现
 *
 * 📝 算法分工：
 * - 基础神煞 → ShenShaAlgorithms（52个算法）
 * - 复杂神煞 → SpecialShenShaCalculator（童子煞、将军箭）
 * - 化解方案 → SpecialShenShaCalculator（专业化解指导）
 * - 影响评估 → SpecialShenShaCalculator（综合影响分析）
 *
 * 🎯 设计原则：
 * - 职责单一：专注复杂神煞和化解方案
 * - 避免重复：统一使用基础算法库
 * - 易于维护：清晰的算法分工
 * - 专业性强：提供权威的化解指导
 */
export class SpecialShenShaCalculator {
  /**
   * 计算所有特殊神煞
   * @param eightChar 八字对象
   * @param solar 阳历对象（用于确定季节）
   * @returns 特殊神煞信息
   */
  static calculateSpecialShenSha(eightChar: EightChar, solar?: Solar): {
    tongZiSha: boolean;
    jiangJunJian: boolean;
    kuiGang: boolean;
    yinChaYangCuo: boolean;
    specialShenSha: string[];
    details: { [key: string]: string };
  } {
    // 确定季节
    let season = '';
    if (solar) {
      const month = solar.getMonth();
      if ([3, 4, 5].includes(month)) season = '春';
      else if ([6, 7, 8].includes(month)) season = '夏';
      else if ([9, 10, 11].includes(month)) season = '秋';
      else season = '冬';
    }

    // 复杂神煞（本类独有算法）
    const tongZiSha = this.isTongZiSha(eightChar, season);
    const jiangJunJian = this.isJiangJunJian(eightChar, season);

    // 基础神煞（使用统一算法库）
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const kuiGang = ShenShaAlgorithms.isKuiGang(dayPillar);
    const yinChaYangCuo = ShenShaAlgorithms.isYinChaYangCuo(dayPillar);

    const specialShenSha: string[] = [];
    const details: { [key: string]: string } = {};

    if (tongZiSha) {
      specialShenSha.push('童子煞');
      details['童子煞'] = '主孤独，感情不顺，需化解';
    }

    if (jiangJunJian) {
      specialShenSha.push('将军箭');
      details['将军箭'] = '主血光之灾，需注意安全';
    }

    if (kuiGang) {
      specialShenSha.push('魁罡');
      details['魁罡'] = '主性格刚烈，有领导才能，但易孤独';
    }

    if (yinChaYangCuo) {
      specialShenSha.push('阴差阳错');
      details['阴差阳错'] = '主婚姻不顺，感情波折';
    }

    return {
      tongZiSha,
      jiangJunJian,
      kuiGang,
      yinChaYangCuo,
      specialShenSha,
      details
    };
  }

  /**
   * 判断童子煞
   * @param eightChar 八字对象
   * @param season 季节
   * @returns 是否为童子煞
   */
  static isTongZiSha(eightChar: EightChar, season: string): boolean {
    // 获取四柱地支
    const dayBranch = eightChar.getDayZhi();
    const timeBranch = eightChar.getTimeZhi();

    // 获取纳音五行
    const yearNaYin = eightChar.getYearNaYin();
    const dayNaYin = eightChar.getDayNaYin();

    // 提取纳音五行属性
    const yearNaYinWuXing = BaziUtils.getNaYinWuXing(yearNaYin);
    const dayNaYinWuXing = BaziUtils.getNaYinWuXing(dayNaYin);

    // 童子煞判断口诀：
    // "春秋寅子贵，冬夏卯未辰；金木马卯合，水火鸡犬多；土命逢辰巳，童子定不错"

    // 按季节判断
    if (season === '春' || season === '秋') {
      if (['寅', '子'].includes(dayBranch) || ['寅', '子'].includes(timeBranch)) {
        return true;
      }
    } else if (season === '冬' || season === '夏') {
      if (['卯', '未', '辰'].includes(dayBranch) || ['卯', '未', '辰'].includes(timeBranch)) {
        return true;
      }
    }

    // 按纳音五行判断
    if (['金', '木'].includes(yearNaYinWuXing) || ['金', '木'].includes(dayNaYinWuXing)) {
      if (['午', '卯'].includes(dayBranch) || ['午', '卯'].includes(timeBranch)) {
        return true;
      }
    } else if (['水', '火'].includes(yearNaYinWuXing) || ['水', '火'].includes(dayNaYinWuXing)) {
      if (['酉', '戌'].includes(dayBranch) || ['酉', '戌'].includes(timeBranch)) {
        return true;
      }
    } else if (['土'].includes(yearNaYinWuXing) || ['土'].includes(dayNaYinWuXing)) {
      if (['辰', '巳'].includes(dayBranch) || ['辰', '巳'].includes(timeBranch)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 判断将军箭
   * @param eightChar 八字对象
   * @param season 季节
   * @returns 是否为将军箭
   */
  static isJiangJunJian(eightChar: EightChar, season: string): boolean {
    // 获取四柱地支
    const dayBranch = eightChar.getDayZhi();
    const timeBranch = eightChar.getTimeZhi();

    // 将军箭判断口诀：
    // "春季酉戌辰，夏季未卯子，秋季寅申午，冬季巳亥丑"

    let targetBranches: string[] = [];

    switch (season) {
      case '春':
        targetBranches = ['酉', '戌', '辰'];
        break;
      case '夏':
        targetBranches = ['未', '卯', '子'];
        break;
      case '秋':
        targetBranches = ['寅', '申', '午'];
        break;
      case '冬':
        targetBranches = ['巳', '亥', '丑'];
        break;
      default:
        return false;
    }

    // 检查日支或时支是否在目标地支中
    return targetBranches.includes(dayBranch) || targetBranches.includes(timeBranch);
  }

  // 注意：以下重叠算法已删除，统一使用ShenShaAlgorithms版本：
  // - isKuiGang() → ShenShaAlgorithms.isKuiGang()
  // - isYinChaYangCuo() → ShenShaAlgorithms.isYinChaYangCuo()
  // - isGuLuanSha() → ShenShaAlgorithms.isGuLuanSha()
  // - isShiEDaBai() → ShenShaAlgorithms.isShiEDaBai()
  // - isRiDe() → ShenShaAlgorithms.isRiDe()
  //
  // 这样避免了代码重复，确保算法一致性，便于统一维护

  /**
   * 获取特殊神煞的化解方法
   * @param shenShaName 神煞名称
   * @returns 化解方法
   */
  static getResolutionMethod(shenShaName: string): {
    method: string;
    items: string[];
    timing: string;
    precautions: string[];
  } {
    const resolutionMap: { [key: string]: any } = {
      '童子煞': {
        method: '送替身、拜干亲',
        items: ['纸人替身', '红布', '香烛'],
        timing: '农历初一、十五',
        precautions: ['需找专业人士指导', '心诚则灵', '多行善事']
      },
      '将军箭': {
        method: '制箭、化解',
        items: ['桃木剑', '五帝钱', '护身符'],
        timing: '出生后百日内',
        precautions: ['避免尖锐物品', '注意安全', '定期检查']
      },
      '魁罡': {
        method: '修身养性、积德行善',
        items: ['佛珠', '经书', '善书'],
        timing: '日常修持',
        precautions: ['控制脾气', '多行善事', '避免争斗']
      },
      '阴差阳错': {
        method: '择吉结婚、和谐相处',
        items: ['和合符', '鸳鸯玉', '红绳'],
        timing: '结婚前后',
        precautions: ['选择良辰吉日', '夫妻和睦', '互相包容']
      }
    };

    const resolution = resolutionMap[shenShaName];
    if (resolution) {
      return resolution;
    }

    return {
      method: '积德行善、修身养性',
      items: ['护身符', '经书'],
      timing: '日常',
      precautions: ['心存善念', '多做好事', '保持正能量']
    };
  }

  /**
   * 计算特殊神煞的影响程度
   * @param eightChar 八字对象
   * @param solar 阳历对象
   * @returns 影响程度评估
   */
  static assessSpecialShenShaImpact(eightChar: EightChar, solar?: Solar): {
    totalImpact: number;
    majorConcerns: string[];
    recommendations: string[];
    urgency: string;
  } {
    const specialShenSha = this.calculateSpecialShenSha(eightChar, solar);
    
    let totalImpact = 0;
    const majorConcerns: string[] = [];
    const recommendations: string[] = [];

    if (specialShenSha.tongZiSha) {
      totalImpact += 7;
      majorConcerns.push('感情婚姻方面需特别注意');
      recommendations.push('建议进行童子煞化解');
    }

    if (specialShenSha.jiangJunJian) {
      totalImpact += 8;
      majorConcerns.push('健康安全方面需格外小心');
      recommendations.push('建议进行将军箭化解');
    }

    if (specialShenSha.kuiGang) {
      totalImpact += 5;
      majorConcerns.push('性格过于刚烈，人际关系需注意');
      recommendations.push('建议修身养性，控制脾气');
    }

    if (specialShenSha.yinChaYangCuo) {
      totalImpact += 6;
      majorConcerns.push('婚姻感情容易出现波折');
      recommendations.push('建议择吉结婚，夫妻和睦');
    }

    let urgency = '';
    if (totalImpact >= 15) {
      urgency = '高度关注';
    } else if (totalImpact >= 10) {
      urgency = '中度关注';
    } else if (totalImpact >= 5) {
      urgency = '适度关注';
    } else {
      urgency = '无需特别关注';
    }

    return {
      totalImpact,
      majorConcerns,
      recommendations,
      urgency
    };
  }
}
