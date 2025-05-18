import { BaziInfo } from '../types/BaziInfo';
import { ShenShaService } from '../services/ShenShaService';

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
    branchRow.createEl('td', { text: '地支', cls: 'bazi-table-label' });
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
      yearNaYinCell.createSpan({
        text: yearNaYin,
        cls: `wuxing-${this.getWuXingClass(wuXing)}`
      });
    }

    // 月柱纳音
    const monthNaYin = this.baziInfo.monthNaYin || '';
    const monthNaYinCell = naYinRow.createEl('td');
    if (monthNaYin) {
      const wuXing = this.extractWuXingFromNaYin(monthNaYin);
      monthNaYinCell.createSpan({
        text: monthNaYin,
        cls: `wuxing-${this.getWuXingClass(wuXing)}`
      });
    }

    // 日柱纳音
    const dayNaYin = this.baziInfo.dayNaYin || '';
    const dayNaYinCell = naYinRow.createEl('td');
    if (dayNaYin) {
      const wuXing = this.extractWuXingFromNaYin(dayNaYin);
      dayNaYinCell.createSpan({
        text: dayNaYin,
        cls: `wuxing-${this.getWuXingClass(wuXing)}`
      });
    }

    // 时柱纳音
    const hourNaYin = this.baziInfo.hourNaYin || '';
    const hourNaYinCell = naYinRow.createEl('td');
    if (hourNaYin) {
      const wuXing = this.extractWuXingFromNaYin(hourNaYin);
      hourNaYinCell.createSpan({
        text: hourNaYin,
        cls: `wuxing-${this.getWuXingClass(wuXing)}`
      });
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
      const yearShenSha: string[] = [];
      const monthShenSha: string[] = [];
      const dayShenSha: string[] = [];
      const hourShenSha: string[] = [];

      this.baziInfo.shenSha.forEach(shenSha => {
        if (shenSha.startsWith('年柱:')) {
          yearShenSha.push(shenSha.substring(3));
        } else if (shenSha.startsWith('月柱:')) {
          monthShenSha.push(shenSha.substring(3));
        } else if (shenSha.startsWith('日柱:')) {
          dayShenSha.push(shenSha.substring(3));
        } else if (shenSha.startsWith('时柱:')) {
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
            const type = shenShaInfo?.type || '未知';

            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
              cssClass = 'shensha-mixed';
            }

            const span = yearCell.createSpan({
              text: shenSha,
              cls: cssClass,
              attr: { 'title': shenShaInfo?.explanation || '' }
            });

            span.addEventListener('click', () => {
              this.showShenShaExplanation(shenSha);
            });

            // 添加空格分隔
            yearCell.createSpan({ text: ' ' });
          });
        } else {
          yearCell.textContent = '无';
        }

        // 月柱神煞单元格
        const monthCell = shenShaRow.createEl('td');
        if (monthShenSha.length > 0) {
          monthShenSha.forEach(shenSha => {
            const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';

            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
              cssClass = 'shensha-mixed';
            }

            const span = monthCell.createSpan({
              text: shenSha,
              cls: cssClass,
              attr: { 'title': shenShaInfo?.explanation || '' }
            });

            span.addEventListener('click', () => {
              this.showShenShaExplanation(shenSha);
            });

            // 添加空格分隔
            monthCell.createSpan({ text: ' ' });
          });
        } else {
          monthCell.textContent = '无';
        }

        // 日柱神煞单元格
        const dayCell = shenShaRow.createEl('td');
        if (dayShenSha.length > 0) {
          dayShenSha.forEach(shenSha => {
            const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';

            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
              cssClass = 'shensha-mixed';
            }

            const span = dayCell.createSpan({
              text: shenSha,
              cls: cssClass,
              attr: { 'title': shenShaInfo?.explanation || '' }
            });

            span.addEventListener('click', () => {
              this.showShenShaExplanation(shenSha);
            });

            // 添加空格分隔
            dayCell.createSpan({ text: ' ' });
          });
        } else {
          dayCell.textContent = '无';
        }

        // 时柱神煞单元格
        const hourCell = shenShaRow.createEl('td');
        if (hourShenSha.length > 0) {
          hourShenSha.forEach(shenSha => {
            const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);
            const type = shenShaInfo?.type || '未知';

            let cssClass = '';
            if (type === '吉神') {
              cssClass = 'shensha-good';
            } else if (type === '凶神') {
              cssClass = 'shensha-bad';
            } else if (type === '吉凶神') {
              cssClass = 'shensha-mixed';
            }

            const span = hourCell.createSpan({
              text: shenSha,
              cls: cssClass,
              attr: { 'title': shenShaInfo?.explanation || '' }
            });

            span.addEventListener('click', () => {
              this.showShenShaExplanation(shenSha);
            });

            // 添加空格分隔
            hourCell.createSpan({ text: ' ' });
          });
        } else {
          hourCell.textContent = '无';
        }
      }
    }

    // 移除特殊信息区域中的神煞组合分析，因为已经在命盘表格中显示了
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

    if (this.baziInfo.shenGong) {
      infoList.createEl('li', { text: `身宫: ${this.baziInfo.shenGong}` });
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

      wuXingItem.createSpan({
        text: `金(${jin})`,
        cls: 'wuxing-jin-tag'
      });

      wuXingItem.createSpan({
        text: `木(${mu})`,
        cls: 'wuxing-mu-tag'
      });

      wuXingItem.createSpan({
        text: `水(${shui})`,
        cls: 'wuxing-shui-tag'
      });

      wuXingItem.createSpan({
        text: `火(${huo})`,
        cls: 'wuxing-huo-tag'
      });

      wuXingItem.createSpan({
        text: `土(${tu})`,
        cls: 'wuxing-tu-tag'
      });
    }

    // 添加日主旺衰信息
    if (this.baziInfo.riZhuStrength) {
      infoList.createEl('li', {
        text: `日主旺衰: ${this.baziInfo.riZhuStrength}`,
        cls: 'rizhu-strength'
      });
    }

    // 公历、农历、性别信息已移至命盘表格前
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
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      // 如果有干支，按五行颜色显示
      if (dy.ganZhi && dy.ganZhi.length >= 2) {
        const stem = dy.ganZhi[0]; // 天干
        const branch = dy.ganZhi[1]; // 地支

        // 创建天干元素并设置五行颜色
        cell.createSpan({
          text: stem,
          cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(stem))}`
        });

        // 创建地支元素并设置五行颜色
        cell.createSpan({
          text: branch,
          cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(branch))}`
        });
      } else {
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
        xkRow.createEl('td', {
          text: dy.xunKong || '',
          cls: 'bazi-xunkong-cell'
        });
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
          cell.createSpan({
            text: naYin,
            cls: `wuxing-${this.getWuXingClass(wuXing)}`
          });
        }
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

    // 计算年干支
    const stemIndex = (year - 4) % 10;
    const yearStem = stems[stemIndex];

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
        cls: 'bazi-liunian-cell',
        attr: { 'data-year': ln.year.toString() }
      });

      // 如果有干支，按五行颜色显示
      if (ln.ganZhi && ln.ganZhi.length >= 2) {
        const stem = ln.ganZhi[0]; // 天干
        const branch = ln.ganZhi[1]; // 地支

        // 创建天干元素并设置五行颜色
        cell.createSpan({
          text: stem,
          cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(stem))}`
        });

        // 创建地支元素并设置五行颜色
        cell.createSpan({
          text: branch,
          cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(branch))}`
        });
      } else {
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
        lnXkRow.createEl('td', {
          text: ln.xunKong || '',
          cls: 'bazi-xunkong-cell'
        });
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
          cell.createSpan({
            text: stem,
            cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(stem))}`
          });

          // 创建地支元素并设置五行颜色
          cell.createSpan({
            text: branch,
            cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(branch))}`
          });
        } else {
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
        xyXkRow.createEl('td', {
          text: xy ? (xy.xunKong || '') : '',
          cls: 'bazi-xunkong-cell'
        });
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
      } else if (ly.index !== undefined) {
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
        cell.createSpan({
          text: stem,
          cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(stem))}`
        });

        // 创建地支元素并设置五行颜色
        cell.createSpan({
          text: branch,
          cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(branch))}`
        });
      } else {
        // 如果没有干支或格式不正确，直接显示原文本
        cell.textContent = ly.ganZhi || '';
      }

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        this.liuYueTable?.querySelectorAll('.bazi-liuyue-cell').forEach(c => {
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

      xkRow.createEl('td', {
        text: xunKong,
        cls: 'bazi-xunkong-cell'
      });
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
          cell.createSpan({
            text: naYin,
            cls: `wuxing-${this.getWuXingClass(wuXing)}`
          });
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
  private generateLiuNianForDaYun(daYun: any): Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> {
    // 如果没有起始年或结束年，返回空数组
    if (!daYun.startYear) {
      return [];
    }

    // 计算结束年（如果未定义，使用起始年+9）
    const endYear = daYun.endYear ?? (daYun.startYear + 9);

    // 生成流年数据
    const liuNianData: Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> = [];
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
  private generateXiaoYunForDaYun(daYun: any): Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> {
    // 如果没有起始年或结束年，返回空数组
    if (!daYun.startYear) {
      return [];
    }

    // 计算结束年（如果未定义，使用起始年+9）
    const endYear = daYun.endYear ?? (daYun.startYear + 9);

    // 生成小运数据
    const xiaoYunData: Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> = [];
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

    // 获取日干，用于计算十神
    const dayStem = this.baziInfo.dayStem;

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

  /**
   * 获取地支对应的五行
   * @param branch 地支
   * @returns 五行
   */
  private getBranchWuXing(branch: string | undefined): string {
    if (!branch) return '未知';

    const map: {[key: string]: string} = {
      '子': '水',
      '丑': '土',
      '寅': '木',
      '卯': '木',
      '辰': '土',
      '巳': '火',
      '午': '火',
      '未': '土',
      '申': '金',
      '酉': '金',
      '戌': '土',
      '亥': '水'
    };

    return map[branch] || '未知';
  }

  /**
   * 从纳音中提取五行属性
   * @param naYin 纳音
   * @returns 五行
   */
  private extractWuXingFromNaYin(naYin: string): string {
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
  private createColoredHideGan(container: HTMLElement, hideGanText: string): void {
    if (!hideGanText) {
      container.textContent = '';
      return;
    }

    // 如果藏干是逗号分隔的，分别处理每个藏干
    if (hideGanText.includes(',')) {
      const hideGans = hideGanText.split(',');
      hideGans.forEach((gan, index) => {
        const wuXing = this.getStemWuXing(gan);
        container.createSpan({
          text: gan,
          cls: `wuxing-${this.getWuXingClass(wuXing)}`
        });

        // 如果不是最后一个，添加逗号分隔
        if (index < hideGans.length - 1) {
          container.createSpan({ text: ',' });
        }
      });
    } else {
      // 单个藏干
      for (let i = 0; i < hideGanText.length; i++) {
        const gan = hideGanText[i];
        const wuXing = this.getStemWuXing(gan);
        container.createSpan({
          text: gan,
          cls: `wuxing-${this.getWuXingClass(wuXing)}`
        });
      }
    }
  }

  /**
   * 获取天干对应的五行
   * @param stem 天干
   * @returns 五行
   */
  private getStemWuXing(stem: string): string {
    const map: {[key: string]: string} = {
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
  private getShiShen(dayStem: string, stem: string): string {
    // 天干顺序
    const stems = "甲乙丙丁戊己庚辛壬癸";

    // 五行属性（未使用）
    // const wuxing = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];

    // 十神名称
    const shiShenNames = [
      ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"],  // 阳干
      ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"]   // 阴干
    ];

    // 获取日干和目标天干的索引
    const dayStemIndex = stems.indexOf(dayStem);
    const stemIndex = stems.indexOf(stem);

    if (dayStemIndex === -1 || stemIndex === -1) {
      return '';
    }

    // 判断日干阴阳
    const dayYinYang = dayStemIndex % 2 === 0 ? 0 : 1;  // 0为阳干，1为阴干

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
  private getDiShi(dayStem: string, branch: string): string {
    // 地支顺序
    const branches = "子丑寅卯辰巳午未申酉戌亥";

    // 长生十二神名称
    const diShiNames = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];

    // 各天干的长生地支起点
    const startPoints: Record<string, number> = {
      "甲": branches.indexOf("亥"),  // 甲木长生在亥
      "乙": branches.indexOf("午"),  // 乙木长生在午
      "丙": branches.indexOf("寅"),  // 丙火长生在寅
      "丁": branches.indexOf("酉"),  // 丁火长生在酉
      "戊": branches.indexOf("寅"),  // 戊土长生在寅
      "己": branches.indexOf("酉"),  // 己土长生在酉
      "庚": branches.indexOf("巳"),  // 庚金长生在巳
      "辛": branches.indexOf("子"),  // 辛金长生在子
      "壬": branches.indexOf("申"),  // 壬水长生在申
      "癸": branches.indexOf("卯")   // 癸水长生在卯
    };

    // 阴阳顺逆方向
    const directions: Record<string, number> = {
      "甲": 1,  // 阳干顺行
      "乙": -1, // 阴干逆行
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
  private showShenShaExplanation(shenSha: string) {
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
    } else if (explanation.type === '凶神') {
      typeClass += ' bazi-modal-type-bad';
    } else if (explanation.type === '吉凶神') {
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
          } else if (combo.type === 'bad') {
            comboContainer.classList.add('combo-bad');
          } else if (combo.type === 'mixed') {
            comboContainer.classList.add('combo-mixed');
          }

          const comboTitle = document.createElement('div');

          // 根据组合级别添加不同的标签
          let levelText = '';
          let levelClass = '';
          if (combo.level === 4) {
            levelText = '【四神煞组合】';
            levelClass = 'bazi-combination-level-4';
          } else if (combo.level === 3) {
            levelText = '【三神煞组合】';
            levelClass = 'bazi-combination-level-3';
          } else {
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
          } else if (combo.type === 'bad') {
            typeText = '凶神组合';
            typeClass = 'bazi-combo-type bazi-combo-type-bad';
          } else if (combo.type === 'mixed') {
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
          } else {
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
  private showShenShaCombinationAnalysis(combination: { combination: string; analysis: string }) {
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
        } else if (shenShaInfo.type === '凶神') {
          typeClass += ' bazi-modal-type-bad';
        } else if (shenShaInfo.type === '吉凶神') {
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
  private addShenShaInfo(_infoList: HTMLElement) {
    // 不再在特殊信息区域显示神煞信息，因为已经在命盘表格中显示了
    return;
  }
}
