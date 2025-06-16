import { BaziInfo, DaYunInfo } from '../../../types/BaziInfo';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { LiuNianInfoManager } from './LiuNianInfoManager';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';

/**
 * 大运信息管理器
 * 负责管理大运信息的显示、收缩和展开功能
 */
export class DaYunInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;
  private isExpanded: boolean = false; // 默认收起
  private daYunSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;
  private onDaYunSelect?: (index: number) => void;
  private liuNianInfoManager: LiuNianInfoManager | null = null;



  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any, onDaYunSelect?: (index: number) => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
    this.onDaYunSelect = onDaYunSelect;
  }

  /**
   * 创建大运信息区域
   */
  createDaYunInfo(): HTMLElement {
    this.daYunSection = this.container.createDiv({ cls: 'bazi-view-section bazi-dayun-info' });
    
    // 创建标题栏（包含收缩/展开按钮）
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加大运信息
    this.addDaYunInfo();

    return this.daYunSection;
  }

  /**
   * 创建标题栏
   */
  private createHeader() {
    if (!this.daYunSection) return;

    const header = this.daYunSection.createDiv({ cls: 'bazi-dayun-info-header' });
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      cursor: pointer;
      user-select: none;
    `;

    // 标题
    const title = header.createEl('h3', { 
      text: '大运信息', 
      cls: 'bazi-view-subtitle' 
    });
    title.style.cssText = `
      margin: 0;
      flex: 1;
    `;

    // 收缩/展开按钮
    this.toggleButton = header.createDiv({ cls: 'bazi-dayun-info-toggle' });
    this.updateToggleButton();
    this.toggleButton.style.cssText = `
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      background: var(--background-modifier-border);
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
      this.toggleButton!.style.background = 'var(--background-modifier-border)';
      this.toggleButton!.style.color = 'var(--text-muted)';
    });
  }

  /**
   * 创建信息容器
   */
  private createInfoContainer() {
    if (!this.daYunSection) return;

    this.infoContainer = this.daYunSection.createDiv({ cls: 'bazi-dayun-info-container' });
    this.infoContainer.style.cssText = `
      overflow: hidden;
      transition: all 0.3s ease;
    `;

    this.updateContainerVisibility();
  }

  /**
   * 更新容器可见性
   */
  private updateContainerVisibility() {
    if (!this.infoContainer) return;

    if (this.isExpanded) {
      this.infoContainer.style.maxHeight = 'none';
      this.infoContainer.style.opacity = '1';
      this.infoContainer.style.marginTop = '12px';
      this.infoContainer.style.display = 'block';
    } else {
      // 收起时仍然显示，但高度受限
      this.infoContainer.style.maxHeight = 'auto';
      this.infoContainer.style.opacity = '1';
      this.infoContainer.style.marginTop = '12px';
      this.infoContainer.style.display = 'block';
    }
  }

  /**
   * 更新切换按钮
   */
  private updateToggleButton() {
    if (!this.toggleButton) return;

    this.toggleButton.textContent = this.isExpanded ? '−' : '+';
    this.toggleButton.title = this.isExpanded ? '收起大运信息' : '展开大运信息';
  }

  /**
   * 切换展开/收缩状态
   */
  toggle() {
    this.isExpanded = !this.isExpanded;
    this.updateToggleButton();
    this.updateContainerVisibility();

    // 重新渲染表格以显示/隐藏详细信息
    setTimeout(() => {
      this.reRenderTable();
    }, 150); // 等待动画完成一半时重新渲染

    // 触发自定义事件，通知父组件状态变化
    const event = new CustomEvent('dayun-info-toggle', {
      detail: { isExpanded: this.isExpanded },
      bubbles: true
    });
    this.container.dispatchEvent(event);

    console.log(`🎯 大运信息栏${this.isExpanded ? '展开' : '收起'}`);
  }

  /**
   * 设置展开状态
   */
  setExpanded(expanded: boolean) {
    if (this.isExpanded !== expanded) {
      this.toggle();
    }
  }

  /**
   * 获取当前展开状态
   */
  getExpanded(): boolean {
    return this.isExpanded;
  }

  /**
   * 添加大运信息
   */
  private addDaYunInfo() {
    if (!this.infoContainer) return;

    if (!this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun) || this.baziInfo.daYun.length === 0) {
      this.infoContainer.createEl('div', {
        text: '暂无大运数据（需要指定性别和年份）',
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 添加起运信息
    this.addQiYunInfo();

    // 创建大运表格
    this.createDaYunTable();

    // 创建流年信息管理器
    this.createLiuNianInfoManager();
  }

  /**
   * 添加起运信息
   */
  private addQiYunInfo() {
    if (!this.infoContainer) return;

    const qiYunDiv = this.infoContainer.createDiv({ cls: 'bazi-qiyun-info' });
    qiYunDiv.style.cssText = `
      margin: 12px 0;
      padding: 10px 12px;
      background: var(--background-modifier-form-field);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-normal);
      border-left: 3px solid var(--text-accent);
    `;

    // 构建起运信息文本
    let qiYunText = '起运信息：';

    if (this.baziInfo.qiYunAge !== undefined) {
      qiYunText += `${this.baziInfo.qiYunAge}年`;
    }

    if (this.baziInfo.qiYunMonth !== undefined && this.baziInfo.qiYunMonth > 0) {
      qiYunText += `${this.baziInfo.qiYunMonth}个月`;
    }

    if (this.baziInfo.qiYunDay !== undefined && this.baziInfo.qiYunDay > 0) {
      qiYunText += `${this.baziInfo.qiYunDay}天`;
    }

    if (this.baziInfo.qiYunTime !== undefined && this.baziInfo.qiYunTime > 0) {
      qiYunText += `${this.baziInfo.qiYunTime}小时`;
    }

    if (this.baziInfo.qiYunDate) {
      qiYunText += ` (${this.baziInfo.qiYunDate})`;
    }

    // 添加流派说明
    const qiYunSect = this.plugin?.settings?.qiYunSect || 1;
    const sectDesc = qiYunSect === 1 ? '流派1：3天=1年' : '流派2：4320分钟=1年';
    qiYunText += ` | ${sectDesc}`;

    qiYunDiv.textContent = qiYunText;
  }

  /**
   * 创建大运表格
   */
  private createDaYunTable() {
    if (!this.infoContainer || !this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun)) return;

    const tableContainer = this.infoContainer.createDiv({ cls: 'bazi-dayun-table-container' });
    tableContainer.style.cssText = `
      margin-top: 12px;
      overflow-x: auto;
    `;

    const table = tableContainer.createEl('table', { cls: 'bazi-dayun-table' });
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    `;

    const daYunData = this.baziInfo.daYun.slice(0, 10); // 显示前10个大运

    // 创建表格内容
    this.createTableContent(table, daYunData);
  }

  /**
   * 创建表格内容
   */
  private createTableContent(table: HTMLElement, daYunData: DaYunInfo[]) {
    // 清空表格
    table.empty();

    // 始终显示的行：年份、干支和地势
    this.createYearRow(table, daYunData);
    this.createGanZhiRow(table, daYunData);
    this.createDiShiRow(table, daYunData); // 地势行总是显示

    // 展开时显示的详细信息
    if (this.isExpanded) {
      this.createAgeRow(table, daYunData);
      this.createShiShenRow(table, daYunData);
      this.createXunKongRow(table, daYunData);
      this.createNaYinRow(table, daYunData);
      this.createShenShaRow(table, daYunData);
    }
  }

  /**
   * 创建年份行
   */
  private createYearRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-dayun-year-row' });
    row.createEl('th', { text: '年份' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        text: dy.startYear.toString(),
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 添加点击事件
      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建干支行
   */
  private createGanZhiRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-dayun-ganzhi-row' });
    row.createEl('th', { text: '干支' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell bazi-dayun-ganzhi-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'font-weight: bold;';

      // 创建干支显示
      if (dy.ganZhi && dy.ganZhi.length >= 2) {
        ColorSchemeService.createColoredGanZhiElement(cell, dy.ganZhi);

        // 如果是前运，添加标注
        if ((dy as any).isQianYun === true) {
          cell.createEl('br');
          cell.createEl('small', {
            text: '前运',
            attr: { style: 'color: #d73027; font-size: 0.6em;' }
          });
        }
      } else {
        cell.textContent = dy.ganZhi || '';
      }

      // 添加点击事件
      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建年龄行
   */
  private createAgeRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-dayun-age-row' });
    row.createEl('th', { text: '年龄' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        text: `${dy.startAge}-${dy.endAge || (dy.startAge + 9)}`,
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建十神行
   */
  private createShiShenRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    if (!daYunData.some(dy => dy.shiShenGan || dy.shiShenZhi)) return;

    const row = table.createEl('tr', { cls: 'bazi-dayun-shishen-row' });
    row.createEl('th', { text: '十神' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'line-height: 1.2;';

      // 天干十神
      if (dy.shiShenGan) {
        const ganShiShen = cell.createDiv({
          text: dy.shiShenGan,
          cls: 'bazi-shishen-gan'
        });
        ganShiShen.style.cssText = `
          font-size: 10px;
          margin-bottom: 1px;
          font-weight: bold;
        `;
        ColorSchemeService.setShiShenColor(ganShiShen, dy.shiShenGan);
      }

      // 地支十神
      if (dy.shiShenZhi) {
        const zhiShiShenText = Array.isArray(dy.shiShenZhi) ? dy.shiShenZhi.join(' ') : dy.shiShenZhi;
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

      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    // 总是创建地势行，支持动态计算

    const row = table.createEl('tr', { cls: 'bazi-dayun-dishi-row' });

    // 创建可点击的地势标签
    const headerCell = row.createEl('th', {
      text: '地势',
      cls: 'bazi-changsheng-label'
    });
    headerCell.style.cssText = this.getHeaderCellStyle() + 'cursor: pointer;';
    headerCell.setAttribute('title', '日干在各地支的十二长生状态 (点击切换)');

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 动态计算地势值
      let diShiValue = dy.diShi || '';

      // 如果没有预计算的地势值，则动态计算
      if (!diShiValue && dy.ganZhi && dy.ganZhi.length >= 2) {
        const dayStem = this.baziInfo.dayStem || '';
        const branch = dy.ganZhi[1]; // 地支
        if (dayStem && branch) {
          diShiValue = this.calculateDiShi(dayStem, branch);
        }
      }

      // 设置单元格内容和颜色
      if (diShiValue) {
        cell.textContent = diShiValue;
        ColorSchemeService.setDiShiColor(cell, diShiValue);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建旬空行
   */
  private createXunKongRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    if (!daYunData.some(dy => dy.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-dayun-xunkong-row' });
    row.createEl('th', { text: '旬空' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 使用统一的旬空颜色显示方法
      if (dy.xunKong) {
        ColorSchemeService.createColoredXunKongElement(cell, dy.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    if (!daYunData.some(dy => dy.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-dayun-nayin-row' });
    row.createEl('th', { text: '纳音' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 使用统一的纳音颜色显示方法
      if (dy.naYin) {
        cell.textContent = dy.naYin;
        ColorSchemeService.setNaYinColor(cell, dy.naYin);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLElement, daYunData: DaYunInfo[]) {
    if (!daYunData.some(dy => dy.shenSha && dy.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-dayun-shensha-row' });
    row.createEl('th', { text: '神煞' }).style.cssText = this.getHeaderCellStyle();

    daYunData.forEach((dy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 使用统一的神煞颜色显示方法
      if (dy.shenSha && dy.shenSha.length > 0) {
        ColorSchemeService.createColoredShenShaElement(
          cell,
          dy.shenSha,
          (shenSha) => this.handleShenShaClick(shenSha),
          'bazi-shensha-list'
        );
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectDaYun(index));
    });
  }

  /**
   * 创建流年信息管理器
   */
  private createLiuNianInfoManager() {
    if (!this.infoContainer) return;

    // 创建流年信息容器
    const liuNianContainer = this.infoContainer.createDiv({ cls: 'bazi-liunian-container' });

    // 创建流年信息管理器
    this.liuNianInfoManager = new LiuNianInfoManager(
      liuNianContainer,
      this.baziInfo,
      (year: number) => {
        console.log(`🎯 流年选择: ${year}`);
        // 这里可以添加流年选择的处理逻辑
      }
    );

    console.log('✅ 流年信息管理器创建完成');
  }

  /**
   * 选择大运
   */
  private selectDaYun(index: number) {
    console.log(`🎯 大运选择: 索引 ${index}`);

    // 高亮选中的大运
    this.highlightSelectedDaYun(index);

    // 更新流年信息管理器的选中大运
    if (this.liuNianInfoManager) {
      this.liuNianInfoManager.setSelectedDaYunIndex(index);
    }

    // 调用回调函数
    if (this.onDaYunSelect) {
      this.onDaYunSelect(index);
    }

    // 触发自定义事件
    const event = new CustomEvent('dayun-select', {
      detail: { index },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 高亮选中的大运
   */
  private highlightSelectedDaYun(index: number) {
    if (!this.infoContainer) return;

    const cells = this.infoContainer.querySelectorAll('.bazi-dayun-cell');
    cells.forEach((cell) => {
      const cellIndex = parseInt(cell.getAttribute('data-index') || '0');
      if (cellIndex === index) {
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    });
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
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.addDaYunInfo();
    }
  }

  /**
   * 获取大运信息区域元素
   */
  getDaYunSection(): HTMLElement | null {
    return this.daYunSection;
  }

  /**
   * 重新渲染表格（在展开/收起时调用）
   */
  private reRenderTable() {
    if (!this.infoContainer || !this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun)) return;

    const table = this.infoContainer.querySelector('.bazi-dayun-table') as HTMLElement;
    if (table) {
      this.createTableContent(table, this.baziInfo.daYun.slice(0, 10));
    }
  }

  /**
   * 计算地势（使用BaziCalculator）
   */
  private calculateDiShi(stem: string, branch: string): string {
    try {
      return BaziCalculator.getDiShi(stem, branch);
    } catch (error) {
      console.error('计算地势失败:', error);
      return '';
    }
  }

  /**
   * 处理神煞点击事件
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 大运神煞被点击: ${shenSha}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

}
