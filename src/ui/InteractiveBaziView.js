import { ShenShaService } from '../services/ShenShaService';
import { WuXingService } from '../services/WuXingService';
/**
 * 交互式八字命盘视图
 * 使用JavaScript实现更丰富的互动效果
 */
export class InteractiveBaziView {
    /**
     * 构造函数
     * @param container 容器元素
     * @param baziInfo 八字信息
     * @param id 唯一ID
     */
    constructor(container, baziInfo, id) {
        // 当前选中的大运、流年索引
        this.selectedDaYunIndex = 0;
        this.selectedLiuNianYear = 0;
        // 表格元素引用
        this.daYunTable = null;
        this.liuNianTable = null;
        this.xiaoYunTable = null;
        this.liuYueTable = null;
        // 动画相关
        this.animationDuration = 300; // 毫秒
        this.container = container;
        this.baziInfo = baziInfo;
        this.id = id;
        // 初始化视图
        this.initView();
    }
    /**
     * 初始化视图
     */
    initView() {
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
        // 添加表格单元格监听器
        this.addTableCellListeners();
        // 默认选中第一个大运
        if (this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
            this.selectDaYun(0);
        }
    }
    /**
     * 添加表格单元格监听器
     */
    addTableCellListeners() {
        // 添加神煞点击事件
        const shenShaElements = this.container.querySelectorAll('.shensha-tag:not(.rizhu-clickable)');
        shenShaElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const shenSha = element.textContent;
                if (shenSha) {
                    this.showShenShaExplanation(shenSha);
                }
            });
        });
        // 添加日主旺衰点击事件
        const riZhuElements = this.container.querySelectorAll('.rizhu-clickable');
        riZhuElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('日主旺衰标签被点击（表格中）');
                const riZhu = element.getAttribute('data-rizhu');
                const wuXing = element.getAttribute('data-wuxing');
                if (riZhu && wuXing) {
                    this.showRiZhuExplanation(riZhu, wuXing);
                }
            });
        });
    }
    /**
     * 创建标题和设置按钮
     */
    createHeader() {
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
    createBaziTable() {
        const tableSection = this.container.createDiv({ cls: 'bazi-view-section' });
        // 移除重复的标题
        // 添加基本信息（公历、农历、性别）
        const basicInfoDiv = tableSection.createDiv({ cls: 'bazi-basic-info' });
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
        // 创建表格
        const table = tableSection.createEl('table', { cls: 'bazi-view-table' });
        // 创建表头
        const thead = table.createEl('thead');
        const headerRow = thead.createEl('tr');
        // 添加左侧标题栏
        headerRow.createEl('th', { text: '信息', cls: 'bazi-table-label' });
        // 添加四柱表头
        ['年柱', '月柱', '日柱', '时柱'].forEach(text => {
            headerRow.createEl('th', { text });
        });
        // 创建表体
        const tbody = table.createEl('tbody');
        // 天干行
        const stemRow = tbody.createEl('tr', { cls: 'bazi-stem-row' });
        stemRow.createEl('td', { text: '天干', cls: 'bazi-table-label' });
        // 天干行 - 直接在td元素上设置颜色
        const yearStemCell = stemRow.createEl('td', { text: this.baziInfo.yearStem || '' });
        this.applyStemWuXingColor(yearStemCell, this.baziInfo.yearStem || '');
        const monthStemCell = stemRow.createEl('td', { text: this.baziInfo.monthStem || '' });
        this.applyStemWuXingColor(monthStemCell, this.baziInfo.monthStem || '');
        const dayStemCell = stemRow.createEl('td', { text: this.baziInfo.dayStem || '' });
        this.applyStemWuXingColor(dayStemCell, this.baziInfo.dayStem || '');
        const hourStemCell = stemRow.createEl('td', { text: this.baziInfo.hourStem || '' });
        this.applyStemWuXingColor(hourStemCell, this.baziInfo.hourStem || '');
        // 地支行
        const branchRow = tbody.createEl('tr', { cls: 'bazi-branch-row' });
        branchRow.createEl('td', { text: '地支', cls: 'bazi-table-label' });
        // 地支行 - 直接在td元素上设置颜色
        const yearBranchCell = branchRow.createEl('td', { text: this.baziInfo.yearBranch || '' });
        this.applyBranchWuXingColor(yearBranchCell, this.baziInfo.yearBranch || '');
        const monthBranchCell = branchRow.createEl('td', { text: this.baziInfo.monthBranch || '' });
        this.applyBranchWuXingColor(monthBranchCell, this.baziInfo.monthBranch || '');
        const dayBranchCell = branchRow.createEl('td', { text: this.baziInfo.dayBranch || '' });
        this.applyBranchWuXingColor(dayBranchCell, this.baziInfo.dayBranch || '');
        const hourBranchCell = branchRow.createEl('td', { text: this.baziInfo.hourBranch || '' });
        this.applyBranchWuXingColor(hourBranchCell, this.baziInfo.hourBranch || '');
        // 藏干行
        const hideGanRow = tbody.createEl('tr', { cls: 'bazi-hidegan-row' });
        hideGanRow.createEl('td', { text: '藏干', cls: 'bazi-table-label' });
        // 年柱藏干
        const yearHideGanText = Array.isArray(this.baziInfo.yearHideGan) ? this.baziInfo.yearHideGan.join('') : (this.baziInfo.yearHideGan || '');
        const yearHideGanCell = hideGanRow.createEl('td');
        this.createColoredHideGan(yearHideGanCell, yearHideGanText);
        // 月柱藏干
        const monthHideGanText = Array.isArray(this.baziInfo.monthHideGan) ? this.baziInfo.monthHideGan.join('') : (this.baziInfo.monthHideGan || '');
        const monthHideGanCell = hideGanRow.createEl('td');
        this.createColoredHideGan(monthHideGanCell, monthHideGanText);
        // 日柱藏干
        const dayHideGanText = Array.isArray(this.baziInfo.dayHideGan) ? this.baziInfo.dayHideGan.join('') : (this.baziInfo.dayHideGan || '');
        const dayHideGanCell = hideGanRow.createEl('td');
        this.createColoredHideGan(dayHideGanCell, dayHideGanText);
        // 时柱藏干
        const hourHideGanText = Array.isArray(this.baziInfo.hourHideGan) ? this.baziInfo.hourHideGan.join('') : (this.baziInfo.hourHideGan || '');
        const hourHideGanCell = hideGanRow.createEl('td');
        this.createColoredHideGan(hourHideGanCell, hourHideGanText);
        // 十神行
        const shiShenRow = tbody.createEl('tr', { cls: 'bazi-shishen-row' });
        shiShenRow.createEl('td', { text: '十神', cls: 'bazi-table-label' });
        // 年柱十神
        const yearShiShenCell = shiShenRow.createEl('td');
        if (this.baziInfo.yearShiShenGan) {
            yearShiShenCell.createSpan({
                text: this.baziInfo.yearShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 月柱十神
        const monthShiShenCell = shiShenRow.createEl('td');
        if (this.baziInfo.monthShiShenGan) {
            monthShiShenCell.createSpan({
                text: this.baziInfo.monthShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 日柱十神
        const dayShiShenCell = shiShenRow.createEl('td');
        dayShiShenCell.createSpan({
            text: '日主',
            cls: 'shishen-tag-small'
        });
        // 时柱十神
        const timeShiShenCell = shiShenRow.createEl('td');
        if (this.baziInfo.timeShiShenGan) {
            timeShiShenCell.createSpan({
                text: this.baziInfo.timeShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 地势行
        const diShiRow = tbody.createEl('tr', { cls: 'bazi-dishi-row' });
        diShiRow.createEl('td', { text: '地势', cls: 'bazi-table-label' });
        // 年柱地势
        const yearDiShiCell = diShiRow.createEl('td');
        if (this.baziInfo.yearDiShi) {
            yearDiShiCell.createSpan({
                text: this.baziInfo.yearDiShi,
                cls: 'dishi-tag-small'
            });
        }
        // 月柱地势
        const monthDiShiCell = diShiRow.createEl('td');
        if (this.baziInfo.monthDiShi) {
            monthDiShiCell.createSpan({
                text: this.baziInfo.monthDiShi,
                cls: 'dishi-tag-small'
            });
        }
        // 日柱地势
        const dayDiShiCell = diShiRow.createEl('td');
        if (this.baziInfo.dayDiShi) {
            dayDiShiCell.createSpan({
                text: this.baziInfo.dayDiShi,
                cls: 'dishi-tag-small'
            });
        }
        // 时柱地势
        const timeDiShiCell = diShiRow.createEl('td');
        if (this.baziInfo.timeDiShi) {
            timeDiShiCell.createSpan({
                text: this.baziInfo.timeDiShi,
                cls: 'dishi-tag-small'
            });
        }
        // 纳音行
        const naYinRow = tbody.createEl('tr', { cls: 'bazi-nayin-row' });
        naYinRow.createEl('td', { text: '纳音', cls: 'bazi-table-label' });
        // 年柱纳音
        const yearNaYin = this.baziInfo.yearNaYin || '';
        const yearNaYinCell = naYinRow.createEl('td');
        if (yearNaYin) {
            // 提取五行属性（通常纳音格式为"XX五行"，如"金箔金"）
            const wuXing = this.extractWuXingFromNaYin(yearNaYin);
            const yearNaYinSpan = yearNaYinCell.createSpan({ text: yearNaYin });
            this.setWuXingColorDirectly(yearNaYinSpan, wuXing);
        }
        // 月柱纳音
        const monthNaYin = this.baziInfo.monthNaYin || '';
        const monthNaYinCell = naYinRow.createEl('td');
        if (monthNaYin) {
            const wuXing = this.extractWuXingFromNaYin(monthNaYin);
            const monthNaYinSpan = monthNaYinCell.createSpan({ text: monthNaYin });
            this.setWuXingColorDirectly(monthNaYinSpan, wuXing);
        }
        // 日柱纳音
        const dayNaYin = this.baziInfo.dayNaYin || '';
        const dayNaYinCell = naYinRow.createEl('td');
        if (dayNaYin) {
            const wuXing = this.extractWuXingFromNaYin(dayNaYin);
            const dayNaYinSpan = dayNaYinCell.createSpan({ text: dayNaYin });
            this.setWuXingColorDirectly(dayNaYinSpan, wuXing);
        }
        // 时柱纳音
        const hourNaYin = this.baziInfo.hourNaYin || '';
        const hourNaYinCell = naYinRow.createEl('td');
        if (hourNaYin) {
            const wuXing = this.extractWuXingFromNaYin(hourNaYin);
            const hourNaYinSpan = hourNaYinCell.createSpan({ text: hourNaYin });
            this.setWuXingColorDirectly(hourNaYinSpan, wuXing);
        }
        // 旬空行
        const xunKongRow = tbody.createEl('tr', { cls: 'bazi-xunkong-row' });
        xunKongRow.createEl('td', { text: '旬空', cls: 'bazi-table-label' });
        // 年柱旬空
        const yearXunKongCell = xunKongRow.createEl('td');
        if (this.baziInfo.yearXunKong) {
            yearXunKongCell.createSpan({
                text: this.baziInfo.yearXunKong,
                cls: 'xunkong-tag-small'
            });
        }
        // 月柱旬空
        const monthXunKongCell = xunKongRow.createEl('td');
        if (this.baziInfo.monthXunKong) {
            monthXunKongCell.createSpan({
                text: this.baziInfo.monthXunKong,
                cls: 'xunkong-tag-small'
            });
        }
        // 日柱旬空
        const dayXunKongCell = xunKongRow.createEl('td');
        if (this.baziInfo.dayXunKong) {
            dayXunKongCell.createSpan({
                text: this.baziInfo.dayXunKong,
                cls: 'xunkong-tag-small'
            });
        }
        // 时柱旬空
        const hourXunKongCell = xunKongRow.createEl('td');
        if (this.baziInfo.hourXunKong) {
            hourXunKongCell.createSpan({
                text: this.baziInfo.hourXunKong,
                cls: 'xunkong-tag-small'
            });
        }
        // 生肖行
        const shengXiaoRow = tbody.createEl('tr', { cls: 'bazi-shengxiao-row' });
        shengXiaoRow.createEl('td', { text: '生肖', cls: 'bazi-table-label' });
        shengXiaoRow.createEl('td', { text: this.baziInfo.yearShengXiao || '' });
        shengXiaoRow.createEl('td', { text: this.baziInfo.monthShengXiao || '' });
        shengXiaoRow.createEl('td', { text: this.baziInfo.dayShengXiao || '' });
        shengXiaoRow.createEl('td', { text: this.baziInfo.hourShengXiao || '' });
        // 创建神煞行
        if (this.baziInfo.shenSha && this.baziInfo.shenSha.length > 0) {
            // 按柱位分组神煞
            const yearShenSha = [];
            const monthShenSha = [];
            const dayShenSha = [];
            const hourShenSha = [];
            this.baziInfo.shenSha.forEach(shenSha => {
                if (shenSha.startsWith('年柱:')) {
                    yearShenSha.push(shenSha.substring(3));
                }
                else if (shenSha.startsWith('月柱:')) {
                    monthShenSha.push(shenSha.substring(3));
                }
                else if (shenSha.startsWith('日柱:')) {
                    dayShenSha.push(shenSha.substring(3));
                }
                else if (shenSha.startsWith('时柱:')) {
                    hourShenSha.push(shenSha.substring(3));
                }
            });
            // 如果有任何柱位有神煞，创建神煞行
            if (yearShenSha.length > 0 || monthShenSha.length > 0 ||
                dayShenSha.length > 0 || hourShenSha.length > 0) {
                // 创建神煞行
                const shenShaRow = tbody.createEl('tr');
                shenShaRow.createEl('td', { text: '神煞', cls: 'bazi-table-label' });
                // 年柱神煞单元格
                const yearCell = shenShaRow.createEl('td');
                if (yearShenSha.length > 0) {
                    yearShenSha.forEach(shenSha => {
                        const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                        const type = (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.type) || '未知';
                        let cssClass = '';
                        if (type === '吉神') {
                            cssClass = 'shensha-good';
                        }
                        else if (type === '凶神') {
                            cssClass = 'shensha-bad';
                        }
                        else if (type === '吉凶神') {
                            cssClass = 'shensha-mixed';
                        }
                        const span = yearCell.createSpan({
                            text: shenSha,
                            cls: cssClass,
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.explanation) || '' }
                        });
                        span.addEventListener('click', () => {
                            this.showShenShaExplanation(shenSha);
                        });
                        // 添加空格分隔
                        yearCell.createSpan({ text: ' ' });
                    });
                }
                else {
                    yearCell.textContent = '无';
                }
                // 月柱神煞单元格
                const monthCell = shenShaRow.createEl('td');
                if (monthShenSha.length > 0) {
                    monthShenSha.forEach(shenSha => {
                        const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                        const type = (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.type) || '未知';
                        let cssClass = '';
                        if (type === '吉神') {
                            cssClass = 'shensha-good';
                        }
                        else if (type === '凶神') {
                            cssClass = 'shensha-bad';
                        }
                        else if (type === '吉凶神') {
                            cssClass = 'shensha-mixed';
                        }
                        const span = monthCell.createSpan({
                            text: shenSha,
                            cls: cssClass,
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.explanation) || '' }
                        });
                        span.addEventListener('click', () => {
                            this.showShenShaExplanation(shenSha);
                        });
                        // 添加空格分隔
                        monthCell.createSpan({ text: ' ' });
                    });
                }
                else {
                    monthCell.textContent = '无';
                }
                // 日柱神煞单元格
                const dayCell = shenShaRow.createEl('td');
                if (dayShenSha.length > 0) {
                    dayShenSha.forEach(shenSha => {
                        const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                        const type = (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.type) || '未知';
                        let cssClass = '';
                        if (type === '吉神') {
                            cssClass = 'shensha-good';
                        }
                        else if (type === '凶神') {
                            cssClass = 'shensha-bad';
                        }
                        else if (type === '吉凶神') {
                            cssClass = 'shensha-mixed';
                        }
                        const span = dayCell.createSpan({
                            text: shenSha,
                            cls: cssClass,
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.explanation) || '' }
                        });
                        span.addEventListener('click', () => {
                            this.showShenShaExplanation(shenSha);
                        });
                        // 添加空格分隔
                        dayCell.createSpan({ text: ' ' });
                    });
                }
                else {
                    dayCell.textContent = '无';
                }
                // 时柱神煞单元格
                const hourCell = shenShaRow.createEl('td');
                if (hourShenSha.length > 0) {
                    hourShenSha.forEach(shenSha => {
                        const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                        const type = (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.type) || '未知';
                        let cssClass = '';
                        if (type === '吉神') {
                            cssClass = 'shensha-good';
                        }
                        else if (type === '凶神') {
                            cssClass = 'shensha-bad';
                        }
                        else if (type === '吉凶神') {
                            cssClass = 'shensha-mixed';
                        }
                        const span = hourCell.createSpan({
                            text: shenSha,
                            cls: cssClass,
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.explanation) || '' }
                        });
                        span.addEventListener('click', () => {
                            this.showShenShaExplanation(shenSha);
                        });
                        // 添加空格分隔
                        hourCell.createSpan({ text: ' ' });
                    });
                }
                else {
                    hourCell.textContent = '无';
                }
            }
        }
        // 移除特殊信息区域中的神煞组合分析，因为已经在命盘表格中显示了
    }
    /**
     * 创建特殊信息
     */
    createSpecialInfo() {
        // 创建特殊信息部分
        const specialSection = this.container.createDiv({ cls: 'bazi-view-section' });
        specialSection.createEl('h4', { text: '特殊信息', cls: 'bazi-view-subtitle' });
        // 创建特殊信息列表
        const infoList = specialSection.createEl('ul', { cls: 'bazi-view-info-list' });
        // 添加特殊信息项
        if (this.baziInfo.taiYuan) {
            const taiYuanItem = infoList.createEl('li');
            taiYuanItem.createSpan({ text: '胎元: ' });
            // 提取天干地支
            if (this.baziInfo.taiYuan.length >= 2) {
                const stem = this.baziInfo.taiYuan[0];
                const branch = this.baziInfo.taiYuan[1];
                // 创建天干元素并设置五行颜色
                const stemSpan = taiYuanItem.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = taiYuanItem.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                taiYuanItem.createSpan({ text: this.baziInfo.taiYuan });
            }
        }
        if (this.baziInfo.mingGong) {
            const mingGongItem = infoList.createEl('li');
            mingGongItem.createSpan({ text: '命宫: ' });
            // 提取天干地支
            if (this.baziInfo.mingGong.length >= 2) {
                const stem = this.baziInfo.mingGong[0];
                const branch = this.baziInfo.mingGong[1];
                // 创建天干元素并设置五行颜色
                const stemSpan = mingGongItem.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = mingGongItem.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                mingGongItem.createSpan({ text: this.baziInfo.mingGong });
            }
        }
        if (this.baziInfo.shenGong) {
            const shenGongItem = infoList.createEl('li');
            shenGongItem.createSpan({ text: '身宫: ' });
            // 提取天干地支
            if (this.baziInfo.shenGong.length >= 2) {
                const stem = this.baziInfo.shenGong[0];
                const branch = this.baziInfo.shenGong[1];
                // 创建天干元素并设置五行颜色
                const stemSpan = shenGongItem.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = shenGongItem.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                shenGongItem.createSpan({ text: this.baziInfo.shenGong });
            }
        }
        // 添加格局信息
        if (this.baziInfo.geJu) {
            const geJuItem = infoList.createEl('li');
            geJuItem.createSpan({
                text: `格局: ${this.baziInfo.geJu}`,
                cls: 'geju-tag'
            });
            if (this.baziInfo.geJuDetail) {
                geJuItem.createSpan({
                    text: ` (${this.baziInfo.geJuDetail})`,
                    cls: 'geju-detail'
                });
            }
        }
        // 添加神煞信息
        this.addShenShaInfo(infoList);
        // 添加神煞组合分析 - 移到特殊信息区域
        if (this.baziInfo.shenSha && this.baziInfo.shenSha.length > 1) {
            const combinations = ShenShaService.getShenShaCombinationAnalysis(this.baziInfo.shenSha);
            if (combinations.length > 0) {
                const combinationItem = infoList.createEl('li', { cls: 'shensha-combination-item' });
                combinationItem.createSpan({ text: '神煞组合: ' });
                const combinationContainer = combinationItem.createDiv({ cls: 'shensha-combination-container' });
                combinations.forEach(combination => {
                    const combinationTag = combinationContainer.createDiv({ cls: 'shensha-combination-tag' });
                    combinationTag.createSpan({ text: combination.combination });
                    // 添加点击事件，显示组合分析
                    combinationTag.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showShenShaCombinationAnalysis(combination);
                    });
                });
            }
        }
        // 旬空信息已移至命盘表格中
        // 添加五行强度信息
        if (this.baziInfo.wuXingStrength) {
            const wuXingItem = infoList.createEl('li');
            wuXingItem.createSpan({ text: '五行强度: ' });
            const { jin, mu, shui, huo, tu } = this.baziInfo.wuXingStrength;
            // 金
            const jinSpan = wuXingItem.createSpan({
                text: `金(${jin.toFixed(1)})`,
                cls: 'wuxing-jin-tag wuxing-clickable'
            });
            this.setWuXingColorDirectly(jinSpan, '金');
            jinSpan.addEventListener('click', () => {
                this.showWuXingExplanation('金', jin.toFixed(1));
            });
            // 添加空格分隔
            wuXingItem.createSpan({ text: ' ' });
            // 木
            const muSpan = wuXingItem.createSpan({
                text: `木(${mu.toFixed(1)})`,
                cls: 'wuxing-mu-tag wuxing-clickable'
            });
            this.setWuXingColorDirectly(muSpan, '木');
            muSpan.addEventListener('click', () => {
                this.showWuXingExplanation('木', mu.toFixed(1));
            });
            // 添加空格分隔
            wuXingItem.createSpan({ text: ' ' });
            // 水
            const shuiSpan = wuXingItem.createSpan({
                text: `水(${shui.toFixed(1)})`,
                cls: 'wuxing-shui-tag wuxing-clickable'
            });
            this.setWuXingColorDirectly(shuiSpan, '水');
            shuiSpan.addEventListener('click', () => {
                this.showWuXingExplanation('水', shui.toFixed(1));
            });
            // 添加空格分隔
            wuXingItem.createSpan({ text: ' ' });
            // 火
            const huoSpan = wuXingItem.createSpan({
                text: `火(${huo.toFixed(1)})`,
                cls: 'wuxing-huo-tag wuxing-clickable'
            });
            this.setWuXingColorDirectly(huoSpan, '火');
            huoSpan.addEventListener('click', () => {
                this.showWuXingExplanation('火', huo.toFixed(1));
            });
            // 添加空格分隔
            wuXingItem.createSpan({ text: ' ' });
            // 土
            const tuSpan = wuXingItem.createSpan({
                text: `土(${tu.toFixed(1)})`,
                cls: 'wuxing-tu-tag wuxing-clickable'
            });
            this.setWuXingColorDirectly(tuSpan, '土');
            tuSpan.addEventListener('click', () => {
                this.showWuXingExplanation('土', tu.toFixed(1));
            });
        }
        // 添加日主旺衰信息
        if (this.baziInfo.riZhuStrength) {
            const riZhuItem = infoList.createEl('li');
            riZhuItem.createSpan({ text: '日主旺衰: ' });
            const dayWuXing = this.baziInfo.dayWuXing || '土'; // 默认为土
            const wuXingClass = this.getWuXingClassFromName(dayWuXing);
            const riZhuSpan = riZhuItem.createSpan({
                text: this.baziInfo.riZhuStrength,
                cls: `rizhu-strength rizhu-clickable wuxing-${wuXingClass}`,
                attr: {
                    'data-rizhu': this.baziInfo.riZhuStrength,
                    'data-wuxing': dayWuXing
                }
            });
            // 不在这里添加点击事件监听器，而是在 addTableCellListeners 方法中统一添加
        }
        // 公历、农历、性别信息已移至命盘表格前
    }
    /**
     * 创建大运信息
     */
    createDaYunInfo() {
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
                cls: 'bazi-dayun-cell',
                attr: { 'data-index': index.toString() }
            });
            // 如果有干支，按五行颜色显示
            if (dy.ganZhi && dy.ganZhi.length >= 2) {
                const stem = dy.ganZhi[0]; // 天干
                const branch = dy.ganZhi[1]; // 地支
                // 创建天干元素并设置五行颜色
                const stemSpan = cell.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = cell.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                // 如果没有干支或格式不正确，直接显示原文本
                cell.textContent = dy.ganZhi || '';
            }
            // 添加点击事件
            cell.addEventListener('click', () => {
                this.selectDaYun(index);
            });
            // 如果是当前选中的大运，添加选中样式
            if (index === this.selectedDaYunIndex) {
                cell.classList.add('selected');
            }
        });
        // 第四行：十神（如果有）
        if (daYunData.some(dy => dy.shiShenGan)) {
            const shiShenRow = this.daYunTable.createEl('tr');
            shiShenRow.createEl('th', { text: '十神' });
            daYunData.slice(0, 10).forEach(dy => {
                shiShenRow.createEl('td', {
                    text: dy.shiShenGan || '',
                    cls: 'bazi-shishen-cell'
                });
            });
        }
        // 第五行：地势（如果有）
        if (daYunData.some(dy => dy.diShi)) {
            const diShiRow = this.daYunTable.createEl('tr');
            diShiRow.createEl('th', { text: '地势' });
            daYunData.slice(0, 10).forEach(dy => {
                diShiRow.createEl('td', {
                    text: dy.diShi || '',
                    cls: 'bazi-dishi-cell'
                });
            });
        }
        // 第六行：旬空
        if (daYunData.some(dy => dy.xunKong)) {
            const xkRow = this.daYunTable.createEl('tr');
            xkRow.createEl('th', { text: '旬空' });
            daYunData.slice(0, 10).forEach(dy => {
                const cell = xkRow.createEl('td', {
                    cls: 'bazi-xunkong-cell'
                });
                // 如果有旬空，按五行颜色显示
                if (dy.xunKong && dy.xunKong.length >= 2) {
                    const xk1 = dy.xunKong[0]; // 第一个旬空地支
                    const xk2 = dy.xunKong[1]; // 第二个旬空地支
                    // 创建第一个旬空地支元素并设置五行颜色
                    const xk1Span = cell.createSpan({ text: xk1 });
                    this.setWuXingColorDirectly(xk1Span, this.getBranchWuXing(xk1));
                    // 创建第二个旬空地支元素并设置五行颜色
                    const xk2Span = cell.createSpan({ text: xk2 });
                    this.setWuXingColorDirectly(xk2Span, this.getBranchWuXing(xk2));
                }
                else {
                    // 如果没有旬空或格式不正确，直接显示原文本
                    cell.textContent = dy.xunKong || '';
                }
            });
        }
        // 第七行：纳音（如果有）
        if (daYunData.some(dy => dy.naYin)) {
            const naYinRow = this.daYunTable.createEl('tr');
            naYinRow.createEl('th', { text: '纳音' });
            daYunData.slice(0, 10).forEach(dy => {
                const naYin = dy.naYin || '';
                const cell = naYinRow.createEl('td', {
                    cls: 'bazi-nayin-cell'
                });
                if (naYin) {
                    const wuXing = this.extractWuXingFromNaYin(naYin);
                    const naYinSpan = cell.createSpan({ text: naYin });
                    this.setWuXingColorDirectly(naYinSpan, wuXing);
                }
            });
        }
    }
    /**
     * 创建流年和小运信息
     */
    createLiuNianInfo() {
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
    createLiuYueInfo() {
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
    selectDaYun(index) {
        var _a, _b;
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
                }
                else {
                    cell.classList.remove('selected');
                }
            });
        }
        // 获取选中的大运
        const selectedDaYun = this.baziInfo.daYun[index];
        // 尝试从原始八字数据中筛选出属于该大运的流年
        let liuNianData = ((_a = this.baziInfo.liuNian) === null || _a === void 0 ? void 0 : _a.filter(ln => {
            var _a;
            const startYear = selectedDaYun.startYear;
            const endYear = (_a = selectedDaYun.endYear) !== null && _a !== void 0 ? _a : (startYear + 9);
            return ln.year >= startYear && ln.year <= endYear;
        })) || [];
        // 如果没有找到流年数据，则动态生成
        if (liuNianData.length === 0) {
            liuNianData = this.generateLiuNianForDaYun(selectedDaYun);
        }
        // 尝试从原始八字数据中筛选出属于该大运的小运
        let xiaoYunData = ((_b = this.baziInfo.xiaoYun) === null || _b === void 0 ? void 0 : _b.filter(xy => {
            var _a;
            const startYear = selectedDaYun.startYear;
            const endYear = (_a = selectedDaYun.endYear) !== null && _a !== void 0 ? _a : (startYear + 9);
            return xy.year >= startYear && xy.year <= endYear;
        })) || [];
        // 如果没有找到小运数据，则动态生成
        if (xiaoYunData.length === 0) {
            xiaoYunData = this.generateXiaoYunForDaYun(selectedDaYun);
            // 调试信息
            console.log('生成小运数据:', xiaoYunData);
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
    selectLiuNian(year) {
        var _a;
        // 更新选中的流年年份
        this.selectedLiuNianYear = year;
        // 高亮选中的流年单元格
        if (this.liuNianTable) {
            const cells = this.liuNianTable.querySelectorAll('.bazi-liunian-cell');
            cells.forEach(cell => {
                const cellYear = parseInt(cell.getAttribute('data-year') || '0');
                if (cellYear === year) {
                    cell.classList.add('selected');
                }
                else {
                    cell.classList.remove('selected');
                }
            });
        }
        // 查找选中的流年数据
        const selectedLiuNian = this.findLiuNianByYear(year);
        // 尝试获取流月信息
        let liuYueData = [];
        // 如果找到了流年数据，并且有流月信息，使用其流月信息
        if (selectedLiuNian && selectedLiuNian.liuYue) {
            liuYueData = selectedLiuNian.liuYue;
        }
        else {
            // 如果没有找到流年数据或流月信息，尝试从原始八字数据中查找
            liuYueData = ((_a = this.baziInfo.liuYue) === null || _a === void 0 ? void 0 : _a.filter(ly => {
                // 如果流月数据有year属性，检查是否匹配
                if (ly.year !== undefined) {
                    return ly.year === year;
                }
                return false;
            })) || [];
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
    generateLiuYueForYear(year) {
        // 天干地支顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        // 计算年干支
        const stemIndex = (year - 4) % 10;
        const yearStem = stems[stemIndex];
        // 生成流月数据
        const liuYueData = [];
        // 根据八字命理学规则，流月干支的计算方法：
        // 月支固定对应：寅卯辰巳午未申酉戌亥子丑
        // 月干则根据流年干支确定起始月干，然后依次递增
        // 确定节令月干支
        // 甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
        let firstMonthStem = '';
        if (yearStem === '甲' || yearStem === '己') {
            firstMonthStem = '丙';
        }
        else if (yearStem === '乙' || yearStem === '庚') {
            firstMonthStem = '戊';
        }
        else if (yearStem === '丙' || yearStem === '辛') {
            firstMonthStem = '庚';
        }
        else if (yearStem === '丁' || yearStem === '壬') {
            firstMonthStem = '壬';
        }
        else if (yearStem === '戊' || yearStem === '癸') {
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
    findLiuNianByYear(year) {
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
    updateLiuNianXiaoYunTable(liuNian, xiaoYun) {
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
                cls: 'bazi-liunian-cell',
                attr: { 'data-year': ln.year.toString() }
            });
            // 如果有干支，按五行颜色显示
            if (ln.ganZhi && ln.ganZhi.length >= 2) {
                const stem = ln.ganZhi[0]; // 天干
                const branch = ln.ganZhi[1]; // 地支
                // 创建天干元素并设置五行颜色
                const stemSpan = cell.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = cell.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                // 如果没有干支或格式不正确，直接显示原文本
                cell.textContent = ln.ganZhi || '';
            }
            // 添加点击事件
            cell.addEventListener('click', () => {
                this.selectLiuNian(ln.year);
            });
            // 如果是当前选中的流年，添加选中样式
            if (ln.year === this.selectedLiuNianYear) {
                cell.classList.add('selected');
            }
        });
        // 第四行：流年十神（如果有）
        if (liuNian.some(ln => ln.shiShenGan)) {
            const lnShiShenRow = this.liuNianTable.createEl('tr');
            lnShiShenRow.createEl('th', { text: '流年十神' });
            liuNian.slice(0, 10).forEach(ln => {
                lnShiShenRow.createEl('td', {
                    text: ln.shiShenGan || '',
                    cls: 'bazi-shishen-cell'
                });
            });
        }
        // 第五行：流年地势（如果有）
        if (liuNian.some(ln => ln.diShi)) {
            const lnDiShiRow = this.liuNianTable.createEl('tr');
            lnDiShiRow.createEl('th', { text: '流年地势' });
            liuNian.slice(0, 10).forEach(ln => {
                lnDiShiRow.createEl('td', {
                    text: ln.diShi || '',
                    cls: 'bazi-dishi-cell'
                });
            });
        }
        // 第六行：流年旬空
        if (liuNian.some(ln => ln.xunKong)) {
            const lnXkRow = this.liuNianTable.createEl('tr');
            lnXkRow.createEl('th', { text: '流年旬空' });
            liuNian.slice(0, 10).forEach(ln => {
                const cell = lnXkRow.createEl('td', {
                    cls: 'bazi-xunkong-cell'
                });
                // 如果有旬空，按五行颜色显示
                if (ln.xunKong && ln.xunKong.length >= 2) {
                    const xk1 = ln.xunKong[0]; // 第一个旬空地支
                    const xk2 = ln.xunKong[1]; // 第二个旬空地支
                    // 创建第一个旬空地支元素并设置五行颜色
                    const xk1Span = cell.createSpan({ text: xk1 });
                    this.setWuXingColorDirectly(xk1Span, this.getBranchWuXing(xk1));
                    // 创建第二个旬空地支元素并设置五行颜色
                    const xk2Span = cell.createSpan({ text: xk2 });
                    this.setWuXingColorDirectly(xk2Span, this.getBranchWuXing(xk2));
                }
                else {
                    // 如果没有旬空或格式不正确，直接显示原文本
                    cell.textContent = ln.xunKong || '';
                }
            });
        }
        // 第七行：小运干支
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
                const cell = xyGzRow.createEl('td', {
                    cls: 'bazi-xiaoyun-cell'
                });
                // 如果有小运干支，按五行颜色显示
                if (xy && xy.ganZhi && xy.ganZhi.length >= 2) {
                    const stem = xy.ganZhi[0]; // 天干
                    const branch = xy.ganZhi[1]; // 地支
                    // 创建天干元素并设置五行颜色
                    const stemSpan = cell.createSpan({ text: stem });
                    this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                    // 创建地支元素并设置五行颜色
                    const branchSpan = cell.createSpan({ text: branch });
                    this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
                }
                else {
                    // 如果没有干支或格式不正确，直接显示原文本
                    cell.textContent = xy ? (xy.ganZhi || '') : '';
                }
                // 如果对应的流年单元格被选中，也高亮小运单元格
                if (ln.year === this.selectedLiuNianYear) {
                    cell.classList.add('selected');
                }
            });
        }
        // 第八行：小运十神（如果有）
        if (xiaoYun.length > 0 && xiaoYun.some(xy => xy.shiShenGan)) {
            const xyShiShenRow = this.liuNianTable.createEl('tr');
            xyShiShenRow.createEl('th', { text: '小运十神' });
            const xyMap = new Map();
            xiaoYun.forEach(xy => {
                xyMap.set(xy.year, xy);
            });
            liuNian.slice(0, 10).forEach(ln => {
                const xy = xyMap.get(ln.year);
                xyShiShenRow.createEl('td', {
                    text: xy ? (xy.shiShenGan || '') : '',
                    cls: 'bazi-shishen-cell'
                });
            });
        }
        // 第九行：小运地势（如果有）
        if (xiaoYun.length > 0 && xiaoYun.some(xy => xy.diShi)) {
            const xyDiShiRow = this.liuNianTable.createEl('tr');
            xyDiShiRow.createEl('th', { text: '小运地势' });
            const xyMap = new Map();
            xiaoYun.forEach(xy => {
                xyMap.set(xy.year, xy);
            });
            liuNian.slice(0, 10).forEach(ln => {
                const xy = xyMap.get(ln.year);
                xyDiShiRow.createEl('td', {
                    text: xy ? (xy.diShi || '') : '',
                    cls: 'bazi-dishi-cell'
                });
            });
        }
        // 第十行：小运旬空
        if (xiaoYun.length > 0 && xiaoYun.some(xy => xy.xunKong)) {
            const xyXkRow = this.liuNianTable.createEl('tr');
            xyXkRow.createEl('th', { text: '小运旬空' });
            // 创建一个映射，用于快速查找特定年份的小运
            const xyMap = new Map();
            xiaoYun.forEach(xy => {
                xyMap.set(xy.year, xy);
            });
            liuNian.slice(0, 10).forEach(ln => {
                const xy = xyMap.get(ln.year);
                const cell = xyXkRow.createEl('td', {
                    cls: 'bazi-xunkong-cell'
                });
                // 如果有旬空，按五行颜色显示
                if (xy && xy.xunKong && xy.xunKong.length >= 2) {
                    const xk1 = xy.xunKong[0]; // 第一个旬空地支
                    const xk2 = xy.xunKong[1]; // 第二个旬空地支
                    // 创建第一个旬空地支元素并设置五行颜色
                    const xk1Span = cell.createSpan({ text: xk1 });
                    this.setWuXingColorDirectly(xk1Span, this.getBranchWuXing(xk1));
                    // 创建第二个旬空地支元素并设置五行颜色
                    const xk2Span = cell.createSpan({ text: xk2 });
                    this.setWuXingColorDirectly(xk2Span, this.getBranchWuXing(xk2));
                }
                else {
                    // 如果没有旬空或格式不正确，直接显示原文本
                    cell.textContent = xy ? (xy.xunKong || '') : '';
                }
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
    updateLiuYueTable(liuYue) {
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
            }
            else if (typeof ly.month === 'number') {
                // 如果是数字，转换为中文月份
                const chineseMonths = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
                monthText = chineseMonths[ly.month] + '月';
            }
            else if (ly.monthInChinese) {
                // 如果有monthInChinese属性（lunar-typescript库格式）
                monthText = ly.monthInChinese;
            }
            else if (ly.index !== undefined) {
                // 如果有index属性（lunar-typescript库格式）
                const chineseMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
                monthText = chineseMonths[ly.index] + '月';
            }
            monthRow.createEl('td', {
                text: monthText,
                cls: 'bazi-liuyue-month'
            });
        });
        // 第二行：干支
        const gzRow = this.liuYueTable.createEl('tr');
        gzRow.createEl('th', { text: '干支' });
        liuYue.forEach(ly => {
            // 获取月份标识，用于data-month属性
            let monthId = '';
            if (typeof ly.month === 'number' || typeof ly.month === 'string') {
                monthId = ly.month.toString();
            }
            else if (ly.index !== undefined) {
                monthId = (ly.index + 1).toString(); // 索引从0开始，月份从1开始
            }
            const cell = gzRow.createEl('td', {
                cls: 'bazi-liuyue-cell',
                attr: { 'data-month': monthId }
            });
            // 如果有干支，按五行颜色显示
            if (ly.ganZhi && ly.ganZhi.length >= 2) {
                const stem = ly.ganZhi[0]; // 天干
                const branch = ly.ganZhi[1]; // 地支
                // 创建天干元素并设置五行颜色
                const stemSpan = cell.createSpan({ text: stem });
                this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));
                // 创建地支元素并设置五行颜色
                const branchSpan = cell.createSpan({ text: branch });
                this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
            }
            else {
                // 如果没有干支或格式不正确，直接显示原文本
                cell.textContent = ly.ganZhi || '';
            }
            // 添加点击事件
            cell.addEventListener('click', () => {
                var _a;
                // 高亮选中的单元格
                (_a = this.liuYueTable) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.bazi-liuyue-cell').forEach(c => {
                    c.classList.remove('selected');
                });
                cell.classList.add('selected');
            });
        });
        // 第三行：十神（如果有）
        if (liuYue.some(ly => ly.shiShenGan)) {
            const shiShenRow = this.liuYueTable.createEl('tr');
            shiShenRow.createEl('th', { text: '十神' });
            liuYue.forEach(ly => {
                shiShenRow.createEl('td', {
                    text: ly.shiShenGan || '',
                    cls: 'bazi-shishen-cell'
                });
            });
        }
        // 第四行：地势（如果有）
        if (liuYue.some(ly => ly.diShi)) {
            const diShiRow = this.liuYueTable.createEl('tr');
            diShiRow.createEl('th', { text: '地势' });
            liuYue.forEach(ly => {
                diShiRow.createEl('td', {
                    text: ly.diShi || '',
                    cls: 'bazi-dishi-cell'
                });
            });
        }
        // 第五行：旬空
        const xkRow = this.liuYueTable.createEl('tr');
        xkRow.createEl('th', { text: '旬空' });
        liuYue.forEach(ly => {
            // 处理不同格式的旬空数据
            let xunKong = '';
            if (ly.xunKong) {
                xunKong = ly.xunKong;
            }
            else if (ly.xun && ly.xunKong) {
                // lunar-typescript库可能使用这种格式
                xunKong = ly.xunKong;
            }
            else {
                // 如果没有旬空数据，尝试计算
                const ganZhi = ly.ganZhi;
                if (ganZhi && ganZhi.length === 2) {
                    xunKong = this.calculateXunKong(ganZhi[0], ganZhi[1]);
                }
            }
            const cell = xkRow.createEl('td', {
                cls: 'bazi-xunkong-cell'
            });
            // 如果有旬空，按五行颜色显示
            if (xunKong && xunKong.length >= 2) {
                const xk1 = xunKong[0]; // 第一个旬空地支
                const xk2 = xunKong[1]; // 第二个旬空地支
                // 创建第一个旬空地支元素并设置五行颜色
                const xk1Span = cell.createSpan({ text: xk1 });
                this.setWuXingColorDirectly(xk1Span, this.getBranchWuXing(xk1));
                // 创建第二个旬空地支元素并设置五行颜色
                const xk2Span = cell.createSpan({ text: xk2 });
                this.setWuXingColorDirectly(xk2Span, this.getBranchWuXing(xk2));
            }
            else {
                // 如果没有旬空或格式不正确，直接显示原文本
                cell.textContent = xunKong;
            }
        });
        // 第六行：纳音（如果有）
        if (liuYue.some(ly => ly.naYin)) {
            const naYinRow = this.liuYueTable.createEl('tr');
            naYinRow.createEl('th', { text: '纳音' });
            liuYue.forEach(ly => {
                const naYin = ly.naYin || '';
                const cell = naYinRow.createEl('td', {
                    cls: 'bazi-nayin-cell'
                });
                if (naYin) {
                    const wuXing = this.extractWuXingFromNaYin(naYin);
                    const naYinSpan = cell.createSpan({ text: naYin });
                    this.setWuXingColorDirectly(naYinSpan, wuXing);
                }
            });
        }
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
    generateLiuNianForDaYun(daYun) {
        var _a;
        // 如果没有起始年或结束年，返回空数组
        if (!daYun.startYear) {
            return [];
        }
        // 计算结束年（如果未定义，使用起始年+9）
        const endYear = (_a = daYun.endYear) !== null && _a !== void 0 ? _a : (daYun.startYear + 9);
        // 生成流年数据
        const liuNianData = [];
        let age = daYun.startAge;
        // 获取日干，用于计算十神
        const dayStem = this.baziInfo.dayStem;
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
            // 计算十神（如果有日干）
            let shiShenGan = '';
            if (dayStem) {
                shiShenGan = this.getShiShen(dayStem, stem);
            }
            // 计算地势（如果有日干）
            let diShi = '';
            if (dayStem) {
                diShi = this.getDiShi(dayStem, branch);
            }
            liuNianData.push({
                year,
                age,
                ganZhi,
                xunKong,
                shiShenGan,
                diShi
            });
        }
        return liuNianData;
    }
    /**
     * 为指定大运生成小运数据
     * @param daYun 大运数据
     * @returns 小运数据数组
     */
    generateXiaoYunForDaYun(daYun) {
        var _a;
        // 如果没有起始年或结束年，返回空数组
        if (!daYun.startYear) {
            console.log('没有起始年，无法生成小运数据');
            return [];
        }
        // 计算结束年（如果未定义，使用起始年+9）
        const endYear = (_a = daYun.endYear) !== null && _a !== void 0 ? _a : (daYun.startYear + 9);
        console.log(`小运年份范围: ${daYun.startYear} - ${endYear}`);
        // 生成小运数据
        const xiaoYunData = [];
        let age = daYun.startAge;
        // 获取大运干支
        const daYunGanZhi = daYun.ganZhi;
        if (!daYunGanZhi || daYunGanZhi.length !== 2) {
            console.log('大运干支无效:', daYunGanZhi);
            return [];
        }
        console.log('大运干支:', daYunGanZhi);
        // 天干地支顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 大运干支索引
        const daYunStemIndex = stems.indexOf(daYunGanZhi[0]);
        const daYunBranchIndex = branches.indexOf(daYunGanZhi[1]);
        if (daYunStemIndex === -1 || daYunBranchIndex === -1) {
            console.log('大运干支索引无效:', daYunStemIndex, daYunBranchIndex);
            return [];
        }
        // 获取日干，用于计算十神
        const dayStem = this.baziInfo.dayStem;
        // 使用月柱干支作为小运起点
        const monthStem = this.baziInfo.monthStem;
        const monthBranch = this.baziInfo.monthBranch;
        if (!monthStem || !monthBranch) {
            console.log('月柱干支无效，使用大运干支作为小运起点');
            // 如果没有月柱干支，使用大运干支作为小运起点
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
                // 计算十神（如果有日干）
                let shiShenGan = '';
                if (dayStem) {
                    shiShenGan = this.getShiShen(dayStem, stem);
                }
                // 计算地势（如果有日干）
                let diShi = '';
                if (dayStem) {
                    diShi = this.getDiShi(dayStem, branch);
                }
                xiaoYunData.push({
                    year,
                    age,
                    ganZhi,
                    xunKong,
                    shiShenGan,
                    diShi
                });
            }
        }
        else {
            console.log('使用月柱干支作为小运起点:', monthStem + monthBranch);
            // 月柱干支索引
            const monthStemIndex = stems.indexOf(monthStem);
            const monthBranchIndex = branches.indexOf(monthBranch);
            for (let year = daYun.startYear; year <= endYear; year++, age++) {
                // 小运干支计算（使用月柱干支作为起点）
                const stemIndex = (monthStemIndex + (year - daYun.startYear)) % 10;
                const branchIndex = (monthBranchIndex + (year - daYun.startYear)) % 12;
                const stem = stems[stemIndex];
                const branch = branches[branchIndex];
                const ganZhi = stem + branch;
                // 计算旬空
                const xunKong = this.calculateXunKong(stem, branch);
                // 计算十神（如果有日干）
                let shiShenGan = '';
                if (dayStem) {
                    shiShenGan = this.getShiShen(dayStem, stem);
                }
                // 计算地势（如果有日干）
                let diShi = '';
                if (dayStem) {
                    diShi = this.getDiShi(dayStem, branch);
                }
                xiaoYunData.push({
                    year,
                    age,
                    ganZhi,
                    xunKong,
                    shiShenGan,
                    diShi
                });
            }
        }
        return xiaoYunData;
    }
    /**
     * 计算旬空
     * @param gan 天干
     * @param zhi 地支
     * @returns 旬空
     */
    calculateXunKong(gan, zhi) {
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
     * 直接在元素上设置五行颜色
     * @param element HTML元素
     * @param wuXing 五行
     */
    setWuXingColorDirectly(element, wuXing) {
        if (!wuXing)
            return;
        // 移除所有可能的五行类
        element.classList.remove('wuxing-jin', 'wuxing-mu', 'wuxing-shui', 'wuxing-huo', 'wuxing-tu');
        // 添加对应的五行类
        switch (wuXing) {
            case '金':
                element.classList.add('wuxing-jin');
                break;
            case '木':
                element.classList.add('wuxing-mu');
                break;
            case '水':
                element.classList.add('wuxing-shui');
                break;
            case '火':
                element.classList.add('wuxing-huo');
                break;
            case '土':
                element.classList.add('wuxing-tu');
                break;
        }
        // 添加内联样式作为备份
        switch (wuXing) {
            case '金':
                element.style.color = '#FFD700'; // 金 - 黄色
                break;
            case '木':
                element.style.color = '#2e8b57'; // 木 - 绿色
                break;
            case '水':
                element.style.color = '#1e90ff'; // 水 - 蓝色
                break;
            case '火':
                element.style.color = '#ff4500'; // 火 - 红色
                break;
            case '土':
                element.style.color = '#cd853f'; // 土 - 棕色
                break;
        }
    }
    /**
     * 为天干元素应用五行颜色
     * @param element HTML元素
     * @param stem 天干
     */
    applyStemWuXingColor(element, stem) {
        // 获取天干对应的五行
        const wuXing = this.getStemWuXing(stem);
        // 直接设置内联样式
        switch (wuXing) {
            case '金':
                element.style.cssText = 'color: #FFD700 !important; font-weight: bold !important;'; // 金 - 黄色
                break;
            case '木':
                element.style.cssText = 'color: #2e8b57 !important; font-weight: bold !important;'; // 木 - 绿色
                break;
            case '水':
                element.style.cssText = 'color: #1e90ff !important; font-weight: bold !important;'; // 水 - 蓝色
                break;
            case '火':
                element.style.cssText = 'color: #ff4500 !important; font-weight: bold !important;'; // 火 - 红色
                break;
            case '土':
                element.style.cssText = 'color: #cd853f !important; font-weight: bold !important;'; // 土 - 棕色
                break;
        }
    }
    /**
     * 为地支元素应用五行颜色
     * @param element HTML元素
     * @param branch 地支
     */
    applyBranchWuXingColor(element, branch) {
        // 获取地支对应的五行
        const wuXing = this.getBranchWuXing(branch);
        // 直接设置内联样式
        switch (wuXing) {
            case '金':
                element.style.cssText = 'color: #FFD700 !important; font-weight: bold !important;'; // 金 - 黄色
                break;
            case '木':
                element.style.cssText = 'color: #2e8b57 !important; font-weight: bold !important;'; // 木 - 绿色
                break;
            case '水':
                element.style.cssText = 'color: #1e90ff !important; font-weight: bold !important;'; // 水 - 蓝色
                break;
            case '火':
                element.style.cssText = 'color: #ff4500 !important; font-weight: bold !important;'; // 火 - 红色
                break;
            case '土':
                element.style.cssText = 'color: #cd853f !important; font-weight: bold !important;'; // 土 - 棕色
                break;
        }
    }
    /**
     * 从纳音中提取五行属性
     * @param naYin 纳音
     * @returns 五行
     */
    extractWuXingFromNaYin(naYin) {
        // 纳音通常是"XX五行"的格式，如"金箔金"、"大溪水"等
        // 我们需要提取最后一个字，即五行属性
        if (!naYin || naYin.length < 1) {
            return '未知';
        }
        // 提取最后一个字
        const lastChar = naYin.charAt(naYin.length - 1);
        // 检查是否是五行字
        if (['金', '木', '水', '火', '土'].includes(lastChar)) {
            return lastChar;
        }
        // 如果最后一个字不是五行，尝试查找纳音中包含的五行字
        for (const wuXing of ['金', '木', '水', '火', '土']) {
            if (naYin.includes(wuXing)) {
                return wuXing;
            }
        }
        return '未知';
    }
    /**
     * 创建带颜色的藏干
     * @param container 容器元素
     * @param hideGanText 藏干文本
     */
    createColoredHideGan(container, hideGanText) {
        if (!hideGanText) {
            container.textContent = '';
            return;
        }
        // 如果藏干是逗号分隔的，分别处理每个藏干
        if (hideGanText.includes(',')) {
            const hideGans = hideGanText.split(',');
            hideGans.forEach((gan, index) => {
                const wuXing = this.getStemWuXing(gan);
                const ganSpan = container.createSpan({ text: gan });
                this.setWuXingColorDirectly(ganSpan, wuXing);
                // 如果不是最后一个，添加逗号分隔
                if (index < hideGans.length - 1) {
                    container.createSpan({ text: ',' });
                }
            });
        }
        else {
            // 单个藏干
            for (let i = 0; i < hideGanText.length; i++) {
                const gan = hideGanText[i];
                const wuXing = this.getStemWuXing(gan);
                const ganSpan = container.createSpan({ text: gan });
                this.setWuXingColorDirectly(ganSpan, wuXing);
            }
        }
    }
    /**
     * 获取天干对应的五行
     * @param stem 天干
     * @returns 五行
     */
    getStemWuXing(stem) {
        const map = {
            '甲': '木',
            '乙': '木',
            '丙': '火',
            '丁': '火',
            '戊': '土',
            '己': '土',
            '庚': '金',
            '辛': '金',
            '壬': '水',
            '癸': '水'
        };
        return map[stem] || '未知';
    }
    /**
     * 获取十神
     * @param dayStem 日干
     * @param stem 天干
     * @returns 十神
     */
    getShiShen(dayStem, stem) {
        // 天干顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        // 五行属性（未使用）
        // const wuxing = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
        // 十神名称
        const shiShenNames = [
            ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"],
            ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"] // 阴干
        ];
        // 获取日干和目标天干的索引
        const dayStemIndex = stems.indexOf(dayStem);
        const stemIndex = stems.indexOf(stem);
        if (dayStemIndex === -1 || stemIndex === -1) {
            return '';
        }
        // 判断日干阴阳
        const dayYinYang = dayStemIndex % 2 === 0 ? 0 : 1; // 0为阳干，1为阴干
        // 计算十神索引
        let shiShenIndex = (stemIndex - dayStemIndex + 10) % 10;
        // 返回十神名称
        return shiShenNames[dayYinYang][shiShenIndex];
    }
    /**
     * 获取地势（长生十二神）
     * @param dayStem 日干
     * @param branch 地支
     * @returns 地势
     */
    getDiShi(dayStem, branch) {
        // 地支顺序
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 长生十二神名称
        const diShiNames = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
        // 各天干的长生地支起点
        const startPoints = {
            "甲": branches.indexOf("亥"),
            "乙": branches.indexOf("午"),
            "丙": branches.indexOf("寅"),
            "丁": branches.indexOf("酉"),
            "戊": branches.indexOf("寅"),
            "己": branches.indexOf("酉"),
            "庚": branches.indexOf("巳"),
            "辛": branches.indexOf("子"),
            "壬": branches.indexOf("申"),
            "癸": branches.indexOf("卯") // 癸水长生在卯
        };
        // 阴阳顺逆方向
        const directions = {
            "甲": 1,
            "乙": -1,
            "丙": 1,
            "丁": -1,
            "戊": 1,
            "己": -1,
            "庚": 1,
            "辛": -1,
            "壬": 1,
            "癸": -1
        };
        // 获取地支索引
        const branchIndex = branches.indexOf(branch);
        if (!(dayStem in startPoints) || branchIndex === -1) {
            return '';
        }
        // 获取起点和方向
        const startPoint = startPoints[dayStem];
        const direction = directions[dayStem];
        // 计算地势索引
        let diShiIndex = (branchIndex - startPoint + 12) % 12;
        if (direction === -1) {
            diShiIndex = (12 - diShiIndex) % 12;
        }
        // 返回地势名称
        return diShiNames[diShiIndex];
    }
    /**
     * 显示神煞详细解释
     * @param shenSha 神煞名称
     */
    showShenShaExplanation(shenSha) {
        // 获取神煞详细解释
        const explanation = ShenShaService.getShenShaExplanation(shenSha);
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = explanation.name;
        title.className = 'bazi-modal-title';
        // 根据神煞类型设置不同的样式
        let typeClass = 'bazi-modal-type';
        if (explanation.type === '吉神') {
            typeClass += ' bazi-modal-type-good';
        }
        else if (explanation.type === '凶神') {
            typeClass += ' bazi-modal-type-bad';
        }
        else if (explanation.type === '吉凶神') {
            typeClass += ' bazi-modal-type-mixed';
        }
        // 创建类型
        const type = document.createElement('div');
        type.textContent = `类型: ${explanation.type}`;
        type.className = typeClass;
        // 创建解释
        const explanationText = document.createElement('div');
        explanationText.textContent = explanation.explanation;
        explanationText.className = 'bazi-modal-explanation';
        // 创建影响
        const influence = document.createElement('div');
        influence.textContent = explanation.influence;
        influence.className = 'bazi-modal-influence';
        // 查找相关的神煞组合
        if (this.baziInfo.shenSha && this.baziInfo.shenSha.length > 0) {
            const combinations = ShenShaService.getShenShaCombinationAnalysis(this.baziInfo.shenSha);
            // 移除可能的前缀（如"年柱:"）
            const cleanShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
            // 筛选包含当前神煞的组合，并按级别排序
            const relevantCombinations = combinations.filter(combo => combo.combination.includes(cleanShenSha));
            if (relevantCombinations.length > 0) {
                // 创建组合分析标题
                const combinationsTitle = document.createElement('h4');
                combinationsTitle.textContent = '相关神煞组合';
                combinationsTitle.className = 'bazi-modal-subtitle';
                modalContent.appendChild(combinationsTitle);
                // 按组合级别排序（4级组合优先显示，然后是3级，最后是2级）
                const sortedCombinations = [...relevantCombinations].sort((a, b) => (b.level || 2) - (a.level || 2));
                // 创建组合分析列表
                sortedCombinations.forEach(combo => {
                    const comboContainer = document.createElement('div');
                    comboContainer.className = 'bazi-modal-combo-container';
                    // 根据组合类型添加不同的样式
                    if (combo.type === 'good') {
                        comboContainer.classList.add('combo-good');
                    }
                    else if (combo.type === 'bad') {
                        comboContainer.classList.add('combo-bad');
                    }
                    else if (combo.type === 'mixed') {
                        comboContainer.classList.add('combo-mixed');
                    }
                    const comboTitle = document.createElement('div');
                    // 根据组合级别添加不同的标签
                    let levelText = '';
                    let levelClass = '';
                    if (combo.level === 4) {
                        levelText = '【四神煞组合】';
                        levelClass = 'bazi-combination-level-4';
                    }
                    else if (combo.level === 3) {
                        levelText = '【三神煞组合】';
                        levelClass = 'bazi-combination-level-3';
                    }
                    else {
                        levelText = '【二神煞组合】';
                        levelClass = 'bazi-combination-level-2';
                    }
                    const levelSpan = document.createElement('span');
                    levelSpan.textContent = levelText;
                    levelSpan.className = levelClass;
                    // 根据组合类型添加不同的标签
                    let typeText = '';
                    let typeClass = '';
                    if (combo.type === 'good') {
                        typeText = '吉神组合';
                        typeClass = 'bazi-combo-type bazi-combo-type-good';
                    }
                    else if (combo.type === 'bad') {
                        typeText = '凶神组合';
                        typeClass = 'bazi-combo-type bazi-combo-type-bad';
                    }
                    else if (combo.type === 'mixed') {
                        typeText = '吉凶神组合';
                        typeClass = 'bazi-combo-type bazi-combo-type-mixed';
                    }
                    const typeSpan = document.createElement('span');
                    typeSpan.textContent = typeText;
                    typeSpan.className = typeClass;
                    comboTitle.textContent = combo.combination + ' ';
                    comboTitle.appendChild(levelSpan);
                    comboTitle.appendChild(typeSpan);
                    comboTitle.className = 'bazi-modal-combo-title';
                    const comboAnalysis = document.createElement('div');
                    comboAnalysis.textContent = combo.analysis;
                    comboAnalysis.className = 'bazi-modal-combo-analysis';
                    // 添加组合来源
                    if (combo.source) {
                        const comboSource = document.createElement('div');
                        comboSource.textContent = '【组合来源】' + combo.source;
                        comboSource.className = 'bazi-combo-source';
                        comboContainer.appendChild(comboTitle);
                        comboContainer.appendChild(comboAnalysis);
                        comboContainer.appendChild(comboSource);
                    }
                    else {
                        comboContainer.appendChild(comboTitle);
                        comboContainer.appendChild(comboAnalysis);
                    }
                    // 添加组合影响
                    if (combo.influence) {
                        const comboInfluence = document.createElement('div');
                        comboInfluence.textContent = '【组合影响】' + combo.influence;
                        comboInfluence.className = 'bazi-combo-influence';
                        comboContainer.appendChild(comboInfluence);
                    }
                    // 添加应对方法
                    if (combo.solution) {
                        const comboSolution = document.createElement('div');
                        comboSolution.textContent = '【应对方法】' + combo.solution;
                        comboSolution.className = 'bazi-combo-solution';
                        comboContainer.appendChild(comboSolution);
                    }
                    modalContent.appendChild(comboContainer);
                });
            }
        }
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 添加内容到弹窗
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(influence);
        // 添加计算方法（如果有）
        if (explanation.calculation) {
            const calculation = document.createElement('div');
            calculation.innerHTML = `
        <strong>【计算方法】</strong>
        <pre style="user-select: text;">${explanation.calculation}</pre>
      `;
            calculation.className = 'bazi-modal-calculation';
            modalContent.appendChild(calculation);
        }
        modalContent.appendChild(closeButton);
        // 添加弹窗到页面
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 显示神煞组合分析
     * @param combination 神煞组合
     */
    showShenShaCombinationAnalysis(combination) {
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '神煞组合分析';
        title.className = 'bazi-modal-title';
        // 创建组合名称
        const combinationName = document.createElement('div');
        combinationName.textContent = combination.combination;
        combinationName.className = 'bazi-modal-subtitle';
        // 获取组合中的神煞
        const shenShaNames = combination.combination.split(' + ');
        // 创建神煞类型标签容器
        const typeContainer = document.createElement('div');
        typeContainer.className = 'bazi-modal-type-container';
        // 为每个神煞创建类型标签
        shenShaNames.forEach(name => {
            const shenShaInfo = ShenShaService.getShenShaInfo(name);
            if (shenShaInfo) {
                const typeTag = document.createElement('span');
                // 根据神煞类型设置不同的样式
                let typeClass = 'bazi-modal-type';
                if (shenShaInfo.type === '吉神') {
                    typeClass += ' bazi-modal-type-good';
                }
                else if (shenShaInfo.type === '凶神') {
                    typeClass += ' bazi-modal-type-bad';
                }
                else if (shenShaInfo.type === '吉凶神') {
                    typeClass += ' bazi-modal-type-mixed';
                }
                typeTag.className = typeClass;
                typeTag.textContent = `${name}(${shenShaInfo.type})`;
                typeContainer.appendChild(typeTag);
            }
        });
        // 创建分析
        const analysis = document.createElement('div');
        analysis.textContent = combination.analysis;
        analysis.className = 'bazi-modal-analysis';
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 添加内容到弹窗
        modalContent.appendChild(title);
        modalContent.appendChild(combinationName);
        modalContent.appendChild(typeContainer);
        modalContent.appendChild(analysis);
        modalContent.appendChild(closeButton);
        // 添加弹窗到页面
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    // addYearMonthShenShaRow 方法已删除，逻辑直接内联到 createBaziTable 方法中
    // createShenShaCell 方法已删除，逻辑直接内联到 addYearMonthShenShaRow 方法中
    /**
     * 添加神煞信息
     * @param infoList 信息列表元素
     */
    addShenShaInfo(_infoList) {
        // 不再在特殊信息区域显示神煞信息，因为已经在命盘表格中显示了
        return;
    }
    /**
     * 获取五行对应的CSS类名
     * @param wuXing 五行名称
     * @returns CSS类名
     */
    getWuXingClassFromName(wuXing) {
        switch (wuXing) {
            case '金': return 'jin';
            case '木': return 'mu';
            case '水': return 'shui';
            case '火': return 'huo';
            case '土': return 'tu';
            default: return 'tu'; // 默认为土
        }
    }
    /**
     * 显示五行强度详细解释
     * @param wuXing 五行名称
     * @param value 五行强度值
     */
    showWuXingExplanation(wuXing, value) {
        // 获取五行详细信息
        const wuXingInfo = WuXingService.getWuXingInfo(wuXing);
        if (!wuXingInfo)
            return;
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `${wuXing}五行强度详解`;
        title.className = 'bazi-modal-title';
        // 创建类型
        const type = document.createElement('div');
        type.textContent = `强度值: ${value}`;
        type.className = `bazi-modal-type bazi-modal-type-${this.getWuXingClassFromName(wuXing)}`;
        // 创建解释
        const explanationText = document.createElement('div');
        explanationText.textContent = wuXingInfo.explanation;
        explanationText.className = 'bazi-modal-explanation';
        // 创建影响
        const influenceText = document.createElement('div');
        influenceText.textContent = wuXingInfo.influence;
        influenceText.className = 'bazi-modal-influence';
        // 创建计算方法
        const calculation = document.createElement('div');
        calculation.className = 'bazi-modal-calculation';
        // 获取实际计算过程
        let actualCalculation = this.getActualWuXingCalculation(wuXing);
        if (!actualCalculation) {
            actualCalculation = wuXingInfo.calculation;
        }
        calculation.innerHTML = `
      <strong>【计算方法】</strong>
      <pre style="user-select: text;">${actualCalculation}</pre>
    `;
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 添加内容到弹窗
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(influenceText);
        modalContent.appendChild(calculation);
        modalContent.appendChild(closeButton);
        // 添加弹窗到页面
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 获取实际的五行强度计算过程
     * @param wuXing 五行名称
     * @returns 实际计算过程
     */
    getActualWuXingCalculation(wuXing) {
        if (!this.baziInfo || !this.baziInfo.wuXingStrength) {
            return '';
        }
        // 检查是否有详细信息
        if (!('details' in this.baziInfo.wuXingStrength)) {
            // 如果没有详细信息，使用旧的计算方法
            return this.getOldWuXingCalculation(wuXing);
        }
        // 获取五行强度详情
        const details = this.baziInfo.wuXingStrength.details;
        // 获取特定五行的详情
        let wuXingDetails;
        switch (wuXing) {
            case '金':
                wuXingDetails = details.jin;
                break;
            case '木':
                wuXingDetails = details.mu;
                break;
            case '水':
                wuXingDetails = details.shui;
                break;
            case '火':
                wuXingDetails = details.huo;
                break;
            case '土':
                wuXingDetails = details.tu;
                break;
            default: return '';
        }
        // 计算总分
        const wuXingStrength = this.baziInfo.wuXingStrength;
        const total = wuXingStrength.jin +
            wuXingStrength.mu +
            wuXingStrength.shui +
            wuXingStrength.huo +
            wuXingStrength.tu;
        // 构建计算过程
        let calculation = `${wuXing}五行强度实际计算过程：\n\n`;
        // 天干五行
        calculation += `【天干五行】\n`;
        if (wuXingDetails.tianGan > 0) {
            // 获取八字信息
            const { yearStem, monthStem, dayStem, hourStem } = this.baziInfo;
            if (this.getWuXingFromStem(yearStem) === wuXing) {
                calculation += `- 年干${yearStem}为${wuXing}，得分1.0\n`;
            }
            if (this.getWuXingFromStem(monthStem) === wuXing) {
                calculation += `- 月干${monthStem}为${wuXing}，得分2.0\n`;
            }
            if (this.getWuXingFromStem(dayStem) === wuXing) {
                calculation += `- 日干${dayStem}为${wuXing}，得分3.0\n`;
            }
            if (this.getWuXingFromStem(hourStem) === wuXing) {
                calculation += `- 时干${hourStem}为${wuXing}，得分1.0\n`;
            }
        }
        // 地支藏干
        calculation += `\n【地支藏干】\n`;
        if (wuXingDetails.diZhiCang > 0) {
            // 获取八字信息
            const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
            const { yearHideGan, monthHideGan, dayHideGan, hourHideGan } = this.baziInfo;
            if (yearHideGan) {
                const yearHideGanArray = Array.isArray(yearHideGan) ? yearHideGan : yearHideGan.split('');
                for (const gan of yearHideGanArray) {
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        calculation += `- 年支${yearBranch}藏${gan}为${wuXing}，得分0.7\n`;
                    }
                }
            }
            if (monthHideGan) {
                const monthHideGanArray = Array.isArray(monthHideGan) ? monthHideGan : monthHideGan.split('');
                for (const gan of monthHideGanArray) {
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        calculation += `- 月支${monthBranch}藏${gan}为${wuXing}，得分1.5\n`;
                    }
                }
            }
            if (dayHideGan) {
                const dayHideGanArray = Array.isArray(dayHideGan) ? dayHideGan : dayHideGan.split('');
                for (const gan of dayHideGanArray) {
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        calculation += `- 日支${dayBranch}藏${gan}为${wuXing}，得分2.0\n`;
                    }
                }
            }
            if (hourHideGan) {
                const hourHideGanArray = Array.isArray(hourHideGan) ? hourHideGan : hourHideGan.split('');
                for (const gan of hourHideGanArray) {
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        calculation += `- 时支${hourBranch}藏${gan}为${wuXing}，得分0.7\n`;
                    }
                }
            }
        }
        // 纳音五行
        calculation += `\n【纳音五行】\n`;
        if (wuXingDetails.naYin > 0) {
            // 获取八字信息
            const { yearNaYin, monthNaYin, dayNaYin, hourNaYin } = this.baziInfo;
            if (yearNaYin && yearNaYin.includes(wuXing)) {
                calculation += `- 年柱纳音${yearNaYin}为${wuXing}，得分0.5\n`;
            }
            if (monthNaYin && monthNaYin.includes(wuXing)) {
                calculation += `- 月柱纳音${monthNaYin}为${wuXing}，得分1.0\n`;
            }
            if (dayNaYin && dayNaYin.includes(wuXing)) {
                calculation += `- 日柱纳音${dayNaYin}为${wuXing}，得分1.5\n`;
            }
            if (hourNaYin && hourNaYin.includes(wuXing)) {
                calculation += `- 时柱纳音${hourNaYin}为${wuXing}，得分0.5\n`;
            }
        }
        // 季节调整
        calculation += `\n【季节调整】\n`;
        const { monthBranch } = this.baziInfo;
        const season = this.getSeason(monthBranch);
        calculation += `- 当前季节：${season}\n`;
        if (wuXingDetails.season !== 0) {
            switch (season) {
                case '春季':
                    if (wuXing === '木')
                        calculation += `- 春季木旺，得分+2.0\n`;
                    if (wuXing === '火')
                        calculation += `- 春季火相，得分+1.0\n`;
                    if (wuXing === '金')
                        calculation += `- 春季金囚，得分-1.0\n`;
                    if (wuXing === '水')
                        calculation += `- 春季水死，得分-1.5\n`;
                    break;
                case '夏季':
                    if (wuXing === '火')
                        calculation += `- 夏季火旺，得分+2.0\n`;
                    if (wuXing === '土')
                        calculation += `- 夏季土相，得分+1.0\n`;
                    if (wuXing === '水')
                        calculation += `- 夏季水囚，得分-1.0\n`;
                    if (wuXing === '木')
                        calculation += `- 夏季木死，得分-1.5\n`;
                    break;
                case '秋季':
                    if (wuXing === '金')
                        calculation += `- 秋季金旺，得分+2.0\n`;
                    if (wuXing === '水')
                        calculation += `- 秋季水相，得分+1.0\n`;
                    if (wuXing === '火')
                        calculation += `- 秋季火囚，得分-1.0\n`;
                    if (wuXing === '土')
                        calculation += `- 秋季土死，得分-1.5\n`;
                    break;
                case '冬季':
                    if (wuXing === '水')
                        calculation += `- 冬季水旺，得分+2.0\n`;
                    if (wuXing === '木')
                        calculation += `- 冬季木相，得分+1.0\n`;
                    if (wuXing === '土')
                        calculation += `- 冬季土囚，得分-1.0\n`;
                    if (wuXing === '金')
                        calculation += `- 冬季金死，得分-1.5\n`;
                    break;
            }
        }
        // 月令当令加成
        calculation += `\n【月令当令加成】\n`;
        if (wuXingDetails.monthDominant > 0) {
            switch (season) {
                case '春季':
                    if (wuXing === '木')
                        calculation += `- 春季木当令，得分+1.5\n`;
                    if (wuXing === '火')
                        calculation += `- 春季火相旺，得分+0.8\n`;
                    break;
                case '夏季':
                    if (wuXing === '火')
                        calculation += `- 夏季火当令，得分+1.5\n`;
                    if (wuXing === '土')
                        calculation += `- 夏季土相旺，得分+0.8\n`;
                    break;
                case '秋季':
                    if (wuXing === '金')
                        calculation += `- 秋季金当令，得分+1.5\n`;
                    if (wuXing === '水')
                        calculation += `- 秋季水相旺，得分+0.8\n`;
                    break;
                case '冬季':
                    if (wuXing === '水')
                        calculation += `- 冬季水当令，得分+1.5\n`;
                    if (wuXing === '木')
                        calculation += `- 冬季木相旺，得分+0.8\n`;
                    break;
            }
        }
        // 组合调整
        calculation += `\n【组合调整】\n`;
        if (wuXingDetails.combination > 0) {
            // 天干五合
            const tianGanWuHe = this.checkTianGanWuHe();
            if (tianGanWuHe) {
                const heWuXing = this.getWuXingFromWuHe(tianGanWuHe);
                if (heWuXing === wuXing) {
                    calculation += `- 天干五合：${tianGanWuHe}合化${wuXing}，得分+0.5\n`;
                }
            }
            // 地支三合
            const diZhiSanHe = this.checkDiZhiSanHe();
            if (diZhiSanHe) {
                const heWuXing = this.getWuXingFromSanHe(diZhiSanHe);
                if (heWuXing === wuXing) {
                    calculation += `- 地支三合：${diZhiSanHe}三合${wuXing}局，得分+1.0\n`;
                }
            }
            // 地支三会
            const diZhiSanHui = this.checkDiZhiSanHui();
            if (diZhiSanHui) {
                const heWuXing = this.getWuXingFromSanHui(diZhiSanHui);
                if (heWuXing === wuXing) {
                    calculation += `- 地支三会：${diZhiSanHui}三会${wuXing}局，得分+0.8\n`;
                }
            }
        }
        // 总结
        calculation += `\n【总分计算】\n`;
        calculation += `- ${wuXing}五行总得分：${wuXingDetails.total.toFixed(2)}\n`;
        calculation += `- 所有五行总得分：${total.toFixed(2)}\n`;
        calculation += `- ${wuXing}五行相对强度：${wuXingDetails.total.toFixed(2)} / ${total.toFixed(2)} * 10 = ${(wuXingDetails.total / total * 10).toFixed(2)}\n`;
        return calculation;
    }
    /**
     * 显示日主旺衰详细解释
     * @param riZhu 日主旺衰状态
     * @param wuXing 日主五行
     */
    showRiZhuExplanation(riZhu, wuXing) {
        console.log('showRiZhuExplanation 被调用', riZhu, wuXing);
        // 获取日主旺衰详细信息
        const riZhuInfo = {
            explanation: this.getRiZhuDescription(riZhu),
            influence: this.getRiZhuInfluence(riZhu),
            calculation: ''
        };
        console.log('riZhuInfo:', riZhuInfo);
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `日主旺衰详解：${riZhu}`;
        title.className = 'bazi-modal-title';
        // 创建类型
        const type = document.createElement('div');
        type.textContent = `日主五行: ${wuXing.charAt(0)}`; // 只取第一个字符，避免显示"火火"
        type.className = `bazi-modal-type bazi-modal-type-${this.getWuXingClassFromName(wuXing)}`;
        // 创建解释
        const explanationText = document.createElement('div');
        explanationText.textContent = riZhuInfo.explanation;
        explanationText.className = 'bazi-modal-explanation';
        // 创建影响
        const influenceText = document.createElement('div');
        influenceText.textContent = riZhuInfo.influence;
        influenceText.className = 'bazi-modal-influence';
        // 创建计算方法
        const calculation = document.createElement('div');
        calculation.className = 'bazi-modal-calculation';
        // 获取实际计算过程
        let actualCalculation = this.getActualRiZhuCalculation(riZhu, wuXing);
        if (!actualCalculation) {
            actualCalculation = riZhuInfo.calculation;
        }
        // 不需要修复计算结果，因为我们已经使用了新的计算方法
        calculation.innerHTML = `
      <strong>【计算方法】</strong>
      <pre style="user-select: text;">${actualCalculation}</pre>
    `;
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 添加内容到弹窗
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(influenceText);
        modalContent.appendChild(calculation);
        modalContent.appendChild(closeButton);
        // 添加弹窗到页面
        modal.appendChild(modalContent);
        console.log('弹窗创建完成，准备添加到页面');
        document.body.appendChild(modal);
        console.log('弹窗已添加到页面');
        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 获取实际的日主旺衰计算过程
     * @param riZhu 日主旺衰状态
     * @param wuXing 日主五行
     * @returns 实际计算过程
     */
    getActualRiZhuCalculation(riZhu, wuXing) {
        if (!this.baziInfo || !this.baziInfo.riZhuStrengthDetails) {
            return '';
        }
        const details = this.baziInfo.riZhuStrengthDetails;
        // 构建计算过程
        let calculation = `日主旺衰实际计算过程：\n\n`;
        // 基础信息
        calculation += `【基础信息】\n`;
        calculation += `- 日主五行：${wuXing.charAt(0)}\n`; // 只取第一个字符，避免显示"火火"
        calculation += `- 所处季节：${details.season || '未知'}\n`;
        calculation += `- 日主五行基础分值：10.00\n\n`;
        // 季节影响
        calculation += `【季节影响】\n`;
        calculation += `- ${details.seasonEffect || '无季节影响'}\n\n`;
        // 天干关系
        calculation += `【天干关系】\n`;
        calculation += `- ${details.ganRelation || '无天干关系'}\n\n`;
        // 地支关系
        calculation += `【地支关系】\n`;
        calculation += `- ${details.zhiRelation || '无地支关系'}\n\n`;
        // 特殊组合关系
        calculation += `【特殊组合关系】\n`;
        calculation += `- ${details.specialRelation || '无特殊组合关系'}\n\n`;
        // 得分计算
        calculation += `【得分计算】\n`;
        calculation += `- 基础分值：10.00\n`;
        // 计算各项得分
        const seasonScore = this.extractScore(details.seasonEffect || '');
        const ganScore = this.extractScore(details.ganRelation || '');
        const zhiScore = this.extractScore(details.zhiRelation || '');
        const specialScore = this.extractScore(details.specialRelation || '');
        calculation += `- 季节影响得分：${seasonScore.toFixed(2)}\n`;
        calculation += `- 天干关系得分：${ganScore.toFixed(2)}\n`;
        calculation += `- 地支关系得分：${zhiScore.toFixed(2)}\n`;
        calculation += `- 特殊组合得分：${specialScore.toFixed(2)}\n`;
        calculation += `- 综合得分：${details.totalScore.toFixed(2)}\n\n`;
        // 旺衰判定
        calculation += `【旺衰判定】\n`;
        calculation += `- 极旺：得分 ≥ 15\n`;
        calculation += `- 旺：10 ≤ 得分 < 15\n`;
        calculation += `- 偏旺：5 ≤ 得分 < 10\n`;
        calculation += `- 平衡：0 ≤ 得分 < 5\n`;
        calculation += `- 偏弱：-4 ≤ 得分 < 0\n`;
        calculation += `- 弱：-9 ≤ 得分 < -4\n`;
        calculation += `- 极弱：得分 < -9\n\n`;
        // 根据得分判断旺衰状态
        calculation += `根据计算结果${details.totalScore.toFixed(2)}，日主为"${riZhu}"。`;
        return calculation;
    }
    /**
     * 从文本中提取得分
     * @param text 包含得分的文本
     * @returns 提取的得分
     */
    extractScore(text) {
        let score = 0;
        // 匹配所有 (+数字) 或 (-数字) 格式的字符串
        const regex = /([+-])(\d+(\.\d+)?)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const sign = match[1] === '+' ? 1 : -1;
            const value = parseFloat(match[2]);
            score += sign * value;
        }
        // 如果是夏季火旺，但没有匹配到得分，手动添加得分
        if (text.includes('夏季火旺') && score === 0) {
            score = 4;
        }
        return score;
    }
    /**
     * 检查地支三会
     * @returns 三会组合
     */
    checkDiZhiSanHui() {
        const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
        const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined);
        // 检查三会
        const sanHuiPatterns = [
            { pattern: ['寅', '卯', '辰'], type: '寅卯辰' },
            { pattern: ['巳', '午', '未'], type: '巳午未' },
            { pattern: ['申', '酉', '戌'], type: '申酉戌' },
            { pattern: ['亥', '子', '丑'], type: '亥子丑' }
        ];
        for (const { pattern, type } of sanHuiPatterns) {
            // 收集实际出现的地支
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            // 检查是否至少有两个不同的地支
            const uniqueBranches = new Set(matchedBranches);
            if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三会
                return type;
            }
        }
        return '';
    }
    /**
     * 获取三会对应的五行
     * @param sanHui 三会组合
     * @returns 五行
     */
    getWuXingFromSanHui(sanHui) {
        const map = {
            '寅卯辰': '木',
            '巳午未': '火',
            '申酉戌': '金',
            '亥子丑': '水'
        };
        return map[sanHui] || '';
    }
    /**
     * 旧的五行强度计算方法（兼容性）
     * @param wuXing 五行名称
     * @returns 实际计算过程
     */
    getOldWuXingCalculation(wuXing) {
        if (!this.baziInfo || !this.baziInfo.wuXingStrength) {
            return '';
        }
        // 获取八字信息
        const { yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch } = this.baziInfo;
        const { yearNaYin, monthNaYin, dayNaYin, hourNaYin } = this.baziInfo;
        const { yearHideGan, monthHideGan, dayHideGan, hourHideGan } = this.baziInfo;
        // 获取五行强度
        let strength = 0;
        switch (wuXing) {
            case '金':
                strength = this.baziInfo.wuXingStrength.jin;
                break;
            case '木':
                strength = this.baziInfo.wuXingStrength.mu;
                break;
            case '水':
                strength = this.baziInfo.wuXingStrength.shui;
                break;
            case '火':
                strength = this.baziInfo.wuXingStrength.huo;
                break;
            case '土':
                strength = this.baziInfo.wuXingStrength.tu;
                break;
        }
        // 计算总分（包含月令当令加成）
        const total = this.baziInfo.wuXingStrength.jin +
            this.baziInfo.wuXingStrength.mu +
            this.baziInfo.wuXingStrength.shui +
            this.baziInfo.wuXingStrength.huo +
            this.baziInfo.wuXingStrength.tu;
        // 构建计算过程
        let calculation = `${wuXing}五行强度实际计算过程：\n\n`;
        // 天干部分
        calculation += `【天干五行】\n`;
        if (this.getWuXingFromStem(yearStem) === wuXing) {
            calculation += `- 年干${yearStem}为${wuXing}，得分1.0\n`;
        }
        if (this.getWuXingFromStem(monthStem) === wuXing) {
            calculation += `- 月干${monthStem}为${wuXing}，得分2.0\n`;
        }
        if (this.getWuXingFromStem(dayStem) === wuXing) {
            calculation += `- 日干${dayStem}为${wuXing}，得分3.0\n`;
        }
        if (this.getWuXingFromStem(hourStem) === wuXing) {
            calculation += `- 时干${hourStem}为${wuXing}，得分1.0\n`;
        }
        // 地支藏干部分
        calculation += `\n【地支藏干】\n`;
        if (yearHideGan) {
            const yearHideGanArray = Array.isArray(yearHideGan) ? yearHideGan : yearHideGan.split('');
            for (const gan of yearHideGanArray) {
                if (this.getWuXingFromStem(gan) === wuXing) {
                    calculation += `- 年支${yearBranch}藏${gan}为${wuXing}，得分0.7\n`;
                }
            }
        }
        if (monthHideGan) {
            const monthHideGanArray = Array.isArray(monthHideGan) ? monthHideGan : monthHideGan.split('');
            for (const gan of monthHideGanArray) {
                if (this.getWuXingFromStem(gan) === wuXing) {
                    calculation += `- 月支${monthBranch}藏${gan}为${wuXing}，得分1.5\n`;
                }
            }
        }
        if (dayHideGan) {
            const dayHideGanArray = Array.isArray(dayHideGan) ? dayHideGan : dayHideGan.split('');
            for (const gan of dayHideGanArray) {
                if (this.getWuXingFromStem(gan) === wuXing) {
                    calculation += `- 日支${dayBranch}藏${gan}为${wuXing}，得分2.0\n`;
                }
            }
        }
        if (hourHideGan) {
            const hourHideGanArray = Array.isArray(hourHideGan) ? hourHideGan : hourHideGan.split('');
            for (const gan of hourHideGanArray) {
                if (this.getWuXingFromStem(gan) === wuXing) {
                    calculation += `- 时支${hourBranch}藏${gan}为${wuXing}，得分0.7\n`;
                }
            }
        }
        // 纳音五行部分
        calculation += `\n【纳音五行】\n`;
        if (yearNaYin && yearNaYin.includes(wuXing)) {
            calculation += `- 年柱纳音${yearNaYin}为${wuXing}，得分0.5\n`;
        }
        if (monthNaYin && monthNaYin.includes(wuXing)) {
            calculation += `- 月柱纳音${monthNaYin}为${wuXing}，得分1.0\n`;
        }
        if (dayNaYin && dayNaYin.includes(wuXing)) {
            calculation += `- 日柱纳音${dayNaYin}为${wuXing}，得分1.5\n`;
        }
        if (hourNaYin && hourNaYin.includes(wuXing)) {
            calculation += `- 时柱纳音${hourNaYin}为${wuXing}，得分0.5\n`;
        }
        // 季节调整
        calculation += `\n【季节调整】\n`;
        const season = this.getSeason(monthBranch);
        calculation += `- 当前季节：${season}\n`;
        switch (season) {
            case '春季':
                if (wuXing === '木')
                    calculation += `- 春季木旺，得分+2.0\n`;
                if (wuXing === '火')
                    calculation += `- 春季火相，得分+1.0\n`;
                if (wuXing === '金')
                    calculation += `- 春季金囚，得分-1.0\n`;
                if (wuXing === '水')
                    calculation += `- 春季水死，得分-1.5\n`;
                break;
            case '夏季':
                if (wuXing === '火')
                    calculation += `- 夏季火旺，得分+2.0\n`;
                if (wuXing === '土')
                    calculation += `- 夏季土相，得分+1.0\n`;
                if (wuXing === '水')
                    calculation += `- 夏季水囚，得分-1.0\n`;
                if (wuXing === '木')
                    calculation += `- 夏季木死，得分-1.5\n`;
                break;
            case '秋季':
                if (wuXing === '金')
                    calculation += `- 秋季金旺，得分+2.0\n`;
                if (wuXing === '水')
                    calculation += `- 秋季水相，得分+1.0\n`;
                if (wuXing === '火')
                    calculation += `- 秋季火囚，得分-1.0\n`;
                if (wuXing === '土')
                    calculation += `- 秋季土死，得分-1.5\n`;
                break;
            case '冬季':
                if (wuXing === '水')
                    calculation += `- 冬季水旺，得分+2.0\n`;
                if (wuXing === '木')
                    calculation += `- 冬季木相，得分+1.0\n`;
                if (wuXing === '土')
                    calculation += `- 冬季土囚，得分-1.0\n`;
                if (wuXing === '金')
                    calculation += `- 冬季金死，得分-1.5\n`;
                break;
        }
        // 月令当令加成
        calculation += `\n【月令当令加成】\n`;
        switch (season) {
            case '春季':
                if (wuXing === '木')
                    calculation += `- 春季木当令，得分+1.5\n`;
                if (wuXing === '火')
                    calculation += `- 春季火相旺，得分+0.8\n`;
                break;
            case '夏季':
                if (wuXing === '火')
                    calculation += `- 夏季火当令，得分+1.5\n`;
                if (wuXing === '土')
                    calculation += `- 夏季土相旺，得分+0.8\n`;
                break;
            case '秋季':
                if (wuXing === '金')
                    calculation += `- 秋季金当令，得分+1.5\n`;
                if (wuXing === '水')
                    calculation += `- 秋季水相旺，得分+0.8\n`;
                break;
            case '冬季':
                if (wuXing === '水')
                    calculation += `- 冬季水当令，得分+1.5\n`;
                if (wuXing === '木')
                    calculation += `- 冬季木相旺，得分+0.8\n`;
                break;
        }
        // 组合调整
        calculation += `\n【组合调整】\n`;
        // 天干五合
        const tianGanWuHe = this.checkTianGanWuHe();
        if (tianGanWuHe) {
            const heWuXing = this.getWuXingFromWuHe(tianGanWuHe);
            if (heWuXing === wuXing) {
                calculation += `- 天干五合：${tianGanWuHe}合化${wuXing}，得分+0.6\n`;
            }
        }
        // 地支三合
        const diZhiSanHe = this.checkDiZhiSanHe();
        if (diZhiSanHe) {
            const heWuXing = this.getWuXingFromSanHe(diZhiSanHe);
            if (heWuXing === wuXing) {
                calculation += `- 地支三合：${diZhiSanHe}三合${wuXing}局，得分+1.2\n`;
            }
        }
        // 地支三会
        const diZhiSanHui = this.checkDiZhiSanHui();
        if (diZhiSanHui) {
            const heWuXing = this.getWuXingFromSanHui(diZhiSanHui);
            if (heWuXing === wuXing) {
                calculation += `- 地支三会：${diZhiSanHui}三会${wuXing}局，得分+1.0\n`;
            }
        }
        // 总结
        calculation += `\n【总分计算】\n`;
        calculation += `- ${wuXing}五行总得分：${strength.toFixed(2)}\n`;
        calculation += `- 所有五行总得分：${total.toFixed(2)}\n`;
        calculation += `- ${wuXing}五行相对强度：${strength.toFixed(2)} / ${total.toFixed(2)} * 10 = ${(strength / total * 10).toFixed(2)}\n`;
        return calculation;
    }
    /**
     * 获取天干对应的五行
     * @param stem 天干
     * @returns 五行
     */
    getWuXingFromStem(stem) {
        if (!stem)
            return '';
        const map = {
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
     * @param branch 地支
     * @returns 五行
     */
    getBranchWuXing(branch) {
        if (!branch)
            return '';
        const map = {
            '寅': '木', '卯': '木',
            '巳': '火', '午': '火',
            '辰': '土', '丑': '土', '戌': '土', '未': '土',
            '申': '金', '酉': '金',
            '亥': '水', '子': '水'
        };
        return map[branch] || '';
    }
    /**
     * 根据地支获取季节
     * @param branch 地支
     * @returns 季节
     */
    getSeason(branch) {
        if (!branch)
            return '春季'; // 默认为春季
        const map = {
            '寅': '春季', '卯': '春季', '辰': '春季',
            '巳': '夏季', '午': '夏季', '未': '夏季',
            '申': '秋季', '酉': '秋季', '戌': '秋季',
            '亥': '冬季', '子': '冬季', '丑': '冬季'
        };
        return map[branch] || '春季';
    }
    /**
     * 检查天干五合
     * @returns 五合组合
     */
    checkTianGanWuHe() {
        const { yearStem, monthStem, dayStem, hourStem } = this.baziInfo;
        const stems = [yearStem, monthStem, dayStem, hourStem];
        // 检查五合
        if (stems.includes('甲') && stems.includes('己'))
            return '甲己';
        if (stems.includes('乙') && stems.includes('庚'))
            return '乙庚';
        if (stems.includes('丙') && stems.includes('辛'))
            return '丙辛';
        if (stems.includes('丁') && stems.includes('壬'))
            return '丁壬';
        if (stems.includes('戊') && stems.includes('癸'))
            return '戊癸';
        return '';
    }
    /**
     * 获取五合对应的五行
     * @param wuHe 五合组合
     * @returns 五行
     */
    getWuXingFromWuHe(wuHe) {
        const map = {
            '甲己': '土',
            '乙庚': '金',
            '丙辛': '水',
            '丁壬': '木',
            '戊癸': '火'
        };
        return map[wuHe] || '';
    }
    /**
     * 检查地支三合
     * @returns 三合组合
     */
    checkDiZhiSanHe() {
        const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
        const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
        // 检查三合
        const hasZi = branches.includes('子');
        const hasShen = branches.includes('申');
        const hasChen = branches.includes('辰');
        if (hasZi && hasShen && hasChen)
            return '子申辰';
        const hasHai = branches.includes('亥');
        const hasMao = branches.includes('卯');
        const hasWei = branches.includes('未');
        if (hasHai && hasMao && hasWei)
            return '亥卯未';
        const hasYin = branches.includes('寅');
        const hasWu = branches.includes('午');
        const hasXu = branches.includes('戌');
        if (hasYin && hasWu && hasXu)
            return '寅午戌';
        const hasSi = branches.includes('巳');
        const hasYou = branches.includes('酉');
        const hasChou = branches.includes('丑');
        if (hasSi && hasYou && hasChou)
            return '巳酉丑';
        return '';
    }
    /**
     * 获取三合对应的五行
     * @param sanHe 三合组合
     * @returns 五行
     */
    getWuXingFromSanHe(sanHe) {
        const map = {
            '子申辰': '水',
            '亥卯未': '木',
            '寅午戌': '火',
            '巳酉丑': '金'
        };
        return map[sanHe] || '';
    }
    /**
     * 获取日主旺衰的描述
     * @param riZhu 日主旺衰状态
     * @returns 描述
     */
    getRiZhuDescription(riZhu) {
        const descriptions = {
            '极旺': '日主五行力量极强，能量过剩，需要泄秀。性格刚强，自信心强，有主见，做事有魄力。',
            '旺': '日主五行力量充沛，能量充足，宜泄不宜扶。性格较为刚强，自信心强，有主见，做事有魄力。',
            '偏旺': '日主五行力量较强，能量略有盈余，宜适度泄秀。性格较为平衡，自信但不过分，能够适应各种环境。',
            '平衡': '日主五行力量适中，能量平衡，喜忌需视具体情况而定。性格温和，适应力强，能够融入各种环境。',
            '偏弱': '日主五行力量略显不足，能量略有不足，宜适度扶助。性格较为内向，自信心不足，容易受外界影响。',
            '弱': '日主五行力量不足，能量缺乏，需要扶助。性格较为内向，自信心不足，容易受外界影响。',
            '极弱': '日主五行力量极弱，能量严重不足，急需扶助。性格软弱，缺乏自信，容易受制于人。'
        };
        return descriptions[riZhu] || '日主五行力量适中，能量平衡。';
    }
    /**
     * 获取日主旺衰的影响
     * @param riZhu 日主旺衰状态
     * @returns 影响
     */
    getRiZhuInfluence(riZhu) {
        const influences = {
            '极旺': '日主过旺，喜用泄秀之物（财星、官星）来泄其过旺之气。忌用印比之物，以免更加旺盛。',
            '旺': '日主旺盛，喜用泄秀之物（财星、官星）来泄其旺盛之气。忌用印比之物，以免更加旺盛。',
            '偏旺': '日主偏旺，喜用泄秀之物，但不宜过多。可适当用印比之物调和。',
            '平衡': '日主平衡，根据具体情况，可取印比或财官。需要综合考虑八字格局。',
            '偏弱': '日主偏弱，喜用生扶之物（印星、比劫）来增强日主力量。忌用泄秀之物，以免更加衰弱。',
            '弱': '日主衰弱，喜用生扶之物（印星、比劫）来增强日主力量。忌用泄秀之物，以免更加衰弱。',
            '极弱': '日主极弱，必须用生扶之物来增强日主力量。严禁用泄秀之物，以免更加衰弱。'
        };
        return influences[riZhu] || '日主平衡，需要综合考虑八字格局。';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCYXppVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkludGVyYWN0aXZlQmF6aVZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBa0I5Qjs7Ozs7T0FLRztJQUNILFlBQVksU0FBc0IsRUFBRSxRQUFrQixFQUFFLEVBQVU7UUFuQmxFLGVBQWU7UUFDUCx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0Isd0JBQW1CLEdBQVcsQ0FBQyxDQUFDO1FBRXhDLFNBQVM7UUFDRCxlQUFVLEdBQXVCLElBQUksQ0FBQztRQUN0QyxpQkFBWSxHQUF1QixJQUFJLENBQUM7UUFDeEMsaUJBQVksR0FBdUIsSUFBSSxDQUFDO1FBQ3hDLGdCQUFXLEdBQXVCLElBQUksQ0FBQztRQUUvQyxPQUFPO1FBQ0Msc0JBQWlCLEdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSztRQVM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUViLFFBQVE7UUFDUixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssUUFBUTtRQUNkLE9BQU87UUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFakQsWUFBWTtRQUNaLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixTQUFTO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZC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TyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUztRQUNULE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUztRQUNULE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzNDLE1B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QyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUztRQUNULE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsV0FBVztRQUNYLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO2dCQUNsQyxHQUFHLEVBQUUsbUJBQW1CO2dCQUN4QixJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTthQUMxQyxDQUFDLENBQUM7WUFFSCxnQkFBZ0I7WUFDaEIsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7Z0JBQ2hDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUVsQyxnQkFBZ0I7Z0JBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRWhFLGdCQUFnQjtnQkFDaEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN2RTtpQkFBTTtnQkFDTCx1QkFBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7YUFDcEM7WUFFRCxTQUFTO1lBQ1QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1lBRUgsb0JBQW9CO1lBQ3BCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxnQkFBZ0I7UUFDaEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNoQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDMUIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLElBQUksRUFBRTtvQkFDekIsR0FBRyxFQUFFLG1CQUFtQjtpQkFDekIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELGdCQUFnQjtRQUNoQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO29CQUN4QixJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNwQixHQUFHLEVBQUUsaUJBQWlCO2lCQUN2QixDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsV0FBVztRQUNYLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ2xDLEdBQUcsRUFBRSxtQkFBbUI7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxnQkFBZ0I7Z0JBQ2hCLElBQUksRUFBRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3hDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO29CQUNyQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtvQkFFckMscUJBQXFCO29CQUNyQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUVoRSxxQkFBcUI7b0JBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2pFO3FCQUFNO29CQUNMLHVCQUF1QjtvQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztpQkFDckM7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsV0FBVztRQUNYLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV2Qyx1QkFBdUI7WUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDbEMsR0FBRyxFQUFFLG1CQUFtQjtpQkFDekIsQ0FBQyxDQUFDO2dCQUVILGtCQUFrQjtnQkFDbEIsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQzVDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO29CQUNoQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztvQkFFbEMsZ0JBQWdCO29CQUNoQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUVoRSxnQkFBZ0I7b0JBQ2hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDckQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQ3ZFO3FCQUFNO29CQUNMLHVCQUF1QjtvQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2lCQUNoRDtnQkFFRCx5QkFBeUI7Z0JBQ3pCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNoQztZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDMUIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNyQyxHQUFHLEVBQUUsbUJBQW1CO2lCQUN6QixDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsZ0JBQWdCO1FBQ2hCLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRTVDLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDeEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ3hCLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDaEMsR0FBRyxFQUFFLGlCQUFpQjtpQkFDdkIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELFdBQVc7UUFDWCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUV6Qyx1QkFBdUI7WUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDbEMsR0FBRyxFQUFFLG1CQUFtQjtpQkFDekIsQ0FBQyxDQUFDO2dCQUVILGdCQUFnQjtnQkFDaEIsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQzlDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO29CQUNyQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtvQkFFckMscUJBQXFCO29CQUNyQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUVoRSxxQkFBcUI7b0JBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2pFO3FCQUFNO29CQUNMLHVCQUF1QjtvQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2lCQUNqRDtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxZQUFZO1FBQ1osVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQzthQUN2QztRQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNULENBQUM7SUFFRDs7O09BR0c7SUFDSyxpQkFBaUIsQ0FBQyxNQUFhO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLE9BQU87U0FDUjtRQUVELE9BQU87UUFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXpCLFlBQVk7UUFDWixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87U0FDUjtRQUVELFNBQVM7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxXQUFXLElBQUksQ0FBQyxpQkFBaUIsZ0JBQWdCLENBQUM7UUFFdEYsU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNsQixjQUFjO1lBQ2QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksT0FBTyxFQUFFLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDaEMscUJBQXFCO2dCQUNyQixTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQzthQUN0QjtpQkFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZDLGdCQUFnQjtnQkFDaEIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDdkYsU0FBUyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQzNDO2lCQUFNLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRTtnQkFDNUIsMkNBQTJDO2dCQUMzQyxTQUFTLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQzthQUMvQjtpQkFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUNqQyxrQ0FBa0M7Z0JBQ2xDLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbkYsU0FBUyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQzNDO1lBRUQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLElBQUksRUFBRSxTQUFTO2dCQUNmLEdBQUcsRUFBRSxtQkFBbUI7YUFDekIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTO1FBQ1QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2xCLHdCQUF3QjtZQUN4QixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDakIsSUFBSSxPQUFPLEVBQUUsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ2hFLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQy9CO2lCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ2pDLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7YUFDdEQ7WUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDaEMsR0FBRyxFQUFFLGtCQUFrQjtnQkFDdkIsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRTthQUNoQyxDQUFDLENBQUM7WUFFSCxnQkFBZ0I7WUFDaEIsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7Z0JBQ2hDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUVsQyxnQkFBZ0I7Z0JBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRWhFLGdCQUFnQjtnQkFDaEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN2RTtpQkFBTTtnQkFDTCx1QkFBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7YUFDcEM7WUFFRCxTQUFTO1lBQ1QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7O2dCQUNsQyxXQUFXO2dCQUNYLE1BQUEsSUFBSSxDQUFDLFdBQVcsMENBQUUsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNsRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILGNBQWM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNsQixVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDeEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLElBQUksRUFBRTtvQkFDekIsR0FBRyxFQUFFLG1CQUFtQjtpQkFDekIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELGNBQWM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNsQixRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDdEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDcEIsR0FBRyxFQUFFLGlCQUFpQjtpQkFDdkIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELFNBQVM7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDbEIsY0FBYztZQUNkLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7YUFDdEI7aUJBQU0sSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Z0JBQy9CLDRCQUE0QjtnQkFDNUIsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0wsZ0JBQWdCO2dCQUNoQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUN6QixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDakMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0Y7WUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDaEMsR0FBRyxFQUFFLG1CQUFtQjthQUN6QixDQUFDLENBQUM7WUFFSCxnQkFBZ0I7WUFDaEIsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7Z0JBQ2xDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7Z0JBRWxDLHFCQUFxQjtnQkFDckIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFaEUscUJBQXFCO2dCQUNyQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2pFO2lCQUFNO2dCQUNMLHVCQUF1QjtnQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7YUFDNUI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILGNBQWM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ25DLEdBQUcsRUFBRSxpQkFBaUI7aUJBQ3ZCLENBQUMsQ0FBQztnQkFFSCxJQUFJLEtBQUssRUFBRTtvQkFDVCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDaEQ7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsWUFBWTtRQUNaLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7YUFDdEM7UUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHVCQUF1QixDQUFDLEtBQVU7O1FBQ3hDLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNwQixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsdUJBQXVCO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLE1BQUEsS0FBSyxDQUFDLE9BQU8sbUNBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXZELFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBNkcsRUFBRSxDQUFDO1FBQ2pJLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFFekIsY0FBYztRQUNkLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBRXRDLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLElBQUksT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQy9ELE9BQU87WUFDUCxTQUFTO1lBQ1QsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDO1lBQzNCLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQztZQUVoQyxTQUFTO1lBQ1QsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVwQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7WUFFN0IsT0FBTztZQUNQLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFcEQsY0FBYztZQUNkLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLE9BQU8sRUFBRTtnQkFDWCxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDN0M7WUFFRCxjQUFjO1lBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDZixJQUFJO2dCQUNKLEdBQUc7Z0JBQ0gsTUFBTTtnQkFDTixPQUFPO2dCQUNQLFVBQVU7Z0JBQ1YsS0FBSzthQUNOLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyx1QkFBdUIsQ0FBQyxLQUFVOztRQUN4QyxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCx1QkFBdUI7UUFDdkIsTUFBTSxPQUFPLEdBQUcsTUFBQSxLQUFLLENBQUMsT0FBTyxtQ0FBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssQ0FBQyxTQUFTLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztRQUV2RCxTQUFTO1FBQ1QsTUFBTSxXQUFXLEdBQTZHLEVBQUUsQ0FBQztRQUNqSSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBRXpCLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEMsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRWxDLFNBQVM7UUFDVCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDM0IsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDO1FBRWhDLFNBQVM7UUFDVCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxRCxJQUFJLGNBQWMsS0FBSyxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsY0FBYztRQUNkLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBRXRDLGVBQWU7UUFDZixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUVuQyx3QkFBd0I7WUFDeEIsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQy9ELHlCQUF5QjtnQkFDekIsd0JBQXdCO2dCQUN4QixNQUFNLFNBQVMsR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25FLE1BQU0sV0FBVyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUV2RSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztnQkFFN0IsT0FBTztnQkFDUCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUVwRCxjQUFjO2dCQUNkLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM3QztnQkFFRCxjQUFjO2dCQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDZixJQUFJLE9BQU8sRUFBRTtvQkFDWCxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ3hDO2dCQUVELFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2YsSUFBSTtvQkFDSixHQUFHO29CQUNILE1BQU07b0JBQ04sT0FBTztvQkFDUCxVQUFVO29CQUNWLEtBQUs7aUJBQ04sQ0FBQyxDQUFDO2FBQ0o7U0FDRjthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsU0FBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBRXRELFNBQVM7WUFDVCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV2RCxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDL0QscUJBQXFCO2dCQUNyQixNQUFNLFNBQVMsR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25FLE1BQU0sV0FBVyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUV2RSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztnQkFFN0IsT0FBTztnQkFDUCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUVwRCxjQUFjO2dCQUNkLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM3QztnQkFFRCxjQUFjO2dCQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDZixJQUFJLE9BQU8sRUFBRTtvQkFDWCxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ3hDO2dCQUVELFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2YsSUFBSTtvQkFDSixHQUFHO29CQUNILE1BQU07b0JBQ04sT0FBTztvQkFDUCxVQUFVO29CQUNWLEtBQUs7aUJBQ04sQ0FBQyxDQUFDO2FBQ0o7U0FDRjtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxHQUFXO1FBQy9DLDJCQUEyQjtRQUMzQixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLDRCQUE0QjtRQUM1QixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxPQUFPO1FBQ1AsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWxELFNBQVM7UUFDVCxNQUFNLGFBQWEsR0FBRyxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDL0MsTUFBTSxhQUFhLEdBQUcsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRS9DLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFekQsT0FBTyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFNRDs7OztPQUlHO0lBQ0ssc0JBQXNCLENBQUMsT0FBb0IsRUFBRSxNQUEwQjtRQUM3RSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFFcEIsYUFBYTtRQUNiLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU5RixXQUFXO1FBQ1gsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3BDLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25DLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JDLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3BDLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25DLE1BQU07U0FDVDtRQUVELGFBQWE7UUFDYixRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssR0FBRztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxTQUFTO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxHQUFHO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzFDLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsU0FBUztnQkFDMUMsTUFBTTtZQUNSLEtBQUssR0FBRztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxTQUFTO2dCQUMxQyxNQUFNO1lBQ1IsS0FBSyxHQUFHO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzFDLE1BQU07U0FDVDtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssb0JBQW9CLENBQUMsT0FBb0IsRUFBRSxJQUFZO1FBQzdELFlBQVk7UUFDWixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhDLFdBQVc7UUFDWCxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssR0FBRztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRywwREFBMEQsQ0FBQyxDQUFDLFNBQVM7Z0JBQzdGLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsMERBQTBELENBQUMsQ0FBQyxTQUFTO2dCQUM3RixNQUFNO1lBQ1IsS0FBSyxHQUFHO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLDBEQUEwRCxDQUFDLENBQUMsU0FBUztnQkFDN0YsTUFBTTtZQUNSLEtBQUssR0FBRztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRywwREFBMEQsQ0FBQyxDQUFDLFNBQVM7Z0JBQzdGLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsMERBQTBELENBQUMsQ0FBQyxTQUFTO2dCQUM3RixNQUFNO1NBQ1Q7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHNCQUFzQixDQUFDLE9BQW9CLEVBQUUsTUFBYztRQUNqRSxZQUFZO1FBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1QyxXQUFXO1FBQ1gsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsMERBQTBELENBQUMsQ0FBQyxTQUFTO2dCQUM3RixNQUFNO1lBQ1IsS0FBSyxHQUFHO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLDBEQUEwRCxDQUFDLENBQUMsU0FBUztnQkFDN0YsTUFBTTtZQUNSLEtBQUssR0FBRztnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRywwREFBMEQsQ0FBQyxDQUFDLFNBQVM7Z0JBQzdGLE1BQU07WUFDUixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsMERBQTBELENBQUMsQ0FBQyxTQUFTO2dCQUM3RixNQUFNO1lBQ1IsS0FBSyxHQUFHO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLDBEQUEwRCxDQUFDLENBQUMsU0FBUztnQkFDN0YsTUFBTTtTQUNUO0lBQ0gsQ0FBQztJQVVEOzs7O09BSUc7SUFDSyxzQkFBc0IsQ0FBQyxLQUFhO1FBQzFDLCtCQUErQjtRQUMvQixvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsVUFBVTtRQUNWLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoRCxXQUFXO1FBQ1gsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEQsT0FBTyxRQUFRLENBQUM7U0FDakI7UUFFRCw0QkFBNEI7UUFDNUIsS0FBSyxNQUFNLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRTtZQUM5QyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxvQkFBb0IsQ0FBQyxTQUFzQixFQUFFLFdBQW1CO1FBQ3RFLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDM0IsT0FBTztTQUNSO1FBRUQsc0JBQXNCO1FBQ3RCLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3QixNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFN0Msa0JBQWtCO2dCQUNsQixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDL0IsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2lCQUNyQztZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU87WUFDUCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0MsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDOUM7U0FDRjtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYSxDQUFDLElBQVk7UUFDaEMsTUFBTSxHQUFHLEdBQTRCO1lBQ25DLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1NBQ1QsQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxVQUFVLENBQUMsT0FBZSxFQUFFLElBQVk7UUFDOUMsT0FBTztRQUNQLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQztRQUUzQixZQUFZO1FBQ1oscUVBQXFFO1FBRXJFLE9BQU87UUFDUCxNQUFNLFlBQVksR0FBRztZQUNuQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUM1RCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFHLEtBQUs7U0FDckUsQ0FBQztRQUVGLGVBQWU7UUFDZixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEMsSUFBSSxZQUFZLEtBQUssQ0FBQyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzNDLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxTQUFTO1FBQ1QsTUFBTSxVQUFVLEdBQUcsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsWUFBWTtRQUVoRSxTQUFTO1FBQ1QsSUFBSSxZQUFZLEdBQUcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUV4RCxTQUFTO1FBQ1QsT0FBTyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssUUFBUSxDQUFDLE9BQWUsRUFBRSxNQUFjO1FBQzlDLE9BQU87UUFDUCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFFaEMsVUFBVTtRQUNWLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVyRixhQUFhO1FBQ2IsTUFBTSxXQUFXLEdBQTJCO1lBQzFDLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUMxQixHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDMUIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQzFCLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUMxQixHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDMUIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQzFCLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUMxQixHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDMUIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQzFCLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFHLFNBQVM7U0FDdkMsQ0FBQztRQUVGLFNBQVM7UUFDVCxNQUFNLFVBQVUsR0FBMkI7WUFDekMsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ1IsQ0FBQztRQUVGLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbkQsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELFVBQVU7UUFDVixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLFNBQVM7UUFDVCxJQUFJLFVBQVUsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RELElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLFVBQVUsR0FBRyxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDckM7UUFFRCxTQUFTO1FBQ1QsT0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHNCQUFzQixDQUFDLE9BQWU7UUFDNUMsV0FBVztRQUNYLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsRSxPQUFPO1FBQ1AsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztRQUUvQixTQUFTO1FBQ1QsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxZQUFZLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDO1FBRTlDLE9BQU87UUFDUCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNyQyxLQUFLLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO1FBRXJDLGdCQUFnQjtRQUNoQixJQUFJLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztRQUNsQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzdCLFNBQVMsSUFBSSx1QkFBdUIsQ0FBQztTQUN0QzthQUFNLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDcEMsU0FBUyxJQUFJLHNCQUFzQixDQUFDO1NBQ3JDO2FBQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtZQUNyQyxTQUFTLElBQUksd0JBQXdCLENBQUM7U0FDdkM7UUFFRCxPQUFPO1FBQ1AsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLE9BQU87UUFDUCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELGVBQWUsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztRQUN0RCxlQUFlLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDO1FBRXJELE9BQU87UUFDUCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELFNBQVMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUM5QyxTQUFTLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO1FBRTdDLFlBQVk7UUFDWixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0QsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekYsa0JBQWtCO1lBQ2xCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUM3RSxxQkFBcUI7WUFDckIsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUVwRyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ25DLFdBQVc7Z0JBQ1gsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RCxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO2dCQUN6QyxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcscUJBQXFCLENBQUM7Z0JBQ3BELFlBQVksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFFNUMsZ0NBQWdDO2dCQUNoQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFckcsV0FBVztnQkFDWCxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JELGNBQWMsQ0FBQyxTQUFTLEdBQUcsNEJBQTRCLENBQUM7b0JBRXhELGdCQUFnQjtvQkFDaEIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTt3QkFDekIsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQzVDO3lCQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7d0JBQy9CLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUMzQzt5QkFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO3dCQUNqQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDN0M7b0JBRUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFakQsZ0JBQWdCO29CQUNoQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7b0JBQ25CLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztvQkFDcEIsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTt3QkFDckIsU0FBUyxHQUFHLFNBQVMsQ0FBQzt3QkFDdEIsVUFBVSxHQUFHLDBCQUEwQixDQUFDO3FCQUN6Qzt5QkFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO3dCQUM1QixTQUFTLEdBQUcsU0FBUyxDQUFDO3dCQUN0QixVQUFVLEdBQUcsMEJBQTBCLENBQUM7cUJBQ3pDO3lCQUFNO3dCQUNMLFNBQVMsR0FBRyxTQUFTLENBQUM7d0JBQ3RCLFVBQVUsR0FBRywwQkFBMEIsQ0FBQztxQkFDekM7b0JBRUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDakQsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7b0JBQ2xDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO29CQUVqQyxnQkFBZ0I7b0JBQ2hCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO29CQUNuQixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO3dCQUN6QixRQUFRLEdBQUcsTUFBTSxDQUFDO3dCQUNsQixTQUFTLEdBQUcsc0NBQXNDLENBQUM7cUJBQ3BEO3lCQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7d0JBQy9CLFFBQVEsR0FBRyxNQUFNLENBQUM7d0JBQ2xCLFNBQVMsR0FBRyxxQ0FBcUMsQ0FBQztxQkFDbkQ7eUJBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTt3QkFDakMsUUFBUSxHQUFHLE9BQU8sQ0FBQzt3QkFDbkIsU0FBUyxHQUFHLHVDQUF1QyxDQUFDO3FCQUNyRDtvQkFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRCxRQUFRLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztvQkFDaEMsUUFBUSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7b0JBRS9CLFVBQVUsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7b0JBQ2pELFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUM7b0JBRWhELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BELGFBQWEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztvQkFDM0MsYUFBYSxDQUFDLFNBQVMsR0FBRywyQkFBMkIsQ0FBQztvQkFFdEQsU0FBUztvQkFDVCxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7d0JBQ2hCLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2xELFdBQVcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7d0JBQ2xELFdBQVcsQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUM7d0JBQzVDLGNBQWMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3ZDLGNBQWMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQzFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7cUJBQ3pDO3lCQUFNO3dCQUNMLGNBQWMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3ZDLGNBQWMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7cUJBQzNDO29CQUVELFNBQVM7b0JBQ1QsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO3dCQUNuQixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNyRCxjQUFjLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO3dCQUN4RCxjQUFjLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO3dCQUNsRCxjQUFjLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3FCQUM1QztvQkFFRCxTQUFTO29CQUNULElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTt3QkFDbEIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDcEQsYUFBYSxDQUFDLFdBQVcsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQzt3QkFDdEQsYUFBYSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQzt3QkFDaEQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDM0M7b0JBRUQsWUFBWSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLENBQUM7YUFDSjtTQUNGO1FBRUQsU0FBUztRQUNULE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsV0FBVyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDL0IsV0FBVyxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztRQUMzQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXBDLGNBQWM7UUFDZCxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUU7WUFDM0IsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxXQUFXLENBQUMsU0FBUyxHQUFHOzswQ0FFWSxXQUFXLENBQUMsV0FBVztPQUMxRCxDQUFDO1lBQ0YsV0FBVyxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztZQUNqRCxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0QyxVQUFVO1FBQ1YsS0FBSyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssOEJBQThCLENBQUMsV0FBc0Q7UUFDM0YsT0FBTztRQUNQLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7UUFFL0IsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsWUFBWSxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztRQUU5QyxPQUFPO1FBQ1AsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztRQUM3QixLQUFLLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO1FBRXJDLFNBQVM7UUFDVCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELGVBQWUsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztRQUN0RCxlQUFlLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDO1FBRWxELFdBQVc7UUFDWCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxhQUFhO1FBQ2IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxhQUFhLENBQUMsU0FBUyxHQUFHLDJCQUEyQixDQUFDO1FBRXRELGNBQWM7UUFDZCxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFL0MsZ0JBQWdCO2dCQUNoQixJQUFJLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztnQkFDbEMsSUFBSSxXQUFXLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtvQkFDN0IsU0FBUyxJQUFJLHVCQUF1QixDQUFDO2lCQUN0QztxQkFBTSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO29CQUNwQyxTQUFTLElBQUksc0JBQXNCLENBQUM7aUJBQ3JDO3FCQUFNLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7b0JBQ3JDLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQztpQkFDdkM7Z0JBRUQsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUNyRCxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3BDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPO1FBQ1AsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQyxRQUFRLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDNUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztRQUUzQyxTQUFTO1FBQ1QsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRCxXQUFXLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUMvQixXQUFXLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO1FBQzNDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVTtRQUNWLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxQyxZQUFZLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3hDLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0QyxVQUFVO1FBQ1YsS0FBSyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMkRBQTJEO0lBRTNELDZEQUE2RDtJQUU3RDs7O09BR0c7SUFDSyxjQUFjLENBQUMsU0FBc0I7UUFDM0MsZ0NBQWdDO1FBQ2hDLE9BQU87SUFDVCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHNCQUFzQixDQUFDLE1BQWM7UUFDM0MsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1lBQ3ZCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUM7WUFDdEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUN4QixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1lBQ3ZCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUM7WUFDdEIsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPO1NBQzlCO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxxQkFBcUIsQ0FBQyxNQUFjLEVBQUUsS0FBYTtRQUN6RCxXQUFXO1FBQ1gsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU87UUFFeEIsT0FBTztRQUNQLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7UUFFL0IsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsWUFBWSxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztRQUU5QyxPQUFPO1FBQ1AsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsV0FBVyxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUM7UUFDdEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztRQUVyQyxPQUFPO1FBQ1AsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsS0FBSyxFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxtQ0FBbUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFFMUYsT0FBTztRQUNQLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsZUFBZSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQ3JELGVBQWUsQ0FBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUM7UUFFckQsT0FBTztRQUNQLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsYUFBYSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ2pELGFBQWEsQ0FBQyxTQUFTLEdBQUcsc0JBQXNCLENBQUM7UUFFakQsU0FBUztRQUNULE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsV0FBVyxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztRQUVqRCxXQUFXO1FBQ1gsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3RCLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7U0FDNUM7UUFFRCxXQUFXLENBQUMsU0FBUyxHQUFHOzt3Q0FFWSxpQkFBaUI7S0FDcEQsQ0FBQztRQUVGLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELFdBQVcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQy9CLFdBQVcsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUM7UUFDM0MsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDekMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLFlBQVksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4QyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLFlBQVksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEMsVUFBVTtRQUNWLEtBQUssQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakMsYUFBYTtRQUNiLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO2dCQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSywwQkFBMEIsQ0FBQyxNQUFjO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7WUFDbkQsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELFlBQVk7UUFDWixJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNoRCxvQkFBb0I7WUFDcEIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0M7UUFFRCxXQUFXO1FBQ1gsTUFBTSxPQUFPLEdBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFzQixDQUFDLE9BQU8sQ0FBQztRQUU5RCxZQUFZO1FBQ1osSUFBSSxhQUF3SCxDQUFDO1FBQzdILFFBQVEsTUFBTSxFQUFFO1lBQ2QsS0FBSyxHQUFHO2dCQUFFLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUFDLE1BQU07WUFDN0MsS0FBSyxHQUFHO2dCQUFFLGFBQWEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUFDLE1BQU07WUFDNUMsS0FBSyxHQUFHO2dCQUFFLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUFDLE1BQU07WUFDOUMsS0FBSyxHQUFHO2dCQUFFLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUFDLE1BQU07WUFDN0MsS0FBSyxHQUFHO2dCQUFFLGFBQWEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUFDLE1BQU07WUFDNUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEI7UUFFRCxPQUFPO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFxQixDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxHQUFHO1lBQ2xCLGNBQWMsQ0FBQyxFQUFFO1lBQ2pCLGNBQWMsQ0FBQyxJQUFJO1lBQ25CLGNBQWMsQ0FBQyxHQUFHO1lBQ2xCLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFFaEMsU0FBUztRQUNULElBQUksV0FBVyxHQUFHLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQztRQUU3QyxPQUFPO1FBQ1AsV0FBVyxJQUFJLFVBQVUsQ0FBQztRQUMxQixJQUFJLGFBQWEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLFNBQVM7WUFDVCxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUVqRSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLEVBQUU7Z0JBQy9DLFdBQVcsSUFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNLFVBQVUsQ0FBQzthQUNwRDtZQUNELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtnQkFDaEQsV0FBVyxJQUFJLE9BQU8sU0FBUyxJQUFJLE1BQU0sVUFBVSxDQUFDO2FBQ3JEO1lBQ0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEtBQUssTUFBTSxFQUFFO2dCQUM5QyxXQUFXLElBQUksT0FBTyxPQUFPLElBQUksTUFBTSxVQUFVLENBQUM7YUFDbkQ7WUFDRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLEVBQUU7Z0JBQy9DLFdBQVcsSUFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNLFVBQVUsQ0FBQzthQUNwRDtTQUNGO1FBRUQsT0FBTztRQUNQLFdBQVcsSUFBSSxZQUFZLENBQUM7UUFDNUIsSUFBSSxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRTtZQUMvQixTQUFTO1lBQ1QsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDekUsTUFBTSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFFN0UsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFGLEtBQUssTUFBTSxHQUFHLElBQUksZ0JBQWdCLEVBQUU7b0JBQ2xDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sRUFBRTt3QkFDMUMsV0FBVyxJQUFJLE9BQU8sVUFBVSxJQUFJLEdBQUcsSUFBSSxNQUFNLFVBQVUsQ0FBQztxQkFDN0Q7aUJBQ0Y7YUFDRjtZQUNELElBQUksWUFBWSxFQUFFO2dCQUNoQixNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxpQkFBaUIsRUFBRTtvQkFDbkMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFO3dCQUMxQyxXQUFXLElBQUksT0FBTyxXQUFXLElBQUksR0FBRyxJQUFJLE1BQU0sVUFBVSxDQUFDO3FCQUM5RDtpQkFDRjthQUNGO1lBQ0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RixLQUFLLE1BQU0sR0FBRyxJQUFJLGVBQWUsRUFBRTtvQkFDakMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFO3dCQUMxQyxXQUFXLElBQUksT0FBTyxTQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sVUFBVSxDQUFDO3FCQUM1RDtpQkFDRjthQUNGO1lBQ0QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFGLEtBQUssTUFBTSxHQUFHLElBQUksZ0JBQWdCLEVBQUU7b0JBQ2xDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sRUFBRTt3QkFDMUMsV0FBVyxJQUFJLE9BQU8sVUFBVSxJQUFJLEdBQUcsSUFBSSxNQUFNLFVBQVUsQ0FBQztxQkFDN0Q7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsT0FBTztRQUNQLFdBQVcsSUFBSSxZQUFZLENBQUM7UUFDNUIsSUFBSSxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUMzQixTQUFTO1lBQ1QsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFFckUsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDM0MsV0FBVyxJQUFJLFNBQVMsU0FBUyxJQUFJLE1BQU0sVUFBVSxDQUFDO2FBQ3ZEO1lBQ0QsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0MsV0FBVyxJQUFJLFNBQVMsVUFBVSxJQUFJLE1BQU0sVUFBVSxDQUFDO2FBQ3hEO1lBQ0QsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDekMsV0FBVyxJQUFJLFNBQVMsUUFBUSxJQUFJLE1BQU0sVUFBVSxDQUFDO2FBQ3REO1lBQ0QsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDM0MsV0FBVyxJQUFJLFNBQVMsU0FBUyxJQUFJLE1BQU0sVUFBVSxDQUFDO2FBQ3ZEO1NBQ0Y7UUFFRCxPQUFPO1FBQ1AsV0FBVyxJQUFJLFlBQVksQ0FBQztRQUM1QixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNDLFdBQVcsSUFBSSxVQUFVLE1BQU0sSUFBSSxDQUFDO1FBRXBDLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxJQUFJO29CQUNQLElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztvQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7b0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxNQUFNO2dCQUNSLEtBQUssSUFBSTtvQkFDUCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztvQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7b0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztvQkFDckQsTUFBTTtnQkFDUixLQUFLLElBQUk7b0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7b0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztvQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1IsS0FBSyxJQUFJO29CQUNQLElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztvQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7b0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO29CQUNyRCxNQUFNO2FBQ1Q7U0FDRjtRQUVELFNBQVM7UUFDVCxXQUFXLElBQUksY0FBYyxDQUFDO1FBQzlCLElBQUssYUFBcUIsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFO1lBQzVDLFFBQVEsTUFBTSxFQUFFO2dCQUNkLEtBQUssSUFBSTtvQkFDUCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztvQkFDdEQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksa0JBQWtCLENBQUM7b0JBQ3RELE1BQU07Z0JBQ1IsS0FBSyxJQUFJO29CQUNQLElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGtCQUFrQixDQUFDO29CQUN0RCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztvQkFDdEQsTUFBTTtnQkFDUixLQUFLLElBQUk7b0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksa0JBQWtCLENBQUM7b0JBQ3RELElBQUksTUFBTSxLQUFLLEdBQUc7d0JBQUUsV0FBVyxJQUFJLGtCQUFrQixDQUFDO29CQUN0RCxNQUFNO2dCQUNSLEtBQUssSUFBSTtvQkFDUCxJQUFJLE1BQU0sS0FBSyxHQUFHO3dCQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztvQkFDdEQsSUFBSSxNQUFNLEtBQUssR0FBRzt3QkFBRSxXQUFXLElBQUksa0JBQWtCLENBQUM7b0JBQ3RELE1BQU07YUFDVDtTQUNGO1FBRUQsT0FBTztRQUNQLFdBQVcsSUFBSSxZQUFZLENBQUM7UUFDNUIsSUFBSSxhQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRTtZQUNqQyxPQUFPO1lBQ1AsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUMsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7b0JBQ3ZCLFdBQVcsSUFBSSxVQUFVLFdBQVcsS0FBSyxNQUFNLFdBQVcsQ0FBQztpQkFDNUQ7YUFDRjtZQUVELE9BQU87WUFDUCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDMUMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7b0JBQ3ZCLFdBQVcsSUFBSSxVQUFVLFVBQVUsS0FBSyxNQUFNLFlBQVksQ0FBQztpQkFDNUQ7YUFDRjtZQUVELE9BQU87WUFDUCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM1QyxJQUFJLFdBQVcsRUFBRTtnQkFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksUUFBUSxLQUFLLE1BQU0sRUFBRTtvQkFDdkIsV0FBVyxJQUFJLFVBQVUsV0FBVyxLQUFLLE1BQU0sWUFBWSxDQUFDO2lCQUM3RDthQUNGO1NBQ0Y7UUFFRCxLQUFLO1FBQ0wsV0FBVyxJQUFJLFlBQVksQ0FBQztRQUM1QixXQUFXLElBQUksS0FBSyxNQUFNLFNBQVMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN0RSxXQUFXLElBQUksYUFBYSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDakQsV0FBVyxJQUFJLEtBQUssTUFBTSxVQUFVLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUVySixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLG9CQUFvQixDQUFDLEtBQWEsRUFBRSxNQUFjO1FBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZELGFBQWE7UUFDYixNQUFNLFNBQVMsR0FBRztZQUNoQixXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUM1QyxTQUFTLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUN4QyxXQUFXLEVBQUUsRUFBRTtTQUNoQixDQUFDO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFckMsT0FBTztRQUNQLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7UUFFL0IsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsWUFBWSxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztRQUU5QyxPQUFPO1FBQ1AsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxFQUFFLENBQUM7UUFDdEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztRQUVyQyxPQUFPO1FBQ1AsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsbUJBQW1CO1FBQ3BFLElBQUksQ0FBQyxTQUFTLEdBQUcsbUNBQW1DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBRTFGLE9BQU87UUFDUCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELGVBQWUsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUNwRCxlQUFlLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDO1FBRXJELE9BQU87UUFDUCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELGFBQWEsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUNoRCxhQUFhLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO1FBRWpELFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUM7UUFFakQsV0FBVztRQUNYLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDdEIsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztTQUMzQztRQUVELDRCQUE0QjtRQUU1QixXQUFXLENBQUMsU0FBUyxHQUFHOzt3Q0FFWSxpQkFBaUI7S0FDcEQsQ0FBQztRQUVGLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELFdBQVcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQy9CLFdBQVcsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUM7UUFDM0MsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDekMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLFlBQVksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4QyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLFlBQVksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEMsVUFBVTtRQUNWLEtBQUssQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFeEIsYUFBYTtRQUNiLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO2dCQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0sseUJBQXlCLENBQUMsS0FBYSxFQUFFLE1BQWM7UUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFO1lBQ3pELE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1FBRW5ELFNBQVM7UUFDVCxJQUFJLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQztRQUVwQyxPQUFPO1FBQ1AsV0FBVyxJQUFJLFVBQVUsQ0FBQztRQUMxQixXQUFXLElBQUksVUFBVSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBRSxtQkFBbUI7UUFDbkUsV0FBVyxJQUFJLFVBQVUsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQztRQUNwRCxXQUFXLElBQUksc0JBQXNCLENBQUM7UUFFdEMsT0FBTztRQUNQLFdBQVcsSUFBSSxVQUFVLENBQUM7UUFDMUIsV0FBVyxJQUFJLEtBQUssT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLE1BQU0sQ0FBQztRQUUxRCxPQUFPO1FBQ1AsV0FBVyxJQUFJLFVBQVUsQ0FBQztRQUMxQixXQUFXLElBQUksS0FBSyxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDO1FBRXpELE9BQU87UUFDUCxXQUFXLElBQUksVUFBVSxDQUFDO1FBQzFCLFdBQVcsSUFBSSxLQUFLLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUM7UUFFekQsU0FBUztRQUNULFdBQVcsSUFBSSxZQUFZLENBQUM7UUFDNUIsV0FBVyxJQUFJLEtBQUssT0FBTyxDQUFDLGVBQWUsSUFBSSxTQUFTLE1BQU0sQ0FBQztRQUUvRCxPQUFPO1FBQ1AsV0FBVyxJQUFJLFVBQVUsQ0FBQztRQUMxQixXQUFXLElBQUksZ0JBQWdCLENBQUM7UUFFaEMsU0FBUztRQUNULE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzlELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUV0RSxXQUFXLElBQUksWUFBWSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdEQsV0FBVyxJQUFJLFlBQVksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25ELFdBQVcsSUFBSSxZQUFZLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuRCxXQUFXLElBQUksWUFBWSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdkQsV0FBVyxJQUFJLFVBQVUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUU3RCxPQUFPO1FBQ1AsV0FBVyxJQUFJLFVBQVUsQ0FBQztRQUMxQixXQUFXLElBQUksZ0JBQWdCLENBQUM7UUFDaEMsV0FBVyxJQUFJLG9CQUFvQixDQUFDO1FBQ3BDLFdBQVcsSUFBSSxvQkFBb0IsQ0FBQztRQUNwQyxXQUFXLElBQUksbUJBQW1CLENBQUM7UUFDbkMsV0FBVyxJQUFJLG9CQUFvQixDQUFDO1FBQ3BDLFdBQVcsSUFBSSxvQkFBb0IsQ0FBQztRQUNwQyxXQUFXLElBQUksa0JBQWtCLENBQUM7UUFFbEMsYUFBYTtRQUNiLFdBQVcsSUFBSSxTQUFTLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDO1FBRXZFLE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLElBQVk7UUFDL0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsNEJBQTRCO1FBQzVCLE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFDO1FBQ3JDLElBQUksS0FBNkIsQ0FBQztRQUVsQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDMUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7U0FDdkI7UUFFRCwwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDeEMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNYO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssZ0JBQWdCO1FBQ3RCLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pFLE1BQU0sUUFBUSxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBYSxDQUFDO1FBRXJILE9BQU87UUFDUCxNQUFNLGNBQWMsR0FBRztZQUNyQixFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztZQUN2QyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztZQUN2QyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztZQUN2QyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztTQUN4QyxDQUFDO1FBRUYsS0FBSyxNQUFNLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLGNBQWMsRUFBRTtZQUM1QyxZQUFZO1lBQ1osTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUU1RSxpQkFBaUI7WUFDakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFaEQsSUFBSSxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLGlCQUFpQjtnQkFDL0MsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLG1CQUFtQixDQUFDLE1BQWM7UUFDeEMsTUFBTSxHQUFHLEdBQTRCO1lBQ25DLEtBQUssRUFBRSxHQUFHO1lBQ1YsS0FBSyxFQUFFLEdBQUc7WUFDVixLQUFLLEVBQUUsR0FBRztZQUNWLEtBQUssRUFBRSxHQUFHO1NBQ1gsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHVCQUF1QixDQUFDLE1BQWM7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtZQUNuRCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsU0FBUztRQUNULE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNqSCxNQUFNLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNyRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUU3RSxTQUFTO1FBQ1QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLFFBQVEsTUFBTSxFQUFFO1lBQ2QsS0FBSyxHQUFHO2dCQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsTUFBTTtZQUM3RCxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFBQyxNQUFNO1lBQzVELEtBQUssR0FBRztnQkFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO2dCQUFDLE1BQU07WUFDOUQsS0FBSyxHQUFHO2dCQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsTUFBTTtZQUM3RCxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFBQyxNQUFNO1NBQzdEO1FBRUQsaUJBQWlCO1FBQ2pCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUc7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJO1lBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUc7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1FBRTlDLFNBQVM7UUFDVCxJQUFJLFdBQVcsR0FBRyxHQUFHLE1BQU0saUJBQWlCLENBQUM7UUFFN0MsT0FBTztRQUNQLFdBQVcsSUFBSSxVQUFVLENBQUM7UUFDMUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQy9DLFdBQVcsSUFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNLFVBQVUsQ0FBQztTQUNwRDtRQUNELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtZQUNoRCxXQUFXLElBQUksT0FBTyxTQUFTLElBQUksTUFBTSxVQUFVLENBQUM7U0FDckQ7UUFDRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDOUMsV0FBVyxJQUFJLE9BQU8sT0FBTyxJQUFJLE1BQU0sVUFBVSxDQUFDO1NBQ25EO1FBQ0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQy9DLFdBQVcsSUFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNLFVBQVUsQ0FBQztTQUNwRDtRQUVELFNBQVM7UUFDVCxXQUFXLElBQUksWUFBWSxDQUFDO1FBQzVCLElBQUksV0FBVyxFQUFFO1lBQ2YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFO29CQUMxQyxXQUFXLElBQUksT0FBTyxVQUFVLElBQUksR0FBRyxJQUFJLE1BQU0sVUFBVSxDQUFDO2lCQUM3RDthQUNGO1NBQ0Y7UUFDRCxJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5RixLQUFLLE1BQU0sR0FBRyxJQUFJLGlCQUFpQixFQUFFO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLEVBQUU7b0JBQzFDLFdBQVcsSUFBSSxPQUFPLFdBQVcsSUFBSSxHQUFHLElBQUksTUFBTSxVQUFVLENBQUM7aUJBQzlEO2FBQ0Y7U0FDRjtRQUNELElBQUksVUFBVSxFQUFFO1lBQ2QsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLEtBQUssTUFBTSxHQUFHLElBQUksZUFBZSxFQUFFO2dCQUNqQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLEVBQUU7b0JBQzFDLFdBQVcsSUFBSSxPQUFPLFNBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxVQUFVLENBQUM7aUJBQzVEO2FBQ0Y7U0FDRjtRQUNELElBQUksV0FBVyxFQUFFO1lBQ2YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFO29CQUMxQyxXQUFXLElBQUksT0FBTyxVQUFVLElBQUksR0FBRyxJQUFJLE1BQU0sVUFBVSxDQUFDO2lCQUM3RDthQUNGO1NBQ0Y7UUFFRCxTQUFTO1FBQ1QsV0FBVyxJQUFJLFlBQVksQ0FBQztRQUM1QixJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNDLFdBQVcsSUFBSSxTQUFTLFNBQVMsSUFBSSxNQUFNLFVBQVUsQ0FBQztTQUN2RDtRQUNELElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0MsV0FBVyxJQUFJLFNBQVMsVUFBVSxJQUFJLE1BQU0sVUFBVSxDQUFDO1NBQ3hEO1FBQ0QsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QyxXQUFXLElBQUksU0FBUyxRQUFRLElBQUksTUFBTSxVQUFVLENBQUM7U0FDdEQ7UUFDRCxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNDLFdBQVcsSUFBSSxTQUFTLFNBQVMsSUFBSSxNQUFNLFVBQVUsQ0FBQztTQUN2RDtRQUVELE9BQU87UUFDUCxXQUFXLElBQUksWUFBWSxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0MsV0FBVyxJQUFJLFVBQVUsTUFBTSxJQUFJLENBQUM7UUFFcEMsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLElBQUk7Z0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO2dCQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztnQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO2dCQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztnQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO2dCQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztnQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGlCQUFpQixDQUFDO2dCQUNyRCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxpQkFBaUIsQ0FBQztnQkFDckQsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksaUJBQWlCLENBQUM7Z0JBQ3JELE1BQU07U0FDVDtRQUVELFNBQVM7UUFDVCxXQUFXLElBQUksY0FBYyxDQUFDO1FBQzlCLFFBQVEsTUFBTSxFQUFFO1lBQ2QsS0FBSyxJQUFJO2dCQUNQLElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGtCQUFrQixDQUFDO2dCQUN0RCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztnQkFDdEQsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztnQkFDdEQsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksa0JBQWtCLENBQUM7Z0JBQ3RELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsSUFBSSxNQUFNLEtBQUssR0FBRztvQkFBRSxXQUFXLElBQUksa0JBQWtCLENBQUM7Z0JBQ3RELElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGtCQUFrQixDQUFDO2dCQUN0RCxNQUFNO1lBQ1IsS0FBSyxJQUFJO2dCQUNQLElBQUksTUFBTSxLQUFLLEdBQUc7b0JBQUUsV0FBVyxJQUFJLGtCQUFrQixDQUFDO2dCQUN0RCxJQUFJLE1BQU0sS0FBSyxHQUFHO29CQUFFLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQztnQkFDdEQsTUFBTTtTQUNUO1FBRUQsT0FBTztRQUNQLFdBQVcsSUFBSSxZQUFZLENBQUM7UUFFNUIsT0FBTztRQUNQLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzVDLElBQUksV0FBVyxFQUFFO1lBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELElBQUksUUFBUSxLQUFLLE1BQU0sRUFBRTtnQkFDdkIsV0FBVyxJQUFJLFVBQVUsV0FBVyxLQUFLLE1BQU0sV0FBVyxDQUFDO2FBQzVEO1NBQ0Y7UUFFRCxPQUFPO1FBQ1AsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzFDLElBQUksVUFBVSxFQUFFO1lBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JELElBQUksUUFBUSxLQUFLLE1BQU0sRUFBRTtnQkFDdkIsV0FBVyxJQUFJLFVBQVUsVUFBVSxLQUFLLE1BQU0sWUFBWSxDQUFDO2FBQzVEO1NBQ0Y7UUFFRCxPQUFPO1FBQ1AsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDNUMsSUFBSSxXQUFXLEVBQUU7WUFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkQsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO2dCQUN2QixXQUFXLElBQUksVUFBVSxXQUFXLEtBQUssTUFBTSxZQUFZLENBQUM7YUFDN0Q7U0FDRjtRQUVELEtBQUs7UUFDTCxXQUFXLElBQUksWUFBWSxDQUFDO1FBQzVCLFdBQVcsSUFBSSxLQUFLLE1BQU0sU0FBUyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0QsV0FBVyxJQUFJLGFBQWEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pELFdBQVcsSUFBSSxLQUFLLE1BQU0sVUFBVSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRS9ILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssaUJBQWlCLENBQUMsSUFBd0I7UUFDaEQsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUVyQixNQUFNLEdBQUcsR0FBNEI7WUFDbkMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ2xCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1NBQ25CLENBQUM7UUFDRixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxlQUFlLENBQUMsTUFBMEI7UUFDaEQsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUV2QixNQUFNLEdBQUcsR0FBNEI7WUFDbkMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ2xCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ3RDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztTQUNuQixDQUFDO1FBQ0YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssU0FBUyxDQUFDLE1BQTBCO1FBQzFDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxRQUFRO1FBRWxDLE1BQU0sR0FBRyxHQUE0QjtZQUNuQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7WUFDL0IsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJO1lBQy9CLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSTtZQUMvQixHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7U0FDaEMsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssZ0JBQWdCO1FBQ3RCLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdkQsT0FBTztRQUNQLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzVELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzVELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzVELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzVELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTVELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxpQkFBaUIsQ0FBQyxJQUFZO1FBQ3BDLE1BQU0sR0FBRyxHQUE0QjtZQUNuQyxJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxHQUFHO1lBQ1QsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxHQUFHO1NBQ1YsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssZUFBZTtRQUNyQixNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6RSxNQUFNLFFBQVEsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWxFLE9BQU87UUFDUCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTlDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFN0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUUzQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTdDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxrQkFBa0IsQ0FBQyxLQUFhO1FBQ3RDLE1BQU0sR0FBRyxHQUE0QjtZQUNuQyxLQUFLLEVBQUUsR0FBRztZQUNWLEtBQUssRUFBRSxHQUFHO1lBQ1YsS0FBSyxFQUFFLEdBQUc7WUFDVixLQUFLLEVBQUUsR0FBRztTQUNYLENBQUM7UUFDRixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxtQkFBbUIsQ0FBQyxLQUFhO1FBQ3ZDLE1BQU0sWUFBWSxHQUE0QjtZQUM1QyxJQUFJLEVBQUUseUNBQXlDO1lBQy9DLEdBQUcsRUFBRSw0Q0FBNEM7WUFDakQsSUFBSSxFQUFFLCtDQUErQztZQUNyRCxJQUFJLEVBQUUsOENBQThDO1lBQ3BELElBQUksRUFBRSwrQ0FBK0M7WUFDckQsR0FBRyxFQUFFLDBDQUEwQztZQUMvQyxJQUFJLEVBQUUsd0NBQXdDO1NBQy9DLENBQUM7UUFDRixPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGlCQUFpQixDQUFDLEtBQWE7UUFDckMsTUFBTSxVQUFVLEdBQTRCO1lBQzFDLElBQUksRUFBRSwwQ0FBMEM7WUFDaEQsR0FBRyxFQUFFLDBDQUEwQztZQUMvQyxJQUFJLEVBQUUsK0JBQStCO1lBQ3JDLElBQUksRUFBRSxpQ0FBaUM7WUFDdkMsSUFBSSxFQUFFLDBDQUEwQztZQUNoRCxHQUFHLEVBQUUsMENBQTBDO1lBQy9DLElBQUksRUFBRSxxQ0FBcUM7U0FDNUMsQ0FBQztRQUNGLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLGtCQUFrQixDQUFDO0lBQ2pELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhemlJbmZvIH0gZnJvbSAnLi4vdHlwZXMvQmF6aUluZm8nO1xuaW1wb3J0IHsgU2hlblNoYVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9TaGVuU2hhU2VydmljZSc7XG5pbXBvcnQgeyBXdVhpbmdTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvV3VYaW5nU2VydmljZSc7XG5cbi8qKlxuICog5Lqk5LqS5byP5YWr5a2X5ZG955uY6KeG5Zu+XG4gKiDkvb/nlKhKYXZhU2NyaXB05a6e546w5pu05Liw5a+M55qE5LqS5Yqo5pWI5p6cXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcmFjdGl2ZUJhemlWaWV3IHtcbiAgcHJpdmF0ZSBjb250YWluZXI6IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGJhemlJbmZvOiBCYXppSW5mbztcbiAgcHJpdmF0ZSBpZDogc3RyaW5nO1xuXG4gIC8vIOW9k+WJjemAieS4reeahOWkp+i/kOOAgea1geW5tOe0ouW8lVxuICBwcml2YXRlIHNlbGVjdGVkRGFZdW5JbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBzZWxlY3RlZExpdU5pYW5ZZWFyOiBudW1iZXIgPSAwO1xuXG4gIC8vIOihqOagvOWFg+e0oOW8leeUqFxuICBwcml2YXRlIGRhWXVuVGFibGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGl1TmlhblRhYmxlOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHhpYW9ZdW5UYWJsZTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsaXVZdWVUYWJsZTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAvLyDliqjnlLvnm7jlhbNcbiAgcHJpdmF0ZSBhbmltYXRpb25EdXJhdGlvbjogbnVtYmVyID0gMzAwOyAvLyDmr6vnp5JcblxuICAvKipcbiAgICog5p6E6YCg5Ye95pWwXG4gICAqIEBwYXJhbSBjb250YWluZXIg5a655Zmo5YWD57SgXG4gICAqIEBwYXJhbSBiYXppSW5mbyDlhavlrZfkv6Hmga9cbiAgICogQHBhcmFtIGlkIOWUr+S4gElEXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBiYXppSW5mbzogQmF6aUluZm8sIGlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLmJhemlJbmZvID0gYmF6aUluZm87XG4gICAgdGhpcy5pZCA9IGlkO1xuXG4gICAgLy8g5Yid5aeL5YyW6KeG5Zu+XG4gICAgdGhpcy5pbml0VmlldygpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIneWni+WMluinhuWbvlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0VmlldygpIHtcbiAgICAvLyDmuIXnqbrlrrnlmahcbiAgICB0aGlzLmNvbnRhaW5lci5lbXB0eSgpO1xuICAgIHRoaXMuY29udGFpbmVyLmFkZENsYXNzKCdpbnRlcmFjdGl2ZS1iYXppLXZpZXcnKTtcblxuICAgIC8vIOWIm+W7uuagh+mimOWSjOiuvue9ruaMiemSrlxuICAgIHRoaXMuY3JlYXRlSGVhZGVyKCk7XG5cbiAgICAvLyDliJvlu7rlhavlrZfooajmoLxcbiAgICB0aGlzLmNyZWF0ZUJhemlUYWJsZSgpO1xuXG4gICAgLy8g5Yib5bu654m55q6K5L+h5oGvXG4gICAgdGhpcy5jcmVhdGVTcGVjaWFsSW5mbygpO1xuXG4gICAgLy8g5Yib5bu65aSn6L+Q5L+h5oGvXG4gICAgdGhpcy5jcmVhdGVEYVl1bkluZm8oKTtcblxuICAgIC8vIOWIm+W7uua1geW5tOWSjOWwj+i/kOS/oeaBr1xuICAgIHRoaXMuY3JlYXRlTGl1TmlhbkluZm8oKTtcblxuICAgIC8vIOWIm+W7uua1geaciOS/oeaBr1xuICAgIHRoaXMuY3JlYXRlTGl1WXVlSW5mbygpO1xuXG4gICAgLy8g5re75Yqg6KGo5qC85Y2V5YWD5qC855uR5ZCs5ZmoXG4gICAgdGhpcy5hZGRUYWJsZUNlbGxMaXN0ZW5lcnMoKTtcblxuICAgIC8vIOm7mOiupOmAieS4reesrOS4gOS4quWkp+i/kFxuICAgIGlmICh0aGlzLmJhemlJbmZvLmRhWXVuICYmIHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZWxlY3REYVl1bigwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5re75Yqg6KGo5qC85Y2V5YWD5qC855uR5ZCs5ZmoXG4gICAqL1xuICBwcml2YXRlIGFkZFRhYmxlQ2VsbExpc3RlbmVycygpIHtcbiAgICAvLyDmt7vliqDnpZ7nhZ7ngrnlh7vkuovku7ZcbiAgICBjb25zdCBzaGVuU2hhRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc2hlbnNoYS10YWc6bm90KC5yaXpodS1jbGlja2FibGUpJyk7XG4gICAgc2hlblNoYUVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3Qgc2hlblNoYSA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmIChzaGVuU2hhKSB7XG4gICAgICAgICAgdGhpcy5zaG93U2hlblNoYUV4cGxhbmF0aW9uKHNoZW5TaGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOa3u+WKoOaXpeS4u+aXuuihsOeCueWHu+S6i+S7tlxuICAgIGNvbnN0IHJpWmh1RWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcucml6aHUtY2xpY2thYmxlJyk7XG4gICAgcmlaaHVFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfml6XkuLvml7roobDmoIfnrb7ooqvngrnlh7vvvIjooajmoLzkuK3vvIknKTtcbiAgICAgICAgY29uc3QgcmlaaHUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1yaXpodScpO1xuICAgICAgICBjb25zdCB3dVhpbmcgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13dXhpbmcnKTtcbiAgICAgICAgaWYgKHJpWmh1ICYmIHd1WGluZykge1xuICAgICAgICAgIHRoaXMuc2hvd1JpWmh1RXhwbGFuYXRpb24ocmlaaHUsIHd1WGluZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuagh+mimOWSjOiuvue9ruaMiemSrlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVIZWFkZXIoKSB7XG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ+WFq+Wtl+WRveebmCcsIGNsczogJ2Jhemktdmlldy10aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rorr7nva7mjInpkq5cbiAgICBjb25zdCBzZXR0aW5nc0J1dHRvbiA9IGhlYWRlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LXNldHRpbmdzLWJ1dHRvbicsXG4gICAgICBhdHRyOiB7ICdkYXRhLWJhemktaWQnOiB0aGlzLmlkLCAnYXJpYS1sYWJlbCc6ICforr7nva4nIH1cbiAgICB9KTtcbiAgICBzZXR0aW5nc0J1dHRvbi5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIGNsYXNzPVwiZmVhdGhlciBmZWF0aGVyLXNldHRpbmdzXCI+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCI+PC9jaXJjbGU+PHBhdGggZD1cIk0xOS40IDE1YTEuNjUgMS42NSAwIDAgMCAuMzMgMS44MmwuMDYuMDZhMiAyIDAgMCAxIDAgMi44MyAyIDIgMCAwIDEtMi44MyAwbC0uMDYtLjA2YTEuNjUgMS42NSAwIDAgMC0xLjgyLS4zMyAxLjY1IDEuNjUgMCAwIDAtMSAxLjUxVjIxYTIgMiAwIDAgMS0yIDIgMiAyIDAgMCAxLTItMnYtLjA5QTEuNjUgMS42NSAwIDAgMCA5IDE5LjRhMS42NSAxLjY1IDAgMCAwLTEuODIuMzNsLS4wNi4wNmEyIDIgMCAwIDEtMi44MyAwIDIgMiAwIDAgMSAwLTIuODNsLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAgLjMzLTEuODIgMS42NSAxLjY1IDAgMCAwLTEuNTEtMUgzYTIgMiAwIDAgMS0yLTIgMiAyIDAgMCAxIDItMmguMDlBMS42NSAxLjY1IDAgMCAwIDQuNiA5YTEuNjUgMS42NSAwIDAgMC0uMzMtMS44MmwtLjA2LS4wNmEyIDIgMCAwIDEgMC0yLjgzIDIgMiAwIDAgMSAyLjgzIDBsLjA2LjA2YTEuNjUgMS42NSAwIDAgMCAxLjgyLjMzSDlhMS42NSAxLjY1IDAgMCAwIDEtMS41MVYzYTIgMiAwIDAgMSAyLTIgMiAyIDAgMCAxIDIgMnYuMDlhMS42NSAxLjY1IDAgMCAwIDEgMS41MSAxLjY1IDEuNjUgMCAwIDAgMS44Mi0uMzNsLjA2LS4wNmEyIDIgMCAwIDEgMi44MyAwIDIgMiAwIDAgMSAwIDIuODNsLS4wNi4wNmExLjY1IDEuNjUgMCAwIDAtLjMzIDEuODJWOWExLjY1IDEuNjUgMCAwIDAgMS41MSAxSDIxYTIgMiAwIDAgMSAyIDIgMiAyIDAgMCAxLTIgMmgtLjA5YTEuNjUgMS42NSAwIDAgMC0xLjUxIDF6XCI+PC9wYXRoPjwvc3ZnPic7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65YWr5a2X6KGo5qC8XG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhemlUYWJsZSgpIHtcbiAgICBjb25zdCB0YWJsZVNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG4gICAgLy8g56e76Zmk6YeN5aSN55qE5qCH6aKYXG5cbiAgICAvLyDmt7vliqDln7rmnKzkv6Hmga/vvIjlhazljobjgIHlhpzljobjgIHmgKfliKvvvIlcbiAgICBjb25zdCBiYXNpY0luZm9EaXYgPSB0YWJsZVNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS1iYXNpYy1pbmZvJyB9KTtcblxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNvbGFyRGF0ZSkge1xuICAgICAgYmFzaWNJbmZvRGl2LmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg5YWs5Y6GOiAke3RoaXMuYmF6aUluZm8uc29sYXJEYXRlfSAke3RoaXMuYmF6aUluZm8uc29sYXJUaW1lIHx8ICcnfWAsXG4gICAgICAgIGNsczogJ2JhemktYmFzaWMtaW5mby1pdGVtJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ubHVuYXJEYXRlKSB7XG4gICAgICBiYXNpY0luZm9EaXYuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDlhpzljoY6ICR7dGhpcy5iYXppSW5mby5sdW5hckRhdGV9YCxcbiAgICAgICAgY2xzOiAnYmF6aS1iYXNpYy1pbmZvLWl0ZW0nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5iYXppSW5mby5nZW5kZXIpIHtcbiAgICAgIGJhc2ljSW5mb0Rpdi5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYOaAp+WIqzogJHt0aGlzLmJhemlJbmZvLmdlbmRlciA9PT0gJzEnID8gJ+eUtycgOiAn5aWzJ31gLFxuICAgICAgICBjbHM6ICdiYXppLWJhc2ljLWluZm8taXRlbSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuihqOagvFxuICAgIGNvbnN0IHRhYmxlID0gdGFibGVTZWN0aW9uLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlJyB9KTtcblxuICAgIC8vIOWIm+W7uuihqOWktFxuICAgIGNvbnN0IHRoZWFkID0gdGFibGUuY3JlYXRlRWwoJ3RoZWFkJyk7XG4gICAgY29uc3QgaGVhZGVyUm93ID0gdGhlYWQuY3JlYXRlRWwoJ3RyJyk7XG5cbiAgICAvLyDmt7vliqDlt6bkvqfmoIfpopjmoI9cbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5L+h5oGvJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDmt7vliqDlm5vmn7HooajlpLRcbiAgICBbJ+W5tOafsScsICfmnIjmn7EnLCAn5pel5p+xJywgJ+aXtuafsSddLmZvckVhY2godGV4dCA9PiB7XG4gICAgICBoZWFkZXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0IH0pO1xuICAgIH0pO1xuXG4gICAgLy8g5Yib5bu66KGo5L2TXG4gICAgY29uc3QgdGJvZHkgPSB0YWJsZS5jcmVhdGVFbCgndGJvZHknKTtcblxuICAgIC8vIOWkqeW5suihjFxuICAgIGNvbnN0IHN0ZW1Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2Jhemktc3RlbS1yb3cnIH0pO1xuICAgIHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn5aSp5bmyJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlpKnlubLooYwgLSDnm7TmjqXlnKh0ZOWFg+e0oOS4iuiuvue9ruminOiJslxuICAgIGNvbnN0IHllYXJTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTdGVtIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlTdGVtV3VYaW5nQ29sb3IoeWVhclN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLnllYXJTdGVtIHx8ICcnKTtcblxuICAgIGNvbnN0IG1vbnRoU3RlbUNlbGwgPSBzdGVtUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5tb250aFN0ZW0gfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseVN0ZW1XdVhpbmdDb2xvcihtb250aFN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLm1vbnRoU3RlbSB8fCAnJyk7XG5cbiAgICBjb25zdCBkYXlTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVN0ZW0gfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseVN0ZW1XdVhpbmdDb2xvcihkYXlTdGVtQ2VsbCwgdGhpcy5iYXppSW5mby5kYXlTdGVtIHx8ICcnKTtcblxuICAgIGNvbnN0IGhvdXJTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJTdGVtIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlTdGVtV3VYaW5nQ29sb3IoaG91clN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLmhvdXJTdGVtIHx8ICcnKTtcblxuICAgIC8vIOWcsOaUr+ihjFxuICAgIGNvbnN0IGJyYW5jaFJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1icmFuY2gtcm93JyB9KTtcbiAgICBicmFuY2hSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn5Zyw5pSvJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlnLDmlK/ooYwgLSDnm7TmjqXlnKh0ZOWFg+e0oOS4iuiuvue9ruminOiJslxuICAgIGNvbnN0IHllYXJCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyQnJhbmNoIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlCcmFuY2hXdVhpbmdDb2xvcih5ZWFyQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby55ZWFyQnJhbmNoIHx8ICcnKTtcblxuICAgIGNvbnN0IG1vbnRoQnJhbmNoQ2VsbCA9IGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhCcmFuY2ggfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseUJyYW5jaFd1WGluZ0NvbG9yKG1vbnRoQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby5tb250aEJyYW5jaCB8fCAnJyk7XG5cbiAgICBjb25zdCBkYXlCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5kYXlCcmFuY2ggfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseUJyYW5jaFd1WGluZ0NvbG9yKGRheUJyYW5jaENlbGwsIHRoaXMuYmF6aUluZm8uZGF5QnJhbmNoIHx8ICcnKTtcblxuICAgIGNvbnN0IGhvdXJCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5ob3VyQnJhbmNoIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlCcmFuY2hXdVhpbmdDb2xvcihob3VyQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby5ob3VyQnJhbmNoIHx8ICcnKTtcblxuICAgIC8vIOiXj+W5suihjFxuICAgIGNvbnN0IGhpZGVHYW5Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2JhemktaGlkZWdhbi1yb3cnIH0pO1xuICAgIGhpZGVHYW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn6JeP5bmyJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlubTmn7Hol4/lubJcbiAgICBjb25zdCB5ZWFySGlkZUdhblRleHQgPSBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8ueWVhckhpZGVHYW4pID8gdGhpcy5iYXppSW5mby55ZWFySGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLnllYXJIaWRlR2FuIHx8ICcnKTtcbiAgICBjb25zdCB5ZWFySGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4oeWVhckhpZGVHYW5DZWxsLCB5ZWFySGlkZUdhblRleHQpO1xuXG4gICAgLy8g5pyI5p+x6JeP5bmyXG4gICAgY29uc3QgbW9udGhIaWRlR2FuVGV4dCA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4pID8gdGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4uam9pbignJykgOiAodGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4gfHwgJycpO1xuICAgIGNvbnN0IG1vbnRoSGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4obW9udGhIaWRlR2FuQ2VsbCwgbW9udGhIaWRlR2FuVGV4dCk7XG5cbiAgICAvLyDml6Xmn7Hol4/lubJcbiAgICBjb25zdCBkYXlIaWRlR2FuVGV4dCA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5kYXlIaWRlR2FuKSA/IHRoaXMuYmF6aUluZm8uZGF5SGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLmRheUhpZGVHYW4gfHwgJycpO1xuICAgIGNvbnN0IGRheUhpZGVHYW5DZWxsID0gaGlkZUdhblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICB0aGlzLmNyZWF0ZUNvbG9yZWRIaWRlR2FuKGRheUhpZGVHYW5DZWxsLCBkYXlIaWRlR2FuVGV4dCk7XG5cbiAgICAvLyDml7bmn7Hol4/lubJcbiAgICBjb25zdCBob3VySGlkZUdhblRleHQgPSBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8uaG91ckhpZGVHYW4pID8gdGhpcy5iYXppSW5mby5ob3VySGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLmhvdXJIaWRlR2FuIHx8ICcnKTtcbiAgICBjb25zdCBob3VySGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4oaG91ckhpZGVHYW5DZWxsLCBob3VySGlkZUdhblRleHQpO1xuXG4gICAgLy8g5Y2B56We6KGMXG4gICAgY29uc3Qgc2hpU2hlblJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1zaGlzaGVuLXJvdycgfSk7XG4gICAgc2hpU2hlblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICfljYHnpZ4nLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcblxuICAgIC8vIOW5tOafseWNgeelnlxuICAgIGNvbnN0IHllYXJTaGlTaGVuQ2VsbCA9IHNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueWVhclNoaVNoZW5HYW4pIHtcbiAgICAgIHllYXJTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyU2hpU2hlbkdhbixcbiAgICAgICAgY2xzOiAnc2hpc2hlbi10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmnIjmn7HljYHnpZ5cbiAgICBjb25zdCBtb250aFNoaVNoZW5DZWxsID0gc2hpU2hlblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby5tb250aFNoaVNoZW5HYW4pIHtcbiAgICAgIG1vbnRoU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhTaGlTaGVuR2FuLFxuICAgICAgICBjbHM6ICdzaGlzaGVuLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaXpeafseWNgeelnlxuICAgIGNvbnN0IGRheVNoaVNoZW5DZWxsID0gc2hpU2hlblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBkYXlTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgIHRleHQ6ICfml6XkuLsnLFxuICAgICAgY2xzOiAnc2hpc2hlbi10YWctc21hbGwnXG4gICAgfSk7XG5cbiAgICAvLyDml7bmn7HljYHnpZ5cbiAgICBjb25zdCB0aW1lU2hpU2hlbkNlbGwgPSBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnRpbWVTaGlTaGVuR2FuKSB7XG4gICAgICB0aW1lU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8udGltZVNoaVNoZW5HYW4sXG4gICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Zyw5Yq/6KGMXG4gICAgY29uc3QgZGlTaGlSb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2JhemktZGlzaGktcm93JyB9KTtcbiAgICBkaVNoaVJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICflnLDlir8nLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcblxuICAgIC8vIOW5tOafseWcsOWKv1xuICAgIGNvbnN0IHllYXJEaVNoaUNlbGwgPSBkaVNoaVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby55ZWFyRGlTaGkpIHtcbiAgICAgIHllYXJEaVNoaUNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ueWVhckRpU2hpLFxuICAgICAgICBjbHM6ICdkaXNoaS10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmnIjmn7HlnLDlir9cbiAgICBjb25zdCBtb250aERpU2hpQ2VsbCA9IGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLm1vbnRoRGlTaGkpIHtcbiAgICAgIG1vbnRoRGlTaGlDZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoRGlTaGksXG4gICAgICAgIGNsczogJ2Rpc2hpLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaXpeafseWcsOWKv1xuICAgIGNvbnN0IGRheURpU2hpQ2VsbCA9IGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLmRheURpU2hpKSB7XG4gICAgICBkYXlEaVNoaUNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5RGlTaGksXG4gICAgICAgIGNsczogJ2Rpc2hpLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaXtuafseWcsOWKv1xuICAgIGNvbnN0IHRpbWVEaVNoaUNlbGwgPSBkaVNoaVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby50aW1lRGlTaGkpIHtcbiAgICAgIHRpbWVEaVNoaUNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8udGltZURpU2hpLFxuICAgICAgICBjbHM6ICdkaXNoaS10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnurPpn7PooYxcbiAgICBjb25zdCBuYVlpblJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1uYXlpbi1yb3cnIH0pO1xuICAgIG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogJ+e6s+mfsycsIGNsczogJ2JhemktdGFibGUtbGFiZWwnIH0pO1xuXG4gICAgLy8g5bm05p+x57qz6Z+zXG4gICAgY29uc3QgeWVhck5hWWluID0gdGhpcy5iYXppSW5mby55ZWFyTmFZaW4gfHwgJyc7XG4gICAgY29uc3QgeWVhck5hWWluQ2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh5ZWFyTmFZaW4pIHtcbiAgICAgIC8vIOaPkOWPluS6lOihjOWxnuaAp++8iOmAmuW4uOe6s+mfs+agvOW8j+S4ulwiWFjkupTooYxcIu+8jOWmglwi6YeR566U6YeRXCLvvIlcbiAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbih5ZWFyTmFZaW4pO1xuICAgICAgY29uc3QgeWVhck5hWWluU3BhbiA9IHllYXJOYVlpbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHllYXJOYVlpbiB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh5ZWFyTmFZaW5TcGFuLCB3dVhpbmcpO1xuICAgIH1cblxuICAgIC8vIOaciOafsee6s+mfs1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSB0aGlzLmJhemlJbmZvLm1vbnRoTmFZaW4gfHwgJyc7XG4gICAgY29uc3QgbW9udGhOYVlpbkNlbGwgPSBuYVlpblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAobW9udGhOYVlpbikge1xuICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5leHRyYWN0V3VYaW5nRnJvbU5hWWluKG1vbnRoTmFZaW4pO1xuICAgICAgY29uc3QgbW9udGhOYVlpblNwYW4gPSBtb250aE5hWWluQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogbW9udGhOYVlpbiB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShtb250aE5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICB9XG5cbiAgICAvLyDml6Xmn7HnurPpn7NcbiAgICBjb25zdCBkYXlOYVlpbiA9IHRoaXMuYmF6aUluZm8uZGF5TmFZaW4gfHwgJyc7XG4gICAgY29uc3QgZGF5TmFZaW5DZWxsID0gbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKGRheU5hWWluKSB7XG4gICAgICBjb25zdCB3dVhpbmcgPSB0aGlzLmV4dHJhY3RXdVhpbmdGcm9tTmFZaW4oZGF5TmFZaW4pO1xuICAgICAgY29uc3QgZGF5TmFZaW5TcGFuID0gZGF5TmFZaW5DZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBkYXlOYVlpbiB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShkYXlOYVlpblNwYW4sIHd1WGluZyk7XG4gICAgfVxuXG4gICAgLy8g5pe25p+x57qz6Z+zXG4gICAgY29uc3QgaG91ck5hWWluID0gdGhpcy5iYXppSW5mby5ob3VyTmFZaW4gfHwgJyc7XG4gICAgY29uc3QgaG91ck5hWWluQ2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmIChob3VyTmFZaW4pIHtcbiAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihob3VyTmFZaW4pO1xuICAgICAgY29uc3QgaG91ck5hWWluU3BhbiA9IGhvdXJOYVlpbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGhvdXJOYVlpbiB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShob3VyTmFZaW5TcGFuLCB3dVhpbmcpO1xuICAgIH1cblxuICAgIC8vIOaXrOepuuihjFxuICAgIGNvbnN0IHh1bktvbmdSb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2JhemkteHVua29uZy1yb3cnIH0pO1xuICAgIHh1bktvbmdSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn5pes56m6JywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlubTmn7Hml6znqbpcbiAgICBjb25zdCB5ZWFyWHVuS29uZ0NlbGwgPSB4dW5Lb25nUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnllYXJYdW5Lb25nKSB7XG4gICAgICB5ZWFyWHVuS29uZ0NlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ueWVhclh1bktvbmcsXG4gICAgICAgIGNsczogJ3h1bmtvbmctdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5pyI5p+x5pes56m6XG4gICAgY29uc3QgbW9udGhYdW5Lb25nQ2VsbCA9IHh1bktvbmdSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ubW9udGhYdW5Lb25nKSB7XG4gICAgICBtb250aFh1bktvbmdDZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoWHVuS29uZyxcbiAgICAgICAgY2xzOiAneHVua29uZy10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDml6Xmn7Hml6znqbpcbiAgICBjb25zdCBkYXlYdW5Lb25nQ2VsbCA9IHh1bktvbmdSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8uZGF5WHVuS29uZykge1xuICAgICAgZGF5WHVuS29uZ0NlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5WHVuS29uZyxcbiAgICAgICAgY2xzOiAneHVua29uZy10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDml7bmn7Hml6znqbpcbiAgICBjb25zdCBob3VyWHVuS29uZ0NlbGwgPSB4dW5Lb25nUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLmhvdXJYdW5Lb25nKSB7XG4gICAgICBob3VyWHVuS29uZ0NlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8uaG91clh1bktvbmcsXG4gICAgICAgIGNsczogJ3h1bmtvbmctdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g55Sf6IKW6KGMXG4gICAgY29uc3Qgc2hlbmdYaWFvUm93ID0gdGJvZHkuY3JlYXRlRWwoJ3RyJywgeyBjbHM6ICdiYXppLXNoZW5neGlhby1yb3cnIH0pO1xuICAgIHNoZW5nWGlhb1Jvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICfnlJ/ogpYnLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcbiAgICBzaGVuZ1hpYW9Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTaGVuZ1hpYW8gfHwgJycgfSk7XG4gICAgc2hlbmdYaWFvUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5tb250aFNoZW5nWGlhbyB8fCAnJyB9KTtcbiAgICBzaGVuZ1hpYW9Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVNoZW5nWGlhbyB8fCAnJyB9KTtcbiAgICBzaGVuZ1hpYW9Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJTaGVuZ1hpYW8gfHwgJycgfSk7XG5cbiAgICAvLyDliJvlu7rnpZ7nhZ7ooYxcbiAgICBpZiAodGhpcy5iYXppSW5mby5zaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyDmjInmn7HkvY3liIbnu4TnpZ7nhZ5cbiAgICAgIGNvbnN0IHllYXJTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgbW9udGhTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgZGF5U2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGhvdXJTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICB0aGlzLmJhemlJbmZvLnNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgaWYgKHNoZW5TaGEuc3RhcnRzV2l0aCgn5bm05p+xOicpKSB7XG4gICAgICAgICAgeWVhclNoZW5TaGEucHVzaChzaGVuU2hhLnN1YnN0cmluZygzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hlblNoYS5zdGFydHNXaXRoKCfmnIjmn7E6JykpIHtcbiAgICAgICAgICBtb250aFNoZW5TaGEucHVzaChzaGVuU2hhLnN1YnN0cmluZygzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hlblNoYS5zdGFydHNXaXRoKCfml6Xmn7E6JykpIHtcbiAgICAgICAgICBkYXlTaGVuU2hhLnB1c2goc2hlblNoYS5zdWJzdHJpbmcoMykpO1xuICAgICAgICB9IGVsc2UgaWYgKHNoZW5TaGEuc3RhcnRzV2l0aCgn5pe25p+xOicpKSB7XG4gICAgICAgICAgaG91clNoZW5TaGEucHVzaChzaGVuU2hhLnN1YnN0cmluZygzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzmnInku7vkvZXmn7HkvY3mnInnpZ7nhZ7vvIzliJvlu7rnpZ7nhZ7ooYxcbiAgICAgIGlmICh5ZWFyU2hlblNoYS5sZW5ndGggPiAwIHx8IG1vbnRoU2hlblNoYS5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgZGF5U2hlblNoYS5sZW5ndGggPiAwIHx8IGhvdXJTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g5Yib5bu656We54We6KGMXG4gICAgICAgIGNvbnN0IHNoZW5TaGFSb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInKTtcbiAgICAgICAgc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICfnpZ7nhZ4nLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcblxuICAgICAgICAvLyDlubTmn7HnpZ7nhZ7ljZXlhYPmoLxcbiAgICAgICAgY29uc3QgeWVhckNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgICBpZiAoeWVhclNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHllYXJTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuXG4gICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGFuID0geWVhckNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogY3NzQ2xhc3MsXG4gICAgICAgICAgICAgIGF0dHI6IHsgJ3RpdGxlJzogc2hlblNoYUluZm8/LmV4cGxhbmF0aW9uIHx8ICcnIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg56m65qC85YiG6ZqUXG4gICAgICAgICAgICB5ZWFyQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHllYXJDZWxsLnRleHRDb250ZW50ID0gJ+aXoCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmnIjmn7HnpZ7nhZ7ljZXlhYPmoLxcbiAgICAgICAgY29uc3QgbW9udGhDZWxsID0gc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICAgICAgaWYgKG1vbnRoU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbW9udGhTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuXG4gICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGFuID0gbW9udGhDZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgICBjbHM6IGNzc0NsYXNzLFxuICAgICAgICAgICAgICBhdHRyOiB7ICd0aXRsZSc6IHNoZW5TaGFJbmZvPy5leHBsYW5hdGlvbiB8fCAnJyB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYUV4cGxhbmF0aW9uKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgICAgICAgbW9udGhDZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9udGhDZWxsLnRleHRDb250ZW50ID0gJ+aXoCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDml6Xmn7HnpZ7nhZ7ljZXlhYPmoLxcbiAgICAgICAgY29uc3QgZGF5Q2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICAgIGlmIChkYXlTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBkYXlTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuXG4gICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGFuID0gZGF5Q2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICAgICAgdGV4dDogc2hlblNoYSxcbiAgICAgICAgICAgICAgY2xzOiBjc3NDbGFzcyxcbiAgICAgICAgICAgICAgYXR0cjogeyAndGl0bGUnOiBzaGVuU2hhSW5mbz8uZXhwbGFuYXRpb24gfHwgJycgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDnqbrmoLzliIbpmpRcbiAgICAgICAgICAgIGRheUNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6ICcgJyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXlDZWxsLnRleHRDb250ZW50ID0gJ+aXoCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDml7bmn7HnpZ7nhZ7ljZXlhYPmoLxcbiAgICAgICAgY29uc3QgaG91ckNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgICBpZiAoaG91clNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGhvdXJTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuXG4gICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzcGFuID0gaG91ckNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogY3NzQ2xhc3MsXG4gICAgICAgICAgICAgIGF0dHI6IHsgJ3RpdGxlJzogc2hlblNoYUluZm8/LmV4cGxhbmF0aW9uIHx8ICcnIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg56m65qC85YiG6ZqUXG4gICAgICAgICAgICBob3VyQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhvdXJDZWxsLnRleHRDb250ZW50ID0gJ+aXoCc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDnp7vpmaTnibnmrorkv6Hmga/ljLrln5/kuK3nmoTnpZ7nhZ7nu4TlkIjliIbmnpDvvIzlm6DkuLrlt7Lnu4/lnKjlkb3nm5jooajmoLzkuK3mmL7npLrkuoZcbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rnibnmrorkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgY3JlYXRlU3BlY2lhbEluZm8oKSB7XG4gICAgLy8g5Yib5bu654m55q6K5L+h5oGv6YOo5YiGXG4gICAgY29uc3Qgc3BlY2lhbFNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG4gICAgc3BlY2lhbFNlY3Rpb24uY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAn54m55q6K5L+h5oGvJywgY2xzOiAnYmF6aS12aWV3LXN1YnRpdGxlJyB9KTtcblxuICAgIC8vIOWIm+W7uueJueauiuS/oeaBr+WIl+ihqFxuICAgIGNvbnN0IGluZm9MaXN0ID0gc3BlY2lhbFNlY3Rpb24uY3JlYXRlRWwoJ3VsJywgeyBjbHM6ICdiYXppLXZpZXctaW5mby1saXN0JyB9KTtcblxuICAgIC8vIOa3u+WKoOeJueauiuS/oeaBr+mhuVxuICAgIGlmICh0aGlzLmJhemlJbmZvLnRhaVl1YW4pIHtcbiAgICAgIGNvbnN0IHRhaVl1YW5JdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJyk7XG4gICAgICB0YWlZdWFuSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJ+iDjuWFgzogJyB9KTtcblxuICAgICAgLy8g5o+Q5Y+W5aSp5bmy5Zyw5pSvXG4gICAgICBpZiAodGhpcy5iYXppSW5mby50YWlZdWFuLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSB0aGlzLmJhemlJbmZvLnRhaVl1YW5bMF07XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuYmF6aUluZm8udGFpWXVhblsxXTtcblxuICAgICAgICAvLyDliJvlu7rlpKnlubLlhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3Qgc3RlbVNwYW4gPSB0YWlZdWFuSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogc3RlbSB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHN0ZW1TcGFuLCB0aGlzLmdldFN0ZW1XdVhpbmcoc3RlbSkpO1xuXG4gICAgICAgIC8vIOWIm+W7uuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBicmFuY2hTcGFuID0gdGFpWXVhbkl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFpWXVhbkl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IHRoaXMuYmF6aUluZm8udGFpWXVhbiB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5iYXppSW5mby5taW5nR29uZykge1xuICAgICAgY29uc3QgbWluZ0dvbmdJdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJyk7XG4gICAgICBtaW5nR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6ICflkb3lrqs6ICcgfSk7XG5cbiAgICAgIC8vIOaPkOWPluWkqeW5suWcsOaUr1xuICAgICAgaWYgKHRoaXMuYmF6aUluZm8ubWluZ0dvbmcubGVuZ3RoID49IDIpIHtcbiAgICAgICAgY29uc3Qgc3RlbSA9IHRoaXMuYmF6aUluZm8ubWluZ0dvbmdbMF07XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuYmF6aUluZm8ubWluZ0dvbmdbMV07XG5cbiAgICAgICAgLy8g5Yib5bu65aSp5bmy5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IHN0ZW1TcGFuID0gbWluZ0dvbmdJdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBzdGVtIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoc3RlbVNwYW4sIHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKSk7XG5cbiAgICAgICAgLy8g5Yib5bu65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IGJyYW5jaFNwYW4gPSBtaW5nR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWluZ0dvbmdJdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiB0aGlzLmJhemlJbmZvLm1pbmdHb25nIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5Hb25nKSB7XG4gICAgICBjb25zdCBzaGVuR29uZ0l0ZW0gPSBpbmZvTGlzdC5jcmVhdGVFbCgnbGknKTtcbiAgICAgIHNoZW5Hb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJ+i6q+WuqzogJyB9KTtcblxuICAgICAgLy8g5o+Q5Y+W5aSp5bmy5Zyw5pSvXG4gICAgICBpZiAodGhpcy5iYXppSW5mby5zaGVuR29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICBjb25zdCBzdGVtID0gdGhpcy5iYXppSW5mby5zaGVuR29uZ1swXTtcbiAgICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5iYXppSW5mby5zaGVuR29uZ1sxXTtcblxuICAgICAgICAvLyDliJvlu7rlpKnlubLlhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3Qgc3RlbVNwYW4gPSBzaGVuR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IHNoZW5Hb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogYnJhbmNoIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoYnJhbmNoU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoYnJhbmNoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGVuR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IHRoaXMuYmF6aUluZm8uc2hlbkdvbmcgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5qC85bGA5L+h5oGvXG4gICAgaWYgKHRoaXMuYmF6aUluZm8uZ2VKdSkge1xuICAgICAgY29uc3QgZ2VKdUl0ZW0gPSBpbmZvTGlzdC5jcmVhdGVFbCgnbGknKTtcbiAgICAgIGdlSnVJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg5qC85bGAOiAke3RoaXMuYmF6aUluZm8uZ2VKdX1gLFxuICAgICAgICBjbHM6ICdnZWp1LXRhZydcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5iYXppSW5mby5nZUp1RGV0YWlsKSB7XG4gICAgICAgIGdlSnVJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICAgIHRleHQ6IGAgKCR7dGhpcy5iYXppSW5mby5nZUp1RGV0YWlsfSlgLFxuICAgICAgICAgIGNsczogJ2dlanUtZGV0YWlsJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmt7vliqDnpZ7nhZ7kv6Hmga9cbiAgICB0aGlzLmFkZFNoZW5TaGFJbmZvKGluZm9MaXN0KTtcblxuICAgIC8vIOa3u+WKoOelnueFnue7hOWQiOWIhuaekCAtIOenu+WIsOeJueauiuS/oeaBr+WMuuWfn1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5TaGEgJiYgdGhpcy5iYXppSW5mby5zaGVuU2hhLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IGNvbWJpbmF0aW9ucyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFDb21iaW5hdGlvbkFuYWx5c2lzKHRoaXMuYmF6aUluZm8uc2hlblNoYSk7XG4gICAgICBpZiAoY29tYmluYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY29tYmluYXRpb25JdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICdzaGVuc2hhLWNvbWJpbmF0aW9uLWl0ZW0nIH0pO1xuICAgICAgICBjb21iaW5hdGlvbkl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6ICfnpZ7nhZ7nu4TlkIg6ICcgfSk7XG5cbiAgICAgICAgY29uc3QgY29tYmluYXRpb25Db250YWluZXIgPSBjb21iaW5hdGlvbkl0ZW0uY3JlYXRlRGl2KHsgY2xzOiAnc2hlbnNoYS1jb21iaW5hdGlvbi1jb250YWluZXInIH0pO1xuICAgICAgICBjb21iaW5hdGlvbnMuZm9yRWFjaChjb21iaW5hdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgY29tYmluYXRpb25UYWcgPSBjb21iaW5hdGlvbkNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdzaGVuc2hhLWNvbWJpbmF0aW9uLXRhZycgfSk7XG4gICAgICAgICAgY29tYmluYXRpb25UYWcuY3JlYXRlU3Bhbih7IHRleHQ6IGNvbWJpbmF0aW9uLmNvbWJpbmF0aW9uIH0pO1xuXG4gICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu277yM5pi+56S657uE5ZCI5YiG5p6QXG4gICAgICAgICAgY29tYmluYXRpb25UYWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFDb21iaW5hdGlvbkFuYWx5c2lzKGNvbWJpbmF0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pes56m65L+h5oGv5bey56e76Iez5ZG955uY6KGo5qC85LitXG5cbiAgICAvLyDmt7vliqDkupTooYzlvLrluqbkv6Hmga9cbiAgICBpZiAodGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCkge1xuICAgICAgY29uc3Qgd3VYaW5nSXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScpO1xuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJ+S6lOihjOW8uuW6pjogJyB9KTtcblxuICAgICAgY29uc3QgeyBqaW4sIG11LCBzaHVpLCBodW8sIHR1IH0gPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoO1xuXG4gICAgICAvLyDph5FcbiAgICAgIGNvbnN0IGppblNwYW4gPSB3dVhpbmdJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg6YeRKCR7amluLnRvRml4ZWQoMSl9KWAsXG4gICAgICAgIGNsczogJ3d1eGluZy1qaW4tdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShqaW5TcGFuLCAn6YeRJyk7XG4gICAgICBqaW5TcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dXdVhpbmdFeHBsYW5hdGlvbign6YeRJywgamluLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDmnKhcbiAgICAgIGNvbnN0IG11U3BhbiA9IHd1WGluZ0l0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDmnKgoJHttdS50b0ZpeGVkKDEpfSlgLFxuICAgICAgICBjbHM6ICd3dXhpbmctbXUtdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShtdVNwYW4sICfmnKgnKTtcbiAgICAgIG11U3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93V3VYaW5nRXhwbGFuYXRpb24oJ+acqCcsIG11LnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDmsLRcbiAgICAgIGNvbnN0IHNodWlTcGFuID0gd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYOawtCgke3NodWkudG9GaXhlZCgxKX0pYCxcbiAgICAgICAgY2xzOiAnd3V4aW5nLXNodWktdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzaHVpU3BhbiwgJ+awtCcpO1xuICAgICAgc2h1aVNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd1d1WGluZ0V4cGxhbmF0aW9uKCfmsLQnLCBzaHVpLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDngatcbiAgICAgIGNvbnN0IGh1b1NwYW4gPSB3dVhpbmdJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg54GrKCR7aHVvLnRvRml4ZWQoMSl9KWAsXG4gICAgICAgIGNsczogJ3d1eGluZy1odW8tdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShodW9TcGFuLCAn54GrJyk7XG4gICAgICBodW9TcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dXdVhpbmdFeHBsYW5hdGlvbign54GrJywgaHVvLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDlnJ9cbiAgICAgIGNvbnN0IHR1U3BhbiA9IHd1WGluZ0l0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDlnJ8oJHt0dS50b0ZpeGVkKDEpfSlgLFxuICAgICAgICBjbHM6ICd3dXhpbmctdHUtdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh0dVNwYW4sICflnJ8nKTtcbiAgICAgIHR1U3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93V3VYaW5nRXhwbGFuYXRpb24oJ+WcnycsIHR1LnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5pel5Li75pe66KGw5L+h5oGvXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ucmlaaHVTdHJlbmd0aCkge1xuICAgICAgY29uc3QgcmlaaHVJdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJyk7XG4gICAgICByaVpodUl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6ICfml6XkuLvml7roobA6ICcgfSk7XG5cbiAgICAgIGNvbnN0IGRheVd1WGluZyA9IHRoaXMuYmF6aUluZm8uZGF5V3VYaW5nIHx8ICflnJ8nOyAvLyDpu5jorqTkuLrlnJ9cbiAgICAgIGNvbnN0IHd1WGluZ0NsYXNzID0gdGhpcy5nZXRXdVhpbmdDbGFzc0Zyb21OYW1lKGRheVd1WGluZyk7XG5cbiAgICAgIGNvbnN0IHJpWmh1U3BhbiA9IHJpWmh1SXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5yaVpodVN0cmVuZ3RoLFxuICAgICAgICBjbHM6IGByaXpodS1zdHJlbmd0aCByaXpodS1jbGlja2FibGUgd3V4aW5nLSR7d3VYaW5nQ2xhc3N9YCxcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgICdkYXRhLXJpemh1JzogdGhpcy5iYXppSW5mby5yaVpodVN0cmVuZ3RoLFxuICAgICAgICAgICdkYXRhLXd1eGluZyc6IGRheVd1WGluZ1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5LiN5Zyo6L+Z6YeM5re75Yqg54K55Ye75LqL5Lu255uR5ZCs5Zmo77yM6ICM5piv5ZyoIGFkZFRhYmxlQ2VsbExpc3RlbmVycyDmlrnms5XkuK3nu5/kuIDmt7vliqBcbiAgICB9XG5cbiAgICAvLyDlhazljobjgIHlhpzljobjgIHmgKfliKvkv6Hmga/lt7Lnp7voh7Plkb3nm5jooajmoLzliY1cbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rlpKfov5Dkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgY3JlYXRlRGFZdW5JbmZvKCkge1xuICAgIGlmICghdGhpcy5iYXppSW5mby5kYVl1biB8fCB0aGlzLmJhemlJbmZvLmRhWXVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuWkp+i/kOmDqOWIhlxuICAgIGNvbnN0IGRhWXVuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktZGF5dW4tc2VjdGlvbicgfSk7XG4gICAgZGFZdW5TZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+Wkp+i/kOS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rlpKfov5DooajmoLxcbiAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IGRhWXVuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICB0aGlzLmRhWXVuVGFibGUgPSB0YWJsZUNvbnRhaW5lci5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZSBiYXppLXZpZXctZGF5dW4tdGFibGUnIH0pO1xuXG4gICAgLy8g6I635Y+W5aSn6L+Q5pWw5o2uXG4gICAgY29uc3QgZGFZdW5EYXRhID0gdGhpcy5iYXppSW5mby5kYVl1biB8fCBbXTtcblxuICAgIC8vIOesrOS4gOihjO+8muW5tOS7vVxuICAgIGNvbnN0IHllYXJSb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflpKfov5AnIH0pO1xuICAgIGRhWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChkeSA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogZHkuc3RhcnRZZWFyLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubTpvoRcbiAgICBjb25zdCBhZ2VSb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgZGFZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGR5ID0+IHtcbiAgICAgIGFnZVJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGR5LnN0YXJ0QWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRoaXMuZGFZdW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBnelJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubLmlK8nIH0pO1xuICAgIGRhWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaCgoZHksIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICBjbHM6ICdiYXppLWRheXVuLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLWluZGV4JzogaW5kZXgudG9TdHJpbmcoKSB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5aaC5p6c5pyJ5bmy5pSv77yM5oyJ5LqU6KGM6aKc6Imy5pi+56S6XG4gICAgICBpZiAoZHkuZ2FuWmhpICYmIGR5LmdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICBjb25zdCBzdGVtID0gZHkuZ2FuWmhpWzBdOyAvLyDlpKnlubJcbiAgICAgICAgY29uc3QgYnJhbmNoID0gZHkuZ2FuWmhpWzFdOyAvLyDlnLDmlK9cblxuICAgICAgICAvLyDliJvlu7rlpKnlubLlhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3Qgc3RlbVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBzdGVtIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoc3RlbVNwYW4sIHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKSk7XG5cbiAgICAgICAgLy8g5Yib5bu65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IGJyYW5jaFNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBicmFuY2ggfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShicmFuY2hTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyhicmFuY2gpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIOWmguaenOayoeacieW5suaUr+aIluagvOW8j+S4jeato+ehru+8jOebtOaOpeaYvuekuuWOn+aWh+acrFxuICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gZHkuZ2FuWmhpIHx8ICcnO1xuICAgICAgfVxuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0RGFZdW4oaW5kZXgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOaYr+W9k+WJjemAieS4reeahOWkp+i/kO+8jOa3u+WKoOmAieS4reagt+W8j1xuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnNlbGVjdGVkRGFZdW5JbmRleCkge1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDnrKzlm5vooYzvvJrljYHnpZ7vvIjlpoLmnpzmnInvvIlcbiAgICBpZiAoZGFZdW5EYXRhLnNvbWUoZHkgPT4gZHkuc2hpU2hlbkdhbikpIHtcbiAgICAgIGNvbnN0IHNoaVNoZW5Sb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+WNgeelnicgfSk7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICB0ZXh0OiBkeS5zaGlTaGVuR2FuIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2Jhemktc2hpc2hlbi1jZWxsJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOS6lOihjO+8muWcsOWKv++8iOWmguaenOacie+8iVxuICAgIGlmIChkYVl1bkRhdGEuc29tZShkeSA9PiBkeS5kaVNoaSkpIHtcbiAgICAgIGNvbnN0IGRpU2hpUm93ID0gdGhpcy5kYVl1blRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgZGlTaGlSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5Zyw5Yq/JyB9KTtcbiAgICAgIGRhWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChkeSA9PiB7XG4gICAgICAgIGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICB0ZXh0OiBkeS5kaVNoaSB8fCAnJyxcbiAgICAgICAgICBjbHM6ICdiYXppLWRpc2hpLWNlbGwnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5YWt6KGM77ya5pes56m6XG4gICAgaWYgKGRhWXVuRGF0YS5zb21lKGR5ID0+IGR5Lnh1bktvbmcpKSB7XG4gICAgICBjb25zdCB4a1JvdyA9IHRoaXMuZGFZdW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIHhrUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+aXrOepuicgfSk7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgICBjb25zdCBjZWxsID0geGtSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIGNsczogJ2JhemkteHVua29uZy1jZWxsJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDlpoLmnpzmnInml6znqbrvvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgICAgaWYgKGR5Lnh1bktvbmcgJiYgZHkueHVuS29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHhrMSA9IGR5Lnh1bktvbmdbMF07IC8vIOesrOS4gOS4quaXrOepuuWcsOaUr1xuICAgICAgICAgIGNvbnN0IHhrMiA9IGR5Lnh1bktvbmdbMV07IC8vIOesrOS6jOS4quaXrOepuuWcsOaUr1xuXG4gICAgICAgICAgLy8g5Yib5bu656ys5LiA5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3QgeGsxU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMSB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoeGsxU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoeGsxKSk7XG5cbiAgICAgICAgICAvLyDliJvlu7rnrKzkuozkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCB4azJTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogeGsyIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azJTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDlpoLmnpzmsqHmnInml6znqbrmiJbmoLzlvI/kuI3mraPnoa7vvIznm7TmjqXmmL7npLrljp/mlofmnKxcbiAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gZHkueHVuS29uZyB8fCAnJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5LiD6KGM77ya57qz6Z+z77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKGRhWXVuRGF0YS5zb21lKGR5ID0+IGR5Lm5hWWluKSkge1xuICAgICAgY29uc3QgbmFZaW5Sb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBuYVlpblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfnurPpn7MnIH0pO1xuICAgICAgZGFZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGR5ID0+IHtcbiAgICAgICAgY29uc3QgbmFZaW4gPSBkeS5uYVlpbiB8fCAnJztcbiAgICAgICAgY29uc3QgY2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLW5heWluLWNlbGwnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChuYVlpbikge1xuICAgICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihuYVlpbik7XG4gICAgICAgICAgY29uc3QgbmFZaW5TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogbmFZaW4gfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KG5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uua1geW5tOWSjOWwj+i/kOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVMaXVOaWFuSW5mbygpIHtcbiAgICAvLyDliJvlu7rmtYHlubTlkozlsI/ov5Dpg6jliIZcbiAgICBjb25zdCBsaXVOaWFuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktbGl1bmlhbi1zZWN0aW9uJyB9KTtcbiAgICBsaXVOaWFuU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfmtYHlubTkuI7lsI/ov5Dkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65rWB5bm06KGo5qC85a655ZmoXG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSBsaXVOaWFuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICB0aGlzLmxpdU5pYW5UYWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXVuaWFuLXRhYmxlJyB9KTtcblxuICAgIC8vIOihqOagvOWGheWuueWwhuWcqHNlbGVjdERhWXVu5pa55rOV5Lit5Yqo5oCB5pu05pawXG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65rWB5pyI5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUxpdVl1ZUluZm8oKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmxpdVl1ZSB8fCB0aGlzLmJhemlJbmZvLmxpdVl1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rmtYHmnIjpg6jliIZcbiAgICBjb25zdCBsaXVZdWVTZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24gYmF6aS1saXV5dWUtc2VjdGlvbicgfSk7XG4gICAgbGl1WXVlU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfmtYHmnIjkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65rWB5pyI6KGo5qC85a655ZmoXG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSBsaXVZdWVTZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIHRoaXMubGl1WXVlVGFibGUgPSB0YWJsZUNvbnRhaW5lci5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZSBiYXppLXZpZXctbGl1eXVlLXRhYmxlJyB9KTtcblxuICAgIC8vIOihqOagvOWGheWuueWwhuWcqHNlbGVjdExpdU5pYW7mlrnms5XkuK3liqjmgIHmm7TmlrBcbiAgfVxuXG4gIC8qKlxuICAgKiDpgInmi6nlpKfov5BcbiAgICogQHBhcmFtIGluZGV4IOWkp+i/kOe0ouW8lVxuICAgKi9cbiAgcHJpdmF0ZSBzZWxlY3REYVl1bihpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmRhWXVuIHx8IGluZGV4ID49IHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5pu05paw6YCJ5Lit57Si5byVXG4gICAgdGhpcy5zZWxlY3RlZERhWXVuSW5kZXggPSBpbmRleDtcblxuICAgIC8vIOmrmOS6rumAieS4reeahOWkp+i/kOWNleWFg+agvFxuICAgIGlmICh0aGlzLmRhWXVuVGFibGUpIHtcbiAgICAgIGNvbnN0IGNlbGxzID0gdGhpcy5kYVl1blRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWRheXVuLWNlbGwnKTtcbiAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwsIGkpID0+IHtcbiAgICAgICAgaWYgKGkgPT09IGluZGV4KSB7XG4gICAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W6YCJ5Lit55qE5aSn6L+QXG4gICAgY29uc3Qgc2VsZWN0ZWREYVl1biA9IHRoaXMuYmF6aUluZm8uZGFZdW5baW5kZXhdO1xuXG4gICAgLy8g5bCd6K+V5LuO5Y6f5aeL5YWr5a2X5pWw5o2u5Lit562b6YCJ5Ye65bGe5LqO6K+l5aSn6L+Q55qE5rWB5bm0XG4gICAgbGV0IGxpdU5pYW5EYXRhID0gdGhpcy5iYXppSW5mby5saXVOaWFuPy5maWx0ZXIobG4gPT4ge1xuICAgICAgY29uc3Qgc3RhcnRZZWFyID0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXI7XG4gICAgICBjb25zdCBlbmRZZWFyID0gc2VsZWN0ZWREYVl1bi5lbmRZZWFyID8/IChzdGFydFllYXIgKyA5KTtcbiAgICAgIHJldHVybiBsbi55ZWFyID49IHN0YXJ0WWVhciAmJiBsbi55ZWFyIDw9IGVuZFllYXI7XG4gICAgfSkgfHwgW107XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmib7liLDmtYHlubTmlbDmja7vvIzliJnliqjmgIHnlJ/miJBcbiAgICBpZiAobGl1TmlhbkRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICBsaXVOaWFuRGF0YSA9IHRoaXMuZ2VuZXJhdGVMaXVOaWFuRm9yRGFZdW4oc2VsZWN0ZWREYVl1bik7XG4gICAgfVxuXG4gICAgLy8g5bCd6K+V5LuO5Y6f5aeL5YWr5a2X5pWw5o2u5Lit562b6YCJ5Ye65bGe5LqO6K+l5aSn6L+Q55qE5bCP6L+QXG4gICAgbGV0IHhpYW9ZdW5EYXRhID0gdGhpcy5iYXppSW5mby54aWFvWXVuPy5maWx0ZXIoeHkgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRZZWFyID0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXI7XG4gICAgICBjb25zdCBlbmRZZWFyID0gc2VsZWN0ZWREYVl1bi5lbmRZZWFyID8/IChzdGFydFllYXIgKyA5KTtcbiAgICAgIHJldHVybiB4eS55ZWFyID49IHN0YXJ0WWVhciAmJiB4eS55ZWFyIDw9IGVuZFllYXI7XG4gICAgfSkgfHwgW107XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmib7liLDlsI/ov5DmlbDmja7vvIzliJnliqjmgIHnlJ/miJBcbiAgICBpZiAoeGlhb1l1bkRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICB4aWFvWXVuRGF0YSA9IHRoaXMuZ2VuZXJhdGVYaWFvWXVuRm9yRGFZdW4oc2VsZWN0ZWREYVl1bik7XG5cbiAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgY29uc29sZS5sb2coJ+eUn+aIkOWwj+i/kOaVsOaNrjonLCB4aWFvWXVuRGF0YSk7XG4gICAgfVxuXG4gICAgLy8g5pu05paw5rWB5bm05ZKM5bCP6L+Q5ZCI5bm26KGo5qC8XG4gICAgdGhpcy51cGRhdGVMaXVOaWFuWGlhb1l1blRhYmxlKGxpdU5pYW5EYXRhLCB4aWFvWXVuRGF0YSk7XG5cbiAgICAvLyDlpoLmnpzmnInmtYHlubTvvIzpgInmi6nnrKzkuIDkuKrmtYHlubRcbiAgICBpZiAobGl1TmlhbkRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZWxlY3RMaXVOaWFuKGxpdU5pYW5EYXRhWzBdLnllYXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDpgInmi6nmtYHlubRcbiAgICogQHBhcmFtIHllYXIg5rWB5bm05bm05Lu9XG4gICAqL1xuICBwcml2YXRlIHNlbGVjdExpdU5pYW4oeWVhcjogbnVtYmVyKSB7XG4gICAgLy8g5pu05paw6YCJ5Lit55qE5rWB5bm05bm05Lu9XG4gICAgdGhpcy5zZWxlY3RlZExpdU5pYW5ZZWFyID0geWVhcjtcblxuICAgIC8vIOmrmOS6rumAieS4reeahOa1geW5tOWNleWFg+agvFxuICAgIGlmICh0aGlzLmxpdU5pYW5UYWJsZSkge1xuICAgICAgY29uc3QgY2VsbHMgPSB0aGlzLmxpdU5pYW5UYWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXVuaWFuLWNlbGwnKTtcbiAgICAgIGNlbGxzLmZvckVhY2goY2VsbCA9PiB7XG4gICAgICAgIGNvbnN0IGNlbGxZZWFyID0gcGFyc2VJbnQoY2VsbC5nZXRBdHRyaWJ1dGUoJ2RhdGEteWVhcicpIHx8ICcwJyk7XG4gICAgICAgIGlmIChjZWxsWWVhciA9PT0geWVhcikge1xuICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOafpeaJvumAieS4reeahOa1geW5tOaVsOaNrlxuICAgIGNvbnN0IHNlbGVjdGVkTGl1TmlhbiA9IHRoaXMuZmluZExpdU5pYW5CeVllYXIoeWVhcik7XG5cbiAgICAvLyDlsJ3or5Xojrflj5bmtYHmnIjkv6Hmga9cbiAgICBsZXQgbGl1WXVlRGF0YTogYW55W10gPSBbXTtcblxuICAgIC8vIOWmguaenOaJvuWIsOS6hua1geW5tOaVsOaNru+8jOW5tuS4lOaciea1geaciOS/oeaBr++8jOS9v+eUqOWFtua1geaciOS/oeaBr1xuICAgIGlmIChzZWxlY3RlZExpdU5pYW4gJiYgc2VsZWN0ZWRMaXVOaWFuLmxpdVl1ZSkge1xuICAgICAgbGl1WXVlRGF0YSA9IHNlbGVjdGVkTGl1Tmlhbi5saXVZdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOWmguaenOayoeacieaJvuWIsOa1geW5tOaVsOaNruaIlua1geaciOS/oeaBr++8jOWwneivleS7juWOn+Wni+WFq+Wtl+aVsOaNruS4reafpeaJvlxuICAgICAgbGl1WXVlRGF0YSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlPy5maWx0ZXIobHkgPT4ge1xuICAgICAgICAvLyDlpoLmnpzmtYHmnIjmlbDmja7mnIl5ZWFy5bGe5oCn77yM5qOA5p+l5piv5ZCm5Yy56YWNXG4gICAgICAgIGlmIChseS55ZWFyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gbHkueWVhciA9PT0geWVhcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KSB8fCBbXTtcblxuICAgICAgLy8g5aaC5p6c5LuN54S25rKh5pyJ5om+5Yiw5rWB5pyI5pWw5o2u77yM5YiZ5Yqo5oCB55Sf5oiQXG4gICAgICBpZiAobGl1WXVlRGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8g55Sf5oiQ5rWB5pyI5pWw5o2uXG4gICAgICAgIGxpdVl1ZURhdGEgPSB0aGlzLmdlbmVyYXRlTGl1WXVlRm9yWWVhcih5ZWFyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmm7TmlrDmtYHmnIjooajmoLxcbiAgICB0aGlzLnVwZGF0ZUxpdVl1ZVRhYmxlKGxpdVl1ZURhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4uuaMh+WumuW5tOS7veeUn+aIkOa1geaciOaVsOaNrlxuICAgKiBAcGFyYW0geWVhciDlubTku71cbiAgICogQHJldHVybnMg5rWB5pyI5pWw5o2u5pWw57uEXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlTGl1WXVlRm9yWWVhcih5ZWFyOiBudW1iZXIpOiBBcnJheTx7bW9udGg6IHN0cmluZywgZ2FuWmhpOiBzdHJpbmcsIHh1bktvbmc6IHN0cmluZ30+IHtcbiAgICAvLyDlpKnlubLlnLDmlK/pobrluo9cbiAgICBjb25zdCBzdGVtcyA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCI7XG5cbiAgICAvLyDorqHnrpflubTlubLmlK9cbiAgICBjb25zdCBzdGVtSW5kZXggPSAoeWVhciAtIDQpICUgMTA7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBzdGVtc1tzdGVtSW5kZXhdO1xuXG4gICAgLy8g55Sf5oiQ5rWB5pyI5pWw5o2uXG4gICAgY29uc3QgbGl1WXVlRGF0YTogQXJyYXk8e21vbnRoOiBzdHJpbmcsIGdhblpoaTogc3RyaW5nLCB4dW5Lb25nOiBzdHJpbmd9PiA9IFtdO1xuXG4gICAgLy8g5qC55o2u5YWr5a2X5ZG955CG5a2m6KeE5YiZ77yM5rWB5pyI5bmy5pSv55qE6K6h566X5pa55rOV77yaXG4gICAgLy8g5pyI5pSv5Zu65a6a5a+55bqU77ya5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5Lql5a2Q5LiRXG4gICAgLy8g5pyI5bmy5YiZ5qC55o2u5rWB5bm05bmy5pSv56Gu5a6a6LW35aeL5pyI5bmy77yM54S25ZCO5L6d5qyh6YCS5aKeXG5cbiAgICAvLyDnoa7lrproioLku6TmnIjlubLmlK9cbiAgICAvLyDnlLLlt7HlubTotbfkuJnlr4XvvIzkuZnluprlubTotbfmiIrlr4XvvIzkuJnovpvlubTotbfluprlr4XvvIzkuIHlo6zlubTotbflo6zlr4XvvIzmiIrnmbjlubTotbfnlLLlr4VcbiAgICBsZXQgZmlyc3RNb250aFN0ZW0gPSAnJztcbiAgICBpZiAoeWVhclN0ZW0gPT09ICfnlLInIHx8IHllYXJTdGVtID09PSAn5bexJykge1xuICAgICAgZmlyc3RNb250aFN0ZW0gPSAn5LiZJztcbiAgICB9IGVsc2UgaWYgKHllYXJTdGVtID09PSAn5LmZJyB8fCB5ZWFyU3RlbSA9PT0gJ+W6micpIHtcbiAgICAgIGZpcnN0TW9udGhTdGVtID0gJ+aIiic7XG4gICAgfSBlbHNlIGlmICh5ZWFyU3RlbSA9PT0gJ+S4mScgfHwgeWVhclN0ZW0gPT09ICfovpsnKSB7XG4gICAgICBmaXJzdE1vbnRoU3RlbSA9ICfluponO1xuICAgIH0gZWxzZSBpZiAoeWVhclN0ZW0gPT09ICfkuIEnIHx8IHllYXJTdGVtID09PSAn5aOsJykge1xuICAgICAgZmlyc3RNb250aFN0ZW0gPSAn5aOsJztcbiAgICB9IGVsc2UgaWYgKHllYXJTdGVtID09PSAn5oiKJyB8fCB5ZWFyU3RlbSA9PT0gJ+eZuCcpIHtcbiAgICAgIGZpcnN0TW9udGhTdGVtID0gJ+eUsic7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RNb250aFN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2YoZmlyc3RNb250aFN0ZW0pO1xuXG4gICAgLy8g55Sf5oiQMTLkuKrmnIjnmoTmtYHmnIjmlbDmja5cbiAgICBmb3IgKGxldCBtb250aCA9IDE7IG1vbnRoIDw9IDEyOyBtb250aCsrKSB7XG4gICAgICAvLyDorqHnrpfmnIjlubLvvIjmraPmnIjlr4XmnIjlvIDlp4vvvIzmr4/mnIjpgJLlop7kuIDkvY3vvIlcbiAgICAgIGNvbnN0IG1vbnRoU3RlbUluZGV4ID0gKGZpcnN0TW9udGhTdGVtSW5kZXggKyBtb250aCAtIDEpICUgMTA7XG4gICAgICBjb25zdCBtb250aFN0ZW0gPSBzdGVtc1ttb250aFN0ZW1JbmRleF07XG5cbiAgICAgIC8vIOaciOaUr+WbuuWumuWvueW6lFxuICAgICAgY29uc3QgbW9udGhCcmFuY2hNYXAgPSBbJycsICflr4UnLCAn5Y2vJywgJ+i+sCcsICflt7MnLCAn5Y2IJywgJ+acqicsICfnlLMnLCAn6YWJJywgJ+aIjCcsICfkuqUnLCAn5a2QJywgJ+S4kSddO1xuICAgICAgY29uc3QgbW9udGhCcmFuY2ggPSBtb250aEJyYW5jaE1hcFttb250aF07XG5cbiAgICAgIC8vIOe7hOWQiOW5suaUr1xuICAgICAgY29uc3QgZ2FuWmhpID0gbW9udGhTdGVtICsgbW9udGhCcmFuY2g7XG5cbiAgICAgIC8vIOiuoeeul+aXrOepulxuICAgICAgY29uc3QgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhtb250aFN0ZW0sIG1vbnRoQnJhbmNoKTtcblxuICAgICAgLy8g5Lit5paH5pyI5Lu9XG4gICAgICBjb25zdCBjaGluZXNlTW9udGhzID0gWycnLCAn5q2jJywgJ+S6jCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WGrCcsICfohYonXTtcbiAgICAgIGNvbnN0IG1vbnRoVGV4dCA9IGNoaW5lc2VNb250aHNbbW9udGhdICsgJ+aciCc7XG5cbiAgICAgIGxpdVl1ZURhdGEucHVzaCh7XG4gICAgICAgIG1vbnRoOiBtb250aFRleHQsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgeHVuS29uZ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpdVl1ZURhdGE7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5bm05Lu95p+l5om+5rWB5bm05pWw5o2uXG4gICAqIEBwYXJhbSB5ZWFyIOa1geW5tOW5tOS7vVxuICAgKiBAcmV0dXJucyDmtYHlubTmlbDmja7lr7nosaFcbiAgICovXG4gIHByaXZhdGUgZmluZExpdU5pYW5CeVllYXIoeWVhcjogbnVtYmVyKTogYW55IHtcbiAgICAvLyDku47ljp/lp4vmtYHlubTmlbDmja7kuK3mn6Xmib5cbiAgICBpZiAodGhpcy5iYXppSW5mby5saXVOaWFuKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpdU5pYW4gb2YgdGhpcy5iYXppSW5mby5saXVOaWFuKSB7XG4gICAgICAgIGlmIChsaXVOaWFuLnllYXIgPT09IHllYXIpIHtcbiAgICAgICAgICByZXR1cm4gbGl1TmlhbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiDmm7TmlrDmtYHlubTlkozlsI/ov5DlkIjlubbooajmoLxcbiAgICogQHBhcmFtIGxpdU5pYW4g5rWB5bm05pWw5o2uXG4gICAqIEBwYXJhbSB4aWFvWXVuIOWwj+i/kOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVOaWFuWGlhb1l1blRhYmxlKGxpdU5pYW46IGFueVtdLCB4aWFvWXVuOiBhbnlbXSkge1xuICAgIGlmICghdGhpcy5saXVOaWFuVGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDmuIXnqbrooajmoLxcbiAgICB0aGlzLmxpdU5pYW5UYWJsZS5lbXB0eSgpO1xuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6L+U5ZueXG4gICAgaWYgKGxpdU5pYW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5Yqo55S75pWI5p6cXG4gICAgdGhpcy5saXVOaWFuVGFibGUuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICB0aGlzLmxpdU5pYW5UYWJsZS5zdHlsZS50cmFuc2l0aW9uID0gYG9wYWNpdHkgJHt0aGlzLmFuaW1hdGlvbkR1cmF0aW9ufW1zIGVhc2UtaW4tb3V0YDtcblxuICAgIC8vIOesrOS4gOihjO+8muW5tOS7vVxuICAgIGNvbnN0IHllYXJSb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOS7vScgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4ueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBsbi5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8mua1geW5tOW5suaUr1xuICAgIGNvbnN0IGxuR3pSb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBsbkd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+a1geW5tCcgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gbG5HelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIGNsczogJ2JhemktbGl1bmlhbi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogbG4ueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzmnInlubLmlK/vvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgIGlmIChsbi5nYW5aaGkgJiYgbG4uZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSBsbi5nYW5aaGlbMF07IC8vIOWkqeW5slxuICAgICAgICBjb25zdCBicmFuY2ggPSBsbi5nYW5aaGlbMV07IC8vIOWcsOaUr1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5bmy5pSv5oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBsbi5nYW5aaGkgfHwgJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RMaXVOaWFuKGxuLnllYXIpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOaYr+W9k+WJjemAieS4reeahOa1geW5tO+8jOa3u+WKoOmAieS4reagt+W8j1xuICAgICAgaWYgKGxuLnllYXIgPT09IHRoaXMuc2VsZWN0ZWRMaXVOaWFuWWVhcikge1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDnrKzlm5vooYzvvJrmtYHlubTljYHnpZ7vvIjlpoLmnpzmnInvvIlcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLnNoaVNoZW5HYW4pKSB7XG4gICAgICBjb25zdCBsblNoaVNoZW5Sb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIGxuU2hpU2hlblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubTljYHnpZ4nIH0pO1xuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGxuU2hpU2hlblJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgICAgdGV4dDogbG4uc2hpU2hlbkdhbiB8fCAnJyxcbiAgICAgICAgICBjbHM6ICdiYXppLXNoaXNoZW4tY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzkupTooYzvvJrmtYHlubTlnLDlir/vvIjlpoLmnpzmnInvvIlcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLmRpU2hpKSkge1xuICAgICAgY29uc3QgbG5EaVNoaVJvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgbG5EaVNoaVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubTlnLDlir8nIH0pO1xuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGxuRGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGxuLmRpU2hpIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzlha3ooYzvvJrmtYHlubTml6znqbpcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLnh1bktvbmcpKSB7XG4gICAgICBjb25zdCBsblhrUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBsblhrUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+a1geW5tOaXrOepuicgfSk7XG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgY2VsbCA9IGxuWGtSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIGNsczogJ2JhemkteHVua29uZy1jZWxsJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDlpoLmnpzmnInml6znqbrvvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgICAgaWYgKGxuLnh1bktvbmcgJiYgbG4ueHVuS29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHhrMSA9IGxuLnh1bktvbmdbMF07IC8vIOesrOS4gOS4quaXrOepuuWcsOaUr1xuICAgICAgICAgIGNvbnN0IHhrMiA9IGxuLnh1bktvbmdbMV07IC8vIOesrOS6jOS4quaXrOepuuWcsOaUr1xuXG4gICAgICAgICAgLy8g5Yib5bu656ys5LiA5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3QgeGsxU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMSB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoeGsxU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoeGsxKSk7XG5cbiAgICAgICAgICAvLyDliJvlu7rnrKzkuozkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCB4azJTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogeGsyIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azJTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDlpoLmnpzmsqHmnInml6znqbrmiJbmoLzlvI/kuI3mraPnoa7vvIznm7TmjqXmmL7npLrljp/mlofmnKxcbiAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gbG4ueHVuS29uZyB8fCAnJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5LiD6KGM77ya5bCP6L+Q5bmy5pSvXG4gICAgaWYgKHhpYW9ZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeHlHelJvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgeHlHelJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5AnIH0pO1xuXG4gICAgICAvLyDliJvlu7rkuIDkuKrmmKDlsITvvIznlKjkuo7lv6vpgJ/mn6Xmib7nibnlrprlubTku73nmoTlsI/ov5BcbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB4eUd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLXhpYW95dW4tY2VsbCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJ5bCP6L+Q5bmy5pSv77yM5oyJ5LqU6KGM6aKc6Imy5pi+56S6XG4gICAgICAgIGlmICh4eSAmJiB4eS5nYW5aaGkgJiYgeHkuZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3Qgc3RlbSA9IHh5LmdhblpoaVswXTsgLy8g5aSp5bmyXG4gICAgICAgICAgY29uc3QgYnJhbmNoID0geHkuZ2FuWmhpWzFdOyAvLyDlnLDmlK9cblxuICAgICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IHN0ZW1TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogc3RlbSB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoc3RlbVNwYW4sIHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKSk7XG5cbiAgICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCBicmFuY2hTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogYnJhbmNoIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShicmFuY2hTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyhicmFuY2gpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDlpoLmnpzmsqHmnInlubLmlK/miJbmoLzlvI/kuI3mraPnoa7vvIznm7TmjqXmmL7npLrljp/mlofmnKxcbiAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0geHkgPyAoeHkuZ2FuWmhpIHx8ICcnKSA6ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5a+55bqU55qE5rWB5bm05Y2V5YWD5qC86KKr6YCJ5Lit77yM5Lmf6auY5Lqu5bCP6L+Q5Y2V5YWD5qC8XG4gICAgICAgIGlmIChsbi55ZWFyID09PSB0aGlzLnNlbGVjdGVkTGl1TmlhblllYXIpIHtcbiAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOWFq+ihjO+8muWwj+i/kOWNgeelnu+8iOWmguaenOacie+8iVxuICAgIGlmICh4aWFvWXVuLmxlbmd0aCA+IDAgJiYgeGlhb1l1bi5zb21lKHh5ID0+IHh5LnNoaVNoZW5HYW4pKSB7XG4gICAgICBjb25zdCB4eVNoaVNoZW5Sb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIHh5U2hpU2hlblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5DljYHnpZ4nIH0pO1xuXG4gICAgICBjb25zdCB4eU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgIHhpYW9ZdW4uZm9yRWFjaCh4eSA9PiB7XG4gICAgICAgIHh5TWFwLnNldCh4eS55ZWFyLCB4eSk7XG4gICAgICB9KTtcblxuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGNvbnN0IHh5ID0geHlNYXAuZ2V0KGxuLnllYXIpO1xuICAgICAgICB4eVNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IHh5ID8gKHh5LnNoaVNoZW5HYW4gfHwgJycpIDogJycsXG4gICAgICAgICAgY2xzOiAnYmF6aS1zaGlzaGVuLWNlbGwnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5Lmd6KGM77ya5bCP6L+Q5Zyw5Yq/77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKHhpYW9ZdW4ubGVuZ3RoID4gMCAmJiB4aWFvWXVuLnNvbWUoeHkgPT4geHkuZGlTaGkpKSB7XG4gICAgICBjb25zdCB4eURpU2hpUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICB4eURpU2hpUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+Wwj+i/kOWcsOWKvycgfSk7XG5cbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIHh5RGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IHh5ID8gKHh5LmRpU2hpIHx8ICcnKSA6ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzljYHooYzvvJrlsI/ov5Dml6znqbpcbiAgICBpZiAoeGlhb1l1bi5sZW5ndGggPiAwICYmIHhpYW9ZdW4uc29tZSh4eSA9PiB4eS54dW5Lb25nKSkge1xuICAgICAgY29uc3QgeHlYa1JvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgeHlYa1Jvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5Dml6znqbonIH0pO1xuXG4gICAgICAvLyDliJvlu7rkuIDkuKrmmKDlsITvvIznlKjkuo7lv6vpgJ/mn6Xmib7nibnlrprlubTku73nmoTlsI/ov5BcbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB4eVhrUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLXh1bmtvbmctY2VsbCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJ5pes56m677yM5oyJ5LqU6KGM6aKc6Imy5pi+56S6XG4gICAgICAgIGlmICh4eSAmJiB4eS54dW5Lb25nICYmIHh5Lnh1bktvbmcubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCB4azEgPSB4eS54dW5Lb25nWzBdOyAvLyDnrKzkuIDkuKrml6znqbrlnLDmlK9cbiAgICAgICAgICBjb25zdCB4azIgPSB4eS54dW5Lb25nWzFdOyAvLyDnrKzkuozkuKrml6znqbrlnLDmlK9cblxuICAgICAgICAgIC8vIOWIm+W7uuesrOS4gOS4quaXrOepuuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IHhrMVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiB4azEgfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHhrMVNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHhrMSkpO1xuXG4gICAgICAgICAgLy8g5Yib5bu656ys5LqM5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3QgeGsyU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMiB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoeGsyU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoeGsyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pes56m65oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IHh5ID8gKHh5Lnh1bktvbmcgfHwgJycpIDogJyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaYvuekuuihqOagvO+8iOW4puWKqOeUu++8iVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMubGl1TmlhblRhYmxlKSB7XG4gICAgICAgIHRoaXMubGl1TmlhblRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOa1geaciOihqOagvFxuICAgKiBAcGFyYW0gbGl1WXVlIOa1geaciOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVZdWVUYWJsZShsaXVZdWU6IGFueVtdKSB7XG4gICAgaWYgKCF0aGlzLmxpdVl1ZVRhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5riF56m66KGo5qC8XG4gICAgdGhpcy5saXVZdWVUYWJsZS5lbXB0eSgpO1xuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6L+U5ZueXG4gICAgaWYgKGxpdVl1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDmt7vliqDliqjnlLvmlYjmnpxcbiAgICB0aGlzLmxpdVl1ZVRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgdGhpcy5saXVZdWVUYWJsZS5zdHlsZS50cmFuc2l0aW9uID0gYG9wYWNpdHkgJHt0aGlzLmFuaW1hdGlvbkR1cmF0aW9ufW1zIGVhc2UtaW4tb3V0YDtcblxuICAgIC8vIOesrOS4gOihjO+8muaciOS7vVxuICAgIGNvbnN0IG1vbnRoUm93ID0gdGhpcy5saXVZdWVUYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBtb250aFJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHmnIgnIH0pO1xuICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgIC8vIOWkhOeQhuS4jeWQjOagvOW8j+eahOaciOS7veaVsOaNrlxuICAgICAgbGV0IG1vbnRoVGV4dCA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBseS5tb250aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8g5aaC5p6c5piv5a2X56ym5Liy77yI5aaCXCLmraPmnIhcIu+8ie+8jOebtOaOpeS9v+eUqFxuICAgICAgICBtb250aFRleHQgPSBseS5tb250aDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGx5Lm1vbnRoID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyDlpoLmnpzmmK/mlbDlrZfvvIzovazmjaLkuLrkuK3mlofmnIjku71cbiAgICAgICAgY29uc3QgY2hpbmVzZU1vbnRocyA9IFsnJywgJ+atoycsICfkuownLCAn5LiJJywgJ+WbmycsICfkupQnLCAn5YWtJywgJ+S4gycsICflhasnLCAn5LmdJywgJ+WNgScsICflhqwnLCAn6IWKJ107XG4gICAgICAgIG1vbnRoVGV4dCA9IGNoaW5lc2VNb250aHNbbHkubW9udGhdICsgJ+aciCc7XG4gICAgICB9IGVsc2UgaWYgKGx5Lm1vbnRoSW5DaGluZXNlKSB7XG4gICAgICAgIC8vIOWmguaenOaciW1vbnRoSW5DaGluZXNl5bGe5oCn77yIbHVuYXItdHlwZXNjcmlwdOW6k+agvOW8j++8iVxuICAgICAgICBtb250aFRleHQgPSBseS5tb250aEluQ2hpbmVzZTtcbiAgICAgIH0gZWxzZSBpZiAobHkuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyDlpoLmnpzmnIlpbmRleOWxnuaAp++8iGx1bmFyLXR5cGVzY3JpcHTlupPmoLzlvI/vvIlcbiAgICAgICAgY29uc3QgY2hpbmVzZU1vbnRocyA9IFsn5q2jJywgJ+S6jCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WGrCcsICfohYonXTtcbiAgICAgICAgbW9udGhUZXh0ID0gY2hpbmVzZU1vbnRoc1tseS5pbmRleF0gKyAn5pyIJztcbiAgICAgIH1cblxuICAgICAgbW9udGhSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBtb250aFRleHQsXG4gICAgICAgIGNsczogJ2JhemktbGl1eXVlLW1vbnRoJ1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAvLyDojrflj5bmnIjku73moIfor4bvvIznlKjkuo5kYXRhLW1vbnRo5bGe5oCnXG4gICAgICBsZXQgbW9udGhJZCA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBseS5tb250aCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGx5Lm1vbnRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBtb250aElkID0gbHkubW9udGgudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAobHkuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtb250aElkID0gKGx5LmluZGV4ICsgMSkudG9TdHJpbmcoKTsgLy8g57Si5byV5LuOMOW8gOWni++8jOaciOS7veS7jjHlvIDlp4tcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2VsbCA9IGd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgY2xzOiAnYmF6aS1saXV5dWUtY2VsbCcsXG4gICAgICAgIGF0dHI6IHsgJ2RhdGEtbW9udGgnOiBtb250aElkIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzmnInlubLmlK/vvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgIGlmIChseS5nYW5aaGkgJiYgbHkuZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSBseS5nYW5aaGlbMF07IC8vIOWkqeW5slxuICAgICAgICBjb25zdCBicmFuY2ggPSBseS5nYW5aaGlbMV07IC8vIOWcsOaUr1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5bmy5pSv5oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBseS5nYW5aaGkgfHwgJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRoaXMubGl1WXVlVGFibGU/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWxpdXl1ZS1jZWxsJykuZm9yRWFjaChjID0+IHtcbiAgICAgICAgICBjLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muWNgeelnu+8iOWmguaenOacie+8iVxuICAgIGlmIChsaXVZdWUuc29tZShseSA9PiBseS5zaGlTaGVuR2FuKSkge1xuICAgICAgY29uc3Qgc2hpU2hlblJvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+WNgeelnicgfSk7XG4gICAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAgIHNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGx5LnNoaVNoZW5HYW4gfHwgJycsXG4gICAgICAgICAgY2xzOiAnYmF6aS1zaGlzaGVuLWNlbGwnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5Zub6KGM77ya5Zyw5Yq/77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKGxpdVl1ZS5zb21lKGx5ID0+IGx5LmRpU2hpKSkge1xuICAgICAgY29uc3QgZGlTaGlSb3cgPSB0aGlzLmxpdVl1ZVRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgZGlTaGlSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5Zyw5Yq/JyB9KTtcbiAgICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgICAgZGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGx5LmRpU2hpIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzkupTooYzvvJrml6znqbpcbiAgICBjb25zdCB4a1JvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeGtSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5pes56m6JyB9KTtcbiAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAvLyDlpITnkIbkuI3lkIzmoLzlvI/nmoTml6znqbrmlbDmja5cbiAgICAgIGxldCB4dW5Lb25nID0gJyc7XG4gICAgICBpZiAobHkueHVuS29uZykge1xuICAgICAgICB4dW5Lb25nID0gbHkueHVuS29uZztcbiAgICAgIH0gZWxzZSBpZiAobHkueHVuICYmIGx5Lnh1bktvbmcpIHtcbiAgICAgICAgLy8gbHVuYXItdHlwZXNjcmlwdOW6k+WPr+iDveS9v+eUqOi/meenjeagvOW8j1xuICAgICAgICB4dW5Lb25nID0gbHkueHVuS29uZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIOWmguaenOayoeacieaXrOepuuaVsOaNru+8jOWwneivleiuoeeul1xuICAgICAgICBjb25zdCBnYW5aaGkgPSBseS5nYW5aaGk7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuWmhpWzBdLCBnYW5aaGlbMV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNlbGwgPSB4a1Jvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIGNsczogJ2JhemkteHVua29uZy1jZWxsJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOacieaXrOepuu+8jOaMieS6lOihjOminOiJsuaYvuekulxuICAgICAgaWYgKHh1bktvbmcgJiYgeHVuS29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICBjb25zdCB4azEgPSB4dW5Lb25nWzBdOyAvLyDnrKzkuIDkuKrml6znqbrlnLDmlK9cbiAgICAgICAgY29uc3QgeGsyID0geHVuS29uZ1sxXTsgLy8g56ys5LqM5Liq5pes56m65Zyw5pSvXG5cbiAgICAgICAgLy8g5Yib5bu656ys5LiA5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IHhrMVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiB4azEgfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azFTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azEpKTtcblxuICAgICAgICAvLyDliJvlu7rnrKzkuozkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgeGsyU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMiB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHhrMlNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHhrMikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pes56m65oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSB4dW5Lb25nO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8g56ys5YWt6KGM77ya57qz6Z+z77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKGxpdVl1ZS5zb21lKGx5ID0+IGx5Lm5hWWluKSkge1xuICAgICAgY29uc3QgbmFZaW5Sb3cgPSB0aGlzLmxpdVl1ZVRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn57qz6Z+zJyB9KTtcbiAgICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgICAgY29uc3QgbmFZaW4gPSBseS5uYVlpbiB8fCAnJztcbiAgICAgICAgY29uc3QgY2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLW5heWluLWNlbGwnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChuYVlpbikge1xuICAgICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihuYVlpbik7XG4gICAgICAgICAgY29uc3QgbmFZaW5TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogbmFZaW4gfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KG5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5pi+56S66KGo5qC877yI5bim5Yqo55S777yJXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5saXVZdWVUYWJsZSkge1xuICAgICAgICB0aGlzLmxpdVl1ZVRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4uuaMh+WumuWkp+i/kOeUn+aIkOa1geW5tOaVsOaNrlxuICAgKiBAcGFyYW0gZGFZdW4g5aSn6L+Q5pWw5o2uXG4gICAqIEByZXR1cm5zIOa1geW5tOaVsOaNruaVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUxpdU5pYW5Gb3JEYVl1bihkYVl1bjogYW55KTogQXJyYXk8e3llYXI6IG51bWJlciwgYWdlOiBudW1iZXIsIGdhblpoaTogc3RyaW5nLCB4dW5Lb25nOiBzdHJpbmcsIHNoaVNoZW5HYW4/OiBzdHJpbmcsIGRpU2hpPzogc3RyaW5nfT4ge1xuICAgIC8vIOWmguaenOayoeaciei1t+Wni+W5tOaIlue7k+adn+W5tO+8jOi/lOWbnuepuuaVsOe7hFxuICAgIGlmICghZGFZdW4uc3RhcnRZZWFyKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8g6K6h566X57uT5p2f5bm077yI5aaC5p6c5pyq5a6a5LmJ77yM5L2/55So6LW35aeL5bm0KznvvIlcbiAgICBjb25zdCBlbmRZZWFyID0gZGFZdW4uZW5kWWVhciA/PyAoZGFZdW4uc3RhcnRZZWFyICsgOSk7XG5cbiAgICAvLyDnlJ/miJDmtYHlubTmlbDmja5cbiAgICBjb25zdCBsaXVOaWFuRGF0YTogQXJyYXk8e3llYXI6IG51bWJlciwgYWdlOiBudW1iZXIsIGdhblpoaTogc3RyaW5nLCB4dW5Lb25nOiBzdHJpbmcsIHNoaVNoZW5HYW4/OiBzdHJpbmcsIGRpU2hpPzogc3RyaW5nfT4gPSBbXTtcbiAgICBsZXQgYWdlID0gZGFZdW4uc3RhcnRBZ2U7XG5cbiAgICAvLyDojrflj5bml6XlubLvvIznlKjkuo7orqHnrpfljYHnpZ5cbiAgICBjb25zdCBkYXlTdGVtID0gdGhpcy5iYXppSW5mby5kYXlTdGVtO1xuXG4gICAgZm9yIChsZXQgeWVhciA9IGRhWXVuLnN0YXJ0WWVhcjsgeWVhciA8PSBlbmRZZWFyOyB5ZWFyKyssIGFnZSsrKSB7XG4gICAgICAvLyDorqHnrpflubLmlK9cbiAgICAgIC8vIOWkqeW5suWcsOaUr+mhuuW6j1xuICAgICAgY29uc3Qgc3RlbXMgPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiO1xuICAgICAgY29uc3QgYnJhbmNoZXMgPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiO1xuXG4gICAgICAvLyDorqHnrpfmtYHlubTlubLmlK9cbiAgICAgIGNvbnN0IHN0ZW1JbmRleCA9ICh5ZWFyIC0gNCkgJSAxMDtcbiAgICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gKHllYXIgLSA0KSAlIDEyO1xuXG4gICAgICBjb25zdCBzdGVtID0gc3RlbXNbc3RlbUluZGV4XTtcbiAgICAgIGNvbnN0IGJyYW5jaCA9IGJyYW5jaGVzW2JyYW5jaEluZGV4XTtcbiAgICAgIGNvbnN0IGdhblpoaSA9IHN0ZW0gKyBicmFuY2g7XG5cbiAgICAgIC8vIOiuoeeul+aXrOepulxuICAgICAgY29uc3QgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhzdGVtLCBicmFuY2gpO1xuXG4gICAgICAvLyDorqHnrpfljYHnpZ7vvIjlpoLmnpzmnInml6XlubLvvIlcbiAgICAgIGxldCBzaGlTaGVuR2FuID0gJyc7XG4gICAgICBpZiAoZGF5U3RlbSkge1xuICAgICAgICBzaGlTaGVuR2FuID0gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHN0ZW0pO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpflnLDlir/vvIjlpoLmnpzmnInml6XlubLvvIlcbiAgICAgIGxldCBkaVNoaSA9ICcnO1xuICAgICAgaWYgKGRheVN0ZW0pIHtcbiAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIGJyYW5jaCk7XG4gICAgICB9XG5cbiAgICAgIGxpdU5pYW5EYXRhLnB1c2goe1xuICAgICAgICB5ZWFyLFxuICAgICAgICBhZ2UsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgeHVuS29uZyxcbiAgICAgICAgc2hpU2hlbkdhbixcbiAgICAgICAgZGlTaGlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsaXVOaWFuRGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiDkuLrmjIflrprlpKfov5DnlJ/miJDlsI/ov5DmlbDmja5cbiAgICogQHBhcmFtIGRhWXVuIOWkp+i/kOaVsOaNrlxuICAgKiBAcmV0dXJucyDlsI/ov5DmlbDmja7mlbDnu4RcbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVYaWFvWXVuRm9yRGFZdW4oZGFZdW46IGFueSk6IEFycmF5PHt5ZWFyOiBudW1iZXIsIGFnZTogbnVtYmVyLCBnYW5aaGk6IHN0cmluZywgeHVuS29uZzogc3RyaW5nLCBzaGlTaGVuR2FuPzogc3RyaW5nLCBkaVNoaT86IHN0cmluZ30+IHtcbiAgICAvLyDlpoLmnpzmsqHmnInotbflp4vlubTmiJbnu5PmnZ/lubTvvIzov5Tlm57nqbrmlbDnu4RcbiAgICBpZiAoIWRhWXVuLnN0YXJ0WWVhcikge1xuICAgICAgY29uc29sZS5sb2coJ+ayoeaciei1t+Wni+W5tO+8jOaXoOazleeUn+aIkOWwj+i/kOaVsOaNricpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+e7k+adn+W5tO+8iOWmguaenOacquWumuS5ie+8jOS9v+eUqOi1t+Wni+W5tCs577yJXG4gICAgY29uc3QgZW5kWWVhciA9IGRhWXVuLmVuZFllYXIgPz8gKGRhWXVuLnN0YXJ0WWVhciArIDkpO1xuICAgIGNvbnNvbGUubG9nKGDlsI/ov5DlubTku73ojIPlm7Q6ICR7ZGFZdW4uc3RhcnRZZWFyfSAtICR7ZW5kWWVhcn1gKTtcblxuICAgIC8vIOeUn+aIkOWwj+i/kOaVsOaNrlxuICAgIGNvbnN0IHhpYW9ZdW5EYXRhOiBBcnJheTx7eWVhcjogbnVtYmVyLCBhZ2U6IG51bWJlciwgZ2FuWmhpOiBzdHJpbmcsIHh1bktvbmc6IHN0cmluZywgc2hpU2hlbkdhbj86IHN0cmluZywgZGlTaGk/OiBzdHJpbmd9PiA9IFtdO1xuICAgIGxldCBhZ2UgPSBkYVl1bi5zdGFydEFnZTtcblxuICAgIC8vIOiOt+WPluWkp+i/kOW5suaUr1xuICAgIGNvbnN0IGRhWXVuR2FuWmhpID0gZGFZdW4uZ2FuWmhpO1xuICAgIGlmICghZGFZdW5HYW5aaGkgfHwgZGFZdW5HYW5aaGkubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZygn5aSn6L+Q5bmy5pSv5peg5pWIOicsIGRhWXVuR2FuWmhpKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygn5aSn6L+Q5bmy5pSvOicsIGRhWXVuR2FuWmhpKTtcblxuICAgIC8vIOWkqeW5suWcsOaUr+mhuuW6j1xuICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDlpKfov5DlubLmlK/ntKLlvJVcbiAgICBjb25zdCBkYVl1blN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2YoZGFZdW5HYW5aaGlbMF0pO1xuICAgIGNvbnN0IGRhWXVuQnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKGRhWXVuR2FuWmhpWzFdKTtcblxuICAgIGlmIChkYVl1blN0ZW1JbmRleCA9PT0gLTEgfHwgZGFZdW5CcmFuY2hJbmRleCA9PT0gLTEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCflpKfov5DlubLmlK/ntKLlvJXml6DmlYg6JywgZGFZdW5TdGVtSW5kZXgsIGRhWXVuQnJhbmNoSW5kZXgpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIOiOt+WPluaXpeW5su+8jOeUqOS6juiuoeeul+WNgeelnlxuICAgIGNvbnN0IGRheVN0ZW0gPSB0aGlzLmJhemlJbmZvLmRheVN0ZW07XG5cbiAgICAvLyDkvb/nlKjmnIjmn7HlubLmlK/kvZzkuLrlsI/ov5DotbfngrlcbiAgICBjb25zdCBtb250aFN0ZW0gPSB0aGlzLmJhemlJbmZvLm1vbnRoU3RlbTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IHRoaXMuYmF6aUluZm8ubW9udGhCcmFuY2g7XG5cbiAgICBpZiAoIW1vbnRoU3RlbSB8fCAhbW9udGhCcmFuY2gpIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmnIjmn7HlubLmlK/ml6DmlYjvvIzkvb/nlKjlpKfov5DlubLmlK/kvZzkuLrlsI/ov5DotbfngrknKTtcblxuICAgICAgLy8g5aaC5p6c5rKh5pyJ5pyI5p+x5bmy5pSv77yM5L2/55So5aSn6L+Q5bmy5pSv5L2c5Li65bCP6L+Q6LW354K5XG4gICAgICBmb3IgKGxldCB5ZWFyID0gZGFZdW4uc3RhcnRZZWFyOyB5ZWFyIDw9IGVuZFllYXI7IHllYXIrKywgYWdlKyspIHtcbiAgICAgICAgLy8g5bCP6L+Q5bmy5pSv6K6h566X77yI566A5YyW5aSE55CG77yM5a6e6ZmF5bqU5qC55o2u5ZG955CG6KeE5YiZ77yJXG4gICAgICAgIC8vIOi/memHjOWBh+iuvuWwj+i/kOWkqeW5suaMieW5tOW5sumhuuaOku+8jOWcsOaUr+aMieaciOaUr+mhuuaOklxuICAgICAgICBjb25zdCBzdGVtSW5kZXggPSAoZGFZdW5TdGVtSW5kZXggKyAoeWVhciAtIGRhWXVuLnN0YXJ0WWVhcikpICUgMTA7XG4gICAgICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gKGRhWXVuQnJhbmNoSW5kZXggKyAoeWVhciAtIGRhWXVuLnN0YXJ0WWVhcikpICUgMTI7XG5cbiAgICAgICAgY29uc3Qgc3RlbSA9IHN0ZW1zW3N0ZW1JbmRleF07XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGJyYW5jaGVzW2JyYW5jaEluZGV4XTtcbiAgICAgICAgY29uc3QgZ2FuWmhpID0gc3RlbSArIGJyYW5jaDtcblxuICAgICAgICAvLyDorqHnrpfml6znqbpcbiAgICAgICAgY29uc3QgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhzdGVtLCBicmFuY2gpO1xuXG4gICAgICAgIC8vIOiuoeeul+WNgeelnu+8iOWmguaenOacieaXpeW5su+8iVxuICAgICAgICBsZXQgc2hpU2hlbkdhbiA9ICcnO1xuICAgICAgICBpZiAoZGF5U3RlbSkge1xuICAgICAgICAgIHNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgc3RlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorqHnrpflnLDlir/vvIjlpoLmnpzmnInml6XlubLvvIlcbiAgICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICAgIGlmIChkYXlTdGVtKSB7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIGJyYW5jaCk7XG4gICAgICAgIH1cblxuICAgICAgICB4aWFvWXVuRGF0YS5wdXNoKHtcbiAgICAgICAgICB5ZWFyLFxuICAgICAgICAgIGFnZSxcbiAgICAgICAgICBnYW5aaGksXG4gICAgICAgICAgeHVuS29uZyxcbiAgICAgICAgICBzaGlTaGVuR2FuLFxuICAgICAgICAgIGRpU2hpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygn5L2/55So5pyI5p+x5bmy5pSv5L2c5Li65bCP6L+Q6LW354K5OicsIG1vbnRoU3RlbSArIG1vbnRoQnJhbmNoKTtcblxuICAgICAgLy8g5pyI5p+x5bmy5pSv57Si5byVXG4gICAgICBjb25zdCBtb250aFN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2YobW9udGhTdGVtKTtcbiAgICAgIGNvbnN0IG1vbnRoQnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKG1vbnRoQnJhbmNoKTtcblxuICAgICAgZm9yIChsZXQgeWVhciA9IGRhWXVuLnN0YXJ0WWVhcjsgeWVhciA8PSBlbmRZZWFyOyB5ZWFyKyssIGFnZSsrKSB7XG4gICAgICAgIC8vIOWwj+i/kOW5suaUr+iuoeeul++8iOS9v+eUqOaciOafseW5suaUr+S9nOS4uui1t+eCue+8iVxuICAgICAgICBjb25zdCBzdGVtSW5kZXggPSAobW9udGhTdGVtSW5kZXggKyAoeWVhciAtIGRhWXVuLnN0YXJ0WWVhcikpICUgMTA7XG4gICAgICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gKG1vbnRoQnJhbmNoSW5kZXggKyAoeWVhciAtIGRhWXVuLnN0YXJ0WWVhcikpICUgMTI7XG5cbiAgICAgICAgY29uc3Qgc3RlbSA9IHN0ZW1zW3N0ZW1JbmRleF07XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGJyYW5jaGVzW2JyYW5jaEluZGV4XTtcbiAgICAgICAgY29uc3QgZ2FuWmhpID0gc3RlbSArIGJyYW5jaDtcblxuICAgICAgICAvLyDorqHnrpfml6znqbpcbiAgICAgICAgY29uc3QgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhzdGVtLCBicmFuY2gpO1xuXG4gICAgICAgIC8vIOiuoeeul+WNgeelnu+8iOWmguaenOacieaXpeW5su+8iVxuICAgICAgICBsZXQgc2hpU2hlbkdhbiA9ICcnO1xuICAgICAgICBpZiAoZGF5U3RlbSkge1xuICAgICAgICAgIHNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgc3RlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorqHnrpflnLDlir/vvIjlpoLmnpzmnInml6XlubLvvIlcbiAgICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICAgIGlmIChkYXlTdGVtKSB7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIGJyYW5jaCk7XG4gICAgICAgIH1cblxuICAgICAgICB4aWFvWXVuRGF0YS5wdXNoKHtcbiAgICAgICAgICB5ZWFyLFxuICAgICAgICAgIGFnZSxcbiAgICAgICAgICBnYW5aaGksXG4gICAgICAgICAgeHVuS29uZyxcbiAgICAgICAgICBzaGlTaGVuR2FuLFxuICAgICAgICAgIGRpU2hpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB4aWFvWXVuRGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfml6znqbpcbiAgICogQHBhcmFtIGdhbiDlpKnlubJcbiAgICogQHBhcmFtIHpoaSDlnLDmlK9cbiAgICogQHJldHVybnMg5pes56m6XG4gICAqL1xuICBwcml2YXRlIGNhbGN1bGF0ZVh1bktvbmcoZ2FuOiBzdHJpbmcsIHpoaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpKnlubLluo/lj7fvvIjnlLI9MCwg5LmZPTEsIC4uLiwg55m4PTnvvIlcbiAgICBjb25zdCBnYW5JbmRleCA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCIuaW5kZXhPZihnYW4pO1xuICAgIC8vIOWcsOaUr+W6j+WPt++8iOWtkD0wLCDkuJE9MSwgLi4uLCDkuqU9MTHvvIlcbiAgICBjb25zdCB6aGlJbmRleCA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuaW5kZXhPZih6aGkpO1xuXG4gICAgaWYgKGdhbkluZGV4IDwgMCB8fCB6aGlJbmRleCA8IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyDorqHnrpfml6zpppZcbiAgICBjb25zdCB4dW5TaG91SW5kZXggPSBNYXRoLmZsb29yKGdhbkluZGV4IC8gMikgKiAyO1xuXG4gICAgLy8g6K6h566X5pes56m65Zyw5pSvXG4gICAgY29uc3QgeHVuS29uZ0luZGV4MSA9ICh4dW5TaG91SW5kZXggKyAxMCkgJSAxMjtcbiAgICBjb25zdCB4dW5Lb25nSW5kZXgyID0gKHh1blNob3VJbmRleCArIDExKSAlIDEyO1xuXG4gICAgLy8g6I635Y+W5pes56m65Zyw5pSvXG4gICAgY29uc3QgeHVuS29uZ1poaTEgPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiLmNoYXJBdCh4dW5Lb25nSW5kZXgxKTtcbiAgICBjb25zdCB4dW5Lb25nWmhpMiA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuY2hhckF0KHh1bktvbmdJbmRleDIpO1xuXG4gICAgcmV0dXJuIHh1bktvbmdaaGkxICsgeHVuS29uZ1poaTI7XG4gIH1cblxuXG5cblxuXG4gIC8qKlxuICAgKiDnm7TmjqXlnKjlhYPntKDkuIrorr7nva7kupTooYzpopzoibJcbiAgICogQHBhcmFtIGVsZW1lbnQgSFRNTOWFg+e0oFxuICAgKiBAcGFyYW0gd3VYaW5nIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzZXRXdVhpbmdDb2xvckRpcmVjdGx5KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB3dVhpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGlmICghd3VYaW5nKSByZXR1cm47XG5cbiAgICAvLyDnp7vpmaTmiYDmnInlj6/og73nmoTkupTooYznsbtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3d1eGluZy1qaW4nLCAnd3V4aW5nLW11JywgJ3d1eGluZy1zaHVpJywgJ3d1eGluZy1odW8nLCAnd3V4aW5nLXR1Jyk7XG5cbiAgICAvLyDmt7vliqDlr7nlupTnmoTkupTooYznsbtcbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzpcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3dXhpbmctamluJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5pyoJzpcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3dXhpbmctbXUnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmsLQnOlxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3d1eGluZy1zaHVpJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzpcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3dXhpbmctaHVvJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5ZyfJzpcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3dXhpbmctdHUnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5YaF6IGU5qC35byP5L2c5Li65aSH5Lu9XG4gICAgc3dpdGNoICh3dVhpbmcpIHtcbiAgICAgIGNhc2UgJ+mHkSc6XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnI0ZGRDcwMCc7IC8vIOmHkSAtIOm7hOiJslxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+acqCc6XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnIzJlOGI1Nyc7IC8vIOacqCAtIOe7v+iJslxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+awtCc6XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnIzFlOTBmZic7IC8vIOawtCAtIOiTneiJslxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+eBqyc6XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnI2ZmNDUwMCc7IC8vIOeBqyAtIOe6ouiJslxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+Wcnyc6XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnI2NkODUzZic7IC8vIOWcnyAtIOajleiJslxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5Li65aSp5bmy5YWD57Sg5bqU55So5LqU6KGM6aKc6ImyXG4gICAqIEBwYXJhbSBlbGVtZW50IEhUTUzlhYPntKBcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqL1xuICBwcml2YXRlIGFwcGx5U3RlbVd1WGluZ0NvbG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzdGVtOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyDojrflj5blpKnlubLlr7nlupTnmoTkupTooYxcbiAgICBjb25zdCB3dVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoc3RlbSk7XG5cbiAgICAvLyDnm7TmjqXorr7nva7lhoXogZTmoLflvI9cbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZENzAwICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g6YeRIC0g6buE6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5pyoJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjMmU4YjU3ICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5pyoIC0g57u/6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5rC0JzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjMWU5MGZmICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5rC0IC0g6JOd6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjZmY0NTAwICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g54GrIC0g57qi6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5ZyfJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjY2Q4NTNmICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5ZyfIC0g5qOV6ImyXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDkuLrlnLDmlK/lhYPntKDlupTnlKjkupTooYzpopzoibJcbiAgICogQHBhcmFtIGVsZW1lbnQgSFRNTOWFg+e0oFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKi9cbiAgcHJpdmF0ZSBhcHBseUJyYW5jaFd1WGluZ0NvbG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBicmFuY2g6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIOiOt+WPluWcsOaUr+WvueW6lOeahOS6lOihjFxuICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCk7XG5cbiAgICAvLyDnm7TmjqXorr7nva7lhoXogZTmoLflvI9cbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZENzAwICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g6YeRIC0g6buE6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5pyoJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjMmU4YjU3ICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5pyoIC0g57u/6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5rC0JzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjMWU5MGZmICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5rC0IC0g6JOd6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjZmY0NTAwICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g54GrIC0g57qi6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5ZyfJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjY2Q4NTNmICFpbXBvcnRhbnQ7IGZvbnQtd2VpZ2h0OiBib2xkICFpbXBvcnRhbnQ7JzsgLy8g5ZyfIC0g5qOV6ImyXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG5cblxuXG5cblxuXG5cblxuICAvKipcbiAgICog5LuO57qz6Z+z5Lit5o+Q5Y+W5LqU6KGM5bGe5oCnXG4gICAqIEBwYXJhbSBuYVlpbiDnurPpn7NcbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIGV4dHJhY3RXdVhpbmdGcm9tTmFZaW4obmFZaW46IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g57qz6Z+z6YCa5bi45pivXCJYWOS6lOihjFwi55qE5qC85byP77yM5aaCXCLph5HnrpTph5FcIuOAgVwi5aSn5rqq5rC0XCLnrYlcbiAgICAvLyDmiJHku6zpnIDopoHmj5Dlj5bmnIDlkI7kuIDkuKrlrZfvvIzljbPkupTooYzlsZ7mgKdcbiAgICBpZiAoIW5hWWluIHx8IG5hWWluLmxlbmd0aCA8IDEpIHtcbiAgICAgIHJldHVybiAn5pyq55+lJztcbiAgICB9XG5cbiAgICAvLyDmj5Dlj5bmnIDlkI7kuIDkuKrlrZdcbiAgICBjb25zdCBsYXN0Q2hhciA9IG5hWWluLmNoYXJBdChuYVlpbi5sZW5ndGggLSAxKTtcblxuICAgIC8vIOajgOafpeaYr+WQpuaYr+S6lOihjOWtl1xuICAgIGlmIChbJ+mHkScsICfmnKgnLCAn5rC0JywgJ+eBqycsICflnJ8nXS5pbmNsdWRlcyhsYXN0Q2hhcikpIHtcbiAgICAgIHJldHVybiBsYXN0Q2hhcjtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpzmnIDlkI7kuIDkuKrlrZfkuI3mmK/kupTooYzvvIzlsJ3or5Xmn6Xmib7nurPpn7PkuK3ljIXlkKvnmoTkupTooYzlrZdcbiAgICBmb3IgKGNvbnN0IHd1WGluZyBvZiBbJ+mHkScsICfmnKgnLCAn5rC0JywgJ+eBqycsICflnJ8nXSkge1xuICAgICAgaWYgKG5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgICAgcmV0dXJuIHd1WGluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJ+acquefpSc7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65bim6aKc6Imy55qE6JeP5bmyXG4gICAqIEBwYXJhbSBjb250YWluZXIg5a655Zmo5YWD57SgXG4gICAqIEBwYXJhbSBoaWRlR2FuVGV4dCDol4/lubLmlofmnKxcbiAgICovXG4gIHByaXZhdGUgY3JlYXRlQ29sb3JlZEhpZGVHYW4oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgaGlkZUdhblRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghaGlkZUdhblRleHQpIHtcbiAgICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOWmguaenOiXj+W5suaYr+mAl+WPt+WIhumalOeahO+8jOWIhuWIq+WkhOeQhuavj+S4quiXj+W5slxuICAgIGlmIChoaWRlR2FuVGV4dC5pbmNsdWRlcygnLCcpKSB7XG4gICAgICBjb25zdCBoaWRlR2FucyA9IGhpZGVHYW5UZXh0LnNwbGl0KCcsJyk7XG4gICAgICBoaWRlR2Fucy5mb3JFYWNoKChnYW4sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zdCBnYW5TcGFuID0gY29udGFpbmVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiBnYW4gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShnYW5TcGFuLCB3dVhpbmcpO1xuXG4gICAgICAgIC8vIOWmguaenOS4jeaYr+acgOWQjuS4gOS4qu+8jOa3u+WKoOmAl+WPt+WIhumalFxuICAgICAgICBpZiAoaW5kZXggPCBoaWRlR2Fucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgY29udGFpbmVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnLCcgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyDljZXkuKrol4/lubJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGlkZUdhblRleHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZ2FuID0gaGlkZUdhblRleHRbaV07XG4gICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zdCBnYW5TcGFuID0gY29udGFpbmVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiBnYW4gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShnYW5TcGFuLCB3dVhpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blpKnlubLlr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRTdGVtV3VYaW5nKHN0ZW06IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5pyoJyxcbiAgICAgICfkuZknOiAn5pyoJyxcbiAgICAgICfkuJknOiAn54GrJyxcbiAgICAgICfkuIEnOiAn54GrJyxcbiAgICAgICfmiIonOiAn5ZyfJyxcbiAgICAgICflt7EnOiAn5ZyfJyxcbiAgICAgICfluponOiAn6YeRJyxcbiAgICAgICfovpsnOiAn6YeRJyxcbiAgICAgICflo6wnOiAn5rC0JyxcbiAgICAgICfnmbgnOiAn5rC0J1xuICAgIH07XG5cbiAgICByZXR1cm4gbWFwW3N0ZW1dIHx8ICfmnKrnn6UnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWNgeelnlxuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEByZXR1cm5zIOWNgeelnlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRTaGlTaGVuKGRheVN0ZW06IHN0cmluZywgc3RlbTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpKnlubLpobrluo9cbiAgICBjb25zdCBzdGVtcyA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCI7XG5cbiAgICAvLyDkupTooYzlsZ7mgKfvvIjmnKrkvb/nlKjvvIlcbiAgICAvLyBjb25zdCB3dXhpbmcgPSBbXCLmnKhcIiwgXCLmnKhcIiwgXCLngatcIiwgXCLngatcIiwgXCLlnJ9cIiwgXCLlnJ9cIiwgXCLph5FcIiwgXCLph5FcIiwgXCLmsLRcIiwgXCLmsLRcIl07XG5cbiAgICAvLyDljYHnpZ7lkI3np7BcbiAgICBjb25zdCBzaGlTaGVuTmFtZXMgPSBbXG4gICAgICBbXCLmr5TogqlcIiwgXCLliqvotKJcIiwgXCLpo5/npZ5cIiwgXCLkvKTlrphcIiwgXCLlgY/otKJcIiwgXCLmraPotKJcIiwgXCLkuIPmnYBcIiwgXCLmraPlrphcIiwgXCLlgY/ljbBcIiwgXCLmraPljbBcIl0sICAvLyDpmLPlubJcbiAgICAgIFtcIuavlOiCqVwiLCBcIuWKq+i0olwiLCBcIumjn+elnlwiLCBcIuS8pOWumFwiLCBcIuWBj+i0olwiLCBcIuato+i0olwiLCBcIuS4g+adgFwiLCBcIuato+WumFwiLCBcIuWBj+WNsFwiLCBcIuato+WNsFwiXSAgIC8vIOmYtOW5slxuICAgIF07XG5cbiAgICAvLyDojrflj5bml6XlubLlkoznm67moIflpKnlubLnmoTntKLlvJVcbiAgICBjb25zdCBkYXlTdGVtSW5kZXggPSBzdGVtcy5pbmRleE9mKGRheVN0ZW0pO1xuICAgIGNvbnN0IHN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2Yoc3RlbSk7XG5cbiAgICBpZiAoZGF5U3RlbUluZGV4ID09PSAtMSB8fCBzdGVtSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8g5Yik5pat5pel5bmy6Zi06ZizXG4gICAgY29uc3QgZGF5WWluWWFuZyA9IGRheVN0ZW1JbmRleCAlIDIgPT09IDAgPyAwIDogMTsgIC8vIDDkuLrpmLPlubLvvIwx5Li66Zi05bmyXG5cbiAgICAvLyDorqHnrpfljYHnpZ7ntKLlvJVcbiAgICBsZXQgc2hpU2hlbkluZGV4ID0gKHN0ZW1JbmRleCAtIGRheVN0ZW1JbmRleCArIDEwKSAlIDEwO1xuXG4gICAgLy8g6L+U5Zue5Y2B56We5ZCN56ewXG4gICAgcmV0dXJuIHNoaVNoZW5OYW1lc1tkYXlZaW5ZYW5nXVtzaGlTaGVuSW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5Zyw5Yq/XG4gICAqL1xuICBwcml2YXRlIGdldERpU2hpKGRheVN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWcsOaUr+mhuuW6j1xuICAgIGNvbnN0IGJyYW5jaGVzID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIjtcblxuICAgIC8vIOmVv+eUn+WNgeS6jOelnuWQjeensFxuICAgIGNvbnN0IGRpU2hpTmFtZXMgPSBbXCLplb/nlJ9cIiwgXCLmspDmtbRcIiwgXCLlhqDluKZcIiwgXCLkuLTlrphcIiwgXCLluJ3ml7pcIiwgXCLoobBcIiwgXCLnl4VcIiwgXCLmrbtcIiwgXCLlopNcIiwgXCLnu51cIiwgXCLog45cIiwgXCLlhbtcIl07XG5cbiAgICAvLyDlkITlpKnlubLnmoTplb/nlJ/lnLDmlK/otbfngrlcbiAgICBjb25zdCBzdGFydFBvaW50czogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcbiAgICAgIFwi55SyXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLkuqVcIiksICAvLyDnlLLmnKjplb/nlJ/lnKjkuqVcbiAgICAgIFwi5LmZXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLljYhcIiksICAvLyDkuZnmnKjplb/nlJ/lnKjljYhcbiAgICAgIFwi5LiZXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLlr4VcIiksICAvLyDkuJnngavplb/nlJ/lnKjlr4VcbiAgICAgIFwi5LiBXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLphYlcIiksICAvLyDkuIHngavplb/nlJ/lnKjphYlcbiAgICAgIFwi5oiKXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLlr4VcIiksICAvLyDmiIrlnJ/plb/nlJ/lnKjlr4VcbiAgICAgIFwi5bexXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLphYlcIiksICAvLyDlt7HlnJ/plb/nlJ/lnKjphYlcbiAgICAgIFwi5bqaXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLlt7NcIiksICAvLyDluprph5Hplb/nlJ/lnKjlt7NcbiAgICAgIFwi6L6bXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLlrZBcIiksICAvLyDovpvph5Hplb/nlJ/lnKjlrZBcbiAgICAgIFwi5aOsXCI6IGJyYW5jaGVzLmluZGV4T2YoXCLnlLNcIiksICAvLyDlo6zmsLTplb/nlJ/lnKjnlLNcbiAgICAgIFwi55m4XCI6IGJyYW5jaGVzLmluZGV4T2YoXCLlja9cIikgICAvLyDnmbjmsLTplb/nlJ/lnKjlja9cbiAgICB9O1xuXG4gICAgLy8g6Zi06Ziz6aG66YCG5pa55ZCRXG4gICAgY29uc3QgZGlyZWN0aW9uczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcbiAgICAgIFwi55SyXCI6IDEsICAvLyDpmLPlubLpobrooYxcbiAgICAgIFwi5LmZXCI6IC0xLCAvLyDpmLTlubLpgIbooYxcbiAgICAgIFwi5LiZXCI6IDEsXG4gICAgICBcIuS4gVwiOiAtMSxcbiAgICAgIFwi5oiKXCI6IDEsXG4gICAgICBcIuW3sVwiOiAtMSxcbiAgICAgIFwi5bqaXCI6IDEsXG4gICAgICBcIui+m1wiOiAtMSxcbiAgICAgIFwi5aOsXCI6IDEsXG4gICAgICBcIueZuFwiOiAtMVxuICAgIH07XG5cbiAgICAvLyDojrflj5blnLDmlK/ntKLlvJVcbiAgICBjb25zdCBicmFuY2hJbmRleCA9IGJyYW5jaGVzLmluZGV4T2YoYnJhbmNoKTtcblxuICAgIGlmICghKGRheVN0ZW0gaW4gc3RhcnRQb2ludHMpIHx8IGJyYW5jaEluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIOiOt+WPlui1t+eCueWSjOaWueWQkVxuICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBzdGFydFBvaW50c1tkYXlTdGVtXTtcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBkaXJlY3Rpb25zW2RheVN0ZW1dO1xuXG4gICAgLy8g6K6h566X5Zyw5Yq/57Si5byVXG4gICAgbGV0IGRpU2hpSW5kZXggPSAoYnJhbmNoSW5kZXggLSBzdGFydFBvaW50ICsgMTIpICUgMTI7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gLTEpIHtcbiAgICAgIGRpU2hpSW5kZXggPSAoMTIgLSBkaVNoaUluZGV4KSAlIDEyO1xuICAgIH1cblxuICAgIC8vIOi/lOWbnuWcsOWKv+WQjeensFxuICAgIHJldHVybiBkaVNoaU5hbWVzW2RpU2hpSW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuelnueFnuivpue7huino+mHilxuICAgKiBAcGFyYW0gc2hlblNoYSDnpZ7nhZ7lkI3np7BcbiAgICovXG4gIHByaXZhdGUgc2hvd1NoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhOiBzdHJpbmcpIHtcbiAgICAvLyDojrflj5bnpZ7nhZ7or6bnu4bop6Pph4pcbiAgICBjb25zdCBleHBsYW5hdGlvbiA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhKTtcblxuICAgIC8vIOWIm+W7uuW8ueeql1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWwuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwnO1xuXG4gICAgLy8g5Yib5bu65by556qX5YaF5a65XG4gICAgY29uc3QgbW9kYWxDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWxDb250ZW50LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvbnRlbnQnO1xuXG4gICAgLy8g5Yib5bu65qCH6aKYXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gZXhwbGFuYXRpb24ubmFtZTtcbiAgICB0aXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10aXRsZSc7XG5cbiAgICAvLyDmoLnmja7npZ7nhZ7nsbvlnovorr7nva7kuI3lkIznmoTmoLflvI9cbiAgICBsZXQgdHlwZUNsYXNzID0gJ2JhemktbW9kYWwtdHlwZSc7XG4gICAgaWYgKGV4cGxhbmF0aW9uLnR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICB0eXBlQ2xhc3MgKz0gJyBiYXppLW1vZGFsLXR5cGUtZ29vZCc7XG4gICAgfSBlbHNlIGlmIChleHBsYW5hdGlvbi50eXBlID09PSAn5Ye256WeJykge1xuICAgICAgdHlwZUNsYXNzICs9ICcgYmF6aS1tb2RhbC10eXBlLWJhZCc7XG4gICAgfSBlbHNlIGlmIChleHBsYW5hdGlvbi50eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgdHlwZUNsYXNzICs9ICcgYmF6aS1tb2RhbC10eXBlLW1peGVkJztcbiAgICB9XG5cbiAgICAvLyDliJvlu7rnsbvlnotcbiAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IGDnsbvlnos6ICR7ZXhwbGFuYXRpb24udHlwZX1gO1xuICAgIHR5cGUuY2xhc3NOYW1lID0gdHlwZUNsYXNzO1xuXG4gICAgLy8g5Yib5bu66Kej6YeKXG4gICAgY29uc3QgZXhwbGFuYXRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZXhwbGFuYXRpb25UZXh0LnRleHRDb250ZW50ID0gZXhwbGFuYXRpb24uZXhwbGFuYXRpb247XG4gICAgZXhwbGFuYXRpb25UZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWV4cGxhbmF0aW9uJztcblxuICAgIC8vIOWIm+W7uuW9seWTjVxuICAgIGNvbnN0IGluZmx1ZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGluZmx1ZW5jZS50ZXh0Q29udGVudCA9IGV4cGxhbmF0aW9uLmluZmx1ZW5jZTtcbiAgICBpbmZsdWVuY2UuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtaW5mbHVlbmNlJztcblxuICAgIC8vIOafpeaJvuebuOWFs+eahOelnueFnue7hOWQiFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5TaGEgJiYgdGhpcy5iYXppSW5mby5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGNvbWJpbmF0aW9ucyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFDb21iaW5hdGlvbkFuYWx5c2lzKHRoaXMuYmF6aUluZm8uc2hlblNoYSk7XG4gICAgICAvLyDnp7vpmaTlj6/og73nmoTliY3nvIDvvIjlpoJcIuW5tOafsTpcIu+8iVxuICAgICAgY29uc3QgY2xlYW5TaGVuU2hhID0gc2hlblNoYS5pbmNsdWRlcygnOicpID8gc2hlblNoYS5zcGxpdCgnOicpWzFdIDogc2hlblNoYTtcbiAgICAgIC8vIOetm+mAieWMheWQq+W9k+WJjeelnueFnueahOe7hOWQiO+8jOW5tuaMiee6p+WIq+aOkuW6j1xuICAgICAgY29uc3QgcmVsZXZhbnRDb21iaW5hdGlvbnMgPSBjb21iaW5hdGlvbnMuZmlsdGVyKGNvbWJvID0+IGNvbWJvLmNvbWJpbmF0aW9uLmluY2x1ZGVzKGNsZWFuU2hlblNoYSkpO1xuXG4gICAgICBpZiAocmVsZXZhbnRDb21iaW5hdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyDliJvlu7rnu4TlkIjliIbmnpDmoIfpophcbiAgICAgICAgY29uc3QgY29tYmluYXRpb25zVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgICAgICBjb21iaW5hdGlvbnNUaXRsZS50ZXh0Q29udGVudCA9ICfnm7jlhbPnpZ7nhZ7nu4TlkIgnO1xuICAgICAgICBjb21iaW5hdGlvbnNUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zdWJ0aXRsZSc7XG4gICAgICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjb21iaW5hdGlvbnNUaXRsZSk7XG5cbiAgICAgICAgLy8g5oyJ57uE5ZCI57qn5Yir5o6S5bqP77yINOe6p+e7hOWQiOS8mOWFiOaYvuekuu+8jOeEtuWQjuaYrzPnuqfvvIzmnIDlkI7mmK8y57qn77yJXG4gICAgICAgIGNvbnN0IHNvcnRlZENvbWJpbmF0aW9ucyA9IFsuLi5yZWxldmFudENvbWJpbmF0aW9uc10uc29ydCgoYSwgYikgPT4gKGIubGV2ZWwgfHwgMikgLSAoYS5sZXZlbCB8fCAyKSk7XG5cbiAgICAgICAgLy8g5Yib5bu657uE5ZCI5YiG5p6Q5YiX6KGoXG4gICAgICAgIHNvcnRlZENvbWJpbmF0aW9ucy5mb3JFYWNoKGNvbWJvID0+IHtcbiAgICAgICAgICBjb25zdCBjb21ib0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgIGNvbWJvQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvbWJvLWNvbnRhaW5lcic7XG5cbiAgICAgICAgICAvLyDmoLnmja7nu4TlkIjnsbvlnovmt7vliqDkuI3lkIznmoTmoLflvI9cbiAgICAgICAgICBpZiAoY29tYm8udHlwZSA9PT0gJ2dvb2QnKSB7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjb21iby1nb29kJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21iby50eXBlID09PSAnYmFkJykge1xuICAgICAgICAgICAgY29tYm9Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnY29tYm8tYmFkJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21iby50eXBlID09PSAnbWl4ZWQnKSB7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdjb21iby1taXhlZCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGNvbWJvVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAgIC8vIOagueaNrue7hOWQiOe6p+WIq+a3u+WKoOS4jeWQjOeahOagh+etvlxuICAgICAgICAgIGxldCBsZXZlbFRleHQgPSAnJztcbiAgICAgICAgICBsZXQgbGV2ZWxDbGFzcyA9ICcnO1xuICAgICAgICAgIGlmIChjb21iby5sZXZlbCA9PT0gNCkge1xuICAgICAgICAgICAgbGV2ZWxUZXh0ID0gJ+OAkOWbm+elnueFnue7hOWQiOOAkSc7XG4gICAgICAgICAgICBsZXZlbENsYXNzID0gJ2JhemktY29tYmluYXRpb24tbGV2ZWwtNCc7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21iby5sZXZlbCA9PT0gMykge1xuICAgICAgICAgICAgbGV2ZWxUZXh0ID0gJ+OAkOS4ieelnueFnue7hOWQiOOAkSc7XG4gICAgICAgICAgICBsZXZlbENsYXNzID0gJ2JhemktY29tYmluYXRpb24tbGV2ZWwtMyc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldmVsVGV4dCA9ICfjgJDkuoznpZ7nhZ7nu4TlkIjjgJEnO1xuICAgICAgICAgICAgbGV2ZWxDbGFzcyA9ICdiYXppLWNvbWJpbmF0aW9uLWxldmVsLTInO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGxldmVsU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICBsZXZlbFNwYW4udGV4dENvbnRlbnQgPSBsZXZlbFRleHQ7XG4gICAgICAgICAgbGV2ZWxTcGFuLmNsYXNzTmFtZSA9IGxldmVsQ2xhc3M7XG5cbiAgICAgICAgICAvLyDmoLnmja7nu4TlkIjnsbvlnovmt7vliqDkuI3lkIznmoTmoIfnrb5cbiAgICAgICAgICBsZXQgdHlwZVRleHQgPSAnJztcbiAgICAgICAgICBsZXQgdHlwZUNsYXNzID0gJyc7XG4gICAgICAgICAgaWYgKGNvbWJvLnR5cGUgPT09ICdnb29kJykge1xuICAgICAgICAgICAgdHlwZVRleHQgPSAn5ZCJ56We57uE5ZCIJztcbiAgICAgICAgICAgIHR5cGVDbGFzcyA9ICdiYXppLWNvbWJvLXR5cGUgYmF6aS1jb21iby10eXBlLWdvb2QnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29tYm8udHlwZSA9PT0gJ2JhZCcpIHtcbiAgICAgICAgICAgIHR5cGVUZXh0ID0gJ+WHtuelnue7hOWQiCc7XG4gICAgICAgICAgICB0eXBlQ2xhc3MgPSAnYmF6aS1jb21iby10eXBlIGJhemktY29tYm8tdHlwZS1iYWQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29tYm8udHlwZSA9PT0gJ21peGVkJykge1xuICAgICAgICAgICAgdHlwZVRleHQgPSAn5ZCJ5Ye256We57uE5ZCIJztcbiAgICAgICAgICAgIHR5cGVDbGFzcyA9ICdiYXppLWNvbWJvLXR5cGUgYmF6aS1jb21iby10eXBlLW1peGVkJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0eXBlU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICB0eXBlU3Bhbi50ZXh0Q29udGVudCA9IHR5cGVUZXh0O1xuICAgICAgICAgIHR5cGVTcGFuLmNsYXNzTmFtZSA9IHR5cGVDbGFzcztcblxuICAgICAgICAgIGNvbWJvVGl0bGUudGV4dENvbnRlbnQgPSBjb21iby5jb21iaW5hdGlvbiArICcgJztcbiAgICAgICAgICBjb21ib1RpdGxlLmFwcGVuZENoaWxkKGxldmVsU3Bhbik7XG4gICAgICAgICAgY29tYm9UaXRsZS5hcHBlbmRDaGlsZCh0eXBlU3Bhbik7XG4gICAgICAgICAgY29tYm9UaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jb21iby10aXRsZSc7XG5cbiAgICAgICAgICBjb25zdCBjb21ib0FuYWx5c2lzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgY29tYm9BbmFseXNpcy50ZXh0Q29udGVudCA9IGNvbWJvLmFuYWx5c2lzO1xuICAgICAgICAgIGNvbWJvQW5hbHlzaXMuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29tYm8tYW5hbHlzaXMnO1xuXG4gICAgICAgICAgLy8g5re75Yqg57uE5ZCI5p2l5rqQXG4gICAgICAgICAgaWYgKGNvbWJvLnNvdXJjZSkge1xuICAgICAgICAgICAgY29uc3QgY29tYm9Tb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbWJvU291cmNlLnRleHRDb250ZW50ID0gJ+OAkOe7hOWQiOadpea6kOOAkScgKyBjb21iby5zb3VyY2U7XG4gICAgICAgICAgICBjb21ib1NvdXJjZS5jbGFzc05hbWUgPSAnYmF6aS1jb21iby1zb3VyY2UnO1xuICAgICAgICAgICAgY29tYm9Db250YWluZXIuYXBwZW5kQ2hpbGQoY29tYm9UaXRsZSk7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib0FuYWx5c2lzKTtcbiAgICAgICAgICAgIGNvbWJvQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbWJvU291cmNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tYm9Db250YWluZXIuYXBwZW5kQ2hpbGQoY29tYm9UaXRsZSk7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib0FuYWx5c2lzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmt7vliqDnu4TlkIjlvbHlk41cbiAgICAgICAgICBpZiAoY29tYm8uaW5mbHVlbmNlKSB7XG4gICAgICAgICAgICBjb25zdCBjb21ib0luZmx1ZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgY29tYm9JbmZsdWVuY2UudGV4dENvbnRlbnQgPSAn44CQ57uE5ZCI5b2x5ZON44CRJyArIGNvbWJvLmluZmx1ZW5jZTtcbiAgICAgICAgICAgIGNvbWJvSW5mbHVlbmNlLmNsYXNzTmFtZSA9ICdiYXppLWNvbWJvLWluZmx1ZW5jZSc7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib0luZmx1ZW5jZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5re75Yqg5bqU5a+55pa55rOVXG4gICAgICAgICAgaWYgKGNvbWJvLnNvbHV0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBjb21ib1NvbHV0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBjb21ib1NvbHV0aW9uLnRleHRDb250ZW50ID0gJ+OAkOW6lOWvueaWueazleOAkScgKyBjb21iby5zb2x1dGlvbjtcbiAgICAgICAgICAgIGNvbWJvU29sdXRpb24uY2xhc3NOYW1lID0gJ2JhemktY29tYm8tc29sdXRpb24nO1xuICAgICAgICAgICAgY29tYm9Db250YWluZXIuYXBwZW5kQ2hpbGQoY29tYm9Tb2x1dGlvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNvbWJvQ29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5YaF5a655Yiw5by556qXXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZSk7XG5cbiAgICAvLyDmt7vliqDorqHnrpfmlrnms5XvvIjlpoLmnpzmnInvvIlcbiAgICBpZiAoZXhwbGFuYXRpb24uY2FsY3VsYXRpb24pIHtcbiAgICAgIGNvbnN0IGNhbGN1bGF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjYWxjdWxhdGlvbi5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHJvbmc+44CQ6K6h566X5pa55rOV44CRPC9zdHJvbmc+XG4gICAgICAgIDxwcmUgc3R5bGU9XCJ1c2VyLXNlbGVjdDogdGV4dDtcIj4ke2V4cGxhbmF0aW9uLmNhbGN1bGF0aW9ufTwvcHJlPlxuICAgICAgYDtcbiAgICAgIGNhbGN1bGF0aW9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNhbGN1bGF0aW9uJztcbiAgICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbik7XG4gICAgfVxuXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WIsOmhtemdolxuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuelnueFnue7hOWQiOWIhuaekFxuICAgKiBAcGFyYW0gY29tYmluYXRpb24g56We54We57uE5ZCIXG4gICAqL1xuICBwcml2YXRlIHNob3dTaGVuU2hhQ29tYmluYXRpb25BbmFseXNpcyhjb21iaW5hdGlvbjogeyBjb21iaW5hdGlvbjogc3RyaW5nOyBhbmFseXNpczogc3RyaW5nIH0pIHtcbiAgICAvLyDliJvlu7rlvLnnqpdcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsJztcblxuICAgIC8vIOWIm+W7uuW8ueeql+WGheWuuVxuICAgIGNvbnN0IG1vZGFsQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsQ29udGVudC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jb250ZW50JztcblxuICAgIC8vIOWIm+W7uuagh+mimFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9ICfnpZ7nhZ7nu4TlkIjliIbmnpAnO1xuICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXRpdGxlJztcblxuICAgIC8vIOWIm+W7uue7hOWQiOWQjeensFxuICAgIGNvbnN0IGNvbWJpbmF0aW9uTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbWJpbmF0aW9uTmFtZS50ZXh0Q29udGVudCA9IGNvbWJpbmF0aW9uLmNvbWJpbmF0aW9uO1xuICAgIGNvbWJpbmF0aW9uTmFtZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zdWJ0aXRsZSc7XG5cbiAgICAvLyDojrflj5bnu4TlkIjkuK3nmoTnpZ7nhZ5cbiAgICBjb25zdCBzaGVuU2hhTmFtZXMgPSBjb21iaW5hdGlvbi5jb21iaW5hdGlvbi5zcGxpdCgnICsgJyk7XG5cbiAgICAvLyDliJvlu7rnpZ7nhZ7nsbvlnovmoIfnrb7lrrnlmahcbiAgICBjb25zdCB0eXBlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZUNvbnRhaW5lci5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10eXBlLWNvbnRhaW5lcic7XG5cbiAgICAvLyDkuLrmr4/kuKrnpZ7nhZ7liJvlu7rnsbvlnovmoIfnrb5cbiAgICBzaGVuU2hhTmFtZXMuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8obmFtZSk7XG4gICAgICBpZiAoc2hlblNoYUluZm8pIHtcbiAgICAgICAgY29uc3QgdHlwZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICAgICAgICAvLyDmoLnmja7npZ7nhZ7nsbvlnovorr7nva7kuI3lkIznmoTmoLflvI9cbiAgICAgICAgbGV0IHR5cGVDbGFzcyA9ICdiYXppLW1vZGFsLXR5cGUnO1xuICAgICAgICBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICB0eXBlQ2xhc3MgKz0gJyBiYXppLW1vZGFsLXR5cGUtZ29vZCc7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICB0eXBlQ2xhc3MgKz0gJyBiYXppLW1vZGFsLXR5cGUtYmFkJztcbiAgICAgICAgfSBlbHNlIGlmIChzaGVuU2hhSW5mby50eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgIHR5cGVDbGFzcyArPSAnIGJhemktbW9kYWwtdHlwZS1taXhlZCc7XG4gICAgICAgIH1cblxuICAgICAgICB0eXBlVGFnLmNsYXNzTmFtZSA9IHR5cGVDbGFzcztcbiAgICAgICAgdHlwZVRhZy50ZXh0Q29udGVudCA9IGAke25hbWV9KCR7c2hlblNoYUluZm8udHlwZX0pYDtcbiAgICAgICAgdHlwZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0eXBlVGFnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOWIm+W7uuWIhuaekFxuICAgIGNvbnN0IGFuYWx5c2lzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYW5hbHlzaXMudGV4dENvbnRlbnQgPSBjb21iaW5hdGlvbi5hbmFseXNpcztcbiAgICBhbmFseXNpcy5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1hbmFseXNpcyc7XG5cbiAgICAvLyDliJvlu7rlhbPpl63mjInpkq5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ+WFs+mXrSc7XG4gICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2xvc2UnO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG5cbiAgICAvLyDmt7vliqDlhoXlrrnliLDlvLnnqpdcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjb21iaW5hdGlvbk5hbWUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh0eXBlQ29udGFpbmVyKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoYW5hbHlzaXMpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDmt7vliqDlvLnnqpfliLDpobXpnaJcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuXG4gICAgLy8g54K55Ye75by556qX5aSW6YOo5YWz6Zet5by556qXXG4gICAgbW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0ID09PSBtb2RhbCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZFllYXJNb250aFNoZW5TaGFSb3cg5pa55rOV5bey5Yig6Zmk77yM6YC76L6R55u05o6l5YaF6IGU5YiwIGNyZWF0ZUJhemlUYWJsZSDmlrnms5XkuK1cblxuICAvLyBjcmVhdGVTaGVuU2hhQ2VsbCDmlrnms5Xlt7LliKDpmaTvvIzpgLvovpHnm7TmjqXlhoXogZTliLAgYWRkWWVhck1vbnRoU2hlblNoYVJvdyDmlrnms5XkuK1cblxuICAvKipcbiAgICog5re75Yqg56We54We5L+h5oGvXG4gICAqIEBwYXJhbSBpbmZvTGlzdCDkv6Hmga/liJfooajlhYPntKBcbiAgICovXG4gIHByaXZhdGUgYWRkU2hlblNoYUluZm8oX2luZm9MaXN0OiBIVE1MRWxlbWVudCkge1xuICAgIC8vIOS4jeWGjeWcqOeJueauiuS/oeaBr+WMuuWfn+aYvuekuuelnueFnuS/oeaBr++8jOWboOS4uuW3sue7j+WcqOWRveebmOihqOagvOS4reaYvuekuuS6hlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkupTooYzlr7nlupTnmoRDU1PnsbvlkI1cbiAgICogQHBhcmFtIHd1WGluZyDkupTooYzlkI3np7BcbiAgICogQHJldHVybnMgQ1NT57G75ZCNXG4gICAqL1xuICBwcml2YXRlIGdldFd1WGluZ0NsYXNzRnJvbU5hbWUod3VYaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAod3VYaW5nKSB7XG4gICAgICBjYXNlICfph5EnOiByZXR1cm4gJ2ppbic7XG4gICAgICBjYXNlICfmnKgnOiByZXR1cm4gJ211JztcbiAgICAgIGNhc2UgJ+awtCc6IHJldHVybiAnc2h1aSc7XG4gICAgICBjYXNlICfngasnOiByZXR1cm4gJ2h1byc7XG4gICAgICBjYXNlICflnJ8nOiByZXR1cm4gJ3R1JztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAndHUnOyAvLyDpu5jorqTkuLrlnJ9cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5pi+56S65LqU6KGM5by65bqm6K+m57uG6Kej6YeKXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEBwYXJhbSB2YWx1ZSDkupTooYzlvLrluqblgLxcbiAgICovXG4gIHByaXZhdGUgc2hvd1d1WGluZ0V4cGxhbmF0aW9uKHd1WGluZzogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8g6I635Y+W5LqU6KGM6K+m57uG5L+h5oGvXG4gICAgY29uc3Qgd3VYaW5nSW5mbyA9IFd1WGluZ1NlcnZpY2UuZ2V0V3VYaW5nSW5mbyh3dVhpbmcpO1xuICAgIGlmICghd3VYaW5nSW5mbykgcmV0dXJuO1xuXG4gICAgLy8g5Yib5bu65by556qXXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbCc7XG5cbiAgICAvLyDliJvlu7rlvLnnqpflhoXlrrlcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29udGVudCc7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBgJHt3dVhpbmd95LqU6KGM5by65bqm6K+m6KejYDtcbiAgICB0aXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10aXRsZSc7XG5cbiAgICAvLyDliJvlu7rnsbvlnotcbiAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IGDlvLrluqblgLw6ICR7dmFsdWV9YDtcbiAgICB0eXBlLmNsYXNzTmFtZSA9IGBiYXppLW1vZGFsLXR5cGUgYmF6aS1tb2RhbC10eXBlLSR7dGhpcy5nZXRXdVhpbmdDbGFzc0Zyb21OYW1lKHd1WGluZyl9YDtcblxuICAgIC8vIOWIm+W7uuino+mHilxuICAgIGNvbnN0IGV4cGxhbmF0aW9uVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGV4cGxhbmF0aW9uVGV4dC50ZXh0Q29udGVudCA9IHd1WGluZ0luZm8uZXhwbGFuYXRpb247XG4gICAgZXhwbGFuYXRpb25UZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWV4cGxhbmF0aW9uJztcblxuICAgIC8vIOWIm+W7uuW9seWTjVxuICAgIGNvbnN0IGluZmx1ZW5jZVRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbmZsdWVuY2VUZXh0LnRleHRDb250ZW50ID0gd3VYaW5nSW5mby5pbmZsdWVuY2U7XG4gICAgaW5mbHVlbmNlVGV4dC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1pbmZsdWVuY2UnO1xuXG4gICAgLy8g5Yib5bu66K6h566X5pa55rOVXG4gICAgY29uc3QgY2FsY3VsYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjYWxjdWxhdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jYWxjdWxhdGlvbic7XG5cbiAgICAvLyDojrflj5blrp7pmYXorqHnrpfov4fnqItcbiAgICBsZXQgYWN0dWFsQ2FsY3VsYXRpb24gPSB0aGlzLmdldEFjdHVhbFd1WGluZ0NhbGN1bGF0aW9uKHd1WGluZyk7XG4gICAgaWYgKCFhY3R1YWxDYWxjdWxhdGlvbikge1xuICAgICAgYWN0dWFsQ2FsY3VsYXRpb24gPSB3dVhpbmdJbmZvLmNhbGN1bGF0aW9uO1xuICAgIH1cblxuICAgIGNhbGN1bGF0aW9uLmlubmVySFRNTCA9IGBcbiAgICAgIDxzdHJvbmc+44CQ6K6h566X5pa55rOV44CRPC9zdHJvbmc+XG4gICAgICA8cHJlIHN0eWxlPVwidXNlci1zZWxlY3Q6IHRleHQ7XCI+JHthY3R1YWxDYWxjdWxhdGlvbn08L3ByZT5cbiAgICBgO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5YaF5a655Yiw5by556qXXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZVRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WIsOmhtemdolxuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWunumZheeahOS6lOihjOW8uuW6puiuoeeul+i/h+eoi1xuICAgKiBAcGFyYW0gd3VYaW5nIOS6lOihjOWQjeensFxuICAgKiBAcmV0dXJucyDlrp7pmYXorqHnrpfov4fnqItcbiAgICovXG4gIHByaXZhdGUgZ2V0QWN0dWFsV3VYaW5nQ2FsY3VsYXRpb24od3VYaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5iYXppSW5mbyB8fCAhdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIOajgOafpeaYr+WQpuacieivpue7huS/oeaBr1xuICAgIGlmICghKCdkZXRhaWxzJyBpbiB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoKSkge1xuICAgICAgLy8g5aaC5p6c5rKh5pyJ6K+m57uG5L+h5oGv77yM5L2/55So5pen55qE6K6h566X5pa55rOVXG4gICAgICByZXR1cm4gdGhpcy5nZXRPbGRXdVhpbmdDYWxjdWxhdGlvbih3dVhpbmcpO1xuICAgIH1cblxuICAgIC8vIOiOt+WPluS6lOihjOW8uuW6puivpuaDhVxuICAgIGNvbnN0IGRldGFpbHMgPSAodGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCBhcyBhbnkpLmRldGFpbHM7XG5cbiAgICAvLyDojrflj5bnibnlrprkupTooYznmoTor6bmg4VcbiAgICBsZXQgd3VYaW5nRGV0YWlsczogeyB0aWFuR2FuOiBudW1iZXI7IGRpWmhpQ2FuZzogbnVtYmVyOyBuYVlpbjogbnVtYmVyOyBzZWFzb246IG51bWJlcjsgY29tYmluYXRpb246IG51bWJlcjsgdG90YWw6IG51bWJlciB9O1xuICAgIHN3aXRjaCAod3VYaW5nKSB7XG4gICAgICBjYXNlICfph5EnOiB3dVhpbmdEZXRhaWxzID0gZGV0YWlscy5qaW47IGJyZWFrO1xuICAgICAgY2FzZSAn5pyoJzogd3VYaW5nRGV0YWlscyA9IGRldGFpbHMubXU7IGJyZWFrO1xuICAgICAgY2FzZSAn5rC0Jzogd3VYaW5nRGV0YWlscyA9IGRldGFpbHMuc2h1aTsgYnJlYWs7XG4gICAgICBjYXNlICfngasnOiB3dVhpbmdEZXRhaWxzID0gZGV0YWlscy5odW87IGJyZWFrO1xuICAgICAgY2FzZSAn5ZyfJzogd3VYaW5nRGV0YWlscyA9IGRldGFpbHMudHU7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+aAu+WIhlxuICAgIGNvbnN0IHd1WGluZ1N0cmVuZ3RoID0gdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCBhcyBhbnk7XG4gICAgY29uc3QgdG90YWwgPSB3dVhpbmdTdHJlbmd0aC5qaW4gK1xuICAgICAgICAgICAgICAgICAgd3VYaW5nU3RyZW5ndGgubXUgK1xuICAgICAgICAgICAgICAgICAgd3VYaW5nU3RyZW5ndGguc2h1aSArXG4gICAgICAgICAgICAgICAgICB3dVhpbmdTdHJlbmd0aC5odW8gK1xuICAgICAgICAgICAgICAgICAgd3VYaW5nU3RyZW5ndGgudHU7XG5cbiAgICAvLyDmnoTlu7rorqHnrpfov4fnqItcbiAgICBsZXQgY2FsY3VsYXRpb24gPSBgJHt3dVhpbmd95LqU6KGM5by65bqm5a6e6ZmF6K6h566X6L+H56iL77yaXFxuXFxuYDtcblxuICAgIC8vIOWkqeW5suS6lOihjFxuICAgIGNhbGN1bGF0aW9uICs9IGDjgJDlpKnlubLkupTooYzjgJFcXG5gO1xuICAgIGlmICh3dVhpbmdEZXRhaWxzLnRpYW5HYW4gPiAwKSB7XG4gICAgICAvLyDojrflj5blhavlrZfkv6Hmga9cbiAgICAgIGNvbnN0IHsgeWVhclN0ZW0sIG1vbnRoU3RlbSwgZGF5U3RlbSwgaG91clN0ZW0gfSA9IHRoaXMuYmF6aUluZm87XG5cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKHllYXJTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOW5siR7eWVhclN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMS4wXFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKG1vbnRoU3RlbSkgPT09IHd1WGluZykge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDmnIjlubIke21vbnRoU3RlbX3kuLoke3d1WGluZ33vvIzlvpfliIYyLjBcXG5gO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0oZGF5U3RlbSkgPT09IHd1WGluZykge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XlubIke2RheVN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMy4wXFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGhvdXJTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuW5siR7aG91clN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMS4wXFxuYDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlnLDmlK/ol4/lubJcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ5Zyw5pSv6JeP5bmy44CRXFxuYDtcbiAgICBpZiAod3VYaW5nRGV0YWlscy5kaVpoaUNhbmcgPiAwKSB7XG4gICAgICAvLyDojrflj5blhavlrZfkv6Hmga9cbiAgICAgIGNvbnN0IHsgeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICAgIGNvbnN0IHsgeWVhckhpZGVHYW4sIG1vbnRoSGlkZUdhbiwgZGF5SGlkZUdhbiwgaG91ckhpZGVHYW4gfSA9IHRoaXMuYmF6aUluZm87XG5cbiAgICAgIGlmICh5ZWFySGlkZUdhbikge1xuICAgICAgICBjb25zdCB5ZWFySGlkZUdhbkFycmF5ID0gQXJyYXkuaXNBcnJheSh5ZWFySGlkZUdhbikgPyB5ZWFySGlkZUdhbiA6IHllYXJIaWRlR2FuLnNwbGl0KCcnKTtcbiAgICAgICAgZm9yIChjb25zdCBnYW4gb2YgeWVhckhpZGVHYW5BcnJheSkge1xuICAgICAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGdhbikgPT09IHd1WGluZykge1xuICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5bm05pSvJHt5ZWFyQnJhbmNofeiXjyR7Z2FufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuN1xcbmA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobW9udGhIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IG1vbnRoSGlkZUdhbkFycmF5ID0gQXJyYXkuaXNBcnJheShtb250aEhpZGVHYW4pID8gbW9udGhIaWRlR2FuIDogbW9udGhIaWRlR2FuLnNwbGl0KCcnKTtcbiAgICAgICAgZm9yIChjb25zdCBnYW4gb2YgbW9udGhIaWRlR2FuQXJyYXkpIHtcbiAgICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaciOaUryR7bW9udGhCcmFuY2h96JePJHtnYW595Li6JHt3dVhpbmd977yM5b6X5YiGMS41XFxuYDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkYXlIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGRheUhpZGVHYW5BcnJheSA9IEFycmF5LmlzQXJyYXkoZGF5SGlkZUdhbikgPyBkYXlIaWRlR2FuIDogZGF5SGlkZUdhbi5zcGxpdCgnJyk7XG4gICAgICAgIGZvciAoY29uc3QgZ2FuIG9mIGRheUhpZGVHYW5BcnJheSkge1xuICAgICAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGdhbikgPT09IHd1WGluZykge1xuICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5pSvJHtkYXlCcmFuY2h96JePJHtnYW595Li6JHt3dVhpbmd977yM5b6X5YiGMi4wXFxuYDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChob3VySGlkZUdhbikge1xuICAgICAgICBjb25zdCBob3VySGlkZUdhbkFycmF5ID0gQXJyYXkuaXNBcnJheShob3VySGlkZUdhbikgPyBob3VySGlkZUdhbiA6IGhvdXJIaWRlR2FuLnNwbGl0KCcnKTtcbiAgICAgICAgZm9yIChjb25zdCBnYW4gb2YgaG91ckhpZGVHYW5BcnJheSkge1xuICAgICAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGdhbikgPT09IHd1WGluZykge1xuICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pe25pSvJHtob3VyQnJhbmNofeiXjyR7Z2FufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuN1xcbmA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g57qz6Z+z5LqU6KGMXG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOe6s+mfs+S6lOihjOOAkVxcbmA7XG4gICAgaWYgKHd1WGluZ0RldGFpbHMubmFZaW4gPiAwKSB7XG4gICAgICAvLyDojrflj5blhavlrZfkv6Hmga9cbiAgICAgIGNvbnN0IHsgeWVhck5hWWluLCBtb250aE5hWWluLCBkYXlOYVlpbiwgaG91ck5hWWluIH0gPSB0aGlzLmJhemlJbmZvO1xuXG4gICAgICBpZiAoeWVhck5hWWluICYmIHllYXJOYVlpbi5pbmNsdWRlcyh3dVhpbmcpKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOafsee6s+mfsyR7eWVhck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuNVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAobW9udGhOYVlpbiAmJiBtb250aE5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pyI5p+x57qz6Z+zJHttb250aE5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjEuMFxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoZGF5TmFZaW4gJiYgZGF5TmFZaW4uaW5jbHVkZXMod3VYaW5nKSkge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6Xmn7HnurPpn7Mke2RheU5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjEuNVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoaG91ck5hWWluICYmIGhvdXJOYVlpbi5pbmNsdWRlcyh3dVhpbmcpKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuafsee6s+mfsyR7aG91ck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuNVxcbmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5a2j6IqC6LCD5pW0XG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOWto+iKguiwg+aVtOOAkVxcbmA7XG4gICAgY29uc3QgeyBtb250aEJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCBzZWFzb24gPSB0aGlzLmdldFNlYXNvbihtb250aEJyYW5jaCk7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5b2T5YmN5a2j6IqC77yaJHtzZWFzb259XFxuYDtcblxuICAgIGlmICh3dVhpbmdEZXRhaWxzLnNlYXNvbiAhPT0gMCkge1xuICAgICAgc3dpdGNoIChzZWFzb24pIHtcbiAgICAgICAgY2FzZSAn5pil5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j5pyo5pe677yM5b6X5YiGKzIuMFxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+eBq+ebuO+8jOW+l+WIhisxLjBcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPph5Hlm5rvvIzlvpfliIYtMS4wXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j5rC05q2777yM5b6X5YiGLTEuNVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+Wkj+Wtoyc6XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+eBq+aXuu+8jOW+l+WIhisyLjBcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPlnJ/nm7jvvIzlvpfliIYrMS4wXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j5rC05Zua77yM5b6X5YiGLTEuMFxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+acqOatu++8jOW+l+WIhi0xLjVcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICfnp4vlraMnOlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPph5Hml7rvvIzlvpfliIYrMi4wXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5rC055u477yM5b6X5YiGKzEuMFxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+eBq+Wbmu+8jOW+l+WIhi0xLjBcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPlnJ/mrbvvvIzlvpfliIYtMS41XFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn5Yas5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5rC05pe677yM5b6X5YiGKzIuMFxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+acqOebuO+8jOW+l+WIhisxLjBcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPlnJ/lm5rvvIzlvpfliIYtMS4wXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn6YeRJykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j6YeR5q2777yM5b6X5YiGLTEuNVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pyI5Luk5b2T5Luk5Yqg5oiQXG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOaciOS7pOW9k+S7pOWKoOaIkOOAkVxcbmA7XG4gICAgaWYgKCh3dVhpbmdEZXRhaWxzIGFzIGFueSkubW9udGhEb21pbmFudCA+IDApIHtcbiAgICAgIHN3aXRjaCAoc2Vhc29uKSB7XG4gICAgICAgIGNhc2UgJ+aYpeWtoyc6XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+acqOW9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfngasnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPngavnm7jml7rvvIzlvpfliIYrMC44XFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn5aSP5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn54GrJykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j54Gr5b2T5Luk77yM5b6X5YiGKzEuNVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+WcnycpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+Wcn+ebuOaXuu+8jOW+l+WIhiswLjhcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICfnp4vlraMnOlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPph5HlvZPku6TvvIzlvpfliIYrMS41XFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5rC055u45pe677yM5b6X5YiGKzAuOFxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+WGrOWtoyc6XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+awtOW9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmnKgnKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPmnKjnm7jml7rvvIzlvpfliIYrMC44XFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDnu4TlkIjosIPmlbRcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ57uE5ZCI6LCD5pW044CRXFxuYDtcbiAgICBpZiAod3VYaW5nRGV0YWlscy5jb21iaW5hdGlvbiA+IDApIHtcbiAgICAgIC8vIOWkqeW5suS6lOWQiFxuICAgICAgY29uc3QgdGlhbkdhbld1SGUgPSB0aGlzLmNoZWNrVGlhbkdhbld1SGUoKTtcbiAgICAgIGlmICh0aWFuR2FuV3VIZSkge1xuICAgICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVd1SGUodGlhbkdhbld1SGUpO1xuICAgICAgICBpZiAoaGVXdVhpbmcgPT09IHd1WGluZykge1xuICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWkqeW5suS6lOWQiO+8miR7dGlhbkdhbld1SGV95ZCI5YyWJHt3dVhpbmd977yM5b6X5YiGKzAuNVxcbmA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8g5Zyw5pSv5LiJ5ZCIXG4gICAgICBjb25zdCBkaVpoaVNhbkhlID0gdGhpcy5jaGVja0RpWmhpU2FuSGUoKTtcbiAgICAgIGlmIChkaVpoaVNhbkhlKSB7XG4gICAgICAgIGNvbnN0IGhlV3VYaW5nID0gdGhpcy5nZXRXdVhpbmdGcm9tU2FuSGUoZGlaaGlTYW5IZSk7XG4gICAgICAgIGlmIChoZVd1WGluZyA9PT0gd3VYaW5nKSB7XG4gICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5Zyw5pSv5LiJ5ZCI77yaJHtkaVpoaVNhbkhlfeS4ieWQiCR7d3VYaW5nfeWxgO+8jOW+l+WIhisxLjBcXG5gO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIOWcsOaUr+S4ieS8mlxuICAgICAgY29uc3QgZGlaaGlTYW5IdWkgPSB0aGlzLmNoZWNrRGlaaGlTYW5IdWkoKTtcbiAgICAgIGlmIChkaVpoaVNhbkh1aSkge1xuICAgICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVNhbkh1aShkaVpoaVNhbkh1aSk7XG4gICAgICAgIGlmIChoZVd1WGluZyA9PT0gd3VYaW5nKSB7XG4gICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5Zyw5pSv5LiJ5Lya77yaJHtkaVpoaVNhbkh1aX3kuInkvJoke3d1WGluZ33lsYDvvIzlvpfliIYrMC44XFxuYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaAu+e7k1xuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDmgLvliIborqHnrpfjgJFcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtICR7d3VYaW5nfeS6lOihjOaAu+W+l+WIhu+8miR7d3VYaW5nRGV0YWlscy50b3RhbC50b0ZpeGVkKDIpfVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5omA5pyJ5LqU6KGM5oC75b6X5YiG77yaJHt0b3RhbC50b0ZpeGVkKDIpfVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0gJHt3dVhpbmd95LqU6KGM55u45a+55by65bqm77yaJHt3dVhpbmdEZXRhaWxzLnRvdGFsLnRvRml4ZWQoMil9IC8gJHt0b3RhbC50b0ZpeGVkKDIpfSAqIDEwID0gJHsod3VYaW5nRGV0YWlscy50b3RhbCAvIHRvdGFsICogMTApLnRvRml4ZWQoMil9XFxuYDtcblxuICAgIHJldHVybiBjYWxjdWxhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiDmmL7npLrml6XkuLvml7roobDor6bnu4bop6Pph4pcbiAgICogQHBhcmFtIHJpWmh1IOaXpeS4u+aXuuihsOeKtuaAgVxuICAgKiBAcGFyYW0gd3VYaW5nIOaXpeS4u+S6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzaG93UmlaaHVFeHBsYW5hdGlvbihyaVpodTogc3RyaW5nLCB3dVhpbmc6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKCdzaG93UmlaaHVFeHBsYW5hdGlvbiDooqvosIPnlKgnLCByaVpodSwgd3VYaW5nKTtcblxuICAgIC8vIOiOt+WPluaXpeS4u+aXuuihsOivpue7huS/oeaBr1xuICAgIGNvbnN0IHJpWmh1SW5mbyA9IHtcbiAgICAgIGV4cGxhbmF0aW9uOiB0aGlzLmdldFJpWmh1RGVzY3JpcHRpb24ocmlaaHUpLFxuICAgICAgaW5mbHVlbmNlOiB0aGlzLmdldFJpWmh1SW5mbHVlbmNlKHJpWmh1KSxcbiAgICAgIGNhbGN1bGF0aW9uOiAnJ1xuICAgIH07XG4gICAgY29uc29sZS5sb2coJ3JpWmh1SW5mbzonLCByaVpodUluZm8pO1xuXG4gICAgLy8g5Yib5bu65by556qXXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbCc7XG5cbiAgICAvLyDliJvlu7rlvLnnqpflhoXlrrlcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29udGVudCc7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBg5pel5Li75pe66KGw6K+m6Kej77yaJHtyaVpodX1gO1xuICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXRpdGxlJztcblxuICAgIC8vIOWIm+W7uuexu+Wei1xuICAgIGNvbnN0IHR5cGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0eXBlLnRleHRDb250ZW50ID0gYOaXpeS4u+S6lOihjDogJHt3dVhpbmcuY2hhckF0KDApfWA7ICAvLyDlj6rlj5bnrKzkuIDkuKrlrZfnrKbvvIzpgb/lhY3mmL7npLpcIueBq+eBq1wiXG4gICAgdHlwZS5jbGFzc05hbWUgPSBgYmF6aS1tb2RhbC10eXBlIGJhemktbW9kYWwtdHlwZS0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3NGcm9tTmFtZSh3dVhpbmcpfWA7XG5cbiAgICAvLyDliJvlu7rop6Pph4pcbiAgICBjb25zdCBleHBsYW5hdGlvblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBleHBsYW5hdGlvblRleHQudGV4dENvbnRlbnQgPSByaVpodUluZm8uZXhwbGFuYXRpb247XG4gICAgZXhwbGFuYXRpb25UZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWV4cGxhbmF0aW9uJztcblxuICAgIC8vIOWIm+W7uuW9seWTjVxuICAgIGNvbnN0IGluZmx1ZW5jZVRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbmZsdWVuY2VUZXh0LnRleHRDb250ZW50ID0gcmlaaHVJbmZvLmluZmx1ZW5jZTtcbiAgICBpbmZsdWVuY2VUZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWluZmx1ZW5jZSc7XG5cbiAgICAvLyDliJvlu7rorqHnrpfmlrnms5VcbiAgICBjb25zdCBjYWxjdWxhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhbGN1bGF0aW9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNhbGN1bGF0aW9uJztcblxuICAgIC8vIOiOt+WPluWunumZheiuoeeul+i/h+eoi1xuICAgIGxldCBhY3R1YWxDYWxjdWxhdGlvbiA9IHRoaXMuZ2V0QWN0dWFsUmlaaHVDYWxjdWxhdGlvbihyaVpodSwgd3VYaW5nKTtcbiAgICBpZiAoIWFjdHVhbENhbGN1bGF0aW9uKSB7XG4gICAgICBhY3R1YWxDYWxjdWxhdGlvbiA9IHJpWmh1SW5mby5jYWxjdWxhdGlvbjtcbiAgICB9XG5cbiAgICAvLyDkuI3pnIDopoHkv67lpI3orqHnrpfnu5PmnpzvvIzlm6DkuLrmiJHku6zlt7Lnu4/kvb/nlKjkuobmlrDnmoTorqHnrpfmlrnms5VcblxuICAgIGNhbGN1bGF0aW9uLmlubmVySFRNTCA9IGBcbiAgICAgIDxzdHJvbmc+44CQ6K6h566X5pa55rOV44CRPC9zdHJvbmc+XG4gICAgICA8cHJlIHN0eWxlPVwidXNlci1zZWxlY3Q6IHRleHQ7XCI+JHthY3R1YWxDYWxjdWxhdGlvbn08L3ByZT5cbiAgICBgO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5YaF5a655Yiw5by556qXXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZVRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WIsOmhtemdolxuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG4gICAgY29uc29sZS5sb2coJ+W8ueeql+WIm+W7uuWujOaIkO+8jOWHhuWkh+a3u+WKoOWIsOmhtemdoicpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuICAgIGNvbnNvbGUubG9nKCflvLnnqpflt7Lmt7vliqDliLDpobXpnaInKTtcblxuICAgIC8vIOeCueWHu+W8ueeql+WklumDqOWFs+mXreW8ueeql1xuICAgIG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gbW9kYWwpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5a6e6ZmF55qE5pel5Li75pe66KGw6K6h566X6L+H56iLXG4gICAqIEBwYXJhbSByaVpodSDml6XkuLvml7roobDnirbmgIFcbiAgICogQHBhcmFtIHd1WGluZyDml6XkuLvkupTooYxcbiAgICogQHJldHVybnMg5a6e6ZmF6K6h566X6L+H56iLXG4gICAqL1xuICBwcml2YXRlIGdldEFjdHVhbFJpWmh1Q2FsY3VsYXRpb24ocmlaaHU6IHN0cmluZywgd3VYaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5iYXppSW5mbyB8fCAhdGhpcy5iYXppSW5mby5yaVpodVN0cmVuZ3RoRGV0YWlscykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGRldGFpbHMgPSB0aGlzLmJhemlJbmZvLnJpWmh1U3RyZW5ndGhEZXRhaWxzO1xuXG4gICAgLy8g5p6E5bu66K6h566X6L+H56iLXG4gICAgbGV0IGNhbGN1bGF0aW9uID0gYOaXpeS4u+aXuuihsOWunumZheiuoeeul+i/h+eoi++8mlxcblxcbmA7XG5cbiAgICAvLyDln7rnoYDkv6Hmga9cbiAgICBjYWxjdWxhdGlvbiArPSBg44CQ5Z+656GA5L+h5oGv44CRXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XkuLvkupTooYzvvJoke3d1WGluZy5jaGFyQXQoMCl9XFxuYDsgIC8vIOWPquWPluesrOS4gOS4quWtl+espu+8jOmBv+WFjeaYvuekulwi54Gr54GrXCJcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDmiYDlpITlraPoioLvvJoke2RldGFpbHMuc2Vhc29uIHx8ICfmnKrnn6UnfVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5Li75LqU6KGM5Z+656GA5YiG5YC877yaMTAuMDBcXG5cXG5gO1xuXG4gICAgLy8g5a2j6IqC5b2x5ZONXG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOWto+iKguW9seWTjeOAkVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0gJHtkZXRhaWxzLnNlYXNvbkVmZmVjdCB8fCAn5peg5a2j6IqC5b2x5ZONJ31cXG5cXG5gO1xuXG4gICAgLy8g5aSp5bmy5YWz57O7XG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOWkqeW5suWFs+ezu+OAkVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0gJHtkZXRhaWxzLmdhblJlbGF0aW9uIHx8ICfml6DlpKnlubLlhbPns7snfVxcblxcbmA7XG5cbiAgICAvLyDlnLDmlK/lhbPns7tcbiAgICBjYWxjdWxhdGlvbiArPSBg44CQ5Zyw5pSv5YWz57O744CRXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSAke2RldGFpbHMuemhpUmVsYXRpb24gfHwgJ+aXoOWcsOaUr+WFs+ezuyd9XFxuXFxuYDtcblxuICAgIC8vIOeJueauiue7hOWQiOWFs+ezu1xuICAgIGNhbGN1bGF0aW9uICs9IGDjgJDnibnmrornu4TlkIjlhbPns7vjgJFcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtICR7ZGV0YWlscy5zcGVjaWFsUmVsYXRpb24gfHwgJ+aXoOeJueauiue7hOWQiOWFs+ezuyd9XFxuXFxuYDtcblxuICAgIC8vIOW+l+WIhuiuoeeul1xuICAgIGNhbGN1bGF0aW9uICs9IGDjgJDlvpfliIborqHnrpfjgJFcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOWfuuehgOWIhuWAvO+8mjEwLjAwXFxuYDtcblxuICAgIC8vIOiuoeeul+WQhOmhueW+l+WIhlxuICAgIGNvbnN0IHNlYXNvblNjb3JlID0gdGhpcy5leHRyYWN0U2NvcmUoZGV0YWlscy5zZWFzb25FZmZlY3QgfHwgJycpO1xuICAgIGNvbnN0IGdhblNjb3JlID0gdGhpcy5leHRyYWN0U2NvcmUoZGV0YWlscy5nYW5SZWxhdGlvbiB8fCAnJyk7XG4gICAgY29uc3QgemhpU2NvcmUgPSB0aGlzLmV4dHJhY3RTY29yZShkZXRhaWxzLnpoaVJlbGF0aW9uIHx8ICcnKTtcbiAgICBjb25zdCBzcGVjaWFsU2NvcmUgPSB0aGlzLmV4dHJhY3RTY29yZShkZXRhaWxzLnNwZWNpYWxSZWxhdGlvbiB8fCAnJyk7XG5cbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlraPoioLlvbHlk43lvpfliIbvvJoke3NlYXNvblNjb3JlLnRvRml4ZWQoMil9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlpKnlubLlhbPns7vlvpfliIbvvJoke2dhblNjb3JlLnRvRml4ZWQoMil9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlnLDmlK/lhbPns7vlvpfliIbvvJoke3poaVNjb3JlLnRvRml4ZWQoMil9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDnibnmrornu4TlkIjlvpfliIbvvJoke3NwZWNpYWxTY29yZS50b0ZpeGVkKDIpfVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g57u85ZCI5b6X5YiG77yaJHtkZXRhaWxzLnRvdGFsU2NvcmUudG9GaXhlZCgyKX1cXG5cXG5gO1xuXG4gICAgLy8g5pe66KGw5Yik5a6aXG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOaXuuihsOWIpOWumuOAkVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5p6B5pe677ya5b6X5YiGIOKJpSAxNVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5pe677yaMTAg4omkIOW+l+WIhiA8IDE1XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlgY/ml7rvvJo1IOKJpCDlvpfliIYgPCAxMFxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5bmz6KGh77yaMCDiiaQg5b6X5YiGIDwgNVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5YGP5byx77yaLTQg4omkIOW+l+WIhiA8IDBcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOW8se+8mi05IOKJpCDlvpfliIYgPCAtNFxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5p6B5byx77ya5b6X5YiGIDwgLTlcXG5cXG5gO1xuXG4gICAgLy8g5qC55o2u5b6X5YiG5Yik5pat5pe66KGw54q25oCBXG4gICAgY2FsY3VsYXRpb24gKz0gYOagueaNruiuoeeul+e7k+aenCR7ZGV0YWlscy50b3RhbFNjb3JlLnRvRml4ZWQoMil977yM5pel5Li75Li6XCIke3JpWmh1fVwi44CCYDtcblxuICAgIHJldHVybiBjYWxjdWxhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiDku47mlofmnKzkuK3mj5Dlj5blvpfliIZcbiAgICogQHBhcmFtIHRleHQg5YyF5ZCr5b6X5YiG55qE5paH5pysXG4gICAqIEByZXR1cm5zIOaPkOWPlueahOW+l+WIhlxuICAgKi9cbiAgcHJpdmF0ZSBleHRyYWN0U2NvcmUodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBsZXQgc2NvcmUgPSAwO1xuXG4gICAgLy8g5Yy56YWN5omA5pyJICgr5pWw5a2XKSDmiJYgKC3mlbDlrZcpIOagvOW8j+eahOWtl+espuS4slxuICAgIGNvbnN0IHJlZ2V4ID0gLyhbKy1dKShcXGQrKFxcLlxcZCspPykvZztcbiAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cbiAgICB3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHNpZ24gPSBtYXRjaFsxXSA9PT0gJysnID8gMSA6IC0xO1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KG1hdGNoWzJdKTtcbiAgICAgIHNjb3JlICs9IHNpZ24gKiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpzmmK/lpI/lraPngavml7rvvIzkvYbmsqHmnInljLnphY3liLDlvpfliIbvvIzmiYvliqjmt7vliqDlvpfliIZcbiAgICBpZiAodGV4dC5pbmNsdWRlcygn5aSP5a2j54Gr5pe6JykgJiYgc2NvcmUgPT09IDApIHtcbiAgICAgIHNjb3JlID0gNDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2NvcmU7XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5Zyw5pSv5LiJ5LyaXG4gICAqIEByZXR1cm5zIOS4ieS8mue7hOWQiFxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja0RpWmhpU2FuSHVpKCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoIH0gPSB0aGlzLmJhemlJbmZvO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gW3llYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIGhvdXJCcmFuY2hdLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoICE9PSB1bmRlZmluZWQpIGFzIHN0cmluZ1tdO1xuXG4gICAgLy8g5qOA5p+l5LiJ5LyaXG4gICAgY29uc3Qgc2FuSHVpUGF0dGVybnMgPSBbXG4gICAgICB7cGF0dGVybjogWyflr4UnLCAn5Y2vJywgJ+i+sCddLCB0eXBlOiAn5a+F5Y2v6L6wJ30sXG4gICAgICB7cGF0dGVybjogWyflt7MnLCAn5Y2IJywgJ+acqiddLCB0eXBlOiAn5bez5Y2I5pyqJ30sXG4gICAgICB7cGF0dGVybjogWyfnlLMnLCAn6YWJJywgJ+aIjCddLCB0eXBlOiAn55Sz6YWJ5oiMJ30sXG4gICAgICB7cGF0dGVybjogWyfkuqUnLCAn5a2QJywgJ+S4kSddLCB0eXBlOiAn5Lql5a2Q5LiRJ31cbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCB7cGF0dGVybiwgdHlwZX0gb2Ygc2FuSHVpUGF0dGVybnMpIHtcbiAgICAgIC8vIOaUtumbhuWunumZheWHuueOsOeahOWcsOaUr1xuICAgICAgY29uc3QgbWF0Y2hlZEJyYW5jaGVzID0gYnJhbmNoZXMuZmlsdGVyKGJyYW5jaCA9PiBwYXR0ZXJuLmluY2x1ZGVzKGJyYW5jaCkpO1xuXG4gICAgICAvLyDmo4Dmn6XmmK/lkKboh7PlsJHmnInkuKTkuKrkuI3lkIznmoTlnLDmlK9cbiAgICAgIGNvbnN0IHVuaXF1ZUJyYW5jaGVzID0gbmV3IFNldChtYXRjaGVkQnJhbmNoZXMpO1xuXG4gICAgICBpZiAodW5pcXVlQnJhbmNoZXMuc2l6ZSA+PSAyKSB7IC8vIOiHs+WwkeacieS4pOS4quS4jeWQjOeahOWcsOaUr+W9ouaIkOS4ieS8mlxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LiJ5Lya5a+55bqU55qE5LqU6KGMXG4gICAqIEBwYXJhbSBzYW5IdWkg5LiJ5Lya57uE5ZCIXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdGcm9tU2FuSHVpKHNhbkh1aTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WvheWNr+i+sCc6ICfmnKgnLFxuICAgICAgJ+W3s+WNiOacqic6ICfngasnLFxuICAgICAgJ+eUs+mFieaIjCc6ICfph5EnLFxuICAgICAgJ+S6peWtkOS4kSc6ICfmsLQnXG4gICAgfTtcbiAgICByZXR1cm4gbWFwW3Nhbkh1aV0gfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICog5pen55qE5LqU6KGM5by65bqm6K6h566X5pa55rOV77yI5YW85a655oCn77yJXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIOWunumZheiuoeeul+i/h+eoi1xuICAgKi9cbiAgcHJpdmF0ZSBnZXRPbGRXdVhpbmdDYWxjdWxhdGlvbih3dVhpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvIHx8ICF0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5YWr5a2X5L+h5oGvXG4gICAgY29uc3QgeyB5ZWFyU3RlbSwgeWVhckJyYW5jaCwgbW9udGhTdGVtLCBtb250aEJyYW5jaCwgZGF5U3RlbSwgZGF5QnJhbmNoLCBob3VyU3RlbSwgaG91ckJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCB7IHllYXJOYVlpbiwgbW9udGhOYVlpbiwgZGF5TmFZaW4sIGhvdXJOYVlpbiB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCB7IHllYXJIaWRlR2FuLCBtb250aEhpZGVHYW4sIGRheUhpZGVHYW4sIGhvdXJIaWRlR2FuIH0gPSB0aGlzLmJhemlJbmZvO1xuXG4gICAgLy8g6I635Y+W5LqU6KGM5by65bqmXG4gICAgbGV0IHN0cmVuZ3RoID0gMDtcbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzogc3RyZW5ndGggPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmppbjsgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOiBzdHJlbmd0aCA9IHRoaXMuYmF6aUluZm8ud3VYaW5nU3RyZW5ndGgubXU7IGJyZWFrO1xuICAgICAgY2FzZSAn5rC0Jzogc3RyZW5ndGggPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnNodWk7IGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzogc3RyZW5ndGggPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmh1bzsgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOiBzdHJlbmd0aCA9IHRoaXMuYmF6aUluZm8ud3VYaW5nU3RyZW5ndGgudHU7IGJyZWFrO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+aAu+WIhu+8iOWMheWQq+aciOS7pOW9k+S7pOWKoOaIkO+8iVxuICAgIGNvbnN0IHRvdGFsID0gdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aC5qaW4gK1xuICAgICAgICAgICAgICAgICAgdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aC5tdSArXG4gICAgICAgICAgICAgICAgICB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnNodWkgK1xuICAgICAgICAgICAgICAgICAgdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aC5odW8gK1xuICAgICAgICAgICAgICAgICAgdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aC50dTtcblxuICAgIC8vIOaehOW7uuiuoeeul+i/h+eoi1xuICAgIGxldCBjYWxjdWxhdGlvbiA9IGAke3d1WGluZ33kupTooYzlvLrluqblrp7pmYXorqHnrpfov4fnqIvvvJpcXG5cXG5gO1xuXG4gICAgLy8g5aSp5bmy6YOo5YiGXG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOWkqeW5suS6lOihjOOAkVxcbmA7XG4gICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0oeWVhclN0ZW0pID09PSB3dVhpbmcpIHtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOW5siR7eWVhclN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMS4wXFxuYDtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0obW9udGhTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICBjYWxjdWxhdGlvbiArPSBgLSDmnIjlubIke21vbnRoU3RlbX3kuLoke3d1WGluZ33vvIzlvpfliIYyLjBcXG5gO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShkYXlTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XlubIke2RheVN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMy4wXFxuYDtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0oaG91clN0ZW0pID09PSB3dVhpbmcpIHtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuW5siR7aG91clN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGMS4wXFxuYDtcbiAgICB9XG5cbiAgICAvLyDlnLDmlK/ol4/lubLpg6jliIZcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ5Zyw5pSv6JeP5bmy44CRXFxuYDtcbiAgICBpZiAoeWVhckhpZGVHYW4pIHtcbiAgICAgIGNvbnN0IHllYXJIaWRlR2FuQXJyYXkgPSBBcnJheS5pc0FycmF5KHllYXJIaWRlR2FuKSA/IHllYXJIaWRlR2FuIDogeWVhckhpZGVHYW4uc3BsaXQoJycpO1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgeWVhckhpZGVHYW5BcnJheSkge1xuICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlubTmlK8ke3llYXJCcmFuY2h96JePJHtnYW595Li6JHt3dVhpbmd977yM5b6X5YiGMC43XFxuYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobW9udGhIaWRlR2FuKSB7XG4gICAgICBjb25zdCBtb250aEhpZGVHYW5BcnJheSA9IEFycmF5LmlzQXJyYXkobW9udGhIaWRlR2FuKSA/IG1vbnRoSGlkZUdhbiA6IG1vbnRoSGlkZUdhbi5zcGxpdCgnJyk7XG4gICAgICBmb3IgKGNvbnN0IGdhbiBvZiBtb250aEhpZGVHYW5BcnJheSkge1xuICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDmnIjmlK8ke21vbnRoQnJhbmNofeiXjyR7Z2FufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjEuNVxcbmA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRheUhpZGVHYW4pIHtcbiAgICAgIGNvbnN0IGRheUhpZGVHYW5BcnJheSA9IEFycmF5LmlzQXJyYXkoZGF5SGlkZUdhbikgPyBkYXlIaWRlR2FuIDogZGF5SGlkZUdhbi5zcGxpdCgnJyk7XG4gICAgICBmb3IgKGNvbnN0IGdhbiBvZiBkYXlIaWRlR2FuQXJyYXkpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0oZ2FuKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5pSvJHtkYXlCcmFuY2h96JePJHtnYW595Li6JHt3dVhpbmd977yM5b6X5YiGMi4wXFxuYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaG91ckhpZGVHYW4pIHtcbiAgICAgIGNvbnN0IGhvdXJIaWRlR2FuQXJyYXkgPSBBcnJheS5pc0FycmF5KGhvdXJIaWRlR2FuKSA/IGhvdXJIaWRlR2FuIDogaG91ckhpZGVHYW4uc3BsaXQoJycpO1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgaG91ckhpZGVHYW5BcnJheSkge1xuICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml7bmlK8ke2hvdXJCcmFuY2h96JePJHtnYW595Li6JHt3dVhpbmd977yM5b6X5YiGMC43XFxuYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe6s+mfs+S6lOihjOmDqOWIhlxuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDnurPpn7PkupTooYzjgJFcXG5gO1xuICAgIGlmICh5ZWFyTmFZaW4gJiYgeWVhck5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOafsee6s+mfsyR7eWVhck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuNVxcbmA7XG4gICAgfVxuICAgIGlmIChtb250aE5hWWluICYmIG1vbnRoTmFZaW4uaW5jbHVkZXMod3VYaW5nKSkge1xuICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pyI5p+x57qz6Z+zJHttb250aE5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjEuMFxcbmA7XG4gICAgfVxuICAgIGlmIChkYXlOYVlpbiAmJiBkYXlOYVlpbi5pbmNsdWRlcyh3dVhpbmcpKSB7XG4gICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6Xmn7HnurPpn7Mke2RheU5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjEuNVxcbmA7XG4gICAgfVxuICAgIGlmIChob3VyTmFZaW4gJiYgaG91ck5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuafsee6s+mfsyR7aG91ck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhjAuNVxcbmA7XG4gICAgfVxuXG4gICAgLy8g5a2j6IqC6LCD5pW0XG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOWto+iKguiwg+aVtOOAkVxcbmA7XG4gICAgY29uc3Qgc2Vhc29uID0gdGhpcy5nZXRTZWFzb24obW9udGhCcmFuY2gpO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOW9k+WJjeWto+iKgu+8miR7c2Vhc29ufVxcbmA7XG5cbiAgICBzd2l0Y2ggKHNlYXNvbikge1xuICAgICAgY2FzZSAn5pil5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+acqOaXuu+8jOW+l+WIhisyLjBcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn54GrJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j54Gr55u477yM5b6X5YiGKzEuMFxcbmA7XG4gICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPph5Hlm5rvvIzlvpfliIYtMS4wXFxuYDtcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+awtOatu++8jOW+l+WIhi0xLjVcXG5gO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+Wkj+Wtoyc6XG4gICAgICAgIGlmICh3dVhpbmcgPT09ICfngasnKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPngavml7rvvIzlvpfliIYrMi4wXFxuYDtcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+WcnycpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+Wcn+ebuO+8jOW+l+WIhisxLjBcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j5rC05Zua77yM5b6X5YiGLTEuMFxcbmA7XG4gICAgICAgIGlmICh3dVhpbmcgPT09ICfmnKgnKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPmnKjmrbvvvIzlvpfliIYtMS41XFxuYDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfnp4vlraMnOlxuICAgICAgICBpZiAod3VYaW5nID09PSAn6YeRJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j6YeR5pe677yM5b6X5YiGKzIuMFxcbmA7XG4gICAgICAgIGlmICh3dVhpbmcgPT09ICfmsLQnKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPmsLTnm7jvvIzlvpfliIYrMS4wXFxuYDtcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+eBq+Wbmu+8jOW+l+WIhi0xLjBcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5ZyfJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5Zyf5q2777yM5b6X5YiGLTEuNVxcbmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5Yas5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+awtOaXuu+8jOW+l+WIhisyLjBcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5pyo55u477yM5b6X5YiGKzEuMFxcbmA7XG4gICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPlnJ/lm5rvvIzlvpfliIYtMS4wXFxuYDtcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+mHkScpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+mHkeatu++8jOW+l+WIhi0xLjVcXG5gO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyDmnIjku6TlvZPku6TliqDmiJBcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ5pyI5Luk5b2T5Luk5Yqg5oiQ44CRXFxuYDtcbiAgICBzd2l0Y2ggKHNlYXNvbikge1xuICAgICAgY2FzZSAn5pil5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+acqOW9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn54GrJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j54Gr55u45pe677yM5b6X5YiGKzAuOFxcbmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5aSP5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+eBq+W9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5ZyfJykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j5Zyf55u45pe677yM5b6X5YiGKzAuOFxcbmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn56eL5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+mHkScpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+mHkeW9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5rC055u45pe677yM5b6X5YiGKzAuOFxcbmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5Yas5a2jJzpcbiAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+awtOW9k+S7pO+8jOW+l+WIhisxLjVcXG5gO1xuICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5pyo55u45pe677yM5b6X5YiGKzAuOFxcbmA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIOe7hOWQiOiwg+aVtFxuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDnu4TlkIjosIPmlbTjgJFcXG5gO1xuXG4gICAgLy8g5aSp5bmy5LqU5ZCIXG4gICAgY29uc3QgdGlhbkdhbld1SGUgPSB0aGlzLmNoZWNrVGlhbkdhbld1SGUoKTtcbiAgICBpZiAodGlhbkdhbld1SGUpIHtcbiAgICAgIGNvbnN0IGhlV3VYaW5nID0gdGhpcy5nZXRXdVhpbmdGcm9tV3VIZSh0aWFuR2FuV3VIZSk7XG4gICAgICBpZiAoaGVXdVhpbmcgPT09IHd1WGluZykge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlpKnlubLkupTlkIjvvJoke3RpYW5HYW5XdUhlfeWQiOWMliR7d3VYaW5nfe+8jOW+l+WIhiswLjZcXG5gO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWcsOaUr+S4ieWQiFxuICAgIGNvbnN0IGRpWmhpU2FuSGUgPSB0aGlzLmNoZWNrRGlaaGlTYW5IZSgpO1xuICAgIGlmIChkaVpoaVNhbkhlKSB7XG4gICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVNhbkhlKGRpWmhpU2FuSGUpO1xuICAgICAgaWYgKGhlV3VYaW5nID09PSB3dVhpbmcpIHtcbiAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5Zyw5pSv5LiJ5ZCI77yaJHtkaVpoaVNhbkhlfeS4ieWQiCR7d3VYaW5nfeWxgO+8jOW+l+WIhisxLjJcXG5gO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWcsOaUr+S4ieS8mlxuICAgIGNvbnN0IGRpWmhpU2FuSHVpID0gdGhpcy5jaGVja0RpWmhpU2FuSHVpKCk7XG4gICAgaWYgKGRpWmhpU2FuSHVpKSB7XG4gICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVNhbkh1aShkaVpoaVNhbkh1aSk7XG4gICAgICBpZiAoaGVXdVhpbmcgPT09IHd1WGluZykge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlnLDmlK/kuInkvJrvvJoke2RpWmhpU2FuSHVpfeS4ieS8miR7d3VYaW5nfeWxgO+8jOW+l+WIhisxLjBcXG5gO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaAu+e7k1xuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDmgLvliIborqHnrpfjgJFcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtICR7d3VYaW5nfeS6lOihjOaAu+W+l+WIhu+8miR7c3RyZW5ndGgudG9GaXhlZCgyKX1cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOaJgOacieS6lOihjOaAu+W+l+WIhu+8miR7dG90YWwudG9GaXhlZCgyKX1cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtICR7d3VYaW5nfeS6lOihjOebuOWvueW8uuW6pu+8miR7c3RyZW5ndGgudG9GaXhlZCgyKX0gLyAke3RvdGFsLnRvRml4ZWQoMil9ICogMTAgPSAkeyhzdHJlbmd0aCAvIHRvdGFsICogMTApLnRvRml4ZWQoMil9XFxuYDtcblxuICAgIHJldHVybiBjYWxjdWxhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blpKnlubLlr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdGcm9tU3RlbShzdGVtOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICAgIGlmICghc3RlbSkgcmV0dXJuICcnO1xuXG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5pyoJywgJ+S5mSc6ICfmnKgnLFxuICAgICAgJ+S4mSc6ICfngasnLCAn5LiBJzogJ+eBqycsXG4gICAgICAn5oiKJzogJ+WcnycsICflt7EnOiAn5ZyfJyxcbiAgICAgICfluponOiAn6YeRJywgJ+i+myc6ICfph5EnLFxuICAgICAgJ+WjrCc6ICfmsLQnLCAn55m4JzogJ+awtCdcbiAgICB9O1xuICAgIHJldHVybiBtYXBbc3RlbV0gfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5Zyw5pSv5a+55bqU55qE5LqU6KGMXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRCcmFuY2hXdVhpbmcoYnJhbmNoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICAgIGlmICghYnJhbmNoKSByZXR1cm4gJyc7XG5cbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WvhSc6ICfmnKgnLCAn5Y2vJzogJ+acqCcsXG4gICAgICAn5bezJzogJ+eBqycsICfljYgnOiAn54GrJyxcbiAgICAgICfovrAnOiAn5ZyfJywgJ+S4kSc6ICflnJ8nLCAn5oiMJzogJ+WcnycsICfmnKonOiAn5ZyfJyxcbiAgICAgICfnlLMnOiAn6YeRJywgJ+mFiSc6ICfph5EnLFxuICAgICAgJ+S6pSc6ICfmsLQnLCAn5a2QJzogJ+awtCdcbiAgICB9O1xuICAgIHJldHVybiBtYXBbYnJhbmNoXSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lnLDmlK/ojrflj5blraPoioJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5a2j6IqCXG4gICAqL1xuICBwcml2YXRlIGdldFNlYXNvbihicmFuY2g6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gICAgaWYgKCFicmFuY2gpIHJldHVybiAn5pil5a2jJzsgLy8g6buY6K6k5Li65pil5a2jXG5cbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WvhSc6ICfmmKXlraMnLCAn5Y2vJzogJ+aYpeWtoycsICfovrAnOiAn5pil5a2jJyxcbiAgICAgICflt7MnOiAn5aSP5a2jJywgJ+WNiCc6ICflpI/lraMnLCAn5pyqJzogJ+Wkj+WtoycsXG4gICAgICAn55SzJzogJ+eni+WtoycsICfphYknOiAn56eL5a2jJywgJ+aIjCc6ICfnp4vlraMnLFxuICAgICAgJ+S6pSc6ICflhqzlraMnLCAn5a2QJzogJ+WGrOWtoycsICfkuJEnOiAn5Yas5a2jJ1xuICAgIH07XG4gICAgcmV0dXJuIG1hcFticmFuY2hdIHx8ICfmmKXlraMnO1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWkqeW5suS6lOWQiFxuICAgKiBAcmV0dXJucyDkupTlkIjnu4TlkIhcbiAgICovXG4gIHByaXZhdGUgY2hlY2tUaWFuR2FuV3VIZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgeWVhclN0ZW0sIG1vbnRoU3RlbSwgZGF5U3RlbSwgaG91clN0ZW0gfSA9IHRoaXMuYmF6aUluZm87XG4gICAgY29uc3Qgc3RlbXMgPSBbeWVhclN0ZW0sIG1vbnRoU3RlbSwgZGF5U3RlbSwgaG91clN0ZW1dO1xuXG4gICAgLy8g5qOA5p+l5LqU5ZCIXG4gICAgaWYgKHN0ZW1zLmluY2x1ZGVzKCfnlLInKSAmJiBzdGVtcy5pbmNsdWRlcygn5bexJykpIHJldHVybiAn55Sy5bexJztcbiAgICBpZiAoc3RlbXMuaW5jbHVkZXMoJ+S5mScpICYmIHN0ZW1zLmluY2x1ZGVzKCfluponKSkgcmV0dXJuICfkuZnluponO1xuICAgIGlmIChzdGVtcy5pbmNsdWRlcygn5LiZJykgJiYgc3RlbXMuaW5jbHVkZXMoJ+i+mycpKSByZXR1cm4gJ+S4mei+myc7XG4gICAgaWYgKHN0ZW1zLmluY2x1ZGVzKCfkuIEnKSAmJiBzdGVtcy5pbmNsdWRlcygn5aOsJykpIHJldHVybiAn5LiB5aOsJztcbiAgICBpZiAoc3RlbXMuaW5jbHVkZXMoJ+aIiicpICYmIHN0ZW1zLmluY2x1ZGVzKCfnmbgnKSkgcmV0dXJuICfmiIrnmbgnO1xuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS6lOWQiOWvueW6lOeahOS6lOihjFxuICAgKiBAcGFyYW0gd3VIZSDkupTlkIjnu4TlkIhcbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIGdldFd1WGluZ0Zyb21XdUhlKHd1SGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLLlt7EnOiAn5ZyfJyxcbiAgICAgICfkuZnluponOiAn6YeRJyxcbiAgICAgICfkuJnovpsnOiAn5rC0JyxcbiAgICAgICfkuIHlo6wnOiAn5pyoJyxcbiAgICAgICfmiIrnmbgnOiAn54GrJ1xuICAgIH07XG4gICAgcmV0dXJuIG1hcFt3dUhlXSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XlnLDmlK/kuInlkIhcbiAgICogQHJldHVybnMg5LiJ5ZCI57uE5ZCIXG4gICAqL1xuICBwcml2YXRlIGNoZWNrRGlaaGlTYW5IZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCBicmFuY2hlcyA9IFt5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoXTtcblxuICAgIC8vIOajgOafpeS4ieWQiFxuICAgIGNvbnN0IGhhc1ppID0gYnJhbmNoZXMuaW5jbHVkZXMoJ+WtkCcpO1xuICAgIGNvbnN0IGhhc1NoZW4gPSBicmFuY2hlcy5pbmNsdWRlcygn55SzJyk7XG4gICAgY29uc3QgaGFzQ2hlbiA9IGJyYW5jaGVzLmluY2x1ZGVzKCfovrAnKTtcbiAgICBpZiAoaGFzWmkgJiYgaGFzU2hlbiAmJiBoYXNDaGVuKSByZXR1cm4gJ+WtkOeUs+i+sCc7XG5cbiAgICBjb25zdCBoYXNIYWkgPSBicmFuY2hlcy5pbmNsdWRlcygn5LqlJyk7XG4gICAgY29uc3QgaGFzTWFvID0gYnJhbmNoZXMuaW5jbHVkZXMoJ+WNrycpO1xuICAgIGNvbnN0IGhhc1dlaSA9IGJyYW5jaGVzLmluY2x1ZGVzKCfmnKonKTtcbiAgICBpZiAoaGFzSGFpICYmIGhhc01hbyAmJiBoYXNXZWkpIHJldHVybiAn5Lql5Y2v5pyqJztcblxuICAgIGNvbnN0IGhhc1lpbiA9IGJyYW5jaGVzLmluY2x1ZGVzKCflr4UnKTtcbiAgICBjb25zdCBoYXNXdSA9IGJyYW5jaGVzLmluY2x1ZGVzKCfljYgnKTtcbiAgICBjb25zdCBoYXNYdSA9IGJyYW5jaGVzLmluY2x1ZGVzKCfmiIwnKTtcbiAgICBpZiAoaGFzWWluICYmIGhhc1d1ICYmIGhhc1h1KSByZXR1cm4gJ+WvheWNiOaIjCc7XG5cbiAgICBjb25zdCBoYXNTaSA9IGJyYW5jaGVzLmluY2x1ZGVzKCflt7MnKTtcbiAgICBjb25zdCBoYXNZb3UgPSBicmFuY2hlcy5pbmNsdWRlcygn6YWJJyk7XG4gICAgY29uc3QgaGFzQ2hvdSA9IGJyYW5jaGVzLmluY2x1ZGVzKCfkuJEnKTtcbiAgICBpZiAoaGFzU2kgJiYgaGFzWW91ICYmIGhhc0Nob3UpIHJldHVybiAn5bez6YWJ5LiRJztcblxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkuInlkIjlr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIHNhbkhlIOS4ieWQiOe7hOWQiFxuICAgKiBAcmV0dXJucyDkupTooYxcbiAgICovXG4gIHByaXZhdGUgZ2V0V3VYaW5nRnJvbVNhbkhlKHNhbkhlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2Q55Sz6L6wJzogJ+awtCcsXG4gICAgICAn5Lql5Y2v5pyqJzogJ+acqCcsXG4gICAgICAn5a+F5Y2I5oiMJzogJ+eBqycsXG4gICAgICAn5bez6YWJ5LiRJzogJ+mHkSdcbiAgICB9O1xuICAgIHJldHVybiBtYXBbc2FuSGVdIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaXpeS4u+aXuuihsOeahOaPj+i/sFxuICAgKiBAcGFyYW0gcmlaaHUg5pel5Li75pe66KGw54q25oCBXG4gICAqIEByZXR1cm5zIOaPj+i/sFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRSaVpodURlc2NyaXB0aW9uKHJpWmh1OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5p6B5pe6JzogJ+aXpeS4u+S6lOihjOWKm+mHj+aegeW8uu+8jOiDvemHj+i/h+WJqe+8jOmcgOimgeazhOengOOAguaAp+agvOWImuW8uu+8jOiHquS/oeW/g+W8uu+8jOacieS4u+inge+8jOWBmuS6i+aciemthOWKm+OAgicsXG4gICAgICAn5pe6JzogJ+aXpeS4u+S6lOihjOWKm+mHj+WFheaym++8jOiDvemHj+WFhei2s++8jOWunOazhOS4jeWunOaJtuOAguaAp+agvOi+g+S4uuWImuW8uu+8jOiHquS/oeW/g+W8uu+8jOacieS4u+inge+8jOWBmuS6i+aciemthOWKm+OAgicsXG4gICAgICAn5YGP5pe6JzogJ+aXpeS4u+S6lOihjOWKm+mHj+i+g+W8uu+8jOiDvemHj+eVpeacieebiOS9me+8jOWunOmAguW6puazhOengOOAguaAp+agvOi+g+S4uuW5s+ihoe+8jOiHquS/oeS9huS4jei/h+WIhu+8jOiDveWkn+mAguW6lOWQhOenjeeOr+Wig+OAgicsXG4gICAgICAn5bmz6KGhJzogJ+aXpeS4u+S6lOihjOWKm+mHj+mAguS4re+8jOiDvemHj+W5s+ihoe+8jOWWnOW/jOmcgOinhuWFt+S9k+aDheWGteiAjOWumuOAguaAp+agvOa4qeWSjO+8jOmAguW6lOWKm+W8uu+8jOiDveWkn+iejeWFpeWQhOenjeeOr+Wig+OAgicsXG4gICAgICAn5YGP5byxJzogJ+aXpeS4u+S6lOihjOWKm+mHj+eVpeaYvuS4jei2s++8jOiDvemHj+eVpeacieS4jei2s++8jOWunOmAguW6puaJtuWKqeOAguaAp+agvOi+g+S4uuWGheWQke+8jOiHquS/oeW/g+S4jei2s++8jOWuueaYk+WPl+WklueVjOW9seWTjeOAgicsXG4gICAgICAn5byxJzogJ+aXpeS4u+S6lOihjOWKm+mHj+S4jei2s++8jOiDvemHj+e8uuS5j++8jOmcgOimgeaJtuWKqeOAguaAp+agvOi+g+S4uuWGheWQke+8jOiHquS/oeW/g+S4jei2s++8jOWuueaYk+WPl+WklueVjOW9seWTjeOAgicsXG4gICAgICAn5p6B5byxJzogJ+aXpeS4u+S6lOihjOWKm+mHj+aegeW8se+8jOiDvemHj+S4pemHjeS4jei2s++8jOaApemcgOaJtuWKqeOAguaAp+agvOi9r+W8se+8jOe8uuS5j+iHquS/oe+8jOWuueaYk+WPl+WItuS6juS6uuOAgidcbiAgICB9O1xuICAgIHJldHVybiBkZXNjcmlwdGlvbnNbcmlaaHVdIHx8ICfml6XkuLvkupTooYzlipvph4/pgILkuK3vvIzog73ph4/lubPooaHjgIInO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaXpeS4u+aXuuihsOeahOW9seWTjVxuICAgKiBAcGFyYW0gcmlaaHUg5pel5Li75pe66KGw54q25oCBXG4gICAqIEByZXR1cm5zIOW9seWTjVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRSaVpodUluZmx1ZW5jZShyaVpodTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbmZsdWVuY2VzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfmnoHml7onOiAn5pel5Li76L+H5pe677yM5Zac55So5rOE56eA5LmL54mp77yI6LSi5pif44CB5a6Y5pif77yJ5p2l5rOE5YW26L+H5pe65LmL5rCU44CC5b+M55So5Y2w5q+U5LmL54mp77yM5Lul5YWN5pu05Yqg5pe655ub44CCJyxcbiAgICAgICfml7onOiAn5pel5Li75pe655ub77yM5Zac55So5rOE56eA5LmL54mp77yI6LSi5pif44CB5a6Y5pif77yJ5p2l5rOE5YW25pe655ub5LmL5rCU44CC5b+M55So5Y2w5q+U5LmL54mp77yM5Lul5YWN5pu05Yqg5pe655ub44CCJyxcbiAgICAgICflgY/ml7onOiAn5pel5Li75YGP5pe677yM5Zac55So5rOE56eA5LmL54mp77yM5L2G5LiN5a6c6L+H5aSa44CC5Y+v6YCC5b2T55So5Y2w5q+U5LmL54mp6LCD5ZKM44CCJyxcbiAgICAgICflubPooaEnOiAn5pel5Li75bmz6KGh77yM5qC55o2u5YW35L2T5oOF5Ya177yM5Y+v5Y+W5Y2w5q+U5oiW6LSi5a6Y44CC6ZyA6KaB57u85ZCI6ICD6JmR5YWr5a2X5qC85bGA44CCJyxcbiAgICAgICflgY/lvLEnOiAn5pel5Li75YGP5byx77yM5Zac55So55Sf5om25LmL54mp77yI5Y2w5pif44CB5q+U5Yqr77yJ5p2l5aKe5by65pel5Li75Yqb6YeP44CC5b+M55So5rOE56eA5LmL54mp77yM5Lul5YWN5pu05Yqg6KGw5byx44CCJyxcbiAgICAgICflvLEnOiAn5pel5Li76KGw5byx77yM5Zac55So55Sf5om25LmL54mp77yI5Y2w5pif44CB5q+U5Yqr77yJ5p2l5aKe5by65pel5Li75Yqb6YeP44CC5b+M55So5rOE56eA5LmL54mp77yM5Lul5YWN5pu05Yqg6KGw5byx44CCJyxcbiAgICAgICfmnoHlvLEnOiAn5pel5Li75p6B5byx77yM5b+F6aG755So55Sf5om25LmL54mp5p2l5aKe5by65pel5Li75Yqb6YeP44CC5Lil56aB55So5rOE56eA5LmL54mp77yM5Lul5YWN5pu05Yqg6KGw5byx44CCJ1xuICAgIH07XG4gICAgcmV0dXJuIGluZmx1ZW5jZXNbcmlaaHVdIHx8ICfml6XkuLvlubPooaHvvIzpnIDopoHnu7zlkIjogIPomZHlhavlrZfmoLzlsYDjgIInO1xuICB9XG59XG4iXX0=