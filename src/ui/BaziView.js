/**
 * 八字命盘视图组件
 * 用于在笔记中渲染交互式八字命盘
 */
export class BaziView {
    /**
     * 创建八字命盘视图
     * @param container 容器元素
     * @param baziInfo 八字信息
     * @param onSettingsClick 设置按钮点击回调
     */
    constructor(container, baziInfo, onSettingsClick) {
        this.container = container;
        this.baziInfo = baziInfo;
        this.onSettingsClick = onSettingsClick;
        this.id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
        this.render();
    }
    /**
     * 渲染八字命盘
     */
    render() {
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
    createHeader() {
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
    createBasicInfo() {
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
    createBaziTable() {
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
    createWuXingAnalysis() {
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
    createOtherInfo() {
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
    createDaYunInfo() {
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
        daYunData.slice(0, 10).forEach(dy => {
            yearRow.createEl('td', { text: dy.startYear.toString() });
        });
        // 第二行：年龄
        const ageRow = table.createEl('tr');
        ageRow.createEl('th', { text: '年龄' });
        daYunData.slice(0, 10).forEach(dy => {
            ageRow.createEl('td', { text: dy.startAge.toString() });
        });
        // 第三行：干支
        const gzRow = table.createEl('tr');
        gzRow.createEl('th', { text: '干支' });
        daYunData.slice(0, 10).forEach((dy, index) => {
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
    createLiuNianInfo() {
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
    createXiaoYunInfo() {
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
    createLiuYueInfo() {
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
            monthRow.createEl('td', { text: ly.month });
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
    handleDaYunChange(selector) {
        const selectedIndex = parseInt(selector.value);
        this.handleDaYunSelect(selectedIndex);
    }
    /**
     * 处理大运选择
     * @param index 大运索引
     */
    handleDaYunSelect(index) {
        // 获取所有大运、流年、小运和流月数据
        const allDaYun = this.baziInfo.daYun || [];
        const allLiuNian = this.baziInfo.liuNian || [];
        const allXiaoYun = this.baziInfo.xiaoYun || [];
        const allLiuYue = this.baziInfo.liuYue || [];
        // 根据选择的大运索引，筛选对应的流年、小运和流月
        const selectedDaYun = allDaYun[index];
        if (!selectedDaYun)
            return;
        // 筛选该大运对应的流年
        const filteredLiuNian = allLiuNian.filter(ln => {
            return ln.year >= selectedDaYun.startYear && ln.year <= selectedDaYun.endYear;
        });
        // 筛选该大运对应的小运
        const filteredXiaoYun = allXiaoYun.filter(xy => {
            return xy.year >= selectedDaYun.startYear && xy.year <= selectedDaYun.endYear;
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
    handleLiuNianSelect(year) {
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
    updateLiuNianTable(liuNian) {
        const liuNianSection = this.container.querySelector(`.bazi-liunian-section[data-bazi-id="${this.id}"]`);
        if (!liuNianSection)
            return;
        // 获取表格
        const table = liuNianSection.querySelector('.bazi-view-liunian-table');
        if (!table)
            return;
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
    updateXiaoYunTable(xiaoYun) {
        const xiaoYunSection = this.container.querySelector(`.bazi-xiaoyun-section[data-bazi-id="${this.id}"]`);
        if (!xiaoYunSection)
            return;
        // 获取表格
        const table = xiaoYunSection.querySelector('.bazi-view-xiaoyun-table');
        if (!table)
            return;
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
    updateLiuYueTable(liuYue) {
        const liuYueSection = this.container.querySelector(`.bazi-liuyue-section[data-bazi-id="${this.id}"]`);
        if (!liuYueSection)
            return;
        // 获取表格
        const table = liuYueSection.querySelector('.bazi-view-liuyue-table');
        if (!table)
            return;
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
    getWuXingClass(wuxing) {
        const map = {
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
    getHTML() {
        return this.container.innerHTML;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQU1uQjs7Ozs7T0FLRztJQUNILFlBQVksU0FBc0IsRUFBRSxRQUFrQixFQUFFLGVBQTJCO1FBQ2pGLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxFQUFFLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssTUFBTTtRQUNaLE9BQU87UUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZCLE9BQU87UUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFM0MsU0FBUztRQUNULElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixXQUFXO1FBQ1gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZCLFNBQVM7UUFDVCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsU0FBUztRQUNULElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRTVCLFNBQVM7UUFDVCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssWUFBWTtR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QUFFO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDNUIsR0FBRyxFQUFFLFVBQVUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1NBQy9ELENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVM7WUFDN0IsR0FBRyxFQUFFLFVBQVUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1NBQ2hFLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU87WUFDM0IsR0FBRyxFQUFFLFVBQVUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1NBQzlELENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDNUIsR0FBRyxFQUFFLFVBQVUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1NBQy9ELENBQUMsQ0FBQztRQUVILE1BQU07UUFDTixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM3RCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDOUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzVELFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUU3RCxNQUFNO1FBQ04sTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDL0QsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM5RCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFL0QsTUFBTTtRQUNOLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzNELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJ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LENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssY0FBYyxDQUFDLE1BQWM7UUFDbkMsTUFBTSxHQUFHLEdBQTRCO1lBQ25DLEdBQUcsRUFBRSxLQUFLO1lBQ1YsR0FBRyxFQUFFLElBQUk7WUFDVCxHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRSxLQUFLO1lBQ1YsR0FBRyxFQUFFLElBQUk7U0FDVixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7WUFDckIsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNqQjtTQUNGO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDbEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmF6aUluZm8gfSBmcm9tICdzcmMvc2VydmljZXMvQmF6aVNlcnZpY2UnO1xuXG4vKipcbiAqIOWFq+Wtl+WRveebmOinhuWbvue7hOS7tlxuICog55So5LqO5Zyo56yU6K6w5Lit5riy5p+T5Lqk5LqS5byP5YWr5a2X5ZG955uYXG4gKi9cbmV4cG9ydCBjbGFzcyBCYXppVmlldyB7XG4gIHByaXZhdGUgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBiYXppSW5mbzogQmF6aUluZm87XG4gIHByaXZhdGUgb25TZXR0aW5nc0NsaWNrOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWFq+Wtl+WRveebmOinhuWbvlxuICAgKiBAcGFyYW0gY29udGFpbmVyIOWuueWZqOWFg+e0oFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEBwYXJhbSBvblNldHRpbmdzQ2xpY2sg6K6+572u5oyJ6ZKu54K55Ye75Zue6LCDXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBiYXppSW5mbzogQmF6aUluZm8sIG9uU2V0dGluZ3NDbGljazogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuYmF6aUluZm8gPSBiYXppSW5mbztcbiAgICB0aGlzLm9uU2V0dGluZ3NDbGljayA9IG9uU2V0dGluZ3NDbGljaztcbiAgICB0aGlzLmlkID0gJ2Jhemktdmlldy0nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDkpO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmuLLmn5PlhavlrZflkb3nm5hcbiAgICovXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIC8vIOa4heepuuWuueWZqFxuICAgIHRoaXMuY29udGFpbmVyLmVtcHR5KCk7XG5cbiAgICAvLyDmt7vliqDnsbvlkI1cbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDbGFzcygnYmF6aS12aWV3LWNvbnRhaW5lcicpO1xuICAgIHRoaXMuY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaWQnLCB0aGlzLmlkKTtcblxuICAgIC8vIOWIm+W7uuWRveebmOWktOmDqFxuICAgIHRoaXMuY3JlYXRlSGVhZGVyKCk7XG5cbiAgICAvLyDliJvlu7rln7rmnKzkv6Hmga/ljLrln59cbiAgICB0aGlzLmNyZWF0ZUJhc2ljSW5mbygpO1xuXG4gICAgLy8g5Yib5bu65YWr5a2X6KGo5qC8XG4gICAgdGhpcy5jcmVhdGVCYXppVGFibGUoKTtcblxuICAgIC8vIOWIm+W7uuS6lOihjOWIhuaekFxuICAgIHRoaXMuY3JlYXRlV3VYaW5nQW5hbHlzaXMoKTtcblxuICAgIC8vIOWIm+W7uuWFtuS7luS/oeaBr1xuICAgIHRoaXMuY3JlYXRlT3RoZXJJbmZvKCk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65ZG955uY5aS06YOoXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUhlYWRlcigpIHtcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctaGVhZGVyJyB9KTtcblxuICAgIC8vIOagh+mimFxuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICflhavlrZflkb3nm5gnLCBjbHM6ICdiYXppLXZpZXctdGl0bGUnIH0pO1xuXG4gICAgLy8g6K6+572u5oyJ6ZKuXG4gICAgY29uc3Qgc2V0dGluZ3NCdXR0b24gPSBoZWFkZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIGNsczogJ2Jhemktdmlldy1zZXR0aW5ncy1idXR0b24nLFxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICforr7nva4nIH1cbiAgICB9KTtcbiAgICBzZXR0aW5nc0J1dHRvbi5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiPjwvY2lyY2xlPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxelwiPjwvcGF0aD48L3N2Zz4nO1xuXG4gICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgc2V0dGluZ3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMub25TZXR0aW5nc0NsaWNrKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65Z+65pys5L+h5oGv5Yy65Z+fXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhc2ljSW5mbygpIHtcbiAgICBjb25zdCBpbmZvU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktdmlldy1iYXNpYy1pbmZvJyB9KTtcblxuICAgIC8vIOWIm+W7uuS4pOWIl+W4g+WxgFxuICAgIGNvbnN0IGxlZnRDb2wgPSBpbmZvU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctY29sJyB9KTtcbiAgICBjb25zdCByaWdodENvbCA9IGluZm9TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1jb2wnIH0pO1xuXG4gICAgLy8g5bem5L6n77ya5YWs5Y6G5L+h5oGvXG4gICAgbGVmdENvbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg5YWs5Y6G77yaJHt0aGlzLmJhemlJbmZvLnNvbGFyRGF0ZX0gJHt0aGlzLmJhemlJbmZvLnNvbGFyVGltZX1gXG4gICAgfSk7XG5cbiAgICAvLyDlj7PkvqfvvJrlhpzljobkv6Hmga9cbiAgICByaWdodENvbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg5Yac5Y6G77yaJHt0aGlzLmJhemlJbmZvLmx1bmFyRGF0ZX1gXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65YWr5a2X6KGo5qC8XG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhemlUYWJsZSgpIHtcbiAgICBjb25zdCB0YWJsZVNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG5cbiAgICAvLyDliJvlu7rooajmoLxcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2VjdGlvbi5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZScgfSk7XG5cbiAgICAvLyDliJvlu7rooajlpLRcbiAgICBjb25zdCB0aGVhZCA9IHRhYmxlLmNyZWF0ZUVsKCd0aGVhZCcpO1xuICAgIGNvbnN0IGhlYWRlclJvdyA9IHRoZWFkLmNyZWF0ZUVsKCd0cicpO1xuXG4gICAgWyflubTmn7EnLCAn5pyI5p+xJywgJ+aXpeafsScsICfml7bmn7EnXS5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgaGVhZGVyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dCB9KTtcbiAgICB9KTtcblxuICAgIC8vIOWIm+W7uuihqOS9k1xuICAgIGNvbnN0IHRib2R5ID0gdGFibGUuY3JlYXRlRWwoJ3Rib2R5Jyk7XG5cbiAgICAvLyDlpKnlubLooYxcbiAgICBjb25zdCBzdGVtUm93ID0gdGJvZHkuY3JlYXRlRWwoJ3RyJyk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLnllYXJXdVhpbmcpfWBcbiAgICB9KTtcbiAgICBzdGVtUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLm1vbnRoV3VYaW5nKX1gXG4gICAgfSk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVN0ZW0sXG4gICAgICBjbHM6IGB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKHRoaXMuYmF6aUluZm8uZGF5V3VYaW5nKX1gXG4gICAgfSk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLmhvdXJXdVhpbmcpfWBcbiAgICB9KTtcblxuICAgIC8vIOWcsOaUr+ihjFxuICAgIGNvbnN0IGJyYW5jaFJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicpO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ueWVhckJyYW5jaCB9KTtcbiAgICBicmFuY2hSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoQnJhbmNoIH0pO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5QnJhbmNoIH0pO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uaG91ckJyYW5jaCB9KTtcblxuICAgIC8vIOiXj+W5suihjFxuICAgIGNvbnN0IGhpZGVHYW5Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInKTtcbiAgICBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby55ZWFySGlkZUdhbiB9KTtcbiAgICBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4gfSk7XG4gICAgaGlkZUdhblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5SGlkZUdhbiB9KTtcbiAgICBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5ob3VySGlkZUdhbiB9KTtcblxuICAgIC8vIOe6s+mfs+ihjFxuICAgIGNvbnN0IG5hWWluUm93ID0gdGJvZHkuY3JlYXRlRWwoJ3RyJyk7XG4gICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJOYVlpbiB9KTtcbiAgICBuYVlpblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhOYVlpbiB9KTtcbiAgICBuYVlpblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5TmFZaW4gfSk7XG4gICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJOYVlpbiB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rkupTooYzliIbmnpBcbiAgICovXG4gIHByaXZhdGUgY3JlYXRlV3VYaW5nQW5hbHlzaXMoKSB7XG4gICAgY29uc3Qgd3V4aW5nU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uJyB9KTtcbiAgICB3dXhpbmdTZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+S6lOihjOWIhuaekCcsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDov5nph4zlj6/ku6Xmt7vliqDmm7Tor6bnu4bnmoTkupTooYzliIbmnpBcbiAgICAvLyDnroDljJbniYjmnKzvvIzlj6rmmL7npLrlkITkuKrlpKnlubLnmoTkupTooYxcbiAgICBjb25zdCB3dXhpbmdMaXN0ID0gd3V4aW5nU2VjdGlvbi5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXZpZXctd3V4aW5nLWxpc3QnIH0pO1xuXG4gICAgd3V4aW5nTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGAke3RoaXMuYmF6aUluZm8ueWVhclN0ZW19KCR7dGhpcy5iYXppSW5mby55ZWFyV3VYaW5nfSlgLFxuICAgICAgY2xzOiBgd3V4aW5nLXRhZyB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKHRoaXMuYmF6aUluZm8ueWVhcld1WGluZyl9YFxuICAgIH0pO1xuXG4gICAgd3V4aW5nTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGAke3RoaXMuYmF6aUluZm8ubW9udGhTdGVtfSgke3RoaXMuYmF6aUluZm8ubW9udGhXdVhpbmd9KWAsXG4gICAgICBjbHM6IGB3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3ModGhpcy5iYXppSW5mby5tb250aFd1WGluZyl9YFxuICAgIH0pO1xuXG4gICAgd3V4aW5nTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGAke3RoaXMuYmF6aUluZm8uZGF5U3RlbX0oJHt0aGlzLmJhemlJbmZvLmRheVd1WGluZ30pYCxcbiAgICAgIGNsczogYHd1eGluZy10YWcgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLmRheVd1WGluZyl9YFxuICAgIH0pO1xuXG4gICAgd3V4aW5nTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGAke3RoaXMuYmF6aUluZm8uaG91clN0ZW19KCR7dGhpcy5iYXppSW5mby5ob3VyV3VYaW5nfSlgLFxuICAgICAgY2xzOiBgd3V4aW5nLXRhZyB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKHRoaXMuYmF6aUluZm8uaG91cld1WGluZyl9YFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWFtuS7luS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVPdGhlckluZm8oKSB7XG4gICAgY29uc3Qgb3RoZXJTZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24nIH0pO1xuICAgIG90aGVyU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfnibnmrorkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgY29uc3QgaW5mb0xpc3QgPSBvdGhlclNlY3Rpb24uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYmF6aS12aWV3LWluZm8tbGlzdCcgfSk7XG5cbiAgICBpbmZvTGlzdC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg6IOO5YWD77yaJHt0aGlzLmJhemlJbmZvLnRhaVl1YW5977yIJHt0aGlzLmJhemlJbmZvLnRhaVl1YW5OYVlpbn3vvIlgXG4gICAgfSk7XG5cbiAgICBpbmZvTGlzdC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg5ZG95a6r77yaJHt0aGlzLmJhemlJbmZvLm1pbmdHb25nfe+8iCR7dGhpcy5iYXppSW5mby5taW5nR29uZ05hWWlufe+8iWBcbiAgICB9KTtcblxuICAgIC8vIOa3u+WKoOaXrOepuuS/oeaBr1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnllYXJYdW5Lb25nIHx8IHRoaXMuYmF6aUluZm8ubW9udGhYdW5Lb25nIHx8XG4gICAgICAgIHRoaXMuYmF6aUluZm8uZGF5WHVuS29uZyB8fCB0aGlzLmJhemlJbmZvLnRpbWVYdW5Lb25nKSB7XG4gICAgICBjb25zdCB4dW5Lb25nRGl2ID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScgfSk7XG4gICAgICB4dW5Lb25nRGl2LmlubmVySFRNTCA9IGDml6znqbrvvJrlubQoJHt0aGlzLmJhemlJbmZvLnllYXJYdW5Lb25nIHx8ICfml6AnfSkg5pyIKCR7dGhpcy5iYXppSW5mby5tb250aFh1bktvbmcgfHwgJ+aXoCd9KSDml6UoJHt0aGlzLmJhemlJbmZvLmRheVh1bktvbmcgfHwgJ+aXoCd9KSDml7YoJHt0aGlzLmJhemlJbmZvLnRpbWVYdW5Lb25nIHx8ICfml6AnfSlgO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuWkp+i/kOS/oeaBr1xuICAgIHRoaXMuY3JlYXRlRGFZdW5JbmZvKCk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65aSn6L+Q5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZURhWXVuSW5mbygpIHtcbiAgICBpZiAoIXRoaXMuYmF6aUluZm8uZGFZdW4gfHwgdGhpcy5iYXppSW5mby5kYVl1bi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rlpKfov5Dpg6jliIZcbiAgICBjb25zdCBkYVl1blNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG4gICAgZGFZdW5TZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+Wkp+i/kOS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rlpKfov5DooajmoLxcbiAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IGRhWXVuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1kYXl1bi10YWJsZScgfSk7XG5cbiAgICAvLyDojrflj5blpKfov5DmlbDmja5cbiAgICBjb25zdCBkYVl1bkRhdGEgPSB0aGlzLmJhemlJbmZvLmRhWXVuIHx8IFtdO1xuXG4gICAgLy8g56ys5LiA6KGM77ya5bm05Lu9XG4gICAgY29uc3QgeWVhclJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5aSn6L+QJyB9KTtcbiAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgeWVhclJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGR5LnN0YXJ0WWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgZGFZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGR5ID0+IHtcbiAgICAgIGFnZVJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGR5LnN0YXJ0QWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgZGFZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKChkeSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBnelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIHRleHQ6IGR5LmdhblpoaSxcbiAgICAgICAgY2xzOiAnYmF6aS1kYXl1bi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS1pbmRleCc6IGluZGV4LnRvU3RyaW5nKCkgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWRheXVuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5bm044CB5bCP6L+Q5ZKM5rWB5pyIXG4gICAgICAgIHRoaXMuaGFuZGxlRGFZdW5TZWxlY3QoaW5kZXgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rmtYHlubTkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZUxpdU5pYW5JbmZvKCk7XG5cbiAgICAvLyDliJvlu7rlsI/ov5Dkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZVhpYW9ZdW5JbmZvKCk7XG5cbiAgICAvLyDliJvlu7rmtYHmnIjkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZUxpdVl1ZUluZm8oKTtcblxuICAgIC8vIOm7mOiupOmAieS4reesrOS4gOS4quWkp+i/kFxuICAgIGlmICh0aGlzLmJhemlJbmZvLmRhWXVuICYmIHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5oYW5kbGVEYVl1blNlbGVjdCgwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65rWB5bm05L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUxpdU5pYW5JbmZvKCkge1xuICAgIGlmICghdGhpcy5iYXppSW5mby5saXVOaWFuIHx8IHRoaXMuYmF6aUluZm8ubGl1Tmlhbi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rmtYHlubTpg6jliIZcbiAgICBjb25zdCBsaXVOaWFuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktbGl1bmlhbi1zZWN0aW9uJyB9KTtcbiAgICBsaXVOaWFuU2VjdGlvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtYmF6aS1pZCcsIHRoaXMuaWQpO1xuICAgIGxpdU5pYW5TZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+a1geW5tOS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rmtYHlubTooajmoLxcbiAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IGxpdU5pYW5TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIGNvbnN0IHRhYmxlID0gdGFibGVDb250YWluZXIuY3JlYXRlRWwoJ3RhYmxlJywgeyBjbHM6ICdiYXppLXZpZXctdGFibGUgYmF6aS12aWV3LWxpdW5pYW4tdGFibGUnIH0pO1xuXG4gICAgLy8g6I635Y+W5rWB5bm05pWw5o2uXG4gICAgY29uc3QgbGl1TmlhbkRhdGEgPSB0aGlzLmJhemlJbmZvLmxpdU5pYW4gfHwgW107XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubQnIH0pO1xuICAgIGxpdU5pYW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBsbi55ZWFyLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubTpvoRcbiAgICBjb25zdCBhZ2VSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bm06b6EJyB9KTtcbiAgICBsaXVOaWFuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBsbi5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBsaXVOaWFuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBsbi5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1bmlhbi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogbG4ueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIOmrmOS6rumAieS4reeahOWNleWFg+agvFxuICAgICAgICB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXVuaWFuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5pyIXG4gICAgICAgIHRoaXMuaGFuZGxlTGl1TmlhblNlbGVjdChsbi55ZWFyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWwj+i/kOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVYaWFvWXVuSW5mbygpIHtcbiAgICBpZiAoIXRoaXMuYmF6aUluZm8ueGlhb1l1biB8fCB0aGlzLmJhemlJbmZvLnhpYW9ZdW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65bCP6L+Q6YOo5YiGXG4gICAgY29uc3QgeGlhb1l1blNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbiBiYXppLXhpYW95dW4tc2VjdGlvbicgfSk7XG4gICAgeGlhb1l1blNlY3Rpb24uc2V0QXR0cmlidXRlKCdkYXRhLWJhemktaWQnLCB0aGlzLmlkKTtcbiAgICB4aWFvWXVuU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICflsI/ov5Dkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65bCP6L+Q6KGo5qC8XG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSB4aWFvWXVuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy14aWFveXVuLXRhYmxlJyB9KTtcblxuICAgIC8vIOiOt+WPluWwj+i/kOaVsOaNrlxuICAgIGNvbnN0IHhpYW9ZdW5EYXRhID0gdGhpcy5iYXppSW5mby54aWFvWXVuIHx8IFtdO1xuXG4gICAgLy8g56ys5LiA6KGM77ya5bm05Lu9XG4gICAgY29uc3QgeWVhclJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bCP6L+QJyB9KTtcbiAgICB4aWFvWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogeHkueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgeGlhb1l1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goeHkgPT4ge1xuICAgICAgYWdlUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogeHkuYWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgeGlhb1l1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goeHkgPT4ge1xuICAgICAgY29uc3QgY2VsbCA9IGd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgdGV4dDogeHkuZ2FuWmhpLFxuICAgICAgICBjbHM6ICdiYXppLXhpYW95dW4tY2VsbCcsXG4gICAgICAgIGF0dHI6IHsgJ2RhdGEteWVhcic6IHh5LnllYXIudG9TdHJpbmcoKSB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAvLyDpq5jkuq7pgInkuK3nmoTljZXlhYPmoLxcbiAgICAgICAgdGFibGUucXVlcnlTZWxlY3RvckFsbCgnLmJhemkteGlhb3l1bi1jZWxsJykuZm9yRWFjaChjID0+IGMucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykpO1xuICAgICAgICBjZWxsLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65rWB5pyI5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUxpdVl1ZUluZm8oKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmxpdVl1ZSB8fCB0aGlzLmJhemlJbmZvLmxpdVl1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rmtYHmnIjpg6jliIZcbiAgICBjb25zdCBsaXVZdWVTZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24gYmF6aS1saXV5dWUtc2VjdGlvbicgfSk7XG4gICAgbGl1WXVlU2VjdGlvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtYmF6aS1pZCcsIHRoaXMuaWQpO1xuICAgIGxpdVl1ZVNlY3Rpb24uY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAn5rWB5pyI5L+h5oGvJywgY2xzOiAnYmF6aS12aWV3LXN1YnRpdGxlJyB9KTtcblxuICAgIC8vIOWIm+W7uua1geaciOihqOagvFxuICAgIGNvbnN0IHRhYmxlQ29udGFpbmVyID0gbGl1WXVlU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXV5dWUtdGFibGUnIH0pO1xuXG4gICAgLy8g6I635Y+W5rWB5pyI5pWw5o2uXG4gICAgY29uc3QgbGl1WXVlRGF0YSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlIHx8IFtdO1xuXG4gICAgLy8g56ys5LiA6KGM77ya5pyI5Lu9XG4gICAgY29uc3QgbW9udGhSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBtb250aFJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHmnIgnIH0pO1xuICAgIGxpdVl1ZURhdGEuZm9yRWFjaChseSA9PiB7XG4gICAgICBtb250aFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGx5Lm1vbnRoIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bmy5pSvXG4gICAgY29uc3QgZ3pSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBnelJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubLmlK8nIH0pO1xuICAgIGxpdVl1ZURhdGEuZm9yRWFjaChseSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBseS5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1eXVlLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLW1vbnRoJzogbHkubW9udGggfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWxpdXl1ZS1jZWxsJykuZm9yRWFjaChjID0+IGMucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykpO1xuICAgICAgICBjZWxsLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5aSE55CG5aSn6L+Q6YCJ5oup5Y+Y5YyWIC0g5bey5bqf5byD77yM5L2/55SoaGFuZGxlRGFZdW5TZWxlY3Tku6Pmm79cbiAgICogQHBhcmFtIHNlbGVjdG9yIOWkp+i/kOmAieaLqeWZqFxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVEYVl1bkNoYW5nZShzZWxlY3RvcjogSFRNTFNlbGVjdEVsZW1lbnQpIHtcbiAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gcGFyc2VJbnQoc2VsZWN0b3IudmFsdWUpO1xuICAgIHRoaXMuaGFuZGxlRGFZdW5TZWxlY3Qoc2VsZWN0ZWRJbmRleCk7XG4gIH1cblxuICAvKipcbiAgICog5aSE55CG5aSn6L+Q6YCJ5oupXG4gICAqIEBwYXJhbSBpbmRleCDlpKfov5DntKLlvJVcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlRGFZdW5TZWxlY3QoaW5kZXg6IG51bWJlcikge1xuICAgIC8vIOiOt+WPluaJgOacieWkp+i/kOOAgea1geW5tOOAgeWwj+i/kOWSjOa1geaciOaVsOaNrlxuICAgIGNvbnN0IGFsbERhWXVuID0gdGhpcy5iYXppSW5mby5kYVl1biB8fCBbXTtcbiAgICBjb25zdCBhbGxMaXVOaWFuID0gdGhpcy5iYXppSW5mby5saXVOaWFuIHx8IFtdO1xuICAgIGNvbnN0IGFsbFhpYW9ZdW4gPSB0aGlzLmJhemlJbmZvLnhpYW9ZdW4gfHwgW107XG4gICAgY29uc3QgYWxsTGl1WXVlID0gdGhpcy5iYXppSW5mby5saXVZdWUgfHwgW107XG5cbiAgICAvLyDmoLnmja7pgInmi6nnmoTlpKfov5DntKLlvJXvvIznrZvpgInlr7nlupTnmoTmtYHlubTjgIHlsI/ov5DlkozmtYHmnIhcbiAgICBjb25zdCBzZWxlY3RlZERhWXVuID0gYWxsRGFZdW5baW5kZXhdO1xuICAgIGlmICghc2VsZWN0ZWREYVl1bikgcmV0dXJuO1xuXG4gICAgLy8g562b6YCJ6K+l5aSn6L+Q5a+55bqU55qE5rWB5bm0XG4gICAgY29uc3QgZmlsdGVyZWRMaXVOaWFuID0gYWxsTGl1Tmlhbi5maWx0ZXIobG4gPT4ge1xuICAgICAgcmV0dXJuIGxuLnllYXIgPj0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXIgJiYgbG4ueWVhciA8PSBzZWxlY3RlZERhWXVuLmVuZFllYXI7XG4gICAgfSk7XG5cbiAgICAvLyDnrZvpgInor6XlpKfov5Dlr7nlupTnmoTlsI/ov5BcbiAgICBjb25zdCBmaWx0ZXJlZFhpYW9ZdW4gPSBhbGxYaWFvWXVuLmZpbHRlcih4eSA9PiB7XG4gICAgICByZXR1cm4geHkueWVhciA+PSBzZWxlY3RlZERhWXVuLnN0YXJ0WWVhciAmJiB4eS55ZWFyIDw9IHNlbGVjdGVkRGFZdW4uZW5kWWVhcjtcbiAgICB9KTtcblxuICAgIC8vIOabtOaWsOa1geW5tOihqOagvFxuICAgIHRoaXMudXBkYXRlTGl1TmlhblRhYmxlKGZpbHRlcmVkTGl1Tmlhbik7XG5cbiAgICAvLyDmm7TmlrDlsI/ov5DooajmoLxcbiAgICB0aGlzLnVwZGF0ZVhpYW9ZdW5UYWJsZShmaWx0ZXJlZFhpYW9ZdW4pO1xuXG4gICAgLy8g5aaC5p6c5pyJ5rWB5bm077yM5pu05paw5rWB5pyI6KGo5qC877yI5Y+W5omA5pyJ5rWB5pyI77yJXG4gICAgaWYgKGZpbHRlcmVkTGl1Tmlhbi5sZW5ndGggPiAwKSB7XG4gICAgICAvLyDnlLHkuo7mtYHmnIjlr7nosaHmsqHmnIl5ZWFy5bGe5oCn77yM5oiR5Lus55u05o6l5L2/55So5omA5pyJ5rWB5pyI5pWw5o2uXG4gICAgICB0aGlzLnVwZGF0ZUxpdVl1ZVRhYmxlKGFsbExpdVl1ZSk7XG4gICAgfVxuXG4gICAgLy8g6auY5Lqu6YCJ5Lit55qE5aSn6L+Q6KGMXG4gICAgY29uc3QgZGFZdW5UYWJsZSA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctZGF5dW4tdGFibGUnKTtcbiAgICBpZiAoZGFZdW5UYWJsZSkge1xuICAgICAgY29uc3Qgcm93cyA9IGRhWXVuVGFibGUucXVlcnlTZWxlY3RvckFsbCgndGJvZHkgdHInKTtcbiAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4gcm93LnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpKTtcbiAgICAgIGNvbnN0IHNlbGVjdGVkUm93ID0gZGFZdW5UYWJsZS5xdWVyeVNlbGVjdG9yKGB0Ym9keSB0cltkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKTtcbiAgICAgIGlmIChzZWxlY3RlZFJvdykge1xuICAgICAgICBzZWxlY3RlZFJvdy5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5aSE55CG5rWB5bm06YCJ5oupXG4gICAqIEBwYXJhbSB5ZWFyIOa1geW5tOW5tOS7vVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVMaXVOaWFuU2VsZWN0KHllYXI6IG51bWJlcikge1xuICAgIC8vIOiOt+WPluaJgOaciea1geaciOaVsOaNrlxuICAgIGNvbnN0IGFsbExpdVl1ZSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlIHx8IFtdO1xuXG4gICAgLy8g55Sx5LqO5rWB5pyI5a+56LGh5rKh5pyJeWVhcuWxnuaAp++8jOaIkeS7rOebtOaOpeS9v+eUqOaJgOaciea1geaciOaVsOaNrlxuICAgIC8vIOWcqOWunumZheW6lOeUqOS4re+8jOWPr+iDvemcgOimgeagueaNruWFtuS7luWxnuaAp+adpeetm+mAiea1geaciFxuICAgIHRoaXMudXBkYXRlTGl1WXVlVGFibGUoYWxsTGl1WXVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmm7TmlrDmtYHlubTooajmoLxcbiAgICogQHBhcmFtIGxpdU5pYW4g5rWB5bm05pWw5o2uXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZUxpdU5pYW5UYWJsZShsaXVOaWFuOiBhbnlbXSkge1xuICAgIGNvbnN0IGxpdU5pYW5TZWN0aW9uID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgLmJhemktbGl1bmlhbi1zZWN0aW9uW2RhdGEtYmF6aS1pZD1cIiR7dGhpcy5pZH1cIl1gKTtcbiAgICBpZiAoIWxpdU5pYW5TZWN0aW9uKSByZXR1cm47XG5cbiAgICAvLyDojrflj5booajmoLxcbiAgICBjb25zdCB0YWJsZSA9IGxpdU5pYW5TZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctbGl1bmlhbi10YWJsZScpO1xuICAgIGlmICghdGFibGUpIHJldHVybjtcblxuICAgIC8vIOa4heepuuihqOagvFxuICAgIHRhYmxlLmVtcHR5KCk7XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubQnIH0pO1xuICAgIGxpdU5pYW4uc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgeWVhclJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGxuLnllYXIudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS6jOihjO+8muW5tOm+hFxuICAgIGNvbnN0IGFnZVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGFnZVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubTpvoQnIH0pO1xuICAgIGxpdU5pYW4uc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgYWdlUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4uYWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBsbi5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1bmlhbi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogbG4ueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIOmrmOS6rumAieS4reeahOWNleWFg+agvFxuICAgICAgICB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXVuaWFuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5pyIXG4gICAgICAgIHRoaXMuaGFuZGxlTGl1TmlhblNlbGVjdChsbi55ZWFyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOWwj+i/kOihqOagvFxuICAgKiBAcGFyYW0geGlhb1l1biDlsI/ov5DmlbDmja5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlWGlhb1l1blRhYmxlKHhpYW9ZdW46IGFueVtdKSB7XG4gICAgY29uc3QgeGlhb1l1blNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuYmF6aS14aWFveXVuLXNlY3Rpb25bZGF0YS1iYXppLWlkPVwiJHt0aGlzLmlkfVwiXWApO1xuICAgIGlmICgheGlhb1l1blNlY3Rpb24pIHJldHVybjtcblxuICAgIC8vIOiOt+WPluihqOagvFxuICAgIGNvbnN0IHRhYmxlID0geGlhb1l1blNlY3Rpb24ucXVlcnlTZWxlY3RvcignLmJhemktdmlldy14aWFveXVuLXRhYmxlJyk7XG4gICAgaWYgKCF0YWJsZSkgcmV0dXJuO1xuXG4gICAgLy8g5riF56m66KGo5qC8XG4gICAgdGFibGUuZW1wdHkoKTtcblxuICAgIC8vIOesrOS4gOihjO+8muW5tOS7vVxuICAgIGNvbnN0IHllYXJSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+Wwj+i/kCcgfSk7XG4gICAgeGlhb1l1bi5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogeHkueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgeGlhb1l1bi5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB4eS5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICB4aWFvWXVuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKHh5ID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBnelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIHRleHQ6IHh5LmdhblpoaSxcbiAgICAgICAgY2xzOiAnYmF6aS14aWFveXVuLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLXllYXInOiB4eS55ZWFyLnRvU3RyaW5nKCkgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLXhpYW95dW4tY2VsbCcpLmZvckVhY2goYyA9PiBjLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpKTtcbiAgICAgICAgY2VsbC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOa1geaciOihqOagvFxuICAgKiBAcGFyYW0gbGl1WXVlIOa1geaciOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVZdWVUYWJsZShsaXVZdWU6IGFueVtdKSB7XG4gICAgY29uc3QgbGl1WXVlU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5iYXppLWxpdXl1ZS1zZWN0aW9uW2RhdGEtYmF6aS1pZD1cIiR7dGhpcy5pZH1cIl1gKTtcbiAgICBpZiAoIWxpdVl1ZVNlY3Rpb24pIHJldHVybjtcblxuICAgIC8vIOiOt+WPluihqOagvFxuICAgIGNvbnN0IHRhYmxlID0gbGl1WXVlU2VjdGlvbi5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LWxpdXl1ZS10YWJsZScpO1xuICAgIGlmICghdGFibGUpIHJldHVybjtcblxuICAgIC8vIOa4heepuuihqOagvFxuICAgIHRhYmxlLmVtcHR5KCk7XG5cbiAgICAvLyDnrKzkuIDooYzvvJrmnIjku71cbiAgICBjb25zdCBtb250aFJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIG1vbnRoUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+a1geaciCcgfSk7XG4gICAgbGl1WXVlLmZvckVhY2gobHkgPT4ge1xuICAgICAgbW9udGhSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBseS5tb250aCB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS6jOihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBseS5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1eXVlLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLW1vbnRoJzogbHkubW9udGggfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWxpdXl1ZS1jZWxsJykuZm9yRWFjaChjID0+IGMucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykpO1xuICAgICAgICBjZWxsLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LqU6KGM5a+55bqU55qEQ1NT57G75ZCNXG4gICAqIEBwYXJhbSB3dXhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIENTU+exu+WQjVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdDbGFzcyh3dXhpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfph5EnOiAnamluJyxcbiAgICAgICfmnKgnOiAnbXUnLFxuICAgICAgJ+awtCc6ICdzaHVpJyxcbiAgICAgICfngasnOiAnaHVvJyxcbiAgICAgICflnJ8nOiAndHUnXG4gICAgfTtcblxuICAgIGZvciAoY29uc3Qga2V5IGluIG1hcCkge1xuICAgICAgaWYgKHd1eGluZy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIHJldHVybiBtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6KeG5Zu+55qESFRNTOWGheWuuVxuICAgKiBAcmV0dXJucyBIVE1M5a2X56ym5LiyXG4gICAqL1xuICBnZXRIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmlubmVySFRNTDtcbiAgfVxufVxuIl19