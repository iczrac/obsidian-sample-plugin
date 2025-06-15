import { BaziInfo, DaYunInfo } from '../../../types/BaziInfo';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';
import { ShiShenCalculator } from '../../../services/bazi/ShiShenCalculator';
import { BaziUtils } from '../../../services/bazi/BaziUtils';

/**
 * 扩展柱信息接口
 */
export interface ExtendedPillarInfo {
  type: 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi';
  name: string; // 显示名称，如"大运"、"流年"等
  stem: string; // 天干
  branch: string; // 地支
  ganZhi: string; // 干支组合
  hideGan: string; // 藏干
  shiShenGan: string; // 天干十神
  shiShenZhi: string[]; // 地支藏干十神
  diShi: string; // 地势
  naYin: string; // 纳音
  xunKong: string; // 旬空
  shengXiao: string; // 生肖
  shenSha: string[]; // 神煞
  wuXing: string; // 五行
}

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
    console.log(`🔍 getPillarInfoForLevel: 获取${level}层级的柱信息`);

    switch (level) {
      case 'dayun':
        console.log(`🔍 大运层级: selectedDaYunIndex=${this.selectedDaYunIndex}`);
        return this.getCurrentDaYunPillar();
      case 'liunian':
        console.log(`🔍 流年层级: selectedLiuNianYear=${this.selectedLiuNianYear}`);
        return this.getCurrentLiuNianPillar();
      case 'liuyue':
        console.log(`🔍 流月层级: currentSelectedLiuYue=`, this.currentSelectedLiuYue);
        return this.getCurrentLiuYuePillar();
      case 'liuri':
        console.log(`🔍 流日层级: currentSelectedLiuRi=`, this.currentSelectedLiuRi);
        return this.getCurrentLiuRiPillar();
      case 'liushi':
        console.log(`🔍 流时层级: currentSelectedLiuShi=`, this.currentSelectedLiuShi);
        return this.getCurrentLiuShiPillar();
      default:
        console.log(`❌ 未知层级: ${level}`);
        return null;
    }
  }

  /**
   * 添加扩展列
   */
  private addExtendedColumn(pillarInfo: ExtendedPillarInfo) {
    if (!this.baziTable) {
      console.log('❌ 八字表格未初始化');
      return;
    }

    console.log(`🔄 添加扩展列: ${pillarInfo.name} (${pillarInfo.ganZhi})`);

    // 添加到扩展柱数组
    this.extendedPillars.push(pillarInfo);

    // 添加表头
    const thead = this.baziTable.querySelector('thead');
    if (thead) {
      const headerRow = thead.querySelector('tr');
      if (headerRow) {
        const th = headerRow.createEl('th', { text: pillarInfo.name });
        th.style.cssText = `
          background: var(--background-secondary);
          border: 1px solid var(--background-modifier-border);
          padding: 8px;
          text-align: center;
          font-weight: bold;
        `;
      }
    }

    // 添加表体各行
    const tbody = this.baziTable.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');

      // 天干行
      if (rows[0]) {
        const stemCell = rows[0].createEl('td', { text: pillarInfo.stem });
        this.applyStemWuXingColor(stemCell, pillarInfo.stem);
      }

      // 地支行
      if (rows[1]) {
        const branchCell = rows[1].createEl('td', { text: pillarInfo.branch });
        this.applyBranchWuXingColor(branchCell, pillarInfo.branch);
      }

      // 藏干行
      if (rows[2]) {
        const hideGanCell = rows[2].createEl('td');
        this.createColoredHideGan(hideGanCell, pillarInfo.hideGan);
      }

      // 十神行
      if (rows[3]) {
        const shiShenCell = rows[3].createEl('td');
        // 天干十神
        if (pillarInfo.shiShenGan) {
          shiShenCell.createSpan({
            text: pillarInfo.shiShenGan,
            cls: 'shishen-tag-small'
          });
        }
        shiShenCell.createEl('br');
        // 地支藏干十神
        if (pillarInfo.shiShenZhi && pillarInfo.shiShenZhi.length > 0) {
          shiShenCell.createSpan({
            text: pillarInfo.shiShenZhi.join(','),
            cls: 'shishen-tag-small shishen-tag-hide'
          });
        }
      }

      // 地势行
      if (rows[4]) {
        const diShiCell = rows[4].createEl('td');
        diShiCell.createSpan({
          text: pillarInfo.diShi,
          cls: 'dishi-tag-small'
        });
      }

      // 纳音行
      if (rows[5]) {
        rows[5].createEl('td', { text: pillarInfo.naYin });
      }

      // 旬空行
      if (rows[6]) {
        rows[6].createEl('td', { text: pillarInfo.xunKong });
      }

      // 生肖行
      if (rows[7]) {
        rows[7].createEl('td', { text: pillarInfo.shengXiao });
      }

      // 神煞行
      if (rows[8]) {
        const shenShaCell = rows[8].createEl('td');
        this.createShenShaContent(shenShaCell, pillarInfo.shenSha);
      }
    }

    console.log(`✅ 扩展列添加完成: ${pillarInfo.name}`);
  }

  /**
   * 获取当前选中的流年柱信息
   */
  private getCurrentLiuNianPillar(): ExtendedPillarInfo | null {
    console.log(`📅 getCurrentLiuNianPillar: 开始获取流年柱信息`);

    if (!this.selectedLiuNianYear || this.selectedLiuNianYear === 0) {
      console.log(`❌ getCurrentLiuNianPillar: 没有选中的流年`);
      return null;
    }

    // 计算流年干支
    const ganZhi = this.calculateYearGanZhi(this.selectedLiuNianYear);
    console.log(`📅 getCurrentLiuNianPillar: 流年${this.selectedLiuNianYear}的干支为${ganZhi}`);

    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ getCurrentLiuNianPillar: 流年干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    return {
      type: 'liunian',
      name: '流年',
      stem,
      branch,
      ganZhi,
      hideGan: this.getHideGan(branch),
      shiShenGan: this.getShiShen(dayStem, stem),
      shiShenZhi: this.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: this.getNaYin(ganZhi),
      xunKong: this.calculateXunKong(stem, branch),
      shengXiao: this.getShengXiao(branch),
      shenSha: [], // TODO: 计算流年神煞
      wuXing: this.getStemWuXing(stem)
    };
  }

  /**
   * 获取当前选中的流月柱信息
   */
  private getCurrentLiuYuePillar(): ExtendedPillarInfo | null {
    console.log(`📅 getCurrentLiuYuePillar: 开始获取流月柱信息`);

    if (!this.currentSelectedLiuYue) {
      console.log(`❌ getCurrentLiuYuePillar: 没有选中的流月`);
      return null;
    }

    console.log(`📅 getCurrentLiuYuePillar: 使用当前选中流月`, this.currentSelectedLiuYue);

    const ganZhi = this.currentSelectedLiuYue.ganZhi || '';
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ getCurrentLiuYuePillar: 流月干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    return {
      type: 'liuyue',
      name: '流月',
      stem,
      branch,
      ganZhi,
      hideGan: this.getHideGan(branch),
      shiShenGan: this.getShiShen(dayStem, stem),
      shiShenZhi: this.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: this.getNaYin(ganZhi),
      xunKong: this.calculateXunKong(stem, branch),
      shengXiao: this.getShengXiao(branch),
      shenSha: [], // TODO: 计算流月神煞
      wuXing: this.getStemWuXing(stem)
    };
  }

  /**
   * 获取当前选中的流日柱信息
   */
  private getCurrentLiuRiPillar(): ExtendedPillarInfo | null {
    console.log(`📅 getCurrentLiuRiPillar: 开始获取流日柱信息`);

    if (!this.currentSelectedLiuRi) {
      console.log(`❌ getCurrentLiuRiPillar: 没有选中的流日`);
      return null;
    }

    console.log(`📅 getCurrentLiuRiPillar: 使用当前选中流日`, this.currentSelectedLiuRi);

    const ganZhi = this.currentSelectedLiuRi.ganZhi;
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ getCurrentLiuRiPillar: 流日干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    return {
      type: 'liuri',
      name: '流日',
      stem,
      branch,
      ganZhi,
      hideGan: this.getHideGan(branch),
      shiShenGan: this.getShiShen(dayStem, stem),
      shiShenZhi: this.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: this.getNaYin(ganZhi),
      xunKong: this.calculateXunKong(stem, branch),
      shengXiao: this.getShengXiao(branch),
      shenSha: [], // TODO: 计算流日神煞
      wuXing: this.getStemWuXing(stem)
    };
  }

  /**
   * 获取当前选中的流时柱信息
   */
  private getCurrentLiuShiPillar(): ExtendedPillarInfo | null {
    console.log(`⏰ getCurrentLiuShiPillar: 开始获取流时柱信息`);

    if (!this.currentSelectedLiuShi) {
      console.log(`❌ getCurrentLiuShiPillar: 没有选中的流时`);
      return null;
    }

    console.log(`⏰ getCurrentLiuShiPillar: 使用当前选中流时`, this.currentSelectedLiuShi);

    const ganZhi = this.currentSelectedLiuShi.ganZhi;
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ getCurrentLiuShiPillar: 流时干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    return {
      type: 'liushi',
      name: '流时',
      stem,
      branch,
      ganZhi,
      hideGan: this.getHideGan(branch),
      shiShenGan: this.getShiShen(dayStem, stem),
      shiShenZhi: this.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: this.getNaYin(ganZhi),
      xunKong: this.calculateXunKong(stem, branch),
      shengXiao: this.getShengXiao(branch),
      shenSha: [], // TODO: 计算流时神煞
      wuXing: this.getStemWuXing(stem)
    };
  }

  /**
   * 获取当前选中的大运柱信息
   */
  private getCurrentDaYunPillar(): ExtendedPillarInfo | null {
    console.log(`📅 getCurrentDaYunPillar: 开始获取大运柱信息`);

    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      console.log(`❌ getCurrentDaYunPillar: 没有大运数据`);
      return null;
    }

    const daYun = this.baziInfo.daYun[this.selectedDaYunIndex];
    if (!daYun) {
      console.log(`❌ getCurrentDaYunPillar: 大运索引${this.selectedDaYunIndex}无效`);
      return null;
    }

    console.log(`📅 getCurrentDaYunPillar: 使用大运`, daYun);

    // 确保daYun是对象类型
    if (typeof daYun === 'string') {
      console.log(`❌ getCurrentDaYunPillar: 大运数据类型错误，期望对象但得到字符串`);
      return null;
    }

    const ganZhi = daYun.ganZhi || '';
    if (ganZhi.length < 2) {
      console.log(`❌ getCurrentDaYunPillar: 大运干支无效`, ganZhi);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    return {
      type: 'dayun',
      name: '大运',
      stem,
      branch,
      ganZhi,
      hideGan: this.getHideGan(branch),
      shiShenGan: this.getShiShen(dayStem, stem),
      shiShenZhi: this.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: this.getNaYin(ganZhi),
      xunKong: this.calculateXunKong(stem, branch),
      shengXiao: this.getShengXiao(branch),
      shenSha: [], // TODO: 计算大运神煞
      wuXing: this.getStemWuXing(stem)
    };
  }

  // ==================== 工具方法 ====================

  /**
   * 计算年份干支
   */
  private calculateYearGanZhi(year: number): string {
    // 以1984年甲子年为基准
    const baseYear = 1984;
    const yearOffset = year - baseYear;

    const stems = "甲乙丙丁戊己庚辛壬癸";
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    const stemIndex = (yearOffset % 10 + 10) % 10;
    const branchIndex = (yearOffset % 12 + 12) % 12;

    return stems[stemIndex] + branches[branchIndex];
  }

  /**
   * 获取地支藏干
   */
  private getHideGan(branch: string): string {
    const hideGanMap: { [key: string]: string } = {
      '子': '癸',
      '丑': '己癸辛',
      '寅': '甲丙戊',
      '卯': '乙',
      '辰': '戊乙癸',
      '巳': '丙戊庚',
      '午': '丁己',
      '未': '己丁乙',
      '申': '庚壬戊',
      '酉': '辛',
      '戌': '戊辛丁',
      '亥': '壬甲'
    };
    return hideGanMap[branch] || '';
  }

  /**
   * 获取十神
   */
  private getShiShen(dayStem: string, targetStem: string): string {
    if (!dayStem || !targetStem) return '';

    // 简化的十神计算
    const shiShenMap: { [key: string]: { [key: string]: string } } = {
      '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
      '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
      '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
      '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
      '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
      '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
      '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
      '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
      '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
      '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
    };

    return shiShenMap[dayStem]?.[targetStem] || '';
  }

  /**
   * 获取地支藏干十神
   */
  private getHiddenShiShen(dayStem: string, branch: string): string[] {
    const hideGan = this.getHideGan(branch);
    const result: string[] = [];

    for (const gan of hideGan) {
      const shiShen = this.getShiShen(dayStem, gan);
      if (shiShen) {
        result.push(shiShen);
      }
    }

    return result;
  }

  /**
   * 计算地势
   */
  private calculateDiShiForPillar(dayStem: string, branch: string): string {
    // 简化的地势计算
    const diShiMap: { [key: string]: { [key: string]: string } } = {
      '甲': { '亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官', '卯': '帝旺', '辰': '衰', '巳': '病', '午': '死', '未': '墓', '申': '绝', '酉': '胎', '戌': '养' },
      '乙': { '午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官', '寅': '帝旺', '丑': '衰', '子': '病', '亥': '死', '戌': '墓', '酉': '绝', '申': '胎', '未': '养' },
      '丙': { '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养' },
      '丁': { '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养' },
      '戊': { '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养' },
      '己': { '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养' },
      '庚': { '巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官', '酉': '帝旺', '戌': '衰', '亥': '病', '子': '死', '丑': '墓', '寅': '绝', '卯': '胎', '辰': '养' },
      '辛': { '子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官', '申': '帝旺', '未': '衰', '午': '病', '巳': '死', '辰': '墓', '卯': '绝', '寅': '胎', '丑': '养' },
      '壬': { '申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官', '子': '帝旺', '丑': '衰', '寅': '病', '卯': '死', '辰': '墓', '巳': '绝', '午': '胎', '未': '养' },
      '癸': { '卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官', '亥': '帝旺', '戌': '衰', '酉': '病', '申': '死', '未': '墓', '午': '绝', '巳': '胎', '辰': '养' }
    };

    return diShiMap[dayStem]?.[branch] || '';
  }

  /**
   * 获取纳音
   */
  private getNaYin(ganZhi: string): string {
    if (ganZhi.length !== 2) return '';

    const naYinMap: { [key: string]: string } = {
      '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
      '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
    };

    return naYinMap[ganZhi] || '';
  }

  /**
   * 计算旬空
   */
  private calculateXunKong(stem: string, branch: string): string {
    // 简化的旬空计算
    const xunKongMap: { [key: string]: string } = {
      '甲子': '戌亥', '甲戌': '申酉', '甲申': '午未', '甲午': '辰巳', '甲辰': '寅卯', '甲寅': '子丑'
    };

    // 找到对应的旬
    const ganZhi = stem + branch;
    for (const [xun, kongWang] of Object.entries(xunKongMap)) {
      if (ganZhi >= xun && ganZhi < this.getNextXun(xun)) {
        return kongWang;
      }
    }

    return '';
  }

  /**
   * 获取下一个旬
   */
  private getNextXun(currentXun: string): string {
    const xunList = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
    const currentIndex = xunList.indexOf(currentXun);
    if (currentIndex === -1 || currentIndex === xunList.length - 1) {
      return '甲子'; // 循环回到开始
    }
    return xunList[currentIndex + 1];
  }

  /**
   * 获取生肖
   */
  private getShengXiao(branch: string): string {
    const shengXiaoMap: { [key: string]: string } = {
      '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
      '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
      '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
    };
    return shengXiaoMap[branch] || '';
  }

  /**
   * 获取天干五行
   */
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

  /**
   * 获取地支五行
   */
  private getBranchWuXing(branch: string): string {
    const branchWuXing: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchWuXing[branch] || '';
  }

  /**
   * 应用天干五行颜色
   */
  private applyStemWuXingColor(element: HTMLElement, stem: string) {
    const wuXing = this.getStemWuXing(stem);
    this.setWuXingColorDirectly(element, wuXing);
  }

  /**
   * 应用地支五行颜色
   */
  private applyBranchWuXingColor(element: HTMLElement, branch: string) {
    const wuXing = this.getBranchWuXing(branch);
    this.setWuXingColorDirectly(element, wuXing);
  }

  /**
   * 创建带颜色的藏干
   */
  private createColoredHideGan(element: HTMLElement, hideGan: string) {
    if (!hideGan) return;

    for (const gan of hideGan) {
      const span = element.createSpan({ text: gan });
      this.applyStemWuXingColor(span, gan);
    }
  }

  /**
   * 创建神煞内容
   */
  private createShenShaContent(element: HTMLElement, shenSha: string[]) {
    if (!shenSha || shenSha.length === 0) {
      return;
    }

    shenSha.forEach((sha, index) => {
      if (index > 0) {
        element.createSpan({ text: ' ' });
      }

      const shenShaSpan = element.createSpan({
        text: sha,
        cls: 'shensha-tag'
      });
      shenShaSpan.style.cssText = `
        display: inline-block;
        padding: 2px 4px;
        margin: 1px;
        border-radius: 3px;
        font-size: 10px;
        background: var(--background-modifier-border);
        color: var(--text-muted);
        cursor: pointer;
      `;
    });
  }

  /**
   * 直接设置五行颜色
   */
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
