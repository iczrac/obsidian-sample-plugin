import { BaziInfo } from '../../../types/BaziInfo';
import { ModalManager } from './ModalManager';
import { StyleAndUtilsManager } from './StyleAndUtilsManager';
import { ExtendedColumnManager } from './ExtendedColumnManager';
import { HorizontalSelectorManager } from './HorizontalSelectorManager';
import { EventManager } from '../EventManager';
import { ColorSchemeService } from '../../../services/bazi/ColorSchemeService';
import { BaziCalculator } from '../../../services/bazi/BaziCalculator';

/**
 * 交互管理器
 * 专门处理八字视图的用户交互逻辑，整合各种事件处理
 * 避免与通用EventManager重复，专注于八字相关的交互
 */
export class InteractionManager {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private modalManager: ModalManager;
  private styleAndUtilsManager: StyleAndUtilsManager;
  private extendedColumnManager: ExtendedColumnManager;
  private horizontalSelectorManager: HorizontalSelectorManager;
  private eventManager: EventManager;

  // 交互状态
  private isInitialized = false;
  private activeInteractions = new Set<string>();

  // 全局地势模式管理
  private changShengMode: number = 0;
  private readonly CHANG_SHENG_MODES = [
    { key: 'diShi', name: '地势', description: '日干在各地支的十二长生状态' },
    { key: 'ziZuo', name: '自坐', description: '各柱天干相对于各柱地支的十二长生状态' },
    { key: 'yueLing', name: '月令', description: '各柱天干相对于月令的十二长生状态' }
  ];

