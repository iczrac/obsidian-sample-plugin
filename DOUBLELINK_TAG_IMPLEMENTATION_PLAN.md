# 🔗🏷️ 双链和标签功能实现方案

## 🎯 **设计目标**

根据您的需求，实现一个可配置的双链和标签系统，支持：
1. **全局设置** - 在插件设置中统一配置
2. **单独八字设置** - 在每个八字右上角独立配置
3. **智能分类** - 自动判断使用双链还是标签
4. **可定制化** - 用户可以自定义双链和标签字段

## 📁 **文件架构**

### **1. 配置管理层**
```
src/config/
├── DoubleLinkTagConfig.ts      # 基础配置接口和默认配置
├── DoubleLinkTagSettings.ts    # 设置管理器（三层配置架构）
└── DoubleLinkTagSettingTab.ts  # 全局设置界面
```

### **2. 界面组件层**
```
src/components/
├── BaziLinkPanel.ts            # 双链面板（已更新）
├── BaziConfigPanel.ts          # 单个八字配置面板
└── BaziLinkToolbar.ts          # 工具栏组件（需更新）
```

### **3. 服务层**
```
src/services/
├── LinkService.ts              # 双链服务（已更新）
└── TagService.ts               # 标签服务
```

## 🏗️ **三层配置架构**

### **配置优先级**
```
单个八字配置 (最高) → 全局用户配置 (中等) → 全局默认配置 (最低)
```

### **配置层级详解**

#### **1. 默认配置层**
```typescript
// src/config/DoubleLinkTagConfig.ts
export const DEFAULT_DOUBLELINK_TAG_CONFIG = {
    doubleLinks: {
        person: { enabled: true, fields: ["人名", "姓名", "历史人物"] },
        shenSha: { enabled: true, fields: ["天乙贵人", "文昌", "桃花"] },
        // ...
    },
    tags: {
        profession: { enabled: true, fields: ["政治家", "企业家", "明星"] },
        wuxingStrength: { enabled: true, fields: ["甲木日主旺", "丙火日主弱"] },
        // ...
    }
};
```

#### **2. 全局用户配置层**
```typescript
// 用户在插件设置中的自定义配置
globalConfig: DoubleLinkTagConfig
```

#### **3. 单个八字配置层**
```typescript
// 每个八字的独立配置
individualConfigs: {
    [baziId: string]: {
        enabled: boolean;
        config: Partial<DoubleLinkTagConfig>;
        lastModified: number;
    }
}
```

## 🎨 **用户界面设计**

### **1. 全局设置界面**

#### **设置位置**
- 插件设置 → "双链和标签设置" 标签页

#### **设置内容**
```
🔗🏷️ 双链和标签设置

📋 基础设置
├── [✓] 启用双链和标签功能
├── [✓] 自动建议
├── [✓] 智能检测
└── [✓] 显示配置按钮

🔗 双链设置（专属名称）
├── [✓] 人物相关 (15 个字段)
├── [✓] 神煞相关 (20 个字段)
├── [✓] 地名相关 (8 个字段)
├── [✓] 书籍典籍 (7 个字段)
└── [📝] 自定义双链

🏷️ 标签设置（定性特征）
├── [✓] 职业类型 (14 个字段)
├── [✓] 五行强弱 (20 个字段)
├── [✓] 格局类型 (15 个字段)
├── [✓] 时代特征 (12 个字段)
└── [📝] 自定义标签

🛠️ 管理功能
├── 📊 配置统计
├── 🧹 清理过期配置
├── 🔄 重置为默认配置
└── 📤 导出/导入配置
```

### **2. 单个八字配置界面**

#### **触发方式**
- 八字命盘右上角 `⚙️ 配置` 按钮

