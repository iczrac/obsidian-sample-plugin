import { App, Modal, Setting, MarkdownRenderer } from 'obsidian';
import { BaziInfo, BaziService } from '../services/BaziService';

/**
 * 八字信息展示模态框
 */
export class BaziInfoModal extends Modal {
  private baziInfo: BaziInfo;
  private onInsert: (markdown: string) => void;

  constructor(app: App, baziInfo: BaziInfo, onInsert: (markdown: string) => void) {
    super(app);
    this.baziInfo = baziInfo;
    this.onInsert = onInsert;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: '八字命盘信息' });

    // 创建信息容器
    const infoContainer = contentEl.createDiv({ cls: 'bazi-info-container' });

    // 生成Markdown内容
    const markdown = BaziService.generateBaziMarkdown(this.baziInfo);

    // 渲染Markdown - 直接使用HTML
    infoContainer.innerHTML = `<div class="markdown-rendered">${markdown}</div>`;

    // 添加按钮
    const buttonContainer = contentEl.createDiv({ cls: 'bazi-button-container' });

    // 插入笔记按钮
    new Setting(buttonContainer)
      .addButton(button => {
        button.setButtonText('插入到笔记')
          .setCta()
          .onClick(() => {
            this.onInsert(markdown);
            this.close();
          });
      })
      .addButton(button => {
        button.setButtonText('关闭')
          .onClick(() => {
            this.close();
          });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
