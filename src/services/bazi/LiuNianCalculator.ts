import { EightChar, Solar } from 'lunar-typescript';
import { LiuNianInfo } from '../../types/BaziInfo';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';

/**
 * 流年计算器
 * 负责计算流年相关信息
 */
export class LiuNianCalculator {
  /**
   * 计算流年信息
   * @param eightChar 八字对象
   * @param solar 阳历对象
   * @param gender 性别（'1'-男，'0'-女）
   * @param dayStem 日干
   * @param startYear 开始年份（可选，默认从当前大运开始）
   * @param count 流年数量，默认10年
   * @returns 流年信息数组
   */
  static calculateLiuNian(
    eightChar: EightChar,
    solar: Solar,
    gender: string,
    dayStem: string,
    startYear?: number,
    count = 10
  ): LiuNianInfo[] {
    if (gender !== '1' && gender !== '0') {
      return [];
    }

    try {
      // 获取运势信息
      const yun = eightChar.getYun(gender === '1' ? 1 : 0);
      const daYunList = yun.getDaYun(1); // 先获取第一步大运

      if (daYunList.length === 0) {
        return [];
      }

      // 获取当前大运的流年
      const currentDaYun = daYunList[0];
      const liuNianList = currentDaYun.getLiuNian(count);

      // 处理流年信息
      return liuNianList.map((ln) => {
        const ganZhi = ln.getGanZhi();
        const naYin = BaziCalculator.getNaYin(ganZhi);
        const shiShenGan = ShiShenCalculator.getShiShen(dayStem, ganZhi.charAt(0));
        const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, ganZhi.charAt(1));

        // 计算流年神煞
        // 计算流年神煞（传递四柱信息用于细分空亡等）
      const fourPillarInfo = {
        yearStem: eightChar.getYearGan(),
        yearBranch: eightChar.getYearZhi(),
        monthStem: eightChar.getMonthGan(),
        monthBranch: eightChar.getMonthZhi(),
        dayBranch: eightChar.getDayZhi(),
        hourStem: eightChar.getTimeGan(),
        hourBranch: eightChar.getTimeZhi()
      };
      const shenSha = ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi, fourPillarInfo);

        // 计算地势
        const diShi = this.calculateDiShi(ganZhi.charAt(0), ganZhi.charAt(1));

        // 安全获取旬空信息
        let xunKong = '';
        try {
          xunKong = ln.getXunKong() || '';
        } catch (e) {
          console.warn('获取流年旬空信息失败:', e);
          // 使用备用方法计算旬空
          xunKong = this.calculateXunKong(ganZhi);
        }

        return {
          year: ln.getYear(),
          age: ln.getAge(),
          index: ln.getIndex(),
          ganZhi,
          naYin,
          shiShenGan,
          shiShenZhi,
          diShi,
          xunKong,
          shenSha
        };
      });
    } catch (e) {
      console.error('计算流年出错:', e);
      return [];
    }
  }

  /**
   * 计算指定年份范围的流年信息（带四柱信息）
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @param birthYear 出生年份
   * @param dayStem 日干
   * @param fourPillarInfo 四柱信息（可选，用于细分空亡等）
   * @returns 流年信息数组
   */
  static calculateLiuNianByYearRangeWithFourPillar(
    startYear: number,
    endYear: number,
    birthYear: number,
    dayStem: string,
    fourPillarInfo?: {
      yearStem: string, yearBranch: string,
      monthStem: string, monthBranch: string,
      dayBranch: string,
      hourStem: string, hourBranch: string
    }
  ): LiuNianInfo[] {
    const liuNianList: LiuNianInfo[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const age = year - birthYear;
      const ganZhi = this.calculateYearGanZhi(year);
      const naYin = BaziCalculator.getNaYin(ganZhi);
      const shiShenGan = ShiShenCalculator.getShiShen(dayStem, ganZhi.charAt(0));
      const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, ganZhi.charAt(1));

      // 计算流年神煞（传递四柱信息）
      const shenSha = ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi, fourPillarInfo);

      // 计算地势
      const diShi = this.calculateDiShi(ganZhi.charAt(0), ganZhi.charAt(1));

      // 计算旬空
      const xunKong = this.calculateXunKong(ganZhi);

      liuNianList.push({
        year,
        age,
        index: year - startYear,
        ganZhi,
        naYin,
        shiShenGan,
        shiShenZhi,
        diShi,
        xunKong,
        shenSha
      });
    }

    return liuNianList;
  }

  /**
   * 计算指定年份范围的流年信息
   * @param startYear 开始年份
   * @param endYear 结束年份
   * @param birthYear 出生年份
   * @param dayStem 日干
   * @returns 流年信息数组
   */
  static calculateLiuNianByYearRange(
    startYear: number,
    endYear: number,
    birthYear: number,
    dayStem: string
  ): LiuNianInfo[] {
    const liuNianList: LiuNianInfo[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const age = year - birthYear;
      const ganZhi = this.calculateYearGanZhi(year);
      const naYin = BaziCalculator.getNaYin(ganZhi);
      const shiShenGan = ShiShenCalculator.getShiShen(dayStem, ganZhi.charAt(0));
      const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, ganZhi.charAt(1));

      // 计算流年神煞
      const shenSha = ShenShaTimeService.calculateLiuNianShenSha(dayStem, ganZhi);

      // 计算地势
      const diShi = this.calculateDiShi(ganZhi.charAt(0), ganZhi.charAt(1));

      // 计算旬空
      const xunKong = this.calculateXunKong(ganZhi);

      liuNianList.push({
        year,
        age,
        index: year - startYear,
        ganZhi,
        naYin,
        shiShenGan,
        shiShenZhi,
        diShi,
        xunKong,
        shenSha
      });
    }

    return liuNianList;
  }

  /**
   * 计算年份对应的干支
   * @param year 年份
   * @returns 干支
   */
  private static calculateYearGanZhi(year: number): string {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 以甲子年（1984年）为基准计算
    const baseYear = 1984;
    const yearOffset = year - baseYear;

    const stemIndex = (yearOffset % 10 + 10) % 10;
    const branchIndex = (yearOffset % 12 + 12) % 12;

    return stems[stemIndex] + branches[branchIndex];
  }



  /**
   * 计算地势
   * @param stem 天干
   * @param branch 地支
   * @returns 地势
   */
  private static calculateDiShi(stem: string, branch: string): string {
    // 十二长生表
    const changShengMap: { [key: string]: { [key: string]: string } } = {
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

    return changShengMap[stem]?.[branch] || '';
  }

  /**
   * 计算旬空（使用统一的BaziCalculator方法）
   * @param ganZhi 干支
   * @returns 旬空
   */
  private static calculateXunKong(ganZhi: string): string {
    if (ganZhi.length !== 2) {
      return '';
    }

    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);

    // 使用统一的BaziCalculator方法
    return BaziCalculator.calculateXunKong(stem, branch);
  }
}
