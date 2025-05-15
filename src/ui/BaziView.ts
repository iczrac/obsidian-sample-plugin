import { BaziInfo } from 'src/services/BaziService';

/**
 * 八字命盘视图组件
 * 用于在笔记中渲染交互式八字命盘
 */
export class BaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private onSettingsClick: () => void;
  private id: string;

  /**
   * 创建八字命盘视图
   * @param container 容器元素
   * @param baziInfo 八字信息
   * @param onSettingsClick 设置按钮点击回调
   */
  constructor(container: HTMLElement, baziInfo: BaziInfo, onSettingsClick: () => void) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.onSettingsClick = onSettingsClick;
    this.id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
    
    this.render();
  }

  /**
   * 渲染八字命盘
   */
  private render() {
    // 清空容器
    this.container.empty();
    
    // 添加类名
    this.container.addClass('bazi-view-container');
    this.container.setAttribute('id', this.id);
    
    // 创建命盘头部
    this.createHeader();
    
    // 创建基本信息区域
    this.createBasicInfo();
    
    // 创建八字表格
    this.createBaziTable();
    
    // 创建五行分析
    this.createWuXingAnalysis();
    
    // 创建其他信息
    this.createOtherInfo();
  }

  /**
   * 创建命盘头部
   */
  private createHeader() {
    const header = this.container.createDiv({ cls: 'bazi-view-header' });
    
    // 标题
    header.createEl('h3', { text: '八字命盘', cls: 'bazi-view-title' });
    
    // 设置按钮
    const settingsButton = header.createEl('button', { 
      cls: 'bazi-view-settings-button',
      attr: { 'aria-label': '设置' }
    });
    settingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
    
    // 添加点击事件
    settingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onSettingsClick();
    });
  }

  /**
   * 创建基本信息区域
   */
  private createBasicInfo() {
    const infoSection = this.container.createDiv({ cls: 'bazi-view-section bazi-view-basic-info' });
    
    // 创建两列布局
    const leftCol = infoSection.createDiv({ cls: 'bazi-view-col' });
    const rightCol = infoSection.createDiv({ cls: 'bazi-view-col' });
    
    // 左侧：公历信息
    leftCol.createEl('div', { 
      cls: 'bazi-view-info-item',
      text: `公历：${this.baziInfo.solarDate} ${this.baziInfo.solarTime}`
    });
    
    // 右侧：农历信息
    rightCol.createEl('div', { 
      cls: 'bazi-view-info-item',
      text: `农历：${this.baziInfo.lunarDate}`
    });
  }

  /**
   * 创建八字表格
   */
  private createBaziTable() {
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section' });
    
    // 创建表格
    const table = tableSection.createEl('table', { cls: 'bazi-view-table' });
    
    // 创建表头
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    
    ['年柱', '月柱', '日柱', '时柱'].forEach(text => {
      headerRow.createEl('th', { text });
    });
    
    // 创建表体
    const tbody = table.createEl('tbody');
    
    // 天干行
    const stemRow = tbody.createEl('tr');
    stemRow.createEl('td', { 
      text: this.baziInfo.yearStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.yearWuXing)}`
    });
    stemRow.createEl('td', { 
      text: this.baziInfo.monthStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.monthWuXing)}`
    });
    stemRow.createEl('td', { 
      text: this.baziInfo.dayStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.dayWuXing)}`
    });
    stemRow.createEl('td', { 
      text: this.baziInfo.hourStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.hourWuXing)}`
    });
    
    // 地支行
    const branchRow = tbody.createEl('tr');
    branchRow.createEl('td', { text: this.baziInfo.yearBranch });
    branchRow.createEl('td', { text: this.baziInfo.monthBranch });
    branchRow.createEl('td', { text: this.baziInfo.dayBranch });
    branchRow.createEl('td', { text: this.baziInfo.hourBranch });
    
    // 藏干行
    const hideGanRow = tbody.createEl('tr');
    hideGanRow.createEl('td', { text: this.baziInfo.yearHideGan });
    hideGanRow.createEl('td', { text: this.baziInfo.monthHideGan });
    hideGanRow.createEl('td', { text: this.baziInfo.dayHideGan });
    hideGanRow.createEl('td', { text: this.baziInfo.hourHideGan });
    
    // 纳音行
    const naYinRow = tbody.createEl('tr');
    naYinRow.createEl('td', { text: this.baziInfo.yearNaYin });
    naYinRow.createEl('td', { text: this.baziInfo.monthNaYin });
    naYinRow.createEl('td', { text: this.baziInfo.dayNaYin });
    naYinRow.createEl('td', { text: this.baziInfo.hourNaYin });
  }

  /**
   * 创建五行分析
   */
  private createWuXingAnalysis() {
    const wuxingSection = this.container.createDiv({ cls: 'bazi-view-section' });
    wuxingSection.createEl('h4', { text: '五行分析', cls: 'bazi-view-subtitle' });
    
    // 这里可以添加更详细的五行分析
    // 简化版本，只显示各个天干的五行
    const wuxingList = wuxingSection.createEl('div', { cls: 'bazi-view-wuxing-list' });
    
    wuxingList.createEl('span', { 
      text: `${this.baziInfo.yearStem}(${this.baziInfo.yearWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.yearWuXing)}`
    });
    
    wuxingList.createEl('span', { 
      text: `${this.baziInfo.monthStem}(${this.baziInfo.monthWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.monthWuXing)}`
    });
    
    wuxingList.createEl('span', { 
      text: `${this.baziInfo.dayStem}(${this.baziInfo.dayWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.dayWuXing)}`
    });
    
    wuxingList.createEl('span', { 
      text: `${this.baziInfo.hourStem}(${this.baziInfo.hourWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.hourWuXing)}`
    });
  }

  /**
   * 创建其他信息
   */
  private createOtherInfo() {
    const otherSection = this.container.createDiv({ cls: 'bazi-view-section' });
    otherSection.createEl('h4', { text: '特殊信息', cls: 'bazi-view-subtitle' });
    
    const infoList = otherSection.createEl('div', { cls: 'bazi-view-info-list' });
    
    infoList.createEl('div', { 
      cls: 'bazi-view-info-item',
      text: `胎元：${this.baziInfo.taiYuan}（${this.baziInfo.taiYuanNaYin}）`
    });
    
    infoList.createEl('div', { 
      cls: 'bazi-view-info-item',
      text: `命宫：${this.baziInfo.mingGong}（${this.baziInfo.mingGongNaYin}）`
    });
  }

  /**
   * 获取五行对应的CSS类名
   * @param wuxing 五行名称
   * @returns CSS类名
   */
  private getWuXingClass(wuxing: string): string {
    const map: {[key: string]: string} = {
      '金': 'jin',
      '木': 'mu',
      '水': 'shui',
      '火': 'huo',
      '土': 'tu'
    };
    
    for (const key in map) {
      if (wuxing.includes(key)) {
        return map[key];
      }
    }
    
    return '';
  }

  /**
   * 获取视图的HTML内容
   * @returns HTML字符串
   */
  getHTML(): string {
    return this.container.innerHTML;
  }
}
