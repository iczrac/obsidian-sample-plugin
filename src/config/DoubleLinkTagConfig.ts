/**
 * 双链和标签配置管理
 * 区分双链（专属名）和标签（定性类术语）的使用场景
 */

export interface DoubleLinkTagConfig {
    // 基础设置
    autoSuggest: boolean;
    smartDetection: boolean;
    showConfigButton: boolean;

    // 双链配置 - 适合有专属名的内容
    doubleLinks: {
        // 人物相关双链
        person: {
            enabled: boolean;
            fields: string[];
        };
        // 神煞相关双链
        shenSha: {
            enabled: boolean;
            fields: string[];
        };
        // 地名相关双链
        location: {
            enabled: boolean;
            fields: string[];
        };
        // 书籍典籍双链
        books: {
            enabled: boolean;
            fields: string[];
        };
        // 自定义双链
        custom: {
            enabled: boolean;
            fields: string[];
        };
    };

    // 标签配置 - 适合定性类术语
    tags: {
        // 职业类标签
        profession: {
            enabled: boolean;
            fields: string[];
        };
        // 性格特征标签
        personality: {
            enabled: boolean;
            fields: string[];
        };
        // 五行强弱标签
        wuxingStrength: {
            enabled: boolean;
            fields: string[];
        };
        // 格局类型标签
        pattern: {
            enabled: boolean;
            fields: string[];
        };
        // 时代特征标签
        era: {
            enabled: boolean;
            fields: string[];
        };
        // 自定义标签
        custom: {
            enabled: boolean;
            fields: string[];
        };
    };

    // 混合使用配置
    hybrid: {
        // 既可以用双链也可以用标签的内容
        flexibleFields: string[];
    };
}

/**
 * 默认配置
 */
export const DEFAULT_DOUBLELINK_TAG_CONFIG: DoubleLinkTagConfig = {
    // 基础设置
    autoSuggest: true,
    smartDetection: true,
    showConfigButton: true,

    doubleLinks: {
        person: {
            enabled: true,
            fields: [
                "人名", "姓名", "name",
                "历史人物", "现代名人", "政治人物",
                "企业家个人", "明星个人", "学者个人"
            ]
        },
        shenSha: {
            enabled: true,
            fields: [
                "天乙贵人", "文昌", "文曲", "华盖", "桃花",
                "禄神", "驿马", "将星", "羊刃", "天空",
                "地劫", "孤辰", "寡宿", "红鸾", "天喜",
                "天德", "月德", "天医", "国印", "学堂"
            ]
        },
        location: {
            enabled: true,
            fields: [
                // 地理概念
                "出生地", "籍贯", "居住地", "工作地", "祖籍", "故乡", "家乡",

                // 直辖市
                "北京", "上海", "天津", "重庆",

                // 省会城市
                "广州", "深圳", "杭州", "南京", "武汉", "成都", "西安", "郑州",
                "济南", "沈阳", "长春", "哈尔滨", "石家庄", "太原", "呼和浩特",
                "南昌", "长沙", "福州", "厦门", "南宁", "海口", "昆明", "贵阳",
                "拉萨", "兰州", "西宁", "银川", "乌鲁木齐",

                // 港澳台
                "香港", "澳门", "台北", "台湾",

                // 历史地名
                "京城", "金陵", "临安", "长安", "洛阳", "开封", "应天府",

                // 地区概念
                "江南", "江北", "华北", "华南", "东北", "西北", "西南", "华中",
                "中原", "关中", "江淮", "岭南", "塞北", "关外"
            ]
        },
        books: {
            enabled: true,
            fields: [
                // 经典四柱命理典籍
                "滴天髓", "子平真诠", "穷通宝鉴", "三命通会",
                "渊海子平", "神峰通考", "命理探源", "五行精纪",

                // 古代命理经典
                "珞琭子赋", "李虚中命书", "兰台妙选", "玉照定真经",
                "碧渊赋", "金声玉振赋", "继善篇", "爱憎赋",
                "一行禅师天元歌", "鬼谷子分定经", "李虚中命书",

                // 现代命理著作
                "八字真诠", "命理约言", "滴天髓征义", "子平粹言",
                "命理新论", "八字预测真踪", "四柱预测学", "八字命理学",

                // 相关典籍
                "易经", "周易", "黄帝内经", "奇门遁甲", "紫微斗数",
                "六壬大全", "太乙神数", "铁板神数", "邵子神数",

                // 历代名家著作
                "徐子平集", "万民英集", "张楠集", "沈孝瞻集",
                "任铁樵集", "袁树珊集", "韦千里集", "梁湘润集"
            ]
        },
        custom: {
            enabled: true,
            fields: []
        }
    },

    tags: {
        profession: {
            enabled: true,
            fields: [
                "政治家", "企业家", "明星", "学者", "艺术家",
                "军人", "医生", "教师", "工程师", "律师",
                "作家", "记者", "运动员", "商人"
            ]
        },
        personality: {
            enabled: true,
            fields: [
                "聪明", "智慧", "勇敢", "谨慎", "开朗",
                "内向", "外向", "稳重", "活泼", "严谨",
                "创新", "保守", "领导力", "执行力"
            ]
        },
        wuxingStrength: {
            enabled: true,
            fields: [
                "甲木日主旺", "甲木日主弱", "乙木日主旺", "乙木日主弱",
                "丙火日主旺", "丙火日主弱", "丁火日主旺", "丁火日主弱",
                "戊土日主旺", "戊土日主弱", "己土日主旺", "己土日主弱",
                "庚金日主旺", "庚金日主弱", "辛金日主旺", "辛金日主弱",
                "壬水日主旺", "壬水日主弱", "癸水日主旺", "癸水日主弱",
                "木旺", "木弱", "火旺", "火弱", "土旺", "土弱",
                "金旺", "金弱", "水旺", "水弱"
            ]
        },
        pattern: {
            enabled: true,
            fields: [
                "正财格", "偏财格", "正官格", "偏官格",
                "正印格", "偏印格", "食神格", "伤官格",
                "建禄格", "羊刃格", "从财格", "从官格",
                "从儿格", "化气格", "特殊格局"
            ]
        },
        era: {
            enabled: true,
            fields: [
                "50后", "60后", "70后", "80后", "90后", "00后", "10后",
                "民国时期", "建国初期", "改革开放", "新时代",
                "春季生人", "夏季生人", "秋季生人", "冬季生人"
            ]
        },
        custom: {
            enabled: true,
            fields: []
        }
    },

    hybrid: {
        flexibleFields: [
            "年份", "生肖", "地支", "天干",
            "大运", "流年", "节气"
        ]
    }
};

