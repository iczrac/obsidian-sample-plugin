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

        // 知识库按钮
        this.createKnowledgeBaseButton(buttonContainer);

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
     * 创建个人档案按钮
     */
    private createProfileButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: `👤 ${this.baziInfo.name}`,
            cls: 'bazi-toolbar-button mod-cta',
            attr: { 'title': `创建或打开 ${this.baziInfo.name} 的个人档案` }
        });

        button.addEventListener('click', async () => {
            try {
                // 创建个人档案页面
                const fileName = `${this.baziInfo.name}.md`;
                const existingFile = this.app.vault.getAbstractFileByPath(fileName);

                if (!existingFile) {
                    // 生成个人档案内容
                    const content = this.generatePersonalProfileContent();
                    await this.app.vault.create(fileName, content);
                    new Notice(`✅ 已创建 ${this.baziInfo.name} 的个人档案`);
                }

                // 打开个人档案页面
                await this.app.workspace.openLinkText(fileName, '', false);
            } catch (error) {
                new Notice('❌ 创建个人档案失败');
                console.error('创建个人档案失败:', error);
            }
        });
    }

    /**
     * 创建知识库按钮
     */
    private createKnowledgeBaseButton(container: HTMLElement): void {
        const button = container.createEl('button', {
            text: '📚 知识库',
            cls: 'bazi-toolbar-button mod-secondary',
            attr: { 'title': '一键创建完整的八字知识库' }
        });

        button.addEventListener('click', async () => {
            try {
                // 创建基础知识库结构
                await this.createKnowledgeBase();
                new Notice('✅ 八字知识库创建完成！');
            } catch (error) {
                new Notice('❌ 创建知识库失败');
                console.error('创建知识库失败:', error);
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
     * 创建知识库
     */
    private async createKnowledgeBase(): Promise<void> {
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);

        // 创建个人档案
        if (this.baziInfo.name) {
            const fileName = `${this.baziInfo.name}.md`;
            const existingFile = this.app.vault.getAbstractFileByPath(fileName);
            if (!existingFile) {
                const content = this.generatePersonalProfileContent();
                await this.app.vault.create(fileName, content);
            }
        }

        // 创建神煞详解页面
        for (const link of smartResult.doubleLinks) {
            if (link.includes('详解')) {
                const pageName = link.replace(/\[\[|\]\]/g, '');
                const fileName = `${pageName}.md`;
                const existingFile = this.app.vault.getAbstractFileByPath(fileName);
                if (!existingFile) {
                    const content = this.generateShenShaContent(pageName);
                    await this.app.vault.create(fileName, content);
                }
            }
        }
    }

    /**
     * 生成神煞详解内容
     */
    private generateShenShaContent(shenShaName: string): string {
        let content = `# ${shenShaName}\n\n`;
        content += `## 基本信息\n\n`;
        content += `- **神煞名称**: ${shenShaName}\n`;
        content += `- **类型**: 神煞\n\n`;
        content += `## 计算方法\n\n`;
        content += `待补充...\n\n`;
        content += `## 作用影响\n\n`;
        content += `待补充...\n\n`;
        content += `## 相关案例\n\n`;
        content += `待补充...\n\n`;
        return content;
    }

    /**
     * 生成个人档案内容
     */
    private generatePersonalProfileContent(): string {
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);

        let content = `# ${this.baziInfo.name}\n\n`;
        content += `## 基本信息\n\n`;
        content += `- **姓名**: ${this.baziInfo.name}\n`;
        content += `- **性别**: ${this.baziInfo.gender === '1' ? '男' : this.baziInfo.gender === '0' ? '女' : '未知'}\n`;
        content += `- **出生日期**: ${this.baziInfo.solarDate || '未知'}\n`;
        content += `- **八字**: ${this.baziInfo.yearPillar || ''} ${this.baziInfo.monthPillar || ''} ${this.baziInfo.dayPillar || ''} ${this.baziInfo.hourPillar || ''}\n\n`;

        // 添加双链
        if (smartResult.doubleLinks.length > 0) {
            content += `## 相关链接\n\n`;
            smartResult.doubleLinks.forEach(link => {
                content += `- ${link}\n`;
            });
            content += `\n`;
        }

        // 添加标签
        if (smartResult.tags.length > 0) {
            content += `## 标签\n\n`;
            content += smartResult.tags.join(' ') + '\n\n';
        }

        content += `## 八字分析\n\n`;
        content += `\`\`\`bazi\n`;
        content += `date: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || '00:00'}\n`;
        content += `gender: ${this.baziInfo.gender === '1' ? '男' : '女'}\n`;
        content += `name: ${this.baziInfo.name}\n`;
        content += `\`\`\`\n\n`;

        return content;
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
