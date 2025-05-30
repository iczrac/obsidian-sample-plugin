/**
 * 八字双链工具栏组件
 * 在八字命盘上方显示双链相关的操作按钮
 */

import { App, Notice } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { LinkService } from '../services/LinkService';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';
import { BaziLinkPanel } from './BaziLinkPanel';
import { BaziConfigPanel } from './BaziConfigPanel';

export class BaziLinkToolbar {
    private app: App;
    private baziInfo: BaziInfo;
    private settingsManager: DoubleLinkTagSettingsManager;
    private linkService: LinkService;
    private container: HTMLElement;
    private baziId: string;

    constructor(
        container: HTMLElement,
        baziInfo: BaziInfo,
        app: App,
        settingsManager: DoubleLinkTagSettingsManager
    ) {
        this.container = container;
        this.baziInfo = baziInfo;
        this.app = app;
        this.settingsManager = settingsManager;
        this.linkService = new LinkService(app, settingsManager);
        this.baziId = settingsManager.generateBaziId(baziInfo);

        this.render();
    }

    /**
     * 渲染工具栏
     */
    private render(): void {
        // 检查全局是否启用
        const globalSettings = this.settingsManager.getGlobalSettings();
        if (!globalSettings.globalEnabled) {
            return; // 如果全局禁用，不显示工具栏
        }

        // 创建工具栏容器
        const toolbar = this.container.createDiv({ cls: 'bazi-link-toolbar' });

        // 添加工具栏标题
        const title = toolbar.createDiv({ cls: 'bazi-link-toolbar-title' });
        title.innerHTML = `🔗 ${this.baziInfo.name || '八字'} 双链功能`;

        // 创建按钮容器
        const buttonContainer = toolbar.createDiv({ cls: 'bazi-link-toolbar-buttons' });

        // 相关链接按钮
        this.createLinksButton(buttonContainer);

        // 个人档案按钮
        if (this.baziInfo.name) {
            this.createProfileButton(buttonContainer);
        }



        // 插入链接按钮
        this.createInsertLinksButton(buttonContainer);



        // 配置按钮（如果启用）
        if (globalSettings.advanced.showConfigButton) {
            this.createConfigButton(buttonContainer);
        }
    }

