import { ShenShaAlgorithms } from './shensha/ShenShaAlgorithms';

/**
 * 全局颜色方案服务
 * 统一管理所有五行相关元素的颜色配置
 */
export class ColorSchemeService {
  
  // 五行颜色配置
  private static readonly WU_XING_COLORS = {
    '金': '#FFD700', // 金黄色
    '木': '#228B22', // 绿色
    '水': '#4169E1', // 蓝色
    '火': '#DC143C', // 红色
    '土': '#CD853F'  // 土黄色
  };

  // 十神颜色配置
  private static readonly SHI_SHEN_COLORS = {
    '日主': '#8B4513', // 棕色
    '比肩': '#228B22', // 绿色
    '劫财': '#32CD32', // 浅绿色
    '食神': '#FFD700', // 金色
    '伤官': '#FFA500', // 橙色
    '偏财': '#DC143C', // 红色
    '正财': '#B22222', // 深红色
    '七杀': '#8B0000', // 暗红色
    '正官': '#4B0082', // 靛蓝色
    '偏印': '#9370DB', // 紫色
    '正印': '#4169E1'  // 蓝色
  };

  // 地势颜色配置
  private static readonly DI_SHI_COLORS = {
    '长生': '#32CD32', // 浅绿色
    '沐浴': '#87CEEB', // 天蓝色
    '冠带': '#FFD700', // 金色
    '临官': '#FF6347', // 番茄红
    '帝旺': '#DC143C', // 红色
    '衰': '#DDA0DD',   // 梅花色
    '病': '#D3D3D3',   // 浅灰色
    '死': '#696969',   // 暗灰色
    '墓': '#2F4F4F',   // 暗灰绿
    '绝': '#000000',   // 黑色
    '胎': '#F0E68C',   // 卡其色
    '养': '#98FB98'    // 浅绿色
  };

  // 神煞颜色配置
  private static readonly SHEN_SHA_COLORS = {
    // 吉神
    good: '#228B22',   // 绿色
    // 凶神
    bad: '#DC143C',    // 红色
    // 中性神煞
    mixed: '#FFA500'   // 橙色
  };

  // 纳音颜色配置（按五行分类）
  private static readonly NA_YIN_COLORS = {
    // 金类纳音
    '海中金': '#D4AF37', '剑锋金': '#D4AF37', '白蜡金': '#D4AF37', 
    '砂中金': '#D4AF37', '金箔金': '#D4AF37', '钗钏金': '#D4AF37',
    
    // 木类纳音
    '桑柘木': '#228B22', '大林木': '#228B22', '杨柳木': '#228B22',
    '石榴木': '#228B22', '松柏木': '#228B22', '平地木': '#228B22',
    
    // 水类纳音
    '涧下水': '#4169E1', '泉中水': '#4169E1', '长流水': '#4169E1',
    '天河水': '#4169E1', '大溪水': '#4169E1', '大海水': '#4169E1',
    
    // 火类纳音
    '炉中火': '#DC143C', '山头火': '#DC143C', '霹雳火': '#DC143C',
    '山下火': '#DC143C', '覆灯火': '#DC143C', '天上火': '#DC143C',
    
    // 土类纳音
    '路旁土': '#DAA520', '城头土': '#DAA520', '屋上土': '#DAA520',
    '壁上土': '#DAA520', '大驿土': '#DAA520', '沙中土': '#DAA520'
  };

  /**
   * 获取五行颜色
   * @param wuXing 五行名称
   * @returns 颜色值
   */
  static getWuXingColor(wuXing: string): string {
    return this.WU_XING_COLORS[wuXing] || 'var(--text-normal)';
  }

  /**
   * 获取十神颜色
   * @param shiShen 十神名称
   * @returns 颜色值
   */
  static getShiShenColor(shiShen: string): string {
    return this.SHI_SHEN_COLORS[shiShen] || 'var(--text-normal)';
  }

  /**
   * 获取地势颜色
   * @param diShi 地势名称
   * @returns 颜色值
   */
  static getDiShiColor(diShi: string): string {
    return this.DI_SHI_COLORS[diShi] || 'var(--text-normal)';
  }

