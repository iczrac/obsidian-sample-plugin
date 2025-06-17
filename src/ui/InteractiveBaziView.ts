import { BaziInfo } from '../types/BaziInfo';
import { BaziTableManager } from './components/interactive/BaziTableManager';
import { ExtendedColumnManager } from './components/interactive/ExtendedColumnManager';
import { HorizontalSelectorManager } from './components/interactive/HorizontalSelectorManager';
import { ModalManager } from './components/interactive/ModalManager';
import { StyleAndUtilsManager } from './components/interactive/StyleAndUtilsManager';
import { DaYunTableManager } from './components/DaYunTableManager';

import { LiuYueTableManager } from './components/LiuYueTableManager';
import { StyleUtilsService } from '../services/bazi/StyleUtilsService';
import { DataGenerationService } from '../services/bazi/DataGenerationService';
import { InteractionManager } from './components/interactive/InteractionManager';
import { SectionRenderManager } from './components/interactive/SectionRenderManager';

/**
 * 交互式八字命盘视图
 * 重构后的模块化架构，将原来的7000行大文件拆分成多个功能组件
 */
export class InteractiveBaziView {
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

  private liuYueTableManager: LiuYueTableManager;
  private interactionManager: InteractionManager;
  private sectionRenderManager: SectionRenderManager;

  // 表格元素引用
  private baziTable: HTMLTableElement | null = null;
  private daYunTable: HTMLElement | null = null;

  private xiaoYunTable: HTMLElement | null = null;
  private liuYueTable: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;
    this.plugin = plugin;

    // 在容器元素上存储实例引用，以便设置页面可以找到并更新
    (this.container as any).__baziViewInstance = this;

    console.log('🎯 InteractiveBaziView构造函数开始');
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
    // 暂时注释掉，因为DaYunTableManager需要ExtendedTableManager而不是ExtendedColumnManager
    // 我们将在createDaYunInfo中直接创建大运表格
    // this.daYunTableManager = new DaYunTableManager(
    //   this.baziInfo,
    //   this.extendedColumnManager,
    //   (index: number) => this.handleDaYunSelect(index)
    // );

    // 初始化区域渲染管理器
    this.sectionRenderManager = new SectionRenderManager(
      this.container,
      this.baziInfo,
      this.plugin
    );



    // 初始化流月表格管理器
    this.liuYueTableManager = new LiuYueTableManager(
      this.container, // 临时容器，实际使用时会传入正确的容器
      this.baziInfo,
      (liuyue) => this.handleLiuYueSelect(liuyue)
    );

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
    this.sectionRenderManager.createHeader();
    this.createBaziTable();
    this.sectionRenderManager.createSpecialInfo();
    this.createDaYunInfo();
    this.createLiuNianInfo();
    this.createLiuYueInfo();
    this.createLiuRiInfo();
    this.createLiuShiInfo();

    // 初始化交互管理器
    this.interactionManager.initialize();

    // 设置事件监听器
    this.setupEventListeners();

    // 默认选中第一个大运
    if (this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
      this.selectDaYun(0);
    }

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
   * 创建大运信息
   */
  private createDaYunInfo() {
    // 使用SectionRenderManager创建大运区域
    this.sectionRenderManager.createDaYunInfo();

    // 获取大运表格容器
    this.daYunTable = this.sectionRenderManager.getContainer('dayun-table');

    // 创建简化的大运表格
    if (this.daYunTable && this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
      this.createSimpleDaYunTable();
    }

    console.log('✅ 大运信息创建完成');
  }

