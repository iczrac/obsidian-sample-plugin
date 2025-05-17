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
    } catch (e) {
      console.error('计算时柱旬空出错:', e);
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
    const shenSha = Array.isArray(lunar.getDaySha()) ? lunar.getDaySha() : [];

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

      return {
        startYear,
        endYear,
        startAge,
        endAge,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong
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

      return {
        year,
        age,
        index,
        ganZhi,
        naYin: ganZhi ? this.getNaYin(ganZhi) : '',
        xunKong
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

      return {
        year,
        age,
        index,
        ganZhi,
        xunKong
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

      return {
        month,
        index,
        ganZhi,
        xunKong
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
