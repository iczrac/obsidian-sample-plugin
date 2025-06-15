import { BaziInfo } from '../../types/BaziInfo';
import { ShiShenCalculator } from '../../services/bazi/ShiShenCalculator';
import { BaziCalculator } from '../../services/bazi/BaziCalculator';
import { BaziUtils } from '../../services/bazi/BaziUtils';

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
 * 扩展表格管理器
 * 负责管理四柱表格的扩展功能
 */
export class ExtendedTableManager {
  private baziInfo: BaziInfo;
  private baziTable: HTMLTableElement | null = null;
  private currentExtendedLevel: 'none' | 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' = 'none';
  private extendedPillars: ExtendedPillarInfo[] = [];

  // 状态管理
  private selectedDaYunIndex = 0;
  private selectedLiuNianYear = 0;
  private currentSelectedLiuYue: any = null;
  private currentDaYunLiuNianData: any[] = [];

  constructor(baziInfo: BaziInfo, baziTable: HTMLTableElement) {
    this.baziInfo = baziInfo;
    this.baziTable = baziTable;
  }

  /**
   * 更新八字信息
   */
  updateBaziInfo(baziInfo: BaziInfo) {
    this.baziInfo = baziInfo;
  }

  /**
   * 更新表格引用
   */
  updateBaziTable(baziTable: HTMLTableElement) {
    this.baziTable = baziTable;
  }

  /**
   * 设置选中的大运索引
   */
  setSelectedDaYunIndex(index: number) {
    this.selectedDaYunIndex = index;
  }

  /**
   * 获取选中的大运索引
   */
  getSelectedDaYunIndex(): number {
    return this.selectedDaYunIndex;
  }

  /**
   * 设置选中的流年年份
   */
  setSelectedLiuNianYear(year: number) {
    this.selectedLiuNianYear = year;
  }

  /**
   * 获取选中的流年年份
   */
  getSelectedLiuNianYear(): number {
    return this.selectedLiuNianYear;
  }

  /**
   * 设置当前选中的流月
   */
  setCurrentSelectedLiuYue(liuYue: any) {
    this.currentSelectedLiuYue = liuYue;
  }

  /**
   * 获取当前选中的流月
   */
  getCurrentSelectedLiuYue(): any {
    return this.currentSelectedLiuYue;
  }

  /**
   * 设置当前大运的流年数据缓存
   */
  setCurrentDaYunLiuNianData(data: any[]) {
    this.currentDaYunLiuNianData = data;
  }

  /**
   * 获取当前大运的流年数据缓存
   */
  getCurrentDaYunLiuNianData(): any[] {
    return this.currentDaYunLiuNianData;
  }

  /**
   * 重置所有选择状态
   */
  resetAllSelections() {
    this.selectedDaYunIndex = 0;
    this.selectedLiuNianYear = 0;
    this.currentSelectedLiuYue = null;
    this.currentDaYunLiuNianData = [];
  }

  /**
   * 重置流年和流月选择状态
   */
  resetLiuNianAndLiuYueSelections() {
    this.selectedLiuNianYear = 0;
    this.currentSelectedLiuYue = null;
  }

  /**
   * 重置流月选择状态
   */
  resetLiuYueSelection() {
    this.currentSelectedLiuYue = null;
  }

  /**
   * 扩展四柱表格到指定层级
   */
  extendBaziTableToLevel(targetLevel: 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi') {
    console.log(`🚀 extendBaziTableToLevel 开始，目标层级: ${targetLevel}`);

    if (!this.baziTable) {
      console.error('❌ 八字表格未初始化');
      return;
    }

    // 检查目标层级是否可达
    const actualTargetLevel = this.getActualTargetLevel(targetLevel);
    console.log(`🎯 实际目标层级: ${actualTargetLevel} (请求层级: ${targetLevel})`);

    // 如果已经是实际目标层级，不重复扩展
    if (this.currentExtendedLevel === actualTargetLevel) {
      console.log(`⚠️ 已扩展到${actualTargetLevel}层级，跳过重复扩展`);
      return;
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
  }

  /**
   * 获取实际可达的目标层级
   */
  private getActualTargetLevel(requestedLevel: string): 'dayun' | 'liunian' | 'liuyue' | 'liuri' | 'liushi' {
    // 检查各层级的可用性
    if (requestedLevel === 'liushi' || requestedLevel === 'liuri') {
      // 流时和流日暂不支持，降级到流月
      if (this.currentSelectedLiuYue) {
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
      } else {
        return false; // 其他层级暂不支持
      }
    });
  }

