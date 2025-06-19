import { ShenShaAlgorithms } from './ShenShaAlgorithms';

/**
 * 神煞计算引擎
 * 统一的神煞计算核心，消除代码重复，提供一致的计算接口
 */

export interface ShenShaCalculationParams {
  dayStem: string;
  stem: string;
  branch: string;
  yearStem?: string;
  yearBranch?: string;
  monthStem?: string;
  monthBranch?: string;
  dayBranch?: string;
  hourStem?: string;
  hourBranch?: string;
  season?: string;
  pillarType?: string;
  ganZhi?: string;
}

export interface BaziContext {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  timeStem: string;
  timeBranch: string;
  season?: string;
}

export interface ShenShaCalculationResult {
  shenShaList: string[];
  calculationTime: number;
  algorithmCount: number;
  errors: string[];
}

export class ShenShaCalculationEngine {
  
  /**
   * 缓存机制
   */
  private static cache: Map<string, string[]> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 核心神煞计算方法
   * @param params 计算参数
   * @returns 神煞数组
   */
  static calculateShenSha(params: ShenShaCalculationParams): string[] {
    const startTime = Date.now();

    console.log(`🔍 ShenShaCalculationEngine.calculateShenSha 开始计算，参数:`, params);
    console.log(`🔍 参数详情: dayStem=${params.dayStem}, dayBranch=${params.dayBranch}, stem=${params.stem}, branch=${params.branch}`);

    // 生成缓存键
    const cacheKey = this.generateCacheKey(params);
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const { dayStem, stem, branch, yearStem, yearBranch, monthStem, monthBranch, dayBranch, hourStem, hourBranch, season } = params;
    const shenShaList: string[] = [];
    const errors: string[] = [];

    // 使用算法层计算所有神煞
    const algorithms = ShenShaAlgorithms.getAllAlgorithms();
    Object.entries(algorithms).forEach(([shenShaName, algorithm]) => {
      try {
        const result = this.callAlgorithmWithAdaptedParams(
          shenShaName,
          algorithm,
          { dayStem, stem, branch, yearStem, yearBranch, monthStem, monthBranch, dayBranch, hourStem, hourBranch, season }
        );

        if (result) {
          shenShaList.push(shenShaName);
        }
      } catch (error) {
        errors.push(`${shenShaName}: ${error}`);
      }
    });

    // 去重并排序
    const uniqueShenSha = [...new Set(shenShaList)].sort();

    console.log(`🔍 ShenShaCalculationEngine.calculateShenSha 计算完成，结果:`, uniqueShenSha);

    // 缓存结果
    this.setCache(cacheKey, uniqueShenSha);

    return uniqueShenSha;
  }

