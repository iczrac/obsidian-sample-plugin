import { BaziInfo, LiuNianInfo } from '../../../types/BaziInfo';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';
import { ShiShenCalculator } from '../../../services/bazi/ShiShenCalculator';

/**
 * 流年信息管理器
 * 负责管理流年信息的显示，参照原版样式
 */
export class LiuNianInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;
  private isExpanded: boolean = false; // 默认收起
  private liuNianSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;
  private onLiuNianSelect?: (year: number) => void;
  private selectedDaYunIndex: number = 0;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any, onLiuNianSelect?: (year: number) => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
    this.onLiuNianSelect = onLiuNianSelect;
  }

  /**
   * 创建流年信息区域
   */
  createLiuNianInfo(): HTMLElement {
    this.liuNianSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liunian-info' });

    // 创建标题
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加流年信息
    this.addLiuNianInfo();

    return this.liuNianSection;
  }



  /**
   * 创建标题
   */
  private createHeader() {
    if (!this.liuNianSection) return;

    const header = this.liuNianSection.createDiv({ cls: 'bazi-liunian-info-header' });
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
      text: '流年信息',
      cls: 'bazi-liunian-info-title'
    });
    titleText.style.cssText = `
      font-weight: bold;
      color: var(--text-normal);
      font-size: 14px;
    `;

    // 切换按钮
    this.toggleButton = header.createEl('span', {
      text: this.isExpanded ? '▼' : '▶',
      cls: 'bazi-liunian-info-toggle'
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
   * 切换展开/收缩状态
   */
  toggle() {
    this.isExpanded = !this.isExpanded;

    if (this.toggleButton) {
      this.toggleButton.textContent = this.isExpanded ? '▼' : '▶';
    }

    // 重新渲染表格以显示/隐藏详细信息
    setTimeout(() => {
      this.reRenderTable();
    }, 150); // 等待动画完成一半时重新渲染

    console.log(`🎯 流年信息栏${this.isExpanded ? '展开' : '收起'}`);
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
   * 创建信息容器
   */
  private createInfoContainer() {
    if (!this.liuNianSection) return;

    this.infoContainer = this.liuNianSection.createDiv({ cls: 'bazi-liunian-info-container' });
    this.infoContainer.style.cssText = `
      display: block;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      overflow: hidden;
    `;
  }

  /**
   * 添加流年信息
   */
  private addLiuNianInfo() {
    if (!this.infoContainer) return;

    if (!this.baziInfo.liuNian || !Array.isArray(this.baziInfo.liuNian) || this.baziInfo.liuNian.length === 0) {
      this.infoContainer.createEl('div', {
        text: '请选择大运查看对应流年',
        cls: 'bazi-empty-message'
      }).style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      `;
      return;
    }

    // 创建流年和小运合并表格
    this.createCombinedTable();
  }



  /**
   * 获取过滤后的流年数据（统一使用baziInfo.liuNian）
   */
  private getFilteredLiuNianData(): LiuNianInfo[] {
    console.log(`🎯 ========== 执行流程检查: 大运${this.selectedDaYunIndex} ==========`);

    // 第一步：检查基础数据
    console.log(`🔍 步骤1: 检查基础数据`);
    console.log(`🔍 baziInfo.liuNian 存在: ${!!this.baziInfo.liuNian}`);
    console.log(`🔍 baziInfo.liuNian 长度: ${this.baziInfo.liuNian?.length || 0}`);
    console.log(`🔍 baziInfo.xiaoYun 存在: ${!!this.baziInfo.xiaoYun}`);
    console.log(`🔍 baziInfo.xiaoYun 长度: ${this.baziInfo.xiaoYun?.length || 0}`);

    if (this.baziInfo.liuNian && this.baziInfo.liuNian.length > 0) {
      const firstYear = this.baziInfo.liuNian[0].year;
      const lastYear = this.baziInfo.liuNian[this.baziInfo.liuNian.length - 1].year;
      console.log(`🔍 流年数据范围: ${firstYear} - ${lastYear}`);
      console.log(`🔍 前5年流年:`, this.baziInfo.liuNian.slice(0, 5).map(ln => `${ln.year}年(${ln.age}岁): ${ln.ganZhi}`));
    }

    if (this.baziInfo.xiaoYun && this.baziInfo.xiaoYun.length > 0) {
      const firstXiaoYun = this.baziInfo.xiaoYun[0];
      const lastXiaoYun = this.baziInfo.xiaoYun[this.baziInfo.xiaoYun.length - 1];
      console.log(`🔍 小运数据范围: ${firstXiaoYun.year}年(${firstXiaoYun.age}岁) - ${lastXiaoYun.year}年(${lastXiaoYun.age}岁)`);
      console.log(`🔍 前5个小运:`, this.baziInfo.xiaoYun.slice(0, 5).map(xy => `${xy.year}年(${xy.age}岁): ${xy.ganZhi}`));
    }

    // 第二步：检查大运选择
    console.log(`🔍 步骤2: 检查大运选择`);
    console.log(`🔍 选中大运索引: ${this.selectedDaYunIndex}`);

    // 如果没有选中大运，返回前10年流年数据
    if (this.selectedDaYunIndex === -1) {
      const firstTenYears = this.baziInfo.liuNian?.slice(0, 10) || [];
      console.log(`✅ 未选中大运，返回前${firstTenYears.length}年流年数据`);
      return firstTenYears;
    }

    if (!this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun)) {
      console.log('❌ 没有大运数据，返回空数组');
      console.log('🔍 baziInfo.daYun:', this.baziInfo.daYun);
      return [];
    }

    console.log(`🔍 大运数据总数: ${this.baziInfo.daYun.length}`);
    console.log(`🔍 所有大运:`, this.baziInfo.daYun.map((dy, i) => `${i}: ${dy.ganZhi}(${dy.startYear}-${dy.endYear})`));

    // 第三步：获取选中的大运
    console.log(`🔍 步骤3: 获取选中的大运`);
    const selectedDaYun = this.baziInfo.daYun[this.selectedDaYunIndex];
    if (!selectedDaYun) {
      console.log(`❌ 没有找到选中的大运，索引${this.selectedDaYunIndex}超出范围，返回空数组`);
      console.log(`🔍 大运数组长度: ${this.baziInfo.daYun.length}`);
      return [];
    }

    console.log(`🎯 选中大运详情:`, {
      index: this.selectedDaYunIndex,
      ganZhi: selectedDaYun.ganZhi,
      startYear: selectedDaYun.startYear,
      endYear: selectedDaYun.endYear,
      startAge: selectedDaYun.startAge,
      endAge: selectedDaYun.endAge,
      isQianYun: selectedDaYun.isQianYun
    });

    // 第四步：过滤流年数据
    console.log(`🔍 步骤4: 过滤流年数据`);
    const startYear = selectedDaYun.startYear;
    const endYear = selectedDaYun.endYear || (startYear + 9);

    console.log(`🔍 过滤条件: ${startYear} <= year <= ${endYear}`);

    const filteredData = this.baziInfo.liuNian?.filter(ln => {
      const matches = ln.year >= startYear && ln.year <= endYear;
      return matches;
    }) || [];

    console.log(`🔍 过滤后数据长度: ${filteredData.length}`);
    console.log(`🔍 过滤后流年:`, filteredData.map(ln => `${ln.year}年(${ln.age}岁): ${ln.ganZhi}`));

    // 第五步：排序和限制
    console.log(`🔍 步骤5: 排序和限制`);
    const sortedData = filteredData
      .sort((a, b) => a.year - b.year)
      .slice(0, 10);

    console.log(`✅ 最终流年数据: ${sortedData.length}年`);
    console.log(`🔍 最终流年详情:`, sortedData.map(ln => `${ln.year}年(${ln.age}岁): ${ln.ganZhi}`));

    return sortedData;
  }







  /**
   * 创建合并的流年小运表格
   */
  private createCombinedTable() {
    if (!this.infoContainer) return;

    console.log('🔍 createCombinedTable: 开始创建流年表格');
    console.log('🔍 当前选中大运索引:', this.selectedDaYunIndex);

    // 直接使用baziInfo.liuNian，根据选中的大运进行过滤
    const liuNianData = this.getFilteredLiuNianData();
    const xiaoYunData = this.getXiaoYunForLiuNian(liuNianData);

    console.log('🔍 过滤后的流年数据长度:', liuNianData.length);
    console.log('🔍 小运数据长度:', xiaoYunData.length);

    if (liuNianData.length === 0) {
      console.log('❌ 流年数据为空，显示空消息');
      this.infoContainer.createEl('div', {
        text: '当前大运暂无流年数据',
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
    const tableContainer = this.infoContainer.createDiv({ cls: 'bazi-combined-table-container' });
    tableContainer.style.cssText = `
      overflow-x: auto;
      background: var(--background-primary);
    `;

    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-combined-table' });
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      min-width: 800px;
    `;

    // 创建合并表格内容
    this.createCombinedTableContent(table, liuNianData, xiaoYunData);
  }

  /**
   * 创建合并表格内容
   */
  private createCombinedTableContent(table: HTMLElement, liuNianData: LiuNianInfo[], xiaoYunData: any[]) {
    // 清空表格
    table.empty();

    // 始终显示的行：年份和流年干支
    this.createYearRow(table, liuNianData);
    this.createLiuNianGanZhiRow(table, liuNianData);

    // 展开时显示的详细信息
    if (this.isExpanded) {
      this.createAgeRow(table, liuNianData);
      this.createLiuNianShiShenRow(table, liuNianData);
      this.createLiuNianDiShiRow(table, liuNianData);
      this.createLiuNianXunKongRow(table, liuNianData);
      this.createLiuNianNaYinRow(table, liuNianData);
      this.createLiuNianShenShaRow(table, liuNianData);

      // 小运信息只在展开时显示
      this.createXiaoYunGanZhiRow(table, xiaoYunData);
      this.createXiaoYunShiShenRow(table, xiaoYunData);
      this.createXiaoYunDiShiRow(table, xiaoYunData);
      this.createXiaoYunXunKongRow(table, xiaoYunData);
      this.createXiaoYunNaYinRow(table, xiaoYunData);
      this.createXiaoYunShenShaRow(table, xiaoYunData);
    }
  }

  /**
   * 创建年份行
   */
  private createYearRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-liunian-year-row' });
    row.createEl('th', { text: '年份' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', { 
        text: ln.year.toString(),
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      
      // 添加点击事件
      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建年龄行
   */
  private createAgeRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-liunian-age-row' });
    row.createEl('th', { text: '年龄' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', { 
        text: `${ln.age}`,
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建流年干支行
   */
  private createLiuNianGanZhiRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    const row = table.createEl('tr', { cls: 'bazi-liunian-ganzhi-row' });
    row.createEl('th', { text: '流年' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liunian-cell bazi-liunian-ganzhi-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'font-weight: bold;';

      // 创建干支显示
      if (ln.ganZhi && ln.ganZhi.length >= 2) {
        ColorSchemeService.createColoredGanZhiElement(cell, ln.ganZhi);
      } else {
        cell.textContent = ln.ganZhi || '';
      }

      // 添加点击事件
      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建小运干支行（在合并表格中）
   */
  private createXiaoYunGanZhiRow(table: HTMLElement, xiaoYunData: any[]) {
    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-ganzhi-row' });
    row.createEl('th', { text: '小运' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'font-weight: bold;';

      if (xy && xy.ganZhi) {
        ColorSchemeService.createColoredGanZhiElement(cell, xy.ganZhi);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }





  /**
   * 创建小运十神行
   */
  private createXiaoYunShiShenRow(table: HTMLElement, xiaoYunData: any[]) {
    if (!xiaoYunData.some(xy => xy && (xy.shiShenGan || xy.shiShenZhi))) return;

    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-shishen-row' });
    row.createEl('th', { text: '小运十神' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'line-height: 1.2;';

      if (xy) {
        // 天干十神
        if (xy.shiShenGan) {
          const ganShiShen = cell.createDiv({
            text: xy.shiShenGan,
            cls: 'bazi-shishen-gan'
          });
          ganShiShen.style.cssText = `
            font-size: 10px;
            margin-bottom: 1px;
            font-weight: bold;
          `;
          ColorSchemeService.setShiShenColor(ganShiShen, xy.shiShenGan);
        }

        // 地支十神
        if (xy.shiShenZhi) {
          const zhiShiShenText = Array.isArray(xy.shiShenZhi) ? xy.shiShenZhi.join(' ') : xy.shiShenZhi;
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
      }

      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }

  /**
   * 创建小运地势行
   */
  private createXiaoYunDiShiRow(table: HTMLElement, xiaoYunData: any[]) {
    if (!xiaoYunData.some(xy => xy && xy.diShi)) return;

    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-dishi-row' });
    row.createEl('th', { text: '小运地势' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        text: (xy && xy.diShi) || '',
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      if (xy && xy.diShi) {
        ColorSchemeService.setDiShiColor(cell, xy.diShi);
      }
      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }

  /**
   * 创建小运旬空行
   */
  private createXiaoYunXunKongRow(table: HTMLElement, xiaoYunData: any[]) {
    if (!xiaoYunData.some(xy => xy && xy.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-xunkong-row' });
    row.createEl('th', { text: '小运旬空' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      if (xy && xy.xunKong) {
        ColorSchemeService.createColoredXunKongElement(cell, xy.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }

  /**
   * 创建小运纳音行
   */
  private createXiaoYunNaYinRow(table: HTMLElement, xiaoYunData: any[]) {
    if (!xiaoYunData.some(xy => xy && xy.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-nayin-row' });
    row.createEl('th', { text: '小运纳音' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        text: (xy && xy.naYin) || '',
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      if (xy && xy.naYin) {
        ColorSchemeService.setNaYinColor(cell, xy.naYin);
      }
      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }

  /**
   * 创建小运神煞行
   */
  private createXiaoYunShenShaRow(table: HTMLElement, xiaoYunData: any[]) {
    // 检查神煞显示设置
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.xiaoYun === false) {
      return;
    }

    if (!xiaoYunData.some(xy => xy && xy.shenSha && xy.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-xiaoyun-shensha-row' });
    row.createEl('th', { text: '小运神煞' }).style.cssText = this.getHeaderCellStyle();

    xiaoYunData.forEach((xy, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-index': index.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      if (xy && xy.shenSha && xy.shenSha.length > 0) {
        // 使用统一的ColorSchemeService创建神煞元素
        ColorSchemeService.createColoredShenShaElement(
          cell,
          xy.shenSha,
          (shenSha) => this.handleShenShaClick(shenSha),
          'bazi-shensha-list'
        );
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => {
        if (xy && xy.year) {
          this.selectLiuNian(xy.year);
        }
      });
    });
  }
  /**
   * 获取流年对应的小运数据
   */
  private getXiaoYunForLiuNian(liuNianData: LiuNianInfo[]): any[] {
    console.log(`🎯 ========== 小运匹配执行流程检查 ==========`);

    // 第一步：检查小运数据
    console.log(`🔍 步骤1: 检查小运数据`);
    if (!this.baziInfo.xiaoYun || !Array.isArray(this.baziInfo.xiaoYun)) {
      console.log('❌ 小运数据不存在或不是数组');
      console.log('🔍 baziInfo.xiaoYun:', this.baziInfo.xiaoYun);
      return [];
    }

    console.log('🔍 小运数据总数:', this.baziInfo.xiaoYun.length);
    console.log('🔍 流年数据总数:', liuNianData.length);

    // 第二步：检查数据范围
    console.log(`🔍 步骤2: 检查数据范围`);
    if (this.baziInfo.xiaoYun.length > 0) {
      const firstXiaoYun = this.baziInfo.xiaoYun[0];
      const lastXiaoYun = this.baziInfo.xiaoYun[this.baziInfo.xiaoYun.length - 1];
      console.log(`🔍 小运范围: ${firstXiaoYun.year}年(${firstXiaoYun.age}岁) - ${lastXiaoYun.year}年(${lastXiaoYun.age}岁)`);
      console.log('🔍 前10个小运:', this.baziInfo.xiaoYun.slice(0, 10).map(xy => `${xy.age}岁(${xy.year}年): ${xy.ganZhi}`));
    }

    if (liuNianData.length > 0) {
      const firstLiuNian = liuNianData[0];
      const lastLiuNian = liuNianData[liuNianData.length - 1];
      console.log(`🔍 流年范围: ${firstLiuNian.year}年(${firstLiuNian.age}岁) - ${lastLiuNian.year}年(${lastLiuNian.age}岁)`);
      console.log('🔍 所有流年:', liuNianData.map(ln => `${ln.age}岁(${ln.year}年): ${ln.ganZhi}`));
    }

    // 第三步：逐个匹配
    console.log(`🔍 步骤3: 逐个匹配流年和小运`);
    const result = liuNianData.map((ln, index) => {
      console.log(`🔍 匹配流年${index}: ${ln.year}年(${ln.age}岁) ${ln.ganZhi}`);

      // 首先尝试按年龄匹配
      let xiaoYun = this.baziInfo.xiaoYun?.find(xy => xy.age === ln.age);
      if (xiaoYun) {
        console.log(`✅ 年龄匹配成功: ${ln.age}岁 → 小运: ${xiaoYun.ganZhi}(${xiaoYun.year}年)`);
        return xiaoYun;
      }

      // 如果年龄匹配失败，尝试按年份匹配
      xiaoYun = this.baziInfo.xiaoYun?.find(xy => xy.year === ln.year);
      if (xiaoYun) {
        console.log(`✅ 年份匹配成功: ${ln.year}年 → 小运: ${xiaoYun.ganZhi}(${xiaoYun.age}岁)`);
        return xiaoYun;
      }

      // 都匹配失败，查找最接近的小运
      console.log(`❌ 匹配失败，查找最接近的小运`);
      const nearbyXiaoYun = this.baziInfo.xiaoYun?.filter(xy =>
        Math.abs(xy.age - ln.age) <= 2 || Math.abs(xy.year - ln.year) <= 2
      );

      if (nearbyXiaoYun && nearbyXiaoYun.length > 0) {
        console.log(`🔍 附近的小运:`, nearbyXiaoYun.map(xy => `${xy.age}岁(${xy.year}年): ${xy.ganZhi}`));
      }

      console.log(`❌ 流年${index}: ${ln.year}年(${ln.age}岁) → 未找到对应小运`);
      return null;
    });

    // 第四步：统计结果
    console.log(`🔍 步骤4: 统计匹配结果`);
    const matchedCount = result.filter(r => r !== null).length;
    const unmatchedCount = result.filter(r => r === null).length;
    console.log(`✅ 小运匹配完成: ${matchedCount}/${liuNianData.length} 匹配成功, ${unmatchedCount} 匹配失败`);

    // 显示匹配失败的详情
    if (unmatchedCount > 0) {
      console.log(`❌ 匹配失败的流年:`);
      liuNianData.forEach((ln, index) => {
        if (result[index] === null) {
          console.log(`   - 流年${index}: ${ln.year}年(${ln.age}岁) ${ln.ganZhi}`);
        }
      });
    }

    return result;
  }

  /**
   * 创建流年十神行
   */
  private createLiuNianShiShenRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    if (!liuNianData.some(ln => ln.shiShenGan || ln.shiShenZhi)) return;

    const row = table.createEl('tr', { cls: 'bazi-liunian-shishen-row' });
    row.createEl('th', { text: '十神' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle() + 'line-height: 1.2;';

      // 天干十神
      if (ln.shiShenGan) {
        const ganShiShen = cell.createDiv({
          text: ln.shiShenGan,
          cls: 'bazi-shishen-gan'
        });
        ganShiShen.style.cssText = `
          font-size: 10px;
          margin-bottom: 1px;
          font-weight: bold;
        `;
        ColorSchemeService.setShiShenColor(ganShiShen, ln.shiShenGan);
      }

      // 地支十神
      if (ln.shiShenZhi) {
        const zhiShiShenText = Array.isArray(ln.shiShenZhi) ? ln.shiShenZhi.join(' ') : ln.shiShenZhi;
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

      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }



  /**
   * 创建流年地势行
   */
  private createLiuNianDiShiRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    // 总是创建地势行，支持动态计算

    const row = table.createEl('tr', { cls: 'bazi-liunian-dishi-row' });

    // 创建可点击的地势标签
    const headerCell = row.createEl('th', {
      text: '地势',
      cls: 'bazi-changsheng-label'
    });
    headerCell.style.cssText = this.getHeaderCellStyle() + 'cursor: pointer;';
    headerCell.setAttribute('title', '日干在各地支的十二长生状态 (点击切换)');

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 动态计算地势值
      let diShiValue = ln.diShi || '';

      // 如果没有预计算的地势值，则动态计算
      if (!diShiValue && ln.ganZhi && ln.ganZhi.length >= 2) {
        const dayStem = this.baziInfo.dayStem || '';
        const branch = ln.ganZhi[1]; // 地支
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

      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建流年旬空行
   */
  private createLiuNianXunKongRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    if (!liuNianData.some(ln => ln.xunKong)) return;

    const row = table.createEl('tr', { cls: 'bazi-liunian-xunkong-row' });
    row.createEl('th', { text: '旬空' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      // 处理旬空干支颜色显示
      if (ln.xunKong) {
        ColorSchemeService.createColoredXunKongElement(cell, ln.xunKong);
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建流年纳音行
   */
  private createLiuNianNaYinRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    if (!liuNianData.some(ln => ln.naYin)) return;

    const row = table.createEl('tr', { cls: 'bazi-liunian-nayin-row' });
    row.createEl('th', { text: '纳音' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        text: ln.naYin || '',
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();
      if (ln.naYin) {
        ColorSchemeService.setNaYinColor(cell, ln.naYin);
      }
      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }

  /**
   * 创建流年神煞行
   */
  private createLiuNianShenShaRow(table: HTMLElement, liuNianData: LiuNianInfo[]) {
    if (!liuNianData.some(ln => ln.shenSha && ln.shenSha.length > 0)) return;

    const row = table.createEl('tr', { cls: 'bazi-liunian-shensha-row' });
    row.createEl('th', { text: '神煞' }).style.cssText = this.getHeaderCellStyle();

    liuNianData.forEach((ln, index) => {
      const cell = row.createEl('td', {
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });
      cell.style.cssText = this.getDataCellStyle();

      if (ln.shenSha && ln.shenSha.length > 0) {
        // 使用统一的ColorSchemeService创建神煞元素
        ColorSchemeService.createColoredShenShaElement(
          cell,
          ln.shenSha,
          (shenSha) => this.handleShenShaClick(shenSha),
          'bazi-shensha-list'
        );
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => this.selectLiuNian(ln.year));
    });
  }



  /**
   * 选择流年
   */
  private selectLiuNian(year: number) {
    console.log(`🎯 流年选择: 年份 ${year}`);

    // 高亮选中的流年
    this.highlightSelectedLiuNian(year);

    // 调用回调函数
    if (this.onLiuNianSelect) {
      this.onLiuNianSelect(year);
    }

    // 触发自定义事件
    const event = new CustomEvent('liunian-select', {
      detail: { year },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 高亮选中的流年
   */
  private highlightSelectedLiuNian(year: number) {
    if (!this.infoContainer) return;

    const cells = this.infoContainer.querySelectorAll('.bazi-liunian-cell');
    cells.forEach((cell) => {
      const cellYear = parseInt(cell.getAttribute('data-year') || '0');
      if (cellYear === year) {
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
   * 设置选中的大运索引
   */
  setSelectedDaYunIndex(index: number) {
    console.log(`🎯 LiuNianInfoManager: 设置大运索引 ${index}`);
    this.selectedDaYunIndex = index;

    // 添加详细的调试信息
    console.log('🔍 当前八字信息状态:');
    console.log('🔍 baziInfo存在:', !!this.baziInfo);
    console.log('🔍 baziInfo.daYun存在:', !!this.baziInfo?.daYun);
    console.log('🔍 baziInfo.liuNian存在:', !!this.baziInfo?.liuNian);
    console.log('🔍 baziInfo.liuNian长度:', this.baziInfo?.liuNian?.length || 0);

    if (this.baziInfo?.daYun && Array.isArray(this.baziInfo.daYun)) {
      console.log('🔍 大运数据长度:', this.baziInfo.daYun.length);
      if (this.baziInfo.daYun[index]) {
        const selectedDaYun = this.baziInfo.daYun[index];
        console.log(`🔍 选中的大运: ${selectedDaYun.ganZhi}, 年份: ${selectedDaYun.startYear}-${selectedDaYun.endYear}`);
      } else {
        console.log(`❌ 索引${index}超出大运数组范围`);
      }
    }

    // 清空容器并重新创建流年表格
    if (this.infoContainer) {
      this.infoContainer.empty();
      this.addLiuNianInfo();
    }
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.addLiuNianInfo();
    }
  }

  /**
   * 获取流年信息区域元素
   */
  getLiuNianSection(): HTMLElement | null {
    return this.liuNianSection;
  }

  /**
   * 重新渲染表格（在展开/收起时调用）
   */
  private reRenderTable() {
    if (!this.infoContainer) return;

    // 清空容器并重新创建流年信息
    this.infoContainer.empty();
    this.addLiuNianInfo();
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
    console.log(`🎯 神煞被点击: ${shenSha}`);

    // 触发神煞点击事件
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

}
