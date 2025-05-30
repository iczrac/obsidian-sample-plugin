import { App, Modal, Setting, Notice } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { LinkService } from '../services/LinkService';
import { DoubleLinkTagConfigManager } from '../config/DoubleLinkTagConfig';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';
import { BaziConfigPanel } from './BaziConfigPanel';

/**
 * 八字双链面板 - 显示和管理八字相关的双链
 * 重新设计为更实用、更贴合实际使用的版本
 */
export class BaziLinkPanel extends Modal {
    private baziInfo: BaziInfo;
    private linkService: LinkService;
    private settingsManager: DoubleLinkTagSettingsManager;
    private baziId: string;
    private onLinkClick: (link: string) => void;

    constructor(
        app: App,
        baziInfo: BaziInfo,
        settingsManager: DoubleLinkTagSettingsManager,
        onLinkClick: (link: string) => void = () => {}
    ) {
        super(app);
        this.baziInfo = baziInfo;
        this.settingsManager = settingsManager;
        this.linkService = new LinkService(app, settingsManager);
        this.baziId = settingsManager.generateBaziId(baziInfo);
        this.onLinkClick = onLinkClick;
        this.setTitle('🔗 八字相关链接');
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 添加使用说明
        this.createUsageGuide(contentEl);

        // 创建智能分类的双链和标签
        this.createSmartLinksAndTags(contentEl);

        // 创建快速操作区域
        this.createQuickActions(contentEl);
    }

    /**
     * 创建使用说明
     */
    private createUsageGuide(container: HTMLElement) {
        const guide = container.createDiv({ cls: 'bazi-link-guide' });
        guide.innerHTML = `
            <div style="background: var(--background-secondary); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; color: var(--text-accent);">💡 智能双链和标签说明</h3>
                <p style="margin: 0; font-size: 0.9em; line-height: 1.4;">
                    • <strong>双链 [[]]</strong>：用于专属名称（人名、神煞名等）<br>
                    • <strong>标签 #</strong>：用于定性类术语（职业、特征、强弱等）<br>
                    • <strong>智能分类</strong>：系统自动判断使用双链还是标签
                </p>
            </div>
        `;
    }

    /**
     * 创建智能分类的双链和标签
     */
    private createSmartLinksAndTags(container: HTMLElement) {
        // 检查全局是否启用
        const globalSettings = this.settingsManager.getGlobalSettings();
        if (!globalSettings.globalEnabled) {
            const disabledSection = container.createDiv({ cls: 'bazi-disabled-section' });
            disabledSection.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <p>🔒 双链标签功能已禁用</p>
                    <p style="font-size: 0.8em;">请在插件设置中启用此功能</p>
                </div>
            `;
            return;
        }

        // 获取智能生成的双链和标签（使用baziId获取有效配置）
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo, this.baziId);

        // 1. 神煞双链部分
        const shenShaLinks = this.extractShenShaLinks();
        if (shenShaLinks.length > 0) {
            this.createPrimaryLinkSection(container, '🌟 神煞', shenShaLinks);
        }

        // 2. 神煞组合双链部分
        const shenShaComboLinks = this.extractShenShaComboLinks();
        if (shenShaComboLinks.length > 0) {
            this.createPrimaryLinkSection(container, '🔮 神煞组合', shenShaComboLinks);
        }

        // 3. 格局双链部分
        const geJuLinks = this.extractGeJuLinks();
        if (geJuLinks.length > 0) {
            this.createPrimaryLinkSection(container, '⚖️ 格局', geJuLinks);
        }

        // 4. 五行强弱标签部分
        const wuXingTags = this.extractWuXingStrengthTags();
        if (wuXingTags.length > 0) {
            this.createTagSection(container, '🏷️ 五行强弱', wuXingTags);
        }

        // 5. 时代特征标签部分
        const eraTags = this.extractEraTags();
        if (eraTags.length > 0) {
            this.createTagSection(container, '🏷️ 时代特征', eraTags);
        }

        // 6. 其他双链和标签
        const otherLinks = smartResult.doubleLinks.filter(link =>
            !this.isShenShaLink(link) && !this.isGeJuLink(link)
        );
        if (otherLinks.length > 0) {
            this.createPrimaryLinkSection(container, '🔗 其他链接',
                otherLinks.map(link => ({
                    label: link.replace(/\[\[|\]\]/g, ''),
                    link: link,
                    description: '点击创建或打开专属页面',
                    isPrimary: link.includes(this.baziInfo.name || '')
                }))
            );
        }

        const otherTags = smartResult.tags.filter(tag =>
            !this.isWuXingTag(tag) && !this.isEraTag(tag)
        );
        if (otherTags.length > 0) {
            this.createTagSection(container, '🏷️ 其他标签', otherTags);
        }

        // 如果没有内容，显示提示
        if (shenShaLinks.length === 0 && shenShaComboLinks.length === 0 &&
            geJuLinks.length === 0 && wuXingTags.length === 0 &&
            eraTags.length === 0 && otherLinks.length === 0 && otherTags.length === 0) {
            const emptySection = container.createDiv({ cls: 'bazi-empty-section' });
            emptySection.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <p>暂无可用的双链或标签</p>
                    <p style="font-size: 0.8em;">请确保八字信息完整，或在设置中配置自定义字段</p>
                </div>
            `;
        }

        // 添加配置提示
        this.createConfigHint(container);
    }
    /**
     * 提取神煞双链
     */
    private extractShenShaLinks(): Array<{label: string, link: string, description: string}> {
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

        // 去重并转换为链接格式
        const uniqueShenSha = [...new Set(shenShaList)];
        return uniqueShenSha.map(shenSha => ({
            label: shenSha,
            link: `[[${shenSha}]]`,
            description: `${shenSha}的含义和影响`
        }));
    }

