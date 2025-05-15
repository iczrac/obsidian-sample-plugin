import { Lunar } from 'lunar-typescript';

export class DateParser {
  static parseSolarDate(dateStr: string): { year: number; month: number; day: number } {
    // 公历日期解析逻辑
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  static parseLunarDate(dateStr: string): { year: number; month: number; day: number } {
    // 农历日期解析逻辑
    const [year, month, day] = dateStr.split('-').map(Number);
    const lunar = Lunar.fromYmd(year, month, day);
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay()
    };
  }
}