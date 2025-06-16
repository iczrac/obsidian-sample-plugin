import { BaziInfo } from '../../../types/BaziInfo';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';

/**
 * 流时信息管理器
 * 负责创建和管理流时信息的横向详细表格显示
 */
export class LiuShiInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin?: any;
  private onLiuShiSelect?: (liushi: any) => void;
  private selectedYear: number = 0;
  private selectedMonth: number = 0;
  private selectedDay: number = 0;
  private isExpanded: boolean = false; // 默认收起
  private liuShiSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any, onLiuShiSelect?: (liushi: any) => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
    this.onLiuShiSelect = onLiuShiSelect;
  }

  /**
   * 创建流时信息区域
   */
  createLiuShiInfo(): HTMLElement {
    this.liuShiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liushi-info' });

    // 创建标题
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加流时信息
    this.addLiuShiInfo();

    return this.liuShiSection;
  }

  /**
   * 创建标题
   */
  private createHeader() {
    if (!this.liuShiSection) return;

    const header = this.liuShiSection.createDiv({ cls: 'bazi-liushi-info-header' });
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--background-secondary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    // 标题文本
    const titleText = header.createEl('span', { 
      text: '流时信息',
      cls: 'bazi-liushi-info-title'
    });
    titleText.style.cssText = `
      font-weight: bold;
      color: var(--text-normal);
      font-size: 14px;
    `;

    // 切换按钮
    this.toggleButton = header.createEl('span', { 
      text: this.isExpanded ? '▼' : '▶',
      cls: 'bazi-liushi-info-toggle'
    });
    this.toggleButton.style.cssText = `
      color: var(--text-muted);
      font-size: 12px;
      transition: all 0.2s ease;
      cursor: pointer;
    `;

    // 点击事件
    header.addEventListener('click', () => {
      this.toggle();
    });
  }

  /**
   * 创建信息容器
   */
  private createInfoContainer() {
    if (!this.liuShiSection) return;

    this.infoContainer = this.liuShiSection.createDiv({ cls: 'bazi-liushi-info-container' });
    this.infoContainer.style.cssText = `
      display: ${this.isExpanded ? 'block' : 'none'};
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      overflow: hidden;
    `;
  }

  /**
   * 切换展开/收起状态
   */
  private toggle() {
    this.isExpanded = !this.isExpanded;
    
    if (this.toggleButton) {
      this.toggleButton.textContent = this.isExpanded ? '▼' : '▶';
    }
    
    if (this.infoContainer) {
      this.infoContainer.style.display = this.isExpanded ? 'block' : 'none';
    }

    // 如果展开且有数据，重新渲染
    if (this.isExpanded && this.selectedYear > 0 && this.selectedMonth > 0 && this.selectedDay > 0) {
      this.reRenderTable();
    }
  }

  /**
   * 添加流时信息
   */
  private addLiuShiInfo() {
    if (!this.infoContainer) return;

    if (this.selectedYear === 0 || this.selectedMonth === 0 || this.selectedDay === 0) {
      this.infoContainer.createEl('div', {
        text: '请选择流日查看对应流时',
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 创建流时表格
    this.createLiuShiTable();
  }

  /**
   * 创建流时表格
   */
  private createLiuShiTable() {
    if (!this.infoContainer || this.selectedYear === 0 || this.selectedMonth === 0 || this.selectedDay === 0) return;

    // 清空容器
    this.infoContainer.empty();

    // 生成流时数据
    const liuShiData = this.generateLiuShiData(this.selectedYear, this.selectedMonth, this.selectedDay);
    
    if (!liuShiData || liuShiData.length === 0) {
      this.infoContainer.createEl('div', {
        text: `${this.selectedYear}年${this.selectedMonth}月${this.selectedDay}日无流时数据`,
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 创建表格容器
    const tableContainer = this.infoContainer.createDiv({ cls: 'bazi-liushi-table-container' });
    tableContainer.style.cssText = `
      overflow-x: auto;
      background: var(--background-primary);
    `;

    // 创建表格
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-liushi-table' });
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      min-width: 800px;
    `;

    // 创建各行（时辰行已包含干支，不需要单独的干支行）
    this.createTimeRow(table, liuShiData);
    this.createShiShenRow(table, liuShiData);
    this.createDiShiRow(table, liuShiData);
    this.createXunKongRow(table, liuShiData);
    this.createNaYinRow(table, liuShiData);
    this.createShenShaRow(table, liuShiData);
  }

  /**
   * 生成流时数据
   */
  private generateLiuShiData(year: number, month: number, day: number): any[] {
    try {
      // 获取日干用于计算十神
      const dayStem = this.baziInfo.dayStem || '甲';

      // 使用数据生成服务（统一后端算法，传递baziInfo以获取流派设置）
      const liuShiData = DataGenerationService.generateLiuShiForDay(year, month, day, dayStem, this.baziInfo);
      console.log(`🎯 生成${year}年${month}月${day}日流时数据:`, liuShiData);
      return liuShiData;
    } catch (error) {
      console.error('❌ 生成流时数据失败:', error);

      // 返回简化的备用数据（12个时辰）
      const times = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

      return times.map((time, index) => ({
        year,
        month,
        day,
        timeIndex: index,
        name: time,
        ganZhi: '甲子', // 简化
        shiShen: '比肩',
        diShi: '长生',
        xunKong: ['戌', '亥'],
        naYin: '海中金',
        shenSha: [],
        isBackup: true
      }));
    }
  }

  /**
   * 创建时辰行（统一显示时辰、时间和干支）
   */
  private createTimeRow(table: HTMLElement, liuShiData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-liushi-time-row' });
    row.createEl('th', { text: '流时' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liushi-cell',
        attr: { 'data-time': ls.timeIndex.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 创建时辰名称
      const timeNameDiv = cell.createDiv({ cls: 'time-name' });
      timeNameDiv.textContent = ls.name;
      timeNameDiv.style.cssText = `
        font-weight: bold;
        margin-bottom: 2px;
        font-size: 11px;
      `;

      // 创建时间范围（根据设置中的流派显示）
      const timeRangeDiv = cell.createDiv({ cls: 'time-range' });
      const timeRange = this.getTimeRangeBySettings(ls.timeIndex);
      timeRangeDiv.textContent = timeRange;
      timeRangeDiv.style.cssText = `
        font-size: 9px;
        color: var(--text-muted);
        margin-bottom: 2px;
        line-height: 1;
      `;

      // 创建干支显示
      const ganZhiDiv = cell.createDiv({ cls: 'time-ganzhi' });
      if (ls.ganZhi) {
        ColorSchemeService.createColoredGanZhiElement(ganZhiDiv, ls.ganZhi);
      } else {
        ganZhiDiv.textContent = ls.ganZhi || '';
      }
      ganZhiDiv.style.cssText = `
        font-size: 11px;
        font-weight: bold;
      `;

      // 添加点击事件
      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }



  /**
   * 创建十神行
   */
  private createShiShenRow(table: HTMLElement, liuShiData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-liushi-shishen-row' });
    row.createEl('th', { text: '十神' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', {
        text: ls.shiShen || '',
        cls: 'bazi-liushi-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ls.shiShen) {
        ColorSchemeService.setShiShenColor(cell, ls.shiShen);
      }

      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(table: HTMLElement, liuShiData: any[]) {
    if (!liuShiData.some(ls => ls.diShi)) return;

    const row = table.createEl('tr', { cls: 'bazi-liushi-dishi-row' });
    row.createEl('th', { text: '地势' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', {
        text: ls.diShi || '',
        cls: 'bazi-liushi-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (ls.diShi) {
        ColorSchemeService.setDiShiColor(cell, ls.diShi);
      }
      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }

  /**
   * 创建旬空行
   */
  private createXunKongRow(table: HTMLElement, liuShiData: any[]) {
    if (!liuShiData.some(ls => ls.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-liushi-xunkong-row' });
    row.createEl('th', { text: '旬空' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', { cls: 'bazi-liushi-cell' });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ls.xunKong && Array.isArray(ls.xunKong)) {
        ColorSchemeService.createColoredXunKongElement(cell, ls.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(table: HTMLElement, liuShiData: any[]) {
    if (!liuShiData.some(ls => ls.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-liushi-nayin-row' });
    row.createEl('th', { text: '纳音' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', {
        text: ls.naYin || '',
        cls: 'bazi-liushi-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (ls.naYin) {
        ColorSchemeService.setNaYinColor(cell, ls.naYin);
      }
      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLElement, liuShiData: any[]) {
    if (!liuShiData.some(ls => ls.shenSha && ls.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-liushi-shensha-row' });
    row.createEl('th', { text: '神煞' }).style.cssText = this.getHeaderCellStyle();

    liuShiData.forEach((ls) => {
      const cell = row.createEl('td', { cls: 'bazi-liushi-cell' });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ls.shenSha && ls.shenSha.length > 0) {
        ls.shenSha.forEach((shenSha: string, index: number) => {
          if (index > 0) {
            cell.createSpan({ text: ' ' });
          }

          const shenShaSpan = cell.createSpan({
            text: shenSha,
            cls: 'shensha-tag'
          });

          // 添加神煞样式
          ColorSchemeService.setShenShaColor(shenShaSpan, shenSha);

          // 添加点击事件
          shenShaSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleShenShaClick(shenSha);
          });
        });
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuShi(ls));
    });
  }

  /**
   * 选择流时
   */
  private selectLiuShi(liushi: any) {
    console.log(`🎯 流时选择: ${liushi.year}年${liushi.month}月${liushi.day}日 ${liushi.name} (${liushi.ganZhi})`);

    // 高亮选中的流时
    this.highlightSelectedLiuShi(liushi.timeIndex);

    // 调用回调函数
    if (this.onLiuShiSelect) {
      this.onLiuShiSelect(liushi);
    }

    // 触发自定义事件
    const event = new CustomEvent('liushi-select', {
      detail: { liushi },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 高亮选中的流时
   */
  private highlightSelectedLiuShi(timeIndex: number) {
    if (!this.infoContainer) return;

    const cells = this.infoContainer.querySelectorAll('.bazi-liushi-cell');
    cells.forEach((cell) => {
      const cellTime = parseInt(cell.getAttribute('data-time') || '0');
      if (cellTime === timeIndex) {
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    });
  }

  /**
   * 处理神煞点击事件
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 流时神煞被点击: ${shenSha}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 获取表头单元格样式
   */
  private getHeaderCellStyle(): string {
    return `
      padding: 6px 8px;
      background: var(--background-modifier-border);
      border: 1px solid var(--background-modifier-border);
      font-weight: bold;
      text-align: center;
      font-size: 11px;
      color: var(--text-normal);
      min-width: 60px;
    `;
  }

  /**
   * 获取数据单元格样式
   */
  private getDataCellStyle(): string {
    return `
      padding: 4px 6px;
      border: 1px solid var(--background-modifier-border);
      text-align: center;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 60px;
    `;
  }

  /**
   * 根据设置获取时间范围
   * @param timeIndex 时辰索引（0-11）
   * @returns 时间范围字符串
   */
  private getTimeRangeBySettings(timeIndex: number): string {
    // 标准时间范围（参照原版方案）
    const timeRanges = [
      '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
      '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
      '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
    ];

    return timeRanges[timeIndex] || '';
  }

  /**
   * 设置选中的年月日
   */
  setSelectedYearMonthDay(year: number, month: number, day: number) {
    console.log(`🎯 LiuShiInfoManager: 设置年月日 ${year}年${month}月${day}日`);
    this.selectedYear = year;
    this.selectedMonth = month;
    this.selectedDay = day;

    // 清空容器并重新创建流时表格
    if (this.infoContainer) {
      this.infoContainer.empty();
      this.addLiuShiInfo();
    }
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.addLiuShiInfo();
    }
  }

  /**
   * 获取流时信息区域元素
   */
  getLiuShiSection(): HTMLElement | null {
    return this.liuShiSection;
  }

  /**
   * 重新渲染表格（在展开/收起时调用）
   */
  private reRenderTable() {
    if (!this.infoContainer) return;

    // 清空容器并重新创建流时信息
    this.infoContainer.empty();
    this.addLiuShiInfo();
  }
}
