import { Notice } from 'obsidian';

/**
 * 监控和反馈系统
 * 负责收集使用数据、性能指标和用户反馈
 */
export class MonitoringSystem {
  private plugin: any;
  private metrics: PerformanceMetrics = {
    viewCreationTimes: [],
    errorCounts: {},
    featureUsage: {},
    userSatisfaction: []
  };

  constructor(plugin: any) {
    this.plugin = plugin;
    this.initializeMonitoring();
  }

  /**
   * 初始化监控系统
   */
  private initializeMonitoring() {
    // 监听性能事件
    this.setupPerformanceMonitoring();
    
    // 监听错误事件
    this.setupErrorMonitoring();
    
    // 监听用户行为
    this.setupUserBehaviorMonitoring();
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring() {
    // 监控视图创建时间
    this.monitorViewCreation();
    
    // 监控内存使用
    this.monitorMemoryUsage();
    
    // 监控响应时间
    this.monitorResponseTime();
  }

  /**
   * 监控视图创建性能
   */
  private monitorViewCreation() {
    const originalCreateView = this.plugin.createBaziView;
    
    this.plugin.createBaziView = (...args: any[]) => {
      const startTime = performance.now();
      
      try {
        const result = originalCreateView.apply(this.plugin, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordViewCreationTime(duration);
        
        return result;
      } catch (error) {
        this.recordError('view_creation', error);
        throw error;
      }
    };
  }

  /**
   * 记录视图创建时间
   */
  recordViewCreationTime(duration: number) {
    this.metrics.viewCreationTimes.push({
      timestamp: Date.now(),
      duration
    });

    // 保持最近100条记录
    if (this.metrics.viewCreationTimes.length > 100) {
      this.metrics.viewCreationTimes.shift();
    }

    // 如果性能异常，发出警告
    if (duration > 2000) { // 超过2秒
      console.warn(`⚠️ 视图创建时间异常: ${duration}ms`);
    }
  }

  /**
   * 记录错误
   */
  recordError(category: string, error: any) {
    if (!this.metrics.errorCounts[category]) {
      this.metrics.errorCounts[category] = [];
    }

    this.metrics.errorCounts[category].push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    });

    // 如果错误频率过高，发出警告
    const recentErrors = this.metrics.errorCounts[category].filter(
      e => Date.now() - e.timestamp < 60000 // 最近1分钟
    );

    if (recentErrors.length > 5) {
      console.error(`🚨 错误频率过高: ${category} - ${recentErrors.length}次/分钟`);
    }
  }

  /**
   * 记录功能使用
   */
  recordFeatureUsage(feature: string, details?: any) {
    if (!this.metrics.featureUsage[feature]) {
      this.metrics.featureUsage[feature] = [];
    }

    this.metrics.featureUsage[feature].push({
      timestamp: Date.now(),
      details
    });

    console.log(`📊 功能使用: ${feature}`, details);
  }

