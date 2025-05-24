#!/bin/bash

# 八字命盘插件部署脚本

# 设置变量
PLUGIN_NAME="bazi-obsidian"
OBSIDIAN_PLUGINS_DIR="/Users/rac/Documents/Obsidian/插件开发/.obsidian/plugins"
TARGET_DIR="$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始部署八字命盘插件...${NC}"

# 检查必要文件是否存在
if [ ! -f "main.js" ]; then
    echo -e "${RED}错误: main.js 文件不存在，请先运行 npm run build${NC}"
    exit 1
fi

if [ ! -f "manifest.json" ]; then
    echo -e "${RED}错误: manifest.json 文件不存在${NC}"
    exit 1
fi

if [ ! -f "styles.css" ]; then
    echo -e "${RED}错误: styles.css 文件不存在${NC}"
    exit 1
fi

# 创建目标目录（如果不存在）
mkdir -p "$TARGET_DIR"

# 复制文件
echo -e "${YELLOW}复制文件到 Obsidian 插件目录...${NC}"
cp main.js "$TARGET_DIR/"
cp manifest.json "$TARGET_DIR/"
cp styles.css "$TARGET_DIR/"

# 检查复制是否成功
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 插件部署成功！${NC}"
    echo -e "${GREEN}文件已复制到: $TARGET_DIR${NC}"
    echo -e "${YELLOW}请在 Obsidian 中重新加载插件或重启 Obsidian${NC}"
else
    echo -e "${RED}❌ 插件部署失败${NC}"
    exit 1
fi
