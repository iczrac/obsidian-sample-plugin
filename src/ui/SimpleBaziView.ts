import { BaziInfo } from '../types/BaziInfo';

/**
 * 简洁八字视图组件
 * 样式1：仅显示八字和基本信息，无标题，无设置按钮
 */
export class SimpleBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;

    this.render();
  }

  /**
   * 渲染简洁八字视图
   */
  private render() {
    // 清空容器
    this.container.empty();
    this.container.addClass('simple-bazi-view');
    this.container.setAttribute('id', this.id);

    // 创建基本信息（无标题）
    this.createBasicInfo();

    // 创建八字表格
    this.createBaziTable();
  }

  /**
   * 创建基本信息
   */
  private createBasicInfo() {
    const basicInfoDiv = this.container.createDiv({ cls: 'bazi-basic-info simple' });

    if (this.baziInfo.solarDate) {
      basicInfoDiv.createSpan({
        text: `公历: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || ''}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.lunarDate) {
      basicInfoDiv.createSpan({
        text: `农历: ${this.baziInfo.lunarDate}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.gender) {
      basicInfoDiv.createSpan({
        text: `性别: ${this.baziInfo.gender === '1' ? '男' : '女'}`,
        cls: 'bazi-basic-info-item'
      });
    }
  }

  /**
   * 创建八字表格
   */
  private createBaziTable() {
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section simple' });

    // 创建表格
    const table = tableSection.createEl('table', { cls: 'bazi-view-table simple' });

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
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.yearStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.monthStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.monthStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.dayStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.dayStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.hourStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.hourStem))}`
    });

    // 地支行
    const branchRow = tbody.createEl('tr');
    branchRow.createEl('td', {
      text: this.baziInfo.yearBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.yearBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.monthBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.monthBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.dayBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.dayBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.hourBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.hourBranch))}`
    });
  }

  /**
   * 获取五行对应的CSS类名
   */
  private getWuXingClass(wuxing: string): string {
    const map: { [key: string]: string } = {
      '金': 'jin',
      '木': 'mu',
      '水': 'shui',
      '火': 'huo',
      '土': 'tu'
    };
    return map[wuxing] || '';
  }

  /**
   * 获取天干对应的五行
   */
  private getStemWuXing(stem: string): string {
    const map: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return map[stem] || '';
  }

  /**
   * 获取地支对应的五行
   */
  private getBranchWuXing(branch: string): string {
    const map: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return map[branch] || '';
  }
}
