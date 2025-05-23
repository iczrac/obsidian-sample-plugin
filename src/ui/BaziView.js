import { __awaiter } from "tslib";
import { ShenShaService } from 'src/services/ShenShaService';
import { Notice } from 'obsidian';
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
        // 调试信息：检查神煞数据
        console.log('开始渲染八字命盘，检查神煞数据:');
        // 手动检查神煞数据
        console.log('======= 神煞数据检查 =======');
        // 检查四柱神煞
        console.log('年柱神煞:', this.baziInfo.yearShenSha);
        console.log('月柱神煞:', this.baziInfo.monthShenSha);
        console.log('日柱神煞:', this.baziInfo.dayShenSha);
        console.log('时柱神煞:', this.baziInfo.hourShenSha);
        // 检查大运神煞
        console.log('大运神煞数据:');
        if (Array.isArray(this.baziInfo.daYun)) {
            this.baziInfo.daYun.forEach((dy, index) => {
                console.log(`大运${index + 1} (${dy.ganZhi}) 神煞:`, dy.shenSha);
            });
        }
        else {
            console.log('大运数据不是数组');
        }
        // 检查流年神煞
        console.log('流年神煞数据:');
        if (this.baziInfo.liuNian && this.baziInfo.liuNian.length > 0) {
            this.baziInfo.liuNian.forEach((ln, index) => {
                console.log(`流年${index + 1} (${ln.year}) 神煞:`, ln.shenSha);
            });
        }
        else {
            console.log('流年数据为空');
        }
        // 检查小运神煞
        console.log('小运神煞数据:');
        if (this.baziInfo.xiaoYun && this.baziInfo.xiaoYun.length > 0) {
            this.baziInfo.xiaoYun.forEach((xy, index) => {
                console.log(`小运${index + 1} (${xy.year}) 神煞:`, xy.shenSha);
            });
        }
        else {
            console.log('小运数据为空');
        }
        // 检查流月神煞
        console.log('流月神煞数据:');
        if (this.baziInfo.liuYue && this.baziInfo.liuYue.length > 0) {
            this.baziInfo.liuYue.forEach((ly, index) => {
                console.log(`流月${index + 1} (${ly.month}) 神煞:`, ly.shenSha);
            });
        }
        else {
            console.log('流月数据为空');
        }
        // 检查神煞显示设置
        console.log('神煞显示设置:', this.baziInfo.showShenSha);
        console.log('======= 神煞数据检查结束 =======');
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
        var _a, _b;
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
        // 神煞行
        if (this.baziInfo.yearShenSha || this.baziInfo.monthShenSha ||
            this.baziInfo.dayShenSha || this.baziInfo.hourShenSha) {
            const shenShaRow = tbody.createEl('tr');
            shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
            // 检查神煞显示设置
            console.log('四柱神煞显示设置:', this.baziInfo.showShenSha);
            console.log('四柱神煞显示设置类型:', typeof this.baziInfo.showShenSha);
            console.log('四柱神煞显示设置siZhu:', (_a = this.baziInfo.showShenSha) === null || _a === void 0 ? void 0 : _a.siZhu);
            console.log('四柱神煞显示设置siZhu类型:', typeof ((_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.siZhu));
            // 强制显示神煞行
            shenShaRow.style.display = ''; // 确保显示
            // 根据设置显示或隐藏神煞行
            if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.siZhu === false) {
                console.log('根据设置隐藏四柱神煞行');
                shenShaRow.style.display = 'none';
            }
            else {
                console.log('四柱神煞行应该显示');
                shenShaRow.style.display = ''; // 确保显示
            }
            // 年柱神煞
            const yearShenShaCell = shenShaRow.createEl('td');
            console.log('年柱神煞数据:', this.baziInfo.yearShenSha);
            console.log('年柱神煞数据类型:', typeof this.baziInfo.yearShenSha);
            console.log('年柱神煞数据是否为数组:', Array.isArray(this.baziInfo.yearShenSha));
            console.log('年柱神煞数据长度:', this.baziInfo.yearShenSha ? this.baziInfo.yearShenSha.length : 0);
            // 确保神煞数据是数组
            const yearShenSha = Array.isArray(this.baziInfo.yearShenSha) ? this.baziInfo.yearShenSha : [];
            if (yearShenSha.length > 0) {
                const shenShaList = yearShenShaCell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    yearShenSha.forEach((shenSha, i) => {
                        console.log(`处理年柱第 ${i + 1} 个神煞: ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理年柱神煞出错:', e);
                    yearShenShaCell.setText('神煞处理错误');
                }
            }
            else {
                console.log('年柱没有神煞数据');
                yearShenShaCell.setText('无神煞');
            }
            // 月柱神煞
            const monthShenShaCell = shenShaRow.createEl('td');
            console.log('月柱神煞数据:', this.baziInfo.monthShenSha);
            console.log('月柱神煞数据类型:', typeof this.baziInfo.monthShenSha);
            console.log('月柱神煞数据是否为数组:', Array.isArray(this.baziInfo.monthShenSha));
            console.log('月柱神煞数据长度:', this.baziInfo.monthShenSha ? this.baziInfo.monthShenSha.length : 0);
            // 确保神煞数据是数组
            const monthShenSha = Array.isArray(this.baziInfo.monthShenSha) ? this.baziInfo.monthShenSha : [];
            if (monthShenSha.length > 0) {
                const shenShaList = monthShenShaCell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    monthShenSha.forEach((shenSha, i) => {
                        console.log(`处理月柱第 ${i + 1} 个神煞: ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理月柱神煞出错:', e);
                    monthShenShaCell.setText('神煞处理错误');
                }
            }
            else {
                console.log('月柱没有神煞数据');
                monthShenShaCell.setText('无神煞');
            }
            // 日柱神煞
            const dayShenShaCell = shenShaRow.createEl('td');
            console.log('日柱神煞数据:', this.baziInfo.dayShenSha);
            console.log('日柱神煞数据类型:', typeof this.baziInfo.dayShenSha);
            console.log('日柱神煞数据是否为数组:', Array.isArray(this.baziInfo.dayShenSha));
            console.log('日柱神煞数据长度:', this.baziInfo.dayShenSha ? this.baziInfo.dayShenSha.length : 0);
            // 确保神煞数据是数组
            const dayShenSha = Array.isArray(this.baziInfo.dayShenSha) ? this.baziInfo.dayShenSha : [];
            if (dayShenSha.length > 0) {
                const shenShaList = dayShenShaCell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    dayShenSha.forEach((shenSha, i) => {
                        console.log(`处理日柱第 ${i + 1} 个神煞: ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理日柱神煞出错:', e);
                    dayShenShaCell.setText('神煞处理错误');
                }
            }
            else {
                console.log('日柱没有神煞数据');
                dayShenShaCell.setText('无神煞');
            }
            // 时柱神煞
            const hourShenShaCell = shenShaRow.createEl('td');
            console.log('时柱神煞数据:', this.baziInfo.hourShenSha);
            console.log('时柱神煞数据类型:', typeof this.baziInfo.hourShenSha);
            console.log('时柱神煞数据是否为数组:', Array.isArray(this.baziInfo.hourShenSha));
            console.log('时柱神煞数据长度:', this.baziInfo.hourShenSha ? this.baziInfo.hourShenSha.length : 0);
            // 确保神煞数据是数组
            const hourShenSha = Array.isArray(this.baziInfo.hourShenSha) ? this.baziInfo.hourShenSha : [];
            if (hourShenSha.length > 0) {
                const shenShaList = hourShenShaCell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    hourShenSha.forEach((shenSha, i) => {
                        console.log(`处理时柱第 ${i + 1} 个神煞: ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理时柱神煞出错:', e);
                    hourShenShaCell.setText('神煞处理错误');
                }
            }
            else {
                console.log('时柱没有神煞数据');
                hourShenShaCell.setText('无神煞');
            }
        }
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
        var _a, _b;
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
                // 使用内联代码替代方法调用
                const allDaYun = this.baziInfo.daYun || [];
                const allLiuNian = this.baziInfo.liuNian || [];
                const allXiaoYun = this.baziInfo.xiaoYun || [];
                const allLiuYue = this.baziInfo.liuYue || [];
                // 根据选择的大运索引，筛选对应的流年、小运和流月
                const selectedDaYun = allDaYun[index];
                if (!selectedDaYun) {
                    console.warn(`未找到索引为 ${index} 的大运数据`);
                    return;
                }
                // 检查selectedDaYun是否为字符串
                if (typeof selectedDaYun === 'string') {
                    console.warn(`大运数据类型错误: ${typeof selectedDaYun}`);
                    return;
                }
                // 筛选该大运对应的流年
                const filteredLiuNian = allLiuNian.filter(ln => {
                    return ln.year >= selectedDaYun.startYear && ln.year <= (selectedDaYun.endYear || Infinity);
                });
                // 筛选该大运对应的小运
                const filteredXiaoYun = allXiaoYun.filter(xy => {
                    return xy.year >= selectedDaYun.startYear && xy.year <= (selectedDaYun.endYear || Infinity);
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
            });
        });
        // 第四行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('大运神煞显示设置:', this.baziInfo.showShenSha);
        console.log('大运神煞显示设置类型:', typeof this.baziInfo.showShenSha);
        console.log('大运神煞显示设置daYun:', (_a = this.baziInfo.showShenSha) === null || _a === void 0 ? void 0 : _a.daYun);
        console.log('大运神煞显示设置daYun类型:', typeof ((_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.daYun));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.daYun === false) {
            console.log('根据设置隐藏大运神煞行');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('大运神煞行应该显示');
            shenShaRow.style.display = ''; // 确保显示
        }
        daYunArray.slice(0, 10).forEach((dy, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理大运 ${dy.ganZhi} (索引: ${index}) 的神煞数据:`, dy.shenSha);
            console.log(`大运数据类型检查 - shenSha是否存在: ${dy.shenSha !== undefined}, 是否为数组: ${Array.isArray(dy.shenSha)}, 长度: ${dy.shenSha ? dy.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!dy.shenSha) {
                console.warn(`大运 ${dy.ganZhi} 的神煞数据为空或undefined`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(dy.shenSha)) {
                console.error(`大运 ${dy.ganZhi} 的神煞数据不是数组，而是 ${typeof dy.shenSha}`);
                cell.setText(`数据类型错误: ${typeof dy.shenSha}`);
                return;
            }
            if (dy.shenSha && dy.shenSha.length > 0) {
                // 调试信息
                console.log(`大运神煞数据:`, dy.shenSha);
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    dy.shenSha.forEach((shenSha, i) => {
                        console.log(`处理大运 ${dy.ganZhi} 的第 ${i + 1} 个神煞: ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理大运神煞出错:', e);
                    cell.setText('神煞处理错误');
                }
            }
            else {
                console.log(`大运 ${dy.ganZhi} 没有神煞数据`);
                cell.setText('无神煞');
            }
        });
        // 创建流年信息
        this.createLiuNianInfo();
        // 创建小运信息
        this.createXiaoYunInfo();
        // 创建流月信息
        this.createLiuYueInfo();
        // 默认选中第一个大运
        if (this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
            // 使用内联代码替代方法调用
            const index = 0;
            const allDaYun = this.baziInfo.daYun || [];
            const allLiuNian = this.baziInfo.liuNian || [];
            const allXiaoYun = this.baziInfo.xiaoYun || [];
            const allLiuYue = this.baziInfo.liuYue || [];
            // 根据选择的大运索引，筛选对应的流年、小运和流月
            const selectedDaYun = allDaYun[index];
            if (!selectedDaYun) {
                console.warn(`未找到索引为 ${index} 的大运数据`);
                return;
            }
            // 检查selectedDaYun是否为字符串
            if (typeof selectedDaYun === 'string') {
                console.warn(`大运数据类型错误: ${typeof selectedDaYun}`);
                return;
            }
            // 筛选该大运对应的流年
            const filteredLiuNian = allLiuNian.filter(ln => {
                return ln.year >= selectedDaYun.startYear && ln.year <= (selectedDaYun.endYear || Infinity);
            });
            // 筛选该大运对应的小运
            const filteredXiaoYun = allXiaoYun.filter(xy => {
                return xy.year >= selectedDaYun.startYear && xy.year <= (selectedDaYun.endYear || Infinity);
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
    }
    /**
     * 创建流年信息
     */
    createLiuNianInfo() {
        var _a, _b;
        if (!this.baziInfo.liuNian || this.baziInfo.liuNian.length === 0) {
            console.log('没有流年数据，跳过创建流年信息');
            return;
        }
        console.log('开始创建流年信息，数据长度:', this.baziInfo.liuNian.length);
        console.log('流年数据示例:', this.baziInfo.liuNian[0]);
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
        // 第四行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('流年神煞显示设置:', this.baziInfo.showShenSha);
        console.log('流年神煞显示设置类型:', typeof this.baziInfo.showShenSha);
        console.log('流年神煞显示设置liuNian:', (_a = this.baziInfo.showShenSha) === null || _a === void 0 ? void 0 : _a.liuNian);
        console.log('流年神煞显示设置liuNian类型:', typeof ((_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.liuNian));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuNian === false) {
            console.log('根据设置隐藏流年神煞行');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('流年神煞行应该显示');
            shenShaRow.style.display = ''; // 确保显示
        }
        liuNianData.slice(0, 10).forEach((ln, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理流年 ${ln.year} (索引: ${index}) 的神煞数据:`, ln.shenSha);
            console.log(`流年数据类型检查 - shenSha是否存在: ${ln.shenSha !== undefined}, 是否为数组: ${Array.isArray(ln.shenSha)}, 长度: ${ln.shenSha ? ln.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!ln.shenSha) {
                console.warn(`流年 ${ln.year} 的神煞数据为空或undefined`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(ln.shenSha)) {
                console.error(`流年 ${ln.year} 的神煞数据不是数组，而是 ${typeof ln.shenSha}`);
                cell.setText(`数据类型错误: ${typeof ln.shenSha}`);
                return;
            }
            if (ln.shenSha && ln.shenSha.length > 0) {
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                ln.shenSha.forEach((shenSha, i) => {
                    console.log(`处理流年 ${ln.year} 的第 ${i + 1} 个神煞: ${shenSha}`);
                    const shenShaInfo = this.getShenShaInfo(shenSha);
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
                    const shenShaEl = shenShaList.createEl('span', {
                        text: shenSha,
                        cls: `bazi-shensha ${cssClass}`,
                        attr: {
                            'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                            'data-shensha': shenSha,
                            'data-type': type
                        }
                    });
                    // 添加点击事件显示神煞详情
                    shenShaEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showShenShaDetail(shenSha);
                    });
                });
            }
            else {
                console.log(`流年 ${ln.year} 没有神煞数据`);
                cell.setText('无神煞');
            }
        });
        console.log('流年信息创建完成');
    }
    /**
     * 创建小运信息
     */
    createXiaoYunInfo() {
        var _a, _b;
        if (!this.baziInfo.xiaoYun || this.baziInfo.xiaoYun.length === 0) {
            console.log('没有小运数据，跳过创建小运信息');
            return;
        }
        console.log('开始创建小运信息，数据长度:', this.baziInfo.xiaoYun.length);
        console.log('小运数据示例:', this.baziInfo.xiaoYun[0]);
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
        // 第四行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('小运神煞显示设置:', this.baziInfo.showShenSha);
        console.log('小运神煞显示设置类型:', typeof this.baziInfo.showShenSha);
        console.log('小运神煞显示设置xiaoYun:', (_a = this.baziInfo.showShenSha) === null || _a === void 0 ? void 0 : _a.xiaoYun);
        console.log('小运神煞显示设置xiaoYun类型:', typeof ((_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.xiaoYun));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.xiaoYun === false) {
            console.log('根据设置隐藏小运神煞行');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('小运神煞行应该显示');
            shenShaRow.style.display = ''; // 确保显示
        }
        xiaoYunData.slice(0, 10).forEach((xy, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理小运 ${xy.year} (索引: ${index}) 的神煞数据:`, xy.shenSha);
            console.log(`小运数据类型检查 - shenSha是否存在: ${xy.shenSha !== undefined}, 是否为数组: ${Array.isArray(xy.shenSha)}, 长度: ${xy.shenSha ? xy.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!xy.shenSha) {
                console.warn(`小运 ${xy.year} 的神煞数据为空或undefined`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(xy.shenSha)) {
                console.error(`小运 ${xy.year} 的神煞数据不是数组，而是 ${typeof xy.shenSha}`);
                cell.setText(`数据类型错误: ${typeof xy.shenSha}`);
                return;
            }
            if (xy.shenSha && xy.shenSha.length > 0) {
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                xy.shenSha.forEach((shenSha, i) => {
                    console.log(`处理小运 ${xy.year} 的第 ${i + 1} 个神煞: ${shenSha}`);
                    const shenShaInfo = this.getShenShaInfo(shenSha);
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
                    const shenShaEl = shenShaList.createEl('span', {
                        text: shenSha,
                        cls: `bazi-shensha ${cssClass}`,
                        attr: {
                            'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                            'data-shensha': shenSha,
                            'data-type': type
                        }
                    });
                    // 添加点击事件显示神煞详情
                    shenShaEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showShenShaDetail(shenSha);
                    });
                });
            }
            else {
                console.log(`小运 ${xy.year} 没有神煞数据`);
                cell.setText('无神煞');
            }
        });
        console.log('小运信息创建完成');
    }
    /**
     * 创建流月信息
     */
    createLiuYueInfo() {
        var _a, _b;
        if (!this.baziInfo.liuYue || this.baziInfo.liuYue.length === 0) {
            console.log('没有流月数据，跳过创建流月信息');
            return;
        }
        console.log('开始创建流月信息，数据长度:', this.baziInfo.liuYue.length);
        console.log('流月数据示例:', this.baziInfo.liuYue[0]);
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
        // 第三行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('流月神煞显示设置:', this.baziInfo.showShenSha);
        console.log('流月神煞显示设置类型:', typeof this.baziInfo.showShenSha);
        console.log('流月神煞显示设置liuYue:', (_a = this.baziInfo.showShenSha) === null || _a === void 0 ? void 0 : _a.liuYue);
        console.log('流月神煞显示设置liuYue类型:', typeof ((_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.liuYue));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuYue === false) {
            console.log('根据设置隐藏流月神煞行');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('流月神煞行应该显示');
            shenShaRow.style.display = ''; // 确保显示
        }
        liuYueData.forEach((ly, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理流月 ${ly.month} (索引: ${index}) 的神煞数据:`, ly.shenSha);
            console.log(`流月数据类型检查 - shenSha是否存在: ${ly.shenSha !== undefined}, 是否为数组: ${Array.isArray(ly.shenSha)}, 长度: ${ly.shenSha ? ly.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!ly.shenSha) {
                console.warn(`流月 ${ly.month} 的神煞数据为空或undefined`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(ly.shenSha)) {
                console.error(`流月 ${ly.month} 的神煞数据不是数组，而是 ${typeof ly.shenSha}`);
                cell.setText(`数据类型错误: ${typeof ly.shenSha}`);
                return;
            }
            if (ly.shenSha && ly.shenSha.length > 0) {
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                ly.shenSha.forEach((shenSha, i) => {
                    console.log(`处理流月 ${ly.month} 的第 ${i + 1} 个神煞: ${shenSha}`);
                    const shenShaInfo = this.getShenShaInfo(shenSha);
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
                    const shenShaEl = shenShaList.createEl('span', {
                        text: shenSha,
                        cls: `bazi-shensha ${cssClass}`,
                        attr: {
                            'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                            'data-shensha': shenSha,
                            'data-type': type
                        }
                    });
                    // 添加点击事件显示神煞详情
                    shenShaEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showShenShaDetail(shenSha);
                    });
                });
            }
            else {
                console.log(`流月 ${ly.month} 没有神煞数据`);
                cell.setText('无神煞');
            }
        });
        console.log('流月信息创建完成');
    }
    // 已删除未使用的方法
    /**
     * 处理流年选择
     * @param year 流年年份
     */
    handleLiuNianSelect(year) {
        // 记录选中的流年年份，用于调试
        console.log(`选中流年: ${year}`);
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
        var _a, _b, _c;
        const liuNianSection = this.container.querySelector(`.bazi-liunian-section[data-bazi-id="${this.id}"]`);
        if (!liuNianSection)
            return;
        // 获取表格
        const table = liuNianSection.querySelector('.bazi-view-liunian-table');
        if (!table)
            return;
        // 清空表格
        table.empty();
        // 调试信息：输出流年数据
        console.log('流年数据:', liuNian);
        console.log('流年神煞数据示例:', (_a = liuNian[0]) === null || _a === void 0 ? void 0 : _a.shenSha);
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
        // 第四行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('流年神煞显示设置(更新表格):', this.baziInfo.showShenSha);
        console.log('流年神煞显示设置类型(更新表格):', typeof this.baziInfo.showShenSha);
        console.log('流年神煞显示设置liuNian(更新表格):', (_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.liuNian);
        console.log('流年神煞显示设置liuNian类型(更新表格):', typeof ((_c = this.baziInfo.showShenSha) === null || _c === void 0 ? void 0 : _c.liuNian));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuNian === false) {
            console.log('根据设置隐藏流年神煞行(更新表格)');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('流年神煞行应该显示(更新表格)');
            shenShaRow.style.display = ''; // 确保显示
        }
        liuNian.slice(0, 10).forEach((ln, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理流年 ${ln.year} (索引: ${index}) 的神煞数据(更新表格):`, ln.shenSha);
            console.log(`流年数据类型检查(更新表格) - shenSha是否存在: ${ln.shenSha !== undefined}, 是否为数组: ${Array.isArray(ln.shenSha)}, 长度: ${ln.shenSha ? ln.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!ln.shenSha) {
                console.warn(`流年 ${ln.year} 的神煞数据为空或undefined(更新表格)`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(ln.shenSha)) {
                console.error(`流年 ${ln.year} 的神煞数据不是数组，而是 ${typeof ln.shenSha}(更新表格)`);
                cell.setText(`数据类型错误: ${typeof ln.shenSha}`);
                return;
            }
            if (ln.shenSha && ln.shenSha.length > 0) {
                // 调试信息
                console.log(`流年 ${ln.year} 的神煞数据:`, ln.shenSha);
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    ln.shenSha.forEach((shenSha, i) => {
                        console.log(`处理流年 ${ln.year} 的第 ${i + 1} 个神煞(更新表格): ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理流年神煞出错:', e);
                    cell.setText('神煞处理错误');
                }
            }
            else {
                console.log(`流年 ${ln.year} 没有神煞数据(更新表格)`);
                cell.setText('无神煞');
            }
        });
    }
    /**
     * 更新小运表格
     * @param xiaoYun 小运数据
     */
    updateXiaoYunTable(xiaoYun) {
        var _a, _b, _c;
        const xiaoYunSection = this.container.querySelector(`.bazi-xiaoyun-section[data-bazi-id="${this.id}"]`);
        if (!xiaoYunSection)
            return;
        // 获取表格
        const table = xiaoYunSection.querySelector('.bazi-view-xiaoyun-table');
        if (!table)
            return;
        // 清空表格
        table.empty();
        // 调试信息：输出小运数据
        console.log('小运数据:', xiaoYun);
        console.log('小运神煞数据示例:', (_a = xiaoYun[0]) === null || _a === void 0 ? void 0 : _a.shenSha);
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
        // 第四行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('小运神煞显示设置(更新表格):', this.baziInfo.showShenSha);
        console.log('小运神煞显示设置类型(更新表格):', typeof this.baziInfo.showShenSha);
        console.log('小运神煞显示设置xiaoYun(更新表格):', (_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.xiaoYun);
        console.log('小运神煞显示设置xiaoYun类型(更新表格):', typeof ((_c = this.baziInfo.showShenSha) === null || _c === void 0 ? void 0 : _c.xiaoYun));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.xiaoYun === false) {
            console.log('根据设置隐藏小运神煞行(更新表格)');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('小运神煞行应该显示(更新表格)');
            shenShaRow.style.display = ''; // 确保显示
        }
        xiaoYun.slice(0, 10).forEach((xy, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理小运 ${xy.year} (索引: ${index}) 的神煞数据(更新表格):`, xy.shenSha);
            console.log(`小运数据类型检查(更新表格) - shenSha是否存在: ${xy.shenSha !== undefined}, 是否为数组: ${Array.isArray(xy.shenSha)}, 长度: ${xy.shenSha ? xy.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!xy.shenSha) {
                console.warn(`小运 ${xy.year} 的神煞数据为空或undefined(更新表格)`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(xy.shenSha)) {
                console.error(`小运 ${xy.year} 的神煞数据不是数组，而是 ${typeof xy.shenSha}(更新表格)`);
                cell.setText(`数据类型错误: ${typeof xy.shenSha}`);
                return;
            }
            if (xy.shenSha && xy.shenSha.length > 0) {
                // 调试信息
                console.log(`小运 ${xy.year} 的神煞数据:`, xy.shenSha);
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    xy.shenSha.forEach((shenSha, i) => {
                        console.log(`处理小运 ${xy.year} 的第 ${i + 1} 个神煞(更新表格): ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理小运神煞出错:', e);
                    cell.setText('神煞处理错误');
                }
            }
            else {
                console.log(`小运 ${xy.year} 没有神煞数据(更新表格)`);
                cell.setText('无神煞');
            }
        });
    }
    /**
     * 更新流月表格
     * @param liuYue 流月数据
     */
    updateLiuYueTable(liuYue) {
        var _a, _b, _c;
        const liuYueSection = this.container.querySelector(`.bazi-liuyue-section[data-bazi-id="${this.id}"]`);
        if (!liuYueSection)
            return;
        // 获取表格
        const table = liuYueSection.querySelector('.bazi-view-liuyue-table');
        if (!table)
            return;
        // 清空表格
        table.empty();
        // 调试信息：输出流月数据
        console.log('流月数据:', liuYue);
        console.log('流月神煞数据示例:', (_a = liuYue[0]) === null || _a === void 0 ? void 0 : _a.shenSha);
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
        // 第三行：神煞
        const shenShaRow = table.createEl('tr');
        shenShaRow.createEl('th', { text: '神煞' });
        shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性
        // 检查神煞显示设置
        console.log('流月神煞显示设置(更新表格):', this.baziInfo.showShenSha);
        console.log('流月神煞显示设置类型(更新表格):', typeof this.baziInfo.showShenSha);
        console.log('流月神煞显示设置liuYue(更新表格):', (_b = this.baziInfo.showShenSha) === null || _b === void 0 ? void 0 : _b.liuYue);
        console.log('流月神煞显示设置liuYue类型(更新表格):', typeof ((_c = this.baziInfo.showShenSha) === null || _c === void 0 ? void 0 : _c.liuYue));
        // 强制显示神煞行
        shenShaRow.style.display = ''; // 确保显示
        // 根据设置显示或隐藏神煞行
        if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuYue === false) {
            console.log('根据设置隐藏流月神煞行(更新表格)');
            shenShaRow.style.display = 'none';
        }
        else {
            console.log('流月神煞行应该显示(更新表格)');
            shenShaRow.style.display = ''; // 确保显示
        }
        liuYue.forEach((ly, index) => {
            const cell = shenShaRow.createEl('td');
            console.log(`处理流月 ${ly.month} (索引: ${index}) 的神煞数据(更新表格):`, ly.shenSha);
            console.log(`流月数据类型检查(更新表格) - shenSha是否存在: ${ly.shenSha !== undefined}, 是否为数组: ${Array.isArray(ly.shenSha)}, 长度: ${ly.shenSha ? ly.shenSha.length : 0}`);
            // 检查神煞数据是否为空或undefined
            if (!ly.shenSha) {
                console.warn(`流月 ${ly.month} 的神煞数据为空或undefined(更新表格)`);
                cell.setText('无神煞数据');
                return;
            }
            // 检查神煞数据是否为数组
            if (!Array.isArray(ly.shenSha)) {
                console.error(`流月 ${ly.month} 的神煞数据不是数组，而是 ${typeof ly.shenSha}(更新表格)`);
                cell.setText(`数据类型错误: ${typeof ly.shenSha}`);
                return;
            }
            if (ly.shenSha && ly.shenSha.length > 0) {
                // 调试信息：输出每个流月的神煞数据
                console.log(`流月 ${ly.month} 的神煞数据:`, ly.shenSha);
                console.log(`流月 ${ly.month} 的神煞数据类型:`, typeof ly.shenSha, Array.isArray(ly.shenSha));
                // 创建神煞列表
                const shenShaList = cell.createEl('div', { cls: 'bazi-shensha-list' });
                try {
                    ly.shenSha.forEach((shenSha, i) => {
                        console.log(`处理流月 ${ly.month} 的第 ${i + 1} 个神煞(更新表格): ${shenSha}`);
                        const shenShaInfo = this.getShenShaInfo(shenSha);
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
                        const shenShaEl = shenShaList.createEl('span', {
                            text: shenSha,
                            cls: `bazi-shensha ${cssClass}`,
                            attr: {
                                'style': 'display:inline-block !important; padding:2px 4px !important; margin:2px !important; border-radius:3px !important; font-size:0.8em !important; cursor:pointer !important;',
                                'data-shensha': shenSha,
                                'data-type': type
                            }
                        });
                        // 添加点击事件显示神煞详情
                        shenShaEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showShenShaDetail(shenSha);
                        });
                    });
                }
                catch (e) {
                    console.error('处理流月神煞出错:', e);
                    cell.setText('神煞处理错误');
                }
            }
            else {
                // 调试信息：输出没有神煞数据的流月
                console.log(`流月 ${ly.month} 没有神煞数据或数据为空(更新表格)`);
                cell.setText('无神煞');
            }
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
     * 获取神煞信息
     * @param shenSha 神煞名称
     * @returns 神煞信息
     */
    getShenShaInfo(shenSha) {
        return ShenShaService.getShenShaInfo(shenSha);
    }
    /**
     * 显示神煞详情
     * @param shenSha 神煞名称
     */
    showShenShaDetail(shenSha) {
        // 调试信息
        console.log(`显示神煞详情: ${shenSha}`);
        // 去除可能的前缀（如"年柱:"）
        const pureShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
        console.log(`处理后的神煞名称: ${pureShenSha}`);
        // 获取神煞详细解释
        const shenShaInfo = ShenShaService.getShenShaExplanation(pureShenSha);
        console.log(`神煞信息:`, shenShaInfo);
        if (!shenShaInfo) {
            console.error(`未找到神煞 "${pureShenSha}" 的详细信息`);
            new Notice(`未找到神煞 "${pureShenSha}" 的详细信息`);
            return;
        }
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
        // 创建弹窗内容
        const modal = document.createElement('div');
        modal.className = 'shensha-modal';
        modal.style.backgroundColor = 'white';
        modal.style.borderRadius = '8px';
        modal.style.padding = '20px';
        modal.style.maxWidth = '80%';
        modal.style.maxHeight = '80%';
        modal.style.overflow = 'auto';
        modal.style.position = 'relative';
        container.appendChild(modal);
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(container);
        });
        modal.appendChild(closeButton);
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = shenShaInfo.name;
        title.style.marginTop = '0';
        modal.appendChild(title);
        // 创建类型
        const type = document.createElement('div');
        type.textContent = `类型: ${shenShaInfo.type}`;
        type.style.marginBottom = '10px';
        if (shenShaInfo.type === '吉神') {
            type.style.color = 'green';
        }
        else if (shenShaInfo.type === '凶神') {
            type.style.color = 'red';
        }
        else if (shenShaInfo.type === '吉凶神') {
            type.style.color = 'orange';
        }
        modal.appendChild(type);
        // 创建描述
        const description = document.createElement('div');
        description.textContent = shenShaInfo.description;
        description.style.marginBottom = '10px';
        modal.appendChild(description);
        // 创建详细描述
        const detailDescription = document.createElement('div');
        detailDescription.textContent = shenShaInfo.detailDescription;
        detailDescription.style.marginBottom = '10px';
        modal.appendChild(detailDescription);
        // 创建计算方法
        if (shenShaInfo.calculation) {
            const calculation = document.createElement('div');
            calculation.innerHTML = `<strong>计算方法:</strong><br>${shenShaInfo.calculation}`;
            calculation.style.marginBottom = '10px';
            modal.appendChild(calculation);
        }
        // 创建影响
        if (shenShaInfo.influence && shenShaInfo.influence.length > 0) {
            const influence = document.createElement('div');
            influence.innerHTML = `<strong>影响:</strong> ${shenShaInfo.influence.join(', ')}`;
            modal.appendChild(influence);
        }
        // 添加可复制的内容
        const copyableContent = document.createElement('div');
        copyableContent.className = 'shensha-copyable-content';
        copyableContent.style.marginTop = '20px';
        copyableContent.style.padding = '10px';
        copyableContent.style.backgroundColor = '#f5f5f5';
        copyableContent.style.borderRadius = '5px';
        modal.appendChild(copyableContent);
        // 添加标题
        const copyTitle = document.createElement('div');
        copyTitle.textContent = '可复制内容 (点击下方文本可复制)';
        copyTitle.style.fontWeight = 'bold';
        copyTitle.style.marginBottom = '5px';
        copyableContent.appendChild(copyTitle);
        // 准备可复制的文本
        const copyText = [
            `神煞: ${shenShaInfo.name}`,
            `类型: ${shenShaInfo.type}`,
            shenShaInfo.description ? `描述: ${shenShaInfo.description}` : '',
            shenShaInfo.detailDescription ? `详细描述: ${shenShaInfo.detailDescription}` : '',
            shenShaInfo.calculation ? `计算方法: ${shenShaInfo.calculation}` : '',
            shenShaInfo.influence && shenShaInfo.influence.length > 0
                ? `影响: ${shenShaInfo.influence.join(', ')}`
                : ''
        ].filter(Boolean).join('\n');
        // 创建可复制的文本元素
        const copyTextEl = document.createElement('pre');
        copyTextEl.textContent = copyText;
        copyTextEl.style.cursor = 'pointer';
        copyTextEl.style.userSelect = 'all';
        copyTextEl.style.whiteSpace = 'pre-wrap';
        copyTextEl.style.wordBreak = 'break-word';
        copyableContent.appendChild(copyTextEl);
        // 添加点击复制功能
        copyTextEl.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(copyText);
                new Notice('神煞信息已复制到剪贴板');
            }
            catch (err) {
                console.error('复制失败:', err);
                new Notice('复制失败，请手动选择并复制');
            }
        }));
        // 点击弹窗外部关闭弹窗
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                document.body.removeChild(container);
            }
        });
    }
    /**
     * 获取视图的HTML内容
     * @returns HTML字符串
     */
    getHTML() {
        return this.container.innerHTML;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFFBQVE7SUFNbkI7Ozs7O09BS0c7SUFDSCxZQUFZLFNBQXNCLEVBQUUsUUFBa0IsRUFBRSxlQUEyQjtRQUNqRixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsRUFBRSxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFcEUsY0FBYztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRztnQkFDMUIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsTUFBTSxFQUFFLElBQUk7YUFDYixDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssTUFBTTtRQUNaLE9BQU87UUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZCLE9BQU87UUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFM0MsY0FBYztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoQyxXQUFXO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBRXRDLFNBQVM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWhELFNBQVM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssR0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsU0FBUztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssR0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsU0FBUztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssR0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsU0FBUztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9B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LENBQUM7UUFDSCxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtZQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPO1lBQzNCLEdBQUcsRUFBRSxVQUFVLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLEVBQUU7U0FDcEUsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUTtZQUM1QixHQUFHLEVBQUUsVUFBVSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFO1NBQ3JFLENBQUMsQ0FBQztRQUVILE1BQU07UUFDTixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM3RCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDOUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzVELFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUU3RCxNQUFNO1FBQ04sTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2SixVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxSixVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwSixVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2SixNQUFNO1FBQ04sTUFB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QztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQ2xDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhemlJbmZvIH0gZnJvbSAnc3JjL3R5cGVzL0JhemlJbmZvJztcbmltcG9ydCB7IFNoZW5TaGFTZXJ2aWNlIH0gZnJvbSAnc3JjL3NlcnZpY2VzL1NoZW5TaGFTZXJ2aWNlJztcbmltcG9ydCB7IE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcblxuLyoqXG4gKiDlhavlrZflkb3nm5jop4blm77nu4Tku7ZcbiAqIOeUqOS6juWcqOeslOiusOS4rea4suafk+S6pOS6kuW8j+WFq+Wtl+WRveebmFxuICovXG5leHBvcnQgY2xhc3MgQmF6aVZpZXcge1xuICBwcml2YXRlIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgYmF6aUluZm86IEJhemlJbmZvO1xuICBwcml2YXRlIG9uU2V0dGluZ3NDbGljazogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiDliJvlu7rlhavlrZflkb3nm5jop4blm75cbiAgICogQHBhcmFtIGNvbnRhaW5lciDlrrnlmajlhYPntKBcbiAgICogQHBhcmFtIGJhemlJbmZvIOWFq+Wtl+S/oeaBr1xuICAgKiBAcGFyYW0gb25TZXR0aW5nc0NsaWNrIOiuvue9ruaMiemSrueCueWHu+Wbnuiwg1xuICAgKi9cbiAgY29uc3RydWN0b3IoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYmF6aUluZm86IEJhemlJbmZvLCBvblNldHRpbmdzQ2xpY2s6ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLmJhemlJbmZvID0gYmF6aUluZm87XG4gICAgdGhpcy5vblNldHRpbmdzQ2xpY2sgPSBvblNldHRpbmdzQ2xpY2s7XG4gICAgdGhpcy5pZCA9ICdiYXppLXZpZXctJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA5KTtcblxuICAgIC8vIOiuvue9rum7mOiupOeahOelnueFnuaYvuekuuiuvue9rlxuICAgIGlmICghdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSkge1xuICAgICAgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSA9IHtcbiAgICAgICAgc2laaHU6IHRydWUsXG4gICAgICAgIGRhWXVuOiB0cnVlLFxuICAgICAgICBsaXVOaWFuOiB0cnVlLFxuICAgICAgICB4aWFvWXVuOiB0cnVlLFxuICAgICAgICBsaXVZdWU6IHRydWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmuLLmn5PlhavlrZflkb3nm5hcbiAgICovXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIC8vIOa4heepuuWuueWZqFxuICAgIHRoaXMuY29udGFpbmVyLmVtcHR5KCk7XG5cbiAgICAvLyDmt7vliqDnsbvlkI1cbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDbGFzcygnYmF6aS12aWV3LWNvbnRhaW5lcicpO1xuICAgIHRoaXMuY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaWQnLCB0aGlzLmlkKTtcblxuICAgIC8vIOiwg+ivleS/oeaBr++8muajgOafpeelnueFnuaVsOaNrlxuICAgIGNvbnNvbGUubG9nKCflvIDlp4vmuLLmn5PlhavlrZflkb3nm5jvvIzmo4Dmn6XnpZ7nhZ7mlbDmja46Jyk7XG4gICAgLy8g5omL5Yqo5qOA5p+l56We54We5pWw5o2uXG4gICAgY29uc29sZS5sb2coJz09PT09PT0g56We54We5pWw5o2u5qOA5p+lID09PT09PT0nKTtcblxuICAgIC8vIOajgOafpeWbm+afseelnueFnlxuICAgIGNvbnNvbGUubG9nKCflubTmn7HnpZ7nhZ46JywgdGhpcy5iYXppSW5mby55ZWFyU2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+aciOafseelnueFnjonLCB0aGlzLmJhemlJbmZvLm1vbnRoU2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+aXpeafseelnueFnjonLCB0aGlzLmJhemlJbmZvLmRheVNoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfml7bmn7HnpZ7nhZ46JywgdGhpcy5iYXppSW5mby5ob3VyU2hlblNoYSk7XG5cbiAgICAvLyDmo4Dmn6XlpKfov5DnpZ7nhZ5cbiAgICBjb25zb2xlLmxvZygn5aSn6L+Q56We54We5pWw5o2uOicpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8uZGFZdW4pKSB7XG4gICAgICB0aGlzLmJhemlJbmZvLmRhWXVuLmZvckVhY2goKGR5LCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg5aSn6L+QJHtpbmRleCsxfSAoJHtkeS5nYW5aaGl9KSDnpZ7nhZ46YCwgZHkuc2hlblNoYSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ+Wkp+i/kOaVsOaNruS4jeaYr+aVsOe7hCcpO1xuICAgIH1cblxuICAgIC8vIOajgOafpea1geW5tOelnueFnlxuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mlbDmja46Jyk7XG4gICAgaWYgKHRoaXMuYmF6aUluZm8ubGl1TmlhbiAmJiB0aGlzLmJhemlJbmZvLmxpdU5pYW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5iYXppSW5mby5saXVOaWFuLmZvckVhY2goKGxuLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg5rWB5bm0JHtpbmRleCsxfSAoJHtsbi55ZWFyfSkg56We54WeOmAsIGxuLnNoZW5TaGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmtYHlubTmlbDmja7kuLrnqbonKTtcbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XlsI/ov5DnpZ7nhZ5cbiAgICBjb25zb2xlLmxvZygn5bCP6L+Q56We54We5pWw5o2uOicpO1xuICAgIGlmICh0aGlzLmJhemlJbmZvLnhpYW9ZdW4gJiYgdGhpcy5iYXppSW5mby54aWFvWXVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYmF6aUluZm8ueGlhb1l1bi5mb3JFYWNoKCh4eSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYOWwj+i/kCR7aW5kZXgrMX0gKCR7eHkueWVhcn0pIOelnueFnjpgLCB4eS5zaGVuU2hhKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygn5bCP6L+Q5pWw5o2u5Li656m6Jyk7XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5rWB5pyI56We54WeXG4gICAgY29uc29sZS5sb2coJ+a1geaciOelnueFnuaVsOaNrjonKTtcbiAgICBpZiAodGhpcy5iYXppSW5mby5saXVZdWUgJiYgdGhpcy5iYXppSW5mby5saXVZdWUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5iYXppSW5mby5saXVZdWUuZm9yRWFjaCgobHksIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIgke2luZGV4KzF9ICgke2x5Lm1vbnRofSkg56We54WeOmAsIGx5LnNoZW5TaGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmtYHmnIjmlbDmja7kuLrnqbonKTtcbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBjb25zb2xlLmxvZygn56We54We5pi+56S66K6+572uOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuXG4gICAgY29uc29sZS5sb2coJz09PT09PT0g56We54We5pWw5o2u5qOA5p+l57uT5p2fID09PT09PT0nKTtcblxuICAgIC8vIOWIm+W7uuWRveebmOWktOmDqFxuICAgIHRoaXMuY3JlYXRlSGVhZGVyKCk7XG5cbiAgICAvLyDliJvlu7rln7rmnKzkv6Hmga/ljLrln59cbiAgICB0aGlzLmNyZWF0ZUJhc2ljSW5mbygpO1xuXG4gICAgLy8g5Yib5bu65YWr5a2X6KGo5qC8XG4gICAgdGhpcy5jcmVhdGVCYXppVGFibGUoKTtcblxuICAgIC8vIOWIm+W7uuS6lOihjOWIhuaekFxuICAgIHRoaXMuY3JlYXRlV3VYaW5nQW5hbHlzaXMoKTtcblxuICAgIC8vIOWIm+W7uuWFtuS7luS/oeaBr1xuICAgIHRoaXMuY3JlYXRlT3RoZXJJbmZvKCk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65ZG955uY5aS06YOoXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUhlYWRlcigpIHtcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctaGVhZGVyJyB9KTtcblxuICAgIC8vIOagh+mimFxuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICflhavlrZflkb3nm5gnLCBjbHM6ICdiYXppLXZpZXctdGl0bGUnIH0pO1xuXG4gICAgLy8g6K6+572u5oyJ6ZKuXG4gICAgY29uc3Qgc2V0dGluZ3NCdXR0b24gPSBoZWFkZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIGNsczogJ2Jhemktdmlldy1zZXR0aW5ncy1idXR0b24nLFxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICforr7nva4nIH1cbiAgICB9KTtcbiAgICBzZXR0aW5nc0J1dHRvbi5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiPjwvY2lyY2xlPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxelwiPjwvcGF0aD48L3N2Zz4nO1xuXG4gICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgc2V0dGluZ3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMub25TZXR0aW5nc0NsaWNrKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65Z+65pys5L+h5oGv5Yy65Z+fXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhc2ljSW5mbygpIHtcbiAgICBjb25zdCBpbmZvU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktdmlldy1iYXNpYy1pbmZvJyB9KTtcblxuICAgIC8vIOWIm+W7uuS4pOWIl+W4g+WxgFxuICAgIGNvbnN0IGxlZnRDb2wgPSBpbmZvU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctY29sJyB9KTtcbiAgICBjb25zdCByaWdodENvbCA9IGluZm9TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1jb2wnIH0pO1xuXG4gICAgLy8g5bem5L6n77ya5YWs5Y6G5L+h5oGvXG4gICAgbGVmdENvbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg5YWs5Y6G77yaJHt0aGlzLmJhemlJbmZvLnNvbGFyRGF0ZX0gJHt0aGlzLmJhemlJbmZvLnNvbGFyVGltZX1gXG4gICAgfSk7XG5cbiAgICAvLyDlj7PkvqfvvJrlhpzljobkv6Hmga9cbiAgICByaWdodENvbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmF6aS12aWV3LWluZm8taXRlbScsXG4gICAgICB0ZXh0OiBg5Yac5Y6G77yaJHt0aGlzLmJhemlJbmZvLmx1bmFyRGF0ZX1gXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65YWr5a2X6KGo5qC8XG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUJhemlUYWJsZSgpIHtcbiAgICBjb25zdCB0YWJsZVNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG5cbiAgICAvLyDliJvlu7rooajmoLxcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2VjdGlvbi5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZScgfSk7XG5cbiAgICAvLyDliJvlu7rooajlpLRcbiAgICBjb25zdCB0aGVhZCA9IHRhYmxlLmNyZWF0ZUVsKCd0aGVhZCcpO1xuICAgIGNvbnN0IGhlYWRlclJvdyA9IHRoZWFkLmNyZWF0ZUVsKCd0cicpO1xuXG4gICAgWyflubTmn7EnLCAn5pyI5p+xJywgJ+aXpeafsScsICfml7bmn7EnXS5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgaGVhZGVyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dCB9KTtcbiAgICB9KTtcblxuICAgIC8vIOWIm+W7uuihqOS9k1xuICAgIGNvbnN0IHRib2R5ID0gdGFibGUuY3JlYXRlRWwoJ3Rib2R5Jyk7XG5cbiAgICAvLyDlpKnlubLooYxcbiAgICBjb25zdCBzdGVtUm93ID0gdGJvZHkuY3JlYXRlRWwoJ3RyJyk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLnllYXJTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLnllYXJXdVhpbmcgfHwgJycpfWBcbiAgICB9KTtcbiAgICBzdGVtUm93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgIHRleHQ6IHRoaXMuYmF6aUluZm8ubW9udGhTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLm1vbnRoV3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheVN0ZW0sXG4gICAgICBjbHM6IGB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKHRoaXMuYmF6aUluZm8uZGF5V3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG4gICAgc3RlbVJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICB0ZXh0OiB0aGlzLmJhemlJbmZvLmhvdXJTdGVtLFxuICAgICAgY2xzOiBgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLmhvdXJXdVhpbmcgfHwgJycpfWBcbiAgICB9KTtcblxuICAgIC8vIOWcsOaUr+ihjFxuICAgIGNvbnN0IGJyYW5jaFJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicpO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8ueWVhckJyYW5jaCB9KTtcbiAgICBicmFuY2hSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoQnJhbmNoIH0pO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uZGF5QnJhbmNoIH0pO1xuICAgIGJyYW5jaFJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IHRoaXMuYmF6aUluZm8uaG91ckJyYW5jaCB9KTtcblxuICAgIC8vIOiXj+W5suihjFxuICAgIGNvbnN0IGhpZGVHYW5Sb3cgPSB0Ym9keS5jcmVhdGVFbCgndHInKTtcbiAgICBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLnllYXJIaWRlR2FuKSA/IHRoaXMuYmF6aUluZm8ueWVhckhpZGVHYW4uam9pbignLCAnKSA6IHRoaXMuYmF6aUluZm8ueWVhckhpZGVHYW4gfHwgJycgfSk7XG4gICAgaGlkZUdhblJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4pID8gdGhpcy5iYXppSW5mby5tb250aEhpZGVHYW4uam9pbignLCAnKSA6IHRoaXMuYmF6aUluZm8ubW9udGhIaWRlR2FuIHx8ICcnIH0pO1xuICAgIGhpZGVHYW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBBcnJheS5pc0FycmF5KHRoaXMuYmF6aUluZm8uZGF5SGlkZUdhbikgPyB0aGlzLmJhemlJbmZvLmRheUhpZGVHYW4uam9pbignLCAnKSA6IHRoaXMuYmF6aUluZm8uZGF5SGlkZUdhbiB8fCAnJyB9KTtcbiAgICBoaWRlR2FuUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLmhvdXJIaWRlR2FuKSA/IHRoaXMuYmF6aUluZm8uaG91ckhpZGVHYW4uam9pbignLCAnKSA6IHRoaXMuYmF6aUluZm8uaG91ckhpZGVHYW4gfHwgJycgfSk7XG5cbiAgICAvLyDnurPpn7PooYxcbiAgICBjb25zdCBuYVlpblJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicpO1xuICAgIG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby55ZWFyTmFZaW4gfSk7XG4gICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLm1vbnRoTmFZaW4gfSk7XG4gICAgbmFZaW5Sb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB0aGlzLmJhemlJbmZvLmRheU5hWWluIH0pO1xuICAgIG5hWWluUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogdGhpcy5iYXppSW5mby5ob3VyTmFZaW4gfSk7XG5cbiAgICAvLyDnpZ7nhZ7ooYxcbiAgICBpZiAodGhpcy5iYXppSW5mby55ZWFyU2hlblNoYSB8fCB0aGlzLmJhemlJbmZvLm1vbnRoU2hlblNoYSB8fFxuICAgICAgICB0aGlzLmJhemlJbmZvLmRheVNoZW5TaGEgfHwgdGhpcy5iYXppSW5mby5ob3VyU2hlblNoYSkge1xuICAgICAgY29uc3Qgc2hlblNoYVJvdyA9IHRib2R5LmNyZWF0ZUVsKCd0cicpO1xuICAgICAgc2hlblNoYVJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93LXR5cGUnLCAnc2hlbnNoYS1yb3cnKTsgLy8g5re75Yqg5qCH6K+G5bGe5oCnXG5cbiAgICAgIC8vIOajgOafpeelnueFnuaYvuekuuiuvue9rlxuICAgICAgY29uc29sZS5sb2coJ+Wbm+afseelnueFnuaYvuekuuiuvue9rjonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICAgIGNvbnNvbGUubG9nKCflm5vmn7HnpZ7nhZ7mmL7npLrorr7nva7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgICAgY29uc29sZS5sb2coJ+Wbm+afseelnueFnuaYvuekuuiuvue9rnNpWmh1OicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LnNpWmh1KTtcbiAgICAgIGNvbnNvbGUubG9nKCflm5vmn7HnpZ7nhZ7mmL7npLrorr7nva5zaVpodeexu+WeizonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8uc2laaHUpO1xuXG4gICAgICAvLyDlvLrliLbmmL7npLrnpZ7nhZ7ooYxcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgICAgLy8g5qC55o2u6K6+572u5pi+56S65oiW6ZqQ6JeP56We54We6KGMXG4gICAgICBpZiAodGhpcy5iYXppSW5mby5zaG93U2hlblNoYSAmJiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhLnNpWmh1ID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLmxvZygn5qC55o2u6K6+572u6ZqQ6JeP5Zub5p+x56We54We6KGMJyk7XG4gICAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCflm5vmn7HnpZ7nhZ7ooYzlupTor6XmmL7npLonKTtcbiAgICAgICAgc2hlblNoYVJvdy5zdHlsZS5kaXNwbGF5ID0gJyc7IC8vIOehruS/neaYvuekulxuICAgICAgfVxuXG4gICAgICAvLyDlubTmn7HnpZ7nhZ5cbiAgICAgIGNvbnN0IHllYXJTaGVuU2hhQ2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICBjb25zb2xlLmxvZygn5bm05p+x56We54We5pWw5o2uOicsIHRoaXMuYmF6aUluZm8ueWVhclNoZW5TaGEpO1xuICAgICAgY29uc29sZS5sb2coJ+W5tOafseelnueFnuaVsOaNruexu+WeizonLCB0eXBlb2YgdGhpcy5iYXppSW5mby55ZWFyU2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZygn5bm05p+x56We54We5pWw5o2u5piv5ZCm5Li65pWw57uEOicsIEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby55ZWFyU2hlblNoYSkpO1xuICAgICAgY29uc29sZS5sb2coJ+W5tOafseelnueFnuaVsOaNrumVv+W6pjonLCB0aGlzLmJhemlJbmZvLnllYXJTaGVuU2hhID8gdGhpcy5iYXppSW5mby55ZWFyU2hlblNoYS5sZW5ndGggOiAwKTtcblxuICAgICAgLy8g56Gu5L+d56We54We5pWw5o2u5piv5pWw57uEXG4gICAgICBjb25zdCB5ZWFyU2hlblNoYSA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby55ZWFyU2hlblNoYSkgPyB0aGlzLmJhemlJbmZvLnllYXJTaGVuU2hhIDogW107XG5cbiAgICAgIGlmICh5ZWFyU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0geWVhclNoZW5TaGFDZWxsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2Jhemktc2hlbnNoYS1saXN0JyB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB5ZWFyU2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuW5tOafseesrCAke2krMX0g5Liq56We54WeOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gdGhpcy5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzaGVuU2hhSW5mbz8udHlwZSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFFbCA9IHNoZW5TaGFMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgICBjbHM6IGBiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31gLFxuICAgICAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICAgICAgJ3N0eWxlJzogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrICFpbXBvcnRhbnQ7IHBhZGRpbmc6MnB4IDRweCAhaW1wb3J0YW50OyBtYXJnaW46MnB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6M3B4ICFpbXBvcnRhbnQ7IGZvbnQtc2l6ZTowLjhlbSAhaW1wb3J0YW50OyBjdXJzb3I6cG9pbnRlciAhaW1wb3J0YW50OycsXG4gICAgICAgICAgICAgICAgJ2RhdGEtc2hlbnNoYSc6IHNoZW5TaGEsXG4gICAgICAgICAgICAgICAgJ2RhdGEtdHlwZSc6IHR5cGVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tuaYvuekuuelnueFnuivpuaDhVxuICAgICAgICAgICAgc2hlblNoYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYURldGFpbChzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign5aSE55CG5bm05p+x56We54We5Ye66ZSZOicsIGUpO1xuICAgICAgICAgIHllYXJTaGVuU2hhQ2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+W5tOafseayoeacieelnueFnuaVsOaNricpO1xuICAgICAgICB5ZWFyU2hlblNoYUNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIOaciOafseelnueFnlxuICAgICAgY29uc3QgbW9udGhTaGVuU2hhQ2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICBjb25zb2xlLmxvZygn5pyI5p+x56We54We5pWw5o2uOicsIHRoaXMuYmF6aUluZm8ubW9udGhTaGVuU2hhKTtcbiAgICAgIGNvbnNvbGUubG9nKCfmnIjmn7HnpZ7nhZ7mlbDmja7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8ubW9udGhTaGVuU2hhKTtcbiAgICAgIGNvbnNvbGUubG9nKCfmnIjmn7HnpZ7nhZ7mlbDmja7mmK/lkKbkuLrmlbDnu4Q6JywgQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLm1vbnRoU2hlblNoYSkpO1xuICAgICAgY29uc29sZS5sb2coJ+aciOafseelnueFnuaVsOaNrumVv+W6pjonLCB0aGlzLmJhemlJbmZvLm1vbnRoU2hlblNoYSA/IHRoaXMuYmF6aUluZm8ubW9udGhTaGVuU2hhLmxlbmd0aCA6IDApO1xuXG4gICAgICAvLyDnoa7kv53npZ7nhZ7mlbDmja7mmK/mlbDnu4RcbiAgICAgIGNvbnN0IG1vbnRoU2hlblNoYSA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5tb250aFNoZW5TaGEpID8gdGhpcy5iYXppSW5mby5tb250aFNoZW5TaGEgOiBbXTtcblxuICAgICAgaWYgKG1vbnRoU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gbW9udGhTaGVuU2hhQ2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbW9udGhTaGVuU2hhLmZvckVhY2goKHNoZW5TaGE6IHN0cmluZywgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG5pyI5p+x56ysICR7aSsxfSDkuKrnpZ7nhZ46ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSB0aGlzLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogYGJhemktc2hlbnNoYSAke2Nzc0NsYXNzfWAsXG4gICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgICAnZGF0YS1zaGVuc2hhJzogc2hlblNoYSxcbiAgICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpITnkIbmnIjmn7HnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICAgICAgbW9udGhTaGVuU2hhQ2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aciOafseayoeacieelnueFnuaVsOaNricpO1xuICAgICAgICBtb250aFNoZW5TaGFDZWxsLnNldFRleHQoJ+aXoOelnueFnicpO1xuICAgICAgfVxuXG4gICAgICAvLyDml6Xmn7HnpZ7nhZ5cbiAgICAgIGNvbnN0IGRheVNoZW5TaGFDZWxsID0gc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICAgIGNvbnNvbGUubG9nKCfml6Xmn7HnpZ7nhZ7mlbDmja46JywgdGhpcy5iYXppSW5mby5kYXlTaGVuU2hhKTtcbiAgICAgIGNvbnNvbGUubG9nKCfml6Xmn7HnpZ7nhZ7mlbDmja7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uZGF5U2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZygn5pel5p+x56We54We5pWw5o2u5piv5ZCm5Li65pWw57uEOicsIEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5kYXlTaGVuU2hhKSk7XG4gICAgICBjb25zb2xlLmxvZygn5pel5p+x56We54We5pWw5o2u6ZW/5bqmOicsIHRoaXMuYmF6aUluZm8uZGF5U2hlblNoYSA/IHRoaXMuYmF6aUluZm8uZGF5U2hlblNoYS5sZW5ndGggOiAwKTtcblxuICAgICAgLy8g56Gu5L+d56We54We5pWw5o2u5piv5pWw57uEXG4gICAgICBjb25zdCBkYXlTaGVuU2hhID0gQXJyYXkuaXNBcnJheSh0aGlzLmJhemlJbmZvLmRheVNoZW5TaGEpID8gdGhpcy5iYXppSW5mby5kYXlTaGVuU2hhIDogW107XG5cbiAgICAgIGlmIChkYXlTaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgc2hlblNoYUxpc3QgPSBkYXlTaGVuU2hhQ2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF5U2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuaXpeafseesrCAke2krMX0g5Liq56We54WeOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gdGhpcy5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzaGVuU2hhSW5mbz8udHlwZSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFFbCA9IHNoZW5TaGFMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgICBjbHM6IGBiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31gLFxuICAgICAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICAgICAgJ3N0eWxlJzogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrICFpbXBvcnRhbnQ7IHBhZGRpbmc6MnB4IDRweCAhaW1wb3J0YW50OyBtYXJnaW46MnB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6M3B4ICFpbXBvcnRhbnQ7IGZvbnQtc2l6ZTowLjhlbSAhaW1wb3J0YW50OyBjdXJzb3I6cG9pbnRlciAhaW1wb3J0YW50OycsXG4gICAgICAgICAgICAgICAgJ2RhdGEtc2hlbnNoYSc6IHNoZW5TaGEsXG4gICAgICAgICAgICAgICAgJ2RhdGEtdHlwZSc6IHR5cGVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tuaYvuekuuelnueFnuivpuaDhVxuICAgICAgICAgICAgc2hlblNoYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYURldGFpbChzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign5aSE55CG5pel5p+x56We54We5Ye66ZSZOicsIGUpO1xuICAgICAgICAgIGRheVNoZW5TaGFDZWxsLnNldFRleHQoJ+elnueFnuWkhOeQhumUmeivrycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygn5pel5p+x5rKh5pyJ56We54We5pWw5o2uJyk7XG4gICAgICAgIGRheVNoZW5TaGFDZWxsLnNldFRleHQoJ+aXoOelnueFnicpO1xuICAgICAgfVxuXG4gICAgICAvLyDml7bmn7HnpZ7nhZ5cbiAgICAgIGNvbnN0IGhvdXJTaGVuU2hhQ2VsbCA9IHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RkJyk7XG4gICAgICBjb25zb2xlLmxvZygn5pe25p+x56We54We5pWw5o2uOicsIHRoaXMuYmF6aUluZm8uaG91clNoZW5TaGEpO1xuICAgICAgY29uc29sZS5sb2coJ+aXtuafseelnueFnuaVsOaNruexu+WeizonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5ob3VyU2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZygn5pe25p+x56We54We5pWw5o2u5piv5ZCm5Li65pWw57uEOicsIEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5ob3VyU2hlblNoYSkpO1xuICAgICAgY29uc29sZS5sb2coJ+aXtuafseelnueFnuaVsOaNrumVv+W6pjonLCB0aGlzLmJhemlJbmZvLmhvdXJTaGVuU2hhID8gdGhpcy5iYXppSW5mby5ob3VyU2hlblNoYS5sZW5ndGggOiAwKTtcblxuICAgICAgLy8g56Gu5L+d56We54We5pWw5o2u5piv5pWw57uEXG4gICAgICBjb25zdCBob3VyU2hlblNoYSA9IEFycmF5LmlzQXJyYXkodGhpcy5iYXppSW5mby5ob3VyU2hlblNoYSkgPyB0aGlzLmJhemlJbmZvLmhvdXJTaGVuU2hhIDogW107XG5cbiAgICAgIGlmIChob3VyU2hlblNoYS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gaG91clNoZW5TaGFDZWxsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2Jhemktc2hlbnNoYS1saXN0JyB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBob3VyU2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuaXtuafseesrCAke2krMX0g5Liq56We54WeOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gdGhpcy5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzaGVuU2hhSW5mbz8udHlwZSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNoZW5TaGFFbCA9IHNoZW5TaGFMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgICBjbHM6IGBiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31gLFxuICAgICAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICAgICAgJ3N0eWxlJzogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrICFpbXBvcnRhbnQ7IHBhZGRpbmc6MnB4IDRweCAhaW1wb3J0YW50OyBtYXJnaW46MnB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6M3B4ICFpbXBvcnRhbnQ7IGZvbnQtc2l6ZTowLjhlbSAhaW1wb3J0YW50OyBjdXJzb3I6cG9pbnRlciAhaW1wb3J0YW50OycsXG4gICAgICAgICAgICAgICAgJ2RhdGEtc2hlbnNoYSc6IHNoZW5TaGEsXG4gICAgICAgICAgICAgICAgJ2RhdGEtdHlwZSc6IHR5cGVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tuaYvuekuuelnueFnuivpuaDhVxuICAgICAgICAgICAgc2hlblNoYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYURldGFpbChzaGVuU2hhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign5aSE55CG5pe25p+x56We54We5Ye66ZSZOicsIGUpO1xuICAgICAgICAgIGhvdXJTaGVuU2hhQ2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aXtuafseayoeacieelnueFnuaVsOaNricpO1xuICAgICAgICBob3VyU2hlblNoYUNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuS6lOihjOWIhuaekFxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVXdVhpbmdBbmFseXNpcygpIHtcbiAgICBjb25zdCB3dXhpbmdTZWN0aW9uID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXNlY3Rpb24nIH0pO1xuICAgIHd1eGluZ1NlY3Rpb24uY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAn5LqU6KGM5YiG5p6QJywgY2xzOiAnYmF6aS12aWV3LXN1YnRpdGxlJyB9KTtcblxuICAgIC8vIOi/memHjOWPr+S7pea3u+WKoOabtOivpue7hueahOS6lOihjOWIhuaekFxuICAgIC8vIOeugOWMlueJiOacrO+8jOWPquaYvuekuuWQhOS4quWkqeW5sueahOS6lOihjFxuICAgIGNvbnN0IHd1eGluZ0xpc3QgPSB3dXhpbmdTZWN0aW9uLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2Jhemktdmlldy13dXhpbmctbGlzdCcgfSk7XG5cbiAgICB3dXhpbmdMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgdGV4dDogYCR7dGhpcy5iYXppSW5mby55ZWFyU3RlbX0oJHt0aGlzLmJhemlJbmZvLnllYXJXdVhpbmd9KWAsXG4gICAgICBjbHM6IGB3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3ModGhpcy5iYXppSW5mby55ZWFyV3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG5cbiAgICB3dXhpbmdMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgdGV4dDogYCR7dGhpcy5iYXppSW5mby5tb250aFN0ZW19KCR7dGhpcy5iYXppSW5mby5tb250aFd1WGluZ30pYCxcbiAgICAgIGNsczogYHd1eGluZy10YWcgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyh0aGlzLmJhemlJbmZvLm1vbnRoV3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG5cbiAgICB3dXhpbmdMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgdGV4dDogYCR7dGhpcy5iYXppSW5mby5kYXlTdGVtfSgke3RoaXMuYmF6aUluZm8uZGF5V3VYaW5nfSlgLFxuICAgICAgY2xzOiBgd3V4aW5nLXRhZyB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKHRoaXMuYmF6aUluZm8uZGF5V3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG5cbiAgICB3dXhpbmdMaXN0LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgdGV4dDogYCR7dGhpcy5iYXppSW5mby5ob3VyU3RlbX0oJHt0aGlzLmJhemlJbmZvLmhvdXJXdVhpbmd9KWAsXG4gICAgICBjbHM6IGB3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3ModGhpcy5iYXppSW5mby5ob3VyV3VYaW5nIHx8ICcnKX1gXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65YW25LuW5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZU90aGVySW5mbygpIHtcbiAgICBjb25zdCBvdGhlclNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbicgfSk7XG4gICAgb3RoZXJTZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+eJueauiuS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICBjb25zdCBpbmZvTGlzdCA9IG90aGVyU2VjdGlvbi5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXZpZXctaW5mby1saXN0JyB9KTtcblxuICAgIGluZm9MaXN0LmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICBjbHM6ICdiYXppLXZpZXctaW5mby1pdGVtJyxcbiAgICAgIHRleHQ6IGDog47lhYPvvJoke3RoaXMuYmF6aUluZm8udGFpWXVhbn3vvIgke3RoaXMuYmF6aUluZm8udGFpWXVhbk5hWWlufe+8iWBcbiAgICB9KTtcblxuICAgIGluZm9MaXN0LmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICBjbHM6ICdiYXppLXZpZXctaW5mby1pdGVtJyxcbiAgICAgIHRleHQ6IGDlkb3lrqvvvJoke3RoaXMuYmF6aUluZm8ubWluZ0dvbmd977yIJHt0aGlzLmJhemlJbmZvLm1pbmdHb25nTmFZaW5977yJYFxuICAgIH0pO1xuXG4gICAgLy8g5re75Yqg5pes56m65L+h5oGvXG4gICAgaWYgKHRoaXMuYmF6aUluZm8ueWVhclh1bktvbmcgfHwgdGhpcy5iYXppSW5mby5tb250aFh1bktvbmcgfHxcbiAgICAgICAgdGhpcy5iYXppSW5mby5kYXlYdW5Lb25nIHx8IHRoaXMuYmF6aUluZm8udGltZVh1bktvbmcpIHtcbiAgICAgIGNvbnN0IHh1bktvbmdEaXYgPSBpbmZvTGlzdC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXZpZXctaW5mby1pdGVtJyB9KTtcbiAgICAgIHh1bktvbmdEaXYuaW5uZXJIVE1MID0gYOaXrOepuu+8muW5tCgke3RoaXMuYmF6aUluZm8ueWVhclh1bktvbmcgfHwgJ+aXoCd9KSDmnIgoJHt0aGlzLmJhemlJbmZvLm1vbnRoWHVuS29uZyB8fCAn5pegJ30pIOaXpSgke3RoaXMuYmF6aUluZm8uZGF5WHVuS29uZyB8fCAn5pegJ30pIOaXtigke3RoaXMuYmF6aUluZm8udGltZVh1bktvbmcgfHwgJ+aXoCd9KWA7XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65aSn6L+Q5L+h5oGvXG4gICAgdGhpcy5jcmVhdGVEYVl1bkluZm8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rlpKfov5Dkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgY3JlYXRlRGFZdW5JbmZvKCkge1xuICAgIGlmICghdGhpcy5iYXppSW5mby5kYVl1biB8fCB0aGlzLmJhemlJbmZvLmRhWXVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOWIm+W7uuWkp+i/kOmDqOWIhlxuICAgIGNvbnN0IGRhWXVuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uJyB9KTtcbiAgICBkYVl1blNlY3Rpb24uY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAn5aSn6L+Q5L+h5oGvJywgY2xzOiAnYmF6aS12aWV3LXN1YnRpdGxlJyB9KTtcblxuICAgIC8vIOWIm+W7uuWkp+i/kOihqOagvFxuICAgIGNvbnN0IHRhYmxlQ29udGFpbmVyID0gZGFZdW5TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIGNvbnN0IHRhYmxlID0gdGFibGVDb250YWluZXIuY3JlYXRlRWwoJ3RhYmxlJywgeyBjbHM6ICdiYXppLXZpZXctdGFibGUgYmF6aS12aWV3LWRheXVuLXRhYmxlJyB9KTtcblxuICAgIC8vIOiOt+WPluWkp+i/kOaVsOaNrlxuICAgIGNvbnN0IGRhWXVuRGF0YSA9IHRoaXMuYmF6aUluZm8uZGFZdW4gfHwgW107XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflpKfov5AnIH0pO1xuICAgIGNvbnN0IGRhWXVuQXJyYXkgPSBBcnJheS5pc0FycmF5KGRhWXVuRGF0YSkgPyBkYVl1bkRhdGEgOiBbXTtcbiAgICBkYVl1bkFycmF5LnNsaWNlKDAsIDEwKS5mb3JFYWNoKGR5ID0+IHtcbiAgICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBkeS5zdGFydFllYXIudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS6jOihjO+8muW5tOm+hFxuICAgIGNvbnN0IGFnZVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGFnZVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubTpvoQnIH0pO1xuICAgIGRhWXVuQXJyYXkuc2xpY2UoMCwgMTApLmZvckVhY2goZHkgPT4ge1xuICAgICAgYWdlUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogZHkuc3RhcnRBZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICBkYVl1bkFycmF5LnNsaWNlKDAsIDEwKS5mb3JFYWNoKChkeSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBnelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIHRleHQ6IGR5LmdhblpoaSxcbiAgICAgICAgY2xzOiAnYmF6aS1kYXl1bi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS1pbmRleCc6IGluZGV4LnRvU3RyaW5nKCkgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWRheXVuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5bm044CB5bCP6L+Q5ZKM5rWB5pyIXG4gICAgICAgIC8vIOS9v+eUqOWGheiBlOS7o+eggeabv+S7o+aWueazleiwg+eUqFxuICAgICAgICBjb25zdCBhbGxEYVl1biA9IHRoaXMuYmF6aUluZm8uZGFZdW4gfHwgW107XG4gICAgICAgIGNvbnN0IGFsbExpdU5pYW4gPSB0aGlzLmJhemlJbmZvLmxpdU5pYW4gfHwgW107XG4gICAgICAgIGNvbnN0IGFsbFhpYW9ZdW4gPSB0aGlzLmJhemlJbmZvLnhpYW9ZdW4gfHwgW107XG4gICAgICAgIGNvbnN0IGFsbExpdVl1ZSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlIHx8IFtdO1xuXG4gICAgICAgIC8vIOagueaNrumAieaLqeeahOWkp+i/kOe0ouW8le+8jOetm+mAieWvueW6lOeahOa1geW5tOOAgeWwj+i/kOWSjOa1geaciFxuICAgICAgICBjb25zdCBzZWxlY3RlZERhWXVuID0gYWxsRGFZdW5baW5kZXhdO1xuICAgICAgICBpZiAoIXNlbGVjdGVkRGFZdW4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYOacquaJvuWIsOe0ouW8leS4uiAke2luZGV4fSDnmoTlpKfov5DmlbDmja5gKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmo4Dmn6VzZWxlY3RlZERhWXVu5piv5ZCm5Li65a2X56ym5LiyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0ZWREYVl1biA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYOWkp+i/kOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2Ygc2VsZWN0ZWREYVl1bn1gKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnrZvpgInor6XlpKfov5Dlr7nlupTnmoTmtYHlubRcbiAgICAgICAgY29uc3QgZmlsdGVyZWRMaXVOaWFuID0gYWxsTGl1Tmlhbi5maWx0ZXIobG4gPT4ge1xuICAgICAgICAgIHJldHVybiBsbi55ZWFyID49IHNlbGVjdGVkRGFZdW4uc3RhcnRZZWFyICYmIGxuLnllYXIgPD0gKHNlbGVjdGVkRGFZdW4uZW5kWWVhciB8fCBJbmZpbml0eSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOetm+mAieivpeWkp+i/kOWvueW6lOeahOWwj+i/kFxuICAgICAgICBjb25zdCBmaWx0ZXJlZFhpYW9ZdW4gPSBhbGxYaWFvWXVuLmZpbHRlcih4eSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHh5LnllYXIgPj0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXIgJiYgeHkueWVhciA8PSAoc2VsZWN0ZWREYVl1bi5lbmRZZWFyIHx8IEluZmluaXR5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5bm06KGo5qC8XG4gICAgICAgIHRoaXMudXBkYXRlTGl1TmlhblRhYmxlKGZpbHRlcmVkTGl1Tmlhbik7XG5cbiAgICAgICAgLy8g5pu05paw5bCP6L+Q6KGo5qC8XG4gICAgICAgIHRoaXMudXBkYXRlWGlhb1l1blRhYmxlKGZpbHRlcmVkWGlhb1l1bik7XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJ5rWB5bm077yM5pu05paw5rWB5pyI6KGo5qC877yI5Y+W5omA5pyJ5rWB5pyI77yJXG4gICAgICAgIGlmIChmaWx0ZXJlZExpdU5pYW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIOeUseS6jua1geaciOWvueixoeayoeaciXllYXLlsZ7mgKfvvIzmiJHku6znm7TmjqXkvb/nlKjmiYDmnInmtYHmnIjmlbDmja5cbiAgICAgICAgICB0aGlzLnVwZGF0ZUxpdVl1ZVRhYmxlKGFsbExpdVl1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5Zub6KGM77ya56We54WeXG4gICAgY29uc3Qgc2hlblNoYVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn56We54WeJyB9KTtcbiAgICBzaGVuU2hhUm93LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3ctdHlwZScsICdzaGVuc2hhLXJvdycpOyAvLyDmt7vliqDmoIfor4blsZ7mgKdcblxuICAgIC8vIOajgOafpeelnueFnuaYvuekuuiuvue9rlxuICAgIGNvbnNvbGUubG9nKCflpKfov5DnpZ7nhZ7mmL7npLrorr7nva46JywgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+Wkp+i/kOelnueFnuaYvuekuuiuvue9ruexu+WeizonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+Wkp+i/kOelnueFnuaYvuekuuiuvue9rmRhWXVuOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LmRhWXVuKTtcbiAgICBjb25zb2xlLmxvZygn5aSn6L+Q56We54We5pi+56S66K6+572uZGFZdW7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LmRhWXVuKTtcblxuICAgIC8vIOW8uuWItuaYvuekuuelnueFnuihjFxuICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgIC8vIOagueaNruiuvue9ruaYvuekuuaIlumakOiXj+elnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEuZGFZdW4gPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZygn5qC55o2u6K6+572u6ZqQ6JeP5aSn6L+Q56We54We6KGMJyk7XG4gICAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCflpKfov5DnpZ7nhZ7ooYzlupTor6XmmL7npLonKTtcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcbiAgICB9XG5cbiAgICBkYVl1bkFycmF5LnNsaWNlKDAsIDEwKS5mb3JFYWNoKChkeSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgY29uc29sZS5sb2coYOWkhOeQhuWkp+i/kCAke2R5LmdhblpoaX0gKOe0ouW8lTogJHtpbmRleH0pIOeahOelnueFnuaVsOaNrjpgLCBkeS5zaGVuU2hhKTtcbiAgICAgIGNvbnNvbGUubG9nKGDlpKfov5DmlbDmja7nsbvlnovmo4Dmn6UgLSBzaGVuU2hh5piv5ZCm5a2Y5ZyoOiAke2R5LnNoZW5TaGEgIT09IHVuZGVmaW5lZH0sIOaYr+WQpuS4uuaVsOe7hDogJHtBcnJheS5pc0FycmF5KGR5LnNoZW5TaGEpfSwg6ZW/5bqmOiAke2R5LnNoZW5TaGEgPyBkeS5zaGVuU2hhLmxlbmd0aCA6IDB9YCk7XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuepuuaIlnVuZGVmaW5lZFxuICAgICAgaWYgKCFkeS5zaGVuU2hhKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihg5aSn6L+QICR7ZHkuZ2FuWmhpfSDnmoTnpZ7nhZ7mlbDmja7kuLrnqbrmiJZ1bmRlZmluZWRgKTtcbiAgICAgICAgY2VsbC5zZXRUZXh0KCfml6DnpZ7nhZ7mlbDmja4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyDmo4Dmn6XnpZ7nhZ7mlbDmja7mmK/lkKbkuLrmlbDnu4RcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkeS5zaGVuU2hhKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDlpKfov5AgJHtkeS5nYW5aaGl9IOeahOelnueFnuaVsOaNruS4jeaYr+aVsOe7hO+8jOiAjOaYryAke3R5cGVvZiBkeS5zaGVuU2hhfWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgZHkuc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZHkuc2hlblNoYSAmJiBkeS5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgIGNvbnNvbGUubG9nKGDlpKfov5DnpZ7nhZ7mlbDmja46YCwgZHkuc2hlblNoYSk7XG5cbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZHkuc2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuWkp+i/kCAke2R5LmdhblpoaX0g55qE56ysICR7aSsxfSDkuKrnpZ7nhZ46ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSB0aGlzLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogYGJhemktc2hlbnNoYSAke2Nzc0NsYXNzfWAsXG4gICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgICAnZGF0YS1zaGVuc2hhJzogc2hlblNoYSxcbiAgICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpITnkIblpKfov5DnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICAgICAgY2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYOWkp+i/kCAke2R5LmdhblpoaX0g5rKh5pyJ56We54We5pWw5o2uYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDliJvlu7rmtYHlubTkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZUxpdU5pYW5JbmZvKCk7XG5cbiAgICAvLyDliJvlu7rlsI/ov5Dkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZVhpYW9ZdW5JbmZvKCk7XG5cbiAgICAvLyDliJvlu7rmtYHmnIjkv6Hmga9cbiAgICB0aGlzLmNyZWF0ZUxpdVl1ZUluZm8oKTtcblxuICAgIC8vIOm7mOiupOmAieS4reesrOS4gOS4quWkp+i/kFxuICAgIGlmICh0aGlzLmJhemlJbmZvLmRhWXVuICYmIHRoaXMuYmF6aUluZm8uZGFZdW4ubGVuZ3RoID4gMCkge1xuICAgICAgLy8g5L2/55So5YaF6IGU5Luj56CB5pu/5Luj5pa55rOV6LCD55SoXG4gICAgICBjb25zdCBpbmRleCA9IDA7XG4gICAgICBjb25zdCBhbGxEYVl1biA9IHRoaXMuYmF6aUluZm8uZGFZdW4gfHwgW107XG4gICAgICBjb25zdCBhbGxMaXVOaWFuID0gdGhpcy5iYXppSW5mby5saXVOaWFuIHx8IFtdO1xuICAgICAgY29uc3QgYWxsWGlhb1l1biA9IHRoaXMuYmF6aUluZm8ueGlhb1l1biB8fCBbXTtcbiAgICAgIGNvbnN0IGFsbExpdVl1ZSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlIHx8IFtdO1xuXG4gICAgICAvLyDmoLnmja7pgInmi6nnmoTlpKfov5DntKLlvJXvvIznrZvpgInlr7nlupTnmoTmtYHlubTjgIHlsI/ov5DlkozmtYHmnIhcbiAgICAgIGNvbnN0IHNlbGVjdGVkRGFZdW4gPSBhbGxEYVl1bltpbmRleF07XG4gICAgICBpZiAoIXNlbGVjdGVkRGFZdW4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGDmnKrmib7liLDntKLlvJXkuLogJHtpbmRleH0g55qE5aSn6L+Q5pWw5o2uYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8g5qOA5p+lc2VsZWN0ZWREYVl1buaYr+WQpuS4uuWtl+espuS4slxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RlZERhWXVuID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zb2xlLndhcm4oYOWkp+i/kOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2Ygc2VsZWN0ZWREYVl1bn1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyDnrZvpgInor6XlpKfov5Dlr7nlupTnmoTmtYHlubRcbiAgICAgIGNvbnN0IGZpbHRlcmVkTGl1TmlhbiA9IGFsbExpdU5pYW4uZmlsdGVyKGxuID0+IHtcbiAgICAgICAgcmV0dXJuIGxuLnllYXIgPj0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXIgJiYgbG4ueWVhciA8PSAoc2VsZWN0ZWREYVl1bi5lbmRZZWFyIHx8IEluZmluaXR5KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyDnrZvpgInor6XlpKfov5Dlr7nlupTnmoTlsI/ov5BcbiAgICAgIGNvbnN0IGZpbHRlcmVkWGlhb1l1biA9IGFsbFhpYW9ZdW4uZmlsdGVyKHh5ID0+IHtcbiAgICAgICAgcmV0dXJuIHh5LnllYXIgPj0gc2VsZWN0ZWREYVl1bi5zdGFydFllYXIgJiYgeHkueWVhciA8PSAoc2VsZWN0ZWREYVl1bi5lbmRZZWFyIHx8IEluZmluaXR5KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyDmm7TmlrDmtYHlubTooajmoLxcbiAgICAgIHRoaXMudXBkYXRlTGl1TmlhblRhYmxlKGZpbHRlcmVkTGl1Tmlhbik7XG5cbiAgICAgIC8vIOabtOaWsOWwj+i/kOihqOagvFxuICAgICAgdGhpcy51cGRhdGVYaWFvWXVuVGFibGUoZmlsdGVyZWRYaWFvWXVuKTtcblxuICAgICAgLy8g5aaC5p6c5pyJ5rWB5bm077yM5pu05paw5rWB5pyI6KGo5qC877yI5Y+W5omA5pyJ5rWB5pyI77yJXG4gICAgICBpZiAoZmlsdGVyZWRMaXVOaWFuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g55Sx5LqO5rWB5pyI5a+56LGh5rKh5pyJeWVhcuWxnuaAp++8jOaIkeS7rOebtOaOpeS9v+eUqOaJgOaciea1geaciOaVsOaNrlxuICAgICAgICB0aGlzLnVwZGF0ZUxpdVl1ZVRhYmxlKGFsbExpdVl1ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOmrmOS6rumAieS4reeahOWkp+i/kOihjFxuICAgICAgY29uc3QgZGFZdW5UYWJsZSA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctZGF5dW4tdGFibGUnKTtcbiAgICAgIGlmIChkYVl1blRhYmxlKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBkYVl1blRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3Rib2R5IHRyJyk7XG4gICAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4gcm93LnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3cgPSBkYVl1blRhYmxlLnF1ZXJ5U2VsZWN0b3IoYHRib2R5IHRyW2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApO1xuICAgICAgICBpZiAoc2VsZWN0ZWRSb3cpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvdy5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDliJvlu7rmtYHlubTkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgY3JlYXRlTGl1TmlhbkluZm8oKSB7XG4gICAgaWYgKCF0aGlzLmJhemlJbmZvLmxpdU5pYW4gfHwgdGhpcy5iYXppSW5mby5saXVOaWFuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coJ+ayoeaciea1geW5tOaVsOaNru+8jOi3s+i/h+WIm+W7uua1geW5tOS/oeaBrycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCflvIDlp4vliJvlu7rmtYHlubTkv6Hmga/vvIzmlbDmja7plb/luqY6JywgdGhpcy5iYXppSW5mby5saXVOaWFuLmxlbmd0aCk7XG4gICAgY29uc29sZS5sb2coJ+a1geW5tOaVsOaNruekuuS+izonLCB0aGlzLmJhemlJbmZvLmxpdU5pYW5bMF0pO1xuXG4gICAgLy8g5Yib5bu65rWB5bm06YOo5YiGXG4gICAgY29uc3QgbGl1TmlhblNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctc2VjdGlvbiBiYXppLWxpdW5pYW4tc2VjdGlvbicgfSk7XG4gICAgbGl1TmlhblNlY3Rpb24uc2V0QXR0cmlidXRlKCdkYXRhLWJhemktaWQnLCB0aGlzLmlkKTtcbiAgICBsaXVOaWFuU2VjdGlvbi5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICfmtYHlubTkv6Hmga8nLCBjbHM6ICdiYXppLXZpZXctc3VidGl0bGUnIH0pO1xuXG4gICAgLy8g5Yib5bu65rWB5bm06KGo5qC8XG4gICAgY29uc3QgdGFibGVDb250YWluZXIgPSBsaXVOaWFuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXZpZXctdGFibGUtY29udGFpbmVyJyB9KTtcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlQ29udGFpbmVyLmNyZWF0ZUVsKCd0YWJsZScsIHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXVuaWFuLXRhYmxlJyB9KTtcblxuICAgIC8vIOiOt+WPlua1geW5tOaVsOaNrlxuICAgIGNvbnN0IGxpdU5pYW5EYXRhID0gdGhpcy5iYXppSW5mby5saXVOaWFuIHx8IFtdO1xuXG4gICAgLy8g56ys5LiA6KGM77ya5bm05Lu9XG4gICAgY29uc3QgeWVhclJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5rWB5bm0JyB9KTtcbiAgICBsaXVOaWFuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4ueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgbGl1TmlhbkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgYWdlUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4uYWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgbGl1TmlhbkRhdGEuc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgY29uc3QgY2VsbCA9IGd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgdGV4dDogbG4uZ2FuWmhpLFxuICAgICAgICBjbHM6ICdiYXppLWxpdW5pYW4tY2VsbCcsXG4gICAgICAgIGF0dHI6IHsgJ2RhdGEteWVhcic6IGxuLnllYXIudG9TdHJpbmcoKSB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAvLyDpq5jkuq7pgInkuK3nmoTljZXlhYPmoLxcbiAgICAgICAgdGFibGUucXVlcnlTZWxlY3RvckFsbCgnLmJhemktbGl1bmlhbi1jZWxsJykuZm9yRWFjaChjID0+IGMucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykpO1xuICAgICAgICBjZWxsLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXG4gICAgICAgIC8vIOabtOaWsOa1geaciFxuICAgICAgICB0aGlzLmhhbmRsZUxpdU5pYW5TZWxlY3QobG4ueWVhcik7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOWbm+ihjO+8muelnueFnlxuICAgIGNvbnN0IHNoZW5TaGFSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+elnueFnicgfSk7XG4gICAgc2hlblNoYVJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93LXR5cGUnLCAnc2hlbnNoYS1yb3cnKTsgLy8g5re75Yqg5qCH6K+G5bGe5oCnXG5cbiAgICAvLyDmo4Dmn6XnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBjb25zb2xlLmxvZygn5rWB5bm056We54We5pi+56S66K6+572uOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mmL7npLrorr7nva7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mmL7npLrorr7nva5saXVOaWFuOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LmxpdU5pYW4pO1xuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mmL7npLrorr7nva5saXVOaWFu57G75Z6LOicsIHR5cGVvZiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhPy5saXVOaWFuKTtcblxuICAgIC8vIOW8uuWItuaYvuekuuelnueFnuihjFxuICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgIC8vIOagueaNruiuvue9ruaYvuekuuaIlumakOiXj+elnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEubGl1TmlhbiA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmoLnmja7orr7nva7pmpDol4/mtYHlubTnpZ7nhZ7ooYwnKTtcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ+a1geW5tOelnueFnuihjOW6lOivpeaYvuekuicpO1xuICAgICAgc2hlblNoYVJvdy5zdHlsZS5kaXNwbGF5ID0gJyc7IC8vIOehruS/neaYvuekulxuICAgIH1cblxuICAgIGxpdU5pYW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKChsbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgY29uc29sZS5sb2coYOWkhOeQhua1geW5tCAke2xuLnllYXJ9ICjntKLlvJU6ICR7aW5kZXh9KSDnmoTnpZ7nhZ7mlbDmja46YCwgbG4uc2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZyhg5rWB5bm05pWw5o2u57G75Z6L5qOA5p+lIC0gc2hlblNoYeaYr+WQpuWtmOWcqDogJHtsbi5zaGVuU2hhICE9PSB1bmRlZmluZWR9LCDmmK/lkKbkuLrmlbDnu4Q6ICR7QXJyYXkuaXNBcnJheShsbi5zaGVuU2hhKX0sIOmVv+W6pjogJHtsbi5zaGVuU2hhID8gbG4uc2hlblNoYS5sZW5ndGggOiAwfWApO1xuXG4gICAgICAvLyDmo4Dmn6XnpZ7nhZ7mlbDmja7mmK/lkKbkuLrnqbrmiJZ1bmRlZmluZWRcbiAgICAgIGlmICghbG4uc2hlblNoYSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYOa1geW5tCAke2xuLnllYXJ9IOeahOelnueFnuaVsOaNruS4uuepuuaIlnVuZGVmaW5lZGApO1xuICAgICAgICBjZWxsLnNldFRleHQoJ+aXoOelnueFnuaVsOaNricpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuaVsOe7hFxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxuLnNoZW5TaGEpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOa1geW5tCAke2xuLnllYXJ9IOeahOelnueFnuaVsOaNruS4jeaYr+aVsOe7hO+8jOiAjOaYryAke3R5cGVvZiBsbi5zaGVuU2hhfWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgbG4uc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobG4uc2hlblNoYSAmJiBsbi5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIGxuLnNoZW5TaGEuZm9yRWFjaCgoc2hlblNoYTogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG5rWB5bm0ICR7bG4ueWVhcn0g55qE56ysICR7aSsxfSDkuKrnpZ7nhZ46ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gdGhpcy5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcbiAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG4gICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzaGVuU2hhRWwgPSBzaGVuU2hhTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICBjbHM6IGBiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31gLFxuICAgICAgICAgICAgYXR0cjoge1xuICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgJ2RhdGEtc2hlbnNoYSc6IHNoZW5TaGEsXG4gICAgICAgICAgICAgICdkYXRhLXR5cGUnOiB0eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7bmmL7npLrnpZ7nhZ7or6bmg4VcbiAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFEZXRhaWwoc2hlblNoYSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYOa1geW5tCAke2xuLnllYXJ9IOayoeacieelnueFnuaVsOaNrmApO1xuICAgICAgICBjZWxsLnNldFRleHQoJ+aXoOelnueFnicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ+a1geW5tOS/oeaBr+WIm+W7uuWujOaIkCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWwj+i/kOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVYaWFvWXVuSW5mbygpIHtcbiAgICBpZiAoIXRoaXMuYmF6aUluZm8ueGlhb1l1biB8fCB0aGlzLmJhemlJbmZvLnhpYW9ZdW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZygn5rKh5pyJ5bCP6L+Q5pWw5o2u77yM6Lez6L+H5Yib5bu65bCP6L+Q5L+h5oGvJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ+W8gOWni+WIm+W7uuWwj+i/kOS/oeaBr++8jOaVsOaNrumVv+W6pjonLCB0aGlzLmJhemlJbmZvLnhpYW9ZdW4ubGVuZ3RoKTtcbiAgICBjb25zb2xlLmxvZygn5bCP6L+Q5pWw5o2u56S65L6LOicsIHRoaXMuYmF6aUluZm8ueGlhb1l1blswXSk7XG5cbiAgICAvLyDliJvlu7rlsI/ov5Dpg6jliIZcbiAgICBjb25zdCB4aWFvWXVuU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemkteGlhb3l1bi1zZWN0aW9uJyB9KTtcbiAgICB4aWFvWXVuU2VjdGlvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtYmF6aS1pZCcsIHRoaXMuaWQpO1xuICAgIHhpYW9ZdW5TZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+Wwj+i/kOS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rlsI/ov5DooajmoLxcbiAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IHhpYW9ZdW5TZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy10YWJsZS1jb250YWluZXInIH0pO1xuICAgIGNvbnN0IHRhYmxlID0gdGFibGVDb250YWluZXIuY3JlYXRlRWwoJ3RhYmxlJywgeyBjbHM6ICdiYXppLXZpZXctdGFibGUgYmF6aS12aWV3LXhpYW95dW4tdGFibGUnIH0pO1xuXG4gICAgLy8g6I635Y+W5bCP6L+Q5pWw5o2uXG4gICAgY29uc3QgeGlhb1l1bkRhdGEgPSB0aGlzLmJhemlJbmZvLnhpYW9ZdW4gfHwgW107XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflsI/ov5AnIH0pO1xuICAgIHhpYW9ZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKHh5ID0+IHtcbiAgICAgIHllYXJSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB4eS55ZWFyLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubTpvoRcbiAgICBjb25zdCBhZ2VSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bm06b6EJyB9KTtcbiAgICB4aWFvWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB4eS5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICB4aWFvWXVuRGF0YS5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiB4eS5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemkteGlhb3l1bi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogeHkueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIOmrmOS6rumAieS4reeahOWNleWFg+agvFxuICAgICAgICB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS14aWFveXVuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOWbm+ihjO+8muelnueFnlxuICAgIGNvbnN0IHNoZW5TaGFSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+elnueFnicgfSk7XG4gICAgc2hlblNoYVJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93LXR5cGUnLCAnc2hlbnNoYS1yb3cnKTsgLy8g5re75Yqg5qCH6K+G5bGe5oCnXG5cbiAgICAvLyDmo4Dmn6XnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBjb25zb2xlLmxvZygn5bCP6L+Q56We54We5pi+56S66K6+572uOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7mmL7npLrorr7nva7nsbvlnos6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7mmL7npLrorr7nva54aWFvWXVuOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LnhpYW9ZdW4pO1xuICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7mmL7npLrorr7nva54aWFvWXVu57G75Z6LOicsIHR5cGVvZiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhPy54aWFvWXVuKTtcblxuICAgIC8vIOW8uuWItuaYvuekuuelnueFnuihjFxuICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgIC8vIOagueaNruiuvue9ruaYvuekuuaIlumakOiXj+elnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEueGlhb1l1biA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmoLnmja7orr7nva7pmpDol4/lsI/ov5DnpZ7nhZ7ooYwnKTtcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ+Wwj+i/kOelnueFnuihjOW6lOivpeaYvuekuicpO1xuICAgICAgc2hlblNoYVJvdy5zdHlsZS5kaXNwbGF5ID0gJyc7IC8vIOehruS/neaYvuekulxuICAgIH1cblxuICAgIHhpYW9ZdW5EYXRhLnNsaWNlKDAsIDEwKS5mb3JFYWNoKCh4eSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgY29uc29sZS5sb2coYOWkhOeQhuWwj+i/kCAke3h5LnllYXJ9ICjntKLlvJU6ICR7aW5kZXh9KSDnmoTnpZ7nhZ7mlbDmja46YCwgeHkuc2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZyhg5bCP6L+Q5pWw5o2u57G75Z6L5qOA5p+lIC0gc2hlblNoYeaYr+WQpuWtmOWcqDogJHt4eS5zaGVuU2hhICE9PSB1bmRlZmluZWR9LCDmmK/lkKbkuLrmlbDnu4Q6ICR7QXJyYXkuaXNBcnJheSh4eS5zaGVuU2hhKX0sIOmVv+W6pjogJHt4eS5zaGVuU2hhID8geHkuc2hlblNoYS5sZW5ndGggOiAwfWApO1xuXG4gICAgICAvLyDmo4Dmn6XnpZ7nhZ7mlbDmja7mmK/lkKbkuLrnqbrmiJZ1bmRlZmluZWRcbiAgICAgIGlmICgheHkuc2hlblNoYSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYOWwj+i/kCAke3h5LnllYXJ9IOeahOelnueFnuaVsOaNruS4uuepuuaIlnVuZGVmaW5lZGApO1xuICAgICAgICBjZWxsLnNldFRleHQoJ+aXoOelnueFnuaVsOaNricpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuaVsOe7hFxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHh5LnNoZW5TaGEpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOWwj+i/kCAke3h5LnllYXJ9IOeahOelnueFnuaVsOaNruS4jeaYr+aVsOe7hO+8jOiAjOaYryAke3R5cGVvZiB4eS5zaGVuU2hhfWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgeHkuc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoeHkuc2hlblNoYSAmJiB4eS5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHh5LnNoZW5TaGEuZm9yRWFjaCgoc2hlblNoYTogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG5bCP6L+QICR7eHkueWVhcn0g55qE56ysICR7aSsxfSDkuKrnpZ7nhZ46ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgIGNvbnN0IHNoZW5TaGFJbmZvID0gdGhpcy5nZXRTaGVuU2hhSW5mbyhzaGVuU2hhKTtcbiAgICAgICAgICBjb25zdCB0eXBlID0gc2hlblNoYUluZm8/LnR5cGUgfHwgJ+acquefpSc7XG4gICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzaGVuU2hhRWwgPSBzaGVuU2hhTGlzdC5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICBjbHM6IGBiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31gLFxuICAgICAgICAgICAgYXR0cjoge1xuICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgJ2RhdGEtc2hlbnNoYSc6IHNoZW5TaGEsXG4gICAgICAgICAgICAgICdkYXRhLXR5cGUnOiB0eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7bmmL7npLrnpZ7nhZ7or6bmg4VcbiAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGFEZXRhaWwoc2hlblNoYSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYOWwj+i/kCAke3h5LnllYXJ9IOayoeacieelnueFnuaVsOaNrmApO1xuICAgICAgICBjZWxsLnNldFRleHQoJ+aXoOelnueFnicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ+Wwj+i/kOS/oeaBr+WIm+W7uuWujOaIkCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIm+W7uua1geaciOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVMaXVZdWVJbmZvKCkge1xuICAgIGlmICghdGhpcy5iYXppSW5mby5saXVZdWUgfHwgdGhpcy5iYXppSW5mby5saXVZdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZygn5rKh5pyJ5rWB5pyI5pWw5o2u77yM6Lez6L+H5Yib5bu65rWB5pyI5L+h5oGvJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ+W8gOWni+WIm+W7uua1geaciOS/oeaBr++8jOaVsOaNrumVv+W6pjonLCB0aGlzLmJhemlJbmZvLmxpdVl1ZS5sZW5ndGgpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHmnIjmlbDmja7npLrkvos6JywgdGhpcy5iYXppSW5mby5saXVZdWVbMF0pO1xuXG4gICAgLy8g5Yib5bu65rWB5pyI6YOo5YiGXG4gICAgY29uc3QgbGl1WXVlU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2Jhemktdmlldy1zZWN0aW9uIGJhemktbGl1eXVlLXNlY3Rpb24nIH0pO1xuICAgIGxpdVl1ZVNlY3Rpb24uc2V0QXR0cmlidXRlKCdkYXRhLWJhemktaWQnLCB0aGlzLmlkKTtcbiAgICBsaXVZdWVTZWN0aW9uLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ+a1geaciOS/oeaBrycsIGNsczogJ2Jhemktdmlldy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDliJvlu7rmtYHmnIjooajmoLxcbiAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IGxpdVl1ZVNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiAnYmF6aS12aWV3LXRhYmxlLWNvbnRhaW5lcicgfSk7XG4gICAgY29uc3QgdGFibGUgPSB0YWJsZUNvbnRhaW5lci5jcmVhdGVFbCgndGFibGUnLCB7IGNsczogJ2Jhemktdmlldy10YWJsZSBiYXppLXZpZXctbGl1eXVlLXRhYmxlJyB9KTtcblxuICAgIC8vIOiOt+WPlua1geaciOaVsOaNrlxuICAgIGNvbnN0IGxpdVl1ZURhdGEgPSB0aGlzLmJhemlJbmZvLmxpdVl1ZSB8fCBbXTtcblxuICAgIC8vIOesrOS4gOihjO+8muaciOS7vVxuICAgIGNvbnN0IG1vbnRoUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgbW9udGhSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5rWB5pyIJyB9KTtcbiAgICBsaXVZdWVEYXRhLmZvckVhY2gobHkgPT4ge1xuICAgICAgbW9udGhSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiBseS5tb250aC50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bmy5pSvXG4gICAgY29uc3QgZ3pSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBnelJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubLmlK8nIH0pO1xuICAgIGxpdVl1ZURhdGEuZm9yRWFjaChseSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBseS5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1eXVlLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLW1vbnRoJzogbHkubW9udGggfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLWxpdXl1ZS1jZWxsJykuZm9yRWFjaChjID0+IGMucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykpO1xuICAgICAgICBjZWxsLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrnpZ7nhZ5cbiAgICBjb25zdCBzaGVuU2hhUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgc2hlblNoYVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfnpZ7nhZ4nIH0pO1xuICAgIHNoZW5TaGFSb3cuc2V0QXR0cmlidXRlKCdkYXRhLXJvdy10eXBlJywgJ3NoZW5zaGEtcm93Jyk7IC8vIOa3u+WKoOagh+ivhuWxnuaAp1xuXG4gICAgLy8g5qOA5p+l56We54We5pi+56S66K6+572uXG4gICAgY29uc29sZS5sb2coJ+a1geaciOelnueFnuaYvuekuuiuvue9rjonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICBjb25zb2xlLmxvZygn5rWB5pyI56We54We5pi+56S66K6+572u57G75Z6LOicsIHR5cGVvZiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICBjb25zb2xlLmxvZygn5rWB5pyI56We54We5pi+56S66K6+572ubGl1WXVlOicsIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGE/LmxpdVl1ZSk7XG4gICAgY29uc29sZS5sb2coJ+a1geaciOelnueFnuaYvuekuuiuvue9rmxpdVl1Zeexu+WeizonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ubGl1WXVlKTtcblxuICAgIC8vIOW8uuWItuaYvuekuuelnueFnuihjFxuICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgIC8vIOagueaNruiuvue9ruaYvuekuuaIlumakOiXj+elnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEubGl1WXVlID09PSBmYWxzZSkge1xuICAgICAgY29uc29sZS5sb2coJ+agueaNruiuvue9rumakOiXj+a1geaciOelnueFnuihjCcpO1xuICAgICAgc2hlblNoYVJvdy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygn5rWB5pyI56We54We6KGM5bqU6K+l5pi+56S6Jyk7XG4gICAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnJzsgLy8g56Gu5L+d5pi+56S6XG4gICAgfVxuXG4gICAgbGl1WXVlRGF0YS5mb3JFYWNoKChseSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgY29uc29sZS5sb2coYOWkhOeQhua1geaciCAke2x5Lm1vbnRofSAo57Si5byVOiAke2luZGV4fSkg55qE56We54We5pWw5o2uOmAsIGx5LnNoZW5TaGEpO1xuICAgICAgY29uc29sZS5sb2coYOa1geaciOaVsOaNruexu+Wei+ajgOafpSAtIHNoZW5TaGHmmK/lkKblrZjlnKg6ICR7bHkuc2hlblNoYSAhPT0gdW5kZWZpbmVkfSwg5piv5ZCm5Li65pWw57uEOiAke0FycmF5LmlzQXJyYXkobHkuc2hlblNoYSl9LCDplb/luqY6ICR7bHkuc2hlblNoYSA/IGx5LnNoZW5TaGEubGVuZ3RoIDogMH1gKTtcblxuICAgICAgLy8g5qOA5p+l56We54We5pWw5o2u5piv5ZCm5Li656m65oiWdW5kZWZpbmVkXG4gICAgICBpZiAoIWx5LnNoZW5TaGEpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGDmtYHmnIggJHtseS5tb250aH0g55qE56We54We5pWw5o2u5Li656m65oiWdW5kZWZpbmVkYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54We5pWw5o2uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8g5qOA5p+l56We54We5pWw5o2u5piv5ZCm5Li65pWw57uEXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobHkuc2hlblNoYSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5rWB5pyIICR7bHkubW9udGh9IOeahOelnueFnuaVsOaNruS4jeaYr+aVsOe7hO+8jOiAjOaYryAke3R5cGVvZiBseS5zaGVuU2hhfWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgbHkuc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobHkuc2hlblNoYSAmJiBseS5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIGx5LnNoZW5TaGEuZm9yRWFjaCgoc2hlblNoYTogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG5rWB5pyIICR7bHkubW9udGh9IOeahOesrCAke2krMX0g5Liq56We54WeOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICBjb25zdCBzaGVuU2hhSW5mbyA9IHRoaXMuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICB0ZXh0OiBzaGVuU2hhLFxuICAgICAgICAgICAgY2xzOiBgYmF6aS1zaGVuc2hhICR7Y3NzQ2xhc3N9YCxcbiAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgJ3N0eWxlJzogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrICFpbXBvcnRhbnQ7IHBhZGRpbmc6MnB4IDRweCAhaW1wb3J0YW50OyBtYXJnaW46MnB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6M3B4ICFpbXBvcnRhbnQ7IGZvbnQtc2l6ZTowLjhlbSAhaW1wb3J0YW50OyBjdXJzb3I6cG9pbnRlciAhaW1wb3J0YW50OycsXG4gICAgICAgICAgICAgICdkYXRhLXNoZW5zaGEnOiBzaGVuU2hhLFxuICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgc2hlblNoYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIggJHtseS5tb250aH0g5rKh5pyJ56We54We5pWw5o2uYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygn5rWB5pyI5L+h5oGv5Yib5bu65a6M5oiQJyk7XG4gIH1cblxuICAvLyDlt7LliKDpmaTmnKrkvb/nlKjnmoTmlrnms5VcblxuICAvKipcbiAgICog5aSE55CG5rWB5bm06YCJ5oupXG4gICAqIEBwYXJhbSB5ZWFyIOa1geW5tOW5tOS7vVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVMaXVOaWFuU2VsZWN0KHllYXI6IG51bWJlcikge1xuICAgIC8vIOiusOW9lemAieS4reeahOa1geW5tOW5tOS7ve+8jOeUqOS6juiwg+ivlVxuICAgIGNvbnNvbGUubG9nKGDpgInkuK3mtYHlubQ6ICR7eWVhcn1gKTtcblxuICAgIC8vIOiOt+WPluaJgOaciea1geaciOaVsOaNrlxuICAgIGNvbnN0IGFsbExpdVl1ZSA9IHRoaXMuYmF6aUluZm8ubGl1WXVlIHx8IFtdO1xuXG4gICAgLy8g55Sx5LqO5rWB5pyI5a+56LGh5rKh5pyJeWVhcuWxnuaAp++8jOaIkeS7rOebtOaOpeS9v+eUqOaJgOaciea1geaciOaVsOaNrlxuICAgIC8vIOWcqOWunumZheW6lOeUqOS4re+8jOWPr+iDvemcgOimgeagueaNruWFtuS7luWxnuaAp+adpeetm+mAiea1geaciFxuICAgIHRoaXMudXBkYXRlTGl1WXVlVGFibGUoYWxsTGl1WXVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmm7TmlrDmtYHlubTooajmoLxcbiAgICogQHBhcmFtIGxpdU5pYW4g5rWB5bm05pWw5o2uXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZUxpdU5pYW5UYWJsZShsaXVOaWFuOiBhbnlbXSkge1xuICAgIGNvbnN0IGxpdU5pYW5TZWN0aW9uID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgLmJhemktbGl1bmlhbi1zZWN0aW9uW2RhdGEtYmF6aS1pZD1cIiR7dGhpcy5pZH1cIl1gKTtcbiAgICBpZiAoIWxpdU5pYW5TZWN0aW9uKSByZXR1cm47XG5cbiAgICAvLyDojrflj5booajmoLxcbiAgICBjb25zdCB0YWJsZSA9IGxpdU5pYW5TZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctbGl1bmlhbi10YWJsZScpO1xuICAgIGlmICghdGFibGUpIHJldHVybjtcblxuICAgIC8vIOa4heepuuihqOagvFxuICAgIHRhYmxlLmVtcHR5KCk7XG5cbiAgICAvLyDosIPor5Xkv6Hmga/vvJrovpPlh7rmtYHlubTmlbDmja5cbiAgICBjb25zb2xlLmxvZygn5rWB5bm05pWw5o2uOicsIGxpdU5pYW4pO1xuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mlbDmja7npLrkvos6JywgbGl1TmlhblswXT8uc2hlblNoYSk7XG5cbiAgICAvLyDnrKzkuIDooYzvvJrlubTku71cbiAgICBjb25zdCB5ZWFyUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgeWVhclJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHlubQnIH0pO1xuICAgIGxpdU5pYW4uc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgeWVhclJvdy5jcmVhdGVFbCgndGQnLCB7IHRleHQ6IGxuLnllYXIudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS6jOihjO+8muW5tOm+hFxuICAgIGNvbnN0IGFnZVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGFnZVJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICflubTpvoQnIH0pO1xuICAgIGxpdU5pYW4uc2xpY2UoMCwgMTApLmZvckVhY2gobG4gPT4ge1xuICAgICAgYWdlUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbG4uYWdlLnRvU3RyaW5nKCkgfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuInooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaChsbiA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gZ3pSb3cuY3JlYXRlRWwoJ3RkJywge1xuICAgICAgICB0ZXh0OiBsbi5nYW5aaGksXG4gICAgICAgIGNsczogJ2JhemktbGl1bmlhbi1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS15ZWFyJzogbG4ueWVhci50b1N0cmluZygpIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIOmrmOS6rumAieS4reeahOWNleWFg+agvFxuICAgICAgICB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXVuaWFuLWNlbGwnKS5mb3JFYWNoKGMgPT4gYy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKSk7XG4gICAgICAgIGNlbGwuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgLy8g5pu05paw5rWB5pyIXG4gICAgICAgIHRoaXMuaGFuZGxlTGl1TmlhblNlbGVjdChsbi55ZWFyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5Zub6KGM77ya56We54WeXG4gICAgY29uc3Qgc2hlblNoYVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn56We54WeJyB9KTtcbiAgICBzaGVuU2hhUm93LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3ctdHlwZScsICdzaGVuc2hhLXJvdycpOyAvLyDmt7vliqDmoIfor4blsZ7mgKdcblxuICAgIC8vIOajgOafpeelnueFnuaYvuekuuiuvue9rlxuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mmL7npLrorr7nva4o5pu05paw6KGo5qC8KTonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICBjb25zb2xlLmxvZygn5rWB5bm056We54We5pi+56S66K6+572u57G75Z6LKOabtOaWsOihqOagvCk6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHlubTnpZ7nhZ7mmL7npLrorr7nva5saXVOaWFuKOabtOaWsOihqOagvCk6JywgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ubGl1Tmlhbik7XG4gICAgY29uc29sZS5sb2coJ+a1geW5tOelnueFnuaYvuekuuiuvue9rmxpdU5pYW7nsbvlnoso5pu05paw6KGo5qC8KTonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ubGl1Tmlhbik7XG5cbiAgICAvLyDlvLrliLbmmL7npLrnpZ7nhZ7ooYxcbiAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnJzsgLy8g56Gu5L+d5pi+56S6XG5cbiAgICAvLyDmoLnmja7orr7nva7mmL7npLrmiJbpmpDol4/npZ7nhZ7ooYxcbiAgICBpZiAodGhpcy5iYXppSW5mby5zaG93U2hlblNoYSAmJiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhLmxpdU5pYW4gPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZygn5qC55o2u6K6+572u6ZqQ6JeP5rWB5bm056We54We6KGMKOabtOaWsOihqOagvCknKTtcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ+a1geW5tOelnueFnuihjOW6lOivpeaYvuekuijmm7TmlrDooajmoLwpJyk7XG4gICAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnJzsgLy8g56Gu5L+d5pi+56S6XG4gICAgfVxuXG4gICAgbGl1Tmlhbi5zbGljZSgwLCAxMCkuZm9yRWFjaCgobG4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICAgIGNvbnNvbGUubG9nKGDlpITnkIbmtYHlubQgJHtsbi55ZWFyfSAo57Si5byVOiAke2luZGV4fSkg55qE56We54We5pWw5o2uKOabtOaWsOihqOagvCk6YCwgbG4uc2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZyhg5rWB5bm05pWw5o2u57G75Z6L5qOA5p+lKOabtOaWsOihqOagvCkgLSBzaGVuU2hh5piv5ZCm5a2Y5ZyoOiAke2xuLnNoZW5TaGEgIT09IHVuZGVmaW5lZH0sIOaYr+WQpuS4uuaVsOe7hDogJHtBcnJheS5pc0FycmF5KGxuLnNoZW5TaGEpfSwg6ZW/5bqmOiAke2xuLnNoZW5TaGEgPyBsbi5zaGVuU2hhLmxlbmd0aCA6IDB9YCk7XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuepuuaIlnVuZGVmaW5lZFxuICAgICAgaWYgKCFsbi5zaGVuU2hhKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihg5rWB5bm0ICR7bG4ueWVhcn0g55qE56We54We5pWw5o2u5Li656m65oiWdW5kZWZpbmVkKOabtOaWsOihqOagvClgKTtcbiAgICAgICAgY2VsbC5zZXRUZXh0KCfml6DnpZ7nhZ7mlbDmja4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyDmo4Dmn6XnpZ7nhZ7mlbDmja7mmK/lkKbkuLrmlbDnu4RcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShsbi5zaGVuU2hhKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDmtYHlubQgJHtsbi55ZWFyfSDnmoTnpZ7nhZ7mlbDmja7kuI3mmK/mlbDnu4TvvIzogIzmmK8gJHt0eXBlb2YgbG4uc2hlblNoYX0o5pu05paw6KGo5qC8KWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgbG4uc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobG4uc2hlblNoYSAmJiBsbi5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgIGNvbnNvbGUubG9nKGDmtYHlubQgJHtsbi55ZWFyfSDnmoTnpZ7nhZ7mlbDmja46YCwgbG4uc2hlblNoYSk7XG5cbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG4uc2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhua1geW5tCAke2xuLnllYXJ9IOeahOesrCAke2krMX0g5Liq56We54WeKOabtOaWsOihqOagvCk6ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSB0aGlzLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogYGJhemktc2hlbnNoYSAke2Nzc0NsYXNzfWAsXG4gICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgICAnZGF0YS1zaGVuc2hhJzogc2hlblNoYSxcbiAgICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpITnkIbmtYHlubTnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICAgICAgY2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYOa1geW5tCAke2xuLnllYXJ9IOayoeacieelnueFnuaVsOaNrijmm7TmlrDooajmoLwpYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOWwj+i/kOihqOagvFxuICAgKiBAcGFyYW0geGlhb1l1biDlsI/ov5DmlbDmja5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlWGlhb1l1blRhYmxlKHhpYW9ZdW46IGFueVtdKSB7XG4gICAgY29uc3QgeGlhb1l1blNlY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuYmF6aS14aWFveXVuLXNlY3Rpb25bZGF0YS1iYXppLWlkPVwiJHt0aGlzLmlkfVwiXWApO1xuICAgIGlmICgheGlhb1l1blNlY3Rpb24pIHJldHVybjtcblxuICAgIC8vIOiOt+WPluihqOagvFxuICAgIGNvbnN0IHRhYmxlID0geGlhb1l1blNlY3Rpb24ucXVlcnlTZWxlY3RvcignLmJhemktdmlldy14aWFveXVuLXRhYmxlJyk7XG4gICAgaWYgKCF0YWJsZSkgcmV0dXJuO1xuXG4gICAgLy8g5riF56m66KGo5qC8XG4gICAgdGFibGUuZW1wdHkoKTtcblxuICAgIC8vIOiwg+ivleS/oeaBr++8mui+k+WHuuWwj+i/kOaVsOaNrlxuICAgIGNvbnNvbGUubG9nKCflsI/ov5DmlbDmja46JywgeGlhb1l1bik7XG4gICAgY29uc29sZS5sb2coJ+Wwj+i/kOelnueFnuaVsOaNruekuuS+izonLCB4aWFvWXVuWzBdPy5zaGVuU2hhKTtcblxuICAgIC8vIOesrOS4gOihjO+8muW5tOS7vVxuICAgIGNvbnN0IHllYXJSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+Wwj+i/kCcgfSk7XG4gICAgeGlhb1l1bi5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICB5ZWFyUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogeHkueWVhci50b1N0cmluZygpIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LqM6KGM77ya5bm06b6EXG4gICAgY29uc3QgYWdlUm93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgYWdlUm93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5tOm+hCcgfSk7XG4gICAgeGlhb1l1bi5zbGljZSgwLCAxMCkuZm9yRWFjaCh4eSA9PiB7XG4gICAgICBhZ2VSb3cuY3JlYXRlRWwoJ3RkJywgeyB0ZXh0OiB4eS5hZ2UudG9TdHJpbmcoKSB9KTtcbiAgICB9KTtcblxuICAgIC8vIOesrOS4ieihjO+8muW5suaUr1xuICAgIGNvbnN0IGd6Um93ID0gdGFibGUuY3JlYXRlRWwoJ3RyJyk7XG4gICAgZ3pSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn5bmy5pSvJyB9KTtcbiAgICB4aWFvWXVuLnNsaWNlKDAsIDEwKS5mb3JFYWNoKHh5ID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBnelJvdy5jcmVhdGVFbCgndGQnLCB7XG4gICAgICAgIHRleHQ6IHh5LmdhblpoaSxcbiAgICAgICAgY2xzOiAnYmF6aS14aWFveXVuLWNlbGwnLFxuICAgICAgICBhdHRyOiB7ICdkYXRhLXllYXInOiB4eS55ZWFyLnRvU3RyaW5nKCkgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8g6auY5Lqu6YCJ5Lit55qE5Y2V5YWD5qC8XG4gICAgICAgIHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5iYXppLXhpYW95dW4tY2VsbCcpLmZvckVhY2goYyA9PiBjLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpKTtcbiAgICAgICAgY2VsbC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5Zub6KGM77ya56We54WeXG4gICAgY29uc3Qgc2hlblNoYVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn56We54WeJyB9KTtcbiAgICBzaGVuU2hhUm93LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3ctdHlwZScsICdzaGVuc2hhLXJvdycpOyAvLyDmt7vliqDmoIfor4blsZ7mgKdcblxuICAgIC8vIOajgOafpeelnueFnuaYvuekuuiuvue9rlxuICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7mmL7npLrorr7nva4o5pu05paw6KGo5qC8KTonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICBjb25zb2xlLmxvZygn5bCP6L+Q56We54We5pi+56S66K6+572u57G75Z6LKOabtOaWsOihqOagvCk6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7mmL7npLrorr7nva54aWFvWXVuKOabtOaWsOihqOagvCk6JywgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ueGlhb1l1bik7XG4gICAgY29uc29sZS5sb2coJ+Wwj+i/kOelnueFnuaYvuekuuiuvue9rnhpYW9ZdW7nsbvlnoso5pu05paw6KGo5qC8KTonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ueGlhb1l1bik7XG5cbiAgICAvLyDlvLrliLbmmL7npLrnpZ7nhZ7ooYxcbiAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnJzsgLy8g56Gu5L+d5pi+56S6XG5cbiAgICAvLyDmoLnmja7orr7nva7mmL7npLrmiJbpmpDol4/npZ7nhZ7ooYxcbiAgICBpZiAodGhpcy5iYXppSW5mby5zaG93U2hlblNoYSAmJiB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhLnhpYW9ZdW4gPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZygn5qC55o2u6K6+572u6ZqQ6JeP5bCP6L+Q56We54We6KGMKOabtOaWsOihqOagvCknKTtcbiAgICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ+Wwj+i/kOelnueFnuihjOW6lOivpeaYvuekuijmm7TmlrDooajmoLwpJyk7XG4gICAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnJzsgLy8g56Gu5L+d5pi+56S6XG4gICAgfVxuXG4gICAgeGlhb1l1bi5zbGljZSgwLCAxMCkuZm9yRWFjaCgoeHksIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gc2hlblNoYVJvdy5jcmVhdGVFbCgndGQnKTtcbiAgICAgIGNvbnNvbGUubG9nKGDlpITnkIblsI/ov5AgJHt4eS55ZWFyfSAo57Si5byVOiAke2luZGV4fSkg55qE56We54We5pWw5o2uKOabtOaWsOihqOagvCk6YCwgeHkuc2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZyhg5bCP6L+Q5pWw5o2u57G75Z6L5qOA5p+lKOabtOaWsOihqOagvCkgLSBzaGVuU2hh5piv5ZCm5a2Y5ZyoOiAke3h5LnNoZW5TaGEgIT09IHVuZGVmaW5lZH0sIOaYr+WQpuS4uuaVsOe7hDogJHtBcnJheS5pc0FycmF5KHh5LnNoZW5TaGEpfSwg6ZW/5bqmOiAke3h5LnNoZW5TaGEgPyB4eS5zaGVuU2hhLmxlbmd0aCA6IDB9YCk7XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuepuuaIlnVuZGVmaW5lZFxuICAgICAgaWYgKCF4eS5zaGVuU2hhKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihg5bCP6L+QICR7eHkueWVhcn0g55qE56We54We5pWw5o2u5Li656m65oiWdW5kZWZpbmVkKOabtOaWsOihqOagvClgKTtcbiAgICAgICAgY2VsbC5zZXRUZXh0KCfml6DnpZ7nhZ7mlbDmja4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyDmo4Dmn6XnpZ7nhZ7mlbDmja7mmK/lkKbkuLrmlbDnu4RcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh4eS5zaGVuU2hhKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDlsI/ov5AgJHt4eS55ZWFyfSDnmoTnpZ7nhZ7mlbDmja7kuI3mmK/mlbDnu4TvvIzogIzmmK8gJHt0eXBlb2YgeHkuc2hlblNoYX0o5pu05paw6KGo5qC8KWApO1xuICAgICAgICBjZWxsLnNldFRleHQoYOaVsOaNruexu+Wei+mUmeivrzogJHt0eXBlb2YgeHkuc2hlblNoYX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoeHkuc2hlblNoYSAmJiB4eS5zaGVuU2hhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgIGNvbnNvbGUubG9nKGDlsI/ov5AgJHt4eS55ZWFyfSDnmoTnpZ7nhZ7mlbDmja46YCwgeHkuc2hlblNoYSk7XG5cbiAgICAgICAgLy8g5Yib5bu656We54We5YiX6KGoXG4gICAgICAgIGNvbnN0IHNoZW5TaGFMaXN0ID0gY2VsbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdiYXppLXNoZW5zaGEtbGlzdCcgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgeHkuc2hlblNoYS5mb3JFYWNoKChzaGVuU2hhOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuWwj+i/kCAke3h5LnllYXJ9IOeahOesrCAke2krMX0g5Liq56We54WeKOabtOaWsOihqOagvCk6ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSB0aGlzLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogYGJhemktc2hlbnNoYSAke2Nzc0NsYXNzfWAsXG4gICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgICAnZGF0YS1zaGVuc2hhJzogc2hlblNoYSxcbiAgICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpITnkIblsI/ov5DnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICAgICAgY2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYOWwj+i/kCAke3h5LnllYXJ9IOayoeacieelnueFnuaVsOaNrijmm7TmlrDooajmoLwpYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54WeJyk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuICB9XG5cbiAgLyoqXG4gICAqIOabtOaWsOa1geaciOihqOagvFxuICAgKiBAcGFyYW0gbGl1WXVlIOa1geaciOaVsOaNrlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVMaXVZdWVUYWJsZShsaXVZdWU6IGFueVtdKSB7XG4gICAgY29uc3QgbGl1WXVlU2VjdGlvbiA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC5iYXppLWxpdXl1ZS1zZWN0aW9uW2RhdGEtYmF6aS1pZD1cIiR7dGhpcy5pZH1cIl1gKTtcbiAgICBpZiAoIWxpdVl1ZVNlY3Rpb24pIHJldHVybjtcblxuICAgIC8vIOiOt+WPluihqOagvFxuICAgIGNvbnN0IHRhYmxlID0gbGl1WXVlU2VjdGlvbi5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LWxpdXl1ZS10YWJsZScpO1xuICAgIGlmICghdGFibGUpIHJldHVybjtcblxuICAgIC8vIOa4heepuuihqOagvFxuICAgIHRhYmxlLmVtcHR5KCk7XG5cbiAgICAvLyDosIPor5Xkv6Hmga/vvJrovpPlh7rmtYHmnIjmlbDmja5cbiAgICBjb25zb2xlLmxvZygn5rWB5pyI5pWw5o2uOicsIGxpdVl1ZSk7XG4gICAgY29uc29sZS5sb2coJ+a1geaciOelnueFnuaVsOaNruekuuS+izonLCBsaXVZdWVbMF0/LnNoZW5TaGEpO1xuXG4gICAgLy8g56ys5LiA6KGM77ya5pyI5Lu9XG4gICAgY29uc3QgbW9udGhSb3cgPSB0YWJsZS5jcmVhdGVFbCgndHInKTtcbiAgICBtb250aFJvdy5jcmVhdGVFbCgndGgnLCB7IHRleHQ6ICfmtYHmnIgnIH0pO1xuICAgIGxpdVl1ZS5mb3JFYWNoKGx5ID0+IHtcbiAgICAgIG1vbnRoUm93LmNyZWF0ZUVsKCd0ZCcsIHsgdGV4dDogbHkubW9udGggfSk7XG4gICAgfSk7XG5cbiAgICAvLyDnrKzkuozooYzvvJrlubLmlK9cbiAgICBjb25zdCBnelJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIGd6Um93LmNyZWF0ZUVsKCd0aCcsIHsgdGV4dDogJ+W5suaUrycgfSk7XG4gICAgbGl1WXVlLmZvckVhY2gobHkgPT4ge1xuICAgICAgY29uc3QgY2VsbCA9IGd6Um93LmNyZWF0ZUVsKCd0ZCcsIHtcbiAgICAgICAgdGV4dDogbHkuZ2FuWmhpLFxuICAgICAgICBjbHM6ICdiYXppLWxpdXl1ZS1jZWxsJyxcbiAgICAgICAgYXR0cjogeyAnZGF0YS1tb250aCc6IGx5Lm1vbnRoIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIOmrmOS6rumAieS4reeahOWNleWFg+agvFxuICAgICAgICB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYmF6aS1saXV5dWUtY2VsbCcpLmZvckVhY2goYyA9PiBjLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpKTtcbiAgICAgICAgY2VsbC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8g56ys5LiJ6KGM77ya56We54WeXG4gICAgY29uc3Qgc2hlblNoYVJvdyA9IHRhYmxlLmNyZWF0ZUVsKCd0cicpO1xuICAgIHNoZW5TaGFSb3cuY3JlYXRlRWwoJ3RoJywgeyB0ZXh0OiAn56We54WeJyB9KTtcbiAgICBzaGVuU2hhUm93LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3ctdHlwZScsICdzaGVuc2hhLXJvdycpOyAvLyDmt7vliqDmoIfor4blsZ7mgKdcblxuICAgIC8vIOajgOafpeelnueFnuaYvuekuuiuvue9rlxuICAgIGNvbnNvbGUubG9nKCfmtYHmnIjnpZ7nhZ7mmL7npLrorr7nva4o5pu05paw6KGo5qC8KTonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhKTtcbiAgICBjb25zb2xlLmxvZygn5rWB5pyI56We54We5pi+56S66K6+572u57G75Z6LKOabtOaWsOihqOagvCk6JywgdHlwZW9mIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHmnIjnpZ7nhZ7mmL7npLrorr7nva5saXVZdWUo5pu05paw6KGo5qC8KTonLCB0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhPy5saXVZdWUpO1xuICAgIGNvbnNvbGUubG9nKCfmtYHmnIjnpZ7nhZ7mmL7npLrorr7nva5saXVZdWXnsbvlnoso5pu05paw6KGo5qC8KTonLCB0eXBlb2YgdGhpcy5iYXppSW5mby5zaG93U2hlblNoYT8ubGl1WXVlKTtcblxuICAgIC8vIOW8uuWItuaYvuekuuelnueFnuihjFxuICAgIHNoZW5TaGFSb3cuc3R5bGUuZGlzcGxheSA9ICcnOyAvLyDnoa7kv53mmL7npLpcblxuICAgIC8vIOagueaNruiuvue9ruaYvuekuuaIlumakOiXj+elnueFnuihjFxuICAgIGlmICh0aGlzLmJhemlJbmZvLnNob3dTaGVuU2hhICYmIHRoaXMuYmF6aUluZm8uc2hvd1NoZW5TaGEubGl1WXVlID09PSBmYWxzZSkge1xuICAgICAgY29uc29sZS5sb2coJ+agueaNruiuvue9rumakOiXj+a1geaciOelnueFnuihjCjmm7TmlrDooajmoLwpJyk7XG4gICAgICBzaGVuU2hhUm93LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCfmtYHmnIjnpZ7nhZ7ooYzlupTor6XmmL7npLoo5pu05paw6KGo5qC8KScpO1xuICAgICAgc2hlblNoYVJvdy5zdHlsZS5kaXNwbGF5ID0gJyc7IC8vIOehruS/neaYvuekulxuICAgIH1cblxuICAgIGxpdVl1ZS5mb3JFYWNoKChseSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGNlbGwgPSBzaGVuU2hhUm93LmNyZWF0ZUVsKCd0ZCcpO1xuICAgICAgY29uc29sZS5sb2coYOWkhOeQhua1geaciCAke2x5Lm1vbnRofSAo57Si5byVOiAke2luZGV4fSkg55qE56We54We5pWw5o2uKOabtOaWsOihqOagvCk6YCwgbHkuc2hlblNoYSk7XG4gICAgICBjb25zb2xlLmxvZyhg5rWB5pyI5pWw5o2u57G75Z6L5qOA5p+lKOabtOaWsOihqOagvCkgLSBzaGVuU2hh5piv5ZCm5a2Y5ZyoOiAke2x5LnNoZW5TaGEgIT09IHVuZGVmaW5lZH0sIOaYr+WQpuS4uuaVsOe7hDogJHtBcnJheS5pc0FycmF5KGx5LnNoZW5TaGEpfSwg6ZW/5bqmOiAke2x5LnNoZW5TaGEgPyBseS5zaGVuU2hhLmxlbmd0aCA6IDB9YCk7XG5cbiAgICAgIC8vIOajgOafpeelnueFnuaVsOaNruaYr+WQpuS4uuepuuaIlnVuZGVmaW5lZFxuICAgICAgaWYgKCFseS5zaGVuU2hhKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihg5rWB5pyIICR7bHkubW9udGh9IOeahOelnueFnuaVsOaNruS4uuepuuaIlnVuZGVmaW5lZCjmm7TmlrDooajmoLwpYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dCgn5peg56We54We5pWw5o2uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8g5qOA5p+l56We54We5pWw5o2u5piv5ZCm5Li65pWw57uEXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobHkuc2hlblNoYSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg5rWB5pyIICR7bHkubW9udGh9IOeahOelnueFnuaVsOaNruS4jeaYr+aVsOe7hO+8jOiAjOaYryAke3R5cGVvZiBseS5zaGVuU2hhfSjmm7TmlrDooajmoLwpYCk7XG4gICAgICAgIGNlbGwuc2V0VGV4dChg5pWw5o2u57G75Z6L6ZSZ6K+vOiAke3R5cGVvZiBseS5zaGVuU2hhfWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChseS5zaGVuU2hhICYmIGx5LnNoZW5TaGEubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyDosIPor5Xkv6Hmga/vvJrovpPlh7rmr4/kuKrmtYHmnIjnmoTnpZ7nhZ7mlbDmja5cbiAgICAgICAgY29uc29sZS5sb2coYOa1geaciCAke2x5Lm1vbnRofSDnmoTnpZ7nhZ7mlbDmja46YCwgbHkuc2hlblNoYSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIggJHtseS5tb250aH0g55qE56We54We5pWw5o2u57G75Z6LOmAsIHR5cGVvZiBseS5zaGVuU2hhLCBBcnJheS5pc0FycmF5KGx5LnNoZW5TaGEpKTtcblxuICAgICAgICAvLyDliJvlu7rnpZ7nhZ7liJfooahcbiAgICAgICAgY29uc3Qgc2hlblNoYUxpc3QgPSBjZWxsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2Jhemktc2hlbnNoYS1saXN0JyB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBseS5zaGVuU2hhLmZvckVhY2goKHNoZW5TaGE6IHN0cmluZywgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG5rWB5pyIICR7bHkubW9udGh9IOeahOesrCAke2krMX0g5Liq56We54WeKOabtOaWsOihqOagvCk6ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUluZm8gPSB0aGlzLmdldFNoZW5TaGFJbmZvKHNoZW5TaGEpO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNoZW5TaGFJbmZvPy50eXBlIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hlblNoYUVsID0gc2hlblNoYUxpc3QuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHRleHQ6IHNoZW5TaGEsXG4gICAgICAgICAgICAgIGNsczogYGJhemktc2hlbnNoYSAke2Nzc0NsYXNzfWAsXG4gICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAnc3R5bGUnOiAnZGlzcGxheTppbmxpbmUtYmxvY2sgIWltcG9ydGFudDsgcGFkZGluZzoycHggNHB4ICFpbXBvcnRhbnQ7IG1hcmdpbjoycHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czozcHggIWltcG9ydGFudDsgZm9udC1zaXplOjAuOGVtICFpbXBvcnRhbnQ7IGN1cnNvcjpwb2ludGVyICFpbXBvcnRhbnQ7JyxcbiAgICAgICAgICAgICAgICAnZGF0YS1zaGVuc2hhJzogc2hlblNoYSxcbiAgICAgICAgICAgICAgICAnZGF0YS10eXBlJzogdHlwZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu25pi+56S656We54We6K+m5oOFXG4gICAgICAgICAgICBzaGVuU2hhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhRGV0YWlsKHNoZW5TaGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCflpITnkIbmtYHmnIjnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICAgICAgY2VsbC5zZXRUZXh0KCfnpZ7nhZ7lpITnkIbplJnor68nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g6LCD6K+V5L+h5oGv77ya6L6T5Ye65rKh5pyJ56We54We5pWw5o2u55qE5rWB5pyIXG4gICAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIggJHtseS5tb250aH0g5rKh5pyJ56We54We5pWw5o2u5oiW5pWw5o2u5Li656m6KOabtOaWsOihqOagvClgKTtcbiAgICAgICAgY2VsbC5zZXRUZXh0KCfml6DnpZ7nhZ4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkupTooYzlr7nlupTnmoRDU1PnsbvlkI1cbiAgICogQHBhcmFtIHd1eGluZyDkupTooYzlkI3np7BcbiAgICogQHJldHVybnMgQ1NT57G75ZCNXG4gICAqL1xuICBwcml2YXRlIGdldFd1WGluZ0NsYXNzKHd1eGluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+mHkSc6ICdqaW4nLFxuICAgICAgJ+acqCc6ICdtdScsXG4gICAgICAn5rC0JzogJ3NodWknLFxuICAgICAgJ+eBqyc6ICdodW8nLFxuICAgICAgJ+Wcnyc6ICd0dSdcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gbWFwKSB7XG4gICAgICBpZiAod3V4aW5nLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bnpZ7nhZ7kv6Hmga9cbiAgICogQHBhcmFtIHNoZW5TaGEg56We54We5ZCN56ewXG4gICAqIEByZXR1cm5zIOelnueFnuS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBnZXRTaGVuU2hhSW5mbyhzaGVuU2hhOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gU2hlblNoYVNlcnZpY2UuZ2V0U2hlblNoYUluZm8oc2hlblNoYSk7XG4gIH1cblxuICAvKipcbiAgICog5pi+56S656We54We6K+m5oOFXG4gICAqIEBwYXJhbSBzaGVuU2hhIOelnueFnuWQjeensFxuICAgKi9cbiAgcHJpdmF0ZSBzaG93U2hlblNoYURldGFpbChzaGVuU2hhOiBzdHJpbmcpIHtcbiAgICAvLyDosIPor5Xkv6Hmga9cbiAgICBjb25zb2xlLmxvZyhg5pi+56S656We54We6K+m5oOFOiAke3NoZW5TaGF9YCk7XG5cbiAgICAvLyDljrvpmaTlj6/og73nmoTliY3nvIDvvIjlpoJcIuW5tOafsTpcIu+8iVxuICAgIGNvbnN0IHB1cmVTaGVuU2hhID0gc2hlblNoYS5pbmNsdWRlcygnOicpID8gc2hlblNoYS5zcGxpdCgnOicpWzFdIDogc2hlblNoYTtcbiAgICBjb25zb2xlLmxvZyhg5aSE55CG5ZCO55qE56We54We5ZCN56ewOiAke3B1cmVTaGVuU2hhfWApO1xuXG4gICAgLy8g6I635Y+W56We54We6K+m57uG6Kej6YeKXG4gICAgY29uc3Qgc2hlblNoYUluZm8gPSBTaGVuU2hhU2VydmljZS5nZXRTaGVuU2hhRXhwbGFuYXRpb24ocHVyZVNoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKGDnpZ7nhZ7kv6Hmga86YCwgc2hlblNoYUluZm8pO1xuXG4gICAgaWYgKCFzaGVuU2hhSW5mbykge1xuICAgICAgY29uc29sZS5lcnJvcihg5pyq5om+5Yiw56We54WeIFwiJHtwdXJlU2hlblNoYX1cIiDnmoTor6bnu4bkv6Hmga9gKTtcbiAgICAgIG5ldyBOb3RpY2UoYOacquaJvuWIsOelnueFniBcIiR7cHVyZVNoZW5TaGF9XCIg55qE6K+m57uG5L+h5oGvYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65LiA5Liq5Li05pe25a655ZmoXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9ICdzaGVuc2hhLW1vZGFsLWNvbnRhaW5lcic7XG4gICAgY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBjb250YWluZXIuc3R5bGUudG9wID0gJzAnO1xuICAgIGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGNvbnRhaW5lci5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIGNvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLCAwLCAwLCAwLjUpJztcbiAgICBjb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICBjb250YWluZXIuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJztcbiAgICBjb250YWluZXIuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xuICAgIGNvbnRhaW5lci5zdHlsZS56SW5kZXggPSAnMTAwMCc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gICAgLy8g5Yib5bu65by556qX5YaF5a65XG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb2RhbC5jbGFzc05hbWUgPSAnc2hlbnNoYS1tb2RhbCc7XG4gICAgbW9kYWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICBtb2RhbC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnOHB4JztcbiAgICBtb2RhbC5zdHlsZS5wYWRkaW5nID0gJzIwcHgnO1xuICAgIG1vZGFsLnN0eWxlLm1heFdpZHRoID0gJzgwJSc7XG4gICAgbW9kYWwuc3R5bGUubWF4SGVpZ2h0ID0gJzgwJSc7XG4gICAgbW9kYWwuc3R5bGUub3ZlcmZsb3cgPSAnYXV0byc7XG4gICAgbW9kYWwuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgICAvLyDliJvlu7rlhbPpl63mjInpkq5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gJ8OXJztcbiAgICBjbG9zZUJ1dHRvbi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUudG9wID0gJzEwcHgnO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLnJpZ2h0ID0gJzEwcHgnO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLmJvcmRlciA9ICdub25lJztcbiAgICBjbG9zZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLmZvbnRTaXplID0gJzIwcHgnO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcbiAgICB9KTtcbiAgICBtb2RhbC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cbiAgICAvLyDliJvlu7rmoIfpophcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBzaGVuU2hhSW5mby5uYW1lO1xuICAgIHRpdGxlLnN0eWxlLm1hcmdpblRvcCA9ICcwJztcbiAgICBtb2RhbC5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAvLyDliJvlu7rnsbvlnotcbiAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdHlwZS50ZXh0Q29udGVudCA9IGDnsbvlnos6ICR7c2hlblNoYUluZm8udHlwZX1gO1xuICAgIHR5cGUuc3R5bGUubWFyZ2luQm90dG9tID0gJzEwcHgnO1xuICAgIGlmIChzaGVuU2hhSW5mby50eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgdHlwZS5zdHlsZS5jb2xvciA9ICdncmVlbic7XG4gICAgfSBlbHNlIGlmIChzaGVuU2hhSW5mby50eXBlID09PSAn5Ye256WeJykge1xuICAgICAgdHlwZS5zdHlsZS5jb2xvciA9ICdyZWQnO1xuICAgIH0gZWxzZSBpZiAoc2hlblNoYUluZm8udHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgIHR5cGUuc3R5bGUuY29sb3IgPSAnb3JhbmdlJztcbiAgICB9XG4gICAgbW9kYWwuYXBwZW5kQ2hpbGQodHlwZSk7XG5cbiAgICAvLyDliJvlu7rmj4/ov7BcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRlc2NyaXB0aW9uLnRleHRDb250ZW50ID0gc2hlblNoYUluZm8uZGVzY3JpcHRpb247XG4gICAgZGVzY3JpcHRpb24uc3R5bGUubWFyZ2luQm90dG9tID0gJzEwcHgnO1xuICAgIG1vZGFsLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcblxuICAgIC8vIOWIm+W7uuivpue7huaPj+i/sFxuICAgIGNvbnN0IGRldGFpbERlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGV0YWlsRGVzY3JpcHRpb24udGV4dENvbnRlbnQgPSBzaGVuU2hhSW5mby5kZXRhaWxEZXNjcmlwdGlvbjtcbiAgICBkZXRhaWxEZXNjcmlwdGlvbi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMTBweCc7XG4gICAgbW9kYWwuYXBwZW5kQ2hpbGQoZGV0YWlsRGVzY3JpcHRpb24pO1xuXG4gICAgLy8g5Yib5bu66K6h566X5pa55rOVXG4gICAgaWYgKHNoZW5TaGFJbmZvLmNhbGN1bGF0aW9uKSB7XG4gICAgICBjb25zdCBjYWxjdWxhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY2FsY3VsYXRpb24uaW5uZXJIVE1MID0gYDxzdHJvbmc+6K6h566X5pa55rOVOjwvc3Ryb25nPjxicj4ke3NoZW5TaGFJbmZvLmNhbGN1bGF0aW9ufWA7XG4gICAgICBjYWxjdWxhdGlvbi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMTBweCc7XG4gICAgICBtb2RhbC5hcHBlbmRDaGlsZChjYWxjdWxhdGlvbik7XG4gICAgfVxuXG4gICAgLy8g5Yib5bu65b2x5ZONXG4gICAgaWYgKHNoZW5TaGFJbmZvLmluZmx1ZW5jZSAmJiBzaGVuU2hhSW5mby5pbmZsdWVuY2UubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaW5mbHVlbmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpbmZsdWVuY2UuaW5uZXJIVE1MID0gYDxzdHJvbmc+5b2x5ZONOjwvc3Ryb25nPiAke3NoZW5TaGFJbmZvLmluZmx1ZW5jZS5qb2luKCcsICcpfWA7XG4gICAgICBtb2RhbC5hcHBlbmRDaGlsZChpbmZsdWVuY2UpO1xuICAgIH1cblxuICAgIC8vIOa3u+WKoOWPr+WkjeWItueahOWGheWuuVxuICAgIGNvbnN0IGNvcHlhYmxlQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvcHlhYmxlQ29udGVudC5jbGFzc05hbWUgPSAnc2hlbnNoYS1jb3B5YWJsZS1jb250ZW50JztcbiAgICBjb3B5YWJsZUNvbnRlbnQuc3R5bGUubWFyZ2luVG9wID0gJzIwcHgnO1xuICAgIGNvcHlhYmxlQ29udGVudC5zdHlsZS5wYWRkaW5nID0gJzEwcHgnO1xuICAgIGNvcHlhYmxlQ29udGVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Y1ZjVmNSc7XG4gICAgY29weWFibGVDb250ZW50LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1cHgnO1xuICAgIG1vZGFsLmFwcGVuZENoaWxkKGNvcHlhYmxlQ29udGVudCk7XG5cbiAgICAvLyDmt7vliqDmoIfpophcbiAgICBjb25zdCBjb3B5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb3B5VGl0bGUudGV4dENvbnRlbnQgPSAn5Y+v5aSN5Yi25YaF5a65ICjngrnlh7vkuIvmlrnmlofmnKzlj6/lpI3liLYpJztcbiAgICBjb3B5VGl0bGUuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICBjb3B5VGl0bGUuc3R5bGUubWFyZ2luQm90dG9tID0gJzVweCc7XG4gICAgY29weWFibGVDb250ZW50LmFwcGVuZENoaWxkKGNvcHlUaXRsZSk7XG5cbiAgICAvLyDlh4blpIflj6/lpI3liLbnmoTmlofmnKxcbiAgICBjb25zdCBjb3B5VGV4dCA9IFtcbiAgICAgIGDnpZ7nhZ46ICR7c2hlblNoYUluZm8ubmFtZX1gLFxuICAgICAgYOexu+WeizogJHtzaGVuU2hhSW5mby50eXBlfWAsXG4gICAgICBzaGVuU2hhSW5mby5kZXNjcmlwdGlvbiA/IGDmj4/ov7A6ICR7c2hlblNoYUluZm8uZGVzY3JpcHRpb259YCA6ICcnLFxuICAgICAgc2hlblNoYUluZm8uZGV0YWlsRGVzY3JpcHRpb24gPyBg6K+m57uG5o+P6L+wOiAke3NoZW5TaGFJbmZvLmRldGFpbERlc2NyaXB0aW9ufWAgOiAnJyxcbiAgICAgIHNoZW5TaGFJbmZvLmNhbGN1bGF0aW9uID8gYOiuoeeul+aWueazlTogJHtzaGVuU2hhSW5mby5jYWxjdWxhdGlvbn1gIDogJycsXG4gICAgICBzaGVuU2hhSW5mby5pbmZsdWVuY2UgJiYgc2hlblNoYUluZm8uaW5mbHVlbmNlLmxlbmd0aCA+IDBcbiAgICAgICAgPyBg5b2x5ZONOiAke3NoZW5TaGFJbmZvLmluZmx1ZW5jZS5qb2luKCcsICcpfWBcbiAgICAgICAgOiAnJ1xuICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXG4gICAgLy8g5Yib5bu65Y+v5aSN5Yi255qE5paH5pys5YWD57SgXG4gICAgY29uc3QgY29weVRleHRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIGNvcHlUZXh0RWwudGV4dENvbnRlbnQgPSBjb3B5VGV4dDtcbiAgICBjb3B5VGV4dEVsLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBjb3B5VGV4dEVsLnN0eWxlLnVzZXJTZWxlY3QgPSAnYWxsJztcbiAgICBjb3B5VGV4dEVsLnN0eWxlLndoaXRlU3BhY2UgPSAncHJlLXdyYXAnO1xuICAgIGNvcHlUZXh0RWwuc3R5bGUud29yZEJyZWFrID0gJ2JyZWFrLXdvcmQnO1xuICAgIGNvcHlhYmxlQ29udGVudC5hcHBlbmRDaGlsZChjb3B5VGV4dEVsKTtcblxuICAgIC8vIOa3u+WKoOeCueWHu+WkjeWItuWKn+iDvVxuICAgIGNvcHlUZXh0RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dCk7XG4gICAgICAgIG5ldyBOb3RpY2UoJ+elnueFnuS/oeaBr+W3suWkjeWItuWIsOWJqui0tOadvycpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WkjeWItuWksei0pTonLCBlcnIpO1xuICAgICAgICBuZXcgTm90aWNlKCflpI3liLblpLHotKXvvIzor7fmiYvliqjpgInmi6nlubblpI3liLYnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOeCueWHu+W8ueeql+WklumDqOWFs+mXreW8ueeql1xuICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IGNvbnRhaW5lcikge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6KeG5Zu+55qESFRNTOWGheWuuVxuICAgKiBAcmV0dXJucyBIVE1M5a2X56ym5LiyXG4gICAqL1xuICBnZXRIVE1MKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmlubmVySFRNTDtcbiAgfVxufVxuIl19