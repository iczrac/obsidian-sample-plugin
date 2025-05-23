import { Modal, Setting } from 'obsidian';
import { BaziService } from 'src/services/BaziService';
import { DatePickerModal } from './DatePickerModal';
/**
 * 八字命盘设置模态框
 * 用于调整八字命盘的参数
 */
export class BaziSettingsModal extends Modal {
    /**
     * 创建八字命盘设置模态框
     * @param app Obsidian应用实例
     * @param baziId 八字命盘ID
     * @param initialDate 初始日期
     * @param onUpdate 更新回调
     */
    constructor(app, baziId, initialDate, onUpdate, baziInfo) {
        super(app);
        this.gender = ''; // 默认为空
        this.calculationMethod = '0'; // 默认为传统排盘
        this.baziSect = '2'; // 默认为流派2（晚子时日柱算当天）
        this.showWuxing = true; // 默认显示五行分析
        this.showSpecialInfo = true; // 默认显示特殊信息
        this.showShenSha = {
            siZhu: true,
            daYun: true,
            liuNian: true,
            xiaoYun: true,
            liuYue: true
        };
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
            const options = {};
            for (let i = -5; i <= 5; i++) {
                if (i === 0)
                    continue; // 跳过当前年
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
                    const originalBaziInfo = BaziService.getBaziFromDate(this.currentDate.year - 60, // 使用原始年份获取八字
                    this.currentDate.month, this.currentDate.day, this.currentDate.hour);
                    // 创建新的八字信息对象，保持八字不变，只更新日期
                    const baziInfo = Object.assign(Object.assign({}, originalBaziInfo), { solarDate: `${this.currentDate.year}-${this.currentDate.month.toString().padStart(2, '0')}-${this.currentDate.day.toString().padStart(2, '0')}`, solarTime: `${this.currentDate.hour.toString().padStart(2, '0')}:0`, 
                        // 更新农历日期（简化处理，实际应该通过lunar-typescript库计算）
                        lunarDate: (originalBaziInfo.lunarDate || '').replace(/\d{4}/, this.currentDate.year.toString()), 
                        // 保存原始日期信息
                        originalDate: {
                            year: this.currentDate.year,
                            month: this.currentDate.month,
                            day: this.currentDate.day,
                            hour: this.currentDate.hour
                        } });
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
                    }
                    catch (error) {
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
                const tempBaziInfo = BaziService.getBaziFromDate(this.currentDate.year, this.currentDate.month, this.currentDate.day, this.currentDate.hour);
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
                const tempBaziInfo = BaziService.getBaziFromDate(this.currentDate.year, this.currentDate.month, this.currentDate.day, this.currentDate.hour);
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
                var _a;
                this.showWuxing = value;
                // 更新显示选项
                const element = document.getElementById(this.baziId);
                if (element) {
                    const wuxingSection = (_a = element.querySelector('.bazi-view-wuxing-list')) === null || _a === void 0 ? void 0 : _a.parentElement;
                    if (wuxingSection) {
                        if (value) {
                            wuxingSection.style.display = '';
                        }
                        else {
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
                var _a;
                this.showSpecialInfo = value;
                // 更新显示选项
                const element = document.getElementById(this.baziId);
                if (element) {
                    const specialInfoSection = (_a = element.querySelector('.bazi-view-info-list')) === null || _a === void 0 ? void 0 : _a.parentElement;
                    if (specialInfoSection) {
                        if (value) {
                            specialInfoSection.style.display = '';
                        }
                        else {
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
                    // 查找四柱神煞行 - 使用更精确的选择器
                    const siZhuShenShaRow = element.querySelector('.bazi-view-table tbody tr[data-row-type="shensha-row"]');
                    // 备用选择器
                    const backupSelector = element.querySelector('.bazi-view-table tbody tr:nth-child(5)');
                    console.log('四柱神煞行元素(精确选择器):', siZhuShenShaRow);
                    console.log('四柱神煞行元素(备用选择器):', backupSelector);
                    // 尝试使用精确选择器，如果找不到则使用备用选择器
                    const targetRow = siZhuShenShaRow || backupSelector;
                    if (targetRow) {
                        if (value) {
                            targetRow.style.display = '';
                        }
                        else {
                            targetRow.style.display = 'none';
                        }
                    }
                    else {
                        console.error('无法找到四柱神煞行元素');
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
                    // 查找大运神煞行 - 使用更精确的选择器
                    const daYunShenShaRow = element.querySelector('.bazi-view-dayun-table tr[data-row-type="shensha-row"]');
                    // 备用选择器
                    const backupSelector = element.querySelector('.bazi-view-dayun-table tr:nth-child(4)');
                    console.log('大运神煞行元素(精确选择器):', daYunShenShaRow);
                    console.log('大运神煞行元素(备用选择器):', backupSelector);
                    // 尝试使用精确选择器，如果找不到则使用备用选择器
                    const targetRow = daYunShenShaRow || backupSelector;
                    if (targetRow) {
                        if (value) {
                            targetRow.style.display = '';
                        }
                        else {
                            targetRow.style.display = 'none';
                        }
                    }
                    else {
                        console.error('无法找到大运神煞行元素');
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
                    // 查找流年神煞行 - 使用更精确的选择器
                    const liuNianShenShaRow = element.querySelector('.bazi-view-liunian-table tr[data-row-type="shensha-row"]');
                    // 备用选择器
                    const backupSelector = element.querySelector('.bazi-view-liunian-table tr:nth-child(4)');
                    console.log('流年神煞行元素(精确选择器):', liuNianShenShaRow);
                    console.log('流年神煞行元素(备用选择器):', backupSelector);
                    // 尝试使用精确选择器，如果找不到则使用备用选择器
                    const targetRow = liuNianShenShaRow || backupSelector;
                    if (targetRow) {
                        if (value) {
                            targetRow.style.display = '';
                        }
                        else {
                            targetRow.style.display = 'none';
                        }
                    }
                    else {
                        console.error('无法找到流年神煞行元素');
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
                    // 查找小运神煞行 - 使用更精确的选择器
                    const xiaoYunShenShaRow = element.querySelector('.bazi-view-xiaoyun-table tr[data-row-type="shensha-row"]');
                    // 备用选择器
                    const backupSelector = element.querySelector('.bazi-view-xiaoyun-table tr:nth-child(4)');
                    console.log('小运神煞行元素(精确选择器):', xiaoYunShenShaRow);
                    console.log('小运神煞行元素(备用选择器):', backupSelector);
                    // 尝试使用精确选择器，如果找不到则使用备用选择器
                    const targetRow = xiaoYunShenShaRow || backupSelector;
                    if (targetRow) {
                        if (value) {
                            targetRow.style.display = '';
                        }
                        else {
                            targetRow.style.display = 'none';
                        }
                    }
                    else {
                        console.error('无法找到小运神煞行元素');
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
                    // 查找流月神煞行 - 使用更精确的选择器
                    const liuYueShenShaRow = element.querySelector('.bazi-view-liuyue-table tr[data-row-type="shensha-row"]');
                    // 备用选择器
                    const backupSelector = element.querySelector('.bazi-view-liuyue-table tr:nth-child(3)');
                    console.log('流月神煞行元素(精确选择器):', liuYueShenShaRow);
                    console.log('流月神煞行元素(备用选择器):', backupSelector);
                    // 尝试使用精确选择器，如果找不到则使用备用选择器
                    const targetRow = liuYueShenShaRow || backupSelector;
                    if (targetRow) {
                        if (value) {
                            targetRow.style.display = '';
                        }
                        else {
                            targetRow.style.display = 'none';
                        }
                    }
                    else {
                        console.error('无法找到流月神煞行元素');
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
                const tempBaziInfo = BaziService.getBaziFromDate(this.currentDate.year, this.currentDate.month, this.currentDate.day, this.currentDate.hour);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVNldHRpbmdzTW9kYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppU2V0dGluZ3NNb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQU8sS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxLQUFLO0lBdUIxQzs7Ozs7O09BTUc7SUFDSCxZQUNFLEdBQVEsRUFDUixNQUFjLEVBQ2QsV0FBdUUsRUFDdkUsUUFBaUMsRUFDakMsUUFBbUI7UUFFbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBakNMLFdBQU0sR0FBVyxFQUFFLENBQUMsQ0FBQyxPQUFPO1FBQzVCLHNCQUFpQixHQUFXLEdBQUcsQ0FBQyxDQUFDLFVBQVU7UUFDM0MsYUFBUSxHQUFXLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQjtRQUMzQyxlQUFVLEdBQVksSUFBSSxDQUFDLENBQUMsV0FBVztRQUN2QyxvQkFBZSxHQUFZLElBQUksQ0FBQyxDQUFDLFdBQVc7UUFDNUMsZ0JBQVcsR0FNZjtZQUNGLEtBQUssRUFBRSxJQUFJO1lBQ1gsS0FBSyxFQUFFLElBQUk7WUFDWCxPQUFPLEVBQUUsSUFBSTtZQUNiLE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDO1FBaUJBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLG1CQUFtQjtRQUNuQixJQUFJLFFBQVEsRUFBRTtZQUNaLE9BQU87WUFDUCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUss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aUJBQ2hDLENBQUM7Z0JBRUYsV0FBVztnQkFDWCxRQUFRLENBQUMsWUFBWSxHQUFHO29CQUN0QixJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO29CQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLO29CQUM3QixHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHO29CQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO2lCQUM1QixDQUFDO2dCQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUV0QyxpQkFBaUI7Z0JBQ2pCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFeEIsZ0JBQWdCO29CQUNoQixVQUFVLENBQUMsR0FBRyxFQUFFO3dCQUNkLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDZixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUM7WUFDRixPQUFPO2FBQ04sU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUN2QixPQUFPLENBQUMsR0FBRyxFQUFFO2dCQUNaLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDM0IsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgTW9kYWwsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBCYXppU2VydmljZSB9IGZyb20gJ3NyYy9zZXJ2aWNlcy9CYXppU2VydmljZSc7XG5pbXBvcnQgeyBCYXppSW5mbyB9IGZyb20gJ3NyYy90eXBlcy9CYXppSW5mbyc7XG5pbXBvcnQgeyBEYXRlUGlja2VyTW9kYWwgfSBmcm9tICcuL0RhdGVQaWNrZXJNb2RhbCc7XG5cbi8qKlxuICog5YWr5a2X5ZG955uY6K6+572u5qih5oCB5qGGXG4gKiDnlKjkuo7osIPmlbTlhavlrZflkb3nm5jnmoTlj4LmlbBcbiAqL1xuZXhwb3J0IGNsYXNzIEJhemlTZXR0aW5nc01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIGJhemlJZDogc3RyaW5nO1xuICBwcml2YXRlIGN1cnJlbnREYXRlOiB7IHllYXI6IG51bWJlcjsgbW9udGg6IG51bWJlcjsgZGF5OiBudW1iZXI7IGhvdXI6IG51bWJlciB9O1xuICBwcml2YXRlIG9uVXBkYXRlOiAoYmF6aUluZm86IGFueSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBnZW5kZXI6IHN0cmluZyA9ICcnOyAvLyDpu5jorqTkuLrnqbpcbiAgcHJpdmF0ZSBjYWxjdWxhdGlvbk1ldGhvZDogc3RyaW5nID0gJzAnOyAvLyDpu5jorqTkuLrkvKDnu5/mjpLnm5hcbiAgcHJpdmF0ZSBiYXppU2VjdDogc3RyaW5nID0gJzInOyAvLyDpu5jorqTkuLrmtYHmtL4y77yI5pma5a2Q5pe25pel5p+x566X5b2T5aSp77yJXG4gIHByaXZhdGUgc2hvd1d1eGluZzogYm9vbGVhbiA9IHRydWU7IC8vIOm7mOiupOaYvuekuuS6lOihjOWIhuaekFxuICBwcml2YXRlIHNob3dTcGVjaWFsSW5mbzogYm9vbGVhbiA9IHRydWU7IC8vIOm7mOiupOaYvuekuueJueauiuS/oeaBr1xuICBwcml2YXRlIHNob3dTaGVuU2hhOiB7XG4gICAgc2laaHU6IGJvb2xlYW47XG4gICAgZGFZdW46IGJvb2xlYW47XG4gICAgbGl1TmlhbjogYm9vbGVhbjtcbiAgICB4aWFvWXVuOiBib29sZWFuO1xuICAgIGxpdVl1ZTogYm9vbGVhbjtcbiAgfSA9IHtcbiAgICBzaVpodTogdHJ1ZSxcbiAgICBkYVl1bjogdHJ1ZSxcbiAgICBsaXVOaWFuOiB0cnVlLFxuICAgIHhpYW9ZdW46IHRydWUsXG4gICAgbGl1WXVlOiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIOWIm+W7uuWFq+Wtl+WRveebmOiuvue9ruaooeaAgeahhlxuICAgKiBAcGFyYW0gYXBwIE9ic2lkaWFu5bqU55So5a6e5L6LXG4gICAqIEBwYXJhbSBiYXppSWQg5YWr5a2X5ZG955uYSURcbiAgICogQHBhcmFtIGluaXRpYWxEYXRlIOWIneWni+aXpeacn1xuICAgKiBAcGFyYW0gb25VcGRhdGUg5pu05paw5Zue6LCDXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBiYXppSWQ6IHN0cmluZyxcbiAgICBpbml0aWFsRGF0ZTogeyB5ZWFyOiBudW1iZXI7IG1vbnRoOiBudW1iZXI7IGRheTogbnVtYmVyOyBob3VyOiBudW1iZXIgfSxcbiAgICBvblVwZGF0ZTogKGJhemlJbmZvOiBhbnkpID0+IHZvaWQsXG4gICAgYmF6aUluZm8/OiBCYXppSW5mb1xuICApIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuYmF6aUlkID0gYmF6aUlkO1xuICAgIHRoaXMuY3VycmVudERhdGUgPSBpbml0aWFsRGF0ZTtcbiAgICB0aGlzLm9uVXBkYXRlID0gb25VcGRhdGU7XG5cbiAgICAvLyDlpoLmnpzmnInkvKDlhaXlhavlrZfkv6Hmga/vvIzku47kuK3ojrflj5borr7nva5cbiAgICBpZiAoYmF6aUluZm8pIHtcbiAgICAgIC8vIOiOt+WPluaAp+WIq1xuICAgICAgaWYgKGJhemlJbmZvLmdlbmRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuZ2VuZGVyID0gYmF6aUluZm8uZ2VuZGVyO1xuICAgICAgfVxuXG4gICAgICAvLyDojrflj5bmjpLnm5jmlrnlvI9cbiAgICAgIGlmIChiYXppSW5mby5jYWxjdWxhdGlvbk1ldGhvZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRpb25NZXRob2QgPSBiYXppSW5mby5jYWxjdWxhdGlvbk1ldGhvZDtcbiAgICAgIH1cblxuICAgICAgLy8g6I635Y+W5YWr5a2X5rWB5rS+XG4gICAgICBpZiAoYmF6aUluZm8uYmF6aVNlY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmJhemlTZWN0ID0gYmF6aUluZm8uYmF6aVNlY3Q7XG4gICAgICB9XG5cbiAgICAgIC8vIOiOt+WPluaYvuekuumAiemhuVxuICAgICAgaWYgKGJhemlJbmZvLnNob3dXdXhpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnNob3dXdXhpbmcgPSBiYXppSW5mby5zaG93V3V4aW5nO1xuICAgICAgfVxuXG4gICAgICBpZiAoYmF6aUluZm8uc2hvd1NwZWNpYWxJbmZvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zaG93U3BlY2lhbEluZm8gPSBiYXppSW5mby5zaG93U3BlY2lhbEluZm87XG4gICAgICB9XG5cbiAgICAgIC8vIOiOt+WPluelnueFnuaYvuekuuiuvue9rlxuICAgICAgaWYgKGJhemlJbmZvLnNob3dTaGVuU2hhKSB7XG4gICAgICAgIGlmIChiYXppSW5mby5zaG93U2hlblNoYS5zaVpodSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zaG93U2hlblNoYS5zaVpodSA9IGJhemlJbmZvLnNob3dTaGVuU2hhLnNpWmh1O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJhemlJbmZvLnNob3dTaGVuU2hhLmRhWXVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhLmRhWXVuID0gYmF6aUluZm8uc2hvd1NoZW5TaGEuZGFZdW47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmF6aUluZm8uc2hvd1NoZW5TaGEubGl1TmlhbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zaG93U2hlblNoYS5saXVOaWFuID0gYmF6aUluZm8uc2hvd1NoZW5TaGEubGl1TmlhbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYXppSW5mby5zaG93U2hlblNoYS54aWFvWXVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhLnhpYW9ZdW4gPSBiYXppSW5mby5zaG93U2hlblNoYS54aWFvWXVuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJhemlJbmZvLnNob3dTaGVuU2hhLmxpdVl1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zaG93U2hlblNoYS5saXVZdWUgPSBiYXppSW5mby5zaG93U2hlblNoYS5saXVZdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAn5YWr5a2X5ZG955uY6K6+572uJyB9KTtcblxuICAgIC8vIOW9k+WJjeaXpeacn+S/oeaBr+aYvuekulxuICAgIGNvbnN0IGRhdGVJbmZvRGl2ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2Jhemktc2V0dGluZ3MtZGF0ZS1pbmZvJyB9KTtcbiAgICBkYXRlSW5mb0Rpdi5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6IGDlvZPliY3ml6XmnJ/vvJoke3RoaXMuY3VycmVudERhdGUueWVhcn3lubQke3RoaXMuY3VycmVudERhdGUubW9udGh95pyIJHt0aGlzLmN1cnJlbnREYXRlLmRheX3ml6UgJHt0aGlzLmN1cnJlbnREYXRlLmhvdXJ95pe2YCxcbiAgICAgIGNsczogJ2Jhemktc2V0dGluZ3MtaW5mby10ZXh0J1xuICAgIH0pO1xuXG4gICAgLy8g5pel5pyf5ZKM5pe26Ze06K6+572uXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+S/ruaUueaXpeacn+WSjOaXtumXtCcpXG4gICAgICAuc2V0RGVzYygn6YCJ5oup5paw55qE5pel5pyf5ZKM5pe26Ze05p2l6YeN5paw6K6h566X5YWr5a2XJylcbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ+mAieaLqeaXpeacn+WSjOaXtumXtCcpXG4gICAgICAgICAgLnNldEN0YSgpXG4gICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgLy8g5YWz6Zet5b2T5YmN5qih5oCB5qGGXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG5cbiAgICAgICAgICAgIC8vIOaJk+W8gOaXpeacn+mAieaLqeaooeaAgeahhlxuICAgICAgICAgICAgY29uc3QgZGF0ZVBpY2tlck1vZGFsID0gbmV3IERhdGVQaWNrZXJNb2RhbCh0aGlzLmFwcCwgKGJhemlJbmZvKSA9PiB7XG4gICAgICAgICAgICAgIC8vIOabtOaWsOWFq+Wtl+WRveebmFxuICAgICAgICAgICAgICB0aGlzLm9uVXBkYXRlKGJhemlJbmZvKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0ZVBpY2tlck1vZGFsLm9wZW4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgLy8g5bm05Lu95b6u6LCDXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+iwg+aVtOW5tOS7vScpXG4gICAgICAuc2V0RGVzYygn5b6u6LCD5bm05Lu977yM5L+d5oyB5aSp5bmy5Zyw5pSv5LiN5Y+YJylcbiAgICAgIC5hZGREcm9wZG93bihkcm9wZG93biA9PiB7XG4gICAgICAgIC8vIOa3u+WKoDYw5bm05LiA5Liq55Sy5a2Q5ZGo5pyf55qE6YCJ6aG5XG4gICAgICAgIGNvbnN0IGN1cnJlbnRZZWFyID0gdGhpcy5jdXJyZW50RGF0ZS55ZWFyO1xuICAgICAgICBjb25zdCBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IC01OyBpIDw9IDU7IGkrKykge1xuICAgICAgICAgIGlmIChpID09PSAwKSBjb250aW51ZTsgLy8g6Lez6L+H5b2T5YmN5bm0XG4gICAgICAgICAgY29uc3QgeWVhciA9IGN1cnJlbnRZZWFyICsgaSAqIDYwO1xuICAgICAgICAgIGlmICh5ZWFyID4gMCAmJiB5ZWFyIDwgMjEwMCkgeyAvLyDpmZDliLblkIjnkIbojIPlm7RcbiAgICAgICAgICAgIG9wdGlvbnNbeWVhci50b1N0cmluZygpXSA9IGAke3llYXJ95bm0ICgke2kgPiAwID8gJysnIDogJyd9JHtpfeeUsuWtkClgO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbnMob3B0aW9ucylcbiAgICAgICAgICAuc2V0VmFsdWUoY3VycmVudFllYXIudG9TdHJpbmcoKSlcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3WWVhciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChuZXdZZWFyICYmIG5ld1llYXIgIT09IHRoaXMuY3VycmVudERhdGUueWVhcikge1xuICAgICAgICAgICAgICAvLyDmm7TmlrDlubTku71cbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS55ZWFyID0gbmV3WWVhcjtcblxuICAgICAgICAgICAgICAvLyDojrflj5bljp/lp4vlhavlrZfkv6Hmga9cbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxCYXppSW5mbyA9IEJhemlTZXJ2aWNlLmdldEJhemlGcm9tRGF0ZShcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLnllYXIgLSA2MCwgLy8g5L2/55So5Y6f5aeL5bm05Lu96I635Y+W5YWr5a2XXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmRheSxcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAvLyDliJvlu7rmlrDnmoTlhavlrZfkv6Hmga/lr7nosaHvvIzkv53mjIHlhavlrZfkuI3lj5jvvIzlj6rmm7TmlrDml6XmnJ9cbiAgICAgICAgICAgICAgY29uc3QgYmF6aUluZm8gPSB7XG4gICAgICAgICAgICAgICAgLi4ub3JpZ2luYWxCYXppSW5mbyxcbiAgICAgICAgICAgICAgICBzb2xhckRhdGU6IGAke3RoaXMuY3VycmVudERhdGUueWVhcn0tJHt0aGlzLmN1cnJlbnREYXRlLm1vbnRoLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHt0aGlzLmN1cnJlbnREYXRlLmRheS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YCxcbiAgICAgICAgICAgICAgICBzb2xhclRpbWU6IGAke3RoaXMuY3VycmVudERhdGUuaG91ci50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OjBgLFxuICAgICAgICAgICAgICAgIC8vIOabtOaWsOWGnOWOhuaXpeacn++8iOeugOWMluWkhOeQhu+8jOWunumZheW6lOivpemAmui/h2x1bmFyLXR5cGVzY3JpcHTlupPorqHnrpfvvIlcbiAgICAgICAgICAgICAgICBsdW5hckRhdGU6IChvcmlnaW5hbEJhemlJbmZvLmx1bmFyRGF0ZSB8fCAnJykucmVwbGFjZSgvXFxkezR9LywgdGhpcy5jdXJyZW50RGF0ZS55ZWFyLnRvU3RyaW5nKCkpLFxuICAgICAgICAgICAgICAgIC8vIOS/neWtmOWOn+Wni+aXpeacn+S/oeaBr1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRGF0ZToge1xuICAgICAgICAgICAgICAgICAgeWVhcjogdGhpcy5jdXJyZW50RGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgICAgbW9udGg6IHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgICBkYXk6IHRoaXMuY3VycmVudERhdGUuZGF5LFxuICAgICAgICAgICAgICAgICAgaG91cjogdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIOabtOaWsOWFq+Wtl+WRveebmFxuICAgICAgICAgICAgICB0aGlzLm9uVXBkYXRlKGJhemlJbmZvKTtcblxuICAgICAgICAgICAgICAvLyDmm7TmlrDml6XmnJ/kv6Hmga/mmL7npLpcbiAgICAgICAgICAgICAgZGF0ZUluZm9EaXYuZW1wdHkoKTtcbiAgICAgICAgICAgICAgZGF0ZUluZm9EaXYuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICAgICAgICAgICAgdGV4dDogYOW9k+WJjeaXpeacn++8miR7dGhpcy5jdXJyZW50RGF0ZS55ZWFyfeW5tCR7dGhpcy5jdXJyZW50RGF0ZS5tb250aH3mnIgke3RoaXMuY3VycmVudERhdGUuZGF5feaXpSAke3RoaXMuY3VycmVudERhdGUuaG91cn3ml7ZgLFxuICAgICAgICAgICAgICAgIGNsczogJ2Jhemktc2V0dGluZ3MtaW5mby10ZXh0J1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgLy8g55u05o6l6L6T5YWl5YWr5a2XXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+ebtOaOpei+k+WFpeWFq+WtlycpXG4gICAgICAuc2V0RGVzYygn6L6T5YWl5a6M5pW05YWr5a2X77yM5qC85byP5aaCXCLnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja9cIicpXG4gICAgICAuYWRkVGV4dCh0ZXh0ID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcign55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vJylcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLnRyaW0oKS5zcGxpdCgnICcpLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOino+aekOWFq+Wtl1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhemlJbmZvID0gQmF6aVNlcnZpY2UucGFyc2VCYXppU3RyaW5nKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIC8vIOabtOaWsOWFq+Wtl+WRveebmFxuICAgICAgICAgICAgICAgIHRoaXMub25VcGRhdGUoYmF6aUluZm8pO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+ino+aekOWFq+Wtl+WHuumUmTonLCBlcnJvcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgLy8g5oCn5Yir6K6+572u77yI55So5LqO5aSn6L+Q6K6h566X77yJXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+aAp+WIqycpXG4gICAgICAuc2V0RGVzYygn6YCJ5oup5oCn5Yir77yM55So5LqO5aSn6L+Q6K6h566XJylcbiAgICAgIC5hZGREcm9wZG93bihkcm9wZG93biA9PiB7XG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbignJywgJ+ivt+mAieaLqScpXG4gICAgICAgICAgLmFkZE9wdGlvbignMScsICfnlLcnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJzAnLCAn5aWzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5nZW5kZXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2VuZGVyID0gdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeWFq+Wtl+S/oeaBr1xuICAgICAgICAgICAgY29uc3QgdGVtcEJhemlJbmZvID0gQmF6aVNlcnZpY2UuZ2V0QmF6aUZyb21EYXRlKFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLnllYXIsXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUuZGF5LFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluWOn+Wni+WFq+Wtl1xuICAgICAgICAgICAgY29uc3QgeWVhclBpbGxhciA9IHRlbXBCYXppSW5mby55ZWFyUGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgbW9udGhQaWxsYXIgPSB0ZW1wQmF6aUluZm8ubW9udGhQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBkYXlQaWxsYXIgPSB0ZW1wQmF6aUluZm8uZGF5UGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgaG91clBpbGxhciA9IHRlbXBCYXppSW5mby5ob3VyUGlsbGFyO1xuXG4gICAgICAgICAgICAvLyDmnoTlu7rlhavlrZflrZfnrKbkuLJcbiAgICAgICAgICAgIGNvbnN0IGJhemlTdHJpbmcgPSBgJHt5ZWFyUGlsbGFyfSAke21vbnRoUGlsbGFyfSAke2RheVBpbGxhcn0gJHtob3VyUGlsbGFyfWA7XG5cbiAgICAgICAgICAgIC8vIOino+aekOWFq+Wtl+Wtl+espuS4su+8jOS/neaMgeWFq+Wtl+S4jeWPmFxuICAgICAgICAgICAgY29uc3QgYmF6aUluZm8gPSBCYXppU2VydmljZS5wYXJzZUJhemlTdHJpbmcoYmF6aVN0cmluZyk7XG5cbiAgICAgICAgICAgIC8vIOabtOaWsOaXpeacn+S/oeaBr1xuICAgICAgICAgICAgYmF6aUluZm8uc29sYXJEYXRlID0gYCR7dGhpcy5jdXJyZW50RGF0ZS55ZWFyfS0ke3RoaXMuY3VycmVudERhdGUubW9udGgudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfS0ke3RoaXMuY3VycmVudERhdGUuZGF5LnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICAgICAgICAgICAgYmF6aUluZm8uc29sYXJUaW1lID0gYCR7dGhpcy5jdXJyZW50RGF0ZS5ob3VyfTowYDtcblxuICAgICAgICAgICAgLy8g5re75Yqg5pi+56S66YCJ6aG5XG4gICAgICAgICAgICBiYXppSW5mby5zaG93V3V4aW5nID0gdGhpcy5zaG93V3V4aW5nO1xuICAgICAgICAgICAgYmF6aUluZm8uc2hvd1NwZWNpYWxJbmZvID0gdGhpcy5zaG93U3BlY2lhbEluZm87XG4gICAgICAgICAgICBiYXppSW5mby5nZW5kZXIgPSB0aGlzLmdlbmRlcjtcbiAgICAgICAgICAgIGJhemlJbmZvLmNhbGN1bGF0aW9uTWV0aG9kID0gdGhpcy5jYWxjdWxhdGlvbk1ldGhvZDtcblxuICAgICAgICAgICAgLy8g5re75Yqg5Y6f5aeL5pel5pyf5L+h5oGvXG4gICAgICAgICAgICBiYXppSW5mby5vcmlnaW5hbERhdGUgPSB7XG4gICAgICAgICAgICAgIHllYXI6IHRoaXMuY3VycmVudERhdGUueWVhcixcbiAgICAgICAgICAgICAgbW9udGg6IHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgIGRheTogdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgIGhvdXI6IHRoaXMuY3VycmVudERhdGUuaG91clxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gVE9ETzog6K6+572u5oCn5Yir5bm26YeN5paw6K6h566X5aSn6L+QXG5cbiAgICAgICAgICAgIHRoaXMub25VcGRhdGUoYmF6aUluZm8pO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmjpLnm5jmlrnlvI/orr7nva5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5o6S55uY5pa55byPJylcbiAgICAgIC5zZXREZXNjKCfpgInmi6nlhavlrZfmjpLnm5jnmoTorqHnrpfmlrnlvI8nKVxuICAgICAgLmFkZERyb3Bkb3duKGRyb3Bkb3duID0+IHtcbiAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAuYWRkT3B0aW9uKCcwJywgJ+S8oOe7n+aOkuebmCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignMScsICfmlrDmtL7mjpLnm5gnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmNhbGN1bGF0aW9uTWV0aG9kKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0aW9uTWV0aG9kID0gdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeWFq+Wtl+S/oeaBr1xuICAgICAgICAgICAgY29uc3QgdGVtcEJhemlJbmZvID0gQmF6aVNlcnZpY2UuZ2V0QmF6aUZyb21EYXRlKFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLnllYXIsXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUuZGF5LFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluWOn+Wni+WFq+Wtl1xuICAgICAgICAgICAgY29uc3QgeWVhclBpbGxhciA9IHRlbXBCYXppSW5mby55ZWFyUGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgbW9udGhQaWxsYXIgPSB0ZW1wQmF6aUluZm8ubW9udGhQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBkYXlQaWxsYXIgPSB0ZW1wQmF6aUluZm8uZGF5UGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgaG91clBpbGxhciA9IHRlbXBCYXppSW5mby5ob3VyUGlsbGFyO1xuXG4gICAgICAgICAgICAvLyDmnoTlu7rlhavlrZflrZfnrKbkuLJcbiAgICAgICAgICAgIGNvbnN0IGJhemlTdHJpbmcgPSBgJHt5ZWFyUGlsbGFyfSAke21vbnRoUGlsbGFyfSAke2RheVBpbGxhcn0gJHtob3VyUGlsbGFyfWA7XG5cbiAgICAgICAgICAgIC8vIOino+aekOWFq+Wtl+Wtl+espuS4su+8jOS/neaMgeWFq+Wtl+S4jeWPmFxuICAgICAgICAgICAgY29uc3QgYmF6aUluZm8gPSBCYXppU2VydmljZS5wYXJzZUJhemlTdHJpbmcoYmF6aVN0cmluZyk7XG5cbiAgICAgICAgICAgIC8vIOabtOaWsOaXpeacn+S/oeaBr1xuICAgICAgICAgICAgYmF6aUluZm8uc29sYXJEYXRlID0gYCR7dGhpcy5jdXJyZW50RGF0ZS55ZWFyfS0ke3RoaXMuY3VycmVudERhdGUubW9udGgudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfS0ke3RoaXMuY3VycmVudERhdGUuZGF5LnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICAgICAgICAgICAgYmF6aUluZm8uc29sYXJUaW1lID0gYCR7dGhpcy5jdXJyZW50RGF0ZS5ob3VyfTowYDtcblxuICAgICAgICAgICAgLy8g5re75Yqg5pi+56S66YCJ6aG5XG4gICAgICAgICAgICBiYXppSW5mby5zaG93V3V4aW5nID0gdGhpcy5zaG93V3V4aW5nO1xuICAgICAgICAgICAgYmF6aUluZm8uc2hvd1NwZWNpYWxJbmZvID0gdGhpcy5zaG93U3BlY2lhbEluZm87XG4gICAgICAgICAgICBiYXppSW5mby5nZW5kZXIgPSB0aGlzLmdlbmRlcjtcbiAgICAgICAgICAgIGJhemlJbmZvLmNhbGN1bGF0aW9uTWV0aG9kID0gdGhpcy5jYWxjdWxhdGlvbk1ldGhvZDtcblxuICAgICAgICAgICAgLy8g5re75Yqg56We54We5pi+56S66K6+572uXG4gICAgICAgICAgICBiYXppSW5mby5zaG93U2hlblNoYSA9IHtcbiAgICAgICAgICAgICAgc2laaHU6IHRoaXMuc2hvd1NoZW5TaGEuc2laaHUsXG4gICAgICAgICAgICAgIGRhWXVuOiB0aGlzLnNob3dTaGVuU2hhLmRhWXVuLFxuICAgICAgICAgICAgICBsaXVOaWFuOiB0aGlzLnNob3dTaGVuU2hhLmxpdU5pYW4sXG4gICAgICAgICAgICAgIHhpYW9ZdW46IHRoaXMuc2hvd1NoZW5TaGEueGlhb1l1bixcbiAgICAgICAgICAgICAgbGl1WXVlOiB0aGlzLnNob3dTaGVuU2hhLmxpdVl1ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8g5re75Yqg5Y6f5aeL5pel5pyf5L+h5oGvXG4gICAgICAgICAgICBiYXppSW5mby5vcmlnaW5hbERhdGUgPSB7XG4gICAgICAgICAgICAgIHllYXI6IHRoaXMuY3VycmVudERhdGUueWVhcixcbiAgICAgICAgICAgICAgbW9udGg6IHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgIGRheTogdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgIGhvdXI6IHRoaXMuY3VycmVudERhdGUuaG91clxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gVE9ETzog6K6+572u5o6S55uY5pa55byP5bm26YeN5paw6K6h566XXG5cbiAgICAgICAgICAgIHRoaXMub25VcGRhdGUoYmF6aUluZm8pO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmmL7npLrpgInpobkgLSDkupTooYzliIbmnpBcbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5pi+56S65LqU6KGM5YiG5p6QJylcbiAgICAgIC5zZXREZXNjKCfmmK/lkKbmmL7npLrkupTooYzliIbmnpDpg6jliIYnKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5zaG93V3V4aW5nKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNob3dXdXhpbmcgPSB2YWx1ZTtcblxuICAgICAgICAgICAgLy8g5pu05paw5pi+56S66YCJ6aG5XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5iYXppSWQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd3V4aW5nU2VjdGlvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy13dXhpbmctbGlzdCcpPy5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICBpZiAod3V4aW5nU2VjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgd3V4aW5nU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHd1eGluZ1NlY3Rpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgLy8g5pi+56S66YCJ6aG5IC0g54m55q6K5L+h5oGvXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+aYvuekuueJueauiuS/oeaBrycpXG4gICAgICAuc2V0RGVzYygn5piv5ZCm5pi+56S66IOO5YWD44CB5ZG95a6r562J54m55q6K5L+h5oGvJylcbiAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHtcbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuc2hvd1NwZWNpYWxJbmZvKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNob3dTcGVjaWFsSW5mbyA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICBjb25zdCBzcGVjaWFsSW5mb1NlY3Rpb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctaW5mby1saXN0Jyk/LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgIGlmIChzcGVjaWFsSW5mb1NlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHNwZWNpYWxJbmZvU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNwZWNpYWxJbmZvU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAn56We54We5pi+56S66K6+572uJywgY2xzOiAnYmF6aS1zZXR0aW5ncy1zdWJ0aXRsZScgfSk7XG5cbiAgICAvLyDlm5vmn7HnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5pi+56S65Zub5p+x56We54WeJylcbiAgICAgIC5zZXREZXNjKCfmmK/lkKblnKjlm5vmn7HooajmoLzkuK3mmL7npLrnpZ7nhZ7ooYwnKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5zaG93U2hlblNoYS5zaVpodSlcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYS5zaVpodSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIh+aNouWbm+afseelnueFnuaYvuekuueKtuaAgTonLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgLy8g5p+l5om+5Zub5p+x56We54We6KGMIC0g5L2/55So5pu057K+56Gu55qE6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IHNpWmh1U2hlblNoYVJvdyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy10YWJsZSB0Ym9keSB0cltkYXRhLXJvdy10eXBlPVwic2hlbnNoYS1yb3dcIl0nKTtcbiAgICAgICAgICAgICAgLy8g5aSH55So6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IGJhY2t1cFNlbGVjdG9yID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LXRhYmxlIHRib2R5IHRyOm50aC1jaGlsZCg1KScpO1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflm5vmn7HnpZ7nhZ7ooYzlhYPntKAo57K+56Gu6YCJ5oup5ZmoKTonLCBzaVpodVNoZW5TaGFSb3cpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Zub5p+x56We54We6KGM5YWD57SgKOWkh+eUqOmAieaLqeWZqCk6JywgYmFja3VwU2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOeyvuehrumAieaLqeWZqO+8jOWmguaenOaJvuS4jeWIsOWImeS9v+eUqOWkh+eUqOmAieaLqeWZqFxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSBzaVpodVNoZW5TaGFSb3cgfHwgYmFja3VwU2VsZWN0b3I7XG5cbiAgICAgICAgICAgICAgaWYgKHRhcmdldFJvdykge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgKHRhcmdldFJvdyBhcyBIVE1MRWxlbWVudCkuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAodGFyZ2V0Um93IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfml6Dms5Xmib7liLDlm5vmn7HnpZ7nhZ7ooYzlhYPntKAnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDlpKfov5DnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5pi+56S65aSn6L+Q56We54WeJylcbiAgICAgIC5zZXREZXNjKCfmmK/lkKblnKjlpKfov5DooajmoLzkuK3mmL7npLrnpZ7nhZ7ooYwnKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5zaG93U2hlblNoYS5kYVl1bilcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgdGhpcy5zaG93U2hlblNoYS5kYVl1biA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIh+aNouWkp+i/kOelnueFnuaYvuekuueKtuaAgTonLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgLy8g5p+l5om+5aSn6L+Q56We54We6KGMIC0g5L2/55So5pu057K+56Gu55qE6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IGRhWXVuU2hlblNoYVJvdyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy1kYXl1bi10YWJsZSB0cltkYXRhLXJvdy10eXBlPVwic2hlbnNoYS1yb3dcIl0nKTtcbiAgICAgICAgICAgICAgLy8g5aSH55So6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IGJhY2t1cFNlbGVjdG9yID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LWRheXVuLXRhYmxlIHRyOm50aC1jaGlsZCg0KScpO1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflpKfov5DnpZ7nhZ7ooYzlhYPntKAo57K+56Gu6YCJ5oup5ZmoKTonLCBkYVl1blNoZW5TaGFSb3cpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5aSn6L+Q56We54We6KGM5YWD57SgKOWkh+eUqOmAieaLqeWZqCk6JywgYmFja3VwU2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOeyvuehrumAieaLqeWZqO+8jOWmguaenOaJvuS4jeWIsOWImeS9v+eUqOWkh+eUqOmAieaLqeWZqFxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSBkYVl1blNoZW5TaGFSb3cgfHwgYmFja3VwU2VsZWN0b3I7XG5cbiAgICAgICAgICAgICAgaWYgKHRhcmdldFJvdykge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgKHRhcmdldFJvdyBhcyBIVE1MRWxlbWVudCkuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAodGFyZ2V0Um93IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfml6Dms5Xmib7liLDlpKfov5DnpZ7nhZ7ooYzlhYPntKAnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmtYHlubTnpZ7nhZ7mmL7npLrorr7nva5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5pi+56S65rWB5bm056We54WeJylcbiAgICAgIC5zZXREZXNjKCfmmK/lkKblnKjmtYHlubTooajmoLzkuK3mmL7npLrnpZ7nhZ7ooYwnKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5zaG93U2hlblNoYS5saXVOaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhLmxpdU5pYW4gPSB2YWx1ZTtcblxuICAgICAgICAgICAgLy8g5pu05paw5pi+56S66YCJ6aG5XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5iYXppSWQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliIfmjaLmtYHlubTnpZ7nhZ7mmL7npLrnirbmgIE6JywgdmFsdWUpO1xuXG4gICAgICAgICAgICAgIC8vIOafpeaJvua1geW5tOelnueFnuihjCAtIOS9v+eUqOabtOeyvuehrueahOmAieaLqeWZqFxuICAgICAgICAgICAgICBjb25zdCBsaXVOaWFuU2hlblNoYVJvdyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy1saXVuaWFuLXRhYmxlIHRyW2RhdGEtcm93LXR5cGU9XCJzaGVuc2hhLXJvd1wiXScpO1xuICAgICAgICAgICAgICAvLyDlpIfnlKjpgInmi6nlmahcbiAgICAgICAgICAgICAgY29uc3QgYmFja3VwU2VsZWN0b3IgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctbGl1bmlhbi10YWJsZSB0cjpudGgtY2hpbGQoNCknKTtcblxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5rWB5bm056We54We6KGM5YWD57SgKOeyvuehrumAieaLqeWZqCk6JywgbGl1TmlhblNoZW5TaGFSb3cpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5rWB5bm056We54We6KGM5YWD57SgKOWkh+eUqOmAieaLqeWZqCk6JywgYmFja3VwU2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOeyvuehrumAieaLqeWZqO+8jOWmguaenOaJvuS4jeWIsOWImeS9v+eUqOWkh+eUqOmAieaLqeWZqFxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSBsaXVOaWFuU2hlblNoYVJvdyB8fCBiYWNrdXBTZWxlY3RvcjtcblxuICAgICAgICAgICAgICBpZiAodGFyZ2V0Um93KSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAodGFyZ2V0Um93IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICh0YXJnZXRSb3cgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aXoOazleaJvuWIsOa1geW5tOelnueFnuihjOWFg+e0oCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOWwj+i/kOelnueFnuaYvuekuuiuvue9rlxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCfmmL7npLrlsI/ov5DnpZ7nhZ4nKVxuICAgICAgLnNldERlc2MoJ+aYr+WQpuWcqOWwj+i/kOihqOagvOS4reaYvuekuuelnueFnuihjCcpXG4gICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB7XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnNob3dTaGVuU2hhLnhpYW9ZdW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoZW5TaGEueGlhb1l1biA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIh+aNouWwj+i/kOelnueFnuaYvuekuueKtuaAgTonLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgLy8g5p+l5om+5bCP6L+Q56We54We6KGMIC0g5L2/55So5pu057K+56Gu55qE6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IHhpYW9ZdW5TaGVuU2hhUm93ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LXhpYW95dW4tdGFibGUgdHJbZGF0YS1yb3ctdHlwZT1cInNoZW5zaGEtcm93XCJdJyk7XG4gICAgICAgICAgICAgIC8vIOWkh+eUqOmAieaLqeWZqFxuICAgICAgICAgICAgICBjb25zdCBiYWNrdXBTZWxlY3RvciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy14aWFveXVuLXRhYmxlIHRyOm50aC1jaGlsZCg0KScpO1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7ooYzlhYPntKAo57K+56Gu6YCJ5oup5ZmoKTonLCB4aWFvWXVuU2hlblNoYVJvdyk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflsI/ov5DnpZ7nhZ7ooYzlhYPntKAo5aSH55So6YCJ5oup5ZmoKTonLCBiYWNrdXBTZWxlY3Rvcik7XG5cbiAgICAgICAgICAgICAgLy8g5bCd6K+V5L2/55So57K+56Gu6YCJ5oup5Zmo77yM5aaC5p6c5om+5LiN5Yiw5YiZ5L2/55So5aSH55So6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IHRhcmdldFJvdyA9IHhpYW9ZdW5TaGVuU2hhUm93IHx8IGJhY2t1cFNlbGVjdG9yO1xuXG4gICAgICAgICAgICAgIGlmICh0YXJnZXRSb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICh0YXJnZXRSb3cgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgKHRhcmdldFJvdyBhcyBIVE1MRWxlbWVudCkuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5peg5rOV5om+5Yiw5bCP6L+Q56We54We6KGM5YWD57SgJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgLy8g5rWB5pyI56We54We5pi+56S66K6+572uXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+aYvuekuua1geaciOelnueFnicpXG4gICAgICAuc2V0RGVzYygn5piv5ZCm5Zyo5rWB5pyI6KGo5qC85Lit5pi+56S656We54We6KGMJylcbiAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHtcbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuc2hvd1NoZW5TaGEubGl1WXVlKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNob3dTaGVuU2hhLmxpdVl1ZSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIh+aNoua1geaciOelnueFnuaYvuekuueKtuaAgTonLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgLy8g5p+l5om+5rWB5pyI56We54We6KGMIC0g5L2/55So5pu057K+56Gu55qE6YCJ5oup5ZmoXG4gICAgICAgICAgICAgIGNvbnN0IGxpdVl1ZVNoZW5TaGFSb3cgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctbGl1eXVlLXRhYmxlIHRyW2RhdGEtcm93LXR5cGU9XCJzaGVuc2hhLXJvd1wiXScpO1xuICAgICAgICAgICAgICAvLyDlpIfnlKjpgInmi6nlmahcbiAgICAgICAgICAgICAgY29uc3QgYmFja3VwU2VsZWN0b3IgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5iYXppLXZpZXctbGl1eXVlLXRhYmxlIHRyOm50aC1jaGlsZCgzKScpO1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmtYHmnIjnpZ7nhZ7ooYzlhYPntKAo57K+56Gu6YCJ5oup5ZmoKTonLCBsaXVZdWVTaGVuU2hhUm93KTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+a1geaciOelnueFnuihjOWFg+e0oCjlpIfnlKjpgInmi6nlmagpOicsIGJhY2t1cFNlbGVjdG9yKTtcblxuICAgICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKjnsr7noa7pgInmi6nlmajvvIzlpoLmnpzmib7kuI3liLDliJnkvb/nlKjlpIfnlKjpgInmi6nlmahcbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0Um93ID0gbGl1WXVlU2hlblNoYVJvdyB8fCBiYWNrdXBTZWxlY3RvcjtcblxuICAgICAgICAgICAgICBpZiAodGFyZ2V0Um93KSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAodGFyZ2V0Um93IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICh0YXJnZXRSb3cgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aXoOazleaJvuWIsOa1geaciOelnueFnuihjOWFg+e0oCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOaMiemSruWMuuWfn1xuICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXNldHRpbmdzLWJ1dHRvbi1jb250YWluZXInIH0pO1xuXG4gICAgLy8g5bqU55So5oyJ6ZKuXG4gICAgbmV3IFNldHRpbmcoYnV0dG9uQ29udGFpbmVyKVxuICAgICAgLmFkZEJ1dHRvbihidXR0b24gPT4ge1xuICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgn5bqU55So5pu05pS5JylcbiAgICAgICAgICAuc2V0Q3RhKClcbiAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvLyDojrflj5blvZPliY3lhavlrZfkv6Hmga9cbiAgICAgICAgICAgIGNvbnN0IHRlbXBCYXppSW5mbyA9IEJhemlTZXJ2aWNlLmdldEJhemlGcm9tRGF0ZShcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS55ZWFyLFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLm1vbnRoLFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmRheSxcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyDojrflj5bljp/lp4vlhavlrZdcbiAgICAgICAgICAgIGNvbnN0IHllYXJQaWxsYXIgPSB0ZW1wQmF6aUluZm8ueWVhclBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoUGlsbGFyID0gdGVtcEJhemlJbmZvLm1vbnRoUGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgZGF5UGlsbGFyID0gdGVtcEJhemlJbmZvLmRheVBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IGhvdXJQaWxsYXIgPSB0ZW1wQmF6aUluZm8uaG91clBpbGxhcjtcblxuICAgICAgICAgICAgLy8g5p6E5bu65YWr5a2X5a2X56ym5LiyXG4gICAgICAgICAgICBjb25zdCBiYXppU3RyaW5nID0gYCR7eWVhclBpbGxhcn0gJHttb250aFBpbGxhcn0gJHtkYXlQaWxsYXJ9ICR7aG91clBpbGxhcn1gO1xuXG4gICAgICAgICAgICAvLyDop6PmnpDlhavlrZflrZfnrKbkuLLvvIzkv53mjIHlhavlrZfkuI3lj5hcbiAgICAgICAgICAgIGNvbnN0IGJhemlJbmZvID0gQmF6aVNlcnZpY2UucGFyc2VCYXppU3RyaW5nKGJhemlTdHJpbmcpO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDml6XmnJ/kv6Hmga9cbiAgICAgICAgICAgIGJhemlJbmZvLnNvbGFyRGF0ZSA9IGAke3RoaXMuY3VycmVudERhdGUueWVhcn0tJHt0aGlzLmN1cnJlbnREYXRlLm1vbnRoLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHt0aGlzLmN1cnJlbnREYXRlLmRheS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgICAgICAgICAgIGJhemlJbmZvLnNvbGFyVGltZSA9IGAke3RoaXMuY3VycmVudERhdGUuaG91cn06MGA7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOaYvuekuumAiemhuVxuICAgICAgICAgICAgYmF6aUluZm8uc2hvd1d1eGluZyA9IHRoaXMuc2hvd1d1eGluZztcbiAgICAgICAgICAgIGJhemlJbmZvLnNob3dTcGVjaWFsSW5mbyA9IHRoaXMuc2hvd1NwZWNpYWxJbmZvO1xuICAgICAgICAgICAgYmF6aUluZm8uZ2VuZGVyID0gdGhpcy5nZW5kZXI7XG4gICAgICAgICAgICBiYXppSW5mby5jYWxjdWxhdGlvbk1ldGhvZCA9IHRoaXMuY2FsY3VsYXRpb25NZXRob2Q7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOelnueFnuaYvuekuuiuvue9rlxuICAgICAgICAgICAgYmF6aUluZm8uc2hvd1NoZW5TaGEgPSB7XG4gICAgICAgICAgICAgIHNpWmh1OiB0aGlzLnNob3dTaGVuU2hhLnNpWmh1LFxuICAgICAgICAgICAgICBkYVl1bjogdGhpcy5zaG93U2hlblNoYS5kYVl1bixcbiAgICAgICAgICAgICAgbGl1TmlhbjogdGhpcy5zaG93U2hlblNoYS5saXVOaWFuLFxuICAgICAgICAgICAgICB4aWFvWXVuOiB0aGlzLnNob3dTaGVuU2hhLnhpYW9ZdW4sXG4gICAgICAgICAgICAgIGxpdVl1ZTogdGhpcy5zaG93U2hlblNoYS5saXVZdWVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOWOn+Wni+aXpeacn+S/oeaBr1xuICAgICAgICAgICAgYmF6aUluZm8ub3JpZ2luYWxEYXRlID0ge1xuICAgICAgICAgICAgICB5ZWFyOiB0aGlzLmN1cnJlbnREYXRlLnllYXIsXG4gICAgICAgICAgICAgIG1vbnRoOiB0aGlzLmN1cnJlbnREYXRlLm1vbnRoLFxuICAgICAgICAgICAgICBkYXk6IHRoaXMuY3VycmVudERhdGUuZGF5LFxuICAgICAgICAgICAgICBob3VyOiB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCflupTnlKjmm7TmlLnvvIzmm7TmlrDlhavlrZfkv6Hmga86JywgYmF6aUluZm8pO1xuXG4gICAgICAgICAgICAvLyDlu7bov5/mm7TmlrDvvIznoa7kv51ET03mm7TmlrDlrozmiJBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLm9uVXBkYXRlKGJhemlJbmZvKTtcblxuICAgICAgICAgICAgICAvLyDlho3mrKHlu7bov5/lhbPpl63vvIznoa7kv53mm7TmlrDlrozmiJBcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICB9LCA4MDApO1xuICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAvLyDlhbPpl63mjInpkq5cbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ+WFs+mXrScpXG4gICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iXX0=