  /**
   * 获取神煞颜色
   * @param shenSha 神煞名称
   * @param type 神煞类型（good/bad/mixed）
   * @returns 颜色值
   */
  static getShenShaColor(shenSha: string, type?: 'good' | 'bad' | 'mixed'): string {
    if (type) {
      return this.SHEN_SHA_COLORS[type] || 'var(--text-normal)';
    }
    
    // 自动判断神煞类型
    const detectedType = this.detectShenShaType(shenSha);
    return this.SHEN_SHA_COLORS[detectedType] || 'var(--text-normal)';
  }

  /**
   * 获取纳音颜色
   * @param naYin 纳音名称
   * @returns 颜色值
   */
  static getNaYinColor(naYin: string): string {
    return this.NA_YIN_COLORS[naYin] || 'var(--text-normal)';
  }

  /**
   * 检测神煞类型
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  private static detectShenShaType(shenSha: string): 'good' | 'bad' | 'mixed' {
    const goodShenSha = [
      '天德', '月德', '天德合', '月德合', '天乙贵人', '太极贵人', '福星贵人',
      '文昌', '文曲', '学堂', '词馆', '国印', '将星', '金匮', '禄神', '建禄',
      '羊刃', '魁罡', '华盖', '天医', '天厨', '福德', '天喜', '红鸾'
    ];

    const badShenSha = [
      '七杀', '劫煞', '灾煞', '天煞', '地煞', '年煞', '月煞', '日煞', '时煞',
      '白虎', '丧门', '吊客', '病符', '死符', '官符', '五鬼', '六害', '破碎',
      '大耗', '小耗', '暴败', '栏杆', '空亡', '孤辰', '寡宿', '元辰', '亡神'
    ];

    const mixedShenSha = [
      '桃花', '驿马', '华盖', '童子', '将军箭', '铁扫帚', '破月', '绝火', '咸池'
    ];

    if (goodShenSha.includes(shenSha)) {
      return 'good';
    } else if (badShenSha.includes(shenSha)) {
      return 'bad';
    } else if (mixedShenSha.includes(shenSha)) {
      return 'mixed';
    } else {
      return 'mixed'; // 默认为中性
    }
  }

  /**
   * 获取天干五行
   * @param gan 天干
   * @returns 五行
   */
  static getGanWuXing(gan: string): string {
    const ganWuXingMap: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return ganWuXingMap[gan] || '';
  }

  /**
   * 获取地支五行
   * @param zhi 地支
   * @returns 五行
   */
  static getZhiWuXing(zhi: string): string {
    const zhiWuXingMap: { [key: string]: string } = {
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '辰': '土', '戌': '土', '丑': '土', '未': '土'
    };
    return zhiWuXingMap[zhi] || '';
  }

  /**
   * 获取天干颜色
   * @param gan 天干
   * @returns 颜色值
   */
  static getGanColor(gan: string): string {
    const wuXing = this.getGanWuXing(gan);
    return this.getWuXingColor(wuXing);
  }

  /**
   * 获取地支颜色
   * @param zhi 地支
   * @returns 颜色值
   */
  static getZhiColor(zhi: string): string {
    const wuXing = this.getZhiWuXing(zhi);
    return this.getWuXingColor(wuXing);
  }

  /**
   * 设置元素的五行颜色样式
   * @param element HTML元素
   * @param wuXing 五行
   */
  static setWuXingColor(element: HTMLElement, wuXing: string): void {
    element.style.color = this.getWuXingColor(wuXing);
  }

  /**
   * 设置元素的天干颜色样式
   * @param element HTML元素
   * @param gan 天干
   */
  static setGanColor(element: HTMLElement, gan: string): void {
    element.style.color = this.getGanColor(gan);
  }

  /**
   * 设置元素的地支颜色样式
   * @param element HTML元素
   * @param zhi 地支
   */
  static setZhiColor(element: HTMLElement, zhi: string): void {
    element.style.color = this.getZhiColor(zhi);
  }

