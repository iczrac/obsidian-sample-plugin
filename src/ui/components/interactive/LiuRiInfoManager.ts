import { BaziInfo } from '../../../types/BaziInfo';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';

/**
 * 流日信息管理器
 * 负责创建和管理流日信息的横向详细表格显示
 */
export class LiuRiInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin?: any;
  private onLiuRiSelect?: (liuri: any) => void;
  private selectedYear: number = 0;
  private selectedMonthGanZhi: string = '';
  private isExpanded: boolean = false; // 默认收起
  private liuRiSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any, onLiuRiSelect?: (liuri: any) => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
    this.onLiuRiSelect = onLiuRiSelect;
  }

  /**
   * 创建流日信息区域
   */
  createLiuRiInfo(): HTMLElement {
    this.liuRiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuri-info' });

    // 默认隐藏，等待流月选择
    this.liuRiSection.style.display = 'none';

    // 创建标题
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加流日信息
    this.addLiuRiInfo();

    return this.liuRiSection;
  }

  /**
   * 创建标题
   */
  private createHeader() {
    if (!this.liuRiSection) return;

    const header = this.liuRiSection.createDiv({ cls: 'bazi-liuri-info-header' });
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
      text: '流日信息',
      cls: 'bazi-liuri-info-title'
    });
    titleText.style.cssText = `
      font-weight: bold;
      color: var(--text-normal);
      font-size: 14px;
    `;

    // 切换按钮
    this.toggleButton = header.createEl('span', { 
      text: this.isExpanded ? '▼' : '▶',
      cls: 'bazi-liuri-info-toggle'
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
    if (!this.liuRiSection) return;

    this.infoContainer = this.liuRiSection.createDiv({ cls: 'bazi-liuri-info-container' });
    this.infoContainer.style.cssText = `
      display: block;
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

    // 重新渲染表格以显示/隐藏详细信息
    setTimeout(() => {
      this.reRenderTable();
    }, 150); // 等待动画完成一半时重新渲染

    console.log(`🎯 流日信息栏${this.isExpanded ? '展开' : '收起'}`);
  }

  /**
   * 添加流日信息
   */
  private addLiuRiInfo() {
    if (!this.infoContainer) return;

    if (this.selectedYear === 0 || !this.selectedMonthGanZhi) {
      this.infoContainer.createEl('div', {
        text: '请选择流月查看对应流日',
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 创建流日表格
    this.createLiuRiTable();
  }

  /**
   * 创建流日表格
   */
  private createLiuRiTable() {
    if (!this.infoContainer || this.selectedYear === 0 || !this.selectedMonthGanZhi) return;

    // 清空容器
    this.infoContainer.empty();

    // 生成流日数据
    const liuRiData = this.generateLiuRiData(this.selectedYear, this.selectedMonthGanZhi);

    if (!liuRiData || liuRiData.length === 0) {
      this.infoContainer.createEl('div', {
        text: `${this.selectedYear}年${this.selectedMonthGanZhi}月无流日数据`,
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
    const tableContainer = this.infoContainer.createDiv({ cls: 'bazi-liuri-table-container' });
    tableContainer.style.cssText = `
      overflow-x: auto;
      background: var(--background-primary);
    `;

    // 创建表格
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-liuri-table' });
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      min-width: 1200px;
    `;

    // 创建表格内容
    this.createLiuRiTableContent(table, liuRiData);
  }

  /**
   * 创建流日表格内容
   */
  private createLiuRiTableContent(table: HTMLElement, liuRiData: any[]) {
    // 清空表格
    table.empty();

    // 始终显示的行：日期干支行
    this.createCombinedDateGanZhiRow(table, liuRiData);

    // 展开时显示的详细信息
    if (this.isExpanded) {
      this.createShiShenRow(table, liuRiData);
      this.createDiShiRow(table, liuRiData);
      this.createXunKongRow(table, liuRiData);
      this.createNaYinRow(table, liuRiData);
      this.createShenShaRow(table, liuRiData);
    }
  }

  /**
   * 生成流日数据
   */
  private generateLiuRiData(year: number, monthGanZhi: string): any[] {
    try {
      // 获取日干用于计算
      const dayStem = this.baziInfo.dayStem || '甲';

      // 使用数据生成服务（统一后端算法）
      const liuRiData = DataGenerationService.generateLiuRiForMonth(year, monthGanZhi, dayStem);
      console.log(`🎯 生成${year}年${monthGanZhi}月流日数据:`, liuRiData);
      return liuRiData;
    } catch (error) {
      console.error('❌ 生成流日数据失败:', error);

      // 返回简化的备用数据（假设30天）
      return Array.from({ length: 30 }, (_, index) => ({
        year,
        month: 1, // 简化
        day: index + 1,
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
   * 创建合并的日期干支行（类似流月的显示方式）
   */
  private createCombinedDateGanZhiRow(table: HTMLElement, liuRiData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-liuri-combined-row' });
    row.createEl('th', { text: '流日' }).style.cssText = this.getHeaderCellStyle();

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liuri-cell',
        attr: { 'data-day': lr.day.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 第一行：公历日期（如：2.4）
      if (lr.solarDisplay) {
        const solarDiv = cell.createDiv({ cls: 'solar-date' });
        solarDiv.textContent = lr.solarDisplay;
        solarDiv.style.cssText = `
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.2;
          margin-bottom: 2px;
        `;
      }

      // 第二行：干支（带五行颜色）
      if (lr.ganZhi) {
        const ganZhiDiv = cell.createDiv({ cls: 'ganzhi-display' });
        ganZhiDiv.style.cssText = `
          line-height: 1.2;
        `;
        ColorSchemeService.createColoredGanZhiElement(ganZhiDiv, lr.ganZhi);
      }

      // 添加点击事件
      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }



  /**
   * 创建十神行（参考流年实现）
   */
  private createShiShenRow(table: HTMLElement, liuRiData: any[]) {
    if (!liuRiData.some(lr => lr.shiShenGan || lr.shiShenZhi)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuri-shishen-row' });
    row.createEl('th', { text: '十神' }).style.cssText = this.getHeaderCellStyle();

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liuri-cell'
      });
      cell.style.cssText = this.getDataCellStyle() + 'line-height: 1.2;';

      // 天干十神
      if (lr.shiShenGan) {
        const ganShiShen = cell.createDiv({
          text: lr.shiShenGan,
          cls: 'bazi-shishen-gan'
        });
        ganShiShen.style.cssText = `
          font-size: 10px;
          margin-bottom: 1px;
          font-weight: bold;
        `;
        ColorSchemeService.setShiShenColor(ganShiShen, lr.shiShenGan);
      }

      // 地支十神
      if (lr.shiShenZhi) {
        const zhiShiShenText = Array.isArray(lr.shiShenZhi) ? lr.shiShenZhi.join(' ') : lr.shiShenZhi;
        const zhiShiShen = cell.createDiv({
          text: zhiShiShenText,
          cls: 'bazi-shishen-zhi'
        });
        zhiShiShen.style.cssText = `
          font-size: 9px;
          opacity: 0.8;
        `;
        ColorSchemeService.setShiShenColor(zhiShiShen, zhiShiShenText.split(' ')[0]);
      }

      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(table: HTMLElement, liuRiData: any[]) {
    // 总是创建地势行，支持动态计算

    const row = table.createEl('tr', { cls: 'bazi-liuri-dishi-row' });

    // 创建可点击的地势标签
    const headerCell = row.createEl('th', {
      text: '地势',
      cls: 'bazi-changsheng-label'
    });
    headerCell.style.cssText = this.getHeaderCellStyle() + 'cursor: pointer;';
    headerCell.setAttribute('title', '日干在各地支的十二长生状态 (点击切换)');

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', {
        text: lr.diShi || '',
        cls: 'bazi-liuri-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (lr.diShi) {
        ColorSchemeService.setDiShiColor(cell, lr.diShi);
      }
      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }

  /**
   * 创建旬空行（参考流年实现）
   */
  private createXunKongRow(table: HTMLElement, liuRiData: any[]) {
    if (!liuRiData.some(lr => lr.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuri-xunkong-row' });
    row.createEl('th', { text: '旬空' }).style.cssText = this.getHeaderCellStyle();

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', { cls: 'bazi-liuri-cell' });
      cell.style.cssText = this.getDataCellStyle();

      // 处理旬空干支颜色显示
      if (lr.xunKong) {
        ColorSchemeService.createColoredXunKongElement(cell, lr.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(table: HTMLElement, liuRiData: any[]) {
    if (!liuRiData.some(lr => lr.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuri-nayin-row' });
    row.createEl('th', { text: '纳音' }).style.cssText = this.getHeaderCellStyle();

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', {
        text: lr.naYin || '',
        cls: 'bazi-liuri-cell'
      });
      cell.style.cssText = this.getDataCellStyle();
      if (lr.naYin) {
        ColorSchemeService.setNaYinColor(cell, lr.naYin);
      }
      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLElement, liuRiData: any[]) {
    // 检查神煞显示设置
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuRi === false) {
      return;
    }

    if (!liuRiData.some(lr => lr.shenSha && lr.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-liuri-shensha-row' });
    row.createEl('th', { text: '神煞' }).style.cssText = this.getHeaderCellStyle();

    liuRiData.forEach((lr) => {
      const cell = row.createEl('td', { cls: 'bazi-liuri-cell' });
      cell.style.cssText = this.getDataCellStyle();
      
      if (lr.shenSha && lr.shenSha.length > 0) {
        lr.shenSha.forEach((shenSha: string, index: number) => {
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

      cell.addEventListener('click', () => this.selectLiuRi(lr));
    });
  }

  /**
   * 选择流日
   */
  private selectLiuRi(liuri: any) {
    console.log(`🎯 流日选择: ${liuri.year}年${liuri.month}月${liuri.day}日 (${liuri.ganZhi})`);

    // 高亮选中的流日
    this.highlightSelectedLiuRi(liuri.day);

    // 调用回调函数
    if (this.onLiuRiSelect) {
      this.onLiuRiSelect(liuri);
    }

    // 触发自定义事件
    const event = new CustomEvent('liuri-select', {
      detail: { liuri },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 高亮选中的流日
   */
  private highlightSelectedLiuRi(day: number) {
    if (!this.infoContainer) return;

    const cells = this.infoContainer.querySelectorAll('.bazi-liuri-cell');
    cells.forEach((cell) => {
      const cellDay = parseInt(cell.getAttribute('data-day') || '0');
      if (cellDay === day) {
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
    console.log(`🎯 流日神煞被点击: ${shenSha}`);

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
   * 设置选中的年月
   */
  setSelectedYearMonth(year: number, monthGanZhi: string) {
    console.log(`🎯 LiuRiInfoManager: 设置年月 ${year}年${monthGanZhi}月`);
    this.selectedYear = year;
    this.selectedMonthGanZhi = monthGanZhi;

    // 显示流日区域
    this.show();

    // 清空容器并重新创建流日表格
    if (this.infoContainer) {
      this.infoContainer.empty();
      this.addLiuRiInfo();
    }
  }

  /**
   * 显示流日信息区域
   */
  show() {
    if (this.liuRiSection) {
      this.liuRiSection.style.display = 'block';
    }
  }

  /**
   * 隐藏流日信息区域
   */
  hide() {
    if (this.liuRiSection) {
      this.liuRiSection.style.display = 'none';
    }
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.addLiuRiInfo();
    }
  }

  /**
   * 获取流日信息区域元素
   */
  getLiuRiSection(): HTMLElement | null {
    return this.liuRiSection;
  }

  /**
   * 重新渲染表格（在展开/收起时调用）
   */
  private reRenderTable() {
    if (!this.infoContainer || this.selectedYear === 0 || !this.selectedMonthGanZhi) return;

    const table = this.infoContainer.querySelector('.bazi-liuri-table') as HTMLElement;
    if (table) {
      const liuRiData = this.generateLiuRiData(this.selectedYear, this.selectedMonthGanZhi);
      if (liuRiData && liuRiData.length > 0) {
        this.createLiuRiTableContent(table, liuRiData);
      }
    }
  }
}
