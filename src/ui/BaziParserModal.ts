import { App, Modal, Setting, Notice } from 'obsidian';
import { BaziService } from '../services/BaziService';

/**
 * 八字解析模态框
 */
export class BaziParserModal extends Modal {
  private baziString = '';
  private onParsed: (baziInfo: any) => void;

  constructor(app: App, initialBazi = '', onParsed: (baziInfo: any) => void) {
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

    // 年份选择（可选）
    const yearSetting = new Setting(contentEl)
      .setName('年份（可选）')
      .setDesc('指定八字所在的年份，如果不确定可以留空')
      .addText(text => {
        text.setPlaceholder('例如：1980')
          .onChange(value => {
            // 存储用户输入的年份
            if (value && !isNaN(parseInt(value))) {
              this.specifiedYear = parseInt(value);
            } else {
              this.specifiedYear = undefined;
            }
          });
      });

    // 性别选择
    const genderSetting = new Setting(contentEl)
      .setName('性别')
      .setDesc('选择性别，用于大运计算')
      .addDropdown(dropdown => {
        dropdown
          .addOption('', '请选择')
          .addOption('1', '男')
          .addOption('0', '女')
          .setValue(this.gender)
          .onChange(value => {
            this.gender = value;
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

              // 解析八字，传入年份和性别参数
              const baziInfo = BaziService.parseBaziString(
                this.baziString,
                this.specifiedYear ? this.specifiedYear.toString() : undefined,
                this.gender,
                '2', // 使用默认流派
                1 // 默认使用起运流派1
              );

              // 确保性别和指定年份信息被传递给回调函数
              baziInfo.gender = this.gender;
              baziInfo.specifiedYear = this.specifiedYear;

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

  // 添加性别和年份属性
  private gender = ''; // 默认为空
  private specifiedYear: number | undefined;
}
