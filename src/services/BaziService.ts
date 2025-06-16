import { Solar, Lunar, EightChar } from 'lunar-typescript';
import { BaziInfo, DaYunInfo, LiuNianInfo } from '../types/BaziInfo';
import { BaziUtils } from './bazi/BaziUtils';
import { BaziCalculator } from './bazi/BaziCalculator';
import { ShiShenCalculator } from './bazi/ShiShenCalculator';
import { CombinationCalculator } from './bazi/CombinationCalculator';
import { DaYunCalculator } from './bazi/DaYunCalculator';
import { LiuNianCalculator } from './bazi/LiuNianCalculator';
import { XiaoYunCalculator } from './bazi/XiaoYunCalculator';
import { UnifiedShenShaService } from './bazi/shensha/UnifiedShenShaService';
import { YearMatchCalculator } from './bazi/YearMatchCalculator';
import { XunKongCalculator } from './bazi/XunKongCalculator';
import { GeJuExplanationService } from './GeJuExplanationService';
import { ShenShaExplanationService } from './bazi/shensha/ShenShaExplanationService';
import { WuXingExplanationService } from './WuXingExplanationService';
import { GeJuCalculator } from './bazi/GeJuCalculator';
import { WuXingStrengthCalculator } from './bazi/WuXingStrengthCalculator';
import { ShiErChangShengCalculator } from './bazi/ShiErChangShengCalculator';
import { LiuRiCalculator } from './bazi/LiuRiCalculator';
import { LiuShiCalculator } from './bazi/LiuShiCalculator';
import { LiuYueCalculator } from './bazi/LiuYueCalculator';
import { QiYunCalculator } from './bazi/QiYunCalculator';

/**
 * 八字服务类，封装lunar-typescript的八字功能
 * 精简版本，只保留核心功能
 */
export class BaziService {
  /**
   * 从公历日期获取八字信息
   * @param year 年
   * @param month 月
   * @param day 日
   * @param time 时（0-23）
   * @param gender 性别
   * @param sect 八字流派
   * @param qiYunSect 起运流派
   * @returns 八字信息对象
   */
  static getBaziFromDate(year: number, month: number, day: number, time = 0, gender = '', sect = '2', qiYunSect = 1): BaziInfo {
    // 创建阳历对象
    const solar = Solar.fromYmdHms(year, month, day, time, 0, 0);
    // 转换为农历
    const lunar = solar.getLunar();
    // 获取八字
    const eightChar = lunar.getEightChar();

    return this.formatBaziInfo(solar, lunar, eightChar, gender, sect, undefined, qiYunSect);
  }

  /**
   * 从农历日期获取八字信息
   * @param year 农历年
   * @param month 农历月
   * @param day 农历日
   * @param time 时（0-23）
   * @param isLeapMonth 是否闰月
   * @param gender 性别
   * @param sect 八字流派
   * @param qiYunSect 起运流派
   * @returns 八字信息对象
   */
  static getBaziFromLunarDate(year: number, month: number, day: number, time = 0, isLeapMonth = false, gender = '', sect = '2', qiYunSect = 1): BaziInfo {
    // 创建农历对象
    // Lunar.fromYmdHms只接受6个参数，不支持isLeapMonth参数
    // 需要使用其他方法处理闰月
    let lunar: Lunar;
    if (isLeapMonth) {
      // 对于闰月，我们需要使用其他方法
      // 这里简化处理，实际应用中可能需要更复杂的逻辑
      lunar = Lunar.fromYmd(year, month, day);
    } else {
      lunar = Lunar.fromYmdHms(year, month, day, time, 0, 0);
    }
    // 转换为阳历
    const solar = lunar.getSolar();
    // 获取八字
    const eightChar = lunar.getEightChar();

    return this.formatBaziInfo(solar, lunar, eightChar, gender, sect, undefined, qiYunSect);
  }

