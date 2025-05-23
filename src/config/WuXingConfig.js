/**
 * 五行强度计算配置
 * 包含各种权重和计算参数
 */
export const WuXingConfig = {
    /**
     * 天干权重配置
     * 说明：天干权重表示天干在八字中的影响力，日主最重要，月令次之，年柱和时柱相对较轻
     */
    tianGanWeight: {
        year: 1.2,
        month: 3.0,
        day: 3.0,
        hour: 1.0 // 时干权重（保持不变）
    },
    /**
     * 地支藏干权重配置
     * 说明：地支藏干权重表示地支藏干在八字中的影响力，月支最重要，日支次之
     */
    diZhiCangWeight: {
        year: 0.8,
        month: 2.5,
        day: 2.2,
        hour: 0.7 // 时支藏干权重（保持不变）
    },
    /**
     * 藏干内部权重配置
     * 说明：藏干内部权重表示多个藏干时的权重分配，主气最重要，中气次之，余气最轻
     */
    cangGanInnerWeight: {
        one: [1.0],
        two: [0.6, 0.4],
        three: [0.5, 0.3, 0.2] // 三个藏干：50%、30%和20%权重
    },
    /**
     * 纳音五行权重配置
     * 说明：纳音五行权重表示纳音在八字中的影响力，月柱最重要，日柱次之
     */
    naYinWeight: {
        year: 0.6,
        month: 2.0,
        day: 1.5,
        hour: 0.5 // 时柱纳音权重（保持不变）
    },
    /**
     * 季节调整系数配置
     * 说明：季节调整系数表示五行在不同季节的旺衰程度
     */
    seasonAdjust: {
        wang: 2.5,
        xiang: 1.2,
        ping: 0.0,
        qiu: -1.2,
        si: -1.8 // 死系数（从-1.5增强到-1.8）
    },
    /**
     * 月令当令加成配置
     * 说明：月令当令加成表示当令五行和相旺五行的额外加成
     */
    monthDominantBonus: {
        dominant: 2.0,
        related: 1.0,
        neutral: 0.0,
        weak: -0.5,
        dead: -0.8 // 死加成（新增）
    },
    /**
     * 组合关系权重配置
     * 说明：组合关系权重表示各种组合关系对五行强度的影响
     */
    combinationWeight: {
        tianGanWuHe: 0.8,
        diZhiSanHe: 1.5,
        diZhiSanHui: 1.2,
        partialSanHe: 0.9,
        partialSanHui: 0.7 // 部分三会权重（新增，为完整三会的60%）
    },
    /**
     * 季节五行对应关系
     * 说明：各季节对应的五行旺衰状态
     */
    seasonWuXingStatus: {
        spring: {
            mu: 'wang',
            huo: 'xiang',
            tu: 'ping',
            jin: 'qiu',
            shui: 'si' // 水死
        },
        summer: {
            huo: 'wang',
            tu: 'xiang',
            jin: 'ping',
            shui: 'qiu',
            mu: 'si' // 木死
        },
        autumn: {
            jin: 'wang',
            shui: 'xiang',
            mu: 'ping',
            huo: 'qiu',
            tu: 'si' // 土死
        },
        winter: {
            shui: 'wang',
            mu: 'xiang',
            huo: 'ping',
            tu: 'qiu',
            jin: 'si' // 金死
        }
    },
    /**
     * 月令当令五行对应关系
     * 说明：各季节当令和相旺的五行
     */
    monthDominantWuXing: {
        spring: {
            dominant: 'mu',
            related: 'huo' // 火相旺
        },
        summer: {
            dominant: 'huo',
            related: 'tu' // 土相旺
        },
        autumn: {
            dominant: 'jin',
            related: 'shui' // 水相旺
        },
        winter: {
            dominant: 'shui',
            related: 'mu' // 木相旺
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3VYaW5nQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiV3VYaW5nQ29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRztJQUMxQjs7O09BR0c7SUFDSCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsR0FBRztRQUNULEtBQUssRUFBRSxHQUFHO1FBQ1YsR0FBRyxFQUFFLEdBQUc7UUFDUixJQUFJLEVBQUUsR0FBRyxDQUFJLGFBQWE7S0FDM0I7SUFFRDs7O09BR0c7SUFDSCxlQUFlLEVBQUU7UUFDZixJQUFJLEVBQUUsR0FBRztRQUNULEtBQUssRUFBRSxHQUFHO1FBQ1YsR0FBRyxFQUFFLEdBQUc7UUFDUixJQUFJLEVBQUUsR0FBRyxDQUFJLGVBQWU7S0FDN0I7SUFFRDs7O09BR0c7SUFDSCxrQkFBa0IsRUFBRTtRQUNsQixHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBSyxxQkFBcUI7S0FDakQ7SUFFRDs7O09BR0c7SUFDSCxXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsR0FBRztRQUNULEtBQUssRUFBRSxHQUFHO1FBQ1YsR0FBRyxFQUFFLEdBQUc7UUFDUixJQUFJLEVBQUUsR0FBRyxDQUFJLGVBQWU7S0FDN0I7SUFFRDs7O09BR0c7SUFDSCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsR0FBRztRQUNULEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLEdBQUc7UUFDVCxHQUFHLEVBQUUsQ0FBQyxHQUFHO1FBQ1QsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFLLG9CQUFvQjtLQUNsQztJQUVEOzs7T0FHRztJQUNILGtCQUFrQixFQUFFO1FBQ2xCLFFBQVEsRUFBRSxHQUFHO1FBQ2IsT0FBTyxFQUFFLEdBQUc7UUFDWixPQUFPLEVBQUUsR0FBRztRQUNaLElBQUksRUFBRSxDQUFDLEdBQUc7UUFDVixJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQU8sVUFBVTtLQUM1QjtJQUVEOzs7T0FHRztJQUNILGlCQUFpQixFQUFFO1FBQ2pCLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLFVBQVUsRUFBRSxHQUFHO1FBQ2YsV0FBVyxFQUFFLEdBQUc7UUFDaEIsWUFBWSxFQUFFLEdBQUc7UUFDakIsYUFBYSxFQUFFLEdBQUcsQ0FBSyx1QkFBdUI7S0FDL0M7SUFFRDs7O09BR0c7SUFDSCxrQkFBa0IsRUFBRTtRQUNsQixNQUFNLEVBQUU7WUFDTixFQUFFLEVBQUUsTUFBTTtZQUNWLEdBQUcsRUFBRSxPQUFPO1lBQ1osRUFBRSxFQUFFLE1BQU07WUFDVixHQUFHLEVBQUUsS0FBSztZQUNWLElBQUksRUFBRSxJQUFJLENBQUssS0FBSztTQUNyQjtRQUNELE1BQU0sRUFBRTtZQUNOLEdBQUcsRUFBRSxNQUFNO1lBQ1gsRUFBRSxFQUFFLE9BQU87WUFDWCxHQUFHLEVBQUUsTUFBTTtZQUNYLElBQUksRUFBRSxLQUFLO1lBQ1gsRUFBRSxFQUFFLElBQUksQ0FBTyxLQUFLO1NBQ3JCO1FBQ0QsTUFBTSxFQUFFO1lBQ04sR0FBRyxFQUFFLE1BQU07WUFDWCxJQUFJLEVBQUUsT0FBTztZQUNiLEVBQUUsRUFBRSxNQUFNO1lBQ1YsR0FBRyxFQUFFLEtBQUs7WUFDVixFQUFFLEVBQUUsSUFBSSxDQUFPLEtBQUs7U0FDckI7UUFDRCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLEVBQUUsRUFBRSxPQUFPO1lBQ1gsR0FBRyxFQUFFLE1BQU07WUFDWCxFQUFFLEVBQUUsS0FBSztZQUNULEdBQUcsRUFBRSxJQUFJLENBQU0sS0FBSztTQUNyQjtLQUNGO0lBRUQ7OztPQUdHO0lBQ0gsbUJBQW1CLEVBQUU7UUFDbkIsTUFBTSxFQUFFO1lBQ04sUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUUsS0FBSyxDQUFLLE1BQU07U0FDMUI7UUFDRCxNQUFNLEVBQUU7WUFDTixRQUFRLEVBQUUsS0FBSztZQUNmLE9BQU8sRUFBRSxJQUFJLENBQU0sTUFBTTtTQUMxQjtRQUNELE1BQU0sRUFBRTtZQUNOLFFBQVEsRUFBRSxLQUFLO1lBQ2YsT0FBTyxFQUFFLE1BQU0sQ0FBSSxNQUFNO1NBQzFCO1FBQ0QsTUFBTSxFQUFFO1lBQ04sUUFBUSxFQUFFLE1BQU07WUFDaEIsT0FBTyxFQUFFLElBQUksQ0FBTSxNQUFNO1NBQzFCO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDkupTooYzlvLrluqborqHnrpfphY3nva5cbiAqIOWMheWQq+WQhOenjeadg+mHjeWSjOiuoeeul+WPguaVsFxuICovXG5leHBvcnQgY29uc3QgV3VYaW5nQ29uZmlnID0ge1xuICAvKipcbiAgICog5aSp5bmy5p2D6YeN6YWN572uXG4gICAqIOivtOaYju+8muWkqeW5suadg+mHjeihqOekuuWkqeW5suWcqOWFq+Wtl+S4reeahOW9seWTjeWKm++8jOaXpeS4u+acgOmHjeimge+8jOaciOS7pOasoeS5i++8jOW5tOafseWSjOaXtuafseebuOWvuei+g+i9u1xuICAgKi9cbiAgdGlhbkdhbldlaWdodDoge1xuICAgIHllYXI6IDEuMiwgICAvLyDlubTlubLmnYPph43vvIjku44xLjDmj5Dpq5jliLAxLjLvvIlcbiAgICBtb250aDogMy4wLCAgLy8g5pyI5bmy5p2D6YeN77yI5LuOMi415o+Q6auY5YiwMy4w77yJXG4gICAgZGF5OiAzLjAsICAgIC8vIOaXpeW5suadg+mHje+8iOS/neaMgeS4jeWPmO+8iVxuICAgIGhvdXI6IDEuMCAgICAvLyDml7blubLmnYPph43vvIjkv53mjIHkuI3lj5jvvIlcbiAgfSxcblxuICAvKipcbiAgICog5Zyw5pSv6JeP5bmy5p2D6YeN6YWN572uXG4gICAqIOivtOaYju+8muWcsOaUr+iXj+W5suadg+mHjeihqOekuuWcsOaUr+iXj+W5suWcqOWFq+Wtl+S4reeahOW9seWTjeWKm++8jOaciOaUr+acgOmHjeimge+8jOaXpeaUr+asoeS5i1xuICAgKi9cbiAgZGlaaGlDYW5nV2VpZ2h0OiB7XG4gICAgeWVhcjogMC44LCAgIC8vIOW5tOaUr+iXj+W5suadg+mHje+8iOS7jjAuN+aPkOmrmOWIsDAuOO+8iVxuICAgIG1vbnRoOiAyLjUsICAvLyDmnIjmlK/ol4/lubLmnYPph43vvIjku44yLjDmj5Dpq5jliLAyLjXvvIlcbiAgICBkYXk6IDIuMiwgICAgLy8g5pel5pSv6JeP5bmy5p2D6YeN77yI5LuOMi4w5o+Q6auY5YiwMi4y77yJXG4gICAgaG91cjogMC43ICAgIC8vIOaXtuaUr+iXj+W5suadg+mHje+8iOS/neaMgeS4jeWPmO+8iVxuICB9LFxuXG4gIC8qKlxuICAgKiDol4/lubLlhoXpg6jmnYPph43phY3nva5cbiAgICog6K+05piO77ya6JeP5bmy5YaF6YOo5p2D6YeN6KGo56S65aSa5Liq6JeP5bmy5pe255qE5p2D6YeN5YiG6YWN77yM5Li75rCU5pyA6YeN6KaB77yM5Lit5rCU5qyh5LmL77yM5L2Z5rCU5pyA6L27XG4gICAqL1xuICBjYW5nR2FuSW5uZXJXZWlnaHQ6IHtcbiAgICBvbmU6IFsxLjBdLCAgICAgICAgICAgICAgICAvLyDkuIDkuKrol4/lubLvvJoxMDAl5p2D6YeNXG4gICAgdHdvOiBbMC42LCAwLjRdLCAgICAgICAgICAgLy8g5Lik5Liq6JeP5bmy77yaNjAl5ZKMNDAl5p2D6YeNXG4gICAgdGhyZWU6IFswLjUsIDAuMywgMC4yXSAgICAgLy8g5LiJ5Liq6JeP5bmy77yaNTAl44CBMzAl5ZKMMjAl5p2D6YeNXG4gIH0sXG5cbiAgLyoqXG4gICAqIOe6s+mfs+S6lOihjOadg+mHjemFjee9rlxuICAgKiDor7TmmI7vvJrnurPpn7PkupTooYzmnYPph43ooajnpLrnurPpn7PlnKjlhavlrZfkuK3nmoTlvbHlk43lipvvvIzmnIjmn7HmnIDph43opoHvvIzml6Xmn7HmrKHkuYtcbiAgICovXG4gIG5hWWluV2VpZ2h0OiB7XG4gICAgeWVhcjogMC42LCAgIC8vIOW5tOafsee6s+mfs+adg+mHje+8iOS7jjAuNeaPkOmrmOWIsDAuNu+8iVxuICAgIG1vbnRoOiAyLjAsICAvLyDmnIjmn7HnurPpn7PmnYPph43vvIjku44xLjXmj5Dpq5jliLAyLjDvvIlcbiAgICBkYXk6IDEuNSwgICAgLy8g5pel5p+x57qz6Z+z5p2D6YeN77yI5L+d5oyB5LiN5Y+Y77yJXG4gICAgaG91cjogMC41ICAgIC8vIOaXtuafsee6s+mfs+adg+mHje+8iOS/neaMgeS4jeWPmO+8iVxuICB9LFxuXG4gIC8qKlxuICAgKiDlraPoioLosIPmlbTns7vmlbDphY3nva5cbiAgICog6K+05piO77ya5a2j6IqC6LCD5pW057O75pWw6KGo56S65LqU6KGM5Zyo5LiN5ZCM5a2j6IqC55qE5pe66KGw56iL5bqmXG4gICAqL1xuICBzZWFzb25BZGp1c3Q6IHtcbiAgICB3YW5nOiAyLjUsICAgLy8g5pe655u457O75pWw77yI5LuOMi4w5o+Q6auY5YiwMi4177yJXG4gICAgeGlhbmc6IDEuMiwgIC8vIOebuOaXuuezu+aVsO+8iOS7jjEuMOaPkOmrmOWIsDEuMu+8iVxuICAgIHBpbmc6IDAuMCwgICAvLyDlubPlkozns7vmlbDvvIjkv53mjIHkuI3lj5jvvIlcbiAgICBxaXU6IC0xLjIsICAgLy8g5Zua57O75pWw77yI5LuOLTEuMOWinuW8uuWIsC0xLjLvvIlcbiAgICBzaTogLTEuOCAgICAgLy8g5q2757O75pWw77yI5LuOLTEuNeWinuW8uuWIsC0xLjjvvIlcbiAgfSxcblxuICAvKipcbiAgICog5pyI5Luk5b2T5Luk5Yqg5oiQ6YWN572uXG4gICAqIOivtOaYju+8muaciOS7pOW9k+S7pOWKoOaIkOihqOekuuW9k+S7pOS6lOihjOWSjOebuOaXuuS6lOihjOeahOmineWkluWKoOaIkFxuICAgKi9cbiAgbW9udGhEb21pbmFudEJvbnVzOiB7XG4gICAgZG9taW5hbnQ6IDIuMCwgICAvLyDlvZPku6TliqDmiJDvvIjku44xLjXmj5Dpq5jliLAyLjDvvIlcbiAgICByZWxhdGVkOiAxLjAsICAgIC8vIOebuOaXuuWKoOaIkO+8iOS7jjAuOOaPkOmrmOWIsDEuMO+8iVxuICAgIG5ldXRyYWw6IDAuMCwgICAgLy8g5bmz5ZKM5Yqg5oiQ77yI5L+d5oyB5LiN5Y+Y77yJXG4gICAgd2VhazogLTAuNSwgICAgICAvLyDlm5rliqDmiJDvvIjmlrDlop7vvIlcbiAgICBkZWFkOiAtMC44ICAgICAgIC8vIOatu+WKoOaIkO+8iOaWsOWinu+8iVxuICB9LFxuXG4gIC8qKlxuICAgKiDnu4TlkIjlhbPns7vmnYPph43phY3nva5cbiAgICog6K+05piO77ya57uE5ZCI5YWz57O75p2D6YeN6KGo56S65ZCE56eN57uE5ZCI5YWz57O75a+55LqU6KGM5by65bqm55qE5b2x5ZONXG4gICAqL1xuICBjb21iaW5hdGlvbldlaWdodDoge1xuICAgIHRpYW5HYW5XdUhlOiAwLjgsICAgICAgLy8g5aSp5bmy5LqU5ZCI5p2D6YeN77yI5LuOMC425o+Q6auY5YiwMC4477yJXG4gICAgZGlaaGlTYW5IZTogMS41LCAgICAgICAvLyDlnLDmlK/kuInlkIjmnYPph43vvIjku44xLjLmj5Dpq5jliLAxLjXvvIlcbiAgICBkaVpoaVNhbkh1aTogMS4yLCAgICAgIC8vIOWcsOaUr+S4ieS8muadg+mHje+8iOS7jjEuMOaPkOmrmOWIsDEuMu+8iVxuICAgIHBhcnRpYWxTYW5IZTogMC45LCAgICAgLy8g6YOo5YiG5LiJ5ZCI5p2D6YeN77yI5paw5aKe77yM5Li65a6M5pW05LiJ5ZCI55qENjAl77yJXG4gICAgcGFydGlhbFNhbkh1aTogMC43ICAgICAvLyDpg6jliIbkuInkvJrmnYPph43vvIjmlrDlop7vvIzkuLrlrozmlbTkuInkvJrnmoQ2MCXvvIlcbiAgfSxcblxuICAvKipcbiAgICog5a2j6IqC5LqU6KGM5a+55bqU5YWz57O7XG4gICAqIOivtOaYju+8muWQhOWto+iKguWvueW6lOeahOS6lOihjOaXuuihsOeKtuaAgVxuICAgKi9cbiAgc2Vhc29uV3VYaW5nU3RhdHVzOiB7XG4gICAgc3ByaW5nOiB7ICAvLyDmmKXlraNcbiAgICAgIG11OiAnd2FuZycsICAgIC8vIOacqOaXulxuICAgICAgaHVvOiAneGlhbmcnLCAgLy8g54Gr55u4XG4gICAgICB0dTogJ3BpbmcnLCAgICAvLyDlnJ/lubNcbiAgICAgIGppbjogJ3FpdScsICAgIC8vIOmHkeWbmlxuICAgICAgc2h1aTogJ3NpJyAgICAgLy8g5rC05q27XG4gICAgfSxcbiAgICBzdW1tZXI6IHsgIC8vIOWkj+Wto1xuICAgICAgaHVvOiAnd2FuZycsICAgLy8g54Gr5pe6XG4gICAgICB0dTogJ3hpYW5nJywgICAvLyDlnJ/nm7hcbiAgICAgIGppbjogJ3BpbmcnLCAgIC8vIOmHkeW5s1xuICAgICAgc2h1aTogJ3FpdScsICAgLy8g5rC05ZuaXG4gICAgICBtdTogJ3NpJyAgICAgICAvLyDmnKjmrbtcbiAgICB9LFxuICAgIGF1dHVtbjogeyAgLy8g56eL5a2jXG4gICAgICBqaW46ICd3YW5nJywgICAvLyDph5Hml7pcbiAgICAgIHNodWk6ICd4aWFuZycsIC8vIOawtOebuFxuICAgICAgbXU6ICdwaW5nJywgICAgLy8g5pyo5bmzXG4gICAgICBodW86ICdxaXUnLCAgICAvLyDngavlm5pcbiAgICAgIHR1OiAnc2knICAgICAgIC8vIOWcn+atu1xuICAgIH0sXG4gICAgd2ludGVyOiB7ICAvLyDlhqzlraNcbiAgICAgIHNodWk6ICd3YW5nJywgIC8vIOawtOaXulxuICAgICAgbXU6ICd4aWFuZycsICAgLy8g5pyo55u4XG4gICAgICBodW86ICdwaW5nJywgICAvLyDngavlubNcbiAgICAgIHR1OiAncWl1JywgICAgIC8vIOWcn+WbmlxuICAgICAgamluOiAnc2knICAgICAgLy8g6YeR5q27XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiDmnIjku6TlvZPku6TkupTooYzlr7nlupTlhbPns7tcbiAgICog6K+05piO77ya5ZCE5a2j6IqC5b2T5Luk5ZKM55u45pe655qE5LqU6KGMXG4gICAqL1xuICBtb250aERvbWluYW50V3VYaW5nOiB7XG4gICAgc3ByaW5nOiB7ICAvLyDmmKXlraNcbiAgICAgIGRvbWluYW50OiAnbXUnLCAgICAvLyDmnKjlvZPku6RcbiAgICAgIHJlbGF0ZWQ6ICdodW8nICAgICAvLyDngavnm7jml7pcbiAgICB9LFxuICAgIHN1bW1lcjogeyAgLy8g5aSP5a2jXG4gICAgICBkb21pbmFudDogJ2h1bycsICAgLy8g54Gr5b2T5LukXG4gICAgICByZWxhdGVkOiAndHUnICAgICAgLy8g5Zyf55u45pe6XG4gICAgfSxcbiAgICBhdXR1bW46IHsgIC8vIOeni+Wto1xuICAgICAgZG9taW5hbnQ6ICdqaW4nLCAgIC8vIOmHkeW9k+S7pFxuICAgICAgcmVsYXRlZDogJ3NodWknICAgIC8vIOawtOebuOaXulxuICAgIH0sXG4gICAgd2ludGVyOiB7ICAvLyDlhqzlraNcbiAgICAgIGRvbWluYW50OiAnc2h1aScsICAvLyDmsLTlvZPku6RcbiAgICAgIHJlbGF0ZWQ6ICdtdScgICAgICAvLyDmnKjnm7jml7pcbiAgICB9XG4gIH1cbn07XG4iXX0=