# 八字插件项目 Git MCP 脚本

这个目录包含了用于管理八字插件项目Git操作和里程碑备份的MCP (Model Context Protocol) 脚本。

## 脚本概览

### 🚀 快速设置
- **`quick_setup_mcp.sh`** - 一键配置完整的Git MCP环境

### 🔧 安装脚本
- **`setup_git_mcp.sh`** - 安装和配置Git MCP服务
- **`install_mcp_services.sh`** - 安装所有免费MCP服务

### 🎯 备份管理
- **`git_milestone_backup.py`** - 里程碑自动备份脚本

## 快速开始

### 1. 一键设置（推荐）

```bash
# 在项目根目录运行
./scripts/quick_setup_mcp.sh
```

这个脚本会：
- 检查必要工具（Node.js, Git, Python）
- 安装Git MCP Server
- 创建必要的目录结构
- 配置Augment和Claude Desktop
- 验证安装

### 2. 手动设置

如果需要分步骤设置：

```bash
# 1. 安装Git MCP服务
./scripts/setup_git_mcp.sh

# 2. 安装其他MCP服务（可选）
./scripts/install_mcp_services.sh
```

## 使用方法

### 里程碑管理

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

### 在AI助手中使用

重启Augment或Claude Desktop后，可以使用自然语言：

- "帮我检查当前Git状态"
- "创建八字核心功能完成的里程碑备份"
- "推送当前更改到远程仓库"
- "查看八字插件的开发进度"

## 八字插件项目里程碑

| 里程碑 | 描述 | 分支 |
|--------|------|------|
| `bazi_core_complete` | 八字核心功能完成 | `feature/bazi-core` |
| `ui_components_complete` | UI组件系统完成 | `feature/ui-components` |
| `calculation_services_complete` | 计算服务系统完成 | `feature/calculation-services` |
| `extended_features_complete` | 扩展功能完成 | `feature/extended-features` |
| `bug_fixes_phase1` | 第一阶段Bug修复完成 | `bugfix/phase1` |
| `performance_optimization` | 性能优化完成 | `feature/performance` |
| `testing_complete` | 测试系统完成 | `feature/testing` |
| `documentation_complete` | 文档系统完成 | `feature/documentation` |
| `release_candidate` | 发布候选版本 | `release/v1.0` |
| `production_release` | 正式版本发布 | `master` |

## 配置文件

### config/git_mcp_config.json
项目的Git MCP配置文件，包含：
- 项目信息和仓库设置
- 里程碑定义和分支策略
- 自动备份配置
- MCP服务设置

### config/claude_desktop_mcp_config.json
Claude Desktop的MCP配置文件，包含：
- Git MCP服务配置
- 文件系统访问配置
- 内存和网络服务配置

## 系统要求

- **Node.js** >= 18.0.0
- **Git** (任何现代版本)
- **Python3** (用于备份脚本)
- **npm** (通常随Node.js安装)

## 故障排除

### 常见问题

1. **权限错误**
   ```bash
   chmod +x scripts/*.sh scripts/*.py
   ```

2. **Node.js版本过低**
   - 升级到Node.js 18或更高版本

3. **Git MCP服务无法启动**
   ```bash
   npm install -g @cyanheads/git-mcp-server
   ```

4. **Python脚本执行失败**
   - 确保使用`python3`而不是`python`

### 日志和调试

```bash
# 测试Git MCP服务
npx @cyanheads/git-mcp-server --help

# 查看详细状态
python3 scripts/git_milestone_backup.py status

# 验证配置文件
cat config/git_mcp_config.json | python3 -m json.tool
```

## 自定义配置

### 添加新里程碑

编辑`config/git_mcp_config.json`：

```json
{
  "gitAutomation": {
    "milestones": {
      "your_custom_milestone": {
        "description": "自定义里程碑描述",
        "branch": "feature/your-feature",
        "commitMessage": "🎯 里程碑：自定义功能完成",
        "tags": ["v1.0.0-custom"]
      }
    }
  }
}
```

### 修改备份策略

在配置文件中调整：
- `autoBackup.remoteBackup` - 是否推送到远程
- `cleanupOldBackups.keepLast` - 保留备份数量
- `backupTriggers` - 自动备份触发条件

## 支持

- 📖 详细指南：`docs/git-mcp-guide.md`
- 🔧 配置文件：`config/`目录
- 📝 日志文件：`logs/`目录

如有问题，请检查配置文件和日志，或联系项目维护者。
