import { BaziUtils } from './BaziUtils';

/**
 * 组合判断模块
 * 处理各种组合判断：三合局、三会局、五合局、六合等
 */
export class CombinationCalculator {
  /**
   * 检查三合局
   * @param branches 地支数组
   * @returns 三合局类型或null
   */
  static checkSanHeJu(branches: string[]): string | null {
    // 三合局：寅午戌合火局，申子辰合水局，亥卯未合木局，巳酉丑合金局
    const sanHePatterns = [
      { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌火局' },
      { branches: ['申', '子', '辰'], element: '水', name: '申子辰水局' },
      { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未木局' },
      { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑金局' }
    ];

    for (const pattern of sanHePatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        return pattern.name;
      }
    }

    return null;
  }

  /**
   * 获取三合局对应的五行
   * @param sanHeType 三合局类型
   * @returns 五行
   */
  static getSanHeWuXing(sanHeType: string): string {
    switch (sanHeType) {
      case '火': return '火';
      case '水': return '水';
      case '木': return '木';
      case '金': return '金';
      default: return '';
    }
  }

  /**
   * 检查三会局
   * @param branches 地支数组
   * @returns 三会局类型或null
   */
  static checkSanHuiJu(branches: string[]): string | null {
    // 三会局：寅卯辰三会木局，巳午未三会火局，申酉戌三会金局，亥子丑三会水局
    const sanHuiPatterns = [
      { branches: ['寅', '卯', '辰'], element: '木', name: '寅卯辰木局' },
      { branches: ['巳', '午', '未'], element: '火', name: '巳午未火局' },
      { branches: ['申', '酉', '戌'], element: '金', name: '申酉戌金局' },
      { branches: ['亥', '子', '丑'], element: '水', name: '亥子丑水局' }
    ];

    for (const pattern of sanHuiPatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        return pattern.name;
      }
    }

    return null;
  }

  /**
   * 获取三会局对应的五行
   * @param sanHuiType 三会局类型
   * @returns 五行
   */
  static getSanHuiWuXing(sanHuiType: string): string {
    switch (sanHuiType) {
      case '木': return '木';
      case '火': return '火';
      case '金': return '金';
      case '水': return '水';
      default: return '';
    }
  }

  /**
   * 检查天干五合
   * @param stems 天干数组
   * @returns 五合类型或null
   */
  static checkWuHeJu(stems: string[]): string | null {
    // 天干五合：甲己合土，乙庚合金，丙辛合水，丁壬合木，戊癸合火
    const wuHePatterns = [
      { stems: ['甲', '己'], element: '土', name: '甲己合土' },
      { stems: ['乙', '庚'], element: '金', name: '乙庚合金' },
      { stems: ['丙', '辛'], element: '水', name: '丙辛合水' },
      { stems: ['丁', '壬'], element: '木', name: '丁壬合木' },
      { stems: ['戊', '癸'], element: '火', name: '戊癸合火' }
    ];

    for (const pattern of wuHePatterns) {
      if (BaziUtils.containsAll(stems, pattern.stems)) {
        return pattern.name;
      }
    }

    return null;
  }

  /**
   * 获取五合对应的五行
   * @param wuHeType 五合类型
   * @returns 五行
   */
  static getWuHeWuXing(wuHeType: string): string {
    switch (wuHeType) {
      case '土': return '土';
      case '金': return '金';
      case '水': return '水';
      case '木': return '木';
      case '火': return '火';
      default: return '';
    }
  }

  /**
   * 检查地支六合
   * @param branches 地支数组
   * @returns 六合类型或null
   */
  static checkLiuHe(branches: string[]): string | null {
    // 六合：子丑合土，寅亥合木，卯戌合火，辰酉合金，巳申合水，午未合土
    const liuHePatterns = [
      { branches: ['子', '丑'], element: '土', name: '子丑合土' },
      { branches: ['寅', '亥'], element: '木', name: '寅亥合木' },
      { branches: ['卯', '戌'], element: '火', name: '卯戌合火' },
      { branches: ['辰', '酉'], element: '金', name: '辰酉合金' },
      { branches: ['巳', '申'], element: '水', name: '巳申合水' },
      { branches: ['午', '未'], element: '土', name: '午未合土' }
    ];

    for (const pattern of liuHePatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        return pattern.name;
      }
    }

    return null;
  }

  /**
   * 获取六合对应的五行
   * @param liuHeType 六合类型
   * @returns 五行
   */
  static getLiuHeWuXing(liuHeType: string): string {
    switch (liuHeType) {
      case '土': return '土';
      case '木': return '木';
      case '火': return '火';
      case '金': return '金';
      case '水': return '水';
      default: return '';
    }
  }

  /**
   * 检查地支相刑
   * @param branches 地支数组
   * @returns 相刑类型数组
   */
  static checkXing(branches: string[]): string[] {
    const xingPatterns = [
      { branches: ['寅', '巳', '申'], name: '寅巳申三刑' },
      { branches: ['丑', '戌', '未'], name: '丑戌未三刑' },
      { branches: ['子', '卯'], name: '子卯相刑' },
      { branches: ['辰', '辰'], name: '辰辰自刑' },
      { branches: ['午', '午'], name: '午午自刑' },
      { branches: ['酉', '酉'], name: '酉酉自刑' },
      { branches: ['亥', '亥'], name: '亥亥自刑' }
    ];

    const result: string[] = [];
    for (const pattern of xingPatterns) {
      if (pattern.branches.length === 3) {
        // 三刑
        if (BaziUtils.containsAll(branches, pattern.branches)) {
          result.push(pattern.name);
        }
      } else if (pattern.branches.length === 2) {
        // 相刑
        if (BaziUtils.containsAll(branches, pattern.branches)) {
          result.push(pattern.name);
        }
      } else if (pattern.branches.length === 1) {
        // 自刑
        const count = branches.filter(b => b === pattern.branches[0]).length;
        if (count >= 2) {
          result.push(pattern.name);
        }
      }
    }

    return result;
  }

  /**
   * 检查地支相害
   * @param branches 地支数组
   * @returns 相害类型数组
   */
  static checkHai(branches: string[]): string[] {
    const haiPatterns = [
      { branches: ['子', '未'], name: '子未相害' },
      { branches: ['丑', '午'], name: '丑午相害' },
      { branches: ['寅', '巳'], name: '寅巳相害' },
      { branches: ['卯', '辰'], name: '卯辰相害' },
      { branches: ['申', '亥'], name: '申亥相害' },
      { branches: ['酉', '戌'], name: '酉戌相害' }
    ];

    const result: string[] = [];
    for (const pattern of haiPatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        result.push(pattern.name);
      }
    }

    return result;
  }

  /**
   * 检查地支相冲
   * @param branches 地支数组
   * @returns 相冲类型数组
   */
  static checkChong(branches: string[]): string[] {
    const chongPatterns = [
      { branches: ['子', '午'], name: '子午相冲' },
      { branches: ['丑', '未'], name: '丑未相冲' },
      { branches: ['寅', '申'], name: '寅申相冲' },
      { branches: ['卯', '酉'], name: '卯酉相冲' },
      { branches: ['辰', '戌'], name: '辰戌相冲' },
      { branches: ['巳', '亥'], name: '巳亥相冲' }
    ];

    const result: string[] = [];
    for (const pattern of chongPatterns) {
      if (BaziUtils.containsAll(branches, pattern.branches)) {
        result.push(pattern.name);
      }
    }

    return result;
  }
}
