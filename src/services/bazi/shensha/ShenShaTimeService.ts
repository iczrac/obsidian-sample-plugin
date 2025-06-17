import { ShenShaAlgorithms } from './ShenShaAlgorithms';

/**
 * 时间层级神煞服务
 * 专门处理各时间层级的神煞计算，提供时间层级相关的业务逻辑
 */

export interface PillarShenShaParams {
  dayStem: string;
  stem: string;
  branch: string;
  pillarType: string;
  includeSpecial?: boolean;
}

export class ShenShaTimeService {

  /**
   * 计算单柱神煞（通用方法）
   * @param params 柱神煞参数
   * @returns 神煞数组
   */
  static calculatePillarShenSha(params: PillarShenShaParams): string[] {
    const { dayStem, stem, branch, pillarType } = params;
    const shenShaList: string[] = [];

    // 使用算法层计算基础神煞
    const algorithms = ShenShaAlgorithms.getAllAlgorithms();
    Object.entries(algorithms).forEach(([shenShaName, algorithm]) => {
      try {
        // 根据不同算法的参数需求调用
        let result = false;
        if (shenShaName === '空亡') {
          result = algorithm(dayStem, branch);
        } else if (['太极贵人', '金舆', '福星贵人'].includes(shenShaName)) {
          result = algorithm(dayStem, branch);
        } else if (shenShaName === '国印贵人') {
          result = algorithm(stem, branch);
        } else if (shenShaName === '三奇贵人') {
          result = algorithm([stem]); // 简化处理
        } else if (['文曲', '天喜', '红鸾', '红艳', '天姚'].includes(shenShaName)) {
          // 这些需要年支，暂时跳过或使用默认逻辑
          result = false;
        } else if (shenShaName === '学堂词馆') {
          result = algorithm(dayStem, branch);
        } else if (shenShaName === '德秀贵人') {
          // 需要月支，暂时跳过
          result = false;
        } else if (shenShaName === '十恶大败' || shenShaName === '孤鸾煞') {
          result = algorithm(stem, branch);
        } else if (shenShaName === '四废') {
          // 需要季节，暂时跳过
          result = false;
        } else if (shenShaName === '天罗地网') {
          // 需要纳音，暂时跳过
          result = false;
        } else if (['亡神', '披麻', '吊客', '丧门', '元辰'].includes(shenShaName)) {
          // 这些需要年支，暂时跳过
          result = false;
        } else {
          // 默认使用日干和地支
          result = algorithm(dayStem, branch);
        }

        if (result) {
          shenShaList.push(shenShaName);
        }
      } catch (error) {
        // 忽略算法调用错误
      }
    });

    // 特定柱位的特殊神煞
    const pillarSpecificShenSha = this.calculatePillarSpecificShenSha(
      dayStem, stem, branch, pillarType
    );
    shenShaList.push(...pillarSpecificShenSha);

    return [...new Set(shenShaList)]; // 去重
  }



  /**
   * 计算特定柱位的特殊神煞
   * @param dayStem 日干
   * @param stem 天干
   * @param branch 地支
   * @param pillarType 柱类型
   * @returns 特定神煞数组
   */
  private static calculatePillarSpecificShenSha(
    dayStem: string, 
    stem: string, 
    branch: string, 
    pillarType: string
  ): string[] {
    const shenShaList: string[] = [];

    switch (pillarType) {
      case '流年':
        // 流年特有神煞
        shenShaList.push('太岁');
        break;
        
      case '大运':
        // 大运特有神煞
        if (ShenShaAlgorithms.isLuShen(stem, branch)) {
          shenShaList.push('大运禄神');
        }
        break;
        
      case '年柱':
        // 年柱特有神煞
        if (ShenShaAlgorithms.isJiangXing(dayStem, branch)) {
          shenShaList.push('年上将星');
        }
        break;
        
      case '月柱':
        // 月柱特有神煞
        if (ShenShaAlgorithms.isWenChang(branch)) {
          shenShaList.push('月上文昌');
        }
        break;
        
      case '日柱': {
        // 日柱特有神煞
        const kuiGangDays = ['庚戌', '庚辰', '戊戌', '壬辰'];
        if (kuiGangDays.includes(stem + branch)) {
          shenShaList.push('魁罡');
        }
        break;
      }
        
      case '时柱':
        // 时柱特有神煞
        if (ShenShaAlgorithms.isTianYiGuiRen(dayStem, branch)) {
          shenShaList.push('时上贵人');
        }
        break;
    }

    return shenShaList;
  }