  /**
   * 设置元素的十神颜色样式
   * @param element HTML元素
   * @param shiShen 十神
   */
  static setShiShenColor(element: HTMLElement, shiShen: string): void {
    element.style.color = this.getShiShenColor(shiShen);
  }

  /**
   * 设置元素的地势颜色样式
   * @param element HTML元素
   * @param diShi 地势
   */
  static setDiShiColor(element: HTMLElement, diShi: string): void {
    element.style.color = this.getDiShiColor(diShi);
  }

  /**
   * 设置元素的纳音颜色样式
   * @param element HTML元素
   * @param naYin 纳音
   */
  static setNaYinColor(element: HTMLElement, naYin: string): void {
    element.style.color = this.getNaYinColor(naYin);
  }

  /**
   * 设置元素的神煞颜色样式
   * @param element HTML元素
   * @param shenSha 神煞
   * @param type 神煞类型（可选）
   */
  static setShenShaColor(element: HTMLElement, shenSha: string, type?: 'good' | 'bad' | 'mixed'): void {
    element.style.color = this.getShenShaColor(shenSha, type);
  }

  /**
   * 创建带五行颜色的干支元素
   * @param container 容器元素
   * @param ganZhi 干支
   * @param className CSS类名（可选）
   * @returns 创建的元素
   */
  static createColoredGanZhiElement(container: HTMLElement, ganZhi: string, className?: string): HTMLElement {
    const ganZhiEl = container.createDiv({ cls: className || 'ganzhi-element' });

    if (ganZhi && ganZhi.length >= 2) {
      const gan = ganZhi[0];
      const zhi = ganZhi[1];

      // 创建天干元素并设置五行颜色
      const ganSpan = ganZhiEl.createSpan({ text: gan });
      this.setGanColor(ganSpan, gan);

      // 创建地支元素并设置五行颜色
      const zhiSpan = ganZhiEl.createSpan({ text: zhi });
      this.setZhiColor(zhiSpan, zhi);
    } else {
      ganZhiEl.textContent = ganZhi || '';
    }

    return ganZhiEl;
  }

  /**
   * 创建带颜色的旬空元素
   * @param container 容器元素
   * @param xunKong 旬空
   * @param className CSS类名（可选）
   * @returns 创建的元素
   */
  static createColoredXunKongElement(container: HTMLElement, xunKong: string, className?: string): HTMLElement {
    const xunKongEl = container.createDiv({ cls: className || 'xunkong-element' });

    if (xunKong && xunKong.length >= 2) {
      // 旬空通常是两个字符，如"辰巳"
      for (let i = 0; i < xunKong.length; i++) {
        const char = xunKong[i];
        const span = xunKongEl.createSpan({ text: char });

        // 判断是天干还是地支并设置颜色
        if (this.isGan(char)) {
          this.setGanColor(span, char);
        } else if (this.isZhi(char)) {
          this.setZhiColor(span, char);
        }
      }
    } else {
      xunKongEl.textContent = xunKong || '';
    }

    return xunKongEl;
  }

  /**
   * 创建带颜色的藏干元素
   * @param container 容器元素
   * @param hideGan 藏干
   * @param className CSS类名（可选）
   * @returns 创建的元素
   */
  static createColoredHideGanElement(container: HTMLElement, hideGan: string, className?: string): HTMLElement {
    const hideGanEl = container.createDiv({ cls: className || 'hidegan-element' });

    if (hideGan) {
      // 将藏干文本按字符分割，每个字符应用对应的五行颜色
      for (let i = 0; i < hideGan.length; i++) {
        const char = hideGan[i];
        if (char === ',' || char === ' ') {
          hideGanEl.createSpan({ text: char });
          continue;
        }

        const span = hideGanEl.createSpan({ text: char });

        // 判断是天干还是地支，应用对应的五行颜色
        if (this.isGan(char)) {
          this.setGanColor(span, char);
        } else if (this.isZhi(char)) {
          this.setZhiColor(span, char);
        }
      }
    } else {
      hideGanEl.textContent = hideGan || '';
    }

    return hideGanEl;
  }

