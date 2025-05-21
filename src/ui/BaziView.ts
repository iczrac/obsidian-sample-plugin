import { BaziInfo } from 'src/types/BaziInfo';

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
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.yearWuXing || '')}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.monthStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.monthWuXing || '')}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.dayStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.dayWuXing || '')}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.hourStem,
      cls: `wuxing-${this.getWuXingClass(this.baziInfo.hourWuXing || '')}`
    });

    // 地支行
    const branchRow = tbody.createEl('tr');
    branchRow.createEl('td', { text: this.baziInfo.yearBranch });
    branchRow.createEl('td', { text: this.baziInfo.monthBranch });
    branchRow.createEl('td', { text: this.baziInfo.dayBranch });
    branchRow.createEl('td', { text: this.baziInfo.hourBranch });

    // 藏干行
    const hideGanRow = tbody.createEl('tr');
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.yearHideGan) ? this.baziInfo.yearHideGan.join(', ') : this.baziInfo.yearHideGan || '' });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.monthHideGan) ? this.baziInfo.monthHideGan.join(', ') : this.baziInfo.monthHideGan || '' });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.dayHideGan) ? this.baziInfo.dayHideGan.join(', ') : this.baziInfo.dayHideGan || '' });
    hideGanRow.createEl('td', { text: Array.isArray(this.baziInfo.hourHideGan) ? this.baziInfo.hourHideGan.join(', ') : this.baziInfo.hourHideGan || '' });

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
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.yearWuXing || '')}`
    });

    wuxingList.createEl('span', {
      text: `${this.baziInfo.monthStem}(${this.baziInfo.monthWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.monthWuXing || '')}`
    });

    wuxingList.createEl('span', {
      text: `${this.baziInfo.dayStem}(${this.baziInfo.dayWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.dayWuXing || '')}`
    });

    wuxingList.createEl('span', {
      text: `${this.baziInfo.hourStem}(${this.baziInfo.hourWuXing})`,
      cls: `wuxing-tag wuxing-${this.getWuXingClass(this.baziInfo.hourWuXing || '')}`
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

    // 添加旬空信息
    if (this.baziInfo.yearXunKong || this.baziInfo.monthXunKong ||
        this.baziInfo.dayXunKong || this.baziInfo.timeXunKong) {
      const xunKongDiv = infoList.createEl('div', { cls: 'bazi-view-info-item' });
      xunKongDiv.innerHTML = `旬空：年(${this.baziInfo.yearXunKong || '无'}) 月(${this.baziInfo.monthXunKong || '无'}) 日(${this.baziInfo.dayXunKong || '无'}) 时(${this.baziInfo.timeXunKong || '无'})`;
    }

    // 创建大运信息
    this.createDaYunInfo();
  }

  /**
   * 创建大运信息
   */
  private createDaYunInfo() {
    if (!this.baziInfo.daYun || this.baziInfo.daYun.length === 0) {
      return;
    }

    // 创建大运部分
    const daYunSection = this.container.createDiv({ cls: 'bazi-view-section' });
    daYunSection.createEl('h4', { text: '大运信息', cls: 'bazi-view-subtitle' });

    // 创建大运表格
    const tableContainer = daYunSection.createDiv({ cls: 'bazi-view-table-container' });
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-dayun-table' });

    // 获取大运数据
    const daYunData = this.baziInfo.daYun || [];

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '大运' });
    const daYunArray = Array.isArray(daYunData) ? daYunData : [];
    daYunArray.slice(0, 10).forEach(dy => {
      yearRow.createEl('td', { text: dy.startYear.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    daYunArray.slice(0, 10).forEach(dy => {
      ageRow.createEl('td', { text: dy.startAge.toString() });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    daYunArray.slice(0, 10).forEach((dy, index) => {
      const cell = gzRow.createEl('td', {
        text: dy.ganZhi,
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-dayun-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');

        // 更新流年、小运和流月
        this.handleDaYunSelect(index);
      });
    });

    // 创建流年信息
    this.createLiuNianInfo();

    // 创建小运信息
    this.createXiaoYunInfo();

    // 创建流月信息
    this.createLiuYueInfo();

    // 默认选中第一个大运
    if (this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
      this.handleDaYunSelect(0);
    }
  }

  /**
   * 创建流年信息
   */
  private createLiuNianInfo() {
    if (!this.baziInfo.liuNian || this.baziInfo.liuNian.length === 0) {
      return;
    }

    // 创建流年部分
    const liuNianSection = this.container.createDiv({ cls: 'bazi-view-section bazi-liunian-section' });
    liuNianSection.setAttribute('data-bazi-id', this.id);
    liuNianSection.createEl('h4', { text: '流年信息', cls: 'bazi-view-subtitle' });

    // 创建流年表格
    const tableContainer = liuNianSection.createDiv({ cls: 'bazi-view-table-container' });
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-liunian-table' });

    // 获取流年数据
    const liuNianData = this.baziInfo.liuNian || [];

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '流年' });
    liuNianData.slice(0, 10).forEach(ln => {
      yearRow.createEl('td', { text: ln.year.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    liuNianData.slice(0, 10).forEach(ln => {
      ageRow.createEl('td', { text: ln.age.toString() });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuNianData.slice(0, 10).forEach(ln => {
      const cell = gzRow.createEl('td', {
        text: ln.ganZhi,
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-liunian-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');

        // 更新流月
        this.handleLiuNianSelect(ln.year);
      });
    });
  }

  /**
   * 创建小运信息
   */
  private createXiaoYunInfo() {
    if (!this.baziInfo.xiaoYun || this.baziInfo.xiaoYun.length === 0) {
      return;
    }

    // 创建小运部分
    const xiaoYunSection = this.container.createDiv({ cls: 'bazi-view-section bazi-xiaoyun-section' });
    xiaoYunSection.setAttribute('data-bazi-id', this.id);
    xiaoYunSection.createEl('h4', { text: '小运信息', cls: 'bazi-view-subtitle' });

    // 创建小运表格
    const tableContainer = xiaoYunSection.createDiv({ cls: 'bazi-view-table-container' });
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-xiaoyun-table' });

    // 获取小运数据
    const xiaoYunData = this.baziInfo.xiaoYun || [];

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '小运' });
    xiaoYunData.slice(0, 10).forEach(xy => {
      yearRow.createEl('td', { text: xy.year.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    xiaoYunData.slice(0, 10).forEach(xy => {
      ageRow.createEl('td', { text: xy.age.toString() });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    xiaoYunData.slice(0, 10).forEach(xy => {
      const cell = gzRow.createEl('td', {
        text: xy.ganZhi,
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-year': xy.year.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-xiaoyun-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');
      });
    });
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
    liuYueSection.setAttribute('data-bazi-id', this.id);
    liuYueSection.createEl('h4', { text: '流月信息', cls: 'bazi-view-subtitle' });

    // 创建流月表格
    const tableContainer = liuYueSection.createDiv({ cls: 'bazi-view-table-container' });
    const table = tableContainer.createEl('table', { cls: 'bazi-view-table bazi-view-liuyue-table' });

    // 获取流月数据
    const liuYueData = this.baziInfo.liuYue || [];

    // 第一行：月份
    const monthRow = table.createEl('tr');
    monthRow.createEl('th', { text: '流月' });
    liuYueData.forEach(ly => {
      monthRow.createEl('td', { text: ly.month.toString() });
    });

    // 第二行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuYueData.forEach(ly => {
      const cell = gzRow.createEl('td', {
        text: ly.ganZhi,
        cls: 'bazi-liuyue-cell',
        attr: { 'data-month': ly.month }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-liuyue-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');
      });
    });
  }

  /**
   * 处理大运选择变化 - 已废弃，使用handleDaYunSelect代替
   * @param selector 大运选择器
   */
  private handleDaYunChange(selector: HTMLSelectElement) {
    const selectedIndex = parseInt(selector.value);
    this.handleDaYunSelect(selectedIndex);
  }

  /**
   * 处理大运选择
   * @param index 大运索引
   */
  private handleDaYunSelect(index: number) {
    // 获取所有大运、流年、小运和流月数据
    const allDaYun = this.baziInfo.daYun || [];
    const allLiuNian = this.baziInfo.liuNian || [];
    const allXiaoYun = this.baziInfo.xiaoYun || [];
    const allLiuYue = this.baziInfo.liuYue || [];

    // 根据选择的大运索引，筛选对应的流年、小运和流月
    const selectedDaYun = allDaYun[index];
    if (!selectedDaYun) return;

    // 筛选该大运对应的流年
    const filteredLiuNian = allLiuNian.filter(ln => {
      return typeof selectedDaYun !== 'string' && ln.year >= selectedDaYun.startYear && ln.year <= (selectedDaYun.endYear || Infinity);
    });

    // 筛选该大运对应的小运
    const filteredXiaoYun = allXiaoYun.filter(xy => {
      return typeof selectedDaYun !== 'string' && xy.year >= selectedDaYun.startYear && xy.year <= (selectedDaYun.endYear || Infinity);
    });

    // 更新流年表格
    this.updateLiuNianTable(filteredLiuNian);

    // 更新小运表格
    this.updateXiaoYunTable(filteredXiaoYun);

    // 如果有流年，更新流月表格（取所有流月）
    if (filteredLiuNian.length > 0) {
      // 由于流月对象没有year属性，我们直接使用所有流月数据
      this.updateLiuYueTable(allLiuYue);
    }

    // 高亮选中的大运行
    const daYunTable = this.container.querySelector('.bazi-view-dayun-table');
    if (daYunTable) {
      const rows = daYunTable.querySelectorAll('tbody tr');
      rows.forEach(row => row.removeClass('selected'));
      const selectedRow = daYunTable.querySelector(`tbody tr[data-index="${index}"]`);
      if (selectedRow) {
        selectedRow.addClass('selected');
      }
    }
  }

  /**
   * 处理流年选择
   * @param year 流年年份
   */
  private handleLiuNianSelect(year: number) {
    // 获取所有流月数据
    const allLiuYue = this.baziInfo.liuYue || [];

    // 由于流月对象没有year属性，我们直接使用所有流月数据
    // 在实际应用中，可能需要根据其他属性来筛选流月
    this.updateLiuYueTable(allLiuYue);
  }

  /**
   * 更新流年表格
   * @param liuNian 流年数据
   */
  private updateLiuNianTable(liuNian: any[]) {
    const liuNianSection = this.container.querySelector(`.bazi-liunian-section[data-bazi-id="${this.id}"]`);
    if (!liuNianSection) return;

    // 获取表格
    const table = liuNianSection.querySelector('.bazi-view-liunian-table');
    if (!table) return;

    // 清空表格
    table.empty();

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '流年' });
    liuNian.slice(0, 10).forEach(ln => {
      yearRow.createEl('td', { text: ln.year.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    liuNian.slice(0, 10).forEach(ln => {
      ageRow.createEl('td', { text: ln.age.toString() });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuNian.slice(0, 10).forEach(ln => {
      const cell = gzRow.createEl('td', {
        text: ln.ganZhi,
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-liunian-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');

        // 更新流月
        this.handleLiuNianSelect(ln.year);
      });
    });
  }

  /**
   * 更新小运表格
   * @param xiaoYun 小运数据
   */
  private updateXiaoYunTable(xiaoYun: any[]) {
    const xiaoYunSection = this.container.querySelector(`.bazi-xiaoyun-section[data-bazi-id="${this.id}"]`);
    if (!xiaoYunSection) return;

    // 获取表格
    const table = xiaoYunSection.querySelector('.bazi-view-xiaoyun-table');
    if (!table) return;

    // 清空表格
    table.empty();

    // 第一行：年份
    const yearRow = table.createEl('tr');
    yearRow.createEl('th', { text: '小运' });
    xiaoYun.slice(0, 10).forEach(xy => {
      yearRow.createEl('td', { text: xy.year.toString() });
    });

    // 第二行：年龄
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    xiaoYun.slice(0, 10).forEach(xy => {
      ageRow.createEl('td', { text: xy.age.toString() });
    });

    // 第三行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    xiaoYun.slice(0, 10).forEach(xy => {
      const cell = gzRow.createEl('td', {
        text: xy.ganZhi,
        cls: 'bazi-xiaoyun-cell',
        attr: { 'data-year': xy.year.toString() }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-xiaoyun-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');
      });
    });
  }

  /**
   * 更新流月表格
   * @param liuYue 流月数据
   */
  private updateLiuYueTable(liuYue: any[]) {
    const liuYueSection = this.container.querySelector(`.bazi-liuyue-section[data-bazi-id="${this.id}"]`);
    if (!liuYueSection) return;

    // 获取表格
    const table = liuYueSection.querySelector('.bazi-view-liuyue-table');
    if (!table) return;

    // 清空表格
    table.empty();

    // 第一行：月份
    const monthRow = table.createEl('tr');
    monthRow.createEl('th', { text: '流月' });
    liuYue.forEach(ly => {
      monthRow.createEl('td', { text: ly.month });
    });

    // 第二行：干支
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '干支' });
    liuYue.forEach(ly => {
      const cell = gzRow.createEl('td', {
        text: ly.ganZhi,
        cls: 'bazi-liuyue-cell',
        attr: { 'data-month': ly.month }
      });

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-liuyue-cell').forEach(c => c.removeClass('selected'));
        cell.addClass('selected');
      });
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