  /**
   * 为大运计算神煞
   * @param dayStem 日干
   * @param ganZhi 大运干支
   * @returns 大运神煞数组
   */
  static calculateDaYunShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '大运'
    });
  }

  /**
   * 为流年计算神煞
   * @param dayStem 日干
   * @param ganZhi 流年干支
   * @returns 流年神煞数组
   */
  static calculateLiuNianShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '流年'
    });
  }

  /**
   * 为流月计算神煞
   * @param dayStem 日干
   * @param ganZhi 流月干支
   * @returns 流月神煞数组
   */
  static calculateLiuYueShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '流月'
    });
  }

  /**
   * 为流日计算神煞
   * @param dayStem 日干
   * @param ganZhi 流日干支
   * @returns 流日神煞数组
   */
  static calculateLiuRiShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '流日'
    });
  }

  /**
   * 为流时计算神煞
   * @param dayStem 日干
   * @param ganZhi 流时干支
   * @returns 流时神煞数组
   */
  static calculateLiuShiShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '流时'
    });
  }

  /**
   * 为小运计算神煞
   * @param dayStem 日干
   * @param ganZhi 小运干支
   * @returns 小运神煞数组
   */
  static calculateXiaoYunShenSha(dayStem: string, ganZhi: string): string[] {
    if (ganZhi.length !== 2) return [];
    
    const stem = ganZhi.charAt(0);
    const branch = ganZhi.charAt(1);
    
    return this.calculatePillarShenSha({
      dayStem,
      stem,
      branch,
      pillarType: '小运'
    });
  }

  /**
   * 批量计算多个时间层级的神煞
   * @param dayStem 日干
   * @param timeLayerData 时间层级数据
   * @returns 批量神煞结果
   */
  static calculateBatchShenSha(
    dayStem: string, 
    timeLayerData: {[key: string]: string}
  ): {[key: string]: string[]} {
    const results: {[key: string]: string[]} = {};
    
    Object.entries(timeLayerData).forEach(([layerType, ganZhi]) => {
      switch (layerType) {
        case '大运':
          results[layerType] = this.calculateDaYunShenSha(dayStem, ganZhi);
          break;
        case '流年':
          results[layerType] = this.calculateLiuNianShenSha(dayStem, ganZhi);
          break;
        case '流月':
          results[layerType] = this.calculateLiuYueShenSha(dayStem, ganZhi);
          break;
        case '流日':
          results[layerType] = this.calculateLiuRiShenSha(dayStem, ganZhi);
          break;
        case '流时':
          results[layerType] = this.calculateLiuShiShenSha(dayStem, ganZhi);
          break;
        case '小运':
          results[layerType] = this.calculateXiaoYunShenSha(dayStem, ganZhi);
          break;
        default:
          results[layerType] = [];
      }
    });
    
    return results;
  }

  /**
   * 获取支持的时间层级列表
   * @returns 支持的时间层级
   */
  static getSupportedTimeLayers(): string[] {
    return ['大运', '流年', '流月', '流日', '流时', '小运'];
  }

  /**
   * 验证时间层级参数
   * @param timeLayer 时间层级
   * @param ganZhi 干支
   * @returns 是否有效
   */
  static validateTimeLayerParams(timeLayer: string, ganZhi: string): boolean {
    const supportedLayers = this.getSupportedTimeLayers();
    return supportedLayers.includes(timeLayer) && ganZhi.length === 2;
  }
}