  /**
   * 创建简化的大运表格
   */
  private createSimpleDaYunTable() {
    if (!this.daYunTable || !this.baziInfo.daYun) return;

    // 清空容器
    this.daYunTable.empty();

    // 创建表格
    const table = this.daYunTable.createEl('table', { cls: 'bazi-view-table bazi-dayun-table' });

    // 创建干支行（最重要的行）
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '大运' });

    const daYunData = Array.isArray(this.baziInfo.daYun) ? this.baziInfo.daYun : [];
    daYunData.slice(0, 10).forEach((dy, index) => {
      const cell = gzRow.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      // 显示干支
      if (dy.ganZhi) {
        StyleUtilsService.createGanZhiElement(cell, dy.ganZhi, 'ganzhi-display');
      } else {
        cell.textContent = '未知';
      }

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-dayun-cell').forEach(c => {
          c.classList.remove('selected');
        });
        cell.classList.add('selected');

        // 处理大运选择
        this.handleDaYunSelect(index);
      });
    });

    // 创建年龄行
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    daYunData.slice(0, 10).forEach(dy => {
      ageRow.createEl('td', { text: `${dy.startAge}-${dy.endAge || dy.startAge + 9}` });
    });
  }

  /**
   * 创建流年信息
   */
  private createLiuNianInfo() {
    // 使用SectionRenderManager创建流年区域
    this.sectionRenderManager.createLiuNianInfo();

    console.log('✅ 流年信息创建完成');
  }



  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
    // 使用SectionRenderManager创建流月区域
    this.sectionRenderManager.createLiuYueInfo();

    console.log('✅ 流月信息创建完成');
  }

  /**
   * 创建流日信息
   */
  private createLiuRiInfo() {
    // 使用SectionRenderManager创建流日区域
    this.sectionRenderManager.createLiuRiInfo();

    console.log('✅ 流日信息创建完成');
  }

  /**
   * 创建流时信息
   */
  private createLiuShiInfo() {
    // 使用SectionRenderManager创建流时区域
    this.sectionRenderManager.createLiuShiInfo();

    console.log('✅ 流时信息创建完成');
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

    // 监听神煞点击事件
    this.container.addEventListener('shensha-click', (e: CustomEvent) => {
      this.handleShenShaClick(e.detail.shenSha);
    });

    // 监听DOM事件 - 流年选择
    this.container.addEventListener('liunian-select', (event: CustomEvent) => {
      console.log(`🎯 收到流年选择事件: ${event.detail.year}`);
      console.log(`🎯 当前流月表格容器:`, this.liuYueTable);
      this.handleLiuNianSelect({ year: event.detail.year });
    });

    // 监听DOM事件 - 流月选择
    this.container.addEventListener('liuyue-select', (event: CustomEvent) => {
      console.log(`🎯 收到流月选择事件: ${event.detail.liuyue.month}月`);
      this.handleLiuYueSelect(event.detail.liuyue);
    });

    // 监听DOM事件 - 流日选择
    this.container.addEventListener('liuri-select', (event: CustomEvent) => {
      console.log(`🎯 收到流日选择事件: ${event.detail.liuri.day}日`);
      this.handleLiuRiSelect(event.detail.liuri);
    });

    // 监听DOM事件 - 流时选择
    this.container.addEventListener('liushi-select', (event: CustomEvent) => {
      console.log(`🎯 收到流时选择事件: ${event.detail.liushi.name}`);
      this.handleLiuShiSelect(event.detail.liushi);
    });

    console.log('✅ 事件监听器设置完成');
  }

  /**
   * 选择大运
   * @param index 大运索引
   */
  private selectDaYun(index: number) {
    if (!this.baziInfo.daYun || index >= this.baziInfo.daYun.length) {
      return;
    }

    console.log(`🎯 选择大运: ${index}`);

    // 更新扩展列管理器的选中大运
    this.extendedColumnManager.setSelectedDaYunIndex(index);

    // 扩展四柱表格到大运层级
    this.extendedColumnManager.extendBaziTableToLevel('dayun');

    // 通知SectionRenderManager更新流年信息
    this.sectionRenderManager.updateDaYunSelection(index);
  }

  /**
   * 处理大运选择（事件处理器）
   */
  private handleDaYunSelect(index: number) {
    console.log(`🎯 处理大运选择: 索引 ${index}`);
    this.selectDaYun(index);

    // 扩展四柱表格到大运层级
    this.extendedColumnManager.extendBaziTableToLevel('dayun');

    // 重置下级选择状态
    this.resetLowerLevelSelections('dayun');
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
   * 更新八字信息
   * @param updatedBaziInfo 更新后的八字信息
   */
  updateBaziInfo(updatedBaziInfo: any): void {
    console.log('🎯 更新八字信息:', updatedBaziInfo);

    // 更新内部八字信息
    this.baziInfo = updatedBaziInfo;

    // 更新区域渲染管理器的八字信息
    this.sectionRenderManager.updateBaziInfo(updatedBaziInfo);

    // 重新渲染整个视图
    this.initView();
  }

  /**
   * 选择流日
   * @param year 年份
   * @param month 月份
   * @param day 日期
   */
  private selectLiuRi(year: number, month: number, day: number) {
    console.log(`🎯 选择流日: ${year}-${month}-${day}`);

    // 更新扩展列管理器的选中流日
    this.extendedColumnManager.setCurrentSelectedLiuRi({ year, month, day });

    // 扩展四柱表格到流日层级
    this.extendedColumnManager.extendBaziTableToLevel('liuri');
  }

  /**
   * 选择流时
   * @param liuShi 流时数据对象
   */
  private selectLiuShi(liuShi: any) {
    console.log(`🎯 选择流时: ${liuShi.year}-${liuShi.month}-${liuShi.day} ${liuShi.name} (${liuShi.ganZhi})`);

    // 更新扩展列管理器的选中流时（传递完整对象）
    this.extendedColumnManager.setCurrentSelectedLiuShi(liuShi);

    // 扩展四柱表格到流时层级
    this.extendedColumnManager.extendBaziTableToLevel('liushi');
  }

  /**
   * 处理神煞点击事件
   * @param shenSha 神煞名称
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 处理神煞点击: ${shenSha}`);

    // 创建一个模拟的鼠标事件
    const mockEvent = new MouseEvent('click', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });

    // 使用模态框管理器显示神煞解释
    this.modalManager.showShenShaModal(shenSha, mockEvent);
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
   * 选择流年
   * @param year 流年年份
   */
  private selectLiuNian(year: number) {
    console.log(`🎯 选择流年: ${year}`);

    // 更新扩展列管理器的选中流年
    this.extendedColumnManager.setSelectedLiuNianYear(year);

    // 扩展四柱表格到流年层级
    this.extendedColumnManager.extendBaziTableToLevel('liunian');
  }

  /**
   * 重置下级选择状态
   * @param currentLevel 当前选择的层级
   */
  private resetLowerLevelSelections(currentLevel: string) {
    console.log(`🔄 重置下级选择状态: ${currentLevel}`);

    const levels = ['dayun', 'liunian', 'liuyue', 'liuri', 'liushi'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex === -1) return;

    // 重置当前层级之后的所有层级
    for (let i = currentIndex + 1; i < levels.length; i++) {
      const level = levels[i];
      switch (level) {
        case 'liunian':
          this.extendedColumnManager.setSelectedLiuNianYear(0);
          break;
        case 'liuyue':
          this.extendedColumnManager.setCurrentSelectedLiuYue(null);
          break;
        case 'liuri':
          this.extendedColumnManager.setCurrentSelectedLiuRi(null);
          break;
        case 'liushi':
          this.extendedColumnManager.setCurrentSelectedLiuShi(null);
          break;
      }
    }
  }

  /**
   * 处理流年选择
   * @param liunian 流年数据
   */
  private handleLiuNianSelect(liunian: any) {
    console.log(`🎯 处理流年选择: ${liunian.year}`);

    this.selectLiuNian(liunian.year);

    // 重置下级选择状态
    this.resetLowerLevelSelections('liunian');

    // 流月数据现在由LiuYueInfoManager自动处理
    console.log(`✅ 流年选择完成，流月信息将自动更新`);
  }







  /**
   * 选择流月
   * @param liuYue 流月数据
   */
  private selectLiuYue(liuYue: any) {
    console.log(`🎯 选择流月: ${liuYue.month}月 (${liuYue.ganZhi})`);

    // 更新扩展列管理器的选中流月
    this.extendedColumnManager.setCurrentSelectedLiuYue(liuYue);

    // 扩展四柱表格到流月层级
    this.extendedColumnManager.extendBaziTableToLevel('liuyue');

    // 生成流日数据并显示流日选择器（使用干支而不是月份数字）
    const liuRiData = DataGenerationService.generateLiuRiForMonth(liuYue.year, liuYue.ganZhi, this.baziInfo.dayStem || '甲');
    this.horizontalSelectorManager.showLiuRiSelector(
      liuYue.year,
      liuYue.ganZhi,
      liuRiData,
      (year, month, day) => {
        this.handleLiuRiSelect({ year, month, day });
      }
    );
  }



  /**
   * 生成并显示流日数据
   * @param year 年份
   * @param monthGanZhi 月份干支
   */
  private generateAndShowLiuRiData(year: number, monthGanZhi: string) {
    console.log(`🔄 生成流日数据: ${year}年 ${monthGanZhi}`);

    // 获取日干用于计算
    const dayStem = this.baziInfo.dayStem || '甲';

    // 生成流日数据（使用后端算法）
    const liuRiData = DataGenerationService.generateLiuRiForMonth(year, monthGanZhi, dayStem);

    // 显示流日选择器
    this.horizontalSelectorManager.showLiuRiSelector(
      year,
      monthGanZhi,
      liuRiData,
      (selectedYear, selectedMonth, selectedDay) => {
        this.handleLiuRiSelect({ year: selectedYear, month: selectedMonth, day: selectedDay });
      }
    );
  }

  /**
   * 生成并显示流时数据
   * @param year 年份
   * @param month 月份
   * @param day 日期
   */
  private generateAndShowLiuShiData(year: number, month: number, day: number) {
    console.log(`🔄 生成流时数据: ${year}年 ${month}月 ${day}日`);

    // 获取日干用于计算
    const dayStem = this.baziInfo.dayStem || '甲';

    // 生成流时数据（使用后端算法，传递baziInfo以获取流派设置）
    const liuShiData = DataGenerationService.generateLiuShiForDay(year, month, day, dayStem, this.baziInfo);

    // 显示流时选择器
    this.horizontalSelectorManager.showLiuShiSelector(
      year,
      month,
      day,
      liuShiData,
      (liuShi) => {
        this.handleLiuShiSelect(liuShi);
      }
    );
  }

  /**
   * 处理流月选择
   * @param liuYue 流月数据
   */
  private handleLiuYueSelect(liuYue: any) {
    console.log(`🎯 处理流月选择: ${liuYue.year}年 ${liuYue.month}`);
    this.selectLiuYue(liuYue);

    // 扩展四柱表格到流月层级
    this.extendedColumnManager.extendBaziTableToLevel('liuyue');

    // 重置下级选择状态
    this.resetLowerLevelSelections('liuyue');

    // 生成并显示流日数据（使用干支而不是月份数字）
    this.generateAndShowLiuRiData(liuYue.year, liuYue.ganZhi);
  }

  /**
   * 处理流日选择
   * @param liuRi 流日数据
   */
  private handleLiuRiSelect(liuRi: any) {
    console.log(`🎯 处理流日选择: ${liuRi.year}年 ${liuRi.month} ${liuRi.day}日`);
    this.selectLiuRi(liuRi.year, liuRi.month, liuRi.day);

    // 扩展四柱表格到流日层级
    this.extendedColumnManager.extendBaziTableToLevel('liuri');

    // 重置下级选择状态
    this.resetLowerLevelSelections('liuri');

    // 生成并显示流时数据
    this.generateAndShowLiuShiData(liuRi.year, liuRi.month, liuRi.day);
  }

  /**
   * 处理流时选择
   * @param liuShi 流时数据
   */
  private handleLiuShiSelect(liuShi: any) {
    console.log(`🎯 处理流时选择: ${liuShi.year}年 ${liuShi.month} ${liuShi.day}日 ${liuShi.name} (${liuShi.ganZhi})`);

    // 传递完整的流时对象，而不是分解的字段
    this.selectLiuShi(liuShi);

    // 扩展四柱表格到流时层级
    this.extendedColumnManager.extendBaziTableToLevel('liushi');

    // 重置下级选择状态
    this.resetLowerLevelSelections('liushi');
  }

  /**
   * 更新神煞显示设置
   * @param showShenSha 神煞显示设置
   */
  public updateShenShaSettings(showShenSha: any): void {
    this.baziInfo.showShenSha = showShenSha;
    console.log('🎯 更新神煞显示设置:', showShenSha);

    // 更新八字表格管理器的神煞设置
    if (this.baziTableManager) {
      // BaziTableManager 会根据 baziInfo.showShenSha 自动处理显示逻辑
      // 重新创建表格以应用新设置
      this.createBaziTable();
    }

    // 更新大运表格管理器的神煞设置
    if (this.daYunTableManager) {
      this.daYunTableManager.updateShenShaSettings(showShenSha);
    }



    // 更新流月表格管理器的神煞设置
    if (this.liuYueTableManager) {
      this.liuYueTableManager.updateShenShaSettings(showShenSha);
    }
  }



}