    /**
     * 创建相关链接按钮
     */
    private createLinksButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: '🔗 相关链接',
            cls: 'bazi-toolbar-button mod-secondary',
            attr: { 'title': '查看所有相关的双链和标签' }
        });

        button.addEventListener('click', () => {
            const linkPanel = new BaziLinkPanel(
                this.app,
                this.baziInfo,
                this.settingsManager,
                (link: string) => {
                    // 处理链接点击
                    this.handleLinkClick(link);
                }
            );
            linkPanel.open();
        });
    }

    /**
     * 创建个人档案按钮（融合插入链接功能）
     */
    private createProfileButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: `👤 ${this.baziInfo.name}`,
            cls: 'bazi-toolbar-button mod-cta',
            attr: { 'title': `创建/更新 ${this.baziInfo.name} 的档案并插入链接` }
        });

        button.addEventListener('click', async () => {
            try {
                // 1. 创建或更新个人档案页面
                await this.createOrUpdatePersonalProfile();

                // 2. 在当前文档中插入链接
                await this.insertLinksToCurrentDocument();

                new Notice(`✅ 已创建/更新 ${this.baziInfo.name} 的档案并插入链接`);
            } catch (error) {
                new Notice('❌ 操作失败');
                console.error('创建档案或插入链接失败:', error);
            }
        });
    }



    /**
     * 创建插入链接按钮
     */
    private createInsertLinksButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: '📝 插入链接',
            cls: 'bazi-toolbar-button mod-cta',
            attr: { 'title': '将双链和标签插入到当前文档中，使其能被Obsidian识别' }
        });

        button.addEventListener('click', async () => {
            try {
                await this.insertLinksToDocument();
                new Notice('✅ 双链和标签已插入到文档中！');
            } catch (error) {
                console.error('插入链接失败:', error);
                new Notice('❌ 插入链接失败，请查看控制台');
            }
        });
    }



    /**
     * 创建配置按钮
     */
    private createConfigButton(container: HTMLElement): void {
        const individualConfig = this.settingsManager.getIndividualConfig(this.baziId);
        const hasCustomConfig = individualConfig?.enabled;

        const button = container.createEl('button', {
            text: hasCustomConfig ? '⚙️ 配置*' : '⚙️ 配置',
            cls: `bazi-toolbar-button mod-secondary ${hasCustomConfig ? 'bazi-config-customized' : ''}`,
            attr: { 'title': '配置这个八字的双链标签设置' }
        });

        button.addEventListener('click', () => {
            const configPanel = new BaziConfigPanel(
                this.app,
                this.baziInfo,
                this.settingsManager,
                () => {
                    // 配置变更回调，重新渲染工具栏
                    this.refresh();
                }
            );
            configPanel.open();
        });
    }

    /**
     * 处理链接点击
     */
    private handleLinkClick(link: string): void {
        if (link.startsWith('[[') && link.endsWith(']]')) {
            // 双链格式，提取链接内容
            const linkText = link.slice(2, -2);
            this.app.workspace.openLinkText(linkText, '', false);
        } else if (link.startsWith('#')) {
            // 标签格式，复制到剪贴板
            navigator.clipboard.writeText(link).then(() => {
                new Notice(`已复制标签: ${link}`);
            });
        } else {
            // 普通链接
            this.app.workspace.openLinkText(link, '', false);
        }
    }

    /**
     * 创建或更新个人档案
     */
    private async createOrUpdatePersonalProfile(): Promise<void> {
        const fileName = `${this.baziInfo.name}.md`;
        const existingFile = this.app.vault.getAbstractFileByPath(fileName);

        if (!existingFile) {
            // 文件不存在，创建新档案
            const content = this.generatePersonalProfileContent();
            await this.app.vault.create(fileName, content);
        } else {
            // 文件存在，更新特定区域
            await this.updatePersonalProfileContent(existingFile);
        }
    }

    /**
     * 更新个人档案的特定区域
     */
    private async updatePersonalProfileContent(file: any): Promise<void> {
        const currentContent = await this.app.vault.read(file);
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);

        let newContent = currentContent;

        // 定义所有可更新的区块
        const updateBlocks = [
            {
                name: '基本信息区块',
                regex: /<!-- 基本信息区块 开始 -->[\s\S]*?<!-- 基本信息区块 结束 -->/,
                content: this.buildBasicInfoSection().join('\n')
            },
            {
                name: '八字命盘区块',
                regex: /<!-- 八字命盘区块 开始 -->[\s\S]*?<!-- 八字命盘区块 结束 -->/,
                content: this.buildBaziChartSection().join('\n')
            },
            {
                name: '神煞分析区块',
                regex: /<!-- 神煞分析区块 开始 -->[\s\S]*?<!-- 神煞分析区块 结束 -->/,
                content: this.buildShenShaSection(smartResult).join('\n')
            },
            {
                name: '格局分析区块',
                regex: /<!-- 格局分析区块 开始 -->[\s\S]*?<!-- 格局分析区块 结束 -->/,
                content: this.buildGeJuSection(smartResult).join('\n')
            },
            {
                name: '五行强弱区块',
                regex: /<!-- 五行强弱区块 开始 -->[\s\S]*?<!-- 五行强弱区块 结束 -->/,
                content: this.buildWuXingSection(smartResult).join('\n')
            },
            {
                name: '时代特征区块',
                regex: /<!-- 时代特征区块 开始 -->[\s\S]*?<!-- 时代特征区块 结束 -->/,
                content: this.buildEraSection(smartResult).join('\n')
            },
            {
                name: '相关链接区块',
                regex: /<!-- 相关链接区块 开始 -->[\s\S]*?<!-- 相关链接区块 结束 -->/,
                content: this.buildRelatedLinksSection(smartResult).join('\n')
            },
            {
                name: '标签系统区块',
                regex: /<!-- 标签系统区块 开始 -->[\s\S]*?<!-- 标签系统区块 结束 -->/,
                content: this.buildTagsSection(smartResult).join('\n')
            }
        ];

        // 逐个更新区块
        updateBlocks.forEach(block => {
            if (block.regex.test(newContent)) {
                newContent = newContent.replace(block.regex, block.content);
            }
        });

        // 更新档案信息区块（更新时间）
        const archiveInfoRegex = /<!-- 档案信息区块 开始 -->[\s\S]*?<!-- 档案信息区块 结束 -->/;
        const archiveContent = this.buildArchiveInfoSection().join('\n');
        if (archiveInfoRegex.test(newContent)) {
            newContent = newContent.replace(archiveInfoRegex, archiveContent);
        }

        await this.app.vault.modify(file, newContent);
    }

    /**
     * 在当前文档中插入链接（重命名原方法）
     */
    private async insertLinksToCurrentDocument(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            return; // 静默失败，因为这是附加功能
        }

        // 生成双链和标签
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);

        // 构建要插入的内容
        const linksContent = this.buildLinksContent(smartResult);

        // 读取当前文档内容
        const currentContent = await this.app.vault.read(activeFile);

        // 检查是否已经存在八字链接标签部分
        const linksSectionRegex = /<!-- 八字相关链接和标签 开始 -->[\s\S]*?<!-- 八字相关链接和标签 结束 -->/;

        let newContent: string;
        if (linksSectionRegex.test(currentContent)) {
            // 替换现有的链接标签部分
            newContent = currentContent.replace(linksSectionRegex, linksContent);
        } else {
            // 在文档末尾添加链接标签部分
            newContent = currentContent + '\n\n' + linksContent;
        }

        // 写入更新后的内容
        await this.app.vault.modify(activeFile, newContent);
    }

    /**
     * 将双链和标签插入到当前文档中（保留原接口）
     */
    private async insertLinksToDocument(): Promise<void> {
        await this.insertLinksToCurrentDocument();
    }

    /**
     * 构建链接内容
     */
    private buildLinksContent(smartResult: any): string {
        const sections: string[] = [];

        sections.push('<!-- 八字相关链接和标签 开始 -->');
        sections.push('');
        sections.push('## 🔗 相关链接和标签');
        sections.push('');

        // 双链部分
        if (smartResult.doubleLinks.length > 0) {
            sections.push('### 双链（专属名称）');
            smartResult.doubleLinks.forEach((link: string) => {
                sections.push(`- ${link}`);
            });
            sections.push('');
        }

        // 标签部分
        if (smartResult.tags.length > 0) {
            sections.push('### 标签（定性特征）');
            const tagsLine = smartResult.tags.join(' ');
            sections.push(tagsLine);
            sections.push('');
        }

        // 人物档案链接
        if (this.baziInfo.name) {
            sections.push('### 人物档案');
            sections.push(`- [[${this.baziInfo.name}]]`);
            sections.push('');
        }

        sections.push('<!-- 八字相关链接和标签 结束 -->');

        return sections.join('\n');
    }






    /**
     * 生成个人档案内容（使用HTML注释块分区）
     */
    private generatePersonalProfileContent(): string {
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);
        const sections: string[] = [];

        // 档案标题
        sections.push(`# ${this.baziInfo.name}`);
        sections.push('');

        // 基本信息区块
        sections.push(...this.buildBasicInfoSection());

        // 八字命盘区块
        sections.push(...this.buildBaziChartSection());

        // 神煞分析区块
        sections.push(...this.buildShenShaSection(smartResult));

        // 格局分析区块
        sections.push(...this.buildGeJuSection(smartResult));

        // 五行强弱区块
        sections.push(...this.buildWuXingSection(smartResult));

        // 时代特征区块
        sections.push(...this.buildEraSection(smartResult));

        // 相关链接区块
        sections.push(...this.buildRelatedLinksSection(smartResult));

        // 标签系统区块
        sections.push(...this.buildTagsSection(smartResult));

        // 档案信息区块
        sections.push(...this.buildArchiveInfoSection());

        return sections.join('\n');
    }
    /**
     * 构建基本信息区块
     */
    private buildBasicInfoSection(): string[] {
        const sections: string[] = [];

        sections.push('<!-- 基本信息区块 开始 -->');
        sections.push('## 📋 基本信息');
        sections.push('');
        sections.push(`- **姓名**: ${this.baziInfo.name}`);
        sections.push(`- **性别**: ${this.baziInfo.gender === '1' ? '男' : this.baziInfo.gender === '0' ? '女' : '未知'}`);
        sections.push(`- **出生日期**: ${this.baziInfo.solarDate || '未知'}`);
        sections.push(`- **农历**: ${this.baziInfo.lunarDate || '未知'}`);
        sections.push(`- **生肖**: ${this.baziInfo.yearShengXiao || '未知'}`);
        sections.push(`- **八字**: ${this.baziInfo.yearPillar || ''} ${this.baziInfo.monthPillar || ''} ${this.baziInfo.dayPillar || ''} ${this.baziInfo.hourPillar || ''}`);
        sections.push('');
        sections.push('<!-- 基本信息区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建八字命盘区块
     */
    private buildBaziChartSection(): string[] {
        const sections: string[] = [];

        sections.push('<!-- 八字命盘区块 开始 -->');
        sections.push('## 🔮 八字命盘');
        sections.push('');
        sections.push('```bazi');
        sections.push(`date: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || '00:00'}`);
        sections.push(`gender: ${this.baziInfo.gender === '1' ? '男' : '女'}`);
        sections.push(`name: ${this.baziInfo.name}`);
        sections.push('style: 3');
        sections.push('```');
        sections.push('');
        sections.push('<!-- 八字命盘区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建神煞分析区块
     */
    private buildShenShaSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 神煞分析区块 开始 -->');
        sections.push('## 🌟 神煞分析');
        sections.push('');

        // 提取神煞链接
        const shenShaLinks = smartResult.doubleLinks.filter((link: string) =>
            this.isShenShaLink(link)
        );

        if (shenShaLinks.length > 0) {
            sections.push('### 神煞');
            shenShaLinks.forEach((link: string) => {
                sections.push(`- ${link}`);
            });
            sections.push('');

            // 生成神煞组合
            const shenShaCombos = this.generateShenShaCombos();
            if (shenShaCombos.length > 0) {
                sections.push('### 神煞组合');
                shenShaCombos.forEach(combo => {
                    sections.push(`- [[${combo.name}]] - ${combo.description}`);
                });
                sections.push('');
            } else {
                sections.push('### 神煞组合');
                sections.push('- 暂无特殊神煞组合');
                sections.push('');
            }
        } else {
            sections.push('暂无神煞信息');
            sections.push('');
        }

        sections.push('<!-- 神煞分析区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建格局分析区块
     */
    private buildGeJuSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 格局分析区块 开始 -->');
        sections.push('## ⚖️ 格局分析');
        sections.push('');

        // 提取格局信息
        if (this.baziInfo.geJu) {
            sections.push('### 主格局');
            sections.push(`- **格局类型**: [[${this.baziInfo.geJu}]]`);
            sections.push(`- **格局特点**: 待分析`);
            sections.push(`- **格局优劣**: 待分析`);
            sections.push('');

            sections.push('### 格局分析');
            sections.push('<!-- 详细的格局分析内容 -->');
            sections.push('- 待补充...');
            sections.push('');
        } else {
            sections.push('格局信息待分析');
            sections.push('');
        }

        sections.push('<!-- 格局分析区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建五行强弱区块
     */
    private buildWuXingSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 五行强弱区块 开始 -->');
        sections.push('## 🏷️ 五行强弱');
        sections.push('');

        // 日主分析
        if (this.baziInfo.dayStem && this.baziInfo.riZhuStrength) {
            sections.push('### 日主分析');
            sections.push(`- **日主**: ${this.baziInfo.dayStem}`);
            sections.push(`- **旺衰**: ${this.baziInfo.riZhuStrength}`);
            sections.push('');
        }

        // 五行强弱标签
        const wuXingTags = smartResult.tags.filter((tag: string) =>
            this.isWuXingTag(tag)
        );

        if (wuXingTags.length > 0) {
            sections.push('### 五行标签');
            sections.push(wuXingTags.join(' '));
            sections.push('');
        }

        sections.push('### 用神忌神');
        sections.push('<!-- 用神忌神分析 -->');
        sections.push('- 待分析...');
        sections.push('');

        sections.push('<!-- 五行强弱区块 结束 -->');
        sections.push('');

        return sections;
    }
    /**
     * 构建时代特征区块
     */
    private buildEraSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 时代特征区块 开始 -->');
        sections.push('## 🏛️ 时代特征');
        sections.push('');

        // 时代特征标签
        const eraTags = smartResult.tags.filter((tag: string) =>
            this.isEraTag(tag)
        );

        if (eraTags.length > 0) {
            sections.push('### 时代标签');
            sections.push(eraTags.join(' '));
            sections.push('');
        }

        // 历史背景
        if (this.baziInfo.solarDate) {
            const year = parseInt(this.baziInfo.solarDate.split('-')[0]);
            sections.push('### 历史背景');
            sections.push(`- **出生年份**: ${year}年`);

            if (year < 1912) {
                sections.push('- **历史时期**: 古代');
            } else if (year >= 1912 && year < 1949) {
                sections.push('- **历史时期**: 民国时期');
            } else if (year >= 1949) {
                sections.push('- **历史时期**: 新中国成立后');
            }

            sections.push('- **时代特点**: 待补充');
            sections.push('');
        }

        sections.push('<!-- 时代特征区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建相关链接区块
     */
    private buildRelatedLinksSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 相关链接区块 开始 -->');
        sections.push('## 🔗 相关链接');
        sections.push('');

        // 个人相关链接
        sections.push('### 个人档案');
        sections.push(`- [[${this.baziInfo.name}的八字分析]] - 详细命理分析`);
        sections.push(`- [[${this.baziInfo.name}的大运分析]] - 人生运势分析`);
        sections.push(`- [[${this.baziInfo.name}的流年运势]] - 年度运势分析`);
        sections.push('');

        // 关联信息
        if (this.baziInfo.solarDate && this.baziInfo.yearShengXiao) {
            const birthYear = this.baziInfo.solarDate.split('-')[0];
            sections.push('### 关联信息');
            sections.push(`- [[${birthYear}年生人]] - 同年份生人特征`);
            sections.push(`- [[${this.baziInfo.yearShengXiao}年运势]] - 生肖运势分析`);
            sections.push(`- [[${this.baziInfo.gender === '1' ? '男' : '女'}性八字特征]] - 性别特征分析`);
            sections.push('');
        }

        // 其他双链
        const otherLinks = smartResult.doubleLinks.filter((link: string) =>
            !this.isShenShaLink(link) && !this.isGeJuLink(link) && !link.includes(this.baziInfo.name || '')
        );

        if (otherLinks.length > 0) {
            sections.push('### 其他相关');
            otherLinks.forEach((link: string) => {
                sections.push(`- ${link}`);
            });
            sections.push('');
        }

        sections.push('<!-- 相关链接区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建标签系统区块
     */
    private buildTagsSection(smartResult: any): string[] {
        const sections: string[] = [];

        sections.push('<!-- 标签系统区块 开始 -->');
        sections.push('## 🏷️ 标签系统');
        sections.push('');

        // 分类显示标签
        const allTags = smartResult.tags;
        const wuXingTags = allTags.filter((tag: string) => this.isWuXingTag(tag));
        const eraTags = allTags.filter((tag: string) => this.isEraTag(tag));
        const otherTags = allTags.filter((tag: string) =>
            !this.isWuXingTag(tag) && !this.isEraTag(tag)
        );

        if (wuXingTags.length > 0) {
            sections.push('### 五行标签');
            sections.push(wuXingTags.join(' '));
            sections.push('');
        }

        if (eraTags.length > 0) {
            sections.push('### 时代标签');
            sections.push(eraTags.join(' '));
            sections.push('');
        }

        if (otherTags.length > 0) {
            sections.push('### 其他标签');
            sections.push(otherTags.join(' '));
            sections.push('');
        }

        // 所有标签汇总
        if (allTags.length > 0) {
            sections.push('### 全部标签');
            sections.push(allTags.join(' '));
            sections.push('');
        }

        sections.push('<!-- 标签系统区块 结束 -->');
        sections.push('');

        return sections;
    }

    /**
     * 构建档案信息区块
     */
    private buildArchiveInfoSection(): string[] {
        const sections: string[] = [];

        sections.push('<!-- 档案信息区块 开始 -->');
        sections.push('## 📄 档案信息');
        sections.push('');
        sections.push(`- **创建时间**: ${new Date().toLocaleString()}`);
        sections.push(`- **最后更新**: ${new Date().toLocaleString()}`);
        sections.push(`- **数据来源**: 八字命盘插件自动生成`);
        sections.push(`- **插件版本**: 1.0.0`);
        sections.push('');
        sections.push('---');
        sections.push('');
        sections.push('> 💡 **使用说明**: 此档案由八字命盘插件自动生成，包含基本信息、命理分析、相关链接等内容。各区块可独立更新，便于维护和扩展。');
        sections.push('');
        sections.push('<!-- 档案信息区块 结束 -->');

        return sections;
    }
    /**
     * 判断是否为神煞链接
     */
    private isShenShaLink(link: string): boolean {
        const shenShaKeywords = [
            '天乙贵人', '文昌', '桃花', '咸池', '华盖', '羊刃', '七杀', '天德', '月德',
            '驿马', '将星', '劫煞', '亡神', '孤辰', '寡宿', '红鸾', '天喜', '国印',
            '学堂', '词馆', '金舆', '禄神', '刃煞', '飞刃', '血刃', '天罗', '地网'
        ];
        return shenShaKeywords.some(keyword => link.includes(keyword));
    }

    /**
     * 判断是否为格局链接
     */
    private isGeJuLink(link: string): boolean {
        const geJuKeywords = [
            '格', '局', '从', '化气', '专旺', '润下', '炎上', '稼穑', '曲直', '从革',
            '正财', '偏财', '正官', '偏官', '正印', '偏印', '食神', '伤官', '比肩', '劫财'
        ];
        return geJuKeywords.some(keyword => link.includes(keyword));
    }

    /**
     * 判断是否为五行强弱标签
     */
    private isWuXingTag(tag: string): boolean {
        const wuXingKeywords = [
            '日主', '用神', '忌神', '木', '火', '土', '金', '水', '旺', '弱', '中和',
            '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
        ];
        return wuXingKeywords.some(keyword => tag.includes(keyword));
    }

    /**
     * 生成神煞组合
     */
    private generateShenShaCombos(): Array<{name: string, description: string}> {
        const combos: Array<{name: string, description: string}> = [];

        // 获取所有神煞名称
        const allShenSha = this.getAllShenShaNames();

        // 定义神煞组合规则
        const comboRules = [
            {
                names: ['天乙贵人', '文昌'],
                combo: '贵人文昌组合',
                desc: '智慧与贵人相助，学业事业双佳'
            },
            {
                names: ['桃花', '咸池'],
                combo: '桃花咸池组合',
                desc: '感情丰富，异性缘佳，需注意感情纠纷'
            },
            {
                names: ['华盖', '文昌'],
                combo: '华盖文昌组合',
                desc: '艺术才华出众，适合文化创作'
            },
            {
                names: ['羊刃', '七杀'],
                combo: '羊刃七杀组合',
                desc: '性格刚强果断，具有领导才能'
            },
            {
                names: ['天德', '月德'],
                combo: '天月德组合',
                desc: '德行高尚，一生多贵人相助'
            },
            {
                names: ['驿马', '将星'],
                combo: '驿马将星组合',
                desc: '奔波中成就事业，适合外出发展'
            },
            {
                names: ['天乙贵人', '国印'],
                combo: '贵人国印组合',
                desc: '官运亨通，容易获得权威地位'
            },
            {
                names: ['文昌', '学堂'],
                combo: '文昌学堂组合',
                desc: '学习能力强，适合学术研究'
            },
            {
                names: ['红鸾', '天喜'],
                combo: '红鸾天喜组合',
                desc: '婚姻美满，感情生活幸福'
            },
            {
                names: ['华盖', '孤辰'],
                combo: '华盖孤辰组合',
                desc: '性格孤高，适合独立思考和创作'
            },
            {
                names: ['桃花', '红鸾'],
                combo: '桃花红鸾组合',
                desc: '异性缘极佳，感情机会多'
            },
            {
                names: ['将星', '国印'],
                combo: '将星国印组合',
                desc: '具有统领才能，适合管理职位'
            }
        ];

        // 检查哪些组合存在
        comboRules.forEach(rule => {
            const hasAllShenSha = rule.names.every(name => allShenSha.includes(name));
            if (hasAllShenSha) {
                combos.push({
                    name: rule.combo,
                    description: rule.desc
                });
            }
        });

        return combos;
    }

    /**
     * 获取所有神煞名称
     */
    private getAllShenShaNames(): string[] {
        const shenShaList: string[] = [];

        // 从八字信息中提取神煞
        if (this.baziInfo.shenSha) {
            if (Array.isArray(this.baziInfo.shenSha)) {
                this.baziInfo.shenSha.forEach((shenSha: any) => {
                    if (typeof shenSha === 'string') {
                        shenShaList.push(shenSha);
                    } else if (shenSha && shenSha.name) {
                        shenShaList.push(shenSha.name);
                    }
                });
            } else if (typeof this.baziInfo.shenSha === 'object') {
                Object.values(this.baziInfo.shenSha).forEach((shenShaArray: any) => {
                    if (Array.isArray(shenShaArray)) {
                        shenShaArray.forEach((shenSha: any) => {
                            if (typeof shenSha === 'string') {
                                shenShaList.push(shenSha);
                            } else if (shenSha && shenSha.name) {
                                shenShaList.push(shenSha.name);
                            }
                        });
                    }
                });
            }
        }

        // 检查各个柱的神煞
        ['yearShenSha', 'monthShenSha', 'dayShenSha', 'hourShenSha'].forEach(key => {
            const shenShaArray = (this.baziInfo as any)[key];
            if (Array.isArray(shenShaArray)) {
                shenShaArray.forEach((shenSha: any) => {
                    if (typeof shenSha === 'string') {
                        shenShaList.push(shenSha);
                    } else if (shenSha && shenSha.name) {
                        shenShaList.push(shenSha.name);
                    }
                });
            }
        });

        return [...new Set(shenShaList)];
    }

    /**
     * 判断是否为时代特征标签
     */
    private isEraTag(tag: string): boolean {
        const eraKeywords = [
            '年代', '世纪', '后', '朝', '民国', '新中国', '年', '性', '男', '女',
            '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'
        ];
        return eraKeywords.some(keyword => tag.includes(keyword));
    }

    /**
     * 刷新工具栏
     */
    refresh(): void {
        // 清空容器并重新渲染
        const toolbar = this.container.querySelector('.bazi-link-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
        this.render();
    }

    /**
     * 销毁工具栏
     */
    destroy(): void {
        const toolbar = this.container.querySelector('.bazi-link-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
    }
}

/**
 * 表格增强器 - 为八字表格中的元素添加双链功能
 */
export class BaziTableEnhancer {
    /**
     * 增强表格
     */
    static enhanceTable(
        table: HTMLTableElement,
        baziInfo: BaziInfo,
        app: App,
        settingsManager: DoubleLinkTagSettingsManager
    ): void {
        const globalSettings = settingsManager.getGlobalSettings();
        if (!globalSettings.globalEnabled) {
            return; // 如果全局禁用，不进行增强
        }

        const baziId = settingsManager.generateBaziId(baziInfo);
        const effectiveConfig = settingsManager.getEffectiveConfig(baziId);

        // 获取所有单元格
        const cells = table.querySelectorAll('td, th');

        cells.forEach(cell => {
            const text = cell.textContent?.trim();
            if (!text) return;

            // 检查是否为神煞名称
            if (this.isShenShaName(text, effectiveConfig)) {
                this.makeClickableLink(cell as HTMLElement, `${text}详解`, app);
            }

            // 检查是否为其他可链接内容
            // 可以根据需要扩展更多类型
        });
    }

    /**
     * 判断是否为神煞名称
     */
    private static isShenShaName(text: string, config: any): boolean {
        if (!config.doubleLinks.shenSha.enabled) return false;
        return config.doubleLinks.shenSha.fields.includes(text);
    }

    /**
     * 使元素可点击并添加链接功能
     */
    private static makeClickableLink(element: HTMLElement, linkText: string, app: App): void {
        element.style.cursor = 'pointer';
        element.style.color = 'var(--link-color)';
        element.style.textDecoration = 'underline';
        element.setAttribute('title', `点击查看 ${linkText}`);

        element.addEventListener('click', () => {
            app.workspace.openLinkText(linkText, '', false);
        });
    }
}
