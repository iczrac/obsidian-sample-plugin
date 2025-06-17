# Git MCP 使用示例

本文档展示了如何在八字插件项目中使用Git MCP服务进行自动化Git操作和里程碑管理。

## 基础使用

### 1. 查看项目状态

```bash
# 使用备份脚本查看状态
python3 scripts/git_milestone_backup.py status
```

输出示例：
```
📊 当前Git状态:
   - 当前分支: master
   - 最新提交: 327c91ba
   - 工作区状态: 有更改
   - 未推送提交: 105
```

### 2. 查看可用里程碑

```bash
python3 scripts/git_milestone_backup.py list
```

输出示例：
```
📋 可用的里程碑:
   🎯 bazi_core_complete: 八字核心功能完成
   🎯 ui_components_complete: UI组件系统完成
   🎯 calculation_services_complete: 计算服务系统完成
   🎯 extended_features_complete: 扩展功能完成
   🎯 bug_fixes_phase1: 第一阶段Bug修复完成
   ...
```

## 里程碑备份示例

### 创建Bug修复里程碑

```bash
# 强制创建备份（忽略工作区更改）
python3 scripts/git_milestone_backup.py backup --milestone bug_fixes_phase1 --force
```

成功输出：
```
🎯 开始创建里程碑备份: 第一阶段Bug修复完成
🔄 切换到目标分支: bugfix/phase1
📝 添加所有更改到暂存区
💾 创建里程碑提交
🏷️  创建标签: v1.0.1-bugfix1
☁️  推送到远程仓库
💾 创建自动备份分支: backup-20250617_121354
✅ 里程碑备份完成: bug_fixes_phase1
📊 备份信息:
   - 分支: bugfix/phase1
   - 备份分支: backup-20250617_121354
   - 标签: v1.0.1-bugfix1
   - 时间戳: 20250617_121354
```

### 创建核心功能完成里程碑

```bash
python3 scripts/git_milestone_backup.py backup --milestone bazi_core_complete
```

### 创建UI组件完成里程碑

```bash
python3 scripts/git_milestone_backup.py backup --milestone ui_components_complete
```

## 在AI助手中使用

### Augment中的自然语言命令

重启Augment后，可以使用以下自然语言命令：

#### Git状态查询
- "帮我检查当前Git状态"
- "查看最近的提交记录"
- "显示工作区的更改"
- "查看未推送的提交"

#### 里程碑管理
- "创建八字核心功能完成的里程碑备份"
- "为Bug修复阶段创建备份"
- "查看可用的里程碑列表"
- "创建UI组件完成的里程碑"

#### 代码管理
- "推送当前更改到远程仓库"
- "查看分支状态"
- "显示最近的差异"
- "切换到主分支"

### Claude Desktop中的使用

在Claude Desktop中，可以直接询问：

```
请帮我：
1. 检查八字插件项目的Git状态
2. 创建一个里程碑备份
3. 推送更改到GitHub
```

## 开发工作流示例

### 完成一个功能的完整流程

1. **开发功能**
   ```bash
   # 创建功能分支
   git checkout -b feature/new-calculation
   
   # 开发代码...
   # 测试功能...
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新的计算功能"
   ```

3. **创建里程碑备份**
   ```bash
   python3 scripts/git_milestone_backup.py backup --milestone calculation_services_complete
   ```

4. **合并到主分支**
   ```bash
   git checkout master
   git merge feature/new-calculation
   ```

### Bug修复工作流

1. **创建修复分支**
   ```bash
   git checkout -b bugfix/fix-calculation-error
   ```

2. **修复Bug并测试**
   ```bash
   # 修复代码...
   git add .
   git commit -m "fix: 修复计算错误"
   ```

3. **创建Bug修复里程碑**
   ```bash
   python3 scripts/git_milestone_backup.py backup --milestone bug_fixes_phase1 --force
   ```

## 自动化功能

### 自动备份触发器

配置文件中的自动备份触发器：

```json
{
  "backupTriggers": {
    "onMajorFeature": true,    // 主要功能完成时
    "onBugFix": true,          // Bug修复完成时
    "onRefactor": true,        // 重构完成时
    "onRelease": true          // 版本发布时
  }
}
```

### 备份清理

```bash
# 清理旧的备份分支（保留最新5个）
python3 scripts/git_milestone_backup.py cleanup
```

输出示例：
```
🧹 开始清理旧的备份分支...
🗑️  删除旧备份分支: backup-20250601_100000
🗑️  删除旧备份分支: backup-20250602_100000
✅ 清理完成，保留了最新的 5 个备份
```

## 故障排除示例

### 权限问题

```bash
# 如果遇到权限错误
chmod +x scripts/*.sh scripts/*.py
```

### 配置验证

```bash
# 验证配置文件格式
cat config/git_mcp_config.json | python3 -m json.tool
```

### 测试MCP服务

```bash
# 测试Git MCP服务
npx @cyanheads/git-mcp-server --help
```

## 高级用法

### 自定义里程碑

在`config/git_mcp_config.json`中添加：

```json
{
  "custom_feature_complete": {
    "description": "自定义功能完成",
    "branch": "feature/custom-feature",
    "commitMessage": "🎯 里程碑：自定义功能完成\n\n- 实现自定义计算\n- 添加新的UI组件\n- 完成测试",
    "tags": ["v1.1.0-custom"]
  }
}
```

然后使用：
```bash
python3 scripts/git_milestone_backup.py backup --milestone custom_feature_complete
```

### 批量操作

```bash
# 创建多个里程碑（脚本示例）
for milestone in bazi_core_complete ui_components_complete; do
    python3 scripts/git_milestone_backup.py backup --milestone $milestone --force
done
```

## 最佳实践

1. **定期备份**：完成重要功能后立即创建里程碑
2. **清理分支**：定期运行cleanup命令清理旧备份
3. **描述性提交**：使用清晰的提交信息
4. **测试验证**：备份前确保功能正常工作
5. **文档更新**：重要里程碑后更新文档

这些示例展示了Git MCP在八字插件项目中的实际应用，帮助您更好地管理开发进度和代码版本。
