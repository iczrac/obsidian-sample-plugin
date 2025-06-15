import { BaziInfo } from '../../../types/BaziInfo';
import { BaziTableManager } from './BaziTableManager';
import { ExtendedColumnManager } from './ExtendedColumnManager';
import { HorizontalSelectorManager } from './HorizontalSelectorManager';
import { ModalManager } from './ModalManager';
import { StyleAndUtilsManager } from './StyleAndUtilsManager';
import { DaYunTableManager } from '../DaYunTableManager';
import { BaziService } from '../../../services/BaziService';

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

    // 添加表格单元格监听器
    this.addTableCellListeners();

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
   * 添加表格单元格监听器
   */
  private addTableCellListeners() {
    // 添加神煞点击事件
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // 神煞点击事件
      if (target.classList.contains('shensha-tag')) {
        const shenSha = target.textContent?.trim();
        if (shenSha) {
          this.modalManager.showShenShaModal(shenSha, event as MouseEvent);
        }
      }

      // 十二长生模式切换
      if (target.classList.contains('bazi-changsheng-label')) {
        this.styleAndUtilsManager.toggleChangShengMode();
      }
    });

    console.log('✅ 表格单元格监听器添加完成');
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
      // 更新八字信息的设置
      this.baziInfo.showShenSha = settings.showShenSha;
      
      // 重新初始化视图以应用新设置
      this.initView();
      
      console.log('✅ 设置已更新并应用');
    });
  }

  // 临时方法，将在后续实现中完善
  private generateLiuNianForDaYun(_daYun: any): any[] {
    // TODO: 实现流年数据生成逻辑
    return [];
  }

  private createLiuNianTable(container: HTMLElement, _data: any[]) {
    // TODO: 实现流年表格创建逻辑
    container.createEl('div', { text: '流年表格功能开发中...', cls: 'bazi-empty-message' });
  }
}
