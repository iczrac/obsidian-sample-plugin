import { Solar, Lunar } from 'lunar-typescript';

// 通过阳历日期获取八字信息
const solar = Solar.fromYmd(1986, 5, 29);
const lunar = solar.getLunar();
console.log('阳历:', solar.toFullString());
console.log('农历:', lunar.toFullString());

// 获取八字信息
const eightChar = lunar.getEightChar();
console.log('八字:', eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime());
console.log('年柱:', eightChar.getYearGan(), eightChar.getYearZhi(), '(', eightChar.getYearNaYin(), ')');
console.log('月柱:', eightChar.getMonthGan(), eightChar.getMonthZhi(), '(', eightChar.getMonthNaYin(), ')');
console.log('日柱:', eightChar.getDayGan(), eightChar.getDayZhi(), '(', eightChar.getDayNaYin(), ')');
console.log('时柱:', eightChar.getTimeGan(), eightChar.getTimeZhi(), '(', eightChar.getTimeNaYin(), ')');

// 五行信息
console.log('年柱五行:', eightChar.getYearWuXing());
console.log('月柱五行:', eightChar.getMonthWuXing());
console.log('日柱五行:', eightChar.getDayWuXing());
console.log('时柱五行:', eightChar.getTimeWuXing());

// 纳音
console.log('年柱纳音:', eightChar.getYearNaYin());
console.log('月柱纳音:', eightChar.getMonthNaYin());
console.log('日柱纳音:', eightChar.getDayNaYin());
console.log('时柱纳音:', eightChar.getTimeNaYin());

// 胎元和命宫
console.log('胎元:', eightChar.getTaiYuan(), '(', eightChar.getTaiYuanNaYin(), ')');
console.log('命宫:', eightChar.getMingGong(), '(', eightChar.getMingGongNaYin(), ')');
