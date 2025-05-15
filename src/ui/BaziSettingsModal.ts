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
    
    // 日期和时间设置
    new Setting(contentEl)
      .setName('日期和时间')
      .setDesc('修改八字命盘的日期和时间')
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
    
    // 性别设置（用于大运计算）
    new Setting(contentEl)
      .setName('性别')
      .setDesc('选择性别，用于大运计算')
      .addDropdown(dropdown => {
        dropdown
          .addOption('1', '男')
          .addOption('0', '女')
          .setValue('1')
          .onChange(value => {
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
          .setValue('0')
          .onChange(value => {
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
    
    // 显示选项
    new Setting(contentEl)
      .setName('显示选项')
      .setDesc('选择要显示的八字信息')
      .addToggle(toggle => {
        toggle
          .setValue(true)
          .setTooltip('显示五行分析')
          .onChange(value => {
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
    
    // 关闭按钮
    new Setting(contentEl)
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
