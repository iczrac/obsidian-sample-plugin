import { Solar, Lunar, EightChar } from 'lunar-typescript';

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
  static getBaziFromDate(year: number, month: number, day: number, hour: number = 0, gender: string = '1', sect: string = '2'): BaziInfo {
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
  static getBaziFromLunarDate(year: number, month: number, day: number, hour: number = 0, isLeapMonth: boolean = false, gender: string = '1', sect: string = '2'): BaziInfo {
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
   * @returns 八字信息对象
   */
  static parseBaziString(baziStr: string, gender: string = '1', sect: string = '2'): BaziInfo {
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

    // 尝试反推日期
    let solarDate = '----年--月--日';
    let lunarDate = '农历----年--月--日';
    let solarTime = '--:--';
    let solar: Solar | null = null;
    let lunar: Lunar | null = null;
    let eightChar: EightChar | null = null;

    try {
      // 使用lunar-typescript库反推日期
      // 注意：这里只是一个估算，因为同一八字可能对应多个日期
      // 我们取最近的一个可能的日期

      // 1. 从年柱估算年份
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 80; // 从80年前开始查找
      const endYear = currentYear + 20;   // 查找到20年后

      // 天干序号（甲=0, 乙=1, ..., 癸=9）
      const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
      // 地支序号（子=0, 丑=1, ..., 亥=11）
      const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);

      // 查找符合年柱的年份
      let matchingYears: number[] = [];
      for (let year = startYear; year <= endYear; year++) {
        // 计算天干序号：年份减去4，除以10的余数
        const stemCheck = (year - 4) % 10;
        // 计算地支序号：年份减去4，除以12的余数
        const branchCheck = (year - 4) % 12;

        if (stemCheck === stemIndex && branchCheck === branchIndex) {
          matchingYears.push(year);
        }
      }

      if (matchingYears.length > 0) {
        // 取最近的年份
        const year = matchingYears[matchingYears.length - 1];

        // 2. 从月柱估算月份
        // 地支对应的月份（寅=1月, 卯=2月, ..., 丑=12月）
        const monthMap: {[key: string]: number} = {
          '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
          '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
        };
        const month = monthMap[monthBranch] || 1;

        // 3. 从时柱估算小时
        // 地支对应的时辰（子=23-1点, 丑=1-3点, ..., 亥=21-23点）
        const hourMap: {[key: string]: number} = {
          '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
          '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22
        };
        const hour = hourMap[hourBranch] || 0;

        // 4. 使用lunar-typescript库查找符合条件的日期
        // 这里简化处理，取月中的第15天
        const day = 15;

        // 创建阳历对象
        solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
        // 转换为农历
        lunar = solar.getLunar();
        // 获取八字
        eightChar = lunar.getEightChar();

        // 格式化日期
        solarDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        lunarDate = lunar.toString();
        solarTime = `${hour.toString().padStart(2, '0')}:00`;
      }
    } catch (error) {
      console.error('反推日期出错:', error);
      // 出错时使用默认值
    }

    // 如果成功反推了日期，使用lunar-typescript库获取更多信息
    if (solar && lunar && eightChar) {
      // 使用formatBaziInfo获取完整的八字信息
      return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
    }

    // 如果反推失败，使用传统方法计算基本信息
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
    return {
      // 基本信息
      solarDate,
      lunarDate,
      solarTime,

      // 八字信息
      yearPillar: parts[0],
      yearStem,
      yearBranch,
      yearHideGan: this.getHideGan(yearBranch),
      yearWuXing,
      yearNaYin,
      yearShengXiao,

      monthPillar: parts[1],
      monthStem,
      monthBranch,
      monthHideGan: this.getHideGan(monthBranch),
      monthWuXing,
      monthNaYin,
      monthShengXiao,

      dayPillar: parts[2],
      dayStem,
      dayBranch,
      dayHideGan: this.getHideGan(dayBranch),
      dayWuXing,
      dayNaYin,
      dayShengXiao,

      hourPillar: parts[3],
      hourStem,
      hourBranch,
      hourHideGan: this.getHideGan(hourBranch),
      hourWuXing,
      hourNaYin,
      hourShengXiao,

      // 特殊信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,

      // 完整信息
      fullString: `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`,

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
  private static getHideGan(branch: string): string {
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
  private static formatBaziInfo(solar: Solar, lunar: Lunar, eightChar: EightChar, gender: string = '1', sect: string = '2'): BaziInfo {
    // 设置八字流派
    eightChar.setSect(parseInt(sect));

    // 年柱
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const yearPillar = yearStem + yearBranch;
    const yearHideGan = eightChar.getYearHideGan().join(',');
    const yearWuXing = eightChar.getYearWuXing();
    const yearNaYin = eightChar.getYearNaYin();
    const yearShiShenGan = eightChar.getYearShiShenGan();
    const yearShiShenZhi = eightChar.getYearShiShenZhi();
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
    const monthHideGan = eightChar.getMonthHideGan().join(',');
    const monthWuXing = eightChar.getMonthWuXing();
    const monthNaYin = eightChar.getMonthNaYin();
    const monthShiShenGan = eightChar.getMonthShiShenGan();
    const monthShiShenZhi = eightChar.getMonthShiShenZhi();
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
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const dayPillar = dayStem + dayBranch;
    const dayHideGan = eightChar.getDayHideGan().join(',');
    const dayWuXing = eightChar.getDayWuXing();
    const dayNaYin = eightChar.getDayNaYin();
    const dayShiShenZhi = eightChar.getDayShiShenZhi();
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
    const hourHideGan = eightChar.getTimeHideGan().join(',');
    const hourWuXing = eightChar.getTimeWuXing();
    const hourNaYin = eightChar.getTimeNaYin();
    const hourShiShenGan = eightChar.getTimeShiShenGan();
    const hourShiShenZhi = eightChar.getTimeShiShenZhi();
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
    const geJuInfo = this.calculateGeJu(eightChar);
    const geJu = geJuInfo?.geJu;
    const geJuDetail = geJuInfo?.detail;

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
          if (this.isYiMa(branch)) {
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
          if (this.isTianXi(branch)) {
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
        shenSha
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
          if (this.isYiMa(branch)) {
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
          if (this.isTianXi(branch)) {
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

      return {
        year,
        age,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong,
        shiShenGan,
        diShi,
        shenSha
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
          if (this.isYiMa(branch)) {
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
          if (this.isTianXi(branch)) {
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

      return {
        year,
        age,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong,
        shiShenGan,
        diShi,
        shenSha
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
          if (this.isYiMa(branch)) {
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
          if (this.isTianXi(branch)) {
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

      return {
        month,
        index,
        ganZhi,
        naYin,
        xunKong,
        shiShenGan,
        diShi,
        shenSha
      };
    });

    // 计算五行强度
    const wuXingStrength = this.calculateWuXingStrength(eightChar);

    // 计算日主旺衰
    const riZhuStrength = this.calculateRiZhuStrength(eightChar);

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

      // 五行强度和日主旺衰
      wuXingStrength,
      riZhuStrength
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
  private static getShiShen(dayStem: string, otherStem: string): string {
    // 阳干：甲丙戊庚壬
    // 阴干：乙丁己辛癸
    const yangGan = '甲丙戊庚壬';

    // 五行生克关系：木火土金水
    const wuXingOrder = '木火土金水';

    // 判断日干阴阳
    const isDayYang = yangGan.includes(dayStem);

    // 获取日干和其他干的五行
    const dayWuXing = this.getStemWuXing(dayStem);
    const otherWuXing = this.getStemWuXing(otherStem);

    // 判断其他干阴阳
    const isOtherYang = yangGan.includes(otherStem);

    // 获取五行索引
    const dayWuXingIndex = wuXingOrder.indexOf(dayWuXing);
    const otherWuXingIndex = wuXingOrder.indexOf(otherWuXing);

    // 计算五行关系
    // 相同五行
    if (dayWuXing === otherWuXing) {
      // 阴阳相同为比肩，阴阳不同为劫财
      return (isDayYang === isOtherYang) ? '比肩' : '劫财';
    }

    // 生我者（前一个五行）
    const shengWoIndex = (dayWuXingIndex - 1 + 5) % 5;
    if (otherWuXingIndex === shengWoIndex) {
      // 阴阳相同为食神，阴阳不同为伤官
      return (isDayYang === isOtherYang) ? '食神' : '伤官';
    }

    // 我生者（后一个五行）
    const woShengIndex = (dayWuXingIndex + 1) % 5;
    if (otherWuXingIndex === woShengIndex) {
      // 阴阳相同为偏财，阴阳不同为正财
      return (isDayYang === isOtherYang) ? '偏财' : '正财';
    }

    // 克我者（后二个五行）
    const keWoIndex = (dayWuXingIndex + 2) % 5;
    if (otherWuXingIndex === keWoIndex) {
      // 阴阳相同为七杀，阴阳不同为正官
      return (isDayYang === isOtherYang) ? '七杀' : '正官';
    }

    // 我克者（前二个五行）
    const woKeIndex = (dayWuXingIndex - 2 + 5) % 5;
    if (otherWuXingIndex === woKeIndex) {
      // 阴阳相同为偏印，阴阳不同为正印
      return (isDayYang === isOtherYang) ? '偏印' : '正印';
    }

    return '未知';
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
   * @returns 五行强度
   */
  private static calculateWuXingStrength(eightChar: EightChar): { jin: number; mu: number; shui: number; huo: number; tu: number } {
    // 这里简化处理，实际应该根据八字命理规则计算
    // 包括天干地支、藏干、纳音等综合评分

    // 简单示例：根据四柱天干的五行计算
    const yearWuXing = eightChar.getYearWuXing();
    const monthWuXing = eightChar.getMonthWuXing();
    const dayWuXing = eightChar.getDayWuXing();
    const timeWuXing = eightChar.getTimeWuXing();

    // 初始化五行强度
    const strength = {
      jin: 0, // 金
      mu: 0,  // 木
      shui: 0, // 水
      huo: 0,  // 火
      tu: 0    // 土
    };

    // 根据天干五行增加强度
    const addStrength = (wuXing: string, value: number) => {
      switch (wuXing) {
        case '金': strength.jin += value; break;
        case '木': strength.mu += value; break;
        case '水': strength.shui += value; break;
        case '火': strength.huo += value; break;
        case '土': strength.tu += value; break;
      }
    };

    // 年柱天干权重为1
    addStrength(yearWuXing, 1);

    // 月柱天干权重为2
    addStrength(monthWuXing, 2);

    // 日柱天干权重为3
    addStrength(dayWuXing, 3);

    // 时柱天干权重为1
    addStrength(timeWuXing, 1);

    return strength;
  }

  /**
   * 计算日主旺衰
   * @param eightChar 八字对象
   * @returns 日主旺衰
   */
  private static calculateRiZhuStrength(eightChar: EightChar): string {
    // 这里简化处理，实际应该根据八字命理规则计算
    // 包括月令、节气、地支组合等因素

    // 获取日干五行
    const dayWuXing = eightChar.getDayWuXing();

    // 获取月支
    const monthBranch = eightChar.getMonthZhi();

    // 简单判断：根据月支与日干五行的关系
    // 月支对应的五行
    const monthWuXing = this.getBranchWuXing(monthBranch);

    // 五行生克关系
    if (this.isWuXingSheng(monthWuXing, dayWuXing)) {
      return '旺'; // 月支五行生日干五行
    } else if (this.isWuXingKe(monthWuXing, dayWuXing)) {
      return '衰'; // 月支五行克日干五行
    } else if (monthWuXing === dayWuXing) {
      return '旺'; // 月支五行与日干五行相同
    } else if (this.isWuXingSheng(dayWuXing, monthWuXing)) {
      return '相'; // 日干五行生月支五行
    } else if (this.isWuXingKe(dayWuXing, monthWuXing)) {
      return '休'; // 日干五行克月支五行
    }

    return '平'; // 默认平
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
    if (this.isYiMa(yearBranch)) {
      yearShenSha.push('驿马');
    }
    if (this.isYiMa(monthBranch)) {
      monthShenSha.push('驿马');
    }
    if (this.isYiMa(dayBranch)) {
      dayShenSha.push('驿马');
    }
    if (this.isYiMa(timeBranch)) {
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
    if (this.isTianXi(yearBranch)) {
      yearShenSha.push('天喜');
    }
    if (this.isTianXi(monthBranch)) {
      monthShenSha.push('天喜');
    }
    if (this.isTianXi(dayBranch)) {
      dayShenSha.push('天喜');
    }
    if (this.isTianXi(timeBranch)) {
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
    const map: {[key: string]: string[]} = {
      '甲': ['丑', '未'],
      '乙': ['子', '申'],
      '丙': ['亥', '酉'],
      '丁': ['亥', '酉'],
      '戊': ['丑', '未'],
      '己': ['子', '申'],
      '庚': ['丑', '未'],
      '辛': ['子', '申'],
      '壬': ['卯', '巳'],
      '癸': ['卯', '巳']
    };

    return map[dayStem]?.includes(branch) || false;
  }

  /**
   * 判断是否为文昌
   * @param branch 地支
   * @returns 是否为文昌
   */
  private static isWenChang(branch: string): boolean {
    return ['巳', '午', '申', '酉'].includes(branch);
  }

  /**
   * 判断是否为华盖
   * @param branch 地支
   * @returns 是否为华盖
   */
  private static isHuaGai(branch: string): boolean {
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
   * @returns 是否为驿马
   */
  private static isYiMa(branch: string): boolean {
    // 驿马与地支的对应关系
    const yiMaMap: {[key: string]: string} = {
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

    // 检查是否为驿马
    return Object.values(yiMaMap).includes(branch);
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
   * @returns 是否为天喜
   */
  private static isTianXi(branch: string): boolean {
    // 天喜与地支的对应关系
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

    return Object.values(tianXiMap).includes(branch);
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
    const yangRenMap: {[key: string]: string} = {
      '甲': '卯',
      '乙': '寅',
      '丙': '巳',
      '丁': '辰',
      '戊': '巳',
      '己': '辰',
      '庚': '酉',
      '辛': '申',
      '壬': '亥',
      '癸': '戌'
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
    const tianMaMap: {[key: string]: string} = {
      '子': '午',
      '丑': '未',
      '寅': '申',
      '卯': '酉',
      '辰': '戌',
      '巳': '亥',
      '午': '子',
      '未': '丑',
      '申': '寅',
      '酉': '卯',
      '戌': '辰',
      '亥': '巳'
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
   * 计算八字格局
   * @param eightChar 八字对象
   * @returns 格局信息
   */
  private static calculateGeJu(eightChar: EightChar): { geJu: string; detail: string } {
    // 获取日干和五行
    const dayStem = eightChar.getDayGan();
    const dayWuXing = eightChar.getDayWuXing();

    // 获取四柱天干和五行
    const yearStem = eightChar.getYearGan();
    const yearWuXing = eightChar.getYearWuXing();
    const monthStem = eightChar.getMonthGan();
    const monthWuXing = eightChar.getMonthWuXing();
    const timeStem = eightChar.getTimeGan();
    const timeWuXing = eightChar.getTimeWuXing();

    // 获取四柱地支和五行
    const yearBranch = eightChar.getYearZhi();
    const yearBranchWuXing = this.getBranchWuXing(yearBranch);
    const monthBranch = eightChar.getMonthZhi();
    const monthBranchWuXing = this.getBranchWuXing(monthBranch);
    const dayBranch = eightChar.getDayZhi();
    const dayBranchWuXing = this.getBranchWuXing(dayBranch);
    const timeBranch = eightChar.getTimeZhi();
    const timeBranchWuXing = this.getBranchWuXing(timeBranch);

    // 计算五行个数
    const wuXingCount = {
      '金': 0,
      '木': 0,
      '水': 0,
      '火': 0,
      '土': 0
    };

    // 天干五行
    if (yearWuXing === '金') wuXingCount['金']++;
    if (yearWuXing === '木') wuXingCount['木']++;
    if (yearWuXing === '水') wuXingCount['水']++;
    if (yearWuXing === '火') wuXingCount['火']++;
    if (yearWuXing === '土') wuXingCount['土']++;

    if (monthWuXing === '金') wuXingCount['金']++;
    if (monthWuXing === '木') wuXingCount['木']++;
    if (monthWuXing === '水') wuXingCount['水']++;
    if (monthWuXing === '火') wuXingCount['火']++;
    if (monthWuXing === '土') wuXingCount['土']++;

    if (dayWuXing === '金') wuXingCount['金']++;
    if (dayWuXing === '木') wuXingCount['木']++;
    if (dayWuXing === '水') wuXingCount['水']++;
    if (dayWuXing === '火') wuXingCount['火']++;
    if (dayWuXing === '土') wuXingCount['土']++;

    if (timeWuXing === '金') wuXingCount['金']++;
    if (timeWuXing === '木') wuXingCount['木']++;
    if (timeWuXing === '水') wuXingCount['水']++;
    if (timeWuXing === '火') wuXingCount['火']++;
    if (timeWuXing === '土') wuXingCount['土']++;

    // 地支五行
    if (yearBranchWuXing === '金') wuXingCount['金']++;
    if (yearBranchWuXing === '木') wuXingCount['木']++;
    if (yearBranchWuXing === '水') wuXingCount['水']++;
    if (yearBranchWuXing === '火') wuXingCount['火']++;
    if (yearBranchWuXing === '土') wuXingCount['土']++;

    if (monthBranchWuXing === '金') wuXingCount['金']++;
    if (monthBranchWuXing === '木') wuXingCount['木']++;
    if (monthBranchWuXing === '水') wuXingCount['水']++;
    if (monthBranchWuXing === '火') wuXingCount['火']++;
    if (monthBranchWuXing === '土') wuXingCount['土']++;

    if (dayBranchWuXing === '金') wuXingCount['金']++;
    if (dayBranchWuXing === '木') wuXingCount['木']++;
    if (dayBranchWuXing === '水') wuXingCount['水']++;
    if (dayBranchWuXing === '火') wuXingCount['火']++;
    if (dayBranchWuXing === '土') wuXingCount['土']++;

    if (timeBranchWuXing === '金') wuXingCount['金']++;
    if (timeBranchWuXing === '木') wuXingCount['木']++;
    if (timeBranchWuXing === '水') wuXingCount['水']++;
    if (timeBranchWuXing === '火') wuXingCount['火']++;
    if (timeBranchWuXing === '土') wuXingCount['土']++;

    // 判断格局
    // 1. 日主旺衰
    const riZhuStrength = this.calculateRiZhuStrength(eightChar);

    // 2. 五行缺失
    const missingWuXing = Object.keys(wuXingCount).filter(key => wuXingCount[key as keyof typeof wuXingCount] === 0);

    // 3. 特殊格局判断

    // 3.1 七杀格
    if (this.isQiShaGe(eightChar)) {
      return {
        geJu: '七杀格',
        detail: '八字中有七杀，且七杀有力，日主衰弱。'
      };
    }

    // 3.2 正官格
    if (this.isZhengGuanGe(eightChar)) {
      return {
        geJu: '正官格',
        detail: '八字中有正官，且正官有力，日主衰弱。'
      };
    }

    // 3.3 偏印格
    if (this.isPianYinGe(eightChar)) {
      return {
        geJu: '偏印格',
        detail: '八字中有偏印，且偏印有力，日主衰弱。'
      };
    }

    // 3.4 正印格
    if (this.isZhengYinGe(eightChar)) {
      return {
        geJu: '正印格',
        detail: '八字中有正印，且正印有力，日主衰弱。'
      };
    }

    // 3.5 食神格
    if (this.isShiShenGe(eightChar)) {
      return {
        geJu: '食神格',
        detail: '八字中有食神，且食神有力，日主旺盛。'
      };
    }

    // 3.6 伤官格
    if (this.isShangGuanGe(eightChar)) {
      return {
        geJu: '伤官格',
        detail: '八字中有伤官，且伤官有力，日主旺盛。'
      };
    }

    // 3.7 偏财格
    if (this.isPianCaiGe(eightChar)) {
      return {
        geJu: '偏财格',
        detail: '八字中有偏财，且偏财有力，日主旺盛。'
      };
    }

    // 3.8 正财格
    if (this.isZhengCaiGe(eightChar)) {
      return {
        geJu: '正财格',
        detail: '八字中有正财，且正财有力，日主旺盛。'
      };
    }

    // 3.9 比肩格
    if (this.isBiJianGe(eightChar)) {
      return {
        geJu: '比肩格',
        detail: '八字中有比肩，且比肩有力，日主旺盛。'
      };
    }

    // 3.10 劫财格
    if (this.isJieCaiGe(eightChar)) {
      return {
        geJu: '劫财格',
        detail: '八字中有劫财，且劫财有力，日主旺盛。'
      };
    }

    // 默认格局
    if (riZhuStrength === '旺' || riZhuStrength === '相') {
      return {
        geJu: '日主旺相',
        detail: '日主旺盛或相旺，需要抑制。'
      };
    } else if (riZhuStrength === '衰' || riZhuStrength === '休') {
      return {
        geJu: '日主衰弱',
        detail: '日主衰弱或休囚，需要扶助。'
      };
    } else {
      return {
        geJu: '日主平和',
        detail: '日主平和，需要根据具体情况调整。'
      };
    }
  }

  /**
   * 判断是否为七杀格
   * @param eightChar 八字对象
   * @returns 是否为七杀格
   */
  private static isQiShaGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有七杀
    return this.getShiShen(dayStem, yearStem) === '七杀' ||
           this.getShiShen(dayStem, monthStem) === '七杀' ||
           this.getShiShen(dayStem, timeStem) === '七杀';
  }

  /**
   * 判断是否为正官格
   * @param eightChar 八字对象
   * @returns 是否为正官格
   */
  private static isZhengGuanGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有正官
    return this.getShiShen(dayStem, yearStem) === '正官' ||
           this.getShiShen(dayStem, monthStem) === '正官' ||
           this.getShiShen(dayStem, timeStem) === '正官';
  }

  /**
   * 判断是否为偏印格
   * @param eightChar 八字对象
   * @returns 是否为偏印格
   */
  private static isPianYinGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有偏印
    return this.getShiShen(dayStem, yearStem) === '偏印' ||
           this.getShiShen(dayStem, monthStem) === '偏印' ||
           this.getShiShen(dayStem, timeStem) === '偏印';
  }

  /**
   * 判断是否为正印格
   * @param eightChar 八字对象
   * @returns 是否为正印格
   */
  private static isZhengYinGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有正印
    return this.getShiShen(dayStem, yearStem) === '正印' ||
           this.getShiShen(dayStem, monthStem) === '正印' ||
           this.getShiShen(dayStem, timeStem) === '正印';
  }

  /**
   * 判断是否为食神格
   * @param eightChar 八字对象
   * @returns 是否为食神格
   */
  private static isShiShenGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有食神
    return this.getShiShen(dayStem, yearStem) === '食神' ||
           this.getShiShen(dayStem, monthStem) === '食神' ||
           this.getShiShen(dayStem, timeStem) === '食神';
  }

  /**
   * 判断是否为伤官格
   * @param eightChar 八字对象
   * @returns 是否为伤官格
   */
  private static isShangGuanGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有伤官
    return this.getShiShen(dayStem, yearStem) === '伤官' ||
           this.getShiShen(dayStem, monthStem) === '伤官' ||
           this.getShiShen(dayStem, timeStem) === '伤官';
  }

  /**
   * 判断是否为偏财格
   * @param eightChar 八字对象
   * @returns 是否为偏财格
   */
  private static isPianCaiGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有偏财
    return this.getShiShen(dayStem, yearStem) === '偏财' ||
           this.getShiShen(dayStem, monthStem) === '偏财' ||
           this.getShiShen(dayStem, timeStem) === '偏财';
  }

  /**
   * 判断是否为正财格
   * @param eightChar 八字对象
   * @returns 是否为正财格
   */
  private static isZhengCaiGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有正财
    return this.getShiShen(dayStem, yearStem) === '正财' ||
           this.getShiShen(dayStem, monthStem) === '正财' ||
           this.getShiShen(dayStem, timeStem) === '正财';
  }

  /**
   * 判断是否为比肩格
   * @param eightChar 八字对象
   * @returns 是否为比肩格
   */
  private static isBiJianGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有比肩
    return this.getShiShen(dayStem, yearStem) === '比肩' ||
           this.getShiShen(dayStem, monthStem) === '比肩' ||
           this.getShiShen(dayStem, timeStem) === '比肩';
  }

  /**
   * 判断是否为劫财格
   * @param eightChar 八字对象
   * @returns 是否为劫财格
   */
  private static isJieCaiGe(eightChar: EightChar): boolean {
    // 简化判断，实际应该根据八字命理规则计算
    const dayStem = eightChar.getDayGan();
    const yearStem = eightChar.getYearGan();
    const monthStem = eightChar.getMonthGan();
    const timeStem = eightChar.getTimeGan();

    // 判断是否有劫财
    return this.getShiShen(dayStem, yearStem) === '劫财' ||
           this.getShiShen(dayStem, monthStem) === '劫财' ||
           this.getShiShen(dayStem, timeStem) === '劫财';
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
    return (from === '木' && to === '火') ||
           (from === '火' && to === '土') ||
           (from === '土' && to === '金') ||
           (from === '金' && to === '水') ||
           (from === '水' && to === '木');
  }

  /**
   * 判断五行是否相克
   * @param from 源五行
   * @param to 目标五行
   * @returns 是否相克
   */
  private static isWuXingKe(from: string, to: string): boolean {
    // 五行相克：木克土，土克水，水克火，火克金，金克木
    return (from === '木' && to === '土') ||
           (from === '土' && to === '水') ||
           (from === '水' && to === '火') ||
           (from === '火' && to === '金') ||
           (from === '金' && to === '木');
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
          <td class="wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}</td>
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
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}(${baziInfo.yearWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}(${baziInfo.monthWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}(${baziInfo.dayWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}(${baziInfo.hourWuXing || '未知'})</span>
    </div>
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
          ${baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startYear}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startAge}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.daYun.slice(0, 10).map((dy, index) => `
            <td class="bazi-dayun-cell" data-index="${index}">${dy.ganZhi}</td>
          `).join('')}
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
}

/**
 * 八字信息接口
 */
export interface BaziInfo {
  // 基本信息
  solarDate: string;
  lunarDate: string;
  solarTime: string;

  // 八字信息
  yearPillar: string;
  yearStem: string;
  yearBranch: string;
  yearHideGan: string;
  yearWuXing: string;
  yearNaYin: string;

  monthPillar: string;
  monthStem: string;
  monthBranch: string;
  monthHideGan: string;
  monthWuXing: string;
  monthNaYin: string;

  dayPillar: string;
  dayStem: string;
  dayBranch: string;
  dayHideGan: string;
  dayWuXing: string;
  dayNaYin: string;

  hourPillar: string;
  hourStem: string;
  hourBranch: string;
  hourHideGan: string;
  hourWuXing: string;
  hourNaYin: string;

  // 特殊信息
  taiYuan: string;
  taiYuanNaYin: string;
  mingGong: string;
  mingGongNaYin: string;
  shenGong?: string;       // 身宫

  // 完整信息
  fullString: string;

  // 可选属性 - 用于设置和显示
  showWuxing?: boolean;
  showSpecialInfo?: boolean;
  gender?: string;
  calculationMethod?: string;
  baziSect?: string;       // 八字流派 1或2

  // 原始日期信息 - 用于代码块更新
  originalDate?: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };

  // 扩展信息 - 参考6tail.cn API
  // 十二长生
  yearShengXiao?: string;  // 年生肖
  monthShengXiao?: string; // 月生肖
  dayShengXiao?: string;   // 日生肖
  hourShengXiao?: string;  // 时生肖

  // 十神
  yearShiShen?: string;    // 年十神
  monthShiShen?: string;   // 月十神
  dayShiShen?: string;     // 日十神
  hourShiShen?: string;    // 时十神

  // 地支十神（藏干）
  yearShiShenZhi?: string[];  // 年支十神
  monthShiShenZhi?: string[]; // 月支十神
  dayShiShenZhi?: string[];   // 日支十神
  hourShiShenZhi?: string[];  // 时支十神

  // 地势（长生十二神）
  yearDiShi?: string;      // 年柱地势
  monthDiShi?: string;     // 月柱地势
  dayDiShi?: string;       // 日柱地势
  timeDiShi?: string;      // 时柱地势

  // 旬空（空亡）
  yearXunKong?: string;    // 年柱旬空
  monthXunKong?: string;   // 月柱旬空
  dayXunKong?: string;     // 日柱旬空
  timeXunKong?: string;    // 时柱旬空

  // 星座
  zodiac?: string;         // 星座

  // 节气
  jieQi?: string;          // 节气
  nextJieQi?: string;      // 下一节气

  // 吉凶
  dayYi?: string[];        // 宜
  dayJi?: string[];        // 忌

  // 神煞
  shenSha?: string[];      // 神煞

  // 胎息
  taiXi?: string;          // 胎息

  // 起运信息
  qiYunYear?: number;      // 起运年数
  qiYunMonth?: number;     // 起运月数
  qiYunDay?: number;       // 起运天数
  qiYunHour?: number;      // 起运小时数
  qiYunDate?: string;      // 起运日期
  qiYunAge?: number;       // 起运年龄

  // 大运
  daYun?: {
    startYear: number;     // 大运起始年
    endYear: number;       // 大运结束年
    startAge: number;      // 大运起始年龄
    endAge: number;        // 大运结束年龄
    index: number;         // 第几轮大运
    ganZhi: string;        // 大运干支
    naYin: string;         // 大运纳音
    xunKong?: string;      // 旬空
  }[];

  // 流年
  liuNian?: {
    year: number;          // 流年
    age: number;           // 年龄
    index: number;         // 位于当前大运中的序号
    ganZhi: string;        // 流年干支
    naYin: string;         // 流年纳音
    xunKong?: string;      // 旬空
  }[];

  // 小运
  xiaoYun?: {
    year: number;          // 年份
    age: number;           // 年龄
    index: number;         // 位于当前大运中的序号
    ganZhi: string;        // 干支
    xunKong?: string;      // 旬空
  }[];

  // 流月
  liuYue?: {
    month: string;         // 中文月份
    index: number;         // 月序号
    ganZhi: string;        // 干支
    xunKong?: string;      // 旬空
  }[];

  // 四柱五行强度
  wuXingStrength?: {
    jin: number;           // 金
    mu: number;            // 木
    shui: number;          // 水
    huo: number;           // 火
    tu: number;            // 土
  };

  // 日主旺衰
  riZhuStrength?: string;  // 日主旺衰
}
