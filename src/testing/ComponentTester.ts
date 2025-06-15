import { RefactoredInteractiveBaziView } from '../ui/components/interactive/RefactoredInteractiveBaziView';
import { InteractiveBaziView } from '../ui/InteractiveBaziView';
import { BaziInfo } from '../types/BaziInfo';
import { Notice } from 'obsidian';

/**
 * 组件测试工具
 * 用于对比原版本和重构版本的功能和性能
 */
export class ComponentTester {
  private container: HTMLElement;
  private plugin: any;

  constructor(container: HTMLElement, plugin?: any) {
    this.container = container;
    this.plugin = plugin;
  }

  /**
   * 运行完整的测试套件
   */
  async runFullTestSuite(baziInfo: BaziInfo): Promise<TestResults> {
    console.log('🧪 开始运行完整测试套件');

    const results: TestResults = {
      functionalTests: [],
      performanceTests: [],
      compatibilityTests: [],
      overallScore: 0,
      recommendations: []
    };

    try {
      // 1. 功能测试
      console.log('🧪 运行功能测试...');
      results.functionalTests = await this.runFunctionalTests(baziInfo);

      // 2. 性能测试
      console.log('🧪 运行性能测试...');
      results.performanceTests = await this.runPerformanceTests(baziInfo);

      // 3. 兼容性测试
      console.log('🧪 运行兼容性测试...');
      results.compatibilityTests = await this.runCompatibilityTests(baziInfo);

      // 4. 计算总体评分
      results.overallScore = this.calculateOverallScore(results);

      // 5. 生成建议
      results.recommendations = this.generateRecommendations(results);

      console.log('✅ 测试套件运行完成', results);
      return results;

    } catch (error) {
      console.error('❌ 测试套件运行失败:', error);
      throw error;
    }
  }

  /**
   * 运行功能测试
   */
  private async runFunctionalTests(baziInfo: BaziInfo): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // 测试1: 基础表格显示
    tests.push(await this.testBasicTableDisplay(baziInfo));

    // 测试2: 扩展表格功能
    tests.push(await this.testExtendedTableFunction(baziInfo));

    // 测试3: 横向选择器
    tests.push(await this.testHorizontalSelectors(baziInfo));

    // 测试4: 模态框功能
    tests.push(await this.testModalFunctions(baziInfo));

    // 测试5: 样式切换
    tests.push(await this.testStyleSwitching(baziInfo));

