import { App, TFile } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { TagService } from './TagService';
import { DoubleLinkTagConfigManager, DoubleLinkTagConfig } from '../config/DoubleLinkTagConfig';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';

/**
 * 双链服务 - 处理八字相关的Obsidian双链功能
 */
export class LinkService {
    private app: App;
    private tagService: TagService;
    private configManager: DoubleLinkTagConfigManager;
    private settingsManager: DoubleLinkTagSettingsManager;

    constructor(app: App, settingsManager?: DoubleLinkTagSettingsManager) {
        this.app = app;
        this.tagService = new TagService(app);
        this.settingsManager = settingsManager || new DoubleLinkTagSettingsManager(app as any);
        // 使用设置管理器的全局配置初始化配置管理器
        this.configManager = new DoubleLinkTagConfigManager(this.settingsManager.getGlobalSettings().globalConfig);
    }

    /**
     * 智能生成双链和标签（基于有效配置）
     */
    generateSmartLinksAndTags(baziInfo: BaziInfo, baziId?: string): SmartLinksAndTags {
        const result: SmartLinksAndTags = {
            doubleLinks: [],
            tags: [],
            suggestions: {
                doubleLinks: [],
                tags: []
            }
        };

        // 获取有效配置（考虑优先级）
        const effectiveConfig = this.settingsManager.getEffectiveConfig(baziId);

        // 更新配置管理器使用有效配置
        this.configManager = new DoubleLinkTagConfigManager(effectiveConfig);

        // 收集所有相关内容
        const allContent = this.collectBaziContent(baziInfo);

        // 为每个内容项判断使用双链还是标签
        allContent.forEach(content => {
            if (this.configManager.shouldUseDoubleLink(content)) {
                const suggestions = this.configManager.getDoubleLinkSuggestions(content);
                result.doubleLinks.push(...suggestions);
                result.suggestions.doubleLinks.push(...suggestions);
            }

            if (this.configManager.shouldUseTag(content)) {
                const suggestions = this.configManager.getTagSuggestions(content);
                result.tags.push(...suggestions);
                result.suggestions.tags.push(...suggestions);
            }
        });

        // 去重
        result.doubleLinks = [...new Set(result.doubleLinks)];
        result.tags = [...new Set(result.tags)];
        result.suggestions.doubleLinks = [...new Set(result.suggestions.doubleLinks)];
        result.suggestions.tags = [...new Set(result.suggestions.tags)];

        return result;
    }

    /**
     * 设置设置管理器
     */
    setSettingsManager(settingsManager: DoubleLinkTagSettingsManager): void {
        this.settingsManager = settingsManager;
    }

    /**
     * 收集八字相关的所有内容
     */
    private collectBaziContent(baziInfo: BaziInfo): string[] {
        const content: string[] = [];

        // 人名（双链）
        if (baziInfo.name) {
            content.push(baziInfo.name);
        }

        // 神煞（双链）
        if (baziInfo.shenSha) {
            Object.values(baziInfo.shenSha).flat().forEach((shenSha: any) => {
                if (shenSha && shenSha.name) {
                    content.push(shenSha.name);
                }
            });
        }

        // 日主强弱（标签）
        if (baziInfo.dayStem && baziInfo.riZhuStrength) {
            content.push(`${baziInfo.dayStem}${this.getStemWuXing(baziInfo.dayStem)}日主${baziInfo.riZhuStrength}`);
        }

        // 格局（标签）
        if (baziInfo.geJu) {
            content.push(baziInfo.geJu);
        }

        // 生肖和年代（标签）
        if (baziInfo.yearShengXiao) {
            content.push(baziInfo.yearShengXiao);
        }

        // 年代特征（标签）
        if (baziInfo.solarDate) {
            const year = parseInt(baziInfo.solarDate.split('-')[0]);
            if (year >= 1950 && year <= 1960) content.push('50后');
            else if (year >= 1960 && year <= 1970) content.push('60后');
            else if (year >= 1970 && year <= 1980) content.push('70后');
            else if (year >= 1980 && year <= 1990) content.push('80后');
            else if (year >= 1990 && year <= 2000) content.push('90后');
            else if (year >= 2000 && year <= 2010) content.push('00后');
            else if (year >= 2010 && year <= 2020) content.push('10后');
        }

        return content;
    }

