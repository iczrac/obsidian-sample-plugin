import { BaziInfo } from '../../../types/BaziInfo';
import { ShenShaDataService } from '../../../services/bazi/shensha/ShenShaDataService';
import { WuXingExplanationService } from '../../../services/WuXingExplanationService';
import { GeJuExplanationService } from '../../../services/GeJuExplanationService';

/**
 * 模态框管理器
 * 负责管理各种弹窗和模态框的显示
 */
export class ModalManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private shownModals: HTMLElement[] = [];
  private animationDuration = 300; // 毫秒

  constructor(container: HTMLElement, baziInfo: BaziInfo) {
    this.container = container;
    this.baziInfo = baziInfo;
  }

  /**
   * 显示神煞解释模态框
   */
  showShenShaModal(shenSha: string, event: MouseEvent) {
    // 防止重复显示相同的模态框
    if (this.isModalAlreadyShown(shenSha)) {
      return;
    }

    const shenShaInfo = ShenShaDataService.getShenShaDetail(shenSha);
    if (shenShaInfo.type === '未知') {
      console.log(`未找到神煞 ${shenSha} 的解释`);
      // 尝试从新的神煞数据服务获取信息
      const explanation = this.createFallbackShenShaContent(shenSha);
      this.createModal({
        title: shenSha,
        content: explanation,
        type: 'shensha',
        event
      });
      return;
    }

    const explanation = this.createEnhancedShenShaContent(shenShaInfo);

    this.createModal({
      title: shenSha,
      content: explanation,
      type: 'shensha',
      event
    });
  }

  /**
   * 创建增强的神煞内容（优化布局，神煞名在顶部）
   */
  private createEnhancedShenShaContent(shenShaInfo: any): string {
    // 获取化解方法和影响评估
    const resolutionMethod = ShenShaDataService.getResolutionMethod(shenShaInfo.name);
    const impactLevel = ShenShaDataService.getShenShaImpact(shenShaInfo.name);

    return `
        <!-- 类型标识（小标签样式） -->
        <div class="shensha-type-badge shensha-type-${shenShaInfo.type.toLowerCase()}">
          ${this.getTypeIcon(shenShaInfo.type)} ${shenShaInfo.type}
        </div>

        <!-- 概述 -->
        <div class="content-section">
          <h4 class="section-title">📋 概述</h4>
          <p class="section-content">${shenShaInfo.description}</p>
        </div>

        <!-- 主要影响 -->
        <div class="content-section">
          <h4 class="section-title">🎯 主要影响</h4>
          <p class="section-content">${shenShaInfo.effect}</p>
        </div>

        ${impactLevel ? this.createImpactSection(impactLevel) : ''}

        <!-- 计算方法 -->
        <div class="content-section">
          <h4 class="section-title">🧮 计算方法</h4>
          <div class="calculation-content">${shenShaInfo.calculation}</div>
        </div>

        ${resolutionMethod ? this.createResolutionSection(resolutionMethod) : this.createBasicAdviceSection(shenShaInfo.type)}
    `;
  }

  /**
   * 创建备用神煞内容（当主要服务没有信息时）
   */
  private createFallbackShenShaContent(shenSha: string): string {
    return `
      <div class="shensha-fallback">
        <div class="fallback-header">
          <h3 style="margin: 0; color: var(--text-accent); text-align: center;">${shenSha}</h3>
        </div>

        <div class="fallback-content">
          <div class="fallback-message">
            <p style="text-align: center; color: var(--text-muted); margin: 20px 0;">
              📚 此神煞的详细资料正在整理中
            </p>
            <p style="text-align: center; color: var(--text-faint); font-size: 12px; margin: 0;">
              您可以参考传统命理典籍了解更多信息
            </p>
          </div>
        </div>

        <style>
          .shensha-fallback {
            padding: 20px;
            text-align: center;
          }

          .fallback-content {
            margin-top: 20px;
          }

          .fallback-message {
            background: var(--background-secondary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            padding: 20px;
          }
        </style>
      </div>
    `;
  }

  /**
   * 显示五行解释模态框
   */
  showWuXingModal(wuXing: string, value: number, event: MouseEvent) {
    // 防止重复显示相同的模态框
    const modalKey = `wuxing-${wuXing}`;
    if (this.isModalAlreadyShown(modalKey)) {
      return;
    }

    const wuXingInfo = WuXingExplanationService.getWuXingInfo(wuXing);
    if (!wuXingInfo) {
      console.log(`未找到五行 ${wuXing} 的解释`);
      return;
    }

    const explanation = `
      <div class="wuxing-explanation">
        <p><strong>解释：</strong>${wuXingInfo.explanation}</p>
        <p><strong>影响：</strong>${wuXingInfo.influence}</p>
        <p><strong>特征：</strong>${wuXingInfo.characteristics}</p>
        <p><strong>优势：</strong>${wuXingInfo.advantages}</p>
        <p><strong>劣势：</strong>${wuXingInfo.disadvantages}</p>
        <p><strong>建议：</strong>${wuXingInfo.advice}</p>
      </div>
    `;

    this.createModal({
      title: `${wuXing}行强度`,
      content: explanation,
      type: 'wuxing',
      wuXing,
      value,
      event
    });
  }

  /**
   * 显示格局解释模态框
   */
  showGeJuModal(geJu: string, event: MouseEvent) {
    // 防止重复显示相同的模态框
    if (this.isModalAlreadyShown(geJu)) {
      return;
    }

    const geJuInfo = GeJuExplanationService.getGeJuExplanation(geJu);
    if (!geJuInfo) {
      console.log(`未找到格局 ${geJu} 的解释`);
      return;
    }

    const explanation = `
      <div class="geju-explanation">
        <p><strong>解释：</strong>${geJuInfo.explanation}</p>
        <p><strong>特征：</strong>${geJuInfo.characteristics}</p>
        <p><strong>优势：</strong>${geJuInfo.advantages}</p>
        <p><strong>劣势：</strong>${geJuInfo.disadvantages}</p>
        <p><strong>建议：</strong>${geJuInfo.advice}</p>
        <p><strong>计算：</strong>${geJuInfo.calculation}</p>
      </div>
    `;

    this.createModal({
      title: geJu,
      content: explanation,
      type: 'geju',
      event
    });
  }

  /**
   * 创建通用模态框（扁平化结构，无多层嵌套）
   */
  private createModal(options: {
    title: string;
    content: string;
    type: 'shensha' | 'wuxing' | 'geju';
    wuXing?: string;
    value?: number;
    event: MouseEvent;
  }) {
    const { title, content, type, wuXing, value, event } = options;

    // 创建背景遮罩
    const backdrop = document.createElement('div');
    backdrop.className = 'bazi-modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity ${this.animationDuration}ms ease;
    `;

    // 创建模态框容器（紧凑布局）
    const modal = document.createElement('div');
    modal.className = `bazi-modal bazi-modal-${type}`;
    modal.style.cssText = `
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 0;
      width: 85%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      transform: scale(0.9);
      transition: transform ${this.animationDuration}ms ease;
      font-family: var(--font-interface);
      line-height: 1.5;
      display: flex;
      flex-direction: column;
    `;

    // 添加全局样式（直接在模态框中）
    modal.innerHTML = `
      <style>
        .bazi-modal .shensha-type-badge {
          display: inline-block;
          text-align: center;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          margin: 0 auto 20px auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: block;
          width: fit-content;
        }

        .bazi-modal .shensha-type-吉神 { background: linear-gradient(135deg, #4CAF50, #45a049); }
        .bazi-modal .shensha-type-凶神 { background: linear-gradient(135deg, #f44336, #d32f2f); }
        .bazi-modal .shensha-type-吉凶神 { background: linear-gradient(135deg, #FF9800, #F57C00); }
        .bazi-modal .shensha-type-中性 { background: linear-gradient(135deg, #2196F3, #1976D2); }

        .bazi-modal .content-section {
          margin-bottom: 16px;
        }

        .bazi-modal .content-section:last-child {
          margin-bottom: 0;
        }

        .bazi-modal .section-title {
          margin: 0 0 6px 0;
          color: var(--text-accent);
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bazi-modal .section-content {
          margin: 0;
          color: var(--text-normal);
          font-size: 14px;
          line-height: 1.5;
          padding: 0;
        }

        .bazi-modal .calculation-content {
          font-family: var(--font-monospace);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: 2px;
          padding: 4px 0;
          font-style: italic;
        }

        .bazi-modal .impact-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }

        .bazi-modal .impact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: var(--background-secondary);
          border-radius: 4px;
          border: 1px solid var(--background-modifier-border);
        }

        .bazi-modal .impact-label {
          min-width: 60px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .bazi-modal .impact-bar {
          flex: 1;
          height: 6px;
          background: var(--background-modifier-border);
          border-radius: 3px;
          overflow: hidden;
        }

        .bazi-modal .impact-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .bazi-modal .impact-score {
          min-width: 30px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-normal);
        }

        .bazi-modal .resolution-content {
          margin-top: 6px;
        }

        .bazi-modal .resolution-item {
          margin-bottom: 8px;
          padding: 6px 10px;
          background: var(--background-secondary);
          border-radius: 6px;
          border: 1px solid var(--background-modifier-border);
        }

        .bazi-modal .resolution-item h5 {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-accent);
        }

        .bazi-modal .resolution-item p {
          margin: 0;
          font-size: 12px;
          color: var(--text-normal);
          line-height: 1.4;
        }

        .bazi-modal .item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .bazi-modal .item-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }
      </style>
    `;

    // 创建标题区域（紧凑布局）
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
      padding: 16px 20px;
      text-align: center;
      border-bottom: 1px solid var(--background-modifier-border);
      background: var(--background-primary);
    `;

    const titleEl = document.createElement('h1');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      font-weight: 600;
      font-size: 20px;
      margin: 0;
      color: var(--text-normal);
      text-align: center;
    `;

    headerSection.appendChild(titleEl);
    modal.appendChild(headerSection);

    // 创建内容区域（紧凑布局）
    const contentSection = document.createElement('div');
    contentSection.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: var(--background-primary);
      line-height: 1.5;
    `;

    // 添加基础样式
    const basicStyle = document.createElement('style');
    basicStyle.textContent = `
      /* 滚动条样式 */
      .bazi-modal .content-section::-webkit-scrollbar {
        width: 6px;
      }
      .bazi-modal .content-section::-webkit-scrollbar-track {
        background: var(--background-secondary);
        border-radius: 3px;
      }
      .bazi-modal .content-section::-webkit-scrollbar-thumb {
        background: var(--text-muted);
        border-radius: 3px;
        opacity: 0.5;
      }
      .bazi-modal .content-section::-webkit-scrollbar-thumb:hover {
        background: var(--text-normal);
        opacity: 0.8;
      }

      /* 化解建议基础样式 */
      .resolution-section {
        margin: 16px 0;
      }

      .resolution-item {
        margin-bottom: 12px;
      }

      .resolution-item h5 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: var(--text-accent);
        font-weight: 600;
      }

      .item-tags {
        margin-top: 4px;
      }

      .item-tag {
        display: inline-block;
        background: var(--interactive-accent);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        margin: 1px 2px 1px 0;
      }
    `;
    document.head.appendChild(basicStyle);
    contentSection.className = 'content-section';

    // 如果是五行模态框，添加强度信息
    if (type === 'wuxing' && wuXing && value !== undefined) {
      const valueEl = document.createElement('div');
      valueEl.textContent = `强度值: ${value}`;
      valueEl.className = `bazi-modal-type bazi-modal-type-${this.getWuXingClassFromName(wuXing)}`;
      valueEl.style.cssText = `
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 12px;
      `;
      contentSection.appendChild(valueEl);
    }

    // 添加内容
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    contentSection.appendChild(contentContainer);

    modal.appendChild(contentSection);

    // 创建关闭按钮（紧凑样式）
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 16px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.2s ease;
      z-index: 10;
    `;
    modal.appendChild(closeBtn);

    // 添加简单的悬停效果
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 0, 0, 0.2)';
      closeBtn.style.color = '#ff4444';
      closeBtn.style.transform = 'scale(1.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
      closeBtn.style.color = 'var(--text-muted)';
      closeBtn.style.transform = 'scale(1)';
    });

    // 关闭按钮事件
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeModal(backdrop);
    });

    // 点击背景遮罩关闭（正确的实现）
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.closeModal(backdrop);
      }
    });

    // 阻止点击模态框内部时关闭
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 将模态框添加到背景遮罩中
    backdrop.appendChild(modal);

    // 添加到页面
    document.body.appendChild(backdrop);
    this.shownModals.push(backdrop);

    // 显示动画
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });
  }

  /**
   * 定位模态框
   */
  private positionModal(modal: HTMLElement, event: MouseEvent) {
    const rect = modal.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = event.clientX + 10;
    let top = event.clientY + 10;

    // 确保模态框不会超出视口
    if (left + rect.width > viewportWidth) {
      left = event.clientX - rect.width - 10;
    }
    if (top + rect.height > viewportHeight) {
      top = event.clientY - rect.height - 10;
    }

    // 确保不会超出左边和上边
    left = Math.max(10, left);
    top = Math.max(10, top);

    modal.style.left = `${left}px`;
    modal.style.top = `${top}px`;
  }

  /**
   * 关闭模态框
   */
  private closeModal(backdrop: HTMLElement) {
    const modal = backdrop.querySelector('.bazi-modal') as HTMLElement;

    // 开始关闭动画
    backdrop.style.opacity = '0';
    if (modal) {
      modal.style.transform = 'scale(0.9)';
    }

    setTimeout(() => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      // 从已显示列表中移除
      const index = this.shownModals.indexOf(backdrop);
      if (index > -1) {
        this.shownModals.splice(index, 1);
      }
    }, this.animationDuration);
  }

  /**
   * 检查模态框是否已经显示
   */
  private isModalAlreadyShown(key: string): boolean {
    return this.shownModals.some(modal => {
      const title = modal.querySelector('.bazi-modal-title');
      return title && title.textContent === key;
    });
  }

  /**
   * 获取神煞类型对应的图标
   */
  private getTypeIcon(type: string): string {
    switch (type) {
      case '吉神':
        return '🍀';
      case '凶神':
        return '⚠️';
      case '吉凶神':
        return '⚖️';
      case '中性':
        return '🔹';
      default:
        return '🔍';
    }
  }

  /**
   * 创建影响程度评估区域
   */
  private createImpactSection(impactLevel: any): string {
    return `
      <div class="content-section">
        <h4 class="section-title">📊 影响程度评估</h4>
        <div class="impact-grid">
          <div class="impact-item">
            <span class="impact-label">正面影响</span>
            <div class="impact-bar">
              <div class="impact-fill" style="width: ${impactLevel.positive * 10}%; background-color: ${this.getImpactColor(impactLevel.positive)};"></div>
            </div>
            <span class="impact-score">${impactLevel.positive}/10</span>
          </div>
          <div class="impact-item">
            <span class="impact-label">负面影响</span>
            <div class="impact-bar">
              <div class="impact-fill" style="width: ${impactLevel.negative * 10}%; background-color: ${this.getImpactColor(10 - impactLevel.negative)};"></div>
            </div>
            <span class="impact-score">${impactLevel.negative}/10</span>
          </div>
        </div>
        <p class="section-text" style="margin-top: 8px;"><strong>综合评价：</strong>${impactLevel.description}</p>
      </div>
    `;
  }

  /**
   * 创建化解建议区域（紧凑布局）
   */
  private createResolutionSection(resolutionMethod: any): string {
    const itemTags = resolutionMethod.items && resolutionMethod.items.length > 0
      ? `<div class="item-tags">${resolutionMethod.items.map((item: string) => `<span class="item-tag">${item}</span>`).join('')}</div>`
      : '';

    const precautions = resolutionMethod.precautions && resolutionMethod.precautions.length > 0
      ? `<div class="resolution-item">
          <h5>注意事项</h5>
          <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 12px;">
            ${resolutionMethod.precautions.map((precaution: string) => `<li style="margin-bottom: 2px;">${precaution}</li>`).join('')}
          </ul>
        </div>`
      : '';

    return `
      <div class="resolution-section">
        <h4 style="color: var(--text-accent); margin-bottom: 12px;">💡 化解建议</h4>

        <div class="resolution-item">
          <h5>化解方法</h5>
          <p style="margin: 4px 0; font-size: 13px;">${resolutionMethod.method}</p>
        </div>

        ${resolutionMethod.items && resolutionMethod.items.length > 0 ? `
        <div class="resolution-item">
          <h5>推荐物品</h5>
          ${itemTags}
        </div>
        ` : ''}

        <div class="resolution-item">
          <h5>使用时机</h5>
          <p style="margin: 4px 0; font-size: 13px;">${resolutionMethod.timing}</p>
        </div>

        ${precautions}

        <div class="resolution-item">
          <h5>有效性评估</h5>
          <div style="background: #e8f5e8; padding: 6px; border-radius: 4px; margin-top: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px;">有效性</span>
              <span style="font-size: 12px; font-weight: bold;">7/10</span>
            </div>
            <div style="width: 100%; height: 4px; background: #ddd; border-radius: 2px; margin-top: 4px;">
              <div style="width: 70%; height: 100%; background: #4caf50; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 创建基础建议区域
   */
  private createBasicAdviceSection(type: string): string {
    return `
      <div class="content-section">
        <h4 class="section-title">💡 化解建议</h4>
        <p class="section-text">${this.getAdviceFromType(type)}</p>
      </div>
    `;
  }

  /**
   * 获取影响程度对应的颜色
   */
  private getImpactColor(score: number): string {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#8BC34A';
    if (score >= 4) return '#FFC107';
    if (score >= 2) return '#FF9800';
    return '#F44336';
  }

  /**
   * 根据神煞类型生成建议
   */
  private getAdviceFromType(type: string): string {
    switch (type) {
      case '吉神':
        return '要充分发挥吉神的正面作用，积极进取，把握机遇。';
      case '凶神':
        return '要注意化解凶神的不利影响，谨慎行事，多行善事。';
      case '吉凶神':
        return '要发挥其有利的一面，同时注意避免不利的影响。';
      default:
        return '建议根据具体情况进行分析。';
    }
  }

  /**
   * 获取五行对应的CSS类名
   */
  private getWuXingClassFromName(wuXing: string): string {
    switch (wuXing) {
      case '木':
        return 'wood';
      case '火':
        return 'fire';
      case '土':
        return 'earth';
      case '金':
        return 'metal';
      case '水':
        return 'water';
      default:
        return 'default';
    }
  }

  /**
   * 关闭所有模态框
   */
  closeAllModals() {
    this.shownModals.forEach(modal => {
      this.closeModal(modal);
    });
  }

  /**
   * 显示设置模态框
   */
  showSettingsModal(onSave: (settings: any) => void) {
    // 创建设置模态框
    const modal = document.createElement('div');
    modal.className = 'bazi-settings-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--background-primary);
      border: 2px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    `;

    // 创建背景遮罩
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    `;

    // 创建标题
    const title = modal.createEl('h3', { text: '八字显示设置' });
    title.style.marginBottom = '20px';

    // 创建神煞显示设置
    const shenShaSection = modal.createDiv({ cls: 'settings-section' });
    shenShaSection.createEl('h4', { text: '神煞显示设置' });

    const shenShaOptions = [
      { key: 'siZhu', label: '四柱神煞' },
      { key: 'daYun', label: '大运神煞' },
      { key: 'liuNian', label: '流年神煞' },
      { key: 'xiaoYun', label: '小运神煞' },
      { key: 'liuYue', label: '流月神煞' }
    ];

    shenShaOptions.forEach(option => {
      const checkboxContainer = shenShaSection.createDiv({ cls: 'checkbox-container' });
      checkboxContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      `;

      const checkbox = checkboxContainer.createEl('input', { type: 'checkbox' });
      checkbox.id = `shensha-${option.key}`;
      checkbox.checked = (this.baziInfo.showShenSha as any)?.[option.key] || false;

      const label = checkboxContainer.createEl('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = option.label;
      label.style.marginLeft = '8px';
    });

    // 创建按钮容器
    const buttonContainer = modal.createDiv({ cls: 'button-container' });
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    `;

    // 取消按钮
    const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
    `;

    // 保存按钮
    const saveBtn = buttonContainer.createEl('button', { text: '保存' });
    saveBtn.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: var(--interactive-accent);
      color: var(--text-on-accent);
      cursor: pointer;
    `;

    // 事件处理
    const closeModal = () => {
      document.body.removeChild(backdrop);
      document.body.removeChild(modal);
    };

    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', () => {
      // 收集设置
      const settings = {
        showShenSha: {} as any
      };

      shenShaOptions.forEach(option => {
        const checkbox = modal.querySelector(`#shensha-${option.key}`) as HTMLInputElement;
        settings.showShenSha[option.key] = checkbox.checked;
      });

      onSave(settings);
      closeModal();
    });

    // 添加到页面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }
}
