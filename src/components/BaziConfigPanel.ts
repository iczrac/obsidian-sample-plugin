/**
 * 单个八字的双链标签配置面板
 */

import { App, Modal, Setting, Notice } from 'obsidian';
import { BaziInfo } from '../types/BaziInfo';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';
import { DoubleLinkTagConfig } from '../config/DoubleLinkTagConfig';

export class BaziConfigPanel extends Modal {
    private baziInfo: BaziInfo;
    private settingsManager: DoubleLinkTagSettingsManager;
    private baziId: string;
    private onConfigChanged: () => void;

    constructor(
        app: App,
        baziInfo: BaziInfo,
        settingsManager: DoubleLinkTagSettingsManager,
        onConfigChanged: () => void = () => {}
    ) {
        super(app);
        this.baziInfo = baziInfo;
        this.settingsManager = settingsManager;
        this.baziId = settingsManager.generateBaziId(baziInfo);
        this.onConfigChanged = onConfigChanged;
        this.setTitle(`⚙️ ${baziInfo.name || '八字'} 双链标签配置`);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 添加说明
        this.createDescription(contentEl);

        // 创建配置开关
        this.createToggleSection(contentEl);

        // 创建配置内容
        this.createConfigSection(contentEl);

        // 创建操作按钮
        this.createActionButtons(contentEl);
    }

    /**
     * 创建说明区域
     */
    private createDescription(container: HTMLElement) {
        const description = container.createDiv({ cls: 'bazi-config-description' });
        description.innerHTML = `
            <div style="background: var(--background-secondary); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; color: var(--text-accent);">💡 配置说明</h3>
                <p style="margin: 0; font-size: 0.9em; line-height: 1.4;">
                    • <strong>独立配置</strong>：为这个八字单独设置双链和标签规则<br>
                    • <strong>优先级</strong>：单独配置 > 全局配置 > 默认配置<br>
                    • <strong>继承关系</strong>：未设置的项目将继承全局配置
                </p>
            </div>
        `;
    }

    /**
     * 创建开关区域
     */
    private createToggleSection(container: HTMLElement) {
        const globalSettings = this.settingsManager.getGlobalSettings();
        const individualConfig = this.settingsManager.getIndividualConfig(this.baziId);

        // 全局状态提示
        if (!globalSettings.globalEnabled) {
            const globalDisabledNotice = container.createDiv({ cls: 'bazi-config-notice' });
            globalDisabledNotice.innerHTML = `
                <div style="background: var(--background-modifier-error); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                    <p style="margin: 0; color: var(--text-error);">
                        ⚠️ 全局双链标签功能已禁用，请先在插件设置中启用
                    </p>
                </div>
            `;
            return;
        }

        // 单独配置开关
        new Setting(container)
            .setName('启用单独配置')
            .setDesc('为这个八字启用独立的双链标签配置')
            .addToggle(toggle => toggle
                .setValue(individualConfig?.enabled || false)
                .onChange(async (value) => {
                    this.settingsManager.setIndividualConfig(this.baziId, value, individualConfig?.config || {});
                    await this.settingsManager.saveSettings();
                    this.onConfigChanged();
                    this.onOpen(); // 重新渲染
                    new Notice(value ? '✅ 已启用单独配置' : '❌ 已禁用单独配置');
                })
            );
    }

    /**
     * 创建配置内容区域
     */
    private createConfigSection(container: HTMLElement) {
        const globalSettings = this.settingsManager.getGlobalSettings();
        const individualConfig = this.settingsManager.getIndividualConfig(this.baziId);

        // 如果全局禁用或单独配置禁用，不显示配置内容
        if (!globalSettings.globalEnabled || !individualConfig?.enabled) {
            return;
        }

        // 获取有效配置
        const effectiveConfig = this.settingsManager.getEffectiveConfig(this.baziId);

        container.createEl('h3', { text: '🔗 双链配置' });
        this.createDoubleLinkConfig(container, effectiveConfig, individualConfig.config);

        container.createEl('h3', { text: '🏷️ 标签配置' });
        this.createTagConfig(container, effectiveConfig, individualConfig.config);
    }

    /**
     * 创建双链配置
     */
    private createDoubleLinkConfig(container: HTMLElement, effectiveConfig: DoubleLinkTagConfig, individualConfig: Partial<DoubleLinkTagConfig>) {
        const categories = [
            { key: 'person', name: '人物相关' },
            { key: 'shenSha', name: '神煞相关' },
            { key: 'location', name: '地名相关' },
            { key: 'books', name: '书籍典籍' }
        ];

        categories.forEach(category => {
            const config = effectiveConfig.doubleLinks[category.key as keyof typeof effectiveConfig.doubleLinks];
            const isCustomized = individualConfig.doubleLinks?.[category.key as keyof typeof individualConfig.doubleLinks]?.enabled !== undefined;

            new Setting(container)
                .setName(category.name)
                .setDesc(`${config.fields.length} 个字段 ${isCustomized ? '(已自定义)' : '(继承全局)'}`)
                .addToggle(toggle => toggle
                    .setValue(config.enabled)
                    .onChange(async (value) => {
                        await this.updateIndividualConfig('doubleLinks', category.key, { enabled: value });
                    })
                )
                .addButton(button => button
                    .setButtonText('编辑字段')
                    .onClick(() => {
                        this.openFieldEditor('双链', category.name, config.fields, (newFields) => {
                            this.updateIndividualConfig('doubleLinks', category.key, { fields: newFields });
                        });
                    })
                );
        });
    }

