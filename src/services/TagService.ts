import { App, TFile } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { DynastyService } from './DynastyService';

/**
 * 标签服务 - 处理八字相关的Obsidian标签功能
 * 结合双链功能创造更强大的知识管理体验
 */
export class TagService {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * 为八字信息生成智能标签
     */
    generateBaziTags(baziInfo: BaziInfo): BaziTags {
        return {
            // 基础标签
            basic: this.generateBasicTags(baziInfo),

            // 五行标签
            wuxing: this.generateWuXingTags(baziInfo),

            // 神煞标签
            shensha: this.generateShenShaTags(baziInfo),

            // 格局标签
            geju: this.generateGeJuTags(baziInfo),

            // 时间标签
            time: this.generateTimeTags(baziInfo),

            // 特征标签
            traits: this.generateTraitTags(baziInfo),

            // 关系标签
            relations: this.generateRelationTags(baziInfo)
        };
    }

    /**
     * 生成基础标签
     */
    private generateBasicTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        // 人物档案标签
        tags.push('#人物档案');
        tags.push('#八字');

        // 性别标签
        if (baziInfo.gender === '1') {
            tags.push('#男性');
        } else if (baziInfo.gender === '0') {
            tags.push('#女性');
        }

        // 生肖标签
        if (baziInfo.yearShengXiao) {
            tags.push(`#${baziInfo.yearShengXiao}年`);
            tags.push(`#生肖${baziInfo.yearShengXiao}`);
        }

        // 年代标签和朝代标签
        if (baziInfo.solarDate) {
            const year = parseInt(baziInfo.solarDate.split('-')[0]);
            const decade = Math.floor(year / 10) * 10;
            tags.push(`#${decade}年代`);

            // 使用朝代识别服务生成时代特征标签
            const eraTags = DynastyService.generateEraTagsByYear(year);
            eraTags.forEach(tag => tags.push(`#${tag}`));
        }

