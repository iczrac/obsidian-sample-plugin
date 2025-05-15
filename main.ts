import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { DatePickerModal } from 'src/ui/DatePickerModal';
import { BaziInfoModal } from 'src/ui/BaziInfoModal';
import { BaziParserModal } from 'src/ui/BaziParserModal';
import { BaziSettingsModal } from 'src/ui/BaziSettingsModal';

interface BaziPluginSettings {
	defaultFormat: string;
	useInteractiveView: boolean;
}

const DEFAULT_SETTINGS: BaziPluginSettings = {
	defaultFormat: 'full', // 'full' 或 'simple'
	useInteractiveView: true // 是否使用交互式视图
}

export default class BaziPlugin extends Plugin {
	settings: BaziPluginSettings;

	async onload() {
		await this.loadSettings();

		// 添加左侧图标
		const ribbonIconEl = this.addRibbonIcon('calendar-clock', '八字命盘', (evt: MouseEvent) => {
			// 点击图标时打开日期选择模态框
			this.openDatePickerModal();
		});
		ribbonIconEl.addClass('bazi-plugin-ribbon-class');

		// 添加命令：输入时间转八字
		this.addCommand({
			id: 'open-date-picker',
			name: '输入时间转八字',
			callback: () => {
				this.openDatePickerModal();
			}
		});

		// 添加命令：解析选中的八字
		this.addCommand({
			id: 'parse-selected-bazi',
			name: '解析选中的八字',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (selection) {
					this.openBaziParserModal(selection, (baziInfo) => {
						// 生成八字信息的Markdown
						const markdown = BaziService.generateBaziMarkdown(baziInfo as any);
						// 替换选中的文本
						editor.replaceSelection(markdown);
					});
				} else {
					new Notice('请先选择八字文本');
				}
			}
		});

		// 添加命令：在当前位置插入八字信息
		this.addCommand({
			id: 'insert-bazi-at-cursor',
			name: '在当前位置插入八字信息',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.openDatePickerModal((baziInfo) => {
					if (this.settings.useInteractiveView) {
						// 使用交互式视图 - 插入bazi代码块
						const dateStr = `${baziInfo.solarDate} ${baziInfo.solarTime}`;

						// 在光标位置插入bazi代码块
						editor.replaceSelection(`\`\`\`bazi
date: ${dateStr}
\`\`\``);

						// 显示通知
						new Notice('八字命盘已插入');
					} else {
						// 使用传统Markdown
						const markdown = BaziService.generateBaziMarkdown(baziInfo);
						editor.replaceSelection(markdown);
					}
				});
			}
		});

		// 添加命令：插入交互式八字命盘
		this.addCommand({
			id: 'insert-interactive-bazi',
			name: '插入交互式八字命盘',
			editorCallback: (editor: Editor) => {
				this.openDatePickerModal((baziInfo) => {
					const dateStr = `${baziInfo.solarDate} ${baziInfo.solarTime}`;

					// 在光标位置插入bazi代码块
					editor.replaceSelection(`\`\`\`bazi
date: ${dateStr}
\`\`\``);

					// 显示通知
					new Notice('八字命盘已插入');
				});
			}
		});

		// 注册代码块处理器 - 类似Dataview的方式
		this.registerMarkdownCodeBlockProcessor('bazi', (source, el, ctx) => {
			// 解析代码块内容
			const params = this.parseCodeBlockParams(source);

			// 检查是否有日期参数
			if (params.date) {
				try {
					// 解析日期
					const dateTime = params.date.trim().split(' ');
					const dateParts = dateTime[0].split('-').map(Number);
					const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];

					const year = dateParts[0];
					const month = dateParts[1];
					const day = dateParts[2];
					const hour = timeParts[0];

					// 获取八字信息
					const baziInfo = BaziService.getBaziFromDate(year, month, day, hour);

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);

					// 渲染八字命盘
					el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);

					// 为设置按钮添加事件监听器
					this.addSettingsButtonListeners(el);

					// 添加源代码属性，用于编辑时恢复
					el.setAttribute('data-bazi-source', source);
				} catch (error) {
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else if (params.bazi) {
				try {
					// 解析八字字符串
					const baziInfo = BaziService.parseBaziString(params.bazi);

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);

					// 渲染八字命盘
					el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);

					// 为设置按钮添加事件监听器
					this.addSettingsButtonListeners(el);

					// 添加源代码属性，用于编辑时恢复
					el.setAttribute('data-bazi-source', source);
				} catch (error) {
					console.error('八字命盘渲染错误:', error);
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else {
				// 显示错误信息
				el.createEl('div', {
					cls: 'bazi-error',
					text: '八字命盘缺少必要参数，请指定 date 或 bazi 参数'
				});
			}
		});

		// 添加设置选项卡
		this.addSettingTab(new BaziSettingTab(this.app, this));
	}

	onunload() {
		// 清理资源
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * 打开日期选择模态框
	 * @param onSubmit 提交回调函数
	 */
	openDatePickerModal(onSubmit?: (baziInfo: any) => void) {
		const modal = new DatePickerModal(this.app, (baziInfo: any) => {
			if (onSubmit) {
				onSubmit(baziInfo);
			} else {
				// 如果没有提供回调，则打开八字信息模态框
				this.openBaziInfoModal(baziInfo);
			}
		});
		modal.open();
	}

	/**
	 * 打开八字信息模态框
	 * @param baziInfo 八字信息
	 */
	openBaziInfoModal(baziInfo: any) {
		const modal = new BaziInfoModal(this.app, baziInfo, (markdown: string) => {
			// 获取当前活动的编辑器视图
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				// 在光标位置插入Markdown
				const editor = activeView.editor;
				editor.replaceSelection(markdown);
				new Notice('八字信息已插入到笔记中');
			} else {
				new Notice('无法插入八字信息：未找到活动的编辑器视图');
			}
		});
		modal.open();
	}

	/**
	 * 打开八字解析模态框
	 * @param initialBazi 初始八字字符串
	 * @param onParsed 解析完成回调
	 */
	openBaziParserModal(initialBazi: string, onParsed: (baziInfo: any) => void) {
		const modal = new BaziParserModal(this.app, initialBazi, onParsed);
		modal.open();
	}

	/**
	 * 打开八字设置模态框
	 * @param baziId 八字命盘ID
	 * @param initialDate 初始日期
	 * @param onUpdate 更新回调
	 */
	openBaziSettingsModal(baziId: string, initialDate: { year: number; month: number; day: number; hour: number }, onUpdate: (baziInfo: any) => void) {
		const modal = new BaziSettingsModal(this.app, baziId, initialDate, onUpdate);
		modal.open();
	}

	/**
	 * 为设置按钮添加事件监听器
	 * @param container 容器元素
	 */
	addSettingsButtonListeners(container: HTMLElement) {
		const settingsButtons = container.querySelectorAll('.bazi-view-settings-button');
		settingsButtons.forEach(button => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();

				// 获取八字命盘ID
				const baziId = (button as HTMLElement).getAttribute('data-bazi-id');
				if (baziId) {
					// 获取日期数据
					const dataEl = container.querySelector(`#${baziId} .bazi-view-data`);
					if (dataEl) {
						const year = parseInt(dataEl.getAttribute('data-year') || '0');
						const month = parseInt(dataEl.getAttribute('data-month') || '0');
						const day = parseInt(dataEl.getAttribute('data-day') || '0');
						const hour = parseInt(dataEl.getAttribute('data-hour') || '0');

						// 打开设置模态框
						this.openBaziSettingsModal(baziId, { year, month, day, hour }, (newBaziInfo) => {
							// 更新八字命盘
							const newHtml = BaziService.generateBaziHTML(newBaziInfo, baziId);
							container.innerHTML = newHtml;

							// 重新添加事件监听器
							this.addSettingsButtonListeners(container);

							// 如果是在代码块中，更新源代码
							const sourceBlock = container.closest('.markdown-rendered');
							if (sourceBlock) {
								const codeBlock = sourceBlock.closest('[data-bazi-source]');
								if (codeBlock) {
									// 更新日期
									const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
									codeBlock.setAttribute('data-bazi-source', `date: ${dateStr}`);
								}
							}
						});
					}
				}
			});
		});
	}

	/**
	 * 解析代码块参数
	 * @param source 代码块源代码
	 * @returns 解析后的参数对象
	 */
	parseCodeBlockParams(source: string): Record<string, string> {
		const params: Record<string, string> = {};
		const lines = source.split('\n');

		for (const line of lines) {
			// 跳过空行和注释
			if (!line.trim() || line.trim().startsWith('#')) {
				continue;
			}

			// 解析键值对
			const match = line.match(/^([^:]+):\s*(.*)$/);
			if (match) {
				const key = match[1].trim().toLowerCase();
				const value = match[2].trim();
				params[key] = value;
			}
		}

		return params;
	}
}

