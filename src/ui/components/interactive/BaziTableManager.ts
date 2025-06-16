import { BaziInfo } from '../../../types/BaziInfo';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';
import { ShiShenCalculator } from '../../../services/bazi/ShiShenCalculator';
import { BaziUtils } from '../../../services/bazi/BaziUtils';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';

/**
 * 八字表格管理器
 * 负责创建和管理主要的八字表格
 */
export class BaziTableManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private baziTable: HTMLTableElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo) {
    this.container = container;
    this.baziInfo = baziInfo;
  }

  /**
   * 创建八字表格
   */
  createBaziTable(): HTMLTableElement {
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section' });

    // 添加基本信息（公历、农历、性别）
    const basicInfoDiv = tableSection.createDiv({ cls: 'bazi-basic-info' });

    if (this.baziInfo.solarDate) {
      basicInfoDiv.createSpan({
        text: `公历: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || ''}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.lunarDate) {
      basicInfoDiv.createSpan({
        text: `农历: ${this.baziInfo.lunarDate}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.gender) {
      basicInfoDiv.createSpan({
        text: `性别: ${this.baziInfo.gender === '1' ? '男' : '女'}`,
        cls: 'bazi-basic-info-item'
      });
    }

    // 创建表格
    const table = tableSection.createEl('table', { cls: 'bazi-view-table' });
    this.baziTable = table;

    // 创建表头
    this.createTableHeader(table);

    // 创建表体
    this.createTableBody(table);

    return table;
  }

  /**
   * 创建表头
   */
  private createTableHeader(table: HTMLTableElement) {
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');

    // 添加左侧标题栏
    headerRow.createEl('th', { text: '信息', cls: 'bazi-table-label' });

    // 添加四柱表头
    ['年柱', '月柱', '日柱', '时柱'].forEach(text => {
      headerRow.createEl('th', { text });
    });
  }

  /**
   * 创建表体
   */
  private createTableBody(table: HTMLTableElement) {
    const tbody = table.createEl('tbody');

    // 创建各行
    this.createStemRow(tbody);
    this.createBranchRow(tbody);
    this.createHideGanRow(tbody);
    this.createShiShenRow(tbody);
    this.createDiShiRow(tbody);
    this.createNaYinRow(tbody);
    this.createXunKongRow(tbody);
    this.createShengXiaoRow(tbody);
    this.createShenShaRow(tbody);
  }

  /**
   * 创建天干行
   */
  private createStemRow(tbody: HTMLElement) {
    const stemRow = tbody.createEl('tr', { cls: 'bazi-stem-row' });
    stemRow.createEl('td', { text: '天干', cls: 'bazi-table-label' });

    // 天干行 - 直接在td元素上设置颜色
    const yearStemCell = stemRow.createEl('td', { text: this.baziInfo.yearStem || '' });
    this.applyStemWuXingColor(yearStemCell, this.baziInfo.yearStem || '');

    const monthStemCell = stemRow.createEl('td', { text: this.baziInfo.monthStem || '' });
    this.applyStemWuXingColor(monthStemCell, this.baziInfo.monthStem || '');

    const dayStemCell = stemRow.createEl('td', { text: this.baziInfo.dayStem || '' });
    this.applyStemWuXingColor(dayStemCell, this.baziInfo.dayStem || '');

    const timeStemCell = stemRow.createEl('td', { text: this.baziInfo.timeStem || '' });
    this.applyStemWuXingColor(timeStemCell, this.baziInfo.timeStem || '');
  }

  /**
   * 创建地支行
   */
  private createBranchRow(tbody: HTMLElement) {
    const branchRow = tbody.createEl('tr', { cls: 'bazi-branch-row' });
    branchRow.createEl('td', { text: '地支', cls: 'bazi-table-label' });

    // 地支行 - 直接在td元素上设置颜色
    const yearBranchCell = branchRow.createEl('td', { text: this.baziInfo.yearBranch || '' });
    this.applyBranchWuXingColor(yearBranchCell, this.baziInfo.yearBranch || '');

    const monthBranchCell = branchRow.createEl('td', { text: this.baziInfo.monthBranch || '' });
    this.applyBranchWuXingColor(monthBranchCell, this.baziInfo.monthBranch || '');

    const dayBranchCell = branchRow.createEl('td', { text: this.baziInfo.dayBranch || '' });
    this.applyBranchWuXingColor(dayBranchCell, this.baziInfo.dayBranch || '');

    const timeBranchCell = branchRow.createEl('td', { text: this.baziInfo.timeBranch || '' });
    this.applyBranchWuXingColor(timeBranchCell, this.baziInfo.timeBranch || '');
  }

  /**
   * 创建藏干行
   */
  private createHideGanRow(tbody: HTMLElement) {
    const hideGanRow = tbody.createEl('tr', { cls: 'bazi-hidegan-row' });
    hideGanRow.createEl('td', { text: '藏干', cls: 'bazi-table-label' });

    // 年柱藏干
    const yearHideGanText = Array.isArray(this.baziInfo.yearHideGan) ? this.baziInfo.yearHideGan.join('') : (this.baziInfo.yearHideGan || '');
    const yearHideGanCell = hideGanRow.createEl('td');
    this.createColoredHideGan(yearHideGanCell, yearHideGanText);

    // 月柱藏干
    const monthHideGanText = Array.isArray(this.baziInfo.monthHideGan) ? this.baziInfo.monthHideGan.join('') : (this.baziInfo.monthHideGan || '');
    const monthHideGanCell = hideGanRow.createEl('td');
    this.createColoredHideGan(monthHideGanCell, monthHideGanText);

    // 日柱藏干
    const dayHideGanText = Array.isArray(this.baziInfo.dayHideGan) ? this.baziInfo.dayHideGan.join('') : (this.baziInfo.dayHideGan || '');
    const dayHideGanCell = hideGanRow.createEl('td');
    this.createColoredHideGan(dayHideGanCell, dayHideGanText);

    // 时柱藏干
    const timeHideGanText = Array.isArray(this.baziInfo.timeHideGan) ? this.baziInfo.timeHideGan.join('') : (this.baziInfo.timeHideGan || '');
    const timeHideGanCell = hideGanRow.createEl('td');
    this.createColoredHideGan(timeHideGanCell, timeHideGanText);
  }

  /**
   * 创建十神行
   */
  private createShiShenRow(tbody: HTMLElement) {
    const shiShenRow = tbody.createEl('tr', { cls: 'bazi-shishen-row' });
    shiShenRow.createEl('td', { text: '十神', cls: 'bazi-table-label' });

    // 调试：检查十神数据
    console.log('🔍🔍🔍 BaziTableManager 十神数据检查开始 🔍🔍🔍');
    console.log('yearShiShenGan:', this.baziInfo.yearShiShenGan);
    console.log('monthShiShenGan:', this.baziInfo.monthShiShenGan);
    console.log('dayShiShen:', this.baziInfo.dayShiShen);
    console.log('dayShiShenGan:', this.baziInfo.dayShiShenGan);
    console.log('timeShiShenGan:', this.baziInfo.timeShiShenGan);
    console.log('🔍🔍🔍 BaziTableManager 十神数据检查结束 🔍🔍🔍');

    // 年柱十神
    const yearShiShenCell = shiShenRow.createEl('td');
    // 天干十神
    if (this.baziInfo.yearShiShenGan) {
      const yearShiShenSpan = yearShiShenCell.createSpan({
        text: this.baziInfo.yearShiShenGan,
        cls: 'shishen-tag-small'
      });
      this.applyShiShenColor(yearShiShenSpan, this.baziInfo.yearShiShenGan);
    }
    // 换行
    yearShiShenCell.createEl('br');
    // 地支藏干十神
    if (this.baziInfo.yearShiShenZhi && Array.isArray(this.baziInfo.yearShiShenZhi) && this.baziInfo.yearShiShenZhi.length > 0) {
      const yearShiShenZhiSpan = yearShiShenCell.createSpan({
        text: this.baziInfo.yearShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
      // 为藏干十神也应用颜色（使用第一个十神的颜色）
      if (this.baziInfo.yearShiShenZhi.length > 0) {
        this.applyShiShenColor(yearShiShenZhiSpan, this.baziInfo.yearShiShenZhi[0]);
      }
    }

    // 月柱十神
    const monthShiShenCell = shiShenRow.createEl('td');
    if (this.baziInfo.monthShiShenGan) {
      const monthShiShenSpan = monthShiShenCell.createSpan({
        text: this.baziInfo.monthShiShenGan,
        cls: 'shishen-tag-small'
      });
      this.applyShiShenColor(monthShiShenSpan, this.baziInfo.monthShiShenGan);
    }
    monthShiShenCell.createEl('br');
    if (this.baziInfo.monthShiShenZhi && Array.isArray(this.baziInfo.monthShiShenZhi) && this.baziInfo.monthShiShenZhi.length > 0) {
      const monthShiShenZhiSpan = monthShiShenCell.createSpan({
        text: this.baziInfo.monthShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
      if (this.baziInfo.monthShiShenZhi.length > 0) {
        this.applyShiShenColor(monthShiShenZhiSpan, this.baziInfo.monthShiShenZhi[0]);
      }
    }

    // 日柱十神
    const dayShiShenCell = shiShenRow.createEl('td');
    // 优先使用dayShiShen（应该是"日主"），如果没有则使用dayShiShenGan
    const dayShiShenText = this.baziInfo.dayShiShen || this.baziInfo.dayShiShenGan || '日主';
    const dayShiShenSpan = dayShiShenCell.createSpan({
      text: dayShiShenText,
      cls: 'shishen-tag-small'
    });
    this.applyShiShenColor(dayShiShenSpan, dayShiShenText);
    dayShiShenCell.createEl('br');
    if (this.baziInfo.dayShiShenZhi && Array.isArray(this.baziInfo.dayShiShenZhi) && this.baziInfo.dayShiShenZhi.length > 0) {
      const dayShiShenZhiSpan = dayShiShenCell.createSpan({
        text: this.baziInfo.dayShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
      if (this.baziInfo.dayShiShenZhi.length > 0) {
        this.applyShiShenColor(dayShiShenZhiSpan, this.baziInfo.dayShiShenZhi[0]);
      }
    }

    // 时柱十神
    const timeShiShenCell = shiShenRow.createEl('td');
    if (this.baziInfo.timeShiShenGan) {
      const timeShiShenSpan = timeShiShenCell.createSpan({
        text: this.baziInfo.timeShiShenGan,
        cls: 'shishen-tag-small'
      });
      this.applyShiShenColor(timeShiShenSpan, this.baziInfo.timeShiShenGan);
    }
    timeShiShenCell.createEl('br');
    if (this.baziInfo.timeShiShenZhi && Array.isArray(this.baziInfo.timeShiShenZhi) && this.baziInfo.timeShiShenZhi.length > 0) {
      const timeShiShenZhiSpan = timeShiShenCell.createSpan({
        text: this.baziInfo.timeShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
      if (this.baziInfo.timeShiShenZhi.length > 0) {
        this.applyShiShenColor(timeShiShenZhiSpan, this.baziInfo.timeShiShenZhi[0]);
      }
    }
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(tbody: HTMLElement) {
    const diShiRow = tbody.createEl('tr', { cls: 'bazi-dishi-row' });

    // 创建可点击的标签
    const labelCell = diShiRow.createEl('td', { cls: 'bazi-table-label bazi-changsheng-label' });
    labelCell.textContent = '地势';
    labelCell.setAttribute('title', '日干在各地支的十二长生状态 (点击切换)');
    labelCell.style.cursor = 'pointer';

    // 调试：检查地势数据
    console.log('🔍 BaziTableManager 地势数据检查:');
    console.log('yearDiShi:', this.baziInfo.yearDiShi);
    console.log('monthDiShi:', this.baziInfo.monthDiShi);
    console.log('dayDiShi:', this.baziInfo.dayDiShi);
    console.log('timeDiShi:', this.baziInfo.timeDiShi);

    // 年柱地势
    const yearDiShiCell = diShiRow.createEl('td');
    if (this.baziInfo.yearDiShi) {
      const yearDiShiSpan = yearDiShiCell.createSpan({
        text: this.baziInfo.yearDiShi,
        cls: 'dishi-tag-small'
      });
      this.applyDiShiColor(yearDiShiSpan, this.baziInfo.yearDiShi);
    }

    // 月柱地势
    const monthDiShiCell = diShiRow.createEl('td');
    if (this.baziInfo.monthDiShi) {
      const monthDiShiSpan = monthDiShiCell.createSpan({
        text: this.baziInfo.monthDiShi,
        cls: 'dishi-tag-small'
      });
      this.applyDiShiColor(monthDiShiSpan, this.baziInfo.monthDiShi);
    }

    // 日柱地势
    const dayDiShiCell = diShiRow.createEl('td');
    if (this.baziInfo.dayDiShi) {
      const dayDiShiSpan = dayDiShiCell.createSpan({
        text: this.baziInfo.dayDiShi,
        cls: 'dishi-tag-small'
      });
      this.applyDiShiColor(dayDiShiSpan, this.baziInfo.dayDiShi);
    }

    // 时柱地势
    const timeDiShiCell = diShiRow.createEl('td');
    if (this.baziInfo.timeDiShi) {
      const timeDiShiSpan = timeDiShiCell.createSpan({
        text: this.baziInfo.timeDiShi,
        cls: 'dishi-tag-small'
      });
      this.applyDiShiColor(timeDiShiSpan, this.baziInfo.timeDiShi);
    }
  }

  /**
   * 创建纳音行（使用统一颜色方案）
   */
  private createNaYinRow(tbody: HTMLElement) {
    const naYinRow = tbody.createEl('tr', { cls: 'bazi-nayin-row' });
    naYinRow.createEl('td', { text: '纳音', cls: 'bazi-table-label' });

    // 年柱纳音
    const yearNaYinCell = naYinRow.createEl('td', { text: this.baziInfo.yearNaYin || '' });
    if (this.baziInfo.yearNaYin) {
      ColorSchemeService.setNaYinColor(yearNaYinCell, this.baziInfo.yearNaYin);
    }

    // 月柱纳音
    const monthNaYinCell = naYinRow.createEl('td', { text: this.baziInfo.monthNaYin || '' });
    if (this.baziInfo.monthNaYin) {
      ColorSchemeService.setNaYinColor(monthNaYinCell, this.baziInfo.monthNaYin);
    }

    // 日柱纳音
    const dayNaYinCell = naYinRow.createEl('td', { text: this.baziInfo.dayNaYin || '' });
    if (this.baziInfo.dayNaYin) {
      ColorSchemeService.setNaYinColor(dayNaYinCell, this.baziInfo.dayNaYin);
    }

    // 时柱纳音
    const timeNaYinCell = naYinRow.createEl('td', { text: this.baziInfo.timeNaYin || '' });
    if (this.baziInfo.timeNaYin) {
      ColorSchemeService.setNaYinColor(timeNaYinCell, this.baziInfo.timeNaYin);
    }
  }

  /**
   * 创建旬空行（使用统一颜色方案）
   */
  private createXunKongRow(tbody: HTMLElement) {
    const xunKongRow = tbody.createEl('tr', { cls: 'bazi-xunkong-row' });
    xunKongRow.createEl('td', { text: '旬空', cls: 'bazi-table-label' });

    // 年柱旬空
    const yearXunKongCell = xunKongRow.createEl('td');
    if (this.baziInfo.yearXunKong) {
      ColorSchemeService.createColoredXunKongElement(yearXunKongCell, this.baziInfo.yearXunKong);
    }

    // 月柱旬空
    const monthXunKongCell = xunKongRow.createEl('td');
    if (this.baziInfo.monthXunKong) {
      ColorSchemeService.createColoredXunKongElement(monthXunKongCell, this.baziInfo.monthXunKong);
    }

    // 日柱旬空
    const dayXunKongCell = xunKongRow.createEl('td');
    if (this.baziInfo.dayXunKong) {
      ColorSchemeService.createColoredXunKongElement(dayXunKongCell, this.baziInfo.dayXunKong);
    }

    // 时柱旬空
    const timeXunKongCell = xunKongRow.createEl('td');
    if (this.baziInfo.timeXunKong) {
      ColorSchemeService.createColoredXunKongElement(timeXunKongCell, this.baziInfo.timeXunKong);
    }
  }

  /**
   * 创建生肖行
   */
  private createShengXiaoRow(tbody: HTMLElement) {
    const shengXiaoRow = tbody.createEl('tr', { cls: 'bazi-shengxiao-row' });
    shengXiaoRow.createEl('td', { text: '生肖', cls: 'bazi-table-label' });

    // 年柱生肖
    shengXiaoRow.createEl('td', { text: this.baziInfo.yearShengXiao || '' });
    // 月柱生肖
    shengXiaoRow.createEl('td', { text: this.baziInfo.monthShengXiao || '' });
    // 日柱生肖
    shengXiaoRow.createEl('td', { text: this.baziInfo.dayShengXiao || '' });
    // 时柱生肖
    shengXiaoRow.createEl('td', { text: this.baziInfo.timeShengXiao || '' });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(tbody: HTMLElement) {
    // 检查是否应该显示神煞
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.siZhu === false) {
      return;
    }

    // 解析神煞数据
    const shenShaData = this.parseShenShaData();

    // 如果没有神煞数据，不创建行
    if (!shenShaData.hasAny) {
      return;
    }

    const shenShaRow = tbody.createEl('tr', { cls: 'bazi-shensha-row' });
    shenShaRow.createEl('td', { text: '神煞', cls: 'bazi-table-label' });

    // 年柱神煞
    const yearShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(yearShenShaCell, shenShaData.year);

    // 月柱神煞
    const monthShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(monthShenShaCell, shenShaData.month);

    // 日柱神煞
    const dayShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(dayShenShaCell, shenShaData.day);

    // 时柱神煞
    const timeShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(timeShenShaCell, shenShaData.time);
  }

  /**
   * 解析神煞数据，兼容新旧格式
   */
  private parseShenShaData() {
    const result = {
      year: [] as string[],
      month: [] as string[],
      day: [] as string[],
      time: [] as string[],
      hasAny: false
    };

    // 优先使用新格式（分柱神煞）
    if (this.baziInfo.yearShenSha || this.baziInfo.monthShenSha ||
        this.baziInfo.dayShenSha || this.baziInfo.timeShenSha) {
      result.year = this.baziInfo.yearShenSha || [];
      result.month = this.baziInfo.monthShenSha || [];
      result.day = this.baziInfo.dayShenSha || [];
      result.time = this.baziInfo.timeShenSha || [];
    }
    // 兼容旧格式（带柱位前缀的神煞数组）
    else if (this.baziInfo.shenSha && this.baziInfo.shenSha.length > 0) {
      this.baziInfo.shenSha.forEach(shenSha => {
        if (shenSha.startsWith('年柱:')) {
          result.year.push(shenSha.substring(3));
        } else if (shenSha.startsWith('月柱:')) {
          result.month.push(shenSha.substring(3));
        } else if (shenSha.startsWith('日柱:')) {
          result.day.push(shenSha.substring(3));
        } else if (shenSha.startsWith('时柱:')) {
          result.time.push(shenSha.substring(3));
        }
      });
    }

    result.hasAny = result.year.length > 0 || result.month.length > 0 ||
                    result.day.length > 0 || result.time.length > 0;

    return result;
  }

  /**
   * 获取表格引用
   */
  getBaziTable(): HTMLTableElement | null {
    return this.baziTable;
  }

  /**
   * 应用天干五行颜色（使用统一颜色方案）
   */
  private applyStemWuXingColor(element: HTMLElement, stem: string) {
    ColorSchemeService.setGanColor(element, stem);
  }

  /**
   * 应用地支五行颜色（使用统一颜色方案）
   */
  private applyBranchWuXingColor(element: HTMLElement, branch: string) {
    ColorSchemeService.setZhiColor(element, branch);
  }

  /**
   * 创建带颜色的藏干
   */
  private createColoredHideGan(element: HTMLElement, hideGan: string) {
    if (!hideGan) return;

    for (const gan of hideGan) {
      const span = element.createSpan({ text: gan });
      this.applyStemWuXingColor(span, gan);
    }
  }

  /**
   * 创建神煞内容（使用统一的ColorSchemeService）
   */
  private createShenShaContent(element: HTMLElement, shenSha: string[] | undefined) {
    if (!shenSha || shenSha.length === 0) {
      return;
    }

    // 直接使用ColorSchemeService的统一神煞元素创建方法
    ColorSchemeService.createColoredShenShaElement(
      element,
      shenSha,
      (sha) => this.handleShenShaClick(sha),
      'shensha-element'
    );
  }

  /**
   * 处理神煞点击事件
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 神煞被点击: ${shenSha}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }



  /**
   * 直接设置五行颜色（使用统一颜色方案）
   */
  private setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    const color = ColorSchemeService.getWuXingColor(wuXing);
    if (color && color !== 'var(--text-normal)') {
      element.style.setProperty('color', color, 'important');
      element.style.setProperty('font-weight', 'bold', 'important');
      element.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.2)', 'important');
    }
  }

  /**
   * 应用十神颜色（使用统一颜色方案）
   */
  private applyShiShenColor(element: HTMLElement, shiShen: string) {
    const color = ColorSchemeService.getShiShenColor(shiShen);
    if (color && color !== 'var(--text-normal)') {
      // 使用!important确保样式优先级
      element.style.setProperty('color', color, 'important');
      element.style.setProperty('font-weight', 'bold', 'important');
      element.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.2)', 'important');

      // 调试：确认样式应用
      console.log(`🎨 应用十神颜色: ${shiShen} -> ${color}`);
    }
  }

  /**
   * 应用地势颜色（使用统一颜色方案）
   */
  private applyDiShiColor(element: HTMLElement, diShi: string) {
    const color = ColorSchemeService.getDiShiColor(diShi);
    if (color && color !== 'var(--text-normal)') {
      // 使用!important确保样式优先级
      element.style.setProperty('color', color, 'important');
      element.style.setProperty('font-weight', 'bold', 'important');
      element.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.2)', 'important');

      // 调试：确认样式应用
      console.log(`🎨 应用地势颜色: ${diShi} -> ${color}`);
    }
  }

}
