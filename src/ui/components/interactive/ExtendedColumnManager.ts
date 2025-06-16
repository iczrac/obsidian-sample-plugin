import { BaziInfo, DaYunInfo } from '../../../types/BaziInfo';
import { PillarCalculationService, ExtendedPillarInfo } from '../../../services/bazi/PillarCalculationService';

/**
 * 扩展列管理器
 * 负责管理八字表格的扩展列（大运、流年、流月、流日、流时）
 */
export class ExtendedColumnManager {
  private baziInfo: BaziInfo;
  private baziTable: HTMLTableElement | null = null;
  private extendedPillars: ExtendedPillarInfo[] = [];
  private currentExtendedLevel: 'none' | 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' = 'none';

  // 状态管理
  private selectedDaYunIndex = 0;
  private selectedLiuNianYear = 0;
  private currentSelectedLiuYue: any = null;
  private currentSelectedLiuRi: any = null;
  private currentSelectedLiuShi: any = null;

  // 强制更新状态跟踪
  private lastExtendedDaYunIndex = -1;
  private lastExtendedLiuNianYear = 0;
  private lastExtendedLiuYue: any = null;
  private lastExtendedLiuRi: any = null;
  private lastExtendedLiuShi: any = null;

  // 十二长生显示模式
  private changShengMode: number = 0;

  constructor(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
  }

  /**
   * 设置八字表格引用
   */
  setBaziTable(table: HTMLTableElement) {
    this.baziTable = table;
  }

  /**
   * 扩展八字表格到指定层级
   */
  extendBaziTableToLevel(targetLevel: 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi') {
    console.log(`🚀 extendBaziTableToLevel: 开始扩展到${targetLevel}层级`);

    if (!this.baziTable) {
      console.log('❌ 八字表格未初始化');
      return;
    }

    // 检查目标层级是否可达
    const actualTargetLevel = this.getActualTargetLevel(targetLevel);
    console.log(`🎯 实际目标层级: ${actualTargetLevel} (请求层级: ${targetLevel})`);

    // 检查是否需要强制更新（例如大运切换时）
    const needsForceUpdate = this.needsForceUpdate(actualTargetLevel);

    // 如果已经是实际目标层级且不需要强制更新，跳过重复扩展
    if (this.currentExtendedLevel === actualTargetLevel && !needsForceUpdate) {
      console.log(`⚠️ 已扩展到${actualTargetLevel}层级，跳过重复扩展`);
      return;
    }

    if (needsForceUpdate) {
      console.log(`🔄 强制更新${actualTargetLevel}层级内容`);
    }

    console.log(`🧹 清除现有扩展，当前层级: ${this.currentExtendedLevel}`);
    // 清除现有扩展
    this.clearAllExtendedColumns();

    // 根据实际目标层级确定需要扩展的层级列表
    const levelsToExtend = this.getLevelsToExtend(actualTargetLevel);
    console.log(`📋 需要扩展的层级列表: ${levelsToExtend.join(' → ')}`);

    // 逐级扩展
    for (const level of levelsToExtend) {
      console.log(`🔄 正在处理层级: ${level}`);
      const pillarInfo = this.getPillarInfoForLevel(level);
      if (pillarInfo) {
        console.log(`✅ 获取到${level}柱信息:`, pillarInfo.name, pillarInfo.ganZhi);
        this.addExtendedColumn(pillarInfo);
      } else {
        console.log(`❌ 无法获取${level}柱信息`);
      }
    }

    // 更新当前扩展层级
    this.currentExtendedLevel = actualTargetLevel;
    console.log(`✅ 已扩展到${actualTargetLevel}层级，包含层级：${levelsToExtend.join(' → ')}`);

    // 更新状态跟踪
    this.updateExtendedStateTracking(actualTargetLevel);
  }

