import { BaziInfo, DaYunInfo } from '../../types/BaziInfo';
import { BaziService } from '../BaziService';
import { Solar, Lunar } from 'lunar-typescript';

/**
 * 数据生成服务
 * 负责生成流年、流月、流日、流时等数据
 */
export class DataGenerationService {
  
  /**
   * 为指定大运生成流年数据
   * @param daYun 大运信息
   * @returns 流年数据数组
   */
  static generateLiuNianForDaYun(daYun: DaYunInfo): any[] {
    const liuNianData: any[] = [];
    
    if (!daYun.startYear || !daYun.endYear) {
      console.warn('大运缺少起止年份信息');
      return liuNianData;
    }

    // 生成该大运期间的所有流年
    for (let year = daYun.startYear; year <= daYun.endYear; year++) {
      try {
        // 使用 lunar-typescript 获取年份的干支
        const solar = Solar.fromYmd(year, 1, 1);
        const lunar = solar.getLunar();
        const yearGanZhi = lunar.getYearInGanZhi();

        liuNianData.push({
          year,
          ganZhi: yearGanZhi,
          name: `${year}年`,
          displayName: `${yearGanZhi}(${year})`
        });
      } catch (error) {
        console.error(`生成${year}年流年数据时出错:`, error);
      }
    }

    return liuNianData;
  }

  /**
   * 为指定年份生成流月数据
   * @param year 年份
   * @returns 流月数据数组
   */
  static generateLiuYueForYear(year: number): any[] {
    const liuYueData: any[] = [];
    
    try {
      // 获取该年的12个月的干支
      for (let month = 1; month <= 12; month++) {
        // 使用 lunar-typescript 获取月份的干支
        const solar = Solar.fromYmd(year, month, 15); // 使用月中日期
        const lunar = solar.getLunar();
        const monthGanZhi = lunar.getMonthInGanZhi();
        const monthName = this.getMonthName(month);

        liuYueData.push({
          year,
          month,
          ganZhi: monthGanZhi,
          name: monthName,
          displayName: `${monthGanZhi}月`,
          startDate: this.getMonthStartDate(year, month)
        });
      }
    } catch (error) {
      console.error(`生成${year}年流月数据时出错:`, error);
    }

    return liuYueData;
  }

  /**
   * 为指定年月生成流日数据
   * @param year 年份
   * @param month 月份
   * @returns 流日数据数组
   */
  static generateLiuRiForMonth(year: number, month: number): any[] {
    const liuRiData: any[] = [];
    
    try {
      // 获取该月的天数
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        // 使用 lunar-typescript 获取日期的干支
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const dayGanZhi = lunar.getDayInGanZhi();

        liuRiData.push({
          year,
          month,
          day,
          ganZhi: dayGanZhi,
          name: `${month}.${day}`,
          displayName: `${dayGanZhi}`,
          date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        });
      }
    } catch (error) {
      console.error(`生成${year}年${month}月流日数据时出错:`, error);
    }

