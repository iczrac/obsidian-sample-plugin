import { App, Modal, Setting, Notice } from 'obsidian';
import { BaziService } from '../services/BaziService';

/**
 * 八字解析模态框
 */
export class BaziParserModal extends Modal {
  private baziString: string = '';
  private onParsed: (baziInfo: any) => void;

  constructor(app: App, initialBazi: string = '', onParsed: (baziInfo: any) => void) {
    super(app);
    this.baziString = initialBazi;
    this.onParsed = onParsed;
  }

  onOpen() {
    const { contentEl } = this;
    
    contentEl.createEl('h2', { text: '解析八字' });
    
    // 说明文本
    contentEl.createEl('p', { 
      text: '请输入八字，格式为"年柱 月柱 日柱 时柱"，如"甲子 乙丑 丙寅 丁卯"' 
    });

    // 八字输入
    new Setting(contentEl)
      .setName('八字')
      .setDesc('输入完整八字')
      .addText(text => {
        text.setPlaceholder('甲子 乙丑 丙寅 丁卯')
          .setValue(this.baziString)
          .onChange(value => {
            this.baziString = value;
          });
      });

    // 错误信息区域
    const errorDiv = contentEl.createDiv({ cls: 'bazi-error-container' });
    errorDiv.hide();

    // 解析按钮
    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText('解析八字')
          .setCta()
          .onClick(() => {
            try {
              // 清除之前的错误信息
              errorDiv.empty();
              errorDiv.hide();
              
              // 解析八字
              const baziInfo = BaziService.parseBaziString(this.baziString);
              
              // 调用回调函数
              this.onParsed(baziInfo);
              
              // 关闭模态框
              this.close();
              
              // 显示成功通知
              new Notice('八字解析成功');
            } catch (error) {
              console.error('解析八字出错:', error);
              
              // 显示错误信息
              errorDiv.setText(`错误: ${error.message}`);
              errorDiv.show();
            }
          });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
