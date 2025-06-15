import { BaziInfo } from '../../../types/BaziInfo';
import { BaziTableManager } from './BaziTableManager';
import { ExtendedColumnManager } from './ExtendedColumnManager';
import { HorizontalSelectorManager } from './HorizontalSelectorManager';
import { ModalManager } from './ModalManager';
import { StyleAndUtilsManager } from './StyleAndUtilsManager';
import { DaYunTableManager } from '../DaYunTableManager';
import { BaziService } from '../../../services/BaziService';
import { ExplanationServiceManager } from '../../../services/ExplanationServiceManager';
import { PillarCalculationService } from '../../../services/bazi/PillarCalculationService';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';
import { InteractionManager } from './InteractionManager';

/**
 * 重构后的交互式八字命盘视图
 * 将原来的7000行大文件拆分成多个功能组件
 */
export class RefactoredInteractiveBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;
  private plugin: any;

  // 功能组件管理器
  private baziTableManager: BaziTableManager;
  private extendedColumnManager: ExtendedColumnManager;
  private horizontalSelectorManager: HorizontalSelectorManager;
  private modalManager: ModalManager;
  private styleAndUtilsManager: StyleAndUtilsManager;
  private daYunTableManager: DaYunTableManager;
  private interactionManager: InteractionManager;

  // 表格元素引用
  private baziTable: HTMLTableElement | null = null;
  private daYunTable: HTMLElement | null = null;
  private liuNianTable: HTMLElement | null = null;
  private xiaoYunTable: HTMLElement | null = null;
  private liuYueTable: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;
    this.plugin = plugin;

    // 在容器元素上存储实例引用，以便设置页面可以找到并更新
    (this.container as any).__baziViewInstance = this;

    console.log('🎯 RefactoredInteractiveBaziView构造函数开始');
    console.log('🎯 接收到的baziInfo.showShenSha:', this.baziInfo.showShenSha);

    // 设置默认的神煞显示设置
    if (!this.baziInfo.showShenSha) {
      this.baziInfo.showShenSha = {
        siZhu: true,
        daYun: true,
        liuNian: true,
        xiaoYun: true,
        liuYue: true
      };
      console.log('🎯 使用默认神煞显示设置:', this.baziInfo.showShenSha);
    } else {
      console.log('🎯 使用传递的神煞显示设置:', this.baziInfo.showShenSha);
    }

    // 初始化功能组件
    this.initializeComponents();

    // 初始化视图
    this.initView();
  }

  /**
   * 初始化功能组件
   */
  private initializeComponents() {
    // 初始化八字表格管理器
    this.baziTableManager = new BaziTableManager(this.container, this.baziInfo);

    // 初始化扩展列管理器
    this.extendedColumnManager = new ExtendedColumnManager(this.baziInfo);

    // 初始化横向选择器管理器
    this.horizontalSelectorManager = new HorizontalSelectorManager(this.container, this.baziInfo);

    // 初始化模态框管理器
    this.modalManager = new ModalManager(this.container, this.baziInfo);

    // 初始化样式和工具管理器
    this.styleAndUtilsManager = new StyleAndUtilsManager(this.container, this.plugin);

    // 初始化大运表格管理器
    // 注意：这里需要传入正确的ExtendedTableManager类型，暂时注释掉
    // this.daYunTableManager = new DaYunTableManager(
    //   this.baziInfo,
    //   this.extendedColumnManager,
    //   (index: number) => this.handleDaYunSelect(index)
    // );

    // 初始化交互管理器
    this.interactionManager = new InteractionManager(
      this.container,
      this.baziInfo,
      this.modalManager,
      this.styleAndUtilsManager,
      this.extendedColumnManager,
      this.horizontalSelectorManager
    );

    console.log('✅ 所有功能组件初始化完成');
  }

  /**
   * 初始化视图
   */
  private initView() {
    // 清空容器
    this.container.empty();

    // 重置扩展状态
    this.resetExtendedState();

    // 创建视图组件
    this.createHeader();
    this.createBaziTable();
    this.createSpecialInfo();
    this.createDaYunInfo();
    this.createLiuNianInfo();
    this.createLiuYueInfo();
    this.createLiuRiInfo();
    this.createLiuShiInfo();

    // 初始化交互管理器
    this.interactionManager.initialize();

    // 设置事件监听器
    this.setupEventListeners();

    console.log('✅ 视图初始化完成');
  }

  /**
   * 重置扩展状态
   */
  private resetExtendedState() {
    // 重置扩展列管理器状态
    this.extendedColumnManager.setSelectedDaYunIndex(0);
    this.extendedColumnManager.setSelectedLiuNianYear(0);
    this.extendedColumnManager.setCurrentSelectedLiuYue(null);
    this.extendedColumnManager.setCurrentSelectedLiuRi(null);
    this.extendedColumnManager.setCurrentSelectedLiuShi(null);
  }

  /**
   * 创建头部
   */
  private createHeader() {
    const header = this.container.createDiv({ cls: 'bazi-view-header' });

    // 创建标题
    const title = header.createEl('h2', { text: '八字命盘' });
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: var(--text-normal);
      font-size: 24px;
      font-weight: bold;
    `;

    // 创建按钮容器
    const buttonContainer = header.createDiv({ cls: 'bazi-header-buttons' });
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    `;

    // 切换样式按钮
    const switchStyleBtn = buttonContainer.createEl('button', { text: '切换样式' });
    switchStyleBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 14px;
    `;
    switchStyleBtn.addEventListener('click', () => {
      this.styleAndUtilsManager.switchStyle();
    });

    // 设置按钮
    const settingsBtn = buttonContainer.createEl('button', { text: '设置' });
    settingsBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 14px;
    `;
    settingsBtn.addEventListener('click', () => {
      this.openSettingsModal();
    });
  }

  /**
   * 创建八字表格
   */
  private createBaziTable() {
    this.baziTable = this.baziTableManager.createBaziTable();
    
    // 设置扩展列管理器的表格引用
    this.extendedColumnManager.setBaziTable(this.baziTable);

    console.log('✅ 八字表格创建完成');
  }

  /**
   * 创建特殊信息
   */
  private createSpecialInfo() {
    // 这里可以添加特殊信息的创建逻辑
    // 如格局、五行强度等
    console.log('✅ 特殊信息创建完成');
  }

  /**
   * 创建大运信息
   */
  private createDaYunInfo() {
    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      console.log('⚠️ 没有大运数据，跳过大运信息创建');
      return;
    }

    const daYunSection = this.container.createDiv({ cls: 'bazi-view-section' });
    daYunSection.createEl('h3', { text: '大运信息' });

    // 创建大运表格容器
    this.daYunTable = daYunSection.createEl('div', { cls: 'bazi-dayun-container' });

    // 使用大运表格管理器创建表格
    // 暂时注释掉，因为DaYunTableManager需要重构
    // this.daYunTableManager.setDaYunTable(this.daYunTable);
    // this.daYunTableManager.updateDaYunTable(this.baziInfo.daYun || []);

    // 临时创建简单的大运表格
    this.daYunTable.createEl('div', { text: '大运表格功能开发中...', cls: 'bazi-empty-message' });

    console.log('✅ 大运信息创建完成');
  }

  /**
   * 创建流年信息
   */
  private createLiuNianInfo() {
    // 创建流年和小运部分
    const liuNianSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liunian-section' });
    liuNianSection.createEl('h3', { text: '流年信息' });

    // 创建流年表格容器
    this.liuNianTable = liuNianSection.createEl('div', { cls: 'bazi-liunian-container' });

    // 初始显示提示信息
    this.liuNianTable.createEl('div', { 
      text: '请先选择大运', 
      cls: 'bazi-empty-message' 
    });

    console.log('✅ 流年信息创建完成');
  }

  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
    if (!this.baziInfo.liuYue || this.baziInfo.liuYue.length === 0) {
      console.log('⚠️ 没有流月数据，跳过流月信息创建');
      return;
    }

    const liuYueSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuyue-section' });
    liuYueSection.createEl('h3', { text: '流月信息' });

    // 创建流月表格容器
    this.liuYueTable = liuYueSection.createEl('div', { cls: 'bazi-liuyue-container' });

    // 初始显示提示信息
    this.liuYueTable.createEl('div', { 
      text: '请先选择流年', 
      cls: 'bazi-empty-message' 
    });

    console.log('✅ 流月信息创建完成');
  }

  /**
   * 创建流日信息（不再创建固定的section，改为动态创建）
   */
  private createLiuRiInfo() {
    // 不再创建固定的流日信息section，改为在HorizontalSelectorManager中动态创建
    console.log('✅ 流日信息将在选择流月时动态创建');
  }

  /**
   * 创建流时信息（不再创建固定的section，改为动态创建）
   */
  private createLiuShiInfo() {
    // 不再创建固定的流时信息section，改为在HorizontalSelectorManager中动态创建
    console.log('✅ 流时信息将在选择流日时动态创建');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    const eventManager = this.interactionManager.getEventManager();

    // 监听大运选择事件
    eventManager.on('dayun:select', (index: number) => {
      this.handleDaYunSelect(index);
    });

    // 监听流年选择事件
    eventManager.on('liunian:select', (year: number) => {
      this.handleLiuNianSelect({ year });
    });

    // 监听流月选择事件
    eventManager.on('liuyue:select', (data: any) => {
      this.handleLiuYueSelect(data);
    });

    // 监听设置更新事件
    eventManager.on('settings:update', (settings: any) => {
      this.handleSettingsUpdate(settings);
    });

    console.log('✅ 事件监听器设置完成');
  }

  /**
   * 处理大运选择
   */
  private handleDaYunSelect(index: number) {
    console.log(`🎯 选择大运: ${index}`);
    
    // 更新扩展列管理器的选中大运
    this.extendedColumnManager.setSelectedDaYunIndex(index);

    // 扩展四柱表格到大运层级
    this.extendedColumnManager.extendBaziTableToLevel('dayun');

    // 生成流年数据并更新流年表格
    this.updateLiuNianTable(index);
  }

  /**
   * 更新流年表格
   */
  private updateLiuNianTable(daYunIndex: number) {
    if (!this.liuNianTable) return;

    // 清空现有内容
    this.liuNianTable.empty();

    // 获取大运数据
    const daYun = this.baziInfo.daYun?.[daYunIndex];
    if (!daYun) {
      this.liuNianTable.createEl('div', { 
        text: '无法获取大运数据', 
        cls: 'bazi-empty-message' 
      });
      return;
    }

    // 生成流年数据
    const liuNianData = this.generateLiuNianForDaYun(daYun);

    // 创建流年表格
    this.createLiuNianTable(this.liuNianTable, liuNianData);
  }

  /**
   * 打开设置模态框
   */
  private openSettingsModal() {
    this.modalManager.showSettingsModal((settings) => {
      this.handleSettingsUpdate(settings);
    });
  }

  /**
   * 处理设置更新
   */
  private handleSettingsUpdate(settings: any) {
    // 更新八字信息的设置
    this.baziInfo.showShenSha = settings.showShenSha;

    // 重新初始化视图以应用新设置
    this.initView();

    console.log('✅ 设置已更新并应用');
  }

  /**
   * 为指定大运生成流年数据
   * @param daYun 大运信息
   * @returns 流年数据数组
   */
  private generateLiuNianForDaYun(daYun: any): any[] {
    return DataGenerationService.generateLiuNianForDaYun(daYun);
  }

  /**
   * 创建流年表格
   * @param container 容器元素
   * @param data 流年数据
   */
  private createLiuNianTable(container: HTMLElement, data: any[]) {
    if (!data || data.length === 0) {
      container.createEl('div', {
        text: '无流年数据',
        cls: 'bazi-empty-message'
      });
      return;
    }

    // 创建表格
    const table = container.createEl('table', { cls: 'bazi-view-table bazi-liunian-table' });

    // 创建表头
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: '年份' });
    headerRow.createEl('th', { text: '干支' });
    headerRow.createEl('th', { text: '操作' });

    // 创建表体
    const tbody = table.createEl('tbody');

    data.forEach((liunian, index) => {
      const row = tbody.createEl('tr', { cls: 'bazi-liunian-row' });

      // 年份列
      const yearCell = row.createEl('td', {
        text: liunian.year.toString(),
        cls: 'bazi-liunian-year'
      });

      // 干支列
      const ganZhiCell = row.createEl('td', { cls: 'bazi-liunian-ganzhi' });
      StyleUtilsService.createGanZhiElement(ganZhiCell, liunian.ganZhi, 'ganzhi-display');

      // 操作列
      const actionCell = row.createEl('td', { cls: 'bazi-liunian-action' });
      const selectBtn = actionCell.createEl('button', {
        text: '选择',
        cls: 'bazi-select-button'
      });

      // 添加点击事件
      selectBtn.addEventListener('click', () => {
        // 高亮选中的行
        tbody.querySelectorAll('.bazi-liunian-row').forEach(r => {
          r.classList.remove('selected');
        });
        row.classList.add('selected');

        // 处理流年选择
        this.handleLiuNianSelect(liunian);
      });

      // 默认选中第一个
      if (index === 0) {
        selectBtn.click();
      }
    });
  }

  /**
   * 处理流年选择
   * @param liunian 流年数据
   */
  private handleLiuNianSelect(liunian: any) {
    console.log(`🎯 选择流年: ${liunian.year} (${liunian.ganZhi})`);

    // 更新扩展列管理器的选中流年
    this.extendedColumnManager.setSelectedLiuNianYear(liunian.year);

    // 扩展四柱表格到流年层级
    this.extendedColumnManager.extendBaziTableToLevel('liunian');

    // 生成流月数据并更新流月表格
    this.updateLiuYueTable(liunian.year);
  }

  /**
   * 更新流月表格
   * @param year 年份
   */
  private updateLiuYueTable(year: number) {
    if (!this.liuYueTable) return;

    // 清空现有内容
    this.liuYueTable.empty();

    // 生成流月数据
    const liuYueData = DataGenerationService.generateLiuYueForYear(year);

    // 创建流月表格
    this.createLiuYueTable(this.liuYueTable, liuYueData);
  }

  /**
   * 创建流月表格
   * @param container 容器元素
   * @param data 流月数据
   */
  private createLiuYueTable(container: HTMLElement, data: any[]) {
    if (!data || data.length === 0) {
      container.createEl('div', {
        text: '无流月数据',
        cls: 'bazi-empty-message'
      });
      return;
    }

    // 创建流月表格
    const table = container.createEl('table', { cls: 'bazi-view-table bazi-liuyue-table' });

    // 创建表头
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: '月份' });
    headerRow.createEl('th', { text: '干支' });
    headerRow.createEl('th', { text: '开始' });

    // 创建表体
    const tbody = table.createEl('tbody');

    data.forEach((liuyue, index) => {
      const row = tbody.createEl('tr', { cls: 'bazi-liuyue-row' });

      // 月份列
      row.createEl('td', {
        text: liuyue.name,
        cls: 'bazi-liuyue-month'
      });

      // 干支列
      const ganZhiCell = row.createEl('td', { cls: 'bazi-liuyue-ganzhi' });
      StyleUtilsService.createGanZhiElement(ganZhiCell, liuyue.ganZhi, 'ganzhi-display');

      // 开始日期列
      row.createEl('td', {
        text: liuyue.startDate,
        cls: 'bazi-liuyue-start'
      });

      // 添加点击事件
      row.addEventListener('click', () => {
        // 高亮选中的行
        tbody.querySelectorAll('.bazi-liuyue-row').forEach(r => {
          r.classList.remove('selected');
        });
        row.classList.add('selected');

        // 处理流月选择
        this.handleLiuYueSelect(liuyue);
      });

      // 默认选中第一个
      if (index === 0) {
        row.click();
      }
    });
  }

  /**
   * 处理流月选择
   * @param liuYue 流月数据
   */
  private handleLiuYueSelect(liuYue: any) {
    console.log(`🎯 选择流月: ${liuYue.month}月 (${liuYue.ganZhi})`);

    // 更新扩展列管理器的选中流月
    this.extendedColumnManager.setCurrentSelectedLiuYue(liuYue);

    // 扩展四柱表格到流月层级
    this.extendedColumnManager.extendBaziTableToLevel('liuyue');

    // 生成流日数据并显示流日选择器
    const liuRiData = DataGenerationService.generateLiuRiForMonth(liuYue.year, liuYue.month);
    this.horizontalSelectorManager.showLiuRiSelector(
      liuYue.year,
      liuYue.ganZhi,
      liuRiData,
      (year, month, day) => {
        this.handleLiuRiSelect(year, month, day);
      }
    );
  }

  /**
   * 处理流日选择
   * @param year 年份
   * @param month 月份
   * @param day 日期
   */
  private handleLiuRiSelect(year: number, month: number, day: number) {
    console.log(`🎯 选择流日: ${year}-${month}-${day}`);

    // 更新扩展列管理器的选中流日
    this.extendedColumnManager.setCurrentSelectedLiuRi({ year, month, day });

    // 扩展四柱表格到流日层级
    this.extendedColumnManager.extendBaziTableToLevel('liuri');

    // 生成流时数据并显示流时选择器
    const liuShiData = DataGenerationService.generateLiuShiForDay(year, month, day);
    this.horizontalSelectorManager.showLiuShiSelector(
      year,
      month,
      day,
      liuShiData,
      (timeIndex, ganZhi, name) => {
        this.handleLiuShiSelect(timeIndex, ganZhi, name);
      }
    );
  }

  /**
   * 处理流时选择
   * @param timeIndex 时辰索引
   * @param ganZhi 干支
   * @param name 时辰名称
   */
  private handleLiuShiSelect(timeIndex: number, ganZhi: string, name: string) {
    console.log(`🎯 选择流时: ${name} (${ganZhi})`);

    // 更新扩展列管理器的选中流时
    this.extendedColumnManager.setCurrentSelectedLiuShi({ timeIndex, ganZhi, name });

    // 扩展四柱表格到流时层级
    this.extendedColumnManager.extendBaziTableToLevel('liushi');
  }
}