  /**
   * 获取指定层级的柱信息
   */
  private getPillarInfoForLevel(level: string): ExtendedPillarInfo | null {
    console.log(`🔍 getPillarInfoForLevel: 处理层级 ${level}`);

    switch (level) {
      case 'dayun':
        console.log(`🔍 大运层级: selectedDaYunIndex=${this.selectedDaYunIndex}`);
        return this.calculateDaYunPillar(this.selectedDaYunIndex);
      case 'liunian':
        console.log(`🔍 流年层级: selectedLiuNianYear=${this.selectedLiuNianYear}`);
        // 如果没有选择流年，返回null，不显示流年柱
        if (!this.selectedLiuNianYear || this.selectedLiuNianYear === 0) {
          console.log(`❌ 流年层级: 没有选择流年，跳过流年柱显示`);
          return null;
        }
        return this.calculateLiuNianPillar(this.selectedLiuNianYear);
      case 'liuyue':
        console.log(`🔍 流月层级: currentSelectedLiuYue=`, this.currentSelectedLiuYue);
        // 需要获取当前选中的流月数据
        return this.getCurrentLiuYuePillar();
      case 'liuri':
        console.log(`🔍 流日层级: 暂未实现`);
        // 需要获取当前选中的流日数据
        return this.getCurrentLiuRiPillar();
      case 'liushi':
        console.log(`🔍 流时层级: 暂未实现`);
        // 需要获取当前选中的流时数据
        return this.getCurrentLiuShiPillar();
      default:
        console.log(`🔍 未知层级: ${level}`);
        return null;
    }
  }

