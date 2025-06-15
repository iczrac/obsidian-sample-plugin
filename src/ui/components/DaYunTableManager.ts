import { BaziInfo, DaYunInfo } from '../../types/BaziInfo';
import { ShenShaExplanationService } from '../../services/ShenShaExplanationService';
import { ExtendedTableManager } from './ExtendedTableManager';

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
          this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));

          // 创建地支元素并设置五行颜色
          const branchSpan = cell.createSpan({ text: branch });
          this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));

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

      // 如果有旬空，按五行颜色显示
      if (dy.xunKong && dy.xunKong.length >= 2) {
        const xk1 = dy.xunKong[0]; // 第一个旬空地支
        const xk2 = dy.xunKong[1]; // 第二个旬空地支

        // 创建第一个旬空地支元素并设置五行颜色
        const xk1Span = cell.createSpan({ text: xk1 });
        this.setWuXingColorDirectly(xk1Span, this.getBranchWuXing(xk1));

        // 创建第二个旬空地支元素并设置五行颜色
        const xk2Span = cell.createSpan({ text: xk2 });
        this.setWuXingColorDirectly(xk2Span, this.getBranchWuXing(xk2));
      } else {
        // 如果没有旬空或格式不正确，直接显示原文本
        cell.textContent = dy.xunKong || '';
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
        const wuXing = this.extractWuXingFromNaYin(naYin);
        const naYinSpan = cell.createSpan({ text: naYin });
        this.setWuXingColorDirectly(naYinSpan, wuXing);
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
        const shenShaList = cell.createDiv({ cls: 'bazi-shensha-list' });
        dy.shenSha.forEach((shenSha: string) => {
          const shenShaInfo = ShenShaExplanationService.getShenShaInfo(shenSha);
          const type = shenShaInfo?.type || '未知';

          let cssClass = '';
          if (type === '吉神') {
            cssClass = 'shensha-good';
          } else if (type === '凶神') {
            cssClass = 'shensha-bad';
          } else if (type === '吉凶神') {
            cssClass = 'shensha-mixed';
          }

          const shenShaEl = shenShaList.createEl('span', {
            text: shenSha,
            cls: `bazi-shensha ${cssClass}`,
            attr: {
              'data-shensha': shenSha,
              'data-type': type,
              'title': shenShaInfo?.explanation || ''
            }
          });

          // 添加点击事件显示神煞详情
          shenShaEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showShenShaExplanation(shenSha);
          });
        });
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

  // 工具方法 - 直接设置五行颜色（与原InteractiveBaziView保持一致）
  private setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
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

  private getStemWuXing(stem: string): string {
    // 直接使用映射表，与原代码保持一致
    const stemWuXingMap: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return stemWuXingMap[stem] || '';
  }

  private getBranchWuXing(branch: string): string {
    // 临时实现，实际应该从BaziUtils获取
    const branchWuXingMap: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchWuXingMap[branch] || '';
  }

  private extractWuXingFromNaYin(naYin: string): string {
    // 纳音通常以五行结尾，如"金箔金"、"炉中火"等
    if (naYin.includes('金')) return '金';
    if (naYin.includes('木')) return '木';
    if (naYin.includes('水')) return '水';
    if (naYin.includes('火')) return '火';
    if (naYin.includes('土')) return '土';
    return '';
  }

  private showShenShaExplanation(shenSha: string) {
    // 简化实现，实际应该显示详细的神煞说明弹窗
    console.log(`神煞说明: ${shenSha}`);
    // TODO: 实现神煞说明弹窗
  }
}
