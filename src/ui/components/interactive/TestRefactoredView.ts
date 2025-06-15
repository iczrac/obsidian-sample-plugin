import { InteractiveBaziView } from '../../InteractiveBaziView';
import { BaziInfo } from '../../../types/BaziInfo';

/**
 * 测试重构后的交互式八字视图
 */
export class TestRefactoredView {
  
  /**
   * 创建测试用的八字数据
   */
  static createTestBaziInfo(): BaziInfo {
    return {
      // 基本信息
      solarDate: '1990年5月15日',
      solarTime: '14:30',
      lunarDate: '四月廿一',
      gender: '1', // 男性

      // 四柱信息
      yearStem: '庚',
      yearBranch: '午',
      monthStem: '辛',
      monthBranch: '巳',
      dayStem: '甲',
      dayBranch: '子',
      timeStem: '辛',
      timeBranch: '未',

      // 藏干信息
      yearHideGan: '丁己',
      monthHideGan: '丙戊庚',
      dayHideGan: '癸',
      timeHideGan: '己丁乙',

      // 十神信息
      yearShiShenGan: '七杀',
      yearShiShenZhi: ['伤官', '偏财'],
      monthShiShenGan: '正官',
      monthShiShenZhi: ['食神', '偏财', '七杀'],
      dayShiShenGan: '比肩',
      dayShiShenZhi: ['正印'],
      timeShiShenGan: '正官',
      timeShiShenZhi: ['偏财', '伤官', '劫财'],

      // 地势信息
      yearDiShi: '死',
      monthDiShi: '病',
      dayDiShi: '帝旺',
      timeDiShi: '养',

      // 纳音信息
      yearNaYin: '路旁土',
      monthNaYin: '白蜡金',
      dayNaYin: '海中金',
      timeNaYin: '路旁土',

      // 旬空信息
      yearXunKong: '戌亥',
      monthXunKong: '戌亥',
      dayXunKong: '戌亥',
      timeXunKong: '戌亥',

      // 生肖信息
      yearShengXiao: '马',
      monthShengXiao: '蛇',
      dayShengXiao: '鼠',
      timeShengXiao: '羊',

      // 神煞信息
      yearShenSha: ['天乙贵人', '太极贵人'],
      monthShenSha: ['月德贵人'],
      dayShenSha: ['桃花', '咸池'],
      timeShenSha: ['华盖'],

      // 大运信息
      daYun: [
        {
          ganZhi: '壬午',
          startAge: 8,
          endAge: 17,
          startYear: 1998,
          endYear: 2007
        },
        {
          ganZhi: '癸未',
          startAge: 18,
          endAge: 27,
          startYear: 2008,
          endYear: 2017
        },
        {
          ganZhi: '甲申',
          startAge: 28,
          endAge: 37,
          startYear: 2018,
          endYear: 2027
        },
        {
          ganZhi: '乙酉',
          startAge: 38,
          endAge: 47,
          startYear: 2028,
          endYear: 2037
        }
      ],

      // 流月信息
      liuYue: [
        { ganZhi: '戊寅', month: 1 },
        { ganZhi: '己卯', month: 2 },
        { ganZhi: '庚辰', month: 3 },
        { ganZhi: '辛巳', month: 4 },
        { ganZhi: '壬午', month: 5 },
        { ganZhi: '癸未', month: 6 },
        { ganZhi: '甲申', month: 7 },
        { ganZhi: '乙酉', month: 8 },
        { ganZhi: '丙戌', month: 9 },
        { ganZhi: '丁亥', month: 10 },
        { ganZhi: '戊子', month: 11 },
        { ganZhi: '己丑', month: 12 }
      ],

      // 神煞显示设置
      showShenSha: {
        siZhu: true,
        daYun: true,
        liuNian: true,
        xiaoYun: true,
        liuYue: true
      }
    };
  }

  /**
   * 测试重构后的视图
   */
  static testRefactoredView(container: HTMLElement, plugin?: any): InteractiveBaziView {
    console.log('🧪 开始测试重构后的交互式八字视图');

    // 创建测试数据
    const testBaziInfo = this.createTestBaziInfo();
    console.log('🧪 测试数据创建完成:', testBaziInfo);

    // 创建重构后的视图
    const refactoredView = new InteractiveBaziView(
      container,
      testBaziInfo,
      'test-refactored-view',
      plugin
    );

    console.log('🧪 重构后的视图创建完成');

    // 添加测试按钮
    this.addTestButtons(container, refactoredView);

    return refactoredView;
  }

  /**
   * 添加测试按钮
   */
  private static addTestButtons(container: HTMLElement, view: InteractiveBaziView) {
    const testButtonContainer = container.createDiv({ cls: 'test-button-container' });
    testButtonContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // 测试大运选择按钮
    const testDaYunBtn = testButtonContainer.createEl('button', { text: '测试大运选择' });
    testDaYunBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 12px;
    `;
    testDaYunBtn.addEventListener('click', () => {
      console.log('🧪 测试大运选择');
      // 这里可以添加具体的测试逻辑
    });

    // 测试扩展表格按钮
    const testExtendBtn = testButtonContainer.createEl('button', { text: '测试扩展表格' });
    testExtendBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 12px;
    `;
    testExtendBtn.addEventListener('click', () => {
      console.log('🧪 测试扩展表格');
      // 这里可以添加具体的测试逻辑
    });

    // 测试模态框按钮
    const testModalBtn = testButtonContainer.createEl('button', { text: '测试模态框' });
    testModalBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--background-secondary);
      color: var(--text-normal);
      cursor: pointer;
      font-size: 12px;
    `;
    testModalBtn.addEventListener('click', () => {
      console.log('🧪 测试模态框');
      // 这里可以添加具体的测试逻辑
    });

    // 关闭测试面板按钮
    const closeBtn = testButtonContainer.createEl('button', { text: '关闭测试' });
    closeBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      background: var(--interactive-accent);
      color: var(--text-on-accent);
      cursor: pointer;
      font-size: 12px;
    `;
    closeBtn.addEventListener('click', () => {
      testButtonContainer.remove();
    });
  }

  /**
   * 比较原版本和重构版本的性能
   */
  static performanceTest(container: HTMLElement, plugin?: any) {
    console.log('🧪 开始性能测试');

    const testBaziInfo = this.createTestBaziInfo();

    // 测试重构版本
    const startTime = performance.now();
    const refactoredView = new InteractiveBaziView(
      container,
      testBaziInfo,
      'performance-test',
      plugin
    );
    const endTime = performance.now();

    console.log(`🧪 重构版本创建时间: ${endTime - startTime}ms`);

    return refactoredView;
  }
}
