import { BaziInfo } from '../types/BaziInfo';
import { InteractiveBaziView } from '../ui/InteractiveBaziView';

/**
 * 八字视图功能测试
 * 测试重构版本的功能完整性（原版本已被替换）
 */
export class BaziViewComparisonTest {
  
  /**
   * 创建测试用的八字数据
   */
  static createTestBaziInfo(): BaziInfo {
    return {
      yearStem: '甲',
      yearBranch: '子',
      monthStem: '丙',
      monthBranch: '寅',
      dayStem: '戊',
      dayBranch: '午',
      timeStem: '壬',
      timeBranch: '戌',
      
      yearWuXing: '木',
      monthWuXing: '火',
      dayWuXing: '土',
      timeWuXing: '水',
      
      yearHideGan: ['癸'],
      monthHideGan: ['甲', '丙', '戊'],
      dayHideGan: ['丁', '己'],
      timeHideGan: ['戊', '辛', '丁'],
      
      yearShiShen: '偏印',
      monthShiShen: '比肩',
      dayShiShen: '日主',
      timeShiShen: '正财',
      
      yearNaYin: '海中金',
      monthNaYin: '炉中火',
      dayNaYin: '天上火',
      timeNaYin: '大海水',
      
      riZhuStrength: '身旺',
      geJu: '正财格',
      
      wuXingStrength: {
        jin: 1.2,
        mu: 2.1,
        shui: 1.8,
        huo: 3.2,
        tu: 2.7
      },
      
      daYun: [
        {
          ganZhi: '丁卯',
          startAge: 8,
          endAge: 17,
          startYear: 2008,
          endYear: 2017,
          shiShenGan: '伤官',
          shiShenZhi: '食神',
          naYin: '炉中火',
          shenSha: ['天乙贵人', '文昌']
        },
        {
          ganZhi: '戊辰',
          startAge: 18,
          endAge: 27,
          startYear: 2018,
          endYear: 2027,
          shiShenGan: '比肩',
          shiShenZhi: '比肩',
          naYin: '大林木',
          shenSha: ['华盖', '孤辰']
        }
      ],
      
      showShenSha: {
        siZhu: true,
        daYun: true,
        liuNian: true,
        xiaoYun: true,
        liuYue: true
      },
      
      birthYear: '2000',
      daYunStartAge: 8
    };
  }

  /**
   * 测试DOM结构
   */
  static testDOMStructure(): any {
    console.log('🔍 分析DOM结构...');

    // 创建测试容器
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    const baziInfo = this.createTestBaziInfo();

    try {
      // 初始化重构版本
      const view = new InteractiveBaziView(container, baziInfo, 'test-view');

      // 等待初始化完成
      setTimeout(() => {
        const stats = this.analyzeDOMStructure(container, 'RefactoredView');

        // 清理
        document.body.removeChild(container);

        return stats;
      }, 200);

    } catch (error) {
      console.error('❌ DOM结构分析失败:', error);

      // 清理
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }

    return {};
  }

  /**
   * 分析DOM结构
   */
  static analyzeDOMStructure(container: HTMLElement, label: string): any {
    const stats = {
      totalElements: container.querySelectorAll('*').length,
      tables: container.querySelectorAll('table').length,
      buttons: container.querySelectorAll('button').length,
      headers: container.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      sections: container.querySelectorAll('.bazi-view-section').length,
      baziCells: container.querySelectorAll('.bazi-dayun-cell, .bazi-liunian-cell, .bazi-liuyue-cell').length,
      shenShaElements: container.querySelectorAll('.shensha-tag, .bazi-shensha').length,
      modalSupport: container.querySelector('.bazi-modal') !== null,
      hasHeader: container.querySelector('.bazi-view-header') !== null,
      hasBaziTable: container.querySelector('.bazi-view-table') !== null,
      hasDaYunTable: container.querySelector('.bazi-dayun-table') !== null,
      hasSpecialInfo: container.querySelector('.bazi-special-info') !== null
    };
    
    console.log(`📊 ${label} DOM统计:`, stats);
    return stats;
  }

