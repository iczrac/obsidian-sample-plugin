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
   * 创建增强的神煞内容
   */
  private createEnhancedShenShaContent(shenShaInfo: any): string {
    return `
      <div class="shensha-explanation-enhanced">
        <div class="shensha-header">
          <div class="shensha-type-badge shensha-type-${shenShaInfo.type.toLowerCase()}">
            ${shenShaInfo.type}
          </div>
        </div>

        <div class="shensha-content">
          <div class="shensha-section">
            <h4 class="section-title">
              <span class="section-icon">📖</span>
              概述
            </h4>
            <p class="section-content">${shenShaInfo.description}</p>
          </div>

          <div class="shensha-section">
            <h4 class="section-title">
              <span class="section-icon">🎯</span>
              主要影响
            </h4>
            <p class="section-content">${shenShaInfo.effect}</p>
          </div>

          <div class="shensha-section">
            <h4 class="section-title">
              <span class="section-icon">💡</span>
              化解建议
            </h4>
            <p class="section-content">${this.getAdviceFromType(shenShaInfo.type)}</p>
          </div>

          <div class="shensha-section calculation-section">
            <h4 class="section-title">
              <span class="section-icon">🔢</span>
              计算方法
            </h4>
            <div class="calculation-content">${shenShaInfo.calculation}</div>
          </div>
        </div>

        <style>
          .shensha-explanation-enhanced {
            font-family: var(--font-interface);
            line-height: 1.6;
          }

          .shensha-header {
            margin-bottom: 20px;
            text-align: center;
          }

          .shensha-type-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .shensha-type-吉神 { background: linear-gradient(135deg, #4CAF50, #45a049); }
          .shensha-type-凶神 { background: linear-gradient(135deg, #f44336, #d32f2f); }
          .shensha-type-吉凶神 { background: linear-gradient(135deg, #FF9800, #F57C00); }

          .shensha-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .shensha-section {
            background: var(--background-secondary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            padding: 16px;
            transition: all 0.2s ease;
          }

          .shensha-section:hover {
            border-color: var(--text-accent);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .section-title {
            margin: 0 0 12px 0;
            color: var(--text-accent);
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .section-icon {
            font-size: 16px;
          }

          .section-content {
            margin: 0;
            color: var(--text-normal);
            font-size: 13px;
          }

          .calculation-section {
            background: var(--background-primary);
          }

          .calculation-content {
            font-family: var(--font-monospace);
            font-size: 12px;
            color: var(--text-muted);
            background: var(--background-secondary);
            padding: 12px;
            border-radius: 6px;
            border: 1px solid var(--background-modifier-border);
            line-height: 1.4;
          }
        </style>
      </div>
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
   * 创建通用模态框
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

    // 创建模态框容器
    const modal = document.createElement('div');
    modal.className = `bazi-modal bazi-modal-${type}`;
    modal.style.cssText = `
      position: fixed;
      background: var(--background-primary);
      border: 2px solid var(--background-modifier-border);
      border-radius: 12px;
      padding: 20px;
      min-width: 480px;
      max-width: 600px;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      opacity: 0;
      transform: scale(0.9);
      transition: all ${this.animationDuration}ms ease;
      font-family: var(--font-interface);
    `;

    // 创建标题
    const titleEl = modal.createDiv({ cls: 'bazi-modal-title' });
    titleEl.textContent = title;
    titleEl.style.cssText = `
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 12px;
      color: var(--text-normal);
      border-bottom: 1px solid var(--background-modifier-border);
      padding-bottom: 8px;
    `;

    // 如果是五行模态框，添加强度信息
    if (type === 'wuxing' && wuXing && value !== undefined) {
      const valueEl = modal.createDiv({ cls: 'bazi-modal-type' });
      valueEl.textContent = `强度值: ${value}`;
      valueEl.className = `bazi-modal-type bazi-modal-type-${this.getWuXingClassFromName(wuXing)}`;
      valueEl.style.cssText = `
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 8px;
      `;
    }

    // 创建内容
    const contentEl = modal.createDiv({ cls: 'bazi-modal-content' });
    contentEl.innerHTML = content;
    contentEl.style.cssText = `
      line-height: 1.6;
      color: var(--text-muted);
    `;

    // 创建关闭按钮
    const closeBtn = modal.createDiv({ cls: 'bazi-modal-close' });
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 20px;
      cursor: pointer;
      color: var(--text-muted);
      hover: color: var(--text-normal);
    `;

    // 关闭按钮事件
    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    // 添加到页面
    document.body.appendChild(modal);
    this.shownModals.push(modal);

    // 计算位置
    this.positionModal(modal, event);

    // 显示动画
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
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
  private closeModal(modal: HTMLElement) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';

    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      // 从已显示列表中移除
      const index = this.shownModals.indexOf(modal);
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
