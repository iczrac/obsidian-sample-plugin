import { BaziInfo } from '../../../types/BaziInfo';
import { BaziService } from '../../../services/BaziService';
import { StyleUtilsService } from '../../../services/bazi/StyleUtilsService';

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
      // 在流月section后面创建独立的流日section
      const liuYueSection = this.container.querySelector('.bazi-liuyue-section');
      if (liuYueSection) {
        // 创建独立的流日section
        const liuRiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuri-section' });
        liuRiSection.createEl('h3', { text: '流日信息' });
        liuRiContainer = liuRiSection.createDiv({ cls: 'bazi-liuri-selector-container' });
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
        StyleUtilsService.setStemWuXingColor(stemSpan, stem);

        const branchSpan = ganZhiEl.createSpan({ text: branch });
        StyleUtilsService.setBranchWuXingColor(branchSpan, branch);
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

      // 不自动选择，让用户手动选择流日
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
    onSelect: (liuShi: any) => void
  ) {
    // 查找或创建流时选择器容器
    let liuShiContainer = this.container.querySelector('.bazi-liushi-selector-container') as HTMLElement;
    if (!liuShiContainer) {
      // 在流日section后面创建独立的流时section
      const liuRiSection = this.container.querySelector('.bazi-liuri-section');
      if (liuRiSection) {
        // 创建独立的流时section
        const liuShiSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liushi-section' });
        liuShiSection.createEl('h3', { text: '流时信息' });
        liuShiContainer = liuShiSection.createDiv({ cls: 'bazi-liushi-selector-container' });
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

    // 时辰名称和时间范围（标准时间范围）
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

      // 时间范围（优先使用后端数据，备用使用计算的时间范围）
      const timeRangeEl = timeItem.createDiv({
        text: liuShi.range || timeInfo[index]?.time || '',
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
        StyleUtilsService.setStemWuXingColor(stemSpan, stem);

        const branchSpan = ganZhiEl.createSpan({ text: branch });
        StyleUtilsService.setBranchWuXingColor(branchSpan, branch);
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

        // 调用选择回调（传递完整的流时对象）
        onSelect(liuShi);
      });

      // 不自动选择，让用户手动选择流时
    });
  }


}
