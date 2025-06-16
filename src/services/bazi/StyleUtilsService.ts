import { BaziUtils } from './BaziUtils';

/**
 * 样式工具服务
 * 提供五行颜色设置和样式相关的工具方法
 */
export class StyleUtilsService {
  
  /**
   * 五行颜色映射（使用ColorSchemeService统一管理）
   */
  private static readonly WU_XING_COLOR_MAP: { [key: string]: string } = {
    '木': '#228B22', // 绿色
    '火': '#DC143C', // 红色
    '土': '#CD853F', // 土黄色
    '金': '#FFD700', // 金黄色
    '水': '#4169E1'  // 蓝色
  };

  /**
   * 为元素设置五行颜色
   * @param element HTML元素
   * @param wuXing 五行
   */
  static setWuXingColor(element: HTMLElement, wuXing: string): void {
    const color = this.WU_XING_COLOR_MAP[wuXing];
    if (color) {
      element.style.color = color;
      element.style.fontWeight = 'bold';
    }
  }

  /**
   * 获取五行颜色
   * @param wuXing 五行
   * @returns 颜色值
   */
  static getWuXingColor(wuXing: string): string {
    return this.WU_XING_COLOR_MAP[wuXing] || '#000000';
  }

  /**
   * 为天干元素设置五行颜色
   * @param element HTML元素
   * @param stem 天干
   */
  static setStemWuXingColor(element: HTMLElement, stem: string): void {
    const wuXing = BaziUtils.getStemWuXing(stem);
    this.setWuXingColor(element, wuXing);
  }

  /**
   * 为地支元素设置五行颜色
   * @param element HTML元素
   * @param branch 地支
   */
  static setBranchWuXingColor(element: HTMLElement, branch: string): void {
    const wuXing = BaziUtils.getBranchWuXing(branch);
    this.setWuXingColor(element, wuXing);
  }

  /**
   * 创建带五行颜色的干支元素
   * @param container 容器元素
   * @param ganZhi 干支
   * @param className CSS类名
   * @returns 创建的元素
   */
  static createGanZhiElement(container: HTMLElement, ganZhi: string, className?: string): HTMLElement {
    const ganZhiEl = container.createDiv({ cls: className || 'ganzhi-element' });
    
    if (ganZhi && ganZhi.length >= 2) {
      const stem = ganZhi[0];
      const branch = ganZhi[1];

      // 创建天干元素并设置五行颜色
      const stemSpan = ganZhiEl.createSpan({ text: stem });
      this.setStemWuXingColor(stemSpan, stem);

      // 创建地支元素并设置五行颜色
      const branchSpan = ganZhiEl.createSpan({ text: branch });
      this.setBranchWuXingColor(branchSpan, branch);
    } else {
      ganZhiEl.textContent = ganZhi || '';
    }

    return ganZhiEl;
  }

  /**
   * 创建神煞标签
   * @param container 容器元素
   * @param shenSha 神煞名称
   * @param isClickable 是否可点击
   * @returns 创建的标签元素
   */
  static createShenShaTag(container: HTMLElement, shenSha: string, isClickable: boolean = true): HTMLElement {
    const tag = container.createEl('span', {
      text: shenSha,
      cls: isClickable ? 'shensha-tag clickable' : 'shensha-tag'
    });

    tag.style.cssText = `
      display: inline-block;
      padding: 2px 6px;
      margin: 1px 2px;
      border-radius: 3px;
      font-size: 11px;
      background: var(--background-modifier-border);
      color: var(--text-muted);
      ${isClickable ? 'cursor: pointer;' : ''}
      transition: all 0.2s ease;
    `;

    if (isClickable) {
      tag.addEventListener('mouseenter', () => {
        tag.style.background = 'var(--interactive-accent)';
        tag.style.color = 'var(--text-on-accent)';
      });

      tag.addEventListener('mouseleave', () => {
        tag.style.background = 'var(--background-modifier-border)';
        tag.style.color = 'var(--text-muted)';
      });
    }

    return tag;
  }

  /**
   * 创建十神标签
   * @param container 容器元素
   * @param shiShen 十神名称
   * @returns 创建的标签元素
   */
  static createShiShenTag(container: HTMLElement, shiShen: string): HTMLElement {
    const tag = container.createEl('span', {
      text: shiShen,
      cls: 'shishen-tag'
    });

    // 根据十神类型设置不同颜色
    const shiShenColors: { [key: string]: string } = {
      '比肩': '#22c55e',
      '劫财': '#16a34a',
      '食神': '#eab308',
      '伤官': '#f59e0b',
      '偏财': '#ef4444',
      '正财': '#dc2626',
      '七杀': '#8b5cf6',
      '正官': '#7c3aed',
      '偏印': '#06b6d4',
      '正印': '#0891b2'
    };

    const color = shiShenColors[shiShen] || '#64748b';
    tag.style.cssText = `
      display: inline-block;
      padding: 1px 4px;
      margin: 1px;
      border-radius: 2px;
      font-size: 10px;
      background: ${color}20;
      color: ${color};
      border: 1px solid ${color}40;
    `;

    return tag;
  }

  /**
   * 创建地势标签
   * @param container 容器元素
   * @param diShi 地势名称
   * @returns 创建的标签元素
   */
  static createDiShiTag(container: HTMLElement, diShi: string): HTMLElement {
    const tag = container.createEl('span', {
      text: diShi,
      cls: 'dishi-tag'
    });

    // 根据地势类型设置不同颜色
    const diShiColors: { [key: string]: string } = {
      '长生': '#22c55e',
      '沐浴': '#3b82f6',
      '冠带': '#8b5cf6',
      '临官': '#ef4444',
      '帝旺': '#dc2626',
      '衰': '#f59e0b',
      '病': '#64748b',
      '死': '#374151',
      '墓': '#6b7280',
      '绝': '#9ca3af',
      '胎': '#d1d5db',
      '养': '#e5e7eb'
    };

    const color = diShiColors[diShi] || '#64748b';
    tag.style.cssText = `
      display: inline-block;
      padding: 1px 4px;
      margin: 1px;
      border-radius: 2px;
      font-size: 10px;
      background: ${color}20;
      color: ${color};
      border: 1px solid ${color}40;
    `;

    return tag;
  }

  /**
   * 设置表格单元格的选中状态
   * @param cell 表格单元格
   * @param selected 是否选中
   */
  static setCellSelected(cell: HTMLElement, selected: boolean): void {
    if (selected) {
      cell.classList.add('selected');
      cell.style.background = 'var(--interactive-accent)';
      cell.style.color = 'var(--text-on-accent)';
    } else {
      cell.classList.remove('selected');
      cell.style.background = '';
      cell.style.color = '';
    }
  }

  /**
   * 添加悬停效果
   * @param element 元素
   * @param hoverStyle 悬停样式
   * @param normalStyle 正常样式
   */
  static addHoverEffect(element: HTMLElement, hoverStyle: string, normalStyle: string = ''): void {
    element.addEventListener('mouseenter', () => {
      element.style.cssText += hoverStyle;
    });

    element.addEventListener('mouseleave', () => {
      if (normalStyle) {
        element.style.cssText = normalStyle;
      } else {
        // 移除悬停样式
        const hoverProperties = hoverStyle.split(';').map(prop => prop.split(':')[0].trim()).filter(prop => prop);
        hoverProperties.forEach(prop => {
          element.style.removeProperty(prop);
        });
      }
    });
  }
}
