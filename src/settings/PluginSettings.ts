import { App, PluginSettingTab, Setting, Notice, Plugin } from 'obsidian';
import { BaziPluginSettings } from '../types/PluginTypes';

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: BaziPluginSettings = {
	defaultFormat: 'full', // 'full' 或 'simple'
	useInteractiveView: true, // 是否使用交互式视图
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
	}
}