    /**
     * 获取天干对应的五行
     */
    private getStemWuXing(stem: string): string {
        const map: { [key: string]: string } = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        };
        return map[stem] || '';
    }

    /**
     * 为八字信息生成相关链接（保持向后兼容）
     */
    generateBaziLinks(baziInfo: BaziInfo): BaziLinks {
        return {
            // 人物相关链接
            person: this.generatePersonLink(baziInfo),

            // 年份相关链接
            yearLinks: this.generateYearLinks(baziInfo),

            // 神煞相关链接
            shenShaLinks: this.generateShenShaLinks(baziInfo),

            // 格局相关链接
            geJuLinks: this.generateGeJuLinks(baziInfo),

            // 五行相关链接
            wuXingLinks: this.generateWuXingLinks(baziInfo),

            // 大运流年链接
            dayunLinks: this.generateDayunLinks(baziInfo)
        };
    }

    /**
     * 生成人物相关链接
     */
    private generatePersonLink(baziInfo: BaziInfo): PersonLinks {
        const name = baziInfo.name || '未命名';
        const birthYear = baziInfo.solarDate?.split('-')[0] || '未知年份';

        return {
            profile: `[[${name}]]`,
            birthYear: `[[${birthYear}年生人]]`,
            gender: `[[${baziInfo.gender || '未知'}性八字]]`,
            zodiac: `[[${baziInfo.yearShengXiao || '未知'}年生人]]`
        };
    }

    /**
     * 生成神煞相关链接
     */
    private generateShenShaLinks(baziInfo: BaziInfo): ShenShaLinks[] {
        const links: ShenShaLinks[] = [];

        // 遍历所有神煞
        if (baziInfo.shenSha) {
            Object.entries(baziInfo.shenSha).forEach(([category, shenShaList]) => {
                if (Array.isArray(shenShaList)) {
                    shenShaList.forEach(shenSha => {
                        links.push({
                            name: shenSha.name,
                            link: `[[${shenSha.name}详解]]`,
                            category: category,
                            position: shenSha.position
                        });
                    });
                }
            });
        }

        return links;
    }

    /**
     * 生成格局相关链接
     */
    private generateGeJuLinks(baziInfo: BaziInfo): GeJuLinks {
        return {
            mainGeJu: `[[${baziInfo.geJu || '未知格局'}]]`,
            yongShen: `[[${baziInfo.yongShen || '未确定用神'}]]`,
            analysis: `[[${baziInfo.geJu}-格局分析]]`
        };
    }

    /**
     * 生成五行相关链接
     */
    private generateWuXingLinks(baziInfo: BaziInfo): WuXingLinks {
        return {
            dayMaster: `[[${baziInfo.dayStem || '未知'}日主]]`,
            wuXingAnalysis: `[[五行分析-${baziInfo.dayStem || '未知'}]]`,
            strength: `[[日主旺衰-${baziInfo.riZhuStrength || '未知'}]]`
        };
    }

    /**
     * 生成年份相关链接
     */
    private generateYearLinks(baziInfo: BaziInfo): YearLinks {
        const year = baziInfo.solarDate?.split('-')[0] || '未知年份';
        return {
            solarYear: `[[${year}年]]`,
            lunarYear: `[[${baziInfo.yearPillar || '未知'}年]]`,
            zodiac: `[[${baziInfo.yearShengXiao || '未知'}年运势]]`
        };
    }

    /**
     * 生成大运流年链接
     */
    private generateDayunLinks(baziInfo: BaziInfo): DayunLinks[] {
        const links: DayunLinks[] = [];

        if (baziInfo.daYun && Array.isArray(baziInfo.daYun)) {
            baziInfo.daYun.forEach((dayun, index) => {
                links.push({
                    period: `[[${dayun.startAge}-${dayun.endAge || dayun.startAge + 10}岁大运]]`,
                    ganZhi: `[[${dayun.ganZhi}大运]]`,
                    analysis: `[[${dayun.ganZhi}大运分析]]`
                });
            });
        }

        return links;
    }

    /**
     * 创建或更新相关笔记
     */
    async createRelatedNotes(baziInfo: BaziInfo): Promise<void> {
        const links = this.generateBaziLinks(baziInfo);
        const tags = this.tagService.generateBaziTags(baziInfo);

        // 创建人物档案
        await this.createPersonProfile(baziInfo, links.person, tags);

        // 创建神煞说明页面
        await this.createShenShaPages(links.shenShaLinks);

        // 创建标签索引页面
        await this.createTagIndexPages(tags);
    }

    /**
     * 创建人物档案页面
     */
    private async createPersonProfile(baziInfo: BaziInfo, personLinks: PersonLinks, tags: any): Promise<void> {
        const name = baziInfo.name || '未命名';
        const fileName = `${name}.md`;

        // 合并所有标签
        const allTags = [
            ...tags.basic,
            ...tags.wuxing,
            ...tags.shensha.slice(0, 5), // 限制神煞标签数量
            ...tags.geju,
            ...tags.time.slice(0, 3), // 限制时间标签数量
            ...tags.traits
        ].filter((tag, index, arr) => arr.indexOf(tag) === index); // 去重

        const content = `# ${name}

## 基本信息
- 出生日期：${baziInfo.solarDate || '未知'}
- 农历：${baziInfo.lunarDate || '未知'}
- 性别：${baziInfo.gender === '1' ? '男' : baziInfo.gender === '0' ? '女' : '未知'}
- 生肖：${baziInfo.yearShengXiao || '未知'}

## 八字信息
\`\`\`bazi
date: ${baziInfo.solarDate}
gender: ${baziInfo.gender}
name: ${name}
\`\`\`

## 五行分析
- 日主：${baziInfo.dayStem || '未知'}
- 格局：${baziInfo.geJu || '未确定'}
- 用神：${baziInfo.yongShen || '未确定'}

## 神煞特征
${this.formatShenShaList(baziInfo.shenSha)}

## 相关链接
- ${personLinks.birthYear}
- ${personLinks.zodiac}
- [[${name}-八字分析]]
- [[${name}-运势预测]]
- [[${name}-大运流年]]

## 智能标签
${allTags.join(' ')}

---
*此档案由八字命盘插件自动生成*
`;

        await this.createNoteIfNotExists(fileName, content);
    }

    /**
     * 格式化神煞列表
     */
    private formatShenShaList(shenSha: any): string {
        if (!shenSha) return '暂无神煞信息';

        const shenShaList: string[] = [];
        Object.values(shenSha).flat().forEach((item: any) => {
            if (item && item.name) {
                shenShaList.push(`- [[${item.name}详解|${item.name}]] (${item.position || '未知位置'})`);
            }
        });

        return shenShaList.length > 0 ? shenShaList.join('\n') : '暂无神煞信息';
    }

    /**
     * 创建标签索引页面
     */
    private async createTagIndexPages(tags: any): Promise<void> {
        // 创建五行标签索引
        await this.createWuXingTagIndex(tags.wuxing);

        // 创建神煞标签索引
        await this.createShenShaTagIndex(tags.shensha);

        // 创建年代标签索引
        await this.createTimeTagIndex(tags.time);
    }

    /**
     * 创建五行标签索引
     */
    private async createWuXingTagIndex(wuxingTags: string[]): Promise<void> {
        const fileName = '五行标签索引.md';
        const content = `# 五行标签索引

## 五行分类
通过标签快速查找相同五行特征的人物：

### 金
- 查看所有金日主：#金日主
- 查看金旺的人：#金旺

### 木
- 查看所有木日主：#木日主
- 查看木旺的人：#木旺

### 水
- 查看所有水日主：#水日主
- 查看水旺的人：#水旺

### 火
- 查看所有火日主：#火日主
- 查看火旺的人：#火旺

### 土
- 查看所有土日主：#土日主
- 查看土旺的人：#土旺

## 日主旺衰
- #日主偏旺
- #日主偏弱
- #日主太旺
- #日主太弱

#五行 #标签索引
`;

        await this.createNoteIfNotExists(fileName, content);
    }

    /**
     * 创建神煞标签索引
     */
    private async createShenShaTagIndex(shenshaTags: string[]): Promise<void> {
        const fileName = '神煞标签索引.md';
        const content = `# 神煞标签索引

## 吉神类
- #天乙贵人 - 贵人扶持
- #文昌 - 文学才华
- #文曲 - 聪明智慧
- #禄神 - 财禄丰厚

## 桃花类
- #桃花 - 异性缘佳
- #红艳 - 魅力出众
- #咸池 - 感情丰富

## 孤独类
- #华盖 - 孤高清雅
- #孤辰 - 性格孤独
- #寡宿 - 独立自主

## 动星类
- #驿马 - 奔波变动
- #将星 - 领导才能

## 凶煞类
- #羊刃 - 性格刚烈
- #天空 - 空虚不实
- #地劫 - 破财损失

#神煞 #标签索引
`;

        await this.createNoteIfNotExists(fileName, content);
    }

    /**
     * 创建时间标签索引
     */
    private async createTimeTagIndex(timeTags: string[]): Promise<void> {
        const fileName = '年代标签索引.md';
        const content = `# 年代标签索引

## 世代分类
- #60后 - 1960-1970年生人
- #70后 - 1970-1980年生人
- #80后 - 1980-1990年生人
- #90后 - 1990-2000年生人
- #00后 - 2000-2010年生人
- #10后 - 2010-2020年生人

## 生肖分类
- #鼠年 #牛年 #虎年 #兔年
- #龙年 #蛇年 #马年 #羊年
- #猴年 #鸡年 #狗年 #猪年

## 季节分类
- #春季 - 3-5月生人
- #夏季 - 6-8月生人
- #秋季 - 9-11月生人
- #冬季 - 12-2月生人

#时间 #标签索引
`;

        await this.createNoteIfNotExists(fileName, content);
    }

    /**
     * 创建神煞说明页面
     */
    private async createShenShaPages(shenShaLinks: ShenShaLinks[]): Promise<void> {
        const processedShenSha = new Set<string>();

        for (const shenSha of shenShaLinks) {
            if (!processedShenSha.has(shenSha.name)) {
                await this.createShenShaDetailPage(shenSha.name);
                processedShenSha.add(shenSha.name);
            }
        }
    }

    /**
     * 创建神煞详解页面
     */
    private async createShenShaDetailPage(shenShaName: string): Promise<void> {
        const fileName = `${shenShaName}详解.md`;

        const content = `# ${shenShaName}详解

## 基本信息
- 神煞类型：
- 计算依据：
- 吉凶性质：

## 计算方法
<!-- 详细的计算规则 -->

## 作用影响
<!-- 对命运的具体影响 -->

## 相关案例
<!-- 实际案例分析 -->

## 相关链接
- [[神煞总览]]
- [[${shenShaName}案例集]]

## 标签
#神煞 #${shenShaName}
`;

        await this.createNoteIfNotExists(fileName, content);
    }

    /**
     * 创建笔记（如果不存在）
     */
    private async createNoteIfNotExists(fileName: string, content: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(fileName);

        if (!file) {
            await this.app.vault.create(fileName, content);
        }
    }

    /**
     * 在现有笔记中添加反向链接
     */
    async addBacklinks(baziInfo: BaziInfo): Promise<void> {
        const name = baziInfo.name || '未命名';

        // 在相关年份页面添加此人链接
        await this.addToYearPage(baziInfo, name);

        // 在神煞页面添加此人案例
        await this.addToShenShaPages(baziInfo, name);
    }

    /**
     * 在年份页面添加人物链接
     */
    private async addToYearPage(baziInfo: BaziInfo, name: string): Promise<void> {
        const year = baziInfo.solarDate?.split('-')[0] || '未知年份';
        const yearFileName = `${year}年生人.md`;

        let content = `# ${year}年生人

## 本年生人列表
- [[${name}]]

## 年份特征
- 天干：${baziInfo.yearStem}
- 地支：${baziInfo.yearBranch}
- 生肖：${baziInfo.yearShengXiao}
- 纳音：${baziInfo.yearNaYin}

#年份 #${year}年 #${baziInfo.yearShengXiao}
`;

        const file = this.app.vault.getAbstractFileByPath(yearFileName);
        if (file && file instanceof TFile) {
            const existingContent = await this.app.vault.read(file);
            if (!existingContent.includes(`[[${name}]]`)) {
                const updatedContent = existingContent.replace(
                    '## 本年生人列表',
                    `## 本年生人列表\n- [[${name}]]`
                );
                await this.app.vault.modify(file, updatedContent);
            }
        } else {
            await this.app.vault.create(yearFileName, content);
        }
    }

    /**
     * 在神煞页面添加人物案例
     */
    private async addToShenShaPages(baziInfo: BaziInfo, name: string): Promise<void> {
        if (baziInfo.shenSha) {
            Object.values(baziInfo.shenSha).flat().forEach(async (shenSha: any) => {
                const fileName = `${shenSha.name}案例集.md`;
                await this.addPersonToShenShaCase(fileName, name, shenSha.name);
            });
        }
    }

    /**
     * 添加人物到神煞案例
     */
    private async addPersonToShenShaCase(fileName: string, name: string, shenShaName: string): Promise<void> {
        let content = `# ${shenShaName}案例集

## 案例列表
- [[${name}]]

## 分析总结
<!-- 基于案例的分析总结 -->

#神煞案例 #${shenShaName}
`;

        const file = this.app.vault.getAbstractFileByPath(fileName);
        if (file && file instanceof TFile) {
            const existingContent = await this.app.vault.read(file);
            if (!existingContent.includes(`[[${name}]]`)) {
                const updatedContent = existingContent.replace(
                    '## 案例列表',
                    `## 案例列表\n- [[${name}]]`
                );
                await this.app.vault.modify(file, updatedContent);
            }
        } else {
            await this.app.vault.create(fileName, content);
        }
    }
}

// 类型定义
interface BaziLinks {
    person: PersonLinks;
    yearLinks: YearLinks;
    shenShaLinks: ShenShaLinks[];
    geJuLinks: GeJuLinks;
    wuXingLinks: WuXingLinks;
    dayunLinks: DayunLinks[];
}

interface PersonLinks {
    profile: string;
    birthYear: string;
    gender: string;
    zodiac: string;
}

interface ShenShaLinks {
    name: string;
    link: string;
    category: string;
    position: string;
}

interface GeJuLinks {
    mainGeJu: string;
    yongShen: string;
    analysis: string;
}

interface WuXingLinks {
    dayMaster: string;
    wuXingAnalysis: string;
    strength: string;
}

interface YearLinks {
    solarYear: string;
    lunarYear: string;
    zodiac: string;
}

interface DayunLinks {
    period: string;
    ganZhi: string;
    analysis: string;
}

// 新的智能链接和标签类型
interface SmartLinksAndTags {
    doubleLinks: string[];
    tags: string[];
    suggestions: {
        doubleLinks: string[];
        tags: string[];
    };
}
