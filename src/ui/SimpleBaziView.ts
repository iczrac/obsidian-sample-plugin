import { BaziInfo } from '../types/BaziInfo';
import { MarkdownView, Notice } from 'obsidian';

/**
 * 简洁八字视图组件
 * 样式1：仅显示八字和基本信息，无标题，无设置按钮
 */
export class SimpleBaziView {
  private container: HTMLElement;
  private baziInfo: BaziInfo;
  private id: string;
  private plugin: any;

  constructor(container: HTMLElement, baziInfo: BaziInfo, id: string, plugin?: any) {
    this.container = container;
    this.baziInfo = baziInfo;
    this.id = id;
    this.plugin = plugin;

    this.render();
  }

  /**
   * 渲染简洁八字视图
   */
  private render() {
    // 清空容器
    this.container.empty();
    this.container.addClass('simple-bazi-view');
    this.container.setAttribute('id', this.id);

    // 创建标题和样式切换按钮
    this.createHeader();

    // 创建基本信息（无标题）
    this.createBasicInfo();

    // 创建八字表格
    this.createBaziTable();
  }

  /**
   * 创建标题和按钮
   */
  private createHeader() {
    if (!this.plugin) return;

    const header = this.container.createDiv({ cls: 'bazi-view-header simple' });

    // 创建标题
    header.createEl('h4', { text: '八字命盘', cls: 'bazi-view-title simple' });

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

  /**
   * 创建基本信息
   */
  private createBasicInfo() {
    const basicInfoDiv = this.container.createDiv({ cls: 'bazi-basic-info simple' });

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
    const tableSection = this.container.createDiv({ cls: 'bazi-view-section simple' });

    // 创建表格
    const table = tableSection.createEl('table', { cls: 'bazi-view-table simple' });

    // 创建表头
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');

    ['年柱', '月柱', '日柱', '时柱'].forEach(text => {
      headerRow.createEl('th', { text });
    });

    // 创建表体
    const tbody = table.createEl('tbody');

    // 天干行
    const stemRow = tbody.createEl('tr');
    stemRow.createEl('td', {
      text: this.baziInfo.yearStem || '',
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.yearStem || ''))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.monthStem || '',
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.monthStem || ''))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.dayStem || '',
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.dayStem || ''))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.hourStem || '',
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.hourStem || ''))}`
    });

    // 地支行
    const branchRow = tbody.createEl('tr');
    branchRow.createEl('td', {
      text: this.baziInfo.yearBranch || '',
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.yearBranch || ''))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.monthBranch || '',
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.monthBranch || ''))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.dayBranch || '',
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.dayBranch || ''))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.hourBranch || '',
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.hourBranch || ''))}`
    });
  }

  /**
   * 获取五行对应的CSS类名
   */
  private getWuXingClass(wuxing: string): string {
    const map: { [key: string]: string } = {
      '金': 'jin',
      '木': 'mu',
      '水': 'shui',
      '火': 'huo',
      '土': 'tu'
    };
    return map[wuxing] || '';
  }

  /**
   * 获取天干对应的五行
   */
  private getStemWuXing(stem: string): string {
    const map: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return map[stem] || '';
  }

  /**
   * 获取地支对应的五行
   */
  private getBranchWuXing(branch: string): string {
    const map: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return map[branch] || '';
  }

  /**
   * 切换样式
   */
  private switchStyle() {
    if (!this.plugin) return;

    console.log('🎨 简洁样式切换按钮点击');

    // 当前是样式1，切换到样式2
    const nextStyle = '2';
    console.log('从样式1切换到样式2');

    // 更新代码块
    this.updateCodeBlockWithStyle(nextStyle);
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
        hour: this.baziInfo.originalDate?.hour || new Date().getHours()
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
   * 更新八字信息
   * @param updatedBaziInfo 更新后的八字信息
   */
  private updateBaziInfo(updatedBaziInfo: any): void {
    console.log('⚙️ 更新八字信息:', updatedBaziInfo);

    // 更新内部八字信息
    this.baziInfo = updatedBaziInfo;

    // 重新渲染整个视图
    this.render();
  }

  /**
   * 更新代码块的样式参数 - 使用与年份/性别选择完全相同的方案
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
   * 从文件中获取原始的完整源代码
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
   * 精确更新特定的代码块 - 复制自CodeBlockProcessor的成功方案
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
}