    /**
     * 提取神煞组合双链
     */
    private extractShenShaComboLinks(): Array<{label: string, link: string, description: string}> {
        const combos: Array<{label: string, link: string, description: string}> = [];

        // 获取所有神煞
        const allShenSha = this.getAllShenShaNames();

        // 生成常见神煞组合
        const commonCombos = [
            { names: ['天乙贵人', '文昌'], combo: '贵人文昌组合', desc: '智慧与贵人相助的组合' },
            { names: ['桃花', '咸池'], combo: '桃花咸池组合', desc: '感情丰富的组合' },
            { names: ['华盖', '文昌'], combo: '华盖文昌组合', desc: '艺术才华的组合' },
            { names: ['羊刃', '七杀'], combo: '羊刃七杀组合', desc: '刚强果断的组合' },
            { names: ['天德', '月德'], combo: '天月德组合', desc: '德行高尚的组合' },
            { names: ['驿马', '将星'], combo: '驿马将星组合', desc: '奔波成就的组合' }
        ];

        commonCombos.forEach(combo => {
            const hasAllShenSha = combo.names.every(name => allShenSha.includes(name));
            if (hasAllShenSha) {
                combos.push({
                    label: combo.combo,
                    link: `[[${combo.combo}]]`,
                    description: combo.desc
                });
            }
        });

        return combos;
    }

    /**
     * 提取格局双链
     */
    private extractGeJuLinks(): Array<{label: string, link: string, description: string}> {
        const geJuList: string[] = [];

        // 从八字信息中提取格局
        if (this.baziInfo.geJu) {
            geJuList.push(this.baziInfo.geJu);
        }

        // 可以添加更多格局提取逻辑
        if ((this.baziInfo as any).pattern) {
            geJuList.push((this.baziInfo as any).pattern);
        }

        // 去重并转换为链接格式
        const uniqueGeJu = [...new Set(geJuList)];
        return uniqueGeJu.map(geJu => ({
            label: geJu,
            link: `[[${geJu}]]`,
            description: `${geJu}的特征和运势`
        }));
    }

    /**
     * 提取五行强弱标签
     */
    private extractWuXingStrengthTags(): string[] {
        const tags: string[] = [];

        // 日主强弱
        if (this.baziInfo.dayStem && this.baziInfo.riZhuStrength) {
            const wuXing = this.getStemWuXing(this.baziInfo.dayStem);
            tags.push(`#${this.baziInfo.dayStem}${wuXing}日主${this.baziInfo.riZhuStrength}`);
        }

        // 五行强度分析
        if ((this.baziInfo as any).wuXingStrength) {
            Object.entries((this.baziInfo as any).wuXingStrength).forEach(([element, strength]) => {
                if (typeof strength === 'string') {
                    tags.push(`#${element}${strength}`);
                }
            });
        }

        // 用神忌神
        if ((this.baziInfo as any).yongShen) {
            tags.push(`#用神${(this.baziInfo as any).yongShen}`);
        }
        if ((this.baziInfo as any).jiShen) {
            tags.push(`#忌神${(this.baziInfo as any).jiShen}`);
        }

        return tags;
    }

