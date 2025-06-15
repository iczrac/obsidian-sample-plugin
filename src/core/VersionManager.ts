import { InteractiveBaziView } from '../ui/InteractiveBaziView';
import { BaziInfo } from '../types/BaziInfo';
import { Notice } from 'obsidian';

/**
 * 版本管理器
 * 负责管理新旧版本的切换和兼容性
 */
export class VersionManager {
  private plugin: any;
  private errorCount: number = 0;
  private maxErrors: number = 3;

  constructor(plugin: any) {
    this.plugin = plugin;
  }

  /**
   * 创建八字视图（根据设置选择版本）
   */
  createBaziView(
    container: HTMLElement,
    baziInfo: BaziInfo,
    id: string,
    options: ViewOptions = {}
  ): InteractiveBaziView {
    
    const useRefactored = this.shouldUseRefactoredVersion(options);
    
    console.log(`🎯 VersionManager: 使用${useRefactored ? '重构' : '原始'}版本创建视图`);

    try {
      if (useRefactored) {
        return this.createRefactoredView(container, baziInfo, id);
      } else {
        return this.createOriginalView(container, baziInfo, id);
      }
    } catch (error) {
      console.error(`❌ 创建${useRefactored ? '重构' : '原始'}版本失败:`, error);
      
      // 如果重构版本失败，尝试回退到原始版本
      if (useRefactored) {
        console.warn('🔄 重构版本失败，回退到原始版本');
        this.recordError(error);
        return this.createOriginalView(container, baziInfo, id);
      } else {
        // 原始版本也失败，抛出错误
        throw error;
      }
    }
  }

  /**
   * 判断是否应该使用重构版本
   */
  private shouldUseRefactoredVersion(options: ViewOptions): boolean {
    // 1. 检查紧急模式
    if (this.plugin.settings?.emergencyMode) {
      console.warn('🚨 紧急模式激活，强制使用原始版本');
      return false;
    }

    // 2. 检查错误次数
    if (this.errorCount >= this.maxErrors) {
      console.warn(`🚨 重构版本错误次数过多(${this.errorCount})，自动切换到原始版本`);
      return false;
    }

    // 3. 检查强制版本选择
    if (options.forceVersion) {
      return options.forceVersion === 'refactored';
    }

    // 4. 检查用户设置
    if (this.plugin.settings?.useRefactoredView !== undefined) {
      return this.plugin.settings.useRefactoredView;
    }

    // 5. 检查Beta功能开关
    if (this.plugin.settings?.enableBetaFeatures) {
      return true;
    }

    // 6. 默认策略（可以根据发布阶段调整）
    return this.getDefaultVersionStrategy();
  }

  /**
   * 获取默认版本策略
   */
  private getDefaultVersionStrategy(): boolean {
    // 可以根据发布阶段调整默认策略
    const releaseStage = this.plugin.settings?.releaseStage || 'stable';
    
    switch (releaseStage) {
      case 'alpha':
        return false; // Alpha阶段默认使用原始版本
      case 'beta':
        return true;  // Beta阶段默认使用重构版本
      case 'stable':
        return true;  // 稳定版本默认使用重构版本
      default:
        return false;
    }
  }

  /**
   * 创建重构版本视图
   */
  private createRefactoredView(
    container: HTMLElement,
    baziInfo: BaziInfo,
    id: string
  ): InteractiveBaziView {
    console.log('🆕 创建重构版本视图');

    const view = new InteractiveBaziView(
      container,
      baziInfo,
      id,
      this.plugin
    );

    // 添加版本标识
    this.addVersionBadge(container, 'refactored');

    return view;
  }

  /**
   * 创建原始版本视图（现在使用重构版本）
   */
  private createOriginalView(
    container: HTMLElement,
    baziInfo: BaziInfo,
    id: string
  ): InteractiveBaziView {
    console.log('📜 创建视图（使用重构版本）');

    const view = new InteractiveBaziView(
      container,
      baziInfo,
      id,
      this.plugin
    );

    // 添加版本标识
    this.addVersionBadge(container, 'refactored');

    return view;
  }

  /**
   * 添加版本标识
   */
  private addVersionBadge(container: HTMLElement, version: 'refactored' | 'original') {
    // 只在开发模式或Beta模式下显示版本标识
    if (!this.plugin.settings?.showVersionBadge) {
      return;
    }

    const badge = container.createDiv({ cls: 'bazi-version-badge' });
    badge.textContent = version === 'refactored' ? '新版本' : '经典版';
    badge.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: ${version === 'refactored' ? '#22c55e' : '#64748b'};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      z-index: 100;
    `;
  }

  /**
   * 记录错误
   */
  private recordError(error: any) {
    this.errorCount++;
    
    // 发送错误报告（如果启用）
    if (this.plugin.settings?.enableErrorReporting) {
      this.sendErrorReport(error);
    }

    // 如果错误次数过多，显示通知
    if (this.errorCount >= this.maxErrors) {
      new Notice(
        `重构版本遇到问题，已自动切换到经典版本。如需帮助请联系开发者。`,
        10000
      );
    }
  }

  /**
   * 发送错误报告
   */
  private sendErrorReport(error: any) {
    // 这里可以实现错误报告逻辑
    console.log('📊 发送错误报告:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      version: this.plugin.manifest?.version,
      userAgent: navigator.userAgent
    });
  }

  /**
   * 重置错误计数
   */
  resetErrorCount() {
    this.errorCount = 0;
    console.log('🔄 错误计数已重置');
  }

  /**
   * 获取版本统计信息
   */
  getVersionStats(): VersionStats {
    return {
      currentVersion: this.shouldUseRefactoredVersion({}) ? 'refactored' : 'original',
      errorCount: this.errorCount,
      maxErrors: this.maxErrors,
      emergencyMode: this.plugin.settings?.emergencyMode || false,
      userPreference: this.plugin.settings?.useRefactoredView
    };
  }

  /**
   * 强制切换版本
   */
  switchVersion(version: 'refactored' | 'original') {
    console.log(`🔄 强制切换到${version}版本`);
    
    // 更新设置
    if (this.plugin.settings) {
      this.plugin.settings.useRefactoredView = version === 'refactored';
      this.plugin.saveSettings();
    }

    // 重置错误计数
    this.resetErrorCount();

    // 显示通知
    new Notice(`已切换到${version === 'refactored' ? '重构' : '经典'}版本`);
  }

  /**
   * 启用紧急模式
   */
  enableEmergencyMode() {
    console.warn('🚨 启用紧急模式');
    
    if (this.plugin.settings) {
      this.plugin.settings.emergencyMode = true;
      this.plugin.saveSettings();
    }

    new Notice('已启用紧急模式，所有视图将使用经典版本', 5000);
  }

  /**
   * 禁用紧急模式
   */
  disableEmergencyMode() {
    console.log('✅ 禁用紧急模式');
    
    if (this.plugin.settings) {
      this.plugin.settings.emergencyMode = false;
      this.plugin.saveSettings();
    }

    this.resetErrorCount();
    new Notice('已禁用紧急模式');
  }
}

// 类型定义
interface ViewOptions {
  forceVersion?: 'refactored' | 'original';
  enableBeta?: boolean;
}

interface VersionStats {
  currentVersion: 'refactored' | 'original';
  errorCount: number;
  maxErrors: number;
  emergencyMode: boolean;
  userPreference?: boolean;
}
