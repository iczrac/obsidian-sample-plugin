/**
 * 朝代识别服务
 * 根据年份自动识别对应的朝代
 */
export class DynastyService {
    /**
     * 朝代时间范围映射表
     * 注意：这里使用的是大致的历史时期，实际历史可能有重叠和争议
     */
    private static readonly DYNASTY_RANGES = [
        // 古代朝代
        { name: "夏朝", start: -2070, end: -1600 },
        { name: "商朝", start: -1600, end: -1046 },
        { name: "西周", start: -1046, end: -771 },
        { name: "东周", start: -770, end: -256 },
        { name: "春秋", start: -770, end: -476 },
        { name: "战国", start: -475, end: -221 },
        { name: "秦朝", start: -221, end: -206 },
        { name: "西汉", start: -206, end: 8 },
        { name: "东汉", start: 25, end: 220 },
        { name: "三国", start: 220, end: 280 },
        { name: "西晋", start: 266, end: 316 },
        { name: "东晋", start: 317, end: 420 },
        { name: "南北朝", start: 420, end: 589 },
        { name: "隋朝", start: 581, end: 618 },
        { name: "唐朝", start: 618, end: 907 },
        { name: "五代十国", start: 907, end: 979 },
        { name: "北宋", start: 960, end: 1127 },
        { name: "南宋", start: 1127, end: 1279 },
        { name: "辽朝", start: 916, end: 1125 },
        { name: "金朝", start: 1115, end: 1234 },
        { name: "元朝", start: 1271, end: 1368 },
        { name: "明朝", start: 1368, end: 1644 },
        { name: "清朝", start: 1644, end: 1912 },
        
        // 近现代时期
        { name: "民国", start: 1912, end: 1949 },
        { name: "建国初期", start: 1949, end: 1966 },
        { name: "文革时期", start: 1966, end: 1976 },
        { name: "改革开放", start: 1978, end: 2000 },
        { name: "新世纪", start: 2000, end: 2012 },
        { name: "新时代", start: 2012, end: 2100 }
    ];

    /**
     * 根据年份获取对应的朝代
     * @param year 年份（公历年份）
     * @returns 朝代名称，如果没有匹配则返回null
     */
    static getDynastyByYear(year: number): string | null {
        for (const dynasty of this.DYNASTY_RANGES) {
            if (year >= dynasty.start && year <= dynasty.end) {
                return dynasty.name;
            }
        }
        return null;
    }

    /**
     * 根据年份获取所有可能的朝代（处理重叠时期）
     * @param year 年份（公历年份）
     * @returns 朝代名称数组
     */
    static getAllDynastiesByYear(year: number): string[] {
        const dynasties: string[] = [];
        for (const dynasty of this.DYNASTY_RANGES) {
            if (year >= dynasty.start && year <= dynasty.end) {
                dynasties.push(dynasty.name);
            }
        }
        return dynasties;
    }

    /**
     * 获取朝代的时间范围
     * @param dynastyName 朝代名称
     * @returns 时间范围对象，如果没有找到则返回null
     */
    static getDynastyRange(dynastyName: string): { start: number; end: number } | null {
        const dynasty = this.DYNASTY_RANGES.find(d => d.name === dynastyName);
        return dynasty ? { start: dynasty.start, end: dynasty.end } : null;
    }

    /**
     * 获取所有朝代列表
     * @returns 朝代名称数组
     */
    static getAllDynasties(): string[] {
        return this.DYNASTY_RANGES.map(d => d.name);
    }

    /**
     * 判断是否为古代朝代
     * @param dynastyName 朝代名称
     * @returns 是否为古代朝代
     */
    static isAncientDynasty(dynastyName: string): boolean {
        const ancientDynasties = [
            "夏朝", "商朝", "西周", "东周", "春秋", "战国", "秦朝", "西汉", "东汉",
            "三国", "西晋", "东晋", "南北朝", "隋朝", "唐朝", "五代十国", "北宋", "南宋",
            "辽朝", "金朝", "元朝", "明朝", "清朝"
        ];
        return ancientDynasties.includes(dynastyName);
    }