  /**
   * 智能参数适配算法调用
   * @param shenShaName 神煞名称
   * @param algorithm 算法函数
   * @param params 参数对象
   * @returns 计算结果
   */
  private static callAlgorithmWithAdaptedParams(
    shenShaName: string,
    algorithm: Function,
    params: any
  ): boolean {
    const { dayStem, dayBranch, stem, branch, yearStem, yearBranch, monthStem, monthBranch, hourStem, hourBranch, season } = params;

    // 根据神煞类型选择合适的参数
    switch (shenShaName) {
      // case '空亡': // 备注：使用更细致的分类空亡
      case '日空亡': {
        console.log(`🔍 日空亡计算: dayStem=${dayStem}, dayBranch=${dayBranch}, branch=${branch}`);
        if (!dayStem || !dayBranch || !branch) {
          console.log(`⚠️ 日空亡计算跳过：参数不完整 (dayStem=${dayStem}, dayBranch=${dayBranch}, branch=${branch})`);
          return false;
        }
        try {
          const riKongWangResult = algorithm(dayStem, dayBranch, branch);
          console.log(`🔍 日空亡结果: ${riKongWangResult}`);
          return riKongWangResult;
        } catch (error) {
          console.error(`❌ 日空亡计算错误:`, error);
          return false;
        }
      }

      case '年空亡':
        // 需要年干、年支
        if (yearStem && yearBranch) {
          return algorithm(yearStem, yearBranch, branch);
        }
        console.log(`⚠️ 年空亡计算跳过：缺少年柱信息 (yearStem=${yearStem}, yearBranch=${yearBranch})`);
        return false;

      case '月空亡':
        // 需要月干、月支
        if (monthStem && monthBranch) {
          return algorithm(monthStem, monthBranch, branch);
        }
        console.log(`⚠️ 月空亡计算跳过：缺少月柱信息 (monthStem=${monthStem}, monthBranch=${monthBranch})`);
        return false;

      case '时空亡':
        // 需要时干、时支
        if (hourStem && hourBranch) {
          return algorithm(hourStem, hourBranch, branch);
        }
        // 如果没有时柱信息，在大运/流年计算中跳过
        console.log(`⚠️ 时空亡计算跳过：缺少时柱信息 (hourStem=${hourStem}, hourBranch=${hourBranch})`);
        return false;

      case '命宫空亡':
      case '身宫空亡':
      case '胎元空亡':
        // 这些需要特殊的宫位信息，暂时返回false
        // 实际使用时需要传入相应的宫位干支
        console.log(`⚠️ ${shenShaName}计算跳过：缺少宫位信息`);
        return false;

      case '桃花':
      case '华盖':
      case '驿马':
      case '劫煞':
      case '灾煞':
      case '天刑':
      case '孤辰':
      case '寡宿':
        // 这些需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;

      case '文昌':
        // 需要年干
        if (yearStem) {
          return algorithm(yearStem, branch);
        }
        return false;

      case '将星':
        // 需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;
      
      case '太极贵人':
      case '金舆':
      case '福星贵人':
        return algorithm(dayStem, branch);
      
      case '国印贵人':
        // 国印贵人以年干或日干查，优先使用日干
        return algorithm(dayStem, branch) || (yearStem ? algorithm(yearStem, branch) : false);
      
      case '三奇贵人':
        return algorithm([stem]); // 简化处理
      
      case '文曲':
      case '天喜':
      case '红鸾':
      case '红艳':
      case '天姚':
        // 这些需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;
      
      case '学堂词馆':
        return algorithm(dayStem, branch);
      
      case '德秀贵人':
        // 需要月支
        if (monthBranch) {
          return algorithm(monthBranch, branch);
        }
        return false;
      
      case '十恶大败':
      case '孤鸾煞':
      case '日德':
      case '金神':
        return algorithm(dayStem, dayBranch);

      case '四废':
        // 需要季节
        if (season) {
          return algorithm(season, branch);
        }
        return false;

      case '天罗地网':
        // 需要纳音，暂时跳过
        return false;

      case '五鬼':
      case '白虎':
      case '天狗':
        // 这些需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;

      case '三台':
      case '八座':
        // 这些需要年干
        if (yearStem) {
          return algorithm(yearStem, branch);
        }
        return false;

      case '天赦':
        // 需要季节、天干、地支
        if (season) {
          return algorithm(season, stem, branch);
        }
        return false;

      case '天恩':
      case '天福':
        // 需要天干和地支
        return algorithm(stem, branch);

      case '太岁':
      case '岁破':
        // 这些需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;

      case '天德':
      case '月德':
      case '天德合':
      case '月德合':
        // 这些需要月支
        if (monthBranch) {
          return algorithm(monthBranch, stem);
        }
        return false;

      case '天医':
        // 需要年干
        if (yearStem) {
          return algorithm(yearStem, branch);
        }
        return false;

      case '禄马同乡': {
        // 需要天干和四柱地支
        const allBranches = [yearBranch, monthBranch, dayBranch, branch].filter(Boolean);
        if (allBranches.length >= 4) {
          return algorithm(stem, allBranches);
        }
        return false;
      }

      case '福德秀气':
        // 需要日干、日支、月支
        if (monthBranch) {
          return algorithm(dayStem, dayBranch, monthBranch);
        }
        return false;

      case '学堂':
      case '词馆':
        // 需要日干
        return algorithm(dayStem, branch);

      case '财富通门户': {
        // 需要日干、四柱地支、四柱天干
        const allBranches = [yearBranch, monthBranch, dayBranch, branch].filter(Boolean);
        const allStems = [yearStem, monthStem, dayStem, stem].filter(Boolean);
        if (allBranches.length >= 4 && allStems.length >= 4) {
          return algorithm(dayStem, allBranches, allStems);
        }
        return false;
      }

      case '魁罡':
      case '阴差阳错':
        // 需要干支组合
        return algorithm(dayStem + dayBranch);

      case '咸池':
      case '天空':
      case '地劫':
      case '天哭':
      case '天虚':
        // 简单地支判断
        return algorithm(branch);

      case '解神':
        // 需要月支
        if (monthBranch) {
          return algorithm(monthBranch, branch);
        }
        return false;

      case '亡神':
      case '披麻':
      case '吊客':
      case '丧门':
      case '元辰':
        // 这些需要年支
        if (yearBranch) {
          return algorithm(yearBranch, branch);
        }
        return false;
      
      default:
        // 默认使用日干和地支
        return algorithm(dayStem, branch);
    }
  }

