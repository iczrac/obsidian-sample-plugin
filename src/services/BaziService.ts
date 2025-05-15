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
   * @returns 八字信息对象（部分信息）
   */
  static parseBaziString(baziStr: string): Partial<BaziInfo> {
    // 清理并分割八字字符串
    const parts = baziStr.replace(/\s+/g, ' ').trim().split(' ');

    if (parts.length !== 4) {
      throw new Error('八字格式不正确，应为"年柱 月柱 日柱 时柱"的格式，如"甲子 乙丑 丙寅 丁卯"');
    }

    return {
      yearPillar: parts[0],
      monthPillar: parts[1],
      dayPillar: parts[2],
      hourPillar: parts[3],
      yearStem: parts[0][0],
      yearBranch: parts[0][1],
      monthStem: parts[1][0],
      monthBranch: parts[1][1],
      dayStem: parts[2][0],
      dayBranch: parts[2][1],
      hourStem: parts[3][0],
      hourBranch: parts[3][1],
    };
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
      <div class="bazi-view-info-item">公历：${baziInfo.solarDate} ${baziInfo.solarTime}</div>
    </div>
    <div class="bazi-view-col">
      <div class="bazi-view-info-item">农历：${baziInfo.lunarDate}</div>
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
        <tr>
          <td class="wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}</td>
        </tr>
        <tr>
          <td>${baziInfo.yearBranch}</td>
          <td>${baziInfo.monthBranch}</td>
          <td>${baziInfo.dayBranch}</td>
          <td>${baziInfo.hourBranch}</td>
        </tr>
        <tr>
          <td>${baziInfo.yearHideGan}</td>
          <td>${baziInfo.monthHideGan}</td>
          <td>${baziInfo.dayHideGan}</td>
          <td>${baziInfo.hourHideGan}</td>
        </tr>
        <tr>
          <td>${baziInfo.yearNaYin}</td>
          <td>${baziInfo.monthNaYin}</td>
          <td>${baziInfo.dayNaYin}</td>
          <td>${baziInfo.hourNaYin}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">五行分析</h4>
    <div class="bazi-view-wuxing-list">
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}(${baziInfo.yearWuXing})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}(${baziInfo.monthWuXing})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}(${baziInfo.dayWuXing})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}(${baziInfo.hourWuXing})</span>
    </div>
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">特殊信息</h4>
    <div class="bazi-view-info-list">
      <div class="bazi-view-info-item">胎元：${baziInfo.taiYuan}（${baziInfo.taiYuanNaYin}）</div>
      <div class="bazi-view-info-item">命宫：${baziInfo.mingGong}（${baziInfo.mingGongNaYin}）</div>
    </div>
  </div>

  <div class="bazi-view-section" style="display: none;">
    <div class="bazi-view-data"
      data-year="${baziInfo.solarDate.split('-')[0]}"
      data-month="${baziInfo.solarDate.split('-')[1]}"
      data-day="${baziInfo.solarDate.split('-')[2]}"
      data-hour="${baziInfo.solarTime.split(':')[0]}">
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