    /**
     * 提取时代特征标签
     */
    private extractEraTags(): string[] {
        const tags: string[] = [];

        if (this.baziInfo.solarDate) {
            const year = parseInt(this.baziInfo.solarDate.split('-')[0]);

            // 年代标签
            const decade = Math.floor(year / 10) * 10;
            tags.push(`#${decade}年代`);

            // 世纪标签
            const century = Math.floor(year / 100) + 1;
            tags.push(`#${century}世纪`);

            // 年代特征
            if (year >= 1950 && year <= 1960) tags.push('#50后');
            else if (year >= 1960 && year <= 1970) tags.push('#60后');
            else if (year >= 1970 && year <= 1980) tags.push('#70后');
            else if (year >= 1980 && year <= 1990) tags.push('#80后');
            else if (year >= 1990 && year <= 2000) tags.push('#90后');
            else if (year >= 2000 && year <= 2010) tags.push('#00后');
            else if (year >= 2010 && year <= 2020) tags.push('#10后');

            // 朝代识别（古代）
            if (year < 1912) {
                if (year >= 1644) tags.push('#清朝');
                else if (year >= 1368) tags.push('#明朝');
                else if (year >= 1271) tags.push('#元朝');
                else if (year >= 960) tags.push('#宋朝');
                else if (year >= 618) tags.push('#唐朝');
            } else if (year >= 1912 && year < 1949) {
                tags.push('#民国');
            } else if (year >= 1949) {
                tags.push('#新中国');
            }
        }

        // 生肖标签
        if (this.baziInfo.yearShengXiao) {
            tags.push(`#${this.baziInfo.yearShengXiao}年`);
        }

        // 性别标签
        if (this.baziInfo.gender) {
            const genderText = this.baziInfo.gender === '1' ? '男性' : this.baziInfo.gender === '0' ? '女性' : this.baziInfo.gender;
            tags.push(`#${genderText}`);
        }

        return tags;
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
     * 判断是否为神煞链接
     */
    private isShenShaLink(link: string): boolean {
        const shenShaNames = this.getAllShenShaNames();
        return shenShaNames.some(name => link.includes(name));
    }

    /**
     * 判断是否为格局链接
     */
    private isGeJuLink(link: string): boolean {
        const geJuPatterns = ['格', '局', '从', '化气', '专旺', '润下', '炎上', '稼穑', '曲直', '从革'];
        return geJuPatterns.some(pattern => link.includes(pattern));
    }

    /**
     * 判断是否为五行强弱标签
     */
    private isWuXingTag(tag: string): boolean {
        const wuXingPatterns = ['日主', '用神', '忌神', '木', '火', '土', '金', '水'];
        return wuXingPatterns.some(pattern => tag.includes(pattern));
    }

    /**
     * 判断是否为时代特征标签
     */
    private isEraTag(tag: string): boolean {
        const eraPatterns = ['年代', '世纪', '后', '朝', '民国', '新中国', '年', '性'];
        return eraPatterns.some(pattern => tag.includes(pattern));
    }

    /**
     * 创建配置提示
     */
    private createConfigHint(container: HTMLElement) {
        const individualConfig = this.settingsManager.getIndividualConfig(this.baziId);
        const hintSection = container.createDiv({ cls: 'bazi-config-hint' });

        if (individualConfig?.enabled) {
            hintSection.innerHTML = `
                <div style="background: var(--background-modifier-success); padding: 8px; border-radius: 4px; margin-top: 12px;">
                    <p style="margin: 0; font-size: 0.8em; color: var(--text-success);">
                        ✅ 此八字使用了单独配置
                    </p>
                </div>
            `;
        } else {
            hintSection.innerHTML = `
                <div style="background: var(--background-secondary); padding: 8px; border-radius: 4px; margin-top: 12px;">
                    <p style="margin: 0; font-size: 0.8em; color: var(--text-muted);">
                        💡 使用全局配置，可在右上角⚙️按钮中设置单独配置
                    </p>
                </div>
            `;
        }
    }

    /**
     * 创建标签展示区域
     */
    private createTagSection(container: HTMLElement, title: string, tags: string[]) {
        const section = container.createDiv({ cls: 'bazi-tag-section' });

        // 分组标题
        section.createEl('h3', {
            text: title,
            cls: 'bazi-tag-section-title'
        });

        // 标签容器
        const tagContainer = section.createDiv({ cls: 'bazi-tag-container' });

        tags.forEach(tag => {
            const tagElement = tagContainer.createEl('span', {
                text: tag,
                cls: 'bazi-tag-item'
            });

            // 添加点击事件，复制标签到剪贴板
            tagElement.addEventListener('click', () => {
                navigator.clipboard.writeText(tag).then(() => {
                    new Notice(`已复制标签: ${tag}`);
                });
            });

            // 添加hover提示
            tagElement.setAttribute('title', `点击复制标签: ${tag}`);
        });

        // 添加批量复制按钮
        const copyAllButton = section.createEl('button', {
            text: '📋 复制所有标签',
            cls: 'bazi-copy-tags-button'
        });

        copyAllButton.addEventListener('click', () => {
            const allTags = tags.join(' ');
            navigator.clipboard.writeText(allTags).then(() => {
                new Notice(`已复制 ${tags.length} 个标签`);
            });
        });
    }

    /**
     * 创建核心实用链接
     */
    private createCoreLinks(container: HTMLElement) {
        const name = this.baziInfo.name || '未命名';
        const birthYear = this.baziInfo.solarDate?.split('-')[0] || '未知年份';

        // 个人档案链接
        this.createPrimaryLinkSection(container, '👤 个人档案', [
            {
                label: `${name}`,
                link: `[[${name}]]`,
                description: '个人主页 - 包含完整八字信息',
                isPrimary: true
            },
            {
                label: `${name}的八字分析`,
                link: `[[${name}的八字分析]]`,
                description: '详细命理分析'
            }
        ]);

        // 神煞链接（只显示重要的）
        const importantShenSha = this.getImportantShenSha();
        if (importantShenSha.length > 0) {
            this.createPrimaryLinkSection(container, '🌟 重要神煞', importantShenSha);
        }

        // 年份和生肖链接
        this.createPrimaryLinkSection(container, '📅 时间特征', [
            {
                label: `${birthYear}年生人`,
                link: `[[${birthYear}年生人]]`,
                description: '同年份生人特征分析'
            },
            {
                label: `${this.baziInfo.yearShengXiao || '未知'}年运势`,
                link: `[[${this.baziInfo.yearShengXiao || '未知'}年运势]]`,
                description: '生肖运势分析'
            }
        ]);
    }

    /**
     * 获取重要神煞（最多显示3个）
     */
    private getImportantShenSha(): Array<{label: string, link: string, description: string}> {
        // 这里应该从baziInfo中获取实际的神煞信息
        // 暂时返回示例数据
        const importantShenShaNames = ['天乙贵人', '文昌', '桃花', '华盖', '禄神'];

        return importantShenShaNames.slice(0, 3).map(name => ({
            label: `${name}详解`,
            link: `[[${name}详解]]`,
            description: `${name}的含义和影响`
        }));
    }

    /**
     * 创建主要链接分组（新的简洁版本）
     */
    private createPrimaryLinkSection(
        container: HTMLElement,
        title: string,
        items: Array<{label: string, link: string, description?: string, isPrimary?: boolean}>
    ) {
        const section = container.createDiv({ cls: 'bazi-primary-link-section' });

        // 分组标题
        section.createEl('h3', {
            text: title,
            cls: 'bazi-primary-section-title'
        });

        // 链接列表
        const linkList = section.createDiv({ cls: 'bazi-primary-link-list' });

        items.forEach(item => {
            const linkItem = linkList.createDiv({
                cls: `bazi-primary-link-item ${item.isPrimary ? 'primary' : ''}`
            });

            // 链接按钮
            const linkButton = linkItem.createEl('button', {
                text: item.label,
                cls: `bazi-primary-link-button ${item.isPrimary ? 'mod-cta' : 'mod-secondary'}`
            });

            linkButton.addEventListener('click', () => {
                this.handleLinkClick(item.link);
            });

            // 描述文本
            if (item.description) {
                linkItem.createEl('div', {
                    text: item.description,
                    cls: 'bazi-primary-link-description'
                });
            }
        });
    }

    /**
     * 创建快速操作区域
     */
    private createQuickActions(container: HTMLElement) {
        const actionsSection = container.createDiv({ cls: 'bazi-quick-actions' });

        // 标题
        actionsSection.createEl('h3', {
            text: '🚀 快速操作',
            cls: 'bazi-actions-title'
        });

        const buttonContainer = actionsSection.createDiv({ cls: 'bazi-actions-buttons' });

        // 创建个人档案按钮
        const createProfileButton = buttonContainer.createEl('button', {
            text: `📝 创建 ${this.baziInfo.name || '个人'} 档案`,
            cls: 'mod-cta bazi-action-button'
        });

        createProfileButton.addEventListener('click', async () => {
            await this.createPersonalProfile();
        });



        // 关闭按钮
        const closeButton = buttonContainer.createEl('button', {
            text: '关闭',
            cls: 'mod-secondary bazi-action-button'
        });

        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * 创建个人档案
     */
    private async createPersonalProfile() {
        try {
            const name = this.baziInfo.name || '未命名';
            const fileName = `${name}.md`;
            const existingFile = this.app.vault.getAbstractFileByPath(fileName);

            if (!existingFile) {
                // 使用新的档案格式创建
                const content = this.generateNewPersonalProfileContent();
                await this.app.vault.create(fileName, content);
                new Notice(`✅ ${name} 的个人档案已创建`);
            } else {
                new Notice(`📄 ${name} 的档案已存在`);
                // 打开现有档案
                await this.app.workspace.openLinkText(fileName, '', false);
            }
            this.close();
        } catch (error) {
            new Notice('❌ 创建个人档案失败');
            console.error('创建个人档案失败:', error);
        }
    }
    /**
     * 生成新的个人档案内容（与BaziLinkToolbar保持一致）
     */
    private generateNewPersonalProfileContent(): string {
        const smartResult = this.linkService.generateSmartLinksAndTags(this.baziInfo);
        const sections: string[] = [];

        // 档案标题
        sections.push(`# ${this.baziInfo.name}`);
        sections.push('');

        // 基本信息区块
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

        // 八字命盘区块
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

        // 神煞分析区块
        sections.push('<!-- 神煞分析区块 开始 -->');
        sections.push('## 🌟 神煞分析');
        sections.push('');

        const shenShaLinks = smartResult.doubleLinks.filter((link: string) =>
            this.isShenShaLink(link)
        );

        if (shenShaLinks.length > 0) {
            sections.push('### 神煞');
            shenShaLinks.forEach((link: string) => {
                sections.push(`- ${link}`);
            });
            sections.push('');

            sections.push('### 神煞组合');
            sections.push('- 待分析...');
            sections.push('');
        } else {
            sections.push('暂无神煞信息');
            sections.push('');
        }

        sections.push('<!-- 神煞分析区块 结束 -->');
        sections.push('');

        // 格局分析区块
        sections.push('<!-- 格局分析区块 开始 -->');
        sections.push('## ⚖️ 格局分析');
        sections.push('');

        if (this.baziInfo.geJu) {
            sections.push('### 主格局');
            sections.push(`- **格局类型**: [[${this.baziInfo.geJu}]]`);
            sections.push(`- **格局特点**: 待分析`);
            sections.push(`- **格局优劣**: 待分析`);
            sections.push('');
        } else {
            sections.push('格局信息待分析');
            sections.push('');
        }

        sections.push('<!-- 格局分析区块 结束 -->');
        sections.push('');

        // 标签系统区块
        sections.push('<!-- 标签系统区块 开始 -->');
        sections.push('## 🏷️ 标签系统');
        sections.push('');

        if (smartResult.tags.length > 0) {
            sections.push('### 全部标签');
            sections.push(smartResult.tags.join(' '));
            sections.push('');
        }

        sections.push('<!-- 标签系统区块 结束 -->');
        sections.push('');

        // 档案信息区块
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

        return sections.join('\n');
    }



    /**
     * 处理链接点击 - 智能创建内容
     */
    private async handleLinkClick(link: string) {
        try {
            // 移除双链标记
            const cleanLink = link.replace(/\[\[|\]\]/g, '');

            console.log('🔗 处理链接点击:', cleanLink);

            // 检查文件是否存在
            const existingFile = this.app.vault.getAbstractFileByPath(`${cleanLink}.md`);

            if (!existingFile) {
                // 文件不存在，智能创建内容
                await this.createSmartContent(cleanLink);
                new Notice(`✅ 已创建 "${cleanLink}" 页面`);
            } else {
                console.log('📄 文件已存在，直接打开');
            }

            // 调用回调函数
            this.onLinkClick(cleanLink);

            // 在Obsidian中打开链接
            this.app.workspace.openLinkText(cleanLink, '');

            // 关闭面板
            this.close();

        } catch (error) {
            console.error('❌ 处理链接点击失败:', error);
            new Notice('❌ 打开链接失败');
        }
    }

    /**
     * 基于标签创建页面内容
     */
    private async createSmartContent(pageName: string) {
        const content = this.generateTagBasedContent(pageName);
        await this.app.vault.create(`${pageName}.md`, content);
        console.log('✅ 基于标签的内容已创建:', pageName);
    }

    /**
     * 根据页面名称生成基于标签的智能内容
     */
    private generateTagBasedContent(pageName: string): string {
        const name = this.baziInfo.name || '未命名';
        const currentDate = new Date().toISOString().split('T')[0];
        const birthYear = this.baziInfo.solarDate?.split('-')[0] || '未知年份';

        // 判断页面类型并生成相应的标签驱动内容
        if (pageName === name) {
            // 个人主页 - 使用多层级标签
            return this.generatePersonalProfileWithTags(pageName);
        } else if (pageName.includes('的八字分析')) {
            // 八字分析页面
            return this.generateBaziAnalysisWithTags(pageName);
        } else if (pageName.includes('详解')) {
            // 神煞详解页面
            const shenShaName = pageName.replace('详解', '');
            return this.generateShenShaDetailWithTags(shenShaName);
        } else if (pageName.includes('年生人')) {
            // 年份生人页面
            const year = pageName.replace('年生人', '');
            return this.generateYearPageWithTags(year);
        } else if (pageName.includes('年运势')) {
            // 生肖运势页面
            const zodiac = pageName.replace('年运势', '');
            return this.generateZodiacPageWithTags(zodiac);
        } else {
            // 通用页面
            return this.generateGenericPageWithTags(pageName);
        }
    }

    /**
     * 生成个人档案页面（基于标签）
     */
    public generatePersonalProfileWithTags(name: string): string {
        const birthYear = this.baziInfo.solarDate?.split('-')[0] || '未知年份';
        const zodiac = this.baziInfo.yearShengXiao || '未知';
        const gender = this.baziInfo.gender || '未知';

        return `# ${name}

## 基本信息
- **出生时间**: ${this.baziInfo.solarDate || '未知'}
- **农历**: ${this.baziInfo.lunarDate || '未知'}
- **性别**: ${gender}
- **生肖**: ${zodiac}

## 八字信息
\`\`\`bazi
date: ${this.baziInfo.solarDate || '1990-01-01 08:00'}
gender: ${gender}
name: ${name}
\`\`\`

## 相关分析
- [[${name}的八字分析]] - 详细命理分析
- [[${name}的大运分析]] - 人生运势分析
- [[${name}的流年运势]] - 年度运势分析

## 关联信息
- 同年生人: [[${birthYear}年生人]]
- 生肖运势: [[${zodiac}年运势]]
- 性别分析: [[${gender}性八字特征]]

## 标签系统
#人物档案 #${gender}性 #${zodiac}年 #${birthYear}年生人 #八字分析

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*
`;
    }

    /**
     * 生成神煞详解页面（基于标签）
     */
    private generateShenShaDetailWithTags(shenShaName: string): string {
        return `# ${shenShaName}详解

## 基本信息
- **神煞类型**: 待补充
- **吉凶性质**: 待补充
- **计算依据**: 待补充
- **影响领域**: 待补充

## 计算方法
<!-- 请补充具体的计算规则和方法 -->

## 作用影响
### 正面影响
- 待补充

### 负面影响
- 待补充

### 化解方法
- 待补充

## 实际案例
<!-- 这里会自动收集相关案例 -->

## 相关神煞
- [[神煞总览]] - 所有神煞汇总
- [[${shenShaName}案例集]] - 相关案例收集

## 标签系统
#神煞详解 #${shenShaName} #命理知识 #八字神煞

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*

> 💡 **使用说明**: 这个页面会自动收集包含"${shenShaName}"的八字案例，您可以在此基础上完善内容。
`;
    }

    /**
     * 生成年份页面（基于标签）
     */
    private generateYearPageWithTags(year: string): string {
        const zodiac = this.baziInfo.yearShengXiao || '未知';

        return `# ${year}年生人

## 年份特征
- **公历年份**: ${year}年
- **生肖**: ${zodiac}
- **天干地支**: 待补充
- **纳音**: 待补充

## 本年生人列表
<!-- 这里会自动收集${year}年出生的人物 -->

## 年份特点
### 性格特征
- 待补充

### 运势特点
- 待补充

### 适合职业
- 待补充

## 相关分析
- [[${zodiac}年运势]] - 生肖运势分析
- [[${year}年大事记]] - 历史事件记录
- [[${year}年命理分析]] - 年份命理特征

## 标签系统
#年份分析 #${year}年 #${zodiac}年 #生人统计 #年份特征

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*

> 💡 **使用说明**: 这个页面会自动收集所有${year}年出生的人物档案，便于进行同年生人的对比分析。
`;
    }

    /**
     * 生成生肖运势页面（基于标签）
     */
    private generateZodiacPageWithTags(zodiac: string): string {
        return `# ${zodiac}年运势

## 生肖特征
- **生肖**: ${zodiac}
- **五行属性**: 待补充
- **性格特点**: 待补充
- **幸运元素**: 待补充

## 运势分析
### 总体运势
- 待补充

### 事业运势
- 待补充

### 财运分析
- 待补充

### 感情运势
- 待补充

### 健康运势
- 待补充

## 相关人物
<!-- 这里会自动收集属${zodiac}的人物 -->

## 生肖配对
### 最佳配对
- 待补充

### 一般配对
- 待补充

### 需要注意的配对
- 待补充

## 相关分析
- [[十二生肖总览]] - 所有生肖特征
- [[${zodiac}年名人录]] - 著名人物
- [[${zodiac}年开运指南]] - 开运建议

## 标签系统
#生肖运势 #${zodiac}年 #十二生肖 #运势分析 #生肖特征

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*

> 💡 **使用说明**: 这个页面会自动收集所有属${zodiac}的人物档案，便于进行生肖特征的统计分析。
`;
    }

    /**
     * 生成八字分析页面（基于标签）
     */
    private generateBaziAnalysisWithTags(pageName: string): string {
        const name = pageName.replace('的八字分析', '');
        const gender = this.baziInfo.gender || '未知';
        const zodiac = this.baziInfo.yearShengXiao || '未知';

        return `# ${pageName}

## 八字基础
\`\`\`bazi
date: ${this.baziInfo.solarDate || '1990-01-01 08:00'}
gender: ${gender}
name: ${name}
style: 3
\`\`\`

## 命理分析
### 日主分析
- **日主**: 待分析
- **旺衰**: 待分析
- **用神**: 待分析
- **忌神**: 待分析

### 格局分析
- **主格局**: 待分析
- **格局特点**: 待分析
- **格局优劣**: 待分析

### 神煞分析
<!-- 这里会显示相关神煞的详细分析 -->

## 大运分析
### 当前大运
- 待分析

### 重要大运
- 待分析

## 流年运势
### 近期流年
- 待分析

### 重要流年
- 待分析

## 人生建议
### 事业发展
- 待补充

### 财运建议
- 待补充

### 感情婚姻
- 待补充

### 健康养生
- 待补充

## 相关链接
- [[${name}]] - 个人主页
- [[${name}的大运分析]] - 大运详解
- [[${name}的流年运势]] - 流年分析

## 标签系统
#八字分析 #命理分析 #${gender}性 #${zodiac}年 #个人命盘

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*

> 💡 **分析说明**: 这是基于八字命盘的详细分析，建议结合实际情况进行参考。
`;
    }

    /**
     * 生成通用页面（基于标签）
     */
    private generateGenericPageWithTags(pageName: string): string {
        return `# ${pageName}

## 页面说明
这是一个由八字命盘插件自动创建的页面。

## 相关信息
- **创建来源**: ${this.baziInfo.name || '八字分析'}
- **关联八字**: ${this.baziInfo.solarDate || '未知'}
- **相关人物**: [[${this.baziInfo.name || '未命名'}]]

## 内容区域
<!-- 请在此添加相关内容 -->

## 相关链接
- [[${this.baziInfo.name || '未命名'}]] - 相关人物
- [[八字知识库]] - 知识总览

## 标签系统
#八字相关 #自动生成 #待完善

---
*创建时间: ${new Date().toISOString().split('T')[0]}*
*来源: 八字命盘插件自动生成*

> 💡 **使用说明**: 这是一个通用页面模板，您可以根据需要添加和修改内容。
`;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


