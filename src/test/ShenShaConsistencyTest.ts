/**
 * 神煞一致性测试
 * 验证相同干支在不同计算方法下的神煞结果是否一致
 */

import { EightChar, Solar } from 'lunar-typescript';
import { ShenShaAnalysisService } from '../services/bazi/shensha/ShenShaAnalysisService.js';
import { ShenShaTimeService } from '../services/bazi/shensha/ShenShaTimeService.js';

export class ShenShaConsistencyTest {
  
  /**
   * 运行一致性测试
   */
  static runConsistencyTest(): void {
    console.log('🧪 开始神煞一致性测试...\n');
    
    this.testSameGanZhiConsistency();
    this.testSpecificCase();
    this.testMultipleCases();
    
    console.log('✅ 神煞一致性测试完成！');
  }

  /**
   * 测试相同干支的一致性
   */
  private static testSameGanZhiConsistency(): void {
    console.log('📋 测试相同干支的神煞一致性...');
    
    // 创建测试八字：乙未年 壬午月 丁丑日 壬午时
    const solar = Solar.fromYmdHms(1995, 6, 15, 14, 30, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    
    console.log('测试八字:', {
      year: eightChar.getYearGan() + eightChar.getYearZhi(),
      month: eightChar.getMonthGan() + eightChar.getMonthZhi(),
      day: eightChar.getDayGan() + eightChar.getDayZhi(),
      time: eightChar.getTimeGan() + eightChar.getTimeZhi()
    });
    
    // 使用ShenShaAnalysisService计算四柱神煞
    const fourPillarAnalysis = ShenShaAnalysisService.analyzeFourPillarShenSha(eightChar);
    
    console.log('\n四柱神煞分析结果:');
    console.log('月柱神煞:', fourPillarAnalysis.monthShenSha);
    console.log('时柱神煞:', fourPillarAnalysis.timeShenSha);
    
    // 使用ShenShaTimeService计算相同干支
    const dayStem = eightChar.getDayGan();
    const monthGanZhi = eightChar.getMonthGan() + eightChar.getMonthZhi();
    const timeGanZhi = eightChar.getTimeGan() + eightChar.getTimeZhi();
    
    const monthShenShaByTime = ShenShaTimeService.calculatePillarShenSha({
      dayStem,
      stem: eightChar.getMonthGan(),
      branch: eightChar.getMonthZhi(),
      pillarType: '月柱'
    });
    
    const timeShenShaByTime = ShenShaTimeService.calculatePillarShenSha({
      dayStem,
      stem: eightChar.getTimeGan(),
      branch: eightChar.getTimeZhi(),
      pillarType: '时柱'
    });
    
    console.log('\n时间层级神煞计算结果:');
    console.log('月柱神煞:', monthShenShaByTime);
    console.log('时柱神煞:', timeShenShaByTime);
    
    // 比较结果
    const monthConsistent = this.arraysEqual(
      fourPillarAnalysis.monthShenSha.sort(),
      monthShenShaByTime.sort()
    );
    
    const timeConsistent = this.arraysEqual(
      fourPillarAnalysis.timeShenSha.sort(),
      timeShenShaByTime.sort()
    );
    
    console.log('\n一致性检查结果:');
    console.log('月柱一致性:', monthConsistent ? '✅ 一致' : '❌ 不一致');
    console.log('时柱一致性:', timeConsistent ? '✅ 一致' : '❌ 不一致');
    
    if (!monthConsistent) {
      console.log('月柱差异:');
      console.log('  四柱分析独有:', this.arrayDifference(fourPillarAnalysis.monthShenSha, monthShenShaByTime));
      console.log('  时间层级独有:', this.arrayDifference(monthShenShaByTime, fourPillarAnalysis.monthShenSha));
    }
    
    if (!timeConsistent) {
      console.log('时柱差异:');
      console.log('  四柱分析独有:', this.arrayDifference(fourPillarAnalysis.timeShenSha, timeShenShaByTime));
      console.log('  时间层级独有:', this.arrayDifference(timeShenShaByTime, fourPillarAnalysis.timeShenSha));
    }
    
    console.log('');
  }

  /**
   * 测试特定案例（壬午）
   */
  private static testSpecificCase(): void {
    console.log('📋 测试特定案例（壬午）...');
    
    const dayStem = '丁'; // 日干
    const ganZhi = '壬午';
    const stem = '壬';
    const branch = '午';
    
    // 使用两种方法计算
    const analysisResult = ShenShaAnalysisService['calculatePillarShenSha'](dayStem, stem, branch);
    const timeResult = ShenShaTimeService.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '测试'
    });
    
    console.log('干支:', ganZhi);
    console.log('日干:', dayStem);
    console.log('四柱分析结果:', analysisResult.sort());
    console.log('时间层级结果:', timeResult.sort());
    
    const consistent = this.arraysEqual(analysisResult.sort(), timeResult.sort());
    console.log('一致性:', consistent ? '✅ 一致' : '❌ 不一致');
    
    if (!consistent) {
      console.log('差异分析:');
      console.log('  四柱分析独有:', this.arrayDifference(analysisResult, timeResult));
      console.log('  时间层级独有:', this.arrayDifference(timeResult, analysisResult));
    }
    
    console.log('');
  }

  /**
   * 测试多个案例
   */
  private static testMultipleCases(): void {
    console.log('📋 测试多个干支案例...');
    
    const testCases = [
      { dayStem: '甲', ganZhi: '甲子' },
      { dayStem: '乙', ganZhi: '乙丑' },
      { dayStem: '丙', ganZhi: '丙寅' },
      { dayStem: '丁', ganZhi: '丁卯' },
      { dayStem: '戊', ganZhi: '戊辰' },
      { dayStem: '己', ganZhi: '己巳' },
      { dayStem: '庚', ganZhi: '庚午' },
      { dayStem: '辛', ganZhi: '辛未' },
      { dayStem: '壬', ganZhi: '壬申' },
      { dayStem: '癸', ganZhi: '癸酉' }
    ];
    
    let consistentCount = 0;
    let totalCount = testCases.length;
    
    testCases.forEach(testCase => {
      const { dayStem, ganZhi } = testCase;
      const stem = ganZhi[0];
      const branch = ganZhi[1];
      
      const analysisResult = ShenShaAnalysisService['calculatePillarShenSha'](dayStem, stem, branch);
      const timeResult = ShenShaTimeService.calculatePillarShenSha({
        dayStem,
        stem,
        branch,
        pillarType: '测试'
      });
      
      const consistent = this.arraysEqual(analysisResult.sort(), timeResult.sort());
      if (consistent) {
        consistentCount++;
      } else {
        console.log(`❌ ${ganZhi} (日干${dayStem}) 不一致:`);
        console.log(`  四柱: [${analysisResult.join(', ')}]`);
        console.log(`  时间: [${timeResult.join(', ')}]`);
      }
    });
    
    console.log(`\n测试结果: ${consistentCount}/${totalCount} 一致`);
    console.log(`一致率: ${(consistentCount / totalCount * 100).toFixed(1)}%`);
    
    if (consistentCount === totalCount) {
      console.log('🎉 所有测试案例都一致！');
    } else {
      console.log('⚠️ 存在不一致的案例，需要进一步检查');
    }
    
    console.log('');
  }

  /**
   * 比较两个数组是否相等
   */
  private static arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  /**
   * 计算数组差异
   */
  private static arrayDifference(a: string[], b: string[]): string[] {
    return a.filter(x => !b.includes(x));
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  ShenShaConsistencyTest.runConsistencyTest();
}
