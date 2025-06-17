import { BaziInfo, DaYunInfo } from '../../../types/BaziInfo';
import { PillarCalculationService, ExtendedPillarInfo } from '../../../services/bazi/PillarCalculationService';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';
import { Solar } from 'lunar-typescript';

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

  // 十二长生显示模式（由InteractionManager管理）
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
   * 关闭指定层级及其后续层级
   * @param level 要关闭的层级
   */
  closeExtendedLevel(level: 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi') {
    console.log(`🔒 关闭扩展层级: ${level}`);

    const levelHierarchy = ['dayun', 'liunian', 'liuyue', 'liuri', 'liushi'];
    const closeIndex = levelHierarchy.indexOf(level);

    if (closeIndex === -1) {
      console.warn(`❌ 未知层级: ${level}`);
      return;
    }

    // 清除状态：关闭当前层级及其后续层级
    if (closeIndex <= levelHierarchy.indexOf('liunian')) {
      this.selectedLiuNianYear = 0;
    }
    if (closeIndex <= levelHierarchy.indexOf('liuyue')) {
      this.currentSelectedLiuYue = null;
    }
    if (closeIndex <= levelHierarchy.indexOf('liuri')) {
      this.currentSelectedLiuRi = null;
    }
    if (closeIndex <= levelHierarchy.indexOf('liushi')) {
      this.currentSelectedLiuShi = null;
    }

    // 确定新的目标层级
    let newTargetLevel: 'none' | 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' = 'none';
    if (closeIndex > 0) {
      newTargetLevel = levelHierarchy[closeIndex - 1] as any;
    } else {
      // 如果关闭大运，则完全关闭扩展
      newTargetLevel = 'none';
    }

    // 重新扩展到新的目标层级
    if (newTargetLevel === 'none') {
      this.clearAllExtendedColumns();
      this.currentExtendedLevel = 'none';
    } else {
      this.extendBaziTableToLevel(newTargetLevel);
    }

    console.log(`✅ 已关闭${level}层级，当前层级: ${this.currentExtendedLevel}`);
  }

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

    // 如果流时数据已经包含干支，直接使用
    if (this.currentSelectedLiuShi.ganZhi) {
      console.log(`✅ 获取流时柱信息: ${this.currentSelectedLiuShi.name} ${this.currentSelectedLiuShi.ganZhi} (使用后端数据)`);
      return PillarCalculationService.calculateLiuShiPillar(this.currentSelectedLiuShi.ganZhi, this.baziInfo.dayStem || '');
    }

    // 否则计算流时干支（使用timeIndex转换为标准时间）
    const timeIndex = this.currentSelectedLiuShi.timeIndex || 0;
    const standardTime = timeIndex * 2; // 转换为标准时间（子时=0，丑时=2...）

    const ganZhi = this.calculateTimeGanZhi(
      this.currentSelectedLiuShi.year,
      this.currentSelectedLiuShi.month,
      this.currentSelectedLiuShi.day,
      standardTime
    );

    console.log(`✅ 获取流时柱信息: ${this.currentSelectedLiuShi.name} ${ganZhi} (计算得出，timeIndex=${timeIndex}, standardTime=${standardTime})`);

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
   * 计算日期干支（使用lunar-typescript）
   */
  private calculateDayGanZhi(year: number, month: number, day: number): string {
    try {
      // 使用lunar-typescript库来计算准确的日柱干支
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      const dayStem = eightChar.getDayGan();
      const dayBranch = eightChar.getDayZhi();

      return dayStem + dayBranch;
    } catch (error) {
      console.error('计算日期干支失败:', error);
      return '甲子'; // 失败时返回默认值
    }
  }

  /**
   * 计算时辰干支（使用lunar-typescript，考虑流派设置）
   */
  private calculateTimeGanZhi(year: number, month: number, day: number, time: number): string {
    try {
      // 获取八字流派设置
      const sect = this.baziInfo.baziSect ? parseInt(this.baziInfo.baziSect) : 2;
      console.log(`🎯 ExtendedColumnManager: 使用八字流派 ${sect} 计算时柱干支`);

      // 使用lunar-typescript库来计算准确的时柱干支
      const solar = Solar.fromYmdHms(year, month, day, time, 0, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      // 设置八字流派（影响子时处理）
      eightChar.setSect(sect);

      const timeStem = eightChar.getTimeGan();
      const timeBranch = eightChar.getTimeZhi();

      const ganZhi = timeStem + timeBranch;
      console.log(`🎯 ExtendedColumnManager: ${year}-${month}-${day} ${time}时 -> ${ganZhi} (流派${sect})`);

      return ganZhi;
    } catch (error) {
      console.error('计算时辰干支失败:', error);
      return '甲子'; // 失败时返回默认值
    }
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
   * 添加表头列（包含关闭按钮）
   */
  private addHeaderColumn(pillarInfo: ExtendedPillarInfo, columnIndex: number) {
    const thead = this.baziTable?.querySelector('thead');
    if (!thead) return;

    const headerRow = thead.querySelector('tr');
    if (!headerRow) return;

    const th = headerRow.createEl('th', {
      cls: 'bazi-extended-header'
    });

    // 创建标题容器
    const titleContainer = th.createDiv({ cls: 'header-title-container' });
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    `;

    // 添加标题文本
    const titleSpan = titleContainer.createSpan({
      text: pillarInfo.name,
      cls: 'header-title'
    });

    // 添加关闭按钮
    const closeButton = titleContainer.createSpan({
      text: '×',
      cls: 'header-close-btn'
    });
    closeButton.style.cssText = `
      cursor: pointer;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: bold;
      padding: 0 2px;
      border-radius: 2px;
      transition: all 0.2s ease;
    `;

    // 关闭按钮悬停效果
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.color = 'var(--text-error)';
      closeButton.style.backgroundColor = 'var(--background-modifier-hover)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = 'var(--text-muted)';
      closeButton.style.backgroundColor = 'transparent';
    });

    // 关闭按钮点击事件
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeExtendedLevel(pillarInfo.type);
    });

    // 设置表头样式（与四柱一致的字体大小）
    th.style.cssText = `
      padding: 8px 6px;
      background: var(--background-modifier-border-hover);
      border: 1px solid var(--background-modifier-border);
      font-weight: bold;
      text-align: center;
      font-size: 14px;
      min-width: 60px;
      position: relative;
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
        font-size: 14px;
        min-width: 60px;
        background: var(--background-primary-alt);
      `;

      // 根据行类型填充内容
      this.fillCellContent(td, pillarInfo, rowIndex);
    });
  }

  /**
   * 填充单元格内容
   */
  private fillCellContent(cell: HTMLElement, pillarInfo: ExtendedPillarInfo, rowIndex: number) {
    // 根据行索引确定要显示的内容，与四柱表格的行顺序保持一致
    const rowLabels = ['天干', '地支', '藏干', '十神', '地势', '纳音', '旬空', '生肖', '神煞'];

    if (rowIndex >= rowLabels.length) return;

    const rowType = rowLabels[rowIndex];

    switch (rowType) {
      case '天干':
        this.fillStemCell(cell, pillarInfo);
        break;
      case '地支':
        this.fillBranchCell(cell, pillarInfo);
        break;
      case '藏干':
        this.fillHideGanCell(cell, pillarInfo);
        break;
      case '十神':
        this.fillShiShenCell(cell, pillarInfo);
        break;
      case '地势':
        this.fillDiShiCell(cell, pillarInfo);
        break;
      case '纳音':
        this.fillNaYinCell(cell, pillarInfo);
        break;
      case '旬空':
        this.fillXunKongCell(cell, pillarInfo);
        break;
      case '生肖':
        this.fillShengXiaoCell(cell, pillarInfo);
        break;
      case '神煞':
        this.fillShenShaCell(cell, pillarInfo);
        break;
    }
  }

  /**
   * 填充天干单元格
   */
  private fillStemCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.stem) {
      // 创建天干span并设置五行颜色
      const stemSpan = cell.createSpan({ text: pillarInfo.stem });
      ColorSchemeService.setGanColor(stemSpan, pillarInfo.stem);
    }
  }

  /**
   * 填充地支单元格
   */
  private fillBranchCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.branch) {
      // 创建地支span并设置五行颜色
      const branchSpan = cell.createSpan({ text: pillarInfo.branch });
      ColorSchemeService.setZhiColor(branchSpan, pillarInfo.branch);
    }
  }

  /**
   * 填充藏干单元格
   */
  private fillHideGanCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.hideGan) {
      // 使用ColorSchemeService创建带颜色的藏干显示
      ColorSchemeService.createColoredHideGanElement(cell, pillarInfo.hideGan);
    }
  }

  /**
   * 填充十神单元格（使用统一颜色方案）
   */
  private fillShiShenCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    // 天干十神
    if (pillarInfo.shiShenGan) {
      const shiShenSpan = cell.createSpan({
        text: pillarInfo.shiShenGan,
        cls: 'shishen-tag-small'
      });
      ColorSchemeService.setShiShenColor(shiShenSpan, pillarInfo.shiShenGan);
    }

    // 换行
    cell.createEl('br');

    // 地支藏干十神
    if (pillarInfo.shiShenZhi && pillarInfo.shiShenZhi.length > 0) {
      const shiShenZhiSpan = cell.createSpan({
        text: pillarInfo.shiShenZhi.join(','),
        cls: 'shishen-tag-small shishen-tag-hide'
      });
      // 为第一个十神应用颜色（简化处理）
      if (pillarInfo.shiShenZhi.length > 0) {
        ColorSchemeService.setShiShenColor(shiShenZhiSpan, pillarInfo.shiShenZhi[0]);
      }
    }
  }

  /**
   * 填充地势单元格（使用统一颜色方案）
   */
  private fillDiShiCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.diShi) {
      const diShiSpan = cell.createSpan({
        text: pillarInfo.diShi,
        cls: 'dishi-tag-small'
      });
      ColorSchemeService.setDiShiColor(diShiSpan, pillarInfo.diShi);
    }
  }

  /**
   * 填充纳音单元格（使用统一颜色方案）
   */
  private fillNaYinCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.naYin) {
      cell.textContent = pillarInfo.naYin;
      ColorSchemeService.setNaYinColor(cell, pillarInfo.naYin);
    }
  }

  /**
   * 填充旬空单元格
   */
  private fillXunKongCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.xunKong) {
      // 使用ColorSchemeService创建带颜色的旬空显示
      ColorSchemeService.createColoredXunKongElement(cell, pillarInfo.xunKong);
    }
  }

  /**
   * 填充生肖单元格
   */
  private fillShengXiaoCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.shengXiao) {
      cell.textContent = pillarInfo.shengXiao;
    }
  }

  /**
   * 填充神煞单元格
   */
  private fillShenShaCell(cell: HTMLElement, pillarInfo: ExtendedPillarInfo) {
    if (pillarInfo.shenSha && pillarInfo.shenSha.length > 0) {
      // 使用ColorSchemeService创建带颜色和点击事件的神煞显示
      ColorSchemeService.createColoredShenShaElement(cell, pillarInfo.shenSha, (shenSha: string) => {
        // 触发神煞点击事件
        const event = new CustomEvent('shensha-click', {
          detail: { shenSha },
          bubbles: true
        });
        cell.dispatchEvent(event);
      });
    }
  }

  /**
   * 更新地势模式（由InteractionManager调用）
   */
  updateChangShengMode(mode: number, modeInfo: any) {
    this.changShengMode = mode;
    console.log(`🔄 ExtendedColumnManager: 更新地势模式到 ${modeInfo.name}`);

    // 重新计算所有扩展列的地势显示
    this.refreshAllExtendedColumnsChangSheng(modeInfo);
  }

  /**
   * 刷新所有扩展列的地势显示
   */
  private refreshAllExtendedColumnsChangSheng(modeInfo: any) {
    if (!this.baziTable) return;

    // 查找地势行
    const diShiRow = this.baziTable.querySelector('.bazi-dishi-row');
    if (!diShiRow) return;

    // 更新每个扩展列的地势单元格
    this.extendedPillars.forEach((pillarInfo, index) => {
      const columnIndex = 5 + index + 1; // 5个基础列 + 扩展列索引 + 1（从1开始）
      const cell = diShiRow.querySelector(`td:nth-child(${columnIndex})`);
      if (cell) {
        this.updateExtendedColumnChangShengCell(cell, pillarInfo, modeInfo);
      }
    });
  }

  /**
   * 更新单个扩展列的地势单元格
   */
  private updateExtendedColumnChangShengCell(cell: Element, pillarInfo: ExtendedPillarInfo, modeInfo: any) {
    // 清空原内容
    cell.innerHTML = '';

    // 根据模式重新计算地势值
    let diShiValue = '';
    switch (modeInfo.key) {
      case 'diShi':
        // 地势：使用原有的地势值
        diShiValue = pillarInfo.diShi || '';
        break;
      case 'ziZuo':
        // 自坐：天干对地支的地势
        if (pillarInfo.stem && pillarInfo.branch) {
          diShiValue = this.calculateDiShiForPillar(pillarInfo.stem, pillarInfo.branch);
        }
        break;
      case 'yueLing':
        // 月令：天干对月支的地势
        if (pillarInfo.stem && this.baziInfo.monthBranch) {
          diShiValue = this.calculateDiShiForPillar(pillarInfo.stem, this.baziInfo.monthBranch);
        }
        break;
    }

    // 创建新的地势显示
    if (diShiValue) {
      const span = cell.createEl('span', {
        text: diShiValue,
        cls: 'dishi-tag-small'
      });
      ColorSchemeService.setDiShiColor(span, diShiValue);
    }
  }

  /**
   * 计算地势（使用BaziCalculator）
   */
  private calculateDiShiForPillar(stem: string, branch: string): string {
    return BaziCalculator.getDiShi(stem, branch);
  }
}
