const fs = require('fs');
const path = require('path');

// 读取BaziService.ts文件
const filePath = './src/services/BaziService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 需要删除的未使用方法列表
const unusedMethods = [
  'adjustByMonthSeasonWithDetails',
  'adjustByCombination', 
  'adjustByCombinationWithDetails',
  'checkWuHeJu',
  'getWuHeWuXing',
  'isTongZiSha',
  'isJiangJunJian',
  'calculateGeJu'
];

// 删除每个未使用的方法
unusedMethods.forEach(methodName => {
  // 匹配方法的正则表达式
  const methodRegex = new RegExp(
    `\\s*\\/\\*\\*[\\s\\S]*?\\*\\/\\s*private\\s+static\\s+${methodName}[\\s\\S]*?^\\s*}`,
    'gm'
  );
  
  content = content.replace(methodRegex, '');
});

// 删除多余的空行
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('清理完成！已删除未使用的方法：', unusedMethods.join(', '));