  /**
   * 创建带颜色和点击事件的神煞元素
   * @param container 容器元素
   * @param shenShaList 神煞列表
   * @param onShenShaClick 神煞点击回调函数
   * @param className CSS类名（可选）
   * @returns 创建的元素
   */
  static createColoredShenShaElement(
    container: HTMLElement,
    shenShaList: string[],
    onShenShaClick?: (shenSha: string) => void,
    className?: string
  ): HTMLElement {
    const shenShaEl = container.createDiv({ cls: className || 'shensha-element' });
    shenShaEl.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
    `;

    shenShaList.forEach((sha, index) => {
      if (index > 0) {
        shenShaEl.createSpan({ text: ' ' });
      }

      const shenShaSpan = shenShaEl.createSpan({
        text: sha,
        cls: 'shensha-tag'
      });

      // 获取神煞类型并应用对应的颜色
      const shenShaTypeChinese = ShenShaAlgorithms.getShenShaType(sha);
      const shenShaType = this.convertShenShaTypeToEnglish(shenShaTypeChinese);
      const backgroundColor = this.getShenShaBackgroundColor(shenShaType);
      const textColor = this.getShenShaTextColor(shenShaType);

      shenShaSpan.style.cssText = `
        display: inline-block;
        padding: 2px 4px;
        margin: 1px;
        border-radius: 3px;
        font-size: 10px;
        background: ${backgroundColor};
        color: ${textColor};
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid ${this.getShenShaBorderColor(shenShaType)};
      `;

      // 悬停效果
      shenShaSpan.addEventListener('mouseenter', () => {
        shenShaSpan.style.transform = 'scale(1.05)';
        shenShaSpan.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      });

      shenShaSpan.addEventListener('mouseleave', () => {
        shenShaSpan.style.transform = 'scale(1)';
        shenShaSpan.style.boxShadow = 'none';
      });

      // 点击事件
      if (onShenShaClick) {
        shenShaSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          onShenShaClick(sha);
        });
      }
    });

    return shenShaEl;
  }

  /**
   * 转换神煞类型为英文
   * @param chineseType 中文类型
   * @returns 英文类型
   */
  private static convertShenShaTypeToEnglish(chineseType: string): string {
    switch (chineseType) {
      case '吉神': return 'good';
      case '凶神': return 'bad';
      case '吉凶神': return 'mixed';
      default: return 'mixed';
    }
  }

  /**
   * 获取神煞背景颜色
   * @param type 神煞类型
   * @returns 背景颜色
   */
  private static getShenShaBackgroundColor(type: string): string {
    switch (type) {
      case 'good': return 'rgba(34, 139, 34, 0.1)';
      case 'bad': return 'rgba(220, 20, 60, 0.1)';
      case 'mixed': return 'rgba(255, 165, 0, 0.1)';
      default: return 'var(--background-modifier-border)';
    }
  }

  /**
   * 获取神煞文字颜色
   * @param type 神煞类型
   * @returns 文字颜色
   */
  private static getShenShaTextColor(type: string): string {
    switch (type) {
      case 'good': return '#228B22';
      case 'bad': return '#DC143C';
      case 'mixed': return '#FF8C00';
      default: return 'var(--text-muted)';
    }
  }

  /**
   * 获取神煞边框颜色
   * @param type 神煞类型
   * @returns 边框颜色
   */
  private static getShenShaBorderColor(type: string): string {
    switch (type) {
      case 'good': return 'rgba(34, 139, 34, 0.3)';
      case 'bad': return 'rgba(220, 20, 60, 0.3)';
      case 'mixed': return 'rgba(255, 165, 0, 0.3)';
      default: return 'var(--background-modifier-border)';
    }
  }

  /**
   * 判断字符是否为天干
   * @param char 字符
   * @returns 是否为天干
   */
  private static isGan(char: string): boolean {
    const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    return ganList.includes(char);
  }

  /**
   * 判断字符是否为地支
   * @param char 字符
   * @returns 是否为地支
   */
  private static isZhi(char: string): boolean {
    const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return zhiList.includes(char);
  }
}
