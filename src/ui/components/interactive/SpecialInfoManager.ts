import { BaziInfo } from '../../../types/BaziInfo';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { ShenShaDataService } from '../../../services/bazi/shensha/ShenShaDataService';
import { ShenShaAlgorithms } from '../../../services/bazi/shensha/ShenShaAlgorithms';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';
import { ShenShaExplanationService } from '../../../services/bazi/shensha/ShenShaExplanationService';

/**
 * 特殊信息管理器
 * 负责管理特殊信息栏的显示、收缩和展开功能
 */
export class SpecialInfoManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private plugin: any;
  private isExpanded: boolean = true; // 默认展开
  private specialSection: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;





  constructor(container: HTMLElement, baziInfo: BaziInfo, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.plugin = plugin;
  }

  /**
   * 创建特殊信息区域
   */
  createSpecialInfo(): HTMLElement {
    this.specialSection = this.container.createDiv({ cls: 'bazi-view-section bazi-special-info' });
    
    // 创建标题栏（包含收缩/展开按钮）
    this.createHeader();

    // 创建信息容器
    this.createInfoContainer();

    // 添加各种信息
    this.addAllInfo();

    return this.specialSection;
  }

  /**
   * 创建标题栏
   */
  private createHeader() {
    if (!this.specialSection) return;

    const header = this.specialSection.createDiv({ cls: 'bazi-special-info-header' });
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
      text: '特殊信息', 
      cls: 'bazi-view-subtitle' 
    });
    title.style.cssText = `
      margin: 0;
      flex: 1;
    `;

    // 收缩/展开按钮
    this.toggleButton = header.createDiv({ cls: 'bazi-special-info-toggle' });
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
    if (!this.specialSection) return;

    this.infoContainer = this.specialSection.createDiv({ cls: 'bazi-special-info-container' });
    this.infoContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 12px;
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
    } else {
      this.infoContainer.style.maxHeight = '0';
      this.infoContainer.style.opacity = '0';
      this.infoContainer.style.marginTop = '0';
    }
  }

  /**
   * 更新切换按钮
   */
  private updateToggleButton() {
    if (!this.toggleButton) return;

    this.toggleButton.textContent = this.isExpanded ? '−' : '+';
    this.toggleButton.title = this.isExpanded ? '收起特殊信息' : '展开特殊信息';
  }

  /**
   * 切换展开/收缩状态
   */
  toggle() {
    this.isExpanded = !this.isExpanded;
    this.updateToggleButton();
    this.updateContainerVisibility();

    // 触发自定义事件，通知父组件状态变化
    const event = new CustomEvent('special-info-toggle', {
      detail: { isExpanded: this.isExpanded },
      bubbles: true
    });
    this.container.dispatchEvent(event);

    console.log(`🎯 特殊信息栏${this.isExpanded ? '展开' : '收起'}`);
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
   * 添加所有信息
   */
  private addAllInfo() {
    if (!this.infoContainer) return;

    // 添加格局信息
    this.addGeJuInfo();

    // 添加五行强度信息
    this.addWuXingStrengthInfo();

    // 添加日主旺衰信息
    this.addRiZhuInfo();

    // 添加胎元命宫信息
    this.addTaiYuanMingGongInfo();

    // 添加神煞信息
    this.addShenShaInfo();

    // 添加用神信息
    this.addYongShenInfo();

    // 添加节气信息
    this.addJieQiInfo();

    // 添加宜忌信息
    this.addYiJiInfo();
  }

  /**
   * 添加格局信息
   */
  private addGeJuInfo() {
    if (!this.baziInfo.geJu || !this.infoContainer) return;

    const geJuCard = this.createInfoCard('格局');
    const geJuValue = geJuCard.createEl('div', { 
      text: this.baziInfo.geJu,
      cls: 'bazi-info-card-value geju-clickable'
    });
    this.styleClickableValue(geJuValue);
    geJuValue.setAttribute('data-geju', this.baziInfo.geJu);
  }

  /**
   * 添加五行强度信息
   */
  private addWuXingStrengthInfo() {
    if (!this.baziInfo.wuXingStrength || !this.infoContainer) return;

    const wuXingCard = this.createInfoCard('五行强度');
    const wuXingList = wuXingCard.createDiv({ cls: 'bazi-wuxing-list' });
    wuXingList.style.cssText = `
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 8px;
    `;

    const wuXingNames = ['金', '木', '水', '火', '土'];
    const wuXingKeys = ['jin', 'mu', 'shui', 'huo', 'tu'] as const;

    wuXingKeys.forEach((key, index) => {
      const value = this.baziInfo.wuXingStrength![key] || 0;
      const wuXingName = wuXingNames[index];
      const wuXingColor = this.getWuXingColor(wuXingName);

      const item = wuXingList.createDiv({ cls: 'bazi-wuxing-item' });
      item.style.cssText = `
        text-align: center;
        padding: 6px;
        border-radius: 6px;
        background: var(--background-modifier-form-field);
        border: 2px solid ${wuXingColor}20;
        transition: all 0.2s ease;
      `;

      // 悬停效果
      item.addEventListener('mouseenter', () => {
        item.style.background = `${wuXingColor}10`;
        item.style.transform = 'scale(1.05)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = 'var(--background-modifier-form-field)';
        item.style.transform = 'scale(1)';
      });

      const nameEl = item.createDiv({
        text: wuXingName,
        cls: 'bazi-wuxing-name'
      });
      nameEl.style.cssText = `
        font-size: 12px;
        color: ${wuXingColor};
        font-weight: bold;
      `;

      const valueEl = item.createDiv({
        text: value.toFixed(1),
        cls: 'bazi-wuxing-value'
      });
      valueEl.style.cssText = `
        font-weight: bold;
        color: ${wuXingColor};
        font-size: 14px;
        margin-top: 2px;
      `;
    });
  }

  /**
   * 添加日主旺衰信息
   */
  private addRiZhuInfo() {
    if (!this.baziInfo.riZhuStrength || !this.infoContainer) return;

    const riZhuCard = this.createInfoCard('日主旺衰');
    const riZhuValue = riZhuCard.createEl('div', {
      text: this.baziInfo.riZhuStrength,
      cls: 'bazi-info-card-value rizhu-clickable'
    });
    this.styleClickableValue(riZhuValue);
    riZhuValue.setAttribute('data-rizhu', this.baziInfo.riZhuStrength);
    riZhuValue.setAttribute('data-wuxing', this.baziInfo.dayWuXing || '');
  }

  /**
   * 添加胎元命宫身宫信息
   */
  private addTaiYuanMingGongInfo() {
    if ((!this.baziInfo.taiYuan && !this.baziInfo.mingGong && !this.baziInfo.shenGong) || !this.infoContainer) return;

    const taiYuanCard = this.createInfoCard('胎元命宫身宫');
    const infoList = taiYuanCard.createDiv({ cls: 'bazi-info-list' });
    infoList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    if (this.baziInfo.taiYuan) {
      const taiYuanItem = this.createGanZhiInfoItem(infoList, '胎元:', this.baziInfo.taiYuan);
      taiYuanItem.value.setAttribute('data-taiyuan', this.baziInfo.taiYuan);
      taiYuanItem.value.classList.add('taiyuan-clickable');
    }

    if (this.baziInfo.mingGong) {
      const mingGongItem = this.createGanZhiInfoItem(infoList, '命宫:', this.baziInfo.mingGong);
      mingGongItem.value.setAttribute('data-minggong', this.baziInfo.mingGong);
      mingGongItem.value.classList.add('minggong-clickable');
    }

    if (this.baziInfo.shenGong) {
      const shenGongItem = this.createGanZhiInfoItem(infoList, '身宫:', this.baziInfo.shenGong);
      shenGongItem.value.setAttribute('data-shengong', this.baziInfo.shenGong);
      shenGongItem.value.classList.add('shengong-clickable');
    }
  }

  /**
   * 添加神煞组合信息
   */
  private addShenShaInfo() {
    if ((!this.baziInfo.shenSha || this.baziInfo.shenSha.length === 0) || !this.infoContainer) return;

    const shenShaCard = this.createInfoCard('神煞组合');

    // 按吉凶分类神煞
    const shenShaGroups = this.groupShenShaByType();

    // 显示吉神
    if (shenShaGroups.good.length > 0) {
      this.createShenShaGroup(shenShaCard, '吉神', shenShaGroups.good, 'good');
    }

    // 显示凶神
    if (shenShaGroups.bad.length > 0) {
      this.createShenShaGroup(shenShaCard, '凶神', shenShaGroups.bad, 'bad');
    }

    // 显示吉凶神
    if (shenShaGroups.mixed.length > 0) {
      this.createShenShaGroup(shenShaCard, '吉凶神', shenShaGroups.mixed, 'mixed');
    }

    // 显示未知类型
    if (shenShaGroups.unknown.length > 0) {
      this.createShenShaGroup(shenShaCard, '其他', shenShaGroups.unknown, 'unknown');
    }
  }

  /**
   * 添加用神信息
   */
  private addYongShenInfo() {
    if (!this.baziInfo.yongShen || !this.infoContainer) return;

    const yongShenCard = this.createInfoCard('用神');
    const yongShenValue = yongShenCard.createEl('div', {
      text: this.baziInfo.yongShen,
      cls: 'bazi-info-card-value yongshen-clickable'
    });
    this.styleClickableValue(yongShenValue);
    yongShenValue.setAttribute('data-yongshen', this.baziInfo.yongShen);

    if (this.baziInfo.yongShenDetail) {
      const yongShenDetail = yongShenCard.createEl('div', {
        text: this.baziInfo.yongShenDetail,
        cls: 'bazi-info-detail'
      });
      yongShenDetail.style.cssText = `
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.4;
      `;
    }
  }

  /**
   * 添加节气信息
   */
  private addJieQiInfo() {
    if ((!this.baziInfo.jieQi && !this.baziInfo.nextJieQi) || !this.infoContainer) return;

    const jieQiCard = this.createInfoCard('节气');
    const infoList = jieQiCard.createDiv({ cls: 'bazi-info-list' });
    infoList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    if (this.baziInfo.jieQi) {
      this.createInfoItem(infoList, '当前节气:', this.baziInfo.jieQi);
    }

    if (this.baziInfo.nextJieQi) {
      const nextJieQiItem = this.createInfoItem(infoList, '下一节气:', this.baziInfo.nextJieQi);
      nextJieQiItem.value.style.color = 'var(--text-muted)';
    }
  }

  /**
   * 添加宜忌信息
   */
  private addYiJiInfo() {
    if ((!this.baziInfo.dayYi || this.baziInfo.dayYi.length === 0) &&
        (!this.baziInfo.dayJi || this.baziInfo.dayJi.length === 0) || !this.infoContainer) return;

    const yiJiCard = this.createInfoCard('宜忌');
    const infoList = yiJiCard.createDiv({ cls: 'bazi-info-list' });
    infoList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    if (this.baziInfo.dayYi && this.baziInfo.dayYi.length > 0) {
      this.createYiJiSection(infoList, '宜:', this.baziInfo.dayYi, 'yi');
    }

    if (this.baziInfo.dayJi && this.baziInfo.dayJi.length > 0) {
      this.createYiJiSection(infoList, '忌:', this.baziInfo.dayJi, 'ji');
    }
  }

  /**
   * 创建信息卡片
   */
  private createInfoCard(title: string): HTMLElement {
    const card = this.infoContainer!.createDiv({ cls: 'bazi-info-card' });
    card.style.cssText = `
      padding: 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
    `;

    card.createEl('h4', {
      text: title,
      cls: 'bazi-info-card-title'
    }).style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-normal);
      font-size: 16px;
    `;

    return card;
  }

  /**
   * 创建信息项
   */
  private createInfoItem(container: HTMLElement, label: string, value: string): {
    item: HTMLElement,
    label: HTMLElement,
    value: HTMLElement
  } {
    const item = container.createDiv();
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const labelEl = item.createSpan({ text: label, cls: 'bazi-info-label' });
    const valueEl = item.createSpan({
      text: value,
      cls: 'bazi-info-value'
    });
    this.styleClickableValue(valueEl);

    return { item, label: labelEl, value: valueEl };
  }

  /**
   * 创建干支信息项（带五行颜色）
   */
  private createGanZhiInfoItem(container: HTMLElement, label: string, ganZhi: string): {
    item: HTMLElement,
    label: HTMLElement,
    value: HTMLElement
  } {
    const item = container.createDiv();
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const labelEl = item.createSpan({ text: label, cls: 'bazi-info-label' });

    // 创建干支容器
    const ganZhiContainer = item.createSpan({ cls: 'bazi-ganzhi-container' });
    ganZhiContainer.style.cssText = `
      display: flex;
      gap: 2px;
      cursor: pointer;
      font-weight: bold;
    `;

    if (ganZhi && ganZhi.length >= 2) {
      // 天干
      const ganSpan = ganZhiContainer.createSpan({
        text: ganZhi[0],
        cls: 'bazi-gan'
      });
      ganSpan.style.color = this.getWuXingColor(this.getGanWuXing(ganZhi[0]));

      // 地支
      const zhiSpan = ganZhiContainer.createSpan({
        text: ganZhi[1],
        cls: 'bazi-zhi'
      });
      zhiSpan.style.color = this.getWuXingColor(this.getZhiWuXing(ganZhi[1]));
    } else {
      ganZhiContainer.textContent = ganZhi;
      ganZhiContainer.style.color = 'var(--text-accent)';
    }

    return { item, label: labelEl, value: ganZhiContainer };
  }

  /**
   * 创建宜忌区域
   */
  private createYiJiSection(container: HTMLElement, label: string, items: string[], type: 'yi' | 'ji') {
    const section = container.createDiv();
    section.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    const labelEl = section.createSpan({ text: label, cls: 'bazi-info-label' });
    labelEl.style.cssText = `
      color: ${type === 'yi' ? 'var(--text-accent)' : 'var(--text-error)'};
      font-weight: bold;
    `;

    const content = section.createDiv({ cls: 'bazi-yiji-content' });
    content.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    `;

    items.forEach(item => {
      const tag = content.createSpan({ text: item, cls: `bazi-${type}-tag` });
      tag.style.cssText = `
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        background: ${type === 'yi' ? 'var(--color-green-rgb)' : 'var(--color-red-rgb)'};
        color: white;
      `;
    });
  }

  /**
   * 样式化可点击值
   */
  private styleClickableValue(element: HTMLElement) {
    element.style.cssText = `
      color: var(--text-accent);
      font-weight: bold;
      cursor: pointer;
    `;
  }

  /**
   * 样式化神煞标签
   */
  private styleShenShaTag(element: HTMLElement) {
    element.style.cssText = `
      display: inline-block;
      padding: 2px 6px;
      margin: 1px;
      border-radius: 3px;
      font-size: 11px;
      background: var(--background-modifier-border);
      color: var(--text-muted);
      cursor: pointer;
    `;
  }

  /**
   * 按吉凶类型分组神煞
   */
  private groupShenShaByType(): {
    good: string[],
    bad: string[],
    mixed: string[],
    unknown: string[]
  } {
    const result = {
      good: [] as string[],
      bad: [] as string[],
      mixed: [] as string[],
      unknown: [] as string[]
    };

    if (!this.baziInfo.shenSha) return result;



    // 按类型分类（使用新的神煞架构）
    this.baziInfo.shenSha.forEach(shenSha => {
      const type = ShenShaAlgorithms.getShenShaType(shenSha);

      switch (type) {
        case '吉神':
          result.good.push(shenSha);
          break;
        case '凶神':
          result.bad.push(shenSha);
          break;
        case '吉凶神':
          result.mixed.push(shenSha);
          break;
        default:
          result.unknown.push(shenSha);
      }
    });

    // 去重
    result.good = [...new Set(result.good)];
    result.bad = [...new Set(result.bad)];
    result.mixed = [...new Set(result.mixed)];
    result.unknown = [...new Set(result.unknown)];

    return result;
  }

  /**
   * 创建神煞组合组
   */
  private createShenShaGroup(container: HTMLElement, title: string, shenShaList: string[], type: string) {
    if (shenShaList.length === 0) return;

    const groupDiv = container.createDiv({ cls: 'bazi-shensha-group' });
    groupDiv.style.cssText = `
      margin-bottom: 12px;
    `;

    // 组标题
    const groupTitle = groupDiv.createDiv({
      text: title,
      cls: 'bazi-shensha-group-title'
    });
    groupTitle.style.cssText = `
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 6px;
      color: ${this.getShenShaGroupColor(type)};
    `;

    // 神煞标签容器
    const tagsContainer = groupDiv.createDiv({ cls: 'bazi-shensha-tags' });
    tagsContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    `;

    // 创建神煞标签
    shenShaList.forEach(shenSha => {
      const tag = tagsContainer.createSpan({
        text: shenSha,
        cls: `shensha-tag shensha-${type}`
      });

      tag.style.cssText = `
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: ${this.getShenShaTagBackground(type)};
        color: ${this.getShenShaTagColor(type)};
        border: 1px solid ${this.getShenShaTagBorder(type)};
      `;

      // 悬停效果
      tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'scale(1.05)';
        tag.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      });

      tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'scale(1)';
        tag.style.boxShadow = 'none';
      });

      // 点击事件
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleShenShaClick(shenSha);
      });
    });
  }

  /**
   * 获取神煞组颜色
   */
  private getShenShaGroupColor(type: string): string {
    switch (type) {
      case 'good': return 'var(--color-green)';
      case 'bad': return 'var(--color-red)';
      case 'mixed': return 'var(--color-orange)';
      default: return 'var(--text-muted)';
    }
  }

  /**
   * 获取神煞标签背景色
   */
  private getShenShaTagBackground(type: string): string {
    switch (type) {
      case 'good': return 'rgba(34, 139, 34, 0.1)';
      case 'bad': return 'rgba(220, 20, 60, 0.1)';
      case 'mixed': return 'rgba(255, 165, 0, 0.1)';
      default: return 'var(--background-modifier-border)';
    }
  }

  /**
   * 获取神煞标签文字颜色
   */
  private getShenShaTagColor(type: string): string {
    switch (type) {
      case 'good': return '#228B22';
      case 'bad': return '#DC143C';
      case 'mixed': return '#FF8C00';
      default: return 'var(--text-muted)';
    }
  }

  /**
   * 获取神煞标签边框颜色
   */
  private getShenShaTagBorder(type: string): string {
    switch (type) {
      case 'good': return 'rgba(34, 139, 34, 0.3)';
      case 'bad': return 'rgba(220, 20, 60, 0.3)';
      case 'mixed': return 'rgba(255, 165, 0, 0.3)';
      default: return 'var(--background-modifier-border)';
    }
  }

  /**
   * 获取五行颜色
   */
  private getWuXingColor(wuXing: string): string {
    return ColorSchemeService.getWuXingColor(wuXing);
  }

  /**
   * 获取天干五行
   */
  private getGanWuXing(gan: string): string {
    const ganWuXingMap: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return ganWuXingMap[gan] || '';
  }

  /**
   * 获取地支五行
   */
  private getZhiWuXing(zhi: string): string {
    const zhiWuXingMap: { [key: string]: string } = {
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '辰': '土', '戌': '土', '丑': '土', '未': '土'
    };
    return zhiWuXingMap[zhi] || '';
  }

  /**
   * 处理神煞点击事件
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 特殊信息区神煞被点击: ${shenSha}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;

    // 重新创建内容
    if (this.infoContainer) {
      this.infoContainer.empty();
      this.addAllInfo();
    }
  }

  /**
   * 获取特殊信息区域元素
   */
  getSpecialSection(): HTMLElement | null {
    return this.specialSection;
  }
}
