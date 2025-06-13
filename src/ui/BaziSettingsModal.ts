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
  private gender = ''; // 默认为空
  private calculationMethod = '0'; // 默认为传统排盘
  private baziSect = '2'; // 默认为流派2（晚子时日柱算当天）
  private showWuxing = true; // 默认显示五行分析
  private showSpecialInfo = true; // 默认显示特殊信息
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

    // 子时处理方式设置
    new Setting(contentEl)
      .setName('子时处理方式')
      .setDesc('选择子时的处理方式。流派1：晚子时（23-24点）日柱算明天；流派2：晚子时日柱算当天')
      .addDropdown(dropdown => {
        dropdown
          .addOption('1', '流派1（晚子时日柱算明天）')
          .addOption('2', '流派2（晚子时日柱算当天）')
          .setValue(this.baziSect)
          .onChange(value => {
            this.baziSect = value;
            this.calculationMethod = value === '1' ? '0' : '1'; // 同步更新
            console.log('切换子时处理方式:', value === '1' ? '流派1' : '流派2');

            // 重新渲染八字命盘以应用子时处理方式变化
            this.updateBaziWithCurrentSettings();
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
            console.log('切换四柱神煞显示状态:', value);

            // 重新渲染八字命盘以应用神煞设置变化
            this.updateBaziWithCurrentSettings();
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
            console.log('切换大运神煞显示状态:', value);

            // 重新渲染八字命盘以应用神煞设置变化
            this.updateBaziWithCurrentSettings();
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
            console.log('切换流年神煞显示状态:', value);

            // 重新渲染八字命盘以应用神煞设置变化
            this.updateBaziWithCurrentSettings();
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
            console.log('切换小运神煞显示状态:', value);

            // 重新渲染八字命盘以应用神煞设置变化
            this.updateBaziWithCurrentSettings();
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
            console.log('切换流月神煞显示状态:', value);

            // 重新渲染八字命盘以应用神煞设置变化
            this.updateBaziWithCurrentSettings();
          });
      });

    // 按钮区域
    const buttonContainer = contentEl.createDiv({ cls: 'bazi-settings-button-container' });

    // 关闭按钮
    new Setting(buttonContainer)
      .addButton(button => {
        button.setButtonText('关闭')
          .setCta()
          .onClick(() => {
            this.close();
          });
      });

    // 添加使用说明
    this.addUsageInstructions(contentEl);
  }

  /**
   * 使用当前设置更新八字命盘
   */
  private updateBaziWithCurrentSettings(): void {
    console.log('🎯 使用当前设置更新八字命盘');
    console.log('🎯 当前性别:', this.gender);
    console.log('🎯 当前神煞设置:', this.showShenSha);

    // 直接使用完整的八字信息生成方法，确保包含大运和流年
    // 传递性别和流派参数
    const baziInfo = BaziService.getBaziFromDate(
      this.currentDate.year,
      this.currentDate.month,
      this.currentDate.day,
      this.currentDate.hour,
      this.gender, // 传递性别参数
      this.baziSect // 传递流派参数
    );

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

    console.log('🎯 更新八字信息，包含大运:', !!baziInfo.daYun);
    console.log('🎯 更新八字信息，包含流年:', !!baziInfo.liuNian);
    console.log('🎯 更新八字信息，神煞设置:', baziInfo.showShenSha);

    // 立即更新八字命盘
    this.onUpdate(baziInfo);
  }

  /**
   * 添加使用说明
   */
  private addUsageInstructions(containerEl: HTMLElement): void {
    // 使用说明标题
    containerEl.createEl('h3', { text: '使用说明', cls: 'bazi-settings-subtitle' });

    // 说明内容
    const instructionsDiv = containerEl.createDiv({ cls: 'bazi-settings-instructions' });

    // 基本使用说明
    const basicSection = instructionsDiv.createDiv({ cls: 'bazi-instructions-section' });
    basicSection.createEl('h4', { text: '基本使用', cls: 'bazi-instructions-title' });

    const basicList = basicSection.createEl('ul', { cls: 'bazi-instructions-list' });
    basicList.createEl('li', { text: '点击右上角设置按钮可以调整八字命盘参数' });
    basicList.createEl('li', { text: '可以选择排盘方式，控制显示选项' });
    basicList.createEl('li', { text: '可以控制各种神煞的显示和隐藏' });
    basicList.createEl('li', { text: '所有设置修改后立即生效，无需额外操作' });

    // 子时处理方式说明
    const ziShiSection = instructionsDiv.createDiv({ cls: 'bazi-instructions-section' });
    ziShiSection.createEl('h4', { text: '子时处理方式说明', cls: 'bazi-instructions-title' });

    const ziShiList = ziShiSection.createEl('ul', { cls: 'bazi-instructions-list' });

    // 流派1说明
    const liupai1Li = ziShiList.createEl('li');
    liupai1Li.createEl('strong', { text: '流派1（晚子时日柱算明天）：' });
    liupai1Li.createSpan({ text: ' 晚子时（23:00-24:00）日柱算第二天。认为晚子时属于新的一天的开始。' });

    // 流派2说明
    const liupai2Li = ziShiList.createEl('li');
    liupai2Li.createEl('strong', { text: '流派2（晚子时日柱算当天）：' });
    liupai2Li.createSpan({ text: ' 晚子时（23:00-24:00）日柱算当天。认为晚子时仍属于当天。' });

    // 实例说明
    const exampleLi = ziShiList.createEl('li');
    exampleLi.createEl('strong', { text: '举例：' });
    exampleLi.createSpan({ text: ' 2024年1月1日晚上23:30出生，流派1会算作2024年1月2日子时，流派2会算作2024年1月1日子时。' });

    // 权威依据说明
    const authoritySection = instructionsDiv.createDiv({ cls: 'bazi-instructions-section' });
    authoritySection.createEl('h4', { text: '权威依据', cls: 'bazi-instructions-title' });

    const authorityList = authoritySection.createEl('ul', { cls: 'bazi-instructions-list' });

    const authority1Li = authorityList.createEl('li');
    authority1Li.createEl('strong', { text: '历史证据：' });
    authority1Li.createSpan({ text: ' 根据唐代李淳风与傅仁均的历法争论，子时处理方式是一个统一的概念，不存在"早子时"和"晚子时"的分别用于日常八字排盘。' });

    const authority2Li = authorityList.createEl('li');
    authority2Li.createEl('strong', { text: '学术共识：' });
    authority2Li.createSpan({ text: ' 权威学者认为，早晚子时的概念仅存在于历法计算的特殊规则设定中，而非日常八字排盘的标准。' });

    const authority3Li = authorityList.createEl('li');
    authority3Li.createEl('strong', { text: '实践应用：' });
    authority3Li.createSpan({ text: ' 在八字命理实践中，子时就是子时，23:00-01:00整个时段都是子时，日柱的确定有统一的标准。' });

    // 代码块使用说明
    const codeBlockSection = instructionsDiv.createDiv({ cls: 'bazi-instructions-section' });
    codeBlockSection.createEl('h4', { text: '代码块使用', cls: 'bazi-instructions-title' });

    const codeBlockList = codeBlockSection.createEl('ul', { cls: 'bazi-instructions-list' });
    codeBlockList.createEl('li', { text: '支持多种代码块格式，满足不同需求' });

    // 当前时间代码块
    const nowCodeBlock = this.createCodeBlockExample(
      codeBlockSection,
      '当前时间八字',
      '```bazi\nnow: true\n```',
      '显示当前时间的八字命盘'
    );

    // 指定日期代码块
    const dateCodeBlock = this.createCodeBlockExample(
      codeBlockSection,
      '指定日期八字',
      '```bazi\ndate: 1990-01-01 08:00\ngender: 1\n```',
      '显示指定日期时间的八字命盘，gender: 1为男性，0为女性'
    );

    // 纯八字代码块
    const baziCodeBlock = this.createCodeBlockExample(
      codeBlockSection,
      '纯八字代码块',
      '```bazi\nbazi: 庚午 戊子 甲寅 乙亥\nyear: 1990\ngender: 1\n```',
      '直接输入八字，可选择年份和性别'
    );

    // 无性别观察代码块
    const noGenderCodeBlock = this.createCodeBlockExample(
      codeBlockSection,
      '无性别观察',
      '```bazi\nnow: true\ngender: no\n```',
      '观察当前时间八字，不设置性别，不显示大运信息'
    );
  }

  /**
   * 创建代码块示例
   */
  private createCodeBlockExample(
    container: HTMLElement,
    title: string,
    code: string,
    description: string
  ): HTMLElement {
    const exampleDiv = container.createDiv({ cls: 'bazi-code-example' });

    // 标题
    exampleDiv.createEl('h5', { text: title, cls: 'bazi-code-example-title' });

    // 代码块容器
    const codeContainer = exampleDiv.createDiv({ cls: 'bazi-code-container' });

    // 代码内容
    const codeEl = codeContainer.createEl('pre', { cls: 'bazi-code-block' });
    codeEl.createEl('code', { text: code });

    // 复制按钮
    const copyButton = codeContainer.createEl('button', {
      text: '复制',
      cls: 'bazi-copy-button'
    });

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = '已复制';
        setTimeout(() => {
          copyButton.textContent = '复制';
        }, 2000);
      }).catch(err => {
        console.error('复制失败:', err);
        copyButton.textContent = '复制失败';
        setTimeout(() => {
          copyButton.textContent = '复制';
        }, 2000);
      });
    });

    // 描述
    exampleDiv.createEl('p', { text: description, cls: 'bazi-code-description' });

    return exampleDiv;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
