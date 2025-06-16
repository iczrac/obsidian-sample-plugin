import { BaziInfo } from '../../../types/BaziInfo';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';

/**
 * 流月信息管理器
 * 负责创建和管理流月信息的横向详细表格显示
 */
export class LiuYueInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin?: any;
  private onLiuYueSelect?: (liuyue: any) => void;
  private selectedYear: number = 0;
  private isExpanded: boolean = false; // 默认收起
  private liuYueSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any, onLiuYueSelect?: (liuyue: any) => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
    this.onLiuYueSelect = onLiuYueSelect;
  }

  /**
   * 创建流月信息区域
   */
  createLiuYueInfo(): HTMLElement {
    this.liuYueSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuyue-info' });

    // 创建标题
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加流月信息
    this.addLiuYueInfo();

    return this.liuYueSection;
  }

  /**
   * 创建标题
   */
  private createHeader() {
    if (!this.liuYueSection) return;

    const header = this.liuYueSection.createDiv({ cls: 'bazi-liuyue-info-header' });
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
      text: '流月信息',
      cls: 'bazi-liuyue-info-title'
    });
    titleText.style.cssText = `
      font-weight: bold;
      color: var(--text-normal);
      font-size: 14px;
    `;

    // 切换按钮
    this.toggleButton = header.createEl('span', { 
      text: this.isExpanded ? '▼' : '▶',
      cls: 'bazi-liuyue-info-toggle'
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

    // 悬停效果
    this.toggleButton.addEventListener('mouseenter', () => {
      this.toggleButton!.style.background = 'var(--background-modifier-hover)';
      this.toggleButton!.style.color = 'var(--text-normal)';
    });

    this.toggleButton.addEventListener('mouseleave', () => {
      this.toggleButton!.style.background = 'transparent';
      this.toggleButton!.style.color = 'var(--text-muted)';
    });
  }

  /**
   * 创建信息容器
   */
  private createInfoContainer() {
    if (!this.liuYueSection) return;

    this.infoContainer = this.liuYueSection.createDiv({ cls: 'bazi-liuyue-info-container' });
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

    // 如果展开且没有数据，重新渲染
    if (this.isExpanded && this.selectedYear > 0) {
      this.reRenderTable();
    }
  }

  /**
   * 添加流月信息
   */
  private addLiuYueInfo() {
    if (!this.infoContainer) return;

    if (this.selectedYear === 0) {
      this.infoContainer.createEl('div', {
        text: '请选择流年查看对应流月',
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 创建流月表格
    this.createLiuYueTable();
  }

  /**
   * 创建流月表格
   */
  private createLiuYueTable() {
    if (!this.infoContainer || this.selectedYear === 0) return;

    // 清空容器
    this.infoContainer.empty();

    // 生成流月数据
    const liuYueData = this.generateLiuYueData(this.selectedYear);
    
    if (!liuYueData || liuYueData.length === 0) {
      this.infoContainer.createEl('div', {
        text: `${this.selectedYear}年无流月数据`,
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
    const tableContainer = this.infoContainer.createDiv({ cls: 'bazi-liuyue-table-container' });
    tableContainer.style.cssText = `
      overflow-x: auto;
      background: var(--background-primary);
    `;

    // 创建表格
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-liuyue-table' });
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      min-width: 800px;
    `;

    // 创建各行（月份行已包含干支，不需要单独的干支行）
    this.createMonthRow(table, liuYueData);
    this.createShiShenRow(table, liuYueData);
    this.createDiShiRow(table, liuYueData);
    this.createXunKongRow(table, liuYueData);
    this.createNaYinRow(table, liuYueData);
    this.createShenShaRow(table, liuYueData);
  }

  /**
   * 生成流月数据
   */
  private generateLiuYueData(year: number): any[] {
    try {
      // 获取日干用于计算十神
      const dayStem = this.baziInfo.dayStem || '甲';

      // 使用数据生成服务（统一后端算法）
      const liuYueData = DataGenerationService.generateLiuYueForYear(year, dayStem);
      console.log(`🎯 生成${year}年流月数据:`, liuYueData);
      return liuYueData;
    } catch (error) {
      console.error('❌ 生成流月数据失败:', error);

      // 返回简化的备用数据
      const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

      return months.map((month, index) => ({
        year,
        month: index + 1,
        name: month,
        ganZhi: '甲寅', // 简化
        shiShen: '比肩',
        diShi: '长生',
        xunKong: ['戌', '亥'],
        naYin: '',
        shenSha: [],
        startDate: `${index + 1}.1`,
        isBackup: true
      }));
    }
  }

  /**
   * 创建月份行（整合日期和干支显示）
   */
  private createMonthRow(table: HTMLElement, liuYueData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-liuyue-month-row' });
    row.createEl('th', { text: '流月' }).style.cssText = this.getHeaderCellStyle();

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liuyue-cell',
        attr: { 'data-month': ly.month.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 创建整合显示：日期换行干支（如：5.6换行乙卯）
      const dateDiv = cell.createDiv({ cls: 'month-date' });
      dateDiv.textContent = ly.startDate || `${ly.month}.1`;
      dateDiv.style.cssText = `
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.2;
        margin-bottom: 2px;
      `;

      // 添加干支显示
      const ganZhiDiv = cell.createDiv({ cls: 'month-ganzhi' });
      if (ly.ganZhi) {
        ColorSchemeService.createColoredGanZhiElement(ganZhiDiv, ly.ganZhi);
      } else {
        ganZhiDiv.textContent = ly.ganZhi || '';
      }
      ganZhiDiv.style.cssText = `
        font-size: 12px;
        font-weight: bold;
        line-height: 1.2;
      `;

      // 添加点击事件
      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }



  /**
   * 创建十神行
   */
  private createShiShenRow(table: HTMLElement, liuYueData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-liuyue-shishen-row' });
    row.createEl('th', { text: '十神' }).style.cssText = this.getHeaderCellStyle();

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', {
        text: ly.shiShen || '',
        cls: 'bazi-liuyue-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ly.shiShen) {
        ColorSchemeService.setShiShenColor(cell, ly.shiShen);
      }

      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(table: HTMLElement, liuYueData: any[]) {
    if (!liuYueData.some(ly => ly.diShi)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuyue-dishi-row' });

    // 创建可点击的地势标签
    const headerCell = row.createEl('th', {
      text: '地势',
      cls: 'bazi-changsheng-label'
    });
    headerCell.style.cssText = this.getHeaderCellStyle() + 'cursor: pointer;';
    headerCell.setAttribute('title', '日干在各地支的十二长生状态 (点击切换)');

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', {
        text: ly.diShi || '',
        cls: 'bazi-liuyue-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (ly.diShi) {
        ColorSchemeService.setDiShiColor(cell, ly.diShi);
      }
      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }

  /**
   * 创建旬空行
   */
  private createXunKongRow(table: HTMLElement, liuYueData: any[]) {
    if (!liuYueData.some(ly => ly.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuyue-xunkong-row' });
    row.createEl('th', { text: '旬空' }).style.cssText = this.getHeaderCellStyle();

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', { cls: 'bazi-liuyue-cell' });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ly.xunKong && Array.isArray(ly.xunKong)) {
        ColorSchemeService.createColoredXunKongElement(cell, ly.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(table: HTMLElement, liuYueData: any[]) {
    if (!liuYueData.some(ly => ly.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuyue-nayin-row' });
    row.createEl('th', { text: '纳音' }).style.cssText = this.getHeaderCellStyle();

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', {
        text: ly.naYin || '',
        cls: 'bazi-liuyue-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (ly.naYin) {
        ColorSchemeService.setNaYinColor(cell, ly.naYin);
      }
      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLElement, liuYueData: any[]) {
    if (!liuYueData.some(ly => ly.shenSha && ly.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuyue-shensha-row' });
    row.createEl('th', { text: '神煞' }).style.cssText = this.getHeaderCellStyle();

    liuYueData.forEach((ly) => {
      const cell = row.createEl('td', { cls: 'bazi-liuyue-cell' });
      cell.style.cssText = this.getDataCellStyle();
      
      if (ly.shenSha && ly.shenSha.length > 0) {
        ly.shenSha.forEach((shenSha: string, index: number) => {
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

      cell.addEventListener('click', () => this.selectLiuYue(ly));
    });
  }

  /**
   * 选择流月
   */
  private selectLiuYue(liuyue: any) {
    console.log(`🎯 流月选择: ${liuyue.month}月 (${liuyue.ganZhi})`);

    // 高亮选中的流月
    this.highlightSelectedLiuYue(liuyue.month);

    // 调用回调函数
    if (this.onLiuYueSelect) {
      this.onLiuYueSelect(liuyue);
    }

    // 触发自定义事件
    const event = new CustomEvent('liuyue-select', {
      detail: { liuyue },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 高亮选中的流月
   */
  private highlightSelectedLiuYue(month: number) {
    if (!this.infoContainer) return;

    const cells = this.infoContainer.querySelectorAll('.bazi-liuyue-cell');
    cells.forEach((cell) => {
      const cellMonth = parseInt(cell.getAttribute('data-month') || '0');
      if (cellMonth === month) {
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
    console.log(`🎯 流月神煞被点击: ${shenSha}`);

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
   * 设置选中的年份
   */
  setSelectedYear(year: number) {
    console.log(`🎯 LiuYueInfoManager: 设置年份 ${year}`);
    this.selectedYear = year;

    // 清空容器并重新创建流月表格
    if (this.infoContainer) {
      this.infoContainer.empty();
      this.addLiuYueInfo();
    }
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.addLiuYueInfo();
    }
  }

  /**
   * 获取流月信息区域元素
   */
  getLiuYueSection(): HTMLElement | null {
    return this.liuYueSection;
  }

  /**
   * 重新渲染表格（在展开/收起时调用）
   */
  private reRenderTable() {
    if (!this.infoContainer) return;

    // 清空容器并重新创建流月信息
    this.infoContainer.empty();
    this.addLiuYueInfo();
  }
}