  /**
   * 收集用户满意度
   */
  collectUserSatisfaction(rating: number, feedback?: string) {
    this.metrics.userSatisfaction.push({
      timestamp: Date.now(),
      rating,
      feedback
    });

    console.log(`⭐ 用户评分: ${rating}/5`, feedback);
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const viewTimes = this.metrics.viewCreationTimes;
    const avgCreationTime = viewTimes.length > 0 
      ? viewTimes.reduce((sum, item) => sum + item.duration, 0) / viewTimes.length
      : 0;

    const errorRate = this.calculateErrorRate();
    const popularFeatures = this.getPopularFeatures();
    const avgSatisfaction = this.getAverageSatisfaction();

    return {
      averageViewCreationTime: Math.round(avgCreationTime),
      errorRate,
      popularFeatures,
      averageUserSatisfaction: avgSatisfaction,
      totalViews: viewTimes.length,
      totalErrors: Object.values(this.metrics.errorCounts).flat().length,
      reportTimestamp: Date.now()
    };
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(): number {
    const totalViews = this.metrics.viewCreationTimes.length;
    const totalErrors = Object.values(this.metrics.errorCounts).flat().length;
    
    return totalViews > 0 ? (totalErrors / totalViews) * 100 : 0;
  }

  /**
   * 获取热门功能
   */
  private getPopularFeatures(): Array<{feature: string, usage: number}> {
    return Object.entries(this.metrics.featureUsage)
      .map(([feature, usages]) => ({
        feature,
        usage: usages.length
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  /**
   * 获取平均满意度
   */
  private getAverageSatisfaction(): number {
    const ratings = this.metrics.userSatisfaction;
    return ratings.length > 0
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
      : 0;
  }

  /**
   * 显示反馈收集界面
   */
  showFeedbackDialog() {
    const modal = document.createElement('div');
    modal.className = 'bazi-feedback-modal';
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
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    // 创建标题
    const title = modal.createEl('h3', { text: '用户反馈' });
    title.style.marginBottom = '16px';

    // 创建评分
    const ratingContainer = modal.createDiv();
    ratingContainer.createEl('label', { text: '整体满意度:' });
    
    const ratingSelect = ratingContainer.createEl('select');
    for (let i = 1; i <= 5; i++) {
      const option = ratingSelect.createEl('option', { value: i.toString(), text: `${i} 星` });
    }

    // 创建反馈文本框
    const feedbackContainer = modal.createDiv();
    feedbackContainer.createEl('label', { text: '详细反馈:' });
    feedbackContainer.style.marginTop = '16px';
    
    const feedbackTextarea = feedbackContainer.createEl('textarea');
    feedbackTextarea.style.cssText = `
      width: 100%;
      height: 100px;
      margin-top: 8px;
      padding: 8px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      resize: vertical;
    `;

    // 创建按钮
    const buttonContainer = modal.createDiv();
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    `;

    const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
    const submitBtn = buttonContainer.createEl('button', { text: '提交' });

    // 事件处理
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    cancelBtn.addEventListener('click', closeModal);

    submitBtn.addEventListener('click', () => {
      const rating = parseInt(ratingSelect.value);
      const feedback = feedbackTextarea.value.trim();

      this.collectUserSatisfaction(rating, feedback);
      
      new Notice('感谢您的反馈！');
      closeModal();
    });

    // 添加到页面
    document.body.appendChild(modal);
  }

  /**
   * 导出监控数据
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      report: this.getPerformanceReport(),
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  /**
   * 清理旧数据
   */
  cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 默认7天
    const cutoff = Date.now() - maxAge;

    // 清理视图创建时间
    this.metrics.viewCreationTimes = this.metrics.viewCreationTimes.filter(
      item => item.timestamp > cutoff
    );

    // 清理错误记录
    Object.keys(this.metrics.errorCounts).forEach(category => {
      this.metrics.errorCounts[category] = this.metrics.errorCounts[category].filter(
        error => error.timestamp > cutoff
      );
    });

    // 清理功能使用记录
    Object.keys(this.metrics.featureUsage).forEach(feature => {
      this.metrics.featureUsage[feature] = this.metrics.featureUsage[feature].filter(
        usage => usage.timestamp > cutoff
      );
    });

    // 清理满意度记录
    this.metrics.userSatisfaction = this.metrics.userSatisfaction.filter(
      satisfaction => satisfaction.timestamp > cutoff
    );

    console.log('🧹 监控数据清理完成');
  }

  // 其他监控方法的占位符
  private monitorMemoryUsage() {
    // TODO: 实现内存使用监控
  }

  private monitorResponseTime() {
    // TODO: 实现响应时间监控
  }

  private setupErrorMonitoring() {
    // TODO: 实现错误监控
  }

  private setupUserBehaviorMonitoring() {
    // TODO: 实现用户行为监控
  }
}

// 类型定义
interface PerformanceMetrics {
  viewCreationTimes: Array<{timestamp: number, duration: number}>;
  errorCounts: {[category: string]: Array<{timestamp: number, message: string, stack: string}>};
  featureUsage: {[feature: string]: Array<{timestamp: number, details?: any}>};
  userSatisfaction: Array<{timestamp: number, rating: number, feedback?: string}>;
}

interface PerformanceReport {
  averageViewCreationTime: number;
  errorRate: number;
  popularFeatures: Array<{feature: string, usage: number}>;
  averageUserSatisfaction: number;
  totalViews: number;
  totalErrors: number;
  reportTimestamp: number;
}
