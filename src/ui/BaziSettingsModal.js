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
    constructor(app, baziId, initialDate, onUpdate) {
        super(app);
        this.gender = '1'; // 默认为男性
        this.calculationMethod = '0'; // 默认为传统排盘
        this.baziSect = '2'; // 默认为流派2（晚子时日柱算当天）
        this.showWuxing = true; // 默认显示五行分析
        this.showSpecialInfo = true; // 默认显示特殊信息
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
                        lunarDate: originalBaziInfo.lunarDate.replace(/\d{4}/, this.currentDate.year.toString()), 
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
                // 确保保存原始日期信息，用于代码块更新
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVNldHRpbmdzTW9kYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppU2V0dGluZ3NNb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQU8sS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxLQUFLO0lBVTFDOzs7Ozs7T0FNRztJQUNILFlBQ0UsR0FBUSxFQUNSLE1BQWMsRUFDZCxXQUF1RSxFQUN2RSxRQUFpQztRQUVqQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFuQkwsV0FBTSxHQUFXLEdBQUcsQ0FBQyxDQUFDLFFBQVE7UUFDOUIsc0JBQWlCLEdBQVcsR0FBRyxDQUFDLENBQUMsVUFBVTtRQUMzQyxhQUFRLEdBQVcsR0FBRyxDQUFDLENBQUMsbUJBQW1CO1FBQzNDLGVBQVUsR0FBWSxJQUFJLENBQUMsQ0FBQyxXQUFXO1FBQ3ZDLG9CQUFlLEdBQVksSUFBSSxDQUFDLENBQUMsV0FBVztRQWdCbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU07UUFDSixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTNCLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFN0MsV0FBVztRQUNYLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQUUsQ0FB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Q1AsQ0FBQztJQUVELE9BQU87UUFDTCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzNCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQmF6aVNlcnZpY2UgfSBmcm9tICdzcmMvc2VydmljZXMvQmF6aVNlcnZpY2UnO1xuaW1wb3J0IHsgRGF0ZVBpY2tlck1vZGFsIH0gZnJvbSAnLi9EYXRlUGlja2VyTW9kYWwnO1xuXG4vKipcbiAqIOWFq+Wtl+WRveebmOiuvue9ruaooeaAgeahhlxuICog55So5LqO6LCD5pW05YWr5a2X5ZG955uY55qE5Y+C5pWwXG4gKi9cbmV4cG9ydCBjbGFzcyBCYXppU2V0dGluZ3NNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBiYXppSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBjdXJyZW50RGF0ZTogeyB5ZWFyOiBudW1iZXI7IG1vbnRoOiBudW1iZXI7IGRheTogbnVtYmVyOyBob3VyOiBudW1iZXIgfTtcbiAgcHJpdmF0ZSBvblVwZGF0ZTogKGJhemlJbmZvOiBhbnkpID0+IHZvaWQ7XG4gIHByaXZhdGUgZ2VuZGVyOiBzdHJpbmcgPSAnMSc7IC8vIOm7mOiupOS4uueUt+aAp1xuICBwcml2YXRlIGNhbGN1bGF0aW9uTWV0aG9kOiBzdHJpbmcgPSAnMCc7IC8vIOm7mOiupOS4uuS8oOe7n+aOkuebmFxuICBwcml2YXRlIGJhemlTZWN0OiBzdHJpbmcgPSAnMic7IC8vIOm7mOiupOS4uua1gea0vjLvvIjmmZrlrZDml7bml6Xmn7HnrpflvZPlpKnvvIlcbiAgcHJpdmF0ZSBzaG93V3V4aW5nOiBib29sZWFuID0gdHJ1ZTsgLy8g6buY6K6k5pi+56S65LqU6KGM5YiG5p6QXG4gIHByaXZhdGUgc2hvd1NwZWNpYWxJbmZvOiBib29sZWFuID0gdHJ1ZTsgLy8g6buY6K6k5pi+56S654m55q6K5L+h5oGvXG5cbiAgLyoqXG4gICAqIOWIm+W7uuWFq+Wtl+WRveebmOiuvue9ruaooeaAgeahhlxuICAgKiBAcGFyYW0gYXBwIE9ic2lkaWFu5bqU55So5a6e5L6LXG4gICAqIEBwYXJhbSBiYXppSWQg5YWr5a2X5ZG955uYSURcbiAgICogQHBhcmFtIGluaXRpYWxEYXRlIOWIneWni+aXpeacn1xuICAgKiBAcGFyYW0gb25VcGRhdGUg5pu05paw5Zue6LCDXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBiYXppSWQ6IHN0cmluZyxcbiAgICBpbml0aWFsRGF0ZTogeyB5ZWFyOiBudW1iZXI7IG1vbnRoOiBudW1iZXI7IGRheTogbnVtYmVyOyBob3VyOiBudW1iZXIgfSxcbiAgICBvblVwZGF0ZTogKGJhemlJbmZvOiBhbnkpID0+IHZvaWRcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLmJhemlJZCA9IGJhemlJZDtcbiAgICB0aGlzLmN1cnJlbnREYXRlID0gaW5pdGlhbERhdGU7XG4gICAgdGhpcy5vblVwZGF0ZSA9IG9uVXBkYXRlO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ+WFq+Wtl+WRveebmOiuvue9ricgfSk7XG5cbiAgICAvLyDlvZPliY3ml6XmnJ/kv6Hmga/mmL7npLpcbiAgICBjb25zdCBkYXRlSW5mb0RpdiA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXNldHRpbmdzLWRhdGUtaW5mbycgfSk7XG4gICAgZGF0ZUluZm9EaXYuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiBg5b2T5YmN5pel5pyf77yaJHt0aGlzLmN1cnJlbnREYXRlLnllYXJ95bm0JHt0aGlzLmN1cnJlbnREYXRlLm1vbnRofeaciCR7dGhpcy5jdXJyZW50RGF0ZS5kYXl95pelICR7dGhpcy5jdXJyZW50RGF0ZS5ob3VyfeaXtmAsXG4gICAgICBjbHM6ICdiYXppLXNldHRpbmdzLWluZm8tdGV4dCdcbiAgICB9KTtcblxuICAgIC8vIOaXpeacn+WSjOaXtumXtOiuvue9rlxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCfkv67mlLnml6XmnJ/lkozml7bpl7QnKVxuICAgICAgLnNldERlc2MoJ+mAieaLqeaWsOeahOaXpeacn+WSjOaXtumXtOadpemHjeaWsOiuoeeul+WFq+WtlycpXG4gICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiB7XG4gICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KCfpgInmi6nml6XmnJ/lkozml7bpl7QnKVxuICAgICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIC8vIOWFs+mXreW9k+WJjeaooeaAgeahhlxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuXG4gICAgICAgICAgICAvLyDmiZPlvIDml6XmnJ/pgInmi6nmqKHmgIHmoYZcbiAgICAgICAgICAgIGNvbnN0IGRhdGVQaWNrZXJNb2RhbCA9IG5ldyBEYXRlUGlja2VyTW9kYWwodGhpcy5hcHAsIChiYXppSW5mbykgPT4ge1xuICAgICAgICAgICAgICAvLyDmm7TmlrDlhavlrZflkb3nm5hcbiAgICAgICAgICAgICAgdGhpcy5vblVwZGF0ZShiYXppSW5mbyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRhdGVQaWNrZXJNb2RhbC5vcGVuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOW5tOS7veW+ruiwg1xuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCfosIPmlbTlubTku70nKVxuICAgICAgLnNldERlc2MoJ+W+ruiwg+W5tOS7ve+8jOS/neaMgeWkqeW5suWcsOaUr+S4jeWPmCcpXG4gICAgICAuYWRkRHJvcGRvd24oZHJvcGRvd24gPT4ge1xuICAgICAgICAvLyDmt7vliqA2MOW5tOS4gOS4queUsuWtkOWRqOacn+eahOmAiemhuVxuICAgICAgICBjb25zdCBjdXJyZW50WWVhciA9IHRoaXMuY3VycmVudERhdGUueWVhcjtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAtNTsgaSA8PSA1OyBpKyspIHtcbiAgICAgICAgICBpZiAoaSA9PT0gMCkgY29udGludWU7IC8vIOi3s+i/h+W9k+WJjeW5tFxuICAgICAgICAgIGNvbnN0IHllYXIgPSBjdXJyZW50WWVhciArIGkgKiA2MDtcbiAgICAgICAgICBpZiAoeWVhciA+IDAgJiYgeWVhciA8IDIxMDApIHsgLy8g6ZmQ5Yi25ZCI55CG6IyD5Zu0XG4gICAgICAgICAgICBvcHRpb25zW3llYXIudG9TdHJpbmcoKV0gPSBgJHt5ZWFyfeW5tCAoJHtpID4gMCA/ICcrJyA6ICcnfSR7aX3nlLLlrZApYDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb25zKG9wdGlvbnMpXG4gICAgICAgICAgLnNldFZhbHVlKGN1cnJlbnRZZWFyLnRvU3RyaW5nKCkpXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1llYXIgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobmV3WWVhciAmJiBuZXdZZWFyICE9PSB0aGlzLmN1cnJlbnREYXRlLnllYXIpIHtcbiAgICAgICAgICAgICAgLy8g5pu05paw5bm05Lu9XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUueWVhciA9IG5ld1llYXI7XG5cbiAgICAgICAgICAgICAgLy8g6I635Y+W5Y6f5aeL5YWr5a2X5L+h5oGvXG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQmF6aUluZm8gPSBCYXppU2VydmljZS5nZXRCYXppRnJvbURhdGUoXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS55ZWFyIC0gNjAsIC8vIOS9v+eUqOWOn+Wni+W5tOS7veiOt+WPluWFq+Wtl1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy8g5Yib5bu65paw55qE5YWr5a2X5L+h5oGv5a+56LGh77yM5L+d5oyB5YWr5a2X5LiN5Y+Y77yM5Y+q5pu05paw5pel5pyfXG4gICAgICAgICAgICAgIGNvbnN0IGJhemlJbmZvID0ge1xuICAgICAgICAgICAgICAgIC4uLm9yaWdpbmFsQmF6aUluZm8sXG4gICAgICAgICAgICAgICAgc29sYXJEYXRlOiBgJHt0aGlzLmN1cnJlbnREYXRlLnllYXJ9LSR7dGhpcy5jdXJyZW50RGF0ZS5tb250aC50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7dGhpcy5jdXJyZW50RGF0ZS5kYXkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWAsXG4gICAgICAgICAgICAgICAgc29sYXJUaW1lOiBgJHt0aGlzLmN1cnJlbnREYXRlLmhvdXIudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfTowYCxcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDlhpzljobml6XmnJ/vvIjnroDljJblpITnkIbvvIzlrp7pmYXlupTor6XpgJrov4dsdW5hci10eXBlc2NyaXB05bqT6K6h566X77yJXG4gICAgICAgICAgICAgICAgbHVuYXJEYXRlOiBvcmlnaW5hbEJhemlJbmZvLmx1bmFyRGF0ZS5yZXBsYWNlKC9cXGR7NH0vLCB0aGlzLmN1cnJlbnREYXRlLnllYXIudG9TdHJpbmcoKSksXG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5Y6f5aeL5pel5pyf5L+h5oGvXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxEYXRlOiB7XG4gICAgICAgICAgICAgICAgICB5ZWFyOiB0aGlzLmN1cnJlbnREYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgICBtb250aDogdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICAgIGRheTogdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgICAgICBob3VyOiB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgLy8g5pu05paw5YWr5a2X5ZG955uYXG4gICAgICAgICAgICAgIHRoaXMub25VcGRhdGUoYmF6aUluZm8pO1xuXG4gICAgICAgICAgICAgIC8vIOabtOaWsOaXpeacn+S/oeaBr+aYvuekulxuICAgICAgICAgICAgICBkYXRlSW5mb0Rpdi5lbXB0eSgpO1xuICAgICAgICAgICAgICBkYXRlSW5mb0Rpdi5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBg5b2T5YmN5pel5pyf77yaJHt0aGlzLmN1cnJlbnREYXRlLnllYXJ95bm0JHt0aGlzLmN1cnJlbnREYXRlLm1vbnRofeaciCR7dGhpcy5jdXJyZW50RGF0ZS5kYXl95pelICR7dGhpcy5jdXJyZW50RGF0ZS5ob3VyfeaXtmAsXG4gICAgICAgICAgICAgICAgY2xzOiAnYmF6aS1zZXR0aW5ncy1pbmZvLXRleHQnXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDnm7TmjqXovpPlhaXlhavlrZdcbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn55u05o6l6L6T5YWl5YWr5a2XJylcbiAgICAgIC5zZXREZXNjKCfovpPlhaXlrozmlbTlhavlrZfvvIzmoLzlvI/lpoJcIueUsuWtkCDkuZnkuJEg5LiZ5a+FIOS4geWNr1wiJylcbiAgICAgIC5hZGRUZXh0KHRleHQgPT4ge1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKCfnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja8nKVxuICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUudHJpbSgpLnNwbGl0KCcgJykubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5YWr5a2XXG4gICAgICAgICAgICAgICAgY29uc3QgYmF6aUluZm8gPSBCYXppU2VydmljZS5wYXJzZUJhemlTdHJpbmcodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8g5pu05paw5YWr5a2X5ZG955uYXG4gICAgICAgICAgICAgICAgdGhpcy5vblVwZGF0ZShiYXppSW5mbyk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign6Kej5p6Q5YWr5a2X5Ye66ZSZOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmgKfliKvorr7nva7vvIjnlKjkuo7lpKfov5DorqHnrpfvvIlcbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5oCn5YirJylcbiAgICAgIC5zZXREZXNjKCfpgInmi6nmgKfliKvvvIznlKjkuo7lpKfov5DorqHnrpcnKVxuICAgICAgLmFkZERyb3Bkb3duKGRyb3Bkb3duID0+IHtcbiAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAuYWRkT3B0aW9uKCcxJywgJ+eUtycpXG4gICAgICAgICAgLmFkZE9wdGlvbignMCcsICflpbMnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmdlbmRlcilcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZW5kZXIgPSB2YWx1ZTtcblxuICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN5YWr5a2X5L+h5oGvXG4gICAgICAgICAgICBjb25zdCB0ZW1wQmF6aUluZm8gPSBCYXppU2VydmljZS5nZXRCYXppRnJvbURhdGUoXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUueWVhcixcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUuaG91clxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8g6I635Y+W5Y6f5aeL5YWr5a2XXG4gICAgICAgICAgICBjb25zdCB5ZWFyUGlsbGFyID0gdGVtcEJhemlJbmZvLnllYXJQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBtb250aFBpbGxhciA9IHRlbXBCYXppSW5mby5tb250aFBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IGRheVBpbGxhciA9IHRlbXBCYXppSW5mby5kYXlQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBob3VyUGlsbGFyID0gdGVtcEJhemlJbmZvLmhvdXJQaWxsYXI7XG5cbiAgICAgICAgICAgIC8vIOaehOW7uuWFq+Wtl+Wtl+espuS4slxuICAgICAgICAgICAgY29uc3QgYmF6aVN0cmluZyA9IGAke3llYXJQaWxsYXJ9ICR7bW9udGhQaWxsYXJ9ICR7ZGF5UGlsbGFyfSAke2hvdXJQaWxsYXJ9YDtcblxuICAgICAgICAgICAgLy8g6Kej5p6Q5YWr5a2X5a2X56ym5Liy77yM5L+d5oyB5YWr5a2X5LiN5Y+YXG4gICAgICAgICAgICBjb25zdCBiYXppSW5mbyA9IEJhemlTZXJ2aWNlLnBhcnNlQmF6aVN0cmluZyhiYXppU3RyaW5nKTtcblxuICAgICAgICAgICAgLy8g5pu05paw5pel5pyf5L+h5oGvXG4gICAgICAgICAgICBiYXppSW5mby5zb2xhckRhdGUgPSBgJHt0aGlzLmN1cnJlbnREYXRlLnllYXJ9LSR7dGhpcy5jdXJyZW50RGF0ZS5tb250aC50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7dGhpcy5jdXJyZW50RGF0ZS5kYXkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gICAgICAgICAgICBiYXppSW5mby5zb2xhclRpbWUgPSBgJHt0aGlzLmN1cnJlbnREYXRlLmhvdXJ9OjBgO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGJhemlJbmZvLnNob3dXdXhpbmcgPSB0aGlzLnNob3dXdXhpbmc7XG4gICAgICAgICAgICBiYXppSW5mby5zaG93U3BlY2lhbEluZm8gPSB0aGlzLnNob3dTcGVjaWFsSW5mbztcbiAgICAgICAgICAgIGJhemlJbmZvLmdlbmRlciA9IHRoaXMuZ2VuZGVyO1xuICAgICAgICAgICAgYmF6aUluZm8uY2FsY3VsYXRpb25NZXRob2QgPSB0aGlzLmNhbGN1bGF0aW9uTWV0aG9kO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDljp/lp4vml6XmnJ/kv6Hmga9cbiAgICAgICAgICAgIGJhemlJbmZvLm9yaWdpbmFsRGF0ZSA9IHtcbiAgICAgICAgICAgICAgeWVhcjogdGhpcy5jdXJyZW50RGF0ZS55ZWFyLFxuICAgICAgICAgICAgICBtb250aDogdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgZGF5OiB0aGlzLmN1cnJlbnREYXRlLmRheSxcbiAgICAgICAgICAgICAgaG91cjogdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBUT0RPOiDorr7nva7mgKfliKvlubbph43mlrDorqHnrpflpKfov5BcblxuICAgICAgICAgICAgdGhpcy5vblVwZGF0ZShiYXppSW5mbyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOaOkuebmOaWueW8j+iuvue9rlxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCfmjpLnm5jmlrnlvI8nKVxuICAgICAgLnNldERlc2MoJ+mAieaLqeWFq+Wtl+aOkuebmOeahOiuoeeul+aWueW8jycpXG4gICAgICAuYWRkRHJvcGRvd24oZHJvcGRvd24gPT4ge1xuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJzAnLCAn5Lyg57uf5o6S55uYJylcbiAgICAgICAgICAuYWRkT3B0aW9uKCcxJywgJ+aWsOa0vuaOkuebmCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuY2FsY3VsYXRpb25NZXRob2QpXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRpb25NZXRob2QgPSB2YWx1ZTtcblxuICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN5YWr5a2X5L+h5oGvXG4gICAgICAgICAgICBjb25zdCB0ZW1wQmF6aUluZm8gPSBCYXppU2VydmljZS5nZXRCYXppRnJvbURhdGUoXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUueWVhcixcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5kYXksXG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUuaG91clxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8g6I635Y+W5Y6f5aeL5YWr5a2XXG4gICAgICAgICAgICBjb25zdCB5ZWFyUGlsbGFyID0gdGVtcEJhemlJbmZvLnllYXJQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBtb250aFBpbGxhciA9IHRlbXBCYXppSW5mby5tb250aFBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IGRheVBpbGxhciA9IHRlbXBCYXppSW5mby5kYXlQaWxsYXI7XG4gICAgICAgICAgICBjb25zdCBob3VyUGlsbGFyID0gdGVtcEJhemlJbmZvLmhvdXJQaWxsYXI7XG5cbiAgICAgICAgICAgIC8vIOaehOW7uuWFq+Wtl+Wtl+espuS4slxuICAgICAgICAgICAgY29uc3QgYmF6aVN0cmluZyA9IGAke3llYXJQaWxsYXJ9ICR7bW9udGhQaWxsYXJ9ICR7ZGF5UGlsbGFyfSAke2hvdXJQaWxsYXJ9YDtcblxuICAgICAgICAgICAgLy8g6Kej5p6Q5YWr5a2X5a2X56ym5Liy77yM5L+d5oyB5YWr5a2X5LiN5Y+YXG4gICAgICAgICAgICBjb25zdCBiYXppSW5mbyA9IEJhemlTZXJ2aWNlLnBhcnNlQmF6aVN0cmluZyhiYXppU3RyaW5nKTtcblxuICAgICAgICAgICAgLy8g5pu05paw5pel5pyf5L+h5oGvXG4gICAgICAgICAgICBiYXppSW5mby5zb2xhckRhdGUgPSBgJHt0aGlzLmN1cnJlbnREYXRlLnllYXJ9LSR7dGhpcy5jdXJyZW50RGF0ZS5tb250aC50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7dGhpcy5jdXJyZW50RGF0ZS5kYXkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gICAgICAgICAgICBiYXppSW5mby5zb2xhclRpbWUgPSBgJHt0aGlzLmN1cnJlbnREYXRlLmhvdXJ9OjBgO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGJhemlJbmZvLnNob3dXdXhpbmcgPSB0aGlzLnNob3dXdXhpbmc7XG4gICAgICAgICAgICBiYXppSW5mby5zaG93U3BlY2lhbEluZm8gPSB0aGlzLnNob3dTcGVjaWFsSW5mbztcbiAgICAgICAgICAgIGJhemlJbmZvLmdlbmRlciA9IHRoaXMuZ2VuZGVyO1xuICAgICAgICAgICAgYmF6aUluZm8uY2FsY3VsYXRpb25NZXRob2QgPSB0aGlzLmNhbGN1bGF0aW9uTWV0aG9kO1xuXG4gICAgICAgICAgICAvLyDmt7vliqDljp/lp4vml6XmnJ/kv6Hmga9cbiAgICAgICAgICAgIGJhemlJbmZvLm9yaWdpbmFsRGF0ZSA9IHtcbiAgICAgICAgICAgICAgeWVhcjogdGhpcy5jdXJyZW50RGF0ZS55ZWFyLFxuICAgICAgICAgICAgICBtb250aDogdGhpcy5jdXJyZW50RGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgZGF5OiB0aGlzLmN1cnJlbnREYXRlLmRheSxcbiAgICAgICAgICAgICAgaG91cjogdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBUT0RPOiDorr7nva7mjpLnm5jmlrnlvI/lubbph43mlrDorqHnrpdcblxuICAgICAgICAgICAgdGhpcy5vblVwZGF0ZShiYXppSW5mbyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOaYvuekuumAiemhuSAtIOS6lOihjOWIhuaekFxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCfmmL7npLrkupTooYzliIbmnpAnKVxuICAgICAgLnNldERlc2MoJ+aYr+WQpuaYvuekuuS6lOihjOWIhuaekOmDqOWIhicpXG4gICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB7XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnNob3dXdXhpbmcpXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1d1eGluZyA9IHZhbHVlO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDmmL7npLrpgInpoblcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmJhemlJZCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICBjb25zdCB3dXhpbmdTZWN0aW9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYmF6aS12aWV3LXd1eGluZy1saXN0Jyk/LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgIGlmICh3dXhpbmdTZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICB3dXhpbmdTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgd3V4aW5nU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmmL7npLrpgInpobkgLSDnibnmrorkv6Hmga9cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5pi+56S654m55q6K5L+h5oGvJylcbiAgICAgIC5zZXREZXNjKCfmmK/lkKbmmL7npLrog47lhYPjgIHlkb3lrqvnrYnnibnmrorkv6Hmga8nKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4ge1xuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5zaG93U3BlY2lhbEluZm8pXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NwZWNpYWxJbmZvID0gdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIOabtOaWsOaYvuekuumAiemhuVxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuYmF6aUlkKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgIGNvbnN0IHNwZWNpYWxJbmZvU2VjdGlvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJhemktdmlldy1pbmZvLWxpc3QnKT8ucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgaWYgKHNwZWNpYWxJbmZvU2VjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgc3BlY2lhbEluZm9TZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3BlY2lhbEluZm9TZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOaMiemSruWMuuWfn1xuICAgIGNvbnN0IGJ1dHRvbkNvbnRhaW5lciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYXppLXNldHRpbmdzLWJ1dHRvbi1jb250YWluZXInIH0pO1xuXG4gICAgLy8g5bqU55So5oyJ6ZKuXG4gICAgbmV3IFNldHRpbmcoYnV0dG9uQ29udGFpbmVyKVxuICAgICAgLmFkZEJ1dHRvbihidXR0b24gPT4ge1xuICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgn5bqU55So5pu05pS5JylcbiAgICAgICAgICAuc2V0Q3RhKClcbiAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAvLyDojrflj5blvZPliY3lhavlrZfkv6Hmga9cbiAgICAgICAgICAgIGNvbnN0IHRlbXBCYXppSW5mbyA9IEJhemlTZXJ2aWNlLmdldEJhemlGcm9tRGF0ZShcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS55ZWFyLFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLm1vbnRoLFxuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlLmRheSxcbiAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZS5ob3VyXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyDojrflj5bljp/lp4vlhavlrZdcbiAgICAgICAgICAgIGNvbnN0IHllYXJQaWxsYXIgPSB0ZW1wQmF6aUluZm8ueWVhclBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IG1vbnRoUGlsbGFyID0gdGVtcEJhemlJbmZvLm1vbnRoUGlsbGFyO1xuICAgICAgICAgICAgY29uc3QgZGF5UGlsbGFyID0gdGVtcEJhemlJbmZvLmRheVBpbGxhcjtcbiAgICAgICAgICAgIGNvbnN0IGhvdXJQaWxsYXIgPSB0ZW1wQmF6aUluZm8uaG91clBpbGxhcjtcblxuICAgICAgICAgICAgLy8g5p6E5bu65YWr5a2X5a2X56ym5LiyXG4gICAgICAgICAgICBjb25zdCBiYXppU3RyaW5nID0gYCR7eWVhclBpbGxhcn0gJHttb250aFBpbGxhcn0gJHtkYXlQaWxsYXJ9ICR7aG91clBpbGxhcn1gO1xuXG4gICAgICAgICAgICAvLyDop6PmnpDlhavlrZflrZfnrKbkuLLvvIzkv53mjIHlhavlrZfkuI3lj5hcbiAgICAgICAgICAgIGNvbnN0IGJhemlJbmZvID0gQmF6aVNlcnZpY2UucGFyc2VCYXppU3RyaW5nKGJhemlTdHJpbmcpO1xuXG4gICAgICAgICAgICAvLyDmm7TmlrDml6XmnJ/kv6Hmga9cbiAgICAgICAgICAgIGJhemlJbmZvLnNvbGFyRGF0ZSA9IGAke3RoaXMuY3VycmVudERhdGUueWVhcn0tJHt0aGlzLmN1cnJlbnREYXRlLm1vbnRoLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHt0aGlzLmN1cnJlbnREYXRlLmRheS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgICAgICAgICAgIGJhemlJbmZvLnNvbGFyVGltZSA9IGAke3RoaXMuY3VycmVudERhdGUuaG91cn06MGA7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOaYvuekuumAiemhuVxuICAgICAgICAgICAgYmF6aUluZm8uc2hvd1d1eGluZyA9IHRoaXMuc2hvd1d1eGluZztcbiAgICAgICAgICAgIGJhemlJbmZvLnNob3dTcGVjaWFsSW5mbyA9IHRoaXMuc2hvd1NwZWNpYWxJbmZvO1xuICAgICAgICAgICAgYmF6aUluZm8uZ2VuZGVyID0gdGhpcy5nZW5kZXI7XG4gICAgICAgICAgICBiYXppSW5mby5jYWxjdWxhdGlvbk1ldGhvZCA9IHRoaXMuY2FsY3VsYXRpb25NZXRob2Q7XG5cbiAgICAgICAgICAgIC8vIOehruS/neS/neWtmOWOn+Wni+aXpeacn+S/oeaBr++8jOeUqOS6juS7o+eggeWdl+abtOaWsFxuICAgICAgICAgICAgYmF6aUluZm8ub3JpZ2luYWxEYXRlID0ge1xuICAgICAgICAgICAgICB5ZWFyOiB0aGlzLmN1cnJlbnREYXRlLnllYXIsXG4gICAgICAgICAgICAgIG1vbnRoOiB0aGlzLmN1cnJlbnREYXRlLm1vbnRoLFxuICAgICAgICAgICAgICBkYXk6IHRoaXMuY3VycmVudERhdGUuZGF5LFxuICAgICAgICAgICAgICBob3VyOiB0aGlzLmN1cnJlbnREYXRlLmhvdXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCflupTnlKjmm7TmlLnvvIzmm7TmlrDlhavlrZfkv6Hmga86JywgYmF6aUluZm8pO1xuXG4gICAgICAgICAgICAvLyDlu7bov5/mm7TmlrDvvIznoa7kv51ET03mm7TmlrDlrozmiJBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLm9uVXBkYXRlKGJhemlJbmZvKTtcblxuICAgICAgICAgICAgICAvLyDlho3mrKHlu7bov5/lhbPpl63vvIznoa7kv53mm7TmlrDlrozmiJBcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICB9LCA4MDApO1xuICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAvLyDlhbPpl63mjInpkq5cbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ+WFs+mXrScpXG4gICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iXX0=