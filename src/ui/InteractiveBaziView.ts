import { BaziInfo } from '../types/BaziInfo';

/**
 * 交互式八字命盘视图
 * 使用JavaScript实现更丰富的互动效果
 */
export class InteractiveBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;

  // 当前选中的大运、流年索引
  private selectedDaYunIndex: number = 0;
  private selectedLiuNianYear: number = 0;

  // 表格元素引用
  private daYunTable: HTMLElement | null = null;
  private liuNianTable: HTMLElement | null = null;
  private xiaoYunTable: HTMLElement | null = null;
  private liuYueTable: HTMLElement | null = null;

  // 动画相关
  private animationDuration: number = 300; // 毫秒

  /**
   * 构造函数
   * @param container 容器元素
   * @param baziInfo 八字信息
   * @param id 唯一ID
   */
  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;

    // 初始化视图
    this.initView();
  }

  /**
   * 初始化视图
   */
  private initView() {
    // 清空容器
    this.container.empty();
    this.container.addClass('interactive-bazi-view');

    // 创建标题和设置按钮
    this.createHeader();

    // 创建八字表格
    this.createBaziTable();

    // 创建特殊信息
    this.createSpecialInfo();

    // 创建大运信息
    this.createDaYunInfo();

    // 创建流年和小运信息
    this.createLiuNianInfo();

    // 创建流月信息
    this.createLiuYueInfo();

    // 默认选中第一个大运
    if (this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
      this.selectDaYun(0);
    }
  }

  /**
   * 创建标题和设置按钮
   */
  private createHeader() {
    const header = this.container.createDiv({ cls: 'bazi-view-header' });
    header.createEl('h3', { text: '八字命盘', cls: 'bazi-view-title' });

    // 创建设置按钮
    const settingsButton = header.createEl('button', {
      cls: 'bazi-view-settings-button',
      attr: { 'data-bazi-id': this.id, 'aria-label': '设置' }
    });
    settingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
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
    const stemRow = tbody.createEl('tr', { cls: 'bazi-stem-row' });
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
    const branchRow = tbody.createEl('tr', { cls: 'bazi-branch-row' });
    branchRow.createEl('td', { text: this.baziInfo.yearBranch });
    branchRow.createEl('td', { text: this.baziInfo.monthBranch });
    branchRow.createEl('td', { text: this.baziInfo.dayBranch });
    branchRow.createEl('td', { text: this.baziInfo.hourBranch });

    // 藏干行
    const hideGanRow = tbody.createEl('tr', { cls: 'bazi-hidegan-row' });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.yearHideGan) ? this.baziInfo.yearHideGan.join('') : (this.baziInfo.yearHideGan || '') });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.monthHideGan) ? this.baziInfo.monthHideGan.join('') : (this.baziInfo.monthHideGan || '') });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.dayHideGan) ? this.baziInfo.dayHideGan.join('') : (this.baziInfo.dayHideGan || '') });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.hourHideGan) ? this.baziInfo.hourHideGan.join('') : (this.baziInfo.hourHideGan || '') });

    // 纳音行
    const naYinRow = tbody.createEl('tr', { cls: 'bazi-nayin-row' });
    naYinRow.createEl('td', { text: this.baziInfo.yearNaYin || '' });
    naYinRow.createEl('td', { text: this.baziInfo.monthNaYin || '' });
    naYinRow.createEl('td', { text: this.baziInfo.dayNaYin || '' });
    naYinRow.createEl('td', { text: this.baziInfo.hourNaYin || '' });

    // 生肖行
    const shengXiaoRow = tbody.createEl('tr', { cls: 'bazi-shengxiao-row' });
    shengXiaoRow.createEl('td', { text: this.baziInfo.yearShengXiao || '' });
    shengXiaoRow.createEl('td', { text: this.baziInfo.monthShengXiao || '' });
    shengXiaoRow.createEl('td', { text: this.baziInfo.dayShengXiao || '' });
    shengXiaoRow.createEl('td', { text: this.baziInfo.hourShengXiao || '' });
  }

  /**
   * 创建特殊信息
   */
  private createSpecialInfo() {
    // 创建特殊信息部分
    const specialSection = this.container.createDiv({ cls: 'bazi-view-section' });
    specialSection.createEl('h4', { text: '特殊信息', cls: 'bazi-view-subtitle' });

    // 创建特殊信息列表
    const infoList = specialSection.createEl('ul', { cls: 'bazi-view-info-list' });

    // 添加特殊信息项
    if (this.baziInfo.taiYuan) {
      infoList.createEl('li', { text: `胎元: ${this.baziInfo.taiYuan}` });
    }

    if (this.baziInfo.mingGong) {
      infoList.createEl('li', { text: `命宫: ${this.baziInfo.mingGong}` });
    }

    if (this.baziInfo.solarDate) {
      infoList.createEl('li', { text: `公历: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || ''}` });
    }

    if (this.baziInfo.lunarDate) {
      infoList.createEl('li', { text: `农历: ${this.baziInfo.lunarDate}` });
    }

    if (this.baziInfo.gender) {
      infoList.createEl('li', { text: `性别: ${this.baziInfo.gender === '1' ? '男' : '女'}` });
    }
  }

  /**
   * 创建大运信息
   */
  private createDaYunInfo() {
    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      return;
    }

    // 创建大运部分
    const daYunSection = this.container.createDiv({ cls: 'bazi-view-section bazi-dayun-section' });
    daYunSection.createEl('h4', { text: '大运信息', cls: 'bazi-view-subtitle' });

    // 创建大运表格
    const tableContainer = daYunSection.createDiv({ cls: 'bazi-view-table-container' });
    this.daYunTable = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-dayun-table' });

    // 获取大运数据
    const daYunData = this.baziInfo.daYun || [];

    // 第一行：年份
    const yearRow = this.daYunTable.createEl('tr');
    yearRow.createEl('th', { text: '大运' });
    daYunData.slice(0, 10).forEach(dy => {
      yearRow.createEl('td', { text: dy.startYear.toString() });
    });

    // 第二行：年龄
    const ageRow = this.daYunTable.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    daYunData.slice(0, 10).forEach(dy => {
      ageRow.createEl('td', { text: dy.startAge.toString() });
    });

    // 第三行：干支
    const gzRow = this.daYunTable.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    daYunData.slice(0, 10).forEach((dy, index) => {
      const cell = gzRow.createEl('td', {
        text: dy.ganZhi,
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        this.selectDaYun(index);
      });
    });

    // 第四行：旬空
    if (daYunData[0].xunKong) {
      const xkRow = this.daYunTable.createEl('tr');
      xkRow.createEl('th', { text: '旬空' });
      daYunData.slice(0, 10).forEach(dy => {
        xkRow.createEl('td', { text: dy.xunKong || '' });
      });
    }
  }

  /**
   * 创建流年和小运信息
   */
  private createLiuNianInfo() {
    // 创建流年和小运部分
    const liuNianSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liunian-section' });
    liuNianSection.createEl('h4', { text: '流年与小运信息', cls: 'bazi-view-subtitle' });

    // 创建流年表格容器
    const tableContainer = liuNianSection.createDiv({ cls: 'bazi-view-table-container' });
    this.liuNianTable = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-liunian-table' });

    // 表格内容将在selectDaYun方法中动态更新
  }

  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
    if (!this.baziInfo.liuYue || this.baziInfo.liuYue.length === 0) {
      return;
    }

    // 创建流月部分
    const liuYueSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liuyue-section' });
    liuYueSection.createEl('h4', { text: '流月信息', cls: 'bazi-view-subtitle' });

    // 创建流月表格容器
    const tableContainer = liuYueSection.createDiv({ cls: 'bazi-view-table-container' });
    this.liuYueTable = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-liuyue-table' });

    // 表格内容将在selectLiuNian方法中动态更新
  }

  /**
   * 选择大运
   * @param index 大运索引
   */
  private selectDaYun(index: number) {
    if (!this.baziInfo.daYun || index >= this.baziInfo.daYun.length) {
      return;
    }

    // 更新选中索引
    this.selectedDaYunIndex = index;

    // 高亮选中的大运单元格
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

    // 获取选中的大运
    const selectedDaYun = this.baziInfo.daYun[index];

    // 尝试从原始八字数据中筛选出属于该大运的流年
    let liuNianData = this.baziInfo.liuNian?.filter(ln => {
      const startYear = selectedDaYun.startYear;
      const endYear = selectedDaYun.endYear ?? (startYear + 9);
      return ln.year >= startYear && ln.year <= endYear;
    }) || [];

    // 如果没有找到流年数据，则动态生成
    if (liuNianData.length === 0) {
      liuNianData = this.generateLiuNianForDaYun(selectedDaYun);
    }

    // 尝试从原始八字数据中筛选出属于该大运的小运
    let xiaoYunData = this.baziInfo.xiaoYun?.filter(xy => {
      const startYear = selectedDaYun.startYear;
      const endYear = selectedDaYun.endYear ?? (startYear + 9);
      return xy.year >= startYear && xy.year <= endYear;
    }) || [];

    // 如果没有找到小运数据，则动态生成
    if (xiaoYunData.length === 0) {
      xiaoYunData = this.generateXiaoYunForDaYun(selectedDaYun);
    }

    // 更新流年和小运合并表格
    this.updateLiuNianXiaoYunTable(liuNianData, xiaoYunData);

    // 如果有流年，选择第一个流年
    if (liuNianData.length > 0) {
      this.selectLiuNian(liuNianData[0].year);
    }
  }

  /**
   * 选择流年
   * @param year 流年年份
   */
  private selectLiuNian(year: number) {
    // 更新选中的流年年份
    this.selectedLiuNianYear = year;

    // 高亮选中的流年单元格
    if (this.liuNianTable) {
      const cells = this.liuNianTable.querySelectorAll('.bazi-liunian-cell');
      cells.forEach(cell => {
        const cellYear = parseInt(cell.getAttribute('data-year') || '0');
        if (cellYear === year) {
          cell.classList.add('selected');
        } else {
          cell.classList.remove('selected');
        }
      });
    }

    // 查找选中的流年数据
    const selectedLiuNian = this.findLiuNianByYear(year);

    // 尝试获取流月信息
    let liuYueData: any[] = [];

    // 如果找到了流年数据，并且有流月信息，使用其流月信息
    if (selectedLiuNian && selectedLiuNian.liuYue) {
      liuYueData = selectedLiuNian.liuYue;
    } else {
      // 如果没有找到流年数据或流月信息，尝试从原始八字数据中查找
      liuYueData = this.baziInfo.liuYue?.filter(ly => {
        // 如果流月数据有year属性，检查是否匹配
        if (ly.year !== undefined) {
          return ly.year === year;
        }
        return false;
      }) || [];

      // 如果仍然没有找到流月数据，则动态生成
      if (liuYueData.length === 0) {
        // 生成流月数据
        liuYueData = this.generateLiuYueForYear(year);
      }
    }

    // 更新流月表格
    this.updateLiuYueTable(liuYueData);
  }

  /**
   * 为指定年份生成流月数据
   * @param year 年份
   * @returns 流月数据数组
   */
  private generateLiuYueForYear(year: number): Array<{month: string, ganZhi: string, xunKong: string}> {
    // 天干地支顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 计算年干支
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    const yearStem = stems[stemIndex];
    const yearBranch = branches[branchIndex];

    // 生成流月数据
    const liuYueData: Array<{month: string, ganZhi: string, xunKong: string}> = [];

    // 根据八字命理学规则，流月干支的计算方法：
    // 月支固定对应：寅卯辰巳午未申酉戌亥子丑
    // 月干则根据流年干支确定起始月干，然后依次递增

    // 确定节令月干支
    // 甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
    let firstMonthStem = '';
    if (yearStem === '甲' || yearStem === '己') {
      firstMonthStem = '丙';
    } else if (yearStem === '乙' || yearStem === '庚') {
      firstMonthStem = '戊';
    } else if (yearStem === '丙' || yearStem === '辛') {
      firstMonthStem = '庚';
    } else if (yearStem === '丁' || yearStem === '壬') {
      firstMonthStem = '壬';
    } else if (yearStem === '戊' || yearStem === '癸') {
      firstMonthStem = '甲';
    }

    const firstMonthStemIndex = stems.indexOf(firstMonthStem);

    // 生成12个月的流月数据
    for (let month = 1; month <= 12; month++) {
      // 计算月干（正月寅月开始，每月递增一位）
      const monthStemIndex = (firstMonthStemIndex + month - 1) % 10;
      const monthStem = stems[monthStemIndex];

      // 月支固定对应
      const monthBranchMap = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
      const monthBranch = monthBranchMap[month];

      // 组合干支
      const ganZhi = monthStem + monthBranch;

      // 计算旬空
      const xunKong = this.calculateXunKong(monthStem, monthBranch);

      // 中文月份
      const chineseMonths = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
      const monthText = chineseMonths[month] + '月';

      liuYueData.push({
        month: monthText,
        ganZhi,
        xunKong
      });
    }

    return liuYueData;
  }

  /**
   * 根据年份查找流年数据
   * @param year 流年年份
   * @returns 流年数据对象
   */
  private findLiuNianByYear(year: number): any {
    // 从原始流年数据中查找
    if (this.baziInfo.liuNian) {
      for (const liuNian of this.baziInfo.liuNian) {
        if (liuNian.year === year) {
          return liuNian;
        }
      }
    }

    return null;
  }



  /**
   * 更新流年和小运合并表格
   * @param liuNian 流年数据
   * @param xiaoYun 小运数据
   */
  private updateLiuNianXiaoYunTable(liuNian: any[], xiaoYun: any[]) {
    if (!this.liuNianTable) {
      return;
    }

    // 清空表格
    this.liuNianTable.empty();

    // 如果没有数据，返回
    if (liuNian.length === 0) {
      return;
    }

    // 添加动画效果
    this.liuNianTable.style.opacity = '0';
    this.liuNianTable.style.transition = `opacity ${this.animationDuration}ms ease-in-out`;

    // 第一行：年份
    const yearRow = this.liuNianTable.createEl('tr');
    yearRow.createEl('th', { text: '年份' });
    liuNian.slice(0, 10).forEach(ln => {
      yearRow.createEl('td', { text: ln.year.toString() });
    });

    // 第二行：年龄
    const ageRow = this.liuNianTable.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    liuNian.slice(0, 10).forEach(ln => {
      ageRow.createEl('td', { text: ln.age.toString() });
    });

    // 第三行：流年干支
    const lnGzRow = this.liuNianTable.createEl('tr');
    lnGzRow.createEl('th', { text: '流年' });
    liuNian.slice(0, 10).forEach(ln => {
      const cell = lnGzRow.createEl('td', {
        text: ln.ganZhi,
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        this.selectLiuNian(ln.year);
      });

      // 如果是当前选中的流年，添加选中样式
      if (ln.year === this.selectedLiuNianYear) {
        cell.classList.add('selected');
      }
    });

    // 第四行：流年旬空
    if (liuNian[0].xunKong) {
      const lnXkRow = this.liuNianTable.createEl('tr');
      lnXkRow.createEl('th', { text: '流年旬空' });
      liuNian.slice(0, 10).forEach(ln => {
        lnXkRow.createEl('td', { text: ln.xunKong || '' });
      });
    }

    // 第五行：小运干支
    if (xiaoYun.length > 0) {
      const xyGzRow = this.liuNianTable.createEl('tr');
      xyGzRow.createEl('th', { text: '小运' });

      // 创建一个映射，用于快速查找特定年份的小运
      const xyMap = new Map();
      xiaoYun.forEach(xy => {
        xyMap.set(xy.year, xy);
      });

      liuNian.slice(0, 10).forEach(ln => {
        const xy = xyMap.get(ln.year);
        xyGzRow.createEl('td', { text: xy ? xy.ganZhi : '' });
      });
    }

    // 第六行：小运旬空
    if (xiaoYun.length > 0 && xiaoYun[0].xunKong) {
      const xyXkRow = this.liuNianTable.createEl('tr');
      xyXkRow.createEl('th', { text: '小运旬空' });

      // 创建一个映射，用于快速查找特定年份的小运
      const xyMap = new Map();
      xiaoYun.forEach(xy => {
        xyMap.set(xy.year, xy);
      });

      liuNian.slice(0, 10).forEach(ln => {
        const xy = xyMap.get(ln.year);
        xyXkRow.createEl('td', { text: xy ? (xy.xunKong || '') : '' });
      });
    }

    // 显示表格（带动画）
    setTimeout(() => {
      if (this.liuNianTable) {
        this.liuNianTable.style.opacity = '1';
      }
    }, 10);
  }

  /**
   * 更新流月表格
   * @param liuYue 流月数据
   */
  private updateLiuYueTable(liuYue: any[]) {
    if (!this.liuYueTable) {
      return;
    }

    // 清空表格
    this.liuYueTable.empty();

    // 如果没有数据，返回
    if (liuYue.length === 0) {
      return;
    }

    // 添加动画效果
    this.liuYueTable.style.opacity = '0';
    this.liuYueTable.style.transition = `opacity ${this.animationDuration}ms ease-in-out`;

    // 第一行：月份
    const monthRow = this.liuYueTable.createEl('tr');
    monthRow.createEl('th', { text: '流月' });
    liuYue.forEach(ly => {
      // 处理不同格式的月份数据
      let monthText = '';
      if (typeof ly.month === 'string') {
        // 如果是字符串（如"正月"），直接使用
        monthText = ly.month;
      } else if (typeof ly.month === 'number') {
        // 如果是数字，转换为中文月份
        const chineseMonths = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
        monthText = chineseMonths[ly.month] + '月';
      } else if (ly.monthInChinese) {
        // 如果有monthInChinese属性（lunar-typescript库格式）
        monthText = ly.monthInChinese;
      } else if (ly.index !== undefined) {
        // 如果有index属性（lunar-typescript库格式）
        const chineseMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
        monthText = chineseMonths[ly.index] + '月';
      }

      monthRow.createEl('td', { text: monthText });
    });

    // 第二行：干支
    const gzRow = this.liuYueTable.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuYue.forEach(ly => {
      // 获取月份标识，用于data-month属性
      let monthId = '';
      if (typeof ly.month === 'number' || typeof ly.month === 'string') {
        monthId = ly.month.toString();
      } else if (ly.index !== undefined) {
        monthId = (ly.index + 1).toString(); // 索引从0开始，月份从1开始
      }

      const cell = gzRow.createEl('td', {
        text: ly.ganZhi,
        cls: 'bazi-liuyue-cell',
        attr: { 'data-month': monthId }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        this.liuYueTable?.querySelectorAll('.bazi-liuyue-cell').forEach(c => {
          c.classList.remove('selected');
        });
        cell.classList.add('selected');
      });
    });

    // 第三行：旬空
    const xkRow = this.liuYueTable.createEl('tr');
    xkRow.createEl('th', { text: '旬空' });
    liuYue.forEach(ly => {
      // 处理不同格式的旬空数据
      let xunKong = '';
      if (ly.xunKong) {
        xunKong = ly.xunKong;
      } else if (ly.xun && ly.xunKong) {
        // lunar-typescript库可能使用这种格式
        xunKong = ly.xunKong;
      } else {
        // 如果没有旬空数据，尝试计算
        const ganZhi = ly.ganZhi;
        if (ganZhi && ganZhi.length === 2) {
          xunKong = this.calculateXunKong(ganZhi[0], ganZhi[1]);
        }
      }

      xkRow.createEl('td', { text: xunKong });
    });

    // 显示表格（带动画）
    setTimeout(() => {
      if (this.liuYueTable) {
        this.liuYueTable.style.opacity = '1';
      }
    }, 10);
  }

  /**
   * 为指定大运生成流年数据
   * @param daYun 大运数据
   * @returns 流年数据数组
   */
  private generateLiuNianForDaYun(daYun: any): Array<{year: number, age: number, ganZhi: string, xunKong: string}> {
    // 如果没有起始年或结束年，返回空数组
    if (!daYun.startYear) {
      return [];
    }

    // 计算结束年（如果未定义，使用起始年+9）
    const endYear = daYun.endYear ?? (daYun.startYear + 9);

    // 生成流年数据
    const liuNianData: Array<{year: number, age: number, ganZhi: string, xunKong: string}> = [];
    let age = daYun.startAge;

    for (let year = daYun.startYear; year <= endYear; year++, age++) {
      // 计算干支
      // 天干地支顺序
      const stems = "甲乙丙丁戊己庚辛壬癸";
      const branches = "子丑寅卯辰巳午未申酉戌亥";

      // 计算流年干支
      const stemIndex = (year - 4) % 10;
      const branchIndex = (year - 4) % 12;

      const stem = stems[stemIndex];
      const branch = branches[branchIndex];
      const ganZhi = stem + branch;

      // 计算旬空
      const xunKong = this.calculateXunKong(stem, branch);

      liuNianData.push({
        year,
        age,
        ganZhi,
        xunKong
      });
    }

    return liuNianData;
  }

  /**
   * 为指定大运生成小运数据
   * @param daYun 大运数据
   * @returns 小运数据数组
   */
  private generateXiaoYunForDaYun(daYun: any): Array<{year: number, age: number, ganZhi: string, xunKong: string}> {
    // 如果没有起始年或结束年，返回空数组
    if (!daYun.startYear) {
      return [];
    }

    // 计算结束年（如果未定义，使用起始年+9）
    const endYear = daYun.endYear ?? (daYun.startYear + 9);

    // 生成小运数据
    const xiaoYunData: Array<{year: number, age: number, ganZhi: string, xunKong: string}> = [];
    let age = daYun.startAge;

    // 获取大运干支
    const daYunGanZhi = daYun.ganZhi;
    if (!daYunGanZhi || daYunGanZhi.length !== 2) {
      return [];
    }

    // 天干地支顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 大运干支索引
    const daYunStemIndex = stems.indexOf(daYunGanZhi[0]);
    const daYunBranchIndex = branches.indexOf(daYunGanZhi[1]);

    if (daYunStemIndex === -1 || daYunBranchIndex === -1) {
      return [];
    }

    for (let year = daYun.startYear; year <= endYear; year++, age++) {
      // 小运干支计算（简化处理，实际应根据命理规则）
      // 这里假设小运天干按年干顺排，地支按月支顺排
      const stemIndex = (daYunStemIndex + (year - daYun.startYear)) % 10;
      const branchIndex = (daYunBranchIndex + (year - daYun.startYear)) % 12;

      const stem = stems[stemIndex];
      const branch = branches[branchIndex];
      const ganZhi = stem + branch;

      // 计算旬空
      const xunKong = this.calculateXunKong(stem, branch);

      xiaoYunData.push({
        year,
        age,
        ganZhi,
        xunKong
      });
    }

    return xiaoYunData;
  }

  /**
   * 计算旬空
   * @param gan 天干
   * @param zhi 地支
   * @returns 旬空
   */
  private calculateXunKong(gan: string, zhi: string): string {
    // 天干序号（甲=0, 乙=1, ..., 癸=9）
    const ganIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(gan);
    // 地支序号（子=0, 丑=1, ..., 亥=11）
    const zhiIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(zhi);

    if (ganIndex < 0 || zhiIndex < 0) {
      return '';
    }

    // 计算旬首
    const xunShouIndex = Math.floor(ganIndex / 2) * 2;

    // 计算旬空地支
    const xunKongIndex1 = (xunShouIndex + 10) % 12;
    const xunKongIndex2 = (xunShouIndex + 11) % 12;

    // 获取旬空地支
    const xunKongZhi1 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex1);
    const xunKongZhi2 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex2);

    return xunKongZhi1 + xunKongZhi2;
  }

  /**
   * 获取五行对应的CSS类名
   * @param wuXing 五行
   * @returns CSS类名
   */
  private getWuXingClass(wuXing: string | undefined): string {
    if (!wuXing) return '';

    switch (wuXing) {
      case '金': return 'jin';
      case '木': return 'mu';
      case '水': return 'shui';
      case '火': return 'huo';
      case '土': return 'tu';
      default: return '';
    }
  }
}
