import { Editor, MarkdownView, Notice } from 'obsidian';
import { BaziService } from '../services/BaziService';
import type BaziPlugin from '../main';

/**
 * 命令管理器
 * 负责注册和管理插件的所有命令
 */
export class CommandManager {
	private plugin: BaziPlugin;

	constructor(plugin: BaziPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 注册所有命令
	 */
	registerCommands(): void {
		console.log('🎯 开始注册命令...');
		this.registerDatePickerCommand();
		this.registerBaziParserCommand();
		this.registerCreateTemplateCommand();
		console.log('✅ 所有命令注册完成');
	}



	/**
	 * 注册日期选择命令
	 */
	private registerDatePickerCommand(): void {
		console.log('📅 注册日期选择命令: open-date-picker');
		this.plugin.addCommand({
			id: 'open-date-picker',
			name: '📅 输入时间转八字',
			editorCallback: (editor: Editor) => {
				this.plugin.openDatePickerModal((baziInfo) => {
					// 获取日期字符串
					const dateStr = `${baziInfo.solarDate} ${baziInfo.solarTime}`;

					// 构建代码块内容
					let codeBlockContent = `\`\`\`bazi\ndate: ${dateStr}\n`;

					// 添加性别参数
					if (baziInfo.gender) {
						const genderLabel = baziInfo.gender === '1' ? '男' : '女';
						codeBlockContent += `gender: ${genderLabel}\n`;
					}

					// 完成代码块
					codeBlockContent += `\`\`\``;

					// 在光标位置插入bazi代码块
					editor.replaceSelection(codeBlockContent);

					// 显示通知
					new Notice('八字命盘已插入');
				});
			}
		});
	}

	/**
	 * 注册八字解析命令
	 */
	private registerBaziParserCommand(): void {
		console.log('🔍 注册八字解析命令: parse-selected-bazi');
		this.plugin.addCommand({
			id: 'parse-selected-bazi',
			name: '🔍 解析选中的八字',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (selection) {
					// 清理选中的文本，去除多余的空格
					const cleanedBazi = selection.replace(/\s+/g, ' ').trim();

					// 检查是否符合八字格式（四个天干地支组合，用空格分隔）
					const baziPattern = /^([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])$/;

					if (baziPattern.test(cleanedBazi)) {
						// 直接解析八字，获取可能的年份
						try {
							const baziInfo = BaziService.parseBaziString(cleanedBazi);

							// 构建代码块内容
							let codeBlockContent = `\`\`\`bazi\nbazi: ${cleanedBazi}\n`;

							// 完成代码块
							codeBlockContent += `\`\`\``;

							// 替换选中的文本为代码块
							editor.replaceSelection(codeBlockContent);
							new Notice('八字已转换为代码块');
						} catch (error) {
							// 如果解析失败，仅使用基本格式
							editor.replaceSelection(`\`\`\`bazi
bazi: ${cleanedBazi}
\`\`\``);
							new Notice('八字已转换为代码块');
						}
					} else {
						// 如果不符合格式，打开解析模态框让用户修改
						this.plugin.openBaziParserModal(selection, (baziInfo) => {
							// 获取解析后的八字
							const parsedBazi = `${baziInfo.yearPillar} ${baziInfo.monthPillar} ${baziInfo.dayPillar} ${baziInfo.hourPillar}`;

							// 构建代码块内容
							let codeBlockContent = `\`\`\`bazi\nbazi: ${parsedBazi}\n`;

							// 添加性别参数
							if (baziInfo.gender) {
								const genderLabel = baziInfo.gender === '1' ? '男' : '女';
								codeBlockContent += `gender: ${genderLabel}\n`;
							}

							// 不自动添加年份参数，让用户通过年份选择栏自行选择

							// 完成代码块
							codeBlockContent += `\`\`\``;

							// 替换选中的文本为代码块
							editor.replaceSelection(codeBlockContent);
							new Notice('八字已转换为代码块');
						});
					}
				} else {
					new Notice('请先选择八字文本');
				}
			}
		});
	}

