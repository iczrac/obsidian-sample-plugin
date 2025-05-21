import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, debounce } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { DatePickerModal } from 'src/ui/DatePickerModal';
import { BaziInfoModal } from 'src/ui/BaziInfoModal';
import { BaziParserModal } from 'src/ui/BaziParserModal';
import { BaziSettingsModal } from 'src/ui/BaziSettingsModal';
import { InteractiveBaziView } from 'src/ui/InteractiveBaziView';

interface BaziPluginSettings {
	defaultFormat: string;
	useInteractiveView: boolean;
	debugMode: boolean;
	autoUpdateCodeBlock: boolean;
	codeBlockUpdateDelay: number;
	baziSect: string; // 八字流派
	defaultGender: string; // 默认性别
}

const DEFAULT_SETTINGS: BaziPluginSettings = {
	defaultFormat: 'full', // 'full' 或 'simple'
	useInteractiveView: true, // 是否使用交互式视图
	debugMode: false, // 调试模式
	autoUpdateCodeBlock: true, // 自动更新代码块
	codeBlockUpdateDelay: 500, // 代码块更新延迟（毫秒）
	baziSect: '2', // 默认使用流派2（晚子时日柱算当天）
	defaultGender: '1' // 默认为男性
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
						// 生成八字信息的HTML
						const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
						const html = BaziService.generateBaziHTML(baziInfo as any, id);

						// 替换选中的文本为代码块
						const dateStr = `${baziInfo.solarDate} ${baziInfo.solarTime}`;
						editor.replaceSelection(`\`\`\`bazi
date: ${dateStr}
\`\`\``);
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
	}

	async onload() {
		await this.loadSettings();

		// 添加命令
		this.addCommands();

		// 加载CSS样式
		this.loadStyles();

		// 添加左侧图标
		const ribbonIconEl = this.addRibbonIcon('calendar-clock', '八字命盘', (evt: MouseEvent) => {
			// 点击图标时打开日期选择模态框
			this.openDatePickerModal();
		});
		ribbonIconEl.addClass('bazi-plugin-ribbon-class');

		// 注册代码块处理器 - 类似Dataview的方式
		this.registerMarkdownCodeBlockProcessor('bazi', (source, el, _ctx) => {
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

					// 获取性别参数，如果没有则使用默认值
					let gender = this.settings.defaultGender;
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
					this.applyDisplayOptions(el, params);
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

					// 获取性别参数，如果没有则使用默认值
					let gender = this.settings.defaultGender;
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
					this.applyDisplayOptions(el, params);
				} catch (error) {
					// 显示错误信息
					el.createEl('div', {
						cls: 'bazi-error',
						text: `八字命盘渲染错误: ${error.message}`
					});
				}
			} else if (params.bazi) {
				try {
					// 获取性别参数，如果没有则使用默认值
					let gender = this.settings.defaultGender;
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
							const tipContainer = el.createDiv({
								cls: 'bazi-tip-container',
								attr: { 'style': 'background-color: rgba(255, 255, 0, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative;' }
							});
							tipContainer.createDiv({
								text: '此八字对应多个年份，请点击下方年份按钮选择：',
								attr: { 'style': 'margin-bottom: 5px;' }
							});

							// 创建年份按钮容器
							const yearsContainer = tipContainer.createDiv({
								attr: { 'style': 'display: flex; flex-wrap: wrap; gap: 5px;' }
							});

							// 为每个年份创建按钮
							(baziInfo.matchingYears as number[]).forEach(year => {
								const yearButton = yearsContainer.createEl('button', {
									text: year.toString(),
									attr: { 'style': 'padding: 5px 10px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;' }
								});
								yearButton.addEventListener('click', () => {
									// 尝试直接更新代码块
									const newSource = source + (source.trim().endsWith('\n') ? '' : '\n') + `year: ${year}\n`;
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
													this.updateCodeBlockWithEditorAPI(newSource);
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
															const params = this.parseCodeBlockParams(newSource);
															const gender = params.gender || this.settings.defaultGender;
															const baziInfo = BaziService.parseBaziString(params.bazi, gender, this.settings.baziSect, year);
															const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
															// 清理newSource中的特殊字符
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
															console.log('已直接重新渲染视图元素');
															// 确保文件内容也被修改并保存，使用唯一标识符准确匹配当前代码块
															const activeLeaf = this.app.workspace.activeLeaf;
															if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
																const editor = activeLeaf.view.editor;
																const file = activeLeaf.view.file;
																if (editor && file) {
																	this.app.vault.read(file).then(content => {
																		// 使用正则表达式和唯一标识符准确匹配当前代码块
																		const codeBlockRegex = new RegExp(`\`\`\`bazi\\s*${source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')}\\s*\`\`\``, 'm');
																		const updatedContent = content.replace(codeBlockRegex, `\`\`\`bazi\n${newSource}\n\`\`\``);
																		this.app.vault.modify(file, updatedContent).then(() => {
																			console.log('文件内容已更新并保存，使用唯一标识符准确匹配当前代码块');
																			new Notice('文件内容已更新并保存');
																		}).catch(error => {
																			console.error('更新文件内容失败:', error);
																			new Notice('更新文件内容失败');
																		});
																	}).catch(error => {
																		console.error('读取文件内容失败:', error);
																		new Notice('读取文件内容失败');
																	});
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
					this.applyDisplayOptions(el, params);
					console.log('应用显示选项:', params);
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

					// 获取性别参数，如果没有则使用默认值
					let gender = this.settings.defaultGender;
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

					// 添加源代码属性，用于编辑时恢复
					el.setAttribute('data-bazi-source', source);

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
					this.applyDisplayOptions(el, params);
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
		if (this.settings.autoUpdateCodeBlock) {
			this.registerDocumentChangeEvents();
		}

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
	handleSettingsButtonClick(container: HTMLElement, baziId: string) {
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
						// 打开设置模态框
						this.openBaziSettingsModal(baziId, { year, month, day, hour }, (newBaziInfo) => {
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
									const params = this.parseCodeBlockParams(originalSource);

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
										this.updateCodeBlockInEditor(newSource, container);
										console.log('updateCodeBlockInEditor方法调用完成');
									}, 500);
								}
							}
						});
					}
				}
			}
		}
	}

	/**
	 * 解析代码块参数
	 * @param source 代码块源代码
	 * @returns 解析后的参数对象
	 */
	parseCodeBlockParams(source: string) {
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

	/**
	 * 应用显示选项
	 * @param el 容器元素
	 * @param params 参数对象
	 */
	applyDisplayOptions(el: HTMLElement, params: Record<string, string>) {
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
		}
	}

	/**
	 * 更新编辑器中的代码块内容
	 * @param newSource 新的源代码
	 * @param container 容器元素
	 */
	updateCodeBlockInEditor(newSource: string, container: HTMLElement) {
		console.log('开始执行updateCodeBlockInEditor方法');
		console.log('新的源代码:', newSource);

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

			// 首先尝试使用vault.modify方法更新文件内容（更可靠的方式）
			this.app.vault.read(file).then((content) => {
				console.log('成功读取文件内容，文件长度:', content.length);

				// 查找所有bazi代码块
				const regex = /```bazi\n([\s\S]*?)```/g;
				let match: RegExpExecArray | null;
				let found = false;
				let newContent = content;
				let matchCount = 0;

				// 查找与当前容器关联的代码块
				// 通过比较代码块内容来确定是哪个代码块
				const sourceBlock = container.closest('.markdown-rendered');
				const codeBlock = sourceBlock ? sourceBlock.closest('[data-bazi-source]') : null;
				const originalSource = codeBlock ? codeBlock.getAttribute('data-bazi-source') || '' : '';

				console.log('原始源代码:', originalSource);

				// 记录所有匹配的代码块位置
				const matches: {index: number, content: string, fullMatch: string}[] = [];
				while ((match = regex.exec(content)) !== null) {
					matchCount++;
					matches.push({
						index: match.index,
						content: match[1],
						fullMatch: match[0]
					});
					console.log(`找到第${matchCount}个bazi代码块，内容:`, match[1].substring(0, 50) + (match[1].length > 50 ? '...' : ''));
				}

				console.log(`共找到${matchCount}个bazi代码块`);

				// 如果找到了原始源代码，尝试匹配对应的代码块
				if (originalSource && matches.length > 0) {
					// 尝试找到最匹配的代码块
					let bestMatchIndex = -1;
					let bestMatchScore = 0;

					for (let i = 0; i < matches.length; i++) {
						const match = matches[i];
						// 计算匹配分数（改进的相似度计算）
						let score = 0;
						const matchLines = match.content.split('\n');
						const originalLines = originalSource.split('\n');

						// 计算有多少行是相同的
						for (const line of originalLines) {
							if (matchLines.includes(line)) {
								score += 2; // 完全匹配的行给予更高的分数
							} else {
								// 检查部分匹配
								for (const matchLine of matchLines) {
									if (matchLine.includes(line) || line.includes(matchLine)) {
										score += 1; // 部分匹配给予较低的分数
										break;
									}
								}
							}
						}

						// 如果内容长度相近，增加分数
						const lengthDiff = Math.abs(match.content.length - originalSource.length);
						if (lengthDiff < 50) {
							score += 1;
						}

						console.log(`代码块${i+1}匹配分数:`, score);

						if (score > bestMatchScore) {
							bestMatchScore = score;
							bestMatchIndex = i;
						}
					}

					if (bestMatchIndex >= 0) {
						console.log(`选择第${bestMatchIndex+1}个代码块作为最佳匹配，分数:`, bestMatchScore);

						// 找到最匹配的代码块，替换它
						const matchToReplace = matches[bestMatchIndex];
						const startPos = matchToReplace.index;
						const endPos = startPos + matchToReplace.fullMatch.length;

						// 构建新的代码块内容
						const newBlock = '```bazi\n' + newSource + '```';

						// 替换代码块
						newContent =
							newContent.substring(0, startPos) +
							newBlock +
							newContent.substring(endPos);

						found = true;

						// 显示详细的匹配信息
						console.log('匹配详情:', {
							原始内容: originalSource,
							匹配内容: matchToReplace.content,
							新内容: newSource,
							位置: `${startPos}-${endPos}`,
							文档长度: content.length
						});
					}
				}

				// 如果没有找到匹配的代码块，替换第一个
				if (!found && matchCount > 0) {
					console.log('未找到匹配的代码块，替换第一个代码块');

					// 重置正则表达式
					regex.lastIndex = 0;
					match = regex.exec(content);

					if (match) {
						// 替换代码块内容
						const oldBlock = match[0];
						const newBlock = '```bazi\n' + newSource + '```';

						// 替换第一个匹配的代码块
						newContent = newContent.replace(oldBlock, newBlock);
						found = true;

						// 显示替换信息
						console.log('替换第一个代码块:', {
							原始内容: oldBlock,
							新内容: newBlock
						});
					}
				}

				if (found) {
					// 更新文件内容
					statusNotice.setMessage('正在写入文件...');

					this.app.vault.modify(file, newContent).then(() => {
						statusNotice.hide();
						new Notice('八字命盘代码块已更新', 3000);
						console.log('使用vault.modify更新代码块成功');
					}).catch((error) => {
						statusNotice.hide();
						console.error('使用vault.modify更新代码块时出错:', error);
						new Notice('更新代码块时出错: ' + error.message, 5000);

						// 如果vault.modify失败，尝试使用编辑器API
						this.updateCodeBlockWithEditorAPI(newSource);
					});
				} else {
					console.log('未找到任何bazi代码块，尝试使用编辑器API');
					statusNotice.setMessage('未找到匹配的代码块，尝试使用编辑器API...');

					// 如果没有找到任何代码块，尝试使用编辑器API
					this.updateCodeBlockWithEditorAPI(newSource);
				}
			}).catch((error) => {
				statusNotice.hide();
				console.error('读取文件内容时出错:', error);
				new Notice('读取文件内容时出错: ' + error.message, 5000);

				// 如果读取文件失败，尝试使用编辑器API
				this.updateCodeBlockWithEditorAPI(newSource);
			});
		} catch (error) {
			statusNotice.hide();
			console.error('更新代码块时出错:', error);
			new Notice('更新代码块时出错: ' + error.message, 5000);

			// 如果出现错误，尝试使用编辑器API
			this.updateCodeBlockWithEditorAPI(newSource);
		}
	}

	/**
	 * 使用编辑器API更新代码块内容
	 * @param newSource 新的源代码
	 */
	private updateCodeBlockWithEditorAPI(newSource: string) {
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
			if (blockContents.length > 1) {
				statusNotice.setMessage('找到多个代码块，正在选择最匹配的...');
				console.log(`找到${blockContents.length}个bazi代码块，尝试找到最匹配的`);

				// 尝试找到最匹配的代码块
				let bestMatchIndex = 0;
				let bestMatchScore = 0;

				for (let i = 0; i < blockContents.length; i++) {
					const block = blockContents[i];
					// 计算匹配分数（简单的相似度计算）
					let score = 0;
					const blockLines = block.content.split('\n');
					const newSourceLines = newSource.split('\n');

					// 计算有多少行是相同的或相似的
					for (const line of newSourceLines) {
						if (blockLines.includes(line)) {
							score += 2; // 完全匹配的行给予更高的分数
						} else {
							// 检查部分匹配
							for (const blockLine of blockLines) {
								if (blockLine.includes(line) || line.includes(blockLine)) {
									score += 1; // 部分匹配给予较低的分数
									break;
								}
							}
						}
					}

					console.log(`代码块${i+1}匹配分数:`, score);

					if (score > bestMatchScore) {
						bestMatchScore = score;
						bestMatchIndex = i;
					}
				}

				console.log(`选择第${bestMatchIndex+1}个代码块作为最佳匹配，分数:`, bestMatchScore);

				// 使用最匹配的代码块
				const bestMatch = blockContents[bestMatchIndex];
				startLine = bestMatch.start;
				endLine = bestMatch.end;
			} else if (blockContents.length === 1) {
				// 只有一个代码块，直接使用
				startLine = blockContents[0].start;
				endLine = blockContents[0].end;
			}

			if (blockContents.length > 0) {
				statusNotice.setMessage('正在更新代码块...');

				// 构建新的代码块内容
				const newText = '```bazi\n' + newSource + '```';

				// 获取当前代码块内容
				let currentText = '';
				for (let j = startLine; j <= endLine; j++) {
					currentText += lines[j] + (j < endLine ? '\n' : '');
				}

				console.log('当前代码块内容:', currentText);
				console.log('新代码块内容:', newText);

				// 只有当内容有变化时才更新
				if (currentText !== newText) {
					try {
						// 保存当前光标位置
						const cursor = editor.getCursor();

						// 替换代码块内容
						editor.replaceRange(
							newText,
							{ line: startLine, ch: 0 },
							{ line: endLine + 1, ch: 0 }
						);

						// 恢复光标位置
						editor.setCursor(cursor);

						// 显示通知
						statusNotice.hide();
						new Notice('八字命盘代码块已更新', 3000);
						console.log('代码块更新成功');
					} catch (error) {
						statusNotice.hide();
						console.error('更新代码块时出错:', error);
						new Notice('更新代码块时出错: ' + error.message, 5000);
					}
				} else {
					statusNotice.hide();
					console.log('代码块内容没有变化，不需要更新');
					new Notice('代码块内容没有变化，不需要更新', 3000);
				}
			} else {
				console.log('未找到任何bazi代码块，在文档末尾添加一个');
				statusNotice.setMessage('未找到任何代码块，正在添加新代码块...');

				// 如果没有找到任何代码块，在文档末尾添加一个
				const newBlock = '\n```bazi\n' + newSource + '```\n';

				try {
					// 在文档末尾添加代码块
					editor.replaceRange(
						newBlock,
						{ line: lines.length, ch: 0 }
					);

					statusNotice.hide();
					new Notice('已在文档末尾添加八字命盘代码块', 3000);
					console.log('在文档末尾添加代码块成功');
				} catch (error) {
					statusNotice.hide();
					console.error('添加代码块时出错:', error);
					new Notice('添加代码块时出错: ' + error.message, 5000);
				}
			}
		} catch (error) {
			statusNotice.hide();
			console.error('尝试更新代码块时出错:', error);
			new Notice('更新代码块时出错: ' + error.message, 5000);
		}
	}

	/**
	 * 获取代码块在文档中的位置
	 * @param editor 编辑器
	 * @param language 代码块语言
	 * @returns 代码块位置
	 */
	getCodeBlockPosition(editor: Editor, language: string) {
		const text = editor.getValue();
		const lines = text.split('\n');

		// 定义代码块位置接口
		interface CodeBlockPosition {
			from: { line: number; ch: number };
			to: { line: number; ch: number };
		}

		// 查找所有代码块
		const codeBlocks: CodeBlockPosition[] = [];
		let inCodeBlock = false;
		let startLine = -1;
		let blockLanguage = '';

		console.log(`开始查找${language}代码块，文档共${lines.length}行`);

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (line.startsWith('```') && !inCodeBlock) {
				inCodeBlock = true;
				startLine = i;
				blockLanguage = line.substring(3).trim();
				console.log(`第${i+1}行: 找到代码块开始，语言: ${blockLanguage}`);
			} else if (line.startsWith('```') && inCodeBlock) {
				inCodeBlock = false;
				console.log(`第${i+1}行: 找到代码块结束，语言: ${blockLanguage}`);
				if (blockLanguage === language) {
					console.log(`添加${language}代码块: 从第${startLine+1}行到第${i+1}行`);
					codeBlocks.push({
						from: { line: startLine, ch: 0 },
						to: { line: i + 1, ch: 0 }
					});
				}
			}
		}

		console.log(`共找到${codeBlocks.length}个${language}代码块`);

		// 找到当前活动的代码块
		const cursor = editor.getCursor();
		console.log(`当前光标位置: 第${cursor.line+1}行, 第${cursor.ch+1}列`);

		for (const block of codeBlocks) {
			if (cursor.line >= block.from.line && cursor.line <= block.to.line) {
				console.log(`找到活动代码块: 从第${block.from.line+1}行到第${block.to.line+1}行`);
				return block;
			}
		}

		// 如果没有找到活动的代码块，返回第一个匹配的代码块
		if (codeBlocks.length > 0) {
			const firstBlock = codeBlocks[0];
			console.log(`未找到活动代码块，使用第一个匹配的代码块: 从第${firstBlock.from.line+1}行到第${firstBlock.to.line+1}行`);
			return firstBlock;
		}

		console.log(`未找到任何${language}代码块`);
		return null;
	}

	/**
	 * 注册文档变化事件监听器
	 */
	private registerDocumentChangeEvents() {
		// 监听编辑器变化事件
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor, markdownView) => {
				// 确保是MarkdownView类型
				if (!(markdownView instanceof MarkdownView)) {
					return;
				}

				// 只在编辑模式下处理
				if (markdownView.getMode() !== 'source') {
					return;
				}

				// 获取编辑器内容
				const content = editor.getValue();

				// 检查是否包含bazi代码块
				if (content.includes('```bazi')) {
					// 延迟处理，避免频繁更新
					this.debouncedProcessDocumentChange(editor, markdownView);
				}
			})
		);

		// 监听活动叶子变化事件
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				// 检查leaf和view是否存在
				if (!leaf || !leaf.view) {
					return;
				}

				// 检查是否是markdown视图
				if (leaf.view instanceof MarkdownView) {
					const markdownView = leaf.view;
					const editor = markdownView.editor;

					// 获取编辑器内容
					const content = editor.getValue();

					// 检查是否包含bazi代码块
					if (content.includes('```bazi')) {
						// 延迟处理，避免频繁更新
						this.debouncedProcessDocumentChange(editor, markdownView);
					}
				}
			})
		);

		if (this.settings.debugMode) {
			console.log('已注册文档变化事件监听器');
		}
	}

	/**
	 * 防抖处理文档变化
	 */
	private debouncedProcessDocumentChange = debounce(
		(editor: Editor, markdownView: MarkdownView) => {
			this.processDocumentChange(editor, markdownView);
		},
		1000, // 1秒延迟
		true // 在延迟开始时执行
	);

	/**
	 * 处理文档变化
	 * @param editor 编辑器
	 * @param markdownView Markdown视图
	 */
	private processDocumentChange(editor: Editor, _markdownView: MarkdownView) {
		if (this.settings.debugMode) {
			console.log('处理文档变化');
		}

		// 获取编辑器内容
		const text = editor.getValue();
		const lines = text.split('\n');

		// 查找所有bazi代码块
		let inCodeBlock = false;
		let startLine = -1;
		let blockLanguage = '';
		let baziSource = '';

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (line.startsWith('```') && !inCodeBlock) {
				inCodeBlock = true;
				startLine = i;
				blockLanguage = line.substring(3).trim();
			} else if (line.startsWith('```') && inCodeBlock) {
				inCodeBlock = false;

				// 如果是bazi代码块，处理它
				if (blockLanguage === 'bazi') {
					// 获取代码块内容
					let blockContent = '';
					for (let j = startLine + 1; j < i; j++) {
						blockContent += lines[j] + (j < i - 1 ? '\n' : '');
					}

					// 如果代码块内容有变化，更新渲染
					if (blockContent !== baziSource) {
						baziSource = blockContent;

						if (this.settings.debugMode) {
							console.log('bazi代码块内容已变化，更新渲染');
							console.log('代码块内容:', blockContent);
						}

						// 延迟更新渲染，确保编辑器已经完成更新
						setTimeout(() => {
							// 触发重新渲染
							this.app.workspace.trigger('layout-change');

							if (this.settings.debugMode) {
								console.log('已触发layout-change事件，重新渲染页面');
							}
						}, this.settings.codeBlockUpdateDelay);
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

		new Setting(containerEl)
			.setName('默认性别')
			.setDesc('选择默认性别，用于大运计算')
			.addDropdown(dropdown => {
				dropdown
					.addOption('1', '男')
					.addOption('0', '女')
					.setValue(this.plugin.settings.defaultGender)
					.onChange(async (value) => {
						this.plugin.settings.defaultGender = value;
						await this.plugin.saveSettings();
					});
			});

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

		containerEl.createEl('h3', {text: '使用说明'});

		const usageList = containerEl.createEl('ul');
		usageList.createEl('li', {text: '点击左侧栏的八字命盘图标或使用命令面板中的"输入时间转八字"命令可以打开日期选择模态框'});
		usageList.createEl('li', {text: '使用命令面板中的"在当前位置插入八字信息"命令可以在光标位置插入八字命盘'});
		usageList.createEl('li', {text: '使用命令面板中的"插入交互式八字命盘"命令可以在光标位置插入交互式八字命盘'});
		usageList.createEl('li', {text: '在交互式八字命盘中，点击右上角的设置图标可以调整参数'});
		usageList.createEl('li', {text: '选中八字文本后，使用命令面板中的"解析选中的八字"命令可以解析八字并生成详细信息'});

		containerEl.createEl('h3', {text: '代码块用法'});

		containerEl.createEl('p', {
			text: '使用公历日期：'
		});
		const codeExample = containerEl.createEl('pre');
		codeExample.createEl('code', {
			text: '```bazi\ndate: 1986-05-29 12:00\n```'
		});

		containerEl.createEl('p', {
			text: '使用农历日期：'
		});
		const codeExample3 = containerEl.createEl('pre');
		codeExample3.createEl('code', {
			text: '```bazi\nlunar: 1986-4-21 12:00\nleap: false\n```'
		});

		containerEl.createEl('p', {
			text: '使用当前时间：'
		});
		const codeExample4 = containerEl.createEl('pre');
		codeExample4.createEl('code', {
			text: '```bazi\nnow: true\n```'
		});

		containerEl.createEl('p', {
			text: '直接使用八字：'
		});
		const codeExample2 = containerEl.createEl('pre');
		codeExample2.createEl('code', {
			text: '```bazi\nbazi: 甲子 乙丑 丙寅 丁卯\n```'
		});

		containerEl.createEl('h3', {text: '高级选项'});

		containerEl.createEl('p', {
			text: '您可以添加以下选项来自定义显示：'
		});
		const codeExample5 = containerEl.createEl('pre');
		codeExample5.createEl('code', {
			text: '```bazi\ndate: 1986-05-29 12:00\ntitle: 我的八字命盘\nshowWuxing: true\nshowSpecialInfo: true\ntheme: colorful\n```'
		});

		containerEl.createEl('p', {
			text: '主题选项：默认、dark（暗色）、light（亮色）、colorful（彩色）'
		});
	}
}