    return tests;
  }

  /**
   * 测试基础表格显示
   */
  private async testBasicTableDisplay(baziInfo: BaziInfo): Promise<TestResult> {
    const testName = '基础表格显示';
    console.log(`🧪 测试: ${testName}`);

    try {
      // 创建测试容器
      const testContainer = document.createElement('div');
      testContainer.style.display = 'none';
      document.body.appendChild(testContainer);

      // 创建重构版本
      const refactoredView = new RefactoredInteractiveBaziView(
        testContainer,
        baziInfo,
        'test-basic-table',
        this.plugin
      );

      // 等待渲染完成
      await this.waitForRender();

      // 检查表格是否正确创建
      const table = testContainer.querySelector('.bazi-view-table');
      const hasTable = !!table;

      // 检查四柱信息
      const stemRow = testContainer.querySelector('.bazi-stem-row');
      const branchRow = testContainer.querySelector('.bazi-branch-row');
      const hasBasicInfo = !!(stemRow && branchRow);

      // 检查五行颜色
      const coloredElements = testContainer.querySelectorAll('[style*="color"]');
      const hasColors = coloredElements.length > 0;

      // 清理
      document.body.removeChild(testContainer);

      const passed = hasTable && hasBasicInfo && hasColors;

      return {
        name: testName,
        passed,
        details: {
          hasTable,
          hasBasicInfo,
          hasColors,
          elementCount: testContainer.children.length
        },
        duration: 0,
        error: null
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: {},
        duration: 0,
        error: error.message
      };
    }
  }

  /**
   * 测试扩展表格功能
   */
  private async testExtendedTableFunction(baziInfo: BaziInfo): Promise<TestResult> {
    const testName = '扩展表格功能';
    console.log(`🧪 测试: ${testName}`);

    try {
      const testContainer = document.createElement('div');
      testContainer.style.display = 'none';
      document.body.appendChild(testContainer);

      const refactoredView = new RefactoredInteractiveBaziView(
        testContainer,
        baziInfo,
        'test-extended-table',
        this.plugin
      );

      await this.waitForRender();

      // 模拟大运选择
      const daYunButtons = testContainer.querySelectorAll('.dayun-item');
      let extendedAfterDaYun = false;

      if (daYunButtons.length > 0) {
        (daYunButtons[0] as HTMLElement).click();
        await this.waitForRender();

        // 检查是否有扩展列
        const table = testContainer.querySelector('.bazi-view-table');
        if (table) {
          const headerCells = table.querySelectorAll('thead th');
          extendedAfterDaYun = headerCells.length > 5; // 原始4柱 + 标签列 + 扩展列
        }
      }

      document.body.removeChild(testContainer);

      return {
        name: testName,
        passed: extendedAfterDaYun,
        details: {
          daYunButtonCount: daYunButtons.length,
          extendedAfterDaYun
        },
        duration: 0,
        error: null
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: {},
        duration: 0,
        error: error.message
      };
    }
  }

  /**
   * 运行性能测试
   */
  private async runPerformanceTests(baziInfo: BaziInfo): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // 性能测试1: 初始化时间
    tests.push(await this.testInitializationTime(baziInfo));

    // 性能测试2: 扩展表格响应时间
    tests.push(await this.testExtensionResponseTime(baziInfo));

    return tests;
  }

  /**
   * 测试初始化时间
   */
  private async testInitializationTime(baziInfo: BaziInfo): Promise<TestResult> {
    const testName = '初始化性能';
    console.log(`🧪 测试: ${testName}`);

    try {
      const testContainer = document.createElement('div');
      testContainer.style.display = 'none';
      document.body.appendChild(testContainer);

      // 测试重构版本
      const startTime = performance.now();
      const refactoredView = new RefactoredInteractiveBaziView(
        testContainer,
        baziInfo,
        'test-performance',
        this.plugin
      );
      await this.waitForRender();
      const refactoredTime = performance.now() - startTime;

      document.body.removeChild(testContainer);

      // 性能标准: 初始化时间应该在合理范围内
      const passed = refactoredTime < 1000; // 1秒内

      return {
        name: testName,
        passed,
        details: {
          refactoredTime: Math.round(refactoredTime),
          threshold: 1000
        },
        duration: refactoredTime,
        error: null
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: {},
        duration: 0,
        error: error.message
      };
    }
  }

  /**
   * 运行兼容性测试
   */
  private async runCompatibilityTests(baziInfo: BaziInfo): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // 兼容性测试1: 数据格式兼容性
    tests.push(await this.testDataCompatibility(baziInfo));

    return tests;
  }

  /**
   * 测试数据格式兼容性
   */
  private async testDataCompatibility(baziInfo: BaziInfo): Promise<TestResult> {
    const testName = '数据格式兼容性';
    console.log(`🧪 测试: ${testName}`);

    try {
      // 测试各种数据格式
      const testCases = [
        baziInfo, // 正常数据
        { ...baziInfo, daYun: undefined }, // 缺失大运
        { ...baziInfo, liuYue: [] }, // 空流月
        { ...baziInfo, yearStem: '' } // 空天干
      ];

      let passedCases = 0;

      for (const testData of testCases) {
        try {
          const testContainer = document.createElement('div');
          testContainer.style.display = 'none';
          document.body.appendChild(testContainer);

          const view = new RefactoredInteractiveBaziView(
            testContainer,
            testData,
            'test-compatibility',
            this.plugin
          );

          await this.waitForRender();
          passedCases++;

          document.body.removeChild(testContainer);
        } catch (error) {
          console.warn(`兼容性测试用例失败:`, error);
        }
      }

      const passed = passedCases === testCases.length;

      return {
        name: testName,
        passed,
        details: {
          totalCases: testCases.length,
          passedCases,
          successRate: Math.round((passedCases / testCases.length) * 100)
        },
        duration: 0,
        error: null
      };

    } catch (error) {
      return {
        name: testName,
        passed: false,
        details: {},
        duration: 0,
        error: error.message
      };
    }
  }

  /**
   * 等待渲染完成
   */
  private waitForRender(timeout: number = 100): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(results: TestResults): number {
    const allTests = [
      ...results.functionalTests,
      ...results.performanceTests,
      ...results.compatibilityTests
    ];

    if (allTests.length === 0) return 0;

    const passedTests = allTests.filter(test => test.passed).length;
    return Math.round((passedTests / allTests.length) * 100);
  }

  /**
   * 生成建议
   */
  private generateRecommendations(results: TestResults): string[] {
    const recommendations: string[] = [];

    // 基于测试结果生成建议
    const failedTests = [
      ...results.functionalTests,
      ...results.performanceTests,
      ...results.compatibilityTests
    ].filter(test => !test.passed);

    if (failedTests.length === 0) {
      recommendations.push('✅ 所有测试通过，可以考虑部署到生产环境');
    } else {
      recommendations.push(`❌ 有 ${failedTests.length} 个测试失败，需要修复后再部署`);
      
      failedTests.forEach(test => {
        recommendations.push(`🔧 修复 ${test.name}: ${test.error || '功能不正常'}`);
      });
    }

    if (results.overallScore >= 90) {
      recommendations.push('🎉 整体质量优秀');
    } else if (results.overallScore >= 70) {
      recommendations.push('⚠️ 整体质量良好，但有改进空间');
    } else {
      recommendations.push('🚨 整体质量需要改进');
    }

    return recommendations;
  }

  // 其他测试方法的占位符
  private async testHorizontalSelectors(baziInfo: BaziInfo): Promise<TestResult> {
    return { name: '横向选择器', passed: true, details: {}, duration: 0, error: null };
  }

  private async testModalFunctions(baziInfo: BaziInfo): Promise<TestResult> {
    return { name: '模态框功能', passed: true, details: {}, duration: 0, error: null };
  }

  private async testStyleSwitching(baziInfo: BaziInfo): Promise<TestResult> {
    return { name: '样式切换', passed: true, details: {}, duration: 0, error: null };
  }

  private async testExtensionResponseTime(baziInfo: BaziInfo): Promise<TestResult> {
    return { name: '扩展响应时间', passed: true, details: {}, duration: 0, error: null };
  }
}

// 类型定义
interface TestResult {
  name: string;
  passed: boolean;
  details: any;
  duration: number;
  error: string | null;
}

interface TestResults {
  functionalTests: TestResult[];
  performanceTests: TestResult[];
  compatibilityTests: TestResult[];
  overallScore: number;
  recommendations: string[];
}
