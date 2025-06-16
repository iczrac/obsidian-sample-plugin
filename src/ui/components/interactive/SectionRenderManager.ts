import { BaziInfo } from '../../../types/BaziInfo';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { SpecialInfoManager } from './SpecialInfoManager';
import { DaYunInfoManager } from './DaYunInfoManager';
import { LiuNianInfoManager } from './LiuNianInfoManager';
import { LiuYueInfoManager } from './LiuYueInfoManager';
import { LiuRiInfoManager } from './LiuRiInfoManager';
import { LiuShiInfoManager } from './LiuShiInfoManager';

/**
 * 区域渲染管理器
 * 负责创建和管理八字视图的各个区域
 */
export class SectionRenderManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;
  private specialInfoManager: SpecialInfoManager | null = null;
  private daYunInfoManager: DaYunInfoManager | null = null;
  private liuNianInfoManager: LiuNianInfoManager | null = null;
  private liuYueInfoManager: LiuYueInfoManager | null = null;
  private liuRiInfoManager: LiuRiInfoManager | null = null;
  private liuShiInfoManager: LiuShiInfoManager | null = null;

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
    // 创建大运信息管理器
    this.daYunInfoManager = new DaYunInfoManager(
      this.container,
      this.baziInfo,
      this.plugin,
      (index: number) => this.handleDaYunSelect(index)
    );

    // 创建大运信息区域
    return this.daYunInfoManager.createDaYunInfo();
  }

  /**
   * 创建流年信息区域
   */
  createLiuNianInfo(): HTMLElement {
    // 创建流年信息管理器
    this.liuNianInfoManager = new LiuNianInfoManager(
      this.container,
      this.baziInfo,
      this.plugin,
      (year: number) => this.handleLiuNianSelect(year)
    );

    // 创建流年信息区域
    return this.liuNianInfoManager.createLiuNianInfo();
  }

  /**
   * 创建流月信息区域
   */
  createLiuYueInfo(): HTMLElement {
    // 创建流月信息管理器
    this.liuYueInfoManager = new LiuYueInfoManager(
      this.container,
      this.baziInfo,
      this.plugin,
      (liuyue: any) => this.handleLiuYueSelect(liuyue)
    );

    // 创建流月信息区域
    return this.liuYueInfoManager.createLiuYueInfo();
  }

  /**
   * 创建流日信息区域
   */
  createLiuRiInfo(): HTMLElement {
    // 创建流日信息管理器
    this.liuRiInfoManager = new LiuRiInfoManager(
      this.container,
      this.baziInfo,
      this.plugin,
      (liuri: any) => this.handleLiuRiSelect(liuri)
    );

    // 创建流日信息区域
    return this.liuRiInfoManager.createLiuRiInfo();
  }

  /**
   * 创建流时信息区域
   */
  createLiuShiInfo(): HTMLElement {
    // 创建流时信息管理器
    this.liuShiInfoManager = new LiuShiInfoManager(
      this.container,
      this.baziInfo,
      this.plugin,
      (liushi: any) => this.handleLiuShiSelect(liushi)
    );

    // 创建流时信息区域
    return this.liuShiInfoManager.createLiuShiInfo();
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
   * 处理大运选择
   */
  private handleDaYunSelect(index: number) {
    console.log(`🎯 SectionRenderManager: 大运选择 ${index}`);

    // 更新流年信息管理器的大运索引
    if (this.liuNianInfoManager) {
      this.liuNianInfoManager.setSelectedDaYunIndex(index);
    }

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('dayun-select', {
      detail: { index },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 处理流年选择
   */
  private handleLiuNianSelect(year: number) {
    console.log(`🎯 SectionRenderManager: 流年选择 ${year}`);

    // 更新流月信息管理器的年份
    if (this.liuYueInfoManager) {
      this.liuYueInfoManager.setSelectedYear(year);
    }

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('liunian-select', {
      detail: { year },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 处理流月选择
   */
  private handleLiuYueSelect(liuyue: any) {
    console.log(`🎯 SectionRenderManager: 流月选择 ${liuyue.month}月`);

    // 更新流日信息管理器的年月
    if (this.liuRiInfoManager) {
      this.liuRiInfoManager.setSelectedYearMonth(liuyue.year, liuyue.month);
    }

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('liuyue-select', {
      detail: { liuyue },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 处理流日选择
   */
  private handleLiuRiSelect(liuri: any) {
    console.log(`🎯 SectionRenderManager: 流日选择 ${liuri.day}日`);

    // 更新流时信息管理器的年月日
    if (this.liuShiInfoManager) {
      this.liuShiInfoManager.setSelectedYearMonthDay(liuri.year, liuri.month, liuri.day);
    }

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('liuri-select', {
      detail: { liuri },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 处理流时选择
   */
  private handleLiuShiSelect(liushi: any) {
    console.log(`🎯 SectionRenderManager: 流时选择 ${liushi.name}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('liushi-select', {
      detail: { liushi },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 获取特殊信息管理器
   */
  getSpecialInfoManager(): SpecialInfoManager | null {
    return this.specialInfoManager;
  }

  /**
   * 获取大运信息管理器
   */
  getDaYunInfoManager(): DaYunInfoManager | null {
    return this.daYunInfoManager;
  }

  /**
   * 获取流年信息管理器
   */
  getLiuNianInfoManager(): LiuNianInfoManager | null {
    return this.liuNianInfoManager;
  }

  /**
   * 获取指定类型的容器
   */
  getContainer(sectionType: string): HTMLElement | null {
    return this.container.querySelector(`[data-section-type="${sectionType}"]`);
  }

  /**
   * 更新大运选择
   */
  updateDaYunSelection(index: number) {
    if (this.liuNianInfoManager) {
      this.liuNianInfoManager.setSelectedDaYunIndex(index);
    }
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

    // 更新大运信息管理器的数据
    if (this.daYunInfoManager) {
      this.daYunInfoManager.updateBaziInfo(baziInfo);
    }

    // 更新流年信息管理器的数据
    if (this.liuNianInfoManager) {
      this.liuNianInfoManager.updateBaziInfo(baziInfo);
    }

    // 更新流月信息管理器的数据
    if (this.liuYueInfoManager) {
      this.liuYueInfoManager.updateBaziInfo(baziInfo);
    }

    // 更新流日信息管理器的数据
    if (this.liuRiInfoManager) {
      this.liuRiInfoManager.updateBaziInfo(baziInfo);
    }

    // 更新流时信息管理器的数据
    if (this.liuShiInfoManager) {
      this.liuShiInfoManager.updateBaziInfo(baziInfo);
    }
  }
}