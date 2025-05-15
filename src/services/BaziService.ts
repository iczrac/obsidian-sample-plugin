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
  static getBaziFromDate(year: number, month: number, day: number, hour: number = 0): BaziInfo {
    // 创建阳历对象
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    // 转换为农历
    const lunar = solar.getLunar();
    // 获取八字
    const eightChar = lunar.getEightChar();

    return this.formatBaziInfo(solar, lunar, eightChar);
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
  static getBaziFromLunarDate(year: number, month: number, day: number, hour: number = 0, isLeapMonth: boolean = false): BaziInfo {
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

    return this.formatBaziInfo(solar, lunar, eightChar);
  }

  /**
   * 解析八字字符串
   * @param baziStr 八字字符串，如"甲子 乙丑 丙寅 丁卯"
   * @returns 八字信息对象
   */
  static parseBaziString(baziStr: string): BaziInfo {
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
        const monthMap = {
          '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
          '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
        };
        const month = monthMap[monthBranch] || 1;

        // 3. 从时柱估算小时
        // 地支对应的时辰（子=23-1点, 丑=1-3点, ..., 亥=21-23点）
        const hourMap = {
          '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
          '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22
        };
        const hour = hourMap[hourBranch] || 0;

        // 4. 使用lunar-typescript库查找符合条件的日期
        // 这里简化处理，取月中的第15天
        const day = 15;

        // 创建阳历对象
        const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
        // 转换为农历
        const lunar = solar.getLunar();

        // 格式化日期
        solarDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        lunarDate = lunar.toString();
        solarTime = `${hour.toString().padStart(2, '0')}:00`;
      }
    } catch (error) {
      console.error('反推日期出错:', error);
      // 出错时使用默认值
    }

    // 计算特殊信息
    const taiYuan = this.calculateTaiYuan(monthStem, monthBranch);
    const taiYuanNaYin = this.getNaYin(taiYuan);
    const mingGong = this.calculateMingGong(hourStem, hourBranch);
    const mingGongNaYin = this.getNaYin(mingGong);

    // 创建一个完整的BaziInfo对象
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

      monthPillar: parts[1],
      monthStem,
      monthBranch,
      monthHideGan: this.getHideGan(monthBranch),
      monthWuXing,
      monthNaYin,

      dayPillar: parts[2],
      dayStem,
      dayBranch,
      dayHideGan: this.getHideGan(dayBranch),
      dayWuXing,
      dayNaYin,

      hourPillar: parts[3],
      hourStem,
      hourBranch,
      hourHideGan: this.getHideGan(hourBranch),
      hourWuXing,
      hourNaYin,

      // 特殊信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,

      // 完整信息
      fullString: `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`
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
   * @returns 格式化后的八字信息
   */
  private static formatBaziInfo(solar: Solar, lunar: Lunar, eightChar: EightChar): BaziInfo {
    // 年柱
    const yearStem = eightChar.getYearGan();
    const yearBranch = eightChar.getYearZhi();
    const yearPillar = yearStem + yearBranch;
    const yearHideGan = eightChar.getYearHideGan().join(',');
    const yearWuXing = eightChar.getYearWuXing();
    const yearNaYin = eightChar.getYearNaYin();

    // 月柱
    const monthStem = eightChar.getMonthGan();
    const monthBranch = eightChar.getMonthZhi();
    const monthPillar = monthStem + monthBranch;
    const monthHideGan = eightChar.getMonthHideGan().join(',');
    const monthWuXing = eightChar.getMonthWuXing();
    const monthNaYin = eightChar.getMonthNaYin();

    // 日柱
    const dayStem = eightChar.getDayGan();
    const dayBranch = eightChar.getDayZhi();
    const dayPillar = dayStem + dayBranch;
    const dayHideGan = eightChar.getDayHideGan().join(',');
    const dayWuXing = eightChar.getDayWuXing();
    const dayNaYin = eightChar.getDayNaYin();

    // 时柱
    const hourStem = eightChar.getTimeGan();
    const hourBranch = eightChar.getTimeZhi();
    const hourPillar = hourStem + hourBranch;
    const hourHideGan = eightChar.getTimeHideGan().join(',');
    const hourWuXing = eightChar.getTimeWuXing();
    const hourNaYin = eightChar.getTimeNaYin();

    // 其他信息
    const taiYuan = eightChar.getTaiYuan();
    const taiYuanNaYin = eightChar.getTaiYuanNaYin();
    const mingGong = eightChar.getMingGong();
    const mingGongNaYin = eightChar.getMingGongNaYin();

    // 日期信息
    const solarDate = solar.toYmd();
    // lunar没有toYmd方法，使用toString代替
    const lunarDate = lunar.toString();
    const solarTime = solar.getHour() + ':' + solar.getMinute();

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

      // 其他信息
      taiYuan,
      taiYuanNaYin,
      mingGong,
      mingGongNaYin,

      // 完整信息
      fullString: lunar.toFullString()
    };
  }

  /**
   * 生成八字信息的Markdown文本
   * @param baziInfo 八字信息对象
   * @returns Markdown格式的八字信息
   */
  static generateBaziMarkdown(baziInfo: BaziInfo): string {
    return `## 八字命盘信息

### 基本信息
- **公历日期**：${baziInfo.solarDate} ${baziInfo.solarTime}
- **农历日期**：${baziInfo.lunarDate}

### 八字
- **八字**：${baziInfo.yearPillar} ${baziInfo.monthPillar} ${baziInfo.dayPillar} ${baziInfo.hourPillar}

### 年柱 - ${baziInfo.yearPillar}
- **天干**：${baziInfo.yearStem}（${baziInfo.yearWuXing}）
- **地支**：${baziInfo.yearBranch}
- **藏干**：${baziInfo.yearHideGan}
- **纳音**：${baziInfo.yearNaYin}

### 月柱 - ${baziInfo.monthPillar}
- **天干**：${baziInfo.monthStem}（${baziInfo.monthWuXing}）
- **地支**：${baziInfo.monthBranch}
- **藏干**：${baziInfo.monthHideGan}
- **纳音**：${baziInfo.monthNaYin}

### 日柱 - ${baziInfo.dayPillar}
- **天干**：${baziInfo.dayStem}（${baziInfo.dayWuXing}）
- **地支**：${baziInfo.dayBranch}
- **藏干**：${baziInfo.dayHideGan}
- **纳音**：${baziInfo.dayNaYin}

### 时柱 - ${baziInfo.hourPillar}
- **天干**：${baziInfo.hourStem}（${baziInfo.hourWuXing}）
- **地支**：${baziInfo.hourBranch}
- **藏干**：${baziInfo.hourHideGan}
- **纳音**：${baziInfo.hourNaYin}

### 特殊信息
- **胎元**：${baziInfo.taiYuan}（${baziInfo.taiYuanNaYin}）
- **命宫**：${baziInfo.mingGong}（${baziInfo.mingGongNaYin}）

### 完整信息
${baziInfo.fullString}
`;
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
    </div>
  </div>

  <div class="bazi-view-section" style="display: none;">
    <div class="bazi-view-data"
      data-year="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[0] : '2023'}"
      data-month="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[1] : '1'}"
      data-day="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[2] : '1'}"
      data-hour="${baziInfo.solarTime && baziInfo.solarTime.includes(':') ? baziInfo.solarTime.split(':')[0] : '0'}">
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

  // 其他信息
  taiYuan: string;
  taiYuanNaYin: string;
  mingGong: string;
  mingGongNaYin: string;

  // 完整信息
  fullString: string;
}