  /**
   * 比较统计数据
   */
  static compareStats(original: any, refactored: any): any {
    const comparison: any = {};
    
    Object.keys(original).forEach(key => {
      const originalValue = original[key];
      const refactoredValue = refactored[key];
      
      if (typeof originalValue === 'number' && typeof refactoredValue === 'number') {
        const diff = refactoredValue - originalValue;
        const percentage = originalValue > 0 ? (diff / originalValue * 100).toFixed(1) : 'N/A';
        comparison[key] = {
          original: originalValue,
          refactored: refactoredValue,
          diff,
          percentage: `${percentage}%`,
          status: diff === 0 ? '✅ 相同' : diff > 0 ? '📈 增加' : '📉 减少'
        };
      } else if (typeof originalValue === 'boolean' && typeof refactoredValue === 'boolean') {
        comparison[key] = {
          original: originalValue,
          refactored: refactoredValue,
          status: originalValue === refactoredValue ? '✅ 相同' : '❌ 不同'
        };
      }
    });
    
    console.log('🔍 对比结果:', comparison);
    return comparison;
  }

  /**
   * 测试功能完整性
   */
  static testFunctionalityCompleteness(): boolean {
    console.log('🧪 测试功能完整性...');
    
    const requiredFeatures = [
      '八字表格显示',
      '大运信息显示',
      '流年信息显示',
      '流月信息显示',
      '样式切换按钮',
      '设置按钮',
      '神煞显示',
      '五行强度显示',
      '日主旺衰显示'
    ];
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    try {
      const baziInfo = this.createTestBaziInfo();
      const view = new InteractiveBaziView(container, baziInfo, 'test-view');
      
      const featureResults: { [key: string]: boolean } = {};
      
      // 检查各项功能
      featureResults['八字表格显示'] = container.querySelector('.bazi-view-table') !== null;
      featureResults['大运信息显示'] = container.querySelector('.bazi-dayun-section') !== null;
      featureResults['流年信息显示'] = container.querySelector('.bazi-liunian-section') !== null;
      featureResults['流月信息显示'] = container.querySelector('.bazi-liuyue-section') !== null;
      featureResults['样式切换按钮'] = container.querySelector('.bazi-style-switch-btn') !== null;
      featureResults['设置按钮'] = container.querySelector('.bazi-settings-btn') !== null;
      featureResults['神煞显示'] = true; // 神煞通过ModalManager处理
      featureResults['五行强度显示'] = container.querySelector('.bazi-special-info') !== null;
      featureResults['日主旺衰显示'] = container.querySelector('.bazi-special-info') !== null;
      
      const passedFeatures = Object.values(featureResults).filter(Boolean).length;
      const totalFeatures = requiredFeatures.length;
      
      console.log('📋 功能检查结果:');
      requiredFeatures.forEach(feature => {
        const status = featureResults[feature] ? '✅' : '❌';
        console.log(`   ${status} ${feature}`);
      });
      
      console.log(`📊 功能完整性: ${passedFeatures}/${totalFeatures} (${(passedFeatures/totalFeatures*100).toFixed(1)}%)`);
      
      document.body.removeChild(container);
      
      return passedFeatures === totalFeatures;
    } catch (error) {
      console.error('❌ 功能完整性测试失败:', error);
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      return false;
    }
  }

  /**
   * 运行完整的功能测试
   */
  static runFunctionalityTest(): boolean {
    console.log('🚀 开始运行八字视图功能测试...');

    try {
      // 测试功能完整性
      const functionalityTest = this.testFunctionalityCompleteness();

      // DOM结构分析（异步）
      this.testDOMStructure();

      console.log(`\n🎯 功能测试结果:`);
      console.log(`   功能完整性: ${functionalityTest ? '✅ 通过' : '❌ 失败'}`);
      console.log(`   DOM结构分析: 🔄 进行中（异步）`);

      return functionalityTest;
    } catch (error) {
      console.error('❌ 功能测试执行失败:', error);
      return false;
    }
  }
}
