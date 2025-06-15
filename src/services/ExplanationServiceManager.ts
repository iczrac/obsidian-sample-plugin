import { ShenShaExplanationService } from './ShenShaExplanationService';
import { WuXingExplanationService } from './WuXingExplanationService';
import { GeJuExplanationService } from './GeJuExplanationService';

/**
 * 解释服务管理器
 * 统一管理各种解释服务的调用，提供统一的接口
 */
export class ExplanationServiceManager {
  
  /**
   * 显示神煞解释
   * @param shenSha 神煞名称
   * @param event 鼠标事件（用于定位弹窗）
   * @param container 容器元素
   */
  static showShenShaExplanation(shenSha: string, event: MouseEvent, container: HTMLElement): void {
    console.log(`🔍 显示神煞解释: ${shenSha}`);
    
    // 清理神煞名称，去掉可能的柱位前缀
    const cleanShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
    
    // 获取神煞信息
    const shenShaInfo = ShenShaExplanationService.getShenShaInfo(cleanShenSha);
    
    if (!shenShaInfo) {
      console.warn(`未找到神煞信息: ${cleanShenSha}`);
      return;
    }

    // 创建弹窗
    const modal = container.createDiv({ cls: 'shensha-explanation-modal' });
    modal.style.cssText = `
      position: fixed;
      left: ${event.clientX + 10}px;
      top: ${event.clientY + 10}px;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-size: 14px;
      line-height: 1.5;
    `;

    // 标题
    const title = modal.createEl('h4', { 
      text: shenShaInfo.name,
      cls: 'shensha-title'
    });
    title.style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-accent);
      font-size: 16px;
    `;

    // 类型标签
    const typeTag = modal.createEl('span', { 
      text: shenShaInfo.type,
      cls: 'shensha-type-tag'
    });
    typeTag.style.cssText = `
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
      ${shenShaInfo.type === '吉神' ? 'background: var(--color-green); color: white;' : 
        shenShaInfo.type === '凶神' ? 'background: var(--color-red); color: white;' : 
        'background: var(--background-secondary); color: var(--text-normal);'}
    `;

    // 描述
    if (shenShaInfo.explanation) {
      const desc = modal.createEl('p', {
        text: shenShaInfo.explanation,
        cls: 'shensha-description'
      });
      desc.style.cssText = `
        margin: 0 0 12px 0;
        color: var(--text-normal);
      `;
    }

    // 影响
    if (shenShaInfo.influence) {
      const influence = modal.createEl('p', { cls: 'shensha-influence' });
      influence.innerHTML = `<strong>影响：</strong>${shenShaInfo.influence}`;
      influence.style.cssText = `
        margin: 0;
        color: var(--text-normal);
      `;
    }

    // 点击外部关闭
    const closeModal = (e: Event) => {
      if (!modal.contains(e.target as Node)) {
        modal.remove();
        document.removeEventListener('click', closeModal);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeModal);
    }, 100);
  }

  /**
   * 显示五行解释
   * @param wuXing 五行名称
   * @param strength 强度值
   * @param event 鼠标事件
   * @param container 容器元素
   */
  static showWuXingExplanation(wuXing: string, strength: number, event: MouseEvent, container: HTMLElement): void {
    console.log(`🔍 显示五行解释: ${wuXing}, 强度: ${strength}`);
    
    // 获取五行信息
    const wuXingInfo = WuXingExplanationService.getWuXingInfo(wuXing);
    
    if (!wuXingInfo) {
      console.warn(`未找到五行信息: ${wuXing}`);
      return;
    }

    // 创建弹窗
    const modal = container.createDiv({ cls: 'wuxing-explanation-modal' });
    modal.style.cssText = `
      position: fixed;
      left: ${event.clientX + 10}px;
      top: ${event.clientY + 10}px;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 16px;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-size: 14px;
      line-height: 1.5;
    `;

    // 标题
    const title = modal.createEl('h4', { 
      text: `${wuXing}（强度: ${strength.toFixed(2)}）`,
      cls: 'wuxing-title'
    });
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: var(--text-accent);
      font-size: 16px;
    `;

    // 基本信息
    const info = modal.createEl('div', { cls: 'wuxing-info' });
    info.innerHTML = `
      <p><strong>解释：</strong>${wuXingInfo.explanation}</p>
      <p><strong>特征：</strong>${wuXingInfo.characteristics}</p>
      <p><strong>优势：</strong>${wuXingInfo.advantages}</p>
      <p><strong>建议：</strong>${wuXingInfo.advice}</p>
    `;
    info.style.cssText = `
      margin: 0;
      color: var(--text-normal);
    `;