/**
 * 配置管理器
 */
export class DoubleLinkTagConfigManager {
    private config: DoubleLinkTagConfig;

    constructor(config?: Partial<DoubleLinkTagConfig>) {
        this.config = this.mergeConfig(DEFAULT_DOUBLELINK_TAG_CONFIG, config || {});
    }

    /**
     * 判断是否应该使用双链
     */
    shouldUseDoubleLink(content: string): boolean {
        const allDoubleLinkFields = this.getAllDoubleLinkFields();
        return allDoubleLinkFields.some(field =>
            content.includes(field) || this.isExactMatch(content, field)
        );
    }

    /**
     * 判断是否应该使用标签
     */
    shouldUseTag(content: string): boolean {
        const allTagFields = this.getAllTagFields();
        return allTagFields.some(field =>
            content.includes(field) || this.isExactMatch(content, field)
        );
    }

    /**
     * 获取内容的双链建议
     */
    getDoubleLinkSuggestions(content: string): string[] {
        const suggestions: string[] = [];

        Object.entries(this.config.doubleLinks).forEach(([category, config]) => {
            if (config.enabled) {
                config.fields.forEach(field => {
                    if (content.includes(field) || this.isExactMatch(content, field)) {
                        suggestions.push(`[[${field}]]`);
                    }
                });
            }
        });

        return [...new Set(suggestions)]; // 去重
    }

    /**
     * 获取内容的标签建议
     */
    getTagSuggestions(content: string): string[] {
        const suggestions: string[] = [];

        Object.entries(this.config.tags).forEach(([category, config]) => {
            if (config.enabled) {
                config.fields.forEach(field => {
                    if (content.includes(field) || this.isExactMatch(content, field)) {
                        suggestions.push(`#${field}`);
                    }
                });
            }
        });

        return [...new Set(suggestions)]; // 去重
    }

    /**
     * 获取所有双链字段
     */
    private getAllDoubleLinkFields(): string[] {
        const fields: string[] = [];
        Object.values(this.config.doubleLinks).forEach(config => {
            if (config.enabled) {
                fields.push(...config.fields);
            }
        });
        return fields;
    }

    /**
     * 获取所有标签字段
     */
    private getAllTagFields(): string[] {
        const fields: string[] = [];
        Object.values(this.config.tags).forEach(config => {
            if (config.enabled) {
                fields.push(...config.fields);
            }
        });
        return fields;
    }

    /**
     * 精确匹配检查
     */
    private isExactMatch(content: string, field: string): boolean {
        // 检查是否为精确匹配（考虑中文分词特点）
        const regex = new RegExp(`\\b${field}\\b|${field}`, 'i');
        return regex.test(content);
    }

    /**
     * 合并配置
     */
    private mergeConfig(defaultConfig: DoubleLinkTagConfig, userConfig: Partial<DoubleLinkTagConfig>): DoubleLinkTagConfig {
        // 深度合并配置对象
        return {
            autoSuggest: userConfig.autoSuggest ?? defaultConfig.autoSuggest,
            smartDetection: userConfig.smartDetection ?? defaultConfig.smartDetection,
            showConfigButton: userConfig.showConfigButton ?? defaultConfig.showConfigButton,
            doubleLinks: { ...defaultConfig.doubleLinks, ...userConfig.doubleLinks },
            tags: { ...defaultConfig.tags, ...userConfig.tags },
            hybrid: { ...defaultConfig.hybrid, ...userConfig.hybrid }
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<DoubleLinkTagConfig>): void {
        this.config = this.mergeConfig(this.config, newConfig);
    }

    /**
     * 获取当前配置
     */
    getConfig(): DoubleLinkTagConfig {
        return { ...this.config };
    }

    /**
     * 添加自定义双链字段
     */
    addCustomDoubleLink(field: string): void {
        if (!this.config.doubleLinks.custom.fields.includes(field)) {
            this.config.doubleLinks.custom.fields.push(field);
        }
    }

    /**
     * 添加自定义标签字段
     */
    addCustomTag(field: string): void {
        if (!this.config.tags.custom.fields.includes(field)) {
            this.config.tags.custom.fields.push(field);
        }
    }

    /**
     * 移除自定义字段
     */
    removeCustomField(field: string, type: 'doubleLink' | 'tag'): void {
        if (type === 'doubleLink') {
            const index = this.config.doubleLinks.custom.fields.indexOf(field);
            if (index > -1) {
                this.config.doubleLinks.custom.fields.splice(index, 1);
            }
        } else {
            const index = this.config.tags.custom.fields.indexOf(field);
            if (index > -1) {
                this.config.tags.custom.fields.splice(index, 1);
            }
        }
    }
}