  /**
   * 检查是否需要强制更新
   */
  private needsForceUpdate(targetLevel: string): boolean {
    switch (targetLevel) {
      case 'dayun': {
        // 大运切换时需要强制更新
        const needsDaYunUpdate = this.lastExtendedDaYunIndex !== this.selectedDaYunIndex;
        console.log(`🔍 大运强制更新检查: lastIndex=${this.lastExtendedDaYunIndex}, currentIndex=${this.selectedDaYunIndex}, needsUpdate=${needsDaYunUpdate}`);
        return needsDaYunUpdate;
      }

      case 'liunian': {
        // 流年切换时需要强制更新
        const needsLiuNianUpdate = this.lastExtendedLiuNianYear !== this.selectedLiuNianYear;
        console.log(`🔍 流年强制更新检查: lastYear=${this.lastExtendedLiuNianYear}, currentYear=${this.selectedLiuNianYear}, needsUpdate=${needsLiuNianUpdate}`);
        return needsLiuNianUpdate;
      }

      case 'liuyue': {
        // 流月切换时需要强制更新
        const needsLiuYueUpdate = JSON.stringify(this.lastExtendedLiuYue) !== JSON.stringify(this.currentSelectedLiuYue);
        console.log(`🔍 流月强制更新检查: lastLiuYue=${JSON.stringify(this.lastExtendedLiuYue)}, currentLiuYue=${JSON.stringify(this.currentSelectedLiuYue)}, needsUpdate=${needsLiuYueUpdate}`);
        return needsLiuYueUpdate;
      }

      case 'liuri': {
        // 流日切换时需要强制更新
        const needsLiuRiUpdate = JSON.stringify(this.lastExtendedLiuRi) !== JSON.stringify(this.currentSelectedLiuRi);
        console.log(`🔍 流日强制更新检查: lastLiuRi=${JSON.stringify(this.lastExtendedLiuRi)}, currentLiuRi=${JSON.stringify(this.currentSelectedLiuRi)}, needsUpdate=${needsLiuRiUpdate}`);
        return needsLiuRiUpdate;
      }

      case 'liushi': {
        // 流时切换时需要强制更新
        const needsLiuShiUpdate = JSON.stringify(this.lastExtendedLiuShi) !== JSON.stringify(this.currentSelectedLiuShi);
        console.log(`🔍 流时强制更新检查: lastLiuShi=${JSON.stringify(this.lastExtendedLiuShi)}, currentLiuShi=${JSON.stringify(this.currentSelectedLiuShi)}, needsUpdate=${needsLiuShiUpdate}`);
        return needsLiuShiUpdate;
      }

      default:
        return false;
    }
  }

