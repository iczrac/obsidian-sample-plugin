import { BaziInfo, DaYunInfo } from '../../types/BaziInfo';
import { ExtendedTableManager } from './ExtendedTableManager';
import { ColorSchemeService } from '../../services/bazi/ColorSchemeService';

/**
 * 大运表格管理器
 * 负责大运表格的创建、更新和交互
 */
export class DaYunTableManager {
  private baziInfo: BaziInfo;
  private daYunTable: HTMLElement | null = null;
  private extendedTableManager: ExtendedTableManager;
  private onDaYunSelect?: (index: number) => void;

  constructor(
    baziInfo: BaziInfo, 
    extendedTableManager: ExtendedTableManager,
    onDaYunSelect?: (index: number) => void
  ) {
    this.baziInfo = baziInfo;
    this.extendedTableManager = extendedTableManager;
    this.onDaYunSelect = onDaYunSelect;
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
  }

  /**
   * 设置大运表格引用
   */
  setDaYunTable(table: HTMLElement) {
    this.daYunTable = table;
  }

  /**
   * 更新大运表格
   */
  updateDaYunTable(daYunData: DaYunInfo[]) {
    if (!this.daYunTable) {
      console.error('❌ 大运表格未初始化');
      return;
    }

    // 清空表格
    this.daYunTable.empty();

    if (!Array.isArray(daYunData) || daYunData.length === 0) {
      console.log('❌ 没有大运数据');
      return;
    }

    console.log('🎯 开始更新大运表格，数据长度:', daYunData.length);

    // 第一行：年份
    const yearRow = this.daYunTable.createEl('tr');
    yearRow.createEl('th', { text: '年份' });
    if (Array.isArray(daYunData)) {
      daYunData.slice(0, 10).forEach(dy => {
        yearRow.createEl('td', { text: dy.startYear.toString() });
      });
    }

    // 第二行：年龄
    const ageRow = this.daYunTable.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    if (Array.isArray(daYunData)) {
      daYunData.slice(0, 10).forEach(dy => {
        ageRow.createEl('td', { text: dy.startAge.toString() });
      });
    }

    // 第三行：干支（重要：这里处理点击事件）
    this.createGanZhiRow(daYunData);

    // 第四行：十神（如果有）
    if (Array.isArray(daYunData) && daYunData.some(dy => dy.shiShenGan)) {
      this.createShiShenRow(daYunData);
    }

    // 第五行：地势（如果有）
    if (Array.isArray(daYunData) && daYunData.some(dy => dy.diShi)) {
      this.createDiShiRow(daYunData);
    }

    // 第六行：旬空
    if (Array.isArray(daYunData) && daYunData.some(dy => dy.xunKong)) {
      this.createXunKongRow(daYunData);
    }

    // 第七行：纳音（如果有）
    if (Array.isArray(daYunData) && daYunData.some(dy => dy.naYin)) {
      this.createNaYinRow(daYunData);
    }

    // 第八行：神煞（根据设置显示）
    if (Array.isArray(daYunData) && daYunData.some(dy => dy.shenSha && dy.shenSha.length > 0)) {
      this.createShenShaRow(daYunData);
    }

    console.log('✅ 大运表格更新完成');
  }

  /**
   * 创建干支行（包含点击事件处理）
   */
  private createGanZhiRow(daYunData: DaYunInfo[]) {
    const gzRow = this.daYunTable!.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    
    if (Array.isArray(daYunData)) {
      daYunData.slice(0, 10).forEach((dy, sliceIndex) => {
        // 使用原始数组索引，而不是slice后的索引
        const originalIndex = sliceIndex; // 因为slice从0开始，所以sliceIndex就是原始索引
        
        const cell = gzRow.createEl('td', {
          cls: 'bazi-dayun-cell',
          attr: { 'data-index': originalIndex.toString() }
        });

        // 如果有干支，按五行颜色显示
        if (dy.ganZhi && dy.ganZhi.length >= 2) {
          const stem = dy.ganZhi[0]; // 天干
          const branch = dy.ganZhi[1]; // 地支

          // 创建天干元素并设置五行颜色
          const stemSpan = cell.createSpan({ text: stem });
          ColorSchemeService.setGanColor(stemSpan, stem);

          // 创建地支元素并设置五行颜色
          const branchSpan = cell.createSpan({ text: branch });
          ColorSchemeService.setZhiColor(branchSpan, branch);

          // 如果是前运，添加换行和小红字标注
          if ((dy as any).isQianYun === true) {
            cell.createEl('br'); // 换行
            cell.createEl('small', { 
              text: '前运', 
              attr: { style: 'color: #d73027; font-size: 0.6em;' }
            });
          }
        } else {
          // 如果没有干支或格式不正确，直接显示原文本
          cell.textContent = dy.ganZhi || '';
        }

        // 添加点击事件 - 使用原始索引
        cell.addEventListener('click', () => {
          console.log(`🎯 大运单元格点击: sliceIndex=${sliceIndex}, originalIndex=${originalIndex}`);
          this.selectDaYun(originalIndex);
        });

        // 如果是当前选中的大运，添加选中样式 - 使用原始索引
        const selectedIndex = this.extendedTableManager.getSelectedDaYunIndex();
        if (originalIndex === selectedIndex) {
          cell.classList.add('selected');
        }
      });
    }
  }