  /**
   * 解析八字字符串
   * @param baziStr 八字字符串，如"甲子 乙丑 丙寅 丁卯"
   * @param specifiedYear 指定的年份，如果提供则使用此年份而不是反推
   * @param gender 性别（1-男，0-女）
   * @param sect 八字流派（1或2）
   * @param qiYunSect 起运流派（1或2）
   * @returns 八字信息对象
   */
  static parseBaziString(baziStr: string, specifiedYear?: string, gender = '', sect = '2', qiYunSect = 1): BaziInfo {
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 BaziService.parseBaziString 开始 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('🔥 ========== BaziService.parseBaziString 开始 ==========');
    console.log('🔥 输入参数:');
    console.log('  - baziStr:', baziStr);
    console.log('  - specifiedYear:', specifiedYear);
    console.log('  - gender:', gender);
    console.log('  - sect:', sect);

    // 清理并分割八字字符串
    const parts = baziStr.replace(/\s+/g, ' ').trim().split(' ');

    if (parts.length !== 4) {
      throw new Error('八字格式不正确，应为"年柱 月柱 日柱 时柱"的格式，如"甲子 乙丑 丙寅 丁卯"');
    }

    console.log('🔥 八字分割结果:', parts);

    // 提取天干地支
    const yearStem = parts[0][0];
    const yearBranch = parts[0][1];
    const monthStem = parts[1][0];
    const monthBranch = parts[1][1];
    const dayStem = parts[2][0];
    const dayBranch = parts[2][1];
    const timeStem = parts[3][0];
    const timeBranch = parts[3][1];

    // 计算五行
    const yearWuXing = BaziUtils.getStemWuXing(yearStem);
    const monthWuXing = BaziUtils.getStemWuXing(monthStem);
    const dayWuXing = BaziUtils.getStemWuXing(dayStem);
    const timeWuXing = BaziUtils.getStemWuXing(timeStem);

    // 计算纳音
    const yearNaYin = BaziCalculator.getNaYin(yearStem + yearBranch);
    const monthNaYin = BaziCalculator.getNaYin(monthStem + monthBranch);
    const dayNaYin = BaziCalculator.getNaYin(dayStem + dayBranch);
    const timeNaYin = BaziCalculator.getNaYin(timeStem + timeBranch);

    // 初始化日期相关变量
    let solarDate = '----年--月--日';
    let lunarDate = '农历----年--月--日';
    let solarTime = '--:--';
    let solar: Solar | null = null;
    let lunar: Lunar | null = null;
    let eightChar: EightChar | null = null;

    // 计算匹配的年份列表（使用完整八字信息）
    console.log('🔍 年份匹配计算参数:', {
      yearStem, yearBranch,
      monthStem, monthBranch,
      dayStem, dayBranch,
      timeStem: timeStem, timeBranch: timeBranch, // 统一使用 time 前缀
      sect: parseInt(sect),
      baseYear: 1
    });

    const matchingYears = YearMatchCalculator.calculateMatchingYears(
      yearStem, yearBranch,
      monthStem, monthBranch,
      dayStem, dayBranch,
      timeStem, timeBranch, // 传入解析的 timeStem/timeBranch，YearMatchCalculator 内部统一为 timeStem/timeBranch
      parseInt(sect), // 使用系统设置的流派
      1 // 起始年份设为1，确保能找到所有可能的年份
    );

    // 如果指定了年份，尝试使用指定的年份进行日期推算
    const yearNum = specifiedYear ? parseInt(specifiedYear) : undefined;
    if (yearNum) {
      console.log('🔥 尝试日期反推，年份:', yearNum);
      console.log('🔥 匹配年份列表:', matchingYears);
      console.log('🔥 年份是否在匹配列表中:', matchingYears.includes(yearNum));

      try {
        // 使用lunar-typescript库的Solar.fromBaZi方法反推日期
        // 这个方法可能返回多个匹配的日期
        const solarList = Solar.fromBaZi(
          yearStem + yearBranch,
          monthStem + monthBranch,
          dayStem + dayBranch,
          timeStem + timeBranch,
          parseInt(sect), // 流派
          1 // 起始年份设为1，确保能找到所有可能的日期
        );

        console.log('🔥 fromBaZi返回的日期数量:', solarList.length);

        // 找到指定年份的日期
        let matchingSolar: Solar | null = null;
        for (const s of solarList) {
          console.log('🔥 检查日期:', s.getYear(), s.getMonth(), s.getDay());
          if (s.getYear() === yearNum) {
            matchingSolar = s;
            break;
          }
        }

        // 如果找到匹配的日期
        if (matchingSolar) {
          solar = matchingSolar;
          lunar = matchingSolar.getLunar();
          eightChar = lunar.getEightChar();

          // 格式化日期
          solarDate = `${matchingSolar.getYear()}-${matchingSolar.getMonth().toString().padStart(2, '0')}-${matchingSolar.getDay().toString().padStart(2, '0')}`;
          lunarDate = lunar.toString();
          solarTime = `${matchingSolar.getHour().toString().padStart(2, '0')}:${matchingSolar.getMinute().toString().padStart(2, '0')}`;

          console.log('🔥 ✅ 日期反推成功 - 指定年份:', yearNum);
          console.log('🔥 ✅ 日期反推结果 - 阳历日期:', solarDate);
          console.log('🔥 ✅ 日期反推结果 - 农历日期:', lunarDate);
        } else {
          console.log('🔥 ❌ 日期反推失败 - 未找到指定年份的匹配日期');

          // 即使反推失败，也创建一个基本的Solar对象用于大运计算
          // 使用年份的第一天作为基准日期
          console.log('🔥 🔧 创建基准Solar对象用于大运计算');
          try {
            solar = Solar.fromYmd(yearNum, 1, 1);
            lunar = solar.getLunar();
            // 创建一个基于用户输入八字的EightChar对象
            eightChar = lunar.getEightChar();
            // 手动设置八字信息
            eightChar.setSect(parseInt(sect));

            console.log('🔥 ✅ 基准Solar对象创建成功');
          } catch (e) {
            console.error('🔥 ❌ 创建基准Solar对象失败:', e);
          }
        }
      } catch (error) {
        console.error('🔥 ❌ 日期推算出错:', error);

        // 如果出错，也尝试创建基准Solar对象
        if (yearNum) {
          try {
            console.log('🔥 🔧 错误恢复：创建基准Solar对象');
            solar = Solar.fromYmd(yearNum, 1, 1);
            lunar = solar.getLunar();
            eightChar = lunar.getEightChar();
            eightChar.setSect(parseInt(sect));
            console.log('🔥 ✅ 错误恢复成功');
          } catch (e) {
            console.error('🔥 ❌ 错误恢复失败:', e);
          }
        }
      }
    }

    // 如果有指定年份且成功推算日期，使用lunar-typescript库获取更多信息
    if (yearNum && solar && lunar && eightChar) {
      console.log('🔥 formatBaziInfo路径：传递用户输入八字信息');

      // 准备用户输入的八字信息
      const userInputBazi = {
        yearStem, yearBranch, monthStem, monthBranch,
        dayStem, dayBranch, timeStem, timeBranch
      };

      // 使用formatBaziInfo获取完整的八字信息
      // 注意：传递用户输入八字信息，对五行强度计算使用虚拟八字对象，对大运计算使用原始八字对象
      const baziInfo = this.formatBaziInfo(solar, lunar, eightChar, gender, sect, userInputBazi, qiYunSect);

      console.log('🔥 ✅ formatBaziInfo已使用虚拟八字对象，计算完成');

      // 使用用户输入的原始八字信息，而不是反推后的八字
      // 年柱
      baziInfo.yearPillar = parts[0];
      baziInfo.yearStem = yearStem;
      baziInfo.yearBranch = yearBranch;
      baziInfo.yearHideGan = BaziCalculator.getHideGan(yearBranch);
      baziInfo.yearWuXing = BaziUtils.getStemWuXing(yearStem);
      baziInfo.yearNaYin = BaziCalculator.getNaYin(yearStem + yearBranch);
      baziInfo.yearShengXiao = BaziUtils.getShengXiao(yearBranch);
      baziInfo.yearShiShenGan = ShiShenCalculator.getShiShen(dayStem, yearStem);
      baziInfo.yearShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, yearBranch);

      // 月柱
      baziInfo.monthPillar = parts[1];
      baziInfo.monthStem = monthStem;
      baziInfo.monthBranch = monthBranch;
      baziInfo.monthHideGan = BaziCalculator.getHideGan(monthBranch);
      baziInfo.monthWuXing = BaziUtils.getStemWuXing(monthStem);
      baziInfo.monthNaYin = BaziCalculator.getNaYin(monthStem + monthBranch);
      baziInfo.monthShengXiao = BaziUtils.getShengXiao(monthBranch);
      baziInfo.monthShiShenGan = ShiShenCalculator.getShiShen(dayStem, monthStem);
      baziInfo.monthShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, monthBranch);

