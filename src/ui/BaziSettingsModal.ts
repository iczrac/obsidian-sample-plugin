import { App, Modal, Setting } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { BaziInfo } from 'src/types/BaziInfo';
import { DatePickerModal } from './DatePickerModal';

/**
 * 八字命盘设置模态框
 * 用于调整八字命盘的参数
 */
export class BaziSettingsModal extends Modal {
  private baziId: string;
  private currentDate: { year: number; month: number; day: number; hour: number };
  private onUpdate: (baziInfo: any) => void;
  private gender: string = ''; // 默认为空
  private calculationMethod: string = '0'; // 默认为传统排盘
  private baziSect: string = '2'; // 默认为流派2（晚子时日柱算当天）
  private showWuxing: boolean = true; // 默认显示五行分析
  private showSpecialInfo: boolean = true; // 默认显示特殊信息
  private showShenSha: {
    siZhu: boolean;
    daYun: boolean;
    liuNian: boolean;
    xiaoYun: boolean;
    liuYue: boolean;
  } = {
    siZhu: true,
    daYun: true,
    liuNian: true,
    xiaoYun: true,
    liuYue: true
  };

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
    onUpdate: (baziInfo: any) => void,
    baziInfo?: BaziInfo
  ) {
    super(app);
    this.baziId = baziId;
    this.currentDate = initialDate;
    this.onUpdate = onUpdate;

    // 如果有传入八字信息，从中获取设置
    if (baziInfo) {
      // 获取性别
      if (baziInfo.gender !== undefined) {
        this.gender = baziInfo.gender;
      }

      // 获取排盘方式
      if (baziInfo.calculationMethod !== undefined) {
        this.calculationMethod = baziInfo.calculationMethod;
      }

      // 获取八字流派
      if (baziInfo.baziSect !== undefined) {
        this.baziSect = baziInfo.baziSect;
      }

      // 获取显示选项
      if (baziInfo.showWuxing !== undefined) {
        this.showWuxing = baziInfo.showWuxing;
      }

      if (baziInfo.showSpecialInfo !== undefined) {
        this.showSpecialInfo = baziInfo.showSpecialInfo;
      }

      // 获取神煞显示设置
      if (baziInfo.showShenSha) {
        if (baziInfo.showShenSha.siZhu !== undefined) {
          this.showShenSha.siZhu = baziInfo.showShenSha.siZhu;
        }

        if (baziInfo.showShenSha.daYun !== undefined) {
          this.showShenSha.daYun = baziInfo.showShenSha.daYun;
        }

        if (baziInfo.showShenSha.liuNian !== undefined) {
          this.showShenSha.liuNian = baziInfo.showShenSha.liuNian;
        }

        if (baziInfo.showShenSha.xiaoYun !== undefined) {
          this.showShenSha.xiaoYun = baziInfo.showShenSha.xiaoYun;
        }

        if (baziInfo.showShenSha.liuYue !== undefined) {
          this.showShenSha.liuYue = baziInfo.showShenSha.liuYue;
        }
      }
    }
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

              // 获取原始八字信息
              const originalBaziInfo = BaziService.getBaziFromDate(
                this.currentDate.year - 60, // 使用原始年份获取八字
                this.currentDate.month,
                this.currentDate.day,
                this.currentDate.hour
              );

              // 创建新的八字信息对象，保持八字不变，只更新日期
              const baziInfo = {
                ...originalBaziInfo,
                solarDate: `${this.currentDate.year}-${this.currentDate.month.toString().padStart(2, '0')}-${this.currentDate.day.toString().padStart(2, '0')}`,
                solarTime: `${this.currentDate.hour.toString().padStart(2, '0')}:0`,
                // 更新农历日期（简化处理，实际应该通过lunar-typescript库计算）
                lunarDate: (originalBaziInfo.lunarDate || '').replace(/\d{4}/, this.currentDate.year.toString()),
                // 保存原始日期信息
                originalDate: {
                  year: this.currentDate.year,
                  month: this.currentDate.month,
                  day: this.currentDate.day,
                  hour: this.currentDate.hour
                }
              };

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
          .addOption('', '请选择')
          .addOption('1', '男')
          .addOption('0', '女')
          .setValue(this.gender)
          .onChange(value => {
            this.gender = value;

            // 获取当前八字信息
            const tempBaziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            // 获取原始八字
            const yearPillar = tempBaziInfo.yearPillar;
            const monthPillar = tempBaziInfo.monthPillar;
            const dayPillar = tempBaziInfo.dayPillar;
            const hourPillar = tempBaziInfo.hourPillar;

            // 构建八字字符串
            const baziString = `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`;

            // 解析八字字符串，保持八字不变
            const baziInfo = BaziService.parseBaziString(baziString);

            // 更新日期信息
            baziInfo.solarDate = `${this.currentDate.year}-${this.currentDate.month.toString().padStart(2, '0')}-${this.currentDate.day.toString().padStart(2, '0')}`;
            baziInfo.solarTime = `${this.currentDate.hour}:0`;

            // 添加显示选项
            baziInfo.showWuxing = this.showWuxing;
            baziInfo.showSpecialInfo = this.showSpecialInfo;
            baziInfo.gender = this.gender;
            baziInfo.calculationMethod = this.calculationMethod;

            // 添加原始日期信息
            baziInfo.originalDate = {
              year: this.currentDate.year,
              month: this.currentDate.month,
              day: this.currentDate.day,
              hour: this.currentDate.hour
            };

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

            // 获取当前八字信息
            const tempBaziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            // 获取原始八字
            const yearPillar = tempBaziInfo.yearPillar;
            const monthPillar = tempBaziInfo.monthPillar;
            const dayPillar = tempBaziInfo.dayPillar;
            const hourPillar = tempBaziInfo.hourPillar;

            // 构建八字字符串
            const baziString = `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`;

            // 解析八字字符串，保持八字不变
            const baziInfo = BaziService.parseBaziString(baziString);

            // 更新日期信息
            baziInfo.solarDate = `${this.currentDate.year}-${this.currentDate.month.toString().padStart(2, '0')}-${this.currentDate.day.toString().padStart(2, '0')}`;
            baziInfo.solarTime = `${this.currentDate.hour}:0`;

            // 添加显示选项
            baziInfo.showWuxing = this.showWuxing;
            baziInfo.showSpecialInfo = this.showSpecialInfo;
            baziInfo.gender = this.gender;
            baziInfo.calculationMethod = this.calculationMethod;

            // 添加神煞显示设置
            baziInfo.showShenSha = {
              siZhu: this.showShenSha.siZhu,
              daYun: this.showShenSha.daYun,
              liuNian: this.showShenSha.liuNian,
              xiaoYun: this.showShenSha.xiaoYun,
              liuYue: this.showShenSha.liuYue
            };

            // 添加原始日期信息
            baziInfo.originalDate = {
              year: this.currentDate.year,
              month: this.currentDate.month,
              day: this.currentDate.day,
              hour: this.currentDate.hour
            };

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

    // 神煞显示设置
    contentEl.createEl('h3', { text: '神煞显示设置', cls: 'bazi-settings-subtitle' });

    // 四柱神煞显示设置
    new Setting(contentEl)
      .setName('显示四柱神煞')
      .setDesc('是否在四柱表格中显示神煞行')
      .addToggle(toggle => {
        toggle
          .setValue(this.showShenSha.siZhu)
          .onChange(value => {
            this.showShenSha.siZhu = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              // 调试信息
              console.log('切换四柱神煞显示状态:', value);

              // 查找四柱神煞行
              const siZhuShenShaRow = element.querySelector('.bazi-view-table tbody tr:nth-child(5)');
              console.log('四柱神煞行元素:', siZhuShenShaRow);
              if (siZhuShenShaRow) {
                if (value) {
                  (siZhuShenShaRow as HTMLElement).style.display = '';
                } else {
                  (siZhuShenShaRow as HTMLElement).style.display = 'none';
                }
              }
            }
          });
      });

    // 大运神煞显示设置
    new Setting(contentEl)
      .setName('显示大运神煞')
      .setDesc('是否在大运表格中显示神煞行')
      .addToggle(toggle => {
        toggle
          .setValue(this.showShenSha.daYun)
          .onChange(value => {
            this.showShenSha.daYun = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              // 调试信息
              console.log('切换大运神煞显示状态:', value);

              // 查找大运神煞行
              const daYunShenShaRow = element.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
              console.log('大运神煞行元素:', daYunShenShaRow);
              if (daYunShenShaRow) {
                if (value) {
                  (daYunShenShaRow as HTMLElement).style.display = '';
                } else {
                  (daYunShenShaRow as HTMLElement).style.display = 'none';
                }
              }
            }
          });
      });

    // 流年神煞显示设置
    new Setting(contentEl)
      .setName('显示流年神煞')
      .setDesc('是否在流年表格中显示神煞行')
      .addToggle(toggle => {
        toggle
          .setValue(this.showShenSha.liuNian)
          .onChange(value => {
            this.showShenSha.liuNian = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              // 调试信息
              console.log('切换流年神煞显示状态:', value);

              // 查找流年神煞行
              const liuNianShenShaRow = element.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
              console.log('流年神煞行元素:', liuNianShenShaRow);
              if (liuNianShenShaRow) {
                if (value) {
                  (liuNianShenShaRow as HTMLElement).style.display = '';
                } else {
                  (liuNianShenShaRow as HTMLElement).style.display = 'none';
                }
              }
            }
          });
      });

    // 小运神煞显示设置
    new Setting(contentEl)
      .setName('显示小运神煞')
      .setDesc('是否在小运表格中显示神煞行')
      .addToggle(toggle => {
        toggle
          .setValue(this.showShenSha.xiaoYun)
          .onChange(value => {
            this.showShenSha.xiaoYun = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              // 调试信息
              console.log('切换小运神煞显示状态:', value);

              // 查找小运神煞行
              const xiaoYunShenShaRow = element.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
              console.log('小运神煞行元素:', xiaoYunShenShaRow);
              if (xiaoYunShenShaRow) {
                if (value) {
                  (xiaoYunShenShaRow as HTMLElement).style.display = '';
                } else {
                  (xiaoYunShenShaRow as HTMLElement).style.display = 'none';
                }
              }
            }
          });
      });

    // 流月神煞显示设置
    new Setting(contentEl)
      .setName('显示流月神煞')
      .setDesc('是否在流月表格中显示神煞行')
      .addToggle(toggle => {
        toggle
          .setValue(this.showShenSha.liuYue)
          .onChange(value => {
            this.showShenSha.liuYue = value;

            // 更新显示选项
            const element = document.getElementById(this.baziId);
            if (element) {
              // 调试信息
              console.log('切换流月神煞显示状态:', value);

              // 查找流月神煞行
              const liuYueShenShaRow = element.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
              console.log('流月神煞行元素:', liuYueShenShaRow);
              if (liuYueShenShaRow) {
                if (value) {
                  (liuYueShenShaRow as HTMLElement).style.display = '';
                } else {
                  (liuYueShenShaRow as HTMLElement).style.display = 'none';
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
            // 获取当前八字信息
            const tempBaziInfo = BaziService.getBaziFromDate(
              this.currentDate.year,
              this.currentDate.month,
              this.currentDate.day,
              this.currentDate.hour
            );

            // 获取原始八字
            const yearPillar = tempBaziInfo.yearPillar;
            const monthPillar = tempBaziInfo.monthPillar;
            const dayPillar = tempBaziInfo.dayPillar;
            const hourPillar = tempBaziInfo.hourPillar;

            // 构建八字字符串
            const baziString = `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`;

            // 解析八字字符串，保持八字不变
            const baziInfo = BaziService.parseBaziString(baziString);

            // 更新日期信息
            baziInfo.solarDate = `${this.currentDate.year}-${this.currentDate.month.toString().padStart(2, '0')}-${this.currentDate.day.toString().padStart(2, '0')}`;
            baziInfo.solarTime = `${this.currentDate.hour}:0`;

            // 添加显示选项
            baziInfo.showWuxing = this.showWuxing;
            baziInfo.showSpecialInfo = this.showSpecialInfo;
            baziInfo.gender = this.gender;
            baziInfo.calculationMethod = this.calculationMethod;

            // 添加神煞显示设置
            baziInfo.showShenSha = {
              siZhu: this.showShenSha.siZhu,
              daYun: this.showShenSha.daYun,
              liuNian: this.showShenSha.liuNian,
              xiaoYun: this.showShenSha.xiaoYun,
              liuYue: this.showShenSha.liuYue
            };

            // 添加原始日期信息
            baziInfo.originalDate = {
              year: this.currentDate.year,
              month: this.currentDate.month,
              day: this.currentDate.day,
              hour: this.currentDate.hour
            };

            console.log('应用更改，更新八字信息:', baziInfo);

            // 延迟更新，确保DOM更新完成
            setTimeout(() => {
              this.onUpdate(baziInfo);

              // 再次延迟关闭，确保更新完成
              setTimeout(() => {
                this.close();
              }, 800);
            }, 200);
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