    /**
     * 判断是否为近现代时期
     * @param dynastyName 朝代名称
     * @returns 是否为近现代时期
     */
    static isModernEra(dynastyName: string): boolean {
        const modernEras = [
            "民国", "建国初期", "文革时期", "改革开放", "新世纪", "新时代"
        ];
        return modernEras.includes(dynastyName);
    }

    /**
     * 根据年份生成时代特征标签
     * @param year 年份（公历年份）
     * @returns 时代特征标签数组
     */
    static generateEraTagsByYear(year: number): string[] {
        const tags: string[] = [];
        
        // 获取朝代标签
        const dynasties = this.getAllDynastiesByYear(year);
        tags.push(...dynasties);
        
        // 添加年代标签
        if (year >= 1940 && year < 1950) tags.push("40后");
        else if (year >= 1950 && year < 1960) tags.push("50后");
        else if (year >= 1960 && year < 1970) tags.push("60后");
        else if (year >= 1970 && year < 1980) tags.push("70后");
        else if (year >= 1980 && year < 1990) tags.push("80后");
        else if (year >= 1990 && year < 2000) tags.push("90后");
        else if (year >= 2000 && year < 2010) tags.push("00后");
        else if (year >= 2010 && year < 2020) tags.push("10后");
        else if (year >= 2020 && year < 2030) tags.push("20后");
        
        return tags;
    }

    /**
     * 获取朝代的详细信息
     * @param dynastyName 朝代名称
     * @returns 朝代详细信息
     */
    static getDynastyInfo(dynastyName: string): {
        name: string;
        start: number;
        end: number;
        duration: number;
        type: 'ancient' | 'modern';
        description?: string;
    } | null {
        const dynasty = this.DYNASTY_RANGES.find(d => d.name === dynastyName);
        if (!dynasty) return null;

        return {
            name: dynasty.name,
            start: dynasty.start,
            end: dynasty.end,
            duration: dynasty.end - dynasty.start,
            type: this.isAncientDynasty(dynasty.name) ? 'ancient' : 'modern',
            description: this.getDynastyDescription(dynasty.name)
        };
    }

    /**
     * 获取朝代描述
     * @param dynastyName 朝代名称
     * @returns 朝代描述
     */
    private static getDynastyDescription(dynastyName: string): string {
        const descriptions: { [key: string]: string } = {
            "夏朝": "中国历史上第一个朝代",
            "商朝": "以青铜器和甲骨文著称",
            "西周": "分封制和宗法制的确立",
            "东周": "春秋战国时期的开始",
            "春秋": "礼崩乐坏，百家争鸣",
            "战国": "七雄争霸，变法图强",
            "秦朝": "统一六国，建立中央集权",
            "西汉": "丝绸之路的开辟",
            "东汉": "科技文化的繁荣",
            "三国": "群雄割据，英雄辈出",
            "西晋": "短暂的统一",
            "东晋": "南迁政权",
            "南北朝": "南北对峙，文化交融",
            "隋朝": "大运河的开凿",
            "唐朝": "盛世王朝，文化繁荣",
            "五代十国": "分裂割据时期",
            "北宋": "经济文化的高度发展",
            "南宋": "偏安江南",
            "辽朝": "契丹族建立的政权",
            "金朝": "女真族建立的政权",
            "元朝": "蒙古族建立的统一政权",
            "明朝": "汉族复兴，海上丝路",
            "清朝": "满族统治，最后的封建王朝",
            "民国": "共和制的建立",
            "建国初期": "新中国成立，社会主义建设",
            "文革时期": "文化大革命时期",
            "改革开放": "经济体制改革",
            "新世纪": "全面建设小康社会",
            "新时代": "中国特色社会主义新时代"
        };
        
        return descriptions[dynastyName] || "";
    }
}
