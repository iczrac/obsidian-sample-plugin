/**
 * 双链和标签全局设置界面
 */

import { App, PluginSettingTab, Setting, Notice, Modal } from 'obsidian';
import BaziPlugin from '../main';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';
import { DEFAULT_DOUBLELINK_TAG_CONFIG } from '../config/DoubleLinkTagConfig';

export class DoubleLinkTagSettingTab extends PluginSettingTab {
    private settingsManager: DoubleLinkTagSettingsManager;

    constructor(app: App, plugin: BaziPlugin, settingsManager: DoubleLinkTagSettingsManager) {
        super(app, plugin);
        this.settingsManager = settingsManager;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // 标题
        containerEl.createEl('h2', { text: '🔗🏷️ 双链和标签设置' });

        // 全局开关
        this.createGlobalToggle(containerEl);

        // 基础设置
        this.createBasicSettings(containerEl);

        // 双链配置
        this.createDoubleLinkSettings(containerEl);

        // 标签配置
        this.createTagSettings(containerEl);

        // 高级设置
        this.createAdvancedSettings(containerEl);

        // 管理功能
        this.createManagementSection(containerEl);
    }

    /**
     * 创建全局开关
     */
    private createGlobalToggle(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();

        new Setting(containerEl)
            .setName('启用双链和标签功能')
            .setDesc('全局开关，控制是否启用双链和标签功能')
            .addToggle(toggle => toggle
                .setValue(settings.globalEnabled)
                .onChange(async (value) => {
                    this.settingsManager.setGlobalEnabled(value);
                    await this.settingsManager.saveSettings();
                    this.display(); // 重新渲染界面
                    new Notice(value ? '✅ 双链标签功能已启用' : '❌ 双链标签功能已禁用');
                })
            );

        if (!settings.globalEnabled) {
            const disabledNotice = containerEl.createDiv({ cls: 'setting-item-description' });
            disabledNotice.style.color = 'var(--text-muted)';
            disabledNotice.style.fontStyle = 'italic';
            disabledNotice.textContent = '💡 功能已禁用，下方设置将不生效';
        }
    }

