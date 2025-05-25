import { App, Modal, Setting } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { LinkService } from '../services/LinkService';

/**
 * 八字双链面板 - 显示和管理八字相关的双链
 */
export class BaziLinkPanel extends Modal {
    private baziInfo: BaziInfo;
    private linkService: LinkService;
    private onLinkClick: (link: string) => void;

    constructor(
        app: App, 
        baziInfo: BaziInfo, 
        onLinkClick: (link: string) => void = () => {}
    ) {
        super(app);
        this.baziInfo = baziInfo;
        this.linkService = new LinkService(app);
        this.onLinkClick = onLinkClick;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 标题
        contentEl.createEl('h2', { text: '相关链接' });

        // 生成链接
        const links = this.linkService.generateBaziLinks(this.baziInfo);

        // 人物相关链接
        this.createLinkSection(contentEl, '👤 人物档案', [
            { label: '个人主页', link: links.person.profile },
            { label: '同年生人', link: links.person.birthYear },
            { label: '同性别分析', link: links.person.gender },
            { label: '同生肖分析', link: links.person.zodiac }
        ]);

        // 神煞相关链接
        if (links.shenShaLinks.length > 0) {
            const shenShaItems = links.shenShaLinks.map(item => ({
                label: item.name,
                link: item.link,
                description: `位于${item.position}`
            }));
            this.createLinkSection(contentEl, '🌟 神煞详解', shenShaItems);
        }

        // 格局相关链接
        this.createLinkSection(contentEl, '🎯 格局分析', [
            { label: '主格局', link: links.geJuLinks.mainGeJu },
            { label: '用神分析', link: links.geJuLinks.yongShen },
            { label: '格局详解', link: links.geJuLinks.analysis }
        ]);

        // 五行相关链接
        this.createLinkSection(contentEl, '🔥 五行分析', [
            { label: '日主分析', link: links.wuXingLinks.dayMaster },
            { label: '五行详解', link: links.wuXingLinks.wuXingAnalysis },
            { label: '旺衰分析', link: links.wuXingLinks.strength }
        ]);

        // 时间相关链接
        this.createLinkSection(contentEl, '📅 时间节点', [
            { label: '出生年份', link: links.yearLinks.solarYear },
            { label: '农历年份', link: links.yearLinks.lunarYear },
            { label: '生肖运势', link: links.yearLinks.zodiac }
        ]);

        // 大运相关链接
        if (links.dayunLinks.length > 0) {
            const dayunItems = links.dayunLinks.slice(0, 5).map(item => ({
                label: item.period,
                link: item.ganZhi,
                description: '大运分析'
            }));
            this.createLinkSection(contentEl, '🔄 大运流年', dayunItems);
        }

        // 操作按钮
        this.createActionButtons(contentEl);
    }

    /**
     * 创建链接分组
     */
    private createLinkSection(
        container: HTMLElement, 
        title: string, 
        items: Array<{label: string, link: string, description?: string}>
    ) {
        const section = container.createDiv({ cls: 'bazi-link-section' });
        
        // 分组标题
        section.createEl('h3', { 
            text: title, 
            cls: 'bazi-link-section-title' 
        });

        // 链接列表
        const linkList = section.createDiv({ cls: 'bazi-link-list' });
        
        items.forEach(item => {
            const linkItem = linkList.createDiv({ cls: 'bazi-link-item' });
            
            // 链接按钮
            const linkButton = linkItem.createEl('button', {
                text: item.label,
                cls: 'bazi-link-button'
            });
            
            linkButton.addEventListener('click', () => {
                this.handleLinkClick(item.link);
            });

            // 描述文本
            if (item.description) {
                linkItem.createEl('span', {
                    text: item.description,
                    cls: 'bazi-link-description'
                });
            }
        });
    }