    return liuRiData;
  }

  /**
   * 为指定日期生成流时数据
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @returns 流时数据数组
   */
  static generateLiuShiForDay(year: number, month: number, day: number): any[] {
    const liuShiData: any[] = [];
    
    try {
      // 12个时辰
      const timeNames = [
        { name: '子时', time: '23:00-01:00', index: 0 },
        { name: '丑时', time: '01:00-03:00', index: 1 },
        { name: '寅时', time: '03:00-05:00', index: 2 },
        { name: '卯时', time: '05:00-07:00', index: 3 },
        { name: '辰时', time: '07:00-09:00', index: 4 },
        { name: '巳时', time: '09:00-11:00', index: 5 },
        { name: '午时', time: '11:00-13:00', index: 6 },
        { name: '未时', time: '13:00-15:00', index: 7 },
        { name: '申时', time: '15:00-17:00', index: 8 },
        { name: '酉时', time: '17:00-19:00', index: 9 },
        { name: '戌时', time: '19:00-21:00', index: 10 },
        { name: '亥时', time: '21:00-23:00', index: 11 }
      ];

      timeNames.forEach(timeInfo => {
        // 使用 lunar-typescript 获取时辰的干支
        // 时辰索引对应：子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11
        const solar = Solar.fromYmdHms(year, month, day, timeInfo.index * 2 + 1, 0, 0);
        const lunar = solar.getLunar();
        const timeGanZhi = lunar.getTimeInGanZhi();

        liuShiData.push({
          year,
          month,
          day,
          timeIndex: timeInfo.index,
          ganZhi: timeGanZhi,
          name: timeInfo.name,
          time: timeInfo.time,
          displayName: `${timeGanZhi}`
        });
      });
    } catch (error) {
      console.error(`生成${year}年${month}月${day}日流时数据时出错:`, error);
    }

    return liuShiData;
  }

  /**
   * 生成大运列表数据
   * @param baziInfo 八字信息
   * @returns 大运列表
   */
  static generateDaYunList(baziInfo: BaziInfo): any[] {
    const daYunList: any[] = [];
    
    if (!baziInfo.daYun) {
      return daYunList;
    }

    // 获取起运年龄和出生年份
    const daYunStartAge = baziInfo.daYunStartAge || 0;
    const birthYear = Number(baziInfo.birthYear) || new Date().getFullYear();

    // 处理大运信息
    if (Array.isArray(baziInfo.daYun)) {
      // 如果是DaYunInfo[]类型
      baziInfo.daYun.forEach(daYun => {
        daYunList.push({
          ganZhi: daYun.ganZhi,
          startYear: daYun.startYear,
          endYear: daYun.endYear || daYun.startYear + 9,
          startAge: daYun.startAge,
          endAge: daYun.endAge
        });
      });
    } else if (typeof baziInfo.daYun === 'string') {
      // 如果是字符串类型（兼容旧版本）
      const daYunItems = baziInfo.daYun.split(',');

      daYunItems.forEach((item: string, index: number) => {
        const startAge = daYunStartAge + index * 10;
        const endAge = startAge + 9;
        const startYear = birthYear + startAge;
        const endYear = birthYear + endAge;

        daYunList.push({
          ganZhi: item.trim(),
          startYear,
          endYear,
          startAge,
          endAge
        });
      });
    }

    return daYunList;
  }

  /**
   * 获取月份名称
   * @param month 月份数字
   * @returns 月份名称
   */
  private static getMonthName(month: number): string {
    const monthNames = [
      '', '正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month] || `${month}月`;
  }

  /**
   * 获取月份开始日期（农历）
   * @param year 年份
   * @param month 月份
   * @returns 开始日期描述
   */
  private static getMonthStartDate(year: number, month: number): string {
    // 这里可以根据需要实现更精确的农历月份开始日期计算
    // 暂时返回简单的描述
    const monthMap: { [key: number]: string } = {
      1: '2.4', 2: '3.5', 3: '4.5', 4: '5.5', 5: '6.6', 6: '7.7',
      7: '8.7', 8: '9.8', 9: '10.8', 10: '11.7', 11: '12.7', 12: '1.6'
    };
    
    return monthMap[month] || `${month}.1`;
  }

  /**
   * 获取当前年份的流年数据
   * @param currentYear 当前年份
   * @param range 前后年份范围
   * @returns 流年数据数组
   */
  static getCurrentYearLiuNianData(currentYear: number, range: number = 5): any[] {
    const liuNianData: any[] = [];
    
    for (let year = currentYear - range; year <= currentYear + range; year++) {
      try {
        // 使用 lunar-typescript 获取年份的干支
        const solar = Solar.fromYmd(year, 1, 1);
        const lunar = solar.getLunar();
        const yearGanZhi = lunar.getYearInGanZhi();

        liuNianData.push({
          year,
          ganZhi: yearGanZhi,
          name: `${year}年`,
          displayName: `${yearGanZhi}(${year})`,
          isCurrent: year === currentYear
        });
      } catch (error) {
        console.error(`生成${year}年流年数据时出错:`, error);
      }
    }

    return liuNianData;
  }
}
