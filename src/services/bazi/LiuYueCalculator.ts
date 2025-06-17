import { Solar } from 'lunar-typescript';
import { LiuYueInfo } from '../../types/BaziInfo';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';
import { XunKongCalculator } from './XunKongCalculator';

/**
 * 流月计算器
 * 专门处理流月相关计算，包括节气日期
 */
export class LiuYueCalculator {
  
  /**
   * 计算指定年份的流月信息
   * @param year 年份
   * @param dayStem 日干（用于计算十神）
   * @returns 流月信息数组
   */
  static calculateLiuYue(year: number, dayStem: string): LiuYueInfo[] {
    console.log(`🗓️ LiuYueCalculator.calculateLiuYue 开始计算 ${year}年流月`);

    const liuYueData: LiuYueInfo[] = [];

    // 天干地支顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";

    // 计算年干支
    const stemIndex = (year - 4) % 10;
    const yearStem = stems[stemIndex];

    // 根据八字命理学规则，流月干支的计算方法：
    // 月支固定对应：寅卯辰巳午未申酉戌亥子丑（正月到十二月）
    // 月干则根据流年干支确定起始月干，然后依次递增

    // 月干起始规律：甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
    const monthStemStartMap: {[key: string]: number} = {
      '甲': 2, '己': 2,  // 丙寅
      '乙': 4, '庚': 4,  // 戊寅
      '丙': 6, '辛': 6,  // 庚寅
      '丁': 8, '壬': 8,  // 壬寅
      '戊': 0, '癸': 0   // 甲寅
    };

    const firstMonthStemIndex = monthStemStartMap[yearStem] || 0;

    // 生成12个月的流月数据
    for (let month = 1; month <= 12; month++) {
      // 计算月干（正月寅月开始，每月递增一位）
      const monthStemIndex = (firstMonthStemIndex + month - 1) % 10;
      const monthStem = stems[monthStemIndex];

      // 月支固定对应
      const monthBranchMap = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
      const monthBranch = monthBranchMap[month];

      // 组合干支
      const ganZhi = monthStem + monthBranch;

      // 计算旬空
      const xunKong = XunKongCalculator.calculateXunKongByGanZhi(ganZhi);

      // 中文月份
      const chineseMonths = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
      const monthText = chineseMonths[month] + '月';

      // 计算该干支月的节气起始日期
      const startDate = this.getMonthStartDate(year, monthBranch);
      const endDate = this.getMonthEndDate(year, monthBranch);

      // 计算十神
      const shiShenGan = ShiShenCalculator.getShiShen(dayStem, monthStem);
      const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, monthBranch);

      // 计算地势
      const diShi = BaziCalculator.getDiShi(dayStem, monthBranch);

      // 计算神煞信息
      const shenSha = ShenShaTimeService.calculateLiuYueShenSha(dayStem, ganZhi);

      liuYueData.push({
        year,
        month: monthText,
        index: month - 1,
        ganZhi,
        startDate,
        endDate,
        xunKong,
        shiShenGan,
        shiShenZhi,
        diShi,
        shenSha
      });

      console.log(`🗓️ 流月 ${monthText} (${ganZhi}) ${startDate} 计算完成`);
    }

    console.log(`🗓️ LiuYueCalculator.calculateLiuYue 完成，共计算 ${liuYueData.length} 个月`);
    return liuYueData;
  }

  /**
   * 获取干支月的公历起始日期
   * @param year 年份
   * @param monthBranch 月支
   * @returns 公历起始日期（如"2.4"）
   */
  private static getMonthStartDate(year: number, monthBranch: string): string {
    try {
      // 干支月与节气的对应关系
      const jieQiMap: {[key: string]: string} = {
        '寅': '立春',    // 正月
        '卯': '惊蛰',    // 二月
        '辰': '清明',    // 三月
        '巳': '立夏',    // 四月
        '午': '芒种',    // 五月
        '未': '小暑',    // 六月
        '申': '立秋',    // 七月
        '酉': '白露',    // 八月
        '戌': '寒露',    // 九月
        '亥': '立冬',    // 十月
        '子': '大雪',    // 十一月
        '丑': '小寒'     // 十二月
      };

      const jieQiName = jieQiMap[monthBranch];
      if (!jieQiName) {
        return '';
      }

      // 使用lunar-typescript的节气表查找准确日期
      const jieQiDate = this.findJieQiDateByTable(year, jieQiName);
      if (jieQiDate) {
        const month = jieQiDate.getMonth();
        const day = jieQiDate.getDay();
        return `${month}.${day}`;
      }

      return '';
    } catch (error) {
      console.error('获取干支月起始日期时出错:', error);
      return '';
    }
  }

  /**
   * 获取干支月的公历结束日期
   * @param year 年份
   * @param monthBranch 月支
   * @returns 公历结束日期（如"3.4"）
   */
  private static getMonthEndDate(year: number, monthBranch: string): string {
    try {
      // 下一个月的节气就是当前月的结束
      const nextMonthMap: {[key: string]: string} = {
        '寅': '卯',    // 正月 → 二月
        '卯': '辰',    // 二月 → 三月
        '辰': '巳',    // 三月 → 四月
        '巳': '午',    // 四月 → 五月
        '午': '未',    // 五月 → 六月
        '未': '申',    // 六月 → 七月
        '申': '酉',    // 七月 → 八月
        '酉': '戌',    // 八月 → 九月
        '戌': '亥',    // 九月 → 十月
        '亥': '子',    // 十月 → 十一月
        '子': '丑',    // 十一月 → 十二月
        '丑': '寅'     // 十二月 → 正月（次年）
      };

      const nextMonthBranch = nextMonthMap[monthBranch];
      if (!nextMonthBranch) {
        return '';
      }

      // 获取下一个月的起始日期作为当前月的结束日期
      const nextYear = monthBranch === '丑' ? year + 1 : year;
      const nextStartDate = this.getMonthStartDate(nextYear, nextMonthBranch);

      if (nextStartDate) {
        // 结束日期是下一个节气的前一天
        const [month, day] = nextStartDate.split('.').map(Number);

        // 计算前一天
        let endMonth = month;
        let endDay = day - 1;

        if (endDay <= 0) {
          // 跨月情况
          endMonth = month - 1;
          if (endMonth <= 0) {
            endMonth = 12;
          }
          // 获取上个月的天数
          const daysInMonth = new Date(nextYear, endMonth, 0).getDate();
          endDay = daysInMonth;
        }

        return `${endMonth}.${endDay}`;
      }

      return '';
    } catch (error) {
      console.error('获取干支月结束日期时出错:', error);
      return '';
    }
  }

  /**
   * 使用lunar-typescript的节气表查找指定节气的准确日期
   * @param year 年份
   * @param jieQiName 节气名称
   * @returns Solar对象或null
   */
  private static findJieQiDateByTable(year: number, jieQiName: string): Solar | null {
    try {
      // 创建该年份的任意一个日期来获取节气表
      const solar = Solar.fromYmd(year, 6, 15); // 使用年中的日期
      const lunar = solar.getLunar();

      // 获取该年的节气表
      const jieQiTable = lunar.getJieQiTable();

      // 查找指定节气
      if (jieQiTable[jieQiName]) {
        console.log(`🌸 找到节气 ${jieQiName}: ${jieQiTable[jieQiName].toYmd()}`);
        return jieQiTable[jieQiName];
      }

      console.warn(`⚠️ 未在节气表中找到 ${jieQiName}`);
      return null;
    } catch (error) {
      console.error(`查找节气 ${jieQiName} 时出错:`, error);
      return null;
    }
  }
}
