/**
 * 八字工具函数模块
 * 包含通用的工具函数和常量定义
 */
export class BaziUtils {
  /**
   * 获取天干对应的五行
   * @param stem 天干
   * @returns 五行
   */
  static getStemWuXing(stem: string): string {
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
   * 获取地支对应的生肖
   * @param branch 地支
   * @returns 生肖
   */
  static getShengXiao(branch: string): string {
    const map: {[key: string]: string} = {
      '子': '鼠',
      '丑': '牛',
      '寅': '虎',
      '卯': '兔',
      '辰': '龙',
      '巳': '蛇',
      '午': '马',
      '未': '羊',
      '申': '猴',
      '酉': '鸡',
      '戌': '狗',
      '亥': '猪'
    };

    return map[branch] || '未知';
  }

  /**
   * 获取地支对应的五行
   * @param branch 地支
   * @returns 五行
   */
  static getBranchWuXing(branch: string): string {
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
   * 根据月日获取星座
   * @param month 月份（1-12）
   * @param day 日期（1-31）
   * @returns 星座名称
   */
  static getZodiac(month: number, day: number): string {
    const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    const signs = [
      '摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
      '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座'
    ];

    if (month < 1 || month > 12) return '未知';
    
    const index = day < dates[month - 1] ? month - 1 : month % 12;
    return signs[index];
  }

  /**
   * 检查数组是否包含所有指定元素
   * @param array 要检查的数组
   * @param elements 要查找的元素
   * @returns 是否包含所有元素
   */
  static containsAll(array: string[], elements: string[]): boolean {
    return elements.every(element => array.includes(element));
  }

  /**
   * 判断五行是否相生
   * @param from 生者五行
   * @param to 被生者五行
   * @returns 是否相生
   */
  static isWuXingSheng(from: string, to: string): boolean {
    // 五行相生：木生火，火生土，土生金，金生水，水生木
    return (from.includes('木') && to.includes('火')) ||
           (from.includes('火') && to.includes('土')) ||
           (from.includes('土') && to.includes('金')) ||
           (from.includes('金') && to.includes('水')) ||
           (from.includes('水') && to.includes('木'));
  }

  /**
   * 判断五行是否相克
   * @param from 克者五行
   * @param to 被克者五行
   * @returns 是否相克
   */
  static isWuXingKe(from: string, to: string): boolean {
    // 五行相克：木克土，土克水，水克火，火克金，金克木
    return (from.includes('木') && to.includes('土')) ||
           (from.includes('土') && to.includes('水')) ||
           (from.includes('水') && to.includes('火')) ||
           (from.includes('火') && to.includes('金')) ||
           (from.includes('金') && to.includes('木'));
  }

  /**
   * 获取纳音对应的五行
   * @param naYin 纳音
   * @returns 五行
   */
  static getNaYinWuXing(naYin: string): string {
    if (!naYin) return '';

    if (naYin.includes('金')) return '金';
    if (naYin.includes('木')) return '木';
    if (naYin.includes('水')) return '水';
    if (naYin.includes('火')) return '火';
    if (naYin.includes('土')) return '土';

    return '';
  }

  /**
   * 判断地支是否相冲
   * @param zhi1 地支1
   * @param zhi2 地支2
   * @returns 是否相冲
   */
  static isZhiChong(zhi1: string, zhi2: string): boolean {
    const chongPairs = [
      ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'],
      ['辰', '戌'], ['巳', '亥']
    ];

    return chongPairs.some(pair => 
      (pair[0] === zhi1 && pair[1] === zhi2) || 
      (pair[0] === zhi2 && pair[1] === zhi1)
    );
  }

  /**
   * 获取五行对应的CSS类名
   * @param wuxing 五行名称
   * @returns CSS类名
   */
  static getWuXingClass(wuxing: string): string {
    // 如果wuxing未定义，返回空字符串
    if (!wuxing) {
      return '';
    }

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
   * 天干序列
   */
  static readonly STEMS = "甲乙丙丁戊己庚辛壬癸";

  /**
   * 地支序列
   */
  static readonly BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

  /**
   * 获取天干索引
   * @param stem 天干
   * @returns 索引（0-9）
   */
  static getStemIndex(stem: string): number {
    return this.STEMS.indexOf(stem);
  }

  /**
   * 获取地支索引
   * @param branch 地支
   * @returns 索引（0-11）
   */
  static getBranchIndex(branch: string): number {
    return this.BRANCHES.indexOf(branch);
  }

  /**
   * 根据索引获取天干
   * @param index 索引（0-9）
   * @returns 天干
   */
  static getStemByIndex(index: number): string {
    return this.STEMS[index % 10];
  }

  /**
   * 根据索引获取地支
   * @param index 索引（0-11）
   * @returns 地支
   */
  static getBranchByIndex(index: number): string {
    return this.BRANCHES[index % 12];
  }
}
