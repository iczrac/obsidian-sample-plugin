/**
 * 五行强度计算配置（统一权重配置）
 * 总分100分体系，权重简化易懂，前后端计算统一
 */
export const WuXingConfig = {
  /**
   * 天干权重配置（总20分）
   */
  tianGanWeight: {
    year: 2,     // 年干权重
    month: 4,    // 月干权重
    day: 6,      // 日干权重
    hour: 8      // 时干权重
  },

  /**
   * 地支权重配置（总40分）
   */
  diZhiWeight: {
    year: 3,     // 年支权重
    month: 20,   // 月支权重（月令最重要）
    day: 5,      // 日支权重
    hour: 12     // 时支权重
  },

  /**
   * 地支藏干权重配置（总20分）
   */
  diZhiCangWeight: {
    year: 2,     // 年支藏干权重
    month: 10,   // 月支藏干权重
    day: 4,      // 日支藏干权重
    hour: 4      // 时支藏干权重
  },

  /**
   * 藏干内部权重配置
   * 说明：藏干内部权重表示多个藏干时的权重分配，主气最重要，中气次之，余气最轻
   */
  cangGanInnerWeight: {
    one: [1.0],                // 一个藏干：100%权重
    two: [0.6, 0.4],           // 两个藏干：60%和40%权重
    three: [0.5, 0.3, 0.2]     // 三个藏干：50%、30%和20%权重
  },

  /**
   * 纳音五行权重配置（总5分）
   */
  naYinWeight: {
    year: 1,     // 年柱纳音权重
    month: 2,    // 月柱纳音权重
    day: 1.5,    // 日柱纳音权重
    hour: 0.5    // 时柱纳音权重
  },

  /**
   * 季节调整系数配置（总30分）
   */
  seasonAdjust: {
    wang: 15,    // 旺相系数
    xiang: 8,    // 相旺系数
    ping: 0,     // 平和系数
    qiu: -8,     // 囚系数
    si: -12      // 死系数
  },

  /**
   * 月令当令加成配置（已废弃）
   * 说明：季节调整已经包含了月令影响，不需要额外的月令加成
   */
  monthDominantBonus: {
    dominant: 0.0,   // 已废弃，由季节调整替代
    related: 0.0,    // 已废弃，由季节调整替代
    neutral: 0.0,    // 已废弃，由季节调整替代
    weak: 0.0,       // 已废弃，由季节调整替代
    dead: 0.0        // 已废弃，由季节调整替代
  },

  /**
   * 组合关系权重配置（总5分）
   */
  combinationWeight: {
    tianGanWuHe: 2,        // 天干五合权重
    diZhiSanHe: 3,         // 地支三合权重
    diZhiSanHui: 2         // 地支三会权重
  },

  /**
   * 季节五行对应关系
   * 说明：各季节对应的五行旺衰状态
   */
  seasonWuXingStatus: {
    spring: {  // 春季
      mu: 'wang',    // 木旺
      huo: 'xiang',  // 火相
      tu: 'ping',    // 土平
      jin: 'qiu',    // 金囚
      shui: 'si'     // 水死
    },
    summer: {  // 夏季
      huo: 'wang',   // 火旺
      tu: 'xiang',   // 土相
      jin: 'ping',   // 金平
      shui: 'qiu',   // 水囚
      mu: 'si'       // 木死
    },
    autumn: {  // 秋季
      jin: 'wang',   // 金旺
      shui: 'xiang', // 水相
      mu: 'ping',    // 木平
      huo: 'qiu',    // 火囚
      tu: 'si'       // 土死
    },
    winter: {  // 冬季
      shui: 'wang',  // 水旺
      mu: 'xiang',   // 木相
      huo: 'ping',   // 火平
      tu: 'qiu',     // 土囚
      jin: 'si'      // 金死
    }
  },

  /**
   * 月令当令五行对应关系
   * 说明：各季节当令和相旺的五行
   */
  monthDominantWuXing: {
    spring: {  // 春季
      dominant: 'mu',    // 木当令
      related: 'huo'     // 火相旺
    },
    summer: {  // 夏季
      dominant: 'huo',   // 火当令
      related: 'tu'      // 土相旺
    },
    autumn: {  // 秋季
      dominant: 'jin',   // 金当令
      related: 'shui'    // 水相旺
    },
    winter: {  // 冬季
      dominant: 'shui',  // 水当令
      related: 'mu'      // 木相旺
    }
  }
};