  constructor(
    container: HTMLElement,
    baziInfo: BaziInfo,
    modalManager: ModalManager,
    styleAndUtilsManager: StyleAndUtilsManager,
    extendedColumnManager: ExtendedColumnManager,
    horizontalSelectorManager: HorizontalSelectorManager
  ) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.modalManager = modalManager;
    this.styleAndUtilsManager = styleAndUtilsManager;
    this.extendedColumnManager = extendedColumnManager;
    this.horizontalSelectorManager = horizontalSelectorManager;
    this.eventManager = new EventManager();
  }

  /**
   * 初始化所有交互事件
   */
  initialize() {
    if (this.isInitialized) {
      console.warn('InteractionManager 已经初始化过了');
      return;
    }

    this.setupClickInteractions();
    this.setupHoverInteractions();
    this.setupKeyboardInteractions();
    this.setupCustomEvents();

    this.isInitialized = true;
    console.log('✅ InteractionManager 初始化完成');
  }

  /**
   * 设置点击交互
   */
  private setupClickInteractions() {
    // 使用事件委托，在容器上监听所有点击事件
    this.eventManager.addElementListener(this.container, 'click', (event: Event) => {
      const target = event.target as HTMLElement;
      const mouseEvent = event as MouseEvent;

      // 神煞标签点击
      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaClick(target, mouseEvent);
        return;
      }

      // 五行强度点击
      if (target.classList.contains('wuxing-strength-clickable')) {
        this.handleWuXingStrengthClick(target, mouseEvent);
        return;
      }

      // 日主旺衰点击
      if (target.classList.contains('rizhu-clickable')) {
        this.handleRiZhuClick(target, mouseEvent);
        return;
      }

      // 十二长生模式切换
      if (target.classList.contains('bazi-changsheng-label')) {
        this.handleChangShengModeToggle();
        return;
      }

      // 样式切换按钮
      if (target.classList.contains('bazi-style-switch-btn')) {
        this.handleStyleSwitch();
        return;
      }

      // 设置按钮
      if (target.classList.contains('bazi-settings-btn')) {
        this.handleSettingsClick(mouseEvent);
        return;
      }

      // 大运选择
      if (target.classList.contains('bazi-dayun-cell') || target.closest('.bazi-dayun-cell')) {
        this.handleDaYunCellClick(target, mouseEvent);
        return;
      }

      // 流年选择
      if (target.classList.contains('bazi-liunian-row') || target.closest('.bazi-liunian-row')) {
        this.handleLiuNianRowClick(target, mouseEvent);
        return;
      }

      // 流月选择
      if (target.classList.contains('bazi-liuyue-row') || target.closest('.bazi-liuyue-row')) {
        this.handleLiuYueRowClick(target, mouseEvent);
        return;
      }
    });

    this.activeInteractions.add('click');
    console.log('✅ 点击交互设置完成');
  }

  /**
   * 设置悬停交互
   */
  private setupHoverInteractions() {
    // 神煞标签悬停
    this.eventManager.addElementListener(this.container, 'mouseenter', (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaHover(target, true);
      }
    });

    this.eventManager.addElementListener(this.container, 'mouseleave', (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains('shensha-tag')) {
        this.handleShenShaHover(target, false);
      }
    });

    this.activeInteractions.add('hover');
    console.log('✅ 悬停交互设置完成');
  }

  /**
   * 设置键盘交互
   */
  private setupKeyboardInteractions() {
    // 直接使用 document.addEventListener 而不是通过 EventManager
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // ESC 键关闭模态框
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }

      // 数字键快速切换样式
      if (event.key >= '1' && event.key <= '3' && event.ctrlKey) {
        this.handleStyleQuickSwitch(event.key);
        event.preventDefault();
      }
    });

    this.activeInteractions.add('keyboard');
    console.log('✅ 键盘交互设置完成');
  }

  /**
   * 设置自定义事件
   */
  private setupCustomEvents() {
    // 监听扩展列变化事件
    this.eventManager.on('extended-column:change', (data: any) => {
      this.handleExtendedColumnChange(data);
    });

    // 监听数据更新事件
    this.eventManager.on('data:update', (data: any) => {
      this.handleDataUpdate(data);
    });

    this.activeInteractions.add('custom');
    console.log('✅ 自定义事件设置完成');
  }

  /**
   * 处理神煞点击
   */
  private handleShenShaClick(target: HTMLElement, event: MouseEvent) {
    const shenSha = target.textContent?.trim();
    if (shenSha) {
      console.log(`🔍 神煞点击: ${shenSha}`);
      this.modalManager.showShenShaModal(shenSha, event);
    }
  }

  /**
   * 处理五行强度点击
   */
  private handleWuXingStrengthClick(target: HTMLElement, event: MouseEvent) {
    const wuXing = target.getAttribute('data-wuxing');
    const strength = target.getAttribute('data-strength');
    
    if (wuXing && strength) {
      console.log(`🔍 五行强度点击: ${wuXing} (${strength})`);
      this.modalManager.showWuXingModal(wuXing, parseFloat(strength), event);
    }
  }

  /**
   * 处理日主旺衰点击
   */
  private handleRiZhuClick(target: HTMLElement, event: MouseEvent) {
    const riZhu = target.getAttribute('data-rizhu');
    const wuXing = target.getAttribute('data-wuxing');
    
    if (riZhu && wuXing) {
      console.log(`🔍 日主旺衰点击: ${riZhu} (${wuXing})`);
      // 这里可以显示日主旺衰的详细解释
      // 暂时使用神煞模态框，后续可以创建专门的日主模态框
      this.modalManager.showShenShaModal(`日主${riZhu}`, event);
    }
  }

  /**
   * 处理十二长生模式切换（全局）
   */
  private handleChangShengModeToggle() {
    // 切换到下一个模式
    this.changShengMode = (this.changShengMode + 1) % this.CHANG_SHENG_MODES.length;
    const currentMode = this.CHANG_SHENG_MODES[this.changShengMode];

    console.log(`🔄 全局地势模式切换到: ${currentMode.name} (${currentMode.description})`);

    // 通知所有相关组件更新
    this.updateAllChangShengDisplays();

    // 发送全局事件
    this.eventManager.emit('changsheng:toggle', {
      mode: this.changShengMode,
      modeInfo: currentMode
    });
  }

  /**
   * 更新所有组件的地势显示
   */
  private updateAllChangShengDisplays() {
    const currentMode = this.CHANG_SHENG_MODES[this.changShengMode];

    // 更新四柱表格的地势行标签
    this.updateBaziTableChangShengLabel(currentMode);

    // 更新四柱表格的地势显示
    this.updateBaziTableChangShengCells(currentMode);

    // 更新扩展列的地势显示
    this.updateExtendedColumnsChangSheng(currentMode);

    // 更新大运表格的地势显示
    this.updateDaYunTableChangSheng(currentMode);

    // 更新其他表格的地势显示
    this.updateOtherTablesChangSheng(currentMode);
  }

  /**
   * 更新所有地势行标签
   */
  private updateBaziTableChangShengLabel(currentMode: any) {
    // 更新所有地势标签，不仅仅是第一个
    const diShiLabels = this.container.querySelectorAll('.bazi-changsheng-label');
    diShiLabels.forEach(label => {
      label.textContent = currentMode.name;
      label.setAttribute('title', currentMode.description + ' (点击切换)');
    });
  }

  /**
   * 更新四柱表格的地势单元格
   */
  private updateBaziTableChangShengCells(currentMode: any) {
    const diShiRow = this.container.querySelector('.bazi-dishi-row');
    if (!diShiRow) return;

    // 更新年柱
    this.updatePillarChangShengCell(diShiRow, 2, 'year', currentMode);
    // 更新月柱
    this.updatePillarChangShengCell(diShiRow, 3, 'month', currentMode);
    // 更新日柱
    this.updatePillarChangShengCell(diShiRow, 4, 'day', currentMode);
    // 更新时柱
    this.updatePillarChangShengCell(diShiRow, 5, 'time', currentMode);
  }

  /**
   * 更新单个柱的地势单元格
   */
  private updatePillarChangShengCell(diShiRow: Element, columnIndex: number, pillar: string, currentMode: any) {
    const cell = diShiRow.querySelector(`td:nth-child(${columnIndex})`);
    if (!cell) return;

    const value = this.calculateChangShengValue(pillar, currentMode.key);

    // 清空原内容
    cell.innerHTML = '';

    // 添加新内容
    if (value) {
      const span = cell.createEl('span', {
        text: value,
        cls: 'dishi-tag-small'
      });
      // 应用地势颜色
      this.applyDiShiColor(span, value);
    }
  }

  /**
   * 计算地势值
   */
  private calculateChangShengValue(pillar: string, mode: string): string {
    let stem = '';
    let branch = '';

    // 获取对应柱的干支
    switch (pillar) {
      case 'year':
        stem = this.baziInfo.yearStem || '';
        branch = this.baziInfo.yearBranch || '';
        break;
      case 'month':
        stem = this.baziInfo.monthStem || '';
        branch = this.baziInfo.monthBranch || '';
        break;
      case 'day':
        stem = this.baziInfo.dayStem || '';
        branch = this.baziInfo.dayBranch || '';
        break;
      case 'time':
        stem = this.baziInfo.timeStem || '';
        branch = this.baziInfo.timeBranch || '';
        break;
    }

    if (!stem || !branch) return '';

    // 根据模式计算
    switch (mode) {
      case 'diShi':
        // 地势：日干在各地支的十二长生状态
        return this.baziInfo[`${pillar}DiShi`] || '';
      case 'ziZuo':
        // 自坐：各柱天干相对于各柱地支的十二长生状态
        return this.calculateDiShi(stem, branch);
      case 'yueLing': {
        // 月令：各柱天干相对于月令的十二长生状态
        const monthBranch = this.baziInfo.monthBranch || '';
        return monthBranch ? this.calculateDiShi(stem, monthBranch) : '';
      }
      default:
        return '';
    }
  }

  /**
   * 计算地势（使用BaziCalculator）
   */
  private calculateDiShi(stem: string, branch: string): string {
    return BaziCalculator.getDiShi(stem, branch);
  }

  /**
   * 更新扩展列的地势显示
   */
  private updateExtendedColumnsChangSheng(currentMode: any) {
    // 通知扩展列管理器更新地势模式
    if (this.extendedColumnManager && typeof this.extendedColumnManager.updateChangShengMode === 'function') {
      this.extendedColumnManager.updateChangShengMode(this.changShengMode, currentMode);
    }
  }

  /**
   * 更新大运表格的地势显示
   */
  private updateDaYunTableChangSheng(currentMode: any) {
    // 查找大运表格的地势行
    const daYunTable = this.container.querySelector('.bazi-dayun-table');
    if (daYunTable) {
      const diShiRow = daYunTable.querySelector('.bazi-dayun-dishi-row');
      if (diShiRow) {
        // 更新大运地势行的标签
        const headerCell = diShiRow.querySelector('th');
        if (headerCell) {
          headerCell.textContent = currentMode.name;
          headerCell.setAttribute('title', currentMode.description + ' (点击切换)');
        }

        // 重新计算大运地势值
        this.recalculateDaYunChangSheng(diShiRow, currentMode);
      }
    }
  }

  /**
   * 更新其他表格的地势显示
   */
  private updateOtherTablesChangSheng(currentMode: any) {
    // 更新流年表格
    this.updateLiuNianTableChangSheng(currentMode);

    // 更新流月表格
    this.updateLiuYueTableChangSheng(currentMode);

    // 更新流日表格
    this.updateLiuRiTableChangSheng(currentMode);

    // 更新流时表格
    this.updateLiuShiTableChangSheng(currentMode);
  }

  /**
   * 重新计算大运地势
   */
  private recalculateDaYunChangSheng(diShiRow: Element, currentMode: any) {
    const cells = diShiRow.querySelectorAll('td');

    // 获取大运数据
    const daYunData = this.baziInfo.daYun;
    if (!daYunData || !Array.isArray(daYunData)) return;

    cells.forEach((cell, index) => {
      if (index === 0) return; // 跳过标题列

      const daYunIndex = index - 1; // 调整索引
      if (daYunIndex >= daYunData.length) return;

      const daYun = daYunData[daYunIndex];
      if (!daYun || !daYun.ganZhi) return;

      const stem = daYun.ganZhi[0]; // 天干
      const branch = daYun.ganZhi[1]; // 地支

      // 根据模式计算地势值
      let diShiValue = '';
      switch (currentMode.key) {
        case 'diShi':
          // 地势：日干在大运地支的十二长生状态
          diShiValue = this.calculateDiShi(this.baziInfo.dayStem || '', branch);
          break;
        case 'ziZuo':
          // 自坐：大运天干相对于大运地支的十二长生状态
          diShiValue = this.calculateDiShi(stem, branch);
          break;
        case 'yueLing': {
          // 月令：大运天干相对于月令的十二长生状态
          const monthBranch = this.baziInfo.monthBranch || '';
          diShiValue = monthBranch ? this.calculateDiShi(stem, monthBranch) : '';
          break;
        }
      }

      // 更新单元格内容
      cell.innerHTML = '';
      if (diShiValue) {
        const span = cell.createEl('span', {
          text: diShiValue,
          cls: 'dishi-tag-small'
        });
        this.applyDiShiColor(span, diShiValue);
      }
    });
  }

  /**
   * 更新流年表格地势
   */
  private updateLiuNianTableChangSheng(currentMode: any) {
    // 查找流年信息管理器中的地势行
    const liuNianInfoContainer = this.container.querySelector('.bazi-liunian-info-container');
    if (liuNianInfoContainer) {
      const diShiRow = liuNianInfoContainer.querySelector('.bazi-liunian-dishi-row');
      if (diShiRow) {
        // 更新标签
        const headerCell = diShiRow.querySelector('th');
        if (headerCell) {
          headerCell.textContent = currentMode.name;
          headerCell.setAttribute('title', currentMode.description + ' (点击切换)');
        }

        // 重新计算流年地势值
        this.recalculateLiuNianChangSheng(diShiRow, currentMode);
      }
    }
  }

  /**
   * 重新计算流年地势
   */
  private recalculateLiuNianChangSheng(diShiRow: Element, currentMode: any) {
    const cells = diShiRow.querySelectorAll('td');

    cells.forEach((cell, index) => {
      // 获取流年数据（从cell的data属性或其他方式）
      const yearAttr = cell.getAttribute('data-year');
      if (!yearAttr) return;

      const year = parseInt(yearAttr);
      if (isNaN(year)) return;

      // 计算年份干支
      const yearGanZhi = this.calculateYearGanZhi(year);
      if (!yearGanZhi || yearGanZhi.length < 2) return;

      const stem = yearGanZhi[0]; // 天干
      const branch = yearGanZhi[1]; // 地支

      // 根据模式计算地势值
      let diShiValue = '';
      switch (currentMode.key) {
        case 'diShi':
          // 地势：日干在流年地支的十二长生状态
          diShiValue = this.calculateDiShi(this.baziInfo.dayStem || '', branch);
          break;
        case 'ziZuo':
          // 自坐：流年天干相对于流年地支的十二长生状态
          diShiValue = this.calculateDiShi(stem, branch);
          break;
        case 'yueLing': {
          // 月令：流年天干相对于月令的十二长生状态
          const monthBranch = this.baziInfo.monthBranch || '';
          diShiValue = monthBranch ? this.calculateDiShi(stem, monthBranch) : '';
          break;
        }
      }

      // 更新单元格内容
      cell.innerHTML = '';
      if (diShiValue) {
        const span = cell.createEl('span', {
          text: diShiValue,
          cls: 'dishi-tag-small'
        });
        this.applyDiShiColor(span, diShiValue);
      }
    });
  }

  /**
   * 更新流月表格地势
   */
  private updateLiuYueTableChangSheng(currentMode: any) {
    const liuYueInfoContainer = this.container.querySelector('.bazi-liuyue-info-container');
    if (liuYueInfoContainer) {
      const diShiRow = liuYueInfoContainer.querySelector('.bazi-liuyue-dishi-row');
      if (diShiRow) {
        // 更新标签
        const headerCell = diShiRow.querySelector('th');
        if (headerCell) {
          headerCell.textContent = currentMode.name;
          headerCell.setAttribute('title', currentMode.description + ' (点击切换)');
        }

        // 重新计算流月地势值
        this.recalculateLiuYueChangSheng(diShiRow, currentMode);
      }
    }
  }

  /**
   * 更新流日表格地势
   */
  private updateLiuRiTableChangSheng(currentMode: any) {
    const liuRiInfoContainer = this.container.querySelector('.bazi-liuri-info-container');
    if (liuRiInfoContainer) {
      const diShiRow = liuRiInfoContainer.querySelector('.bazi-liuri-dishi-row');
      if (diShiRow) {
        // 更新标签
        const headerCell = diShiRow.querySelector('th');
        if (headerCell) {
          headerCell.textContent = currentMode.name;
          headerCell.setAttribute('title', currentMode.description + ' (点击切换)');
        }

        // 重新计算流日地势值
        this.recalculateGenericChangSheng(diShiRow, currentMode, 'liuri');
      }
    }
  }

  /**
   * 更新流时表格地势
   */
  private updateLiuShiTableChangSheng(currentMode: any) {
    const liuShiInfoContainer = this.container.querySelector('.bazi-liushi-info-container');
    if (liuShiInfoContainer) {
      const diShiRow = liuShiInfoContainer.querySelector('.bazi-liushi-dishi-row');
      if (diShiRow) {
        // 更新标签
        const headerCell = diShiRow.querySelector('th');
        if (headerCell) {
          headerCell.textContent = currentMode.name;
          headerCell.setAttribute('title', currentMode.description + ' (点击切换)');
        }

        // 重新计算流时地势值
        this.recalculateGenericChangSheng(diShiRow, currentMode, 'liushi');
      }
    }
  }

  /**
   * 通用的地势重新计算方法
   */
  private recalculateGenericChangSheng(diShiRow: Element, currentMode: any, type: string) {
    const cells = diShiRow.querySelectorAll('td');

    cells.forEach((cell, index) => {
      // 简化处理：使用基本的干支计算
      // 实际应该从对应的数据源获取准确的干支信息
      let stem = '甲';
      let branch = '子';

      // 根据类型生成不同的干支
      switch (type) {
        case 'liuri': {
          // 流日：简化计算日柱干支
          const dayGanZhi = this.calculateDayGanZhi(index + 1);
          stem = dayGanZhi[0];
          branch = dayGanZhi[1];
          break;
        }
        case 'liushi': {
          // 流时：简化计算时柱干支
          const timeGanZhi = this.calculateTimeGanZhi(index);
          stem = timeGanZhi[0];
          branch = timeGanZhi[1];
          break;
        }
      }

      // 根据模式计算地势值
      let diShiValue = '';
      switch (currentMode.key) {
        case 'diShi':
          diShiValue = this.calculateDiShi(this.baziInfo.dayStem || '', branch);
          break;
        case 'ziZuo':
          diShiValue = this.calculateDiShi(stem, branch);
          break;
        case 'yueLing': {
          const monthBranch = this.baziInfo.monthBranch || '';
          diShiValue = monthBranch ? this.calculateDiShi(stem, monthBranch) : '';
          break;
        }
      }

      // 更新单元格内容
      cell.innerHTML = '';
      if (diShiValue) {
        const span = cell.createEl('span', {
          text: diShiValue,
          cls: 'dishi-tag-small'
        });
        this.applyDiShiColor(span, diShiValue);
      }
    });
  }

  /**
   * 计算日柱干支（简化版本）
   */
  private calculateDayGanZhi(day: number): string {
    const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const ganIndex = (day - 1) % 10;
    const zhiIndex = (day - 1) % 12;

    return gans[ganIndex] + zhis[zhiIndex];
  }

  /**
   * 计算时柱干支（简化版本）
   */
  private calculateTimeGanZhi(timeIndex: number): string {
    const zhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

    const branch = zhis[timeIndex % 12];
    const gan = gans[timeIndex % 10]; // 简化计算

    return gan + branch;
  }

  /**
   * 应用地势颜色
   */
  private applyDiShiColor(element: HTMLElement, diShi: string) {
    ColorSchemeService.setDiShiColor(element, diShi);
  }

  /**
   * 获取当前地势模式
   */
  getCurrentChangShengMode(): number {
    return this.changShengMode;
  }

  /**
   * 获取当前地势模式信息
   */
  getCurrentChangShengModeInfo() {
    return this.CHANG_SHENG_MODES[this.changShengMode];
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
   * 重新计算流月地势
   */
  private recalculateLiuYueChangSheng(diShiRow: Element, currentMode: any) {
    const cells = diShiRow.querySelectorAll('td');

    cells.forEach((cell, index) => {
      // 流月地势计算需要获取流月的干支数据
      // 这里简化处理，实际应该从流月数据中获取
      const monthGanZhi = this.calculateMonthGanZhi(index + 1); // 简化计算
      if (!monthGanZhi || monthGanZhi.length < 2) return;

      const stem = monthGanZhi[0]; // 天干
      const branch = monthGanZhi[1]; // 地支

      // 根据模式计算地势值
      let diShiValue = '';
      switch (currentMode.key) {
        case 'diShi':
          diShiValue = this.calculateDiShi(this.baziInfo.dayStem || '', branch);
          break;
        case 'ziZuo':
          diShiValue = this.calculateDiShi(stem, branch);
          break;
        case 'yueLing': {
          const monthBranch = this.baziInfo.monthBranch || '';
          diShiValue = monthBranch ? this.calculateDiShi(stem, monthBranch) : '';
          break;
        }
      }

      // 更新单元格内容
      cell.innerHTML = '';
      if (diShiValue) {
        const span = cell.createEl('span', {
          text: diShiValue,
          cls: 'dishi-tag-small'
        });
        this.applyDiShiColor(span, diShiValue);
      }
    });
  }

  /**
   * 计算月份干支（简化版本）
   */
  private calculateMonthGanZhi(month: number): string {
    // 这里应该根据年份和月份计算准确的月柱干支
    // 简化处理，返回基本的月支
    const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    const branch = monthBranches[(month - 1) % 12];
    return '甲' + branch; // 简化，实际应该根据年干计算月干
  }

  /**
   * 处理样式切换
   */
  private handleStyleSwitch() {
    console.log('🎨 样式切换');
    this.styleAndUtilsManager.switchStyle();
    this.eventManager.emit('style:switch', {});
  }

  /**
   * 处理设置点击
   */
  private handleSettingsClick(event: MouseEvent) {
    console.log('⚙️ 设置点击');
    this.modalManager.showSettingsModal((settings: any) => {
      this.handleSettingsUpdate(settings);
    });
  }

  /**
   * 处理大运单元格点击
   */
  private handleDaYunCellClick(target: HTMLElement, event: MouseEvent) {
    const cell = target.closest('.bazi-dayun-cell') as HTMLElement;
    if (!cell) return;

    const index = parseInt(cell.getAttribute('data-index') || '0');
    console.log(`🎯 大运选择: ${index}`);
    
    this.eventManager.emit('dayun:select', index);
  }

  /**
   * 处理流年行点击
   */
  private handleLiuNianRowClick(target: HTMLElement, event: MouseEvent) {
    const row = target.closest('.bazi-liunian-row') as HTMLElement;
    if (!row) return;

    const year = parseInt(row.getAttribute('data-year') || '0');
    console.log(`🎯 流年选择: ${year}`);
    
    this.eventManager.emit('liunian:select', year);
  }

  /**
   * 处理流月行点击
   */
  private handleLiuYueRowClick(target: HTMLElement, event: MouseEvent) {
    const row = target.closest('.bazi-liuyue-row') as HTMLElement;
    if (!row) return;

    const month = parseInt(row.getAttribute('data-month') || '0');
    console.log(`🎯 流月选择: ${month}`);
    
    this.eventManager.emit('liuyue:select', { month });
  }

  /**
   * 处理神煞悬停
   */
  private handleShenShaHover(target: HTMLElement, isEnter: boolean) {
    if (isEnter) {
      target.style.transform = 'scale(1.05)';
      target.style.transition = 'transform 0.2s ease';
    } else {
      target.style.transform = '';
    }
  }

  /**
   * 处理ESC键
   */
  private handleEscapeKey() {
    // 关闭所有模态框
    const modals = document.querySelectorAll('.bazi-modal');
    modals.forEach(modal => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
  }

  /**
   * 处理样式快速切换
   */
  private handleStyleQuickSwitch(styleKey: string) {
    console.log(`🎨 快速切换到样式: ${styleKey}`);
    // 这里可以直接切换到指定样式
    this.eventManager.emit('style:quick-switch', styleKey);
  }

  /**
   * 处理扩展列变化
   */
  private handleExtendedColumnChange(data: any) {
    console.log('📊 扩展列变化:', data);
    // 可以在这里处理扩展列变化的副作用
  }

  /**
   * 处理数据更新
   */
  private handleDataUpdate(data: any) {
    console.log('📊 数据更新:', data);
    // 可以在这里处理数据更新的副作用
  }

  /**
   * 处理设置更新
   */
  private handleSettingsUpdate(settings: any) {
    console.log('⚙️ 设置更新:', settings);
    this.eventManager.emit('settings:update', settings);
  }

  /**
   * 获取事件管理器（供外部使用）
   */
  getEventManager(): EventManager {
    return this.eventManager;
  }

  /**
   * 清理所有事件监听器
   */
  cleanup() {
    this.eventManager.cleanup();
    this.activeInteractions.clear();
    this.isInitialized = false;
    console.log('✅ InteractionManager 清理完成');
  }

  /**
   * 获取活动的交互类型
   */
  getActiveInteractions(): string[] {
    return Array.from(this.activeInteractions);
  }
}
