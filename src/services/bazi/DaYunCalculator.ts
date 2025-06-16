import { EightChar, Solar } from 'lunar-typescript';
import { DaYunInfo } from '../../types/BaziInfo';
import { BaziCalculator } from './BaziCalculator';
import { ShiShenCalculator } from './ShiShenCalculator';
import { UnifiedShenShaService } from './UnifiedShenShaService';

/**
 * 大运计算器
 * 负责计算大运相关信息
 */
export class DaYunCalculator {
  /**
   * 计算大运信息
   * @param eightChar 八字对象
   * @param solar 阳历对象
   * @param gender 性别（'1'-男，'0'-女）
   * @param dayStem 日干
   * @param count 大运步数，默认10步
   * @returns 大运信息数组
   */
  static calculateDaYun(
    eightChar: EightChar, 
    solar: Solar, 
    gender: string, 
    dayStem: string, 
    count = 10
  ): DaYunInfo[] {
    console.log('🔍 DaYunCalculator.calculateDaYun 开始');
    console.log('🔍 参数: gender =', gender, ', dayStem =', dayStem, ', count =', count);

    if (gender !== '1' && gender !== '0') {
      console.log('🚨 DaYunCalculator: 性别参数无效:', gender);
      return [];
    }

    try {
      console.log('🔍 DaYunCalculator: 获取运势对象...');
      // 获取运势信息
      const yun = eightChar.getYun(gender === '1' ? 1 : 0);
      console.log('🔍 DaYunCalculator: 运势对象获取成功:', yun);

      console.log('🔍 DaYunCalculator: 获取大运列表...');
      const daYunList = yun.getDaYun(count);
      console.log('🔍 DaYunCalculator: 大运列表获取成功，数量:', daYunList.length);

      // 处理大运信息
      return daYunList.map((dy, index) => {
        const ganZhi = dy.getGanZhi();

        // 检查干支是否有效
        if (!ganZhi || ganZhi.trim() === '') {
          console.log(`🔍 DaYunCalculator: 发现前运期间，索引: ${index}（还未排上大运）`);
          // 计算前运干支
          const qianYunInfo = this.calculateQianYun(daYunList, index, eightChar, gender, dayStem);
          if (qianYunInfo) {
            console.log(`✅ DaYunCalculator: 前运计算成功: ${qianYunInfo.ganZhi}`);
            return {
              startYear: dy.getStartYear(),
              endYear: dy.getEndYear(),
              startAge: dy.getStartAge(),
              endAge: dy.getEndAge(),
              index: dy.getIndex(),
              ganZhi: qianYunInfo.ganZhi,
              naYin: qianYunInfo.naYin,
              shiShenGan: qianYunInfo.shiShenGan,
              shiShenZhi: qianYunInfo.shiShenZhi,
              diShi: qianYunInfo.diShi,
              xunKong: qianYunInfo.xunKong,
              shenSha: qianYunInfo.shenSha,
              isQianYun: true // 标记为前运
            };
          } else {
            console.log(`❌ DaYunCalculator: 前运计算失败，返回空对象`);
            // 返回一个空的大运对象，表示前运（还未排上大运）
            return {
              startYear: dy.getStartYear(),
              endYear: dy.getEndYear(),
              startAge: dy.getStartAge(),
              endAge: dy.getEndAge(),
              index: dy.getIndex(),
              ganZhi: '',
              naYin: '',
              shiShenGan: '',
              shiShenZhi: '',
              diShi: '',
              xunKong: '',
              shenSha: []
            };
          }
        }

        const naYin = BaziCalculator.getNaYin(ganZhi);
        const shiShenGan = ShiShenCalculator.getShiShen(dayStem, ganZhi.charAt(0));
        const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, ganZhi.charAt(1));

        // 计算大运神煞
        const shenSha = UnifiedShenShaService.calculateDaYunShenSha(dayStem, ganZhi);

        // 计算地势
        const diShi = this.calculateDiShi(ganZhi.charAt(0), ganZhi.charAt(1));

        // 安全获取旬空信息
        let xunKong = '';
        try {
          console.log('🔍 DaYunCalculator: 尝试获取大运旬空，干支:', ganZhi);
          console.log('🔍 DaYunCalculator: dy对象:', dy);
          console.log('🔍 DaYunCalculator: dy.getXunKong方法存在:', typeof dy.getXunKong === 'function');

          xunKong = dy.getXunKong() || '';
          console.log('🔍 DaYunCalculator: 成功获取旬空:', xunKong);
        } catch (e) {
          console.warn('🚨 DaYunCalculator: 获取大运旬空信息失败:', e);
          console.warn('🚨 DaYunCalculator: 错误详情:', e.message);
          console.warn('🚨 DaYunCalculator: 错误堆栈:', e.stack);
          // 使用备用方法计算旬空
          xunKong = DaYunCalculator.calculateXunKongSafe(ganZhi);
          console.log('🔍 DaYunCalculator: 使用备用方法计算旬空结果:', xunKong);
        }

        return {
          startYear: dy.getStartYear(),
          endYear: dy.getEndYear(),
          startAge: dy.getStartAge(),
          endAge: dy.getEndAge(),
          index: dy.getIndex(),
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
      console.error('计算大运出错:', e);
      return [];
    }
  }

  /**
   * 计算前运信息
   * @param daYunList 大运列表
   * @param currentIndex 当前索引
   * @param eightChar 八字对象
   * @param gender 性别
   * @param dayStem 日干
   * @returns 前运信息
   */
  private static calculateQianYun(
    daYunList: any[],
    currentIndex: number,
    eightChar: EightChar,
    gender: string,
    dayStem: string
  ): {
    ganZhi: string;
    naYin: string;
    shiShenGan: string;
    shiShenZhi: string;
    diShi: string;
    xunKong: string;
    shenSha: string[];
  } | null {
    console.log(`🔍 DaYunCalculator.calculateQianYun: 开始计算前运，当前索引=${currentIndex}`);

    // 查找第一个有效的大运来反推前运
    let firstValidDaYun: any = null;
    let firstValidIndex = -1;

    for (let i = currentIndex + 1; i < daYunList.length; i++) {
      const dy = daYunList[i];
      const ganZhi = dy.getGanZhi();
      if (ganZhi && ganZhi.trim() !== '') {
        firstValidDaYun = dy;
        firstValidIndex = i;
        console.log(`🔍 calculateQianYun: 找到第一个有效大运[${i}]: ${ganZhi}`);
        break;
      }
    }

    if (!firstValidDaYun) {
      console.log(`❌ calculateQianYun: 未找到有效大运，无法计算前运`);
      return null;
    }

    // 获取年干来判断阴阳年
    const yearStem = eightChar.getYear();
    const isYangYear = this.isYangStem(yearStem);

    // 男性：阳年顺行，阴年逆行
    // 女性：阳年逆行，阴年顺行
    const isShunXing = (gender === '1') ? isYangYear : !isYangYear;

    console.log(`🔍 calculateQianYun: 年干=${yearStem}, 阳年=${isYangYear}, 性别=${gender === '1' ? '男' : '女'}, 顺行=${isShunXing}`);

    // 计算前运干支（反推）
    const stepsBack = firstValidIndex - currentIndex;
    const firstValidGanZhi = firstValidDaYun.getGanZhi();
    const qianYunGanZhi = this.calculateGanZhiStepsBack(firstValidGanZhi, stepsBack, isShunXing);

    if (!qianYunGanZhi || qianYunGanZhi.length < 2) {
      console.log(`❌ calculateQianYun: 前运干支计算失败`);
      return null;
    }

    console.log(`✅ calculateQianYun: 前运干支=${qianYunGanZhi}`);

    // 计算前运的其他信息
    const naYin = BaziCalculator.getNaYin(qianYunGanZhi);
    const shiShenGan = ShiShenCalculator.getShiShen(dayStem, qianYunGanZhi.charAt(0));
    const shiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, qianYunGanZhi.charAt(1));
    const diShi = this.calculateDiShi(qianYunGanZhi.charAt(0), qianYunGanZhi.charAt(1));
    const xunKong = this.calculateXunKongSafe(qianYunGanZhi);
    const shenSha = UnifiedShenShaService.calculateDaYunShenSha(dayStem, qianYunGanZhi);

    return {
      ganZhi: qianYunGanZhi,
      naYin,
      shiShenGan,
      shiShenZhi: Array.isArray(shiShenZhi) ? shiShenZhi.join(',') : shiShenZhi,
      diShi,
      xunKong,
      shenSha
    };
  }

  /**
   * 计算起运信息
   * @param eightChar 八字对象
   * @param solar 阳历对象
   * @param gender 性别
   * @returns 起运信息
   */
  static calculateQiYunInfo(eightChar: EightChar, solar: Solar, gender: string): {
    qiYunYear?: number;
    qiYunAge?: number;
    qiYunDate?: string;
    qiYunMonth?: number;
    qiYunDay?: number;
    qiYunTime?: number;
  } {
    if (gender !== '1' && gender !== '0') {
      return {};
    }

    try {
      const yun = eightChar.getYun(gender === '1' ? 1 : 0);
      const startSolar = yun.getStartSolar();
      
      const qiYunYear = startSolar.getYear();
      const qiYunAge = qiYunYear - solar.getYear();
      const qiYunDate = `${startSolar.getYear()}-${startSolar.getMonth().toString().padStart(2, '0')}-${startSolar.getDay().toString().padStart(2, '0')}`;

      return {
        qiYunYear,
        qiYunAge,
        qiYunDate,
        qiYunMonth: startSolar.getMonth(),
        qiYunDay: startSolar.getDay(),
        qiYunTime: startSolar.getHour()
      };
    } catch (e) {
      console.error('计算起运信息出错:', e);
      return {};
    }
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
   * 安全计算旬空（使用统一的BaziCalculator方法）
   * @param ganZhi 干支
   * @returns 旬空信息
   */
  private static calculateXunKongSafe(ganZhi: string): string {
    if (!ganZhi || ganZhi.length !== 2) {
      return '';
    }

    try {
      // 使用统一的BaziCalculator旬空计算方法
      const stem = ganZhi.charAt(0);
      const branch = ganZhi.charAt(1);
      return BaziCalculator.calculateXunKong(stem, branch);
    } catch (e) {
      console.warn('统一旬空计算失败:', e);
      return '';
    }
  }

  /**
   * 判断是否为阳干
   * @param stem 天干
   * @returns 是否为阳干
   */
  private static isYangStem(stem: string): boolean {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem);
  }

  /**
   * 计算干支向前推算指定步数
   * @param ganZhi 起始干支
   * @param steps 步数
   * @param isShunXing 是否顺行
   * @returns 推算后的干支
   */
  private static calculateGanZhiStepsBack(ganZhi: string, steps: number, isShunXing: boolean): string {
    if (!ganZhi || ganZhi.length < 2 || steps <= 0) {
      return ganZhi;
    }

    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const currentStem = ganZhi[0];
    const currentBranch = ganZhi[1];

    const stemIndex = stems.indexOf(currentStem);
    const branchIndex = branches.indexOf(currentBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      console.log(`❌ calculateGanZhiStepsBack: 无效的干支 ${ganZhi}`);
      return ganZhi;
    }

    // 计算新的干支索引
    let newStemIndex: number;
    let newBranchIndex: number;

    if (isShunXing) {
      // 顺行：向前推算是减法
      newStemIndex = (stemIndex - steps + stems.length * 10) % stems.length;
      newBranchIndex = (branchIndex - steps + branches.length * 10) % branches.length;
    } else {
      // 逆行：向前推算是加法
      newStemIndex = (stemIndex + steps) % stems.length;
      newBranchIndex = (branchIndex + steps) % branches.length;
    }

    const newGanZhi = stems[newStemIndex] + branches[newBranchIndex];
    console.log(`🔍 calculateGanZhiStepsBack: ${ganZhi} ${isShunXing ? '顺行' : '逆行'} 前推${steps}步 → ${newGanZhi}`);

    return newGanZhi;
  }

  /**
   * 获取大运起始年龄
   * @param eightChar 八字对象
   * @param gender 性别
   * @returns 起始年龄
   */
  static getDaYunStartAge(eightChar: EightChar, gender: string): number {
    if (gender !== '1' && gender !== '0') {
      return 0;
    }

    try {
      const yun = eightChar.getYun(gender === '1' ? 1 : 0);
      const daYunList = yun.getDaYun(1);
      return daYunList.length > 0 ? daYunList[0].getStartAge() : 0;
    } catch (e) {
      console.error('获取大运起始年龄出错:', e);
      return 0;
    }
  }
}
