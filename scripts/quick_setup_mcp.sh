#!/bin/bash

# 八字插件项目 - Git MCP 快速设置脚本
# 一键配置完整的Git MCP环境

set -e

echo "🎯 八字插件项目 Git MCP 快速设置"
echo "=================================="
echo ""

# 检查当前目录是否为项目根目录
if [ ! -f "package.json" ] || [ ! -f "manifest.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否为八字插件项目
if ! grep -q "obsidian-bazi-plugin" package.json; then
    echo "❌ 这不是八字插件项目目录"
    exit 1
fi

echo "✅ 项目目录验证通过"

# 1. 检查必要工具
echo ""
echo "📋 检查必要工具..."

# 检查Node.js（支持Homebrew路径）
NODE_CMD=""
if command -v node &> /dev/null; then
    NODE_CMD="node"
elif command -v /opt/homebrew/bin/node &> /dev/null; then
    NODE_CMD="/opt/homebrew/bin/node"
    export PATH="/opt/homebrew/bin:$PATH"
elif command -v /usr/local/bin/node &> /dev/null; then
    NODE_CMD="/usr/local/bin/node"
    export PATH="/usr/local/bin:$PATH"
else
    echo "❌ Node.js 未安装，请先安装 Node.js (>=18.0.0)"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$($NODE_CMD -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Node.js 版本过低，当前版本: $NODE_VERSION，需要版本: >= 18.0.0"
    exit 1
fi
echo "✅ Node.js 版本检查通过: $NODE_VERSION"

# 检查Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi
echo "✅ Git 检查通过: $(git --version)"

# 检查Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 检查通过: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo "✅ Python 检查通过: $(python --version)"
else
    echo "⚠️  Python 未找到，备份脚本可能无法运行"
fi

# 2. 安装Git MCP Server
echo ""
echo "📦 安装 Git MCP Server..."
# 使用正确的npm路径
if command -v npm &> /dev/null; then
    npm install -g @cyanheads/git-mcp-server
elif command -v /opt/homebrew/bin/npm &> /dev/null; then
    /opt/homebrew/bin/npm install -g @cyanheads/git-mcp-server
elif command -v /usr/local/bin/npm &> /dev/null; then
    /usr/local/bin/npm install -g @cyanheads/git-mcp-server
else
    echo "❌ npm 未找到，请检查Node.js安装"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Git MCP Server 安装成功"
else
    echo "❌ Git MCP Server 安装失败"
    exit 1
fi

# 3. 创建必要目录
echo ""
echo "📁 创建项目目录结构..."
mkdir -p config
mkdir -p logs
mkdir -p docs

# 4. 设置脚本权限
echo "🔧 设置脚本权限..."
chmod +x scripts/*.sh
chmod +x scripts/*.py

# 5. 验证配置文件
echo ""
echo "📝 验证配置文件..."

if [ ! -f "config/git_mcp_config.json" ]; then
    echo "❌ Git MCP 配置文件不存在"
    exit 1
fi
echo "✅ Git MCP 配置文件存在"

if [ ! -f "config/claude_desktop_mcp_config.json" ]; then
    echo "❌ Claude Desktop 配置文件不存在"
    exit 1
fi
echo "✅ Claude Desktop 配置文件存在"

# 6. 配置Augment MCP
echo ""
echo "🔧 配置 Augment MCP..."
AUGMENT_CONFIG="$HOME/.config/augment/mcp_settings.json"
mkdir -p "$(dirname "$AUGMENT_CONFIG")"

if [ ! -f "$AUGMENT_CONFIG" ]; then
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
    echo "✅ Augment MCP 配置文件已创建"
else
    echo "ℹ️  Augment MCP 配置文件已存在"
fi

# 7. 配置Claude Desktop
echo ""
echo "🔧 配置 Claude Desktop..."
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
mkdir -p "$CLAUDE_CONFIG_DIR"

if [ -f "config/claude_desktop_mcp_config.json" ]; then
    cp "config/claude_desktop_mcp_config.json" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    echo "✅ Claude Desktop 配置已更新"
else
    echo "⚠️  Claude Desktop 配置文件不存在"
fi

# 8. 测试安装
echo ""
echo "🧪 测试安装..."
# 使用timeout来避免卡住
if timeout 10s npx @cyanheads/git-mcp-server --help &> /dev/null; then
    echo "✅ Git MCP Server 测试通过"
else
    echo "⚠️  Git MCP Server 测试超时或失败，但安装可能仍然成功"
fi

# 9. 测试备份脚本
echo ""
echo "🧪 测试备份脚本..."
if timeout 10s python3 scripts/git_milestone_backup.py --help &> /dev/null; then
    echo "✅ 备份脚本测试通过"
else
    echo "⚠️  备份脚本测试失败"
fi

# 10. 显示完成信息
echo ""
echo "🎉 八字插件项目 Git MCP 设置完成！"
echo "=================================="
echo ""
echo "📋 下一步操作："
echo "   1. 重启 Augment 或 Claude Desktop"
echo "   2. 测试 MCP 功能"
echo "   3. 创建第一个里程碑备份"
echo ""
echo "🔧 快速测试命令："
echo "   python3 scripts/git_milestone_backup.py status"
echo "   python3 scripts/git_milestone_backup.py list"
echo ""
echo "📖 详细使用指南："
echo "   查看 docs/git-mcp-guide.md"
echo ""
echo "🎯 八字插件开发里程碑："
echo "   - bazi_core_complete: 八字核心功能完成"
echo "   - ui_components_complete: UI组件系统完成"
echo "   - calculation_services_complete: 计算服务系统完成"
echo "   - extended_features_complete: 扩展功能完成"
echo "   - bug_fixes_phase1: 第一阶段Bug修复完成"
echo ""
echo "✨ 开始使用 Git MCP 管理您的八字插件开发进度吧！"
