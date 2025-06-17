# 八字插件项目 Git MCP 使用指南

## 概述

本项目集成了Git MCP (Model Context Protocol) 服务，用于自动化Git操作和里程碑备份管理。

## 安装和配置

### 1. 安装Git MCP服务

```bash
# 运行安装脚本
./scripts/setup_git_mcp.sh

# 或者手动安装
npm install -g @cyanheads/git-mcp-server
```

### 2. 配置Augment/Claude Desktop

安装脚本会自动创建配置文件：
- `~/.config/augment/mcp_settings.json` (Augment)
- `~/Library/Application Support/Claude/claude_desktop_config.json` (Claude Desktop)

### 3. 验证安装

```bash
# 测试Git MCP服务
npx @cyanheads/git-mcp-server --help

# 查看项目状态
python3 scripts/git_milestone_backup.py status
```

## 里程碑管理

### 可用里程碑

1. **bazi_core_complete** - 八字核心功能完成
2. **ui_components_complete** - UI组件系统完成
3. **calculation_services_complete** - 计算服务系统完成
4. **extended_features_complete** - 扩展功能完成
5. **bug_fixes_phase1** - 第一阶段Bug修复完成
6. **performance_optimization** - 性能优化完成
7. **testing_complete** - 测试系统完成
8. **documentation_complete** - 文档系统完成
9. **release_candidate** - 发布候选版本
10. **production_release** - 正式版本发布

### 使用命令

```bash
# 查看所有可用里程碑
python3 scripts/git_milestone_backup.py list

# 创建里程碑备份
python3 scripts/git_milestone_backup.py backup --milestone bazi_core_complete

# 查看当前Git状态
python3 scripts/git_milestone_backup.py status

# 清理旧备份
python3 scripts/git_milestone_backup.py cleanup
```

## 在AI助手中使用

重启Augment或Claude Desktop后，可以直接使用自然语言命令：

### Git状态查询
- "帮我检查当前Git状态"
- "查看最近的提交记录"
- "显示工作区的更改"

### 里程碑备份
- "创建八字核心功能完成的里程碑备份"
- "为UI组件完成创建备份"
- "查看可用的里程碑列表"

### 代码管理
- "推送当前更改到远程仓库"
- "查看分支状态"
- "显示最近的差异"

## 自动化功能

### 自动备份触发器
- 主要功能完成时
- Bug修复完成时
- 重构完成时
- 版本发布时

### 备份策略
- 自动创建带时间戳的备份分支
- 推送到远程仓库
- 保留最新5个备份
- 自动清理旧备份

## 配置文件说明

### config/git_mcp_config.json
项目的Git MCP配置文件，包含：
- 项目信息
- 里程碑定义
- 自动备份设置
- MCP服务配置

### 自定义里程碑
可以在配置文件中添加新的里程碑：

```json
{
  "custom_milestone": {
    "description": "自定义里程碑描述",
    "branch": "feature/custom-feature",
    "commitMessage": "🎯 里程碑：自定义功能完成",
    "tags": ["v1.0.0-custom"]
  }
}
```

## 故障排除

### 常见问题

1. **Git MCP服务无法启动**
   - 检查Node.js版本 (>=18.0.0)
   - 重新安装：`npm install -g @cyanheads/git-mcp-server`

2. **Python脚本执行失败**
   - 确保Python3已安装
   - 检查配置文件路径

3. **远程推送失败**
   - 检查Git远程仓库配置
   - 验证访问权限

### 日志查看

```bash
# 查看MCP服务日志
tail -f logs/mcp.log

# 查看备份脚本日志
python3 scripts/git_milestone_backup.py status --verbose
```

## 最佳实践

1. **定期创建里程碑备份**
   - 完成主要功能后立即备份
   - 重要Bug修复后备份
   - 发布前创建候选版本备份

2. **保持分支整洁**
   - 使用有意义的分支名称
   - 定期清理旧的备份分支
   - 合并完成的功能分支

3. **提交信息规范**
   - 使用约定式提交格式
   - 包含功能描述和影响范围
   - 添加相关的标签和里程碑信息

## 支持和反馈

如有问题或建议，请：
1. 查看项目文档
2. 检查配置文件
3. 查看日志文件
4. 联系项目维护者
