import { Solar } from 'lunar-typescript';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { XunKongCalculator } from './XunKongCalculator';
import { LiuShiInfo } from '../../types/BaziInfo';
import { ShenShaTimeService } from './shensha/ShenShaTimeService';

/**
 * 流时计算器
 * 专门处理流时相关计算
 */
export class LiuShiCalculator {
  
  /**
   * 计算指定日期的流时信息
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @param dayStem 日干（用于计算十神）
   * @param sect 八字流派（1或2，影响子时处理）
   * @returns 流时信息数组（12个时辰）
   */
  static calculateLiuShi(year: number, month: number, day: number, dayStem: string, sect = 2): LiuShiInfo[] {
    console.log(`⏰ LiuShiCalculator.calculateLiuShi 开始`);
    console.log(`⏰ 参数: year = ${year}, month = ${month}, day = ${day}, dayStem = ${dayStem}, sect = ${sect}`);

    const liuShiData: LiuShiInfo[] = [];

    // 使用lunar-typescript库创建Solar对象获取基准日期
    const baseSolar = Solar.fromYmd(year, month, day);
    const baseLunar = baseSolar.getLunar();
    const baseEightChar = baseLunar.getEightChar();
    const dayGan = baseEightChar.getDayGan();

    console.log(`⏰ ${year}-${month}-${day} 日干: ${dayGan}`);

    // 12个时辰（时间范围统一，流派只影响干支计算）
    const timeRanges = [
      { time: 23, name: '子时', range: '23:00-01:00' },
      { time: 1, name: '丑时', range: '01:00-03:00' },
      { time: 3, name: '寅时', range: '03:00-05:00' },
      { time: 5, name: '卯时', range: '05:00-07:00' },
      { time: 7, name: '辰时', range: '07:00-09:00' },
      { time: 9, name: '巳时', range: '09:00-11:00' },
      { time: 11, name: '午时', range: '11:00-13:00' },
      { time: 13, name: '未时', range: '13:00-15:00' },
      { time: 15, name: '申时', range: '15:00-17:00' },
      { time: 17, name: '酉时', range: '17:00-19:00' },
      { time: 19, name: '戌时', range: '19:00-21:00' },
      { time: 21, name: '亥时', range: '21:00-23:00' }
    ];

    for (let i = 0; i < timeRanges.length; i++) {
      try {
        const timeInfo = timeRanges[i];

        // 使用lunar-typescript库创建该时辰的Solar对象
        // 使用时辰的中间时间点（如子时使用0点）
        const timeTime = i * 2; // 每个时辰2小时，子时=0点，丑时=2点...
        const solar = Solar.fromYmdHms(year, month, day, timeTime, 0, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // 设置八字流派（影响子时处理）
        eightChar.setSect(sect);

        // 获取时柱干支
        const stem = eightChar.getTimeGan();
        const branch = eightChar.getTimeZhi();
        const ganZhi = stem + branch;

        // 计算纳音
        const naYin = eightChar.getTimeNaYin();

        // 计算旬空
        const xunKong = XunKongCalculator.calculateXunKongByGanZhi(ganZhi);

        // 计算十神
        const shiShenGan = ShiShenCalculator.getShiShen(dayStem, stem);
        const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, branch);

        // 计算地势
        const diShi = BaziCalculator.getDiShi(dayStem, branch);

        // 计算神煞信息（流时计算时没有完整四柱信息，细分空亡将被跳过）
        const shenSha = ShenShaTimeService.calculateLiuShiShenSha(dayStem, ganZhi);

        liuShiData.push({
          year,
          month,
          day,
          time: timeInfo.time,
          index: i,
          name: timeInfo.name,
          range: timeInfo.range, // 添加根据流派调整的时间范围
          ganZhi,
          naYin,
          xunKong,
          shiShenGan,
          shiShenZhi,
          diShi,
          shenSha
        });

        console.log(`⏰ 流时 ${timeInfo.name} (${ganZhi}) 计算完成`);
      } catch (error) {
        console.error(`⏰ 计算流时 ${timeRanges[i].name} 时出错:`, error);
      }
    }

    console.log(`⏰ LiuShiCalculator.calculateLiuShi 完成，共计算 ${liuShiData.length} 个时辰`);
    return liuShiData;
  }



  /**
   * 获取时辰名称
   * @param timeIndex 时辰索引（0-11）
   * @returns 时辰名称
   */
  static getTimeName(timeIndex: number): string {
    const timeNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
    return timeNames[timeIndex] || `${timeIndex}时`;
  }

  /**
   * 获取时辰时间范围（标准时间范围，不受流派影响）
   * @param timeIndex 时辰索引（0-11）
   * @returns 时间范围字符串
   */
  static getTimeRange(timeIndex: number): string {
    const timeRanges = [
      '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
      '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
      '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
    ];
    return timeRanges[timeIndex] || '';
  }

  /**
   * 获取流派说明（用于tooltip或详细说明）
   * @param sect 八字流派（1或2）
   * @returns 流派说明
   */
  static getSectDescription(sect: number): string {
    if (sect === 1) {
      return '流派1：晚子时日柱算明天（影响日柱计算，不影响时间显示）';
    } else {
      return '流派2：晚子时日柱算当天（影响日柱计算，不影响时间显示）';
    }
  }
}
