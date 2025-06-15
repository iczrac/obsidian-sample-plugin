import { MarkdownView, Notice } from 'obsidian';

/**
 * 样式和工具管理器
 * 负责样式切换、代码块更新等工具功能
 */
export class StyleAndUtilsManager {
  private container: HTMLElement;
  private plugin: any;

  // 十二长生显示模式：0=地势，1=自坐，2=月令
  private changShengMode: number = 0;

  private readonly CHANG_SHENG_MODES = [
    { key: 'diShi', name: '地势', description: '日干在各地支的十二长生状态' },
    { key: 'ziZuo', name: '自坐', description: '各柱天干相对于各柱地支的十二长生状态' },
    { key: 'yueLing', name: '月令', description: '各柱天干相对于月令的十二长生状态' }
  ];

  constructor(container: HTMLElement, plugin: any) {
    this.container = container;
    this.plugin = plugin;
  }

  /**
   * 切换十二长生显示模式
   */
  toggleChangShengMode() {
    // 切换到下一个模式
    this.changShengMode = (this.changShengMode + 1) % this.CHANG_SHENG_MODES.length;

    // 更新地势行显示
    this.updateChangShengDisplay();

    // 显示切换提示
    const currentMode = this.CHANG_SHENG_MODES[this.changShengMode];
    new Notice(`已切换到${currentMode.name}模式：${currentMode.description}`);
  }

  /**
   * 更新十二长生显示
   */
  private updateChangShengDisplay() {
    const currentMode = this.CHANG_SHENG_MODES[this.changShengMode];

    // 更新标签文本和提示
    const diShiLabel = this.container.querySelector('.bazi-changsheng-label');
    if (diShiLabel) {
      diShiLabel.textContent = currentMode.name;
      diShiLabel.setAttribute('title', currentMode.description + ' (点击切换)');
    }

    // 更新各柱的十二长生状态显示
    this.updatePillarChangShengDisplay('year');
    this.updatePillarChangShengDisplay('month');
    this.updatePillarChangShengDisplay('day');
    this.updatePillarChangShengDisplay('time');
  }

  /**
   * 更新单个柱的十二长生状态显示
   */
  private updatePillarChangShengDisplay(pillar: 'year' | 'month' | 'day' | 'time') {
    const currentMode = this.CHANG_SHENG_MODES[this.changShengMode];
    let value = '';

    // 根据当前模式获取对应的值
    // 注意：这里需要从外部传入baziInfo数据
    // 暂时使用空值，实际使用时需要传入数据
    switch (currentMode.key) {
      case 'diShi':
        // value = baziInfo[`${pillar}DiShi`] || '';
        break;
      case 'ziZuo':
        // value = baziInfo[`${pillar}ZiZuo`] || '';
        break;
      case 'yueLing':
        // value = baziInfo[`${pillar}YueLing`] || '';
        break;
    }

    // 更新对应的显示元素
    const cellSelector = `.bazi-dishi-row td:nth-child(${this.getPillarIndex(pillar)}) .dishi-tag-small`;
    const element = this.container.querySelector(cellSelector);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * 获取柱的索引位置
   */
  private getPillarIndex(pillar: 'year' | 'month' | 'day' | 'time'): number {
    switch (pillar) {
      case 'year': return 2;  // 年柱在第2列
      case 'month': return 3; // 月柱在第3列
      case 'day': return 4;   // 日柱在第4列
      case 'time': return 5;  // 时柱在第5列
      default: return 2;
    }
  }

  /**
   * 切换样式
   */
  switchStyle() {
    console.log('🎨 切换样式按钮点击');

    // 获取当前样式
    const currentStyle = this.getCurrentStyle();
    console.log('当前样式:', currentStyle);

    // 计算下一个样式
    const nextStyle = this.getNextStyle(currentStyle);
    console.log('下一个样式:', nextStyle);

    // 更新代码块
    this.updateCodeBlockWithStyle(nextStyle);
  }

  /**
   * 获取当前样式
   */
  private getCurrentStyle(): string {
    // 从容器的class或其他地方获取当前样式
    // 由于这是InteractiveBaziView，当前样式应该是3（完整样式）
    return '3';
  }

  /**
   * 获取下一个样式
   */
  private getNextStyle(currentStyle: string): string {
    switch (currentStyle) {
      case '1':
        return '2';
      case '2':
        return '3';
      case '3':
        return '1';
      default:
        return '1';
    }
  }

  /**
   * 更新代码块的样式参数
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
   * 精确更新特定的代码块
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
   * 五行颜色工具方法
   */
  applyStemWuXingColor(element: HTMLElement, stem: string) {
    const wuXing = this.getStemWuXing(stem);
    this.setWuXingColorDirectly(element, wuXing);
  }

  applyBranchWuXingColor(element: HTMLElement, branch: string) {
    const wuXing = this.getBranchWuXing(branch);
    this.setWuXingColorDirectly(element, wuXing);
  }

  private getStemWuXing(stem: string): string {
    const stemWuXing: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return stemWuXing[stem] || '';
  }

  private getBranchWuXing(branch: string): string {
    const branchWuXing: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return branchWuXing[branch] || '';
  }

  setWuXingColorDirectly(element: HTMLElement, wuXing: string) {
    const colorMap: { [key: string]: string } = {
      '木': '#22c55e',  // 绿色
      '火': '#ef4444',  // 红色
      '土': '#eab308',  // 黄色
      '金': '#64748b',  // 灰色
      '水': '#3b82f6'   // 蓝色
    };

    const color = colorMap[wuXing];
    if (color) {
      element.style.color = color;
      element.style.fontWeight = 'bold';
    }
  }

  /**
   * 创建带颜色的藏干
   */
  createColoredHideGan(container: HTMLElement, hideGan: string) {
    if (!hideGan) return;

    for (const gan of hideGan) {
      const span = container.createSpan({ text: gan });
      this.applyStemWuXingColor(span, gan);
    }
  }
}
