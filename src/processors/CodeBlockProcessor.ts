import { MarkdownView, Notice } from 'obsidian';
import { BaziParams } from '../types/PluginTypes';
import { BaziService } from '../services/BaziService';
import { InteractiveBaziView } from '../ui/InteractiveBaziView';
import type BaziPlugin from '../main';

/**
 * 代码块处理器
 * 负责处理 bazi 代码块的渲染
 */
export class CodeBlockProcessor {
	private plugin: BaziPlugin;

	constructor(plugin: BaziPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 注册代码块处理器
	 */
	register(): void {
		console.log('📝 注册bazi代码块处理器');
		this.plugin.registerMarkdownCodeBlockProcessor('bazi', (source, el, _ctx) => {
			console.log('🎯 bazi代码块被触发!');
			this.processBaziCodeBlock(source, el);
		});
	}

	/**
	 * 处理八字代码块
	 */
	private processBaziCodeBlock(source: string, el: HTMLElement): void {
		console.log('🔍 处理八字代码块开始');
		console.log('📝 源代码内容:', source);

		// 解析代码块内容
		const params: BaziParams = this.parseCodeBlockParams(source);
		console.log('⚙️ 解析后的参数:', params);

		// 添加神煞显示设置
		if (this.plugin.settings.showShenSha) {
			params['showshensha_sizhu'] = this.plugin.settings.showShenSha.siZhu.toString();
			params['showshensha_dayun'] = this.plugin.settings.showShenSha.daYun.toString();
			params['showshensha_liunian'] = this.plugin.settings.showShenSha.liuNian.toString();
			params['showshensha_xiaoyun'] = this.plugin.settings.showShenSha.xiaoYun.toString();
			params['showshensha_liuyue'] = this.plugin.settings.showShenSha.liuYue.toString();
		}

		// 检查是否有日期参数
		if (params.date) {
			this.processDateBasedBazi(params, source, el);
		} else if (params.bazi) {
			this.processBaziStringBased(params, source, el);
		} else if (params.lunar) {
			this.processLunarDateBased(params, source, el);
		} else if (params.now) {
			this.processCurrentTimeBazi(params, source, el);
		} else {
			// 显示错误信息
			el.createEl('div', {
				text: '错误：请提供 date、bazi、lunar 或 now 参数',
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 解析代码块参数
	 */
	private parseCodeBlockParams(source: string): BaziParams {
		const params: BaziParams = {};

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

		return params;
	}

	/**
	 * 处理基于日期的八字
	 */
	private processDateBasedBazi(params: BaziParams, source: string, el: HTMLElement): void {
		try {
			console.log('📅 开始处理日期:', params.date);

			// 解析日期
			const dateTime = params.date!.trim().split(' ');
			console.log('📅 分割后的日期时间:', dateTime);

			const dateParts = dateTime[0].split('-').map(Number);
			const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];

			console.log('📅 日期部分:', dateParts);
			console.log('📅 时间部分:', timeParts);

			const year = dateParts[0];
			const month = dateParts[1];
			const day = dateParts[2];
			const hour = timeParts[0];

			console.log('📅 解析结果:', {year, month, day, hour});

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
			console.log('🔍 性别参数处理结果:', gender);

			// 获取八字信息
			console.log('📊 调用BaziService.getBaziFromDate，参数:', {year, month, day, hour, gender, sect: this.plugin.settings.baziSect});
			const baziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.plugin.settings.baziSect);
			console.log('📊 BaziService返回结果:', baziInfo);

			// 生成唯一ID
			const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
			// 为代码块添加唯一标识符
			const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);

			// 添加源代码属性和唯一标识符，用于编辑时恢复和准确更新
			// 清理source中的特殊字符，确保选择器有效
			const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
			el.setAttribute('data-bazi-source', cleanSource);
			el.setAttribute('data-bazi-block-id', blockId);

			// 检查性别参数
			console.log('🔍 检查性别参数:', params.gender);
			console.log('🔍 检查baziInfo.gender:', baziInfo.gender);

			// 先渲染八字命盘
			console.log('🎨 开始渲染八字命盘');
			this.renderBaziChart(el, baziInfo, params);

			// 检查是否需要显示性别选择界面
			if (this.shouldShowGenderSelection(params)) {
				console.log('✨ 需要显示性别选择界面');
				this.addGenderSelection(el, source, '日期');
			} else {
				console.log('✅ 不需要显示性别选择界面，参数:', params.gender);
			}

		} catch (error) {
			console.error('❌ 解析日期时出错:', error);
			console.error('❌ 错误堆栈:', error.stack);
			console.error('❌ 原始参数:', params);
			el.createEl('div', {
				text: `错误：无法解析日期 "${params.date}" - ${error.message}`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 处理基于八字字符串的八字
	 */
	private processBaziStringBased(params: BaziParams, source: string, el: HTMLElement): void {
		try {
			console.log('🎴 开始处理八字字符串:', params.bazi);

			// 解析八字字符串
			const baziInfo = BaziService.parseBaziString(params.bazi!, params.year);
			console.log('🎴 八字解析结果:', baziInfo);

			// 生成唯一ID
			const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);
			const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
			el.setAttribute('data-bazi-source', cleanSource);
			el.setAttribute('data-bazi-block-id', blockId);

			// 处理性别参数
			if (params.gender) {
				// 设置性别
				const genderValue = params.gender.trim().toLowerCase();
				if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
					baziInfo.gender = '1';
				} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
					baziInfo.gender = '0';
				}
				console.log('🎴 已设置性别:', baziInfo.gender);
			}

			// 先渲染八字命盘
			console.log('🎨 开始渲染八字命盘');
			this.renderBaziChart(el, baziInfo, params);

			// 检查是否需要显示年份选择栏
			if (!params.year && baziInfo.matchingYears && baziInfo.matchingYears.length > 1) {
				console.log('✨ 没有年份参数且有多个匹配年份，显示年份选择界面');
				console.log('🎴 匹配年份列表:', baziInfo.matchingYears);
				this.addYearSelection(el, source, baziInfo.matchingYears);
			} else if (params.year) {
				console.log('✅ 已有年份参数:', params.year);
			} else {
				console.log('ℹ️ 无需年份选择（只有一个匹配年份或无匹配年份）');
			}

			// 检查是否需要显示性别选择界面
			if (this.shouldShowGenderSelection(params)) {
				console.log('✨ 需要显示性别选择界面');
				this.addGenderSelection(el, source, '八字');
			} else {
				console.log('✅ 不需要显示性别选择界面，参数:', params.gender);
			}

		} catch (error) {
			console.error('❌ 解析八字时出错:', error);
			console.error('❌ 错误堆栈:', error.stack);
			console.error('❌ 原始参数:', params);
			el.createEl('div', {
				text: `错误：无法解析八字 "${params.bazi}" - ${error.message}`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 处理基于农历日期的八字
	 */
	private processLunarDateBased(params: BaziParams, source: string, el: HTMLElement): void {
		try {
			console.log('🌙 开始处理农历日期:', params.lunar);

			// 解析农历日期
			const dateTime = params.lunar!.trim().split(' ');
			const dateParts = dateTime[0].split('-').map(Number);
			const timeParts = dateTime.length > 1 ? dateTime[1].split(':').map(Number) : [0, 0];

			const year = dateParts[0];
			const month = dateParts[1];
			const day = dateParts[2];
			const hour = timeParts[0];

			console.log('🌙 农历日期解析结果:', {year, month, day, hour});

			// 获取性别参数，不使用默认值
			let gender = '';
			if (params.gender) {
				const genderValue = params.gender.trim().toLowerCase();
				if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
					gender = '1';
				} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
					gender = '0';
				}
			}
			console.log('🌙 性别参数处理结果:', gender);

			// 获取八字信息（使用农历日期）
			const baziInfo = BaziService.getBaziFromLunarDate(year, month, day, hour, false, gender, this.plugin.settings.baziSect);
			console.log('🌙 农历八字结果:', baziInfo);

			// 生成唯一ID
			const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);
			const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
			el.setAttribute('data-bazi-source', cleanSource);
			el.setAttribute('data-bazi-block-id', blockId);

			// 先渲染八字命盘
			console.log('🎨 开始渲染农历八字命盘');
			this.renderBaziChart(el, baziInfo, params);

			// 检查是否需要显示性别选择界面
			if (this.shouldShowGenderSelection(params)) {
				console.log('✨ 需要显示性别选择界面');
				this.addGenderSelection(el, source, '农历');
			} else {
				console.log('✅ 不需要显示性别选择界面，参数:', params.gender);
			}

		} catch (error) {
			console.error('❌ 解析农历日期时出错:', error);
			console.error('❌ 错误堆栈:', error.stack);
			console.error('❌ 原始参数:', params);
			el.createEl('div', {
				text: `错误：无法解析农历日期 "${params.lunar}" - ${error.message}`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 处理当前时间八字
	 */
	private processCurrentTimeBazi(params: BaziParams, source: string, el: HTMLElement): void {
		try {
			console.log('⏰ 开始处理当前时间八字');

			// 获取当前时间
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1; // JavaScript月份从0开始
			const day = now.getDate();
			const hour = now.getHours();

			console.log('⏰ 当前时间:', {year, month, day, hour});

			// 获取性别参数，不使用默认值
			let gender = '';
			if (params.gender) {
				const genderValue = params.gender.trim().toLowerCase();
				if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
					gender = '1';
				} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
					gender = '0';
				}
			}
			console.log('⏰ 性别参数处理结果:', gender);

			// 获取八字信息
			const baziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.plugin.settings.baziSect);
			console.log('⏰ 当前时间八字结果:', baziInfo);

			// 生成唯一ID
			const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);
			const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
			el.setAttribute('data-bazi-source', cleanSource);
			el.setAttribute('data-bazi-block-id', blockId);

			// 先渲染八字命盘
			console.log('🎨 开始渲染当前时间八字命盘');
			this.renderBaziChart(el, baziInfo, params);

			// 检查是否需要显示性别选择界面
			if (this.shouldShowGenderSelection(params)) {
				console.log('✨ 需要显示性别选择界面');
				this.addGenderSelection(el, source, '当前时间');
			} else {
				console.log('✅ 不需要显示性别选择界面，参数:', params.gender);
			}

		} catch (error) {
			console.error('❌ 处理当前时间八字时出错:', error);
			console.error('❌ 错误堆栈:', error.stack);
			console.error('❌ 原始参数:', params);
			el.createEl('div', {
				text: `错误：无法处理当前时间八字 - ${error.message}`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 检查是否需要显示性别选择栏
	 */
	private shouldShowGenderSelection(params: BaziParams): boolean {
		// 如果没有性别参数，需要显示性别选择栏
		if (!params.gender) {
			return true;
		}

		// 如果性别参数是 'no'，不显示性别选择栏
		const genderValue = params.gender.trim().toLowerCase();
		if (genderValue === 'no' || genderValue === 'none' || genderValue === '无') {
			console.log('⏰ 性别参数设置为不需要，跳过性别选择');
			return false;
		}

		// 如果已经设置了具体的性别值，不显示性别选择栏
		if (genderValue === '男' || genderValue === 'male' || genderValue === '1' ||
			genderValue === '女' || genderValue === 'female' || genderValue === '0') {
			return false;
		}

		// 其他情况显示性别选择栏
		return true;
	}

	/**
	 * 添加性别选择界面
	 */
	private addGenderSelection(el: HTMLElement, source: string, type: string): void {
		console.log('🎯 开始添加性别选择界面');
		console.log('📦 容器元素:', el);
		console.log('📄 源代码:', source);
		console.log('🏷️ 类型:', type);

		// 检查是否已经存在性别选择容器，避免重复添加
		const existingContainer = el.querySelector('.bazi-gender-container');
		if (existingContainer) {
			console.log('⚠️ 性别选择容器已存在，跳过添加');
			return;
		}

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
			this.updateCodeBlockWithGender(el, source, '男');
		});
		femaleButton.addEventListener('click', () => {
			this.updateCodeBlockWithGender(el, source, '女');
		});
	}

	/**
	 * 更新代码块添加性别参数
	 */
	private updateCodeBlockWithGender(el: HTMLElement, source: string, genderLabel: string): void {
		console.log('🔄 开始更新代码块，添加性别参数');
		console.log('🔄 容器元素:', el);
		console.log('🔄 源代码:', source);
		console.log('🔄 性别标签:', genderLabel);

		// 获取代码块的唯一标识符
		const blockId = el.getAttribute('data-bazi-block-id');
		console.log('🔄 代码块ID:', blockId);

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
		const newSource = cleanedSource + `gender: ${genderLabel}\n`;
		console.log('🔄 新的源代码:', newSource);

		// 使用精确的代码块更新方法
		this.updateSpecificCodeBlock(el, newSource);
		new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
	}

	/**
	 * 精确更新特定的代码块
	 */
	private updateSpecificCodeBlock(el: HTMLElement, newSource: string): void {
		try {
			console.log('🎯 开始精确更新代码块');

			const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				console.log('❌ 无法获取活动的编辑器视图');
				new Notice('更新代码块失败：无法获取活动的编辑器视图', 3000);
				return;
			}

			const editor = activeView.editor;
			if (!editor) {
				console.log('❌ 无法获取编辑器实例');
				new Notice('更新代码块失败：无法获取编辑器实例', 3000);
				return;
			}

			// 获取代码块的源代码属性
			const originalSource = el.getAttribute('data-bazi-source');
			const blockId = el.getAttribute('data-bazi-block-id');
			console.log('🎯 原始源代码:', originalSource);
			console.log('🎯 代码块ID:', blockId);

			// 获取文档内容
			const text = editor.getValue();
			const lines = text.split('\n');

			// 查找匹配的代码块
			let inCodeBlock = false;
			let startLine = -1;
			let endLine = -1;
			let blockLanguage = '';
			let foundTargetBlock = false;

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
						// 收集代码块内容
						let blockContent = '';
						for (let j = startLine + 1; j < endLine; j++) {
							blockContent += lines[j] + (j < endLine - 1 ? '\n' : '');
						}

						// 清理内容进行比较
						const cleanBlockContent = blockContent.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
						console.log('🎯 找到代码块内容:', cleanBlockContent);
						console.log('🎯 比较目标内容:', originalSource);

						// 比较内容是否匹配
						if (cleanBlockContent === originalSource) {
							foundTargetBlock = true;
							console.log('🎯 找到目标代码块，行范围:', startLine, '-', endLine);
							break;
						}
					}
				}
			}

			if (foundTargetBlock) {
				// 使用文件API更新文件内容
				const file = this.plugin.app.workspace.getActiveFile();
				if (file) {
					// 读取文件内容
					this.plugin.app.vault.read(file).then(content => {
						// 将内容分割成行
						const fileLines = content.split('\n');

						// 检测原始代码块的缩进
						let indentation = '';
						if (startLine + 1 < fileLines.length) {
							const firstLine = fileLines[startLine + 1];
							const match = firstLine.match(/^(\s+)/);
							if (match) {
								indentation = match[1];
							}
						}

						// 应用缩进到每一行
						const trimmedSource = newSource.trim();
						const indentedSource = trimmedSource
							.split('\n')
							.map(line => line.trim() ? indentation + line : line)
							.join('\n');

						// 替换代码块
						const beforeBlock = fileLines.slice(0, startLine).join('\n');
						const afterBlock = fileLines.slice(endLine + 1).join('\n');
						const newBlock = '```bazi\n' + indentedSource + '\n```';

						// 构建新的文件内容
						const newContent = beforeBlock + (beforeBlock ? '\n' : '') + newBlock + (afterBlock ? '\n' : '') + afterBlock;

						// 更新文件内容
						this.plugin.app.vault.modify(file, newContent);
						console.log('✅ 代码块更新成功');
					});
				}
			} else {
				console.log('❌ 未找到目标代码块');
				new Notice('更新代码块失败：未找到目标代码块', 3000);
			}
		} catch (error) {
			console.error('❌ 精确更新代码块时出错:', error);
			new Notice('更新代码块时出错: ' + error.message, 5000);
		}
	}

	/**
	 * 渲染八字命盘
	 */
	private renderBaziChart(el: HTMLElement, baziInfo: any, params: BaziParams): void {
		// 生成唯一ID
		const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);

		// 使用交互式视图渲染八字命盘
		const interactiveView = new InteractiveBaziView(
			el,
			baziInfo,
			id
		);
	}

	/**
	 * 添加年份选择界面
	 */
	private addYearSelection(el: HTMLElement, source: string, matchingYears: number[]): void {
		console.log('📅 开始添加年份选择界面');
		console.log('📦 容器元素:', el);
		console.log('📄 源代码:', source);
		console.log('📅 匹配年份:', matchingYears);

		// 检查是否已经存在年份选择容器，避免重复添加
		const existingContainer = el.querySelector('.bazi-year-container');
		if (existingContainer) {
			console.log('⚠️ 年份选择容器已存在，跳过添加');
			return;
		}

		// 创建年份选择容器，添加到视图顶部
		const yearContainer = document.createElement('div');
		yearContainer.className = 'bazi-year-container';
		yearContainer.setAttribute('style', 'background-color: rgba(255, 255, 0, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; z-index: 10; position: relative; width: 100%; box-sizing: border-box;');
		el.prepend(yearContainer);

		yearContainer.createDiv({
			text: '请选择年份：',
			attr: { 'style': 'margin-bottom: 5px;' }
		});

		// 创建年份按钮容器
		const yearButtonsContainer = yearContainer.createDiv({
			attr: { 'style': 'display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; max-height: 200px; overflow-y: auto;' }
		});

		// 显示所有年份，使用lunar-typescript库提供的完整年份列表
		console.log('📅 显示所有匹配年份，共', matchingYears.length, '个');

		// 创建年份按钮 - 显示所有年份
		matchingYears.forEach(year => {
			const yearButton = yearButtonsContainer.createEl('button', {
				text: year.toString(),
				attr: { 'style': 'padding: 4px 8px; cursor: pointer; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; margin: 1px; font-size: 0.85em;' }
			});

			// 为年份按钮添加事件监听器
			yearButton.addEventListener('click', () => {
				this.updateCodeBlockWithYear(el, source, year);
			});
		});

		// 显示年份统计信息
		const yearInfo = yearContainer.createDiv({
			text: `共找到 ${matchingYears.length} 个匹配年份（基于lunar-typescript库反推）`,
			attr: { 'style': 'font-size: 0.75em; color: #666; margin-top: 5px; text-align: center;' }
		});
	}

	/**
	 * 更新代码块添加年份参数
	 */
	private updateCodeBlockWithYear(el: HTMLElement, source: string, year: number): void {
		console.log('📅 开始更新代码块，添加年份参数');
		console.log('📅 容器元素:', el);
		console.log('📅 源代码:', source);
		console.log('📅 年份:', year);

		// 获取代码块的唯一标识符
		const blockId = el.getAttribute('data-bazi-block-id');
		console.log('📅 代码块ID:', blockId);

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
		console.log('📅 新的源代码:', newSource);

		// 使用精确的代码块更新方法
		this.updateSpecificCodeBlock(el, newSource);
		new Notice(`已选择年份 ${year} 并更新代码块`);
	}
}