#### **界面内容**
```
⚙️ 张三 双链标签配置

💡 配置说明
• 独立配置：为这个八字单独设置双链和标签规则
• 优先级：单独配置 > 全局配置 > 默认配置
• 继承关系：未设置的项目将继承全局配置

[✓] 启用单独配置

🔗 双链配置
├── [✓] 人物相关 (15 个字段) (继承全局) [编辑字段]
├── [✓] 神煞相关 (20 个字段) (已自定义) [编辑字段]
└── ...

🏷️ 标签配置
├── [✓] 职业类型 (14 个字段) (继承全局) [编辑字段]
├── [✓] 五行强弱 (20 个字段) (已自定义) [编辑字段]
└── ...

[👁️ 预览效果] [🔄 重置为全局配置] [关闭]
```

## 🚀 **工作流程**

### **用户操作流程**

#### **场景1：使用默认配置**
```
创建八字 → 自动使用默认配置 → 显示智能双链标签
```

#### **场景2：自定义全局配置**
```
插件设置 → 双链标签设置 → 修改全局配置 → 所有八字生效
```

#### **场景3：单独八字配置**
```
八字命盘 → ⚙️配置按钮 → 启用单独配置 → 自定义设置 → 仅此八字生效
```

### **系统处理流程**

#### **配置加载**
```
1. 加载默认配置
2. 合并全局用户配置
3. 检查单个八字配置
4. 生成最终有效配置
```

#### **智能生成**
```
1. 收集八字相关内容
2. 应用有效配置规则
3. 智能判断双链/标签
4. 生成建议列表
5. 渲染用户界面
```

## 🔧 **技术实现要点**

### **1. 配置管理**
```typescript
class DoubleLinkTagSettingsManager {
    // 获取有效配置（考虑优先级）
    getEffectiveConfig(baziId?: string): DoubleLinkTagConfig
    
    // 设置单个八字配置
    setIndividualConfig(baziId: string, enabled: boolean, config?: Partial<DoubleLinkTagConfig>)
    
    // 生成八字唯一ID
    generateBaziId(baziInfo: BaziInfo): string
}
```

### **2. 智能判断**
```typescript
class DoubleLinkTagConfigManager {
    // 判断是否使用双链
    shouldUseDoubleLink(content: string): boolean
    
    // 判断是否使用标签
    shouldUseTag(content: string): boolean
    
    // 获取建议
    getDoubleLinkSuggestions(content: string): string[]
    getTagSuggestions(content: string): string[]
}
```

### **3. 界面集成**
```typescript
// 工具栏集成
if (settingsManager.getGlobalSettings().advanced.showConfigButton) {
    // 显示配置按钮
    configButton.addEventListener('click', () => {
        new BaziConfigPanel(app, baziInfo, settingsManager, onConfigChanged).open();
    });
}
```

## 📋 **实现步骤**

### **阶段1：基础架构** ✅
- [x] 创建配置接口和默认配置
- [x] 实现设置管理器
- [x] 创建全局设置界面
- [x] 创建单个八字配置面板

### **阶段2：服务集成** 🔄
- [ ] 更新LinkService使用新配置系统
- [ ] 集成智能判断逻辑
- [ ] 更新BaziLinkPanel使用新配置

### **阶段3：界面集成** 🔄
- [ ] 更新工具栏添加配置按钮
- [ ] 集成到CodeBlockProcessor
- [ ] 添加配置按钮显示控制

### **阶段4：测试优化** ⏳
- [ ] 功能测试
- [ ] 性能优化
- [ ] 用户体验优化

## 💡 **使用建议**

### **推荐配置策略**
1. **新用户**：使用默认配置开始
2. **进阶用户**：自定义全局配置
3. **专业用户**：为特殊八字设置单独配置

### **最佳实践**
1. **定期清理**：清理过期的单个配置
2. **备份配置**：定期导出配置备份
3. **渐进配置**：先全局后单独，避免过度配置

## 🎉 **预期效果**

### **用户体验**
- **简单易用**：默认配置即可满足大部分需求
- **高度可定制**：支持全局和单独配置
- **智能化**：自动判断和建议

### **功能特性**
- **层级配置**：三层配置架构，优先级清晰
- **实时生效**：配置修改立即生效
- **数据安全**：配置持久化存储，支持导入导出

这个实现方案完美满足了您的需求，提供了灵活而强大的双链标签配置系统！🌟
