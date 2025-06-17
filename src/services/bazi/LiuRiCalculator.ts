import { Solar, Lunar } from 'lunar-typescript';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';
import { XunKongCalculator } from './XunKongCalculator';
import { LiuRiInfo } from '../../types/BaziInfo';

/**
 * 流日计算器
 * 专门处理流日相关计算
 */
export class LiuRiCalculator {
  
  /**
   * 计算指定干支月的流日信息
   * @param year 公历年份
   * @param monthGanZhi 月柱干支（如"丙寅"）
   * @param dayStem 日干（用于计算十神）
   * @returns 流日信息数组
   */
  static calculateLiuRi(year: number, monthGanZhi: string, dayStem: string): LiuRiInfo[] {
    console.log(`🗓️ LiuRiCalculator.calculateLiuRi 开始计算干支月流日`);
    console.log(`🗓️ 参数: year = ${year}, monthGanZhi = ${monthGanZhi}, dayStem = ${dayStem}`);

    const liuRiData: LiuRiInfo[] = [];

    try {
      // 根据干支月找到对应的节气范围
      const monthRange = this.getMonthDateRange(year, monthGanZhi);
      if (!monthRange) {
        console.error(`🗓️ 无法确定干支月 ${monthGanZhi} 的日期范围`);
        return [];
      }

      console.log(`🗓️ ${monthGanZhi}月范围: ${monthRange.startDate} 到 ${monthRange.endDate}`);

      // 遍历该干支月的所有日期
      let currentDate = new Date(monthRange.startDate);
      const endDate = new Date(monthRange.endDate);
      let dayIndex = 0;

      while (currentDate <= endDate) {
        try {
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const currentDay = currentDate.getDate();

          // 创建公历日期对象
          const solar = Solar.fromYmd(currentYear, currentMonth, currentDay);
          const lunar = solar.getLunar();
          const eightChar = lunar.getEightChar();

          // 获取日柱干支
          const stem = eightChar.getDayGan();
          const branch = eightChar.getDayZhi();
          const ganZhi = stem + branch;

          // 计算纳音
          const naYin = eightChar.getDayNaYin();

          // 计算旬空
          const xunKong = XunKongCalculator.calculateXunKongByGanZhi(ganZhi);

          // 计算十神
          const shiShenGan = ShiShenCalculator.getShiShen(dayStem, stem);
          const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, branch);

          // 计算地势
          const diShi = BaziCalculator.getDiShi(dayStem, branch);

          // 计算神煞信息
          const shenSha = ShenShaTimeService.calculateLiuRiShenSha(dayStem, ganZhi);

          liuRiData.push({
            year: currentYear,
            month: currentMonth,
            day: currentDay,
            monthGanZhi: monthGanZhi, // 添加干支月信息
            index: dayIndex,
            ganZhi,
            naYin,
            xunKong,
            shiShenGan,
            shiShenZhi,
            diShi,
            shenSha
          });

          console.log(`🗓️ 流日 ${currentYear}-${currentMonth}-${currentDay} (${ganZhi}) 计算完成`);

          // 移动到下一天
          currentDate.setDate(currentDate.getDate() + 1);
          dayIndex++;
        } catch (error) {
          console.error(`🗓️ 计算流日时出错:`, error);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    } catch (error) {
      console.error(`🗓️ 计算干支月流日时出错:`, error);
    }

    console.log(`🗓️ LiuRiCalculator.calculateLiuRi 完成，共计算 ${liuRiData.length} 天`);
    return liuRiData;
  }

  /**
   * 获取干支月对应的公历日期范围
   * @param year 年份
   * @param monthGanZhi 月柱干支
   * @returns 日期范围
   */
  private static getMonthDateRange(year: number, monthGanZhi: string): { startDate: string; endDate: string } | null {
    try {
      // 干支月与节气的对应关系
      const monthBranch = monthGanZhi[1]; // 取地支
      const jieQiMap: {[key: string]: string} = {
        '寅': '立春',    // 正月（立春到惊蛰前）
        '卯': '惊蛰',    // 二月（惊蛰到清明前）
        '辰': '清明',    // 三月（清明到立夏前）
        '巳': '立夏',    // 四月（立夏到芒种前）
        '午': '芒种',    // 五月（芒种到小暑前）
        '未': '小暑',    // 六月（小暑到立秋前）
        '申': '立秋',    // 七月（立秋到白露前）
        '酉': '白露',    // 八月（白露到寒露前）
        '戌': '寒露',    // 九月（寒露到立冬前）
        '亥': '立冬',    // 十月（立冬到大雪前）
        '子': '大雪',    // 十一月（大雪到小寒前）
        '丑': '小寒'     // 十二月（小寒到立春前）
      };

      const startJieQi = jieQiMap[monthBranch];
      if (!startJieQi) {
        return null;
      }

      // 获取下一个月的节气作为结束节气
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
      const endJieQi = jieQiMap[nextMonthBranch];

      // 使用lunar-typescript查找节气日期
      console.log(`🗓️ 查找起始节气: ${startJieQi} (年份: ${year})`);
      const startDate = this.findJieQiDate(year, startJieQi);
      console.log(`🗓️ 起始节气日期: ${startDate}`);

      console.log(`🗓️ 查找结束节气: ${endJieQi} (年份: ${year})`);
      let endDate = this.findJieQiDate(year, endJieQi);
      console.log(`🗓️ 结束节气日期: ${endDate}`);

      // 如果是跨年的情况（如十二月丑月）
      if (monthBranch === '丑' && endJieQi === '立春') {
        console.log(`🗓️ 跨年情况，查找次年立春: ${year + 1}`);
        endDate = this.findJieQiDate(year + 1, endJieQi);
        console.log(`🗓️ 次年立春日期: ${endDate}`);
      }

      if (!startDate || !endDate) {
        return null;
      }

      // 使用lunar-typescript的Solar API来正确处理日期计算
      const startDateParts = startDate.split('-');
      const endDateParts = endDate.split('-');

      const startYear = parseInt(startDateParts[0]);
      const startMonth = parseInt(startDateParts[1]);
      const startDay = parseInt(startDateParts[2]);

      const endYear = parseInt(endDateParts[0]);
      const endMonth = parseInt(endDateParts[1]);
      const endDay = parseInt(endDateParts[2]);

      console.log(`🗓️ 解析日期: 开始=${startYear}-${startMonth}-${startDay}, 结束=${endYear}-${endMonth}-${endDay}`);

      // 使用Solar.fromYmdHms创建日期对象（避免JavaScript年份推断）
      const startSolar = Solar.fromYmdHms(startYear, startMonth, startDay, 0, 0, 0);
      const endSolar = Solar.fromYmdHms(endYear, endMonth, endDay, 0, 0, 0);

      // 结束日期减一天，因为节气当天属于下一个月
      const finalEndSolar = endSolar.nextDay(-1);

      const finalStartDate = startSolar.toYmd();
      const finalEndDate = finalEndSolar.toYmd();

      console.log(`🗓️ 最终日期范围: ${finalStartDate} 到 ${finalEndDate}`);

      return {
        startDate: finalStartDate,
        endDate: finalEndDate
      };
    } catch (error) {
      console.error('获取干支月日期范围时出错:', error);
      return null;
    }
  }

  /**
   * 查找指定年份的节气日期
   * @param year 年份
   * @param jieQiName 节气名称
   * @returns 节气日期（YYYY-MM-DD格式）
   */
  private static findJieQiDate(year: number, jieQiName: string): string | null {
    try {
      console.log(`🔍 查找节气 ${jieQiName}，年份: ${year}`);

      // 使用lunar-typescript的节气表查找准确日期
      const solar = Solar.fromYmd(year, 6, 15); // 使用年中的日期
      console.log(`🔍 创建Solar对象: ${year}-06-15`);

      const lunar = solar.getLunar();
      console.log(`🔍 获取Lunar对象: ${lunar.toString()}`);

      // 获取该年的节气表
      const jieQiTable = lunar.getJieQiTable();
      console.log(`🔍 节气表键值:`, Object.keys(jieQiTable));

      // 查找指定节气
      if (jieQiTable[jieQiName]) {
        const jieQiSolar = jieQiTable[jieQiName];
        const jieQiYear = jieQiSolar.getYear();
        const jieQiMonth = jieQiSolar.getMonth();
        const jieQiDay = jieQiSolar.getDay();
        console.log(`🌸 找到节气 ${jieQiName}: ${jieQiYear}-${jieQiMonth}-${jieQiDay}`);

        const resultDate = `${jieQiYear}-${jieQiMonth.toString().padStart(2, '0')}-${jieQiDay.toString().padStart(2, '0')}`;
        console.log(`🔍 返回节气日期: ${resultDate}`);
        return resultDate;
      }

      console.warn(`⚠️ 未在节气表中找到 ${jieQiName}`);
      console.warn(`⚠️ 可用的节气:`, Object.keys(jieQiTable));
      return null;
    } catch (error) {
      console.error(`查找节气 ${jieQiName} 时出错:`, error);
      return null;
    }
  }



  /**
   * 获取月份的中文名称
   * @param month 月份（1-12）
   * @returns 中文月份名称
   */
  static getMonthName(month: number): string {
    const monthNames = [
      '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month - 1] || `${month}月`;
  }

  /**
   * 获取日期的中文名称
   * @param day 日期
   * @returns 中文日期名称
   */
  static getDayName(day: number): string {
    if (day <= 10) {
      const dayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十'];
      return dayNames[day];
    } else if (day < 20) {
      return `十${['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][day - 10]}`;
    } else if (day < 30) {
      return `二十${['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][day - 20]}`;
    } else {
      return `三十${day === 30 ? '' : day === 31 ? '一' : ''}`;
    }
  }
}
