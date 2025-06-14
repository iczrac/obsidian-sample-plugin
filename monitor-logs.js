#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 开始监控Obsidian插件日志...');
console.log('📝 请在Obsidian中测试八字插件');
console.log('🚀 日志信息将在下方显示');
console.log('=' .repeat(60));

// 监控Obsidian日志文件（如果存在）
const possibleLogPaths = [
  path.join(process.env.HOME, 'Library/Logs/Obsidian/main.log'),
  path.join(process.env.HOME, 'Library/Application Support/obsidian/logs/main.log'),
  path.join(process.env.APPDATA, 'obsidian/logs/main.log'),
  '/tmp/obsidian.log'
];

let logPath = null;
for (const logFile of possibleLogPaths) {
  if (fs.existsSync(logFile)) {
    logPath = logFile;
    break;
  }
}

if (logPath) {
  console.log(`📂 找到日志文件: ${logPath}`);
  
  // 监控日志文件变化
  fs.watchFile(logPath, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
      // 读取新增内容
      const data = fs.readFileSync(logPath, 'utf8');
      const lines = data.split('\n');
      
      // 过滤八字插件相关日志
      const baziLogs = lines.filter(line => 
        line.includes('bazi-obsidian') || 
        line.includes('WuXingStrengthCalculator') ||
        line.includes('🚀') || 
        line.includes('🔍')
      );
      
      if (baziLogs.length > 0) {
        console.log('\n📋 新的八字插件日志:');
        baziLogs.forEach(log => console.log(log));
        console.log('-'.repeat(40));
      }
    }
  });
} else {
  console.log('❌ 未找到Obsidian日志文件');
  console.log('💡 请使用浏览器开发者工具查看日志');
}

// 保持脚本运行
process.stdin.resume();
console.log('\n💡 按 Ctrl+C 停止监控');
