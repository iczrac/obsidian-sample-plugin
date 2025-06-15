import { BaziInfo, LiuNianInfo } from '../../types/BaziInfo';
import { ShenShaExplanationService } from '../../services/ShenShaExplanationService';
import { StyleUtilsService } from '../../services/bazi/StyleUtilsService';

/**
 * 流年表格管理器
 * 负责创建和管理流年表格，包括神煞功能
 */
export class LiuNianTableManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private liuNianTable: HTMLTableElement | null = null;
  private onLiuNianSelect?: (liunian: any) => void;

  constructor(
    container: HTMLElement, 
    baziInfo: BaziInfo,
    onLiuNianSelect?: (liunian: any) => void
  ) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.onLiuNianSelect = onLiuNianSelect;
  }

  /**
   * 创建流年表格
   * @param data 流年数据
   */
  createLiuNianTable(data: any[]): HTMLTableElement | null {
    if (!data || data.length === 0) {
      this.container.createEl('div', {
        text: '无流年数据',
        cls: 'bazi-empty-message'
      });
      return null;
    }

    // 清空容器
    this.container.empty();

    // 创建表格
    const table = this.container.createEl('table', { cls: 'bazi-view-table bazi-liunian-table' });
    this.liuNianTable = table;

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
    headerRow.createEl('th', { text: '年份' });
    headerRow.createEl('th', { text: '干支' });
    headerRow.createEl('th', { text: '操作' });
  }

  /**
   * 创建表体
   */
  private createTableBody(table: HTMLTableElement, data: any[]) {
    const tbody = table.createEl('tbody');

    data.forEach((liunian, index) => {
      const row = tbody.createEl('tr', { cls: 'bazi-liunian-row' });

      // 年份列
      row.createEl('td', {
        text: liunian.year.toString(),
        cls: 'bazi-liunian-year'
      });

      // 干支列
      const ganZhiCell = row.createEl('td', { cls: 'bazi-liunian-ganzhi' });
      StyleUtilsService.createGanZhiElement(ganZhiCell, liunian.ganZhi, 'ganzhi-display');

      // 操作列
      const actionCell = row.createEl('td', { cls: 'bazi-liunian-action' });
      const selectBtn = actionCell.createEl('button', {
        text: '选择',
        cls: 'bazi-select-button'
      });

      // 添加点击事件
      selectBtn.addEventListener('click', () => {
        // 高亮选中的行
        tbody.querySelectorAll('.bazi-liunian-row').forEach(r => {
          r.classList.remove('selected');
        });
        row.classList.add('selected');

        // 处理流年选择
        if (this.onLiuNianSelect) {
          this.onLiuNianSelect(liunian);
        }
      });

      // 默认选中第一个
      if (index === 0) {
        row.classList.add('selected');
      }
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(table: HTMLTableElement, data: any[]) {
    // 检查是否应该显示流年神煞
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuNian === false) {
      return;
    }

    // 检查是否有神煞数据
    const hasShenSha = data.some(ln => ln.shenSha && ln.shenSha.length > 0);
    if (!hasShenSha) return;

    const shenShaRow = table.createEl('tr', { cls: 'bazi-liunian-shensha-row' });
    shenShaRow.createEl('th', { text: '流年神煞', attr: { colspan: '3' } });

    // 创建神煞容器
    const shenShaContainer = shenShaRow.createEl('td', { 
      cls: 'bazi-shensha-container',
      attr: { colspan: '3' }
    });

    // 为每个流年创建神煞显示
    data.forEach((ln, index) => {
      if (ln.shenSha && ln.shenSha.length > 0) {
        if (index > 0) {
          shenShaContainer.createEl('br');
        }

        const yearShenShaDiv = shenShaContainer.createEl('div', { 
          cls: 'bazi-liunian-shensha-item',
          attr: { 'data-year': ln.year.toString() }
        });
        
        const yearLabel = yearShenShaDiv.createEl('span', {
          text: `${ln.year}年: `,
          cls: 'bazi-shensha-year-label'
        });

        const shenShaList = yearShenShaDiv.createEl('span', { cls: 'bazi-shensha-list' });
        
        ln.shenSha.forEach((shenSha: string, shenShaIndex: number) => {
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
    console.log(`🎯 流年神煞被点击: ${shenSha}`);

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
    if (!this.liuNianTable) return;

    const shenShaRow = this.liuNianTable.querySelector('.bazi-liunian-shensha-row');
    if (shenShaRow) {
      if (showShenSha.liuNian === false) {
        (shenShaRow as HTMLElement).style.display = 'none';
        console.log('🎯 隐藏流年神煞行');
      } else {
        (shenShaRow as HTMLElement).style.display = '';
        console.log('🎯 显示流年神煞行');
      }
    }
  }

  /**
   * 获取表格引用
   */
  getTable(): HTMLTableElement | null {
    return this.liuNianTable;
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
  }
}
