# 开发指南

## 🛠️ 开发环境设置

### 前置要求
- Node.js >= 16.0.0
- npm 或 yarn
- Obsidian 应用程序

### 安装步骤
```bash
# 克隆项目
git clone https://github.com/bazi-obsidian/bazi-plugin.git
cd bazi-plugin

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### 开发环境配置
1. 将项目链接到 Obsidian 插件目录
```bash
# 创建软链接
ln -s /path/to/bazi-plugin /path/to/vault/.obsidian/plugins/bazi-obsidian
```

2. 在 Obsidian 中启用插件
3. 修改代码后自动重新加载

## 📁 项目结构

```
src/
├── main.ts                 # 插件入口
├── bazi/                   # 八字计算核心
│   ├── calculator.ts       # 八字计算器
│   └── types.ts           # 类型定义
├── commands/               # 命令管理
│   └── CommandManager.ts   # 命令注册器
├── components/             # Svelte组件
│   ├── BaziShenShaDetail.svelte
│   └── ShenShaDetailModal.svelte
├── config/                 # 配置文件
│   └── WuXingConfig.ts     # 五行配置
├── parser/                 # 解析器
│   └── dateParser.ts       # 日期解析
├── processors/             # 处理器
│   └── CodeBlockProcessor.ts # 代码块处理
├── services/               # 服务层
│   ├── BaziService.ts      # 八字服务
│   ├── ShenShaService.ts   # 神煞服务
│   ├── GeJuService.ts      # 格局服务
│   └── WuXingService.ts    # 五行服务
├── settings/               # 设置管理
│   └── PluginSettings.ts   # 插件设置
├── types/                  # 类型定义
│   ├── BaziInfo.ts         # 八字信息类型
│   └── PluginTypes.ts      # 插件类型
└── ui/                     # UI组件
    ├── BaziView.ts         # 八字视图
    ├── SimpleBaziView.ts   # 简单视图
    ├── StandardBaziView.ts # 标准视图
    └── InteractiveBaziView.ts # 交互视图
```

## 🔧 核心模块说明

### 1. BaziService (八字服务)
负责八字计算的核心逻辑：
- 公历/农历日期转换
- 四柱八字计算
- 藏干、纳音计算
- 五行强度分析

### 2. ShenShaService (神煞服务)
处理30种神煞的计算：
- 基于不同依据的神煞计算
- 神煞组合分析
- 神煞详情查询

### 3. CodeBlockProcessor (代码块处理器)
处理 Obsidian 中的 bazi 代码块：
- 参数解析
- 视图渲染
- 交互事件处理

### 4. UI组件系统
三种显示样式的实现：
- SimpleBaziView: 简洁显示
- StandardBaziView: 标准显示
- InteractiveBaziView: 完整交互

## 🎨 样式开发

### CSS 架构
```css
/* 基础样式 */
.bazi-view-container { }

/* 简单样式 */
.simple-bazi-view { }

/* 标准样式 */
.standard-bazi-view { }

/* 五行颜色系统 */
.wuxing-jin { color: #FFD700; }
.wuxing-mu { color: #228B22; }
.wuxing-shui { color: #1E90FF; }
.wuxing-huo { color: #FF4500; }
.wuxing-tu { color: #8B4513; }
```

### 响应式设计
- 使用 CSS Grid 和 Flexbox
- 支持暗色/亮色主题
- 移动端适配

## 🧪 测试指南

### 单元测试
```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

### 手动测试
1. 创建测试用例代码块
2. 验证不同参数组合
3. 检查UI交互功能
4. 测试错误处理

### 测试用例示例
```markdown
```bazi
date: 1990-01-01 08:00
gender: 男
style: 3
```

```bazi
bazi: 庚午 戊子 乙卯 辛巳
```

```bazi
lunar: 农历1989年十一月廿五日辰时
gender: 女
```

## 🚀 发布流程

### 版本管理
1. 更新 `manifest.json` 中的版本号
2. 更新 `package.json` 中的版本号
3. 更新 `versions.json` 文件

### 构建发布
```bash
# 构建生产版本
npm run build

# 运行发布脚本
npm run deploy
```

### 发布检查清单
- [ ] 功能测试通过
- [ ] 代码质量检查
- [ ] 文档更新完整
- [ ] 版本号正确
- [ ] 构建无错误

## 🐛 调试技巧

### 开发者工具
- 使用 Obsidian 开发者控制台
- 启用插件调试模式
- 查看网络请求和错误日志

### 常见问题
1. **插件不加载**: 检查 manifest.json 格式
2. **样式异常**: 检查 CSS 选择器优先级
3. **计算错误**: 验证 lunar-typescript 版本

### 日志系统
```typescript
// 在设置中启用调试模式
if (this.plugin.settings.debugMode) {
    console.log('调试信息:', data);
}
```

## 🤝 贡献指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 保持代码注释完整

### 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建工具更新
```

### Pull Request 流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 PR
5. 代码审查
6. 合并主分支
