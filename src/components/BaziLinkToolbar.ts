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
     * 创建快速链接按钮（简化版插入链接）
     */
    private createInsertLinksButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: '📝 快速链接',
            cls: 'bazi-toolbar-button mod-secondary',
            attr: { 'title': '在当前文档中插入核心链接和标签' }
        });

        button.addEventListener('click', async () => {
            try {
                await this.insertCoreLinksToDocument();
                new Notice('✅ 核心链接已插入到当前文档！');
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
     * 在当前文档中插入核心链接（简化版）
     */
    private async insertCoreLinksToDocument(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            throw new Error('没有活动文档');
        }

        // 生成核心链接内容
        const coreContent = this.buildCoreLinksContent();

        // 读取当前文档内容
        const currentContent = await this.app.vault.read(activeFile);

        // 检查是否已经存在核心链接部分
        const coreLinksRegex = /<!-- 八字核心链接 开始 -->[\s\S]*?<!-- 八字核心链接 结束 -->/;

        let newContent: string;
        if (coreLinksRegex.test(currentContent)) {
            // 替换现有的核心链接部分
            newContent = currentContent.replace(coreLinksRegex, coreContent);
        } else {
            // 在文档末尾添加核心链接部分
            newContent = currentContent + '\n\n' + coreContent;
        }

        // 写入更新后的内容
        await this.app.vault.modify(activeFile, newContent);
    }

    /**
     * 构建核心链接内容（精简版）
     */
    private buildCoreLinksContent(): string {
        const sections: string[] = [];

        sections.push('<!-- 八字核心链接 开始 -->');
        sections.push('');
        sections.push('## 🔗 八字核心信息');
        sections.push('');

        // 人物档案链接
        if (this.baziInfo.name) {
            sections.push('### 👤 人物档案');
            sections.push(`- [[${this.baziInfo.name}]] - 完整个人档案`);
            sections.push('');
        }

        // 核心神煞（只显示最重要的3个）
        const allShenSha = this.getAllShenShaNames();
        if (allShenSha.length > 0) {
            sections.push('### 🌟 核心神煞');
            const importantShenSha = allShenSha.slice(0, 3);
            importantShenSha.forEach(shenSha => {
                sections.push(`- [[${shenSha}]]`);
            });
            sections.push('');
        }

        // 格局信息
        if (this.baziInfo.geJu) {
            sections.push('### ⚖️ 格局');
            sections.push(`- [[${this.baziInfo.geJu}]]`);
            sections.push('');
        }

        // 核心标签（只显示最重要的）
        const coreTag = this.generateCoreTag();
        if (coreTag) {
            sections.push('### 🏷️ 核心特征');
            sections.push(coreTag);
            sections.push('');
        }

        sections.push('<!-- 八字核心链接 结束 -->');

        return sections.join('\n');
    }

    /**
     * 生成核心标签
     */
    private generateCoreTag(): string {
        const tags: string[] = [];

        // 日主强弱
        if (this.baziInfo.dayStem && this.baziInfo.riZhuStrength) {
            const wuXingMap: { [key: string]: string } = {
                '甲': '木', '乙': '木', '丙': '火', '丁': '火',
                '戊': '土', '己': '土', '庚': '金', '辛': '金',
                '壬': '水', '癸': '水'
            };
            const wuXing = wuXingMap[this.baziInfo.dayStem] || '';
            tags.push(`#${this.baziInfo.dayStem}${wuXing}日主${this.baziInfo.riZhuStrength}`);
        }

        // 生肖
        if (this.baziInfo.yearShengXiao) {
            tags.push(`#${this.baziInfo.yearShengXiao}年`);
        }

        // 性别
        if (this.baziInfo.gender) {
            const genderText = this.baziInfo.gender === '1' ? '男性' : this.baziInfo.gender === '0' ? '女性' : this.baziInfo.gender;
            tags.push(`#${genderText}`);
        }

        return tags.join(' ');
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
    public generatePersonalProfileContent(): string {
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
        const timeStr = this.baziInfo.solarTime || '00:00';
        const formattedTime = timeStr.includes(':') ? timeStr : '00:00';
        sections.push(`date: ${this.baziInfo.solarDate} ${formattedTime}`);
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

            // 生成神煞组合（使用ShenShaExplanationService）
            const shenShaCombos = this.generateShenShaCombosByService();
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
            sections.push('### 神煞');
            sections.push('- 暂无神煞信息，可能是八字数据不完整或神煞计算未启用');
            sections.push('');

            sections.push('### 神煞组合');
            sections.push('- 暂无神煞组合');
            sections.push('');

            sections.push('### 神煞说明');
            sections.push('> 💡 神煞是八字命理中的重要概念，代表特殊的星宿和能量。如果此处显示为空，可能需要：');
            sections.push('> - 检查八字计算设置');
            sections.push('> - 确认神煞计算功能已启用');
            sections.push('> - 验证出生时间的准确性');
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
            sections.push(`- **格局等级**: ${this.getGeJuLevel(this.baziInfo.geJu)}`);
            sections.push(`- **格局特点**: ${this.getGeJuFeatures(this.baziInfo.geJu)}`);
            sections.push(`- **适合职业**: ${this.getGeJuCareers(this.baziInfo.geJu)}`);
            sections.push('');

            sections.push('### 格局分析');
            sections.push(`> 📊 **${this.baziInfo.geJu}分析**`);
            sections.push(`> ${this.getGeJuDescription(this.baziInfo.geJu)}`);
            sections.push('');

            sections.push('### 格局优化建议');
            sections.push('- 待根据具体情况分析');
            sections.push('- 建议结合大运流年进行详细分析');
            sections.push('');
        } else {
            sections.push('### 格局信息');
            sections.push('- 格局信息待分析，可能需要更详细的八字计算');
            sections.push('');

            sections.push('### 格局说明');
            sections.push('> 💡 八字格局是命理分析的核心，决定了一个人的基本性格和人生走向。');
            sections.push('> 常见格局包括：正官格、偏官格、正财格、偏财格、食神格、伤官格等。');
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
                sections.push('- **社会特征**: 传统农业社会，重视礼教文化');
            } else if (year >= 1912 && year < 1949) {
                sections.push('- **历史时期**: 民国时期');
                sections.push('- **社会特征**: 新旧交替，思想解放，战乱频繁');
            } else if (year >= 1949 && year < 1978) {
                sections.push('- **历史时期**: 新中国成立初期');
                sections.push('- **社会特征**: 计划经济，集体主义，艰苦奋斗');
            } else if (year >= 1978 && year < 2000) {
                sections.push('- **历史时期**: 改革开放时期');
                sections.push('- **社会特征**: 经济腾飞，思想开放，机遇与挑战并存');
            } else if (year >= 2000 && year < 2020) {
                sections.push('- **历史时期**: 新世纪初期');
                sections.push('- **社会特征**: 信息化时代，全球化进程，快速发展');
            } else if (year >= 2020) {
                sections.push('- **历史时期**: 新时代');
                sections.push('- **社会特征**: 数字化转型，可持续发展，创新驱动');
            }

            // 添加生肖年特征
            if (this.baziInfo.yearShengXiao) {
                sections.push(`- **生肖特征**: ${this.getZodiacCharacteristics(this.baziInfo.yearShengXiao)}`);
            }

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
        sections.push(`- [[${this.baziInfo.name}的性格特征]] - 性格分析报告`);
        sections.push(`- [[${this.baziInfo.name}的事业发展]] - 职业规划建议`);
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
     * 使用ShenShaExplanationService生成神煞组合
     */
    private generateShenShaCombosByService(): Array<{name: string, description: string}> {
        const combos: Array<{name: string, description: string}> = [];

        // 获取所有神煞名称
        const allShenSha = this.getAllShenShaNames();

        if (allShenSha.length === 0) {
            return combos;
        }

        try {
            // 使用ShenShaExplanationService获取神煞组合分析
            const { ShenShaExplanationService } = require('../services/ShenShaExplanationService');
            const combinationAnalysis = ShenShaExplanationService.getShenShaCombinationAnalysis(allShenSha);

            // 转换为所需格式
            combinationAnalysis.forEach((analysis: any) => {
                combos.push({
                    name: analysis.combination,
                    description: analysis.analysis.substring(0, 80) + '...' // 截取前80个字符
                });
            });
        } catch (error) {
            console.error('获取神煞组合分析失败:', error);
        }

        return combos;
    }

    /**
     * 生成神煞组合（备用方法，保留原有逻辑）
     */
    private generateShenShaCombos(): Array<{name: string, description: string}> {
        const combos: Array<{name: string, description: string}> = [];

        // 获取所有神煞名称
        const allShenSha = this.getAllShenShaNames();

        // 定义神煞组合规则
        const comboRules = [
            {
                names: ['天乙贵人', '文昌'],
                combo: '天乙贵人 + 文昌',
                desc: '智慧与贵人相助，学业事业双佳'
            },
            {
                names: ['桃花', '咸池'],
                combo: '桃花 + 咸池',
                desc: '感情丰富，异性缘佳，需注意感情纠纷'
            },
            {
                names: ['华盖', '文昌'],
                combo: '华盖 + 文昌',
                desc: '艺术才华出众，适合文化创作'
            },
            {
                names: ['羊刃', '七杀'],
                combo: '羊刃 + 七杀',
                desc: '性格刚强果断，具有领导才能'
            },
            {
                names: ['天德', '月德'],
                combo: '天德 + 月德',
                desc: '德行高尚，一生多贵人相助'
            },
            {
                names: ['驿马', '将星'],
                combo: '驿马 + 将星',
                desc: '奔波中成就事业，适合外出发展'
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
     * 获取格局等级
     */
    private getGeJuLevel(geJu: string): string {
        const levelMap: { [key: string]: string } = {
            '正官格': '上等格局',
            '偏官格': '中上格局',
            '正财格': '上等格局',
            '偏财格': '中等格局',
            '食神格': '上等格局',
            '伤官格': '中等格局',
            '正印格': '上等格局',
            '偏印格': '中等格局',
            '比肩格': '中等格局',
            '劫财格': '中下格局',
            '从旺格': '特殊格局',
            '从弱格': '特殊格局',
            '化气格': '特殊格局'
        };
        return levelMap[geJu] || '待分析';
    }

    /**
     * 获取格局特点
     */
    private getGeJuFeatures(geJu: string): string {
        const featuresMap: { [key: string]: string } = {
            '正官格': '正直守法，有责任心，适合管理',
            '偏官格': '果断刚强，有魄力，适合竞争',
            '正财格': '务实稳重，善于理财，重视物质',
            '偏财格': '灵活机变，善于投资，偏财运佳',
            '食神格': '温和善良，有艺术天赋，重视享受',
            '伤官格': '聪明才智，有创新精神，个性较强',
            '正印格': '学识渊博，有贵人相助，重视名誉',
            '偏印格': '思维敏捷，有特殊技能，较为孤独',
            '比肩格': '自立自强，有竞争意识，重视友情',
            '劫财格': '冲动急躁，容易破财，需要约束',
            '从旺格': '个性强烈，一意孤行，需要引导',
            '从弱格': '随和适应，依赖性强，需要支持',
            '化气格': '变化多端，适应力强，机遇较多'
        };
        return featuresMap[geJu] || '待分析';
    }

    /**
     * 获取格局适合职业
     */
    private getGeJuCareers(geJu: string): string {
        const careersMap: { [key: string]: string } = {
            '正官格': '公务员、管理者、法官、教师',
            '偏官格': '军人、警察、企业家、运动员',
            '正财格': '会计师、银行家、商人、理财师',
            '偏财格': '投资者、销售员、中介、贸易商',
            '食神格': '艺术家、厨师、娱乐业、服务业',
            '伤官格': '设计师、发明家、作家、技术员',
            '正印格': '学者、研究员、医生、咨询师',
            '偏印格': '占卜师、心理学家、技术专家',
            '比肩格': '合伙人、团队领导、体育教练',
            '劫财格': '销售、竞技、短期投资',
            '从旺格': '创业者、艺术家、自由职业',
            '从弱格': '助理、秘书、服务行业',
            '化气格': '外交官、中介、变化性工作'
        };
        return careersMap[geJu] || '待分析';
    }

    /**
     * 获取格局描述
     */
    private getGeJuDescription(geJu: string): string {
        const descMap: { [key: string]: string } = {
            '正官格': '正官格的人通常具有强烈的责任感和正义感，做事有条理，适合在体制内发展。',
            '偏官格': '偏官格的人性格刚强果断，有很强的执行力，适合在竞争激烈的环境中发展。',
            '正财格': '正财格的人务实稳重，善于积累财富，通过正当途径获得成功。',
            '偏财格': '偏财格的人机智灵活，善于把握机会，偏财运较好，适合投资理财。',
            '食神格': '食神格的人温和善良，有艺术天赋，重视生活品质和精神享受。',
            '伤官格': '伤官格的人聪明有才华，富有创新精神，但个性较强，需要适当约束。',
            '正印格': '正印格的人学识渊博，有贵人相助，重视名誉和社会地位。',
            '偏印格': '偏印格的人思维敏捷，有特殊技能，但较为孤独，需要主动社交。',
            '比肩格': '比肩格的人自立自强，有竞争意识，重视友情，适合团队合作。',
            '劫财格': '劫财格的人冲动急躁，容易破财，需要学会理财和情绪管理。',
            '从旺格': '从旺格是特殊格局，个性强烈，一意孤行，需要适当的引导和约束。',
            '从弱格': '从弱格的人随和适应，依赖性较强，需要寻找可靠的支持和依靠。',
            '化气格': '化气格变化多端，适应力强，机遇较多，但需要把握时机。'
        };
        return descMap[geJu] || '此格局的详细分析有待进一步研究。';
    }

    /**
     * 获取生肖特征
     */
    private getZodiacCharacteristics(zodiac: string): string {
        const zodiacMap: { [key: string]: string } = {
            '鼠': '机智灵活，适应力强，善于理财',
            '牛': '勤劳踏实，坚韧不拔，值得信赖',
            '虎': '勇敢果断，有领导力，富有正义感',
            '兔': '温和善良，心思细腻，重视和谐',
            '龙': '雄心壮志，有魅力，天生领袖',
            '蛇': '智慧深沉，直觉敏锐，神秘优雅',
            '马': '热情奔放，自由不羁，富有活力',
            '羊': '温柔体贴，有艺术天赋，重视精神',
            '猴': '聪明机智，多才多艺，善于变通',
            '鸡': '勤奋认真，有条理，注重细节',
            '狗': '忠诚可靠，有责任心，重视友情',
            '猪': '诚实善良，乐观开朗，享受生活'
        };
        return zodiacMap[zodiac] || '待分析';
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
                this.makeClickableLink(cell as HTMLElement, text, app);
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
