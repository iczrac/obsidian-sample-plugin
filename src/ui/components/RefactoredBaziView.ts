import { BaziInfo } from '../../types/BaziInfo';
import { ExtendedTableManager } from './ExtendedTableManager';
import { DaYunTableManager } from './DaYunTableManager';
import { StyleManager } from './StyleManager';
import { EventManager } from './EventManager';
import { BaziService } from '../../services/BaziService';

/**
 * 重构后的八字视图
 * 使用组合模式，将复杂功能拆分到专门的管理器中
 */
export class RefactoredBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;
  private plugin: any;

  // 管理器实例
  private extendedTableManager: ExtendedTableManager;
  private daYunTableManager: DaYunTableManager;
  private eventManager: EventManager;

  // UI元素引用
  private baziTable: HTMLTableElement | null = null;
  private daYunTable: HTMLElement | null = null;
  private liuNianTable: HTMLElement | null = null;
  private liuYueTable: HTMLElement | null = null;

  // 状态
  private changShengMode: number = 0;
  private readonly CHANG_SHENG_MODES = [
    { key: 'diShi', name: '地势', description: '日干在各地支的十二长生状态' },
    { key: 'ziZuo', name: '自坐', description: '各柱天干相对于各柱地支的十二长生状态' },
    { key: 'yueLing', name: '月令', description: '各柱天干相对于月令的十二长生状态' }
  ];

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;
    this.plugin = plugin;

    // 初始化事件管理器
    this.eventManager = new EventManager();

    // 初始化扩展表格管理器（需要先创建基础表格）
    this.initView();
    
    // 初始化扩展表格管理器
    this.extendedTableManager = new ExtendedTableManager(this.baziInfo, this.baziTable!);

    // 初始化大运表格管理器
    this.daYunTableManager = new DaYunTableManager(
      this.baziInfo,
      this.extendedTableManager,
      (index: number) => this.handleDaYunSelect(index)
    );

    // 设置事件监听器
    this.setupEventListeners();

    console.log('🎯 RefactoredBaziView 初始化完成');
  }

  /**
   * 初始化视图
   */
  private initView() {
    // 清空容器
    this.container.empty();

    // 设置默认神煞显示设置
    this.setupDefaultShenShaSettings();

    // 创建基础UI
    this.createBasicInfo();
    this.createBaziTable();
    this.createQiYunInfo();
    this.createDaYunInfo();
    this.createLiuNianInfo();
    this.createLiuYueInfo();
    this.createWuXingStrengthInfo();
    this.createControlButtons();

    // 应用响应式样式
    const deviceType = StyleManager.detectDeviceType();
    StyleManager.applyResponsiveStyle(this.container, deviceType);
  }

  /**
   * 设置默认神煞显示设置
   */
  private setupDefaultShenShaSettings() {
    if (!this.baziInfo.showShenSha) {
      this.baziInfo.showShenSha = {
        siZhu: true,
        daYun: true,
        liuNian: true,
        xiaoYun: true,
        liuYue: true
      };
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 大运选择事件
    this.eventManager.onDaYunSelect((index: number) => {
      console.log(`🎯 大运选择事件: ${index}`);
      this.handleDaYunSelect(index);
    });

    // 流年选择事件
    this.eventManager.onLiuNianSelect((year: number) => {
      console.log(`🎯 流年选择事件: ${year}`);
      this.handleLiuNianSelect(year);
    });

    // 流月选择事件
    this.eventManager.onLiuYueSelect((liuYue: any) => {
      console.log(`🎯 流月选择事件:`, liuYue);
      this.handleLiuYueSelect(liuYue);
    });

    // 十二长生模式切换事件
    this.eventManager.onChangShengModeToggle((mode: number) => {
      console.log(`🎯 十二长生模式切换事件: ${mode}`);
      this.handleChangShengModeToggle(mode);
    });

    // 样式切换事件
    this.eventManager.onStyleSwitch((style: string) => {
      console.log(`🎯 样式切换事件: ${style}`);
      this.handleStyleSwitch(style);
    });

    // 错误处理事件
    this.eventManager.onError((error: Error) => {
      console.error('🎯 错误事件:', error);
      this.handleError(error);
    });
  }

  /**
   * 处理大运选择
   */
  private handleDaYunSelect(index: number) {
    // 检查daYun是否为数组类型
    if (!this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun) || index >= this.baziInfo.daYun.length) {
      return;
    }

    // 获取选中的大运
    const selectedDaYun = this.baziInfo.daYun[index];
    if (!selectedDaYun || typeof selectedDaYun === 'string') {
      return;
    }

    // 生成或获取流年数据
    let liuNianData = this.baziInfo.liuNian?.filter(ln => {
      const startYear = selectedDaYun.startYear;
      const endYear = selectedDaYun.endYear ?? (startYear + 9);
      return ln.year >= startYear && ln.year <= endYear;
    }) || [];

    if (liuNianData.length === 0) {
      liuNianData = this.generateLiuNianForDaYun(selectedDaYun);
    }

    // 更新扩展表格管理器的数据
    this.extendedTableManager.setCurrentDaYunLiuNianData(liuNianData);

    // 重置流年和流月选择状态
    this.extendedTableManager.resetLiuNianAndLiuYueSelections();

    // 更新流年表格
    this.updateLiuNianTable(liuNianData);

    // 扩展四柱表格到大运层级
    this.extendedTableManager.extendBaziTableToLevel('dayun');
  }

  /**
   * 处理流年选择
   */
  private handleLiuNianSelect(year: number) {
    // 更新扩展表格管理器的选中流年
    this.extendedTableManager.setSelectedLiuNianYear(year);

    // 重置流月选择状态
    this.extendedTableManager.resetLiuYueSelection();

    // 生成或获取流月数据
    const liuYueData = this.generateLiuYueForYear(year);

    // 更新流月表格
    this.updateLiuYueTable(liuYueData);

    // 扩展四柱表格到流年层级
    this.extendedTableManager.extendBaziTableToLevel('liunian');
  }

  /**
   * 处理流月选择
   */
  private handleLiuYueSelect(liuYue: any) {
    // 更新扩展表格管理器的选中流月
    this.extendedTableManager.setCurrentSelectedLiuYue(liuYue);

    // 重置流日和流时选择状态
    this.extendedTableManager.resetLiuRiSelection();

    // 扩展四柱表格到流月层级
    this.extendedTableManager.extendBaziTableToLevel('liuyue');
  }

  /**
   * 处理流日选择
   */
  private handleLiuRiSelect(liuRi: any) {
    // 更新扩展表格管理器的选中流日
    this.extendedTableManager.setCurrentSelectedLiuRi(liuRi);

    // 重置流时选择状态
    this.extendedTableManager.resetLiuShiSelection();

    // 扩展四柱表格到流日层级
    this.extendedTableManager.extendBaziTableToLevel('liuri');
  }

  /**
   * 处理流时选择
   */
  private handleLiuShiSelect(liuShi: any) {
    // 更新扩展表格管理器的选中流时
    this.extendedTableManager.setCurrentSelectedLiuShi(liuShi);

    // 扩展四柱表格到流时层级
    this.extendedTableManager.extendBaziTableToLevel('liushi');
  }

  /**
   * 处理十二长生模式切换
   */
  private handleChangShengModeToggle(mode: number) {
    this.changShengMode = mode;
    this.updateChangShengDisplay();
  }

  /**
   * 处理样式切换
   */
  private handleStyleSwitch(style: string) {
    // TODO: 实现样式切换逻辑
    console.log('TODO: 实现样式切换', style);
  }

  /**
   * 处理错误
   */
  private handleError(error: Error) {
    console.error('RefactoredBaziView 错误:', error);
    // TODO: 显示错误提示
  }

  /**
   * 创建基础信息
   */
  private createBasicInfo() {
    const basicInfoDiv = this.container.createDiv({ cls: 'bazi-basic-info' });

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
  }

  /**
   * 创建八字表格
   */
  private createBaziTable() {
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section' });
    const table = tableSection.createEl('table', { cls: 'bazi-view-table' });
    this.baziTable = table;

    // 创建表头
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: '信息', cls: 'bazi-table-label' });
    ['年柱', '月柱', '日柱', '时柱'].forEach(text => {
      headerRow.createEl('th', { text });
    });

    // 创建表体
    const tbody = table.createEl('tbody');
    this.createTableRows(tbody);
  }

  /**
   * 创建表格行
   */
  private createTableRows(tbody: HTMLElement) {
    // 天干行
    this.createStemRow(tbody);
    // 地支行
    this.createBranchRow(tbody);
    // 藏干行
    this.createHideGanRow(tbody);
    // 十神行
    this.createShiShenRow(tbody);
    // 地势行
    this.createDiShiRow(tbody);
    // 纳音行
    this.createNaYinRow(tbody);
    // 神煞行
    this.createShenShaRow(tbody);
  }

  // 其他方法将在后续文件中实现...
  private createStemRow(tbody: HTMLElement) { /* TODO */ }
  private createBranchRow(tbody: HTMLElement) { /* TODO */ }
  private createHideGanRow(tbody: HTMLElement) { /* TODO */ }
  private createShiShenRow(tbody: HTMLElement) { /* TODO */ }
  private createDiShiRow(tbody: HTMLElement) { /* TODO */ }
  private createNaYinRow(tbody: HTMLElement) { /* TODO */ }
  private createShenShaRow(tbody: HTMLElement) { /* TODO */ }
  private createQiYunInfo() { /* TODO */ }
  private createDaYunInfo() { /* TODO */ }
  private createLiuNianInfo() { /* TODO */ }
  private createLiuYueInfo() { /* TODO */ }
  private createWuXingStrengthInfo() { /* TODO */ }
  private createControlButtons() { /* TODO */ }
  private updateChangShengDisplay() { /* TODO */ }
  private generateLiuNianForDaYun(daYun: any): any[] { return []; }
  private generateLiuYueForYear(year: number): any[] { return []; }
  private updateLiuNianTable(data: any[]) { /* TODO */ }
  private updateLiuYueTable(data: any[]) { /* TODO */ }

  /**
   * 清理资源
   */
  public cleanup() {
    this.eventManager.cleanup();
  }

  /**
   * 更新八字信息
   */
  public updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
    this.extendedTableManager.updateBaziInfo(baziInfo);
    this.daYunTableManager.updateBaziInfo(baziInfo);
    this.initView();
  }
}
