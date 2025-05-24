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
   * 创建标题和样式切换按钮
   */
  private createHeader() {
    if (!this.plugin) return;

    const header = this.container.createDiv({ cls: 'bazi-view-header simple' });

    // 创建标题
    header.createEl('h4', { text: '八字命盘', cls: 'bazi-view-title simple' });

    // 创建样式切换按钮
    const styleButton = header.createEl('button', {
      cls: 'bazi-view-style-button',
      attr: { 'data-bazi-id': this.id, 'aria-label': '切换样式' }
    });
    styleButton.innerHTML = '🎨';

    // 添加样式切换按钮点击事件
    styleButton.addEventListener('click', () => {
      this.switchStyle();
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
      text: this.baziInfo.yearStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.yearStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.monthStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.monthStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.dayStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.dayStem))}`
    });
    stemRow.createEl('td', {
      text: this.baziInfo.hourStem,
      cls: `wuxing-${this.getWuXingClass(this.getStemWuXing(this.baziInfo.hourStem))}`
    });

    // 地支行
    const branchRow = tbody.createEl('tr');
    branchRow.createEl('td', {
      text: this.baziInfo.yearBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.yearBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.monthBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.monthBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.dayBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.dayBranch))}`
    });
    branchRow.createEl('td', {
      text: this.baziInfo.hourBranch,
      cls: `wuxing-${this.getWuXingClass(this.getBranchWuXing(this.baziInfo.hourBranch))}`
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
   * 更新代码块的样式参数
   */
  private updateCodeBlockWithStyle(newStyle: string) {
    try {
      console.log('🔄 开始更新代码块样式为:', newStyle);

      const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        console.log('❌ 无法获取活动的编辑器视图');
        new Notice('更新样式失败：无法获取活动的编辑器视图', 3000);
        return;
      }

      const editor = activeView.editor;
      if (!editor) {
        console.log('❌ 无法获取编辑器实例');
        new Notice('更新样式失败：无法获取编辑器实例', 3000);
        return;
      }

      // 查找当前代码块
      const cursor = editor.getCursor();
      const totalLines = editor.lineCount();
      let startLine = -1;
      let endLine = -1;
      let foundTargetBlock = false;

      // 向上查找代码块开始
      for (let i = cursor.line; i >= 0; i--) {
        const line = editor.getLine(i);
        if (line.trim() === '```bazi') {
          startLine = i;
          break;
        }
      }

      // 向下查找代码块结束
      if (startLine !== -1) {
        for (let i = startLine + 1; i < totalLines; i++) {
          const line = editor.getLine(i);
          if (line.trim() === '```') {
            endLine = i;
            foundTargetBlock = true;
            break;
          }
        }
      }

      if (foundTargetBlock) {
        // 获取代码块内容
        let blockContent = '';
        for (let i = startLine + 1; i < endLine; i++) {
          blockContent += editor.getLine(i) + '\n';
        }

        console.log('原始代码块内容:', blockContent);

        // 解析现有参数
        const lines = blockContent.trim().split('\n');
        const newLines: string[] = [];
        let styleUpdated = false;

        // 处理每一行
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('style:')) {
            // 更新样式参数
            newLines.push(`style: ${newStyle}`);
            styleUpdated = true;
          } else if (trimmedLine) {
            // 保留其他参数
            newLines.push(trimmedLine);
          }
        }

        // 如果没有找到style参数，添加一个
        if (!styleUpdated) {
          newLines.push(`style: ${newStyle}`);
        }

        const newSource = newLines.join('\n');
        console.log('新的代码块内容:', newSource);

        // 使用文件API更新
        const file = this.plugin.app.workspace.getActiveFile();
        if (file) {
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
            console.log('✅ 样式更新成功');

            // 显示通知
            const styleNames = { '1': '简洁样式', '2': '标准样式', '3': '完整样式' };
            new Notice(`已切换到${styleNames[newStyle as keyof typeof styleNames]}`);
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
}
