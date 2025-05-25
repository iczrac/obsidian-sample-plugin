import { Editor, MarkdownView, Notice } from 'obsidian';
import { BaziService } from '../services/BaziService';
import type BaziPlugin from '../main';

/**
 * 命令管理器
 * 负责注册和管理插件的所有命令
 */
export class CommandManager {
	private plugin: BaziPlugin;

	constructor(plugin: BaziPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 注册所有命令
	 */
	registerCommands(): void {
		console.log('🎯 开始注册命令...');
		this.registerTestCommand(); // 添加测试命令
		this.registerDatePickerCommand();
		this.registerBaziParserCommand();
		console.log('✅ 所有命令注册完成');
	}

	/**
	 * 注册测试命令 - 用于验证命令系统是否正常工作
	 */
	private registerTestCommand(): void {
		console.log('🧪 注册测试命令: test-bazi-plugin');
		this.plugin.addCommand({
			id: 'test-bazi-plugin',
			name: '🧪 测试八字插件命令',
			callback: () => {
				new Notice('✅ 八字插件命令系统正常工作！', 3000);
				console.log('✅ 测试命令执行成功');
			}
		});
	}

	/**
	 * 注册日期选择命令
	 */
	private registerDatePickerCommand(): void {
		console.log('📅 注册日期选择命令: open-date-picker');
		this.plugin.addCommand({
			id: 'open-date-picker',
			name: '输入时间转八字',
			editorCallback: (editor: Editor) => {
				this.plugin.openDatePickerModal((baziInfo) => {
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
			}
		});
	}

	/**
	 * 注册八字解析命令
	 */
	private registerBaziParserCommand(): void {
		console.log('🔍 注册八字解析命令: parse-selected-bazi');
		this.plugin.addCommand({
			id: 'parse-selected-bazi',
			name: '解析选中的八字',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (selection) {
					// 清理选中的文本，去除多余的空格
					const cleanedBazi = selection.replace(/\s+/g, ' ').trim();

					// 检查是否符合八字格式（四个天干地支组合，用空格分隔）
					const baziPattern = /^([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])$/;

					if (baziPattern.test(cleanedBazi)) {
						// 直接解析八字，获取可能的年份
						try {
							const baziInfo = BaziService.parseBaziString(cleanedBazi);

							// 构建代码块内容
							let codeBlockContent = `\`\`\`bazi\nbazi: ${cleanedBazi}\n`;

							// 完成代码块
							codeBlockContent += `\`\`\``;

							// 替换选中的文本为代码块
							editor.replaceSelection(codeBlockContent);
							new Notice('八字已转换为代码块');
						} catch (error) {
							// 如果解析失败，仅使用基本格式
							editor.replaceSelection(`\`\`\`bazi
bazi: ${cleanedBazi}
\`\`\``);
							new Notice('八字已转换为代码块');
						}
					} else {
						// 如果不符合格式，打开解析模态框让用户修改
						this.plugin.openBaziParserModal(selection, (baziInfo) => {
							// 获取解析后的八字
							const parsedBazi = `${baziInfo.yearPillar} ${baziInfo.monthPillar} ${baziInfo.dayPillar} ${baziInfo.hourPillar}`;

							// 构建代码块内容
							let codeBlockContent = `\`\`\`bazi\nbazi: ${parsedBazi}\n`;

							// 添加性别参数
							if (baziInfo.gender) {
								const genderLabel = baziInfo.gender === '1' ? '男' : '女';
								codeBlockContent += `gender: ${genderLabel}\n`;
							}

							// 不自动添加年份参数，让用户通过年份选择栏自行选择

							// 完成代码块
							codeBlockContent += `\`\`\``;

							// 替换选中的文本为代码块
							editor.replaceSelection(codeBlockContent);
							new Notice('八字已转换为代码块');
						});
					}
				} else {
					new Notice('请先选择八字文本');
				}
			}
		});
	}
}
