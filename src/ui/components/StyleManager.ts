import { BaziUtils } from '../../services/bazi/BaziUtils';

/**
 * 样式管理器
 * 负责管理五行颜色、CSS类等样式相关功能
 */
export class StyleManager {
  
  /**
   * 直接设置元素的五行颜色
   * @param element HTML元素
   * @param wuXing 五行属性
   */
  static setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    // 使用内联样式设置五行颜色，与原代码保持一致
    switch (wuXing) {
      case '金':
        element.style.color = '#FFD700'; // 金 - 黄色
        break;
      case '木':
        element.style.color = '#2e8b57'; // 木 - 绿色
        break;
      case '水':
        element.style.color = '#1e90ff'; // 水 - 蓝色
        break;
      case '火':
        element.style.color = '#ff4500'; // 火 - 红色
        break;
      case '土':
        element.style.color = '#cd853f'; // 土 - 棕色
        break;
    }
  }

  /**
   * 应用天干五行颜色
   * @param element HTML元素
   * @param stem 天干
   */
  static applyStemWuXingColor(element: HTMLElement, stem: string) {
    const wuXing = BaziUtils.getStemWuXing(stem);
    this.setWuXingColorDirectly(element, wuXing);
  }

  /**
   * 应用地支五行颜色
   * @param element HTML元素
   * @param branch 地支
   */
  static applyBranchWuXingColor(element: HTMLElement, branch: string) {
    const wuXing = BaziUtils.getBranchWuXing(branch);
    this.setWuXingColorDirectly(element, wuXing);
  }

  /**
   * 获取天干五行
   * @param stem 天干
   * @returns 五行属性
   */
  static getStemWuXing(stem: string): string {
    return BaziUtils.getStemWuXing(stem);
  }

  /**
   * 获取地支五行
   * @param branch 地支
   * @returns 五行属性
   */
  static getBranchWuXing(branch: string): string {
    return BaziUtils.getBranchWuXing(branch);
  }

  /**
   * 从纳音中提取五行属性
   * @param naYin 纳音
   * @returns 五行属性
   */
  static extractWuXingFromNaYin(naYin: string): string {
    // 纳音通常以五行结尾，如"金箔金"、"炉中火"等
    if (naYin.includes('金')) return '金';
    if (naYin.includes('木')) return '木';
    if (naYin.includes('水')) return '水';
    if (naYin.includes('火')) return '火';
    if (naYin.includes('土')) return '土';
    return '';
  }

  /**
   * 创建带颜色的藏干显示
   * @param container 容器元素
   * @param hideGanText 藏干文本
   */
  static createColoredHideGan(container: HTMLElement, hideGanText: string) {
    if (!hideGanText) {
      return;
    }

    // 将藏干文本按字符分割，每个字符应用对应的五行颜色
    for (let i = 0; i < hideGanText.length; i++) {
      const char = hideGanText[i];
      const span = container.createSpan({ text: char });

      // 判断是天干还是地支，应用对应的五行颜色
      if (this.isValidStem(char)) {
        this.applyStemWuXingColor(span, char);
      } else if (this.isValidBranch(char)) {
        this.applyBranchWuXingColor(span, char);
      }
    }
  }

  /**
   * 检查是否为有效天干
   */
  private static isValidStem(char: string): boolean {
    return '甲乙丙丁戊己庚辛壬癸'.includes(char);
  }

  /**
   * 检查是否为有效地支
   */
  private static isValidBranch(char: string): boolean {
    return '子丑寅卯辰巳午未申酉戌亥'.includes(char);
  }

  /**
   * 获取五行颜色
   * @param wuXing 五行属性
   * @returns 颜色值
   */
  static getWuXingColor(wuXing: string): string {
    switch (wuXing) {
      case '金': return '#FFD700';
      case '木': return '#2e8b57';
      case '水': return '#1e90ff';
      case '火': return '#ff4500';
      case '土': return '#cd853f';
      default: return '#000000';
    }
  }

  /**
   * 应用选中样式
   * @param element 元素
   * @param selected 是否选中
   */
  static applySelectedStyle(element: HTMLElement, selected: boolean) {
    if (selected) {
      element.classList.add('selected');
    } else {
      element.classList.remove('selected');
    }
  }

  /**
   * 应用动画效果
   * @param element 元素
   * @param animationType 动画类型
   * @param duration 动画时长（毫秒）
   */
  static applyAnimation(element: HTMLElement, animationType: 'fadeIn' | 'slideIn' | 'highlight', duration: number = 300) {
    switch (animationType) {
      case 'fadeIn':
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        setTimeout(() => {
          element.style.opacity = '1';
        }, 10);
        break;
      
      case 'slideIn':
        element.style.transform = 'translateX(20px)';
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        setTimeout(() => {
          element.style.transform = 'translateX(0)';
          element.style.opacity = '1';
        }, 10);
        break;
      
      case 'highlight': {
        const originalBackground = element.style.backgroundColor;
        element.style.backgroundColor = 'rgba(var(--interactive-accent-rgb), 0.2)';
        element.style.transition = `background-color ${duration}ms ease-in-out`;
        setTimeout(() => {
          element.style.backgroundColor = originalBackground;
        }, duration);
        break;
      }
    }
  }

  /**
   * 清除所有动画样式
   * @param element 元素
   */
  static clearAnimations(element: HTMLElement) {
    element.style.transition = '';
    element.style.transform = '';
    element.style.opacity = '';
    element.style.backgroundColor = '';
  }

  /**
   * 应用神煞样式
   * @param element 元素
   * @param shenShaType 神煞类型
   */
  static applyShenShaStyle(element: HTMLElement, shenShaType: '吉神' | '凶神' | '吉凶神' | '未知') {
    // 清除之前的样式
    element.classList.remove('shensha-good', 'shensha-bad', 'shensha-mixed', 'shensha-unknown');
    
    // 应用新样式
    switch (shenShaType) {
      case '吉神':
        element.classList.add('shensha-good');
        break;
      case '凶神':
        element.classList.add('shensha-bad');
        break;
      case '吉凶神':
        element.classList.add('shensha-mixed');
        break;
      default:
        element.classList.add('shensha-unknown');
        break;
    }
  }

  /**
   * 应用十神样式
   * @param element 元素
   * @param shiShen 十神
   */
  static applyShiShenStyle(element: HTMLElement, shiShen: string) {
    element.classList.add('shishen-tag-small');
    
    // 根据十神类型应用不同样式
    if (['比肩', '劫财'].includes(shiShen)) {
      element.classList.add('shishen-bijie');
    } else if (['食神', '伤官'].includes(shiShen)) {
      element.classList.add('shishen-shishang');
    } else if (['正财', '偏财'].includes(shiShen)) {
      element.classList.add('shishen-caicai');
    } else if (['正官', '七杀'].includes(shiShen)) {
      element.classList.add('shishen-guansha');
    } else if (['正印', '偏印'].includes(shiShen)) {
      element.classList.add('shishen-yinyin');
    }
  }

  /**
   * 应用地势样式
   * @param element 元素
   * @param diShi 地势
   */
  static applyDiShiStyle(element: HTMLElement, diShi: string) {
    element.classList.add('dishi-tag-small');
    
    // 根据地势强弱应用不同样式
    if (['帝旺', '临官'].includes(diShi)) {
      element.classList.add('dishi-strong');
    } else if (['长生', '冠带'].includes(diShi)) {
      element.classList.add('dishi-medium');
    } else if (['死', '墓', '绝'].includes(diShi)) {
      element.classList.add('dishi-weak');
    }
  }

  /**
   * 创建加载动画
   * @param container 容器元素
   * @param text 加载文本
   * @returns 加载元素
   */
  static createLoadingAnimation(container: HTMLElement, text: string = '加载中...'): HTMLElement {
    const loadingEl = container.createDiv({ cls: 'bazi-loading' });
    loadingEl.createSpan({ text, cls: 'bazi-loading-text' });
    
    // 添加旋转动画
    const spinner = loadingEl.createDiv({ cls: 'bazi-loading-spinner' });
    spinner.style.cssText = `
      width: 20px;
      height: 20px;
      border: 2px solid var(--background-modifier-border);
      border-top: 2px solid var(--interactive-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-left: 10px;
    `;
    
    return loadingEl;
  }

  /**
   * 移除加载动画
   * @param loadingEl 加载元素
   */
  static removeLoadingAnimation(loadingEl: HTMLElement) {
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }

  /**
   * 应用响应式样式
   * @param element 元素
   * @param breakpoint 断点
   */
  static applyResponsiveStyle(element: HTMLElement, breakpoint: 'mobile' | 'tablet' | 'desktop') {
    // 清除之前的响应式类
    element.classList.remove('bazi-mobile', 'bazi-tablet', 'bazi-desktop');
    
    // 应用新的响应式类
    element.classList.add(`bazi-${breakpoint}`);
  }

  /**
   * 检测当前设备类型
   * @returns 设备类型
   */
  static detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 应用主题样式
   * @param element 元素
   * @param theme 主题
   */
  static applyThemeStyle(element: HTMLElement, theme: 'light' | 'dark' | 'auto') {
    // 清除之前的主题类
    element.classList.remove('bazi-theme-light', 'bazi-theme-dark');
    
    if (theme === 'auto') {
      // 自动检测系统主题
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = isDark ? 'dark' : 'light';
    }
    
    // 应用主题类
    element.classList.add(`bazi-theme-${theme}`);
  }
}