  /**
   * 更新扩展状态跟踪
   */
  private updateExtendedStateTracking(targetLevel: string): void {
    switch (targetLevel) {
      case 'dayun':
        this.lastExtendedDaYunIndex = this.selectedDaYunIndex;
        console.log(`📝 更新大运状态跟踪: ${this.lastExtendedDaYunIndex}`);
        break;

      case 'liunian':
        this.lastExtendedDaYunIndex = this.selectedDaYunIndex;
        this.lastExtendedLiuNianYear = this.selectedLiuNianYear;
        console.log(`📝 更新流年状态跟踪: 大运=${this.lastExtendedDaYunIndex}, 流年=${this.lastExtendedLiuNianYear}`);
        break;

      case 'liuyue':
        this.lastExtendedDaYunIndex = this.selectedDaYunIndex;
        this.lastExtendedLiuNianYear = this.selectedLiuNianYear;
        this.lastExtendedLiuYue = this.currentSelectedLiuYue ? JSON.parse(JSON.stringify(this.currentSelectedLiuYue)) : null;
        console.log(`📝 更新流月状态跟踪: 大运=${this.lastExtendedDaYunIndex}, 流年=${this.lastExtendedLiuNianYear}, 流月=${JSON.stringify(this.lastExtendedLiuYue)}`);
        break;

      case 'liuri':
        this.lastExtendedDaYunIndex = this.selectedDaYunIndex;
        this.lastExtendedLiuNianYear = this.selectedLiuNianYear;
        this.lastExtendedLiuYue = this.currentSelectedLiuYue ? JSON.parse(JSON.stringify(this.currentSelectedLiuYue)) : null;
        this.lastExtendedLiuRi = this.currentSelectedLiuRi ? JSON.parse(JSON.stringify(this.currentSelectedLiuRi)) : null;
        console.log(`📝 更新流日状态跟踪: 大运=${this.lastExtendedDaYunIndex}, 流年=${this.lastExtendedLiuNianYear}, 流月=${JSON.stringify(this.lastExtendedLiuYue)}, 流日=${JSON.stringify(this.lastExtendedLiuRi)}`);
        break;

      case 'liushi':
        this.lastExtendedDaYunIndex = this.selectedDaYunIndex;
        this.lastExtendedLiuNianYear = this.selectedLiuNianYear;
        this.lastExtendedLiuYue = this.currentSelectedLiuYue ? JSON.parse(JSON.stringify(this.currentSelectedLiuYue)) : null;
        this.lastExtendedLiuRi = this.currentSelectedLiuRi ? JSON.parse(JSON.stringify(this.currentSelectedLiuRi)) : null;
        this.lastExtendedLiuShi = this.currentSelectedLiuShi ? JSON.parse(JSON.stringify(this.currentSelectedLiuShi)) : null;
        console.log(`📝 更新流时状态跟踪: 大运=${this.lastExtendedDaYunIndex}, 流年=${this.lastExtendedLiuNianYear}, 流月=${JSON.stringify(this.lastExtendedLiuYue)}, 流日=${JSON.stringify(this.lastExtendedLiuRi)}, 流时=${JSON.stringify(this.lastExtendedLiuShi)}`);
        break;
    }
  }

