import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, debounce } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { DatePickerModal } from 'src/ui/DatePickerModal';
import { BaziInfoModal } from 'src/ui/BaziInfoModal';
import { BaziParserModal } from 'src/ui/BaziParserModal';
import { BaziSettingsModal } from 'src/ui/BaziSettingsModal';
import { InteractiveBaziView } from 'src/ui/InteractiveBaziView';

/**
 * 八字代码块参数接口
 */
interface BaziParams {
	// 基本参数
	date?: string;           // 公历日期
	lunar?: string;          // 农历日期
	bazi?: string;           // 八字
	now?: string;            // 是否使用当前时间
	gender?: string;         // 性别
	year?: string;           // 年份（用于纯八字模式）
	leap?: string;           // 是否闰月（用于农历日期）

	// 显示选项
	title?: string;          // 标题
	theme?: string;          // 主题
	showWuxing?: string;     // 是否显示五行
	showSpecialInfo?: string; // 是否显示特殊信息
	calculationMethod?: string; // 计算方法

	// 神煞显示设置
	showshensha_sizhu?: string;   // 是否显示四柱神煞
	showshensha_dayun?: string;   // 是否显示大运神煞
	showshensha_liunian?: string; // 是否显示流年神煞
	showshensha_xiaoyun?: string; // 是否显示小运神煞
	showshensha_liuyue?: string;  // 是否显示流月神煞

	// 其他可能的参数
	[key: string]: string | undefined;
}

interface BaziPluginSettings {
	defaultFormat: string;
	useInteractiveView: boolean;
	debugMode: boolean;
	autoUpdateCodeBlock: boolean;
	codeBlockUpdateDelay: number;
	baziSect: string; // 八字流派
	showShenSha: {
		siZhu: boolean; // 四柱神煞
		daYun: boolean; // 大运神煞
		liuNian: boolean; // 流年神煞
		xiaoYun: boolean; // 小运神煞
		liuYue: boolean; // 流月神煞
	};
}

const DEFAULT_SETTINGS: BaziPluginSettings = {
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
}

export default class BaziPlugin extends Plugin {
	settings: BaziPluginSettings;

