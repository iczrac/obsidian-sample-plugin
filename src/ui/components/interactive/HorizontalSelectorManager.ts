import { BaziInfo } from '../../../types/BaziInfo';
import { BaziService } from '../../../services/BaziService';

/**
 * 横向选择器管理器
 * 负责管理流日和流时的横向滚动选择器
 */
export class HorizontalSelectorManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;

  constructor(container: HTMLElement, baziInfo: BaziInfo) {
    this.container = container;
    this.baziInfo = baziInfo;
  }

  /**
   * 显示流日横向滚动选择器
   */
  showLiuRiSelector(
    year: number, 
    monthGanZhi: string, 
    liuRiData: any[], 
    onSelect: (year: number, month: number, day: number) => void
  ) {
    // 查找或创建流日选择器容器
    let liuRiContainer = this.container.querySelector('.bazi-liuri-selector-container') as HTMLElement;
    if (!liuRiContainer) {
      // 在流月表格后面创建流日选择器
      const liuYueSection = this.container.querySelector('.bazi-liuyue-section');
      if (liuYueSection) {
        liuRiContainer = liuYueSection.createDiv({ cls: 'bazi-liuri-selector-container' });
      } else {
        return;
      }
    }

    // 清空容器
    liuRiContainer.empty();

    // 获取该干支月的日期范围（从流日数据中获取）
    let rangeText = '';
    if (liuRiData.length > 0) {
      const firstDay = liuRiData[0];
      const lastDay = liuRiData[liuRiData.length - 1];
      if (firstDay && lastDay) {
        rangeText = ` (${firstDay.month}.${firstDay.day}-${lastDay.month}.${lastDay.day})`;
      }
    }

    // 创建标题
    liuRiContainer.createEl('h5', {
      text: `${year}年${monthGanZhi}月流日${rangeText}`,
      cls: 'bazi-liuri-title'
    });

    // 创建横向滚动容器
    const scrollContainer = liuRiContainer.createDiv({
      cls: 'bazi-liuri-scroll-container'
    });
    scrollContainer.style.cssText = `
      display: flex;
      overflow-x: auto;
      gap: 8px;
      padding: 10px 0;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
    `;

    // 创建流日选择项
    liuRiData.forEach((liuRi, index) => {
      const dayItem = scrollContainer.createDiv({
        cls: 'bazi-liuri-item'
      });
      dayItem.style.cssText = `
        min-width: 80px;
        padding: 8px 12px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-primary);
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      `;

      // 日期（显示月.日格式）
      const dateEl = dayItem.createDiv({
        text: `${liuRi.month}.${liuRi.day}`,
        cls: 'bazi-liuri-date'
      });
      dateEl.style.cssText = `
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
      `;

      // 干支
      const ganZhiEl = dayItem.createDiv({
        cls: 'bazi-liuri-ganzhi'
      });
      ganZhiEl.style.cssText = `
        font-weight: bold;
        font-size: 14px;
      `;

      if (liuRi.ganZhi && liuRi.ganZhi.length >= 2) {
        const stem = liuRi.ganZhi[0];
        const branch = liuRi.ganZhi[1];

        const stemSpan = ganZhiEl.createSpan({ text: stem });
        this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));

        const branchSpan = ganZhiEl.createSpan({ text: branch });
        this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
      } else {
        ganZhiEl.textContent = liuRi.ganZhi || '';
      }

      // 添加悬停效果
      dayItem.addEventListener('mouseenter', () => {
        dayItem.style.background = 'var(--background-modifier-hover)';
        dayItem.style.transform = 'translateY(-2px)';
      });

      dayItem.addEventListener('mouseleave', () => {
        if (!dayItem.classList.contains('selected')) {
          dayItem.style.background = 'var(--background-primary)';
          dayItem.style.transform = 'translateY(0)';
        }
      });

      // 添加点击事件
      dayItem.addEventListener('click', () => {
        // 移除其他选中状态
        scrollContainer.querySelectorAll('.bazi-liuri-item').forEach(item => {
          item.classList.remove('selected');
          (item as HTMLElement).style.background = 'var(--background-primary)';
          (item as HTMLElement).style.transform = 'translateY(0)';
        });

        // 设置当前选中状态
        dayItem.classList.add('selected');
        dayItem.style.background = 'var(--interactive-accent)';
        dayItem.style.color = 'var(--text-on-accent)';

        // 调用选择回调
        onSelect(liuRi.year || year, liuRi.month || 1, liuRi.day);
      });

      // 默认选中第一个
      if (index === 0) {
        dayItem.click();
      }
    });
  }

  /**
   * 显示流时横向滚动选择器
   */
  showLiuShiSelector(
    year: number, 
    month: number, 
    day: number, 
    liuShiData: any[], 
    onSelect: (timeIndex: number, ganZhi: string, name: string) => void
  ) {
    // 查找或创建流时选择器容器
    let liuShiContainer = this.container.querySelector('.bazi-liushi-selector-container') as HTMLElement;
    if (!liuShiContainer) {
      // 在流日选择器后面创建流时选择器
      const liuRiContainer = this.container.querySelector('.bazi-liuri-selector-container');
      if (liuRiContainer) {
        liuShiContainer = liuRiContainer.createDiv({ cls: 'bazi-liushi-selector-container' });
      } else {
        return;
      }
    }

    // 清空容器
    liuShiContainer.empty();

    // 创建标题
    liuShiContainer.createEl('h5', {
      text: `${year}年${month}月${day}日流时`,
      cls: 'bazi-liushi-title'
    });

    // 创建横向滚动容器
    const scrollContainer = liuShiContainer.createDiv({
      cls: 'bazi-liushi-scroll-container'
    });
    scrollContainer.style.cssText = `
      display: flex;
      overflow-x: auto;
      gap: 8px;
      padding: 10px 0;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-secondary);
      margin-top: 10px;
    `;

    // 时辰名称和时间范围
    const timeInfo = [
      { name: '子时', time: '23:00-01:00' },
      { name: '丑时', time: '01:00-03:00' },
      { name: '寅时', time: '03:00-05:00' },
      { name: '卯时', time: '05:00-07:00' },
      { name: '辰时', time: '07:00-09:00' },
      { name: '巳时', time: '09:00-11:00' },
      { name: '午时', time: '11:00-13:00' },
      { name: '未时', time: '13:00-15:00' },
      { name: '申时', time: '15:00-17:00' },
      { name: '酉时', time: '17:00-19:00' },
      { name: '戌时', time: '19:00-21:00' },
      { name: '亥时', time: '21:00-23:00' }
    ];

    // 创建流时选择项
    liuShiData.forEach((liuShi, index) => {
      const timeItem = scrollContainer.createDiv({
        cls: 'bazi-liushi-item'
      });
      timeItem.style.cssText = `
        min-width: 90px;
        padding: 8px 12px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-primary);
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      `;

      // 时辰名称
      const timeNameEl = timeItem.createDiv({
        text: timeInfo[index]?.name || `${index}时`,
        cls: 'bazi-liushi-name'
      });
      timeNameEl.style.cssText = `
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 2px;
      `;

      // 时间范围
      const timeRangeEl = timeItem.createDiv({
        text: timeInfo[index]?.time || '',
        cls: 'bazi-liushi-range'
      });
      timeRangeEl.style.cssText = `
        font-size: 10px;
        color: var(--text-faint);
        margin-bottom: 4px;
      `;

      // 干支
      const ganZhiEl = timeItem.createDiv({
        cls: 'bazi-liushi-ganzhi'
      });
      ganZhiEl.style.cssText = `
        font-weight: bold;
        font-size: 14px;
      `;

      if (liuShi.ganZhi && liuShi.ganZhi.length >= 2) {
        const stem = liuShi.ganZhi[0];
        const branch = liuShi.ganZhi[1];

        const stemSpan = ganZhiEl.createSpan({ text: stem });
        this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));

        const branchSpan = ganZhiEl.createSpan({ text: branch });
        this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
      } else {
        ganZhiEl.textContent = liuShi.ganZhi || '';
      }

      // 添加悬停效果
      timeItem.addEventListener('mouseenter', () => {
        timeItem.style.background = 'var(--background-modifier-hover)';
        timeItem.style.transform = 'translateY(-2px)';
      });

      timeItem.addEventListener('mouseleave', () => {
        if (!timeItem.classList.contains('selected')) {
          timeItem.style.background = 'var(--background-primary)';
          timeItem.style.transform = 'translateY(0)';
        }
      });

      // 添加点击事件
      timeItem.addEventListener('click', () => {
        // 移除其他选中状态
        scrollContainer.querySelectorAll('.bazi-liushi-item').forEach(item => {
          item.classList.remove('selected');
          (item as HTMLElement).style.background = 'var(--background-primary)';
          (item as HTMLElement).style.transform = 'translateY(0)';
          (item as HTMLElement).style.color = '';
        });

        // 设置当前选中状态
        timeItem.classList.add('selected');
        timeItem.style.background = 'var(--interactive-accent)';
        timeItem.style.color = 'var(--text-on-accent)';

        // 调用选择回调
        onSelect(index, liuShi.ganZhi, timeInfo[index]?.name || `${index}时`);
      });

      // 默认选中第一个
      if (index === 0) {
        timeItem.click();
      }
    });
  }

  // 工具方法
  private getStemWuXing(stem: string): string {
    const stemWuXing: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return stemWuXing[stem] || '';
  }

  private getBranchWuXing(branch: string): string {
    const branchWuXing: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchWuXing[branch] || '';
  }

  private setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    const colorMap: { [key: string]: string } = {
      '木': '#22c55e',  // 绿色
      '火': '#ef4444',  // 红色
      '土': '#eab308',  // 黄色
      '金': '#64748b',  // 灰色
      '水': '#3b82f6'   // 蓝色
    };

    const color = colorMap[wuXing];
    if (color) {
      element.style.color = color;
      element.style.fontWeight = 'bold';
    }
  }
}