  /**
   * 创建十神行
   */
  private createShiShenRow(daYunData: DaYunInfo[]) {
    const shiShenRow = this.daYunTable!.createEl('tr');
    shiShenRow.createEl('th', { text: '十神' });
    daYunData.slice(0, 10).forEach(dy => {
      shiShenRow.createEl('td', {
        text: dy.shiShenGan || '',
        cls: 'bazi-shishen-cell'
      });
    });
  }

  /**
   * 创建地势行
   */
  private createDiShiRow(daYunData: DaYunInfo[]) {
    const diShiRow = this.daYunTable!.createEl('tr');
    diShiRow.createEl('th', { text: '地势' });
    daYunData.slice(0, 10).forEach(dy => {
      diShiRow.createEl('td', {
        text: dy.diShi || '',
        cls: 'bazi-dishi-cell'
      });
    });
  }

  /**
   * 创建旬空行
   */
  private createXunKongRow(daYunData: DaYunInfo[]) {
    const xkRow = this.daYunTable!.createEl('tr');
    xkRow.createEl('th', { text: '旬空' });
    daYunData.slice(0, 10).forEach(dy => {
      const cell = xkRow.createEl('td', {
        cls: 'bazi-xunkong-cell'
      });

      // 使用统一的旬空颜色显示方法
      if (dy.xunKong) {
        ColorSchemeService.createColoredXunKongElement(cell, dy.xunKong);
      } else {
        cell.textContent = '';
      }
    });
  }

  /**
   * 创建纳音行
   */
  private createNaYinRow(daYunData: DaYunInfo[]) {
    const naYinRow = this.daYunTable!.createEl('tr');
    naYinRow.createEl('th', { text: '纳音' });
    daYunData.slice(0, 10).forEach(dy => {
      const naYin = dy.naYin || '';
      const cell = naYinRow.createEl('td', {
        cls: 'bazi-nayin-cell'
      });

      if (naYin) {
        const naYinSpan = cell.createSpan({ text: naYin });
        const color = ColorSchemeService.getNaYinColor(naYin);
        if (color && color !== 'var(--text-normal)') {
          naYinSpan.style.setProperty('color', color, 'important');
          naYinSpan.style.setProperty('font-weight', 'bold', 'important');
        }
      }
    });
  }

  /**
   * 创建神煞行
   */
  private createShenShaRow(daYunData: DaYunInfo[]) {
    const shenShaRow = this.daYunTable!.createEl('tr', {
      cls: 'bazi-dayun-shensha-row'
    });
    shenShaRow.createEl('th', { text: '神煞' });

    // 根据设置控制神煞行的显示
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.daYun === false) {
      shenShaRow.style.display = 'none';
      console.log('🎯 隐藏大运神煞行');
    } else {
      console.log('🎯 显示大运神煞行');
    }

    daYunData.slice(0, 10).forEach(dy => {
      const cell = shenShaRow.createEl('td', {
        cls: 'bazi-shensha-cell'
      });

      if (dy.shenSha && dy.shenSha.length > 0) {
        // 直接使用ColorSchemeService的统一神煞元素创建方法
        ColorSchemeService.createColoredShenShaElement(
          cell,
          dy.shenSha,
          (shenSha) => this.showShenShaExplanation(shenSha),
          'bazi-shensha-list'
        );
      } else {
        cell.textContent = '无';
      }
    });
  }

  /**
   * 选择大运
   */
  private selectDaYun(index: number) {
    console.log(`🎯 selectDaYun: 选择大运索引 ${index}`);
    
    if (!this.baziInfo.daYun || index >= this.baziInfo.daYun.length) {
      console.log(`❌ selectDaYun: 大运数据无效或索引超出范围`);
      return;
    }

    // 更新扩展表格管理器的选中索引
    this.extendedTableManager.setSelectedDaYunIndex(index);

    // 高亮选中的大运单元格
    this.highlightSelectedDaYun(index);

    // 调用回调函数
    if (this.onDaYunSelect) {
      this.onDaYunSelect(index);
    }
  }

  /**
   * 高亮选中的大运单元格
   */
  private highlightSelectedDaYun(index: number) {
    if (this.daYunTable) {
      const cells = this.daYunTable.querySelectorAll('.bazi-dayun-cell');
      cells.forEach((cell, i) => {
        if (i === index) {
          cell.classList.add('selected');
        } else {
          cell.classList.remove('selected');
        }
      });
    }
  }



  private showShenShaExplanation(shenSha: string) {
    // 简化实现，实际应该显示详细的神煞说明弹窗
    console.log(`神煞说明: ${shenSha}`);
    // TODO: 实现神煞说明弹窗
  }

  /**
   * 更新神煞显示设置
   */
  updateShenShaSettings(showShenSha: any) {
    if (!this.daYunTable) return;

    const shenShaRow = this.daYunTable.querySelector('.bazi-dayun-shensha-row');
    if (shenShaRow) {
      if (showShenSha.daYun === false) {
        (shenShaRow as HTMLElement).style.display = 'none';
        console.log('🎯 隐藏大运神煞行');
      } else {
        (shenShaRow as HTMLElement).style.display = '';
        console.log('🎯 显示大运神煞行');
      }
    }
  }

}
