import { App, Modal, Setting, moment } from 'obsidian';
import { BaziService } from '../services/BaziService';

/**
 * 日期选择模态框
 */
export class DatePickerModal extends Modal {
  private date: moment.Moment;
  private hour = 0;
  private onSubmit: (baziInfo: any) => void;
  private gender = ''; // 性别，默认为空
  private baziSect = '2'; // 默认为流派2

  constructor(app: App, onSubmit: (baziInfo: any) => void) {
    super(app);
    this.date = moment();
    this.onSubmit = onSubmit;

    // 尝试从插件设置中获取流派
    try {
      // @ts-ignore - 忽略类型检查
      const plugin = app.plugins.plugins["bazi-obsidian"];
      if (plugin && plugin.settings) {
        this.baziSect = plugin.settings.baziSect || '2';
      }
    } catch (e) {
      console.log("无法获取插件设置，使用默认值");
    }
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: '选择日期和时间' });

    // 日期选择
    new Setting(contentEl)
      .setName('日期')
      .setDesc('选择要转换为八字的日期')
      .addText(text => {
        text.setPlaceholder('YYYY-MM-DD')
          .setValue(this.date.format('YYYY-MM-DD'))
          .onChange(value => {
            const newDate = moment(value, 'YYYY-MM-DD', true);
            if (newDate.isValid()) {
              this.date = newDate;
            }
          });
      });

    // 时间选择
    new Setting(contentEl)
      .setName('时辰')
      .setDesc('选择时辰（0-23点）')
      .addDropdown(dropdown => {
        // 添加24小时选项
        for (let i = 0; i < 24; i++) {
          dropdown.addOption(i.toString(), `${i}点 (${this.getChineseHour(i)}时)`);
        }
        dropdown.setValue(this.hour.toString())
          .onChange(value => {
            this.hour = parseInt(value);
          });
      });

    // 性别选择
    new Setting(contentEl)
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

    // 提交按钮
    new Setting(contentEl)
      .addButton(button => {
        button.setButtonText('生成八字')
          .setCta()
          .onClick(() => {
            try {
              const year = this.date.year();
              const month = this.date.month() + 1; // moment月份从0开始
              const day = this.date.date();

              // 获取八字信息
              const baziInfo = BaziService.getBaziFromDate(year, month, day, this.hour, this.gender, this.baziSect);

              // 确保性别信息被传递给回调函数
              baziInfo.gender = this.gender;

              // 调用回调函数
              this.onSubmit(baziInfo);

              // 关闭模态框
              this.close();
            } catch (error) {
              console.error('生成八字信息出错:', error);
              // 显示错误信息
              const errorDiv = contentEl.createDiv();
              errorDiv.setText(`错误: ${error.message}`);
              errorDiv.addClass('bazi-error');
            }
          });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * 获取中文时辰名称
   * @param hour 小时（0-23）
   * @returns 中文时辰名称
   */
  private getChineseHour(hour: number): string {
    const chineseHours = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    // 将24小时制转换为12时辰
    // 23:00-00:59 = 子时
    // 01:00-02:59 = 丑时
    // ...
    // 21:00-22:59 = 亥时
    const index = Math.floor((hour + 1) % 24 / 2);
    return chineseHours[index];
  }
}
