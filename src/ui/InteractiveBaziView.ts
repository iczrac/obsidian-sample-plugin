import { BaziInfo } from '../types/BaziInfo';
import { ShenShaService } from '../services/ShenShaService';
import { WuXingService } from '../services/WuXingService';
import { GeJuService } from '../services/GeJuService';
import { GeJuTrendService } from '../services/GeJuTrendService';
import { GeJuTrendChart } from './GeJuTrendChart';
import { GeJuJudgeService } from '../services/GeJuJudgeService';
import { BaziService } from '../services/BaziService';

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

  // 已显示的弹窗列表，用于防止重复显示
  private shownModals: HTMLElement[] = [];

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
  private addTableCellListeners() {
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
    } else if (this.baziInfo.yearBranch) {
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
    } else if (this.baziInfo.monthBranch) {
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
    } else if (this.baziInfo.dayBranch) {
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
    } else if (this.baziInfo.hourBranch) {
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
              attr: { 'title': shenShaInfo?.description || '' }
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
              attr: { 'title': shenShaInfo?.description || '' }
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
              attr: { 'title': shenShaInfo?.description || '' }
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
              attr: { 'title': shenShaInfo?.description || '' }
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
      } else {
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
      } else {
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
      } else {
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
          } else if (strengthValue >= 60) {
            strengthSpan.addClass('geju-strength-medium');
          } else {
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
        } else {
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
    if (!Array.isArray(this.baziInfo.daYun)) {
      return;
    }

    const selectedDaYun = this.baziInfo.daYun[index];
    if (!selectedDaYun) {
      return;
    }

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
      if (!selectedDaYun) return false;
      const startYear = selectedDaYun.startYear;
      const endYear = selectedDaYun.endYear ?? (startYear + 9);
      return xy.year >= startYear && xy.year <= endYear;
    }) || [];

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
        const stemSpan = cell.createSpan({ text: stem });
        this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));

        // 创建地支元素并设置五行颜色
        const branchSpan = cell.createSpan({ text: branch });
        this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
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
        } else {
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
        } else {
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
        const stemSpan = cell.createSpan({ text: stem });
        this.setWuXingColorDirectly(stemSpan, this.getStemWuXing(stem));

        // 创建地支元素并设置五行颜色
        const branchSpan = cell.createSpan({ text: branch });
        this.setWuXingColorDirectly(branchSpan, this.getBranchWuXing(branch));
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
      } else {
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
  private generateLiuNianForDaYun(daYun: any): Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> {
    // 如果没有起始年或结束年，返回空数组
    if (!daYun || !daYun.startYear) {
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
    if (!daYun || !daYun.startYear) {
      console.log('没有起始年，无法生成小运数据');
      return [];
    }

    // 计算结束年（如果未定义，使用起始年+9）
    const endYear = daYun.endYear ?? (daYun.startYear + 9);
    console.log(`小运年份范围: ${daYun.startYear} - ${endYear}`);

    // 生成小运数据
    const xiaoYunData: Array<{year: number, age: number, ganZhi: string, xunKong: string, shiShenGan?: string, diShi?: string}> = [];
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
    } else {
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
   * 直接在元素上设置五行颜色
   * @param element HTML元素
   * @param wuXing 五行
   */
  private setWuXingColorDirectly(element: HTMLElement, wuXing: string | undefined): void {
    if (!wuXing) return;

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
  private applyStemWuXingColor(element: HTMLElement, stem: string): void {
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
  private applyBranchWuXingColor(element: HTMLElement, branch: string): void {
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
        const ganSpan = container.createSpan({ text: gan });
        this.setWuXingColorDirectly(ganSpan, wuXing);

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
    // 使用BaziService中的方法
    return BaziService.getShiShen(dayStem, stem);
  }

  /**
   * 获取地支藏干的十神
   * @param dayStem 日干（日主）
   * @param branch 地支
   * @returns 藏干对应的十神数组
   */
  private getHiddenShiShen(dayStem: string, branch: string): string[] {
    // 使用BaziService中的方法
    return BaziService.getHiddenShiShen(dayStem, branch);
  }

  /**
   * 获取地支藏干
   * @param branch 地支
   * @returns 藏干字符串，多个藏干用逗号分隔
   */
  private getHideGan(branch: string): string {
    // 使用BaziService中的方法
    return BaziService.getHideGan(branch);
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
    } else if (shenShaInfo.type === '凶神') {
      type.style.backgroundColor = 'rgba(220, 20, 60, 0.1)';
      type.style.color = '#e76f51';
      type.style.border = '1px solid #e76f51';
    } else if (shenShaInfo.type === '吉凶神') {
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
          } else if (combo.type === 'bad') {
            comboContainer.style.borderLeft = '3px solid #e76f51';
          } else if (combo.type === 'mixed') {
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
          } else if (combo.level === 3) {
            levelTag.textContent = '三神煞组合';
            levelTag.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
            levelTag.style.color = '#0000ff';
            levelTag.style.border = '1px solid #0000ff';
          } else {
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
          } else if (combo.type === 'bad') {
            typeTag.textContent = '凶神组合';
            typeTag.style.backgroundColor = 'rgba(220, 20, 60, 0.1)';
            typeTag.style.color = '#e76f51';
            typeTag.style.border = '1px solid #e76f51';
          } else if (combo.type === 'mixed') {
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
    const handleKeyDown = (e: KeyboardEvent) => {
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
  private addShenShaInfo(infoList: HTMLElement) {
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
    const goodShenSha: string[] = [];
    const badShenSha: string[] = [];
    const mixedShenSha: string[] = [];

    // 处理神煞列表
    this.baziInfo.shenSha.forEach(shenSha => {
      // 获取神煞信息
      const shenShaInfo = ShenShaService.getShenShaInfo(shenSha);

      if (shenShaInfo) {
        // 根据类型分类
        if (shenShaInfo.type === '吉神') {
          goodShenSha.push(shenSha);
        } else if (shenShaInfo.type === '凶神') {
          badShenSha.push(shenSha);
        } else {
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
  private getWuXingClassFromName(wuXing: string): string {
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
  private showWuXingExplanation(wuXing: string, value: string) {
    // 获取五行详细信息
    const wuXingInfo = WuXingService.getWuXingInfo(wuXing);
    if (!wuXingInfo) return;

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
    } catch (error) {
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
  private getActualWuXingCalculation(wuXing: string): string {
    if (!this.baziInfo || !this.baziInfo.wuXingStrength) {
      return '';
    }

    // 检查是否有详细信息
    if (!('details' in this.baziInfo.wuXingStrength)) {
      return `无法获取${wuXing}五行强度详情，请更新八字计算引擎。`;
    }

    // 获取五行强度详情
    const details = (this.baziInfo.wuXingStrength as any).details;

    // 检查 details 是否存在
    if (!details) {
      return `无法获取五行强度详情，请检查八字信息是否完整。`;
    }

    // 获取特定五行的详情
    let wuXingDetails: {
      tianGan?: number;
      diZhiCang?: number;
      naYin?: number;
      season?: number;
      combination?: number;
      total?: number;
      monthDominant?: number;
    } = {};

    // 根据五行类型获取对应的详情，并进行空值检查
    switch (wuXing) {
      case '金': wuXingDetails = details.jin || {}; break;
      case '木': wuXingDetails = details.mu || {}; break;
      case '水': wuXingDetails = details.shui || {}; break;
      case '火': wuXingDetails = details.huo || {}; break;
      case '土': wuXingDetails = details.tu || {}; break;
      default: return '';
    }

    // 计算总分
    const wuXingStrength = this.baziInfo.wuXingStrength as any;
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
      let yearWeight = 1.2;  // 默认使用优化后的权重
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
      let yearWeight = 0.8;  // 默认使用优化后的权重
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
            } else {
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
            } else {
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
            } else {
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
            } else {
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
      let yearWeight = 0.6;  // 默认使用优化后的权重
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
      wang: 2.5,   // 旺相系数（从2.0提高到2.5）
      xiang: 1.2,  // 相旺系数（从1.0提高到1.2）
      ping: 0.0,   // 平和系数（保持不变）
      qiu: -1.2,   // 囚系数（从-1.0增强到-1.2）
      si: -1.8     // 死系数（从-1.5增强到-1.8）
    };

    if (wuXingDetails.season !== undefined && wuXingDetails.season !== 0) {
      switch (season) {
        case '春季':
          if (wuXing === '木') calculation += `- 春季木旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
          if (wuXing === '火') calculation += `- 春季火相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
          if (wuXing === '土') calculation += `- 春季土平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
          if (wuXing === '金') calculation += `- 春季金囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
          if (wuXing === '水') calculation += `- 春季水死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
          break;
        case '夏季':
          if (wuXing === '火') calculation += `- 夏季火旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
          if (wuXing === '土') calculation += `- 夏季土相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
          if (wuXing === '金') calculation += `- 夏季金平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
          if (wuXing === '水') calculation += `- 夏季水囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
          if (wuXing === '木') calculation += `- 夏季木死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
          break;
        case '秋季':
          if (wuXing === '金') calculation += `- 秋季金旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
          if (wuXing === '水') calculation += `- 秋季水相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
          if (wuXing === '木') calculation += `- 秋季木平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
          if (wuXing === '火') calculation += `- 秋季火囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
          if (wuXing === '土') calculation += `- 秋季土死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
          break;
        case '冬季':
          if (wuXing === '水') calculation += `- 冬季水旺，得分+${seasonAdjust.wang.toFixed(1)}（旺相系数，提高以强化季节影响）\n`;
          if (wuXing === '木') calculation += `- 冬季木相，得分+${seasonAdjust.xiang.toFixed(1)}（相旺系数，提高以强化季节影响）\n`;
          if (wuXing === '火') calculation += `- 冬季火平，得分${seasonAdjust.ping.toFixed(1)}（平和系数）\n`;
          if (wuXing === '土') calculation += `- 冬季土囚，得分${seasonAdjust.qiu.toFixed(1)}（囚系数，增强以强化季节影响）\n`;
          if (wuXing === '金') calculation += `- 冬季金死，得分${seasonAdjust.si.toFixed(1)}（死系数，增强以强化季节影响）\n`;
          break;
      }
    }

    // 月令当令加成
    calculation += `\n【月令当令加成】\n`;

    // 获取配置中的权重（如果可能）
    const monthDominantBonus = {
      dominant: 2.0,   // 当令加成（从1.5提高到2.0）
      related: 1.0,    // 相旺加成（从0.8提高到1.0）
      neutral: 0.0,    // 平和加成（保持不变）
      weak: -0.5,      // 囚加成（新增）
      dead: -0.8       // 死加成（新增）
    };

    // 显示月令当令加成
    if ((wuXingDetails as any).monthDominant !== undefined && (wuXingDetails as any).monthDominant !== 0) {
      switch (season) {
        case '春季':
          if (wuXing === '木') calculation += `- 春季木当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
          if (wuXing === '火') calculation += `- 春季火相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
          if (wuXing === '土') calculation += `- 春季土平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
          if (wuXing === '金') calculation += `- 春季金囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
          if (wuXing === '水') calculation += `- 春季水死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
          break;
        case '夏季':
          if (wuXing === '火') calculation += `- 夏季火当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
          if (wuXing === '土') calculation += `- 夏季土相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
          if (wuXing === '金') calculation += `- 夏季金平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
          if (wuXing === '水') calculation += `- 夏季水囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
          if (wuXing === '木') calculation += `- 夏季木死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
          break;
        case '秋季':
          if (wuXing === '金') calculation += `- 秋季金当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
          if (wuXing === '水') calculation += `- 秋季水相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
          if (wuXing === '木') calculation += `- 秋季木平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
          if (wuXing === '火') calculation += `- 秋季火囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
          if (wuXing === '土') calculation += `- 秋季土死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
          break;
        case '冬季':
          if (wuXing === '水') calculation += `- 冬季水当令，得分+${monthDominantBonus.dominant.toFixed(1)}（当令加成，提高以强调月令重要性）\n`;
          if (wuXing === '木') calculation += `- 冬季木相旺，得分+${monthDominantBonus.related.toFixed(1)}（相旺加成，提高以强调月令重要性）\n`;
          if (wuXing === '火') calculation += `- 冬季火平和，得分${monthDominantBonus.neutral.toFixed(1)}（平和加成）\n`;
          if (wuXing === '土') calculation += `- 冬季土囚，得分${monthDominantBonus.weak.toFixed(1)}（囚加成，新增负面调整）\n`;
          if (wuXing === '金') calculation += `- 冬季金死，得分${monthDominantBonus.dead.toFixed(1)}（死加成，新增负面调整）\n`;
          break;
      }
    }

    // 组合调整
    calculation += `\n【组合调整】\n`;

    // 获取配置中的权重（如果可能）
    const combinationWeight = {
      tianGanWuHe: 0.8,      // 天干五合权重（从0.6提高到0.8）
      diZhiSanHe: 1.5,       // 地支三合权重（从1.2提高到1.5）
      diZhiSanHui: 1.2,      // 地支三会权重（从1.0提高到1.2）
      partialSanHe: 0.9,     // 部分三合权重（新增，为完整三合的60%）
      partialSanHui: 0.7     // 部分三会权重（新增，为完整三会的60%）
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
          const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined) as string[];

          // 根据三合类型获取对应的地支
          const sanHePatterns: {[key: string]: string[]} = {
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
            } else {
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
          const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined) as string[];

          // 根据三会类型获取对应的地支
          const sanHuiPatterns: {[key: string]: string[]} = {
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
            } else {
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
    calculation += `  • 月令加成：${(wuXingDetails as any).monthDominant ? (wuXingDetails as any).monthDominant.toFixed(2) : '0.00'}\n`;
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
  private showRiZhuCalculation(riZhu: string, wuXing: string) {
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
    type.textContent = `日主五行: ${wuXing.charAt(0)}`;  // 只取第一个字符，避免显示"火火"
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
    } catch (error) {
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
  private getActualRiZhuCalculation(riZhu: string, wuXing: string): string {
    if (!this.baziInfo || !this.baziInfo.riZhuStrengthDetails) {
      return '';
    }

    const details = this.baziInfo.riZhuStrengthDetails;

    // 构建计算过程
    let calculation = `日主旺衰实际计算过程：\n\n`;

    // 基本信息
    calculation += `【基本信息】\n`;
    calculation += `- 日主五行：${wuXing.charAt(0)}\n`;  // 只取第一个字符，避免显示"火火"
    calculation += `- 所处季节：${details.season || '未知'}\n\n`;

    // 五行强度分析
    calculation += `【五行强度分析】\n`;
    if (this.baziInfo.wuXingStrength) {
      const wuXingStrength = this.baziInfo.wuXingStrength as any;
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
      const wuXingStrength = this.baziInfo.wuXingStrength as any;
      switch (wuXing) {
        case '金': dayWuXingStrength = wuXingStrength.jin; break;
        case '木': dayWuXingStrength = wuXingStrength.mu; break;
        case '水': dayWuXingStrength = wuXingStrength.shui; break;
        case '火': dayWuXingStrength = wuXingStrength.huo; break;
        case '土': dayWuXingStrength = wuXingStrength.tu; break;
      }
      calculation += `- 日主${wuXing}五行强度：${dayWuXingStrength.toFixed(2)}\n\n`;
    }

    // 日主旺衰判断
    calculation += `【日主旺衰判断】\n`;
    if (details.judgmentRules) {
      calculation += `${details.judgmentRules}\n\n`;
    } else {
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
    } else {
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
  private checkDiZhiSanHui(): string {
    const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined) as string[];

    // 检查三会
    const sanHuiPatterns = [
      {pattern: ['寅', '卯', '辰'], type: '寅卯辰'},
      {pattern: ['巳', '午', '未'], type: '巳午未'},
      {pattern: ['申', '酉', '戌'], type: '申酉戌'},
      {pattern: ['亥', '子', '丑'], type: '亥子丑'}
    ];

    for (const {pattern, type} of sanHuiPatterns) {
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
  private getWuXingFromSanHui(sanHui: string): string {
    const map: {[key: string]: string} = {
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
  private getWuXingFromStem(stem: string | undefined): string {
    if (!stem) return '';

    const map: {[key: string]: string} = {
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
  private getBranchWuXing(branch: string | undefined): string {
    if (!branch) return '';

    const map: {[key: string]: string} = {
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
  private getSeason(branch: string | undefined): string {
    if (!branch) return '春季'; // 默认为春季

    const map: {[key: string]: string} = {
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
  private checkTianGanWuHe(): string {
    const { yearStem, monthStem, dayStem, hourStem } = this.baziInfo;
    const stems = [yearStem, monthStem, dayStem, hourStem];

    // 检查五合
    if (stems.includes('甲') && stems.includes('己')) return '甲己';
    if (stems.includes('乙') && stems.includes('庚')) return '乙庚';
    if (stems.includes('丙') && stems.includes('辛')) return '丙辛';
    if (stems.includes('丁') && stems.includes('壬')) return '丁壬';
    if (stems.includes('戊') && stems.includes('癸')) return '戊癸';

    return '';
  }

  /**
   * 获取五合对应的五行
   * @param wuHe 五合组合
   * @returns 五行
   */
  private getWuXingFromWuHe(wuHe: string): string {
    const map: {[key: string]: string} = {
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
  private checkDiZhiSanHe(): string {
    const { yearBranch, monthBranch, dayBranch, hourBranch } = this.baziInfo;
    const branches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(branch => branch !== undefined) as string[];

    // 检查三合
    const sanHePatterns = [
      {pattern: ['子', '申', '辰'], type: '子申辰'},
      {pattern: ['亥', '卯', '未'], type: '亥卯未'},
      {pattern: ['寅', '午', '戌'], type: '寅午戌'},
      {pattern: ['巳', '酉', '丑'], type: '巳酉丑'}
    ];

    for (const {pattern, type} of sanHePatterns) {
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
  private getWuXingFromSanHe(sanHe: string): string {
    const map: {[key: string]: string} = {
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
  private getRiZhuDescription(riZhu: string): string {
    const descriptions: {[key: string]: string} = {
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
  private getRiZhuInfluence(riZhu: string): string {
    const influences: {[key: string]: string} = {
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
  private showRiZhuExplanation(riZhuStrength: string, dayWuXing: string) {
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
    } else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
      yongShenSuggestion = '日主衰弱，宜取印星、比劫为用神，以生扶日主之气。忌用官杀、财星，以免日主更加衰弱。';
    } else {
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
    } else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
      geJuSuggestion = '日主衰弱，适合形成正印格、偏印格、比肩格、劫财格等生扶日主之格局。';
    } else {
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
  private showGeJuExplanation(geJu: string) {
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
  private showGeJuAnalysis(geJu: string, riZhuStrength: string) {
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
  private showGeJuFactors() {
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
        } else if (strengthValue >= 60) {
          progressBar.classList.add('bazi-progress-medium');
        } else {
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
  private showGeJuTrendAnalysis(geJu: string, riZhuWuXing: string) {
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
    } else {
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
    const trendData = GeJuTrendService.generateTrendData(
      geJu,
      riZhuWuXing,
      parseInt(this.baziInfo.birthYear),
      daYunList
    );

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
    } else {
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
    const chart = new GeJuTrendChart(
      chartContainer,
      trendData.trend,
      trendData.keyYears,
      chartContainer.clientWidth,
      chartContainer.clientHeight
    );
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
  private getDaYunList(): { ganZhi: string; startYear: number; endYear: number }[] {
    if (!this.baziInfo.daYun || !this.baziInfo.birthYear) {
      return [];
    }

    const birthYear = parseInt(this.baziInfo.birthYear);
    const daYunStartAge = this.baziInfo.daYunStartAge || 0;
    const daYunList: { ganZhi: string; startYear: number; endYear: number }[] = [];

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
    } else if (typeof this.baziInfo.daYun === 'string') {
      // 如果是字符串类型（兼容旧版本）
      const daYunItems = this.baziInfo.daYun.split(',');

      daYunItems.forEach((item: string, index: number) => {
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
  private showYongShenExplanation(yongShen: string, yongShenDetail: string) {
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