      // 日柱
      baziInfo.dayPillar = parts[2];
      baziInfo.dayStem = dayStem;
      baziInfo.dayBranch = dayBranch;
      baziInfo.dayHideGan = BaziCalculator.getHideGan(dayBranch);
      baziInfo.dayWuXing = BaziUtils.getStemWuXing(dayStem);
      baziInfo.dayNaYin = BaziCalculator.getNaYin(dayStem + dayBranch);
      baziInfo.dayShengXiao = BaziUtils.getShengXiao(dayBranch);
      baziInfo.dayShiShen = '日主'; // 日柱天干是日主自己
      baziInfo.dayShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, dayBranch);

      // 时柱
      baziInfo.timePillar = parts[3];
      baziInfo.timeStem = timeStem;
      baziInfo.timeBranch = timeBranch;
      baziInfo.timeHideGan = BaziCalculator.getHideGan(timeBranch);
      baziInfo.timeWuXing = BaziUtils.getStemWuXing(timeStem);
      baziInfo.timeNaYin = BaziCalculator.getNaYin(timeStem + timeBranch);
      baziInfo.timeShengXiao = BaziUtils.getShengXiao(timeBranch);
      baziInfo.timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, timeStem);
      baziInfo.timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, timeBranch);

      // 特殊信息
      baziInfo.taiYuan = BaziCalculator.calculateTaiYuan(monthStem, monthBranch);
      baziInfo.taiYuanNaYin = BaziCalculator.getNaYin(baziInfo.taiYuan);
      baziInfo.mingGong = BaziCalculator.calculateMingGong(timeStem, timeBranch);
      baziInfo.mingGongNaYin = BaziCalculator.getNaYin(baziInfo.mingGong);

      // 检查三合局和三会局
      const branches = [yearBranch, monthBranch, dayBranch, timeBranch];
      baziInfo.sanHeJu = CombinationCalculator.checkSanHeJu(branches);
      baziInfo.sanHuiJu = CombinationCalculator.checkSanHuiJu(branches);

      // 添加匹配年份列表
      baziInfo.matchingYears = matchingYears;

      // 完整信息
      baziInfo.fullString = `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;

      return baziInfo;
    }

    // 如果没有指定年份或者日期推算失败，使用传统方法计算基本信息
    // 计算特殊信息
    const taiYuan = BaziCalculator.calculateTaiYuan(monthStem, monthBranch);
    const taiYuanNaYin = BaziCalculator.getNaYin(taiYuan);
    const mingGong = BaziCalculator.calculateMingGong(timeStem, timeBranch);
    const mingGongNaYin = BaziCalculator.getNaYin(mingGong);

    // 生肖信息
    const yearShengXiao = BaziUtils.getShengXiao(yearBranch);
    const monthShengXiao = BaziUtils.getShengXiao(monthBranch);
    const dayShengXiao = BaziUtils.getShengXiao(dayBranch);
    const timeShengXiao = BaziUtils.getShengXiao(timeBranch);

    // 创建一个基本的BaziInfo对象
    // 计算十神信息 - 以日干为基准
    const yearShiShenGan = ShiShenCalculator.getShiShen(dayStem, yearStem);
    const yearShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, yearBranch);
    const monthShiShenGan = ShiShenCalculator.getShiShen(dayStem, monthStem);
    const monthShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, monthBranch);
    const dayShiShen = '日主'; // 日柱天干是日主自己
    const dayShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, dayBranch);
    const timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, timeStem);
    const timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, timeBranch);

    // 计算完整的十二长生信息
    const changShengInfo = ShiErChangShengCalculator.calculateComplete(
      yearStem, yearBranch,
      monthStem, monthBranch,
      dayStem, dayBranch,
      timeStem, timeBranch
    );

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, timeBranch];
    const sanHeJu = CombinationCalculator.checkSanHeJu(branches);
    const sanHuiJu = CombinationCalculator.checkSanHuiJu(branches);

    // 计算神煞（即使没有完整日期信息也可以计算基本神煞）
    let shenSha: string[] = [];
    if (eightChar) {
      const shenShaResult = UnifiedShenShaService.calculateCompleteFourPillarShenSha(eightChar);
      shenSha = shenShaResult.allShenSha;
    }

    // 计算五行强度（如果有八字对象）
    let wuXingStrength: any = undefined;
    let riZhuStrength: string = '未知';
    let riZhuStrengthDetails: any = {};

    // 使用独立的五行强度计算（不依赖lunar-typescript库）
    console.log('🔥 使用独立五行强度计算:', {
      year: yearStem + yearBranch,
      month: monthStem + monthBranch,
      day: dayStem + dayBranch,
      time: timeStem + timeBranch
    });

    console.log('🚀🚀🚀 getBaziFromString: 开始独立五行强度计算');
    wuXingStrength = WuXingStrengthCalculator.calculateWuXingStrengthFromBazi(
      yearStem, yearBranch, monthStem, monthBranch,
      dayStem, dayBranch, timeStem, timeBranch
    );
    console.log('🎯🎯🎯 getBaziFromString: 五行强度计算结果:', wuXingStrength);
    console.log('🔍🔍🔍 getBaziFromString: 土五行强度 =', wuXingStrength.tu);
    console.log('🔍🔍🔍 getBaziFromString: 是否有详细信息 =', 'details' in wuXingStrength);

    // 计算日主旺衰（使用独立计算的结果）
    const riZhuResult = WuXingStrengthCalculator.calculateRiZhuStrengthFromWuXing(wuXingStrength, dayStem);
    riZhuStrength = riZhuResult.result;
    riZhuStrengthDetails = riZhuResult.details;
    console.log('🎯 getBaziFromString: 日主旺衰计算结果:', riZhuResult);

    // 大运和流年信息（如果有性别且有完整八字信息）
    let daYun: DaYunInfo[] = [];
    let liuNian: LiuNianInfo[] = [];
    let xiaoYun: any[] = [];
    let qiYunYear: number | undefined;
    let qiYunAge: number | undefined;
    let qiYunDate: string | undefined;
    let qiYunMonth: number | undefined;
    let qiYunDay: number | undefined;
    let qiYunTime: number | undefined;
    let daYunStartAge: number | undefined;

    // 如果有性别且有完整的八字和日期信息，计算大运流年
    console.log('🔥 ========== 检查大运流年计算条件 ==========');
    console.log('🔥 性别检查:', gender, '(应该是"1"或"0")');
    console.log('🔥 性别条件:', gender === '1' || gender === '0');
    console.log('🔥 八字对象存在:', !!eightChar);
    console.log('🔥 日期对象存在:', !!solar);
    console.log('🔥 所有条件满足:', (gender === '1' || gender === '0') && eightChar && solar);

    if ((gender === '1' || gender === '0') && eightChar && solar) {
      console.log('🔥 ✅ 开始计算大运流年信息');
      try {
        // 使用新的起运计算器
        console.log('🔥 计算起运信息...');
        try {
          const qiYunInfo = QiYunCalculator.calculateQiYun(eightChar, parseInt(gender), qiYunSect);
          qiYunYear = qiYunInfo.startYear;
          qiYunMonth = qiYunInfo.startMonth;
          qiYunDay = qiYunInfo.startDay;
          qiYunTime = qiYunInfo.startHour;
          qiYunAge = qiYunInfo.startYear; // 起运年数就是起运年龄
          qiYunDate = qiYunInfo.startSolar.toYmd(); // 格式化起运日期
          console.log('🔥 ✅ QiYunCalculator: 起运信息计算完成:', qiYunInfo);
        } catch (error) {
          console.error('🔥 ❌ QiYunCalculator: 起运计算失败，回退到旧方法', error);
          // 回退到旧的计算方法
          const qiYunInfo = DaYunCalculator.calculateQiYunInfo(eightChar, solar, gender);
          qiYunYear = qiYunInfo.qiYunYear;
          qiYunAge = qiYunInfo.qiYunAge;
          qiYunDate = qiYunInfo.qiYunDate;
          qiYunMonth = qiYunInfo.qiYunMonth;
          qiYunDay = qiYunInfo.qiYunDay;
          qiYunTime = qiYunInfo.qiYunTime;
        }

        // 计算大运信息
        console.log('🔥 计算大运信息...');
        daYun = DaYunCalculator.calculateDaYun(eightChar, solar, gender, dayStem, 10);
        daYunStartAge = DaYunCalculator.getDaYunStartAge(eightChar, gender);
        console.log('🔥 大运信息计算完成，数量:', daYun.length);

        // 计算流年信息
        console.log('🔥 计算流年信息...');
        liuNian = LiuNianCalculator.calculateLiuNian(eightChar, solar, gender, dayStem, undefined, 10);
        console.log('🔥 流年信息计算完成，数量:', liuNian.length);

        // 计算小运信息
        console.log('🔥 计算小运信息...');
        xiaoYun = XiaoYunCalculator.calculateXiaoYun(eightChar, solar, gender, dayStem, yearNum, 10);
        console.log('🔥 小运信息计算完成，数量:', xiaoYun.length);

        console.log('🔥 ✅ 大运流年计算全部完成');
      } catch (error) {
        console.error('🔥 ❌ parseBaziString - 计算大运流年时出错:', error);
        console.error('🔥 ❌ 错误详情:', error.stack);
      }
    } else {
      console.log('🔥 ❌ 跳过大运流年计算，原因:');
      if (gender !== '1' && gender !== '0') {
        console.log('🔥   - 性别不正确:', gender, '(需要"1"或"0")');
      }
      if (!eightChar) {
        console.log('🔥   - 缺少八字对象');
      }
      if (!solar) {
        console.log('🔥   - 缺少日期对象');
      }
    }

    return {
      // 基本信息
      solarDate,
      lunarDate,
      solarTime,
      matchingYears, // 添加匹配年份列表

      // 八字信息
      yearPillar: parts[0],
      yearStem,
      yearBranch,
      yearHideGan: BaziCalculator.getHideGan(yearBranch),
      yearWuXing,
      yearNaYin,
      yearShengXiao,
      yearShiShenGan,
      yearShiShenZhi,

      monthPillar: parts[1],
      monthStem,
      monthBranch,
      monthHideGan: BaziCalculator.getHideGan(monthBranch),
      monthWuXing,
      monthNaYin,
      monthShengXiao,
      monthShiShenGan,
      monthShiShenZhi,

      dayPillar: parts[2],
      dayStem,
      dayBranch,
      dayHideGan: BaziCalculator.getHideGan(dayBranch),
      dayWuXing,
      dayNaYin,
      dayShengXiao,
      dayShiShen,
      dayShiShenZhi,

      timePillar: parts[3],
      timeStem: timeStem,
      timeBranch: timeBranch,
      timeHideGan: BaziCalculator.getHideGan(timeBranch),
      timeWuXing: timeWuXing,
      timeNaYin: timeNaYin,
      timeShengXiao: timeShengXiao,
      timeShiShenGan,
      timeShiShenZhi,

      // 地势信息（日干在各地支的十二长生状态）
      yearDiShi: changShengInfo.diShi.yearDiShi,
      monthDiShi: changShengInfo.diShi.monthDiShi,
      dayDiShi: changShengInfo.diShi.dayDiShi,
      timeDiShi: changShengInfo.diShi.timeDiShi,

      // 自坐信息（各柱天干相对于各柱地支的十二长生状态）
      yearZiZuo: changShengInfo.ziZuo.yearZiZuo,
      monthZiZuo: changShengInfo.ziZuo.monthZiZuo,
      dayZiZuo: changShengInfo.ziZuo.dayZiZuo,
      timeZiZuo: changShengInfo.ziZuo.timeZiZuo,

      // 月令信息（各柱天干相对于月令的十二长生状态）
      yearYueLing: changShengInfo.yueLing.yearYueLing,
      monthYueLing: changShengInfo.yueLing.monthYueLing,
      dayYueLing: changShengInfo.yueLing.dayYueLing,
      timeYueLing: changShengInfo.yueLing.timeYueLing,

      // 旬空信息
      yearXunKong: BaziCalculator.calculateXunKong(yearStem, yearBranch),
      monthXunKong: BaziCalculator.calculateXunKong(monthStem, monthBranch),
      dayXunKong: BaziCalculator.calculateXunKong(dayStem, dayBranch),
      timeXunKong: BaziCalculator.calculateXunKong(timeStem, timeBranch),

      // 特殊信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,

      // 完整信息
      fullString: `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`,

      // 组合信息
      sanHeJu,
      sanHuiJu,

      // 神煞信息
      shenSha,

      // 五行强度信息
      wuXingStrength,

      // 日主旺衰信息
      riZhuStrength,
      riZhuStrengthDetails,

      // 大运信息
      daYun,
      daYunStartAge,
      qiYunYear,
      qiYunAge,
      qiYunDate,
      qiYunMonth,
      qiYunDay,
      qiYunTime,

      // 流年信息
      liuNian,

      // 小运信息
      xiaoYun,

      // 十神信息（补充缺失的字段）
      yearShiShen: yearShiShenGan,
      monthShiShen: monthShiShenGan,
      timeShiShen: timeShiShenGan,

      // 设置信息
      gender,
      baziSect: sect
    };
  }



  /**
   * 格式化八字信息
   * @param solar 阳历对象
   * @param lunar 农历对象
   * @param eightChar 八字对象
   * @param gender 性别（1-男，0-女）
   * @param sect 八字流派（1或2）
   * @param userInputBazi 可选的用户输入八字信息
   * @param qiYunSect 起运流派（1或2）
   * @returns 格式化后的八字信息
   */
  private static formatBaziInfo(solar: Solar, lunar: Lunar, eightChar: EightChar, gender = '', sect = '2', userInputBazi?: any, qiYunSect = 1): BaziInfo {
    // 设置八字流派
    eightChar.setSect(parseInt(sect));

    // 先获取日干，因为十神计算需要以日干为基准
    const dayStem = eightChar.getDayGan();

    // 年柱
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const yearPillar = yearStem + yearBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const yearHideGan = BaziCalculator.getHideGan(yearBranch);
    const yearWuXing = eightChar.getYearWuXing();
    const yearNaYin = eightChar.getYearNaYin();
    const yearShiShenGan = ShiShenCalculator.getShiShen(dayStem, yearStem);
    const yearShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, yearBranch);


    // 计算年柱旬空
    const yearXunKong = XunKongCalculator.calculateYearXunKong(eightChar);

    // 月柱
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const monthPillar = monthStem + monthBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const monthHideGan = BaziCalculator.getHideGan(monthBranch);
    const monthWuXing = eightChar.getMonthWuXing();
    const monthNaYin = eightChar.getMonthNaYin();
    const monthShiShenGan = ShiShenCalculator.getShiShen(dayStem, monthStem);
    const monthShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, monthBranch);


    // 计算月柱旬空
    const monthXunKong = XunKongCalculator.calculateMonthXunKong(eightChar);

    // 日柱
    const dayBranch = eightChar.getDayZhi();
    const dayPillar = dayStem + dayBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const dayHideGan = BaziCalculator.getHideGan(dayBranch);
    const dayWuXing = eightChar.getDayWuXing();
    const dayNaYin = eightChar.getDayNaYin();
    const dayShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, dayBranch);


    // 计算日柱旬空
    const dayXunKong = XunKongCalculator.calculateDayXunKong(eightChar);

    // 时柱
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();
    const timePillar = timeStem + timeBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const timeHideGan = BaziCalculator.getHideGan(timeBranch);
    const timeWuXing = eightChar.getTimeWuXing();
    const timeNaYin = eightChar.getTimeNaYin();
    const timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, timeStem);
    const timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, timeBranch);


    // 计算时柱旬空
    const timeXunKong = XunKongCalculator.calculateTimeXunKong(eightChar);

    // 计算完整的十二长生信息
    const changShengInfo = ShiErChangShengCalculator.calculateComplete(
      yearStem, yearBranch,
      monthStem, monthBranch,
      dayStem, dayBranch,
      timeStem, timeBranch
    );

    // 生肖信息
    const yearShengXiao = BaziUtils.getShengXiao(yearBranch);
    const monthShengXiao = BaziUtils.getShengXiao(monthBranch);
    const dayShengXiao = BaziUtils.getShengXiao(dayBranch);
    const timeShengXiao = BaziUtils.getShengXiao(timeBranch);

    // 特殊信息
    const taiYuan = BaziCalculator.calculateTaiYuan(monthStem, monthBranch);
    const taiYuanNaYin = BaziCalculator.getNaYin(taiYuan);
    const mingGong = BaziCalculator.calculateMingGong(timeStem, timeBranch);
    const mingGongNaYin = BaziCalculator.getNaYin(mingGong);

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, timeBranch];
    const sanHeJu = CombinationCalculator.checkSanHeJu(branches);
    const sanHuiJu = CombinationCalculator.checkSanHuiJu(branches);

    // 计算神煞
    const shenShaResult = UnifiedShenShaService.calculateCompleteFourPillarShenSha(eightChar);
    const shenSha = shenShaResult.allShenSha;

    // 计算身宫
    const shenGong = eightChar.getShenGong();
    console.log('🎯 身宫计算结果:', shenGong);

    // 计算格局
    const geJuResult = GeJuCalculator.calculateGeJu(eightChar);
    console.log('🎯 格局计算结果:', geJuResult);

    // 计算五行强度（完全独立的计算，不依赖lunar-typescript库）
    console.log('🚀🚀🚀 formatBaziInfo: 开始独立五行强度计算');

    let wuXingStrength: any;

    if (userInputBazi) {
      console.log('🔍 formatBaziInfo使用用户输入八字进行独立计算');
      console.log('🔍 formatBaziInfo当前八字:', {
        year: userInputBazi.yearStem + userInputBazi.yearBranch,
        month: userInputBazi.monthStem + userInputBazi.monthBranch,
        day: userInputBazi.dayStem + userInputBazi.dayBranch,
        time: userInputBazi.timeStem + userInputBazi.timeBranch
      });

      // 使用独立的五行强度计算，直接传入八字信息
      wuXingStrength = WuXingStrengthCalculator.calculateWuXingStrengthFromBazi(
        userInputBazi.yearStem, userInputBazi.yearBranch,
        userInputBazi.monthStem, userInputBazi.monthBranch,
        userInputBazi.dayStem, userInputBazi.dayBranch,
        userInputBazi.timeStem, userInputBazi.timeBranch
      );
    } else {
      console.log('🔍 formatBaziInfo使用原始八字对象进行独立计算');
      const currentYearStem = eightChar.getYearGan();
      const currentYearBranch = eightChar.getYearZhi();
      const currentMonthStem = eightChar.getMonthGan();
      const currentMonthBranch = eightChar.getMonthZhi();
      const currentDayStem = eightChar.getDayGan();
      const currentDayBranch = eightChar.getDayZhi();
      const currentTimeStem = eightChar.getTimeGan();
      const currentTimeBranch = eightChar.getTimeZhi();

      console.log('🔍 formatBaziInfo当前八字:', {
        year: currentYearStem + currentYearBranch,
        month: currentMonthStem + currentMonthBranch,
        day: currentDayStem + currentDayBranch,
        time: currentTimeStem + currentTimeBranch
      });

      // 使用独立的五行强度计算，直接传入八字信息
      wuXingStrength = WuXingStrengthCalculator.calculateWuXingStrengthFromBazi(
        currentYearStem, currentYearBranch,
        currentMonthStem, currentMonthBranch,
        currentDayStem, currentDayBranch,
        currentTimeStem, currentTimeBranch
      );
    }
    console.log('🎯🎯🎯 formatBaziInfo: 五行强度计算结果:', wuXingStrength);
    console.log('🔍🔍🔍 formatBaziInfo: 土五行强度 =', wuXingStrength.tu);
    console.log('🔍🔍🔍 formatBaziInfo: 是否有详细信息 =', 'details' in wuXingStrength);

    // 计算日主旺衰（传递已计算的五行强度，避免重复计算）
    const riZhuStrength = WuXingStrengthCalculator.calculateRiZhuStrength(eightChar, wuXingStrength);
    console.log('🎯 日主旺衰计算结果:', riZhuStrength);

    // 格式化日期
    const solarDate = `${solar.getYear()}-${solar.getMonth().toString().padStart(2, '0')}-${solar.getDay().toString().padStart(2, '0')}`;
    const lunarDate = lunar.toString();
    const solarTime = `${solar.getHour().toString().padStart(2, '0')}:${solar.getMinute().toString().padStart(2, '0')}`;

    // 大运和流年信息
    let daYun: DaYunInfo[] = [];
    let liuNian: LiuNianInfo[] = [];
    let xiaoYun: any[] = [];
    let qiYunYear: number | undefined;
    let qiYunAge: number | undefined;
    let qiYunDate: string | undefined;
    let qiYunMonth: number | undefined;
    let qiYunDay: number | undefined;
    let qiYunTime: number | undefined;
    let daYunStartAge: number | undefined;

    // 计算大运和流年信息
    if (gender === '1' || gender === '0') {
      // 使用新的起运计算器
      try {
        const qiYunInfo = QiYunCalculator.calculateQiYun(eightChar, parseInt(gender), qiYunSect);
        qiYunYear = qiYunInfo.startYear;
        qiYunMonth = qiYunInfo.startMonth;
        qiYunDay = qiYunInfo.startDay;
        qiYunTime = qiYunInfo.startHour;
        qiYunAge = qiYunInfo.startYear; // 起运年数就是起运年龄
        qiYunDate = qiYunInfo.startSolar.toYmd(); // 格式化起运日期

        console.log('✅ QiYunCalculator: 起运信息计算完成', {
          startYear: qiYunInfo.startYear,
          startMonth: qiYunInfo.startMonth,
          startDay: qiYunInfo.startDay,
          startHour: qiYunInfo.startHour,
          startDate: qiYunInfo.startSolar.toYmd(),
          sect: qiYunInfo.sect
        });
      } catch (error) {
        console.error('❌ QiYunCalculator: 起运计算失败，回退到旧方法', error);
        // 回退到旧的计算方法
        const qiYunInfo = DaYunCalculator.calculateQiYunInfo(eightChar, solar, gender);
        qiYunYear = qiYunInfo.qiYunYear;
        qiYunAge = qiYunInfo.qiYunAge;
        qiYunDate = qiYunInfo.qiYunDate;
        qiYunMonth = qiYunInfo.qiYunMonth;
        qiYunDay = qiYunInfo.qiYunDay;
        qiYunTime = qiYunInfo.qiYunTime;
      }

      // 计算大运信息
      daYun = DaYunCalculator.calculateDaYun(eightChar, solar, gender, dayStem, 10);
      daYunStartAge = DaYunCalculator.getDaYunStartAge(eightChar, gender);

      // 计算流年信息
      liuNian = LiuNianCalculator.calculateLiuNian(eightChar, solar, gender, dayStem, undefined, 10);

      // 计算小运信息
      xiaoYun = XiaoYunCalculator.calculateXiaoYun(eightChar, solar, gender, dayStem, solar.getYear(), 10);
    }



    return {
      // 基本信息
      solarDate,
      lunarDate,
      solarTime,

      // 八字信息
      yearPillar,
      yearStem,
      yearBranch,
      yearHideGan,
      yearWuXing,
      yearNaYin,

      monthPillar,
      monthStem,
      monthBranch,
      monthHideGan,
      monthWuXing,
      monthNaYin,

      dayPillar,
      dayStem,
      dayBranch,
      dayHideGan,
      dayWuXing,
      dayNaYin,

      timePillar: timePillar,
      timeStem: timeStem,
      timeBranch: timeBranch,
      timeHideGan: timeHideGan,
      timeWuXing: timeWuXing,
      timeNaYin: timeNaYin,

      // 特殊信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,
      shenGong,

      // 完整信息
      fullString: lunar.toFullString(),

      // 流派信息
      baziSect: sect,
      gender,

      // 生肖信息
      yearShengXiao,
      monthShengXiao,
      dayShengXiao,
      timeShengXiao: timeShengXiao,

      // 十神信息
      yearShiShen: yearShiShenGan,
      monthShiShen: monthShiShenGan,
      dayShiShen: '日主',
      timeShiShen: timeShiShenGan,

      yearShiShenGan,
      yearShiShenZhi,
      monthShiShenGan,
      monthShiShenZhi,
      dayShiShenZhi,
      timeShiShenGan,
      timeShiShenZhi,

      // 地势信息（日干在各地支的十二长生状态）
      yearDiShi: changShengInfo.diShi.yearDiShi,
      monthDiShi: changShengInfo.diShi.monthDiShi,
      dayDiShi: changShengInfo.diShi.dayDiShi,
      timeDiShi: changShengInfo.diShi.timeDiShi,

      // 自坐信息（各柱天干相对于各柱地支的十二长生状态）
      yearZiZuo: changShengInfo.ziZuo.yearZiZuo,
      monthZiZuo: changShengInfo.ziZuo.monthZiZuo,
      dayZiZuo: changShengInfo.ziZuo.dayZiZuo,
      timeZiZuo: changShengInfo.ziZuo.timeZiZuo,

      // 月令信息（各柱天干相对于月令的十二长生状态）
      yearYueLing: changShengInfo.yueLing.yearYueLing,
      monthYueLing: changShengInfo.yueLing.monthYueLing,
      dayYueLing: changShengInfo.yueLing.dayYueLing,
      timeYueLing: changShengInfo.yueLing.timeYueLing,

      // 旬空信息
      yearXunKong,
      monthXunKong,
      dayXunKong,
      timeXunKong: timeXunKong,

      // 组合信息
      sanHeJu,
      sanHuiJu,

      // 神煞信息
      shenSha,

      // 格局信息
      geJu: geJuResult.geJu,
      geJuDetail: geJuResult.detail,
      geJuStrength: geJuResult.geJuStrength,
      yongShen: geJuResult.analysis, // 用神信息包含在分析中

      // 五行强度信息
      wuXingStrength,

      // 日主旺衰信息
      riZhuStrength: riZhuStrength.result,
      riZhuStrengthDetails: riZhuStrength.details,

      // 大运信息
      daYun,
      daYunStartAge,
      qiYunYear,
      qiYunAge,
      qiYunDate,
      qiYunMonth,
      qiYunDay,
      qiYunTime,

      // 流年信息
      liuNian,

      // 小运信息
      xiaoYun
    };
  }

  /**
   * 获取流月信息
   * @param year 年份
   * @param dayStem 日干
   * @returns 流月信息数组
   */
  static getLiuYue(year: number, dayStem: string): any[] {
    return LiuYueCalculator.calculateLiuYue(year, dayStem);
  }

  /**
   * 获取流日信息
   * @param year 年份
   * @param monthGanZhi 月柱干支
   * @param dayStem 日干
   * @returns 流日信息数组
   */
  static getLiuRi(year: number, monthGanZhi: string, dayStem: string): any[] {
    return LiuRiCalculator.calculateLiuRi(year, monthGanZhi, dayStem);
  }

  /**
   * 获取流时信息
   * @param year 年份
   * @param month 月份
   * @param day 日期
   * @param dayStem 日干
   * @param sect 八字流派（1或2，影响子时处理）
   * @returns 流时信息数组
   */
  static getLiuShi(year: number, month: number, day: number, dayStem: string, sect = 2): any[] {
    return LiuShiCalculator.calculateLiuShi(year, month, day, dayStem, sect);
  }

}
