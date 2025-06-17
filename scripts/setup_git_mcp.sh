#!/bin/bash

# Git MCP 服务安装和配置脚本
# 用于八字插件项目的自动化关键里程碑备份

set -e

echo "🚀 开始为八字插件项目安装 Git MCP 服务..."

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js (>=18.0.0)"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

# 简单的版本比较（避免依赖 semver）
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Node.js 版本过低，当前版本: $NODE_VERSION，需要版本: >= $REQUIRED_VERSION"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $NODE_VERSION"

# 安装 Git MCP Server
echo "📦 安装 Git MCP Server..."
npm install -g @cyanheads/git-mcp-server

if [ $? -eq 0 ]; then
    echo "✅ Git MCP Server 安装成功"
else
    echo "❌ Git MCP Server 安装失败"
    exit 1
fi

# 检查 Git 是否已安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

echo "✅ Git 检查通过: $(git --version)"

# 创建必要的目录
mkdir -p config
mkdir -p scripts
mkdir -p logs

# 设置脚本权限
chmod +x scripts/git_milestone_backup.py

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "✅ Python3 检查通过: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo "✅ Python 检查通过: $(python --version)"
else
    echo "⚠️  Python 未找到，备份脚本可能无法运行"
fi

# 创建 Augment MCP 配置文件（如果不存在）
AUGMENT_CONFIG="$HOME/.config/augment/mcp_settings.json"
if [ ! -f "$AUGMENT_CONFIG" ]; then
    echo "📝 创建 Augment MCP 配置文件..."
    mkdir -p "$(dirname "$AUGMENT_CONFIG")"

    cat > "$AUGMENT_CONFIG" << 'EOF'
{
  "mcpServers": {
    "git-mcp-server": {
      "command": "npx",
      "args": ["@cyanheads/git-mcp-server"],
      "env": {
        "MCP_TRANSPORT_TYPE": "stdio",
        "MCP_LOG_LEVEL": "info",
        "GIT_SIGN_COMMITS": "false"
      },
      "disabled": false,
      "autoApprove": [
        "git_status",
        "git_log",
        "git_diff",
        "git_branch",
        "git_show"
      ]
    }
  }
}
EOF
    echo "✅ Augment MCP 配置文件已创建: $AUGMENT_CONFIG"
else
    echo "ℹ️  Augment MCP 配置文件已存在: $AUGMENT_CONFIG"
fi

# 测试 Git MCP Server
echo "🧪 测试 Git MCP Server..."
if npx @cyanheads/git-mcp-server --help &> /dev/null; then
    echo "✅ Git MCP Server 测试通过"
else
    echo "⚠️  Git MCP Server 测试失败，但安装可能仍然成功"
fi

echo ""
echo "🎉 Git MCP 服务安装完成！"
echo ""
echo "📋 使用方法："
echo "   1. 查看可用里程碑:"
echo "      python3 scripts/git_milestone_backup.py list"
echo ""
echo "   2. 创建里程碑备份:"
echo "      python3 scripts/git_milestone_backup.py backup --milestone bazi_core_complete"
echo ""
echo "   3. 查看当前状态:"
echo "      python3 scripts/git_milestone_backup.py status"
echo ""
echo "   4. 清理旧备份:"
echo "      python3 scripts/git_milestone_backup.py cleanup"
echo ""
echo "📁 配置文件位置："
echo "   - 项目配置: config/git_mcp_config.json"
echo "   - Augment配置: $AUGMENT_CONFIG"
echo ""
echo "🔧 在 Augment 中使用："
echo "   重启 Augment 后，您可以直接使用 Git 相关命令："
echo "   - '帮我检查当前Git状态'"
echo "   - '创建八字核心功能完成的里程碑备份'"
echo "   - '推送当前更改到远程仓库'"
echo "   - '查看八字插件的开发进度'"
echo ""
echo "⚠️  注意事项："
echo "   - 确保您的项目已经初始化为 Git 仓库"
echo "   - 确保已配置 Git 用户信息 (git config user.name/user.email)"
echo "   - 如需推送到远程，请确保已配置远程仓库"
echo ""
