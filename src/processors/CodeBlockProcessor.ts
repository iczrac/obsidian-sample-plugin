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
		this.plugin.registerMarkdownCodeBlockProcessor('bazi', (source, el, _ctx) => {
			this.processBaziCodeBlock(source, el);
		});
	}

	/**
	 * 处理八字代码块
	 */
	private processBaziCodeBlock(source: string, el: HTMLElement): void {
		// 解析代码块内容
		const params: BaziParams = this.parseCodeBlockParams(source);

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
			// 解析日期
			const dateTime = params.date!.trim().split(' ');
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
			const baziInfo = BaziService.getBaziFromDate(year, month, day, hour, gender, this.plugin.settings.baziSect);

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
				this.addGenderSelection(el, source, '日期');
			} else {
				// 渲染八字命盘
				this.renderBaziChart(el, baziInfo, params);
			}

		} catch (error) {
			console.error('解析日期时出错:', error);
			el.createEl('div', {
				text: `错误：无法解析日期 "${params.date}"`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 处理基于八字字符串的八字
	 */
	private processBaziStringBased(params: BaziParams, source: string, el: HTMLElement): void {
		try {
			// 解析八字字符串
			const baziInfo = BaziService.parseBaziString(params.bazi!, params.year);

			// 生成唯一ID
			const blockId = 'bazi-block-' + Math.random().toString(36).substring(2, 9);
			const cleanSource = source.replace(/[\n\r"']/g, '').replace(/\s+/g, ' ').trim();
			el.setAttribute('data-bazi-source', cleanSource);
			el.setAttribute('data-bazi-block-id', blockId);

			// 如果没有指定性别，显示性别选择界面
			if (!params.gender) {
				this.addGenderSelection(el, source, '八字');
			} else {
				// 设置性别
				const genderValue = params.gender.trim().toLowerCase();
				if (genderValue === '男' || genderValue === 'male' || genderValue === '1') {
					baziInfo.gender = '1';
				} else if (genderValue === '女' || genderValue === 'female' || genderValue === '0') {
					baziInfo.gender = '0';
				}

				// 渲染八字命盘
				this.renderBaziChart(el, baziInfo, params);
			}

		} catch (error) {
			console.error('解析八字时出错:', error);
			el.createEl('div', {
				text: `错误：无法解析八字 "${params.bazi}"`,
				attr: { style: 'color: red; padding: 10px; border: 1px solid red; border-radius: 5px;' }
			});
		}
	}

	/**
	 * 处理基于农历日期的八字
	 */
	private processLunarDateBased(params: BaziParams, source: string, el: HTMLElement): void {
		// TODO: 实现农历日期处理
		el.createEl('div', {
			text: '农历日期功能正在开发中...',
			attr: { style: 'color: orange; padding: 10px; border: 1px solid orange; border-radius: 5px;' }
		});
	}

	/**
	 * 处理当前时间八字
	 */
	private processCurrentTimeBazi(params: BaziParams, source: string, el: HTMLElement): void {
		// TODO: 实现当前时间处理
		el.createEl('div', {
			text: '当前时间功能正在开发中...',
			attr: { style: 'color: orange; padding: 10px; border: 1px solid orange; border-radius: 5px;' }
		});
	}

	/**
	 * 添加性别选择界面
	 */
	private addGenderSelection(el: HTMLElement, source: string, type: string): void {
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
				this.updateCodeBlockWithGender(source, '男');
			});
			femaleButton.addEventListener('click', () => {
				this.updateCodeBlockWithGender(source, '女');
			});
		}, 100);
	}

	/**
	 * 更新代码块添加性别参数
	 */
	private updateCodeBlockWithGender(source: string, genderLabel: string): void {
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

		this.plugin.updateCodeBlockWithFileAPI(newSource);
		new Notice(`已选择性别 ${genderLabel} 并更新代码块`);
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
}
