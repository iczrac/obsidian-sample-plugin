import { BaziInfo, DaYunInfo } from '../../types/BaziInfo';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';
import { BaziUtils } from './BaziUtils';
import { Lunar } from 'lunar-typescript';

/**
 * 扩展柱信息接口
 */
export interface ExtendedPillarInfo {
  type: 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' | 'special';
  name: string; // 显示名称，如"大运"、"流年"、"胎元"等
  stem: string; // 天干
  branch: string; // 地支
  ganZhi: string; // 干支组合
  hideGan: string; // 藏干
  shiShenGan: string; // 天干十神
  shiShenZhi: string[]; // 地支藏干十神
  diShi: string; // 地势
  naYin: string; // 纳音
  xunKong: string; // 旬空
  shengXiao: string; // 生肖
  shenSha: string[]; // 神煞
  wuXing: string; // 五行
}

/**
 * 柱信息计算服务
 * 负责计算各种柱（大运、流年、流月、流日、流时）的详细信息
 */
export class PillarCalculationService {
  
  /**
   * 计算大运柱信息
   * @param daYun 大运信息
   * @param dayStem 日干
   * @returns 扩展柱信息
   */
  static calculateDaYunPillar(daYun: DaYunInfo, dayStem: string): ExtendedPillarInfo | null {
    if (!daYun.ganZhi || daYun.ganZhi.length < 2) {
      console.log(`❌ calculateDaYunPillar: 大运干支无效`, daYun.ganZhi);
      return null;
    }

    const ganZhi = daYun.ganZhi;
    const stem = ganZhi[0];
    const branch = ganZhi[1];

    // 检查是否为前运（通过isQianYun标记）
    const isQianYun = (daYun as any).isQianYun === true;

    // 生成带时间信息的标题
    let displayName: string;
    if (isQianYun) {
      displayName = '前运';
    } else {
      // 格式化大运时间范围
      const startYear = daYun.startYear || '';
      const endYear = daYun.endYear || '';
      const startAge = daYun.startAge || '';
      const endAge = daYun.endAge || '';

      if (startYear && endYear) {
        displayName = `大运\n${startYear}-${endYear}\n(${startAge}-${endAge}岁)`;
      } else if (startAge && endAge) {
        displayName = `大运\n(${startAge}-${endAge}岁)`;
      } else {
        displayName = '大运';
      }
    }

    return {
      type: 'dayun',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: daYun.shenSha || ShenShaTimeService.calculateDaYunShenSha(dayStem, ganZhi),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算流年柱信息
   * @param liuNian 流年信息
   * @param dayStem 日干
   * @returns 扩展柱信息
   */
  static calculateLiuNianPillar(liuNian: any, dayStem: string): ExtendedPillarInfo | null {
    if (!liuNian.ganZhi || liuNian.ganZhi.length < 2) {
      console.log(`❌ calculateLiuNianPillar: 流年干支无效`, liuNian.ganZhi);
      return null;
    }

    const ganZhi = liuNian.ganZhi;
    const stem = ganZhi[0];
    const branch = ganZhi[1];

    // 生成带年份信息的标题
    const year = liuNian.year;
    const displayName = year ? `流年\n${year}年\n(${ganZhi})` : '流年';

    return {
      type: 'liunian',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: liuNian.shenSha || ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算流月柱信息
   * @param liuYue 流月信息
   * @param dayStem 日干
   * @returns 扩展柱信息
   */
  static calculateLiuYuePillar(liuYue: any, dayStem: string): ExtendedPillarInfo | null {
    if (!liuYue.ganZhi || liuYue.ganZhi.length < 2) {
      console.log(`❌ calculateLiuYuePillar: 流月干支无效`, liuYue.ganZhi);
      return null;
    }

    const ganZhi = liuYue.ganZhi;
    const stem = ganZhi[0];
    const branch = ganZhi[1];

    // 生成带时间信息的标题
    let displayName = '流月';
    if (liuYue.year && liuYue.month) {
      // 计算农历月份对应的公历时间范围
      const solarStartDate = this.getSolarDateForLunarMonth(liuYue.year, liuYue.month);
      if (solarStartDate) {
        displayName = `流月\n${liuYue.year}.${liuYue.month}月\n(${solarStartDate})`;
      } else {
        displayName = `流月\n${liuYue.year}.${liuYue.month}月\n(${ganZhi})`;
      }
    }

    return {
      type: 'liuyue',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: liuYue.shenSha || ShenShaTimeService.calculateLiuYueShenSha(dayStem, stem + branch),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算流日柱信息
   * @param ganZhi 流日干支
   * @param dayStem 日干
   * @param dateInfo 日期信息（可选）
   * @returns 扩展柱信息
   */
  static calculateLiuRiPillar(ganZhi: string, dayStem: string, dateInfo?: any): ExtendedPillarInfo | null {
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ calculateLiuRiPillar: 流日干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];

    // 生成带日期信息的标题
    let displayName = '流日';
    if (dateInfo && dateInfo.year && dateInfo.month && dateInfo.day) {
      // 格式化日期显示
      const dateStr = `${dateInfo.year}.${dateInfo.month}.${dateInfo.day}`;
      displayName = `流日\n${dateStr}\n(${ganZhi})`;
    }

    return {
      type: 'liuri',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: ShenShaTimeService.calculateLiuRiShenSha(dayStem, stem + branch),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算流时柱信息
   * @param ganZhi 流时干支
   * @param dayStem 日干
   * @param timeInfo 时间信息（可选）
   * @returns 扩展柱信息
   */
  static calculateLiuShiPillar(ganZhi: string, dayStem: string, timeInfo?: any): ExtendedPillarInfo | null {
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ calculateLiuShiPillar: 流时干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];

    // 生成带时间信息的标题
    let displayName = '流时';
    if (timeInfo) {
      if (timeInfo.year && timeInfo.month && timeInfo.day && timeInfo.hour !== undefined) {
        // 完整的时间信息
        const timeStr = `${timeInfo.year}.${timeInfo.month}.${timeInfo.day} ${timeInfo.hour}:00`;
        displayName = `流时\n${timeStr}\n(${ganZhi})`;
      } else if (timeInfo.name) {
        // 使用时辰名称
        displayName = `流时\n${timeInfo.name}\n(${ganZhi})`;
      }
    }

    return {
      type: 'liushi',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: ShenShaTimeService.calculateLiuShiShenSha(dayStem, stem + branch),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算特殊宫位柱信息（胎元、命宫、身宫）
   * @param ganZhi 宫位干支
   * @param palaceName 宫位名称
   * @param dayStem 日干
   * @returns 扩展柱信息
   */
  static calculateSpecialPalacePillar(ganZhi: string, palaceName: string, dayStem: string): ExtendedPillarInfo | null {
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ calculateSpecialPalacePillar: ${palaceName}干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];

    return {
      type: 'special',
      name: palaceName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: ShenShaTimeService.calculateSpecialPalaceShenSha(dayStem, ganZhi, palaceName),
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算地势（十二长生）
   * @param dayStem 日干
   * @param branch 地支
   * @returns 地势
   */
  private static calculateDiShiForPillar(dayStem: string, branch: string): string {
    // 十二长生对应关系
    const shiErChangSheng: { [key: string]: { [key: string]: string } } = {
      '甲': { '亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官', '卯': '帝旺', '辰': '衰', '巳': '病', '午': '死', '未': '墓', '申': '绝', '酉': '胎', '戌': '养' },
      '乙': { '午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官', '寅': '帝旺', '丑': '衰', '子': '病', '亥': '死', '戌': '墓', '酉': '绝', '申': '胎', '未': '养' },
      '丙': { '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养' },
      '丁': { '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养' },
      '戊': { '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养' },
      '己': { '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养' },
      '庚': { '巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官', '酉': '帝旺', '戌': '衰', '亥': '病', '子': '死', '丑': '墓', '寅': '绝', '卯': '胎', '辰': '养' },
      '辛': { '子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官', '申': '帝旺', '未': '衰', '午': '病', '巳': '死', '辰': '墓', '卯': '绝', '寅': '胎', '丑': '养' },
      '壬': { '申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官', '子': '帝旺', '丑': '衰', '寅': '病', '卯': '死', '辰': '墓', '巳': '绝', '午': '胎', '未': '养' },
      '癸': { '卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官', '亥': '帝旺', '戌': '衰', '酉': '病', '申': '死', '未': '墓', '午': '绝', '巳': '胎', '辰': '养' }
    };

    return shiErChangSheng[dayStem]?.[branch] || '';
  }

  /**
   * 获取农历月份对应的公历起始日期
   * @param year 年份
   * @param month 农历月份
   * @returns 公历日期字符串
   */
  private static getSolarDateForLunarMonth(year: number, month: number): string | null {
    try {
      // 使用lunar-typescript计算农历月份的公历起始日期（使用月初第一天）
      const lunar = Lunar.fromYmd(year, month, 1);
      const solar = lunar.getSolar();

      // 格式化为简洁的日期格式
      const solarMonth = solar.getMonth();
      const solarDay = solar.getDay();
      return `${solarMonth}.${solarDay}`;
    } catch (error) {
      console.error('计算农历月份公历日期失败:', error);
      return null;
    }
  }


}
