import { App, PluginSettingTab, Setting, Notice, Plugin, Modal } from 'obsidian';
import { BaziPluginSettings, BaziDisplayStyle } from '../types/PluginTypes';
import { DoubleLinkTagSettingsManager } from '../config/DoubleLinkTagSettings';
import { DEFAULT_DOUBLELINK_TAG_CONFIG } from '../config/DoubleLinkTagConfig';

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: BaziPluginSettings = {
	defaultDisplayStyle: BaziDisplayStyle.COMPLETE, // 默认使用完整专业样式
	debugMode: false, // 调试模式
	autoUpdateCodeBlock: true, // 自动更新代码块
	codeBlockUpdateDelay: 500, // 代码块更新延迟（毫秒）
	baziSect: '2', // 默认使用流派2（晚子时日柱算当天）
	qiYunSect: 1, // 默认使用起运流派1
	showShenSha: {
		siZhu: true, // 默认显示四柱神煞
		daYun: true, // 默认显示大运神煞
		liuNian: true, // 默认显示流年神煞
		xiaoYun: true, // 默认显示小运神煞
		liuYue: true, // 默认显示流月神煞
	}
};

/**
 * 插件设置页面
 */
export class BaziSettingTab extends PluginSettingTab {
	plugin: Plugin & { settings: BaziPluginSettings; saveSettings(): Promise<void> };
	doubleLinkTagSettingsManager: DoubleLinkTagSettingsManager;

