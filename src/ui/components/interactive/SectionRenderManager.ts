import { BaziInfo } from '../../../types/BaziInfo';
import { DataGenerationService } from '../../../services/bazi/DataGenerationService';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';

/**
 * 区域渲染管理器
 * 专门负责各种section级别的UI渲染，避免与现有表格管理器重复
 */
export class SectionRenderManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;

  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
  }

  /**
   * 创建头部区域
   */
  createHeader(): HTMLElement {
    const headerSection = this.container.createDiv({ cls: 'bazi-view-header' });
    
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
    const buttonContainer = headerSection.createDiv({ cls: 'bazi-view-buttons' });
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    `;

    // 样式切换按钮
    const styleBtn = this.createButton('切换样式', 'bazi-style-switch-btn');
    buttonContainer.appendChild(styleBtn);

    // 设置按钮
    const settingsBtn = this.createButton('设置', 'bazi-settings-btn');
    buttonContainer.appendChild(settingsBtn);

    return headerSection;
  }

  /**
   * 创建特殊信息区域
   */
  createSpecialInfo(): HTMLElement {
    const specialSection = this.container.createDiv({ cls: 'bazi-view-section bazi-special-info' });
    specialSection.createEl('h3', { text: '特殊信息', cls: 'bazi-view-subtitle' });

    // 创建信息容器
    const infoContainer = specialSection.createDiv({ cls: 'bazi-special-info-container' });
    infoContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 12px;
    `;

    // 添加格局信息
    this.addGeJuInfo(infoContainer);

    // 添加五行强度信息
    this.addWuXingStrengthInfo(infoContainer);

    // 添加日主旺衰信息
    this.addRiZhuInfo(infoContainer);

    return specialSection;
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

    // 创建流年表格容器
    const tableContainer = liuNianSection.createDiv({ cls: 'bazi-liunian-container' });
    tableContainer.setAttribute('data-section-type', 'liunian-table');

    // 初始显示提示信息
    tableContainer.createEl('div', {
      text: '请先选择大运',
      cls: 'bazi-empty-message'
    });

    return liuNianSection;
  }

  /**
   * 创建流月信息区域
   */
  createLiuYueInfo(): HTMLElement {
    const liuYueSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuyue-section' });
    liuYueSection.createEl('h3', { text: '流月信息', cls: 'bazi-view-subtitle' });

    // 创建流月表格容器
    const tableContainer = liuYueSection.createDiv({ cls: 'bazi-liuyue-container' });
    tableContainer.setAttribute('data-section-type', 'liuyue-table');

    // 初始显示提示信息
    tableContainer.createEl('div', {
      text: '请先选择流年',
      cls: 'bazi-empty-message'
    });

    return liuYueSection;
  }

  /**
   * 创建流日信息区域
   */
  createLiuRiInfo(): HTMLElement {
    const liuRiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuri-section' });
    liuRiSection.createEl('h3', { text: '流日信息', cls: 'bazi-view-subtitle' });

    // 创建流日容器（由HorizontalSelectorManager动态创建内容）
    const container = liuRiSection.createDiv({ cls: 'bazi-liuri-container' });
    container.setAttribute('data-section-type', 'liuri-selector');

    return liuRiSection;
  }

  /**
   * 创建流时信息区域
   */
  createLiuShiInfo(): HTMLElement {
    const liuShiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liushi-section' });
    liuShiSection.createEl('h3', { text: '流时信息', cls: 'bazi-view-subtitle' });

    // 创建流时容器（由HorizontalSelectorManager动态创建内容）
    const container = liuShiSection.createDiv({ cls: 'bazi-liushi-container' });
    container.setAttribute('data-section-type', 'liushi-selector');

    return liuShiSection;
  }

  /**
   * 创建按钮
   */
  private createButton(text: string, className: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    `;

    // 添加悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'var(--background-modifier-hover)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'var(--background-secondary)';
    });

    return button;
  }

  /**
   * 添加格局信息
   */
  private addGeJuInfo(container: HTMLElement) {
    if (!this.baziInfo.geJu) return;

    const geJuCard = container.createDiv({ cls: 'bazi-info-card' });
    geJuCard.style.cssText = `
      padding: 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
    `;

    geJuCard.createEl('h4', { 
      text: '格局', 
      cls: 'bazi-info-card-title' 
    }).style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-normal);
      font-size: 16px;
    `;

    const geJuValue = geJuCard.createEl('div', { 
      text: this.baziInfo.geJu,
      cls: 'bazi-info-card-value geju-clickable'
    });
    geJuValue.style.cssText = `
      color: var(--text-accent);
      font-weight: bold;
      cursor: pointer;
    `;
    geJuValue.setAttribute('data-geju', this.baziInfo.geJu);
  }

  /**
   * 添加五行强度信息
   */
  private addWuXingStrengthInfo(container: HTMLElement) {
    if (!this.baziInfo.wuXingStrength) return;

    const wuXingCard = container.createDiv({ cls: 'bazi-info-card' });
    wuXingCard.style.cssText = `
      padding: 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
    `;

    wuXingCard.createEl('h4', { 
      text: '五行强度', 
      cls: 'bazi-info-card-title' 
    }).style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-normal);
      font-size: 16px;
    `;

    const wuXingGrid = wuXingCard.createDiv({ cls: 'bazi-wuxing-grid' });
    wuXingGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    `;

    const wuXingOrder = ['金', '木', '水', '火', '土'];
    wuXingOrder.forEach(wuXing => {
      const value = (this.baziInfo.wuXingStrength as any)[this.getWuXingKey(wuXing)] || 0;
      const item = wuXingGrid.createDiv({ cls: 'bazi-wuxing-item wuxing-strength-clickable' });
      item.style.cssText = `
        text-align: center;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      `;
      item.setAttribute('data-wuxing', wuXing);
      item.setAttribute('data-strength', value.toString());

      const label = item.createDiv({ text: wuXing });
      StyleUtilsService.setWuXingColor(label, wuXing);
      
      const valueEl = item.createDiv({ text: value.toFixed(1) });
      valueEl.style.cssText = `
        font-size: 12px;
        color: var(--text-muted);
      `;
    });
  }

  /**
   * 添加日主旺衰信息
   */
  private addRiZhuInfo(container: HTMLElement) {
    if (!this.baziInfo.riZhuStrength) return;

    const riZhuCard = container.createDiv({ cls: 'bazi-info-card' });
    riZhuCard.style.cssText = `
      padding: 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
    `;

    riZhuCard.createEl('h4', {
      text: '日主旺衰',
      cls: 'bazi-info-card-title'
    }).style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-normal);
      font-size: 16px;
    `;

    const riZhuValue = riZhuCard.createEl('div', {
      text: this.baziInfo.riZhuStrength,
      cls: 'bazi-info-card-value rizhu-clickable'
    });
    riZhuValue.style.cssText = `
      color: var(--text-accent);
      font-weight: bold;
      cursor: pointer;
    `;
    riZhuValue.setAttribute('data-rizhu', this.baziInfo.riZhuStrength);
    riZhuValue.setAttribute('data-wuxing', this.baziInfo.dayWuXing || '');
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
   * 获取五行对应的属性键
   */
  private getWuXingKey(wuXing: string): string {
    const keyMap: { [key: string]: string } = {
      '金': 'jin',
      '木': 'mu', 
      '水': 'shui',
      '火': 'huo',
      '土': 'tu'
    };
    return keyMap[wuXing] || '';
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
  }
}
