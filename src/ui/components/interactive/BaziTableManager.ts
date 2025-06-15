import { BaziInfo } from '../../../types/BaziInfo';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';
import { ShiShenCalculator } from '../../../services/bazi/ShiShenCalculator';
import { BaziUtils } from '../../../services/bazi/BaziUtils';

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

    // 年柱十神
    const yearShiShenCell = shiShenRow.createEl('td');
    // 天干十神
    if (this.baziInfo.yearShiShenGan) {
      yearShiShenCell.createSpan({
        text: this.baziInfo.yearShiShenGan,
        cls: 'shishen-tag-small'
      });
    }
    // 换行
    yearShiShenCell.createEl('br');
    // 地支藏干十神
    if (this.baziInfo.yearShiShenZhi && Array.isArray(this.baziInfo.yearShiShenZhi) && this.baziInfo.yearShiShenZhi.length > 0) {
      yearShiShenCell.createSpan({
        text: this.baziInfo.yearShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
    }

    // 月柱十神
    const monthShiShenCell = shiShenRow.createEl('td');
    if (this.baziInfo.monthShiShenGan) {
      monthShiShenCell.createSpan({
        text: this.baziInfo.monthShiShenGan,
        cls: 'shishen-tag-small'
      });
    }
    monthShiShenCell.createEl('br');
    if (this.baziInfo.monthShiShenZhi && Array.isArray(this.baziInfo.monthShiShenZhi) && this.baziInfo.monthShiShenZhi.length > 0) {
      monthShiShenCell.createSpan({
        text: this.baziInfo.monthShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
    }

    // 日柱十神
    const dayShiShenCell = shiShenRow.createEl('td');
    if (this.baziInfo.dayShiShenGan) {
      dayShiShenCell.createSpan({
        text: this.baziInfo.dayShiShenGan,
        cls: 'shishen-tag-small'
      });
    }
    dayShiShenCell.createEl('br');
    if (this.baziInfo.dayShiShenZhi && Array.isArray(this.baziInfo.dayShiShenZhi) && this.baziInfo.dayShiShenZhi.length > 0) {
      dayShiShenCell.createSpan({
        text: this.baziInfo.dayShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
    }

    // 时柱十神
    const timeShiShenCell = shiShenRow.createEl('td');
    if (this.baziInfo.timeShiShenGan) {
      timeShiShenCell.createSpan({
        text: this.baziInfo.timeShiShenGan,
        cls: 'shishen-tag-small'
      });
    }
    timeShiShenCell.createEl('br');
    if (this.baziInfo.timeShiShenZhi && Array.isArray(this.baziInfo.timeShiShenZhi) && this.baziInfo.timeShiShenZhi.length > 0) {
      timeShiShenCell.createSpan({
        text: this.baziInfo.timeShiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
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

    // 年柱地势
    const yearDiShiCell = diShiRow.createEl('td');
    yearDiShiCell.createSpan({
      text: this.baziInfo.yearDiShi || '',
      cls: 'dishi-tag-small'
    });

    // 月柱地势
    const monthDiShiCell = diShiRow.createEl('td');
    monthDiShiCell.createSpan({
      text: this.baziInfo.monthDiShi || '',
      cls: 'dishi-tag-small'
    });

    // 日柱地势
    const dayDiShiCell = diShiRow.createEl('td');
    dayDiShiCell.createSpan({
      text: this.baziInfo.dayDiShi || '',
      cls: 'dishi-tag-small'
    });

    // 时柱地势
    const timeDiShiCell = diShiRow.createEl('td');
    timeDiShiCell.createSpan({
      text: this.baziInfo.timeDiShi || '',
      cls: 'dishi-tag-small'
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(tbody: HTMLElement) {
    const naYinRow = tbody.createEl('tr', { cls: 'bazi-nayin-row' });
    naYinRow.createEl('td', { text: '纳音', cls: 'bazi-table-label' });

    // 年柱纳音
    naYinRow.createEl('td', { text: this.baziInfo.yearNaYin || '' });
    // 月柱纳音
    naYinRow.createEl('td', { text: this.baziInfo.monthNaYin || '' });
    // 日柱纳音
    naYinRow.createEl('td', { text: this.baziInfo.dayNaYin || '' });
    // 时柱纳音
    naYinRow.createEl('td', { text: this.baziInfo.timeNaYin || '' });
  }

  /**
   * 创建旬空行
   */
  private createXunKongRow(tbody: HTMLElement) {
    const xunKongRow = tbody.createEl('tr', { cls: 'bazi-xunkong-row' });
    xunKongRow.createEl('td', { text: '旬空', cls: 'bazi-table-label' });

    // 年柱旬空
    xunKongRow.createEl('td', { text: this.baziInfo.yearXunKong || '' });
    // 月柱旬空
    xunKongRow.createEl('td', { text: this.baziInfo.monthXunKong || '' });
    // 日柱旬空
    xunKongRow.createEl('td', { text: this.baziInfo.dayXunKong || '' });
    // 时柱旬空
    xunKongRow.createEl('td', { text: this.baziInfo.timeXunKong || '' });
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
    const shenShaRow = tbody.createEl('tr', { cls: 'bazi-shensha-row' });
    shenShaRow.createEl('td', { text: '神煞', cls: 'bazi-table-label' });

    // 年柱神煞
    const yearShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(yearShenShaCell, this.baziInfo.yearShenSha);

    // 月柱神煞
    const monthShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(monthShenShaCell, this.baziInfo.monthShenSha);

    // 日柱神煞
    const dayShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(dayShenShaCell, this.baziInfo.dayShenSha);

    // 时柱神煞
    const timeShenShaCell = shenShaRow.createEl('td');
    this.createShenShaContent(timeShenShaCell, this.baziInfo.timeShenSha);
  }

  /**
   * 获取表格引用
   */
  getBaziTable(): HTMLTableElement | null {
    return this.baziTable;
  }

  /**
   * 应用天干五行颜色
   */
  private applyStemWuXingColor(element: HTMLElement, stem: string) {
    const wuXing = this.getStemWuXing(stem);
    this.setWuXingColorDirectly(element, wuXing);
  }

  /**
   * 应用地支五行颜色
   */
  private applyBranchWuXingColor(element: HTMLElement, branch: string) {
    const wuXing = this.getBranchWuXing(branch);
    this.setWuXingColorDirectly(element, wuXing);
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
   * 创建神煞内容
   */
  private createShenShaContent(element: HTMLElement, shenSha: string[] | undefined) {
    if (!shenSha || shenSha.length === 0) {
      return;
    }

    shenSha.forEach((sha, index) => {
      if (index > 0) {
        element.createSpan({ text: ' ' });
      }

      const shenShaSpan = element.createSpan({
        text: sha,
        cls: 'shensha-tag'
      });
      shenShaSpan.style.cssText = `
        display: inline-block;
        padding: 2px 4px;
        margin: 1px;
        border-radius: 3px;
        font-size: 10px;
        background: var(--background-modifier-border);
        color: var(--text-muted);
        cursor: pointer;
      `;
    });
  }

  /**
   * 获取天干五行
   */
  private getStemWuXing(stem: string): string {
    const stemWuXing: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return stemWuXing[stem] || '';
  }

  /**
   * 获取地支五行
   */
  private getBranchWuXing(branch: string): string {
    const branchWuXing: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchWuXing[branch] || '';
  }

  /**
   * 直接设置五行颜色
   */
  private setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    const colorMap: { [key: string]: string } = {
      '木': '#22c55e',  // 绿色
      '火': '#ef4444',  // 红色
      '土': '#eab308',  // 黄色
      '金': '#64748b',  // 灰色
      '水': '#3b82f6'   // 蓝色
    };

    const color = colorMap[wuXing];
    if (color) {
      element.style.color = color;
      element.style.fontWeight = 'bold';
    }
  }
}
