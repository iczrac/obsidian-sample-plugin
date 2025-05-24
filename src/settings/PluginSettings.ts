import { App, PluginSettingTab, Setting, Notice, Plugin } from 'obsidian';
import { BaziPluginSettings } from '../types/PluginTypes';

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: BaziPluginSettings = {
	debugMode: false, // 调试模式
	autoUpdateCodeBlock: true, // 自动更新代码块
	codeBlockUpdateDelay: 500, // 代码块更新延迟（毫秒）
	baziSect: '2', // 默认使用流派2（晚子时日柱算当天）
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

	constructor(app: App, plugin: Plugin & { settings: BaziPluginSettings; saveSettings(): Promise<void> }) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: '八字命盘插件设置'});



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

		// 代码块类型说明
		instructionsContainer.createEl('h4', {text: '🎯 支持的代码块类型'});

		const codeBlockTypes = [
			{
				title: '1. 日期类型',
				code: 'date: 2025-05-24 10:30',
				desc: '使用阳历日期和时间'
			},
			{
				title: '2. 纯八字类型',
				code: 'bazi: 乙丑 壬午 丙午 癸巳',
				desc: '直接输入八字，支持年份选择'
			},
			{
				title: '3. 农历日期类型',
				code: 'lunar: 2025-04-27 10:30',
				desc: '使用农历日期和时间'
			},
			{
				title: '4. 当前时间类型',
				code: 'now: true',
				desc: '自动获取当前时间的八字'
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
				title: '完整八字分析',
				code: 'date: 1985-07-06 10:30\ngender: 男'
			},
			{
				title: '纯八字 + 年份选择',
				code: 'bazi: 乙丑 壬午 丙午 癸巳\nyear: 1985\ngender: 女'
			},
			{
				title: '观察当前时间（无性别）',
				code: 'now: true\ngender: no'
			},
			{
				title: '农历日期分析',
				code: 'lunar: 2025-04-27 10:30\ngender: 女'
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
			'🎨 交互式界面：支持点击展开详细信息',
			'🌟 神煞分析：支持四柱、大运、流年、小运、流月神煞',
			'⚡ 实时观察：支持当前时间八字的实时显示'
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
				style: 'background-color: var(--background-modifier-success); padding: 10px; border-radius: 6px; margin-top: 15px; border-left: 4px solid var(--color-green);'
			}
		});

		tipContainer.createEl('strong', {text: '💡 提示：'});
		tipContainer.createEl('span', {
			text: '如果代码块没有显示性别选择栏，请检查是否已经设置了gender参数。使用 gender: no 可以跳过性别选择，仅观察八字信息。',
			attr: { style: 'margin-left: 8px;' }
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
}
