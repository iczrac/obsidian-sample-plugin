import { Solar, Lunar, EightChar } from 'lunar-typescript';
import { GeJuJudgeService } from './GeJuJudgeService';
import { BaziInfo } from '../types/BaziInfo';

/**
 * 八字服务类，封装lunar-typescript的八字功能
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
  static getBaziFromDate(year: number, month: number, day: number, hour: number = 0, gender: string = '', sect: string = '2'): BaziInfo {
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
  static getBaziFromLunarDate(year: number, month: number, day: number, hour: number = 0, isLeapMonth: boolean = false, gender: string = '', sect: string = '2'): BaziInfo {
    // 创建农历对象
    // Lunar.fromYmdHms只接受6个参数，不支持isLeapMonth参数
    // 需要使用其他方法处理闰月
    let lunar;
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
  static parseBaziString(baziStr: string, specifiedYear?: string, gender: string = '', sect: string = '2'): BaziInfo {
    // 清理并分割八字字符串
    const parts = baziStr.replace(/\s+/g, ' ').trim().split(' ');

    if (parts.length !== 4) {
      throw new Error('八字格式不正确，应为"年柱 月柱 日柱 时柱"的格式，如"甲子 乙丑 丙寅 丁卯"');
    }

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
    const yearWuXing = this.getStemWuXing(yearStem);
    const monthWuXing = this.getStemWuXing(monthStem);
    const dayWuXing = this.getStemWuXing(dayStem);
    const hourWuXing = this.getStemWuXing(hourStem);

    // 计算纳音
    const yearNaYin = this.getNaYin(yearStem + yearBranch);
    const monthNaYin = this.getNaYin(monthStem + monthBranch);
    const dayNaYin = this.getNaYin(dayStem + dayBranch);
    const hourNaYin = this.getNaYin(hourStem + hourBranch);

    // 初始化日期相关变量
    let solarDate = '----年--月--日';
    let lunarDate = '农历----年--月--日';
    let solarTime = '--:--';
    let solar: Solar | null = null;
    let lunar: Lunar | null = null;
    let eightChar: EightChar | null = null;

    // 计算匹配的年份列表
    let matchingYears: number[] = [];

    // 使用lunar-typescript库的Solar.fromBaZi方法获取所有可能的年份
    try {
      // 获取所有可能的年份
      // 我们需要多次调用Solar.fromBaZi，使用不同的基准年份，以获取所有可能的年份
      const allYears = new Set<number>();

      // 使用多个基准年份，确保覆盖所有可能的年份
      const baseYears = [1, 601, 1201, 1801, 2401];

      for (const baseYear of baseYears) {
        try {
          // 获取所有可能的阳历日期
          const solarList = Solar.fromBaZi(
            yearStem + yearBranch,
            monthStem + monthBranch,
            dayStem + dayBranch,
            hourStem + hourBranch,
            parseInt(sect), // 流派
            baseYear // 起始年份
          );

          // 提取年份
          for (const solar of solarList) {
            allYears.add(solar.getYear());
          }
        } catch (e) {
          console.error(`获取匹配年份出错 (基准年份 ${baseYear}):`, e);
        }
      }

      // 转换为数组并排序
      matchingYears = Array.from(allYears).sort((a, b) => a - b);

      console.log('使用lunar-typescript库获取匹配年份:', matchingYears);
    } catch (error) {
      console.error('获取匹配年份出错:', error);

      // 如果出错，使用传统方法作为备选
      console.log('使用传统方法计算匹配年份');

      // 天干序号（甲=0, 乙=1, ..., 癸=9）
      const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
      // 地支序号（子=0, 丑=1, ..., 亥=11）
      const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);

      // 计算匹配的年份列表
      const currentYear = new Date().getFullYear();
      const startYear = 1700; // 从1700年开始查找，确保覆盖17XX-19XX年
      const endYear = currentYear + 120;   // 查找到120年后（2个甲子）

      // 查找符合年柱的年份
      for (let year = startYear; year <= endYear; year++) {
        // 计算天干序号：年份减去4，除以10的余数
        const stemCheck = (year - 4) % 10;
        // 计算地支序号：年份减去4，除以12的余数
        const branchCheck = (year - 4) % 12;

        if (stemCheck === stemIndex && branchCheck === branchIndex) {
          matchingYears.push(year);
        }
      }
    }

    // 如果指定了年份，尝试使用指定的年份进行日期推算
    const yearNum = specifiedYear ? parseInt(specifiedYear) : undefined;
    if (yearNum && matchingYears.includes(yearNum)) {
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

        // 找到指定年份的日期
        let matchingSolar: Solar | null = null;
        for (const s of solarList) {
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

          console.log('日期反推成功 - 指定年份:', yearNum);
          console.log('日期反推结果 - 阳历日期:', solarDate);
          console.log('日期反推结果 - 农历日期:', lunarDate);
        } else {
          console.log('日期反推失败 - 未找到指定年份的匹配日期');
        }
      } catch (error) {
        console.error('日期推算出错:', error);
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
      baziInfo.yearHideGan = this.getHideGan(yearBranch);
      baziInfo.yearWuXing = this.getStemWuXing(yearStem);
      baziInfo.yearNaYin = this.getNaYin(yearStem + yearBranch);
      baziInfo.yearShengXiao = this.getShengXiao(yearBranch);
      baziInfo.yearShiShenGan = this.getShiShen(dayStem, yearStem);
      baziInfo.yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);

      // 月柱
      baziInfo.monthPillar = parts[1];
      baziInfo.monthStem = monthStem;
      baziInfo.monthBranch = monthBranch;
      baziInfo.monthHideGan = this.getHideGan(monthBranch);
      baziInfo.monthWuXing = this.getStemWuXing(monthStem);
      baziInfo.monthNaYin = this.getNaYin(monthStem + monthBranch);
      baziInfo.monthShengXiao = this.getShengXiao(monthBranch);
      baziInfo.monthShiShenGan = this.getShiShen(dayStem, monthStem);
      baziInfo.monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);

      // 日柱
      baziInfo.dayPillar = parts[2];
      baziInfo.dayStem = dayStem;
      baziInfo.dayBranch = dayBranch;
      baziInfo.dayHideGan = this.getHideGan(dayBranch);
      baziInfo.dayWuXing = this.getStemWuXing(dayStem);
      baziInfo.dayNaYin = this.getNaYin(dayStem + dayBranch);
      baziInfo.dayShengXiao = this.getShengXiao(dayBranch);
      baziInfo.dayShiShen = '日主'; // 日柱天干是日主自己
      baziInfo.dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);

      // 时柱
      baziInfo.hourPillar = parts[3];
      baziInfo.hourStem = hourStem;
      baziInfo.hourBranch = hourBranch;
      baziInfo.hourHideGan = this.getHideGan(hourBranch);
      baziInfo.hourWuXing = this.getStemWuXing(hourStem);
      baziInfo.hourNaYin = this.getNaYin(hourStem + hourBranch);
      baziInfo.hourShengXiao = this.getShengXiao(hourBranch);
      baziInfo.hourShiShenGan = this.getShiShen(dayStem, hourStem);
      baziInfo.hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);

      // 特殊信息
      baziInfo.taiYuan = this.calculateTaiYuan(monthStem, monthBranch);
      baziInfo.taiYuanNaYin = this.getNaYin(baziInfo.taiYuan);
      baziInfo.mingGong = this.calculateMingGong(hourStem, hourBranch);
      baziInfo.mingGongNaYin = this.getNaYin(baziInfo.mingGong);

      // 检查三合局和三会局
      const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
      baziInfo.sanHeJu = this.checkSanHeJu(branches);
      baziInfo.sanHuiJu = this.checkSanHuiJu(branches);

      // 添加匹配年份列表
      baziInfo.matchingYears = matchingYears;

      // 完整信息
      baziInfo.fullString = `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;

      return baziInfo;
    }

    // 如果没有指定年份或者日期推算失败，使用传统方法计算基本信息
    // 计算特殊信息
    const taiYuan = this.calculateTaiYuan(monthStem, monthBranch);
    const taiYuanNaYin = this.getNaYin(taiYuan);
    const mingGong = this.calculateMingGong(hourStem, hourBranch);
    const mingGongNaYin = this.getNaYin(mingGong);

    // 生肖信息
    const yearShengXiao = this.getShengXiao(yearBranch);
    const monthShengXiao = this.getShengXiao(monthBranch);
    const dayShengXiao = this.getShengXiao(dayBranch);
    const hourShengXiao = this.getShengXiao(hourBranch);

    // 创建一个基本的BaziInfo对象
    // 计算十神信息 - 以日干为基准
    const yearShiShenGan = this.getShiShen(dayStem, yearStem);
    const yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);
    const monthShiShenGan = this.getShiShen(dayStem, monthStem);
    const monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);
    const dayShiShen = '日主'; // 日柱天干是日主自己
    const dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);
    const hourShiShenGan = this.getShiShen(dayStem, hourStem);
    const hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
    const sanHeJu = this.checkSanHeJu(branches);
    const sanHuiJu = this.checkSanHuiJu(branches);

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
      yearHideGan: this.getHideGan(yearBranch),
      yearWuXing,
      yearNaYin,
      yearShengXiao,
      yearShiShenGan,
      yearShiShenZhi,

      monthPillar: parts[1],
      monthStem,
      monthBranch,
      monthHideGan: this.getHideGan(monthBranch),
      monthWuXing,
      monthNaYin,
      monthShengXiao,
      monthShiShenGan,
      monthShiShenZhi,

      dayPillar: parts[2],
      dayStem,
      dayBranch,
      dayHideGan: this.getHideGan(dayBranch),
      dayWuXing,
      dayNaYin,
      dayShengXiao,
      dayShiShen,
      dayShiShenZhi,

      hourPillar: parts[3],
      hourStem,
      hourBranch,
      hourHideGan: this.getHideGan(hourBranch),
      hourWuXing,
      hourNaYin,
      hourShengXiao,
      hourShiShenGan,
      hourShiShenZhi,

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

      // 设置信息
      gender,
      baziSect: sect
    };
  }
  /**
   * 计算胎元
   * @param monthStem 月干
   * @param monthBranch 月支
   * @returns 胎元干支
   */
  private static calculateTaiYuan(monthStem: string, monthBranch: string): string {
    // 天干顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    // 地支顺序
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 计算月干的索引
    const stemIndex = stems.indexOf(monthStem);
    // 计算月支的索引
    const branchIndex = branches.indexOf(monthBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      return "未知";
    }

    // 计算胎元干（月干 + 5，超过10则减10）
    const taiYuanStemIndex = (stemIndex + 5) % 10;
    // 计算胎元支（月支 + 3，超过12则减12）
    const taiYuanBranchIndex = (branchIndex + 3) % 12;

    // 组合胎元干支
    return stems[taiYuanStemIndex] + branches[taiYuanBranchIndex];
  }

  /**
   * 计算命宫
   * @param hourStem 时干
   * @param hourBranch 时支
   * @returns 命宫干支
   */
  private static calculateMingGong(hourStem: string, hourBranch: string): string {
    // 天干顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    // 地支顺序
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 计算时干的索引
    const stemIndex = stems.indexOf(hourStem);
    // 计算时支的索引
    const branchIndex = branches.indexOf(hourBranch);

    if (stemIndex === -1 || branchIndex === -1) {
      return "未知";
    }

    // 计算命宫干（时干 + 7，超过10则减10）
    const mingGongStemIndex = (stemIndex + 7) % 10;
    // 计算命宫支（时支 + 1，超过12则减12）
    const mingGongBranchIndex = (branchIndex + 1) % 12;

    // 组合命宫干支
    return stems[mingGongStemIndex] + branches[mingGongBranchIndex];
  }

  /**
   * 获取天干对应的五行
   * @param stem 天干
   * @returns 五行
   */
  private static getStemWuXing(stem: string): string {
    const map: {[key: string]: string} = {
      '甲': '木',
      '乙': '木',
      '丙': '火',
      '丁': '火',
      '戊': '土',
      '己': '土',
      '庚': '金',
      '辛': '金',
      '壬': '水',
      '癸': '水'
    };

    return map[stem] || '未知';
  }

  /**
   * 获取地支藏干
   * @param branch 地支
   * @returns 藏干字符串
   */
  static getHideGan(branch: string): string {
    // 检查地支是否有效
    if (!branch) {
      return '';
    }

    const map: {[key: string]: string} = {
      '子': '癸',
      '丑': '己,癸,辛',
      '寅': '甲,丙,戊',
      '卯': '乙',
      '辰': '戊,乙,癸',
      '巳': '丙,庚,戊',
      '午': '丁,己',
      '未': '己,丁,乙',
      '申': '庚,壬,戊',
      '酉': '辛',
      '戌': '戊,辛,丁',
      '亥': '壬,甲'
    };

    return map[branch] || '';
  }

  /**
   * 根据月日获取星座
   * @param month 月份（1-12）
   * @param day 日期（1-31）
   * @returns 星座名称
   */
  private static getZodiac(month: number, day: number): string {
    const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    const signs = [
      "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座",
      "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"
    ];

    // 月份从1开始，索引从0开始，需要减1
    const monthIndex = month - 1;

    // 如果日期大于等于该月对应的日期，则星座为当月星座，否则为前一个月的星座
    return day < dates[monthIndex] ? signs[monthIndex] : signs[(monthIndex + 1) % 12];
  }

  /**
   * 计算旬空
   * @param gan 天干
   * @param zhi 地支
   * @returns 旬空
   */
  private static calculateXunKong(gan: string, zhi: string): string {
    // 天干序号（甲=0, 乙=1, ..., 癸=9）
    const ganIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(gan);
    // 地支序号（子=0, 丑=1, ..., 亥=11）
    const zhiIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(zhi);

    if (ganIndex < 0 || zhiIndex < 0) {
      return '';
    }

    // 计算旬首
    const xunShouIndex = Math.floor(ganIndex / 2) * 2;

    // 计算旬空地支
    const xunKongIndex1 = (xunShouIndex + 10) % 12;
    const xunKongIndex2 = (xunShouIndex + 11) % 12;

    // 获取旬空地支
    const xunKongZhi1 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex1);
    const xunKongZhi2 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex2);

    return xunKongZhi1 + xunKongZhi2;
  }

  /**
   * 获取纳音
   * @param gz 干支
   * @returns 纳音
   */
  private static getNaYin(gz: string): string {
    const map: {[key: string]: string} = {
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
      '甲午': '砂石金', '乙未': '砂石金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金薄金', '癸卯': '金薄金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗环金', '辛亥': '钗环金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };

    return map[gz] || '未知';
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
  private static formatBaziInfo(solar: Solar, lunar: Lunar, eightChar: EightChar, gender: string = '', sect: string = '2'): BaziInfo {
    // 设置八字流派
    eightChar.setSect(parseInt(sect));

    // 先获取日干，因为十神计算需要以日干为基准
    const dayStem = eightChar.getDayGan();

    // 年柱
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const yearPillar = yearStem + yearBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const yearHideGan = this.getHideGan(yearBranch);
    const yearWuXing = eightChar.getYearWuXing();
    const yearNaYin = eightChar.getYearNaYin();
    const yearShiShenGan = this.getShiShen(dayStem, yearStem);
    const yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);
    const yearDiShi = eightChar.getYearDiShi();

    // 添加错误处理，防止旬空计算失败
    let yearXunKong = '';
    try {
      // 先获取旬，再获取旬空
      const yearXun = eightChar.getYearXun();
      if (yearXun) {
        yearXunKong = eightChar.getYearXunKong();
      }
    } catch (e) {
      console.error('计算年柱旬空出错:', e);
    }

    // 月柱
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const monthPillar = monthStem + monthBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const monthHideGan = this.getHideGan(monthBranch);
    const monthWuXing = eightChar.getMonthWuXing();
    const monthNaYin = eightChar.getMonthNaYin();
    const monthShiShenGan = this.getShiShen(dayStem, monthStem);
    const monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);
    const monthDiShi = eightChar.getMonthDiShi();

    // 添加错误处理，防止旬空计算失败
    let monthXunKong = '';
    try {
      // 先获取旬，再获取旬空
      const monthXun = eightChar.getMonthXun();
      if (monthXun) {
        monthXunKong = eightChar.getMonthXunKong();
      }
    } catch (e) {
      console.error('计算月柱旬空出错:', e);
    }

    // 日柱
    const dayBranch = eightChar.getDayZhi();
    const dayPillar = dayStem + dayBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const dayHideGan = this.getHideGan(dayBranch);
    const dayWuXing = eightChar.getDayWuXing();
    const dayNaYin = eightChar.getDayNaYin();
    const dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);
    const dayDiShi = eightChar.getDayDiShi();

    // 添加错误处理，防止旬空计算失败
    let dayXunKong = '';
    try {
      // 先获取旬，再获取旬空
      const dayXun = eightChar.getDayXun();
      if (dayXun) {
        dayXunKong = eightChar.getDayXunKong();
      }
    } catch (e) {
      console.error('计算日柱旬空出错:', e);
    }

    // 时柱
    const hourStem = eightChar.getTimeGan();
    const hourBranch = eightChar.getTimeZhi();
    const hourPillar = hourStem + hourBranch;
    // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const hourHideGan = this.getHideGan(hourBranch);
    const hourWuXing = eightChar.getTimeWuXing();
    const hourNaYin = eightChar.getTimeNaYin();
    const hourShiShenGan = this.getShiShen(dayStem, hourStem);
    const hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);
    const timeDiShi = eightChar.getTimeDiShi();

    // 添加错误处理，防止旬空计算失败
    let timeXunKong = '';
    try {
      // 先获取旬，再获取旬空
      const timeXun = eightChar.getTimeXun();
      if (timeXun) {
        timeXunKong = eightChar.getTimeXunKong();
      }

      // 如果通过API获取失败，则手动计算
      if (!timeXunKong) {
        timeXunKong = this.calculateXunKong(hourStem, hourBranch);
      }
    } catch (e) {
      console.error('计算时柱旬空出错:', e);
      // 出错时手动计算
      timeXunKong = this.calculateXunKong(hourStem, hourBranch);
    }

    // 特殊信息
    const taiYuan = eightChar.getTaiYuan();
    const taiYuanNaYin = eightChar.getTaiYuanNaYin();
    const mingGong = eightChar.getMingGong();
    const mingGongNaYin = eightChar.getMingGongNaYin();
    const shenGong = eightChar.getShenGong();

    // 日期信息
    const solarDate = solar.toYmd();
    const lunarDate = lunar.toString();
    const solarTime = solar.getHour() + ':' + solar.getMinute();

    // 生肖信息
    const yearShengXiao = this.getShengXiao(yearBranch);
    const monthShengXiao = this.getShengXiao(monthBranch);
    const dayShengXiao = this.getShengXiao(dayBranch);
    const hourShengXiao = this.getShengXiao(hourBranch);

    // 十神信息 (以日干为主)
    const yearShiShen = yearShiShenGan;
    const monthShiShen = monthShiShenGan;
    const dayShiShen = '日主'; // 日柱天干是日主自己
    const hourShiShen = hourShiShenGan;

    // 星座
    const zodiac = this.getZodiac(solar.getMonth(), solar.getDay());

    // 节气
    const jieQi = typeof lunar.getJieQi() === 'string' ? lunar.getJieQi() : '';
    const nextJieQi = typeof lunar.getNextJieQi() === 'string' ? lunar.getNextJieQi() : '';

    // 吉凶
    const dayYi = lunar.getDayYi() || [];
    const dayJi = lunar.getDayJi() || [];

    // 神煞
    const daySha = Array.isArray(lunar.getDaySha()) ? lunar.getDaySha() : [];
    const shenShaResult = this.calculateShenSha(eightChar);
    const shenSha = [...daySha, ...shenShaResult.shenSha];
    const yearShenSha = shenShaResult.yearShenSha;
    const monthShenSha = shenShaResult.monthShenSha;
    const dayShenSha = shenShaResult.dayShenSha;
    const hourShenSha = shenShaResult.hourShenSha;

    // 格局
    const geJuInfo = this.calculateGeJuImproved(eightChar);
    const geJu = geJuInfo?.geJu;
    const geJuDetail = geJuInfo?.detail;
    const geJuStrength = geJuInfo?.geJuStrength;
    const yongShen = geJuInfo?.yongShen;
    const yongShenDetail = geJuInfo?.yongShenDetail;
    const geJuFactors = geJuInfo?.geJuFactors;

    // 起运信息
    const genderNum = gender === '1' ? 1 : 0;
    const sectNum = parseInt(sect);
    const yun = eightChar.getYun(genderNum, sectNum);
    const qiYunYear = yun.getStartYear();
    const qiYunMonth = yun.getStartMonth();
    const qiYunDay = yun.getStartDay();
    const qiYunHour = yun.getStartHour();
    const qiYunDate = yun.getStartSolar().toYmd();
    const qiYunAge = qiYunYear; // 简化处理，实际应该计算虚岁

    // 大运信息
    const daYunArr = yun.getDaYun();
    const daYun = daYunArr.map(dy => {
      // 添加错误处理，防止旬空计算失败
      let xunKong = '';
      try {
        // 检查干支是否有效
        const ganZhi = dy.getGanZhi();
        if (ganZhi && ganZhi.length === 2) {
          // 手动计算旬空，避免使用可能出错的getXunKong方法
          const gan = ganZhi.charAt(0);
          const zhi = ganZhi.charAt(1);
          xunKong = this.calculateXunKong(gan, zhi);
        }
      } catch (e) {
        console.error('计算大运旬空出错:', e);
      }

      // 安全地获取属性，防止空指针异常
      let startYear = 0, endYear = 0, startAge = 0, endAge = 0, index = 0, ganZhi = '';
      try { startYear = dy.getStartYear(); } catch (e) { console.error('获取大运起始年出错:', e); }
      try { endYear = dy.getEndYear(); } catch (e) { console.error('获取大运结束年出错:', e); }
      try { startAge = dy.getStartAge(); } catch (e) { console.error('获取大运起始年龄出错:', e); }
      try { endAge = dy.getEndAge(); } catch (e) { console.error('获取大运结束年龄出错:', e); }
      try { index = dy.getIndex(); } catch (e) { console.error('获取大运序号出错:', e); }
      try { ganZhi = dy.getGanZhi(); } catch (e) { console.error('获取大运干支出错:', e); }

      // 计算十神
      let shiShenGan = '';
      try {
        if (ganZhi && ganZhi.length >= 1) {
          shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
        }
      } catch (e) {
        console.error('计算大运十神出错:', e);
      }

      // 计算地势
      let diShi = '';
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const zhi = ganZhi.charAt(1);
          diShi = this.getDiShi(dayStem, zhi);
        }
      } catch (e) {
        console.error('计算大运地势出错:', e);
      }

      // 计算神煞
      const shenSha: string[] = [];
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const stem = ganZhi.charAt(0);
          const branch = ganZhi.charAt(1);

          // 调试信息
          console.log(`计算大运神煞 - 索引: ${index}, 干支: ${ganZhi}`);
          console.log(`大运神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);

          // 天乙贵人
          if (this.isTianYiGuiRen(dayStem, branch)) {
            shenSha.push('天乙贵人');
          }

          // 文昌
          if (this.isWenChang(branch)) {
            shenSha.push('文昌');
          }

          // 华盖
          if (this.isHuaGai(branch)) {
            shenSha.push('华盖');
          }

          // 禄神
          if (this.isLuShen(stem, branch)) {
            shenSha.push('禄神');
          }

          // 桃花
          if (this.isTaoHua(branch)) {
            shenSha.push('桃花');
          }

          // 孤辰
          if (this.isGuChen(branch)) {
            shenSha.push('孤辰');
          }

          // 寡宿
          if (this.isGuaSu(branch)) {
            shenSha.push('寡宿');
          }

          // 驿马
          if (this.isYiMa(branch, yearBranch)) {
            shenSha.push('驿马');
          }

          // 将星
          if (this.isJiangXing(dayStem, branch)) {
            shenSha.push('将星');
          }

          // 金神
          if (this.isJinShen(branch)) {
            shenSha.push('金神');
          }

          // 天德
          if (this.isTianDe(stem, branch)) {
            shenSha.push('天德');
          }

          // 天德合
          if (this.isTianDeHe(stem, branch)) {
            shenSha.push('天德合');
          }

          // 月德
          if (this.isYueDe(stem)) {
            shenSha.push('月德');
          }

          // 天医
          if (this.isTianYi(branch)) {
            shenSha.push('天医');
          }

          // 天喜
          if (this.isTianXi(branch, yearBranch)) {
            shenSha.push('天喜');
          }

          // 红艳
          if (this.isHongYan(branch)) {
            shenSha.push('红艳');
          }

          // 天罗
          if (this.isTianLuo(branch)) {
            shenSha.push('天罗');
          }

          // 地网
          if (this.isDiWang(branch)) {
            shenSha.push('地网');
          }

          // 羊刃
          if (this.isYangRen(dayStem, branch)) {
            shenSha.push('羊刃');
          }

          // 天空
          if (this.isTianKong(branch)) {
            shenSha.push('天空');
          }

          // 地劫
          if (this.isDiJie(branch)) {
            shenSha.push('地劫');
          }

          // 天刑
          if (this.isTianXing(branch)) {
            shenSha.push('天刑');
          }

          // 天哭
          if (this.isTianKu(branch)) {
            shenSha.push('天哭');
          }

          // 天虚
          if (this.isTianXu(branch)) {
            shenSha.push('天虚');
          }

          // 咸池
          if (this.isXianChi(branch)) {
            shenSha.push('咸池');
          }

          // 亡神
          if (this.isWangShen(branch)) {
            shenSha.push('亡神');
          }

          // 劫煞
          if (this.isJieSha(branch)) {
            shenSha.push('劫煞');
          }

          // 灾煞
          if (this.isZaiSha(branch)) {
            shenSha.push('灾煞');
          }

          // 五鬼
          if (this.isWuGui(branch)) {
            shenSha.push('五鬼');
          }
        }
      } catch (e) {
        console.error('计算大运神煞出错:', e);
      }

      // 调试信息
      console.log(`大运返回数据 - 索引: ${index}, 神煞数组: `, shenSha);

      return {
        startYear,
        endYear,
        startAge,
        endAge,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong,
        shiShenGan,
        diShi,
        shenSha: [...shenSha] // 确保返回一个新的数组副本
      };
    });

    // 流年信息 (取第一个大运的流年)
    const liuNianArr = daYunArr.length > 1 ? daYunArr[1].getLiuNian() : [];
    const liuNian = liuNianArr.map(ln => {
      // 添加错误处理，防止旬空计算失败
      let xunKong = '';
      try {
        // 检查干支是否有效
        const ganZhi = ln.getGanZhi();
        if (ganZhi && ganZhi.length === 2) {
          // 手动计算旬空，避免使用可能出错的getXunKong方法
          const gan = ganZhi.charAt(0);
          const zhi = ganZhi.charAt(1);
          xunKong = this.calculateXunKong(gan, zhi);
        }
      } catch (e) {
        console.error('计算流年旬空出错:', e);
      }

      // 安全地获取属性，防止空指针异常
      let year = 0, age = 0, index = 0, ganZhi = '';
      try { year = ln.getYear(); } catch (e) { console.error('获取流年年份出错:', e); }
      try { age = ln.getAge(); } catch (e) { console.error('获取流年年龄出错:', e); }
      try { index = ln.getIndex(); } catch (e) { console.error('获取流年序号出错:', e); }
      try { ganZhi = ln.getGanZhi(); } catch (e) { console.error('获取流年干支出错:', e); }

      // 计算十神
      let shiShenGan = '';
      try {
        if (ganZhi && ganZhi.length >= 1) {
          shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
        }
      } catch (e) {
        console.error('计算流年十神出错:', e);
      }

      // 计算地势
      let diShi = '';
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const zhi = ganZhi.charAt(1);
          diShi = this.getDiShi(dayStem, zhi);
        }
      } catch (e) {
        console.error('计算流年地势出错:', e);
      }

      // 计算神煞
      const shenSha: string[] = [];
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const stem = ganZhi.charAt(0);
          const branch = ganZhi.charAt(1);

          // 调试信息
          console.log(`计算流年神煞 - 年份: ${year}, 干支: ${ganZhi}`);
          console.log(`流年神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);

          // 天乙贵人
          if (this.isTianYiGuiRen(dayStem, branch)) {
            shenSha.push('天乙贵人');
          }

          // 文昌
          if (this.isWenChang(branch)) {
            shenSha.push('文昌');
          }

          // 华盖
          if (this.isHuaGai(branch)) {
            shenSha.push('华盖');
          }

          // 禄神
          if (this.isLuShen(stem, branch)) {
            shenSha.push('禄神');
          }

          // 桃花
          if (this.isTaoHua(branch)) {
            shenSha.push('桃花');
          }

          // 孤辰
          if (this.isGuChen(branch)) {
            shenSha.push('孤辰');
          }

          // 寡宿
          if (this.isGuaSu(branch)) {
            shenSha.push('寡宿');
          }

          // 驿马
          if (this.isYiMa(branch, yearBranch)) {
            shenSha.push('驿马');
          }

          // 将星
          if (this.isJiangXing(dayStem, branch)) {
            shenSha.push('将星');
          }

          // 金神
          if (this.isJinShen(branch)) {
            shenSha.push('金神');
          }

          // 天德
          if (this.isTianDe(stem, branch)) {
            shenSha.push('天德');
          }

          // 天德合
          if (this.isTianDeHe(stem, branch)) {
            shenSha.push('天德合');
          }

          // 月德
          if (this.isYueDe(stem)) {
            shenSha.push('月德');
          }

          // 天医
          if (this.isTianYi(branch)) {
            shenSha.push('天医');
          }

          // 天喜
          if (this.isTianXi(branch, yearBranch)) {
            shenSha.push('天喜');
          }

          // 红艳
          if (this.isHongYan(branch)) {
            shenSha.push('红艳');
          }

          // 天罗
          if (this.isTianLuo(branch)) {
            shenSha.push('天罗');
          }

          // 地网
          if (this.isDiWang(branch)) {
            shenSha.push('地网');
          }

          // 羊刃
          if (this.isYangRen(dayStem, branch)) {
            shenSha.push('羊刃');
          }

          // 天空
          if (this.isTianKong(branch)) {
            shenSha.push('天空');
          }

          // 地劫
          if (this.isDiJie(branch)) {
            shenSha.push('地劫');
          }

          // 天刑
          if (this.isTianXing(branch)) {
            shenSha.push('天刑');
          }

          // 天哭
          if (this.isTianKu(branch)) {
            shenSha.push('天哭');
          }

          // 天虚
          if (this.isTianXu(branch)) {
            shenSha.push('天虚');
          }

          // 咸池
          if (this.isXianChi(branch)) {
            shenSha.push('咸池');
          }

          // 亡神
          if (this.isWangShen(branch)) {
            shenSha.push('亡神');
          }

          // 劫煞
          if (this.isJieSha(branch)) {
            shenSha.push('劫煞');
          }

          // 灾煞
          if (this.isZaiSha(branch)) {
            shenSha.push('灾煞');
          }

          // 岁破
          if (this.isSuiPo(branch, yearBranch)) {
            shenSha.push('岁破');
          }

          // 大耗
          if (this.isDaHao(branch, yearBranch)) {
            shenSha.push('大耗');
          }

          // 五鬼
          if (this.isWuGui(branch)) {
            shenSha.push('五鬼');
          }

          // 天德贵人
          if (this.isTianDeGuiRen(stem, branch)) {
            shenSha.push('天德贵人');
          }

          // 月德贵人
          if (this.isYueDeGuiRen(stem, branch)) {
            shenSha.push('月德贵人');
          }

          // 天赦
          if (this.isTianShe(stem, branch)) {
            shenSha.push('天赦');
          }

          // 天恩
          if (this.isTianEn(stem, branch)) {
            shenSha.push('天恩');
          }

          // 天官
          if (this.isTianGuan(stem, branch)) {
            shenSha.push('天官');
          }

          // 天福
          if (this.isTianFu(stem, branch)) {
            shenSha.push('天福');
          }

          // 天厨
          if (this.isTianChu(stem, branch)) {
            shenSha.push('天厨');
          }

          // 天巫
          if (this.isTianWu(branch)) {
            shenSha.push('天巫');
          }

          // 天月
          if (this.isTianYue(branch)) {
            shenSha.push('天月');
          }

          // 天马
          if (this.isTianMa(branch, yearBranch)) {
            shenSha.push('天马');
          }
        }
      } catch (e) {
        console.error('计算流年神煞出错:', e);
      }

      // 调试信息
      console.log(`流年返回数据 - 年份: ${year}, 神煞数组: `, shenSha);

      return {
        year,
        age,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong,
        shiShenGan,
        diShi,
        shenSha: [...shenSha] // 确保返回一个新的数组副本
      };
    });

    // 小运信息 (取第一个大运的小运)
    const xiaoYunArr = daYunArr.length > 1 ? daYunArr[1].getXiaoYun() : [];
    const xiaoYun = xiaoYunArr.map(xy => {
      // 添加错误处理，防止旬空计算失败
      let xunKong = '';
      try {
        // 检查干支是否有效
        const ganZhi = xy.getGanZhi();
        if (ganZhi && ganZhi.length === 2) {
          // 手动计算旬空，避免使用可能出错的getXunKong方法
          const gan = ganZhi.charAt(0);
          const zhi = ganZhi.charAt(1);
          xunKong = this.calculateXunKong(gan, zhi);
        }
      } catch (e) {
        console.error('计算小运旬空出错:', e);
      }

      // 安全地获取属性，防止空指针异常
      let year = 0, age = 0, index = 0, ganZhi = '';
      try { year = xy.getYear(); } catch (e) { console.error('获取小运年份出错:', e); }
      try { age = xy.getAge(); } catch (e) { console.error('获取小运年龄出错:', e); }
      try { index = xy.getIndex(); } catch (e) { console.error('获取小运序号出错:', e); }
      try { ganZhi = xy.getGanZhi(); } catch (e) { console.error('获取小运干支出错:', e); }

      // 计算十神
      let shiShenGan = '';
      try {
        if (ganZhi && ganZhi.length >= 1) {
          shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
        }
      } catch (e) {
        console.error('计算小运十神出错:', e);
      }

      // 计算地势
      let diShi = '';
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const zhi = ganZhi.charAt(1);
          diShi = this.getDiShi(dayStem, zhi);
        }
      } catch (e) {
        console.error('计算小运地势出错:', e);
      }

      // 计算神煞
      const shenSha: string[] = [];
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const stem = ganZhi.charAt(0);
          const branch = ganZhi.charAt(1);

          // 调试信息
          console.log(`计算小运神煞 - 年份: ${year}, 干支: ${ganZhi}`);
          console.log(`小运神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);

          // 天乙贵人
          if (this.isTianYiGuiRen(dayStem, branch)) {
            shenSha.push('天乙贵人');
          }

          // 文昌
          if (this.isWenChang(branch)) {
            shenSha.push('文昌');
          }

          // 华盖
          if (this.isHuaGai(branch)) {
            shenSha.push('华盖');
          }

          // 禄神
          if (this.isLuShen(stem, branch)) {
            shenSha.push('禄神');
          }

          // 桃花
          if (this.isTaoHua(branch)) {
            shenSha.push('桃花');
          }

          // 孤辰
          if (this.isGuChen(branch)) {
            shenSha.push('孤辰');
          }

          // 寡宿
          if (this.isGuaSu(branch)) {
            shenSha.push('寡宿');
          }

          // 驿马
          if (this.isYiMa(branch, yearBranch)) {
            shenSha.push('驿马');
          }

          // 将星
          if (this.isJiangXing(dayStem, branch)) {
            shenSha.push('将星');
          }

          // 金神
          if (this.isJinShen(branch)) {
            shenSha.push('金神');
          }

          // 天德
          if (this.isTianDe(stem, branch)) {
            shenSha.push('天德');
          }

          // 天德合
          if (this.isTianDeHe(stem, branch)) {
            shenSha.push('天德合');
          }

          // 月德
          if (this.isYueDe(stem)) {
            shenSha.push('月德');
          }

          // 天医
          if (this.isTianYi(branch)) {
            shenSha.push('天医');
          }

          // 天喜
          if (this.isTianXi(branch, yearBranch)) {
            shenSha.push('天喜');
          }

          // 红艳
          if (this.isHongYan(branch)) {
            shenSha.push('红艳');
          }

          // 天罗
          if (this.isTianLuo(branch)) {
            shenSha.push('天罗');
          }

          // 地网
          if (this.isDiWang(branch)) {
            shenSha.push('地网');
          }

          // 羊刃
          if (this.isYangRen(dayStem, branch)) {
            shenSha.push('羊刃');
          }

          // 天空
          if (this.isTianKong(branch)) {
            shenSha.push('天空');
          }

          // 地劫
          if (this.isDiJie(branch)) {
            shenSha.push('地劫');
          }

          // 天刑
          if (this.isTianXing(branch)) {
            shenSha.push('天刑');
          }

          // 天哭
          if (this.isTianKu(branch)) {
            shenSha.push('天哭');
          }

          // 天虚
          if (this.isTianXu(branch)) {
            shenSha.push('天虚');
          }

          // 咸池
          if (this.isXianChi(branch)) {
            shenSha.push('咸池');
          }

          // 亡神
          if (this.isWangShen(branch)) {
            shenSha.push('亡神');
          }

          // 劫煞
          if (this.isJieSha(branch)) {
            shenSha.push('劫煞');
          }

          // 灾煞
          if (this.isZaiSha(branch)) {
            shenSha.push('灾煞');
          }

          // 五鬼
          if (this.isWuGui(branch)) {
            shenSha.push('五鬼');
          }

          // 天德贵人
          if (this.isTianDeGuiRen(stem, branch)) {
            shenSha.push('天德贵人');
          }

          // 月德贵人
          if (this.isYueDeGuiRen(stem, branch)) {
            shenSha.push('月德贵人');
          }

          // 天赦
          if (this.isTianShe(stem, branch)) {
            shenSha.push('天赦');
          }

          // 天恩
          if (this.isTianEn(stem, branch)) {
            shenSha.push('天恩');
          }

          // 天官
          if (this.isTianGuan(stem, branch)) {
            shenSha.push('天官');
          }

          // 天福
          if (this.isTianFu(stem, branch)) {
            shenSha.push('天福');
          }

          // 天厨
          if (this.isTianChu(stem, branch)) {
            shenSha.push('天厨');
          }

          // 天巫
          if (this.isTianWu(branch)) {
            shenSha.push('天巫');
          }

          // 天月
          if (this.isTianYue(branch)) {
            shenSha.push('天月');
          }

          // 天马
          if (this.isTianMa(branch, yearBranch)) {
            shenSha.push('天马');
          }
        }
      } catch (e) {
        console.error('计算小运神煞出错:', e);
      }

      // 调试信息
      console.log(`小运返回数据 - 年份: ${year}, 神煞数组: `, shenSha);

      return {
        year,
        age,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong,
        shiShenGan,
        diShi,
        shenSha: [...shenSha] // 确保返回一个新的数组副本
      };
    });

    // 流月信息 (取第一个流年的流月)
    const liuYueArr = liuNianArr.length > 0 ? liuNianArr[0].getLiuYue() : [];
    const liuYue = liuYueArr.map(ly => {
      // 添加错误处理，防止旬空计算失败
      let xunKong = '';
      try {
        // 检查干支是否有效
        const ganZhi = ly.getGanZhi();
        if (ganZhi && ganZhi.length === 2) {
          // 手动计算旬空，避免使用可能出错的getXunKong方法
          const gan = ganZhi.charAt(0);
          const zhi = ganZhi.charAt(1);
          xunKong = this.calculateXunKong(gan, zhi);
        }
      } catch (e) {
        console.error('计算流月旬空出错:', e);
      }

      // 安全地获取属性，防止空指针异常
      let month = '', index = 0, ganZhi = '';
      try { month = ly.getMonthInChinese(); } catch (e) { console.error('获取流月月份出错:', e); }
      try { index = ly.getIndex(); } catch (e) { console.error('获取流月序号出错:', e); }
      try { ganZhi = ly.getGanZhi(); } catch (e) { console.error('获取流月干支出错:', e); }

      // 计算十神
      let shiShenGan = '';
      try {
        if (ganZhi && ganZhi.length >= 1) {
          shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
        }
      } catch (e) {
        console.error('计算流月十神出错:', e);
      }

      // 计算地势
      let diShi = '';
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const zhi = ganZhi.charAt(1);
          diShi = this.getDiShi(dayStem, zhi);
        }
      } catch (e) {
        console.error('计算流月地势出错:', e);
      }

      // 计算纳音
      let naYin = '';
      try {
        if (ganZhi && ganZhi.length === 2) {
          naYin = this.getNaYin(ganZhi);
        }
      } catch (e) {
        console.error('计算流月纳音出错:', e);
      }

      // 计算神煞
      const shenSha: string[] = [];
      try {
        if (ganZhi && ganZhi.length >= 2) {
          const stem = ganZhi.charAt(0);
          const branch = ganZhi.charAt(1);

          // 调试信息
          console.log(`计算流月神煞 - 月份: ${month}, 干支: ${ganZhi}`);
          console.log(`流月神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);

          // 天乙贵人
          if (this.isTianYiGuiRen(dayStem, branch)) {
            shenSha.push('天乙贵人');
          }

          // 文昌
          if (this.isWenChang(branch)) {
            shenSha.push('文昌');
          }

          // 华盖
          if (this.isHuaGai(branch)) {
            shenSha.push('华盖');
          }

          // 禄神
          if (this.isLuShen(stem, branch)) {
            shenSha.push('禄神');
          }

          // 桃花
          if (this.isTaoHua(branch)) {
            shenSha.push('桃花');
          }

          // 孤辰
          if (this.isGuChen(branch)) {
            shenSha.push('孤辰');
          }

          // 寡宿
          if (this.isGuaSu(branch)) {
            shenSha.push('寡宿');
          }

          // 驿马
          if (this.isYiMa(branch, yearBranch)) {
            shenSha.push('驿马');
          }

          // 将星
          if (this.isJiangXing(dayStem, branch)) {
            shenSha.push('将星');
          }

          // 金神
          if (this.isJinShen(branch)) {
            shenSha.push('金神');
          }

          // 天德
          if (this.isTianDe(stem, branch)) {
            shenSha.push('天德');
          }

          // 天德合
          if (this.isTianDeHe(stem, branch)) {
            shenSha.push('天德合');
          }

          // 月德
          if (this.isYueDe(stem)) {
            shenSha.push('月德');
          }

          // 天医
          if (this.isTianYi(branch)) {
            shenSha.push('天医');
          }

          // 天喜
          if (this.isTianXi(branch, yearBranch)) {
            shenSha.push('天喜');
          }

          // 红艳
          if (this.isHongYan(branch)) {
            shenSha.push('红艳');
          }

          // 天罗
          if (this.isTianLuo(branch)) {
            shenSha.push('天罗');
          }

          // 地网
          if (this.isDiWang(branch)) {
            shenSha.push('地网');
          }

          // 羊刃
          if (this.isYangRen(dayStem, branch)) {
            shenSha.push('羊刃');
          }

          // 天空
          if (this.isTianKong(branch)) {
            shenSha.push('天空');
          }

          // 地劫
          if (this.isDiJie(branch)) {
            shenSha.push('地劫');
          }

          // 天刑
          if (this.isTianXing(branch)) {
            shenSha.push('天刑');
          }

          // 天哭
          if (this.isTianKu(branch)) {
            shenSha.push('天哭');
          }

          // 天虚
          if (this.isTianXu(branch)) {
            shenSha.push('天虚');
          }

          // 咸池
          if (this.isXianChi(branch)) {
            shenSha.push('咸池');
          }

          // 亡神
          if (this.isWangShen(branch)) {
            shenSha.push('亡神');
          }

          // 劫煞
          if (this.isJieSha(branch)) {
            shenSha.push('劫煞');
          }

          // 灾煞
          if (this.isZaiSha(branch)) {
            shenSha.push('灾煞');
          }

          // 五鬼
          if (this.isWuGui(branch)) {
            shenSha.push('五鬼');
          }

          // 天德贵人
          if (this.isTianDeGuiRen(stem, branch)) {
            shenSha.push('天德贵人');
          }

          // 月德贵人
          if (this.isYueDeGuiRen(stem, branch)) {
            shenSha.push('月德贵人');
          }

          // 天赦
          if (this.isTianShe(stem, branch)) {
            shenSha.push('天赦');
          }

          // 天恩
          if (this.isTianEn(stem, branch)) {
            shenSha.push('天恩');
          }

          // 天官
          if (this.isTianGuan(stem, branch)) {
            shenSha.push('天官');
          }

          // 天福
          if (this.isTianFu(stem, branch)) {
            shenSha.push('天福');
          }

          // 天厨
          if (this.isTianChu(stem, branch)) {
            shenSha.push('天厨');
          }

          // 天巫
          if (this.isTianWu(branch)) {
            shenSha.push('天巫');
          }

          // 天月
          if (this.isTianYue(branch)) {
            shenSha.push('天月');
          }

          // 天马
          if (this.isTianMa(branch, yearBranch)) {
            shenSha.push('天马');
          }
        }
      } catch (e) {
        console.error('计算流月神煞出错:', e);
      }

      // 调试信息
      console.log(`流月神煞计算结果 - 月份: ${month}, 神煞: ${shenSha.join(', ')}`);
      console.log(`流月神煞计算结果类型 - 月份: ${month}, 类型: ${typeof shenSha}, 是否数组: ${Array.isArray(shenSha)}, 长度: ${shenSha.length}`);

      // 调试信息
      console.log(`流月返回数据 - 月份: ${month}, 神煞数组: `, shenSha);

      return {
        month,
        index,
        ganZhi,
        naYin,
        xunKong,
        shiShenGan,
        diShi,
        shenSha: [...shenSha] // 确保返回一个新的数组副本
      };
    });

    // 检查三合局和三会局
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
    const sanHeJu = this.checkSanHeJu(branches);
    const sanHuiJu = this.checkSanHuiJu(branches);

    // 计算五行强度
    const wuXingStrength = this.calculateWuXingStrength(eightChar);

    // 计算日主旺衰
    const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
    const riZhuStrength = riZhuStrengthInfo.result;
    const riZhuStrengthDetails = riZhuStrengthInfo.details;

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
      hourShengXiao,

      // 十神信息
      yearShiShen,
      monthShiShen,
      dayShiShen,
      hourShiShen,

      // 天干十神（用于显示）
      yearShiShenGan: yearShiShenGan,
      monthShiShenGan: monthShiShenGan,
      timeShiShenGan: hourShiShenGan,
      hourShiShenGan: hourShiShenGan, // 添加hourShiShenGan属性，与parseBaziString保持一致

      // 地支十神
      yearShiShenZhi,
      monthShiShenZhi,
      dayShiShenZhi,
      hourShiShenZhi,

      // 地势（长生十二神）
      yearDiShi,
      monthDiShi,
      dayDiShi,
      timeDiShi,

      // 旬空（空亡）
      yearXunKong,
      monthXunKong,
      dayXunKong,
      timeXunKong,

      // 星座和节气
      zodiac,
      jieQi: jieQi as string,
      nextJieQi: nextJieQi as string,

      // 吉凶和神煞
      dayYi: dayYi as string[],
      dayJi: dayJi as string[],
      shenSha: shenSha as string[],

      // 格局
      ...(geJu ? { geJu } : {}),
      ...(geJuDetail ? { geJuDetail } : {}),
      ...(geJuStrength ? { geJuStrength } : {}),
      ...(yongShen ? { yongShen } : {}),
      ...(yongShenDetail ? { yongShenDetail } : {}),
      ...(geJuFactors ? { geJuFactors } : {}),

      // 起运信息
      qiYunYear,
      qiYunMonth,
      qiYunDay,
      qiYunHour,
      qiYunDate,
      qiYunAge,

      // 大运、流年、小运、流月
      daYun,
      liuNian,
      xiaoYun,
      liuYue,

      // 组合信息
      sanHeJu,
      sanHuiJu,

      // 五行强度和日主旺衰
      wuXingStrength,
      riZhuStrength,
      riZhuStrengthDetails
    };
  }



  /**
   * 获取地支对应的生肖
   * @param branch 地支
   * @returns 生肖
   */
  private static getShengXiao(branch: string): string {
    const map: {[key: string]: string} = {
      '子': '鼠',
      '丑': '牛',
      '寅': '虎',
      '卯': '兔',
      '辰': '龙',
      '巳': '蛇',
      '午': '马',
      '未': '羊',
      '申': '猴',
      '酉': '鸡',
      '戌': '狗',
      '亥': '猪'
    };

    return map[branch] || '未知';
  }

  /**
   * 获取十神
   * @param dayStem 日干（日主）
   * @param otherStem 其他天干
   * @returns 十神
   */
  static getShiShen(dayStem: string, otherStem: string): string {
    // 天干顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";

    // 阳干：甲丙戊庚壬
    // 阴干：乙丁己辛癸
    const yangGan = '甲丙戊庚壬';

    // 获取日干和目标天干的索引
    const dayStemIndex = stems.indexOf(dayStem);
    const stemIndex = stems.indexOf(otherStem);

    if (dayStemIndex === -1 || stemIndex === -1) {
      return '未知';
    }

    // 判断日干阴阳
    const isDayYang = yangGan.includes(dayStem);

    // 计算十神索引
    let shiShenIndex = (stemIndex - dayStemIndex + 10) % 10;

    // 十神顺序（阳干）：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
    // 十神顺序（阴干）：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
    const shiShenNames = [
      "比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"
    ];

    return shiShenNames[shiShenIndex];
  }

  /**
   * 获取地支藏干的十神
   * @param dayStem 日干（日主）
   * @param branch 地支
   * @returns 藏干对应的十神数组
   */
  static getHiddenShiShen(dayStem: string, branch: string): string[] {
    // 获取地支藏干
    const hideGanStr = this.getHideGan(branch);

    // 如果藏干字符串为空，返回空数组
    if (!hideGanStr) {
      return [];
    }

    const hideGans = hideGanStr.split(',');

    // 如果没有藏干，返回空数组
    if (hideGans.length === 0 || hideGans[0] === '') {
      return [];
    }

    // 计算每个藏干的十神
    const shiShens: string[] = [];
    for (const gan of hideGans) {
      if (gan) {
        const shiShen = this.getShiShen(dayStem, gan);
        shiShens.push(shiShen);
      }
    }

    return shiShens;
  }

  /**
   * 计算大运
   * @param eightChar 八字对象
   * @param gender 性别（1-男，0-女）
   * @returns 大运数组
   */
  private static calculateDaYun(eightChar: EightChar, gender: string): Array<{ startYear: number; startAge: number; ganZhi: string; naYin: string }> {
    // 这里简化处理，实际应该使用lunar-typescript库的方法
    // 或者根据八字命理规则计算
    const daYun: Array<{ startYear: number; startAge: number; ganZhi: string; naYin: string }> = [];

    // 简单示例：从10岁开始，每10年一个大运
    const startAge = 10;
    const currentYear = new Date().getFullYear();

    // 获取月柱
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();

    // 天干地支顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 月柱索引
    const monthStemIndex = stems.indexOf(monthStem);
    const monthBranchIndex = branches.indexOf(monthBranch);

    // 根据性别确定顺逆行
    const direction = (gender === '1') ? 1 : -1; // 男顺女逆

    // 生成10个大运
    for (let i = 0; i < 10; i++) {
      // 计算大运干支索引
      const stemIndex = (monthStemIndex + direction * (i + 1) + 10) % 10;
      const branchIndex = (monthBranchIndex + direction * (i + 1) + 12) % 12;

      // 大运干支
      const stem = stems[stemIndex];
      const branch = branches[branchIndex];
      const ganZhi = stem + branch;

      // 大运纳音
      const naYin = this.getNaYin(ganZhi);

      // 大运起始年龄和年份
      const startYearAge = startAge + i * 10;
      const startYear = currentYear + (startYearAge - 20); // 假设当前年龄20岁

      daYun.push({
        startYear,
        startAge: startYearAge,
        ganZhi,
        naYin
      });
    }

    return daYun;
  }

  /**
   * 计算流年
   * @param birthYear 出生年
   * @returns 流年数组
   */
  private static calculateLiuNian(birthYear: number): Array<{ year: number; age: number; ganZhi: string; naYin: string }> {
    const liuNian: Array<{ year: number; age: number; ganZhi: string; naYin: string }> = [];
    const currentYear = new Date().getFullYear();

    // 天干地支顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 生成10个流年（当前年及未来9年）
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      const age = year - birthYear + 1; // 虚岁

      // 计算流年干支
      const stemIndex = (year - 4) % 10;
      const branchIndex = (year - 4) % 12;

      const stem = stems[stemIndex];
      const branch = branches[branchIndex];
      const ganZhi = stem + branch;

      // 流年纳音
      const naYin = this.getNaYin(ganZhi);

      liuNian.push({
        year,
        age,
        ganZhi,
        naYin
      });
    }

    return liuNian;
  }

  /**
   * 计算五行强度
   * @param eightChar 八字对象
   * @returns 五行强度和详细计算过程
   */
  private static calculateWuXingStrength(eightChar: EightChar): {
    jin: number;
    mu: number;
    shui: number;
    huo: number;
    tu: number;
    details: {
      jin: { tianGan: number; diZhiCang: number; naYin: number; season: number; monthDominant: number; combination: number; total: number },
      mu: { tianGan: number; diZhiCang: number; naYin: number; season: number; monthDominant: number; combination: number; total: number },
      shui: { tianGan: number; diZhiCang: number; naYin: number; season: number; monthDominant: number; combination: number; total: number },
      huo: { tianGan: number; diZhiCang: number; naYin: number; season: number; monthDominant: number; combination: number; total: number },
      tu: { tianGan: number; diZhiCang: number; naYin: number; season: number; monthDominant: number; combination: number; total: number }
    }
  } {
    // 初始化五行强度
    const strength = {
      jin: 0, // 金
      mu: 0,  // 木
      shui: 0, // 水
      huo: 0,  // 火
      tu: 0    // 土
    };

    // 初始化详细信息，记录各项得分
    const details = {
      jin: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
      mu: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
      shui: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
      huo: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
      tu: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 }
    };

    // 1. 天干部分 - 按照不同柱位的权重计算
    // 获取四柱天干
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const dayStem = eightChar.getDayGan();
    const timeStem = eightChar.getTimeGan();

    // 获取四柱天干五行
    const yearStemWuXing = this.getStemWuXing(yearStem);
    const monthStemWuXing = this.getStemWuXing(monthStem);
    const dayStemWuXing = this.getStemWuXing(dayStem);
    const timeStemWuXing = this.getStemWuXing(timeStem);

    // 天干权重: 年干(1.0) < 月干(2.5) < 日干(3.0) > 时干(1.0)
    this.addWuXingStrength(yearStemWuXing, 1.0, details, 'tianGan');
    this.addWuXingStrength(monthStemWuXing, 2.5, details, 'tianGan'); // 提高月干权重
    this.addWuXingStrength(dayStemWuXing, 3.0, details, 'tianGan');
    this.addWuXingStrength(timeStemWuXing, 1.0, details, 'tianGan');

    // 2. 地支部分 - 考虑地支藏干
    // 获取四柱地支
    const yearBranch = eightChar.getYearZhi();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const timeBranch = eightChar.getTimeZhi();



    // 获取地支藏干 - 使用我们自己的藏干定义，而不是lunar-typescript库的定义
    const yearHideGan = this.getHideGan(yearBranch).split(',');
    const monthHideGan = this.getHideGan(monthBranch).split(',');
    const dayHideGan = this.getHideGan(dayBranch).split(',');
    const timeHideGan = this.getHideGan(timeBranch).split(',');

    // 地支藏干权重: 年支藏干(0.7) < 月支藏干(2.0) < 日支藏干(2.0) > 时支藏干(0.7)
    this.processHideGanForStrength(yearHideGan, 0.7, details);
    this.processHideGanForStrength(monthHideGan, 2.0, details); // 提高月支藏干权重
    this.processHideGanForStrength(dayHideGan, 2.0, details);
    this.processHideGanForStrength(timeHideGan, 0.7, details);

    // 3. 纳音五行 - 考虑纳音的影响
    // 获取四柱纳音
    const yearNaYin = eightChar.getYearNaYin();
    const monthNaYin = eightChar.getMonthNaYin();
    const dayNaYin = eightChar.getDayNaYin();
    const timeNaYin = eightChar.getTimeNaYin();

    // 提取纳音五行
    const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
    const monthNaYinWuXing = this.getNaYinWuXing(monthNaYin);
    const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
    const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);

    // 纳音五行权重: 年柱纳音(0.5) < 月柱纳音(1.5) < 日柱纳音(1.5) > 时柱纳音(0.5)
    this.addWuXingStrength(yearNaYinWuXing, 0.5, details, 'naYin');
    this.addWuXingStrength(monthNaYinWuXing, 1.5, details, 'naYin'); // 提高月柱纳音权重
    this.addWuXingStrength(dayNaYinWuXing, 1.5, details, 'naYin');
    this.addWuXingStrength(timeNaYinWuXing, 0.5, details, 'naYin');

    // 4. 月令旺衰调整 - 根据月令对五行强度进行调整
    this.adjustByMonthSeasonForStrength(monthBranch, details);

    // 5. 月令当令加成 - 新增
    this.addMonthDominantBonus(monthBranch, details);

    // 6. 四柱组合调整 - 根据四柱组合关系进行调整
    this.adjustByCombinationForStrength(eightChar, details);

    // 7. 计算各五行总得分
    details.jin.total = details.jin.tianGan + details.jin.diZhiCang + details.jin.naYin +
                       details.jin.season + details.jin.monthDominant + details.jin.combination;
    details.mu.total = details.mu.tianGan + details.mu.diZhiCang + details.mu.naYin +
                       details.mu.season + details.mu.monthDominant + details.mu.combination;
    details.shui.total = details.shui.tianGan + details.shui.diZhiCang + details.shui.naYin +
                         details.shui.season + details.shui.monthDominant + details.shui.combination;
    details.huo.total = details.huo.tianGan + details.huo.diZhiCang + details.huo.naYin +
                        details.huo.season + details.huo.monthDominant + details.huo.combination;
    details.tu.total = details.tu.tianGan + details.tu.diZhiCang + details.tu.naYin +
                       details.tu.season + details.tu.monthDominant + details.tu.combination;

    // 7. 四舍五入到一位小数
    details.jin.total = Math.round(details.jin.total * 10) / 10;
    details.mu.total = Math.round(details.mu.total * 10) / 10;
    details.shui.total = Math.round(details.shui.total * 10) / 10;
    details.huo.total = Math.round(details.huo.total * 10) / 10;
    details.tu.total = Math.round(details.tu.total * 10) / 10;

    // 8. 更新strength对象
    strength.jin = details.jin.total;
    strength.mu = details.mu.total;
    strength.shui = details.shui.total;
    strength.huo = details.huo.total;
    strength.tu = details.tu.total;

    // 返回结果
    return {
      jin: strength.jin,
      mu: strength.mu,
      shui: strength.shui,
      huo: strength.huo,
      tu: strength.tu,
      details
    };
  }

  /**
   * 增加五行强度
   * @param wuXing 五行
   * @param value 增加的值
   * @param details 详细信息对象
   * @param category 类别（tianGan, diZhiCang, naYin, season, combination）
   */
  private static addWuXingStrength(wuXing: string, value: number, details: any, category: string): void {
    if (!wuXing) return;

    switch (wuXing) {
      case '金': details.jin[category] += value; break;
      case '木': details.mu[category] += value; break;
      case '水': details.shui[category] += value; break;
      case '火': details.huo[category] += value; break;
      case '土': details.tu[category] += value; break;
    }
  }

  /**
   * 处理地支藏干的五行强度
   * @param hideGan 藏干数组
   * @param baseWeight 基础权重
   * @param details 详细信息对象
   * @param cangGanInnerWeight 藏干内部权重配置
   */
  private static processHideGanForStrength(hideGan: string[], baseWeight: number, details: any, cangGanInnerWeight?: any): void {
    if (!hideGan || hideGan.length === 0) return;

    // 根据藏干数量分配权重
    // 使用配置中的权重或默认权重
    let weights;
    if (cangGanInnerWeight) {
      weights = hideGan.length === 1 ? cangGanInnerWeight.one :
               hideGan.length === 2 ? cangGanInnerWeight.two :
               cangGanInnerWeight.three;
    } else {
      // 默认权重
      weights = hideGan.length === 1 ? [1.0] :
               hideGan.length === 2 ? [0.6, 0.4] :
               [0.5, 0.3, 0.2];
    }

    // 为每个藏干增加相应权重的五行强度
    hideGan.forEach((gan, index) => {
      if (index < weights.length) {
        const wuXing = this.getStemWuXing(gan);
        const value = baseWeight * weights[index];
        this.addWuXingStrength(wuXing, value, details, 'diZhiCang');
      }
    });
  }

  /**
   * 根据月令季节调整五行强度
   * @param monthBranch 月支
   * @param details 详细信息对象
   * @param seasonAdjust 季节调整系数配置
   * @param seasonWuXingStatus 季节五行对应关系配置
   */
  private static adjustByMonthSeasonForStrength(
    monthBranch: string,
    details: any,
    seasonAdjust?: any,
    seasonWuXingStatus?: any
  ): void {
    // 使用配置或默认值
    const adjust = seasonAdjust || {
      wang: 2.0,   // 旺相系数
      xiang: 1.0,  // 相旺系数
      ping: 0.0,   // 平和系数
      qiu: -1.0,   // 囚系数
      si: -1.5     // 死系数
    };

    let season = '';
    let wuXingStatus: any = {};

    if (['寅', '卯', '辰'].includes(monthBranch)) {
      // 春季
      season = 'spring';
      wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.spring : {
        mu: 'wang',    // 木旺
        huo: 'xiang',  // 火相
        tu: 'ping',    // 土平
        jin: 'qiu',    // 金囚
        shui: 'si'     // 水死
      };
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      // 夏季
      season = 'summer';
      wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.summer : {
        huo: 'wang',   // 火旺
        tu: 'xiang',   // 土相
        jin: 'ping',   // 金平
        shui: 'qiu',   // 水囚
        mu: 'si'       // 木死
      };
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      // 秋季
      season = 'autumn';
      wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.autumn : {
        jin: 'wang',   // 金旺
        shui: 'xiang', // 水相
        mu: 'ping',    // 木平
        huo: 'qiu',    // 火囚
        tu: 'si'       // 土死
      };
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      // 冬季
      season = 'winter';
      wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.winter : {
        shui: 'wang',  // 水旺
        mu: 'xiang',   // 木相
        huo: 'ping',   // 火平
        tu: 'qiu',     // 土囚
        jin: 'si'      // 金死
      };
    }

    // 应用调整
    Object.keys(wuXingStatus).forEach(wuXing => {
      const status = wuXingStatus[wuXing];
      if (details[wuXing] && adjust[status] !== undefined) {
        details[wuXing].season += adjust[status];
      }
    });
  }

  /**
   * 添加月令当令加成
   * @param monthBranch 月支
   * @param details 详细信息对象
   * @param monthDominantBonus 月令当令加成配置
   * @param monthDominantWuXing 月令当令五行对应关系配置
   */
  private static addMonthDominantBonus(
    monthBranch: string,
    details: any,
    monthDominantBonus?: any,
    monthDominantWuXing?: any
  ): void {
    // 使用配置或默认值
    const bonus = monthDominantBonus || {
      dominant: 1.5,   // 当令加成
      related: 0.8,    // 相旺加成
      neutral: 0.0,    // 平和加成
      weak: -0.5,      // 囚加成
      dead: -0.8       // 死加成
    };

    let season = '';
    let dominantInfo: any = {};

    if (['寅', '卯', '辰'].includes(monthBranch)) {
      // 春季
      season = 'spring';
      dominantInfo = monthDominantWuXing ? monthDominantWuXing.spring : {
        dominant: 'mu',    // 木当令
        related: 'huo'     // 火相旺
      };
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      // 夏季
      season = 'summer';
      dominantInfo = monthDominantWuXing ? monthDominantWuXing.summer : {
        dominant: 'huo',   // 火当令
        related: 'tu'      // 土相旺
      };
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      // 秋季
      season = 'autumn';
      dominantInfo = monthDominantWuXing ? monthDominantWuXing.autumn : {
        dominant: 'jin',   // 金当令
        related: 'shui'    // 水相旺
      };
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      // 冬季
      season = 'winter';
      dominantInfo = monthDominantWuXing ? monthDominantWuXing.winter : {
        dominant: 'shui',  // 水当令
        related: 'mu'      // 木相旺
      };
    }

    // 应用当令和相旺加成
    if (dominantInfo.dominant && details[dominantInfo.dominant]) {
      details[dominantInfo.dominant].monthDominant += bonus.dominant;
    }

    if (dominantInfo.related && details[dominantInfo.related]) {
      details[dominantInfo.related].monthDominant += bonus.related;
    }

    // 应用囚和死的负面调整（新增）
    // 根据季节五行旺衰关系确定囚和死的五行
    const wuXingList = ['jin', 'mu', 'shui', 'huo', 'tu'];
    const dominantWuXing = dominantInfo.dominant;
    const relatedWuXing = dominantInfo.related;

    // 找出平和、囚和死的五行
    wuXingList.forEach(wuXing => {
      if (wuXing !== dominantWuXing && wuXing !== relatedWuXing) {
        // 根据季节确定五行状态
        let status = 'neutral'; // 默认平和

        if (season === 'spring') {
          if (wuXing === 'jin') status = 'weak'; // 金囚
          if (wuXing === 'shui') status = 'dead'; // 水死
        } else if (season === 'summer') {
          if (wuXing === 'shui') status = 'weak'; // 水囚
          if (wuXing === 'mu') status = 'dead'; // 木死
        } else if (season === 'autumn') {
          if (wuXing === 'huo') status = 'weak'; // 火囚
          if (wuXing === 'tu') status = 'dead'; // 土死
        } else if (season === 'winter') {
          if (wuXing === 'tu') status = 'weak'; // 土囚
          if (wuXing === 'jin') status = 'dead'; // 金死
        }

        // 应用相应的加成
        if (bonus[status] && details[wuXing]) {
          details[wuXing].monthDominant += bonus[status];
        }
      }
    });
  }

  /**
   * 根据四柱组合关系调整五行强度
   * @param eightChar 八字对象
   * @param details 详细信息对象
   * @param combinationWeight 组合关系权重配置
   */
  private static adjustByCombinationForStrength(eightChar: EightChar, details: any, combinationWeight?: any): void {
    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 检查天干合化
    this.checkStemCombinationForStrength(yearStem, monthStem, details, combinationWeight);
    this.checkStemCombinationForStrength(yearStem, dayStem, details, combinationWeight);
    this.checkStemCombinationForStrength(yearStem, timeStem, details, combinationWeight);
    this.checkStemCombinationForStrength(monthStem, dayStem, details, combinationWeight);
    this.checkStemCombinationForStrength(monthStem, timeStem, details, combinationWeight);
    this.checkStemCombinationForStrength(dayStem, timeStem, details, combinationWeight);

    // 检查地支组合（三合、三会、六合等）
    this.checkBranchTripleForStrength(yearBranch, monthBranch, dayBranch, timeBranch, details, combinationWeight);
  }

  /**
   * 检查天干合化
   * @param stem1 天干1
   * @param stem2 天干2
   * @param details 详细信息对象
   * @param combinationWeight 组合关系权重配置
   */
  private static checkStemCombinationForStrength(stem1: string, stem2: string, details: any, combinationWeight?: any): void {
    // 使用配置或默认值
    const tianGanWuHeValue = combinationWeight ? combinationWeight.tianGanWuHe : 0.6;

    // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
    const combinations: {[key: string]: {result: string, value: number}} = {
      '甲己': {result: '土', value: tianGanWuHeValue},
      '己甲': {result: '土', value: tianGanWuHeValue},
      '乙庚': {result: '金', value: tianGanWuHeValue},
      '庚乙': {result: '金', value: tianGanWuHeValue},
      '丙辛': {result: '水', value: tianGanWuHeValue},
      '辛丙': {result: '水', value: tianGanWuHeValue},
      '丁壬': {result: '木', value: tianGanWuHeValue},
      '壬丁': {result: '木', value: tianGanWuHeValue},
      '戊癸': {result: '火', value: tianGanWuHeValue},
      '癸戊': {result: '火', value: tianGanWuHeValue}
    };

    const key = stem1 + stem2;
    if (combinations[key]) {
      const {result, value} = combinations[key];
      this.addWuXingStrength(result, value, details, 'combination');
    }
  }

  /**
   * 检查地支三合和三会
   * @param branch1 地支1
   * @param branch2 地支2
   * @param branch3 地支3
   * @param branch4 地支4
   * @param details 详细信息对象
   * @param combinationWeight 组合关系权重配置
   */
  private static checkBranchTripleForStrength(
    branch1: string,
    branch2: string,
    branch3: string,
    branch4: string,
    details: any,
    combinationWeight?: any
  ): void {
    const branches = [branch1, branch2, branch3, branch4];

    // 使用配置或默认值
    const sanHeValue = combinationWeight ? combinationWeight.diZhiSanHe : 1.2;
    const sanHuiValue = combinationWeight ? combinationWeight.diZhiSanHui : 1.0;
    const partialSanHeValue = combinationWeight ? combinationWeight.partialSanHe : 0.9;
    const partialSanHuiValue = combinationWeight ? combinationWeight.partialSanHui : 0.7;

    // 检查三合局
    const sanHeJu = this.checkSanHeJu(branches);
    if (sanHeJu) {
      // 检查是完整三合还是部分三合
      const sanHePatterns = {
        '火': ['寅', '午', '戌'],
        '水': ['申', '子', '辰'],
        '木': ['亥', '卯', '未'],
        '金': ['巳', '酉', '丑']
      };

      const pattern = sanHePatterns[sanHeJu];
      const matchedBranches = branches.filter(branch => pattern.includes(branch));
      const uniqueBranches = new Set(matchedBranches);

      // 根据匹配的地支数量决定使用完整值还是部分值
      if (uniqueBranches.size === 3) {
        // 完整三合
        this.addWuXingStrength(sanHeJu, sanHeValue, details, 'combination');
      } else {
        // 部分三合
        this.addWuXingStrength(sanHeJu, partialSanHeValue, details, 'combination');
      }
    }

    // 检查三会局
    const sanHuiJu = this.checkSanHuiJu(branches);
    if (sanHuiJu) {
      // 检查是完整三会还是部分三会
      const sanHuiPatterns = {
        '木': ['寅', '卯', '辰'],
        '火': ['巳', '午', '未'],
        '金': ['申', '酉', '戌'],
        '水': ['亥', '子', '丑']
      };

      const pattern = sanHuiPatterns[sanHuiJu];
      const matchedBranches = branches.filter(branch => pattern.includes(branch));
      const uniqueBranches = new Set(matchedBranches);

      // 根据匹配的地支数量决定使用完整值还是部分值
      if (uniqueBranches.size === 3) {
        // 完整三会
        this.addWuXingStrength(sanHuiJu, sanHuiValue, details, 'combination');
      } else {
        // 部分三会
        this.addWuXingStrength(sanHuiJu, partialSanHuiValue, details, 'combination');
      }
    }
  }



  /**
   * 处理地支藏干的五行强度并返回详细信息
   * @param hideGan 藏干数组
   * @param baseWeight 基础权重
   * @param addStrength 增加强度的函数
   * @returns 每个藏干的权重值数组
   */
  private static processHideGanWithDetails(hideGan: string[], baseWeight: number, addStrength: (wuXing: string, value: number) => void): number[] {
    if (!hideGan || hideGan.length === 0) return [];

    // 根据藏干数量分配权重
    // 一个藏干：100%权重
    // 两个藏干：60%和40%权重
    // 三个藏干：50%、30%和20%权重
    const weights = hideGan.length === 1 ? [1.0] :
                   hideGan.length === 2 ? [0.6, 0.4] :
                   [0.5, 0.3, 0.2];

    const values: number[] = [];

    // 为每个藏干增加相应权重的五行强度
    hideGan.forEach((gan, index) => {
      if (index < weights.length) {
        const wuXing = this.getStemWuXing(gan);
        const value = baseWeight * weights[index];
        addStrength(wuXing, value);
        values.push(value);
      }
    });

    return values;
  }

  /**
   * 根据月令季节调整五行强度
   * @param monthBranch 月支
   * @param strength 五行强度对象
   */
  private static adjustByMonthSeason(monthBranch: string, strength: { jin: number; mu: number; shui: number; huo: number; tu: number }): void {
    // 根据月令季节调整五行强度
    // 春季(寅卯辰)：木旺(+1.0)，火相(+0.5)，土休，金囚，水死
    // 夏季(巳午未)：火旺(+1.0)，土相(+0.5)，金休，水囚，木死
    // 秋季(申酉戌)：金旺(+1.0)，水相(+0.5)，木休，火囚，土死
    // 冬季(亥子丑)：水旺(+1.0)，木相(+0.5)，火休，土囚，金死

    if (['寅', '卯', '辰'].includes(monthBranch)) {
      // 春季
      strength.mu += 1.0; // 木旺
      strength.huo += 0.5; // 火相
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      // 夏季
      strength.huo += 1.0; // 火旺
      strength.tu += 0.5; // 土相
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      // 秋季
      strength.jin += 1.0; // 金旺
      strength.shui += 0.5; // 水相
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      // 冬季
      strength.shui += 1.0; // 水旺
      strength.mu += 0.5; // 木相
    }
  }

  /**
   * 根据月令季节调整五行强度并记录详细信息
   * @param monthBranch 月支
   * @param strength 五行强度对象
   * @param details 详细信息对象
   */
  private static adjustByMonthSeasonWithDetails(
    monthBranch: string,
    strength: { jin: number; mu: number; shui: number; huo: number; tu: number },
    details: any
  ): void {
    let season = '';
    const adjustments: { wuXing: string; value: number; }[] = [];

    if (['寅', '卯', '辰'].includes(monthBranch)) {
      // 春季
      season = '春季';
      strength.mu += 1.0; // 木旺
      adjustments.push({ wuXing: '木', value: 1.0 });

      strength.huo += 0.5; // 火相
      adjustments.push({ wuXing: '火', value: 0.5 });
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      // 夏季
      season = '夏季';
      strength.huo += 1.0; // 火旺
      adjustments.push({ wuXing: '火', value: 1.0 });

      strength.tu += 0.5; // 土相
      adjustments.push({ wuXing: '土', value: 0.5 });
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      // 秋季
      season = '秋季';
      strength.jin += 1.0; // 金旺
      adjustments.push({ wuXing: '金', value: 1.0 });

      strength.shui += 0.5; // 水相
      adjustments.push({ wuXing: '水', value: 0.5 });
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      // 冬季
      season = '冬季';
      strength.shui += 1.0; // 水旺
      adjustments.push({ wuXing: '水', value: 1.0 });

      strength.mu += 0.5; // 木相
      adjustments.push({ wuXing: '木', value: 0.5 });
    }

    details.seasonAdjust.season = season;
    details.seasonAdjust.adjustments = adjustments;
  }

  /**
   * 根据四柱组合关系调整五行强度
   * @param eightChar 八字对象
   * @param strength 五行强度对象
   */
  private static adjustByCombination(eightChar: EightChar, strength: { jin: number; mu: number; shui: number; huo: number; tu: number }): void {
    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 检查天干合化
    this.checkStemCombination(yearStem, monthStem, strength);
    this.checkStemCombination(yearStem, dayStem, strength);
    this.checkStemCombination(yearStem, timeStem, strength);
    this.checkStemCombination(monthStem, dayStem, strength);
    this.checkStemCombination(monthStem, timeStem, strength);
    this.checkStemCombination(dayStem, timeStem, strength);

    // 检查地支组合（三合、三会、六合等）
    // 这里只实现简化版的地支三合
    this.checkBranchTriple(yearBranch, monthBranch, dayBranch, timeBranch, strength);
  }

  /**
   * 根据四柱组合关系调整五行强度并记录详细信息
   * @param eightChar 八字对象
   * @param strength 五行强度对象
   * @param details 详细信息对象
   */
  private static adjustByCombinationWithDetails(
    eightChar: EightChar,
    strength: { jin: number; mu: number; shui: number; huo: number; tu: number },
    details: any
  ): void {
    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    const combinations: { type: string; stems: string[]; wuXing: string; value: number; }[] = [];

    // 检查天干合化
    this.checkStemCombinationWithDetails(yearStem, monthStem, strength, combinations);
    this.checkStemCombinationWithDetails(yearStem, dayStem, strength, combinations);
    this.checkStemCombinationWithDetails(yearStem, timeStem, strength, combinations);
    this.checkStemCombinationWithDetails(monthStem, dayStem, strength, combinations);
    this.checkStemCombinationWithDetails(monthStem, timeStem, strength, combinations);
    this.checkStemCombinationWithDetails(dayStem, timeStem, strength, combinations);

    // 检查地支组合（三合、三会、六合等）
    // 这里只实现简化版的地支三合
    this.checkBranchTripleWithDetails(yearBranch, monthBranch, dayBranch, timeBranch, strength, combinations);

    details.combinationAdjust.combinations = combinations;
  }

  /**
   * 检查天干合化
   * @param stem1 天干1
   * @param stem2 天干2
   * @param strength 五行强度对象
   */
  private static checkStemCombination(stem1: string, stem2: string, strength: { jin: number; mu: number; shui: number; huo: number; tu: number }): void {
    // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
    const combinations: {[key: string]: {result: string, value: number}} = {
      '甲己': {result: '土', value: 0.6},
      '己甲': {result: '土', value: 0.6},
      '乙庚': {result: '金', value: 0.6},
      '庚乙': {result: '金', value: 0.6},
      '丙辛': {result: '水', value: 0.6},
      '辛丙': {result: '水', value: 0.6},
      '丁壬': {result: '木', value: 0.6},
      '壬丁': {result: '木', value: 0.6},
      '戊癸': {result: '火', value: 0.6},
      '癸戊': {result: '火', value: 0.6}
    };

    const key = stem1 + stem2;
    if (combinations[key]) {
      const {result, value} = combinations[key];
      switch (result) {
        case '金': strength.jin += value; break;
        case '木': strength.mu += value; break;
        case '水': strength.shui += value; break;
        case '火': strength.huo += value; break;
        case '土': strength.tu += value; break;
      }
    }
  }

  /**
   * 检查天干合化并记录详细信息
   * @param stem1 天干1
   * @param stem2 天干2
   * @param strength 五行强度对象
   * @param combinations 组合信息数组
   */
  private static checkStemCombinationWithDetails(
    stem1: string,
    stem2: string,
    strength: { jin: number; mu: number; shui: number; huo: number; tu: number },
    combinations: { type: string; stems: string[]; wuXing: string; value: number; }[]
  ): void {
    // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
    const combinationMap: {[key: string]: {result: string, value: number}} = {
      '甲己': {result: '土', value: 0.6},
      '己甲': {result: '土', value: 0.6},
      '乙庚': {result: '金', value: 0.6},
      '庚乙': {result: '金', value: 0.6},
      '丙辛': {result: '水', value: 0.6},
      '辛丙': {result: '水', value: 0.6},
      '丁壬': {result: '木', value: 0.6},
      '壬丁': {result: '木', value: 0.6},
      '戊癸': {result: '火', value: 0.6},
      '癸戊': {result: '火', value: 0.6}
    };

    const key = stem1 + stem2;
    if (combinationMap[key]) {
      const {result, value} = combinationMap[key];
      switch (result) {
        case '金': strength.jin += value; break;
        case '木': strength.mu += value; break;
        case '水': strength.shui += value; break;
        case '火': strength.huo += value; break;
        case '土': strength.tu += value; break;
      }

      // 记录组合信息
      combinations.push({
        type: '天干五合',
        stems: [stem1, stem2],
        wuXing: result,
        value: value
      });
    }
  }

  /**
   * 检查地支三合和三会
   * @param branch1 地支1
   * @param branch2 地支2
   * @param branch3 地支3
   * @param branch4 地支4
   * @param strength 五行强度对象
   */
  private static checkBranchTriple(branch1: string, branch2: string, branch3: string, branch4: string,
                                  strength: { jin: number; mu: number; shui: number; huo: number; tu: number }): void {
    // 地支三合：
    // 寅午戌三合火局
    // 亥卯未三合木局
    // 申子辰三合水局
    // 巳酉丑三合金局

    const branches = [branch1, branch2, branch3, branch4];

    // 检查三合局
    const sanHeJu = this.checkSanHeJu(branches);
    if (sanHeJu) {
      if (sanHeJu === '火') strength.huo += 1.2; // 提高三合局权重
      else if (sanHeJu === '木') strength.mu += 1.2;
      else if (sanHeJu === '水') strength.shui += 1.2;
      else if (sanHeJu === '金') strength.jin += 1.2;
    }

    // 检查三会局
    const sanHuiJu = this.checkSanHuiJu(branches);
    if (sanHuiJu) {
      if (sanHuiJu === '木') strength.mu += 1.0; // 提高三会局权重
      else if (sanHuiJu === '火') strength.huo += 1.0;
      else if (sanHuiJu === '金') strength.jin += 1.0;
      else if (sanHuiJu === '水') strength.shui += 1.0;
    }
  }

  /**
   * 检查地支三合和三会并记录详细信息
   * @param branch1 地支1
   * @param branch2 地支2
   * @param branch3 地支3
   * @param branch4 地支4
   * @param strength 五行强度对象
   * @param combinations 组合信息数组
   */
  private static checkBranchTripleWithDetails(
    branch1: string,
    branch2: string,
    branch3: string,
    branch4: string,
    strength: { jin: number; mu: number; shui: number; huo: number; tu: number },
    combinations: { type: string; stems: string[]; wuXing: string; value: number; }[]
  ): void {
    const branches = [branch1, branch2, branch3, branch4];

    // 检查三合局
    const sanHeJu = this.checkSanHeJu(branches);
    if (sanHeJu) {
      const value = 1.2; // 提高三合局权重
      let sanHeBranches: string[] = [];

      if (sanHeJu === '火') {
        sanHeBranches = ['寅', '午', '戌'].filter(b => branches.includes(b)) as string[];
        strength.huo += value;
      } else if (sanHeJu === '木') {
        sanHeBranches = ['亥', '卯', '未'].filter(b => branches.includes(b)) as string[];
        strength.mu += value;
      } else if (sanHeJu === '水') {
        sanHeBranches = ['申', '子', '辰'].filter(b => branches.includes(b)) as string[];
        strength.shui += value;
      } else if (sanHeJu === '金') {
        sanHeBranches = ['巳', '酉', '丑'].filter(b => branches.includes(b)) as string[];
        strength.jin += value;
      }

      combinations.push({
        type: '地支三合',
        stems: sanHeBranches,
        wuXing: sanHeJu,
        value: value
      });
    }

    // 检查三会局
    const sanHuiJu = this.checkSanHuiJu(branches);
    if (sanHuiJu) {
      const value = 1.0; // 提高三会局权重
      let sanHuiBranches: string[] = [];

      if (sanHuiJu === '木') {
        sanHuiBranches = ['寅', '卯', '辰'].filter(b => branches.includes(b)) as string[];
        strength.mu += value;
      } else if (sanHuiJu === '火') {
        sanHuiBranches = ['巳', '午', '未'].filter(b => branches.includes(b)) as string[];
        strength.huo += value;
      } else if (sanHuiJu === '金') {
        sanHuiBranches = ['申', '酉', '戌'].filter(b => branches.includes(b)) as string[];
        strength.jin += value;
      } else if (sanHuiJu === '水') {
        sanHuiBranches = ['亥', '子', '丑'].filter(b => branches.includes(b)) as string[];
        strength.shui += value;
      }

      combinations.push({
        type: '地支三会',
        stems: sanHuiBranches,
        wuXing: sanHuiJu,
        value: value
      });
    }
  }

  /**
   * 检查数组是否包含所有指定元素
   * @param array 数组
   * @param elements 要检查的元素
   * @returns 是否包含所有元素
   */
  private static containsAll(array: string[], elements: string[]): boolean {
    return elements.every(element => array.includes(element));
  }

  /**
   * 从纳音字符串中提取五行属性
   * @param naYin 纳音字符串
   * @returns 五行属性
   */
  private static getNaYinWuXing(naYin: string): string {
    if (!naYin) return '';

    // 纳音五行提取规则：通常纳音字符串格式为"XX五行"，如"海中金"、"炉中火"等
    if (naYin.endsWith('金') || naYin.includes('金')) return '金';
    if (naYin.endsWith('木') || naYin.includes('木')) return '木';
    if (naYin.endsWith('水') || naYin.includes('水')) return '水';
    if (naYin.endsWith('火') || naYin.includes('火')) return '火';
    if (naYin.endsWith('土') || naYin.includes('土')) return '土';

    return '';
  }

  /**
   * 计算日主旺衰
   * @param eightChar 八字对象
   * @returns 日主旺衰信息对象，包含结果和详细计算过程
   */
  private static calculateRiZhuStrength(eightChar: EightChar): {
    result: string;
    details: {
      dayWuXing: string;
      season: string;
      baseScore: number;
      seasonEffect: string;
      ganRelation: string;
      zhiRelation: string;
      specialRelation: string;
      totalScore: number;
    }
  } {
    // 获取日干和日干五行
    const dayStem = eightChar.getDayGan();
    // 直接使用getStemWuXing获取日干五行，而不是使用eightChar.getDayWuXing()
    const dayWuXing = this.getStemWuXing(dayStem);

    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 获取月支对应的季节
    let season = '';
    if (['寅', '卯', '辰'].includes(monthBranch)) {
      season = '春';
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      season = '夏';
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      season = '秋';
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      season = '冬';
    }

    // 初始化详细信息对象
    const details = {
      dayWuXing: this.getStemWuXing(dayStem), // 确保使用天干五行
      season,
      baseScore: 10, // 日干基础分值为10
      seasonEffect: '',
      ganRelation: '',
      zhiRelation: '',
      specialRelation: '',
      totalScore: 0
    };

    let totalScore = 10; // 基础分值
    let seasonEffect = 0;
    let ganRelationEffect = 0;
    let zhiRelationEffect = 0;
    let specialRelationEffect = 0;

    // 添加调试信息
    console.log('季节:', season);
    console.log('日主五行:', dayWuXing);
    console.log('日主五行类型:', typeof dayWuXing);

    // 1. 季节影响
    if (season === '春') {
      if (dayWuXing.includes('木')) {
        seasonEffect += 4; // 旺
        details.seasonEffect = '春季木旺 (+4)';
      } else if (dayWuXing.includes('火')) {
        seasonEffect += 2; // 相
        details.seasonEffect = '春季火相 (+2)';
      } else if (dayWuXing.includes('土')) {
        seasonEffect += 0; // 平
        details.seasonEffect = '春季土平 (0)';
      } else if (dayWuXing.includes('金')) {
        seasonEffect -= 2; // 衰
        details.seasonEffect = '春季金衰 (-2)';
      } else if (dayWuXing.includes('水')) {
        seasonEffect -= 4; // 死
        details.seasonEffect = '春季水死 (-4)';
      }
    } else if (season === '夏') {
      console.log('夏季判断:', dayWuXing.includes('火'), '火'.charCodeAt(0), dayWuXing.charCodeAt(0));
      if (dayWuXing.includes('火')) {
        seasonEffect += 4; // 旺
        details.seasonEffect = '夏季火旺 (+4)';
      } else if (dayWuXing.includes('土')) {
        seasonEffect += 2; // 相
        details.seasonEffect = '夏季土相 (+2)';
      } else if (dayWuXing.includes('金')) {
        seasonEffect += 0; // 平
        details.seasonEffect = '夏季金平 (0)';
      } else if (dayWuXing.includes('水')) {
        seasonEffect -= 2; // 衰
        details.seasonEffect = '夏季水衰 (-2)';
      } else if (dayWuXing.includes('木')) {
        seasonEffect -= 4; // 死
        details.seasonEffect = '夏季木死 (-4)';
      }
    } else if (season === '秋') {
      if (dayWuXing.includes('金')) {
        seasonEffect += 4; // 旺
        details.seasonEffect = '秋季金旺 (+4)';
      } else if (dayWuXing.includes('水')) {
        seasonEffect += 2; // 相
        details.seasonEffect = '秋季水相 (+2)';
      } else if (dayWuXing.includes('木')) {
        seasonEffect += 0; // 平
        details.seasonEffect = '秋季木平 (0)';
      } else if (dayWuXing.includes('火')) {
        seasonEffect -= 2; // 衰
        details.seasonEffect = '秋季火衰 (-2)';
      } else if (dayWuXing.includes('土')) {
        seasonEffect -= 4; // 死
        details.seasonEffect = '秋季土死 (-4)';
      }
    } else if (season === '冬') {
      if (dayWuXing.includes('水')) {
        seasonEffect += 4; // 旺
        details.seasonEffect = '冬季水旺 (+4)';
      } else if (dayWuXing.includes('木')) {
        seasonEffect += 2; // 相
        details.seasonEffect = '冬季木相 (+2)';
      } else if (dayWuXing.includes('火')) {
        seasonEffect += 0; // 平
        details.seasonEffect = '冬季火平 (0)';
      } else if (dayWuXing.includes('土')) {
        seasonEffect -= 2; // 衰
        details.seasonEffect = '冬季土衰 (-2)';
      } else if (dayWuXing.includes('金')) {
        seasonEffect -= 4; // 死
        details.seasonEffect = '冬季金死 (-4)';
      }
    }

    // 2. 天干对日主的影响
    let ganRelationDetails: string[] = [];

    // 年干对日主的影响
    const yearStemWuXing = this.getStemWuXing(yearStem);
    console.log('年干五行:', yearStemWuXing, '日主五行:', dayWuXing);
    if (yearStemWuXing.includes(dayWuXing) || dayWuXing.includes(yearStemWuXing)) {
      ganRelationEffect += 3;
      ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})与日主同五行 (+3)`);
    } else if (this.isWuXingSheng(yearStemWuXing, dayWuXing)) {
      ganRelationEffect += 2;
      ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})生日主 (+2)`);
    } else if (this.isWuXingKe(yearStemWuXing, dayWuXing)) {
      ganRelationEffect -= 2;
      ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})克日主 (-2)`);
    }

    // 月干对日主的影响
    const monthStemWuXing = this.getStemWuXing(monthStem);
    console.log('月干五行:', monthStemWuXing, '日主五行:', dayWuXing);
    if (monthStemWuXing.includes(dayWuXing) || dayWuXing.includes(monthStemWuXing)) {
      ganRelationEffect += 3;
      ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})与日主同五行 (+3)`);
    } else if (this.isWuXingSheng(monthStemWuXing, dayWuXing)) {
      ganRelationEffect += 2;
      ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})生日主 (+2)`);
    } else if (this.isWuXingKe(monthStemWuXing, dayWuXing)) {
      ganRelationEffect -= 2;
      ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})克日主 (-2)`);
    }

    // 时干对日主的影响
    const timeStemWuXing = this.getStemWuXing(timeStem);
    console.log('时干五行:', timeStemWuXing, '日主五行:', dayWuXing);
    if (timeStemWuXing.includes(dayWuXing) || dayWuXing.includes(timeStemWuXing)) {
      ganRelationEffect += 3;
      ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})与日主同五行 (+3)`);
    } else if (this.isWuXingSheng(timeStemWuXing, dayWuXing)) {
      ganRelationEffect += 2;
      ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})生日主 (+2)`);
    } else if (this.isWuXingKe(timeStemWuXing, dayWuXing)) {
      ganRelationEffect -= 2;
      ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})克日主 (-2)`);
    }

    details.ganRelation = ganRelationDetails.join('，');

    // 3. 地支藏干对日主的影响
    let zhiRelationDetails: string[] = [];

    // 处理年支藏干
    const yearHideGan = this.getHideGan(yearBranch).split(',');
    console.log('年支藏干:', yearHideGan);
    if (yearHideGan.length > 0 && yearHideGan[0] !== '') {
      for (const gan of yearHideGan) {
        const ganWuXing = this.getStemWuXing(gan);
        console.log('年支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
        if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
          zhiRelationEffect += 1.5;
          zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
        } else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
          zhiRelationEffect += 1;
          zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
        } else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
          zhiRelationEffect -= 1;
          zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
        }
      }
    }

    // 处理月支藏干
    const monthHideGan = this.getHideGan(monthBranch).split(',');
    console.log('月支藏干:', monthHideGan);
    if (monthHideGan.length > 0 && monthHideGan[0] !== '') {
      for (const gan of monthHideGan) {
        const ganWuXing = this.getStemWuXing(gan);
        console.log('月支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
        if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
          zhiRelationEffect += 1.5;
          zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
        } else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
          zhiRelationEffect += 1;
          zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
        } else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
          zhiRelationEffect -= 1;
          zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
        }
      }
    }

    // 处理日支藏干
    const dayHideGan = this.getHideGan(dayBranch).split(',');
    console.log('日支藏干:', dayHideGan);
    if (dayHideGan.length > 0 && dayHideGan[0] !== '') {
      for (const gan of dayHideGan) {
        const ganWuXing = this.getStemWuXing(gan);
        console.log('日支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
        if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
          zhiRelationEffect += 1.5;
          zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
        } else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
          zhiRelationEffect += 1;
          zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
        } else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
          zhiRelationEffect -= 1;
          zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
        }
      }
    }

    // 处理时支藏干
    const timeHideGan = this.getHideGan(timeBranch).split(',');
    console.log('时支藏干:', timeHideGan);
    if (timeHideGan.length > 0 && timeHideGan[0] !== '') {
      for (const gan of timeHideGan) {
        const ganWuXing = this.getStemWuXing(gan);
        console.log('时支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
        if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
          zhiRelationEffect += 1.5;
          zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
        } else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
          zhiRelationEffect += 1;
          zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
        } else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
          zhiRelationEffect -= 1;
          zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
        }
      }
    }

    details.zhiRelation = zhiRelationDetails.join('，');

    // 4. 特殊组合关系
    let specialRelationDetails: string[] = [];

    // 三合局检查
    const allBranches = [yearBranch, monthBranch, dayBranch, timeBranch];
    const sanHeJu = this.checkSanHeJu(allBranches);
    console.log('三合局:', sanHeJu);

    if (sanHeJu) {
      const sanHeWuXing = this.getSanHeWuXing(sanHeJu);
      console.log('三合局五行:', sanHeWuXing, '日主五行:', dayWuXing);

      // 获取三合局中的地支
      let sanHeBranches: string[] = [];
      if (sanHeJu === '火') {
        sanHeBranches = ['寅', '午', '戌'].filter(b => allBranches.includes(b));
      } else if (sanHeJu === '水') {
        sanHeBranches = ['申', '子', '辰'].filter(b => allBranches.includes(b));
      } else if (sanHeJu === '木') {
        sanHeBranches = ['亥', '卯', '未'].filter(b => allBranches.includes(b));
      } else if (sanHeJu === '金') {
        sanHeBranches = ['巳', '酉', '丑'].filter(b => allBranches.includes(b));
      }

      if (sanHeWuXing.includes(dayWuXing) || dayWuXing.includes(sanHeWuXing)) {
        specialRelationEffect += 3;
        specialRelationDetails.push(`日主参与${sanHeBranches.join('')}三合${sanHeJu}局，五行相同 (+3)`);
      } else if (this.isWuXingSheng(sanHeWuXing, dayWuXing)) {
        specialRelationEffect += 2;
        specialRelationDetails.push(`${sanHeBranches.join('')}三合${sanHeJu}局五行生日主 (+2)`);
      } else if (this.isWuXingKe(sanHeWuXing, dayWuXing)) {
        specialRelationEffect -= 2;
        specialRelationDetails.push(`${sanHeBranches.join('')}三合${sanHeJu}局五行克日主 (-2)`);
      }
    }

    // 三会局检查
    const sanHuiJu = this.checkSanHuiJu(allBranches);
    console.log('三会局:', sanHuiJu);

    if (sanHuiJu) {
      const sanHuiWuXing = this.getSanHuiWuXing(sanHuiJu);
      console.log('三会局五行:', sanHuiWuXing, '日主五行:', dayWuXing);

      // 获取三会局中的地支
      let sanHuiBranches: string[] = [];
      if (sanHuiJu === '木') {
        sanHuiBranches = ['寅', '卯', '辰'].filter(b => allBranches.includes(b));
      } else if (sanHuiJu === '火') {
        sanHuiBranches = ['巳', '午', '未'].filter(b => allBranches.includes(b));
      } else if (sanHuiJu === '金') {
        sanHuiBranches = ['申', '酉', '戌'].filter(b => allBranches.includes(b));
      } else if (sanHuiJu === '水') {
        sanHuiBranches = ['亥', '子', '丑'].filter(b => allBranches.includes(b));
      }

      if (sanHuiWuXing.includes(dayWuXing) || dayWuXing.includes(sanHuiWuXing)) {
        specialRelationEffect += 2.5;
        specialRelationDetails.push(`日主参与${sanHuiBranches.join('')}三会${sanHuiJu}局，五行相同 (+2.5)`);
      } else if (this.isWuXingSheng(sanHuiWuXing, dayWuXing)) {
        specialRelationEffect += 1.5;
        specialRelationDetails.push(`${sanHuiBranches.join('')}三会${sanHuiJu}局五行生日主 (+1.5)`);
      } else if (this.isWuXingKe(sanHuiWuXing, dayWuXing)) {
        specialRelationEffect -= 1.5;
        specialRelationDetails.push(`${sanHuiBranches.join('')}三会${sanHuiJu}局五行克日主 (-1.5)`);
      }
    }

    // 六合检查
    const liuHe = this.checkLiuHe(allBranches);
    console.log('六合:', liuHe);

    if (liuHe) {
      const liuHeWuXing = this.getLiuHeWuXing(liuHe);
      console.log('六合五行:', liuHeWuXing, '日主五行:', dayWuXing);
      if (liuHeWuXing.includes(dayWuXing) || dayWuXing.includes(liuHeWuXing)) {
        specialRelationEffect += 2;
        specialRelationDetails.push(`日主参与${liuHe}合，五行相同 (+2)`);
      } else if (this.isWuXingSheng(liuHeWuXing, dayWuXing)) {
        specialRelationEffect += 1;
        specialRelationDetails.push(`${liuHe}合五行生日主 (+1)`);
      } else if (this.isWuXingKe(liuHeWuXing, dayWuXing)) {
        specialRelationEffect -= 1;
        specialRelationDetails.push(`${liuHe}合五行克日主 (-1)`);
      }
    }

    // 纳音五行影响
    const dayNaYin = eightChar.getDayNaYin();
    const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
    console.log('日柱纳音:', dayNaYin, '纳音五行:', dayNaYinWuXing, '日主五行:', dayWuXing);

    if (dayNaYinWuXing.includes(dayWuXing) || dayWuXing.includes(dayNaYinWuXing)) {
      specialRelationEffect += 2;
      specialRelationDetails.push(`日柱纳音(${dayNaYin})与日主五行相同 (+2)`);
    } else if (this.isWuXingSheng(dayNaYinWuXing, dayWuXing)) {
      specialRelationEffect += 1;
      specialRelationDetails.push(`日柱纳音(${dayNaYin})生日主五行 (+1)`);
    } else if (this.isWuXingKe(dayNaYinWuXing, dayWuXing)) {
      specialRelationEffect -= 1;
      specialRelationDetails.push(`日柱纳音(${dayNaYin})克日主五行 (-1)`);
    }

    details.specialRelation = specialRelationDetails.join('，');

    // 计算总分
    totalScore = details.baseScore + seasonEffect + ganRelationEffect + zhiRelationEffect + specialRelationEffect;
    details.totalScore = totalScore;

    // 根据总分判断日主旺衰
    let result = '';
    if (totalScore >= 15) {
      result = '极旺';
    } else if (totalScore >= 10) {
      result = '旺';
    } else if (totalScore >= 5) {
      result = '偏旺';
    } else if (totalScore >= 0) {
      result = '平衡';
    } else if (totalScore >= -4) {
      result = '偏弱';
    } else if (totalScore >= -9) {
      result = '弱';
    } else {
      result = '极弱';
    }

    return {
      result,
      details
    };
  }

  /**
   * 检查是否有三合局
   * @param branches 地支数组
   * @returns 三合局类型或null
   */
  private static checkSanHeJu(branches: string[]): string | null {
    // 三合局：寅午戌合火局，申子辰合水局，亥卯未合木局，巳酉丑合金局
    const sanHePatterns = [
      {pattern: ['寅', '午', '戌'], type: '火'},
      {pattern: ['申', '子', '辰'], type: '水'},
      {pattern: ['亥', '卯', '未'], type: '木'},
      {pattern: ['巳', '酉', '丑'], type: '金'}
    ];

    for (const {pattern, type} of sanHePatterns) {
      // 收集实际出现的地支
      const matchedBranches = branches.filter(branch => pattern.includes(branch));

      // 检查是否至少有两个不同的地支
      const uniqueBranches = new Set(matchedBranches);

      if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三合
        return type;
      }
    }

    return null;
  }

  /**
   * 获取三合局的五行属性
   * @param sanHeType 三合局类型
   * @returns 五行属性
   */
  private static getSanHeWuXing(sanHeType: string): string {
    switch (sanHeType) {
      case '火': return '火';
      case '水': return '水';
      case '木': return '木';
      case '金': return '金';
      default: return '';
    }
  }

  /**
   * 检查是否有三会局
   * @param branches 地支数组
   * @returns 三会局类型或null
   */
  private static checkSanHuiJu(branches: string[]): string | null {
    // 三会局：寅卯辰三会木局，巳午未三会火局，申酉戌三会金局，亥子丑三会水局
    const sanHuiPatterns = [
      {pattern: ['寅', '卯', '辰'], type: '木'},
      {pattern: ['巳', '午', '未'], type: '火'},
      {pattern: ['申', '酉', '戌'], type: '金'},
      {pattern: ['亥', '子', '丑'], type: '水'}
    ];

    for (const {pattern, type} of sanHuiPatterns) {
      // 收集实际出现的地支
      const matchedBranches = branches.filter(branch => pattern.includes(branch));

      // 检查是否至少有两个不同的地支
      const uniqueBranches = new Set(matchedBranches);

      if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三会
        return type;
      }
    }

    return null;
  }

  /**
   * 获取三会局的五行属性
   * @param sanHuiType 三会局类型
   * @returns 五行属性
   */
  private static getSanHuiWuXing(sanHuiType: string): string {
    switch (sanHuiType) {
      case '木': return '木';
      case '火': return '火';
      case '金': return '金';
      case '水': return '水';
      default: return '';
    }
  }

  /**
   * 检查是否有天干五合
   * @param stems 天干数组
   * @returns 五合类型或null
   */
  private static checkWuHeJu(stems: string[]): string | null {
    // 天干五合：甲己合土，乙庚合金，丙辛合水，丁壬合木，戊癸合火
    const wuHePatterns = [
      {pattern: ['甲', '己'], type: '土'},
      {pattern: ['乙', '庚'], type: '金'},
      {pattern: ['丙', '辛'], type: '水'},
      {pattern: ['丁', '壬'], type: '木'},
      {pattern: ['戊', '癸'], type: '火'}
    ];

    for (const {pattern, type} of wuHePatterns) {
      let hasFirst = false;
      let hasSecond = false;

      for (const stem of stems) {
        if (stem === pattern[0]) hasFirst = true;
        if (stem === pattern[1]) hasSecond = true;
      }

      if (hasFirst && hasSecond) {
        return type;
      }
    }

    return null;
  }

  /**
   * 获取五合的五行属性
   * @param wuHeType 五合类型
   * @returns 五行属性
   */
  private static getWuHeWuXing(wuHeType: string): string {
    switch (wuHeType) {
      case '土': return '土';
      case '金': return '金';
      case '水': return '水';
      case '木': return '木';
      case '火': return '火';
      default: return '';
    }
  }

  /**
   * 检查是否有六合
   * @param branches 地支数组
   * @returns 六合类型或null
   */
  private static checkLiuHe(branches: string[]): string | null {
    // 六合：子丑合土，寅亥合木，卯戌合火，辰酉合金，巳申合水，午未合土
    const liuHePatterns = [
      {pattern: ['子', '丑'], type: '土'},
      {pattern: ['寅', '亥'], type: '木'},
      {pattern: ['卯', '戌'], type: '火'},
      {pattern: ['辰', '酉'], type: '金'},
      {pattern: ['巳', '申'], type: '水'},
      {pattern: ['午', '未'], type: '土'}
    ];

    for (const {pattern, type} of liuHePatterns) {
      let hasFirst = false;
      let hasSecond = false;

      for (const branch of branches) {
        if (branch === pattern[0]) hasFirst = true;
        if (branch === pattern[1]) hasSecond = true;
      }

      if (hasFirst && hasSecond) {
        return type;
      }
    }

    return null;
  }

  /**
   * 获取六合的五行属性
   * @param liuHeType 六合类型
   * @returns 五行属性
   */
  private static getLiuHeWuXing(liuHeType: string): string {
    switch (liuHeType) {
      case '土': return '土';
      case '金': return '金';
      case '水': return '水';
      case '木': return '木';
      case '火': return '火';
      default: return '';
    }
  }



  /**
   * 计算神煞
   * @param eightChar 八字对象
   * @returns 包含总神煞和各柱神煞的对象
   */
  private static calculateShenSha(eightChar: EightChar): {
    shenSha: string[];
    yearShenSha: string[];
    monthShenSha: string[];
    dayShenSha: string[];
    hourShenSha: string[];
  } {
    const shenSha: string[] = [];
    const yearShenSha: string[] = [];
    const monthShenSha: string[] = [];
    const dayShenSha: string[] = [];
    const hourShenSha: string[] = [];

    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 获取季节信息（用于童子煞和将军箭的判断）
    let season = '';
    if (['寅', '卯', '辰'].includes(monthBranch)) {
      season = '春';
    } else if (['巳', '午', '未'].includes(monthBranch)) {
      season = '夏';
    } else if (['申', '酉', '戌'].includes(monthBranch)) {
      season = '秋';
    } else if (['亥', '子', '丑'].includes(monthBranch)) {
      season = '冬';
    }

    // 天乙贵人
    if (this.isTianYiGuiRen(dayStem, yearBranch)) {
      yearShenSha.push('天乙贵人');
    }
    if (this.isTianYiGuiRen(dayStem, monthBranch)) {
      monthShenSha.push('天乙贵人');
    }
    if (this.isTianYiGuiRen(dayStem, dayBranch)) {
      dayShenSha.push('天乙贵人');
    }
    if (this.isTianYiGuiRen(dayStem, timeBranch)) {
      hourShenSha.push('天乙贵人');
    }

    // 文昌
    if (this.isWenChang(yearBranch)) {
      yearShenSha.push('文昌');
    }
    if (this.isWenChang(monthBranch)) {
      monthShenSha.push('文昌');
    }
    if (this.isWenChang(dayBranch)) {
      dayShenSha.push('文昌');
    }
    if (this.isWenChang(timeBranch)) {
      hourShenSha.push('文昌');
    }

    // 华盖
    if (this.isHuaGai(yearBranch)) {
      yearShenSha.push('华盖');
    }
    if (this.isHuaGai(monthBranch)) {
      monthShenSha.push('华盖');
    }
    if (this.isHuaGai(dayBranch)) {
      dayShenSha.push('华盖');
    }
    if (this.isHuaGai(timeBranch)) {
      hourShenSha.push('华盖');
    }

    // 禄神
    if (this.isLuShen(yearStem, yearBranch)) {
      yearShenSha.push('禄神');
    }
    if (this.isLuShen(monthStem, monthBranch)) {
      monthShenSha.push('禄神');
    }
    if (this.isLuShen(dayStem, dayBranch)) {
      dayShenSha.push('禄神');
    }
    if (this.isLuShen(timeStem, timeBranch)) {
      hourShenSha.push('禄神');
    }

    // 桃花
    if (this.isTaoHua(yearBranch)) {
      yearShenSha.push('桃花');
    }
    if (this.isTaoHua(monthBranch)) {
      monthShenSha.push('桃花');
    }
    if (this.isTaoHua(dayBranch)) {
      dayShenSha.push('桃花');
    }
    if (this.isTaoHua(timeBranch)) {
      hourShenSha.push('桃花');
    }

    // 孤辰
    if (this.isGuChen(yearBranch)) {
      yearShenSha.push('孤辰');
    }
    if (this.isGuChen(monthBranch)) {
      monthShenSha.push('孤辰');
    }
    if (this.isGuChen(dayBranch)) {
      dayShenSha.push('孤辰');
    }
    if (this.isGuChen(timeBranch)) {
      hourShenSha.push('孤辰');
    }

    // 寡宿
    if (this.isGuaSu(yearBranch)) {
      yearShenSha.push('寡宿');
    }
    if (this.isGuaSu(monthBranch)) {
      monthShenSha.push('寡宿');
    }
    if (this.isGuaSu(dayBranch)) {
      dayShenSha.push('寡宿');
    }
    if (this.isGuaSu(timeBranch)) {
      hourShenSha.push('寡宿');
    }

    // 驿马
    if (this.isYiMa(yearBranch, yearBranch)) {
      yearShenSha.push('驿马');
    }
    if (this.isYiMa(monthBranch, yearBranch)) {
      monthShenSha.push('驿马');
    }
    if (this.isYiMa(dayBranch, yearBranch)) {
      dayShenSha.push('驿马');
    }
    if (this.isYiMa(timeBranch, yearBranch)) {
      hourShenSha.push('驿马');
    }

    // 将星
    if (this.isJiangXing(dayStem, yearBranch)) {
      yearShenSha.push('将星');
    }
    if (this.isJiangXing(dayStem, monthBranch)) {
      monthShenSha.push('将星');
    }
    if (this.isJiangXing(dayStem, dayBranch)) {
      dayShenSha.push('将星');
    }
    if (this.isJiangXing(dayStem, timeBranch)) {
      hourShenSha.push('将星');
    }

    // 金神
    if (this.isJinShen(yearBranch)) {
      yearShenSha.push('金神');
    }
    if (this.isJinShen(monthBranch)) {
      monthShenSha.push('金神');
    }
    if (this.isJinShen(dayBranch)) {
      dayShenSha.push('金神');
    }
    if (this.isJinShen(timeBranch)) {
      hourShenSha.push('金神');
    }

    // 天德
    if (this.isTianDe(yearStem, yearBranch)) {
      yearShenSha.push('天德');
    }
    if (this.isTianDe(monthStem, monthBranch)) {
      monthShenSha.push('天德');
    }
    if (this.isTianDe(dayStem, dayBranch)) {
      dayShenSha.push('天德');
    }
    if (this.isTianDe(timeStem, timeBranch)) {
      hourShenSha.push('天德');
    }

    // 天德合
    if (this.isTianDeHe(yearStem, yearBranch)) {
      yearShenSha.push('天德合');
    }
    if (this.isTianDeHe(monthStem, monthBranch)) {
      monthShenSha.push('天德合');
    }
    if (this.isTianDeHe(dayStem, dayBranch)) {
      dayShenSha.push('天德合');
    }
    if (this.isTianDeHe(timeStem, timeBranch)) {
      hourShenSha.push('天德合');
    }

    // 月德
    if (this.isYueDe(yearStem)) {
      yearShenSha.push('月德');
    }
    if (this.isYueDe(monthStem)) {
      monthShenSha.push('月德');
    }
    if (this.isYueDe(dayStem)) {
      dayShenSha.push('月德');
    }
    if (this.isYueDe(timeStem)) {
      hourShenSha.push('月德');
    }

    // 天医
    if (this.isTianYi(yearBranch)) {
      yearShenSha.push('天医');
    }
    if (this.isTianYi(monthBranch)) {
      monthShenSha.push('天医');
    }
    if (this.isTianYi(dayBranch)) {
      dayShenSha.push('天医');
    }
    if (this.isTianYi(timeBranch)) {
      hourShenSha.push('天医');
    }

    // 天喜
    if (this.isTianXi(yearBranch, yearBranch)) {
      yearShenSha.push('天喜');
    }
    if (this.isTianXi(monthBranch, yearBranch)) {
      monthShenSha.push('天喜');
    }
    if (this.isTianXi(dayBranch, yearBranch)) {
      dayShenSha.push('天喜');
    }
    if (this.isTianXi(timeBranch, yearBranch)) {
      hourShenSha.push('天喜');
    }

    // 红艳
    if (this.isHongYan(yearBranch)) {
      yearShenSha.push('红艳');
    }
    if (this.isHongYan(monthBranch)) {
      monthShenSha.push('红艳');
    }
    if (this.isHongYan(dayBranch)) {
      dayShenSha.push('红艳');
    }
    if (this.isHongYan(timeBranch)) {
      hourShenSha.push('红艳');
    }

    // 天罗
    if (this.isTianLuo(yearBranch)) {
      yearShenSha.push('天罗');
    }
    if (this.isTianLuo(monthBranch)) {
      monthShenSha.push('天罗');
    }
    if (this.isTianLuo(dayBranch)) {
      dayShenSha.push('天罗');
    }
    if (this.isTianLuo(timeBranch)) {
      hourShenSha.push('天罗');
    }

    // 地网
    if (this.isDiWang(yearBranch)) {
      yearShenSha.push('地网');
    }
    if (this.isDiWang(monthBranch)) {
      monthShenSha.push('地网');
    }
    if (this.isDiWang(dayBranch)) {
      dayShenSha.push('地网');
    }
    if (this.isDiWang(timeBranch)) {
      hourShenSha.push('地网');
    }

    // 羊刃
    if (this.isYangRen(dayStem, yearBranch)) {
      yearShenSha.push('羊刃');
    }
    if (this.isYangRen(dayStem, monthBranch)) {
      monthShenSha.push('羊刃');
    }
    if (this.isYangRen(dayStem, dayBranch)) {
      dayShenSha.push('羊刃');
    }
    if (this.isYangRen(dayStem, timeBranch)) {
      hourShenSha.push('羊刃');
    }

    // 天空
    if (this.isTianKong(yearBranch)) {
      yearShenSha.push('天空');
    }
    if (this.isTianKong(monthBranch)) {
      monthShenSha.push('天空');
    }
    if (this.isTianKong(dayBranch)) {
      dayShenSha.push('天空');
    }
    if (this.isTianKong(timeBranch)) {
      hourShenSha.push('天空');
    }

    // 地劫
    if (this.isDiJie(yearBranch)) {
      yearShenSha.push('地劫');
    }
    if (this.isDiJie(monthBranch)) {
      monthShenSha.push('地劫');
    }
    if (this.isDiJie(dayBranch)) {
      dayShenSha.push('地劫');
    }
    if (this.isDiJie(timeBranch)) {
      hourShenSha.push('地劫');
    }

    // 天刑
    if (this.isTianXing(yearBranch)) {
      yearShenSha.push('天刑');
    }
    if (this.isTianXing(monthBranch)) {
      monthShenSha.push('天刑');
    }
    if (this.isTianXing(dayBranch)) {
      dayShenSha.push('天刑');
    }
    if (this.isTianXing(timeBranch)) {
      hourShenSha.push('天刑');
    }

    // 天哭
    if (this.isTianKu(yearBranch)) {
      yearShenSha.push('天哭');
    }
    if (this.isTianKu(monthBranch)) {
      monthShenSha.push('天哭');
    }
    if (this.isTianKu(dayBranch)) {
      dayShenSha.push('天哭');
    }
    if (this.isTianKu(timeBranch)) {
      hourShenSha.push('天哭');
    }

    // 天虚
    if (this.isTianXu(yearBranch)) {
      yearShenSha.push('天虚');
    }
    if (this.isTianXu(monthBranch)) {
      monthShenSha.push('天虚');
    }
    if (this.isTianXu(dayBranch)) {
      dayShenSha.push('天虚');
    }
    if (this.isTianXu(timeBranch)) {
      hourShenSha.push('天虚');
    }

    // 咸池
    if (this.isXianChi(yearBranch)) {
      yearShenSha.push('咸池');
    }
    if (this.isXianChi(monthBranch)) {
      monthShenSha.push('咸池');
    }
    if (this.isXianChi(dayBranch)) {
      dayShenSha.push('咸池');
    }
    if (this.isXianChi(timeBranch)) {
      hourShenSha.push('咸池');
    }

    // 亡神
    if (this.isWangShen(yearBranch)) {
      yearShenSha.push('亡神');
    }
    if (this.isWangShen(monthBranch)) {
      monthShenSha.push('亡神');
    }
    if (this.isWangShen(dayBranch)) {
      dayShenSha.push('亡神');
    }
    if (this.isWangShen(timeBranch)) {
      hourShenSha.push('亡神');
    }

    // 劫煞
    if (this.isJieSha(yearBranch)) {
      yearShenSha.push('劫煞');
    }
    if (this.isJieSha(monthBranch)) {
      monthShenSha.push('劫煞');
    }
    if (this.isJieSha(dayBranch)) {
      dayShenSha.push('劫煞');
    }
    if (this.isJieSha(timeBranch)) {
      hourShenSha.push('劫煞');
    }

    // 灾煞
    if (this.isZaiSha(yearBranch)) {
      yearShenSha.push('灾煞');
    }
    if (this.isZaiSha(monthBranch)) {
      monthShenSha.push('灾煞');
    }
    if (this.isZaiSha(dayBranch)) {
      dayShenSha.push('灾煞');
    }
    if (this.isZaiSha(timeBranch)) {
      hourShenSha.push('灾煞');
    }

    // 岁破
    if (this.isSuiPo(yearBranch, yearBranch)) {
      yearShenSha.push('岁破');
    }
    if (this.isSuiPo(monthBranch, yearBranch)) {
      monthShenSha.push('岁破');
    }
    if (this.isSuiPo(dayBranch, yearBranch)) {
      dayShenSha.push('岁破');
    }
    if (this.isSuiPo(timeBranch, yearBranch)) {
      hourShenSha.push('岁破');
    }

    // 大耗
    if (this.isDaHao(yearBranch, yearBranch)) {
      yearShenSha.push('大耗');
    }
    if (this.isDaHao(monthBranch, yearBranch)) {
      monthShenSha.push('大耗');
    }
    if (this.isDaHao(dayBranch, yearBranch)) {
      dayShenSha.push('大耗');
    }
    if (this.isDaHao(timeBranch, yearBranch)) {
      hourShenSha.push('大耗');
    }

    // 五鬼
    if (this.isWuGui(yearBranch)) {
      yearShenSha.push('五鬼');
    }
    if (this.isWuGui(monthBranch)) {
      monthShenSha.push('五鬼');
    }
    if (this.isWuGui(dayBranch)) {
      dayShenSha.push('五鬼');
    }
    if (this.isWuGui(timeBranch)) {
      hourShenSha.push('五鬼');
    }

    // 天德贵人
    if (this.isTianDeGuiRen(yearStem, yearBranch)) {
      yearShenSha.push('天德贵人');
    }
    if (this.isTianDeGuiRen(monthStem, monthBranch)) {
      monthShenSha.push('天德贵人');
    }
    if (this.isTianDeGuiRen(dayStem, dayBranch)) {
      dayShenSha.push('天德贵人');
    }
    if (this.isTianDeGuiRen(timeStem, timeBranch)) {
      hourShenSha.push('天德贵人');
    }

    // 月德贵人
    if (this.isYueDeGuiRen(yearStem, yearBranch)) {
      yearShenSha.push('月德贵人');
    }
    if (this.isYueDeGuiRen(monthStem, monthBranch)) {
      monthShenSha.push('月德贵人');
    }
    if (this.isYueDeGuiRen(dayStem, dayBranch)) {
      dayShenSha.push('月德贵人');
    }
    if (this.isYueDeGuiRen(timeStem, timeBranch)) {
      hourShenSha.push('月德贵人');
    }

    // 天赦
    if (this.isTianShe(yearStem, yearBranch)) {
      yearShenSha.push('天赦');
    }
    if (this.isTianShe(monthStem, monthBranch)) {
      monthShenSha.push('天赦');
    }
    if (this.isTianShe(dayStem, dayBranch)) {
      dayShenSha.push('天赦');
    }
    if (this.isTianShe(timeStem, timeBranch)) {
      hourShenSha.push('天赦');
    }

    // 天恩
    if (this.isTianEn(yearStem, yearBranch)) {
      yearShenSha.push('天恩');
    }
    if (this.isTianEn(monthStem, monthBranch)) {
      monthShenSha.push('天恩');
    }
    if (this.isTianEn(dayStem, dayBranch)) {
      dayShenSha.push('天恩');
    }
    if (this.isTianEn(timeStem, timeBranch)) {
      hourShenSha.push('天恩');
    }

    // 天官
    if (this.isTianGuan(yearStem, yearBranch)) {
      yearShenSha.push('天官');
    }
    if (this.isTianGuan(monthStem, monthBranch)) {
      monthShenSha.push('天官');
    }
    if (this.isTianGuan(dayStem, dayBranch)) {
      dayShenSha.push('天官');
    }
    if (this.isTianGuan(timeStem, timeBranch)) {
      hourShenSha.push('天官');
    }

    // 天福
    if (this.isTianFu(yearStem, yearBranch)) {
      yearShenSha.push('天福');
    }
    if (this.isTianFu(monthStem, monthBranch)) {
      monthShenSha.push('天福');
    }
    if (this.isTianFu(dayStem, dayBranch)) {
      dayShenSha.push('天福');
    }
    if (this.isTianFu(timeStem, timeBranch)) {
      hourShenSha.push('天福');
    }

    // 天厨
    if (this.isTianChu(yearStem, yearBranch)) {
      yearShenSha.push('天厨');
    }
    if (this.isTianChu(monthStem, monthBranch)) {
      monthShenSha.push('天厨');
    }
    if (this.isTianChu(dayStem, dayBranch)) {
      dayShenSha.push('天厨');
    }
    if (this.isTianChu(timeStem, timeBranch)) {
      hourShenSha.push('天厨');
    }

    // 天巫
    if (this.isTianWu(yearBranch)) {
      yearShenSha.push('天巫');
    }
    if (this.isTianWu(monthBranch)) {
      monthShenSha.push('天巫');
    }
    if (this.isTianWu(dayBranch)) {
      dayShenSha.push('天巫');
    }
    if (this.isTianWu(timeBranch)) {
      hourShenSha.push('天巫');
    }

    // 天月
    if (this.isTianYue(yearBranch)) {
      yearShenSha.push('天月');
    }
    if (this.isTianYue(monthBranch)) {
      monthShenSha.push('天月');
    }
    if (this.isTianYue(dayBranch)) {
      dayShenSha.push('天月');
    }
    if (this.isTianYue(timeBranch)) {
      hourShenSha.push('天月');
    }

    // 天马
    if (this.isTianMa(yearBranch, yearBranch)) {
      yearShenSha.push('天马');
    }
    if (this.isTianMa(monthBranch, yearBranch)) {
      monthShenSha.push('天马');
    }
    if (this.isTianMa(dayBranch, yearBranch)) {
      dayShenSha.push('天马');
    }
    if (this.isTianMa(timeBranch, yearBranch)) {
      hourShenSha.push('天马');
    }

    // 童子煞（根据季节、纳音五行和地支判断）
    if (season && this.isTongZiSha(eightChar, season)) {
      shenSha.push('童子煞');
    }

    // 将军箭（根据季节、时支、冲克关系和纳音五行判断）
    if (season && this.isJiangJunJian(eightChar, season)) {
      hourShenSha.push('将军箭');
    }

    // 将各柱神煞添加到总神煞数组中
    shenSha.push(...yearShenSha.map(s => `年柱:${s}`));
    shenSha.push(...monthShenSha.map(s => `月柱:${s}`));
    shenSha.push(...dayShenSha.map(s => `日柱:${s}`));
    shenSha.push(...hourShenSha.map(s => `时柱:${s}`));

    return {
      shenSha,
      yearShenSha,
      monthShenSha,
      dayShenSha,
      hourShenSha
    };
  }

  /**
   * 判断是否为天乙贵人
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为天乙贵人
   */
  private static isTianYiGuiRen(dayStem: string, branch: string): boolean {
    // 天乙贵人的计算规则：
    // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，
    // 六辛逢虎兔，此是贵人方。
    const map: {[key: string]: string[]} = {
      '甲': ['丑', '未'],
      '乙': ['子', '申'],
      '丙': ['亥', '酉'],
      '丁': ['亥', '酉'],
      '戊': ['丑', '未'],
      '己': ['子', '申'],
      '庚': ['丑', '未'],
      '辛': ['寅', '卯'], // 修正：辛日贵人在寅卯
      '壬': ['巳', '卯'], // 修正：壬日贵人在巳卯
      '癸': ['巳', '卯']  // 修正：癸日贵人在巳卯
    };

    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断是否为文昌
   * @param branch 地支
   * @returns 是否为文昌
   */
  private static isWenChang(branch: string): boolean {
    // 文昌星的计算规则：
    // 寅午戌见巳，申子辰见申，
    // 亥卯未见午，巳酉丑见寅。
    // 这里简化处理，直接判断地支是否为文昌星
    return ['巳', '申', '午', '寅'].includes(branch);
  }

  /**
   * 判断是否为华盖
   * @param branch 地支
   * @returns 是否为华盖
   */
  private static isHuaGai(branch: string): boolean {
    // 华盖星的计算规则：
    // 寅午戌见戌，申子辰见辰，
    // 亥卯未见未，巳酉丑见丑。
    // 这里简化处理，直接判断地支是否为华盖星
    return ['辰', '戌', '丑', '未'].includes(branch);
  }

  /**
   * 判断是否为禄神
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为禄神
   */
  private static isLuShen(stem: string, branch: string): boolean {
    const map: {[key: string]: string} = {
      '甲': '寅',
      '乙': '卯',
      '丙': '巳',
      '丁': '午',
      '戊': '巳',
      '己': '午',
      '庚': '申',
      '辛': '酉',
      '壬': '亥',
      '癸': '子'
    };

    return map[stem] === branch;
  }

  /**
   * 判断是否为桃花
   * @param branch 地支
   * @returns 是否为桃花
   */
  private static isTaoHua(branch: string): boolean {
    return ['卯', '酉', '子', '午'].includes(branch);
  }

  /**
   * 判断是否为孤辰
   * @param branch 地支
   * @returns 是否为孤辰
   */
  private static isGuChen(branch: string): boolean {
    return ['辰', '戌', '丑', '未'].includes(branch);
  }

  /**
   * 判断是否为寡宿
   * @param branch 地支
   * @returns 是否为寡宿
   */
  private static isGuaSu(branch: string): boolean {
    return ['寅', '申', '巳', '亥'].includes(branch);
  }

  /**
   * 判断是否为驿马
   * @param branch 地支
   * @param yearBranch 年支（可选）
   * @returns 是否为驿马
   */
  private static isYiMa(branch: string, yearBranch?: string): boolean {
    // 驿马的计算规则：
    // 寅午戌年马在申，申子辰年马在寅，巳酉丑年马在亥，亥卯未年马在巳

    // 如果提供了年支，则根据年支判断
    if (yearBranch) {
      const yiMaMap: {[key: string]: string} = {
        '寅': '申',
        '午': '申',
        '戌': '申',
        '申': '寅',
        '子': '寅',
        '辰': '寅',
        '巳': '亥',
        '酉': '亥',
        '丑': '亥',
        '亥': '巳',
        '卯': '巳',
        '未': '巳'
      };

      return yiMaMap[yearBranch] === branch;
    }

    // 如果没有提供年支，则简化处理，直接判断地支是否为驿马星
    return ['申', '寅', '巳', '亥'].includes(branch);
  }

  /**
   * 判断是否为将星
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为将星
   */
  private static isJiangXing(dayStem: string, branch: string): boolean {
    // 将星与日干的对应关系
    const jiangXingMap: {[key: string]: string[]} = {
      '甲': ['巳'],
      '乙': ['午'],
      '丙': ['申'],
      '丁': ['酉'],
      '戊': ['申'],
      '己': ['酉'],
      '庚': ['亥'],
      '辛': ['子'],
      '壬': ['寅'],
      '癸': ['卯']
    };

    return jiangXingMap[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断是否为金神
   * @param branch 地支
   * @returns 是否为金神
   */
  private static isJinShen(branch: string): boolean {
    return ['申', '酉', '戌'].includes(branch);
  }

  /**
   * 判断是否为天德
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德
   */
  private static isTianDe(stem: string, branch: string): boolean {
    // 天德与天干的对应关系
    const tianDeMap: {[key: string]: string} = {
      '甲': '丁',
      '乙': '申',
      '丙': '壬',
      '丁': '辛',
      '戊': '丙',
      '己': '乙',
      '庚': '戊',
      '辛': '己',
      '壬': '庚',
      '癸': '癸'
    };

    // 天德与地支的对应关系
    const tianDeBranchMap: {[key: string]: string} = {
      '丁': '午',
      '申': '申',
      '壬': '亥',
      '辛': '酉',
      '丙': '巳',
      '乙': '卯',
      '戊': '辰',
      '己': '丑',
      '庚': '申',
      '癸': '子'
    };

    const tianDeStem = tianDeMap[stem];
    const tianDeBranch = tianDeBranchMap[tianDeStem];

    return branch === tianDeBranch;
  }

  /**
   * 判断是否为天德合
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德合
   */
  private static isTianDeHe(stem: string, branch: string): boolean {
    // 天德合与天干的对应关系
    const tianDeHeMap: {[key: string]: string} = {
      '甲': '己',
      '乙': '庚',
      '丙': '辛',
      '丁': '壬',
      '戊': '癸',
      '己': '甲',
      '庚': '乙',
      '辛': '丙',
      '壬': '丁',
      '癸': '戊'
    };

    // 天德合与地支的对应关系
    const tianDeHeBranchMap: {[key: string]: string} = {
      '己': '丑',
      '庚': '寅',
      '辛': '卯',
      '壬': '辰',
      '癸': '巳',
      '甲': '午',
      '乙': '未',
      '丙': '申',
      '丁': '酉',
      '戊': '戌'
    };

    const tianDeHeStem = tianDeHeMap[stem];
    const tianDeHeBranch = tianDeHeBranchMap[tianDeHeStem];

    return branch === tianDeHeBranch;
  }

  /**
   * 判断是否为月德
   * @param stem 天干
   * @returns 是否为月德
   */
  private static isYueDe(stem: string): boolean {
    // 月德与天干的对应关系
    const yueDeMap: {[key: string]: string} = {
      '甲': '丙',
      '乙': '甲',
      '丙': '壬',
      '丁': '庚',
      '戊': '戊',
      '己': '丙',
      '庚': '甲',
      '辛': '壬',
      '壬': '庚',
      '癸': '戊'
    };

    return Object.values(yueDeMap).includes(stem);
  }

  /**
   * 判断是否为天医
   * @param branch 地支
   * @returns 是否为天医
   */
  private static isTianYi(branch: string): boolean {
    // 天医与地支的对应关系
    const tianYiMap: {[key: string]: string} = {
      '子': '丑',
      '丑': '子',
      '寅': '亥',
      '卯': '戌',
      '辰': '酉',
      '巳': '申',
      '午': '未',
      '未': '午',
      '申': '巳',
      '酉': '辰',
      '戌': '卯',
      '亥': '寅'
    };

    return Object.values(tianYiMap).includes(branch);
  }

  /**
   * 判断是否为天喜
   * @param branch 地支
   * @param yearBranch 年支
   * @returns 是否为天喜
   */
  private static isTianXi(branch: string, yearBranch: string): boolean {
    // 天喜与年支的对应关系
    const tianXiMap: {[key: string]: string} = {
      '子': '酉',
      '丑': '申',
      '寅': '未',
      '卯': '午',
      '辰': '巳',
      '巳': '辰',
      '午': '卯',
      '未': '寅',
      '申': '丑',
      '酉': '子',
      '戌': '亥',
      '亥': '戌'
    };

    // 根据年支查找对应的天喜地支
    const tianXiBranch = tianXiMap[yearBranch];

    // 检查当前地支是否与天喜地支匹配
    return branch === tianXiBranch;
  }

  /**
   * 判断是否为红艳
   * @param branch 地支
   * @returns 是否为红艳
   */
  private static isHongYan(branch: string): boolean {
    return ['卯', '巳', '申', '戌'].includes(branch);
  }

  /**
   * 判断是否为天罗
   * @param branch 地支
   * @returns 是否为天罗
   */
  private static isTianLuo(branch: string): boolean {
    return branch === '戌';
  }

  /**
   * 判断是否为地网
   * @param branch 地支
   * @returns 是否为地网
   */
  private static isDiWang(branch: string): boolean {
    return branch === '未';
  }

  /**
   * 判断是否为羊刃
   * @param dayStem 日干
   * @param branch 地支
   * @returns 是否为羊刃
   */
  private static isYangRen(dayStem: string, branch: string): boolean {
    // 羊刃与日干的对应关系
    // 羊刃口诀：甲羊刃在卯，乙羊刃在寅。丙戊羊刃在午，丁己羊刃在巳。庚羊刃在酉，辛羊刃在申。壬羊刃在亥，癸羊刃在子。
    const yangRenMap: {[key: string]: string} = {
      '甲': '卯',
      '乙': '寅',
      '丙': '午',
      '丁': '巳',
      '戊': '午',
      '己': '巳',
      '庚': '酉',
      '辛': '申',
      '壬': '亥',
      '癸': '子'
    };

    return yangRenMap[dayStem] === branch;
  }

  /**
   * 判断是否为天空
   * @param branch 地支
   * @returns 是否为天空
   */
  private static isTianKong(branch: string): boolean {
    return branch === '戌';
  }

  /**
   * 判断是否为地劫
   * @param branch 地支
   * @returns 是否为地劫
   */
  private static isDiJie(branch: string): boolean {
    return branch === '辰';
  }

  /**
   * 判断是否为天刑
   * @param branch 地支
   * @returns 是否为天刑
   */
  private static isTianXing(branch: string): boolean {
    return branch === '巳';
  }

  /**
   * 判断是否为天哭
   * @param branch 地支
   * @returns 是否为天哭
   */
  private static isTianKu(branch: string): boolean {
    return branch === '未';
  }

  /**
   * 判断是否为天虚
   * @param branch 地支
   * @returns 是否为天虚
   */
  private static isTianXu(branch: string): boolean {
    return branch === '丑';
  }

  /**
   * 判断是否为咸池
   * @param branch 地支
   * @returns 是否为咸池
   */
  private static isXianChi(branch: string): boolean {
    return ['丑', '未', '辰', '戌'].includes(branch);
  }

  /**
   * 判断是否为亡神
   * @param branch 地支
   * @returns 是否为亡神
   */
  private static isWangShen(branch: string): boolean {
    return ['寅', '申'].includes(branch);
  }

  /**
   * 判断是否为劫煞
   * @param branch 地支
   * @returns 是否为劫煞
   */
  private static isJieSha(branch: string): boolean {
    return ['子', '午'].includes(branch);
  }

  /**
   * 判断是否为灾煞
   * @param branch 地支
   * @returns 是否为灾煞
   */
  private static isZaiSha(branch: string): boolean {
    return ['卯', '酉'].includes(branch);
  }

  /**
   * 判断是否为岁破
   * @param branch 地支
   * @param yearBranch 年支
   * @returns 是否为岁破
   */
  private static isSuiPo(branch: string, yearBranch: string): boolean {
    // 岁破与年支的对应关系
    const suiPoMap: {[key: string]: string} = {
      '子': '午',
      '午': '子',
      '卯': '酉',
      '酉': '卯',
      '辰': '戌',
      '戌': '辰',
      '丑': '未',
      '未': '丑',
      '寅': '申',
      '申': '寅',
      '巳': '亥',
      '亥': '巳'
    };

    return suiPoMap[yearBranch] === branch;
  }

  /**
   * 判断是否为大耗
   * @param branch 地支
   * @param yearBranch 年支
   * @returns 是否为大耗
   */
  private static isDaHao(branch: string, yearBranch: string): boolean {
    // 大耗与年支的对应关系
    const daHaoMap: {[key: string]: string} = {
      '子': '未',
      '丑': '申',
      '寅': '酉',
      '卯': '戌',
      '辰': '亥',
      '巳': '子',
      '午': '丑',
      '未': '寅',
      '申': '卯',
      '酉': '辰',
      '戌': '巳',
      '亥': '午'
    };

    return daHaoMap[yearBranch] === branch;
  }

  /**
   * 判断是否为五鬼
   * @param branch 地支
   * @returns 是否为五鬼
   */
  private static isWuGui(branch: string): boolean {
    return ['巳', '申', '亥', '寅'].includes(branch);
  }

  /**
   * 判断是否为童子煞
   * @param eightChar 八字对象
   * @param season 季节（春、夏、秋、冬）
   * @returns 是否为童子煞
   */
  private static isTongZiSha(eightChar: EightChar, season: string): boolean {
    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 获取纳音五行
    const yearNaYin = eightChar.getYearNaYin();
    const monthNaYin = eightChar.getMonthNaYin();
    const dayNaYin = eightChar.getDayNaYin();
    const timeNaYin = eightChar.getTimeNaYin();

    // 提取纳音五行属性（金木水火土）
    const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
    const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
    const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);

    // 童子煞判断口诀：
    // "春秋寅子贵，冬夏卯未辰；金木马卯合，水火鸡犬多；土命逢辰巳，童子定不错"

    // 1. 按季节和地支判断
    let seasonCheck = false;
    if ((season === '春' || season === '秋') && (dayBranch === '寅' || dayBranch === '子' || timeBranch === '寅' || timeBranch === '子')) {
      seasonCheck = true;
    } else if ((season === '冬' || season === '夏') && (dayBranch === '卯' || dayBranch === '未' || dayBranch === '辰' ||
                                                      timeBranch === '卯' || timeBranch === '未' || timeBranch === '辰')) {
      seasonCheck = true;
    }

    // 2. 按纳音五行和地支判断
    let naYinCheck = false;
    if ((yearNaYinWuXing === '金' || yearNaYinWuXing === '木' || dayNaYinWuXing === '金' || dayNaYinWuXing === '木') &&
        (dayBranch === '午' || dayBranch === '卯' || timeBranch === '午' || timeBranch === '卯')) {
      naYinCheck = true;
    } else if ((yearNaYinWuXing === '水' || yearNaYinWuXing === '火' || dayNaYinWuXing === '水' || dayNaYinWuXing === '火') &&
               (dayBranch === '酉' || dayBranch === '戌' || timeBranch === '酉' || timeBranch === '戌')) {
      naYinCheck = true;
    } else if ((yearNaYinWuXing === '土' || dayNaYinWuXing === '土') &&
               (dayBranch === '辰' || dayBranch === '巳' || timeBranch === '辰' || timeBranch === '巳')) {
      naYinCheck = true;
    }

    // 3. 综合判断：季节条件或纳音条件满足其一即可
    return seasonCheck || naYinCheck;
  }



  /**
   * 判断是否为将军箭
   * @param eightChar 八字对象
   * @param season 季节（春、夏、秋、冬）
   * @returns 是否为将军箭
   */
  private static isJiangJunJian(eightChar: EightChar, season: string): boolean {
    // 获取四柱干支
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const timeStem = eightChar.getTimeGan();
    const timeBranch = eightChar.getTimeZhi();

    // 获取纳音五行
    const yearNaYin = eightChar.getYearNaYin();
    const monthNaYin = eightChar.getMonthNaYin();
    const dayNaYin = eightChar.getDayNaYin();
    const timeNaYin = eightChar.getTimeNaYin();

    // 提取纳音五行属性（金木水火土）
    const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
    const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
    const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);

    // 将军箭判断口诀：
    // "春季酉戌辰，夏季未卯子，秋季寅申午，冬季巳亥丑"
    // 同时需要考虑八字中的冲克关系和纳音五行

    // 1. 按季节和时支判断
    let seasonCheck = false;
    const jiangJunJianMap: {[key: string]: string[]} = {
      '春': ['酉', '戌', '辰'],
      '夏': ['未', '卯', '子'],
      '秋': ['寅', '申', '午'],
      '冬': ['巳', '亥', '丑']
    };

    if (jiangJunJianMap[season]?.includes(timeBranch)) {
      seasonCheck = true;
    }

    // 2. 检查八字中的冲克关系
    // 日支与时支相冲，或者日干与时干相克
    let chongKeCheck = false;
    if (this.isZhiChong(dayBranch, timeBranch) || this.isWuXingKe(this.getStemWuXing(dayStem), this.getStemWuXing(timeStem))) {
      chongKeCheck = true;
    }

    // 3. 检查纳音五行是否不调和
    // 时柱纳音与日柱纳音相克
    let naYinCheck = false;
    if (this.isWuXingKe(this.getNaYinWuXing(dayNaYin), this.getNaYinWuXing(timeNaYin)) ||
        this.isWuXingKe(this.getNaYinWuXing(timeNaYin), this.getNaYinWuXing(dayNaYin))) {
      naYinCheck = true;
    }

    // 4. 综合判断：季节条件必须满足，且冲克关系或纳音不调和其一满足
    return seasonCheck && (chongKeCheck || naYinCheck);
  }

  /**
   * 判断两地支是否相冲
   * @param zhi1 地支1
   * @param zhi2 地支2
   * @returns 是否相冲
   */
  private static isZhiChong(zhi1: string, zhi2: string): boolean {
    const chongPairs = [
      ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'],
      ['辰', '戌'], ['巳', '亥']
    ];

    for (const pair of chongPairs) {
      if ((zhi1 === pair[0] && zhi2 === pair[1]) || (zhi1 === pair[1] && zhi2 === pair[0])) {
        return true;
      }
    }

    return false;
  }

  /**
   * 判断是否为天德贵人
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天德贵人
   */
  private static isTianDeGuiRen(stem: string, branch: string): boolean {
    // 天德贵人与天干的对应关系
    const tianDeGuiRenMap: {[key: string]: string[]} = {
      '甲': ['丑', '未'],
      '乙': ['子', '申'],
      '丙': ['亥', '酉'],
      '丁': ['亥', '酉'],
      '戊': ['丑', '未'],
      '己': ['子', '申'],
      '庚': ['亥', '酉'],
      '辛': ['亥', '酉'],
      '壬': ['丑', '未'],
      '癸': ['子', '申']
    };

    return tianDeGuiRenMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为月德贵人
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为月德贵人
   */
  private static isYueDeGuiRen(stem: string, branch: string): boolean {
    // 月德贵人与天干的对应关系
    const yueDeGuiRenMap: {[key: string]: string[]} = {
      '甲': ['卯'],
      '乙': ['寅'],
      '丙': ['巳'],
      '丁': ['午'],
      '戊': ['巳'],
      '己': ['午'],
      '庚': ['申'],
      '辛': ['酉'],
      '壬': ['亥'],
      '癸': ['子']
    };

    return yueDeGuiRenMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天赦
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天赦
   */
  private static isTianShe(stem: string, branch: string): boolean {
    // 天赦与天干地支的对应关系
    const tianSheMap: {[key: string]: string[]} = {
      '甲': ['戌'],
      '乙': ['酉'],
      '丙': ['申'],
      '丁': ['未'],
      '戊': ['午'],
      '己': ['巳'],
      '庚': ['辰'],
      '辛': ['卯'],
      '壬': ['寅'],
      '癸': ['丑']
    };

    return tianSheMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天恩
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天恩
   */
  private static isTianEn(stem: string, branch: string): boolean {
    // 天恩与天干地支的对应关系
    const tianEnMap: {[key: string]: string[]} = {
      '甲': ['申'],
      '乙': ['酉'],
      '丙': ['戌'],
      '丁': ['亥'],
      '戊': ['子'],
      '己': ['丑'],
      '庚': ['寅'],
      '辛': ['卯'],
      '壬': ['辰'],
      '癸': ['巳']
    };

    return tianEnMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天官
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天官
   */
  private static isTianGuan(stem: string, branch: string): boolean {
    // 天官与天干地支的对应关系
    const tianGuanMap: {[key: string]: string[]} = {
      '甲': ['未'],
      '乙': ['申'],
      '丙': ['酉'],
      '丁': ['戌'],
      '戊': ['亥'],
      '己': ['子'],
      '庚': ['丑'],
      '辛': ['寅'],
      '壬': ['卯'],
      '癸': ['辰']
    };

    return tianGuanMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天福
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天福
   */
  private static isTianFu(stem: string, branch: string): boolean {
    // 天福与天干地支的对应关系
    const tianFuMap: {[key: string]: string[]} = {
      '甲': ['酉'],
      '乙': ['申'],
      '丙': ['未'],
      '丁': ['午'],
      '戊': ['巳'],
      '己': ['辰'],
      '庚': ['卯'],
      '辛': ['寅'],
      '壬': ['丑'],
      '癸': ['子']
    };

    return tianFuMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天厨
   * @param stem 天干
   * @param branch 地支
   * @returns 是否为天厨
   */
  private static isTianChu(stem: string, branch: string): boolean {
    // 天厨与天干地支的对应关系
    const tianChuMap: {[key: string]: string[]} = {
      '甲': ['巳'],
      '乙': ['午'],
      '丙': ['未'],
      '丁': ['申'],
      '戊': ['酉'],
      '己': ['戌'],
      '庚': ['亥'],
      '辛': ['子'],
      '壬': ['丑'],
      '癸': ['寅']
    };

    return tianChuMap[stem]?.includes(branch) || false;
  }

  /**
   * 判断是否为天巫
   * @param branch 地支
   * @returns 是否为天巫
   */
  private static isTianWu(branch: string): boolean {
    return ['巳', '亥'].includes(branch);
  }

  /**
   * 判断是否为天月
   * @param branch 地支
   * @returns 是否为天月
   */
  private static isTianYue(branch: string): boolean {
    return ['未', '丑'].includes(branch);
  }

  /**
   * 判断是否为天马
   * @param branch 地支
   * @param yearBranch 年支
   * @returns 是否为天马
   */
  private static isTianMa(branch: string, yearBranch: string): boolean {
    // 天马与年支的对应关系
    // 寅午戌年马在申，申子辰年马在寅，巳酉丑年马在亥，亥卯未年马在巳
    const tianMaMap: {[key: string]: string} = {
      '寅': '申',
      '午': '申',
      '戌': '申',
      '申': '寅',
      '子': '寅',
      '辰': '寅',
      '巳': '亥',
      '酉': '亥',
      '丑': '亥',
      '亥': '巳',
      '卯': '巳',
      '未': '巳'
    };

    return tianMaMap[yearBranch] === branch;
  }

  /**
   * 获取地势（长生十二神）
   * @param dayStem 日干
   * @param branch 地支
   * @returns 地势
   */
  private static getDiShi(dayStem: string, branch: string): string {
    // 阳干：甲丙戊庚壬
    // 阴干：乙丁己辛癸
    const yangGan = '甲丙戊庚壬';
    const isDayYang = yangGan.includes(dayStem);

    // 长生十二神表
    const diShiMap: {[key: string]: {[key: string]: string}} = {
      '甲': {
        '亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官', '卯': '帝旺',
        '辰': '衰', '巳': '病', '午': '死', '未': '墓', '申': '绝',
        '酉': '胎', '戌': '养'
      },
      '丙戊': {
        '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺',
        '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝',
        '子': '胎', '丑': '养'
      },
      '庚': {
        '巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官', '酉': '帝旺',
        '戌': '衰', '亥': '病', '子': '死', '丑': '墓', '寅': '绝',
        '卯': '胎', '辰': '养'
      },
      '壬': {
        '申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官', '子': '帝旺',
        '丑': '衰', '寅': '病', '卯': '死', '辰': '墓', '巳': '绝',
        '午': '胎', '未': '养'
      },
      '乙': {
        '午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官', '寅': '帝旺',
        '丑': '衰', '子': '病', '亥': '死', '戌': '墓', '酉': '绝',
        '申': '胎', '未': '养'
      },
      '丁己': {
        '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺',
        '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝',
        '亥': '胎', '戌': '养'
      },
      '辛': {
        '子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官', '申': '帝旺',
        '未': '衰', '午': '病', '巳': '死', '辰': '墓', '卯': '绝',
        '寅': '胎', '丑': '养'
      },
      '癸': {
        '卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官', '亥': '帝旺',
        '戌': '衰', '酉': '病', '申': '死', '未': '墓', '午': '绝',
        '巳': '胎', '辰': '养'
      }
    };

    // 根据日干查找对应的地势表
    let diShiTable: {[key: string]: string} | undefined;

    if (dayStem === '甲') {
      diShiTable = diShiMap['甲'];
    } else if (dayStem === '乙') {
      diShiTable = diShiMap['乙'];
    } else if (dayStem === '丙' || dayStem === '戊') {
      diShiTable = diShiMap['丙戊'];
    } else if (dayStem === '丁' || dayStem === '己') {
      diShiTable = diShiMap['丁己'];
    } else if (dayStem === '庚') {
      diShiTable = diShiMap['庚'];
    } else if (dayStem === '辛') {
      diShiTable = diShiMap['辛'];
    } else if (dayStem === '壬') {
      diShiTable = diShiMap['壬'];
    } else if (dayStem === '癸') {
      diShiTable = diShiMap['癸'];
    }

    // 如果找到对应的地势表，返回地势
    if (diShiTable && diShiTable[branch]) {
      return diShiTable[branch];
    }

    return '未知';
  }

  /**
   * 计算八字格局（改进版）
   * @param eightChar 八字对象
   * @returns 格局信息
   */
  private static calculateGeJu(eightChar: EightChar): {
    geJu: string;
    detail: string;
    geJuStrength: number;
    yongShen: string;
    yongShenDetail: string;
    geJuFactors: { factor: string; description: string; contribution: number; }[];
  } {
    // 获取格局详细信息
    const geJuInfo = this.calculateGeJuImproved(eightChar);

    // 返回完整的格局信息
    return {
      geJu: geJuInfo.geJu,
      detail: geJuInfo.detail,
      geJuStrength: geJuInfo.geJuStrength,
      yongShen: geJuInfo.yongShen,
      yongShenDetail: geJuInfo.yongShenDetail,
      geJuFactors: geJuInfo.geJuFactors
    };
  }

  /**
   * 计算八字格局（改进版）
   * @param eightChar 八字对象
   * @returns 格局信息
   */
  private static calculateGeJuImproved(eightChar: EightChar): {
    geJu: string;
    detail: string;
    geJuStrength: number;
    yongShen: string;
    yongShenDetail: string;
    geJuFactors: { factor: string; description: string; contribution: number; }[];
  } {
    // 1. 获取日主旺衰
    const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
    const riZhuStrength = riZhuStrengthInfo.result;

    // 2. 获取四柱天干和地支
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const dayStem = eightChar.getDayGan();
    const timeStem = eightChar.getTimeGan();

    const yearBranch = eightChar.getYearZhi();
    const monthBranch = eightChar.getMonthZhi();
    const dayBranch = eightChar.getDayZhi();
    const timeBranch = eightChar.getTimeZhi();

    // 使用格局判断服务
    // 创建BaziInfo对象
    const baziInfo = {
      // 基本信息
      dayStem,
      dayBranch,
      dayWuXing: this.getStemWuXing(dayStem),
      riZhuStrength,

      // 年柱信息
      yearStem,
      yearBranch,
      yearWuXing: this.getStemWuXing(yearStem),
      yearShiShenGan: this.getShiShen(dayStem, yearStem),
      yearShiShenZhi: this.getHiddenShiShen(dayStem, yearBranch),
      yearNaYin: this.getNaYin(yearStem + yearBranch),

      // 月柱信息
      monthStem,
      monthBranch,
      monthWuXing: this.getStemWuXing(monthStem),
      monthShiShenGan: this.getShiShen(dayStem, monthStem),
      monthShiShenZhi: this.getHiddenShiShen(dayStem, monthBranch),
      monthNaYin: this.getNaYin(monthStem + monthBranch),

      // 日柱信息
      dayNaYin: this.getNaYin(dayStem + dayBranch),
      dayShiShenZhi: this.getHiddenShiShen(dayStem, dayBranch),

      // 时柱信息
      hourStem: timeStem,
      hourBranch: timeBranch,
      hourWuXing: this.getStemWuXing(timeStem),
      timeShiShenGan: this.getShiShen(dayStem, timeStem),
      hourShiShenZhi: this.getHiddenShiShen(dayStem, timeBranch),
      hourNaYin: this.getNaYin(timeStem + timeBranch)
    };

    // 使用格局判断服务
    const geJuResult = GeJuJudgeService.judgeGeJu(baziInfo);

    // 返回格局信息
    return {
      geJu: geJuResult.mainGeJu,
      detail: geJuResult.mainGeJuDetail,
      geJuStrength: geJuResult.mainGeJuStrength,
      yongShen: geJuResult.yongShen,
      yongShenDetail: geJuResult.yongShenDetail,
      geJuFactors: geJuResult.factors
    };
  }



  /**
   * 获取地支对应的五行
   * @param branch 地支
   * @returns 五行
   */
  private static getBranchWuXing(branch: string): string {
    const map: {[key: string]: string} = {
      '子': '水',
      '丑': '土',
      '寅': '木',
      '卯': '木',
      '辰': '土',
      '巳': '火',
      '午': '火',
      '未': '土',
      '申': '金',
      '酉': '金',
      '戌': '土',
      '亥': '水'
    };

    return map[branch] || '未知';
  }

  /**
   * 判断五行是否相生
   * @param from 源五行
   * @param to 目标五行
   * @returns 是否相生
   */
  private static isWuXingSheng(from: string, to: string): boolean {
    // 五行相生：木生火，火生土，土生金，金生水，水生木
    return (from.includes('木') && to.includes('火')) ||
           (from.includes('火') && to.includes('土')) ||
           (from.includes('土') && to.includes('金')) ||
           (from.includes('金') && to.includes('水')) ||
           (from.includes('水') && to.includes('木'));
  }

  /**
   * 判断五行是否相克
   * @param from 源五行
   * @param to 目标五行
   * @returns 是否相克
   */
  private static isWuXingKe(from: string, to: string): boolean {
    // 五行相克：木克土，土克水，水克火，火克金，金克木
    return (from.includes('木') && to.includes('土')) ||
           (from.includes('土') && to.includes('水')) ||
           (from.includes('水') && to.includes('火')) ||
           (from.includes('火') && to.includes('金')) ||
           (from.includes('金') && to.includes('木'));
  }

  /**
   * 计算起运时间
   * @param solar 阳历对象
   * @param gender 性别（1-男，0-女）
   * @returns 起运信息
   */
  private static calculateQiYun(solar: Solar, gender: string): { date: string; age: number } {
    // 这里简化处理，实际应该根据八字命理规则计算

    // 简单示例：男命3岁起运，女命4岁起运
    const qiYunAge = gender === '1' ? 3 : 4;

    // 计算起运年份
    const birthYear = solar.getYear();
    const qiYunYear = birthYear + qiYunAge;

    // 格式化起运日期
    const qiYunDate = `${qiYunYear}-${solar.getMonth().toString().padStart(2, '0')}-${solar.getDay().toString().padStart(2, '0')}`;

    return {
      date: qiYunDate,
      age: qiYunAge
    };
  }







  /**
   * 生成交互式八字命盘的HTML
   * @param baziInfo 八字信息对象
   * @param id 命盘ID
   * @returns HTML字符串
   */
  static generateBaziHTML(baziInfo: BaziInfo, id: string = 'bazi-view-' + Math.random().toString(36).substring(2, 9)): string {
    return `<div id="${id}" class="bazi-view-container">
  <div class="bazi-view-header">
    <h3 class="bazi-view-title">八字命盘</h3>
    <button class="bazi-view-settings-button" data-bazi-id="${id}" aria-label="设置">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    </button>
  </div>

  <div class="bazi-view-section bazi-view-basic-info">
    <div class="bazi-view-col">
      <div class="bazi-view-info-item">公历：${baziInfo.solarDate || '----'} ${baziInfo.solarTime || '--:--'}</div>
    </div>
    <div class="bazi-view-col">
      <div class="bazi-view-info-item">农历：${baziInfo.lunarDate || '----'}</div>
    </div>
  </div>

  <div class="bazi-view-section">
    <table class="bazi-view-table">
      <thead>
        <tr>
          <th>年柱</th>
          <th>月柱</th>
          <th>日柱</th>
          <th>时柱</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bazi-stem-row">
          <td class="wuxing-${this.getWuXingClass(baziInfo.yearWuXing || '')}">${baziInfo.yearStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.monthWuXing || '')}">${baziInfo.monthStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.dayWuXing || '')}">${baziInfo.dayStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.hourWuXing || '')}">${baziInfo.hourStem || ''}</td>
        </tr>
        <tr class="bazi-branch-row">
          <td>${baziInfo.yearBranch}</td>
          <td>${baziInfo.monthBranch}</td>
          <td>${baziInfo.dayBranch}</td>
          <td>${baziInfo.hourBranch}</td>
        </tr>
        <tr class="bazi-hidegan-row">
          <td><small>${baziInfo.yearHideGan || '无'}</small></td>
          <td><small>${baziInfo.monthHideGan || '无'}</small></td>
          <td><small>${baziInfo.dayHideGan || '无'}</small></td>
          <td><small>${baziInfo.hourHideGan || '无'}</small></td>
        </tr>
        <tr class="bazi-shishen-row">
          <td><small>${baziInfo.yearShiShenGan || ''}</small></td>
          <td><small>${baziInfo.monthShiShenGan || ''}</small></td>
          <td><small>日主</small></td>
          <td><small>${baziInfo.timeShiShenGan || ''}</small></td>
        </tr>
        <tr class="bazi-nayin-row">
          <td>${baziInfo.yearNaYin || '未知'}</td>
          <td>${baziInfo.monthNaYin || '未知'}</td>
          <td>${baziInfo.dayNaYin || '未知'}</td>
          <td>${baziInfo.hourNaYin || '未知'}</td>
        </tr>
        <tr class="bazi-xunkong-row">
          <td><small>${baziInfo.yearXunKong || '无'}</small></td>
          <td><small>${baziInfo.monthXunKong || '无'}</small></td>
          <td><small>${baziInfo.dayXunKong || '无'}</small></td>
          <td><small>${baziInfo.timeXunKong || '无'}</small></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">五行分析</h4>
    <div class="bazi-view-wuxing-list">
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.yearWuXing || '')}">${baziInfo.yearStem || ''}(${baziInfo.yearWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.monthWuXing || '')}">${baziInfo.monthStem || ''}(${baziInfo.monthWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.dayWuXing || '')}">${baziInfo.dayStem || ''}(${baziInfo.dayWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.hourWuXing || '')}">${baziInfo.hourStem || ''}(${baziInfo.hourWuXing || '未知'})</span>
    </div>

    ${baziInfo.wuXingStrength ? `
    <div class="bazi-view-wuxing-strength">
      <div class="bazi-view-wuxing-header" data-bazi-id="${id}">
        <span class="bazi-view-wuxing-title">五行强度:</span>
        <div class="bazi-view-wuxing-bars">
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-jin wuxing-clickable" data-wuxing="金" data-value="${baziInfo.wuXingStrength.jin.toFixed(1)}" data-bazi-id="${id}">金: ${baziInfo.wuXingStrength.jin.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-jin" style="width: ${Math.min(baziInfo.wuXingStrength.jin * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-mu wuxing-clickable" data-wuxing="木" data-value="${baziInfo.wuXingStrength.mu.toFixed(1)}" data-bazi-id="${id}">木: ${baziInfo.wuXingStrength.mu.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-mu" style="width: ${Math.min(baziInfo.wuXingStrength.mu * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-shui wuxing-clickable" data-wuxing="水" data-value="${baziInfo.wuXingStrength.shui.toFixed(1)}" data-bazi-id="${id}">水: ${baziInfo.wuXingStrength.shui.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-shui" style="width: ${Math.min(baziInfo.wuXingStrength.shui * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-huo wuxing-clickable" data-wuxing="火" data-value="${baziInfo.wuXingStrength.huo.toFixed(1)}" data-bazi-id="${id}">火: ${baziInfo.wuXingStrength.huo.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-huo" style="width: ${Math.min(baziInfo.wuXingStrength.huo * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-tu wuxing-clickable" data-wuxing="土" data-value="${baziInfo.wuXingStrength.tu.toFixed(1)}" data-bazi-id="${id}">土: ${baziInfo.wuXingStrength.tu.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-tu" style="width: ${Math.min(baziInfo.wuXingStrength.tu * 10, 100)}%"></div>
          </div>
        </div>
        <span class="bazi-view-wuxing-toggle" data-bazi-id="${id}">查看详情 ▼</span>
      </div>

      <div class="bazi-view-wuxing-details" id="wuxing-details-${id}" style="display: none;">
        <table class="bazi-view-wuxing-table">
          <tr>
            <th colspan="2">五行强度计算说明</th>
          </tr>
          <tr>
            <td colspan="2">五行强度是根据以下因素综合计算的：</td>
          </tr>
          <tr>
            <td>天干五行</td>
            <td>年干(1.0)、月干(2.0)、日干(3.0)、时干(1.0)</td>
          </tr>
          <tr>
            <td>地支藏干</td>
            <td>年支(0.7)、月支(1.5)、日支(2.0)、时支(0.7)</td>
          </tr>
          <tr>
            <td>纳音五行</td>
            <td>年柱(0.5)、月柱(1.0)、日柱(1.5)、时柱(0.5)</td>
          </tr>
          <tr>
            <td>季节调整</td>
            <td>
              春季：木旺(+1.0)、火相(+0.5)<br>
              夏季：火旺(+1.0)、土相(+0.5)<br>
              秋季：金旺(+1.0)、水相(+0.5)<br>
              冬季：水旺(+1.0)、木相(+0.5)
            </td>
          </tr>
          <tr>
            <td>组合调整</td>
            <td>
              天干五合：甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火(+0.5)<br>
              地支三合：寅午戌合火、亥卯未合木、申子辰合水、巳酉丑合金(+1.0)
            </td>
          </tr>
        </table>
      </div>
    </div>
    ` : ''}

    ${baziInfo.riZhuStrength ? `
    <div class="bazi-view-rizhu-strength">
      <div class="bazi-view-rizhu-header" data-bazi-id="${id}">
        <span class="bazi-view-rizhu-title">日主旺衰: <span class="shensha-tag rizhu-clickable" data-rizhu="${baziInfo.riZhuStrength}" data-wuxing="${baziInfo.dayWuXing}" data-bazi-id="${id}" style="cursor: pointer;">${baziInfo.riZhuStrength}</span></span>
      </div>
    </div>
    ` : ''}
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">特殊信息</h4>
    <div class="bazi-view-info-list">
      <div class="bazi-view-info-item">胎元：${baziInfo.taiYuan || '未知'}${baziInfo.taiYuanNaYin ? `（${baziInfo.taiYuanNaYin}）` : ''}</div>
      <div class="bazi-view-info-item">命宫：${baziInfo.mingGong || '未知'}${baziInfo.mingGongNaYin ? `（${baziInfo.mingGongNaYin}）` : ''}</div>
      ${baziInfo.shenGong ? `<div class="bazi-view-info-item">身宫：${baziInfo.shenGong}</div>` : ''}
    </div>
  </div>

  ${baziInfo.qiYunYear || baziInfo.qiYunDate ? `
  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">起运信息</h4>
    <div class="bazi-view-info-list">
      ${baziInfo.qiYunYear ? `<div class="bazi-view-info-item">起运时间：出生${baziInfo.qiYunYear}年${baziInfo.qiYunMonth || 0}个月${baziInfo.qiYunDay || 0}天${baziInfo.qiYunHour && baziInfo.qiYunHour > 0 ? baziInfo.qiYunHour + '小时' : ''}后</div>` : ''}
      ${baziInfo.qiYunDate ? `<div class="bazi-view-info-item">起运日期：${baziInfo.qiYunDate}</div>` : ''}
      ${baziInfo.qiYunAge ? `<div class="bazi-view-info-item">起运年龄：${baziInfo.qiYunAge}岁</div>` : ''}
    </div>
  </div>
  ` : ''}

  ${baziInfo.daYun && baziInfo.daYun.length > 0 ? `
  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">大运信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-dayun-table">
        <tr>
          <th>大运</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startYear}</td>`).join('') : ''}
        </tr>
        <tr>
          <th>年龄</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startAge}</td>`).join('') : ''}
        </tr>
        <tr>
          <th>干支</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map((dy, index) => `
            <td class="bazi-dayun-cell" data-index="${index}">${dy.ganZhi}</td>
          `).join('') : ''}
        </tr>
        <tr>
          <th>神煞</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map((dy, index) => {
            // 调试信息
            console.log(`大运数据: 索引${index}, 神煞:`, dy.shenSha);

            return `
            <td>
              ${dy.shenSha && dy.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${dy.shenSha.map(shenSha => {
                    // 调试信息
                    console.log(`大运神煞HTML生成: ${shenSha}`);

                    const type = BaziService.getShenShaType(shenSha) || '未知';
                    let cssClass = '';
                    if (type === '吉神') {
                      cssClass = 'shensha-good';
                    } else if (type === '凶神') {
                      cssClass = 'shensha-bad';
                    } else if (type === '吉凶神') {
                      cssClass = 'shensha-mixed';
                    }
                    return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
                  }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
          }).join('') : ''}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.liuNian && baziInfo.liuNian.length > 0 ? `
  <div class="bazi-view-section bazi-liunian-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">流年信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-liunian-table">
        <tr>
          <th>流年</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `<td>${ln.year}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `<td>${ln.age}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `
            <td class="bazi-liunian-cell" data-year="${ln.year}">${ln.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => {
            // 调试信息
            console.log(`流年数据: ${ln.year}, 神煞:`, ln.shenSha);

            return `
            <td>
              ${ln.shenSha && ln.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${ln.shenSha.map(shenSha => {
                    // 调试信息
                    console.log(`流年神煞HTML生成: ${shenSha}`);

                    const type = BaziService.getShenShaType(shenSha) || '未知';
                    let cssClass = '';
                    if (type === '吉神') {
                      cssClass = 'shensha-good';
                    } else if (type === '凶神') {
                      cssClass = 'shensha-bad';
                    } else if (type === '吉凶神') {
                      cssClass = 'shensha-mixed';
                    }
                    return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
                  }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
          }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.xiaoYun && baziInfo.xiaoYun.length > 0 ? `
  <div class="bazi-view-section bazi-xiaoyun-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">小运信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-xiaoyun-table">
        <tr>
          <th>小运</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `<td>${xy.year}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `<td>${xy.age}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `
            <td class="bazi-xiaoyun-cell" data-year="${xy.year}">${xy.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => {
            // 调试信息
            console.log(`小运数据: ${xy.year}, 神煞:`, xy.shenSha);

            return `
            <td>
              ${xy.shenSha && xy.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${xy.shenSha.map(shenSha => {
                    // 调试信息
                    console.log(`小运神煞HTML生成: ${shenSha}`);

                    const type = BaziService.getShenShaType(shenSha) || '未知';
                    let cssClass = '';
                    if (type === '吉神') {
                      cssClass = 'shensha-good';
                    } else if (type === '凶神') {
                      cssClass = 'shensha-bad';
                    } else if (type === '吉凶神') {
                      cssClass = 'shensha-mixed';
                    }
                    return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
                  }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
          }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.liuYue && baziInfo.liuYue.length > 0 ? `
  <div class="bazi-view-section bazi-liuyue-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">流月信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-liuyue-table">
        <tr>
          <th>流月</th>
          ${baziInfo.liuYue.map(ly => `<td>${ly.month}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.liuYue.map(ly => `
            <td class="bazi-liuyue-cell" data-month="${ly.month}">${ly.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.liuYue.map(ly => {
            // 调试信息
            console.log(`流月数据: ${ly.month}, 神煞:`, ly.shenSha);

            return `
            <td>
              ${ly.shenSha && ly.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${ly.shenSha.map(shenSha => {
                    // 调试信息
                    console.log(`流月神煞HTML生成: ${shenSha}`);

                    const type = BaziService.getShenShaType(shenSha) || '未知';
                    let cssClass = '';
                    if (type === '吉神') {
                      cssClass = 'shensha-good';
                    } else if (type === '凶神') {
                      cssClass = 'shensha-bad';
                    } else if (type === '吉凶神') {
                      cssClass = 'shensha-mixed';
                    }
                    return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
                  }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
          }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  <div class="bazi-view-section" style="display: none;">
    <div class="bazi-view-data"
      data-year="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[0] : '2023'}"
      data-month="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[1] : '1'}"
      data-day="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[2] : '1'}"
      data-hour="${baziInfo.solarTime && baziInfo.solarTime.includes(':') ? baziInfo.solarTime.split(':')[0] : '0'}"
      data-all-dayun='${JSON.stringify(baziInfo.daYun || [])}'
      data-all-liunian='${JSON.stringify(baziInfo.liuNian || [])}'
      data-all-xiaoyun='${JSON.stringify(baziInfo.xiaoYun || [])}'
      data-all-liuyue='${JSON.stringify(baziInfo.liuYue || [])}'>
    </div>
  </div>
</div>`;
  }
  /**
   * 获取五行对应的CSS类名
   * @param wuxing 五行名称
   * @returns CSS类名
   */
  private static getWuXingClass(wuxing: string): string {
    // 如果wuxing未定义，返回空字符串
    if (!wuxing) {
      return '';
    }

    const map: {[key: string]: string} = {
      '金': 'jin',
      '木': 'mu',
      '水': 'shui',
      '火': 'huo',
      '土': 'tu'
    };

    for (const key in map) {
      if (wuxing.includes(key)) {
        return map[key];
      }
    }

    return '';
  }

  /**
   * 获取神煞类型（吉神、凶神、吉凶神）
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  public static getShenShaType(shenSha: string): string {
    // 吉神列表
    const goodShenSha = [
      '天乙贵人', '文昌', '文曲', '天德', '月德', '天福', '天官', '天厨',
      '天巫', '天月', '天喜', '天赦', '天恩', '驿马', '禄神', '国印',
      '天医', '天贵', '天才', '天寿', '天馨', '天钺', '天亨', '天解',
      '天报', '天庆', '天祥', '天佑', '天富', '天爵', '天德合', '月德合'
    ];

    // 凶神列表
    const badShenSha = [
      '天刑', '天哭', '天虚', '咸池', '亡神', '劫煞', '灾煞', '五鬼',
      '天罗', '地网', '地丁', '阴差', '魁罡', '孤辰', '寡宿', '白虎',
      '天狗', '天狱', '天棒', '天姚', '天牢', '天祸', '天煞', '天吏',
      '天奸', '天讼', '羊刃', '金神'
    ];

    // 吉凶神列表（根据不同情况可能吉可能凶）
    const mixedShenSha = [
      '将星', '华盖', '桃花', '三台', '八座', '恩光', '天贵', '台辅',
      '封诰', '天使', '天伤', '天空', '截路', '旬空', '三奇', '六仪',
      '三合', '六合', '暗合', '拱合', '三会', '三刑', '六冲', '暗冲',
      '童子煞', '将军箭', '红艳'
    ];

    // 去除可能的前缀（如"年柱:"）
    const pureShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;

    // 调试信息
    console.log(`判断神煞类型: ${shenSha} -> ${pureShenSha}`);

    if (goodShenSha.includes(pureShenSha)) {
      return '吉神';
    } else if (badShenSha.includes(pureShenSha)) {
      return '凶神';
    } else if (mixedShenSha.includes(pureShenSha)) {
      return '吉凶神';
    }

    return '未知';
  }
}