  /**
   * 获取实际可达的目标层级
   */
  private getActualTargetLevel(requestedLevel: string): 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' {
    // 检查各层级的可用性
    if (requestedLevel === 'liushi') {
      // 流时需要选择流时
      if (this.currentSelectedLiuShi) {
        return 'liushi';
      } else if (this.currentSelectedLiuRi) {
        return 'liuri';
      } else if (this.currentSelectedLiuYue) {
        return 'liuyue';
      } else if (this.selectedLiuNianYear && this.selectedLiuNianYear !== 0) {
        return 'liunian';
      } else {
        return 'dayun';
      }
    } else if (requestedLevel === 'liuri') {
      // 流日需要选择流日
      if (this.currentSelectedLiuRi) {
        return 'liuri';
      } else if (this.currentSelectedLiuYue) {
        return 'liuyue';
      } else if (this.selectedLiuNianYear && this.selectedLiuNianYear !== 0) {
        return 'liunian';
      } else {
        return 'dayun';
      }
    } else if (requestedLevel === 'liuyue') {
      // 流月需要选择流月
      if (this.currentSelectedLiuYue) {
        return 'liuyue';
      } else if (this.selectedLiuNianYear && this.selectedLiuNianYear !== 0) {
        return 'liunian';
      } else {
        return 'dayun';
      }
    } else if (requestedLevel === 'liunian') {
      // 流年需要选择流年
      if (this.selectedLiuNianYear && this.selectedLiuNianYear !== 0) {
        return 'liunian';
      } else {
        return 'dayun';
      }
    } else {
      // 大运总是可用
      return 'dayun';
    }
  }

  /**
   * 根据目标层级获取需要扩展的层级列表
   */
  private getLevelsToExtend(targetLevel: string): string[] {
    const levelHierarchy = ['dayun', 'liunian', 'liuyue', 'liuri', 'liushi'];
    const targetIndex = levelHierarchy.indexOf(targetLevel);

    if (targetIndex === -1) {
      return [];
    }

    const levels = levelHierarchy.slice(0, targetIndex + 1);

    // 过滤掉无法获取数据的层级
    return levels.filter(level => {
      if (level === 'dayun') {
        return true; // 大运总是可用
      } else if (level === 'liunian') {
        return this.selectedLiuNianYear && this.selectedLiuNianYear !== 0; // 需要选择流年
      } else if (level === 'liuyue') {
        return this.currentSelectedLiuYue !== null; // 需要选择流月
      } else if (level === 'liuri') {
        return this.currentSelectedLiuRi !== null; // 需要选择流日
      } else if (level === 'liushi') {
        return this.currentSelectedLiuShi !== null; // 需要选择流时
      } else {
        return false; // 其他层级不支持
      }
    });
  }

  /**
   * 清除所有扩展列
   */
  clearAllExtendedColumns() {
    if (!this.baziTable) {
      return;
    }

    console.log(`🧹 开始清除扩展列，当前扩展柱数量: ${this.extendedPillars.length}`);

    // 清除表头的扩展列
    const thead = this.baziTable.querySelector('thead');
    if (thead) {
      const headerRow = thead.querySelector('tr');
      if (headerRow) {
        // 移除第6列及以后的所有列（保留前5列：标签+四柱）
        const cells = headerRow.querySelectorAll('th');
        for (let i = cells.length - 1; i >= 5; i--) {
          cells[i].remove();
        }
      }
    }

    // 清除表体的扩展列
    const tbody = this.baziTable.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // 移除第6列及以后的所有列（保留前5列：标签+四柱）
        for (let i = cells.length - 1; i >= 5; i--) {
          cells[i].remove();
        }
      });
    }

    // 清空扩展柱数组
    this.extendedPillars = [];
    console.log(`✅ 扩展列清除完成`);
  }

  // 状态管理方法
  setSelectedDaYunIndex(index: number) { this.selectedDaYunIndex = index; }
  setSelectedLiuNianYear(year: number) { this.selectedLiuNianYear = year; }
  setCurrentSelectedLiuYue(liuYue: any) { this.currentSelectedLiuYue = liuYue; }
  setCurrentSelectedLiuRi(liuRi: any) { this.currentSelectedLiuRi = liuRi; }
  setCurrentSelectedLiuShi(liuShi: any) { this.currentSelectedLiuShi = liuShi; }

  // 获取状态方法
  getSelectedDaYunIndex(): number { return this.selectedDaYunIndex; }
  getSelectedLiuNianYear(): number { return this.selectedLiuNianYear; }
  getCurrentSelectedLiuYue(): any { return this.currentSelectedLiuYue; }
  getCurrentSelectedLiuRi(): any { return this.currentSelectedLiuRi; }
  getCurrentSelectedLiuShi(): any { return this.currentSelectedLiuShi; }

  /**
   * 根据层级获取柱信息
   */
  private getPillarInfoForLevel(level: string): ExtendedPillarInfo | null {
    console.log(`🔍 getPillarInfoForLevel: ${level}`);

    try {
      switch (level) {
        case 'dayun':
          return this.getDaYunPillarInfo();
        case 'liunian':
          return this.getLiuNianPillarInfo();
        case 'liuyue':
          return this.getLiuYuePillarInfo();
        case 'liuri':
          return this.getLiuRiPillarInfo();
        case 'liushi':
          return this.getLiuShiPillarInfo();
        default:
          console.warn(`❌ 未知层级: ${level}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ 获取${level}柱信息时出错:`, error);
      return null;
    }
  }

  /**
   * 获取大运柱信息
   */
  private getDaYunPillarInfo(): ExtendedPillarInfo | null {
    if (!this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun) || this.selectedDaYunIndex >= this.baziInfo.daYun.length) {
      console.warn('❌ 大运数据不可用');
      return null;
    }

    const daYun = this.baziInfo.daYun[this.selectedDaYunIndex];
    console.log(`✅ 获取大运柱信息: ${daYun.ganZhi}`);

    // 使用现有的PillarCalculationService方法
    return PillarCalculationService.calculateDaYunPillar(daYun, this.baziInfo.dayStem || '');
  }

  /**
   * 获取流年柱信息
   */
  private getLiuNianPillarInfo(): ExtendedPillarInfo | null {
    if (!this.selectedLiuNianYear || this.selectedLiuNianYear === 0) {
      console.warn('❌ 流年年份未选择');
      return null;
    }

    // 计算流年干支
    const ganZhi = this.calculateYearGanZhi(this.selectedLiuNianYear);
    console.log(`✅ 获取流年柱信息: ${this.selectedLiuNianYear}年 ${ganZhi}`);

    // 创建流年对象
    const liuNian = {
      year: this.selectedLiuNianYear,
      ganZhi: ganZhi
    };

    return PillarCalculationService.calculateLiuNianPillar(liuNian, this.baziInfo.dayStem || '');
  }

  /**
   * 获取流月柱信息
   */
  private getLiuYuePillarInfo(): ExtendedPillarInfo | null {
    if (!this.currentSelectedLiuYue) {
      console.warn('❌ 流月未选择');
      return null;
    }

    console.log(`✅ 获取流月柱信息: ${this.currentSelectedLiuYue.ganZhi}`);

    return PillarCalculationService.calculateLiuYuePillar(this.currentSelectedLiuYue, this.baziInfo.dayStem || '');
  }

  /**
   * 获取流日柱信息
   */
  private getLiuRiPillarInfo(): ExtendedPillarInfo | null {
    if (!this.currentSelectedLiuRi) {
      console.warn('❌ 流日未选择');
      return null;
    }

    // 计算流日干支
    const ganZhi = this.calculateDayGanZhi(
      this.currentSelectedLiuRi.year,
      this.currentSelectedLiuRi.month,
      this.currentSelectedLiuRi.day
    );

    console.log(`✅ 获取流日柱信息: ${this.currentSelectedLiuRi.year}-${this.currentSelectedLiuRi.month}-${this.currentSelectedLiuRi.day} ${ganZhi}`);

    return PillarCalculationService.calculateLiuRiPillar(ganZhi, this.baziInfo.dayStem || '');
  }

  /**
   * 获取流时柱信息
   */
  private getLiuShiPillarInfo(): ExtendedPillarInfo | null {
    if (!this.currentSelectedLiuShi) {
      console.warn('❌ 流时未选择');
      return null;
    }

    // 计算流时干支
    const ganZhi = this.calculateTimeGanZhi(
      this.currentSelectedLiuShi.year,
      this.currentSelectedLiuShi.month,
      this.currentSelectedLiuShi.day,
      this.currentSelectedLiuShi.time
    );

    console.log(`✅ 获取流时柱信息: ${this.currentSelectedLiuShi.time}时 ${ganZhi}`);

    return PillarCalculationService.calculateLiuShiPillar(ganZhi, this.baziInfo.dayStem || '');
  }

  /**
   * 计算年份干支
   */
  private calculateYearGanZhi(year: number): string {
    const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 以甲子年（1984年）为基准计算
    const baseYear = 1984;
    const offset = year - baseYear;

    const ganIndex = offset % 10;
    const zhiIndex = offset % 12;

    const gan = gans[ganIndex >= 0 ? ganIndex : ganIndex + 10];
    const zhi = zhis[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12];

    return gan + zhi;
  }

  /**
   * 计算日期干支（简化版，实际应使用lunar-typescript）
   */
  private calculateDayGanZhi(_year: number, _month: number, _day: number): string {
    // 这里应该使用lunar-typescript库来计算准确的日柱干支
    // 暂时返回一个占位符
    return '甲子'; // TODO: 实现准确的日柱计算
  }

  /**
   * 计算时辰干支（简化版，实际应使用lunar-typescript）
   */
  private calculateTimeGanZhi(_year: number, _month: number, _day: number, _time: number): string {
    // 这里应该使用lunar-typescript库来计算准确的时柱干支
    // 暂时返回一个占位符
    return '甲子'; // TODO: 实现准确的时柱计算
  }

  /**
   * 添加扩展列到表格
   */
  private addExtendedColumn(pillarInfo: ExtendedPillarInfo) {
    if (!this.baziTable) {
      console.error('❌ 八字表格未初始化');
      return;
    }

    console.log(`🔄 添加扩展列: ${pillarInfo.name} (${pillarInfo.ganZhi})`);

    // 添加到扩展柱数组
    this.extendedPillars.push(pillarInfo);

    // 获取当前列索引（5 + 已有扩展列数量）
    const columnIndex = 5 + this.extendedPillars.length - 1;

    // 添加表头
    this.addHeaderColumn(pillarInfo, columnIndex);

    // 添加表体列
    this.addBodyColumns(pillarInfo, columnIndex);

    console.log(`✅ 扩展列添加完成: ${pillarInfo.name}`);
  }

  /**
   * 添加表头列
   */
  private addHeaderColumn(pillarInfo: ExtendedPillarInfo, columnIndex: number) {
    const thead = this.baziTable?.querySelector('thead');
    if (!thead) return;

    const headerRow = thead.querySelector('tr');
    if (!headerRow) return;

    const th = headerRow.createEl('th', {
      text: pillarInfo.name,
      cls: 'bazi-extended-header'
    });

    th.style.cssText = `
      padding: 8px 6px;
      background: var(--background-modifier-border);
      border: 1px solid var(--background-modifier-border);
      font-weight: bold;
      text-align: center;
      font-size: 12px;
      min-width: 60px;
    `;
  }

  /**
   * 添加表体列
   */
  private addBodyColumns(pillarInfo: ExtendedPillarInfo, columnIndex: number) {
    const tbody = this.baziTable?.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
      const td = row.createEl('td', {
        cls: 'bazi-extended-cell'
      });

      td.style.cssText = `
        padding: 6px 4px;
        border: 1px solid var(--background-modifier-border);
        text-align: center;
        font-size: 11px;
        min-width: 60px;
      `;

      // 根据行类型填充内容
      this.fillCellContent(td, pillarInfo, rowIndex);
    });
  }

  /**
   * 填充单元格内容
   */
  private fillCellContent(cell: HTMLElement, pillarInfo: ExtendedPillarInfo, rowIndex: number) {
    // 根据行索引确定要显示的内容
    const rowLabels = ['干支', '纳音', '十神', '地势', '旬空', '神煞'];

    if (rowIndex >= rowLabels.length) return;

    const rowType = rowLabels[rowIndex];

    switch (rowType) {
      case '干支':
        this.fillGanZhiCell(cell, pillarInfo);
        break;
      case '纳音':
        this.fillNaYinCell(cell, pillarInfo);
        break;
      case '十神':
        this.fillShiShenCell(cell, pillarInfo);
        break;
      case '地势':
        this.fillDiShiCell(cell, pillarInfo);
        break;
      case '旬空':
        this.fillXunKongCell(cell, pillarInfo);
        break;
      case '神煞':
        this.fillShenShaCell(cell, pillarInfo);
        break;
    }
  }

  /**
   * 填充干支单元格
   */
  private fillGanZhiCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.ganZhi) {
      // 这里应该使用ColorSchemeService来创建带颜色的干支显示
      cell.textContent = pillarInfo.ganZhi;
    }
  }

  /**
   * 填充纳音单元格
   */
  private fillNaYinCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.naYin) {
      cell.textContent = pillarInfo.naYin;
    }
  }

  /**
   * 填充十神单元格
   */
  private fillShiShenCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.shiShenGan) {
      cell.textContent = pillarInfo.shiShenGan;
    }
  }

  /**
   * 填充地势单元格
   */
  private fillDiShiCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.diShi) {
      cell.textContent = pillarInfo.diShi;
    }
  }

  /**
   * 填充旬空单元格
   */
  private fillXunKongCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.xunKong) {
      cell.textContent = pillarInfo.xunKong;
    }
  }

  /**
   * 填充神煞单元格
   */
  private fillShenShaCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.shenSha && pillarInfo.shenSha.length > 0) {
      cell.textContent = pillarInfo.shenSha.join(' ');
    }
  }
}
