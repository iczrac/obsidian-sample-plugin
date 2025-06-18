import { BaziInfo } from '../types/BaziInfo';
import { ExtendedColumnType } from '../types/PluginTypes';
import { BaziTableManager } from './components/interactive/BaziTableManager';
import { ExtendedColumnManager } from './components/interactive/ExtendedColumnManager';
import { HorizontalSelectorManager } from './components/interactive/HorizontalSelectorManager';
import { ModalManager } from './components/interactive/ModalManager';
import { StyleAndUtilsManager } from './components/interactive/StyleAndUtilsManager';
import { DaYunTableManager } from './components/DaYunTableManager';

import { LiuYueTableManager } from './components/LiuYueTableManager';
import { StyleUtilsService } from '../services/bazi/StyleUtilsService';
import { DataGenerationService } from '../services/bazi/DataGenerationService';
import { InteractionManager } from './components/interactive/InteractionManager';
import { SectionRenderManager } from './components/interactive/SectionRenderManager';
import { MarkdownView, Notice } from 'obsidian';

/**
 * 交互式八字命盘视图
 * 重构后的模块化架构，将原来的7000行大文件拆分成多个功能组件
 */
export class InteractiveBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;
  private plugin: any;

  // 功能组件管理器
  private baziTableManager: BaziTableManager;
  private extendedColumnManager: ExtendedColumnManager;
  private horizontalSelectorManager: HorizontalSelectorManager;
  private modalManager: ModalManager;
  private styleAndUtilsManager: StyleAndUtilsManager;
  private daYunTableManager: DaYunTableManager;

  private liuYueTableManager: LiuYueTableManager;
  private interactionManager: InteractionManager;
  private sectionRenderManager: SectionRenderManager;

  // 表格元素引用
  private baziTable: HTMLTableElement | null = null;
  private daYunTable: HTMLElement | null = null;

  private xiaoYunTable: HTMLElement | null = null;
  private liuYueTable: HTMLElement | null = null;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;
    this.plugin = plugin;

    // 在容器元素上存储实例引用，以便设置页面可以找到并更新
    (this.container as any).__baziViewInstance = this;

    console.log('🎯 InteractiveBaziView构造函数开始');
    console.log('🎯 接收到的baziInfo.showShenSha:', this.baziInfo.showShenSha);

    // 设置默认的神煞显示设置
    if (!this.baziInfo.showShenSha) {
      this.baziInfo.showShenSha = {
        siZhu: true,
        daYun: true,
        liuNian: true,
        xiaoYun: true,
        liuYue: true
      };
      console.log('🎯 使用默认神煞显示设置:', this.baziInfo.showShenSha);
    } else {
      console.log('🎯 使用传递的神煞显示设置:', this.baziInfo.showShenSha);
    }

    // 初始化功能组件
    this.initializeComponents();

    // 初始化视图
    this.initView();
  }

  /**
   * 初始化功能组件
   */
  private initializeComponents() {
    // 初始化八字表格管理器
    this.baziTableManager = new BaziTableManager(this.container, this.baziInfo);

    // 初始化扩展列管理器
    this.extendedColumnManager = new ExtendedColumnManager(this.baziInfo);

    // 初始化横向选择器管理器
    this.horizontalSelectorManager = new HorizontalSelectorManager(this.container, this.baziInfo);

    // 初始化模态框管理器
    this.modalManager = new ModalManager(this.container, this.baziInfo);

    // 初始化样式和工具管理器
    this.styleAndUtilsManager = new StyleAndUtilsManager(this.container, this.plugin);

    // 初始化大运表格管理器
    // 暂时注释掉，因为DaYunTableManager需要ExtendedTableManager而不是ExtendedColumnManager
    // 我们将在createDaYunInfo中直接创建大运表格
    // this.daYunTableManager = new DaYunTableManager(
    //   this.baziInfo,
    //   this.extendedColumnManager,
    //   (index: number) => this.handleDaYunSelect(index)
    // );

    // 初始化区域渲染管理器
    this.sectionRenderManager = new SectionRenderManager(
      this.container,
      this.baziInfo,
      this.plugin
    );



    // 初始化流月表格管理器
    this.liuYueTableManager = new LiuYueTableManager(
      this.container, // 临时容器，实际使用时会传入正确的容器
      this.baziInfo,
      (liuyue) => this.handleLiuYueSelect(liuyue)
    );

    // 初始化交互管理器
    this.interactionManager = new InteractionManager(
      this.container,
      this.baziInfo,
      this.modalManager,
      this.styleAndUtilsManager,
      this.extendedColumnManager,
      this.horizontalSelectorManager
    );

    console.log('✅ 所有功能组件初始化完成');
  }

  /**
   * 初始化视图
   */
  private initView() {
    // 清空容器
    this.container.empty();
    this.container.addClass('interactive-bazi-view');
    this.container.setAttribute('id', this.id);

    // 重置扩展状态
    this.resetExtendedState();

    // 创建视图组件
    this.createHeader();
    this.createBasicInfo();
    this.createBaziTable();
    this.sectionRenderManager.createSpecialInfo();
    this.createDaYunInfo();
    this.createLiuNianInfo();
    this.createLiuYueInfo();
    this.createLiuRiInfo();
    this.createLiuShiInfo();

    // 初始化交互管理器
    this.interactionManager.initialize();

    // 设置事件监听器
    this.setupEventListeners();

    // 不再默认选中第一个大运，让扩展列功能来控制
    // 只有在有扩展配置时才会选择大运
    console.log('ℹ️ 跳过默认大运选择，由扩展列功能控制');

    console.log('✅ 视图初始化完成');
  }

  /**
   * 重置扩展状态
   */
  private resetExtendedState() {
    // 重置扩展列管理器状态
    this.extendedColumnManager.setSelectedDaYunIndex(0);
    this.extendedColumnManager.setSelectedLiuNianYear(0);
    this.extendedColumnManager.setCurrentSelectedLiuYue(null);
    this.extendedColumnManager.setCurrentSelectedLiuRi(null);
    this.extendedColumnManager.setCurrentSelectedLiuShi(null);
  }

  /**
   * 创建头部
   */
  private createHeader() {
    const header = this.container.createDiv({ cls: 'bazi-view-header interactive' });

    // 创建标题
    header.createEl('h4', { text: '八字命盘', cls: 'bazi-view-title interactive' });

    // 如果有plugin，创建按钮
    if (this.plugin) {
      // 创建按钮容器
      const buttonContainer = header.createDiv({ cls: 'bazi-view-header-buttons' });

      // 创建样式切换按钮
      const styleButton = buttonContainer.createEl('button', {
        cls: 'bazi-view-style-button',
        attr: { 'data-bazi-id': this.id, 'aria-label': '切换样式' }
      });
      styleButton.innerHTML = '🎨';

      // 创建设置按钮
      const settingsButton = buttonContainer.createEl('button', {
        cls: 'bazi-view-settings-button',
        attr: { 'data-bazi-id': this.id, 'aria-label': '设置' }
      });
      settingsButton.innerHTML = '⚙️';

      // 添加样式切换按钮点击事件
      styleButton.addEventListener('click', () => {
        this.switchStyle();
      });

      // 添加设置按钮点击事件
      settingsButton.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }
  }

  /**
   * 创建基本信息 - 与样式1、样式2保持一致
   */
  private createBasicInfo() {
    const basicInfoDiv = this.container.createDiv({ cls: 'bazi-basic-info interactive' });

    if (this.baziInfo.solarDate) {
      basicInfoDiv.createSpan({
        text: `公历: ${this.baziInfo.solarDate} ${this.baziInfo.solarTime || ''}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.lunarDate) {
      basicInfoDiv.createSpan({
        text: `农历: ${this.baziInfo.lunarDate}`,
        cls: 'bazi-basic-info-item'
      });
    }

    if (this.baziInfo.gender) {
      basicInfoDiv.createSpan({
        text: `性别: ${this.baziInfo.gender === '1' ? '男' : '女'}`,
        cls: 'bazi-basic-info-item'
      });
    }
  }

  /**
   * 创建八字表格
   */
  private createBaziTable() {
    this.baziTable = this.baziTableManager.createBaziTable();

    // 设置扩展列管理器的表格引用
    this.extendedColumnManager.setBaziTable(this.baziTable);

    // 检查是否需要自动扩展
    this.handleAutoExtension();

    console.log('✅ 八字表格创建完成');
  }

  /**
   * 处理自动扩展功能
   */
  private handleAutoExtension() {
    // 检查baziInfo中是否有扩展列配置
    const extendType = (this.baziInfo as any).extendColumnType;
    const extendTarget = (this.baziInfo as any).extendTarget;

    if (extendType && extendType !== ExtendedColumnType.NONE) {
      console.log(`🚀 检测到自动扩展配置: ${extendType}`);

      // 延迟执行自动扩展，确保表格已完全渲染
      setTimeout(() => {
        this.extendedColumnManager.autoExtendByType(extendType, extendTarget);
      }, 100);
    }
  }



  /**
   * 创建大运信息
   */
  private createDaYunInfo() {
    // 使用SectionRenderManager创建大运区域
    this.sectionRenderManager.createDaYunInfo();

    // 获取大运表格容器
    this.daYunTable = this.sectionRenderManager.getContainer('dayun-table');

    // 创建简化的大运表格
    if (this.daYunTable && this.baziInfo.daYun && this.baziInfo.daYun.length > 0) {
      this.createSimpleDaYunTable();
    }

    console.log('✅ 大运信息创建完成');
  }

  /**
   * 创建简化的大运表格
   */
  private createSimpleDaYunTable() {
    if (!this.daYunTable || !this.baziInfo.daYun) return;

    // 清空容器
    this.daYunTable.empty();

    // 创建表格
    const table = this.daYunTable.createEl('table', { cls: 'bazi-view-table bazi-dayun-table' });

    // 创建干支行（最重要的行）
    const gzRow = table.createEl('tr');
    gzRow.createEl('th', { text: '大运' });

    const daYunData = Array.isArray(this.baziInfo.daYun) ? this.baziInfo.daYun : [];
    daYunData.slice(0, 10).forEach((dy, index) => {
      const cell = gzRow.createEl('td', {
        cls: 'bazi-dayun-cell',
        attr: { 'data-index': index.toString() }
      });

      // 显示干支
      if (dy.ganZhi) {
        StyleUtilsService.createGanZhiElement(cell, dy.ganZhi, 'ganzhi-display');
      } else {
        cell.textContent = '未知';
      }

      // 添加点击事件
      cell.addEventListener('click', () => {
        // 高亮选中的单元格
        table.querySelectorAll('.bazi-dayun-cell').forEach(c => {
          c.classList.remove('selected');
        });
        cell.classList.add('selected');

        // 处理大运选择
        this.handleDaYunSelect(index);
      });
    });

    // 创建年龄行
    const ageRow = table.createEl('tr');
    ageRow.createEl('th', { text: '年龄' });
    daYunData.slice(0, 10).forEach(dy => {
      ageRow.createEl('td', { text: `${dy.startAge}-${dy.endAge || dy.startAge + 9}` });
    });
  }

  /**
   * 创建流年信息
   */
  private createLiuNianInfo() {
    // 使用SectionRenderManager创建流年区域
    this.sectionRenderManager.createLiuNianInfo();

    console.log('✅ 流年信息创建完成');
  }



  /**
   * 创建流月信息
   */
  private createLiuYueInfo() {
    // 使用SectionRenderManager创建流月区域
    this.sectionRenderManager.createLiuYueInfo();

    console.log('✅ 流月信息创建完成');
  }

  /**
   * 创建流日信息
   */
  private createLiuRiInfo() {
    // 使用SectionRenderManager创建流日区域
    this.sectionRenderManager.createLiuRiInfo();

    console.log('✅ 流日信息创建完成');
  }

  /**
   * 创建流时信息
   */
  private createLiuShiInfo() {
    // 使用SectionRenderManager创建流时区域
    this.sectionRenderManager.createLiuShiInfo();

    console.log('✅ 流时信息创建完成');
  }



  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    const eventManager = this.interactionManager.getEventManager();

    // 监听大运选择事件
    eventManager.on('dayun:select', (index: number) => {
      this.handleDaYunSelect(index);
    });

    // 监听流年选择事件
    eventManager.on('liunian:select', (year: number) => {
      this.handleLiuNianSelect({ year });
    });

    // 监听流月选择事件
    eventManager.on('liuyue:select', (data: any) => {
      this.handleLiuYueSelect(data);
    });

    // 监听设置更新事件
    eventManager.on('settings:update', (settings: any) => {
      this.handleSettingsUpdate(settings);
    });

    // 监听神煞点击事件
    this.container.addEventListener('shensha-click', (e: CustomEvent) => {
      this.handleShenShaClick(e.detail.shenSha);
    });

    // 监听DOM事件 - 流年选择
    this.container.addEventListener('liunian-select', (event: CustomEvent) => {
      console.log(`🎯 收到流年选择事件: ${event.detail.year}`);
      console.log(`🎯 当前流月表格容器:`, this.liuYueTable);
      this.handleLiuNianSelect({ year: event.detail.year });
    });

    // 监听DOM事件 - 流月选择
    this.container.addEventListener('liuyue-select', (event: CustomEvent) => {
      console.log(`🎯 收到流月选择事件: ${event.detail.liuyue.month}月`);
      this.handleLiuYueSelect(event.detail.liuyue);
    });

    // 监听DOM事件 - 流日选择
    this.container.addEventListener('liuri-select', (event: CustomEvent) => {
      console.log(`🎯 收到流日选择事件: ${event.detail.liuri.day}日`);
      this.handleLiuRiSelect(event.detail.liuri);
    });

    // 监听DOM事件 - 流时选择
    this.container.addEventListener('liushi-select', (event: CustomEvent) => {
      console.log(`🎯 收到流时选择事件: ${event.detail.liushi.name}`);
      this.handleLiuShiSelect(event.detail.liushi);
    });

    console.log('✅ 事件监听器设置完成');
  }

  /**
   * 选择大运
   * @param index 大运索引
   */
  private selectDaYun(index: number) {
    if (!this.baziInfo.daYun || index >= this.baziInfo.daYun.length) {
      return;
    }

    console.log(`🎯 选择大运: ${index}`);

    // 更新扩展列管理器的选中大运
    this.extendedColumnManager.setSelectedDaYunIndex(index);

    // 扩展四柱表格到大运层级
    this.extendedColumnManager.extendBaziTableToLevel('dayun');

    // 通知SectionRenderManager更新流年信息
    this.sectionRenderManager.updateDaYunSelection(index);
  }

  /**
   * 处理大运选择（事件处理器）
   */
  private handleDaYunSelect(index: number) {
    console.log(`🎯 处理大运选择: 索引 ${index}`);
    this.selectDaYun(index);

    // 扩展四柱表格到大运层级
    this.extendedColumnManager.extendBaziTableToLevel('dayun');

    // 重置下级选择状态
    this.resetLowerLevelSelections('dayun');
  }



  /**
   * 打开设置模态框
   */
  private openSettingsModal(): void {
    console.log('⚙️ 打开设置模态框');

    // 导入BaziSettingsModal
    import('../ui/BaziSettingsModal').then(({ BaziSettingsModal }) => {
      // 获取当前日期信息
      const currentDate = {
        year: this.baziInfo.originalDate?.year || new Date().getFullYear(),
        month: this.baziInfo.originalDate?.month || new Date().getMonth() + 1,
        day: this.baziInfo.originalDate?.day || new Date().getDate(),
        time: this.baziInfo.originalDate?.time || new Date().getHours()
      };

      // 创建设置模态框
      const settingsModal = new BaziSettingsModal(
        (window as any).app, // 获取Obsidian app实例
        this.id,
        currentDate,
        (updatedBaziInfo: any) => {
          console.log('⚙️ 设置更新回调，更新八字信息:', updatedBaziInfo);
          this.updateBaziInfo(updatedBaziInfo);
        },
        this.baziInfo
      );

      settingsModal.open();
    }).catch(error => {
      console.error('加载设置模态框失败:', error);
    });
  }

  /**
   * 处理设置更新
   */
  private handleSettingsUpdate(settings: any) {
    // 更新八字信息的设置
    this.baziInfo.showShenSha = settings.showShenSha;

    // 重新初始化视图以应用新设置
    this.initView();

    console.log('✅ 设置已更新并应用');
  }

  /**
   * 切换样式 - 完全参考样式1和样式2的实现
   */
  private switchStyle() {
    if (!this.plugin) return;

    console.log('🎨 完整样式切换按钮点击');

    // 当前是样式3，切换到样式1
    const nextStyle = '1';
    console.log('从样式3切换到样式1');

    // 更新代码块
    this.updateCodeBlockWithStyle(nextStyle);
  }

  /**
   * 更新代码块的样式参数 - 完全参考样式1和样式2的实现
   */
  private updateCodeBlockWithStyle(newStyle: string) {
    try {
      console.log('🎨 开始更新代码块样式为:', newStyle);

      // 获取原始的完整源代码（从文件中读取，而不是使用压缩的属性）
      const originalSource = this.getOriginalSourceFromFile();
      if (!originalSource) {
        console.log('❌ 无法获取原始源代码');
        new Notice('更新样式失败：无法获取原始源代码', 3000);
        return;
      }

      console.log('🎨 原始完整源代码:', originalSource);

      // 使用与年份/性别选择完全相同的方法
      let cleanedSource = originalSource.trim();

      // 移除源代码末尾可能存在的反引号
      if (cleanedSource.endsWith('```')) {
        cleanedSource = cleanedSource.substring(0, cleanedSource.length - 3).trim();
      }

      // 检查是否已有style参数
      const hasStyleParam = cleanedSource.includes('style:');
      let newSource: string;

      if (hasStyleParam) {
        // 替换现有的style参数
        newSource = cleanedSource.replace(/style:\s*\d+/g, `style: ${newStyle}`);
      } else {
        // 确保源代码末尾有换行符
        if (!cleanedSource.endsWith('\n')) {
          cleanedSource += '\n';
        }
        // 添加新的style参数
        newSource = cleanedSource + `style: ${newStyle}\n`;
      }

      console.log('🎨 新的源代码:', newSource);

      // 使用与年份/性别选择相同的更新方法
      this.updateSpecificCodeBlock(newSource);

      // 显示通知
      const styleNames = { '1': '简洁样式', '2': '标准样式', '3': '完整样式' };
      new Notice(`已切换到${styleNames[newStyle as keyof typeof styleNames]}`);

    } catch (error) {
      console.error('❌ 更新样式时出错:', error);
      new Notice('更新样式时出错: ' + error.message, 5000);
    }
  }

  /**
   * 从文件中获取原始的完整源代码 - 完全参考样式1和样式2的实现
   */
  private getOriginalSourceFromFile(): string | null {
    try {
      const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        return null;
      }

      const editor = activeView.editor;
      if (!editor) {
        return null;
      }

      // 获取代码块的源代码属性用于匹配
      const compressedSource = this.container.getAttribute('data-bazi-source');
      if (!compressedSource) {
        return null;
      }

      // 获取文档内容
      const text = editor.getValue();
      const lines = text.split('\n');

      // 查找匹配的代码块
      let inCodeBlock = false;
      let startLine = -1;
      let endLine = -1;
      let blockLanguage = '';

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

            // 比较内容是否匹配
            if (cleanBlockContent === compressedSource) {
              console.log('🎯 找到匹配的代码块，返回完整源代码');
              return blockContent;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ 获取原始源代码时出错:', error);
      return null;
    }
  }

  /**
   * 精确更新特定的代码块 - 完全参考样式1和样式2的实现
   */
  private updateSpecificCodeBlock(newSource: string): void {
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
      const originalSource = this.container.getAttribute('data-bazi-source');
      const blockId = this.container.getAttribute('data-bazi-block-id');
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
          this.plugin.app.vault.read(file).then((content: string) => {
            const fileLines = content.split('\n');

            // 检测缩进
            let indentation = '';
            if (startLine + 1 < fileLines.length) {
              const firstLine = fileLines[startLine + 1];
              const match = firstLine.match(/^(\s+)/);
              if (match) {
                indentation = match[1];
              }
            }

            // 应用缩进
            const indentedSource = newSource
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
        new Notice('更新样式失败：未找到目标代码块', 3000);
      }
    } catch (error) {
      console.error('❌ 更新样式时出错:', error);
      new Notice('更新样式时出错: ' + error.message, 5000);
    }
  }

  /**
   * 更新八字信息
   * @param updatedBaziInfo 更新后的八字信息
   */
  updateBaziInfo(updatedBaziInfo: any): void {
    console.log('🎯 更新八字信息:', updatedBaziInfo);

    // 更新内部八字信息
    this.baziInfo = updatedBaziInfo;

    // 更新区域渲染管理器的八字信息
    this.sectionRenderManager.updateBaziInfo(updatedBaziInfo);

    // 重新渲染整个视图
    this.initView();
  }

  /**
   * 选择流日
   * @param year 年份
   * @param month 月份
   * @param day 日期
   */
  private selectLiuRi(year: number, month: number, day: number) {
    console.log(`🎯 选择流日: ${year}-${month}-${day}`);

    // 更新扩展列管理器的选中流日
    this.extendedColumnManager.setCurrentSelectedLiuRi({ year, month, day });

    // 扩展四柱表格到流日层级
    this.extendedColumnManager.extendBaziTableToLevel('liuri');
  }

  /**
   * 选择流时
   * @param liuShi 流时数据对象
   */
  private selectLiuShi(liuShi: any) {
    console.log(`🎯 选择流时: ${liuShi.year}-${liuShi.month}-${liuShi.day} ${liuShi.name} (${liuShi.ganZhi})`);

    // 更新扩展列管理器的选中流时（传递完整对象）
    this.extendedColumnManager.setCurrentSelectedLiuShi(liuShi);

    // 扩展四柱表格到流时层级
    this.extendedColumnManager.extendBaziTableToLevel('liushi');
  }

  /**
   * 处理神煞点击事件
   * @param shenSha 神煞名称
   */
  private handleShenShaClick(shenSha: string) {
    console.log(`🎯 处理神煞点击: ${shenSha}`);

    // 创建一个模拟的鼠标事件
    const mockEvent = new MouseEvent('click', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });

    // 使用模态框管理器显示神煞解释
    this.modalManager.showShenShaModal(shenSha, mockEvent);
  }

  /**
   * 为指定大运生成流年数据
   * @param daYun 大运信息
   * @returns 流年数据数组
   */
  private generateLiuNianForDaYun(daYun: any): any[] {
    return DataGenerationService.generateLiuNianForDaYun(daYun);
  }



  /**
   * 选择流年
   * @param year 流年年份
   */
  private selectLiuNian(year: number) {
    console.log(`🎯 选择流年: ${year}`);

    // 更新扩展列管理器的选中流年
    this.extendedColumnManager.setSelectedLiuNianYear(year);

    // 扩展四柱表格到流年层级
    this.extendedColumnManager.extendBaziTableToLevel('liunian');
  }

  /**
   * 重置下级选择状态
   * @param currentLevel 当前选择的层级
   */
  private resetLowerLevelSelections(currentLevel: string) {
    console.log(`🔄 重置下级选择状态: ${currentLevel}`);

    const levels = ['dayun', 'liunian', 'liuyue', 'liuri', 'liushi'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex === -1) return;

    // 隐藏下级元素
    this.sectionRenderManager.hideLowerLevelElements(currentLevel);

    // 重置当前层级之后的所有层级
    for (let i = currentIndex + 1; i < levels.length; i++) {
      const level = levels[i];
      switch (level) {
        case 'liunian':
          this.extendedColumnManager.setSelectedLiuNianYear(0);
          break;
        case 'liuyue':
          this.extendedColumnManager.setCurrentSelectedLiuYue(null);
          break;
        case 'liuri':
          this.extendedColumnManager.setCurrentSelectedLiuRi(null);
          break;
        case 'liushi':
          this.extendedColumnManager.setCurrentSelectedLiuShi(null);
          break;
      }
    }
  }

  /**
   * 重置下级选择状态（排除指定层级）
   * @param currentLevel 当前选择的层级
   * @param except 排除的层级列表
   */
  private resetLowerLevelSelectionsExcept(currentLevel: string, except: string[] = []) {
    console.log(`🔄 重置下级选择状态（排除${except.join(', ')}）: ${currentLevel}`);

    const levels = ['dayun', 'liunian', 'liuyue', 'liuri', 'liushi'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex === -1) return;

    // 重置当前层级之后的所有层级（排除指定层级）
    for (let i = currentIndex + 1; i < levels.length; i++) {
      const level = levels[i];
      if (except.includes(level)) continue;

      switch (level) {
        case 'liunian':
          this.extendedColumnManager.setSelectedLiuNianYear(0);
          break;
        case 'liuyue':
          this.extendedColumnManager.setCurrentSelectedLiuYue(null);
          break;
        case 'liuri':
          this.extendedColumnManager.setCurrentSelectedLiuRi(null);
          break;
        case 'liushi':
          this.extendedColumnManager.setCurrentSelectedLiuShi(null);
          break;
      }
    }
  }

  /**
   * 处理流年选择
   * @param liunian 流年数据
   */
  private handleLiuNianSelect(liunian: any) {
    console.log(`🎯 处理流年选择: ${liunian.year}`);

    this.selectLiuNian(liunian.year);

    // 先隐藏流日和流时，但不隐藏流月
    const liuRiInfoManager = this.sectionRenderManager.getLiuRiInfoManager();
    const liuShiInfoManager = this.sectionRenderManager.getLiuShiInfoManager();
    if (liuRiInfoManager) {
      liuRiInfoManager.hide();
    }
    if (liuShiInfoManager) {
      liuShiInfoManager.hide();
    }

    // 重置下级选择状态（但不隐藏流月）
    this.resetLowerLevelSelectionsExcept('liunian', ['liuyue']);

    // 显示流月
    const liuYueInfoManager = this.sectionRenderManager.getLiuYueInfoManager();
    if (liuYueInfoManager) {
      liuYueInfoManager.setSelectedYear(liunian.year);
    }

    console.log(`✅ 流年选择完成，流月信息已显示`);
  }







  /**
   * 选择流月
   * @param liuYue 流月数据
   */
  private selectLiuYue(liuYue: any) {
    console.log(`🎯 选择流月: ${liuYue.month}月 (${liuYue.ganZhi})`);

    // 更新扩展列管理器的选中流月
    this.extendedColumnManager.setCurrentSelectedLiuYue(liuYue);

    // 扩展四柱表格到流月层级
    this.extendedColumnManager.extendBaziTableToLevel('liuyue');

    // 生成流日数据并显示流日选择器（使用干支而不是月份数字）
    const liuRiData = DataGenerationService.generateLiuRiForMonth(liuYue.year, liuYue.ganZhi, this.baziInfo.dayStem || '甲');
    this.horizontalSelectorManager.showLiuRiSelector(
      liuYue.year,
      liuYue.ganZhi,
      liuRiData,
      (year, month, day) => {
        this.handleLiuRiSelect({ year, month, day });
      }
    );
  }



  /**
   * 生成并显示流日数据
   * @param year 年份
   * @param monthGanZhi 月份干支
   */
  private generateAndShowLiuRiData(year: number, monthGanZhi: string) {
    console.log(`🔄 生成流日数据: ${year}年 ${monthGanZhi}`);

    // 获取日干用于计算
    const dayStem = this.baziInfo.dayStem || '甲';

    // 生成流日数据（使用后端算法）
    const liuRiData = DataGenerationService.generateLiuRiForMonth(year, monthGanZhi, dayStem);

    // 显示流日选择器
    this.horizontalSelectorManager.showLiuRiSelector(
      year,
      monthGanZhi,
      liuRiData,
      (selectedYear, selectedMonth, selectedDay) => {
        this.handleLiuRiSelect({ year: selectedYear, month: selectedMonth, day: selectedDay });
      }
    );
  }

  /**
   * 生成并显示流时数据
   * @param year 年份
   * @param month 月份
   * @param day 日期
   */
  private generateAndShowLiuShiData(year: number, month: number, day: number) {
    console.log(`🔄 生成流时数据: ${year}年 ${month}月 ${day}日`);

    // 获取日干用于计算
    const dayStem = this.baziInfo.dayStem || '甲';

    // 生成流时数据（使用后端算法，传递baziInfo以获取流派设置）
    const liuShiData = DataGenerationService.generateLiuShiForDay(year, month, day, dayStem, this.baziInfo);

    // 显示流时选择器
    this.horizontalSelectorManager.showLiuShiSelector(
      year,
      month,
      day,
      liuShiData,
      (liuShi) => {
        this.handleLiuShiSelect(liuShi);
      }
    );
  }

  /**
   * 处理流月选择
   * @param liuYue 流月数据
   */
  private handleLiuYueSelect(liuYue: any) {
    console.log(`🎯 处理流月选择: ${liuYue.year}年 ${liuYue.month}`);
    this.selectLiuYue(liuYue);

    // 扩展四柱表格到流月层级
    this.extendedColumnManager.extendBaziTableToLevel('liuyue');

    // 先隐藏流时
    const liuShiInfoManager = this.sectionRenderManager.getLiuShiInfoManager();
    if (liuShiInfoManager) {
      liuShiInfoManager.hide();
    }

    // 重置下级选择状态（但不隐藏流日）
    this.resetLowerLevelSelectionsExcept('liuyue', ['liuri']);

    // 显示流日
    const liuRiInfoManager = this.sectionRenderManager.getLiuRiInfoManager();
    if (liuRiInfoManager) {
      liuRiInfoManager.setSelectedYearMonth(liuYue.year, liuYue.ganZhi);
    }

    console.log(`✅ 流月选择完成，流日信息已显示`);
  }

  /**
   * 处理流日选择
   * @param liuRi 流日数据
   */
  private handleLiuRiSelect(liuRi: any) {
    console.log(`🎯 处理流日选择: ${liuRi.year}年 ${liuRi.month} ${liuRi.day}日`);
    this.selectLiuRi(liuRi.year, liuRi.month, liuRi.day);

    // 扩展四柱表格到流日层级
    this.extendedColumnManager.extendBaziTableToLevel('liuri');

    // 重置下级选择状态（不需要排除，因为流时是最后一级）
    this.resetLowerLevelSelections('liuri');

    // 显示流时
    const liuShiInfoManager = this.sectionRenderManager.getLiuShiInfoManager();
    if (liuShiInfoManager) {
      liuShiInfoManager.setSelectedYearMonthDay(liuRi.year, liuRi.month, liuRi.day);
    }

    console.log(`✅ 流日选择完成，流时信息已显示`);
  }

  /**
   * 处理流时选择
   * @param liuShi 流时数据
   */
  private handleLiuShiSelect(liuShi: any) {
    console.log(`🎯 处理流时选择: ${liuShi.year}年 ${liuShi.month} ${liuShi.day}日 ${liuShi.name} (${liuShi.ganZhi})`);

    // 传递完整的流时对象，而不是分解的字段
    this.selectLiuShi(liuShi);

    // 扩展四柱表格到流时层级
    this.extendedColumnManager.extendBaziTableToLevel('liushi');

    // 重置下级选择状态
    this.resetLowerLevelSelections('liushi');
  }

  /**
   * 更新神煞显示设置
   * @param showShenSha 神煞显示设置
   */
  public updateShenShaSettings(showShenSha: any): void {
    this.baziInfo.showShenSha = showShenSha;
    console.log('🎯 更新神煞显示设置:', showShenSha);

    // 更新八字表格管理器的神煞设置
    if (this.baziTableManager) {
      // BaziTableManager 会根据 baziInfo.showShenSha 自动处理显示逻辑
      // 重新创建表格以应用新设置
      this.createBaziTable();
    }

    // 更新大运表格管理器的神煞设置
    if (this.daYunTableManager) {
      this.daYunTableManager.updateShenShaSettings(showShenSha);
    }



    // 更新流月表格管理器的神煞设置
    if (this.liuYueTableManager) {
      this.liuYueTableManager.updateShenShaSettings(showShenSha);
    }
  }



}