	constructor(app: App, plugin: Plugin & { settings: BaziPluginSettings; saveSettings(): Promise<void> }, doubleLinkTagSettingsManager: DoubleLinkTagSettingsManager) {
		super(app, plugin);
		this.plugin = plugin;
		this.doubleLinkTagSettingsManager = doubleLinkTagSettingsManager;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: '八字命盘插件设置'});

		new Setting(containerEl)
			.setName('默认显示样式')
			.setDesc('选择八字命盘的默认显示样式。简洁样式：仅显示八字和基本信息；标准样式：包含大运流年；完整样式：包含所有分析功能')
			.addDropdown(dropdown => {
				dropdown
					.addOption(BaziDisplayStyle.SIMPLE, '简洁样式（仅八字）')
					.addOption(BaziDisplayStyle.STANDARD, '标准样式（含大运流年）')
					.addOption(BaziDisplayStyle.COMPLETE, '完整样式（专业分析）')
					.setValue(this.plugin.settings.defaultDisplayStyle)
					.onChange(async (value) => {
						this.plugin.settings.defaultDisplayStyle = value as BaziDisplayStyle;
						await this.plugin.saveSettings();
						new Notice('默认显示样式已更改为: ' + this.getStyleDisplayName(value as BaziDisplayStyle), 3000);
					});
			});

		new Setting(containerEl)
			.setName('八字流派')
			.setDesc('选择八字计算的流派，流派1认为晚子时日柱算明天，流派2认为晚子时日柱算当天')
			.addDropdown(dropdown => {
				dropdown
					.addOption('1', '流派1 (晚子时日柱算明天)')
					.addOption('2', '流派2 (晚子时日柱算当天)')
					.setValue(this.plugin.settings.baziSect)
					.onChange(async (value) => {
						this.plugin.settings.baziSect = value;
						await this.plugin.saveSettings();
						new Notice('八字流派已更改为: ' + (value === '1' ? '流派1' : '流派2'), 3000);
					});
			});

		new Setting(containerEl)
			.setName('起运流派')
			.setDesc('选择起运计算的流派。流派1：按3天=1年换算，精度到天；流派2：按4320分钟=1年换算，精度到小时')
			.addDropdown(dropdown => {
				dropdown
					.addOption('1', '流派1 (3天=1年，精度到天)')
					.addOption('2', '流派2 (4320分钟=1年，精度到小时)')
					.setValue(this.plugin.settings.qiYunSect.toString())
					.onChange(async (value) => {
						this.plugin.settings.qiYunSect = parseInt(value);
						await this.plugin.saveSettings();
						new Notice('起运流派已更改为: ' + (value === '1' ? '流派1' : '流派2'), 3000);
					});
			});

		// 神煞显示设置
		containerEl.createEl('h3', {text: '神煞显示设置'});

		new Setting(containerEl)
			.setName('显示四柱神煞')
			.setDesc('是否在八字命盘中显示四柱神煞')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.siZhu)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.siZhu = value;
						await this.plugin.saveSettings();
						this.updateAllBaziViews();
					});
			});

		new Setting(containerEl)
			.setName('显示大运神煞')
			.setDesc('是否在八字命盘中显示大运神煞')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.daYun)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.daYun = value;
						await this.plugin.saveSettings();
						this.updateAllBaziViews();
					});
			});

		new Setting(containerEl)
			.setName('显示流年神煞')
			.setDesc('是否在八字命盘中显示流年神煞')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.liuNian)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.liuNian = value;
						await this.plugin.saveSettings();
						this.updateAllBaziViews();
					});
			});

		new Setting(containerEl)
			.setName('显示小运神煞')
			.setDesc('是否在八字命盘中显示小运神煞')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.xiaoYun)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.xiaoYun = value;
						await this.plugin.saveSettings();
						this.updateAllBaziViews();
					});
			});

		new Setting(containerEl)
			.setName('显示流月神煞')
			.setDesc('是否在八字命盘中显示流月神煞')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.liuYue)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.liuYue = value;
						await this.plugin.saveSettings();
						this.updateAllBaziViews();
					});
			});

		new Setting(containerEl)
			.setName('调试模式')
			.setDesc('启用后，会在控制台输出详细的调试信息')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('自动更新代码块')
			.setDesc('启用后，当代码块内容变化时会自动更新渲染')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.autoUpdateCodeBlock)
					.onChange(async (value) => {
						this.plugin.settings.autoUpdateCodeBlock = value;
						await this.plugin.saveSettings();

						// 如果启用了自动更新，需要重新加载插件以注册事件监听器
						if (value) {
							new Notice('已启用自动更新代码块，请重新加载插件以应用更改', 3000);
						}
					});
			});

		new Setting(containerEl)
			.setName('代码块更新延迟')
			.setDesc('代码块内容变化后等待多少毫秒更新渲染（较大的值可以减少频繁更新）')
			.addSlider(slider => {
				slider
					.setLimits(100, 2000, 100)
					.setValue(this.plugin.settings.codeBlockUpdateDelay)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.codeBlockUpdateDelay = value;
						await this.plugin.saveSettings();
					});
			});

		// 添加双链和标签设置
		this.addDoubleLinkTagSettings(containerEl);

		// 添加使用说明（放在设置后面）
		this.addUsageInstructions(containerEl);
	}

	/**
	 * 更新所有八字视图的神煞显示设置
	 */
	private updateAllBaziViews(): void {
		console.log('🎯 开始更新所有八字视图的神煞显示设置');

		// 查找所有交互式八字视图
		const baziViews = document.querySelectorAll('.interactive-bazi-view');
		console.log(`🎯 找到 ${baziViews.length} 个八字视图`);

		baziViews.forEach((viewElement, index) => {
			// 尝试从元素上获取视图实例
			// 这需要在InteractiveBaziView中存储实例引用
			const viewInstance = (viewElement as any).__baziViewInstance;
			if (viewInstance && typeof viewInstance.updateShenShaSettings === 'function') {
				console.log(`🎯 更新第 ${index + 1} 个八字视图的神煞设置`);
				viewInstance.updateShenShaSettings(this.plugin.settings.showShenSha);
			} else {
				console.log(`🎯 第 ${index + 1} 个八字视图没有找到实例或更新方法`);
			}
		});
	}

	/**
	 * 添加双链和标签设置
	 */
	private addDoubleLinkTagSettings(containerEl: HTMLElement): void {
		// 双链和标签设置标题
		containerEl.createEl('h2', {text: '🔗 双链和标签设置'});

		// 全局启用开关
		new Setting(containerEl)
			.setName('启用双链和标签功能')
			.setDesc('全局开关，控制是否启用双链和标签功能')
			.addToggle(toggle => toggle
				.setValue(this.doubleLinkTagSettingsManager.getGlobalSettings().globalEnabled)
				.onChange(async (value) => {
					const settings = this.doubleLinkTagSettingsManager.getGlobalSettings();
					settings.globalEnabled = value;
					await this.doubleLinkTagSettingsManager.saveSettings();
					new Notice(value ? '✅ 双链和标签功能已启用' : '❌ 双链和标签功能已禁用');
				})
			);

		// 基础设置
		containerEl.createEl('h3', {text: '📋 基础设置'});

		const globalConfig = this.doubleLinkTagSettingsManager.getGlobalSettings().globalConfig;

		// 自动建议
		new Setting(containerEl)
			.setName('自动建议')
			.setDesc('根据八字内容自动建议相关的双链和标签')
			.addToggle(toggle => toggle
				.setValue(globalConfig.autoSuggest)
				.onChange(async (value) => {
					globalConfig.autoSuggest = value;
					await this.doubleLinkTagSettingsManager.saveSettings();
				})
			);

		// 智能检测
		new Setting(containerEl)
			.setName('智能检测')
			.setDesc('智能检测八字内容，自动判断使用双链还是标签')
			.addToggle(toggle => toggle
				.setValue(globalConfig.smartDetection)
				.onChange(async (value) => {
					globalConfig.smartDetection = value;
					await this.doubleLinkTagSettingsManager.saveSettings();
				})
			);

		// 显示配置按钮
		new Setting(containerEl)
			.setName('显示配置按钮')
			.setDesc('在八字命盘右上角显示双链标签配置按钮')
			.addToggle(toggle => toggle
				.setValue(globalConfig.showConfigButton)
				.onChange(async (value) => {
					globalConfig.showConfigButton = value;
					await this.doubleLinkTagSettingsManager.saveSettings();
				})
			);

		// 双链设置
		containerEl.createEl('h3', {text: '🔗 双链设置（专属名称）'});

		console.log('🔍 双链配置检查:', {
			shenSha: globalConfig.doubleLinks.shenSha,
			pattern: globalConfig.doubleLinks.pattern,
			location: globalConfig.doubleLinks.location,
			books: globalConfig.doubleLinks.books
		});

		this.createCategorySettings(containerEl, '神煞相关', 'shenSha', globalConfig.doubleLinks.shenSha); // 恢复查看字段按钮
		this.createCategorySettings(containerEl, '格局类型', 'pattern', globalConfig.doubleLinks.pattern); // 恢复查看字段按钮
		this.createCategorySettings(containerEl, '地名相关', 'location', globalConfig.doubleLinks.location);
		this.createCategorySettings(containerEl, '书籍典籍', 'books', globalConfig.doubleLinks.books);

		// 标签设置
		containerEl.createEl('h3', {text: '🏷️ 标签设置（定性特征）'});

		this.createCategorySettings(containerEl, '职业人物', 'profession', globalConfig.tags.profession);
		this.createCategorySettings(containerEl, '五行强弱', 'wuxingStrength', globalConfig.tags.wuxingStrength);
		this.createCategorySettings(containerEl, '时代特征', 'era', globalConfig.tags.era);
		this.createCategorySettings(containerEl, '关系标签', 'relations', globalConfig.tags.relations);

		// 管理功能
		containerEl.createEl('h3', {text: '🛠️ 管理功能'});

		// 重置配置
		new Setting(containerEl)
			.setName('重置为默认配置')
			.setDesc('⚠️ 将所有设置重置为默认值，此操作不可撤销')
			.addButton(button => button
				.setButtonText('重置')
				.setWarning()
				.onClick(async () => {
					if (confirm('确定要重置所有配置吗？此操作不可撤销。')) {
						this.doubleLinkTagSettingsManager.resetToDefault();
						await this.doubleLinkTagSettingsManager.saveSettings();
						new Notice('✅ 配置已重置为默认值');
						this.display();
					}
				})
			)
			.addButton(button => button
				.setButtonText('🔄 强制重新加载')
				.onClick(async () => {
					await this.doubleLinkTagSettingsManager.loadSettings();
					new Notice('✅ 配置已重新加载');
					this.display();
				})
			);
	}

	/**
	 * 创建分类设置
	 */
	private createCategorySettings(containerEl: HTMLElement, name: string, key: string, config: any, showFieldsButton = true): void {
		const setting = new Setting(containerEl)
			.setName(name)
			.setDesc(`启用${name}相关的字段识别`)
			.addToggle(toggle => toggle
				.setValue(config.enabled)
				.onChange(async (value) => {
					config.enabled = value;
					await this.doubleLinkTagSettingsManager.saveSettings();
				})
			);

		// 获取正确的字段数量（从默认配置获取）
		let defaultFieldCount = 0;
		if (name.includes('神煞')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.shenSha.fields.length;
		} else if (name.includes('格局')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.pattern.fields.length;
		} else if (name.includes('地名')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.location.fields.length;
		} else if (name.includes('书籍')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.books.fields.length;
		} else if (name.includes('职业')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.profession.fields.length;
		} else if (name.includes('五行')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.wuxingStrength.fields.length;
		} else if (name.includes('时代')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.era.fields.length;
		} else if (name.includes('关系')) {
			defaultFieldCount = DEFAULT_DOUBLELINK_TAG_CONFIG.tags.relations.fields.length;
		}

		// 显示字段数量
		setting.descEl.createSpan({
			text: ` (${defaultFieldCount} 个字段)`,
			cls: 'setting-item-description'
		});

		// 根据参数决定是否添加查看/编辑字段按钮
		if (showFieldsButton) {
			setting.addButton(button => button
				.setButtonText('查看字段')
				.onClick(() => {
					console.log(`🔍 查看字段 - 分类: ${name}, 字段数量: ${config.fields?.length || 0}`, config.fields);

					// 确保字段数组存在
					const fields = config.fields || [];

					this.showFieldsModal(name, fields, (newFields) => {
						console.log(`💾 保存字段 - 分类: ${name}, 新字段数量: ${newFields.length}`, newFields);

						// 直接更新配置对象
						config.fields = newFields;

						// 保存到设置管理器
						this.doubleLinkTagSettingsManager.saveSettings().then(() => {
							console.log(`✅ 字段保存成功 - 分类: ${name}`);
							this.display(); // 刷新界面
						}).catch(error => {
							console.error(`❌ 字段保存失败 - 分类: ${name}:`, error);
						});
					});
				})
			);
		}
	}

	/**
	 * 显示字段编辑模态框
	 */
	private showFieldsModal(categoryName: string, fields: string[], onSave: (fields: string[]) => void): void {
		console.log(`🔍 显示字段模态框 - 分类: ${categoryName}, 接收到的字段:`, fields);

		const modal = new Modal(this.app);
		modal.setTitle(`管理 ${categoryName} 字段`);
		modal.contentEl.style.width = '520px';
		modal.contentEl.style.maxWidth = '520px';
		modal.contentEl.style.height = '500px';
		modal.contentEl.style.maxHeight = '500px';
		modal.contentEl.style.display = 'flex';
		modal.contentEl.style.flexDirection = 'column';
		modal.contentEl.style.padding = '10px';
		modal.contentEl.style.boxSizing = 'border-box';

		const { contentEl } = modal;
		contentEl.empty();

		// 获取默认字段
		let defaultFields: string[] = [];
		if (categoryName.includes('神煞')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.shenSha.fields];
		} else if (categoryName.includes('格局')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.pattern.fields];
		} else if (categoryName.includes('地名')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.location.fields];
		} else if (categoryName.includes('书籍')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.doubleLinks.books.fields];
		} else if (categoryName.includes('职业')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.tags.profession.fields];
		} else if (categoryName.includes('五行')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.tags.wuxingStrength.fields];
		} else if (categoryName.includes('时代')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.tags.era.fields];
		} else if (categoryName.includes('关系')) {
			defaultFields = [...DEFAULT_DOUBLELINK_TAG_CONFIG.tags.relations.fields];
		}

		console.log(`🔍 默认字段加载 - 分类: ${categoryName}, 默认字段数量: ${defaultFields.length}`, defaultFields);

		// 检查是否为神煞或格局类型（只读模式）
		const isReadOnlyMode = categoryName.includes('神煞') || categoryName.includes('格局');

		// 分离默认字段和自定义字段
		const customFields = fields.filter(field => !defaultFields.includes(field));

		// 创建主容器
		const mainContainer = contentEl.createDiv({
			attr: {
				style: isReadOnlyMode
					? 'flex: 1; display: flex; flex-direction: column; margin-bottom: 15px;'
					: 'flex: 1; display: flex; margin-bottom: 15px;'
			}
		});

		// 默认字段容器（神煞和格局为全宽，其他为左侧）
		const defaultContainer = mainContainer.createDiv({
			attr: {
				style: isReadOnlyMode
					? 'flex: 1; display: flex; flex-direction: column; border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 12px; background-color: var(--background-primary);'
					: 'width: 235px; display: flex; flex-direction: column; border: 1px solid var(--background-modifier-border); border-radius: 6px; padding: 8px; background-color: var(--background-primary); margin-right: 10px; box-sizing: border-box;'
			}
		});

		const defaultHeader = defaultContainer.createDiv({
			attr: { style: 'display: flex; align-items: center; margin-bottom: 8px;' }
		});

		defaultHeader.createEl('span', {
			text: '📋',
			attr: { style: 'font-size: 16px; margin-right: 6px;' }
		});

		defaultHeader.createEl('h3', {
			text: isReadOnlyMode ? `${categoryName}字段 (${defaultFields.length}个)` : `默认字段 (${defaultFields.length}个)`,
			attr: { style: 'margin: 0; color: var(--text-normal); font-size: 14px; font-weight: 600;' }
		});

		const defaultDescription = defaultContainer.createDiv({
			cls: 'setting-item-description',
			attr: { style: 'margin-bottom: 8px; font-size: 12px;' }
		});
		defaultDescription.innerHTML = isReadOnlyMode
			? `系统预设的${categoryName}字段，自动识别相关内容`
			: `系统预设的${categoryName}字段，不可编辑`;

		const defaultTextarea = defaultContainer.createEl('textarea', {
			attr: {
				readonly: 'true',
				style: 'flex: 1; width: calc(100% - 16px); box-sizing: border-box; font-family: var(--font-monospace); font-size: 11px; background-color: var(--background-secondary); color: var(--text-muted); border: 1px solid var(--background-modifier-border); border-radius: 4px; padding: 6px; resize: none; line-height: 1.4; margin: 0;'
			}
		});

		// 设置textarea的值
		defaultTextarea.value = defaultFields.join('\n');
		console.log(`🔍 设置默认字段textarea值:`, defaultTextarea.value);

		// 只有非只读模式才显示自定义字段部分
		let customContainer: HTMLElement | null = null;
		let customTextarea: HTMLTextAreaElement | null = null;

		if (!isReadOnlyMode) {
			// 右侧：自定义字段（可编辑）
			customContainer = mainContainer.createDiv({
				attr: { style: 'width: 235px; display: flex; flex-direction: column; border: 1px solid var(--interactive-accent); border-radius: 6px; padding: 8px; background-color: var(--background-primary); margin-left: 10px; box-sizing: border-box;' }
			});

			const customHeader = customContainer.createDiv({
				attr: { style: 'display: flex; align-items: center; margin-bottom: 8px;' }
			});

			customHeader.createEl('span', {
				text: '✏️',
				attr: { style: 'font-size: 16px; margin-right: 6px;' }
			});

			customHeader.createEl('h3', {
				text: `自定义字段`,
				attr: { style: 'margin: 0; color: var(--interactive-accent); font-size: 14px; font-weight: 600;' }
			});

			const customDescription = customContainer.createDiv({
				cls: 'setting-item-description',
				attr: { style: 'margin-bottom: 8px; font-size: 12px;' }
			});
			customDescription.innerHTML = `您添加的自定义${categoryName}字段，每行一个`;

			customTextarea = customContainer.createEl('textarea', {
				attr: {
					placeholder: '在此添加自定义字段\n每行一个字段\n例如：\n自定义人物1\n自定义人物2',
					style: 'flex: 1; width: calc(100% - 16px); box-sizing: border-box; font-family: var(--font-monospace); font-size: 13px; border: 1px solid var(--background-modifier-border); border-radius: 4px; padding: 6px; resize: none; line-height: 1.4; background-color: var(--background-primary); margin: 0;'
				}
			});

			// 设置textarea的值
			customTextarea.value = customFields.join('\n');
			console.log(`🔍 设置自定义字段textarea值:`, customTextarea.value);
		}

		// 添加字段统计
		const statsContainer = contentEl.createDiv({
			attr: { style: 'padding: 12px; background-color: var(--background-secondary); border-radius: 6px; border: 1px solid var(--background-modifier-border);' }
		});

		const statsDiv = statsContainer.createDiv({
			cls: 'field-stats',
			attr: { style: 'font-size: 13px; color: var(--text-normal);' }
		});

		const updateStats = () => {
			if (isReadOnlyMode) {
				// 只读模式只显示字段总数
				statsDiv.innerHTML = `
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span><strong>📊 字段统计</strong></span>
						<span style="color: var(--text-muted);">
							总计: <strong style="color: var(--text-normal);">${defaultFields.length}</strong> 个预设字段
						</span>
					</div>
				`;
			} else {
				// 编辑模式显示详细统计
				const currentCustomFields = customTextarea?.value.split('\n').filter(field => field.trim()) || [];
				const totalFields = defaultFields.length + currentCustomFields.length;
				statsDiv.innerHTML = `
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span><strong>📊 字段统计</strong></span>
						<span style="color: var(--text-muted);">
							默认: <strong style="color: var(--text-accent);">${defaultFields.length}</strong> |
							自定义: <strong style="color: var(--interactive-accent);">${currentCustomFields.length}</strong> |
							总计: <strong style="color: var(--text-normal);">${totalFields}</strong>
						</span>
					</div>
				`;
			}
		};

		if (!isReadOnlyMode && customTextarea) {
			customTextarea.addEventListener('input', updateStats);
		}
		updateStats();

		// 按钮容器
		const buttonContainer = contentEl.createDiv({
			cls: 'modal-button-container',
			attr: { style: 'display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--background-modifier-border);' }
		});

		if (isReadOnlyMode) {
			// 只读模式只显示关闭按钮
			const closeButton = buttonContainer.createEl('button', {
				text: '✅ 关闭',
				cls: 'mod-cta',
				attr: { style: 'padding: 8px 16px; font-size: 13px;' }
			});

			closeButton.addEventListener('click', () => {
				modal.close();
			});
		} else {
			// 编辑模式显示完整按钮组
			// 保存按钮
			const saveButton = buttonContainer.createEl('button', {
				text: '💾 保存',
				cls: 'mod-cta',
				attr: { style: 'padding: 8px 16px; font-size: 13px;' }
			});

			saveButton.addEventListener('click', () => {
				const newCustomFields = customTextarea?.value.split('\n')
					.map(field => field.trim())
					.filter(field => field.length > 0) || [];

				// 合并默认字段和自定义字段
				const allFields = [...defaultFields, ...newCustomFields];

				onSave(allFields);
				modal.close();
				new Notice(`✅ ${categoryName}字段已更新 (默认${defaultFields.length}个 + 自定义${newCustomFields.length}个)`);
			});

			// 清空自定义字段按钮
			const clearButton = buttonContainer.createEl('button', {
				text: '🗑️ 清空',
				cls: 'mod-warning',
				attr: { style: 'padding: 8px 16px; font-size: 13px;' }
			});

			clearButton.addEventListener('click', () => {
				if (confirm(`确定要清空所有自定义${categoryName}字段吗？`)) {
					if (customTextarea) {
						customTextarea.value = '';
						updateStats();
					}
				}
			});

			// 取消按钮
			const cancelButton = buttonContainer.createEl('button', {
				text: '❌ 取消',
				cls: 'mod-secondary',
				attr: { style: 'padding: 8px 16px; font-size: 13px;' }
			});

			cancelButton.addEventListener('click', () => {
				modal.close();
			});
		}

		modal.open();
	}

	/**
	 * 添加使用说明
	 */
	private addUsageInstructions(containerEl: HTMLElement): void {
		// 使用说明标题
		containerEl.createEl('h3', {text: '📖 使用说明'});

		// 创建说明容器
		const instructionsContainer = containerEl.createDiv({
			attr: {
				style: 'background-color: var(--background-secondary); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: var(--font-monospace); font-size: 0.9em; line-height: 1.6;'
			}
		});

		// 基本使用说明
		const basicUsage = instructionsContainer.createEl('p', {
			text: '在Obsidian中创建代码块，语言设置为 "bazi"，然后在代码块中输入相应的参数即可生成八字命盘。支持三种显示样式，可通过全局设置或代码块参数控制。',
			attr: { style: 'margin-bottom: 20px; color: var(--text-normal); font-family: var(--font-text);' }
		});

		// 三种样式说明
		instructionsContainer.createEl('h4', {text: '🎨 三种显示样式'});

		const styles = [
			{
				name: '样式1 - 简洁样式',
				param: 'style: 1',
				desc: '仅显示八字表格和基本信息，无标题，适合快速记录和嵌入使用'
			},
			{
				name: '样式2 - 标准样式',
				param: 'style: 2',
				desc: '包含八字、大运、流年、流月信息，有简化标题，适合日常分析'
			},
			{
				name: '样式3 - 完整样式',
				param: 'style: 3',
				desc: '包含所有专业分析功能，交互式界面，适合详细研究和专业分析'
			}
		];

		styles.forEach(style => {
			const styleContainer = instructionsContainer.createDiv({
				attr: { style: 'margin-bottom: 12px; padding: 10px; background-color: var(--background-primary); border-radius: 5px;' }
			});

			styleContainer.createEl('strong', {text: style.name});
			styleContainer.createEl('br');
			styleContainer.createEl('code', {
				text: style.param,
				attr: { style: 'background-color: var(--code-background); padding: 2px 6px; border-radius: 3px; margin: 5px 0; display: inline-block;' }
			});
			styleContainer.createEl('br');
			styleContainer.createEl('span', {
				text: style.desc,
				attr: { style: 'color: var(--text-muted); font-size: 0.9em;' }
			});
		});

		// 代码块类型说明
		instructionsContainer.createEl('h4', {text: '🎯 支持的代码块类型'});

		const codeBlockTypes = [
			{
				title: '1. 日期类型',
				code: 'date: 2025-05-24 10:30\ngender: 男\nstyle: 2',
				desc: '使用阳历日期和时间，可指定性别和样式'
			},
			{
				title: '2. 纯八字类型',
				code: 'bazi: 乙丑 壬午 丙午 癸巳\nyear: 1985\ngender: 女\nstyle: 1',
				desc: '直接输入八字，支持年份选择和样式设置'
			},
			{
				title: '3. 农历日期类型',
				code: 'lunar: 2025-04-27 10:30\ngender: 女\nstyle: 3',
				desc: '使用农历日期和时间，支持完整样式'
			},
			{
				title: '4. 当前时间类型',
				code: 'now: true\ngender: no\nstyle: simple',
				desc: '自动获取当前时间的八字，可跳过性别选择'
			}
		];

		codeBlockTypes.forEach(type => {
			const typeContainer = instructionsContainer.createDiv({
				attr: { style: 'margin-bottom: 12px;' }
			});

			typeContainer.createEl('strong', {text: type.title});
			typeContainer.createEl('br');

			// 创建代码块容器，包含复制按钮
			this.createCodeBlockWithCopy(typeContainer, '```bazi\n' + type.code + '\n```');

			typeContainer.createEl('span', {
				text: type.desc,
				attr: { style: 'color: var(--text-muted); font-size: 0.85em;' }
			});
		});

		// 参数说明
		instructionsContainer.createEl('h4', {text: '⚙️ 可选参数'});

		const parameters = [
			{
				name: 'gender',
				values: ['男 / 女 / male / female / 1 / 0', 'no / none / 无'],
				desc: ['指定性别进行完整分析', '不需要性别，仅观察八字']
			},
			{
				name: 'year',
				values: ['具体年份 (如: 1985)'],
				desc: ['指定年份（仅纯八字类型）']
			},
			{
				name: 'style',
				values: ['1 / simple / 简洁', '2 / standard / 标准', '3 / complete / 完整'],
				desc: ['简洁样式（仅八字和基本信息）', '标准样式（含大运流年流月）', '完整样式（专业分析功能）']
			}
		];

		parameters.forEach(param => {
			const paramContainer = instructionsContainer.createDiv({
				attr: { style: 'margin-bottom: 12px;' }
			});

			paramContainer.createEl('strong', {text: `${param.name}: `});

			param.values.forEach((value, index) => {
				if (index > 0) paramContainer.createEl('br');
				paramContainer.createEl('code', {
					text: value,
					attr: {
						style: 'background-color: var(--code-background); padding: 2px 6px; border-radius: 3px; margin-right: 8px;'
					}
				});
				paramContainer.createEl('span', {
					text: param.desc[index],
					attr: { style: 'color: var(--text-muted); font-size: 0.85em;' }
				});
			});
		});

		// 使用示例
		instructionsContainer.createEl('h4', {text: '💡 使用示例'});

		const examples = [
			{
				title: '完整八字分析（默认样式）',
				code: 'date: 1985-07-06 10:30\ngender: 男'
			},
			{
				title: '简洁样式八字',
				code: 'date: 1985-07-06 10:30\ngender: 男\nstyle: 1'
			},
			{
				title: '标准样式八字',
				code: 'bazi: 乙丑 壬午 丙午 癸巳\nyear: 1985\ngender: 女\nstyle: 2'
			},
			{
				title: '完整样式八字',
				code: 'lunar: 2025-04-27 10:30\ngender: 女\nstyle: 3'
			},
			{
				title: '观察当前时间（简洁样式）',
				code: 'now: true\ngender: no\nstyle: simple'
			}
		];

		examples.forEach(example => {
			const exampleContainer = instructionsContainer.createDiv({
				attr: { style: 'margin-bottom: 12px;' }
			});

			exampleContainer.createEl('strong', {text: example.title + ':'});
			exampleContainer.createEl('br');

			// 创建代码块容器，包含复制按钮
			this.createCodeBlockWithCopy(exampleContainer, '```bazi\n' + example.code + '\n```');
		});

		// 功能特点
		instructionsContainer.createEl('h4', {text: '✨ 功能特点'});

		const features = [
			'🎯 智能性别选择：没有性别参数时自动显示选择栏',
			'📅 年份选择：纯八字类型支持多年份选择（基于lunar-typescript库）',
			'🔄 自动更新：选择性别或年份后自动更新代码块',
			'🎨 三种显示样式：简洁(1)、标准(2)、完整(3)样式可选',
			'🎭 交互式界面：支持点击展开详细信息（完整样式）',
			'🌟 神煞分析：支持四柱、大运、流年、小运、流月神煞',
			'⚡ 实时观察：支持当前时间八字的实时显示',
			'🔧 灵活配置：支持全局默认样式和单独指定样式'
		];

		const featuresList = instructionsContainer.createEl('ul', {
			attr: { style: 'margin: 10px 0; padding-left: 20px;' }
		});

		features.forEach(feature => {
			featuresList.createEl('li', {
				text: feature,
				attr: { style: 'margin-bottom: 5px; color: var(--text-normal);' }
			});
		});

		// 提示信息
		const tipContainer = instructionsContainer.createDiv({
			attr: {
				style: 'background-color: var(--background-modifier-success); padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid var(--color-green);'
			}
		});

		tipContainer.createEl('strong', {text: '💡 使用提示'});
		tipContainer.createEl('br');
		tipContainer.createEl('br');

		const tips = [
			'🎯 样式选择：使用 style: 1/2/3 快速设置样式，或使用 simple/standard/complete',
			'👤 性别设置：使用 gender: no 可以跳过性别选择，仅观察八字信息',
			'📅 年份选择：纯八字类型会自动显示可选年份，也可以直接指定 year 参数',
			'🔧 全局设置：可在插件设置中配置默认样式，代码块参数会覆盖全局设置'
		];

		tips.forEach(tip => {
			const tipItem = tipContainer.createDiv({
				attr: { style: 'margin-bottom: 8px; font-size: 0.9em;' }
			});
			tipItem.createEl('span', {
				text: tip,
				attr: { style: 'color: var(--text-normal);' }
			});
		});
	}

	/**
	 * 创建带复制按钮的代码块
	 */
	private createCodeBlockWithCopy(container: HTMLElement, codeText: string): void {
		// 创建代码块容器
		const codeContainer = container.createDiv({
			attr: {
				style: 'position: relative; margin: 5px 0;'
			}
		});

		// 创建代码块
		const codeEl = codeContainer.createEl('code', {
			text: codeText,
			attr: {
				style: 'background-color: var(--code-background); padding: 8px 40px 8px 8px; border-radius: 4px; display: block; white-space: pre; font-family: var(--font-monospace); font-size: 0.85em; line-height: 1.4;'
			}
		});

		// 创建复制按钮
		const copyButton = codeContainer.createEl('button', {
			text: '📋',
			attr: {
				style: 'position: absolute; top: 4px; right: 4px; background: var(--interactive-accent); color: var(--text-on-accent); border: none; border-radius: 3px; padding: 4px 6px; cursor: pointer; font-size: 0.8em; opacity: 0.7; transition: opacity 0.2s;',
				title: '复制代码'
			}
		});

		// 添加悬停效果
		copyButton.addEventListener('mouseenter', () => {
			copyButton.style.opacity = '1';
		});

		copyButton.addEventListener('mouseleave', () => {
			copyButton.style.opacity = '0.7';
		});

		// 添加复制功能
		copyButton.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(codeText);

				// 临时改变按钮文本和样式，表示复制成功
				const originalText = copyButton.textContent;
				const originalStyle = copyButton.style.background;

				copyButton.textContent = '✅';
				copyButton.style.background = 'var(--color-green)';

				// 显示成功提示
				new Notice('代码已复制到剪贴板', 2000);

				// 2秒后恢复原样
				setTimeout(() => {
					copyButton.textContent = originalText;
					copyButton.style.background = originalStyle;
				}, 2000);

			} catch (err) {
				console.error('复制失败:', err);
				new Notice('复制失败，请手动复制', 3000);

				// 如果复制失败，改变按钮样式表示错误
				const originalText = copyButton.textContent;
				const originalStyle = copyButton.style.background;

				copyButton.textContent = '❌';
				copyButton.style.background = 'var(--color-red)';

				setTimeout(() => {
					copyButton.textContent = originalText;
					copyButton.style.background = originalStyle;
				}, 2000);
			}
		});
	}

	/**
	 * 获取样式显示名称
	 */
	private getStyleDisplayName(style: BaziDisplayStyle): string {
		switch (style) {
			case BaziDisplayStyle.SIMPLE:
				return '简洁样式';
			case BaziDisplayStyle.STANDARD:
				return '标准样式';
			case BaziDisplayStyle.COMPLETE:
				return '完整样式';
			default:
				return '未知样式';
		}
	}
}
