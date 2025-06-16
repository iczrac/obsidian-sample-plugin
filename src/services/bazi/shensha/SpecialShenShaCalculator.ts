import { EightChar, Solar } from 'lunar-typescript';
import { BaziUtils } from '../BaziUtils';

/**
 * 特殊神煞计算器
 * 专门负责计算童子煞、将军箭等特殊神煞
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

    const tongZiSha = this.isTongZiSha(eightChar, season);
    const jiangJunJian = this.isJiangJunJian(eightChar, season);
    const kuiGang = this.isKuiGang(eightChar);
    const yinChaYangCuo = this.isYinChaYangCuo(eightChar);

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

  /**
   * 判断魁罡
   * @param eightChar 八字对象
   * @returns 是否为魁罡
   */
  static isKuiGang(eightChar: EightChar): boolean {
    // 魁罡四日：庚戌、庚辰、戊戌、壬辰
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const kuiGangDays = ['庚戌', '庚辰', '戊戌', '壬辰'];
    
    return kuiGangDays.includes(dayPillar);
  }

  /**
   * 判断阴差阳错
   * @param eightChar 八字对象
   * @returns 是否为阴差阳错
   */
  static isYinChaYangCuo(eightChar: EightChar): boolean {
    // 阴差阳错日：
    // 丙子、丁丑、戊寅、辛卯、壬辰、癸巳、
    // 丙午、丁未、戊申、辛酉、壬戌、癸亥
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const yinChaYangCuoDays = [
      '丙子', '丁丑', '戊寅', '辛卯', '壬辰', '癸巳',
      '丙午', '丁未', '戊申', '辛酉', '壬戌', '癸亥'
    ];
    
    return yinChaYangCuoDays.includes(dayPillar);
  }

  /**
   * 判断孤鸾煞
   * @param eightChar 八字对象
   * @returns 是否为孤鸾煞
   */
  static isGuLuanSha(eightChar: EightChar): boolean {
    // 孤鸾煞日：
    // 乙巳、丁巳、辛亥、戊申、甲寅、戊午、
    // 壬子、丙午、戊戌、壬戌
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const guLuanShaDays = [
      '乙巳', '丁巳', '辛亥', '戊申', '甲寅', 
      '戊午', '壬子', '丙午', '戊戌', '壬戌'
    ];
    
    return guLuanShaDays.includes(dayPillar);
  }

  /**
   * 判断十恶大败
   * @param eightChar 八字对象
   * @returns 是否为十恶大败
   */
  static isShiEDaBai(eightChar: EightChar): boolean {
    // 十恶大败日：
    // 甲辰、乙巳、丙申、丁亥、戊戌、己丑、
    // 庚辰、辛巳、壬申、癸亥
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const shiEDaBaiDays = [
      '甲辰', '乙巳', '丙申', '丁亥', '戊戌', 
      '己丑', '庚辰', '辛巳', '壬申', '癸亥'
    ];
    
    return shiEDaBaiDays.includes(dayPillar);
  }

  /**
   * 判断日德
   * @param eightChar 八字对象
   * @returns 是否为日德
   */
  static isRiDe(eightChar: EightChar): boolean {
    // 日德日：甲寅、戊辰、丙辰、庚辰、壬戌
    const dayPillar = eightChar.getDayGan() + eightChar.getDayZhi();
    const riDeDays = ['甲寅', '戊辰', '丙辰', '庚辰', '壬戌'];
    
    return riDeDays.includes(dayPillar);
  }

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