  /**
   * 批量计算神煞
   * @param batchParams 批量参数
   * @returns 批量结果
   */
  static calculateBatchShenSha(batchParams: ShenShaCalculationParams[]): string[][] {
    return batchParams.map(params => this.calculateShenSha(params));
  }

  /**
   * 带上下文的神煞计算
   * @param context 八字上下文
   * @returns 详细计算结果
   */
  static calculateWithContext(context: BaziContext): ShenShaCalculationResult {
    const startTime = Date.now();
    const errors: string[] = [];
    
    // 计算四柱神煞
    const pillars = [
      { stem: context.yearStem, branch: context.yearBranch, type: '年柱' },
      { stem: context.monthStem, branch: context.monthBranch, type: '月柱' },
      { stem: context.dayStem, branch: context.dayBranch, type: '日柱' },
      { stem: context.timeStem, branch: context.timeBranch, type: '时柱' }
    ];

    const allShenSha: string[] = [];
    
    pillars.forEach(pillar => {
      const params: ShenShaCalculationParams = {
        dayStem: context.dayStem,
        stem: pillar.stem,
        branch: pillar.branch,
        yearStem: context.yearStem,
        yearBranch: context.yearBranch,
        monthStem: context.monthStem,
        monthBranch: context.monthBranch,
        dayBranch: context.dayBranch,
        hourStem: context.timeStem,
        hourBranch: context.timeBranch,
        season: context.season,
        pillarType: pillar.type
      };
      
      try {
        const pillarShenSha = this.calculateShenSha(params);
        allShenSha.push(...pillarShenSha);
      } catch (error) {
        errors.push(`${pillar.type}: ${error}`);
      }
    });

    const calculationTime = Date.now() - startTime;
    const algorithms = ShenShaAlgorithms.getAllAlgorithms();
    
    return {
      shenShaList: [...new Set(allShenSha)].sort(),
      calculationTime,
      algorithmCount: Object.keys(algorithms).length,
      errors
    };
  }

  /**
   * 生成缓存键
   */
  private static generateCacheKey(params: ShenShaCalculationParams): string {
    const { dayStem, stem, branch, yearStem, yearBranch, monthStem, monthBranch, season } = params;
    return `${dayStem}_${stem}_${branch}_${yearStem || ''}_${yearBranch || ''}_${monthStem || ''}_${monthBranch || ''}_${season || ''}`;
  }

  /**
   * 从缓存获取
   */
  private static getFromCache(key: string): string[] | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  /**
   * 设置缓存
   */
  private static setCache(key: string, value: string[]): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 获取缓存统计
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // 简化实现，实际可以统计命中率
    };
  }

  /**
   * 验证参数
   */
  static validateParams(params: ShenShaCalculationParams): boolean {
    const { dayStem, stem, branch } = params;
    
    if (!dayStem || !stem || !branch) {
      return false;
    }
    
    const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const validBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    return validStems.includes(dayStem) && 
           validStems.includes(stem) && 
           validBranches.includes(branch);
  }
}
