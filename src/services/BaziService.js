import { Solar, Lunar } from 'lunar-typescript';
import { GeJuJudgeService } from './GeJuJudgeService';
/**
 * 八字服务类，封装lunar-typescript的八字功能
 */
export class BaziService {
    /**
     * 从公历日期获取八字信息
     * @param year 年
     * @param month 月
     * @param day 日
     * @param hour 时（0-23）
     * @returns 八字信息对象
     */
    static getBaziFromDate(year, month, day, hour = 0, gender = '1', sect = '2') {
        // 创建阳历对象
        const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
        // 转换为农历
        const lunar = solar.getLunar();
        // 获取八字
        const eightChar = lunar.getEightChar();
        return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
    }
    /**
     * 从农历日期获取八字信息
     * @param year 农历年
     * @param month 农历月
     * @param day 农历日
     * @param hour 时（0-23）
     * @param isLeapMonth 是否闰月
     * @returns 八字信息对象
     */
    static getBaziFromLunarDate(year, month, day, hour = 0, isLeapMonth = false, gender = '1', sect = '2') {
        // 创建农历对象
        // Lunar.fromYmdHms只接受6个参数，不支持isLeapMonth参数
        // 需要使用其他方法处理闰月
        let lunar;
        if (isLeapMonth) {
            // 对于闰月，我们需要使用其他方法
            // 这里简化处理，实际应用中可能需要更复杂的逻辑
            lunar = Lunar.fromYmd(year, month, day);
        }
        else {
            lunar = Lunar.fromYmdHms(year, month, day, hour, 0, 0);
        }
        // 转换为阳历
        const solar = lunar.getSolar();
        // 获取八字
        const eightChar = lunar.getEightChar();
        return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
    }
    /**
     * 解析八字字符串
     * @param baziStr 八字字符串，如"甲子 乙丑 丙寅 丁卯"
     * @param gender 性别（1-男，0-女）
     * @param sect 八字流派（1或2）
     * @param specifiedYear 指定的年份，如果提供则使用此年份而不是反推
     * @returns 八字信息对象
     */
    static parseBaziString(baziStr, gender = '1', sect = '2', specifiedYear) {
        // 清理并分割八字字符串
        const parts = baziStr.replace(/\s+/g, ' ').trim().split(' ');
        if (parts.length !== 4) {
            throw new Error('八字格式不正确，应为"年柱 月柱 日柱 时柱"的格式，如"甲子 乙丑 丙寅 丁卯"');
        }
        // 提取天干地支
        const yearStem = parts[0][0];
        const yearBranch = parts[0][1];
        const monthStem = parts[1][0];
        const monthBranch = parts[1][1];
        const dayStem = parts[2][0];
        const dayBranch = parts[2][1];
        const hourStem = parts[3][0];
        const hourBranch = parts[3][1];
        // 计算五行
        const yearWuXing = this.getStemWuXing(yearStem);
        const monthWuXing = this.getStemWuXing(monthStem);
        const dayWuXing = this.getStemWuXing(dayStem);
        const hourWuXing = this.getStemWuXing(hourStem);
        // 计算纳音
        const yearNaYin = this.getNaYin(yearStem + yearBranch);
        const monthNaYin = this.getNaYin(monthStem + monthBranch);
        const dayNaYin = this.getNaYin(dayStem + dayBranch);
        const hourNaYin = this.getNaYin(hourStem + hourBranch);
        // 初始化日期相关变量
        let solarDate = '----年--月--日';
        let lunarDate = '农历----年--月--日';
        let solarTime = '--:--';
        let solar = null;
        let lunar = null;
        let eightChar = null;
        // 计算匹配的年份列表
        let matchingYears = [];
        // 使用lunar-typescript库的Solar.fromBaZi方法获取所有可能的年份
        try {
            // 获取所有可能的年份
            // 我们需要多次调用Solar.fromBaZi，使用不同的基准年份，以获取所有可能的年份
            const allYears = new Set();
            // 使用多个基准年份，确保覆盖所有可能的年份
            const baseYears = [1, 601, 1201, 1801, 2401];
            for (const baseYear of baseYears) {
                try {
                    // 获取所有可能的阳历日期
                    const solarList = Solar.fromBaZi(yearStem + yearBranch, monthStem + monthBranch, dayStem + dayBranch, hourStem + hourBranch, parseInt(sect), // 流派
                    baseYear // 起始年份
                    );
                    // 提取年份
                    for (const solar of solarList) {
                        allYears.add(solar.getYear());
                    }
                }
                catch (e) {
                    console.error(`获取匹配年份出错 (基准年份 ${baseYear}):`, e);
                }
            }
            // 转换为数组并排序
            matchingYears = Array.from(allYears).sort((a, b) => a - b);
            console.log('使用lunar-typescript库获取匹配年份:', matchingYears);
        }
        catch (error) {
            console.error('获取匹配年份出错:', error);
            // 如果出错，使用传统方法作为备选
            console.log('使用传统方法计算匹配年份');
            // 天干序号（甲=0, 乙=1, ..., 癸=9）
            const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
            // 地支序号（子=0, 丑=1, ..., 亥=11）
            const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);
            // 计算匹配的年份列表
            const currentYear = new Date().getFullYear();
            const startYear = 1700; // 从1700年开始查找，确保覆盖17XX-19XX年
            const endYear = currentYear + 120; // 查找到120年后（2个甲子）
            // 查找符合年柱的年份
            for (let year = startYear; year <= endYear; year++) {
                // 计算天干序号：年份减去4，除以10的余数
                const stemCheck = (year - 4) % 10;
                // 计算地支序号：年份减去4，除以12的余数
                const branchCheck = (year - 4) % 12;
                if (stemCheck === stemIndex && branchCheck === branchIndex) {
                    matchingYears.push(year);
                }
            }
        }
        // 如果指定了年份，尝试使用指定的年份进行日期推算
        if (specifiedYear && matchingYears.includes(specifiedYear)) {
            try {
                // 使用lunar-typescript库的Solar.fromBaZi方法反推日期
                // 这个方法可能返回多个匹配的日期
                const solarList = Solar.fromBaZi(yearStem + yearBranch, monthStem + monthBranch, dayStem + dayBranch, hourStem + hourBranch, parseInt(sect), // 流派
                1 // 起始年份设为1，确保能找到所有可能的日期
                );
                // 找到指定年份的日期
                let matchingSolar = null;
                for (const s of solarList) {
                    if (s.getYear() === specifiedYear) {
                        matchingSolar = s;
                        break;
                    }
                }
                // 如果找到匹配的日期
                if (matchingSolar) {
                    solar = matchingSolar;
                    lunar = matchingSolar.getLunar();
                    eightChar = lunar.getEightChar();
                    // 格式化日期
                    solarDate = `${matchingSolar.getYear()}-${matchingSolar.getMonth().toString().padStart(2, '0')}-${matchingSolar.getDay().toString().padStart(2, '0')}`;
                    lunarDate = lunar.toString();
                    solarTime = `${matchingSolar.getHour().toString().padStart(2, '0')}:${matchingSolar.getMinute().toString().padStart(2, '0')}`;
                    console.log('日期反推成功 - 指定年份:', specifiedYear);
                    console.log('日期反推结果 - 阳历日期:', solarDate);
                    console.log('日期反推结果 - 农历日期:', lunarDate);
                }
                else {
                    console.log('日期反推失败 - 未找到指定年份的匹配日期');
                }
            }
            catch (error) {
                console.error('日期推算出错:', error);
            }
        }
        // 如果有指定年份且成功推算日期，使用lunar-typescript库获取更多信息
        if (specifiedYear && solar && lunar && eightChar) {
            // 使用formatBaziInfo获取完整的八字信息，但只获取日期、大运、流年等信息
            const baziInfo = this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
            // 使用用户输入的原始八字信息，而不是反推后的八字
            // 年柱
            baziInfo.yearPillar = parts[0];
            baziInfo.yearStem = yearStem;
            baziInfo.yearBranch = yearBranch;
            baziInfo.yearHideGan = this.getHideGan(yearBranch);
            baziInfo.yearWuXing = this.getStemWuXing(yearStem);
            baziInfo.yearNaYin = this.getNaYin(yearStem + yearBranch);
            baziInfo.yearShengXiao = this.getShengXiao(yearBranch);
            baziInfo.yearShiShenGan = this.getShiShen(dayStem, yearStem);
            baziInfo.yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);
            // 月柱
            baziInfo.monthPillar = parts[1];
            baziInfo.monthStem = monthStem;
            baziInfo.monthBranch = monthBranch;
            baziInfo.monthHideGan = this.getHideGan(monthBranch);
            baziInfo.monthWuXing = this.getStemWuXing(monthStem);
            baziInfo.monthNaYin = this.getNaYin(monthStem + monthBranch);
            baziInfo.monthShengXiao = this.getShengXiao(monthBranch);
            baziInfo.monthShiShenGan = this.getShiShen(dayStem, monthStem);
            baziInfo.monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);
            // 日柱
            baziInfo.dayPillar = parts[2];
            baziInfo.dayStem = dayStem;
            baziInfo.dayBranch = dayBranch;
            baziInfo.dayHideGan = this.getHideGan(dayBranch);
            baziInfo.dayWuXing = this.getStemWuXing(dayStem);
            baziInfo.dayNaYin = this.getNaYin(dayStem + dayBranch);
            baziInfo.dayShengXiao = this.getShengXiao(dayBranch);
            baziInfo.dayShiShen = '日主'; // 日柱天干是日主自己
            baziInfo.dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);
            // 时柱
            baziInfo.hourPillar = parts[3];
            baziInfo.hourStem = hourStem;
            baziInfo.hourBranch = hourBranch;
            baziInfo.hourHideGan = this.getHideGan(hourBranch);
            baziInfo.hourWuXing = this.getStemWuXing(hourStem);
            baziInfo.hourNaYin = this.getNaYin(hourStem + hourBranch);
            baziInfo.hourShengXiao = this.getShengXiao(hourBranch);
            baziInfo.hourShiShenGan = this.getShiShen(dayStem, hourStem);
            baziInfo.hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);
            // 特殊信息
            baziInfo.taiYuan = this.calculateTaiYuan(monthStem, monthBranch);
            baziInfo.taiYuanNaYin = this.getNaYin(baziInfo.taiYuan);
            baziInfo.mingGong = this.calculateMingGong(hourStem, hourBranch);
            baziInfo.mingGongNaYin = this.getNaYin(baziInfo.mingGong);
            // 检查三合局和三会局
            const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
            baziInfo.sanHeJu = this.checkSanHeJu(branches);
            baziInfo.sanHuiJu = this.checkSanHuiJu(branches);
            // 添加匹配年份列表
            baziInfo.matchingYears = matchingYears;
            // 完整信息
            baziInfo.fullString = `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
            return baziInfo;
        }
        // 如果没有指定年份或者日期推算失败，使用传统方法计算基本信息
        // 计算特殊信息
        const taiYuan = this.calculateTaiYuan(monthStem, monthBranch);
        const taiYuanNaYin = this.getNaYin(taiYuan);
        const mingGong = this.calculateMingGong(hourStem, hourBranch);
        const mingGongNaYin = this.getNaYin(mingGong);
        // 生肖信息
        const yearShengXiao = this.getShengXiao(yearBranch);
        const monthShengXiao = this.getShengXiao(monthBranch);
        const dayShengXiao = this.getShengXiao(dayBranch);
        const hourShengXiao = this.getShengXiao(hourBranch);
        // 创建一个基本的BaziInfo对象
        // 计算十神信息 - 以日干为基准
        const yearShiShenGan = this.getShiShen(dayStem, yearStem);
        const yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);
        const monthShiShenGan = this.getShiShen(dayStem, monthStem);
        const monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);
        const dayShiShen = '日主'; // 日柱天干是日主自己
        const dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);
        const hourShiShenGan = this.getShiShen(dayStem, hourStem);
        const hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);
        // 检查三合局和三会局
        const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
        const sanHeJu = this.checkSanHeJu(branches);
        const sanHuiJu = this.checkSanHuiJu(branches);
        return {
            // 基本信息
            solarDate,
            lunarDate,
            solarTime,
            matchingYears,
            // 八字信息
            yearPillar: parts[0],
            yearStem,
            yearBranch,
            yearHideGan: this.getHideGan(yearBranch),
            yearWuXing,
            yearNaYin,
            yearShengXiao,
            yearShiShenGan,
            yearShiShenZhi,
            monthPillar: parts[1],
            monthStem,
            monthBranch,
            monthHideGan: this.getHideGan(monthBranch),
            monthWuXing,
            monthNaYin,
            monthShengXiao,
            monthShiShenGan,
            monthShiShenZhi,
            dayPillar: parts[2],
            dayStem,
            dayBranch,
            dayHideGan: this.getHideGan(dayBranch),
            dayWuXing,
            dayNaYin,
            dayShengXiao,
            dayShiShen,
            dayShiShenZhi,
            hourPillar: parts[3],
            hourStem,
            hourBranch,
            hourHideGan: this.getHideGan(hourBranch),
            hourWuXing,
            hourNaYin,
            hourShengXiao,
            hourShiShenGan,
            hourShiShenZhi,
            // 特殊信息
            taiYuan,
            taiYuanNaYin,
            mingGong,
            mingGongNaYin,
            // 完整信息
            fullString: `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`,
            // 组合信息
            sanHeJu,
            sanHuiJu,
            // 设置信息
            gender,
            baziSect: sect
        };
    }
    /**
     * 计算胎元
     * @param monthStem 月干
     * @param monthBranch 月支
     * @returns 胎元干支
     */
    static calculateTaiYuan(monthStem, monthBranch) {
        // 天干顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        // 地支顺序
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 计算月干的索引
        const stemIndex = stems.indexOf(monthStem);
        // 计算月支的索引
        const branchIndex = branches.indexOf(monthBranch);
        if (stemIndex === -1 || branchIndex === -1) {
            return "未知";
        }
        // 计算胎元干（月干 + 5，超过10则减10）
        const taiYuanStemIndex = (stemIndex + 5) % 10;
        // 计算胎元支（月支 + 3，超过12则减12）
        const taiYuanBranchIndex = (branchIndex + 3) % 12;
        // 组合胎元干支
        return stems[taiYuanStemIndex] + branches[taiYuanBranchIndex];
    }
    /**
     * 计算命宫
     * @param hourStem 时干
     * @param hourBranch 时支
     * @returns 命宫干支
     */
    static calculateMingGong(hourStem, hourBranch) {
        // 天干顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        // 地支顺序
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 计算时干的索引
        const stemIndex = stems.indexOf(hourStem);
        // 计算时支的索引
        const branchIndex = branches.indexOf(hourBranch);
        if (stemIndex === -1 || branchIndex === -1) {
            return "未知";
        }
        // 计算命宫干（时干 + 7，超过10则减10）
        const mingGongStemIndex = (stemIndex + 7) % 10;
        // 计算命宫支（时支 + 1，超过12则减12）
        const mingGongBranchIndex = (branchIndex + 1) % 12;
        // 组合命宫干支
        return stems[mingGongStemIndex] + branches[mingGongBranchIndex];
    }
    /**
     * 获取天干对应的五行
     * @param stem 天干
     * @returns 五行
     */
    static getStemWuXing(stem) {
        const map = {
            '甲': '木',
            '乙': '木',
            '丙': '火',
            '丁': '火',
            '戊': '土',
            '己': '土',
            '庚': '金',
            '辛': '金',
            '壬': '水',
            '癸': '水'
        };
        return map[stem] || '未知';
    }
    /**
     * 获取地支藏干
     * @param branch 地支
     * @returns 藏干字符串
     */
    static getHideGan(branch) {
        // 检查地支是否有效
        if (!branch) {
            return '';
        }
        const map = {
            '子': '癸',
            '丑': '己,癸,辛',
            '寅': '甲,丙,戊',
            '卯': '乙',
            '辰': '戊,乙,癸',
            '巳': '丙,庚,戊',
            '午': '丁,己',
            '未': '己,丁,乙',
            '申': '庚,壬,戊',
            '酉': '辛',
            '戌': '戊,辛,丁',
            '亥': '壬,甲'
        };
        return map[branch] || '';
    }
    /**
     * 根据月日获取星座
     * @param month 月份（1-12）
     * @param day 日期（1-31）
     * @returns 星座名称
     */
    static getZodiac(month, day) {
        const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
        const signs = [
            "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座",
            "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"
        ];
        // 月份从1开始，索引从0开始，需要减1
        const monthIndex = month - 1;
        // 如果日期大于等于该月对应的日期，则星座为当月星座，否则为前一个月的星座
        return day < dates[monthIndex] ? signs[monthIndex] : signs[(monthIndex + 1) % 12];
    }
    /**
     * 计算旬空
     * @param gan 天干
     * @param zhi 地支
     * @returns 旬空
     */
    static calculateXunKong(gan, zhi) {
        // 天干序号（甲=0, 乙=1, ..., 癸=9）
        const ganIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(gan);
        // 地支序号（子=0, 丑=1, ..., 亥=11）
        const zhiIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(zhi);
        if (ganIndex < 0 || zhiIndex < 0) {
            return '';
        }
        // 计算旬首
        const xunShouIndex = Math.floor(ganIndex / 2) * 2;
        // 计算旬空地支
        const xunKongIndex1 = (xunShouIndex + 10) % 12;
        const xunKongIndex2 = (xunShouIndex + 11) % 12;
        // 获取旬空地支
        const xunKongZhi1 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex1);
        const xunKongZhi2 = "子丑寅卯辰巳午未申酉戌亥".charAt(xunKongIndex2);
        return xunKongZhi1 + xunKongZhi2;
    }
    /**
     * 获取纳音
     * @param gz 干支
     * @returns 纳音
     */
    static getNaYin(gz) {
        const map = {
            '甲子': '海中金', '乙丑': '海中金',
            '丙寅': '炉中火', '丁卯': '炉中火',
            '戊辰': '大林木', '己巳': '大林木',
            '庚午': '路旁土', '辛未': '路旁土',
            '壬申': '剑锋金', '癸酉': '剑锋金',
            '甲戌': '山头火', '乙亥': '山头火',
            '丙子': '涧下水', '丁丑': '涧下水',
            '戊寅': '城头土', '己卯': '城头土',
            '庚辰': '白蜡金', '辛巳': '白蜡金',
            '壬午': '杨柳木', '癸未': '杨柳木',
            '甲申': '泉中水', '乙酉': '泉中水',
            '丙戌': '屋上土', '丁亥': '屋上土',
            '戊子': '霹雳火', '己丑': '霹雳火',
            '庚寅': '松柏木', '辛卯': '松柏木',
            '壬辰': '长流水', '癸巳': '长流水',
            '甲午': '砂石金', '乙未': '砂石金',
            '丙申': '山下火', '丁酉': '山下火',
            '戊戌': '平地木', '己亥': '平地木',
            '庚子': '壁上土', '辛丑': '壁上土',
            '壬寅': '金薄金', '癸卯': '金薄金',
            '甲辰': '覆灯火', '乙巳': '覆灯火',
            '丙午': '天河水', '丁未': '天河水',
            '戊申': '大驿土', '己酉': '大驿土',
            '庚戌': '钗环金', '辛亥': '钗环金',
            '壬子': '桑柘木', '癸丑': '桑柘木',
            '甲寅': '大溪水', '乙卯': '大溪水',
            '丙辰': '沙中土', '丁巳': '沙中土',
            '戊午': '天上火', '己未': '天上火',
            '庚申': '石榴木', '辛酉': '石榴木',
            '壬戌': '大海水', '癸亥': '大海水'
        };
        return map[gz] || '未知';
    }
    /**
     * 格式化八字信息
     * @param solar 阳历对象
     * @param lunar 农历对象
     * @param eightChar 八字对象
     * @param gender 性别（1-男，0-女）
     * @param sect 八字流派（1或2）
     * @returns 格式化后的八字信息
     */
    static formatBaziInfo(solar, lunar, eightChar, gender = '1', sect = '2') {
        // 设置八字流派
        eightChar.setSect(parseInt(sect));
        // 先获取日干，因为十神计算需要以日干为基准
        const dayStem = eightChar.getDayGan();
        // 年柱
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const yearPillar = yearStem + yearBranch;
        // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
        const yearHideGan = this.getHideGan(yearBranch);
        const yearWuXing = eightChar.getYearWuXing();
        const yearNaYin = eightChar.getYearNaYin();
        const yearShiShenGan = this.getShiShen(dayStem, yearStem);
        const yearShiShenZhi = this.getHiddenShiShen(dayStem, yearBranch);
        const yearDiShi = eightChar.getYearDiShi();
        // 添加错误处理，防止旬空计算失败
        let yearXunKong = '';
        try {
            // 先获取旬，再获取旬空
            const yearXun = eightChar.getYearXun();
            if (yearXun) {
                yearXunKong = eightChar.getYearXunKong();
            }
        }
        catch (e) {
            console.error('计算年柱旬空出错:', e);
        }
        // 月柱
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const monthPillar = monthStem + monthBranch;
        // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
        const monthHideGan = this.getHideGan(monthBranch);
        const monthWuXing = eightChar.getMonthWuXing();
        const monthNaYin = eightChar.getMonthNaYin();
        const monthShiShenGan = this.getShiShen(dayStem, monthStem);
        const monthShiShenZhi = this.getHiddenShiShen(dayStem, monthBranch);
        const monthDiShi = eightChar.getMonthDiShi();
        // 添加错误处理，防止旬空计算失败
        let monthXunKong = '';
        try {
            // 先获取旬，再获取旬空
            const monthXun = eightChar.getMonthXun();
            if (monthXun) {
                monthXunKong = eightChar.getMonthXunKong();
            }
        }
        catch (e) {
            console.error('计算月柱旬空出错:', e);
        }
        // 日柱
        const dayBranch = eightChar.getDayZhi();
        const dayPillar = dayStem + dayBranch;
        // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
        const dayHideGan = this.getHideGan(dayBranch);
        const dayWuXing = eightChar.getDayWuXing();
        const dayNaYin = eightChar.getDayNaYin();
        const dayShiShenZhi = this.getHiddenShiShen(dayStem, dayBranch);
        const dayDiShi = eightChar.getDayDiShi();
        // 添加错误处理，防止旬空计算失败
        let dayXunKong = '';
        try {
            // 先获取旬，再获取旬空
            const dayXun = eightChar.getDayXun();
            if (dayXun) {
                dayXunKong = eightChar.getDayXunKong();
            }
        }
        catch (e) {
            console.error('计算日柱旬空出错:', e);
        }
        // 时柱
        const hourStem = eightChar.getTimeGan();
        const hourBranch = eightChar.getTimeZhi();
        const hourPillar = hourStem + hourBranch;
        // 使用我们自己的藏干定义，而不是lunar-typescript库的定义
        const hourHideGan = this.getHideGan(hourBranch);
        const hourWuXing = eightChar.getTimeWuXing();
        const hourNaYin = eightChar.getTimeNaYin();
        const hourShiShenGan = this.getShiShen(dayStem, hourStem);
        const hourShiShenZhi = this.getHiddenShiShen(dayStem, hourBranch);
        const timeDiShi = eightChar.getTimeDiShi();
        // 添加错误处理，防止旬空计算失败
        let timeXunKong = '';
        try {
            // 先获取旬，再获取旬空
            const timeXun = eightChar.getTimeXun();
            if (timeXun) {
                timeXunKong = eightChar.getTimeXunKong();
            }
            // 如果通过API获取失败，则手动计算
            if (!timeXunKong) {
                timeXunKong = this.calculateXunKong(hourStem, hourBranch);
            }
        }
        catch (e) {
            console.error('计算时柱旬空出错:', e);
            // 出错时手动计算
            timeXunKong = this.calculateXunKong(hourStem, hourBranch);
        }
        // 特殊信息
        const taiYuan = eightChar.getTaiYuan();
        const taiYuanNaYin = eightChar.getTaiYuanNaYin();
        const mingGong = eightChar.getMingGong();
        const mingGongNaYin = eightChar.getMingGongNaYin();
        const shenGong = eightChar.getShenGong();
        // 日期信息
        const solarDate = solar.toYmd();
        const lunarDate = lunar.toString();
        const solarTime = solar.getHour() + ':' + solar.getMinute();
        // 生肖信息
        const yearShengXiao = this.getShengXiao(yearBranch);
        const monthShengXiao = this.getShengXiao(monthBranch);
        const dayShengXiao = this.getShengXiao(dayBranch);
        const hourShengXiao = this.getShengXiao(hourBranch);
        // 十神信息 (以日干为主)
        const yearShiShen = yearShiShenGan;
        const monthShiShen = monthShiShenGan;
        const dayShiShen = '日主'; // 日柱天干是日主自己
        const hourShiShen = hourShiShenGan;
        // 星座
        const zodiac = this.getZodiac(solar.getMonth(), solar.getDay());
        // 节气
        const jieQi = typeof lunar.getJieQi() === 'string' ? lunar.getJieQi() : '';
        const nextJieQi = typeof lunar.getNextJieQi() === 'string' ? lunar.getNextJieQi() : '';
        // 吉凶
        const dayYi = lunar.getDayYi() || [];
        const dayJi = lunar.getDayJi() || [];
        // 神煞
        const daySha = Array.isArray(lunar.getDaySha()) ? lunar.getDaySha() : [];
        const shenShaResult = this.calculateShenSha(eightChar);
        const shenSha = [...daySha, ...shenShaResult.shenSha];
        const yearShenSha = shenShaResult.yearShenSha;
        const monthShenSha = shenShaResult.monthShenSha;
        const dayShenSha = shenShaResult.dayShenSha;
        const hourShenSha = shenShaResult.hourShenSha;
        // 格局
        const geJuInfo = this.calculateGeJuImproved(eightChar);
        const geJu = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.geJu;
        const geJuDetail = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.detail;
        const geJuStrength = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.geJuStrength;
        const yongShen = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.yongShen;
        const yongShenDetail = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.yongShenDetail;
        const geJuFactors = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.geJuFactors;
        // 起运信息
        const genderNum = gender === '1' ? 1 : 0;
        const sectNum = parseInt(sect);
        const yun = eightChar.getYun(genderNum, sectNum);
        const qiYunYear = yun.getStartYear();
        const qiYunMonth = yun.getStartMonth();
        const qiYunDay = yun.getStartDay();
        const qiYunHour = yun.getStartHour();
        const qiYunDate = yun.getStartSolar().toYmd();
        const qiYunAge = qiYunYear; // 简化处理，实际应该计算虚岁
        // 大运信息
        const daYunArr = yun.getDaYun();
        const daYun = daYunArr.map(dy => {
            // 添加错误处理，防止旬空计算失败
            let xunKong = '';
            try {
                // 检查干支是否有效
                const ganZhi = dy.getGanZhi();
                if (ganZhi && ganZhi.length === 2) {
                    // 手动计算旬空，避免使用可能出错的getXunKong方法
                    const gan = ganZhi.charAt(0);
                    const zhi = ganZhi.charAt(1);
                    xunKong = this.calculateXunKong(gan, zhi);
                }
            }
            catch (e) {
                console.error('计算大运旬空出错:', e);
            }
            // 安全地获取属性，防止空指针异常
            let startYear = 0, endYear = 0, startAge = 0, endAge = 0, index = 0, ganZhi = '';
            try {
                startYear = dy.getStartYear();
            }
            catch (e) {
                console.error('获取大运起始年出错:', e);
            }
            try {
                endYear = dy.getEndYear();
            }
            catch (e) {
                console.error('获取大运结束年出错:', e);
            }
            try {
                startAge = dy.getStartAge();
            }
            catch (e) {
                console.error('获取大运起始年龄出错:', e);
            }
            try {
                endAge = dy.getEndAge();
            }
            catch (e) {
                console.error('获取大运结束年龄出错:', e);
            }
            try {
                index = dy.getIndex();
            }
            catch (e) {
                console.error('获取大运序号出错:', e);
            }
            try {
                ganZhi = dy.getGanZhi();
            }
            catch (e) {
                console.error('获取大运干支出错:', e);
            }
            // 计算十神
            let shiShenGan = '';
            try {
                if (ganZhi && ganZhi.length >= 1) {
                    shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
                }
            }
            catch (e) {
                console.error('计算大运十神出错:', e);
            }
            // 计算地势
            let diShi = '';
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const zhi = ganZhi.charAt(1);
                    diShi = this.getDiShi(dayStem, zhi);
                }
            }
            catch (e) {
                console.error('计算大运地势出错:', e);
            }
            // 计算神煞
            const shenSha = [];
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const stem = ganZhi.charAt(0);
                    const branch = ganZhi.charAt(1);
                    // 调试信息
                    console.log(`计算大运神煞 - 索引: ${index}, 干支: ${ganZhi}`);
                    console.log(`大运神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);
                    // 天乙贵人
                    if (this.isTianYiGuiRen(dayStem, branch)) {
                        shenSha.push('天乙贵人');
                    }
                    // 文昌
                    if (this.isWenChang(branch)) {
                        shenSha.push('文昌');
                    }
                    // 华盖
                    if (this.isHuaGai(branch)) {
                        shenSha.push('华盖');
                    }
                    // 禄神
                    if (this.isLuShen(stem, branch)) {
                        shenSha.push('禄神');
                    }
                    // 桃花
                    if (this.isTaoHua(branch)) {
                        shenSha.push('桃花');
                    }
                    // 孤辰
                    if (this.isGuChen(branch)) {
                        shenSha.push('孤辰');
                    }
                    // 寡宿
                    if (this.isGuaSu(branch)) {
                        shenSha.push('寡宿');
                    }
                    // 驿马
                    if (this.isYiMa(branch, yearBranch)) {
                        shenSha.push('驿马');
                    }
                    // 将星
                    if (this.isJiangXing(dayStem, branch)) {
                        shenSha.push('将星');
                    }
                    // 金神
                    if (this.isJinShen(branch)) {
                        shenSha.push('金神');
                    }
                    // 天德
                    if (this.isTianDe(stem, branch)) {
                        shenSha.push('天德');
                    }
                    // 天德合
                    if (this.isTianDeHe(stem, branch)) {
                        shenSha.push('天德合');
                    }
                    // 月德
                    if (this.isYueDe(stem)) {
                        shenSha.push('月德');
                    }
                    // 天医
                    if (this.isTianYi(branch)) {
                        shenSha.push('天医');
                    }
                    // 天喜
                    if (this.isTianXi(branch, yearBranch)) {
                        shenSha.push('天喜');
                    }
                    // 红艳
                    if (this.isHongYan(branch)) {
                        shenSha.push('红艳');
                    }
                    // 天罗
                    if (this.isTianLuo(branch)) {
                        shenSha.push('天罗');
                    }
                    // 地网
                    if (this.isDiWang(branch)) {
                        shenSha.push('地网');
                    }
                    // 羊刃
                    if (this.isYangRen(dayStem, branch)) {
                        shenSha.push('羊刃');
                    }
                    // 天空
                    if (this.isTianKong(branch)) {
                        shenSha.push('天空');
                    }
                    // 地劫
                    if (this.isDiJie(branch)) {
                        shenSha.push('地劫');
                    }
                    // 天刑
                    if (this.isTianXing(branch)) {
                        shenSha.push('天刑');
                    }
                    // 天哭
                    if (this.isTianKu(branch)) {
                        shenSha.push('天哭');
                    }
                    // 天虚
                    if (this.isTianXu(branch)) {
                        shenSha.push('天虚');
                    }
                    // 咸池
                    if (this.isXianChi(branch)) {
                        shenSha.push('咸池');
                    }
                    // 亡神
                    if (this.isWangShen(branch)) {
                        shenSha.push('亡神');
                    }
                    // 劫煞
                    if (this.isJieSha(branch)) {
                        shenSha.push('劫煞');
                    }
                    // 灾煞
                    if (this.isZaiSha(branch)) {
                        shenSha.push('灾煞');
                    }
                    // 五鬼
                    if (this.isWuGui(branch)) {
                        shenSha.push('五鬼');
                    }
                }
            }
            catch (e) {
                console.error('计算大运神煞出错:', e);
            }
            // 调试信息
            console.log(`大运返回数据 - 索引: ${index}, 神煞数组: `, shenSha);
            return {
                startYear,
                endYear,
                startAge,
                endAge,
                index,
                ganZhi,
                naYin: ganZhi ? this.getNaYin(ganZhi) : '',
                xunKong,
                shiShenGan,
                diShi,
                shenSha: [...shenSha] // 确保返回一个新的数组副本
            };
        });
        // 流年信息 (取第一个大运的流年)
        const liuNianArr = daYunArr.length > 1 ? daYunArr[1].getLiuNian() : [];
        const liuNian = liuNianArr.map(ln => {
            // 添加错误处理，防止旬空计算失败
            let xunKong = '';
            try {
                // 检查干支是否有效
                const ganZhi = ln.getGanZhi();
                if (ganZhi && ganZhi.length === 2) {
                    // 手动计算旬空，避免使用可能出错的getXunKong方法
                    const gan = ganZhi.charAt(0);
                    const zhi = ganZhi.charAt(1);
                    xunKong = this.calculateXunKong(gan, zhi);
                }
            }
            catch (e) {
                console.error('计算流年旬空出错:', e);
            }
            // 安全地获取属性，防止空指针异常
            let year = 0, age = 0, index = 0, ganZhi = '';
            try {
                year = ln.getYear();
            }
            catch (e) {
                console.error('获取流年年份出错:', e);
            }
            try {
                age = ln.getAge();
            }
            catch (e) {
                console.error('获取流年年龄出错:', e);
            }
            try {
                index = ln.getIndex();
            }
            catch (e) {
                console.error('获取流年序号出错:', e);
            }
            try {
                ganZhi = ln.getGanZhi();
            }
            catch (e) {
                console.error('获取流年干支出错:', e);
            }
            // 计算十神
            let shiShenGan = '';
            try {
                if (ganZhi && ganZhi.length >= 1) {
                    shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
                }
            }
            catch (e) {
                console.error('计算流年十神出错:', e);
            }
            // 计算地势
            let diShi = '';
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const zhi = ganZhi.charAt(1);
                    diShi = this.getDiShi(dayStem, zhi);
                }
            }
            catch (e) {
                console.error('计算流年地势出错:', e);
            }
            // 计算神煞
            const shenSha = [];
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const stem = ganZhi.charAt(0);
                    const branch = ganZhi.charAt(1);
                    // 调试信息
                    console.log(`计算流年神煞 - 年份: ${year}, 干支: ${ganZhi}`);
                    console.log(`流年神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);
                    // 天乙贵人
                    if (this.isTianYiGuiRen(dayStem, branch)) {
                        shenSha.push('天乙贵人');
                    }
                    // 文昌
                    if (this.isWenChang(branch)) {
                        shenSha.push('文昌');
                    }
                    // 华盖
                    if (this.isHuaGai(branch)) {
                        shenSha.push('华盖');
                    }
                    // 禄神
                    if (this.isLuShen(stem, branch)) {
                        shenSha.push('禄神');
                    }
                    // 桃花
                    if (this.isTaoHua(branch)) {
                        shenSha.push('桃花');
                    }
                    // 孤辰
                    if (this.isGuChen(branch)) {
                        shenSha.push('孤辰');
                    }
                    // 寡宿
                    if (this.isGuaSu(branch)) {
                        shenSha.push('寡宿');
                    }
                    // 驿马
                    if (this.isYiMa(branch, yearBranch)) {
                        shenSha.push('驿马');
                    }
                    // 将星
                    if (this.isJiangXing(dayStem, branch)) {
                        shenSha.push('将星');
                    }
                    // 金神
                    if (this.isJinShen(branch)) {
                        shenSha.push('金神');
                    }
                    // 天德
                    if (this.isTianDe(stem, branch)) {
                        shenSha.push('天德');
                    }
                    // 天德合
                    if (this.isTianDeHe(stem, branch)) {
                        shenSha.push('天德合');
                    }
                    // 月德
                    if (this.isYueDe(stem)) {
                        shenSha.push('月德');
                    }
                    // 天医
                    if (this.isTianYi(branch)) {
                        shenSha.push('天医');
                    }
                    // 天喜
                    if (this.isTianXi(branch, yearBranch)) {
                        shenSha.push('天喜');
                    }
                    // 红艳
                    if (this.isHongYan(branch)) {
                        shenSha.push('红艳');
                    }
                    // 天罗
                    if (this.isTianLuo(branch)) {
                        shenSha.push('天罗');
                    }
                    // 地网
                    if (this.isDiWang(branch)) {
                        shenSha.push('地网');
                    }
                    // 羊刃
                    if (this.isYangRen(dayStem, branch)) {
                        shenSha.push('羊刃');
                    }
                    // 天空
                    if (this.isTianKong(branch)) {
                        shenSha.push('天空');
                    }
                    // 地劫
                    if (this.isDiJie(branch)) {
                        shenSha.push('地劫');
                    }
                    // 天刑
                    if (this.isTianXing(branch)) {
                        shenSha.push('天刑');
                    }
                    // 天哭
                    if (this.isTianKu(branch)) {
                        shenSha.push('天哭');
                    }
                    // 天虚
                    if (this.isTianXu(branch)) {
                        shenSha.push('天虚');
                    }
                    // 咸池
                    if (this.isXianChi(branch)) {
                        shenSha.push('咸池');
                    }
                    // 亡神
                    if (this.isWangShen(branch)) {
                        shenSha.push('亡神');
                    }
                    // 劫煞
                    if (this.isJieSha(branch)) {
                        shenSha.push('劫煞');
                    }
                    // 灾煞
                    if (this.isZaiSha(branch)) {
                        shenSha.push('灾煞');
                    }
                    // 岁破
                    if (this.isSuiPo(branch, yearBranch)) {
                        shenSha.push('岁破');
                    }
                    // 大耗
                    if (this.isDaHao(branch, yearBranch)) {
                        shenSha.push('大耗');
                    }
                    // 五鬼
                    if (this.isWuGui(branch)) {
                        shenSha.push('五鬼');
                    }
                    // 天德贵人
                    if (this.isTianDeGuiRen(stem, branch)) {
                        shenSha.push('天德贵人');
                    }
                    // 月德贵人
                    if (this.isYueDeGuiRen(stem, branch)) {
                        shenSha.push('月德贵人');
                    }
                    // 天赦
                    if (this.isTianShe(stem, branch)) {
                        shenSha.push('天赦');
                    }
                    // 天恩
                    if (this.isTianEn(stem, branch)) {
                        shenSha.push('天恩');
                    }
                    // 天官
                    if (this.isTianGuan(stem, branch)) {
                        shenSha.push('天官');
                    }
                    // 天福
                    if (this.isTianFu(stem, branch)) {
                        shenSha.push('天福');
                    }
                    // 天厨
                    if (this.isTianChu(stem, branch)) {
                        shenSha.push('天厨');
                    }
                    // 天巫
                    if (this.isTianWu(branch)) {
                        shenSha.push('天巫');
                    }
                    // 天月
                    if (this.isTianYue(branch)) {
                        shenSha.push('天月');
                    }
                    // 天马
                    if (this.isTianMa(branch, yearBranch)) {
                        shenSha.push('天马');
                    }
                }
            }
            catch (e) {
                console.error('计算流年神煞出错:', e);
            }
            // 调试信息
            console.log(`流年返回数据 - 年份: ${year}, 神煞数组: `, shenSha);
            return {
                year,
                age,
                index,
                ganZhi,
                naYin: ganZhi ? this.getNaYin(ganZhi) : '',
                xunKong,
                shiShenGan,
                diShi,
                shenSha: [...shenSha] // 确保返回一个新的数组副本
            };
        });
        // 小运信息 (取第一个大运的小运)
        const xiaoYunArr = daYunArr.length > 1 ? daYunArr[1].getXiaoYun() : [];
        const xiaoYun = xiaoYunArr.map(xy => {
            // 添加错误处理，防止旬空计算失败
            let xunKong = '';
            try {
                // 检查干支是否有效
                const ganZhi = xy.getGanZhi();
                if (ganZhi && ganZhi.length === 2) {
                    // 手动计算旬空，避免使用可能出错的getXunKong方法
                    const gan = ganZhi.charAt(0);
                    const zhi = ganZhi.charAt(1);
                    xunKong = this.calculateXunKong(gan, zhi);
                }
            }
            catch (e) {
                console.error('计算小运旬空出错:', e);
            }
            // 安全地获取属性，防止空指针异常
            let year = 0, age = 0, index = 0, ganZhi = '';
            try {
                year = xy.getYear();
            }
            catch (e) {
                console.error('获取小运年份出错:', e);
            }
            try {
                age = xy.getAge();
            }
            catch (e) {
                console.error('获取小运年龄出错:', e);
            }
            try {
                index = xy.getIndex();
            }
            catch (e) {
                console.error('获取小运序号出错:', e);
            }
            try {
                ganZhi = xy.getGanZhi();
            }
            catch (e) {
                console.error('获取小运干支出错:', e);
            }
            // 计算十神
            let shiShenGan = '';
            try {
                if (ganZhi && ganZhi.length >= 1) {
                    shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
                }
            }
            catch (e) {
                console.error('计算小运十神出错:', e);
            }
            // 计算地势
            let diShi = '';
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const zhi = ganZhi.charAt(1);
                    diShi = this.getDiShi(dayStem, zhi);
                }
            }
            catch (e) {
                console.error('计算小运地势出错:', e);
            }
            // 计算神煞
            const shenSha = [];
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const stem = ganZhi.charAt(0);
                    const branch = ganZhi.charAt(1);
                    // 调试信息
                    console.log(`计算小运神煞 - 年份: ${year}, 干支: ${ganZhi}`);
                    console.log(`小运神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);
                    // 天乙贵人
                    if (this.isTianYiGuiRen(dayStem, branch)) {
                        shenSha.push('天乙贵人');
                    }
                    // 文昌
                    if (this.isWenChang(branch)) {
                        shenSha.push('文昌');
                    }
                    // 华盖
                    if (this.isHuaGai(branch)) {
                        shenSha.push('华盖');
                    }
                    // 禄神
                    if (this.isLuShen(stem, branch)) {
                        shenSha.push('禄神');
                    }
                    // 桃花
                    if (this.isTaoHua(branch)) {
                        shenSha.push('桃花');
                    }
                    // 孤辰
                    if (this.isGuChen(branch)) {
                        shenSha.push('孤辰');
                    }
                    // 寡宿
                    if (this.isGuaSu(branch)) {
                        shenSha.push('寡宿');
                    }
                    // 驿马
                    if (this.isYiMa(branch, yearBranch)) {
                        shenSha.push('驿马');
                    }
                    // 将星
                    if (this.isJiangXing(dayStem, branch)) {
                        shenSha.push('将星');
                    }
                    // 金神
                    if (this.isJinShen(branch)) {
                        shenSha.push('金神');
                    }
                    // 天德
                    if (this.isTianDe(stem, branch)) {
                        shenSha.push('天德');
                    }
                    // 天德合
                    if (this.isTianDeHe(stem, branch)) {
                        shenSha.push('天德合');
                    }
                    // 月德
                    if (this.isYueDe(stem)) {
                        shenSha.push('月德');
                    }
                    // 天医
                    if (this.isTianYi(branch)) {
                        shenSha.push('天医');
                    }
                    // 天喜
                    if (this.isTianXi(branch, yearBranch)) {
                        shenSha.push('天喜');
                    }
                    // 红艳
                    if (this.isHongYan(branch)) {
                        shenSha.push('红艳');
                    }
                    // 天罗
                    if (this.isTianLuo(branch)) {
                        shenSha.push('天罗');
                    }
                    // 地网
                    if (this.isDiWang(branch)) {
                        shenSha.push('地网');
                    }
                    // 羊刃
                    if (this.isYangRen(dayStem, branch)) {
                        shenSha.push('羊刃');
                    }
                    // 天空
                    if (this.isTianKong(branch)) {
                        shenSha.push('天空');
                    }
                    // 地劫
                    if (this.isDiJie(branch)) {
                        shenSha.push('地劫');
                    }
                    // 天刑
                    if (this.isTianXing(branch)) {
                        shenSha.push('天刑');
                    }
                    // 天哭
                    if (this.isTianKu(branch)) {
                        shenSha.push('天哭');
                    }
                    // 天虚
                    if (this.isTianXu(branch)) {
                        shenSha.push('天虚');
                    }
                    // 咸池
                    if (this.isXianChi(branch)) {
                        shenSha.push('咸池');
                    }
                    // 亡神
                    if (this.isWangShen(branch)) {
                        shenSha.push('亡神');
                    }
                    // 劫煞
                    if (this.isJieSha(branch)) {
                        shenSha.push('劫煞');
                    }
                    // 灾煞
                    if (this.isZaiSha(branch)) {
                        shenSha.push('灾煞');
                    }
                    // 五鬼
                    if (this.isWuGui(branch)) {
                        shenSha.push('五鬼');
                    }
                    // 天德贵人
                    if (this.isTianDeGuiRen(stem, branch)) {
                        shenSha.push('天德贵人');
                    }
                    // 月德贵人
                    if (this.isYueDeGuiRen(stem, branch)) {
                        shenSha.push('月德贵人');
                    }
                    // 天赦
                    if (this.isTianShe(stem, branch)) {
                        shenSha.push('天赦');
                    }
                    // 天恩
                    if (this.isTianEn(stem, branch)) {
                        shenSha.push('天恩');
                    }
                    // 天官
                    if (this.isTianGuan(stem, branch)) {
                        shenSha.push('天官');
                    }
                    // 天福
                    if (this.isTianFu(stem, branch)) {
                        shenSha.push('天福');
                    }
                    // 天厨
                    if (this.isTianChu(stem, branch)) {
                        shenSha.push('天厨');
                    }
                    // 天巫
                    if (this.isTianWu(branch)) {
                        shenSha.push('天巫');
                    }
                    // 天月
                    if (this.isTianYue(branch)) {
                        shenSha.push('天月');
                    }
                    // 天马
                    if (this.isTianMa(branch, yearBranch)) {
                        shenSha.push('天马');
                    }
                }
            }
            catch (e) {
                console.error('计算小运神煞出错:', e);
            }
            // 调试信息
            console.log(`小运返回数据 - 年份: ${year}, 神煞数组: `, shenSha);
            return {
                year,
                age,
                index,
                ganZhi,
                naYin: ganZhi ? this.getNaYin(ganZhi) : '',
                xunKong,
                shiShenGan,
                diShi,
                shenSha: [...shenSha] // 确保返回一个新的数组副本
            };
        });
        // 流月信息 (取第一个流年的流月)
        const liuYueArr = liuNianArr.length > 0 ? liuNianArr[0].getLiuYue() : [];
        const liuYue = liuYueArr.map(ly => {
            // 添加错误处理，防止旬空计算失败
            let xunKong = '';
            try {
                // 检查干支是否有效
                const ganZhi = ly.getGanZhi();
                if (ganZhi && ganZhi.length === 2) {
                    // 手动计算旬空，避免使用可能出错的getXunKong方法
                    const gan = ganZhi.charAt(0);
                    const zhi = ganZhi.charAt(1);
                    xunKong = this.calculateXunKong(gan, zhi);
                }
            }
            catch (e) {
                console.error('计算流月旬空出错:', e);
            }
            // 安全地获取属性，防止空指针异常
            let month = '', index = 0, ganZhi = '';
            try {
                month = ly.getMonthInChinese();
            }
            catch (e) {
                console.error('获取流月月份出错:', e);
            }
            try {
                index = ly.getIndex();
            }
            catch (e) {
                console.error('获取流月序号出错:', e);
            }
            try {
                ganZhi = ly.getGanZhi();
            }
            catch (e) {
                console.error('获取流月干支出错:', e);
            }
            // 计算十神
            let shiShenGan = '';
            try {
                if (ganZhi && ganZhi.length >= 1) {
                    shiShenGan = this.getShiShen(dayStem, ganZhi.charAt(0));
                }
            }
            catch (e) {
                console.error('计算流月十神出错:', e);
            }
            // 计算地势
            let diShi = '';
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const zhi = ganZhi.charAt(1);
                    diShi = this.getDiShi(dayStem, zhi);
                }
            }
            catch (e) {
                console.error('计算流月地势出错:', e);
            }
            // 计算纳音
            let naYin = '';
            try {
                if (ganZhi && ganZhi.length === 2) {
                    naYin = this.getNaYin(ganZhi);
                }
            }
            catch (e) {
                console.error('计算流月纳音出错:', e);
            }
            // 计算神煞
            const shenSha = [];
            try {
                if (ganZhi && ganZhi.length >= 2) {
                    const stem = ganZhi.charAt(0);
                    const branch = ganZhi.charAt(1);
                    // 调试信息
                    console.log(`计算流月神煞 - 月份: ${month}, 干支: ${ganZhi}`);
                    console.log(`流月神煞计算参数 - 日干: ${dayStem}, 年支: ${yearBranch}`);
                    // 天乙贵人
                    if (this.isTianYiGuiRen(dayStem, branch)) {
                        shenSha.push('天乙贵人');
                    }
                    // 文昌
                    if (this.isWenChang(branch)) {
                        shenSha.push('文昌');
                    }
                    // 华盖
                    if (this.isHuaGai(branch)) {
                        shenSha.push('华盖');
                    }
                    // 禄神
                    if (this.isLuShen(stem, branch)) {
                        shenSha.push('禄神');
                    }
                    // 桃花
                    if (this.isTaoHua(branch)) {
                        shenSha.push('桃花');
                    }
                    // 孤辰
                    if (this.isGuChen(branch)) {
                        shenSha.push('孤辰');
                    }
                    // 寡宿
                    if (this.isGuaSu(branch)) {
                        shenSha.push('寡宿');
                    }
                    // 驿马
                    if (this.isYiMa(branch, yearBranch)) {
                        shenSha.push('驿马');
                    }
                    // 将星
                    if (this.isJiangXing(dayStem, branch)) {
                        shenSha.push('将星');
                    }
                    // 金神
                    if (this.isJinShen(branch)) {
                        shenSha.push('金神');
                    }
                    // 天德
                    if (this.isTianDe(stem, branch)) {
                        shenSha.push('天德');
                    }
                    // 天德合
                    if (this.isTianDeHe(stem, branch)) {
                        shenSha.push('天德合');
                    }
                    // 月德
                    if (this.isYueDe(stem)) {
                        shenSha.push('月德');
                    }
                    // 天医
                    if (this.isTianYi(branch)) {
                        shenSha.push('天医');
                    }
                    // 天喜
                    if (this.isTianXi(branch, yearBranch)) {
                        shenSha.push('天喜');
                    }
                    // 红艳
                    if (this.isHongYan(branch)) {
                        shenSha.push('红艳');
                    }
                    // 天罗
                    if (this.isTianLuo(branch)) {
                        shenSha.push('天罗');
                    }
                    // 地网
                    if (this.isDiWang(branch)) {
                        shenSha.push('地网');
                    }
                    // 羊刃
                    if (this.isYangRen(dayStem, branch)) {
                        shenSha.push('羊刃');
                    }
                    // 天空
                    if (this.isTianKong(branch)) {
                        shenSha.push('天空');
                    }
                    // 地劫
                    if (this.isDiJie(branch)) {
                        shenSha.push('地劫');
                    }
                    // 天刑
                    if (this.isTianXing(branch)) {
                        shenSha.push('天刑');
                    }
                    // 天哭
                    if (this.isTianKu(branch)) {
                        shenSha.push('天哭');
                    }
                    // 天虚
                    if (this.isTianXu(branch)) {
                        shenSha.push('天虚');
                    }
                    // 咸池
                    if (this.isXianChi(branch)) {
                        shenSha.push('咸池');
                    }
                    // 亡神
                    if (this.isWangShen(branch)) {
                        shenSha.push('亡神');
                    }
                    // 劫煞
                    if (this.isJieSha(branch)) {
                        shenSha.push('劫煞');
                    }
                    // 灾煞
                    if (this.isZaiSha(branch)) {
                        shenSha.push('灾煞');
                    }
                    // 五鬼
                    if (this.isWuGui(branch)) {
                        shenSha.push('五鬼');
                    }
                    // 天德贵人
                    if (this.isTianDeGuiRen(stem, branch)) {
                        shenSha.push('天德贵人');
                    }
                    // 月德贵人
                    if (this.isYueDeGuiRen(stem, branch)) {
                        shenSha.push('月德贵人');
                    }
                    // 天赦
                    if (this.isTianShe(stem, branch)) {
                        shenSha.push('天赦');
                    }
                    // 天恩
                    if (this.isTianEn(stem, branch)) {
                        shenSha.push('天恩');
                    }
                    // 天官
                    if (this.isTianGuan(stem, branch)) {
                        shenSha.push('天官');
                    }
                    // 天福
                    if (this.isTianFu(stem, branch)) {
                        shenSha.push('天福');
                    }
                    // 天厨
                    if (this.isTianChu(stem, branch)) {
                        shenSha.push('天厨');
                    }
                    // 天巫
                    if (this.isTianWu(branch)) {
                        shenSha.push('天巫');
                    }
                    // 天月
                    if (this.isTianYue(branch)) {
                        shenSha.push('天月');
                    }
                    // 天马
                    if (this.isTianMa(branch, yearBranch)) {
                        shenSha.push('天马');
                    }
                }
            }
            catch (e) {
                console.error('计算流月神煞出错:', e);
            }
            // 调试信息
            console.log(`流月神煞计算结果 - 月份: ${month}, 神煞: ${shenSha.join(', ')}`);
            console.log(`流月神煞计算结果类型 - 月份: ${month}, 类型: ${typeof shenSha}, 是否数组: ${Array.isArray(shenSha)}, 长度: ${shenSha.length}`);
            // 调试信息
            console.log(`流月返回数据 - 月份: ${month}, 神煞数组: `, shenSha);
            return {
                month,
                index,
                ganZhi,
                naYin,
                xunKong,
                shiShenGan,
                diShi,
                shenSha: [...shenSha] // 确保返回一个新的数组副本
            };
        });
        // 检查三合局和三会局
        const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
        const sanHeJu = this.checkSanHeJu(branches);
        const sanHuiJu = this.checkSanHuiJu(branches);
        // 计算五行强度
        const wuXingStrength = this.calculateWuXingStrength(eightChar);
        // 计算日主旺衰
        const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
        const riZhuStrength = riZhuStrengthInfo.result;
        const riZhuStrengthDetails = riZhuStrengthInfo.details;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ 
            // 基本信息
            solarDate,
            lunarDate,
            solarTime,
            // 八字信息
            yearPillar,
            yearStem,
            yearBranch,
            yearHideGan,
            yearWuXing,
            yearNaYin,
            monthPillar,
            monthStem,
            monthBranch,
            monthHideGan,
            monthWuXing,
            monthNaYin,
            dayPillar,
            dayStem,
            dayBranch,
            dayHideGan,
            dayWuXing,
            dayNaYin,
            hourPillar,
            hourStem,
            hourBranch,
            hourHideGan,
            hourWuXing,
            hourNaYin,
            // 特殊信息
            taiYuan,
            taiYuanNaYin,
            mingGong,
            mingGongNaYin,
            shenGong, 
            // 完整信息
            fullString: lunar.toFullString(), 
            // 流派信息
            baziSect: sect, gender,
            // 生肖信息
            yearShengXiao,
            monthShengXiao,
            dayShengXiao,
            hourShengXiao,
            // 十神信息
            yearShiShen,
            monthShiShen,
            dayShiShen,
            hourShiShen, 
            // 天干十神（用于显示）
            yearShiShenGan: yearShiShenGan, monthShiShenGan: monthShiShenGan, timeShiShenGan: hourShiShenGan, hourShiShenGan: hourShiShenGan, // 添加hourShiShenGan属性，与parseBaziString保持一致
            // 地支十神
            yearShiShenZhi,
            monthShiShenZhi,
            dayShiShenZhi,
            hourShiShenZhi,
            // 地势（长生十二神）
            yearDiShi,
            monthDiShi,
            dayDiShi,
            timeDiShi,
            // 旬空（空亡）
            yearXunKong,
            monthXunKong,
            dayXunKong,
            timeXunKong,
            // 星座和节气
            zodiac, jieQi: jieQi, nextJieQi: nextJieQi, 
            // 吉凶和神煞
            dayYi: dayYi, dayJi: dayJi, shenSha: shenSha }, (geJu ? { geJu } : {})), (geJuDetail ? { geJuDetail } : {})), (geJuStrength ? { geJuStrength } : {})), (yongShen ? { yongShen } : {})), (yongShenDetail ? { yongShenDetail } : {})), (geJuFactors ? { geJuFactors } : {})), { 
            // 起运信息
            qiYunYear,
            qiYunMonth,
            qiYunDay,
            qiYunHour,
            qiYunDate,
            qiYunAge,
            // 大运、流年、小运、流月
            daYun,
            liuNian,
            xiaoYun,
            liuYue,
            // 组合信息
            sanHeJu,
            sanHuiJu,
            // 五行强度和日主旺衰
            wuXingStrength,
            riZhuStrength,
            riZhuStrengthDetails });
    }
    /**
     * 获取地支对应的生肖
     * @param branch 地支
     * @returns 生肖
     */
    static getShengXiao(branch) {
        const map = {
            '子': '鼠',
            '丑': '牛',
            '寅': '虎',
            '卯': '兔',
            '辰': '龙',
            '巳': '蛇',
            '午': '马',
            '未': '羊',
            '申': '猴',
            '酉': '鸡',
            '戌': '狗',
            '亥': '猪'
        };
        return map[branch] || '未知';
    }
    /**
     * 获取十神
     * @param dayStem 日干（日主）
     * @param otherStem 其他天干
     * @returns 十神
     */
    static getShiShen(dayStem, otherStem) {
        // 天干顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        // 阳干：甲丙戊庚壬
        // 阴干：乙丁己辛癸
        const yangGan = '甲丙戊庚壬';
        // 获取日干和目标天干的索引
        const dayStemIndex = stems.indexOf(dayStem);
        const stemIndex = stems.indexOf(otherStem);
        if (dayStemIndex === -1 || stemIndex === -1) {
            return '未知';
        }
        // 判断日干阴阳
        const isDayYang = yangGan.includes(dayStem);
        // 计算十神索引
        let shiShenIndex = (stemIndex - dayStemIndex + 10) % 10;
        // 十神顺序（阳干）：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
        // 十神顺序（阴干）：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
        const shiShenNames = [
            "比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"
        ];
        return shiShenNames[shiShenIndex];
    }
    /**
     * 获取地支藏干的十神
     * @param dayStem 日干（日主）
     * @param branch 地支
     * @returns 藏干对应的十神数组
     */
    static getHiddenShiShen(dayStem, branch) {
        // 获取地支藏干
        const hideGanStr = this.getHideGan(branch);
        // 如果藏干字符串为空，返回空数组
        if (!hideGanStr) {
            return [];
        }
        const hideGans = hideGanStr.split(',');
        // 如果没有藏干，返回空数组
        if (hideGans.length === 0 || hideGans[0] === '') {
            return [];
        }
        // 计算每个藏干的十神
        const shiShens = [];
        for (const gan of hideGans) {
            if (gan) {
                const shiShen = this.getShiShen(dayStem, gan);
                shiShens.push(shiShen);
            }
        }
        return shiShens;
    }
    /**
     * 计算大运
     * @param eightChar 八字对象
     * @param gender 性别（1-男，0-女）
     * @returns 大运数组
     */
    static calculateDaYun(eightChar, gender) {
        // 这里简化处理，实际应该使用lunar-typescript库的方法
        // 或者根据八字命理规则计算
        const daYun = [];
        // 简单示例：从10岁开始，每10年一个大运
        const startAge = 10;
        const currentYear = new Date().getFullYear();
        // 获取月柱
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        // 天干地支顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 月柱索引
        const monthStemIndex = stems.indexOf(monthStem);
        const monthBranchIndex = branches.indexOf(monthBranch);
        // 根据性别确定顺逆行
        const direction = (gender === '1') ? 1 : -1; // 男顺女逆
        // 生成10个大运
        for (let i = 0; i < 10; i++) {
            // 计算大运干支索引
            const stemIndex = (monthStemIndex + direction * (i + 1) + 10) % 10;
            const branchIndex = (monthBranchIndex + direction * (i + 1) + 12) % 12;
            // 大运干支
            const stem = stems[stemIndex];
            const branch = branches[branchIndex];
            const ganZhi = stem + branch;
            // 大运纳音
            const naYin = this.getNaYin(ganZhi);
            // 大运起始年龄和年份
            const startYearAge = startAge + i * 10;
            const startYear = currentYear + (startYearAge - 20); // 假设当前年龄20岁
            daYun.push({
                startYear,
                startAge: startYearAge,
                ganZhi,
                naYin
            });
        }
        return daYun;
    }
    /**
     * 计算流年
     * @param birthYear 出生年
     * @returns 流年数组
     */
    static calculateLiuNian(birthYear) {
        const liuNian = [];
        const currentYear = new Date().getFullYear();
        // 天干地支顺序
        const stems = "甲乙丙丁戊己庚辛壬癸";
        const branches = "子丑寅卯辰巳午未申酉戌亥";
        // 生成10个流年（当前年及未来9年）
        for (let i = 0; i < 10; i++) {
            const year = currentYear + i;
            const age = year - birthYear + 1; // 虚岁
            // 计算流年干支
            const stemIndex = (year - 4) % 10;
            const branchIndex = (year - 4) % 12;
            const stem = stems[stemIndex];
            const branch = branches[branchIndex];
            const ganZhi = stem + branch;
            // 流年纳音
            const naYin = this.getNaYin(ganZhi);
            liuNian.push({
                year,
                age,
                ganZhi,
                naYin
            });
        }
        return liuNian;
    }
    /**
     * 计算五行强度
     * @param eightChar 八字对象
     * @returns 五行强度和详细计算过程
     */
    static calculateWuXingStrength(eightChar) {
        // 初始化五行强度
        const strength = {
            jin: 0,
            mu: 0,
            shui: 0,
            huo: 0,
            tu: 0 // 土
        };
        // 初始化详细信息，记录各项得分
        const details = {
            jin: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
            mu: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
            shui: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
            huo: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 },
            tu: { tianGan: 0, diZhiCang: 0, naYin: 0, season: 0, monthDominant: 0, combination: 0, total: 0 }
        };
        // 1. 天干部分 - 按照不同柱位的权重计算
        // 获取四柱天干
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const dayStem = eightChar.getDayGan();
        const timeStem = eightChar.getTimeGan();
        // 获取四柱天干五行
        const yearStemWuXing = this.getStemWuXing(yearStem);
        const monthStemWuXing = this.getStemWuXing(monthStem);
        const dayStemWuXing = this.getStemWuXing(dayStem);
        const timeStemWuXing = this.getStemWuXing(timeStem);
        // 天干权重: 年干(1.0) < 月干(2.5) < 日干(3.0) > 时干(1.0)
        this.addWuXingStrength(yearStemWuXing, 1.0, details, 'tianGan');
        this.addWuXingStrength(monthStemWuXing, 2.5, details, 'tianGan'); // 提高月干权重
        this.addWuXingStrength(dayStemWuXing, 3.0, details, 'tianGan');
        this.addWuXingStrength(timeStemWuXing, 1.0, details, 'tianGan');
        // 2. 地支部分 - 考虑地支藏干
        // 获取四柱地支
        const yearBranch = eightChar.getYearZhi();
        const monthBranch = eightChar.getMonthZhi();
        const dayBranch = eightChar.getDayZhi();
        const timeBranch = eightChar.getTimeZhi();
        // 获取地支藏干 - 使用我们自己的藏干定义，而不是lunar-typescript库的定义
        const yearHideGan = this.getHideGan(yearBranch).split(',');
        const monthHideGan = this.getHideGan(monthBranch).split(',');
        const dayHideGan = this.getHideGan(dayBranch).split(',');
        const timeHideGan = this.getHideGan(timeBranch).split(',');
        // 地支藏干权重: 年支藏干(0.7) < 月支藏干(2.0) < 日支藏干(2.0) > 时支藏干(0.7)
        this.processHideGanForStrength(yearHideGan, 0.7, details);
        this.processHideGanForStrength(monthHideGan, 2.0, details); // 提高月支藏干权重
        this.processHideGanForStrength(dayHideGan, 2.0, details);
        this.processHideGanForStrength(timeHideGan, 0.7, details);
        // 3. 纳音五行 - 考虑纳音的影响
        // 获取四柱纳音
        const yearNaYin = eightChar.getYearNaYin();
        const monthNaYin = eightChar.getMonthNaYin();
        const dayNaYin = eightChar.getDayNaYin();
        const timeNaYin = eightChar.getTimeNaYin();
        // 提取纳音五行
        const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
        const monthNaYinWuXing = this.getNaYinWuXing(monthNaYin);
        const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
        const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);
        // 纳音五行权重: 年柱纳音(0.5) < 月柱纳音(1.5) < 日柱纳音(1.5) > 时柱纳音(0.5)
        this.addWuXingStrength(yearNaYinWuXing, 0.5, details, 'naYin');
        this.addWuXingStrength(monthNaYinWuXing, 1.5, details, 'naYin'); // 提高月柱纳音权重
        this.addWuXingStrength(dayNaYinWuXing, 1.5, details, 'naYin');
        this.addWuXingStrength(timeNaYinWuXing, 0.5, details, 'naYin');
        // 4. 月令旺衰调整 - 根据月令对五行强度进行调整
        this.adjustByMonthSeasonForStrength(monthBranch, details);
        // 5. 月令当令加成 - 新增
        this.addMonthDominantBonus(monthBranch, details);
        // 6. 四柱组合调整 - 根据四柱组合关系进行调整
        this.adjustByCombinationForStrength(eightChar, details);
        // 7. 计算各五行总得分
        details.jin.total = details.jin.tianGan + details.jin.diZhiCang + details.jin.naYin +
            details.jin.season + details.jin.monthDominant + details.jin.combination;
        details.mu.total = details.mu.tianGan + details.mu.diZhiCang + details.mu.naYin +
            details.mu.season + details.mu.monthDominant + details.mu.combination;
        details.shui.total = details.shui.tianGan + details.shui.diZhiCang + details.shui.naYin +
            details.shui.season + details.shui.monthDominant + details.shui.combination;
        details.huo.total = details.huo.tianGan + details.huo.diZhiCang + details.huo.naYin +
            details.huo.season + details.huo.monthDominant + details.huo.combination;
        details.tu.total = details.tu.tianGan + details.tu.diZhiCang + details.tu.naYin +
            details.tu.season + details.tu.monthDominant + details.tu.combination;
        // 7. 四舍五入到一位小数
        details.jin.total = Math.round(details.jin.total * 10) / 10;
        details.mu.total = Math.round(details.mu.total * 10) / 10;
        details.shui.total = Math.round(details.shui.total * 10) / 10;
        details.huo.total = Math.round(details.huo.total * 10) / 10;
        details.tu.total = Math.round(details.tu.total * 10) / 10;
        // 8. 更新strength对象
        strength.jin = details.jin.total;
        strength.mu = details.mu.total;
        strength.shui = details.shui.total;
        strength.huo = details.huo.total;
        strength.tu = details.tu.total;
        // 返回结果
        return {
            jin: strength.jin,
            mu: strength.mu,
            shui: strength.shui,
            huo: strength.huo,
            tu: strength.tu,
            details
        };
    }
    /**
     * 增加五行强度
     * @param wuXing 五行
     * @param value 增加的值
     * @param details 详细信息对象
     * @param category 类别（tianGan, diZhiCang, naYin, season, combination）
     */
    static addWuXingStrength(wuXing, value, details, category) {
        if (!wuXing)
            return;
        switch (wuXing) {
            case '金':
                details.jin[category] += value;
                break;
            case '木':
                details.mu[category] += value;
                break;
            case '水':
                details.shui[category] += value;
                break;
            case '火':
                details.huo[category] += value;
                break;
            case '土':
                details.tu[category] += value;
                break;
        }
    }
    /**
     * 处理地支藏干的五行强度
     * @param hideGan 藏干数组
     * @param baseWeight 基础权重
     * @param details 详细信息对象
     * @param cangGanInnerWeight 藏干内部权重配置
     */
    static processHideGanForStrength(hideGan, baseWeight, details, cangGanInnerWeight) {
        if (!hideGan || hideGan.length === 0)
            return;
        // 根据藏干数量分配权重
        // 使用配置中的权重或默认权重
        let weights;
        if (cangGanInnerWeight) {
            weights = hideGan.length === 1 ? cangGanInnerWeight.one :
                hideGan.length === 2 ? cangGanInnerWeight.two :
                    cangGanInnerWeight.three;
        }
        else {
            // 默认权重
            weights = hideGan.length === 1 ? [1.0] :
                hideGan.length === 2 ? [0.6, 0.4] :
                    [0.5, 0.3, 0.2];
        }
        // 为每个藏干增加相应权重的五行强度
        hideGan.forEach((gan, index) => {
            if (index < weights.length) {
                const wuXing = this.getStemWuXing(gan);
                const value = baseWeight * weights[index];
                this.addWuXingStrength(wuXing, value, details, 'diZhiCang');
            }
        });
    }
    /**
     * 根据月令季节调整五行强度
     * @param monthBranch 月支
     * @param details 详细信息对象
     * @param seasonAdjust 季节调整系数配置
     * @param seasonWuXingStatus 季节五行对应关系配置
     */
    static adjustByMonthSeasonForStrength(monthBranch, details, seasonAdjust, seasonWuXingStatus) {
        // 使用配置或默认值
        const adjust = seasonAdjust || {
            wang: 2.0,
            xiang: 1.0,
            ping: 0.0,
            qiu: -1.0,
            si: -1.5 // 死系数
        };
        let season = '';
        let wuXingStatus = {};
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            season = 'spring';
            wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.spring : {
                mu: 'wang',
                huo: 'xiang',
                tu: 'ping',
                jin: 'qiu',
                shui: 'si' // 水死
            };
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            season = 'summer';
            wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.summer : {
                huo: 'wang',
                tu: 'xiang',
                jin: 'ping',
                shui: 'qiu',
                mu: 'si' // 木死
            };
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            season = 'autumn';
            wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.autumn : {
                jin: 'wang',
                shui: 'xiang',
                mu: 'ping',
                huo: 'qiu',
                tu: 'si' // 土死
            };
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            season = 'winter';
            wuXingStatus = seasonWuXingStatus ? seasonWuXingStatus.winter : {
                shui: 'wang',
                mu: 'xiang',
                huo: 'ping',
                tu: 'qiu',
                jin: 'si' // 金死
            };
        }
        // 应用调整
        Object.keys(wuXingStatus).forEach(wuXing => {
            const status = wuXingStatus[wuXing];
            if (details[wuXing] && adjust[status] !== undefined) {
                details[wuXing].season += adjust[status];
            }
        });
    }
    /**
     * 添加月令当令加成
     * @param monthBranch 月支
     * @param details 详细信息对象
     * @param monthDominantBonus 月令当令加成配置
     * @param monthDominantWuXing 月令当令五行对应关系配置
     */
    static addMonthDominantBonus(monthBranch, details, monthDominantBonus, monthDominantWuXing) {
        // 使用配置或默认值
        const bonus = monthDominantBonus || {
            dominant: 1.5,
            related: 0.8,
            neutral: 0.0,
            weak: -0.5,
            dead: -0.8 // 死加成
        };
        let season = '';
        let dominantInfo = {};
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            season = 'spring';
            dominantInfo = monthDominantWuXing ? monthDominantWuXing.spring : {
                dominant: 'mu',
                related: 'huo' // 火相旺
            };
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            season = 'summer';
            dominantInfo = monthDominantWuXing ? monthDominantWuXing.summer : {
                dominant: 'huo',
                related: 'tu' // 土相旺
            };
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            season = 'autumn';
            dominantInfo = monthDominantWuXing ? monthDominantWuXing.autumn : {
                dominant: 'jin',
                related: 'shui' // 水相旺
            };
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            season = 'winter';
            dominantInfo = monthDominantWuXing ? monthDominantWuXing.winter : {
                dominant: 'shui',
                related: 'mu' // 木相旺
            };
        }
        // 应用当令和相旺加成
        if (dominantInfo.dominant && details[dominantInfo.dominant]) {
            details[dominantInfo.dominant].monthDominant += bonus.dominant;
        }
        if (dominantInfo.related && details[dominantInfo.related]) {
            details[dominantInfo.related].monthDominant += bonus.related;
        }
        // 应用囚和死的负面调整（新增）
        // 根据季节五行旺衰关系确定囚和死的五行
        const wuXingList = ['jin', 'mu', 'shui', 'huo', 'tu'];
        const dominantWuXing = dominantInfo.dominant;
        const relatedWuXing = dominantInfo.related;
        // 找出平和、囚和死的五行
        wuXingList.forEach(wuXing => {
            if (wuXing !== dominantWuXing && wuXing !== relatedWuXing) {
                // 根据季节确定五行状态
                let status = 'neutral'; // 默认平和
                if (season === 'spring') {
                    if (wuXing === 'jin')
                        status = 'weak'; // 金囚
                    if (wuXing === 'shui')
                        status = 'dead'; // 水死
                }
                else if (season === 'summer') {
                    if (wuXing === 'shui')
                        status = 'weak'; // 水囚
                    if (wuXing === 'mu')
                        status = 'dead'; // 木死
                }
                else if (season === 'autumn') {
                    if (wuXing === 'huo')
                        status = 'weak'; // 火囚
                    if (wuXing === 'tu')
                        status = 'dead'; // 土死
                }
                else if (season === 'winter') {
                    if (wuXing === 'tu')
                        status = 'weak'; // 土囚
                    if (wuXing === 'jin')
                        status = 'dead'; // 金死
                }
                // 应用相应的加成
                if (bonus[status] && details[wuXing]) {
                    details[wuXing].monthDominant += bonus[status];
                }
            }
        });
    }
    /**
     * 根据四柱组合关系调整五行强度
     * @param eightChar 八字对象
     * @param details 详细信息对象
     * @param combinationWeight 组合关系权重配置
     */
    static adjustByCombinationForStrength(eightChar, details, combinationWeight) {
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 检查天干合化
        this.checkStemCombinationForStrength(yearStem, monthStem, details, combinationWeight);
        this.checkStemCombinationForStrength(yearStem, dayStem, details, combinationWeight);
        this.checkStemCombinationForStrength(yearStem, timeStem, details, combinationWeight);
        this.checkStemCombinationForStrength(monthStem, dayStem, details, combinationWeight);
        this.checkStemCombinationForStrength(monthStem, timeStem, details, combinationWeight);
        this.checkStemCombinationForStrength(dayStem, timeStem, details, combinationWeight);
        // 检查地支组合（三合、三会、六合等）
        this.checkBranchTripleForStrength(yearBranch, monthBranch, dayBranch, timeBranch, details, combinationWeight);
    }
    /**
     * 检查天干合化
     * @param stem1 天干1
     * @param stem2 天干2
     * @param details 详细信息对象
     * @param combinationWeight 组合关系权重配置
     */
    static checkStemCombinationForStrength(stem1, stem2, details, combinationWeight) {
        // 使用配置或默认值
        const tianGanWuHeValue = combinationWeight ? combinationWeight.tianGanWuHe : 0.6;
        // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
        const combinations = {
            '甲己': { result: '土', value: tianGanWuHeValue },
            '己甲': { result: '土', value: tianGanWuHeValue },
            '乙庚': { result: '金', value: tianGanWuHeValue },
            '庚乙': { result: '金', value: tianGanWuHeValue },
            '丙辛': { result: '水', value: tianGanWuHeValue },
            '辛丙': { result: '水', value: tianGanWuHeValue },
            '丁壬': { result: '木', value: tianGanWuHeValue },
            '壬丁': { result: '木', value: tianGanWuHeValue },
            '戊癸': { result: '火', value: tianGanWuHeValue },
            '癸戊': { result: '火', value: tianGanWuHeValue }
        };
        const key = stem1 + stem2;
        if (combinations[key]) {
            const { result, value } = combinations[key];
            this.addWuXingStrength(result, value, details, 'combination');
        }
    }
    /**
     * 检查地支三合和三会
     * @param branch1 地支1
     * @param branch2 地支2
     * @param branch3 地支3
     * @param branch4 地支4
     * @param details 详细信息对象
     * @param combinationWeight 组合关系权重配置
     */
    static checkBranchTripleForStrength(branch1, branch2, branch3, branch4, details, combinationWeight) {
        const branches = [branch1, branch2, branch3, branch4];
        // 使用配置或默认值
        const sanHeValue = combinationWeight ? combinationWeight.diZhiSanHe : 1.2;
        const sanHuiValue = combinationWeight ? combinationWeight.diZhiSanHui : 1.0;
        const partialSanHeValue = combinationWeight ? combinationWeight.partialSanHe : 0.9;
        const partialSanHuiValue = combinationWeight ? combinationWeight.partialSanHui : 0.7;
        // 检查三合局
        const sanHeJu = this.checkSanHeJu(branches);
        if (sanHeJu) {
            // 检查是完整三合还是部分三合
            const sanHePatterns = {
                '火': ['寅', '午', '戌'],
                '水': ['申', '子', '辰'],
                '木': ['亥', '卯', '未'],
                '金': ['巳', '酉', '丑']
            };
            const pattern = sanHePatterns[sanHeJu];
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            const uniqueBranches = new Set(matchedBranches);
            // 根据匹配的地支数量决定使用完整值还是部分值
            if (uniqueBranches.size === 3) {
                // 完整三合
                this.addWuXingStrength(sanHeJu, sanHeValue, details, 'combination');
            }
            else {
                // 部分三合
                this.addWuXingStrength(sanHeJu, partialSanHeValue, details, 'combination');
            }
        }
        // 检查三会局
        const sanHuiJu = this.checkSanHuiJu(branches);
        if (sanHuiJu) {
            // 检查是完整三会还是部分三会
            const sanHuiPatterns = {
                '木': ['寅', '卯', '辰'],
                '火': ['巳', '午', '未'],
                '金': ['申', '酉', '戌'],
                '水': ['亥', '子', '丑']
            };
            const pattern = sanHuiPatterns[sanHuiJu];
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            const uniqueBranches = new Set(matchedBranches);
            // 根据匹配的地支数量决定使用完整值还是部分值
            if (uniqueBranches.size === 3) {
                // 完整三会
                this.addWuXingStrength(sanHuiJu, sanHuiValue, details, 'combination');
            }
            else {
                // 部分三会
                this.addWuXingStrength(sanHuiJu, partialSanHuiValue, details, 'combination');
            }
        }
    }
    /**
     * 处理地支藏干的五行强度并返回详细信息
     * @param hideGan 藏干数组
     * @param baseWeight 基础权重
     * @param addStrength 增加强度的函数
     * @returns 每个藏干的权重值数组
     */
    static processHideGanWithDetails(hideGan, baseWeight, addStrength) {
        if (!hideGan || hideGan.length === 0)
            return [];
        // 根据藏干数量分配权重
        // 一个藏干：100%权重
        // 两个藏干：60%和40%权重
        // 三个藏干：50%、30%和20%权重
        const weights = hideGan.length === 1 ? [1.0] :
            hideGan.length === 2 ? [0.6, 0.4] :
                [0.5, 0.3, 0.2];
        const values = [];
        // 为每个藏干增加相应权重的五行强度
        hideGan.forEach((gan, index) => {
            if (index < weights.length) {
                const wuXing = this.getStemWuXing(gan);
                const value = baseWeight * weights[index];
                addStrength(wuXing, value);
                values.push(value);
            }
        });
        return values;
    }
    /**
     * 根据月令季节调整五行强度
     * @param monthBranch 月支
     * @param strength 五行强度对象
     */
    static adjustByMonthSeason(monthBranch, strength) {
        // 根据月令季节调整五行强度
        // 春季(寅卯辰)：木旺(+1.0)，火相(+0.5)，土休，金囚，水死
        // 夏季(巳午未)：火旺(+1.0)，土相(+0.5)，金休，水囚，木死
        // 秋季(申酉戌)：金旺(+1.0)，水相(+0.5)，木休，火囚，土死
        // 冬季(亥子丑)：水旺(+1.0)，木相(+0.5)，火休，土囚，金死
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            strength.mu += 1.0; // 木旺
            strength.huo += 0.5; // 火相
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            strength.huo += 1.0; // 火旺
            strength.tu += 0.5; // 土相
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            strength.jin += 1.0; // 金旺
            strength.shui += 0.5; // 水相
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            strength.shui += 1.0; // 水旺
            strength.mu += 0.5; // 木相
        }
    }
    /**
     * 根据月令季节调整五行强度并记录详细信息
     * @param monthBranch 月支
     * @param strength 五行强度对象
     * @param details 详细信息对象
     */
    static adjustByMonthSeasonWithDetails(monthBranch, strength, details) {
        let season = '';
        const adjustments = [];
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            season = '春季';
            strength.mu += 1.0; // 木旺
            adjustments.push({ wuXing: '木', value: 1.0 });
            strength.huo += 0.5; // 火相
            adjustments.push({ wuXing: '火', value: 0.5 });
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            season = '夏季';
            strength.huo += 1.0; // 火旺
            adjustments.push({ wuXing: '火', value: 1.0 });
            strength.tu += 0.5; // 土相
            adjustments.push({ wuXing: '土', value: 0.5 });
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            season = '秋季';
            strength.jin += 1.0; // 金旺
            adjustments.push({ wuXing: '金', value: 1.0 });
            strength.shui += 0.5; // 水相
            adjustments.push({ wuXing: '水', value: 0.5 });
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            season = '冬季';
            strength.shui += 1.0; // 水旺
            adjustments.push({ wuXing: '水', value: 1.0 });
            strength.mu += 0.5; // 木相
            adjustments.push({ wuXing: '木', value: 0.5 });
        }
        details.seasonAdjust.season = season;
        details.seasonAdjust.adjustments = adjustments;
    }
    /**
     * 根据四柱组合关系调整五行强度
     * @param eightChar 八字对象
     * @param strength 五行强度对象
     */
    static adjustByCombination(eightChar, strength) {
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 检查天干合化
        this.checkStemCombination(yearStem, monthStem, strength);
        this.checkStemCombination(yearStem, dayStem, strength);
        this.checkStemCombination(yearStem, timeStem, strength);
        this.checkStemCombination(monthStem, dayStem, strength);
        this.checkStemCombination(monthStem, timeStem, strength);
        this.checkStemCombination(dayStem, timeStem, strength);
        // 检查地支组合（三合、三会、六合等）
        // 这里只实现简化版的地支三合
        this.checkBranchTriple(yearBranch, monthBranch, dayBranch, timeBranch, strength);
    }
    /**
     * 根据四柱组合关系调整五行强度并记录详细信息
     * @param eightChar 八字对象
     * @param strength 五行强度对象
     * @param details 详细信息对象
     */
    static adjustByCombinationWithDetails(eightChar, strength, details) {
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        const combinations = [];
        // 检查天干合化
        this.checkStemCombinationWithDetails(yearStem, monthStem, strength, combinations);
        this.checkStemCombinationWithDetails(yearStem, dayStem, strength, combinations);
        this.checkStemCombinationWithDetails(yearStem, timeStem, strength, combinations);
        this.checkStemCombinationWithDetails(monthStem, dayStem, strength, combinations);
        this.checkStemCombinationWithDetails(monthStem, timeStem, strength, combinations);
        this.checkStemCombinationWithDetails(dayStem, timeStem, strength, combinations);
        // 检查地支组合（三合、三会、六合等）
        // 这里只实现简化版的地支三合
        this.checkBranchTripleWithDetails(yearBranch, monthBranch, dayBranch, timeBranch, strength, combinations);
        details.combinationAdjust.combinations = combinations;
    }
    /**
     * 检查天干合化
     * @param stem1 天干1
     * @param stem2 天干2
     * @param strength 五行强度对象
     */
    static checkStemCombination(stem1, stem2, strength) {
        // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
        const combinations = {
            '甲己': { result: '土', value: 0.6 },
            '己甲': { result: '土', value: 0.6 },
            '乙庚': { result: '金', value: 0.6 },
            '庚乙': { result: '金', value: 0.6 },
            '丙辛': { result: '水', value: 0.6 },
            '辛丙': { result: '水', value: 0.6 },
            '丁壬': { result: '木', value: 0.6 },
            '壬丁': { result: '木', value: 0.6 },
            '戊癸': { result: '火', value: 0.6 },
            '癸戊': { result: '火', value: 0.6 }
        };
        const key = stem1 + stem2;
        if (combinations[key]) {
            const { result, value } = combinations[key];
            switch (result) {
                case '金':
                    strength.jin += value;
                    break;
                case '木':
                    strength.mu += value;
                    break;
                case '水':
                    strength.shui += value;
                    break;
                case '火':
                    strength.huo += value;
                    break;
                case '土':
                    strength.tu += value;
                    break;
            }
        }
    }
    /**
     * 检查天干合化并记录详细信息
     * @param stem1 天干1
     * @param stem2 天干2
     * @param strength 五行强度对象
     * @param combinations 组合信息数组
     */
    static checkStemCombinationWithDetails(stem1, stem2, strength, combinations) {
        // 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
        const combinationMap = {
            '甲己': { result: '土', value: 0.6 },
            '己甲': { result: '土', value: 0.6 },
            '乙庚': { result: '金', value: 0.6 },
            '庚乙': { result: '金', value: 0.6 },
            '丙辛': { result: '水', value: 0.6 },
            '辛丙': { result: '水', value: 0.6 },
            '丁壬': { result: '木', value: 0.6 },
            '壬丁': { result: '木', value: 0.6 },
            '戊癸': { result: '火', value: 0.6 },
            '癸戊': { result: '火', value: 0.6 }
        };
        const key = stem1 + stem2;
        if (combinationMap[key]) {
            const { result, value } = combinationMap[key];
            switch (result) {
                case '金':
                    strength.jin += value;
                    break;
                case '木':
                    strength.mu += value;
                    break;
                case '水':
                    strength.shui += value;
                    break;
                case '火':
                    strength.huo += value;
                    break;
                case '土':
                    strength.tu += value;
                    break;
            }
            // 记录组合信息
            combinations.push({
                type: '天干五合',
                stems: [stem1, stem2],
                wuXing: result,
                value: value
            });
        }
    }
    /**
     * 检查地支三合和三会
     * @param branch1 地支1
     * @param branch2 地支2
     * @param branch3 地支3
     * @param branch4 地支4
     * @param strength 五行强度对象
     */
    static checkBranchTriple(branch1, branch2, branch3, branch4, strength) {
        // 地支三合：
        // 寅午戌三合火局
        // 亥卯未三合木局
        // 申子辰三合水局
        // 巳酉丑三合金局
        const branches = [branch1, branch2, branch3, branch4];
        // 检查三合局
        const sanHeJu = this.checkSanHeJu(branches);
        if (sanHeJu) {
            if (sanHeJu === '火')
                strength.huo += 1.2; // 提高三合局权重
            else if (sanHeJu === '木')
                strength.mu += 1.2;
            else if (sanHeJu === '水')
                strength.shui += 1.2;
            else if (sanHeJu === '金')
                strength.jin += 1.2;
        }
        // 检查三会局
        const sanHuiJu = this.checkSanHuiJu(branches);
        if (sanHuiJu) {
            if (sanHuiJu === '木')
                strength.mu += 1.0; // 提高三会局权重
            else if (sanHuiJu === '火')
                strength.huo += 1.0;
            else if (sanHuiJu === '金')
                strength.jin += 1.0;
            else if (sanHuiJu === '水')
                strength.shui += 1.0;
        }
    }
    /**
     * 检查地支三合和三会并记录详细信息
     * @param branch1 地支1
     * @param branch2 地支2
     * @param branch3 地支3
     * @param branch4 地支4
     * @param strength 五行强度对象
     * @param combinations 组合信息数组
     */
    static checkBranchTripleWithDetails(branch1, branch2, branch3, branch4, strength, combinations) {
        const branches = [branch1, branch2, branch3, branch4];
        // 检查三合局
        const sanHeJu = this.checkSanHeJu(branches);
        if (sanHeJu) {
            const value = 1.2; // 提高三合局权重
            let sanHeBranches = [];
            if (sanHeJu === '火') {
                sanHeBranches = ['寅', '午', '戌'].filter(b => branches.includes(b));
                strength.huo += value;
            }
            else if (sanHeJu === '木') {
                sanHeBranches = ['亥', '卯', '未'].filter(b => branches.includes(b));
                strength.mu += value;
            }
            else if (sanHeJu === '水') {
                sanHeBranches = ['申', '子', '辰'].filter(b => branches.includes(b));
                strength.shui += value;
            }
            else if (sanHeJu === '金') {
                sanHeBranches = ['巳', '酉', '丑'].filter(b => branches.includes(b));
                strength.jin += value;
            }
            combinations.push({
                type: '地支三合',
                stems: sanHeBranches,
                wuXing: sanHeJu,
                value: value
            });
        }
        // 检查三会局
        const sanHuiJu = this.checkSanHuiJu(branches);
        if (sanHuiJu) {
            const value = 1.0; // 提高三会局权重
            let sanHuiBranches = [];
            if (sanHuiJu === '木') {
                sanHuiBranches = ['寅', '卯', '辰'].filter(b => branches.includes(b));
                strength.mu += value;
            }
            else if (sanHuiJu === '火') {
                sanHuiBranches = ['巳', '午', '未'].filter(b => branches.includes(b));
                strength.huo += value;
            }
            else if (sanHuiJu === '金') {
                sanHuiBranches = ['申', '酉', '戌'].filter(b => branches.includes(b));
                strength.jin += value;
            }
            else if (sanHuiJu === '水') {
                sanHuiBranches = ['亥', '子', '丑'].filter(b => branches.includes(b));
                strength.shui += value;
            }
            combinations.push({
                type: '地支三会',
                stems: sanHuiBranches,
                wuXing: sanHuiJu,
                value: value
            });
        }
    }
    /**
     * 检查数组是否包含所有指定元素
     * @param array 数组
     * @param elements 要检查的元素
     * @returns 是否包含所有元素
     */
    static containsAll(array, elements) {
        return elements.every(element => array.includes(element));
    }
    /**
     * 从纳音字符串中提取五行属性
     * @param naYin 纳音字符串
     * @returns 五行属性
     */
    static getNaYinWuXing(naYin) {
        if (!naYin)
            return '';
        // 纳音五行提取规则：通常纳音字符串格式为"XX五行"，如"海中金"、"炉中火"等
        if (naYin.endsWith('金') || naYin.includes('金'))
            return '金';
        if (naYin.endsWith('木') || naYin.includes('木'))
            return '木';
        if (naYin.endsWith('水') || naYin.includes('水'))
            return '水';
        if (naYin.endsWith('火') || naYin.includes('火'))
            return '火';
        if (naYin.endsWith('土') || naYin.includes('土'))
            return '土';
        return '';
    }
    /**
     * 计算日主旺衰
     * @param eightChar 八字对象
     * @returns 日主旺衰信息对象，包含结果和详细计算过程
     */
    static calculateRiZhuStrength(eightChar) {
        // 获取日干和日干五行
        const dayStem = eightChar.getDayGan();
        // 直接使用getStemWuXing获取日干五行，而不是使用eightChar.getDayWuXing()
        const dayWuXing = this.getStemWuXing(dayStem);
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 获取月支对应的季节
        let season = '';
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            season = '春';
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            season = '夏';
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            season = '秋';
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            season = '冬';
        }
        // 初始化详细信息对象
        const details = {
            dayWuXing: this.getStemWuXing(dayStem),
            season,
            baseScore: 10,
            seasonEffect: '',
            ganRelation: '',
            zhiRelation: '',
            specialRelation: '',
            totalScore: 0
        };
        let totalScore = 10; // 基础分值
        let seasonEffect = 0;
        let ganRelationEffect = 0;
        let zhiRelationEffect = 0;
        let specialRelationEffect = 0;
        // 添加调试信息
        console.log('季节:', season);
        console.log('日主五行:', dayWuXing);
        console.log('日主五行类型:', typeof dayWuXing);
        // 1. 季节影响
        if (season === '春') {
            if (dayWuXing.includes('木')) {
                seasonEffect += 4; // 旺
                details.seasonEffect = '春季木旺 (+4)';
            }
            else if (dayWuXing.includes('火')) {
                seasonEffect += 2; // 相
                details.seasonEffect = '春季火相 (+2)';
            }
            else if (dayWuXing.includes('土')) {
                seasonEffect += 0; // 平
                details.seasonEffect = '春季土平 (0)';
            }
            else if (dayWuXing.includes('金')) {
                seasonEffect -= 2; // 衰
                details.seasonEffect = '春季金衰 (-2)';
            }
            else if (dayWuXing.includes('水')) {
                seasonEffect -= 4; // 死
                details.seasonEffect = '春季水死 (-4)';
            }
        }
        else if (season === '夏') {
            console.log('夏季判断:', dayWuXing.includes('火'), '火'.charCodeAt(0), dayWuXing.charCodeAt(0));
            if (dayWuXing.includes('火')) {
                seasonEffect += 4; // 旺
                details.seasonEffect = '夏季火旺 (+4)';
            }
            else if (dayWuXing.includes('土')) {
                seasonEffect += 2; // 相
                details.seasonEffect = '夏季土相 (+2)';
            }
            else if (dayWuXing.includes('金')) {
                seasonEffect += 0; // 平
                details.seasonEffect = '夏季金平 (0)';
            }
            else if (dayWuXing.includes('水')) {
                seasonEffect -= 2; // 衰
                details.seasonEffect = '夏季水衰 (-2)';
            }
            else if (dayWuXing.includes('木')) {
                seasonEffect -= 4; // 死
                details.seasonEffect = '夏季木死 (-4)';
            }
        }
        else if (season === '秋') {
            if (dayWuXing.includes('金')) {
                seasonEffect += 4; // 旺
                details.seasonEffect = '秋季金旺 (+4)';
            }
            else if (dayWuXing.includes('水')) {
                seasonEffect += 2; // 相
                details.seasonEffect = '秋季水相 (+2)';
            }
            else if (dayWuXing.includes('木')) {
                seasonEffect += 0; // 平
                details.seasonEffect = '秋季木平 (0)';
            }
            else if (dayWuXing.includes('火')) {
                seasonEffect -= 2; // 衰
                details.seasonEffect = '秋季火衰 (-2)';
            }
            else if (dayWuXing.includes('土')) {
                seasonEffect -= 4; // 死
                details.seasonEffect = '秋季土死 (-4)';
            }
        }
        else if (season === '冬') {
            if (dayWuXing.includes('水')) {
                seasonEffect += 4; // 旺
                details.seasonEffect = '冬季水旺 (+4)';
            }
            else if (dayWuXing.includes('木')) {
                seasonEffect += 2; // 相
                details.seasonEffect = '冬季木相 (+2)';
            }
            else if (dayWuXing.includes('火')) {
                seasonEffect += 0; // 平
                details.seasonEffect = '冬季火平 (0)';
            }
            else if (dayWuXing.includes('土')) {
                seasonEffect -= 2; // 衰
                details.seasonEffect = '冬季土衰 (-2)';
            }
            else if (dayWuXing.includes('金')) {
                seasonEffect -= 4; // 死
                details.seasonEffect = '冬季金死 (-4)';
            }
        }
        // 2. 天干对日主的影响
        let ganRelationDetails = [];
        // 年干对日主的影响
        const yearStemWuXing = this.getStemWuXing(yearStem);
        console.log('年干五行:', yearStemWuXing, '日主五行:', dayWuXing);
        if (yearStemWuXing.includes(dayWuXing) || dayWuXing.includes(yearStemWuXing)) {
            ganRelationEffect += 3;
            ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})与日主同五行 (+3)`);
        }
        else if (this.isWuXingSheng(yearStemWuXing, dayWuXing)) {
            ganRelationEffect += 2;
            ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})生日主 (+2)`);
        }
        else if (this.isWuXingKe(yearStemWuXing, dayWuXing)) {
            ganRelationEffect -= 2;
            ganRelationDetails.push(`年干${yearStem}(${yearStemWuXing})克日主 (-2)`);
        }
        // 月干对日主的影响
        const monthStemWuXing = this.getStemWuXing(monthStem);
        console.log('月干五行:', monthStemWuXing, '日主五行:', dayWuXing);
        if (monthStemWuXing.includes(dayWuXing) || dayWuXing.includes(monthStemWuXing)) {
            ganRelationEffect += 3;
            ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})与日主同五行 (+3)`);
        }
        else if (this.isWuXingSheng(monthStemWuXing, dayWuXing)) {
            ganRelationEffect += 2;
            ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})生日主 (+2)`);
        }
        else if (this.isWuXingKe(monthStemWuXing, dayWuXing)) {
            ganRelationEffect -= 2;
            ganRelationDetails.push(`月干${monthStem}(${monthStemWuXing})克日主 (-2)`);
        }
        // 时干对日主的影响
        const timeStemWuXing = this.getStemWuXing(timeStem);
        console.log('时干五行:', timeStemWuXing, '日主五行:', dayWuXing);
        if (timeStemWuXing.includes(dayWuXing) || dayWuXing.includes(timeStemWuXing)) {
            ganRelationEffect += 3;
            ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})与日主同五行 (+3)`);
        }
        else if (this.isWuXingSheng(timeStemWuXing, dayWuXing)) {
            ganRelationEffect += 2;
            ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})生日主 (+2)`);
        }
        else if (this.isWuXingKe(timeStemWuXing, dayWuXing)) {
            ganRelationEffect -= 2;
            ganRelationDetails.push(`时干${timeStem}(${timeStemWuXing})克日主 (-2)`);
        }
        details.ganRelation = ganRelationDetails.join('，');
        // 3. 地支藏干对日主的影响
        let zhiRelationDetails = [];
        // 处理年支藏干
        const yearHideGan = this.getHideGan(yearBranch).split(',');
        console.log('年支藏干:', yearHideGan);
        if (yearHideGan.length > 0 && yearHideGan[0] !== '') {
            for (const gan of yearHideGan) {
                const ganWuXing = this.getStemWuXing(gan);
                console.log('年支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
                if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
                    zhiRelationEffect += 1.5;
                    zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
                }
                else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
                    zhiRelationEffect += 1;
                    zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
                }
                else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
                    zhiRelationEffect -= 1;
                    zhiRelationDetails.push(`年支${yearBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
                }
            }
        }
        // 处理月支藏干
        const monthHideGan = this.getHideGan(monthBranch).split(',');
        console.log('月支藏干:', monthHideGan);
        if (monthHideGan.length > 0 && monthHideGan[0] !== '') {
            for (const gan of monthHideGan) {
                const ganWuXing = this.getStemWuXing(gan);
                console.log('月支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
                if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
                    zhiRelationEffect += 1.5;
                    zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
                }
                else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
                    zhiRelationEffect += 1;
                    zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
                }
                else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
                    zhiRelationEffect -= 1;
                    zhiRelationDetails.push(`月支${monthBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
                }
            }
        }
        // 处理日支藏干
        const dayHideGan = this.getHideGan(dayBranch).split(',');
        console.log('日支藏干:', dayHideGan);
        if (dayHideGan.length > 0 && dayHideGan[0] !== '') {
            for (const gan of dayHideGan) {
                const ganWuXing = this.getStemWuXing(gan);
                console.log('日支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
                if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
                    zhiRelationEffect += 1.5;
                    zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
                }
                else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
                    zhiRelationEffect += 1;
                    zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
                }
                else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
                    zhiRelationEffect -= 1;
                    zhiRelationDetails.push(`日支${dayBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
                }
            }
        }
        // 处理时支藏干
        const timeHideGan = this.getHideGan(timeBranch).split(',');
        console.log('时支藏干:', timeHideGan);
        if (timeHideGan.length > 0 && timeHideGan[0] !== '') {
            for (const gan of timeHideGan) {
                const ganWuXing = this.getStemWuXing(gan);
                console.log('时支藏干五行:', ganWuXing, '日主五行:', dayWuXing);
                if (ganWuXing.includes(dayWuXing) || dayWuXing.includes(ganWuXing)) {
                    zhiRelationEffect += 1.5;
                    zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})与日主同五行 (+1.5)`);
                }
                else if (this.isWuXingSheng(ganWuXing, dayWuXing)) {
                    zhiRelationEffect += 1;
                    zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})生日主 (+1)`);
                }
                else if (this.isWuXingKe(ganWuXing, dayWuXing)) {
                    zhiRelationEffect -= 1;
                    zhiRelationDetails.push(`时支${timeBranch}藏干${gan}(${ganWuXing})克日主 (-1)`);
                }
            }
        }
        details.zhiRelation = zhiRelationDetails.join('，');
        // 4. 特殊组合关系
        let specialRelationDetails = [];
        // 三合局检查
        const allBranches = [yearBranch, monthBranch, dayBranch, timeBranch];
        const sanHeJu = this.checkSanHeJu(allBranches);
        console.log('三合局:', sanHeJu);
        if (sanHeJu) {
            const sanHeWuXing = this.getSanHeWuXing(sanHeJu);
            console.log('三合局五行:', sanHeWuXing, '日主五行:', dayWuXing);
            // 获取三合局中的地支
            let sanHeBranches = [];
            if (sanHeJu === '火') {
                sanHeBranches = ['寅', '午', '戌'].filter(b => allBranches.includes(b));
            }
            else if (sanHeJu === '水') {
                sanHeBranches = ['申', '子', '辰'].filter(b => allBranches.includes(b));
            }
            else if (sanHeJu === '木') {
                sanHeBranches = ['亥', '卯', '未'].filter(b => allBranches.includes(b));
            }
            else if (sanHeJu === '金') {
                sanHeBranches = ['巳', '酉', '丑'].filter(b => allBranches.includes(b));
            }
            if (sanHeWuXing.includes(dayWuXing) || dayWuXing.includes(sanHeWuXing)) {
                specialRelationEffect += 3;
                specialRelationDetails.push(`日主参与${sanHeBranches.join('')}三合${sanHeJu}局，五行相同 (+3)`);
            }
            else if (this.isWuXingSheng(sanHeWuXing, dayWuXing)) {
                specialRelationEffect += 2;
                specialRelationDetails.push(`${sanHeBranches.join('')}三合${sanHeJu}局五行生日主 (+2)`);
            }
            else if (this.isWuXingKe(sanHeWuXing, dayWuXing)) {
                specialRelationEffect -= 2;
                specialRelationDetails.push(`${sanHeBranches.join('')}三合${sanHeJu}局五行克日主 (-2)`);
            }
        }
        // 三会局检查
        const sanHuiJu = this.checkSanHuiJu(allBranches);
        console.log('三会局:', sanHuiJu);
        if (sanHuiJu) {
            const sanHuiWuXing = this.getSanHuiWuXing(sanHuiJu);
            console.log('三会局五行:', sanHuiWuXing, '日主五行:', dayWuXing);
            // 获取三会局中的地支
            let sanHuiBranches = [];
            if (sanHuiJu === '木') {
                sanHuiBranches = ['寅', '卯', '辰'].filter(b => allBranches.includes(b));
            }
            else if (sanHuiJu === '火') {
                sanHuiBranches = ['巳', '午', '未'].filter(b => allBranches.includes(b));
            }
            else if (sanHuiJu === '金') {
                sanHuiBranches = ['申', '酉', '戌'].filter(b => allBranches.includes(b));
            }
            else if (sanHuiJu === '水') {
                sanHuiBranches = ['亥', '子', '丑'].filter(b => allBranches.includes(b));
            }
            if (sanHuiWuXing.includes(dayWuXing) || dayWuXing.includes(sanHuiWuXing)) {
                specialRelationEffect += 2.5;
                specialRelationDetails.push(`日主参与${sanHuiBranches.join('')}三会${sanHuiJu}局，五行相同 (+2.5)`);
            }
            else if (this.isWuXingSheng(sanHuiWuXing, dayWuXing)) {
                specialRelationEffect += 1.5;
                specialRelationDetails.push(`${sanHuiBranches.join('')}三会${sanHuiJu}局五行生日主 (+1.5)`);
            }
            else if (this.isWuXingKe(sanHuiWuXing, dayWuXing)) {
                specialRelationEffect -= 1.5;
                specialRelationDetails.push(`${sanHuiBranches.join('')}三会${sanHuiJu}局五行克日主 (-1.5)`);
            }
        }
        // 六合检查
        const liuHe = this.checkLiuHe(allBranches);
        console.log('六合:', liuHe);
        if (liuHe) {
            const liuHeWuXing = this.getLiuHeWuXing(liuHe);
            console.log('六合五行:', liuHeWuXing, '日主五行:', dayWuXing);
            if (liuHeWuXing.includes(dayWuXing) || dayWuXing.includes(liuHeWuXing)) {
                specialRelationEffect += 2;
                specialRelationDetails.push(`日主参与${liuHe}合，五行相同 (+2)`);
            }
            else if (this.isWuXingSheng(liuHeWuXing, dayWuXing)) {
                specialRelationEffect += 1;
                specialRelationDetails.push(`${liuHe}合五行生日主 (+1)`);
            }
            else if (this.isWuXingKe(liuHeWuXing, dayWuXing)) {
                specialRelationEffect -= 1;
                specialRelationDetails.push(`${liuHe}合五行克日主 (-1)`);
            }
        }
        // 纳音五行影响
        const dayNaYin = eightChar.getDayNaYin();
        const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
        console.log('日柱纳音:', dayNaYin, '纳音五行:', dayNaYinWuXing, '日主五行:', dayWuXing);
        if (dayNaYinWuXing.includes(dayWuXing) || dayWuXing.includes(dayNaYinWuXing)) {
            specialRelationEffect += 2;
            specialRelationDetails.push(`日柱纳音(${dayNaYin})与日主五行相同 (+2)`);
        }
        else if (this.isWuXingSheng(dayNaYinWuXing, dayWuXing)) {
            specialRelationEffect += 1;
            specialRelationDetails.push(`日柱纳音(${dayNaYin})生日主五行 (+1)`);
        }
        else if (this.isWuXingKe(dayNaYinWuXing, dayWuXing)) {
            specialRelationEffect -= 1;
            specialRelationDetails.push(`日柱纳音(${dayNaYin})克日主五行 (-1)`);
        }
        details.specialRelation = specialRelationDetails.join('，');
        // 计算总分
        totalScore = details.baseScore + seasonEffect + ganRelationEffect + zhiRelationEffect + specialRelationEffect;
        details.totalScore = totalScore;
        // 根据总分判断日主旺衰
        let result = '';
        if (totalScore >= 15) {
            result = '极旺';
        }
        else if (totalScore >= 10) {
            result = '旺';
        }
        else if (totalScore >= 5) {
            result = '偏旺';
        }
        else if (totalScore >= 0) {
            result = '平衡';
        }
        else if (totalScore >= -4) {
            result = '偏弱';
        }
        else if (totalScore >= -9) {
            result = '弱';
        }
        else {
            result = '极弱';
        }
        return {
            result,
            details
        };
    }
    /**
     * 检查是否有三合局
     * @param branches 地支数组
     * @returns 三合局类型或null
     */
    static checkSanHeJu(branches) {
        // 三合局：寅午戌合火局，申子辰合水局，亥卯未合木局，巳酉丑合金局
        const sanHePatterns = [
            { pattern: ['寅', '午', '戌'], type: '火' },
            { pattern: ['申', '子', '辰'], type: '水' },
            { pattern: ['亥', '卯', '未'], type: '木' },
            { pattern: ['巳', '酉', '丑'], type: '金' }
        ];
        for (const { pattern, type } of sanHePatterns) {
            // 收集实际出现的地支
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            // 检查是否至少有两个不同的地支
            const uniqueBranches = new Set(matchedBranches);
            if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三合
                return type;
            }
        }
        return null;
    }
    /**
     * 获取三合局的五行属性
     * @param sanHeType 三合局类型
     * @returns 五行属性
     */
    static getSanHeWuXing(sanHeType) {
        switch (sanHeType) {
            case '火': return '火';
            case '水': return '水';
            case '木': return '木';
            case '金': return '金';
            default: return '';
        }
    }
    /**
     * 检查是否有三会局
     * @param branches 地支数组
     * @returns 三会局类型或null
     */
    static checkSanHuiJu(branches) {
        // 三会局：寅卯辰三会木局，巳午未三会火局，申酉戌三会金局，亥子丑三会水局
        const sanHuiPatterns = [
            { pattern: ['寅', '卯', '辰'], type: '木' },
            { pattern: ['巳', '午', '未'], type: '火' },
            { pattern: ['申', '酉', '戌'], type: '金' },
            { pattern: ['亥', '子', '丑'], type: '水' }
        ];
        for (const { pattern, type } of sanHuiPatterns) {
            // 收集实际出现的地支
            const matchedBranches = branches.filter(branch => pattern.includes(branch));
            // 检查是否至少有两个不同的地支
            const uniqueBranches = new Set(matchedBranches);
            if (uniqueBranches.size >= 2) { // 至少有两个不同的地支形成三会
                return type;
            }
        }
        return null;
    }
    /**
     * 获取三会局的五行属性
     * @param sanHuiType 三会局类型
     * @returns 五行属性
     */
    static getSanHuiWuXing(sanHuiType) {
        switch (sanHuiType) {
            case '木': return '木';
            case '火': return '火';
            case '金': return '金';
            case '水': return '水';
            default: return '';
        }
    }
    /**
     * 检查是否有天干五合
     * @param stems 天干数组
     * @returns 五合类型或null
     */
    static checkWuHeJu(stems) {
        // 天干五合：甲己合土，乙庚合金，丙辛合水，丁壬合木，戊癸合火
        const wuHePatterns = [
            { pattern: ['甲', '己'], type: '土' },
            { pattern: ['乙', '庚'], type: '金' },
            { pattern: ['丙', '辛'], type: '水' },
            { pattern: ['丁', '壬'], type: '木' },
            { pattern: ['戊', '癸'], type: '火' }
        ];
        for (const { pattern, type } of wuHePatterns) {
            let hasFirst = false;
            let hasSecond = false;
            for (const stem of stems) {
                if (stem === pattern[0])
                    hasFirst = true;
                if (stem === pattern[1])
                    hasSecond = true;
            }
            if (hasFirst && hasSecond) {
                return type;
            }
        }
        return null;
    }
    /**
     * 获取五合的五行属性
     * @param wuHeType 五合类型
     * @returns 五行属性
     */
    static getWuHeWuXing(wuHeType) {
        switch (wuHeType) {
            case '土': return '土';
            case '金': return '金';
            case '水': return '水';
            case '木': return '木';
            case '火': return '火';
            default: return '';
        }
    }
    /**
     * 检查是否有六合
     * @param branches 地支数组
     * @returns 六合类型或null
     */
    static checkLiuHe(branches) {
        // 六合：子丑合土，寅亥合木，卯戌合火，辰酉合金，巳申合水，午未合土
        const liuHePatterns = [
            { pattern: ['子', '丑'], type: '土' },
            { pattern: ['寅', '亥'], type: '木' },
            { pattern: ['卯', '戌'], type: '火' },
            { pattern: ['辰', '酉'], type: '金' },
            { pattern: ['巳', '申'], type: '水' },
            { pattern: ['午', '未'], type: '土' }
        ];
        for (const { pattern, type } of liuHePatterns) {
            let hasFirst = false;
            let hasSecond = false;
            for (const branch of branches) {
                if (branch === pattern[0])
                    hasFirst = true;
                if (branch === pattern[1])
                    hasSecond = true;
            }
            if (hasFirst && hasSecond) {
                return type;
            }
        }
        return null;
    }
    /**
     * 获取六合的五行属性
     * @param liuHeType 六合类型
     * @returns 五行属性
     */
    static getLiuHeWuXing(liuHeType) {
        switch (liuHeType) {
            case '土': return '土';
            case '金': return '金';
            case '水': return '水';
            case '木': return '木';
            case '火': return '火';
            default: return '';
        }
    }
    /**
     * 计算神煞
     * @param eightChar 八字对象
     * @returns 包含总神煞和各柱神煞的对象
     */
    static calculateShenSha(eightChar) {
        const shenSha = [];
        const yearShenSha = [];
        const monthShenSha = [];
        const dayShenSha = [];
        const hourShenSha = [];
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 获取季节信息（用于童子煞和将军箭的判断）
        let season = '';
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            season = '春';
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            season = '夏';
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            season = '秋';
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            season = '冬';
        }
        // 天乙贵人
        if (this.isTianYiGuiRen(dayStem, yearBranch)) {
            yearShenSha.push('天乙贵人');
        }
        if (this.isTianYiGuiRen(dayStem, monthBranch)) {
            monthShenSha.push('天乙贵人');
        }
        if (this.isTianYiGuiRen(dayStem, dayBranch)) {
            dayShenSha.push('天乙贵人');
        }
        if (this.isTianYiGuiRen(dayStem, timeBranch)) {
            hourShenSha.push('天乙贵人');
        }
        // 文昌
        if (this.isWenChang(yearBranch)) {
            yearShenSha.push('文昌');
        }
        if (this.isWenChang(monthBranch)) {
            monthShenSha.push('文昌');
        }
        if (this.isWenChang(dayBranch)) {
            dayShenSha.push('文昌');
        }
        if (this.isWenChang(timeBranch)) {
            hourShenSha.push('文昌');
        }
        // 华盖
        if (this.isHuaGai(yearBranch)) {
            yearShenSha.push('华盖');
        }
        if (this.isHuaGai(monthBranch)) {
            monthShenSha.push('华盖');
        }
        if (this.isHuaGai(dayBranch)) {
            dayShenSha.push('华盖');
        }
        if (this.isHuaGai(timeBranch)) {
            hourShenSha.push('华盖');
        }
        // 禄神
        if (this.isLuShen(yearStem, yearBranch)) {
            yearShenSha.push('禄神');
        }
        if (this.isLuShen(monthStem, monthBranch)) {
            monthShenSha.push('禄神');
        }
        if (this.isLuShen(dayStem, dayBranch)) {
            dayShenSha.push('禄神');
        }
        if (this.isLuShen(timeStem, timeBranch)) {
            hourShenSha.push('禄神');
        }
        // 桃花
        if (this.isTaoHua(yearBranch)) {
            yearShenSha.push('桃花');
        }
        if (this.isTaoHua(monthBranch)) {
            monthShenSha.push('桃花');
        }
        if (this.isTaoHua(dayBranch)) {
            dayShenSha.push('桃花');
        }
        if (this.isTaoHua(timeBranch)) {
            hourShenSha.push('桃花');
        }
        // 孤辰
        if (this.isGuChen(yearBranch)) {
            yearShenSha.push('孤辰');
        }
        if (this.isGuChen(monthBranch)) {
            monthShenSha.push('孤辰');
        }
        if (this.isGuChen(dayBranch)) {
            dayShenSha.push('孤辰');
        }
        if (this.isGuChen(timeBranch)) {
            hourShenSha.push('孤辰');
        }
        // 寡宿
        if (this.isGuaSu(yearBranch)) {
            yearShenSha.push('寡宿');
        }
        if (this.isGuaSu(monthBranch)) {
            monthShenSha.push('寡宿');
        }
        if (this.isGuaSu(dayBranch)) {
            dayShenSha.push('寡宿');
        }
        if (this.isGuaSu(timeBranch)) {
            hourShenSha.push('寡宿');
        }
        // 驿马
        if (this.isYiMa(yearBranch, yearBranch)) {
            yearShenSha.push('驿马');
        }
        if (this.isYiMa(monthBranch, yearBranch)) {
            monthShenSha.push('驿马');
        }
        if (this.isYiMa(dayBranch, yearBranch)) {
            dayShenSha.push('驿马');
        }
        if (this.isYiMa(timeBranch, yearBranch)) {
            hourShenSha.push('驿马');
        }
        // 将星
        if (this.isJiangXing(dayStem, yearBranch)) {
            yearShenSha.push('将星');
        }
        if (this.isJiangXing(dayStem, monthBranch)) {
            monthShenSha.push('将星');
        }
        if (this.isJiangXing(dayStem, dayBranch)) {
            dayShenSha.push('将星');
        }
        if (this.isJiangXing(dayStem, timeBranch)) {
            hourShenSha.push('将星');
        }
        // 金神
        if (this.isJinShen(yearBranch)) {
            yearShenSha.push('金神');
        }
        if (this.isJinShen(monthBranch)) {
            monthShenSha.push('金神');
        }
        if (this.isJinShen(dayBranch)) {
            dayShenSha.push('金神');
        }
        if (this.isJinShen(timeBranch)) {
            hourShenSha.push('金神');
        }
        // 天德
        if (this.isTianDe(yearStem, yearBranch)) {
            yearShenSha.push('天德');
        }
        if (this.isTianDe(monthStem, monthBranch)) {
            monthShenSha.push('天德');
        }
        if (this.isTianDe(dayStem, dayBranch)) {
            dayShenSha.push('天德');
        }
        if (this.isTianDe(timeStem, timeBranch)) {
            hourShenSha.push('天德');
        }
        // 天德合
        if (this.isTianDeHe(yearStem, yearBranch)) {
            yearShenSha.push('天德合');
        }
        if (this.isTianDeHe(monthStem, monthBranch)) {
            monthShenSha.push('天德合');
        }
        if (this.isTianDeHe(dayStem, dayBranch)) {
            dayShenSha.push('天德合');
        }
        if (this.isTianDeHe(timeStem, timeBranch)) {
            hourShenSha.push('天德合');
        }
        // 月德
        if (this.isYueDe(yearStem)) {
            yearShenSha.push('月德');
        }
        if (this.isYueDe(monthStem)) {
            monthShenSha.push('月德');
        }
        if (this.isYueDe(dayStem)) {
            dayShenSha.push('月德');
        }
        if (this.isYueDe(timeStem)) {
            hourShenSha.push('月德');
        }
        // 天医
        if (this.isTianYi(yearBranch)) {
            yearShenSha.push('天医');
        }
        if (this.isTianYi(monthBranch)) {
            monthShenSha.push('天医');
        }
        if (this.isTianYi(dayBranch)) {
            dayShenSha.push('天医');
        }
        if (this.isTianYi(timeBranch)) {
            hourShenSha.push('天医');
        }
        // 天喜
        if (this.isTianXi(yearBranch, yearBranch)) {
            yearShenSha.push('天喜');
        }
        if (this.isTianXi(monthBranch, yearBranch)) {
            monthShenSha.push('天喜');
        }
        if (this.isTianXi(dayBranch, yearBranch)) {
            dayShenSha.push('天喜');
        }
        if (this.isTianXi(timeBranch, yearBranch)) {
            hourShenSha.push('天喜');
        }
        // 红艳
        if (this.isHongYan(yearBranch)) {
            yearShenSha.push('红艳');
        }
        if (this.isHongYan(monthBranch)) {
            monthShenSha.push('红艳');
        }
        if (this.isHongYan(dayBranch)) {
            dayShenSha.push('红艳');
        }
        if (this.isHongYan(timeBranch)) {
            hourShenSha.push('红艳');
        }
        // 天罗
        if (this.isTianLuo(yearBranch)) {
            yearShenSha.push('天罗');
        }
        if (this.isTianLuo(monthBranch)) {
            monthShenSha.push('天罗');
        }
        if (this.isTianLuo(dayBranch)) {
            dayShenSha.push('天罗');
        }
        if (this.isTianLuo(timeBranch)) {
            hourShenSha.push('天罗');
        }
        // 地网
        if (this.isDiWang(yearBranch)) {
            yearShenSha.push('地网');
        }
        if (this.isDiWang(monthBranch)) {
            monthShenSha.push('地网');
        }
        if (this.isDiWang(dayBranch)) {
            dayShenSha.push('地网');
        }
        if (this.isDiWang(timeBranch)) {
            hourShenSha.push('地网');
        }
        // 羊刃
        if (this.isYangRen(dayStem, yearBranch)) {
            yearShenSha.push('羊刃');
        }
        if (this.isYangRen(dayStem, monthBranch)) {
            monthShenSha.push('羊刃');
        }
        if (this.isYangRen(dayStem, dayBranch)) {
            dayShenSha.push('羊刃');
        }
        if (this.isYangRen(dayStem, timeBranch)) {
            hourShenSha.push('羊刃');
        }
        // 天空
        if (this.isTianKong(yearBranch)) {
            yearShenSha.push('天空');
        }
        if (this.isTianKong(monthBranch)) {
            monthShenSha.push('天空');
        }
        if (this.isTianKong(dayBranch)) {
            dayShenSha.push('天空');
        }
        if (this.isTianKong(timeBranch)) {
            hourShenSha.push('天空');
        }
        // 地劫
        if (this.isDiJie(yearBranch)) {
            yearShenSha.push('地劫');
        }
        if (this.isDiJie(monthBranch)) {
            monthShenSha.push('地劫');
        }
        if (this.isDiJie(dayBranch)) {
            dayShenSha.push('地劫');
        }
        if (this.isDiJie(timeBranch)) {
            hourShenSha.push('地劫');
        }
        // 天刑
        if (this.isTianXing(yearBranch)) {
            yearShenSha.push('天刑');
        }
        if (this.isTianXing(monthBranch)) {
            monthShenSha.push('天刑');
        }
        if (this.isTianXing(dayBranch)) {
            dayShenSha.push('天刑');
        }
        if (this.isTianXing(timeBranch)) {
            hourShenSha.push('天刑');
        }
        // 天哭
        if (this.isTianKu(yearBranch)) {
            yearShenSha.push('天哭');
        }
        if (this.isTianKu(monthBranch)) {
            monthShenSha.push('天哭');
        }
        if (this.isTianKu(dayBranch)) {
            dayShenSha.push('天哭');
        }
        if (this.isTianKu(timeBranch)) {
            hourShenSha.push('天哭');
        }
        // 天虚
        if (this.isTianXu(yearBranch)) {
            yearShenSha.push('天虚');
        }
        if (this.isTianXu(monthBranch)) {
            monthShenSha.push('天虚');
        }
        if (this.isTianXu(dayBranch)) {
            dayShenSha.push('天虚');
        }
        if (this.isTianXu(timeBranch)) {
            hourShenSha.push('天虚');
        }
        // 咸池
        if (this.isXianChi(yearBranch)) {
            yearShenSha.push('咸池');
        }
        if (this.isXianChi(monthBranch)) {
            monthShenSha.push('咸池');
        }
        if (this.isXianChi(dayBranch)) {
            dayShenSha.push('咸池');
        }
        if (this.isXianChi(timeBranch)) {
            hourShenSha.push('咸池');
        }
        // 亡神
        if (this.isWangShen(yearBranch)) {
            yearShenSha.push('亡神');
        }
        if (this.isWangShen(monthBranch)) {
            monthShenSha.push('亡神');
        }
        if (this.isWangShen(dayBranch)) {
            dayShenSha.push('亡神');
        }
        if (this.isWangShen(timeBranch)) {
            hourShenSha.push('亡神');
        }
        // 劫煞
        if (this.isJieSha(yearBranch)) {
            yearShenSha.push('劫煞');
        }
        if (this.isJieSha(monthBranch)) {
            monthShenSha.push('劫煞');
        }
        if (this.isJieSha(dayBranch)) {
            dayShenSha.push('劫煞');
        }
        if (this.isJieSha(timeBranch)) {
            hourShenSha.push('劫煞');
        }
        // 灾煞
        if (this.isZaiSha(yearBranch)) {
            yearShenSha.push('灾煞');
        }
        if (this.isZaiSha(monthBranch)) {
            monthShenSha.push('灾煞');
        }
        if (this.isZaiSha(dayBranch)) {
            dayShenSha.push('灾煞');
        }
        if (this.isZaiSha(timeBranch)) {
            hourShenSha.push('灾煞');
        }
        // 岁破
        if (this.isSuiPo(yearBranch, yearBranch)) {
            yearShenSha.push('岁破');
        }
        if (this.isSuiPo(monthBranch, yearBranch)) {
            monthShenSha.push('岁破');
        }
        if (this.isSuiPo(dayBranch, yearBranch)) {
            dayShenSha.push('岁破');
        }
        if (this.isSuiPo(timeBranch, yearBranch)) {
            hourShenSha.push('岁破');
        }
        // 大耗
        if (this.isDaHao(yearBranch, yearBranch)) {
            yearShenSha.push('大耗');
        }
        if (this.isDaHao(monthBranch, yearBranch)) {
            monthShenSha.push('大耗');
        }
        if (this.isDaHao(dayBranch, yearBranch)) {
            dayShenSha.push('大耗');
        }
        if (this.isDaHao(timeBranch, yearBranch)) {
            hourShenSha.push('大耗');
        }
        // 五鬼
        if (this.isWuGui(yearBranch)) {
            yearShenSha.push('五鬼');
        }
        if (this.isWuGui(monthBranch)) {
            monthShenSha.push('五鬼');
        }
        if (this.isWuGui(dayBranch)) {
            dayShenSha.push('五鬼');
        }
        if (this.isWuGui(timeBranch)) {
            hourShenSha.push('五鬼');
        }
        // 天德贵人
        if (this.isTianDeGuiRen(yearStem, yearBranch)) {
            yearShenSha.push('天德贵人');
        }
        if (this.isTianDeGuiRen(monthStem, monthBranch)) {
            monthShenSha.push('天德贵人');
        }
        if (this.isTianDeGuiRen(dayStem, dayBranch)) {
            dayShenSha.push('天德贵人');
        }
        if (this.isTianDeGuiRen(timeStem, timeBranch)) {
            hourShenSha.push('天德贵人');
        }
        // 月德贵人
        if (this.isYueDeGuiRen(yearStem, yearBranch)) {
            yearShenSha.push('月德贵人');
        }
        if (this.isYueDeGuiRen(monthStem, monthBranch)) {
            monthShenSha.push('月德贵人');
        }
        if (this.isYueDeGuiRen(dayStem, dayBranch)) {
            dayShenSha.push('月德贵人');
        }
        if (this.isYueDeGuiRen(timeStem, timeBranch)) {
            hourShenSha.push('月德贵人');
        }
        // 天赦
        if (this.isTianShe(yearStem, yearBranch)) {
            yearShenSha.push('天赦');
        }
        if (this.isTianShe(monthStem, monthBranch)) {
            monthShenSha.push('天赦');
        }
        if (this.isTianShe(dayStem, dayBranch)) {
            dayShenSha.push('天赦');
        }
        if (this.isTianShe(timeStem, timeBranch)) {
            hourShenSha.push('天赦');
        }
        // 天恩
        if (this.isTianEn(yearStem, yearBranch)) {
            yearShenSha.push('天恩');
        }
        if (this.isTianEn(monthStem, monthBranch)) {
            monthShenSha.push('天恩');
        }
        if (this.isTianEn(dayStem, dayBranch)) {
            dayShenSha.push('天恩');
        }
        if (this.isTianEn(timeStem, timeBranch)) {
            hourShenSha.push('天恩');
        }
        // 天官
        if (this.isTianGuan(yearStem, yearBranch)) {
            yearShenSha.push('天官');
        }
        if (this.isTianGuan(monthStem, monthBranch)) {
            monthShenSha.push('天官');
        }
        if (this.isTianGuan(dayStem, dayBranch)) {
            dayShenSha.push('天官');
        }
        if (this.isTianGuan(timeStem, timeBranch)) {
            hourShenSha.push('天官');
        }
        // 天福
        if (this.isTianFu(yearStem, yearBranch)) {
            yearShenSha.push('天福');
        }
        if (this.isTianFu(monthStem, monthBranch)) {
            monthShenSha.push('天福');
        }
        if (this.isTianFu(dayStem, dayBranch)) {
            dayShenSha.push('天福');
        }
        if (this.isTianFu(timeStem, timeBranch)) {
            hourShenSha.push('天福');
        }
        // 天厨
        if (this.isTianChu(yearStem, yearBranch)) {
            yearShenSha.push('天厨');
        }
        if (this.isTianChu(monthStem, monthBranch)) {
            monthShenSha.push('天厨');
        }
        if (this.isTianChu(dayStem, dayBranch)) {
            dayShenSha.push('天厨');
        }
        if (this.isTianChu(timeStem, timeBranch)) {
            hourShenSha.push('天厨');
        }
        // 天巫
        if (this.isTianWu(yearBranch)) {
            yearShenSha.push('天巫');
        }
        if (this.isTianWu(monthBranch)) {
            monthShenSha.push('天巫');
        }
        if (this.isTianWu(dayBranch)) {
            dayShenSha.push('天巫');
        }
        if (this.isTianWu(timeBranch)) {
            hourShenSha.push('天巫');
        }
        // 天月
        if (this.isTianYue(yearBranch)) {
            yearShenSha.push('天月');
        }
        if (this.isTianYue(monthBranch)) {
            monthShenSha.push('天月');
        }
        if (this.isTianYue(dayBranch)) {
            dayShenSha.push('天月');
        }
        if (this.isTianYue(timeBranch)) {
            hourShenSha.push('天月');
        }
        // 天马
        if (this.isTianMa(yearBranch, yearBranch)) {
            yearShenSha.push('天马');
        }
        if (this.isTianMa(monthBranch, yearBranch)) {
            monthShenSha.push('天马');
        }
        if (this.isTianMa(dayBranch, yearBranch)) {
            dayShenSha.push('天马');
        }
        if (this.isTianMa(timeBranch, yearBranch)) {
            hourShenSha.push('天马');
        }
        // 童子煞（根据季节、纳音五行和地支判断）
        if (season && this.isTongZiSha(eightChar, season)) {
            shenSha.push('童子煞');
        }
        // 将军箭（根据季节、时支、冲克关系和纳音五行判断）
        if (season && this.isJiangJunJian(eightChar, season)) {
            hourShenSha.push('将军箭');
        }
        // 将各柱神煞添加到总神煞数组中
        shenSha.push(...yearShenSha.map(s => `年柱:${s}`));
        shenSha.push(...monthShenSha.map(s => `月柱:${s}`));
        shenSha.push(...dayShenSha.map(s => `日柱:${s}`));
        shenSha.push(...hourShenSha.map(s => `时柱:${s}`));
        // 调试信息
        console.log('calculateShenSha 返回结果:');
        console.log('总神煞:', shenSha);
        console.log('年柱神煞:', yearShenSha);
        console.log('月柱神煞:', monthShenSha);
        console.log('日柱神煞:', dayShenSha);
        console.log('时柱神煞:', hourShenSha);
        // 确保返回的是数组
        const finalShenSha = Array.isArray(shenSha) ? [...shenSha] : [];
        if (!Array.isArray(shenSha)) {
            console.error('总神煞不是数组，强制转换为数组');
        }
        const finalYearShenSha = Array.isArray(yearShenSha) ? [...yearShenSha] : [];
        if (!Array.isArray(yearShenSha)) {
            console.error('年柱神煞不是数组，强制转换为数组');
        }
        const finalMonthShenSha = Array.isArray(monthShenSha) ? [...monthShenSha] : [];
        if (!Array.isArray(monthShenSha)) {
            console.error('月柱神煞不是数组，强制转换为数组');
        }
        const finalDayShenSha = Array.isArray(dayShenSha) ? [...dayShenSha] : [];
        if (!Array.isArray(dayShenSha)) {
            console.error('日柱神煞不是数组，强制转换为数组');
        }
        const finalHourShenSha = Array.isArray(hourShenSha) ? [...hourShenSha] : [];
        if (!Array.isArray(hourShenSha)) {
            console.error('时柱神煞不是数组，强制转换为数组');
        }
        return {
            shenSha: finalShenSha,
            yearShenSha: finalYearShenSha,
            monthShenSha: finalMonthShenSha,
            dayShenSha: finalDayShenSha,
            hourShenSha: finalHourShenSha
        };
    }
    /**
     * 判断是否为天乙贵人
     * @param dayStem 日干
     * @param branch 地支
     * @returns 是否为天乙贵人
     */
    static isTianYiGuiRen(dayStem, branch) {
        var _a;
        // 天乙贵人的计算规则：
        // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，
        // 六辛逢虎兔，此是贵人方。
        const map = {
            '甲': ['丑', '未'],
            '乙': ['子', '申'],
            '丙': ['亥', '酉'],
            '丁': ['亥', '酉'],
            '戊': ['丑', '未'],
            '己': ['子', '申'],
            '庚': ['丑', '未'],
            '辛': ['寅', '卯'],
            '壬': ['巳', '卯'],
            '癸': ['巳', '卯'] // 修正：癸日贵人在巳卯
        };
        return ((_a = map[dayStem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为文昌
     * @param branch 地支
     * @returns 是否为文昌
     */
    static isWenChang(branch) {
        // 文昌星的计算规则：
        // 寅午戌见巳，申子辰见申，
        // 亥卯未见午，巳酉丑见寅。
        // 这里简化处理，直接判断地支是否为文昌星
        return ['巳', '申', '午', '寅'].includes(branch);
    }
    /**
     * 判断是否为华盖
     * @param branch 地支
     * @returns 是否为华盖
     */
    static isHuaGai(branch) {
        // 华盖星的计算规则：
        // 寅午戌见戌，申子辰见辰，
        // 亥卯未见未，巳酉丑见丑。
        // 这里简化处理，直接判断地支是否为华盖星
        return ['辰', '戌', '丑', '未'].includes(branch);
    }
    /**
     * 判断是否为禄神
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为禄神
     */
    static isLuShen(stem, branch) {
        const map = {
            '甲': '寅',
            '乙': '卯',
            '丙': '巳',
            '丁': '午',
            '戊': '巳',
            '己': '午',
            '庚': '申',
            '辛': '酉',
            '壬': '亥',
            '癸': '子'
        };
        return map[stem] === branch;
    }
    /**
     * 判断是否为桃花
     * @param branch 地支
     * @returns 是否为桃花
     */
    static isTaoHua(branch) {
        return ['卯', '酉', '子', '午'].includes(branch);
    }
    /**
     * 判断是否为孤辰
     * @param branch 地支
     * @returns 是否为孤辰
     */
    static isGuChen(branch) {
        return ['辰', '戌', '丑', '未'].includes(branch);
    }
    /**
     * 判断是否为寡宿
     * @param branch 地支
     * @returns 是否为寡宿
     */
    static isGuaSu(branch) {
        return ['寅', '申', '巳', '亥'].includes(branch);
    }
    /**
     * 判断是否为驿马
     * @param branch 地支
     * @param yearBranch 年支（可选）
     * @returns 是否为驿马
     */
    static isYiMa(branch, yearBranch) {
        // 驿马的计算规则：
        // 寅午戌年马在申，申子辰年马在寅，巳酉丑年马在亥，亥卯未年马在巳
        // 如果提供了年支，则根据年支判断
        if (yearBranch) {
            const yiMaMap = {
                '寅': '申',
                '午': '申',
                '戌': '申',
                '申': '寅',
                '子': '寅',
                '辰': '寅',
                '巳': '亥',
                '酉': '亥',
                '丑': '亥',
                '亥': '巳',
                '卯': '巳',
                '未': '巳'
            };
            return yiMaMap[yearBranch] === branch;
        }
        // 如果没有提供年支，则简化处理，直接判断地支是否为驿马星
        return ['申', '寅', '巳', '亥'].includes(branch);
    }
    /**
     * 判断是否为将星
     * @param dayStem 日干
     * @param branch 地支
     * @returns 是否为将星
     */
    static isJiangXing(dayStem, branch) {
        var _a;
        // 将星与日干的对应关系
        const jiangXingMap = {
            '甲': ['巳'],
            '乙': ['午'],
            '丙': ['申'],
            '丁': ['酉'],
            '戊': ['申'],
            '己': ['酉'],
            '庚': ['亥'],
            '辛': ['子'],
            '壬': ['寅'],
            '癸': ['卯']
        };
        return ((_a = jiangXingMap[dayStem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为金神
     * @param branch 地支
     * @returns 是否为金神
     */
    static isJinShen(branch) {
        return ['申', '酉', '戌'].includes(branch);
    }
    /**
     * 判断是否为天德
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天德
     */
    static isTianDe(stem, branch) {
        // 天德与天干的对应关系
        const tianDeMap = {
            '甲': '丁',
            '乙': '申',
            '丙': '壬',
            '丁': '辛',
            '戊': '丙',
            '己': '乙',
            '庚': '戊',
            '辛': '己',
            '壬': '庚',
            '癸': '癸'
        };
        // 天德与地支的对应关系
        const tianDeBranchMap = {
            '丁': '午',
            '申': '申',
            '壬': '亥',
            '辛': '酉',
            '丙': '巳',
            '乙': '卯',
            '戊': '辰',
            '己': '丑',
            '庚': '申',
            '癸': '子'
        };
        const tianDeStem = tianDeMap[stem];
        const tianDeBranch = tianDeBranchMap[tianDeStem];
        return branch === tianDeBranch;
    }
    /**
     * 判断是否为天德合
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天德合
     */
    static isTianDeHe(stem, branch) {
        // 天德合与天干的对应关系
        const tianDeHeMap = {
            '甲': '己',
            '乙': '庚',
            '丙': '辛',
            '丁': '壬',
            '戊': '癸',
            '己': '甲',
            '庚': '乙',
            '辛': '丙',
            '壬': '丁',
            '癸': '戊'
        };
        // 天德合与地支的对应关系
        const tianDeHeBranchMap = {
            '己': '丑',
            '庚': '寅',
            '辛': '卯',
            '壬': '辰',
            '癸': '巳',
            '甲': '午',
            '乙': '未',
            '丙': '申',
            '丁': '酉',
            '戊': '戌'
        };
        const tianDeHeStem = tianDeHeMap[stem];
        const tianDeHeBranch = tianDeHeBranchMap[tianDeHeStem];
        return branch === tianDeHeBranch;
    }
    /**
     * 判断是否为月德
     * @param stem 天干
     * @returns 是否为月德
     */
    static isYueDe(stem) {
        // 月德与天干的对应关系
        const yueDeMap = {
            '甲': '丙',
            '乙': '甲',
            '丙': '壬',
            '丁': '庚',
            '戊': '戊',
            '己': '丙',
            '庚': '甲',
            '辛': '壬',
            '壬': '庚',
            '癸': '戊'
        };
        return Object.values(yueDeMap).includes(stem);
    }
    /**
     * 判断是否为天医
     * @param branch 地支
     * @returns 是否为天医
     */
    static isTianYi(branch) {
        // 天医与地支的对应关系
        const tianYiMap = {
            '子': '丑',
            '丑': '子',
            '寅': '亥',
            '卯': '戌',
            '辰': '酉',
            '巳': '申',
            '午': '未',
            '未': '午',
            '申': '巳',
            '酉': '辰',
            '戌': '卯',
            '亥': '寅'
        };
        return Object.values(tianYiMap).includes(branch);
    }
    /**
     * 判断是否为天喜
     * @param branch 地支
     * @param yearBranch 年支
     * @returns 是否为天喜
     */
    static isTianXi(branch, yearBranch) {
        // 天喜与年支的对应关系
        const tianXiMap = {
            '子': '酉',
            '丑': '申',
            '寅': '未',
            '卯': '午',
            '辰': '巳',
            '巳': '辰',
            '午': '卯',
            '未': '寅',
            '申': '丑',
            '酉': '子',
            '戌': '亥',
            '亥': '戌'
        };
        // 根据年支查找对应的天喜地支
        const tianXiBranch = tianXiMap[yearBranch];
        // 检查当前地支是否与天喜地支匹配
        return branch === tianXiBranch;
    }
    /**
     * 判断是否为红艳
     * @param branch 地支
     * @returns 是否为红艳
     */
    static isHongYan(branch) {
        return ['卯', '巳', '申', '戌'].includes(branch);
    }
    /**
     * 判断是否为天罗
     * @param branch 地支
     * @returns 是否为天罗
     */
    static isTianLuo(branch) {
        return branch === '戌';
    }
    /**
     * 判断是否为地网
     * @param branch 地支
     * @returns 是否为地网
     */
    static isDiWang(branch) {
        return branch === '未';
    }
    /**
     * 判断是否为羊刃
     * @param dayStem 日干
     * @param branch 地支
     * @returns 是否为羊刃
     */
    static isYangRen(dayStem, branch) {
        // 羊刃与日干的对应关系
        // 羊刃口诀：甲羊刃在卯，乙羊刃在寅。丙戊羊刃在午，丁己羊刃在巳。庚羊刃在酉，辛羊刃在申。壬羊刃在亥，癸羊刃在子。
        const yangRenMap = {
            '甲': '卯',
            '乙': '寅',
            '丙': '午',
            '丁': '巳',
            '戊': '午',
            '己': '巳',
            '庚': '酉',
            '辛': '申',
            '壬': '亥',
            '癸': '子'
        };
        return yangRenMap[dayStem] === branch;
    }
    /**
     * 判断是否为天空
     * @param branch 地支
     * @returns 是否为天空
     */
    static isTianKong(branch) {
        return branch === '戌';
    }
    /**
     * 判断是否为地劫
     * @param branch 地支
     * @returns 是否为地劫
     */
    static isDiJie(branch) {
        return branch === '辰';
    }
    /**
     * 判断是否为天刑
     * @param branch 地支
     * @returns 是否为天刑
     */
    static isTianXing(branch) {
        return branch === '巳';
    }
    /**
     * 判断是否为天哭
     * @param branch 地支
     * @returns 是否为天哭
     */
    static isTianKu(branch) {
        return branch === '未';
    }
    /**
     * 判断是否为天虚
     * @param branch 地支
     * @returns 是否为天虚
     */
    static isTianXu(branch) {
        return branch === '丑';
    }
    /**
     * 判断是否为咸池
     * @param branch 地支
     * @returns 是否为咸池
     */
    static isXianChi(branch) {
        return ['丑', '未', '辰', '戌'].includes(branch);
    }
    /**
     * 判断是否为亡神
     * @param branch 地支
     * @returns 是否为亡神
     */
    static isWangShen(branch) {
        return ['寅', '申'].includes(branch);
    }
    /**
     * 判断是否为劫煞
     * @param branch 地支
     * @returns 是否为劫煞
     */
    static isJieSha(branch) {
        return ['子', '午'].includes(branch);
    }
    /**
     * 判断是否为灾煞
     * @param branch 地支
     * @returns 是否为灾煞
     */
    static isZaiSha(branch) {
        return ['卯', '酉'].includes(branch);
    }
    /**
     * 判断是否为岁破
     * @param branch 地支
     * @param yearBranch 年支
     * @returns 是否为岁破
     */
    static isSuiPo(branch, yearBranch) {
        // 岁破与年支的对应关系
        const suiPoMap = {
            '子': '午',
            '午': '子',
            '卯': '酉',
            '酉': '卯',
            '辰': '戌',
            '戌': '辰',
            '丑': '未',
            '未': '丑',
            '寅': '申',
            '申': '寅',
            '巳': '亥',
            '亥': '巳'
        };
        return suiPoMap[yearBranch] === branch;
    }
    /**
     * 判断是否为大耗
     * @param branch 地支
     * @param yearBranch 年支
     * @returns 是否为大耗
     */
    static isDaHao(branch, yearBranch) {
        // 大耗与年支的对应关系
        const daHaoMap = {
            '子': '未',
            '丑': '申',
            '寅': '酉',
            '卯': '戌',
            '辰': '亥',
            '巳': '子',
            '午': '丑',
            '未': '寅',
            '申': '卯',
            '酉': '辰',
            '戌': '巳',
            '亥': '午'
        };
        return daHaoMap[yearBranch] === branch;
    }
    /**
     * 判断是否为五鬼
     * @param branch 地支
     * @returns 是否为五鬼
     */
    static isWuGui(branch) {
        return ['巳', '申', '亥', '寅'].includes(branch);
    }
    /**
     * 判断是否为童子煞
     * @param eightChar 八字对象
     * @param season 季节（春、夏、秋、冬）
     * @returns 是否为童子煞
     */
    static isTongZiSha(eightChar, season) {
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 获取纳音五行
        const yearNaYin = eightChar.getYearNaYin();
        const monthNaYin = eightChar.getMonthNaYin();
        const dayNaYin = eightChar.getDayNaYin();
        const timeNaYin = eightChar.getTimeNaYin();
        // 提取纳音五行属性（金木水火土）
        const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
        const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
        const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);
        // 童子煞判断口诀：
        // "春秋寅子贵，冬夏卯未辰；金木马卯合，水火鸡犬多；土命逢辰巳，童子定不错"
        // 1. 按季节和地支判断
        let seasonCheck = false;
        if ((season === '春' || season === '秋') && (dayBranch === '寅' || dayBranch === '子' || timeBranch === '寅' || timeBranch === '子')) {
            seasonCheck = true;
        }
        else if ((season === '冬' || season === '夏') && (dayBranch === '卯' || dayBranch === '未' || dayBranch === '辰' ||
            timeBranch === '卯' || timeBranch === '未' || timeBranch === '辰')) {
            seasonCheck = true;
        }
        // 2. 按纳音五行和地支判断
        let naYinCheck = false;
        if ((yearNaYinWuXing === '金' || yearNaYinWuXing === '木' || dayNaYinWuXing === '金' || dayNaYinWuXing === '木') &&
            (dayBranch === '午' || dayBranch === '卯' || timeBranch === '午' || timeBranch === '卯')) {
            naYinCheck = true;
        }
        else if ((yearNaYinWuXing === '水' || yearNaYinWuXing === '火' || dayNaYinWuXing === '水' || dayNaYinWuXing === '火') &&
            (dayBranch === '酉' || dayBranch === '戌' || timeBranch === '酉' || timeBranch === '戌')) {
            naYinCheck = true;
        }
        else if ((yearNaYinWuXing === '土' || dayNaYinWuXing === '土') &&
            (dayBranch === '辰' || dayBranch === '巳' || timeBranch === '辰' || timeBranch === '巳')) {
            naYinCheck = true;
        }
        // 3. 综合判断：季节条件或纳音条件满足其一即可
        return seasonCheck || naYinCheck;
    }
    /**
     * 判断是否为将军箭
     * @param eightChar 八字对象
     * @param season 季节（春、夏、秋、冬）
     * @returns 是否为将军箭
     */
    static isJiangJunJian(eightChar, season) {
        var _a;
        // 获取四柱干支
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const monthStem = eightChar.getMonthGan();
        const monthBranch = eightChar.getMonthZhi();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();
        const timeStem = eightChar.getTimeGan();
        const timeBranch = eightChar.getTimeZhi();
        // 获取纳音五行
        const yearNaYin = eightChar.getYearNaYin();
        const monthNaYin = eightChar.getMonthNaYin();
        const dayNaYin = eightChar.getDayNaYin();
        const timeNaYin = eightChar.getTimeNaYin();
        // 提取纳音五行属性（金木水火土）
        const yearNaYinWuXing = this.getNaYinWuXing(yearNaYin);
        const dayNaYinWuXing = this.getNaYinWuXing(dayNaYin);
        const timeNaYinWuXing = this.getNaYinWuXing(timeNaYin);
        // 将军箭判断口诀：
        // "春季酉戌辰，夏季未卯子，秋季寅申午，冬季巳亥丑"
        // 同时需要考虑八字中的冲克关系和纳音五行
        // 1. 按季节和时支判断
        let seasonCheck = false;
        const jiangJunJianMap = {
            '春': ['酉', '戌', '辰'],
            '夏': ['未', '卯', '子'],
            '秋': ['寅', '申', '午'],
            '冬': ['巳', '亥', '丑']
        };
        if ((_a = jiangJunJianMap[season]) === null || _a === void 0 ? void 0 : _a.includes(timeBranch)) {
            seasonCheck = true;
        }
        // 2. 检查八字中的冲克关系
        // 日支与时支相冲，或者日干与时干相克
        let chongKeCheck = false;
        if (this.isZhiChong(dayBranch, timeBranch) || this.isWuXingKe(this.getStemWuXing(dayStem), this.getStemWuXing(timeStem))) {
            chongKeCheck = true;
        }
        // 3. 检查纳音五行是否不调和
        // 时柱纳音与日柱纳音相克
        let naYinCheck = false;
        if (this.isWuXingKe(this.getNaYinWuXing(dayNaYin), this.getNaYinWuXing(timeNaYin)) ||
            this.isWuXingKe(this.getNaYinWuXing(timeNaYin), this.getNaYinWuXing(dayNaYin))) {
            naYinCheck = true;
        }
        // 4. 综合判断：季节条件必须满足，且冲克关系或纳音不调和其一满足
        return seasonCheck && (chongKeCheck || naYinCheck);
    }
    /**
     * 判断两地支是否相冲
     * @param zhi1 地支1
     * @param zhi2 地支2
     * @returns 是否相冲
     */
    static isZhiChong(zhi1, zhi2) {
        const chongPairs = [
            ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'],
            ['辰', '戌'], ['巳', '亥']
        ];
        for (const pair of chongPairs) {
            if ((zhi1 === pair[0] && zhi2 === pair[1]) || (zhi1 === pair[1] && zhi2 === pair[0])) {
                return true;
            }
        }
        return false;
    }
    /**
     * 判断是否为天德贵人
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天德贵人
     */
    static isTianDeGuiRen(stem, branch) {
        var _a;
        // 天德贵人与天干的对应关系
        const tianDeGuiRenMap = {
            '甲': ['丑', '未'],
            '乙': ['子', '申'],
            '丙': ['亥', '酉'],
            '丁': ['亥', '酉'],
            '戊': ['丑', '未'],
            '己': ['子', '申'],
            '庚': ['亥', '酉'],
            '辛': ['亥', '酉'],
            '壬': ['丑', '未'],
            '癸': ['子', '申']
        };
        return ((_a = tianDeGuiRenMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为月德贵人
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为月德贵人
     */
    static isYueDeGuiRen(stem, branch) {
        var _a;
        // 月德贵人与天干的对应关系
        const yueDeGuiRenMap = {
            '甲': ['卯'],
            '乙': ['寅'],
            '丙': ['巳'],
            '丁': ['午'],
            '戊': ['巳'],
            '己': ['午'],
            '庚': ['申'],
            '辛': ['酉'],
            '壬': ['亥'],
            '癸': ['子']
        };
        return ((_a = yueDeGuiRenMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天赦
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天赦
     */
    static isTianShe(stem, branch) {
        var _a;
        // 天赦与天干地支的对应关系
        const tianSheMap = {
            '甲': ['戌'],
            '乙': ['酉'],
            '丙': ['申'],
            '丁': ['未'],
            '戊': ['午'],
            '己': ['巳'],
            '庚': ['辰'],
            '辛': ['卯'],
            '壬': ['寅'],
            '癸': ['丑']
        };
        return ((_a = tianSheMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天恩
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天恩
     */
    static isTianEn(stem, branch) {
        var _a;
        // 天恩与天干地支的对应关系
        const tianEnMap = {
            '甲': ['申'],
            '乙': ['酉'],
            '丙': ['戌'],
            '丁': ['亥'],
            '戊': ['子'],
            '己': ['丑'],
            '庚': ['寅'],
            '辛': ['卯'],
            '壬': ['辰'],
            '癸': ['巳']
        };
        return ((_a = tianEnMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天官
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天官
     */
    static isTianGuan(stem, branch) {
        var _a;
        // 天官与天干地支的对应关系
        const tianGuanMap = {
            '甲': ['未'],
            '乙': ['申'],
            '丙': ['酉'],
            '丁': ['戌'],
            '戊': ['亥'],
            '己': ['子'],
            '庚': ['丑'],
            '辛': ['寅'],
            '壬': ['卯'],
            '癸': ['辰']
        };
        return ((_a = tianGuanMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天福
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天福
     */
    static isTianFu(stem, branch) {
        var _a;
        // 天福与天干地支的对应关系
        const tianFuMap = {
            '甲': ['酉'],
            '乙': ['申'],
            '丙': ['未'],
            '丁': ['午'],
            '戊': ['巳'],
            '己': ['辰'],
            '庚': ['卯'],
            '辛': ['寅'],
            '壬': ['丑'],
            '癸': ['子']
        };
        return ((_a = tianFuMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天厨
     * @param stem 天干
     * @param branch 地支
     * @returns 是否为天厨
     */
    static isTianChu(stem, branch) {
        var _a;
        // 天厨与天干地支的对应关系
        const tianChuMap = {
            '甲': ['巳'],
            '乙': ['午'],
            '丙': ['未'],
            '丁': ['申'],
            '戊': ['酉'],
            '己': ['戌'],
            '庚': ['亥'],
            '辛': ['子'],
            '壬': ['丑'],
            '癸': ['寅']
        };
        return ((_a = tianChuMap[stem]) === null || _a === void 0 ? void 0 : _a.includes(branch)) || false;
    }
    /**
     * 判断是否为天巫
     * @param branch 地支
     * @returns 是否为天巫
     */
    static isTianWu(branch) {
        return ['巳', '亥'].includes(branch);
    }
    /**
     * 判断是否为天月
     * @param branch 地支
     * @returns 是否为天月
     */
    static isTianYue(branch) {
        return ['未', '丑'].includes(branch);
    }
    /**
     * 判断是否为天马
     * @param branch 地支
     * @param yearBranch 年支
     * @returns 是否为天马
     */
    static isTianMa(branch, yearBranch) {
        // 天马与年支的对应关系
        // 寅午戌年马在申，申子辰年马在寅，巳酉丑年马在亥，亥卯未年马在巳
        const tianMaMap = {
            '寅': '申',
            '午': '申',
            '戌': '申',
            '申': '寅',
            '子': '寅',
            '辰': '寅',
            '巳': '亥',
            '酉': '亥',
            '丑': '亥',
            '亥': '巳',
            '卯': '巳',
            '未': '巳'
        };
        return tianMaMap[yearBranch] === branch;
    }
    /**
     * 获取地势（长生十二神）
     * @param dayStem 日干
     * @param branch 地支
     * @returns 地势
     */
    static getDiShi(dayStem, branch) {
        // 阳干：甲丙戊庚壬
        // 阴干：乙丁己辛癸
        const yangGan = '甲丙戊庚壬';
        const isDayYang = yangGan.includes(dayStem);
        // 长生十二神表
        const diShiMap = {
            '甲': {
                '亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官', '卯': '帝旺',
                '辰': '衰', '巳': '病', '午': '死', '未': '墓', '申': '绝',
                '酉': '胎', '戌': '养'
            },
            '丙戊': {
                '寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺',
                '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝',
                '子': '胎', '丑': '养'
            },
            '庚': {
                '巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官', '酉': '帝旺',
                '戌': '衰', '亥': '病', '子': '死', '丑': '墓', '寅': '绝',
                '卯': '胎', '辰': '养'
            },
            '壬': {
                '申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官', '子': '帝旺',
                '丑': '衰', '寅': '病', '卯': '死', '辰': '墓', '巳': '绝',
                '午': '胎', '未': '养'
            },
            '乙': {
                '午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官', '寅': '帝旺',
                '丑': '衰', '子': '病', '亥': '死', '戌': '墓', '酉': '绝',
                '申': '胎', '未': '养'
            },
            '丁己': {
                '酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺',
                '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝',
                '亥': '胎', '戌': '养'
            },
            '辛': {
                '子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官', '申': '帝旺',
                '未': '衰', '午': '病', '巳': '死', '辰': '墓', '卯': '绝',
                '寅': '胎', '丑': '养'
            },
            '癸': {
                '卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官', '亥': '帝旺',
                '戌': '衰', '酉': '病', '申': '死', '未': '墓', '午': '绝',
                '巳': '胎', '辰': '养'
            }
        };
        // 根据日干查找对应的地势表
        let diShiTable;
        if (dayStem === '甲') {
            diShiTable = diShiMap['甲'];
        }
        else if (dayStem === '乙') {
            diShiTable = diShiMap['乙'];
        }
        else if (dayStem === '丙' || dayStem === '戊') {
            diShiTable = diShiMap['丙戊'];
        }
        else if (dayStem === '丁' || dayStem === '己') {
            diShiTable = diShiMap['丁己'];
        }
        else if (dayStem === '庚') {
            diShiTable = diShiMap['庚'];
        }
        else if (dayStem === '辛') {
            diShiTable = diShiMap['辛'];
        }
        else if (dayStem === '壬') {
            diShiTable = diShiMap['壬'];
        }
        else if (dayStem === '癸') {
            diShiTable = diShiMap['癸'];
        }
        // 如果找到对应的地势表，返回地势
        if (diShiTable && diShiTable[branch]) {
            return diShiTable[branch];
        }
        return '未知';
    }
    /**
     * 计算八字格局（改进版）
     * @param eightChar 八字对象
     * @returns 格局信息
     */
    static calculateGeJu(eightChar) {
        // 获取格局详细信息
        const geJuInfo = this.calculateGeJuImproved(eightChar);
        // 返回完整的格局信息
        return {
            geJu: geJuInfo.geJu,
            detail: geJuInfo.detail,
            geJuStrength: geJuInfo.geJuStrength,
            yongShen: geJuInfo.yongShen,
            yongShenDetail: geJuInfo.yongShenDetail,
            geJuFactors: geJuInfo.geJuFactors
        };
    }
    /**
     * 计算八字格局（改进版）
     * @param eightChar 八字对象
     * @returns 格局信息
     */
    static calculateGeJuImproved(eightChar) {
        // 1. 获取日主旺衰
        const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
        const riZhuStrength = riZhuStrengthInfo.result;
        // 2. 获取四柱天干和地支
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const dayStem = eightChar.getDayGan();
        const timeStem = eightChar.getTimeGan();
        const yearBranch = eightChar.getYearZhi();
        const monthBranch = eightChar.getMonthZhi();
        const dayBranch = eightChar.getDayZhi();
        const timeBranch = eightChar.getTimeZhi();
        // 使用格局判断服务
        // 创建BaziInfo对象
        const baziInfo = {
            // 基本信息
            dayStem,
            dayBranch,
            dayWuXing: this.getStemWuXing(dayStem),
            riZhuStrength,
            // 年柱信息
            yearStem,
            yearBranch,
            yearWuXing: this.getStemWuXing(yearStem),
            yearShiShenGan: this.getShiShen(dayStem, yearStem),
            yearShiShenZhi: this.getHiddenShiShen(dayStem, yearBranch),
            yearNaYin: this.getNaYin(yearStem + yearBranch),
            // 月柱信息
            monthStem,
            monthBranch,
            monthWuXing: this.getStemWuXing(monthStem),
            monthShiShenGan: this.getShiShen(dayStem, monthStem),
            monthShiShenZhi: this.getHiddenShiShen(dayStem, monthBranch),
            monthNaYin: this.getNaYin(monthStem + monthBranch),
            // 日柱信息
            dayNaYin: this.getNaYin(dayStem + dayBranch),
            dayShiShenZhi: this.getHiddenShiShen(dayStem, dayBranch),
            // 时柱信息
            hourStem: timeStem,
            hourBranch: timeBranch,
            hourWuXing: this.getStemWuXing(timeStem),
            timeShiShenGan: this.getShiShen(dayStem, timeStem),
            hourShiShenZhi: this.getHiddenShiShen(dayStem, timeBranch),
            hourNaYin: this.getNaYin(timeStem + timeBranch)
        };
        // 使用格局判断服务
        const geJuResult = GeJuJudgeService.judgeGeJu(baziInfo);
        // 返回格局信息
        return {
            geJu: geJuResult.mainGeJu,
            detail: geJuResult.mainGeJuDetail,
            geJuStrength: geJuResult.mainGeJuStrength,
            yongShen: geJuResult.yongShen,
            yongShenDetail: geJuResult.yongShenDetail,
            geJuFactors: geJuResult.factors
        };
    }
    /**
     * 获取地支对应的五行
     * @param branch 地支
     * @returns 五行
     */
    static getBranchWuXing(branch) {
        const map = {
            '子': '水',
            '丑': '土',
            '寅': '木',
            '卯': '木',
            '辰': '土',
            '巳': '火',
            '午': '火',
            '未': '土',
            '申': '金',
            '酉': '金',
            '戌': '土',
            '亥': '水'
        };
        return map[branch] || '未知';
    }
    /**
     * 判断五行是否相生
     * @param from 源五行
     * @param to 目标五行
     * @returns 是否相生
     */
    static isWuXingSheng(from, to) {
        // 五行相生：木生火，火生土，土生金，金生水，水生木
        return (from.includes('木') && to.includes('火')) ||
            (from.includes('火') && to.includes('土')) ||
            (from.includes('土') && to.includes('金')) ||
            (from.includes('金') && to.includes('水')) ||
            (from.includes('水') && to.includes('木'));
    }
    /**
     * 判断五行是否相克
     * @param from 源五行
     * @param to 目标五行
     * @returns 是否相克
     */
    static isWuXingKe(from, to) {
        // 五行相克：木克土，土克水，水克火，火克金，金克木
        return (from.includes('木') && to.includes('土')) ||
            (from.includes('土') && to.includes('水')) ||
            (from.includes('水') && to.includes('火')) ||
            (from.includes('火') && to.includes('金')) ||
            (from.includes('金') && to.includes('木'));
    }
    /**
     * 计算起运时间
     * @param solar 阳历对象
     * @param gender 性别（1-男，0-女）
     * @returns 起运信息
     */
    static calculateQiYun(solar, gender) {
        // 这里简化处理，实际应该根据八字命理规则计算
        // 简单示例：男命3岁起运，女命4岁起运
        const qiYunAge = gender === '1' ? 3 : 4;
        // 计算起运年份
        const birthYear = solar.getYear();
        const qiYunYear = birthYear + qiYunAge;
        // 格式化起运日期
        const qiYunDate = `${qiYunYear}-${solar.getMonth().toString().padStart(2, '0')}-${solar.getDay().toString().padStart(2, '0')}`;
        return {
            date: qiYunDate,
            age: qiYunAge
        };
    }
    /**
     * 生成交互式八字命盘的HTML
     * @param baziInfo 八字信息对象
     * @param id 命盘ID
     * @returns HTML字符串
     */
    static generateBaziHTML(baziInfo, id = 'bazi-view-' + Math.random().toString(36).substring(2, 9)) {
        return `<div id="${id}" class="bazi-view-container">
  <div class="bazi-view-header">
    <h3 class="bazi-view-title">八字命盘</h3>
    <button class="bazi-view-settings-button" data-bazi-id="${id}" aria-label="设置">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    </button>
  </div>

  <div class="bazi-view-section bazi-view-basic-info">
    <div class="bazi-view-col">
      <div class="bazi-view-info-item">公历：${baziInfo.solarDate || '----'} ${baziInfo.solarTime || '--:--'}</div>
    </div>
    <div class="bazi-view-col">
      <div class="bazi-view-info-item">农历：${baziInfo.lunarDate || '----'}</div>
    </div>
  </div>

  <div class="bazi-view-section">
    <table class="bazi-view-table">
      <thead>
        <tr>
          <th>年柱</th>
          <th>月柱</th>
          <th>日柱</th>
          <th>时柱</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bazi-stem-row">
          <td class="wuxing-${this.getWuXingClass(baziInfo.yearWuXing || '')}">${baziInfo.yearStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.monthWuXing || '')}">${baziInfo.monthStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.dayWuXing || '')}">${baziInfo.dayStem || ''}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.hourWuXing || '')}">${baziInfo.hourStem || ''}</td>
        </tr>
        <tr class="bazi-branch-row">
          <td>${baziInfo.yearBranch}</td>
          <td>${baziInfo.monthBranch}</td>
          <td>${baziInfo.dayBranch}</td>
          <td>${baziInfo.hourBranch}</td>
        </tr>
        <tr class="bazi-hidegan-row">
          <td><small>${baziInfo.yearHideGan || '无'}</small></td>
          <td><small>${baziInfo.monthHideGan || '无'}</small></td>
          <td><small>${baziInfo.dayHideGan || '无'}</small></td>
          <td><small>${baziInfo.hourHideGan || '无'}</small></td>
        </tr>
        <tr class="bazi-shishen-row">
          <td><small>${baziInfo.yearShiShenGan || ''}</small></td>
          <td><small>${baziInfo.monthShiShenGan || ''}</small></td>
          <td><small>日主</small></td>
          <td><small>${baziInfo.timeShiShenGan || ''}</small></td>
        </tr>
        <tr class="bazi-nayin-row">
          <td>${baziInfo.yearNaYin || '未知'}</td>
          <td>${baziInfo.monthNaYin || '未知'}</td>
          <td>${baziInfo.dayNaYin || '未知'}</td>
          <td>${baziInfo.hourNaYin || '未知'}</td>
        </tr>
        <tr class="bazi-xunkong-row">
          <td><small>${baziInfo.yearXunKong || '无'}</small></td>
          <td><small>${baziInfo.monthXunKong || '无'}</small></td>
          <td><small>${baziInfo.dayXunKong || '无'}</small></td>
          <td><small>${baziInfo.timeXunKong || '无'}</small></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">五行分析</h4>
    <div class="bazi-view-wuxing-list">
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.yearWuXing || '')}">${baziInfo.yearStem || ''}(${baziInfo.yearWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.monthWuXing || '')}">${baziInfo.monthStem || ''}(${baziInfo.monthWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.dayWuXing || '')}">${baziInfo.dayStem || ''}(${baziInfo.dayWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.hourWuXing || '')}">${baziInfo.hourStem || ''}(${baziInfo.hourWuXing || '未知'})</span>
    </div>

    ${baziInfo.wuXingStrength ? `
    <div class="bazi-view-wuxing-strength">
      <div class="bazi-view-wuxing-header" data-bazi-id="${id}">
        <span class="bazi-view-wuxing-title">五行强度:</span>
        <div class="bazi-view-wuxing-bars">
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-jin wuxing-clickable" data-wuxing="金" data-value="${baziInfo.wuXingStrength.jin.toFixed(1)}" data-bazi-id="${id}">金: ${baziInfo.wuXingStrength.jin.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-jin" style="width: ${Math.min(baziInfo.wuXingStrength.jin * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-mu wuxing-clickable" data-wuxing="木" data-value="${baziInfo.wuXingStrength.mu.toFixed(1)}" data-bazi-id="${id}">木: ${baziInfo.wuXingStrength.mu.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-mu" style="width: ${Math.min(baziInfo.wuXingStrength.mu * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-shui wuxing-clickable" data-wuxing="水" data-value="${baziInfo.wuXingStrength.shui.toFixed(1)}" data-bazi-id="${id}">水: ${baziInfo.wuXingStrength.shui.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-shui" style="width: ${Math.min(baziInfo.wuXingStrength.shui * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-huo wuxing-clickable" data-wuxing="火" data-value="${baziInfo.wuXingStrength.huo.toFixed(1)}" data-bazi-id="${id}">火: ${baziInfo.wuXingStrength.huo.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-huo" style="width: ${Math.min(baziInfo.wuXingStrength.huo * 10, 100)}%"></div>
          </div>
          <div class="wuxing-bar">
            <span class="wuxing-tag wuxing-tu wuxing-clickable" data-wuxing="土" data-value="${baziInfo.wuXingStrength.tu.toFixed(1)}" data-bazi-id="${id}">土: ${baziInfo.wuXingStrength.tu.toFixed(1)}</span>
            <div class="wuxing-bar-inner wuxing-tu" style="width: ${Math.min(baziInfo.wuXingStrength.tu * 10, 100)}%"></div>
          </div>
        </div>
        <span class="bazi-view-wuxing-toggle" data-bazi-id="${id}">查看详情 ▼</span>
      </div>

      <div class="bazi-view-wuxing-details" id="wuxing-details-${id}" style="display: none;">
        <table class="bazi-view-wuxing-table">
          <tr>
            <th colspan="2">五行强度计算说明</th>
          </tr>
          <tr>
            <td colspan="2">五行强度是根据以下因素综合计算的：</td>
          </tr>
          <tr>
            <td>天干五行</td>
            <td>年干(1.0)、月干(2.0)、日干(3.0)、时干(1.0)</td>
          </tr>
          <tr>
            <td>地支藏干</td>
            <td>年支(0.7)、月支(1.5)、日支(2.0)、时支(0.7)</td>
          </tr>
          <tr>
            <td>纳音五行</td>
            <td>年柱(0.5)、月柱(1.0)、日柱(1.5)、时柱(0.5)</td>
          </tr>
          <tr>
            <td>季节调整</td>
            <td>
              春季：木旺(+1.0)、火相(+0.5)<br>
              夏季：火旺(+1.0)、土相(+0.5)<br>
              秋季：金旺(+1.0)、水相(+0.5)<br>
              冬季：水旺(+1.0)、木相(+0.5)
            </td>
          </tr>
          <tr>
            <td>组合调整</td>
            <td>
              天干五合：甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火(+0.5)<br>
              地支三合：寅午戌合火、亥卯未合木、申子辰合水、巳酉丑合金(+1.0)
            </td>
          </tr>
        </table>
      </div>
    </div>
    ` : ''}

    ${baziInfo.riZhuStrength ? `
    <div class="bazi-view-rizhu-strength">
      <div class="bazi-view-rizhu-header" data-bazi-id="${id}">
        <span class="bazi-view-rizhu-title">日主旺衰: <span class="shensha-tag rizhu-clickable" data-rizhu="${baziInfo.riZhuStrength}" data-wuxing="${baziInfo.dayWuXing}" data-bazi-id="${id}" style="cursor: pointer;">${baziInfo.riZhuStrength}</span></span>
      </div>
    </div>
    ` : ''}
  </div>

  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">特殊信息</h4>
    <div class="bazi-view-info-list">
      <div class="bazi-view-info-item">胎元：${baziInfo.taiYuan || '未知'}${baziInfo.taiYuanNaYin ? `（${baziInfo.taiYuanNaYin}）` : ''}</div>
      <div class="bazi-view-info-item">命宫：${baziInfo.mingGong || '未知'}${baziInfo.mingGongNaYin ? `（${baziInfo.mingGongNaYin}）` : ''}</div>
      ${baziInfo.shenGong ? `<div class="bazi-view-info-item">身宫：${baziInfo.shenGong}</div>` : ''}
    </div>
  </div>

  ${baziInfo.qiYunYear || baziInfo.qiYunDate ? `
  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">起运信息</h4>
    <div class="bazi-view-info-list">
      ${baziInfo.qiYunYear ? `<div class="bazi-view-info-item">起运时间：出生${baziInfo.qiYunYear}年${baziInfo.qiYunMonth || 0}个月${baziInfo.qiYunDay || 0}天${baziInfo.qiYunHour && baziInfo.qiYunHour > 0 ? baziInfo.qiYunHour + '小时' : ''}后</div>` : ''}
      ${baziInfo.qiYunDate ? `<div class="bazi-view-info-item">起运日期：${baziInfo.qiYunDate}</div>` : ''}
      ${baziInfo.qiYunAge ? `<div class="bazi-view-info-item">起运年龄：${baziInfo.qiYunAge}岁</div>` : ''}
    </div>
  </div>
  ` : ''}

  ${baziInfo.daYun && baziInfo.daYun.length > 0 ? `
  <div class="bazi-view-section">
    <h4 class="bazi-view-subtitle">大运信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-dayun-table">
        <tr>
          <th>大运</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startYear}</td>`).join('') : ''}
        </tr>
        <tr>
          <th>年龄</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startAge}</td>`).join('') : ''}
        </tr>
        <tr>
          <th>干支</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map((dy, index) => `
            <td class="bazi-dayun-cell" data-index="${index}">${dy.ganZhi}</td>
          `).join('') : ''}
        </tr>
        <tr>
          <th>神煞</th>
          ${Array.isArray(baziInfo.daYun) ? baziInfo.daYun.slice(0, 10).map((dy, index) => {
            // 调试信息
            console.log(`大运数据: 索引${index}, 神煞:`, dy.shenSha);
            return `
            <td>
              ${dy.shenSha && dy.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${dy.shenSha.map(shenSha => {
                // 调试信息
                console.log(`大运神煞HTML生成: ${shenSha}`);
                const type = BaziService.getShenShaType(shenSha) || '未知';
                let cssClass = '';
                if (type === '吉神') {
                    cssClass = 'shensha-good';
                }
                else if (type === '凶神') {
                    cssClass = 'shensha-bad';
                }
                else if (type === '吉凶神') {
                    cssClass = 'shensha-mixed';
                }
                return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
            }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
        }).join('') : ''}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.liuNian && baziInfo.liuNian.length > 0 ? `
  <div class="bazi-view-section bazi-liunian-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">流年信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-liunian-table">
        <tr>
          <th>流年</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `<td>${ln.year}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `<td>${ln.age}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => `
            <td class="bazi-liunian-cell" data-year="${ln.year}">${ln.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.liuNian.slice(0, 10).map(ln => {
            // 调试信息
            console.log(`流年数据: ${ln.year}, 神煞:`, ln.shenSha);
            return `
            <td>
              ${ln.shenSha && ln.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${ln.shenSha.map(shenSha => {
                // 调试信息
                console.log(`流年神煞HTML生成: ${shenSha}`);
                const type = BaziService.getShenShaType(shenSha) || '未知';
                let cssClass = '';
                if (type === '吉神') {
                    cssClass = 'shensha-good';
                }
                else if (type === '凶神') {
                    cssClass = 'shensha-bad';
                }
                else if (type === '吉凶神') {
                    cssClass = 'shensha-mixed';
                }
                return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
            }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
        }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.xiaoYun && baziInfo.xiaoYun.length > 0 ? `
  <div class="bazi-view-section bazi-xiaoyun-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">小运信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-xiaoyun-table">
        <tr>
          <th>小运</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `<td>${xy.year}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `<td>${xy.age}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => `
            <td class="bazi-xiaoyun-cell" data-year="${xy.year}">${xy.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.xiaoYun.slice(0, 10).map(xy => {
            // 调试信息
            console.log(`小运数据: ${xy.year}, 神煞:`, xy.shenSha);
            return `
            <td>
              ${xy.shenSha && xy.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${xy.shenSha.map(shenSha => {
                // 调试信息
                console.log(`小运神煞HTML生成: ${shenSha}`);
                const type = BaziService.getShenShaType(shenSha) || '未知';
                let cssClass = '';
                if (type === '吉神') {
                    cssClass = 'shensha-good';
                }
                else if (type === '凶神') {
                    cssClass = 'shensha-bad';
                }
                else if (type === '吉凶神') {
                    cssClass = 'shensha-mixed';
                }
                return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
            }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
        }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  ${baziInfo.liuYue && baziInfo.liuYue.length > 0 ? `
  <div class="bazi-view-section bazi-liuyue-section" data-bazi-id="${id}">
    <h4 class="bazi-view-subtitle">流月信息</h4>
    <div class="bazi-view-table-container">
      <table class="bazi-view-table bazi-view-liuyue-table">
        <tr>
          <th>流月</th>
          ${baziInfo.liuYue.map(ly => `<td>${ly.month}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.liuYue.map(ly => `
            <td class="bazi-liuyue-cell" data-month="${ly.month}">${ly.ganZhi}</td>
          `).join('')}
        </tr>
        <tr>
          <th>神煞</th>
          ${baziInfo.liuYue.map(ly => {
            // 调试信息
            console.log(`流月数据: ${ly.month}, 神煞:`, ly.shenSha);
            return `
            <td>
              ${ly.shenSha && ly.shenSha.length > 0 ? `
                <div class="bazi-shensha-list">
                  ${ly.shenSha.map(shenSha => {
                // 调试信息
                console.log(`流月神煞HTML生成: ${shenSha}`);
                const type = BaziService.getShenShaType(shenSha) || '未知';
                let cssClass = '';
                if (type === '吉神') {
                    cssClass = 'shensha-good';
                }
                else if (type === '凶神') {
                    cssClass = 'shensha-bad';
                }
                else if (type === '吉凶神') {
                    cssClass = 'shensha-mixed';
                }
                return `<span class="bazi-shensha ${cssClass}" data-shensha="${shenSha}" style="display:inline-block; padding:2px 4px; margin:2px; border-radius:3px; font-size:0.8em; cursor:pointer;">${shenSha}</span>`;
            }).join('')}
                </div>
              ` : '无神煞'}
            </td>
            `;
        }).join('')}
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  <div class="bazi-view-section" style="display: none;">
    <div class="bazi-view-data"
      data-year="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[0] : '2023'}"
      data-month="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[1] : '1'}"
      data-day="${baziInfo.solarDate && baziInfo.solarDate.includes('-') ? baziInfo.solarDate.split('-')[2] : '1'}"
      data-hour="${baziInfo.solarTime && baziInfo.solarTime.includes(':') ? baziInfo.solarTime.split(':')[0] : '0'}"
      data-all-dayun='${JSON.stringify(baziInfo.daYun || [])}'
      data-all-liunian='${JSON.stringify(baziInfo.liuNian || [])}'
      data-all-xiaoyun='${JSON.stringify(baziInfo.xiaoYun || [])}'
      data-all-liuyue='${JSON.stringify(baziInfo.liuYue || [])}'>
    </div>
  </div>
</div>`;
    }
    /**
     * 获取五行对应的CSS类名
     * @param wuxing 五行名称
     * @returns CSS类名
     */
    static getWuXingClass(wuxing) {
        // 如果wuxing未定义，返回空字符串
        if (!wuxing) {
            return '';
        }
        const map = {
            '金': 'jin',
            '木': 'mu',
            '水': 'shui',
            '火': 'huo',
            '土': 'tu'
        };
        for (const key in map) {
            if (wuxing.includes(key)) {
                return map[key];
            }
        }
        return '';
    }
    /**
     * 获取神煞类型（吉神、凶神、吉凶神）
     * @param shenSha 神煞名称
     * @returns 神煞类型
     */
    static getShenShaType(shenSha) {
        // 吉神列表
        const goodShenSha = [
            '天乙贵人', '文昌', '文曲', '天德', '月德', '天福', '天官', '天厨',
            '天巫', '天月', '天喜', '天赦', '天恩', '驿马', '禄神', '国印',
            '天医', '天贵', '天才', '天寿', '天馨', '天钺', '天亨', '天解',
            '天报', '天庆', '天祥', '天佑', '天富', '天爵', '天德合', '月德合'
        ];
        // 凶神列表
        const badShenSha = [
            '天刑', '天哭', '天虚', '咸池', '亡神', '劫煞', '灾煞', '五鬼',
            '天罗', '地网', '地丁', '阴差', '魁罡', '孤辰', '寡宿', '白虎',
            '天狗', '天狱', '天棒', '天姚', '天牢', '天祸', '天煞', '天吏',
            '天奸', '天讼', '羊刃', '金神'
        ];
        // 吉凶神列表（根据不同情况可能吉可能凶）
        const mixedShenSha = [
            '将星', '华盖', '桃花', '三台', '八座', '恩光', '天贵', '台辅',
            '封诰', '天使', '天伤', '天空', '截路', '旬空', '三奇', '六仪',
            '三合', '六合', '暗合', '拱合', '三会', '三刑', '六冲', '暗冲',
            '童子煞', '将军箭', '红艳'
        ];
        // 去除可能的前缀（如"年柱:"）
        const pureShenSha = shenSha.includes(':') ? shenSha.split(':')[1] : shenSha;
        // 调试信息
        console.log(`判断神煞类型: ${shenSha} -> ${pureShenSha}`);
        if (goodShenSha.includes(pureShenSha)) {
            return '吉神';
        }
        else if (badShenSha.includes(pureShenSha)) {
            return '凶神';
        }
        else if (mixedShenSha.includes(pureShenSha)) {
            return '吉凶神';
        }
        return '未知';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBYSxNQUFNLGtCQUFrQixDQUFDO0FBQzNELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR3REOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFDdEI7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsT0FBZSxDQUFDLEVBQUUsU0FBaUIsR0FBRyxFQUFFLE9BQWUsR0FBRztRQUN6SCxTQUFTO1FBQ1QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELFFBQVE7UUFDUixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsT0FBTztRQUNQLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxPQUFlLENBQUMsRUFBRSxjQUF1QixLQUFLLEVBQUUsU0FBaUIsR0FBRyxFQUFFLE9BQWUsR0FBRztRQUM1SixTQUFTO1FBQ1QsMkNBQTJDO1FBQzNDLGVBQWU7UUFDZixJQUFJLEtBQUssQ0FBQztRQUNWLElBQUksV0FBVyxFQUFFO1lBQ2Ysa0JBQWtCO1lBQ2xCLHlCQUF5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RSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztTQUN6QixDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFHRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBWSxFQUFFLEtBQVksRUFBRSxTQUFvQixFQUFFLFNBQWlCLEdBQUcsRUFBRSxPQUFlLEdBQUc7UUFDdEgsU0FBUztRQUNULFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEMsdUJBQXVCO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV0QyxLQUFLO1FBQ0wsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFVBQVUsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ3pDLHNDQUFzQztRQUN0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFM0Msa0JBQWtCO1FBQ2xCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJO1lBQ0YsYUFBYTtZQUNiLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxXQUFXLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQzFDO1NBQ0Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsS0FBSztRQUNMLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUM1QyxzQ0FBc0M7UUFDdEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDcEUsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRTdDLGtCQUFrQjtRQUNsQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSTtZQUNGLGFBQWE7WUFDYixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osWUFBWSxHQUFHLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUM1QztTQUNGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELEtBQUs7UUFDTCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUN0QyxzQ0FBc0M7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEUsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXpDLGtCQUFrQjtRQUNsQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSTtZQUNGLGFBQWE7WUFDYixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN4QztTQUNGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELEtBQUs7UUFDTCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sVUFBVSxHQUFHLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDekMsc0NBQXNDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUzQyxrQkFBa0I7UUFDbEIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUk7WUFDRixhQUFhO1lBQ2IsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZDLElBQUksT0FBTyxFQUFFO2dCQUNYLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDMUM7WUFFRCxvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDM0Q7U0FDRjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsVUFBVTtZQUNWLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzNEO1FBRUQsT0FBTztRQUNQLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2QyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDakQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV6QyxPQUFPO1FBQ1AsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUU1RCxPQUFPO1FBQ1AsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVwRCxlQUFlO1FBQ2YsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO1FBQ25DLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQztRQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxZQUFZO1FBQ3JDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztRQUVuQyxLQUFLO1FBQ0wsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFaEUsS0FBSztRQUNMLE1BQU0sS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0UsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUV2RixLQUFLO1FBQ0wsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNyQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO1FBRXJDLEtBQUs7UUFDTCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6RSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RCxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQzlDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDaEQsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBRTlDLEtBQUs7UUFDTCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsTUFBTSxJQUFJLEdBQUcsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLElBQUksQ0FBQztRQUM1QixNQUFNLFVBQVUsR0FBRyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsTUFBTSxDQUFDO1FBQ3BDLE1BQU0sWUFBWSxHQUFHLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxZQUFZLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLFFBQVEsQ0FBQztRQUNwQyxNQUFNLGNBQWMsR0FBRyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsY0FBYyxDQUFDO1FBQ2hELE1BQU0sV0FBVyxHQUFHLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxXQUFXLENBQUM7UUFFMUMsT0FBTztRQUNQLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckMsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLGdCQUFnQjtRQUU1QyxPQUFPO1FBQ1AsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDOUIsa0JBQWtCO1lBQ2xCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJO2dCQUNGLFdBQVc7Z0JBQ1gsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDakMsK0JBQStCO29CQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDM0M7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsa0JBQWtCO1lBQ2xCLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDakYsSUFBSTtnQkFBRSxTQUFTLEdBQUcsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ3BGLElBQUk7Z0JBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUNoRixJQUFJO2dCQUFFLFFBQVEsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDbkYsSUFBSTtnQkFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQy9FLElBQUk7Z0JBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUMzRSxJQUFJO2dCQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFFN0UsT0FBTztZQUNQLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6RDthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO1lBQ1AsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQzthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO1lBQ1AsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzdCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWhDLE9BQU87b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLE9BQU8sU0FBUyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUU1RCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTTtvQkFDTixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNyQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Y7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEtBQUssVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXRELE9BQU87Z0JBQ0wsU0FBUztnQkFDVCxPQUFPO2dCQUNQLFFBQVE7Z0JBQ1IsTUFBTTtnQkFDTixLQUFLO2dCQUNMLE1BQU07Z0JBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUMsT0FBTztnQkFDUCxVQUFVO2dCQUNWLEtBQUs7Z0JBQ0wsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxlQUFlO2FBQ3RDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNsQyxrQkFBa0I7WUFDbEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUk7Z0JBQ0YsV0FBVztnQkFDWCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNqQywrQkFBK0I7b0JBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQzlDLElBQUk7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUN6RSxJQUFJO2dCQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDdkUsSUFBSTtnQkFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQzNFLElBQUk7Z0JBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUU3RSxPQUFPO1lBQ1AsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pEO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFDN0IsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFaEMsT0FBTztvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLFNBQVMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsT0FBTyxTQUFTLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBRTVELE9BQU87b0JBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxNQUFNO29CQUNOLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3JCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Y7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXJELE9BQU87Z0JBQ0wsSUFBSTtnQkFDSixHQUFHO2dCQUNILEtBQUs7Z0JBQ0wsTUFBTTtnQkFDTixLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxQyxPQUFPO2dCQUNQLFVBQVU7Z0JBQ1YsS0FBSztnQkFDTCxPQUFPLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLGVBQWU7YUFDdEMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsbUJBQW1CO1FBQ25CLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN2RSxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2xDLGtCQUFrQjtZQUNsQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDakIsSUFBSTtnQkFDRixXQUFXO2dCQUNYLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLCtCQUErQjtvQkFDL0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzNDO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELGtCQUFrQjtZQUNsQixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDOUMsSUFBSTtnQkFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ3pFLElBQUk7Z0JBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUN2RSxJQUFJO2dCQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDM0UsSUFBSTtnQkFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTdFLE9BQU87WUFDUCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekQ7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDckM7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztZQUM3QixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVoQyxPQUFPO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksU0FBUyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixPQUFPLFNBQVMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFFNUQsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELE1BQU07b0JBQ04sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDckI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELE9BQU87b0JBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7b0JBRUQsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO2lCQUNGO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVyRCxPQUFPO2dCQUNMLElBQUk7Z0JBQ0osR0FBRztnQkFDSCxLQUFLO2dCQUNMLE1BQU07Z0JBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUMsT0FBTztnQkFDUCxVQUFVO2dCQUNWLEtBQUs7Z0JBQ0wsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxlQUFlO2FBQ3RDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNoQyxrQkFBa0I7WUFDbEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUk7Z0JBQ0YsV0FBVztnQkFDWCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNqQywrQkFBK0I7b0JBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUN2QyxJQUFJO2dCQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUNwRixJQUFJO2dCQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDM0UsSUFBSTtnQkFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTdFLE9BQU87WUFDUCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekQ7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDckM7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMvQjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO1lBQ1AsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzdCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWhDLE9BQU87b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLE9BQU8sU0FBUyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUU1RCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTTtvQkFDTixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNyQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Y7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEtBQUssU0FBUyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixLQUFLLFNBQVMsT0FBTyxPQUFPLFdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUV4SCxPQUFPO1lBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFdEQsT0FBTztnQkFDTCxLQUFLO2dCQUNMLEtBQUs7Z0JBQ0wsTUFBTTtnQkFDTixLQUFLO2dCQUNMLE9BQU87Z0JBQ1AsVUFBVTtnQkFDVixLQUFLO2dCQUNMLE9BQU8sRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsZUFBZTthQUN0QyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZO1FBQ1osTUFBTSxRQUFRLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUMsU0FBUztRQUNULE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUvRCxTQUFTO1FBQ1QsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakUsTUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO1FBQy9DLE1BQU0sb0JBQW9CLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDO1FBRXZEO1lBQ0UsT0FBTztZQUNQLFNBQVM7WUFDVCxTQUFTO1lBQ1QsU0FBUztZQUVULE9BQU87WUFDUCxVQUFVO1lBQ1YsUUFBUTtZQUNSLFVBQVU7WUFDVixXQUFXO1lBQ1gsVUFBVTtZQUNWLFNBQVM7WUFFVCxXQUFXO1lBQ1gsU0FBUztZQUNULFdBQVc7WUFDWCxZQUFZO1lBQ1osV0FBVztZQUNYLFVBQVU7WUFFVixTQUFTO1lBQ1QsT0FBTztZQUNQLFNBQVM7WUFDVCxVQUFVO1lBQ1YsU0FBUztZQUNULFFBQVE7WUFFUixVQUFVO1lBQ1YsUUFBUTtZQUNSLFVBQVU7WUFDVixXQUFXO1lBQ1gsVUFBVTtZQUNWLFNBQVM7WUFFVCxPQUFPO1lBQ1AsT0FBTztZQUNQLFlBQVk7WUFDWixRQUFRO1lBQ1IsYUFBYTtZQUNiLFFBQVE7WUFFUixPQUFPO1lBQ1AsVUFBVSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUU7WUFFaEMsT0FBTztZQUNQLFFBQVEsRUFBRSxJQUFJLEVBQ2QsTUFBTTtZQUVOLE9BQU87WUFDUCxhQUFhO1lBQ2IsY0FBYztZQUNkLFlBQVk7WUFDWixhQUFhO1lBRWIsT0FBTztZQUNQLFdBQVc7WUFDWCxZQUFZO1lBQ1osVUFBVTtZQUNWLFdBQVc7WUFFWCxhQUFhO1lBQ2IsY0FBYyxFQUFFLGNBQWMsRUFDOUIsZUFBZSxFQUFFLGVBQWUsRUFDaEMsY0FBYyxFQUFFLGNBQWMsRUFDOUIsY0FBYyxFQUFFLGNBQWMsRUFBRSwwQ0FBMEM7WUFFMUUsT0FBTztZQUNQLGNBQWM7WUFDZCxlQUFlO1lBQ2YsYUFBYTtZQUNiLGNBQWM7WUFFZCxZQUFZO1lBQ1osU0FBUztZQUNULFVBQVU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUVULFNBQVM7WUFDVCxXQUFXO1lBQ1gsWUFBWTtZQUNaLFVBQVU7WUFDVixXQUFXO1lBRVgsUUFBUTtZQUNSLE1BQU0sRUFDTixLQUFLLEVBQUUsS0FBZSxFQUN0QixTQUFTLEVBQUUsU0FBbUI7WUFFOUIsUUFBUTtZQUNSLEtBQUssRUFBRSxLQUFpQixFQUN4QixLQUFLLEVBQUUsS0FBaUIsRUFDeEIsT0FBTyxFQUFFLE9BQW1CLElBR3pCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FDdEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUNsQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQ3RDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FDOUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUMxQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRXZDLE9BQU87WUFDUCxTQUFTO1lBQ1QsVUFBVTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsU0FBUztZQUNULFFBQVE7WUFFUixjQUFjO1lBQ2QsS0FBSztZQUNMLE9BQU87WUFDUCxPQUFPO1lBQ1AsTUFBTTtZQUVOLE9BQU87WUFDUCxPQUFPO1lBQ1AsUUFBUTtZQUVSLFlBQVk7WUFDWixjQUFjO1lBQ2QsYUFBYTtZQUNiLG9CQUFvQixJQUNwQjtJQUNKLENBQUM7SUFJRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFjO1FBQ3hDLE1BQU0sR0FBRyxHQUE0QjtZQUNuQyxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7U0FDVCxDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBZSxFQUFFLFNBQWlCO1FBQ2xELE9BQU87UUFDUCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFM0IsV0FBVztRQUNYLFdBQVc7UUFDWCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFeEIsZUFBZTtRQUNmLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxJQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELFNBQVM7UUFDVCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTVDLFNBQVM7UUFDVCxJQUFJLFlBQVksR0FBRyxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXhELHlDQUF5QztRQUN6Qyx5Q0FBeUM7UUFDekMsTUFBTSxZQUFZLEdBQUc7WUFDbkIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtTQUMzRCxDQUFDO1FBRUYsT0FBTyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQWUsRUFBRSxNQUFjO1FBQ3JELFNBQVM7UUFDVCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLGtCQUFrQjtRQUNsQixJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsZUFBZTtRQUNmLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQyxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsWUFBWTtRQUNaLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtZQUMxQixJQUFJLEdBQUcsRUFBRTtnQkFDUCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN4QjtTQUNGO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFvQixFQUFFLE1BQWM7UUFDaEUsb0NBQW9DO1FBQ3BDLGVBQWU7UUFDZixNQUFNLEtBQUssR0FBa0YsRUFBRSxDQUFDO1FBRWhHLHVCQUF1QjtRQUN2QixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3QyxPQUFPO1FBQ1AsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU1QyxTQUFTO1FBQ1QsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQzNCLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQztRQUVoQyxPQUFPO1FBQ1AsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdkQsWUFBWTtRQUNaLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUVwRCxVQUFVO1FBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQixXQUFXO1lBQ1gsTUFBTSxTQUFTLEdBQUcsQ0FBQyxjQUFjLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuRSxNQUFNLFdBQVcsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFdkUsT0FBTztZQUNQLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUU3QixPQUFPO1lBQ1AsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwQyxZQUFZO1lBQ1osTUFBTSxZQUFZLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsTUFBTSxTQUFTLEdBQUcsV0FBVyxHQUFHLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWTtZQUVqRSxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNULFNBQVM7Z0JBQ1QsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLE1BQU07Z0JBQ04sS0FBSzthQUNOLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQjtRQUMvQyxNQUFNLE9BQU8sR0FBd0UsRUFBRSxDQUFDO1FBQ3hGLE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFN0MsU0FBUztRQUNULE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQztRQUMzQixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFFaEMsb0JBQW9CO1FBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEdBQUcsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFFdkMsU0FBUztZQUNULE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNsQyxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFcEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBRTdCLE9BQU87WUFDUCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXBDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsSUFBSTtnQkFDSixHQUFHO2dCQUNILE1BQU07Z0JBQ04sS0FBSzthQUNOLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsdUJBQXVCLENBQUMsU0FBb0I7UUFjekQsVUFBVTtRQUNWLE1BQU0sUUFBUSxHQUFHO1lBQ2YsR0FBRyxFQUFFLENBQUM7WUFDTixFQUFFLEVBQUUsQ0FBQztZQUNMLElBQUksRUFBRSxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixFQUFFLEVBQUUsQ0FBQyxDQUFJLElBQUk7U0FDZCxDQUFDO1FBRUYsaUJBQWlCO1FBQ2pCLE1BQU0sT0FBTyxHQUFHO1lBQ2QsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUNsRyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO1lBQ2pHLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDbkcsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUNsRyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO1NBQ2xHLENBQUM7UUFFRix3QkFBd0I7UUFDeEIsU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QyxXQUFXO1FBQ1gsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRCw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDM0UsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVoRSxtQkFBbUI7UUFDbkIsU0FBUztRQUNULE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUkxQywrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0Qsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVztRQUN2RSxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUxRCxvQkFBb0I7UUFDcEIsU0FBUztRQUNULE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDN0MsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUzQyxTQUFTO1FBQ1QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXZELHdEQUF3RDtRQUN4RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXO1FBQzVFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFL0QsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFMUQsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFakQsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFeEQsY0FBYztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSztZQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM1RixPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUs7WUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7UUFDekYsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQ2xFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2pHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSztZQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM3RixPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUs7WUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7UUFFekYsZUFBZTtRQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVELE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVELE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTFELGtCQUFrQjtRQUNsQixRQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDL0IsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQyxRQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFFL0IsT0FBTztRQUNQLE9BQU87WUFDTCxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUc7WUFDakIsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ2YsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztZQUNqQixFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDZixPQUFPO1NBQ1IsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBYyxFQUFFLEtBQWEsRUFBRSxPQUFZLEVBQUUsUUFBZ0I7UUFDNUYsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRXBCLFFBQVEsTUFBTSxFQUFFO1lBQ2QsS0FBSyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU07WUFDaEQsS0FBSyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU07WUFDL0MsS0FBSyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU07WUFDakQsS0FBSyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU07WUFDaEQsS0FBSyxHQUFHO2dCQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU07U0FDaEQ7SUFDSCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLHlCQUF5QixDQUFDLE9BQWlCLEVBQUUsVUFBa0IsRUFBRSxPQUFZLEVBQUUsa0JBQXdCO1FBQ3BILElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUU3QyxhQUFhO1FBQ2IsZ0JBQWdCO1FBQ2hCLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSSxrQkFBa0IsRUFBRTtZQUN0QixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQy9DLGtCQUFrQixDQUFDLEtBQUssQ0FBQztTQUNuQzthQUFNO1lBQ0wsT0FBTztZQUNQLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBRUQsbUJBQW1CO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzdEO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLDhCQUE4QixDQUMzQyxXQUFtQixFQUNuQixPQUFZLEVBQ1osWUFBa0IsRUFDbEIsa0JBQXdCO1FBRXhCLFdBQVc7UUFDWCxNQUFNLE1BQU0sR0FBRyxZQUFZLElBQUk7WUFDN0IsSUFBSSxFQUFFLEdBQUc7WUFDVCxLQUFLLEVBQUUsR0FBRztZQUNWLElBQUksRUFBRSxHQUFHO1lBQ1QsR0FBRyxFQUFFLENBQUMsR0FBRztZQUNULEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBSyxNQUFNO1NBQ3BCLENBQUM7UUFFRixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxZQUFZLEdBQVEsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsTUFBTSxHQUFHLFFBQVEsQ0FBQztZQUNsQixZQUFZLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlELEVBQUUsRUFBRSxNQUFNO2dCQUNWLEdBQUcsRUFBRSxPQUFPO2dCQUNaLEVBQUUsRUFBRSxNQUFNO2dCQUNWLEdBQUcsRUFBRSxLQUFLO2dCQUNWLElBQUksRUFBRSxJQUFJLENBQUssS0FBSzthQUNyQixDQUFDO1NBQ0g7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLE1BQU0sR0FBRyxRQUFRLENBQUM7WUFDbEIsWUFBWSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxHQUFHLEVBQUUsTUFBTTtnQkFDWCxFQUFFLEVBQUUsT0FBTztnQkFDWCxHQUFHLEVBQUUsTUFBTTtnQkFDWCxJQUFJLEVBQUUsS0FBSztnQkFDWCxFQUFFLEVBQUUsSUFBSSxDQUFPLEtBQUs7YUFDckIsQ0FBQztTQUNIO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELEtBQUs7WUFDTCxNQUFNLEdBQUcsUUFBUSxDQUFDO1lBQ2xCLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsR0FBRyxFQUFFLE1BQU07Z0JBQ1gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsRUFBRSxFQUFFLE1BQU07Z0JBQ1YsR0FBRyxFQUFFLEtBQUs7Z0JBQ1YsRUFBRSxFQUFFLElBQUksQ0FBTyxLQUFLO2FBQ3JCLENBQUM7U0FDSDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsTUFBTSxHQUFHLFFBQVEsQ0FBQztZQUNsQixZQUFZLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlELElBQUksRUFBRSxNQUFNO2dCQUNaLEVBQUUsRUFBRSxPQUFPO2dCQUNYLEdBQUcsRUFBRSxNQUFNO2dCQUNYLEVBQUUsRUFBRSxLQUFLO2dCQUNULEdBQUcsRUFBRSxJQUFJLENBQU0sS0FBSzthQUNyQixDQUFDO1NBQ0g7UUFFRCxPQUFPO1FBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekMsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQ25ELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLHFCQUFxQixDQUNsQyxXQUFtQixFQUNuQixPQUFZLEVBQ1osa0JBQXdCLEVBQ3hCLG1CQUF5QjtRQUV6QixXQUFXO1FBQ1gsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLElBQUk7WUFDbEMsUUFBUSxFQUFFLEdBQUc7WUFDYixPQUFPLEVBQUUsR0FBRztZQUNaLE9BQU8sRUFBRSxHQUFHO1lBQ1osSUFBSSxFQUFFLENBQUMsR0FBRztZQUNWLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBTyxNQUFNO1NBQ3hCLENBQUM7UUFFRixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxZQUFZLEdBQVEsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsTUFBTSxHQUFHLFFBQVEsQ0FBQztZQUNsQixZQUFZLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUssTUFBTTthQUMxQixDQUFDO1NBQ0g7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLE1BQU0sR0FBRyxRQUFRLENBQUM7WUFDbEIsWUFBWSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxRQUFRLEVBQUUsS0FBSztnQkFDZixPQUFPLEVBQUUsSUFBSSxDQUFNLE1BQU07YUFDMUIsQ0FBQztTQUNIO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELEtBQUs7WUFDTCxNQUFNLEdBQUcsUUFBUSxDQUFDO1lBQ2xCLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDaEUsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsT0FBTyxFQUFFLE1BQU0sQ0FBSSxNQUFNO2FBQzFCLENBQUM7U0FDSDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsTUFBTSxHQUFHLFFBQVEsQ0FBQztZQUNsQixZQUFZLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFNLE1BQU07YUFDMUIsQ0FBQztTQUNIO1FBRUQsWUFBWTtRQUNaLElBQUksWUFBWSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNELE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUM7U0FDaEU7UUFFRCxJQUFJLFlBQVksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6RCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQzlEO1FBRUQsaUJBQWlCO1FBQ2pCLHFCQUFxQjtRQUNyQixNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBQzdDLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFFM0MsY0FBYztRQUNkLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxNQUFNLEtBQUssY0FBYyxJQUFJLE1BQU0sS0FBSyxhQUFhLEVBQUU7Z0JBQ3pELGFBQWE7Z0JBQ2IsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsT0FBTztnQkFFL0IsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUN2QixJQUFJLE1BQU0sS0FBSyxLQUFLO3dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLO29CQUM1QyxJQUFJLE1BQU0sS0FBSyxNQUFNO3dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLO2lCQUM5QztxQkFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7b0JBQzlCLElBQUksTUFBTSxLQUFLLE1BQU07d0JBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEtBQUs7b0JBQzdDLElBQUksTUFBTSxLQUFLLElBQUk7d0JBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEtBQUs7aUJBQzVDO3FCQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtvQkFDOUIsSUFBSSxNQUFNLEtBQUssS0FBSzt3QkFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSztvQkFDNUMsSUFBSSxNQUFNLEtBQUssSUFBSTt3QkFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsS0FBSztpQkFDNUM7cUJBQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUM5QixJQUFJLE1BQU0sS0FBSyxJQUFJO3dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLO29CQUMzQyxJQUFJLE1BQU0sS0FBSyxLQUFLO3dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLO2lCQUM3QztnQkFFRCxVQUFVO2dCQUNWLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hEO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxTQUFvQixFQUFFLE9BQVksRUFBRSxpQkFBdUI7UUFDdkcsU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFMUMsU0FBUztRQUNULElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXBGLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxNQUFNLENBQUMsK0JBQStCLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxPQUFZLEVBQUUsaUJBQXVCO1FBQ2hILFdBQVc7UUFDWCxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUVqRixxQ0FBcUM7UUFDckMsTUFBTSxZQUFZLEdBQXFEO1lBQ3JFLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1lBQzVDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFDO1NBQzdDLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMvRDtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBQyw0QkFBNEIsQ0FDekMsT0FBZSxFQUNmLE9BQWUsRUFDZixPQUFlLEVBQ2YsT0FBZSxFQUNmLE9BQVksRUFDWixpQkFBdUI7UUFFdkIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxXQUFXO1FBQ1gsTUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzFFLE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RSxNQUFNLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNuRixNQUFNLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUVyRixRQUFRO1FBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxJQUFJLE9BQU8sRUFBRTtZQUNYLGdCQUFnQjtZQUNoQixNQUFNLGFBQWEsR0FBRztnQkFDcEIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ3BCLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNwQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDcEIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7YUFDckIsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELHdCQUF3QjtZQUN4QixJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixPQUFPO2dCQUNQLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUNyRTtpQkFBTTtnQkFDTCxPQUFPO2dCQUNQLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzVFO1NBQ0Y7UUFFRCxRQUFRO1FBQ1IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsRUFBRTtZQUNaLGdCQUFnQjtZQUNoQixNQUFNLGNBQWMsR0FBRztnQkFDckIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ3BCLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNwQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDcEIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7YUFDckIsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELHdCQUF3QjtZQUN4QixJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixPQUFPO2dCQUNQLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUN2RTtpQkFBTTtnQkFDTCxPQUFPO2dCQUNQLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzlFO1NBQ0Y7SUFDSCxDQUFDO0lBSUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLHlCQUF5QixDQUFDLE9BQWlCLEVBQUUsVUFBa0IsRUFBRSxXQUFvRDtRQUNsSSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRWhELGFBQWE7UUFDYixjQUFjO1FBQ2QsaUJBQWlCO1FBQ2pCLHFCQUFxQjtRQUNyQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0IsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLG1CQUFtQjtRQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sS0FBSyxHQUFHLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQW1CLEVBQUUsUUFBNEU7UUFDbEksZUFBZTtRQUNmLHFDQUFxQztRQUNyQyxxQ0FBcUM7UUFDckMscUNBQXFDO1FBQ3JDLHFDQUFxQztRQUVyQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDekMsS0FBSztZQUNMLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUN6QixRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7U0FDM0I7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMxQixRQUFRLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7U0FDMUI7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMxQixRQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7U0FDNUI7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMzQixRQUFRLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7U0FDMUI7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsOEJBQThCLENBQzNDLFdBQW1CLEVBQ25CLFFBQTRFLEVBQzVFLE9BQVk7UUFFWixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsTUFBTSxXQUFXLEdBQXlDLEVBQUUsQ0FBQztRQUU3RCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDekMsS0FBSztZQUNMLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDZCxRQUFRLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFOUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzFCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELEtBQUs7WUFDTCxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2QsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzFCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTlDLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNkLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMxQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUU5QyxRQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDM0IsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDZCxRQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDM0IsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFOUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFvQixFQUFFLFFBQTRFO1FBQ25JLFNBQVM7UUFDVCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLFNBQVM7UUFDVCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV2RCxvQkFBb0I7UUFDcEIsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLDhCQUE4QixDQUMzQyxTQUFvQixFQUNwQixRQUE0RSxFQUM1RSxPQUFZO1FBRVosU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFMUMsTUFBTSxZQUFZLEdBQXdFLEVBQUUsQ0FBQztRQUU3RixTQUFTO1FBQ1QsSUFBSSxDQUFDLCtCQUErQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFaEYsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUUxRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsb0JBQW9CLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxRQUE0RTtRQUM1SSxxQ0FBcUM7UUFDckMsTUFBTSxZQUFZLEdBQXFEO1lBQ3JFLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztTQUNoQyxDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNyQixNQUFNLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxRQUFRLE1BQU0sRUFBRTtnQkFDZCxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ3RDLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2dCQUN4QyxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07YUFDdkM7U0FDRjtJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxNQUFNLENBQUMsK0JBQStCLENBQzVDLEtBQWEsRUFDYixLQUFhLEVBQ2IsUUFBNEUsRUFDNUUsWUFBaUY7UUFFakYscUNBQXFDO1FBQ3JDLE1BQU0sY0FBYyxHQUFxRDtZQUN2RSxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7U0FDaEMsQ0FBQztRQUVGLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ3ZDLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2dCQUN0QyxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDeEMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ3ZDLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2FBQ3ZDO1lBRUQsU0FBUztZQUNULFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEtBQUssRUFBRSxLQUFLO2FBQ2IsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFBRSxPQUFlLEVBQ25FLFFBQTRFO1FBQzFHLFFBQVE7UUFDUixVQUFVO1FBQ1YsVUFBVTtRQUNWLFVBQVU7UUFDVixVQUFVO1FBRVYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxRQUFRO1FBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksT0FBTyxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVO2lCQUMvQyxJQUFJLE9BQU8sS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDO2lCQUN4QyxJQUFJLE9BQU8sS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO2lCQUMxQyxJQUFJLE9BQU8sS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO1NBQy9DO1FBRUQsUUFBUTtRQUNSLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEVBQUU7WUFDWixJQUFJLFFBQVEsS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVTtpQkFDL0MsSUFBSSxRQUFRLEtBQUssR0FBRztnQkFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztpQkFDMUMsSUFBSSxRQUFRLEtBQUssR0FBRztnQkFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztpQkFDMUMsSUFBSSxRQUFRLEtBQUssR0FBRztnQkFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQztTQUNqRDtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBQyw0QkFBNEIsQ0FDekMsT0FBZSxFQUNmLE9BQWUsRUFDZixPQUFlLEVBQ2YsT0FBZSxFQUNmLFFBQTRFLEVBQzVFLFlBQWlGO1FBRWpGLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEQsUUFBUTtRQUNSLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVO1lBQzdCLElBQUksYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUVqQyxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQ25CLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUM5RSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQzthQUN2QjtpQkFBTSxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUM5RSxRQUFRLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQzthQUN0QjtpQkFBTSxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUM5RSxRQUFRLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQzthQUN4QjtpQkFBTSxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUM5RSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQzthQUN2QjtZQUVELFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxhQUFhO2dCQUNwQixNQUFNLEVBQUUsT0FBTztnQkFDZixLQUFLLEVBQUUsS0FBSzthQUNiLENBQUMsQ0FBQztTQUNKO1FBRUQsUUFBUTtRQUNSLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEVBQUU7WUFDWixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVO1lBQzdCLElBQUksY0FBYyxHQUFhLEVBQUUsQ0FBQztZQUVsQyxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUMvRSxRQUFRLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQzthQUN0QjtpQkFBTSxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUMvRSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQzthQUN2QjtpQkFBTSxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUMvRSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQzthQUN2QjtpQkFBTSxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBYSxDQUFDO2dCQUMvRSxRQUFRLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQzthQUN4QjtZQUVELFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxjQUFjO2dCQUNyQixNQUFNLEVBQUUsUUFBUTtnQkFDaEIsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBZSxFQUFFLFFBQWtCO1FBQzVELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBYTtRQUN6QyxJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRXRCLDBDQUEwQztRQUMxQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUMzRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUMzRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUMzRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUMzRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUUzRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLHNCQUFzQixDQUFDLFNBQW9CO1FBYXhELFlBQVk7UUFDWixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsd0RBQXdEO1FBQ3hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUMsU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUUxQyxZQUFZO1FBQ1osSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7UUFFRCxZQUFZO1FBQ1osTUFBTSxPQUFPLEdBQUc7WUFDZCxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDdEMsTUFBTTtZQUNOLFNBQVMsRUFBRSxFQUFFO1lBQ2IsWUFBWSxFQUFFLEVBQUU7WUFDaEIsV0FBVyxFQUFFLEVBQUU7WUFDZixXQUFXLEVBQUUsRUFBRTtZQUNmLGVBQWUsRUFBRSxFQUFFO1lBQ25CLFVBQVUsRUFBRSxDQUFDO1NBQ2QsQ0FBQztRQUVGLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU87UUFDNUIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLFNBQVM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxDQUFDO1FBRXpDLFVBQVU7UUFDVixJQUFJLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDbEIsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7YUFDbkM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7U0FDRjthQUFNLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO2FBQ25DO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO1NBQ0Y7YUFBTSxJQUFJLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDekIsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7YUFDbkM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7U0FDRjthQUFNLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN6QixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQzthQUNuQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztTQUNGO1FBRUQsY0FBYztRQUNkLElBQUksa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBRXRDLFdBQVc7UUFDWCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUUsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxjQUFjLGNBQWMsQ0FBQyxDQUFDO1NBQ3hFO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN4RCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxJQUFJLGNBQWMsV0FBVyxDQUFDLENBQUM7U0FDckU7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3JELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksY0FBYyxXQUFXLENBQUMsQ0FBQztTQUNyRTtRQUVELFdBQVc7UUFDWCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDOUUsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxlQUFlLGNBQWMsQ0FBQyxDQUFDO1NBQzFFO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN6RCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLGVBQWUsV0FBVyxDQUFDLENBQUM7U0FDdkU7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3RELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksZUFBZSxXQUFXLENBQUMsQ0FBQztTQUN2RTtRQUVELFdBQVc7UUFDWCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUUsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxjQUFjLGNBQWMsQ0FBQyxDQUFDO1NBQ3hFO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN4RCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxJQUFJLGNBQWMsV0FBVyxDQUFDLENBQUM7U0FDckU7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3JELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksY0FBYyxXQUFXLENBQUMsQ0FBQztTQUNyRTtRQUVELE9BQU8sQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5ELGdCQUFnQjtRQUNoQixJQUFJLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztRQUV0QyxTQUFTO1FBQ1QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbEMsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25ELEtBQUssTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFO2dCQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEUsaUJBQWlCLElBQUksR0FBRyxDQUFDO29CQUN6QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDL0U7cUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDbkQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzFFO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7b0JBQ2hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztvQkFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxLQUFLLEdBQUcsSUFBSSxTQUFTLFdBQVcsQ0FBQyxDQUFDO2lCQUMxRTthQUNGO1NBQ0Y7UUFFRCxTQUFTO1FBQ1QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkMsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JELEtBQUssTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFO2dCQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEUsaUJBQWlCLElBQUksR0FBRyxDQUFDO29CQUN6QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLEtBQUssR0FBRyxJQUFJLFNBQVMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDaEY7cUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDbkQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzNFO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7b0JBQ2hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztvQkFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssV0FBVyxLQUFLLEdBQUcsSUFBSSxTQUFTLFdBQVcsQ0FBQyxDQUFDO2lCQUMzRTthQUNGO1NBQ0Y7UUFFRCxTQUFTO1FBQ1QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakMsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2pELEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO2dCQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEUsaUJBQWlCLElBQUksR0FBRyxDQUFDO29CQUN6QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDOUU7cUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDbkQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQ3pFO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7b0JBQ2hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztvQkFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxLQUFLLEdBQUcsSUFBSSxTQUFTLFdBQVcsQ0FBQyxDQUFDO2lCQUN6RTthQUNGO1NBQ0Y7UUFFRCxTQUFTO1FBQ1QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbEMsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25ELEtBQUssTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFO2dCQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbEUsaUJBQWlCLElBQUksR0FBRyxDQUFDO29CQUN6QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDL0U7cUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDbkQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzFFO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7b0JBQ2hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztvQkFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxLQUFLLEdBQUcsSUFBSSxTQUFTLFdBQVcsQ0FBQyxDQUFDO2lCQUMxRTthQUNGO1NBQ0Y7UUFFRCxPQUFPLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuRCxZQUFZO1FBQ1osSUFBSSxzQkFBc0IsR0FBYSxFQUFFLENBQUM7UUFFMUMsUUFBUTtRQUNSLE1BQU0sV0FBVyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sRUFBRTtZQUNYLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV2RCxZQUFZO1lBQ1osSUFBSSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBQ2pDLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDbkIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEU7aUJBQU0sSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUMxQixhQUFhLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RTtpQkFBTSxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO2lCQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEU7WUFFRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDdEUscUJBQXFCLElBQUksQ0FBQyxDQUFDO2dCQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sYUFBYSxDQUFDLENBQUM7YUFDckY7aUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDckQscUJBQXFCLElBQUksQ0FBQyxDQUFDO2dCQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sYUFBYSxDQUFDLENBQUM7YUFDakY7aUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDbEQscUJBQXFCLElBQUksQ0FBQyxDQUFDO2dCQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sYUFBYSxDQUFDLENBQUM7YUFDakY7U0FDRjtRQUVELFFBQVE7UUFDUixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTlCLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXhELFlBQVk7WUFDWixJQUFJLGNBQWMsR0FBYSxFQUFFLENBQUM7WUFDbEMsSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFO2dCQUNwQixjQUFjLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RTtpQkFBTSxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO2lCQUFNLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkU7aUJBQU0sSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFO2dCQUMzQixjQUFjLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN4RSxxQkFBcUIsSUFBSSxHQUFHLENBQUM7Z0JBQzdCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxlQUFlLENBQUMsQ0FBQzthQUN6RjtpQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUN0RCxxQkFBcUIsSUFBSSxHQUFHLENBQUM7Z0JBQzdCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxlQUFlLENBQUMsQ0FBQzthQUNyRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNuRCxxQkFBcUIsSUFBSSxHQUFHLENBQUM7Z0JBQzdCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxlQUFlLENBQUMsQ0FBQzthQUNyRjtTQUNGO1FBRUQsT0FBTztRQUNQLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFMUIsSUFBSSxLQUFLLEVBQUU7WUFDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEQsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3RFLHFCQUFxQixJQUFJLENBQUMsQ0FBQztnQkFDM0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxhQUFhLENBQUMsQ0FBQzthQUN4RDtpQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNyRCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssYUFBYSxDQUFDLENBQUM7YUFDcEQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDbEQscUJBQXFCLElBQUksQ0FBQyxDQUFDO2dCQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLGFBQWEsQ0FBQyxDQUFDO2FBQ3BEO1NBQ0Y7UUFFRCxTQUFTO1FBQ1QsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVFLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzVFLHFCQUFxQixJQUFJLENBQUMsQ0FBQztZQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxRQUFRLGVBQWUsQ0FBQyxDQUFDO1NBQzlEO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN4RCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7WUFDM0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLFFBQVEsUUFBUSxhQUFhLENBQUMsQ0FBQztTQUM1RDthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckQscUJBQXFCLElBQUksQ0FBQyxDQUFDO1lBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLFFBQVEsYUFBYSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPLENBQUMsZUFBZSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzRCxPQUFPO1FBQ1AsVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFHLGlCQUFpQixHQUFHLGlCQUFpQixHQUFHLHFCQUFxQixDQUFDO1FBQzlHLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRWhDLGFBQWE7UUFDYixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxVQUFVLElBQUksRUFBRSxFQUFFO1lBQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDZjthQUFNLElBQUksVUFBVSxJQUFJLEVBQUUsRUFBRTtZQUMzQixNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQUU7WUFDMUIsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO2FBQU0sSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO1lBQzFCLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDZjthQUFNLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQzNCLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDZjthQUFNLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQzNCLE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNO1lBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTztZQUNMLE1BQU07WUFDTixPQUFPO1NBQ1IsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFrQjtRQUM1QyxrQ0FBa0M7UUFDbEMsTUFBTSxhQUFhLEdBQUc7WUFDcEIsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7U0FDdEMsQ0FBQztRQUVGLEtBQUssTUFBTSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxhQUFhLEVBQUU7WUFDM0MsWUFBWTtZQUNaLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFNUUsaUJBQWlCO1lBQ2pCLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELElBQUksY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxpQkFBaUI7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQWlCO1FBQzdDLFFBQVEsU0FBUyxFQUFFO1lBQ2pCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBa0I7UUFDN0Msc0NBQXNDO1FBQ3RDLE1BQU0sY0FBYyxHQUFHO1lBQ3JCLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ3JDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ3JDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ3JDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1NBQ3RDLENBQUM7UUFFRixLQUFLLE1BQU0sRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksY0FBYyxFQUFFO1lBQzVDLFlBQVk7WUFDWixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTVFLGlCQUFpQjtZQUNqQixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUVoRCxJQUFJLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsaUJBQWlCO2dCQUMvQyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFrQjtRQUMvQyxRQUFRLFVBQVUsRUFBRTtZQUNsQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQWU7UUFDeEMsZ0NBQWdDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHO1lBQ25CLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ2hDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztTQUNqQyxDQUFDO1FBRUYsS0FBSyxNQUFNLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLFlBQVksRUFBRTtZQUMxQyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN4QixJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUFFLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3pDLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQUUsU0FBUyxHQUFHLElBQUksQ0FBQzthQUMzQztZQUVELElBQUksUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBZ0I7UUFDM0MsUUFBUSxRQUFRLEVBQUU7WUFDaEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQWtCO1FBQzFDLG1DQUFtQztRQUNuQyxNQUFNLGFBQWEsR0FBRztZQUNwQixFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ2hDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ2hDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztTQUNqQyxDQUFDO1FBRUYsS0FBSyxNQUFNLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLGFBQWEsRUFBRTtZQUMzQyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLEtBQUssTUFBTSxNQUFNLElBQUksUUFBUSxFQUFFO2dCQUM3QixJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUFFLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQzNDLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQUUsU0FBUyxHQUFHLElBQUksQ0FBQzthQUM3QztZQUVELElBQUksUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBaUI7UUFDN0MsUUFBUSxTQUFTLEVBQUU7WUFDakIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUlEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBb0I7UUFPbEQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBQzdCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUNqQyxNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMsTUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUVqQyxTQUFTO1FBQ1QsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUUxQyx1QkFBdUI7UUFDdkIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7UUFFRCxPQUFPO1FBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtZQUM1QyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRTtZQUM3QyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtZQUMzQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtZQUM1QyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzFCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDOUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzlCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDekMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM3QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3ZDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3hDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3ZDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN6QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRTtZQUMxQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN6QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDekMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELE1BQU07UUFDTixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFO1lBQzNDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDekI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0IsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN6QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUMxQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN6QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzlCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDeEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM3QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFB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QUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzthQUNuQjtZQUNELEdBQUcsRUFBRTtnQkFDSCxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJO2dCQUNyRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2FBQ25CO1lBQ0QsR0FBRyxFQUFFO2dCQUNILEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7Z0JBQ3JELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7YUFDbkI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSTtnQkFDckQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzthQUNuQjtZQUNELEdBQUcs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c0JBQXNCO1FBQ3RCLE1BQU0sWUFBWSxHQUFHO1lBQ25CLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1lBQzlDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1lBQzlDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1lBQzlDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSTtTQUNuQixDQUFDO1FBRUYsa0JBQWtCO1FBQ2xCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUU1RSxPQUFPO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLE9BQU8sT0FBTyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRXBELElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQztTQUNiO2FBQU0sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTSxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDN0MsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU29sYXIsIEx1bmFyLCBFaWdodENoYXIgfSBmcm9tICdsdW5hci10eXBlc2NyaXB0JztcbmltcG9ydCB7IEdlSnVKdWRnZVNlcnZpY2UgfSBmcm9tICcuL0dlSnVKdWRnZVNlcnZpY2UnO1xuaW1wb3J0IHsgQmF6aUluZm8gfSBmcm9tICcuLi90eXBlcy9CYXppSW5mbyc7XG5cbi8qKlxuICog5YWr5a2X5pyN5Yqh57G777yM5bCB6KOFbHVuYXItdHlwZXNjcmlwdOeahOWFq+Wtl+WKn+iDvVxuICovXG5leHBvcnQgY2xhc3MgQmF6aVNlcnZpY2Uge1xuICAvKipcbiAgICog5LuO5YWs5Y6G5pel5pyf6I635Y+W5YWr5a2X5L+h5oGvXG4gICAqIEBwYXJhbSB5ZWFyIOW5tFxuICAgKiBAcGFyYW0gbW9udGgg5pyIXG4gICAqIEBwYXJhbSBkYXkg5pelXG4gICAqIEBwYXJhbSBob3VyIOaXtu+8iDAtMjPvvIlcbiAgICogQHJldHVybnMg5YWr5a2X5L+h5oGv5a+56LGhXG4gICAqL1xuICBzdGF0aWMgZ2V0QmF6aUZyb21EYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciA9IDAsIGdlbmRlcjogc3RyaW5nID0gJzEnLCBzZWN0OiBzdHJpbmcgPSAnMicpOiBCYXppSW5mbyB7XG4gICAgLy8g5Yib5bu66Ziz5Y6G5a+56LGhXG4gICAgY29uc3Qgc29sYXIgPSBTb2xhci5mcm9tWW1kSG1zKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIDAsIDApO1xuICAgIC8vIOi9rOaNouS4uuWGnOWOhlxuICAgIGNvbnN0IGx1bmFyID0gc29sYXIuZ2V0THVuYXIoKTtcbiAgICAvLyDojrflj5blhavlrZdcbiAgICBjb25zdCBlaWdodENoYXIgPSBsdW5hci5nZXRFaWdodENoYXIoKTtcblxuICAgIHJldHVybiB0aGlzLmZvcm1hdEJhemlJbmZvKHNvbGFyLCBsdW5hciwgZWlnaHRDaGFyLCBnZW5kZXIsIHNlY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS7juWGnOWOhuaXpeacn+iOt+WPluWFq+Wtl+S/oeaBr1xuICAgKiBAcGFyYW0geWVhciDlhpzljoblubRcbiAgICogQHBhcmFtIG1vbnRoIOWGnOWOhuaciFxuICAgKiBAcGFyYW0gZGF5IOWGnOWOhuaXpVxuICAgKiBAcGFyYW0gaG91ciDml7bvvIgwLTIz77yJXG4gICAqIEBwYXJhbSBpc0xlYXBNb250aCDmmK/lkKbpl7DmnIhcbiAgICogQHJldHVybnMg5YWr5a2X5L+h5oGv5a+56LGhXG4gICAqL1xuICBzdGF0aWMgZ2V0QmF6aUZyb21MdW5hckRhdGUoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgaG91cjogbnVtYmVyID0gMCwgaXNMZWFwTW9udGg6IGJvb2xlYW4gPSBmYWxzZSwgZ2VuZGVyOiBzdHJpbmcgPSAnMScsIHNlY3Q6IHN0cmluZyA9ICcyJyk6IEJhemlJbmZvIHtcbiAgICAvLyDliJvlu7rlhpzljoblr7nosaFcbiAgICAvLyBMdW5hci5mcm9tWW1kSG1z5Y+q5o6l5Y+XNuS4quWPguaVsO+8jOS4jeaUr+aMgWlzTGVhcE1vbnRo5Y+C5pWwXG4gICAgLy8g6ZyA6KaB5L2/55So5YW25LuW5pa55rOV5aSE55CG6Zew5pyIXG4gICAgbGV0IGx1bmFyO1xuICAgIGlmIChpc0xlYXBNb250aCkge1xuICAgICAgLy8g5a+55LqO6Zew5pyI77yM5oiR5Lus6ZyA6KaB5L2/55So5YW25LuW5pa55rOVXG4gICAgICAvLyDov5nph4znroDljJblpITnkIbvvIzlrp7pmYXlupTnlKjkuK3lj6/og73pnIDopoHmm7TlpI3mnYLnmoTpgLvovpFcbiAgICAgIGx1bmFyID0gTHVuYXIuZnJvbVltZCh5ZWFyLCBtb250aCwgZGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbHVuYXIgPSBMdW5hci5mcm9tWW1kSG1zKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIDAsIDApO1xuICAgIH1cbiAgICAvLyDovazmjaLkuLrpmLPljoZcbiAgICBjb25zdCBzb2xhciA9IGx1bmFyLmdldFNvbGFyKCk7XG4gICAgLy8g6I635Y+W5YWr5a2XXG4gICAgY29uc3QgZWlnaHRDaGFyID0gbHVuYXIuZ2V0RWlnaHRDaGFyKCk7XG5cbiAgICByZXR1cm4gdGhpcy5mb3JtYXRCYXppSW5mbyhzb2xhciwgbHVuYXIsIGVpZ2h0Q2hhciwgZ2VuZGVyLCBzZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDlhavlrZflrZfnrKbkuLJcbiAgICogQHBhcmFtIGJhemlTdHIg5YWr5a2X5a2X56ym5Liy77yM5aaCXCLnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja9cIlxuICAgKiBAcGFyYW0gZ2VuZGVyIOaAp+WIq++8iDEt55S377yMMC3lpbPvvIlcbiAgICogQHBhcmFtIHNlY3Qg5YWr5a2X5rWB5rS+77yIMeaIljLvvIlcbiAgICogQHBhcmFtIHNwZWNpZmllZFllYXIg5oyH5a6a55qE5bm05Lu977yM5aaC5p6c5o+Q5L6b5YiZ5L2/55So5q2k5bm05Lu96ICM5LiN5piv5Y+N5o6oXG4gICAqIEByZXR1cm5zIOWFq+Wtl+S/oeaBr+WvueixoVxuICAgKi9cbiAgc3RhdGljIHBhcnNlQmF6aVN0cmluZyhiYXppU3RyOiBzdHJpbmcsIGdlbmRlcjogc3RyaW5nID0gJzEnLCBzZWN0OiBzdHJpbmcgPSAnMicsIHNwZWNpZmllZFllYXI/OiBudW1iZXIpOiBCYXppSW5mbyB7XG4gICAgLy8g5riF55CG5bm25YiG5Ymy5YWr5a2X5a2X56ym5LiyXG4gICAgY29uc3QgcGFydHMgPSBiYXppU3RyLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcblxuICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcign5YWr5a2X5qC85byP5LiN5q2j56Gu77yM5bqU5Li6XCLlubTmn7Eg5pyI5p+xIOaXpeafsSDml7bmn7FcIueahOagvOW8j++8jOWmglwi55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vXCInKTtcbiAgICB9XG5cbiAgICAvLyDmj5Dlj5blpKnlubLlnLDmlK9cbiAgICBjb25zdCB5ZWFyU3RlbSA9IHBhcnRzWzBdWzBdO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBwYXJ0c1swXVsxXTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBwYXJ0c1sxXVswXTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IHBhcnRzWzFdWzFdO1xuICAgIGNvbnN0IGRheVN0ZW0gPSBwYXJ0c1syXVswXTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBwYXJ0c1syXVsxXTtcbiAgICBjb25zdCBob3VyU3RlbSA9IHBhcnRzWzNdWzBdO1xuICAgIGNvbnN0IGhvdXJCcmFuY2ggPSBwYXJ0c1szXVsxXTtcblxuICAgIC8vIOiuoeeul+S6lOihjFxuICAgIGNvbnN0IHllYXJXdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoeWVhclN0ZW0pO1xuICAgIGNvbnN0IG1vbnRoV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKG1vbnRoU3RlbSk7XG4gICAgY29uc3QgZGF5V3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGRheVN0ZW0pO1xuICAgIGNvbnN0IGhvdXJXdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoaG91clN0ZW0pO1xuXG4gICAgLy8g6K6h566X57qz6Z+zXG4gICAgY29uc3QgeWVhck5hWWluID0gdGhpcy5nZXROYVlpbih5ZWFyU3RlbSArIHllYXJCcmFuY2gpO1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSB0aGlzLmdldE5hWWluKG1vbnRoU3RlbSArIG1vbnRoQnJhbmNoKTtcbiAgICBjb25zdCBkYXlOYVlpbiA9IHRoaXMuZ2V0TmFZaW4oZGF5U3RlbSArIGRheUJyYW5jaCk7XG4gICAgY29uc3QgaG91ck5hWWluID0gdGhpcy5nZXROYVlpbihob3VyU3RlbSArIGhvdXJCcmFuY2gpO1xuXG4gICAgLy8g5Yid5aeL5YyW5pel5pyf55u45YWz5Y+Y6YePXG4gICAgbGV0IHNvbGFyRGF0ZSA9ICctLS0t5bm0LS3mnIgtLeaXpSc7XG4gICAgbGV0IGx1bmFyRGF0ZSA9ICflhpzljoYtLS0t5bm0LS3mnIgtLeaXpSc7XG4gICAgbGV0IHNvbGFyVGltZSA9ICctLTotLSc7XG4gICAgbGV0IHNvbGFyOiBTb2xhciB8IG51bGwgPSBudWxsO1xuICAgIGxldCBsdW5hcjogTHVuYXIgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgZWlnaHRDaGFyOiBFaWdodENoYXIgfCBudWxsID0gbnVsbDtcblxuICAgIC8vIOiuoeeul+WMuemFjeeahOW5tOS7veWIl+ihqFxuICAgIGxldCBtYXRjaGluZ1llYXJzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgLy8g5L2/55SobHVuYXItdHlwZXNjcmlwdOW6k+eahFNvbGFyLmZyb21CYVpp5pa55rOV6I635Y+W5omA5pyJ5Y+v6IO955qE5bm05Lu9XG4gICAgdHJ5IHtcbiAgICAgIC8vIOiOt+WPluaJgOacieWPr+iDveeahOW5tOS7vVxuICAgICAgLy8g5oiR5Lus6ZyA6KaB5aSa5qyh6LCD55SoU29sYXIuZnJvbUJhWmnvvIzkvb/nlKjkuI3lkIznmoTln7rlh4blubTku73vvIzku6Xojrflj5bmiYDmnInlj6/og73nmoTlubTku71cbiAgICAgIGNvbnN0IGFsbFllYXJzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgICAgIC8vIOS9v+eUqOWkmuS4quWfuuWHhuW5tOS7ve+8jOehruS/neimhuebluaJgOacieWPr+iDveeahOW5tOS7vVxuICAgICAgY29uc3QgYmFzZVllYXJzID0gWzEsIDYwMSwgMTIwMSwgMTgwMSwgMjQwMV07XG5cbiAgICAgIGZvciAoY29uc3QgYmFzZVllYXIgb2YgYmFzZVllYXJzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8g6I635Y+W5omA5pyJ5Y+v6IO955qE6Ziz5Y6G5pel5pyfXG4gICAgICAgICAgY29uc3Qgc29sYXJMaXN0ID0gU29sYXIuZnJvbUJhWmkoXG4gICAgICAgICAgICB5ZWFyU3RlbSArIHllYXJCcmFuY2gsXG4gICAgICAgICAgICBtb250aFN0ZW0gKyBtb250aEJyYW5jaCxcbiAgICAgICAgICAgIGRheVN0ZW0gKyBkYXlCcmFuY2gsXG4gICAgICAgICAgICBob3VyU3RlbSArIGhvdXJCcmFuY2gsXG4gICAgICAgICAgICBwYXJzZUludChzZWN0KSwgLy8g5rWB5rS+XG4gICAgICAgICAgICBiYXNlWWVhciAvLyDotbflp4vlubTku71cbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8g5o+Q5Y+W5bm05Lu9XG4gICAgICAgICAgZm9yIChjb25zdCBzb2xhciBvZiBzb2xhckxpc3QpIHtcbiAgICAgICAgICAgIGFsbFllYXJzLmFkZChzb2xhci5nZXRZZWFyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOiOt+WPluWMuemFjeW5tOS7veWHuumUmSAo5Z+65YeG5bm05Lu9ICR7YmFzZVllYXJ9KTpgLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyDovazmjaLkuLrmlbDnu4TlubbmjpLluo9cbiAgICAgIG1hdGNoaW5nWWVhcnMgPSBBcnJheS5mcm9tKGFsbFllYXJzKS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cbiAgICAgIGNvbnNvbGUubG9nKCfkvb/nlKhsdW5hci10eXBlc2NyaXB05bqT6I635Y+W5Yy56YWN5bm05Lu9OicsIG1hdGNoaW5nWWVhcnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfojrflj5bljLnphY3lubTku73lh7rplJk6JywgZXJyb3IpO1xuXG4gICAgICAvLyDlpoLmnpzlh7rplJnvvIzkvb/nlKjkvKDnu5/mlrnms5XkvZzkuLrlpIfpgIlcbiAgICAgIGNvbnNvbGUubG9nKCfkvb/nlKjkvKDnu5/mlrnms5XorqHnrpfljLnphY3lubTku70nKTtcblxuICAgICAgLy8g5aSp5bmy5bqP5Y+377yI55SyPTAsIOS5mT0xLCAuLi4sIOeZuD0577yJXG4gICAgICBjb25zdCBzdGVtSW5kZXggPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiLmluZGV4T2YoeWVhclN0ZW0pO1xuICAgICAgLy8g5Zyw5pSv5bqP5Y+377yI5a2QPTAsIOS4kT0xLCAuLi4sIOS6pT0xMe+8iVxuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiLmluZGV4T2YoeWVhckJyYW5jaCk7XG5cbiAgICAgIC8vIOiuoeeul+WMuemFjeeahOW5tOS7veWIl+ihqFxuICAgICAgY29uc3QgY3VycmVudFllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7XG4gICAgICBjb25zdCBzdGFydFllYXIgPSAxNzAwOyAvLyDku44xNzAw5bm05byA5aeL5p+l5om+77yM56Gu5L+d6KaG55uWMTdYWC0xOVhY5bm0XG4gICAgICBjb25zdCBlbmRZZWFyID0gY3VycmVudFllYXIgKyAxMjA7ICAgLy8g5p+l5om+5YiwMTIw5bm05ZCO77yIMuS4queUsuWtkO+8iVxuXG4gICAgICAvLyDmn6Xmib7nrKblkIjlubTmn7HnmoTlubTku71cbiAgICAgIGZvciAobGV0IHllYXIgPSBzdGFydFllYXI7IHllYXIgPD0gZW5kWWVhcjsgeWVhcisrKSB7XG4gICAgICAgIC8vIOiuoeeul+WkqeW5suW6j+WPt++8muW5tOS7veWHj+WOuzTvvIzpmaTku6UxMOeahOS9meaVsFxuICAgICAgICBjb25zdCBzdGVtQ2hlY2sgPSAoeWVhciAtIDQpICUgMTA7XG4gICAgICAgIC8vIOiuoeeul+WcsOaUr+W6j+WPt++8muW5tOS7veWHj+WOuzTvvIzpmaTku6UxMueahOS9meaVsFxuICAgICAgICBjb25zdCBicmFuY2hDaGVjayA9ICh5ZWFyIC0gNCkgJSAxMjtcblxuICAgICAgICBpZiAoc3RlbUNoZWNrID09PSBzdGVtSW5kZXggJiYgYnJhbmNoQ2hlY2sgPT09IGJyYW5jaEluZGV4KSB7XG4gICAgICAgICAgbWF0Y2hpbmdZZWFycy5wdXNoKHllYXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5oyH5a6a5LqG5bm05Lu977yM5bCd6K+V5L2/55So5oyH5a6a55qE5bm05Lu96L+b6KGM5pel5pyf5o6o566XXG4gICAgaWYgKHNwZWNpZmllZFllYXIgJiYgbWF0Y2hpbmdZZWFycy5pbmNsdWRlcyhzcGVjaWZpZWRZZWFyKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5L2/55SobHVuYXItdHlwZXNjcmlwdOW6k+eahFNvbGFyLmZyb21CYVpp5pa55rOV5Y+N5o6o5pel5pyfXG4gICAgICAgIC8vIOi/meS4quaWueazleWPr+iDvei/lOWbnuWkmuS4quWMuemFjeeahOaXpeacn1xuICAgICAgICBjb25zdCBzb2xhckxpc3QgPSBTb2xhci5mcm9tQmFaaShcbiAgICAgICAgICB5ZWFyU3RlbSArIHllYXJCcmFuY2gsXG4gICAgICAgICAgbW9udGhTdGVtICsgbW9udGhCcmFuY2gsXG4gICAgICAgICAgZGF5U3RlbSArIGRheUJyYW5jaCxcbiAgICAgICAgICBob3VyU3RlbSArIGhvdXJCcmFuY2gsXG4gICAgICAgICAgcGFyc2VJbnQoc2VjdCksIC8vIOa1gea0vlxuICAgICAgICAgIDEgLy8g6LW35aeL5bm05Lu96K6+5Li6Me+8jOehruS/neiDveaJvuWIsOaJgOacieWPr+iDveeahOaXpeacn1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIOaJvuWIsOaMh+WumuW5tOS7veeahOaXpeacn1xuICAgICAgICBsZXQgbWF0Y2hpbmdTb2xhcjogU29sYXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHNvbGFyTGlzdCkge1xuICAgICAgICAgIGlmIChzLmdldFllYXIoKSA9PT0gc3BlY2lmaWVkWWVhcikge1xuICAgICAgICAgICAgbWF0Y2hpbmdTb2xhciA9IHM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzmib7liLDljLnphY3nmoTml6XmnJ9cbiAgICAgICAgaWYgKG1hdGNoaW5nU29sYXIpIHtcbiAgICAgICAgICBzb2xhciA9IG1hdGNoaW5nU29sYXI7XG4gICAgICAgICAgbHVuYXIgPSBtYXRjaGluZ1NvbGFyLmdldEx1bmFyKCk7XG4gICAgICAgICAgZWlnaHRDaGFyID0gbHVuYXIuZ2V0RWlnaHRDaGFyKCk7XG5cbiAgICAgICAgICAvLyDmoLzlvI/ljJbml6XmnJ9cbiAgICAgICAgICBzb2xhckRhdGUgPSBgJHttYXRjaGluZ1NvbGFyLmdldFllYXIoKX0tJHttYXRjaGluZ1NvbGFyLmdldE1vbnRoKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfS0ke21hdGNoaW5nU29sYXIuZ2V0RGF5KCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gICAgICAgICAgbHVuYXJEYXRlID0gbHVuYXIudG9TdHJpbmcoKTtcbiAgICAgICAgICBzb2xhclRpbWUgPSBgJHttYXRjaGluZ1NvbGFyLmdldEhvdXIoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bWF0Y2hpbmdTb2xhci5nZXRNaW51dGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YDtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCfml6XmnJ/lj43mjqjmiJDlip8gLSDmjIflrprlubTku706Jywgc3BlY2lmaWVkWWVhcik7XG4gICAgICAgICAgY29uc29sZS5sb2coJ+aXpeacn+WPjeaOqOe7k+aenCAtIOmYs+WOhuaXpeacnzonLCBzb2xhckRhdGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfml6XmnJ/lj43mjqjnu5PmnpwgLSDlhpzljobml6XmnJ86JywgbHVuYXJEYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn5pel5pyf5Y+N5o6o5aSx6LSlIC0g5pyq5om+5Yiw5oyH5a6a5bm05Lu955qE5Yy56YWN5pel5pyfJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aXpeacn+aOqOeul+WHuumUmTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5pyJ5oyH5a6a5bm05Lu95LiU5oiQ5Yqf5o6o566X5pel5pyf77yM5L2/55SobHVuYXItdHlwZXNjcmlwdOW6k+iOt+WPluabtOWkmuS/oeaBr1xuICAgIGlmIChzcGVjaWZpZWRZZWFyICYmIHNvbGFyICYmIGx1bmFyICYmIGVpZ2h0Q2hhcikge1xuICAgICAgLy8g5L2/55SoZm9ybWF0QmF6aUluZm/ojrflj5blrozmlbTnmoTlhavlrZfkv6Hmga/vvIzkvYblj6rojrflj5bml6XmnJ/jgIHlpKfov5DjgIHmtYHlubTnrYnkv6Hmga9cbiAgICAgIGNvbnN0IGJhemlJbmZvID0gdGhpcy5mb3JtYXRCYXppSW5mbyhzb2xhciwgbHVuYXIsIGVpZ2h0Q2hhciwgZ2VuZGVyLCBzZWN0KTtcblxuICAgICAgLy8g5L2/55So55So5oi36L6T5YWl55qE5Y6f5aeL5YWr5a2X5L+h5oGv77yM6ICM5LiN5piv5Y+N5o6o5ZCO55qE5YWr5a2XXG4gICAgICAvLyDlubTmn7FcbiAgICAgIGJhemlJbmZvLnllYXJQaWxsYXIgPSBwYXJ0c1swXTtcbiAgICAgIGJhemlJbmZvLnllYXJTdGVtID0geWVhclN0ZW07XG4gICAgICBiYXppSW5mby55ZWFyQnJhbmNoID0geWVhckJyYW5jaDtcbiAgICAgIGJhemlJbmZvLnllYXJIaWRlR2FuID0gdGhpcy5nZXRIaWRlR2FuKHllYXJCcmFuY2gpO1xuICAgICAgYmF6aUluZm8ueWVhcld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh5ZWFyU3RlbSk7XG4gICAgICBiYXppSW5mby55ZWFyTmFZaW4gPSB0aGlzLmdldE5hWWluKHllYXJTdGVtICsgeWVhckJyYW5jaCk7XG4gICAgICBiYXppSW5mby55ZWFyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oeWVhckJyYW5jaCk7XG4gICAgICBiYXppSW5mby55ZWFyU2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSk7XG4gICAgICBiYXppSW5mby55ZWFyU2hpU2hlblpoaSA9IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtLCB5ZWFyQnJhbmNoKTtcblxuICAgICAgLy8g5pyI5p+xXG4gICAgICBiYXppSW5mby5tb250aFBpbGxhciA9IHBhcnRzWzFdO1xuICAgICAgYmF6aUluZm8ubW9udGhTdGVtID0gbW9udGhTdGVtO1xuICAgICAgYmF6aUluZm8ubW9udGhCcmFuY2ggPSBtb250aEJyYW5jaDtcbiAgICAgIGJhemlJbmZvLm1vbnRoSGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbihtb250aEJyYW5jaCk7XG4gICAgICBiYXppSW5mby5tb250aFd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhtb250aFN0ZW0pO1xuICAgICAgYmF6aUluZm8ubW9udGhOYVlpbiA9IHRoaXMuZ2V0TmFZaW4obW9udGhTdGVtICsgbW9udGhCcmFuY2gpO1xuICAgICAgYmF6aUluZm8ubW9udGhTaGVuZ1hpYW8gPSB0aGlzLmdldFNoZW5nWGlhbyhtb250aEJyYW5jaCk7XG4gICAgICBiYXppSW5mby5tb250aFNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKTtcbiAgICAgIGJhemlJbmZvLm1vbnRoU2hpU2hlblpoaSA9IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtLCBtb250aEJyYW5jaCk7XG5cbiAgICAgIC8vIOaXpeafsVxuICAgICAgYmF6aUluZm8uZGF5UGlsbGFyID0gcGFydHNbMl07XG4gICAgICBiYXppSW5mby5kYXlTdGVtID0gZGF5U3RlbTtcbiAgICAgIGJhemlJbmZvLmRheUJyYW5jaCA9IGRheUJyYW5jaDtcbiAgICAgIGJhemlJbmZvLmRheUhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4oZGF5QnJhbmNoKTtcbiAgICAgIGJhemlJbmZvLmRheVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhkYXlTdGVtKTtcbiAgICAgIGJhemlJbmZvLmRheU5hWWluID0gdGhpcy5nZXROYVlpbihkYXlTdGVtICsgZGF5QnJhbmNoKTtcbiAgICAgIGJhemlJbmZvLmRheVNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKGRheUJyYW5jaCk7XG4gICAgICBiYXppSW5mby5kYXlTaGlTaGVuID0gJ+aXpeS4uyc7IC8vIOaXpeafseWkqeW5suaYr+aXpeS4u+iHquW3sVxuICAgICAgYmF6aUluZm8uZGF5U2hpU2hlblpoaSA9IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtLCBkYXlCcmFuY2gpO1xuXG4gICAgICAvLyDml7bmn7FcbiAgICAgIGJhemlJbmZvLmhvdXJQaWxsYXIgPSBwYXJ0c1szXTtcbiAgICAgIGJhemlJbmZvLmhvdXJTdGVtID0gaG91clN0ZW07XG4gICAgICBiYXppSW5mby5ob3VyQnJhbmNoID0gaG91ckJyYW5jaDtcbiAgICAgIGJhemlJbmZvLmhvdXJIaWRlR2FuID0gdGhpcy5nZXRIaWRlR2FuKGhvdXJCcmFuY2gpO1xuICAgICAgYmF6aUluZm8uaG91cld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhob3VyU3RlbSk7XG4gICAgICBiYXppSW5mby5ob3VyTmFZaW4gPSB0aGlzLmdldE5hWWluKGhvdXJTdGVtICsgaG91ckJyYW5jaCk7XG4gICAgICBiYXppSW5mby5ob3VyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oaG91ckJyYW5jaCk7XG4gICAgICBiYXppSW5mby5ob3VyU2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBob3VyU3RlbSk7XG4gICAgICBiYXppSW5mby5ob3VyU2hpU2hlblpoaSA9IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtLCBob3VyQnJhbmNoKTtcblxuICAgICAgLy8g54m55q6K5L+h5oGvXG4gICAgICBiYXppSW5mby50YWlZdWFuID0gdGhpcy5jYWxjdWxhdGVUYWlZdWFuKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpO1xuICAgICAgYmF6aUluZm8udGFpWXVhbk5hWWluID0gdGhpcy5nZXROYVlpbihiYXppSW5mby50YWlZdWFuKTtcbiAgICAgIGJhemlJbmZvLm1pbmdHb25nID0gdGhpcy5jYWxjdWxhdGVNaW5nR29uZyhob3VyU3RlbSwgaG91ckJyYW5jaCk7XG4gICAgICBiYXppSW5mby5taW5nR29uZ05hWWluID0gdGhpcy5nZXROYVlpbihiYXppSW5mby5taW5nR29uZyk7XG5cbiAgICAgIC8vIOajgOafpeS4ieWQiOWxgOWSjOS4ieS8muWxgFxuICAgICAgY29uc3QgYnJhbmNoZXMgPSBbeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgaG91ckJyYW5jaF07XG4gICAgICBiYXppSW5mby5zYW5IZUp1ID0gdGhpcy5jaGVja1NhbkhlSnUoYnJhbmNoZXMpO1xuICAgICAgYmF6aUluZm8uc2FuSHVpSnUgPSB0aGlzLmNoZWNrU2FuSHVpSnUoYnJhbmNoZXMpO1xuXG4gICAgICAvLyDmt7vliqDljLnphY3lubTku73liJfooahcbiAgICAgIGJhemlJbmZvLm1hdGNoaW5nWWVhcnMgPSBtYXRjaGluZ1llYXJzO1xuXG4gICAgICAvLyDlrozmlbTkv6Hmga9cbiAgICAgIGJhemlJbmZvLmZ1bGxTdHJpbmcgPSBg5YWr5a2X77yaJHtwYXJ0c1swXX0gJHtwYXJ0c1sxXX0gJHtwYXJ0c1syXX0gJHtwYXJ0c1szXX1gO1xuXG4gICAgICByZXR1cm4gYmF6aUluZm87XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5rKh5pyJ5oyH5a6a5bm05Lu95oiW6ICF5pel5pyf5o6o566X5aSx6LSl77yM5L2/55So5Lyg57uf5pa55rOV6K6h566X5Z+65pys5L+h5oGvXG4gICAgLy8g6K6h566X54m55q6K5L+h5oGvXG4gICAgY29uc3QgdGFpWXVhbiA9IHRoaXMuY2FsY3VsYXRlVGFpWXVhbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKTtcbiAgICBjb25zdCB0YWlZdWFuTmFZaW4gPSB0aGlzLmdldE5hWWluKHRhaVl1YW4pO1xuICAgIGNvbnN0IG1pbmdHb25nID0gdGhpcy5jYWxjdWxhdGVNaW5nR29uZyhob3VyU3RlbSwgaG91ckJyYW5jaCk7XG4gICAgY29uc3QgbWluZ0dvbmdOYVlpbiA9IHRoaXMuZ2V0TmFZaW4obWluZ0dvbmcpO1xuXG4gICAgLy8g55Sf6IKW5L+h5oGvXG4gICAgY29uc3QgeWVhclNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKHllYXJCcmFuY2gpO1xuICAgIGNvbnN0IG1vbnRoU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8obW9udGhCcmFuY2gpO1xuICAgIGNvbnN0IGRheVNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKGRheUJyYW5jaCk7XG4gICAgY29uc3QgaG91clNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKGhvdXJCcmFuY2gpO1xuXG4gICAgLy8g5Yib5bu65LiA5Liq5Z+65pys55qEQmF6aUluZm/lr7nosaFcbiAgICAvLyDorqHnrpfljYHnpZ7kv6Hmga8gLSDku6Xml6XlubLkuLrln7rlh4ZcbiAgICBjb25zdCB5ZWFyU2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSk7XG4gICAgY29uc3QgeWVhclNoaVNoZW5aaGkgPSB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgeWVhckJyYW5jaCk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuR2FuID0gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIG1vbnRoU3RlbSk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKGRheVN0ZW0sIG1vbnRoQnJhbmNoKTtcbiAgICBjb25zdCBkYXlTaGlTaGVuID0gJ+aXpeS4uyc7IC8vIOaXpeafseWkqeW5suaYr+aXpeS4u+iHquW3sVxuICAgIGNvbnN0IGRheVNoaVNoZW5aaGkgPSB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgZGF5QnJhbmNoKTtcbiAgICBjb25zdCBob3VyU2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBob3VyU3RlbSk7XG4gICAgY29uc3QgaG91clNoaVNoZW5aaGkgPSB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgaG91ckJyYW5jaCk7XG5cbiAgICAvLyDmo4Dmn6XkuInlkIjlsYDlkozkuInkvJrlsYBcbiAgICBjb25zdCBicmFuY2hlcyA9IFt5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCBob3VyQnJhbmNoXTtcbiAgICBjb25zdCBzYW5IZUp1ID0gdGhpcy5jaGVja1NhbkhlSnUoYnJhbmNoZXMpO1xuICAgIGNvbnN0IHNhbkh1aUp1ID0gdGhpcy5jaGVja1Nhbkh1aUp1KGJyYW5jaGVzKTtcblxuICAgIHJldHVybiB7XG4gICAgICAvLyDln7rmnKzkv6Hmga9cbiAgICAgIHNvbGFyRGF0ZSxcbiAgICAgIGx1bmFyRGF0ZSxcbiAgICAgIHNvbGFyVGltZSxcbiAgICAgIG1hdGNoaW5nWWVhcnMsIC8vIOa3u+WKoOWMuemFjeW5tOS7veWIl+ihqFxuXG4gICAgICAvLyDlhavlrZfkv6Hmga9cbiAgICAgIHllYXJQaWxsYXI6IHBhcnRzWzBdLFxuICAgICAgeWVhclN0ZW0sXG4gICAgICB5ZWFyQnJhbmNoLFxuICAgICAgeWVhckhpZGVHYW46IHRoaXMuZ2V0SGlkZUdhbih5ZWFyQnJhbmNoKSxcbiAgICAgIHllYXJXdVhpbmcsXG4gICAgICB5ZWFyTmFZaW4sXG4gICAgICB5ZWFyU2hlbmdYaWFvLFxuICAgICAgeWVhclNoaVNoZW5HYW4sXG4gICAgICB5ZWFyU2hpU2hlblpoaSxcblxuICAgICAgbW9udGhQaWxsYXI6IHBhcnRzWzFdLFxuICAgICAgbW9udGhTdGVtLFxuICAgICAgbW9udGhCcmFuY2gsXG4gICAgICBtb250aEhpZGVHYW46IHRoaXMuZ2V0SGlkZUdhbihtb250aEJyYW5jaCksXG4gICAgICBtb250aFd1WGluZyxcbiAgICAgIG1vbnRoTmFZaW4sXG4gICAgICBtb250aFNoZW5nWGlhbyxcbiAgICAgIG1vbnRoU2hpU2hlbkdhbixcbiAgICAgIG1vbnRoU2hpU2hlblpoaSxcblxuICAgICAgZGF5UGlsbGFyOiBwYXJ0c1syXSxcbiAgICAgIGRheVN0ZW0sXG4gICAgICBkYXlCcmFuY2gsXG4gICAgICBkYXlIaWRlR2FuOiB0aGlzLmdldEhpZGVHYW4oZGF5QnJhbmNoKSxcbiAgICAgIGRheVd1WGluZyxcbiAgICAgIGRheU5hWWluLFxuICAgICAgZGF5U2hlbmdYaWFvLFxuICAgICAgZGF5U2hpU2hlbixcbiAgICAgIGRheVNoaVNoZW5aaGksXG5cbiAgICAgIGhvdXJQaWxsYXI6IHBhcnRzWzNdLFxuICAgICAgaG91clN0ZW0sXG4gICAgICBob3VyQnJhbmNoLFxuICAgICAgaG91ckhpZGVHYW46IHRoaXMuZ2V0SGlkZUdhbihob3VyQnJhbmNoKSxcbiAgICAgIGhvdXJXdVhpbmcsXG4gICAgICBob3VyTmFZaW4sXG4gICAgICBob3VyU2hlbmdYaWFvLFxuICAgICAgaG91clNoaVNoZW5HYW4sXG4gICAgICBob3VyU2hpU2hlblpoaSxcblxuICAgICAgLy8g54m55q6K5L+h5oGvXG4gICAgICB0YWlZdWFuLFxuICAgICAgdGFpWXVhbk5hWWluLFxuICAgICAgbWluZ0dvbmcsXG4gICAgICBtaW5nR29uZ05hWWluLFxuXG4gICAgICAvLyDlrozmlbTkv6Hmga9cbiAgICAgIGZ1bGxTdHJpbmc6IGDlhavlrZfvvJoke3BhcnRzWzBdfSAke3BhcnRzWzFdfSAke3BhcnRzWzJdfSAke3BhcnRzWzNdfWAsXG5cbiAgICAgIC8vIOe7hOWQiOS/oeaBr1xuICAgICAgc2FuSGVKdSxcbiAgICAgIHNhbkh1aUp1LFxuXG4gICAgICAvLyDorr7nva7kv6Hmga9cbiAgICAgIGdlbmRlcixcbiAgICAgIGJhemlTZWN0OiBzZWN0XG4gICAgfTtcbiAgfVxuICAvKipcbiAgICog6K6h566X6IOO5YWDXG4gICAqIEBwYXJhbSBtb250aFN0ZW0g5pyI5bmyXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHJldHVybnMg6IOO5YWD5bmy5pSvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVUYWlZdWFuKG1vbnRoU3RlbTogc3RyaW5nLCBtb250aEJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpKnlubLpobrluo9cbiAgICBjb25zdCBzdGVtcyA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCI7XG4gICAgLy8g5Zyw5pSv6aG65bqPXG4gICAgY29uc3QgYnJhbmNoZXMgPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiO1xuXG4gICAgLy8g6K6h566X5pyI5bmy55qE57Si5byVXG4gICAgY29uc3Qgc3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihtb250aFN0ZW0pO1xuICAgIC8vIOiuoeeul+aciOaUr+eahOe0ouW8lVxuICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gYnJhbmNoZXMuaW5kZXhPZihtb250aEJyYW5jaCk7XG5cbiAgICBpZiAoc3RlbUluZGV4ID09PSAtMSB8fCBicmFuY2hJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIuacquefpVwiO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+iDjuWFg+W5su+8iOaciOW5siArIDXvvIzotoXov4cxMOWImeWHjzEw77yJXG4gICAgY29uc3QgdGFpWXVhblN0ZW1JbmRleCA9IChzdGVtSW5kZXggKyA1KSAlIDEwO1xuICAgIC8vIOiuoeeul+iDjuWFg+aUr++8iOaciOaUryArIDPvvIzotoXov4cxMuWImeWHjzEy77yJXG4gICAgY29uc3QgdGFpWXVhbkJyYW5jaEluZGV4ID0gKGJyYW5jaEluZGV4ICsgMykgJSAxMjtcblxuICAgIC8vIOe7hOWQiOiDjuWFg+W5suaUr1xuICAgIHJldHVybiBzdGVtc1t0YWlZdWFuU3RlbUluZGV4XSArIGJyYW5jaGVzW3RhaVl1YW5CcmFuY2hJbmRleF07XG4gIH1cblxuICAvKipcbiAgICog6K6h566X5ZG95a6rXG4gICAqIEBwYXJhbSBob3VyU3RlbSDml7blubJcbiAgICogQHBhcmFtIGhvdXJCcmFuY2gg5pe25pSvXG4gICAqIEByZXR1cm5zIOWRveWuq+W5suaUr1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlTWluZ0dvbmcoaG91clN0ZW06IHN0cmluZywgaG91ckJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpKnlubLpobrluo9cbiAgICBjb25zdCBzdGVtcyA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCI7XG4gICAgLy8g5Zyw5pSv6aG65bqPXG4gICAgY29uc3QgYnJhbmNoZXMgPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiO1xuXG4gICAgLy8g6K6h566X5pe25bmy55qE57Si5byVXG4gICAgY29uc3Qgc3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihob3VyU3RlbSk7XG4gICAgLy8g6K6h566X5pe25pSv55qE57Si5byVXG4gICAgY29uc3QgYnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKGhvdXJCcmFuY2gpO1xuXG4gICAgaWYgKHN0ZW1JbmRleCA9PT0gLTEgfHwgYnJhbmNoSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCLmnKrnn6VcIjtcbiAgICB9XG5cbiAgICAvLyDorqHnrpflkb3lrqvlubLvvIjml7blubIgKyA377yM6LaF6L+HMTDliJnlh48xMO+8iVxuICAgIGNvbnN0IG1pbmdHb25nU3RlbUluZGV4ID0gKHN0ZW1JbmRleCArIDcpICUgMTA7XG4gICAgLy8g6K6h566X5ZG95a6r5pSv77yI5pe25pSvICsgMe+8jOi2hei/hzEy5YiZ5YePMTLvvIlcbiAgICBjb25zdCBtaW5nR29uZ0JyYW5jaEluZGV4ID0gKGJyYW5jaEluZGV4ICsgMSkgJSAxMjtcblxuICAgIC8vIOe7hOWQiOWRveWuq+W5suaUr1xuICAgIHJldHVybiBzdGVtc1ttaW5nR29uZ1N0ZW1JbmRleF0gKyBicmFuY2hlc1ttaW5nR29uZ0JyYW5jaEluZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blpKnlubLlr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U3RlbVd1WGluZyhzdGVtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn55SyJzogJ+acqCcsXG4gICAgICAn5LmZJzogJ+acqCcsXG4gICAgICAn5LiZJzogJ+eBqycsXG4gICAgICAn5LiBJzogJ+eBqycsXG4gICAgICAn5oiKJzogJ+WcnycsXG4gICAgICAn5bexJzogJ+WcnycsXG4gICAgICAn5bqaJzogJ+mHkScsXG4gICAgICAn6L6bJzogJ+mHkScsXG4gICAgICAn5aOsJzogJ+awtCcsXG4gICAgICAn55m4JzogJ+awtCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFtzdGVtXSB8fCAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/ol4/lubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg6JeP5bmy5a2X56ym5LiyXG4gICAqL1xuICBzdGF0aWMgZ2V0SGlkZUdhbihicmFuY2g6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5qOA5p+l5Zyw5pSv5piv5ZCm5pyJ5pWIXG4gICAgaWYgKCFicmFuY2gpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WtkCc6ICfnmbgnLFxuICAgICAgJ+S4kSc6ICflt7Es55m4LOi+mycsXG4gICAgICAn5a+FJzogJ+eUsizkuJks5oiKJyxcbiAgICAgICflja8nOiAn5LmZJyxcbiAgICAgICfovrAnOiAn5oiKLOS5mSznmbgnLFxuICAgICAgJ+W3syc6ICfkuJks5bqaLOaIiicsXG4gICAgICAn5Y2IJzogJ+S4gSzlt7EnLFxuICAgICAgJ+acqic6ICflt7Es5LiBLOS5mScsXG4gICAgICAn55SzJzogJ+W6mizlo6ws5oiKJyxcbiAgICAgICfphYknOiAn6L6bJyxcbiAgICAgICfmiIwnOiAn5oiKLOi+myzkuIEnLFxuICAgICAgJ+S6pSc6ICflo6ws55SyJ1xuICAgIH07XG5cbiAgICByZXR1cm4gbWFwW2JyYW5jaF0gfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5pyI5pel6I635Y+W5pif5bqnXG4gICAqIEBwYXJhbSBtb250aCDmnIjku73vvIgxLTEy77yJXG4gICAqIEBwYXJhbSBkYXkg5pel5pyf77yIMS0zMe+8iVxuICAgKiBAcmV0dXJucyDmmJ/luqflkI3np7BcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFpvZGlhYyhtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0ZXMgPSBbMjAsIDE5LCAyMSwgMjAsIDIxLCAyMiwgMjMsIDIzLCAyMywgMjQsIDIzLCAyMl07XG4gICAgY29uc3Qgc2lnbnMgPSBbXG4gICAgICBcIuawtOeTtuW6p1wiLCBcIuWPjOmxvOW6p1wiLCBcIueZvee+iuW6p1wiLCBcIumHkeeJm+W6p1wiLCBcIuWPjOWtkOW6p1wiLCBcIuW3qOifueW6p1wiLFxuICAgICAgXCLni67lrZDluqdcIiwgXCLlpITlpbPluqdcIiwgXCLlpKnnp6TluqdcIiwgXCLlpKnonY7luqdcIiwgXCLlsITmiYvluqdcIiwgXCLmkannvq/luqdcIlxuICAgIF07XG5cbiAgICAvLyDmnIjku73ku44x5byA5aeL77yM57Si5byV5LuOMOW8gOWni++8jOmcgOimgeWHjzFcbiAgICBjb25zdCBtb250aEluZGV4ID0gbW9udGggLSAxO1xuXG4gICAgLy8g5aaC5p6c5pel5pyf5aSn5LqO562J5LqO6K+l5pyI5a+55bqU55qE5pel5pyf77yM5YiZ5pif5bqn5Li65b2T5pyI5pif5bqn77yM5ZCm5YiZ5Li65YmN5LiA5Liq5pyI55qE5pif5bqnXG4gICAgcmV0dXJuIGRheSA8IGRhdGVzW21vbnRoSW5kZXhdID8gc2lnbnNbbW9udGhJbmRleF0gOiBzaWduc1sobW9udGhJbmRleCArIDEpICUgMTJdO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+aXrOepulxuICAgKiBAcGFyYW0gZ2FuIOWkqeW5slxuICAgKiBAcGFyYW0gemhpIOWcsOaUr1xuICAgKiBAcmV0dXJucyDml6znqbpcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVh1bktvbmcoZ2FuOiBzdHJpbmcsIHpoaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpKnlubLluo/lj7fvvIjnlLI9MCwg5LmZPTEsIC4uLiwg55m4PTnvvIlcbiAgICBjb25zdCBnYW5JbmRleCA9IFwi55Sy5LmZ5LiZ5LiB5oiK5bex5bqa6L6b5aOs55m4XCIuaW5kZXhPZihnYW4pO1xuICAgIC8vIOWcsOaUr+W6j+WPt++8iOWtkD0wLCDkuJE9MSwgLi4uLCDkuqU9MTHvvIlcbiAgICBjb25zdCB6aGlJbmRleCA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuaW5kZXhPZih6aGkpO1xuXG4gICAgaWYgKGdhbkluZGV4IDwgMCB8fCB6aGlJbmRleCA8IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyDorqHnrpfml6zpppZcbiAgICBjb25zdCB4dW5TaG91SW5kZXggPSBNYXRoLmZsb29yKGdhbkluZGV4IC8gMikgKiAyO1xuXG4gICAgLy8g6K6h566X5pes56m65Zyw5pSvXG4gICAgY29uc3QgeHVuS29uZ0luZGV4MSA9ICh4dW5TaG91SW5kZXggKyAxMCkgJSAxMjtcbiAgICBjb25zdCB4dW5Lb25nSW5kZXgyID0gKHh1blNob3VJbmRleCArIDExKSAlIDEyO1xuXG4gICAgLy8g6I635Y+W5pes56m65Zyw5pSvXG4gICAgY29uc3QgeHVuS29uZ1poaTEgPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiLmNoYXJBdCh4dW5Lb25nSW5kZXgxKTtcbiAgICBjb25zdCB4dW5Lb25nWmhpMiA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuY2hhckF0KHh1bktvbmdJbmRleDIpO1xuXG4gICAgcmV0dXJuIHh1bktvbmdaaGkxICsgeHVuS29uZ1poaTI7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W57qz6Z+zXG4gICAqIEBwYXJhbSBneiDlubLmlK9cbiAgICogQHJldHVybnMg57qz6Z+zXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXROYVlpbihnejogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsuWtkCc6ICfmtbfkuK3ph5EnLCAn5LmZ5LiRJzogJ+a1t+S4remHkScsXG4gICAgICAn5LiZ5a+FJzogJ+eCieS4reeBqycsICfkuIHlja8nOiAn54KJ5Lit54GrJyxcbiAgICAgICfmiIrovrAnOiAn5aSn5p6X5pyoJywgJ+W3seW3syc6ICflpKfmnpfmnKgnLFxuICAgICAgJ+W6muWNiCc6ICfot6/ml4HlnJ8nLCAn6L6b5pyqJzogJ+i3r+aXgeWcnycsXG4gICAgICAn5aOs55SzJzogJ+WJkemUi+mHkScsICfnmbjphYknOiAn5YmR6ZSL6YeRJyxcbiAgICAgICfnlLLmiIwnOiAn5bGx5aS054GrJywgJ+S5meS6pSc6ICflsbHlpLTngasnLFxuICAgICAgJ+S4meWtkCc6ICfmtqfkuIvmsLQnLCAn5LiB5LiRJzogJ+a2p+S4i+awtCcsXG4gICAgICAn5oiK5a+FJzogJ+WfjuWktOWcnycsICflt7Hlja8nOiAn5Z+O5aS05ZyfJyxcbiAgICAgICfluprovrAnOiAn55m96Jyh6YeRJywgJ+i+m+W3syc6ICfnmb3onKHph5EnLFxuICAgICAgJ+WjrOWNiCc6ICfmnajmn7PmnKgnLCAn55m45pyqJzogJ+adqOafs+acqCcsXG4gICAgICAn55Sy55SzJzogJ+azieS4reawtCcsICfkuZnphYknOiAn5rOJ5Lit5rC0JyxcbiAgICAgICfkuJnmiIwnOiAn5bGL5LiK5ZyfJywgJ+S4geS6pSc6ICflsYvkuIrlnJ8nLFxuICAgICAgJ+aIiuWtkCc6ICfpnLnpm7PngasnLCAn5bex5LiRJzogJ+mcuembs+eBqycsXG4gICAgICAn5bqa5a+FJzogJ+advuafj+acqCcsICfovpvlja8nOiAn5p2+5p+P5pyoJyxcbiAgICAgICflo6zovrAnOiAn6ZW/5rWB5rC0JywgJ+eZuOW3syc6ICfplb/mtYHmsLQnLFxuICAgICAgJ+eUsuWNiCc6ICfnoILnn7Pph5EnLCAn5LmZ5pyqJzogJ+egguefs+mHkScsXG4gICAgICAn5LiZ55SzJzogJ+WxseS4i+eBqycsICfkuIHphYknOiAn5bGx5LiL54GrJyxcbiAgICAgICfmiIrmiIwnOiAn5bmz5Zyw5pyoJywgJ+W3seS6pSc6ICflubPlnLDmnKgnLFxuICAgICAgJ+W6muWtkCc6ICflo4HkuIrlnJ8nLCAn6L6b5LiRJzogJ+WjgeS4iuWcnycsXG4gICAgICAn5aOs5a+FJzogJ+mHkeiWhOmHkScsICfnmbjlja8nOiAn6YeR6JaE6YeRJyxcbiAgICAgICfnlLLovrAnOiAn6KaG54Gv54GrJywgJ+S5meW3syc6ICfopobnga/ngasnLFxuICAgICAgJ+S4meWNiCc6ICflpKnmsrPmsLQnLCAn5LiB5pyqJzogJ+Wkqeays+awtCcsXG4gICAgICAn5oiK55SzJzogJ+Wkp+mpv+WcnycsICflt7HphYknOiAn5aSn6am/5ZyfJyxcbiAgICAgICfluprmiIwnOiAn6ZKX546v6YeRJywgJ+i+m+S6pSc6ICfpkpfnjq/ph5EnLFxuICAgICAgJ+WjrOWtkCc6ICfmoZHmn5jmnKgnLCAn55m45LiRJzogJ+ahkeafmOacqCcsXG4gICAgICAn55Sy5a+FJzogJ+Wkp+a6quawtCcsICfkuZnlja8nOiAn5aSn5rqq5rC0JyxcbiAgICAgICfkuJnovrAnOiAn5rKZ5Lit5ZyfJywgJ+S4geW3syc6ICfmspnkuK3lnJ8nLFxuICAgICAgJ+aIiuWNiCc6ICflpKnkuIrngasnLCAn5bex5pyqJzogJ+WkqeS4iueBqycsXG4gICAgICAn5bqa55SzJzogJ+efs+amtOacqCcsICfovpvphYknOiAn55+z5qa05pyoJyxcbiAgICAgICflo6zmiIwnOiAn5aSn5rW35rC0JywgJ+eZuOS6pSc6ICflpKfmtbfmsLQnXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbZ3pdIHx8ICfmnKrnn6UnO1xuICB9XG5cblxuICAvKipcbiAgICog5qC85byP5YyW5YWr5a2X5L+h5oGvXG4gICAqIEBwYXJhbSBzb2xhciDpmLPljoblr7nosaFcbiAgICogQHBhcmFtIGx1bmFyIOWGnOWOhuWvueixoVxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcGFyYW0gZ2VuZGVyIOaAp+WIq++8iDEt55S377yMMC3lpbPvvIlcbiAgICogQHBhcmFtIHNlY3Qg5YWr5a2X5rWB5rS+77yIMeaIljLvvIlcbiAgICogQHJldHVybnMg5qC85byP5YyW5ZCO55qE5YWr5a2X5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBmb3JtYXRCYXppSW5mbyhzb2xhcjogU29sYXIsIGx1bmFyOiBMdW5hciwgZWlnaHRDaGFyOiBFaWdodENoYXIsIGdlbmRlcjogc3RyaW5nID0gJzEnLCBzZWN0OiBzdHJpbmcgPSAnMicpOiBCYXppSW5mbyB7XG4gICAgLy8g6K6+572u5YWr5a2X5rWB5rS+XG4gICAgZWlnaHRDaGFyLnNldFNlY3QocGFyc2VJbnQoc2VjdCkpO1xuXG4gICAgLy8g5YWI6I635Y+W5pel5bmy77yM5Zug5Li65Y2B56We6K6h566X6ZyA6KaB5Lul5pel5bmy5Li65Z+65YeGXG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcblxuICAgIC8vIOW5tOafsVxuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCB5ZWFyQnJhbmNoID0gZWlnaHRDaGFyLmdldFllYXJaaGkoKTtcbiAgICBjb25zdCB5ZWFyUGlsbGFyID0geWVhclN0ZW0gKyB5ZWFyQnJhbmNoO1xuICAgIC8vIOS9v+eUqOaIkeS7rOiHquW3seeahOiXj+W5suWumuS5ie+8jOiAjOS4jeaYr2x1bmFyLXR5cGVzY3JpcHTlupPnmoTlrprkuYlcbiAgICBjb25zdCB5ZWFySGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbih5ZWFyQnJhbmNoKTtcbiAgICBjb25zdCB5ZWFyV3VYaW5nID0gZWlnaHRDaGFyLmdldFllYXJXdVhpbmcoKTtcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSBlaWdodENoYXIuZ2V0WWVhck5hWWluKCk7XG4gICAgY29uc3QgeWVhclNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pO1xuICAgIGNvbnN0IHllYXJTaGlTaGVuWmhpID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKGRheVN0ZW0sIHllYXJCcmFuY2gpO1xuICAgIGNvbnN0IHllYXJEaVNoaSA9IGVpZ2h0Q2hhci5nZXRZZWFyRGlTaGkoKTtcblxuICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgIGxldCB5ZWFyWHVuS29uZyA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAvLyDlhYjojrflj5bml6zvvIzlho3ojrflj5bml6znqbpcbiAgICAgIGNvbnN0IHllYXJYdW4gPSBlaWdodENoYXIuZ2V0WWVhclh1bigpO1xuICAgICAgaWYgKHllYXJYdW4pIHtcbiAgICAgICAgeWVhclh1bktvbmcgPSBlaWdodENoYXIuZ2V0WWVhclh1bktvbmcoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCforqHnrpflubTmn7Hml6znqbrlh7rplJk6JywgZSk7XG4gICAgfVxuXG4gICAgLy8g5pyI5p+xXG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBtb250aFBpbGxhciA9IG1vbnRoU3RlbSArIG1vbnRoQnJhbmNoO1xuICAgIC8vIOS9v+eUqOaIkeS7rOiHquW3seeahOiXj+W5suWumuS5ie+8jOiAjOS4jeaYr2x1bmFyLXR5cGVzY3JpcHTlupPnmoTlrprkuYlcbiAgICBjb25zdCBtb250aEhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4obW9udGhCcmFuY2gpO1xuICAgIGNvbnN0IG1vbnRoV3VYaW5nID0gZWlnaHRDaGFyLmdldE1vbnRoV3VYaW5nKCk7XG4gICAgY29uc3QgbW9udGhOYVlpbiA9IGVpZ2h0Q2hhci5nZXRNb250aE5hWWluKCk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuR2FuID0gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIG1vbnRoU3RlbSk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKGRheVN0ZW0sIG1vbnRoQnJhbmNoKTtcbiAgICBjb25zdCBtb250aERpU2hpID0gZWlnaHRDaGFyLmdldE1vbnRoRGlTaGkoKTtcblxuICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgIGxldCBtb250aFh1bktvbmcgPSAnJztcbiAgICB0cnkge1xuICAgICAgLy8g5YWI6I635Y+W5pes77yM5YaN6I635Y+W5pes56m6XG4gICAgICBjb25zdCBtb250aFh1biA9IGVpZ2h0Q2hhci5nZXRNb250aFh1bigpO1xuICAgICAgaWYgKG1vbnRoWHVuKSB7XG4gICAgICAgIG1vbnRoWHVuS29uZyA9IGVpZ2h0Q2hhci5nZXRNb250aFh1bktvbmcoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCforqHnrpfmnIjmn7Hml6znqbrlh7rplJk6JywgZSk7XG4gICAgfVxuXG4gICAgLy8g5pel5p+xXG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IGRheVBpbGxhciA9IGRheVN0ZW0gKyBkYXlCcmFuY2g7XG4gICAgLy8g5L2/55So5oiR5Lus6Ieq5bex55qE6JeP5bmy5a6a5LmJ77yM6ICM5LiN5pivbHVuYXItdHlwZXNjcmlwdOW6k+eahOWumuS5iVxuICAgIGNvbnN0IGRheUhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4oZGF5QnJhbmNoKTtcbiAgICBjb25zdCBkYXlXdVhpbmcgPSBlaWdodENoYXIuZ2V0RGF5V3VYaW5nKCk7XG4gICAgY29uc3QgZGF5TmFZaW4gPSBlaWdodENoYXIuZ2V0RGF5TmFZaW4oKTtcbiAgICBjb25zdCBkYXlTaGlTaGVuWmhpID0gdGhpcy5nZXRIaWRkZW5TaGlTaGVuKGRheVN0ZW0sIGRheUJyYW5jaCk7XG4gICAgY29uc3QgZGF5RGlTaGkgPSBlaWdodENoYXIuZ2V0RGF5RGlTaGkoKTtcblxuICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgIGxldCBkYXlYdW5Lb25nID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIC8vIOWFiOiOt+WPluaXrO+8jOWGjeiOt+WPluaXrOepulxuICAgICAgY29uc3QgZGF5WHVuID0gZWlnaHRDaGFyLmdldERheVh1bigpO1xuICAgICAgaWYgKGRheVh1bikge1xuICAgICAgICBkYXlYdW5Lb25nID0gZWlnaHRDaGFyLmdldERheVh1bktvbmcoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCforqHnrpfml6Xmn7Hml6znqbrlh7rplJk6JywgZSk7XG4gICAgfVxuXG4gICAgLy8g5pe25p+xXG4gICAgY29uc3QgaG91clN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IGhvdXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuICAgIGNvbnN0IGhvdXJQaWxsYXIgPSBob3VyU3RlbSArIGhvdXJCcmFuY2g7XG4gICAgLy8g5L2/55So5oiR5Lus6Ieq5bex55qE6JeP5bmy5a6a5LmJ77yM6ICM5LiN5pivbHVuYXItdHlwZXNjcmlwdOW6k+eahOWumuS5iVxuICAgIGNvbnN0IGhvdXJIaWRlR2FuID0gdGhpcy5nZXRIaWRlR2FuKGhvdXJCcmFuY2gpO1xuICAgIGNvbnN0IGhvdXJXdVhpbmcgPSBlaWdodENoYXIuZ2V0VGltZVd1WGluZygpO1xuICAgIGNvbnN0IGhvdXJOYVlpbiA9IGVpZ2h0Q2hhci5nZXRUaW1lTmFZaW4oKTtcbiAgICBjb25zdCBob3VyU2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBob3VyU3RlbSk7XG4gICAgY29uc3QgaG91clNoaVNoZW5aaGkgPSB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgaG91ckJyYW5jaCk7XG4gICAgY29uc3QgdGltZURpU2hpID0gZWlnaHRDaGFyLmdldFRpbWVEaVNoaSgpO1xuXG4gICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgbGV0IHRpbWVYdW5Lb25nID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIC8vIOWFiOiOt+WPluaXrO+8jOWGjeiOt+WPluaXrOepulxuICAgICAgY29uc3QgdGltZVh1biA9IGVpZ2h0Q2hhci5nZXRUaW1lWHVuKCk7XG4gICAgICBpZiAodGltZVh1bikge1xuICAgICAgICB0aW1lWHVuS29uZyA9IGVpZ2h0Q2hhci5nZXRUaW1lWHVuS29uZygpO1xuICAgICAgfVxuXG4gICAgICAvLyDlpoLmnpzpgJrov4dBUEnojrflj5blpLHotKXvvIzliJnmiYvliqjorqHnrpdcbiAgICAgIGlmICghdGltZVh1bktvbmcpIHtcbiAgICAgICAgdGltZVh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoaG91clN0ZW0sIGhvdXJCcmFuY2gpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+aXtuafseaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIC8vIOWHuumUmeaXtuaJi+WKqOiuoeeul1xuICAgICAgdGltZVh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoaG91clN0ZW0sIGhvdXJCcmFuY2gpO1xuICAgIH1cblxuICAgIC8vIOeJueauiuS/oeaBr1xuICAgIGNvbnN0IHRhaVl1YW4gPSBlaWdodENoYXIuZ2V0VGFpWXVhbigpO1xuICAgIGNvbnN0IHRhaVl1YW5OYVlpbiA9IGVpZ2h0Q2hhci5nZXRUYWlZdWFuTmFZaW4oKTtcbiAgICBjb25zdCBtaW5nR29uZyA9IGVpZ2h0Q2hhci5nZXRNaW5nR29uZygpO1xuICAgIGNvbnN0IG1pbmdHb25nTmFZaW4gPSBlaWdodENoYXIuZ2V0TWluZ0dvbmdOYVlpbigpO1xuICAgIGNvbnN0IHNoZW5Hb25nID0gZWlnaHRDaGFyLmdldFNoZW5Hb25nKCk7XG5cbiAgICAvLyDml6XmnJ/kv6Hmga9cbiAgICBjb25zdCBzb2xhckRhdGUgPSBzb2xhci50b1ltZCgpO1xuICAgIGNvbnN0IGx1bmFyRGF0ZSA9IGx1bmFyLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc29sYXJUaW1lID0gc29sYXIuZ2V0SG91cigpICsgJzonICsgc29sYXIuZ2V0TWludXRlKCk7XG5cbiAgICAvLyDnlJ/ogpbkv6Hmga9cbiAgICBjb25zdCB5ZWFyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oeWVhckJyYW5jaCk7XG4gICAgY29uc3QgbW9udGhTaGVuZ1hpYW8gPSB0aGlzLmdldFNoZW5nWGlhbyhtb250aEJyYW5jaCk7XG4gICAgY29uc3QgZGF5U2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oZGF5QnJhbmNoKTtcbiAgICBjb25zdCBob3VyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oaG91ckJyYW5jaCk7XG5cbiAgICAvLyDljYHnpZ7kv6Hmga8gKOS7peaXpeW5suS4uuS4uylcbiAgICBjb25zdCB5ZWFyU2hpU2hlbiA9IHllYXJTaGlTaGVuR2FuO1xuICAgIGNvbnN0IG1vbnRoU2hpU2hlbiA9IG1vbnRoU2hpU2hlbkdhbjtcbiAgICBjb25zdCBkYXlTaGlTaGVuID0gJ+aXpeS4uyc7IC8vIOaXpeafseWkqeW5suaYr+aXpeS4u+iHquW3sVxuICAgIGNvbnN0IGhvdXJTaGlTaGVuID0gaG91clNoaVNoZW5HYW47XG5cbiAgICAvLyDmmJ/luqdcbiAgICBjb25zdCB6b2RpYWMgPSB0aGlzLmdldFpvZGlhYyhzb2xhci5nZXRNb250aCgpLCBzb2xhci5nZXREYXkoKSk7XG5cbiAgICAvLyDoioLmsJRcbiAgICBjb25zdCBqaWVRaSA9IHR5cGVvZiBsdW5hci5nZXRKaWVRaSgpID09PSAnc3RyaW5nJyA/IGx1bmFyLmdldEppZVFpKCkgOiAnJztcbiAgICBjb25zdCBuZXh0SmllUWkgPSB0eXBlb2YgbHVuYXIuZ2V0TmV4dEppZVFpKCkgPT09ICdzdHJpbmcnID8gbHVuYXIuZ2V0TmV4dEppZVFpKCkgOiAnJztcblxuICAgIC8vIOWQieWHtlxuICAgIGNvbnN0IGRheVlpID0gbHVuYXIuZ2V0RGF5WWkoKSB8fCBbXTtcbiAgICBjb25zdCBkYXlKaSA9IGx1bmFyLmdldERheUppKCkgfHwgW107XG5cbiAgICAvLyDnpZ7nhZ5cbiAgICBjb25zdCBkYXlTaGEgPSBBcnJheS5pc0FycmF5KGx1bmFyLmdldERheVNoYSgpKSA/IGx1bmFyLmdldERheVNoYSgpIDogW107XG4gICAgY29uc3Qgc2hlblNoYVJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU2hlblNoYShlaWdodENoYXIpO1xuICAgIGNvbnN0IHNoZW5TaGEgPSBbLi4uZGF5U2hhLCAuLi5zaGVuU2hhUmVzdWx0LnNoZW5TaGFdO1xuICAgIGNvbnN0IHllYXJTaGVuU2hhID0gc2hlblNoYVJlc3VsdC55ZWFyU2hlblNoYTtcbiAgICBjb25zdCBtb250aFNoZW5TaGEgPSBzaGVuU2hhUmVzdWx0Lm1vbnRoU2hlblNoYTtcbiAgICBjb25zdCBkYXlTaGVuU2hhID0gc2hlblNoYVJlc3VsdC5kYXlTaGVuU2hhO1xuICAgIGNvbnN0IGhvdXJTaGVuU2hhID0gc2hlblNoYVJlc3VsdC5ob3VyU2hlblNoYTtcblxuICAgIC8vIOagvOWxgFxuICAgIGNvbnN0IGdlSnVJbmZvID0gdGhpcy5jYWxjdWxhdGVHZUp1SW1wcm92ZWQoZWlnaHRDaGFyKTtcbiAgICBjb25zdCBnZUp1ID0gZ2VKdUluZm8/LmdlSnU7XG4gICAgY29uc3QgZ2VKdURldGFpbCA9IGdlSnVJbmZvPy5kZXRhaWw7XG4gICAgY29uc3QgZ2VKdVN0cmVuZ3RoID0gZ2VKdUluZm8/LmdlSnVTdHJlbmd0aDtcbiAgICBjb25zdCB5b25nU2hlbiA9IGdlSnVJbmZvPy55b25nU2hlbjtcbiAgICBjb25zdCB5b25nU2hlbkRldGFpbCA9IGdlSnVJbmZvPy55b25nU2hlbkRldGFpbDtcbiAgICBjb25zdCBnZUp1RmFjdG9ycyA9IGdlSnVJbmZvPy5nZUp1RmFjdG9ycztcblxuICAgIC8vIOi1t+i/kOS/oeaBr1xuICAgIGNvbnN0IGdlbmRlck51bSA9IGdlbmRlciA9PT0gJzEnID8gMSA6IDA7XG4gICAgY29uc3Qgc2VjdE51bSA9IHBhcnNlSW50KHNlY3QpO1xuICAgIGNvbnN0IHl1biA9IGVpZ2h0Q2hhci5nZXRZdW4oZ2VuZGVyTnVtLCBzZWN0TnVtKTtcbiAgICBjb25zdCBxaVl1blllYXIgPSB5dW4uZ2V0U3RhcnRZZWFyKCk7XG4gICAgY29uc3QgcWlZdW5Nb250aCA9IHl1bi5nZXRTdGFydE1vbnRoKCk7XG4gICAgY29uc3QgcWlZdW5EYXkgPSB5dW4uZ2V0U3RhcnREYXkoKTtcbiAgICBjb25zdCBxaVl1bkhvdXIgPSB5dW4uZ2V0U3RhcnRIb3VyKCk7XG4gICAgY29uc3QgcWlZdW5EYXRlID0geXVuLmdldFN0YXJ0U29sYXIoKS50b1ltZCgpO1xuICAgIGNvbnN0IHFpWXVuQWdlID0gcWlZdW5ZZWFyOyAvLyDnroDljJblpITnkIbvvIzlrp7pmYXlupTor6XorqHnrpfomZrlsoFcblxuICAgIC8vIOWkp+i/kOS/oeaBr1xuICAgIGNvbnN0IGRhWXVuQXJyID0geXVuLmdldERhWXVuKCk7XG4gICAgY29uc3QgZGFZdW4gPSBkYVl1bkFyci5tYXAoZHkgPT4ge1xuICAgICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgICBsZXQgeHVuS29uZyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5qOA5p+l5bmy5pSv5piv5ZCm5pyJ5pWIXG4gICAgICAgIGNvbnN0IGdhblpoaSA9IGR5LmdldEdhblpoaSgpO1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyDmiYvliqjorqHnrpfml6znqbrvvIzpgb/lhY3kvb/nlKjlj6/og73lh7rplJnnmoRnZXRYdW5Lb25n5pa55rOVXG4gICAgICAgICAgY29uc3QgZ2FuID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wkp+i/kOaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g5a6J5YWo5Zyw6I635Y+W5bGe5oCn77yM6Ziy5q2i56m65oyH6ZKI5byC5bi4XG4gICAgICBsZXQgc3RhcnRZZWFyID0gMCwgZW5kWWVhciA9IDAsIHN0YXJ0QWdlID0gMCwgZW5kQWdlID0gMCwgaW5kZXggPSAwLCBnYW5aaGkgPSAnJztcbiAgICAgIHRyeSB7IHN0YXJ0WWVhciA9IGR5LmdldFN0YXJ0WWVhcigpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOi1t+Wni+W5tOWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZW5kWWVhciA9IGR5LmdldEVuZFllYXIoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blpKfov5Dnu5PmnZ/lubTlh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IHN0YXJ0QWdlID0gZHkuZ2V0U3RhcnRBZ2UoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blpKfov5Dotbflp4vlubTpvoTlh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGVuZEFnZSA9IGR5LmdldEVuZEFnZSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOe7k+adn+W5tOm+hOWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgaW5kZXggPSBkeS5nZXRJbmRleCgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOW6j+WPt+WHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZ2FuWmhpID0gZHkuZ2V0R2FuWmhpKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5aSn6L+Q5bmy5pSv5Ye66ZSZOicsIGUpOyB9XG5cbiAgICAgIC8vIOiuoeeul+WNgeelnlxuICAgICAgbGV0IHNoaVNoZW5HYW4gPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBnYW5aaGkuY2hhckF0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpflpKfov5DljYHnpZ7lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+WcsOWKv1xuICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5aSn6L+Q5Zyw5Yq/5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpfnpZ7nhZ5cbiAgICAgIGNvbnN0IHNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHN0ZW0gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IGJyYW5jaCA9IGdhblpoaS5jaGFyQXQoMSk7XG5cbiAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICBjb25zb2xlLmxvZyhg6K6h566X5aSn6L+Q56We54WeIC0g57Si5byVOiAke2luZGV4fSwg5bmy5pSvOiAke2dhblpoaX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5aSn6L+Q56We54We6K6h566X5Y+C5pWwIC0g5pel5bmyOiAke2RheVN0ZW19LCDlubTmlK86ICR7eWVhckJyYW5jaH1gKTtcblxuICAgICAgICAgIC8vIOWkqeS5mei0teS6ulxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbllpR3VpUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5paH5piMXG4gICAgICAgICAgaWYgKHRoaXMuaXNXZW5DaGFuZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWNjuebllxuICAgICAgICAgIGlmICh0aGlzLmlzSHVhR2FpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g56aE56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNMdVNoZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnpoTnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmoYPoirFcbiAgICAgICAgICBpZiAodGhpcy5pc1Rhb0h1YShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWtpOi+sFxuICAgICAgICAgIGlmICh0aGlzLmlzR3VDaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5a+h5a6/XG4gICAgICAgICAgaWYgKHRoaXMuaXNHdWFTdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WvoeWuvycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmpv+mprFxuICAgICAgICAgIGlmICh0aGlzLmlzWWlNYShicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWwhuaYn1xuICAgICAgICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6YeR56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaW5TaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn6YeR56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrflkIhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZUhlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5pyI5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNZdWVEZShzdGVtKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljLtcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWWnFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g57qi6ImzXG4gICAgICAgICAgaWYgKHRoaXMuaXNIb25nWWFuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp572XXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuTHVvKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw572RXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaVdhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnvorliINcbiAgICAgICAgICBpZiAodGhpcy5pc1lhbmdSZW4oZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnqbpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5Lb25nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw5YqrXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaUppZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WcsOWKqycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWIkVxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlk61cbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5LdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeiZmlxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblh1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5ZK45rGgXG4gICAgICAgICAgaWYgKHRoaXMuaXNYaWFuQ2hpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Lqh56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNXYW5nU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWKq+eFnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmllU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g54G+54WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNaYWlTaGEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wkp+i/kOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICBjb25zb2xlLmxvZyhg5aSn6L+Q6L+U5Zue5pWw5o2uIC0g57Si5byVOiAke2luZGV4fSwg56We54We5pWw57uEOiBgLCBzaGVuU2hhKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnRZZWFyLFxuICAgICAgICBlbmRZZWFyLFxuICAgICAgICBzdGFydEFnZSxcbiAgICAgICAgZW5kQWdlLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgZ2FuWmhpLFxuICAgICAgICBuYVlpbjogZ2FuWmhpID8gdGhpcy5nZXROYVlpbihnYW5aaGkpIDogJycsXG4gICAgICAgIHh1bktvbmcsXG4gICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgIGRpU2hpLFxuICAgICAgICBzaGVuU2hhOiBbLi4uc2hlblNoYV0gLy8g56Gu5L+d6L+U5Zue5LiA5Liq5paw55qE5pWw57uE5Ymv5pysXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8g5rWB5bm05L+h5oGvICjlj5bnrKzkuIDkuKrlpKfov5DnmoTmtYHlubQpXG4gICAgY29uc3QgbGl1TmlhbkFyciA9IGRhWXVuQXJyLmxlbmd0aCA+IDEgPyBkYVl1bkFyclsxXS5nZXRMaXVOaWFuKCkgOiBbXTtcbiAgICBjb25zdCBsaXVOaWFuID0gbGl1TmlhbkFyci5tYXAobG4gPT4ge1xuICAgICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgICBsZXQgeHVuS29uZyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5qOA5p+l5bmy5pSv5piv5ZCm5pyJ5pWIXG4gICAgICAgIGNvbnN0IGdhblpoaSA9IGxuLmdldEdhblpoaSgpO1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyDmiYvliqjorqHnrpfml6znqbrvvIzpgb/lhY3kvb/nlKjlj6/og73lh7rplJnnmoRnZXRYdW5Lb25n5pa55rOVXG4gICAgICAgICAgY29uc3QgZ2FuID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geW5tOaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g5a6J5YWo5Zyw6I635Y+W5bGe5oCn77yM6Ziy5q2i56m65oyH6ZKI5byC5bi4XG4gICAgICBsZXQgeWVhciA9IDAsIGFnZSA9IDAsIGluZGV4ID0gMCwgZ2FuWmhpID0gJyc7XG4gICAgICB0cnkgeyB5ZWFyID0gbG4uZ2V0WWVhcigpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geW5tOW5tOS7veWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgYWdlID0gbG4uZ2V0QWdlKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5rWB5bm05bm06b6E5Ye66ZSZOicsIGUpOyB9XG4gICAgICB0cnkgeyBpbmRleCA9IGxuLmdldEluZGV4KCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5rWB5bm05bqP5Y+35Ye66ZSZOicsIGUpOyB9XG4gICAgICB0cnkgeyBnYW5aaGkgPSBsbi5nZXRHYW5aaGkoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5bmtYHlubTlubLmlK/lh7rplJk6JywgZSk7IH1cblxuICAgICAgLy8g6K6h566X5Y2B56WeXG4gICAgICBsZXQgc2hpU2hlbkdhbiA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICBzaGlTaGVuR2FuID0gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIGdhblpoaS5jaGFyQXQoMCkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geW5tOWNgeelnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X5Zyw5Yq/XG4gICAgICBsZXQgZGlTaGkgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3QgemhpID0gZ2FuWmhpLmNoYXJBdCgxKTtcbiAgICAgICAgICBkaVNoaSA9IHRoaXMuZ2V0RGlTaGkoZGF5U3RlbSwgemhpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpfmtYHlubTlnLDlir/lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+elnueFnlxuICAgICAgY29uc3Qgc2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3Qgc3RlbSA9IGdhblpoaS5jaGFyQXQoMCk7XG4gICAgICAgICAgY29uc3QgYnJhbmNoID0gZ2FuWmhpLmNoYXJBdCgxKTtcblxuICAgICAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgICAgIGNvbnNvbGUubG9nKGDorqHnrpfmtYHlubTnpZ7nhZ4gLSDlubTku706ICR7eWVhcn0sIOW5suaUrzogJHtnYW5aaGl9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYOa1geW5tOelnueFnuiuoeeul+WPguaVsCAtIOaXpeW5sjogJHtkYXlTdGVtfSwg5bm05pSvOiAke3llYXJCcmFuY2h9YCk7XG5cbiAgICAgICAgICAvLyDlpKnkuZnotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaWh+aYjFxuICAgICAgICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmlofmmIwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDljY7nm5ZcbiAgICAgICAgICBpZiAodGhpcy5pc0h1YUdhaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WNjueblicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOemhOelnlxuICAgICAgICAgIGlmICh0aGlzLmlzTHVTaGVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5qGD6IqxXG4gICAgICAgICAgaWYgKHRoaXMuaXNUYW9IdWEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlraTovrBcbiAgICAgICAgICBpZiAodGhpcy5pc0d1Q2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WtpOi+sCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWvoeWuv1xuICAgICAgICAgIGlmICh0aGlzLmlzR3VhU3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDpqb/pqaxcbiAgICAgICAgICBpZiAodGhpcy5pc1lpTWEoYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlsIbmmJ9cbiAgICAgICAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WwhuaYnycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmHkeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmluU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkRlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b635ZCIXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVIZShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaciOW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzWXVlRGUoc3RlbSkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5Yy7XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWWkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljLsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnllpxcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaShicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWWnCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOe6ouiJs1xuICAgICAgICAgIGlmICh0aGlzLmlzSG9uZ1lhbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqee9l1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkx1byhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+Wkqee9lycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOe9kVxuICAgICAgICAgIGlmICh0aGlzLmlzRGlXYW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Zyw572RJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g576K5YiDXG4gICAgICAgICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56m6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS29uZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeepuicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOWKq1xuICAgICAgICAgIGlmICh0aGlzLmlzRGlKaWUoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnliJFcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5ZOtXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlk60nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnomZpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeiZmicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWSuOaxoFxuICAgICAgICAgIGlmICh0aGlzLmlzWGlhbkNoaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOS6oeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfkuqHnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDliqvnhZ5cbiAgICAgICAgICBpZiAodGhpcy5pc0ppZVNoYShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WKq+eFnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOeBvueFnlxuICAgICAgICAgIGlmICh0aGlzLmlzWmFpU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5bKB56C0XG4gICAgICAgICAgaWYgKHRoaXMuaXNTdWlQbyhicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WygeegtCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkp+iAl1xuICAgICAgICAgIGlmICh0aGlzLmlzRGFIYW8oYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b636LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6LWmXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuU2hlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5oGpXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlrphcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56aPXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRnUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljqhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5DaHUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlt6tcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5XdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeaciFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbll1ZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqemprFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbk1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geW5tOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICBjb25zb2xlLmxvZyhg5rWB5bm06L+U5Zue5pWw5o2uIC0g5bm05Lu9OiAke3llYXJ9LCDnpZ7nhZ7mlbDnu4Q6IGAsIHNoZW5TaGEpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB5ZWFyLFxuICAgICAgICBhZ2UsXG4gICAgICAgIGluZGV4LFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIG5hWWluOiBnYW5aaGkgPyB0aGlzLmdldE5hWWluKGdhblpoaSkgOiAnJyxcbiAgICAgICAgeHVuS29uZyxcbiAgICAgICAgc2hpU2hlbkdhbixcbiAgICAgICAgZGlTaGksXG4gICAgICAgIHNoZW5TaGE6IFsuLi5zaGVuU2hhXSAvLyDnoa7kv53ov5Tlm57kuIDkuKrmlrDnmoTmlbDnu4Tlia/mnKxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyDlsI/ov5Dkv6Hmga8gKOWPluesrOS4gOS4quWkp+i/kOeahOWwj+i/kClcbiAgICBjb25zdCB4aWFvWXVuQXJyID0gZGFZdW5BcnIubGVuZ3RoID4gMSA/IGRhWXVuQXJyWzFdLmdldFhpYW9ZdW4oKSA6IFtdO1xuICAgIGNvbnN0IHhpYW9ZdW4gPSB4aWFvWXVuQXJyLm1hcCh4eSA9PiB7XG4gICAgICAvLyDmt7vliqDplJnor6/lpITnkIbvvIzpmLLmraLml6znqbrorqHnrpflpLHotKVcbiAgICAgIGxldCB4dW5Lb25nID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICAvLyDmo4Dmn6XlubLmlK/mmK/lkKbmnInmlYhcbiAgICAgICAgY29uc3QgZ2FuWmhpID0geHkuZ2V0R2FuWmhpKCk7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIC8vIOaJi+WKqOiuoeeul+aXrOepuu+8jOmBv+WFjeS9v+eUqOWPr+iDveWHuumUmeeahGdldFh1bktvbmfmlrnms5VcbiAgICAgICAgICBjb25zdCBnYW4gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhnYW4sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5bCP6L+Q5pes56m65Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDlronlhajlnLDojrflj5blsZ7mgKfvvIzpmLLmraLnqbrmjIfpkojlvILluLhcbiAgICAgIGxldCB5ZWFyID0gMCwgYWdlID0gMCwgaW5kZXggPSAwLCBnYW5aaGkgPSAnJztcbiAgICAgIHRyeSB7IHllYXIgPSB4eS5nZXRZZWFyKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5bCP6L+Q5bm05Lu95Ye66ZSZOicsIGUpOyB9XG4gICAgICB0cnkgeyBhZ2UgPSB4eS5nZXRBZ2UoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blsI/ov5DlubTpvoTlh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGluZGV4ID0geHkuZ2V0SW5kZXgoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blsI/ov5Dluo/lj7flh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGdhblpoaSA9IHh5LmdldEdhblpoaSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWwj+i/kOW5suaUr+WHuumUmTonLCBlKTsgfVxuXG4gICAgICAvLyDorqHnrpfljYHnpZ5cbiAgICAgIGxldCBzaGlTaGVuR2FuID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMSkge1xuICAgICAgICAgIHNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgZ2FuWmhpLmNoYXJBdCgwKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5bCP6L+Q5Y2B56We5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpflnLDlir9cbiAgICAgIGxldCBkaVNoaSA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIGRpU2hpID0gdGhpcy5nZXREaVNoaShkYXlTdGVtLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wwj+i/kOWcsOWKv+WHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X56We54WeXG4gICAgICBjb25zdCBzaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCBzdGVtID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCBicmFuY2ggPSBnYW5aaGkuY2hhckF0KDEpO1xuXG4gICAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgICAgY29uc29sZS5sb2coYOiuoeeul+Wwj+i/kOelnueFniAtIOW5tOS7vTogJHt5ZWFyfSwg5bmy5pSvOiAke2dhblpoaX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5bCP6L+Q56We54We6K6h566X5Y+C5pWwIC0g5pel5bmyOiAke2RheVN0ZW19LCDlubTmlK86ICR7eWVhckJyYW5jaH1gKTtcblxuICAgICAgICAgIC8vIOWkqeS5mei0teS6ulxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbllpR3VpUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5paH5piMXG4gICAgICAgICAgaWYgKHRoaXMuaXNXZW5DaGFuZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWNjuebllxuICAgICAgICAgIGlmICh0aGlzLmlzSHVhR2FpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g56aE56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNMdVNoZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnpoTnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmoYPoirFcbiAgICAgICAgICBpZiAodGhpcy5pc1Rhb0h1YShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWtpOi+sFxuICAgICAgICAgIGlmICh0aGlzLmlzR3VDaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5a+h5a6/XG4gICAgICAgICAgaWYgKHRoaXMuaXNHdWFTdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WvoeWuvycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmpv+mprFxuICAgICAgICAgIGlmICh0aGlzLmlzWWlNYShicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWwhuaYn1xuICAgICAgICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6YeR56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaW5TaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn6YeR56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrflkIhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZUhlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5pyI5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNZdWVEZShzdGVtKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljLtcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWWnFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g57qi6ImzXG4gICAgICAgICAgaWYgKHRoaXMuaXNIb25nWWFuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp572XXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuTHVvKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw572RXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaVdhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnvorliINcbiAgICAgICAgICBpZiAodGhpcy5pc1lhbmdSZW4oZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnqbpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5Lb25nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw5YqrXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaUppZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WcsOWKqycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWIkVxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlk61cbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5LdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeiZmlxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblh1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5ZK45rGgXG4gICAgICAgICAgaWYgKHRoaXMuaXNYaWFuQ2hpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Lqh56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNXYW5nU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWKq+eFnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmllU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g54G+54WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNaYWlTaGEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b636LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6LWmXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuU2hlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5oGpXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlrphcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56aPXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRnUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljqhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5DaHUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlt6tcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5XdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeaciFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbll1ZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqemprFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbk1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wwj+i/kOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICBjb25zb2xlLmxvZyhg5bCP6L+Q6L+U5Zue5pWw5o2uIC0g5bm05Lu9OiAke3llYXJ9LCDnpZ7nhZ7mlbDnu4Q6IGAsIHNoZW5TaGEpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB5ZWFyLFxuICAgICAgICBhZ2UsXG4gICAgICAgIGluZGV4LFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIG5hWWluOiBnYW5aaGkgPyB0aGlzLmdldE5hWWluKGdhblpoaSkgOiAnJyxcbiAgICAgICAgeHVuS29uZyxcbiAgICAgICAgc2hpU2hlbkdhbixcbiAgICAgICAgZGlTaGksXG4gICAgICAgIHNoZW5TaGE6IFsuLi5zaGVuU2hhXSAvLyDnoa7kv53ov5Tlm57kuIDkuKrmlrDnmoTmlbDnu4Tlia/mnKxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyDmtYHmnIjkv6Hmga8gKOWPluesrOS4gOS4qua1geW5tOeahOa1geaciClcbiAgICBjb25zdCBsaXVZdWVBcnIgPSBsaXVOaWFuQXJyLmxlbmd0aCA+IDAgPyBsaXVOaWFuQXJyWzBdLmdldExpdVl1ZSgpIDogW107XG4gICAgY29uc3QgbGl1WXVlID0gbGl1WXVlQXJyLm1hcChseSA9PiB7XG4gICAgICAvLyDmt7vliqDplJnor6/lpITnkIbvvIzpmLLmraLml6znqbrorqHnrpflpLHotKVcbiAgICAgIGxldCB4dW5Lb25nID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICAvLyDmo4Dmn6XlubLmlK/mmK/lkKbmnInmlYhcbiAgICAgICAgY29uc3QgZ2FuWmhpID0gbHkuZ2V0R2FuWmhpKCk7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIC8vIOaJi+WKqOiuoeeul+aXrOepuu+8jOmBv+WFjeS9v+eUqOWPr+iDveWHuumUmeeahGdldFh1bktvbmfmlrnms5VcbiAgICAgICAgICBjb25zdCBnYW4gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgeHVuS29uZyA9IHRoaXMuY2FsY3VsYXRlWHVuS29uZyhnYW4sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5pyI5pes56m65Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDlronlhajlnLDojrflj5blsZ7mgKfvvIzpmLLmraLnqbrmjIfpkojlvILluLhcbiAgICAgIGxldCBtb250aCA9ICcnLCBpbmRleCA9IDAsIGdhblpoaSA9ICcnO1xuICAgICAgdHJ5IHsgbW9udGggPSBseS5nZXRNb250aEluQ2hpbmVzZSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geaciOaciOS7veWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgaW5kZXggPSBseS5nZXRJbmRleCgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geaciOW6j+WPt+WHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZ2FuWmhpID0gbHkuZ2V0R2FuWmhpKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5rWB5pyI5bmy5pSv5Ye66ZSZOicsIGUpOyB9XG5cbiAgICAgIC8vIOiuoeeul+WNgeelnlxuICAgICAgbGV0IHNoaVNoZW5HYW4gPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBnYW5aaGkuY2hhckF0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpfmtYHmnIjljYHnpZ7lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+WcsOWKv1xuICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5pyI5Zyw5Yq/5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpfnurPpn7NcbiAgICAgIGxldCBuYVlpbiA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgbmFZaW4gPSB0aGlzLmdldE5hWWluKGdhblpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5pyI57qz6Z+z5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpfnpZ7nhZ5cbiAgICAgIGNvbnN0IHNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHN0ZW0gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IGJyYW5jaCA9IGdhblpoaS5jaGFyQXQoMSk7XG5cbiAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICBjb25zb2xlLmxvZyhg6K6h566X5rWB5pyI56We54WeIC0g5pyI5Lu9OiAke21vbnRofSwg5bmy5pSvOiAke2dhblpoaX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg5rWB5pyI56We54We6K6h566X5Y+C5pWwIC0g5pel5bmyOiAke2RheVN0ZW19LCDlubTmlK86ICR7eWVhckJyYW5jaH1gKTtcblxuICAgICAgICAgIC8vIOWkqeS5mei0teS6ulxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbllpR3VpUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5paH5piMXG4gICAgICAgICAgaWYgKHRoaXMuaXNXZW5DaGFuZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWNjuebllxuICAgICAgICAgIGlmICh0aGlzLmlzSHVhR2FpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g56aE56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNMdVNoZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnpoTnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmoYPoirFcbiAgICAgICAgICBpZiAodGhpcy5pc1Rhb0h1YShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWtpOi+sFxuICAgICAgICAgIGlmICh0aGlzLmlzR3VDaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5a+h5a6/XG4gICAgICAgICAgaWYgKHRoaXMuaXNHdWFTdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WvoeWuvycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmpv+mprFxuICAgICAgICAgIGlmICh0aGlzLmlzWWlNYShicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWwhuaYn1xuICAgICAgICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6YeR56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaW5TaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn6YeR56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrflkIhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZUhlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5pyI5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNZdWVEZShzdGVtKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljLtcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWWnFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g57qi6ImzXG4gICAgICAgICAgaWYgKHRoaXMuaXNIb25nWWFuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp572XXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuTHVvKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw572RXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaVdhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnvorliINcbiAgICAgICAgICBpZiAodGhpcy5pc1lhbmdSZW4oZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnqbpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5Lb25nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw5YqrXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaUppZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WcsOWKqycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWIkVxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlk61cbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5LdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeiZmlxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblh1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5ZK45rGgXG4gICAgICAgICAgaWYgKHRoaXMuaXNYaWFuQ2hpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Lqh56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNXYW5nU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWKq+eFnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmllU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g54G+54WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNaYWlTaGEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b636LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6LWmXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuU2hlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5oGpXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlrphcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56aPXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRnUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljqhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5DaHUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlt6tcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5XdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeaciFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbll1ZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqemprFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbk1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geaciOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICBjb25zb2xlLmxvZyhg5rWB5pyI56We54We6K6h566X57uT5p6cIC0g5pyI5Lu9OiAke21vbnRofSwg56We54WeOiAke3NoZW5TaGEuam9pbignLCAnKX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIjnpZ7nhZ7orqHnrpfnu5PmnpznsbvlnosgLSDmnIjku706ICR7bW9udGh9LCDnsbvlnos6ICR7dHlwZW9mIHNoZW5TaGF9LCDmmK/lkKbmlbDnu4Q6ICR7QXJyYXkuaXNBcnJheShzaGVuU2hhKX0sIOmVv+W6pjogJHtzaGVuU2hhLmxlbmd0aH1gKTtcblxuICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICBjb25zb2xlLmxvZyhg5rWB5pyI6L+U5Zue5pWw5o2uIC0g5pyI5Lu9OiAke21vbnRofSwg56We54We5pWw57uEOiBgLCBzaGVuU2hhKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbW9udGgsXG4gICAgICAgIGluZGV4LFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIG5hWWluLFxuICAgICAgICB4dW5Lb25nLFxuICAgICAgICBzaGlTaGVuR2FuLFxuICAgICAgICBkaVNoaSxcbiAgICAgICAgc2hlblNoYTogWy4uLnNoZW5TaGFdIC8vIOehruS/nei/lOWbnuS4gOS4quaWsOeahOaVsOe7hOWJr+acrFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIOajgOafpeS4ieWQiOWxgOWSjOS4ieS8muWxgFxuICAgIGNvbnN0IGJyYW5jaGVzID0gW3llYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIGhvdXJCcmFuY2hdO1xuICAgIGNvbnN0IHNhbkhlSnUgPSB0aGlzLmNoZWNrU2FuSGVKdShicmFuY2hlcyk7XG4gICAgY29uc3Qgc2FuSHVpSnUgPSB0aGlzLmNoZWNrU2FuSHVpSnUoYnJhbmNoZXMpO1xuXG4gICAgLy8g6K6h566X5LqU6KGM5by65bqmXG4gICAgY29uc3Qgd3VYaW5nU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVd1WGluZ1N0cmVuZ3RoKGVpZ2h0Q2hhcik7XG5cbiAgICAvLyDorqHnrpfml6XkuLvml7roobBcbiAgICBjb25zdCByaVpodVN0cmVuZ3RoSW5mbyA9IHRoaXMuY2FsY3VsYXRlUmlaaHVTdHJlbmd0aChlaWdodENoYXIpO1xuICAgIGNvbnN0IHJpWmh1U3RyZW5ndGggPSByaVpodVN0cmVuZ3RoSW5mby5yZXN1bHQ7XG4gICAgY29uc3QgcmlaaHVTdHJlbmd0aERldGFpbHMgPSByaVpodVN0cmVuZ3RoSW5mby5kZXRhaWxzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOWfuuacrOS/oeaBr1xuICAgICAgc29sYXJEYXRlLFxuICAgICAgbHVuYXJEYXRlLFxuICAgICAgc29sYXJUaW1lLFxuXG4gICAgICAvLyDlhavlrZfkv6Hmga9cbiAgICAgIHllYXJQaWxsYXIsXG4gICAgICB5ZWFyU3RlbSxcbiAgICAgIHllYXJCcmFuY2gsXG4gICAgICB5ZWFySGlkZUdhbixcbiAgICAgIHllYXJXdVhpbmcsXG4gICAgICB5ZWFyTmFZaW4sXG5cbiAgICAgIG1vbnRoUGlsbGFyLFxuICAgICAgbW9udGhTdGVtLFxuICAgICAgbW9udGhCcmFuY2gsXG4gICAgICBtb250aEhpZGVHYW4sXG4gICAgICBtb250aFd1WGluZyxcbiAgICAgIG1vbnRoTmFZaW4sXG5cbiAgICAgIGRheVBpbGxhcixcbiAgICAgIGRheVN0ZW0sXG4gICAgICBkYXlCcmFuY2gsXG4gICAgICBkYXlIaWRlR2FuLFxuICAgICAgZGF5V3VYaW5nLFxuICAgICAgZGF5TmFZaW4sXG5cbiAgICAgIGhvdXJQaWxsYXIsXG4gICAgICBob3VyU3RlbSxcbiAgICAgIGhvdXJCcmFuY2gsXG4gICAgICBob3VySGlkZUdhbixcbiAgICAgIGhvdXJXdVhpbmcsXG4gICAgICBob3VyTmFZaW4sXG5cbiAgICAgIC8vIOeJueauiuS/oeaBr1xuICAgICAgdGFpWXVhbixcbiAgICAgIHRhaVl1YW5OYVlpbixcbiAgICAgIG1pbmdHb25nLFxuICAgICAgbWluZ0dvbmdOYVlpbixcbiAgICAgIHNoZW5Hb25nLFxuXG4gICAgICAvLyDlrozmlbTkv6Hmga9cbiAgICAgIGZ1bGxTdHJpbmc6IGx1bmFyLnRvRnVsbFN0cmluZygpLFxuXG4gICAgICAvLyDmtYHmtL7kv6Hmga9cbiAgICAgIGJhemlTZWN0OiBzZWN0LFxuICAgICAgZ2VuZGVyLFxuXG4gICAgICAvLyDnlJ/ogpbkv6Hmga9cbiAgICAgIHllYXJTaGVuZ1hpYW8sXG4gICAgICBtb250aFNoZW5nWGlhbyxcbiAgICAgIGRheVNoZW5nWGlhbyxcbiAgICAgIGhvdXJTaGVuZ1hpYW8sXG5cbiAgICAgIC8vIOWNgeelnuS/oeaBr1xuICAgICAgeWVhclNoaVNoZW4sXG4gICAgICBtb250aFNoaVNoZW4sXG4gICAgICBkYXlTaGlTaGVuLFxuICAgICAgaG91clNoaVNoZW4sXG5cbiAgICAgIC8vIOWkqeW5suWNgeelnu+8iOeUqOS6juaYvuekuu+8iVxuICAgICAgeWVhclNoaVNoZW5HYW46IHllYXJTaGlTaGVuR2FuLFxuICAgICAgbW9udGhTaGlTaGVuR2FuOiBtb250aFNoaVNoZW5HYW4sXG4gICAgICB0aW1lU2hpU2hlbkdhbjogaG91clNoaVNoZW5HYW4sXG4gICAgICBob3VyU2hpU2hlbkdhbjogaG91clNoaVNoZW5HYW4sIC8vIOa3u+WKoGhvdXJTaGlTaGVuR2Fu5bGe5oCn77yM5LiOcGFyc2VCYXppU3RyaW5n5L+d5oyB5LiA6Ie0XG5cbiAgICAgIC8vIOWcsOaUr+WNgeelnlxuICAgICAgeWVhclNoaVNoZW5aaGksXG4gICAgICBtb250aFNoaVNoZW5aaGksXG4gICAgICBkYXlTaGlTaGVuWmhpLFxuICAgICAgaG91clNoaVNoZW5aaGksXG5cbiAgICAgIC8vIOWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICAgICAgeWVhckRpU2hpLFxuICAgICAgbW9udGhEaVNoaSxcbiAgICAgIGRheURpU2hpLFxuICAgICAgdGltZURpU2hpLFxuXG4gICAgICAvLyDml6znqbrvvIjnqbrkuqHvvIlcbiAgICAgIHllYXJYdW5Lb25nLFxuICAgICAgbW9udGhYdW5Lb25nLFxuICAgICAgZGF5WHVuS29uZyxcbiAgICAgIHRpbWVYdW5Lb25nLFxuXG4gICAgICAvLyDmmJ/luqflkozoioLmsJRcbiAgICAgIHpvZGlhYyxcbiAgICAgIGppZVFpOiBqaWVRaSBhcyBzdHJpbmcsXG4gICAgICBuZXh0SmllUWk6IG5leHRKaWVRaSBhcyBzdHJpbmcsXG5cbiAgICAgIC8vIOWQieWHtuWSjOelnueFnlxuICAgICAgZGF5WWk6IGRheVlpIGFzIHN0cmluZ1tdLFxuICAgICAgZGF5Smk6IGRheUppIGFzIHN0cmluZ1tdLFxuICAgICAgc2hlblNoYTogc2hlblNoYSBhcyBzdHJpbmdbXSxcblxuICAgICAgLy8g5qC85bGAXG4gICAgICAuLi4oZ2VKdSA/IHsgZ2VKdSB9IDoge30pLFxuICAgICAgLi4uKGdlSnVEZXRhaWwgPyB7IGdlSnVEZXRhaWwgfSA6IHt9KSxcbiAgICAgIC4uLihnZUp1U3RyZW5ndGggPyB7IGdlSnVTdHJlbmd0aCB9IDoge30pLFxuICAgICAgLi4uKHlvbmdTaGVuID8geyB5b25nU2hlbiB9IDoge30pLFxuICAgICAgLi4uKHlvbmdTaGVuRGV0YWlsID8geyB5b25nU2hlbkRldGFpbCB9IDoge30pLFxuICAgICAgLi4uKGdlSnVGYWN0b3JzID8geyBnZUp1RmFjdG9ycyB9IDoge30pLFxuXG4gICAgICAvLyDotbfov5Dkv6Hmga9cbiAgICAgIHFpWXVuWWVhcixcbiAgICAgIHFpWXVuTW9udGgsXG4gICAgICBxaVl1bkRheSxcbiAgICAgIHFpWXVuSG91cixcbiAgICAgIHFpWXVuRGF0ZSxcbiAgICAgIHFpWXVuQWdlLFxuXG4gICAgICAvLyDlpKfov5DjgIHmtYHlubTjgIHlsI/ov5DjgIHmtYHmnIhcbiAgICAgIGRhWXVuLFxuICAgICAgbGl1TmlhbixcbiAgICAgIHhpYW9ZdW4sXG4gICAgICBsaXVZdWUsXG5cbiAgICAgIC8vIOe7hOWQiOS/oeaBr1xuICAgICAgc2FuSGVKdSxcbiAgICAgIHNhbkh1aUp1LFxuXG4gICAgICAvLyDkupTooYzlvLrluqblkozml6XkuLvml7roobBcbiAgICAgIHd1WGluZ1N0cmVuZ3RoLFxuICAgICAgcmlaaHVTdHJlbmd0aCxcbiAgICAgIHJpWmh1U3RyZW5ndGhEZXRhaWxzXG4gICAgfTtcbiAgfVxuXG5cblxuICAvKipcbiAgICog6I635Y+W5Zyw5pSv5a+55bqU55qE55Sf6IKWXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOeUn+iCllxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U2hlbmdYaWFvKGJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WtkCc6ICfpvKAnLFxuICAgICAgJ+S4kSc6ICfniZsnLFxuICAgICAgJ+WvhSc6ICfomY4nLFxuICAgICAgJ+WNryc6ICflhZQnLFxuICAgICAgJ+i+sCc6ICfpvpknLFxuICAgICAgJ+W3syc6ICfom4cnLFxuICAgICAgJ+WNiCc6ICfpqawnLFxuICAgICAgJ+acqic6ICfnvoonLFxuICAgICAgJ+eUsyc6ICfnjLQnLFxuICAgICAgJ+mFiSc6ICfpuKEnLFxuICAgICAgJ+aIjCc6ICfni5cnLFxuICAgICAgJ+S6pSc6ICfnjKonXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbYnJhbmNoXSB8fCAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bljYHnpZ5cbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmy77yI5pel5Li777yJXG4gICAqIEBwYXJhbSBvdGhlclN0ZW0g5YW25LuW5aSp5bmyXG4gICAqIEByZXR1cm5zIOWNgeelnlxuICAgKi9cbiAgc3RhdGljIGdldFNoaVNoZW4oZGF5U3RlbTogc3RyaW5nLCBvdGhlclN0ZW06IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5aSp5bmy6aG65bqPXG4gICAgY29uc3Qgc3RlbXMgPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiO1xuXG4gICAgLy8g6Ziz5bmy77ya55Sy5LiZ5oiK5bqa5aOsXG4gICAgLy8g6Zi05bmy77ya5LmZ5LiB5bex6L6b55m4XG4gICAgY29uc3QgeWFuZ0dhbiA9ICfnlLLkuJnmiIrluprlo6wnO1xuXG4gICAgLy8g6I635Y+W5pel5bmy5ZKM55uu5qCH5aSp5bmy55qE57Si5byVXG4gICAgY29uc3QgZGF5U3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihkYXlTdGVtKTtcbiAgICBjb25zdCBzdGVtSW5kZXggPSBzdGVtcy5pbmRleE9mKG90aGVyU3RlbSk7XG5cbiAgICBpZiAoZGF5U3RlbUluZGV4ID09PSAtMSB8fCBzdGVtSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gJ+acquefpSc7XG4gICAgfVxuXG4gICAgLy8g5Yik5pat5pel5bmy6Zi06ZizXG4gICAgY29uc3QgaXNEYXlZYW5nID0geWFuZ0dhbi5pbmNsdWRlcyhkYXlTdGVtKTtcblxuICAgIC8vIOiuoeeul+WNgeelnue0ouW8lVxuICAgIGxldCBzaGlTaGVuSW5kZXggPSAoc3RlbUluZGV4IC0gZGF5U3RlbUluZGV4ICsgMTApICUgMTA7XG5cbiAgICAvLyDljYHnpZ7pobrluo/vvIjpmLPlubLvvInvvJrmr5TogqnjgIHliqvotKLjgIHpo5/npZ7jgIHkvKTlrpjjgIHlgY/otKLjgIHmraPotKLjgIHkuIPmnYDjgIHmraPlrpjjgIHlgY/ljbDjgIHmraPljbBcbiAgICAvLyDljYHnpZ7pobrluo/vvIjpmLTlubLvvInvvJrmr5TogqnjgIHliqvotKLjgIHpo5/npZ7jgIHkvKTlrpjjgIHlgY/otKLjgIHmraPotKLjgIHkuIPmnYDjgIHmraPlrpjjgIHlgY/ljbDjgIHmraPljbBcbiAgICBjb25zdCBzaGlTaGVuTmFtZXMgPSBbXG4gICAgICBcIuavlOiCqVwiLCBcIuWKq+i0olwiLCBcIumjn+elnlwiLCBcIuS8pOWumFwiLCBcIuWBj+i0olwiLCBcIuato+i0olwiLCBcIuS4g+adgFwiLCBcIuato+WumFwiLCBcIuWBj+WNsFwiLCBcIuato+WNsFwiXG4gICAgXTtcblxuICAgIHJldHVybiBzaGlTaGVuTmFtZXNbc2hpU2hlbkluZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/ol4/lubLnmoTljYHnpZ5cbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmy77yI5pel5Li777yJXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOiXj+W5suWvueW6lOeahOWNgeelnuaVsOe7hFxuICAgKi9cbiAgc3RhdGljIGdldEhpZGRlblNoaVNoZW4oZGF5U3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAvLyDojrflj5blnLDmlK/ol4/lubJcbiAgICBjb25zdCBoaWRlR2FuU3RyID0gdGhpcy5nZXRIaWRlR2FuKGJyYW5jaCk7XG5cbiAgICAvLyDlpoLmnpzol4/lubLlrZfnrKbkuLLkuLrnqbrvvIzov5Tlm57nqbrmlbDnu4RcbiAgICBpZiAoIWhpZGVHYW5TdHIpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlR2FucyA9IGhpZGVHYW5TdHIuc3BsaXQoJywnKTtcblxuICAgIC8vIOWmguaenOayoeacieiXj+W5su+8jOi/lOWbnuepuuaVsOe7hFxuICAgIGlmIChoaWRlR2Fucy5sZW5ndGggPT09IDAgfHwgaGlkZUdhbnNbMF0gPT09ICcnKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8g6K6h566X5q+P5Liq6JeP5bmy55qE5Y2B56WeXG4gICAgY29uc3Qgc2hpU2hlbnM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBnYW4gb2YgaGlkZUdhbnMpIHtcbiAgICAgIGlmIChnYW4pIHtcbiAgICAgICAgY29uc3Qgc2hpU2hlbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBnYW4pO1xuICAgICAgICBzaGlTaGVucy5wdXNoKHNoaVNoZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzaGlTaGVucztcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpflpKfov5BcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIGdlbmRlciDmgKfliKvvvIgxLeeUt++8jDAt5aWz77yJXG4gICAqIEByZXR1cm5zIOWkp+i/kOaVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlRGFZdW4oZWlnaHRDaGFyOiBFaWdodENoYXIsIGdlbmRlcjogc3RyaW5nKTogQXJyYXk8eyBzdGFydFllYXI6IG51bWJlcjsgc3RhcnRBZ2U6IG51bWJlcjsgZ2FuWmhpOiBzdHJpbmc7IG5hWWluOiBzdHJpbmcgfT4ge1xuICAgIC8vIOi/memHjOeugOWMluWkhOeQhu+8jOWunumZheW6lOivpeS9v+eUqGx1bmFyLXR5cGVzY3JpcHTlupPnmoTmlrnms5VcbiAgICAvLyDmiJbogIXmoLnmja7lhavlrZflkb3nkIbop4TliJnorqHnrpdcbiAgICBjb25zdCBkYVl1bjogQXJyYXk8eyBzdGFydFllYXI6IG51bWJlcjsgc3RhcnRBZ2U6IG51bWJlcjsgZ2FuWmhpOiBzdHJpbmc7IG5hWWluOiBzdHJpbmcgfT4gPSBbXTtcblxuICAgIC8vIOeugOWNleekuuS+i++8muS7jjEw5bKB5byA5aeL77yM5q+PMTDlubTkuIDkuKrlpKfov5BcbiAgICBjb25zdCBzdGFydEFnZSA9IDEwO1xuICAgIGNvbnN0IGN1cnJlbnRZZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpO1xuXG4gICAgLy8g6I635Y+W5pyI5p+xXG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcblxuICAgIC8vIOWkqeW5suWcsOaUr+mhuuW6j1xuICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDmnIjmn7HntKLlvJVcbiAgICBjb25zdCBtb250aFN0ZW1JbmRleCA9IHN0ZW1zLmluZGV4T2YobW9udGhTdGVtKTtcbiAgICBjb25zdCBtb250aEJyYW5jaEluZGV4ID0gYnJhbmNoZXMuaW5kZXhPZihtb250aEJyYW5jaCk7XG5cbiAgICAvLyDmoLnmja7mgKfliKvnoa7lrprpobrpgIbooYxcbiAgICBjb25zdCBkaXJlY3Rpb24gPSAoZ2VuZGVyID09PSAnMScpID8gMSA6IC0xOyAvLyDnlLfpobrlpbPpgIZcblxuICAgIC8vIOeUn+aIkDEw5Liq5aSn6L+QXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAvLyDorqHnrpflpKfov5DlubLmlK/ntKLlvJVcbiAgICAgIGNvbnN0IHN0ZW1JbmRleCA9IChtb250aFN0ZW1JbmRleCArIGRpcmVjdGlvbiAqIChpICsgMSkgKyAxMCkgJSAxMDtcbiAgICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gKG1vbnRoQnJhbmNoSW5kZXggKyBkaXJlY3Rpb24gKiAoaSArIDEpICsgMTIpICUgMTI7XG5cbiAgICAgIC8vIOWkp+i/kOW5suaUr1xuICAgICAgY29uc3Qgc3RlbSA9IHN0ZW1zW3N0ZW1JbmRleF07XG4gICAgICBjb25zdCBicmFuY2ggPSBicmFuY2hlc1ticmFuY2hJbmRleF07XG4gICAgICBjb25zdCBnYW5aaGkgPSBzdGVtICsgYnJhbmNoO1xuXG4gICAgICAvLyDlpKfov5DnurPpn7NcbiAgICAgIGNvbnN0IG5hWWluID0gdGhpcy5nZXROYVlpbihnYW5aaGkpO1xuXG4gICAgICAvLyDlpKfov5Dotbflp4vlubTpvoTlkozlubTku71cbiAgICAgIGNvbnN0IHN0YXJ0WWVhckFnZSA9IHN0YXJ0QWdlICsgaSAqIDEwO1xuICAgICAgY29uc3Qgc3RhcnRZZWFyID0gY3VycmVudFllYXIgKyAoc3RhcnRZZWFyQWdlIC0gMjApOyAvLyDlgYforr7lvZPliY3lubTpvoQyMOWygVxuXG4gICAgICBkYVl1bi5wdXNoKHtcbiAgICAgICAgc3RhcnRZZWFyLFxuICAgICAgICBzdGFydEFnZTogc3RhcnRZZWFyQWdlLFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIG5hWWluXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGFZdW47XG4gIH1cblxuICAvKipcbiAgICog6K6h566X5rWB5bm0XG4gICAqIEBwYXJhbSBiaXJ0aFllYXIg5Ye655Sf5bm0XG4gICAqIEByZXR1cm5zIOa1geW5tOaVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlTGl1TmlhbihiaXJ0aFllYXI6IG51bWJlcik6IEFycmF5PHsgeWVhcjogbnVtYmVyOyBhZ2U6IG51bWJlcjsgZ2FuWmhpOiBzdHJpbmc7IG5hWWluOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IGxpdU5pYW46IEFycmF5PHsgeWVhcjogbnVtYmVyOyBhZ2U6IG51bWJlcjsgZ2FuWmhpOiBzdHJpbmc7IG5hWWluOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBjdXJyZW50WWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTtcblxuICAgIC8vIOWkqeW5suWcsOaUr+mhuuW6j1xuICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDnlJ/miJAxMOS4qua1geW5tO+8iOW9k+WJjeW5tOWPiuacquadpTnlubTvvIlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIGNvbnN0IHllYXIgPSBjdXJyZW50WWVhciArIGk7XG4gICAgICBjb25zdCBhZ2UgPSB5ZWFyIC0gYmlydGhZZWFyICsgMTsgLy8g6Jma5bKBXG5cbiAgICAgIC8vIOiuoeeul+a1geW5tOW5suaUr1xuICAgICAgY29uc3Qgc3RlbUluZGV4ID0gKHllYXIgLSA0KSAlIDEwO1xuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSAoeWVhciAtIDQpICUgMTI7XG5cbiAgICAgIGNvbnN0IHN0ZW0gPSBzdGVtc1tzdGVtSW5kZXhdO1xuICAgICAgY29uc3QgYnJhbmNoID0gYnJhbmNoZXNbYnJhbmNoSW5kZXhdO1xuICAgICAgY29uc3QgZ2FuWmhpID0gc3RlbSArIGJyYW5jaDtcblxuICAgICAgLy8g5rWB5bm057qz6Z+zXG4gICAgICBjb25zdCBuYVlpbiA9IHRoaXMuZ2V0TmFZaW4oZ2FuWmhpKTtcblxuICAgICAgbGl1Tmlhbi5wdXNoKHtcbiAgICAgICAgeWVhcixcbiAgICAgICAgYWdlLFxuICAgICAgICBnYW5aaGksXG4gICAgICAgIG5hWWluXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGl1TmlhbjtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfkupTooYzlvLrluqZcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5LqU6KGM5by65bqm5ZKM6K+m57uG6K6h566X6L+H56iLXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVXdVhpbmdTdHJlbmd0aChlaWdodENoYXI6IEVpZ2h0Q2hhcik6IHtcbiAgICBqaW46IG51bWJlcjtcbiAgICBtdTogbnVtYmVyO1xuICAgIHNodWk6IG51bWJlcjtcbiAgICBodW86IG51bWJlcjtcbiAgICB0dTogbnVtYmVyO1xuICAgIGRldGFpbHM6IHtcbiAgICAgIGppbjogeyB0aWFuR2FuOiBudW1iZXI7IGRpWmhpQ2FuZzogbnVtYmVyOyBuYVlpbjogbnVtYmVyOyBzZWFzb246IG51bWJlcjsgbW9udGhEb21pbmFudDogbnVtYmVyOyBjb21iaW5hdGlvbjogbnVtYmVyOyB0b3RhbDogbnVtYmVyIH0sXG4gICAgICBtdTogeyB0aWFuR2FuOiBudW1iZXI7IGRpWmhpQ2FuZzogbnVtYmVyOyBuYVlpbjogbnVtYmVyOyBzZWFzb246IG51bWJlcjsgbW9udGhEb21pbmFudDogbnVtYmVyOyBjb21iaW5hdGlvbjogbnVtYmVyOyB0b3RhbDogbnVtYmVyIH0sXG4gICAgICBzaHVpOiB7IHRpYW5HYW46IG51bWJlcjsgZGlaaGlDYW5nOiBudW1iZXI7IG5hWWluOiBudW1iZXI7IHNlYXNvbjogbnVtYmVyOyBtb250aERvbWluYW50OiBudW1iZXI7IGNvbWJpbmF0aW9uOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfSxcbiAgICAgIGh1bzogeyB0aWFuR2FuOiBudW1iZXI7IGRpWmhpQ2FuZzogbnVtYmVyOyBuYVlpbjogbnVtYmVyOyBzZWFzb246IG51bWJlcjsgbW9udGhEb21pbmFudDogbnVtYmVyOyBjb21iaW5hdGlvbjogbnVtYmVyOyB0b3RhbDogbnVtYmVyIH0sXG4gICAgICB0dTogeyB0aWFuR2FuOiBudW1iZXI7IGRpWmhpQ2FuZzogbnVtYmVyOyBuYVlpbjogbnVtYmVyOyBzZWFzb246IG51bWJlcjsgbW9udGhEb21pbmFudDogbnVtYmVyOyBjb21iaW5hdGlvbjogbnVtYmVyOyB0b3RhbDogbnVtYmVyIH1cbiAgICB9XG4gIH0ge1xuICAgIC8vIOWIneWni+WMluS6lOihjOW8uuW6plxuICAgIGNvbnN0IHN0cmVuZ3RoID0ge1xuICAgICAgamluOiAwLCAvLyDph5FcbiAgICAgIG11OiAwLCAgLy8g5pyoXG4gICAgICBzaHVpOiAwLCAvLyDmsLRcbiAgICAgIGh1bzogMCwgIC8vIOeBq1xuICAgICAgdHU6IDAgICAgLy8g5ZyfXG4gICAgfTtcblxuICAgIC8vIOWIneWni+WMluivpue7huS/oeaBr++8jOiusOW9leWQhOmhueW+l+WIhlxuICAgIGNvbnN0IGRldGFpbHMgPSB7XG4gICAgICBqaW46IHsgdGlhbkdhbjogMCwgZGlaaGlDYW5nOiAwLCBuYVlpbjogMCwgc2Vhc29uOiAwLCBtb250aERvbWluYW50OiAwLCBjb21iaW5hdGlvbjogMCwgdG90YWw6IDAgfSxcbiAgICAgIG11OiB7IHRpYW5HYW46IDAsIGRpWmhpQ2FuZzogMCwgbmFZaW46IDAsIHNlYXNvbjogMCwgbW9udGhEb21pbmFudDogMCwgY29tYmluYXRpb246IDAsIHRvdGFsOiAwIH0sXG4gICAgICBzaHVpOiB7IHRpYW5HYW46IDAsIGRpWmhpQ2FuZzogMCwgbmFZaW46IDAsIHNlYXNvbjogMCwgbW9udGhEb21pbmFudDogMCwgY29tYmluYXRpb246IDAsIHRvdGFsOiAwIH0sXG4gICAgICBodW86IHsgdGlhbkdhbjogMCwgZGlaaGlDYW5nOiAwLCBuYVlpbjogMCwgc2Vhc29uOiAwLCBtb250aERvbWluYW50OiAwLCBjb21iaW5hdGlvbjogMCwgdG90YWw6IDAgfSxcbiAgICAgIHR1OiB7IHRpYW5HYW46IDAsIGRpWmhpQ2FuZzogMCwgbmFZaW46IDAsIHNlYXNvbjogMCwgbW9udGhEb21pbmFudDogMCwgY29tYmluYXRpb246IDAsIHRvdGFsOiAwIH1cbiAgICB9O1xuXG4gICAgLy8gMS4g5aSp5bmy6YOo5YiGIC0g5oyJ54Wn5LiN5ZCM5p+x5L2N55qE5p2D6YeN6K6h566XXG4gICAgLy8g6I635Y+W5Zub5p+x5aSp5bmyXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuXG4gICAgLy8g6I635Y+W5Zub5p+x5aSp5bmy5LqU6KGMXG4gICAgY29uc3QgeWVhclN0ZW1XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoeWVhclN0ZW0pO1xuICAgIGNvbnN0IG1vbnRoU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhtb250aFN0ZW0pO1xuICAgIGNvbnN0IGRheVN0ZW1XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSk7XG4gICAgY29uc3QgdGltZVN0ZW1XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcodGltZVN0ZW0pO1xuXG4gICAgLy8g5aSp5bmy5p2D6YeNOiDlubTlubIoMS4wKSA8IOaciOW5sigyLjUpIDwg5pel5bmyKDMuMCkgPiDml7blubIoMS4wKVxuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgoeWVhclN0ZW1XdVhpbmcsIDEuMCwgZGV0YWlscywgJ3RpYW5HYW4nKTtcbiAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKG1vbnRoU3RlbVd1WGluZywgMi41LCBkZXRhaWxzLCAndGlhbkdhbicpOyAvLyDmj5Dpq5jmnIjlubLmnYPph41cbiAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKGRheVN0ZW1XdVhpbmcsIDMuMCwgZGV0YWlscywgJ3RpYW5HYW4nKTtcbiAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHRpbWVTdGVtV3VYaW5nLCAxLjAsIGRldGFpbHMsICd0aWFuR2FuJyk7XG5cbiAgICAvLyAyLiDlnLDmlK/pg6jliIYgLSDogIPomZHlnLDmlK/ol4/lubJcbiAgICAvLyDojrflj5blm5vmn7HlnLDmlK9cbiAgICBjb25zdCB5ZWFyQnJhbmNoID0gZWlnaHRDaGFyLmdldFllYXJaaGkoKTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRNb250aFpoaSgpO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXREYXlaaGkoKTtcbiAgICBjb25zdCB0aW1lQnJhbmNoID0gZWlnaHRDaGFyLmdldFRpbWVaaGkoKTtcblxuXG5cbiAgICAvLyDojrflj5blnLDmlK/ol4/lubIgLSDkvb/nlKjmiJHku6zoh6rlt7HnmoTol4/lubLlrprkuYnvvIzogIzkuI3mmK9sdW5hci10eXBlc2NyaXB05bqT55qE5a6a5LmJXG4gICAgY29uc3QgeWVhckhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4oeWVhckJyYW5jaCkuc3BsaXQoJywnKTtcbiAgICBjb25zdCBtb250aEhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4obW9udGhCcmFuY2gpLnNwbGl0KCcsJyk7XG4gICAgY29uc3QgZGF5SGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbihkYXlCcmFuY2gpLnNwbGl0KCcsJyk7XG4gICAgY29uc3QgdGltZUhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4odGltZUJyYW5jaCkuc3BsaXQoJywnKTtcblxuICAgIC8vIOWcsOaUr+iXj+W5suadg+mHjTog5bm05pSv6JeP5bmyKDAuNykgPCDmnIjmlK/ol4/lubIoMi4wKSA8IOaXpeaUr+iXj+W5sigyLjApID4g5pe25pSv6JeP5bmyKDAuNylcbiAgICB0aGlzLnByb2Nlc3NIaWRlR2FuRm9yU3RyZW5ndGgoeWVhckhpZGVHYW4sIDAuNywgZGV0YWlscyk7XG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKG1vbnRoSGlkZUdhbiwgMi4wLCBkZXRhaWxzKTsgLy8g5o+Q6auY5pyI5pSv6JeP5bmy5p2D6YeNXG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKGRheUhpZGVHYW4sIDIuMCwgZGV0YWlscyk7XG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKHRpbWVIaWRlR2FuLCAwLjcsIGRldGFpbHMpO1xuXG4gICAgLy8gMy4g57qz6Z+z5LqU6KGMIC0g6ICD6JmR57qz6Z+z55qE5b2x5ZONXG4gICAgLy8g6I635Y+W5Zub5p+x57qz6Z+zXG4gICAgY29uc3QgeWVhck5hWWluID0gZWlnaHRDaGFyLmdldFllYXJOYVlpbigpO1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSBlaWdodENoYXIuZ2V0TW9udGhOYVlpbigpO1xuICAgIGNvbnN0IGRheU5hWWluID0gZWlnaHRDaGFyLmdldERheU5hWWluKCk7XG4gICAgY29uc3QgdGltZU5hWWluID0gZWlnaHRDaGFyLmdldFRpbWVOYVlpbigpO1xuXG4gICAgLy8g5o+Q5Y+W57qz6Z+z5LqU6KGMXG4gICAgY29uc3QgeWVhck5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh5ZWFyTmFZaW4pO1xuICAgIGNvbnN0IG1vbnRoTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKG1vbnRoTmFZaW4pO1xuICAgIGNvbnN0IGRheU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyhkYXlOYVlpbik7XG4gICAgY29uc3QgdGltZU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pO1xuXG4gICAgLy8g57qz6Z+z5LqU6KGM5p2D6YeNOiDlubTmn7HnurPpn7MoMC41KSA8IOaciOafsee6s+mfsygxLjUpIDwg5pel5p+x57qz6Z+zKDEuNSkgPiDml7bmn7HnurPpn7MoMC41KVxuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgoeWVhck5hWWluV3VYaW5nLCAwLjUsIGRldGFpbHMsICduYVlpbicpO1xuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgobW9udGhOYVlpbld1WGluZywgMS41LCBkZXRhaWxzLCAnbmFZaW4nKTsgLy8g5o+Q6auY5pyI5p+x57qz6Z+z5p2D6YeNXG4gICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aChkYXlOYVlpbld1WGluZywgMS41LCBkZXRhaWxzLCAnbmFZaW4nKTtcbiAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHRpbWVOYVlpbld1WGluZywgMC41LCBkZXRhaWxzLCAnbmFZaW4nKTtcblxuICAgIC8vIDQuIOaciOS7pOaXuuihsOiwg+aVtCAtIOagueaNruaciOS7pOWvueS6lOihjOW8uuW6pui/m+ihjOiwg+aVtFxuICAgIHRoaXMuYWRqdXN0QnlNb250aFNlYXNvbkZvclN0cmVuZ3RoKG1vbnRoQnJhbmNoLCBkZXRhaWxzKTtcblxuICAgIC8vIDUuIOaciOS7pOW9k+S7pOWKoOaIkCAtIOaWsOWinlxuICAgIHRoaXMuYWRkTW9udGhEb21pbmFudEJvbnVzKG1vbnRoQnJhbmNoLCBkZXRhaWxzKTtcblxuICAgIC8vIDYuIOWbm+afsee7hOWQiOiwg+aVtCAtIOagueaNruWbm+afsee7hOWQiOWFs+ezu+i/m+ihjOiwg+aVtFxuICAgIHRoaXMuYWRqdXN0QnlDb21iaW5hdGlvbkZvclN0cmVuZ3RoKGVpZ2h0Q2hhciwgZGV0YWlscyk7XG5cbiAgICAvLyA3LiDorqHnrpflkITkupTooYzmgLvlvpfliIZcbiAgICBkZXRhaWxzLmppbi50b3RhbCA9IGRldGFpbHMuamluLnRpYW5HYW4gKyBkZXRhaWxzLmppbi5kaVpoaUNhbmcgKyBkZXRhaWxzLmppbi5uYVlpbiArXG4gICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHMuamluLnNlYXNvbiArIGRldGFpbHMuamluLm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLmppbi5jb21iaW5hdGlvbjtcbiAgICBkZXRhaWxzLm11LnRvdGFsID0gZGV0YWlscy5tdS50aWFuR2FuICsgZGV0YWlscy5tdS5kaVpoaUNhbmcgKyBkZXRhaWxzLm11Lm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5tdS5zZWFzb24gKyBkZXRhaWxzLm11Lm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLm11LmNvbWJpbmF0aW9uO1xuICAgIGRldGFpbHMuc2h1aS50b3RhbCA9IGRldGFpbHMuc2h1aS50aWFuR2FuICsgZGV0YWlscy5zaHVpLmRpWmhpQ2FuZyArIGRldGFpbHMuc2h1aS5uYVlpbiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5zaHVpLnNlYXNvbiArIGRldGFpbHMuc2h1aS5tb250aERvbWluYW50ICsgZGV0YWlscy5zaHVpLmNvbWJpbmF0aW9uO1xuICAgIGRldGFpbHMuaHVvLnRvdGFsID0gZGV0YWlscy5odW8udGlhbkdhbiArIGRldGFpbHMuaHVvLmRpWmhpQ2FuZyArIGRldGFpbHMuaHVvLm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHMuaHVvLnNlYXNvbiArIGRldGFpbHMuaHVvLm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLmh1by5jb21iaW5hdGlvbjtcbiAgICBkZXRhaWxzLnR1LnRvdGFsID0gZGV0YWlscy50dS50aWFuR2FuICsgZGV0YWlscy50dS5kaVpoaUNhbmcgKyBkZXRhaWxzLnR1Lm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy50dS5zZWFzb24gKyBkZXRhaWxzLnR1Lm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLnR1LmNvbWJpbmF0aW9uO1xuXG4gICAgLy8gNy4g5Zub6IiN5LqU5YWl5Yiw5LiA5L2N5bCP5pWwXG4gICAgZGV0YWlscy5qaW4udG90YWwgPSBNYXRoLnJvdW5kKGRldGFpbHMuamluLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy5tdS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy5tdS50b3RhbCAqIDEwKSAvIDEwO1xuICAgIGRldGFpbHMuc2h1aS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy5zaHVpLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy5odW8udG90YWwgPSBNYXRoLnJvdW5kKGRldGFpbHMuaHVvLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy50dS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy50dS50b3RhbCAqIDEwKSAvIDEwO1xuXG4gICAgLy8gOC4g5pu05pawc3RyZW5ndGjlr7nosaFcbiAgICBzdHJlbmd0aC5qaW4gPSBkZXRhaWxzLmppbi50b3RhbDtcbiAgICBzdHJlbmd0aC5tdSA9IGRldGFpbHMubXUudG90YWw7XG4gICAgc3RyZW5ndGguc2h1aSA9IGRldGFpbHMuc2h1aS50b3RhbDtcbiAgICBzdHJlbmd0aC5odW8gPSBkZXRhaWxzLmh1by50b3RhbDtcbiAgICBzdHJlbmd0aC50dSA9IGRldGFpbHMudHUudG90YWw7XG5cbiAgICAvLyDov5Tlm57nu5PmnpxcbiAgICByZXR1cm4ge1xuICAgICAgamluOiBzdHJlbmd0aC5qaW4sXG4gICAgICBtdTogc3RyZW5ndGgubXUsXG4gICAgICBzaHVpOiBzdHJlbmd0aC5zaHVpLFxuICAgICAgaHVvOiBzdHJlbmd0aC5odW8sXG4gICAgICB0dTogc3RyZW5ndGgudHUsXG4gICAgICBkZXRhaWxzXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlop7liqDkupTooYzlvLrluqZcbiAgICogQHBhcmFtIHd1WGluZyDkupTooYxcbiAgICogQHBhcmFtIHZhbHVlIOWinuWKoOeahOWAvFxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIGNhdGVnb3J5IOexu+WIq++8iHRpYW5HYW4sIGRpWmhpQ2FuZywgbmFZaW4sIHNlYXNvbiwgY29tYmluYXRpb27vvIlcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFkZFd1WGluZ1N0cmVuZ3RoKHd1WGluZzogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCBkZXRhaWxzOiBhbnksIGNhdGVnb3J5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXd1WGluZykgcmV0dXJuO1xuXG4gICAgc3dpdGNoICh3dVhpbmcpIHtcbiAgICAgIGNhc2UgJ+mHkSc6IGRldGFpbHMuamluW2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOiBkZXRhaWxzLm11W2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICfmsLQnOiBkZXRhaWxzLnNodWlbY2F0ZWdvcnldICs9IHZhbHVlOyBicmVhaztcbiAgICAgIGNhc2UgJ+eBqyc6IGRldGFpbHMuaHVvW2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOiBkZXRhaWxzLnR1W2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWkhOeQhuWcsOaUr+iXj+W5sueahOS6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gaGlkZUdhbiDol4/lubLmlbDnu4RcbiAgICogQHBhcmFtIGJhc2VXZWlnaHQg5Z+656GA5p2D6YeNXG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKiBAcGFyYW0gY2FuZ0dhbklubmVyV2VpZ2h0IOiXj+W5suWGhemDqOadg+mHjemFjee9rlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcHJvY2Vzc0hpZGVHYW5Gb3JTdHJlbmd0aChoaWRlR2FuOiBzdHJpbmdbXSwgYmFzZVdlaWdodDogbnVtYmVyLCBkZXRhaWxzOiBhbnksIGNhbmdHYW5Jbm5lcldlaWdodD86IGFueSk6IHZvaWQge1xuICAgIGlmICghaGlkZUdhbiB8fCBoaWRlR2FuLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8g5qC55o2u6JeP5bmy5pWw6YeP5YiG6YWN5p2D6YeNXG4gICAgLy8g5L2/55So6YWN572u5Lit55qE5p2D6YeN5oiW6buY6K6k5p2D6YeNXG4gICAgbGV0IHdlaWdodHM7XG4gICAgaWYgKGNhbmdHYW5Jbm5lcldlaWdodCkge1xuICAgICAgd2VpZ2h0cyA9IGhpZGVHYW4ubGVuZ3RoID09PSAxID8gY2FuZ0dhbklubmVyV2VpZ2h0Lm9uZSA6XG4gICAgICAgICAgICAgICBoaWRlR2FuLmxlbmd0aCA9PT0gMiA/IGNhbmdHYW5Jbm5lcldlaWdodC50d28gOlxuICAgICAgICAgICAgICAgY2FuZ0dhbklubmVyV2VpZ2h0LnRocmVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyDpu5jorqTmnYPph41cbiAgICAgIHdlaWdodHMgPSBoaWRlR2FuLmxlbmd0aCA9PT0gMSA/IFsxLjBdIDpcbiAgICAgICAgICAgICAgIGhpZGVHYW4ubGVuZ3RoID09PSAyID8gWzAuNiwgMC40XSA6XG4gICAgICAgICAgICAgICBbMC41LCAwLjMsIDAuMl07XG4gICAgfVxuXG4gICAgLy8g5Li65q+P5Liq6JeP5bmy5aKe5Yqg55u45bqU5p2D6YeN55qE5LqU6KGM5by65bqmXG4gICAgaGlkZUdhbi5mb3JFYWNoKChnYW4sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPCB3ZWlnaHRzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCB3dVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZ2FuKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBiYXNlV2VpZ2h0ICogd2VpZ2h0c1tpbmRleF07XG4gICAgICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgod3VYaW5nLCB2YWx1ZSwgZGV0YWlscywgJ2RpWmhpQ2FuZycpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruaciOS7pOWto+iKguiwg+aVtOS6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gbW9udGhCcmFuY2gg5pyI5pSvXG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKiBAcGFyYW0gc2Vhc29uQWRqdXN0IOWto+iKguiwg+aVtOezu+aVsOmFjee9rlxuICAgKiBAcGFyYW0gc2Vhc29uV3VYaW5nU3RhdHVzIOWto+iKguS6lOihjOWvueW6lOWFs+ezu+mFjee9rlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYWRqdXN0QnlNb250aFNlYXNvbkZvclN0cmVuZ3RoKFxuICAgIG1vbnRoQnJhbmNoOiBzdHJpbmcsXG4gICAgZGV0YWlsczogYW55LFxuICAgIHNlYXNvbkFkanVzdD86IGFueSxcbiAgICBzZWFzb25XdVhpbmdTdGF0dXM/OiBhbnlcbiAgKTogdm9pZCB7XG4gICAgLy8g5L2/55So6YWN572u5oiW6buY6K6k5YC8XG4gICAgY29uc3QgYWRqdXN0ID0gc2Vhc29uQWRqdXN0IHx8IHtcbiAgICAgIHdhbmc6IDIuMCwgICAvLyDml7rnm7jns7vmlbBcbiAgICAgIHhpYW5nOiAxLjAsICAvLyDnm7jml7rns7vmlbBcbiAgICAgIHBpbmc6IDAuMCwgICAvLyDlubPlkozns7vmlbBcbiAgICAgIHFpdTogLTEuMCwgICAvLyDlm5rns7vmlbBcbiAgICAgIHNpOiAtMS41ICAgICAvLyDmrbvns7vmlbBcbiAgICB9O1xuXG4gICAgbGV0IHNlYXNvbiA9ICcnO1xuICAgIGxldCB3dVhpbmdTdGF0dXM6IGFueSA9IHt9O1xuXG4gICAgaWYgKFsn5a+FJywgJ+WNrycsICfovrAnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOaYpeWto1xuICAgICAgc2Vhc29uID0gJ3NwcmluZyc7XG4gICAgICB3dVhpbmdTdGF0dXMgPSBzZWFzb25XdVhpbmdTdGF0dXMgPyBzZWFzb25XdVhpbmdTdGF0dXMuc3ByaW5nIDoge1xuICAgICAgICBtdTogJ3dhbmcnLCAgICAvLyDmnKjml7pcbiAgICAgICAgaHVvOiAneGlhbmcnLCAgLy8g54Gr55u4XG4gICAgICAgIHR1OiAncGluZycsICAgIC8vIOWcn+W5s1xuICAgICAgICBqaW46ICdxaXUnLCAgICAvLyDph5Hlm5pcbiAgICAgICAgc2h1aTogJ3NpJyAgICAgLy8g5rC05q27XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoWyflt7MnLCAn5Y2IJywgJ+acqiddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5aSP5a2jXG4gICAgICBzZWFzb24gPSAnc3VtbWVyJztcbiAgICAgIHd1WGluZ1N0YXR1cyA9IHNlYXNvbld1WGluZ1N0YXR1cyA/IHNlYXNvbld1WGluZ1N0YXR1cy5zdW1tZXIgOiB7XG4gICAgICAgIGh1bzogJ3dhbmcnLCAgIC8vIOeBq+aXulxuICAgICAgICB0dTogJ3hpYW5nJywgICAvLyDlnJ/nm7hcbiAgICAgICAgamluOiAncGluZycsICAgLy8g6YeR5bmzXG4gICAgICAgIHNodWk6ICdxaXUnLCAgIC8vIOawtOWbmlxuICAgICAgICBtdTogJ3NpJyAgICAgICAvLyDmnKjmrbtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChbJ+eUsycsICfphYknLCAn5oiMJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDnp4vlraNcbiAgICAgIHNlYXNvbiA9ICdhdXR1bW4nO1xuICAgICAgd3VYaW5nU3RhdHVzID0gc2Vhc29uV3VYaW5nU3RhdHVzID8gc2Vhc29uV3VYaW5nU3RhdHVzLmF1dHVtbiA6IHtcbiAgICAgICAgamluOiAnd2FuZycsICAgLy8g6YeR5pe6XG4gICAgICAgIHNodWk6ICd4aWFuZycsIC8vIOawtOebuFxuICAgICAgICBtdTogJ3BpbmcnLCAgICAvLyDmnKjlubNcbiAgICAgICAgaHVvOiAncWl1JywgICAgLy8g54Gr5ZuaXG4gICAgICAgIHR1OiAnc2knICAgICAgIC8vIOWcn+atu1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKFsn5LqlJywgJ+WtkCcsICfkuJEnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWGrOWto1xuICAgICAgc2Vhc29uID0gJ3dpbnRlcic7XG4gICAgICB3dVhpbmdTdGF0dXMgPSBzZWFzb25XdVhpbmdTdGF0dXMgPyBzZWFzb25XdVhpbmdTdGF0dXMud2ludGVyIDoge1xuICAgICAgICBzaHVpOiAnd2FuZycsICAvLyDmsLTml7pcbiAgICAgICAgbXU6ICd4aWFuZycsICAgLy8g5pyo55u4XG4gICAgICAgIGh1bzogJ3BpbmcnLCAgIC8vIOeBq+W5s1xuICAgICAgICB0dTogJ3FpdScsICAgICAvLyDlnJ/lm5pcbiAgICAgICAgamluOiAnc2knICAgICAgLy8g6YeR5q27XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIOW6lOeUqOiwg+aVtFxuICAgIE9iamVjdC5rZXlzKHd1WGluZ1N0YXR1cykuZm9yRWFjaCh3dVhpbmcgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzID0gd3VYaW5nU3RhdHVzW3d1WGluZ107XG4gICAgICBpZiAoZGV0YWlsc1t3dVhpbmddICYmIGFkanVzdFtzdGF0dXNdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGV0YWlsc1t3dVhpbmddLnNlYXNvbiArPSBhZGp1c3Rbc3RhdHVzXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmt7vliqDmnIjku6TlvZPku6TliqDmiJBcbiAgICogQHBhcmFtIG1vbnRoQnJhbmNoIOaciOaUr1xuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIG1vbnRoRG9taW5hbnRCb251cyDmnIjku6TlvZPku6TliqDmiJDphY3nva5cbiAgICogQHBhcmFtIG1vbnRoRG9taW5hbnRXdVhpbmcg5pyI5Luk5b2T5Luk5LqU6KGM5a+55bqU5YWz57O76YWN572uXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGRNb250aERvbWluYW50Qm9udXMoXG4gICAgbW9udGhCcmFuY2g6IHN0cmluZyxcbiAgICBkZXRhaWxzOiBhbnksXG4gICAgbW9udGhEb21pbmFudEJvbnVzPzogYW55LFxuICAgIG1vbnRoRG9taW5hbnRXdVhpbmc/OiBhbnlcbiAgKTogdm9pZCB7XG4gICAgLy8g5L2/55So6YWN572u5oiW6buY6K6k5YC8XG4gICAgY29uc3QgYm9udXMgPSBtb250aERvbWluYW50Qm9udXMgfHwge1xuICAgICAgZG9taW5hbnQ6IDEuNSwgICAvLyDlvZPku6TliqDmiJBcbiAgICAgIHJlbGF0ZWQ6IDAuOCwgICAgLy8g55u45pe65Yqg5oiQXG4gICAgICBuZXV0cmFsOiAwLjAsICAgIC8vIOW5s+WSjOWKoOaIkFxuICAgICAgd2VhazogLTAuNSwgICAgICAvLyDlm5rliqDmiJBcbiAgICAgIGRlYWQ6IC0wLjggICAgICAgLy8g5q275Yqg5oiQXG4gICAgfTtcblxuICAgIGxldCBzZWFzb24gPSAnJztcbiAgICBsZXQgZG9taW5hbnRJbmZvOiBhbnkgPSB7fTtcblxuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDmmKXlraNcbiAgICAgIHNlYXNvbiA9ICdzcHJpbmcnO1xuICAgICAgZG9taW5hbnRJbmZvID0gbW9udGhEb21pbmFudFd1WGluZyA/IG1vbnRoRG9taW5hbnRXdVhpbmcuc3ByaW5nIDoge1xuICAgICAgICBkb21pbmFudDogJ211JywgICAgLy8g5pyo5b2T5LukXG4gICAgICAgIHJlbGF0ZWQ6ICdodW8nICAgICAvLyDngavnm7jml7pcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChbJ+W3sycsICfljYgnLCAn5pyqJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDlpI/lraNcbiAgICAgIHNlYXNvbiA9ICdzdW1tZXInO1xuICAgICAgZG9taW5hbnRJbmZvID0gbW9udGhEb21pbmFudFd1WGluZyA/IG1vbnRoRG9taW5hbnRXdVhpbmcuc3VtbWVyIDoge1xuICAgICAgICBkb21pbmFudDogJ2h1bycsICAgLy8g54Gr5b2T5LukXG4gICAgICAgIHJlbGF0ZWQ6ICd0dScgICAgICAvLyDlnJ/nm7jml7pcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChbJ+eUsycsICfphYknLCAn5oiMJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDnp4vlraNcbiAgICAgIHNlYXNvbiA9ICdhdXR1bW4nO1xuICAgICAgZG9taW5hbnRJbmZvID0gbW9udGhEb21pbmFudFd1WGluZyA/IG1vbnRoRG9taW5hbnRXdVhpbmcuYXV0dW1uIDoge1xuICAgICAgICBkb21pbmFudDogJ2ppbicsICAgLy8g6YeR5b2T5LukXG4gICAgICAgIHJlbGF0ZWQ6ICdzaHVpJyAgICAvLyDmsLTnm7jml7pcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChbJ+S6pScsICflrZAnLCAn5LiRJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDlhqzlraNcbiAgICAgIHNlYXNvbiA9ICd3aW50ZXInO1xuICAgICAgZG9taW5hbnRJbmZvID0gbW9udGhEb21pbmFudFd1WGluZyA/IG1vbnRoRG9taW5hbnRXdVhpbmcud2ludGVyIDoge1xuICAgICAgICBkb21pbmFudDogJ3NodWknLCAgLy8g5rC05b2T5LukXG4gICAgICAgIHJlbGF0ZWQ6ICdtdScgICAgICAvLyDmnKjnm7jml7pcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5bqU55So5b2T5Luk5ZKM55u45pe65Yqg5oiQXG4gICAgaWYgKGRvbWluYW50SW5mby5kb21pbmFudCAmJiBkZXRhaWxzW2RvbWluYW50SW5mby5kb21pbmFudF0pIHtcbiAgICAgIGRldGFpbHNbZG9taW5hbnRJbmZvLmRvbWluYW50XS5tb250aERvbWluYW50ICs9IGJvbnVzLmRvbWluYW50O1xuICAgIH1cblxuICAgIGlmIChkb21pbmFudEluZm8ucmVsYXRlZCAmJiBkZXRhaWxzW2RvbWluYW50SW5mby5yZWxhdGVkXSkge1xuICAgICAgZGV0YWlsc1tkb21pbmFudEluZm8ucmVsYXRlZF0ubW9udGhEb21pbmFudCArPSBib251cy5yZWxhdGVkO1xuICAgIH1cblxuICAgIC8vIOW6lOeUqOWbmuWSjOatu+eahOi0n+mdouiwg+aVtO+8iOaWsOWinu+8iVxuICAgIC8vIOagueaNruWto+iKguS6lOihjOaXuuihsOWFs+ezu+ehruWumuWbmuWSjOatu+eahOS6lOihjFxuICAgIGNvbnN0IHd1WGluZ0xpc3QgPSBbJ2ppbicsICdtdScsICdzaHVpJywgJ2h1bycsICd0dSddO1xuICAgIGNvbnN0IGRvbWluYW50V3VYaW5nID0gZG9taW5hbnRJbmZvLmRvbWluYW50O1xuICAgIGNvbnN0IHJlbGF0ZWRXdVhpbmcgPSBkb21pbmFudEluZm8ucmVsYXRlZDtcblxuICAgIC8vIOaJvuWHuuW5s+WSjOOAgeWbmuWSjOatu+eahOS6lOihjFxuICAgIHd1WGluZ0xpc3QuZm9yRWFjaCh3dVhpbmcgPT4ge1xuICAgICAgaWYgKHd1WGluZyAhPT0gZG9taW5hbnRXdVhpbmcgJiYgd3VYaW5nICE9PSByZWxhdGVkV3VYaW5nKSB7XG4gICAgICAgIC8vIOagueaNruWto+iKguehruWumuS6lOihjOeKtuaAgVxuICAgICAgICBsZXQgc3RhdHVzID0gJ25ldXRyYWwnOyAvLyDpu5jorqTlubPlkoxcblxuICAgICAgICBpZiAoc2Vhc29uID09PSAnc3ByaW5nJykge1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICdqaW4nKSBzdGF0dXMgPSAnd2Vhayc7IC8vIOmHkeWbmlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICdzaHVpJykgc3RhdHVzID0gJ2RlYWQnOyAvLyDmsLTmrbtcbiAgICAgICAgfSBlbHNlIGlmIChzZWFzb24gPT09ICdzdW1tZXInKSB7XG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ3NodWknKSBzdGF0dXMgPSAnd2Vhayc7IC8vIOawtOWbmlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICdtdScpIHN0YXR1cyA9ICdkZWFkJzsgLy8g5pyo5q27XG4gICAgICAgIH0gZWxzZSBpZiAoc2Vhc29uID09PSAnYXV0dW1uJykge1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICdodW8nKSBzdGF0dXMgPSAnd2Vhayc7IC8vIOeBq+WbmlxuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICd0dScpIHN0YXR1cyA9ICdkZWFkJzsgLy8g5Zyf5q27XG4gICAgICAgIH0gZWxzZSBpZiAoc2Vhc29uID09PSAnd2ludGVyJykge1xuICAgICAgICAgIGlmICh3dVhpbmcgPT09ICd0dScpIHN0YXR1cyA9ICd3ZWFrJzsgLy8g5Zyf5ZuaXG4gICAgICAgICAgaWYgKHd1WGluZyA9PT0gJ2ppbicpIHN0YXR1cyA9ICdkZWFkJzsgLy8g6YeR5q27XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlupTnlKjnm7jlupTnmoTliqDmiJBcbiAgICAgICAgaWYgKGJvbnVzW3N0YXR1c10gJiYgZGV0YWlsc1t3dVhpbmddKSB7XG4gICAgICAgICAgZGV0YWlsc1t3dVhpbmddLm1vbnRoRG9taW5hbnQgKz0gYm9udXNbc3RhdHVzXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWbm+afsee7hOWQiOWFs+ezu+iwg+aVtOS6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIGNvbWJpbmF0aW9uV2VpZ2h0IOe7hOWQiOWFs+ezu+adg+mHjemFjee9rlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYWRqdXN0QnlDb21iaW5hdGlvbkZvclN0cmVuZ3RoKGVpZ2h0Q2hhcjogRWlnaHRDaGFyLCBkZXRhaWxzOiBhbnksIGNvbWJpbmF0aW9uV2VpZ2h0PzogYW55KTogdm9pZCB7XG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g5qOA5p+l5aSp5bmy5ZCI5YyWXG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbkZvclN0cmVuZ3RoKHllYXJTdGVtLCBtb250aFN0ZW0sIGRldGFpbHMsIGNvbWJpbmF0aW9uV2VpZ2h0KTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoeWVhclN0ZW0sIGRheVN0ZW0sIGRldGFpbHMsIGNvbWJpbmF0aW9uV2VpZ2h0KTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoeWVhclN0ZW0sIHRpbWVTdGVtLCBkZXRhaWxzLCBjb21iaW5hdGlvbldlaWdodCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbkZvclN0cmVuZ3RoKG1vbnRoU3RlbSwgZGF5U3RlbSwgZGV0YWlscywgY29tYmluYXRpb25XZWlnaHQpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aChtb250aFN0ZW0sIHRpbWVTdGVtLCBkZXRhaWxzLCBjb21iaW5hdGlvbldlaWdodCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbkZvclN0cmVuZ3RoKGRheVN0ZW0sIHRpbWVTdGVtLCBkZXRhaWxzLCBjb21iaW5hdGlvbldlaWdodCk7XG5cbiAgICAvLyDmo4Dmn6XlnLDmlK/nu4TlkIjvvIjkuInlkIjjgIHkuInkvJrjgIHlha3lkIjnrYnvvIlcbiAgICB0aGlzLmNoZWNrQnJhbmNoVHJpcGxlRm9yU3RyZW5ndGgoeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgdGltZUJyYW5jaCwgZGV0YWlscywgY29tYmluYXRpb25XZWlnaHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWkqeW5suWQiOWMllxuICAgKiBAcGFyYW0gc3RlbTEg5aSp5bmyMVxuICAgKiBAcGFyYW0gc3RlbTIg5aSp5bmyMlxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIGNvbWJpbmF0aW9uV2VpZ2h0IOe7hOWQiOWFs+ezu+adg+mHjemFjee9rlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aChzdGVtMTogc3RyaW5nLCBzdGVtMjogc3RyaW5nLCBkZXRhaWxzOiBhbnksIGNvbWJpbmF0aW9uV2VpZ2h0PzogYW55KTogdm9pZCB7XG4gICAgLy8g5L2/55So6YWN572u5oiW6buY6K6k5YC8XG4gICAgY29uc3QgdGlhbkdhbld1SGVWYWx1ZSA9IGNvbWJpbmF0aW9uV2VpZ2h0ID8gY29tYmluYXRpb25XZWlnaHQudGlhbkdhbld1SGUgOiAwLjY7XG5cbiAgICAvLyDlpKnlubLkupTlkIjvvJrnlLLlt7HlkIjljJblnJ/jgIHkuZnluprlkIjljJbph5HjgIHkuJnovpvlkIjljJbmsLTjgIHkuIHlo6zlkIjljJbmnKjjgIHmiIrnmbjlkIjljJbngatcbiAgICBjb25zdCBjb21iaW5hdGlvbnM6IHtba2V5OiBzdHJpbmddOiB7cmVzdWx0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXJ9fSA9IHtcbiAgICAgICfnlLLlt7EnOiB7cmVzdWx0OiAn5ZyfJywgdmFsdWU6IHRpYW5HYW5XdUhlVmFsdWV9LFxuICAgICAgJ+W3seeUsic6IHtyZXN1bHQ6ICflnJ8nLCB2YWx1ZTogdGlhbkdhbld1SGVWYWx1ZX0sXG4gICAgICAn5LmZ5bqaJzoge3Jlc3VsdDogJ+mHkScsIHZhbHVlOiB0aWFuR2FuV3VIZVZhbHVlfSxcbiAgICAgICfluprkuZknOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IHRpYW5HYW5XdUhlVmFsdWV9LFxuICAgICAgJ+S4mei+myc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogdGlhbkdhbld1SGVWYWx1ZX0sXG4gICAgICAn6L6b5LiZJzoge3Jlc3VsdDogJ+awtCcsIHZhbHVlOiB0aWFuR2FuV3VIZVZhbHVlfSxcbiAgICAgICfkuIHlo6wnOiB7cmVzdWx0OiAn5pyoJywgdmFsdWU6IHRpYW5HYW5XdUhlVmFsdWV9LFxuICAgICAgJ+WjrOS4gSc6IHtyZXN1bHQ6ICfmnKgnLCB2YWx1ZTogdGlhbkdhbld1SGVWYWx1ZX0sXG4gICAgICAn5oiK55m4Jzoge3Jlc3VsdDogJ+eBqycsIHZhbHVlOiB0aWFuR2FuV3VIZVZhbHVlfSxcbiAgICAgICfnmbjmiIonOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IHRpYW5HYW5XdUhlVmFsdWV9XG4gICAgfTtcblxuICAgIGNvbnN0IGtleSA9IHN0ZW0xICsgc3RlbTI7XG4gICAgaWYgKGNvbWJpbmF0aW9uc1trZXldKSB7XG4gICAgICBjb25zdCB7cmVzdWx0LCB2YWx1ZX0gPSBjb21iaW5hdGlvbnNba2V5XTtcbiAgICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgocmVzdWx0LCB2YWx1ZSwgZGV0YWlscywgJ2NvbWJpbmF0aW9uJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWcsOaUr+S4ieWQiOWSjOS4ieS8mlxuICAgKiBAcGFyYW0gYnJhbmNoMSDlnLDmlK8xXG4gICAqIEBwYXJhbSBicmFuY2gyIOWcsOaUrzJcbiAgICogQHBhcmFtIGJyYW5jaDMg5Zyw5pSvM1xuICAgKiBAcGFyYW0gYnJhbmNoNCDlnLDmlK80XG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKiBAcGFyYW0gY29tYmluYXRpb25XZWlnaHQg57uE5ZCI5YWz57O75p2D6YeN6YWN572uXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja0JyYW5jaFRyaXBsZUZvclN0cmVuZ3RoKFxuICAgIGJyYW5jaDE6IHN0cmluZyxcbiAgICBicmFuY2gyOiBzdHJpbmcsXG4gICAgYnJhbmNoMzogc3RyaW5nLFxuICAgIGJyYW5jaDQ6IHN0cmluZyxcbiAgICBkZXRhaWxzOiBhbnksXG4gICAgY29tYmluYXRpb25XZWlnaHQ/OiBhbnlcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgYnJhbmNoZXMgPSBbYnJhbmNoMSwgYnJhbmNoMiwgYnJhbmNoMywgYnJhbmNoNF07XG5cbiAgICAvLyDkvb/nlKjphY3nva7miJbpu5jorqTlgLxcbiAgICBjb25zdCBzYW5IZVZhbHVlID0gY29tYmluYXRpb25XZWlnaHQgPyBjb21iaW5hdGlvbldlaWdodC5kaVpoaVNhbkhlIDogMS4yO1xuICAgIGNvbnN0IHNhbkh1aVZhbHVlID0gY29tYmluYXRpb25XZWlnaHQgPyBjb21iaW5hdGlvbldlaWdodC5kaVpoaVNhbkh1aSA6IDEuMDtcbiAgICBjb25zdCBwYXJ0aWFsU2FuSGVWYWx1ZSA9IGNvbWJpbmF0aW9uV2VpZ2h0ID8gY29tYmluYXRpb25XZWlnaHQucGFydGlhbFNhbkhlIDogMC45O1xuICAgIGNvbnN0IHBhcnRpYWxTYW5IdWlWYWx1ZSA9IGNvbWJpbmF0aW9uV2VpZ2h0ID8gY29tYmluYXRpb25XZWlnaHQucGFydGlhbFNhbkh1aSA6IDAuNztcblxuICAgIC8vIOajgOafpeS4ieWQiOWxgFxuICAgIGNvbnN0IHNhbkhlSnUgPSB0aGlzLmNoZWNrU2FuSGVKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkhlSnUpIHtcbiAgICAgIC8vIOajgOafpeaYr+WujOaVtOS4ieWQiOi/mOaYr+mDqOWIhuS4ieWQiFxuICAgICAgY29uc3Qgc2FuSGVQYXR0ZXJucyA9IHtcbiAgICAgICAgJ+eBqyc6IFsn5a+FJywgJ+WNiCcsICfmiIwnXSxcbiAgICAgICAgJ+awtCc6IFsn55SzJywgJ+WtkCcsICfovrAnXSxcbiAgICAgICAgJ+acqCc6IFsn5LqlJywgJ+WNrycsICfmnKonXSxcbiAgICAgICAgJ+mHkSc6IFsn5bezJywgJ+mFiScsICfkuJEnXVxuICAgICAgfTtcblxuICAgICAgY29uc3QgcGF0dGVybiA9IHNhbkhlUGF0dGVybnNbc2FuSGVKdV07XG4gICAgICBjb25zdCBtYXRjaGVkQnJhbmNoZXMgPSBicmFuY2hlcy5maWx0ZXIoYnJhbmNoID0+IHBhdHRlcm4uaW5jbHVkZXMoYnJhbmNoKSk7XG4gICAgICBjb25zdCB1bmlxdWVCcmFuY2hlcyA9IG5ldyBTZXQobWF0Y2hlZEJyYW5jaGVzKTtcblxuICAgICAgLy8g5qC55o2u5Yy56YWN55qE5Zyw5pSv5pWw6YeP5Yaz5a6a5L2/55So5a6M5pW05YC86L+Y5piv6YOo5YiG5YC8XG4gICAgICBpZiAodW5pcXVlQnJhbmNoZXMuc2l6ZSA9PT0gMykge1xuICAgICAgICAvLyDlrozmlbTkuInlkIhcbiAgICAgICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aChzYW5IZUp1LCBzYW5IZVZhbHVlLCBkZXRhaWxzLCAnY29tYmluYXRpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIOmDqOWIhuS4ieWQiFxuICAgICAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHNhbkhlSnUsIHBhcnRpYWxTYW5IZVZhbHVlLCBkZXRhaWxzLCAnY29tYmluYXRpb24nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XkuInkvJrlsYBcbiAgICBjb25zdCBzYW5IdWlKdSA9IHRoaXMuY2hlY2tTYW5IdWlKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICAvLyDmo4Dmn6XmmK/lrozmlbTkuInkvJrov5jmmK/pg6jliIbkuInkvJpcbiAgICAgIGNvbnN0IHNhbkh1aVBhdHRlcm5zID0ge1xuICAgICAgICAn5pyoJzogWyflr4UnLCAn5Y2vJywgJ+i+sCddLFxuICAgICAgICAn54GrJzogWyflt7MnLCAn5Y2IJywgJ+acqiddLFxuICAgICAgICAn6YeRJzogWyfnlLMnLCAn6YWJJywgJ+aIjCddLFxuICAgICAgICAn5rC0JzogWyfkuqUnLCAn5a2QJywgJ+S4kSddXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwYXR0ZXJuID0gc2FuSHVpUGF0dGVybnNbc2FuSHVpSnVdO1xuICAgICAgY29uc3QgbWF0Y2hlZEJyYW5jaGVzID0gYnJhbmNoZXMuZmlsdGVyKGJyYW5jaCA9PiBwYXR0ZXJuLmluY2x1ZGVzKGJyYW5jaCkpO1xuICAgICAgY29uc3QgdW5pcXVlQnJhbmNoZXMgPSBuZXcgU2V0KG1hdGNoZWRCcmFuY2hlcyk7XG5cbiAgICAgIC8vIOagueaNruWMuemFjeeahOWcsOaUr+aVsOmHj+WGs+WumuS9v+eUqOWujOaVtOWAvOi/mOaYr+mDqOWIhuWAvFxuICAgICAgaWYgKHVuaXF1ZUJyYW5jaGVzLnNpemUgPT09IDMpIHtcbiAgICAgICAgLy8g5a6M5pW05LiJ5LyaXG4gICAgICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgoc2FuSHVpSnUsIHNhbkh1aVZhbHVlLCBkZXRhaWxzLCAnY29tYmluYXRpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIOmDqOWIhuS4ieS8mlxuICAgICAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHNhbkh1aUp1LCBwYXJ0aWFsU2FuSHVpVmFsdWUsIGRldGFpbHMsICdjb21iaW5hdGlvbicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cblxuICAvKipcbiAgICog5aSE55CG5Zyw5pSv6JeP5bmy55qE5LqU6KGM5by65bqm5bm26L+U5Zue6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSBoaWRlR2FuIOiXj+W5suaVsOe7hFxuICAgKiBAcGFyYW0gYmFzZVdlaWdodCDln7rnoYDmnYPph41cbiAgICogQHBhcmFtIGFkZFN0cmVuZ3RoIOWinuWKoOW8uuW6pueahOWHveaVsFxuICAgKiBAcmV0dXJucyDmr4/kuKrol4/lubLnmoTmnYPph43lgLzmlbDnu4RcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHByb2Nlc3NIaWRlR2FuV2l0aERldGFpbHMoaGlkZUdhbjogc3RyaW5nW10sIGJhc2VXZWlnaHQ6IG51bWJlciwgYWRkU3RyZW5ndGg6ICh3dVhpbmc6IHN0cmluZywgdmFsdWU6IG51bWJlcikgPT4gdm9pZCk6IG51bWJlcltdIHtcbiAgICBpZiAoIWhpZGVHYW4gfHwgaGlkZUdhbi5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuICAgIC8vIOagueaNruiXj+W5suaVsOmHj+WIhumFjeadg+mHjVxuICAgIC8vIOS4gOS4quiXj+W5su+8mjEwMCXmnYPph41cbiAgICAvLyDkuKTkuKrol4/lubLvvJo2MCXlkow0MCXmnYPph41cbiAgICAvLyDkuInkuKrol4/lubLvvJo1MCXjgIEzMCXlkowyMCXmnYPph41cbiAgICBjb25zdCB3ZWlnaHRzID0gaGlkZUdhbi5sZW5ndGggPT09IDEgPyBbMS4wXSA6XG4gICAgICAgICAgICAgICAgICAgaGlkZUdhbi5sZW5ndGggPT09IDIgPyBbMC42LCAwLjRdIDpcbiAgICAgICAgICAgICAgICAgICBbMC41LCAwLjMsIDAuMl07XG5cbiAgICBjb25zdCB2YWx1ZXM6IG51bWJlcltdID0gW107XG5cbiAgICAvLyDkuLrmr4/kuKrol4/lubLlop7liqDnm7jlupTmnYPph43nmoTkupTooYzlvLrluqZcbiAgICBoaWRlR2FuLmZvckVhY2goKGdhbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA8IHdlaWdodHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGJhc2VXZWlnaHQgKiB3ZWlnaHRzW2luZGV4XTtcbiAgICAgICAgYWRkU3RyZW5ndGgod3VYaW5nLCB2YWx1ZSk7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5pyI5Luk5a2j6IqC6LCD5pW05LqU6KGM5by65bqmXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYWRqdXN0QnlNb250aFNlYXNvbihtb250aEJyYW5jaDogc3RyaW5nLCBzdHJlbmd0aDogeyBqaW46IG51bWJlcjsgbXU6IG51bWJlcjsgc2h1aTogbnVtYmVyOyBodW86IG51bWJlcjsgdHU6IG51bWJlciB9KTogdm9pZCB7XG4gICAgLy8g5qC55o2u5pyI5Luk5a2j6IqC6LCD5pW05LqU6KGM5by65bqmXG4gICAgLy8g5pil5a2jKOWvheWNr+i+sCnvvJrmnKjml7ooKzEuMCnvvIzngavnm7goKzAuNSnvvIzlnJ/kvJHvvIzph5Hlm5rvvIzmsLTmrbtcbiAgICAvLyDlpI/lraMo5bez5Y2I5pyqKe+8mueBq+aXuigrMS4wKe+8jOWcn+ebuCgrMC41Ke+8jOmHkeS8ke+8jOawtOWbmu+8jOacqOatu1xuICAgIC8vIOeni+WtoyjnlLPphYnmiIwp77ya6YeR5pe6KCsxLjAp77yM5rC055u4KCswLjUp77yM5pyo5LyR77yM54Gr5Zua77yM5Zyf5q27XG4gICAgLy8g5Yas5a2jKOS6peWtkOS4kSnvvJrmsLTml7ooKzEuMCnvvIzmnKjnm7goKzAuNSnvvIzngavkvJHvvIzlnJ/lm5rvvIzph5HmrbtcblxuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDmmKXlraNcbiAgICAgIHN0cmVuZ3RoLm11ICs9IDEuMDsgLy8g5pyo5pe6XG4gICAgICBzdHJlbmd0aC5odW8gKz0gMC41OyAvLyDngavnm7hcbiAgICB9IGVsc2UgaWYgKFsn5bezJywgJ+WNiCcsICfmnKonXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWkj+Wto1xuICAgICAgc3RyZW5ndGguaHVvICs9IDEuMDsgLy8g54Gr5pe6XG4gICAgICBzdHJlbmd0aC50dSArPSAwLjU7IC8vIOWcn+ebuFxuICAgIH0gZWxzZSBpZiAoWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g56eL5a2jXG4gICAgICBzdHJlbmd0aC5qaW4gKz0gMS4wOyAvLyDph5Hml7pcbiAgICAgIHN0cmVuZ3RoLnNodWkgKz0gMC41OyAvLyDmsLTnm7hcbiAgICB9IGVsc2UgaWYgKFsn5LqlJywgJ+WtkCcsICfkuJEnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWGrOWto1xuICAgICAgc3RyZW5ndGguc2h1aSArPSAxLjA7IC8vIOawtOaXulxuICAgICAgc3RyZW5ndGgubXUgKz0gMC41OyAvLyDmnKjnm7hcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5pyI5Luk5a2j6IqC6LCD5pW05LqU6KGM5by65bqm5bm26K6w5b2V6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFkanVzdEJ5TW9udGhTZWFzb25XaXRoRGV0YWlscyhcbiAgICBtb250aEJyYW5jaDogc3RyaW5nLFxuICAgIHN0cmVuZ3RoOiB7IGppbjogbnVtYmVyOyBtdTogbnVtYmVyOyBzaHVpOiBudW1iZXI7IGh1bzogbnVtYmVyOyB0dTogbnVtYmVyIH0sXG4gICAgZGV0YWlsczogYW55XG4gICk6IHZvaWQge1xuICAgIGxldCBzZWFzb24gPSAnJztcbiAgICBjb25zdCBhZGp1c3RtZW50czogeyB3dVhpbmc6IHN0cmluZzsgdmFsdWU6IG51bWJlcjsgfVtdID0gW107XG5cbiAgICBpZiAoWyflr4UnLCAn5Y2vJywgJ+i+sCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5pil5a2jXG4gICAgICBzZWFzb24gPSAn5pil5a2jJztcbiAgICAgIHN0cmVuZ3RoLm11ICs9IDEuMDsgLy8g5pyo5pe6XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn5pyoJywgdmFsdWU6IDEuMCB9KTtcblxuICAgICAgc3RyZW5ndGguaHVvICs9IDAuNTsgLy8g54Gr55u4XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn54GrJywgdmFsdWU6IDAuNSB9KTtcbiAgICB9IGVsc2UgaWYgKFsn5bezJywgJ+WNiCcsICfmnKonXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWkj+Wto1xuICAgICAgc2Vhc29uID0gJ+Wkj+Wtoyc7XG4gICAgICBzdHJlbmd0aC5odW8gKz0gMS4wOyAvLyDngavml7pcbiAgICAgIGFkanVzdG1lbnRzLnB1c2goeyB3dVhpbmc6ICfngasnLCB2YWx1ZTogMS4wIH0pO1xuXG4gICAgICBzdHJlbmd0aC50dSArPSAwLjU7IC8vIOWcn+ebuFxuICAgICAgYWRqdXN0bWVudHMucHVzaCh7IHd1WGluZzogJ+WcnycsIHZhbHVlOiAwLjUgfSk7XG4gICAgfSBlbHNlIGlmIChbJ+eUsycsICfphYknLCAn5oiMJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDnp4vlraNcbiAgICAgIHNlYXNvbiA9ICfnp4vlraMnO1xuICAgICAgc3RyZW5ndGguamluICs9IDEuMDsgLy8g6YeR5pe6XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn6YeRJywgdmFsdWU6IDEuMCB9KTtcblxuICAgICAgc3RyZW5ndGguc2h1aSArPSAwLjU7IC8vIOawtOebuFxuICAgICAgYWRqdXN0bWVudHMucHVzaCh7IHd1WGluZzogJ+awtCcsIHZhbHVlOiAwLjUgfSk7XG4gICAgfSBlbHNlIGlmIChbJ+S6pScsICflrZAnLCAn5LiRJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDlhqzlraNcbiAgICAgIHNlYXNvbiA9ICflhqzlraMnO1xuICAgICAgc3RyZW5ndGguc2h1aSArPSAxLjA7IC8vIOawtOaXulxuICAgICAgYWRqdXN0bWVudHMucHVzaCh7IHd1WGluZzogJ+awtCcsIHZhbHVlOiAxLjAgfSk7XG5cbiAgICAgIHN0cmVuZ3RoLm11ICs9IDAuNTsgLy8g5pyo55u4XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn5pyoJywgdmFsdWU6IDAuNSB9KTtcbiAgICB9XG5cbiAgICBkZXRhaWxzLnNlYXNvbkFkanVzdC5zZWFzb24gPSBzZWFzb247XG4gICAgZGV0YWlscy5zZWFzb25BZGp1c3QuYWRqdXN0bWVudHMgPSBhZGp1c3RtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lm5vmn7Hnu4TlkIjlhbPns7vosIPmlbTkupTooYzlvLrluqZcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYWRqdXN0QnlDb21iaW5hdGlvbihlaWdodENoYXI6IEVpZ2h0Q2hhciwgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIC8vIOiOt+WPluWbm+afseW5suaUr1xuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCB5ZWFyQnJhbmNoID0gZWlnaHRDaGFyLmdldFllYXJaaGkoKTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRNb250aFpoaSgpO1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcbiAgICBjb25zdCB0aW1lQnJhbmNoID0gZWlnaHRDaGFyLmdldFRpbWVaaGkoKTtcblxuICAgIC8vIOajgOafpeWkqeW5suWQiOWMllxuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb24oeWVhclN0ZW0sIG1vbnRoU3RlbSwgc3RyZW5ndGgpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb24oeWVhclN0ZW0sIGRheVN0ZW0sIHN0cmVuZ3RoKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uKHllYXJTdGVtLCB0aW1lU3RlbSwgc3RyZW5ndGgpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb24obW9udGhTdGVtLCBkYXlTdGVtLCBzdHJlbmd0aCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbihtb250aFN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbihkYXlTdGVtLCB0aW1lU3RlbSwgc3RyZW5ndGgpO1xuXG4gICAgLy8g5qOA5p+l5Zyw5pSv57uE5ZCI77yI5LiJ5ZCI44CB5LiJ5Lya44CB5YWt5ZCI562J77yJXG4gICAgLy8g6L+Z6YeM5Y+q5a6e546w566A5YyW54mI55qE5Zyw5pSv5LiJ5ZCIXG4gICAgdGhpcy5jaGVja0JyYW5jaFRyaXBsZSh5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCB0aW1lQnJhbmNoLCBzdHJlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5Zub5p+x57uE5ZCI5YWz57O76LCD5pW05LqU6KGM5by65bqm5bm26K6w5b2V6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEBwYXJhbSBzdHJlbmd0aCDkupTooYzlvLrluqblr7nosaFcbiAgICogQHBhcmFtIGRldGFpbHMg6K+m57uG5L+h5oGv5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGp1c3RCeUNvbWJpbmF0aW9uV2l0aERldGFpbHMoXG4gICAgZWlnaHRDaGFyOiBFaWdodENoYXIsXG4gICAgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSxcbiAgICBkZXRhaWxzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgY29uc3QgY29tYmluYXRpb25zOiB7IHR5cGU6IHN0cmluZzsgc3RlbXM6IHN0cmluZ1tdOyB3dVhpbmc6IHN0cmluZzsgdmFsdWU6IG51bWJlcjsgfVtdID0gW107XG5cbiAgICAvLyDmo4Dmn6XlpKnlubLlkIjljJZcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMoeWVhclN0ZW0sIG1vbnRoU3RlbSwgc3RyZW5ndGgsIGNvbWJpbmF0aW9ucyk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbldpdGhEZXRhaWxzKHllYXJTdGVtLCBkYXlTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMoeWVhclN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMobW9udGhTdGVtLCBkYXlTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMobW9udGhTdGVtLCB0aW1lU3RlbSwgc3RyZW5ndGgsIGNvbWJpbmF0aW9ucyk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbldpdGhEZXRhaWxzKGRheVN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcblxuICAgIC8vIOajgOafpeWcsOaUr+e7hOWQiO+8iOS4ieWQiOOAgeS4ieS8muOAgeWFreWQiOetie+8iVxuICAgIC8vIOi/memHjOWPquWunueOsOeugOWMlueJiOeahOWcsOaUr+S4ieWQiFxuICAgIHRoaXMuY2hlY2tCcmFuY2hUcmlwbGVXaXRoRGV0YWlscyh5ZWFyQnJhbmNoLCBtb250aEJyYW5jaCwgZGF5QnJhbmNoLCB0aW1lQnJhbmNoLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcblxuICAgIGRldGFpbHMuY29tYmluYXRpb25BZGp1c3QuY29tYmluYXRpb25zID0gY29tYmluYXRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWkqeW5suWQiOWMllxuICAgKiBAcGFyYW0gc3RlbTEg5aSp5bmyMVxuICAgKiBAcGFyYW0gc3RlbTIg5aSp5bmyMlxuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja1N0ZW1Db21iaW5hdGlvbihzdGVtMTogc3RyaW5nLCBzdGVtMjogc3RyaW5nLCBzdHJlbmd0aDogeyBqaW46IG51bWJlcjsgbXU6IG51bWJlcjsgc2h1aTogbnVtYmVyOyBodW86IG51bWJlcjsgdHU6IG51bWJlciB9KTogdm9pZCB7XG4gICAgLy8g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5YyW5Zyf44CB5LmZ5bqa5ZCI5YyW6YeR44CB5LiZ6L6b5ZCI5YyW5rC044CB5LiB5aOs5ZCI5YyW5pyo44CB5oiK55m45ZCI5YyW54GrXG4gICAgY29uc3QgY29tYmluYXRpb25zOiB7W2tleTogc3RyaW5nXToge3Jlc3VsdDogc3RyaW5nLCB2YWx1ZTogbnVtYmVyfX0gPSB7XG4gICAgICAn55Sy5bexJzoge3Jlc3VsdDogJ+WcnycsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+W3seeUsic6IHtyZXN1bHQ6ICflnJ8nLCB2YWx1ZTogMC42fSxcbiAgICAgICfkuZnluponOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5bqa5LmZJzoge3Jlc3VsdDogJ+mHkScsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+S4mei+myc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogMC42fSxcbiAgICAgICfovpvkuJknOiB7cmVzdWx0OiAn5rC0JywgdmFsdWU6IDAuNn0sXG4gICAgICAn5LiB5aOsJzoge3Jlc3VsdDogJ+acqCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+WjrOS4gSc6IHtyZXN1bHQ6ICfmnKgnLCB2YWx1ZTogMC42fSxcbiAgICAgICfmiIrnmbgnOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IDAuNn0sXG4gICAgICAn55m45oiKJzoge3Jlc3VsdDogJ+eBqycsIHZhbHVlOiAwLjZ9XG4gICAgfTtcblxuICAgIGNvbnN0IGtleSA9IHN0ZW0xICsgc3RlbTI7XG4gICAgaWYgKGNvbWJpbmF0aW9uc1trZXldKSB7XG4gICAgICBjb25zdCB7cmVzdWx0LCB2YWx1ZX0gPSBjb21iaW5hdGlvbnNba2V5XTtcbiAgICAgIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgICAgIGNhc2UgJ+mHkSc6IHN0cmVuZ3RoLmppbiArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+acqCc6IHN0cmVuZ3RoLm11ICs9IHZhbHVlOyBicmVhaztcbiAgICAgICAgY2FzZSAn5rC0Jzogc3RyZW5ndGguc2h1aSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+eBqyc6IHN0cmVuZ3RoLmh1byArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+Wcnyc6IHN0cmVuZ3RoLnR1ICs9IHZhbHVlOyBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5aSp5bmy5ZCI5YyW5bm26K6w5b2V6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSBzdGVtMSDlpKnlubIxXG4gICAqIEBwYXJhbSBzdGVtMiDlpKnlubIyXG4gICAqIEBwYXJhbSBzdHJlbmd0aCDkupTooYzlvLrluqblr7nosaFcbiAgICogQHBhcmFtIGNvbWJpbmF0aW9ucyDnu4TlkIjkv6Hmga/mlbDnu4RcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMoXG4gICAgc3RlbTE6IHN0cmluZyxcbiAgICBzdGVtMjogc3RyaW5nLFxuICAgIHN0cmVuZ3RoOiB7IGppbjogbnVtYmVyOyBtdTogbnVtYmVyOyBzaHVpOiBudW1iZXI7IGh1bzogbnVtYmVyOyB0dTogbnVtYmVyIH0sXG4gICAgY29tYmluYXRpb25zOiB7IHR5cGU6IHN0cmluZzsgc3RlbXM6IHN0cmluZ1tdOyB3dVhpbmc6IHN0cmluZzsgdmFsdWU6IG51bWJlcjsgfVtdXG4gICk6IHZvaWQge1xuICAgIC8vIOWkqeW5suS6lOWQiO+8mueUsuW3seWQiOWMluWcn+OAgeS5meW6muWQiOWMlumHkeOAgeS4mei+m+WQiOWMluawtOOAgeS4geWjrOWQiOWMluacqOOAgeaIiueZuOWQiOWMlueBq1xuICAgIGNvbnN0IGNvbWJpbmF0aW9uTWFwOiB7W2tleTogc3RyaW5nXToge3Jlc3VsdDogc3RyaW5nLCB2YWx1ZTogbnVtYmVyfX0gPSB7XG4gICAgICAn55Sy5bexJzoge3Jlc3VsdDogJ+WcnycsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+W3seeUsic6IHtyZXN1bHQ6ICflnJ8nLCB2YWx1ZTogMC42fSxcbiAgICAgICfkuZnluponOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5bqa5LmZJzoge3Jlc3VsdDogJ+mHkScsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+S4mei+myc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogMC42fSxcbiAgICAgICfovpvkuJknOiB7cmVzdWx0OiAn5rC0JywgdmFsdWU6IDAuNn0sXG4gICAgICAn5LiB5aOsJzoge3Jlc3VsdDogJ+acqCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+WjrOS4gSc6IHtyZXN1bHQ6ICfmnKgnLCB2YWx1ZTogMC42fSxcbiAgICAgICfmiIrnmbgnOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IDAuNn0sXG4gICAgICAn55m45oiKJzoge3Jlc3VsdDogJ+eBqycsIHZhbHVlOiAwLjZ9XG4gICAgfTtcblxuICAgIGNvbnN0IGtleSA9IHN0ZW0xICsgc3RlbTI7XG4gICAgaWYgKGNvbWJpbmF0aW9uTWFwW2tleV0pIHtcbiAgICAgIGNvbnN0IHtyZXN1bHQsIHZhbHVlfSA9IGNvbWJpbmF0aW9uTWFwW2tleV07XG4gICAgICBzd2l0Y2ggKHJlc3VsdCkge1xuICAgICAgICBjYXNlICfph5EnOiBzdHJlbmd0aC5qaW4gKz0gdmFsdWU7IGJyZWFrO1xuICAgICAgICBjYXNlICfmnKgnOiBzdHJlbmd0aC5tdSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+awtCc6IHN0cmVuZ3RoLnNodWkgKz0gdmFsdWU7IGJyZWFrO1xuICAgICAgICBjYXNlICfngasnOiBzdHJlbmd0aC5odW8gKz0gdmFsdWU7IGJyZWFrO1xuICAgICAgICBjYXNlICflnJ8nOiBzdHJlbmd0aC50dSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIOiusOW9lee7hOWQiOS/oeaBr1xuICAgICAgY29tYmluYXRpb25zLnB1c2goe1xuICAgICAgICB0eXBlOiAn5aSp5bmy5LqU5ZCIJyxcbiAgICAgICAgc3RlbXM6IFtzdGVtMSwgc3RlbTJdLFxuICAgICAgICB3dVhpbmc6IHJlc3VsdCxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5Zyw5pSv5LiJ5ZCI5ZKM5LiJ5LyaXG4gICAqIEBwYXJhbSBicmFuY2gxIOWcsOaUrzFcbiAgICogQHBhcmFtIGJyYW5jaDIg5Zyw5pSvMlxuICAgKiBAcGFyYW0gYnJhbmNoMyDlnLDmlK8zXG4gICAqIEBwYXJhbSBicmFuY2g0IOWcsOaUrzRcbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tCcmFuY2hUcmlwbGUoYnJhbmNoMTogc3RyaW5nLCBicmFuY2gyOiBzdHJpbmcsIGJyYW5jaDM6IHN0cmluZywgYnJhbmNoNDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVuZ3RoOiB7IGppbjogbnVtYmVyOyBtdTogbnVtYmVyOyBzaHVpOiBudW1iZXI7IGh1bzogbnVtYmVyOyB0dTogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICAvLyDlnLDmlK/kuInlkIjvvJpcbiAgICAvLyDlr4XljYjmiIzkuInlkIjngavlsYBcbiAgICAvLyDkuqXlja/mnKrkuInlkIjmnKjlsYBcbiAgICAvLyDnlLPlrZDovrDkuInlkIjmsLTlsYBcbiAgICAvLyDlt7PphYnkuJHkuInlkIjph5HlsYBcblxuICAgIGNvbnN0IGJyYW5jaGVzID0gW2JyYW5jaDEsIGJyYW5jaDIsIGJyYW5jaDMsIGJyYW5jaDRdO1xuXG4gICAgLy8g5qOA5p+l5LiJ5ZCI5bGAXG4gICAgY29uc3Qgc2FuSGVKdSA9IHRoaXMuY2hlY2tTYW5IZUp1KGJyYW5jaGVzKTtcbiAgICBpZiAoc2FuSGVKdSkge1xuICAgICAgaWYgKHNhbkhlSnUgPT09ICfngasnKSBzdHJlbmd0aC5odW8gKz0gMS4yOyAvLyDmj5Dpq5jkuInlkIjlsYDmnYPph41cbiAgICAgIGVsc2UgaWYgKHNhbkhlSnUgPT09ICfmnKgnKSBzdHJlbmd0aC5tdSArPSAxLjI7XG4gICAgICBlbHNlIGlmIChzYW5IZUp1ID09PSAn5rC0Jykgc3RyZW5ndGguc2h1aSArPSAxLjI7XG4gICAgICBlbHNlIGlmIChzYW5IZUp1ID09PSAn6YeRJykgc3RyZW5ndGguamluICs9IDEuMjtcbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XkuInkvJrlsYBcbiAgICBjb25zdCBzYW5IdWlKdSA9IHRoaXMuY2hlY2tTYW5IdWlKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICBpZiAoc2FuSHVpSnUgPT09ICfmnKgnKSBzdHJlbmd0aC5tdSArPSAxLjA7IC8vIOaPkOmrmOS4ieS8muWxgOadg+mHjVxuICAgICAgZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfngasnKSBzdHJlbmd0aC5odW8gKz0gMS4wO1xuICAgICAgZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfph5EnKSBzdHJlbmd0aC5qaW4gKz0gMS4wO1xuICAgICAgZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfmsLQnKSBzdHJlbmd0aC5zaHVpICs9IDEuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5Zyw5pSv5LiJ5ZCI5ZKM5LiJ5Lya5bm26K6w5b2V6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSBicmFuY2gxIOWcsOaUrzFcbiAgICogQHBhcmFtIGJyYW5jaDIg5Zyw5pSvMlxuICAgKiBAcGFyYW0gYnJhbmNoMyDlnLDmlK8zXG4gICAqIEBwYXJhbSBicmFuY2g0IOWcsOaUrzRcbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKiBAcGFyYW0gY29tYmluYXRpb25zIOe7hOWQiOS/oeaBr+aVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tCcmFuY2hUcmlwbGVXaXRoRGV0YWlscyhcbiAgICBicmFuY2gxOiBzdHJpbmcsXG4gICAgYnJhbmNoMjogc3RyaW5nLFxuICAgIGJyYW5jaDM6IHN0cmluZyxcbiAgICBicmFuY2g0OiBzdHJpbmcsXG4gICAgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSxcbiAgICBjb21iaW5hdGlvbnM6IHsgdHlwZTogc3RyaW5nOyBzdGVtczogc3RyaW5nW107IHd1WGluZzogc3RyaW5nOyB2YWx1ZTogbnVtYmVyOyB9W11cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgYnJhbmNoZXMgPSBbYnJhbmNoMSwgYnJhbmNoMiwgYnJhbmNoMywgYnJhbmNoNF07XG5cbiAgICAvLyDmo4Dmn6XkuInlkIjlsYBcbiAgICBjb25zdCBzYW5IZUp1ID0gdGhpcy5jaGVja1NhbkhlSnUoYnJhbmNoZXMpO1xuICAgIGlmIChzYW5IZUp1KSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IDEuMjsgLy8g5o+Q6auY5LiJ5ZCI5bGA5p2D6YeNXG4gICAgICBsZXQgc2FuSGVCcmFuY2hlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgaWYgKHNhbkhlSnUgPT09ICfngasnKSB7XG4gICAgICAgIHNhbkhlQnJhbmNoZXMgPSBbJ+WvhScsICfljYgnLCAn5oiMJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5odW8gKz0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKHNhbkhlSnUgPT09ICfmnKgnKSB7XG4gICAgICAgIHNhbkhlQnJhbmNoZXMgPSBbJ+S6pScsICflja8nLCAn5pyqJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5tdSArPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+awtCcpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn55SzJywgJ+WtkCcsICfovrAnXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLnNodWkgKz0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKHNhbkhlSnUgPT09ICfph5EnKSB7XG4gICAgICAgIHNhbkhlQnJhbmNoZXMgPSBbJ+W3sycsICfphYknLCAn5LiRJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5qaW4gKz0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGNvbWJpbmF0aW9ucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ+WcsOaUr+S4ieWQiCcsXG4gICAgICAgIHN0ZW1zOiBzYW5IZUJyYW5jaGVzLFxuICAgICAgICB3dVhpbmc6IHNhbkhlSnUsXG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5LiJ5Lya5bGAXG4gICAgY29uc3Qgc2FuSHVpSnUgPSB0aGlzLmNoZWNrU2FuSHVpSnUoYnJhbmNoZXMpO1xuICAgIGlmIChzYW5IdWlKdSkge1xuICAgICAgY29uc3QgdmFsdWUgPSAxLjA7IC8vIOaPkOmrmOS4ieS8muWxgOadg+mHjVxuICAgICAgbGV0IHNhbkh1aUJyYW5jaGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBpZiAoc2FuSHVpSnUgPT09ICfmnKgnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyflr4UnLCAn5Y2vJywgJ+i+sCddLmZpbHRlcihiID0+IGJyYW5jaGVzLmluY2x1ZGVzKGIpKSBhcyBzdHJpbmdbXTtcbiAgICAgICAgc3RyZW5ndGgubXUgKz0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKHNhbkh1aUp1ID09PSAn54GrJykge1xuICAgICAgICBzYW5IdWlCcmFuY2hlcyA9IFsn5bezJywgJ+WNiCcsICfmnKonXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLmh1byArPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfph5EnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyfnlLMnLCAn6YWJJywgJ+aIjCddLmZpbHRlcihiID0+IGJyYW5jaGVzLmluY2x1ZGVzKGIpKSBhcyBzdHJpbmdbXTtcbiAgICAgICAgc3RyZW5ndGguamluICs9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+awtCcpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+S6pScsICflrZAnLCAn5LiRJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5zaHVpICs9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBjb21iaW5hdGlvbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICflnLDmlK/kuInkvJonLFxuICAgICAgICBzdGVtczogc2FuSHVpQnJhbmNoZXMsXG4gICAgICAgIHd1WGluZzogc2FuSHVpSnUsXG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeaVsOe7hOaYr+WQpuWMheWQq+aJgOacieaMh+WumuWFg+e0oFxuICAgKiBAcGFyYW0gYXJyYXkg5pWw57uEXG4gICAqIEBwYXJhbSBlbGVtZW50cyDopoHmo4Dmn6XnmoTlhYPntKBcbiAgICogQHJldHVybnMg5piv5ZCm5YyF5ZCr5omA5pyJ5YWD57SgXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjb250YWluc0FsbChhcnJheTogc3RyaW5nW10sIGVsZW1lbnRzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbGVtZW50cy5ldmVyeShlbGVtZW50ID0+IGFycmF5LmluY2x1ZGVzKGVsZW1lbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDku47nurPpn7PlrZfnrKbkuLLkuK3mj5Dlj5bkupTooYzlsZ7mgKdcbiAgICogQHBhcmFtIG5hWWluIOe6s+mfs+Wtl+espuS4slxuICAgKiBAcmV0dXJucyDkupTooYzlsZ7mgKdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldE5hWWluV3VYaW5nKG5hWWluOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghbmFZaW4pIHJldHVybiAnJztcblxuICAgIC8vIOe6s+mfs+S6lOihjOaPkOWPluinhOWIme+8mumAmuW4uOe6s+mfs+Wtl+espuS4suagvOW8j+S4ulwiWFjkupTooYxcIu+8jOWmglwi5rW35Lit6YeRXCLjgIFcIueCieS4reeBq1wi562JXG4gICAgaWYgKG5hWWluLmVuZHNXaXRoKCfph5EnKSB8fCBuYVlpbi5pbmNsdWRlcygn6YeRJykpIHJldHVybiAn6YeRJztcbiAgICBpZiAobmFZaW4uZW5kc1dpdGgoJ+acqCcpIHx8IG5hWWluLmluY2x1ZGVzKCfmnKgnKSkgcmV0dXJuICfmnKgnO1xuICAgIGlmIChuYVlpbi5lbmRzV2l0aCgn5rC0JykgfHwgbmFZaW4uaW5jbHVkZXMoJ+awtCcpKSByZXR1cm4gJ+awtCc7XG4gICAgaWYgKG5hWWluLmVuZHNXaXRoKCfngasnKSB8fCBuYVlpbi5pbmNsdWRlcygn54GrJykpIHJldHVybiAn54GrJztcbiAgICBpZiAobmFZaW4uZW5kc1dpdGgoJ+WcnycpIHx8IG5hWWluLmluY2x1ZGVzKCflnJ8nKSkgcmV0dXJuICflnJ8nO1xuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+aXpeS4u+aXuuihsFxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcmV0dXJucyDml6XkuLvml7roobDkv6Hmga/lr7nosaHvvIzljIXlkKvnu5Pmnpzlkozor6bnu4borqHnrpfov4fnqItcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVJpWmh1U3RyZW5ndGgoZWlnaHRDaGFyOiBFaWdodENoYXIpOiB7XG4gICAgcmVzdWx0OiBzdHJpbmc7XG4gICAgZGV0YWlsczoge1xuICAgICAgZGF5V3VYaW5nOiBzdHJpbmc7XG4gICAgICBzZWFzb246IHN0cmluZztcbiAgICAgIGJhc2VTY29yZTogbnVtYmVyO1xuICAgICAgc2Vhc29uRWZmZWN0OiBzdHJpbmc7XG4gICAgICBnYW5SZWxhdGlvbjogc3RyaW5nO1xuICAgICAgemhpUmVsYXRpb246IHN0cmluZztcbiAgICAgIHNwZWNpYWxSZWxhdGlvbjogc3RyaW5nO1xuICAgICAgdG90YWxTY29yZTogbnVtYmVyO1xuICAgIH1cbiAgfSB7XG4gICAgLy8g6I635Y+W5pel5bmy5ZKM5pel5bmy5LqU6KGMXG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICAvLyDnm7TmjqXkvb/nlKhnZXRTdGVtV3VYaW5n6I635Y+W5pel5bmy5LqU6KGM77yM6ICM5LiN5piv5L2/55SoZWlnaHRDaGFyLmdldERheVd1WGluZygpXG4gICAgY29uc3QgZGF5V3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGRheVN0ZW0pO1xuXG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcbiAgICBjb25zdCB0aW1lQnJhbmNoID0gZWlnaHRDaGFyLmdldFRpbWVaaGkoKTtcblxuICAgIC8vIOiOt+WPluaciOaUr+WvueW6lOeahOWto+iKglxuICAgIGxldCBzZWFzb24gPSAnJztcbiAgICBpZiAoWyflr4UnLCAn5Y2vJywgJ+i+sCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+aYpSc7XG4gICAgfSBlbHNlIGlmIChbJ+W3sycsICfljYgnLCAn5pyqJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5aSPJztcbiAgICB9IGVsc2UgaWYgKFsn55SzJywgJ+mFiScsICfmiIwnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbiA9ICfnp4snO1xuICAgIH0gZWxzZSBpZiAoWyfkuqUnLCAn5a2QJywgJ+S4kSddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+WGrCc7XG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW6K+m57uG5L+h5oGv5a+56LGhXG4gICAgY29uc3QgZGV0YWlscyA9IHtcbiAgICAgIGRheVd1WGluZzogdGhpcy5nZXRTdGVtV3VYaW5nKGRheVN0ZW0pLCAvLyDnoa7kv53kvb/nlKjlpKnlubLkupTooYxcbiAgICAgIHNlYXNvbixcbiAgICAgIGJhc2VTY29yZTogMTAsIC8vIOaXpeW5suWfuuehgOWIhuWAvOS4ujEwXG4gICAgICBzZWFzb25FZmZlY3Q6ICcnLFxuICAgICAgZ2FuUmVsYXRpb246ICcnLFxuICAgICAgemhpUmVsYXRpb246ICcnLFxuICAgICAgc3BlY2lhbFJlbGF0aW9uOiAnJyxcbiAgICAgIHRvdGFsU2NvcmU6IDBcbiAgICB9O1xuXG4gICAgbGV0IHRvdGFsU2NvcmUgPSAxMDsgLy8g5Z+656GA5YiG5YC8XG4gICAgbGV0IHNlYXNvbkVmZmVjdCA9IDA7XG4gICAgbGV0IGdhblJlbGF0aW9uRWZmZWN0ID0gMDtcbiAgICBsZXQgemhpUmVsYXRpb25FZmZlY3QgPSAwO1xuICAgIGxldCBzcGVjaWFsUmVsYXRpb25FZmZlY3QgPSAwO1xuXG4gICAgLy8g5re75Yqg6LCD6K+V5L+h5oGvXG4gICAgY29uc29sZS5sb2coJ+Wto+iKgjonLCBzZWFzb24pO1xuICAgIGNvbnNvbGUubG9nKCfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICBjb25zb2xlLmxvZygn5pel5Li75LqU6KGM57G75Z6LOicsIHR5cGVvZiBkYXlXdVhpbmcpO1xuXG4gICAgLy8gMS4g5a2j6IqC5b2x5ZONXG4gICAgaWYgKHNlYXNvbiA9PT0gJ+aYpScpIHtcbiAgICAgIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+acqCcpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSA0OyAvLyDml7pcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5pil5a2j5pyo5pe6ICgrNCknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+eBqycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAyOyAvLyDnm7hcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5pil5a2j54Gr55u4ICgrMiknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+WcnycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAwOyAvLyDlubNcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5pil5a2j5Zyf5bmzICgwKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn6YeRJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDI7IC8vIOihsFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfmmKXlraPph5HoobAgKC0yKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5rC0JykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDQ7IC8vIOatu1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfmmKXlraPmsLTmrbsgKC00KSc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzZWFzb24gPT09ICflpI8nKSB7XG4gICAgICBjb25zb2xlLmxvZygn5aSP5a2j5Yik5patOicsIGRheVd1WGluZy5pbmNsdWRlcygn54GrJyksICfngasnLmNoYXJDb2RlQXQoMCksIGRheVd1WGluZy5jaGFyQ29kZUF0KDApKTtcbiAgICAgIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+eBqycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSA0OyAvLyDml7pcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5aSP5a2j54Gr5pe6ICgrNCknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+WcnycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAyOyAvLyDnm7hcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5aSP5a2j5Zyf55u4ICgrMiknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+mHkScpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAwOyAvLyDlubNcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5aSP5a2j6YeR5bmzICgwKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5rC0JykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDI7IC8vIOihsFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflpI/lraPmsLToobAgKC0yKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5pyoJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDQ7IC8vIOatu1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflpI/lraPmnKjmrbsgKC00KSc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzZWFzb24gPT09ICfnp4snKSB7XG4gICAgICBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfph5EnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gNDsgLy8g5pe6XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+eni+Wto+mHkeaXuiAoKzQpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmsLQnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gMjsgLy8g55u4XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+eni+Wto+awtOebuCAoKzIpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmnKgnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gMDsgLy8g5bmzXG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+eni+Wto+acqOW5syAoMCknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+eBqycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCAtPSAyOyAvLyDoobBcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn56eL5a2j54Gr6KGwICgtMiknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+WcnycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCAtPSA0OyAvLyDmrbtcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn56eL5a2j5Zyf5q27ICgtNCknO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc2Vhc29uID09PSAn5YasJykge1xuICAgICAgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5rC0JykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDQ7IC8vIOaXulxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflhqzlraPmsLTml7ogKCs0KSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5pyoJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDI7IC8vIOebuFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflhqzlraPmnKjnm7ggKCsyKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn54GrJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDA7IC8vIOW5s1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflhqzlraPngavlubMgKDApJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCflnJ8nKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gMjsgLy8g6KGwXG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+WGrOWto+Wcn+ihsCAoLTIpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfph5EnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gNDsgLy8g5q27XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+WGrOWto+mHkeatuyAoLTQpJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiDlpKnlubLlr7nml6XkuLvnmoTlvbHlk41cbiAgICBsZXQgZ2FuUmVsYXRpb25EZXRhaWxzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8g5bm05bmy5a+55pel5Li755qE5b2x5ZONXG4gICAgY29uc3QgeWVhclN0ZW1XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoeWVhclN0ZW0pO1xuICAgIGNvbnNvbGUubG9nKCflubTlubLkupTooYw6JywgeWVhclN0ZW1XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICBpZiAoeWVhclN0ZW1XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXMoeWVhclN0ZW1XdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCArPSAzO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOW5tOW5siR7eWVhclN0ZW19KCR7eWVhclN0ZW1XdVhpbmd9KeS4juaXpeS4u+WQjOS6lOihjCAoKzMpYCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoeWVhclN0ZW1XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDI7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5bm05bmyJHt5ZWFyU3RlbX0oJHt5ZWFyU3RlbVd1WGluZ30p55Sf5pel5Li7ICgrMilgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZSh5ZWFyU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgLT0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDlubTlubIke3llYXJTdGVtfSgke3llYXJTdGVtV3VYaW5nfSnlhYvml6XkuLsgKC0yKWApO1xuICAgIH1cblxuICAgIC8vIOaciOW5suWvueaXpeS4u+eahOW9seWTjVxuICAgIGNvbnN0IG1vbnRoU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhtb250aFN0ZW0pO1xuICAgIGNvbnNvbGUubG9nKCfmnIjlubLkupTooYw6JywgbW9udGhTdGVtV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG4gICAgaWYgKG1vbnRoU3RlbVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhtb250aFN0ZW1XdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCArPSAzO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOaciOW5siR7bW9udGhTdGVtfSgke21vbnRoU3RlbVd1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMylgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhtb250aFN0ZW1XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDI7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5pyI5bmyJHttb250aFN0ZW19KCR7bW9udGhTdGVtV3VYaW5nfSnnlJ/ml6XkuLsgKCsyKWApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ0tlKG1vbnRoU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgLT0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDmnIjlubIke21vbnRoU3RlbX0oJHttb250aFN0ZW1XdVhpbmd9KeWFi+aXpeS4uyAoLTIpYCk7XG4gICAgfVxuXG4gICAgLy8g5pe25bmy5a+55pel5Li755qE5b2x5ZONXG4gICAgY29uc3QgdGltZVN0ZW1XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcodGltZVN0ZW0pO1xuICAgIGNvbnNvbGUubG9nKCfml7blubLkupTooYw6JywgdGltZVN0ZW1XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICBpZiAodGltZVN0ZW1XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXModGltZVN0ZW1XdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCArPSAzO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXtuW5siR7dGltZVN0ZW19KCR7dGltZVN0ZW1XdVhpbmd9KeS4juaXpeS4u+WQjOS6lOihjCAoKzMpYCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcodGltZVN0ZW1XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDI7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5pe25bmyJHt0aW1lU3RlbX0oJHt0aW1lU3RlbVd1WGluZ30p55Sf5pel5Li7ICgrMilgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZSh0aW1lU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgLT0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDml7blubIke3RpbWVTdGVtfSgke3RpbWVTdGVtV3VYaW5nfSnlhYvml6XkuLsgKC0yKWApO1xuICAgIH1cblxuICAgIGRldGFpbHMuZ2FuUmVsYXRpb24gPSBnYW5SZWxhdGlvbkRldGFpbHMuam9pbign77yMJyk7XG5cbiAgICAvLyAzLiDlnLDmlK/ol4/lubLlr7nml6XkuLvnmoTlvbHlk41cbiAgICBsZXQgemhpUmVsYXRpb25EZXRhaWxzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8g5aSE55CG5bm05pSv6JeP5bmyXG4gICAgY29uc3QgeWVhckhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4oeWVhckJyYW5jaCkuc3BsaXQoJywnKTtcbiAgICBjb25zb2xlLmxvZygn5bm05pSv6JeP5bmyOicsIHllYXJIaWRlR2FuKTtcbiAgICBpZiAoeWVhckhpZGVHYW4ubGVuZ3RoID4gMCAmJiB5ZWFySGlkZUdhblswXSAhPT0gJycpIHtcbiAgICAgIGZvciAoY29uc3QgZ2FuIG9mIHllYXJIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGdhbld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zb2xlLmxvZygn5bm05pSv6JeP5bmy5LqU6KGMOicsIGdhbld1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgICAgICBpZiAoZ2FuV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKGdhbld1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxLjU7XG4gICAgICAgICAgemhpUmVsYXRpb25EZXRhaWxzLnB1c2goYOW5tOaUryR7eWVhckJyYW5jaH3ol4/lubIke2dhbn0oJHtnYW5XdVhpbmd9KeS4juaXpeS4u+WQjOS6lOihjCAoKzEuNSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgKz0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5bm05pSvJHt5ZWFyQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p55Sf5pel5Li7ICgrMSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5bm05pSvJHt5ZWFyQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5YWL5pel5Li7ICgtMSlgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWkhOeQhuaciOaUr+iXj+W5slxuICAgIGNvbnN0IG1vbnRoSGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbihtb250aEJyYW5jaCkuc3BsaXQoJywnKTtcbiAgICBjb25zb2xlLmxvZygn5pyI5pSv6JeP5bmyOicsIG1vbnRoSGlkZUdhbik7XG4gICAgaWYgKG1vbnRoSGlkZUdhbi5sZW5ndGggPiAwICYmIG1vbnRoSGlkZUdhblswXSAhPT0gJycpIHtcbiAgICAgIGZvciAoY29uc3QgZ2FuIG9mIG1vbnRoSGlkZUdhbikge1xuICAgICAgICBjb25zdCBnYW5XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZ2FuKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+aciOaUr+iXj+W5suS6lOihjDonLCBnYW5XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICAgICAgaWYgKGdhbld1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhnYW5XdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgKz0gMS41O1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDmnIjmlK8ke21vbnRoQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMS41KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDmnIjmlK8ke21vbnRoQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p55Sf5pel5Li7ICgrMSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pyI5pSvJHttb250aEJyYW5jaH3ol4/lubIke2dhbn0oJHtnYW5XdVhpbmd9KeWFi+aXpeS4uyAoLTEpYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlpITnkIbml6XmlK/ol4/lubJcbiAgICBjb25zdCBkYXlIaWRlR2FuID0gdGhpcy5nZXRIaWRlR2FuKGRheUJyYW5jaCkuc3BsaXQoJywnKTtcbiAgICBjb25zb2xlLmxvZygn5pel5pSv6JeP5bmyOicsIGRheUhpZGVHYW4pO1xuICAgIGlmIChkYXlIaWRlR2FuLmxlbmd0aCA+IDAgJiYgZGF5SGlkZUdhblswXSAhPT0gJycpIHtcbiAgICAgIGZvciAoY29uc3QgZ2FuIG9mIGRheUhpZGVHYW4pIHtcbiAgICAgICAgY29uc3QgZ2FuV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnNvbGUubG9nKCfml6XmlK/ol4/lubLkupTooYw6JywgZ2FuV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG4gICAgICAgIGlmIChnYW5XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXMoZ2FuV3VYaW5nKSkge1xuICAgICAgICAgIHpoaVJlbGF0aW9uRWZmZWN0ICs9IDEuNTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5pSvJHtkYXlCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnkuI7ml6XkuLvlkIzkupTooYwgKCsxLjUpYCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ1NoZW5nKGdhbld1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICAgIHpoaVJlbGF0aW9uRWZmZWN0ICs9IDE7XG4gICAgICAgICAgemhpUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXpeaUryR7ZGF5QnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p55Sf5pel5Li7ICgrMSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5pSvJHtkYXlCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnlhYvml6XkuLsgKC0xKWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5aSE55CG5pe25pSv6JeP5bmyXG4gICAgY29uc3QgdGltZUhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4odGltZUJyYW5jaCkuc3BsaXQoJywnKTtcbiAgICBjb25zb2xlLmxvZygn5pe25pSv6JeP5bmyOicsIHRpbWVIaWRlR2FuKTtcbiAgICBpZiAodGltZUhpZGVHYW4ubGVuZ3RoID4gMCAmJiB0aW1lSGlkZUdhblswXSAhPT0gJycpIHtcbiAgICAgIGZvciAoY29uc3QgZ2FuIG9mIHRpbWVIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGdhbld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zb2xlLmxvZygn5pe25pSv6JeP5bmy5LqU6KGMOicsIGdhbld1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgICAgICBpZiAoZ2FuV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKGdhbld1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxLjU7XG4gICAgICAgICAgemhpUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXtuaUryR7dGltZUJyYW5jaH3ol4/lubIke2dhbn0oJHtnYW5XdVhpbmd9KeS4juaXpeS4u+WQjOS6lOihjCAoKzEuNSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgKz0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pe25pSvJHt0aW1lQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p55Sf5pel5Li7ICgrMSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pe25pSvJHt0aW1lQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5YWL5pel5Li7ICgtMSlgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGRldGFpbHMuemhpUmVsYXRpb24gPSB6aGlSZWxhdGlvbkRldGFpbHMuam9pbign77yMJyk7XG5cbiAgICAvLyA0LiDnibnmrornu4TlkIjlhbPns7tcbiAgICBsZXQgc3BlY2lhbFJlbGF0aW9uRGV0YWlsczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIOS4ieWQiOWxgOajgOafpVxuICAgIGNvbnN0IGFsbEJyYW5jaGVzID0gW3llYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIHRpbWVCcmFuY2hdO1xuICAgIGNvbnN0IHNhbkhlSnUgPSB0aGlzLmNoZWNrU2FuSGVKdShhbGxCcmFuY2hlcyk7XG4gICAgY29uc29sZS5sb2coJ+S4ieWQiOWxgDonLCBzYW5IZUp1KTtcblxuICAgIGlmIChzYW5IZUp1KSB7XG4gICAgICBjb25zdCBzYW5IZVd1WGluZyA9IHRoaXMuZ2V0U2FuSGVXdVhpbmcoc2FuSGVKdSk7XG4gICAgICBjb25zb2xlLmxvZygn5LiJ5ZCI5bGA5LqU6KGMOicsIHNhbkhlV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG5cbiAgICAgIC8vIOiOt+WPluS4ieWQiOWxgOS4reeahOWcsOaUr1xuICAgICAgbGV0IHNhbkhlQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAoc2FuSGVKdSA9PT0gJ+eBqycpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn5a+FJywgJ+WNiCcsICfmiIwnXS5maWx0ZXIoYiA9PiBhbGxCcmFuY2hlcy5pbmNsdWRlcyhiKSk7XG4gICAgICB9IGVsc2UgaWYgKHNhbkhlSnUgPT09ICfmsLQnKSB7XG4gICAgICAgIHNhbkhlQnJhbmNoZXMgPSBbJ+eUsycsICflrZAnLCAn6L6wJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfSBlbHNlIGlmIChzYW5IZUp1ID09PSAn5pyoJykge1xuICAgICAgICBzYW5IZUJyYW5jaGVzID0gWyfkuqUnLCAn5Y2vJywgJ+acqiddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+mHkScpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn5bezJywgJ+mFiScsICfkuJEnXS5maWx0ZXIoYiA9PiBhbGxCcmFuY2hlcy5pbmNsdWRlcyhiKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzYW5IZVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhzYW5IZVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDM7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5Li75Y+C5LiOJHtzYW5IZUJyYW5jaGVzLmpvaW4oJycpfeS4ieWQiCR7c2FuSGVKdX3lsYDvvIzkupTooYznm7jlkIwgKCszKWApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoc2FuSGVXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDI7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChgJHtzYW5IZUJyYW5jaGVzLmpvaW4oJycpfeS4ieWQiCR7c2FuSGVKdX3lsYDkupTooYznlJ/ml6XkuLsgKCsyKWApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2Uoc2FuSGVXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0IC09IDI7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChgJHtzYW5IZUJyYW5jaGVzLmpvaW4oJycpfeS4ieWQiCR7c2FuSGVKdX3lsYDkupTooYzlhYvml6XkuLsgKC0yKWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOS4ieS8muWxgOajgOafpVxuICAgIGNvbnN0IHNhbkh1aUp1ID0gdGhpcy5jaGVja1Nhbkh1aUp1KGFsbEJyYW5jaGVzKTtcbiAgICBjb25zb2xlLmxvZygn5LiJ5Lya5bGAOicsIHNhbkh1aUp1KTtcblxuICAgIGlmIChzYW5IdWlKdSkge1xuICAgICAgY29uc3Qgc2FuSHVpV3VYaW5nID0gdGhpcy5nZXRTYW5IdWlXdVhpbmcoc2FuSHVpSnUpO1xuICAgICAgY29uc29sZS5sb2coJ+S4ieS8muWxgOS6lOihjDonLCBzYW5IdWlXdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcblxuICAgICAgLy8g6I635Y+W5LiJ5Lya5bGA5Lit55qE5Zyw5pSvXG4gICAgICBsZXQgc2FuSHVpQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAoc2FuSHVpSnUgPT09ICfmnKgnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyflr4UnLCAn5Y2vJywgJ+i+sCddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfngasnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyflt7MnLCAn5Y2IJywgJ+acqiddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfph5EnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyfnlLMnLCAn6YWJJywgJ+aIjCddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfmsLQnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyfkuqUnLCAn5a2QJywgJ+S4kSddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNhbkh1aVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhzYW5IdWlXdVhpbmcpKSB7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkVmZmVjdCArPSAyLjU7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5Li75Y+C5LiOJHtzYW5IdWlCcmFuY2hlcy5qb2luKCcnKX3kuInkvJoke3Nhbkh1aUp1feWxgO+8jOS6lOihjOebuOWQjCAoKzIuNSlgKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ1NoZW5nKHNhbkh1aVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMS41O1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25EZXRhaWxzLnB1c2goYCR7c2FuSHVpQnJhbmNoZXMuam9pbignJyl95LiJ5LyaJHtzYW5IdWlKdX3lsYDkupTooYznlJ/ml6XkuLsgKCsxLjUpYCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShzYW5IdWlXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0IC09IDEuNTtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGAke3Nhbkh1aUJyYW5jaGVzLmpvaW4oJycpfeS4ieS8miR7c2FuSHVpSnV95bGA5LqU6KGM5YWL5pel5Li7ICgtMS41KWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWFreWQiOajgOafpVxuICAgIGNvbnN0IGxpdUhlID0gdGhpcy5jaGVja0xpdUhlKGFsbEJyYW5jaGVzKTtcbiAgICBjb25zb2xlLmxvZygn5YWt5ZCIOicsIGxpdUhlKTtcblxuICAgIGlmIChsaXVIZSkge1xuICAgICAgY29uc3QgbGl1SGVXdVhpbmcgPSB0aGlzLmdldExpdUhlV3VYaW5nKGxpdUhlKTtcbiAgICAgIGNvbnNvbGUubG9nKCflha3lkIjkupTooYw6JywgbGl1SGVXdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICAgIGlmIChsaXVIZVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhsaXVIZVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDI7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5Li75Y+C5LiOJHtsaXVIZX3lkIjvvIzkupTooYznm7jlkIwgKCsyKWApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcobGl1SGVXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDE7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChgJHtsaXVIZX3lkIjkupTooYznlJ/ml6XkuLsgKCsxKWApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UobGl1SGVXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0IC09IDE7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChgJHtsaXVIZX3lkIjkupTooYzlhYvml6XkuLsgKC0xKWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe6s+mfs+S6lOihjOW9seWTjVxuICAgIGNvbnN0IGRheU5hWWluID0gZWlnaHRDaGFyLmdldERheU5hWWluKCk7XG4gICAgY29uc3QgZGF5TmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKTtcbiAgICBjb25zb2xlLmxvZygn5pel5p+x57qz6Z+zOicsIGRheU5hWWluLCAn57qz6Z+z5LqU6KGMOicsIGRheU5hWWluV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG5cbiAgICBpZiAoZGF5TmFZaW5XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXMoZGF5TmFZaW5XdVhpbmcpKSB7XG4gICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5p+x57qz6Z+zKCR7ZGF5TmFZaW59KeS4juaXpeS4u+S6lOihjOebuOWQjCAoKzIpYCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoZGF5TmFZaW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIHNwZWNpYWxSZWxhdGlvbkVmZmVjdCArPSAxO1xuICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6Xmn7HnurPpn7MoJHtkYXlOYVlpbn0p55Sf5pel5Li75LqU6KGMICgrMSlgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShkYXlOYVlpbld1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0IC09IDE7XG4gICAgICBzcGVjaWFsUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXpeafsee6s+mfsygke2RheU5hWWlufSnlhYvml6XkuLvkupTooYwgKC0xKWApO1xuICAgIH1cblxuICAgIGRldGFpbHMuc3BlY2lhbFJlbGF0aW9uID0gc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5qb2luKCfvvIwnKTtcblxuICAgIC8vIOiuoeeul+aAu+WIhlxuICAgIHRvdGFsU2NvcmUgPSBkZXRhaWxzLmJhc2VTY29yZSArIHNlYXNvbkVmZmVjdCArIGdhblJlbGF0aW9uRWZmZWN0ICsgemhpUmVsYXRpb25FZmZlY3QgKyBzcGVjaWFsUmVsYXRpb25FZmZlY3Q7XG4gICAgZGV0YWlscy50b3RhbFNjb3JlID0gdG90YWxTY29yZTtcblxuICAgIC8vIOagueaNruaAu+WIhuWIpOaWreaXpeS4u+aXuuihsFxuICAgIGxldCByZXN1bHQgPSAnJztcbiAgICBpZiAodG90YWxTY29yZSA+PSAxNSkge1xuICAgICAgcmVzdWx0ID0gJ+aegeaXuic7XG4gICAgfSBlbHNlIGlmICh0b3RhbFNjb3JlID49IDEwKSB7XG4gICAgICByZXN1bHQgPSAn5pe6JztcbiAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUgPj0gNSkge1xuICAgICAgcmVzdWx0ID0gJ+WBj+aXuic7XG4gICAgfSBlbHNlIGlmICh0b3RhbFNjb3JlID49IDApIHtcbiAgICAgIHJlc3VsdCA9ICflubPooaEnO1xuICAgIH0gZWxzZSBpZiAodG90YWxTY29yZSA+PSAtNCkge1xuICAgICAgcmVzdWx0ID0gJ+WBj+W8sSc7XG4gICAgfSBlbHNlIGlmICh0b3RhbFNjb3JlID49IC05KSB7XG4gICAgICByZXN1bHQgPSAn5byxJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gJ+aegeW8sSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3VsdCxcbiAgICAgIGRldGFpbHNcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeaYr+WQpuacieS4ieWQiOWxgFxuICAgKiBAcGFyYW0gYnJhbmNoZXMg5Zyw5pSv5pWw57uEXG4gICAqIEByZXR1cm5zIOS4ieWQiOWxgOexu+Wei+aIlm51bGxcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNoZWNrU2FuSGVKdShicmFuY2hlczogc3RyaW5nW10pOiBzdHJpbmcgfCBudWxsIHtcbiAgICAvLyDkuInlkIjlsYDvvJrlr4XljYjmiIzlkIjngavlsYDvvIznlLPlrZDovrDlkIjmsLTlsYDvvIzkuqXlja/mnKrlkIjmnKjlsYDvvIzlt7PphYnkuJHlkIjph5HlsYBcbiAgICBjb25zdCBzYW5IZVBhdHRlcm5zID0gW1xuICAgICAge3BhdHRlcm46IFsn5a+FJywgJ+WNiCcsICfmiIwnXSwgdHlwZTogJ+eBqyd9LFxuICAgICAge3BhdHRlcm46IFsn55SzJywgJ+WtkCcsICfovrAnXSwgdHlwZTogJ+awtCd9LFxuICAgICAge3BhdHRlcm46IFsn5LqlJywgJ+WNrycsICfmnKonXSwgdHlwZTogJ+acqCd9LFxuICAgICAge3BhdHRlcm46IFsn5bezJywgJ+mFiScsICfkuJEnXSwgdHlwZTogJ+mHkSd9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3Qge3BhdHRlcm4sIHR5cGV9IG9mIHNhbkhlUGF0dGVybnMpIHtcbiAgICAgIC8vIOaUtumbhuWunumZheWHuueOsOeahOWcsOaUr1xuICAgICAgY29uc3QgbWF0Y2hlZEJyYW5jaGVzID0gYnJhbmNoZXMuZmlsdGVyKGJyYW5jaCA9PiBwYXR0ZXJuLmluY2x1ZGVzKGJyYW5jaCkpO1xuXG4gICAgICAvLyDmo4Dmn6XmmK/lkKboh7PlsJHmnInkuKTkuKrkuI3lkIznmoTlnLDmlK9cbiAgICAgIGNvbnN0IHVuaXF1ZUJyYW5jaGVzID0gbmV3IFNldChtYXRjaGVkQnJhbmNoZXMpO1xuXG4gICAgICBpZiAodW5pcXVlQnJhbmNoZXMuc2l6ZSA+PSAyKSB7IC8vIOiHs+WwkeacieS4pOS4quS4jeWQjOeahOWcsOaUr+W9ouaIkOS4ieWQiFxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkuInlkIjlsYDnmoTkupTooYzlsZ7mgKdcbiAgICogQHBhcmFtIHNhbkhlVHlwZSDkuInlkIjlsYDnsbvlnotcbiAgICogQHJldHVybnMg5LqU6KGM5bGe5oCnXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRTYW5IZVd1WGluZyhzYW5IZVR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChzYW5IZVR5cGUpIHtcbiAgICAgIGNhc2UgJ+eBqyc6IHJldHVybiAn54GrJztcbiAgICAgIGNhc2UgJ+awtCc6IHJldHVybiAn5rC0JztcbiAgICAgIGNhc2UgJ+acqCc6IHJldHVybiAn5pyoJztcbiAgICAgIGNhc2UgJ+mHkSc6IHJldHVybiAn6YeRJztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5piv5ZCm5pyJ5LiJ5Lya5bGAXG4gICAqIEBwYXJhbSBicmFuY2hlcyDlnLDmlK/mlbDnu4RcbiAgICogQHJldHVybnMg5LiJ5Lya5bGA57G75Z6L5oiWbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tTYW5IdWlKdShicmFuY2hlczogc3RyaW5nW10pOiBzdHJpbmcgfCBudWxsIHtcbiAgICAvLyDkuInkvJrlsYDvvJrlr4Xlja/ovrDkuInkvJrmnKjlsYDvvIzlt7PljYjmnKrkuInkvJrngavlsYDvvIznlLPphYnmiIzkuInkvJrph5HlsYDvvIzkuqXlrZDkuJHkuInkvJrmsLTlsYBcbiAgICBjb25zdCBzYW5IdWlQYXR0ZXJucyA9IFtcbiAgICAgIHtwYXR0ZXJuOiBbJ+WvhScsICflja8nLCAn6L6wJ10sIHR5cGU6ICfmnKgnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+W3sycsICfljYgnLCAn5pyqJ10sIHR5cGU6ICfngasnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+eUsycsICfphYknLCAn5oiMJ10sIHR5cGU6ICfph5EnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+S6pScsICflrZAnLCAn5LiRJ10sIHR5cGU6ICfmsLQnfVxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHtwYXR0ZXJuLCB0eXBlfSBvZiBzYW5IdWlQYXR0ZXJucykge1xuICAgICAgLy8g5pS26ZuG5a6e6ZmF5Ye6546w55qE5Zyw5pSvXG4gICAgICBjb25zdCBtYXRjaGVkQnJhbmNoZXMgPSBicmFuY2hlcy5maWx0ZXIoYnJhbmNoID0+IHBhdHRlcm4uaW5jbHVkZXMoYnJhbmNoKSk7XG5cbiAgICAgIC8vIOajgOafpeaYr+WQpuiHs+WwkeacieS4pOS4quS4jeWQjOeahOWcsOaUr1xuICAgICAgY29uc3QgdW5pcXVlQnJhbmNoZXMgPSBuZXcgU2V0KG1hdGNoZWRCcmFuY2hlcyk7XG5cbiAgICAgIGlmICh1bmlxdWVCcmFuY2hlcy5zaXplID49IDIpIHsgLy8g6Iez5bCR5pyJ5Lik5Liq5LiN5ZCM55qE5Zyw5pSv5b2i5oiQ5LiJ5LyaXG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS4ieS8muWxgOeahOS6lOihjOWxnuaAp1xuICAgKiBAcGFyYW0gc2FuSHVpVHlwZSDkuInkvJrlsYDnsbvlnotcbiAgICogQHJldHVybnMg5LqU6KGM5bGe5oCnXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRTYW5IdWlXdVhpbmcoc2FuSHVpVHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHNhbkh1aVR5cGUpIHtcbiAgICAgIGNhc2UgJ+acqCc6IHJldHVybiAn5pyoJztcbiAgICAgIGNhc2UgJ+eBqyc6IHJldHVybiAn54GrJztcbiAgICAgIGNhc2UgJ+mHkSc6IHJldHVybiAn6YeRJztcbiAgICAgIGNhc2UgJ+awtCc6IHJldHVybiAn5rC0JztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5piv5ZCm5pyJ5aSp5bmy5LqU5ZCIXG4gICAqIEBwYXJhbSBzdGVtcyDlpKnlubLmlbDnu4RcbiAgICogQHJldHVybnMg5LqU5ZCI57G75Z6L5oiWbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tXdUhlSnUoc3RlbXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5Zyf77yM5LmZ5bqa5ZCI6YeR77yM5LiZ6L6b5ZCI5rC077yM5LiB5aOs5ZCI5pyo77yM5oiK55m45ZCI54GrXG4gICAgY29uc3Qgd3VIZVBhdHRlcm5zID0gW1xuICAgICAge3BhdHRlcm46IFsn55SyJywgJ+W3sSddLCB0eXBlOiAn5ZyfJ30sXG4gICAgICB7cGF0dGVybjogWyfkuZknLCAn5bqaJ10sIHR5cGU6ICfph5EnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+S4mScsICfovpsnXSwgdHlwZTogJ+awtCd9LFxuICAgICAge3BhdHRlcm46IFsn5LiBJywgJ+WjrCddLCB0eXBlOiAn5pyoJ30sXG4gICAgICB7cGF0dGVybjogWyfmiIonLCAn55m4J10sIHR5cGU6ICfngasnfVxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHtwYXR0ZXJuLCB0eXBlfSBvZiB3dUhlUGF0dGVybnMpIHtcbiAgICAgIGxldCBoYXNGaXJzdCA9IGZhbHNlO1xuICAgICAgbGV0IGhhc1NlY29uZCA9IGZhbHNlO1xuXG4gICAgICBmb3IgKGNvbnN0IHN0ZW0gb2Ygc3RlbXMpIHtcbiAgICAgICAgaWYgKHN0ZW0gPT09IHBhdHRlcm5bMF0pIGhhc0ZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHN0ZW0gPT09IHBhdHRlcm5bMV0pIGhhc1NlY29uZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNGaXJzdCAmJiBoYXNTZWNvbmQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LqU5ZCI55qE5LqU6KGM5bGe5oCnXG4gICAqIEBwYXJhbSB3dUhlVHlwZSDkupTlkIjnsbvlnotcbiAgICogQHJldHVybnMg5LqU6KGM5bGe5oCnXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRXdUhlV3VYaW5nKHd1SGVUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAod3VIZVR5cGUpIHtcbiAgICAgIGNhc2UgJ+Wcnyc6IHJldHVybiAn5ZyfJztcbiAgICAgIGNhc2UgJ+mHkSc6IHJldHVybiAn6YeRJztcbiAgICAgIGNhc2UgJ+awtCc6IHJldHVybiAn5rC0JztcbiAgICAgIGNhc2UgJ+acqCc6IHJldHVybiAn5pyoJztcbiAgICAgIGNhc2UgJ+eBqyc6IHJldHVybiAn54GrJztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5piv5ZCm5pyJ5YWt5ZCIXG4gICAqIEBwYXJhbSBicmFuY2hlcyDlnLDmlK/mlbDnu4RcbiAgICogQHJldHVybnMg5YWt5ZCI57G75Z6L5oiWbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tMaXVIZShicmFuY2hlczogc3RyaW5nW10pOiBzdHJpbmcgfCBudWxsIHtcbiAgICAvLyDlha3lkIjvvJrlrZDkuJHlkIjlnJ/vvIzlr4XkuqXlkIjmnKjvvIzlja/miIzlkIjngavvvIzovrDphYnlkIjph5HvvIzlt7PnlLPlkIjmsLTvvIzljYjmnKrlkIjlnJ9cbiAgICBjb25zdCBsaXVIZVBhdHRlcm5zID0gW1xuICAgICAge3BhdHRlcm46IFsn5a2QJywgJ+S4kSddLCB0eXBlOiAn5ZyfJ30sXG4gICAgICB7cGF0dGVybjogWyflr4UnLCAn5LqlJ10sIHR5cGU6ICfmnKgnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+WNrycsICfmiIwnXSwgdHlwZTogJ+eBqyd9LFxuICAgICAge3BhdHRlcm46IFsn6L6wJywgJ+mFiSddLCB0eXBlOiAn6YeRJ30sXG4gICAgICB7cGF0dGVybjogWyflt7MnLCAn55SzJ10sIHR5cGU6ICfmsLQnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+WNiCcsICfmnKonXSwgdHlwZTogJ+Wcnyd9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3Qge3BhdHRlcm4sIHR5cGV9IG9mIGxpdUhlUGF0dGVybnMpIHtcbiAgICAgIGxldCBoYXNGaXJzdCA9IGZhbHNlO1xuICAgICAgbGV0IGhhc1NlY29uZCA9IGZhbHNlO1xuXG4gICAgICBmb3IgKGNvbnN0IGJyYW5jaCBvZiBicmFuY2hlcykge1xuICAgICAgICBpZiAoYnJhbmNoID09PSBwYXR0ZXJuWzBdKSBoYXNGaXJzdCA9IHRydWU7XG4gICAgICAgIGlmIChicmFuY2ggPT09IHBhdHRlcm5bMV0pIGhhc1NlY29uZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNGaXJzdCAmJiBoYXNTZWNvbmQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5YWt5ZCI55qE5LqU6KGM5bGe5oCnXG4gICAqIEBwYXJhbSBsaXVIZVR5cGUg5YWt5ZCI57G75Z6LXG4gICAqIEByZXR1cm5zIOS6lOihjOWxnuaAp1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0TGl1SGVXdVhpbmcobGl1SGVUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAobGl1SGVUeXBlKSB7XG4gICAgICBjYXNlICflnJ8nOiByZXR1cm4gJ+Wcnyc7XG4gICAgICBjYXNlICfph5EnOiByZXR1cm4gJ+mHkSc7XG4gICAgICBjYXNlICfmsLQnOiByZXR1cm4gJ+awtCc7XG4gICAgICBjYXNlICfmnKgnOiByZXR1cm4gJ+acqCc7XG4gICAgICBjYXNlICfngasnOiByZXR1cm4gJ+eBqyc7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cblxuXG4gIC8qKlxuICAgKiDorqHnrpfnpZ7nhZ5cbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5YyF5ZCr5oC756We54We5ZKM5ZCE5p+x56We54We55qE5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVTaGVuU2hhKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKToge1xuICAgIHNoZW5TaGE6IHN0cmluZ1tdO1xuICAgIHllYXJTaGVuU2hhOiBzdHJpbmdbXTtcbiAgICBtb250aFNoZW5TaGE6IHN0cmluZ1tdO1xuICAgIGRheVNoZW5TaGE6IHN0cmluZ1tdO1xuICAgIGhvdXJTaGVuU2hhOiBzdHJpbmdbXTtcbiAgfSB7XG4gICAgY29uc3Qgc2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCB5ZWFyU2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBtb250aFNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZGF5U2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBob3VyU2hlblNoYTogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIOiOt+WPluWbm+afseW5suaUr1xuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCB5ZWFyQnJhbmNoID0gZWlnaHRDaGFyLmdldFllYXJaaGkoKTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRNb250aFpoaSgpO1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcbiAgICBjb25zdCB0aW1lQnJhbmNoID0gZWlnaHRDaGFyLmdldFRpbWVaaGkoKTtcblxuICAgIC8vIOiOt+WPluWto+iKguS/oeaBr++8iOeUqOS6juerpeWtkOeFnuWSjOWwhuWGm+eureeahOWIpOaWre+8iVxuICAgIGxldCBzZWFzb24gPSAnJztcbiAgICBpZiAoWyflr4UnLCAn5Y2vJywgJ+i+sCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+aYpSc7XG4gICAgfSBlbHNlIGlmIChbJ+W3sycsICfljYgnLCAn5pyqJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5aSPJztcbiAgICB9IGVsc2UgaWYgKFsn55SzJywgJ+mFiScsICfmiIwnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbiA9ICfnp4snO1xuICAgIH0gZWxzZSBpZiAoWyfkuqUnLCAn5a2QJywgJ+S4kSddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+WGrCc7XG4gICAgfVxuXG4gICAgLy8g5aSp5LmZ6LS15Lq6XG4gICAgaWYgKHRoaXMuaXNUaWFuWWlHdWlSZW4oZGF5U3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnkuZnotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWWlHdWlSZW4oZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnkuZnotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWWlHdWlSZW4oZGF5U3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgIH1cblxuICAgIC8vIOaWh+aYjFxuICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1dlbkNoYW5nKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1dlbkNoYW5nKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5paH5piMJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgIH1cblxuICAgIC8vIOWNjuebllxuICAgIGlmICh0aGlzLmlzSHVhR2FpKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfljY7nm5YnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNIdWFHYWkobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSHVhR2FpKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSHVhR2FpKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfljY7nm5YnKTtcbiAgICB9XG5cbiAgICAvLyDnpoTnpZ5cbiAgICBpZiAodGhpcy5pc0x1U2hlbih5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+emhOelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0x1U2hlbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+emhOelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0x1U2hlbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+emhOelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0x1U2hlbih0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+emhOelnicpO1xuICAgIH1cblxuICAgIC8vIOahg+iKsVxuICAgIGlmICh0aGlzLmlzVGFvSHVhKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUYW9IdWEobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5qGD6IqxJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGFvSHVhKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5qGD6IqxJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGFvSHVhKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICB9XG5cbiAgICAvLyDlraTovrBcbiAgICBpZiAodGhpcy5pc0d1Q2hlbih5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzR3VDaGVuKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WtpOi+sCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0d1Q2hlbihkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WtpOi+sCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0d1Q2hlbih0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgfVxuXG4gICAgLy8g5a+h5a6/XG4gICAgaWYgKHRoaXMuaXNHdWFTdSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5a+h5a6/Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzR3VhU3UobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5a+h5a6/Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzR3VhU3UoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNHdWFTdSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5a+h5a6/Jyk7XG4gICAgfVxuXG4gICAgLy8g6am/6amsXG4gICAgaWYgKHRoaXMuaXNZaU1hKHllYXJCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZaU1hKG1vbnRoQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1lpTWEoZGF5QnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZaU1hKHRpbWVCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICB9XG5cbiAgICAvLyDlsIbmmJ9cbiAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WwhuaYnycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WwhuaYnycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgfVxuXG4gICAgLy8g6YeR56WeXG4gICAgaWYgKHRoaXMuaXNKaW5TaGVuKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfph5HnpZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaW5TaGVuKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppblNoZW4oZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfph5HnpZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaW5TaGVuKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfph5HnpZ4nKTtcbiAgICB9XG5cbiAgICAvLyDlpKnlvrdcbiAgICBpZiAodGhpcy5pc1RpYW5EZSh5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeW+tycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZShtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeW+tycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZShkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeW+tycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZSh0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeW+tycpO1xuICAgIH1cblxuICAgIC8vIOWkqeW+t+WQiFxuICAgIGlmICh0aGlzLmlzVGlhbkRlSGUoeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnlvrflkIgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVIZShtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZUhlKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkRlSGUodGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnlvrflkIgnKTtcbiAgICB9XG5cbiAgICAvLyDmnIjlvrdcbiAgICBpZiAodGhpcy5pc1l1ZURlKHllYXJTdGVtKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWXVlRGUobW9udGhTdGVtKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+aciOW+tycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1l1ZURlKGRheVN0ZW0pKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+aciOW+tycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1l1ZURlKHRpbWVTdGVtKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5Yy7XG4gICAgaWYgKHRoaXMuaXNUaWFuWWkoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnljLsnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWWkoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnljLsnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWWkodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgIH1cblxuICAgIC8vIOWkqeWWnFxuICAgIGlmICh0aGlzLmlzVGlhblhpKHllYXJCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnllpwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGkobW9udGhCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblhpKGRheUJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblhpKHRpbWVCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnllpwnKTtcbiAgICB9XG5cbiAgICAvLyDnuqLoibNcbiAgICBpZiAodGhpcy5pc0hvbmdZYW4oeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0hvbmdZYW4obW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSG9uZ1lhbihkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0hvbmdZYW4odGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgIH1cblxuICAgIC8vIOWkqee9l1xuICAgIGlmICh0aGlzLmlzVGlhbkx1byh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkx1byhtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnnvZcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuTHVvKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkx1byh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgfVxuXG4gICAgLy8g5Zyw572RXG4gICAgaWYgKHRoaXMuaXNEaVdhbmcoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WcsOe9kScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RpV2FuZyhtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEaVdhbmcoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEaVdhbmcodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WcsOe9kScpO1xuICAgIH1cblxuICAgIC8vIOe+iuWIg1xuICAgIGlmICh0aGlzLmlzWWFuZ1JlbihkYXlTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWWFuZ1JlbihkYXlTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWWFuZ1JlbihkYXlTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp56m6XG4gICAgaWYgKHRoaXMuaXNUaWFuS29uZyh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbktvbmcobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbktvbmcoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnnqbonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuS29uZyh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgfVxuXG4gICAgLy8g5Zyw5YqrXG4gICAgaWYgKHRoaXMuaXNEaUppZSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5Zyw5YqrJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRGlKaWUobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5Zyw5YqrJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRGlKaWUoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEaUppZSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5Zyw5YqrJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5YiRXG4gICAgaWYgKHRoaXMuaXNUaWFuWGluZyh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblhpbmcobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblhpbmcoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGluZyh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5ZOtXG4gICAgaWYgKHRoaXMuaXNUaWFuS3UoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5LdShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnlk60nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuS3UoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnlk60nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuS3UodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgIH1cblxuICAgIC8vIOWkqeiZmlxuICAgIGlmICh0aGlzLmlzVGlhblh1KHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnomZonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWHUobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblh1KGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblh1KHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnomZonKTtcbiAgICB9XG5cbiAgICAvLyDlkrjmsaBcbiAgICBpZiAodGhpcy5pc1hpYW5DaGkoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1hpYW5DaGkobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWGlhbkNoaShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1hpYW5DaGkodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgIH1cblxuICAgIC8vIOS6oeelnlxuICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4oeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1dhbmdTaGVuKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1dhbmdTaGVuKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5Lqh56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4odGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgIH1cblxuICAgIC8vIOWKq+eFnlxuICAgIGlmICh0aGlzLmlzSmllU2hhKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfliqvnhZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaWVTaGEobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmllU2hhKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmllU2hhKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfliqvnhZ4nKTtcbiAgICB9XG5cbiAgICAvLyDngb7nhZ5cbiAgICBpZiAodGhpcy5pc1phaVNoYSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWmFpU2hhKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+eBvueFnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1phaVNoYShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+eBvueFnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1phaVNoYSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgfVxuXG4gICAgLy8g5bKB56C0XG4gICAgaWYgKHRoaXMuaXNTdWlQbyh5ZWFyQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5bKB56C0Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU3VpUG8obW9udGhCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5bKB56C0Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU3VpUG8oZGF5QnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflsoHnoLQnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdWlQbyh0aW1lQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5bKB56C0Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSn6ICXXG4gICAgaWYgKHRoaXMuaXNEYUhhbyh5ZWFyQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSn6ICXJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRGFIYW8obW9udGhCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSn6ICXJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRGFIYW8oZGF5QnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEYUhhbyh0aW1lQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSn6ICXJyk7XG4gICAgfVxuXG4gICAgLy8g5LqU6ay8XG4gICAgaWYgKHRoaXMuaXNXdUd1aSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV3VHdWkobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV3VHdWkoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfkupTprLwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNXdUd1aSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5b636LS15Lq6XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4obW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4odGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICB9XG5cbiAgICAvLyDmnIjlvrfotLXkurpcbiAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHllYXJTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWXVlRGVHdWlSZW4obW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfmnIjlvrfotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZdWVEZUd1aVJlbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+aciOW+t+i0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHRpbWVTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSp6LWmXG4gICAgaWYgKHRoaXMuaXNUaWFuU2hlKHllYXJTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblNoZShtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+Wkqei1picpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5TaGUoZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnotaYnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuU2hlKHRpbWVTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5oGpXG4gICAgaWYgKHRoaXMuaXNUaWFuRW4oeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRW4obW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRW4oZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRW4odGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICB9XG5cbiAgICAvLyDlpKnlrphcbiAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHllYXJTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkd1YW4obW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnlrpgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuR3VhbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeWumCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHRpbWVTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp56aPXG4gICAgaWYgKHRoaXMuaXNUaWFuRnUoeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRnUobW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRnUoZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRnUodGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICB9XG5cbiAgICAvLyDlpKnljqhcbiAgICBpZiAodGhpcy5pc1RpYW5DaHUoeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuQ2h1KG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5Y6oJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkNodShkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeWOqCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5DaHUodGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnlt6tcbiAgICBpZiAodGhpcy5pc1RpYW5XdSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5berJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbld1KG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5XdShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5XdSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5berJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5pyIXG4gICAgaWYgKHRoaXMuaXNUaWFuWXVlKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnmnIgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWXVlKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZdWUoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnmnIgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWXVlKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnmnIgnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnpqaxcbiAgICBpZiAodGhpcy5pc1RpYW5NYSh5ZWFyQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbk1hKG1vbnRoQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqemprCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5NYShkYXlCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqemprCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5NYSh0aW1lQnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgfVxuXG4gICAgLy8g56ul5a2Q54We77yI5qC55o2u5a2j6IqC44CB57qz6Z+z5LqU6KGM5ZKM5Zyw5pSv5Yik5pat77yJXG4gICAgaWYgKHNlYXNvbiAmJiB0aGlzLmlzVG9uZ1ppU2hhKGVpZ2h0Q2hhciwgc2Vhc29uKSkge1xuICAgICAgc2hlblNoYS5wdXNoKCfnq6XlrZDnhZ4nKTtcbiAgICB9XG5cbiAgICAvLyDlsIblhpvnrq3vvIjmoLnmja7lraPoioLjgIHml7bmlK/jgIHlhrLlhYvlhbPns7vlkoznurPpn7PkupTooYzliKTmlq3vvIlcbiAgICBpZiAoc2Vhc29uICYmIHRoaXMuaXNKaWFuZ0p1bkppYW4oZWlnaHRDaGFyLCBzZWFzb24pKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflsIblhpvnrq0nKTtcbiAgICB9XG5cbiAgICAvLyDlsIblkITmn7HnpZ7nhZ7mt7vliqDliLDmgLvnpZ7nhZ7mlbDnu4TkuK1cbiAgICBzaGVuU2hhLnB1c2goLi4ueWVhclNoZW5TaGEubWFwKHMgPT4gYOW5tOafsToke3N9YCkpO1xuICAgIHNoZW5TaGEucHVzaCguLi5tb250aFNoZW5TaGEubWFwKHMgPT4gYOaciOafsToke3N9YCkpO1xuICAgIHNoZW5TaGEucHVzaCguLi5kYXlTaGVuU2hhLm1hcChzID0+IGDml6Xmn7E6JHtzfWApKTtcbiAgICBzaGVuU2hhLnB1c2goLi4uaG91clNoZW5TaGEubWFwKHMgPT4gYOaXtuafsToke3N9YCkpO1xuXG4gICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgY29uc29sZS5sb2coJ2NhbGN1bGF0ZVNoZW5TaGEg6L+U5Zue57uT5p6cOicpO1xuICAgIGNvbnNvbGUubG9nKCfmgLvnpZ7nhZ46Jywgc2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+W5tOafseelnueFnjonLCB5ZWFyU2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+aciOafseelnueFnjonLCBtb250aFNoZW5TaGEpO1xuICAgIGNvbnNvbGUubG9nKCfml6Xmn7HnpZ7nhZ46JywgZGF5U2hlblNoYSk7XG4gICAgY29uc29sZS5sb2coJ+aXtuafseelnueFnjonLCBob3VyU2hlblNoYSk7XG5cbiAgICAvLyDnoa7kv53ov5Tlm57nmoTmmK/mlbDnu4RcbiAgICBjb25zdCBmaW5hbFNoZW5TaGEgPSBBcnJheS5pc0FycmF5KHNoZW5TaGEpID8gWy4uLnNoZW5TaGFdIDogW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNoZW5TaGEpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmgLvnpZ7nhZ7kuI3mmK/mlbDnu4TvvIzlvLrliLbovazmjaLkuLrmlbDnu4QnKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbFllYXJTaGVuU2hhID0gQXJyYXkuaXNBcnJheSh5ZWFyU2hlblNoYSkgPyBbLi4ueWVhclNoZW5TaGFdIDogW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHllYXJTaGVuU2hhKSkge1xuICAgICAgY29uc29sZS5lcnJvcign5bm05p+x56We54We5LiN5piv5pWw57uE77yM5by65Yi26L2s5o2i5Li65pWw57uEJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxNb250aFNoZW5TaGEgPSBBcnJheS5pc0FycmF5KG1vbnRoU2hlblNoYSkgPyBbLi4ubW9udGhTaGVuU2hhXSA6IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShtb250aFNoZW5TaGEpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmnIjmn7HnpZ7nhZ7kuI3mmK/mlbDnu4TvvIzlvLrliLbovazmjaLkuLrmlbDnu4QnKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbERheVNoZW5TaGEgPSBBcnJheS5pc0FycmF5KGRheVNoZW5TaGEpID8gWy4uLmRheVNoZW5TaGFdIDogW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRheVNoZW5TaGEpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfml6Xmn7HnpZ7nhZ7kuI3mmK/mlbDnu4TvvIzlvLrliLbovazmjaLkuLrmlbDnu4QnKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbEhvdXJTaGVuU2hhID0gQXJyYXkuaXNBcnJheShob3VyU2hlblNoYSkgPyBbLi4uaG91clNoZW5TaGFdIDogW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGhvdXJTaGVuU2hhKSkge1xuICAgICAgY29uc29sZS5lcnJvcign5pe25p+x56We54We5LiN5piv5pWw57uE77yM5by65Yi26L2s5o2i5Li65pWw57uEJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNoZW5TaGE6IGZpbmFsU2hlblNoYSxcbiAgICAgIHllYXJTaGVuU2hhOiBmaW5hbFllYXJTaGVuU2hhLFxuICAgICAgbW9udGhTaGVuU2hhOiBmaW5hbE1vbnRoU2hlblNoYSxcbiAgICAgIGRheVNoZW5TaGE6IGZpbmFsRGF5U2hlblNoYSxcbiAgICAgIGhvdXJTaGVuU2hhOiBmaW5hbEhvdXJTaGVuU2hhXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnkuZnotLXkurpcbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeS5mei0teS6ulxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuWWlHdWlSZW4oZGF5U3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeS5mei0teS6uueahOiuoeeul+inhOWIme+8mlxuICAgIC8vIOeUsuaIiuW6mueJm+e+iu+8jOS5meW3sem8oOeMtOS5oe+8jOS4meS4geeMqum4oeS9je+8jOWjrOeZuOibh+WFlOiXj++8jFxuICAgIC8vIOWFrei+m+mAouiZjuWFlO+8jOatpOaYr+i0teS6uuaWueOAglxuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgICAgICfnlLInOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICfkuZknOiBbJ+WtkCcsICfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+S6pScsICfphYknXSxcbiAgICAgICfkuIEnOiBbJ+S6pScsICfphYknXSxcbiAgICAgICfmiIonOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICflt7EnOiBbJ+WtkCcsICfnlLMnXSxcbiAgICAgICfluponOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICfovpsnOiBbJ+WvhScsICflja8nXSwgLy8g5L+u5q2j77ya6L6b5pel6LS15Lq65Zyo5a+F5Y2vXG4gICAgICAn5aOsJzogWyflt7MnLCAn5Y2vJ10sIC8vIOS/ruato++8muWjrOaXpei0teS6uuWcqOW3s+WNr1xuICAgICAgJ+eZuCc6IFsn5bezJywgJ+WNryddICAvLyDkv67mraPvvJrnmbjml6XotLXkurrlnKjlt7Plja9cbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFtkYXlTdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrmlofmmIxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65paH5piMXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1dlbkNoYW5nKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5paH5piM5pif55qE6K6h566X6KeE5YiZ77yaXG4gICAgLy8g5a+F5Y2I5oiM6KeB5bez77yM55Sz5a2Q6L6w6KeB55Sz77yMXG4gICAgLy8g5Lql5Y2v5pyq6KeB5Y2I77yM5bez6YWJ5LiR6KeB5a+F44CCXG4gICAgLy8g6L+Z6YeM566A5YyW5aSE55CG77yM55u05o6l5Yik5pat5Zyw5pSv5piv5ZCm5Li65paH5piM5pifXG4gICAgcmV0dXJuIFsn5bezJywgJ+eUsycsICfljYgnLCAn5a+FJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrljY7nm5ZcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65Y2O55uWXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0h1YUdhaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWNjuebluaYn+eahOiuoeeul+inhOWIme+8mlxuICAgIC8vIOWvheWNiOaIjOingeaIjO+8jOeUs+WtkOi+sOingei+sO+8jFxuICAgIC8vIOS6peWNr+acquingeacqu+8jOW3s+mFieS4keingeS4keOAglxuICAgIC8vIOi/memHjOeugOWMluWkhOeQhu+8jOebtOaOpeWIpOaWreWcsOaUr+aYr+WQpuS4uuWNjuebluaYn1xuICAgIHJldHVybiBbJ+i+sCcsICfmiIwnLCAn5LiRJywgJ+acqiddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li656aE56WeXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrnpoTnpZ5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzTHVTaGVuKHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICflr4UnLFxuICAgICAgJ+S5mSc6ICflja8nLFxuICAgICAgJ+S4mSc6ICflt7MnLFxuICAgICAgJ+S4gSc6ICfljYgnLFxuICAgICAgJ+aIiic6ICflt7MnLFxuICAgICAgJ+W3sSc6ICfljYgnLFxuICAgICAgJ+W6mic6ICfnlLMnLFxuICAgICAgJ+i+myc6ICfphYknLFxuICAgICAgJ+WjrCc6ICfkuqUnLFxuICAgICAgJ+eZuCc6ICflrZAnXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbc3RlbV0gPT09IGJyYW5jaDtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrmoYPoirFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65qGD6IqxXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1Rhb0h1YShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+WNrycsICfphYknLCAn5a2QJywgJ+WNiCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65a2k6L6wXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWtpOi+sFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNHdUNoZW4oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfovrAnLCAn5oiMJywgJ+S4kScsICfmnKonXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWvoeWuv1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlr6Hlrr9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzR3VhU3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflr4UnLCAn55SzJywgJ+W3sycsICfkuqUnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uumpv+mprFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcGFyYW0geWVhckJyYW5jaCDlubTmlK/vvIjlj6/pgInvvIlcbiAgICogQHJldHVybnMg5piv5ZCm5Li66am/6amsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1lpTWEoYnJhbmNoOiBzdHJpbmcsIHllYXJCcmFuY2g/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDpqb/pqaznmoTorqHnrpfop4TliJnvvJpcbiAgICAvLyDlr4XljYjmiIzlubTpqazlnKjnlLPvvIznlLPlrZDovrDlubTpqazlnKjlr4XvvIzlt7PphYnkuJHlubTpqazlnKjkuqXvvIzkuqXlja/mnKrlubTpqazlnKjlt7NcblxuICAgIC8vIOWmguaenOaPkOS+m+S6huW5tOaUr++8jOWImeagueaNruW5tOaUr+WIpOaWrVxuICAgIGlmICh5ZWFyQnJhbmNoKSB7XG4gICAgICBjb25zdCB5aU1hTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICAgJ+WvhSc6ICfnlLMnLFxuICAgICAgICAn5Y2IJzogJ+eUsycsXG4gICAgICAgICfmiIwnOiAn55SzJyxcbiAgICAgICAgJ+eUsyc6ICflr4UnLFxuICAgICAgICAn5a2QJzogJ+WvhScsXG4gICAgICAgICfovrAnOiAn5a+FJyxcbiAgICAgICAgJ+W3syc6ICfkuqUnLFxuICAgICAgICAn6YWJJzogJ+S6pScsXG4gICAgICAgICfkuJEnOiAn5LqlJyxcbiAgICAgICAgJ+S6pSc6ICflt7MnLFxuICAgICAgICAn5Y2vJzogJ+W3sycsXG4gICAgICAgICfmnKonOiAn5bezJ1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHlpTWFNYXBbeWVhckJyYW5jaF0gPT09IGJyYW5jaDtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmj5DkvpvlubTmlK/vvIzliJnnroDljJblpITnkIbvvIznm7TmjqXliKTmlq3lnLDmlK/mmK/lkKbkuLrpqb/pqazmmJ9cbiAgICByZXR1cm4gWyfnlLMnLCAn5a+FJywgJ+W3sycsICfkuqUnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWwhuaYn1xuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65bCG5pifXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppYW5nWGluZyhkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5bCG5pif5LiO5pel5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgamlhbmdYaW5nTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5bezJ10sXG4gICAgICAn5LmZJzogWyfljYgnXSxcbiAgICAgICfkuJknOiBbJ+eUsyddLFxuICAgICAgJ+S4gSc6IFsn6YWJJ10sXG4gICAgICAn5oiKJzogWyfnlLMnXSxcbiAgICAgICflt7EnOiBbJ+mFiSddLFxuICAgICAgJ+W6mic6IFsn5LqlJ10sXG4gICAgICAn6L6bJzogWyflrZAnXSxcbiAgICAgICflo6wnOiBbJ+WvhSddLFxuICAgICAgJ+eZuCc6IFsn5Y2vJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIGppYW5nWGluZ01hcFtkYXlTdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrph5HnpZ5cbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li66YeR56WeXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppblNoZW4oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5b63XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlvrdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkRlKHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKnlvrfkuI7lpKnlubLnmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuRGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfkuIEnLFxuICAgICAgJ+S5mSc6ICfnlLMnLFxuICAgICAgJ+S4mSc6ICflo6wnLFxuICAgICAgJ+S4gSc6ICfovpsnLFxuICAgICAgJ+aIiic6ICfkuJknLFxuICAgICAgJ+W3sSc6ICfkuZknLFxuICAgICAgJ+W6mic6ICfmiIonLFxuICAgICAgJ+i+myc6ICflt7EnLFxuICAgICAgJ+WjrCc6ICfluponLFxuICAgICAgJ+eZuCc6ICfnmbgnXG4gICAgfTtcblxuICAgIC8vIOWkqeW+t+S4juWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5EZUJyYW5jaE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5LiBJzogJ+WNiCcsXG4gICAgICAn55SzJzogJ+eUsycsXG4gICAgICAn5aOsJzogJ+S6pScsXG4gICAgICAn6L6bJzogJ+mFiScsXG4gICAgICAn5LiZJzogJ+W3sycsXG4gICAgICAn5LmZJzogJ+WNrycsXG4gICAgICAn5oiKJzogJ+i+sCcsXG4gICAgICAn5bexJzogJ+S4kScsXG4gICAgICAn5bqaJzogJ+eUsycsXG4gICAgICAn55m4JzogJ+WtkCdcbiAgICB9O1xuXG4gICAgY29uc3QgdGlhbkRlU3RlbSA9IHRpYW5EZU1hcFtzdGVtXTtcbiAgICBjb25zdCB0aWFuRGVCcmFuY2ggPSB0aWFuRGVCcmFuY2hNYXBbdGlhbkRlU3RlbV07XG5cbiAgICByZXR1cm4gYnJhbmNoID09PSB0aWFuRGVCcmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5b635ZCIXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlvrflkIhcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkRlSGUoc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeW+t+WQiOS4juWkqeW5sueahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5EZUhlTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5bexJyxcbiAgICAgICfkuZknOiAn5bqaJyxcbiAgICAgICfkuJknOiAn6L6bJyxcbiAgICAgICfkuIEnOiAn5aOsJyxcbiAgICAgICfmiIonOiAn55m4JyxcbiAgICAgICflt7EnOiAn55SyJyxcbiAgICAgICfluponOiAn5LmZJyxcbiAgICAgICfovpsnOiAn5LiZJyxcbiAgICAgICflo6wnOiAn5LiBJyxcbiAgICAgICfnmbgnOiAn5oiKJ1xuICAgIH07XG5cbiAgICAvLyDlpKnlvrflkIjkuI7lnLDmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuRGVIZUJyYW5jaE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5bexJzogJ+S4kScsXG4gICAgICAn5bqaJzogJ+WvhScsXG4gICAgICAn6L6bJzogJ+WNrycsXG4gICAgICAn5aOsJzogJ+i+sCcsXG4gICAgICAn55m4JzogJ+W3sycsXG4gICAgICAn55SyJzogJ+WNiCcsXG4gICAgICAn5LmZJzogJ+acqicsXG4gICAgICAn5LiZJzogJ+eUsycsXG4gICAgICAn5LiBJzogJ+mFiScsXG4gICAgICAn5oiKJzogJ+aIjCdcbiAgICB9O1xuXG4gICAgY29uc3QgdGlhbkRlSGVTdGVtID0gdGlhbkRlSGVNYXBbc3RlbV07XG4gICAgY29uc3QgdGlhbkRlSGVCcmFuY2ggPSB0aWFuRGVIZUJyYW5jaE1hcFt0aWFuRGVIZVN0ZW1dO1xuXG4gICAgcmV0dXJuIGJyYW5jaCA9PT0gdGlhbkRlSGVCcmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65pyI5b63XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrmnIjlvrdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWXVlRGUoc3RlbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5pyI5b635LiO5aSp5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgeXVlRGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfkuJknLFxuICAgICAgJ+S5mSc6ICfnlLInLFxuICAgICAgJ+S4mSc6ICflo6wnLFxuICAgICAgJ+S4gSc6ICfluponLFxuICAgICAgJ+aIiic6ICfmiIonLFxuICAgICAgJ+W3sSc6ICfkuJknLFxuICAgICAgJ+W6mic6ICfnlLInLFxuICAgICAgJ+i+myc6ICflo6wnLFxuICAgICAgJ+WjrCc6ICfluponLFxuICAgICAgJ+eZuCc6ICfmiIonXG4gICAgfTtcblxuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHl1ZURlTWFwKS5pbmNsdWRlcyhzdGVtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnljLtcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5Yy7XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5ZaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeWMu+S4juWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5ZaU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+S4kScsXG4gICAgICAn5LiRJzogJ+WtkCcsXG4gICAgICAn5a+FJzogJ+S6pScsXG4gICAgICAn5Y2vJzogJ+aIjCcsXG4gICAgICAn6L6wJzogJ+mFiScsXG4gICAgICAn5bezJzogJ+eUsycsXG4gICAgICAn5Y2IJzogJ+acqicsXG4gICAgICAn5pyqJzogJ+WNiCcsXG4gICAgICAn55SzJzogJ+W3sycsXG4gICAgICAn6YWJJzogJ+i+sCcsXG4gICAgICAn5oiMJzogJ+WNrycsXG4gICAgICAn5LqlJzogJ+WvhSdcbiAgICB9O1xuXG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGlhbllpTWFwKS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeWWnFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcGFyYW0geWVhckJyYW5jaCDlubTmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5ZacXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5YaShicmFuY2g6IHN0cmluZywgeWVhckJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp5Zac5LiO5bm05pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhblhpTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICflrZAnOiAn6YWJJyxcbiAgICAgICfkuJEnOiAn55SzJyxcbiAgICAgICflr4UnOiAn5pyqJyxcbiAgICAgICflja8nOiAn5Y2IJyxcbiAgICAgICfovrAnOiAn5bezJyxcbiAgICAgICflt7MnOiAn6L6wJyxcbiAgICAgICfljYgnOiAn5Y2vJyxcbiAgICAgICfmnKonOiAn5a+FJyxcbiAgICAgICfnlLMnOiAn5LiRJyxcbiAgICAgICfphYknOiAn5a2QJyxcbiAgICAgICfmiIwnOiAn5LqlJyxcbiAgICAgICfkuqUnOiAn5oiMJ1xuICAgIH07XG5cbiAgICAvLyDmoLnmja7lubTmlK/mn6Xmib7lr7nlupTnmoTlpKnllpzlnLDmlK9cbiAgICBjb25zdCB0aWFuWGlCcmFuY2ggPSB0aWFuWGlNYXBbeWVhckJyYW5jaF07XG5cbiAgICAvLyDmo4Dmn6XlvZPliY3lnLDmlK/mmK/lkKbkuI7lpKnllpzlnLDmlK/ljLnphY1cbiAgICByZXR1cm4gYnJhbmNoID09PSB0aWFuWGlCcmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li657qi6ImzXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uue6ouiJs1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNIb25nWWFuKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFsn5Y2vJywgJ+W3sycsICfnlLMnLCAn5oiMJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnnvZdcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp572XXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5MdW8oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn5oiMJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlnLDnvZFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65Zyw572RXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RpV2FuZyhicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfmnKonO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uue+iuWIg1xuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li6576K5YiDXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1lhbmdSZW4oZGF5U3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOe+iuWIg+S4juaXpeW5sueahOWvueW6lOWFs+ezu1xuICAgIC8vIOe+iuWIg+WPo+ivgO+8mueUsue+iuWIg+WcqOWNr++8jOS5mee+iuWIg+WcqOWvheOAguS4meaIiue+iuWIg+WcqOWNiO+8jOS4geW3see+iuWIg+WcqOW3s+OAguW6mue+iuWIg+WcqOmFie+8jOi+m+e+iuWIg+WcqOeUs+OAguWjrOe+iuWIg+WcqOS6pe+8jOeZuOe+iuWIg+WcqOWtkOOAglxuICAgIGNvbnN0IHlhbmdSZW5NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICflja8nLFxuICAgICAgJ+S5mSc6ICflr4UnLFxuICAgICAgJ+S4mSc6ICfljYgnLFxuICAgICAgJ+S4gSc6ICflt7MnLFxuICAgICAgJ+aIiic6ICfljYgnLFxuICAgICAgJ+W3sSc6ICflt7MnLFxuICAgICAgJ+W6mic6ICfphYknLFxuICAgICAgJ+i+myc6ICfnlLMnLFxuICAgICAgJ+WjrCc6ICfkuqUnLFxuICAgICAgJ+eZuCc6ICflrZAnXG4gICAgfTtcblxuICAgIHJldHVybiB5YW5nUmVuTWFwW2RheVN0ZW1dID09PSBicmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp56m6XG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeepulxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuS29uZyhicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfmiIwnO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWcsOWKq1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlnLDliqtcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzRGlKaWUoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn6L6wJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnliJFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5YiRXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5YaW5nKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGJyYW5jaCA9PT0gJ+W3syc7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5ZOtXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeWTrVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuS3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn5pyqJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnomZpcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp6JmaXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5YdShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfkuJEnO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWSuOaxoFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlkrjmsaBcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWGlhbkNoaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+S4kScsICfmnKonLCAn6L6wJywgJ+aIjCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65Lqh56WeXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS6oeelnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNXYW5nU2hlbihicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+WvhScsICfnlLMnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWKq+eFnlxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrliqvnhZ5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzSmllU2hhKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFsn5a2QJywgJ+WNiCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li654G+54WeXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uueBvueFnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNaYWlTaGEoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflja8nLCAn6YWJJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlsoHnoLRcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHBhcmFtIHllYXJCcmFuY2gg5bm05pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWygeegtFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNTdWlQbyhicmFuY2g6IHN0cmluZywgeWVhckJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5bKB56C05LiO5bm05pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3Qgc3VpUG9NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WtkCc6ICfljYgnLFxuICAgICAgJ+WNiCc6ICflrZAnLFxuICAgICAgJ+WNryc6ICfphYknLFxuICAgICAgJ+mFiSc6ICflja8nLFxuICAgICAgJ+i+sCc6ICfmiIwnLFxuICAgICAgJ+aIjCc6ICfovrAnLFxuICAgICAgJ+S4kSc6ICfmnKonLFxuICAgICAgJ+acqic6ICfkuJEnLFxuICAgICAgJ+WvhSc6ICfnlLMnLFxuICAgICAgJ+eUsyc6ICflr4UnLFxuICAgICAgJ+W3syc6ICfkuqUnLFxuICAgICAgJ+S6pSc6ICflt7MnXG4gICAgfTtcblxuICAgIHJldHVybiBzdWlQb01hcFt5ZWFyQnJhbmNoXSA9PT0gYnJhbmNoO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkp+iAl1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcGFyYW0geWVhckJyYW5jaCDlubTmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSn6ICXXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RhSGFvKGJyYW5jaDogc3RyaW5nLCB5ZWFyQnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKfogJfkuI7lubTmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCBkYUhhb01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+acqicsXG4gICAgICAn5LiRJzogJ+eUsycsXG4gICAgICAn5a+FJzogJ+mFiScsXG4gICAgICAn5Y2vJzogJ+aIjCcsXG4gICAgICAn6L6wJzogJ+S6pScsXG4gICAgICAn5bezJzogJ+WtkCcsXG4gICAgICAn5Y2IJzogJ+S4kScsXG4gICAgICAn5pyqJzogJ+WvhScsXG4gICAgICAn55SzJzogJ+WNrycsXG4gICAgICAn6YWJJzogJ+i+sCcsXG4gICAgICAn5oiMJzogJ+W3sycsXG4gICAgICAn5LqlJzogJ+WNiCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRhSGFvTWFwW3llYXJCcmFuY2hdID09PSBicmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65LqU6ay8XG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS6lOmsvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNXdUd1aShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+W3sycsICfnlLMnLCAn5LqlJywgJ+WvhSddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li656ul5a2Q54WeXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEBwYXJhbSBzZWFzb24g5a2j6IqC77yI5pil44CB5aSP44CB56eL44CB5Yas77yJXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuerpeWtkOeFnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUb25nWmlTaGEoZWlnaHRDaGFyOiBFaWdodENoYXIsIHNlYXNvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g6I635Y+W57qz6Z+z5LqU6KGMXG4gICAgY29uc3QgeWVhck5hWWluID0gZWlnaHRDaGFyLmdldFllYXJOYVlpbigpO1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSBlaWdodENoYXIuZ2V0TW9udGhOYVlpbigpO1xuICAgIGNvbnN0IGRheU5hWWluID0gZWlnaHRDaGFyLmdldERheU5hWWluKCk7XG4gICAgY29uc3QgdGltZU5hWWluID0gZWlnaHRDaGFyLmdldFRpbWVOYVlpbigpO1xuXG4gICAgLy8g5o+Q5Y+W57qz6Z+z5LqU6KGM5bGe5oCn77yI6YeR5pyo5rC054Gr5Zyf77yJXG4gICAgY29uc3QgeWVhck5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh5ZWFyTmFZaW4pO1xuICAgIGNvbnN0IGRheU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyhkYXlOYVlpbik7XG4gICAgY29uc3QgdGltZU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pO1xuXG4gICAgLy8g56ul5a2Q54We5Yik5pat5Y+j6K+A77yaXG4gICAgLy8gXCLmmKXnp4vlr4XlrZDotLXvvIzlhqzlpI/lja/mnKrovrDvvJvph5HmnKjpqazlja/lkIjvvIzmsLTngavpuKHniqzlpJrvvJvlnJ/lkb3pgKLovrDlt7PvvIznq6XlrZDlrprkuI3plJlcIlxuXG4gICAgLy8gMS4g5oyJ5a2j6IqC5ZKM5Zyw5pSv5Yik5patXG4gICAgbGV0IHNlYXNvbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKChzZWFzb24gPT09ICfmmKUnIHx8IHNlYXNvbiA9PT0gJ+eniycpICYmIChkYXlCcmFuY2ggPT09ICflr4UnIHx8IGRheUJyYW5jaCA9PT0gJ+WtkCcgfHwgdGltZUJyYW5jaCA9PT0gJ+WvhScgfHwgdGltZUJyYW5jaCA9PT0gJ+WtkCcpKSB7XG4gICAgICBzZWFzb25DaGVjayA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgoc2Vhc29uID09PSAn5YasJyB8fCBzZWFzb24gPT09ICflpI8nKSAmJiAoZGF5QnJhbmNoID09PSAn5Y2vJyB8fCBkYXlCcmFuY2ggPT09ICfmnKonIHx8IGRheUJyYW5jaCA9PT0gJ+i+sCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVCcmFuY2ggPT09ICflja8nIHx8IHRpbWVCcmFuY2ggPT09ICfmnKonIHx8IHRpbWVCcmFuY2ggPT09ICfovrAnKSkge1xuICAgICAgc2Vhc29uQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDIuIOaMiee6s+mfs+S6lOihjOWSjOWcsOaUr+WIpOaWrVxuICAgIGxldCBuYVlpbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKCh5ZWFyTmFZaW5XdVhpbmcgPT09ICfph5EnIHx8IHllYXJOYVlpbld1WGluZyA9PT0gJ+acqCcgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICfph5EnIHx8IGRheU5hWWluV3VYaW5nID09PSAn5pyoJykgJiZcbiAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+WNiCcgfHwgZGF5QnJhbmNoID09PSAn5Y2vJyB8fCB0aW1lQnJhbmNoID09PSAn5Y2IJyB8fCB0aW1lQnJhbmNoID09PSAn5Y2vJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoKHllYXJOYVlpbld1WGluZyA9PT0gJ+awtCcgfHwgeWVhck5hWWluV3VYaW5nID09PSAn54GrJyB8fCBkYXlOYVlpbld1WGluZyA9PT0gJ+awtCcgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICfngasnKSAmJlxuICAgICAgICAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+mFiScgfHwgZGF5QnJhbmNoID09PSAn5oiMJyB8fCB0aW1lQnJhbmNoID09PSAn6YWJJyB8fCB0aW1lQnJhbmNoID09PSAn5oiMJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoKHllYXJOYVlpbld1WGluZyA9PT0gJ+WcnycgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICflnJ8nKSAmJlxuICAgICAgICAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+i+sCcgfHwgZGF5QnJhbmNoID09PSAn5bezJyB8fCB0aW1lQnJhbmNoID09PSAn6L6wJyB8fCB0aW1lQnJhbmNoID09PSAn5bezJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDMuIOe7vOWQiOWIpOaWre+8muWto+iKguadoeS7tuaIlue6s+mfs+adoeS7tua7oei2s+WFtuS4gOWNs+WPr1xuICAgIHJldHVybiBzZWFzb25DaGVjayB8fCBuYVlpbkNoZWNrO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlsIblhpvnrq1cbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIHNlYXNvbiDlraPoioLvvIjmmKXjgIHlpI/jgIHnp4vjgIHlhqzvvIlcbiAgICogQHJldHVybnMg5piv5ZCm5Li65bCG5Yab566tXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppYW5nSnVuSmlhbihlaWdodENoYXI6IEVpZ2h0Q2hhciwgc2Vhc29uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDojrflj5blm5vmn7HlubLmlK9cbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXREYXlaaGkoKTtcbiAgICBjb25zdCB0aW1lU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG4gICAgY29uc3QgdGltZUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRUaW1lWmhpKCk7XG5cbiAgICAvLyDojrflj5bnurPpn7PkupTooYxcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSBlaWdodENoYXIuZ2V0WWVhck5hWWluKCk7XG4gICAgY29uc3QgbW9udGhOYVlpbiA9IGVpZ2h0Q2hhci5nZXRNb250aE5hWWluKCk7XG4gICAgY29uc3QgZGF5TmFZaW4gPSBlaWdodENoYXIuZ2V0RGF5TmFZaW4oKTtcbiAgICBjb25zdCB0aW1lTmFZaW4gPSBlaWdodENoYXIuZ2V0VGltZU5hWWluKCk7XG5cbiAgICAvLyDmj5Dlj5bnurPpn7PkupTooYzlsZ7mgKfvvIjph5HmnKjmsLTngavlnJ/vvIlcbiAgICBjb25zdCB5ZWFyTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKHllYXJOYVlpbik7XG4gICAgY29uc3QgZGF5TmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKTtcbiAgICBjb25zdCB0aW1lTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKHRpbWVOYVlpbik7XG5cbiAgICAvLyDlsIblhpvnrq3liKTmlq3lj6Por4DvvJpcbiAgICAvLyBcIuaYpeWto+mFieaIjOi+sO+8jOWkj+Wto+acquWNr+WtkO+8jOeni+Wto+WvheeUs+WNiO+8jOWGrOWto+W3s+S6peS4kVwiXG4gICAgLy8g5ZCM5pe26ZyA6KaB6ICD6JmR5YWr5a2X5Lit55qE5Yay5YWL5YWz57O75ZKM57qz6Z+z5LqU6KGMXG5cbiAgICAvLyAxLiDmjInlraPoioLlkozml7bmlK/liKTmlq1cbiAgICBsZXQgc2Vhc29uQ2hlY2sgPSBmYWxzZTtcbiAgICBjb25zdCBqaWFuZ0p1bkppYW5NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gICAgICAn5pilJzogWyfphYknLCAn5oiMJywgJ+i+sCddLFxuICAgICAgJ+Wkjyc6IFsn5pyqJywgJ+WNrycsICflrZAnXSxcbiAgICAgICfnp4snOiBbJ+WvhScsICfnlLMnLCAn5Y2IJ10sXG4gICAgICAn5YasJzogWyflt7MnLCAn5LqlJywgJ+S4kSddXG4gICAgfTtcblxuICAgIGlmIChqaWFuZ0p1bkppYW5NYXBbc2Vhc29uXT8uaW5jbHVkZXModGltZUJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbkNoZWNrID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAyLiDmo4Dmn6XlhavlrZfkuK3nmoTlhrLlhYvlhbPns7tcbiAgICAvLyDml6XmlK/kuI7ml7bmlK/nm7jlhrLvvIzmiJbogIXml6XlubLkuI7ml7blubLnm7jlhYtcbiAgICBsZXQgY2hvbmdLZUNoZWNrID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNaaGlDaG9uZyhkYXlCcmFuY2gsIHRpbWVCcmFuY2gpIHx8IHRoaXMuaXNXdVhpbmdLZSh0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSksIHRoaXMuZ2V0U3RlbVd1WGluZyh0aW1lU3RlbSkpKSB7XG4gICAgICBjaG9uZ0tlQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDMuIOajgOafpee6s+mfs+S6lOihjOaYr+WQpuS4jeiwg+WSjFxuICAgIC8vIOaXtuafsee6s+mfs+S4juaXpeafsee6s+mfs+ebuOWFi1xuICAgIGxldCBuYVlpbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNXdVhpbmdLZSh0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKSwgdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pKSB8fFxuICAgICAgICB0aGlzLmlzV3VYaW5nS2UodGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pLCB0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKSkpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDQuIOe7vOWQiOWIpOaWre+8muWto+iKguadoeS7tuW/hemhu+a7oei2s++8jOS4lOWGsuWFi+WFs+ezu+aIlue6s+mfs+S4jeiwg+WSjOWFtuS4gOa7oei2s1xuICAgIHJldHVybiBzZWFzb25DaGVjayAmJiAoY2hvbmdLZUNoZWNrIHx8IG5hWWluQ2hlY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreS4pOWcsOaUr+aYr+WQpuebuOWGslxuICAgKiBAcGFyYW0gemhpMSDlnLDmlK8xXG4gICAqIEBwYXJhbSB6aGkyIOWcsOaUrzJcbiAgICogQHJldHVybnMg5piv5ZCm55u45YayXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1poaUNob25nKHpoaTE6IHN0cmluZywgemhpMjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY2hvbmdQYWlycyA9IFtcbiAgICAgIFsn5a2QJywgJ+WNiCddLCBbJ+S4kScsICfmnKonXSwgWyflr4UnLCAn55SzJ10sIFsn5Y2vJywgJ+mFiSddLFxuICAgICAgWyfovrAnLCAn5oiMJ10sIFsn5bezJywgJ+S6pSddXG4gICAgXTtcblxuICAgIGZvciAoY29uc3QgcGFpciBvZiBjaG9uZ1BhaXJzKSB7XG4gICAgICBpZiAoKHpoaTEgPT09IHBhaXJbMF0gJiYgemhpMiA9PT0gcGFpclsxXSkgfHwgKHpoaTEgPT09IHBhaXJbMV0gJiYgemhpMiA9PT0gcGFpclswXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeW+t+i0teS6ulxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5b636LS15Lq6XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5EZUd1aVJlbihzdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp5b636LS15Lq65LiO5aSp5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhbkRlR3VpUmVuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+S5mSc6IFsn5a2QJywgJ+eUsyddLFxuICAgICAgJ+S4mSc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+S4gSc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+aIiic6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+W3sSc6IFsn5a2QJywgJ+eUsyddLFxuICAgICAgJ+W6mic6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+i+myc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+WjrCc6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+eZuCc6IFsn5a2QJywgJ+eUsyddXG4gICAgfTtcblxuICAgIHJldHVybiB0aWFuRGVHdWlSZW5NYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65pyI5b636LS15Lq6XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrmnIjlvrfotLXkurpcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWXVlRGVHdWlSZW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOaciOW+t+i0teS6uuS4juWkqeW5sueahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHl1ZURlR3VpUmVuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5Y2vJ10sXG4gICAgICAn5LmZJzogWyflr4UnXSxcbiAgICAgICfkuJknOiBbJ+W3syddLFxuICAgICAgJ+S4gSc6IFsn5Y2IJ10sXG4gICAgICAn5oiKJzogWyflt7MnXSxcbiAgICAgICflt7EnOiBbJ+WNiCddLFxuICAgICAgJ+W6mic6IFsn55SzJ10sXG4gICAgICAn6L6bJzogWyfphYknXSxcbiAgICAgICflo6wnOiBbJ+S6pSddLFxuICAgICAgJ+eZuCc6IFsn5a2QJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHl1ZURlR3VpUmVuTWFwW3N0ZW1dPy5pbmNsdWRlcyhicmFuY2gpIHx8IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqei1plxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp6LWmXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5TaGUoc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqei1puS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5TaGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gICAgICAn55SyJzogWyfmiIwnXSxcbiAgICAgICfkuZknOiBbJ+mFiSddLFxuICAgICAgJ+S4mSc6IFsn55SzJ10sXG4gICAgICAn5LiBJzogWyfmnKonXSxcbiAgICAgICfmiIonOiBbJ+WNiCddLFxuICAgICAgJ+W3sSc6IFsn5bezJ10sXG4gICAgICAn5bqaJzogWyfovrAnXSxcbiAgICAgICfovpsnOiBbJ+WNryddLFxuICAgICAgJ+WjrCc6IFsn5a+FJ10sXG4gICAgICAn55m4JzogWyfkuJEnXVxuICAgIH07XG5cbiAgICByZXR1cm4gdGlhblNoZU1hcFtzdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnmgalcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeaBqVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuRW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeaBqeS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5Fbk1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgICAgICfnlLInOiBbJ+eUsyddLFxuICAgICAgJ+S5mSc6IFsn6YWJJ10sXG4gICAgICAn5LiZJzogWyfmiIwnXSxcbiAgICAgICfkuIEnOiBbJ+S6pSddLFxuICAgICAgJ+aIiic6IFsn5a2QJ10sXG4gICAgICAn5bexJzogWyfkuJEnXSxcbiAgICAgICfluponOiBbJ+WvhSddLFxuICAgICAgJ+i+myc6IFsn5Y2vJ10sXG4gICAgICAn5aOsJzogWyfovrAnXSxcbiAgICAgICfnmbgnOiBbJ+W3syddXG4gICAgfTtcblxuICAgIHJldHVybiB0aWFuRW5NYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5a6YXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlrphcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkd1YW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeWumOS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5HdWFuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5pyqJ10sXG4gICAgICAn5LmZJzogWyfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+mFiSddLFxuICAgICAgJ+S4gSc6IFsn5oiMJ10sXG4gICAgICAn5oiKJzogWyfkuqUnXSxcbiAgICAgICflt7EnOiBbJ+WtkCddLFxuICAgICAgJ+W6mic6IFsn5LiRJ10sXG4gICAgICAn6L6bJzogWyflr4UnXSxcbiAgICAgICflo6wnOiBbJ+WNryddLFxuICAgICAgJ+eZuCc6IFsn6L6wJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5HdWFuTWFwW3N0ZW1dPy5pbmNsdWRlcyhicmFuY2gpIHx8IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeemj1xuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp56aPXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5GdShzdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp56aP5LiO5aSp5bmy5Zyw5pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhbkZ1TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn6YWJJ10sXG4gICAgICAn5LmZJzogWyfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+acqiddLFxuICAgICAgJ+S4gSc6IFsn5Y2IJ10sXG4gICAgICAn5oiKJzogWyflt7MnXSxcbiAgICAgICflt7EnOiBbJ+i+sCddLFxuICAgICAgJ+W6mic6IFsn5Y2vJ10sXG4gICAgICAn6L6bJzogWyflr4UnXSxcbiAgICAgICflo6wnOiBbJ+S4kSddLFxuICAgICAgJ+eZuCc6IFsn5a2QJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5GdU1hcFtzdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnljqhcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeWOqFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuQ2h1KHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKnljqjkuI7lpKnlubLlnLDmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuQ2h1TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5bezJ10sXG4gICAgICAn5LmZJzogWyfljYgnXSxcbiAgICAgICfkuJknOiBbJ+acqiddLFxuICAgICAgJ+S4gSc6IFsn55SzJ10sXG4gICAgICAn5oiKJzogWyfphYknXSxcbiAgICAgICflt7EnOiBbJ+aIjCddLFxuICAgICAgJ+W6mic6IFsn5LqlJ10sXG4gICAgICAn6L6bJzogWyflrZAnXSxcbiAgICAgICflo6wnOiBbJ+S4kSddLFxuICAgICAgJ+eZuCc6IFsn5a+FJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5DaHVNYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5berXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeW3q1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuV3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflt7MnLCAn5LqlJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnmnIhcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5pyIXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5ZdWUoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfmnKonLCAn5LiRJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnpqaxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHBhcmFtIHllYXJCcmFuY2gg5bm05pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqemprFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuTWEoYnJhbmNoOiBzdHJpbmcsIHllYXJCcmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqemprOS4juW5tOaUr+eahOWvueW6lOWFs+ezu1xuICAgIC8vIOWvheWNiOaIjOW5tOmprOWcqOeUs++8jOeUs+WtkOi+sOW5tOmprOWcqOWvhe+8jOW3s+mFieS4keW5tOmprOWcqOS6pe+8jOS6peWNr+acquW5tOmprOWcqOW3s1xuICAgIGNvbnN0IHRpYW5NYU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a+FJzogJ+eUsycsXG4gICAgICAn5Y2IJzogJ+eUsycsXG4gICAgICAn5oiMJzogJ+eUsycsXG4gICAgICAn55SzJzogJ+WvhScsXG4gICAgICAn5a2QJzogJ+WvhScsXG4gICAgICAn6L6wJzogJ+WvhScsXG4gICAgICAn5bezJzogJ+S6pScsXG4gICAgICAn6YWJJzogJ+S6pScsXG4gICAgICAn5LiRJzogJ+S6pScsXG4gICAgICAn5LqlJzogJ+W3sycsXG4gICAgICAn5Y2vJzogJ+W3sycsXG4gICAgICAn5pyqJzogJ+W3sydcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5NYU1hcFt5ZWFyQnJhbmNoXSA9PT0gYnJhbmNoO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5Zyw5Yq/XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXREaVNoaShkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDpmLPlubLvvJrnlLLkuJnmiIrluprlo6xcbiAgICAvLyDpmLTlubLvvJrkuZnkuIHlt7HovpvnmbhcbiAgICBjb25zdCB5YW5nR2FuID0gJ+eUsuS4meaIiuW6muWjrCc7XG4gICAgY29uc3QgaXNEYXlZYW5nID0geWFuZ0dhbi5pbmNsdWRlcyhkYXlTdGVtKTtcblxuICAgIC8vIOmVv+eUn+WNgeS6jOelnuihqFxuICAgIGNvbnN0IGRpU2hpTWFwOiB7W2tleTogc3RyaW5nXToge1trZXk6IHN0cmluZ106IHN0cmluZ319ID0ge1xuICAgICAgJ+eUsic6IHtcbiAgICAgICAgJ+S6pSc6ICfplb/nlJ8nLCAn5a2QJzogJ+aykOa1tCcsICfkuJEnOiAn5Yag5bimJywgJ+WvhSc6ICfkuLTlrpgnLCAn5Y2vJzogJ+W4neaXuicsXG4gICAgICAgICfovrAnOiAn6KGwJywgJ+W3syc6ICfnl4UnLCAn5Y2IJzogJ+atuycsICfmnKonOiAn5aKTJywgJ+eUsyc6ICfnu50nLFxuICAgICAgICAn6YWJJzogJ+iDjicsICfmiIwnOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfkuJnmiIonOiB7XG4gICAgICAgICflr4UnOiAn6ZW/55SfJywgJ+WNryc6ICfmspDmtbQnLCAn6L6wJzogJ+WGoOW4picsICflt7MnOiAn5Li05a6YJywgJ+WNiCc6ICfluJ3ml7onLFxuICAgICAgICAn5pyqJzogJ+ihsCcsICfnlLMnOiAn55eFJywgJ+mFiSc6ICfmrbsnLCAn5oiMJzogJ+WikycsICfkuqUnOiAn57udJyxcbiAgICAgICAgJ+WtkCc6ICfog44nLCAn5LiRJzogJ+WFuydcbiAgICAgIH0sXG4gICAgICAn5bqaJzoge1xuICAgICAgICAn5bezJzogJ+mVv+eUnycsICfljYgnOiAn5rKQ5rW0JywgJ+acqic6ICflhqDluKYnLCAn55SzJzogJ+S4tOWumCcsICfphYknOiAn5bid5pe6JyxcbiAgICAgICAgJ+aIjCc6ICfoobAnLCAn5LqlJzogJ+eXhScsICflrZAnOiAn5q27JywgJ+S4kSc6ICflopMnLCAn5a+FJzogJ+e7nScsXG4gICAgICAgICflja8nOiAn6IOOJywgJ+i+sCc6ICflhbsnXG4gICAgICB9LFxuICAgICAgJ+WjrCc6IHtcbiAgICAgICAgJ+eUsyc6ICfplb/nlJ8nLCAn6YWJJzogJ+aykOa1tCcsICfmiIwnOiAn5Yag5bimJywgJ+S6pSc6ICfkuLTlrpgnLCAn5a2QJzogJ+W4neaXuicsXG4gICAgICAgICfkuJEnOiAn6KGwJywgJ+WvhSc6ICfnl4UnLCAn5Y2vJzogJ+atuycsICfovrAnOiAn5aKTJywgJ+W3syc6ICfnu50nLFxuICAgICAgICAn5Y2IJzogJ+iDjicsICfmnKonOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfkuZknOiB7XG4gICAgICAgICfljYgnOiAn6ZW/55SfJywgJ+W3syc6ICfmspDmtbQnLCAn6L6wJzogJ+WGoOW4picsICflja8nOiAn5Li05a6YJywgJ+WvhSc6ICfluJ3ml7onLFxuICAgICAgICAn5LiRJzogJ+ihsCcsICflrZAnOiAn55eFJywgJ+S6pSc6ICfmrbsnLCAn5oiMJzogJ+WikycsICfphYknOiAn57udJyxcbiAgICAgICAgJ+eUsyc6ICfog44nLCAn5pyqJzogJ+WFuydcbiAgICAgIH0sXG4gICAgICAn5LiB5bexJzoge1xuICAgICAgICAn6YWJJzogJ+mVv+eUnycsICfnlLMnOiAn5rKQ5rW0JywgJ+acqic6ICflhqDluKYnLCAn5Y2IJzogJ+S4tOWumCcsICflt7MnOiAn5bid5pe6JyxcbiAgICAgICAgJ+i+sCc6ICfoobAnLCAn5Y2vJzogJ+eXhScsICflr4UnOiAn5q27JywgJ+S4kSc6ICflopMnLCAn5a2QJzogJ+e7nScsXG4gICAgICAgICfkuqUnOiAn6IOOJywgJ+aIjCc6ICflhbsnXG4gICAgICB9LFxuICAgICAgJ+i+myc6IHtcbiAgICAgICAgJ+WtkCc6ICfplb/nlJ8nLCAn5LqlJzogJ+aykOa1tCcsICfmiIwnOiAn5Yag5bimJywgJ+mFiSc6ICfkuLTlrpgnLCAn55SzJzogJ+W4neaXuicsXG4gICAgICAgICfmnKonOiAn6KGwJywgJ+WNiCc6ICfnl4UnLCAn5bezJzogJ+atuycsICfovrAnOiAn5aKTJywgJ+WNryc6ICfnu50nLFxuICAgICAgICAn5a+FJzogJ+iDjicsICfkuJEnOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfnmbgnOiB7XG4gICAgICAgICflja8nOiAn6ZW/55SfJywgJ+WvhSc6ICfmspDmtbQnLCAn5LiRJzogJ+WGoOW4picsICflrZAnOiAn5Li05a6YJywgJ+S6pSc6ICfluJ3ml7onLFxuICAgICAgICAn5oiMJzogJ+ihsCcsICfphYknOiAn55eFJywgJ+eUsyc6ICfmrbsnLCAn5pyqJzogJ+WikycsICfljYgnOiAn57udJyxcbiAgICAgICAgJ+W3syc6ICfog44nLCAn6L6wJzogJ+WFuydcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8g5qC55o2u5pel5bmy5p+l5om+5a+55bqU55qE5Zyw5Yq/6KGoXG4gICAgbGV0IGRpU2hpVGFibGU6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGRheVN0ZW0gPT09ICfnlLInKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+eUsiddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+S5mScpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn5LmZJ107XG4gICAgfSBlbHNlIGlmIChkYXlTdGVtID09PSAn5LiZJyB8fCBkYXlTdGVtID09PSAn5oiKJykge1xuICAgICAgZGlTaGlUYWJsZSA9IGRpU2hpTWFwWyfkuJnmiIonXTtcbiAgICB9IGVsc2UgaWYgKGRheVN0ZW0gPT09ICfkuIEnIHx8IGRheVN0ZW0gPT09ICflt7EnKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+S4geW3sSddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+W6micpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn5bqaJ107XG4gICAgfSBlbHNlIGlmIChkYXlTdGVtID09PSAn6L6bJykge1xuICAgICAgZGlTaGlUYWJsZSA9IGRpU2hpTWFwWyfovpsnXTtcbiAgICB9IGVsc2UgaWYgKGRheVN0ZW0gPT09ICflo6wnKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+WjrCddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+eZuCcpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn55m4J107XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5om+5Yiw5a+55bqU55qE5Zyw5Yq/6KGo77yM6L+U5Zue5Zyw5Yq/XG4gICAgaWYgKGRpU2hpVGFibGUgJiYgZGlTaGlUYWJsZVticmFuY2hdKSB7XG4gICAgICByZXR1cm4gZGlTaGlUYWJsZVticmFuY2hdO1xuICAgIH1cblxuICAgIHJldHVybiAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpflhavlrZfmoLzlsYDvvIjmlLnov5vniYjvvIlcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5qC85bGA5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVHZUp1KGVpZ2h0Q2hhcjogRWlnaHRDaGFyKToge1xuICAgIGdlSnU6IHN0cmluZztcbiAgICBkZXRhaWw6IHN0cmluZztcbiAgICBnZUp1U3RyZW5ndGg6IG51bWJlcjtcbiAgICB5b25nU2hlbjogc3RyaW5nO1xuICAgIHlvbmdTaGVuRGV0YWlsOiBzdHJpbmc7XG4gICAgZ2VKdUZhY3RvcnM6IHsgZmFjdG9yOiBzdHJpbmc7IGRlc2NyaXB0aW9uOiBzdHJpbmc7IGNvbnRyaWJ1dGlvbjogbnVtYmVyOyB9W107XG4gIH0ge1xuICAgIC8vIOiOt+WPluagvOWxgOivpue7huS/oeaBr1xuICAgIGNvbnN0IGdlSnVJbmZvID0gdGhpcy5jYWxjdWxhdGVHZUp1SW1wcm92ZWQoZWlnaHRDaGFyKTtcblxuICAgIC8vIOi/lOWbnuWujOaVtOeahOagvOWxgOS/oeaBr1xuICAgIHJldHVybiB7XG4gICAgICBnZUp1OiBnZUp1SW5mby5nZUp1LFxuICAgICAgZGV0YWlsOiBnZUp1SW5mby5kZXRhaWwsXG4gICAgICBnZUp1U3RyZW5ndGg6IGdlSnVJbmZvLmdlSnVTdHJlbmd0aCxcbiAgICAgIHlvbmdTaGVuOiBnZUp1SW5mby55b25nU2hlbixcbiAgICAgIHlvbmdTaGVuRGV0YWlsOiBnZUp1SW5mby55b25nU2hlbkRldGFpbCxcbiAgICAgIGdlSnVGYWN0b3JzOiBnZUp1SW5mby5nZUp1RmFjdG9yc1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICog6K6h566X5YWr5a2X5qC85bGA77yI5pS56L+b54mI77yJXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOagvOWxgOS/oeaBr1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlR2VKdUltcHJvdmVkKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKToge1xuICAgIGdlSnU6IHN0cmluZztcbiAgICBkZXRhaWw6IHN0cmluZztcbiAgICBnZUp1U3RyZW5ndGg6IG51bWJlcjtcbiAgICB5b25nU2hlbjogc3RyaW5nO1xuICAgIHlvbmdTaGVuRGV0YWlsOiBzdHJpbmc7XG4gICAgZ2VKdUZhY3RvcnM6IHsgZmFjdG9yOiBzdHJpbmc7IGRlc2NyaXB0aW9uOiBzdHJpbmc7IGNvbnRyaWJ1dGlvbjogbnVtYmVyOyB9W107XG4gIH0ge1xuICAgIC8vIDEuIOiOt+WPluaXpeS4u+aXuuihsFxuICAgIGNvbnN0IHJpWmh1U3RyZW5ndGhJbmZvID0gdGhpcy5jYWxjdWxhdGVSaVpodVN0cmVuZ3RoKGVpZ2h0Q2hhcik7XG4gICAgY29uc3QgcmlaaHVTdHJlbmd0aCA9IHJpWmh1U3RyZW5ndGhJbmZvLnJlc3VsdDtcblxuICAgIC8vIDIuIOiOt+WPluWbm+afseWkqeW5suWSjOWcsOaUr1xuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g5L2/55So5qC85bGA5Yik5pat5pyN5YqhXG4gICAgLy8g5Yib5bu6QmF6aUluZm/lr7nosaFcbiAgICBjb25zdCBiYXppSW5mbyA9IHtcbiAgICAgIC8vIOWfuuacrOS/oeaBr1xuICAgICAgZGF5U3RlbSxcbiAgICAgIGRheUJyYW5jaCxcbiAgICAgIGRheVd1WGluZzogdGhpcy5nZXRTdGVtV3VYaW5nKGRheVN0ZW0pLFxuICAgICAgcmlaaHVTdHJlbmd0aCxcblxuICAgICAgLy8g5bm05p+x5L+h5oGvXG4gICAgICB5ZWFyU3RlbSxcbiAgICAgIHllYXJCcmFuY2gsXG4gICAgICB5ZWFyV3VYaW5nOiB0aGlzLmdldFN0ZW1XdVhpbmcoeWVhclN0ZW0pLFxuICAgICAgeWVhclNoaVNoZW5HYW46IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSksXG4gICAgICB5ZWFyU2hpU2hlblpoaTogdGhpcy5nZXRIaWRkZW5TaGlTaGVuKGRheVN0ZW0sIHllYXJCcmFuY2gpLFxuICAgICAgeWVhck5hWWluOiB0aGlzLmdldE5hWWluKHllYXJTdGVtICsgeWVhckJyYW5jaCksXG5cbiAgICAgIC8vIOaciOafseS/oeaBr1xuICAgICAgbW9udGhTdGVtLFxuICAgICAgbW9udGhCcmFuY2gsXG4gICAgICBtb250aFd1WGluZzogdGhpcy5nZXRTdGVtV3VYaW5nKG1vbnRoU3RlbSksXG4gICAgICBtb250aFNoaVNoZW5HYW46IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBtb250aFN0ZW0pLFxuICAgICAgbW9udGhTaGlTaGVuWmhpOiB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgbW9udGhCcmFuY2gpLFxuICAgICAgbW9udGhOYVlpbjogdGhpcy5nZXROYVlpbihtb250aFN0ZW0gKyBtb250aEJyYW5jaCksXG5cbiAgICAgIC8vIOaXpeafseS/oeaBr1xuICAgICAgZGF5TmFZaW46IHRoaXMuZ2V0TmFZaW4oZGF5U3RlbSArIGRheUJyYW5jaCksXG4gICAgICBkYXlTaGlTaGVuWmhpOiB0aGlzLmdldEhpZGRlblNoaVNoZW4oZGF5U3RlbSwgZGF5QnJhbmNoKSxcblxuICAgICAgLy8g5pe25p+x5L+h5oGvXG4gICAgICBob3VyU3RlbTogdGltZVN0ZW0sXG4gICAgICBob3VyQnJhbmNoOiB0aW1lQnJhbmNoLFxuICAgICAgaG91cld1WGluZzogdGhpcy5nZXRTdGVtV3VYaW5nKHRpbWVTdGVtKSxcbiAgICAgIHRpbWVTaGlTaGVuR2FuOiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgdGltZVN0ZW0pLFxuICAgICAgaG91clNoaVNoZW5aaGk6IHRoaXMuZ2V0SGlkZGVuU2hpU2hlbihkYXlTdGVtLCB0aW1lQnJhbmNoKSxcbiAgICAgIGhvdXJOYVlpbjogdGhpcy5nZXROYVlpbih0aW1lU3RlbSArIHRpbWVCcmFuY2gpXG4gICAgfTtcblxuICAgIC8vIOS9v+eUqOagvOWxgOWIpOaWreacjeWKoVxuICAgIGNvbnN0IGdlSnVSZXN1bHQgPSBHZUp1SnVkZ2VTZXJ2aWNlLmp1ZGdlR2VKdShiYXppSW5mbyk7XG5cbiAgICAvLyDov5Tlm57moLzlsYDkv6Hmga9cbiAgICByZXR1cm4ge1xuICAgICAgZ2VKdTogZ2VKdVJlc3VsdC5tYWluR2VKdSxcbiAgICAgIGRldGFpbDogZ2VKdVJlc3VsdC5tYWluR2VKdURldGFpbCxcbiAgICAgIGdlSnVTdHJlbmd0aDogZ2VKdVJlc3VsdC5tYWluR2VKdVN0cmVuZ3RoLFxuICAgICAgeW9uZ1NoZW46IGdlSnVSZXN1bHQueW9uZ1NoZW4sXG4gICAgICB5b25nU2hlbkRldGFpbDogZ2VKdVJlc3VsdC55b25nU2hlbkRldGFpbCxcbiAgICAgIGdlSnVGYWN0b3JzOiBnZUp1UmVzdWx0LmZhY3RvcnNcbiAgICB9O1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/lr7nlupTnmoTkupTooYxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRCcmFuY2hXdVhpbmcoYnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+awtCcsXG4gICAgICAn5LiRJzogJ+WcnycsXG4gICAgICAn5a+FJzogJ+acqCcsXG4gICAgICAn5Y2vJzogJ+acqCcsXG4gICAgICAn6L6wJzogJ+WcnycsXG4gICAgICAn5bezJzogJ+eBqycsXG4gICAgICAn5Y2IJzogJ+eBqycsXG4gICAgICAn5pyqJzogJ+WcnycsXG4gICAgICAn55SzJzogJ+mHkScsXG4gICAgICAn6YWJJzogJ+mHkScsXG4gICAgICAn5oiMJzogJ+WcnycsXG4gICAgICAn5LqlJzogJ+awtCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFticmFuY2hdIHx8ICfmnKrnn6UnO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreS6lOihjOaYr+WQpuebuOeUn1xuICAgKiBAcGFyYW0gZnJvbSDmupDkupTooYxcbiAgICogQHBhcmFtIHRvIOebruagh+S6lOihjFxuICAgKiBAcmV0dXJucyDmmK/lkKbnm7jnlJ9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzV3VYaW5nU2hlbmcoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5LqU6KGM55u455Sf77ya5pyo55Sf54Gr77yM54Gr55Sf5Zyf77yM5Zyf55Sf6YeR77yM6YeR55Sf5rC077yM5rC055Sf5pyoXG4gICAgcmV0dXJuIChmcm9tLmluY2x1ZGVzKCfmnKgnKSAmJiB0by5pbmNsdWRlcygn54GrJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfngasnKSAmJiB0by5pbmNsdWRlcygn5ZyfJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCflnJ8nKSAmJiB0by5pbmNsdWRlcygn6YeRJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfph5EnKSAmJiB0by5pbmNsdWRlcygn5rC0JykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfmsLQnKSAmJiB0by5pbmNsdWRlcygn5pyoJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreS6lOihjOaYr+WQpuebuOWFi1xuICAgKiBAcGFyYW0gZnJvbSDmupDkupTooYxcbiAgICogQHBhcmFtIHRvIOebruagh+S6lOihjFxuICAgKiBAcmV0dXJucyDmmK/lkKbnm7jlhYtcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzV3VYaW5nS2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5LqU6KGM55u45YWL77ya5pyo5YWL5Zyf77yM5Zyf5YWL5rC077yM5rC05YWL54Gr77yM54Gr5YWL6YeR77yM6YeR5YWL5pyoXG4gICAgcmV0dXJuIChmcm9tLmluY2x1ZGVzKCfmnKgnKSAmJiB0by5pbmNsdWRlcygn5ZyfJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCflnJ8nKSAmJiB0by5pbmNsdWRlcygn5rC0JykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfmsLQnKSAmJiB0by5pbmNsdWRlcygn54GrJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfngasnKSAmJiB0by5pbmNsdWRlcygn6YeRJykpIHx8XG4gICAgICAgICAgIChmcm9tLmluY2x1ZGVzKCfph5EnKSAmJiB0by5pbmNsdWRlcygn5pyoJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+i1t+i/kOaXtumXtFxuICAgKiBAcGFyYW0gc29sYXIg6Ziz5Y6G5a+56LGhXG4gICAqIEBwYXJhbSBnZW5kZXIg5oCn5Yir77yIMS3nlLfvvIwwLeWls++8iVxuICAgKiBAcmV0dXJucyDotbfov5Dkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVFpWXVuKHNvbGFyOiBTb2xhciwgZ2VuZGVyOiBzdHJpbmcpOiB7IGRhdGU6IHN0cmluZzsgYWdlOiBudW1iZXIgfSB7XG4gICAgLy8g6L+Z6YeM566A5YyW5aSE55CG77yM5a6e6ZmF5bqU6K+l5qC55o2u5YWr5a2X5ZG955CG6KeE5YiZ6K6h566XXG5cbiAgICAvLyDnroDljZXnpLrkvovvvJrnlLflkb0z5bKB6LW36L+Q77yM5aWz5ZG9NOWygei1t+i/kFxuICAgIGNvbnN0IHFpWXVuQWdlID0gZ2VuZGVyID09PSAnMScgPyAzIDogNDtcblxuICAgIC8vIOiuoeeul+i1t+i/kOW5tOS7vVxuICAgIGNvbnN0IGJpcnRoWWVhciA9IHNvbGFyLmdldFllYXIoKTtcbiAgICBjb25zdCBxaVl1blllYXIgPSBiaXJ0aFllYXIgKyBxaVl1bkFnZTtcblxuICAgIC8vIOagvOW8j+WMlui1t+i/kOaXpeacn1xuICAgIGNvbnN0IHFpWXVuRGF0ZSA9IGAke3FpWXVuWWVhcn0tJHtzb2xhci5nZXRNb250aCgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHtzb2xhci5nZXREYXkoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YDtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXRlOiBxaVl1bkRhdGUsXG4gICAgICBhZ2U6IHFpWXVuQWdlXG4gICAgfTtcbiAgfVxuXG5cblxuXG5cblxuXG4gIC8qKlxuICAgKiDnlJ/miJDkuqTkupLlvI/lhavlrZflkb3nm5jnmoRIVE1MXG4gICAqIEBwYXJhbSBiYXppSW5mbyDlhavlrZfkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIGlkIOWRveebmElEXG4gICAqIEByZXR1cm5zIEhUTUzlrZfnrKbkuLJcbiAgICovXG4gIHN0YXRpYyBnZW5lcmF0ZUJhemlIVE1MKGJhemlJbmZvOiBCYXppSW5mbywgaWQ6IHN0cmluZyA9ICdiYXppLXZpZXctJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA5KSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGA8ZGl2IGlkPVwiJHtpZH1cIiBjbGFzcz1cImJhemktdmlldy1jb250YWluZXJcIj5cbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1oZWFkZXJcIj5cbiAgICA8aDMgY2xhc3M9XCJiYXppLXZpZXctdGl0bGVcIj7lhavlrZflkb3nm5g8L2gzPlxuICAgIDxidXR0b24gY2xhc3M9XCJiYXppLXZpZXctc2V0dGluZ3MtYnV0dG9uXCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIiBhcmlhLWxhYmVsPVwi6K6+572uXCI+XG4gICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCI+PC9jaXJjbGU+PHBhdGggZD1cIk0xOS40IDE1YTEuNjUgMS42NSAwIDAgMCAuMzMgMS44MmwuMDYuMDZhMiAyIDAgMCAxIDAgMi44MyAyIDIgMCAwIDEtMi44MyAwbC0uMDYtLjA2YTEuNjUgMS42NSAwIDAgMC0xLjgyLS4zMyAxLjY1IDEuNjUgMCAwIDAtMSAxLjUxVjIxYTIgMiAwIDAgMS0yIDIgMiAyIDAgMCAxLTItMnYtLjA5QTEuNjUgMS42NSAwIDAgMCA5IDE5LjRhMS42NSAxLjY1IDAgMCAwLTEuODIuMzNsLS4wNi4wNmEyIDIgMCAwIDEtMi44MyAwIDIgMiAwIDAgMSAwLTIuODNsLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAgLjMzLTEuODIgMS42NSAxLjY1IDAgMCAwLTEuNTEtMUgzYTIgMiAwIDAgMS0yLTIgMiAyIDAgMCAxIDItMmguMDlBMS42NSAxLjY1IDAgMCAwIDQuNiA5YTEuNjUgMS42NSAwIDAgMC0uMzMtMS44MmwtLjA2LS4wNmEyIDIgMCAwIDEgMC0yLjgzIDIgMiAwIDAgMSAyLjgzIDBsLjA2LjA2YTEuNjUgMS42NSAwIDAgMCAxLjgyLjMzSDlhMS42NSAxLjY1IDAgMCAwIDEtMS41MVYzYTIgMiAwIDAgMSAyLTIgMiAyIDAgMCAxIDIgMnYuMDlhMS42NSAxLjY1IDAgMCAwIDEgMS41MSAxLjY1IDEuNjUgMCAwIDAgMS44Mi0uMzNsLjA2LS4wNmEyIDIgMCAwIDEgMi44MyAwIDIgMiAwIDAgMSAwIDIuODNsLS4wNi4wNmExLjY1IDEuNjUgMCAwIDAtLjMzIDEuODJWOWExLjY1IDEuNjUgMCAwIDAgMS41MSAxSDIxYTIgMiAwIDAgMSAyIDIgMiAyIDAgMCAxLTIgMmgtLjA5YTEuNjUgMS42NSAwIDAgMC0xLjUxIDF6XCI+PC9wYXRoPjwvc3ZnPlxuICAgIDwvYnV0dG9uPlxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb24gYmF6aS12aWV3LWJhc2ljLWluZm9cIj5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWNvbFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWl0ZW1cIj7lhazljobvvJoke2JhemlJbmZvLnNvbGFyRGF0ZSB8fCAnLS0tLSd9ICR7YmF6aUluZm8uc29sYXJUaW1lIHx8ICctLTotLSd9PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy1jb2xcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+5Yac5Y6G77yaJHtiYXppSW5mby5sdW5hckRhdGUgfHwgJy0tLS0nfTwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb25cIj5cbiAgICA8dGFibGUgY2xhc3M9XCJiYXppLXZpZXctdGFibGVcIj5cbiAgICAgIDx0aGVhZD5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7lubTmn7E8L3RoPlxuICAgICAgICAgIDx0aD7mnIjmn7E8L3RoPlxuICAgICAgICAgIDx0aD7ml6Xmn7E8L3RoPlxuICAgICAgICAgIDx0aD7ml7bmn7E8L3RoPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90aGVhZD5cbiAgICAgIDx0Ym9keT5cbiAgICAgICAgPHRyIGNsYXNzPVwiYmF6aS1zdGVtLXJvd1wiPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8ueWVhcld1WGluZyB8fCAnJyl9XCI+JHtiYXppSW5mby55ZWFyU3RlbSB8fCAnJ308L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8ubW9udGhXdVhpbmcgfHwgJycpfVwiPiR7YmF6aUluZm8ubW9udGhTdGVtIHx8ICcnfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPVwid3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyhiYXppSW5mby5kYXlXdVhpbmcgfHwgJycpfVwiPiR7YmF6aUluZm8uZGF5U3RlbSB8fCAnJ308L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8uaG91cld1WGluZyB8fCAnJyl9XCI+JHtiYXppSW5mby5ob3VyU3RlbSB8fCAnJ308L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHIgY2xhc3M9XCJiYXppLWJyYW5jaC1yb3dcIj5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby55ZWFyQnJhbmNofTwvdGQ+XG4gICAgICAgICAgPHRkPiR7YmF6aUluZm8ubW9udGhCcmFuY2h9PC90ZD5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby5kYXlCcmFuY2h9PC90ZD5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby5ob3VyQnJhbmNofTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0ciBjbGFzcz1cImJhemktaGlkZWdhbi1yb3dcIj5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8ueWVhckhpZGVHYW4gfHwgJ+aXoCd9PC9zbWFsbD48L3RkPlxuICAgICAgICAgIDx0ZD48c21hbGw+JHtiYXppSW5mby5tb250aEhpZGVHYW4gfHwgJ+aXoCd9PC9zbWFsbD48L3RkPlxuICAgICAgICAgIDx0ZD48c21hbGw+JHtiYXppSW5mby5kYXlIaWRlR2FuIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8uaG91ckhpZGVHYW4gfHwgJ+aXoCd9PC9zbWFsbD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHIgY2xhc3M9XCJiYXppLXNoaXNoZW4tcm93XCI+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLnllYXJTaGlTaGVuR2FuIHx8ICcnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8ubW9udGhTaGlTaGVuR2FuIHx8ICcnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPuaXpeS4uzwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8udGltZVNoaVNoZW5HYW4gfHwgJyd9PC9zbWFsbD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHIgY2xhc3M9XCJiYXppLW5heWluLXJvd1wiPlxuICAgICAgICAgIDx0ZD4ke2JhemlJbmZvLnllYXJOYVlpbiB8fCAn5pyq55+lJ308L3RkPlxuICAgICAgICAgIDx0ZD4ke2JhemlJbmZvLm1vbnRoTmFZaW4gfHwgJ+acquefpSd9PC90ZD5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby5kYXlOYVlpbiB8fCAn5pyq55+lJ308L3RkPlxuICAgICAgICAgIDx0ZD4ke2JhemlJbmZvLmhvdXJOYVlpbiB8fCAn5pyq55+lJ308L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHIgY2xhc3M9XCJiYXppLXh1bmtvbmctcm93XCI+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLnllYXJYdW5Lb25nIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8ubW9udGhYdW5Lb25nIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8uZGF5WHVuS29uZyB8fCAn5pegJ308L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLnRpbWVYdW5Lb25nIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGJvZHk+XG4gICAgPC90YWJsZT5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uXCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+5LqU6KGM5YiG5p6QPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy1saXN0XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyhiYXppSW5mby55ZWFyV3VYaW5nIHx8ICcnKX1cIj4ke2JhemlJbmZvLnllYXJTdGVtIHx8ICcnfSgke2JhemlJbmZvLnllYXJXdVhpbmcgfHwgJ+acquefpSd9KTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwid3V4aW5nLXRhZyB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKGJhemlJbmZvLm1vbnRoV3VYaW5nIHx8ICcnKX1cIj4ke2JhemlJbmZvLm1vbnRoU3RlbSB8fCAnJ30oJHtiYXppSW5mby5tb250aFd1WGluZyB8fCAn5pyq55+lJ30pPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8uZGF5V3VYaW5nIHx8ICcnKX1cIj4ke2JhemlJbmZvLmRheVN0ZW0gfHwgJyd9KCR7YmF6aUluZm8uZGF5V3VYaW5nIHx8ICfmnKrnn6UnfSk8L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyhiYXppSW5mby5ob3VyV3VYaW5nIHx8ICcnKX1cIj4ke2JhemlJbmZvLmhvdXJTdGVtIHx8ICcnfSgke2JhemlJbmZvLmhvdXJXdVhpbmcgfHwgJ+acquefpSd9KTwvc3Bhbj5cbiAgICA8L2Rpdj5cblxuICAgICR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGggPyBgXG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy13dXhpbmctc3RyZW5ndGhcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctd3V4aW5nLWhlYWRlclwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy10aXRsZVwiPuS6lOihjOW8uuW6pjo8L3NwYW4+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctd3V4aW5nLWJhcnNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy1qaW4gd3V4aW5nLWNsaWNrYWJsZVwiIGRhdGEtd3V4aW5nPVwi6YeRXCIgZGF0YS12YWx1ZT1cIiR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGguamluLnRvRml4ZWQoMSl9XCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj7ph5E6ICR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGguamluLnRvRml4ZWQoMSl9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXItaW5uZXIgd3V4aW5nLWppblwiIHN0eWxlPVwid2lkdGg6ICR7TWF0aC5taW4oYmF6aUluZm8ud3VYaW5nU3RyZW5ndGguamluICogMTAsIDEwMCl9JVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3dXhpbmctYmFyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLW11IHd1eGluZy1jbGlja2FibGVcIiBkYXRhLXd1eGluZz1cIuacqFwiIGRhdGEtdmFsdWU9XCIke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLm11LnRvRml4ZWQoMSl9XCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj7mnKg6ICR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGgubXUudG9GaXhlZCgxKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhci1pbm5lciB3dXhpbmctbXVcIiBzdHlsZT1cIndpZHRoOiAke01hdGgubWluKGJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLm11ICogMTAsIDEwMCl9JVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3dXhpbmctYmFyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLXNodWkgd3V4aW5nLWNsaWNrYWJsZVwiIGRhdGEtd3V4aW5nPVwi5rC0XCIgZGF0YS12YWx1ZT1cIiR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGguc2h1aS50b0ZpeGVkKDEpfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+5rC0OiAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnNodWkudG9GaXhlZCgxKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhci1pbm5lciB3dXhpbmctc2h1aVwiIHN0eWxlPVwid2lkdGg6ICR7TWF0aC5taW4oYmF6aUluZm8ud3VYaW5nU3RyZW5ndGguc2h1aSAqIDEwLCAxMDApfSVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy1odW8gd3V4aW5nLWNsaWNrYWJsZVwiIGRhdGEtd3V4aW5nPVwi54GrXCIgZGF0YS12YWx1ZT1cIiR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGguaHVvLnRvRml4ZWQoMSl9XCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj7ngas6ICR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGguaHVvLnRvRml4ZWQoMSl9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXItaW5uZXIgd3V4aW5nLWh1b1wiIHN0eWxlPVwid2lkdGg6ICR7TWF0aC5taW4oYmF6aUluZm8ud3VYaW5nU3RyZW5ndGguaHVvICogMTAsIDEwMCl9JVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3dXhpbmctYmFyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLXR1IHd1eGluZy1jbGlja2FibGVcIiBkYXRhLXd1eGluZz1cIuWcn1wiIGRhdGEtdmFsdWU9XCIke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnR1LnRvRml4ZWQoMSl9XCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj7lnJ86ICR7YmF6aUluZm8ud3VYaW5nU3RyZW5ndGgudHUudG9GaXhlZCgxKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhci1pbm5lciB3dXhpbmctdHVcIiBzdHlsZT1cIndpZHRoOiAke01hdGgubWluKGJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnR1ICogMTAsIDEwMCl9JVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiYXppLXZpZXctd3V4aW5nLXRvZ2dsZVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+5p+l55yL6K+m5oOFIOKWvDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy1kZXRhaWxzXCIgaWQ9XCJ3dXhpbmctZGV0YWlscy0ke2lkfVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy10YWJsZVwiPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0aCBjb2xzcGFuPVwiMlwiPuS6lOihjOW8uuW6puiuoeeul+ivtOaYjjwvdGg+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQgY29sc3Bhbj1cIjJcIj7kupTooYzlvLrluqbmmK/moLnmja7ku6XkuIvlm6DntKDnu7zlkIjorqHnrpfnmoTvvJo8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPuWkqeW5suS6lOihjDwvdGQ+XG4gICAgICAgICAgICA8dGQ+5bm05bmyKDEuMCnjgIHmnIjlubIoMi4wKeOAgeaXpeW5sigzLjAp44CB5pe25bmyKDEuMCk8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPuWcsOaUr+iXj+W5sjwvdGQ+XG4gICAgICAgICAgICA8dGQ+5bm05pSvKDAuNynjgIHmnIjmlK8oMS41KeOAgeaXpeaUrygyLjAp44CB5pe25pSvKDAuNyk8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPue6s+mfs+S6lOihjDwvdGQ+XG4gICAgICAgICAgICA8dGQ+5bm05p+xKDAuNSnjgIHmnIjmn7EoMS4wKeOAgeaXpeafsSgxLjUp44CB5pe25p+xKDAuNSk8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPuWto+iKguiwg+aVtDwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIOaYpeWto++8muacqOaXuigrMS4wKeOAgeeBq+ebuCgrMC41KTxicj5cbiAgICAgICAgICAgICAg5aSP5a2j77ya54Gr5pe6KCsxLjAp44CB5Zyf55u4KCswLjUpPGJyPlxuICAgICAgICAgICAgICDnp4vlraPvvJrph5Hml7ooKzEuMCnjgIHmsLTnm7goKzAuNSk8YnI+XG4gICAgICAgICAgICAgIOWGrOWto++8muawtOaXuigrMS4wKeOAgeacqOebuCgrMC41KVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD7nu4TlkIjosIPmlbQ8L3RkPlxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICDlpKnlubLkupTlkIjvvJrnlLLlt7HlkIjlnJ/jgIHkuZnluprlkIjph5HjgIHkuJnovpvlkIjmsLTjgIHkuIHlo6zlkIjmnKjjgIHmiIrnmbjlkIjngasoKzAuNSk8YnI+XG4gICAgICAgICAgICAgIOWcsOaUr+S4ieWQiO+8muWvheWNiOaIjOWQiOeBq+OAgeS6peWNr+acquWQiOacqOOAgeeUs+WtkOi+sOWQiOawtOOAgeW3s+mFieS4keWQiOmHkSgrMS4wKVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYCA6ICcnfVxuXG4gICAgJHtiYXppSW5mby5yaVpodVN0cmVuZ3RoID8gYFxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctcml6aHUtc3RyZW5ndGhcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctcml6aHUtaGVhZGVyXCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiYXppLXZpZXctcml6aHUtdGl0bGVcIj7ml6XkuLvml7roobA6IDxzcGFuIGNsYXNzPVwic2hlbnNoYS10YWcgcml6aHUtY2xpY2thYmxlXCIgZGF0YS1yaXpodT1cIiR7YmF6aUluZm8ucmlaaHVTdHJlbmd0aH1cIiBkYXRhLXd1eGluZz1cIiR7YmF6aUluZm8uZGF5V3VYaW5nfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+JHtiYXppSW5mby5yaVpodVN0cmVuZ3RofTwvc3Bhbj48L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgIDogJyd9XG4gIDwvZGl2PlxuXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvblwiPlxuICAgIDxoNCBjbGFzcz1cImJhemktdmlldy1zdWJ0aXRsZVwiPueJueauiuS/oeaBrzwvaDQ+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWxpc3RcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+6IOO5YWD77yaJHtiYXppSW5mby50YWlZdWFuIHx8ICfmnKrnn6UnfSR7YmF6aUluZm8udGFpWXVhbk5hWWluID8gYO+8iCR7YmF6aUluZm8udGFpWXVhbk5hWWlufe+8iWAgOiAnJ308L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+5ZG95a6r77yaJHtiYXppSW5mby5taW5nR29uZyB8fCAn5pyq55+lJ30ke2JhemlJbmZvLm1pbmdHb25nTmFZaW4gPyBg77yIJHtiYXppSW5mby5taW5nR29uZ05hWWlufe+8iWAgOiAnJ308L2Rpdj5cbiAgICAgICR7YmF6aUluZm8uc2hlbkdvbmcgPyBgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWl0ZW1cIj7ouqvlrqvvvJoke2JhemlJbmZvLnNoZW5Hb25nfTwvZGl2PmAgOiAnJ31cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgJHtiYXppSW5mby5xaVl1blllYXIgfHwgYmF6aUluZm8ucWlZdW5EYXRlID8gYFxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb25cIj5cbiAgICA8aDQgY2xhc3M9XCJiYXppLXZpZXctc3VidGl0bGVcIj7otbfov5Dkv6Hmga88L2g0PlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1saXN0XCI+XG4gICAgICAke2JhemlJbmZvLnFpWXVuWWVhciA/IGA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8taXRlbVwiPui1t+i/kOaXtumXtO+8muWHuueUnyR7YmF6aUluZm8ucWlZdW5ZZWFyfeW5tCR7YmF6aUluZm8ucWlZdW5Nb250aCB8fCAwfeS4quaciCR7YmF6aUluZm8ucWlZdW5EYXkgfHwgMH3lpKkke2JhemlJbmZvLnFpWXVuSG91ciAmJiBiYXppSW5mby5xaVl1bkhvdXIgPiAwID8gYmF6aUluZm8ucWlZdW5Ib3VyICsgJ+Wwj+aXticgOiAnJ33lkI48L2Rpdj5gIDogJyd9XG4gICAgICAke2JhemlJbmZvLnFpWXVuRGF0ZSA/IGA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8taXRlbVwiPui1t+i/kOaXpeacn++8miR7YmF6aUluZm8ucWlZdW5EYXRlfTwvZGl2PmAgOiAnJ31cbiAgICAgICR7YmF6aUluZm8ucWlZdW5BZ2UgPyBgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWl0ZW1cIj7otbfov5DlubTpvoTvvJoke2JhemlJbmZvLnFpWXVuQWdlfeWygTwvZGl2PmAgOiAnJ31cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIGAgOiAnJ31cblxuICAke2JhemlJbmZvLmRhWXVuICYmIGJhemlJbmZvLmRhWXVuLmxlbmd0aCA+IDAgPyBgXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvblwiPlxuICAgIDxoNCBjbGFzcz1cImJhemktdmlldy1zdWJ0aXRsZVwiPuWkp+i/kOS/oeaBrzwvaDQ+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy10YWJsZS1jb250YWluZXJcIj5cbiAgICAgIDx0YWJsZSBjbGFzcz1cImJhemktdmlldy10YWJsZSBiYXppLXZpZXctZGF5dW4tdGFibGVcIj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7lpKfov5A8L3RoPlxuICAgICAgICAgICR7QXJyYXkuaXNBcnJheShiYXppSW5mby5kYVl1bikgPyBiYXppSW5mby5kYVl1bi5zbGljZSgwLCAxMCkubWFwKGR5ID0+IGA8dGQ+JHtkeS5zdGFydFllYXJ9PC90ZD5gKS5qb2luKCcnKSA6ICcnfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5tOm+hDwvdGg+XG4gICAgICAgICAgJHtBcnJheS5pc0FycmF5KGJhemlJbmZvLmRhWXVuKSA/IGJhemlJbmZvLmRhWXVuLnNsaWNlKDAsIDEwKS5tYXAoZHkgPT4gYDx0ZD4ke2R5LnN0YXJ0QWdlfTwvdGQ+YCkuam9pbignJykgOiAnJ31cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7lubLmlK88L3RoPlxuICAgICAgICAgICR7QXJyYXkuaXNBcnJheShiYXppSW5mby5kYVl1bikgPyBiYXppSW5mby5kYVl1bi5zbGljZSgwLCAxMCkubWFwKChkeSwgaW5kZXgpID0+IGBcbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImJhemktZGF5dW4tY2VsbFwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiPiR7ZHkuZ2FuWmhpfTwvdGQ+XG4gICAgICAgICAgYCkuam9pbignJykgOiAnJ31cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7npZ7nhZ48L3RoPlxuICAgICAgICAgICR7QXJyYXkuaXNBcnJheShiYXppSW5mby5kYVl1bikgPyBiYXppSW5mby5kYVl1bi5zbGljZSgwLCAxMCkubWFwKChkeSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkp+i/kOaVsOaNrjog57Si5byVJHtpbmRleH0sIOelnueFnjpgLCBkeS5zaGVuU2hhKTtcblxuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgJHtkeS5zaGVuU2hhICYmIGR5LnNoZW5TaGEubGVuZ3RoID4gMCA/IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmF6aS1zaGVuc2hhLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICR7ZHkuc2hlblNoYS5tYXAoc2hlblNoYSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5aSn6L+Q56We54WeSFRNTOeUn+aIkDogJHtzaGVuU2hhfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBCYXppU2VydmljZS5nZXRTaGVuU2hhVHlwZShzaGVuU2hhKSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAn5ZCJ56WeJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtZ29vZCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WHtuelnicpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWJhZCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ+WQieWHtuelnicpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLW1peGVkJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiYmF6aS1zaGVuc2hhICR7Y3NzQ2xhc3N9XCIgZGF0YS1zaGVuc2hhPVwiJHtzaGVuU2hhfVwiIHN0eWxlPVwiZGlzcGxheTppbmxpbmUtYmxvY2s7IHBhZGRpbmc6MnB4IDRweDsgbWFyZ2luOjJweDsgYm9yZGVyLXJhZGl1czozcHg7IGZvbnQtc2l6ZTowLjhlbTsgY3Vyc29yOnBvaW50ZXI7XCI+JHtzaGVuU2hhfTwvc3Bhbj5gO1xuICAgICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIGAgOiAn5peg56We54WeJ31cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICBgO1xuICAgICAgICAgIH0pLmpvaW4oJycpIDogJyd9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYCA6ICcnfVxuXG4gICR7YmF6aUluZm8ubGl1TmlhbiAmJiBiYXppSW5mby5saXVOaWFuLmxlbmd0aCA+IDAgPyBgXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvbiBiYXppLWxpdW5pYW4tc2VjdGlvblwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+5rWB5bm05L+h5oGvPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlLWNvbnRhaW5lclwiPlxuICAgICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXVuaWFuLXRhYmxlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5rWB5bm0PC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLmxpdU5pYW4uc2xpY2UoMCwgMTApLm1hcChsbiA9PiBgPHRkPiR7bG4ueWVhcn08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5tOm+hDwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5saXVOaWFuLnNsaWNlKDAsIDEwKS5tYXAobG4gPT4gYDx0ZD4ke2xuLmFnZX08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5suaUrzwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5saXVOaWFuLnNsaWNlKDAsIDEwKS5tYXAobG4gPT4gYFxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiYmF6aS1saXVuaWFuLWNlbGxcIiBkYXRhLXllYXI9XCIke2xuLnllYXJ9XCI+JHtsbi5nYW5aaGl9PC90ZD5cbiAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7npZ7nhZ48L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ubGl1Tmlhbi5zbGljZSgwLCAxMCkubWFwKGxuID0+IHtcbiAgICAgICAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOa1geW5tOaVsOaNrjogJHtsbi55ZWFyfSwg56We54WeOmAsIGxuLnNoZW5TaGEpO1xuXG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAke2xuLnNoZW5TaGEgJiYgbG4uc2hlblNoYS5sZW5ndGggPiAwID8gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXNoZW5zaGEtbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgJHtsbi5zaGVuU2hhLm1hcChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmtYHlubTnpZ7nhZ5IVE1M55Sf5oiQOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IEJhemlTZXJ2aWNlLmdldFNoZW5TaGFUeXBlKHNoZW5TaGEpIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31cIiBkYXRhLXNoZW5zaGE9XCIke3NoZW5TaGF9XCIgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazsgcGFkZGluZzoycHggNHB4OyBtYXJnaW46MnB4OyBib3JkZXItcmFkaXVzOjNweDsgZm9udC1zaXplOjAuOGVtOyBjdXJzb3I6cG9pbnRlcjtcIj4ke3NoZW5TaGF9PC9zcGFuPmA7XG4gICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCA6ICfml6DnpZ7nhZ4nfVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIGA7XG4gICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYCA6ICcnfVxuXG4gICR7YmF6aUluZm8ueGlhb1l1biAmJiBiYXppSW5mby54aWFvWXVuLmxlbmd0aCA+IDAgPyBgXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvbiBiYXppLXhpYW95dW4tc2VjdGlvblwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+5bCP6L+Q5L+h5oGvPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlLWNvbnRhaW5lclwiPlxuICAgICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy14aWFveXVuLXRhYmxlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5bCP6L+QPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLnhpYW9ZdW4uc2xpY2UoMCwgMTApLm1hcCh4eSA9PiBgPHRkPiR7eHkueWVhcn08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5tOm+hDwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby54aWFvWXVuLnNsaWNlKDAsIDEwKS5tYXAoeHkgPT4gYDx0ZD4ke3h5LmFnZX08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5suaUrzwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby54aWFvWXVuLnNsaWNlKDAsIDEwKS5tYXAoeHkgPT4gYFxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiYmF6aS14aWFveXVuLWNlbGxcIiBkYXRhLXllYXI9XCIke3h5LnllYXJ9XCI+JHt4eS5nYW5aaGl9PC90ZD5cbiAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7npZ7nhZ48L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ueGlhb1l1bi5zbGljZSgwLCAxMCkubWFwKHh5ID0+IHtcbiAgICAgICAgICAgIC8vIOiwg+ivleS/oeaBr1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWwj+i/kOaVsOaNrjogJHt4eS55ZWFyfSwg56We54WeOmAsIHh5LnNoZW5TaGEpO1xuXG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAke3h5LnNoZW5TaGEgJiYgeHkuc2hlblNoYS5sZW5ndGggPiAwID8gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXNoZW5zaGEtbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgJHt4eS5zaGVuU2hhLm1hcChzaGVuU2hhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g6LCD6K+V5L+h5oGvXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlsI/ov5DnpZ7nhZ5IVE1M55Sf5oiQOiAke3NoZW5TaGF9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IEJhemlTZXJ2aWNlLmdldFNoZW5TaGFUeXBlKHNoZW5TaGEpIHx8ICfmnKrnn6UnO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICflkInnpZ4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1nb29kJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5Ye256WeJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtYmFkJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAn5ZCJ5Ye256WeJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzID0gJ3NoZW5zaGEtbWl4ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJiYXppLXNoZW5zaGEgJHtjc3NDbGFzc31cIiBkYXRhLXNoZW5zaGE9XCIke3NoZW5TaGF9XCIgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jazsgcGFkZGluZzoycHggNHB4OyBtYXJnaW46MnB4OyBib3JkZXItcmFkaXVzOjNweDsgZm9udC1zaXplOjAuOGVtOyBjdXJzb3I6cG9pbnRlcjtcIj4ke3NoZW5TaGF9PC9zcGFuPmA7XG4gICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCA6ICfml6DnpZ7nhZ4nfVxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIGA7XG4gICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYCA6ICcnfVxuXG4gICR7YmF6aUluZm8ubGl1WXVlICYmIGJhemlJbmZvLmxpdVl1ZS5sZW5ndGggPiAwID8gYFxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb24gYmF6aS1saXV5dWUtc2VjdGlvblwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+5rWB5pyI5L+h5oGvPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlLWNvbnRhaW5lclwiPlxuICAgICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXV5dWUtdGFibGVcIj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7mtYHmnIg8L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ubGl1WXVlLm1hcChseSA9PiBgPHRkPiR7bHkubW9udGh9PC90ZD5gKS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7lubLmlK88L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ubGl1WXVlLm1hcChseSA9PiBgXG4gICAgICAgICAgICA8dGQgY2xhc3M9XCJiYXppLWxpdXl1ZS1jZWxsXCIgZGF0YS1tb250aD1cIiR7bHkubW9udGh9XCI+JHtseS5nYW5aaGl9PC90ZD5cbiAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7npZ7nhZ48L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ubGl1WXVlLm1hcChseSA9PiB7XG4gICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmtYHmnIjmlbDmja46ICR7bHkubW9udGh9LCDnpZ7nhZ46YCwgbHkuc2hlblNoYSk7XG5cbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICR7bHkuc2hlblNoYSAmJiBseS5zaGVuU2hhLmxlbmd0aCA+IDAgPyBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJhemktc2hlbnNoYS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAke2x5LnNoZW5TaGEubWFwKHNoZW5TaGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyDosIPor5Xkv6Hmga9cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOa1geaciOelnueFnkhUTUznlJ/miJA6ICR7c2hlblNoYX1gKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gQmF6aVNlcnZpY2UuZ2V0U2hlblNoYVR5cGUoc2hlblNoYSkgfHwgJ+acquefpSc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ+WQieelnicpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzcyA9ICdzaGVuc2hhLWdvb2QnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflh7bnpZ4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1iYWQnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICflkInlh7bnpZ4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3MgPSAnc2hlbnNoYS1taXhlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cImJhemktc2hlbnNoYSAke2Nzc0NsYXNzfVwiIGRhdGEtc2hlbnNoYT1cIiR7c2hlblNoYX1cIiBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrOyBwYWRkaW5nOjJweCA0cHg7IG1hcmdpbjoycHg7IGJvcmRlci1yYWRpdXM6M3B4OyBmb250LXNpemU6MC44ZW07IGN1cnNvcjpwb2ludGVyO1wiPiR7c2hlblNoYX08L3NwYW4+YDtcbiAgICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgIDogJ+aXoOelnueFnid9XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgYDtcbiAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICBgIDogJyd9XG5cbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctZGF0YVwiXG4gICAgICBkYXRhLXllYXI9XCIke2JhemlJbmZvLnNvbGFyRGF0ZSAmJiBiYXppSW5mby5zb2xhckRhdGUuaW5jbHVkZXMoJy0nKSA/IGJhemlJbmZvLnNvbGFyRGF0ZS5zcGxpdCgnLScpWzBdIDogJzIwMjMnfVwiXG4gICAgICBkYXRhLW1vbnRoPVwiJHtiYXppSW5mby5zb2xhckRhdGUgJiYgYmF6aUluZm8uc29sYXJEYXRlLmluY2x1ZGVzKCctJykgPyBiYXppSW5mby5zb2xhckRhdGUuc3BsaXQoJy0nKVsxXSA6ICcxJ31cIlxuICAgICAgZGF0YS1kYXk9XCIke2JhemlJbmZvLnNvbGFyRGF0ZSAmJiBiYXppSW5mby5zb2xhckRhdGUuaW5jbHVkZXMoJy0nKSA/IGJhemlJbmZvLnNvbGFyRGF0ZS5zcGxpdCgnLScpWzJdIDogJzEnfVwiXG4gICAgICBkYXRhLWhvdXI9XCIke2JhemlJbmZvLnNvbGFyVGltZSAmJiBiYXppSW5mby5zb2xhclRpbWUuaW5jbHVkZXMoJzonKSA/IGJhemlJbmZvLnNvbGFyVGltZS5zcGxpdCgnOicpWzBdIDogJzAnfVwiXG4gICAgICBkYXRhLWFsbC1kYXl1bj0nJHtKU09OLnN0cmluZ2lmeShiYXppSW5mby5kYVl1biB8fCBbXSl9J1xuICAgICAgZGF0YS1hbGwtbGl1bmlhbj0nJHtKU09OLnN0cmluZ2lmeShiYXppSW5mby5saXVOaWFuIHx8IFtdKX0nXG4gICAgICBkYXRhLWFsbC14aWFveXVuPScke0pTT04uc3RyaW5naWZ5KGJhemlJbmZvLnhpYW9ZdW4gfHwgW10pfSdcbiAgICAgIGRhdGEtYWxsLWxpdXl1ZT0nJHtKU09OLnN0cmluZ2lmeShiYXppSW5mby5saXVZdWUgfHwgW10pfSc+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcbiAgfVxuICAvKipcbiAgICog6I635Y+W5LqU6KGM5a+55bqU55qEQ1NT57G75ZCNXG4gICAqIEBwYXJhbSB3dXhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIENTU+exu+WQjVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0V3VYaW5nQ2xhc3Mod3V4aW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWmguaenHd1eGluZ+acquWumuS5ie+8jOi/lOWbnuepuuWtl+espuS4slxuICAgIGlmICghd3V4aW5nKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfph5EnOiAnamluJyxcbiAgICAgICfmnKgnOiAnbXUnLFxuICAgICAgJ+awtCc6ICdzaHVpJyxcbiAgICAgICfngasnOiAnaHVvJyxcbiAgICAgICflnJ8nOiAndHUnXG4gICAgfTtcblxuICAgIGZvciAoY29uc3Qga2V5IGluIG1hcCkge1xuICAgICAgaWYgKHd1eGluZy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIHJldHVybiBtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W56We54We57G75Z6L77yI5ZCJ56We44CB5Ye256We44CB5ZCJ5Ye256We77yJXG4gICAqIEBwYXJhbSBzaGVuU2hhIOelnueFnuWQjeensFxuICAgKiBAcmV0dXJucyDnpZ7nhZ7nsbvlnotcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0U2hlblNoYVR5cGUoc2hlblNoYTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlkInnpZ7liJfooahcbiAgICBjb25zdCBnb29kU2hlblNoYSA9IFtcbiAgICAgICflpKnkuZnotLXkuronLCAn5paH5piMJywgJ+aWh+absicsICflpKnlvrcnLCAn5pyI5b63JywgJ+WkqeemjycsICflpKnlrpgnLCAn5aSp5Y6oJyxcbiAgICAgICflpKnlt6snLCAn5aSp5pyIJywgJ+WkqeWWnCcsICflpKnotaYnLCAn5aSp5oGpJywgJ+mpv+mprCcsICfnpoTnpZ4nLCAn5Zu95Y2wJyxcbiAgICAgICflpKnljLsnLCAn5aSp6LS1JywgJ+WkqeaJjScsICflpKnlr78nLCAn5aSp6aaoJywgJ+WkqemSuicsICflpKnkuqgnLCAn5aSp6KejJyxcbiAgICAgICflpKnmiqUnLCAn5aSp5bqGJywgJ+WkqeelpScsICflpKnkvZEnLCAn5aSp5a+MJywgJ+WkqeeItScsICflpKnlvrflkIgnLCAn5pyI5b635ZCIJ1xuICAgIF07XG5cbiAgICAvLyDlh7bnpZ7liJfooahcbiAgICBjb25zdCBiYWRTaGVuU2hhID0gW1xuICAgICAgJ+WkqeWIkScsICflpKnlk60nLCAn5aSp6JmaJywgJ+WSuOaxoCcsICfkuqHnpZ4nLCAn5Yqr54WeJywgJ+eBvueFnicsICfkupTprLwnLFxuICAgICAgJ+Wkqee9lycsICflnLDnvZEnLCAn5Zyw5LiBJywgJ+mYtOW3ricsICfprYHnvaEnLCAn5a2k6L6wJywgJ+WvoeWuvycsICfnmb3omY4nLFxuICAgICAgJ+WkqeeLlycsICflpKnni7EnLCAn5aSp5qOSJywgJ+WkqeWnmicsICflpKnniaInLCAn5aSp56W4JywgJ+WkqeeFnicsICflpKnlkI8nLFxuICAgICAgJ+WkqeWluCcsICflpKnorrwnLCAn576K5YiDJywgJ+mHkeelnidcbiAgICBdO1xuXG4gICAgLy8g5ZCJ5Ye256We5YiX6KGo77yI5qC55o2u5LiN5ZCM5oOF5Ya15Y+v6IO95ZCJ5Y+v6IO95Ye277yJXG4gICAgY29uc3QgbWl4ZWRTaGVuU2hhID0gW1xuICAgICAgJ+WwhuaYnycsICfljY7nm5YnLCAn5qGD6IqxJywgJ+S4ieWPsCcsICflhavluqcnLCAn5oGp5YWJJywgJ+Wkqei0tScsICflj7DovoUnLFxuICAgICAgJ+WwgeivsCcsICflpKnkvb8nLCAn5aSp5LykJywgJ+WkqeepuicsICfmiKrot68nLCAn5pes56m6JywgJ+S4ieWlhycsICflha3ku6onLFxuICAgICAgJ+S4ieWQiCcsICflha3lkIgnLCAn5pqX5ZCIJywgJ+aLseWQiCcsICfkuInkvJonLCAn5LiJ5YiRJywgJ+WFreWGsicsICfmmpflhrInLFxuICAgICAgJ+erpeWtkOeFnicsICflsIblhpvnrq0nLCAn57qi6ImzJ1xuICAgIF07XG5cbiAgICAvLyDljrvpmaTlj6/og73nmoTliY3nvIDvvIjlpoJcIuW5tOafsTpcIu+8iVxuICAgIGNvbnN0IHB1cmVTaGVuU2hhID0gc2hlblNoYS5pbmNsdWRlcygnOicpID8gc2hlblNoYS5zcGxpdCgnOicpWzFdIDogc2hlblNoYTtcblxuICAgIC8vIOiwg+ivleS/oeaBr1xuICAgIGNvbnNvbGUubG9nKGDliKTmlq3npZ7nhZ7nsbvlnos6ICR7c2hlblNoYX0gLT4gJHtwdXJlU2hlblNoYX1gKTtcblxuICAgIGlmIChnb29kU2hlblNoYS5pbmNsdWRlcyhwdXJlU2hlblNoYSkpIHtcbiAgICAgIHJldHVybiAn5ZCJ56WeJztcbiAgICB9IGVsc2UgaWYgKGJhZFNoZW5TaGEuaW5jbHVkZXMocHVyZVNoZW5TaGEpKSB7XG4gICAgICByZXR1cm4gJ+WHtuelnic7XG4gICAgfSBlbHNlIGlmIChtaXhlZFNoZW5TaGEuaW5jbHVkZXMocHVyZVNoZW5TaGEpKSB7XG4gICAgICByZXR1cm4gJ+WQieWHtuelnic7XG4gICAgfVxuXG4gICAgcmV0dXJuICfmnKrnn6UnO1xuICB9XG59XG5cbiJdfQ==