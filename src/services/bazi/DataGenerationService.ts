import { BaziInfo, DaYunInfo } from '../../types/BaziInfo';
import { BaziService } from '../BaziService';
import { Solar } from 'lunar-typescript';

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
   * @param dayStem 日干（用于计算十神）
   * @returns 流月数据数组
   */
  static generateLiuYueForYear(year: number, dayStem: string = '甲'): any[] {
    console.log(`🎯 DataGenerationService.generateLiuYueForYear: 使用后端算法生成${year}年流月数据`);

    try {
      // 使用后端已有的LiuYueCalculator
      const liuYueData = BaziService.getLiuYue(year, dayStem);

      // 转换为前端需要的格式
      return liuYueData.map((liuYue, index) => ({
        year,
        month: index + 1,
        ganZhi: liuYue.ganZhi,
        name: liuYue.month,
        displayName: `${liuYue.ganZhi}月`,
        startDate: liuYue.startDate,
        endDate: liuYue.endDate,
        shiShenGan: liuYue.shiShenGan, // 修复：正确映射天干十神
        shiShenZhi: liuYue.shiShenZhi, // 修复：正确映射地支十神
        diShi: liuYue.diShi,
        xunKong: liuYue.xunKong,
        naYin: '', // 流月通常不计算纳音
        shenSha: liuYue.shenSha || [],
        isBackend: true // 标识使用后端算法
      }));
    } catch (error) {
      console.error(`❌ 使用后端算法生成${year}年流月数据失败:`, error);

      // 返回简化的备用数据
      const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      return monthNames.map((name, index) => ({
        year,
        month: index + 1,
        ganZhi: '甲寅', // 简化
        name,
        displayName: `甲寅月`,
        startDate: `${index + 1}.1`,
        shiShen: '比肩',
        diShi: '长生',
        xunKong: ['戌', '亥'],
        naYin: '',
        shenSha: [],
        isBackup: true
      }));
    }
  }

  /**
   * 为指定年月生成流日数据
   * @param year 年份
   * @param monthGanZhi 月柱干支
   * @param dayStem 日干（用于计算十神）
   * @returns 流日数据数组
   */
  static generateLiuRiForMonth(year: number, monthGanZhi: string, dayStem: string = '甲'): any[] {
    console.log(`🎯 DataGenerationService.generateLiuRiForMonth: 使用后端算法生成${year}年${monthGanZhi}月流日数据`);

    try {
      // 使用后端已有的LiuRiCalculator
      console.log(`🔍 DataGenerationService.generateLiuRiForMonth: 调用BaziService.getLiuRi(${year}, ${monthGanZhi}, ${dayStem})`);
      const liuRiData = BaziService.getLiuRi(year, monthGanZhi, dayStem);
      console.log(`🔍 DataGenerationService.generateLiuRiForMonth: 后端返回数据数量=${liuRiData.length}`);

      if (liuRiData.length === 0) {
        console.warn(`⚠️ DataGenerationService.generateLiuRiForMonth: 后端返回空数据，可能是节气查找失败`);
        throw new Error('后端返回空数据');
      }

      // 转换为前端需要的格式
      return liuRiData.map((liuRi) => ({
        year: liuRi.year,
        month: liuRi.month,
        day: liuRi.day,
        ganZhi: liuRi.ganZhi,
        name: `${liuRi.day}日`,
        displayName: liuRi.ganZhi,
        monthGanZhi: liuRi.monthGanZhi,
        shiShenGan: liuRi.shiShenGan, // 修复：正确映射天干十神
        shiShenZhi: liuRi.shiShenZhi, // 修复：正确映射地支十神
        diShi: liuRi.diShi,
        xunKong: liuRi.xunKong,
        naYin: liuRi.naYin,
        shenSha: liuRi.shenSha || [],
        // 生成公历日期显示格式（如：2.4）
        solarDisplay: `${liuRi.month}.${liuRi.day}`,
        isBackend: true // 标识使用后端算法
      }));
    } catch (error) {
      console.error(`❌ 使用后端算法生成${year}年${monthGanZhi}月流日数据失败:`, error);

      // 返回简化的备用数据（30天）
      return Array.from({ length: 30 }, (_, index) => ({
        year,
        month: 1, // 简化
        day: index + 1,
        ganZhi: '甲子', // 简化
        name: `${index + 1}日`,
        displayName: '甲子',
        monthGanZhi,
        shiShen: '比肩',
        diShi: '长生',
        xunKong: ['戌', '亥'],
        naYin: '海中金',
        shenSha: [],
        isBackup: true
      }));
    }
  }

  /**
   * 为指定日期生成流时数据
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @param dayStem 日干（用于计算十神）
   * @param baziInfo 八字信息（用于获取流派设置）
   * @returns 流时数据数组
   */
  static generateLiuShiForDay(year: number, month: number, day: number, dayStem: string = '甲', baziInfo?: any): any[] {
    console.log(`🎯 DataGenerationService.generateLiuShiForDay: 使用后端算法生成${year}年${month}月${day}日流时数据`);

    try {
      // 获取流派设置
      const sect = baziInfo?.baziSect ? parseInt(baziInfo.baziSect) : 2;
      console.log(`🎯 使用八字流派: ${sect} (${sect === 1 ? '晚子时日柱算明天' : '晚子时日柱算当天'})`);

      // 使用后端已有的LiuShiCalculator
      console.log(`🔍 DataGenerationService.generateLiuShiForDay: 调用BaziService.getLiuShi(${year}, ${month}, ${day}, ${dayStem}, ${sect})`);
      const liuShiData = BaziService.getLiuShi(year, month, day, dayStem, sect);
      console.log(`🔍 DataGenerationService.generateLiuShiForDay: 后端返回数据数量=${liuShiData.length}`);

      if (liuShiData.length === 0) {
        console.warn(`⚠️ DataGenerationService.generateLiuShiForDay: 后端返回空数据`);
        throw new Error('后端返回空数据');
      }

      // 转换为前端需要的格式
      return liuShiData.map((liuShi) => ({
        year,
        month,
        day,
        timeIndex: liuShi.index,
        ganZhi: liuShi.ganZhi,
        name: liuShi.name,
        time: liuShi.time,
        displayName: liuShi.ganZhi,
        shiShenGan: liuShi.shiShenGan, // 修复：正确映射天干十神
        shiShenZhi: liuShi.shiShenZhi, // 修复：正确映射地支十神
        diShi: liuShi.diShi,
        xunKong: liuShi.xunKong,
        naYin: liuShi.naYin,
        shenSha: liuShi.shenSha || [],
        isBackend: true // 标识使用后端算法
      }));
    } catch (error) {
      console.error(`❌ 使用后端算法生成${year}年${month}月${day}日流时数据失败:`, error);

      // 返回简化的备用数据（12个时辰）
      const timeNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

      // 获取流派设置
      const sect = baziInfo?.baziSect ? parseInt(baziInfo.baziSect) : 2;

      // 根据流派生成时间范围
      const getBackupTimeRange = (index: number) => {
        if (index === 0) {
          // 子时根据流派调整
          return sect === 1 ? '23:00-01:00*' : '23:00-01:00';
        }
        const standardRanges = [
          '', '01:00-03:00', '03:00-05:00', '05:00-07:00',
          '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
          '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
        ];
        return standardRanges[index] || '';
      };

      return timeNames.map((name, index) => ({
        year,
        month,
        day,
        timeIndex: index,
        ganZhi: '甲子', // 简化
        name,
        range: getBackupTimeRange(index), // 添加根据流派调整的时间范围
        time: `${index * 2 + 1}:00-${index * 2 + 3}:00`,
        displayName: '甲子',
        shiShen: '比肩',
        diShi: '长生',
        xunKong: ['戌', '亥'],
        naYin: '海中金',
        shenSha: [],
        isBackup: true
      }));
    }
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
