import { Modal, Setting, Notice } from 'obsidian';
import { BaziService } from '../services/BaziService';
/**
 * 八字解析模态框
 */
export class BaziParserModal extends Modal {
    constructor(app, initialBazi = '', onParsed) {
        super(app);
        this.baziString = '';
        // 添加性别和年份属性
        this.gender = ''; // 默认为空
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
                }
                else {
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
                    // 解析八字，传入性别和年份参数
                    const baziInfo = BaziService.parseBaziString(this.baziString, this.gender, '2', // 使用默认流派
                    this.specifiedYear);
                    // 确保性别和指定年份信息被传递给回调函数
                    baziInfo.gender = this.gender;
                    baziInfo.specifiedYear = this.specifiedYear;
                    // 调用回调函数
                    this.onParsed(baziInfo);
                    // 关闭模态框
                    this.close();
                    // 显示成功通知
                    new Notice('八字解析成功');
                }
                catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVBhcnNlck1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQmF6aVBhcnNlck1vZGFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBTyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN2RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFdEQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxLQUFLO0lBSXhDLFlBQVksR0FBUSxFQUFFLGNBQXNCLEVBQUUsRUFBRSxRQUFpQztRQUMvRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFKTCxlQUFVLEdBQVcsRUFBRSxDQUFDO1FBaUhoQyxZQUFZO1FBQ0osV0FBTSxHQUFXLEVBQUUsQ0FBQyxDQUFDLE9BQU87UUE3R2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUUzQixTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTNDLE9BQU87UUFDUCxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN0QixJQUFJLEVBQUUsdUNBQXVDO1NBQzlDLENBQUMsQ0FBQztRQUVILE9BQU87UUFDUCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQzthQUNiLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUM7aUJBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUN6QixRQUFR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QyxPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ2pCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxPQUFPO1FBQ0wsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMzQixTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUtGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBNb2RhbCwgU2V0dGluZywgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQmF6aVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9CYXppU2VydmljZSc7XG5cbi8qKlxuICog5YWr5a2X6Kej5p6Q5qih5oCB5qGGXG4gKi9cbmV4cG9ydCBjbGFzcyBCYXppUGFyc2VyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgYmF6aVN0cmluZzogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgb25QYXJzZWQ6IChiYXppSW5mbzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBpbml0aWFsQmF6aTogc3RyaW5nID0gJycsIG9uUGFyc2VkOiAoYmF6aUluZm86IGFueSkgPT4gdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5iYXppU3RyaW5nID0gaW5pdGlhbEJhemk7XG4gICAgdGhpcy5vblBhcnNlZCA9IG9uUGFyc2VkO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ+ino+aekOWFq+WtlycgfSk7XG5cbiAgICAvLyDor7TmmI7mlofmnKxcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAn6K+36L6T5YWl5YWr5a2X77yM5qC85byP5Li6XCLlubTmn7Eg5pyI5p+xIOaXpeafsSDml7bmn7FcIu+8jOWmglwi55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vXCInXG4gICAgfSk7XG5cbiAgICAvLyDlhavlrZfovpPlhaVcbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgn5YWr5a2XJylcbiAgICAgIC5zZXREZXNjKCfovpPlhaXlrozmlbTlhavlrZcnKVxuICAgICAgLmFkZFRleHQodGV4dCA9PiB7XG4gICAgICAgIHRleHQuc2V0UGxhY2Vob2xkZXIoJ+eUsuWtkCDkuZnkuJEg5LiZ5a+FIOS4geWNrycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuYmF6aVN0cmluZylcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgdGhpcy5iYXppU3RyaW5nID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOW5tOS7vemAieaLqe+8iOWPr+mAie+8iVxuICAgIGNvbnN0IHllYXJTZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+W5tOS7ve+8iOWPr+mAie+8iScpXG4gICAgICAuc2V0RGVzYygn5oyH5a6a5YWr5a2X5omA5Zyo55qE5bm05Lu977yM5aaC5p6c5LiN56Gu5a6a5Y+v5Lul55WZ56m6JylcbiAgICAgIC5hZGRUZXh0KHRleHQgPT4ge1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKCfkvovlpoLvvJoxOTgwJylcbiAgICAgICAgICAub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgLy8g5a2Y5YKo55So5oi36L6T5YWl55qE5bm05Lu9XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgIWlzTmFOKHBhcnNlSW50KHZhbHVlKSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGVjaWZpZWRZZWFyID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGVjaWZpZWRZZWFyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAvLyDmgKfliKvpgInmi6lcbiAgICBjb25zdCBnZW5kZXJTZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ+aAp+WIqycpXG4gICAgICAuc2V0RGVzYygn6YCJ5oup5oCn5Yir77yM55So5LqO5aSn6L+Q6K6h566XJylcbiAgICAgIC5hZGREcm9wZG93bihkcm9wZG93biA9PiB7XG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbignJywgJ+ivt+mAieaLqScpXG4gICAgICAgICAgLmFkZE9wdGlvbignMScsICfnlLcnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJzAnLCAn5aWzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5nZW5kZXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2VuZGVyID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIC8vIOmUmeivr+S/oeaBr+WMuuWfn1xuICAgIGNvbnN0IGVycm9yRGl2ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhemktZXJyb3ItY29udGFpbmVyJyB9KTtcbiAgICBlcnJvckRpdi5oaWRlKCk7XG5cbiAgICAvLyDop6PmnpDmjInpkq5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiB7XG4gICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KCfop6PmnpDlhavlrZcnKVxuICAgICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIOa4hemZpOS5i+WJjeeahOmUmeivr+S/oeaBr1xuICAgICAgICAgICAgICBlcnJvckRpdi5lbXB0eSgpO1xuICAgICAgICAgICAgICBlcnJvckRpdi5oaWRlKCk7XG5cbiAgICAgICAgICAgICAgLy8g6Kej5p6Q5YWr5a2X77yM5Lyg5YWl5oCn5Yir5ZKM5bm05Lu95Y+C5pWwXG4gICAgICAgICAgICAgIGNvbnN0IGJhemlJbmZvID0gQmF6aVNlcnZpY2UucGFyc2VCYXppU3RyaW5nKFxuICAgICAgICAgICAgICAgIHRoaXMuYmF6aVN0cmluZyxcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmRlcixcbiAgICAgICAgICAgICAgICAnMicsIC8vIOS9v+eUqOm7mOiupOa1gea0vlxuICAgICAgICAgICAgICAgIHRoaXMuc3BlY2lmaWVkWWVhclxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIC8vIOehruS/neaAp+WIq+WSjOaMh+WumuW5tOS7veS/oeaBr+iiq+S8oOmAkue7meWbnuiwg+WHveaVsFxuICAgICAgICAgICAgICBiYXppSW5mby5nZW5kZXIgPSB0aGlzLmdlbmRlcjtcbiAgICAgICAgICAgICAgYmF6aUluZm8uc3BlY2lmaWVkWWVhciA9IHRoaXMuc3BlY2lmaWVkWWVhcjtcblxuICAgICAgICAgICAgICAvLyDosIPnlKjlm57osIPlh73mlbBcbiAgICAgICAgICAgICAgdGhpcy5vblBhcnNlZChiYXppSW5mbyk7XG5cbiAgICAgICAgICAgICAgLy8g5YWz6Zet5qih5oCB5qGGXG4gICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcblxuICAgICAgICAgICAgICAvLyDmmL7npLrmiJDlip/pgJrnn6VcbiAgICAgICAgICAgICAgbmV3IE5vdGljZSgn5YWr5a2X6Kej5p6Q5oiQ5YqfJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfop6PmnpDlhavlrZflh7rplJk6JywgZXJyb3IpO1xuXG4gICAgICAgICAgICAgIC8vIOaYvuekuumUmeivr+S/oeaBr1xuICAgICAgICAgICAgICBlcnJvckRpdi5zZXRUZXh0KGDplJnor686ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgZXJyb3JEaXYuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG5cbiAgLy8g5re75Yqg5oCn5Yir5ZKM5bm05Lu95bGe5oCnXG4gIHByaXZhdGUgZ2VuZGVyOiBzdHJpbmcgPSAnJzsgLy8g6buY6K6k5Li656m6XG4gIHByaXZhdGUgc3BlY2lmaWVkWWVhcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xufVxuIl19