	/**
	 * 注册创建样板笔记命令
	 */
	private registerCreateTemplateCommand(): void {
		console.log('📝 注册样板笔记命令: create-bazi-template');
		this.plugin.addCommand({
			id: 'create-bazi-template',
			name: '📝 创建八字样板笔记',
			callback: async () => {
				try {
					await this.createBaziTemplate();
					new Notice('✅ 八字样板笔记已创建！');
				} catch (error) {
					console.error('❌ 创建样板笔记失败:', error);
					new Notice('❌ 创建样板笔记失败: ' + error.message);
				}
			}
		});
	}

	/**
	 * 创建八字样板笔记
	 */
	private async createBaziTemplate(): Promise<void> {
		const templateContent = this.generateTemplateContent();

		// 生成文件名（带时间戳避免重复）
		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
		const fileName = `八字学习样板-${timestamp}.md`;

		// 创建文件
		await this.plugin.app.vault.create(fileName, templateContent);

		// 打开新创建的文件
		const file = this.plugin.app.vault.getAbstractFileByPath(fileName);
		if (file) {
			await this.plugin.app.workspace.getLeaf().openFile(file as any);
		}

		console.log('✅ 样板笔记已创建:', fileName);
	}

	/**
	 * 生成样板笔记内容
	 */
	private generateTemplateContent(): string {
		return `# 🎯 八字命盘学习样板

> 这是一个八字插件的学习样板，包含了各种功能的示例和说明。
> 您可以通过这个样板快速了解和学习八字插件的各种功能。

## 📚 目录

- [基本功能示例](#基本功能示例)
- [样式展示](#样式展示)
- [双链和标签功能](#双链和标签功能)
- [高级功能](#高级功能)
- [学习资源](#学习资源)

---

## 🎨 基本功能示例

### 1. 日期转八字（推荐方式）

使用具体的公历日期和时间：

\`\`\`bazi
date: 1990-01-01 08:00
gender: 男
name: 张三
\`\`\`

### 2. 农历日期转八字

使用农历日期：

\`\`\`bazi
lunar: 1989-11-25 08:00
gender: 女
name: 李四
\`\`\`

### 3. 直接输入八字

如果您已知八字，可以直接输入：

\`\`\`bazi
bazi: 庚午 戊子 乙卯 辛巳
gender: 男
name: 王五
\`\`\`

### 4. 当前时间八字

查看当前时间的八字：

\`\`\`bazi
now: true
gender: no
\`\`\`

---

## 🎨 样式展示

### 样式1：简洁样式

\`\`\`bazi
date: 1985-06-15 14:30
gender: 女
name: 赵六
style: 1
\`\`\`

### 样式2：标准样式

\`\`\`bazi
date: 1992-03-20 10:15
gender: 男
name: 孙七
style: 2
\`\`\`

### 样式3：完整样式

\`\`\`bazi
date: 1988-09-08 16:45
gender: 女
name: 周八
style: 3
\`\`\`

---

## 🔗 双链和标签功能

### 智能双链和标签生成

当您为八字添加了姓名参数后，插件会自动生成相关的双链和标签：

\`\`\`bazi
date: 1893-12-26 07:30
gender: 男
name: 毛泽东
\`\`\`

**自动生成效果：**
- **双链**：\`[[毛泽东]]\` \`[[天乙贵人]]\` \`[[文昌]]\`
- **标签**：\`#政治家\` \`#癸水日主旺\` \`#正官格\`

### 企业家案例

\`\`\`bazi
date: 1964-09-10 14:30
gender: 男
name: 马云
\`\`\`

**自动生成效果：**
- **双链**：\`[[马云]]\` \`[[桃花]]\` \`[[驿马]]\`
- **标签**：\`#企业家\` \`#甲木日主弱\` \`#偏财格\` \`#60后\`

### 配置双链和标签

您可以在插件设置中配置双链和标签的生成规则：

1. **全局设置**：插件设置 → "双链和标签设置"
2. **单独配置**：点击八字命盘右上角的 ⚙️ 配置按钮

### 使用双链工具栏

当八字包含姓名时，会自动显示双链工具栏：

- 🔗 **相关链接** - 查看智能生成的双链和标签
- 👤 **[姓名]** - 创建或打开个人档案
- 📚 **知识库** - 一键创建完整知识库
- ⚙️ **配置** - 设置双链标签规则

---

## 🚀 高级功能

### 1. 神煞显示控制

您可以在插件设置中控制神煞的显示：

\`\`\`bazi
date: 1980-05-10 07:45
gender: 女
name: 测试案例
style: 3
\`\`\`

### 2. 流派选择

插件支持两种子时流派：
- 流派1：晚子时日柱算明天
- 流派2：晚子时日柱算当天

\`\`\`bazi
date: 1990-06-01 23:30
gender: 男
name: 子时测试
\`\`\`

### 3. 年份选择

对于纯八字输入，插件会自动提供年份选择：

\`\`\`bazi
bazi: 甲子 丙寅 戊辰 壬戌
gender: 男
name: 年份选择示例
\`\`\`

---

## 📖 学习资源

### 🎯 快速上手

1. **创建八字**：使用 \`Ctrl+P\` 打开命令面板，搜索"输入时间转八字"
2. **解析八字**：选中八字文本，使用"解析选中的八字"命令
3. **样式切换**：点击八字命盘右上角的 🎨 按钮
4. **设置调整**：点击八字命盘右上角的 ⚙️ 按钮

### 🔧 常用命令

- \`📝 创建八字样板笔记\` - 创建这个学习样板
- \`📅 输入时间转八字\` - 通过日期选择器创建八字
- \`🔍 解析选中的八字\` - 将文本转换为八字代码块

### 📝 代码块参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| \`date\` | 公历日期时间 | \`date: 1990-01-01 08:00\` |
| \`lunar\` | 农历日期时间 | \`lunar: 1989-11-25 08:00\` |
| \`bazi\` | 直接输入八字 | \`bazi: 庚午 戊子 乙卯 辛巳\` |
| \`now\` | 使用当前时间 | \`now: true\` |
| \`gender\` | 性别 | \`gender: 男\` 或 \`gender: 女\` |
| \`name\` | 姓名（支持双链） | \`name: [[张三]]\` |
| \`style\` | 显示样式 | \`style: 1\` (简洁) / \`2\` (标准) / \`3\` (完整) |
| \`year\` | 指定年份 | \`year: 1990\` |

### 🎨 样式说明

- **样式1（简洁）**：显示基本八字信息，适合快速查看
- **样式2（标准）**：显示八字、大运、流年等信息，平衡详细度和简洁性
- **样式3（完整）**：显示所有信息，包括神煞、详细分析等

### 🔗 双链使用技巧

1. **人物管理**：为每个人创建专门的笔记，使用双链连接
2. **分类整理**：使用文件夹结构，如 \`人物/历史人物/\`、\`人物/现代名人/\`
3. **标签系统**：使用标签进行横向分类，如 #政治家 #企业家 #艺术家

### 💡 使用建议

1. **学习顺序**：先熟悉基本功能，再探索高级功能
2. **实践练习**：多创建不同的八字案例进行练习
3. **设置调整**：根据个人喜好调整插件设置
4. **笔记整理**：建立自己的八字笔记体系

---

## 🎉 开始您的八字学习之旅

现在您可以：

1. 🎯 **尝试修改上面的示例** - 改变日期、性别、姓名等参数
2. 🎨 **体验样式切换** - 点击八字命盘右上角的按钮
3. 🔗 **创建双链笔记** - 为感兴趣的人物创建专门的笔记
4. ⚙️ **调整插件设置** - 根据个人喜好定制功能
5. 📚 **建立学习体系** - 创建自己的八字学习笔记库

祝您学习愉快！🌟

---

*💡 提示：这个样板笔记是自动生成的，您可以根据需要修改和扩展内容。*
`;
	}
}