    /**
     * 创建操作按钮
     */
    private createActionButtons(container: HTMLElement) {
        const buttonContainer = container.createDiv({ cls: 'bazi-link-actions' });

        // 创建所有相关笔记
        const createAllButton = buttonContainer.createEl('button', {
            text: '📝 创建所有相关笔记',
            cls: 'mod-cta'
        });
        
        createAllButton.addEventListener('click', async () => {
            await this.linkService.createRelatedNotes(this.baziInfo);
            await this.linkService.addBacklinks(this.baziInfo);
            this.close();
        });

        // 仅添加反向链接
        const addBacklinksButton = buttonContainer.createEl('button', {
            text: '🔗 添加反向链接',
            cls: 'mod-secondary'
        });
        
        addBacklinksButton.addEventListener('click', async () => {
            await this.linkService.addBacklinks(this.baziInfo);
            this.close();
        });

        // 关闭按钮
        const closeButton = buttonContainer.createEl('button', {
            text: '关闭',
            cls: 'mod-secondary'
        });
        
        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * 处理链接点击
     */
    private handleLinkClick(link: string) {
        // 移除双链标记
        const cleanLink = link.replace(/\[\[|\]\]/g, '');
        
        // 调用回调函数
        this.onLinkClick(cleanLink);
        
        // 在Obsidian中打开链接
        this.app.workspace.openLinkText(cleanLink, '');
        
        // 关闭面板
        this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * 八字链接工具栏组件
 */
export class BaziLinkToolbar {
    private container: HTMLElement;
    private baziInfo: BaziInfo;
    private app: App;

    constructor(container: HTMLElement, baziInfo: BaziInfo, app: App) {
        this.container = container;
        this.baziInfo = baziInfo;
        this.app = app;
        this.render();
    }

    private render() {
        const toolbar = this.container.createDiv({ cls: 'bazi-link-toolbar' });

        // 快速链接按钮
        const quickLinksButton = toolbar.createEl('button', {
            text: '🔗',
            cls: 'bazi-toolbar-button',
            attr: { 'aria-label': '显示相关链接' }
        });

        quickLinksButton.addEventListener('click', () => {
            new BaziLinkPanel(this.app, this.baziInfo, (link) => {
                console.log('打开链接:', link);
            }).open();
        });

        // 创建笔记按钮
        const createNotesButton = toolbar.createEl('button', {
            text: '📝',
            cls: 'bazi-toolbar-button',
            attr: { 'aria-label': '创建相关笔记' }
        });

        createNotesButton.addEventListener('click', async () => {
            const linkService = new LinkService(this.app);
            await linkService.createRelatedNotes(this.baziInfo);
            await linkService.addBacklinks(this.baziInfo);
        });

        // 人物档案按钮
        if (this.baziInfo.name) {
            const profileButton = toolbar.createEl('button', {
                text: '👤',
                cls: 'bazi-toolbar-button',
                attr: { 'aria-label': '打开人物档案' }
            });

            profileButton.addEventListener('click', () => {
                this.app.workspace.openLinkText(`${this.baziInfo.name}`, '');
            });
        }
    }
}

/**
 * 在八字表格中添加可点击链接
 */
export class BaziTableEnhancer {
    static enhanceTable(table: HTMLTableElement, baziInfo: BaziInfo, app: App) {
        // 为神煞添加链接
        const cells = table.querySelectorAll('td');
        cells.forEach(cell => {
            const text = cell.textContent?.trim();
            if (text && this.isShenShaName(text)) {
                this.makeClickableLink(cell as HTMLElement, `${text}详解`, app);
            }
        });

        // 为天干地支添加链接
        this.enhanceTianGanDiZhi(table, app);
    }

    private static isShenShaName(text: string): boolean {
        const shenShaNames = [
            '天乙贵人', '文昌', '文曲', '华盖', '禄神', '桃花',
            '孤辰', '寡宿', '驿马', '将星', '金神', '天德',
            '羊刃', '天空', '地劫', '天刑', '天哭', '天虚'
        ];
        return shenShaNames.includes(text);
    }

    private static makeClickableLink(element: HTMLElement, linkText: string, app: App) {
        element.style.cursor = 'pointer';
        element.style.color = 'var(--link-color)';
        element.style.textDecoration = 'underline';
        
        element.addEventListener('click', (e) => {
            e.preventDefault();
            app.workspace.openLinkText(linkText, '');
        });
    }

    private static enhanceTianGanDiZhi(table: HTMLTableElement, app: App) {
        // 为天干地支添加悬停提示和点击链接
        const tianGanCells = table.querySelectorAll('.bazi-stem-row td');
        const diZhiCells = table.querySelectorAll('.bazi-branch-row td');

        tianGanCells.forEach(cell => {
            const text = cell.textContent?.trim();
            if (text && text.length === 1) {
                this.makeClickableLink(cell as HTMLElement, `${text}天干详解`, app);
            }
        });

        diZhiCells.forEach(cell => {
            const text = cell.textContent?.trim();
            if (text && text.length === 1) {
                this.makeClickableLink(cell as HTMLElement, `${text}地支详解`, app);
            }
        });
    }
}