  /**
   * 计算大运扩展柱信息
   */
  private calculateDaYunPillar(daYunIndex: number): ExtendedPillarInfo | null {
    console.log(`🔍 calculateDaYunPillar: 计算大运 ${daYunIndex}`);
    console.log(`🔍 calculateDaYunPillar: 大运数据存在=${!!this.baziInfo.daYun}, 是数组=${Array.isArray(this.baziInfo.daYun)}`);

    if (!this.baziInfo.daYun || !Array.isArray(this.baziInfo.daYun) || daYunIndex >= this.baziInfo.daYun.length) {
      console.log(`❌ calculateDaYunPillar: 大运数据无效或索引超出范围`);
      return null;
    }

    console.log(`🔍 calculateDaYunPillar: 大运数组长度=${this.baziInfo.daYun.length}, 当前索引=${daYunIndex}`);

    const daYun = this.baziInfo.daYun[daYunIndex];
    const ganZhi = daYun.ganZhi || '';

    console.log(`🔍 calculateDaYunPillar: 大运[${daYunIndex}]数据:`, daYun);
    console.log(`🔍 calculateDaYunPillar: 干支=${ganZhi}, 长度=${ganZhi.length}`);

    // 如果当前大运为空（前运期间），后端应该已经计算了前运
    if (!ganZhi || ganZhi.length < 2) {
      console.log(`❌ calculateDaYunPillar: 大运${daYunIndex}为空，后端应该已经处理前运`);
      return null;
    }

    const stem = ganZhi[0];
    const branch = ganZhi[1];
    const dayStem = this.baziInfo.dayStem || '';

    // 检查是否为前运（通过isQianYun标记）
    const isQianYun = (daYun as any).isQianYun === true;
    const displayName = isQianYun ? '前运' : '大运';

    return {
      type: 'dayun',
      name: displayName,
      stem,
      branch,
      ganZhi,
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: daYun.shenSha || [],
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 计算流年扩展柱信息
   */
  private calculateLiuNianPillar(year: number): ExtendedPillarInfo | null {
    console.log(`🔍 calculateLiuNianPillar: 计算流年 ${year}`);

    // 查找流年数据
    const liuNian = this.findLiuNianByYear(year);
    console.log(`🔍 calculateLiuNianPillar: 找到流年数据`, liuNian);

    if (!liuNian || !liuNian.ganZhi) {
      console.log(`❌ calculateLiuNianPillar: 流年数据无效，liuNian=${!!liuNian}, ganZhi=${liuNian?.ganZhi}`);
      return null;
    }

    const ganZhi = liuNian.ganZhi;
    if (ganZhi.length < 2) {
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
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: liuNian.shenSha || [],
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 根据年份查找流年数据
   */
  private findLiuNianByYear(year: number): any {
    console.log(`🔍 findLiuNianByYear: 查找年份 ${year}`);
    console.log(`🔍 findLiuNianByYear: baziInfo.liuNian 存在=${!!this.baziInfo.liuNian}`);
    console.log(`🔍 findLiuNianByYear: currentDaYunLiuNianData 长度=${this.currentDaYunLiuNianData.length}`);

    // 优先从当前大运的流年数据缓存中查找
    if (this.currentDaYunLiuNianData.length > 0) {
      console.log(`🔍 findLiuNianByYear: 从当前大运流年缓存中查找`);
      
      for (let i = 0; i < this.currentDaYunLiuNianData.length; i++) {
        const liuNian = this.currentDaYunLiuNianData[i];
        console.log(`🔍 findLiuNianByYear: 检查缓存流年[${i}]: year=${liuNian.year}, ganZhi=${liuNian.ganZhi}`);

        if (liuNian.year === year) {
          console.log(`✅ findLiuNianByYear: 从缓存中找到匹配的流年数据`, liuNian);
          return liuNian;
        }
      }
      
      console.log(`❌ findLiuNianByYear: 缓存中未找到年份 ${year} 的流年数据`);
    }

    // 从原始流年数据中查找
    if (this.baziInfo.liuNian) {
      console.log(`🔍 findLiuNianByYear: 从原始流年数据中查找，长度=${this.baziInfo.liuNian.length}`);

      for (let i = 0; i < this.baziInfo.liuNian.length; i++) {
        const liuNian = this.baziInfo.liuNian[i];
        console.log(`🔍 findLiuNianByYear: 检查原始流年[${i}]: year=${liuNian.year}, ganZhi=${liuNian.ganZhi}`);

        if (liuNian.year === year) {
          console.log(`✅ findLiuNianByYear: 从原始数据中找到匹配的流年数据`, liuNian);
          return liuNian;
        }
      }

      console.log(`❌ findLiuNianByYear: 原始数据中未找到年份 ${year} 的流年数据`);
    } else {
      console.log(`❌ findLiuNianByYear: baziInfo.liuNian 不存在`);
    }

    return null;
  }

  /**
   * 获取当前选中的流月柱信息
   */
  private getCurrentLiuYuePillar(): ExtendedPillarInfo | null {
    console.log(`🗓️ getCurrentLiuYuePillar: 开始获取流月柱信息`);

    if (!this.currentSelectedLiuYue) {
      console.log(`❌ getCurrentLiuYuePillar: 没有选中的流月`);
      return null;
    }

    console.log(`🗓️ getCurrentLiuYuePillar: 使用当前选中流月`, this.currentSelectedLiuYue);

    const ganZhi = this.currentSelectedLiuYue.ganZhi;
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
      hideGan: BaziCalculator.getHideGan(branch),
      shiShenGan: ShiShenCalculator.getShiShen(dayStem, stem),
      shiShenZhi: ShiShenCalculator.getHiddenShiShen(dayStem, branch),
      diShi: this.calculateDiShiForPillar(dayStem, branch),
      naYin: BaziCalculator.getNaYin(ganZhi),
      xunKong: BaziCalculator.calculateXunKong(stem, branch),
      shengXiao: BaziUtils.getShengXiao(branch),
      shenSha: this.currentSelectedLiuYue.shenSha || [],
      wuXing: BaziUtils.getStemWuXing(stem)
    };
  }

  /**
   * 获取当前选中的流日柱信息（暂未实现）
   */
  private getCurrentLiuRiPillar(): ExtendedPillarInfo | null {
    console.log(`📅 getCurrentLiuRiPillar: 流日功能暂未实现`);
    return null;
  }

  /**
   * 获取当前选中的流时柱信息（暂未实现）
   */
  private getCurrentLiuShiPillar(): ExtendedPillarInfo | null {
    console.log(`⏰ getCurrentLiuShiPillar: 流时功能暂未实现`);
    return null;
  }

  /**
   * 计算地势信息
   */
  private calculateDiShiForPillar(dayStem: string, branch: string): string {
    // 使用BaziCalculator计算地势
    return BaziCalculator.getDiShi(dayStem, branch);
  }

  /**
   * 清除所有扩展列
   */
  private clearAllExtendedColumns(): void {
    if (!this.baziTable) {
      return;
    }

    console.log(`🧹 clearAllExtendedColumns: 开始清除扩展列`);

    // 清除表头中的扩展列
    const headerRow = this.baziTable.querySelector('thead tr');
    if (headerRow) {
      const extendedHeaders = headerRow.querySelectorAll('.bazi-extended-column');
      extendedHeaders.forEach(header => header.remove());
    }

    // 清除表体中的扩展列
    const bodyRows = this.baziTable.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const extendedCells = row.querySelectorAll('.bazi-extended-column');
      extendedCells.forEach(cell => cell.remove());
    });

    // 清空扩展柱数组
    this.extendedPillars = [];

    console.log(`✅ clearAllExtendedColumns: 扩展列清除完成`);
  }

  /**
   * 添加扩展列
   */
  private addExtendedColumn(pillarInfo: ExtendedPillarInfo): void {
    if (!this.baziTable) {
      console.error(`❌ addExtendedColumn: 八字表格未初始化`);
      return;
    }

    console.log(`➕ addExtendedColumn: 添加扩展列`, pillarInfo.name, pillarInfo.ganZhi);

    // 添加到扩展柱数组
    this.extendedPillars.push(pillarInfo);

    // 添加表头
    const headerRow = this.baziTable.querySelector('thead tr');
    if (headerRow) {
      const extendedHeader = headerRow.createEl('th', {
        text: pillarInfo.name,
        cls: 'bazi-extended-column'
      });
    }

    // 获取所有表体行
    const rows = this.baziTable.querySelectorAll('tbody tr');

    // 天干行
    if (rows[0]) {
      const stemCell = rows[0].createEl('td', {
        text: pillarInfo.stem,
        cls: 'bazi-extended-column'
      });
      this.applyStemWuXingColor(stemCell, pillarInfo.stem);
    }

    // 地支行
    if (rows[1]) {
      const branchCell = rows[1].createEl('td', {
        text: pillarInfo.branch,
        cls: 'bazi-extended-column'
      });
      this.applyBranchWuXingColor(branchCell, pillarInfo.branch);
    }

    // 藏干行
    if (rows[2]) {
      const hideGanCell = rows[2].createEl('td', { cls: 'bazi-extended-column' });
      this.createColoredHideGan(hideGanCell, pillarInfo.hideGan);
    }

    // 十神行
    if (rows[3]) {
      const shiShenCell = rows[3].createEl('td', { cls: 'bazi-extended-column' });

      // 天干十神
      if (pillarInfo.shiShenGan) {
        shiShenCell.createSpan({
          text: pillarInfo.shiShenGan,
          cls: 'shishen-tag-small'
        });
      }

      // 换行
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
      const diShiCell = rows[4].createEl('td', { cls: 'bazi-extended-column' });
      if (pillarInfo.diShi) {
        diShiCell.createSpan({
          text: pillarInfo.diShi,
          cls: 'dishi-tag-small'
        });
      }
    }

    // 纳音行
    if (rows[5]) {
      const naYinCell = rows[5].createEl('td', { cls: 'bazi-extended-column' });
      if (pillarInfo.naYin) {
        const wuXing = this.extractWuXingFromNaYin(pillarInfo.naYin);
        const naYinSpan = naYinCell.createSpan({ text: pillarInfo.naYin });
        this.setWuXingColorDirectly(naYinSpan, wuXing);
      }
    }

    // 神煞行（如果存在）
    const shenShaRowIndex = this.findShenShaRowIndex();
    if (shenShaRowIndex >= 0 && rows[shenShaRowIndex]) {
      const shenShaCell = rows[shenShaRowIndex].createEl('td', { cls: 'bazi-extended-column' });

      if (pillarInfo.shenSha && pillarInfo.shenSha.length > 0) {
        const shenShaList = shenShaCell.createDiv({ cls: 'bazi-shensha-list' });
        pillarInfo.shenSha.forEach((shenSha: string) => {
          const shenShaEl = shenShaList.createEl('span', {
            text: shenSha,
            cls: 'bazi-shensha',
            attr: { 'title': shenSha }
          });
        });
      } else {
        shenShaCell.textContent = '无';
      }
    }

    console.log(`✅ addExtendedColumn: 扩展列添加完成`);
  }

  /**
   * 查找神煞行的索引
   */
  private findShenShaRowIndex(): number {
    if (!this.baziTable) return -1;

    const tbody = this.baziTable.querySelector('tbody');
    if (!tbody) return -1;

    const rows = tbody.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
      const labelCell = rows[i].querySelector('.bazi-table-label');
      if (labelCell && labelCell.textContent === '神煞') {
        return i;
      }
    }
    return -1;
  }

  // 样式相关方法 - 这些应该从StyleManager获取，暂时简化实现
  private applyStemWuXingColor(element: HTMLElement, stem: string) {
    // TODO: 使用StyleManager
    console.log('TODO: 应用天干五行颜色', stem);
  }

  private applyBranchWuXingColor(element: HTMLElement, branch: string) {
    // TODO: 使用StyleManager
    console.log('TODO: 应用地支五行颜色', branch);
  }

  private createColoredHideGan(container: HTMLElement, hideGanText: string) {
    // TODO: 使用StyleManager
    container.textContent = hideGanText;
  }

  private setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    // TODO: 使用StyleManager
    console.log('TODO: 设置五行颜色', wuXing);
  }

  private extractWuXingFromNaYin(naYin: string): string {
    // TODO: 使用StyleManager
    return '';
  }
}
