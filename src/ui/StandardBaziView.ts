import { BaziInfo } from '../types/BaziInfo';

/**
 * 标准八字视图组件
 * 样式2：包含八字、大运、流年、流月，简化的标题
 */
export class StandardBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;
  private currentLiuYueYear: number | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;

    this.render();
  }

  /**
   * 渲染标准八字视图
   */
  private render() {
    // 清空容器
    this.container.empty();
    this.container.addClass('standard-bazi-view');
    this.container.setAttribute('id', this.id);

    // 创建简化标题
    this.createSimpleHeader();

    // 创建基本信息
    this.createBasicInfo();

    // 创建八字表格
    this.createBaziTable();

    // 创建大运信息
    this.createDaYunInfo();

    // 创建流年信息
    this.createLiuNianInfo();

    // 创建流月信息
    this.createLiuYueInfo();
  }

  /**
   * 创建简化标题
   */
  private createSimpleHeader() {
    const header = this.container.createDiv({ cls: 'bazi-view-header simple' });
    header.createEl('h4', { text: '八字分析', cls: 'bazi-view-title simple' });
  }

  /**
   * 创建基本信息
   */
  private createBasicInfo() {
    const basicInfoDiv = this.container.createDiv({ cls: 'bazi-basic-info standard' });

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
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section standard' });

    // 创建表格
    const table = tableSection.createEl('table', { cls: 'bazi-view-table standard' });

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
   * 创建大运信息
   */
  private createDaYunInfo() {
    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      return;
    }

    const section = this.container.createDiv({ cls: 'bazi-view-section standard' });
    section.createEl('h5', { text: '大运', cls: 'bazi-section-title' });

    // 创建大运表格容器
    const tableContainer = section.createDiv({ cls: 'bazi-dayun-container' });

    // 渲染大运表格
    this.renderDaYunTable(tableContainer);
  }

  /**
   * 渲染大运表格（横排样式）
   */
  private renderDaYunTable(container: HTMLElement) {
    container.empty();

    const table = container.createEl('table', { cls: 'bazi-view-dayun-table' });

    // 显示所有大运（最多10个）
    const daYunData = this.baziInfo.daYun.slice(0, 10);

    // 第一行：大运干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '大运' });
    daYunData.forEach((dayun: any, index: number) => {
      const cell = gzRow.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      if (dayun.ganZhi && dayun.ganZhi.length >= 2) {
        const gan = dayun.ganZhi[0];
        const zhi = dayun.ganZhi[1];

        const ganSpan = cell.createEl('span', {
          text: gan,
          cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(gan))}`
        });

        const zhiSpan = cell.createEl('span', {
          text: zhi,
          cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(zhi))}`
        });
      } else {
        cell.textContent = dayun.ganZhi || '';
      }

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-dayun-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');

        console.log('=== 大运点击事件 ===');
        console.log('选中大运:', dayun.ganZhi, '索引:', index);
        console.log('大运完整数据:', dayun);

        // 更新流年显示
        this.updateLiuNianForDaYun(dayun);
      });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    daYunData.forEach((dayun: any) => {
      ageRow.createEl('td', { text: `${dayun.startAge}-${dayun.endAge}` });
    });

    // 第三行：起止年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '年份' });
    daYunData.forEach((dayun: any) => {
      yearRow.createEl('td', { text: `${dayun.startYear}-${dayun.endYear}` });
    });

    // 默认选中第一个大运
    if (daYunData.length > 0) {
      const firstCell = table.querySelector('.bazi-dayun-cell');
      if (firstCell) {
        firstCell.classList.add('selected');
        // 默认显示第一个大运的流年
        this.updateLiuNianForDaYun(daYunData[0]);
      }
    }
  }

  /**
   * 创建流年信息
   */
  private createLiuNianInfo() {
    const section = this.container.createDiv({ cls: 'bazi-view-section standard' });
    section.createEl('h5', { text: '流年', cls: 'bazi-section-title' });

    // 创建流年表格容器
    const tableContainer = section.createDiv({ cls: 'bazi-liunian-container' });

    // 初始渲染空的流年表格
    this.renderLiuNianTable(tableContainer, []);
  }

  /**
   * 更新指定大运的流年
   */
  private updateLiuNianForDaYun(selectedDaYun: any) {
    console.log('选中的大运:', selectedDaYun);
    console.log('大运起止年份:', selectedDaYun.startYear, '-', selectedDaYun.endYear);

    // 使用大运的年份范围生成流年数据
    const startYear = typeof selectedDaYun.startYear === 'number' ? selectedDaYun.startYear : parseInt(selectedDaYun.startYear);
    const endYear = typeof selectedDaYun.endYear === 'number' ? selectedDaYun.endYear : parseInt(selectedDaYun.endYear);

    console.log('转换后的大运年份范围:', startYear, '-', endYear);

    // 生成该大运期间的流年数据
    const liuNianData = [];
    for (let year = startYear; year <= endYear; year++) {
      // 计算年龄（假设出生年份）
      const birthYear = this.baziInfo.originalDate?.year || startYear - selectedDaYun.startAge;
      const age = year - birthYear + 1;

      // 计算该年的干支
      const ganZhi = this.calculateYearGanZhi(year);

      liuNianData.push({
        year: year,
        age: age,
        ganZhi: ganZhi,
        naYin: this.getNaYin(ganZhi),
        index: year - startYear
      });
    }

    console.log('生成的流年数据:', liuNianData);

    // 更新流年表格
    const tableContainer = this.container.querySelector('.bazi-liunian-container');
    if (tableContainer) {
      this.renderLiuNianTable(tableContainer as HTMLElement, liuNianData);
    }
  }

  /**
   * 计算年份对应的干支
   */
  private calculateYearGanZhi(year: number): string {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 以甲子年（1984年）为基准计算
    const baseYear = 1984;
    const yearOffset = year - baseYear;

    const stemIndex = (yearOffset % 10 + 10) % 10;
    const branchIndex = (yearOffset % 12 + 12) % 12;

    return stems[stemIndex] + branches[branchIndex];
  }

  /**
   * 获取干支对应的纳音
   */
  private getNaYin(ganZhi: string): string {
    const naYinMap: { [key: string]: string } = {
      '甲子': '海中金', '乙丑': '海中金',
      '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木',
      '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金',
      '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水',
      '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金',
      '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水',
      '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火',
      '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水',
      '甲午': '砂中金', '乙未': '砂中金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };

    return naYinMap[ganZhi] || '';
  }

  /**
   * 渲染流年表格（横排样式）
   */
  private renderLiuNianTable(container: HTMLElement, liuNianData: any[]) {
    container.empty();

    if (!liuNianData || liuNianData.length === 0) {
      container.createEl('div', {
        text: '请选择大运查看对应流年',
        cls: 'bazi-empty-message'
      });
      return;
    }

    const table = container.createEl('table', { cls: 'bazi-view-liunian-table' });

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '年份' });
    liuNianData.forEach((liunian: any) => {
      yearRow.createEl('td', { text: liunian.year.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    liuNianData.forEach((liunian: any) => {
      ageRow.createEl('td', { text: `${liunian.age}岁` });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuNianData.forEach((liunian: any, index: number) => {
      const cell = gzRow.createEl('td', {
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': liunian.year.toString() }
      });

      if (liunian.ganZhi && liunian.ganZhi.length >= 2) {
        const gan = liunian.ganZhi[0];
        const zhi = liunian.ganZhi[1];

        const ganSpan = cell.createEl('span', {
          text: gan,
          cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(gan))}`
        });

        const zhiSpan = cell.createEl('span', {
          text: zhi,
          cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(zhi))}`
        });
      } else {
        cell.textContent = liunian.ganZhi || '';
      }

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-liunian-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');

        console.log('选中流年:', liunian.year, liunian.ganZhi);

        // 更新流月显示
        this.currentLiuYueYear = liunian.year;
        const liuYueContainer = this.container.querySelector('.bazi-liuyue-container');
        if (liuYueContainer) {
          this.renderLiuYueTable(liuYueContainer as HTMLElement);
        }
      });
    });

    // 默认选中第一个流年
    if (liuNianData.length > 0) {
      const firstCell = table.querySelector('.bazi-liunian-cell');
      if (firstCell) {
        firstCell.classList.add('selected');
        // 默认显示第一个流年的流月
        this.currentLiuYueYear = liuNianData[0].year;
        const liuYueContainer = this.container.querySelector('.bazi-liuyue-container');
        if (liuYueContainer) {
          this.renderLiuYueTable(liuYueContainer as HTMLElement);
        }
      }
    }
  }

  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
    const section = this.container.createDiv({ cls: 'bazi-view-section standard' });
    section.createEl('h5', { text: '流月', cls: 'bazi-section-title' });

    // 创建流月表格容器
    const tableContainer = section.createDiv({ cls: 'bazi-liuyue-container' });

    // 初始渲染空的流月表格
    this.renderLiuYueTable(tableContainer);
  }

  /**
   * 渲染流月表格
   */
  private renderLiuYueTable(container: HTMLElement) {
    container.empty();

    if (!this.currentLiuYueYear) {
      container.createEl('div', {
        text: '请选择流年查看对应流月',
        cls: 'bazi-empty-message'
      });
      return;
    }

    // 计算指定年份的流月
    const liuYueData = this.calculateLiuYue(this.currentLiuYueYear);

    const table = container.createEl('table', { cls: 'bazi-view-liuyue-table' });
    const tbody = table.createEl('tbody');

    // 按行显示流月，每行4个月
    for (let i = 0; i < liuYueData.length; i += 4) {
      const row = tbody.createEl('tr');

      for (let j = 0; j < 4 && i + j < liuYueData.length; j++) {
        const liuyue = liuYueData[i + j];
        const cell = row.createEl('td', { cls: 'bazi-liuyue-cell' });

        cell.createDiv({
          text: `${liuyue.month}月`,
          cls: 'liuyue-month'
        });

        // 流月干支，添加五行色彩
        const ganZhiDiv = cell.createDiv({ cls: 'liuyue-ganzhi' });

        if (liuyue.ganZhi && liuyue.ganZhi.length >= 2) {
          const gan = liuyue.ganZhi[0];
          const zhi = liuyue.ganZhi[1];

          const ganSpan = ganZhiDiv.createEl('span', {
            text: gan,
            cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(gan))}`
          });

          const zhiSpan = ganZhiDiv.createEl('span', {
            text: zhi,
            cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(zhi))}`
          });
        } else {
          ganZhiDiv.textContent = liuyue.ganZhi || '';
        }
      }
    }

    // 添加年份标题
    const yearTitle = container.createDiv({
      text: `${this.currentLiuYueYear}年流月`,
      cls: 'bazi-liuyue-year-title'
    });
    container.insertBefore(yearTitle, table);
  }

  /**
   * 计算指定年份的流月
   */
  private calculateLiuYue(year: number): any[] {
    // 这里应该使用lunar-typescript库来计算指定年份的流月
    // 暂时返回一个简单的示例数据
    const months = [];
    const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    for (let month = 1; month <= 12; month++) {
      const ganIndex = (year * 12 + month - 1) % 10;
      const zhiIndex = (month - 1) % 12;

      months.push({
        month: month,
        ganZhi: ganList[ganIndex] + zhiList[zhiIndex]
      });
    }

    return months;
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
