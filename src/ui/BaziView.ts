import { BaziInfo } from 'src/types/BaziInfo';
import { ShenShaService } from 'src/services/ShenShaService';
import { Notice } from 'obsidian';

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
  private render() {
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
        console.log(`大运${index+1} (${dy.ganZhi}) 神煞:`, dy.shenSha);
      });
    } else {
      console.log('大运数据不是数组');
    }

    // 检查流年神煞
    console.log('流年神煞数据:');
    if (this.baziInfo.liuNian && this.baziInfo.liuNian.length > 0) {
      this.baziInfo.liuNian.forEach((ln, index) => {
        console.log(`流年${index+1} (${ln.year}) 神煞:`, ln.shenSha);
      });
    } else {
      console.log('流年数据为空');
    }

    // 检查小运神煞
    console.log('小运神煞数据:');
    if (this.baziInfo.xiaoYun && this.baziInfo.xiaoYun.length > 0) {
      this.baziInfo.xiaoYun.forEach((xy, index) => {
        console.log(`小运${index+1} (${xy.year}) 神煞:`, xy.shenSha);
      });
    } else {
      console.log('小运数据为空');
    }

    // 检查流月神煞
    console.log('流月神煞数据:');
    if (this.baziInfo.liuYue && this.baziInfo.liuYue.length > 0) {
      this.baziInfo.liuYue.forEach((ly, index) => {
        console.log(`流月${index+1} (${ly.month}) 神煞:`, ly.shenSha);
      });
    } else {
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

    // 神煞行
    if (this.baziInfo.yearShenSha || this.baziInfo.monthShenSha ||
        this.baziInfo.dayShenSha || this.baziInfo.hourShenSha) {
      const shenShaRow = tbody.createEl('tr');
      shenShaRow.setAttribute('data-row-type', 'shensha-row'); // 添加标识属性

      // 检查神煞显示设置
      console.log('四柱神煞显示设置:', this.baziInfo.showShenSha);
      console.log('四柱神煞显示设置类型:', typeof this.baziInfo.showShenSha);
      console.log('四柱神煞显示设置siZhu:', this.baziInfo.showShenSha?.siZhu);
      console.log('四柱神煞显示设置siZhu类型:', typeof this.baziInfo.showShenSha?.siZhu);

      // 强制显示神煞行
      shenShaRow.style.display = ''; // 确保显示

      // 根据设置显示或隐藏神煞行
      if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.siZhu === false) {
        console.log('根据设置隐藏四柱神煞行');
        shenShaRow.style.display = 'none';
      } else {
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
          yearShenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理年柱第 ${i+1} 个神煞: ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理年柱神煞出错:', e);
          yearShenShaCell.setText('神煞处理错误');
        }
      } else {
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
          monthShenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理月柱第 ${i+1} 个神煞: ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理月柱神煞出错:', e);
          monthShenShaCell.setText('神煞处理错误');
        }
      } else {
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
          dayShenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理日柱第 ${i+1} 个神煞: ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理日柱神煞出错:', e);
          dayShenShaCell.setText('神煞处理错误');
        }
      } else {
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
          hourShenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理时柱第 ${i+1} 个神煞: ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理时柱神煞出错:', e);
          hourShenShaCell.setText('神煞处理错误');
        }
      } else {
        console.log('时柱没有神煞数据');
        hourShenShaCell.setText('无神煞');
      }
    }
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
    console.log('大运神煞显示设置daYun:', this.baziInfo.showShenSha?.daYun);
    console.log('大运神煞显示设置daYun类型:', typeof this.baziInfo.showShenSha?.daYun);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.daYun === false) {
      console.log('根据设置隐藏大运神煞行');
      shenShaRow.style.display = 'none';
    } else {
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
          dy.shenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理大运 ${dy.ganZhi} 的第 ${i+1} 个神煞: ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理大运神煞出错:', e);
          cell.setText('神煞处理错误');
        }
      } else {
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
  private createLiuNianInfo() {
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
    console.log('流年神煞显示设置liuNian:', this.baziInfo.showShenSha?.liuNian);
    console.log('流年神煞显示设置liuNian类型:', typeof this.baziInfo.showShenSha?.liuNian);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuNian === false) {
      console.log('根据设置隐藏流年神煞行');
      shenShaRow.style.display = 'none';
    } else {
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
        ln.shenSha.forEach((shenSha: string, i: number) => {
          console.log(`处理流年 ${ln.year} 的第 ${i+1} 个神煞: ${shenSha}`);

          const shenShaInfo = this.getShenShaInfo(shenSha);
          const type = shenShaInfo?.type || '未知';
          let cssClass = '';
          if (type === '吉神') {
            cssClass = 'shensha-good';
          } else if (type === '凶神') {
            cssClass = 'shensha-bad';
          } else if (type === '吉凶神') {
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
      } else {
        console.log(`流年 ${ln.year} 没有神煞数据`);
        cell.setText('无神煞');
      }
    });

    console.log('流年信息创建完成');
  }

  /**
   * 创建小运信息
   */
  private createXiaoYunInfo() {
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
    console.log('小运神煞显示设置xiaoYun:', this.baziInfo.showShenSha?.xiaoYun);
    console.log('小运神煞显示设置xiaoYun类型:', typeof this.baziInfo.showShenSha?.xiaoYun);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.xiaoYun === false) {
      console.log('根据设置隐藏小运神煞行');
      shenShaRow.style.display = 'none';
    } else {
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
        xy.shenSha.forEach((shenSha: string, i: number) => {
          console.log(`处理小运 ${xy.year} 的第 ${i+1} 个神煞: ${shenSha}`);

          const shenShaInfo = this.getShenShaInfo(shenSha);
          const type = shenShaInfo?.type || '未知';
          let cssClass = '';
          if (type === '吉神') {
            cssClass = 'shensha-good';
          } else if (type === '凶神') {
            cssClass = 'shensha-bad';
          } else if (type === '吉凶神') {
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
      } else {
        console.log(`小运 ${xy.year} 没有神煞数据`);
        cell.setText('无神煞');
      }
    });

    console.log('小运信息创建完成');
  }

  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
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
    console.log('流月神煞显示设置liuYue:', this.baziInfo.showShenSha?.liuYue);
    console.log('流月神煞显示设置liuYue类型:', typeof this.baziInfo.showShenSha?.liuYue);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuYue === false) {
      console.log('根据设置隐藏流月神煞行');
      shenShaRow.style.display = 'none';
    } else {
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
        ly.shenSha.forEach((shenSha: string, i: number) => {
          console.log(`处理流月 ${ly.month} 的第 ${i+1} 个神煞: ${shenSha}`);

          const shenShaInfo = this.getShenShaInfo(shenSha);
          const type = shenShaInfo?.type || '未知';
          let cssClass = '';
          if (type === '吉神') {
            cssClass = 'shensha-good';
          } else if (type === '凶神') {
            cssClass = 'shensha-bad';
          } else if (type === '吉凶神') {
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
      } else {
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
  private handleLiuNianSelect(year: number) {
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
  private updateLiuNianTable(liuNian: any[]) {
    const liuNianSection = this.container.querySelector(`.bazi-liunian-section[data-bazi-id="${this.id}"]`);
    if (!liuNianSection) return;

    // 获取表格
    const table = liuNianSection.querySelector('.bazi-view-liunian-table');
    if (!table) return;

    // 清空表格
    table.empty();

    // 调试信息：输出流年数据
    console.log('流年数据:', liuNian);
    console.log('流年神煞数据示例:', liuNian[0]?.shenSha);

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
    console.log('流年神煞显示设置liuNian(更新表格):', this.baziInfo.showShenSha?.liuNian);
    console.log('流年神煞显示设置liuNian类型(更新表格):', typeof this.baziInfo.showShenSha?.liuNian);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuNian === false) {
      console.log('根据设置隐藏流年神煞行(更新表格)');
      shenShaRow.style.display = 'none';
    } else {
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
          ln.shenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理流年 ${ln.year} 的第 ${i+1} 个神煞(更新表格): ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理流年神煞出错:', e);
          cell.setText('神煞处理错误');
        }
      } else {
        console.log(`流年 ${ln.year} 没有神煞数据(更新表格)`);
        cell.setText('无神煞');
      }
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

    // 调试信息：输出小运数据
    console.log('小运数据:', xiaoYun);
    console.log('小运神煞数据示例:', xiaoYun[0]?.shenSha);

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
    console.log('小运神煞显示设置xiaoYun(更新表格):', this.baziInfo.showShenSha?.xiaoYun);
    console.log('小运神煞显示设置xiaoYun类型(更新表格):', typeof this.baziInfo.showShenSha?.xiaoYun);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.xiaoYun === false) {
      console.log('根据设置隐藏小运神煞行(更新表格)');
      shenShaRow.style.display = 'none';
    } else {
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
          xy.shenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理小运 ${xy.year} 的第 ${i+1} 个神煞(更新表格): ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理小运神煞出错:', e);
          cell.setText('神煞处理错误');
        }
      } else {
        console.log(`小运 ${xy.year} 没有神煞数据(更新表格)`);
        cell.setText('无神煞');
      }
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

    // 调试信息：输出流月数据
    console.log('流月数据:', liuYue);
    console.log('流月神煞数据示例:', liuYue[0]?.shenSha);

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
    console.log('流月神煞显示设置liuYue(更新表格):', this.baziInfo.showShenSha?.liuYue);
    console.log('流月神煞显示设置liuYue类型(更新表格):', typeof this.baziInfo.showShenSha?.liuYue);

    // 强制显示神煞行
    shenShaRow.style.display = ''; // 确保显示

    // 根据设置显示或隐藏神煞行
    if (this.baziInfo.showShenSha && this.baziInfo.showShenSha.liuYue === false) {
      console.log('根据设置隐藏流月神煞行(更新表格)');
      shenShaRow.style.display = 'none';
    } else {
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
          ly.shenSha.forEach((shenSha: string, i: number) => {
            console.log(`处理流月 ${ly.month} 的第 ${i+1} 个神煞(更新表格): ${shenSha}`);

            const shenShaInfo = this.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';
            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
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
        } catch (e) {
          console.error('处理流月神煞出错:', e);
          cell.setText('神煞处理错误');
        }
      } else {
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
   * 获取神煞信息
   * @param shenSha 神煞名称
   * @returns 神煞信息
   */
  private getShenShaInfo(shenSha: string) {
    return ShenShaService.getShenShaInfo(shenSha);
  }

  /**
   * 显示神煞详情
   * @param shenSha 神煞名称
   */
  private showShenShaDetail(shenSha: string) {
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
    } else if (shenShaInfo.type === '凶神') {
      type.style.color = 'red';
    } else if (shenShaInfo.type === '吉凶神') {
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
    copyTextEl.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        new Notice('神煞信息已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        new Notice('复制失败，请手动选择并复制');
      }
    });

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
  getHTML(): string {
    return this.container.innerHTML;
  }
}
