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
        // 神煞相关双链
        shenSha: {
            enabled: boolean;
            fields: string[];
        };
        // 格局类型双链
        pattern: {
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
        // 时代特征标签（包含朝代自动识别）
        era: {
            enabled: boolean;
            fields: string[];
        };
        // 关系标签（多级标签系统）
        relations: {
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
        shenSha: {
            enabled: true,
            fields: [
                // 吉神
                "天乙贵人", "文昌", "文曲", "华盖", "天德", "月德",
                "天医", "国印", "学堂", "词馆", "金舆", "禄神",
                "天厨", "福星", "天赦", "解神", "天喜", "红鸾",

                // 凶神
                "羊刃", "飞刃", "天空", "地劫", "劫煞", "灾煞",
                "孤辰", "寡宿", "亡神", "咸池", "桃花", "驿马",
                "将星", "华盖", "空亡", "十恶大败", "魁罡",

                // 特殊神煞
                "金神", "阴差阳错", "童子", "元辰", "勾绞",
                "血刃", "流霞", "白虎", "丧门", "吊客"
            ]
        },
        pattern: {
            enabled: true,
            fields: [
                // 正格
                "正财格", "偏财格", "正官格", "偏官格", "七杀格",
                "正印格", "偏印格", "枭神格", "食神格", "伤官格",
                "建禄格", "羊刃格", "月刃格",

                // 变格
                "从财格", "从官格", "从杀格", "从儿格", "从强格",
                "化气格", "壬骑龙背", "丙火坐寅", "金白水清",
                "木火通明", "稼穑格", "润下格", "炎上格",
                "曲直格", "从革格",

                // 特殊格局
                "井栏叉格", "玉堂金马", "金神格", "魁罡格",
                "日德格", "飞天禄马", "倒冲格", "六阴朝阳"
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
                // 政治类
                "政治家", "官员", "外交官", "军人", "将军", "元帅",

                // 商业类
                "企业家", "商人", "金融家", "投资家", "银行家", "实业家",

                // 文化类
                "学者", "教授", "研究员", "科学家", "发明家", "思想家",
                "作家", "诗人", "文学家", "史学家", "哲学家",

                // 艺术类
                "艺术家", "画家", "书法家", "音乐家", "演员", "明星",
                "导演", "编剧", "设计师", "建筑师",

                // 专业类
                "医生", "律师", "工程师", "教师", "记者", "编辑",
                "翻译", "会计师", "咨询师",

                // 体育类
                "运动员", "教练", "体育明星",

                // 宗教类
                "僧人", "道士", "宗教家", "传教士",

                // 其他
                "农民", "工人", "手工艺人", "厨师", "服务员"
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
        era: {
            enabled: true,
            fields: [
                // 年代标签（基于出生年份）
                "40后", "50后", "60后", "70后", "80后", "90后", "00后", "10后", "20后",

                // 古代朝代（自动识别）
                "夏朝", "商朝", "西周", "东周", "春秋", "战国", "秦朝", "西汉", "东汉",
                "三国", "西晋", "东晋", "南北朝", "隋朝", "唐朝", "五代十国", "北宋", "南宋",
                "辽朝", "金朝", "元朝", "明朝", "清朝",

                // 近现代时期
                "民国", "建国初期", "文革时期", "改革开放", "新世纪", "新时代",

                // 生肖年份（12年一轮回）
                "鼠年生", "牛年生", "虎年生", "兔年生", "龙年生", "蛇年生",
                "马年生", "羊年生", "猴年生", "鸡年生", "狗年生", "猪年生",

                // 季节特征
                "春季生人", "夏季生人", "秋季生人", "冬季生人",

                // 甲子纪年（60年一轮回）
                "甲子年", "乙丑年", "丙寅年", "丁卯年", "戊辰年", "己巳年",
                "庚午年", "辛未年", "壬申年", "癸酉年", "甲戌年", "乙亥年",
                "丙子年", "丁丑年", "戊寅年", "己卯年", "庚辰年", "辛巳年",
                "壬午年", "癸未年", "甲申年", "乙酉年", "丙戌年", "丁亥年",
                "戊子年", "己丑年", "庚寅年", "辛卯年", "壬辰年", "癸巳年",
                "甲午年", "乙未年", "丙申年", "丁酉年", "戊戌年", "己亥年",
                "庚子年", "辛丑年", "壬寅年", "癸卯年", "甲辰年", "乙巳年",
                "丙午年", "丁未年", "戊申年", "己酉年", "庚戌年", "辛亥年",
                "壬子年", "癸丑年", "甲寅年", "乙卯年", "丙辰年", "丁巳年",
                "戊午年", "己未年", "庚申年", "辛酉年", "壬戌年", "癸亥年"
            ]
        },
        relations: {
            enabled: true,
            fields: [
                // 亲人关系（多级标签）
                "亲人/家属/父亲", "亲人/家属/母亲", "亲人/家属/儿子", "亲人/家属/女儿",
                "亲人/家属/丈夫", "亲人/家属/妻子", "亲人/家属/兄弟", "亲人/家属/姐妹",
                "亲人/家属/爷爷", "亲人/家属/奶奶", "亲人/家属/外公", "亲人/家属/外婆",
                "亲人/亲戚/舅舅", "亲人/亲戚/舅妈", "亲人/亲戚/姨妈", "亲人/亲戚/姨夫",
                "亲人/亲戚/叔叔", "亲人/亲戚/婶婶", "亲人/亲戚/伯伯", "亲人/亲戚/伯母",
                "亲人/亲戚/堂兄", "亲人/亲戚/堂弟", "亲人/亲戚/堂姐", "亲人/亲戚/堂妹",
                "亲人/亲戚/表兄", "亲人/亲戚/表弟", "亲人/亲戚/表姐", "亲人/亲戚/表妹",

                // 朋友关系（多级标签）
                "朋友/同学/小学同学", "朋友/同学/中学同学", "朋友/同学/高中同学", "朋友/同学/大学同学",
                "朋友/同事/前同事", "朋友/同事/现同事", "朋友/同事/上司", "朋友/同事/下属",
                "朋友/邻居/邻居", "朋友/邻居/老邻居", "朋友/邻居/新邻居",
                "朋友/网友/网友", "朋友/网友/游戏好友", "朋友/网友/论坛朋友",

                // 师生关系（多级标签）
                "师生/老师/小学老师", "师生/老师/中学老师", "师生/老师/高中老师", "师生/老师/大学老师",
                "师生/老师/导师", "师生/老师/师父", "师生/老师/教练",
                "师生/学生/学生", "师生/学生/弟子", "师生/学生/徒弟",

                // 商业关系（多级标签）
                "商业/客户/重要客户", "商业/客户/普通客户", "商业/客户/潜在客户",
                "商业/供应商/主要供应商", "商业/供应商/次要供应商",
                "商业/合作伙伴/战略伙伴", "商业/合作伙伴/业务伙伴", "商业/合作伙伴/投资人",

                // 社交关系（多级标签）
                "社交/圈子/商业圈", "社交/圈子/学术圈", "社交/圈子/艺术圈", "社交/圈子/体育圈",
                "社交/群体/兴趣小组", "社交/群体/俱乐部", "社交/群体/协会"
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