/**
 * 插件设置选项卡
 */
class BaziSettingTab extends PluginSettingTab {
	plugin: BaziPlugin;

	constructor(app: App, plugin: BaziPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: '八字命盘插件设置'});

		new Setting(containerEl)
			.setName('默认格式')
			.setDesc('选择八字信息的默认显示格式')
			.addDropdown(dropdown => {
				dropdown
					.addOption('full', '完整格式')
					.addOption('simple', '简洁格式')
					.setValue(this.plugin.settings.defaultFormat)
					.onChange(async (value) => {
						this.plugin.settings.defaultFormat = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('使用交互式视图')
			.setDesc('启用后，插入的八字命盘将使用交互式视图，可以点击右上角的设置图标调整参数')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.useInteractiveView)
					.onChange(async (value) => {
						this.plugin.settings.useInteractiveView = value;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl('h3', {text: '使用说明'});

		const usageList = containerEl.createEl('ul');
		usageList.createEl('li', {text: '点击左侧栏的八字命盘图标或使用命令面板中的"输入时间转八字"命令可以打开日期选择模态框'});
		usageList.createEl('li', {text: '使用命令面板中的"在当前位置插入八字信息"命令可以在光标位置插入八字命盘'});
		usageList.createEl('li', {text: '使用命令面板中的"插入交互式八字命盘"命令可以在光标位置插入交互式八字命盘'});
		usageList.createEl('li', {text: '在交互式八字命盘中，点击右上角的设置图标可以调整参数'});
		usageList.createEl('li', {text: '选中八字文本后，使用命令面板中的"解析选中的八字"命令可以解析八字并生成详细信息'});

		containerEl.createEl('h3', {text: '代码块用法'});

		const codeExample = containerEl.createEl('pre');
		codeExample.createEl('code', {
			text: '```bazi\ndate: 1986-05-29 12:00\n```'
		});

		containerEl.createEl('p', {
			text: '您也可以直接使用八字：'
		});

		const codeExample2 = containerEl.createEl('pre');
		codeExample2.createEl('code', {
			text: '```bazi\nbazi: 甲子 乙丑 丙寅 丁卯\n```'
		});
	}
}