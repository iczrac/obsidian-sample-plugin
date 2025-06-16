import { BaziInfo, LiuYueInfo } from '../../types/BaziInfo';
import { ShenShaExplanationService } from '../../services/ShenShaExplanationService';
import { StyleUtilsService } from '../../services/bazi/StyleUtilsService';

/**
 * 流月表格管理器
 * 负责创建和管理流月表格，包括神煞功能
 */
export class LiuYueTableManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private liuYueTable: HTMLTableElement | null = null;
  private onLiuYueSelect?: (liuyue: any) => void;

  constructor(
    container: HTMLElement, 
    baziInfo: BaziInfo,
    onLiuYueSelect?: (liuyue: any) => void
  ) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.onLiuYueSelect = onLiuYueSelect;
  }

  /**
   * 创建流月表格
   * @param data 流月数据
   */
  createLiuYueTable(data: any[]): HTMLTableElement | null {
    if (!data || data.length === 0) {
      this.container.createEl('div', {
        text: '无流月数据',
        cls: 'bazi-empty-message'
      });
      return null;
    }

    // 清空容器
    this.container.empty();

    // 创建表格
    const table = this.container.createEl('table', { cls: 'bazi-view-table bazi-liuyue-table' });
    this.liuYueTable = table;

    // 创建表头
    this.createTableHeader(table);

    // 创建表体
    this.createTableBody(table, data);

    // 添加神煞行
    this.createShenShaRow(table, data);

    return table;
  }

  /**
   * 创建表头
   */
  private createTableHeader(table: HTMLTableElement) {
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    headerRow.createEl('th', { text: '月份' });
    headerRow.createEl('th', { text: '干支' });
    headerRow.createEl('th', { text: '开始日期' });
  }

  /**
   * 创建表体
   */
  private createTableBody(table: HTMLTableElement, data: any[]) {
    const tbody = table.createEl('tbody');

    data.forEach((liuyue, index) => {
      const row = tbody.createEl('tr', { cls: 'bazi-liuyue-row' });

      // 月份列
      row.createEl('td', {
        text: liuyue.name,
        cls: 'bazi-liuyue-month'
      });

      // 干支列
      const ganZhiCell = row.createEl('td', { cls: 'bazi-liuyue-ganzhi' });
      StyleUtilsService.createGanZhiElement(ganZhiCell, liuyue.ganZhi, 'ganzhi-display');

      // 开始日期列
      row.createEl('td', {
        text: liuyue.startDate,
        cls: 'bazi-liuyue-start'
      });

      // 添加点击事件
      row.addEventListener('click', () => {
        // 高亮选中的行
        tbody.querySelectorAll('.bazi-liuyue-row').forEach(r => {
          r.classList.remove('selected');
        });
        row.classList.add('selected');

        // 处理流月选择
        if (this.onLiuYueSelect) {
          this.onLiuYueSelect(liuyue);
        }
      });

      // 默认选中第一个
      if (index === 0) {
        row.classList.add('selected');
        // 触发点击事件以确保正确选择
        if (this.onLiuYueSelect) {
          this.onLiuYueSelect(liuyue);
        }
      }
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLTableElement, data: any[]) {
    // 检查是否应该显示流月神煞
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuYue === false) {
      return;
    }

    // 检查是否有神煞数据
    const hasShenSha = data.some(ly => ly.shenSha && ly.shenSha.length > 0);
    if (!hasShenSha) return;

    const shenShaRow = table.createEl('tr', { cls: 'bazi-liuyue-shensha-row' });
    shenShaRow.createEl('th', { text: '流月神煞', attr: { colspan: '3' } });

    // 创建神煞容器
    const shenShaContainer = shenShaRow.createEl('td', { 
      cls: 'bazi-shensha-container',
      attr: { colspan: '3' }
    });

    // 为每个流月创建神煞显示
    data.forEach((ly, index) => {
      if (ly.shenSha && ly.shenSha.length > 0) {
        if (index > 0) {
          shenShaContainer.createEl('br');
        }

        const monthShenShaDiv = shenShaContainer.createEl('div', { 
          cls: 'bazi-liuyue-shensha-item',
          attr: { 'data-month': ly.month.toString() }
        });
        
        const monthLabel = monthShenShaDiv.createEl('span', {
          text: `${ly.name}: `,
          cls: 'bazi-shensha-month-label'
        });

        const shenShaList = monthShenShaDiv.createEl('span', { cls: 'bazi-shensha-list' });
        
        ly.shenSha.forEach((shenSha: string, shenShaIndex: number) => {
          if (shenShaIndex > 0) {
            shenShaList.createSpan({ text: ' ' });
          }

          const shenShaSpan = shenShaList.createSpan({
            text: shenSha,
            cls: 'shensha-tag'
          });

          // 添加样式
          this.applyShenShaStyle(shenShaSpan);

          // 添加点击事件
          shenShaSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleShenShaClick(shenSha);
          });
        });
      }
    });
  }

  /**
   * 应用神煞样式
   */
  private applyShenShaStyle(element: HTMLElement) {
    element.style.cssText = `
      display: inline-block;
      padding: 2px 4px;
      margin: 1px;
      border-radius: 3px;
      font-size: 10px;
      background: var(--background-modifier-border);
      color: var(--text-muted);
      cursor: pointer;
    `;
  }

  /**
   * 处理神煞点击事件
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 流月神煞被点击: ${shenSha}`);

    // 触发自定义事件，让父组件处理
    const event = new CustomEvent('shensha-click', {
      detail: { shenSha },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 更新神煞显示设置
   */
  updateShenShaSettings(showShenSha: any) {
    if (!this.liuYueTable) return;

    const shenShaRow = this.liuYueTable.querySelector('.bazi-liuyue-shensha-row');
    if (shenShaRow) {
      if (showShenSha.liuYue === false) {
        (shenShaRow as HTMLElement).style.display = 'none';
        console.log('🎯 隐藏流月神煞行');
      } else {
        (shenShaRow as HTMLElement).style.display = '';
        console.log('🎯 显示流月神煞行');
      }
    }
  }

  /**
   * 获取表格引用
   */
  getTable(): HTMLTableElement | null {
    return this.liuYueTable;
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
  }
}
