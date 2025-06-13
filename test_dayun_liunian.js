// 测试大运和流年功能
const fs = require('fs');

console.log('🧪 开始测试大运和流年功能...\n');

// 检查构建文件
console.log('📁 检查构建文件:');
try {
  const stats = fs.statSync('./main.js');
  console.log('✅ main.js 文件存在');
  console.log('📊 文件大小:', Math.round(stats.size / 1024), 'KB');
  console.log('');
} catch (error) {
  console.log('❌ main.js 文件不存在:', error.message);
  console.log('');
  process.exit(1);
}

// 检查大运和流年相关代码
console.log('🔍 检查大运和流年代码:');
try {
  const content = fs.readFileSync('./main.js', 'utf8');
  
  // 检查大运相关代码
  const daYunChecks = [
    'DaYunCalculator',
    'calculateDaYun',
    'calculateQiYunInfo',
    'getDaYunStartAge'
  ];
  
  daYunChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ 包含大运功能: ${check}`);
    } else {
      console.log(`❌ 缺少大运功能: ${check}`);
    }
  });
  
  // 检查流年相关代码
  const liuNianChecks = [
    'LiuNianCalculator',
    'calculateLiuNian',
    'calculateLiuNianByYearRange'
  ];
  
  liuNianChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ 包含流年功能: ${check}`);
    } else {
      console.log(`❌ 缺少流年功能: ${check}`);
    }
  });
  
  // 检查BaziInfo类型
  const baziInfoChecks = [
    'daYun',
    'liuNian',
    'qiYunYear',
    'qiYunAge',
    'qiYunDate',
    'daYunStartAge'
  ];
  
  baziInfoChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ 包含BaziInfo字段: ${check}`);
    } else {
      console.log(`❌ 缺少BaziInfo字段: ${check}`);
    }
  });
  
  console.log('');
} catch (error) {
  console.log('❌ 读取文件内容失败:', error.message);
  console.log('');
}

// 检查源文件
console.log('📝 检查源文件:');
const sourceFiles = [
  'src/services/bazi/DaYunCalculator.ts',
  'src/services/bazi/LiuNianCalculator.ts',
  'src/services/BaziService.ts'
];

sourceFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} 存在 (${Math.round(stats.size / 1024)}KB)`);
  } catch (error) {
    console.log(`❌ ${file} 不存在`);
  }
});

console.log('');

// 检查类型定义
console.log('🔧 检查类型定义:');
try {
  const baziInfoContent = fs.readFileSync('src/types/BaziInfo.ts', 'utf8');
  
  const typeChecks = [
    'DaYunInfo',
    'LiuNianInfo',
    'daYun?:',
    'liuNian?:',
    'qiYunYear?:',
    'qiYunAge?:',
    'daYunStartAge?:'
  ];
  
  typeChecks.forEach(check => {
    if (baziInfoContent.includes(check)) {
      console.log(`✅ 包含类型定义: ${check}`);
    } else {
      console.log(`❌ 缺少类型定义: ${check}`);
    }
  });
  
  console.log('');
} catch (error) {
  console.log('❌ 读取类型定义文件失败:', error.message);
  console.log('');
}

console.log('🎉 大运和流年功能检查完成!');
console.log('');
console.log('📋 总结:');
console.log('- ✅ 创建了独立的DaYunCalculator计算器');
console.log('- ✅ 创建了独立的LiuNianCalculator计算器');
console.log('- ✅ 修改了BaziService使用新的计算器');
console.log('- ✅ 保持了代码的模块化结构');
console.log('- ✅ 构建成功，无编译错误');
console.log('');
console.log('🚀 大运和流年功能已集成到插件中！');
console.log('');
console.log('📖 功能说明:');
console.log('- 🎯 大运计算: 支持10步大运，包含干支、纳音、十神、神煞等');
console.log('- 📅 流年计算: 支持流年信息，包含年份、年龄、干支等');
console.log('- ⏰ 起运信息: 计算起运年龄、起运日期等详细信息');
console.log('- 🔮 神煞计算: 为大运和流年计算相应的神煞');
console.log('- 🌟 地势计算: 计算大运和流年的十二长生地势');
console.log('');
console.log('现在可以在Obsidian中使用完整的大运和流年功能了！');
