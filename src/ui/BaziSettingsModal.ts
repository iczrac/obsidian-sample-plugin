import { App, Modal, Setting } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { DatePickerModal } from './DatePickerModal';

/**
 * 八字命盘设置模态框
 * 用于调整八字命盘的参数
 */
export class BaziSettingsModal extends Modal {
  private baziId: string;
  private currentDate: { year: number; month: number; day: number; hour: number };
  private onUpdate: (baziInfo: any) => void;
  private gender: string = '1'; // 默认为男性
  private calculationMethod: string = '0'; // 默认为传统排盘
  private showWuxing: boolean = true; // 默认显示五行分析
  private showSpecialInfo: boolean = true; // 默认显示特殊信息

  /**
   * 创建八字命盘设置模态框
   * @param app Obsidian应用实例
   * @param baziId 八字命盘ID
   * @param initialDate 初始日期
   * @param onUpdate 更新回调
   */
  constructor(
    app: App,
    baziId: string,
    initialDate: { year: number; month: number; day: number; hour: number },
    onUpdate: (baziInfo: any) => void
  ) {
    super(app);
    this.baziId = baziId;
    this.currentDate = initialDate;
    this.onUpdate = onUpdate;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: '八字命盘设置' });

    // 当前日期信息显示
    const dateInfoDiv = contentEl.createDiv({ cls: 'bazi-settings-date-info' });
    dateInfoDiv.createEl('p', {
      text: `当前日期：${this.currentDate.year}年${this.currentDate.month}月${this.currentDate.day}日 ${this.currentDate.hour}时`,
      cls: 'bazi-settings-info-text'
    });

    // 日期和时间设置
    new Setting(contentEl)
      .setName('修改日期和时间')
      .setDesc('选择新的日期和时间来重新计算八字')
      .addButton(button => {
        button.setButtonText('选择日期和时间')
          .setCta()
          .onClick(() => {
            // 关闭当前模态框
            this.close();

            // 打开日期选择模态框
            const datePickerModal = new DatePickerModal(this.app, (baziInfo) => {
              // 更新八字命盘
              this.onUpdate(baziInfo);
            });
            datePickerModal.open();
          });
      });

    // 年份微调
    new Setting(contentEl)
      .setName('调整年份')
      .setDesc('微调年份，保持天干地支不变')
      .addDropdown(dropdown => {
        // 添加60年一个甲子周期的选项
        const currentYear = this.currentDate.year;
        const options: Record<string, string> = {};

        for (let i = -5; i <= 5; i++) {
          if (i === 0) continue; // 跳过当前年
          const year = currentYear + i * 60;
          if (year > 0 && year < 2100) { // 限制合理范围
            options[year.toString()] = `${year}年 (${i > 0 ? '+' : ''}${i}甲子)`;
          }
        }

        dropdown
          .addOptions(options)
          .setValue(currentYear.toString())
          .onChange(value => {
            const newYear = parseInt(value);
            if (newYear && newYear !== this.currentDate.year) {
              // 更新年份
              this.currentDate.year = newYear;

              // 重新计算八字
              const baziInfo = BaziService.getBaziFromDate(
                this.currentDate.year,
                this.currentDate.month,
                this.currentDate.day,
                this.currentDate.hour
              );

              // 更新八字命盘
              this.onUpdate(baziInfo);

              // 更新日期信息显示
              dateInfoDiv.empty();
              dateInfoDiv.createEl('p', {
                text: `当前日期：${this.currentDate.year}年${this.currentDate.month}月${this.currentDate.day}日 ${this.currentDate.hour}时`,
                cls: 'bazi-settings-info-text'
              });
            }
          });
      });

    // 直接输入八字
    new Setting(contentEl)
      .setName('直接输入八字')
      .setDesc('输入完整八字，格式如"甲子 乙丑 丙寅 丁卯"')
      .addText(text => {
        text.setPlaceholder('甲子 乙丑 丙寅 丁卯')
          .onChange(value => {
            if (value && value.trim().split(' ').length === 4) {
              try {
                // 解析八字
                const baziInfo = BaziService.parseBaziString(value);

                // 更新八字命盘
                this.onUpdate(baziInfo);
              } catch (error) {
                console.error('解析八字出错:', error);
              }
            }
          });
      });

    // 性别设置（用于大运计算）
    new Setting(contentEl)
      .setName('性别')
      .setDesc('选择性别，用于大运计算')
      .addDropdown(dropdown => {
        dropdown
          .addOption('1', '男')
          .addOption('0', '女')
          .setValue(this.gender)
          .onChange(value => {
            this.gender = value;

            // 更新八字命盘
            const baziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            // TODO: 设置性别并重新计算大运

            this.onUpdate(baziInfo);
          });
      });

    // 排盘方式设置
    new Setting(contentEl)
      .setName('排盘方式')
      .setDesc('选择八字排盘的计算方式')
      .addDropdown(dropdown => {
        dropdown
          .addOption('0', '传统排盘')
          .addOption('1', '新派排盘')
          .setValue(this.calculationMethod)
          .onChange(value => {
            this.calculationMethod = value;

            // 更新八字命盘
            const baziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            // TODO: 设置排盘方式并重新计算

            this.onUpdate(baziInfo);
          });
      });

    // 显示选项 - 五行分析
    new Setting(contentEl)
      .setName('显示五行分析')
      .setDesc('是否显示五行分析部分')
      .addToggle(toggle => {
        toggle
          .setValue(this.showWuxing)
          .onChange(value => {
            this.showWuxing = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              const wuxingSection = element.querySelector('.bazi-view-wuxing-list')?.parentElement;
              if (wuxingSection) {
                if (value) {
                  wuxingSection.style.display = '';
                } else {
                  wuxingSection.style.display = 'none';
                }
              }
            }
          });
      });

    // 显示选项 - 特殊信息
    new Setting(contentEl)
      .setName('显示特殊信息')
      .setDesc('是否显示胎元、命宫等特殊信息')
      .addToggle(toggle => {
        toggle
          .setValue(this.showSpecialInfo)
          .onChange(value => {
            this.showSpecialInfo = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              const specialInfoSection = element.querySelector('.bazi-view-info-list')?.parentElement;
              if (specialInfoSection) {
                if (value) {
                  specialInfoSection.style.display = '';
                } else {
                  specialInfoSection.style.display = 'none';
                }
              }
            }
          });
      });

    // 按钮区域
    const buttonContainer = contentEl.createDiv({ cls: 'bazi-settings-button-container' });

    // 应用按钮
    new Setting(buttonContainer)
      .addButton(button => {
        button.setButtonText('应用更改')
          .setCta()
          .onClick(() => {
            // 更新八字命盘
            const baziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            this.onUpdate(baziInfo);
            this.close();
          });
      })
      // 关闭按钮
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
