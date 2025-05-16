import { App, Modal, Setting } from 'obsidian';
import { BaziInfo, BaziService } from '../services/BaziService';

/**
 * 八字信息展示模态框
 */
export class BaziInfoModal extends Modal {
  private baziInfo: BaziInfo;
  private onInsert: (codeBlock: string) => void;

  constructor(app: App, baziInfo: BaziInfo, onInsert: (codeBlock: string) => void) {
    super(app);
    this.baziInfo = baziInfo;
    this.onInsert = onInsert;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: '八字命盘信息' });

    // 创建信息容器
    const infoContainer = contentEl.createDiv({ cls: 'bazi-info-container' });

    // 生成HTML内容
    const id = 'bazi-view-' + Math.random().toString(36).substring(2, 9);
    const html = BaziService.generateBaziHTML(this.baziInfo, id);

    // 渲染HTML
    infoContainer.innerHTML = html;

    // 添加按钮
    const buttonContainer = contentEl.createDiv({ cls: 'bazi-button-container' });

    // 插入笔记按钮
    new Setting(buttonContainer)
      .addButton(button => {
        button.setButtonText('插入到笔记')
          .setCta()
          .onClick(() => {
            // 生成代码块
            const dateStr = `${this.baziInfo.solarDate} ${this.baziInfo.solarTime}`;
            const codeBlock = `\`\`\`bazi
date: ${dateStr}
\`\`\``;
            this.onInsert(codeBlock);
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
