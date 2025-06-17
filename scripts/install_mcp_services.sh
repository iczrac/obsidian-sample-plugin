#!/bin/bash

# 八字插件项目 - 免费MCP服务安装脚本
# 作者: AI Assistant
# 日期: 2025-01-17

echo "🚀 开始为八字插件项目安装免费MCP服务..."

# 检查必要工具
echo "📋 检查必要工具..."

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查 Python 和 uv
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 安装 uv (如果未安装)
if ! command -v uv &> /dev/null; then
    echo "📦 安装 uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
fi

# 安装 MCP CLI 工具
echo "🔧 安装 MCP CLI 工具..."
pip install mcp-cli

# 测试 MCP 服务器
echo "🧪 测试 MCP 服务器..."

echo "✅ 测试 Git MCP Server..."
uvx mcp-server-git --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Git MCP Server 可用"
else
    echo "  ❌ Git MCP Server 不可用"
fi

echo "✅ 测试 Filesystem MCP Server..."
npx -y @modelcontextprotocol/server-filesystem --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Filesystem MCP Server 可用"
else
    echo "  ❌ Filesystem MCP Server 不可用"
fi

echo "✅ 测试 Memory MCP Server..."
npx -y @modelcontextprotocol/server-memory --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Memory MCP Server 可用"
else
    echo "  ❌ Memory MCP Server 不可用"
fi

echo "✅ 测试 Fetch MCP Server..."
npx -y @modelcontextprotocol/server-fetch --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Fetch MCP Server 可用"
else
    echo "  ❌ Fetch MCP Server 不可用"
fi

echo "✅ 测试 Time MCP Server..."
npx -y @modelcontextprotocol/server-time --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Time MCP Server 可用"
else
    echo "  ❌ Time MCP Server 不可用"
fi

# 创建 Claude Desktop 配置目录
echo "📁 配置 Claude Desktop..."
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
mkdir -p "$CLAUDE_CONFIG_DIR"

# 复制配置文件
if [ -f "config/claude_desktop_mcp_config.json" ]; then
    cp "config/claude_desktop_mcp_config.json" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    echo "  ✅ Claude Desktop 配置已更新"
else
    echo "  ❌ 配置文件不存在，请手动配置"
fi

echo ""
echo "🎉 MCP 服务安装完成！"
echo ""
echo "📋 下一步操作："
echo "1. 重启 Claude Desktop 应用"
echo "2. 在对话中测试 MCP 功能"
echo "3. 使用 'mcp-cli' 命令调试 MCP 服务"
echo ""
echo "🔧 测试命令："
echo "  mcp-cli --help"
echo "  mcp-cli list-tools git"
echo ""
echo "📖 更多信息请查看项目文档"
