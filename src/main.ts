import { App, Plugin, MarkdownView, Notice } from 'obsidian';
import { BaziPluginSettings } from './types/PluginTypes';
import { DEFAULT_SETTINGS, BaziSettingTab } from './settings/PluginSettings';
import { CommandManager } from './commands/CommandManager';
import { CodeBlockProcessor } from './processors/CodeBlockProcessor';
import { DatePickerModal } from './ui/DatePickerModal';
import { BaziParserModal } from './ui/BaziParserModal';

/**
 * 八字命盘插件主类
 */
export default class BaziPlugin extends Plugin {
	settings: BaziPluginSettings;
	private commandManager: CommandManager;
	private codeBlockProcessor: CodeBlockProcessor;

	async onload() {
		// 加载设置
		await this.loadSettings();

		// 初始化管理器
		this.commandManager = new CommandManager(this);
		this.codeBlockProcessor = new CodeBlockProcessor(this);

		// 注册命令
		this.commandManager.registerCommands();

		// 注册代码块处理器
		this.codeBlockProcessor.register();

		// 加载CSS样式
		this.loadStyles();

		// 添加左侧图标
		this.setupRibbonIcon();

		// 添加设置选项卡
		this.addSettingTab(new BaziSettingTab(this.app, this));

		// 输出调试信息
		if (this.settings.debugMode) {
			console.log('八字命盘插件已加载，调试模式已启用');
		}
	}

	onunload() {
		// 清理资源
		if (this.settings.debugMode) {
			console.log('八字命盘插件已卸载');
		}
	}

	/**
	 * 加载设置
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * 保存设置
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * 设置左侧图标
	 */
	private setupRibbonIcon(): void {
		const ribbonIconEl = this.addRibbonIcon('calendar-clock', '八字命盘', () => {
			// 获取当前活动的编辑器视图
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				const editor = activeView.editor;
				// 打开日期选择模态框，并在选择后插入八字信息
				this.openDatePickerModal((baziInfo) => {
					// 获取日期字符串
					const dateStr = `${baziInfo.solarDate} ${baziInfo.solarTime}`;

					// 构建代码块内容
					let codeBlockContent = `\`\`\`bazi\ndate: ${dateStr}\n`;

					// 添加性别参数
					if (baziInfo.gender) {
						const genderLabel = baziInfo.gender === '1' ? '男' : '女';
						codeBlockContent += `gender: ${genderLabel}\n`;
					}

					// 完成代码块
					codeBlockContent += `\`\`\``;

					// 在光标位置插入bazi代码块
					editor.replaceSelection(codeBlockContent);

					// 显示通知
					new Notice('八字命盘已插入');
				});
			} else {
				// 如果没有活动的编辑器视图，只打开日期选择模态框
				this.openDatePickerModal();
			}
		});
		ribbonIconEl.addClass('bazi-plugin-ribbon-class');
	}

	/**
	 * 加载CSS样式
	 */
	private loadStyles(): void {
		// 这里可以添加动态样式加载逻辑
		// 目前样式通过 styles.css 文件加载
	}

	/**
	 * 打开日期选择模态框
	 */
	openDatePickerModal(onSubmit?: (baziInfo: any) => void): void {
		new DatePickerModal(this.app, onSubmit || (() => {})).open();
	}

	/**
	 * 打开八字解析模态框
	 */
	openBaziParserModal(initialText: string, onSubmit: (baziInfo: any) => void): void {
		new BaziParserModal(this.app, initialText, onSubmit).open();
	}

	/**
	 * 使用文件API更新代码块
	 */
	updateCodeBlockWithFileAPI(newSource: string): void {
		try {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				console.log('无法获取活动的编辑器视图');
				new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
				return;
			}

			const editor = activeView.editor;
			if (!editor) {
				new Notice('更新代码块失败：无法获取编辑器实例', 3000);
				return;
			}

			// 获取文档中所有的bazi代码块
			const text = editor.getValue();
			const lines = text.split('\n');

			// 查找所有代码块
			let inCodeBlock = false;
			let startLine = -1;
			let endLine = -1;
			let blockLanguage = '';
			let foundBlocks = 0;
			let blockContents: {start: number, end: number, content: string}[] = [];

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];

				if (line.startsWith('```') && !inCodeBlock) {
					inCodeBlock = true;
					startLine = i;
					blockLanguage = line.substring(3).trim();
				} else if (line.startsWith('```') && inCodeBlock) {
					inCodeBlock = false;
					endLine = i;

					if (blockLanguage === 'bazi') {
						foundBlocks++;

						// 收集代码块内容
						let blockContent = '';
						for (let j = startLine + 1; j < endLine; j++) {
							blockContent += lines[j] + (j < endLine - 1 ? '\n' : '');
						}

						blockContents.push({
							start: startLine,
							end: endLine,
							content: blockContent
						});
					}
				}
			}

			// 如果找到了代码块，使用第一个
			if (blockContents.length > 0) {
				const block = blockContents[0];

				// 替换代码块内容
				const trimmedSource = newSource.trim();

				// 检测原始代码块的缩进
				let indentation = '';
				if (block.start + 1 < lines.length) {
					const firstLine = lines[block.start + 1];
					const match = firstLine.match(/^(\s+)/);
					if (match) {
						indentation = match[1];
					}
				}

				// 应用缩进到每一行
				const indentedSource = trimmedSource
					.split('\n')
					.map(line => line.trim() ? indentation + line : line)
					.join('\n');

				// 使用文件API更新文件内容
				const file = this.app.workspace.getActiveFile();
				if (file) {
					// 读取文件内容
					this.app.vault.read(file).then(content => {
						// 将内容分割成行
						const fileLines = content.split('\n');

						// 替换代码块
						const beforeBlock = fileLines.slice(0, block.start).join('\n');
						const afterBlock = fileLines.slice(block.end + 1).join('\n');
						const newBlock = '```bazi\n' + indentedSource + '\n```';

						// 构建新的文件内容
						const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

						// 更新文件内容
						this.app.vault.modify(file, newContent);
					});
				}

				new Notice('八字命盘代码块已更新', 3000);
			} else {
				console.log('未找到任何bazi代码块');
				new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
			}
		} catch (error) {
			console.error('使用文件API更新代码块时出错:', error);
			new Notice('更新代码块时出错: ' + error.message, 5000);
		}
	}
}