        return tags;
    }

    /**
     * 生成五行标签
     */
    private generateWuXingTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        // 日主五行
        if (baziInfo.dayStem) {
            const dayWuXing = this.getStemWuXing(baziInfo.dayStem);
            tags.push(`#${dayWuXing}日主`);
            tags.push(`#五行${dayWuXing}`);
        }

        // 五行强度分析
        if (baziInfo.wuXingStrength) {
            const strongest = this.getStrongestWuXing(baziInfo.wuXingStrength);
            const weakest = this.getWeakestWuXing(baziInfo.wuXingStrength);

            if (strongest) tags.push(`#${strongest}旺`);
            if (weakest) tags.push(`#${weakest}弱`);
        }

        // 日主旺衰
        if (baziInfo.riZhuStrength) {
            tags.push(`#日主${baziInfo.riZhuStrength}`);
        }

        return tags;
    }

    /**
     * 生成神煞标签
     */
    private generateShenShaTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        if (baziInfo.shenSha) {
            // 遍历所有神煞
            Object.values(baziInfo.shenSha).flat().forEach((shenSha: any) => {
                if (shenSha && shenSha.name) {
                    tags.push(`#${shenSha.name}`);

                    // 神煞分类标签
                    const category = this.getShenShaCategory(shenSha.name);
                    if (category) {
                        tags.push(`#${category}`);
                    }
                }
            });
        }

        return tags;
    }

    /**
     * 生成格局标签
     */
    private generateGeJuTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        if (baziInfo.geJu) {
            tags.push(`#${baziInfo.geJu}`);
            tags.push('#格局');

            // 格局强度
            if (baziInfo.geJuStrength) {
                tags.push(`#格局${baziInfo.geJuStrength}`);
            }
        }

        if (baziInfo.yongShen) {
            tags.push(`#用神${baziInfo.yongShen}`);
        }

        return tags;
    }

    /**
     * 生成时间标签
     */
    private generateTimeTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        // 年份标签
        if (baziInfo.solarDate) {
            const year = baziInfo.solarDate.split('-')[0];
            tags.push(`#${year}年`);
        }

        // 干支标签
        if (baziInfo.yearPillar) {
            tags.push(`#${baziInfo.yearPillar}年`);
        }

        // 季节标签
        if (baziInfo.solarDate) {
            const month = parseInt(baziInfo.solarDate.split('-')[1]);
            if (month >= 3 && month <= 5) tags.push('#春季');
            else if (month >= 6 && month <= 8) tags.push('#夏季');
            else if (month >= 9 && month <= 11) tags.push('#秋季');
            else tags.push('#冬季');
        }

        return tags;
    }

    /**
     * 生成特征标签
     */
    private generateTraitTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        // 基于神煞推断性格特征
        if (baziInfo.shenSha) {
            const shenShaNames = Object.values(baziInfo.shenSha).flat().map((s: any) => s.name);

            if (shenShaNames.includes('天乙贵人')) tags.push('#贵人运');
            if (shenShaNames.includes('文昌')) tags.push('#文昌');
            if (shenShaNames.includes('桃花')) tags.push('#桃花运');
            if (shenShaNames.includes('华盖')) tags.push('#华盖');
            if (shenShaNames.includes('驿马')) tags.push('#驿马');
            if (shenShaNames.includes('将星')) tags.push('#将星');
        }

        return tags;
    }

    /**
     * 生成关系标签
     * 注意：关系标签通常需要手动指定，这里提供基础框架
     */
    private generateRelationTags(baziInfo: BaziInfo): string[] {
        const tags: string[] = [];

        // 关系标签通常需要在具体使用时手动添加
        // 这里可以根据八字信息推断一些基础关系特征
        if (baziInfo.name) {
            // 可以根据八字特征推断一些关系倾向
            // 例如：根据神煞推断人际关系特点
            if (baziInfo.shenSha) {
                const shenShaNames = Object.values(baziInfo.shenSha).flat().map((s: any) => s.name);

                // 根据神煞推断关系特征
                if (shenShaNames.includes('天乙贵人')) {
                    tags.push('#贵人缘佳');
                }
                if (shenShaNames.includes('桃花')) {
                    tags.push('#人缘好');
                }
                if (shenShaNames.includes('孤辰') || shenShaNames.includes('寡宿')) {
                    tags.push('#性格独立');
                }
            }
        }

        return tags;
    }

    /**
     * 为八字添加自定义关系标签
     * @param baziInfo 八字信息
     * @param relationTag 关系标签，如 "亲人/家属/父亲"
     * @returns 更新后的标签数组
     */
    addCustomRelationTag(baziInfo: BaziInfo, relationTag: string): string[] {
        const currentTags = this.generateBaziTags(baziInfo);
        const relationTags = currentTags.relations || [];

        // 添加关系标签（使用#前缀）
        if (!relationTags.includes(`#${relationTag}`)) {
            relationTags.push(`#${relationTag}`);
        }

        return relationTags;
    }

    /**
     * 获取所有可用的关系标签模板
     * @returns 关系标签模板数组
     */
    getRelationTagTemplates(): string[] {
        return [
            // 亲人关系
            "亲人/家属/父亲", "亲人/家属/母亲", "亲人/家属/儿子", "亲人/家属/女儿",
            "亲人/家属/丈夫", "亲人/家属/妻子", "亲人/家属/兄弟", "亲人/家属/姐妹",
            "亲人/家属/爷爷", "亲人/家属/奶奶", "亲人/家属/外公", "亲人/家属/外婆",
            "亲人/亲戚/舅舅", "亲人/亲戚/舅妈", "亲人/亲戚/姨妈", "亲人/亲戚/姨夫",

            // 朋友关系
            "朋友/同学/小学同学", "朋友/同学/中学同学", "朋友/同学/高中同学", "朋友/同学/大学同学",
            "朋友/同事/前同事", "朋友/同事/现同事", "朋友/同事/上司", "朋友/同事/下属",

            // 师生关系
            "师生/老师/导师", "师生/老师/师父", "师生/学生/弟子", "师生/学生/徒弟",

            // 商业关系
            "商业/客户/重要客户", "商业/合作伙伴/战略伙伴", "商业/供应商/主要供应商"
        ];
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
     * 获取最强的五行
     */
    private getStrongestWuXing(wuXingStrength: any): string {
        if (!wuXingStrength) return '';

        let maxStrength = 0;
        let strongest = '';

        Object.entries(wuXingStrength).forEach(([wuxing, strength]) => {
            if (typeof strength === 'number' && strength > maxStrength) {
                maxStrength = strength;
                strongest = wuxing;
            }
        });

        return strongest;
    }

    /**
     * 获取最弱的五行
     */
    private getWeakestWuXing(wuXingStrength: any): string {
        if (!wuXingStrength) return '';

        let minStrength = Infinity;
        let weakest = '';

        Object.entries(wuXingStrength).forEach(([wuxing, strength]) => {
            if (typeof strength === 'number' && strength < minStrength) {
                minStrength = strength;
                weakest = wuxing;
            }
        });

        return weakest;
    }

    /**
     * 获取神煞分类
     */
    private getShenShaCategory(shenShaName: string): string {
        const categories: { [key: string]: string } = {
            '天乙贵人': '贵人星',
            '文昌': '文星',
            '文曲': '文星',
            '华盖': '孤独星',
            '桃花': '桃花星',
            '禄神': '禄星',
            '驿马': '动星',
            '将星': '权威星',
            '羊刃': '刃星',
            '天空': '空亡星',
            '地劫': '劫煞星'
        };

        return categories[shenShaName] || '神煞';
    }

    /**
     * 在笔记中添加标签
     */
    async addTagsToNote(fileName: string, tags: string[]): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(fileName);

        if (file && file instanceof TFile) {
            const content = await this.app.vault.read(file);

            // 检查是否已有标签
            const existingTags = this.extractTagsFromContent(content);
            const newTags = tags.filter(tag => !existingTags.includes(tag));

            if (newTags.length > 0) {
                // 在文件末尾添加新标签
                const updatedContent = content + '\n\n' + newTags.join(' ');
                await this.app.vault.modify(file, updatedContent);
            }
        }
    }

    /**
     * 从内容中提取现有标签
     */
    private extractTagsFromContent(content: string): string[] {
        const tagRegex = /#[\w\u4e00-\u9fa5]+/g;
        const matches = content.match(tagRegex);
        return matches || [];
    }

    /**
     * 基于标签搜索相关笔记
     */
    async searchNotesByTags(tags: string[]): Promise<TFile[]> {
        const allFiles = this.app.vault.getMarkdownFiles();
        const matchingFiles: TFile[] = [];

        for (const file of allFiles) {
            const content = await this.app.vault.read(file);
            const fileTags = this.extractTagsFromContent(content);

            // 检查是否有匹配的标签
            const hasMatchingTag = tags.some(tag => fileTags.includes(tag));
            if (hasMatchingTag) {
                matchingFiles.push(file);
            }
        }

        return matchingFiles;
    }

    /**
     * 生成标签统计报告
     */
    async generateTagReport(): Promise<TagReport> {
        const allFiles = this.app.vault.getMarkdownFiles();
        const tagCounts: { [tag: string]: number } = {};
        const tagFiles: { [tag: string]: string[] } = {};

        for (const file of allFiles) {
            const content = await this.app.vault.read(file);
            const fileTags = this.extractTagsFromContent(content);

            fileTags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                if (!tagFiles[tag]) tagFiles[tag] = [];
                tagFiles[tag].push(file.name);
            });
        }

        return {
            totalTags: Object.keys(tagCounts).length,
            tagCounts,
            tagFiles,
            mostUsedTags: Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count }))
        };
    }
}

// 类型定义
interface BaziTags {
    basic: string[];
    wuxing: string[];
    shensha: string[];
    geju: string[];
    time: string[];
    traits: string[];
    relations: string[];
}

interface TagReport {
    totalTags: number;
    tagCounts: { [tag: string]: number };
    tagFiles: { [tag: string]: string[] };
    mostUsedTags: Array<{ tag: string; count: number }>;
}
