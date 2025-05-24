#!/bin/bash

# 八字命盘插件开发环境设置脚本

# 设置变量
PLUGIN_NAME="bazi-obsidian"
SOURCE_DIR="/Users/rac/Documents/AIWorkRoom/bazi-Obsidian"
OBSIDIAN_PLUGINS_DIR="/Users/rac/Documents/Obsidian/插件开发/.obsidian/plugins"
TARGET_LINK="$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  八字命盘插件开发环境设置${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ 错误: 源目录不存在: $SOURCE_DIR${NC}"
    exit 1
fi

# 检查Obsidian插件目录是否存在
if [ ! -d "$OBSIDIAN_PLUGINS_DIR" ]; then
    echo -e "${RED}❌ 错误: Obsidian插件目录不存在: $OBSIDIAN_PLUGINS_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}源目录: $SOURCE_DIR${NC}"
echo -e "${YELLOW}目标目录: $TARGET_LINK${NC}"
echo ""

# 检查是否已经存在目标目录或链接
if [ -e "$TARGET_LINK" ]; then
    echo -e "${YELLOW}⚠️  目标位置已存在内容${NC}"
    
    # 检查是否是符号链接
    if [ -L "$TARGET_LINK" ]; then
        CURRENT_TARGET=$(readlink "$TARGET_LINK")
        echo -e "${YELLOW}当前符号链接指向: $CURRENT_TARGET${NC}"
        
        if [ "$CURRENT_TARGET" = "$SOURCE_DIR" ]; then
            echo -e "${GREEN}✅ 符号链接已正确设置，无需重复操作${NC}"
            exit 0
        else
            echo -e "${YELLOW}符号链接指向不正确，将重新设置...${NC}"
        fi
    else
        echo -e "${YELLOW}存在同名目录，将备份后重新设置...${NC}"
        BACKUP_NAME="${TARGET_LINK}.backup.$(date +%Y%m%d_%H%M%S)"
        mv "$TARGET_LINK" "$BACKUP_NAME"
        echo -e "${GREEN}已备份到: $BACKUP_NAME${NC}"
    fi
    
    # 删除现有的链接或目录
    rm -rf "$TARGET_LINK"
fi

# 创建符号链接
echo -e "${YELLOW}正在创建符号链接...${NC}"
ln -s "$SOURCE_DIR" "$TARGET_LINK"

# 检查链接是否创建成功
if [ -L "$TARGET_LINK" ] && [ -e "$TARGET_LINK" ]; then
    echo -e "${GREEN}✅ 符号链接创建成功！${NC}"
    echo ""
    echo -e "${GREEN}现在您可以：${NC}"
    echo -e "${GREEN}1. 运行 'npm run build' 构建插件${NC}"
    echo -e "${GREEN}2. 在Obsidian中重新加载插件${NC}"
    echo -e "${GREEN}3. 每次修改代码后只需重新构建即可${NC}"
    echo ""
    echo -e "${BLUE}开发工作流程：${NC}"
    echo -e "${BLUE}  修改代码 → npm run build → 在Obsidian中重新加载插件${NC}"
else
    echo -e "${RED}❌ 符号链接创建失败${NC}"
    exit 1
fi
