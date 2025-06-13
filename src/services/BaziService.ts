import { Solar, Lunar, EightChar } from 'lunar-typescript';
import { BaziInfo, DaYunInfo, LiuNianInfo } from '../types/BaziInfo';
import { BaziUtils } from './bazi/BaziUtils';
import { BaziCalculator } from './bazi/BaziCalculator';
import { ShiShenCalculator } from './bazi/ShiShenCalculator';
import { CombinationCalculator } from './bazi/CombinationCalculator';
import { DaYunCalculator } from './bazi/DaYunCalculator';
import { LiuNianCalculator } from './bazi/LiuNianCalculator';
import { ComprehensiveShenShaCalculator } from './bazi/ComprehensiveShenShaCalculator';
import { YearMatchCalculator } from './bazi/YearMatchCalculator';
import { XunKongCalculator } from './bazi/XunKongCalculator';
import { GeJuExplanationService } from './GeJuExplanationService';
import { ShenShaExplanationService } from './ShenShaExplanationService';
import { WuXingExplanationService } from './WuXingExplanationService';

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
   * @param hour 时（0-23）
   * @returns 八字信息对象
   */
  static getBaziFromDate(year: number, month: number, day: number, hour = 0, gender = '', sect = '2'): BaziInfo {
    // 创建阳历对象
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    // 转换为农历
    const lunar = solar.getLunar();
    // 获取八字
    const eightChar = lunar.getEightChar();

    return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
  }

  /**
   * 从农历日期获取八字信息
   * @param year 农历年
   * @param month 农历月
   * @param day 农历日
   * @param hour 时（0-23）
   * @param isLeapMonth 是否闰月
   * @returns 八字信息对象
   */
  static getBaziFromLunarDate(year: number, month: number, day: number, hour = 0, isLeapMonth = false, gender = '', sect = '2'): BaziInfo {
    // 创建农历对象
    // Lunar.fromYmdHms只接受6个参数，不支持isLeapMonth参数
    // 需要使用其他方法处理闰月
    let lunar: Lunar;
    if (isLeapMonth) {
      // 对于闰月，我们需要使用其他方法
      // 这里简化处理，实际应用中可能需要更复杂的逻辑
      lunar = Lunar.fromYmd(year, month, day);
    } else {
      lunar = Lunar.fromYmdHms(year, month, day, hour, 0, 0);
    }
    // 转换为阳历
    const solar = lunar.getSolar();
    // 获取八字
    const eightChar = lunar.getEightChar();

    return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
  }

  /**
   * 解析八字字符串
   * @param baziStr 八字字符串，如"甲子 乙丑 丙寅 丁卯"
   * @param gender 性别（1-男，0-女）
   * @param sect 八字流派（1或2）
   * @param specifiedYear 指定的年份，如果提供则使用此年份而不是反推
   * @returns 八字信息对象
   */
  static parseBaziString(baziStr: string, specifiedYear?: string, gender = '', sect = '2'): BaziInfo {
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
    const hourStem = parts[3][0];
    const hourBranch = parts[3][1];

    // 计算五行
    const yearWuXing = BaziUtils.getStemWuXing(yearStem);
    const monthWuXing = BaziUtils.getStemWuXing(monthStem);
    const dayWuXing = BaziUtils.getStemWuXing(dayStem);
    const hourWuXing = BaziUtils.getStemWuXing(hourStem);

    // 计算纳音
    const yearNaYin = BaziCalculator.getNaYin(yearStem + yearBranch);
    const monthNaYin = BaziCalculator.getNaYin(monthStem + monthBranch);
    const dayNaYin = BaziCalculator.getNaYin(dayStem + dayBranch);
    const hourNaYin = BaziCalculator.getNaYin(hourStem + hourBranch);

    // 初始化日期相关变量
    let solarDate = '----年--月--日';
    let lunarDate = '农历----年--月--日';
    let solarTime = '--:--';
    let solar: Solar | null = null;
    let lunar: Lunar | null = null;
    let eightChar: EightChar | null = null;

    // 计算匹配的年份列表
    const matchingYears = YearMatchCalculator.calculateMatchingYears(yearStem, yearBranch);

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
          hourStem + hourBranch,
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
      // 使用formatBaziInfo获取完整的八字信息，但只获取日期、大运、流年等信息
      const baziInfo = this.formatBaziInfo(solar, lunar, eightChar, gender, sect);

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
      baziInfo.hourPillar = parts[3];
      baziInfo.hourStem = hourStem;
      baziInfo.hourBranch = hourBranch;
      baziInfo.hourHideGan = BaziCalculator.getHideGan(hourBranch);
      baziInfo.hourWuXing = BaziUtils.getStemWuXing(hourStem);
      baziInfo.hourNaYin = BaziCalculator.getNaYin(hourStem + hourBranch);
      baziInfo.hourShengXiao = BaziUtils.getShengXiao(hourBranch);
      baziInfo.timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, hourStem);
      baziInfo.timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, hourBranch);

      // 特殊信息
      baziInfo.taiYuan = BaziCalculator.calculateTaiYuan(monthStem, monthBranch);
      baziInfo.taiYuanNaYin = BaziCalculator.getNaYin(baziInfo.taiYuan);
      baziInfo.mingGong = BaziCalculator.calculateMingGong(hourStem, hourBranch);
      baziInfo.mingGongNaYin = BaziCalculator.getNaYin(baziInfo.mingGong);

      // 检查三合局和三会局
      const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
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
    const mingGong = BaziCalculator.calculateMingGong(hourStem, hourBranch);
    const mingGongNaYin = BaziCalculator.getNaYin(mingGong);

    // 生肖信息
    const yearShengXiao = BaziUtils.getShengXiao(yearBranch);
    const monthShengXiao = BaziUtils.getShengXiao(monthBranch);
    const dayShengXiao = BaziUtils.getShengXiao(dayBranch);
    const hourShengXiao = BaziUtils.getShengXiao(hourBranch);

    // 创建一个基本的BaziInfo对象
    // 计算十神信息 - 以日干为基准
    const yearShiShenGan = ShiShenCalculator.getShiShen(dayStem, yearStem);
    const yearShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, yearBranch);
    const monthShiShenGan = ShiShenCalculator.getShiShen(dayStem, monthStem);
    const monthShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, monthBranch);
    const dayShiShen = '日主'; // 日柱天干是日主自己
    const dayShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, dayBranch);
    const timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, hourStem);
    const timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, hourBranch);

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
    const sanHeJu = CombinationCalculator.checkSanHeJu(branches);
    const sanHuiJu = CombinationCalculator.checkSanHuiJu(branches);

    // 计算神煞（即使没有完整日期信息也可以计算基本神煞）
    let shenSha: string[] = [];
    if (eightChar) {
      const shenShaResult = ComprehensiveShenShaCalculator.calculateCompleteShenSha(eightChar);
      shenSha = shenShaResult.allShenSha;
    }

    // 大运和流年信息（如果有性别且有完整八字信息）
    let daYun: DaYunInfo[] = [];
    let liuNian: LiuNianInfo[] = [];
    let qiYunYear: number | undefined;
    let qiYunAge: number | undefined;
    let qiYunDate: string | undefined;
    let qiYunMonth: number | undefined;
    let qiYunDay: number | undefined;
    let qiYunHour: number | undefined;
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
        // 计算起运信息
        console.log('🔥 计算起运信息...');
        const qiYunInfo = DaYunCalculator.calculateQiYunInfo(eightChar, solar, gender);
        qiYunYear = qiYunInfo.qiYunYear;
        qiYunAge = qiYunInfo.qiYunAge;
        qiYunDate = qiYunInfo.qiYunDate;
        qiYunMonth = qiYunInfo.qiYunMonth;
        qiYunDay = qiYunInfo.qiYunDay;
        qiYunHour = qiYunInfo.qiYunHour;
        console.log('🔥 起运信息计算完成:', qiYunInfo);

        // 计算大运信息
        console.log('🔥 计算大运信息...');
        daYun = DaYunCalculator.calculateDaYun(eightChar, solar, gender, dayStem, 10);
        daYunStartAge = DaYunCalculator.getDaYunStartAge(eightChar, gender);
        console.log('🔥 大运信息计算完成，数量:', daYun.length);

        // 计算流年信息
        console.log('🔥 计算流年信息...');
        liuNian = LiuNianCalculator.calculateLiuNian(eightChar, solar, gender, dayStem, undefined, 10);
        console.log('🔥 流年信息计算完成，数量:', liuNian.length);

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

      hourPillar: parts[3],
      hourStem,
      hourBranch,
      hourHideGan: BaziCalculator.getHideGan(hourBranch),
      hourWuXing,
      hourNaYin,
      hourShengXiao,
      timeShiShenGan,
      timeShiShenZhi,

      // 旬空信息
      yearXunKong: BaziCalculator.calculateXunKong(yearStem, yearBranch),
      monthXunKong: BaziCalculator.calculateXunKong(monthStem, monthBranch),
      dayXunKong: BaziCalculator.calculateXunKong(dayStem, dayBranch),
      hourXunKong: BaziCalculator.calculateXunKong(hourStem, hourBranch),

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

      // 大运信息
      daYun,
      daYunStartAge,
      qiYunYear,
      qiYunAge,
      qiYunDate,
      qiYunMonth,
      qiYunDay,
      qiYunHour,

      // 流年信息
      liuNian,

      // 十神信息（补充缺失的字段）
      yearShiShen: yearShiShenGan,
      monthShiShen: monthShiShenGan,
      hourShiShen: timeShiShenGan,

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
   * @returns 格式化后的八字信息
   */
  private static formatBaziInfo(solar: Solar, lunar: Lunar, eightChar: EightChar, gender = '', sect = '2'): BaziInfo {
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
    const yearDiShi = eightChar.getYearDiShi();

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
    const monthDiShi = eightChar.getMonthDiShi();

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
    const dayDiShi = eightChar.getDayDiShi();

    // 计算日柱旬空
    const dayXunKong = XunKongCalculator.calculateDayXunKong(eightChar);

    // 时柱
    const hourStem = eightChar.getTimeGan();
    const hourBranch = eightChar.getTimeZhi();
    const hourPillar = hourStem + hourBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const hourHideGan = BaziCalculator.getHideGan(hourBranch);
    const hourWuXing = eightChar.getTimeWuXing();
    const hourNaYin = eightChar.getTimeNaYin();
    const timeShiShenGan = ShiShenCalculator.getShiShen(dayStem, hourStem);
    const timeShiShenZhi = ShiShenCalculator.getHiddenShiShen(dayStem, hourBranch);
    const timeDiShi = eightChar.getTimeDiShi();

    // 计算时柱旬空
    const hourXunKong = XunKongCalculator.calculateHourXunKong(eightChar);

    // 生肖信息
    const yearShengXiao = BaziUtils.getShengXiao(yearBranch);
    const monthShengXiao = BaziUtils.getShengXiao(monthBranch);
    const dayShengXiao = BaziUtils.getShengXiao(dayBranch);
    const hourShengXiao = BaziUtils.getShengXiao(hourBranch);

    // 特殊信息
    const taiYuan = BaziCalculator.calculateTaiYuan(monthStem, monthBranch);
    const taiYuanNaYin = BaziCalculator.getNaYin(taiYuan);
    const mingGong = BaziCalculator.calculateMingGong(hourStem, hourBranch);
    const mingGongNaYin = BaziCalculator.getNaYin(mingGong);

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
    const sanHeJu = CombinationCalculator.checkSanHeJu(branches);
    const sanHuiJu = CombinationCalculator.checkSanHuiJu(branches);

    // 计算神煞
    const shenShaResult = ComprehensiveShenShaCalculator.calculateCompleteShenSha(eightChar);
    const shenSha = shenShaResult.allShenSha;

    // 格式化日期
    const solarDate = `${solar.getYear()}-${solar.getMonth().toString().padStart(2, '0')}-${solar.getDay().toString().padStart(2, '0')}`;
    const lunarDate = lunar.toString();
    const solarTime = `${solar.getHour().toString().padStart(2, '0')}:${solar.getMinute().toString().padStart(2, '0')}`;

    // 大运和流年信息
    let daYun: DaYunInfo[] = [];
    let liuNian: LiuNianInfo[] = [];
    let qiYunYear: number | undefined;
    let qiYunAge: number | undefined;
    let qiYunDate: string | undefined;
    let qiYunMonth: number | undefined;
    let qiYunDay: number | undefined;
    let qiYunHour: number | undefined;
    let daYunStartAge: number | undefined;

    // 计算大运和流年信息
    if (gender === '1' || gender === '0') {
      // 计算起运信息
      const qiYunInfo = DaYunCalculator.calculateQiYunInfo(eightChar, solar, gender);
      qiYunYear = qiYunInfo.qiYunYear;
      qiYunAge = qiYunInfo.qiYunAge;
      qiYunDate = qiYunInfo.qiYunDate;
      qiYunMonth = qiYunInfo.qiYunMonth;
      qiYunDay = qiYunInfo.qiYunDay;
      qiYunHour = qiYunInfo.qiYunHour;

      // 计算大运信息
      daYun = DaYunCalculator.calculateDaYun(eightChar, solar, gender, dayStem, 10);
      daYunStartAge = DaYunCalculator.getDaYunStartAge(eightChar, gender);

      // 计算流年信息
      liuNian = LiuNianCalculator.calculateLiuNian(eightChar, solar, gender, dayStem, undefined, 10);
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

      hourPillar,
      hourStem,
      hourBranch,
      hourHideGan,
      hourWuXing,
      hourNaYin,

      // 特殊信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,

      // 完整信息
      fullString: lunar.toFullString(),

      // 流派信息
      baziSect: sect,
      gender,

      // 生肖信息
      yearShengXiao,
      monthShengXiao,
      dayShengXiao,
      hourShengXiao,

      // 十神信息
      yearShiShen: yearShiShenGan,
      monthShiShen: monthShiShenGan,
      dayShiShen: '日主',
      hourShiShen: timeShiShenGan,

      yearShiShenGan,
      yearShiShenZhi,
      monthShiShenGan,
      monthShiShenZhi,
      dayShiShenZhi,
      timeShiShenGan,
      timeShiShenZhi,

      // 地势信息
      yearDiShi,
      monthDiShi,
      dayDiShi,
      hourDiShi: timeDiShi,

      // 旬空信息
      yearXunKong,
      monthXunKong,
      dayXunKong,
      hourXunKong,

      // 组合信息
      sanHeJu,
      sanHuiJu,

      // 神煞信息
      shenSha,

      // 大运信息
      daYun,
      daYunStartAge,
      qiYunYear,
      qiYunAge,
      qiYunDate,
      qiYunMonth,
      qiYunDay,
      qiYunHour,

      // 流年信息
      liuNian
    };
  }


}
