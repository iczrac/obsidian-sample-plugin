import { EightChar, Solar } from 'lunar-typescript';

/**
 * 起运信息接口
 */
export interface QiYunInfo {
  startYear: number;      // 起运年数
  startMonth: number;     // 起运月数
  startDay: number;       // 起运天数
  startHour: number;      // 起运小时数（流派1为0，流派2支持）
  startSolar: Solar;      // 起运的阳历日期
  sect: number;           // 使用的流派
}

/**
 * 起运计算器
 * 
 * 起运算法流派说明：
 * 
 * 流派1：阳年生男、阴年生女从出生时辰开始往后推至下一个节令时辰，
 *       阴年生男、阳年生女从出生时辰开始往前倒推至上一个节令时辰，
 *       计算经历的天数和时辰数，按3天为1年，1天为4个月，1个时辰为10天进行换算，
 *       得到出生几年几个月几天后起运。
 * 
 * 流派2：阳年生男、阴年生女从出生时辰开始往后推至下一个节令时辰，
 *       阴年生男、阳年生女从出生时辰开始往前倒推至上一个节令时辰，
 *       计算经历的分钟数，按4320分钟为1年，360分钟为1个月，12分钟为1天，
 *       1分钟为2小时进行换算，得到出生几年几个月几天几小时后起运。
 */
export class QiYunCalculator {
  
  /**
   * 计算起运信息
   * @param eightChar 八字对象
   * @param gender 性别，1为男，0为女
   * @param sect 流派，1为流派1，2为流派2，默认为1
   * @returns 起运信息
   */
  static calculateQiYun(eightChar: EightChar, gender: number, sect: number = 1): QiYunInfo {
    console.log(`🔍 QiYunCalculator.calculateQiYun: 开始计算起运，性别=${gender}, 流派=${sect}`);
    
    try {
      // 使用lunar-typescript的getYun方法获取运
      const yun = eightChar.getYun(gender, sect);
      
      // 获取起运信息
      const startYear = yun.getStartYear();
      const startMonth = yun.getStartMonth();
      const startDay = yun.getStartDay();
      const startHour = yun.getStartHour(); // 流派1返回0，流派2支持小时
      const startSolar = yun.getStartSolar();
      
      console.log(`✅ QiYunCalculator.calculateQiYun: 计算完成`, {
        startYear,
        startMonth,
        startDay,
        startHour,
        startSolar: startSolar.toYmd(),
        sect
      });
      
      return {
        startYear,
        startMonth,
        startDay,
        startHour,
        startSolar,
        sect
      };
      
    } catch (error) {
      console.error('❌ QiYunCalculator.calculateQiYun: 计算失败', error);
      throw new Error(`起运计算失败: ${error.message}`);
    }
  }
  
  /**
   * 格式化起运信息为显示文本
   * @param qiYunInfo 起运信息
   * @returns 格式化的起运文本
   */
  static formatQiYunInfo(qiYunInfo: QiYunInfo): string {
    const { startYear, startMonth, startDay, startHour, startSolar, sect } = qiYunInfo;
    
    let result = `起运：${startYear}年`;
    
    if (startMonth > 0) {
      result += `${startMonth}个月`;
    }
    
    if (startDay > 0) {
      result += `${startDay}天`;
    }
    
    // 流派2支持小时显示
    if (sect === 2 && startHour > 0) {
      result += `${startHour}小时`;
    }
    
    // 添加起运日期
    if (startSolar) {
      result += ` (${startSolar.toYmd()})`;
    }
    
    return result;
  }
  
  /**
   * 获取起运流派说明
   * @param sect 流派编号
   * @returns 流派说明
   */
  static getSectDescription(sect: number): string {
    switch (sect) {
      case 1:
        return '流派1：按3天=1年换算，精度到天';
      case 2:
        return '流派2：按4320分钟=1年换算，精度到小时';
      default:
        return '未知流派';
    }
  }
  
  /**
   * 验证起运参数
   * @param gender 性别
   * @param sect 流派
   * @returns 是否有效
   */
  static validateParams(gender: number, sect: number): boolean {
    // 性别必须是0或1
    if (gender !== 0 && gender !== 1) {
      console.error('❌ QiYunCalculator: 无效的性别参数', gender);
      return false;
    }
    
    // 流派必须是1或2
    if (sect !== 1 && sect !== 2) {
      console.error('❌ QiYunCalculator: 无效的流派参数', sect);
      return false;
    }
    
    return true;
  }
}
