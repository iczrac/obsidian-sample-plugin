import { ShenShaService } from '../services/ShenShaService';
import { WuXingService } from '../services/WuXingService';
import { GeJuService } from '../services/GeJuService';
import { GeJuTrendService } from '../services/GeJuTrendService';
import { GeJuTrendChart } from './GeJuTrendChart';
import { BaziService } from '../services/BaziService';
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
        // 已显示的弹窗列表，用于防止重复显示
        this.shownModals = [];
        // 动画相关
        this.animationDuration = 300; // 毫秒
        this.container = container;
        this.baziInfo = baziInfo;
        this.id = id;
        // 设置默认的神煞显示设置
        if (!this.baziInfo.showShenSha) {
            this.baziInfo.showShenSha = {
                siZhu: true,
                daYun: true,
                liuNian: true,
                xiaoYun: true,
                liuYue: true
            };
        }
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
        // 天干十神
        if (this.baziInfo.yearShiShenGan) {
            yearShiShenCell.createSpan({
                text: this.baziInfo.yearShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 地支藏干十神
        if (this.baziInfo.yearShiShenZhi && Array.isArray(this.baziInfo.yearShiShenZhi) && this.baziInfo.yearShiShenZhi.length > 0) {
            yearShiShenCell.createSpan({ text: ' ' });
            yearShiShenCell.createSpan({
                text: this.baziInfo.yearShiShenZhi.join(','),
                cls: 'shishen-tag-small shishen-tag-hide'
            });
        }
        else if (this.baziInfo.yearBranch) {
            // 如果没有提供地支藏干十神，则计算
            const hiddenShiShen = this.getHiddenShiShen(this.baziInfo.dayStem || '', this.baziInfo.yearBranch);
            if (hiddenShiShen.length > 0) {
                yearShiShenCell.createSpan({ text: ' ' });
                yearShiShenCell.createSpan({
                    text: hiddenShiShen.join(','),
                    cls: 'shishen-tag-small shishen-tag-hide'
                });
            }
        }
        // 月柱十神
        const monthShiShenCell = shiShenRow.createEl('td');
        // 天干十神
        if (this.baziInfo.monthShiShenGan) {
            monthShiShenCell.createSpan({
                text: this.baziInfo.monthShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 地支藏干十神
        if (this.baziInfo.monthShiShenZhi && Array.isArray(this.baziInfo.monthShiShenZhi) && this.baziInfo.monthShiShenZhi.length > 0) {
            monthShiShenCell.createSpan({ text: ' ' });
            monthShiShenCell.createSpan({
                text: this.baziInfo.monthShiShenZhi.join(','),
                cls: 'shishen-tag-small shishen-tag-hide'
            });
        }
        else if (this.baziInfo.monthBranch) {
            // 如果没有提供地支藏干十神，则计算
            const hiddenShiShen = this.getHiddenShiShen(this.baziInfo.dayStem || '', this.baziInfo.monthBranch);
            if (hiddenShiShen.length > 0) {
                monthShiShenCell.createSpan({ text: ' ' });
                monthShiShenCell.createSpan({
                    text: hiddenShiShen.join(','),
                    cls: 'shishen-tag-small shishen-tag-hide'
                });
            }
        }
        // 日柱十神
        const dayShiShenCell = shiShenRow.createEl('td');
        // 日主标签
        dayShiShenCell.createSpan({
            text: '日主',
            cls: 'shishen-tag-small'
        });
        // 地支藏干十神
        if (this.baziInfo.dayShiShenZhi && Array.isArray(this.baziInfo.dayShiShenZhi) && this.baziInfo.dayShiShenZhi.length > 0) {
            dayShiShenCell.createSpan({ text: ' ' });
            dayShiShenCell.createSpan({
                text: this.baziInfo.dayShiShenZhi.join(','),
                cls: 'shishen-tag-small shishen-tag-hide'
            });
        }
        else if (this.baziInfo.dayBranch) {
            // 如果没有提供地支藏干十神，则计算
            const hiddenShiShen = this.getHiddenShiShen(this.baziInfo.dayStem || '', this.baziInfo.dayBranch);
            if (hiddenShiShen.length > 0) {
                dayShiShenCell.createSpan({ text: ' ' });
                dayShiShenCell.createSpan({
                    text: hiddenShiShen.join(','),
                    cls: 'shishen-tag-small shishen-tag-hide'
                });
            }
        }
        // 时柱十神
        const timeShiShenCell = shiShenRow.createEl('td');
        // 天干十神
        if (this.baziInfo.timeShiShenGan) {
            timeShiShenCell.createSpan({
                text: this.baziInfo.timeShiShenGan,
                cls: 'shishen-tag-small'
            });
        }
        // 地支藏干十神
        if (this.baziInfo.hourShiShenZhi && Array.isArray(this.baziInfo.hourShiShenZhi) && this.baziInfo.hourShiShenZhi.length > 0) {
            timeShiShenCell.createSpan({ text: ' ' });
            timeShiShenCell.createSpan({
                text: this.baziInfo.hourShiShenZhi.join(','),
                cls: 'shishen-tag-small shishen-tag-hide'
            });
        }
        else if (this.baziInfo.hourBranch) {
            // 如果没有提供地支藏干十神，则计算
            const hiddenShiShen = this.getHiddenShiShen(this.baziInfo.dayStem || '', this.baziInfo.hourBranch);
            if (hiddenShiShen.length > 0) {
                timeShiShenCell.createSpan({ text: ' ' });
                timeShiShenCell.createSpan({
                    text: hiddenShiShen.join(','),
                    cls: 'shishen-tag-small shishen-tag-hide'
                });
            }
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
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.description) || '' }
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
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.description) || '' }
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
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.description) || '' }
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
                            attr: { 'title': (shenShaInfo === null || shenShaInfo === void 0 ? void 0 : shenShaInfo.description) || '' }
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
            // 创建格局标签，添加点击事件
            const geJuSpan = geJuItem.createSpan({
                text: `格局: ${this.baziInfo.geJu}`,
                cls: 'geju-tag geju-clickable'
            });
            // 添加点击事件，显示格局详细解释
            geJuSpan.addEventListener('click', () => {
                if (this.baziInfo.geJu) {
                    this.showGeJuExplanation(this.baziInfo.geJu);
                }
            });
            // 添加格局强度（如果有）
            if (this.baziInfo.geJuStrength) {
                const strengthValue = typeof this.baziInfo.geJuStrength === 'number'
                    ? this.baziInfo.geJuStrength
                    : parseInt(this.baziInfo.geJuStrength);
                if (!isNaN(strengthValue)) {
                    const strengthSpan = geJuItem.createSpan({
                        text: `(${strengthValue}%)`,
                        cls: 'geju-strength'
                    });
                    // 根据强度值设置颜色
                    if (strengthValue >= 80) {
                        strengthSpan.addClass('geju-strength-high');
                    }
                    else if (strengthValue >= 60) {
                        strengthSpan.addClass('geju-strength-medium');
                    }
                    else {
                        strengthSpan.addClass('geju-strength-low');
                    }
                }
            }
            if (this.baziInfo.geJuDetail) {
                geJuItem.createSpan({
                    text: ` (${this.baziInfo.geJuDetail})`,
                    cls: 'geju-detail'
                });
            }
            // 添加格局分析按钮
            const analyzeButton = geJuItem.createSpan({
                text: '分析',
                cls: 'geju-analyze-button'
            });
            // 添加点击事件，显示格局分析
            analyzeButton.addEventListener('click', () => {
                if (this.baziInfo.geJu) {
                    this.showGeJuAnalysis(this.baziInfo.geJu, this.baziInfo.riZhuStrength || '平衡');
                }
            });
            // 添加格局详情按钮（显示格局形成因素）
            if (this.baziInfo.geJuFactors && this.baziInfo.geJuFactors.length > 0) {
                const detailButton = geJuItem.createSpan({
                    text: '详情',
                    cls: 'geju-detail-button'
                });
                // 添加点击事件，显示格局形成因素
                detailButton.addEventListener('click', () => {
                    this.showGeJuFactors();
                });
            }
        }
        // 添加用神信息
        if (this.baziInfo.yongShen) {
            const yongShenItem = infoList.createEl('li');
            // 创建用神标签，添加点击事件
            const yongShenSpan = yongShenItem.createSpan({
                text: `用神: ${this.baziInfo.yongShen}`,
                cls: 'yongshen-tag yongshen-clickable'
            });
            // 添加点击事件，显示用神详细解释
            yongShenSpan.addEventListener('click', () => {
                if (this.baziInfo.yongShen) {
                    this.showYongShenExplanation(this.baziInfo.yongShen, this.baziInfo.yongShenDetail || '');
                }
            });
            if (this.baziInfo.yongShenDetail) {
                yongShenItem.createSpan({
                    text: ` (${this.baziInfo.yongShenDetail})`,
                    cls: 'yongshen-detail'
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
            // 创建日主旺衰标签，添加点击事件
            const riZhuSpan = riZhuItem.createSpan({
                text: this.baziInfo.riZhuStrength,
                cls: `rizhu-strength rizhu-clickable wuxing-${wuXingClass}`,
                attr: {
                    'data-rizhu': this.baziInfo.riZhuStrength,
                    'data-wuxing': dayWuXing
                }
            });
            // 添加点击事件，显示日主旺衰详细解释
            riZhuSpan.addEventListener('click', () => {
                if (this.baziInfo.riZhuStrength && this.baziInfo.dayWuXing) {
                    this.showRiZhuExplanation(this.baziInfo.riZhuStrength, this.baziInfo.dayWuXing);
                }
            });
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
        // 确保 daYunData 是数组类型
        const daYunData = Array.isArray(this.baziInfo.daYun) ? this.baziInfo.daYun : [];
        // 第一行：年份
        const yearRow = this.daYunTable.createEl('tr');
        yearRow.createEl('th', { text: '大运' });
        // 确保 daYunData 是数组类型
        if (Array.isArray(daYunData)) {
            daYunData.slice(0, 10).forEach(dy => {
                yearRow.createEl('td', { text: dy.startYear.toString() });
            });
        }
        // 第二行：年龄
        const ageRow = this.daYunTable.createEl('tr');
        ageRow.createEl('th', { text: '年龄' });
        if (Array.isArray(daYunData)) {
            daYunData.slice(0, 10).forEach(dy => {
                ageRow.createEl('td', { text: dy.startAge.toString() });
            });
        }
        // 第三行：干支
        const gzRow = this.daYunTable.createEl('tr');
        gzRow.createEl('th', { text: '干支' });
        if (Array.isArray(daYunData)) {
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
        }
        // 第四行：十神（如果有）
        if (Array.isArray(daYunData) && daYunData.some(dy => dy.shiShenGan)) {
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
        if (Array.isArray(daYunData) && daYunData.some(dy => dy.diShi)) {
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
        if (Array.isArray(daYunData) && daYunData.some(dy => dy.xunKong)) {
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
        if (Array.isArray(daYunData) && daYunData.some(dy => dy.naYin)) {
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
        if (!Array.isArray(this.baziInfo.daYun)) {
            return;
        }
        const selectedDaYun = this.baziInfo.daYun[index];
        if (!selectedDaYun) {
            return;
        }
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
            if (!selectedDaYun)
                return false;
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
        if (!daYun || !daYun.startYear) {
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
        if (!daYun || !daYun.startYear) {
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
        // 使用BaziService中的方法
        return BaziService.getShiShen(dayStem, stem);
    }
    /**
     * 获取地支藏干的十神
     * @param dayStem 日干（日主）
     * @param branch 地支
     * @returns 藏干对应的十神数组
     */
    getHiddenShiShen(dayStem, branch) {
        // 使用BaziService中的方法
        return BaziService.getHiddenShiShen(dayStem, branch);
    }
    /**
     * 获取地支藏干
     * @param branch 地支
     * @returns 藏干字符串，多个藏干用逗号分隔
     */
    getHideGan(branch) {
        // 使用BaziService中的方法
        return BaziService.getHideGan(branch);
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
        const shenShaInfo = ShenShaService.getShenShaExplanation(shenSha);
        // 创建一个临时容器
        const container = document.createElement('div');
        container.className = 'shensha-modal-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        // 直接创建DOM元素显示神煞详情
        const modalContent = document.createElement('div');
        modalContent.className = 'shensha-modal-content';
        modalContent.style.backgroundColor = 'var(--background-primary)';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '600px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.padding = '20px';
        container.appendChild(modalContent);
        // 创建标题和类型容器
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginBottom = '15px';
        headerContainer.style.borderBottom = '1px solid var(--background-modifier-border)';
        headerContainer.style.paddingBottom = '10px';
        modalContent.appendChild(headerContainer);
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = shenShaInfo.name;
        title.style.margin = '0';
        title.style.fontSize = '1.5em';
        headerContainer.appendChild(title);
        // 创建类型
        const type = document.createElement('div');
        type.textContent = shenShaInfo.type;
        type.style.padding = '4px 10px';
        type.style.borderRadius = '16px';
        type.style.fontSize = '0.9em';
        type.style.fontWeight = 'bold';
        if (shenShaInfo.type === '吉神') {
            type.style.backgroundColor = 'rgba(0, 128, 0, 0.1)';
            type.style.color = '#2a9d8f';
            type.style.border = '1px solid #2a9d8f';
        }
        else if (shenShaInfo.type === '凶神') {
            type.style.backgroundColor = 'rgba(220, 20, 60, 0.1)';
            type.style.color = '#e76f51';
            type.style.border = '1px solid #e76f51';
        }
        else if (shenShaInfo.type === '吉凶神') {
            type.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
            type.style.color = '#e9c46a';
            type.style.border = '1px solid #e9c46a';
        }
        headerContainer.appendChild(type);
        // 创建简介部分
        const descriptionSection = document.createElement('div');
        descriptionSection.style.marginBottom = '15px';
        modalContent.appendChild(descriptionSection);
        const descriptionTitle = document.createElement('h4');
        descriptionTitle.textContent = '简介';
        descriptionTitle.style.marginTop = '0';
        descriptionTitle.style.marginBottom = '8px';
        descriptionSection.appendChild(descriptionTitle);
        const description = document.createElement('p');
        description.textContent = shenShaInfo.description;
        description.style.margin = '0';
        descriptionSection.appendChild(description);
        // 创建详细解释部分
        const detailSection = document.createElement('div');
        detailSection.style.marginBottom = '15px';
        modalContent.appendChild(detailSection);
        const detailTitle = document.createElement('h4');
        detailTitle.textContent = '详细解释';
        detailTitle.style.marginTop = '0';
        detailTitle.style.marginBottom = '8px';
        detailSection.appendChild(detailTitle);
        const detailDescription = document.createElement('p');
        detailDescription.textContent = shenShaInfo.detailDescription;
        detailDescription.style.margin = '0';
        detailSection.appendChild(detailDescription);
        // 创建影响领域部分
        if (shenShaInfo.influence && shenShaInfo.influence.length > 0) {
            const influenceSection = document.createElement('div');
            influenceSection.style.marginBottom = '15px';
            modalContent.appendChild(influenceSection);
            const influenceTitle = document.createElement('h4');
            influenceTitle.textContent = '影响领域';
            influenceTitle.style.marginTop = '0';
            influenceTitle.style.marginBottom = '8px';
            influenceSection.appendChild(influenceTitle);
            const influenceTags = document.createElement('div');
            influenceTags.style.display = 'flex';
            influenceTags.style.flexWrap = 'wrap';
            influenceTags.style.gap = '8px';
            shenShaInfo.influence.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag;
                tagElement.style.backgroundColor = 'var(--background-secondary)';
                tagElement.style.padding = '4px 10px';
                tagElement.style.borderRadius = '16px';
                tagElement.style.fontSize = '0.9em';
                influenceTags.appendChild(tagElement);
            });
            influenceSection.appendChild(influenceTags);
        }
        // 创建计算方法部分
        if (shenShaInfo.calculation) {
            const calculationSection = document.createElement('div');
            calculationSection.style.marginBottom = '15px';
            modalContent.appendChild(calculationSection);
            const calculationHeader = document.createElement('div');
            calculationHeader.style.display = 'flex';
            calculationHeader.style.justifyContent = 'space-between';
            calculationHeader.style.alignItems = 'center';
            calculationHeader.style.marginBottom = '8px';
            calculationSection.appendChild(calculationHeader);
            const calculationTitle = document.createElement('h4');
            calculationTitle.textContent = '计算方法';
            calculationTitle.style.marginTop = '0';
            calculationTitle.style.marginBottom = '0';
            calculationHeader.appendChild(calculationTitle);
            // 创建复制按钮
            const copyButton = document.createElement('button');
            copyButton.textContent = '复制计算方法';
            copyButton.style.backgroundColor = 'var(--interactive-accent)';
            copyButton.style.color = 'var(--text-on-accent)';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.fontSize = '0.8em';
            copyButton.style.cursor = 'pointer';
            copyButton.addEventListener('click', () => {
                // 创建一个临时元素来存储纯文本内容
                const tempElement = document.createElement('div');
                tempElement.innerHTML = shenShaInfo.calculation || '';
                const plainText = tempElement.textContent || tempElement.innerText;
                navigator.clipboard.writeText(plainText)
                    .then(() => {
                    copyButton.textContent = '复制成功！';
                    setTimeout(() => {
                        copyButton.textContent = '复制计算方法';
                    }, 2000);
                })
                    .catch(err => {
                    console.error('复制失败:', err);
                    copyButton.textContent = '复制失败';
                    setTimeout(() => {
                        copyButton.textContent = '复制计算方法';
                    }, 2000);
                });
            });
            calculationHeader.appendChild(copyButton);
            const calculationContent = document.createElement('div');
            calculationContent.innerHTML = shenShaInfo.calculation;
            calculationContent.style.backgroundColor = 'var(--background-secondary)';
            calculationContent.style.padding = '10px';
            calculationContent.style.borderRadius = '4px';
            calculationContent.style.fontFamily = 'monospace';
            calculationContent.style.whiteSpace = 'pre-wrap';
            calculationContent.style.overflowX = 'auto';
            calculationContent.style.userSelect = 'text';
            calculationSection.appendChild(calculationContent);
        }
        // 查找相关的神煞组合
        if (this.baziInfo.shenSha && this.baziInfo.shenSha.length > 0) {
            const combinations = ShenShaService.getShenShaCombinationAnalysis(this.baziInfo.shenSha);
            // 移除可能的前缀（如"年柱:"）
            const cleanShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
            // 筛选包含当前神煞的组合，并按级别排序
            const relevantCombinations = combinations.filter(combo => combo.combination.includes(cleanShenSha));
            if (relevantCombinations.length > 0) {
                // 创建相关组合容器
                const combinationsSection = document.createElement('div');
                combinationsSection.style.marginBottom = '15px';
                modalContent.appendChild(combinationsSection);
                const combinationsTitle = document.createElement('h4');
                combinationsTitle.textContent = '相关神煞组合';
                combinationsTitle.style.marginTop = '0';
                combinationsTitle.style.marginBottom = '8px';
                combinationsSection.appendChild(combinationsTitle);
                // 按组合级别排序（4级组合优先显示，然后是3级，最后是2级）
                const sortedCombinations = [...relevantCombinations].sort((a, b) => (b.level || 2) - (a.level || 2));
                // 创建组合列表
                sortedCombinations.forEach(combo => {
                    const comboContainer = document.createElement('div');
                    comboContainer.style.marginBottom = '10px';
                    comboContainer.style.padding = '10px';
                    comboContainer.style.borderRadius = '4px';
                    comboContainer.style.backgroundColor = 'var(--background-secondary)';
                    // 根据组合类型添加不同的样式
                    if (combo.type === 'good') {
                        comboContainer.style.borderLeft = '3px solid #2a9d8f';
                    }
                    else if (combo.type === 'bad') {
                        comboContainer.style.borderLeft = '3px solid #e76f51';
                    }
                    else if (combo.type === 'mixed') {
                        comboContainer.style.borderLeft = '3px solid #e9c46a';
                    }
                    // 创建组合标题
                    const comboTitle = document.createElement('div');
                    comboTitle.style.fontWeight = 'bold';
                    comboTitle.style.marginBottom = '5px';
                    comboTitle.style.display = 'flex';
                    comboTitle.style.justifyContent = 'space-between';
                    comboTitle.style.alignItems = 'center';
                    // 组合名称
                    const comboName = document.createElement('span');
                    comboName.textContent = combo.combination;
                    comboTitle.appendChild(comboName);
                    // 组合级别和类型
                    const comboInfo = document.createElement('div');
                    // 根据组合级别添加不同的标签
                    const levelTag = document.createElement('span');
                    levelTag.style.padding = '2px 6px';
                    levelTag.style.borderRadius = '10px';
                    levelTag.style.fontSize = '0.8em';
                    levelTag.style.marginRight = '5px';
                    if (combo.level === 4) {
                        levelTag.textContent = '四神煞组合';
                        levelTag.style.backgroundColor = 'rgba(75, 0, 130, 0.1)';
                        levelTag.style.color = '#8a2be2';
                        levelTag.style.border = '1px solid #8a2be2';
                    }
                    else if (combo.level === 3) {
                        levelTag.textContent = '三神煞组合';
                        levelTag.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
                        levelTag.style.color = '#0000ff';
                        levelTag.style.border = '1px solid #0000ff';
                    }
                    else {
                        levelTag.textContent = '二神煞组合';
                        levelTag.style.backgroundColor = 'rgba(0, 128, 128, 0.1)';
                        levelTag.style.color = '#008080';
                        levelTag.style.border = '1px solid #008080';
                    }
                    comboInfo.appendChild(levelTag);
                    // 根据组合类型添加不同的标签
                    const typeTag = document.createElement('span');
                    typeTag.style.padding = '2px 6px';
                    typeTag.style.borderRadius = '10px';
                    typeTag.style.fontSize = '0.8em';
                    if (combo.type === 'good') {
                        typeTag.textContent = '吉神组合';
                        typeTag.style.backgroundColor = 'rgba(0, 128, 0, 0.1)';
                        typeTag.style.color = '#2a9d8f';
                        typeTag.style.border = '1px solid #2a9d8f';
                    }
                    else if (combo.type === 'bad') {
                        typeTag.textContent = '凶神组合';
                        typeTag.style.backgroundColor = 'rgba(220, 20, 60, 0.1)';
                        typeTag.style.color = '#e76f51';
                        typeTag.style.border = '1px solid #e76f51';
                    }
                    else if (combo.type === 'mixed') {
                        typeTag.textContent = '吉凶神组合';
                        typeTag.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
                        typeTag.style.color = '#e9c46a';
                        typeTag.style.border = '1px solid #e9c46a';
                    }
                    comboInfo.appendChild(typeTag);
                    comboTitle.appendChild(comboInfo);
                    comboContainer.appendChild(comboTitle);
                    // 创建组合分析
                    const comboAnalysis = document.createElement('div');
                    comboAnalysis.textContent = combo.analysis;
                    comboAnalysis.style.marginBottom = '5px';
                    comboContainer.appendChild(comboAnalysis);
                    // 添加组合来源
                    if (combo.source) {
                        const comboSource = document.createElement('div');
                        comboSource.textContent = '【组合来源】' + combo.source;
                        comboSource.style.fontSize = '0.9em';
                        comboSource.style.color = 'var(--text-muted)';
                        comboSource.style.marginTop = '5px';
                        comboContainer.appendChild(comboSource);
                    }
                    // 添加组合影响
                    if (combo.influence) {
                        const comboInfluence = document.createElement('div');
                        comboInfluence.textContent = '【组合影响】' + combo.influence;
                        comboInfluence.style.fontSize = '0.9em';
                        comboInfluence.style.color = 'var(--text-muted)';
                        comboInfluence.style.marginTop = '5px';
                        comboContainer.appendChild(comboInfluence);
                    }
                    // 添加应对方法
                    if (combo.solution) {
                        const comboSolution = document.createElement('div');
                        comboSolution.textContent = '【应对方法】' + combo.solution;
                        comboSolution.style.fontSize = '0.9em';
                        comboSolution.style.color = 'var(--text-muted)';
                        comboSolution.style.marginTop = '5px';
                        comboContainer.appendChild(comboSolution);
                    }
                    combinationsSection.appendChild(comboContainer);
                });
            }
        }
        // 创建底部按钮区域
        const footerContainer = document.createElement('div');
        footerContainer.style.display = 'flex';
        footerContainer.style.justifyContent = 'flex-end';
        footerContainer.style.marginTop = '20px';
        footerContainer.style.borderTop = '1px solid var(--background-modifier-border)';
        footerContainer.style.paddingTop = '15px';
        modalContent.appendChild(footerContainer);
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.backgroundColor = 'var(--background-modifier-border)';
        closeButton.style.color = 'var(--text-normal)';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.padding = '8px 16px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '1em';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(container);
            document.removeEventListener('keydown', handleKeyDown);
        });
        footerContainer.appendChild(closeButton);
        // 添加关闭事件监听
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                document.body.removeChild(container);
                document.removeEventListener('keydown', handleKeyDown);
            }
        });
        // 监听Escape键
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(container);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
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
    addShenShaInfo(infoList) {
        if (!this.baziInfo.shenSha || this.baziInfo.shenSha.length === 0) {
            return;
        }
        // 创建神煞信息项
        const shenShaItem = infoList.createEl('li', { cls: 'shensha-info-item' });
        shenShaItem.createSpan({ text: '神煞详情: ' });
        // 创建神煞详情容器
        const shenShaContainer = shenShaItem.createDiv({ cls: 'shensha-detail-container' });
        // 创建神煞标签列表
        const shenShaList = document.createElement('div');
        shenShaList.className = 'shensha-list';
        // 分类神煞
        const goodShenSha = [];
        const badShenSha = [];
        const mixedShenSha = [];
        // 处理神煞列表
        this.baziInfo.shenSha.forEach(shenSha => {
            // 获取神煞信息
            const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
            if (shenShaInfo) {
                // 根据类型分类
                if (shenShaInfo.type === '吉神') {
                    goodShenSha.push(shenSha);
                }
                else if (shenShaInfo.type === '凶神') {
                    badShenSha.push(shenSha);
                }
                else {
                    mixedShenSha.push(shenSha);
                }
            }
        });
        // 创建吉神区域
        if (goodShenSha.length > 0) {
            const goodSection = document.createElement('div');
            goodSection.className = 'shensha-section good-section';
            const goodTitle = document.createElement('div');
            goodTitle.className = 'shensha-section-title';
            goodTitle.textContent = '吉神';
            goodSection.appendChild(goodTitle);
            const goodList = document.createElement('div');
            goodList.className = 'shensha-items';
            goodShenSha.forEach(shenSha => {
                const item = document.createElement('span');
                item.className = 'shensha-item good-shensha';
                item.textContent = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
                item.addEventListener('click', () => this.showShenShaExplanation(shenSha));
                // 添加提示
                const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                if (shenShaInfo) {
                    item.title = shenShaInfo.description;
                }
                goodList.appendChild(item);
            });
            goodSection.appendChild(goodList);
            shenShaList.appendChild(goodSection);
        }
        // 创建吉凶神区域
        if (mixedShenSha.length > 0) {
            const mixedSection = document.createElement('div');
            mixedSection.className = 'shensha-section mixed-section';
            const mixedTitle = document.createElement('div');
            mixedTitle.className = 'shensha-section-title';
            mixedTitle.textContent = '吉凶神';
            mixedSection.appendChild(mixedTitle);
            const mixedList = document.createElement('div');
            mixedList.className = 'shensha-items';
            mixedShenSha.forEach(shenSha => {
                const item = document.createElement('span');
                item.className = 'shensha-item mixed-shensha';
                item.textContent = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
                item.addEventListener('click', () => this.showShenShaExplanation(shenSha));
                // 添加提示
                const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                if (shenShaInfo) {
                    item.title = shenShaInfo.description;
                }
                mixedList.appendChild(item);
            });
            mixedSection.appendChild(mixedList);
            shenShaList.appendChild(mixedSection);
        }
        // 创建凶神区域
        if (badShenSha.length > 0) {
            const badSection = document.createElement('div');
            badSection.className = 'shensha-section bad-section';
            const badTitle = document.createElement('div');
            badTitle.className = 'shensha-section-title';
            badTitle.textContent = '凶神';
            badSection.appendChild(badTitle);
            const badList = document.createElement('div');
            badList.className = 'shensha-items';
            badShenSha.forEach(shenSha => {
                const item = document.createElement('span');
                item.className = 'shensha-item bad-shensha';
                item.textContent = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
                item.addEventListener('click', () => this.showShenShaExplanation(shenSha));
                // 添加提示
                const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
                if (shenShaInfo) {
                    item.title = shenShaInfo.description;
                }
                badList.appendChild(item);
            });
            badSection.appendChild(badList);
            shenShaList.appendChild(badSection);
        }
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
      .shensha-list {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .shensha-section {
        border-radius: 6px;
        overflow: hidden;
      }

      .shensha-section-title {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
      }

      .good-section .shensha-section-title {
        background-color: rgba(42, 157, 143, 0.1);
        color: #2a9d8f;
        border-left: 3px solid #2a9d8f;
      }

      .bad-section .shensha-section-title {
        background-color: rgba(231, 111, 81, 0.1);
        color: #e76f51;
        border-left: 3px solid #e76f51;
      }

      .mixed-section .shensha-section-title {
        background-color: rgba(233, 196, 106, 0.1);
        color: #e9c46a;
        border-left: 3px solid #e9c46a;
      }

      .shensha-items {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 6px;
      }

      .shensha-item {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .good-shensha {
        background-color: rgba(42, 157, 143, 0.1);
        color: #2a9d8f;
      }

      .good-shensha:hover {
        background-color: rgba(42, 157, 143, 0.2);
      }

      .bad-shensha {
        background-color: rgba(231, 111, 81, 0.1);
        color: #e76f51;
      }

      .bad-shensha:hover {
        background-color: rgba(231, 111, 81, 0.2);
      }

      .mixed-shensha {
        background-color: rgba(233, 196, 106, 0.1);
        color: #e9c46a;
      }

      .mixed-shensha:hover {
        background-color: rgba(233, 196, 106, 0.2);
      }
    `;
        shenShaContainer.appendChild(style);
        shenShaContainer.appendChild(shenShaList);
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
        let actualCalculation = '';
        try {
            actualCalculation = this.getActualWuXingCalculation(wuXing);
        }
        catch (error) {
            console.error(`计算${wuXing}五行强度时出错:`, error);
        }
        if (!actualCalculation) {
            actualCalculation = wuXingInfo.calculation || `无法计算${wuXing}五行强度，请检查八字信息是否完整。`;
        }
        // 创建计算方法标题和复制按钮
        const calculationHeader = document.createElement('div');
        calculationHeader.className = 'bazi-modal-calculation-header';
        const calculationTitle = document.createElement('strong');
        calculationTitle.textContent = '【计算方法】';
        const copyButton = document.createElement('button');
        copyButton.textContent = '复制计算过程';
        copyButton.className = 'bazi-modal-copy-button';
        copyButton.addEventListener('click', () => {
            // 复制计算过程到剪贴板
            navigator.clipboard.writeText(actualCalculation)
                .then(() => {
                // 显示复制成功提示
                const originalText = copyButton.textContent;
                copyButton.textContent = '复制成功！';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
                .catch(err => {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '复制计算过程';
                }, 2000);
            });
        });
        calculationHeader.appendChild(calculationTitle);
        calculationHeader.appendChild(copyButton);
        // 创建计算过程内容
        const calculationContent = document.createElement('pre');
        calculationContent.style.userSelect = 'text';
        calculationContent.textContent = actualCalculation;
        // 添加计算方法到弹窗
        calculation.appendChild(calculationHeader);
        calculation.appendChild(calculationContent);
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
        // 记录已显示的弹窗，防止重复显示
        this.shownModals.push(modal);
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
            return `无法获取${wuXing}五行强度详情，请更新八字计算引擎。`;
        }
        // 获取五行强度详情
        const details = this.baziInfo.wuXingStrength.details;
        // 检查 details 是否存在
        if (!details) {
            return `无法获取五行强度详情，请检查八字信息是否完整。`;
        }
        // 获取特定五行的详情
        let wuXingDetails = {};
        // 根据五行类型获取对应的详情，并进行空值检查
        switch (wuXing) {
            case '金':
                wuXingDetails = details.jin || {};
                break;
            case '木':
                wuXingDetails = details.mu || {};
                break;
            case '水':
                wuXingDetails = details.shui || {};
                break;
            case '火':
                wuXingDetails = details.huo || {};
                break;
            case '土':
                wuXingDetails = details.tu || {};
                break;
            default: return '';
        }
        // 计算总分
        const wuXingStrength = this.baziInfo.wuXingStrength;
        let total = 0;
        // 确保所有属性存在并且是数字
        if (wuXingStrength) {
            const jin = typeof wuXingStrength.jin === 'number' ? wuXingStrength.jin : 0;
            const mu = typeof wuXingStrength.mu === 'number' ? wuXingStrength.mu : 0;
            const shui = typeof wuXingStrength.shui === 'number' ? wuXingStrength.shui : 0;
            const huo = typeof wuXingStrength.huo === 'number' ? wuXingStrength.huo : 0;
            const tu = typeof wuXingStrength.tu === 'number' ? wuXingStrength.tu : 0;
            total = jin + mu + shui + huo + tu;
        }
        // 构建计算过程
        let calculation = `${wuXing}五行强度实际计算过程：\n\n`;
        // 天干五行
        calculation += `【天干五行】\n`;
        if (wuXingDetails.tianGan && wuXingDetails.tianGan > 0) {
            // 获取八字信息
            const { yearStem, monthStem, dayStem, hourStem } = this.baziInfo;
            // 获取配置中的权重（如果可能）
            let yearWeight = 1.2; // 默认使用优化后的权重
            let monthWeight = 3.0;
            let dayWeight = 3.0;
            let hourWeight = 1.0;
            if (this.getWuXingFromStem(yearStem) === wuXing) {
                calculation += `- 年干${yearStem}为${wuXing}，得分${yearWeight.toFixed(1)}（年干权重）\n`;
            }
            if (this.getWuXingFromStem(monthStem) === wuXing) {
                calculation += `- 月干${monthStem}为${wuXing}，得分${monthWeight.toFixed(1)}（月干权重，提高以强调月令重要性）\n`;
            }
            if (this.getWuXingFromStem(dayStem) === wuXing) {
                calculation += `- 日干${dayStem}为${wuXing}，得分${dayWeight.toFixed(1)}（日干权重，日主最重要）\n`;
            }
            if (this.getWuXingFromStem(hourStem) === wuXing) {
                calculation += `- 时干${hourStem}为${wuXing}，得分${hourWeight.toFixed(1)}（时干权重）\n`;
            }
        }
        // 地支藏干
        calculation += `\n【地支藏干】\n`;
        if (wuXingDetails.diZhiCang && wuXingDetails.diZhiCang > 0) {
            // 获取八字信息
            const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
            const { yearHideGan, monthHideGan, dayHideGan, hourHideGan } = this.baziInfo;
            // 获取配置中的权重（如果可能）
            let yearWeight = 0.8; // 默认使用优化后的权重
            let monthWeight = 2.5;
            let dayWeight = 2.2;
            let hourWeight = 0.7;
            // 藏干内部权重
            const oneGanWeight = [1.0];
            const twoGanWeight = [0.6, 0.4];
            const threeGanWeight = [0.5, 0.3, 0.2];
            if (yearHideGan) {
                const yearHideGanArray = Array.isArray(yearHideGan) ? yearHideGan : yearHideGan.split('');
                calculation += `- 年支${yearBranch}藏干：`;
                // 根据藏干数量选择权重
                const weights = yearHideGanArray.length === 1 ? oneGanWeight :
                    yearHideGanArray.length === 2 ? twoGanWeight : threeGanWeight;
                let hasMatchingGan = false;
                for (let i = 0; i < yearHideGanArray.length; i++) {
                    const gan = yearHideGanArray[i];
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        const ganWeight = weights[i];
                        const score = yearWeight * ganWeight;
                        calculation += `${gan}(${wuXing})得分${score.toFixed(1)}`;
                        if (yearHideGanArray.length > 1) {
                            calculation += `（年支权重${yearWeight.toFixed(1)}×藏干权重${ganWeight.toFixed(1)}）`;
                        }
                        else {
                            calculation += `（年支权重）`;
                        }
                        calculation += `，`;
                        hasMatchingGan = true;
                    }
                }
                calculation = hasMatchingGan ? calculation.slice(0, -1) + '\n' : calculation + '无匹配五行\n';
            }
            if (monthHideGan) {
                const monthHideGanArray = Array.isArray(monthHideGan) ? monthHideGan : monthHideGan.split('');
                calculation += `- 月支${monthBranch}藏干：`;
                // 根据藏干数量选择权重
                const weights = monthHideGanArray.length === 1 ? oneGanWeight :
                    monthHideGanArray.length === 2 ? twoGanWeight : threeGanWeight;
                let hasMatchingGan = false;
                for (let i = 0; i < monthHideGanArray.length; i++) {
                    const gan = monthHideGanArray[i];
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        const ganWeight = weights[i];
                        const score = monthWeight * ganWeight;
                        calculation += `${gan}(${wuXing})得分${score.toFixed(1)}`;
                        if (monthHideGanArray.length > 1) {
                            calculation += `（月支权重${monthWeight.toFixed(1)}×藏干权重${ganWeight.toFixed(1)}）`;
                        }
                        else {
                            calculation += `（月支权重，提高以强调月令重要性）`;
                        }
                        calculation += `，`;
                        hasMatchingGan = true;
                    }
                }
                calculation = hasMatchingGan ? calculation.slice(0, -1) + '\n' : calculation + '无匹配五行\n';
            }
            if (dayHideGan) {
                const dayHideGanArray = Array.isArray(dayHideGan) ? dayHideGan : dayHideGan.split('');
                calculation += `- 日支${dayBranch}藏干：`;
                // 根据藏干数量选择权重
                const weights = dayHideGanArray.length === 1 ? oneGanWeight :
                    dayHideGanArray.length === 2 ? twoGanWeight : threeGanWeight;
                let hasMatchingGan = false;
                for (let i = 0; i < dayHideGanArray.length; i++) {
                    const gan = dayHideGanArray[i];
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        const ganWeight = weights[i];
                        const score = dayWeight * ganWeight;
                        calculation += `${gan}(${wuXing})得分${score.toFixed(1)}`;
                        if (dayHideGanArray.length > 1) {
                            calculation += `（日支权重${dayWeight.toFixed(1)}×藏干权重${ganWeight.toFixed(1)}）`;
                        }
                        else {
                            calculation += `（日支权重）`;
                        }
                        calculation += `，`;
                        hasMatchingGan = true;
                    }
                }
                calculation = hasMatchingGan ? calculation.slice(0, -1) + '\n' : calculation + '无匹配五行\n';
            }
            if (hourHideGan) {
                const hourHideGanArray = Array.isArray(hourHideGan) ? hourHideGan : hourHideGan.split('');
                calculation += `- 时支${hourBranch}藏干：`;
                // 根据藏干数量选择权重
                const weights = hourHideGanArray.length === 1 ? oneGanWeight :
                    hourHideGanArray.length === 2 ? twoGanWeight : threeGanWeight;
                let hasMatchingGan = false;
                for (let i = 0; i < hourHideGanArray.length; i++) {
                    const gan = hourHideGanArray[i];
                    if (this.getWuXingFromStem(gan) === wuXing) {
                        const ganWeight = weights[i];
                        const score = hourWeight * ganWeight;
                        calculation += `${gan}(${wuXing})得分${score.toFixed(1)}`;
                        if (hourHideGanArray.length > 1) {
                            calculation += `（时支权重${hourWeight.toFixed(1)}×藏干权重${ganWeight.toFixed(1)}）`;
                        }
                        else {
                            calculation += `（时支权重）`;
                        }
                        calculation += `，`;
                        hasMatchingGan = true;
                    }
                }
                calculation = hasMatchingGan ? calculation.slice(0, -1) + '\n' : calculation + '无匹配五行\n';
            }
        }
        // 纳音五行
        calculation += `\n【纳音五行】\n`;
        if (wuXingDetails.naYin && wuXingDetails.naYin > 0) {
            // 获取八字信息
            const { yearNaYin, monthNaYin, dayNaYin, hourNaYin } = this.baziInfo;
            // 获取配置中的权重（如果可能）
            let yearWeight = 0.6; // 默认使用优化后的权重
            let monthWeight = 2.0;
            let dayWeight = 1.5;
            let hourWeight = 0.5;
            if (yearNaYin && yearNaYin.includes(wuXing)) {
                calculation += `- 年柱纳音${yearNaYin}为${wuXing}，得分${yearWeight.toFixed(1)}（年柱纳音权重）\n`;
            }
            if (monthNaYin && monthNaYin.includes(wuXing)) {
                calculation += `- 月柱纳音${monthNaYin}为${wuXing}，得分${monthWeight.toFixed(1)}（月柱纳音权重，提高以强调月令重要性）\n`;
            }
            if (dayNaYin && dayNaYin.includes(wuXing)) {
                calculation += `- 日柱纳音${dayNaYin}为${wuXing}，得分${dayWeight.toFixed(1)}（日柱纳音权重）\n`;
            }
            if (hourNaYin && hourNaYin.includes(wuXing)) {
                calculation += `- 时柱纳音${hourNaYin}为${wuXing}，得分${hourWeight.toFixed(1)}（时柱纳音权重）\n`;
            }
        }
        // 季节调整
        calculation += `\n【季节调整】\n`;
        const { monthBranch } = this.baziInfo;
        const season = this.getSeason(monthBranch);
        calculation += `- 当前季节：${season}\n`;
        // 获取配置中的权重（如果可能）
        const seasonAdjust = {
            wang: 2.5,
            xiang: 1.2,
            ping: 0.0,
            qiu: -1.2,
            si: -1.8 // 死系数（从-1.5增强到-1.8）
        };
        if (wuXingDetails.season !== undefined && wuXingDetails.season !== 0) {
            switch (season) {
                case '春季':
                    if (wuXing === '木')
                        calculation += `- 春季木旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
                    if (wuXing === '火')
                        calculation += `- 春季火相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
                    if (wuXing === '土')
                        calculation += `- 春季土平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
                    if (wuXing === '金')
                        calculation += `- 春季金囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
                    if (wuXing === '水')
                        calculation += `- 春季水死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
                    break;
                case '夏季':
                    if (wuXing === '火')
                        calculation += `- 夏季火旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
                    if (wuXing === '土')
                        calculation += `- 夏季土相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
                    if (wuXing === '金')
                        calculation += `- 夏季金平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
                    if (wuXing === '水')
                        calculation += `- 夏季水囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
                    if (wuXing === '木')
                        calculation += `- 夏季木死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
                    break;
                case '秋季':
                    if (wuXing === '金')
                        calculation += `- 秋季金旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
                    if (wuXing === '水')
                        calculation += `- 秋季水相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
                    if (wuXing === '木')
                        calculation += `- 秋季木平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
                    if (wuXing === '火')
                        calculation += `- 秋季火囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
                    if (wuXing === '土')
                        calculation += `- 秋季土死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
                    break;
                case '冬季':
                    if (wuXing === '水')
                        calculation += `- 冬季水旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
                    if (wuXing === '木')
                        calculation += `- 冬季木相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
                    if (wuXing === '火')
                        calculation += `- 冬季火平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
                    if (wuXing === '土')
                        calculation += `- 冬季土囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
                    if (wuXing === '金')
                        calculation += `- 冬季金死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
                    break;
            }
        }
        // 月令当令加成
        calculation += `\n【月令当令加成】\n`;
        // 获取配置中的权重（如果可能）
        const monthDominantBonus = {
            dominant: 2.0,
            related: 1.0,
            neutral: 0.0,
            weak: -0.5,
            dead: -0.8 // 死加成（新增）
        };
        // 显示月令当令加成
        if (wuXingDetails.monthDominant !== undefined && wuXingDetails.monthDominant !== 0) {
            switch (season) {
                case '春季':
                    if (wuXing === '木')
                        calculation += `- 春季木当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
                    if (wuXing === '火')
                        calculation += `- 春季火相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
                    if (wuXing === '土')
                        calculation += `- 春季土平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
                    if (wuXing === '金')
                        calculation += `- 春季金囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
                    if (wuXing === '水')
                        calculation += `- 春季水死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
                    break;
                case '夏季':
                    if (wuXing === '火')
                        calculation += `- 夏季火当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
                    if (wuXing === '土')
                        calculation += `- 夏季土相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
                    if (wuXing === '金')
                        calculation += `- 夏季金平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
                    if (wuXing === '水')
                        calculation += `- 夏季水囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
                    if (wuXing === '木')
                        calculation += `- 夏季木死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
                    break;
                case '秋季':
                    if (wuXing === '金')
                        calculation += `- 秋季金当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
                    if (wuXing === '水')
                        calculation += `- 秋季水相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
                    if (wuXing === '木')
                        calculation += `- 秋季木平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
                    if (wuXing === '火')
                        calculation += `- 秋季火囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
                    if (wuXing === '土')
                        calculation += `- 秋季土死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
                    break;
                case '冬季':
                    if (wuXing === '水')
                        calculation += `- 冬季水当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
                    if (wuXing === '木')
                        calculation += `- 冬季木相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
                    if (wuXing === '火')
                        calculation += `- 冬季火平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
                    if (wuXing === '土')
                        calculation += `- 冬季土囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
                    if (wuXing === '金')
                        calculation += `- 冬季金死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
                    break;
            }
        }
        // 组合调整
        calculation += `\n【组合调整】\n`;
        // 获取配置中的权重（如果可能）
        const combinationWeight = {
            tianGanWuHe: 0.8,
            diZhiSanHe: 1.5,
            diZhiSanHui: 1.2,
            partialSanHe: 0.9,
            partialSanHui: 0.7 // 部分三会权重（新增，为完整三会的60%）
        };
        if (wuXingDetails.combination && wuXingDetails.combination > 0) {
            // 天干五合
            const tianGanWuHe = this.checkTianGanWuHe();
            if (tianGanWuHe) {
                const heWuXing = this.getWuXingFromWuHe(tianGanWuHe);
                if (heWuXing === wuXing) {
                    calculation += `- 天干五合：${tianGanWuHe}合化${wuXing}，得分+${combinationWeight.tianGanWuHe.toFixed(1)}（天干五合权重，提高以增强组合影响）\n`;
                }
            }
            // 地支三合
            const diZhiSanHe = this.checkDiZhiSanHe();
            if (diZhiSanHe) {
                const heWuXing = this.getWuXingFromSanHe(diZhiSanHe);
                if (heWuXing === wuXing) {
                    // 检查是完整三合还是部分三合
                    const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
                    const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined);
                    // 根据三合类型获取对应的地支
                    const sanHePatterns = {
                        '寅午戌': ['寅', '午', '戌'],
                        '申子辰': ['申', '子', '辰'],
                        '亥卯未': ['亥', '卯', '未'],
                        '巳酉丑': ['巳', '酉', '丑']
                    };
                    const pattern = sanHePatterns[diZhiSanHe];
                    if (pattern) {
                        const matchedBranches = branches.filter(branch => pattern.includes(branch));
                        const uniqueBranches = new Set(matchedBranches);
                        if (uniqueBranches.size === 3) {
                            // 完整三合
                            calculation += `- 地支三合：${diZhiSanHe}三合${wuXing}局（完整），得分+${combinationWeight.diZhiSanHe.toFixed(1)}（地支三合权重，提高以增强组合影响）\n`;
                        }
                        else {
                            // 部分三合
                            calculation += `- 地支三合：${diZhiSanHe}三合${wuXing}局（部分），得分+${combinationWeight.partialSanHe.toFixed(1)}（部分三合权重，新增区分完整度）\n`;
                        }
                    }
                }
            }
            // 地支三会
            const diZhiSanHui = this.checkDiZhiSanHui();
            if (diZhiSanHui) {
                const heWuXing = this.getWuXingFromSanHui(diZhiSanHui);
                if (heWuXing === wuXing) {
                    // 检查是完整三会还是部分三会
                    const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
                    const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined);
                    // 根据三会类型获取对应的地支
                    const sanHuiPatterns = {
                        '寅卯辰': ['寅', '卯', '辰'],
                        '巳午未': ['巳', '午', '未'],
                        '申酉戌': ['申', '酉', '戌'],
                        '亥子丑': ['亥', '子', '丑']
                    };
                    const pattern = sanHuiPatterns[diZhiSanHui];
                    if (pattern) {
                        const matchedBranches = branches.filter(branch => pattern.includes(branch));
                        const uniqueBranches = new Set(matchedBranches);
                        if (uniqueBranches.size === 3) {
                            // 完整三会
                            calculation += `- 地支三会：${diZhiSanHui}三会${wuXing}局（完整），得分+${combinationWeight.diZhiSanHui.toFixed(1)}（地支三会权重，提高以增强组合影响）\n`;
                        }
                        else {
                            // 部分三会
                            calculation += `- 地支三会：${diZhiSanHui}三会${wuXing}局（部分），得分+${combinationWeight.partialSanHui.toFixed(1)}（部分三会权重，新增区分完整度）\n`;
                        }
                    }
                }
            }
        }
        // 总结
        calculation += `\n【总分计算】\n`;
        // 各项得分明细
        calculation += `- ${wuXing}五行各项得分：\n`;
        calculation += `  • 天干五行：${wuXingDetails.tianGan ? wuXingDetails.tianGan.toFixed(2) : '0.00'}\n`;
        calculation += `  • 地支藏干：${wuXingDetails.diZhiCang ? wuXingDetails.diZhiCang.toFixed(2) : '0.00'}\n`;
        calculation += `  • 纳音五行：${wuXingDetails.naYin ? wuXingDetails.naYin.toFixed(2) : '0.00'}\n`;
        calculation += `  • 季节调整：${wuXingDetails.season ? wuXingDetails.season.toFixed(2) : '0.00'}\n`;
        calculation += `  • 月令加成：${wuXingDetails.monthDominant ? wuXingDetails.monthDominant.toFixed(2) : '0.00'}\n`;
        calculation += `  • 组合调整：${wuXingDetails.combination ? wuXingDetails.combination.toFixed(2) : '0.00'}\n`;
        // 总分和相对强度
        const totalScore = wuXingDetails.total || 0;
        calculation += `- ${wuXing}五行总得分：${totalScore.toFixed(2)}\n`;
        calculation += `- 所有五行总得分：${total.toFixed(2)}\n`;
        // 计算相对强度，避免除以零
        let relativeStrength = 0;
        if (total > 0) {
            relativeStrength = totalScore / total * 10;
        }
        calculation += `- ${wuXing}五行相对强度：${totalScore.toFixed(2)} / ${total.toFixed(2)} * 10 = ${relativeStrength.toFixed(2)}\n`;
        // 权重分配说明
        calculation += `\n【权重分配说明】\n`;
        calculation += `- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性\n`;
        calculation += `- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性\n`;
        calculation += `- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性\n`;
        calculation += `- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响\n`;
        calculation += `- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响\n`;
        calculation += `- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度\n`;
        return calculation;
    }
    /**
     * 显示日主旺衰详细解释（带计算过程）
     * @param riZhu 日主旺衰状态
     * @param wuXing 日主五行
     */
    showRiZhuCalculation(riZhu, wuXing) {
        console.log('showRiZhuCalculation 被调用', riZhu, wuXing);
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
        let actualCalculation = '';
        try {
            actualCalculation = this.getActualRiZhuCalculation(riZhu, wuXing);
        }
        catch (error) {
            console.error(`计算${wuXing}日主${riZhu}时出错:`, error);
        }
        if (!actualCalculation) {
            actualCalculation = riZhuInfo.calculation || `无法计算${wuXing}日主${riZhu}，请检查八字信息是否完整。`;
        }
        // 创建计算方法标题和复制按钮
        const calculationHeader = document.createElement('div');
        calculationHeader.className = 'bazi-modal-calculation-header';
        const calculationTitle = document.createElement('strong');
        calculationTitle.textContent = '【计算方法】';
        const copyButton = document.createElement('button');
        copyButton.textContent = '复制计算过程';
        copyButton.className = 'bazi-modal-copy-button';
        copyButton.addEventListener('click', () => {
            // 复制计算过程到剪贴板
            navigator.clipboard.writeText(actualCalculation)
                .then(() => {
                // 显示复制成功提示
                const originalText = copyButton.textContent;
                copyButton.textContent = '复制成功！';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
                .catch(err => {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '复制计算过程';
                }, 2000);
            });
        });
        calculationHeader.appendChild(calculationTitle);
        calculationHeader.appendChild(copyButton);
        // 创建计算过程内容
        const calculationContent = document.createElement('pre');
        calculationContent.style.userSelect = 'text';
        calculationContent.textContent = actualCalculation;
        // 添加计算方法到弹窗
        calculation.appendChild(calculationHeader);
        calculation.appendChild(calculationContent);
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
        // 基本信息
        calculation += `【基本信息】\n`;
        calculation += `- 日主五行：${wuXing.charAt(0)}\n`; // 只取第一个字符，避免显示"火火"
        calculation += `- 所处季节：${details.season || '未知'}\n\n`;
        // 五行强度分析
        calculation += `【五行强度分析】\n`;
        if (this.baziInfo.wuXingStrength) {
            const wuXingStrength = this.baziInfo.wuXingStrength;
            calculation += `- 金五行强度：${wuXingStrength.jin.toFixed(2)}\n`;
            calculation += `- 木五行强度：${wuXingStrength.mu.toFixed(2)}\n`;
            calculation += `- 水五行强度：${wuXingStrength.shui.toFixed(2)}\n`;
            calculation += `- 火五行强度：${wuXingStrength.huo.toFixed(2)}\n`;
            calculation += `- 土五行强度：${wuXingStrength.tu.toFixed(2)}\n\n`;
        }
        // 日主五行强度
        calculation += `【日主五行强度】\n`;
        let dayWuXingStrength = 0;
        if (this.baziInfo.wuXingStrength) {
            const wuXingStrength = this.baziInfo.wuXingStrength;
            switch (wuXing) {
                case '金':
                    dayWuXingStrength = wuXingStrength.jin;
                    break;
                case '木':
                    dayWuXingStrength = wuXingStrength.mu;
                    break;
                case '水':
                    dayWuXingStrength = wuXingStrength.shui;
                    break;
                case '火':
                    dayWuXingStrength = wuXingStrength.huo;
                    break;
                case '土':
                    dayWuXingStrength = wuXingStrength.tu;
                    break;
            }
            calculation += `- 日主${wuXing}五行强度：${dayWuXingStrength.toFixed(2)}\n\n`;
        }
        // 日主旺衰判断
        calculation += `【日主旺衰判断】\n`;
        if (details.judgmentRules) {
            calculation += `${details.judgmentRules}\n\n`;
        }
        else {
            calculation += `- 极旺：相对强度 ≥ 1.5\n`;
            calculation += `- 旺：1.2 ≤ 相对强度 < 1.5\n`;
            calculation += `- 偏旺：1.0 ≤ 相对强度 < 1.2\n`;
            calculation += `- 平衡：0.8 ≤ 相对强度 < 1.0\n`;
            calculation += `- 偏弱：0.6 ≤ 相对强度 < 0.8\n`;
            calculation += `- 弱：0.4 ≤ 相对强度 < 0.6\n`;
            calculation += `- 极弱：相对强度 < 0.4\n\n`;
        }
        // 计算结果
        calculation += `【计算结果】\n`;
        if (details.relativeStrength) {
            calculation += `- 日主相对强度：${details.relativeStrength.toFixed(2)}\n`;
        }
        calculation += `- 日主旺衰判断：${riZhu}\n\n`;
        // 用神建议
        calculation += `【用神建议】\n`;
        if (details.recommendation) {
            calculation += `${details.recommendation}\n`;
        }
        else {
            switch (riZhu) {
                case '极旺':
                case '旺':
                    calculation += `- 日主过旺，喜用泄秀之物（财星、官星）来泄其过旺之气。忌用印比之物，以免更加旺盛。\n`;
                    break;
                case '偏旺':
                    calculation += `- 日主偏旺，喜用泄秀之物，但不宜过多。可适当用印比之物调和。\n`;
                    break;
                case '平衡':
                    calculation += `- 日主平衡，根据具体情况，可取印比或财官。需要综合考虑八字格局。\n`;
                    break;
                case '偏弱':
                    calculation += `- 日主偏弱，喜用生扶之物（印星、比劫）来增强日主力量。忌用泄秀之物，以免更加衰弱。\n`;
                    break;
                case '弱':
                case '极弱':
                    calculation += `- 日主衰弱，喜用生扶之物（印星、比劫）来增强日主力量。忌用泄秀之物，以免更加衰弱。\n`;
                    break;
            }
        }
        return calculation;
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
        const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined);
        // 检查三合
        const sanHePatterns = [
            { pattern: ['子', '申', '辰'], type: '子申辰' },
            { pattern: ['亥', '卯', '未'], type: '亥卯未' },
            { pattern: ['寅', '午', '戌'], type: '寅午戌' },
            { pattern: ['巳', '酉', '丑'], type: '巳酉丑' }
        ];
        for (const { pattern, type } of sanHePatterns) {
            // 收集实际出现的地支
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            // 检查是否至少有两个不同的地支
            const uniqueBranches = new Set(matchedBranches);
            if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三合
                return type;
            }
        }
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
    /**
     * 显示日主旺衰详细解释
     * @param riZhuStrength 日主旺衰
     * @param dayWuXing 日主五行
     */
    showRiZhuExplanation(riZhuStrength, dayWuXing) {
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `日主旺衰详解：${riZhuStrength}`;
        title.className = 'bazi-modal-title';
        // 创建五行类型
        const type = document.createElement('div');
        type.textContent = `日主五行：${dayWuXing}`;
        type.className = `bazi-modal-type bazi-modal-type-${this.getWuXingClassFromName(dayWuXing)}`;
        // 创建解释
        const explanationTitle = document.createElement('h4');
        explanationTitle.textContent = '旺衰说明';
        explanationTitle.className = 'bazi-modal-section-title';
        const explanationText = document.createElement('div');
        explanationText.textContent = this.getRiZhuInfluence(riZhuStrength);
        explanationText.className = 'bazi-modal-explanation';
        // 创建用神建议
        const yongShenTitle = document.createElement('h4');
        yongShenTitle.textContent = '用神建议';
        yongShenTitle.className = 'bazi-modal-section-title';
        const yongShenText = document.createElement('div');
        let yongShenSuggestion = '';
        if (riZhuStrength === '极旺' || riZhuStrength === '旺' || riZhuStrength === '偏旺') {
            yongShenSuggestion = '日主旺盛，宜取官杀、财星、食伤为用神，以泄秀日主之气。忌用印星、比劫，以免日主更加旺盛。';
        }
        else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
            yongShenSuggestion = '日主衰弱，宜取印星、比劫为用神，以生扶日主之气。忌用官杀、财星，以免日主更加衰弱。';
        }
        else {
            yongShenSuggestion = '日主平衡，需根据八字特点选择用神。可参考月令当令的五行或八字中最有力的五行作为用神。';
        }
        yongShenText.textContent = yongShenSuggestion;
        yongShenText.className = 'bazi-modal-yongshen-explanation';
        // 创建格局建议
        const geJuTitle = document.createElement('h4');
        geJuTitle.textContent = '格局建议';
        geJuTitle.className = 'bazi-modal-section-title';
        const geJuText = document.createElement('div');
        let geJuSuggestion = '';
        if (riZhuStrength === '极旺' || riZhuStrength === '旺' || riZhuStrength === '偏旺') {
            geJuSuggestion = '日主旺盛，适合形成七杀格、正官格、正财格、偏财格、食神格、伤官格等泄秀日主之格局。';
        }
        else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
            geJuSuggestion = '日主衰弱，适合形成正印格、偏印格、比肩格、劫财格等生扶日主之格局。';
        }
        else {
            geJuSuggestion = '日主平衡，可根据八字特点形成适合的格局。需综合考虑月令、大运、流年等因素。';
        }
        geJuText.textContent = geJuSuggestion;
        geJuText.className = 'bazi-modal-geju-suggestion';
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 组装弹窗内容
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(explanationTitle);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(yongShenTitle);
        modalContent.appendChild(yongShenText);
        modalContent.appendChild(geJuTitle);
        modalContent.appendChild(geJuText);
        modalContent.appendChild(closeButton);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 显示格局详细解释
     * @param geJu 格局名称
     */
    showGeJuExplanation(geJu) {
        // 获取格局详细信息
        const geJuInfo = GeJuService.getGeJuExplanation(geJu);
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = geJuInfo.name;
        title.className = 'bazi-modal-title';
        // 创建类型
        const type = document.createElement('div');
        let typeText = '';
        switch (geJuInfo.type) {
            case 'good':
                typeText = '吉格';
                break;
            case 'bad':
                typeText = '凶格';
                break;
            case 'mixed':
                typeText = '吉凶参半';
                break;
            default:
                typeText = '中性';
        }
        type.textContent = `类型: ${typeText}`;
        type.className = `bazi-modal-type bazi-modal-type-${geJuInfo.type}`;
        // 创建解释
        const explanationTitle = document.createElement('h4');
        explanationTitle.textContent = '格局解释';
        explanationTitle.className = 'bazi-modal-section-title';
        const explanationText = document.createElement('div');
        explanationText.textContent = geJuInfo.explanation;
        explanationText.className = 'bazi-modal-explanation';
        // 创建影响
        const influenceTitle = document.createElement('h4');
        influenceTitle.textContent = '性格影响';
        influenceTitle.className = 'bazi-modal-section-title';
        const influence = document.createElement('div');
        influence.textContent = geJuInfo.influence;
        influence.className = 'bazi-modal-influence';
        // 创建职业建议
        const careerTitle = document.createElement('h4');
        careerTitle.textContent = '职业建议';
        careerTitle.className = 'bazi-modal-section-title';
        const career = document.createElement('div');
        career.textContent = geJuInfo.career;
        career.className = 'bazi-modal-career';
        // 创建健康建议
        const healthTitle = document.createElement('h4');
        healthTitle.textContent = '健康建议';
        healthTitle.className = 'bazi-modal-section-title';
        const health = document.createElement('div');
        health.textContent = geJuInfo.health;
        health.className = 'bazi-modal-health';
        // 创建人际关系建议
        const relationshipTitle = document.createElement('h4');
        relationshipTitle.textContent = '人际关系';
        relationshipTitle.className = 'bazi-modal-section-title';
        const relationship = document.createElement('div');
        relationship.textContent = geJuInfo.relationship;
        relationship.className = 'bazi-modal-relationship';
        // 创建财运建议
        const wealthTitle = document.createElement('h4');
        wealthTitle.textContent = '财运建议';
        wealthTitle.className = 'bazi-modal-section-title';
        const wealth = document.createElement('div');
        wealth.textContent = geJuInfo.wealth;
        wealth.className = 'bazi-modal-wealth';
        // 创建来源
        const sourceTitle = document.createElement('h4');
        sourceTitle.textContent = '理论来源';
        sourceTitle.className = 'bazi-modal-section-title';
        const source = document.createElement('div');
        source.textContent = geJuInfo.source || '传统命理学';
        source.className = 'bazi-modal-source';
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 组装弹窗内容
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(explanationTitle);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(influenceTitle);
        modalContent.appendChild(influence);
        modalContent.appendChild(careerTitle);
        modalContent.appendChild(career);
        modalContent.appendChild(healthTitle);
        modalContent.appendChild(health);
        modalContent.appendChild(relationshipTitle);
        modalContent.appendChild(relationship);
        modalContent.appendChild(wealthTitle);
        modalContent.appendChild(wealth);
        modalContent.appendChild(sourceTitle);
        modalContent.appendChild(source);
        modalContent.appendChild(closeButton);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 显示格局分析
     * @param geJu 格局名称
     * @param riZhuStrength 日主旺衰
     */
    showGeJuAnalysis(geJu, riZhuStrength) {
        // 获取格局分析
        const analysis = GeJuService.analyzeGeJu(geJu, riZhuStrength);
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `${geJu}分析`;
        title.className = 'bazi-modal-title';
        // 创建类型
        const type = document.createElement('div');
        let typeText = '';
        switch (analysis.level) {
            case 'good':
                typeText = '吉';
                break;
            case 'bad':
                typeText = '凶';
                break;
            case 'mixed':
                typeText = '吉凶参半';
                break;
            default:
                typeText = '中性';
        }
        type.textContent = `综合评价: ${typeText}`;
        type.className = `bazi-modal-type bazi-modal-type-${analysis.level}`;
        // 创建分析
        const analysisTitle = document.createElement('h4');
        analysisTitle.textContent = '格局分析';
        analysisTitle.className = 'bazi-modal-section-title';
        const analysisText = document.createElement('div');
        analysisText.textContent = analysis.analysis;
        analysisText.className = 'bazi-modal-analysis';
        // 创建建议
        const suggestionTitle = document.createElement('h4');
        suggestionTitle.textContent = '发展建议';
        suggestionTitle.className = 'bazi-modal-section-title';
        const suggestion = document.createElement('div');
        suggestion.textContent = analysis.suggestion;
        suggestion.className = 'bazi-modal-suggestion';
        // 创建日主旺衰信息
        const riZhuTitle = document.createElement('h4');
        riZhuTitle.textContent = '日主旺衰';
        riZhuTitle.className = 'bazi-modal-section-title';
        const riZhuText = document.createElement('div');
        riZhuText.textContent = `日主${riZhuStrength}`;
        riZhuText.className = 'bazi-modal-rizhu';
        // 创建趋势分析按钮
        const trendButton = document.createElement('button');
        trendButton.textContent = '查看格局趋势';
        trendButton.className = 'bazi-modal-trend-button';
        trendButton.addEventListener('click', () => {
            // 关闭当前弹窗
            document.body.removeChild(modal);
            // 显示格局趋势分析
            this.showGeJuTrendAnalysis(geJu, this.baziInfo.dayWuXing || '');
        });
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'bazi-modal-button-container';
        buttonContainer.appendChild(trendButton);
        buttonContainer.appendChild(closeButton);
        // 组装弹窗内容
        modalContent.appendChild(title);
        modalContent.appendChild(type);
        modalContent.appendChild(analysisTitle);
        modalContent.appendChild(analysisText);
        modalContent.appendChild(suggestionTitle);
        modalContent.appendChild(suggestion);
        modalContent.appendChild(riZhuTitle);
        modalContent.appendChild(riZhuText);
        modalContent.appendChild(buttonContainer);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 显示格局形成因素
     */
    showGeJuFactors() {
        if (!this.baziInfo.geJuFactors || this.baziInfo.geJuFactors.length === 0) {
            console.error('没有格局形成因素信息');
            return;
        }
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `${this.baziInfo.geJu}形成因素`;
        title.className = 'bazi-modal-title';
        // 创建格局强度信息
        if (this.baziInfo.geJuStrength) {
            const strengthValue = typeof this.baziInfo.geJuStrength === 'number'
                ? this.baziInfo.geJuStrength
                : parseInt(this.baziInfo.geJuStrength);
            if (!isNaN(strengthValue)) {
                const strengthInfo = document.createElement('div');
                strengthInfo.className = 'bazi-modal-strength-info';
                const strengthText = document.createElement('span');
                strengthText.textContent = `格局强度: ${strengthValue}%`;
                strengthText.className = 'bazi-modal-strength-text';
                // 创建进度条
                const progressContainer = document.createElement('div');
                progressContainer.className = 'bazi-modal-progress-container';
                const progressBar = document.createElement('div');
                progressBar.className = 'bazi-modal-progress-bar';
                progressBar.style.width = `${strengthValue}%`;
                // 根据强度值设置颜色
                if (strengthValue >= 80) {
                    progressBar.classList.add('bazi-progress-high');
                }
                else if (strengthValue >= 60) {
                    progressBar.classList.add('bazi-progress-medium');
                }
                else {
                    progressBar.classList.add('bazi-progress-low');
                }
                progressContainer.appendChild(progressBar);
                strengthInfo.appendChild(strengthText);
                strengthInfo.appendChild(progressContainer);
                modalContent.appendChild(strengthInfo);
            }
        }
        // 创建因素列表
        const factorsTitle = document.createElement('h4');
        factorsTitle.textContent = '形成因素';
        factorsTitle.className = 'bazi-modal-section-title';
        modalContent.appendChild(factorsTitle);
        const factorsList = document.createElement('div');
        factorsList.className = 'bazi-modal-factors-list';
        // 按贡献度排序
        const sortedFactors = [...this.baziInfo.geJuFactors].sort((a, b) => b.contribution - a.contribution);
        sortedFactors.forEach(factor => {
            const factorItem = document.createElement('div');
            factorItem.className = 'bazi-modal-factor-item';
            // 创建因素标题
            const factorHeader = document.createElement('div');
            factorHeader.className = 'bazi-modal-factor-header';
            const factorName = document.createElement('span');
            factorName.textContent = factor.factor;
            factorName.className = 'bazi-modal-factor-name';
            const factorContribution = document.createElement('span');
            factorContribution.textContent = `${factor.contribution}%`;
            factorContribution.className = 'bazi-modal-factor-contribution';
            factorHeader.appendChild(factorName);
            factorHeader.appendChild(factorContribution);
            // 创建因素描述
            const factorDescription = document.createElement('div');
            factorDescription.textContent = factor.description;
            factorDescription.className = 'bazi-modal-factor-description';
            // 创建因素进度条
            const factorProgressContainer = document.createElement('div');
            factorProgressContainer.className = 'bazi-modal-factor-progress-container';
            const factorProgressBar = document.createElement('div');
            factorProgressBar.className = 'bazi-modal-factor-progress-bar';
            factorProgressBar.style.width = `${factor.contribution * 2}%`; // 乘以2使进度条更明显
            factorProgressContainer.appendChild(factorProgressBar);
            // 组装因素项
            factorItem.appendChild(factorHeader);
            factorItem.appendChild(factorDescription);
            factorItem.appendChild(factorProgressContainer);
            factorsList.appendChild(factorItem);
        });
        modalContent.appendChild(factorsList);
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modalContent.appendChild(closeButton);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 显示格局趋势分析
     * @param geJu 格局名称
     * @param riZhuWuXing 日主五行
     */
    showGeJuTrendAnalysis(geJu, riZhuWuXing) {
        if (!this.baziInfo.birthYear) {
            console.error('缺少出生年份信息，无法分析格局趋势');
            return;
        }
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal bazi-modal-large';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `${geJu}趋势分析`;
        title.className = 'bazi-modal-title';
        // 创建说明
        const description = document.createElement('div');
        description.textContent = `以下是${geJu}在未来20年的发展趋势分析，包括大运和流年对格局的影响。`;
        description.className = 'bazi-modal-description';
        // 创建大运信息
        const daYunTitle = document.createElement('h4');
        daYunTitle.textContent = '大运信息';
        daYunTitle.className = 'bazi-modal-section-title';
        // 获取大运信息
        const daYunList = this.getDaYunList();
        const daYunInfo = document.createElement('div');
        daYunInfo.className = 'bazi-modal-dayun-info';
        if (daYunList.length > 0) {
            const daYunTable = document.createElement('table');
            daYunTable.className = 'bazi-modal-dayun-table';
            // 创建表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['大运', '开始年份', '结束年份', '对格局影响'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            daYunTable.appendChild(thead);
            // 创建表体
            const tbody = document.createElement('tbody');
            daYunList.forEach(daYun => {
                const row = document.createElement('tr');
                // 大运干支
                const ganZhiCell = document.createElement('td');
                ganZhiCell.textContent = daYun.ganZhi;
                row.appendChild(ganZhiCell);
                // 开始年份
                const startYearCell = document.createElement('td');
                startYearCell.textContent = daYun.startYear.toString();
                row.appendChild(startYearCell);
                // 结束年份
                const endYearCell = document.createElement('td');
                endYearCell.textContent = daYun.endYear.toString();
                row.appendChild(endYearCell);
                // 对格局影响
                const effectCell = document.createElement('td');
                const effect = GeJuService.analyzeDaYunEffect(geJu, daYun.ganZhi, riZhuWuXing);
                // 根据影响级别设置颜色
                let effectClass = '';
                switch (effect.level) {
                    case 'good':
                        effectClass = 'bazi-effect-good';
                        break;
                    case 'bad':
                        effectClass = 'bazi-effect-bad';
                        break;
                    case 'mixed':
                        effectClass = 'bazi-effect-mixed';
                        break;
                    default:
                        effectClass = 'bazi-effect-neutral';
                }
                effectCell.textContent = effect.effect;
                effectCell.className = effectClass;
                row.appendChild(effectCell);
                tbody.appendChild(row);
            });
            daYunTable.appendChild(tbody);
            daYunInfo.appendChild(daYunTable);
        }
        else {
            daYunInfo.textContent = '无法获取大运信息，请确保八字信息完整。';
        }
        // 创建趋势图容器
        const chartTitle = document.createElement('h4');
        chartTitle.textContent = '格局趋势图';
        chartTitle.className = 'bazi-modal-section-title';
        const chartContainer = document.createElement('div');
        chartContainer.className = 'bazi-modal-chart-container';
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        chartContainer.style.marginBottom = '20px';
        // 创建趋势分析
        const trendAnalysisTitle = document.createElement('h4');
        trendAnalysisTitle.textContent = '趋势分析';
        trendAnalysisTitle.className = 'bazi-modal-section-title';
        const trendAnalysis = document.createElement('div');
        trendAnalysis.className = 'bazi-modal-trend-analysis';
        // 获取趋势数据
        const trendData = GeJuTrendService.generateTrendData(geJu, riZhuWuXing, parseInt(this.baziInfo.birthYear), daYunList);
        // 设置趋势分析内容
        trendAnalysis.textContent = trendData.analysis;
        // 创建关键年份信息
        const keyYearsTitle = document.createElement('h4');
        keyYearsTitle.textContent = '关键年份';
        keyYearsTitle.className = 'bazi-modal-section-title';
        const keyYearsInfo = document.createElement('div');
        keyYearsInfo.className = 'bazi-modal-key-years';
        if (trendData.keyYears.length > 0) {
            const keyYearsTable = document.createElement('table');
            keyYearsTable.className = 'bazi-modal-key-years-table';
            // 创建表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['年份', '事件', '影响'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            keyYearsTable.appendChild(thead);
            // 创建表体
            const tbody = document.createElement('tbody');
            trendData.keyYears.forEach(keyYear => {
                const row = document.createElement('tr');
                // 年份
                const yearCell = document.createElement('td');
                yearCell.textContent = keyYear.year.toString();
                row.appendChild(yearCell);
                // 事件
                const eventCell = document.createElement('td');
                eventCell.textContent = keyYear.event;
                row.appendChild(eventCell);
                // 影响
                const levelCell = document.createElement('td');
                // 根据影响级别设置颜色
                let levelClass = '';
                let levelText = '';
                switch (keyYear.level) {
                    case 'good':
                        levelClass = 'bazi-effect-good';
                        levelText = '吉';
                        break;
                    case 'bad':
                        levelClass = 'bazi-effect-bad';
                        levelText = '凶';
                        break;
                    case 'mixed':
                        levelClass = 'bazi-effect-mixed';
                        levelText = '吉凶参半';
                        break;
                    default:
                        levelClass = 'bazi-effect-neutral';
                        levelText = '中性';
                }
                levelCell.textContent = levelText;
                levelCell.className = levelClass;
                row.appendChild(levelCell);
                tbody.appendChild(row);
            });
            keyYearsTable.appendChild(tbody);
            keyYearsInfo.appendChild(keyYearsTable);
        }
        else {
            keyYearsInfo.textContent = '无法获取关键年份信息。';
        }
        // 创建建议
        const suggestionTitle = document.createElement('h4');
        suggestionTitle.textContent = '发展建议';
        suggestionTitle.className = 'bazi-modal-section-title';
        const suggestion = document.createElement('div');
        suggestion.textContent = trendData.suggestion;
        suggestion.className = 'bazi-modal-suggestion';
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 组装弹窗内容
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(daYunTitle);
        modalContent.appendChild(daYunInfo);
        modalContent.appendChild(chartTitle);
        modalContent.appendChild(chartContainer);
        modalContent.appendChild(trendAnalysisTitle);
        modalContent.appendChild(trendAnalysis);
        modalContent.appendChild(keyYearsTitle);
        modalContent.appendChild(keyYearsInfo);
        modalContent.appendChild(suggestionTitle);
        modalContent.appendChild(suggestion);
        modalContent.appendChild(closeButton);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 渲染趋势图
        const chart = new GeJuTrendChart(chartContainer, trendData.trend, trendData.keyYears, chartContainer.clientWidth, chartContainer.clientHeight);
        chart.render();
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    /**
     * 获取大运列表
     * @returns 大运列表
     */
    getDaYunList() {
        if (!this.baziInfo.daYun || !this.baziInfo.birthYear) {
            return [];
        }
        const birthYear = parseInt(this.baziInfo.birthYear);
        const daYunStartAge = this.baziInfo.daYunStartAge || 0;
        const daYunList = [];
        // 处理大运信息
        if (Array.isArray(this.baziInfo.daYun)) {
            // 如果是DaYunInfo[]类型
            this.baziInfo.daYun.forEach(daYun => {
                daYunList.push({
                    ganZhi: daYun.ganZhi,
                    startYear: daYun.startYear,
                    endYear: daYun.endYear || daYun.startYear + 9
                });
            });
        }
        else if (typeof this.baziInfo.daYun === 'string') {
            // 如果是字符串类型（兼容旧版本）
            const daYunItems = this.baziInfo.daYun.split(',');
            daYunItems.forEach((item, index) => {
                const startAge = daYunStartAge + index * 10;
                const endAge = startAge + 9;
                const startYear = birthYear + startAge;
                const endYear = birthYear + endAge;
                daYunList.push({
                    ganZhi: item.trim(),
                    startYear,
                    endYear
                });
            });
        }
        return daYunList;
    }
    /**
     * 显示用神详细解释
     * @param yongShen 用神名称
     * @param yongShenDetail 用神详情
     */
    showYongShenExplanation(yongShen, yongShenDetail) {
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'bazi-modal';
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bazi-modal-content';
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `用神详解：${yongShen}`;
        title.className = 'bazi-modal-title';
        // 创建解释
        const explanationTitle = document.createElement('h4');
        explanationTitle.textContent = '用神说明';
        explanationTitle.className = 'bazi-modal-section-title';
        const explanationText = document.createElement('div');
        explanationText.textContent = yongShenDetail;
        explanationText.className = 'bazi-modal-explanation';
        // 创建用神解释
        const yongShenExplanationTitle = document.createElement('h4');
        yongShenExplanationTitle.textContent = '用神解释';
        yongShenExplanationTitle.className = 'bazi-modal-section-title';
        const yongShenExplanation = document.createElement('div');
        // 根据用神类型提供不同的解释
        let explanation = '';
        switch (yongShen) {
            case '印星':
                explanation = '印星为生我之物，代表学业、文凭、母亲、贵人等。日主弱时，印星可以生助日主，增强日主力量。';
                break;
            case '官杀':
                explanation = '官杀为克我之物，代表权威、职位、规矩等。日主旺时，官杀可以克制日主，泄秀日主之气。';
                break;
            case '财星':
                explanation = '财星为我生之物，代表财富、物质、享受等。日主旺时，财星可以耗泄日主之气。';
                break;
            case '食伤':
                explanation = '食伤为我泄之物，代表才艺、子女、创造力等。日主旺时，食伤可以泄秀日主之气。';
                break;
            case '比劫':
                explanation = '比劫为同我之物，代表兄弟、同事、竞争等。日主弱时，比劫可以帮扶日主，增强日主力量。';
                break;
            default:
                explanation = '用神是八字中对日主最有利的五行，根据日主旺衰不同，用神也不同。';
        }
        yongShenExplanation.textContent = explanation;
        yongShenExplanation.className = 'bazi-modal-yongshen-explanation';
        // 创建用神取用原则
        const principleTitle = document.createElement('h4');
        principleTitle.textContent = '用神取用原则';
        principleTitle.className = 'bazi-modal-section-title';
        const principle = document.createElement('div');
        principle.innerHTML = `
      <p>1. 日主过旺，取克泄之物为用神（官杀、财星、食伤）</p>
      <p>2. 日主过弱，取生扶之物为用神（印星、比劫）</p>
      <p>3. 日主平衡，根据八字特点选择用神</p>
      <p>4. 月令当令的五行，优先考虑为用神</p>
      <p>5. 八字中最有力的五行，次之考虑为用神</p>
    `;
        principle.className = 'bazi-modal-principle';
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.className = 'bazi-modal-close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // 组装弹窗内容
        modalContent.appendChild(title);
        modalContent.appendChild(explanationTitle);
        modalContent.appendChild(explanationText);
        modalContent.appendChild(yongShenExplanationTitle);
        modalContent.appendChild(yongShenExplanation);
        modalContent.appendChild(principleTitle);
        modalContent.appendChild(principle);
        modalContent.appendChild(closeButton);
        // 添加弹窗内容到弹窗
        modal.appendChild(modalContent);
        // 添加弹窗到页面
        document.body.appendChild(modal);
        // 添加点击事件，点击弹窗外部关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCYXppVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkludGVyYWN0aXZlQmF6aVZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWxELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBcUI5Qjs7Ozs7T0FLRztJQUNILFlBQVksU0FBc0IsRUFBRSxRQUFrQixFQUFFLEVBQVU7UUF0QmxFLGVBQWU7UUFDUCx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0Isd0JBQW1CLEdBQVcsQ0FBQyxDQUFDO1FBRXhDLFNBQVM7UUFDRCxlQUFVLEdBQXVCLElBQUksQ0FBQztRQUN0QyxpQkFBWSxHQUF1QixJQUFJLENBQUM7UUFDeEMsaUJBQVksR0FBdUIsSUFBSSxDQUFDO1FBQ3hDLGdCQUFXLEdBQXVCLElBQUksQ0FBQztRQUUvQyxvQkFBb0I7UUFDWixnQkFBVyxHQUFrQixFQUFFLENBQUM7UUFFeEMsT0FBTztRQUNDLHNCQUFpQixHQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUs7UUFTNUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFYixjQUFjO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FB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Z0JBQWdCLENBQUMsQ0FBQztRQUMzQyxZQUFZLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzFDLFlBQVksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNuRCxZQUFZLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLFlBQVksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEMsWUFBWTtRQUNaLEtBQUssQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFaEMsVUFBVTtRQUNWLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpDLG9CQUFvQjtRQUNwQixLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtnQkFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhemlJbmZvIH0gZnJvbSAnLi4vdHlwZXMvQmF6aUluZm8nO1xuaW1wb3J0IHsgU2hlblNoYVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9TaGVuU2hhU2VydmljZSc7XG5pbXBvcnQgeyBXdVhpbmdTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvV3VYaW5nU2VydmljZSc7XG5pbXBvcnQgeyBHZUp1U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL0dlSnVTZXJ2aWNlJztcbmltcG9ydCB7IEdlSnVUcmVuZFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9HZUp1VHJlbmRTZXJ2aWNlJztcbmltcG9ydCB7IEdlSnVUcmVuZENoYXJ0IH0gZnJvbSAnLi9HZUp1VHJlbmRDaGFydCc7XG5pbXBvcnQgeyBHZUp1SnVkZ2VTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvR2VKdUp1ZGdlU2VydmljZSc7XG5pbXBvcnQgeyBCYXppU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL0JhemlTZXJ2aWNlJztcblxuLyoqXG4gKiDkuqTkupLlvI/lhavlrZflkb3nm5jop4blm75cbiAqIOS9v+eUqEphdmFTY3JpcHTlrp7njrDmm7TkuLDlr4znmoTkupLliqjmlYjmnpxcbiAqL1xuZXhwb3J0IGNsYXNzIEludGVyYWN0aXZlQmF6aVZpZXcge1xuICBwcml2YXRlIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgYmF6aUluZm86IEJhemlJbmZvO1xuICBwcml2YXRlIGlkOiBzdHJpbmc7XG5cbiAgLy8g5b2T5YmN6YCJ5Lit55qE5aSn6L+Q44CB5rWB5bm057Si5byVXG4gIHByaXZhdGUgc2VsZWN0ZWREYVl1bkluZGV4OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIHNlbGVjdGVkTGl1TmlhblllYXI6IG51bWJlciA9IDA7XG5cbiAgLy8g6KGo5qC85YWD57Sg5byV55SoXG4gIHByaXZhdGUgZGFZdW5UYWJsZTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsaXVOaWFuVGFibGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgeGlhb1l1blRhYmxlOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxpdVl1ZVRhYmxlOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8vIOW3suaYvuekuueahOW8ueeql+WIl+ihqO+8jOeUqOS6jumYsuatoumHjeWkjeaYvuekulxuICBwcml2YXRlIHNob3duTW9kYWxzOiBIVE1MRWxlbWVudFtdID0gW107XG5cbiAgLy8g5Yqo55S755u45YWzXG4gIHByaXZhdGUgYW5pbWF0aW9uRHVyYXRpb246IG51bWJlciA9IDMwMDsgLy8g5q+r56eSXG5cbiAgLyoqXG4gICAqIOaehOmAoOWHveaVsFxuICAgKiBAcGFyYW0gY29udGFpbmVyIOWuueWZqOWFg+e0oFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEBwYXJhbSBpZCDllK/kuIBJRFxuICAgKi9cbiAgY29uc3RydWN0b3IoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYmF6aUluZm86IEJhemlJbmZvLCBpZDogc3RyaW5nKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5iYXppSW5mbyA9IGJhemlJbmZvO1xuICAgIHRoaXMuaWQgPSBpZDtcblxuICAgIC8vIOiuvue9rum7mOiupOeahOelnueFnuaYvuekuuiuvue9rlxuICAgIGlmICghdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSkge1xuICAgICAgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSA9IHtcbiAgICAgICAgc2laaHU6IHRydWUsXG4gICAgICAgIGRhWXVuOiB0cnVlLFxuICAgICAgICBsaXVOaWFuOiB0cnVlLFxuICAgICAgICB4aWFvWXVuOiB0cnVlLFxuICAgICAgICBsaXVZdWU6IHRydWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW6KeG5Zu+XG4gICAgdGhpcy5pbml0VmlldygpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIneWni+WMluinhuWbvlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0VmlldygpIHtcbiAgICAvLyDmuIXnqbrlrrnlmahcbiAgICB0aGlzLmNvbnRhaW5lci5lbXB0eSgpO1xuICAgIHRoaXMuY29udGFpbmVyLmFkZENsYXNzKCdpbnRlcmFjdGl2ZS1iYXppLXZpZXcnKTtcblxuICAgIC8vIOWIm+W7uuagh+mimOWSjOiuvue9ruaMiemSrlxuICAgIHRoaXMuY3JlYXRlSGVhZGVyKCk7XG5cbiAgICAvLyDliJvlu7rlhavlrZfooajmoLxcbiAgICB0aGlzLmNyZWF0ZUJhemlUYWJsZSgpO1xuXG4gICAgLy8g5Yib5bu654m55q6K5L+h5oGvXG4gICAgdGhpcy5jcmVhdGVTcGVjaWFsSW5mbygpO1xuXG4gICAgLy8g5Yib5bu65aSn6L+Q5L+h5oGvXG4gICAgdGhpcy5jcmVhdGVEYVl1bkluZm8oKTtcblxuICAgIC8vIOWIm+W7uua1geW5tOWSjOWwj+i/kOS/oeaBr1xuICAgIHRoaXMuY3JlYXRlTGl1TmlhbkluZm8oKTtcblxuICAgIC8vIOWIm+W7uua1geaciOS/oeaBr1xuICAgIHRoaXMuY3JlYXRlTGl1WXVlSW5mbygpO1xuXG4gICAgLy8g5re75Yqg6KGo5qC85Y2V5YWD5qC855uR5ZCs5ZmoXG4gICAgdGhpcy5hZGRUYWJsZUNlbGxMaXN0ZW5lcnMoKTtcblxuICAgIC8vIOm7mOiupOmAieS4reesrOS4gOS4quWkp+i/kFxuICAgIGlmICh0aGlzLmJhemlJbmZvLmRhWXVuICYmIHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZWxlY3REYVl1bigwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5re75Yqg6KGo5qC85Y2V5YWD5qC855uR5ZCs5ZmoXG4gICAqL1xuICBwcml2YXRlIGFkZFRhYmxlQ2VsbExpc3RlbmVycygpIHtcbiAgICAvLyDmt7vliqDnpZ7nhZ7ngrnlh7vkuovku7ZcbiAgICBjb25zdCBzaGVuU2hhRWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc2hlbnNoYS10YWc6bm90KC5yaXpodS1jbGlja2FibGUpJyk7XG4gICAgc2hlblNoYUVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3Qgc2hlblNoYSA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmIChzaGVuU2hhKSB7XG4gICAgICAgICAgdGhpcy5zaG93U2hlblNoYUV4cGxhbmF0aW9uKHNoZW5TaGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOa3u+WKoOaXpeS4u+aXuuihsOeCueWHu+S6i+S7tlxuICAgIGNvbnN0IHJpWmh1RWxlbWVudHMgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcucml6aHUtY2xpY2thYmxlJyk7XG4gICAgcmlaaHVFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfml6XkuLvml7roobDmoIfnrb7ooqvngrnlh7vvvIjooajmoLzkuK3vvIknKTtcbiAgICAgICAgY29uc3QgcmlaaHUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1yaXpodScpO1xuICAgICAgICBjb25zdCB3dVhpbmcgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13dXhpbmcnKTtcbiAgICAgICAgaWYgKHJpWmh1ICYmIHd1WGluZykge1xuICAgICAgICAgIHRoaXMuc2hvd1JpWmh1RXhwbGFuYXRpb24ocmlaaHUsIHd1WGluZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuagh+mimOWSjOiuvue9ruaMiemSrlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVIZWFkZXIoKSB7XG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ+WFq+Wtl+WRveebmCcsIGNsczogJ2Jhemktdmlldy10aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rorr7nva7mjInpkq5cbiAgICBjb25zdCBzZXR0aW5nc0J1dHRvbiA9IGhlYWRlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LXNldHRpbmdzLWJ1dHRvbicsXG4gICAgICBhdHRyOiB7ICdkYXRhLWJhemktaWQnOiB0aGlzLmlkLCAnYXJpYS1sYWJlbCc6ICforr7nva4nIH1cbiAgICB9KTtcbiAgICBzZXR0aW5nc0J1dHRvbi5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIGNsYXNzPVwiZmVhdGhlciBmZWF0aGVyLXNldHRpbmdzXCI+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCI+PC9jaXJjbGU+PHBhdGggZD1cIk0xOS40IDE1YTEuNjUgMS42NSAwIDAgMCAuMzMgMS44MmwuMDYuMDZhMiAyIDAgMCAxIDAgMi44MyAyIDIgMCAwIDEtMi44MyAwbC0uMDYtLjA2YTEuNjUgMS42NSAwIDAgMC0xLjgyLS4zMyAxLjY1IDEuNjUgMCAwIDAtMSAxLjUxVjIxYTIgMiAwIDAgMS0yIDIgMiAyIDAgMCAxLTItMnYtLjA5QTEuNjUgMS42NSAwIDAgMCA5IDE5LjRhMS42NSAxLjY1IDAgMCAwLTEuODIuMzNsLS4wNi4wNmEyIDIgMCAwIDEtMi44MyAwIDIgMiAwIDAgMSAwLTIuODNsLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAgLjMzLTEuODIgMS42NSAxLjY1IDAgMCAwLTEuNTEtMUgzYTIgMiAwIDAgMS0yLTIgMiAyIDAgMCAxIDItMmguMDlBMS42NSAxLjY1IDAgMCAwIDQuNiA5YTEuNjUgMS42NSAwIDAgMC0uMzMtMS44MmwtLjA2LS4wNmEyIDIgMCAwIDEgMC0yLjgzIDIgMiAwIDAgMSAyLjgzIDBsLjA2LjA2YTEuNjUgMS42NSAwIDAgMCAxLjgyLjMzSDlhMS42NSAxLjY1IDAgMCAwIDEtMS41MVYzYTIgMiAwIDAgMSAyLTIgMiAyIDAgMCAxIDIgMnYuMDlhMS42NSAxLjY1IDAgMCAwIDEgMS41MSAxLjY1IDEuNjUgMCAwIDAgMS44Mi0uMzNsLjA2LS4wNmEyIDIgMCAwIDEgMi44MyAwIDIgMiAwIDAgMSAwIDIuODNsLS4wNi4wNmExLjY1IDEuNjUgMCAwIDAtLjMzIDEuODJWOWExLjY1IDEuNjUgMCAwIDAgMS41MSAxSDIxYTIgMiAwIDAgMSAyIDIgMiAyIDAgMCAxLTIgMmgtLjA5YTEuNjUgMS42NSAwIDAgMC0xLjUxIDF6XCI+PC9wYXRoPjwvc3ZnPic7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65YWr5a2X6KGo5qC8XG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhemlUYWJsZSgpIHtcbiAgICBjb25zdCB0YWJsZVNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG4gICAgLy8g56e76Zmk6YeN5aSN55qE5qCH6aKYXG5cbiAgICAvLyDmt7vliqDln7rmnKzkv6Hmga/vvIjlhazljobjgIHlhpzljobjgIHmgKfliKvvvIlcbiAgICBjb25zdCBiYXNpY0luZm9EaXYgPSB0YWJsZVNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS1iYXNpYy1pbmZvJyB9KTtcblxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNvbGFyRGF0ZSkge1xuICAgICAgYmFzaWNJbmZvRGl2LmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg5YWs5Y6GOiAke3RoaXMuYmF6aUluZm8uc29sYXJEYXRlfSAke3RoaXMuYmF6aUluZm8uc29sYXJUaW1lIHx8ICcnfWAsXG4gICAgICAgIGNsczogJ2JhemktYmFzaWMtaW5mby1pdGVtJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ubHVuYXJEYXRlKSB7XG4gICAgICBiYXNpY0luZm9EaXYuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDlhpzljoY6ICR7dGhpcy5iYXppSW5mby5sdW5hckRhdGV9YCxcbiAgICAgICAgY2xzOiAnYmF6aS1iYXNpYy1pbmZvLWl0ZW0nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5iYXppSW5mby5nZW5kZXIpIHtcbiAgICAgIGJhc2ljSW5mb0Rpdi5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYOaAp+WIqzogJHt0aGlzLmJhemlJbmZvLmdlbmRlciA9PT0gJzEnID8gJ+eUtycgOiAn5aWzJ31gLFxuICAgICAgICBjbHM6ICdiYXppLWJhc2ljLWluZm8taXRlbSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuihqOagvFxuICAgIGNvbnN0IHRhYmxlID0gdGFibGVTZWN0aW9uLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlJyB9KTtcblxuICAgIC8vIOWIm+W7uuihqOWktFxuICAgIGNvbnN0IHRoZWFkID0gdGFibGUuY3JlYXRlRWwoJ3RoZWFkJyk7XG4gICAgY29uc3QgaGVhZGVyUm93ID0gdGhlYWQuY3JlYXRlRWwoJ3RyJyk7XG5cbiAgICAvLyDmt7vliqDlt6bkvqfmoIfpopjmoI9cbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5L+h5oGvJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDmt7vliqDlm5vmn7HooajlpLRcbiAgICBbJ+W5tOafsScsICfmnIjmn7EnLCAn5pel5p+xJywgJ+aXtuafsSddLmZvckVhY2godGV4dCA9PiB7XG4gICAgICBoZWFkZXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0IH0pO1xuICAgIH0pO1xuXG4gICAgLy8g5Yib5bu66KGo5L2TXG4gICAgY29uc3QgdGJvZHkgPSB0YWJsZS5jcmVhdGVFbCgndGJvZHknKTtcblxuICAgIC8vIOWkqeW5suihjFxuICAgIGNvbnN0IHN0ZW1Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2Jhemktc3RlbS1yb3cnIH0pO1xuICAgIHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn5aSp5bmyJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlpKnlubLooYwgLSDnm7TmjqXlnKh0ZOWFg+e0oOS4iuiuvue9ruminOiJslxuICAgIGNvbnN0IHllYXJTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTdGVtIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlTdGVtV3VYaW5nQ29sb3IoeWVhclN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLnllYXJTdGVtIHx8ICcnKTtcblxuICAgIGNvbnN0IG1vbnRoU3RlbUNlbGwgPSBzdGVtUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5tb250aFN0ZW0gfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseVN0ZW1XdVhpbmdDb2xvcihtb250aFN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLm1vbnRoU3RlbSB8fCAnJyk7XG5cbiAgICBjb25zdCBkYXlTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVN0ZW0gfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseVN0ZW1XdVhpbmdDb2xvcihkYXlTdGVtQ2VsbCwgdGhpcy5iYXppSW5mby5kYXlTdGVtIHx8ICcnKTtcblxuICAgIGNvbnN0IGhvdXJTdGVtQ2VsbCA9IHN0ZW1Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJTdGVtIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlTdGVtV3VYaW5nQ29sb3IoaG91clN0ZW1DZWxsLCB0aGlzLmJhemlJbmZvLmhvdXJTdGVtIHx8ICcnKTtcblxuICAgIC8vIOWcsOaUr+ihjFxuICAgIGNvbnN0IGJyYW5jaFJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1icmFuY2gtcm93JyB9KTtcbiAgICBicmFuY2hSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn5Zyw5pSvJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlnLDmlK/ooYwgLSDnm7TmjqXlnKh0ZOWFg+e0oOS4iuiuvue9ruminOiJslxuICAgIGNvbnN0IHllYXJCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyQnJhbmNoIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlCcmFuY2hXdVhpbmdDb2xvcih5ZWFyQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby55ZWFyQnJhbmNoIHx8ICcnKTtcblxuICAgIGNvbnN0IG1vbnRoQnJhbmNoQ2VsbCA9IGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhCcmFuY2ggfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseUJyYW5jaFd1WGluZ0NvbG9yKG1vbnRoQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby5tb250aEJyYW5jaCB8fCAnJyk7XG5cbiAgICBjb25zdCBkYXlCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5kYXlCcmFuY2ggfHwgJycgfSk7XG4gICAgdGhpcy5hcHBseUJyYW5jaFd1WGluZ0NvbG9yKGRheUJyYW5jaENlbGwsIHRoaXMuYmF6aUluZm8uZGF5QnJhbmNoIHx8ICcnKTtcblxuICAgIGNvbnN0IGhvdXJCcmFuY2hDZWxsID0gYnJhbmNoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5ob3VyQnJhbmNoIHx8ICcnIH0pO1xuICAgIHRoaXMuYXBwbHlCcmFuY2hXdVhpbmdDb2xvcihob3VyQnJhbmNoQ2VsbCwgdGhpcy5iYXppSW5mby5ob3VyQnJhbmNoIHx8ICcnKTtcblxuICAgIC8vIOiXj+W5suihjFxuICAgIGNvbnN0IGhpZGVHYW5Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2JhemktaGlkZWdhbi1yb3cnIH0pO1xuICAgIGhpZGVHYW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn6JeP5bmyJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlubTmn7Hol4/lubJcbiAgICBjb25zdCB5ZWFySGlkZUdhblRleHQgPSBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8ueWVhckhpZGVHYW4pID8gdGhpcy5iYXppSW5mby55ZWFySGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLnllYXJIaWRlR2FuIHx8ICcnKTtcbiAgICBjb25zdCB5ZWFySGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4oeWVhckhpZGVHYW5DZWxsLCB5ZWFySGlkZUdhblRleHQpO1xuXG4gICAgLy8g5pyI5p+x6JeP5bmyXG4gICAgY29uc3QgbW9udGhIaWRlR2FuVGV4dCA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4pID8gdGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4uam9pbignJykgOiAodGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4gfHwgJycpO1xuICAgIGNvbnN0IG1vbnRoSGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4obW9udGhIaWRlR2FuQ2VsbCwgbW9udGhIaWRlR2FuVGV4dCk7XG5cbiAgICAvLyDml6Xmn7Hol4/lubJcbiAgICBjb25zdCBkYXlIaWRlR2FuVGV4dCA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5kYXlIaWRlR2FuKSA/IHRoaXMuYmF6aUluZm8uZGF5SGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLmRheUhpZGVHYW4gfHwgJycpO1xuICAgIGNvbnN0IGRheUhpZGVHYW5DZWxsID0gaGlkZUdhblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICB0aGlzLmNyZWF0ZUNvbG9yZWRIaWRlR2FuKGRheUhpZGVHYW5DZWxsLCBkYXlIaWRlR2FuVGV4dCk7XG5cbiAgICAvLyDml7bmn7Hol4/lubJcbiAgICBjb25zdCBob3VySGlkZUdhblRleHQgPSBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8uaG91ckhpZGVHYW4pID8gdGhpcy5iYXppSW5mby5ob3VySGlkZUdhbi5qb2luKCcnKSA6ICh0aGlzLmJhemlJbmZvLmhvdXJIaWRlR2FuIHx8ICcnKTtcbiAgICBjb25zdCBob3VySGlkZUdhbkNlbGwgPSBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIHRoaXMuY3JlYXRlQ29sb3JlZEhpZGVHYW4oaG91ckhpZGVHYW5DZWxsLCBob3VySGlkZUdhblRleHQpO1xuXG4gICAgLy8g5Y2B56We6KGMXG4gICAgY29uc3Qgc2hpU2hlblJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1zaGlzaGVuLXJvdycgfSk7XG4gICAgc2hpU2hlblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICfljYHnpZ4nLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcblxuICAgIC8vIOW5tOafseWNgeelnlxuICAgIGNvbnN0IHllYXJTaGlTaGVuQ2VsbCA9IHNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgLy8g5aSp5bmy5Y2B56WeXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueWVhclNoaVNoZW5HYW4pIHtcbiAgICAgIHllYXJTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyU2hpU2hlbkdhbixcbiAgICAgICAgY2xzOiAnc2hpc2hlbi10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8g5Zyw5pSv6JeP5bmy5Y2B56WeXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueWVhclNoaVNoZW5aaGkgJiYgQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLnllYXJTaGlTaGVuWmhpKSAmJiB0aGlzLmJhemlJbmZvLnllYXJTaGlTaGVuWmhpLmxlbmd0aCA+IDApIHtcbiAgICAgIHllYXJTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuICAgICAgeWVhclNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTaGlTaGVuWmhpLmpvaW4oJywnKSxcbiAgICAgICAgY2xzOiAnc2hpc2hlbi10YWctc21hbGwgc2hpc2hlbi10YWctaGlkZSdcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5iYXppSW5mby55ZWFyQnJhbmNoKSB7XG4gICAgICAvLyDlpoLmnpzmsqHmnInmj5DkvpvlnLDmlK/ol4/lubLljYHnpZ7vvIzliJnorqHnrpdcbiAgICAgIGNvbnN0IGhpZGRlblNoaVNoZW4gPSB0aGlzLmdldEhpZGRlblNoaVNoZW4odGhpcy5iYXppSW5mby5kYXlTdGVtIHx8ICcnLCB0aGlzLmJhemlJbmZvLnllYXJCcmFuY2gpO1xuICAgICAgaWYgKGhpZGRlblNoaVNoZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICB5ZWFyU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6ICcgJyB9KTtcbiAgICAgICAgeWVhclNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICAgIHRleHQ6IGhpZGRlblNoaVNoZW4uam9pbignLCcpLFxuICAgICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsIHNoaXNoZW4tdGFnLWhpZGUnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaciOafseWNgeelnlxuICAgIGNvbnN0IG1vbnRoU2hpU2hlbkNlbGwgPSBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIC8vIOWkqeW5suWNgeelnlxuICAgIGlmICh0aGlzLmJhemlJbmZvLm1vbnRoU2hpU2hlbkdhbikge1xuICAgICAgbW9udGhTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5tb250aFNoaVNoZW5HYW4sXG4gICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIOWcsOaUr+iXj+W5suWNgeelnlxuICAgIGlmICh0aGlzLmJhemlJbmZvLm1vbnRoU2hpU2hlblpoaSAmJiBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8ubW9udGhTaGlTaGVuWmhpKSAmJiB0aGlzLmJhemlJbmZvLm1vbnRoU2hpU2hlblpoaS5sZW5ndGggPiAwKSB7XG4gICAgICBtb250aFNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICBtb250aFNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoU2hpU2hlblpoaS5qb2luKCcsJyksXG4gICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsIHNoaXNoZW4tdGFnLWhpZGUnXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYmF6aUluZm8ubW9udGhCcmFuY2gpIHtcbiAgICAgIC8vIOWmguaenOayoeacieaPkOS+m+WcsOaUr+iXj+W5suWNgeelnu+8jOWImeiuoeeul1xuICAgICAgY29uc3QgaGlkZGVuU2hpU2hlbiA9IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbih0aGlzLmJhemlJbmZvLmRheVN0ZW0gfHwgJycsIHRoaXMuYmF6aUluZm8ubW9udGhCcmFuY2gpO1xuICAgICAgaWYgKGhpZGRlblNoaVNoZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBtb250aFNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICAgIG1vbnRoU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgICAgdGV4dDogaGlkZGVuU2hpU2hlbi5qb2luKCcsJyksXG4gICAgICAgICAgY2xzOiAnc2hpc2hlbi10YWctc21hbGwgc2hpc2hlbi10YWctaGlkZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pel5p+x5Y2B56WeXG4gICAgY29uc3QgZGF5U2hpU2hlbkNlbGwgPSBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIC8vIOaXpeS4u+agh+etvlxuICAgIGRheVNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgdGV4dDogJ+aXpeS4uycsXG4gICAgICBjbHM6ICdzaGlzaGVuLXRhZy1zbWFsbCdcbiAgICB9KTtcbiAgICAvLyDlnLDmlK/ol4/lubLljYHnpZ5cbiAgICBpZiAodGhpcy5iYXppSW5mby5kYXlTaGlTaGVuWmhpICYmIEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5kYXlTaGlTaGVuWmhpKSAmJiB0aGlzLmJhemlJbmZvLmRheVNoaVNoZW5aaGkubGVuZ3RoID4gMCkge1xuICAgICAgZGF5U2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6ICcgJyB9KTtcbiAgICAgIGRheVNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVNoaVNoZW5aaGkuam9pbignLCcpLFxuICAgICAgICBjbHM6ICdzaGlzaGVuLXRhZy1zbWFsbCBzaGlzaGVuLXRhZy1oaWRlJ1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmJhemlJbmZvLmRheUJyYW5jaCkge1xuICAgICAgLy8g5aaC5p6c5rKh5pyJ5o+Q5L6b5Zyw5pSv6JeP5bmy5Y2B56We77yM5YiZ6K6h566XXG4gICAgICBjb25zdCBoaWRkZW5TaGlTaGVuID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKHRoaXMuYmF6aUluZm8uZGF5U3RlbSB8fCAnJywgdGhpcy5iYXppSW5mby5kYXlCcmFuY2gpO1xuICAgICAgaWYgKGhpZGRlblNoaVNoZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBkYXlTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuICAgICAgICBkYXlTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICB0ZXh0OiBoaWRkZW5TaGlTaGVuLmpvaW4oJywnKSxcbiAgICAgICAgICBjbHM6ICdzaGlzaGVuLXRhZy1zbWFsbCBzaGlzaGVuLXRhZy1oaWRlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDml7bmn7HljYHnpZ5cbiAgICBjb25zdCB0aW1lU2hpU2hlbkNlbGwgPSBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIC8vIOWkqeW5suWNgeelnlxuICAgIGlmICh0aGlzLmJhemlJbmZvLnRpbWVTaGlTaGVuR2FuKSB7XG4gICAgICB0aW1lU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8udGltZVNoaVNoZW5HYW4sXG4gICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIOWcsOaUr+iXj+W5suWNgeelnlxuICAgIGlmICh0aGlzLmJhemlJbmZvLmhvdXJTaGlTaGVuWmhpICYmIEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5ob3VyU2hpU2hlblpoaSkgJiYgdGhpcy5iYXppSW5mby5ob3VyU2hpU2hlblpoaS5sZW5ndGggPiAwKSB7XG4gICAgICB0aW1lU2hpU2hlbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6ICcgJyB9KTtcbiAgICAgIHRpbWVTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5ob3VyU2hpU2hlblpoaS5qb2luKCcsJyksXG4gICAgICAgIGNsczogJ3NoaXNoZW4tdGFnLXNtYWxsIHNoaXNoZW4tdGFnLWhpZGUnXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYmF6aUluZm8uaG91ckJyYW5jaCkge1xuICAgICAgLy8g5aaC5p6c5rKh5pyJ5o+Q5L6b5Zyw5pSv6JeP5bmy5Y2B56We77yM5YiZ6K6h566XXG4gICAgICBjb25zdCBoaWRkZW5TaGlTaGVuID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKHRoaXMuYmF6aUluZm8uZGF5U3RlbSB8fCAnJywgdGhpcy5iYXppSW5mby5ob3VyQnJhbmNoKTtcbiAgICAgIGlmIChoaWRkZW5TaGlTaGVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGltZVNoaVNoZW5DZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICAgIHRpbWVTaGlTaGVuQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICB0ZXh0OiBoaWRkZW5TaGlTaGVuLmpvaW4oJywnKSxcbiAgICAgICAgICBjbHM6ICdzaGlzaGVuLXRhZy1zbWFsbCBzaGlzaGVuLXRhZy1oaWRlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlnLDlir/ooYxcbiAgICBjb25zdCBkaVNoaVJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS1kaXNoaS1yb3cnIH0pO1xuICAgIGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogJ+WcsOWKvycsIGNsczogJ2JhemktdGFibGUtbGFiZWwnIH0pO1xuXG4gICAgLy8g5bm05p+x5Zyw5Yq/XG4gICAgY29uc3QgeWVhckRpU2hpQ2VsbCA9IGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnllYXJEaVNoaSkge1xuICAgICAgeWVhckRpU2hpQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyRGlTaGksXG4gICAgICAgIGNsczogJ2Rpc2hpLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaciOafseWcsOWKv1xuICAgIGNvbnN0IG1vbnRoRGlTaGlDZWxsID0gZGlTaGlSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ubW9udGhEaVNoaSkge1xuICAgICAgbW9udGhEaVNoaUNlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhEaVNoaSxcbiAgICAgICAgY2xzOiAnZGlzaGktdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5pel5p+x5Zyw5Yq/XG4gICAgY29uc3QgZGF5RGlTaGlDZWxsID0gZGlTaGlSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8uZGF5RGlTaGkpIHtcbiAgICAgIGRheURpU2hpQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5kYXlEaVNoaSxcbiAgICAgICAgY2xzOiAnZGlzaGktdGFnLXNtYWxsJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5pe25p+x5Zyw5Yq/XG4gICAgY29uc3QgdGltZURpU2hpQ2VsbCA9IGRpU2hpUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnRpbWVEaVNoaSkge1xuICAgICAgdGltZURpU2hpQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby50aW1lRGlTaGksXG4gICAgICAgIGNsczogJ2Rpc2hpLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOe6s+mfs+ihjFxuICAgIGNvbnN0IG5hWWluUm93ID0gdGJvZHkuY3JlYXRlRWwoJ3RyJywgeyBjbHM6ICdiYXppLW5heWluLXJvdycgfSk7XG4gICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiAn57qz6Z+zJywgY2xzOiAnYmF6aS10YWJsZS1sYWJlbCcgfSk7XG5cbiAgICAvLyDlubTmn7HnurPpn7NcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSB0aGlzLmJhemlJbmZvLnllYXJOYVlpbiB8fCAnJztcbiAgICBjb25zdCB5ZWFyTmFZaW5DZWxsID0gbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHllYXJOYVlpbikge1xuICAgICAgLy8g5o+Q5Y+W5LqU6KGM5bGe5oCn77yI6YCa5bi457qz6Z+z5qC85byP5Li6XCJYWOS6lOihjFwi77yM5aaCXCLph5HnrpTph5FcIu+8iVxuICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5leHRyYWN0V3VYaW5nRnJvbU5hWWluKHllYXJOYVlpbik7XG4gICAgICBjb25zdCB5ZWFyTmFZaW5TcGFuID0geWVhck5hWWluQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogeWVhck5hWWluIH0pO1xuICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHllYXJOYVlpblNwYW4sIHd1WGluZyk7XG4gICAgfVxuXG4gICAgLy8g5pyI5p+x57qz6Z+zXG4gICAgY29uc3QgbW9udGhOYVlpbiA9IHRoaXMuYmF6aUluZm8ubW9udGhOYVlpbiB8fCAnJztcbiAgICBjb25zdCBtb250aE5hWWluQ2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgIGlmIChtb250aE5hWWluKSB7XG4gICAgICBjb25zdCB3dVhpbmcgPSB0aGlzLmV4dHJhY3RXdVhpbmdGcm9tTmFZaW4obW9udGhOYVlpbik7XG4gICAgICBjb25zdCBtb250aE5hWWluU3BhbiA9IG1vbnRoTmFZaW5DZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBtb250aE5hWWluIH0pO1xuICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KG1vbnRoTmFZaW5TcGFuLCB3dVhpbmcpO1xuICAgIH1cblxuICAgIC8vIOaXpeafsee6s+mfs1xuICAgIGNvbnN0IGRheU5hWWluID0gdGhpcy5iYXppSW5mby5kYXlOYVlpbiB8fCAnJztcbiAgICBjb25zdCBkYXlOYVlpbkNlbGwgPSBuYVlpblJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAoZGF5TmFZaW4pIHtcbiAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihkYXlOYVlpbik7XG4gICAgICBjb25zdCBkYXlOYVlpblNwYW4gPSBkYXlOYVlpbkNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGRheU5hWWluIH0pO1xuICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGRheU5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICB9XG5cbiAgICAvLyDml7bmn7HnurPpn7NcbiAgICBjb25zdCBob3VyTmFZaW4gPSB0aGlzLmJhemlJbmZvLmhvdXJOYVlpbiB8fCAnJztcbiAgICBjb25zdCBob3VyTmFZaW5DZWxsID0gbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKGhvdXJOYVlpbikge1xuICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5leHRyYWN0V3VYaW5nRnJvbU5hWWluKGhvdXJOYVlpbik7XG4gICAgICBjb25zdCBob3VyTmFZaW5TcGFuID0gaG91ck5hWWluQ2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogaG91ck5hWWluIH0pO1xuICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGhvdXJOYVlpblNwYW4sIHd1WGluZyk7XG4gICAgfVxuXG4gICAgLy8g5pes56m66KGMXG4gICAgY29uc3QgeHVuS29uZ1JvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicsIHsgY2xzOiAnYmF6aS14dW5rb25nLXJvdycgfSk7XG4gICAgeHVuS29uZ1Jvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6ICfml6znqbonLCBjbHM6ICdiYXppLXRhYmxlLWxhYmVsJyB9KTtcblxuICAgIC8vIOW5tOafseaXrOepulxuICAgIGNvbnN0IHllYXJYdW5Lb25nQ2VsbCA9IHh1bktvbmdSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueWVhclh1bktvbmcpIHtcbiAgICAgIHllYXJYdW5Lb25nQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyWHVuS29uZyxcbiAgICAgICAgY2xzOiAneHVua29uZy10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmnIjmn7Hml6znqbpcbiAgICBjb25zdCBtb250aFh1bktvbmdDZWxsID0geHVuS29uZ1Jvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby5tb250aFh1bktvbmcpIHtcbiAgICAgIG1vbnRoWHVuS29uZ0NlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhYdW5Lb25nLFxuICAgICAgICBjbHM6ICd4dW5rb25nLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaXpeafseaXrOepulxuICAgIGNvbnN0IGRheVh1bktvbmdDZWxsID0geHVuS29uZ1Jvdy5jcmVhdGVFbCgndGQnKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby5kYXlYdW5Lb25nKSB7XG4gICAgICBkYXlYdW5Lb25nQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5kYXlYdW5Lb25nLFxuICAgICAgICBjbHM6ICd4dW5rb25nLXRhZy1zbWFsbCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaXtuafseaXrOepulxuICAgIGNvbnN0IGhvdXJYdW5Lb25nQ2VsbCA9IHh1bktvbmdSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8uaG91clh1bktvbmcpIHtcbiAgICAgIGhvdXJYdW5Lb25nQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogdGhpcy5iYXppSW5mby5ob3VyWHVuS29uZyxcbiAgICAgICAgY2xzOiAneHVua29uZy10YWctc21hbGwnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnlJ/ogpbooYxcbiAgICBjb25zdCBzaGVuZ1hpYW9Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInLCB7IGNsczogJ2Jhemktc2hlbmd4aWFvLXJvdycgfSk7XG4gICAgc2hlbmdYaWFvUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogJ+eUn+iClicsIGNsczogJ2JhemktdGFibGUtbGFiZWwnIH0pO1xuICAgIHNoZW5nWGlhb1Jvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ueWVhclNoZW5nWGlhbyB8fCAnJyB9KTtcbiAgICBzaGVuZ1hpYW9Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoU2hlbmdYaWFvIHx8ICcnIH0pO1xuICAgIHNoZW5nWGlhb1Jvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5U2hlbmdYaWFvIHx8ICcnIH0pO1xuICAgIHNoZW5nWGlhb1Jvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uaG91clNoZW5nWGlhbyB8fCAnJyB9KTtcblxuICAgIC8vIOWIm+W7uuelnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5TaGEgJiYgdGhpcy5iYXppSW5mby5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIOaMieafseS9jeWIhue7hOelnueFnlxuICAgICAgY29uc3QgeWVhclNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBtb250aFNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBkYXlTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgaG91clNoZW5TaGE6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIHRoaXMuYmF6aUluZm8uc2hlblNoYS5mb3JFYWNoKHNoZW5TaGEgPT4ge1xuICAgICAgICBpZiAoc2hlblNoYS5zdGFydHNXaXRoKCflubTmn7E6JykpIHtcbiAgICAgICAgICB5ZWFyU2hlblNoYS5wdXNoKHNoZW5TaGEuc3Vic3RyaW5nKDMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaGVuU2hhLnN0YXJ0c1dpdGgoJ+aciOafsTonKSkge1xuICAgICAgICAgIG1vbnRoU2hlblNoYS5wdXNoKHNoZW5TaGEuc3Vic3RyaW5nKDMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaGVuU2hhLnN0YXJ0c1dpdGgoJ+aXpeafsTonKSkge1xuICAgICAgICAgIGRheVNoZW5TaGEucHVzaChzaGVuU2hhLnN1YnN0cmluZygzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hlblNoYS5zdGFydHNXaXRoKCfml7bmn7E6JykpIHtcbiAgICAgICAgICBob3VyU2hlblNoYS5wdXNoKHNoZW5TaGEuc3Vic3RyaW5nKDMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOacieS7u+S9leafseS9jeacieelnueFnu+8jOWIm+W7uuelnueFnuihjFxuICAgICAgaWYgKHllYXJTaGVuU2hhLmxlbmd0aCA+IDAgfHwgbW9udGhTaGVuU2hhLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICBkYXlTaGVuU2hhLmxlbmd0aCA+IDAgfHwgaG91clNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyDliJvlu7rnpZ7nhZ7ooYxcbiAgICAgICAgY29uc3Qgc2hlblNoYVJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicpO1xuICAgICAgICBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogJ+elnueFnicsIGNsczogJ2JhemktdGFibGUtbGFiZWwnIH0pO1xuXG4gICAgICAgIC8vIOW5tOafseelnueFnuWNleWFg+agvFxuICAgICAgICBjb25zdCB5ZWFyQ2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICAgIGlmICh5ZWFyU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgeWVhclNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG5cbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNwYW4gPSB5ZWFyQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICAgICAgdGV4dDogc2hlblNoYSxcbiAgICAgICAgICAgICAgY2xzOiBjc3NDbGFzcyxcbiAgICAgICAgICAgICAgYXR0cjogeyAndGl0bGUnOiBzaGVuU2hhSW5mbz8uZGVzY3JpcHRpb24gfHwgJycgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDnqbrmoLzliIbpmpRcbiAgICAgICAgICAgIHllYXJDZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeWVhckNlbGwudGV4dENvbnRlbnQgPSAn5pegJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaciOafseelnueFnuWNleWFg+agvFxuICAgICAgICBjb25zdCBtb250aENlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgICBpZiAobW9udGhTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBtb250aFNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG5cbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNwYW4gPSBtb250aENlbGwuY3JlYXRlU3Bhbih7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogY3NzQ2xhc3MsXG4gICAgICAgICAgICAgIGF0dHI6IHsgJ3RpdGxlJzogc2hlblNoYUluZm8/LmRlc2NyaXB0aW9uIHx8ICcnIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg56m65qC85YiG6ZqUXG4gICAgICAgICAgICBtb250aENlbGwuY3JlYXRlU3Bhbih7IHRleHQ6ICcgJyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb250aENlbGwudGV4dENvbnRlbnQgPSAn5pegJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaXpeafseelnueFnuWNleWFg+agvFxuICAgICAgICBjb25zdCBkYXlDZWxsID0gc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICAgICAgaWYgKGRheVNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGRheVNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG5cbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNwYW4gPSBkYXlDZWxsLmNyZWF0ZVNwYW4oe1xuICAgICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgICBjbHM6IGNzc0NsYXNzLFxuICAgICAgICAgICAgICBhdHRyOiB7ICd0aXRsZSc6IHNoZW5TaGFJbmZvPy5kZXNjcmlwdGlvbiB8fCAnJyB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYUV4cGxhbmF0aW9uKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgICAgICAgZGF5Q2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRheUNlbGwudGV4dENvbnRlbnQgPSAn5pegJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaXtuafseelnueFnuWNleWFg+agvFxuICAgICAgICBjb25zdCBob3VyQ2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICAgIGlmIChob3VyU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaG91clNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG5cbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNwYW4gPSBob3VyQ2VsbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICAgICAgdGV4dDogc2hlblNoYSxcbiAgICAgICAgICAgICAgY2xzOiBjc3NDbGFzcyxcbiAgICAgICAgICAgICAgYXR0cjogeyAndGl0bGUnOiBzaGVuU2hhSW5mbz8uZGVzY3JpcHRpb24gfHwgJycgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDnqbrmoLzliIbpmpRcbiAgICAgICAgICAgIGhvdXJDZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnICcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG91ckNlbGwudGV4dENvbnRlbnQgPSAn5pegJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOenu+mZpOeJueauiuS/oeaBr+WMuuWfn+S4reeahOelnueFnue7hOWQiOWIhuaekO+8jOWboOS4uuW3sue7j+WcqOWRveebmOihqOagvOS4reaYvuekuuS6hlxuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uueJueauiuS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVTcGVjaWFsSW5mbygpIHtcbiAgICAvLyDliJvlu7rnibnmrorkv6Hmga/pg6jliIZcbiAgICBjb25zdCBzcGVjaWFsU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uJyB9KTtcbiAgICBzcGVjaWFsU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfnibnmrorkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu654m55q6K5L+h5oGv5YiX6KGoXG4gICAgY29uc3QgaW5mb0xpc3QgPSBzcGVjaWFsU2VjdGlvbi5jcmVhdGVFbCgndWwnLCB7IGNsczogJ2Jhemktdmlldy1pbmZvLWxpc3QnIH0pO1xuXG4gICAgLy8g5re75Yqg54m55q6K5L+h5oGv6aG5XG4gICAgaWYgKHRoaXMuYmF6aUluZm8udGFpWXVhbikge1xuICAgICAgY29uc3QgdGFpWXVhbkl0ZW0gPSBpbmZvTGlzdC5jcmVhdGVFbCgnbGknKTtcbiAgICAgIHRhaVl1YW5JdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiAn6IOO5YWDOiAnIH0pO1xuXG4gICAgICAvLyDmj5Dlj5blpKnlubLlnLDmlK9cbiAgICAgIGlmICh0aGlzLmJhemlJbmZvLnRhaVl1YW4ubGVuZ3RoID49IDIpIHtcbiAgICAgICAgY29uc3Qgc3RlbSA9IHRoaXMuYmF6aUluZm8udGFpWXVhblswXTtcbiAgICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5iYXppSW5mby50YWlZdWFuWzFdO1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IHRhaVl1YW5JdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBzdGVtIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoc3RlbVNwYW4sIHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKSk7XG5cbiAgICAgICAgLy8g5Yib5bu65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IGJyYW5jaFNwYW4gPSB0YWlZdWFuSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogYnJhbmNoIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoYnJhbmNoU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoYnJhbmNoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWlZdWFuSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogdGhpcy5iYXppSW5mby50YWlZdWFuIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmJhemlJbmZvLm1pbmdHb25nKSB7XG4gICAgICBjb25zdCBtaW5nR29uZ0l0ZW0gPSBpbmZvTGlzdC5jcmVhdGVFbCgnbGknKTtcbiAgICAgIG1pbmdHb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJ+WRveWuqzogJyB9KTtcblxuICAgICAgLy8g5o+Q5Y+W5aSp5bmy5Zyw5pSvXG4gICAgICBpZiAodGhpcy5iYXppSW5mby5taW5nR29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICBjb25zdCBzdGVtID0gdGhpcy5iYXppSW5mby5taW5nR29uZ1swXTtcbiAgICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5iYXppSW5mby5taW5nR29uZ1sxXTtcblxuICAgICAgICAvLyDliJvlu7rlpKnlubLlhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3Qgc3RlbVNwYW4gPSBtaW5nR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IG1pbmdHb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogYnJhbmNoIH0pO1xuICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoYnJhbmNoU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoYnJhbmNoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtaW5nR29uZ0l0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IHRoaXMuYmF6aUluZm8ubWluZ0dvbmcgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmF6aUluZm8uc2hlbkdvbmcpIHtcbiAgICAgIGNvbnN0IHNoZW5Hb25nSXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScpO1xuICAgICAgc2hlbkdvbmdJdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiAn6Lqr5a6rOiAnIH0pO1xuXG4gICAgICAvLyDmj5Dlj5blpKnlubLlnLDmlK9cbiAgICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5Hb25nLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSB0aGlzLmJhemlJbmZvLnNoZW5Hb25nWzBdO1xuICAgICAgICBjb25zdCBicmFuY2ggPSB0aGlzLmJhemlJbmZvLnNoZW5Hb25nWzFdO1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IHNoZW5Hb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogc3RlbSB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHN0ZW1TcGFuLCB0aGlzLmdldFN0ZW1XdVhpbmcoc3RlbSkpO1xuXG4gICAgICAgIC8vIOWIm+W7uuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBicmFuY2hTcGFuID0gc2hlbkdvbmdJdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBicmFuY2ggfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShicmFuY2hTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyhicmFuY2gpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoZW5Hb25nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogdGhpcy5iYXppSW5mby5zaGVuR29uZyB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmt7vliqDmoLzlsYDkv6Hmga9cbiAgICBpZiAodGhpcy5iYXppSW5mby5nZUp1KSB7XG4gICAgICBjb25zdCBnZUp1SXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScpO1xuXG4gICAgICAvLyDliJvlu7rmoLzlsYDmoIfnrb7vvIzmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNvbnN0IGdlSnVTcGFuID0gZ2VKdUl0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDmoLzlsYA6ICR7dGhpcy5iYXppSW5mby5nZUp1fWAsXG4gICAgICAgIGNsczogJ2dlanUtdGFnIGdlanUtY2xpY2thYmxlJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tu+8jOaYvuekuuagvOWxgOivpue7huino+mHilxuICAgICAgZ2VKdVNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmJhemlJbmZvLmdlSnUpIHtcbiAgICAgICAgICB0aGlzLnNob3dHZUp1RXhwbGFuYXRpb24odGhpcy5iYXppSW5mby5nZUp1KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOagvOWxgOW8uuW6pu+8iOWmguaenOacie+8iVxuICAgICAgaWYgKHRoaXMuYmF6aUluZm8uZ2VKdVN0cmVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHN0cmVuZ3RoVmFsdWUgPSB0eXBlb2YgdGhpcy5iYXppSW5mby5nZUp1U3RyZW5ndGggPT09ICdudW1iZXInXG4gICAgICAgICAgPyB0aGlzLmJhemlJbmZvLmdlSnVTdHJlbmd0aFxuICAgICAgICAgIDogcGFyc2VJbnQodGhpcy5iYXppSW5mby5nZUp1U3RyZW5ndGgpO1xuXG4gICAgICAgIGlmICghaXNOYU4oc3RyZW5ndGhWYWx1ZSkpIHtcbiAgICAgICAgICBjb25zdCBzdHJlbmd0aFNwYW4gPSBnZUp1SXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgICAgIHRleHQ6IGAoJHtzdHJlbmd0aFZhbHVlfSUpYCxcbiAgICAgICAgICAgIGNsczogJ2dlanUtc3RyZW5ndGgnXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmoLnmja7lvLrluqblgLzorr7nva7popzoibJcbiAgICAgICAgICBpZiAoc3RyZW5ndGhWYWx1ZSA+PSA4MCkge1xuICAgICAgICAgICAgc3RyZW5ndGhTcGFuLmFkZENsYXNzKCdnZWp1LXN0cmVuZ3RoLWhpZ2gnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0cmVuZ3RoVmFsdWUgPj0gNjApIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoU3Bhbi5hZGRDbGFzcygnZ2VqdS1zdHJlbmd0aC1tZWRpdW0nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyZW5ndGhTcGFuLmFkZENsYXNzKCdnZWp1LXN0cmVuZ3RoLWxvdycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXppSW5mby5nZUp1RGV0YWlsKSB7XG4gICAgICAgIGdlSnVJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICAgIHRleHQ6IGAgKCR7dGhpcy5iYXppSW5mby5nZUp1RGV0YWlsfSlgLFxuICAgICAgICAgIGNsczogJ2dlanUtZGV0YWlsJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8g5re75Yqg5qC85bGA5YiG5p6Q5oyJ6ZKuXG4gICAgICBjb25zdCBhbmFseXplQnV0dG9uID0gZ2VKdUl0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6ICfliIbmnpAnLFxuICAgICAgICBjbHM6ICdnZWp1LWFuYWx5emUtYnV0dG9uJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tu+8jOaYvuekuuagvOWxgOWIhuaekFxuICAgICAgYW5hbHl6ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYmF6aUluZm8uZ2VKdSkge1xuICAgICAgICAgIHRoaXMuc2hvd0dlSnVBbmFseXNpcyh0aGlzLmJhemlJbmZvLmdlSnUsIHRoaXMuYmF6aUluZm8ucmlaaHVTdHJlbmd0aCB8fCAn5bmz6KGhJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDmoLzlsYDor6bmg4XmjInpkq7vvIjmmL7npLrmoLzlsYDlvaLmiJDlm6DntKDvvIlcbiAgICAgIGlmICh0aGlzLmJhemlJbmZvLmdlSnVGYWN0b3JzICYmIHRoaXMuYmF6aUluZm8uZ2VKdUZhY3RvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBkZXRhaWxCdXR0b24gPSBnZUp1SXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgICB0ZXh0OiAn6K+m5oOFJyxcbiAgICAgICAgICBjbHM6ICdnZWp1LWRldGFpbC1idXR0b24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tu+8jOaYvuekuuagvOWxgOW9ouaIkOWboOe0oFxuICAgICAgICBkZXRhaWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zaG93R2VKdUZhY3RvcnMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5re75Yqg55So56We5L+h5oGvXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueW9uZ1NoZW4pIHtcbiAgICAgIGNvbnN0IHlvbmdTaGVuSXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScpO1xuXG4gICAgICAvLyDliJvlu7rnlKjnpZ7moIfnrb7vvIzmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNvbnN0IHlvbmdTaGVuU3BhbiA9IHlvbmdTaGVuSXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYOeUqOelnjogJHt0aGlzLmJhemlJbmZvLnlvbmdTaGVufWAsXG4gICAgICAgIGNsczogJ3lvbmdzaGVuLXRhZyB5b25nc2hlbi1jbGlja2FibGUnXG4gICAgICB9KTtcblxuICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu277yM5pi+56S655So56We6K+m57uG6Kej6YeKXG4gICAgICB5b25nU2hlblNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmJhemlJbmZvLnlvbmdTaGVuKSB7XG4gICAgICAgICAgdGhpcy5zaG93WW9uZ1NoZW5FeHBsYW5hdGlvbih0aGlzLmJhemlJbmZvLnlvbmdTaGVuLCB0aGlzLmJhemlJbmZvLnlvbmdTaGVuRGV0YWlsIHx8ICcnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLmJhemlJbmZvLnlvbmdTaGVuRGV0YWlsKSB7XG4gICAgICAgIHlvbmdTaGVuSXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgICB0ZXh0OiBgICgke3RoaXMuYmF6aUluZm8ueW9uZ1NoZW5EZXRhaWx9KWAsXG4gICAgICAgICAgY2xzOiAneW9uZ3NoZW4tZGV0YWlsJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmt7vliqDnpZ7nhZ7kv6Hmga9cbiAgICB0aGlzLmFkZFNoZW5TaGFJbmZvKGluZm9MaXN0KTtcblxuICAgIC8vIOa3u+WKoOelnueFnue7hOWQiOWIhuaekCAtIOenu+WIsOeJueauiuS/oeaBr+WMuuWfn1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnNoZW5TaGEgJiYgdGhpcy5iYXppSW5mby5zaGVuU2hhLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IGNvbWJpbmF0aW9ucyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFDb21iaW5hdGlvbkFuYWx5c2lzKHRoaXMuYmF6aUluZm8uc2hlblNoYSk7XG4gICAgICBpZiAoY29tYmluYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY29tYmluYXRpb25JdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICdzaGVuc2hhLWNvbWJpbmF0aW9uLWl0ZW0nIH0pO1xuICAgICAgICBjb21iaW5hdGlvbkl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6ICfnpZ7nhZ7nu4TlkIg6ICcgfSk7XG5cbiAgICAgICAgY29uc3QgY29tYmluYXRpb25Db250YWluZXIgPSBjb21iaW5hdGlvbkl0ZW0uY3JlYXRlRGl2KHsgY2xzOiAnc2hlbnNoYS1jb21iaW5hdGlvbi1jb250YWluZXInIH0pO1xuICAgICAgICBjb21iaW5hdGlvbnMuZm9yRWFjaChjb21iaW5hdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgY29tYmluYXRpb25UYWcgPSBjb21iaW5hdGlvbkNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdzaGVuc2hhLWNvbWJpbmF0aW9uLXRhZycgfSk7XG4gICAgICAgICAgY29tYmluYXRpb25UYWcuY3JlYXRlU3Bhbih7IHRleHQ6IGNvbWJpbmF0aW9uLmNvbWJpbmF0aW9uIH0pO1xuXG4gICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu277yM5pi+56S657uE5ZCI5YiG5p6QXG4gICAgICAgICAgY29tYmluYXRpb25UYWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFDb21iaW5hdGlvbkFuYWx5c2lzKGNvbWJpbmF0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pes56m65L+h5oGv5bey56e76Iez5ZG955uY6KGo5qC85LitXG5cbiAgICAvLyDmt7vliqDkupTooYzlvLrluqbkv6Hmga9cbiAgICBpZiAodGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCkge1xuICAgICAgY29uc3Qgd3VYaW5nSXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScpO1xuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJ+S6lOihjOW8uuW6pjogJyB9KTtcblxuICAgICAgY29uc3QgeyBqaW4sIG11LCBzaHVpLCBodW8sIHR1IH0gPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoO1xuXG4gICAgICAvLyDph5FcbiAgICAgIGNvbnN0IGppblNwYW4gPSB3dVhpbmdJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg6YeRKCR7amluLnRvRml4ZWQoMSl9KWAsXG4gICAgICAgIGNsczogJ3d1eGluZy1qaW4tdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShqaW5TcGFuLCAn6YeRJyk7XG4gICAgICBqaW5TcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dXdVhpbmdFeHBsYW5hdGlvbign6YeRJywgamluLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDmnKhcbiAgICAgIGNvbnN0IG11U3BhbiA9IHd1WGluZ0l0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDmnKgoJHttdS50b0ZpeGVkKDEpfSlgLFxuICAgICAgICBjbHM6ICd3dXhpbmctbXUtdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShtdVNwYW4sICfmnKgnKTtcbiAgICAgIG11U3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93V3VYaW5nRXhwbGFuYXRpb24oJ+acqCcsIG11LnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDmsLRcbiAgICAgIGNvbnN0IHNodWlTcGFuID0gd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYOawtCgke3NodWkudG9GaXhlZCgxKX0pYCxcbiAgICAgICAgY2xzOiAnd3V4aW5nLXNodWktdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzaHVpU3BhbiwgJ+awtCcpO1xuICAgICAgc2h1aVNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd1d1WGluZ0V4cGxhbmF0aW9uKCfmsLQnLCBzaHVpLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDngatcbiAgICAgIGNvbnN0IGh1b1NwYW4gPSB3dVhpbmdJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBg54GrKCR7aHVvLnRvRml4ZWQoMSl9KWAsXG4gICAgICAgIGNsczogJ3d1eGluZy1odW8tdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShodW9TcGFuLCAn54GrJyk7XG4gICAgICBodW9TcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dXdVhpbmdFeHBsYW5hdGlvbign54GrJywgaHVvLnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOepuuagvOWIhumalFxuICAgICAgd3VYaW5nSXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogJyAnIH0pO1xuXG4gICAgICAvLyDlnJ9cbiAgICAgIGNvbnN0IHR1U3BhbiA9IHd1WGluZ0l0ZW0uY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGDlnJ8oJHt0dS50b0ZpeGVkKDEpfSlgLFxuICAgICAgICBjbHM6ICd3dXhpbmctdHUtdGFnIHd1eGluZy1jbGlja2FibGUnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh0dVNwYW4sICflnJ8nKTtcbiAgICAgIHR1U3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93V3VYaW5nRXhwbGFuYXRpb24oJ+WcnycsIHR1LnRvRml4ZWQoMSkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5pel5Li75pe66KGw5L+h5oGvXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ucmlaaHVTdHJlbmd0aCkge1xuICAgICAgY29uc3QgcmlaaHVJdGVtID0gaW5mb0xpc3QuY3JlYXRlRWwoJ2xpJyk7XG4gICAgICByaVpodUl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6ICfml6XkuLvml7roobA6ICcgfSk7XG5cbiAgICAgIGNvbnN0IGRheVd1WGluZyA9IHRoaXMuYmF6aUluZm8uZGF5V3VYaW5nIHx8ICflnJ8nOyAvLyDpu5jorqTkuLrlnJ9cbiAgICAgIGNvbnN0IHd1WGluZ0NsYXNzID0gdGhpcy5nZXRXdVhpbmdDbGFzc0Zyb21OYW1lKGRheVd1WGluZyk7XG5cbiAgICAgIC8vIOWIm+W7uuaXpeS4u+aXuuihsOagh+etvu+8jOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY29uc3QgcmlaaHVTcGFuID0gcmlaaHVJdGVtLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLnJpWmh1U3RyZW5ndGgsXG4gICAgICAgIGNsczogYHJpemh1LXN0cmVuZ3RoIHJpemh1LWNsaWNrYWJsZSB3dXhpbmctJHt3dVhpbmdDbGFzc31gLFxuICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgJ2RhdGEtcml6aHUnOiB0aGlzLmJhemlJbmZvLnJpWmh1U3RyZW5ndGgsXG4gICAgICAgICAgJ2RhdGEtd3V4aW5nJzogZGF5V3VYaW5nXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7bvvIzmmL7npLrml6XkuLvml7roobDor6bnu4bop6Pph4pcbiAgICAgIHJpWmh1U3Bhbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYmF6aUluZm8ucmlaaHVTdHJlbmd0aCAmJiB0aGlzLmJhemlJbmZvLmRheVd1WGluZykge1xuICAgICAgICAgIHRoaXMuc2hvd1JpWmh1RXhwbGFuYXRpb24odGhpcy5iYXppSW5mby5yaVpodVN0cmVuZ3RoLCB0aGlzLmJhemlJbmZvLmRheVd1WGluZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWFrOWOhuOAgeWGnOWOhuOAgeaAp+WIq+S/oeaBr+W3suenu+iHs+WRveebmOihqOagvOWJjVxuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWkp+i/kOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVEYVl1bkluZm8oKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmRhWXVuIHx8IHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65aSn6L+Q6YOo5YiGXG4gICAgY29uc3QgZGFZdW5TZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24gYmF6aS1kYXl1bi1zZWN0aW9uJyB9KTtcbiAgICBkYVl1blNlY3Rpb24uY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAn5aSn6L+Q5L+h5oGvJywgY2xzOiAnYmF6aS12aWV3LXN1YnRpdGxlJyB9KTtcblxuICAgIC8vIOWIm+W7uuWkp+i/kOihqOagvFxuICAgIGNvbnN0IHRhYmxlQ29udGFpbmVyID0gZGFZdW5TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIHRoaXMuZGFZdW5UYWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1kYXl1bi10YWJsZScgfSk7XG5cbiAgICAvLyDojrflj5blpKfov5DmlbDmja5cbiAgICAvLyDnoa7kv50gZGFZdW5EYXRhIOaYr+aVsOe7hOexu+Wei1xuICAgIGNvbnN0IGRhWXVuRGF0YSA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5kYVl1bikgPyB0aGlzLmJhemlJbmZvLmRhWXVuIDogW107XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGhpcy5kYVl1blRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5aSn6L+QJyB9KTtcbiAgICAvLyDnoa7kv50gZGFZdW5EYXRhIOaYr+aVsOe7hOexu+Wei1xuICAgIGlmIChBcnJheS5pc0FycmF5KGRhWXVuRGF0YSkpIHtcbiAgICAgIGRhWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChkeSA9PiB7XG4gICAgICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBkeS5zdGFydFllYXIudG9TdHJpbmcoKSB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOS6jOihjO+8muW5tOm+hFxuICAgIGNvbnN0IGFnZVJvdyA9IHRoaXMuZGFZdW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bm06b6EJyB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYVl1bkRhdGEpKSB7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBkeS5zdGFydEFnZS50b1N0cmluZygpIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5LiJ6KGM77ya5bmy5pSvXG4gICAgY29uc3QgZ3pSb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYVl1bkRhdGEpKSB7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goKGR5LCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIGNsczogJ2JhemktZGF5dW4tY2VsbCcsXG4gICAgICAgICAgYXR0cjogeyAnZGF0YS1pbmRleCc6IGluZGV4LnRvU3RyaW5nKCkgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyDlpoLmnpzmnInlubLmlK/vvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgICAgaWYgKGR5LmdhblpoaSAmJiBkeS5nYW5aaGkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCBzdGVtID0gZHkuZ2FuWmhpWzBdOyAvLyDlpKnlubJcbiAgICAgICAgICBjb25zdCBicmFuY2ggPSBkeS5nYW5aaGlbMV07IC8vIOWcsOaUr1xuXG4gICAgICAgICAgLy8g5Yib5bu65aSp5bmy5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3Qgc3RlbVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBzdGVtIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAgIC8vIOWIm+W7uuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IGJyYW5jaFNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiBicmFuY2ggfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIOWmguaenOayoeacieW5suaUr+aIluagvOW8j+S4jeato+ehru+8jOebtOaOpeaYvuekuuWOn+aWh+acrFxuICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBkeS5nYW5aaGkgfHwgJyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICB0aGlzLnNlbGVjdERhWXVuKGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c5piv5b2T5YmN6YCJ5Lit55qE5aSn6L+Q77yM5re75Yqg6YCJ5Lit5qC35byPXG4gICAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5zZWxlY3RlZERhWXVuSW5kZXgpIHtcbiAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOWbm+ihjO+8muWNgeelnu+8iOWmguaenOacie+8iVxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhWXVuRGF0YSkgJiYgZGFZdW5EYXRhLnNvbWUoZHkgPT4gZHkuc2hpU2hlbkdhbikpIHtcbiAgICAgIGNvbnN0IHNoaVNoZW5Sb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+WNgeelnicgfSk7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICB0ZXh0OiBkeS5zaGlTaGVuR2FuIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2Jhemktc2hpc2hlbi1jZWxsJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOS6lOihjO+8muWcsOWKv++8iOWmguaenOacie+8iVxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhWXVuRGF0YSkgJiYgZGFZdW5EYXRhLnNvbWUoZHkgPT4gZHkuZGlTaGkpKSB7XG4gICAgICBjb25zdCBkaVNoaVJvdyA9IHRoaXMuZGFZdW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIGRpU2hpUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+WcsOWKvycgfSk7XG4gICAgICBkYVl1bkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgICBkaVNoaVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgICAgdGV4dDogZHkuZGlTaGkgfHwgJycsXG4gICAgICAgICAgY2xzOiAnYmF6aS1kaXNoaS1jZWxsJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOWFreihjO+8muaXrOepulxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhWXVuRGF0YSkgJiYgZGFZdW5EYXRhLnNvbWUoZHkgPT4gZHkueHVuS29uZykpIHtcbiAgICAgIGNvbnN0IHhrUm93ID0gdGhpcy5kYVl1blRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgeGtSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5pes56m6JyB9KTtcbiAgICAgIGRhWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChkeSA9PiB7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB4a1Jvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgICAgY2xzOiAnYmF6aS14dW5rb25nLWNlbGwnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOWmguaenOacieaXrOepuu+8jOaMieS6lOihjOminOiJsuaYvuekulxuICAgICAgICBpZiAoZHkueHVuS29uZyAmJiBkeS54dW5Lb25nLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3QgeGsxID0gZHkueHVuS29uZ1swXTsgLy8g56ys5LiA5Liq5pes56m65Zyw5pSvXG4gICAgICAgICAgY29uc3QgeGsyID0gZHkueHVuS29uZ1sxXTsgLy8g56ys5LqM5Liq5pes56m65Zyw5pSvXG5cbiAgICAgICAgICAvLyDliJvlu7rnrKzkuIDkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCB4azFTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogeGsxIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azFTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azEpKTtcblxuICAgICAgICAgIC8vIOWIm+W7uuesrOS6jOS4quaXrOepuuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IHhrMlNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiB4azIgfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHhrMlNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHhrMikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIOWmguaenOayoeacieaXrOepuuaIluagvOW8j+S4jeato+ehru+8jOebtOaOpeaYvuekuuWOn+aWh+acrFxuICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBkeS54dW5Lb25nIHx8ICcnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzkuIPooYzvvJrnurPpn7PvvIjlpoLmnpzmnInvvIlcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYVl1bkRhdGEpICYmIGRhWXVuRGF0YS5zb21lKGR5ID0+IGR5Lm5hWWluKSkge1xuICAgICAgY29uc3QgbmFZaW5Sb3cgPSB0aGlzLmRhWXVuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBuYVlpblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfnurPpn7MnIH0pO1xuICAgICAgZGFZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGR5ID0+IHtcbiAgICAgICAgY29uc3QgbmFZaW4gPSBkeS5uYVlpbiB8fCAnJztcbiAgICAgICAgY29uc3QgY2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLW5heWluLWNlbGwnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChuYVlpbikge1xuICAgICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihuYVlpbik7XG4gICAgICAgICAgY29uc3QgbmFZaW5TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogbmFZaW4gfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KG5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uua1geW5tOWSjOWwj+i/kOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVMaXVOaWFuSW5mbygpIHtcbiAgICAvLyDliJvlu7rmtYHlubTlkozlsI/ov5Dpg6jliIZcbiAgICBjb25zdCBsaXVOaWFuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktbGl1bmlhbi1zZWN0aW9uJyB9KTtcbiAgICBsaXVOaWFuU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfmtYHlubTkuI7lsI/ov5Dkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65rWB5bm06KGo5qC85a655ZmoXG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSBsaXVOaWFuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICB0aGlzLmxpdU5pYW5UYWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXVuaWFuLXRhYmxlJyB9KTtcblxuICAgIC8vIOihqOagvOWGheWuueWwhuWcqHNlbGVjdERhWXVu5pa55rOV5Lit5Yqo5oCB5pu05pawXG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65rWB5pyI5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUxpdVl1ZUluZm8oKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmxpdVl1ZSB8fCB0aGlzLmJhemlJbmZvLmxpdVl1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rmtYHmnIjpg6jliIZcbiAgICBjb25zdCBsaXVZdWVTZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24gYmF6aS1saXV5dWUtc2VjdGlvbicgfSk7XG4gICAgbGl1WXVlU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfmtYHmnIjkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65rWB5pyI6KGo5qC85a655ZmoXG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSBsaXVZdWVTZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIHRoaXMubGl1WXVlVGFibGUgPSB0YWJsZUNvbnRhaW5lci5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZSBiYXppLXZpZXctbGl1eXVlLXRhYmxlJyB9KTtcblxuICAgIC8vIOihqOagvOWGheWuueWwhuWcqHNlbGVjdExpdU5pYW7mlrnms5XkuK3liqjmgIHmm7TmlrBcbiAgfVxuXG4gIC8qKlxuICAgKiDpgInmi6nlpKfov5BcbiAgICogQHBhcmFtIGluZGV4IOWkp+i/kOe0ouW8lVxuICAgKi9cbiAgcHJpdmF0ZSBzZWxlY3REYVl1bihpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmRhWXVuIHx8IGluZGV4ID49IHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5pu05paw6YCJ5Lit57Si5byVXG4gICAgdGhpcy5zZWxlY3RlZERhWXVuSW5kZXggPSBpbmRleDtcblxuICAgIC8vIOmrmOS6rumAieS4reeahOWkp+i/kOWNleWFg+agvFxuICAgIGlmICh0aGlzLmRhWXVuVGFibGUpIHtcbiAgICAgIGNvbnN0IGNlbGxzID0gdGhpcy5kYVl1blRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWRheXVuLWNlbGwnKTtcbiAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwsIGkpID0+IHtcbiAgICAgICAgaWYgKGkgPT09IGluZGV4KSB7XG4gICAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W6YCJ5Lit55qE5aSn6L+QXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8uZGFZdW4pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0ZWREYVl1biA9IHRoaXMuYmF6aUluZm8uZGFZdW5baW5kZXhdO1xuICAgIGlmICghc2VsZWN0ZWREYVl1bikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOWwneivleS7juWOn+Wni+WFq+Wtl+aVsOaNruS4reetm+mAieWHuuWxnuS6juivpeWkp+i/kOeahOa1geW5tFxuICAgIGxldCBsaXVOaWFuRGF0YSA9IHRoaXMuYmF6aUluZm8ubGl1Tmlhbj8uZmlsdGVyKGxuID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0WWVhciA9IHNlbGVjdGVkRGFZdW4uc3RhcnRZZWFyO1xuICAgICAgY29uc3QgZW5kWWVhciA9IHNlbGVjdGVkRGFZdW4uZW5kWWVhciA/PyAoc3RhcnRZZWFyICsgOSk7XG4gICAgICByZXR1cm4gbG4ueWVhciA+PSBzdGFydFllYXIgJiYgbG4ueWVhciA8PSBlbmRZZWFyO1xuICAgIH0pIHx8IFtdO1xuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5om+5Yiw5rWB5bm05pWw5o2u77yM5YiZ5Yqo5oCB55Sf5oiQXG4gICAgaWYgKGxpdU5pYW5EYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGl1TmlhbkRhdGEgPSB0aGlzLmdlbmVyYXRlTGl1TmlhbkZvckRhWXVuKHNlbGVjdGVkRGFZdW4pO1xuICAgIH1cblxuICAgIC8vIOWwneivleS7juWOn+Wni+WFq+Wtl+aVsOaNruS4reetm+mAieWHuuWxnuS6juivpeWkp+i/kOeahOWwj+i/kFxuICAgIGxldCB4aWFvWXVuRGF0YSA9IHRoaXMuYmF6aUluZm8ueGlhb1l1bj8uZmlsdGVyKHh5ID0+IHtcbiAgICAgIGlmICghc2VsZWN0ZWREYVl1bikgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3Qgc3RhcnRZZWFyID0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXI7XG4gICAgICBjb25zdCBlbmRZZWFyID0gc2VsZWN0ZWREYVl1bi5lbmRZZWFyID8/IChzdGFydFllYXIgKyA5KTtcbiAgICAgIHJldHVybiB4eS55ZWFyID49IHN0YXJ0WWVhciAmJiB4eS55ZWFyIDw9IGVuZFllYXI7XG4gICAgfSkgfHwgW107XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmib7liLDlsI/ov5DmlbDmja7vvIzliJnliqjmgIHnlJ/miJBcbiAgICBpZiAoeGlhb1l1bkRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICB4aWFvWXVuRGF0YSA9IHRoaXMuZ2VuZXJhdGVYaWFvWXVuRm9yRGFZdW4oc2VsZWN0ZWREYVl1bik7XG5cbiAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgY29uc29sZS5sb2coJ+eUn+aIkOWwj+i/kOaVsOaNrjonLCB4aWFvWXVuRGF0YSk7XG4gICAgfVxuXG4gICAgLy8g5pu05paw5rWB5bm05ZKM5bCP6L+Q5ZCI5bm26KGo5qC8XG4gICAgdGhpcy51cGRhdGVMaXVOaWFuWGlhb1l1blRhYmxlKGxpdU5pYW5EYXRhLCB4aWFvWXVuRGF0YSk7XG5cbiAgICAvLyDlpoLmnpzmnInmtYHlubTvvIzpgInmi6nnrKzkuIDkuKrmtYHlubRcbiAgICBpZiAobGl1TmlhbkRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZWxlY3RMaXVOaWFuKGxpdU5pYW5EYXRhWzBdLnllYXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDpgInmi6nmtYHlubRcbiAgICogQHBhcmFtIHllYXIg5rWB5bm05bm05Lu9XG4gICAqL1xuICBwcml2YXRlIHNlbGVjdExpdU5pYW4oeWVhcjogbnVtYmVyKSB7XG4gICAgLy8g5pu05paw6YCJ5Lit55qE5rWB5bm05bm05Lu9XG4gICAgdGhpcy5zZWxlY3RlZExpdU5pYW5ZZWFyID0geWVhcjtcblxuICAgIC8vIOmrmOS6rumAieS4reeahOa1geW5tOWNleWFg+agvFxuICAgIGlmICh0aGlzLmxpdU5pYW5UYWJsZSkge1xuICAgICAgY29uc3QgY2VsbHMgPSB0aGlzLmxpdU5pYW5UYWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXVuaWFuLWNlbGwnKTtcbiAgICAgIGNlbGxzLmZvckVhY2goY2VsbCA9PiB7XG4gICAgICAgIGNvbnN0IGNlbGxZZWFyID0gcGFyc2VJbnQoY2VsbC5nZXRBdHRyaWJ1dGUoJ2RhdGEteWVhcicpIHx8ICcwJyk7XG4gICAgICAgIGlmIChjZWxsWWVhciA9PT0geWVhcikge1xuICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOafpeaJvumAieS4reeahOa1geW5tOaVsOaNrlxuICAgIGNvbnN0IHNlbGVjdGVkTGl1TmlhbiA9IHRoaXMuZmluZExpdU5pYW5CeVllYXIoeWVhcik7XG5cbiAgICAvLyDlsJ3or5Xojrflj5bmtYHmnIjkv6Hmga9cbiAgICBsZXQgbGl1WXVlRGF0YTogYW55W10gPSBbXTtcblxuICAgIC8vIOWmguaenOaJvuWIsOS6hua1geW5tOaVsOaNru+8jOW5tuS4lOaciea1geaciOS/oeaBr++8jOS9v+eUqOWFtua1geaciOS/oeaBr1xuICAgIGlmIChzZWxlY3RlZExpdU5pYW4gJiYgc2VsZWN0ZWRMaXVOaWFuLmxpdVl1ZSkge1xuICAgICAgbGl1WXVlRGF0YSA9IHNlbGVjdGVkTGl1Tmlhbi5saXVZdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOWmguaenOayoeacieaJvuWIsOa1geW5tOaVsOaNruaIlua1geaciOS/oeaBr++8jOWwneivleS7juWOn+Wni+WFq+Wtl+aVsOaNruS4reafpeaJvlxuICAgICAgbGl1WXVlRGF0YSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlPy5maWx0ZXIobHkgPT4ge1xuICAgICAgICAvLyDlpoLmnpzmtYHmnIjmlbDmja7mnIl5ZWFy5bGe5oCn77yM5qOA5p+l5piv5ZCm5Yy56YWNXG4gICAgICAgIGlmIChseS55ZWFyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gbHkueWVhciA9PT0geWVhcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KSB8fCBbXTtcblxuICAgICAgLy8g5aaC5p6c5LuN54S25rKh5pyJ5om+5Yiw5rWB5pyI5pWw5o2u77yM5YiZ5Yqo5oCB55Sf5oiQXG4gICAgICBpZiAobGl1WXVlRGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8g55Sf5oiQ5rWB5pyI5pWw5o2uXG4gICAgICAgIGxpdVl1ZURhdGEgPSB0aGlzLmdlbmVyYXRlTGl1WXVlRm9yWWVhcih5ZWFyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmm7TmlrDmtYHmnIjooajmoLxcbiAgICB0aGlzLnVwZGF0ZUxpdVl1ZVRhYmxlKGxpdVl1ZURhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4uuaMh+WumuW5tOS7veeUn+aIkOa1geaciOaVsOaNrlxuICAgKiBAcGFyYW0geWVhciDlubTku71cbiAgICogQHJldHVybnMg5rWB5pyI5pWw5o2u5pWw57uEXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlTGl1WXVlRm9yWWVhcih5ZWFyOiBudW1iZXIpOiBBcnJheTx7bW9udGg6IHN0cmluZywgZ2FuWmhpOiBzdHJpbmcsIHh1bktvbmc6IHN0cmluZ30+IHtcbiAgICAvLyDlpKnlubLlnLDmlK/pobrluo9cbiAgICBjb25zdCBzdGVtcyA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCI7XG5cbiAgICAvLyDorqHnrpflubTlubLmlK9cbiAgICBjb25zdCBzdGVtSW5kZXggPSAoeWVhciAtIDQpICUgMTA7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBzdGVtc1tzdGVtSW5kZXhdO1xuXG4gICAgLy8g55Sf5oiQ5rWB5pyI5pWw5o2uXG4gICAgY29uc3QgbGl1WXVlRGF0YTogQXJyYXk8e21vbnRoOiBzdHJpbmcsIGdhblpoaTogc3RyaW5nLCB4dW5Lb25nOiBzdHJpbmd9PiA9IFtdO1xuXG4gICAgLy8g5qC55o2u5YWr5a2X5ZG955CG5a2m6KeE5YiZ77yM5rWB5pyI5bmy5pSv55qE6K6h566X5pa55rOV77yaXG4gICAgLy8g5pyI5pSv5Zu65a6a5a+55bqU77ya5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5Lql5a2Q5LiRXG4gICAgLy8g5pyI5bmy5YiZ5qC55o2u5rWB5bm05bmy5pSv56Gu5a6a6LW35aeL5pyI5bmy77yM54S25ZCO5L6d5qyh6YCS5aKeXG5cbiAgICAvLyDnoa7lrproioLku6TmnIjlubLmlK9cbiAgICAvLyDnlLLlt7HlubTotbfkuJnlr4XvvIzkuZnluprlubTotbfmiIrlr4XvvIzkuJnovpvlubTotbfluprlr4XvvIzkuIHlo6zlubTotbflo6zlr4XvvIzmiIrnmbjlubTotbfnlLLlr4VcbiAgICBsZXQgZmlyc3RNb250aFN0ZW0gPSAnJztcbiAgICBpZiAoeWVhclN0ZW0gPT09ICfnlLInIHx8IHllYXJTdGVtID09PSAn5bexJykge1xuICAgICAgZmlyc3RNb250aFN0ZW0gPSAn5LiZJztcbiAgICB9IGVsc2UgaWYgKHllYXJTdGVtID09PSAn5LmZJyB8fCB5ZWFyU3RlbSA9PT0gJ+W6micpIHtcbiAgICAgIGZpcnN0TW9udGhTdGVtID0gJ+aIiic7XG4gICAgfSBlbHNlIGlmICh5ZWFyU3RlbSA9PT0gJ+S4mScgfHwgeWVhclN0ZW0gPT09ICfovpsnKSB7XG4gICAgICBmaXJzdE1vbnRoU3RlbSA9ICfluponO1xuICAgIH0gZWxzZSBpZiAoeWVhclN0ZW0gPT09ICfkuIEnIHx8IHllYXJTdGVtID09PSAn5aOsJykge1xuICAgICAgZmlyc3RNb250aFN0ZW0gPSAn5aOsJztcbiAgICB9IGVsc2UgaWYgKHllYXJTdGVtID09PSAn5oiKJyB8fCB5ZWFyU3RlbSA9PT0gJ+eZuCcpIHtcbiAgICAgIGZpcnN0TW9udGhTdGVtID0gJ+eUsic7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RNb250aFN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2YoZmlyc3RNb250aFN0ZW0pO1xuXG4gICAgLy8g55Sf5oiQMTLkuKrmnIjnmoTmtYHmnIjmlbDmja5cbiAgICBmb3IgKGxldCBtb250aCA9IDE7IG1vbnRoIDw9IDEyOyBtb250aCsrKSB7XG4gICAgICAvLyDorqHnrpfmnIjlubLvvIjmraPmnIjlr4XmnIjlvIDlp4vvvIzmr4/mnIjpgJLlop7kuIDkvY3vvIlcbiAgICAgIGNvbnN0IG1vbnRoU3RlbUluZGV4ID0gKGZpcnN0TW9udGhTdGVtSW5kZXggKyBtb250aCAtIDEpICUgMTA7XG4gICAgICBjb25zdCBtb250aFN0ZW0gPSBzdGVtc1ttb250aFN0ZW1JbmRleF07XG5cbiAgICAgIC8vIOaciOaUr+WbuuWumuWvueW6lFxuICAgICAgY29uc3QgbW9udGhCcmFuY2hNYXAgPSBbJycsICflr4UnLCAn5Y2vJywgJ+i+sCcsICflt7MnLCAn5Y2IJywgJ+acqicsICfnlLMnLCAn6YWJJywgJ+aIjCcsICfkuqUnLCAn5a2QJywgJ+S4kSddO1xuICAgICAgY29uc3QgbW9udGhCcmFuY2ggPSBtb250aEJyYW5jaE1hcFttb250aF07XG5cbiAgICAgIC8vIOe7hOWQiOW5suaUr1xuICAgICAgY29uc3QgZ2FuWmhpID0gbW9udGhTdGVtICsgbW9udGhCcmFuY2g7XG5cbiAgICAgIC8vIOiuoeeul+aXrOepulxuICAgICAgY29uc3QgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhtb250aFN0ZW0sIG1vbnRoQnJhbmNoKTtcblxuICAgICAgLy8g5Lit5paH5pyI5Lu9XG4gICAgICBjb25zdCBjaGluZXNlTW9udGhzID0gWycnLCAn5q2jJywgJ+S6jCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WGrCcsICfohYonXTtcbiAgICAgIGNvbnN0IG1vbnRoVGV4dCA9IGNoaW5lc2VNb250aHNbbW9udGhdICsgJ+aciCc7XG5cbiAgICAgIGxpdVl1ZURhdGEucHVzaCh7XG4gICAgICAgIG1vbnRoOiBtb250aFRleHQsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgeHVuS29uZ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpdVl1ZURhdGE7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5bm05Lu95p+l5om+5rWB5bm05pWw5o2uXG4gICAqIEBwYXJhbSB5ZWFyIOa1geW5tOW5tOS7vVxuICAgKiBAcmV0dXJucyDmtYHlubTmlbDmja7lr7nosaFcbiAgICovXG4gIHByaXZhdGUgZmluZExpdU5pYW5CeVllYXIoeWVhcjogbnVtYmVyKTogYW55IHtcbiAgICAvLyDku47ljp/lp4vmtYHlubTmlbDmja7kuK3mn6Xmib5cbiAgICBpZiAodGhpcy5iYXppSW5mby5saXVOaWFuKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpdU5pYW4gb2YgdGhpcy5iYXppSW5mby5saXVOaWFuKSB7XG4gICAgICAgIGlmIChsaXVOaWFuLnllYXIgPT09IHllYXIpIHtcbiAgICAgICAgICByZXR1cm4gbGl1TmlhbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiDmm7TmlrDmtYHlubTlkozlsI/ov5DlkIjlubbooajmoLxcbiAgICogQHBhcmFtIGxpdU5pYW4g5rWB5bm05pWw5o2uXG4gICAqIEBwYXJhbSB4aWFvWXVuIOWwj+i/kOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVOaWFuWGlhb1l1blRhYmxlKGxpdU5pYW46IGFueVtdLCB4aWFvWXVuOiBhbnlbXSkge1xuICAgIGlmICghdGhpcy5saXVOaWFuVGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDmuIXnqbrooajmoLxcbiAgICB0aGlzLmxpdU5pYW5UYWJsZS5lbXB0eSgpO1xuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6L+U5ZueXG4gICAgaWYgKGxpdU5pYW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5re75Yqg5Yqo55S75pWI5p6cXG4gICAgdGhpcy5saXVOaWFuVGFibGUuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICB0aGlzLmxpdU5pYW5UYWJsZS5zdHlsZS50cmFuc2l0aW9uID0gYG9wYWNpdHkgJHt0aGlzLmFuaW1hdGlvbkR1cmF0aW9ufW1zIGVhc2UtaW4tb3V0YDtcblxuICAgIC8vIOesrOS4gOihjO+8muW5tOS7vVxuICAgIGNvbnN0IHllYXJSb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOS7vScgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4ueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBsbi5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8mua1geW5tOW5suaUr1xuICAgIGNvbnN0IGxuR3pSb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBsbkd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+a1geW5tCcgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gbG5HelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIGNsczogJ2JhemktbGl1bmlhbi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogbG4ueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzmnInlubLmlK/vvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgIGlmIChsbi5nYW5aaGkgJiYgbG4uZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSBsbi5nYW5aaGlbMF07IC8vIOWkqeW5slxuICAgICAgICBjb25zdCBicmFuY2ggPSBsbi5nYW5aaGlbMV07IC8vIOWcsOaUr1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5bmy5pSv5oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBsbi5nYW5aaGkgfHwgJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RMaXVOaWFuKGxuLnllYXIpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOaYr+W9k+WJjemAieS4reeahOa1geW5tO+8jOa3u+WKoOmAieS4reagt+W8j1xuICAgICAgaWYgKGxuLnllYXIgPT09IHRoaXMuc2VsZWN0ZWRMaXVOaWFuWWVhcikge1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDnrKzlm5vooYzvvJrmtYHlubTljYHnpZ7vvIjlpoLmnpzmnInvvIlcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLnNoaVNoZW5HYW4pKSB7XG4gICAgICBjb25zdCBsblNoaVNoZW5Sb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIGxuU2hpU2hlblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubTljYHnpZ4nIH0pO1xuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGxuU2hpU2hlblJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgICAgdGV4dDogbG4uc2hpU2hlbkdhbiB8fCAnJyxcbiAgICAgICAgICBjbHM6ICdiYXppLXNoaXNoZW4tY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzkupTooYzvvJrmtYHlubTlnLDlir/vvIjlpoLmnpzmnInvvIlcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLmRpU2hpKSkge1xuICAgICAgY29uc3QgbG5EaVNoaVJvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgbG5EaVNoaVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubTlnLDlir8nIH0pO1xuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGxuRGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGxuLmRpU2hpIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzlha3ooYzvvJrmtYHlubTml6znqbpcbiAgICBpZiAobGl1Tmlhbi5zb21lKGxuID0+IGxuLnh1bktvbmcpKSB7XG4gICAgICBjb25zdCBsblhrUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBsblhrUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+a1geW5tOaXrOepuicgfSk7XG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgY2VsbCA9IGxuWGtSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIGNsczogJ2JhemkteHVua29uZy1jZWxsJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDlpoLmnpzmnInml6znqbrvvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgICAgaWYgKGxuLnh1bktvbmcgJiYgbG4ueHVuS29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHhrMSA9IGxuLnh1bktvbmdbMF07IC8vIOesrOS4gOS4quaXrOepuuWcsOaUr1xuICAgICAgICAgIGNvbnN0IHhrMiA9IGxuLnh1bktvbmdbMV07IC8vIOesrOS6jOS4quaXrOepuuWcsOaUr1xuXG4gICAgICAgICAgLy8g5Yib5bu656ys5LiA5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3QgeGsxU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMSB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoeGsxU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoeGsxKSk7XG5cbiAgICAgICAgICAvLyDliJvlu7rnrKzkuozkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCB4azJTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogeGsyIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azJTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDlpoLmnpzmsqHmnInml6znqbrmiJbmoLzlvI/kuI3mraPnoa7vvIznm7TmjqXmmL7npLrljp/mlofmnKxcbiAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gbG4ueHVuS29uZyB8fCAnJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5LiD6KGM77ya5bCP6L+Q5bmy5pSvXG4gICAgaWYgKHhpYW9ZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeHlHelJvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgeHlHelJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5AnIH0pO1xuXG4gICAgICAvLyDliJvlu7rkuIDkuKrmmKDlsITvvIznlKjkuo7lv6vpgJ/mn6Xmib7nibnlrprlubTku73nmoTlsI/ov5BcbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB4eUd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLXhpYW95dW4tY2VsbCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJ5bCP6L+Q5bmy5pSv77yM5oyJ5LqU6KGM6aKc6Imy5pi+56S6XG4gICAgICAgIGlmICh4eSAmJiB4eS5nYW5aaGkgJiYgeHkuZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3Qgc3RlbSA9IHh5LmdhblpoaVswXTsgLy8g5aSp5bmyXG4gICAgICAgICAgY29uc3QgYnJhbmNoID0geHkuZ2FuWmhpWzFdOyAvLyDlnLDmlK9cblxuICAgICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IHN0ZW1TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogc3RlbSB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoc3RlbVNwYW4sIHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKSk7XG5cbiAgICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgICBjb25zdCBicmFuY2hTcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogYnJhbmNoIH0pO1xuICAgICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShicmFuY2hTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyhicmFuY2gpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDlpoLmnpzmsqHmnInlubLmlK/miJbmoLzlvI/kuI3mraPnoa7vvIznm7TmjqXmmL7npLrljp/mlofmnKxcbiAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0geHkgPyAoeHkuZ2FuWmhpIHx8ICcnKSA6ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5a+55bqU55qE5rWB5bm05Y2V5YWD5qC86KKr6YCJ5Lit77yM5Lmf6auY5Lqu5bCP6L+Q5Y2V5YWD5qC8XG4gICAgICAgIGlmIChsbi55ZWFyID09PSB0aGlzLnNlbGVjdGVkTGl1TmlhblllYXIpIHtcbiAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOesrOWFq+ihjO+8muWwj+i/kOWNgeelnu+8iOWmguaenOacie+8iVxuICAgIGlmICh4aWFvWXVuLmxlbmd0aCA+IDAgJiYgeGlhb1l1bi5zb21lKHh5ID0+IHh5LnNoaVNoZW5HYW4pKSB7XG4gICAgICBjb25zdCB4eVNoaVNoZW5Sb3cgPSB0aGlzLmxpdU5pYW5UYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICAgIHh5U2hpU2hlblJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5DljYHnpZ4nIH0pO1xuXG4gICAgICBjb25zdCB4eU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgIHhpYW9ZdW4uZm9yRWFjaCh4eSA9PiB7XG4gICAgICAgIHh5TWFwLnNldCh4eS55ZWFyLCB4eSk7XG4gICAgICB9KTtcblxuICAgICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICAgIGNvbnN0IHh5ID0geHlNYXAuZ2V0KGxuLnllYXIpO1xuICAgICAgICB4eVNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IHh5ID8gKHh5LnNoaVNoZW5HYW4gfHwgJycpIDogJycsXG4gICAgICAgICAgY2xzOiAnYmF6aS1zaGlzaGVuLWNlbGwnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5Lmd6KGM77ya5bCP6L+Q5Zyw5Yq/77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKHhpYW9ZdW4ubGVuZ3RoID4gMCAmJiB4aWFvWXVuLnNvbWUoeHkgPT4geHkuZGlTaGkpKSB7XG4gICAgICBjb25zdCB4eURpU2hpUm93ID0gdGhpcy5saXVOaWFuVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICB4eURpU2hpUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+Wwj+i/kOWcsOWKvycgfSk7XG5cbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIHh5RGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IHh5ID8gKHh5LmRpU2hpIHx8ICcnKSA6ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzljYHooYzvvJrlsI/ov5Dml6znqbpcbiAgICBpZiAoeGlhb1l1bi5sZW5ndGggPiAwICYmIHhpYW9ZdW4uc29tZSh4eSA9PiB4eS54dW5Lb25nKSkge1xuICAgICAgY29uc3QgeHlYa1JvdyA9IHRoaXMubGl1TmlhblRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgeHlYa1Jvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5Dml6znqbonIH0pO1xuXG4gICAgICAvLyDliJvlu7rkuIDkuKrmmKDlsITvvIznlKjkuo7lv6vpgJ/mn6Xmib7nibnlrprlubTku73nmoTlsI/ov5BcbiAgICAgIGNvbnN0IHh5TWFwID0gbmV3IE1hcCgpO1xuICAgICAgeGlhb1l1bi5mb3JFYWNoKHh5ID0+IHtcbiAgICAgICAgeHlNYXAuc2V0KHh5LnllYXIsIHh5KTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXVOaWFuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKGxuID0+IHtcbiAgICAgICAgY29uc3QgeHkgPSB4eU1hcC5nZXQobG4ueWVhcik7XG4gICAgICAgIGNvbnN0IGNlbGwgPSB4eVhrUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLXh1bmtvbmctY2VsbCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJ5pes56m677yM5oyJ5LqU6KGM6aKc6Imy5pi+56S6XG4gICAgICAgIGlmICh4eSAmJiB4eS54dW5Lb25nICYmIHh5Lnh1bktvbmcubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCB4azEgPSB4eS54dW5Lb25nWzBdOyAvLyDnrKzkuIDkuKrml6znqbrlnLDmlK9cbiAgICAgICAgICBjb25zdCB4azIgPSB4eS54dW5Lb25nWzFdOyAvLyDnrKzkuozkuKrml6znqbrlnLDmlK9cblxuICAgICAgICAgIC8vIOWIm+W7uuesrOS4gOS4quaXrOepuuWcsOaUr+WFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICAgIGNvbnN0IHhrMVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiB4azEgfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHhrMVNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHhrMSkpO1xuXG4gICAgICAgICAgLy8g5Yib5bu656ys5LqM5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgICAgY29uc3QgeGsyU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMiB9KTtcbiAgICAgICAgICB0aGlzLnNldFd1WGluZ0NvbG9yRGlyZWN0bHkoeGsyU3BhbiwgdGhpcy5nZXRCcmFuY2hXdVhpbmcoeGsyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pes56m65oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IHh5ID8gKHh5Lnh1bktvbmcgfHwgJycpIDogJyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOaYvuekuuihqOagvO+8iOW4puWKqOeUu++8iVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMubGl1TmlhblRhYmxlKSB7XG4gICAgICAgIHRoaXMubGl1TmlhblRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOa1geaciOihqOagvFxuICAgKiBAcGFyYW0gbGl1WXVlIOa1geaciOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVZdWVUYWJsZShsaXVZdWU6IGFueVtdKSB7XG4gICAgaWYgKCF0aGlzLmxpdVl1ZVRhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5riF56m66KGo5qC8XG4gICAgdGhpcy5saXVZdWVUYWJsZS5lbXB0eSgpO1xuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6L+U5ZueXG4gICAgaWYgKGxpdVl1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDmt7vliqDliqjnlLvmlYjmnpxcbiAgICB0aGlzLmxpdVl1ZVRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgdGhpcy5saXVZdWVUYWJsZS5zdHlsZS50cmFuc2l0aW9uID0gYG9wYWNpdHkgJHt0aGlzLmFuaW1hdGlvbkR1cmF0aW9ufW1zIGVhc2UtaW4tb3V0YDtcblxuICAgIC8vIOesrOS4gOihjO+8muaciOS7vVxuICAgIGNvbnN0IG1vbnRoUm93ID0gdGhpcy5saXVZdWVUYWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBtb250aFJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHmnIgnIH0pO1xuICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgIC8vIOWkhOeQhuS4jeWQjOagvOW8j+eahOaciOS7veaVsOaNrlxuICAgICAgbGV0IG1vbnRoVGV4dCA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBseS5tb250aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8g5aaC5p6c5piv5a2X56ym5Liy77yI5aaCXCLmraPmnIhcIu+8ie+8jOebtOaOpeS9v+eUqFxuICAgICAgICBtb250aFRleHQgPSBseS5tb250aDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGx5Lm1vbnRoID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyDlpoLmnpzmmK/mlbDlrZfvvIzovazmjaLkuLrkuK3mlofmnIjku71cbiAgICAgICAgY29uc3QgY2hpbmVzZU1vbnRocyA9IFsnJywgJ+atoycsICfkuownLCAn5LiJJywgJ+WbmycsICfkupQnLCAn5YWtJywgJ+S4gycsICflhasnLCAn5LmdJywgJ+WNgScsICflhqwnLCAn6IWKJ107XG4gICAgICAgIG1vbnRoVGV4dCA9IGNoaW5lc2VNb250aHNbbHkubW9udGhdICsgJ+aciCc7XG4gICAgICB9IGVsc2UgaWYgKGx5Lm1vbnRoSW5DaGluZXNlKSB7XG4gICAgICAgIC8vIOWmguaenOaciW1vbnRoSW5DaGluZXNl5bGe5oCn77yIbHVuYXItdHlwZXNjcmlwdOW6k+agvOW8j++8iVxuICAgICAgICBtb250aFRleHQgPSBseS5tb250aEluQ2hpbmVzZTtcbiAgICAgIH0gZWxzZSBpZiAobHkuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyDlpoLmnpzmnIlpbmRleOWxnuaAp++8iGx1bmFyLXR5cGVzY3JpcHTlupPmoLzlvI/vvIlcbiAgICAgICAgY29uc3QgY2hpbmVzZU1vbnRocyA9IFsn5q2jJywgJ+S6jCcsICfkuIknLCAn5ZubJywgJ+S6lCcsICflha0nLCAn5LiDJywgJ+WFqycsICfkuZ0nLCAn5Y2BJywgJ+WGrCcsICfohYonXTtcbiAgICAgICAgbW9udGhUZXh0ID0gY2hpbmVzZU1vbnRoc1tseS5pbmRleF0gKyAn5pyIJztcbiAgICAgIH1cblxuICAgICAgbW9udGhSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBtb250aFRleHQsXG4gICAgICAgIGNsczogJ2JhemktbGl1eXVlLW1vbnRoJ1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAvLyDojrflj5bmnIjku73moIfor4bvvIznlKjkuo5kYXRhLW1vbnRo5bGe5oCnXG4gICAgICBsZXQgbW9udGhJZCA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBseS5tb250aCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGx5Lm1vbnRoID09PSAnc3RyaW5nJykge1xuICAgICAgICBtb250aElkID0gbHkubW9udGgudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAobHkuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtb250aElkID0gKGx5LmluZGV4ICsgMSkudG9TdHJpbmcoKTsgLy8g57Si5byV5LuOMOW8gOWni++8jOaciOS7veS7jjHlvIDlp4tcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2VsbCA9IGd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgY2xzOiAnYmF6aS1saXV5dWUtY2VsbCcsXG4gICAgICAgIGF0dHI6IHsgJ2RhdGEtbW9udGgnOiBtb250aElkIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzmnInlubLmlK/vvIzmjInkupTooYzpopzoibLmmL7npLpcbiAgICAgIGlmIChseS5nYW5aaGkgJiYgbHkuZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0ZW0gPSBseS5nYW5aaGlbMF07IC8vIOWkqeW5slxuICAgICAgICBjb25zdCBicmFuY2ggPSBseS5nYW5aaGlbMV07IC8vIOWcsOaUr1xuXG4gICAgICAgIC8vIOWIm+W7uuWkqeW5suWFg+e0oOW5tuiuvue9ruS6lOihjOminOiJslxuICAgICAgICBjb25zdCBzdGVtU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHN0ZW0gfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseShzdGVtU3BhbiwgdGhpcy5nZXRTdGVtV3VYaW5nKHN0ZW0pKTtcblxuICAgICAgICAvLyDliJvlu7rlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgYnJhbmNoU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IGJyYW5jaCB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGJyYW5jaFNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5bmy5pSv5oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBseS5nYW5aaGkgfHwgJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRoaXMubGl1WXVlVGFibGU/LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWxpdXl1ZS1jZWxsJykuZm9yRWFjaChjID0+IHtcbiAgICAgICAgICBjLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muWNgeelnu+8iOWmguaenOacie+8iVxuICAgIGlmIChsaXVZdWUuc29tZShseSA9PiBseS5zaGlTaGVuR2FuKSkge1xuICAgICAgY29uc3Qgc2hpU2hlblJvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgICBzaGlTaGVuUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+WNgeelnicgfSk7XG4gICAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAgIHNoaVNoZW5Sb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGx5LnNoaVNoZW5HYW4gfHwgJycsXG4gICAgICAgICAgY2xzOiAnYmF6aS1zaGlzaGVuLWNlbGwnXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56ys5Zub6KGM77ya5Zyw5Yq/77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKGxpdVl1ZS5zb21lKGx5ID0+IGx5LmRpU2hpKSkge1xuICAgICAgY29uc3QgZGlTaGlSb3cgPSB0aGlzLmxpdVl1ZVRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgZGlTaGlSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5Zyw5Yq/JyB9KTtcbiAgICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgICAgZGlTaGlSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICAgIHRleHQ6IGx5LmRpU2hpIHx8ICcnLFxuICAgICAgICAgIGNsczogJ2JhemktZGlzaGktY2VsbCdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnrKzkupTooYzvvJrml6znqbpcbiAgICBjb25zdCB4a1JvdyA9IHRoaXMubGl1WXVlVGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeGtSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5pes56m6JyB9KTtcbiAgICBsaXVZdWUuZm9yRWFjaChseSA9PiB7XG4gICAgICAvLyDlpITnkIbkuI3lkIzmoLzlvI/nmoTml6znqbrmlbDmja5cbiAgICAgIGxldCB4dW5Lb25nID0gJyc7XG4gICAgICBpZiAobHkueHVuS29uZykge1xuICAgICAgICB4dW5Lb25nID0gbHkueHVuS29uZztcbiAgICAgIH0gZWxzZSBpZiAobHkueHVuICYmIGx5Lnh1bktvbmcpIHtcbiAgICAgICAgLy8gbHVuYXItdHlwZXNjcmlwdOW6k+WPr+iDveS9v+eUqOi/meenjeagvOW8j1xuICAgICAgICB4dW5Lb25nID0gbHkueHVuS29uZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIOWmguaenOayoeacieaXrOepuuaVsOaNru+8jOWwneivleiuoeeul1xuICAgICAgICBjb25zdCBnYW5aaGkgPSBseS5nYW5aaGk7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuWmhpWzBdLCBnYW5aaGlbMV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNlbGwgPSB4a1Jvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIGNsczogJ2JhemkteHVua29uZy1jZWxsJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOacieaXrOepuu+8jOaMieS6lOihjOminOiJsuaYvuekulxuICAgICAgaWYgKHh1bktvbmcgJiYgeHVuS29uZy5sZW5ndGggPj0gMikge1xuICAgICAgICBjb25zdCB4azEgPSB4dW5Lb25nWzBdOyAvLyDnrKzkuIDkuKrml6znqbrlnLDmlK9cbiAgICAgICAgY29uc3QgeGsyID0geHVuS29uZ1sxXTsgLy8g56ys5LqM5Liq5pes56m65Zyw5pSvXG5cbiAgICAgICAgLy8g5Yib5bu656ys5LiA5Liq5pes56m65Zyw5pSv5YWD57Sg5bm26K6+572u5LqU6KGM6aKc6ImyXG4gICAgICAgIGNvbnN0IHhrMVNwYW4gPSBjZWxsLmNyZWF0ZVNwYW4oeyB0ZXh0OiB4azEgfSk7XG4gICAgICAgIHRoaXMuc2V0V3VYaW5nQ29sb3JEaXJlY3RseSh4azFTcGFuLCB0aGlzLmdldEJyYW5jaFd1WGluZyh4azEpKTtcblxuICAgICAgICAvLyDliJvlu7rnrKzkuozkuKrml6znqbrlnLDmlK/lhYPntKDlubborr7nva7kupTooYzpopzoibJcbiAgICAgICAgY29uc3QgeGsyU3BhbiA9IGNlbGwuY3JlYXRlU3Bhbih7IHRleHQ6IHhrMiB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KHhrMlNwYW4sIHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHhrMikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pes56m65oiW5qC85byP5LiN5q2j56Gu77yM55u05o6l5pi+56S65Y6f5paH5pysXG4gICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSB4dW5Lb25nO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8g56ys5YWt6KGM77ya57qz6Z+z77yI5aaC5p6c5pyJ77yJXG4gICAgaWYgKGxpdVl1ZS5zb21lKGx5ID0+IGx5Lm5hWWluKSkge1xuICAgICAgY29uc3QgbmFZaW5Sb3cgPSB0aGlzLmxpdVl1ZVRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn57qz6Z+zJyB9KTtcbiAgICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgICAgY29uc3QgbmFZaW4gPSBseS5uYVlpbiB8fCAnJztcbiAgICAgICAgY29uc3QgY2VsbCA9IG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgICBjbHM6ICdiYXppLW5heWluLWNlbGwnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChuYVlpbikge1xuICAgICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihuYVlpbik7XG4gICAgICAgICAgY29uc3QgbmFZaW5TcGFuID0gY2VsbC5jcmVhdGVTcGFuKHsgdGV4dDogbmFZaW4gfSk7XG4gICAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KG5hWWluU3Bhbiwgd3VYaW5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5pi+56S66KGo5qC877yI5bim5Yqo55S777yJXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5saXVZdWVUYWJsZSkge1xuICAgICAgICB0aGlzLmxpdVl1ZVRhYmxlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4uuaMh+WumuWkp+i/kOeUn+aIkOa1geW5tOaVsOaNrlxuICAgKiBAcGFyYW0gZGFZdW4g5aSn6L+Q5pWw5o2uXG4gICAqIEByZXR1cm5zIOa1geW5tOaVsOaNruaVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUxpdU5pYW5Gb3JEYVl1bihkYVl1bjogYW55KTogQXJyYXk8e3llYXI6IG51bWJlciwgYWdlOiBudW1iZXIsIGdhblpoaTogc3RyaW5nLCB4dW5Lb25nOiBzdHJpbmcsIHNoaVNoZW5HYW4/OiBzdHJpbmcsIGRpU2hpPzogc3RyaW5nfT4ge1xuICAgIC8vIOWmguaenOayoeaciei1t+Wni+W5tOaIlue7k+adn+W5tO+8jOi/lOWbnuepuuaVsOe7hFxuICAgIGlmICghZGFZdW4gfHwgIWRhWXVuLnN0YXJ0WWVhcikge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+e7k+adn+W5tO+8iOWmguaenOacquWumuS5ie+8jOS9v+eUqOi1t+Wni+W5tCs577yJXG4gICAgY29uc3QgZW5kWWVhciA9IGRhWXVuLmVuZFllYXIgPz8gKGRhWXVuLnN0YXJ0WWVhciArIDkpO1xuXG4gICAgLy8g55Sf5oiQ5rWB5bm05pWw5o2uXG4gICAgY29uc3QgbGl1TmlhbkRhdGE6IEFycmF5PHt5ZWFyOiBudW1iZXIsIGFnZTogbnVtYmVyLCBnYW5aaGk6IHN0cmluZywgeHVuS29uZzogc3RyaW5nLCBzaGlTaGVuR2FuPzogc3RyaW5nLCBkaVNoaT86IHN0cmluZ30+ID0gW107XG4gICAgbGV0IGFnZSA9IGRhWXVuLnN0YXJ0QWdlO1xuXG4gICAgLy8g6I635Y+W5pel5bmy77yM55So5LqO6K6h566X5Y2B56WeXG4gICAgY29uc3QgZGF5U3RlbSA9IHRoaXMuYmF6aUluZm8uZGF5U3RlbTtcblxuICAgIGZvciAobGV0IHllYXIgPSBkYVl1bi5zdGFydFllYXI7IHllYXIgPD0gZW5kWWVhcjsgeWVhcisrLCBhZ2UrKykge1xuICAgICAgLy8g6K6h566X5bmy5pSvXG4gICAgICAvLyDlpKnlubLlnLDmlK/pobrluo9cbiAgICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICAgIGNvbnN0IGJyYW5jaGVzID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIjtcblxuICAgICAgLy8g6K6h566X5rWB5bm05bmy5pSvXG4gICAgICBjb25zdCBzdGVtSW5kZXggPSAoeWVhciAtIDQpICUgMTA7XG4gICAgICBjb25zdCBicmFuY2hJbmRleCA9ICh5ZWFyIC0gNCkgJSAxMjtcblxuICAgICAgY29uc3Qgc3RlbSA9IHN0ZW1zW3N0ZW1JbmRleF07XG4gICAgICBjb25zdCBicmFuY2ggPSBicmFuY2hlc1ticmFuY2hJbmRleF07XG4gICAgICBjb25zdCBnYW5aaGkgPSBzdGVtICsgYnJhbmNoO1xuXG4gICAgICAvLyDorqHnrpfml6znqbpcbiAgICAgIGNvbnN0IHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoc3RlbSwgYnJhbmNoKTtcblxuICAgICAgLy8g6K6h566X5Y2B56We77yI5aaC5p6c5pyJ5pel5bmy77yJXG4gICAgICBsZXQgc2hpU2hlbkdhbiA9ICcnO1xuICAgICAgaWYgKGRheVN0ZW0pIHtcbiAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBzdGVtKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X5Zyw5Yq/77yI5aaC5p6c5pyJ5pel5bmy77yJXG4gICAgICBsZXQgZGlTaGkgPSAnJztcbiAgICAgIGlmIChkYXlTdGVtKSB7XG4gICAgICAgIGRpU2hpID0gdGhpcy5nZXREaVNoaShkYXlTdGVtLCBicmFuY2gpO1xuICAgICAgfVxuXG4gICAgICBsaXVOaWFuRGF0YS5wdXNoKHtcbiAgICAgICAgeWVhcixcbiAgICAgICAgYWdlLFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIHh1bktvbmcsXG4gICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgIGRpU2hpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGl1TmlhbkRhdGE7XG4gIH1cblxuICAvKipcbiAgICog5Li65oyH5a6a5aSn6L+Q55Sf5oiQ5bCP6L+Q5pWw5o2uXG4gICAqIEBwYXJhbSBkYVl1biDlpKfov5DmlbDmja5cbiAgICogQHJldHVybnMg5bCP6L+Q5pWw5o2u5pWw57uEXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlWGlhb1l1bkZvckRhWXVuKGRhWXVuOiBhbnkpOiBBcnJheTx7eWVhcjogbnVtYmVyLCBhZ2U6IG51bWJlciwgZ2FuWmhpOiBzdHJpbmcsIHh1bktvbmc6IHN0cmluZywgc2hpU2hlbkdhbj86IHN0cmluZywgZGlTaGk/OiBzdHJpbmd9PiB7XG4gICAgLy8g5aaC5p6c5rKh5pyJ6LW35aeL5bm05oiW57uT5p2f5bm077yM6L+U5Zue56m65pWw57uEXG4gICAgaWYgKCFkYVl1biB8fCAhZGFZdW4uc3RhcnRZZWFyKSB7XG4gICAgICBjb25zb2xlLmxvZygn5rKh5pyJ6LW35aeL5bm077yM5peg5rOV55Sf5oiQ5bCP6L+Q5pWw5o2uJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8g6K6h566X57uT5p2f5bm077yI5aaC5p6c5pyq5a6a5LmJ77yM5L2/55So6LW35aeL5bm0KznvvIlcbiAgICBjb25zdCBlbmRZZWFyID0gZGFZdW4uZW5kWWVhciA/PyAoZGFZdW4uc3RhcnRZZWFyICsgOSk7XG4gICAgY29uc29sZS5sb2coYOWwj+i/kOW5tOS7veiMg+WbtDogJHtkYVl1bi5zdGFydFllYXJ9IC0gJHtlbmRZZWFyfWApO1xuXG4gICAgLy8g55Sf5oiQ5bCP6L+Q5pWw5o2uXG4gICAgY29uc3QgeGlhb1l1bkRhdGE6IEFycmF5PHt5ZWFyOiBudW1iZXIsIGFnZTogbnVtYmVyLCBnYW5aaGk6IHN0cmluZywgeHVuS29uZzogc3RyaW5nLCBzaGlTaGVuR2FuPzogc3RyaW5nLCBkaVNoaT86IHN0cmluZ30+ID0gW107XG4gICAgbGV0IGFnZSA9IGRhWXVuLnN0YXJ0QWdlO1xuXG4gICAgLy8g6I635Y+W5aSn6L+Q5bmy5pSvXG4gICAgY29uc3QgZGFZdW5HYW5aaGkgPSBkYVl1bi5nYW5aaGk7XG4gICAgaWYgKCFkYVl1bkdhblpoaSB8fCBkYVl1bkdhblpoaS5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCflpKfov5DlubLmlK/ml6DmlYg6JywgZGFZdW5HYW5aaGkpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCflpKfov5DlubLmlK86JywgZGFZdW5HYW5aaGkpO1xuXG4gICAgLy8g5aSp5bmy5Zyw5pSv6aG65bqPXG4gICAgY29uc3Qgc3RlbXMgPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIjtcblxuICAgIC8vIOWkp+i/kOW5suaUr+e0ouW8lVxuICAgIGNvbnN0IGRhWXVuU3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihkYVl1bkdhblpoaVswXSk7XG4gICAgY29uc3QgZGFZdW5CcmFuY2hJbmRleCA9IGJyYW5jaGVzLmluZGV4T2YoZGFZdW5HYW5aaGlbMV0pO1xuXG4gICAgaWYgKGRhWXVuU3RlbUluZGV4ID09PSAtMSB8fCBkYVl1bkJyYW5jaEluZGV4ID09PSAtMSkge1xuICAgICAgY29uc29sZS5sb2coJ+Wkp+i/kOW5suaUr+e0ouW8leaXoOaViDonLCBkYVl1blN0ZW1JbmRleCwgZGFZdW5CcmFuY2hJbmRleCk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5pel5bmy77yM55So5LqO6K6h566X5Y2B56WeXG4gICAgY29uc3QgZGF5U3RlbSA9IHRoaXMuYmF6aUluZm8uZGF5U3RlbTtcblxuICAgIC8vIOS9v+eUqOaciOafseW5suaUr+S9nOS4uuWwj+i/kOi1t+eCuVxuICAgIGNvbnN0IG1vbnRoU3RlbSA9IHRoaXMuYmF6aUluZm8ubW9udGhTdGVtO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gdGhpcy5iYXppSW5mby5tb250aEJyYW5jaDtcblxuICAgIGlmICghbW9udGhTdGVtIHx8ICFtb250aEJyYW5jaCkge1xuICAgICAgY29uc29sZS5sb2coJ+aciOafseW5suaUr+aXoOaViO+8jOS9v+eUqOWkp+i/kOW5suaUr+S9nOS4uuWwj+i/kOi1t+eCuScpO1xuXG4gICAgICAvLyDlpoLmnpzmsqHmnInmnIjmn7HlubLmlK/vvIzkvb/nlKjlpKfov5DlubLmlK/kvZzkuLrlsI/ov5DotbfngrlcbiAgICAgIGZvciAobGV0IHllYXIgPSBkYVl1bi5zdGFydFllYXI7IHllYXIgPD0gZW5kWWVhcjsgeWVhcisrLCBhZ2UrKykge1xuICAgICAgICAvLyDlsI/ov5DlubLmlK/orqHnrpfvvIjnroDljJblpITnkIbvvIzlrp7pmYXlupTmoLnmja7lkb3nkIbop4TliJnvvIlcbiAgICAgICAgLy8g6L+Z6YeM5YGH6K6+5bCP6L+Q5aSp5bmy5oyJ5bm05bmy6aG65o6S77yM5Zyw5pSv5oyJ5pyI5pSv6aG65o6SXG4gICAgICAgIGNvbnN0IHN0ZW1JbmRleCA9IChkYVl1blN0ZW1JbmRleCArICh5ZWFyIC0gZGFZdW4uc3RhcnRZZWFyKSkgJSAxMDtcbiAgICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSAoZGFZdW5CcmFuY2hJbmRleCArICh5ZWFyIC0gZGFZdW4uc3RhcnRZZWFyKSkgJSAxMjtcblxuICAgICAgICBjb25zdCBzdGVtID0gc3RlbXNbc3RlbUluZGV4XTtcbiAgICAgICAgY29uc3QgYnJhbmNoID0gYnJhbmNoZXNbYnJhbmNoSW5kZXhdO1xuICAgICAgICBjb25zdCBnYW5aaGkgPSBzdGVtICsgYnJhbmNoO1xuXG4gICAgICAgIC8vIOiuoeeul+aXrOepulxuICAgICAgICBjb25zdCB4dW5Lb25nID0gdGhpcy5jYWxjdWxhdGVYdW5Lb25nKHN0ZW0sIGJyYW5jaCk7XG5cbiAgICAgICAgLy8g6K6h566X5Y2B56We77yI5aaC5p6c5pyJ5pel5bmy77yJXG4gICAgICAgIGxldCBzaGlTaGVuR2FuID0gJyc7XG4gICAgICAgIGlmIChkYXlTdGVtKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBzdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuoeeul+WcsOWKv++8iOWmguaenOacieaXpeW5su+8iVxuICAgICAgICBsZXQgZGlTaGkgPSAnJztcbiAgICAgICAgaWYgKGRheVN0ZW0pIHtcbiAgICAgICAgICBkaVNoaSA9IHRoaXMuZ2V0RGlTaGkoZGF5U3RlbSwgYnJhbmNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHhpYW9ZdW5EYXRhLnB1c2goe1xuICAgICAgICAgIHllYXIsXG4gICAgICAgICAgYWdlLFxuICAgICAgICAgIGdhblpoaSxcbiAgICAgICAgICB4dW5Lb25nLFxuICAgICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgICAgZGlTaGlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCfkvb/nlKjmnIjmn7HlubLmlK/kvZzkuLrlsI/ov5Dotbfngrk6JywgbW9udGhTdGVtICsgbW9udGhCcmFuY2gpO1xuXG4gICAgICAvLyDmnIjmn7HlubLmlK/ntKLlvJVcbiAgICAgIGNvbnN0IG1vbnRoU3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihtb250aFN0ZW0pO1xuICAgICAgY29uc3QgbW9udGhCcmFuY2hJbmRleCA9IGJyYW5jaGVzLmluZGV4T2YobW9udGhCcmFuY2gpO1xuXG4gICAgICBmb3IgKGxldCB5ZWFyID0gZGFZdW4uc3RhcnRZZWFyOyB5ZWFyIDw9IGVuZFllYXI7IHllYXIrKywgYWdlKyspIHtcbiAgICAgICAgLy8g5bCP6L+Q5bmy5pSv6K6h566X77yI5L2/55So5pyI5p+x5bmy5pSv5L2c5Li66LW354K577yJXG4gICAgICAgIGNvbnN0IHN0ZW1JbmRleCA9IChtb250aFN0ZW1JbmRleCArICh5ZWFyIC0gZGFZdW4uc3RhcnRZZWFyKSkgJSAxMDtcbiAgICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSAobW9udGhCcmFuY2hJbmRleCArICh5ZWFyIC0gZGFZdW4uc3RhcnRZZWFyKSkgJSAxMjtcblxuICAgICAgICBjb25zdCBzdGVtID0gc3RlbXNbc3RlbUluZGV4XTtcbiAgICAgICAgY29uc3QgYnJhbmNoID0gYnJhbmNoZXNbYnJhbmNoSW5kZXhdO1xuICAgICAgICBjb25zdCBnYW5aaGkgPSBzdGVtICsgYnJhbmNoO1xuXG4gICAgICAgIC8vIOiuoeeul+aXrOepulxuICAgICAgICBjb25zdCB4dW5Lb25nID0gdGhpcy5jYWxjdWxhdGVYdW5Lb25nKHN0ZW0sIGJyYW5jaCk7XG5cbiAgICAgICAgLy8g6K6h566X5Y2B56We77yI5aaC5p6c5pyJ5pel5bmy77yJXG4gICAgICAgIGxldCBzaGlTaGVuR2FuID0gJyc7XG4gICAgICAgIGlmIChkYXlTdGVtKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBzdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuoeeul+WcsOWKv++8iOWmguaenOacieaXpeW5su+8iVxuICAgICAgICBsZXQgZGlTaGkgPSAnJztcbiAgICAgICAgaWYgKGRheVN0ZW0pIHtcbiAgICAgICAgICBkaVNoaSA9IHRoaXMuZ2V0RGlTaGkoZGF5U3RlbSwgYnJhbmNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHhpYW9ZdW5EYXRhLnB1c2goe1xuICAgICAgICAgIHllYXIsXG4gICAgICAgICAgYWdlLFxuICAgICAgICAgIGdhblpoaSxcbiAgICAgICAgICB4dW5Lb25nLFxuICAgICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgICAgZGlTaGlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHhpYW9ZdW5EYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+aXrOepulxuICAgKiBAcGFyYW0gZ2FuIOWkqeW5slxuICAgKiBAcGFyYW0gemhpIOWcsOaUr1xuICAgKiBAcmV0dXJucyDml6znqbpcbiAgICovXG4gIHByaXZhdGUgY2FsY3VsYXRlWHVuS29uZyhnYW46IHN0cmluZywgemhpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWkqeW5suW6j+WPt++8iOeUsj0wLCDkuZk9MSwgLi4uLCDnmbg9Oe+8iVxuICAgIGNvbnN0IGdhbkluZGV4ID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIi5pbmRleE9mKGdhbik7XG4gICAgLy8g5Zyw5pSv5bqP5Y+377yI5a2QPTAsIOS4kT0xLCAuLi4sIOS6pT0xMe+8iVxuICAgIGNvbnN0IHpoaUluZGV4ID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIi5pbmRleE9mKHpoaSk7XG5cbiAgICBpZiAoZ2FuSW5kZXggPCAwIHx8IHpoaUluZGV4IDwgMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+aXrOmmllxuICAgIGNvbnN0IHh1blNob3VJbmRleCA9IE1hdGguZmxvb3IoZ2FuSW5kZXggLyAyKSAqIDI7XG5cbiAgICAvLyDorqHnrpfml6znqbrlnLDmlK9cbiAgICBjb25zdCB4dW5Lb25nSW5kZXgxID0gKHh1blNob3VJbmRleCArIDEwKSAlIDEyO1xuICAgIGNvbnN0IHh1bktvbmdJbmRleDIgPSAoeHVuU2hvdUluZGV4ICsgMTEpICUgMTI7XG5cbiAgICAvLyDojrflj5bml6znqbrlnLDmlK9cbiAgICBjb25zdCB4dW5Lb25nWmhpMSA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuY2hhckF0KHh1bktvbmdJbmRleDEpO1xuICAgIGNvbnN0IHh1bktvbmdaaGkyID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIi5jaGFyQXQoeHVuS29uZ0luZGV4Mik7XG5cbiAgICByZXR1cm4geHVuS29uZ1poaTEgKyB4dW5Lb25nWmhpMjtcbiAgfVxuXG5cblxuXG5cbiAgLyoqXG4gICAqIOebtOaOpeWcqOWFg+e0oOS4iuiuvue9ruS6lOihjOminOiJslxuICAgKiBAcGFyYW0gZWxlbWVudCBIVE1M5YWD57SgXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIHNldFd1WGluZ0NvbG9yRGlyZWN0bHkoZWxlbWVudDogSFRNTEVsZW1lbnQsIHd1WGluZzogc3RyaW5nIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgaWYgKCF3dVhpbmcpIHJldHVybjtcblxuICAgIC8vIOenu+mZpOaJgOacieWPr+iDveeahOS6lOihjOexu1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnd3V4aW5nLWppbicsICd3dXhpbmctbXUnLCAnd3V4aW5nLXNodWknLCAnd3V4aW5nLWh1bycsICd3dXhpbmctdHUnKTtcblxuICAgIC8vIOa3u+WKoOWvueW6lOeahOS6lOihjOexu1xuICAgIHN3aXRjaCAod3VYaW5nKSB7XG4gICAgICBjYXNlICfph5EnOlxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3d1eGluZy1qaW4nKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOlxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3d1eGluZy1tdScpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+awtCc6XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnd3V4aW5nLXNodWknKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfngasnOlxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3d1eGluZy1odW8nKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOlxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3d1eGluZy10dScpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyDmt7vliqDlhoXogZTmoLflvI/kvZzkuLrlpIfku71cbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICcjRkZENzAwJzsgLy8g6YeRIC0g6buE6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5pyoJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICcjMmU4YjU3JzsgLy8g5pyoIC0g57u/6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5rC0JzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICcjMWU5MGZmJzsgLy8g5rC0IC0g6JOd6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICcjZmY0NTAwJzsgLy8g54GrIC0g57qi6ImyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn5ZyfJzpcbiAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICcjY2Q4NTNmJzsgLy8g5ZyfIC0g5qOV6ImyXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDkuLrlpKnlubLlhYPntKDlupTnlKjkupTooYzpopzoibJcbiAgICogQHBhcmFtIGVsZW1lbnQgSFRNTOWFg+e0oFxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICovXG4gIHByaXZhdGUgYXBwbHlTdGVtV3VYaW5nQ29sb3IoZWxlbWVudDogSFRNTEVsZW1lbnQsIHN0ZW06IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIOiOt+WPluWkqeW5suWvueW6lOeahOS6lOihjFxuICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhzdGVtKTtcblxuICAgIC8vIOebtOaOpeiuvue9ruWGheiBlOagt+W8j1xuICAgIHN3aXRjaCAod3VYaW5nKSB7XG4gICAgICBjYXNlICfph5EnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNGRkQ3MDAgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDph5EgLSDpu4ToibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICMyZThiNTcgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDmnKggLSDnu7/oibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmsLQnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICMxZTkwZmYgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDmsLQgLSDok53oibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfngasnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNmZjQ1MDAgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDngasgLSDnuqLoibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNjZDg1M2YgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDlnJ8gLSDmo5XoibJcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOS4uuWcsOaUr+WFg+e0oOW6lOeUqOS6lOihjOminOiJslxuICAgKiBAcGFyYW0gZWxlbWVudCBIVE1M5YWD57SgXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqL1xuICBwcml2YXRlIGFwcGx5QnJhbmNoV3VYaW5nQ29sb3IoZWxlbWVudDogSFRNTEVsZW1lbnQsIGJyYW5jaDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8g6I635Y+W5Zyw5pSv5a+55bqU55qE5LqU6KGMXG4gICAgY29uc3Qgd3VYaW5nID0gdGhpcy5nZXRCcmFuY2hXdVhpbmcoYnJhbmNoKTtcblxuICAgIC8vIOebtOaOpeiuvue9ruWGheiBlOagt+W8j1xuICAgIHN3aXRjaCAod3VYaW5nKSB7XG4gICAgICBjYXNlICfph5EnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNGRkQ3MDAgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDph5EgLSDpu4ToibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICMyZThiNTcgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDmnKggLSDnu7/oibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfmsLQnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICMxZTkwZmYgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDmsLQgLSDok53oibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfngasnOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNmZjQ1MDAgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDngasgLSDnuqLoibJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOlxuICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNjZDg1M2YgIWltcG9ydGFudDsgZm9udC13ZWlnaHQ6IGJvbGQgIWltcG9ydGFudDsnOyAvLyDlnJ8gLSDmo5XoibJcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cblxuXG5cblxuXG5cblxuXG4gIC8qKlxuICAgKiDku47nurPpn7PkuK3mj5Dlj5bkupTooYzlsZ7mgKdcbiAgICogQHBhcmFtIG5hWWluIOe6s+mfs1xuICAgKiBAcmV0dXJucyDkupTooYxcbiAgICovXG4gIHByaXZhdGUgZXh0cmFjdFd1WGluZ0Zyb21OYVlpbihuYVlpbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDnurPpn7PpgJrluLjmmK9cIlhY5LqU6KGMXCLnmoTmoLzlvI/vvIzlpoJcIumHkeeulOmHkVwi44CBXCLlpKfmuqrmsLRcIuetiVxuICAgIC8vIOaIkeS7rOmcgOimgeaPkOWPluacgOWQjuS4gOS4quWtl++8jOWNs+S6lOihjOWxnuaAp1xuICAgIGlmICghbmFZaW4gfHwgbmFZaW4ubGVuZ3RoIDwgMSkge1xuICAgICAgcmV0dXJuICfmnKrnn6UnO1xuICAgIH1cblxuICAgIC8vIOaPkOWPluacgOWQjuS4gOS4quWtl1xuICAgIGNvbnN0IGxhc3RDaGFyID0gbmFZaW4uY2hhckF0KG5hWWluLmxlbmd0aCAtIDEpO1xuXG4gICAgLy8g5qOA5p+l5piv5ZCm5piv5LqU6KGM5a2XXG4gICAgaWYgKFsn6YeRJywgJ+acqCcsICfmsLQnLCAn54GrJywgJ+WcnyddLmluY2x1ZGVzKGxhc3RDaGFyKSkge1xuICAgICAgcmV0dXJuIGxhc3RDaGFyO1xuICAgIH1cblxuICAgIC8vIOWmguaenOacgOWQjuS4gOS4quWtl+S4jeaYr+S6lOihjO+8jOWwneivleafpeaJvue6s+mfs+S4reWMheWQq+eahOS6lOihjOWtl1xuICAgIGZvciAoY29uc3Qgd3VYaW5nIG9mIFsn6YeRJywgJ+acqCcsICfmsLQnLCAn54GrJywgJ+WcnyddKSB7XG4gICAgICBpZiAobmFZaW4uaW5jbHVkZXMod3VYaW5nKSkge1xuICAgICAgICByZXR1cm4gd3VYaW5nO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rluKbpopzoibLnmoTol4/lubJcbiAgICogQHBhcmFtIGNvbnRhaW5lciDlrrnlmajlhYPntKBcbiAgICogQHBhcmFtIGhpZGVHYW5UZXh0IOiXj+W5suaWh+acrFxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVDb2xvcmVkSGlkZUdhbihjb250YWluZXI6IEhUTUxFbGVtZW50LCBoaWRlR2FuVGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCFoaWRlR2FuVGV4dCkge1xuICAgICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gJyc7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c6JeP5bmy5piv6YCX5Y+35YiG6ZqU55qE77yM5YiG5Yir5aSE55CG5q+P5Liq6JeP5bmyXG4gICAgaWYgKGhpZGVHYW5UZXh0LmluY2x1ZGVzKCcsJykpIHtcbiAgICAgIGNvbnN0IGhpZGVHYW5zID0gaGlkZUdhblRleHQuc3BsaXQoJywnKTtcbiAgICAgIGhpZGVHYW5zLmZvckVhY2goKGdhbiwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnN0IGdhblNwYW4gPSBjb250YWluZXIuY3JlYXRlU3Bhbih7IHRleHQ6IGdhbiB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGdhblNwYW4sIHd1WGluZyk7XG5cbiAgICAgICAgLy8g5aaC5p6c5LiN5piv5pyA5ZCO5LiA5Liq77yM5re75Yqg6YCX5Y+35YiG6ZqUXG4gICAgICAgIGlmIChpbmRleCA8IGhpZGVHYW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb250YWluZXIuY3JlYXRlU3Bhbih7IHRleHQ6ICcsJyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOWNleS4quiXj+W5slxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoaWRlR2FuVGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBnYW4gPSBoaWRlR2FuVGV4dFtpXTtcbiAgICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnN0IGdhblNwYW4gPSBjb250YWluZXIuY3JlYXRlU3Bhbih7IHRleHQ6IGdhbiB9KTtcbiAgICAgICAgdGhpcy5zZXRXdVhpbmdDb2xvckRpcmVjdGx5KGdhblNwYW4sIHd1WGluZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWkqeW5suWvueW6lOeahOS6lOihjFxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIGdldFN0ZW1XdVhpbmcoc3RlbTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfmnKgnLFxuICAgICAgJ+S5mSc6ICfmnKgnLFxuICAgICAgJ+S4mSc6ICfngasnLFxuICAgICAgJ+S4gSc6ICfngasnLFxuICAgICAgJ+aIiic6ICflnJ8nLFxuICAgICAgJ+W3sSc6ICflnJ8nLFxuICAgICAgJ+W6mic6ICfph5EnLFxuICAgICAgJ+i+myc6ICfph5EnLFxuICAgICAgJ+WjrCc6ICfmsLQnLFxuICAgICAgJ+eZuCc6ICfmsLQnXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbc3RlbV0gfHwgJ+acquefpSc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5Y2B56WeXG4gICAqIEBwYXJhbSBkYXlTdGVtIOaXpeW5slxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHJldHVybnMg5Y2B56WeXG4gICAqL1xuICBwcml2YXRlIGdldFNoaVNoZW4oZGF5U3RlbTogc3RyaW5nLCBzdGVtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOS9v+eUqEJhemlTZXJ2aWNl5Lit55qE5pa55rOVXG4gICAgcmV0dXJuIEJhemlTZXJ2aWNlLmdldFNoaVNoZW4oZGF5U3RlbSwgc3RlbSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5Zyw5pSv6JeP5bmy55qE5Y2B56WeXG4gICAqIEBwYXJhbSBkYXlTdGVtIOaXpeW5su+8iOaXpeS4u++8iVxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDol4/lubLlr7nlupTnmoTljYHnpZ7mlbDnu4RcbiAgICovXG4gIHByaXZhdGUgZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIC8vIOS9v+eUqEJhemlTZXJ2aWNl5Lit55qE5pa55rOVXG4gICAgcmV0dXJuIEJhemlTZXJ2aWNlLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/ol4/lubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg6JeP5bmy5a2X56ym5Liy77yM5aSa5Liq6JeP5bmy55So6YCX5Y+35YiG6ZqUXG4gICAqL1xuICBwcml2YXRlIGdldEhpZGVHYW4oYnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOS9v+eUqEJhemlTZXJ2aWNl5Lit55qE5pa55rOVXG4gICAgcmV0dXJuIEJhemlTZXJ2aWNlLmdldEhpZGVHYW4oYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDlir/vvIjplb/nlJ/ljYHkuoznpZ7vvIlcbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOWcsOWKv1xuICAgKi9cbiAgcHJpdmF0ZSBnZXREaVNoaShkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlnLDmlK/pobrluo9cbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDplb/nlJ/ljYHkuoznpZ7lkI3np7BcbiAgICBjb25zdCBkaVNoaU5hbWVzID0gW1wi6ZW/55SfXCIsIFwi5rKQ5rW0XCIsIFwi5Yag5bimXCIsIFwi5Li05a6YXCIsIFwi5bid5pe6XCIsIFwi6KGwXCIsIFwi55eFXCIsIFwi5q27XCIsIFwi5aKTXCIsIFwi57udXCIsIFwi6IOOXCIsIFwi5YW7XCJdO1xuXG4gICAgLy8g5ZCE5aSp5bmy55qE6ZW/55Sf5Zyw5pSv6LW354K5XG4gICAgY29uc3Qgc3RhcnRQb2ludHM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7XG4gICAgICBcIueUslwiOiBicmFuY2hlcy5pbmRleE9mKFwi5LqlXCIpLCAgLy8g55Sy5pyo6ZW/55Sf5Zyo5LqlXG4gICAgICBcIuS5mVwiOiBicmFuY2hlcy5pbmRleE9mKFwi5Y2IXCIpLCAgLy8g5LmZ5pyo6ZW/55Sf5Zyo5Y2IXG4gICAgICBcIuS4mVwiOiBicmFuY2hlcy5pbmRleE9mKFwi5a+FXCIpLCAgLy8g5LiZ54Gr6ZW/55Sf5Zyo5a+FXG4gICAgICBcIuS4gVwiOiBicmFuY2hlcy5pbmRleE9mKFwi6YWJXCIpLCAgLy8g5LiB54Gr6ZW/55Sf5Zyo6YWJXG4gICAgICBcIuaIilwiOiBicmFuY2hlcy5pbmRleE9mKFwi5a+FXCIpLCAgLy8g5oiK5Zyf6ZW/55Sf5Zyo5a+FXG4gICAgICBcIuW3sVwiOiBicmFuY2hlcy5pbmRleE9mKFwi6YWJXCIpLCAgLy8g5bex5Zyf6ZW/55Sf5Zyo6YWJXG4gICAgICBcIuW6mlwiOiBicmFuY2hlcy5pbmRleE9mKFwi5bezXCIpLCAgLy8g5bqa6YeR6ZW/55Sf5Zyo5bezXG4gICAgICBcIui+m1wiOiBicmFuY2hlcy5pbmRleE9mKFwi5a2QXCIpLCAgLy8g6L6b6YeR6ZW/55Sf5Zyo5a2QXG4gICAgICBcIuWjrFwiOiBicmFuY2hlcy5pbmRleE9mKFwi55SzXCIpLCAgLy8g5aOs5rC06ZW/55Sf5Zyo55SzXG4gICAgICBcIueZuFwiOiBicmFuY2hlcy5pbmRleE9mKFwi5Y2vXCIpICAgLy8g55m45rC06ZW/55Sf5Zyo5Y2vXG4gICAgfTtcblxuICAgIC8vIOmYtOmYs+mhuumAhuaWueWQkVxuICAgIGNvbnN0IGRpcmVjdGlvbnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7XG4gICAgICBcIueUslwiOiAxLCAgLy8g6Ziz5bmy6aG66KGMXG4gICAgICBcIuS5mVwiOiAtMSwgLy8g6Zi05bmy6YCG6KGMXG4gICAgICBcIuS4mVwiOiAxLFxuICAgICAgXCLkuIFcIjogLTEsXG4gICAgICBcIuaIilwiOiAxLFxuICAgICAgXCLlt7FcIjogLTEsXG4gICAgICBcIuW6mlwiOiAxLFxuICAgICAgXCLovptcIjogLTEsXG4gICAgICBcIuWjrFwiOiAxLFxuICAgICAgXCLnmbhcIjogLTFcbiAgICB9O1xuXG4gICAgLy8g6I635Y+W5Zyw5pSv57Si5byVXG4gICAgY29uc3QgYnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKGJyYW5jaCk7XG5cbiAgICBpZiAoIShkYXlTdGVtIGluIHN0YXJ0UG9pbnRzKSB8fCBicmFuY2hJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyDojrflj5botbfngrnlkozmlrnlkJFcbiAgICBjb25zdCBzdGFydFBvaW50ID0gc3RhcnRQb2ludHNbZGF5U3RlbV07XG4gICAgY29uc3QgZGlyZWN0aW9uID0gZGlyZWN0aW9uc1tkYXlTdGVtXTtcblxuICAgIC8vIOiuoeeul+WcsOWKv+e0ouW8lVxuICAgIGxldCBkaVNoaUluZGV4ID0gKGJyYW5jaEluZGV4IC0gc3RhcnRQb2ludCArIDEyKSAlIDEyO1xuICAgIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XG4gICAgICBkaVNoaUluZGV4ID0gKDEyIC0gZGlTaGlJbmRleCkgJSAxMjtcbiAgICB9XG5cbiAgICAvLyDov5Tlm57lnLDlir/lkI3np7BcbiAgICByZXR1cm4gZGlTaGlOYW1lc1tkaVNoaUluZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmmL7npLrnpZ7nhZ7or6bnu4bop6Pph4pcbiAgICogQHBhcmFtIHNoZW5TaGEg56We54We5ZCN56ewXG4gICAqL1xuICBwcml2YXRlIHNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYTogc3RyaW5nKSB7XG4gICAgLy8g6I635Y+W56We54We6K+m57uG6Kej6YeKXG4gICAgY29uc3Qgc2hlblNoYUluZm8gPSBTaGVuU2hhU2VydmljZS5nZXRTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSk7XG5cbiAgICAvLyDliJvlu7rkuIDkuKrkuLTml7blrrnlmahcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ3NoZW5zaGEtbW9kYWwtY29udGFpbmVyJztcbiAgICBjb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSAnMCc7XG4gICAgY29udGFpbmVyLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgY29udGFpbmVyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgY29udGFpbmVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuNSknO1xuICAgIGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIGNvbnRhaW5lci5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInO1xuICAgIGNvbnRhaW5lci5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XG4gICAgY29udGFpbmVyLnN0eWxlLnpJbmRleCA9ICcxMDAwJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICAvLyDnm7TmjqXliJvlu7pET03lhYPntKDmmL7npLrnpZ7nhZ7or6bmg4VcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ3NoZW5zaGEtbW9kYWwtY29udGVudCc7XG4gICAgbW9kYWxDb250ZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpJztcbiAgICBtb2RhbENvbnRlbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzhweCc7XG4gICAgbW9kYWxDb250ZW50LnN0eWxlLmJveFNoYWRvdyA9ICcwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xNSknO1xuICAgIG1vZGFsQ29udGVudC5zdHlsZS53aWR0aCA9ICc5MCUnO1xuICAgIG1vZGFsQ29udGVudC5zdHlsZS5tYXhXaWR0aCA9ICc2MDBweCc7XG4gICAgbW9kYWxDb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICc5MHZoJztcbiAgICBtb2RhbENvbnRlbnQuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuICAgIG1vZGFsQ29udGVudC5zdHlsZS5wYWRkaW5nID0gJzIwcHgnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuXG4gICAgLy8g5Yib5bu65qCH6aKY5ZKM57G75Z6L5a655ZmoXG4gICAgY29uc3QgaGVhZGVyQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaGVhZGVyQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgaGVhZGVyQ29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ3NwYWNlLWJldHdlZW4nO1xuICAgIGhlYWRlckNvbnRhaW5lci5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XG4gICAgaGVhZGVyQ29udGFpbmVyLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcxNXB4JztcbiAgICBoZWFkZXJDb250YWluZXIuc3R5bGUuYm9yZGVyQm90dG9tID0gJzFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlciknO1xuICAgIGhlYWRlckNvbnRhaW5lci5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzEwcHgnO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChoZWFkZXJDb250YWluZXIpO1xuXG4gICAgLy8g5Yib5bu65qCH6aKYXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gc2hlblNoYUluZm8ubmFtZTtcbiAgICB0aXRsZS5zdHlsZS5tYXJnaW4gPSAnMCc7XG4gICAgdGl0bGUuc3R5bGUuZm9udFNpemUgPSAnMS41ZW0nO1xuICAgIGhlYWRlckNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyDliJvlu7rnsbvlnotcbiAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IHNoZW5TaGFJbmZvLnR5cGU7XG4gICAgdHlwZS5zdHlsZS5wYWRkaW5nID0gJzRweCAxMHB4JztcbiAgICB0eXBlLnN0eWxlLmJvcmRlclJhZGl1cyA9ICcxNnB4JztcbiAgICB0eXBlLnN0eWxlLmZvbnRTaXplID0gJzAuOWVtJztcbiAgICB0eXBlLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XG5cbiAgICBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgIHR5cGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwgMTI4LCAwLCAwLjEpJztcbiAgICAgIHR5cGUuc3R5bGUuY29sb3IgPSAnIzJhOWQ4Zic7XG4gICAgICB0eXBlLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzJhOWQ4Zic7XG4gICAgfSBlbHNlIGlmIChzaGVuU2hhSW5mby50eXBlID09PSAn5Ye256WeJykge1xuICAgICAgdHlwZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyMjAsIDIwLCA2MCwgMC4xKSc7XG4gICAgICB0eXBlLnN0eWxlLmNvbG9yID0gJyNlNzZmNTEnO1xuICAgICAgdHlwZS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkICNlNzZmNTEnO1xuICAgIH0gZWxzZSBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgIHR5cGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMjU1LCAxNjUsIDAsIDAuMSknO1xuICAgICAgdHlwZS5zdHlsZS5jb2xvciA9ICcjZTljNDZhJztcbiAgICAgIHR5cGUuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCAjZTljNDZhJztcbiAgICB9XG5cbiAgICBoZWFkZXJDb250YWluZXIuYXBwZW5kQ2hpbGQodHlwZSk7XG5cbiAgICAvLyDliJvlu7rnroDku4vpg6jliIZcbiAgICBjb25zdCBkZXNjcmlwdGlvblNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZXNjcmlwdGlvblNlY3Rpb24uc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChkZXNjcmlwdGlvblNlY3Rpb24pO1xuXG4gICAgY29uc3QgZGVzY3JpcHRpb25UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZGVzY3JpcHRpb25UaXRsZS50ZXh0Q29udGVudCA9ICfnroDku4snO1xuICAgIGRlc2NyaXB0aW9uVGl0bGUuc3R5bGUubWFyZ2luVG9wID0gJzAnO1xuICAgIGRlc2NyaXB0aW9uVGl0bGUuc3R5bGUubWFyZ2luQm90dG9tID0gJzhweCc7XG4gICAgZGVzY3JpcHRpb25TZWN0aW9uLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uVGl0bGUpO1xuXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgZGVzY3JpcHRpb24udGV4dENvbnRlbnQgPSBzaGVuU2hhSW5mby5kZXNjcmlwdGlvbjtcbiAgICBkZXNjcmlwdGlvbi5zdHlsZS5tYXJnaW4gPSAnMCc7XG4gICAgZGVzY3JpcHRpb25TZWN0aW9uLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcblxuICAgIC8vIOWIm+W7uuivpue7huino+mHiumDqOWIhlxuICAgIGNvbnN0IGRldGFpbFNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZXRhaWxTZWN0aW9uLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcxNXB4JztcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoZGV0YWlsU2VjdGlvbik7XG5cbiAgICBjb25zdCBkZXRhaWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZGV0YWlsVGl0bGUudGV4dENvbnRlbnQgPSAn6K+m57uG6Kej6YeKJztcbiAgICBkZXRhaWxUaXRsZS5zdHlsZS5tYXJnaW5Ub3AgPSAnMCc7XG4gICAgZGV0YWlsVGl0bGUuc3R5bGUubWFyZ2luQm90dG9tID0gJzhweCc7XG4gICAgZGV0YWlsU2VjdGlvbi5hcHBlbmRDaGlsZChkZXRhaWxUaXRsZSk7XG5cbiAgICBjb25zdCBkZXRhaWxEZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBkZXRhaWxEZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IHNoZW5TaGFJbmZvLmRldGFpbERlc2NyaXB0aW9uO1xuICAgIGRldGFpbERlc2NyaXB0aW9uLnN0eWxlLm1hcmdpbiA9ICcwJztcbiAgICBkZXRhaWxTZWN0aW9uLmFwcGVuZENoaWxkKGRldGFpbERlc2NyaXB0aW9uKTtcblxuICAgIC8vIOWIm+W7uuW9seWTjemihuWfn+mDqOWIhlxuICAgIGlmIChzaGVuU2hhSW5mby5pbmZsdWVuY2UgJiYgc2hlblNoYUluZm8uaW5mbHVlbmNlLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGluZmx1ZW5jZVNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGluZmx1ZW5jZVNlY3Rpb24uc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuICAgICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZVNlY3Rpb24pO1xuXG4gICAgICBjb25zdCBpbmZsdWVuY2VUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgICBpbmZsdWVuY2VUaXRsZS50ZXh0Q29udGVudCA9ICflvbHlk43poobln58nO1xuICAgICAgaW5mbHVlbmNlVGl0bGUuc3R5bGUubWFyZ2luVG9wID0gJzAnO1xuICAgICAgaW5mbHVlbmNlVGl0bGUuc3R5bGUubWFyZ2luQm90dG9tID0gJzhweCc7XG4gICAgICBpbmZsdWVuY2VTZWN0aW9uLmFwcGVuZENoaWxkKGluZmx1ZW5jZVRpdGxlKTtcblxuICAgICAgY29uc3QgaW5mbHVlbmNlVGFncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaW5mbHVlbmNlVGFncy5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgICAgaW5mbHVlbmNlVGFncy5zdHlsZS5mbGV4V3JhcCA9ICd3cmFwJztcbiAgICAgIGluZmx1ZW5jZVRhZ3Muc3R5bGUuZ2FwID0gJzhweCc7XG5cbiAgICAgIHNoZW5TaGFJbmZvLmluZmx1ZW5jZS5mb3JFYWNoKHRhZyA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHRhZ0VsZW1lbnQudGV4dENvbnRlbnQgPSB0YWc7XG4gICAgICAgIHRhZ0VsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3ZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KSc7XG4gICAgICAgIHRhZ0VsZW1lbnQuc3R5bGUucGFkZGluZyA9ICc0cHggMTBweCc7XG4gICAgICAgIHRhZ0VsZW1lbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzE2cHgnO1xuICAgICAgICB0YWdFbGVtZW50LnN0eWxlLmZvbnRTaXplID0gJzAuOWVtJztcbiAgICAgICAgaW5mbHVlbmNlVGFncy5hcHBlbmRDaGlsZCh0YWdFbGVtZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBpbmZsdWVuY2VTZWN0aW9uLmFwcGVuZENoaWxkKGluZmx1ZW5jZVRhZ3MpO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuiuoeeul+aWueazlemDqOWIhlxuICAgIGlmIChzaGVuU2hhSW5mby5jYWxjdWxhdGlvbikge1xuICAgICAgY29uc3QgY2FsY3VsYXRpb25TZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjYWxjdWxhdGlvblNlY3Rpb24uc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuICAgICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNhbGN1bGF0aW9uU2VjdGlvbik7XG5cbiAgICAgIGNvbnN0IGNhbGN1bGF0aW9uSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjYWxjdWxhdGlvbkhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgICAgY2FsY3VsYXRpb25IZWFkZXIuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnc3BhY2UtYmV0d2Vlbic7XG4gICAgICBjYWxjdWxhdGlvbkhlYWRlci5zdHlsZS5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XG4gICAgICBjYWxjdWxhdGlvbkhlYWRlci5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnOHB4JztcbiAgICAgIGNhbGN1bGF0aW9uU2VjdGlvbi5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbkhlYWRlcik7XG5cbiAgICAgIGNvbnN0IGNhbGN1bGF0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgICAgY2FsY3VsYXRpb25UaXRsZS50ZXh0Q29udGVudCA9ICforqHnrpfmlrnms5UnO1xuICAgICAgY2FsY3VsYXRpb25UaXRsZS5zdHlsZS5tYXJnaW5Ub3AgPSAnMCc7XG4gICAgICBjYWxjdWxhdGlvblRpdGxlLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcwJztcbiAgICAgIGNhbGN1bGF0aW9uSGVhZGVyLmFwcGVuZENoaWxkKGNhbGN1bGF0aW9uVGl0bGUpO1xuXG4gICAgICAvLyDliJvlu7rlpI3liLbmjInpkq5cbiAgICAgIGNvbnN0IGNvcHlCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgIGNvcHlCdXR0b24udGV4dENvbnRlbnQgPSAn5aSN5Yi26K6h566X5pa55rOVJztcbiAgICAgIGNvcHlCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3ZhcigtLWludGVyYWN0aXZlLWFjY2VudCknO1xuICAgICAgY29weUJ1dHRvbi5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW9uLWFjY2VudCknO1xuICAgICAgY29weUJ1dHRvbi5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG4gICAgICBjb3B5QnV0dG9uLnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuICAgICAgY29weUJ1dHRvbi5zdHlsZS5wYWRkaW5nID0gJzRweCA4cHgnO1xuICAgICAgY29weUJ1dHRvbi5zdHlsZS5mb250U2l6ZSA9ICcwLjhlbSc7XG4gICAgICBjb3B5QnV0dG9uLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgICAgY29weUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g5Yib5bu65LiA5Liq5Li05pe25YWD57Sg5p2l5a2Y5YKo57qv5paH5pys5YaF5a65XG4gICAgICAgIGNvbnN0IHRlbXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRlbXBFbGVtZW50LmlubmVySFRNTCA9IHNoZW5TaGFJbmZvLmNhbGN1bGF0aW9uIHx8ICcnO1xuICAgICAgICBjb25zdCBwbGFpblRleHQgPSB0ZW1wRWxlbWVudC50ZXh0Q29udGVudCB8fCB0ZW1wRWxlbWVudC5pbm5lclRleHQ7XG5cbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocGxhaW5UZXh0KVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvcHlCdXR0b24udGV4dENvbnRlbnQgPSAn5aSN5Yi25oiQ5Yqf77yBJztcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ+WkjeWItuiuoeeul+aWueazlSc7XG4gICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5aSN5Yi25aSx6LSlOicsIGVycik7XG4gICAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ+WkjeWItuWksei0pSc7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9ICflpI3liLborqHnrpfmlrnms5UnO1xuICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgY2FsY3VsYXRpb25IZWFkZXIuYXBwZW5kQ2hpbGQoY29weUJ1dHRvbik7XG5cbiAgICAgIGNvbnN0IGNhbGN1bGF0aW9uQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY2FsY3VsYXRpb25Db250ZW50LmlubmVySFRNTCA9IHNoZW5TaGFJbmZvLmNhbGN1bGF0aW9uO1xuICAgICAgY2FsY3VsYXRpb25Db250ZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuICAgICAgY2FsY3VsYXRpb25Db250ZW50LnN0eWxlLnBhZGRpbmcgPSAnMTBweCc7XG4gICAgICBjYWxjdWxhdGlvbkNvbnRlbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgICBjYWxjdWxhdGlvbkNvbnRlbnQuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgICAgY2FsY3VsYXRpb25Db250ZW50LnN0eWxlLndoaXRlU3BhY2UgPSAncHJlLXdyYXAnO1xuICAgICAgY2FsY3VsYXRpb25Db250ZW50LnN0eWxlLm92ZXJmbG93WCA9ICdhdXRvJztcbiAgICAgIGNhbGN1bGF0aW9uQ29udGVudC5zdHlsZS51c2VyU2VsZWN0ID0gJ3RleHQnO1xuICAgICAgY2FsY3VsYXRpb25TZWN0aW9uLmFwcGVuZENoaWxkKGNhbGN1bGF0aW9uQ29udGVudCk7XG4gICAgfVxuXG4gICAgLy8g5p+l5om+55u45YWz55qE56We54We57uE5ZCIXG4gICAgaWYgKHRoaXMuYmF6aUluZm8uc2hlblNoYSAmJiB0aGlzLmJhemlJbmZvLnNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY29tYmluYXRpb25zID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUNvbWJpbmF0aW9uQW5hbHlzaXModGhpcy5iYXppSW5mby5zaGVuU2hhKTtcbiAgICAgIC8vIOenu+mZpOWPr+iDveeahOWJjee8gO+8iOWmglwi5bm05p+xOlwi77yJXG4gICAgICBjb25zdCBjbGVhblNoZW5TaGEgPSBzaGVuU2hhLmluY2x1ZGVzKCc6JykgPyBzaGVuU2hhLnNwbGl0KCc6JylbMV0gOiBzaGVuU2hhO1xuICAgICAgLy8g562b6YCJ5YyF5ZCr5b2T5YmN56We54We55qE57uE5ZCI77yM5bm25oyJ57qn5Yir5o6S5bqPXG4gICAgICBjb25zdCByZWxldmFudENvbWJpbmF0aW9ucyA9IGNvbWJpbmF0aW9ucy5maWx0ZXIoY29tYm8gPT4gY29tYm8uY29tYmluYXRpb24uaW5jbHVkZXMoY2xlYW5TaGVuU2hhKSk7XG5cbiAgICAgIGlmIChyZWxldmFudENvbWJpbmF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIOWIm+W7uuebuOWFs+e7hOWQiOWuueWZqFxuICAgICAgICBjb25zdCBjb21iaW5hdGlvbnNTZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbWJpbmF0aW9uc1NlY3Rpb24uc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuICAgICAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY29tYmluYXRpb25zU2VjdGlvbik7XG5cbiAgICAgICAgY29uc3QgY29tYmluYXRpb25zVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgICAgICBjb21iaW5hdGlvbnNUaXRsZS50ZXh0Q29udGVudCA9ICfnm7jlhbPnpZ7nhZ7nu4TlkIgnO1xuICAgICAgICBjb21iaW5hdGlvbnNUaXRsZS5zdHlsZS5tYXJnaW5Ub3AgPSAnMCc7XG4gICAgICAgIGNvbWJpbmF0aW9uc1RpdGxlLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICc4cHgnO1xuICAgICAgICBjb21iaW5hdGlvbnNTZWN0aW9uLmFwcGVuZENoaWxkKGNvbWJpbmF0aW9uc1RpdGxlKTtcblxuICAgICAgICAvLyDmjInnu4TlkIjnuqfliKvmjpLluo/vvIg057qn57uE5ZCI5LyY5YWI5pi+56S677yM54S25ZCO5pivM+e6p++8jOacgOWQjuaYrzLnuqfvvIlcbiAgICAgICAgY29uc3Qgc29ydGVkQ29tYmluYXRpb25zID0gWy4uLnJlbGV2YW50Q29tYmluYXRpb25zXS5zb3J0KChhLCBiKSA9PiAoYi5sZXZlbCB8fCAyKSAtIChhLmxldmVsIHx8IDIpKTtcblxuICAgICAgICAvLyDliJvlu7rnu4TlkIjliJfooahcbiAgICAgICAgc29ydGVkQ29tYmluYXRpb25zLmZvckVhY2goY29tYm8gPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbWJvQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgY29tYm9Db250YWluZXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzEwcHgnO1xuICAgICAgICAgIGNvbWJvQ29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAnMTBweCc7XG4gICAgICAgICAgY29tYm9Db250YWluZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgICAgICAgY29tYm9Db250YWluZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3ZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KSc7XG5cbiAgICAgICAgICAvLyDmoLnmja7nu4TlkIjnsbvlnovmt7vliqDkuI3lkIznmoTmoLflvI9cbiAgICAgICAgICBpZiAoY29tYm8udHlwZSA9PT0gJ2dvb2QnKSB7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5zdHlsZS5ib3JkZXJMZWZ0ID0gJzNweCBzb2xpZCAjMmE5ZDhmJztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbWJvLnR5cGUgPT09ICdiYWQnKSB7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5zdHlsZS5ib3JkZXJMZWZ0ID0gJzNweCBzb2xpZCAjZTc2ZjUxJztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbWJvLnR5cGUgPT09ICdtaXhlZCcpIHtcbiAgICAgICAgICAgIGNvbWJvQ29udGFpbmVyLnN0eWxlLmJvcmRlckxlZnQgPSAnM3B4IHNvbGlkICNlOWM0NmEnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWIm+W7uue7hOWQiOagh+mimFxuICAgICAgICAgIGNvbnN0IGNvbWJvVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICBjb21ib1RpdGxlLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XG4gICAgICAgICAgY29tYm9UaXRsZS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnNXB4JztcbiAgICAgICAgICBjb21ib1RpdGxlLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgICAgICAgY29tYm9UaXRsZS5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdzcGFjZS1iZXR3ZWVuJztcbiAgICAgICAgICBjb21ib1RpdGxlLnN0eWxlLmFsaWduSXRlbXMgPSAnY2VudGVyJztcblxuICAgICAgICAgIC8vIOe7hOWQiOWQjeensFxuICAgICAgICAgIGNvbnN0IGNvbWJvTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICBjb21ib05hbWUudGV4dENvbnRlbnQgPSBjb21iby5jb21iaW5hdGlvbjtcbiAgICAgICAgICBjb21ib1RpdGxlLmFwcGVuZENoaWxkKGNvbWJvTmFtZSk7XG5cbiAgICAgICAgICAvLyDnu4TlkIjnuqfliKvlkoznsbvlnotcbiAgICAgICAgICBjb25zdCBjb21ib0luZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAgIC8vIOagueaNrue7hOWQiOe6p+WIq+a3u+WKoOS4jeWQjOeahOagh+etvlxuICAgICAgICAgIGNvbnN0IGxldmVsVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgIGxldmVsVGFnLnN0eWxlLnBhZGRpbmcgPSAnMnB4IDZweCc7XG4gICAgICAgICAgbGV2ZWxUYWcuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzEwcHgnO1xuICAgICAgICAgIGxldmVsVGFnLnN0eWxlLmZvbnRTaXplID0gJzAuOGVtJztcbiAgICAgICAgICBsZXZlbFRhZy5zdHlsZS5tYXJnaW5SaWdodCA9ICc1cHgnO1xuXG4gICAgICAgICAgaWYgKGNvbWJvLmxldmVsID09PSA0KSB7XG4gICAgICAgICAgICBsZXZlbFRhZy50ZXh0Q29udGVudCA9ICflm5vnpZ7nhZ7nu4TlkIgnO1xuICAgICAgICAgICAgbGV2ZWxUYWcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoNzUsIDAsIDEzMCwgMC4xKSc7XG4gICAgICAgICAgICBsZXZlbFRhZy5zdHlsZS5jb2xvciA9ICcjOGEyYmUyJztcbiAgICAgICAgICAgIGxldmVsVGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzhhMmJlMic7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21iby5sZXZlbCA9PT0gMykge1xuICAgICAgICAgICAgbGV2ZWxUYWcudGV4dENvbnRlbnQgPSAn5LiJ56We54We57uE5ZCIJztcbiAgICAgICAgICAgIGxldmVsVGFnLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsIDAsIDI1NSwgMC4xKSc7XG4gICAgICAgICAgICBsZXZlbFRhZy5zdHlsZS5jb2xvciA9ICcjMDAwMGZmJztcbiAgICAgICAgICAgIGxldmVsVGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzAwMDBmZic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldmVsVGFnLnRleHRDb250ZW50ID0gJ+S6jOelnueFnue7hOWQiCc7XG4gICAgICAgICAgICBsZXZlbFRhZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLCAxMjgsIDEyOCwgMC4xKSc7XG4gICAgICAgICAgICBsZXZlbFRhZy5zdHlsZS5jb2xvciA9ICcjMDA4MDgwJztcbiAgICAgICAgICAgIGxldmVsVGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzAwODA4MCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29tYm9JbmZvLmFwcGVuZENoaWxkKGxldmVsVGFnKTtcblxuICAgICAgICAgIC8vIOagueaNrue7hOWQiOexu+Wei+a3u+WKoOS4jeWQjOeahOagh+etvlxuICAgICAgICAgIGNvbnN0IHR5cGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgdHlwZVRhZy5zdHlsZS5wYWRkaW5nID0gJzJweCA2cHgnO1xuICAgICAgICAgIHR5cGVUYWcuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzEwcHgnO1xuICAgICAgICAgIHR5cGVUYWcuc3R5bGUuZm9udFNpemUgPSAnMC44ZW0nO1xuXG4gICAgICAgICAgaWYgKGNvbWJvLnR5cGUgPT09ICdnb29kJykge1xuICAgICAgICAgICAgdHlwZVRhZy50ZXh0Q29udGVudCA9ICflkInnpZ7nu4TlkIgnO1xuICAgICAgICAgICAgdHlwZVRhZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLCAxMjgsIDAsIDAuMSknO1xuICAgICAgICAgICAgdHlwZVRhZy5zdHlsZS5jb2xvciA9ICcjMmE5ZDhmJztcbiAgICAgICAgICAgIHR5cGVUYWcuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCAjMmE5ZDhmJztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbWJvLnR5cGUgPT09ICdiYWQnKSB7XG4gICAgICAgICAgICB0eXBlVGFnLnRleHRDb250ZW50ID0gJ+WHtuelnue7hOWQiCc7XG4gICAgICAgICAgICB0eXBlVGFnLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDIyMCwgMjAsIDYwLCAwLjEpJztcbiAgICAgICAgICAgIHR5cGVUYWcuc3R5bGUuY29sb3IgPSAnI2U3NmY1MSc7XG4gICAgICAgICAgICB0eXBlVGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgI2U3NmY1MSc7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21iby50eXBlID09PSAnbWl4ZWQnKSB7XG4gICAgICAgICAgICB0eXBlVGFnLnRleHRDb250ZW50ID0gJ+WQieWHtuelnue7hOWQiCc7XG4gICAgICAgICAgICB0eXBlVGFnLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwgMTY1LCAwLCAwLjEpJztcbiAgICAgICAgICAgIHR5cGVUYWcuc3R5bGUuY29sb3IgPSAnI2U5YzQ2YSc7XG4gICAgICAgICAgICB0eXBlVGFnLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgI2U5YzQ2YSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29tYm9JbmZvLmFwcGVuZENoaWxkKHR5cGVUYWcpO1xuICAgICAgICAgIGNvbWJvVGl0bGUuYXBwZW5kQ2hpbGQoY29tYm9JbmZvKTtcbiAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib1RpdGxlKTtcblxuICAgICAgICAgIC8vIOWIm+W7uue7hOWQiOWIhuaekFxuICAgICAgICAgIGNvbnN0IGNvbWJvQW5hbHlzaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICBjb21ib0FuYWx5c2lzLnRleHRDb250ZW50ID0gY29tYm8uYW5hbHlzaXM7XG4gICAgICAgICAgY29tYm9BbmFseXNpcy5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnNXB4JztcbiAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib0FuYWx5c2lzKTtcblxuICAgICAgICAgIC8vIOa3u+WKoOe7hOWQiOadpea6kFxuICAgICAgICAgIGlmIChjb21iby5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJvU291cmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBjb21ib1NvdXJjZS50ZXh0Q29udGVudCA9ICfjgJDnu4TlkIjmnaXmupDjgJEnICsgY29tYm8uc291cmNlO1xuICAgICAgICAgICAgY29tYm9Tb3VyY2Uuc3R5bGUuZm9udFNpemUgPSAnMC45ZW0nO1xuICAgICAgICAgICAgY29tYm9Tb3VyY2Uuc3R5bGUuY29sb3IgPSAndmFyKC0tdGV4dC1tdXRlZCknO1xuICAgICAgICAgICAgY29tYm9Tb3VyY2Uuc3R5bGUubWFyZ2luVG9wID0gJzVweCc7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib1NvdXJjZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5re75Yqg57uE5ZCI5b2x5ZONXG4gICAgICAgICAgaWYgKGNvbWJvLmluZmx1ZW5jZSkge1xuICAgICAgICAgICAgY29uc3QgY29tYm9JbmZsdWVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbWJvSW5mbHVlbmNlLnRleHRDb250ZW50ID0gJ+OAkOe7hOWQiOW9seWTjeOAkScgKyBjb21iby5pbmZsdWVuY2U7XG4gICAgICAgICAgICBjb21ib0luZmx1ZW5jZS5zdHlsZS5mb250U2l6ZSA9ICcwLjllbSc7XG4gICAgICAgICAgICBjb21ib0luZmx1ZW5jZS5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW11dGVkKSc7XG4gICAgICAgICAgICBjb21ib0luZmx1ZW5jZS5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcbiAgICAgICAgICAgIGNvbWJvQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbWJvSW5mbHVlbmNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmt7vliqDlupTlr7nmlrnms5VcbiAgICAgICAgICBpZiAoY29tYm8uc29sdXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJvU29sdXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbWJvU29sdXRpb24udGV4dENvbnRlbnQgPSAn44CQ5bqU5a+55pa55rOV44CRJyArIGNvbWJvLnNvbHV0aW9uO1xuICAgICAgICAgICAgY29tYm9Tb2x1dGlvbi5zdHlsZS5mb250U2l6ZSA9ICcwLjllbSc7XG4gICAgICAgICAgICBjb21ib1NvbHV0aW9uLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtbXV0ZWQpJztcbiAgICAgICAgICAgIGNvbWJvU29sdXRpb24uc3R5bGUubWFyZ2luVG9wID0gJzVweCc7XG4gICAgICAgICAgICBjb21ib0NvbnRhaW5lci5hcHBlbmRDaGlsZChjb21ib1NvbHV0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb21iaW5hdGlvbnNTZWN0aW9uLmFwcGVuZENoaWxkKGNvbWJvQ29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65bqV6YOo5oyJ6ZKu5Yy65Z+fXG4gICAgY29uc3QgZm9vdGVyQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZm9vdGVyQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgZm9vdGVyQ29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtZW5kJztcbiAgICBmb290ZXJDb250YWluZXIuc3R5bGUubWFyZ2luVG9wID0gJzIwcHgnO1xuICAgIGZvb3RlckNvbnRhaW5lci5zdHlsZS5ib3JkZXJUb3AgPSAnMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKSc7XG4gICAgZm9vdGVyQ29udGFpbmVyLnN0eWxlLnBhZGRpbmdUb3AgPSAnMTVweCc7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGZvb3RlckNvbnRhaW5lcik7XG5cbiAgICAvLyDliJvlu7rlhbPpl63mjInpkq5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ+WFs+mXrSc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3ZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKSc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUuY29sb3IgPSAndmFyKC0tdGV4dC1ub3JtYWwpJztcbiAgICBjbG9zZUJ1dHRvbi5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUucGFkZGluZyA9ICc4cHggMTZweCc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLmZvbnRTaXplID0gJzFlbSc7XG5cbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlEb3duKTtcbiAgICB9KTtcblxuICAgIGZvb3RlckNvbnRhaW5lci5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDmt7vliqDlhbPpl63kuovku7bnm5HlkKxcbiAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0ID09PSBjb250YWluZXIpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5RG93bik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDnm5HlkKxFc2NhcGXplK5cbiAgICBjb25zdCBoYW5kbGVLZXlEb3duID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5RG93bik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlEb3duKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmmL7npLrnpZ7nhZ7nu4TlkIjliIbmnpBcbiAgICogQHBhcmFtIGNvbWJpbmF0aW9uIOelnueFnue7hOWQiFxuICAgKi9cbiAgcHJpdmF0ZSBzaG93U2hlblNoYUNvbWJpbmF0aW9uQW5hbHlzaXMoY29tYmluYXRpb246IHsgY29tYmluYXRpb246IHN0cmluZzsgYW5hbHlzaXM6IHN0cmluZyB9KSB7XG4gICAgLy8g5Yib5bu65by556qXXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbCc7XG5cbiAgICAvLyDliJvlu7rlvLnnqpflhoXlrrlcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29udGVudCc7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSAn56We54We57uE5ZCI5YiG5p6QJztcbiAgICB0aXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10aXRsZSc7XG5cbiAgICAvLyDliJvlu7rnu4TlkIjlkI3np7BcbiAgICBjb25zdCBjb21iaW5hdGlvbk5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb21iaW5hdGlvbk5hbWUudGV4dENvbnRlbnQgPSBjb21iaW5hdGlvbi5jb21iaW5hdGlvbjtcbiAgICBjb21iaW5hdGlvbk5hbWUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc3VidGl0bGUnO1xuXG4gICAgLy8g6I635Y+W57uE5ZCI5Lit55qE56We54WeXG4gICAgY29uc3Qgc2hlblNoYU5hbWVzID0gY29tYmluYXRpb24uY29tYmluYXRpb24uc3BsaXQoJyArICcpO1xuXG4gICAgLy8g5Yib5bu656We54We57G75Z6L5qCH562+5a655ZmoXG4gICAgY29uc3QgdHlwZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHR5cGVDb250YWluZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdHlwZS1jb250YWluZXInO1xuXG4gICAgLy8g5Li65q+P5Liq56We54We5Yib5bu657G75Z6L5qCH562+XG4gICAgc2hlblNoYU5hbWVzLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKG5hbWUpO1xuICAgICAgaWYgKHNoZW5TaGFJbmZvKSB7XG4gICAgICAgIGNvbnN0IHR5cGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgICAgICAgLy8g5qC55o2u56We54We57G75Z6L6K6+572u5LiN5ZCM55qE5qC35byPXG4gICAgICAgIGxldCB0eXBlQ2xhc3MgPSAnYmF6aS1tb2RhbC10eXBlJztcbiAgICAgICAgaWYgKHNoZW5TaGFJbmZvLnR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgdHlwZUNsYXNzICs9ICcgYmF6aS1tb2RhbC10eXBlLWdvb2QnO1xuICAgICAgICB9IGVsc2UgaWYgKHNoZW5TaGFJbmZvLnR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgdHlwZUNsYXNzICs9ICcgYmF6aS1tb2RhbC10eXBlLWJhZCc7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICB0eXBlQ2xhc3MgKz0gJyBiYXppLW1vZGFsLXR5cGUtbWl4ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgdHlwZVRhZy5jbGFzc05hbWUgPSB0eXBlQ2xhc3M7XG4gICAgICAgIHR5cGVUYWcudGV4dENvbnRlbnQgPSBgJHtuYW1lfSgke3NoZW5TaGFJbmZvLnR5cGV9KWA7XG4gICAgICAgIHR5cGVDb250YWluZXIuYXBwZW5kQ2hpbGQodHlwZVRhZyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rliIbmnpBcbiAgICBjb25zdCBhbmFseXNpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFuYWx5c2lzLnRleHRDb250ZW50ID0gY29tYmluYXRpb24uYW5hbHlzaXM7XG4gICAgYW5hbHlzaXMuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtYW5hbHlzaXMnO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5YaF5a655Yiw5by556qXXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY29tYmluYXRpb25OYW1lKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZUNvbnRhaW5lcik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGFuYWx5c2lzKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuXG4gICAgLy8g5re75Yqg5by556qX5Yiw6aG16Z2iXG4gICAgbW9kYWwuYXBwZW5kQ2hpbGQobW9kYWxDb250ZW50KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcblxuICAgIC8vIOeCueWHu+W8ueeql+WklumDqOWFs+mXreW8ueeql1xuICAgIG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gbW9kYWwpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGRZZWFyTW9udGhTaGVuU2hhUm93IOaWueazleW3suWIoOmZpO+8jOmAu+i+keebtOaOpeWGheiBlOWIsCBjcmVhdGVCYXppVGFibGUg5pa55rOV5LitXG5cbiAgLy8gY3JlYXRlU2hlblNoYUNlbGwg5pa55rOV5bey5Yig6Zmk77yM6YC76L6R55u05o6l5YaF6IGU5YiwIGFkZFllYXJNb250aFNoZW5TaGFSb3cg5pa55rOV5LitXG5cbiAgLyoqXG4gICAqIOa3u+WKoOelnueFnuS/oeaBr1xuICAgKiBAcGFyYW0gaW5mb0xpc3Qg5L+h5oGv5YiX6KGo5YWD57SgXG4gICAqL1xuICBwcml2YXRlIGFkZFNoZW5TaGFJbmZvKGluZm9MaXN0OiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghdGhpcy5iYXppSW5mby5zaGVuU2hhIHx8IHRoaXMuYmF6aUluZm8uc2hlblNoYS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rnpZ7nhZ7kv6Hmga/poblcbiAgICBjb25zdCBzaGVuU2hhSXRlbSA9IGluZm9MaXN0LmNyZWF0ZUVsKCdsaScsIHsgY2xzOiAnc2hlbnNoYS1pbmZvLWl0ZW0nIH0pO1xuICAgIHNoZW5TaGFJdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiAn56We54We6K+m5oOFOiAnIH0pO1xuXG4gICAgLy8g5Yib5bu656We54We6K+m5oOF5a655ZmoXG4gICAgY29uc3Qgc2hlblNoYUNvbnRhaW5lciA9IHNoZW5TaGFJdGVtLmNyZWF0ZURpdih7IGNsczogJ3NoZW5zaGEtZGV0YWlsLWNvbnRhaW5lcicgfSk7XG5cbiAgICAvLyDliJvlu7rnpZ7nhZ7moIfnrb7liJfooahcbiAgICBjb25zdCBzaGVuU2hhTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNoZW5TaGFMaXN0LmNsYXNzTmFtZSA9ICdzaGVuc2hhLWxpc3QnO1xuXG4gICAgLy8g5YiG57G756We54WeXG4gICAgY29uc3QgZ29vZFNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgYmFkU2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBtaXhlZFNoZW5TaGE6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyDlpITnkIbnpZ7nhZ7liJfooahcbiAgICB0aGlzLmJhemlJbmZvLnNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgIC8vIOiOt+WPluelnueFnuS/oeaBr1xuICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSBTaGVuU2hhU2VydmljZS5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcblxuICAgICAgaWYgKHNoZW5TaGFJbmZvKSB7XG4gICAgICAgIC8vIOagueaNruexu+Wei+WIhuexu1xuICAgICAgICBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICBnb29kU2hlblNoYS5wdXNoKHNoZW5TaGEpO1xuICAgICAgICB9IGVsc2UgaWYgKHNoZW5TaGFJbmZvLnR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgYmFkU2hlblNoYS5wdXNoKHNoZW5TaGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1peGVkU2hlblNoYS5wdXNoKHNoZW5TaGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rlkInnpZ7ljLrln59cbiAgICBpZiAoZ29vZFNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZ29vZFNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGdvb2RTZWN0aW9uLmNsYXNzTmFtZSA9ICdzaGVuc2hhLXNlY3Rpb24gZ29vZC1zZWN0aW9uJztcblxuICAgICAgY29uc3QgZ29vZFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBnb29kVGl0bGUuY2xhc3NOYW1lID0gJ3NoZW5zaGEtc2VjdGlvbi10aXRsZSc7XG4gICAgICBnb29kVGl0bGUudGV4dENvbnRlbnQgPSAn5ZCJ56WeJztcbiAgICAgIGdvb2RTZWN0aW9uLmFwcGVuZENoaWxkKGdvb2RUaXRsZSk7XG5cbiAgICAgIGNvbnN0IGdvb2RMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBnb29kTGlzdC5jbGFzc05hbWUgPSAnc2hlbnNoYS1pdGVtcyc7XG5cbiAgICAgIGdvb2RTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gJ3NoZW5zaGEtaXRlbSBnb29kLXNoZW5zaGEnO1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gc2hlblNoYS5pbmNsdWRlcygnOicpID8gc2hlblNoYS5zcGxpdCgnOicpWzFdIDogc2hlblNoYTtcbiAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2hvd1NoZW5TaGFFeHBsYW5hdGlvbihzaGVuU2hhKSk7XG5cbiAgICAgICAgLy8g5re75Yqg5o+Q56S6XG4gICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgIGlmIChzaGVuU2hhSW5mbykge1xuICAgICAgICAgIGl0ZW0udGl0bGUgPSBzaGVuU2hhSW5mby5kZXNjcmlwdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdvb2RMaXN0LmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgfSk7XG5cbiAgICAgIGdvb2RTZWN0aW9uLmFwcGVuZENoaWxkKGdvb2RMaXN0KTtcbiAgICAgIHNoZW5TaGFMaXN0LmFwcGVuZENoaWxkKGdvb2RTZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rlkInlh7bnpZ7ljLrln59cbiAgICBpZiAobWl4ZWRTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1peGVkU2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbWl4ZWRTZWN0aW9uLmNsYXNzTmFtZSA9ICdzaGVuc2hhLXNlY3Rpb24gbWl4ZWQtc2VjdGlvbic7XG5cbiAgICAgIGNvbnN0IG1peGVkVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIG1peGVkVGl0bGUuY2xhc3NOYW1lID0gJ3NoZW5zaGEtc2VjdGlvbi10aXRsZSc7XG4gICAgICBtaXhlZFRpdGxlLnRleHRDb250ZW50ID0gJ+WQieWHtuelnic7XG4gICAgICBtaXhlZFNlY3Rpb24uYXBwZW5kQ2hpbGQobWl4ZWRUaXRsZSk7XG5cbiAgICAgIGNvbnN0IG1peGVkTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbWl4ZWRMaXN0LmNsYXNzTmFtZSA9ICdzaGVuc2hhLWl0ZW1zJztcblxuICAgICAgbWl4ZWRTaGVuU2hhLmZvckVhY2goc2hlblNoYSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gJ3NoZW5zaGEtaXRlbSBtaXhlZC1zaGVuc2hhJztcbiAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IHNoZW5TaGEuaW5jbHVkZXMoJzonKSA/IHNoZW5TaGEuc3BsaXQoJzonKVsxXSA6IHNoZW5TaGE7XG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSkpO1xuXG4gICAgICAgIC8vIOa3u+WKoOaPkOekulxuICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICBpZiAoc2hlblNoYUluZm8pIHtcbiAgICAgICAgICBpdGVtLnRpdGxlID0gc2hlblNoYUluZm8uZGVzY3JpcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBtaXhlZExpc3QuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgICB9KTtcblxuICAgICAgbWl4ZWRTZWN0aW9uLmFwcGVuZENoaWxkKG1peGVkTGlzdCk7XG4gICAgICBzaGVuU2hhTGlzdC5hcHBlbmRDaGlsZChtaXhlZFNlY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuWHtuelnuWMuuWfn1xuICAgIGlmIChiYWRTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGJhZFNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGJhZFNlY3Rpb24uY2xhc3NOYW1lID0gJ3NoZW5zaGEtc2VjdGlvbiBiYWQtc2VjdGlvbic7XG5cbiAgICAgIGNvbnN0IGJhZFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBiYWRUaXRsZS5jbGFzc05hbWUgPSAnc2hlbnNoYS1zZWN0aW9uLXRpdGxlJztcbiAgICAgIGJhZFRpdGxlLnRleHRDb250ZW50ID0gJ+WHtuelnic7XG4gICAgICBiYWRTZWN0aW9uLmFwcGVuZENoaWxkKGJhZFRpdGxlKTtcblxuICAgICAgY29uc3QgYmFkTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgYmFkTGlzdC5jbGFzc05hbWUgPSAnc2hlbnNoYS1pdGVtcyc7XG5cbiAgICAgIGJhZFNoZW5TaGEuZm9yRWFjaChzaGVuU2hhID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgaXRlbS5jbGFzc05hbWUgPSAnc2hlbnNoYS1pdGVtIGJhZC1zaGVuc2hhJztcbiAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IHNoZW5TaGEuaW5jbHVkZXMoJzonKSA/IHNoZW5TaGEuc3BsaXQoJzonKVsxXSA6IHNoZW5TaGE7XG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnNob3dTaGVuU2hhRXhwbGFuYXRpb24oc2hlblNoYSkpO1xuXG4gICAgICAgIC8vIOa3u+WKoOaPkOekulxuICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IFNoZW5TaGFTZXJ2aWNlLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICBpZiAoc2hlblNoYUluZm8pIHtcbiAgICAgICAgICBpdGVtLnRpdGxlID0gc2hlblNoYUluZm8uZGVzY3JpcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBiYWRMaXN0LmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgfSk7XG5cbiAgICAgIGJhZFNlY3Rpb24uYXBwZW5kQ2hpbGQoYmFkTGlzdCk7XG4gICAgICBzaGVuU2hhTGlzdC5hcHBlbmRDaGlsZChiYWRTZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyDmt7vliqDmoLflvI9cbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgICAuc2hlbnNoYS1saXN0IHtcbiAgICAgICAgbWFyZ2luLXRvcDogOHB4O1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBnYXA6IDEwcHg7XG4gICAgICB9XG5cbiAgICAgIC5zaGVuc2hhLXNlY3Rpb24ge1xuICAgICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICB9XG5cbiAgICAgIC5zaGVuc2hhLXNlY3Rpb24tdGl0bGUge1xuICAgICAgICBwYWRkaW5nOiA0cHggOHB4O1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgfVxuXG4gICAgICAuZ29vZC1zZWN0aW9uIC5zaGVuc2hhLXNlY3Rpb24tdGl0bGUge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQyLCAxNTcsIDE0MywgMC4xKTtcbiAgICAgICAgY29sb3I6ICMyYTlkOGY7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgIzJhOWQ4ZjtcbiAgICAgIH1cblxuICAgICAgLmJhZC1zZWN0aW9uIC5zaGVuc2hhLXNlY3Rpb24tdGl0bGUge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzMSwgMTExLCA4MSwgMC4xKTtcbiAgICAgICAgY29sb3I6ICNlNzZmNTE7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2U3NmY1MTtcbiAgICAgIH1cblxuICAgICAgLm1peGVkLXNlY3Rpb24gLnNoZW5zaGEtc2VjdGlvbi10aXRsZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMzLCAxOTYsIDEwNiwgMC4xKTtcbiAgICAgICAgY29sb3I6ICNlOWM0NmE7XG4gICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2U5YzQ2YTtcbiAgICAgIH1cblxuICAgICAgLnNoZW5zaGEtaXRlbXMge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgICAgIGdhcDogNnB4O1xuICAgICAgICBwYWRkaW5nOiA2cHg7XG4gICAgICB9XG5cbiAgICAgIC5zaGVuc2hhLWl0ZW0ge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIHBhZGRpbmc6IDJweCA4cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIDAuMnM7XG4gICAgICB9XG5cbiAgICAgIC5nb29kLXNoZW5zaGEge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQyLCAxNTcsIDE0MywgMC4xKTtcbiAgICAgICAgY29sb3I6ICMyYTlkOGY7XG4gICAgICB9XG5cbiAgICAgIC5nb29kLXNoZW5zaGE6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQyLCAxNTcsIDE0MywgMC4yKTtcbiAgICAgIH1cblxuICAgICAgLmJhZC1zaGVuc2hhIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzEsIDExMSwgODEsIDAuMSk7XG4gICAgICAgIGNvbG9yOiAjZTc2ZjUxO1xuICAgICAgfVxuXG4gICAgICAuYmFkLXNoZW5zaGE6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzMSwgMTExLCA4MSwgMC4yKTtcbiAgICAgIH1cblxuICAgICAgLm1peGVkLXNoZW5zaGEge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzMywgMTk2LCAxMDYsIDAuMSk7XG4gICAgICAgIGNvbG9yOiAjZTljNDZhO1xuICAgICAgfVxuXG4gICAgICAubWl4ZWQtc2hlbnNoYTpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMzLCAxOTYsIDEwNiwgMC4yKTtcbiAgICAgIH1cbiAgICBgO1xuXG4gICAgc2hlblNoYUNvbnRhaW5lci5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgc2hlblNoYUNvbnRhaW5lci5hcHBlbmRDaGlsZChzaGVuU2hhTGlzdCk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LqU6KGM5a+55bqU55qEQ1NT57G75ZCNXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIENTU+exu+WQjVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdDbGFzc0Zyb21OYW1lKHd1WGluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzogcmV0dXJuICdqaW4nO1xuICAgICAgY2FzZSAn5pyoJzogcmV0dXJuICdtdSc7XG4gICAgICBjYXNlICfmsLQnOiByZXR1cm4gJ3NodWknO1xuICAgICAgY2FzZSAn54GrJzogcmV0dXJuICdodW8nO1xuICAgICAgY2FzZSAn5ZyfJzogcmV0dXJuICd0dSc7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gJ3R1JzsgLy8g6buY6K6k5Li65ZyfXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuS6lOihjOW8uuW6puivpue7huino+mHilxuICAgKiBAcGFyYW0gd3VYaW5nIOS6lOihjOWQjeensFxuICAgKiBAcGFyYW0gdmFsdWUg5LqU6KGM5by65bqm5YC8XG4gICAqL1xuICBwcml2YXRlIHNob3dXdVhpbmdFeHBsYW5hdGlvbih3dVhpbmc6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIC8vIOiOt+WPluS6lOihjOivpue7huS/oeaBr1xuICAgIGNvbnN0IHd1WGluZ0luZm8gPSBXdVhpbmdTZXJ2aWNlLmdldFd1WGluZ0luZm8od3VYaW5nKTtcbiAgICBpZiAoIXd1WGluZ0luZm8pIHJldHVybjtcblxuICAgIC8vIOWIm+W7uuW8ueeql1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWwuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwnO1xuXG4gICAgLy8g5Yib5bu65by556qX5YaF5a65XG4gICAgY29uc3QgbW9kYWxDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWxDb250ZW50LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvbnRlbnQnO1xuXG4gICAgLy8g5Yib5bu65qCH6aKYXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gYCR7d3VYaW5nfeS6lOihjOW8uuW6puivpuino2A7XG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdGl0bGUnO1xuXG4gICAgLy8g5Yib5bu657G75Z6LXG4gICAgY29uc3QgdHlwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHR5cGUudGV4dENvbnRlbnQgPSBg5by65bqm5YC8OiAke3ZhbHVlfWA7XG4gICAgdHlwZS5jbGFzc05hbWUgPSBgYmF6aS1tb2RhbC10eXBlIGJhemktbW9kYWwtdHlwZS0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3NGcm9tTmFtZSh3dVhpbmcpfWA7XG5cbiAgICAvLyDliJvlu7rop6Pph4pcbiAgICBjb25zdCBleHBsYW5hdGlvblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBleHBsYW5hdGlvblRleHQudGV4dENvbnRlbnQgPSB3dVhpbmdJbmZvLmV4cGxhbmF0aW9uO1xuICAgIGV4cGxhbmF0aW9uVGV4dC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1leHBsYW5hdGlvbic7XG5cbiAgICAvLyDliJvlu7rlvbHlk41cbiAgICBjb25zdCBpbmZsdWVuY2VUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5mbHVlbmNlVGV4dC50ZXh0Q29udGVudCA9IHd1WGluZ0luZm8uaW5mbHVlbmNlO1xuICAgIGluZmx1ZW5jZVRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtaW5mbHVlbmNlJztcblxuICAgIC8vIOWIm+W7uuiuoeeul+aWueazlVxuICAgIGNvbnN0IGNhbGN1bGF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2FsY3VsYXRpb24uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2FsY3VsYXRpb24nO1xuXG4gICAgLy8g6I635Y+W5a6e6ZmF6K6h566X6L+H56iLXG4gICAgbGV0IGFjdHVhbENhbGN1bGF0aW9uID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGFjdHVhbENhbGN1bGF0aW9uID0gdGhpcy5nZXRBY3R1YWxXdVhpbmdDYWxjdWxhdGlvbih3dVhpbmcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGDorqHnrpcke3d1WGluZ33kupTooYzlvLrluqbml7blh7rplJk6YCwgZXJyb3IpO1xuICAgIH1cblxuICAgIGlmICghYWN0dWFsQ2FsY3VsYXRpb24pIHtcbiAgICAgIGFjdHVhbENhbGN1bGF0aW9uID0gd3VYaW5nSW5mby5jYWxjdWxhdGlvbiB8fCBg5peg5rOV6K6h566XJHt3dVhpbmd95LqU6KGM5by65bqm77yM6K+35qOA5p+l5YWr5a2X5L+h5oGv5piv5ZCm5a6M5pW044CCYDtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rorqHnrpfmlrnms5XmoIfpopjlkozlpI3liLbmjInpkq5cbiAgICBjb25zdCBjYWxjdWxhdGlvbkhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhbGN1bGF0aW9uSGVhZGVyLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNhbGN1bGF0aW9uLWhlYWRlcic7XG5cbiAgICBjb25zdCBjYWxjdWxhdGlvblRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3Ryb25nJyk7XG4gICAgY2FsY3VsYXRpb25UaXRsZS50ZXh0Q29udGVudCA9ICfjgJDorqHnrpfmlrnms5XjgJEnO1xuXG4gICAgY29uc3QgY29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNvcHlCdXR0b24udGV4dENvbnRlbnQgPSAn5aSN5Yi26K6h566X6L+H56iLJztcbiAgICBjb3B5QnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvcHktYnV0dG9uJztcbiAgICBjb3B5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgLy8g5aSN5Yi26K6h566X6L+H56iL5Yiw5Ymq6LS05p2/XG4gICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChhY3R1YWxDYWxjdWxhdGlvbilcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIC8vIOaYvuekuuWkjeWItuaIkOWKn+aPkOekulxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGNvcHlCdXR0b24udGV4dENvbnRlbnQ7XG4gICAgICAgICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9ICflpI3liLbmiJDlip/vvIEnO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9IG9yaWdpbmFsVGV4dDtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign5aSN5Yi25aSx6LSlOicsIGVycik7XG4gICAgICAgICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9ICflpI3liLblpLHotKUnO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9ICflpI3liLborqHnrpfov4fnqIsnO1xuICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNhbGN1bGF0aW9uSGVhZGVyLmFwcGVuZENoaWxkKGNhbGN1bGF0aW9uVGl0bGUpO1xuICAgIGNhbGN1bGF0aW9uSGVhZGVyLmFwcGVuZENoaWxkKGNvcHlCdXR0b24pO1xuXG4gICAgLy8g5Yib5bu66K6h566X6L+H56iL5YaF5a65XG4gICAgY29uc3QgY2FsY3VsYXRpb25Db250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgY2FsY3VsYXRpb25Db250ZW50LnN0eWxlLnVzZXJTZWxlY3QgPSAndGV4dCc7XG4gICAgY2FsY3VsYXRpb25Db250ZW50LnRleHRDb250ZW50ID0gYWN0dWFsQ2FsY3VsYXRpb247XG5cbiAgICAvLyDmt7vliqDorqHnrpfmlrnms5XliLDlvLnnqpdcbiAgICBjYWxjdWxhdGlvbi5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbkhlYWRlcik7XG4gICAgY2FsY3VsYXRpb24uYXBwZW5kQ2hpbGQoY2FsY3VsYXRpb25Db250ZW50KTtcblxuICAgIC8vIOWIm+W7uuWFs+mXreaMiemSrlxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAn5YWz6ZetJztcbiAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jbG9zZSc7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIOa3u+WKoOWGheWuueWIsOW8ueeql1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHR5cGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChleHBsYW5hdGlvblRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChpbmZsdWVuY2VUZXh0KTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY2FsY3VsYXRpb24pO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDmt7vliqDlvLnnqpfliLDpobXpnaJcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuXG4gICAgLy8g54K55Ye75by556qX5aSW6YOo5YWz6Zet5by556qXXG4gICAgbW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0ID09PSBtb2RhbCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOiusOW9leW3suaYvuekuueahOW8ueeql++8jOmYsuatoumHjeWkjeaYvuekulxuICAgIHRoaXMuc2hvd25Nb2RhbHMucHVzaChtb2RhbCk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5a6e6ZmF55qE5LqU6KGM5by65bqm6K6h566X6L+H56iLXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIOWunumZheiuoeeul+i/h+eoi1xuICAgKi9cbiAgcHJpdmF0ZSBnZXRBY3R1YWxXdVhpbmdDYWxjdWxhdGlvbih3dVhpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvIHx8ICF0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5piv5ZCm5pyJ6K+m57uG5L+h5oGvXG4gICAgaWYgKCEoJ2RldGFpbHMnIGluIHRoaXMuYmF6aUluZm8ud3VYaW5nU3RyZW5ndGgpKSB7XG4gICAgICByZXR1cm4gYOaXoOazleiOt+WPliR7d3VYaW5nfeS6lOihjOW8uuW6puivpuaDhe+8jOivt+abtOaWsOWFq+Wtl+iuoeeul+W8leaTjuOAgmA7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5LqU6KGM5by65bqm6K+m5oOFXG4gICAgY29uc3QgZGV0YWlscyA9ICh0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoIGFzIGFueSkuZGV0YWlscztcblxuICAgIC8vIOajgOafpSBkZXRhaWxzIOaYr+WQpuWtmOWcqFxuICAgIGlmICghZGV0YWlscykge1xuICAgICAgcmV0dXJuIGDml6Dms5Xojrflj5bkupTooYzlvLrluqbor6bmg4XvvIzor7fmo4Dmn6XlhavlrZfkv6Hmga/mmK/lkKblrozmlbTjgIJgO1xuICAgIH1cblxuICAgIC8vIOiOt+WPlueJueWumuS6lOihjOeahOivpuaDhVxuICAgIGxldCB3dVhpbmdEZXRhaWxzOiB7XG4gICAgICB0aWFuR2FuPzogbnVtYmVyO1xuICAgICAgZGlaaGlDYW5nPzogbnVtYmVyO1xuICAgICAgbmFZaW4/OiBudW1iZXI7XG4gICAgICBzZWFzb24/OiBudW1iZXI7XG4gICAgICBjb21iaW5hdGlvbj86IG51bWJlcjtcbiAgICAgIHRvdGFsPzogbnVtYmVyO1xuICAgICAgbW9udGhEb21pbmFudD86IG51bWJlcjtcbiAgICB9ID0ge307XG5cbiAgICAvLyDmoLnmja7kupTooYznsbvlnovojrflj5blr7nlupTnmoTor6bmg4XvvIzlubbov5vooYznqbrlgLzmo4Dmn6VcbiAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgY2FzZSAn6YeRJzogd3VYaW5nRGV0YWlscyA9IGRldGFpbHMuamluIHx8IHt9OyBicmVhaztcbiAgICAgIGNhc2UgJ+acqCc6IHd1WGluZ0RldGFpbHMgPSBkZXRhaWxzLm11IHx8IHt9OyBicmVhaztcbiAgICAgIGNhc2UgJ+awtCc6IHd1WGluZ0RldGFpbHMgPSBkZXRhaWxzLnNodWkgfHwge307IGJyZWFrO1xuICAgICAgY2FzZSAn54GrJzogd3VYaW5nRGV0YWlscyA9IGRldGFpbHMuaHVvIHx8IHt9OyBicmVhaztcbiAgICAgIGNhc2UgJ+Wcnyc6IHd1WGluZ0RldGFpbHMgPSBkZXRhaWxzLnR1IHx8IHt9OyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyDorqHnrpfmgLvliIZcbiAgICBjb25zdCB3dVhpbmdTdHJlbmd0aCA9IHRoaXMuYmF6aUluZm8ud3VYaW5nU3RyZW5ndGggYXMgYW55O1xuICAgIGxldCB0b3RhbCA9IDA7XG5cbiAgICAvLyDnoa7kv53miYDmnInlsZ7mgKflrZjlnKjlubbkuJTmmK/mlbDlrZdcbiAgICBpZiAod3VYaW5nU3RyZW5ndGgpIHtcbiAgICAgIGNvbnN0IGppbiA9IHR5cGVvZiB3dVhpbmdTdHJlbmd0aC5qaW4gPT09ICdudW1iZXInID8gd3VYaW5nU3RyZW5ndGguamluIDogMDtcbiAgICAgIGNvbnN0IG11ID0gdHlwZW9mIHd1WGluZ1N0cmVuZ3RoLm11ID09PSAnbnVtYmVyJyA/IHd1WGluZ1N0cmVuZ3RoLm11IDogMDtcbiAgICAgIGNvbnN0IHNodWkgPSB0eXBlb2Ygd3VYaW5nU3RyZW5ndGguc2h1aSA9PT0gJ251bWJlcicgPyB3dVhpbmdTdHJlbmd0aC5zaHVpIDogMDtcbiAgICAgIGNvbnN0IGh1byA9IHR5cGVvZiB3dVhpbmdTdHJlbmd0aC5odW8gPT09ICdudW1iZXInID8gd3VYaW5nU3RyZW5ndGguaHVvIDogMDtcbiAgICAgIGNvbnN0IHR1ID0gdHlwZW9mIHd1WGluZ1N0cmVuZ3RoLnR1ID09PSAnbnVtYmVyJyA/IHd1WGluZ1N0cmVuZ3RoLnR1IDogMDtcblxuICAgICAgdG90YWwgPSBqaW4gKyBtdSArIHNodWkgKyBodW8gKyB0dTtcbiAgICB9XG5cbiAgICAvLyDmnoTlu7rorqHnrpfov4fnqItcbiAgICBsZXQgY2FsY3VsYXRpb24gPSBgJHt3dVhpbmd95LqU6KGM5by65bqm5a6e6ZmF6K6h566X6L+H56iL77yaXFxuXFxuYDtcblxuICAgIC8vIOWkqeW5suS6lOihjFxuICAgIGNhbGN1bGF0aW9uICs9IGDjgJDlpKnlubLkupTooYzjgJFcXG5gO1xuICAgIGlmICh3dVhpbmdEZXRhaWxzLnRpYW5HYW4gJiYgd3VYaW5nRGV0YWlscy50aWFuR2FuID4gMCkge1xuICAgICAgLy8g6I635Y+W5YWr5a2X5L+h5oGvXG4gICAgICBjb25zdCB7IHllYXJTdGVtLCBtb250aFN0ZW0sIGRheVN0ZW0sIGhvdXJTdGVtIH0gPSB0aGlzLmJhemlJbmZvO1xuXG4gICAgICAvLyDojrflj5bphY3nva7kuK3nmoTmnYPph43vvIjlpoLmnpzlj6/og73vvIlcbiAgICAgIGxldCB5ZWFyV2VpZ2h0ID0gMS4yOyAgLy8g6buY6K6k5L2/55So5LyY5YyW5ZCO55qE5p2D6YeNXG4gICAgICBsZXQgbW9udGhXZWlnaHQgPSAzLjA7XG4gICAgICBsZXQgZGF5V2VpZ2h0ID0gMy4wO1xuICAgICAgbGV0IGhvdXJXZWlnaHQgPSAxLjA7XG5cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKHllYXJTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOW5siR7eWVhclN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGJHt5ZWFyV2VpZ2h0LnRvRml4ZWQoMSl977yI5bm05bmy5p2D6YeN77yJXFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKG1vbnRoU3RlbSkgPT09IHd1WGluZykge1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDmnIjlubIke21vbnRoU3RlbX3kuLoke3d1WGluZ33vvIzlvpfliIYke21vbnRoV2VpZ2h0LnRvRml4ZWQoMSl977yI5pyI5bmy5p2D6YeN77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGRheVN0ZW0pID09PSB3dVhpbmcpIHtcbiAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5bmyJHtkYXlTdGVtfeS4uiR7d3VYaW5nfe+8jOW+l+WIhiR7ZGF5V2VpZ2h0LnRvRml4ZWQoMSl977yI5pel5bmy5p2D6YeN77yM5pel5Li75pyA6YeN6KaB77yJXFxuYDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmdldFd1WGluZ0Zyb21TdGVtKGhvdXJTdGVtKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuW5siR7aG91clN0ZW195Li6JHt3dVhpbmd977yM5b6X5YiGJHtob3VyV2VpZ2h0LnRvRml4ZWQoMSl977yI5pe25bmy5p2D6YeN77yJXFxuYDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlnLDmlK/ol4/lubJcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ5Zyw5pSv6JeP5bmy44CRXFxuYDtcbiAgICBpZiAod3VYaW5nRGV0YWlscy5kaVpoaUNhbmcgJiYgd3VYaW5nRGV0YWlscy5kaVpoaUNhbmcgPiAwKSB7XG4gICAgICAvLyDojrflj5blhavlrZfkv6Hmga9cbiAgICAgIGNvbnN0IHsgeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICAgIGNvbnN0IHsgeWVhckhpZGVHYW4sIG1vbnRoSGlkZUdhbiwgZGF5SGlkZUdhbiwgaG91ckhpZGVHYW4gfSA9IHRoaXMuYmF6aUluZm87XG5cbiAgICAgIC8vIOiOt+WPlumFjee9ruS4reeahOadg+mHje+8iOWmguaenOWPr+iDve+8iVxuICAgICAgbGV0IHllYXJXZWlnaHQgPSAwLjg7ICAvLyDpu5jorqTkvb/nlKjkvJjljJblkI7nmoTmnYPph41cbiAgICAgIGxldCBtb250aFdlaWdodCA9IDIuNTtcbiAgICAgIGxldCBkYXlXZWlnaHQgPSAyLjI7XG4gICAgICBsZXQgaG91cldlaWdodCA9IDAuNztcblxuICAgICAgLy8g6JeP5bmy5YaF6YOo5p2D6YeNXG4gICAgICBjb25zdCBvbmVHYW5XZWlnaHQgPSBbMS4wXTtcbiAgICAgIGNvbnN0IHR3b0dhbldlaWdodCA9IFswLjYsIDAuNF07XG4gICAgICBjb25zdCB0aHJlZUdhbldlaWdodCA9IFswLjUsIDAuMywgMC4yXTtcblxuICAgICAgaWYgKHllYXJIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IHllYXJIaWRlR2FuQXJyYXkgPSBBcnJheS5pc0FycmF5KHllYXJIaWRlR2FuKSA/IHllYXJIaWRlR2FuIDogeWVhckhpZGVHYW4uc3BsaXQoJycpO1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlubTmlK8ke3llYXJCcmFuY2h96JeP5bmy77yaYDtcblxuICAgICAgICAvLyDmoLnmja7ol4/lubLmlbDph4/pgInmi6nmnYPph41cbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IHllYXJIaWRlR2FuQXJyYXkubGVuZ3RoID09PSAxID8gb25lR2FuV2VpZ2h0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgeWVhckhpZGVHYW5BcnJheS5sZW5ndGggPT09IDIgPyB0d29HYW5XZWlnaHQgOiB0aHJlZUdhbldlaWdodDtcblxuICAgICAgICBsZXQgaGFzTWF0Y2hpbmdHYW4gPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB5ZWFySGlkZUdhbkFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZ2FuID0geWVhckhpZGVHYW5BcnJheVtpXTtcbiAgICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGdhbldlaWdodCA9IHdlaWdodHNbaV07XG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IHllYXJXZWlnaHQgKiBnYW5XZWlnaHQ7XG4gICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgJHtnYW59KCR7d3VYaW5nfSnlvpfliIYke3Njb3JlLnRvRml4ZWQoMSl9YDtcbiAgICAgICAgICAgIGlmICh5ZWFySGlkZUdhbkFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOW5tOaUr+adg+mHjSR7eWVhcldlaWdodC50b0ZpeGVkKDEpfcOX6JeP5bmy5p2D6YeNJHtnYW5XZWlnaHQudG9GaXhlZCgxKX3vvIlgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOW5tOaUr+adg+mHje+8iWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBg77yMYDtcbiAgICAgICAgICAgIGhhc01hdGNoaW5nR2FuID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsY3VsYXRpb24gPSBoYXNNYXRjaGluZ0dhbiA/IGNhbGN1bGF0aW9uLnNsaWNlKDAsIC0xKSArICdcXG4nIDogY2FsY3VsYXRpb24gKyAn5peg5Yy56YWN5LqU6KGMXFxuJztcbiAgICAgIH1cblxuICAgICAgaWYgKG1vbnRoSGlkZUdhbikge1xuICAgICAgICBjb25zdCBtb250aEhpZGVHYW5BcnJheSA9IEFycmF5LmlzQXJyYXkobW9udGhIaWRlR2FuKSA/IG1vbnRoSGlkZUdhbiA6IG1vbnRoSGlkZUdhbi5zcGxpdCgnJyk7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaciOaUryR7bW9udGhCcmFuY2h96JeP5bmy77yaYDtcblxuICAgICAgICAvLyDmoLnmja7ol4/lubLmlbDph4/pgInmi6nmnYPph41cbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IG1vbnRoSGlkZUdhbkFycmF5Lmxlbmd0aCA9PT0gMSA/IG9uZUdhbldlaWdodCA6XG4gICAgICAgICAgICAgICAgICAgICAgIG1vbnRoSGlkZUdhbkFycmF5Lmxlbmd0aCA9PT0gMiA/IHR3b0dhbldlaWdodCA6IHRocmVlR2FuV2VpZ2h0O1xuXG4gICAgICAgIGxldCBoYXNNYXRjaGluZ0dhbiA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbnRoSGlkZUdhbkFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZ2FuID0gbW9udGhIaWRlR2FuQXJyYXlbaV07XG4gICAgICAgICAgaWYgKHRoaXMuZ2V0V3VYaW5nRnJvbVN0ZW0oZ2FuKSA9PT0gd3VYaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBnYW5XZWlnaHQgPSB3ZWlnaHRzW2ldO1xuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBtb250aFdlaWdodCAqIGdhbldlaWdodDtcbiAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAke2dhbn0oJHt3dVhpbmd9KeW+l+WIhiR7c2NvcmUudG9GaXhlZCgxKX1gO1xuICAgICAgICAgICAgaWYgKG1vbnRoSGlkZUdhbkFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOaciOaUr+adg+mHjSR7bW9udGhXZWlnaHQudG9GaXhlZCgxKX3Dl+iXj+W5suadg+mHjSR7Z2FuV2VpZ2h0LnRvRml4ZWQoMSl977yJYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGDvvIjmnIjmlK/mnYPph43vvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8jGA7XG4gICAgICAgICAgICBoYXNNYXRjaGluZ0dhbiA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGN1bGF0aW9uID0gaGFzTWF0Y2hpbmdHYW4gPyBjYWxjdWxhdGlvbi5zbGljZSgwLCAtMSkgKyAnXFxuJyA6IGNhbGN1bGF0aW9uICsgJ+aXoOWMuemFjeS6lOihjFxcbic7XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXlIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGRheUhpZGVHYW5BcnJheSA9IEFycmF5LmlzQXJyYXkoZGF5SGlkZUdhbikgPyBkYXlIaWRlR2FuIDogZGF5SGlkZUdhbi5zcGxpdCgnJyk7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXpeaUryR7ZGF5QnJhbmNofeiXj+W5su+8mmA7XG5cbiAgICAgICAgLy8g5qC55o2u6JeP5bmy5pWw6YeP6YCJ5oup5p2D6YeNXG4gICAgICAgIGNvbnN0IHdlaWdodHMgPSBkYXlIaWRlR2FuQXJyYXkubGVuZ3RoID09PSAxID8gb25lR2FuV2VpZ2h0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgZGF5SGlkZUdhbkFycmF5Lmxlbmd0aCA9PT0gMiA/IHR3b0dhbldlaWdodCA6IHRocmVlR2FuV2VpZ2h0O1xuXG4gICAgICAgIGxldCBoYXNNYXRjaGluZ0dhbiA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRheUhpZGVHYW5BcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGdhbiA9IGRheUhpZGVHYW5BcnJheVtpXTtcbiAgICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGdhbldlaWdodCA9IHdlaWdodHNbaV07XG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IGRheVdlaWdodCAqIGdhbldlaWdodDtcbiAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAke2dhbn0oJHt3dVhpbmd9KeW+l+WIhiR7c2NvcmUudG9GaXhlZCgxKX1gO1xuICAgICAgICAgICAgaWYgKGRheUhpZGVHYW5BcnJheS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGDvvIjml6XmlK/mnYPph40ke2RheVdlaWdodC50b0ZpeGVkKDEpfcOX6JeP5bmy5p2D6YeNJHtnYW5XZWlnaHQudG9GaXhlZCgxKX3vvIlgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOaXpeaUr+adg+mHje+8iWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBg77yMYDtcbiAgICAgICAgICAgIGhhc01hdGNoaW5nR2FuID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsY3VsYXRpb24gPSBoYXNNYXRjaGluZ0dhbiA/IGNhbGN1bGF0aW9uLnNsaWNlKDAsIC0xKSArICdcXG4nIDogY2FsY3VsYXRpb24gKyAn5peg5Yy56YWN5LqU6KGMXFxuJztcbiAgICAgIH1cblxuICAgICAgaWYgKGhvdXJIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGhvdXJIaWRlR2FuQXJyYXkgPSBBcnJheS5pc0FycmF5KGhvdXJIaWRlR2FuKSA/IGhvdXJIaWRlR2FuIDogaG91ckhpZGVHYW4uc3BsaXQoJycpO1xuICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml7bmlK8ke2hvdXJCcmFuY2h96JeP5bmy77yaYDtcblxuICAgICAgICAvLyDmoLnmja7ol4/lubLmlbDph4/pgInmi6nmnYPph41cbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IGhvdXJIaWRlR2FuQXJyYXkubGVuZ3RoID09PSAxID8gb25lR2FuV2VpZ2h0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgaG91ckhpZGVHYW5BcnJheS5sZW5ndGggPT09IDIgPyB0d29HYW5XZWlnaHQgOiB0aHJlZUdhbldlaWdodDtcblxuICAgICAgICBsZXQgaGFzTWF0Y2hpbmdHYW4gPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3VySGlkZUdhbkFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZ2FuID0gaG91ckhpZGVHYW5BcnJheVtpXTtcbiAgICAgICAgICBpZiAodGhpcy5nZXRXdVhpbmdGcm9tU3RlbShnYW4pID09PSB3dVhpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGdhbldlaWdodCA9IHdlaWdodHNbaV07XG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IGhvdXJXZWlnaHQgKiBnYW5XZWlnaHQ7XG4gICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgJHtnYW59KCR7d3VYaW5nfSnlvpfliIYke3Njb3JlLnRvRml4ZWQoMSl9YDtcbiAgICAgICAgICAgIGlmIChob3VySGlkZUdhbkFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOaXtuaUr+adg+mHjSR7aG91cldlaWdodC50b0ZpeGVkKDEpfcOX6JeP5bmy5p2D6YeNJHtnYW5XZWlnaHQudG9GaXhlZCgxKX3vvIlgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2FsY3VsYXRpb24gKz0gYO+8iOaXtuaUr+adg+mHje+8iWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBg77yMYDtcbiAgICAgICAgICAgIGhhc01hdGNoaW5nR2FuID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsY3VsYXRpb24gPSBoYXNNYXRjaGluZ0dhbiA/IGNhbGN1bGF0aW9uLnNsaWNlKDAsIC0xKSArICdcXG4nIDogY2FsY3VsYXRpb24gKyAn5peg5Yy56YWN5LqU6KGMXFxuJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDnurPpn7PkupTooYxcbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ57qz6Z+z5LqU6KGM44CRXFxuYDtcbiAgICBpZiAod3VYaW5nRGV0YWlscy5uYVlpbiAmJiB3dVhpbmdEZXRhaWxzLm5hWWluID4gMCkge1xuICAgICAgLy8g6I635Y+W5YWr5a2X5L+h5oGvXG4gICAgICBjb25zdCB7IHllYXJOYVlpbiwgbW9udGhOYVlpbiwgZGF5TmFZaW4sIGhvdXJOYVlpbiB9ID0gdGhpcy5iYXppSW5mbztcblxuICAgICAgLy8g6I635Y+W6YWN572u5Lit55qE5p2D6YeN77yI5aaC5p6c5Y+v6IO977yJXG4gICAgICBsZXQgeWVhcldlaWdodCA9IDAuNjsgIC8vIOm7mOiupOS9v+eUqOS8mOWMluWQjueahOadg+mHjVxuICAgICAgbGV0IG1vbnRoV2VpZ2h0ID0gMi4wO1xuICAgICAgbGV0IGRheVdlaWdodCA9IDEuNTtcbiAgICAgIGxldCBob3VyV2VpZ2h0ID0gMC41O1xuXG4gICAgICBpZiAoeWVhck5hWWluICYmIHllYXJOYVlpbi5pbmNsdWRlcyh3dVhpbmcpKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5tOafsee6s+mfsyR7eWVhck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhiR7eWVhcldlaWdodC50b0ZpeGVkKDEpfe+8iOW5tOafsee6s+mfs+adg+mHje+8iVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAobW9udGhOYVlpbiAmJiBtb250aE5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pyI5p+x57qz6Z+zJHttb250aE5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhiR7bW9udGhXZWlnaHQudG9GaXhlZCgxKX3vvIjmnIjmn7HnurPpn7PmnYPph43vvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcXG5gO1xuICAgICAgfVxuICAgICAgaWYgKGRheU5hWWluICYmIGRheU5hWWluLmluY2x1ZGVzKHd1WGluZykpIHtcbiAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5p+x57qz6Z+zJHtkYXlOYVlpbn3kuLoke3d1WGluZ33vvIzlvpfliIYke2RheVdlaWdodC50b0ZpeGVkKDEpfe+8iOaXpeafsee6s+mfs+adg+mHje+8iVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoaG91ck5hWWluICYmIGhvdXJOYVlpbi5pbmNsdWRlcyh3dVhpbmcpKSB7XG4gICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXtuafsee6s+mfsyR7aG91ck5hWWlufeS4uiR7d3VYaW5nfe+8jOW+l+WIhiR7aG91cldlaWdodC50b0ZpeGVkKDEpfe+8iOaXtuafsee6s+mfs+adg+mHje+8iVxcbmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5a2j6IqC6LCD5pW0XG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOWto+iKguiwg+aVtOOAkVxcbmA7XG4gICAgY29uc3QgeyBtb250aEJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCBzZWFzb24gPSB0aGlzLmdldFNlYXNvbihtb250aEJyYW5jaCk7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5b2T5YmN5a2j6IqC77yaJHtzZWFzb259XFxuYDtcblxuICAgIC8vIOiOt+WPlumFjee9ruS4reeahOadg+mHje+8iOWmguaenOWPr+iDve+8iVxuICAgIGNvbnN0IHNlYXNvbkFkanVzdCA9IHtcbiAgICAgIHdhbmc6IDIuNSwgICAvLyDml7rnm7jns7vmlbDvvIjku44yLjDmj5Dpq5jliLAyLjXvvIlcbiAgICAgIHhpYW5nOiAxLjIsICAvLyDnm7jml7rns7vmlbDvvIjku44xLjDmj5Dpq5jliLAxLjLvvIlcbiAgICAgIHBpbmc6IDAuMCwgICAvLyDlubPlkozns7vmlbDvvIjkv53mjIHkuI3lj5jvvIlcbiAgICAgIHFpdTogLTEuMiwgICAvLyDlm5rns7vmlbDvvIjku44tMS4w5aKe5by65YiwLTEuMu+8iVxuICAgICAgc2k6IC0xLjggICAgIC8vIOatu+ezu+aVsO+8iOS7ji0xLjXlop7lvLrliLAtMS4477yJXG4gICAgfTtcblxuICAgIGlmICh3dVhpbmdEZXRhaWxzLnNlYXNvbiAhPT0gdW5kZWZpbmVkICYmIHd1WGluZ0RldGFpbHMuc2Vhc29uICE9PSAwKSB7XG4gICAgICBzd2l0Y2ggKHNlYXNvbikge1xuICAgICAgICBjYXNlICfmmKXlraMnOlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmnKgnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPmnKjml7rvvIzlvpfliIYrJHtzZWFzb25BZGp1c3Qud2FuZy50b0ZpeGVkKDEpfe+8iOaXuuebuOezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+eBq+ebuO+8jOW+l+WIhiske3NlYXNvbkFkanVzdC54aWFuZy50b0ZpeGVkKDEpfe+8iOebuOaXuuezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+WcnycpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+Wcn+W5s++8jOW+l+WIhiR7c2Vhc29uQWRqdXN0LnBpbmcudG9GaXhlZCgxKX3vvIjlubPlkozns7vmlbDvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPph5Hlm5rvvIzlvpfliIYke3NlYXNvbkFkanVzdC5xaXUudG9GaXhlZCgxKX3vvIjlm5rns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmsLQnKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPmsLTmrbvvvIzlvpfliIYke3NlYXNvbkFkanVzdC5zaS50b0ZpeGVkKDEpfe+8iOatu+ezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+Wkj+Wtoyc6XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+eBq+aXuu+8jOW+l+WIhiske3NlYXNvbkFkanVzdC53YW5nLnRvRml4ZWQoMSl977yI5pe655u457O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5ZyfJykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j5Zyf55u477yM5b6X5YiGKyR7c2Vhc29uQWRqdXN0LnhpYW5nLnRvRml4ZWQoMSl977yI55u45pe657O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn6YeRJykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j6YeR5bmz77yM5b6X5YiGJHtzZWFzb25BZGp1c3QucGluZy50b0ZpeGVkKDEpfe+8iOW5s+WSjOezu+aVsO+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+awtOWbmu+8jOW+l+WIhiR7c2Vhc29uQWRqdXN0LnFpdS50b0ZpeGVkKDEpfe+8iOWbmuezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+acqOatu++8jOW+l+WIhiR7c2Vhc29uQWRqdXN0LnNpLnRvRml4ZWQoMSl977yI5q2757O75pWw77yM5aKe5by65Lul5by65YyW5a2j6IqC5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn56eL5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn6YeRJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j6YeR5pe677yM5b6X5YiGKyR7c2Vhc29uQWRqdXN0LndhbmcudG9GaXhlZCgxKX3vvIjml7rnm7jns7vmlbDvvIzmj5Dpq5jku6XlvLrljJblraPoioLlvbHlk43vvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmsLQnKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPmsLTnm7jvvIzlvpfliIYrJHtzZWFzb25BZGp1c3QueGlhbmcudG9GaXhlZCgxKX3vvIjnm7jml7rns7vmlbDvvIzmj5Dpq5jku6XlvLrljJblraPoioLlvbHlk43vvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmnKgnKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPmnKjlubPvvIzlvpfliIYke3NlYXNvbkFkanVzdC5waW5nLnRvRml4ZWQoMSl977yI5bmz5ZKM57O75pWw77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn54GrJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j54Gr5Zua77yM5b6X5YiGJHtzZWFzb25BZGp1c3QucWl1LnRvRml4ZWQoMSl977yI5Zua57O75pWw77yM5aKe5by65Lul5by65YyW5a2j6IqC5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5ZyfJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5Zyf5q2777yM5b6X5YiGJHtzZWFzb25BZGp1c3Quc2kudG9GaXhlZCgxKX3vvIjmrbvns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICflhqzlraMnOlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmsLQnKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPmsLTml7rvvIzlvpfliIYrJHtzZWFzb25BZGp1c3Qud2FuZy50b0ZpeGVkKDEpfe+8iOaXuuebuOezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+acqCcpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+acqOebuO+8jOW+l+WIhiske3NlYXNvbkFkanVzdC54aWFuZy50b0ZpeGVkKDEpfe+8iOebuOaXuuezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+eBq+W5s++8jOW+l+WIhiR7c2Vhc29uQWRqdXN0LnBpbmcudG9GaXhlZCgxKX3vvIjlubPlkozns7vmlbDvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPlnJ/lm5rvvIzlvpfliIYke3NlYXNvbkFkanVzdC5xaXUudG9GaXhlZCgxKX3vvIjlm5rns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfph5EnKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPph5HmrbvvvIzlvpfliIYke3NlYXNvbkFkanVzdC5zaS50b0ZpeGVkKDEpfe+8iOatu+ezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pyI5Luk5b2T5Luk5Yqg5oiQXG4gICAgY2FsY3VsYXRpb24gKz0gYFxcbuOAkOaciOS7pOW9k+S7pOWKoOaIkOOAkVxcbmA7XG5cbiAgICAvLyDojrflj5bphY3nva7kuK3nmoTmnYPph43vvIjlpoLmnpzlj6/og73vvIlcbiAgICBjb25zdCBtb250aERvbWluYW50Qm9udXMgPSB7XG4gICAgICBkb21pbmFudDogMi4wLCAgIC8vIOW9k+S7pOWKoOaIkO+8iOS7jjEuNeaPkOmrmOWIsDIuMO+8iVxuICAgICAgcmVsYXRlZDogMS4wLCAgICAvLyDnm7jml7rliqDmiJDvvIjku44wLjjmj5Dpq5jliLAxLjDvvIlcbiAgICAgIG5ldXRyYWw6IDAuMCwgICAgLy8g5bmz5ZKM5Yqg5oiQ77yI5L+d5oyB5LiN5Y+Y77yJXG4gICAgICB3ZWFrOiAtMC41LCAgICAgIC8vIOWbmuWKoOaIkO+8iOaWsOWinu+8iVxuICAgICAgZGVhZDogLTAuOCAgICAgICAvLyDmrbvliqDmiJDvvIjmlrDlop7vvIlcbiAgICB9O1xuXG4gICAgLy8g5pi+56S65pyI5Luk5b2T5Luk5Yqg5oiQXG4gICAgaWYgKCh3dVhpbmdEZXRhaWxzIGFzIGFueSkubW9udGhEb21pbmFudCAhPT0gdW5kZWZpbmVkICYmICh3dVhpbmdEZXRhaWxzIGFzIGFueSkubW9udGhEb21pbmFudCAhPT0gMCkge1xuICAgICAgc3dpdGNoIChzZWFzb24pIHtcbiAgICAgICAgY2FzZSAn5pil5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j5pyo5b2T5Luk77yM5b6X5YiGKyR7bW9udGhEb21pbmFudEJvbnVzLmRvbWluYW50LnRvRml4ZWQoMSl977yI5b2T5Luk5Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn54GrJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j54Gr55u45pe677yM5b6X5YiGKyR7bW9udGhEb21pbmFudEJvbnVzLnJlbGF0ZWQudG9GaXhlZCgxKX3vvIjnm7jml7rliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDmmKXlraPlnJ/lubPlkozvvIzlvpfliIYke21vbnRoRG9taW5hbnRCb251cy5uZXV0cmFsLnRvRml4ZWQoMSl977yI5bmz5ZKM5Yqg5oiQ77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn6YeRJykgY2FsY3VsYXRpb24gKz0gYC0g5pil5a2j6YeR5Zua77yM5b6X5YiGJHttb250aERvbWluYW50Qm9udXMud2Vhay50b0ZpeGVkKDEpfe+8iOWbmuWKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOaYpeWto+awtOatu++8jOW+l+WIhiR7bW9udGhEb21pbmFudEJvbnVzLmRlYWQudG9GaXhlZCgxKX3vvIjmrbvliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICflpI/lraMnOlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfngasnKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPngavlvZPku6TvvIzlvpfliIYrJHttb250aERvbWluYW50Qm9udXMuZG9taW5hbnQudG9GaXhlZCgxKX3vvIjlvZPku6TliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPlnJ/nm7jml7rvvIzlvpfliIYrJHttb250aERvbWluYW50Qm9udXMucmVsYXRlZC50b0ZpeGVkKDEpfe+8iOebuOaXuuWKoOaIkO+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+mHkScpIGNhbGN1bGF0aW9uICs9IGAtIOWkj+Wto+mHkeW5s+WSjO+8jOW+l+WIhiR7bW9udGhEb21pbmFudEJvbnVzLm5ldXRyYWwudG9GaXhlZCgxKX3vvIjlubPlkozliqDmiJDvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfmsLQnKSBjYWxjdWxhdGlvbiArPSBgLSDlpI/lraPmsLTlm5rvvIzlvpfliIYke21vbnRoRG9taW5hbnRCb251cy53ZWFrLnRvRml4ZWQoMSl977yI5Zua5Yqg5oiQ77yM5paw5aKe6LSf6Z2i6LCD5pW077yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5aSP5a2j5pyo5q2777yM5b6X5YiGJHttb250aERvbWluYW50Qm9udXMuZGVhZC50b0ZpeGVkKDEpfe+8iOatu+WKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+eni+Wtoyc6XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+mHkScpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+mHkeW9k+S7pO+8jOW+l+WIhiske21vbnRoRG9taW5hbnRCb251cy5kb21pbmFudC50b0ZpeGVkKDEpfe+8iOW9k+S7pOWKoOaIkO+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+awtCcpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+awtOebuOaXuu+8jOW+l+WIhiske21vbnRoRG9taW5hbnRCb251cy5yZWxhdGVkLnRvRml4ZWQoMSl977yI55u45pe65Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g56eL5a2j5pyo5bmz5ZKM77yM5b6X5YiGJHttb250aERvbWluYW50Qm9udXMubmV1dHJhbC50b0ZpeGVkKDEpfe+8iOW5s+WSjOWKoOaIkO+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+eBqycpIGNhbGN1bGF0aW9uICs9IGAtIOeni+Wto+eBq+Wbmu+8jOW+l+WIhiR7bW9udGhEb21pbmFudEJvbnVzLndlYWsudG9GaXhlZCgxKX3vvIjlm5rliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICflnJ8nKSBjYWxjdWxhdGlvbiArPSBgLSDnp4vlraPlnJ/mrbvvvIzlvpfliIYke21vbnRoRG9taW5hbnRCb251cy5kZWFkLnRvRml4ZWQoMSl977yI5q275Yqg5oiQ77yM5paw5aKe6LSf6Z2i6LCD5pW077yJXFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn5Yas5a2jJzpcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5rC0JykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5rC05b2T5Luk77yM5b6X5YiGKyR7bW9udGhEb21pbmFudEJvbnVzLmRvbWluYW50LnRvRml4ZWQoMSl977yI5b2T5Luk5Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5pyoJykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5pyo55u45pe677yM5b6X5YiGKyR7bW9udGhEb21pbmFudEJvbnVzLnJlbGF0ZWQudG9GaXhlZCgxKX3vvIjnm7jml7rliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcXG5gO1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICfngasnKSBjYWxjdWxhdGlvbiArPSBgLSDlhqzlraPngavlubPlkozvvIzlvpfliIYke21vbnRoRG9taW5hbnRCb251cy5uZXV0cmFsLnRvRml4ZWQoMSl977yI5bmz5ZKM5Yqg5oiQ77yJXFxuYDtcbiAgICAgICAgICBpZiAod3VYaW5nID09PSAn5ZyfJykgY2FsY3VsYXRpb24gKz0gYC0g5Yas5a2j5Zyf5Zua77yM5b6X5YiGJHttb250aERvbWluYW50Qm9udXMud2Vhay50b0ZpeGVkKDEpfe+8iOWbmuWKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxcbmA7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ+mHkScpIGNhbGN1bGF0aW9uICs9IGAtIOWGrOWto+mHkeatu++8jOW+l+WIhiR7bW9udGhEb21pbmFudEJvbnVzLmRlYWQudG9GaXhlZCgxKX3vvIjmrbvliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe7hOWQiOiwg+aVtFxuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDnu4TlkIjosIPmlbTjgJFcXG5gO1xuXG4gICAgLy8g6I635Y+W6YWN572u5Lit55qE5p2D6YeN77yI5aaC5p6c5Y+v6IO977yJXG4gICAgY29uc3QgY29tYmluYXRpb25XZWlnaHQgPSB7XG4gICAgICB0aWFuR2FuV3VIZTogMC44LCAgICAgIC8vIOWkqeW5suS6lOWQiOadg+mHje+8iOS7jjAuNuaPkOmrmOWIsDAuOO+8iVxuICAgICAgZGlaaGlTYW5IZTogMS41LCAgICAgICAvLyDlnLDmlK/kuInlkIjmnYPph43vvIjku44xLjLmj5Dpq5jliLAxLjXvvIlcbiAgICAgIGRpWmhpU2FuSHVpOiAxLjIsICAgICAgLy8g5Zyw5pSv5LiJ5Lya5p2D6YeN77yI5LuOMS4w5o+Q6auY5YiwMS4y77yJXG4gICAgICBwYXJ0aWFsU2FuSGU6IDAuOSwgICAgIC8vIOmDqOWIhuS4ieWQiOadg+mHje+8iOaWsOWinu+8jOS4uuWujOaVtOS4ieWQiOeahDYwJe+8iVxuICAgICAgcGFydGlhbFNhbkh1aTogMC43ICAgICAvLyDpg6jliIbkuInkvJrmnYPph43vvIjmlrDlop7vvIzkuLrlrozmlbTkuInkvJrnmoQ2MCXvvIlcbiAgICB9O1xuXG4gICAgaWYgKHd1WGluZ0RldGFpbHMuY29tYmluYXRpb24gJiYgd3VYaW5nRGV0YWlscy5jb21iaW5hdGlvbiA+IDApIHtcbiAgICAgIC8vIOWkqeW5suS6lOWQiFxuICAgICAgY29uc3QgdGlhbkdhbld1SGUgPSB0aGlzLmNoZWNrVGlhbkdhbld1SGUoKTtcbiAgICAgIGlmICh0aWFuR2FuV3VIZSkge1xuICAgICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVd1SGUodGlhbkdhbld1SGUpO1xuICAgICAgICBpZiAoaGVXdVhpbmcgPT09IHd1WGluZykge1xuICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWkqeW5suS6lOWQiO+8miR7dGlhbkdhbld1SGV95ZCI5YyWJHt3dVhpbmd977yM5b6X5YiGKyR7Y29tYmluYXRpb25XZWlnaHQudGlhbkdhbld1SGUudG9GaXhlZCgxKX3vvIjlpKnlubLkupTlkIjmnYPph43vvIzmj5Dpq5jku6Xlop7lvLrnu4TlkIjlvbHlk43vvIlcXG5gO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIOWcsOaUr+S4ieWQiFxuICAgICAgY29uc3QgZGlaaGlTYW5IZSA9IHRoaXMuY2hlY2tEaVpoaVNhbkhlKCk7XG4gICAgICBpZiAoZGlaaGlTYW5IZSkge1xuICAgICAgICBjb25zdCBoZVd1WGluZyA9IHRoaXMuZ2V0V3VYaW5nRnJvbVNhbkhlKGRpWmhpU2FuSGUpO1xuICAgICAgICBpZiAoaGVXdVhpbmcgPT09IHd1WGluZykge1xuICAgICAgICAgIC8vIOajgOafpeaYr+WujOaVtOS4ieWQiOi/mOaYr+mDqOWIhuS4ieWQiFxuICAgICAgICAgIGNvbnN0IHsgeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaCB9ID0gdGhpcy5iYXppSW5mbztcbiAgICAgICAgICBjb25zdCBicmFuY2hlcyA9IFt5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoXS5maWx0ZXIoYnJhbmNoID0+IGJyYW5jaCAhPT0gdW5kZWZpbmVkKSBhcyBzdHJpbmdbXTtcblxuICAgICAgICAgIC8vIOagueaNruS4ieWQiOexu+Wei+iOt+WPluWvueW6lOeahOWcsOaUr1xuICAgICAgICAgIGNvbnN0IHNhbkhlUGF0dGVybnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gICAgICAgICAgICAn5a+F5Y2I5oiMJzogWyflr4UnLCAn5Y2IJywgJ+aIjCddLFxuICAgICAgICAgICAgJ+eUs+WtkOi+sCc6IFsn55SzJywgJ+WtkCcsICfovrAnXSxcbiAgICAgICAgICAgICfkuqXlja/mnKonOiBbJ+S6pScsICflja8nLCAn5pyqJ10sXG4gICAgICAgICAgICAn5bez6YWJ5LiRJzogWyflt7MnLCAn6YWJJywgJ+S4kSddXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSBzYW5IZVBhdHRlcm5zW2RpWmhpU2FuSGVdO1xuICAgICAgICAgIGlmIChwYXR0ZXJuKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVkQnJhbmNoZXMgPSBicmFuY2hlcy5maWx0ZXIoYnJhbmNoID0+IHBhdHRlcm4uaW5jbHVkZXMoYnJhbmNoKSk7XG4gICAgICAgICAgICBjb25zdCB1bmlxdWVCcmFuY2hlcyA9IG5ldyBTZXQobWF0Y2hlZEJyYW5jaGVzKTtcblxuICAgICAgICAgICAgaWYgKHVuaXF1ZUJyYW5jaGVzLnNpemUgPT09IDMpIHtcbiAgICAgICAgICAgICAgLy8g5a6M5pW05LiJ5ZCIXG4gICAgICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWcsOaUr+S4ieWQiO+8miR7ZGlaaGlTYW5IZX3kuInlkIgke3d1WGluZ33lsYDvvIjlrozmlbTvvInvvIzlvpfliIYrJHtjb21iaW5hdGlvbldlaWdodC5kaVpoaVNhbkhlLnRvRml4ZWQoMSl977yI5Zyw5pSv5LiJ5ZCI5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIOmDqOWIhuS4ieWQiFxuICAgICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlnLDmlK/kuInlkIjvvJoke2RpWmhpU2FuSGV95LiJ5ZCIJHt3dVhpbmd95bGA77yI6YOo5YiG77yJ77yM5b6X5YiGKyR7Y29tYmluYXRpb25XZWlnaHQucGFydGlhbFNhbkhlLnRvRml4ZWQoMSl977yI6YOo5YiG5LiJ5ZCI5p2D6YeN77yM5paw5aKe5Yy65YiG5a6M5pW05bqm77yJXFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8g5Zyw5pSv5LiJ5LyaXG4gICAgICBjb25zdCBkaVpoaVNhbkh1aSA9IHRoaXMuY2hlY2tEaVpoaVNhbkh1aSgpO1xuICAgICAgaWYgKGRpWmhpU2FuSHVpKSB7XG4gICAgICAgIGNvbnN0IGhlV3VYaW5nID0gdGhpcy5nZXRXdVhpbmdGcm9tU2FuSHVpKGRpWmhpU2FuSHVpKTtcbiAgICAgICAgaWYgKGhlV3VYaW5nID09PSB3dVhpbmcpIHtcbiAgICAgICAgICAvLyDmo4Dmn6XmmK/lrozmlbTkuInkvJrov5jmmK/pg6jliIbkuInkvJpcbiAgICAgICAgICBjb25zdCB7IHllYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIGhvdXJCcmFuY2ggfSA9IHRoaXMuYmF6aUluZm87XG4gICAgICAgICAgY29uc3QgYnJhbmNoZXMgPSBbeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaF0uZmlsdGVyKGJyYW5jaCA9PiBicmFuY2ggIT09IHVuZGVmaW5lZCkgYXMgc3RyaW5nW107XG5cbiAgICAgICAgICAvLyDmoLnmja7kuInkvJrnsbvlnovojrflj5blr7nlupTnmoTlnLDmlK9cbiAgICAgICAgICBjb25zdCBzYW5IdWlQYXR0ZXJuczoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgICAgICAgICAgICflr4Xlja/ovrAnOiBbJ+WvhScsICflja8nLCAn6L6wJ10sXG4gICAgICAgICAgICAn5bez5Y2I5pyqJzogWyflt7MnLCAn5Y2IJywgJ+acqiddLFxuICAgICAgICAgICAgJ+eUs+mFieaIjCc6IFsn55SzJywgJ+mFiScsICfmiIwnXSxcbiAgICAgICAgICAgICfkuqXlrZDkuJEnOiBbJ+S6pScsICflrZAnLCAn5LiRJ11cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgcGF0dGVybiA9IHNhbkh1aVBhdHRlcm5zW2RpWmhpU2FuSHVpXTtcbiAgICAgICAgICBpZiAocGF0dGVybikge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZEJyYW5jaGVzID0gYnJhbmNoZXMuZmlsdGVyKGJyYW5jaCA9PiBwYXR0ZXJuLmluY2x1ZGVzKGJyYW5jaCkpO1xuICAgICAgICAgICAgY29uc3QgdW5pcXVlQnJhbmNoZXMgPSBuZXcgU2V0KG1hdGNoZWRCcmFuY2hlcyk7XG5cbiAgICAgICAgICAgIGlmICh1bmlxdWVCcmFuY2hlcy5zaXplID09PSAzKSB7XG4gICAgICAgICAgICAgIC8vIOWujOaVtOS4ieS8mlxuICAgICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlnLDmlK/kuInkvJrvvJoke2RpWmhpU2FuSHVpfeS4ieS8miR7d3VYaW5nfeWxgO+8iOWujOaVtO+8ie+8jOW+l+WIhiske2NvbWJpbmF0aW9uV2VpZ2h0LmRpWmhpU2FuSHVpLnRvRml4ZWQoMSl977yI5Zyw5pSv5LiJ5Lya5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXFxuYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIOmDqOWIhuS4ieS8mlxuICAgICAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDlnLDmlK/kuInkvJrvvJoke2RpWmhpU2FuSHVpfeS4ieS8miR7d3VYaW5nfeWxgO+8iOmDqOWIhu+8ie+8jOW+l+WIhiske2NvbWJpbmF0aW9uV2VpZ2h0LnBhcnRpYWxTYW5IdWkudG9GaXhlZCgxKX3vvIjpg6jliIbkuInkvJrmnYPph43vvIzmlrDlop7ljLrliIblrozmlbTluqbvvIlcXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaAu+e7k1xuICAgIGNhbGN1bGF0aW9uICs9IGBcXG7jgJDmgLvliIborqHnrpfjgJFcXG5gO1xuXG4gICAgLy8g5ZCE6aG55b6X5YiG5piO57uGXG4gICAgY2FsY3VsYXRpb24gKz0gYC0gJHt3dVhpbmd95LqU6KGM5ZCE6aG55b6X5YiG77yaXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgICDigKIg5aSp5bmy5LqU6KGM77yaJHt3dVhpbmdEZXRhaWxzLnRpYW5HYW4gPyB3dVhpbmdEZXRhaWxzLnRpYW5HYW4udG9GaXhlZCgyKSA6ICcwLjAwJ31cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAgIOKAoiDlnLDmlK/ol4/lubLvvJoke3d1WGluZ0RldGFpbHMuZGlaaGlDYW5nID8gd3VYaW5nRGV0YWlscy5kaVpoaUNhbmcudG9GaXhlZCgyKSA6ICcwLjAwJ31cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAgIOKAoiDnurPpn7PkupTooYzvvJoke3d1WGluZ0RldGFpbHMubmFZaW4gPyB3dVhpbmdEZXRhaWxzLm5hWWluLnRvRml4ZWQoMikgOiAnMC4wMCd9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgICDigKIg5a2j6IqC6LCD5pW077yaJHt3dVhpbmdEZXRhaWxzLnNlYXNvbiA/IHd1WGluZ0RldGFpbHMuc2Vhc29uLnRvRml4ZWQoMikgOiAnMC4wMCd9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgICDigKIg5pyI5Luk5Yqg5oiQ77yaJHsod3VYaW5nRGV0YWlscyBhcyBhbnkpLm1vbnRoRG9taW5hbnQgPyAod3VYaW5nRGV0YWlscyBhcyBhbnkpLm1vbnRoRG9taW5hbnQudG9GaXhlZCgyKSA6ICcwLjAwJ31cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAgIOKAoiDnu4TlkIjosIPmlbTvvJoke3d1WGluZ0RldGFpbHMuY29tYmluYXRpb24gPyB3dVhpbmdEZXRhaWxzLmNvbWJpbmF0aW9uLnRvRml4ZWQoMikgOiAnMC4wMCd9XFxuYDtcblxuICAgIC8vIOaAu+WIhuWSjOebuOWvueW8uuW6plxuICAgIGNvbnN0IHRvdGFsU2NvcmUgPSB3dVhpbmdEZXRhaWxzLnRvdGFsIHx8IDA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0gJHt3dVhpbmd95LqU6KGM5oC75b6X5YiG77yaJHt0b3RhbFNjb3JlLnRvRml4ZWQoMil9XFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDmiYDmnInkupTooYzmgLvlvpfliIbvvJoke3RvdGFsLnRvRml4ZWQoMil9XFxuYDtcblxuICAgIC8vIOiuoeeul+ebuOWvueW8uuW6pu+8jOmBv+WFjemZpOS7pembtlxuICAgIGxldCByZWxhdGl2ZVN0cmVuZ3RoID0gMDtcbiAgICBpZiAodG90YWwgPiAwKSB7XG4gICAgICByZWxhdGl2ZVN0cmVuZ3RoID0gdG90YWxTY29yZSAvIHRvdGFsICogMTA7XG4gICAgfVxuICAgIGNhbGN1bGF0aW9uICs9IGAtICR7d3VYaW5nfeS6lOihjOebuOWvueW8uuW6pu+8miR7dG90YWxTY29yZS50b0ZpeGVkKDIpfSAvICR7dG90YWwudG9GaXhlZCgyKX0gKiAxMCA9ICR7cmVsYXRpdmVTdHJlbmd0aC50b0ZpeGVkKDIpfVxcbmA7XG5cbiAgICAvLyDmnYPph43liIbphY3or7TmmI5cbiAgICBjYWxjdWxhdGlvbiArPSBgXFxu44CQ5p2D6YeN5YiG6YWN6K+05piO44CRXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlpKnlubLmnYPph43vvJrlubTlubIoMS4yKSA8IOaciOW5sigzLjApID0g5pel5bmyKDMuMCkgPiDml7blubIoMS4wKe+8jOeqgeWHuuaciOS7pOWSjOaXpeS4u+mHjeimgeaAp1xcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g5Zyw5pSv6JeP5bmy5p2D6YeN77ya5bm05pSvKDAuOCkgPCDmnIjmlK8oMi41KSA+IOaXpeaUrygyLjIpID4g5pe25pSvKDAuNynvvIznqoHlh7rmnIjku6Tph43opoHmgKdcXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOe6s+mfs+S6lOihjOadg+mHje+8muW5tOafsSgwLjYpIDwg5pyI5p+xKDIuMCkgPiDml6Xmn7EoMS41KSA+IOaXtuafsSgwLjUp77yM56qB5Ye65pyI5Luk6YeN6KaB5oCnXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDlraPoioLosIPmlbTvvJrml7ooKzIuNSnjgIHnm7goKzEuMinjgIHlubMoMCnjgIHlm5ooLTEuMinjgIHmrbsoLTEuOCnvvIzlvLrljJblraPoioLlvbHlk41cXG5gO1xuICAgIGNhbGN1bGF0aW9uICs9IGAtIOaciOS7pOWKoOaIkO+8muW9k+S7pCgrMi4wKeOAgeebuOaXuigrMS4wKeOAgeW5s+WSjCgwKeOAgeWbmigtMC41KeOAgeatuygtMC44Ke+8jOWFqOmdouiAg+iZkeaciOS7pOW9seWTjVxcbmA7XG4gICAgY2FsY3VsYXRpb24gKz0gYC0g57uE5ZCI5YWz57O777ya5aSp5bmy5LqU5ZCIKCswLjgp44CB5Zyw5pSv5LiJ5ZCIKCsxLjUvKzAuOSnjgIHlnLDmlK/kuInkvJooKzEuMi8rMC43Ke+8jOWMuuWIhuWujOaVtOW6plxcbmA7XG5cbiAgICByZXR1cm4gY2FsY3VsYXRpb247XG4gIH1cblxuICAvKipcbiAgICog5pi+56S65pel5Li75pe66KGw6K+m57uG6Kej6YeK77yI5bim6K6h566X6L+H56iL77yJXG4gICAqIEBwYXJhbSByaVpodSDml6XkuLvml7roobDnirbmgIFcbiAgICogQHBhcmFtIHd1WGluZyDml6XkuLvkupTooYxcbiAgICovXG4gIHByaXZhdGUgc2hvd1JpWmh1Q2FsY3VsYXRpb24ocmlaaHU6IHN0cmluZywgd3VYaW5nOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZygnc2hvd1JpWmh1Q2FsY3VsYXRpb24g6KKr6LCD55SoJywgcmlaaHUsIHd1WGluZyk7XG5cbiAgICAvLyDojrflj5bml6XkuLvml7roobDor6bnu4bkv6Hmga9cbiAgICBjb25zdCByaVpodUluZm8gPSB7XG4gICAgICBleHBsYW5hdGlvbjogdGhpcy5nZXRSaVpodURlc2NyaXB0aW9uKHJpWmh1KSxcbiAgICAgIGluZmx1ZW5jZTogdGhpcy5nZXRSaVpodUluZmx1ZW5jZShyaVpodSksXG4gICAgICBjYWxjdWxhdGlvbjogJydcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKCdyaVpodUluZm86JywgcmlaaHVJbmZvKTtcblxuICAgIC8vIOWIm+W7uuW8ueeql1xuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWwuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwnO1xuXG4gICAgLy8g5Yib5bu65by556qX5YaF5a65XG4gICAgY29uc3QgbW9kYWxDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWxDb250ZW50LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvbnRlbnQnO1xuXG4gICAgLy8g5Yib5bu65qCH6aKYXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gYOaXpeS4u+aXuuihsOivpuino++8miR7cmlaaHV9YDtcbiAgICB0aXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10aXRsZSc7XG5cbiAgICAvLyDliJvlu7rnsbvlnotcbiAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IGDml6XkuLvkupTooYw6ICR7d3VYaW5nLmNoYXJBdCgwKX1gOyAgLy8g5Y+q5Y+W56ys5LiA5Liq5a2X56ym77yM6YG/5YWN5pi+56S6XCLngavngatcIlxuICAgIHR5cGUuY2xhc3NOYW1lID0gYGJhemktbW9kYWwtdHlwZSBiYXppLW1vZGFsLXR5cGUtJHt0aGlzLmdldFd1WGluZ0NsYXNzRnJvbU5hbWUod3VYaW5nKX1gO1xuXG4gICAgLy8g5Yib5bu66Kej6YeKXG4gICAgY29uc3QgZXhwbGFuYXRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZXhwbGFuYXRpb25UZXh0LnRleHRDb250ZW50ID0gcmlaaHVJbmZvLmV4cGxhbmF0aW9uO1xuICAgIGV4cGxhbmF0aW9uVGV4dC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1leHBsYW5hdGlvbic7XG5cbiAgICAvLyDliJvlu7rlvbHlk41cbiAgICBjb25zdCBpbmZsdWVuY2VUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5mbHVlbmNlVGV4dC50ZXh0Q29udGVudCA9IHJpWmh1SW5mby5pbmZsdWVuY2U7XG4gICAgaW5mbHVlbmNlVGV4dC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1pbmZsdWVuY2UnO1xuXG4gICAgLy8g5Yib5bu66K6h566X5pa55rOVXG4gICAgY29uc3QgY2FsY3VsYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjYWxjdWxhdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jYWxjdWxhdGlvbic7XG5cbiAgICAvLyDojrflj5blrp7pmYXorqHnrpfov4fnqItcbiAgICBsZXQgYWN0dWFsQ2FsY3VsYXRpb24gPSAnJztcbiAgICB0cnkge1xuICAgICAgYWN0dWFsQ2FsY3VsYXRpb24gPSB0aGlzLmdldEFjdHVhbFJpWmh1Q2FsY3VsYXRpb24ocmlaaHUsIHd1WGluZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYOiuoeeulyR7d3VYaW5nfeaXpeS4uyR7cmlaaHV95pe25Ye66ZSZOmAsIGVycm9yKTtcbiAgICB9XG5cbiAgICBpZiAoIWFjdHVhbENhbGN1bGF0aW9uKSB7XG4gICAgICBhY3R1YWxDYWxjdWxhdGlvbiA9IHJpWmh1SW5mby5jYWxjdWxhdGlvbiB8fCBg5peg5rOV6K6h566XJHt3dVhpbmd95pel5Li7JHtyaVpodX3vvIzor7fmo4Dmn6XlhavlrZfkv6Hmga/mmK/lkKblrozmlbTjgIJgO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuiuoeeul+aWueazleagh+mimOWSjOWkjeWItuaMiemSrlxuICAgIGNvbnN0IGNhbGN1bGF0aW9uSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2FsY3VsYXRpb25IZWFkZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2FsY3VsYXRpb24taGVhZGVyJztcblxuICAgIGNvbnN0IGNhbGN1bGF0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHJvbmcnKTtcbiAgICBjYWxjdWxhdGlvblRpdGxlLnRleHRDb250ZW50ID0gJ+OAkOiuoeeul+aWueazleOAkSc7XG5cbiAgICBjb25zdCBjb3B5QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY29weUJ1dHRvbi50ZXh0Q29udGVudCA9ICflpI3liLborqHnrpfov4fnqIsnO1xuICAgIGNvcHlCdXR0b24uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29weS1idXR0b24nO1xuICAgIGNvcHlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAvLyDlpI3liLborqHnrpfov4fnqIvliLDliarotLTmnb9cbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGFjdHVhbENhbGN1bGF0aW9uKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8g5pi+56S65aSN5Yi25oiQ5Yqf5o+Q56S6XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gY29weUJ1dHRvbi50ZXh0Q29udGVudDtcbiAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ+WkjeWItuaIkOWKn++8gSc7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xuICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpI3liLblpLHotKU6JywgZXJyKTtcbiAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ+WkjeWItuWksei0pSc7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb3B5QnV0dG9uLnRleHRDb250ZW50ID0gJ+WkjeWItuiuoeeul+i/h+eoiyc7XG4gICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY2FsY3VsYXRpb25IZWFkZXIuYXBwZW5kQ2hpbGQoY2FsY3VsYXRpb25UaXRsZSk7XG4gICAgY2FsY3VsYXRpb25IZWFkZXIuYXBwZW5kQ2hpbGQoY29weUJ1dHRvbik7XG5cbiAgICAvLyDliJvlu7rorqHnrpfov4fnqIvlhoXlrrlcbiAgICBjb25zdCBjYWxjdWxhdGlvbkNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICBjYWxjdWxhdGlvbkNvbnRlbnQuc3R5bGUudXNlclNlbGVjdCA9ICd0ZXh0JztcbiAgICBjYWxjdWxhdGlvbkNvbnRlbnQudGV4dENvbnRlbnQgPSBhY3R1YWxDYWxjdWxhdGlvbjtcblxuICAgIC8vIOa3u+WKoOiuoeeul+aWueazleWIsOW8ueeql1xuICAgIGNhbGN1bGF0aW9uLmFwcGVuZENoaWxkKGNhbGN1bGF0aW9uSGVhZGVyKTtcbiAgICBjYWxjdWxhdGlvbi5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbkNvbnRlbnQpO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5YaF5a655Yiw5by556qXXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZVRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WIsOmhtemdolxuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG4gICAgY29uc29sZS5sb2coJ+W8ueeql+WIm+W7uuWujOaIkO+8jOWHhuWkh+a3u+WKoOWIsOmhtemdoicpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuICAgIGNvbnNvbGUubG9nKCflvLnnqpflt7Lmt7vliqDliLDpobXpnaInKTtcblxuICAgIC8vIOeCueWHu+W8ueeql+WklumDqOWFs+mXreW8ueeql1xuICAgIG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gbW9kYWwpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5a6e6ZmF55qE5pel5Li75pe66KGw6K6h566X6L+H56iLXG4gICAqIEBwYXJhbSByaVpodSDml6XkuLvml7roobDnirbmgIFcbiAgICogQHBhcmFtIHd1WGluZyDml6XkuLvkupTooYxcbiAgICogQHJldHVybnMg5a6e6ZmF6K6h566X6L+H56iLXG4gICAqL1xuICBwcml2YXRlIGdldEFjdHVhbFJpWmh1Q2FsY3VsYXRpb24ocmlaaHU6IHN0cmluZywgd3VYaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5iYXppSW5mbyB8fCAhdGhpcy5iYXppSW5mby5yaVpodVN0cmVuZ3RoRGV0YWlscykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGRldGFpbHMgPSB0aGlzLmJhemlJbmZvLnJpWmh1U3RyZW5ndGhEZXRhaWxzO1xuXG4gICAgLy8g5p6E5bu66K6h566X6L+H56iLXG4gICAgbGV0IGNhbGN1bGF0aW9uID0gYOaXpeS4u+aXuuihsOWunumZheiuoeeul+i/h+eoi++8mlxcblxcbmA7XG5cbiAgICAvLyDln7rmnKzkv6Hmga9cbiAgICBjYWxjdWxhdGlvbiArPSBg44CQ5Z+65pys5L+h5oGv44CRXFxuYDtcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XkuLvkupTooYzvvJoke3d1WGluZy5jaGFyQXQoMCl9XFxuYDsgIC8vIOWPquWPluesrOS4gOS4quWtl+espu+8jOmBv+WFjeaYvuekulwi54Gr54GrXCJcbiAgICBjYWxjdWxhdGlvbiArPSBgLSDmiYDlpITlraPoioLvvJoke2RldGFpbHMuc2Vhc29uIHx8ICfmnKrnn6UnfVxcblxcbmA7XG5cbiAgICAvLyDkupTooYzlvLrluqbliIbmnpBcbiAgICBjYWxjdWxhdGlvbiArPSBg44CQ5LqU6KGM5by65bqm5YiG5p6Q44CRXFxuYDtcbiAgICBpZiAodGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCkge1xuICAgICAgY29uc3Qgd3VYaW5nU3RyZW5ndGggPSB0aGlzLmJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoIGFzIGFueTtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOmHkeS6lOihjOW8uuW6pu+8miR7d3VYaW5nU3RyZW5ndGguamluLnRvRml4ZWQoMil9XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOacqOS6lOihjOW8uuW6pu+8miR7d3VYaW5nU3RyZW5ndGgubXUudG9GaXhlZCgyKX1cXG5gO1xuICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5rC05LqU6KGM5by65bqm77yaJHt3dVhpbmdTdHJlbmd0aC5zaHVpLnRvRml4ZWQoMil9XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOeBq+S6lOihjOW8uuW6pu+8miR7d3VYaW5nU3RyZW5ndGguaHVvLnRvRml4ZWQoMil9XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWcn+S6lOihjOW8uuW6pu+8miR7d3VYaW5nU3RyZW5ndGgudHUudG9GaXhlZCgyKX1cXG5cXG5gO1xuICAgIH1cblxuICAgIC8vIOaXpeS4u+S6lOihjOW8uuW6plxuICAgIGNhbGN1bGF0aW9uICs9IGDjgJDml6XkuLvkupTooYzlvLrluqbjgJFcXG5gO1xuICAgIGxldCBkYXlXdVhpbmdTdHJlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ud3VYaW5nU3RyZW5ndGgpIHtcbiAgICAgIGNvbnN0IHd1WGluZ1N0cmVuZ3RoID0gdGhpcy5iYXppSW5mby53dVhpbmdTdHJlbmd0aCBhcyBhbnk7XG4gICAgICBzd2l0Y2ggKHd1WGluZykge1xuICAgICAgICBjYXNlICfph5EnOiBkYXlXdVhpbmdTdHJlbmd0aCA9IHd1WGluZ1N0cmVuZ3RoLmppbjsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+acqCc6IGRheVd1WGluZ1N0cmVuZ3RoID0gd3VYaW5nU3RyZW5ndGgubXU7IGJyZWFrO1xuICAgICAgICBjYXNlICfmsLQnOiBkYXlXdVhpbmdTdHJlbmd0aCA9IHd1WGluZ1N0cmVuZ3RoLnNodWk7IGJyZWFrO1xuICAgICAgICBjYXNlICfngasnOiBkYXlXdVhpbmdTdHJlbmd0aCA9IHd1WGluZ1N0cmVuZ3RoLmh1bzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+Wcnyc6IGRheVd1WGluZ1N0cmVuZ3RoID0gd3VYaW5nU3RyZW5ndGgudHU7IGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5Li7JHt3dVhpbmd95LqU6KGM5by65bqm77yaJHtkYXlXdVhpbmdTdHJlbmd0aC50b0ZpeGVkKDIpfVxcblxcbmA7XG4gICAgfVxuXG4gICAgLy8g5pel5Li75pe66KGw5Yik5patXG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOaXpeS4u+aXuuihsOWIpOaWreOAkVxcbmA7XG4gICAgaWYgKGRldGFpbHMuanVkZ21lbnRSdWxlcykge1xuICAgICAgY2FsY3VsYXRpb24gKz0gYCR7ZGV0YWlscy5qdWRnbWVudFJ1bGVzfVxcblxcbmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaegeaXuu+8muebuOWvueW8uuW6piDiiaUgMS41XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXuu+8mjEuMiDiiaQg55u45a+55by65bqmIDwgMS41XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWBj+aXuu+8mjEuMCDiiaQg55u45a+55by65bqmIDwgMS4yXFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW5s+ihoe+8mjAuOCDiiaQg55u45a+55by65bqmIDwgMS4wXFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOWBj+W8se+8mjAuNiDiiaQg55u45a+55by65bqmIDwgMC44XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOW8se+8mjAuNCDiiaQg55u45a+55by65bqmIDwgMC42XFxuYDtcbiAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaegeW8se+8muebuOWvueW8uuW6piA8IDAuNFxcblxcbmA7XG4gICAgfVxuXG4gICAgLy8g6K6h566X57uT5p6cXG4gICAgY2FsY3VsYXRpb24gKz0gYOOAkOiuoeeul+e7k+aenOOAkVxcbmA7XG4gICAgaWYgKGRldGFpbHMucmVsYXRpdmVTdHJlbmd0aCkge1xuICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5Li755u45a+55by65bqm77yaJHtkZXRhaWxzLnJlbGF0aXZlU3RyZW5ndGgudG9GaXhlZCgyKX1cXG5gO1xuICAgIH1cbiAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XkuLvml7roobDliKTmlq3vvJoke3JpWmh1fVxcblxcbmA7XG5cbiAgICAvLyDnlKjnpZ7lu7rorq5cbiAgICBjYWxjdWxhdGlvbiArPSBg44CQ55So56We5bu66K6u44CRXFxuYDtcbiAgICBpZiAoZGV0YWlscy5yZWNvbW1lbmRhdGlvbikge1xuICAgICAgY2FsY3VsYXRpb24gKz0gYCR7ZGV0YWlscy5yZWNvbW1lbmRhdGlvbn1cXG5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHJpWmh1KSB7XG4gICAgICAgIGNhc2UgJ+aegeaXuic6XG4gICAgICAgIGNhc2UgJ+aXuic6XG4gICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5Li76L+H5pe677yM5Zac55So5rOE56eA5LmL54mp77yI6LSi5pif44CB5a6Y5pif77yJ5p2l5rOE5YW26L+H5pe65LmL5rCU44CC5b+M55So5Y2w5q+U5LmL54mp77yM5Lul5YWN5pu05Yqg5pe655ub44CCXFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn5YGP5pe6JzpcbiAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XkuLvlgY/ml7rvvIzllpznlKjms4Tnp4DkuYvnianvvIzkvYbkuI3lrpzov4flpJrjgILlj6/pgILlvZPnlKjljbDmr5TkuYvnianosIPlkozjgIJcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICflubPooaEnOlxuICAgICAgICAgIGNhbGN1bGF0aW9uICs9IGAtIOaXpeS4u+W5s+ihoe+8jOagueaNruWFt+S9k+aDheWGte+8jOWPr+WPluWNsOavlOaIlui0ouWumOOAgumcgOimgee7vOWQiOiAg+iZkeWFq+Wtl+agvOWxgOOAglxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+WBj+W8sSc6XG4gICAgICAgICAgY2FsY3VsYXRpb24gKz0gYC0g5pel5Li75YGP5byx77yM5Zac55So55Sf5om25LmL54mp77yI5Y2w5pif44CB5q+U5Yqr77yJ5p2l5aKe5by65pel5Li75Yqb6YeP44CC5b+M55So5rOE56eA5LmL54mp77yM5Lul5YWN5pu05Yqg6KGw5byx44CCXFxuYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAn5byxJzpcbiAgICAgICAgY2FzZSAn5p6B5byxJzpcbiAgICAgICAgICBjYWxjdWxhdGlvbiArPSBgLSDml6XkuLvoobDlvLHvvIzllpznlKjnlJ/mibbkuYvnianvvIjljbDmmJ/jgIHmr5TliqvvvInmnaXlop7lvLrml6XkuLvlipvph4/jgILlv4znlKjms4Tnp4DkuYvnianvvIzku6XlhY3mm7TliqDoobDlvLHjgIJcXG5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjYWxjdWxhdGlvbjtcbiAgfVxuXG5cblxuICAvKipcbiAgICog5qOA5p+l5Zyw5pSv5LiJ5LyaXG4gICAqIEByZXR1cm5zIOS4ieS8mue7hOWQiFxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja0RpWmhpU2FuSHVpKCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoIH0gPSB0aGlzLmJhemlJbmZvO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gW3llYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIGhvdXJCcmFuY2hdLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoICE9PSB1bmRlZmluZWQpIGFzIHN0cmluZ1tdO1xuXG4gICAgLy8g5qOA5p+l5LiJ5LyaXG4gICAgY29uc3Qgc2FuSHVpUGF0dGVybnMgPSBbXG4gICAgICB7cGF0dGVybjogWyflr4UnLCAn5Y2vJywgJ+i+sCddLCB0eXBlOiAn5a+F5Y2v6L6wJ30sXG4gICAgICB7cGF0dGVybjogWyflt7MnLCAn5Y2IJywgJ+acqiddLCB0eXBlOiAn5bez5Y2I5pyqJ30sXG4gICAgICB7cGF0dGVybjogWyfnlLMnLCAn6YWJJywgJ+aIjCddLCB0eXBlOiAn55Sz6YWJ5oiMJ30sXG4gICAgICB7cGF0dGVybjogWyfkuqUnLCAn5a2QJywgJ+S4kSddLCB0eXBlOiAn5Lql5a2Q5LiRJ31cbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCB7cGF0dGVybiwgdHlwZX0gb2Ygc2FuSHVpUGF0dGVybnMpIHtcbiAgICAgIC8vIOaUtumbhuWunumZheWHuueOsOeahOWcsOaUr1xuICAgICAgY29uc3QgbWF0Y2hlZEJyYW5jaGVzID0gYnJhbmNoZXMuZmlsdGVyKGJyYW5jaCA9PiBwYXR0ZXJuLmluY2x1ZGVzKGJyYW5jaCkpO1xuXG4gICAgICAvLyDmo4Dmn6XmmK/lkKboh7PlsJHmnInkuKTkuKrkuI3lkIznmoTlnLDmlK9cbiAgICAgIGNvbnN0IHVuaXF1ZUJyYW5jaGVzID0gbmV3IFNldChtYXRjaGVkQnJhbmNoZXMpO1xuXG4gICAgICBpZiAodW5pcXVlQnJhbmNoZXMuc2l6ZSA+PSAyKSB7IC8vIOiHs+WwkeacieS4pOS4quS4jeWQjOeahOWcsOaUr+W9ouaIkOS4ieS8mlxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LiJ5Lya5a+55bqU55qE5LqU6KGMXG4gICAqIEBwYXJhbSBzYW5IdWkg5LiJ5Lya57uE5ZCIXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdGcm9tU2FuSHVpKHNhbkh1aTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WvheWNr+i+sCc6ICfmnKgnLFxuICAgICAgJ+W3s+WNiOacqic6ICfngasnLFxuICAgICAgJ+eUs+mFieaIjCc6ICfph5EnLFxuICAgICAgJ+S6peWtkOS4kSc6ICfmsLQnXG4gICAgfTtcbiAgICByZXR1cm4gbWFwW3Nhbkh1aV0gfHwgJyc7XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIOiOt+WPluWkqeW5suWvueW6lOeahOS6lOihjFxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIGdldFd1WGluZ0Zyb21TdGVtKHN0ZW06IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gICAgaWYgKCFzdGVtKSByZXR1cm4gJyc7XG5cbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfmnKgnLCAn5LmZJzogJ+acqCcsXG4gICAgICAn5LiZJzogJ+eBqycsICfkuIEnOiAn54GrJyxcbiAgICAgICfmiIonOiAn5ZyfJywgJ+W3sSc6ICflnJ8nLFxuICAgICAgJ+W6mic6ICfph5EnLCAn6L6bJzogJ+mHkScsXG4gICAgICAn5aOsJzogJ+awtCcsICfnmbgnOiAn5rC0J1xuICAgIH07XG4gICAgcmV0dXJuIG1hcFtzdGVtXSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/lr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIGdldEJyYW5jaFd1WGluZyhicmFuY2g6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gICAgaWYgKCFicmFuY2gpIHJldHVybiAnJztcblxuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a+FJzogJ+acqCcsICflja8nOiAn5pyoJyxcbiAgICAgICflt7MnOiAn54GrJywgJ+WNiCc6ICfngasnLFxuICAgICAgJ+i+sCc6ICflnJ8nLCAn5LiRJzogJ+WcnycsICfmiIwnOiAn5ZyfJywgJ+acqic6ICflnJ8nLFxuICAgICAgJ+eUsyc6ICfph5EnLCAn6YWJJzogJ+mHkScsXG4gICAgICAn5LqlJzogJ+awtCcsICflrZAnOiAn5rC0J1xuICAgIH07XG4gICAgcmV0dXJuIG1hcFticmFuY2hdIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWcsOaUr+iOt+WPluWto+iKglxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDlraPoioJcbiAgICovXG4gIHByaXZhdGUgZ2V0U2Vhc29uKGJyYW5jaDogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcbiAgICBpZiAoIWJyYW5jaCkgcmV0dXJuICfmmKXlraMnOyAvLyDpu5jorqTkuLrmmKXlraNcblxuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a+FJzogJ+aYpeWtoycsICflja8nOiAn5pil5a2jJywgJ+i+sCc6ICfmmKXlraMnLFxuICAgICAgJ+W3syc6ICflpI/lraMnLCAn5Y2IJzogJ+Wkj+WtoycsICfmnKonOiAn5aSP5a2jJyxcbiAgICAgICfnlLMnOiAn56eL5a2jJywgJ+mFiSc6ICfnp4vlraMnLCAn5oiMJzogJ+eni+WtoycsXG4gICAgICAn5LqlJzogJ+WGrOWtoycsICflrZAnOiAn5Yas5a2jJywgJ+S4kSc6ICflhqzlraMnXG4gICAgfTtcbiAgICByZXR1cm4gbWFwW2JyYW5jaF0gfHwgJ+aYpeWtoyc7XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5aSp5bmy5LqU5ZCIXG4gICAqIEByZXR1cm5zIOS6lOWQiOe7hOWQiFxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja1RpYW5HYW5XdUhlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB5ZWFyU3RlbSwgbW9udGhTdGVtLCBkYXlTdGVtLCBob3VyU3RlbSB9ID0gdGhpcy5iYXppSW5mbztcbiAgICBjb25zdCBzdGVtcyA9IFt5ZWFyU3RlbSwgbW9udGhTdGVtLCBkYXlTdGVtLCBob3VyU3RlbV07XG5cbiAgICAvLyDmo4Dmn6XkupTlkIhcbiAgICBpZiAoc3RlbXMuaW5jbHVkZXMoJ+eUsicpICYmIHN0ZW1zLmluY2x1ZGVzKCflt7EnKSkgcmV0dXJuICfnlLLlt7EnO1xuICAgIGlmIChzdGVtcy5pbmNsdWRlcygn5LmZJykgJiYgc3RlbXMuaW5jbHVkZXMoJ+W6micpKSByZXR1cm4gJ+S5meW6mic7XG4gICAgaWYgKHN0ZW1zLmluY2x1ZGVzKCfkuJknKSAmJiBzdGVtcy5pbmNsdWRlcygn6L6bJykpIHJldHVybiAn5LiZ6L6bJztcbiAgICBpZiAoc3RlbXMuaW5jbHVkZXMoJ+S4gScpICYmIHN0ZW1zLmluY2x1ZGVzKCflo6wnKSkgcmV0dXJuICfkuIHlo6wnO1xuICAgIGlmIChzdGVtcy5pbmNsdWRlcygn5oiKJykgJiYgc3RlbXMuaW5jbHVkZXMoJ+eZuCcpKSByZXR1cm4gJ+aIiueZuCc7XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LqU5ZCI5a+55bqU55qE5LqU6KGMXG4gICAqIEBwYXJhbSB3dUhlIOS6lOWQiOe7hOWQiFxuICAgKiBAcmV0dXJucyDkupTooYxcbiAgICovXG4gIHByaXZhdGUgZ2V0V3VYaW5nRnJvbVd1SGUod3VIZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsuW3sSc6ICflnJ8nLFxuICAgICAgJ+S5meW6mic6ICfph5EnLFxuICAgICAgJ+S4mei+myc6ICfmsLQnLFxuICAgICAgJ+S4geWjrCc6ICfmnKgnLFxuICAgICAgJ+aIiueZuCc6ICfngasnXG4gICAgfTtcbiAgICByZXR1cm4gbWFwW3d1SGVdIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWcsOaUr+S4ieWQiFxuICAgKiBAcmV0dXJucyDkuInlkIjnu4TlkIhcbiAgICovXG4gIHByaXZhdGUgY2hlY2tEaVpoaVNhbkhlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoIH0gPSB0aGlzLmJhemlJbmZvO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gW3llYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIGhvdXJCcmFuY2hdLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoICE9PSB1bmRlZmluZWQpIGFzIHN0cmluZ1tdO1xuXG4gICAgLy8g5qOA5p+l5LiJ5ZCIXG4gICAgY29uc3Qgc2FuSGVQYXR0ZXJucyA9IFtcbiAgICAgIHtwYXR0ZXJuOiBbJ+WtkCcsICfnlLMnLCAn6L6wJ10sIHR5cGU6ICflrZDnlLPovrAnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+S6pScsICflja8nLCAn5pyqJ10sIHR5cGU6ICfkuqXlja/mnKonfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+WvhScsICfljYgnLCAn5oiMJ10sIHR5cGU6ICflr4XljYjmiIwnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+W3sycsICfphYknLCAn5LiRJ10sIHR5cGU6ICflt7PphYnkuJEnfVxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHtwYXR0ZXJuLCB0eXBlfSBvZiBzYW5IZVBhdHRlcm5zKSB7XG4gICAgICAvLyDmlLbpm4blrp7pmYXlh7rnjrDnmoTlnLDmlK9cbiAgICAgIGNvbnN0IG1hdGNoZWRCcmFuY2hlcyA9IGJyYW5jaGVzLmZpbHRlcihicmFuY2ggPT4gcGF0dGVybi5pbmNsdWRlcyhicmFuY2gpKTtcblxuICAgICAgLy8g5qOA5p+l5piv5ZCm6Iez5bCR5pyJ5Lik5Liq5LiN5ZCM55qE5Zyw5pSvXG4gICAgICBjb25zdCB1bmlxdWVCcmFuY2hlcyA9IG5ldyBTZXQobWF0Y2hlZEJyYW5jaGVzKTtcblxuICAgICAgaWYgKHVuaXF1ZUJyYW5jaGVzLnNpemUgPj0gMikgeyAvLyDoh7PlsJHmnInkuKTkuKrkuI3lkIznmoTlnLDmlK/lvaLmiJDkuInlkIhcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS4ieWQiOWvueW6lOeahOS6lOihjFxuICAgKiBAcGFyYW0gc2FuSGUg5LiJ5ZCI57uE5ZCIXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRXdVhpbmdGcm9tU2FuSGUoc2FuSGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICflrZDnlLPovrAnOiAn5rC0JyxcbiAgICAgICfkuqXlja/mnKonOiAn5pyoJyxcbiAgICAgICflr4XljYjmiIwnOiAn54GrJyxcbiAgICAgICflt7PphYnkuJEnOiAn6YeRJ1xuICAgIH07XG4gICAgcmV0dXJuIG1hcFtzYW5IZV0gfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5pel5Li75pe66KGw55qE5o+P6L+wXG4gICAqIEBwYXJhbSByaVpodSDml6XkuLvml7roobDnirbmgIFcbiAgICogQHJldHVybnMg5o+P6L+wXG4gICAqL1xuICBwcml2YXRlIGdldFJpWmh1RGVzY3JpcHRpb24ocmlaaHU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZGVzY3JpcHRpb25zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfmnoHml7onOiAn5pel5Li75LqU6KGM5Yqb6YeP5p6B5by677yM6IO96YeP6L+H5Ymp77yM6ZyA6KaB5rOE56eA44CC5oCn5qC85Yia5by677yM6Ieq5L+h5b+D5by677yM5pyJ5Li76KeB77yM5YGa5LqL5pyJ6a2E5Yqb44CCJyxcbiAgICAgICfml7onOiAn5pel5Li75LqU6KGM5Yqb6YeP5YWF5rKb77yM6IO96YeP5YWF6Laz77yM5a6c5rOE5LiN5a6c5om244CC5oCn5qC86L6D5Li65Yia5by677yM6Ieq5L+h5b+D5by677yM5pyJ5Li76KeB77yM5YGa5LqL5pyJ6a2E5Yqb44CCJyxcbiAgICAgICflgY/ml7onOiAn5pel5Li75LqU6KGM5Yqb6YeP6L6D5by677yM6IO96YeP55Wl5pyJ55uI5L2Z77yM5a6c6YCC5bqm5rOE56eA44CC5oCn5qC86L6D5Li65bmz6KGh77yM6Ieq5L+h5L2G5LiN6L+H5YiG77yM6IO95aSf6YCC5bqU5ZCE56eN546v5aKD44CCJyxcbiAgICAgICflubPooaEnOiAn5pel5Li75LqU6KGM5Yqb6YeP6YCC5Lit77yM6IO96YeP5bmz6KGh77yM5Zac5b+M6ZyA6KeG5YW35L2T5oOF5Ya16ICM5a6a44CC5oCn5qC85rip5ZKM77yM6YCC5bqU5Yqb5by677yM6IO95aSf6J6N5YWl5ZCE56eN546v5aKD44CCJyxcbiAgICAgICflgY/lvLEnOiAn5pel5Li75LqU6KGM5Yqb6YeP55Wl5pi+5LiN6Laz77yM6IO96YeP55Wl5pyJ5LiN6Laz77yM5a6c6YCC5bqm5om25Yqp44CC5oCn5qC86L6D5Li65YaF5ZCR77yM6Ieq5L+h5b+D5LiN6Laz77yM5a655piT5Y+X5aSW55WM5b2x5ZON44CCJyxcbiAgICAgICflvLEnOiAn5pel5Li75LqU6KGM5Yqb6YeP5LiN6Laz77yM6IO96YeP57y65LmP77yM6ZyA6KaB5om25Yqp44CC5oCn5qC86L6D5Li65YaF5ZCR77yM6Ieq5L+h5b+D5LiN6Laz77yM5a655piT5Y+X5aSW55WM5b2x5ZON44CCJyxcbiAgICAgICfmnoHlvLEnOiAn5pel5Li75LqU6KGM5Yqb6YeP5p6B5byx77yM6IO96YeP5Lil6YeN5LiN6Laz77yM5oCl6ZyA5om25Yqp44CC5oCn5qC86L2v5byx77yM57y65LmP6Ieq5L+h77yM5a655piT5Y+X5Yi25LqO5Lq644CCJ1xuICAgIH07XG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uc1tyaVpodV0gfHwgJ+aXpeS4u+S6lOihjOWKm+mHj+mAguS4re+8jOiDvemHj+W5s+ihoeOAgic7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5pel5Li75pe66KGw55qE5b2x5ZONXG4gICAqIEBwYXJhbSByaVpodSDml6XkuLvml7roobDnirbmgIFcbiAgICogQHJldHVybnMg5b2x5ZONXG4gICAqL1xuICBwcml2YXRlIGdldFJpWmh1SW5mbHVlbmNlKHJpWmh1OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGluZmx1ZW5jZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+aegeaXuic6ICfml6XkuLvov4fml7rvvIzllpznlKjms4Tnp4DkuYvnianvvIjotKLmmJ/jgIHlrpjmmJ/vvInmnaXms4Tlhbbov4fml7rkuYvmsJTjgILlv4znlKjljbDmr5TkuYvnianvvIzku6XlhY3mm7TliqDml7rnm5vjgIInLFxuICAgICAgJ+aXuic6ICfml6XkuLvml7rnm5vvvIzllpznlKjms4Tnp4DkuYvnianvvIjotKLmmJ/jgIHlrpjmmJ/vvInmnaXms4Tlhbbml7rnm5vkuYvmsJTjgILlv4znlKjljbDmr5TkuYvnianvvIzku6XlhY3mm7TliqDml7rnm5vjgIInLFxuICAgICAgJ+WBj+aXuic6ICfml6XkuLvlgY/ml7rvvIzllpznlKjms4Tnp4DkuYvnianvvIzkvYbkuI3lrpzov4flpJrjgILlj6/pgILlvZPnlKjljbDmr5TkuYvnianosIPlkozjgIInLFxuICAgICAgJ+W5s+ihoSc6ICfml6XkuLvlubPooaHvvIzmoLnmja7lhbfkvZPmg4XlhrXvvIzlj6/lj5bljbDmr5TmiJbotKLlrpjjgILpnIDopoHnu7zlkIjogIPomZHlhavlrZfmoLzlsYDjgIInLFxuICAgICAgJ+WBj+W8sSc6ICfml6XkuLvlgY/lvLHvvIzllpznlKjnlJ/mibbkuYvnianvvIjljbDmmJ/jgIHmr5TliqvvvInmnaXlop7lvLrml6XkuLvlipvph4/jgILlv4znlKjms4Tnp4DkuYvnianvvIzku6XlhY3mm7TliqDoobDlvLHjgIInLFxuICAgICAgJ+W8sSc6ICfml6XkuLvoobDlvLHvvIzllpznlKjnlJ/mibbkuYvnianvvIjljbDmmJ/jgIHmr5TliqvvvInmnaXlop7lvLrml6XkuLvlipvph4/jgILlv4znlKjms4Tnp4DkuYvnianvvIzku6XlhY3mm7TliqDoobDlvLHjgIInLFxuICAgICAgJ+aegeW8sSc6ICfml6XkuLvmnoHlvLHvvIzlv4XpobvnlKjnlJ/mibbkuYvnianmnaXlop7lvLrml6XkuLvlipvph4/jgILkuKXnpoHnlKjms4Tnp4DkuYvnianvvIzku6XlhY3mm7TliqDoobDlvLHjgIInXG4gICAgfTtcbiAgICByZXR1cm4gaW5mbHVlbmNlc1tyaVpodV0gfHwgJ+aXpeS4u+W5s+ihoe+8jOmcgOimgee7vOWQiOiAg+iZkeWFq+Wtl+agvOWxgOOAgic7XG4gIH1cblxuICAvKipcbiAgICog5pi+56S65pel5Li75pe66KGw6K+m57uG6Kej6YeKXG4gICAqIEBwYXJhbSByaVpodVN0cmVuZ3RoIOaXpeS4u+aXuuihsFxuICAgKiBAcGFyYW0gZGF5V3VYaW5nIOaXpeS4u+S6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzaG93UmlaaHVFeHBsYW5hdGlvbihyaVpodVN0cmVuZ3RoOiBzdHJpbmcsIGRheVd1WGluZzogc3RyaW5nKSB7XG4gICAgLy8g5Yib5bu65by556qXXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbCc7XG5cbiAgICAvLyDliJvlu7rlvLnnqpflhoXlrrlcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29udGVudCc7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBg5pel5Li75pe66KGw6K+m6Kej77yaJHtyaVpodVN0cmVuZ3RofWA7XG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdGl0bGUnO1xuXG4gICAgLy8g5Yib5bu65LqU6KGM57G75Z6LXG4gICAgY29uc3QgdHlwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHR5cGUudGV4dENvbnRlbnQgPSBg5pel5Li75LqU6KGM77yaJHtkYXlXdVhpbmd9YDtcbiAgICB0eXBlLmNsYXNzTmFtZSA9IGBiYXppLW1vZGFsLXR5cGUgYmF6aS1tb2RhbC10eXBlLSR7dGhpcy5nZXRXdVhpbmdDbGFzc0Zyb21OYW1lKGRheVd1WGluZyl9YDtcblxuICAgIC8vIOWIm+W7uuino+mHilxuICAgIGNvbnN0IGV4cGxhbmF0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgIGV4cGxhbmF0aW9uVGl0bGUudGV4dENvbnRlbnQgPSAn5pe66KGw6K+05piOJztcbiAgICBleHBsYW5hdGlvblRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuXG4gICAgY29uc3QgZXhwbGFuYXRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZXhwbGFuYXRpb25UZXh0LnRleHRDb250ZW50ID0gdGhpcy5nZXRSaVpodUluZmx1ZW5jZShyaVpodVN0cmVuZ3RoKTtcbiAgICBleHBsYW5hdGlvblRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZXhwbGFuYXRpb24nO1xuXG4gICAgLy8g5Yib5bu655So56We5bu66K6uXG4gICAgY29uc3QgeW9uZ1NoZW5UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgeW9uZ1NoZW5UaXRsZS50ZXh0Q29udGVudCA9ICfnlKjnpZ7lu7rorq4nO1xuICAgIHlvbmdTaGVuVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCB5b25nU2hlblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsZXQgeW9uZ1NoZW5TdWdnZXN0aW9uID0gJyc7XG5cbiAgICBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+aegeaXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+aXuicpIHtcbiAgICAgIHlvbmdTaGVuU3VnZ2VzdGlvbiA9ICfml6XkuLvml7rnm5vvvIzlrpzlj5blrpjmnYDjgIHotKLmmJ/jgIHpo5/kvKTkuLrnlKjnpZ7vvIzku6Xms4Tnp4Dml6XkuLvkuYvmsJTjgILlv4znlKjljbDmmJ/jgIHmr5TliqvvvIzku6XlhY3ml6XkuLvmm7TliqDml7rnm5vjgIInO1xuICAgIH0gZWxzZSBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+W8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aegeW8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+W8sScpIHtcbiAgICAgIHlvbmdTaGVuU3VnZ2VzdGlvbiA9ICfml6XkuLvoobDlvLHvvIzlrpzlj5bljbDmmJ/jgIHmr5TliqvkuLrnlKjnpZ7vvIzku6XnlJ/mibbml6XkuLvkuYvmsJTjgILlv4znlKjlrpjmnYDjgIHotKLmmJ/vvIzku6XlhY3ml6XkuLvmm7TliqDoobDlvLHjgIInO1xuICAgIH0gZWxzZSB7XG4gICAgICB5b25nU2hlblN1Z2dlc3Rpb24gPSAn5pel5Li75bmz6KGh77yM6ZyA5qC55o2u5YWr5a2X54m554K56YCJ5oup55So56We44CC5Y+v5Y+C6ICD5pyI5Luk5b2T5Luk55qE5LqU6KGM5oiW5YWr5a2X5Lit5pyA5pyJ5Yqb55qE5LqU6KGM5L2c5Li655So56We44CCJztcbiAgICB9XG5cbiAgICB5b25nU2hlblRleHQudGV4dENvbnRlbnQgPSB5b25nU2hlblN1Z2dlc3Rpb247XG4gICAgeW9uZ1NoZW5UZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXlvbmdzaGVuLWV4cGxhbmF0aW9uJztcblxuICAgIC8vIOWIm+W7uuagvOWxgOW7uuiurlxuICAgIGNvbnN0IGdlSnVUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZ2VKdVRpdGxlLnRleHRDb250ZW50ID0gJ+agvOWxgOW7uuiuric7XG4gICAgZ2VKdVRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuXG4gICAgY29uc3QgZ2VKdVRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsZXQgZ2VKdVN1Z2dlc3Rpb24gPSAnJztcblxuICAgIGlmIChyaVpodVN0cmVuZ3RoID09PSAn5p6B5pe6JyB8fCByaVpodVN0cmVuZ3RoID09PSAn5pe6JyB8fCByaVpodVN0cmVuZ3RoID09PSAn5YGP5pe6Jykge1xuICAgICAgZ2VKdVN1Z2dlc3Rpb24gPSAn5pel5Li75pe655ub77yM6YCC5ZCI5b2i5oiQ5LiD5p2A5qC844CB5q2j5a6Y5qC844CB5q2j6LSi5qC844CB5YGP6LSi5qC844CB6aOf56We5qC844CB5Lyk5a6Y5qC8562J5rOE56eA5pel5Li75LmL5qC85bGA44CCJztcbiAgICB9IGVsc2UgaWYgKHJpWmh1U3RyZW5ndGggPT09ICflvLEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICfmnoHlvLEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/lvLEnKSB7XG4gICAgICBnZUp1U3VnZ2VzdGlvbiA9ICfml6XkuLvoobDlvLHvvIzpgILlkIjlvaLmiJDmraPljbDmoLzjgIHlgY/ljbDmoLzjgIHmr5TogqnmoLzjgIHliqvotKLmoLznrYnnlJ/mibbml6XkuLvkuYvmoLzlsYDjgIInO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZUp1U3VnZ2VzdGlvbiA9ICfml6XkuLvlubPooaHvvIzlj6/moLnmja7lhavlrZfnibnngrnlvaLmiJDpgILlkIjnmoTmoLzlsYDjgILpnIDnu7zlkIjogIPomZHmnIjku6TjgIHlpKfov5DjgIHmtYHlubTnrYnlm6DntKDjgIInO1xuICAgIH1cblxuICAgIGdlSnVUZXh0LnRleHRDb250ZW50ID0gZ2VKdVN1Z2dlc3Rpb247XG4gICAgZ2VKdVRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZ2VqdS1zdWdnZXN0aW9uJztcblxuICAgIC8vIOWIm+W7uuWFs+mXreaMiemSrlxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAn5YWz6ZetJztcbiAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jbG9zZSc7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIOe7hOijheW8ueeql+WGheWuuVxuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHR5cGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChleHBsYW5hdGlvblRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoZXhwbGFuYXRpb25UZXh0KTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoeW9uZ1NoZW5UaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHlvbmdTaGVuVGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGdlSnVUaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGdlSnVUZXh0KTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuXG4gICAgLy8g5re75Yqg5by556qX5YaF5a655Yiw5by556qXXG4gICAgbW9kYWwuYXBwZW5kQ2hpbGQobW9kYWxDb250ZW50KTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WIsOmhtemdolxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuXG4gICAgLy8g5re75Yqg54K55Ye75LqL5Lu277yM54K55Ye75by556qX5aSW6YOo5YWz6Zet5by556qXXG4gICAgbW9kYWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0ID09PSBtb2RhbCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmmL7npLrmoLzlsYDor6bnu4bop6Pph4pcbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqL1xuICBwcml2YXRlIHNob3dHZUp1RXhwbGFuYXRpb24oZ2VKdTogc3RyaW5nKSB7XG4gICAgLy8g6I635Y+W5qC85bGA6K+m57uG5L+h5oGvXG4gICAgY29uc3QgZ2VKdUluZm8gPSBHZUp1U2VydmljZS5nZXRHZUp1RXhwbGFuYXRpb24oZ2VKdSk7XG5cbiAgICAvLyDliJvlu7rlvLnnqpdcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsJztcblxuICAgIC8vIOWIm+W7uuW8ueeql+WGheWuuVxuICAgIGNvbnN0IG1vZGFsQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsQ29udGVudC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jb250ZW50JztcblxuICAgIC8vIOWIm+W7uuagh+mimFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IGdlSnVJbmZvLm5hbWU7XG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdGl0bGUnO1xuXG4gICAgLy8g5Yib5bu657G75Z6LXG4gICAgY29uc3QgdHlwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxldCB0eXBlVGV4dCA9ICcnO1xuICAgIHN3aXRjaCAoZ2VKdUluZm8udHlwZSkge1xuICAgICAgY2FzZSAnZ29vZCc6XG4gICAgICAgIHR5cGVUZXh0ID0gJ+WQieagvCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmFkJzpcbiAgICAgICAgdHlwZVRleHQgPSAn5Ye25qC8JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICAgIHR5cGVUZXh0ID0gJ+WQieWHtuWPguWNiic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdHlwZVRleHQgPSAn5Lit5oCnJztcbiAgICB9XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IGDnsbvlnos6ICR7dHlwZVRleHR9YDtcbiAgICB0eXBlLmNsYXNzTmFtZSA9IGBiYXppLW1vZGFsLXR5cGUgYmF6aS1tb2RhbC10eXBlLSR7Z2VKdUluZm8udHlwZX1gO1xuXG4gICAgLy8g5Yib5bu66Kej6YeKXG4gICAgY29uc3QgZXhwbGFuYXRpb25UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZXhwbGFuYXRpb25UaXRsZS50ZXh0Q29udGVudCA9ICfmoLzlsYDop6Pph4onO1xuICAgIGV4cGxhbmF0aW9uVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCBleHBsYW5hdGlvblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBleHBsYW5hdGlvblRleHQudGV4dENvbnRlbnQgPSBnZUp1SW5mby5leHBsYW5hdGlvbjtcbiAgICBleHBsYW5hdGlvblRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZXhwbGFuYXRpb24nO1xuXG4gICAgLy8g5Yib5bu65b2x5ZONXG4gICAgY29uc3QgaW5mbHVlbmNlVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgIGluZmx1ZW5jZVRpdGxlLnRleHRDb250ZW50ID0gJ+aAp+agvOW9seWTjSc7XG4gICAgaW5mbHVlbmNlVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCBpbmZsdWVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbmZsdWVuY2UudGV4dENvbnRlbnQgPSBnZUp1SW5mby5pbmZsdWVuY2U7XG4gICAgaW5mbHVlbmNlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWluZmx1ZW5jZSc7XG5cbiAgICAvLyDliJvlu7rogYzkuJrlu7rorq5cbiAgICBjb25zdCBjYXJlZXJUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgY2FyZWVyVGl0bGUudGV4dENvbnRlbnQgPSAn6IGM5Lia5bu66K6uJztcbiAgICBjYXJlZXJUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IGNhcmVlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhcmVlci50ZXh0Q29udGVudCA9IGdlSnVJbmZvLmNhcmVlcjtcbiAgICBjYXJlZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2FyZWVyJztcblxuICAgIC8vIOWIm+W7uuWBpeW6t+W7uuiurlxuICAgIGNvbnN0IGhlYWx0aFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICBoZWFsdGhUaXRsZS50ZXh0Q29udGVudCA9ICflgaXlurflu7rorq4nO1xuICAgIGhlYWx0aFRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuXG4gICAgY29uc3QgaGVhbHRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaGVhbHRoLnRleHRDb250ZW50ID0gZ2VKdUluZm8uaGVhbHRoO1xuICAgIGhlYWx0aC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1oZWFsdGgnO1xuXG4gICAgLy8g5Yib5bu65Lq66ZmF5YWz57O75bu66K6uXG4gICAgY29uc3QgcmVsYXRpb25zaGlwVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgIHJlbGF0aW9uc2hpcFRpdGxlLnRleHRDb250ZW50ID0gJ+S6uumZheWFs+ezuyc7XG4gICAgcmVsYXRpb25zaGlwVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCByZWxhdGlvbnNoaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZWxhdGlvbnNoaXAudGV4dENvbnRlbnQgPSBnZUp1SW5mby5yZWxhdGlvbnNoaXA7XG4gICAgcmVsYXRpb25zaGlwLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXJlbGF0aW9uc2hpcCc7XG5cbiAgICAvLyDliJvlu7rotKLov5Dlu7rorq5cbiAgICBjb25zdCB3ZWFsdGhUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgd2VhbHRoVGl0bGUudGV4dENvbnRlbnQgPSAn6LSi6L+Q5bu66K6uJztcbiAgICB3ZWFsdGhUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IHdlYWx0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHdlYWx0aC50ZXh0Q29udGVudCA9IGdlSnVJbmZvLndlYWx0aDtcbiAgICB3ZWFsdGguY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtd2VhbHRoJztcblxuICAgIC8vIOWIm+W7uuadpea6kFxuICAgIGNvbnN0IHNvdXJjZVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICBzb3VyY2VUaXRsZS50ZXh0Q29udGVudCA9ICfnkIborrrmnaXmupAnO1xuICAgIHNvdXJjZVRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuXG4gICAgY29uc3Qgc291cmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc291cmNlLnRleHRDb250ZW50ID0gZ2VKdUluZm8uc291cmNlIHx8ICfkvKDnu5/lkb3nkIblraYnO1xuICAgIHNvdXJjZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zb3VyY2UnO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgLy8g57uE6KOF5by556qX5YaF5a65XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChleHBsYW5hdGlvblRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChpbmZsdWVuY2VUaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGluZmx1ZW5jZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNhcmVlclRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoY2FyZWVyKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhbHRoVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChoZWFsdGgpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChyZWxhdGlvbnNoaXBUaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHJlbGF0aW9uc2hpcCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHdlYWx0aFRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQod2VhbHRoKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoc291cmNlVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDmt7vliqDlvLnnqpflhoXlrrnliLDlvLnnqpdcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuXG4gICAgLy8g5re75Yqg5by556qX5Yiw6aG16Z2iXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDmt7vliqDngrnlh7vkuovku7bvvIzngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuagvOWxgOWIhuaekFxuICAgKiBAcGFyYW0gZ2VKdSDmoLzlsYDlkI3np7BcbiAgICogQHBhcmFtIHJpWmh1U3RyZW5ndGgg5pel5Li75pe66KGwXG4gICAqL1xuICBwcml2YXRlIHNob3dHZUp1QW5hbHlzaXMoZ2VKdTogc3RyaW5nLCByaVpodVN0cmVuZ3RoOiBzdHJpbmcpIHtcbiAgICAvLyDojrflj5bmoLzlsYDliIbmnpBcbiAgICBjb25zdCBhbmFseXNpcyA9IEdlSnVTZXJ2aWNlLmFuYWx5emVHZUp1KGdlSnUsIHJpWmh1U3RyZW5ndGgpO1xuXG4gICAgLy8g5Yib5bu65by556qXXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbCc7XG5cbiAgICAvLyDliJvlu7rlvLnnqpflhoXlrrlcbiAgICBjb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbENvbnRlbnQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY29udGVudCc7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBgJHtnZUp1feWIhuaekGA7XG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdGl0bGUnO1xuXG4gICAgLy8g5Yib5bu657G75Z6LXG4gICAgY29uc3QgdHlwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxldCB0eXBlVGV4dCA9ICcnO1xuICAgIHN3aXRjaCAoYW5hbHlzaXMubGV2ZWwpIHtcbiAgICAgIGNhc2UgJ2dvb2QnOlxuICAgICAgICB0eXBlVGV4dCA9ICflkIknO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JhZCc6XG4gICAgICAgIHR5cGVUZXh0ID0gJ+WHtic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgICB0eXBlVGV4dCA9ICflkInlh7blj4LljYonO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHR5cGVUZXh0ID0gJ+S4reaApyc7XG4gICAgfVxuICAgIHR5cGUudGV4dENvbnRlbnQgPSBg57u85ZCI6K+E5Lu3OiAke3R5cGVUZXh0fWA7XG4gICAgdHlwZS5jbGFzc05hbWUgPSBgYmF6aS1tb2RhbC10eXBlIGJhemktbW9kYWwtdHlwZS0ke2FuYWx5c2lzLmxldmVsfWA7XG5cbiAgICAvLyDliJvlu7rliIbmnpBcbiAgICBjb25zdCBhbmFseXNpc1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICBhbmFseXNpc1RpdGxlLnRleHRDb250ZW50ID0gJ+agvOWxgOWIhuaekCc7XG4gICAgYW5hbHlzaXNUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IGFuYWx5c2lzVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFuYWx5c2lzVGV4dC50ZXh0Q29udGVudCA9IGFuYWx5c2lzLmFuYWx5c2lzO1xuICAgIGFuYWx5c2lzVGV4dC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1hbmFseXNpcyc7XG5cbiAgICAvLyDliJvlu7rlu7rorq5cbiAgICBjb25zdCBzdWdnZXN0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgIHN1Z2dlc3Rpb25UaXRsZS50ZXh0Q29udGVudCA9ICflj5HlsZXlu7rorq4nO1xuICAgIHN1Z2dlc3Rpb25UaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzdWdnZXN0aW9uLnRleHRDb250ZW50ID0gYW5hbHlzaXMuc3VnZ2VzdGlvbjtcbiAgICBzdWdnZXN0aW9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXN1Z2dlc3Rpb24nO1xuXG4gICAgLy8g5Yib5bu65pel5Li75pe66KGw5L+h5oGvXG4gICAgY29uc3QgcmlaaHVUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgcmlaaHVUaXRsZS50ZXh0Q29udGVudCA9ICfml6XkuLvml7roobAnO1xuICAgIHJpWmh1VGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCByaVpodVRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByaVpodVRleHQudGV4dENvbnRlbnQgPSBg5pel5Li7JHtyaVpodVN0cmVuZ3RofWA7XG4gICAgcmlaaHVUZXh0LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXJpemh1JztcblxuICAgIC8vIOWIm+W7uui2i+WKv+WIhuaekOaMiemSrlxuICAgIGNvbnN0IHRyZW5kQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgdHJlbmRCdXR0b24udGV4dENvbnRlbnQgPSAn5p+l55yL5qC85bGA6LaL5Yq/JztcbiAgICB0cmVuZEJ1dHRvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC10cmVuZC1idXR0b24nO1xuICAgIHRyZW5kQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgLy8g5YWz6Zet5b2T5YmN5by556qXXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcblxuICAgICAgLy8g5pi+56S65qC85bGA6LaL5Yq/5YiG5p6QXG4gICAgICB0aGlzLnNob3dHZUp1VHJlbmRBbmFseXNpcyhnZUp1LCB0aGlzLmJhemlJbmZvLmRheVd1WGluZyB8fCAnJyk7XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rlhbPpl63mjInpkq5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ+WFs+mXrSc7XG4gICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2xvc2UnO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rmjInpkq7lrrnlmahcbiAgICBjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBidXR0b25Db250YWluZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtYnV0dG9uLWNvbnRhaW5lcic7XG4gICAgYnV0dG9uQ29udGFpbmVyLmFwcGVuZENoaWxkKHRyZW5kQnV0dG9uKTtcbiAgICBidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xuXG4gICAgLy8g57uE6KOF5by556qX5YaF5a65XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQodHlwZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGFuYWx5c2lzVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChhbmFseXNpc1RleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChzdWdnZXN0aW9uVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChzdWdnZXN0aW9uKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQocmlaaHVUaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHJpWmh1VGV4dCk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG5cbiAgICAvLyDmt7vliqDlvLnnqpflhoXlrrnliLDlvLnnqpdcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuXG4gICAgLy8g5re75Yqg5by556qX5Yiw6aG16Z2iXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDmt7vliqDngrnlh7vkuovku7bvvIzngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYvuekuuagvOWxgOW9ouaIkOWboOe0oFxuICAgKi9cbiAgcHJpdmF0ZSBzaG93R2VKdUZhY3RvcnMoKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmdlSnVGYWN0b3JzIHx8IHRoaXMuYmF6aUluZm8uZ2VKdUZhY3RvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmsqHmnInmoLzlsYDlvaLmiJDlm6DntKDkv6Hmga8nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rlvLnnqpdcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsJztcblxuICAgIC8vIOWIm+W7uuW8ueeql+WGheWuuVxuICAgIGNvbnN0IG1vZGFsQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsQ29udGVudC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jb250ZW50JztcblxuICAgIC8vIOWIm+W7uuagh+mimFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IGAke3RoaXMuYmF6aUluZm8uZ2VKdX3lvaLmiJDlm6DntKBgO1xuICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXRpdGxlJztcblxuICAgIC8vIOWIm+W7uuagvOWxgOW8uuW6puS/oeaBr1xuICAgIGlmICh0aGlzLmJhemlJbmZvLmdlSnVTdHJlbmd0aCkge1xuICAgICAgY29uc3Qgc3RyZW5ndGhWYWx1ZSA9IHR5cGVvZiB0aGlzLmJhemlJbmZvLmdlSnVTdHJlbmd0aCA9PT0gJ251bWJlcidcbiAgICAgICAgPyB0aGlzLmJhemlJbmZvLmdlSnVTdHJlbmd0aFxuICAgICAgICA6IHBhcnNlSW50KHRoaXMuYmF6aUluZm8uZ2VKdVN0cmVuZ3RoKTtcblxuICAgICAgaWYgKCFpc05hTihzdHJlbmd0aFZhbHVlKSkge1xuICAgICAgICBjb25zdCBzdHJlbmd0aEluZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3RyZW5ndGhJbmZvLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXN0cmVuZ3RoLWluZm8nO1xuXG4gICAgICAgIGNvbnN0IHN0cmVuZ3RoVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgc3RyZW5ndGhUZXh0LnRleHRDb250ZW50ID0gYOagvOWxgOW8uuW6pjogJHtzdHJlbmd0aFZhbHVlfSVgO1xuICAgICAgICBzdHJlbmd0aFRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc3RyZW5ndGgtdGV4dCc7XG5cbiAgICAgICAgLy8g5Yib5bu66L+b5bqm5p2hXG4gICAgICAgIGNvbnN0IHByb2dyZXNzQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHByb2dyZXNzQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXByb2dyZXNzLWNvbnRhaW5lcic7XG5cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJvZ3Jlc3NCYXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtcHJvZ3Jlc3MtYmFyJztcbiAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtzdHJlbmd0aFZhbHVlfSVgO1xuXG4gICAgICAgIC8vIOagueaNruW8uuW6puWAvOiuvue9ruminOiJslxuICAgICAgICBpZiAoc3RyZW5ndGhWYWx1ZSA+PSA4MCkge1xuICAgICAgICAgIHByb2dyZXNzQmFyLmNsYXNzTGlzdC5hZGQoJ2JhemktcHJvZ3Jlc3MtaGlnaCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVuZ3RoVmFsdWUgPj0gNjApIHtcbiAgICAgICAgICBwcm9ncmVzc0Jhci5jbGFzc0xpc3QuYWRkKCdiYXppLXByb2dyZXNzLW1lZGl1bScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2dyZXNzQmFyLmNsYXNzTGlzdC5hZGQoJ2JhemktcHJvZ3Jlc3MtbG93Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9ncmVzc0NvbnRhaW5lci5hcHBlbmRDaGlsZChwcm9ncmVzc0Jhcik7XG4gICAgICAgIHN0cmVuZ3RoSW5mby5hcHBlbmRDaGlsZChzdHJlbmd0aFRleHQpO1xuICAgICAgICBzdHJlbmd0aEluZm8uYXBwZW5kQ2hpbGQocHJvZ3Jlc3NDb250YWluZXIpO1xuXG4gICAgICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChzdHJlbmd0aEluZm8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWIm+W7uuWboOe0oOWIl+ihqFxuICAgIGNvbnN0IGZhY3RvcnNUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZmFjdG9yc1RpdGxlLnRleHRDb250ZW50ID0gJ+W9ouaIkOWboOe0oCc7XG4gICAgZmFjdG9yc1RpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChmYWN0b3JzVGl0bGUpO1xuXG4gICAgY29uc3QgZmFjdG9yc0xpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmYWN0b3JzTGlzdC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1mYWN0b3JzLWxpc3QnO1xuXG4gICAgLy8g5oyJ6LSh54yu5bqm5o6S5bqPXG4gICAgY29uc3Qgc29ydGVkRmFjdG9ycyA9IFsuLi50aGlzLmJhemlJbmZvLmdlSnVGYWN0b3JzXS5zb3J0KChhLCBiKSA9PiBiLmNvbnRyaWJ1dGlvbiAtIGEuY29udHJpYnV0aW9uKTtcblxuICAgIHNvcnRlZEZhY3RvcnMuZm9yRWFjaChmYWN0b3IgPT4ge1xuICAgICAgY29uc3QgZmFjdG9ySXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZmFjdG9ySXRlbS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1mYWN0b3ItaXRlbSc7XG5cbiAgICAgIC8vIOWIm+W7uuWboOe0oOagh+mimFxuICAgICAgY29uc3QgZmFjdG9ySGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBmYWN0b3JIZWFkZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZmFjdG9yLWhlYWRlcic7XG5cbiAgICAgIGNvbnN0IGZhY3Rvck5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICBmYWN0b3JOYW1lLnRleHRDb250ZW50ID0gZmFjdG9yLmZhY3RvcjtcbiAgICAgIGZhY3Rvck5hbWUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZmFjdG9yLW5hbWUnO1xuXG4gICAgICBjb25zdCBmYWN0b3JDb250cmlidXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICBmYWN0b3JDb250cmlidXRpb24udGV4dENvbnRlbnQgPSBgJHtmYWN0b3IuY29udHJpYnV0aW9ufSVgO1xuICAgICAgZmFjdG9yQ29udHJpYnV0aW9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWZhY3Rvci1jb250cmlidXRpb24nO1xuXG4gICAgICBmYWN0b3JIZWFkZXIuYXBwZW5kQ2hpbGQoZmFjdG9yTmFtZSk7XG4gICAgICBmYWN0b3JIZWFkZXIuYXBwZW5kQ2hpbGQoZmFjdG9yQ29udHJpYnV0aW9uKTtcblxuICAgICAgLy8g5Yib5bu65Zug57Sg5o+P6L+wXG4gICAgICBjb25zdCBmYWN0b3JEZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZmFjdG9yRGVzY3JpcHRpb24udGV4dENvbnRlbnQgPSBmYWN0b3IuZGVzY3JpcHRpb247XG4gICAgICBmYWN0b3JEZXNjcmlwdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1mYWN0b3ItZGVzY3JpcHRpb24nO1xuXG4gICAgICAvLyDliJvlu7rlm6DntKDov5vluqbmnaFcbiAgICAgIGNvbnN0IGZhY3RvclByb2dyZXNzQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBmYWN0b3JQcm9ncmVzc0NvbnRhaW5lci5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1mYWN0b3ItcHJvZ3Jlc3MtY29udGFpbmVyJztcblxuICAgICAgY29uc3QgZmFjdG9yUHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGZhY3RvclByb2dyZXNzQmFyLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWZhY3Rvci1wcm9ncmVzcy1iYXInO1xuICAgICAgZmFjdG9yUHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtmYWN0b3IuY29udHJpYnV0aW9uICogMn0lYDsgLy8g5LmY5LulMuS9v+i/m+W6puadoeabtOaYjuaYvlxuXG4gICAgICBmYWN0b3JQcm9ncmVzc0NvbnRhaW5lci5hcHBlbmRDaGlsZChmYWN0b3JQcm9ncmVzc0Jhcik7XG5cbiAgICAgIC8vIOe7hOijheWboOe0oOmhuVxuICAgICAgZmFjdG9ySXRlbS5hcHBlbmRDaGlsZChmYWN0b3JIZWFkZXIpO1xuICAgICAgZmFjdG9ySXRlbS5hcHBlbmRDaGlsZChmYWN0b3JEZXNjcmlwdGlvbik7XG4gICAgICBmYWN0b3JJdGVtLmFwcGVuZENoaWxkKGZhY3RvclByb2dyZXNzQ29udGFpbmVyKTtcblxuICAgICAgZmFjdG9yc0xpc3QuYXBwZW5kQ2hpbGQoZmFjdG9ySXRlbSk7XG4gICAgfSk7XG5cbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoZmFjdG9yc0xpc3QpO1xuXG4gICAgLy8g5Yib5bu65YWz6Zet5oyJ6ZKuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICflhbPpl60nO1xuICAgIGNsb3NlQnV0dG9uLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNsb3NlJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgIH0pO1xuXG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WGheWuueWIsOW8ueeql1xuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG5cbiAgICAvLyDmt7vliqDlvLnnqpfliLDpobXpnaJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcblxuICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tu+8jOeCueWHu+W8ueeql+WklumDqOWFs+mXreW8ueeql1xuICAgIG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gbW9kYWwpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChtb2RhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5pi+56S65qC85bGA6LaL5Yq/5YiG5p6QXG4gICAqIEBwYXJhbSBnZUp1IOagvOWxgOWQjeensFxuICAgKiBAcGFyYW0gcmlaaHVXdVhpbmcg5pel5Li75LqU6KGMXG4gICAqL1xuICBwcml2YXRlIHNob3dHZUp1VHJlbmRBbmFseXNpcyhnZUp1OiBzdHJpbmcsIHJpWmh1V3VYaW5nOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuYmF6aUluZm8uYmlydGhZZWFyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfnvLrlsJHlh7rnlJ/lubTku73kv6Hmga/vvIzml6Dms5XliIbmnpDmoLzlsYDotovlir8nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyDliJvlu7rlvLnnqpdcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsIGJhemktbW9kYWwtbGFyZ2UnO1xuXG4gICAgLy8g5Yib5bu65by556qX5YaF5a65XG4gICAgY29uc3QgbW9kYWxDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbW9kYWxDb250ZW50LmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWNvbnRlbnQnO1xuXG4gICAgLy8g5Yib5bu65qCH6aKYXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gYCR7Z2VKdX3otovlir/liIbmnpBgO1xuICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXRpdGxlJztcblxuICAgIC8vIOWIm+W7uuivtOaYjlxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGVzY3JpcHRpb24udGV4dENvbnRlbnQgPSBg5Lul5LiL5pivJHtnZUp1feWcqOacquadpTIw5bm055qE5Y+R5bGV6LaL5Yq/5YiG5p6Q77yM5YyF5ous5aSn6L+Q5ZKM5rWB5bm05a+55qC85bGA55qE5b2x5ZON44CCYDtcbiAgICBkZXNjcmlwdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1kZXNjcmlwdGlvbic7XG5cbiAgICAvLyDliJvlu7rlpKfov5Dkv6Hmga9cbiAgICBjb25zdCBkYVl1blRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICBkYVl1blRpdGxlLnRleHRDb250ZW50ID0gJ+Wkp+i/kOS/oeaBryc7XG4gICAgZGFZdW5UaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIC8vIOiOt+WPluWkp+i/kOS/oeaBr1xuICAgIGNvbnN0IGRhWXVuTGlzdCA9IHRoaXMuZ2V0RGFZdW5MaXN0KCk7XG5cbiAgICBjb25zdCBkYVl1bkluZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkYVl1bkluZm8uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZGF5dW4taW5mbyc7XG5cbiAgICBpZiAoZGFZdW5MaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRhWXVuVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgICAgZGFZdW5UYWJsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1kYXl1bi10YWJsZSc7XG5cbiAgICAgIC8vIOWIm+W7uuihqOWktFxuICAgICAgY29uc3QgdGhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aGVhZCcpO1xuICAgICAgY29uc3QgaGVhZGVyUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IFsn5aSn6L+QJywgJ+W8gOWni+W5tOS7vScsICfnu5PmnZ/lubTku70nLCAn5a+55qC85bGA5b2x5ZONJ107XG4gICAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHtcbiAgICAgICAgY29uc3QgdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgICAgICB0aC50ZXh0Q29udGVudCA9IGhlYWRlcjtcbiAgICAgICAgaGVhZGVyUm93LmFwcGVuZENoaWxkKHRoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGVhZC5hcHBlbmRDaGlsZChoZWFkZXJSb3cpO1xuICAgICAgZGFZdW5UYWJsZS5hcHBlbmRDaGlsZCh0aGVhZCk7XG5cbiAgICAgIC8vIOWIm+W7uuihqOS9k1xuICAgICAgY29uc3QgdGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0Ym9keScpO1xuXG4gICAgICBkYVl1bkxpc3QuZm9yRWFjaChkYVl1biA9PiB7XG4gICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgICAgICAgLy8g5aSn6L+Q5bmy5pSvXG4gICAgICAgIGNvbnN0IGdhblpoaUNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBnYW5aaGlDZWxsLnRleHRDb250ZW50ID0gZGFZdW4uZ2FuWmhpO1xuICAgICAgICByb3cuYXBwZW5kQ2hpbGQoZ2FuWmhpQ2VsbCk7XG5cbiAgICAgICAgLy8g5byA5aeL5bm05Lu9XG4gICAgICAgIGNvbnN0IHN0YXJ0WWVhckNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBzdGFydFllYXJDZWxsLnRleHRDb250ZW50ID0gZGFZdW4uc3RhcnRZZWFyLnRvU3RyaW5nKCk7XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChzdGFydFllYXJDZWxsKTtcblxuICAgICAgICAvLyDnu5PmnZ/lubTku71cbiAgICAgICAgY29uc3QgZW5kWWVhckNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBlbmRZZWFyQ2VsbC50ZXh0Q29udGVudCA9IGRhWXVuLmVuZFllYXIudG9TdHJpbmcoKTtcbiAgICAgICAgcm93LmFwcGVuZENoaWxkKGVuZFllYXJDZWxsKTtcblxuICAgICAgICAvLyDlr7nmoLzlsYDlvbHlk41cbiAgICAgICAgY29uc3QgZWZmZWN0Q2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGNvbnN0IGVmZmVjdCA9IEdlSnVTZXJ2aWNlLmFuYWx5emVEYVl1bkVmZmVjdChnZUp1LCBkYVl1bi5nYW5aaGksIHJpWmh1V3VYaW5nKTtcblxuICAgICAgICAvLyDmoLnmja7lvbHlk43nuqfliKvorr7nva7popzoibJcbiAgICAgICAgbGV0IGVmZmVjdENsYXNzID0gJyc7XG4gICAgICAgIHN3aXRjaCAoZWZmZWN0LmxldmVsKSB7XG4gICAgICAgICAgY2FzZSAnZ29vZCc6XG4gICAgICAgICAgICBlZmZlY3RDbGFzcyA9ICdiYXppLWVmZmVjdC1nb29kJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2JhZCc6XG4gICAgICAgICAgICBlZmZlY3RDbGFzcyA9ICdiYXppLWVmZmVjdC1iYWQnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgICAgICAgZWZmZWN0Q2xhc3MgPSAnYmF6aS1lZmZlY3QtbWl4ZWQnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGVmZmVjdENsYXNzID0gJ2JhemktZWZmZWN0LW5ldXRyYWwnO1xuICAgICAgICB9XG5cbiAgICAgICAgZWZmZWN0Q2VsbC50ZXh0Q29udGVudCA9IGVmZmVjdC5lZmZlY3Q7XG4gICAgICAgIGVmZmVjdENlbGwuY2xhc3NOYW1lID0gZWZmZWN0Q2xhc3M7XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChlZmZlY3RDZWxsKTtcblxuICAgICAgICB0Ym9keS5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgfSk7XG5cbiAgICAgIGRhWXVuVGFibGUuYXBwZW5kQ2hpbGQodGJvZHkpO1xuICAgICAgZGFZdW5JbmZvLmFwcGVuZENoaWxkKGRhWXVuVGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYVl1bkluZm8udGV4dENvbnRlbnQgPSAn5peg5rOV6I635Y+W5aSn6L+Q5L+h5oGv77yM6K+356Gu5L+d5YWr5a2X5L+h5oGv5a6M5pW044CCJztcbiAgICB9XG5cbiAgICAvLyDliJvlu7rotovlir/lm77lrrnlmahcbiAgICBjb25zdCBjaGFydFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICBjaGFydFRpdGxlLnRleHRDb250ZW50ID0gJ+agvOWxgOi2i+WKv+Wbvic7XG4gICAgY2hhcnRUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IGNoYXJ0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2hhcnRDb250YWluZXIuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtY2hhcnQtY29udGFpbmVyJztcbiAgICBjaGFydENvbnRhaW5lci5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBjaGFydENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuICAgIGNoYXJ0Q29udGFpbmVyLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcyMHB4JztcblxuICAgIC8vIOWIm+W7uui2i+WKv+WIhuaekFxuICAgIGNvbnN0IHRyZW5kQW5hbHlzaXNUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgdHJlbmRBbmFseXNpc1RpdGxlLnRleHRDb250ZW50ID0gJ+i2i+WKv+WIhuaekCc7XG4gICAgdHJlbmRBbmFseXNpc1RpdGxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLXNlY3Rpb24tdGl0bGUnO1xuXG4gICAgY29uc3QgdHJlbmRBbmFseXNpcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRyZW5kQW5hbHlzaXMuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdHJlbmQtYW5hbHlzaXMnO1xuXG4gICAgLy8g6I635Y+W6LaL5Yq/5pWw5o2uXG4gICAgY29uc3QgdHJlbmREYXRhID0gR2VKdVRyZW5kU2VydmljZS5nZW5lcmF0ZVRyZW5kRGF0YShcbiAgICAgIGdlSnUsXG4gICAgICByaVpodVd1WGluZyxcbiAgICAgIHBhcnNlSW50KHRoaXMuYmF6aUluZm8uYmlydGhZZWFyKSxcbiAgICAgIGRhWXVuTGlzdFxuICAgICk7XG5cbiAgICAvLyDorr7nva7otovlir/liIbmnpDlhoXlrrlcbiAgICB0cmVuZEFuYWx5c2lzLnRleHRDb250ZW50ID0gdHJlbmREYXRhLmFuYWx5c2lzO1xuXG4gICAgLy8g5Yib5bu65YWz6ZSu5bm05Lu95L+h5oGvXG4gICAgY29uc3Qga2V5WWVhcnNUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAga2V5WWVhcnNUaXRsZS50ZXh0Q29udGVudCA9ICflhbPplK7lubTku70nO1xuICAgIGtleVllYXJzVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCBrZXlZZWFyc0luZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBrZXlZZWFyc0luZm8uY2xhc3NOYW1lID0gJ2JhemktbW9kYWwta2V5LXllYXJzJztcblxuICAgIGlmICh0cmVuZERhdGEua2V5WWVhcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qga2V5WWVhcnNUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgICBrZXlZZWFyc1RhYmxlLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsLWtleS15ZWFycy10YWJsZSc7XG5cbiAgICAgIC8vIOWIm+W7uuihqOWktFxuICAgICAgY29uc3QgdGhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aGVhZCcpO1xuICAgICAgY29uc3QgaGVhZGVyUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgY29uc3QgaGVhZGVycyA9IFsn5bm05Lu9JywgJ+S6i+S7ticsICflvbHlk40nXTtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4ge1xuICAgICAgICBjb25zdCB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgICAgIHRoLnRleHRDb250ZW50ID0gaGVhZGVyO1xuICAgICAgICBoZWFkZXJSb3cuYXBwZW5kQ2hpbGQodGgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoZWFkLmFwcGVuZENoaWxkKGhlYWRlclJvdyk7XG4gICAgICBrZXlZZWFyc1RhYmxlLmFwcGVuZENoaWxkKHRoZWFkKTtcblxuICAgICAgLy8g5Yib5bu66KGo5L2TXG4gICAgICBjb25zdCB0Ym9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Rib2R5Jyk7XG5cbiAgICAgIHRyZW5kRGF0YS5rZXlZZWFycy5mb3JFYWNoKGtleVllYXIgPT4ge1xuICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgICAgIC8vIOW5tOS7vVxuICAgICAgICBjb25zdCB5ZWFyQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIHllYXJDZWxsLnRleHRDb250ZW50ID0ga2V5WWVhci55ZWFyLnRvU3RyaW5nKCk7XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZCh5ZWFyQ2VsbCk7XG5cbiAgICAgICAgLy8g5LqL5Lu2XG4gICAgICAgIGNvbnN0IGV2ZW50Q2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGV2ZW50Q2VsbC50ZXh0Q29udGVudCA9IGtleVllYXIuZXZlbnQ7XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChldmVudENlbGwpO1xuXG4gICAgICAgIC8vIOW9seWTjVxuICAgICAgICBjb25zdCBsZXZlbENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuXG4gICAgICAgIC8vIOagueaNruW9seWTjee6p+WIq+iuvue9ruminOiJslxuICAgICAgICBsZXQgbGV2ZWxDbGFzcyA9ICcnO1xuICAgICAgICBsZXQgbGV2ZWxUZXh0ID0gJyc7XG4gICAgICAgIHN3aXRjaCAoa2V5WWVhci5sZXZlbCkge1xuICAgICAgICAgIGNhc2UgJ2dvb2QnOlxuICAgICAgICAgICAgbGV2ZWxDbGFzcyA9ICdiYXppLWVmZmVjdC1nb29kJztcbiAgICAgICAgICAgIGxldmVsVGV4dCA9ICflkIknO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYmFkJzpcbiAgICAgICAgICAgIGxldmVsQ2xhc3MgPSAnYmF6aS1lZmZlY3QtYmFkJztcbiAgICAgICAgICAgIGxldmVsVGV4dCA9ICflh7YnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgICAgICAgbGV2ZWxDbGFzcyA9ICdiYXppLWVmZmVjdC1taXhlZCc7XG4gICAgICAgICAgICBsZXZlbFRleHQgPSAn5ZCJ5Ye25Y+C5Y2KJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXZlbENsYXNzID0gJ2JhemktZWZmZWN0LW5ldXRyYWwnO1xuICAgICAgICAgICAgbGV2ZWxUZXh0ID0gJ+S4reaApyc7XG4gICAgICAgIH1cblxuICAgICAgICBsZXZlbENlbGwudGV4dENvbnRlbnQgPSBsZXZlbFRleHQ7XG4gICAgICAgIGxldmVsQ2VsbC5jbGFzc05hbWUgPSBsZXZlbENsYXNzO1xuICAgICAgICByb3cuYXBwZW5kQ2hpbGQobGV2ZWxDZWxsKTtcblxuICAgICAgICB0Ym9keS5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgfSk7XG5cbiAgICAgIGtleVllYXJzVGFibGUuYXBwZW5kQ2hpbGQodGJvZHkpO1xuICAgICAga2V5WWVhcnNJbmZvLmFwcGVuZENoaWxkKGtleVllYXJzVGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlZZWFyc0luZm8udGV4dENvbnRlbnQgPSAn5peg5rOV6I635Y+W5YWz6ZSu5bm05Lu95L+h5oGv44CCJztcbiAgICB9XG5cbiAgICAvLyDliJvlu7rlu7rorq5cbiAgICBjb25zdCBzdWdnZXN0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xuICAgIHN1Z2dlc3Rpb25UaXRsZS50ZXh0Q29udGVudCA9ICflj5HlsZXlu7rorq4nO1xuICAgIHN1Z2dlc3Rpb25UaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzdWdnZXN0aW9uLnRleHRDb250ZW50ID0gdHJlbmREYXRhLnN1Z2dlc3Rpb247XG4gICAgc3VnZ2VzdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zdWdnZXN0aW9uJztcblxuICAgIC8vIOWIm+W7uuWFs+mXreaMiemSrlxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAn5YWz6ZetJztcbiAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jbG9zZSc7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIOe7hOijheW8ueeql+WGheWuuVxuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoZGFZdW5UaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGRhWXVuSW5mbyk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNoYXJ0VGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjaGFydENvbnRhaW5lcik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRyZW5kQW5hbHlzaXNUaXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKHRyZW5kQW5hbHlzaXMpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChrZXlZZWFyc1RpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoa2V5WWVhcnNJbmZvKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoc3VnZ2VzdGlvblRpdGxlKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQoc3VnZ2VzdGlvbik7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgIC8vIOa3u+WKoOW8ueeql+WGheWuueWIsOW8ueeql1xuICAgIG1vZGFsLmFwcGVuZENoaWxkKG1vZGFsQ29udGVudCk7XG5cbiAgICAvLyDmt7vliqDlvLnnqpfliLDpobXpnaJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcblxuICAgIC8vIOa4suafk+i2i+WKv+WbvlxuICAgIGNvbnN0IGNoYXJ0ID0gbmV3IEdlSnVUcmVuZENoYXJ0KFxuICAgICAgY2hhcnRDb250YWluZXIsXG4gICAgICB0cmVuZERhdGEudHJlbmQsXG4gICAgICB0cmVuZERhdGEua2V5WWVhcnMsXG4gICAgICBjaGFydENvbnRhaW5lci5jbGllbnRXaWR0aCxcbiAgICAgIGNoYXJ0Q29udGFpbmVyLmNsaWVudEhlaWdodFxuICAgICk7XG4gICAgY2hhcnQucmVuZGVyKCk7XG5cbiAgICAvLyDmt7vliqDngrnlh7vkuovku7bvvIzngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWkp+i/kOWIl+ihqFxuICAgKiBAcmV0dXJucyDlpKfov5DliJfooahcbiAgICovXG4gIHByaXZhdGUgZ2V0RGFZdW5MaXN0KCk6IHsgZ2FuWmhpOiBzdHJpbmc7IHN0YXJ0WWVhcjogbnVtYmVyOyBlbmRZZWFyOiBudW1iZXIgfVtdIHtcbiAgICBpZiAoIXRoaXMuYmF6aUluZm8uZGFZdW4gfHwgIXRoaXMuYmF6aUluZm8uYmlydGhZZWFyKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgYmlydGhZZWFyID0gcGFyc2VJbnQodGhpcy5iYXppSW5mby5iaXJ0aFllYXIpO1xuICAgIGNvbnN0IGRhWXVuU3RhcnRBZ2UgPSB0aGlzLmJhemlJbmZvLmRhWXVuU3RhcnRBZ2UgfHwgMDtcbiAgICBjb25zdCBkYVl1bkxpc3Q6IHsgZ2FuWmhpOiBzdHJpbmc7IHN0YXJ0WWVhcjogbnVtYmVyOyBlbmRZZWFyOiBudW1iZXIgfVtdID0gW107XG5cbiAgICAvLyDlpITnkIblpKfov5Dkv6Hmga9cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLmRhWXVuKSkge1xuICAgICAgLy8g5aaC5p6c5pivRGFZdW5JbmZvW13nsbvlnotcbiAgICAgIHRoaXMuYmF6aUluZm8uZGFZdW4uZm9yRWFjaChkYVl1biA9PiB7XG4gICAgICAgIGRhWXVuTGlzdC5wdXNoKHtcbiAgICAgICAgICBnYW5aaGk6IGRhWXVuLmdhblpoaSxcbiAgICAgICAgICBzdGFydFllYXI6IGRhWXVuLnN0YXJ0WWVhcixcbiAgICAgICAgICBlbmRZZWFyOiBkYVl1bi5lbmRZZWFyIHx8IGRhWXVuLnN0YXJ0WWVhciArIDlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmJhemlJbmZvLmRhWXVuID09PSAnc3RyaW5nJykge1xuICAgICAgLy8g5aaC5p6c5piv5a2X56ym5Liy57G75Z6L77yI5YW85a655pen54mI5pys77yJXG4gICAgICBjb25zdCBkYVl1bkl0ZW1zID0gdGhpcy5iYXppSW5mby5kYVl1bi5zcGxpdCgnLCcpO1xuXG4gICAgICBkYVl1bkl0ZW1zLmZvckVhY2goKGl0ZW06IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFydEFnZSA9IGRhWXVuU3RhcnRBZ2UgKyBpbmRleCAqIDEwO1xuICAgICAgICBjb25zdCBlbmRBZ2UgPSBzdGFydEFnZSArIDk7XG4gICAgICAgIGNvbnN0IHN0YXJ0WWVhciA9IGJpcnRoWWVhciArIHN0YXJ0QWdlO1xuICAgICAgICBjb25zdCBlbmRZZWFyID0gYmlydGhZZWFyICsgZW5kQWdlO1xuXG4gICAgICAgIGRhWXVuTGlzdC5wdXNoKHtcbiAgICAgICAgICBnYW5aaGk6IGl0ZW0udHJpbSgpLFxuICAgICAgICAgIHN0YXJ0WWVhcixcbiAgICAgICAgICBlbmRZZWFyXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhWXVuTGlzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiDmmL7npLrnlKjnpZ7or6bnu4bop6Pph4pcbiAgICogQHBhcmFtIHlvbmdTaGVuIOeUqOelnuWQjeensFxuICAgKiBAcGFyYW0geW9uZ1NoZW5EZXRhaWwg55So56We6K+m5oOFXG4gICAqL1xuICBwcml2YXRlIHNob3dZb25nU2hlbkV4cGxhbmF0aW9uKHlvbmdTaGVuOiBzdHJpbmcsIHlvbmdTaGVuRGV0YWlsOiBzdHJpbmcpIHtcbiAgICAvLyDliJvlu7rlvLnnqpdcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsLmNsYXNzTmFtZSA9ICdiYXppLW1vZGFsJztcblxuICAgIC8vIOWIm+W7uuW8ueeql+WGheWuuVxuICAgIGNvbnN0IG1vZGFsQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1vZGFsQ29udGVudC5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jb250ZW50JztcblxuICAgIC8vIOWIm+W7uuagh+mimFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IGDnlKjnpZ7or6bop6PvvJoke3lvbmdTaGVufWA7XG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtdGl0bGUnO1xuXG4gICAgLy8g5Yib5bu66Kej6YeKXG4gICAgY29uc3QgZXhwbGFuYXRpb25UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgZXhwbGFuYXRpb25UaXRsZS50ZXh0Q29udGVudCA9ICfnlKjnpZ7or7TmmI4nO1xuICAgIGV4cGxhbmF0aW9uVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCBleHBsYW5hdGlvblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBleHBsYW5hdGlvblRleHQudGV4dENvbnRlbnQgPSB5b25nU2hlbkRldGFpbDtcbiAgICBleHBsYW5hdGlvblRleHQuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtZXhwbGFuYXRpb24nO1xuXG4gICAgLy8g5Yib5bu655So56We6Kej6YeKXG4gICAgY29uc3QgeW9uZ1NoZW5FeHBsYW5hdGlvblRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcbiAgICB5b25nU2hlbkV4cGxhbmF0aW9uVGl0bGUudGV4dENvbnRlbnQgPSAn55So56We6Kej6YeKJztcbiAgICB5b25nU2hlbkV4cGxhbmF0aW9uVGl0bGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtc2VjdGlvbi10aXRsZSc7XG5cbiAgICBjb25zdCB5b25nU2hlbkV4cGxhbmF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyDmoLnmja7nlKjnpZ7nsbvlnovmj5DkvpvkuI3lkIznmoTop6Pph4pcbiAgICBsZXQgZXhwbGFuYXRpb24gPSAnJztcbiAgICBzd2l0Y2ggKHlvbmdTaGVuKSB7XG4gICAgICBjYXNlICfljbDmmJ8nOlxuICAgICAgICBleHBsYW5hdGlvbiA9ICfljbDmmJ/kuLrnlJ/miJHkuYvnianvvIzku6PooajlrabkuJrjgIHmloflh63jgIHmr43kurLjgIHotLXkurrnrYnjgILml6XkuLvlvLHml7bvvIzljbDmmJ/lj6/ku6XnlJ/liqnml6XkuLvvvIzlop7lvLrml6XkuLvlipvph4/jgIInO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+WumOadgCc6XG4gICAgICAgIGV4cGxhbmF0aW9uID0gJ+WumOadgOS4uuWFi+aIkeS5i+eJqe+8jOS7o+ihqOadg+WogeOAgeiBjOS9jeOAgeinhOefqeetieOAguaXpeS4u+aXuuaXtu+8jOWumOadgOWPr+S7peWFi+WItuaXpeS4u++8jOazhOengOaXpeS4u+S5i+awlOOAgic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAn6LSi5pifJzpcbiAgICAgICAgZXhwbGFuYXRpb24gPSAn6LSi5pif5Li65oiR55Sf5LmL54mp77yM5Luj6KGo6LSi5a+M44CB54mp6LSo44CB5Lqr5Y+X562J44CC5pel5Li75pe65pe277yM6LSi5pif5Y+v5Lul6ICX5rOE5pel5Li75LmL5rCU44CCJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICfpo5/kvKQnOlxuICAgICAgICBleHBsYW5hdGlvbiA9ICfpo5/kvKTkuLrmiJHms4TkuYvnianvvIzku6PooajmiY3oibrjgIHlrZDlpbPjgIHliJvpgKDlipvnrYnjgILml6XkuLvml7rml7bvvIzpo5/kvKTlj6/ku6Xms4Tnp4Dml6XkuLvkuYvmsJTjgIInO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ+avlOWKqyc6XG4gICAgICAgIGV4cGxhbmF0aW9uID0gJ+avlOWKq+S4uuWQjOaIkeS5i+eJqe+8jOS7o+ihqOWFhOW8n+OAgeWQjOS6i+OAgeernuS6ieetieOAguaXpeS4u+W8seaXtu+8jOavlOWKq+WPr+S7peW4ruaJtuaXpeS4u++8jOWinuW8uuaXpeS4u+WKm+mHj+OAgic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZXhwbGFuYXRpb24gPSAn55So56We5piv5YWr5a2X5Lit5a+55pel5Li75pyA5pyJ5Yip55qE5LqU6KGM77yM5qC55o2u5pel5Li75pe66KGw5LiN5ZCM77yM55So56We5Lmf5LiN5ZCM44CCJztcbiAgICB9XG5cbiAgICB5b25nU2hlbkV4cGxhbmF0aW9uLnRleHRDb250ZW50ID0gZXhwbGFuYXRpb247XG4gICAgeW9uZ1NoZW5FeHBsYW5hdGlvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC15b25nc2hlbi1leHBsYW5hdGlvbic7XG5cbiAgICAvLyDliJvlu7rnlKjnpZ7lj5bnlKjljp/liJlcbiAgICBjb25zdCBwcmluY2lwbGVUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XG4gICAgcHJpbmNpcGxlVGl0bGUudGV4dENvbnRlbnQgPSAn55So56We5Y+W55So5Y6f5YiZJztcbiAgICBwcmluY2lwbGVUaXRsZS5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1zZWN0aW9uLXRpdGxlJztcblxuICAgIGNvbnN0IHByaW5jaXBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHByaW5jaXBsZS5pbm5lckhUTUwgPSBgXG4gICAgICA8cD4xLiDml6XkuLvov4fml7rvvIzlj5blhYvms4TkuYvniankuLrnlKjnpZ7vvIjlrpjmnYDjgIHotKLmmJ/jgIHpo5/kvKTvvIk8L3A+XG4gICAgICA8cD4yLiDml6XkuLvov4flvLHvvIzlj5bnlJ/mibbkuYvniankuLrnlKjnpZ7vvIjljbDmmJ/jgIHmr5TliqvvvIk8L3A+XG4gICAgICA8cD4zLiDml6XkuLvlubPooaHvvIzmoLnmja7lhavlrZfnibnngrnpgInmi6nnlKjnpZ48L3A+XG4gICAgICA8cD40LiDmnIjku6TlvZPku6TnmoTkupTooYzvvIzkvJjlhYjogIPomZHkuLrnlKjnpZ48L3A+XG4gICAgICA8cD41LiDlhavlrZfkuK3mnIDmnInlipvnmoTkupTooYzvvIzmrKHkuYvogIPomZHkuLrnlKjnpZ48L3A+XG4gICAgYDtcbiAgICBwcmluY2lwbGUuY2xhc3NOYW1lID0gJ2JhemktbW9kYWwtcHJpbmNpcGxlJztcblxuICAgIC8vIOWIm+W7uuWFs+mXreaMiemSrlxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24udGV4dENvbnRlbnQgPSAn5YWz6ZetJztcbiAgICBjbG9zZUJ1dHRvbi5jbGFzc05hbWUgPSAnYmF6aS1tb2RhbC1jbG9zZSc7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIOe7hOijheW8ueeql+WGheWuuVxuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgbW9kYWxDb250ZW50LmFwcGVuZENoaWxkKGV4cGxhbmF0aW9uVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChleHBsYW5hdGlvblRleHQpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh5b25nU2hlbkV4cGxhbmF0aW9uVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZCh5b25nU2hlbkV4cGxhbmF0aW9uKTtcbiAgICBtb2RhbENvbnRlbnQuYXBwZW5kQ2hpbGQocHJpbmNpcGxlVGl0bGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChwcmluY2lwbGUpO1xuICAgIG1vZGFsQ29udGVudC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDmt7vliqDlvLnnqpflhoXlrrnliLDlvLnnqpdcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChtb2RhbENvbnRlbnQpO1xuXG4gICAgLy8g5re75Yqg5by556qX5Yiw6aG16Z2iXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDmt7vliqDngrnlh7vkuovku7bvvIzngrnlh7vlvLnnqpflpJbpg6jlhbPpl63lvLnnqpdcbiAgICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IG1vZGFsKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobW9kYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=