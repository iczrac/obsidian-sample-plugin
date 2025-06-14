import { Solar, Lunar } from 'lunar-typescript';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
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
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const day = currentDate.getDate();

          // 创建公历日期对象
          const solar = Solar.fromYmd(year, month, day);
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

          // 神煞信息（暂时为空，后续可扩展）
          const shenSha: string[] = [];

          liuRiData.push({
            year: year,
            month: month,
            day: day,
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

          console.log(`🗓️ 流日 ${year}-${month}-${day} (${ganZhi}) 计算完成`);

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
      const jieQiMap: {[key: string]: { start: string; end: string }} = {
        '寅': { start: '立春', end: '惊蛰' },    // 正月
        '卯': { start: '惊蛰', end: '清明' },    // 二月
        '辰': { start: '清明', end: '立夏' },    // 三月
        '巳': { start: '立夏', end: '芒种' },    // 四月
        '午': { start: '芒种', end: '小暑' },    // 五月
        '未': { start: '小暑', end: '立秋' },    // 六月
        '申': { start: '立秋', end: '白露' },    // 七月
        '酉': { start: '白露', end: '寒露' },    // 八月
        '戌': { start: '寒露', end: '立冬' },    // 九月
        '亥': { start: '立冬', end: '大雪' },    // 十月
        '子': { start: '大雪', end: '小寒' },    // 十一月
        '丑': { start: '小寒', end: '立春' }     // 十二月
      };

      const jieQiInfo = jieQiMap[monthBranch];
      if (!jieQiInfo) {
        return null;
      }

      // 使用lunar-typescript查找节气日期
      const startDate = this.findJieQiDate(year, jieQiInfo.start);
      let endDate = this.findJieQiDate(year, jieQiInfo.end);

      // 如果是跨年的情况（如十二月丑月）
      if (monthBranch === '丑' && jieQiInfo.end === '立春') {
        endDate = this.findJieQiDate(year + 1, jieQiInfo.end);
      }

      if (!startDate || !endDate) {
        return null;
      }

      // 结束日期要减一天，因为节气当天属于下一个月
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() - 1);

      return {
        startDate: startDate,
        endDate: endDateObj.toISOString().split('T')[0]
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
      // 从年初开始查找节气
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          try {
            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();
            const currentJieQi = lunar.getCurrentJieQi();

            if (currentJieQi && currentJieQi.toString() === jieQiName) {
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
          } catch (e) {
            // 忽略无效日期
            continue;
          }
        }
      }
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