	/**
	 * 添加命令
	 */
	addCommands() {
		// 添加命令：输入时间转八字
		this.addCommand({
			id: 'open-date-picker',
			name: '输入时间转八字',
			editorCallback: (editor: Editor) => {
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
			}
		});

		// 添加命令：解析选中的八字
		this.addCommand({
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
						this.openBaziParserModal(selection, (baziInfo) => {
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

	async onload() {
		await this.loadSettings();

		// 添加命令
		this.addCommands();

		// 加载CSS样式
		this.loadStyles();

		// 添加左侧图标
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

		// 注册代码块处理器 - 类似Dataview的方式
		this.registerMarkdownCodeBlockProcessor('bazi', (source, el, _ctx) => {
			// 解析代码块内容
			const params: BaziParams = {}; // 使用BaziParams接口定义

			// 手动解析代码块内容
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

			// 添加神煞显示设置
			if (this.settings.showShenSha) {
				params['showshensha_sizhu'] = this.settings.showShenSha.siZhu.toString();
				params['showshensha_dayun'] = this.settings.showShenSha.daYun.toString();
				params['showshensha_liunian'] = this.settings.showShenSha.liuNian.toString();
				params['showshensha_xiaoyun'] = this.settings.showShenSha.xiaoYun.toString();
				params['showshensha_liuyue'] = this.settings.showShenSha.liuYue.toString();
			}

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

					// 获取性别参数，不使用默认值
					let gender = '';
					if (params.gender) {
						// 支持多种性别输入格式
						const genderValue = params.gender.trim().toLowerCase();
						if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
							gender = '1';
						} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
							gender = '0';
						}
					}

					// 获取八字信息
					const baziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.settings.baziSect);

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
					// 为代码块添加唯一标识符
					const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);

					// 添加源代码属性和唯一标识符，用于编辑时恢复和准确更新
					// 清理source中的特殊字符，确保选择器有效
					const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
					el.setAttribute('data-bazi-source', cleanSource);
					el.setAttribute('data-bazi-block-id', blockId);

					// 如果没有指定性别，显示性别选择界面
					if (!params.gender) {
						setTimeout(() => {
							console.log('开始添加性别选择界面');
							// 创建性别选择容器，添加到视图顶部
							const genderContainer = document.createElement('div');
							genderContainer.className = 'bazi-gender-container';
							genderContainer.setAttribute('style', 'background-color: rgba(0, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; width: 100%; box-sizing: border-box;');
							el.prepend(genderContainer);
							genderContainer.createDiv({
								text: '请选择性别：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建性别按钮容器
							const genderButtonsContainer = genderContainer.createDiv({
								attr: { 'style': 'display: flex; gap: 5px; justify-content: center;' }
							});

							// 创建性别按钮
							const maleButton = genderButtonsContainer.createEl('button', {
								text: '男',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});
							const femaleButton = genderButtonsContainer.createEl('button', {
								text: '女',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});

							// 为性别按钮添加事件监听器
							maleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 男\n`;
								updateCodeBlock(newSource, '男');
							});
							femaleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 女\n`;
								updateCodeBlock(newSource, '女');
							});

							// 更新代码块的辅助函数
							const updateCodeBlock = (newSource: string, genderLabel: string) => {
								try {
									const activeLeaf = this.app.workspace.activeLeaf;
									if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
										const editor = activeLeaf.view.editor;
										if (editor) {
											const sourceAttr = el.getAttribute('data-bazi-source');
											const blockId = el.getAttribute('data-bazi-block-id');
											if (sourceAttr && blockId) {
												// 手动实现 this.updateCodeBlockWithEditorAPI(newSource) 的功能
												console.log('尝试使用编辑器API更新代码块');

												// 显示状态通知
												const statusNotice = new Notice('尝试使用编辑器API更新代码块...', 0);

												// 获取当前活动的编辑器视图
												const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
												if (!activeView) {
													statusNotice.hide();
													console.log('无法获取活动的编辑器视图');
													new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
													return;
												}

												const editor = activeView.editor;
												console.log('获取到编辑器:', editor ? '成功' : '失败');

												if (!editor) {
													statusNotice.hide();
													new Notice('更新代码块失败：无法获取编辑器实例', 3000);
													return;
												}

												try {
													// 获取文档中所有的bazi代码块
													const text = editor.getValue();
													const lines = text.split('\n');

													console.log('开始在文档中查找bazi代码块');
													statusNotice.setMessage('正在查找八字命盘代码块...');

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
															console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
														} else if (line.startsWith('```') && inCodeBlock) {
															inCodeBlock = false;
															endLine = i;
															console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

															if (blockLanguage === 'bazi') {
																foundBlocks++;
																console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

													// 如果找到了多个代码块，尝试找到最匹配的
													if (blockContents.length > 0) {
														// 使用第一个代码块
														const block = blockContents[0];

														// 替换代码块内容
														const trimmedSource = newSource.trim();

														// 检测原始代码块的缩进
														let indentation = '';
														// 检查第一行的缩进
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

														statusNotice.hide();
														new Notice('八字命盘代码块已更新', 3000);
														console.log('使用编辑器API更新代码块成功');
													} else {
														statusNotice.hide();
														console.log('未找到任何bazi代码块');
														new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
													}
												} catch (error) {
													statusNotice.hide();
													console.error('使用编辑器API更新代码块时出错:', error);
													new Notice('更新代码块时出错: ' + error.message, 5000);
												}
												new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
												console.log(`已选择性别: ${genderLabel}, 更新代码块成功: ${newSource}`);
												console.log(`尝试更新代码块，源内容: ${sourceAttr}, 唯一标识符: ${blockId}`);
												this.app.workspace.trigger('layout-change');
												setTimeout(() => {
													const el = document.querySelector(`[data-bazi-block-id="${blockId}"]`);
													if (el) {
														// 手动解析代码块参数
									const params: BaziParams = {};
									const lines = newSource.split('\n');

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
														const gender = params.gender || '';
														// 重新获取八字信息
														let updatedBaziInfo;
														if (params.date) {
															const dateTime = params.date.trim().split(' ');
															const dateParts = dateTime[0].split('-').map(Number);
															const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];
															const year = dateParts[0];
															const month = dateParts[1];
															const day = dateParts[2];
															const hour = timeParts[0];
															updatedBaziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.settings.baziSect);
														}

														const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
														const cleanNewSource = newSource.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
														el.setAttribute('data-bazi-source', cleanNewSource);
														// 应用八字信息
														// 手动应用八字信息，替代 this.applyBaziInfo(updatedBaziInfo, params)
														const processedBaziInfo = updatedBaziInfo;

														// 应用神煞显示设置
														if (!processedBaziInfo.showShenSha) {
															processedBaziInfo.showShenSha = {};
														}

														if (params.showshensha_sizhu !== undefined) {
															processedBaziInfo.showShenSha.siZhu = params.showshensha_sizhu === 'true';
														}

														if (params.showshensha_dayun !== undefined) {
															processedBaziInfo.showShenSha.daYun = params.showshensha_dayun === 'true';
														}

														if (params.showshensha_liunian !== undefined) {
															processedBaziInfo.showShenSha.liuNian = params.showshensha_liunian === 'true';
														}

														if (params.showshensha_xiaoyun !== undefined) {
															processedBaziInfo.showShenSha.xiaoYun = params.showshensha_xiaoyun === 'true';
														}

														if (params.showshensha_liuyue !== undefined) {
															processedBaziInfo.showShenSha.liuYue = params.showshensha_liuyue === 'true';
														}

														if (this.settings.useInteractiveView) {
															new InteractiveBaziView(el as HTMLElement, processedBaziInfo, id);
														} else {
															el.innerHTML = BaziService.generateBaziHTML(processedBaziInfo, id);
															this.addSettingsButtonListeners(el as HTMLElement);
															this.addTableCellListeners(el as HTMLElement, id, processedBaziInfo);
														}
														// 手动应用显示选项，替代 this.applyDisplayOptions(el as HTMLElement, params)
														console.log('应用显示选项:', params);

														// 显示/隐藏五行分析
														if (params.showWuxing === 'false' || params.showWuxing === '0') {
															const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
															if (wuxingSection) {
																(wuxingSection as HTMLElement).style.display = 'none';
															}
														}

														// 显示/隐藏特殊信息
														if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
															const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
															if (specialInfoSection) {
																(specialInfoSection as HTMLElement).style.display = 'none';
															}
														}

														// 应用神煞显示设置
														if (params.showshensha_sizhu === 'false') {
															// 隐藏四柱神煞
															const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
															if (siZhuShenShaRow) {
																(siZhuShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_dayun === 'false') {
															// 隐藏大运神煞
															const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
															if (daYunShenShaRow) {
																(daYunShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_liunian === 'false') {
															// 隐藏流年神煞
															const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
															if (liuNianShenShaRow) {
																(liuNianShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_xiaoyun === 'false') {
															// 隐藏小运神煞
															const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
															if (xiaoYunShenShaRow) {
																(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_liuyue === 'false') {
															// 隐藏流月神煞
															const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
															if (liuYueShenShaRow) {
																(liuYueShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														// 设置标题
														if (params.title) {
															const titleEl = el.querySelector('.bazi-view-title');
															if (titleEl) {
																titleEl.textContent = params.title;
															}
														}

														// 设置主题
														if (params.theme) {
															const container = el.querySelector('.bazi-view-container');
															if (container) {
																if (params.theme === 'dark') {
																	container.classList.add('bazi-theme-dark');
																} else if (params.theme === 'light') {
																	container.classList.add('bazi-theme-light');
																} else if (params.theme === 'colorful') {
																	container.classList.add('bazi-theme-colorful');
																}
															}
														}

														// 保存设置到数据属性，方便后续使用
														const container = el.querySelector('.bazi-view-container');
														if (container) {
															// 保存显示选项
															if (params.showWuxing !== undefined) {
																container.setAttribute('data-show-wuxing', params.showWuxing);
															}

															if (params.showSpecialInfo !== undefined) {
																container.setAttribute('data-show-special-info', params.showSpecialInfo);
															}

															if (params.gender !== undefined) {
																container.setAttribute('data-gender', params.gender);
															}

															if (params.calculationMethod !== undefined) {
																container.setAttribute('data-calculation-method', params.calculationMethod);
															}

															// 保存神煞显示设置
															if (params.showshensha_sizhu !== undefined) {
																container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
															}

															if (params.showshensha_dayun !== undefined) {
																container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
															}

															if (params.showshensha_liunian !== undefined) {
																container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
															}

															if (params.showshensha_xiaoyun !== undefined) {
																container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
															}

															if (params.showshensha_liuyue !== undefined) {
																container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
															}
														}
														console.log('已直接重新渲染视图元素，唯一标识符: ' + blockId);
														// 隐藏性别选择栏
														const genderContainer = el.querySelector('.bazi-gender-container');
														if (genderContainer) {
															genderContainer.remove();
														}
														const activeLeaf = this.app.workspace.activeLeaf;
														if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
															const editor = activeLeaf.view.editor;
															const file = activeLeaf.view.file;
															if (editor && file) {
																// 直接使用编辑器API更新代码块，这样可以更精确地控制代码块的替换
																// 查找文档中的所有代码块
																const text = editor.getValue();
																const lines = text.split('\n');

																// 查找所有代码块
																let inCodeBlock = false;
																let startLine = -1;
																let endLine = -1;
																let blockLanguage = '';
																let foundBlock = false;

																for (let i = 0; i < lines.length; i++) {
																	const line = lines[i];

																	if (line.startsWith('```') && !inCodeBlock) {
																		inCodeBlock = true;
																		startLine = i;
																		blockLanguage = line.substring(3).trim();
																	} else if (line.startsWith('```') && inCodeBlock) {
																		inCodeBlock = false;
																		endLine = i;

																		// 检查是否是我们要找的代码块
																		if (blockLanguage === 'bazi') {
																			// 检查代码块内容是否包含我们的唯一标识符
																			let blockContent = '';
																			for (let j = startLine; j <= endLine; j++) {
																				blockContent += lines[j] + '\n';
																			}

																			if (blockContent.includes(`data-bazi-block-id="${blockId}"`)) {
																				foundBlock = true;
																				break;
																			}
																		}
																	}
																}

																if (foundBlock && startLine >= 0 && endLine >= 0) {
																	// 构建新的代码块内容
																	const trimmedSource = newSource.trim();

																	// 使用文件API更新文件内容
																	// 获取当前文件
																	const file = this.app.workspace.getActiveFile();
																	if (file) {
																		// 读取文件内容
																		this.app.vault.read(file).then(content => {
																			// 将内容分割成行
																			const lines = content.split('\n');

																			// 检测原始代码块的缩进
																			let indentation = '';
																			// 检查第一行的缩进
																			if (startLine + 1 < lines.length) {
																				const firstLine = lines[startLine + 1];
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

																			// 替换代码块
																			const beforeBlock = lines.slice(0, startLine).join('\n');
																			const afterBlock = lines.slice(endLine + 1).join('\n');
																			const newBlock = '```bazi\n' + indentedSource + '\n```';

																			// 构建新的文件内容
																			const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

																			// 更新文件内容
																			this.app.vault.modify(file, newContent);
																		});
																	}

																	console.log('代码块已更新，使用文件API直接替换');
																	new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
																} else {
																	console.error('未找到匹配的代码块');
																	new Notice('更新代码块失败：未找到匹配的代码块');
																}
															}
														}
													} else {
														console.log('未找到对应的视图元素，无法直接重新渲染，唯一标识符: ' + blockId);
													}
												}, 100);
											} else {
												throw new Error('无法找到代码块源内容或唯一标识符');
											}
										} else {
											throw new Error('无法获取编辑器实例');
										}
									} else {
										throw new Error('当前活动视图不是Markdown视图');
									}
								} catch (error) {
									new Notice(`更新代码块失败: ${error.message}`);
									console.error(`更新代码块失败: ${error}`);
								}
							};

							// 调试信息
							console.log('性别选择按钮已添加到视图中');
							console.log('性别选择界面添加完成');
						}, 100); // 延迟100ms以确保视图渲染完成
					}

					if (this.settings.useInteractiveView) {
						// 使用交互式视图
						new InteractiveBaziView(el, baziInfo, id);
					} else {
						// 使用传统视图
						el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);

						// 为设置按钮添加事件监听器
						this.addSettingsButtonListeners(el);
						// 为表格单元格添加事件监听器
						this.addTableCellListeners(el, id, baziInfo);
					}

					// 应用额外的显示选项
					// 手动应用显示选项，替代 this.applyDisplayOptions(el, params)
					console.log('应用显示选项:', params);

					// 显示/隐藏五行分析
					if (params.showWuxing === 'false' || params.showWuxing === '0') {
						const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
						if (wuxingSection) {
							(wuxingSection as HTMLElement).style.display = 'none';
						}
					}

					// 显示/隐藏特殊信息
					if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
						const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
						if (specialInfoSection) {
							(specialInfoSection as HTMLElement).style.display = 'none';
						}
					}

					// 应用神煞显示设置
					if (params.showshensha_sizhu === 'false') {
						// 隐藏四柱神煞
						const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
						if (siZhuShenShaRow) {
							(siZhuShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_dayun === 'false') {
						// 隐藏大运神煞
						const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
						if (daYunShenShaRow) {
							(daYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liunian === 'false') {
						// 隐藏流年神煞
						const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
						if (liuNianShenShaRow) {
							(liuNianShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_xiaoyun === 'false') {
						// 隐藏小运神煞
						const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
						if (xiaoYunShenShaRow) {
							(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liuyue === 'false') {
						// 隐藏流月神煞
						const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
						if (liuYueShenShaRow) {
							(liuYueShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					// 设置标题
					if (params.title) {
						const titleEl = el.querySelector('.bazi-view-title');
						if (titleEl) {
							titleEl.textContent = params.title;
						}
					}

					// 设置主题
					if (params.theme) {
						const container = el.querySelector('.bazi-view-container');
						if (container) {
							if (params.theme === 'dark') {
								container.classList.add('bazi-theme-dark');
							} else if (params.theme === 'light') {
								container.classList.add('bazi-theme-light');
							} else if (params.theme === 'colorful') {
								container.classList.add('bazi-theme-colorful');
							}
						}
					}

					// 保存设置到数据属性，方便后续使用
					const container = el.querySelector('.bazi-view-container');
					if (container) {
						// 保存显示选项
						if (params.showWuxing !== undefined) {
							container.setAttribute('data-show-wuxing', params.showWuxing);
						}

						if (params.showSpecialInfo !== undefined) {
							container.setAttribute('data-show-special-info', params.showSpecialInfo);
						}

						if (params.gender !== undefined) {
							container.setAttribute('data-gender', params.gender);
						}

						if (params.calculationMethod !== undefined) {
							container.setAttribute('data-calculation-method', params.calculationMethod);
						}

						// 保存神煞显示设置
						if (params.showshensha_sizhu !== undefined) {
							container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
						}

						if (params.showshensha_dayun !== undefined) {
							container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
						}

						if (params.showshensha_liunian !== undefined) {
							container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
						}

						if (params.showshensha_xiaoyun !== undefined) {
							container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
						}

						if (params.showshensha_liuyue !== undefined) {
							container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
						}
					}
				} catch (error) {
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else if (params.lunar) {
				try {
					// 解析农历日期
					const dateTime = params.lunar.trim().split(' ');
					const dateParts = dateTime[0].split('-').map(Number);
					const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];

					const year = dateParts[0];
					const month = dateParts[1];
					const day = dateParts[2];
					const hour = timeParts[0];
					const isLeap = params.leap === 'true';

					// 获取性别参数，不使用默认值
					let gender = '';
					if (params.gender) {
						// 支持多种性别输入格式
						const genderValue = params.gender.trim().toLowerCase();
						if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
							gender = '1';
						} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
							gender = '0';
						}
					}

					// 获取八字信息
					const baziInfo = BaziService.getBaziFromLunarDate(year, month, day, hour, isLeap, gender, this.settings.baziSect);

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
					// 为代码块添加唯一标识符
					const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);

					// 添加源代码属性和唯一标识符，用于编辑时恢复和准确更新
					// 清理source中的特殊字符，确保选择器有效
					const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
					el.setAttribute('data-bazi-source', cleanSource);
					el.setAttribute('data-bazi-block-id', blockId);

					// 如果没有指定性别，显示性别选择界面
					if (!params.gender) {
						setTimeout(() => {
							console.log('开始添加性别选择界面');
							// 创建性别选择容器，添加到视图顶部
							const genderContainer = document.createElement('div');
							genderContainer.className = 'bazi-gender-container';
							genderContainer.setAttribute('style', 'background-color: rgba(0, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; width: 100%; box-sizing: border-box;');
							el.prepend(genderContainer);
							genderContainer.createDiv({
								text: '请选择性别：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建性别按钮容器
							const genderButtonsContainer = genderContainer.createDiv({
								attr: { 'style': 'display: flex; gap: 5px; justify-content: center;' }
							});

							// 创建性别按钮
							const maleButton = genderButtonsContainer.createEl('button', {
								text: '男',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});
							const femaleButton = genderButtonsContainer.createEl('button', {
								text: '女',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});

							// 为性别按钮添加事件监听器
							maleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 男\n`;
								updateCodeBlock(newSource, '男');
							});
							femaleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 女\n`;
								updateCodeBlock(newSource, '女');
							});

							// 更新代码块的辅助函数
							const updateCodeBlock = (newSource: string, genderLabel: string) => {
								try {
									const activeLeaf = this.app.workspace.activeLeaf;
									if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
										const editor = activeLeaf.view.editor;
										if (editor) {
											const sourceAttr = el.getAttribute('data-bazi-source');
											const blockId = el.getAttribute('data-bazi-block-id');
											if (sourceAttr && blockId) {
												// 手动实现 this.updateCodeBlockWithEditorAPI(newSource) 的功能
												console.log('尝试使用编辑器API更新代码块');

												// 显示状态通知
												const statusNotice = new Notice('尝试使用编辑器API更新代码块...', 0);

												// 获取当前活动的编辑器视图
												const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
												if (!activeView) {
													statusNotice.hide();
													console.log('无法获取活动的编辑器视图');
													new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
													return;
												}

												const editor = activeView.editor;
												console.log('获取到编辑器:', editor ? '成功' : '失败');

												if (!editor) {
													statusNotice.hide();
													new Notice('更新代码块失败：无法获取编辑器实例', 3000);
													return;
												}

												try {
													// 获取文档中所有的bazi代码块
													const text = editor.getValue();
													const lines = text.split('\n');

													console.log('开始在文档中查找bazi代码块');
													statusNotice.setMessage('正在查找八字命盘代码块...');

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
															console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
														} else if (line.startsWith('```') && inCodeBlock) {
															inCodeBlock = false;
															endLine = i;
															console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

															if (blockLanguage === 'bazi') {
																foundBlocks++;
																console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

													// 如果找到了多个代码块，尝试找到最匹配的
													if (blockContents.length > 0) {
														// 使用第一个代码块
														const block = blockContents[0];

														// 替换代码块内容
														const trimmedSource = newSource.trim();

														// 检测原始代码块的缩进
														let indentation = '';
														// 检查第一行的缩进
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

														statusNotice.hide();
														new Notice('八字命盘代码块已更新', 3000);
														console.log('使用文件API更新代码块成功');
													} else {
														statusNotice.hide();
														console.log('未找到任何bazi代码块');
														new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
													}
												} catch (error) {
													statusNotice.hide();
													console.error('使用编辑器API更新代码块时出错:', error);
													new Notice('更新代码块时出错: ' + error.message, 5000);
												}
												new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
												console.log(`已选择性别: ${genderLabel}, 更新代码块成功: ${newSource}`);
												console.log(`尝试更新代码块，源内容: ${sourceAttr}, 唯一标识符: ${blockId}`);
												this.app.workspace.trigger('layout-change');
												setTimeout(() => {
													const el = document.querySelector(`[data-bazi-block-id="${blockId}"]`);
													if (el) {
														// 手动实现 this.parseCodeBlockParams(newSource) 的功能
														const params: BaziParams = {};
														const lines = newSource.split('\n');

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
														const gender = params.gender || '';
														// 重新获取八字信息
														let year, month, day, hour;
														if (params.lunar) {
															const dateTime = params.lunar.trim().split(' ');
															const dateParts = dateTime[0].split('-').map(Number);
															const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];
															year = dateParts[0];
															month = dateParts[1];
															day = dateParts[2];
															hour = timeParts[0];
														}
														const isLeap = params.leap === 'true';
														const updatedBaziInfo = BaziService.getBaziFromLunarDate(year, month, day, hour, isLeap, gender, this.settings.baziSect);

														const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
														const cleanNewSource = newSource.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
														el.setAttribute('data-bazi-source', cleanNewSource);
														// 应用八字信息
														// 手动实现 this.applyBaziInfo(updatedBaziInfo, params) 的功能
														const processedBaziInfo = updatedBaziInfo;

														if (this.settings.useInteractiveView) {
															new InteractiveBaziView(el as HTMLElement, processedBaziInfo, id);
														} else {
															el.innerHTML = BaziService.generateBaziHTML(processedBaziInfo, id);
															this.addSettingsButtonListeners(el as HTMLElement);
															this.addTableCellListeners(el as HTMLElement, id, processedBaziInfo);
														}
														this.applyDisplayOptions(el as HTMLElement, params);
														console.log('已直接重新渲染视图元素，唯一标识符: ' + blockId);
														// 隐藏性别选择栏
														const genderContainer = el.querySelector('.bazi-gender-container');
														if (genderContainer) {
															genderContainer.remove();
														}
														const activeLeaf = this.app.workspace.activeLeaf;
														if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
															const editor = activeLeaf.view.editor;
															const file = activeLeaf.view.file;
															if (editor && file) {
																// 直接使用文件API更新代码块，这样可以更精确地控制代码块的替换
																// 查找文档中的所有代码块
																const text = editor.getValue();
																const lines = text.split('\n');

																// 查找所有代码块
																let inCodeBlock = false;
																let startLine = -1;
																let endLine = -1;
																let blockLanguage = '';
																let foundBlock = false;

																for (let i = 0; i < lines.length; i++) {
																	const line = lines[i];

																	if (line.startsWith('```') && !inCodeBlock) {
																		inCodeBlock = true;
																		startLine = i;
																		blockLanguage = line.substring(3).trim();
																	} else if (line.startsWith('```') && inCodeBlock) {
																		inCodeBlock = false;
																		endLine = i;

																		// 检查是否是我们要找的代码块
																		if (blockLanguage === 'bazi') {
																			// 检查代码块内容是否包含我们的唯一标识符
																			let blockContent = '';
																			for (let j = startLine; j <= endLine; j++) {
																				blockContent += lines[j] + '\n';
																			}

																			if (blockContent.includes(`data-bazi-block-id="${blockId}"`)) {
																				foundBlock = true;
																				break;
																			}
																		}
																	}
																}

																if (foundBlock && startLine >= 0 && endLine >= 0) {
																	// 构建新的代码块内容
																	const trimmedSource = newSource.trim();

																	// 使用文件API更新文件内容
																	// 获取当前文件
																	const file = this.app.workspace.getActiveFile();
																	if (file) {
																		// 读取文件内容
																		this.app.vault.read(file).then(content => {
																			// 将内容分割成行
																			const lines = content.split('\n');

																			// 替换代码块
																			const beforeBlock = lines.slice(0, startLine).join('\n');
																			const afterBlock = lines.slice(endLine + 1).join('\n');
																			const newBlock = '```bazi\n' + trimmedSource + '\n```';

																			// 构建新的文件内容
																			const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

																			// 更新文件内容
																			this.app.vault.modify(file, newContent);
																		});
																	}

																	console.log('代码块已更新，使用文件API直接替换');
																	new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
																} else {
																	console.error('未找到匹配的代码块');
																	new Notice('更新代码块失败：未找到匹配的代码块');
																}
															}
														}
													} else {
														console.log('未找到对应的视图元素，无法直接重新渲染，唯一标识符: ' + blockId);
													}
												}, 100);
											} else {
												throw new Error('无法找到代码块源内容或唯一标识符');
											}
										} else {
											throw new Error('无法获取编辑器实例');
										}
									} else {
										throw new Error('当前活动视图不是Markdown视图');
									}
								} catch (error) {
									new Notice(`更新代码块失败: ${error.message}`);
									console.error(`更新代码块失败: ${error}`);
								}
							};

							// 调试信息
							console.log('性别选择按钮已添加到视图中');
							console.log('性别选择界面添加完成');
						}, 100); // 延迟100ms以确保视图渲染完成
					}

					if (this.settings.useInteractiveView) {
						// 使用交互式视图
						new InteractiveBaziView(el, baziInfo, id);
					} else {
						// 使用传统视图
						el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);

						// 为设置按钮添加事件监听器
						this.addSettingsButtonListeners(el);
						// 为表格单元格添加事件监听器
						this.addTableCellListeners(el, id, baziInfo);
					}

					// 应用额外的显示选项
					// 手动应用显示选项，替代 this.applyDisplayOptions(el, params)
					console.log('应用显示选项:', params);

					// 显示/隐藏五行分析
					if (params.showWuxing === 'false' || params.showWuxing === '0') {
						const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
						if (wuxingSection) {
							(wuxingSection as HTMLElement).style.display = 'none';
						}
					}

					// 显示/隐藏特殊信息
					if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
						const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
						if (specialInfoSection) {
							(specialInfoSection as HTMLElement).style.display = 'none';
						}
					}

					// 应用神煞显示设置
					if (params.showshensha_sizhu === 'false') {
						// 隐藏四柱神煞
						const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
						if (siZhuShenShaRow) {
							(siZhuShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_dayun === 'false') {
						// 隐藏大运神煞
						const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
						if (daYunShenShaRow) {
							(daYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liunian === 'false') {
						// 隐藏流年神煞
						const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
						if (liuNianShenShaRow) {
							(liuNianShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_xiaoyun === 'false') {
						// 隐藏小运神煞
						const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
						if (xiaoYunShenShaRow) {
							(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liuyue === 'false') {
						// 隐藏流月神煞
						const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
						if (liuYueShenShaRow) {
							(liuYueShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					// 设置标题
					if (params.title) {
						const titleEl = el.querySelector('.bazi-view-title');
						if (titleEl) {
							titleEl.textContent = params.title;
						}
					}

					// 设置主题
					if (params.theme) {
						const container = el.querySelector('.bazi-view-container');
						if (container) {
							if (params.theme === 'dark') {
								container.classList.add('bazi-theme-dark');
							} else if (params.theme === 'light') {
								container.classList.add('bazi-theme-light');
							} else if (params.theme === 'colorful') {
								container.classList.add('bazi-theme-colorful');
							}
						}
					}

					// 保存设置到数据属性，方便后续使用
					const container = el.querySelector('.bazi-view-container');
					if (container) {
						// 保存显示选项
						if (params.showWuxing !== undefined) {
							container.setAttribute('data-show-wuxing', params.showWuxing);
						}

						if (params.showSpecialInfo !== undefined) {
							container.setAttribute('data-show-special-info', params.showSpecialInfo);
						}

						if (params.gender !== undefined) {
							container.setAttribute('data-gender', params.gender);
						}

						if (params.calculationMethod !== undefined) {
							container.setAttribute('data-calculation-method', params.calculationMethod);
						}

						// 保存神煞显示设置
						if (params.showshensha_sizhu !== undefined) {
							container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
						}

						if (params.showshensha_dayun !== undefined) {
							container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
						}

						if (params.showshensha_liunian !== undefined) {
							container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
						}

						if (params.showshensha_xiaoyun !== undefined) {
							container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
						}

						if (params.showshensha_liuyue !== undefined) {
							container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
						}
					}
				} catch (error) {
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else if (params.bazi) {
				try {
					// 获取性别参数，不使用默认值
					let gender = '';
					if (params.gender) {
						// 支持多种性别输入格式
						const genderValue = params.gender.trim().toLowerCase();
						if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
							gender = '1';
						} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
							gender = '0';
						}
					}

					// 获取年份参数
					let specifiedYear: number | undefined = undefined;
					if (params.year) {
						specifiedYear = parseInt(params.year);
						if (isNaN(specifiedYear)) {
							specifiedYear = undefined;
						}
					}

					// 解析八字字符串
					const baziInfo = BaziService.parseBaziString(params.bazi, gender, this.settings.baziSect, specifiedYear);
					console.log('解析八字字符串结果:', baziInfo);

					// 如果没有指定年份且有匹配的年份列表，显示年份选择界面
					if (!specifiedYear && baziInfo.matchingYears && baziInfo.matchingYears.length > 0) {
						// 使用setTimeout延迟添加年份选择框，确保视图已经渲染完成
						setTimeout(() => {
							console.log('开始添加年份选择界面');
							// 创建提示信息和选择框，添加到视图顶部
							const tipContainer = document.createElement('div');
							tipContainer.className = 'bazi-tip-container';
							tipContainer.setAttribute('style', 'background-color: rgba(255, 255, 0, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; top: 0; width: 100%; box-sizing: border-box;');
							el.prepend(tipContainer);
							tipContainer.createDiv({
								text: '此八字对应多个年份，请点击下方年份按钮选择：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建年份按钮容器
							const yearsContainer = tipContainer.createDiv({
								attr: { 'style': 'display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;' }
							});

							// 为每个年份创建按钮
							(baziInfo.matchingYears as number[]).forEach(year => {
								const yearButton = yearsContainer.createEl('button', {
									text: year.toString(),
									attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
								});
								yearButton.addEventListener('click', () => {
									// 尝试直接更新代码块
									// 处理源代码，确保格式正确
									let cleanedSource = source.trim();
									// 移除源代码末尾可能存在的反引号
									if (cleanedSource.endsWith('```')) {
										cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
									}
									// 确保源代码末尾有换行符
									if (!cleanedSource.endsWith('\n')) {
										cleanedSource += '\n';
									}
									// 添加年份参数
									const newSource = cleanedSource + `year: ${year}\n`;
									try {
										// 获取当前活动的编辑器
										const activeLeaf = this.app.workspace.activeLeaf;
										if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
											const editor = activeLeaf.view.editor;
											if (editor) {
												// 查找当前代码块的位置
												const sourceAttr = el.getAttribute('data-bazi-source');
												if (sourceAttr) {
													// 假设代码块内容可以通过属性找到
													// 直接替换代码块内容
													// 手动实现 this.updateCodeBlockWithFileAPI(newSource) 的功能
													console.log('尝试使用文件API更新代码块');

													// 显示状态通知
													const statusNotice = new Notice('尝试使用文件API更新代码块...', 0);

													// 获取当前活动的编辑器视图
													const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
													if (!activeView) {
														statusNotice.hide();
														console.log('无法获取活动的编辑器视图');
														new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
														return;
													}

													const editor = activeView.editor;
													console.log('获取到编辑器:', editor ? '成功' : '失败');

													if (!editor) {
														statusNotice.hide();
														new Notice('更新代码块失败：无法获取编辑器实例', 3000);
														return;
													}

													try {
														// 获取文档中所有的bazi代码块
														const text = editor.getValue();
														const lines = text.split('\n');

														console.log('开始在文档中查找bazi代码块');
														statusNotice.setMessage('正在查找八字命盘代码块...');

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
																console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
															} else if (line.startsWith('```') && inCodeBlock) {
																inCodeBlock = false;
																endLine = i;
																console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

																if (blockLanguage === 'bazi') {
																	foundBlocks++;
																	console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

														// 如果找到了多个代码块，尝试找到最匹配的
														if (blockContents.length > 0) {
															// 使用第一个代码块
															const block = blockContents[0];

															// 替换代码块内容
															const trimmedSource = newSource.trim();

															// 检测原始代码块的缩进
															let indentation = '';
															// 检查第一行的缩进
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

															statusNotice.hide();
															new Notice('八字命盘代码块已更新', 3000);
															console.log('使用文件API更新代码块成功');
														} else {
															statusNotice.hide();
															console.log('未找到任何bazi代码块');
															new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
														}
													} catch (error) {
														statusNotice.hide();
														console.error('使用文件API更新代码块时出错:', error);
														new Notice('更新代码块时出错: ' + error.message, 5000);
													}
													new Notice(`已选择年份 ${year} 并更新代码块`);
													console.log(`已选择年份: ${year}, 更新代码块成功: ${newSource}`);
													console.log('代码块更新成功，检查是否包含年份参数');
													// 触发页面重新渲染
													this.app.workspace.trigger('layout-change');
													console.log('已触发layout-change事件，重新渲染页面');
													// 直接重新渲染对应的视图元素
													setTimeout(() => {
														// 清理source中的特殊字符，确保选择器有效
														const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
														const el = document.querySelector(`[data-bazi-source="${cleanSource}"]`);
														if (el) {
															const blockId = el.getAttribute('data-bazi-block-id');
															// 手动解析代码块参数
															const params: BaziParams = {};
															const lines = newSource.split('\n');

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
															const gender = params.gender || '';
															const baziInfo = BaziService.parseBaziString(params.bazi || '', gender, this.settings.baziSect, year);
															const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
															// 清理newSource中的特殊字符
															const cleanNewSource = newSource.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
															el.setAttribute('data-bazi-source', cleanNewSource);
															// 应用八字信息
															// 手动实现 this.applyBaziInfo(baziInfo, params) 的功能
															const processedBaziInfo = baziInfo;

															if (this.settings.useInteractiveView) {
																new InteractiveBaziView(el as HTMLElement, processedBaziInfo, id);
															} else {
																el.innerHTML = BaziService.generateBaziHTML(processedBaziInfo, id);
																this.addSettingsButtonListeners(el as HTMLElement);
																this.addTableCellListeners(el as HTMLElement, id, processedBaziInfo);
															}
															// 手动应用显示选项，替代 this.applyDisplayOptions(el as HTMLElement, params)
															console.log('应用显示选项:', params);

															// 显示/隐藏五行分析
															if (params.showWuxing === 'false' || params.showWuxing === '0') {
																const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
																if (wuxingSection) {
																	(wuxingSection as HTMLElement).style.display = 'none';
																}
															}

															// 显示/隐藏特殊信息
															if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
																const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
																if (specialInfoSection) {
																	(specialInfoSection as HTMLElement).style.display = 'none';
																}
															}

															// 应用神煞显示设置
															if (params.showshensha_sizhu === 'false') {
																// 隐藏四柱神煞
																const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
																if (siZhuShenShaRow) {
																	(siZhuShenShaRow as HTMLElement).style.display = 'none';
																}
															}

															if (params.showshensha_dayun === 'false') {
																// 隐藏大运神煞
																const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
																if (daYunShenShaRow) {
																	(daYunShenShaRow as HTMLElement).style.display = 'none';
																}
															}

															if (params.showshensha_liunian === 'false') {
																// 隐藏流年神煞
																const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
																if (liuNianShenShaRow) {
																	(liuNianShenShaRow as HTMLElement).style.display = 'none';
																}
															}

															if (params.showshensha_xiaoyun === 'false') {
																// 隐藏小运神煞
																const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
																if (xiaoYunShenShaRow) {
																	(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
																}
															}

															if (params.showshensha_liuyue === 'false') {
																// 隐藏流月神煞
																const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
																if (liuYueShenShaRow) {
																	(liuYueShenShaRow as HTMLElement).style.display = 'none';
																}
															}

															// 设置标题
															if (params.title) {
																const titleEl = el.querySelector('.bazi-view-title');
																if (titleEl) {
																	titleEl.textContent = params.title;
																}
															}

															// 设置主题
															if (params.theme) {
																const container = el.querySelector('.bazi-view-container');
																if (container) {
																	if (params.theme === 'dark') {
																		container.classList.add('bazi-theme-dark');
																	} else if (params.theme === 'light') {
																		container.classList.add('bazi-theme-light');
																	} else if (params.theme === 'colorful') {
																		container.classList.add('bazi-theme-colorful');
																	}
																}
															}

															// 保存设置到数据属性，方便后续使用
															const container = el.querySelector('.bazi-view-container');
															if (container) {
																// 保存显示选项
																if (params.showWuxing !== undefined) {
																	container.setAttribute('data-show-wuxing', params.showWuxing);
																}

																if (params.showSpecialInfo !== undefined) {
																	container.setAttribute('data-show-special-info', params.showSpecialInfo);
																}

																if (params.gender !== undefined) {
																	container.setAttribute('data-gender', params.gender);
																}

																if (params.calculationMethod !== undefined) {
																	container.setAttribute('data-calculation-method', params.calculationMethod);
																}

																// 保存神煞显示设置
																if (params.showshensha_sizhu !== undefined) {
																	container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
																}

																if (params.showshensha_dayun !== undefined) {
																	container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
																}

																if (params.showshensha_liunian !== undefined) {
																	container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
																}

																if (params.showshensha_xiaoyun !== undefined) {
																	container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
																}

																if (params.showshensha_liuyue !== undefined) {
																	container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
																}
															}
															console.log('已直接重新渲染视图元素');
															// 确保文件内容也被修改并保存，使用唯一标识符准确匹配当前代码块
															const activeLeaf = this.app.workspace.activeLeaf;
															if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
																const editor = activeLeaf.view.editor;
																const file = activeLeaf.view.file;
																if (editor && file) {
																	// 直接使用文件API更新代码块，这样可以更精确地控制代码块的替换
																	// 查找文档中的所有代码块
																	const text = editor.getValue();
																	const lines = text.split('\n');

																	// 查找所有代码块
																	let inCodeBlock = false;
																	let startLine = -1;
																	let endLine = -1;
																	let blockLanguage = '';
																	let foundBlock = false;

																	for (let i = 0; i < lines.length; i++) {
																		const line = lines[i];

																		if (line.startsWith('```') && !inCodeBlock) {
																			inCodeBlock = true;
																			startLine = i;
																			blockLanguage = line.substring(3).trim();
																		} else if (line.startsWith('```') && inCodeBlock) {
																			inCodeBlock = false;
																			endLine = i;

																			// 检查是否是我们要找的代码块
																			if (blockLanguage === 'bazi') {
																				// 检查代码块内容是否包含我们的唯一标识符
																				let blockContent = '';
																				for (let j = startLine; j <= endLine; j++) {
																					blockContent += lines[j] + '\n';
																				}

																				if (blockContent.includes(`data-bazi-block-id="${blockId}"`)) {
																					foundBlock = true;
																					break;
																				}
																			}
																		}
																	}

																	if (foundBlock && startLine >= 0 && endLine >= 0) {
																		// 构建新的代码块内容
																		const trimmedSource = newSource.trim();

																		// 使用文件API更新文件内容
																		// 获取当前文件
																		const file = this.app.workspace.getActiveFile();
																		if (file) {
																			// 读取文件内容
																			this.app.vault.read(file).then(content => {
																				// 将内容分割成行
																				const lines = content.split('\n');

																				// 检测原始代码块的缩进
																				let indentation = '';
																				// 检查第一行的缩进
																				if (startLine + 1 < lines.length) {
																					const firstLine = lines[startLine + 1];
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

																				// 替换代码块
																				const beforeBlock = lines.slice(0, startLine).join('\n');
																				const afterBlock = lines.slice(endLine + 1).join('\n');
																				const newBlock = '```bazi\n' + indentedSource + '\n```';

																				// 构建新的文件内容
																				const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

																				// 更新文件内容
																				this.app.vault.modify(file, newContent);
																			});
																		}

																		console.log('代码块已更新，使用文件API直接替换');
																		new Notice(`已选择年份 ${year} 并更新代码块`);
																	} else {
																		console.error('未找到匹配的代码块');
																		new Notice('更新代码块失败：未找到匹配的代码块');
																	}
																}
															}
														} else {
															console.log('未找到对应的视图元素，无法直接重新渲染');
														}
													}, 100);
												} else {
													throw new Error('无法找到代码块源内容');
												}
											} else {
												throw new Error('无法获取编辑器实例');
											}
										} else {
											throw new Error('当前活动视图不是Markdown视图');
										}
									} catch (error) {
										new Notice(`更新代码块失败: ${error.message}`);
										console.error(`更新代码块失败: ${error}`);
									}
								});
							});
							// 调试信息
							console.log('年份选择按钮已添加到视图中', baziInfo.matchingYears);
							console.log('年份选择界面添加完成');
						}, 100); // 延迟100ms以确保视图渲染完成
					}

					// 如果没有指定性别，显示性别选择界面
					if (!params.gender) {
						setTimeout(() => {
							console.log('开始添加性别选择界面');
							// 创建性别选择容器，添加到视图顶部（在年份选择之后）
							const genderContainer = document.createElement('div');
							genderContainer.className = 'bazi-gender-container';
							genderContainer.setAttribute('style', 'background-color: rgba(0, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; width: 100%; box-sizing: border-box;');
							el.prepend(genderContainer);
							genderContainer.createDiv({
								text: '请选择性别：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建性别按钮容器
							const genderButtonsContainer = genderContainer.createDiv({
								attr: { 'style': 'display: flex; gap: 5px; justify-content: center;' }
							});

							// 创建性别按钮
							const maleButton = genderButtonsContainer.createEl('button', {
								text: '男',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});
							const femaleButton = genderButtonsContainer.createEl('button', {
								text: '女',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});

							// 为性别按钮添加事件监听器
							maleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 男\n`;
								updateCodeBlock(newSource, '男');
							});
							femaleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 女\n`;
								updateCodeBlock(newSource, '女');
							});

							// 更新代码块的辅助函数
							const updateCodeBlock = (newSource: string, genderLabel: string) => {
								try {
									const activeLeaf = this.app.workspace.activeLeaf;
									if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
										const editor = activeLeaf.view.editor;
										if (editor) {
											const sourceAttr = el.getAttribute('data-bazi-source');
											const blockId = el.getAttribute('data-bazi-block-id');
											if (sourceAttr && blockId) {
												// 手动实现 this.updateCodeBlockWithEditorAPI(newSource) 的功能
												console.log('尝试使用编辑器API更新代码块');

												// 显示状态通知
												const statusNotice = new Notice('尝试使用编辑器API更新代码块...', 0);

												// 获取当前活动的编辑器视图
												const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
												if (!activeView) {
													statusNotice.hide();
													console.log('无法获取活动的编辑器视图');
													new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
													return;
												}

												const editor = activeView.editor;
												console.log('获取到编辑器:', editor ? '成功' : '失败');

												if (!editor) {
													statusNotice.hide();
													new Notice('更新代码块失败：无法获取编辑器实例', 3000);
													return;
												}

												try {
													// 获取文档中所有的bazi代码块
													const text = editor.getValue();
													const lines = text.split('\n');

													console.log('开始在文档中查找bazi代码块');
													statusNotice.setMessage('正在查找八字命盘代码块...');

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
															console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
														} else if (line.startsWith('```') && inCodeBlock) {
															inCodeBlock = false;
															endLine = i;
															console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

															if (blockLanguage === 'bazi') {
																foundBlocks++;
																console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

													// 如果找到了多个代码块，尝试找到最匹配的
													if (blockContents.length > 0) {
														// 使用第一个代码块
														const block = blockContents[0];

														// 替换代码块内容
														const trimmedSource = newSource.trim();

														// 使用编辑器API替换代码块
														editor.replaceRange(
															trimmedSource,
															{line: block.start + 1, ch: 0},
															{line: block.end, ch: 0}
														);

														statusNotice.hide();
														new Notice('八字命盘代码块已更新', 3000);
														console.log('使用编辑器API更新代码块成功');
													} else {
														statusNotice.hide();
														console.log('未找到任何bazi代码块');
														new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
													}
												} catch (error) {
													statusNotice.hide();
													console.error('使用编辑器API更新代码块时出错:', error);
													new Notice('更新代码块时出错: ' + error.message, 5000);
												}
												new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
												console.log(`已选择性别: ${genderLabel}, 更新代码块成功: ${newSource}`);
												console.log(`尝试更新代码块，源内容: ${sourceAttr}, 唯一标识符: ${blockId}`);
												this.app.workspace.trigger('layout-change');
												setTimeout(() => {
													const el = document.querySelector(`[data-bazi-block-id="${blockId}"]`);
													if (el) {
														// 手动解析代码块参数
														const params: BaziParams = {};
														const lines = newSource.split('\n');

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
														const gender = params.gender || '';
														const baziInfo = BaziService.parseBaziString(params.bazi || '', gender, this.settings.baziSect, specifiedYear);
														const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
														const cleanNewSource = newSource.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
														el.setAttribute('data-bazi-source', cleanNewSource);
														if (this.settings.useInteractiveView) {
															new InteractiveBaziView(el as HTMLElement, baziInfo, id);
														} else {
															el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);
															this.addSettingsButtonListeners(el as HTMLElement);
															this.addTableCellListeners(el as HTMLElement, id, baziInfo);
														}
														this.applyDisplayOptions(el as HTMLElement, params);
														console.log('已直接重新渲染视图元素，唯一标识符: ' + blockId);
														// 隐藏性别选择栏
														const genderContainer = el.querySelector('.bazi-gender-container');
														if (genderContainer) {
															genderContainer.remove();
														}
														const activeLeaf = this.app.workspace.activeLeaf;
														if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
															const editor = activeLeaf.view.editor;
															const file = activeLeaf.view.file;
															if (editor && file) {
																// 直接使用文件API更新代码块，这样可以更精确地控制代码块的替换
																// 查找文档中的所有代码块
																const text = editor.getValue();
																const lines = text.split('\n');

																// 查找所有代码块
																let inCodeBlock = false;
																let startLine = -1;
																let endLine = -1;
																let blockLanguage = '';
																let foundBlock = false;

																for (let i = 0; i < lines.length; i++) {
																	const line = lines[i];

																	if (line.startsWith('```') && !inCodeBlock) {
																		inCodeBlock = true;
																		startLine = i;
																		blockLanguage = line.substring(3).trim();
																	} else if (line.startsWith('```') && inCodeBlock) {
																		inCodeBlock = false;
																		endLine = i;

																		// 检查是否是我们要找的代码块
																		if (blockLanguage === 'bazi') {
																			// 检查代码块内容是否包含我们的唯一标识符
																			let blockContent = '';
																			for (let j = startLine; j <= endLine; j++) {
																				blockContent += lines[j] + '\n';
																			}

																			if (blockContent.includes(`data-bazi-block-id="${blockId}"`)) {
																				foundBlock = true;
																				break;
																			}
																		}
																	}
																}

																if (foundBlock && startLine >= 0 && endLine >= 0) {
																	// 构建新的代码块内容
																	const trimmedSource = newSource.trim();

																	// 使用文件API更新文件内容
																	// 获取当前文件
																	const file = this.app.workspace.getActiveFile();
																	if (file) {
																		// 读取文件内容
																		this.app.vault.read(file).then(content => {
																			// 将内容分割成行
																			const lines = content.split('\n');

																			// 检测原始代码块的缩进
																			let indentation = '';
																			// 检查第一行的缩进
																			if (startLine + 1 < lines.length) {
																				const firstLine = lines[startLine + 1];
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

																			// 替换代码块
																			const beforeBlock = lines.slice(0, startLine).join('\n');
																			const afterBlock = lines.slice(endLine + 1).join('\n');
																			const newBlock = '```bazi\n' + indentedSource + '\n```';

																			// 构建新的文件内容
																			const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

																			// 更新文件内容
																			this.app.vault.modify(file, newContent);
																		});
																	}

																	console.log('代码块已更新，使用文件API直接替换');
																	new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
																} else {
																	console.error('未找到匹配的代码块');
																	new Notice('更新代码块失败：未找到匹配的代码块');
																}
															}
														}
													} else {
														console.log('未找到对应的视图元素，无法直接重新渲染，唯一标识符: ' + blockId);
													}
												}, 100);
											} else {
												throw new Error('无法找到代码块源内容或唯一标识符');
											}
										} else {
											throw new Error('无法获取编辑器实例');
										}
									} else {
										throw new Error('当前活动视图不是Markdown视图');
									}
								} catch (error) {
									new Notice(`更新代码块失败: ${error.message}`);
									console.error(`更新代码块失败: ${error}`);
								}
							};

							// 调试信息
							console.log('性别选择按钮已添加到视图中');
							console.log('性别选择界面添加完成');
						}, 100); // 延迟100ms以确保视图渲染完成
					}

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
					// 为代码块添加唯一标识符
					const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);

					// 添加源代码属性和唯一标识符，用于编辑时恢复和准确更新
					// 清理source中的特殊字符，确保选择器有效
					const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
					el.setAttribute('data-bazi-source', cleanSource);
					el.setAttribute('data-bazi-block-id', blockId);

					if (this.settings.useInteractiveView) {
						// 使用交互式视图
						new InteractiveBaziView(el, baziInfo, id);
					} else {
						// 使用传统视图
						el.innerHTML = BaziService.generateBaziHTML(baziInfo, id);

						// 为设置按钮添加事件监听器
						this.addSettingsButtonListeners(el);
						// 为表格单元格添加事件监听器
						this.addTableCellListeners(el, id, baziInfo);
					}

					// 应用额外的显示选项
					// 手动应用显示选项，替代 this.applyDisplayOptions(el, params)
					console.log('应用显示选项:', params);

					// 显示/隐藏五行分析
					if (params.showWuxing === 'false' || params.showWuxing === '0') {
						const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
						if (wuxingSection) {
							(wuxingSection as HTMLElement).style.display = 'none';
						}
					}

					// 显示/隐藏特殊信息
					if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
						const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
						if (specialInfoSection) {
							(specialInfoSection as HTMLElement).style.display = 'none';
						}
					}

					// 应用神煞显示设置
					if (params.showshensha_sizhu === 'false') {
						// 隐藏四柱神煞
						const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
						if (siZhuShenShaRow) {
							(siZhuShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_dayun === 'false') {
						// 隐藏大运神煞
						const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
						if (daYunShenShaRow) {
							(daYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liunian === 'false') {
						// 隐藏流年神煞
						const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
						if (liuNianShenShaRow) {
							(liuNianShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_xiaoyun === 'false') {
						// 隐藏小运神煞
						const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
						if (xiaoYunShenShaRow) {
							(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liuyue === 'false') {
						// 隐藏流月神煞
						const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
						if (liuYueShenShaRow) {
							(liuYueShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					// 设置标题
					if (params.title) {
						const titleEl = el.querySelector('.bazi-view-title');
						if (titleEl) {
							titleEl.textContent = params.title;
						}
					}

					// 设置主题
					if (params.theme) {
						const container = el.querySelector('.bazi-view-container');
						if (container) {
							if (params.theme === 'dark') {
								container.classList.add('bazi-theme-dark');
							} else if (params.theme === 'light') {
								container.classList.add('bazi-theme-light');
							} else if (params.theme === 'colorful') {
								container.classList.add('bazi-theme-colorful');
							}
						}
					}

					// 保存设置到数据属性，方便后续使用
					const container = el.querySelector('.bazi-view-container');
					if (container) {
						// 保存显示选项
						if (params.showWuxing !== undefined) {
							container.setAttribute('data-show-wuxing', params.showWuxing);
						}

						if (params.showSpecialInfo !== undefined) {
							container.setAttribute('data-show-special-info', params.showSpecialInfo);
						}

						if (params.gender !== undefined) {
							container.setAttribute('data-gender', params.gender);
						}

						if (params.calculationMethod !== undefined) {
							container.setAttribute('data-calculation-method', params.calculationMethod);
						}

						// 保存神煞显示设置
						if (params.showshensha_sizhu !== undefined) {
							container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
						}

						if (params.showshensha_dayun !== undefined) {
							container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
						}

						if (params.showshensha_liunian !== undefined) {
							container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
						}

						if (params.showshensha_xiaoyun !== undefined) {
							container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
						}

						if (params.showshensha_liuyue !== undefined) {
							container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
						}
					}
				} catch (error) {
					console.error('八字命盘渲染错误:', error);
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else if (params.now) {
				try {
					// 使用当前时间
					const now = new Date();
					const year = now.getFullYear();
					const month = now.getMonth() + 1;
					const day = now.getDate();
					const hour = now.getHours();

					// 获取性别参数，不使用默认值
					let gender = '';
					if (params.gender) {
						// 支持多种性别输入格式
						const genderValue = params.gender.trim().toLowerCase();
						if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
							gender = '1';
						} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
							gender = '0';
						}
					}

					// 获取八字信息
					const baziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.settings.baziSect);

					// 生成唯一ID
					const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
					// 为代码块添加唯一标识符
					const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);

					// 添加源代码属性和唯一标识符，用于编辑时恢复和准确更新
					// 清理source中的特殊字符，确保选择器有效
					const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
					el.setAttribute('data-bazi-source', cleanSource);
					el.setAttribute('data-bazi-block-id', blockId);

					// 如果没有指定性别，显示性别选择界面
					if (!params.gender) {
						setTimeout(() => {
							console.log('开始添加性别选择界面');
							// 创建性别选择容器，添加到视图顶部
							const genderContainer = document.createElement('div');
							genderContainer.className = 'bazi-gender-container';
							genderContainer.setAttribute('style', 'background-color: rgba(0, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; width: 100%; box-sizing: border-box;');
							el.prepend(genderContainer);
							genderContainer.createDiv({
								text: '请选择性别：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建性别按钮容器
							const genderButtonsContainer = genderContainer.createDiv({
								attr: { 'style': 'display: flex; gap: 5px; justify-content: center;' }
							});

							// 创建性别按钮
							const maleButton = genderButtonsContainer.createEl('button', {
								text: '男',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});
							const femaleButton = genderButtonsContainer.createEl('button', {
								text: '女',
								attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
							});

							// 为性别按钮添加事件监听器
							maleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 男\n`;
								updateCodeBlock(newSource, '男');
							});
							femaleButton.addEventListener('click', () => {
								// 处理源代码，确保格式正确
								let cleanedSource = source.trim();
								// 移除源代码末尾可能存在的反引号
								if (cleanedSource.endsWith('```')) {
									cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
								}
								// 确保源代码末尾有换行符
								if (!cleanedSource.endsWith('\n')) {
									cleanedSource += '\n';
								}
								// 添加性别参数
								const newSource = cleanedSource + `gender: 女\n`;
								updateCodeBlock(newSource, '女');
							});

							// 更新代码块的辅助函数
							const updateCodeBlock = (newSource: string, genderLabel: string) => {
								try {
									const activeLeaf = this.app.workspace.activeLeaf;
									if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
										const editor = activeLeaf.view.editor;
										if (editor) {
											const sourceAttr = el.getAttribute('data-bazi-source');
											const blockId = el.getAttribute('data-bazi-block-id');
											if (sourceAttr && blockId) {
												// 手动实现 this.updateCodeBlockWithFileAPI(newSource) 的功能
												console.log('尝试使用文件API更新代码块');

												// 显示状态通知
												const statusNotice = new Notice('尝试使用文件API更新代码块...', 0);

												// 获取当前活动的编辑器视图
												const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
												if (!activeView) {
													statusNotice.hide();
													console.log('无法获取活动的编辑器视图');
													new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
													return;
												}

												const editor = activeView.editor;
												console.log('获取到编辑器:', editor ? '成功' : '失败');

												if (!editor) {
													statusNotice.hide();
													new Notice('更新代码块失败：无法获取编辑器实例', 3000);
													return;
												}

												try {
													// 获取文档中所有的bazi代码块
													const text = editor.getValue();
													const lines = text.split('\n');

													console.log('开始在文档中查找bazi代码块');
													statusNotice.setMessage('正在查找八字命盘代码块...');

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
															console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
														} else if (line.startsWith('```') && inCodeBlock) {
															inCodeBlock = false;
															endLine = i;
															console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

															if (blockLanguage === 'bazi') {
																foundBlocks++;
																console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

													// 如果找到了多个代码块，尝试找到最匹配的
													if (blockContents.length > 0) {
														// 使用第一个代码块
														const block = blockContents[0];

														// 替换代码块内容
														const trimmedSource = newSource.trim();

														// 检测原始代码块的缩进
														let indentation = '';
														// 检查第一行的缩进
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

														statusNotice.hide();
														new Notice('八字命盘代码块已更新', 3000);
														console.log('使用文件API更新代码块成功');
													} else {
														statusNotice.hide();
														console.log('未找到任何bazi代码块');
														new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
													}
												} catch (error) {
													statusNotice.hide();
													console.error('使用编辑器API更新代码块时出错:', error);
													new Notice('更新代码块时出错: ' + error.message, 5000);
												}
												new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
												console.log(`已选择性别: ${genderLabel}, 更新代码块成功: ${newSource}`);
												console.log(`尝试更新代码块，源内容: ${sourceAttr}, 唯一标识符: ${blockId}`);
												this.app.workspace.trigger('layout-change');
												setTimeout(() => {
													const el = document.querySelector(`[data-bazi-block-id="${blockId}"]`);
													if (el) {
														// 手动实现 this.parseCodeBlockParams(newSource) 的功能
														const params: BaziParams = {};
														const lines = newSource.split('\n');

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
														const gender = params.gender || '';
														// 重新获取八字信息
														const now = new Date();
														const year = now.getFullYear();
														const month = now.getMonth() + 1;
														const day = now.getDate();
														const hour = now.getHours();
														const updatedBaziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.settings.baziSect);

														const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
														const cleanNewSource = newSource.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
														el.setAttribute('data-bazi-source', cleanNewSource);
														// 应用八字信息
														// 手动实现 this.applyBaziInfo(updatedBaziInfo, params) 的功能
														const processedBaziInfo = updatedBaziInfo;

														if (this.settings.useInteractiveView) {
															new InteractiveBaziView(el as HTMLElement, processedBaziInfo, id);
														} else {
															el.innerHTML = BaziService.generateBaziHTML(processedBaziInfo, id);
															this.addSettingsButtonListeners(el as HTMLElement);
															this.addTableCellListeners(el as HTMLElement, id, processedBaziInfo);
														}
														// 手动应用显示选项，替代 this.applyDisplayOptions(el as HTMLElement, params)
														console.log('应用显示选项:', params);

														// 显示/隐藏五行分析
														if (params.showWuxing === 'false' || params.showWuxing === '0') {
															const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
															if (wuxingSection) {
																(wuxingSection as HTMLElement).style.display = 'none';
															}
														}

														// 显示/隐藏特殊信息
														if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
															const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
															if (specialInfoSection) {
																(specialInfoSection as HTMLElement).style.display = 'none';
															}
														}

														// 应用神煞显示设置
														if (params.showshensha_sizhu === 'false') {
															// 隐藏四柱神煞
															const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
															if (siZhuShenShaRow) {
																(siZhuShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_dayun === 'false') {
															// 隐藏大运神煞
															const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
															if (daYunShenShaRow) {
																(daYunShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_liunian === 'false') {
															// 隐藏流年神煞
															const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
															if (liuNianShenShaRow) {
																(liuNianShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_xiaoyun === 'false') {
															// 隐藏小运神煞
															const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
															if (xiaoYunShenShaRow) {
																(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														if (params.showshensha_liuyue === 'false') {
															// 隐藏流月神煞
															const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
															if (liuYueShenShaRow) {
																(liuYueShenShaRow as HTMLElement).style.display = 'none';
															}
														}

														// 设置标题
														if (params.title) {
															const titleEl = el.querySelector('.bazi-view-title');
															if (titleEl) {
																titleEl.textContent = params.title;
															}
														}

														// 设置主题
														if (params.theme) {
															const container = el.querySelector('.bazi-view-container');
															if (container) {
																if (params.theme === 'dark') {
																	container.classList.add('bazi-theme-dark');
																} else if (params.theme === 'light') {
																	container.classList.add('bazi-theme-light');
																} else if (params.theme === 'colorful') {
																	container.classList.add('bazi-theme-colorful');
																}
															}
														}

														// 保存设置到数据属性，方便后续使用
														const container = el.querySelector('.bazi-view-container');
														if (container) {
															// 保存显示选项
															if (params.showWuxing !== undefined) {
																container.setAttribute('data-show-wuxing', params.showWuxing);
															}

															if (params.showSpecialInfo !== undefined) {
																container.setAttribute('data-show-special-info', params.showSpecialInfo);
															}

															if (params.gender !== undefined) {
																container.setAttribute('data-gender', params.gender);
															}

															if (params.calculationMethod !== undefined) {
																container.setAttribute('data-calculation-method', params.calculationMethod);
															}

															// 保存神煞显示设置
															if (params.showshensha_sizhu !== undefined) {
																container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
															}

															if (params.showshensha_dayun !== undefined) {
																container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
															}

															if (params.showshensha_liunian !== undefined) {
																container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
															}

															if (params.showshensha_xiaoyun !== undefined) {
																container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
															}

															if (params.showshensha_liuyue !== undefined) {
																container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
															}
														}
														console.log('已直接重新渲染视图元素，唯一标识符: ' + blockId);
														// 隐藏性别选择栏
														const genderContainer = el.querySelector('.bazi-gender-container');
														if (genderContainer) {
															genderContainer.remove();
														}
														const activeLeaf = this.app.workspace.activeLeaf;
														if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
															const editor = activeLeaf.view.editor;
															const file = activeLeaf.view.file;
															if (editor && file) {
																// 直接使用文件API更新代码块，这样可以更精确地控制代码块的替换
																// 查找文档中的所有代码块
																const text = editor.getValue();
																const lines = text.split('\n');

																// 查找所有代码块
																let inCodeBlock = false;
																let startLine = -1;
																let endLine = -1;
																let blockLanguage = '';
																let foundBlock = false;

																for (let i = 0; i < lines.length; i++) {
																	const line = lines[i];

																	if (line.startsWith('```') && !inCodeBlock) {
																		inCodeBlock = true;
																		startLine = i;
																		blockLanguage = line.substring(3).trim();
																	} else if (line.startsWith('```') && inCodeBlock) {
																		inCodeBlock = false;
																		endLine = i;

																		// 检查是否是我们要找的代码块
																		if (blockLanguage === 'bazi') {
																			// 检查代码块内容是否包含我们的唯一标识符
																			let blockContent = '';
																			for (let j = startLine; j <= endLine; j++) {
																				blockContent += lines[j] + '\n';
																			}

																			if (blockContent.includes(`data-bazi-block-id="${blockId}"`)) {
																				foundBlock = true;
																				break;
																			}
																		}
																	}
																}

																if (foundBlock && startLine >= 0 && endLine >= 0) {
																	// 构建新的代码块内容
																	const trimmedSource = newSource.trim();

																	// 使用文件API更新文件内容
																	// 获取当前文件
																	const file = this.app.workspace.getActiveFile();
																	if (file) {
																		// 读取文件内容
																		this.app.vault.read(file).then(content => {
																			// 将内容分割成行
																			const lines = content.split('\n');

																			// 替换代码块
																			const beforeBlock = lines.slice(0, startLine).join('\n');
																			const afterBlock = lines.slice(endLine + 1).join('\n');
																			const newBlock = '```bazi\n' + trimmedSource + '\n```';

																			// 构建新的文件内容
																			const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

																			// 更新文件内容
																			this.app.vault.modify(file, newContent);
																		});
																	}

																	console.log('代码块已更新，使用文件API直接替换');
																	new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
																} else {
																	console.error('未找到匹配的代码块');
																	new Notice('更新代码块失败：未找到匹配的代码块');
																}
															}
														}
													} else {
														console.log('未找到对应的视图元素，无法直接重新渲染，唯一标识符: ' + blockId);
													}
												}, 100);
											} else {
												throw new Error('无法找到代码块源内容或唯一标识符');
											}
										} else {
											throw new Error('无法获取编辑器实例');
										}
									} else {
										throw new Error('当前活动视图不是Markdown视图');
									}
								} catch (error) {
									new Notice(`更新代码块失败: ${error.message}`);
									console.error(`更新代码块失败: ${error}`);
								}
							};

							// 调试信息
							console.log('性别选择按钮已添加到视图中');
							console.log('性别选择界面添加完成');
						}, 100); // 延迟100ms以确保视图渲染完成
					}

					// 应用八字信息
					// 手动实现 this.applyBaziInfo(baziInfo, params) 的功能
					const processedBaziInfo = baziInfo;

					if (this.settings.useInteractiveView) {
						// 使用交互式视图
						new InteractiveBaziView(el, processedBaziInfo, id);
					} else {
						// 使用传统视图
						el.innerHTML = BaziService.generateBaziHTML(processedBaziInfo, id);

						// 为设置按钮添加事件监听器
						this.addSettingsButtonListeners(el);
						// 为表格单元格添加事件监听器
						this.addTableCellListeners(el, id, processedBaziInfo);
					}

					// 应用额外的显示选项
					// 手动应用显示选项，替代 this.applyDisplayOptions(el, params)
					console.log('应用显示选项:', params);

					// 显示/隐藏五行分析
					if (params.showWuxing === 'false' || params.showWuxing === '0') {
						const wuxingSection = el.querySelector('.bazi-view-wuxing-list')?.parentElement;
						if (wuxingSection) {
							(wuxingSection as HTMLElement).style.display = 'none';
						}
					}

					// 显示/隐藏特殊信息
					if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
						const specialInfoSection = el.querySelector('.bazi-view-info-list')?.parentElement;
						if (specialInfoSection) {
							(specialInfoSection as HTMLElement).style.display = 'none';
						}
					}

					// 应用神煞显示设置
					if (params.showshensha_sizhu === 'false') {
						// 隐藏四柱神煞
						const siZhuShenShaRow = el.querySelector('.bazi-view-table tbody tr:nth-child(5)');
						if (siZhuShenShaRow) {
							(siZhuShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_dayun === 'false') {
						// 隐藏大运神煞
						const daYunShenShaRow = el.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
						if (daYunShenShaRow) {
							(daYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liunian === 'false') {
						// 隐藏流年神煞
						const liuNianShenShaRow = el.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
						if (liuNianShenShaRow) {
							(liuNianShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_xiaoyun === 'false') {
						// 隐藏小运神煞
						const xiaoYunShenShaRow = el.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
						if (xiaoYunShenShaRow) {
							(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					if (params.showshensha_liuyue === 'false') {
						// 隐藏流月神煞
						const liuYueShenShaRow = el.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
						if (liuYueShenShaRow) {
							(liuYueShenShaRow as HTMLElement).style.display = 'none';
						}
					}

					// 设置标题
					if (params.title) {
						const titleEl = el.querySelector('.bazi-view-title');
						if (titleEl) {
							titleEl.textContent = params.title;
						}
					}

					// 设置主题
					if (params.theme) {
						const container = el.querySelector('.bazi-view-container');
						if (container) {
							if (params.theme === 'dark') {
								container.classList.add('bazi-theme-dark');
							} else if (params.theme === 'light') {
								container.classList.add('bazi-theme-light');
							} else if (params.theme === 'colorful') {
								container.classList.add('bazi-theme-colorful');
							}
						}
					}

					// 保存设置到数据属性，方便后续使用
					const container = el.querySelector('.bazi-view-container');
					if (container) {
						// 保存显示选项
						if (params.showWuxing !== undefined) {
							container.setAttribute('data-show-wuxing', params.showWuxing);
						}

						if (params.showSpecialInfo !== undefined) {
							container.setAttribute('data-show-special-info', params.showSpecialInfo);
						}

						if (params.gender !== undefined) {
							container.setAttribute('data-gender', params.gender);
						}

						if (params.calculationMethod !== undefined) {
							container.setAttribute('data-calculation-method', params.calculationMethod);
						}

						// 保存神煞显示设置
						if (params.showshensha_sizhu !== undefined) {
							container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
						}

						if (params.showshensha_dayun !== undefined) {
							container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
						}

						if (params.showshensha_liunian !== undefined) {
							container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
						}

						if (params.showshensha_xiaoyun !== undefined) {
							container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
						}

						if (params.showshensha_liuyue !== undefined) {
							container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
						}
					}
				} catch (error) {
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
					text: '八字命盘缺少必要参数，请指定 date、lunar、bazi 或 now 参数'
				});
			}
		});

		// 添加设置选项卡
		this.addSettingTab(new BaziSettingTab(this.app, this));

		// 注册事件监听器，在文档变化时更新代码块
		// 已删除 this.registerDocumentChangeEvents() 方法，不再需要

		// 输出调试信息
		if (this.settings.debugMode) {
			console.log('八字命盘插件已加载，调试模式已启用');
		}
	}

	onunload() {
		// 清理资源
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * 应用显示选项
	 * @param container 容器元素
	 * @param params 参数对象
	 */
	applyDisplayOptions(container: HTMLElement, params: BaziParams) {
		console.log('应用显示选项:', params);

		// 显示/隐藏五行分析
		if (params.showWuxing === 'false' || params.showWuxing === '0') {
			const wuxingSection = container.querySelector('.bazi-view-wuxing-list')?.parentElement;
			if (wuxingSection) {
				(wuxingSection as HTMLElement).style.display = 'none';
			}
		}

		// 显示/隐藏特殊信息
		if (params.showSpecialInfo === 'false' || params.showSpecialInfo === '0') {
			const specialInfoSection = container.querySelector('.bazi-view-info-list')?.parentElement;
			if (specialInfoSection) {
				(specialInfoSection as HTMLElement).style.display = 'none';
			}
		}

		// 应用神煞显示设置
		if (params.showshensha_sizhu === 'false') {
			// 隐藏四柱神煞
			const siZhuShenShaRow = container.querySelector('.bazi-view-table tbody tr:nth-child(5)');
			if (siZhuShenShaRow) {
				(siZhuShenShaRow as HTMLElement).style.display = 'none';
			}
		}

		if (params.showshensha_dayun === 'false') {
			// 隐藏大运神煞
			const daYunShenShaRow = container.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
			if (daYunShenShaRow) {
				(daYunShenShaRow as HTMLElement).style.display = 'none';
			}
		}

		if (params.showshensha_liunian === 'false') {
			// 隐藏流年神煞
			const liuNianShenShaRow = container.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
			if (liuNianShenShaRow) {
				(liuNianShenShaRow as HTMLElement).style.display = 'none';
			}
		}

		if (params.showshensha_xiaoyun === 'false') {
			// 隐藏小运神煞
			const xiaoYunShenShaRow = container.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
			if (xiaoYunShenShaRow) {
				(xiaoYunShenShaRow as HTMLElement).style.display = 'none';
			}
		}

		if (params.showshensha_liuyue === 'false') {
			// 隐藏流月神煞
			const liuYueShenShaRow = container.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
			if (liuYueShenShaRow) {
				(liuYueShenShaRow as HTMLElement).style.display = 'none';
			}
		}

		// 设置标题
		if (params.title) {
			const titleEl = container.querySelector('.bazi-view-title');
			if (titleEl) {
				titleEl.textContent = params.title;
			}
		}

		// 应用主题
		if (params.theme) {
			container.classList.remove('bazi-theme-dark', 'bazi-theme-light', 'bazi-theme-colorful');
			if (params.theme === 'dark') {
				container.classList.add('bazi-theme-dark');
			} else if (params.theme === 'light') {
				container.classList.add('bazi-theme-light');
			} else if (params.theme === 'colorful') {
				container.classList.add('bazi-theme-colorful');
			}
		}

		// 设置数据属性，用于后续操作
		if (params.showWuxing !== undefined) {
			container.setAttribute('data-show-wuxing', params.showWuxing);
		}

		if (params.showSpecialInfo !== undefined) {
			container.setAttribute('data-show-special-info', params.showSpecialInfo);
		}

		if (params.gender !== undefined) {
			container.setAttribute('data-gender', params.gender);
		}

		if (params.calculationMethod !== undefined) {
			container.setAttribute('data-calculation-method', params.calculationMethod);
		}

		// 设置神煞显示数据属性
		if (params.showshensha_sizhu !== undefined) {
			container.setAttribute('data-show-shensha-sizhu', params.showshensha_sizhu);
		}

		if (params.showshensha_dayun !== undefined) {
			container.setAttribute('data-show-shensha-dayun', params.showshensha_dayun);
		}

		if (params.showshensha_liunian !== undefined) {
			container.setAttribute('data-show-shensha-liunian', params.showshensha_liunian);
		}

		if (params.showshensha_xiaoyun !== undefined) {
			container.setAttribute('data-show-shensha-xiaoyun', params.showshensha_xiaoyun);
		}

		if (params.showshensha_liuyue !== undefined) {
			container.setAttribute('data-show-shensha-liuyue', params.showshensha_liuyue);
		}
	}

	/**
	 * 加载CSS样式
	 */
	loadStyles() {
		// 创建样式元素
		const styleEl = document.createElement('style');
		styleEl.id = 'bazi-plugin-styles';

		// 添加样式内容
		styleEl.textContent = `
		/* 表格整体样式 */
		.bazi-view-table {
			width: 100%;
			border-collapse: separate;
			border-spacing: 0;
			margin: 15px 0;
			font-size: 1.1em;
			border-radius: 10px;
			overflow: hidden;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			table-layout: fixed; /* 固定表格布局 */
			background-color: var(--background-primary);
		}

		.bazi-view-table th,
		.bazi-view-table td {
			border: 1px solid rgba(0, 0, 0, 0.1);
			padding: 10px 6px;
			text-align: center;
			word-wrap: break-word; /* 允许长文本换行 */
			overflow: visible; /* 允许内容溢出 */
			position: relative;
		}

		/* 设置表格列宽 */
		.bazi-view-table th:first-child,
		.bazi-view-table td:first-child {
			width: 12%; /* 标签列宽度 */
			background-color: rgba(0, 0, 0, 0.03);
			font-weight: bold;
		}

		.bazi-view-table th:not(:first-child),
		.bazi-view-table td:not(:first-child) {
			width: 22%; /* 四柱列宽度 */
		}

		/* 表头样式 */
		.bazi-view-table th {
			background-color: rgba(0, 0, 0, 0.05);
			font-weight: bold;
			color: var(--text-normal);
			border-bottom: 2px solid rgba(0, 0, 0, 0.1);
			padding: 8px 6px;
		}

		/* 交替行颜色 */
		.bazi-view-table tr:nth-child(even) {
			background-color: rgba(0, 0, 0, 0.02);
		}

		/* 鼠标悬停效果 */
		.bazi-view-table tr:hover {
			background-color: rgba(0, 0, 0, 0.04);
		}

		/* 主星行样式 */
		.bazi-main-star-row td {
			font-weight: bold;
			color: #6200ee;
			padding: 6px 4px;
		}

		/* 天干地支样式 */
		.bazi-stem-row td, .bazi-branch-row td {
			font-size: 1.6em;
			font-weight: bold;
			padding: 10px 0;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		}

		/* 天干元素样式 */
		.bazi-stem {
			font-size: 1.2em;
			font-weight: bold;
			display: block;
			margin-bottom: 2px;
		}

		/* 地支元素样式 */
		.bazi-branch {
			font-size: 1.2em;
			font-weight: bold;
			display: block;
			margin-bottom: 2px;
		}

		/* 十神标签样式（小） */
		.shishen-tag-small {
			font-size: 0.8em;
			padding: 2px 4px;
			border-radius: 4px;
			background-color: rgba(0, 0, 0, 0.05);
			color: var(--text-muted);
			margin: 0 2px;
		}

		/* 十神标签样式（极小） */
		.shishen-tag-tiny {
			font-size: 0.7em;
			padding: 1px 3px;
			border-radius: 3px;
			background-color: rgba(0, 0, 0, 0.05);
			color: var(--text-muted);
			margin-top: 2px;
			display: inline-block;
		}

		/* 纳音样式 */
		.bazi-nayin-row td {
			font-style: italic;
			color: var(--text-muted);
			background-color: rgba(0, 0, 0, 0.02);
			padding: 6px 4px;
			border-top: 1px dashed rgba(0, 0, 0, 0.1);
			border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
		}

		/* 旬空行样式 */
		.bazi-xunkong-row td {
			padding: 6px 4px;
		}

		/* 旬空标签样式 */
		.xunkong-tag-small {
			font-size: 0.9em;
			padding: 2px 4px;
			border-radius: 4px;
			background-color: rgba(0, 0, 0, 0.05);
			color: #9c27b0;
			font-weight: 500;
		}

		/* 地势标签样式 */
		.dishi-tag-small {
			font-size: 0.9em;
			padding: 2px 4px;
			border-radius: 4px;
			background-color: rgba(0, 0, 0, 0.05);
			color: #2196f3;
			font-weight: 500;
		}

		/* 神煞行样式 */
		.bazi-shensha-row {
			background-color: var(--background-primary);
		}

		.bazi-shensha-row td:first-child {
			font-weight: bold;
			color: #6200ee;
			background-color: rgba(0, 0, 0, 0.03);
		}

		/* 神煞单元格样式 */
		.bazi-shensha-cell {
			padding: 6px 4px !important;
			max-height: 2.4em;
			overflow: hidden;
			transition: max-height 0.3s ease;
		}

		/* 神煞容器样式 */
		.shensha-container {
			position: relative;
		}

		/* 神煞可见区域样式 */
		.shensha-visible-area {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		/* 神煞隐藏区域样式 */
		.shensha-hidden-area {
			padding-top: 5px;
			line-height: 1.6;
		}

		/* 神煞省略号样式 */
		.shensha-ellipsis {
			cursor: pointer;
			color: var(--text-accent);
			font-weight: bold;
		}

		/* 神煞收起按钮样式 */
		.shensha-collapse-button {
			display: block;
			text-align: center;
			margin-top: 5px;
			padding: 2px 0;
			background-color: rgba(0, 0, 0, 0.05);
			border-radius: 4px;
			cursor: pointer;
			color: var(--text-muted);
			font-size: 0.9em;
		}

		/* 神煞标签样式 */
		.shensha-good {
			color: #27ae60;
			font-weight: 500;
			cursor: pointer;
			padding: 1px 3px;
			border-radius: 3px;
			background-color: rgba(39, 174, 96, 0.1);
		}

		.shensha-bad {
			color: #e74c3c;
			font-weight: 500;
			cursor: pointer;
			padding: 1px 3px;
			border-radius: 3px;
			background-color: rgba(231, 76, 60, 0.1);
		}

		.shensha-mixed {
			color: #f39c12;
			font-weight: 500;
			cursor: pointer;
			padding: 1px 3px;
			border-radius: 3px;
			background-color: rgba(243, 156, 18, 0.1);
			margin-right: 2px;
			display: inline-block;
		}

		.shensha-good:hover {
			background-color: rgba(46, 204, 113, 0.1);
			transform: translateY(-1px);
		}

		.shensha-bad {
			color: #c0392b;
			font-weight: 500;
			margin-right: 2px;
			cursor: pointer;
			display: inline-block;
			padding: 0 2px;
			border-radius: 2px;
			transition: all 0.2s ease;
		}

		.shensha-bad:hover {
			background-color: rgba(231, 76, 60, 0.1);
			transform: translateY(-1px);
		}

		.shensha-mixed {
			color: #f39c12;
			font-weight: 500;
			margin-right: 2px;
			cursor: pointer;
			display: inline-block;
			padding: 0 2px;
			border-radius: 2px;
			transition: all 0.2s ease;
		}

		.shensha-mixed:hover {
			background-color: rgba(241, 196, 15, 0.1);
			transform: translateY(-1px);
		}

		/* 神煞详情弹窗样式已删除 */

		/* 神煞信息表格样式 */
		.shensha-info-table {
			width: 100%;
			border-collapse: collapse;
			margin: 10px 0;
			border: 1px solid rgba(0, 0, 0, 0.1);
		}

		.shensha-info-table th,
		.shensha-info-table td {
			padding: 8px;
			border: 1px solid rgba(0, 0, 0, 0.1);
			text-align: left;
		}

		.shensha-info-table th {
			background-color: rgba(0, 0, 0, 0.05);
			font-weight: bold;
		}

		.shensha-column {
			width: 15%;
			font-weight: bold;
			background-color: rgba(0, 0, 0, 0.02);
		}

		.shensha-list {
			display: flex;
			flex-wrap: wrap;
			gap: 5px;
			padding: 5px;
		}

		/* 神煞标签样式 */
		.shensha-tag {
			display: inline-block;
			padding: 3px 6px;
			border-radius: 3px;
			font-size: 0.9em;
			cursor: pointer;
			transition: all 0.2s ease;
			border: 1px solid rgba(0, 0, 0, 0.1);
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		}

		.shensha-tag:hover {
			transform: translateY(-1px);
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		}

		/* 吉神标签样式 */
		.shensha-tag-good {
			background-color: rgba(46, 204, 113, 0.1);
			color: #27ae60;
			border-color: rgba(46, 204, 113, 0.3);
			border-left: 2px solid #27ae60;
		}

		/* 凶神标签样式 */
		.shensha-tag-bad {
			background-color: rgba(231, 76, 60, 0.1);
			color: #c0392b;
			border-color: rgba(231, 76, 60, 0.3);
			border-left: 2px solid #c0392b;
		}

		/* 吉凶神标签样式 */
		.shensha-tag-mixed {
			background-color: rgba(241, 196, 15, 0.1);
			color: #f39c12;
			border-color: rgba(241, 196, 15, 0.3);
			border-left: 2px solid #f39c12;
		}

		/* 五行强度详情样式 */
		.bazi-view-wuxing-strength {
			margin-top: 15px;
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 8px;
			overflow: hidden;
		}

		.bazi-view-wuxing-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 10px 15px;
			background-color: rgba(0, 0, 0, 0.03);
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
			flex-wrap: wrap;
		}

		.bazi-view-wuxing-title {
			font-weight: bold;
			margin-right: 10px;
		}

		.bazi-view-wuxing-bars {
			flex: 1;
			margin: 0 10px;
		}

		.wuxing-bar {
			display: flex;
			align-items: center;
			margin-bottom: 5px;
		}

		.wuxing-bar-inner {
			height: 8px;
			border-radius: 4px;
			margin-left: 10px;
			flex: 1;
			opacity: 0.5;
		}

		.wuxing-clickable, .rizhu-clickable {
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.wuxing-clickable:hover, .rizhu-clickable:hover {
			filter: brightness(1.1);
			transform: scale(1.05);
		}

		.bazi-view-wuxing-details {
			padding: 15px;
			background-color: var(--background-primary);
		}

		.bazi-view-wuxing-table {
			width: 100%;
			border-collapse: collapse;
		}

		.bazi-view-wuxing-table th,
		.bazi-view-wuxing-table td {
			padding: 8px 12px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.05);
			text-align: left;
		}

		.bazi-view-wuxing-table th {
			font-weight: bold;
			color: var(--text-muted);
		}

		.bazi-view-wuxing-table th[colspan="2"] {
			background-color: rgba(0, 0, 0, 0.03);
			text-align: center;
		}

		/* 日主旺衰详情样式 */
		.bazi-view-rizhu-strength {
			margin-top: 15px;
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 8px;
			overflow: hidden;
		}

		.bazi-view-rizhu-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 10px 15px;
			background-color: rgba(0, 0, 0, 0.03);
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		}

		.bazi-view-rizhu-title {
			font-weight: bold;
		}

		.bazi-view-rizhu-toggle {
			cursor: pointer;
			color: var(--text-accent);
			font-size: 0.9em;
			padding: 3px 8px;
			border-radius: 4px;
			background-color: rgba(0, 0, 0, 0.05);
			transition: background-color 0.2s;
		}

		.bazi-view-rizhu-toggle:hover {
			background-color: rgba(0, 0, 0, 0.1);
		}

		.bazi-view-rizhu-details {
			padding: 15px;
			background-color: var(--background-primary);
		}

		.bazi-view-rizhu-table {
			width: 100%;
			border-collapse: collapse;
		}

		.bazi-view-rizhu-table th,
		.bazi-view-rizhu-table td {
			padding: 8px 12px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.05);
			text-align: left;
		}

		.bazi-view-rizhu-table th {
			width: 30%;
			font-weight: bold;
			color: var(--text-muted);
		}

		/* 弹窗样式 */
		.bazi-modal {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 9999;
		}

		.bazi-modal-content {
			background-color: var(--background-primary);
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			width: 80%;
			max-width: 600px;
			max-height: 80vh;
			overflow-y: auto;
			padding: 20px;
			position: relative;
		}

		.bazi-modal-title {
			margin-top: 0;
			margin-bottom: 15px;
			font-size: 1.5em;
			color: var(--text-normal);
			border-bottom: 1px solid var(--background-modifier-border);
			padding-bottom: 10px;
		}

		.bazi-modal-type {
			display: inline-block;
			padding: 5px 10px;
			border-radius: 4px;
			margin-bottom: 15px;
			font-weight: bold;
		}

		.bazi-modal-type-jin {
			background-color: rgba(255, 215, 0, 0.1);
			color: #FFD700;
			border: 1px solid rgba(255, 215, 0, 0.3);
		}

		.bazi-modal-type-mu {
			background-color: rgba(34, 139, 34, 0.1);
			color: #228B22;
			border: 1px solid rgba(34, 139, 34, 0.3);
		}

		.bazi-modal-type-shui {
			background-color: rgba(30, 144, 255, 0.1);
			color: #1E90FF;
			border: 1px solid rgba(30, 144, 255, 0.3);
		}

		.bazi-modal-type-huo {
			background-color: rgba(255, 69, 0, 0.1);
			color: #FF4500;
			border: 1px solid rgba(255, 69, 0, 0.3);
		}

		.bazi-modal-type-tu {
			background-color: rgba(205, 133, 63, 0.1);
			color: #CD853F;
			border: 1px solid rgba(205, 133, 63, 0.3);
		}

		.bazi-modal-explanation {
			margin-bottom: 15px;
			line-height: 1.6;
		}

		.bazi-modal-influence {
			margin-bottom: 15px;
			line-height: 1.6;
			background-color: rgba(0, 0, 0, 0.03);
			padding: 10px;
			border-radius: 4px;
			border-left: 3px solid var(--interactive-accent);
		}

		.bazi-modal-calculation {
			background-color: var(--background-secondary);
			padding: 15px;
			border-radius: 4px;
			margin-bottom: 15px;
		}

		.bazi-modal-calculation ul {
			margin-left: 20px;
		}

		.bazi-modal-close {
			display: block;
			width: 100%;
			padding: 8px;
			background-color: var(--interactive-accent);
			color: var(--text-on-accent);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 1em;
			transition: background-color 0.2s;
		}

		.bazi-modal-close:hover {
			background-color: var(--interactive-accent-hover);
		}

		/* 五行颜色 */
		.wuxing-jin {
			color: #FFD700;
		}
		.wuxing-mu {
			color: #228B22;
		}
		.wuxing-shui {
			color: #1E90FF;
		}
		.wuxing-huo {
			color: #FF4500;
		}
		.wuxing-tu {
			color: #CD853F;
		}

		/* 可点击的五行和日主旺衰标签 */
		.wuxing-clickable, .rizhu-clickable {
			cursor: pointer;
			transition: all 0.2s ease;
			position: relative;
		}

		.wuxing-clickable:hover, .rizhu-clickable:hover {
			filter: brightness(1.2);
			transform: translateY(-1px);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.wuxing-clickable:active, .rizhu-clickable:active {
			transform: translateY(0);
			box-shadow: none;
		}

		/* 移除眼睛图标 */
		.wuxing-clickable::after, .rizhu-clickable::after {
			content: "";
		}

		/* 五行颜色（天干） - 使用更具体的选择器 */
		.bazi-view-table .bazi-stem-row td.wuxing-jin,
		.bazi-view-table .bazi-stem-row td.wuxing-jin span {
			color: #FFD700 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-stem-row td.wuxing-mu,
		.bazi-view-table .bazi-stem-row td.wuxing-mu span {
			color: #27ae60 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-stem-row td.wuxing-shui,
		.bazi-view-table .bazi-stem-row td.wuxing-shui span {
			color: #3498db !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-stem-row td.wuxing-huo,
		.bazi-view-table .bazi-stem-row td.wuxing-huo span {
			color: #e74c3c !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-stem-row td.wuxing-tu,
		.bazi-view-table .bazi-stem-row td.wuxing-tu span {
			color: #f39c12 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}

		/* 五行颜色（地支） - 使用更具体的选择器 */
		.bazi-view-table .bazi-branch-row td.wuxing-jin,
		.bazi-view-table .bazi-branch-row td.wuxing-jin span {
			color: #FFD700 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-branch-row td.wuxing-mu,
		.bazi-view-table .bazi-branch-row td.wuxing-mu span {
			color: #27ae60 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-branch-row td.wuxing-shui,
		.bazi-view-table .bazi-branch-row td.wuxing-shui span {
			color: #3498db !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-branch-row td.wuxing-huo,
		.bazi-view-table .bazi-branch-row td.wuxing-huo span {
			color: #e74c3c !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		.bazi-view-table .bazi-branch-row td.wuxing-tu,
		.bazi-view-table .bazi-branch-row td.wuxing-tu span {
			color: #f39c12 !important;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
		}
		`;

		// 添加到文档头部
		document.head.appendChild(styleEl);
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
		const modal = new BaziInfoModal(this.app, baziInfo, (codeBlock: string) => {
			// 获取当前活动的编辑器视图
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				// 在光标位置插入代码块
				const editor = activeView.editor;
				editor.replaceSelection(codeBlock);
				new Notice('八字命盘已插入到笔记中');
			} else {
				new Notice('无法插入八字命盘：未找到活动的编辑器视图');
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
	 * @param baziInfo 八字信息
	 */
	openBaziSettingsModal(baziId: string, initialDate: { year: number; month: number; day: number; hour: number }, onUpdate: (baziInfo: any) => void, baziInfo?: any) {
		const modal = new BaziSettingsModal(this.app, baziId, initialDate, onUpdate, baziInfo);
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
					this.handleSettingsButtonClick(container, baziId);
				}
			});
		});
	}

	/**
	 * 获取五行对应的CSS类名
	 * @param wuXing 五行名称
	 * @returns CSS类名
	 */
	getWuXingClass(wuXing: string): string {
		switch (wuXing) {
			case '金': return 'jin';
			case '木': return 'mu';
			case '水': return 'shui';
			case '火': return 'huo';
			case '土': return 'tu';
			default: return '';
		}
	}

	/**
	 * 为表格单元格添加事件监听器
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param baziInfo 八字信息
	 */
	addTableCellListeners(container: HTMLElement, baziId: string, baziInfo: any) {
		// 获取所有表格
		const daYunTable = container.querySelector(`#${baziId} .bazi-view-dayun-table`);
		const liuNianTable = container.querySelector(`#${baziId} .bazi-view-liunian-table`);
		const xiaoYunTable = container.querySelector(`#${baziId} .bazi-view-xiaoyun-table`);
		const liuYueTable = container.querySelector(`#${baziId} .bazi-view-liuyue-table`);

		// 为五行强度详情添加点击展开功能
		const wuXingToggle = container.querySelector(`#${baziId} .bazi-view-wuxing-toggle`);
		if (wuXingToggle) {
			wuXingToggle.addEventListener('click', (e) => {
				const detailsEl = container.querySelector(`#wuxing-details-${baziId}`);
				if (detailsEl && detailsEl instanceof HTMLElement) {
					// 切换显示/隐藏
					if (detailsEl.style.display === 'none') {
						detailsEl.style.display = 'block';
						(e.currentTarget as HTMLElement).textContent = '收起详情 ▲';
					} else {
						detailsEl.style.display = 'none';
						(e.currentTarget as HTMLElement).textContent = '查看详情 ▼';
					}
				}
			});
		}

		// 为日主旺衰详情添加点击展开功能
		const riZhuToggle = container.querySelector(`#${baziId} .bazi-view-rizhu-toggle`);
		if (riZhuToggle) {
			riZhuToggle.addEventListener('click', (e) => {
				const detailsEl = container.querySelector(`#rizhu-details-${baziId}`);
				if (detailsEl && detailsEl instanceof HTMLElement) {
					// 切换显示/隐藏
					if (detailsEl.style.display === 'none') {
						detailsEl.style.display = 'block';
						(e.currentTarget as HTMLElement).textContent = '收起详情 ▲';
					} else {
						detailsEl.style.display = 'none';
						(e.currentTarget as HTMLElement).textContent = '查看详情 ▼';
					}
				}
			});
		}

		// 获取存储在DOM中的数据
		const dataEl = container.querySelector(`#${baziId} .bazi-view-data`);
		let allDaYun: any[] = [];
		let allLiuNian: any[] = [];
		let allXiaoYun: any[] = [];
		let allLiuYue: any[] = [];

		if (dataEl) {
			try {
				const daYunData = dataEl.getAttribute('data-all-dayun');
				const liuNianData = dataEl.getAttribute('data-all-liunian');
				const xiaoYunData = dataEl.getAttribute('data-all-xiaoyun');
				const liuYueData = dataEl.getAttribute('data-all-liuyue');

				if (daYunData) allDaYun = JSON.parse(daYunData);
				if (liuNianData) allLiuNian = JSON.parse(liuNianData);
				if (xiaoYunData) allXiaoYun = JSON.parse(xiaoYunData);
				if (liuYueData) allLiuYue = JSON.parse(liuYueData);
			} catch (e) {
				console.error('解析八字数据出错:', e);
			}
		}

		// 为大运表格添加点击事件
		if (daYunTable) {
			const daYunCells = daYunTable.querySelectorAll('.bazi-dayun-cell');
			daYunCells.forEach(cell => {
				cell.addEventListener('click', (e) => {
					// 高亮选中的单元格
					daYunCells.forEach(c => c.classList.remove('selected'));
					(e.currentTarget as HTMLElement).classList.add('selected');

					// 获取大运索引
					const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');

					// 更新流年、小运和流月
					this.handleDaYunSelect(container, baziId, index, allDaYun, allLiuNian, allXiaoYun, allLiuYue);
				});
			});
		}

		// 为流年表格添加点击事件
		if (liuNianTable) {
			const liuNianCells = liuNianTable.querySelectorAll('.bazi-liunian-cell');
			liuNianCells.forEach(cell => {
				cell.addEventListener('click', (e) => {
					// 高亮选中的单元格
					liuNianCells.forEach(c => c.classList.remove('selected'));
					(e.currentTarget as HTMLElement).classList.add('selected');

					// 获取流年年份
					const year = parseInt((e.currentTarget as HTMLElement).getAttribute('data-year') || '0');

					// 更新流月
					this.handleLiuNianSelect(container, baziId, year, allLiuYue);
				});
			});
		}

		// 为小运表格添加点击事件
		if (xiaoYunTable) {
			const xiaoYunCells = xiaoYunTable.querySelectorAll('.bazi-xiaoyun-cell');
			xiaoYunCells.forEach(cell => {
				cell.addEventListener('click', (e) => {
					// 高亮选中的单元格
					xiaoYunCells.forEach(c => c.classList.remove('selected'));
					(e.currentTarget as HTMLElement).classList.add('selected');
				});
			});
		}

		// 为流月表格添加点击事件
		if (liuYueTable) {
			const liuYueCells = liuYueTable.querySelectorAll('.bazi-liuyue-cell');
			liuYueCells.forEach(cell => {
				cell.addEventListener('click', (e) => {
					// 高亮选中的单元格
					liuYueCells.forEach(c => c.classList.remove('selected'));
					(e.currentTarget as HTMLElement).classList.add('selected');
				});
			});
		}

		// 默认选中第一个大运
		if (daYunTable && allDaYun.length > 0) {
			const firstDaYunCell = daYunTable.querySelector('.bazi-dayun-cell');
			if (firstDaYunCell) {
				// 模拟点击第一个大运单元格
				firstDaYunCell.classList.add('selected');
				this.handleDaYunSelect(container, baziId, 0, allDaYun, allLiuNian, allXiaoYun, allLiuYue);
			}
		}
	}

	/**
	 * 处理大运选择
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param index 大运索引
	 * @param allDaYun 所有大运数据
	 * @param allLiuNian 所有流年数据
	 * @param allXiaoYun 所有小运数据
	 * @param allLiuYue 所有流月数据
	 */
	handleDaYunSelect(container: HTMLElement, baziId: string, index: number, allDaYun: any[], allLiuNian: any[], allXiaoYun: any[], allLiuYue: any[]) {
		// 根据选择的大运索引，筛选对应的流年、小运和流月
		const selectedDaYun = allDaYun[index];
		if (!selectedDaYun) return;

		// 筛选该大运对应的流年
		const filteredLiuNian = allLiuNian.filter(ln => {
			return ln.year >= selectedDaYun.startYear && ln.year <= selectedDaYun.endYear;
		});

		// 筛选该大运对应的小运
		const filteredXiaoYun = allXiaoYun.filter(xy => {
			return xy.year >= selectedDaYun.startYear && xy.year <= selectedDaYun.endYear;
		});

		// 更新流年表格
		this.updateLiuNianTable(container, baziId, filteredLiuNian, allLiuYue);

		// 更新小运表格
		this.updateXiaoYunTable(container, baziId, filteredXiaoYun);

		// 如果有流年，更新流月表格（取第一个流年的流月）
		if (filteredLiuNian.length > 0) {
			this.handleLiuNianSelect(container, baziId, filteredLiuNian[0].year, allLiuYue);
		}
	}

	/**
	 * 处理流年选择
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param year 流年年份
	 * @param allLiuYue 所有流月数据
	 */
	handleLiuNianSelect(container: HTMLElement, baziId: string, year: number, allLiuYue: any[]) {
		// 更新流月表格
		this.updateLiuYueTable(container, baziId, allLiuYue);

		// 高亮选中的流年单元格
		const liuNianTable = container.querySelector(`#${baziId} .bazi-view-liunian-table`);
		if (liuNianTable) {
			const cells = liuNianTable.querySelectorAll('.bazi-liunian-cell');
			cells.forEach(cell => {
				cell.classList.remove('selected');
				if (cell.getAttribute('data-year') === year.toString()) {
					cell.classList.add('selected');
				}
			});
		}
	}

	/**
	 * 更新流年表格
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param liuNian 流年数据
	 * @param allLiuYue 所有流月数据
	 */
	updateLiuNianTable(container: HTMLElement, baziId: string, liuNian: any[], allLiuYue: any[]) {
		const liuNianSection = container.querySelector(`#${baziId} .bazi-liunian-section`);
		if (!liuNianSection) return;

		// 获取或创建表格
		let table = liuNianSection.querySelector('.bazi-view-liunian-table');
		if (!table) {
			const tableContainer = liuNianSection.querySelector('.bazi-view-table-container');
			if (!tableContainer) return;
			table = document.createElement('table');
			table.className = 'bazi-view-table bazi-view-liunian-table';
			tableContainer.appendChild(table);
		}

		// 清空表格
		table.innerHTML = '';

		// 第一行：年份
		const yearRow = document.createElement('tr');
		const yearHeader = document.createElement('th');
		yearHeader.textContent = '流年';
		yearRow.appendChild(yearHeader);

		liuNian.slice(0, 10).forEach(ln => {
			const cell = document.createElement('td');
			cell.textContent = ln.year.toString();
			yearRow.appendChild(cell);
		});
		table.appendChild(yearRow);

		// 第二行：年龄
		const ageRow = document.createElement('tr');
		const ageHeader = document.createElement('th');
		ageHeader.textContent = '年龄';
		ageRow.appendChild(ageHeader);

		liuNian.slice(0, 10).forEach(ln => {
			const cell = document.createElement('td');
			cell.textContent = ln.age.toString();
			ageRow.appendChild(cell);
		});
		table.appendChild(ageRow);

		// 第三行：干支
		const gzRow = document.createElement('tr');
		const gzHeader = document.createElement('th');
		gzHeader.textContent = '干支';
		gzRow.appendChild(gzHeader);

		liuNian.slice(0, 10).forEach(ln => {
			const cell = document.createElement('td');
			cell.textContent = ln.ganZhi;
			cell.className = 'bazi-liunian-cell';
			cell.setAttribute('data-year', ln.year.toString());

			// 添加点击事件
			cell.addEventListener('click', () => {
				// 高亮选中的单元格
				if (table) {
					table.querySelectorAll('.bazi-liunian-cell').forEach(c => {
						c.classList.remove('selected');
					});
				}
				cell.classList.add('selected');

				// 更新流月
				this.handleLiuNianSelect(container, baziId, ln.year, allLiuYue);
			});

			gzRow.appendChild(cell);
		});
		table.appendChild(gzRow);

		// 如果有旬空信息，添加第四行
		if (liuNian.length > 0 && liuNian[0].xunKong) {
			const xkRow = document.createElement('tr');
			const xkHeader = document.createElement('th');
			xkHeader.textContent = '旬空';
			xkRow.appendChild(xkHeader);

			liuNian.slice(0, 10).forEach(ln => {
				const cell = document.createElement('td');
				cell.textContent = ln.xunKong || '';
				xkRow.appendChild(cell);
			});
			table.appendChild(xkRow);
		}
	}

	/**
	 * 更新小运表格
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param xiaoYun 小运数据
	 */
	updateXiaoYunTable(container: HTMLElement, baziId: string, xiaoYun: any[]) {
		const xiaoYunSection = container.querySelector(`#${baziId} .bazi-xiaoyun-section`);
		if (!xiaoYunSection) return;

		// 获取或创建表格
		let table = xiaoYunSection.querySelector('.bazi-view-xiaoyun-table');
		if (!table) {
			const tableContainer = xiaoYunSection.querySelector('.bazi-view-table-container');
			if (!tableContainer) return;
			table = document.createElement('table');
			table.className = 'bazi-view-table bazi-view-xiaoyun-table';
			tableContainer.appendChild(table);
		}

		// 清空表格
		table.innerHTML = '';

		// 第一行：年份
		const yearRow = document.createElement('tr');
		const yearHeader = document.createElement('th');
		yearHeader.textContent = '小运';
		yearRow.appendChild(yearHeader);

		xiaoYun.slice(0, 10).forEach(xy => {
			const cell = document.createElement('td');
			cell.textContent = xy.year.toString();
			yearRow.appendChild(cell);
		});
		table.appendChild(yearRow);

		// 第二行：年龄
		const ageRow = document.createElement('tr');
		const ageHeader = document.createElement('th');
		ageHeader.textContent = '年龄';
		ageRow.appendChild(ageHeader);

		xiaoYun.slice(0, 10).forEach(xy => {
			const cell = document.createElement('td');
			cell.textContent = xy.age.toString();
			ageRow.appendChild(cell);
		});
		table.appendChild(ageRow);

		// 第三行：干支
		const gzRow = document.createElement('tr');
		const gzHeader = document.createElement('th');
		gzHeader.textContent = '干支';
		gzRow.appendChild(gzHeader);

		xiaoYun.slice(0, 10).forEach(xy => {
			const cell = document.createElement('td');
			cell.textContent = xy.ganZhi;
			cell.className = 'bazi-xiaoyun-cell';
			cell.setAttribute('data-year', xy.year.toString());

			// 添加点击事件
			cell.addEventListener('click', () => {
				// 高亮选中的单元格
				if (table) {
					table.querySelectorAll('.bazi-xiaoyun-cell').forEach(c => {
						c.classList.remove('selected');
					});
				}
				cell.classList.add('selected');
			});

			gzRow.appendChild(cell);
		});
		table.appendChild(gzRow);

		// 如果有旬空信息，添加第四行
		if (xiaoYun.length > 0 && xiaoYun[0].xunKong) {
			const xkRow = document.createElement('tr');
			const xkHeader = document.createElement('th');
			xkHeader.textContent = '旬空';
			xkRow.appendChild(xkHeader);

			xiaoYun.slice(0, 10).forEach(xy => {
				const cell = document.createElement('td');
				cell.textContent = xy.xunKong || '';
				xkRow.appendChild(cell);
			});
			table.appendChild(xkRow);
		}
	}

	/**
	 * 更新流月表格
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 * @param liuYue 流月数据
	 */
	updateLiuYueTable(container: HTMLElement, baziId: string, liuYue: any[]) {
		const liuYueSection = container.querySelector(`#${baziId} .bazi-liuyue-section`);
		if (!liuYueSection) return;

		// 获取或创建表格
		let table = liuYueSection.querySelector('.bazi-view-liuyue-table');
		if (!table) {
			const tableContainer = liuYueSection.querySelector('.bazi-view-table-container');
			if (!tableContainer) return;
			table = document.createElement('table');
			table.className = 'bazi-view-table bazi-view-liuyue-table';
			tableContainer.appendChild(table);
		}

		// 清空表格
		table.innerHTML = '';

		// 第一行：月份
		const monthRow = document.createElement('tr');
		const monthHeader = document.createElement('th');
		monthHeader.textContent = '流月';
		monthRow.appendChild(monthHeader);

		liuYue.forEach(ly => {
			const cell = document.createElement('td');
			cell.textContent = ly.month.toString();
			monthRow.appendChild(cell);
		});
		table.appendChild(monthRow);

		// 第二行：干支
		const gzRow = document.createElement('tr');
		const gzHeader = document.createElement('th');
		gzHeader.textContent = '干支';
		gzRow.appendChild(gzHeader);

		liuYue.forEach(ly => {
			const cell = document.createElement('td');
			cell.textContent = ly.ganZhi;
			cell.className = 'bazi-liuyue-cell';
			cell.setAttribute('data-month', ly.month.toString());

			// 添加点击事件
			cell.addEventListener('click', () => {
				// 高亮选中的单元格
				if (table) {
					table.querySelectorAll('.bazi-liuyue-cell').forEach(c => {
						c.classList.remove('selected');
					});
				}
				cell.classList.add('selected');
			});

			gzRow.appendChild(cell);
		});
		table.appendChild(gzRow);

		// 如果有旬空信息，添加第三行
		if (liuYue.length > 0 && liuYue[0].xunKong) {
			const xkRow = document.createElement('tr');
			const xkHeader = document.createElement('th');
			xkHeader.textContent = '旬空';
			xkRow.appendChild(xkHeader);

			liuYue.forEach(ly => {
				const cell = document.createElement('td');
				cell.textContent = ly.xunKong || '';
				xkRow.appendChild(cell);
			});
			table.appendChild(xkRow);
		}
	}



	/**
	 * 处理设置按钮点击事件
	 * @param container 容器元素
	 * @param baziId 八字命盘ID
	 */
	handleSettingsButtonClick(container: HTMLElement, baziId: string): void {
		if (baziId) {
			// 获取日期数据
			const dataEl = container.querySelector(`#${baziId} .bazi-view-data`);
			if (dataEl) {
				const year = parseInt(dataEl.getAttribute('data-year') || '0');
				const month = parseInt(dataEl.getAttribute('data-month') || '0');
				const day = parseInt(dataEl.getAttribute('data-day') || '0');
				const hour = parseInt(dataEl.getAttribute('data-hour') || '0');

				// 获取原始源代码和八字
				const sourceBlock = container.closest('.markdown-rendered');
				if (sourceBlock) {
					const codeBlock = sourceBlock.closest('[data-bazi-source]');
					if (codeBlock) {
						// 获取当前八字信息
						const baziInfo: any = {};

						// 获取性别
						const genderEl = container.querySelector(`#${baziId} .bazi-view-gender`);
						if (genderEl) {
							baziInfo.gender = genderEl.getAttribute('data-gender') || '';
						}

						// 获取排盘方式
						const calculationMethodEl = container.querySelector(`#${baziId} .bazi-view-calculation-method`);
						if (calculationMethodEl) {
							baziInfo.calculationMethod = calculationMethodEl.getAttribute('data-calculation-method') || '0';
						}

						// 获取八字流派
						const baziSectEl = container.querySelector(`#${baziId} .bazi-view-bazi-sect`);
						if (baziSectEl) {
							baziInfo.baziSect = baziSectEl.getAttribute('data-bazi-sect') || '2';
						}

						// 获取显示选项
						const showWuxingEl = container.querySelector(`#${baziId} .bazi-view-show-wuxing`);
						if (showWuxingEl) {
							baziInfo.showWuxing = showWuxingEl.getAttribute('data-show-wuxing') === 'true';
						}

						const showSpecialInfoEl = container.querySelector(`#${baziId} .bazi-view-show-special-info`);
						if (showSpecialInfoEl) {
							baziInfo.showSpecialInfo = showSpecialInfoEl.getAttribute('data-show-special-info') === 'true';
						}

						// 获取神煞显示设置
						baziInfo.showShenSha = {
							siZhu: this.settings.showShenSha.siZhu,
							daYun: this.settings.showShenSha.daYun,
							liuNian: this.settings.showShenSha.liuNian,
							xiaoYun: this.settings.showShenSha.xiaoYun,
							liuYue: this.settings.showShenSha.liuYue
						};

						// 打开设置模态框
						this.openBaziSettingsModal(baziId, { year, month, day, hour }, (newBaziInfo) => {
							// 调试信息：检查神煞数据
							console.log('更新八字命盘前，检查神煞数据:');
							// 手动检查神煞数据
							console.log('======= 神煞数据检查 =======');

							// 检查四柱神煞
							console.log('年柱神煞:', newBaziInfo.yearShenSha);
							console.log('月柱神煞:', newBaziInfo.monthShenSha);
							console.log('日柱神煞:', newBaziInfo.dayShenSha);
							console.log('时柱神煞:', newBaziInfo.hourShenSha);

							// 检查大运神煞
							console.log('大运神煞数据:');
							if (Array.isArray(newBaziInfo.daYun)) {
								newBaziInfo.daYun.forEach((dy, index) => {
									console.log(`大运${index+1} (${dy.ganZhi}) 神煞:`, dy.shenSha);
								});
							} else {
								console.log('大运数据不是数组');
							}

							// 检查流年神煞
							console.log('流年神煞数据:');
							if (newBaziInfo.liuNian && newBaziInfo.liuNian.length > 0) {
								newBaziInfo.liuNian.forEach((ln, index) => {
									console.log(`流年${index+1} (${ln.year}) 神煞:`, ln.shenSha);
								});
							} else {
								console.log('流年数据为空');
							}

							// 检查小运神煞
							console.log('小运神煞数据:');
							if (newBaziInfo.xiaoYun && newBaziInfo.xiaoYun.length > 0) {
								newBaziInfo.xiaoYun.forEach((xy, index) => {
									console.log(`小运${index+1} (${xy.year}) 神煞:`, xy.shenSha);
								});
							} else {
								console.log('小运数据为空');
							}

							// 检查流月神煞
							console.log('流月神煞数据:');
							if (newBaziInfo.liuYue && newBaziInfo.liuYue.length > 0) {
								newBaziInfo.liuYue.forEach((ly, index) => {
									console.log(`流月${index+1} (${ly.month}) 神煞:`, ly.shenSha);
								});
							} else {
								console.log('流月数据为空');
							}

							// 检查神煞显示设置
							console.log('神煞显示设置:', newBaziInfo.showShenSha);

							console.log('======= 神煞数据检查结束 =======');

							// 更新八字命盘
							const newHtml = BaziService.generateBaziHTML(newBaziInfo, baziId);
							container.innerHTML = newHtml;

							// 重新添加事件监听器
							this.addSettingsButtonListeners(container);

							// 为表格单元格添加事件监听器
							this.addTableCellListeners(container, baziId, newBaziInfo);

							// 如果是在代码块中，更新源代码
							const sourceBlock = container.closest('.markdown-rendered');
							if (sourceBlock) {
								const codeBlock = sourceBlock.closest('[data-bazi-source]');
								if (codeBlock) {
									// 获取原始源代码
									const originalSource = codeBlock.getAttribute('data-bazi-source') || '';
									// 手动实现 this.parseCodeBlockParams(originalSource) 的功能
									const params: BaziParams = {};
									const lines = originalSource.split('\n');

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

									// 检查原始源代码中使用的是哪种参数
									if (params.date) {
										// 如果原始使用的是date参数，更新日期
										const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
										params.date = dateStr;
									} else if (params.lunar) {
										// 如果原始使用的是lunar参数，尝试更新农历日期
										// 这里简化处理，实际上应该从newBaziInfo中获取农历日期
										const lunarDate = newBaziInfo.lunarDate;
										if (lunarDate) {
											params.lunar = lunarDate;
										}

										// 同时添加date参数，保存调整后的时间
										if (newBaziInfo.solarDate && newBaziInfo.solarTime) {
											const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
											params.date = dateStr;
										}
									} else if (params.bazi) {
										// 如果原始使用的是bazi参数，更新八字
										const bazi = `${newBaziInfo.yearPillar} ${newBaziInfo.monthPillar} ${newBaziInfo.dayPillar} ${newBaziInfo.hourPillar}`;
										params.bazi = bazi;

										// 同时添加date参数，保存调整后的时间
										if (newBaziInfo.solarDate && newBaziInfo.solarTime) {
											const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
											params.date = dateStr;
										}
									} else if (params.now) {
										// 如果原始使用的是now参数，改为使用具体日期
										params.now = 'false';

										// 添加date参数，保存调整后的时间
										if (newBaziInfo.solarDate && newBaziInfo.solarTime) {
											const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
											params.date = dateStr;
										}
									} else {
										// 如果没有任何参数，添加date参数
										if (newBaziInfo.solarDate && newBaziInfo.solarTime) {
											const dateStr = `${newBaziInfo.solarDate} ${newBaziInfo.solarTime}`;
											params.date = dateStr;
										}
									}

									// 添加显示选项
									if (newBaziInfo.showWuxing !== undefined) {
										params.showWuxing = newBaziInfo.showWuxing.toString();
									}

									if (newBaziInfo.showSpecialInfo !== undefined) {
										params.showSpecialInfo = newBaziInfo.showSpecialInfo.toString();
									}

									if (newBaziInfo.gender !== undefined) {
										params.gender = newBaziInfo.gender;
									}

									if (newBaziInfo.calculationMethod !== undefined) {
										params.calculationMethod = newBaziInfo.calculationMethod;
									}

									// 重新构建源代码
									let newSource = '';
									for (const key in params) {
										newSource += `${key}: ${params[key]}\n`;
									}

									// 更新源代码属性
									codeBlock.setAttribute('data-bazi-source', newSource);
									console.log('更新data-bazi-source属性:', newSource);

									// 更新编辑器中的代码块内容
									console.log('调用updateCodeBlockInEditor方法');

									// 使用setTimeout确保DOM更新后再更新编辑器
									// 增加延迟时间，确保DOM更新完成
									setTimeout(() => {
										// 手动实现 this.updateCodeBlockInEditor(newSource, container) 的功能
										console.log('开始更新代码块');

										// 显示状态通知
										const statusNotice = new Notice('正在更新八字命盘代码块...', 0);

										try {
											// 获取当前文件
											const file = this.app.workspace.getActiveFile();
											if (!file) {
												console.error('无法获取当前文件');
												statusNotice.hide();
												new Notice('更新代码块失败：无法获取当前文件', 3000);
												return;
											}

											// 获取当前活动的编辑器视图
											const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
											if (!activeView) {
												statusNotice.hide();
												console.log('无法获取活动的编辑器视图');
												new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
												return;
											}

											const editor = activeView.editor;
											console.log('获取到编辑器:', editor ? '成功' : '失败');

											if (!editor) {
												statusNotice.hide();
												new Notice('更新代码块失败：无法获取编辑器实例', 3000);
												return;
											}

											// 获取文档中所有的bazi代码块
											const text = editor.getValue();
											const lines = text.split('\n');

											console.log('开始在文档中查找bazi代码块');
											statusNotice.setMessage('正在查找八字命盘代码块...');

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
													console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
												} else if (line.startsWith('```') && inCodeBlock) {
													inCodeBlock = false;
													endLine = i;
													console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);

													if (blockLanguage === 'bazi') {
														foundBlocks++;
														console.log(`找到第${foundBlocks}个bazi代码块，从第${startLine+1}行到第${endLine+1}行`);

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

											// 如果找到了多个代码块，尝试找到最匹配的
											if (blockContents.length > 0) {
												// 使用第一个代码块
												const block = blockContents[0];

												// 替换代码块内容
												const trimmedSource = newSource.trim();

												// 检测原始代码块的缩进
												let indentation = '';
												// 检查第一行的缩进
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

												// 使用编辑器API替换代码块
												editor.replaceRange(
													indentedSource,
													{line: block.start + 1, ch: 0},
													{line: block.end, ch: 0}
												);

												statusNotice.hide();
												new Notice('八字命盘代码块已更新', 3000);
												console.log('使用编辑器API更新代码块成功');
											} else {
												statusNotice.hide();
												console.log('未找到任何bazi代码块');
												new Notice('更新代码块失败：未找到任何bazi代码块', 3000);
											}
										} catch (error) {
											statusNotice.hide();
											console.error('更新代码块时出错:', error);
											new Notice('更新代码块时出错: ' + error.message, 5000);
										}
										console.log('updateCodeBlockInEditor方法调用完成');
									}, 500);
								}
							}
						}, baziInfo);
					}
				}
			}
		}
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

		// 移除默认性别设置选项
		// new Setting(containerEl)
		// 	.setName('默认性别')
		// 	.setDesc('选择默认性别，用于大运计算')
		// 	.addDropdown(dropdown => {
		// 		dropdown
		// 			.addOption('1', '男')
		// 			.addOption('0', '女')
		// 			.setValue(this.plugin.settings.defaultGender)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.defaultGender = value;
		// 				await this.plugin.saveSettings();
		// 			});
		// 	});

		containerEl.createEl('h3', {text: '高级设置'});

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

		new Setting(containerEl)
			.setName('调试模式')
			.setDesc('启用后，将在控制台输出详细的调试信息，有助于排查问题')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();

						if (value) {
							console.log('八字命盘插件调试模式已启用');
						}
					});
			});

		// 神煞显示设置
		containerEl.createEl('h3', {text: '神煞显示设置'});

		new Setting(containerEl)
			.setName('显示四柱神煞')
			.setDesc('是否在四柱表格中显示神煞行')
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
			.setDesc('是否在大运表格中显示神煞行')
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
			.setDesc('是否在流年表格中显示神煞行')
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
			.setDesc('是否在小运表格中显示神煞行')
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
			.setDesc('是否在流月表格中显示神煞行')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showShenSha.liuYue)
					.onChange(async (value) => {
						this.plugin.settings.showShenSha.liuYue = value;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl('h3', {text: '使用说明'});

		const usageList = containerEl.createEl('ul');
		usageList.createEl('li', {text: '点击左侧栏的八字命盘图标或使用命令面板中的"输入时间转八字"命令可以在光标位置插入八字命盘'});
		usageList.createEl('li', {text: '在交互式八字命盘中，点击右上角的设置图标可以调整参数'});
		usageList.createEl('li', {text: '选中八字文本后，使用命令面板中的"解析选中的八字"命令可以解析八字并生成详细信息'});
		usageList.createEl('li', {text: '所有类型的八字代码块（日期、农历、纯八字、当前时间）都支持性别选择功能，如果未指定性别，会显示性别选择按钮'});

		containerEl.createEl('h3', {text: '代码块用法'});

		containerEl.createEl('p', {
			text: '使用公历日期：'
		});
		const codeExample = containerEl.createEl('pre');
		codeExample.createEl('code', {
			text: '```bazi\ndate: 1986-05-29 12:00\ngender: 男\n```'
		});

		containerEl.createEl('p', {
			text: '使用农历日期：'
		});
		const codeExample3 = containerEl.createEl('pre');
		codeExample3.createEl('code', {
			text: '```bazi\nlunar: 1986-4-21 12:00\nleap: false\ngender: 女\n```'
		});

		containerEl.createEl('p', {
			text: '使用当前时间：'
		});
		const codeExample4 = containerEl.createEl('pre');
		codeExample4.createEl('code', {
			text: '```bazi\nnow: true\ngender: 男\n```'
		});

		containerEl.createEl('p', {
			text: '直接使用八字：'
		});
		const codeExample2 = containerEl.createEl('pre');
		codeExample2.createEl('code', {
			text: '```bazi\nbazi: 甲子 乙丑 丙寅 丁卯\ngender: 女\nyear: 1984\n```'
		});

		containerEl.createEl('h3', {text: '高级选项'});

		containerEl.createEl('p', {
			text: '您可以添加以下选项来自定义显示：'
		});
		const codeExample5 = containerEl.createEl('pre');
		codeExample5.createEl('code', {
			text: '```bazi\ndate: 1986-05-29 12:00\ngender: 男\ntitle: 我的八字命盘\nshowWuxing: true\nshowSpecialInfo: true\ntheme: colorful\n```'
		});

		containerEl.createEl('p', {
			text: '主题选项：默认、dark（暗色）、light（亮色）、colorful（彩色）'
		});

		containerEl.createEl('h3', {text: '性别和年份参数'});

		containerEl.createEl('p', {
			text: '性别参数（gender）：用于大运计算，可以是"男"、"女"、"male"、"female"、"1"（男）、"0"（女）'
		});

		containerEl.createEl('p', {
			text: '年份参数（year）：仅在使用纯八字（bazi）时需要，用于指定八字所在的年份，如果不指定，会显示年份选择按钮'
		});

		containerEl.createEl('p', {
			text: '如果未指定性别，会显示性别选择按钮，点击后会自动更新代码块并添加性别参数'
		});
	}
}
