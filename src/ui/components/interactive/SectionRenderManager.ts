import { BaziInfo } from '../../../types/BaziInfo';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { SpecialInfoManager } from './SpecialInfoManager';

/**
 * 区域渲染管理器
 * 负责创建和管理八字视图的各个区域
 */
export class SectionRenderManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;
  private specialInfoManager: SpecialInfoManager | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
  }

  /**
   * 创建标题区域
   */
  createHeader(): HTMLElement {
    const headerSection = this.container.createDiv({ cls: 'bazi-view-section bazi-header' });

    // 创建标题
    const title = headerSection.createEl('h2', {
      text: '八字命盘',
      cls: 'bazi-view-title'
    });
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: var(--text-normal);
      font-size: 24px;
      font-weight: bold;
    `;

    // 创建按钮容器
    const buttonContainer = headerSection.createDiv({ cls: 'bazi-header-buttons' });
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    `;

    // 设置按钮
    const settingsBtn = this.createButton('设置', 'bazi-settings-btn');
    buttonContainer.appendChild(settingsBtn);

    return headerSection;
  }

  /**
   * 创建特殊信息区域
   */
  createSpecialInfo(): HTMLElement {
    // 创建特殊信息管理器
    this.specialInfoManager = new SpecialInfoManager(this.container, this.baziInfo, this.plugin);

    // 创建特殊信息区域
    return this.specialInfoManager.createSpecialInfo();
  }

  /**
   * 创建大运信息区域
   */
  createDaYunInfo(): HTMLElement {
    const daYunSection = this.container.createDiv({ cls: 'bazi-view-section bazi-dayun-section' });
    daYunSection.createEl('h3', { text: '大运信息', cls: 'bazi-view-subtitle' });

    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      daYunSection.createEl('div', {
        text: '暂无大运数据（需要指定性别和年份）',
        cls: 'bazi-empty-message'
      });
      return daYunSection;
    }

    // 添加起运信息
    this.addQiYunInfo(daYunSection);

    // 创建大运表格容器（由DaYunTableManager处理具体表格）
    const tableContainer = daYunSection.createDiv({ cls: 'bazi-dayun-container' });
    tableContainer.setAttribute('data-section-type', 'dayun-table');

    return daYunSection;
  }

  /**
   * 创建流年信息区域
   */
  createLiuNianInfo(): HTMLElement {
    const liuNianSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liunian-section' });
    liuNianSection.createEl('h3', { text: '流年信息', cls: 'bazi-view-subtitle' });

    // 创建流年表格容器（由LiuNianTableManager处理具体表格）
    const tableContainer = liuNianSection.createDiv({ cls: 'bazi-liunian-container' });
    tableContainer.setAttribute('data-section-type', 'liunian-table');

    return liuNianSection;
  }

  /**
   * 创建流月信息区域
   */
  createLiuYueInfo(): HTMLElement {
    const liuYueSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuyue-section' });
    liuYueSection.createEl('h3', { text: '流月信息', cls: 'bazi-view-subtitle' });

    // 创建流月表格容器（由LiuYueTableManager处理具体表格）
    const tableContainer = liuYueSection.createDiv({ cls: 'bazi-liuyue-container' });
    tableContainer.setAttribute('data-section-type', 'liuyue-table');

    return liuYueSection;
  }

  /**
   * 创建流日信息区域
   */
  createLiuRiInfo(): HTMLElement {
    const liuRiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuri-section' });
    liuRiSection.createEl('h3', { text: '流日信息', cls: 'bazi-view-subtitle' });

    // 创建流日表格容器
    const tableContainer = liuRiSection.createDiv({ cls: 'bazi-liuri-container' });
    tableContainer.setAttribute('data-section-type', 'liuri-table');

    return liuRiSection;
  }

  /**
   * 创建流时信息区域
   */
  createLiuShiInfo(): HTMLElement {
    const liuShiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liushi-section' });
    liuShiSection.createEl('h3', { text: '流时信息', cls: 'bazi-view-subtitle' });

    // 创建流时表格容器
    const tableContainer = liuShiSection.createDiv({ cls: 'bazi-liushi-container' });
    tableContainer.setAttribute('data-section-type', 'liushi-table');

    return liuShiSection;
  }

  /**
   * 创建按钮
   */
  private createButton(text: string, className: string): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--background-modifier-hover)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'var(--background-secondary)';
    });

    return button;
  }

  /**
   * 添加起运信息
   */
  private addQiYunInfo(container: HTMLElement) {
    if (!this.baziInfo.daYunStartAge) return;

    const qiYunDiv = container.createDiv({ cls: 'bazi-qiyun-info' });
    qiYunDiv.style.cssText = `
      margin: 12px 0;
      padding: 8px 12px;
      background: var(--background-modifier-form-field);
      border-radius: 4px;
      font-size: 14px;
      color: var(--text-muted);
    `;

    qiYunDiv.textContent = `起运年龄：${this.baziInfo.daYunStartAge}岁`;
  }

  /**
   * 获取特殊信息管理器
   */
  getSpecialInfoManager(): SpecialInfoManager | null {
    return this.specialInfoManager;
  }

  /**
   * 获取指定类型的容器
   */
  getContainer(sectionType: string): HTMLElement | null {
    return this.container.querySelector(`[data-section-type="${sectionType}"]`);
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 更新特殊信息管理器的数据
    if (this.specialInfoManager) {
      this.specialInfoManager.updateBaziInfo(baziInfo);
    }
  }
}