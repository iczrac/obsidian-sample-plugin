import { EightChar, Solar } from 'lunar-typescript';
import { XiaoYunInfo } from '../../types/BaziInfo';
import { ShiShenCalculator } from './ShiShenCalculator';
import { XunKongCalculator } from './XunKongCalculator';
import { ShiErChangShengCalculator } from './ShiErChangShengCalculator';
import { UnifiedShenShaService } from './shensha/UnifiedShenShaService';

/**
 * 小运计算器
 * 
 * 小运算法说明：
 * 小运是按年推算的，从出生年开始，每年一个小运。
 * 男命阳年生、女命阴年生：小运顺行（甲子、乙丑、丙寅...）
 * 男命阴年生、女命阳年生：小运逆行（甲子、癸亥、壬戌...）
 * 
 * 小运起法：
 * 1. 确定出生年的天干阴阳性
 * 2. 根据性别和年干阴阳确定顺逆
 * 3. 从时柱开始推算小运干支
 */
export class XiaoYunCalculator {

  /**
   * 计算小运信息
   * @param eightChar 八字对象
   * @param solar 阳历日期
   * @param gender 性别（'1'为男，'0'为女）
   * @param dayStem 日干
   * @param startYear 起始年份
   * @param count 计算数量，默认10年
   * @returns 小运信息数组
   */
  static calculateXiaoYun(
    eightChar: EightChar, 
    solar: Solar, 
    gender: string, 
    dayStem: string,
    startYear?: number,
    count: number = 10
  ): XiaoYunInfo[] {
    console.log(`🎯 XiaoYunCalculator.calculateXiaoYun: 开始计算`, {
      gender,
      dayStem,
      startYear,
      count
    });

    const xiaoYunList: XiaoYunInfo[] = [];

    try {
      // 获取出生年份
      const birthYear = startYear || solar.getYear();
      
      // 获取时柱作为小运起点
      const timeGan = eightChar.getTimeGan();
      const timeZhi = eightChar.getTimeZhi();
      
      // 获取年干判断阴阳
      const yearGan = eightChar.getYearGan();
      const isYangYear = this.isYangGan(yearGan);
      
      // 确定小运顺逆
      // 男命阳年生、女命阴年生：顺行
      // 男命阴年生、女命阳年生：逆行
      const isShunXing = (gender === '1' && isYangYear) || (gender === '0' && !isYangYear);
      
      console.log(`🎯 小运推算参数:`, {
        timeGan,
        timeZhi,
        yearGan,
        isYangYear,
        isShunXing: isShunXing ? '顺行' : '逆行'
      });

      // 计算每年的小运
      for (let i = 0; i < count; i++) {
        const year = birthYear + i;
        const age = i + 1; // 小运从1岁开始
        
        // 计算小运干支
        const xiaoYunGanZhi = this.calculateXiaoYunGanZhi(timeGan, timeZhi, age, isShunXing);
        
        // 计算纳音
        const naYin = this.calculateNaYin(xiaoYunGanZhi);
        
        // 计算旬空
        const xunKong = XunKongCalculator.calculateXunKongByGanZhi(xiaoYunGanZhi);
        
        // 计算十神
        const shiShenGan = ShiShenCalculator.getShiShen(dayStem, xiaoYunGanZhi[0]);
        const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, xiaoYunGanZhi[1]);
        
        // 计算地势（使用十二长生）
        const diShi = this.calculateDiShiForXiaoYun(dayStem, xiaoYunGanZhi[1]);

        // 计算神煞（简化版本，只计算基本神煞）
        const shenSha = UnifiedShenShaService.calculateXiaoYunShenSha(dayStem, xiaoYunGanZhi);

        const xiaoYunInfo: XiaoYunInfo = {
          year,
          age,
          index: i,
          ganZhi: xiaoYunGanZhi,
          naYin,
          xunKong,
          shiShenGan,
          shiShenZhi,
          diShi,
          shenSha
        };

        xiaoYunList.push(xiaoYunInfo);
        
        console.log(`🎯 小运 ${age}岁 (${year}年): ${xiaoYunGanZhi}`);
      }

      console.log(`✅ XiaoYunCalculator.calculateXiaoYun: 计算完成，共${xiaoYunList.length}个小运`);
      return xiaoYunList;

    } catch (error) {
      console.error('❌ XiaoYunCalculator.calculateXiaoYun: 计算失败', error);
      return [];
    }
  }

  /**
   * 计算小运干支
   * @param timeGan 时干
   * @param timeZhi 时支
   * @param age 年龄
   * @param isShunXing 是否顺行
   * @returns 小运干支
   */
  private static calculateXiaoYunGanZhi(timeGan: string, timeZhi: string, age: number, isShunXing: boolean): string {
    const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const ganIndex = gans.indexOf(timeGan);
    const zhiIndex = zhis.indexOf(timeZhi);
    
    if (ganIndex === -1 || zhiIndex === -1) {
      console.warn('无效的时柱干支:', timeGan, timeZhi);
      return timeGan + timeZhi;
    }
    
    let newGanIndex: number;
    let newZhiIndex: number;
    
    if (isShunXing) {
      // 顺行：干支都向前推进
      newGanIndex = (ganIndex + age) % 10;
      newZhiIndex = (zhiIndex + age) % 12;
    } else {
      // 逆行：干支都向后退
      newGanIndex = (ganIndex - age + 10) % 10;
      newZhiIndex = (zhiIndex - age + 12) % 12;
    }
    
    return gans[newGanIndex] + zhis[newZhiIndex];
  }

  /**
   * 判断天干是否为阳干
   * @param gan 天干
   * @returns 是否为阳干
   */
  private static isYangGan(gan: string): boolean {
    const yangGans = ['甲', '丙', '戊', '庚', '壬'];
    return yangGans.includes(gan);
  }

  /**
   * 计算纳音
   * @param ganZhi 干支
   * @returns 纳音
   */
  private static calculateNaYin(ganZhi: string): string {
    if (ganZhi.length !== 2) return '';
    
    try {
      // 使用lunar-typescript计算纳音
      const gan = ganZhi[0];
      const zhi = ganZhi[1];
      
      // 创建一个临时的Solar对象来获取纳音
      const solar = Solar.fromYmd(2000, 1, 1); // 使用固定日期
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      
      // 这里需要根据干支计算纳音，lunar-typescript可能有相关方法
      // 如果没有直接方法，可以使用纳音对照表
      return this.getNaYinByGanZhi(gan, zhi);
      
    } catch (error) {
      console.warn('计算纳音失败:', error);
      return '';
    }
  }

  /**
   * 根据干支获取纳音
   * @param gan 天干
   * @param zhi 地支
   * @returns 纳音
   */
  private static getNaYinByGanZhi(gan: string, zhi: string): string {
    // 纳音对照表（60甲子纳音）
    const naYinMap: { [key: string]: string } = {
      '甲子': '海中金', '乙丑': '海中金',
      '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木',
      '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金',
      '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水',
      '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金',
      '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水',
      '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火',
      '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水',
      '甲午': '砂中金', '乙未': '砂中金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };
    
    const ganZhi = gan + zhi;
    return naYinMap[ganZhi] || '';
  }

  /**
   * 计算小运地势
   * @param dayStem 日干
   * @param branch 地支
   * @returns 地势
   */
  private static calculateDiShiForXiaoYun(dayStem: string, branch: string): string {
    // 十二长生对照表
    const changShengMap: { [key: string]: { [key: string]: string } } = {
      '甲': {
        '亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官',
        '卯': '帝旺', '辰': '衰', '巳': '病', '午': '死',
        '未': '墓', '申': '绝', '酉': '胎', '戌': '养'
      },
      '乙': {
        '午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官',
        '寅': '帝旺', '丑': '衰', '子': '病', '亥': '死',
        '戌': '墓', '酉': '绝', '申': '胎', '未': '养'
      },
      '丙': {
        '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官',
        '午': '帝旺', '未': '衰', '申': '病', '酉': '死',
        '戌': '墓', '亥': '绝', '子': '胎', '丑': '养'
      },
      '丁': {
        '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官',
        '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死',
        '丑': '墓', '子': '绝', '亥': '胎', '戌': '养'
      },
      '戊': {
        '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官',
        '午': '帝旺', '未': '衰', '申': '病', '酉': '死',
        '戌': '墓', '亥': '绝', '子': '胎', '丑': '养'
      },
      '己': {
        '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官',
        '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死',
        '丑': '墓', '子': '绝', '亥': '胎', '戌': '养'
      },
      '庚': {
        '巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官',
        '酉': '帝旺', '戌': '衰', '亥': '病', '子': '死',
        '丑': '墓', '寅': '绝', '卯': '胎', '辰': '养'
      },
      '辛': {
        '子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官',
        '申': '帝旺', '未': '衰', '午': '病', '巳': '死',
        '辰': '墓', '卯': '绝', '寅': '胎', '丑': '养'
      },
      '壬': {
        '申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官',
        '子': '帝旺', '丑': '衰', '寅': '病', '卯': '死',
        '辰': '墓', '巳': '绝', '午': '胎', '未': '养'
      },
      '癸': {
        '卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官',
        '亥': '帝旺', '戌': '衰', '酉': '病', '申': '死',
        '未': '墓', '午': '绝', '巳': '胎', '辰': '养'
      }
    };

    return changShengMap[dayStem]?.[branch] || '';
  }


}