    /**
     * 创建标签配置
     */
    private createTagConfig(container: HTMLElement, effectiveConfig: DoubleLinkTagConfig, individualConfig: Partial<DoubleLinkTagConfig>) {
        const categories = [
            { key: 'profession', name: '职业类型' },
            { key: 'wuxingStrength', name: '五行强弱' },
            { key: 'pattern', name: '格局类型' },
            { key: 'era', name: '时代特征' }
        ];

        categories.forEach(category => {
            const config = effectiveConfig.tags[category.key as keyof typeof effectiveConfig.tags];
            const isCustomized = individualConfig.tags?.[category.key as keyof typeof individualConfig.tags]?.enabled !== undefined;

            new Setting(container)
                .setName(category.name)
                .setDesc(`${config.fields.length} 个字段 ${isCustomized ? '(已自定义)' : '(继承全局)'}`)
                .addToggle(toggle => toggle
                    .setValue(config.enabled)
                    .onChange(async (value) => {
                        await this.updateIndividualConfig('tags', category.key, { enabled: value });
                    })
                )
                .addButton(button => button
                    .setButtonText('编辑字段')
                    .onClick(() => {
                        this.openFieldEditor('标签', category.name, config.fields, (newFields) => {
                            this.updateIndividualConfig('tags', category.key, { fields: newFields });
                        });
                    })
                );
        });
    }

    /**
     * 创建操作按钮
     */
    private createActionButtons(container: HTMLElement) {
        const buttonContainer = container.createDiv({ cls: 'bazi-config-actions' });

        // 预览配置效果
        const previewButton = buttonContainer.createEl('button', {
            text: '👁️ 预览效果',
            cls: 'mod-secondary bazi-config-button'
        });

        previewButton.addEventListener('click', () => {
            this.previewConfig();
        });

        // 重置为全局配置
        const resetButton = buttonContainer.createEl('button', {
            text: '🔄 重置为全局配置',
            cls: 'mod-secondary bazi-config-button'
        });

        resetButton.addEventListener('click', () => {
            if (confirm('确定要重置为全局配置吗？')) {
                this.settingsManager.removeIndividualConfig(this.baziId);
                this.settingsManager.saveSettings();
                this.onConfigChanged();
                new Notice('✅ 已重置为全局配置');
                this.close();
            }
        });

        // 关闭按钮
        const closeButton = buttonContainer.createEl('button', {
            text: '关闭',
            cls: 'mod-secondary bazi-config-button'
        });

        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * 更新单独配置
     */
    private async updateIndividualConfig(type: 'doubleLinks' | 'tags', category: string, update: any) {
        const currentConfig = this.settingsManager.getIndividualConfig(this.baziId);
        const config = currentConfig?.config || {};

        if (!config[type]) {
            config[type] = {} as any;
        }

        if (!config[type]![category]) {
            config[type]![category] = {} as any;
        }

        config[type]![category] = { ...config[type]![category], ...update };

        this.settingsManager.setIndividualConfig(this.baziId, true, config);
        await this.settingsManager.saveSettings();
        this.onConfigChanged();
        this.onOpen(); // 重新渲染
    }

    /**
     * 打开字段编辑器
     */
    private openFieldEditor(type: string, categoryName: string, currentFields: string[], onSave: (fields: string[]) => void) {
        const modal = new Modal(this.app);
        modal.setTitle(`编辑${type} - ${categoryName}`);

        const { contentEl } = modal;
        contentEl.empty();

        const textarea = contentEl.createEl('textarea', {
            placeholder: '每行一个字段',
            value: currentFields.join('\n')
        });
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.style.marginBottom = '16px';

        const buttonContainer = contentEl.createDiv();

        const saveButton = buttonContainer.createEl('button', {
            text: '保存',
            cls: 'mod-cta'
        });

        saveButton.addEventListener('click', () => {
            const fields = textarea.value.split('\n').filter(field => field.trim());
            onSave(fields);
            modal.close();
            new Notice(`✅ ${categoryName}字段已更新`);
        });

        const cancelButton = buttonContainer.createEl('button', {
            text: '取消',
            cls: 'mod-secondary'
        });

        cancelButton.addEventListener('click', () => {
            modal.close();
        });

        modal.open();
    }

    /**
     * 预览配置效果
     */
    private previewConfig() {
        const effectiveConfig = this.settingsManager.getEffectiveConfig(this.baziId);

        // 创建预览模态框
        const previewModal = new Modal(this.app);
        previewModal.setTitle('配置预览');

        const { contentEl } = previewModal;
        contentEl.empty();

        // 显示有效配置的摘要
        const summary = contentEl.createDiv();
        summary.innerHTML = `
            <h3>当前配置摘要</h3>
            <p><strong>双链类别：</strong></p>
            <ul>
                ${Object.entries(effectiveConfig.doubleLinks).map(([key, config]) =>
                    `<li>${key}: ${config.enabled ? '✅' : '❌'} (${config.fields.length} 个字段)</li>`
                ).join('')}
            </ul>
            <p><strong>标签类别：</strong></p>
            <ul>
                ${Object.entries(effectiveConfig.tags).map(([key, config]) =>
                    `<li>${key}: ${config.enabled ? '✅' : '❌'} (${config.fields.length} 个字段)</li>`
                ).join('')}
            </ul>
        `;

        previewModal.open();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