    /**
     * 创建基础设置
     */
    private createBasicSettings(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();
        if (!settings.globalEnabled) return;

        containerEl.createEl('h3', { text: '📋 基础设置' });

        new Setting(containerEl)
            .setName('自动建议')
            .setDesc('根据八字内容自动建议相关的双链和标签')
            .addToggle(toggle => toggle
                .setValue(settings.advanced.autoSuggest)
                .onChange(async (value) => {
                    this.settingsManager.updateAdvancedSettings({ autoSuggest: value });
                    await this.settingsManager.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('智能检测')
            .setDesc('智能检测内容类型，自动判断使用双链还是标签')
            .addToggle(toggle => toggle
                .setValue(settings.advanced.smartDetection)
                .onChange(async (value) => {
                    this.settingsManager.updateAdvancedSettings({ smartDetection: value });
                    await this.settingsManager.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('显示配置按钮')
            .setDesc('在八字命盘右上角显示双链标签配置按钮')
            .addToggle(toggle => toggle
                .setValue(settings.advanced.showConfigButton)
                .onChange(async (value) => {
                    this.settingsManager.updateAdvancedSettings({ showConfigButton: value });
                    await this.settingsManager.saveSettings();
                })
            );
    }

    /**
     * 创建双链设置
     */
    private createDoubleLinkSettings(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();
        if (!settings.globalEnabled) return;

        containerEl.createEl('h3', { text: '🔗 双链设置（专属名称）' });

        // 人物双链
        this.createCategorySettings(containerEl, '人物相关', 'person', settings.globalConfig.doubleLinks.person);

        // 神煞双链
        this.createCategorySettings(containerEl, '神煞相关', 'shenSha', settings.globalConfig.doubleLinks.shenSha);

        // 地名双链
        this.createCategorySettings(containerEl, '地名相关', 'location', settings.globalConfig.doubleLinks.location);

        // 书籍双链
        this.createCategorySettings(containerEl, '书籍典籍', 'books', settings.globalConfig.doubleLinks.books);

        // 自定义双链
        this.createCustomFieldSettings(containerEl, '自定义双链', 'doubleLinks', 'custom');
    }

    /**
     * 创建标签设置
     */
    private createTagSettings(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();
        if (!settings.globalEnabled) return;

        containerEl.createEl('h3', { text: '🏷️ 标签设置（定性特征）' });

        // 职业标签
        this.createCategorySettings(containerEl, '职业类型', 'profession', settings.globalConfig.tags.profession);

        // 五行强弱标签
        this.createCategorySettings(containerEl, '五行强弱', 'wuxingStrength', settings.globalConfig.tags.wuxingStrength);

        // 格局标签
        this.createCategorySettings(containerEl, '格局类型', 'pattern', settings.globalConfig.tags.pattern);

        // 时代特征标签
        this.createCategorySettings(containerEl, '时代特征', 'era', settings.globalConfig.tags.era);

        // 自定义标签
        this.createCustomFieldSettings(containerEl, '自定义标签', 'tags', 'custom');
    }

    /**
     * 创建分类设置
     */
    private createCategorySettings(containerEl: HTMLElement, name: string, key: string, config: any): void {
        const setting = new Setting(containerEl)
            .setName(name)
            .setDesc(`启用${name}相关的字段识别`)
            .addToggle(toggle => toggle
                .setValue(config.enabled)
                .onChange(async (value) => {
                    config.enabled = value;
                    await this.settingsManager.saveSettings();
                })
            );

        // 显示字段数量
        const fieldCount = config.fields.length;
        setting.descEl.createSpan({
            text: ` (${fieldCount} 个字段)`,
            cls: 'setting-item-description'
        });

        // 添加查看/编辑字段按钮
        setting.addButton(button => button
            .setButtonText('查看字段')
            .onClick(() => {
                this.showFieldsModal(name, config.fields, (newFields) => {
                    config.fields = newFields;
                    this.settingsManager.saveSettings();
                    this.display(); // 刷新界面
                });
            })
        );
    }

    /**
     * 创建自定义字段设置
     */
    private createCustomFieldSettings(containerEl: HTMLElement, name: string, type: 'doubleLinks' | 'tags', category: string): void {
        const settings = this.settingsManager.getGlobalSettings();
        const config = settings.globalConfig[type][category as keyof typeof settings.globalConfig[typeof type]];

        new Setting(containerEl)
            .setName(name)
            .setDesc('添加自定义字段，每行一个')
            .addTextArea(text => text
                .setPlaceholder('输入自定义字段，每行一个')
                .setValue(config.fields.join('\n'))
                .onChange(async (value) => {
                    const fields = value.split('\n').filter(field => field.trim());
                    config.fields = fields;
                    await this.settingsManager.saveSettings();
                })
            );
    }

    /**
     * 创建高级设置
     */
    private createAdvancedSettings(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();
        if (!settings.globalEnabled) return;

        containerEl.createEl('h3', { text: '⚙️ 高级设置' });

        new Setting(containerEl)
            .setName('启用批量操作')
            .setDesc('允许批量管理多个八字的双链标签配置')
            .addToggle(toggle => toggle
                .setValue(settings.advanced.enableBatchOperations)
                .onChange(async (value) => {
                    this.settingsManager.updateAdvancedSettings({ enableBatchOperations: value });
                    await this.settingsManager.saveSettings();
                })
            );
    }

    /**
     * 创建管理功能
     */
    private createManagementSection(containerEl: HTMLElement): void {
        const settings = this.settingsManager.getGlobalSettings();
        if (!settings.globalEnabled) return;

        containerEl.createEl('h3', { text: '🛠️ 管理功能' });

        // 统计信息
        const stats = this.settingsManager.getStatistics();
        const statsDiv = containerEl.createDiv({ cls: 'setting-item' });
        statsDiv.innerHTML = `
            <div class="setting-item-info">
                <div class="setting-item-name">配置统计</div>
                <div class="setting-item-description">
                    • 单独配置的八字: ${stats.totalIndividualConfigs} 个<br>
                    • 已启用的配置: ${stats.enabledIndividualConfigs} 个<br>
                    • 自定义字段: ${stats.totalCustomFields} 个
                </div>
            </div>
        `;

        // 清理过期配置
        new Setting(containerEl)
            .setName('清理过期配置')
            .setDesc('清理30天未使用的单个八字配置')
            .addButton(button => button
                .setButtonText('清理')
                .onClick(async () => {
                    this.settingsManager.cleanupExpiredConfigs();
                    await this.settingsManager.saveSettings();
                    new Notice('✅ 过期配置已清理');
                    this.display();
                })
            );

        // 重置配置
        new Setting(containerEl)
            .setName('重置为默认配置')
            .setDesc('⚠️ 将所有设置重置为默认值，此操作不可撤销')
            .addButton(button => button
                .setButtonText('重置')
                .setWarning()
                .onClick(async () => {
                    if (confirm('确定要重置所有配置吗？此操作不可撤销。')) {
                        this.settingsManager.resetToDefault();
                        await this.settingsManager.saveSettings();
                        new Notice('✅ 配置已重置为默认值');
                        this.display();
                    }
                })
            )
            .addButton(button => button
                .setButtonText('🔄 强制重新加载')
                .onClick(async () => {
                    await this.settingsManager.loadSettings();
                    new Notice('✅ 配置已重新加载');
                    this.display();
                })
            );

        // 导出/导入配置
        new Setting(containerEl)
            .setName('导出配置')
            .setDesc('导出当前配置为JSON文件')
            .addButton(button => button
                .setButtonText('导出')
                .onClick(() => {
                    const config = this.settingsManager.exportConfig();
                    const blob = new Blob([config], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'bazi-doublelink-tag-config.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    new Notice('✅ 配置已导出');
                })
            );
    }

    /**
     * 显示字段编辑模态框
     */
    private showFieldsModal(categoryName: string, fields: string[], onSave: (fields: string[]) => void): void {
        const modal = new Modal(this.app);
        modal.setTitle(`编辑 ${categoryName} 字段`);

        const { contentEl } = modal;
        contentEl.empty();

        // 添加说明
        const description = contentEl.createDiv({ cls: 'setting-item-description' });
        description.innerHTML = `
            <p><strong>当前包含 ${fields.length} 个字段</strong></p>
            <p>您可以查看、编辑或添加新的字段。每行一个字段。</p>
        `;

        // 创建文本区域
        const textarea = contentEl.createEl('textarea', {
            placeholder: '每行一个字段',
            value: fields.join('\n')
        });
        textarea.style.width = '100%';
        textarea.style.height = '300px';
        textarea.style.marginBottom = '16px';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '14px';

        // 添加字段统计
        const statsDiv = contentEl.createDiv({ cls: 'field-stats' });
        const updateStats = () => {
            const currentFields = textarea.value.split('\n').filter(field => field.trim());
            statsDiv.textContent = `当前字段数量: ${currentFields.length}`;
        };

        textarea.addEventListener('input', updateStats);
        updateStats();

        // 按钮容器
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.justifyContent = 'flex-end';

        // 保存按钮
        const saveButton = buttonContainer.createEl('button', {
            text: '保存',
            cls: 'mod-cta'
        });

        saveButton.addEventListener('click', () => {
            const newFields = textarea.value.split('\n')
                .map(field => field.trim())
                .filter(field => field.length > 0);

            onSave(newFields);
            modal.close();
            new Notice(`✅ ${categoryName}字段已更新 (${newFields.length} 个字段)`);
        });

        // 取消按钮
        const cancelButton = buttonContainer.createEl('button', {
            text: '取消',
            cls: 'mod-secondary'
        });

        cancelButton.addEventListener('click', () => {
            modal.close();
        });

        // 重置按钮
        const resetButton = buttonContainer.createEl('button', {
            text: '恢复默认',
            cls: 'mod-warning'
        });

        resetButton.addEventListener('click', () => {
            if (confirm(`确定要恢复 ${categoryName} 的默认字段吗？`)) {
                // 获取默认配置
                let defaultFields: string[] = [];

                // 根据分类名称获取默认字段
                if (categoryName.includes('人物')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.person.fields;
                } else if (categoryName.includes('神煞')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.shenSha.fields;
                } else if (categoryName.includes('地名')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.location.fields;
                } else if (categoryName.includes('书籍')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.books.fields;
                } else if (categoryName.includes('职业')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.profession.fields;
                } else if (categoryName.includes('五行')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.wuxingStrength.fields;
                } else if (categoryName.includes('格局')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.pattern.fields;
                } else if (categoryName.includes('时代')) {
                    defaultFields = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.era.fields;
                }

                textarea.value = defaultFields.join('\n');
                updateStats();
            }
        });

        modal.open();
    }
}