    // 点击外部关闭
    const closeModal = (e: Event) => {
      if (!modal.contains(e.target as Node)) {
        modal.remove();
        document.removeEventListener('click', closeModal);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeModal);
    }, 100);
  }

  /**
   * 显示格局解释
   * @param geJu 格局名称
   * @param event 鼠标事件
   * @param container 容器元素
   */
  static showGeJuExplanation(geJu: string, event: MouseEvent, container: HTMLElement): void {
    console.log(`🔍 显示格局解释: ${geJu}`);
    
    // 获取格局信息
    const geJuInfo = GeJuExplanationService.getGeJuExplanation(geJu);

    if (!geJuInfo) {
      console.warn(`未找到格局信息: ${geJu}`);
      return;
    }

    // 创建弹窗
    const modal = container.createDiv({ cls: 'geju-explanation-modal' });
    modal.style.cssText = `
      position: fixed;
      left: ${event.clientX + 10}px;
      top: ${event.clientY + 10}px;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-size: 14px;
      line-height: 1.5;
    `;

    // 标题
    const title = modal.createEl('h4', { 
      text: geJuInfo.name,
      cls: 'geju-title'
    });
    title.style.cssText = `
      margin: 0 0 8px 0;
      color: var(--text-accent);
      font-size: 16px;
    `;

    // 描述
    if (geJuInfo.explanation) {
      const desc = modal.createEl('p', {
        text: geJuInfo.explanation,
        cls: 'geju-description'
      });
      desc.style.cssText = `
        margin: 0 0 12px 0;
        color: var(--text-normal);
      `;
    }

    // 特征
    if (geJuInfo.characteristics) {
      const characteristics = modal.createEl('p', { cls: 'geju-characteristics' });
      characteristics.innerHTML = `<strong>特征：</strong>${geJuInfo.characteristics}`;
      characteristics.style.cssText = `
        margin: 0;
        color: var(--text-normal);
      `;
    }

    // 点击外部关闭
    const closeModal = (e: Event) => {
      if (!modal.contains(e.target as Node)) {
        modal.remove();
        document.removeEventListener('click', closeModal);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeModal);
    }, 100);
  }

  /**
   * 显示日主旺衰解释
   * @param riZhu 日主旺衰状态
   * @param wuXing 五行
   * @param event 鼠标事件
   * @param container 容器元素
   */
  static showRiZhuExplanation(riZhu: string, wuXing: string, event: MouseEvent, container: HTMLElement): void {
    console.log(`🔍 显示日主旺衰解释: ${riZhu} (${wuXing})`);
    
    // 创建弹窗
    const modal = container.createDiv({ cls: 'rizhu-explanation-modal' });
    modal.style.cssText = `
      position: fixed;
      left: ${event.clientX + 10}px;
      top: ${event.clientY + 10}px;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 16px;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-size: 14px;
      line-height: 1.5;
    `;

    // 标题
    const title = modal.createEl('h4', { 
      text: `日主${riZhu}`,
      cls: 'rizhu-title'
    });
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: var(--text-accent);
      font-size: 16px;
    `;

    // 基本解释
    const explanation = this.getRiZhuExplanation(riZhu);
    const desc = modal.createEl('p', { 
      text: explanation,
      cls: 'rizhu-description'
    });
    desc.style.cssText = `
      margin: 0 0 12px 0;
      color: var(--text-normal);
    `;

    // 五行信息
    const wuXingInfo = modal.createEl('p', { cls: 'rizhu-wuxing' });
    wuXingInfo.innerHTML = `<strong>日主五行：</strong>${wuXing}`;
    wuXingInfo.style.cssText = `
      margin: 0;
      color: var(--text-normal);
    `;

    // 点击外部关闭
    const closeModal = (e: Event) => {
      if (!modal.contains(e.target as Node)) {
        modal.remove();
        document.removeEventListener('click', closeModal);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeModal);
    }, 100);
  }

  /**
   * 获取日主旺衰解释
   * @param riZhu 日主状态
   * @returns 解释文本
   */
  private static getRiZhuExplanation(riZhu: string): string {
    const explanations: { [key: string]: string } = {
      '旺': '日主得时得地，力量强盛，能够承受财官的克制，适合走财官运。',
      '强': '日主力量较强，有一定的承受能力，但需要适度的克制和消耗。',
      '中和': '日主力量适中，阴阳平衡，是最理想的状态，各方面都比较顺利。',
      '弱': '日主力量不足，需要印比的帮扶，忌讳财官的克制。',
      '极弱': '日主力量极其微弱，需要大量的印比帮扶，或者从弱格局。'
    };
    
    return explanations[riZhu] || '日主旺衰状态，影响命局的平衡和用神的选择。';
  }
}
