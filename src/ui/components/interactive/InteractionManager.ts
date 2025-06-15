import { BaziInfo } from '../../../types/BaziInfo';
import { ModalManager } from './ModalManager';
import { StyleAndUtilsManager } from './StyleAndUtilsManager';
import { ExtendedColumnManager } from './ExtendedColumnManager';
import { HorizontalSelectorManager } from './HorizontalSelectorManager';
import { EventManager } from '../EventManager';

/**
 * 交互管理器
 * 专门处理八字视图的用户交互逻辑，整合各种事件处理
 * 避免与通用EventManager重复，专注于八字相关的交互
 */
export class InteractionManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private modalManager: ModalManager;
  private styleAndUtilsManager: StyleAndUtilsManager;
  private extendedColumnManager: ExtendedColumnManager;
  private horizontalSelectorManager: HorizontalSelectorManager;
  private eventManager: EventManager;

  // 交互状态
  private isInitialized = false;
  private activeInteractions = new Set<string>();

  constructor(
    container: HTMLElement,
    baziInfo: BaziInfo,
    modalManager: ModalManager,
    styleAndUtilsManager: StyleAndUtilsManager,
    extendedColumnManager: ExtendedColumnManager,
    horizontalSelectorManager: HorizontalSelectorManager
  ) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.modalManager = modalManager;
    this.styleAndUtilsManager = styleAndUtilsManager;
    this.extendedColumnManager = extendedColumnManager;
    this.horizontalSelectorManager = horizontalSelectorManager;
    this.eventManager = new EventManager();
  }

  /**
   * 初始化所有交互事件
   */
  initialize() {
    if (this.isInitialized) {
      console.warn('InteractionManager 已经初始化过了');
      return;
    }

    this.setupClickInteractions();
    this.setupHoverInteractions();
    this.setupKeyboardInteractions();
    this.setupCustomEvents();

    this.isInitialized = true;
    console.log('✅ InteractionManager 初始化完成');
  }

  /**
   * 设置点击交互
   */
  private setupClickInteractions() {
    // 使用事件委托，在容器上监听所有点击事件
    this.eventManager.addElementListener(this.container, 'click', (event: Event) => {
      const target = event.target as HTMLElement;
      const mouseEvent = event as MouseEvent;

      // 神煞标签点击
      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaClick(target, mouseEvent);
        return;
      }

      // 五行强度点击
      if (target.classList.contains('wuxing-strength-clickable')) {
        this.handleWuXingStrengthClick(target, mouseEvent);
        return;
      }

      // 日主旺衰点击
      if (target.classList.contains('rizhu-clickable')) {
        this.handleRiZhuClick(target, mouseEvent);
        return;
      }

      // 十二长生模式切换
      if (target.classList.contains('bazi-changsheng-label')) {
        this.handleChangShengModeToggle();
        return;
      }

      // 样式切换按钮
      if (target.classList.contains('bazi-style-switch-btn')) {
        this.handleStyleSwitch();
        return;
      }

      // 设置按钮
      if (target.classList.contains('bazi-settings-btn')) {
        this.handleSettingsClick(mouseEvent);
        return;
      }

      // 大运选择
      if (target.classList.contains('bazi-dayun-cell') || target.closest('.bazi-dayun-cell')) {
        this.handleDaYunCellClick(target, mouseEvent);
        return;
      }

      // 流年选择
      if (target.classList.contains('bazi-liunian-row') || target.closest('.bazi-liunian-row')) {
        this.handleLiuNianRowClick(target, mouseEvent);
        return;
      }

      // 流月选择
      if (target.classList.contains('bazi-liuyue-row') || target.closest('.bazi-liuyue-row')) {
        this.handleLiuYueRowClick(target, mouseEvent);
        return;
      }
    });

    this.activeInteractions.add('click');
    console.log('✅ 点击交互设置完成');
  }

  /**
   * 设置悬停交互
   */
  private setupHoverInteractions() {
    // 神煞标签悬停
    this.eventManager.addElementListener(this.container, 'mouseenter', (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaHover(target, true);
      }
    });

    this.eventManager.addElementListener(this.container, 'mouseleave', (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaHover(target, false);
      }
    });

    this.activeInteractions.add('hover');
    console.log('✅ 悬停交互设置完成');
  }

  /**
   * 设置键盘交互
   */
  private setupKeyboardInteractions() {
    // 直接使用 document.addEventListener 而不是通过 EventManager
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // ESC 键关闭模态框
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }

      // 数字键快速切换样式
      if (event.key >= '1' && event.key <= '3' && event.ctrlKey) {
        this.handleStyleQuickSwitch(event.key);
        event.preventDefault();
      }
    });

    this.activeInteractions.add('keyboard');
    console.log('✅ 键盘交互设置完成');
  }

  /**
   * 设置自定义事件
   */
  private setupCustomEvents() {
    // 监听扩展列变化事件
    this.eventManager.on('extended-column:change', (data: any) => {
      this.handleExtendedColumnChange(data);
    });

    // 监听数据更新事件
    this.eventManager.on('data:update', (data: any) => {
      this.handleDataUpdate(data);
    });

    this.activeInteractions.add('custom');
    console.log('✅ 自定义事件设置完成');
  }

  /**
   * 处理神煞点击
   */
  private handleShenShaClick(target: HTMLElement, event: MouseEvent) {
    const shenSha = target.textContent?.trim();
    if (shenSha) {
      console.log(`🔍 神煞点击: ${shenSha}`);
      this.modalManager.showShenShaModal(shenSha, event);
    }
  }

  /**
   * 处理五行强度点击
   */
  private handleWuXingStrengthClick(target: HTMLElement, event: MouseEvent) {
    const wuXing = target.getAttribute('data-wuxing');
    const strength = target.getAttribute('data-strength');
    
    if (wuXing && strength) {
      console.log(`🔍 五行强度点击: ${wuXing} (${strength})`);
      this.modalManager.showWuXingModal(wuXing, parseFloat(strength), event);
    }
  }

  /**
   * 处理日主旺衰点击
   */
  private handleRiZhuClick(target: HTMLElement, event: MouseEvent) {
    const riZhu = target.getAttribute('data-rizhu');
    const wuXing = target.getAttribute('data-wuxing');
    
    if (riZhu && wuXing) {
      console.log(`🔍 日主旺衰点击: ${riZhu} (${wuXing})`);
      // 这里可以显示日主旺衰的详细解释
      // 暂时使用神煞模态框，后续可以创建专门的日主模态框
      this.modalManager.showShenShaModal(`日主${riZhu}`, event);
    }
  }

  /**
   * 处理十二长生模式切换
   */
  private handleChangShengModeToggle() {
    console.log('🔄 十二长生模式切换');
    this.styleAndUtilsManager.toggleChangShengMode();
    this.eventManager.emit('changsheng:toggle', {});
  }

  /**
   * 处理样式切换
   */
  private handleStyleSwitch() {
    console.log('🎨 样式切换');
    this.styleAndUtilsManager.switchStyle();
    this.eventManager.emit('style:switch', {});
  }

  /**
   * 处理设置点击
   */
  private handleSettingsClick(event: MouseEvent) {
    console.log('⚙️ 设置点击');
    this.modalManager.showSettingsModal((settings: any) => {
      this.handleSettingsUpdate(settings);
    });
  }

  /**
   * 处理大运单元格点击
   */
  private handleDaYunCellClick(target: HTMLElement, event: MouseEvent) {
    const cell = target.closest('.bazi-dayun-cell') as HTMLElement;
    if (!cell) return;

    const index = parseInt(cell.getAttribute('data-index') || '0');
    console.log(`🎯 大运选择: ${index}`);
    
    this.eventManager.emit('dayun:select', index);
  }

  /**
   * 处理流年行点击
   */
  private handleLiuNianRowClick(target: HTMLElement, event: MouseEvent) {
    const row = target.closest('.bazi-liunian-row') as HTMLElement;
    if (!row) return;

    const year = parseInt(row.getAttribute('data-year') || '0');
    console.log(`🎯 流年选择: ${year}`);
    
    this.eventManager.emit('liunian:select', year);
  }

  /**
   * 处理流月行点击
   */
  private handleLiuYueRowClick(target: HTMLElement, event: MouseEvent) {
    const row = target.closest('.bazi-liuyue-row') as HTMLElement;
    if (!row) return;

    const month = parseInt(row.getAttribute('data-month') || '0');
    console.log(`🎯 流月选择: ${month}`);
    
    this.eventManager.emit('liuyue:select', { month });
  }

  /**
   * 处理神煞悬停
   */
  private handleShenShaHover(target: HTMLElement, isEnter: boolean) {
    if (isEnter) {
      target.style.transform = 'scale(1.05)';
      target.style.transition = 'transform 0.2s ease';
    } else {
      target.style.transform = '';
    }
  }

  /**
   * 处理ESC键
   */
  private handleEscapeKey() {
    // 关闭所有模态框
    const modals = document.querySelectorAll('.bazi-modal');
    modals.forEach(modal => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
  }

  /**
   * 处理样式快速切换
   */
  private handleStyleQuickSwitch(styleKey: string) {
    console.log(`🎨 快速切换到样式: ${styleKey}`);
    // 这里可以直接切换到指定样式
    this.eventManager.emit('style:quick-switch', styleKey);
  }

  /**
   * 处理扩展列变化
   */
  private handleExtendedColumnChange(data: any) {
    console.log('📊 扩展列变化:', data);
    // 可以在这里处理扩展列变化的副作用
  }

  /**
   * 处理数据更新
   */
  private handleDataUpdate(data: any) {
    console.log('📊 数据更新:', data);
    // 可以在这里处理数据更新的副作用
  }

  /**
   * 处理设置更新
   */
  private handleSettingsUpdate(settings: any) {
    console.log('⚙️ 设置更新:', settings);
    this.eventManager.emit('settings:update', settings);
  }

  /**
   * 获取事件管理器（供外部使用）
   */
  getEventManager(): EventManager {
    return this.eventManager;
  }

  /**
   * 清理所有事件监听器
   */
  cleanup() {
    this.eventManager.cleanup();
    this.activeInteractions.clear();
    this.isInitialized = false;
    console.log('✅ InteractionManager 清理完成');
  }

  /**
   * 获取活动的交互类型
   */
  getActiveInteractions(): string[] {
    return Array.from(this.activeInteractions);
  }
}
