import { Solar, Lunar } from 'lunar-typescript';
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
     * @returns 八字信息对象
     */
    static parseBaziString(baziStr, gender = '1', sect = '2') {
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
        // 尝试反推日期
        let solarDate = '----年--月--日';
        let lunarDate = '农历----年--月--日';
        let solarTime = '--:--';
        let solar = null;
        let lunar = null;
        let eightChar = null;
        try {
            // 使用lunar-typescript库反推日期
            // 注意：这里只是一个估算，因为同一八字可能对应多个日期
            // 我们取最近的一个可能的日期
            // 1. 从年柱估算年份
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 80; // 从80年前开始查找
            const endYear = currentYear + 20; // 查找到20年后
            // 天干序号（甲=0, 乙=1, ..., 癸=9）
            const stemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearStem);
            // 地支序号（子=0, 丑=1, ..., 亥=11）
            const branchIndex = "子丑寅卯辰巳午未申酉戌亥".indexOf(yearBranch);
            // 查找符合年柱的年份
            let matchingYears = [];
            for (let year = startYear; year <= endYear; year++) {
                // 计算天干序号：年份减去4，除以10的余数
                const stemCheck = (year - 4) % 10;
                // 计算地支序号：年份减去4，除以12的余数
                const branchCheck = (year - 4) % 12;
                if (stemCheck === stemIndex && branchCheck === branchIndex) {
                    matchingYears.push(year);
                }
            }
            if (matchingYears.length > 0) {
                // 取最近的年份
                const year = matchingYears[matchingYears.length - 1];
                // 2. 从月柱估算月份
                // 地支对应的月份（寅=1月, 卯=2月, ..., 丑=12月）
                const monthMap = {
                    '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
                    '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
                };
                const month = monthMap[monthBranch] || 1;
                // 3. 从时柱估算小时
                // 地支对应的时辰（子=23-1点, 丑=1-3点, ..., 亥=21-23点）
                const hourMap = {
                    '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
                    '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22
                };
                const hour = hourMap[hourBranch] || 0;
                // 4. 使用lunar-typescript库查找符合条件的日期
                // 这里简化处理，取月中的第15天
                const day = 15;
                // 创建阳历对象
                solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
                // 转换为农历
                lunar = solar.getLunar();
                // 获取八字
                eightChar = lunar.getEightChar();
                // 格式化日期
                solarDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                lunarDate = lunar.toString();
                solarTime = `${hour.toString().padStart(2, '0')}:00`;
            }
        }
        catch (error) {
            console.error('反推日期出错:', error);
            // 出错时使用默认值
        }
        // 如果成功反推了日期，使用lunar-typescript库获取更多信息
        if (solar && lunar && eightChar) {
            // 使用formatBaziInfo获取完整的八字信息
            return this.formatBaziInfo(solar, lunar, eightChar, gender, sect);
        }
        // 如果反推失败，使用传统方法计算基本信息
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
        return {
            // 基本信息
            solarDate,
            lunarDate,
            solarTime,
            // 八字信息
            yearPillar: parts[0],
            yearStem,
            yearBranch,
            yearHideGan: this.getHideGan(yearBranch),
            yearWuXing,
            yearNaYin,
            yearShengXiao,
            monthPillar: parts[1],
            monthStem,
            monthBranch,
            monthHideGan: this.getHideGan(monthBranch),
            monthWuXing,
            monthNaYin,
            monthShengXiao,
            dayPillar: parts[2],
            dayStem,
            dayBranch,
            dayHideGan: this.getHideGan(dayBranch),
            dayWuXing,
            dayNaYin,
            dayShengXiao,
            hourPillar: parts[3],
            hourStem,
            hourBranch,
            hourHideGan: this.getHideGan(hourBranch),
            hourWuXing,
            hourNaYin,
            hourShengXiao,
            // 特殊信息
            taiYuan,
            taiYuanNaYin,
            mingGong,
            mingGongNaYin,
            // 完整信息
            fullString: `八字：${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`,
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

        // 先获取日干，因为计算十神需要以日干为主
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();

        // 年柱
        const yearStem = eightChar.getYearGan();
        const yearBranch = eightChar.getYearZhi();
        const yearPillar = yearStem + yearBranch;
        // 使用自定义的藏干方法，而不是lunar-typescript库的方法
        const yearHideGan = this.getHideGan(yearBranch);
        const yearWuXing = eightChar.getYearWuXing();
        const yearNaYin = eightChar.getYearNaYin();
        const yearShiShenGan = eightChar.getYearShiShenGan();
        // 使用自定义的地支藏干十神方法
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
        // 使用自定义的藏干方法
        const monthHideGan = this.getHideGan(monthBranch);
        const monthWuXing = eightChar.getMonthWuXing();
        const monthNaYin = eightChar.getMonthNaYin();
        const monthShiShenGan = eightChar.getMonthShiShenGan();
        // 使用自定义的地支藏干十神方法
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
        // 日柱 (日干和日支已在前面获取)
        const dayPillar = dayStem + dayBranch;
        // 使用自定义的藏干方法
        const dayHideGan = this.getHideGan(dayBranch);
        const dayWuXing = eightChar.getDayWuXing();
        const dayNaYin = eightChar.getDayNaYin();
        // 使用自定义的地支藏干十神方法
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
        // 使用自定义的藏干方法
        const hourHideGan = this.getHideGan(hourBranch);
        const hourWuXing = eightChar.getTimeWuXing();
        const hourNaYin = eightChar.getTimeNaYin();
        const hourShiShenGan = eightChar.getTimeShiShenGan();
        // 使用自定义的地支藏干十神方法
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
        const geJuInfo = this.calculateGeJu(eightChar);
        const geJu = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.geJu;
        const geJuDetail = geJuInfo === null || geJuInfo === void 0 ? void 0 : geJuInfo.detail;
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
                    if (this.isTianXi(branch)) {
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
                shenSha
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
                    if (this.isTianXi(branch)) {
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
            return {
                year,
                age,
                index,
                ganZhi,
                naYin: ganZhi ? this.getNaYin(ganZhi) : '',
                xunKong,
                shiShenGan,
                diShi,
                shenSha
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
                    if (this.isTianXi(branch)) {
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
            return {
                year,
                age,
                index,
                ganZhi,
                naYin: ganZhi ? this.getNaYin(ganZhi) : '',
                xunKong,
                shiShenGan,
                diShi,
                shenSha
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
                    if (this.isTianXi(branch)) {
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
            return {
                month,
                index,
                ganZhi,
                naYin,
                xunKong,
                shiShenGan,
                diShi,
                shenSha
            };
        });
        // 计算五行强度
        const wuXingStrength = this.calculateWuXingStrength(eightChar);
        // 计算日主旺衰
        const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
        const riZhuStrength = riZhuStrengthInfo.result;
        const riZhuStrengthDetails = riZhuStrengthInfo.details;
        return Object.assign(Object.assign(Object.assign({
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
            dayYi: dayYi, dayJi: dayJi, shenSha: shenSha }, (geJu ? { geJu } : {})), (geJuDetail ? { geJuDetail } : {})), {
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
        // 阳干：甲丙戊庚壬
        // 阴干：乙丁己辛癸
        const yangGan = '甲丙戊庚壬';
        // 五行生克关系：木火土金水
        const wuXingOrder = '木火土金水';
        // 判断日干阴阳
        const isDayYang = yangGan.includes(dayStem);
        // 获取日干和其他干的五行
        const dayWuXing = this.getStemWuXing(dayStem);
        const otherWuXing = this.getStemWuXing(otherStem);
        // 判断其他干阴阳
        const isOtherYang = yangGan.includes(otherStem);
        // 获取五行索引
        const dayWuXingIndex = wuXingOrder.indexOf(dayWuXing);
        const otherWuXingIndex = wuXingOrder.indexOf(otherWuXing);
        // 计算五行关系
        // 相同五行
        if (dayWuXing === otherWuXing) {
            // 阴阳相同为比肩，阴阳不同为劫财
            return (isDayYang === isOtherYang) ? '比肩' : '劫财';
        }
        // 生我者（前一个五行）
        const shengWoIndex = (dayWuXingIndex - 1 + 5) % 5;
        if (otherWuXingIndex === shengWoIndex) {
            // 阴阳相同为食神，阴阳不同为伤官
            return (isDayYang === isOtherYang) ? '食神' : '伤官';
        }
        // 我生者（后一个五行）
        const woShengIndex = (dayWuXingIndex + 1) % 5;
        if (otherWuXingIndex === woShengIndex) {
            // 阴阳相同为偏财，阴阳不同为正财
            return (isDayYang === isOtherYang) ? '偏财' : '正财';
        }
        // 克我者（后二个五行）
        const keWoIndex = (dayWuXingIndex + 2) % 5;
        if (otherWuXingIndex === keWoIndex) {
            // 阴阳相同为七杀，阴阳不同为正官
            return (isDayYang === isOtherYang) ? '七杀' : '正官';
        }
        // 我克者（前二个五行）
        const woKeIndex = (dayWuXingIndex - 2 + 5) % 5;
        if (otherWuXingIndex === woKeIndex) {
            // 阴阳相同为偏印，阴阳不同为正印
            return (isDayYang === isOtherYang) ? '偏印' : '正印';
        }
        return '未知';
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
        // 获取地支藏干
        const yearHideGan = eightChar.getYearHideGan();
        const monthHideGan = eightChar.getMonthHideGan();
        const dayHideGan = eightChar.getDayHideGan();
        const timeHideGan = eightChar.getTimeHideGan();
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
     */
    static processHideGanForStrength(hideGan, baseWeight, details) {
        if (!hideGan || hideGan.length === 0)
            return;
        // 根据藏干数量分配权重
        // 一个藏干：100%权重
        // 两个藏干：60%和40%权重
        // 三个藏干：50%、30%和20%权重
        const weights = hideGan.length === 1 ? [1.0] :
            hideGan.length === 2 ? [0.6, 0.4] :
                [0.5, 0.3, 0.2];
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
     */
    static adjustByMonthSeasonForStrength(monthBranch, details) {
        // 根据月令季节调整五行强度
        // 春季(寅卯辰)：木旺(+2.0)，火相(+1.0)，土平(0)，金囚(-1.0)，水死(-1.5)
        // 夏季(巳午未)：火旺(+2.0)，土相(+1.0)，金平(0)，水囚(-1.0)，木死(-1.5)
        // 秋季(申酉戌)：金旺(+2.0)，水相(+1.0)，木平(0)，火囚(-1.0)，土死(-1.5)
        // 冬季(亥子丑)：水旺(+2.0)，木相(+1.0)，火平(0)，土囚(-1.0)，金死(-1.5)
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            details.mu.season += 2.0; // 木旺
            details.huo.season += 1.0; // 火相
            details.jin.season -= 1.0; // 金囚
            details.shui.season -= 1.5; // 水死
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            details.huo.season += 2.0; // 火旺
            details.tu.season += 1.0; // 土相
            details.shui.season -= 1.0; // 水囚
            details.mu.season -= 1.5; // 木死
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            details.jin.season += 2.0; // 金旺
            details.shui.season += 1.0; // 水相
            details.huo.season -= 1.0; // 火囚
            details.tu.season -= 1.5; // 土死
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            details.shui.season += 2.0; // 水旺
            details.mu.season += 1.0; // 木相
            details.tu.season -= 1.0; // 土囚
            details.jin.season -= 1.5; // 金死
        }
    }
    /**
     * 添加月令当令加成
     * @param monthBranch 月支
     * @param details 详细信息对象
     */
    static addMonthDominantBonus(monthBranch, details) {
        // 添加月令当令加成
        // 春季(寅卯辰)：木当令(+1.5)，火相旺(+0.8)
        // 夏季(巳午未)：火当令(+1.5)，土相旺(+0.8)
        // 秋季(申酉戌)：金当令(+1.5)，水相旺(+0.8)
        // 冬季(亥子丑)：水当令(+1.5)，木相旺(+0.8)
        if (['寅', '卯', '辰'].includes(monthBranch)) {
            // 春季
            details.mu.monthDominant += 1.5; // 木当令
            details.huo.monthDominant += 0.8; // 火相旺
        }
        else if (['巳', '午', '未'].includes(monthBranch)) {
            // 夏季
            details.huo.monthDominant += 1.5; // 火当令
            details.tu.monthDominant += 0.8; // 土相旺
        }
        else if (['申', '酉', '戌'].includes(monthBranch)) {
            // 秋季
            details.jin.monthDominant += 1.5; // 金当令
            details.shui.monthDominant += 0.8; // 水相旺
        }
        else if (['亥', '子', '丑'].includes(monthBranch)) {
            // 冬季
            details.shui.monthDominant += 1.5; // 水当令
            details.mu.monthDominant += 0.8; // 木相旺
        }
    }
    /**
     * 根据四柱组合关系调整五行强度
     * @param eightChar 八字对象
     * @param details 详细信息对象
     */
    static adjustByCombinationForStrength(eightChar, details) {
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
        this.checkStemCombinationForStrength(yearStem, monthStem, details);
        this.checkStemCombinationForStrength(yearStem, dayStem, details);
        this.checkStemCombinationForStrength(yearStem, timeStem, details);
        this.checkStemCombinationForStrength(monthStem, dayStem, details);
        this.checkStemCombinationForStrength(monthStem, timeStem, details);
        this.checkStemCombinationForStrength(dayStem, timeStem, details);
        // 检查地支组合（三合、三会、六合等）
        this.checkBranchTripleForStrength(yearBranch, monthBranch, dayBranch, timeBranch, details);
    }
    /**
     * 检查天干合化
     * @param stem1 天干1
     * @param stem2 天干2
     * @param details 详细信息对象
     */
    static checkStemCombinationForStrength(stem1, stem2, details) {
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
     */
    static checkBranchTripleForStrength(branch1, branch2, branch3, branch4, details) {
        const branches = [branch1, branch2, branch3, branch4];
        // 检查三合局
        const sanHeJu = this.checkSanHeJu(branches);
        if (sanHeJu) {
            this.addWuXingStrength(sanHeJu, 1.2, details, 'combination'); // 提高三合局权重
        }
        // 检查三会局
        const sanHuiJu = this.checkSanHuiJu(branches);
        if (sanHuiJu) {
            this.addWuXingStrength(sanHuiJu, 1.0, details, 'combination'); // 提高三会局权重
        }
    }
    /**
     * 处理地支藏干的五行强度
     * @param hideGan 藏干数组
     * @param baseWeight 基础权重
     * @param addStrength 增加强度的函数
     */
    static processHideGan(hideGan, baseWeight, addStrength) {
        if (!hideGan || hideGan.length === 0)
            return;
        // 根据藏干数量分配权重
        // 一个藏干：100%权重
        // 两个藏干：60%和40%权重
        // 三个藏干：50%、30%和20%权重
        const weights = hideGan.length === 1 ? [1.0] :
            hideGan.length === 2 ? [0.6, 0.4] :
                [0.5, 0.3, 0.2];
        // 为每个藏干增加相应权重的五行强度
        hideGan.forEach((gan, index) => {
            if (index < weights.length) {
                const wuXing = this.getStemWuXing(gan);
                addStrength(wuXing, baseWeight * weights[index]);
            }
        });
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
        if (this.isTianXi(yearBranch)) {
            yearShenSha.push('天喜');
        }
        if (this.isTianXi(monthBranch)) {
            monthShenSha.push('天喜');
        }
        if (this.isTianXi(dayBranch)) {
            dayShenSha.push('天喜');
        }
        if (this.isTianXi(timeBranch)) {
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
        return {
            shenSha,
            yearShenSha,
            monthShenSha,
            dayShenSha,
            hourShenSha
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
     * @returns 是否为天喜
     */
    static isTianXi(branch) {
        // 天喜与地支的对应关系
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
        return Object.values(tianXiMap).includes(branch);
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
     * 计算八字格局
     * @param eightChar 八字对象
     * @returns 格局信息
     */
    static calculateGeJu(eightChar) {
        // 获取日干和五行
        const dayStem = eightChar.getDayGan();
        const dayWuXing = eightChar.getDayWuXing();
        // 获取四柱天干和五行
        const yearStem = eightChar.getYearGan();
        const yearWuXing = eightChar.getYearWuXing();
        const monthStem = eightChar.getMonthGan();
        const monthWuXing = eightChar.getMonthWuXing();
        const timeStem = eightChar.getTimeGan();
        const timeWuXing = eightChar.getTimeWuXing();
        // 获取四柱地支和五行
        const yearBranch = eightChar.getYearZhi();
        const yearBranchWuXing = this.getBranchWuXing(yearBranch);
        const monthBranch = eightChar.getMonthZhi();
        const monthBranchWuXing = this.getBranchWuXing(monthBranch);
        const dayBranch = eightChar.getDayZhi();
        const dayBranchWuXing = this.getBranchWuXing(dayBranch);
        const timeBranch = eightChar.getTimeZhi();
        const timeBranchWuXing = this.getBranchWuXing(timeBranch);
        // 计算五行个数
        const wuXingCount = {
            '金': 0,
            '木': 0,
            '水': 0,
            '火': 0,
            '土': 0
        };
        // 天干五行
        if (yearWuXing === '金')
            wuXingCount['金']++;
        if (yearWuXing === '木')
            wuXingCount['木']++;
        if (yearWuXing === '水')
            wuXingCount['水']++;
        if (yearWuXing === '火')
            wuXingCount['火']++;
        if (yearWuXing === '土')
            wuXingCount['土']++;
        if (monthWuXing === '金')
            wuXingCount['金']++;
        if (monthWuXing === '木')
            wuXingCount['木']++;
        if (monthWuXing === '水')
            wuXingCount['水']++;
        if (monthWuXing === '火')
            wuXingCount['火']++;
        if (monthWuXing === '土')
            wuXingCount['土']++;
        if (dayWuXing === '金')
            wuXingCount['金']++;
        if (dayWuXing === '木')
            wuXingCount['木']++;
        if (dayWuXing === '水')
            wuXingCount['水']++;
        if (dayWuXing === '火')
            wuXingCount['火']++;
        if (dayWuXing === '土')
            wuXingCount['土']++;
        if (timeWuXing === '金')
            wuXingCount['金']++;
        if (timeWuXing === '木')
            wuXingCount['木']++;
        if (timeWuXing === '水')
            wuXingCount['水']++;
        if (timeWuXing === '火')
            wuXingCount['火']++;
        if (timeWuXing === '土')
            wuXingCount['土']++;
        // 地支五行
        if (yearBranchWuXing === '金')
            wuXingCount['金']++;
        if (yearBranchWuXing === '木')
            wuXingCount['木']++;
        if (yearBranchWuXing === '水')
            wuXingCount['水']++;
        if (yearBranchWuXing === '火')
            wuXingCount['火']++;
        if (yearBranchWuXing === '土')
            wuXingCount['土']++;
        if (monthBranchWuXing === '金')
            wuXingCount['金']++;
        if (monthBranchWuXing === '木')
            wuXingCount['木']++;
        if (monthBranchWuXing === '水')
            wuXingCount['水']++;
        if (monthBranchWuXing === '火')
            wuXingCount['火']++;
        if (monthBranchWuXing === '土')
            wuXingCount['土']++;
        if (dayBranchWuXing === '金')
            wuXingCount['金']++;
        if (dayBranchWuXing === '木')
            wuXingCount['木']++;
        if (dayBranchWuXing === '水')
            wuXingCount['水']++;
        if (dayBranchWuXing === '火')
            wuXingCount['火']++;
        if (dayBranchWuXing === '土')
            wuXingCount['土']++;
        if (timeBranchWuXing === '金')
            wuXingCount['金']++;
        if (timeBranchWuXing === '木')
            wuXingCount['木']++;
        if (timeBranchWuXing === '水')
            wuXingCount['水']++;
        if (timeBranchWuXing === '火')
            wuXingCount['火']++;
        if (timeBranchWuXing === '土')
            wuXingCount['土']++;
        // 判断格局
        // 1. 日主旺衰
        const riZhuStrengthInfo = this.calculateRiZhuStrength(eightChar);
        const riZhuStrength = riZhuStrengthInfo.result;
        // 2. 五行缺失
        const missingWuXing = Object.keys(wuXingCount).filter(key => wuXingCount[key] === 0);
        // 3. 特殊格局判断
        // 3.1 七杀格
        if (this.isQiShaGe(eightChar)) {
            return {
                geJu: '七杀格',
                detail: '八字中有七杀，且七杀有力，日主衰弱。'
            };
        }
        // 3.2 正官格
        if (this.isZhengGuanGe(eightChar)) {
            return {
                geJu: '正官格',
                detail: '八字中有正官，且正官有力，日主衰弱。'
            };
        }
        // 3.3 偏印格
        if (this.isPianYinGe(eightChar)) {
            return {
                geJu: '偏印格',
                detail: '八字中有偏印，且偏印有力，日主衰弱。'
            };
        }
        // 3.4 正印格
        if (this.isZhengYinGe(eightChar)) {
            return {
                geJu: '正印格',
                detail: '八字中有正印，且正印有力，日主衰弱。'
            };
        }
        // 3.5 食神格
        if (this.isShiShenGe(eightChar)) {
            return {
                geJu: '食神格',
                detail: '八字中有食神，且食神有力，日主旺盛。'
            };
        }
        // 3.6 伤官格
        if (this.isShangGuanGe(eightChar)) {
            return {
                geJu: '伤官格',
                detail: '八字中有伤官，且伤官有力，日主旺盛。'
            };
        }
        // 3.7 偏财格
        if (this.isPianCaiGe(eightChar)) {
            return {
                geJu: '偏财格',
                detail: '八字中有偏财，且偏财有力，日主旺盛。'
            };
        }
        // 3.8 正财格
        if (this.isZhengCaiGe(eightChar)) {
            return {
                geJu: '正财格',
                detail: '八字中有正财，且正财有力，日主旺盛。'
            };
        }
        // 3.9 比肩格
        if (this.isBiJianGe(eightChar)) {
            return {
                geJu: '比肩格',
                detail: '八字中有比肩，且比肩有力，日主旺盛。'
            };
        }
        // 3.10 劫财格
        if (this.isJieCaiGe(eightChar)) {
            return {
                geJu: '劫财格',
                detail: '八字中有劫财，且劫财有力，日主旺盛。'
            };
        }
        // 默认格局
        if (riZhuStrength === '旺' || riZhuStrength === '相') {
            return {
                geJu: '日主旺相',
                detail: '日主旺盛或相旺，需要抑制。'
            };
        }
        else if (riZhuStrength === '衰' || riZhuStrength === '休') {
            return {
                geJu: '日主衰弱',
                detail: '日主衰弱或休囚，需要扶助。'
            };
        }
        else {
            return {
                geJu: '日主平和',
                detail: '日主平和，需要根据具体情况调整。'
            };
        }
    }
    /**
     * 判断是否为七杀格
     * @param eightChar 八字对象
     * @returns 是否为七杀格
     */
    static isQiShaGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有七杀
        return this.getShiShen(dayStem, yearStem) === '七杀' ||
            this.getShiShen(dayStem, monthStem) === '七杀' ||
            this.getShiShen(dayStem, timeStem) === '七杀';
    }
    /**
     * 判断是否为正官格
     * @param eightChar 八字对象
     * @returns 是否为正官格
     */
    static isZhengGuanGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有正官
        return this.getShiShen(dayStem, yearStem) === '正官' ||
            this.getShiShen(dayStem, monthStem) === '正官' ||
            this.getShiShen(dayStem, timeStem) === '正官';
    }
    /**
     * 判断是否为偏印格
     * @param eightChar 八字对象
     * @returns 是否为偏印格
     */
    static isPianYinGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有偏印
        return this.getShiShen(dayStem, yearStem) === '偏印' ||
            this.getShiShen(dayStem, monthStem) === '偏印' ||
            this.getShiShen(dayStem, timeStem) === '偏印';
    }
    /**
     * 判断是否为正印格
     * @param eightChar 八字对象
     * @returns 是否为正印格
     */
    static isZhengYinGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有正印
        return this.getShiShen(dayStem, yearStem) === '正印' ||
            this.getShiShen(dayStem, monthStem) === '正印' ||
            this.getShiShen(dayStem, timeStem) === '正印';
    }
    /**
     * 判断是否为食神格
     * @param eightChar 八字对象
     * @returns 是否为食神格
     */
    static isShiShenGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有食神
        return this.getShiShen(dayStem, yearStem) === '食神' ||
            this.getShiShen(dayStem, monthStem) === '食神' ||
            this.getShiShen(dayStem, timeStem) === '食神';
    }
    /**
     * 判断是否为伤官格
     * @param eightChar 八字对象
     * @returns 是否为伤官格
     */
    static isShangGuanGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有伤官
        return this.getShiShen(dayStem, yearStem) === '伤官' ||
            this.getShiShen(dayStem, monthStem) === '伤官' ||
            this.getShiShen(dayStem, timeStem) === '伤官';
    }
    /**
     * 判断是否为偏财格
     * @param eightChar 八字对象
     * @returns 是否为偏财格
     */
    static isPianCaiGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有偏财
        return this.getShiShen(dayStem, yearStem) === '偏财' ||
            this.getShiShen(dayStem, monthStem) === '偏财' ||
            this.getShiShen(dayStem, timeStem) === '偏财';
    }
    /**
     * 判断是否为正财格
     * @param eightChar 八字对象
     * @returns 是否为正财格
     */
    static isZhengCaiGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有正财
        return this.getShiShen(dayStem, yearStem) === '正财' ||
            this.getShiShen(dayStem, monthStem) === '正财' ||
            this.getShiShen(dayStem, timeStem) === '正财';
    }
    /**
     * 判断是否为比肩格
     * @param eightChar 八字对象
     * @returns 是否为比肩格
     */
    static isBiJianGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有比肩
        return this.getShiShen(dayStem, yearStem) === '比肩' ||
            this.getShiShen(dayStem, monthStem) === '比肩' ||
            this.getShiShen(dayStem, timeStem) === '比肩';
    }
    /**
     * 判断是否为劫财格
     * @param eightChar 八字对象
     * @returns 是否为劫财格
     */
    static isJieCaiGe(eightChar) {
        // 简化判断，实际应该根据八字命理规则计算
        const dayStem = eightChar.getDayGan();
        const yearStem = eightChar.getYearGan();
        const monthStem = eightChar.getMonthGan();
        const timeStem = eightChar.getTimeGan();
        // 判断是否有劫财
        return this.getShiShen(dayStem, yearStem) === '劫财' ||
            this.getShiShen(dayStem, monthStem) === '劫财' ||
            this.getShiShen(dayStem, timeStem) === '劫财';
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
          <td class="wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}</td>
          <td class="wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}</td>
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
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.yearWuXing)}">${baziInfo.yearStem}(${baziInfo.yearWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.monthWuXing)}">${baziInfo.monthStem}(${baziInfo.monthWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.dayWuXing)}">${baziInfo.dayStem}(${baziInfo.dayWuXing || '未知'})</span>
      <span class="wuxing-tag wuxing-${this.getWuXingClass(baziInfo.hourWuXing)}">${baziInfo.hourStem}(${baziInfo.hourWuXing || '未知'})</span>
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
          ${baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startYear}</td>`).join('')}
        </tr>
        <tr>
          <th>年龄</th>
          ${baziInfo.daYun.slice(0, 10).map(dy => `<td>${dy.startAge}</td>`).join('')}
        </tr>
        <tr>
          <th>干支</th>
          ${baziInfo.daYun.slice(0, 10).map((dy, index) => `
            <td class="bazi-dayun-cell" data-index="${index}">${dy.ganZhi}</td>
          `).join('')}
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF6aVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXppU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBYSxNQUFNLGtCQUFrQixDQUFDO0FBRTNEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFDdEI7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsT0FBZSxDQUFDLEVBQUUsU0FBaUIsR0FBRyxFQUFFLE9BQWUsR0FBRztRQUN6SCxTQUFTO1FBQ1QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELFFBQVE7UUFDUixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsT0FBTztRQUNQLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxPQUFlLENBQUMsRUFBRSxjQUF1QixLQUFLLEVBQUUsU0FBaUIsR0FBRyxFQUFFLE9BQWUsR0FBRztRQUM1SixTQUFTO1FBQ1QsMkNBQTJDO1FBQzNDLGVBQWU7UUFDZixJQUFJLEtBQUssQ0FBQztRQUNWLElBQUksV0FBVyxFQUFFO1lBQ2Ysa0JBQWtCO1lBQ2xCLHlCQUF5QjtZQUN6QixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVB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RSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLO1lBQ3hCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSztTQUN6QixDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFHRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBWSxFQUFFLEtBQVksRUFBRSxTQUFvQixFQUFFLFNBQWlCLEdBQUcsRUFBRSxPQUFlLEdBQUc7UUFDdEgsU0FBUztRQUNULFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEMsS0FBSztRQUNMLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxVQUFVLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckQsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLGtCQUFrQjtRQUNsQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSTtZQUNGLGFBQWE7WUFDYixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsV0FBVyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUMxQztTQUNGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELEtBQUs7UUFDTCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sV0FBVyxHQUFHLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDNUMsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUU3QyxrQkFBa0I7UUFDbEIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUk7WUFDRixhQUFhO1lBQ2IsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNaLFlBQVksR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDNUM7U0FDRjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDL0I7UUFFRCxLQUFLO1FBQ0wsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6QyxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFekMsa0JBQWtCO1FBQ2xCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJO1lBQ0YsYUFBYTtZQUNiLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQyxJQUFJLE1BQU0sRUFBRTtnQkFDVixVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3hDO1NBQ0Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsS0FBSztRQUNMLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxVQUFVLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckQsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLGtCQUFrQjtRQUNsQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSTtZQUNGLGFBQWE7WUFDYixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsV0FBVyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUMxQztZQUVELG9CQUFvQjtZQUNwQixJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUMzRDtTQUNGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixVQUFVO1lBQ1YsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDM0Q7UUFFRCxPQUFPO1FBQ1AsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXpDLE9BQU87UUFDUCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTVELE9BQU87UUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXBELGVBQWU7UUFDZixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7UUFDbkMsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLFlBQVk7UUFDckMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO1FBRW5DLEtBQUs7UUFDTCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUVoRSxLQUFLO1FBQ0wsTUFBTSxLQUFLLEdBQUcsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzRSxNQUFNLFNBQVMsR0FBRyxPQUFPLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXZGLEtBQUs7UUFDTCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFFckMsS0FBSztRQUNMLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2RCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUM7UUFDOUMsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNoRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDO1FBQzVDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUM7UUFFOUMsS0FBSztRQUNMLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsTUFBTSxJQUFJLEdBQUcsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLElBQUksQ0FBQztRQUM1QixNQUFNLFVBQVUsR0FBRyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsTUFBTSxDQUFDO1FBRXBDLE9BQU87UUFDUCxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxnQkFBZ0I7UUFFNUMsT0FBTztRQUNQLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzlCLGtCQUFrQjtZQUNsQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDakIsSUFBSTtnQkFDRixXQUFXO2dCQUNYLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLCtCQUErQjtvQkFDL0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzNDO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELGtCQUFrQjtZQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2pGLElBQUk7Z0JBQUUsU0FBUyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUNwRixJQUFJO2dCQUFFLE9BQU8sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDaEYsSUFBSTtnQkFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ25GLElBQUk7Z0JBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUMvRSxJQUFJO2dCQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDM0UsSUFBSTtnQkFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTdFLE9BQU87WUFDUCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekQ7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDckM7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztZQUM3QixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVoQyxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTTtvQkFDTixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNyQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO2dCQUNMLFNBQVM7Z0JBQ1QsT0FBTztnQkFDUCxRQUFRO2dCQUNSLE1BQU07Z0JBQ04sS0FBSztnQkFDTCxNQUFNO2dCQUNOLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFDLE9BQU87Z0JBQ1AsVUFBVTtnQkFDVixLQUFLO2dCQUNMLE9BQU87YUFDUixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxtQkFBbUI7UUFDbkIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDbEMsa0JBQWtCO1lBQ2xCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJO2dCQUNGLFdBQVc7Z0JBQ1gsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDakMsK0JBQStCO29CQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDM0M7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsa0JBQWtCO1lBQ2xCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUM5QyxJQUFJO2dCQUFFLElBQUksR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDekUsSUFBSTtnQkFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ3ZFLElBQUk7Z0JBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUMzRSxJQUFJO2dCQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFFN0UsT0FBTztZQUNQLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6RDthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO1lBQ1AsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQzthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO1lBQ1AsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzdCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWhDLE9BQU87b0JBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxNQUFNO29CQUNOLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3JCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELE9BQU87b0JBQ1AsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO2dCQUNMLElBQUk7Z0JBQ0osR0FBRztnQkFDSCxLQUFLO2dCQUNMLE1BQU07Z0JBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUMsT0FBTztnQkFDUCxVQUFVO2dCQUNWLEtBQUs7Z0JBQ0wsT0FBTzthQUNSLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNsQyxrQkFBa0I7WUFDbEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUk7Z0JBQ0YsV0FBVztnQkFDWCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNqQywrQkFBK0I7b0JBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQzlDLElBQUk7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUN6RSxJQUFJO2dCQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDdkUsSUFBSTtnQkFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQzNFLElBQUk7Z0JBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUU3RSxPQUFPO1lBQ1AsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pEO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFDN0IsSUFBSTtnQkFDRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFaEMsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELE1BQU07b0JBQ04sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDckI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsT0FBTztvQkFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN0QjtvQkFFRCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Y7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztnQkFDTCxJQUFJO2dCQUNKLEdBQUc7Z0JBQ0gsS0FBSztnQkFDTCxNQUFNO2dCQUNOLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFDLE9BQU87Z0JBQ1AsVUFBVTtnQkFDVixLQUFLO2dCQUNMLE9BQU87YUFDUixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxtQkFBbUI7UUFDbkIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDaEMsa0JBQWtCO1lBQ2xCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJO2dCQUNGLFdBQVc7Z0JBQ1gsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDakMsK0JBQStCO29CQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDM0M7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsa0JBQWtCO1lBQ2xCLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSTtnQkFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFBRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDcEYsSUFBSTtnQkFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQzNFLElBQUk7Z0JBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUFFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUU3RSxPQUFPO1lBQ1AsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pEO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE9BQU87WUFDUCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNqQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDL0I7YUFDRjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTztZQUNQLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztZQUM3QixJQUFJO2dCQUNGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVoQyxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsTUFBTTtvQkFDTixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNyQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxPQUFPO29CQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RCO29CQUVELE9BQU87b0JBQ1AsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3BCO29CQUVELEtBQUs7b0JBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtvQkFFRCxLQUFLO29CQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDcEI7b0JBRUQsS0FBSztvQkFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPO2dCQUNMLEtBQUs7Z0JBQ0wsS0FBSztnQkFDTCxNQUFNO2dCQUNOLEtBQUs7Z0JBQ0wsT0FBTztnQkFDUCxVQUFVO2dCQUNWLEtBQUs7Z0JBQ0wsT0FBTzthQUNSLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILFNBQVM7UUFDVCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFL0QsU0FBUztRQUNULE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztRQUMvQyxNQUFNLG9CQUFvQixHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztRQUV2RDtZQUNFLE9BQU87WUFDUCxTQUFTO1lBQ1QsU0FBUztZQUNULFNBQVM7WUFFVCxPQUFPO1lBQ1AsVUFBVTtZQUNWLFFBQVE7WUFDUixVQUFVO1lBQ1YsV0FBVztZQUNYLFVBQVU7WUFDVixTQUFTO1lBRVQsV0FBVztZQUNYLFNBQVM7WUFDVCxXQUFXO1lBQ1gsWUFBWTtZQUNaLFdBQVc7WUFDWCxVQUFVO1lBRVYsU0FBUztZQUNULE9BQU87WUFDUCxTQUFTO1lBQ1QsVUFBVTtZQUNWLFNBQVM7WUFDVCxRQUFRO1lBRVIsVUFBVTtZQUNWLFFBQVE7WUFDUixVQUFVO1lBQ1YsV0FBVztZQUNYLFVBQVU7WUFDVixTQUFTO1lBRVQsT0FBTztZQUNQLE9BQU87WUFDUCxZQUFZO1lBQ1osUUFBUTtZQUNSLGFBQWE7WUFDYixRQUFRO1lBRVIsT0FBTztZQUNQLFVBQVUsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFO1lBRWhDLE9BQU87WUFDUCxRQUFRLEVBQUUsSUFBSSxFQUNkLE1BQU07WUFFTixPQUFPO1lBQ1AsYUFBYTtZQUNiLGNBQWM7WUFDZCxZQUFZO1lBQ1osYUFBYTtZQUViLE9BQU87WUFDUCxXQUFXO1lBQ1gsWUFBWTtZQUNaLFVBQVU7WUFDVixXQUFXO1lBRVgsT0FBTztZQUNQLGNBQWM7WUFDZCxlQUFlO1lBQ2YsYUFBYTtZQUNiLGNBQWM7WUFFZCxZQUFZO1lBQ1osU0FBUztZQUNULFVBQVU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUVULFNBQVM7WUFDVCxXQUFXO1lBQ1gsWUFBWTtZQUNaLFVBQVU7WUFDVixXQUFXO1lBRVgsUUFBUTtZQUNSLE1BQU0sRUFDTixLQUFLLEVBQUUsS0FBZSxFQUN0QixTQUFTLEVBQUUsU0FBbUI7WUFFOUIsUUFBUTtZQUNSLEtBQUssRUFBRSxLQUFpQixFQUN4QixLQUFLLEVBQUUsS0FBaUIsRUFDeEIsT0FBTyxFQUFFLE9BQW1CLElBR3pCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FDdEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVyQyxPQUFPO1lBQ1AsU0FBUztZQUNULFVBQVU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUNULFNBQVM7WUFDVCxRQUFRO1lBRVIsY0FBYztZQUNkLEtBQUs7WUFDTCxPQUFPO1lBQ1AsT0FBTztZQUNQLE1BQU07WUFFTixZQUFZO1lBQ1osY0FBYztZQUNkLGFBQWE7WUFDYixvQkFBb0IsSUFDcEI7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBYztRQUN4QyxNQUFNLEdBQUcsR0FBNEI7WUFDbkMsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1NBQ1QsQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQWUsRUFBRSxTQUFpQjtRQUMxRCxXQUFXO1FBQ1gsV0FBVztRQUNYLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV4QixlQUFlO1FBQ2YsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBRTVCLFNBQVM7UUFDVCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTVDLGNBQWM7UUFDZCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbEQsVUFBVTtRQUNWLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFaEQsU0FBUztRQUNULE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTFELFNBQVM7UUFDVCxPQUFPO1FBQ1AsSUFBSSxTQUFTLEtBQUssV0FBVyxFQUFFO1lBQzdCLGtCQUFrQjtZQUNsQixPQUFPLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNsRDtRQUVELGFBQWE7UUFDYixNQUFNLFlBQVksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksZ0JBQWdCLEtBQUssWUFBWSxFQUFFO1lBQ3JDLGtCQUFrQjtZQUNsQixPQUFPLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNsRDtRQUVELGFBQWE7UUFDYixNQUFNLFlBQVksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxnQkFBZ0IsS0FBSyxZQUFZLEVBQUU7WUFDckMsa0JBQWtCO1lBQ2xCLE9BQU8sQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2xEO1FBRUQsYUFBYTtRQUNiLE1BQU0sU0FBUyxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtZQUNsQyxrQkFBa0I7WUFDbEIsT0FBTyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDbEQ7UUFFRCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtZQUNsQyxrQkFBa0I7WUFDbEIsT0FBTyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDbEQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBb0IsRUFBRSxNQUFjO1FBQ2hFLG9DQUFvQztRQUNwQyxlQUFlO1FBQ2YsTUFBTSxLQUFLLEdBQWtGLEVBQUUsQ0FBQztRQUVoRyx1QkFBdUI7UUFDdkIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFN0MsT0FBTztRQUNQLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFNUMsU0FBUztRQUNULE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQztRQUMzQixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFFaEMsT0FBTztRQUNQLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXZELFlBQVk7UUFDWixNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFFcEQsVUFBVTtRQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsV0FBVztZQUNYLE1BQU0sU0FBUyxHQUFHLENBQUMsY0FBYyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbkUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRXZFLE9BQU87WUFDUCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7WUFFN0IsT0FBTztZQUNQLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFcEMsWUFBWTtZQUNaLE1BQU0sWUFBWSxHQUFHLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sU0FBUyxHQUFHLFdBQVcsR0FBRyxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVk7WUFFakUsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDVCxTQUFTO2dCQUNULFFBQVEsRUFBRSxZQUFZO2dCQUN0QixNQUFNO2dCQUNOLEtBQUs7YUFDTixDQUFDLENBQUM7U0FDSjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBaUI7UUFDL0MsTUFBTSxPQUFPLEdBQXdFLEVBQUUsQ0FBQztRQUN4RixNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTdDLFNBQVM7UUFDVCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDM0IsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDO1FBRWhDLG9CQUFvQjtRQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBRXZDLFNBQVM7WUFDVCxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRXBDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUU3QixPQUFPO1lBQ1AsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNYLElBQUk7Z0JBQ0osR0FBRztnQkFDSCxNQUFNO2dCQUNOLEtBQUs7YUFDTixDQUFDLENBQUM7U0FDSjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLHVCQUF1QixDQUFDLFNBQW9CO1FBY3pELFVBQVU7UUFDVixNQUFNLFFBQVEsR0FBRztZQUNmLEdBQUcsRUFBRSxDQUFDO1lBQ04sRUFBRSxFQUFFLENBQUM7WUFDTCxJQUFJLEVBQUUsQ0FBQztZQUNQLEdBQUcsRUFBRSxDQUFDO1lBQ04sRUFBRSxFQUFFLENBQUMsQ0FBSSxJQUFJO1NBQ2QsQ0FBQztRQUVGLGlCQUFpQjtRQUNqQixNQUFNLE9BQU8sR0FBRztZQUNkLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDbEcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtZQUNqRyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO1lBQ25HLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDbEcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtTQUNsRyxDQUFDO1FBRUYsd0JBQXdCO1FBQ3hCLFNBQVM7UUFDVCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEMsV0FBVztRQUNYLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEQsOENBQThDO1FBQzlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQzNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFaEUsbUJBQW1CO1FBQ25CLFNBQVM7UUFDVCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFMUMsU0FBUztRQUNULE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMvQyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDakQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUvQyx3REFBd0Q7UUFDeEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXO1FBQ3ZFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTFELG9CQUFvQjtRQUNwQixTQUFTO1FBQ1QsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTNDLFNBQVM7UUFDVCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdkQsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVc7UUFDNUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUvRCw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUxRCxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRCwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV4RCxjQUFjO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLO1lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSztZQUM1RCxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUN6RixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDbEUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDakcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLO1lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQzdGLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSztZQUM1RCxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUV6RixlQUFlO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFMUQsa0JBQWtCO1FBQ2xCLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDakMsUUFBUSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMvQixRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDakMsUUFBUSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUUvQixPQUFPO1FBQ1AsT0FBTztZQUNMLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztZQUNqQixFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDZixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDbkIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHO1lBQ2pCLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNmLE9BQU87U0FDUixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLE9BQVksRUFBRSxRQUFnQjtRQUM1RixJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFFcEIsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7Z0JBQUMsTUFBTTtZQUNoRCxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7Z0JBQUMsTUFBTTtZQUMvQyxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7Z0JBQUMsTUFBTTtZQUNqRCxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7Z0JBQUMsTUFBTTtZQUNoRCxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7Z0JBQUMsTUFBTTtTQUNoRDtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxPQUFpQixFQUFFLFVBQWtCLEVBQUUsT0FBWTtRQUMxRixJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFN0MsYUFBYTtRQUNiLGNBQWM7UUFDZCxpQkFBaUI7UUFDakIscUJBQXFCO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUvQixtQkFBbUI7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUM3QixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUMxQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDN0Q7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLDhCQUE4QixDQUFDLFdBQW1CLEVBQUUsT0FBWTtRQUM3RSxlQUFlO1FBQ2Ysb0RBQW9EO1FBQ3BELG9EQUFvRDtRQUNwRCxvREFBb0Q7UUFDcEQsb0RBQW9EO1FBRXBELElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUNsQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUNoQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDakMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUNoQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDaEMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUNoQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUNqQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUNqQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLHFCQUFxQixDQUFDLFdBQW1CLEVBQUUsT0FBWTtRQUNwRSxXQUFXO1FBQ1gsOEJBQThCO1FBQzlCLDhCQUE4QjtRQUM5Qiw4QkFBOEI7UUFDOUIsOEJBQThCO1FBRTlCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTTtZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNO1NBQ3pDO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELEtBQUs7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNO1lBQ3hDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU07U0FDeEM7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU07WUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTTtTQUMxQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTTtZQUN6QyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNO1NBQ3hDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsOEJBQThCLENBQUMsU0FBb0IsRUFBRSxPQUFZO1FBQzlFLFNBQVM7UUFDVCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLFNBQVM7UUFDVCxJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRSxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsK0JBQStCLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxPQUFZO1FBQ3ZGLHFDQUFxQztRQUNyQyxNQUFNLFlBQVksR0FBcUQ7WUFDckUsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1NBQ2hDLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMvRDtJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssTUFBTSxDQUFDLDRCQUE0QixDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFBRSxPQUFZO1FBQzFILE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEQsUUFBUTtRQUNSLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVO1NBQ3pFO1FBRUQsUUFBUTtRQUNSLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEVBQUU7WUFDWixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVO1NBQzFFO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFpQixFQUFFLFVBQWtCLEVBQUUsV0FBb0Q7UUFDdkgsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRTdDLGFBQWE7UUFDYixjQUFjO1FBQ2QsaUJBQWlCO1FBQ2pCLHFCQUFxQjtRQUNyQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0IsbUJBQW1CO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDbEQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxNQUFNLENBQUMseUJBQXlCLENBQUMsT0FBaUIsRUFBRSxVQUFrQixFQUFFLFdBQW9EO1FBQ2xJLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFaEQsYUFBYTtRQUNiLGNBQWM7UUFDZCxpQkFBaUI7UUFDakIscUJBQXFCO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUvQixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFNUIsbUJBQW1CO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsbUJBQW1CLENBQUMsV0FBbUIsRUFBRSxRQUE0RTtRQUNsSSxlQUFlO1FBQ2YscUNBQXFDO1FBQ3JDLHFDQUFxQztRQUNyQyxxQ0FBcUM7UUFDckMscUNBQXFDO1FBRXJDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQ3pCLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUMzQjthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzFCLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUMxQjthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzFCLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUM1QjthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsUUFBUSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzNCLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztTQUMxQjtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyw4QkFBOEIsQ0FDM0MsV0FBbUIsRUFDbkIsUUFBNEUsRUFDNUUsT0FBWTtRQUVaLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixNQUFNLFdBQVcsR0FBeUMsRUFBRSxDQUFDO1FBRTdELElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QyxLQUFLO1lBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNkLFFBQVEsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUU5QyxRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDMUIsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsS0FBSztZQUNMLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDZCxRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDMUIsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFOUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQ3pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELEtBQUs7WUFDTCxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2QsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzFCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTlDLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLO1lBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNkLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSztZQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUU5QyxRQUFRLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDL0M7UUFFRCxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQW9CLEVBQUUsUUFBNEU7UUFDbkksU0FBUztRQUNULE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFMUMsU0FBUztRQUNULElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXZELG9CQUFvQjtRQUNwQixnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsOEJBQThCLENBQzNDLFNBQW9CLEVBQ3BCLFFBQTRFLEVBQzVFLE9BQVk7UUFFWixTQUFTO1FBQ1QsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUUxQyxNQUFNLFlBQVksR0FBd0UsRUFBRSxDQUFDO1FBRTdGLFNBQVM7UUFDVCxJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLCtCQUErQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVoRixvQkFBb0I7UUFDcEIsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRTFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ3hELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFhLEVBQUUsS0FBYSxFQUFFLFFBQTRFO1FBQzVJLHFDQUFxQztRQUNyQyxNQUFNLFlBQVksR0FBcUQ7WUFDckUsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1NBQ2hDLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLFFBQVEsTUFBTSxFQUFFO2dCQUNkLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2dCQUN2QyxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDdEMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ3hDLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2dCQUN2QyxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTthQUN2QztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLE1BQU0sQ0FBQywrQkFBK0IsQ0FDNUMsS0FBYSxFQUNiLEtBQWEsRUFDYixRQUE0RSxFQUM1RSxZQUFpRjtRQUVqRixxQ0FBcUM7UUFDckMsTUFBTSxjQUFjLEdBQXFEO1lBQ3ZFLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztZQUMvQixJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7WUFDL0IsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1lBQy9CLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztTQUNoQyxDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2QixNQUFNLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxRQUFRLE1BQU0sRUFBRTtnQkFDZCxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07Z0JBQ3RDLEtBQUssR0FBRztvQkFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztvQkFBQyxNQUFNO2dCQUN4QyxLQUFLLEdBQUc7b0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxHQUFHO29CQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO29CQUFDLE1BQU07YUFDdkM7WUFFRCxTQUFTO1lBQ1QsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDaEIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztnQkFDckIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFDbkUsUUFBNEU7UUFDMUcsUUFBUTtRQUNSLFVBQVU7UUFDVixVQUFVO1FBQ1YsVUFBVTtRQUNWLFVBQVU7UUFFVixNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRELFFBQVE7UUFDUixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxPQUFPLEtBQUssR0FBRztnQkFBRSxRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFVBQVU7aUJBQy9DLElBQUksT0FBTyxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUM7aUJBQ3hDLElBQUksT0FBTyxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7aUJBQzFDLElBQUksT0FBTyxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7U0FDL0M7UUFFRCxRQUFRO1FBQ1IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksUUFBUSxLQUFLLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVO2lCQUMvQyxJQUFJLFFBQVEsS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO2lCQUMxQyxJQUFJLFFBQVEsS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO2lCQUMxQyxJQUFJLFFBQVEsS0FBSyxHQUFHO2dCQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO1NBQ2pEO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ssTUFBTSxDQUFDLDRCQUE0QixDQUN6QyxPQUFlLEVBQ2YsT0FBZSxFQUNmLE9BQWUsRUFDZixPQUFlLEVBQ2YsUUFBNEUsRUFDNUUsWUFBaUY7UUFFakYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxRQUFRO1FBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxJQUFJLE9BQU8sRUFBRTtZQUNYLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVU7WUFDN0IsSUFBSSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBRWpDLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDbkIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQzlFLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO2FBQ3ZCO2lCQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQzlFLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO2FBQ3RCO2lCQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQzlFLFFBQVEsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO2FBQ3hCO2lCQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQzlFLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO2FBQ3ZCO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDaEIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osS0FBSyxFQUFFLGFBQWE7Z0JBQ3BCLE1BQU0sRUFBRSxPQUFPO2dCQUNmLEtBQUssRUFBRSxLQUFLO2FBQ2IsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxRQUFRO1FBQ1IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVU7WUFDN0IsSUFBSSxjQUFjLEdBQWEsRUFBRSxDQUFDO1lBRWxDLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDcEIsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQy9FLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDO2FBQ3RCO2lCQUFNLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQy9FLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO2FBQ3ZCO2lCQUFNLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQy9FLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO2FBQ3ZCO2lCQUFNLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFhLENBQUM7Z0JBQy9FLFFBQVEsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO2FBQ3hCO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDaEIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osS0FBSyxFQUFFLGNBQWM7Z0JBQ3JCLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixLQUFLLEVBQUUsS0FBSzthQUNiLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFlLEVBQUUsUUFBa0I7UUFDNUQsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFhO1FBQ3pDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFdEIsMENBQTBDO1FBQzFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQzNELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQzNELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQzNELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQzNELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBRTNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsc0JBQXNCLENBQUMsU0FBb0I7UUFheEQsWUFBWTtRQUNaLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0Qyx3REFBd0Q7UUFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxTQUFTO1FBQ1QsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLFlBQVk7UUFDWixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDtRQUVELFlBQVk7UUFDWixNQUFNLE9BQU8sR0FBRztZQUNkLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUN0QyxNQUFNO1lBQ04sU0FBUyxFQUFFLEVBQUU7WUFDYixZQUFZLEVBQUUsRUFBRTtZQUNoQixXQUFXLEVBQUUsRUFBRTtZQUNmLFdBQVcsRUFBRSxFQUFFO1lBQ2YsZUFBZSxFQUFFLEVBQUU7WUFDbkIsVUFBVSxFQUFFLENBQUM7U0FDZCxDQUFDO1FBRUYsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTztRQUM1QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7UUFFOUIsU0FBUztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sU0FBUyxDQUFDLENBQUM7UUFFekMsVUFBVTtRQUNWLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUNsQixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQzthQUNuQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztTQUNGO2FBQU0sSUFBSSxNQUFNLEtBQUssR0FBRyxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUYsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7YUFDbkM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDdkIsT0FBTyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7YUFDcEM7U0FDRjthQUFNLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN6QixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQzthQUNuQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2QixPQUFPLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQzthQUNwQztTQUNGO2FBQU0sSUFBSSxNQUFNLEtBQUssR0FBRyxFQUFFO1lBQ3pCLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO2FBQ25DO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO2FBQ3BDO1NBQ0Y7UUFFRCxjQUFjO1FBQ2QsSUFBSSxrQkFBa0IsR0FBYSxFQUFFLENBQUM7UUFFdEMsV0FBVztRQUNYLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM1RSxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxJQUFJLGNBQWMsY0FBYyxDQUFDLENBQUM7U0FDeEU7YUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksY0FBYyxXQUFXLENBQUMsQ0FBQztTQUNyRTthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxjQUFjLFdBQVcsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsV0FBVztRQUNYLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUM5RSxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLGVBQWUsY0FBYyxDQUFDLENBQUM7U0FDMUU7YUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3pELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksZUFBZSxXQUFXLENBQUMsQ0FBQztTQUN2RTthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDdEQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxlQUFlLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsV0FBVztRQUNYLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM1RSxpQkFBaUIsSUFBSSxDQUFDLENBQUM7WUFDdkIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxJQUFJLGNBQWMsY0FBYyxDQUFDLENBQUM7U0FDeEU7YUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3hELGlCQUFpQixJQUFJLENBQUMsQ0FBQztZQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksY0FBYyxXQUFXLENBQUMsQ0FBQztTQUNyRTthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxjQUFjLFdBQVcsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsZ0JBQWdCO1FBQ2hCLElBQUksa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBRXRDLFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkQsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLEVBQUU7Z0JBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3RELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNsRSxpQkFBaUIsSUFBSSxHQUFHLENBQUM7b0JBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsS0FBSyxHQUFHLElBQUksU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUMvRTtxQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUNuRCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7b0JBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsS0FBSyxHQUFHLElBQUksU0FBUyxXQUFXLENBQUMsQ0FBQztpQkFDMUU7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDaEQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzFFO2FBQ0Y7U0FDRjtRQUVELFNBQVM7UUFDVCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDckQsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUU7Z0JBQzlCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3RELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNsRSxpQkFBaUIsSUFBSSxHQUFHLENBQUM7b0JBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsS0FBSyxHQUFHLElBQUksU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUNoRjtxQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUNuRCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7b0JBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsS0FBSyxHQUFHLElBQUksU0FBUyxXQUFXLENBQUMsQ0FBQztpQkFDM0U7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDaEQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzNFO2FBQ0Y7U0FDRjtRQUVELFNBQVM7UUFDVCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDakQsS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3RELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNsRSxpQkFBaUIsSUFBSSxHQUFHLENBQUM7b0JBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsS0FBSyxHQUFHLElBQUksU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUM5RTtxQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUNuRCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7b0JBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsS0FBSyxHQUFHLElBQUksU0FBUyxXQUFXLENBQUMsQ0FBQztpQkFDekU7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDaEQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQ3pFO2FBQ0Y7U0FDRjtRQUVELFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkQsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLEVBQUU7Z0JBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3RELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNsRSxpQkFBaUIsSUFBSSxHQUFHLENBQUM7b0JBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsS0FBSyxHQUFHLElBQUksU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUMvRTtxQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUNuRCxpQkFBaUIsSUFBSSxDQUFDLENBQUM7b0JBQ3ZCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsS0FBSyxHQUFHLElBQUksU0FBUyxXQUFXLENBQUMsQ0FBQztpQkFDMUU7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDaEQsaUJBQWlCLElBQUksQ0FBQyxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEtBQUssR0FBRyxJQUFJLFNBQVMsV0FBVyxDQUFDLENBQUM7aUJBQzFFO2FBQ0Y7U0FDRjtRQUVELE9BQU8sQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5ELFlBQVk7UUFDWixJQUFJLHNCQUFzQixHQUFhLEVBQUUsQ0FBQztRQUUxQyxRQUFRO1FBQ1IsTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTdCLElBQUksT0FBTyxFQUFFO1lBQ1gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXZELFlBQVk7WUFDWixJQUFJLGFBQWEsR0FBYSxFQUFFLENBQUM7WUFDakMsSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUNuQixhQUFhLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RTtpQkFBTSxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO2lCQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsYUFBYSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEU7aUJBQU0sSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUMxQixhQUFhLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RTtZQUVELElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN0RSxxQkFBcUIsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxhQUFhLENBQUMsQ0FBQzthQUNyRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNyRCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxhQUFhLENBQUMsQ0FBQzthQUNqRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNsRCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxhQUFhLENBQUMsQ0FBQzthQUNqRjtTQUNGO1FBRUQsUUFBUTtRQUNSLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFOUIsSUFBSSxRQUFRLEVBQUU7WUFDWixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEQsWUFBWTtZQUNaLElBQUksY0FBYyxHQUFhLEVBQUUsQ0FBQztZQUNsQyxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQ3BCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO2lCQUFNLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkU7aUJBQU0sSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFO2dCQUMzQixjQUFjLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RTtpQkFBTSxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBRUQsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3hFLHFCQUFxQixJQUFJLEdBQUcsQ0FBQztnQkFDN0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxRQUFRLGVBQWUsQ0FBQyxDQUFDO2FBQ3pGO2lCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQ3RELHFCQUFxQixJQUFJLEdBQUcsQ0FBQztnQkFDN0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxRQUFRLGVBQWUsQ0FBQyxDQUFDO2FBQ3JGO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQ25ELHFCQUFxQixJQUFJLEdBQUcsQ0FBQztnQkFDN0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxRQUFRLGVBQWUsQ0FBQyxDQUFDO2FBQ3JGO1NBQ0Y7UUFFRCxPQUFPO1FBQ1AsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLEtBQUssRUFBRTtZQUNULE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN0RCxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDdEUscUJBQXFCLElBQUksQ0FBQyxDQUFDO2dCQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLGFBQWEsQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQ3JELHFCQUFxQixJQUFJLENBQUMsQ0FBQztnQkFDM0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxhQUFhLENBQUMsQ0FBQzthQUNwRDtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNsRCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssYUFBYSxDQUFDLENBQUM7YUFDcEQ7U0FDRjtRQUVELFNBQVM7UUFDVCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFNUUsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUUscUJBQXFCLElBQUksQ0FBQyxDQUFDO1lBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLFFBQVEsZUFBZSxDQUFDLENBQUM7U0FDOUQ7YUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3hELHFCQUFxQixJQUFJLENBQUMsQ0FBQztZQUMzQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxRQUFRLGFBQWEsQ0FBQyxDQUFDO1NBQzVEO2FBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNyRCxxQkFBcUIsSUFBSSxDQUFDLENBQUM7WUFDM0Isc0JBQXNCLENBQUMsSUFBSSxDQUFDLFFBQVEsUUFBUSxhQUFhLENBQUMsQ0FBQztTQUM1RDtRQUVELE9BQU8sQ0FBQyxlQUFlLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNELE9BQU87UUFDUCxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsaUJBQWlCLEdBQUcsaUJBQWlCLEdBQUcscUJBQXFCLENBQUM7UUFDOUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFaEMsYUFBYTtRQUNiLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLFVBQVUsSUFBSSxFQUFFLEVBQUU7WUFDcEIsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO2FBQU0sSUFBSSxVQUFVLElBQUksRUFBRSxFQUFFO1lBQzNCLE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRTtZQUMxQixNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7YUFBTSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQUU7WUFDMUIsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO2FBQU0sSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDM0IsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO2FBQU0sSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO2FBQU07WUFDTCxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPO1lBQ0wsTUFBTTtZQUNOLE9BQU87U0FDUixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQWtCO1FBQzVDLGtDQUFrQztRQUNsQyxNQUFNLGFBQWEsR0FBRztZQUNwQixFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNyQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNyQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNyQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztTQUN0QyxDQUFDO1FBRUYsS0FBSyxNQUFNLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLGFBQWEsRUFBRTtZQUMzQyxZQUFZO1lBQ1osTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUU1RSxpQkFBaUI7WUFDakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFaEQsSUFBSSxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLGlCQUFpQjtnQkFDL0MsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBaUI7UUFDN0MsUUFBUSxTQUFTLEVBQUU7WUFDakIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFrQjtRQUM3QyxzQ0FBc0M7UUFDdEMsTUFBTSxjQUFjLEdBQUc7WUFDckIsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDckMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7U0FDdEMsQ0FBQztRQUVGLEtBQUssTUFBTSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxjQUFjLEVBQUU7WUFDNUMsWUFBWTtZQUNaLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFNUUsaUJBQWlCO1lBQ2pCLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELElBQUksY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxpQkFBaUI7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsZUFBZSxDQUFDLFVBQWtCO1FBQy9DLFFBQVEsVUFBVSxFQUFFO1lBQ2xCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBZTtRQUN4QyxnQ0FBZ0M7UUFDaEMsTUFBTSxZQUFZLEdBQUc7WUFDbkIsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ2hDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1NBQ2pDLENBQUM7UUFFRixLQUFLLE1BQU0sRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksWUFBWSxFQUFFO1lBQzFDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDekMsSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQzNDO1lBRUQsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFnQjtRQUMzQyxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBa0I7UUFDMUMsbUNBQW1DO1FBQ25DLE1BQU0sYUFBYSxHQUFHO1lBQ3BCLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1lBQ2hDLEVBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUM7WUFDaEMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQztZQUNoQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1NBQ2pDLENBQUM7UUFFRixLQUFLLE1BQU0sRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksYUFBYSxFQUFFO1lBQzNDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQzdCLElBQUksTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDM0MsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQzdDO1lBRUQsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFpQjtRQUM3QyxRQUFRLFNBQVMsRUFBRTtZQUNqQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQztZQUNyQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDckIsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBSUQ7Ozs7T0FJRztJQUNLLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFvQjtRQU9sRCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7UUFDN0IsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO1FBRWpDLFNBQVM7UUFDVCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLHVCQUF1QjtRQUN2QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDthQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2Q7YUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEQsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDZDtRQUVELE9BQU87UUFDUCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQzVDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFO1lBQzdDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQzVDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQy9CLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQy9CLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN2QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRTtZQUN6QyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNyQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN2QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzlCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzlCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM1QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzdCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM1QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSztRQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDeEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDdkMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFO1lBQzFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDL0IsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN2QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRTtZQUN6QyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNyQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUN2QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsTUFBTTtRQUNOLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDekMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDM0MsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7WUFDekMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDMUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMzQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDMUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUs7UUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0IsV0FBVyxDQUFDLElB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Q0FBQyxFQUFFO1lBQy9CLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxD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LFNBQVMsQ0FBQyxFQUFFO1lBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxLQUFLO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDL0IsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMs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QUksRUFBRSxHQUFHLEVBQUUsSUFBSTtnQkFDckQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzthQUNuQjtZQUNELElBQUksRUFBRTtnQkFDSixHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJO2dCQUNyRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2FBQ25CO1lBQ0QsR0FBRyxFQUFFO2dCQUNILEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7Z0JBQ3JELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7YUFDbkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSTtnQkFDckQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzthQUNuQjtZQUNELEdBQUcsRUFBRTtnQkFDSCxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJO2dCQUNyRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2FBQ25CO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7Z0JBQ3JELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7YUFDbkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSTtnQkFDckQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzthQUNuQjtZQUNELEdBQUcsRUFBRTtnQkFDSCxHQUFHLEVBQUUs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LEdBQUc7WUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFNBQVMsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDMUMsSUFBSSxTQUFTLEtBQUssR0FBRztZQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzFDLElBQUksU0FBUyxLQUFLLEdBQUc7WUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFNBQVMsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFFMUMsSUFBSSxVQUFVLEtBQUssR0FBRztZQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNDLElBQUksVUFBVSxLQUFLLEdBQUc7WUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMzQyxJQUFJLFVBQVUsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDM0MsSUFBSSxVQUFVLEtBQUssR0FBRztZQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNDLElBQUksVUFBVSxLQUFLLEdBQUc7WUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUUzQyxPQUFPO1FBQ1AsSUFBSSxnQkFBZ0IsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakQsSUFBSSxnQkFBZ0IsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakQsSUFBSSxnQkFBZ0IsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakQsSUFBSSxnQkFBZ0IsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDakQsSUFBSSxnQkFBZ0IsS0FBSyxHQUFHO1lBQUUsV0FBVyxDQUFDLEdBQUcs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RUFBRSxDQUFDOzs7OztHQUtsQixDQUFDLENBQUMsQ0FBQyxFQUFFOztJQUVKLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztxRUFDaUIsRUFBRTs7Ozs7O1lBTTNELFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzs7O1lBSTFELFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7dURBQ2lCLEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLE1BQU07V0FDbEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Ozs7O0dBS2xCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7bUJBSVcsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07b0JBQ2pHLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO2tCQUNqRyxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzttQkFDOUYsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7d0JBQzFGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7MEJBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7MEJBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7eUJBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7OztPQUd2RCxDQUFDO0lBQ04sQ0FBQztJQUNEOzs7O09BSUc7SUFDSyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQWM7UUFDMUMscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsTUFBTSxHQUFHLEdBQTRCO1lBQ25DLEdBQUcsRUFBRSxLQUFLO1lBQ1YsR0FBRyxFQUFFLElBQUk7WUFDVCxHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRSxLQUFLO1lBQ1YsR0FBRyxFQUFFLElBQUk7U0FDVixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7WUFDckIsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNqQjtTQUNGO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb2xhciwgTHVuYXIsIEVpZ2h0Q2hhciB9IGZyb20gJ2x1bmFyLXR5cGVzY3JpcHQnO1xuXG4vKipcbiAqIOWFq+Wtl+acjeWKoeexu++8jOWwgeijhWx1bmFyLXR5cGVzY3JpcHTnmoTlhavlrZflip/og71cbiAqL1xuZXhwb3J0IGNsYXNzIEJhemlTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIOS7juWFrOWOhuaXpeacn+iOt+WPluWFq+Wtl+S/oeaBr1xuICAgKiBAcGFyYW0geWVhciDlubRcbiAgICogQHBhcmFtIG1vbnRoIOaciFxuICAgKiBAcGFyYW0gZGF5IOaXpVxuICAgKiBAcGFyYW0gaG91ciDml7bvvIgwLTIz77yJXG4gICAqIEByZXR1cm5zIOWFq+Wtl+S/oeaBr+WvueixoVxuICAgKi9cbiAgc3RhdGljIGdldEJhemlGcm9tRGF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCBob3VyOiBudW1iZXIgPSAwLCBnZW5kZXI6IHN0cmluZyA9ICcxJywgc2VjdDogc3RyaW5nID0gJzInKTogQmF6aUluZm8ge1xuICAgIC8vIOWIm+W7uumYs+WOhuWvueixoVxuICAgIGNvbnN0IHNvbGFyID0gU29sYXIuZnJvbVltZEhtcyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCAwLCAwKTtcbiAgICAvLyDovazmjaLkuLrlhpzljoZcbiAgICBjb25zdCBsdW5hciA9IHNvbGFyLmdldEx1bmFyKCk7XG4gICAgLy8g6I635Y+W5YWr5a2XXG4gICAgY29uc3QgZWlnaHRDaGFyID0gbHVuYXIuZ2V0RWlnaHRDaGFyKCk7XG5cbiAgICByZXR1cm4gdGhpcy5mb3JtYXRCYXppSW5mbyhzb2xhciwgbHVuYXIsIGVpZ2h0Q2hhciwgZ2VuZGVyLCBzZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDku47lhpzljobml6XmnJ/ojrflj5blhavlrZfkv6Hmga9cbiAgICogQHBhcmFtIHllYXIg5Yac5Y6G5bm0XG4gICAqIEBwYXJhbSBtb250aCDlhpzljobmnIhcbiAgICogQHBhcmFtIGRheSDlhpzljobml6VcbiAgICogQHBhcmFtIGhvdXIg5pe277yIMC0yM++8iVxuICAgKiBAcGFyYW0gaXNMZWFwTW9udGgg5piv5ZCm6Zew5pyIXG4gICAqIEByZXR1cm5zIOWFq+Wtl+S/oeaBr+WvueixoVxuICAgKi9cbiAgc3RhdGljIGdldEJhemlGcm9tTHVuYXJEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciA9IDAsIGlzTGVhcE1vbnRoOiBib29sZWFuID0gZmFsc2UsIGdlbmRlcjogc3RyaW5nID0gJzEnLCBzZWN0OiBzdHJpbmcgPSAnMicpOiBCYXppSW5mbyB7XG4gICAgLy8g5Yib5bu65Yac5Y6G5a+56LGhXG4gICAgLy8gTHVuYXIuZnJvbVltZEhtc+WPquaOpeWPlzbkuKrlj4LmlbDvvIzkuI3mlK/mjIFpc0xlYXBNb250aOWPguaVsFxuICAgIC8vIOmcgOimgeS9v+eUqOWFtuS7luaWueazleWkhOeQhumXsOaciFxuICAgIGxldCBsdW5hcjtcbiAgICBpZiAoaXNMZWFwTW9udGgpIHtcbiAgICAgIC8vIOWvueS6jumXsOaciO+8jOaIkeS7rOmcgOimgeS9v+eUqOWFtuS7luaWueazlVxuICAgICAgLy8g6L+Z6YeM566A5YyW5aSE55CG77yM5a6e6ZmF5bqU55So5Lit5Y+v6IO96ZyA6KaB5pu05aSN5p2C55qE6YC76L6RXG4gICAgICBsdW5hciA9IEx1bmFyLmZyb21ZbWQoeWVhciwgbW9udGgsIGRheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGx1bmFyID0gTHVuYXIuZnJvbVltZEhtcyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCAwLCAwKTtcbiAgICB9XG4gICAgLy8g6L2s5o2i5Li66Ziz5Y6GXG4gICAgY29uc3Qgc29sYXIgPSBsdW5hci5nZXRTb2xhcigpO1xuICAgIC8vIOiOt+WPluWFq+Wtl1xuICAgIGNvbnN0IGVpZ2h0Q2hhciA9IGx1bmFyLmdldEVpZ2h0Q2hhcigpO1xuXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0QmF6aUluZm8oc29sYXIsIGx1bmFyLCBlaWdodENoYXIsIGdlbmRlciwgc2VjdCk7XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q5YWr5a2X5a2X56ym5LiyXG4gICAqIEBwYXJhbSBiYXppU3RyIOWFq+Wtl+Wtl+espuS4su+8jOWmglwi55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vXCJcbiAgICogQHJldHVybnMg5YWr5a2X5L+h5oGv5a+56LGhXG4gICAqL1xuICBzdGF0aWMgcGFyc2VCYXppU3RyaW5nKGJhemlTdHI6IHN0cmluZywgZ2VuZGVyOiBzdHJpbmcgPSAnMScsIHNlY3Q6IHN0cmluZyA9ICcyJyk6IEJhemlJbmZvIHtcbiAgICAvLyDmuIXnkIblubbliIblibLlhavlrZflrZfnrKbkuLJcbiAgICBjb25zdCBwYXJ0cyA9IGJhemlTdHIucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKS5zcGxpdCgnICcpO1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCflhavlrZfmoLzlvI/kuI3mraPnoa7vvIzlupTkuLpcIuW5tOafsSDmnIjmn7Eg5pel5p+xIOaXtuafsVwi55qE5qC85byP77yM5aaCXCLnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja9cIicpO1xuICAgIH1cblxuICAgIC8vIOaPkOWPluWkqeW5suWcsOaUr1xuICAgIGNvbnN0IHllYXJTdGVtID0gcGFydHNbMF1bMF07XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IHBhcnRzWzBdWzFdO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IHBhcnRzWzFdWzBdO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gcGFydHNbMV1bMV07XG4gICAgY29uc3QgZGF5U3RlbSA9IHBhcnRzWzJdWzBdO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IHBhcnRzWzJdWzFdO1xuICAgIGNvbnN0IGhvdXJTdGVtID0gcGFydHNbM11bMF07XG4gICAgY29uc3QgaG91ckJyYW5jaCA9IHBhcnRzWzNdWzFdO1xuXG4gICAgLy8g6K6h566X5LqU6KGMXG4gICAgY29uc3QgeWVhcld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh5ZWFyU3RlbSk7XG4gICAgY29uc3QgbW9udGhXdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcobW9udGhTdGVtKTtcbiAgICBjb25zdCBkYXlXdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSk7XG4gICAgY29uc3QgaG91cld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhob3VyU3RlbSk7XG5cbiAgICAvLyDorqHnrpfnurPpn7NcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSB0aGlzLmdldE5hWWluKHllYXJTdGVtICsgeWVhckJyYW5jaCk7XG4gICAgY29uc3QgbW9udGhOYVlpbiA9IHRoaXMuZ2V0TmFZaW4obW9udGhTdGVtICsgbW9udGhCcmFuY2gpO1xuICAgIGNvbnN0IGRheU5hWWluID0gdGhpcy5nZXROYVlpbihkYXlTdGVtICsgZGF5QnJhbmNoKTtcbiAgICBjb25zdCBob3VyTmFZaW4gPSB0aGlzLmdldE5hWWluKGhvdXJTdGVtICsgaG91ckJyYW5jaCk7XG5cbiAgICAvLyDlsJ3or5Xlj43mjqjml6XmnJ9cbiAgICBsZXQgc29sYXJEYXRlID0gJy0tLS3lubQtLeaciC0t5pelJztcbiAgICBsZXQgbHVuYXJEYXRlID0gJ+WGnOWOhi0tLS3lubQtLeaciC0t5pelJztcbiAgICBsZXQgc29sYXJUaW1lID0gJy0tOi0tJztcbiAgICBsZXQgc29sYXI6IFNvbGFyIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGx1bmFyOiBMdW5hciB8IG51bGwgPSBudWxsO1xuICAgIGxldCBlaWdodENoYXI6IEVpZ2h0Q2hhciB8IG51bGwgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIOS9v+eUqGx1bmFyLXR5cGVzY3JpcHTlupPlj43mjqjml6XmnJ9cbiAgICAgIC8vIOazqOaEj++8mui/memHjOWPquaYr+S4gOS4quS8sOeul++8jOWboOS4uuWQjOS4gOWFq+Wtl+WPr+iDveWvueW6lOWkmuS4quaXpeacn1xuICAgICAgLy8g5oiR5Lus5Y+W5pyA6L+R55qE5LiA5Liq5Y+v6IO955qE5pel5pyfXG5cbiAgICAgIC8vIDEuIOS7juW5tOafseS8sOeul+W5tOS7vVxuICAgICAgY29uc3QgY3VycmVudFllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7XG4gICAgICBjb25zdCBzdGFydFllYXIgPSBjdXJyZW50WWVhciAtIDgwOyAvLyDku444MOW5tOWJjeW8gOWni+afpeaJvlxuICAgICAgY29uc3QgZW5kWWVhciA9IGN1cnJlbnRZZWFyICsgMjA7ICAgLy8g5p+l5om+5YiwMjDlubTlkI5cblxuICAgICAgLy8g5aSp5bmy5bqP5Y+377yI55SyPTAsIOS5mT0xLCAuLi4sIOeZuD0577yJXG4gICAgICBjb25zdCBzdGVtSW5kZXggPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiLmluZGV4T2YoeWVhclN0ZW0pO1xuICAgICAgLy8g5Zyw5pSv5bqP5Y+377yI5a2QPTAsIOS4kT0xLCAuLi4sIOS6pT0xMe+8iVxuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSBcIuWtkOS4keWvheWNr+i+sOW3s+WNiOacqueUs+mFieaIjOS6pVwiLmluZGV4T2YoeWVhckJyYW5jaCk7XG5cbiAgICAgIC8vIOafpeaJvuespuWQiOW5tOafseeahOW5tOS7vVxuICAgICAgbGV0IG1hdGNoaW5nWWVhcnM6IG51bWJlcltdID0gW107XG4gICAgICBmb3IgKGxldCB5ZWFyID0gc3RhcnRZZWFyOyB5ZWFyIDw9IGVuZFllYXI7IHllYXIrKykge1xuICAgICAgICAvLyDorqHnrpflpKnlubLluo/lj7fvvJrlubTku73lh4/ljrs077yM6Zmk5LulMTDnmoTkvZnmlbBcbiAgICAgICAgY29uc3Qgc3RlbUNoZWNrID0gKHllYXIgLSA0KSAlIDEwO1xuICAgICAgICAvLyDorqHnrpflnLDmlK/luo/lj7fvvJrlubTku73lh4/ljrs077yM6Zmk5LulMTLnmoTkvZnmlbBcbiAgICAgICAgY29uc3QgYnJhbmNoQ2hlY2sgPSAoeWVhciAtIDQpICUgMTI7XG5cbiAgICAgICAgaWYgKHN0ZW1DaGVjayA9PT0gc3RlbUluZGV4ICYmIGJyYW5jaENoZWNrID09PSBicmFuY2hJbmRleCkge1xuICAgICAgICAgIG1hdGNoaW5nWWVhcnMucHVzaCh5ZWFyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2hpbmdZZWFycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIOWPluacgOi/keeahOW5tOS7vVxuICAgICAgICBjb25zdCB5ZWFyID0gbWF0Y2hpbmdZZWFyc1ttYXRjaGluZ1llYXJzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIC8vIDIuIOS7juaciOafseS8sOeul+aciOS7vVxuICAgICAgICAvLyDlnLDmlK/lr7nlupTnmoTmnIjku73vvIjlr4U9MeaciCwg5Y2vPTLmnIgsIC4uLiwg5LiRPTEy5pyI77yJXG4gICAgICAgIGNvbnN0IG1vbnRoTWFwOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHtcbiAgICAgICAgICAn5a+FJzogMSwgJ+WNryc6IDIsICfovrAnOiAzLCAn5bezJzogNCwgJ+WNiCc6IDUsICfmnKonOiA2LFxuICAgICAgICAgICfnlLMnOiA3LCAn6YWJJzogOCwgJ+aIjCc6IDksICfkuqUnOiAxMCwgJ+WtkCc6IDExLCAn5LiRJzogMTJcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbW9udGggPSBtb250aE1hcFttb250aEJyYW5jaF0gfHwgMTtcblxuICAgICAgICAvLyAzLiDku47ml7bmn7HkvLDnrpflsI/ml7ZcbiAgICAgICAgLy8g5Zyw5pSv5a+55bqU55qE5pe26L6w77yI5a2QPTIzLTHngrksIOS4kT0xLTPngrksIC4uLiwg5LqlPTIxLTIz54K577yJXG4gICAgICAgIGNvbnN0IGhvdXJNYXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1xuICAgICAgICAgICflrZAnOiAwLCAn5LiRJzogMiwgJ+WvhSc6IDQsICflja8nOiA2LCAn6L6wJzogOCwgJ+W3syc6IDEwLFxuICAgICAgICAgICfljYgnOiAxMiwgJ+acqic6IDE0LCAn55SzJzogMTYsICfphYknOiAxOCwgJ+aIjCc6IDIwLCAn5LqlJzogMjJcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaG91ciA9IGhvdXJNYXBbaG91ckJyYW5jaF0gfHwgMDtcblxuICAgICAgICAvLyA0LiDkvb/nlKhsdW5hci10eXBlc2NyaXB05bqT5p+l5om+56ym5ZCI5p2h5Lu255qE5pel5pyfXG4gICAgICAgIC8vIOi/memHjOeugOWMluWkhOeQhu+8jOWPluaciOS4reeahOesrDE15aSpXG4gICAgICAgIGNvbnN0IGRheSA9IDE1O1xuXG4gICAgICAgIC8vIOWIm+W7uumYs+WOhuWvueixoVxuICAgICAgICBzb2xhciA9IFNvbGFyLmZyb21ZbWRIbXMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgMCwgMCk7XG4gICAgICAgIC8vIOi9rOaNouS4uuWGnOWOhlxuICAgICAgICBsdW5hciA9IHNvbGFyLmdldEx1bmFyKCk7XG4gICAgICAgIC8vIOiOt+WPluWFq+Wtl1xuICAgICAgICBlaWdodENoYXIgPSBsdW5hci5nZXRFaWdodENoYXIoKTtcblxuICAgICAgICAvLyDmoLzlvI/ljJbml6XmnJ9cbiAgICAgICAgc29sYXJEYXRlID0gYCR7eWVhcn0tJHttb250aC50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7ZGF5LnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICAgICAgICBsdW5hckRhdGUgPSBsdW5hci50b1N0cmluZygpO1xuICAgICAgICBzb2xhclRpbWUgPSBgJHtob3VyLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06MDBgO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCflj43mjqjml6XmnJ/lh7rplJk6JywgZXJyb3IpO1xuICAgICAgLy8g5Ye66ZSZ5pe25L2/55So6buY6K6k5YC8XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5oiQ5Yqf5Y+N5o6o5LqG5pel5pyf77yM5L2/55SobHVuYXItdHlwZXNjcmlwdOW6k+iOt+WPluabtOWkmuS/oeaBr1xuICAgIGlmIChzb2xhciAmJiBsdW5hciAmJiBlaWdodENoYXIpIHtcbiAgICAgIC8vIOS9v+eUqGZvcm1hdEJhemlJbmZv6I635Y+W5a6M5pW055qE5YWr5a2X5L+h5oGvXG4gICAgICByZXR1cm4gdGhpcy5mb3JtYXRCYXppSW5mbyhzb2xhciwgbHVuYXIsIGVpZ2h0Q2hhciwgZ2VuZGVyLCBzZWN0KTtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpzlj43mjqjlpLHotKXvvIzkvb/nlKjkvKDnu5/mlrnms5XorqHnrpfln7rmnKzkv6Hmga9cbiAgICAvLyDorqHnrpfnibnmrorkv6Hmga9cbiAgICBjb25zdCB0YWlZdWFuID0gdGhpcy5jYWxjdWxhdGVUYWlZdWFuKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpO1xuICAgIGNvbnN0IHRhaVl1YW5OYVlpbiA9IHRoaXMuZ2V0TmFZaW4odGFpWXVhbik7XG4gICAgY29uc3QgbWluZ0dvbmcgPSB0aGlzLmNhbGN1bGF0ZU1pbmdHb25nKGhvdXJTdGVtLCBob3VyQnJhbmNoKTtcbiAgICBjb25zdCBtaW5nR29uZ05hWWluID0gdGhpcy5nZXROYVlpbihtaW5nR29uZyk7XG5cbiAgICAvLyDnlJ/ogpbkv6Hmga9cbiAgICBjb25zdCB5ZWFyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oeWVhckJyYW5jaCk7XG4gICAgY29uc3QgbW9udGhTaGVuZ1hpYW8gPSB0aGlzLmdldFNoZW5nWGlhbyhtb250aEJyYW5jaCk7XG4gICAgY29uc3QgZGF5U2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oZGF5QnJhbmNoKTtcbiAgICBjb25zdCBob3VyU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8oaG91ckJyYW5jaCk7XG5cbiAgICAvLyDliJvlu7rkuIDkuKrln7rmnKznmoRCYXppSW5mb+WvueixoVxuICAgIHJldHVybiB7XG4gICAgICAvLyDln7rmnKzkv6Hmga9cbiAgICAgIHNvbGFyRGF0ZSxcbiAgICAgIGx1bmFyRGF0ZSxcbiAgICAgIHNvbGFyVGltZSxcblxuICAgICAgLy8g5YWr5a2X5L+h5oGvXG4gICAgICB5ZWFyUGlsbGFyOiBwYXJ0c1swXSxcbiAgICAgIHllYXJTdGVtLFxuICAgICAgeWVhckJyYW5jaCxcbiAgICAgIHllYXJIaWRlR2FuOiB0aGlzLmdldEhpZGVHYW4oeWVhckJyYW5jaCksXG4gICAgICB5ZWFyV3VYaW5nLFxuICAgICAgeWVhck5hWWluLFxuICAgICAgeWVhclNoZW5nWGlhbyxcblxuICAgICAgbW9udGhQaWxsYXI6IHBhcnRzWzFdLFxuICAgICAgbW9udGhTdGVtLFxuICAgICAgbW9udGhCcmFuY2gsXG4gICAgICBtb250aEhpZGVHYW46IHRoaXMuZ2V0SGlkZUdhbihtb250aEJyYW5jaCksXG4gICAgICBtb250aFd1WGluZyxcbiAgICAgIG1vbnRoTmFZaW4sXG4gICAgICBtb250aFNoZW5nWGlhbyxcblxuICAgICAgZGF5UGlsbGFyOiBwYXJ0c1syXSxcbiAgICAgIGRheVN0ZW0sXG4gICAgICBkYXlCcmFuY2gsXG4gICAgICBkYXlIaWRlR2FuOiB0aGlzLmdldEhpZGVHYW4oZGF5QnJhbmNoKSxcbiAgICAgIGRheVd1WGluZyxcbiAgICAgIGRheU5hWWluLFxuICAgICAgZGF5U2hlbmdYaWFvLFxuXG4gICAgICBob3VyUGlsbGFyOiBwYXJ0c1szXSxcbiAgICAgIGhvdXJTdGVtLFxuICAgICAgaG91ckJyYW5jaCxcbiAgICAgIGhvdXJIaWRlR2FuOiB0aGlzLmdldEhpZGVHYW4oaG91ckJyYW5jaCksXG4gICAgICBob3VyV3VYaW5nLFxuICAgICAgaG91ck5hWWluLFxuICAgICAgaG91clNoZW5nWGlhbyxcblxuICAgICAgLy8g54m55q6K5L+h5oGvXG4gICAgICB0YWlZdWFuLFxuICAgICAgdGFpWXVhbk5hWWluLFxuICAgICAgbWluZ0dvbmcsXG4gICAgICBtaW5nR29uZ05hWWluLFxuXG4gICAgICAvLyDlrozmlbTkv6Hmga9cbiAgICAgIGZ1bGxTdHJpbmc6IGDlhavlrZfvvJoke3BhcnRzWzBdfSAke3BhcnRzWzFdfSAke3BhcnRzWzJdfSAke3BhcnRzWzNdfWAsXG5cbiAgICAgIC8vIOiuvue9ruS/oeaBr1xuICAgICAgZ2VuZGVyLFxuICAgICAgYmF6aVNlY3Q6IHNlY3RcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKiDorqHnrpfog47lhYNcbiAgICogQHBhcmFtIG1vbnRoU3RlbSDmnIjlubJcbiAgICogQHBhcmFtIG1vbnRoQnJhbmNoIOaciOaUr1xuICAgKiBAcmV0dXJucyDog47lhYPlubLmlK9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVRhaVl1YW4obW9udGhTdGVtOiBzdHJpbmcsIG1vbnRoQnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWkqeW5sumhuuW6j1xuICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICAvLyDlnLDmlK/pobrluo9cbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDorqHnrpfmnIjlubLnmoTntKLlvJVcbiAgICBjb25zdCBzdGVtSW5kZXggPSBzdGVtcy5pbmRleE9mKG1vbnRoU3RlbSk7XG4gICAgLy8g6K6h566X5pyI5pSv55qE57Si5byVXG4gICAgY29uc3QgYnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKG1vbnRoQnJhbmNoKTtcblxuICAgIGlmIChzdGVtSW5kZXggPT09IC0xIHx8IGJyYW5jaEluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIFwi5pyq55+lXCI7XG4gICAgfVxuXG4gICAgLy8g6K6h566X6IOO5YWD5bmy77yI5pyI5bmyICsgNe+8jOi2hei/hzEw5YiZ5YePMTDvvIlcbiAgICBjb25zdCB0YWlZdWFuU3RlbUluZGV4ID0gKHN0ZW1JbmRleCArIDUpICUgMTA7XG4gICAgLy8g6K6h566X6IOO5YWD5pSv77yI5pyI5pSvICsgM++8jOi2hei/hzEy5YiZ5YePMTLvvIlcbiAgICBjb25zdCB0YWlZdWFuQnJhbmNoSW5kZXggPSAoYnJhbmNoSW5kZXggKyAzKSAlIDEyO1xuXG4gICAgLy8g57uE5ZCI6IOO5YWD5bmy5pSvXG4gICAgcmV0dXJuIHN0ZW1zW3RhaVl1YW5TdGVtSW5kZXhdICsgYnJhbmNoZXNbdGFpWXVhbkJyYW5jaEluZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpflkb3lrqtcbiAgICogQHBhcmFtIGhvdXJTdGVtIOaXtuW5slxuICAgKiBAcGFyYW0gaG91ckJyYW5jaCDml7bmlK9cbiAgICogQHJldHVybnMg5ZG95a6r5bmy5pSvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVNaW5nR29uZyhob3VyU3RlbTogc3RyaW5nLCBob3VyQnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWkqeW5sumhuuW6j1xuICAgIGNvbnN0IHN0ZW1zID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIjtcbiAgICAvLyDlnLDmlK/pobrluo9cbiAgICBjb25zdCBicmFuY2hlcyA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCI7XG5cbiAgICAvLyDorqHnrpfml7blubLnmoTntKLlvJVcbiAgICBjb25zdCBzdGVtSW5kZXggPSBzdGVtcy5pbmRleE9mKGhvdXJTdGVtKTtcbiAgICAvLyDorqHnrpfml7bmlK/nmoTntKLlvJVcbiAgICBjb25zdCBicmFuY2hJbmRleCA9IGJyYW5jaGVzLmluZGV4T2YoaG91ckJyYW5jaCk7XG5cbiAgICBpZiAoc3RlbUluZGV4ID09PSAtMSB8fCBicmFuY2hJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIuacquefpVwiO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+WRveWuq+W5su+8iOaXtuW5siArIDfvvIzotoXov4cxMOWImeWHjzEw77yJXG4gICAgY29uc3QgbWluZ0dvbmdTdGVtSW5kZXggPSAoc3RlbUluZGV4ICsgNykgJSAxMDtcbiAgICAvLyDorqHnrpflkb3lrqvmlK/vvIjml7bmlK8gKyAx77yM6LaF6L+HMTLliJnlh48xMu+8iVxuICAgIGNvbnN0IG1pbmdHb25nQnJhbmNoSW5kZXggPSAoYnJhbmNoSW5kZXggKyAxKSAlIDEyO1xuXG4gICAgLy8g57uE5ZCI5ZG95a6r5bmy5pSvXG4gICAgcmV0dXJuIHN0ZW1zW21pbmdHb25nU3RlbUluZGV4XSArIGJyYW5jaGVzW21pbmdHb25nQnJhbmNoSW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWkqeW5suWvueW6lOeahOS6lOihjFxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHJldHVybnMg5LqU6KGMXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRTdGVtV3VYaW5nKHN0ZW06IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5pyoJyxcbiAgICAgICfkuZknOiAn5pyoJyxcbiAgICAgICfkuJknOiAn54GrJyxcbiAgICAgICfkuIEnOiAn54GrJyxcbiAgICAgICfmiIonOiAn5ZyfJyxcbiAgICAgICflt7EnOiAn5ZyfJyxcbiAgICAgICfluponOiAn6YeRJyxcbiAgICAgICfovpsnOiAn6YeRJyxcbiAgICAgICflo6wnOiAn5rC0JyxcbiAgICAgICfnmbgnOiAn5rC0J1xuICAgIH07XG5cbiAgICByZXR1cm4gbWFwW3N0ZW1dIHx8ICfmnKrnn6UnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWcsOaUr+iXj+W5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDol4/lubLlrZfnrKbkuLJcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldEhpZGVHYW4oYnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+eZuCcsXG4gICAgICAn5LiRJzogJ+W3sSznmbgs6L6bJyxcbiAgICAgICflr4UnOiAn55SyLOS4mSzmiIonLFxuICAgICAgJ+WNryc6ICfkuZknLFxuICAgICAgJ+i+sCc6ICfmiIos5LmZLOeZuCcsXG4gICAgICAn5bezJzogJ+S4mSzlupos5oiKJyxcbiAgICAgICfljYgnOiAn5LiBLOW3sScsXG4gICAgICAn5pyqJzogJ+W3sSzkuIEs5LmZJyxcbiAgICAgICfnlLMnOiAn5bqaLOWjrCzmiIonLFxuICAgICAgJ+mFiSc6ICfovpsnLFxuICAgICAgJ+aIjCc6ICfmiIos6L6bLOS4gScsXG4gICAgICAn5LqlJzogJ+WjrCznlLInXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbYnJhbmNoXSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7mnIjml6Xojrflj5bmmJ/luqdcbiAgICogQHBhcmFtIG1vbnRoIOaciOS7ve+8iDEtMTLvvIlcbiAgICogQHBhcmFtIGRheSDml6XmnJ/vvIgxLTMx77yJXG4gICAqIEByZXR1cm5zIOaYn+W6p+WQjeensFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0Wm9kaWFjKG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBkYXRlcyA9IFsyMCwgMTksIDIxLCAyMCwgMjEsIDIyLCAyMywgMjMsIDIzLCAyNCwgMjMsIDIyXTtcbiAgICBjb25zdCBzaWducyA9IFtcbiAgICAgIFwi5rC055O25bqnXCIsIFwi5Y+M6bG85bqnXCIsIFwi55m9576K5bqnXCIsIFwi6YeR54mb5bqnXCIsIFwi5Y+M5a2Q5bqnXCIsIFwi5beo6J+55bqnXCIsXG4gICAgICBcIueLruWtkOW6p1wiLCBcIuWkhOWls+W6p1wiLCBcIuWkqeenpOW6p1wiLCBcIuWkqeidjuW6p1wiLCBcIuWwhOaJi+W6p1wiLCBcIuaRqee+r+W6p1wiXG4gICAgXTtcblxuICAgIC8vIOaciOS7veS7jjHlvIDlp4vvvIzntKLlvJXku44w5byA5aeL77yM6ZyA6KaB5YePMVxuICAgIGNvbnN0IG1vbnRoSW5kZXggPSBtb250aCAtIDE7XG5cbiAgICAvLyDlpoLmnpzml6XmnJ/lpKfkuo7nrYnkuo7or6XmnIjlr7nlupTnmoTml6XmnJ/vvIzliJnmmJ/luqfkuLrlvZPmnIjmmJ/luqfvvIzlkKbliJnkuLrliY3kuIDkuKrmnIjnmoTmmJ/luqdcbiAgICByZXR1cm4gZGF5IDwgZGF0ZXNbbW9udGhJbmRleF0gPyBzaWduc1ttb250aEluZGV4XSA6IHNpZ25zWyhtb250aEluZGV4ICsgMSkgJSAxMl07XG4gIH1cblxuICAvKipcbiAgICog6K6h566X5pes56m6XG4gICAqIEBwYXJhbSBnYW4g5aSp5bmyXG4gICAqIEBwYXJhbSB6aGkg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaXrOepulxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlWHVuS29uZyhnYW46IHN0cmluZywgemhpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOWkqeW5suW6j+WPt++8iOeUsj0wLCDkuZk9MSwgLi4uLCDnmbg9Oe+8iVxuICAgIGNvbnN0IGdhbkluZGV4ID0gXCLnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbhcIi5pbmRleE9mKGdhbik7XG4gICAgLy8g5Zyw5pSv5bqP5Y+377yI5a2QPTAsIOS4kT0xLCAuLi4sIOS6pT0xMe+8iVxuICAgIGNvbnN0IHpoaUluZGV4ID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIi5pbmRleE9mKHpoaSk7XG5cbiAgICBpZiAoZ2FuSW5kZXggPCAwIHx8IHpoaUluZGV4IDwgMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIOiuoeeul+aXrOmmllxuICAgIGNvbnN0IHh1blNob3VJbmRleCA9IE1hdGguZmxvb3IoZ2FuSW5kZXggLyAyKSAqIDI7XG5cbiAgICAvLyDorqHnrpfml6znqbrlnLDmlK9cbiAgICBjb25zdCB4dW5Lb25nSW5kZXgxID0gKHh1blNob3VJbmRleCArIDEwKSAlIDEyO1xuICAgIGNvbnN0IHh1bktvbmdJbmRleDIgPSAoeHVuU2hvdUluZGV4ICsgMTEpICUgMTI7XG5cbiAgICAvLyDojrflj5bml6znqbrlnLDmlK9cbiAgICBjb25zdCB4dW5Lb25nWmhpMSA9IFwi5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlXCIuY2hhckF0KHh1bktvbmdJbmRleDEpO1xuICAgIGNvbnN0IHh1bktvbmdaaGkyID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIi5jaGFyQXQoeHVuS29uZ0luZGV4Mik7XG5cbiAgICByZXR1cm4geHVuS29uZ1poaTEgKyB4dW5Lb25nWmhpMjtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bnurPpn7NcbiAgICogQHBhcmFtIGd6IOW5suaUr1xuICAgKiBAcmV0dXJucyDnurPpn7NcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldE5hWWluKGd6OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn55Sy5a2QJzogJ+a1t+S4remHkScsICfkuZnkuJEnOiAn5rW35Lit6YeRJyxcbiAgICAgICfkuJnlr4UnOiAn54KJ5Lit54GrJywgJ+S4geWNryc6ICfngonkuK3ngasnLFxuICAgICAgJ+aIiui+sCc6ICflpKfmnpfmnKgnLCAn5bex5bezJzogJ+Wkp+ael+acqCcsXG4gICAgICAn5bqa5Y2IJzogJ+i3r+aXgeWcnycsICfovpvmnKonOiAn6Lev5peB5ZyfJyxcbiAgICAgICflo6znlLMnOiAn5YmR6ZSL6YeRJywgJ+eZuOmFiSc6ICfliZHplIvph5EnLFxuICAgICAgJ+eUsuaIjCc6ICflsbHlpLTngasnLCAn5LmZ5LqlJzogJ+WxseWktOeBqycsXG4gICAgICAn5LiZ5a2QJzogJ+a2p+S4i+awtCcsICfkuIHkuJEnOiAn5ran5LiL5rC0JyxcbiAgICAgICfmiIrlr4UnOiAn5Z+O5aS05ZyfJywgJ+W3seWNryc6ICfln47lpLTlnJ8nLFxuICAgICAgJ+W6mui+sCc6ICfnmb3onKHph5EnLCAn6L6b5bezJzogJ+eZveicoemHkScsXG4gICAgICAn5aOs5Y2IJzogJ+adqOafs+acqCcsICfnmbjmnKonOiAn5p2o5p+z5pyoJyxcbiAgICAgICfnlLLnlLMnOiAn5rOJ5Lit5rC0JywgJ+S5memFiSc6ICfms4nkuK3msLQnLFxuICAgICAgJ+S4meaIjCc6ICflsYvkuIrlnJ8nLCAn5LiB5LqlJzogJ+Wxi+S4iuWcnycsXG4gICAgICAn5oiK5a2QJzogJ+mcuembs+eBqycsICflt7HkuJEnOiAn6Zy56Zuz54GrJyxcbiAgICAgICfluprlr4UnOiAn5p2+5p+P5pyoJywgJ+i+m+WNryc6ICfmnb7mn4/mnKgnLFxuICAgICAgJ+WjrOi+sCc6ICfplb/mtYHmsLQnLCAn55m45bezJzogJ+mVv+a1geawtCcsXG4gICAgICAn55Sy5Y2IJzogJ+egguefs+mHkScsICfkuZnmnKonOiAn56CC55+z6YeRJyxcbiAgICAgICfkuJnnlLMnOiAn5bGx5LiL54GrJywgJ+S4gemFiSc6ICflsbHkuIvngasnLFxuICAgICAgJ+aIiuaIjCc6ICflubPlnLDmnKgnLCAn5bex5LqlJzogJ+W5s+WcsOacqCcsXG4gICAgICAn5bqa5a2QJzogJ+WjgeS4iuWcnycsICfovpvkuJEnOiAn5aOB5LiK5ZyfJyxcbiAgICAgICflo6zlr4UnOiAn6YeR6JaE6YeRJywgJ+eZuOWNryc6ICfph5HoloTph5EnLFxuICAgICAgJ+eUsui+sCc6ICfopobnga/ngasnLCAn5LmZ5bezJzogJ+imhueBr+eBqycsXG4gICAgICAn5LiZ5Y2IJzogJ+Wkqeays+awtCcsICfkuIHmnKonOiAn5aSp5rKz5rC0JyxcbiAgICAgICfmiIrnlLMnOiAn5aSn6am/5ZyfJywgJ+W3semFiSc6ICflpKfpqb/lnJ8nLFxuICAgICAgJ+W6muaIjCc6ICfpkpfnjq/ph5EnLCAn6L6b5LqlJzogJ+mSl+eOr+mHkScsXG4gICAgICAn5aOs5a2QJzogJ+ahkeafmOacqCcsICfnmbjkuJEnOiAn5qGR5p+Y5pyoJyxcbiAgICAgICfnlLLlr4UnOiAn5aSn5rqq5rC0JywgJ+S5meWNryc6ICflpKfmuqrmsLQnLFxuICAgICAgJ+S4mei+sCc6ICfmspnkuK3lnJ8nLCAn5LiB5bezJzogJ+aymeS4reWcnycsXG4gICAgICAn5oiK5Y2IJzogJ+WkqeS4iueBqycsICflt7HmnKonOiAn5aSp5LiK54GrJyxcbiAgICAgICfluprnlLMnOiAn55+z5qa05pyoJywgJ+i+m+mFiSc6ICfnn7PmprTmnKgnLFxuICAgICAgJ+WjrOaIjCc6ICflpKfmtbfmsLQnLCAn55m45LqlJzogJ+Wkp+a1t+awtCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFtnel0gfHwgJ+acquefpSc7XG4gIH1cblxuXG4gIC8qKlxuICAgKiDmoLzlvI/ljJblhavlrZfkv6Hmga9cbiAgICogQHBhcmFtIHNvbGFyIOmYs+WOhuWvueixoVxuICAgKiBAcGFyYW0gbHVuYXIg5Yac5Y6G5a+56LGhXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEBwYXJhbSBnZW5kZXIg5oCn5Yir77yIMS3nlLfvvIwwLeWls++8iVxuICAgKiBAcGFyYW0gc2VjdCDlhavlrZfmtYHmtL7vvIgx5oiWMu+8iVxuICAgKiBAcmV0dXJucyDmoLzlvI/ljJblkI7nmoTlhavlrZfkv6Hmga9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGZvcm1hdEJhemlJbmZvKHNvbGFyOiBTb2xhciwgbHVuYXI6IEx1bmFyLCBlaWdodENoYXI6IEVpZ2h0Q2hhciwgZ2VuZGVyOiBzdHJpbmcgPSAnMScsIHNlY3Q6IHN0cmluZyA9ICcyJyk6IEJhemlJbmZvIHtcbiAgICAvLyDorr7nva7lhavlrZfmtYHmtL5cbiAgICBlaWdodENoYXIuc2V0U2VjdChwYXJzZUludChzZWN0KSk7XG5cbiAgICAvLyDlubTmn7FcbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgeWVhclBpbGxhciA9IHllYXJTdGVtICsgeWVhckJyYW5jaDtcbiAgICBjb25zdCB5ZWFySGlkZUdhbiA9IGVpZ2h0Q2hhci5nZXRZZWFySGlkZUdhbigpLmpvaW4oJywnKTtcbiAgICBjb25zdCB5ZWFyV3VYaW5nID0gZWlnaHRDaGFyLmdldFllYXJXdVhpbmcoKTtcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSBlaWdodENoYXIuZ2V0WWVhck5hWWluKCk7XG4gICAgY29uc3QgeWVhclNoaVNoZW5HYW4gPSBlaWdodENoYXIuZ2V0WWVhclNoaVNoZW5HYW4oKTtcbiAgICBjb25zdCB5ZWFyU2hpU2hlblpoaSA9IGVpZ2h0Q2hhci5nZXRZZWFyU2hpU2hlblpoaSgpO1xuICAgIGNvbnN0IHllYXJEaVNoaSA9IGVpZ2h0Q2hhci5nZXRZZWFyRGlTaGkoKTtcblxuICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgIGxldCB5ZWFyWHVuS29uZyA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAvLyDlhYjojrflj5bml6zvvIzlho3ojrflj5bml6znqbpcbiAgICAgIGNvbnN0IHllYXJYdW4gPSBlaWdodENoYXIuZ2V0WWVhclh1bigpO1xuICAgICAgaWYgKHllYXJYdW4pIHtcbiAgICAgICAgeWVhclh1bktvbmcgPSBlaWdodENoYXIuZ2V0WWVhclh1bktvbmcoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCforqHnrpflubTmn7Hml6znqbrlh7rplJk6JywgZSk7XG4gICAgfVxuXG4gICAgLy8g5pyI5p+xXG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBtb250aFBpbGxhciA9IG1vbnRoU3RlbSArIG1vbnRoQnJhbmNoO1xuICAgIGNvbnN0IG1vbnRoSGlkZUdhbiA9IGVpZ2h0Q2hhci5nZXRNb250aEhpZGVHYW4oKS5qb2luKCcsJyk7XG4gICAgY29uc3QgbW9udGhXdVhpbmcgPSBlaWdodENoYXIuZ2V0TW9udGhXdVhpbmcoKTtcbiAgICBjb25zdCBtb250aE5hWWluID0gZWlnaHRDaGFyLmdldE1vbnRoTmFZaW4oKTtcbiAgICBjb25zdCBtb250aFNoaVNoZW5HYW4gPSBlaWdodENoYXIuZ2V0TW9udGhTaGlTaGVuR2FuKCk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gZWlnaHRDaGFyLmdldE1vbnRoU2hpU2hlblpoaSgpO1xuICAgIGNvbnN0IG1vbnRoRGlTaGkgPSBlaWdodENoYXIuZ2V0TW9udGhEaVNoaSgpO1xuXG4gICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgbGV0IG1vbnRoWHVuS29uZyA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAvLyDlhYjojrflj5bml6zvvIzlho3ojrflj5bml6znqbpcbiAgICAgIGNvbnN0IG1vbnRoWHVuID0gZWlnaHRDaGFyLmdldE1vbnRoWHVuKCk7XG4gICAgICBpZiAobW9udGhYdW4pIHtcbiAgICAgICAgbW9udGhYdW5Lb25nID0gZWlnaHRDaGFyLmdldE1vbnRoWHVuS29uZygpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+aciOafseaXrOepuuWHuumUmTonLCBlKTtcbiAgICB9XG5cbiAgICAvLyDml6Xmn7FcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXREYXlaaGkoKTtcbiAgICBjb25zdCBkYXlQaWxsYXIgPSBkYXlTdGVtICsgZGF5QnJhbmNoO1xuICAgIGNvbnN0IGRheUhpZGVHYW4gPSBlaWdodENoYXIuZ2V0RGF5SGlkZUdhbigpLmpvaW4oJywnKTtcbiAgICBjb25zdCBkYXlXdVhpbmcgPSBlaWdodENoYXIuZ2V0RGF5V3VYaW5nKCk7XG4gICAgY29uc3QgZGF5TmFZaW4gPSBlaWdodENoYXIuZ2V0RGF5TmFZaW4oKTtcbiAgICBjb25zdCBkYXlTaGlTaGVuWmhpID0gZWlnaHRDaGFyLmdldERheVNoaVNoZW5aaGkoKTtcbiAgICBjb25zdCBkYXlEaVNoaSA9IGVpZ2h0Q2hhci5nZXREYXlEaVNoaSgpO1xuXG4gICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgbGV0IGRheVh1bktvbmcgPSAnJztcbiAgICB0cnkge1xuICAgICAgLy8g5YWI6I635Y+W5pes77yM5YaN6I635Y+W5pes56m6XG4gICAgICBjb25zdCBkYXlYdW4gPSBlaWdodENoYXIuZ2V0RGF5WHVuKCk7XG4gICAgICBpZiAoZGF5WHVuKSB7XG4gICAgICAgIGRheVh1bktvbmcgPSBlaWdodENoYXIuZ2V0RGF5WHVuS29uZygpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+aXpeafseaXrOepuuWHuumUmTonLCBlKTtcbiAgICB9XG5cbiAgICAvLyDml7bmn7FcbiAgICBjb25zdCBob3VyU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG4gICAgY29uc3QgaG91ckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRUaW1lWmhpKCk7XG4gICAgY29uc3QgaG91clBpbGxhciA9IGhvdXJTdGVtICsgaG91ckJyYW5jaDtcbiAgICBjb25zdCBob3VySGlkZUdhbiA9IGVpZ2h0Q2hhci5nZXRUaW1lSGlkZUdhbigpLmpvaW4oJywnKTtcbiAgICBjb25zdCBob3VyV3VYaW5nID0gZWlnaHRDaGFyLmdldFRpbWVXdVhpbmcoKTtcbiAgICBjb25zdCBob3VyTmFZaW4gPSBlaWdodENoYXIuZ2V0VGltZU5hWWluKCk7XG4gICAgY29uc3QgaG91clNoaVNoZW5HYW4gPSBlaWdodENoYXIuZ2V0VGltZVNoaVNoZW5HYW4oKTtcbiAgICBjb25zdCBob3VyU2hpU2hlblpoaSA9IGVpZ2h0Q2hhci5nZXRUaW1lU2hpU2hlblpoaSgpO1xuICAgIGNvbnN0IHRpbWVEaVNoaSA9IGVpZ2h0Q2hhci5nZXRUaW1lRGlTaGkoKTtcblxuICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgIGxldCB0aW1lWHVuS29uZyA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAvLyDlhYjojrflj5bml6zvvIzlho3ojrflj5bml6znqbpcbiAgICAgIGNvbnN0IHRpbWVYdW4gPSBlaWdodENoYXIuZ2V0VGltZVh1bigpO1xuICAgICAgaWYgKHRpbWVYdW4pIHtcbiAgICAgICAgdGltZVh1bktvbmcgPSBlaWdodENoYXIuZ2V0VGltZVh1bktvbmcoKTtcbiAgICAgIH1cblxuICAgICAgLy8g5aaC5p6c6YCa6L+HQVBJ6I635Y+W5aSx6LSl77yM5YiZ5omL5Yqo6K6h566XXG4gICAgICBpZiAoIXRpbWVYdW5Lb25nKSB7XG4gICAgICAgIHRpbWVYdW5Lb25nID0gdGhpcy5jYWxjdWxhdGVYdW5Lb25nKGhvdXJTdGVtLCBob3VyQnJhbmNoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCforqHnrpfml7bmn7Hml6znqbrlh7rplJk6JywgZSk7XG4gICAgICAvLyDlh7rplJnml7bmiYvliqjorqHnrpdcbiAgICAgIHRpbWVYdW5Lb25nID0gdGhpcy5jYWxjdWxhdGVYdW5Lb25nKGhvdXJTdGVtLCBob3VyQnJhbmNoKTtcbiAgICB9XG5cbiAgICAvLyDnibnmrorkv6Hmga9cbiAgICBjb25zdCB0YWlZdWFuID0gZWlnaHRDaGFyLmdldFRhaVl1YW4oKTtcbiAgICBjb25zdCB0YWlZdWFuTmFZaW4gPSBlaWdodENoYXIuZ2V0VGFpWXVhbk5hWWluKCk7XG4gICAgY29uc3QgbWluZ0dvbmcgPSBlaWdodENoYXIuZ2V0TWluZ0dvbmcoKTtcbiAgICBjb25zdCBtaW5nR29uZ05hWWluID0gZWlnaHRDaGFyLmdldE1pbmdHb25nTmFZaW4oKTtcbiAgICBjb25zdCBzaGVuR29uZyA9IGVpZ2h0Q2hhci5nZXRTaGVuR29uZygpO1xuXG4gICAgLy8g5pel5pyf5L+h5oGvXG4gICAgY29uc3Qgc29sYXJEYXRlID0gc29sYXIudG9ZbWQoKTtcbiAgICBjb25zdCBsdW5hckRhdGUgPSBsdW5hci50b1N0cmluZygpO1xuICAgIGNvbnN0IHNvbGFyVGltZSA9IHNvbGFyLmdldEhvdXIoKSArICc6JyArIHNvbGFyLmdldE1pbnV0ZSgpO1xuXG4gICAgLy8g55Sf6IKW5L+h5oGvXG4gICAgY29uc3QgeWVhclNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKHllYXJCcmFuY2gpO1xuICAgIGNvbnN0IG1vbnRoU2hlbmdYaWFvID0gdGhpcy5nZXRTaGVuZ1hpYW8obW9udGhCcmFuY2gpO1xuICAgIGNvbnN0IGRheVNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKGRheUJyYW5jaCk7XG4gICAgY29uc3QgaG91clNoZW5nWGlhbyA9IHRoaXMuZ2V0U2hlbmdYaWFvKGhvdXJCcmFuY2gpO1xuXG4gICAgLy8g5Y2B56We5L+h5oGvICjku6Xml6XlubLkuLrkuLspXG4gICAgY29uc3QgeWVhclNoaVNoZW4gPSB5ZWFyU2hpU2hlbkdhbjtcbiAgICBjb25zdCBtb250aFNoaVNoZW4gPSBtb250aFNoaVNoZW5HYW47XG4gICAgY29uc3QgZGF5U2hpU2hlbiA9ICfml6XkuLsnOyAvLyDml6Xmn7HlpKnlubLmmK/ml6XkuLvoh6rlt7FcbiAgICBjb25zdCBob3VyU2hpU2hlbiA9IGhvdXJTaGlTaGVuR2FuO1xuXG4gICAgLy8g5pif5bqnXG4gICAgY29uc3Qgem9kaWFjID0gdGhpcy5nZXRab2RpYWMoc29sYXIuZ2V0TW9udGgoKSwgc29sYXIuZ2V0RGF5KCkpO1xuXG4gICAgLy8g6IqC5rCUXG4gICAgY29uc3QgamllUWkgPSB0eXBlb2YgbHVuYXIuZ2V0SmllUWkoKSA9PT0gJ3N0cmluZycgPyBsdW5hci5nZXRKaWVRaSgpIDogJyc7XG4gICAgY29uc3QgbmV4dEppZVFpID0gdHlwZW9mIGx1bmFyLmdldE5leHRKaWVRaSgpID09PSAnc3RyaW5nJyA/IGx1bmFyLmdldE5leHRKaWVRaSgpIDogJyc7XG5cbiAgICAvLyDlkInlh7ZcbiAgICBjb25zdCBkYXlZaSA9IGx1bmFyLmdldERheVlpKCkgfHwgW107XG4gICAgY29uc3QgZGF5SmkgPSBsdW5hci5nZXREYXlKaSgpIHx8IFtdO1xuXG4gICAgLy8g56We54WeXG4gICAgY29uc3QgZGF5U2hhID0gQXJyYXkuaXNBcnJheShsdW5hci5nZXREYXlTaGEoKSkgPyBsdW5hci5nZXREYXlTaGEoKSA6IFtdO1xuICAgIGNvbnN0IHNoZW5TaGFSZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNoZW5TaGEoZWlnaHRDaGFyKTtcbiAgICBjb25zdCBzaGVuU2hhID0gWy4uLmRheVNoYSwgLi4uc2hlblNoYVJlc3VsdC5zaGVuU2hhXTtcbiAgICBjb25zdCB5ZWFyU2hlblNoYSA9IHNoZW5TaGFSZXN1bHQueWVhclNoZW5TaGE7XG4gICAgY29uc3QgbW9udGhTaGVuU2hhID0gc2hlblNoYVJlc3VsdC5tb250aFNoZW5TaGE7XG4gICAgY29uc3QgZGF5U2hlblNoYSA9IHNoZW5TaGFSZXN1bHQuZGF5U2hlblNoYTtcbiAgICBjb25zdCBob3VyU2hlblNoYSA9IHNoZW5TaGFSZXN1bHQuaG91clNoZW5TaGE7XG5cbiAgICAvLyDmoLzlsYBcbiAgICBjb25zdCBnZUp1SW5mbyA9IHRoaXMuY2FsY3VsYXRlR2VKdShlaWdodENoYXIpO1xuICAgIGNvbnN0IGdlSnUgPSBnZUp1SW5mbz8uZ2VKdTtcbiAgICBjb25zdCBnZUp1RGV0YWlsID0gZ2VKdUluZm8/LmRldGFpbDtcblxuICAgIC8vIOi1t+i/kOS/oeaBr1xuICAgIGNvbnN0IGdlbmRlck51bSA9IGdlbmRlciA9PT0gJzEnID8gMSA6IDA7XG4gICAgY29uc3Qgc2VjdE51bSA9IHBhcnNlSW50KHNlY3QpO1xuICAgIGNvbnN0IHl1biA9IGVpZ2h0Q2hhci5nZXRZdW4oZ2VuZGVyTnVtLCBzZWN0TnVtKTtcbiAgICBjb25zdCBxaVl1blllYXIgPSB5dW4uZ2V0U3RhcnRZZWFyKCk7XG4gICAgY29uc3QgcWlZdW5Nb250aCA9IHl1bi5nZXRTdGFydE1vbnRoKCk7XG4gICAgY29uc3QgcWlZdW5EYXkgPSB5dW4uZ2V0U3RhcnREYXkoKTtcbiAgICBjb25zdCBxaVl1bkhvdXIgPSB5dW4uZ2V0U3RhcnRIb3VyKCk7XG4gICAgY29uc3QgcWlZdW5EYXRlID0geXVuLmdldFN0YXJ0U29sYXIoKS50b1ltZCgpO1xuICAgIGNvbnN0IHFpWXVuQWdlID0gcWlZdW5ZZWFyOyAvLyDnroDljJblpITnkIbvvIzlrp7pmYXlupTor6XorqHnrpfomZrlsoFcblxuICAgIC8vIOWkp+i/kOS/oeaBr1xuICAgIGNvbnN0IGRhWXVuQXJyID0geXVuLmdldERhWXVuKCk7XG4gICAgY29uc3QgZGFZdW4gPSBkYVl1bkFyci5tYXAoZHkgPT4ge1xuICAgICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgICBsZXQgeHVuS29uZyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5qOA5p+l5bmy5pSv5piv5ZCm5pyJ5pWIXG4gICAgICAgIGNvbnN0IGdhblpoaSA9IGR5LmdldEdhblpoaSgpO1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyDmiYvliqjorqHnrpfml6znqbrvvIzpgb/lhY3kvb/nlKjlj6/og73lh7rplJnnmoRnZXRYdW5Lb25n5pa55rOVXG4gICAgICAgICAgY29uc3QgZ2FuID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wkp+i/kOaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g5a6J5YWo5Zyw6I635Y+W5bGe5oCn77yM6Ziy5q2i56m65oyH6ZKI5byC5bi4XG4gICAgICBsZXQgc3RhcnRZZWFyID0gMCwgZW5kWWVhciA9IDAsIHN0YXJ0QWdlID0gMCwgZW5kQWdlID0gMCwgaW5kZXggPSAwLCBnYW5aaGkgPSAnJztcbiAgICAgIHRyeSB7IHN0YXJ0WWVhciA9IGR5LmdldFN0YXJ0WWVhcigpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOi1t+Wni+W5tOWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZW5kWWVhciA9IGR5LmdldEVuZFllYXIoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blpKfov5Dnu5PmnZ/lubTlh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IHN0YXJ0QWdlID0gZHkuZ2V0U3RhcnRBZ2UoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blpKfov5Dotbflp4vlubTpvoTlh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGVuZEFnZSA9IGR5LmdldEVuZEFnZSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOe7k+adn+W5tOm+hOWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgaW5kZXggPSBkeS5nZXRJbmRleCgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWkp+i/kOW6j+WPt+WHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZ2FuWmhpID0gZHkuZ2V0R2FuWmhpKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5aSn6L+Q5bmy5pSv5Ye66ZSZOicsIGUpOyB9XG5cbiAgICAgIC8vIOiuoeeul+WNgeelnlxuICAgICAgbGV0IHNoaVNoZW5HYW4gPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBnYW5aaGkuY2hhckF0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpflpKfov5DljYHnpZ7lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+WcsOWKv1xuICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5aSn6L+Q5Zyw5Yq/5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpfnpZ7nhZ5cbiAgICAgIGNvbnN0IHNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHN0ZW0gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IGJyYW5jaCA9IGdhblpoaS5jaGFyQXQoMSk7XG5cbiAgICAgICAgICAvLyDlpKnkuZnotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaWh+aYjFxuICAgICAgICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmlofmmIwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDljY7nm5ZcbiAgICAgICAgICBpZiAodGhpcy5pc0h1YUdhaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WNjueblicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOemhOelnlxuICAgICAgICAgIGlmICh0aGlzLmlzTHVTaGVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5qGD6IqxXG4gICAgICAgICAgaWYgKHRoaXMuaXNUYW9IdWEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlraTovrBcbiAgICAgICAgICBpZiAodGhpcy5pc0d1Q2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WtpOi+sCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWvoeWuv1xuICAgICAgICAgIGlmICh0aGlzLmlzR3VhU3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDpqb/pqaxcbiAgICAgICAgICBpZiAodGhpcy5pc1lpTWEoYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlsIbmmJ9cbiAgICAgICAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WwhuaYnycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmHkeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmluU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkRlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b635ZCIXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVIZShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaciOW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzWXVlRGUoc3RlbSkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5Yy7XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWWkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljLsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnllpxcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWWnCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOe6ouiJs1xuICAgICAgICAgIGlmICh0aGlzLmlzSG9uZ1lhbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqee9l1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkx1byhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+Wkqee9lycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOe9kVxuICAgICAgICAgIGlmICh0aGlzLmlzRGlXYW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Zyw572RJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g576K5YiDXG4gICAgICAgICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56m6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS29uZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeepuicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOWKq1xuICAgICAgICAgIGlmICh0aGlzLmlzRGlKaWUoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnliJFcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5ZOtXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlk60nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnomZpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeiZmicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWSuOaxoFxuICAgICAgICAgIGlmICh0aGlzLmlzWGlhbkNoaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOS6oeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfkuqHnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDliqvnhZ5cbiAgICAgICAgICBpZiAodGhpcy5pc0ppZVNoYShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WKq+eFnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOeBvueFnlxuICAgICAgICAgIGlmICh0aGlzLmlzWmFpU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5LqU6ay8XG4gICAgICAgICAgaWYgKHRoaXMuaXNXdUd1aShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+S6lOmsvCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpflpKfov5DnpZ7nhZ7lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0WWVhcixcbiAgICAgICAgZW5kWWVhcixcbiAgICAgICAgc3RhcnRBZ2UsXG4gICAgICAgIGVuZEFnZSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgbmFZaW46IGdhblpoaSA/IHRoaXMuZ2V0TmFZaW4oZ2FuWmhpKSA6ICcnLFxuICAgICAgICB4dW5Lb25nLFxuICAgICAgICBzaGlTaGVuR2FuLFxuICAgICAgICBkaVNoaSxcbiAgICAgICAgc2hlblNoYVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIOa1geW5tOS/oeaBryAo5Y+W56ys5LiA5Liq5aSn6L+Q55qE5rWB5bm0KVxuICAgIGNvbnN0IGxpdU5pYW5BcnIgPSBkYVl1bkFyci5sZW5ndGggPiAxID8gZGFZdW5BcnJbMV0uZ2V0TGl1TmlhbigpIDogW107XG4gICAgY29uc3QgbGl1TmlhbiA9IGxpdU5pYW5BcnIubWFwKGxuID0+IHtcbiAgICAgIC8vIOa3u+WKoOmUmeivr+WkhOeQhu+8jOmYsuatouaXrOepuuiuoeeul+Wksei0pVxuICAgICAgbGV0IHh1bktvbmcgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIOajgOafpeW5suaUr+aYr+WQpuacieaViFxuICAgICAgICBjb25zdCBnYW5aaGkgPSBsbi5nZXRHYW5aaGkoKTtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgLy8g5omL5Yqo6K6h566X5pes56m677yM6YG/5YWN5L2/55So5Y+v6IO95Ye66ZSZ55qEZ2V0WHVuS29uZ+aWueazlVxuICAgICAgICAgIGNvbnN0IGdhbiA9IGdhblpoaS5jaGFyQXQoMCk7XG4gICAgICAgICAgY29uc3QgemhpID0gZ2FuWmhpLmNoYXJBdCgxKTtcbiAgICAgICAgICB4dW5Lb25nID0gdGhpcy5jYWxjdWxhdGVYdW5Lb25nKGdhbiwgemhpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpfmtYHlubTml6znqbrlh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOWuieWFqOWcsOiOt+WPluWxnuaAp++8jOmYsuatouepuuaMh+mSiOW8guW4uFxuICAgICAgbGV0IHllYXIgPSAwLCBhZ2UgPSAwLCBpbmRleCA9IDAsIGdhblpoaSA9ICcnO1xuICAgICAgdHJ5IHsgeWVhciA9IGxuLmdldFllYXIoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5bmtYHlubTlubTku73lh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGFnZSA9IGxuLmdldEFnZSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geW5tOW5tOm+hOWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgaW5kZXggPSBsbi5nZXRJbmRleCgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geW5tOW6j+WPt+WHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgZ2FuWmhpID0gbG4uZ2V0R2FuWmhpKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5rWB5bm05bmy5pSv5Ye66ZSZOicsIGUpOyB9XG5cbiAgICAgIC8vIOiuoeeul+WNgeelnlxuICAgICAgbGV0IHNoaVNoZW5HYW4gPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgc2hpU2hlbkdhbiA9IHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBnYW5aaGkuY2hhckF0KDApKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpfmtYHlubTljYHnpZ7lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+WcsOWKv1xuICAgICAgbGV0IGRpU2hpID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHpoaSA9IGdhblpoaS5jaGFyQXQoMSk7XG4gICAgICAgICAgZGlTaGkgPSB0aGlzLmdldERpU2hpKGRheVN0ZW0sIHpoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5bm05Zyw5Yq/5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpfnpZ7nhZ5cbiAgICAgIGNvbnN0IHNoZW5TaGE6IHN0cmluZ1tdID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGNvbnN0IHN0ZW0gPSBnYW5aaGkuY2hhckF0KDApO1xuICAgICAgICAgIGNvbnN0IGJyYW5jaCA9IGdhblpoaS5jaGFyQXQoMSk7XG5cbiAgICAgICAgICAvLyDlpKnkuZnotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaWh+aYjFxuICAgICAgICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmlofmmIwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDljY7nm5ZcbiAgICAgICAgICBpZiAodGhpcy5pc0h1YUdhaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WNjueblicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOemhOelnlxuICAgICAgICAgIGlmICh0aGlzLmlzTHVTaGVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5qGD6IqxXG4gICAgICAgICAgaWYgKHRoaXMuaXNUYW9IdWEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlraTovrBcbiAgICAgICAgICBpZiAodGhpcy5pc0d1Q2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WtpOi+sCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWvoeWuv1xuICAgICAgICAgIGlmICh0aGlzLmlzR3VhU3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDpqb/pqaxcbiAgICAgICAgICBpZiAodGhpcy5pc1lpTWEoYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfpqb/pqawnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlsIbmmJ9cbiAgICAgICAgICBpZiAodGhpcy5pc0ppYW5nWGluZyhkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WwhuaYnycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmHkeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmluU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkRlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b635ZCIXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVIZShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaciOW+t1xuICAgICAgICAgIGlmICh0aGlzLmlzWXVlRGUoc3RlbSkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5Yy7XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWWkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljLsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnllpxcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWWnCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOe6ouiJs1xuICAgICAgICAgIGlmICh0aGlzLmlzSG9uZ1lhbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+e6ouiJsycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqee9l1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkx1byhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+Wkqee9lycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOe9kVxuICAgICAgICAgIGlmICh0aGlzLmlzRGlXYW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Zyw572RJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g576K5YiDXG4gICAgICAgICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn576K5YiDJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56m6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS29uZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeepuicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWcsOWKq1xuICAgICAgICAgIGlmICh0aGlzLmlzRGlKaWUoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnliJFcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YaW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5YiRJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5ZOtXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuS3UoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlk60nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnomZpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5YdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeiZmicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWSuOaxoFxuICAgICAgICAgIGlmICh0aGlzLmlzWGlhbkNoaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WSuOaxoCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOS6oeelnlxuICAgICAgICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfkuqHnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDliqvnhZ5cbiAgICAgICAgICBpZiAodGhpcy5pc0ppZVNoYShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WKq+eFnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOeBvueFnlxuICAgICAgICAgIGlmICh0aGlzLmlzWmFpU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5bKB56C0XG4gICAgICAgICAgaWYgKHRoaXMuaXNTdWlQbyhicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WygeegtCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkp+iAl1xuICAgICAgICAgIGlmICh0aGlzLmlzRGFIYW8oYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b636LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6LWmXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuU2hlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5oGpXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlrphcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56aPXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRnUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljqhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5DaHUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlt6tcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5XdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeaciFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbll1ZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqemprFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbk1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geW5tOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeWVhcixcbiAgICAgICAgYWdlLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgZ2FuWmhpLFxuICAgICAgICBuYVlpbjogZ2FuWmhpID8gdGhpcy5nZXROYVlpbihnYW5aaGkpIDogJycsXG4gICAgICAgIHh1bktvbmcsXG4gICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgIGRpU2hpLFxuICAgICAgICBzaGVuU2hhXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8g5bCP6L+Q5L+h5oGvICjlj5bnrKzkuIDkuKrlpKfov5DnmoTlsI/ov5ApXG4gICAgY29uc3QgeGlhb1l1bkFyciA9IGRhWXVuQXJyLmxlbmd0aCA+IDEgPyBkYVl1bkFyclsxXS5nZXRYaWFvWXVuKCkgOiBbXTtcbiAgICBjb25zdCB4aWFvWXVuID0geGlhb1l1bkFyci5tYXAoeHkgPT4ge1xuICAgICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgICBsZXQgeHVuS29uZyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5qOA5p+l5bmy5pSv5piv5ZCm5pyJ5pWIXG4gICAgICAgIGNvbnN0IGdhblpoaSA9IHh5LmdldEdhblpoaSgpO1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyDmiYvliqjorqHnrpfml6znqbrvvIzpgb/lhY3kvb/nlKjlj6/og73lh7rplJnnmoRnZXRYdW5Lb25n5pa55rOVXG4gICAgICAgICAgY29uc3QgZ2FuID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wwj+i/kOaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g5a6J5YWo5Zyw6I635Y+W5bGe5oCn77yM6Ziy5q2i56m65oyH6ZKI5byC5bi4XG4gICAgICBsZXQgeWVhciA9IDAsIGFnZSA9IDAsIGluZGV4ID0gMCwgZ2FuWmhpID0gJyc7XG4gICAgICB0cnkgeyB5ZWFyID0geHkuZ2V0WWVhcigpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPluWwj+i/kOW5tOS7veWHuumUmTonLCBlKTsgfVxuICAgICAgdHJ5IHsgYWdlID0geHkuZ2V0QWdlKCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5bCP6L+Q5bm06b6E5Ye66ZSZOicsIGUpOyB9XG4gICAgICB0cnkgeyBpbmRleCA9IHh5LmdldEluZGV4KCk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcign6I635Y+W5bCP6L+Q5bqP5Y+35Ye66ZSZOicsIGUpOyB9XG4gICAgICB0cnkgeyBnYW5aaGkgPSB4eS5nZXRHYW5aaGkoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5blsI/ov5DlubLmlK/lh7rplJk6JywgZSk7IH1cblxuICAgICAgLy8g6K6h566X5Y2B56WeXG4gICAgICBsZXQgc2hpU2hlbkdhbiA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICBzaGlTaGVuR2FuID0gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIGdhblpoaS5jaGFyQXQoMCkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wwj+i/kOWNgeelnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X5Zyw5Yq/XG4gICAgICBsZXQgZGlTaGkgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3QgemhpID0gZ2FuWmhpLmNoYXJBdCgxKTtcbiAgICAgICAgICBkaVNoaSA9IHRoaXMuZ2V0RGlTaGkoZGF5U3RlbSwgemhpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCforqHnrpflsI/ov5DlnLDlir/lh7rplJk6JywgZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIOiuoeeul+elnueFnlxuICAgICAgY29uc3Qgc2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29uc3Qgc3RlbSA9IGdhblpoaS5jaGFyQXQoMCk7XG4gICAgICAgICAgY29uc3QgYnJhbmNoID0gZ2FuWmhpLmNoYXJBdCgxKTtcblxuICAgICAgICAgIC8vIOWkqeS5mei0teS6ulxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbllpR3VpUmVuKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5paH5piMXG4gICAgICAgICAgaWYgKHRoaXMuaXNXZW5DaGFuZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+aWh+aYjCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWNjuebllxuICAgICAgICAgIGlmICh0aGlzLmlzSHVhR2FpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Y2O55uWJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g56aE56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNMdVNoZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnpoTnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmoYPoirFcbiAgICAgICAgICBpZiAodGhpcy5pc1Rhb0h1YShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWtpOi+sFxuICAgICAgICAgIGlmICh0aGlzLmlzR3VDaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5a+h5a6/XG4gICAgICAgICAgaWYgKHRoaXMuaXNHdWFTdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WvoeWuvycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOmpv+mprFxuICAgICAgICAgIGlmICh0aGlzLmlzWWlNYShicmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWwhuaYn1xuICAgICAgICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6YeR56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaW5TaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn6YeR56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrflkIhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZUhlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5pyI5b63XG4gICAgICAgICAgaWYgKHRoaXMuaXNZdWVEZShzdGVtKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljLtcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5ZaShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWWnFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5ZacJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g57qi6ImzXG4gICAgICAgICAgaWYgKHRoaXMuaXNIb25nWWFuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp572XXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuTHVvKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp572XJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw572RXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaVdhbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflnLDnvZEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnvorliINcbiAgICAgICAgICBpZiAodGhpcy5pc1lhbmdSZW4oZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnqbpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5Lb25nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp56m6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Zyw5YqrXG4gICAgICAgICAgaWYgKHRoaXMuaXNEaUppZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WcsOWKqycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWIkVxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblhpbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlk61cbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5LdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeiZmlxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhblh1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6JmaJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5ZK45rGgXG4gICAgICAgICAgaWYgKHRoaXMuaXNYaWFuQ2hpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Lqh56WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNXYW5nU2hlbihicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+S6oeelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWKq+eFnlxuICAgICAgICAgIGlmICh0aGlzLmlzSmllU2hhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Yqr54WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g54G+54WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNaYWlTaGEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkupTprLxcbiAgICAgICAgICBpZiAodGhpcy5pc1d1R3VpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5LqU6ay8Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5b636LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6LWmXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuU2hlKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5oGpXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnmgaknKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlrphcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5HdWFuKHN0ZW0sIGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp56aPXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuRnUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnpo8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnljqhcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5DaHUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlt6tcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5XdShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW3qycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeaciFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbll1ZShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqemprFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbk1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+Wwj+i/kOelnueFnuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeWVhcixcbiAgICAgICAgYWdlLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgZ2FuWmhpLFxuICAgICAgICBuYVlpbjogZ2FuWmhpID8gdGhpcy5nZXROYVlpbihnYW5aaGkpIDogJycsXG4gICAgICAgIHh1bktvbmcsXG4gICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgIGRpU2hpLFxuICAgICAgICBzaGVuU2hhXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8g5rWB5pyI5L+h5oGvICjlj5bnrKzkuIDkuKrmtYHlubTnmoTmtYHmnIgpXG4gICAgY29uc3QgbGl1WXVlQXJyID0gbGl1TmlhbkFyci5sZW5ndGggPiAwID8gbGl1TmlhbkFyclswXS5nZXRMaXVZdWUoKSA6IFtdO1xuICAgIGNvbnN0IGxpdVl1ZSA9IGxpdVl1ZUFyci5tYXAobHkgPT4ge1xuICAgICAgLy8g5re75Yqg6ZSZ6K+v5aSE55CG77yM6Ziy5q2i5pes56m66K6h566X5aSx6LSlXG4gICAgICBsZXQgeHVuS29uZyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8g5qOA5p+l5bmy5pSv5piv5ZCm5pyJ5pWIXG4gICAgICAgIGNvbnN0IGdhblpoaSA9IGx5LmdldEdhblpoaSgpO1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyDmiYvliqjorqHnrpfml6znqbrvvIzpgb/lhY3kvb/nlKjlj6/og73lh7rplJnnmoRnZXRYdW5Lb25n5pa55rOVXG4gICAgICAgICAgY29uc3QgZ2FuID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIHh1bktvbmcgPSB0aGlzLmNhbGN1bGF0ZVh1bktvbmcoZ2FuLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geaciOaXrOepuuWHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g5a6J5YWo5Zyw6I635Y+W5bGe5oCn77yM6Ziy5q2i56m65oyH6ZKI5byC5bi4XG4gICAgICBsZXQgbW9udGggPSAnJywgaW5kZXggPSAwLCBnYW5aaGkgPSAnJztcbiAgICAgIHRyeSB7IG1vbnRoID0gbHkuZ2V0TW9udGhJbkNoaW5lc2UoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5bmtYHmnIjmnIjku73lh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGluZGV4ID0gbHkuZ2V0SW5kZXgoKTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmVycm9yKCfojrflj5bmtYHmnIjluo/lj7flh7rplJk6JywgZSk7IH1cbiAgICAgIHRyeSB7IGdhblpoaSA9IGx5LmdldEdhblpoaSgpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUuZXJyb3IoJ+iOt+WPlua1geaciOW5suaUr+WHuumUmTonLCBlKTsgfVxuXG4gICAgICAvLyDorqHnrpfljYHnpZ5cbiAgICAgIGxldCBzaGlTaGVuR2FuID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZ2FuWmhpICYmIGdhblpoaS5sZW5ndGggPj0gMSkge1xuICAgICAgICAgIHNoaVNoZW5HYW4gPSB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgZ2FuWmhpLmNoYXJBdCgwKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5pyI5Y2B56We5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICAvLyDorqHnrpflnLDlir9cbiAgICAgIGxldCBkaVNoaSA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCB6aGkgPSBnYW5aaGkuY2hhckF0KDEpO1xuICAgICAgICAgIGRpU2hpID0gdGhpcy5nZXREaVNoaShkYXlTdGVtLCB6aGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geaciOWcsOWKv+WHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X57qz6Z+zXG4gICAgICBsZXQgbmFZaW4gPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChnYW5aaGkgJiYgZ2FuWmhpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIG5hWWluID0gdGhpcy5nZXROYVlpbihnYW5aaGkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+iuoeeul+a1geaciOe6s+mfs+WHuumUmTonLCBlKTtcbiAgICAgIH1cblxuICAgICAgLy8g6K6h566X56We54WeXG4gICAgICBjb25zdCBzaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGdhblpoaSAmJiBnYW5aaGkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBjb25zdCBzdGVtID0gZ2FuWmhpLmNoYXJBdCgwKTtcbiAgICAgICAgICBjb25zdCBicmFuY2ggPSBnYW5aaGkuY2hhckF0KDEpO1xuXG4gICAgICAgICAgLy8g5aSp5LmZ6LS15Lq6XG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWWlHdWlSZW4oZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnkuZnotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmlofmmIxcbiAgICAgICAgICBpZiAodGhpcy5pc1dlbkNoYW5nKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5paH5piMJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Y2O55uWXG4gICAgICAgICAgaWYgKHRoaXMuaXNIdWFHYWkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfljY7nm5YnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnpoTnpZ5cbiAgICAgICAgICBpZiAodGhpcy5pc0x1U2hlbihzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+emhOelnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOahg+iKsVxuICAgICAgICAgIGlmICh0aGlzLmlzVGFvSHVhKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5qGD6IqxJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5a2k6L6wXG4gICAgICAgICAgaWYgKHRoaXMuaXNHdUNoZW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflraTovrAnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlr6Hlrr9cbiAgICAgICAgICBpZiAodGhpcy5pc0d1YVN1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5a+h5a6/Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6am/6amsXG4gICAgICAgICAgaWYgKHRoaXMuaXNZaU1hKGJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn6am/6amsJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5bCG5pifXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaWFuZ1hpbmcoZGF5U3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflsIbmmJ8nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDph5HnpZ5cbiAgICAgICAgICBpZiAodGhpcy5pc0ppblNoZW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfph5HnpZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrdcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW+tycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeW+t+WQiFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkRlSGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlvrflkIgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDmnIjlvrdcbiAgICAgICAgICBpZiAodGhpcy5pc1l1ZURlKHN0ZW0pKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+aciOW+tycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWMu1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbllpKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5Yy7Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5ZacXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWGkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnllpwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDnuqLoibNcbiAgICAgICAgICBpZiAodGhpcy5pc0hvbmdZYW4oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfnuqLoibMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnvZdcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5MdW8oYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnvZcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlnLDnvZFcbiAgICAgICAgICBpZiAodGhpcy5pc0RpV2FuZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WcsOe9kScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOe+iuWIg1xuICAgICAgICAgIGlmICh0aGlzLmlzWWFuZ1JlbihkYXlTdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+e+iuWIgycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeepulxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbktvbmcoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnnqbonKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlnLDliqtcbiAgICAgICAgICBpZiAodGhpcy5pc0RpSmllKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Zyw5YqrJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5YiRXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWGluZyhicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWIkScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWTrVxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkt1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5ZOtJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6JmaXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWHUoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnomZonKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlkrjmsaBcbiAgICAgICAgICBpZiAodGhpcy5pc1hpYW5DaGkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflkrjmsaAnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDkuqHnpZ5cbiAgICAgICAgICBpZiAodGhpcy5pc1dhbmdTaGVuKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5Lqh56WeJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5Yqr54WeXG4gICAgICAgICAgaWYgKHRoaXMuaXNKaWVTaGEoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfliqvnhZ4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDngb7nhZ5cbiAgICAgICAgICBpZiAodGhpcy5pc1phaVNoYShicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+eBvueFnicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOS6lOmsvFxuICAgICAgICAgIGlmICh0aGlzLmlzV3VHdWkoYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfkupTprLwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnlvrfotLXkurpcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5EZUd1aVJlbihzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeW+t+i0teS6uicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOaciOW+t+i0teS6ulxuICAgICAgICAgIGlmICh0aGlzLmlzWXVlRGVHdWlSZW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCfmnIjlvrfotLXkuronKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnotaZcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5TaGUoc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnotaYnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnmgalcbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5FbihzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeaBqScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWumFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkd1YW4oc3RlbSwgYnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnlrpgnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDlpKnnpo9cbiAgICAgICAgICBpZiAodGhpcy5pc1RpYW5GdShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeemjycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeWOqFxuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbkNodShzdGVtLCBicmFuY2gpKSB7XG4gICAgICAgICAgICBzaGVuU2hhLnB1c2goJ+WkqeWOqCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOWkqeW3q1xuICAgICAgICAgIGlmICh0aGlzLmlzVGlhbld1KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5berJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp5pyIXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuWXVlKGJyYW5jaCkpIHtcbiAgICAgICAgICAgIHNoZW5TaGEucHVzaCgn5aSp5pyIJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g5aSp6amsXG4gICAgICAgICAgaWYgKHRoaXMuaXNUaWFuTWEoYnJhbmNoLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgICAgICAgc2hlblNoYS5wdXNoKCflpKnpqawnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign6K6h566X5rWB5pyI56We54We5Ye66ZSZOicsIGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb250aCxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgbmFZaW4sXG4gICAgICAgIHh1bktvbmcsXG4gICAgICAgIHNoaVNoZW5HYW4sXG4gICAgICAgIGRpU2hpLFxuICAgICAgICBzaGVuU2hhXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8g6K6h566X5LqU6KGM5by65bqmXG4gICAgY29uc3Qgd3VYaW5nU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVd1WGluZ1N0cmVuZ3RoKGVpZ2h0Q2hhcik7XG5cbiAgICAvLyDorqHnrpfml6XkuLvml7roobBcbiAgICBjb25zdCByaVpodVN0cmVuZ3RoSW5mbyA9IHRoaXMuY2FsY3VsYXRlUmlaaHVTdHJlbmd0aChlaWdodENoYXIpO1xuICAgIGNvbnN0IHJpWmh1U3RyZW5ndGggPSByaVpodVN0cmVuZ3RoSW5mby5yZXN1bHQ7XG4gICAgY29uc3QgcmlaaHVTdHJlbmd0aERldGFpbHMgPSByaVpodVN0cmVuZ3RoSW5mby5kZXRhaWxzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOWfuuacrOS/oeaBr1xuICAgICAgc29sYXJEYXRlLFxuICAgICAgbHVuYXJEYXRlLFxuICAgICAgc29sYXJUaW1lLFxuXG4gICAgICAvLyDlhavlrZfkv6Hmga9cbiAgICAgIHllYXJQaWxsYXIsXG4gICAgICB5ZWFyU3RlbSxcbiAgICAgIHllYXJCcmFuY2gsXG4gICAgICB5ZWFySGlkZUdhbixcbiAgICAgIHllYXJXdVhpbmcsXG4gICAgICB5ZWFyTmFZaW4sXG5cbiAgICAgIG1vbnRoUGlsbGFyLFxuICAgICAgbW9udGhTdGVtLFxuICAgICAgbW9udGhCcmFuY2gsXG4gICAgICBtb250aEhpZGVHYW4sXG4gICAgICBtb250aFd1WGluZyxcbiAgICAgIG1vbnRoTmFZaW4sXG5cbiAgICAgIGRheVBpbGxhcixcbiAgICAgIGRheVN0ZW0sXG4gICAgICBkYXlCcmFuY2gsXG4gICAgICBkYXlIaWRlR2FuLFxuICAgICAgZGF5V3VYaW5nLFxuICAgICAgZGF5TmFZaW4sXG5cbiAgICAgIGhvdXJQaWxsYXIsXG4gICAgICBob3VyU3RlbSxcbiAgICAgIGhvdXJCcmFuY2gsXG4gICAgICBob3VySGlkZUdhbixcbiAgICAgIGhvdXJXdVhpbmcsXG4gICAgICBob3VyTmFZaW4sXG5cbiAgICAgIC8vIOeJueauiuS/oeaBr1xuICAgICAgdGFpWXVhbixcbiAgICAgIHRhaVl1YW5OYVlpbixcbiAgICAgIG1pbmdHb25nLFxuICAgICAgbWluZ0dvbmdOYVlpbixcbiAgICAgIHNoZW5Hb25nLFxuXG4gICAgICAvLyDlrozmlbTkv6Hmga9cbiAgICAgIGZ1bGxTdHJpbmc6IGx1bmFyLnRvRnVsbFN0cmluZygpLFxuXG4gICAgICAvLyDmtYHmtL7kv6Hmga9cbiAgICAgIGJhemlTZWN0OiBzZWN0LFxuICAgICAgZ2VuZGVyLFxuXG4gICAgICAvLyDnlJ/ogpbkv6Hmga9cbiAgICAgIHllYXJTaGVuZ1hpYW8sXG4gICAgICBtb250aFNoZW5nWGlhbyxcbiAgICAgIGRheVNoZW5nWGlhbyxcbiAgICAgIGhvdXJTaGVuZ1hpYW8sXG5cbiAgICAgIC8vIOWNgeelnuS/oeaBr1xuICAgICAgeWVhclNoaVNoZW4sXG4gICAgICBtb250aFNoaVNoZW4sXG4gICAgICBkYXlTaGlTaGVuLFxuICAgICAgaG91clNoaVNoZW4sXG5cbiAgICAgIC8vIOWcsOaUr+WNgeelnlxuICAgICAgeWVhclNoaVNoZW5aaGksXG4gICAgICBtb250aFNoaVNoZW5aaGksXG4gICAgICBkYXlTaGlTaGVuWmhpLFxuICAgICAgaG91clNoaVNoZW5aaGksXG5cbiAgICAgIC8vIOWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICAgICAgeWVhckRpU2hpLFxuICAgICAgbW9udGhEaVNoaSxcbiAgICAgIGRheURpU2hpLFxuICAgICAgdGltZURpU2hpLFxuXG4gICAgICAvLyDml6znqbrvvIjnqbrkuqHvvIlcbiAgICAgIHllYXJYdW5Lb25nLFxuICAgICAgbW9udGhYdW5Lb25nLFxuICAgICAgZGF5WHVuS29uZyxcbiAgICAgIHRpbWVYdW5Lb25nLFxuXG4gICAgICAvLyDmmJ/luqflkozoioLmsJRcbiAgICAgIHpvZGlhYyxcbiAgICAgIGppZVFpOiBqaWVRaSBhcyBzdHJpbmcsXG4gICAgICBuZXh0SmllUWk6IG5leHRKaWVRaSBhcyBzdHJpbmcsXG5cbiAgICAgIC8vIOWQieWHtuWSjOelnueFnlxuICAgICAgZGF5WWk6IGRheVlpIGFzIHN0cmluZ1tdLFxuICAgICAgZGF5Smk6IGRheUppIGFzIHN0cmluZ1tdLFxuICAgICAgc2hlblNoYTogc2hlblNoYSBhcyBzdHJpbmdbXSxcblxuICAgICAgLy8g5qC85bGAXG4gICAgICAuLi4oZ2VKdSA/IHsgZ2VKdSB9IDoge30pLFxuICAgICAgLi4uKGdlSnVEZXRhaWwgPyB7IGdlSnVEZXRhaWwgfSA6IHt9KSxcblxuICAgICAgLy8g6LW36L+Q5L+h5oGvXG4gICAgICBxaVl1blllYXIsXG4gICAgICBxaVl1bk1vbnRoLFxuICAgICAgcWlZdW5EYXksXG4gICAgICBxaVl1bkhvdXIsXG4gICAgICBxaVl1bkRhdGUsXG4gICAgICBxaVl1bkFnZSxcblxuICAgICAgLy8g5aSn6L+Q44CB5rWB5bm044CB5bCP6L+Q44CB5rWB5pyIXG4gICAgICBkYVl1bixcbiAgICAgIGxpdU5pYW4sXG4gICAgICB4aWFvWXVuLFxuICAgICAgbGl1WXVlLFxuXG4gICAgICAvLyDkupTooYzlvLrluqblkozml6XkuLvml7roobBcbiAgICAgIHd1WGluZ1N0cmVuZ3RoLFxuICAgICAgcmlaaHVTdHJlbmd0aCxcbiAgICAgIHJpWmh1U3RyZW5ndGhEZXRhaWxzXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blnLDmlK/lr7nlupTnmoTnlJ/ogpZcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg55Sf6IKWXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRTaGVuZ1hpYW8oYnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+m8oCcsXG4gICAgICAn5LiRJzogJ+eJmycsXG4gICAgICAn5a+FJzogJ+iZjicsXG4gICAgICAn5Y2vJzogJ+WFlCcsXG4gICAgICAn6L6wJzogJ+m+mScsXG4gICAgICAn5bezJzogJ+ibhycsXG4gICAgICAn5Y2IJzogJ+mprCcsXG4gICAgICAn5pyqJzogJ+e+iicsXG4gICAgICAn55SzJzogJ+eMtCcsXG4gICAgICAn6YWJJzogJ+m4oScsXG4gICAgICAn5oiMJzogJ+eLlycsXG4gICAgICAn5LqlJzogJ+eMqidcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFticmFuY2hdIHx8ICfmnKrnn6UnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWNgeelnlxuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubLvvIjml6XkuLvvvIlcbiAgICogQHBhcmFtIG90aGVyU3RlbSDlhbbku5blpKnlubJcbiAgICogQHJldHVybnMg5Y2B56WeXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRTaGlTaGVuKGRheVN0ZW06IHN0cmluZywgb3RoZXJTdGVtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOmYs+W5su+8mueUsuS4meaIiuW6muWjrFxuICAgIC8vIOmYtOW5su+8muS5meS4geW3sei+m+eZuFxuICAgIGNvbnN0IHlhbmdHYW4gPSAn55Sy5LiZ5oiK5bqa5aOsJztcblxuICAgIC8vIOS6lOihjOeUn+WFi+WFs+ezu++8muacqOeBq+Wcn+mHkeawtFxuICAgIGNvbnN0IHd1WGluZ09yZGVyID0gJ+acqOeBq+Wcn+mHkeawtCc7XG5cbiAgICAvLyDliKTmlq3ml6XlubLpmLTpmLNcbiAgICBjb25zdCBpc0RheVlhbmcgPSB5YW5nR2FuLmluY2x1ZGVzKGRheVN0ZW0pO1xuXG4gICAgLy8g6I635Y+W5pel5bmy5ZKM5YW25LuW5bmy55qE5LqU6KGMXG4gICAgY29uc3QgZGF5V3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGRheVN0ZW0pO1xuICAgIGNvbnN0IG90aGVyV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKG90aGVyU3RlbSk7XG5cbiAgICAvLyDliKTmlq3lhbbku5blubLpmLTpmLNcbiAgICBjb25zdCBpc090aGVyWWFuZyA9IHlhbmdHYW4uaW5jbHVkZXMob3RoZXJTdGVtKTtcblxuICAgIC8vIOiOt+WPluS6lOihjOe0ouW8lVxuICAgIGNvbnN0IGRheVd1WGluZ0luZGV4ID0gd3VYaW5nT3JkZXIuaW5kZXhPZihkYXlXdVhpbmcpO1xuICAgIGNvbnN0IG90aGVyV3VYaW5nSW5kZXggPSB3dVhpbmdPcmRlci5pbmRleE9mKG90aGVyV3VYaW5nKTtcblxuICAgIC8vIOiuoeeul+S6lOihjOWFs+ezu1xuICAgIC8vIOebuOWQjOS6lOihjFxuICAgIGlmIChkYXlXdVhpbmcgPT09IG90aGVyV3VYaW5nKSB7XG4gICAgICAvLyDpmLTpmLPnm7jlkIzkuLrmr5TogqnvvIzpmLTpmLPkuI3lkIzkuLrliqvotKJcbiAgICAgIHJldHVybiAoaXNEYXlZYW5nID09PSBpc090aGVyWWFuZykgPyAn5q+U6IKpJyA6ICfliqvotKInO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkeiAhe+8iOWJjeS4gOS4quS6lOihjO+8iVxuICAgIGNvbnN0IHNoZW5nV29JbmRleCA9IChkYXlXdVhpbmdJbmRleCAtIDEgKyA1KSAlIDU7XG4gICAgaWYgKG90aGVyV3VYaW5nSW5kZXggPT09IHNoZW5nV29JbmRleCkge1xuICAgICAgLy8g6Zi06Ziz55u45ZCM5Li66aOf56We77yM6Zi06Ziz5LiN5ZCM5Li65Lyk5a6YXG4gICAgICByZXR1cm4gKGlzRGF5WWFuZyA9PT0gaXNPdGhlcllhbmcpID8gJ+mjn+elnicgOiAn5Lyk5a6YJztcbiAgICB9XG5cbiAgICAvLyDmiJHnlJ/ogIXvvIjlkI7kuIDkuKrkupTooYzvvIlcbiAgICBjb25zdCB3b1NoZW5nSW5kZXggPSAoZGF5V3VYaW5nSW5kZXggKyAxKSAlIDU7XG4gICAgaWYgKG90aGVyV3VYaW5nSW5kZXggPT09IHdvU2hlbmdJbmRleCkge1xuICAgICAgLy8g6Zi06Ziz55u45ZCM5Li65YGP6LSi77yM6Zi06Ziz5LiN5ZCM5Li65q2j6LSiXG4gICAgICByZXR1cm4gKGlzRGF5WWFuZyA9PT0gaXNPdGhlcllhbmcpID8gJ+WBj+i0oicgOiAn5q2j6LSiJztcbiAgICB9XG5cbiAgICAvLyDlhYvmiJHogIXvvIjlkI7kuozkuKrkupTooYzvvIlcbiAgICBjb25zdCBrZVdvSW5kZXggPSAoZGF5V3VYaW5nSW5kZXggKyAyKSAlIDU7XG4gICAgaWYgKG90aGVyV3VYaW5nSW5kZXggPT09IGtlV29JbmRleCkge1xuICAgICAgLy8g6Zi06Ziz55u45ZCM5Li65LiD5p2A77yM6Zi06Ziz5LiN5ZCM5Li65q2j5a6YXG4gICAgICByZXR1cm4gKGlzRGF5WWFuZyA9PT0gaXNPdGhlcllhbmcpID8gJ+S4g+adgCcgOiAn5q2j5a6YJztcbiAgICB9XG5cbiAgICAvLyDmiJHlhYvogIXvvIjliY3kuozkuKrkupTooYzvvIlcbiAgICBjb25zdCB3b0tlSW5kZXggPSAoZGF5V3VYaW5nSW5kZXggLSAyICsgNSkgJSA1O1xuICAgIGlmIChvdGhlcld1WGluZ0luZGV4ID09PSB3b0tlSW5kZXgpIHtcbiAgICAgIC8vIOmYtOmYs+ebuOWQjOS4uuWBj+WNsO+8jOmYtOmYs+S4jeWQjOS4uuato+WNsFxuICAgICAgcmV0dXJuIChpc0RheVlhbmcgPT09IGlzT3RoZXJZYW5nKSA/ICflgY/ljbAnIDogJ+ato+WNsCc7XG4gICAgfVxuXG4gICAgcmV0dXJuICfmnKrnn6UnO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+Wkp+i/kFxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcGFyYW0gZ2VuZGVyIOaAp+WIq++8iDEt55S377yMMC3lpbPvvIlcbiAgICogQHJldHVybnMg5aSn6L+Q5pWw57uEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVEYVl1bihlaWdodENoYXI6IEVpZ2h0Q2hhciwgZ2VuZGVyOiBzdHJpbmcpOiBBcnJheTx7IHN0YXJ0WWVhcjogbnVtYmVyOyBzdGFydEFnZTogbnVtYmVyOyBnYW5aaGk6IHN0cmluZzsgbmFZaW46IHN0cmluZyB9PiB7XG4gICAgLy8g6L+Z6YeM566A5YyW5aSE55CG77yM5a6e6ZmF5bqU6K+l5L2/55SobHVuYXItdHlwZXNjcmlwdOW6k+eahOaWueazlVxuICAgIC8vIOaIluiAheagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRhWXVuOiBBcnJheTx7IHN0YXJ0WWVhcjogbnVtYmVyOyBzdGFydEFnZTogbnVtYmVyOyBnYW5aaGk6IHN0cmluZzsgbmFZaW46IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgLy8g566A5Y2V56S65L6L77ya5LuOMTDlsoHlvIDlp4vvvIzmr48xMOW5tOS4gOS4quWkp+i/kFxuICAgIGNvbnN0IHN0YXJ0QWdlID0gMTA7XG4gICAgY29uc3QgY3VycmVudFllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7XG5cbiAgICAvLyDojrflj5bmnIjmn7FcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRNb250aFpoaSgpO1xuXG4gICAgLy8g5aSp5bmy5Zyw5pSv6aG65bqPXG4gICAgY29uc3Qgc3RlbXMgPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIjtcblxuICAgIC8vIOaciOafsee0ouW8lVxuICAgIGNvbnN0IG1vbnRoU3RlbUluZGV4ID0gc3RlbXMuaW5kZXhPZihtb250aFN0ZW0pO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoSW5kZXggPSBicmFuY2hlcy5pbmRleE9mKG1vbnRoQnJhbmNoKTtcblxuICAgIC8vIOagueaNruaAp+WIq+ehruWumumhuumAhuihjFxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IChnZW5kZXIgPT09ICcxJykgPyAxIDogLTE7IC8vIOeUt+mhuuWls+mAhlxuXG4gICAgLy8g55Sf5oiQMTDkuKrlpKfov5BcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgIC8vIOiuoeeul+Wkp+i/kOW5suaUr+e0ouW8lVxuICAgICAgY29uc3Qgc3RlbUluZGV4ID0gKG1vbnRoU3RlbUluZGV4ICsgZGlyZWN0aW9uICogKGkgKyAxKSArIDEwKSAlIDEwO1xuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSAobW9udGhCcmFuY2hJbmRleCArIGRpcmVjdGlvbiAqIChpICsgMSkgKyAxMikgJSAxMjtcblxuICAgICAgLy8g5aSn6L+Q5bmy5pSvXG4gICAgICBjb25zdCBzdGVtID0gc3RlbXNbc3RlbUluZGV4XTtcbiAgICAgIGNvbnN0IGJyYW5jaCA9IGJyYW5jaGVzW2JyYW5jaEluZGV4XTtcbiAgICAgIGNvbnN0IGdhblpoaSA9IHN0ZW0gKyBicmFuY2g7XG5cbiAgICAgIC8vIOWkp+i/kOe6s+mfs1xuICAgICAgY29uc3QgbmFZaW4gPSB0aGlzLmdldE5hWWluKGdhblpoaSk7XG5cbiAgICAgIC8vIOWkp+i/kOi1t+Wni+W5tOm+hOWSjOW5tOS7vVxuICAgICAgY29uc3Qgc3RhcnRZZWFyQWdlID0gc3RhcnRBZ2UgKyBpICogMTA7XG4gICAgICBjb25zdCBzdGFydFllYXIgPSBjdXJyZW50WWVhciArIChzdGFydFllYXJBZ2UgLSAyMCk7IC8vIOWBh+iuvuW9k+WJjeW5tOm+hDIw5bKBXG5cbiAgICAgIGRhWXVuLnB1c2goe1xuICAgICAgICBzdGFydFllYXIsXG4gICAgICAgIHN0YXJ0QWdlOiBzdGFydFllYXJBZ2UsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgbmFZaW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBkYVl1bjtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfmtYHlubRcbiAgICogQHBhcmFtIGJpcnRoWWVhciDlh7rnlJ/lubRcbiAgICogQHJldHVybnMg5rWB5bm05pWw57uEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVMaXVOaWFuKGJpcnRoWWVhcjogbnVtYmVyKTogQXJyYXk8eyB5ZWFyOiBudW1iZXI7IGFnZTogbnVtYmVyOyBnYW5aaGk6IHN0cmluZzsgbmFZaW46IHN0cmluZyB9PiB7XG4gICAgY29uc3QgbGl1TmlhbjogQXJyYXk8eyB5ZWFyOiBudW1iZXI7IGFnZTogbnVtYmVyOyBnYW5aaGk6IHN0cmluZzsgbmFZaW46IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGN1cnJlbnRZZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpO1xuXG4gICAgLy8g5aSp5bmy5Zyw5pSv6aG65bqPXG4gICAgY29uc3Qgc3RlbXMgPSBcIueUsuS5meS4meS4geaIiuW3seW6mui+m+WjrOeZuFwiO1xuICAgIGNvbnN0IGJyYW5jaGVzID0gXCLlrZDkuJHlr4Xlja/ovrDlt7PljYjmnKrnlLPphYnmiIzkuqVcIjtcblxuICAgIC8vIOeUn+aIkDEw5Liq5rWB5bm077yI5b2T5YmN5bm05Y+K5pyq5p2lOeW5tO+8iVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgY29uc3QgeWVhciA9IGN1cnJlbnRZZWFyICsgaTtcbiAgICAgIGNvbnN0IGFnZSA9IHllYXIgLSBiaXJ0aFllYXIgKyAxOyAvLyDomZrlsoFcblxuICAgICAgLy8g6K6h566X5rWB5bm05bmy5pSvXG4gICAgICBjb25zdCBzdGVtSW5kZXggPSAoeWVhciAtIDQpICUgMTA7XG4gICAgICBjb25zdCBicmFuY2hJbmRleCA9ICh5ZWFyIC0gNCkgJSAxMjtcblxuICAgICAgY29uc3Qgc3RlbSA9IHN0ZW1zW3N0ZW1JbmRleF07XG4gICAgICBjb25zdCBicmFuY2ggPSBicmFuY2hlc1ticmFuY2hJbmRleF07XG4gICAgICBjb25zdCBnYW5aaGkgPSBzdGVtICsgYnJhbmNoO1xuXG4gICAgICAvLyDmtYHlubTnurPpn7NcbiAgICAgIGNvbnN0IG5hWWluID0gdGhpcy5nZXROYVlpbihnYW5aaGkpO1xuXG4gICAgICBsaXVOaWFuLnB1c2goe1xuICAgICAgICB5ZWFyLFxuICAgICAgICBhZ2UsXG4gICAgICAgIGdhblpoaSxcbiAgICAgICAgbmFZaW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsaXVOaWFuO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuoeeul+S6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcmV0dXJucyDkupTooYzlvLrluqblkozor6bnu4borqHnrpfov4fnqItcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVd1WGluZ1N0cmVuZ3RoKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKToge1xuICAgIGppbjogbnVtYmVyO1xuICAgIG11OiBudW1iZXI7XG4gICAgc2h1aTogbnVtYmVyO1xuICAgIGh1bzogbnVtYmVyO1xuICAgIHR1OiBudW1iZXI7XG4gICAgZGV0YWlsczoge1xuICAgICAgamluOiB7IHRpYW5HYW46IG51bWJlcjsgZGlaaGlDYW5nOiBudW1iZXI7IG5hWWluOiBudW1iZXI7IHNlYXNvbjogbnVtYmVyOyBtb250aERvbWluYW50OiBudW1iZXI7IGNvbWJpbmF0aW9uOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfSxcbiAgICAgIG11OiB7IHRpYW5HYW46IG51bWJlcjsgZGlaaGlDYW5nOiBudW1iZXI7IG5hWWluOiBudW1iZXI7IHNlYXNvbjogbnVtYmVyOyBtb250aERvbWluYW50OiBudW1iZXI7IGNvbWJpbmF0aW9uOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfSxcbiAgICAgIHNodWk6IHsgdGlhbkdhbjogbnVtYmVyOyBkaVpoaUNhbmc6IG51bWJlcjsgbmFZaW46IG51bWJlcjsgc2Vhc29uOiBudW1iZXI7IG1vbnRoRG9taW5hbnQ6IG51bWJlcjsgY29tYmluYXRpb246IG51bWJlcjsgdG90YWw6IG51bWJlciB9LFxuICAgICAgaHVvOiB7IHRpYW5HYW46IG51bWJlcjsgZGlaaGlDYW5nOiBudW1iZXI7IG5hWWluOiBudW1iZXI7IHNlYXNvbjogbnVtYmVyOyBtb250aERvbWluYW50OiBudW1iZXI7IGNvbWJpbmF0aW9uOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfSxcbiAgICAgIHR1OiB7IHRpYW5HYW46IG51bWJlcjsgZGlaaGlDYW5nOiBudW1iZXI7IG5hWWluOiBudW1iZXI7IHNlYXNvbjogbnVtYmVyOyBtb250aERvbWluYW50OiBudW1iZXI7IGNvbWJpbmF0aW9uOiBudW1iZXI7IHRvdGFsOiBudW1iZXIgfVxuICAgIH1cbiAgfSB7XG4gICAgLy8g5Yid5aeL5YyW5LqU6KGM5by65bqmXG4gICAgY29uc3Qgc3RyZW5ndGggPSB7XG4gICAgICBqaW46IDAsIC8vIOmHkVxuICAgICAgbXU6IDAsICAvLyDmnKhcbiAgICAgIHNodWk6IDAsIC8vIOawtFxuICAgICAgaHVvOiAwLCAgLy8g54GrXG4gICAgICB0dTogMCAgICAvLyDlnJ9cbiAgICB9O1xuXG4gICAgLy8g5Yid5aeL5YyW6K+m57uG5L+h5oGv77yM6K6w5b2V5ZCE6aG55b6X5YiGXG4gICAgY29uc3QgZGV0YWlscyA9IHtcbiAgICAgIGppbjogeyB0aWFuR2FuOiAwLCBkaVpoaUNhbmc6IDAsIG5hWWluOiAwLCBzZWFzb246IDAsIG1vbnRoRG9taW5hbnQ6IDAsIGNvbWJpbmF0aW9uOiAwLCB0b3RhbDogMCB9LFxuICAgICAgbXU6IHsgdGlhbkdhbjogMCwgZGlaaGlDYW5nOiAwLCBuYVlpbjogMCwgc2Vhc29uOiAwLCBtb250aERvbWluYW50OiAwLCBjb21iaW5hdGlvbjogMCwgdG90YWw6IDAgfSxcbiAgICAgIHNodWk6IHsgdGlhbkdhbjogMCwgZGlaaGlDYW5nOiAwLCBuYVlpbjogMCwgc2Vhc29uOiAwLCBtb250aERvbWluYW50OiAwLCBjb21iaW5hdGlvbjogMCwgdG90YWw6IDAgfSxcbiAgICAgIGh1bzogeyB0aWFuR2FuOiAwLCBkaVpoaUNhbmc6IDAsIG5hWWluOiAwLCBzZWFzb246IDAsIG1vbnRoRG9taW5hbnQ6IDAsIGNvbWJpbmF0aW9uOiAwLCB0b3RhbDogMCB9LFxuICAgICAgdHU6IHsgdGlhbkdhbjogMCwgZGlaaGlDYW5nOiAwLCBuYVlpbjogMCwgc2Vhc29uOiAwLCBtb250aERvbWluYW50OiAwLCBjb21iaW5hdGlvbjogMCwgdG90YWw6IDAgfVxuICAgIH07XG5cbiAgICAvLyAxLiDlpKnlubLpg6jliIYgLSDmjInnhafkuI3lkIzmn7HkvY3nmoTmnYPph43orqHnrpdcbiAgICAvLyDojrflj5blm5vmn7HlpKnlubJcbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCB0aW1lU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG5cbiAgICAvLyDojrflj5blm5vmn7HlpKnlubLkupTooYxcbiAgICBjb25zdCB5ZWFyU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh5ZWFyU3RlbSk7XG4gICAgY29uc3QgbW9udGhTdGVtV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKG1vbnRoU3RlbSk7XG4gICAgY29uc3QgZGF5U3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhkYXlTdGVtKTtcbiAgICBjb25zdCB0aW1lU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh0aW1lU3RlbSk7XG5cbiAgICAvLyDlpKnlubLmnYPph406IOW5tOW5sigxLjApIDwg5pyI5bmyKDIuNSkgPCDml6XlubIoMy4wKSA+IOaXtuW5sigxLjApXG4gICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aCh5ZWFyU3RlbVd1WGluZywgMS4wLCBkZXRhaWxzLCAndGlhbkdhbicpO1xuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgobW9udGhTdGVtV3VYaW5nLCAyLjUsIGRldGFpbHMsICd0aWFuR2FuJyk7IC8vIOaPkOmrmOaciOW5suadg+mHjVxuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgoZGF5U3RlbVd1WGluZywgMy4wLCBkZXRhaWxzLCAndGlhbkdhbicpO1xuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgodGltZVN0ZW1XdVhpbmcsIDEuMCwgZGV0YWlscywgJ3RpYW5HYW4nKTtcblxuICAgIC8vIDIuIOWcsOaUr+mDqOWIhiAtIOiAg+iZkeWcsOaUr+iXj+W5slxuICAgIC8vIOiOt+WPluWbm+afseWcsOaUr1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g6I635Y+W5Zyw5pSv6JeP5bmyXG4gICAgY29uc3QgeWVhckhpZGVHYW4gPSBlaWdodENoYXIuZ2V0WWVhckhpZGVHYW4oKTtcbiAgICBjb25zdCBtb250aEhpZGVHYW4gPSBlaWdodENoYXIuZ2V0TW9udGhIaWRlR2FuKCk7XG4gICAgY29uc3QgZGF5SGlkZUdhbiA9IGVpZ2h0Q2hhci5nZXREYXlIaWRlR2FuKCk7XG4gICAgY29uc3QgdGltZUhpZGVHYW4gPSBlaWdodENoYXIuZ2V0VGltZUhpZGVHYW4oKTtcblxuICAgIC8vIOWcsOaUr+iXj+W5suadg+mHjTog5bm05pSv6JeP5bmyKDAuNykgPCDmnIjmlK/ol4/lubIoMi4wKSA8IOaXpeaUr+iXj+W5sigyLjApID4g5pe25pSv6JeP5bmyKDAuNylcbiAgICB0aGlzLnByb2Nlc3NIaWRlR2FuRm9yU3RyZW5ndGgoeWVhckhpZGVHYW4sIDAuNywgZGV0YWlscyk7XG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKG1vbnRoSGlkZUdhbiwgMi4wLCBkZXRhaWxzKTsgLy8g5o+Q6auY5pyI5pSv6JeP5bmy5p2D6YeNXG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKGRheUhpZGVHYW4sIDIuMCwgZGV0YWlscyk7XG4gICAgdGhpcy5wcm9jZXNzSGlkZUdhbkZvclN0cmVuZ3RoKHRpbWVIaWRlR2FuLCAwLjcsIGRldGFpbHMpO1xuXG4gICAgLy8gMy4g57qz6Z+z5LqU6KGMIC0g6ICD6JmR57qz6Z+z55qE5b2x5ZONXG4gICAgLy8g6I635Y+W5Zub5p+x57qz6Z+zXG4gICAgY29uc3QgeWVhck5hWWluID0gZWlnaHRDaGFyLmdldFllYXJOYVlpbigpO1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSBlaWdodENoYXIuZ2V0TW9udGhOYVlpbigpO1xuICAgIGNvbnN0IGRheU5hWWluID0gZWlnaHRDaGFyLmdldERheU5hWWluKCk7XG4gICAgY29uc3QgdGltZU5hWWluID0gZWlnaHRDaGFyLmdldFRpbWVOYVlpbigpO1xuXG4gICAgLy8g5o+Q5Y+W57qz6Z+z5LqU6KGMXG4gICAgY29uc3QgeWVhck5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh5ZWFyTmFZaW4pO1xuICAgIGNvbnN0IG1vbnRoTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKG1vbnRoTmFZaW4pO1xuICAgIGNvbnN0IGRheU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyhkYXlOYVlpbik7XG4gICAgY29uc3QgdGltZU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pO1xuXG4gICAgLy8g57qz6Z+z5LqU6KGM5p2D6YeNOiDlubTmn7HnurPpn7MoMC41KSA8IOaciOafsee6s+mfsygxLjUpIDwg5pel5p+x57qz6Z+zKDEuNSkgPiDml7bmn7HnurPpn7MoMC41KVxuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgoeWVhck5hWWluV3VYaW5nLCAwLjUsIGRldGFpbHMsICduYVlpbicpO1xuICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgobW9udGhOYVlpbld1WGluZywgMS41LCBkZXRhaWxzLCAnbmFZaW4nKTsgLy8g5o+Q6auY5pyI5p+x57qz6Z+z5p2D6YeNXG4gICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aChkYXlOYVlpbld1WGluZywgMS41LCBkZXRhaWxzLCAnbmFZaW4nKTtcbiAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHRpbWVOYVlpbld1WGluZywgMC41LCBkZXRhaWxzLCAnbmFZaW4nKTtcblxuICAgIC8vIDQuIOaciOS7pOaXuuihsOiwg+aVtCAtIOagueaNruaciOS7pOWvueS6lOihjOW8uuW6pui/m+ihjOiwg+aVtFxuICAgIHRoaXMuYWRqdXN0QnlNb250aFNlYXNvbkZvclN0cmVuZ3RoKG1vbnRoQnJhbmNoLCBkZXRhaWxzKTtcblxuICAgIC8vIDUuIOaciOS7pOW9k+S7pOWKoOaIkCAtIOaWsOWinlxuICAgIHRoaXMuYWRkTW9udGhEb21pbmFudEJvbnVzKG1vbnRoQnJhbmNoLCBkZXRhaWxzKTtcblxuICAgIC8vIDYuIOWbm+afsee7hOWQiOiwg+aVtCAtIOagueaNruWbm+afsee7hOWQiOWFs+ezu+i/m+ihjOiwg+aVtFxuICAgIHRoaXMuYWRqdXN0QnlDb21iaW5hdGlvbkZvclN0cmVuZ3RoKGVpZ2h0Q2hhciwgZGV0YWlscyk7XG5cbiAgICAvLyA3LiDorqHnrpflkITkupTooYzmgLvlvpfliIZcbiAgICBkZXRhaWxzLmppbi50b3RhbCA9IGRldGFpbHMuamluLnRpYW5HYW4gKyBkZXRhaWxzLmppbi5kaVpoaUNhbmcgKyBkZXRhaWxzLmppbi5uYVlpbiArXG4gICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHMuamluLnNlYXNvbiArIGRldGFpbHMuamluLm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLmppbi5jb21iaW5hdGlvbjtcbiAgICBkZXRhaWxzLm11LnRvdGFsID0gZGV0YWlscy5tdS50aWFuR2FuICsgZGV0YWlscy5tdS5kaVpoaUNhbmcgKyBkZXRhaWxzLm11Lm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5tdS5zZWFzb24gKyBkZXRhaWxzLm11Lm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLm11LmNvbWJpbmF0aW9uO1xuICAgIGRldGFpbHMuc2h1aS50b3RhbCA9IGRldGFpbHMuc2h1aS50aWFuR2FuICsgZGV0YWlscy5zaHVpLmRpWmhpQ2FuZyArIGRldGFpbHMuc2h1aS5uYVlpbiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5zaHVpLnNlYXNvbiArIGRldGFpbHMuc2h1aS5tb250aERvbWluYW50ICsgZGV0YWlscy5zaHVpLmNvbWJpbmF0aW9uO1xuICAgIGRldGFpbHMuaHVvLnRvdGFsID0gZGV0YWlscy5odW8udGlhbkdhbiArIGRldGFpbHMuaHVvLmRpWmhpQ2FuZyArIGRldGFpbHMuaHVvLm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHMuaHVvLnNlYXNvbiArIGRldGFpbHMuaHVvLm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLmh1by5jb21iaW5hdGlvbjtcbiAgICBkZXRhaWxzLnR1LnRvdGFsID0gZGV0YWlscy50dS50aWFuR2FuICsgZGV0YWlscy50dS5kaVpoaUNhbmcgKyBkZXRhaWxzLnR1Lm5hWWluICtcbiAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlscy50dS5zZWFzb24gKyBkZXRhaWxzLnR1Lm1vbnRoRG9taW5hbnQgKyBkZXRhaWxzLnR1LmNvbWJpbmF0aW9uO1xuXG4gICAgLy8gNy4g5Zub6IiN5LqU5YWl5Yiw5LiA5L2N5bCP5pWwXG4gICAgZGV0YWlscy5qaW4udG90YWwgPSBNYXRoLnJvdW5kKGRldGFpbHMuamluLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy5tdS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy5tdS50b3RhbCAqIDEwKSAvIDEwO1xuICAgIGRldGFpbHMuc2h1aS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy5zaHVpLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy5odW8udG90YWwgPSBNYXRoLnJvdW5kKGRldGFpbHMuaHVvLnRvdGFsICogMTApIC8gMTA7XG4gICAgZGV0YWlscy50dS50b3RhbCA9IE1hdGgucm91bmQoZGV0YWlscy50dS50b3RhbCAqIDEwKSAvIDEwO1xuXG4gICAgLy8gOC4g5pu05pawc3RyZW5ndGjlr7nosaFcbiAgICBzdHJlbmd0aC5qaW4gPSBkZXRhaWxzLmppbi50b3RhbDtcbiAgICBzdHJlbmd0aC5tdSA9IGRldGFpbHMubXUudG90YWw7XG4gICAgc3RyZW5ndGguc2h1aSA9IGRldGFpbHMuc2h1aS50b3RhbDtcbiAgICBzdHJlbmd0aC5odW8gPSBkZXRhaWxzLmh1by50b3RhbDtcbiAgICBzdHJlbmd0aC50dSA9IGRldGFpbHMudHUudG90YWw7XG5cbiAgICAvLyDov5Tlm57nu5PmnpxcbiAgICByZXR1cm4ge1xuICAgICAgamluOiBzdHJlbmd0aC5qaW4sXG4gICAgICBtdTogc3RyZW5ndGgubXUsXG4gICAgICBzaHVpOiBzdHJlbmd0aC5zaHVpLFxuICAgICAgaHVvOiBzdHJlbmd0aC5odW8sXG4gICAgICB0dTogc3RyZW5ndGgudHUsXG4gICAgICBkZXRhaWxzXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlop7liqDkupTooYzlvLrluqZcbiAgICogQHBhcmFtIHd1WGluZyDkupTooYxcbiAgICogQHBhcmFtIHZhbHVlIOWinuWKoOeahOWAvFxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICogQHBhcmFtIGNhdGVnb3J5IOexu+WIq++8iHRpYW5HYW4sIGRpWmhpQ2FuZywgbmFZaW4sIHNlYXNvbiwgY29tYmluYXRpb27vvIlcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFkZFd1WGluZ1N0cmVuZ3RoKHd1WGluZzogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCBkZXRhaWxzOiBhbnksIGNhdGVnb3J5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXd1WGluZykgcmV0dXJuO1xuXG4gICAgc3dpdGNoICh3dVhpbmcpIHtcbiAgICAgIGNhc2UgJ+mHkSc6IGRldGFpbHMuamluW2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICfmnKgnOiBkZXRhaWxzLm11W2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICfmsLQnOiBkZXRhaWxzLnNodWlbY2F0ZWdvcnldICs9IHZhbHVlOyBicmVhaztcbiAgICAgIGNhc2UgJ+eBqyc6IGRldGFpbHMuaHVvW2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlICflnJ8nOiBkZXRhaWxzLnR1W2NhdGVnb3J5XSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOWkhOeQhuWcsOaUr+iXj+W5sueahOS6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gaGlkZUdhbiDol4/lubLmlbDnu4RcbiAgICogQHBhcmFtIGJhc2VXZWlnaHQg5Z+656GA5p2D6YeNXG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcHJvY2Vzc0hpZGVHYW5Gb3JTdHJlbmd0aChoaWRlR2FuOiBzdHJpbmdbXSwgYmFzZVdlaWdodDogbnVtYmVyLCBkZXRhaWxzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIWhpZGVHYW4gfHwgaGlkZUdhbi5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIC8vIOagueaNruiXj+W5suaVsOmHj+WIhumFjeadg+mHjVxuICAgIC8vIOS4gOS4quiXj+W5su+8mjEwMCXmnYPph41cbiAgICAvLyDkuKTkuKrol4/lubLvvJo2MCXlkow0MCXmnYPph41cbiAgICAvLyDkuInkuKrol4/lubLvvJo1MCXjgIEzMCXlkowyMCXmnYPph41cbiAgICBjb25zdCB3ZWlnaHRzID0gaGlkZUdhbi5sZW5ndGggPT09IDEgPyBbMS4wXSA6XG4gICAgICAgICAgICAgICAgICAgaGlkZUdhbi5sZW5ndGggPT09IDIgPyBbMC42LCAwLjRdIDpcbiAgICAgICAgICAgICAgICAgICBbMC41LCAwLjMsIDAuMl07XG5cbiAgICAvLyDkuLrmr4/kuKrol4/lubLlop7liqDnm7jlupTmnYPph43nmoTkupTooYzlvLrluqZcbiAgICBoaWRlR2FuLmZvckVhY2goKGdhbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA8IHdlaWdodHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGJhc2VXZWlnaHQgKiB3ZWlnaHRzW2luZGV4XTtcbiAgICAgICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aCh3dVhpbmcsIHZhbHVlLCBkZXRhaWxzLCAnZGlaaGlDYW5nJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5pyI5Luk5a2j6IqC6LCD5pW05LqU6KGM5by65bqmXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHBhcmFtIGRldGFpbHMg6K+m57uG5L+h5oGv5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGp1c3RCeU1vbnRoU2Vhc29uRm9yU3RyZW5ndGgobW9udGhCcmFuY2g6IHN0cmluZywgZGV0YWlsczogYW55KTogdm9pZCB7XG4gICAgLy8g5qC55o2u5pyI5Luk5a2j6IqC6LCD5pW05LqU6KGM5by65bqmXG4gICAgLy8g5pil5a2jKOWvheWNr+i+sCnvvJrmnKjml7ooKzIuMCnvvIzngavnm7goKzEuMCnvvIzlnJ/lubMoMCnvvIzph5Hlm5ooLTEuMCnvvIzmsLTmrbsoLTEuNSlcbiAgICAvLyDlpI/lraMo5bez5Y2I5pyqKe+8mueBq+aXuigrMi4wKe+8jOWcn+ebuCgrMS4wKe+8jOmHkeW5sygwKe+8jOawtOWbmigtMS4wKe+8jOacqOatuygtMS41KVxuICAgIC8vIOeni+WtoyjnlLPphYnmiIwp77ya6YeR5pe6KCsyLjAp77yM5rC055u4KCsxLjAp77yM5pyo5bmzKDAp77yM54Gr5ZuaKC0xLjAp77yM5Zyf5q27KC0xLjUpXG4gICAgLy8g5Yas5a2jKOS6peWtkOS4kSnvvJrmsLTml7ooKzIuMCnvvIzmnKjnm7goKzEuMCnvvIzngavlubMoMCnvvIzlnJ/lm5ooLTEuMCnvvIzph5HmrbsoLTEuNSlcblxuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDmmKXlraNcbiAgICAgIGRldGFpbHMubXUuc2Vhc29uICs9IDIuMDsgLy8g5pyo5pe6XG4gICAgICBkZXRhaWxzLmh1by5zZWFzb24gKz0gMS4wOyAvLyDngavnm7hcbiAgICAgIGRldGFpbHMuamluLnNlYXNvbiAtPSAxLjA7IC8vIOmHkeWbmlxuICAgICAgZGV0YWlscy5zaHVpLnNlYXNvbiAtPSAxLjU7IC8vIOawtOatu1xuICAgIH0gZWxzZSBpZiAoWyflt7MnLCAn5Y2IJywgJ+acqiddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5aSP5a2jXG4gICAgICBkZXRhaWxzLmh1by5zZWFzb24gKz0gMi4wOyAvLyDngavml7pcbiAgICAgIGRldGFpbHMudHUuc2Vhc29uICs9IDEuMDsgLy8g5Zyf55u4XG4gICAgICBkZXRhaWxzLnNodWkuc2Vhc29uIC09IDEuMDsgLy8g5rC05ZuaXG4gICAgICBkZXRhaWxzLm11LnNlYXNvbiAtPSAxLjU7IC8vIOacqOatu1xuICAgIH0gZWxzZSBpZiAoWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g56eL5a2jXG4gICAgICBkZXRhaWxzLmppbi5zZWFzb24gKz0gMi4wOyAvLyDph5Hml7pcbiAgICAgIGRldGFpbHMuc2h1aS5zZWFzb24gKz0gMS4wOyAvLyDmsLTnm7hcbiAgICAgIGRldGFpbHMuaHVvLnNlYXNvbiAtPSAxLjA7IC8vIOeBq+WbmlxuICAgICAgZGV0YWlscy50dS5zZWFzb24gLT0gMS41OyAvLyDlnJ/mrbtcbiAgICB9IGVsc2UgaWYgKFsn5LqlJywgJ+WtkCcsICfkuJEnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWGrOWto1xuICAgICAgZGV0YWlscy5zaHVpLnNlYXNvbiArPSAyLjA7IC8vIOawtOaXulxuICAgICAgZGV0YWlscy5tdS5zZWFzb24gKz0gMS4wOyAvLyDmnKjnm7hcbiAgICAgIGRldGFpbHMudHUuc2Vhc29uIC09IDEuMDsgLy8g5Zyf5ZuaXG4gICAgICBkZXRhaWxzLmppbi5zZWFzb24gLT0gMS41OyAvLyDph5HmrbtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5re75Yqg5pyI5Luk5b2T5Luk5Yqg5oiQXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHBhcmFtIGRldGFpbHMg6K+m57uG5L+h5oGv5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGRNb250aERvbWluYW50Qm9udXMobW9udGhCcmFuY2g6IHN0cmluZywgZGV0YWlsczogYW55KTogdm9pZCB7XG4gICAgLy8g5re75Yqg5pyI5Luk5b2T5Luk5Yqg5oiQXG4gICAgLy8g5pil5a2jKOWvheWNr+i+sCnvvJrmnKjlvZPku6QoKzEuNSnvvIzngavnm7jml7ooKzAuOClcbiAgICAvLyDlpI/lraMo5bez5Y2I5pyqKe+8mueBq+W9k+S7pCgrMS41Ke+8jOWcn+ebuOaXuigrMC44KVxuICAgIC8vIOeni+WtoyjnlLPphYnmiIwp77ya6YeR5b2T5LukKCsxLjUp77yM5rC055u45pe6KCswLjgpXG4gICAgLy8g5Yas5a2jKOS6peWtkOS4kSnvvJrmsLTlvZPku6QoKzEuNSnvvIzmnKjnm7jml7ooKzAuOClcblxuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDmmKXlraNcbiAgICAgIGRldGFpbHMubXUubW9udGhEb21pbmFudCArPSAxLjU7IC8vIOacqOW9k+S7pFxuICAgICAgZGV0YWlscy5odW8ubW9udGhEb21pbmFudCArPSAwLjg7IC8vIOeBq+ebuOaXulxuICAgIH0gZWxzZSBpZiAoWyflt7MnLCAn5Y2IJywgJ+acqiddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5aSP5a2jXG4gICAgICBkZXRhaWxzLmh1by5tb250aERvbWluYW50ICs9IDEuNTsgLy8g54Gr5b2T5LukXG4gICAgICBkZXRhaWxzLnR1Lm1vbnRoRG9taW5hbnQgKz0gMC44OyAvLyDlnJ/nm7jml7pcbiAgICB9IGVsc2UgaWYgKFsn55SzJywgJ+mFiScsICfmiIwnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOeni+Wto1xuICAgICAgZGV0YWlscy5qaW4ubW9udGhEb21pbmFudCArPSAxLjU7IC8vIOmHkeW9k+S7pFxuICAgICAgZGV0YWlscy5zaHVpLm1vbnRoRG9taW5hbnQgKz0gMC44OyAvLyDmsLTnm7jml7pcbiAgICB9IGVsc2UgaWYgKFsn5LqlJywgJ+WtkCcsICfkuJEnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWGrOWto1xuICAgICAgZGV0YWlscy5zaHVpLm1vbnRoRG9taW5hbnQgKz0gMS41OyAvLyDmsLTlvZPku6RcbiAgICAgIGRldGFpbHMubXUubW9udGhEb21pbmFudCArPSAwLjg7IC8vIOacqOebuOaXulxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lm5vmn7Hnu4TlkIjlhbPns7vosIPmlbTkupTooYzlvLrluqZcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIGRldGFpbHMg6K+m57uG5L+h5oGv5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGp1c3RCeUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoZWlnaHRDaGFyOiBFaWdodENoYXIsIGRldGFpbHM6IGFueSk6IHZvaWQge1xuICAgIC8vIOiOt+WPluWbm+afseW5suaUr1xuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCB5ZWFyQnJhbmNoID0gZWlnaHRDaGFyLmdldFllYXJaaGkoKTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRNb250aFpoaSgpO1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcbiAgICBjb25zdCB0aW1lQnJhbmNoID0gZWlnaHRDaGFyLmdldFRpbWVaaGkoKTtcblxuICAgIC8vIOajgOafpeWkqeW5suWQiOWMllxuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aCh5ZWFyU3RlbSwgbW9udGhTdGVtLCBkZXRhaWxzKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoeWVhclN0ZW0sIGRheVN0ZW0sIGRldGFpbHMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aCh5ZWFyU3RlbSwgdGltZVN0ZW0sIGRldGFpbHMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aChtb250aFN0ZW0sIGRheVN0ZW0sIGRldGFpbHMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25Gb3JTdHJlbmd0aChtb250aFN0ZW0sIHRpbWVTdGVtLCBkZXRhaWxzKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoZGF5U3RlbSwgdGltZVN0ZW0sIGRldGFpbHMpO1xuXG4gICAgLy8g5qOA5p+l5Zyw5pSv57uE5ZCI77yI5LiJ5ZCI44CB5LiJ5Lya44CB5YWt5ZCI562J77yJXG4gICAgdGhpcy5jaGVja0JyYW5jaFRyaXBsZUZvclN0cmVuZ3RoKHllYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIHRpbWVCcmFuY2gsIGRldGFpbHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWkqeW5suWQiOWMllxuICAgKiBAcGFyYW0gc3RlbTEg5aSp5bmyMVxuICAgKiBAcGFyYW0gc3RlbTIg5aSp5bmyMlxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNoZWNrU3RlbUNvbWJpbmF0aW9uRm9yU3RyZW5ndGgoc3RlbTE6IHN0cmluZywgc3RlbTI6IHN0cmluZywgZGV0YWlsczogYW55KTogdm9pZCB7XG4gICAgLy8g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5YyW5Zyf44CB5LmZ5bqa5ZCI5YyW6YeR44CB5LiZ6L6b5ZCI5YyW5rC044CB5LiB5aOs5ZCI5YyW5pyo44CB5oiK55m45ZCI5YyW54GrXG4gICAgY29uc3QgY29tYmluYXRpb25zOiB7W2tleTogc3RyaW5nXToge3Jlc3VsdDogc3RyaW5nLCB2YWx1ZTogbnVtYmVyfX0gPSB7XG4gICAgICAn55Sy5bexJzoge3Jlc3VsdDogJ+WcnycsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+W3seeUsic6IHtyZXN1bHQ6ICflnJ8nLCB2YWx1ZTogMC42fSxcbiAgICAgICfkuZnluponOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5bqa5LmZJzoge3Jlc3VsdDogJ+mHkScsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+S4mei+myc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogMC42fSxcbiAgICAgICfovpvkuJknOiB7cmVzdWx0OiAn5rC0JywgdmFsdWU6IDAuNn0sXG4gICAgICAn5LiB5aOsJzoge3Jlc3VsdDogJ+acqCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+WjrOS4gSc6IHtyZXN1bHQ6ICfmnKgnLCB2YWx1ZTogMC42fSxcbiAgICAgICfmiIrnmbgnOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IDAuNn0sXG4gICAgICAn55m45oiKJzoge3Jlc3VsdDogJ+eBqycsIHZhbHVlOiAwLjZ9XG4gICAgfTtcblxuICAgIGNvbnN0IGtleSA9IHN0ZW0xICsgc3RlbTI7XG4gICAgaWYgKGNvbWJpbmF0aW9uc1trZXldKSB7XG4gICAgICBjb25zdCB7cmVzdWx0LCB2YWx1ZX0gPSBjb21iaW5hdGlvbnNba2V5XTtcbiAgICAgIHRoaXMuYWRkV3VYaW5nU3RyZW5ndGgocmVzdWx0LCB2YWx1ZSwgZGV0YWlscywgJ2NvbWJpbmF0aW9uJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOajgOafpeWcsOaUr+S4ieWQiOWSjOS4ieS8mlxuICAgKiBAcGFyYW0gYnJhbmNoMSDlnLDmlK8xXG4gICAqIEBwYXJhbSBicmFuY2gyIOWcsOaUrzJcbiAgICogQHBhcmFtIGJyYW5jaDMg5Zyw5pSvM1xuICAgKiBAcGFyYW0gYnJhbmNoNCDlnLDmlK80XG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tCcmFuY2hUcmlwbGVGb3JTdHJlbmd0aChicmFuY2gxOiBzdHJpbmcsIGJyYW5jaDI6IHN0cmluZywgYnJhbmNoMzogc3RyaW5nLCBicmFuY2g0OiBzdHJpbmcsIGRldGFpbHM6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGJyYW5jaGVzID0gW2JyYW5jaDEsIGJyYW5jaDIsIGJyYW5jaDMsIGJyYW5jaDRdO1xuXG4gICAgLy8g5qOA5p+l5LiJ5ZCI5bGAXG4gICAgY29uc3Qgc2FuSGVKdSA9IHRoaXMuY2hlY2tTYW5IZUp1KGJyYW5jaGVzKTtcbiAgICBpZiAoc2FuSGVKdSkge1xuICAgICAgdGhpcy5hZGRXdVhpbmdTdHJlbmd0aChzYW5IZUp1LCAxLjIsIGRldGFpbHMsICdjb21iaW5hdGlvbicpOyAvLyDmj5Dpq5jkuInlkIjlsYDmnYPph41cbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XkuInkvJrlsYBcbiAgICBjb25zdCBzYW5IdWlKdSA9IHRoaXMuY2hlY2tTYW5IdWlKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICB0aGlzLmFkZFd1WGluZ1N0cmVuZ3RoKHNhbkh1aUp1LCAxLjAsIGRldGFpbHMsICdjb21iaW5hdGlvbicpOyAvLyDmj5Dpq5jkuInkvJrlsYDmnYPph41cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5aSE55CG5Zyw5pSv6JeP5bmy55qE5LqU6KGM5by65bqmXG4gICAqIEBwYXJhbSBoaWRlR2FuIOiXj+W5suaVsOe7hFxuICAgKiBAcGFyYW0gYmFzZVdlaWdodCDln7rnoYDmnYPph41cbiAgICogQHBhcmFtIGFkZFN0cmVuZ3RoIOWinuWKoOW8uuW6pueahOWHveaVsFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcHJvY2Vzc0hpZGVHYW4oaGlkZUdhbjogc3RyaW5nW10sIGJhc2VXZWlnaHQ6IG51bWJlciwgYWRkU3RyZW5ndGg6ICh3dVhpbmc6IHN0cmluZywgdmFsdWU6IG51bWJlcikgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICghaGlkZUdhbiB8fCBoaWRlR2FuLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgLy8g5qC55o2u6JeP5bmy5pWw6YeP5YiG6YWN5p2D6YeNXG4gICAgLy8g5LiA5Liq6JeP5bmy77yaMTAwJeadg+mHjVxuICAgIC8vIOS4pOS4quiXj+W5su+8mjYwJeWSjDQwJeadg+mHjVxuICAgIC8vIOS4ieS4quiXj+W5su+8mjUwJeOAgTMwJeWSjDIwJeadg+mHjVxuICAgIGNvbnN0IHdlaWdodHMgPSBoaWRlR2FuLmxlbmd0aCA9PT0gMSA/IFsxLjBdIDpcbiAgICAgICAgICAgICAgICAgICBoaWRlR2FuLmxlbmd0aCA9PT0gMiA/IFswLjYsIDAuNF0gOlxuICAgICAgICAgICAgICAgICAgIFswLjUsIDAuMywgMC4yXTtcblxuICAgIC8vIOS4uuavj+S4quiXj+W5suWinuWKoOebuOW6lOadg+mHjeeahOS6lOihjOW8uuW6plxuICAgIGhpZGVHYW4uZm9yRWFjaCgoZ2FuLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4IDwgd2VpZ2h0cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGFkZFN0cmVuZ3RoKHd1WGluZywgYmFzZVdlaWdodCAqIHdlaWdodHNbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlpITnkIblnLDmlK/ol4/lubLnmoTkupTooYzlvLrluqblubbov5Tlm57or6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIGhpZGVHYW4g6JeP5bmy5pWw57uEXG4gICAqIEBwYXJhbSBiYXNlV2VpZ2h0IOWfuuehgOadg+mHjVxuICAgKiBAcGFyYW0gYWRkU3RyZW5ndGgg5aKe5Yqg5by65bqm55qE5Ye95pWwXG4gICAqIEByZXR1cm5zIOavj+S4quiXj+W5sueahOadg+mHjeWAvOaVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcHJvY2Vzc0hpZGVHYW5XaXRoRGV0YWlscyhoaWRlR2FuOiBzdHJpbmdbXSwgYmFzZVdlaWdodDogbnVtYmVyLCBhZGRTdHJlbmd0aDogKHd1WGluZzogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSA9PiB2b2lkKTogbnVtYmVyW10ge1xuICAgIGlmICghaGlkZUdhbiB8fCBoaWRlR2FuLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXG4gICAgLy8g5qC55o2u6JeP5bmy5pWw6YeP5YiG6YWN5p2D6YeNXG4gICAgLy8g5LiA5Liq6JeP5bmy77yaMTAwJeadg+mHjVxuICAgIC8vIOS4pOS4quiXj+W5su+8mjYwJeWSjDQwJeadg+mHjVxuICAgIC8vIOS4ieS4quiXj+W5su+8mjUwJeOAgTMwJeWSjDIwJeadg+mHjVxuICAgIGNvbnN0IHdlaWdodHMgPSBoaWRlR2FuLmxlbmd0aCA9PT0gMSA/IFsxLjBdIDpcbiAgICAgICAgICAgICAgICAgICBoaWRlR2FuLmxlbmd0aCA9PT0gMiA/IFswLjYsIDAuNF0gOlxuICAgICAgICAgICAgICAgICAgIFswLjUsIDAuMywgMC4yXTtcblxuICAgIGNvbnN0IHZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIC8vIOS4uuavj+S4quiXj+W5suWinuWKoOebuOW6lOadg+mHjeeahOS6lOihjOW8uuW6plxuICAgIGhpZGVHYW4uZm9yRWFjaCgoZ2FuLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4IDwgd2VpZ2h0cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgd3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYmFzZVdlaWdodCAqIHdlaWdodHNbaW5kZXhdO1xuICAgICAgICBhZGRTdHJlbmd0aCh3dVhpbmcsIHZhbHVlKTtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7mnIjku6TlraPoioLosIPmlbTkupTooYzlvLrluqZcbiAgICogQHBhcmFtIG1vbnRoQnJhbmNoIOaciOaUr1xuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGp1c3RCeU1vbnRoU2Vhc29uKG1vbnRoQnJhbmNoOiBzdHJpbmcsIHN0cmVuZ3RoOiB7IGppbjogbnVtYmVyOyBtdTogbnVtYmVyOyBzaHVpOiBudW1iZXI7IGh1bzogbnVtYmVyOyB0dTogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICAvLyDmoLnmja7mnIjku6TlraPoioLosIPmlbTkupTooYzlvLrluqZcbiAgICAvLyDmmKXlraMo5a+F5Y2v6L6wKe+8muacqOaXuigrMS4wKe+8jOeBq+ebuCgrMC41Ke+8jOWcn+S8ke+8jOmHkeWbmu+8jOawtOatu1xuICAgIC8vIOWkj+Wtoyjlt7PljYjmnKop77ya54Gr5pe6KCsxLjAp77yM5Zyf55u4KCswLjUp77yM6YeR5LyR77yM5rC05Zua77yM5pyo5q27XG4gICAgLy8g56eL5a2jKOeUs+mFieaIjCnvvJrph5Hml7ooKzEuMCnvvIzmsLTnm7goKzAuNSnvvIzmnKjkvJHvvIzngavlm5rvvIzlnJ/mrbtcbiAgICAvLyDlhqzlraMo5Lql5a2Q5LiRKe+8muawtOaXuigrMS4wKe+8jOacqOebuCgrMC41Ke+8jOeBq+S8ke+8jOWcn+Wbmu+8jOmHkeatu1xuXG4gICAgaWYgKFsn5a+FJywgJ+WNrycsICfovrAnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOaYpeWto1xuICAgICAgc3RyZW5ndGgubXUgKz0gMS4wOyAvLyDmnKjml7pcbiAgICAgIHN0cmVuZ3RoLmh1byArPSAwLjU7IC8vIOeBq+ebuFxuICAgIH0gZWxzZSBpZiAoWyflt7MnLCAn5Y2IJywgJ+acqiddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5aSP5a2jXG4gICAgICBzdHJlbmd0aC5odW8gKz0gMS4wOyAvLyDngavml7pcbiAgICAgIHN0cmVuZ3RoLnR1ICs9IDAuNTsgLy8g5Zyf55u4XG4gICAgfSBlbHNlIGlmIChbJ+eUsycsICfphYknLCAn5oiMJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDnp4vlraNcbiAgICAgIHN0cmVuZ3RoLmppbiArPSAxLjA7IC8vIOmHkeaXulxuICAgICAgc3RyZW5ndGguc2h1aSArPSAwLjU7IC8vIOawtOebuFxuICAgIH0gZWxzZSBpZiAoWyfkuqUnLCAn5a2QJywgJ+S4kSddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5Yas5a2jXG4gICAgICBzdHJlbmd0aC5zaHVpICs9IDEuMDsgLy8g5rC05pe6XG4gICAgICBzdHJlbmd0aC5tdSArPSAwLjU7IC8vIOacqOebuFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7mnIjku6TlraPoioLosIPmlbTkupTooYzlvLrluqblubborrDlvZXor6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIG1vbnRoQnJhbmNoIOaciOaUr1xuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqIEBwYXJhbSBkZXRhaWxzIOivpue7huS/oeaBr+WvueixoVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYWRqdXN0QnlNb250aFNlYXNvbldpdGhEZXRhaWxzKFxuICAgIG1vbnRoQnJhbmNoOiBzdHJpbmcsXG4gICAgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSxcbiAgICBkZXRhaWxzOiBhbnlcbiAgKTogdm9pZCB7XG4gICAgbGV0IHNlYXNvbiA9ICcnO1xuICAgIGNvbnN0IGFkanVzdG1lbnRzOiB7IHd1WGluZzogc3RyaW5nOyB2YWx1ZTogbnVtYmVyOyB9W10gPSBbXTtcblxuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICAvLyDmmKXlraNcbiAgICAgIHNlYXNvbiA9ICfmmKXlraMnO1xuICAgICAgc3RyZW5ndGgubXUgKz0gMS4wOyAvLyDmnKjml7pcbiAgICAgIGFkanVzdG1lbnRzLnB1c2goeyB3dVhpbmc6ICfmnKgnLCB2YWx1ZTogMS4wIH0pO1xuXG4gICAgICBzdHJlbmd0aC5odW8gKz0gMC41OyAvLyDngavnm7hcbiAgICAgIGFkanVzdG1lbnRzLnB1c2goeyB3dVhpbmc6ICfngasnLCB2YWx1ZTogMC41IH0pO1xuICAgIH0gZWxzZSBpZiAoWyflt7MnLCAn5Y2IJywgJ+acqiddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgLy8g5aSP5a2jXG4gICAgICBzZWFzb24gPSAn5aSP5a2jJztcbiAgICAgIHN0cmVuZ3RoLmh1byArPSAxLjA7IC8vIOeBq+aXulxuICAgICAgYWRqdXN0bWVudHMucHVzaCh7IHd1WGluZzogJ+eBqycsIHZhbHVlOiAxLjAgfSk7XG5cbiAgICAgIHN0cmVuZ3RoLnR1ICs9IDAuNTsgLy8g5Zyf55u4XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn5ZyfJywgdmFsdWU6IDAuNSB9KTtcbiAgICB9IGVsc2UgaWYgKFsn55SzJywgJ+mFiScsICfmiIwnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOeni+Wto1xuICAgICAgc2Vhc29uID0gJ+eni+Wtoyc7XG4gICAgICBzdHJlbmd0aC5qaW4gKz0gMS4wOyAvLyDph5Hml7pcbiAgICAgIGFkanVzdG1lbnRzLnB1c2goeyB3dVhpbmc6ICfph5EnLCB2YWx1ZTogMS4wIH0pO1xuXG4gICAgICBzdHJlbmd0aC5zaHVpICs9IDAuNTsgLy8g5rC055u4XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn5rC0JywgdmFsdWU6IDAuNSB9KTtcbiAgICB9IGVsc2UgaWYgKFsn5LqlJywgJ+WtkCcsICfkuJEnXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIC8vIOWGrOWto1xuICAgICAgc2Vhc29uID0gJ+WGrOWtoyc7XG4gICAgICBzdHJlbmd0aC5zaHVpICs9IDEuMDsgLy8g5rC05pe6XG4gICAgICBhZGp1c3RtZW50cy5wdXNoKHsgd3VYaW5nOiAn5rC0JywgdmFsdWU6IDEuMCB9KTtcblxuICAgICAgc3RyZW5ndGgubXUgKz0gMC41OyAvLyDmnKjnm7hcbiAgICAgIGFkanVzdG1lbnRzLnB1c2goeyB3dVhpbmc6ICfmnKgnLCB2YWx1ZTogMC41IH0pO1xuICAgIH1cblxuICAgIGRldGFpbHMuc2Vhc29uQWRqdXN0LnNlYXNvbiA9IHNlYXNvbjtcbiAgICBkZXRhaWxzLnNlYXNvbkFkanVzdC5hZGp1c3RtZW50cyA9IGFkanVzdG1lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWbm+afsee7hOWQiOWFs+ezu+iwg+aVtOS6lOihjOW8uuW6plxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGp1c3RCeUNvbWJpbmF0aW9uKGVpZ2h0Q2hhcjogRWlnaHRDaGFyLCBzdHJlbmd0aDogeyBqaW46IG51bWJlcjsgbXU6IG51bWJlcjsgc2h1aTogbnVtYmVyOyBodW86IG51bWJlcjsgdHU6IG51bWJlciB9KTogdm9pZCB7XG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g5qOA5p+l5aSp5bmy5ZCI5YyWXG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbih5ZWFyU3RlbSwgbW9udGhTdGVtLCBzdHJlbmd0aCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbih5ZWFyU3RlbSwgZGF5U3RlbSwgc3RyZW5ndGgpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb24oeWVhclN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCk7XG4gICAgdGhpcy5jaGVja1N0ZW1Db21iaW5hdGlvbihtb250aFN0ZW0sIGRheVN0ZW0sIHN0cmVuZ3RoKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uKG1vbnRoU3RlbSwgdGltZVN0ZW0sIHN0cmVuZ3RoKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uKGRheVN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCk7XG5cbiAgICAvLyDmo4Dmn6XlnLDmlK/nu4TlkIjvvIjkuInlkIjjgIHkuInkvJrjgIHlha3lkIjnrYnvvIlcbiAgICAvLyDov5nph4zlj6rlrp7njrDnroDljJbniYjnmoTlnLDmlK/kuInlkIhcbiAgICB0aGlzLmNoZWNrQnJhbmNoVHJpcGxlKHllYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIHRpbWVCcmFuY2gsIHN0cmVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lm5vmn7Hnu4TlkIjlhbPns7vosIPmlbTkupTooYzlvLrluqblubborrDlvZXor6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKiBAcGFyYW0gZGV0YWlscyDor6bnu4bkv6Hmga/lr7nosaFcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFkanVzdEJ5Q29tYmluYXRpb25XaXRoRGV0YWlscyhcbiAgICBlaWdodENoYXI6IEVpZ2h0Q2hhcixcbiAgICBzdHJlbmd0aDogeyBqaW46IG51bWJlcjsgbXU6IG51bWJlcjsgc2h1aTogbnVtYmVyOyBodW86IG51bWJlcjsgdHU6IG51bWJlciB9LFxuICAgIGRldGFpbHM6IGFueVxuICApOiB2b2lkIHtcbiAgICAvLyDojrflj5blm5vmn7HlubLmlK9cbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXREYXlaaGkoKTtcbiAgICBjb25zdCB0aW1lU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG4gICAgY29uc3QgdGltZUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRUaW1lWmhpKCk7XG5cbiAgICBjb25zdCBjb21iaW5hdGlvbnM6IHsgdHlwZTogc3RyaW5nOyBzdGVtczogc3RyaW5nW107IHd1WGluZzogc3RyaW5nOyB2YWx1ZTogbnVtYmVyOyB9W10gPSBbXTtcblxuICAgIC8vIOajgOafpeWkqeW5suWQiOWMllxuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25XaXRoRGV0YWlscyh5ZWFyU3RlbSwgbW9udGhTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMoeWVhclN0ZW0sIGRheVN0ZW0sIHN0cmVuZ3RoLCBjb21iaW5hdGlvbnMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25XaXRoRGV0YWlscyh5ZWFyU3RlbSwgdGltZVN0ZW0sIHN0cmVuZ3RoLCBjb21iaW5hdGlvbnMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25XaXRoRGV0YWlscyhtb250aFN0ZW0sIGRheVN0ZW0sIHN0cmVuZ3RoLCBjb21iaW5hdGlvbnMpO1xuICAgIHRoaXMuY2hlY2tTdGVtQ29tYmluYXRpb25XaXRoRGV0YWlscyhtb250aFN0ZW0sIHRpbWVTdGVtLCBzdHJlbmd0aCwgY29tYmluYXRpb25zKTtcbiAgICB0aGlzLmNoZWNrU3RlbUNvbWJpbmF0aW9uV2l0aERldGFpbHMoZGF5U3RlbSwgdGltZVN0ZW0sIHN0cmVuZ3RoLCBjb21iaW5hdGlvbnMpO1xuXG4gICAgLy8g5qOA5p+l5Zyw5pSv57uE5ZCI77yI5LiJ5ZCI44CB5LiJ5Lya44CB5YWt5ZCI562J77yJXG4gICAgLy8g6L+Z6YeM5Y+q5a6e546w566A5YyW54mI55qE5Zyw5pSv5LiJ5ZCIXG4gICAgdGhpcy5jaGVja0JyYW5jaFRyaXBsZVdpdGhEZXRhaWxzKHllYXJCcmFuY2gsIG1vbnRoQnJhbmNoLCBkYXlCcmFuY2gsIHRpbWVCcmFuY2gsIHN0cmVuZ3RoLCBjb21iaW5hdGlvbnMpO1xuXG4gICAgZGV0YWlscy5jb21iaW5hdGlvbkFkanVzdC5jb21iaW5hdGlvbnMgPSBjb21iaW5hdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5aSp5bmy5ZCI5YyWXG4gICAqIEBwYXJhbSBzdGVtMSDlpKnlubIxXG4gICAqIEBwYXJhbSBzdGVtMiDlpKnlubIyXG4gICAqIEBwYXJhbSBzdHJlbmd0aCDkupTooYzlvLrluqblr7nosaFcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNoZWNrU3RlbUNvbWJpbmF0aW9uKHN0ZW0xOiBzdHJpbmcsIHN0ZW0yOiBzdHJpbmcsIHN0cmVuZ3RoOiB7IGppbjogbnVtYmVyOyBtdTogbnVtYmVyOyBzaHVpOiBudW1iZXI7IGh1bzogbnVtYmVyOyB0dTogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICAvLyDlpKnlubLkupTlkIjvvJrnlLLlt7HlkIjljJblnJ/jgIHkuZnluprlkIjljJbph5HjgIHkuJnovpvlkIjljJbmsLTjgIHkuIHlo6zlkIjljJbmnKjjgIHmiIrnmbjlkIjljJbngatcbiAgICBjb25zdCBjb21iaW5hdGlvbnM6IHtba2V5OiBzdHJpbmddOiB7cmVzdWx0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXJ9fSA9IHtcbiAgICAgICfnlLLlt7EnOiB7cmVzdWx0OiAn5ZyfJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5bex55SyJzoge3Jlc3VsdDogJ+WcnycsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+S5meW6mic6IHtyZXN1bHQ6ICfph5EnLCB2YWx1ZTogMC42fSxcbiAgICAgICfluprkuZknOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5LiZ6L6bJzoge3Jlc3VsdDogJ+awtCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+i+m+S4mSc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogMC42fSxcbiAgICAgICfkuIHlo6wnOiB7cmVzdWx0OiAn5pyoJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5aOs5LiBJzoge3Jlc3VsdDogJ+acqCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+aIiueZuCc6IHtyZXN1bHQ6ICfngasnLCB2YWx1ZTogMC42fSxcbiAgICAgICfnmbjmiIonOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IDAuNn1cbiAgICB9O1xuXG4gICAgY29uc3Qga2V5ID0gc3RlbTEgKyBzdGVtMjtcbiAgICBpZiAoY29tYmluYXRpb25zW2tleV0pIHtcbiAgICAgIGNvbnN0IHtyZXN1bHQsIHZhbHVlfSA9IGNvbWJpbmF0aW9uc1trZXldO1xuICAgICAgc3dpdGNoIChyZXN1bHQpIHtcbiAgICAgICAgY2FzZSAn6YeRJzogc3RyZW5ndGguamluICs9IHZhbHVlOyBicmVhaztcbiAgICAgICAgY2FzZSAn5pyoJzogc3RyZW5ndGgubXUgKz0gdmFsdWU7IGJyZWFrO1xuICAgICAgICBjYXNlICfmsLQnOiBzdHJlbmd0aC5zaHVpICs9IHZhbHVlOyBicmVhaztcbiAgICAgICAgY2FzZSAn54GrJzogc3RyZW5ndGguaHVvICs9IHZhbHVlOyBicmVhaztcbiAgICAgICAgY2FzZSAn5ZyfJzogc3RyZW5ndGgudHUgKz0gdmFsdWU7IGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XlpKnlubLlkIjljJblubborrDlvZXor6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIHN0ZW0xIOWkqeW5sjFcbiAgICogQHBhcmFtIHN0ZW0yIOWkqeW5sjJcbiAgICogQHBhcmFtIHN0cmVuZ3RoIOS6lOihjOW8uuW6puWvueixoVxuICAgKiBAcGFyYW0gY29tYmluYXRpb25zIOe7hOWQiOS/oeaBr+aVsOe7hFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tTdGVtQ29tYmluYXRpb25XaXRoRGV0YWlscyhcbiAgICBzdGVtMTogc3RyaW5nLFxuICAgIHN0ZW0yOiBzdHJpbmcsXG4gICAgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSxcbiAgICBjb21iaW5hdGlvbnM6IHsgdHlwZTogc3RyaW5nOyBzdGVtczogc3RyaW5nW107IHd1WGluZzogc3RyaW5nOyB2YWx1ZTogbnVtYmVyOyB9W11cbiAgKTogdm9pZCB7XG4gICAgLy8g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5YyW5Zyf44CB5LmZ5bqa5ZCI5YyW6YeR44CB5LiZ6L6b5ZCI5YyW5rC044CB5LiB5aOs5ZCI5YyW5pyo44CB5oiK55m45ZCI5YyW54GrXG4gICAgY29uc3QgY29tYmluYXRpb25NYXA6IHtba2V5OiBzdHJpbmddOiB7cmVzdWx0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXJ9fSA9IHtcbiAgICAgICfnlLLlt7EnOiB7cmVzdWx0OiAn5ZyfJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5bex55SyJzoge3Jlc3VsdDogJ+WcnycsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+S5meW6mic6IHtyZXN1bHQ6ICfph5EnLCB2YWx1ZTogMC42fSxcbiAgICAgICfluprkuZknOiB7cmVzdWx0OiAn6YeRJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5LiZ6L6bJzoge3Jlc3VsdDogJ+awtCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+i+m+S4mSc6IHtyZXN1bHQ6ICfmsLQnLCB2YWx1ZTogMC42fSxcbiAgICAgICfkuIHlo6wnOiB7cmVzdWx0OiAn5pyoJywgdmFsdWU6IDAuNn0sXG4gICAgICAn5aOs5LiBJzoge3Jlc3VsdDogJ+acqCcsIHZhbHVlOiAwLjZ9LFxuICAgICAgJ+aIiueZuCc6IHtyZXN1bHQ6ICfngasnLCB2YWx1ZTogMC42fSxcbiAgICAgICfnmbjmiIonOiB7cmVzdWx0OiAn54GrJywgdmFsdWU6IDAuNn1cbiAgICB9O1xuXG4gICAgY29uc3Qga2V5ID0gc3RlbTEgKyBzdGVtMjtcbiAgICBpZiAoY29tYmluYXRpb25NYXBba2V5XSkge1xuICAgICAgY29uc3Qge3Jlc3VsdCwgdmFsdWV9ID0gY29tYmluYXRpb25NYXBba2V5XTtcbiAgICAgIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgICAgIGNhc2UgJ+mHkSc6IHN0cmVuZ3RoLmppbiArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+acqCc6IHN0cmVuZ3RoLm11ICs9IHZhbHVlOyBicmVhaztcbiAgICAgICAgY2FzZSAn5rC0Jzogc3RyZW5ndGguc2h1aSArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+eBqyc6IHN0cmVuZ3RoLmh1byArPSB2YWx1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ+Wcnyc6IHN0cmVuZ3RoLnR1ICs9IHZhbHVlOyBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8g6K6w5b2V57uE5ZCI5L+h5oGvXG4gICAgICBjb21iaW5hdGlvbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICflpKnlubLkupTlkIgnLFxuICAgICAgICBzdGVtczogW3N0ZW0xLCBzdGVtMl0sXG4gICAgICAgIHd1WGluZzogcmVzdWx0LFxuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XlnLDmlK/kuInlkIjlkozkuInkvJpcbiAgICogQHBhcmFtIGJyYW5jaDEg5Zyw5pSvMVxuICAgKiBAcGFyYW0gYnJhbmNoMiDlnLDmlK8yXG4gICAqIEBwYXJhbSBicmFuY2gzIOWcsOaUrzNcbiAgICogQHBhcmFtIGJyYW5jaDQg5Zyw5pSvNFxuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja0JyYW5jaFRyaXBsZShicmFuY2gxOiBzdHJpbmcsIGJyYW5jaDI6IHN0cmluZywgYnJhbmNoMzogc3RyaW5nLCBicmFuY2g0OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZW5ndGg6IHsgamluOiBudW1iZXI7IG11OiBudW1iZXI7IHNodWk6IG51bWJlcjsgaHVvOiBudW1iZXI7IHR1OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIC8vIOWcsOaUr+S4ieWQiO+8mlxuICAgIC8vIOWvheWNiOaIjOS4ieWQiOeBq+WxgFxuICAgIC8vIOS6peWNr+acquS4ieWQiOacqOWxgFxuICAgIC8vIOeUs+WtkOi+sOS4ieWQiOawtOWxgFxuICAgIC8vIOW3s+mFieS4keS4ieWQiOmHkeWxgFxuXG4gICAgY29uc3QgYnJhbmNoZXMgPSBbYnJhbmNoMSwgYnJhbmNoMiwgYnJhbmNoMywgYnJhbmNoNF07XG5cbiAgICAvLyDmo4Dmn6XkuInlkIjlsYBcbiAgICBjb25zdCBzYW5IZUp1ID0gdGhpcy5jaGVja1NhbkhlSnUoYnJhbmNoZXMpO1xuICAgIGlmIChzYW5IZUp1KSB7XG4gICAgICBpZiAoc2FuSGVKdSA9PT0gJ+eBqycpIHN0cmVuZ3RoLmh1byArPSAxLjI7IC8vIOaPkOmrmOS4ieWQiOWxgOadg+mHjVxuICAgICAgZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+acqCcpIHN0cmVuZ3RoLm11ICs9IDEuMjtcbiAgICAgIGVsc2UgaWYgKHNhbkhlSnUgPT09ICfmsLQnKSBzdHJlbmd0aC5zaHVpICs9IDEuMjtcbiAgICAgIGVsc2UgaWYgKHNhbkhlSnUgPT09ICfph5EnKSBzdHJlbmd0aC5qaW4gKz0gMS4yO1xuICAgIH1cblxuICAgIC8vIOajgOafpeS4ieS8muWxgFxuICAgIGNvbnN0IHNhbkh1aUp1ID0gdGhpcy5jaGVja1Nhbkh1aUp1KGJyYW5jaGVzKTtcbiAgICBpZiAoc2FuSHVpSnUpIHtcbiAgICAgIGlmIChzYW5IdWlKdSA9PT0gJ+acqCcpIHN0cmVuZ3RoLm11ICs9IDEuMDsgLy8g5o+Q6auY5LiJ5Lya5bGA5p2D6YeNXG4gICAgICBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+eBqycpIHN0cmVuZ3RoLmh1byArPSAxLjA7XG4gICAgICBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+mHkScpIHN0cmVuZ3RoLmppbiArPSAxLjA7XG4gICAgICBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+awtCcpIHN0cmVuZ3RoLnNodWkgKz0gMS4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XlnLDmlK/kuInlkIjlkozkuInkvJrlubborrDlvZXor6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIGJyYW5jaDEg5Zyw5pSvMVxuICAgKiBAcGFyYW0gYnJhbmNoMiDlnLDmlK8yXG4gICAqIEBwYXJhbSBicmFuY2gzIOWcsOaUrzNcbiAgICogQHBhcmFtIGJyYW5jaDQg5Zyw5pSvNFxuICAgKiBAcGFyYW0gc3RyZW5ndGgg5LqU6KGM5by65bqm5a+56LGhXG4gICAqIEBwYXJhbSBjb21iaW5hdGlvbnMg57uE5ZCI5L+h5oGv5pWw57uEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja0JyYW5jaFRyaXBsZVdpdGhEZXRhaWxzKFxuICAgIGJyYW5jaDE6IHN0cmluZyxcbiAgICBicmFuY2gyOiBzdHJpbmcsXG4gICAgYnJhbmNoMzogc3RyaW5nLFxuICAgIGJyYW5jaDQ6IHN0cmluZyxcbiAgICBzdHJlbmd0aDogeyBqaW46IG51bWJlcjsgbXU6IG51bWJlcjsgc2h1aTogbnVtYmVyOyBodW86IG51bWJlcjsgdHU6IG51bWJlciB9LFxuICAgIGNvbWJpbmF0aW9uczogeyB0eXBlOiBzdHJpbmc7IHN0ZW1zOiBzdHJpbmdbXTsgd3VYaW5nOiBzdHJpbmc7IHZhbHVlOiBudW1iZXI7IH1bXVxuICApOiB2b2lkIHtcbiAgICBjb25zdCBicmFuY2hlcyA9IFticmFuY2gxLCBicmFuY2gyLCBicmFuY2gzLCBicmFuY2g0XTtcblxuICAgIC8vIOajgOafpeS4ieWQiOWxgFxuICAgIGNvbnN0IHNhbkhlSnUgPSB0aGlzLmNoZWNrU2FuSGVKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkhlSnUpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gMS4yOyAvLyDmj5Dpq5jkuInlkIjlsYDmnYPph41cbiAgICAgIGxldCBzYW5IZUJyYW5jaGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBpZiAoc2FuSGVKdSA9PT0gJ+eBqycpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn5a+FJywgJ+WNiCcsICfmiIwnXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLmh1byArPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+acqCcpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn5LqlJywgJ+WNrycsICfmnKonXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLm11ICs9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChzYW5IZUp1ID09PSAn5rC0Jykge1xuICAgICAgICBzYW5IZUJyYW5jaGVzID0gWyfnlLMnLCAn5a2QJywgJ+i+sCddLmZpbHRlcihiID0+IGJyYW5jaGVzLmluY2x1ZGVzKGIpKSBhcyBzdHJpbmdbXTtcbiAgICAgICAgc3RyZW5ndGguc2h1aSArPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+mHkScpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn5bezJywgJ+mFiScsICfkuJEnXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLmppbiArPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgY29tYmluYXRpb25zLnB1c2goe1xuICAgICAgICB0eXBlOiAn5Zyw5pSv5LiJ5ZCIJyxcbiAgICAgICAgc3RlbXM6IHNhbkhlQnJhbmNoZXMsXG4gICAgICAgIHd1WGluZzogc2FuSGVKdSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XkuInkvJrlsYBcbiAgICBjb25zdCBzYW5IdWlKdSA9IHRoaXMuY2hlY2tTYW5IdWlKdShicmFuY2hlcyk7XG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IDEuMDsgLy8g5o+Q6auY5LiJ5Lya5bGA5p2D6YeNXG4gICAgICBsZXQgc2FuSHVpQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGlmIChzYW5IdWlKdSA9PT0gJ+acqCcpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+WvhScsICflja8nLCAn6L6wJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5tdSArPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSHVpSnUgPT09ICfngasnKSB7XG4gICAgICAgIHNhbkh1aUJyYW5jaGVzID0gWyflt7MnLCAn5Y2IJywgJ+acqiddLmZpbHRlcihiID0+IGJyYW5jaGVzLmluY2x1ZGVzKGIpKSBhcyBzdHJpbmdbXTtcbiAgICAgICAgc3RyZW5ndGguaHVvICs9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+mHkScpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+eUsycsICfphYknLCAn5oiMJ10uZmlsdGVyKGIgPT4gYnJhbmNoZXMuaW5jbHVkZXMoYikpIGFzIHN0cmluZ1tdO1xuICAgICAgICBzdHJlbmd0aC5qaW4gKz0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKHNhbkh1aUp1ID09PSAn5rC0Jykge1xuICAgICAgICBzYW5IdWlCcmFuY2hlcyA9IFsn5LqlJywgJ+WtkCcsICfkuJEnXS5maWx0ZXIoYiA9PiBicmFuY2hlcy5pbmNsdWRlcyhiKSkgYXMgc3RyaW5nW107XG4gICAgICAgIHN0cmVuZ3RoLnNodWkgKz0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGNvbWJpbmF0aW9ucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ+WcsOaUr+S4ieS8micsXG4gICAgICAgIHN0ZW1zOiBzYW5IdWlCcmFuY2hlcyxcbiAgICAgICAgd3VYaW5nOiBzYW5IdWlKdSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5pWw57uE5piv5ZCm5YyF5ZCr5omA5pyJ5oyH5a6a5YWD57SgXG4gICAqIEBwYXJhbSBhcnJheSDmlbDnu4RcbiAgICogQHBhcmFtIGVsZW1lbnRzIOimgeajgOafpeeahOWFg+e0oFxuICAgKiBAcmV0dXJucyDmmK/lkKbljIXlkKvmiYDmnInlhYPntKBcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNvbnRhaW5zQWxsKGFycmF5OiBzdHJpbmdbXSwgZWxlbWVudHM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLmV2ZXJ5KGVsZW1lbnQgPT4gYXJyYXkuaW5jbHVkZXMoZWxlbWVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS7jue6s+mfs+Wtl+espuS4suS4reaPkOWPluS6lOihjOWxnuaAp1xuICAgKiBAcGFyYW0gbmFZaW4g57qz6Z+z5a2X56ym5LiyXG4gICAqIEByZXR1cm5zIOS6lOihjOWxnuaAp1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0TmFZaW5XdVhpbmcobmFZaW46IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFuYVlpbikgcmV0dXJuICcnO1xuXG4gICAgLy8g57qz6Z+z5LqU6KGM5o+Q5Y+W6KeE5YiZ77ya6YCa5bi457qz6Z+z5a2X56ym5Liy5qC85byP5Li6XCJYWOS6lOihjFwi77yM5aaCXCLmtbfkuK3ph5FcIuOAgVwi54KJ5Lit54GrXCLnrYlcbiAgICBpZiAobmFZaW4uZW5kc1dpdGgoJ+mHkScpIHx8IG5hWWluLmluY2x1ZGVzKCfph5EnKSkgcmV0dXJuICfph5EnO1xuICAgIGlmIChuYVlpbi5lbmRzV2l0aCgn5pyoJykgfHwgbmFZaW4uaW5jbHVkZXMoJ+acqCcpKSByZXR1cm4gJ+acqCc7XG4gICAgaWYgKG5hWWluLmVuZHNXaXRoKCfmsLQnKSB8fCBuYVlpbi5pbmNsdWRlcygn5rC0JykpIHJldHVybiAn5rC0JztcbiAgICBpZiAobmFZaW4uZW5kc1dpdGgoJ+eBqycpIHx8IG5hWWluLmluY2x1ZGVzKCfngasnKSkgcmV0dXJuICfngasnO1xuICAgIGlmIChuYVlpbi5lbmRzV2l0aCgn5ZyfJykgfHwgbmFZaW4uaW5jbHVkZXMoJ+WcnycpKSByZXR1cm4gJ+Wcnyc7XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICog6K6h566X5pel5Li75pe66KGwXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaXpeS4u+aXuuihsOS/oeaBr+Wvueixoe+8jOWMheWQq+e7k+aenOWSjOivpue7huiuoeeul+i/h+eoi1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlUmlaaHVTdHJlbmd0aChlaWdodENoYXI6IEVpZ2h0Q2hhcik6IHtcbiAgICByZXN1bHQ6IHN0cmluZztcbiAgICBkZXRhaWxzOiB7XG4gICAgICBkYXlXdVhpbmc6IHN0cmluZztcbiAgICAgIHNlYXNvbjogc3RyaW5nO1xuICAgICAgYmFzZVNjb3JlOiBudW1iZXI7XG4gICAgICBzZWFzb25FZmZlY3Q6IHN0cmluZztcbiAgICAgIGdhblJlbGF0aW9uOiBzdHJpbmc7XG4gICAgICB6aGlSZWxhdGlvbjogc3RyaW5nO1xuICAgICAgc3BlY2lhbFJlbGF0aW9uOiBzdHJpbmc7XG4gICAgICB0b3RhbFNjb3JlOiBudW1iZXI7XG4gICAgfVxuICB9IHtcbiAgICAvLyDojrflj5bml6XlubLlkozml6XlubLkupTooYxcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIC8vIOebtOaOpeS9v+eUqGdldFN0ZW1XdVhpbmfojrflj5bml6XlubLkupTooYzvvIzogIzkuI3mmK/kvb/nlKhlaWdodENoYXIuZ2V0RGF5V3VYaW5nKClcbiAgICBjb25zdCBkYXlXdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSk7XG5cbiAgICAvLyDojrflj5blm5vmn7HlubLmlK9cbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g6I635Y+W5pyI5pSv5a+55bqU55qE5a2j6IqCXG4gICAgbGV0IHNlYXNvbiA9ICcnO1xuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5pilJztcbiAgICB9IGVsc2UgaWYgKFsn5bezJywgJ+WNiCcsICfmnKonXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbiA9ICflpI8nO1xuICAgIH0gZWxzZSBpZiAoWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+eniyc7XG4gICAgfSBlbHNlIGlmIChbJ+S6pScsICflrZAnLCAn5LiRJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5YasJztcbiAgICB9XG5cbiAgICAvLyDliJ3lp4vljJbor6bnu4bkv6Hmga/lr7nosaFcbiAgICBjb25zdCBkZXRhaWxzID0ge1xuICAgICAgZGF5V3VYaW5nOiB0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSksIC8vIOehruS/neS9v+eUqOWkqeW5suS6lOihjFxuICAgICAgc2Vhc29uLFxuICAgICAgYmFzZVNjb3JlOiAxMCwgLy8g5pel5bmy5Z+656GA5YiG5YC85Li6MTBcbiAgICAgIHNlYXNvbkVmZmVjdDogJycsXG4gICAgICBnYW5SZWxhdGlvbjogJycsXG4gICAgICB6aGlSZWxhdGlvbjogJycsXG4gICAgICBzcGVjaWFsUmVsYXRpb246ICcnLFxuICAgICAgdG90YWxTY29yZTogMFxuICAgIH07XG5cbiAgICBsZXQgdG90YWxTY29yZSA9IDEwOyAvLyDln7rnoYDliIblgLxcbiAgICBsZXQgc2Vhc29uRWZmZWN0ID0gMDtcbiAgICBsZXQgZ2FuUmVsYXRpb25FZmZlY3QgPSAwO1xuICAgIGxldCB6aGlSZWxhdGlvbkVmZmVjdCA9IDA7XG4gICAgbGV0IHNwZWNpYWxSZWxhdGlvbkVmZmVjdCA9IDA7XG5cbiAgICAvLyDmt7vliqDosIPor5Xkv6Hmga9cbiAgICBjb25zb2xlLmxvZygn5a2j6IqCOicsIHNlYXNvbik7XG4gICAgY29uc29sZS5sb2coJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgIGNvbnNvbGUubG9nKCfml6XkuLvkupTooYznsbvlnos6JywgdHlwZW9mIGRheVd1WGluZyk7XG5cbiAgICAvLyAxLiDlraPoioLlvbHlk41cbiAgICBpZiAoc2Vhc29uID09PSAn5pilJykge1xuICAgICAgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5pyoJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDQ7IC8vIOaXulxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfmmKXlraPmnKjml7ogKCs0KSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn54GrJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDI7IC8vIOebuFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfmmKXlraPngavnm7ggKCsyKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5ZyfJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDA7IC8vIOW5s1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfmmKXlraPlnJ/lubMgKDApJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfph5EnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gMjsgLy8g6KGwXG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+aYpeWto+mHkeihsCAoLTIpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmsLQnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gNDsgLy8g5q27XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+aYpeWto+awtOatuyAoLTQpJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlYXNvbiA9PT0gJ+WkjycpIHtcbiAgICAgIGNvbnNvbGUubG9nKCflpI/lraPliKTmlq06JywgZGF5V3VYaW5nLmluY2x1ZGVzKCfngasnKSwgJ+eBqycuY2hhckNvZGVBdCgwKSwgZGF5V3VYaW5nLmNoYXJDb2RlQXQoMCkpO1xuICAgICAgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn54GrJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDQ7IC8vIOaXulxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflpI/lraPngavml7ogKCs0KSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5ZyfJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDI7IC8vIOebuFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflpI/lraPlnJ/nm7ggKCsyKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn6YeRJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0ICs9IDA7IC8vIOW5s1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICflpI/lraPph5HlubMgKDApJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmsLQnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gMjsgLy8g6KGwXG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+Wkj+Wto+awtOihsCAoLTIpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmnKgnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgLT0gNDsgLy8g5q27XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+Wkj+Wto+acqOatuyAoLTQpJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNlYXNvbiA9PT0gJ+eniycpIHtcbiAgICAgIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+mHkScpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSA0OyAvLyDml7pcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn56eL5a2j6YeR5pe6ICgrNCknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+awtCcpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAyOyAvLyDnm7hcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn56eL5a2j5rC055u4ICgrMiknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+acqCcpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCArPSAwOyAvLyDlubNcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn56eL5a2j5pyo5bmzICgwKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn54GrJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDI7IC8vIOihsFxuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfnp4vlraPngavoobAgKC0yKSc7XG4gICAgICB9IGVsc2UgaWYgKGRheVd1WGluZy5pbmNsdWRlcygn5ZyfJykpIHtcbiAgICAgICAgc2Vhc29uRWZmZWN0IC09IDQ7IC8vIOatu1xuICAgICAgICBkZXRhaWxzLnNlYXNvbkVmZmVjdCA9ICfnp4vlraPlnJ/mrbsgKC00KSc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzZWFzb24gPT09ICflhqwnKSB7XG4gICAgICBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmsLQnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gNDsgLy8g5pe6XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+WGrOWto+awtOaXuiAoKzQpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfmnKgnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gMjsgLy8g55u4XG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+WGrOWto+acqOebuCAoKzIpJztcbiAgICAgIH0gZWxzZSBpZiAoZGF5V3VYaW5nLmluY2x1ZGVzKCfngasnKSkge1xuICAgICAgICBzZWFzb25FZmZlY3QgKz0gMDsgLy8g5bmzXG4gICAgICAgIGRldGFpbHMuc2Vhc29uRWZmZWN0ID0gJ+WGrOWto+eBq+W5syAoMCknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+WcnycpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCAtPSAyOyAvLyDoobBcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5Yas5a2j5Zyf6KGwICgtMiknO1xuICAgICAgfSBlbHNlIGlmIChkYXlXdVhpbmcuaW5jbHVkZXMoJ+mHkScpKSB7XG4gICAgICAgIHNlYXNvbkVmZmVjdCAtPSA0OyAvLyDmrbtcbiAgICAgICAgZGV0YWlscy5zZWFzb25FZmZlY3QgPSAn5Yas5a2j6YeR5q27ICgtNCknO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIuIOWkqeW5suWvueaXpeS4u+eahOW9seWTjVxuICAgIGxldCBnYW5SZWxhdGlvbkRldGFpbHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyDlubTlubLlr7nml6XkuLvnmoTlvbHlk41cbiAgICBjb25zdCB5ZWFyU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh5ZWFyU3RlbSk7XG4gICAgY29uc29sZS5sb2coJ+W5tOW5suS6lOihjDonLCB5ZWFyU3RlbVd1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgIGlmICh5ZWFyU3RlbVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyh5ZWFyU3RlbVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDM7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5bm05bmyJHt5ZWFyU3RlbX0oJHt5ZWFyU3RlbVd1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMylgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyh5ZWFyU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDlubTlubIke3llYXJTdGVtfSgke3llYXJTdGVtV3VYaW5nfSnnlJ/ml6XkuLsgKCsyKWApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ0tlKHllYXJTdGVtV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCAtPSAyO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOW5tOW5siR7eWVhclN0ZW19KCR7eWVhclN0ZW1XdVhpbmd9KeWFi+aXpeS4uyAoLTIpYCk7XG4gICAgfVxuXG4gICAgLy8g5pyI5bmy5a+55pel5Li755qE5b2x5ZONXG4gICAgY29uc3QgbW9udGhTdGVtV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKG1vbnRoU3RlbSk7XG4gICAgY29uc29sZS5sb2coJ+aciOW5suS6lOihjDonLCBtb250aFN0ZW1XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICBpZiAobW9udGhTdGVtV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKG1vbnRoU3RlbVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDM7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5pyI5bmyJHttb250aFN0ZW19KCR7bW9udGhTdGVtV3VYaW5nfSnkuI7ml6XkuLvlkIzkupTooYwgKCszKWApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ1NoZW5nKG1vbnRoU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDmnIjlubIke21vbnRoU3RlbX0oJHttb250aFN0ZW1XdVhpbmd9KeeUn+aXpeS4uyAoKzIpYCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UobW9udGhTdGVtV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCAtPSAyO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOaciOW5siR7bW9udGhTdGVtfSgke21vbnRoU3RlbVd1WGluZ30p5YWL5pel5Li7ICgtMilgKTtcbiAgICB9XG5cbiAgICAvLyDml7blubLlr7nml6XkuLvnmoTlvbHlk41cbiAgICBjb25zdCB0aW1lU3RlbVd1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyh0aW1lU3RlbSk7XG4gICAgY29uc29sZS5sb2coJ+aXtuW5suS6lOihjDonLCB0aW1lU3RlbVd1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgIGlmICh0aW1lU3RlbVd1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyh0aW1lU3RlbVd1WGluZykpIHtcbiAgICAgIGdhblJlbGF0aW9uRWZmZWN0ICs9IDM7XG4gICAgICBnYW5SZWxhdGlvbkRldGFpbHMucHVzaChg5pe25bmyJHt0aW1lU3RlbX0oJHt0aW1lU3RlbVd1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMylgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyh0aW1lU3RlbVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgZ2FuUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgIGdhblJlbGF0aW9uRGV0YWlscy5wdXNoKGDml7blubIke3RpbWVTdGVtfSgke3RpbWVTdGVtV3VYaW5nfSnnlJ/ml6XkuLsgKCsyKWApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ0tlKHRpbWVTdGVtV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICBnYW5SZWxhdGlvbkVmZmVjdCAtPSAyO1xuICAgICAgZ2FuUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXtuW5siR7dGltZVN0ZW19KCR7dGltZVN0ZW1XdVhpbmd9KeWFi+aXpeS4uyAoLTIpYCk7XG4gICAgfVxuXG4gICAgZGV0YWlscy5nYW5SZWxhdGlvbiA9IGdhblJlbGF0aW9uRGV0YWlscy5qb2luKCfvvIwnKTtcblxuICAgIC8vIDMuIOWcsOaUr+iXj+W5suWvueaXpeS4u+eahOW9seWTjVxuICAgIGxldCB6aGlSZWxhdGlvbkRldGFpbHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyDlpITnkIblubTmlK/ol4/lubJcbiAgICBjb25zdCB5ZWFySGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbih5ZWFyQnJhbmNoKS5zcGxpdCgnLCcpO1xuICAgIGNvbnNvbGUubG9nKCflubTmlK/ol4/lubI6JywgeWVhckhpZGVHYW4pO1xuICAgIGlmICh5ZWFySGlkZUdhbi5sZW5ndGggPiAwICYmIHllYXJIaWRlR2FuWzBdICE9PSAnJykge1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgeWVhckhpZGVHYW4pIHtcbiAgICAgICAgY29uc3QgZ2FuV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnNvbGUubG9nKCflubTmlK/ol4/lubLkupTooYw6JywgZ2FuV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG4gICAgICAgIGlmIChnYW5XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXMoZ2FuV3VYaW5nKSkge1xuICAgICAgICAgIHpoaVJlbGF0aW9uRWZmZWN0ICs9IDEuNTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5bm05pSvJHt5ZWFyQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMS41KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDlubTmlK8ke3llYXJCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnnlJ/ml6XkuLsgKCsxKWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCAtPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDlubTmlK8ke3llYXJCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnlhYvml6XkuLsgKC0xKWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5aSE55CG5pyI5pSv6JeP5bmyXG4gICAgY29uc3QgbW9udGhIaWRlR2FuID0gdGhpcy5nZXRIaWRlR2FuKG1vbnRoQnJhbmNoKS5zcGxpdCgnLCcpO1xuICAgIGNvbnNvbGUubG9nKCfmnIjmlK/ol4/lubI6JywgbW9udGhIaWRlR2FuKTtcbiAgICBpZiAobW9udGhIaWRlR2FuLmxlbmd0aCA+IDAgJiYgbW9udGhIaWRlR2FuWzBdICE9PSAnJykge1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgbW9udGhIaWRlR2FuKSB7XG4gICAgICAgIGNvbnN0IGdhbld1WGluZyA9IHRoaXMuZ2V0U3RlbVd1WGluZyhnYW4pO1xuICAgICAgICBjb25zb2xlLmxvZygn5pyI5pSv6JeP5bmy5LqU6KGMOicsIGdhbld1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgICAgICBpZiAoZ2FuV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKGdhbld1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxLjU7XG4gICAgICAgICAgemhpUmVsYXRpb25EZXRhaWxzLnB1c2goYOaciOaUryR7bW9udGhCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnkuI7ml6XkuLvlkIzkupTooYwgKCsxLjUpYCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ1NoZW5nKGdhbld1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICAgIHpoaVJlbGF0aW9uRWZmZWN0ICs9IDE7XG4gICAgICAgICAgemhpUmVsYXRpb25EZXRhaWxzLnB1c2goYOaciOaUryR7bW9udGhCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnnlJ/ml6XkuLsgKCsxKWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCAtPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDmnIjmlK8ke21vbnRoQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5YWL5pel5Li7ICgtMSlgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWkhOeQhuaXpeaUr+iXj+W5slxuICAgIGNvbnN0IGRheUhpZGVHYW4gPSB0aGlzLmdldEhpZGVHYW4oZGF5QnJhbmNoKS5zcGxpdCgnLCcpO1xuICAgIGNvbnNvbGUubG9nKCfml6XmlK/ol4/lubI6JywgZGF5SGlkZUdhbik7XG4gICAgaWYgKGRheUhpZGVHYW4ubGVuZ3RoID4gMCAmJiBkYXlIaWRlR2FuWzBdICE9PSAnJykge1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgZGF5SGlkZUdhbikge1xuICAgICAgICBjb25zdCBnYW5XdVhpbmcgPSB0aGlzLmdldFN0ZW1XdVhpbmcoZ2FuKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+aXpeaUr+iXj+W5suS6lOihjDonLCBnYW5XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcbiAgICAgICAgaWYgKGdhbld1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhnYW5XdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgKz0gMS41O1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6XmlK8ke2RheUJyYW5jaH3ol4/lubIke2dhbn0oJHtnYW5XdVhpbmd9KeS4juaXpeS4u+WQjOS6lOihjCAoKzEuNSlgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoZ2FuV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgICAgemhpUmVsYXRpb25FZmZlY3QgKz0gMTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5pSvJHtkYXlCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnnlJ/ml6XkuLsgKCsxKWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCAtPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6XmlK8ke2RheUJyYW5jaH3ol4/lubIke2dhbn0oJHtnYW5XdVhpbmd9KeWFi+aXpeS4uyAoLTEpYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlpITnkIbml7bmlK/ol4/lubJcbiAgICBjb25zdCB0aW1lSGlkZUdhbiA9IHRoaXMuZ2V0SGlkZUdhbih0aW1lQnJhbmNoKS5zcGxpdCgnLCcpO1xuICAgIGNvbnNvbGUubG9nKCfml7bmlK/ol4/lubI6JywgdGltZUhpZGVHYW4pO1xuICAgIGlmICh0aW1lSGlkZUdhbi5sZW5ndGggPiAwICYmIHRpbWVIaWRlR2FuWzBdICE9PSAnJykge1xuICAgICAgZm9yIChjb25zdCBnYW4gb2YgdGltZUhpZGVHYW4pIHtcbiAgICAgICAgY29uc3QgZ2FuV3VYaW5nID0gdGhpcy5nZXRTdGVtV3VYaW5nKGdhbik7XG4gICAgICAgIGNvbnNvbGUubG9nKCfml7bmlK/ol4/lubLkupTooYw6JywgZ2FuV3VYaW5nLCAn5pel5Li75LqU6KGMOicsIGRheVd1WGluZyk7XG4gICAgICAgIGlmIChnYW5XdVhpbmcuaW5jbHVkZXMoZGF5V3VYaW5nKSB8fCBkYXlXdVhpbmcuaW5jbHVkZXMoZ2FuV3VYaW5nKSkge1xuICAgICAgICAgIHpoaVJlbGF0aW9uRWZmZWN0ICs9IDEuNTtcbiAgICAgICAgICB6aGlSZWxhdGlvbkRldGFpbHMucHVzaChg5pe25pSvJHt0aW1lQnJhbmNofeiXj+W5siR7Z2FufSgke2dhbld1WGluZ30p5LiO5pel5Li75ZCM5LqU6KGMICgrMS41KWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCArPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDml7bmlK8ke3RpbWVCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnnlJ/ml6XkuLsgKCsxKWApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShnYW5XdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgICAgICB6aGlSZWxhdGlvbkVmZmVjdCAtPSAxO1xuICAgICAgICAgIHpoaVJlbGF0aW9uRGV0YWlscy5wdXNoKGDml7bmlK8ke3RpbWVCcmFuY2h96JeP5bmyJHtnYW59KCR7Z2FuV3VYaW5nfSnlhYvml6XkuLsgKC0xKWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWlscy56aGlSZWxhdGlvbiA9IHpoaVJlbGF0aW9uRGV0YWlscy5qb2luKCfvvIwnKTtcblxuICAgIC8vIDQuIOeJueauiue7hOWQiOWFs+ezu1xuICAgIGxldCBzcGVjaWFsUmVsYXRpb25EZXRhaWxzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8g5LiJ5ZCI5bGA5qOA5p+lXG4gICAgY29uc3QgYWxsQnJhbmNoZXMgPSBbeWVhckJyYW5jaCwgbW9udGhCcmFuY2gsIGRheUJyYW5jaCwgdGltZUJyYW5jaF07XG4gICAgY29uc3Qgc2FuSGVKdSA9IHRoaXMuY2hlY2tTYW5IZUp1KGFsbEJyYW5jaGVzKTtcbiAgICBjb25zb2xlLmxvZygn5LiJ5ZCI5bGAOicsIHNhbkhlSnUpO1xuXG4gICAgaWYgKHNhbkhlSnUpIHtcbiAgICAgIGNvbnN0IHNhbkhlV3VYaW5nID0gdGhpcy5nZXRTYW5IZVd1WGluZyhzYW5IZUp1KTtcbiAgICAgIGNvbnNvbGUubG9nKCfkuInlkIjlsYDkupTooYw6Jywgc2FuSGVXdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcblxuICAgICAgLy8g6I635Y+W5LiJ5ZCI5bGA5Lit55qE5Zyw5pSvXG4gICAgICBsZXQgc2FuSGVCcmFuY2hlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChzYW5IZUp1ID09PSAn54GrJykge1xuICAgICAgICBzYW5IZUJyYW5jaGVzID0gWyflr4UnLCAn5Y2IJywgJ+aIjCddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH0gZWxzZSBpZiAoc2FuSGVKdSA9PT0gJ+awtCcpIHtcbiAgICAgICAgc2FuSGVCcmFuY2hlcyA9IFsn55SzJywgJ+WtkCcsICfovrAnXS5maWx0ZXIoYiA9PiBhbGxCcmFuY2hlcy5pbmNsdWRlcyhiKSk7XG4gICAgICB9IGVsc2UgaWYgKHNhbkhlSnUgPT09ICfmnKgnKSB7XG4gICAgICAgIHNhbkhlQnJhbmNoZXMgPSBbJ+S6pScsICflja8nLCAn5pyqJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfSBlbHNlIGlmIChzYW5IZUp1ID09PSAn6YeRJykge1xuICAgICAgICBzYW5IZUJyYW5jaGVzID0gWyflt7MnLCAn6YWJJywgJ+S4kSddLmZpbHRlcihiID0+IGFsbEJyYW5jaGVzLmluY2x1ZGVzKGIpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNhbkhlV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKHNhbkhlV3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMztcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6XkuLvlj4LkuI4ke3NhbkhlQnJhbmNoZXMuam9pbignJyl95LiJ5ZCIJHtzYW5IZUp1feWxgO+8jOS6lOihjOebuOWQjCAoKzMpYCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhzYW5IZVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGAke3NhbkhlQnJhbmNoZXMuam9pbignJyl95LiJ5ZCIJHtzYW5IZUp1feWxgOS6lOihjOeUn+aXpeS4uyAoKzIpYCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShzYW5IZVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgLT0gMjtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGAke3NhbkhlQnJhbmNoZXMuam9pbignJyl95LiJ5ZCIJHtzYW5IZUp1feWxgOS6lOihjOWFi+aXpeS4uyAoLTIpYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5LiJ5Lya5bGA5qOA5p+lXG4gICAgY29uc3Qgc2FuSHVpSnUgPSB0aGlzLmNoZWNrU2FuSHVpSnUoYWxsQnJhbmNoZXMpO1xuICAgIGNvbnNvbGUubG9nKCfkuInkvJrlsYA6Jywgc2FuSHVpSnUpO1xuXG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICBjb25zdCBzYW5IdWlXdVhpbmcgPSB0aGlzLmdldFNhbkh1aVd1WGluZyhzYW5IdWlKdSk7XG4gICAgICBjb25zb2xlLmxvZygn5LiJ5Lya5bGA5LqU6KGMOicsIHNhbkh1aVd1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuXG4gICAgICAvLyDojrflj5bkuInkvJrlsYDkuK3nmoTlnLDmlK9cbiAgICAgIGxldCBzYW5IdWlCcmFuY2hlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChzYW5IdWlKdSA9PT0gJ+acqCcpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+WvhScsICflja8nLCAn6L6wJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfSBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+eBqycpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+W3sycsICfljYgnLCAn5pyqJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfSBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+mHkScpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+eUsycsICfphYknLCAn5oiMJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfSBlbHNlIGlmIChzYW5IdWlKdSA9PT0gJ+awtCcpIHtcbiAgICAgICAgc2FuSHVpQnJhbmNoZXMgPSBbJ+S6pScsICflrZAnLCAn5LiRJ10uZmlsdGVyKGIgPT4gYWxsQnJhbmNoZXMuaW5jbHVkZXMoYikpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2FuSHVpV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKHNhbkh1aVd1WGluZykpIHtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDIuNTtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6XkuLvlj4LkuI4ke3Nhbkh1aUJyYW5jaGVzLmpvaW4oJycpfeS4ieS8miR7c2FuSHVpSnV95bGA77yM5LqU6KGM55u45ZCMICgrMi41KWApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoc2FuSHVpV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkVmZmVjdCArPSAxLjU7XG4gICAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChgJHtzYW5IdWlCcmFuY2hlcy5qb2luKCcnKX3kuInkvJoke3Nhbkh1aUp1feWxgOS6lOihjOeUn+aXpeS4uyAoKzEuNSlgKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ0tlKHNhbkh1aVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgLT0gMS41O1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25EZXRhaWxzLnB1c2goYCR7c2FuSHVpQnJhbmNoZXMuam9pbignJyl95LiJ5LyaJHtzYW5IdWlKdX3lsYDkupTooYzlhYvml6XkuLsgKC0xLjUpYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5YWt5ZCI5qOA5p+lXG4gICAgY29uc3QgbGl1SGUgPSB0aGlzLmNoZWNrTGl1SGUoYWxsQnJhbmNoZXMpO1xuICAgIGNvbnNvbGUubG9nKCflha3lkIg6JywgbGl1SGUpO1xuXG4gICAgaWYgKGxpdUhlKSB7XG4gICAgICBjb25zdCBsaXVIZVd1WGluZyA9IHRoaXMuZ2V0TGl1SGVXdVhpbmcobGl1SGUpO1xuICAgICAgY29uc29sZS5sb2coJ+WFreWQiOS6lOihjDonLCBsaXVIZVd1WGluZywgJ+aXpeS4u+S6lOihjDonLCBkYXlXdVhpbmcpO1xuICAgICAgaWYgKGxpdUhlV3VYaW5nLmluY2x1ZGVzKGRheVd1WGluZykgfHwgZGF5V3VYaW5nLmluY2x1ZGVzKGxpdUhlV3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMjtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6XkuLvlj4LkuI4ke2xpdUhlfeWQiO+8jOS6lOihjOebuOWQjCAoKzIpYCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhsaXVIZVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgKz0gMTtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGAke2xpdUhlfeWQiOS6lOihjOeUn+aXpeS4uyAoKzEpYCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdLZShsaXVIZVd1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGAke2xpdUhlfeWQiOS6lOihjOWFi+aXpeS4uyAoLTEpYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g57qz6Z+z5LqU6KGM5b2x5ZONXG4gICAgY29uc3QgZGF5TmFZaW4gPSBlaWdodENoYXIuZ2V0RGF5TmFZaW4oKTtcbiAgICBjb25zdCBkYXlOYVlpbld1WGluZyA9IHRoaXMuZ2V0TmFZaW5XdVhpbmcoZGF5TmFZaW4pO1xuICAgIGNvbnNvbGUubG9nKCfml6Xmn7HnurPpn7M6JywgZGF5TmFZaW4sICfnurPpn7PkupTooYw6JywgZGF5TmFZaW5XdVhpbmcsICfml6XkuLvkupTooYw6JywgZGF5V3VYaW5nKTtcblxuICAgIGlmIChkYXlOYVlpbld1WGluZy5pbmNsdWRlcyhkYXlXdVhpbmcpIHx8IGRheVd1WGluZy5pbmNsdWRlcyhkYXlOYVlpbld1WGluZykpIHtcbiAgICAgIHNwZWNpYWxSZWxhdGlvbkVmZmVjdCArPSAyO1xuICAgICAgc3BlY2lhbFJlbGF0aW9uRGV0YWlscy5wdXNoKGDml6Xmn7HnurPpn7MoJHtkYXlOYVlpbn0p5LiO5pel5Li75LqU6KGM55u45ZCMICgrMilgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNXdVhpbmdTaGVuZyhkYXlOYVlpbld1WGluZywgZGF5V3VYaW5nKSkge1xuICAgICAgc3BlY2lhbFJlbGF0aW9uRWZmZWN0ICs9IDE7XG4gICAgICBzcGVjaWFsUmVsYXRpb25EZXRhaWxzLnB1c2goYOaXpeafsee6s+mfsygke2RheU5hWWlufSnnlJ/ml6XkuLvkupTooYwgKCsxKWApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1d1WGluZ0tlKGRheU5hWWluV3VYaW5nLCBkYXlXdVhpbmcpKSB7XG4gICAgICBzcGVjaWFsUmVsYXRpb25FZmZlY3QgLT0gMTtcbiAgICAgIHNwZWNpYWxSZWxhdGlvbkRldGFpbHMucHVzaChg5pel5p+x57qz6Z+zKCR7ZGF5TmFZaW59KeWFi+aXpeS4u+S6lOihjCAoLTEpYCk7XG4gICAgfVxuXG4gICAgZGV0YWlscy5zcGVjaWFsUmVsYXRpb24gPSBzcGVjaWFsUmVsYXRpb25EZXRhaWxzLmpvaW4oJ++8jCcpO1xuXG4gICAgLy8g6K6h566X5oC75YiGXG4gICAgdG90YWxTY29yZSA9IGRldGFpbHMuYmFzZVNjb3JlICsgc2Vhc29uRWZmZWN0ICsgZ2FuUmVsYXRpb25FZmZlY3QgKyB6aGlSZWxhdGlvbkVmZmVjdCArIHNwZWNpYWxSZWxhdGlvbkVmZmVjdDtcbiAgICBkZXRhaWxzLnRvdGFsU2NvcmUgPSB0b3RhbFNjb3JlO1xuXG4gICAgLy8g5qC55o2u5oC75YiG5Yik5pat5pel5Li75pe66KGwXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGlmICh0b3RhbFNjb3JlID49IDE1KSB7XG4gICAgICByZXN1bHQgPSAn5p6B5pe6JztcbiAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUgPj0gMTApIHtcbiAgICAgIHJlc3VsdCA9ICfml7onO1xuICAgIH0gZWxzZSBpZiAodG90YWxTY29yZSA+PSA1KSB7XG4gICAgICByZXN1bHQgPSAn5YGP5pe6JztcbiAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUgPj0gMCkge1xuICAgICAgcmVzdWx0ID0gJ+W5s+ihoSc7XG4gICAgfSBlbHNlIGlmICh0b3RhbFNjb3JlID49IC00KSB7XG4gICAgICByZXN1bHQgPSAn5YGP5byxJztcbiAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUgPj0gLTkpIHtcbiAgICAgIHJlc3VsdCA9ICflvLEnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSAn5p6B5byxJztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0LFxuICAgICAgZGV0YWlsc1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5piv5ZCm5pyJ5LiJ5ZCI5bGAXG4gICAqIEBwYXJhbSBicmFuY2hlcyDlnLDmlK/mlbDnu4RcbiAgICogQHJldHVybnMg5LiJ5ZCI5bGA57G75Z6L5oiWbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY2hlY2tTYW5IZUp1KGJyYW5jaGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IG51bGwge1xuICAgIC8vIOS4ieWQiOWxgO+8muWvheWNiOaIjOWQiOeBq+WxgO+8jOeUs+WtkOi+sOWQiOawtOWxgO+8jOS6peWNr+acquWQiOacqOWxgO+8jOW3s+mFieS4keWQiOmHkeWxgFxuICAgIGNvbnN0IHNhbkhlUGF0dGVybnMgPSBbXG4gICAgICB7cGF0dGVybjogWyflr4UnLCAn5Y2IJywgJ+aIjCddLCB0eXBlOiAn54GrJ30sXG4gICAgICB7cGF0dGVybjogWyfnlLMnLCAn5a2QJywgJ+i+sCddLCB0eXBlOiAn5rC0J30sXG4gICAgICB7cGF0dGVybjogWyfkuqUnLCAn5Y2vJywgJ+acqiddLCB0eXBlOiAn5pyoJ30sXG4gICAgICB7cGF0dGVybjogWyflt7MnLCAn6YWJJywgJ+S4kSddLCB0eXBlOiAn6YeRJ31cbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCB7cGF0dGVybiwgdHlwZX0gb2Ygc2FuSGVQYXR0ZXJucykge1xuICAgICAgLy8g5pS26ZuG5a6e6ZmF5Ye6546w55qE5Zyw5pSvXG4gICAgICBjb25zdCBtYXRjaGVkQnJhbmNoZXMgPSBicmFuY2hlcy5maWx0ZXIoYnJhbmNoID0+IHBhdHRlcm4uaW5jbHVkZXMoYnJhbmNoKSk7XG5cbiAgICAgIC8vIOajgOafpeaYr+WQpuiHs+WwkeacieS4pOS4quS4jeWQjOeahOWcsOaUr1xuICAgICAgY29uc3QgdW5pcXVlQnJhbmNoZXMgPSBuZXcgU2V0KG1hdGNoZWRCcmFuY2hlcyk7XG5cbiAgICAgIGlmICh1bmlxdWVCcmFuY2hlcy5zaXplID49IDIpIHsgLy8g6Iez5bCR5pyJ5Lik5Liq5LiN5ZCM55qE5Zyw5pSv5b2i5oiQ5LiJ5ZCIXG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS4ieWQiOWxgOeahOS6lOihjOWxnuaAp1xuICAgKiBAcGFyYW0gc2FuSGVUeXBlIOS4ieWQiOWxgOexu+Wei1xuICAgKiBAcmV0dXJucyDkupTooYzlsZ7mgKdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFNhbkhlV3VYaW5nKHNhbkhlVHlwZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHNhbkhlVHlwZSkge1xuICAgICAgY2FzZSAn54GrJzogcmV0dXJuICfngasnO1xuICAgICAgY2FzZSAn5rC0JzogcmV0dXJuICfmsLQnO1xuICAgICAgY2FzZSAn5pyoJzogcmV0dXJuICfmnKgnO1xuICAgICAgY2FzZSAn6YeRJzogcmV0dXJuICfph5EnO1xuICAgICAgZGVmYXVsdDogcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XmmK/lkKbmnInkuInkvJrlsYBcbiAgICogQHBhcmFtIGJyYW5jaGVzIOWcsOaUr+aVsOe7hFxuICAgKiBAcmV0dXJucyDkuInkvJrlsYDnsbvlnovmiJZudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja1Nhbkh1aUp1KGJyYW5jaGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IG51bGwge1xuICAgIC8vIOS4ieS8muWxgO+8muWvheWNr+i+sOS4ieS8muacqOWxgO+8jOW3s+WNiOacquS4ieS8mueBq+WxgO+8jOeUs+mFieaIjOS4ieS8mumHkeWxgO+8jOS6peWtkOS4keS4ieS8muawtOWxgFxuICAgIGNvbnN0IHNhbkh1aVBhdHRlcm5zID0gW1xuICAgICAge3BhdHRlcm46IFsn5a+FJywgJ+WNrycsICfovrAnXSwgdHlwZTogJ+acqCd9LFxuICAgICAge3BhdHRlcm46IFsn5bezJywgJ+WNiCcsICfmnKonXSwgdHlwZTogJ+eBqyd9LFxuICAgICAge3BhdHRlcm46IFsn55SzJywgJ+mFiScsICfmiIwnXSwgdHlwZTogJ+mHkSd9LFxuICAgICAge3BhdHRlcm46IFsn5LqlJywgJ+WtkCcsICfkuJEnXSwgdHlwZTogJ+awtCd9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3Qge3BhdHRlcm4sIHR5cGV9IG9mIHNhbkh1aVBhdHRlcm5zKSB7XG4gICAgICAvLyDmlLbpm4blrp7pmYXlh7rnjrDnmoTlnLDmlK9cbiAgICAgIGNvbnN0IG1hdGNoZWRCcmFuY2hlcyA9IGJyYW5jaGVzLmZpbHRlcihicmFuY2ggPT4gcGF0dGVybi5pbmNsdWRlcyhicmFuY2gpKTtcblxuICAgICAgLy8g5qOA5p+l5piv5ZCm6Iez5bCR5pyJ5Lik5Liq5LiN5ZCM55qE5Zyw5pSvXG4gICAgICBjb25zdCB1bmlxdWVCcmFuY2hlcyA9IG5ldyBTZXQobWF0Y2hlZEJyYW5jaGVzKTtcblxuICAgICAgaWYgKHVuaXF1ZUJyYW5jaGVzLnNpemUgPj0gMikgeyAvLyDoh7PlsJHmnInkuKTkuKrkuI3lkIznmoTlnLDmlK/lvaLmiJDkuInkvJpcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5LiJ5Lya5bGA55qE5LqU6KGM5bGe5oCnXG4gICAqIEBwYXJhbSBzYW5IdWlUeXBlIOS4ieS8muWxgOexu+Wei1xuICAgKiBAcmV0dXJucyDkupTooYzlsZ7mgKdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFNhbkh1aVd1WGluZyhzYW5IdWlUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAoc2FuSHVpVHlwZSkge1xuICAgICAgY2FzZSAn5pyoJzogcmV0dXJuICfmnKgnO1xuICAgICAgY2FzZSAn54GrJzogcmV0dXJuICfngasnO1xuICAgICAgY2FzZSAn6YeRJzogcmV0dXJuICfph5EnO1xuICAgICAgY2FzZSAn5rC0JzogcmV0dXJuICfmsLQnO1xuICAgICAgZGVmYXVsdDogcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XmmK/lkKbmnInlpKnlubLkupTlkIhcbiAgICogQHBhcmFtIHN0ZW1zIOWkqeW5suaVsOe7hFxuICAgKiBAcmV0dXJucyDkupTlkIjnsbvlnovmiJZudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja1d1SGVKdShzdGVtczogc3RyaW5nW10pOiBzdHJpbmcgfCBudWxsIHtcbiAgICAvLyDlpKnlubLkupTlkIjvvJrnlLLlt7HlkIjlnJ/vvIzkuZnluprlkIjph5HvvIzkuJnovpvlkIjmsLTvvIzkuIHlo6zlkIjmnKjvvIzmiIrnmbjlkIjngatcbiAgICBjb25zdCB3dUhlUGF0dGVybnMgPSBbXG4gICAgICB7cGF0dGVybjogWyfnlLInLCAn5bexJ10sIHR5cGU6ICflnJ8nfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+S5mScsICfluponXSwgdHlwZTogJ+mHkSd9LFxuICAgICAge3BhdHRlcm46IFsn5LiZJywgJ+i+myddLCB0eXBlOiAn5rC0J30sXG4gICAgICB7cGF0dGVybjogWyfkuIEnLCAn5aOsJ10sIHR5cGU6ICfmnKgnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+aIiicsICfnmbgnXSwgdHlwZTogJ+eBqyd9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3Qge3BhdHRlcm4sIHR5cGV9IG9mIHd1SGVQYXR0ZXJucykge1xuICAgICAgbGV0IGhhc0ZpcnN0ID0gZmFsc2U7XG4gICAgICBsZXQgaGFzU2Vjb25kID0gZmFsc2U7XG5cbiAgICAgIGZvciAoY29uc3Qgc3RlbSBvZiBzdGVtcykge1xuICAgICAgICBpZiAoc3RlbSA9PT0gcGF0dGVyblswXSkgaGFzRmlyc3QgPSB0cnVlO1xuICAgICAgICBpZiAoc3RlbSA9PT0gcGF0dGVyblsxXSkgaGFzU2Vjb25kID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhhc0ZpcnN0ICYmIGhhc1NlY29uZCkge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkupTlkIjnmoTkupTooYzlsZ7mgKdcbiAgICogQHBhcmFtIHd1SGVUeXBlIOS6lOWQiOexu+Wei1xuICAgKiBAcmV0dXJucyDkupTooYzlsZ7mgKdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFd1SGVXdVhpbmcod3VIZVR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoICh3dUhlVHlwZSkge1xuICAgICAgY2FzZSAn5ZyfJzogcmV0dXJuICflnJ8nO1xuICAgICAgY2FzZSAn6YeRJzogcmV0dXJuICfph5EnO1xuICAgICAgY2FzZSAn5rC0JzogcmV0dXJuICfmsLQnO1xuICAgICAgY2FzZSAn5pyoJzogcmV0dXJuICfmnKgnO1xuICAgICAgY2FzZSAn54GrJzogcmV0dXJuICfngasnO1xuICAgICAgZGVmYXVsdDogcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XmmK/lkKbmnInlha3lkIhcbiAgICogQHBhcmFtIGJyYW5jaGVzIOWcsOaUr+aVsOe7hFxuICAgKiBAcmV0dXJucyDlha3lkIjnsbvlnovmiJZudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja0xpdUhlKGJyYW5jaGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IG51bGwge1xuICAgIC8vIOWFreWQiO+8muWtkOS4keWQiOWcn++8jOWvheS6peWQiOacqO+8jOWNr+aIjOWQiOeBq++8jOi+sOmFieWQiOmHke+8jOW3s+eUs+WQiOawtO+8jOWNiOacquWQiOWcn1xuICAgIGNvbnN0IGxpdUhlUGF0dGVybnMgPSBbXG4gICAgICB7cGF0dGVybjogWyflrZAnLCAn5LiRJ10sIHR5cGU6ICflnJ8nfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+WvhScsICfkuqUnXSwgdHlwZTogJ+acqCd9LFxuICAgICAge3BhdHRlcm46IFsn5Y2vJywgJ+aIjCddLCB0eXBlOiAn54GrJ30sXG4gICAgICB7cGF0dGVybjogWyfovrAnLCAn6YWJJ10sIHR5cGU6ICfph5EnfSxcbiAgICAgIHtwYXR0ZXJuOiBbJ+W3sycsICfnlLMnXSwgdHlwZTogJ+awtCd9LFxuICAgICAge3BhdHRlcm46IFsn5Y2IJywgJ+acqiddLCB0eXBlOiAn5ZyfJ31cbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCB7cGF0dGVybiwgdHlwZX0gb2YgbGl1SGVQYXR0ZXJucykge1xuICAgICAgbGV0IGhhc0ZpcnN0ID0gZmFsc2U7XG4gICAgICBsZXQgaGFzU2Vjb25kID0gZmFsc2U7XG5cbiAgICAgIGZvciAoY29uc3QgYnJhbmNoIG9mIGJyYW5jaGVzKSB7XG4gICAgICAgIGlmIChicmFuY2ggPT09IHBhdHRlcm5bMF0pIGhhc0ZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKGJyYW5jaCA9PT0gcGF0dGVyblsxXSkgaGFzU2Vjb25kID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhhc0ZpcnN0ICYmIGhhc1NlY29uZCkge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5blha3lkIjnmoTkupTooYzlsZ7mgKdcbiAgICogQHBhcmFtIGxpdUhlVHlwZSDlha3lkIjnsbvlnotcbiAgICogQHJldHVybnMg5LqU6KGM5bGe5oCnXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRMaXVIZVd1WGluZyhsaXVIZVR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChsaXVIZVR5cGUpIHtcbiAgICAgIGNhc2UgJ+Wcnyc6IHJldHVybiAn5ZyfJztcbiAgICAgIGNhc2UgJ+mHkSc6IHJldHVybiAn6YeRJztcbiAgICAgIGNhc2UgJ+awtCc6IHJldHVybiAn5rC0JztcbiAgICAgIGNhc2UgJ+acqCc6IHJldHVybiAn5pyoJztcbiAgICAgIGNhc2UgJ+eBqyc6IHJldHVybiAn54GrJztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIOiuoeeul+elnueFnlxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcmV0dXJucyDljIXlkKvmgLvnpZ7nhZ7lkozlkITmn7HnpZ7nhZ7nmoTlr7nosaFcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZVNoZW5TaGEoZWlnaHRDaGFyOiBFaWdodENoYXIpOiB7XG4gICAgc2hlblNoYTogc3RyaW5nW107XG4gICAgeWVhclNoZW5TaGE6IHN0cmluZ1tdO1xuICAgIG1vbnRoU2hlblNoYTogc3RyaW5nW107XG4gICAgZGF5U2hlblNoYTogc3RyaW5nW107XG4gICAgaG91clNoZW5TaGE6IHN0cmluZ1tdO1xuICB9IHtcbiAgICBjb25zdCBzaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHllYXJTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG1vbnRoU2hlblNoYTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBkYXlTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGhvdXJTaGVuU2hhOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g6I635Y+W5a2j6IqC5L+h5oGv77yI55So5LqO56ul5a2Q54We5ZKM5bCG5Yab566t55qE5Yik5pat77yJXG4gICAgbGV0IHNlYXNvbiA9ICcnO1xuICAgIGlmIChbJ+WvhScsICflja8nLCAn6L6wJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5pilJztcbiAgICB9IGVsc2UgaWYgKFsn5bezJywgJ+WNiCcsICfmnKonXS5pbmNsdWRlcyhtb250aEJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbiA9ICflpI8nO1xuICAgIH0gZWxzZSBpZiAoWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKG1vbnRoQnJhbmNoKSkge1xuICAgICAgc2Vhc29uID0gJ+eniyc7XG4gICAgfSBlbHNlIGlmIChbJ+S6pScsICflrZAnLCAn5LiRJ10uaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBzZWFzb24gPSAn5YasJztcbiAgICB9XG5cbiAgICAvLyDlpKnkuZnotLXkurpcbiAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbllpR3VpUmVuKGRheVN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeS5mei0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaUd1aVJlbihkYXlTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5LmZ6LS15Lq6Jyk7XG4gICAgfVxuXG4gICAgLy8g5paH5piMXG4gICAgaWYgKHRoaXMuaXNXZW5DaGFuZyh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5paH5piMJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5paH5piMJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2VuQ2hhbmcoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfmlofmmIwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNXZW5DaGFuZyh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5paH5piMJyk7XG4gICAgfVxuXG4gICAgLy8g5Y2O55uWXG4gICAgaWYgKHRoaXMuaXNIdWFHYWkoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WNjueblicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0h1YUdhaShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfljY7nm5YnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNIdWFHYWkoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfljY7nm5YnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNIdWFHYWkodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WNjueblicpO1xuICAgIH1cblxuICAgIC8vIOemhOelnlxuICAgIGlmICh0aGlzLmlzTHVTaGVuKHllYXJTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzTHVTaGVuKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzTHVTaGVuKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzTHVTaGVuKHRpbWVTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn56aE56WeJyk7XG4gICAgfVxuXG4gICAgLy8g5qGD6IqxXG4gICAgaWYgKHRoaXMuaXNUYW9IdWEoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1Rhb0h1YShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUYW9IdWEoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfmoYPoirEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUYW9IdWEodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+ahg+iKsScpO1xuICAgIH1cblxuICAgIC8vIOWtpOi+sFxuICAgIGlmICh0aGlzLmlzR3VDaGVuKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflraTovrAnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNHdUNoZW4obW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzR3VDaGVuKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5a2k6L6wJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzR3VDaGVuKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflraTovrAnKTtcbiAgICB9XG5cbiAgICAvLyDlr6Hlrr9cbiAgICBpZiAodGhpcy5pc0d1YVN1KHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNHdWFTdShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNHdWFTdShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WvoeWuvycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0d1YVN1KHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflr6Hlrr8nKTtcbiAgICB9XG5cbiAgICAvLyDpqb/pqaxcbiAgICBpZiAodGhpcy5pc1lpTWEoeWVhckJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1lpTWEobW9udGhCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn6am/6amsJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWWlNYShkYXlCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1lpTWEodGltZUJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+mpv+mprCcpO1xuICAgIH1cblxuICAgIC8vIOWwhuaYn1xuICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflsIbmmJ8nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaWFuZ1hpbmcoZGF5U3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5bCG5pifJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmlhbmdYaW5nKGRheVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflsIbmmJ8nKTtcbiAgICB9XG5cbiAgICAvLyDph5HnpZ5cbiAgICBpZiAodGhpcy5pc0ppblNoZW4oeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppblNoZW4obW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn6YeR56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSmluU2hlbihkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppblNoZW4odGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+mHkeelnicpO1xuICAgIH1cblxuICAgIC8vIOWkqeW+t1xuICAgIGlmICh0aGlzLmlzVGlhbkRlKHllYXJTdGVtLCB5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkRlKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkRlKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkRlKHRpbWVTdGVtLCB0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5b63Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5b635ZCIXG4gICAgaWYgKHRoaXMuaXNUaWFuRGVIZSh5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZUhlKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5b635ZCIJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkRlSGUoZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnlvrflkIgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuRGVIZSh0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeW+t+WQiCcpO1xuICAgIH1cblxuICAgIC8vIOaciOW+t1xuICAgIGlmICh0aGlzLmlzWXVlRGUoeWVhclN0ZW0pKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZdWVEZShtb250aFN0ZW0pKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWXVlRGUoZGF5U3RlbSkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5pyI5b63Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWXVlRGUodGltZVN0ZW0pKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfmnIjlvrcnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnljLtcbiAgICBpZiAodGhpcy5pc1RpYW5ZaSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5Yy7Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbllpKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeWMuycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZaSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5Yy7Jyk7XG4gICAgfVxuXG4gICAgLy8g5aSp5ZacXG4gICAgaWYgKHRoaXMuaXNUaWFuWGkoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeWWnCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5YaShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnllpwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGkoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnllpwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGkodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeWWnCcpO1xuICAgIH1cblxuICAgIC8vIOe6ouiJs1xuICAgIGlmICh0aGlzLmlzSG9uZ1lhbih5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSG9uZ1lhbihtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfnuqLoibMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNIb25nWWFuKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSG9uZ1lhbih0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn57qi6ImzJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp572XXG4gICAgaWYgKHRoaXMuaXNUaWFuTHVvKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnnvZcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuTHVvKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+Wkqee9lycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5MdW8oZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnnvZcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuTHVvKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnnvZcnKTtcbiAgICB9XG5cbiAgICAvLyDlnLDnvZFcbiAgICBpZiAodGhpcy5pc0RpV2FuZyh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5Zyw572RJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRGlXYW5nKG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WcsOe9kScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RpV2FuZyhkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WcsOe9kScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RpV2FuZyh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5Zyw572RJyk7XG4gICAgfVxuXG4gICAgLy8g576K5YiDXG4gICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+e+iuWIgycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1lhbmdSZW4oZGF5U3RlbSwgZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZYW5nUmVuKGRheVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfnvorliIMnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnnqbpcbiAgICBpZiAodGhpcy5pc1RpYW5Lb25nKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnnqbonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuS29uZyhtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnnqbonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuS29uZyhkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeepuicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5Lb25nKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnnqbonKTtcbiAgICB9XG5cbiAgICAvLyDlnLDliqtcbiAgICBpZiAodGhpcy5pc0RpSmllKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEaUppZShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEaUppZShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WcsOWKqycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RpSmllKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflnLDliqsnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnliJFcbiAgICBpZiAodGhpcy5pc1RpYW5YaW5nKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGluZyhtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWGluZyhkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeWIkScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5YaW5nKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnliJEnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnlk61cbiAgICBpZiAodGhpcy5pc1RpYW5LdSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5aSp5ZOtJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkt1KG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5LdShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeWTrScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5LdSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5aSp5ZOtJyk7XG4gICAgfVxuXG4gICAgLy8g5aSp6JmaXG4gICAgaWYgKHRoaXMuaXNUaWFuWHUoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeiZmicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5YdShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnomZonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWHUoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCflpKnomZonKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuWHUodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeiZmicpO1xuICAgIH1cblxuICAgIC8vIOWSuOaxoFxuICAgIGlmICh0aGlzLmlzWGlhbkNoaSh5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWGlhbkNoaShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflkrjmsaAnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNYaWFuQ2hpKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWGlhbkNoaSh0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5ZK45rGgJyk7XG4gICAgfVxuXG4gICAgLy8g5Lqh56WeXG4gICAgaWYgKHRoaXMuaXNXYW5nU2hlbih5ZWFyQnJhbmNoKSkge1xuICAgICAgeWVhclNoZW5TaGEucHVzaCgn5Lqh56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4obW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5Lqh56WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzV2FuZ1NoZW4oZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfkuqHnpZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNXYW5nU2hlbih0aW1lQnJhbmNoKSkge1xuICAgICAgaG91clNoZW5TaGEucHVzaCgn5Lqh56WeJyk7XG4gICAgfVxuXG4gICAgLy8g5Yqr54WeXG4gICAgaWYgKHRoaXMuaXNKaWVTaGEoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WKq+eFnicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ppZVNoYShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfliqvnhZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaWVTaGEoZGF5QnJhbmNoKSkge1xuICAgICAgZGF5U2hlblNoYS5wdXNoKCfliqvnhZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNKaWVTaGEodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WKq+eFnicpO1xuICAgIH1cblxuICAgIC8vIOeBvueFnlxuICAgIGlmICh0aGlzLmlzWmFpU2hhKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNaYWlTaGEobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWmFpU2hhKGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn54G+54WeJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWmFpU2hhKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfngb7nhZ4nKTtcbiAgICB9XG5cbiAgICAvLyDlsoHnoLRcbiAgICBpZiAodGhpcy5pc1N1aVBvKHllYXJCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflsoHnoLQnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdWlQbyhtb250aEJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflsoHnoLQnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdWlQbyhkYXlCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WygeegtCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1N1aVBvKHRpbWVCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflsoHnoLQnKTtcbiAgICB9XG5cbiAgICAvLyDlpKfogJdcbiAgICBpZiAodGhpcy5pc0RhSGFvKHllYXJCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEYUhhbyhtb250aEJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEYUhhbyhkYXlCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+Wkp+iAlycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RhSGFvKHRpbWVCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKfogJcnKTtcbiAgICB9XG5cbiAgICAvLyDkupTprLxcbiAgICBpZiAodGhpcy5pc1d1R3VpKHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfkupTprLwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNXdUd1aShtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCfkupTprLwnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNXdUd1aShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+S6lOmsvCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1d1R3VpKHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfkupTprLwnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnlvrfotLXkurpcbiAgICBpZiAodGhpcy5pc1RpYW5EZUd1aVJlbih5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeW+t+i0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZUd1aVJlbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeW+t+i0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZUd1aVJlbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeW+t+i0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5EZUd1aVJlbih0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeW+t+i0teS6uicpO1xuICAgIH1cblxuICAgIC8vIOaciOW+t+i0teS6ulxuICAgIGlmICh0aGlzLmlzWXVlRGVHdWlSZW4oeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCfmnIjlvrfotLXkuronKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNZdWVEZUd1aVJlbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+aciOW+t+i0teS6uicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1l1ZURlR3VpUmVuKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5pyI5b636LS15Lq6Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzWXVlRGVHdWlSZW4odGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCfmnIjlvrfotLXkuronKTtcbiAgICB9XG5cbiAgICAvLyDlpKnotaZcbiAgICBpZiAodGhpcy5pc1RpYW5TaGUoeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnotaYnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuU2hlKG1vbnRoU3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp6LWmJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhblNoZShkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+Wkqei1picpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5TaGUodGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnotaYnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnmgalcbiAgICBpZiAodGhpcy5pc1RpYW5Fbih5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeaBqScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5Fbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeaBqScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5FbihkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeaBqScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5Fbih0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeaBqScpO1xuICAgIH1cblxuICAgIC8vIOWkqeWumFxuICAgIGlmICh0aGlzLmlzVGlhbkd1YW4oeWVhclN0ZW0sIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnlrpgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuR3Vhbihtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeWumCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5HdWFuKGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5a6YJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkd1YW4odGltZVN0ZW0sIHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnlrpgnKTtcbiAgICB9XG5cbiAgICAvLyDlpKnnpo9cbiAgICBpZiAodGhpcy5pc1RpYW5GdSh5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeemjycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5GdShtb250aFN0ZW0sIG1vbnRoQnJhbmNoKSkge1xuICAgICAgbW9udGhTaGVuU2hhLnB1c2goJ+WkqeemjycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5GdShkYXlTdGVtLCBkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeemjycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5GdSh0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeemjycpO1xuICAgIH1cblxuICAgIC8vIOWkqeWOqFxuICAgIGlmICh0aGlzLmlzVGlhbkNodSh5ZWFyU3RlbSwgeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeWOqCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5DaHUobW9udGhTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIG1vbnRoU2hlblNoYS5wdXNoKCflpKnljqgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuQ2h1KGRheVN0ZW0sIGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5Y6oJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbkNodSh0aW1lU3RlbSwgdGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeWOqCcpO1xuICAgIH1cblxuICAgIC8vIOWkqeW3q1xuICAgIGlmICh0aGlzLmlzVGlhbld1KHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnlt6snKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuV3UobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5berJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbld1KGRheUJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp5berJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbld1KHRpbWVCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnlt6snKTtcbiAgICB9XG5cbiAgICAvLyDlpKnmnIhcbiAgICBpZiAodGhpcy5pc1RpYW5ZdWUoeWVhckJyYW5jaCkpIHtcbiAgICAgIHllYXJTaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZdWUobW9udGhCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp5pyIJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbll1ZShkYXlCcmFuY2gpKSB7XG4gICAgICBkYXlTaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RpYW5ZdWUodGltZUJyYW5jaCkpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WkqeaciCcpO1xuICAgIH1cblxuICAgIC8vIOWkqemprFxuICAgIGlmICh0aGlzLmlzVGlhbk1hKHllYXJCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICB5ZWFyU2hlblNoYS5wdXNoKCflpKnpqawnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUaWFuTWEobW9udGhCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBtb250aFNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbk1hKGRheUJyYW5jaCwgeWVhckJyYW5jaCkpIHtcbiAgICAgIGRheVNoZW5TaGEucHVzaCgn5aSp6amsJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGlhbk1hKHRpbWVCcmFuY2gsIHllYXJCcmFuY2gpKSB7XG4gICAgICBob3VyU2hlblNoYS5wdXNoKCflpKnpqawnKTtcbiAgICB9XG5cbiAgICAvLyDnq6XlrZDnhZ7vvIjmoLnmja7lraPoioLjgIHnurPpn7PkupTooYzlkozlnLDmlK/liKTmlq3vvIlcbiAgICBpZiAoc2Vhc29uICYmIHRoaXMuaXNUb25nWmlTaGEoZWlnaHRDaGFyLCBzZWFzb24pKSB7XG4gICAgICBzaGVuU2hhLnB1c2goJ+erpeWtkOeFnicpO1xuICAgIH1cblxuICAgIC8vIOWwhuWGm+eure+8iOagueaNruWto+iKguOAgeaXtuaUr+OAgeWGsuWFi+WFs+ezu+WSjOe6s+mfs+S6lOihjOWIpOaWre+8iVxuICAgIGlmIChzZWFzb24gJiYgdGhpcy5pc0ppYW5nSnVuSmlhbihlaWdodENoYXIsIHNlYXNvbikpIHtcbiAgICAgIGhvdXJTaGVuU2hhLnB1c2goJ+WwhuWGm+eurScpO1xuICAgIH1cblxuICAgIC8vIOWwhuWQhOafseelnueFnua3u+WKoOWIsOaAu+elnueFnuaVsOe7hOS4rVxuICAgIHNoZW5TaGEucHVzaCguLi55ZWFyU2hlblNoYS5tYXAocyA9PiBg5bm05p+xOiR7c31gKSk7XG4gICAgc2hlblNoYS5wdXNoKC4uLm1vbnRoU2hlblNoYS5tYXAocyA9PiBg5pyI5p+xOiR7c31gKSk7XG4gICAgc2hlblNoYS5wdXNoKC4uLmRheVNoZW5TaGEubWFwKHMgPT4gYOaXpeafsToke3N9YCkpO1xuICAgIHNoZW5TaGEucHVzaCguLi5ob3VyU2hlblNoYS5tYXAocyA9PiBg5pe25p+xOiR7c31gKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2hlblNoYSxcbiAgICAgIHllYXJTaGVuU2hhLFxuICAgICAgbW9udGhTaGVuU2hhLFxuICAgICAgZGF5U2hlblNoYSxcbiAgICAgIGhvdXJTaGVuU2hhXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnkuZnotLXkurpcbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeS5mei0teS6ulxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuWWlHdWlSZW4oZGF5U3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeS5mei0teS6uueahOiuoeeul+inhOWIme+8mlxuICAgIC8vIOeUsuaIiuW6mueJm+e+iu+8jOS5meW3sem8oOeMtOS5oe+8jOS4meS4geeMqum4oeS9je+8jOWjrOeZuOibh+WFlOiXj++8jFxuICAgIC8vIOWFrei+m+mAouiZjuWFlO+8jOatpOaYr+i0teS6uuaWueOAglxuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgICAgICfnlLInOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICfkuZknOiBbJ+WtkCcsICfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+S6pScsICfphYknXSxcbiAgICAgICfkuIEnOiBbJ+S6pScsICfphYknXSxcbiAgICAgICfmiIonOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICflt7EnOiBbJ+WtkCcsICfnlLMnXSxcbiAgICAgICfluponOiBbJ+S4kScsICfmnKonXSxcbiAgICAgICfovpsnOiBbJ+WvhScsICflja8nXSwgLy8g5L+u5q2j77ya6L6b5pel6LS15Lq65Zyo5a+F5Y2vXG4gICAgICAn5aOsJzogWyflt7MnLCAn5Y2vJ10sIC8vIOS/ruato++8muWjrOaXpei0teS6uuWcqOW3s+WNr1xuICAgICAgJ+eZuCc6IFsn5bezJywgJ+WNryddICAvLyDkv67mraPvvJrnmbjml6XotLXkurrlnKjlt7Plja9cbiAgICB9O1xuXG4gICAgcmV0dXJuIG1hcFtkYXlTdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrmlofmmIxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65paH5piMXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1dlbkNoYW5nKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5paH5piM5pif55qE6K6h566X6KeE5YiZ77yaXG4gICAgLy8g5a+F5Y2I5oiM6KeB5bez77yM55Sz5a2Q6L6w6KeB55Sz77yMXG4gICAgLy8g5Lql5Y2v5pyq6KeB5Y2I77yM5bez6YWJ5LiR6KeB5a+F44CCXG4gICAgLy8g6L+Z6YeM566A5YyW5aSE55CG77yM55u05o6l5Yik5pat5Zyw5pSv5piv5ZCm5Li65paH5piM5pifXG4gICAgcmV0dXJuIFsn5bezJywgJ+eUsycsICfljYgnLCAn5a+FJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrljY7nm5ZcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65Y2O55uWXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0h1YUdhaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWNjuebluaYn+eahOiuoeeul+inhOWIme+8mlxuICAgIC8vIOWvheWNiOaIjOingeaIjO+8jOeUs+WtkOi+sOingei+sO+8jFxuICAgIC8vIOS6peWNr+acquingeacqu+8jOW3s+mFieS4keingeS4keOAglxuICAgIC8vIOi/memHjOeugOWMluWkhOeQhu+8jOebtOaOpeWIpOaWreWcsOaUr+aYr+WQpuS4uuWNjuebluaYn1xuICAgIHJldHVybiBbJ+i+sCcsICfmiIwnLCAn5LiRJywgJ+acqiddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li656aE56WeXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrnpoTnpZ5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzTHVTaGVuKHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICflr4UnLFxuICAgICAgJ+S5mSc6ICflja8nLFxuICAgICAgJ+S4mSc6ICflt7MnLFxuICAgICAgJ+S4gSc6ICfljYgnLFxuICAgICAgJ+aIiic6ICflt7MnLFxuICAgICAgJ+W3sSc6ICfljYgnLFxuICAgICAgJ+W6mic6ICfnlLMnLFxuICAgICAgJ+i+myc6ICfphYknLFxuICAgICAgJ+WjrCc6ICfkuqUnLFxuICAgICAgJ+eZuCc6ICflrZAnXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbc3RlbV0gPT09IGJyYW5jaDtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrmoYPoirFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65qGD6IqxXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1Rhb0h1YShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+WNrycsICfphYknLCAn5a2QJywgJ+WNiCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65a2k6L6wXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWtpOi+sFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNHdUNoZW4oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfovrAnLCAn5oiMJywgJ+S4kScsICfmnKonXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWvoeWuv1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlr6Hlrr9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzR3VhU3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflr4UnLCAn55SzJywgJ+W3sycsICfkuqUnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uumpv+mprFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcGFyYW0geWVhckJyYW5jaCDlubTmlK/vvIjlj6/pgInvvIlcbiAgICogQHJldHVybnMg5piv5ZCm5Li66am/6amsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1lpTWEoYnJhbmNoOiBzdHJpbmcsIHllYXJCcmFuY2g/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDpqb/pqaznmoTorqHnrpfop4TliJnvvJpcbiAgICAvLyDlr4XljYjmiIzlubTpqazlnKjnlLPvvIznlLPlrZDovrDlubTpqazlnKjlr4XvvIzlt7PphYnkuJHlubTpqazlnKjkuqXvvIzkuqXlja/mnKrlubTpqazlnKjlt7NcblxuICAgIC8vIOWmguaenOaPkOS+m+S6huW5tOaUr++8jOWImeagueaNruW5tOaUr+WIpOaWrVxuICAgIGlmICh5ZWFyQnJhbmNoKSB7XG4gICAgICBjb25zdCB5aU1hTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICAgJ+WvhSc6ICfnlLMnLFxuICAgICAgICAn5Y2IJzogJ+eUsycsXG4gICAgICAgICfmiIwnOiAn55SzJyxcbiAgICAgICAgJ+eUsyc6ICflr4UnLFxuICAgICAgICAn5a2QJzogJ+WvhScsXG4gICAgICAgICfovrAnOiAn5a+FJyxcbiAgICAgICAgJ+W3syc6ICfkuqUnLFxuICAgICAgICAn6YWJJzogJ+S6pScsXG4gICAgICAgICfkuJEnOiAn5LqlJyxcbiAgICAgICAgJ+S6pSc6ICflt7MnLFxuICAgICAgICAn5Y2vJzogJ+W3sycsXG4gICAgICAgICfmnKonOiAn5bezJ1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHlpTWFNYXBbeWVhckJyYW5jaF0gPT09IGJyYW5jaDtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmj5DkvpvlubTmlK/vvIzliJnnroDljJblpITnkIbvvIznm7TmjqXliKTmlq3lnLDmlK/mmK/lkKbkuLrpqb/pqazmmJ9cbiAgICByZXR1cm4gWyfnlLMnLCAn5a+FJywgJ+W3sycsICfkuqUnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWwhuaYn1xuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65bCG5pifXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppYW5nWGluZyhkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5bCG5pif5LiO5pel5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgamlhbmdYaW5nTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5bezJ10sXG4gICAgICAn5LmZJzogWyfljYgnXSxcbiAgICAgICfkuJknOiBbJ+eUsyddLFxuICAgICAgJ+S4gSc6IFsn6YWJJ10sXG4gICAgICAn5oiKJzogWyfnlLMnXSxcbiAgICAgICflt7EnOiBbJ+mFiSddLFxuICAgICAgJ+W6mic6IFsn5LqlJ10sXG4gICAgICAn6L6bJzogWyflrZAnXSxcbiAgICAgICflo6wnOiBbJ+WvhSddLFxuICAgICAgJ+eZuCc6IFsn5Y2vJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIGppYW5nWGluZ01hcFtkYXlTdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrph5HnpZ5cbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li66YeR56WeXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppblNoZW4oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfnlLMnLCAn6YWJJywgJ+aIjCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5b63XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlvrdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkRlKHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKnlvrfkuI7lpKnlubLnmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuRGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfkuIEnLFxuICAgICAgJ+S5mSc6ICfnlLMnLFxuICAgICAgJ+S4mSc6ICflo6wnLFxuICAgICAgJ+S4gSc6ICfovpsnLFxuICAgICAgJ+aIiic6ICfkuJknLFxuICAgICAgJ+W3sSc6ICfkuZknLFxuICAgICAgJ+W6mic6ICfmiIonLFxuICAgICAgJ+i+myc6ICflt7EnLFxuICAgICAgJ+WjrCc6ICfluponLFxuICAgICAgJ+eZuCc6ICfnmbgnXG4gICAgfTtcblxuICAgIC8vIOWkqeW+t+S4juWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5EZUJyYW5jaE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5LiBJzogJ+WNiCcsXG4gICAgICAn55SzJzogJ+eUsycsXG4gICAgICAn5aOsJzogJ+S6pScsXG4gICAgICAn6L6bJzogJ+mFiScsXG4gICAgICAn5LiZJzogJ+W3sycsXG4gICAgICAn5LmZJzogJ+WNrycsXG4gICAgICAn5oiKJzogJ+i+sCcsXG4gICAgICAn5bexJzogJ+S4kScsXG4gICAgICAn5bqaJzogJ+eUsycsXG4gICAgICAn55m4JzogJ+WtkCdcbiAgICB9O1xuXG4gICAgY29uc3QgdGlhbkRlU3RlbSA9IHRpYW5EZU1hcFtzdGVtXTtcbiAgICBjb25zdCB0aWFuRGVCcmFuY2ggPSB0aWFuRGVCcmFuY2hNYXBbdGlhbkRlU3RlbV07XG5cbiAgICByZXR1cm4gYnJhbmNoID09PSB0aWFuRGVCcmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5b635ZCIXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlvrflkIhcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkRlSGUoc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeW+t+WQiOS4juWkqeW5sueahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5EZUhlTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5bexJyxcbiAgICAgICfkuZknOiAn5bqaJyxcbiAgICAgICfkuJknOiAn6L6bJyxcbiAgICAgICfkuIEnOiAn5aOsJyxcbiAgICAgICfmiIonOiAn55m4JyxcbiAgICAgICflt7EnOiAn55SyJyxcbiAgICAgICfluponOiAn5LmZJyxcbiAgICAgICfovpsnOiAn5LiZJyxcbiAgICAgICflo6wnOiAn5LiBJyxcbiAgICAgICfnmbgnOiAn5oiKJ1xuICAgIH07XG5cbiAgICAvLyDlpKnlvrflkIjkuI7lnLDmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuRGVIZUJyYW5jaE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5bexJzogJ+S4kScsXG4gICAgICAn5bqaJzogJ+WvhScsXG4gICAgICAn6L6bJzogJ+WNrycsXG4gICAgICAn5aOsJzogJ+i+sCcsXG4gICAgICAn55m4JzogJ+W3sycsXG4gICAgICAn55SyJzogJ+WNiCcsXG4gICAgICAn5LmZJzogJ+acqicsXG4gICAgICAn5LiZJzogJ+eUsycsXG4gICAgICAn5LiBJzogJ+mFiScsXG4gICAgICAn5oiKJzogJ+aIjCdcbiAgICB9O1xuXG4gICAgY29uc3QgdGlhbkRlSGVTdGVtID0gdGlhbkRlSGVNYXBbc3RlbV07XG4gICAgY29uc3QgdGlhbkRlSGVCcmFuY2ggPSB0aWFuRGVIZUJyYW5jaE1hcFt0aWFuRGVIZVN0ZW1dO1xuXG4gICAgcmV0dXJuIGJyYW5jaCA9PT0gdGlhbkRlSGVCcmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65pyI5b63XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrmnIjlvrdcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWXVlRGUoc3RlbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5pyI5b635LiO5aSp5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgeXVlRGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICfkuJknLFxuICAgICAgJ+S5mSc6ICfnlLInLFxuICAgICAgJ+S4mSc6ICflo6wnLFxuICAgICAgJ+S4gSc6ICfluponLFxuICAgICAgJ+aIiic6ICfmiIonLFxuICAgICAgJ+W3sSc6ICfkuJknLFxuICAgICAgJ+W6mic6ICfnlLInLFxuICAgICAgJ+i+myc6ICflo6wnLFxuICAgICAgJ+WjrCc6ICfluponLFxuICAgICAgJ+eZuCc6ICfmiIonXG4gICAgfTtcblxuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHl1ZURlTWFwKS5pbmNsdWRlcyhzdGVtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnljLtcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5Yy7XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5ZaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeWMu+S4juWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5ZaU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+S4kScsXG4gICAgICAn5LiRJzogJ+WtkCcsXG4gICAgICAn5a+FJzogJ+S6pScsXG4gICAgICAn5Y2vJzogJ+aIjCcsXG4gICAgICAn6L6wJzogJ+mFiScsXG4gICAgICAn5bezJzogJ+eUsycsXG4gICAgICAn5Y2IJzogJ+acqicsXG4gICAgICAn5pyqJzogJ+WNiCcsXG4gICAgICAn55SzJzogJ+W3sycsXG4gICAgICAn6YWJJzogJ+i+sCcsXG4gICAgICAn5oiMJzogJ+WNrycsXG4gICAgICAn5LqlJzogJ+WvhSdcbiAgICB9O1xuXG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGlhbllpTWFwKS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeWWnFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnllpxcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhblhpKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp5Zac5LiO5Zyw5pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhblhpTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICflrZAnOiAn6YWJJyxcbiAgICAgICfkuJEnOiAn55SzJyxcbiAgICAgICflr4UnOiAn5pyqJyxcbiAgICAgICflja8nOiAn5Y2IJyxcbiAgICAgICfovrAnOiAn5bezJyxcbiAgICAgICflt7MnOiAn6L6wJyxcbiAgICAgICfljYgnOiAn5Y2vJyxcbiAgICAgICfmnKonOiAn5a+FJyxcbiAgICAgICfnlLMnOiAn5LiRJyxcbiAgICAgICfphYknOiAn5a2QJyxcbiAgICAgICfmiIwnOiAn5LqlJyxcbiAgICAgICfkuqUnOiAn5oiMJ1xuICAgIH07XG5cbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aWFuWGlNYXApLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li657qi6ImzXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uue6ouiJs1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNIb25nWWFuKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFsn5Y2vJywgJ+W3sycsICfnlLMnLCAn5oiMJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnnvZdcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp572XXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5MdW8oYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn5oiMJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlnLDnvZFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65Zyw572RXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RpV2FuZyhicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfmnKonO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uue+iuWIg1xuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li6576K5YiDXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1lhbmdSZW4oZGF5U3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOe+iuWIg+S4juaXpeW5sueahOWvueW6lOWFs+ezu1xuICAgIC8vIOe+iuWIg+WPo+ivgO+8mueUsue+iuWIg+WcqOWNr++8jOS5mee+iuWIg+WcqOWvheOAguS4meaIiue+iuWIg+WcqOWNiO+8jOS4geW3see+iuWIg+WcqOW3s+OAguW6mue+iuWIg+WcqOmFie+8jOi+m+e+iuWIg+WcqOeUs+OAguWjrOe+iuWIg+WcqOS6pe+8jOeZuOe+iuWIg+WcqOWtkOOAglxuICAgIGNvbnN0IHlhbmdSZW5NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICflja8nLFxuICAgICAgJ+S5mSc6ICflr4UnLFxuICAgICAgJ+S4mSc6ICfljYgnLFxuICAgICAgJ+S4gSc6ICflt7MnLFxuICAgICAgJ+aIiic6ICfljYgnLFxuICAgICAgJ+W3sSc6ICflt7MnLFxuICAgICAgJ+W6mic6ICfphYknLFxuICAgICAgJ+i+myc6ICfnlLMnLFxuICAgICAgJ+WjrCc6ICfkuqUnLFxuICAgICAgJ+eZuCc6ICflrZAnXG4gICAgfTtcblxuICAgIHJldHVybiB5YW5nUmVuTWFwW2RheVN0ZW1dID09PSBicmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp56m6XG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeepulxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuS29uZyhicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfmiIwnO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWcsOWKq1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlnLDliqtcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzRGlKaWUoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn6L6wJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnliJFcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5YiRXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5YaW5nKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGJyYW5jaCA9PT0gJ+W3syc7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5ZOtXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeWTrVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuS3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYnJhbmNoID09PSAn5pyqJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnomZpcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp6JmaXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5YdShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBicmFuY2ggPT09ICfkuJEnO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWSuOaxoFxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlkrjmsaBcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWGlhbkNoaShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+S4kScsICfmnKonLCAn6L6wJywgJ+aIjCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65Lqh56WeXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS6oeelnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNXYW5nU2hlbihicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+WvhScsICfnlLMnXS5pbmNsdWRlcyhicmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWKq+eFnlxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrliqvnhZ5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzSmllU2hhKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFsn5a2QJywgJ+WNiCddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li654G+54WeXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uueBvueFnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNaYWlTaGEoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflja8nLCAn6YWJJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlsoHnoLRcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHBhcmFtIHllYXJCcmFuY2gg5bm05pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWygeegtFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNTdWlQbyhicmFuY2g6IHN0cmluZywgeWVhckJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5bKB56C05LiO5bm05pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3Qgc3VpUG9NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WtkCc6ICfljYgnLFxuICAgICAgJ+WNiCc6ICflrZAnLFxuICAgICAgJ+WNryc6ICfphYknLFxuICAgICAgJ+mFiSc6ICflja8nLFxuICAgICAgJ+i+sCc6ICfmiIwnLFxuICAgICAgJ+aIjCc6ICfovrAnLFxuICAgICAgJ+S4kSc6ICfmnKonLFxuICAgICAgJ+acqic6ICfkuJEnLFxuICAgICAgJ+WvhSc6ICfnlLMnLFxuICAgICAgJ+eUsyc6ICflr4UnLFxuICAgICAgJ+W3syc6ICfkuqUnLFxuICAgICAgJ+S6pSc6ICflt7MnXG4gICAgfTtcblxuICAgIHJldHVybiBzdWlQb01hcFt5ZWFyQnJhbmNoXSA9PT0gYnJhbmNoO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkp+iAl1xuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcGFyYW0geWVhckJyYW5jaCDlubTmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSn6ICXXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RhSGFvKGJyYW5jaDogc3RyaW5nLCB5ZWFyQnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKfogJfkuI7lubTmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCBkYUhhb01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a2QJzogJ+acqicsXG4gICAgICAn5LiRJzogJ+eUsycsXG4gICAgICAn5a+FJzogJ+mFiScsXG4gICAgICAn5Y2vJzogJ+aIjCcsXG4gICAgICAn6L6wJzogJ+S6pScsXG4gICAgICAn5bezJzogJ+WtkCcsXG4gICAgICAn5Y2IJzogJ+S4kScsXG4gICAgICAn5pyqJzogJ+WvhScsXG4gICAgICAn55SzJzogJ+WNrycsXG4gICAgICAn6YWJJzogJ+i+sCcsXG4gICAgICAn5oiMJzogJ+W3sycsXG4gICAgICAn5LqlJzogJ+WNiCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRhSGFvTWFwW3llYXJCcmFuY2hdID09PSBicmFuY2g7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65LqU6ay8XG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS6lOmsvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNXdUd1aShicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBbJ+W3sycsICfnlLMnLCAn5LqlJywgJ+WvhSddLmluY2x1ZGVzKGJyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li656ul5a2Q54WeXG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEBwYXJhbSBzZWFzb24g5a2j6IqC77yI5pil44CB5aSP44CB56eL44CB5Yas77yJXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuerpeWtkOeFnlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUb25nWmlTaGEoZWlnaHRDaGFyOiBFaWdodENoYXIsIHNlYXNvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g6I635Y+W5Zub5p+x5bmy5pSvXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJCcmFuY2ggPSBlaWdodENoYXIuZ2V0WWVhclpoaSgpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCBkYXlCcmFuY2ggPSBlaWdodENoYXIuZ2V0RGF5WmhpKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVCcmFuY2ggPSBlaWdodENoYXIuZ2V0VGltZVpoaSgpO1xuXG4gICAgLy8g6I635Y+W57qz6Z+z5LqU6KGMXG4gICAgY29uc3QgeWVhck5hWWluID0gZWlnaHRDaGFyLmdldFllYXJOYVlpbigpO1xuICAgIGNvbnN0IG1vbnRoTmFZaW4gPSBlaWdodENoYXIuZ2V0TW9udGhOYVlpbigpO1xuICAgIGNvbnN0IGRheU5hWWluID0gZWlnaHRDaGFyLmdldERheU5hWWluKCk7XG4gICAgY29uc3QgdGltZU5hWWluID0gZWlnaHRDaGFyLmdldFRpbWVOYVlpbigpO1xuXG4gICAgLy8g5o+Q5Y+W57qz6Z+z5LqU6KGM5bGe5oCn77yI6YeR5pyo5rC054Gr5Zyf77yJXG4gICAgY29uc3QgeWVhck5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh5ZWFyTmFZaW4pO1xuICAgIGNvbnN0IGRheU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyhkYXlOYVlpbik7XG4gICAgY29uc3QgdGltZU5hWWluV3VYaW5nID0gdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pO1xuXG4gICAgLy8g56ul5a2Q54We5Yik5pat5Y+j6K+A77yaXG4gICAgLy8gXCLmmKXnp4vlr4XlrZDotLXvvIzlhqzlpI/lja/mnKrovrDvvJvph5HmnKjpqazlja/lkIjvvIzmsLTngavpuKHniqzlpJrvvJvlnJ/lkb3pgKLovrDlt7PvvIznq6XlrZDlrprkuI3plJlcIlxuXG4gICAgLy8gMS4g5oyJ5a2j6IqC5ZKM5Zyw5pSv5Yik5patXG4gICAgbGV0IHNlYXNvbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKChzZWFzb24gPT09ICfmmKUnIHx8IHNlYXNvbiA9PT0gJ+eniycpICYmIChkYXlCcmFuY2ggPT09ICflr4UnIHx8IGRheUJyYW5jaCA9PT0gJ+WtkCcgfHwgdGltZUJyYW5jaCA9PT0gJ+WvhScgfHwgdGltZUJyYW5jaCA9PT0gJ+WtkCcpKSB7XG4gICAgICBzZWFzb25DaGVjayA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgoc2Vhc29uID09PSAn5YasJyB8fCBzZWFzb24gPT09ICflpI8nKSAmJiAoZGF5QnJhbmNoID09PSAn5Y2vJyB8fCBkYXlCcmFuY2ggPT09ICfmnKonIHx8IGRheUJyYW5jaCA9PT0gJ+i+sCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVCcmFuY2ggPT09ICflja8nIHx8IHRpbWVCcmFuY2ggPT09ICfmnKonIHx8IHRpbWVCcmFuY2ggPT09ICfovrAnKSkge1xuICAgICAgc2Vhc29uQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDIuIOaMiee6s+mfs+S6lOihjOWSjOWcsOaUr+WIpOaWrVxuICAgIGxldCBuYVlpbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKCh5ZWFyTmFZaW5XdVhpbmcgPT09ICfph5EnIHx8IHllYXJOYVlpbld1WGluZyA9PT0gJ+acqCcgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICfph5EnIHx8IGRheU5hWWluV3VYaW5nID09PSAn5pyoJykgJiZcbiAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+WNiCcgfHwgZGF5QnJhbmNoID09PSAn5Y2vJyB8fCB0aW1lQnJhbmNoID09PSAn5Y2IJyB8fCB0aW1lQnJhbmNoID09PSAn5Y2vJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoKHllYXJOYVlpbld1WGluZyA9PT0gJ+awtCcgfHwgeWVhck5hWWluV3VYaW5nID09PSAn54GrJyB8fCBkYXlOYVlpbld1WGluZyA9PT0gJ+awtCcgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICfngasnKSAmJlxuICAgICAgICAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+mFiScgfHwgZGF5QnJhbmNoID09PSAn5oiMJyB8fCB0aW1lQnJhbmNoID09PSAn6YWJJyB8fCB0aW1lQnJhbmNoID09PSAn5oiMJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoKHllYXJOYVlpbld1WGluZyA9PT0gJ+WcnycgfHwgZGF5TmFZaW5XdVhpbmcgPT09ICflnJ8nKSAmJlxuICAgICAgICAgICAgICAgKGRheUJyYW5jaCA9PT0gJ+i+sCcgfHwgZGF5QnJhbmNoID09PSAn5bezJyB8fCB0aW1lQnJhbmNoID09PSAn6L6wJyB8fCB0aW1lQnJhbmNoID09PSAn5bezJykpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDMuIOe7vOWQiOWIpOaWre+8muWto+iKguadoeS7tuaIlue6s+mfs+adoeS7tua7oei2s+WFtuS4gOWNs+WPr1xuICAgIHJldHVybiBzZWFzb25DaGVjayB8fCBuYVlpbkNoZWNrO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlsIblhpvnrq1cbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHBhcmFtIHNlYXNvbiDlraPoioLvvIjmmKXjgIHlpI/jgIHnp4vjgIHlhqzvvIlcbiAgICogQHJldHVybnMg5piv5ZCm5Li65bCG5Yab566tXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0ppYW5nSnVuSmlhbihlaWdodENoYXI6IEVpZ2h0Q2hhciwgc2Vhc29uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDojrflj5blm5vmn7HlubLmlK9cbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBlaWdodENoYXIuZ2V0TW9udGhaaGkoKTtcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXREYXlaaGkoKTtcbiAgICBjb25zdCB0aW1lU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG4gICAgY29uc3QgdGltZUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRUaW1lWmhpKCk7XG5cbiAgICAvLyDojrflj5bnurPpn7PkupTooYxcbiAgICBjb25zdCB5ZWFyTmFZaW4gPSBlaWdodENoYXIuZ2V0WWVhck5hWWluKCk7XG4gICAgY29uc3QgbW9udGhOYVlpbiA9IGVpZ2h0Q2hhci5nZXRNb250aE5hWWluKCk7XG4gICAgY29uc3QgZGF5TmFZaW4gPSBlaWdodENoYXIuZ2V0RGF5TmFZaW4oKTtcbiAgICBjb25zdCB0aW1lTmFZaW4gPSBlaWdodENoYXIuZ2V0VGltZU5hWWluKCk7XG5cbiAgICAvLyDmj5Dlj5bnurPpn7PkupTooYzlsZ7mgKfvvIjph5HmnKjmsLTngavlnJ/vvIlcbiAgICBjb25zdCB5ZWFyTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKHllYXJOYVlpbik7XG4gICAgY29uc3QgZGF5TmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKTtcbiAgICBjb25zdCB0aW1lTmFZaW5XdVhpbmcgPSB0aGlzLmdldE5hWWluV3VYaW5nKHRpbWVOYVlpbik7XG5cbiAgICAvLyDlsIblhpvnrq3liKTmlq3lj6Por4DvvJpcbiAgICAvLyBcIuaYpeWto+mFieaIjOi+sO+8jOWkj+Wto+acquWNr+WtkO+8jOeni+Wto+WvheeUs+WNiO+8jOWGrOWto+W3s+S6peS4kVwiXG4gICAgLy8g5ZCM5pe26ZyA6KaB6ICD6JmR5YWr5a2X5Lit55qE5Yay5YWL5YWz57O75ZKM57qz6Z+z5LqU6KGMXG5cbiAgICAvLyAxLiDmjInlraPoioLlkozml7bmlK/liKTmlq1cbiAgICBsZXQgc2Vhc29uQ2hlY2sgPSBmYWxzZTtcbiAgICBjb25zdCBqaWFuZ0p1bkppYW5NYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gICAgICAn5pilJzogWyfphYknLCAn5oiMJywgJ+i+sCddLFxuICAgICAgJ+Wkjyc6IFsn5pyqJywgJ+WNrycsICflrZAnXSxcbiAgICAgICfnp4snOiBbJ+WvhScsICfnlLMnLCAn5Y2IJ10sXG4gICAgICAn5YasJzogWyflt7MnLCAn5LqlJywgJ+S4kSddXG4gICAgfTtcblxuICAgIGlmIChqaWFuZ0p1bkppYW5NYXBbc2Vhc29uXT8uaW5jbHVkZXModGltZUJyYW5jaCkpIHtcbiAgICAgIHNlYXNvbkNoZWNrID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAyLiDmo4Dmn6XlhavlrZfkuK3nmoTlhrLlhYvlhbPns7tcbiAgICAvLyDml6XmlK/kuI7ml7bmlK/nm7jlhrLvvIzmiJbogIXml6XlubLkuI7ml7blubLnm7jlhYtcbiAgICBsZXQgY2hvbmdLZUNoZWNrID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNaaGlDaG9uZyhkYXlCcmFuY2gsIHRpbWVCcmFuY2gpIHx8IHRoaXMuaXNXdVhpbmdLZSh0aGlzLmdldFN0ZW1XdVhpbmcoZGF5U3RlbSksIHRoaXMuZ2V0U3RlbVd1WGluZyh0aW1lU3RlbSkpKSB7XG4gICAgICBjaG9uZ0tlQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDMuIOajgOafpee6s+mfs+S6lOihjOaYr+WQpuS4jeiwg+WSjFxuICAgIC8vIOaXtuafsee6s+mfs+S4juaXpeafsee6s+mfs+ebuOWFi1xuICAgIGxldCBuYVlpbkNoZWNrID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNXdVhpbmdLZSh0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKSwgdGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pKSB8fFxuICAgICAgICB0aGlzLmlzV3VYaW5nS2UodGhpcy5nZXROYVlpbld1WGluZyh0aW1lTmFZaW4pLCB0aGlzLmdldE5hWWluV3VYaW5nKGRheU5hWWluKSkpIHtcbiAgICAgIG5hWWluQ2hlY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIDQuIOe7vOWQiOWIpOaWre+8muWto+iKguadoeS7tuW/hemhu+a7oei2s++8jOS4lOWGsuWFi+WFs+ezu+aIlue6s+mfs+S4jeiwg+WSjOWFtuS4gOa7oei2s1xuICAgIHJldHVybiBzZWFzb25DaGVjayAmJiAoY2hvbmdLZUNoZWNrIHx8IG5hWWluQ2hlY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreS4pOWcsOaUr+aYr+WQpuebuOWGslxuICAgKiBAcGFyYW0gemhpMSDlnLDmlK8xXG4gICAqIEBwYXJhbSB6aGkyIOWcsOaUrzJcbiAgICogQHJldHVybnMg5piv5ZCm55u45YayXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1poaUNob25nKHpoaTE6IHN0cmluZywgemhpMjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY2hvbmdQYWlycyA9IFtcbiAgICAgIFsn5a2QJywgJ+WNiCddLCBbJ+S4kScsICfmnKonXSwgWyflr4UnLCAn55SzJ10sIFsn5Y2vJywgJ+mFiSddLFxuICAgICAgWyfovrAnLCAn5oiMJ10sIFsn5bezJywgJ+S6pSddXG4gICAgXTtcblxuICAgIGZvciAoY29uc3QgcGFpciBvZiBjaG9uZ1BhaXJzKSB7XG4gICAgICBpZiAoKHpoaTEgPT09IHBhaXJbMF0gJiYgemhpMiA9PT0gcGFpclsxXSkgfHwgKHpoaTEgPT09IHBhaXJbMV0gJiYgemhpMiA9PT0gcGFpclswXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeW+t+i0teS6ulxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5b636LS15Lq6XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5EZUd1aVJlbihzdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp5b636LS15Lq65LiO5aSp5bmy55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhbkRlR3VpUmVuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+S5mSc6IFsn5a2QJywgJ+eUsyddLFxuICAgICAgJ+S4mSc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+S4gSc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+aIiic6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+W3sSc6IFsn5a2QJywgJ+eUsyddLFxuICAgICAgJ+W6mic6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+i+myc6IFsn5LqlJywgJ+mFiSddLFxuICAgICAgJ+WjrCc6IFsn5LiRJywgJ+acqiddLFxuICAgICAgJ+eZuCc6IFsn5a2QJywgJ+eUsyddXG4gICAgfTtcblxuICAgIHJldHVybiB0aWFuRGVHdWlSZW5NYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65pyI5b636LS15Lq6XG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrmnIjlvrfotLXkurpcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWXVlRGVHdWlSZW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOaciOW+t+i0teS6uuS4juWkqeW5sueahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHl1ZURlR3VpUmVuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5Y2vJ10sXG4gICAgICAn5LmZJzogWyflr4UnXSxcbiAgICAgICfkuJknOiBbJ+W3syddLFxuICAgICAgJ+S4gSc6IFsn5Y2IJ10sXG4gICAgICAn5oiKJzogWyflt7MnXSxcbiAgICAgICflt7EnOiBbJ+WNiCddLFxuICAgICAgJ+W6mic6IFsn55SzJ10sXG4gICAgICAn6L6bJzogWyfphYknXSxcbiAgICAgICflo6wnOiBbJ+S6pSddLFxuICAgICAgJ+eZuCc6IFsn5a2QJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHl1ZURlR3VpUmVuTWFwW3N0ZW1dPy5pbmNsdWRlcyhicmFuY2gpIHx8IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqei1plxuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp6LWmXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5TaGUoc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqei1puS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5TaGVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7XG4gICAgICAn55SyJzogWyfmiIwnXSxcbiAgICAgICfkuZknOiBbJ+mFiSddLFxuICAgICAgJ+S4mSc6IFsn55SzJ10sXG4gICAgICAn5LiBJzogWyfmnKonXSxcbiAgICAgICfmiIonOiBbJ+WNiCddLFxuICAgICAgJ+W3sSc6IFsn5bezJ10sXG4gICAgICAn5bqaJzogWyfovrAnXSxcbiAgICAgICfovpsnOiBbJ+WNryddLFxuICAgICAgJ+WjrCc6IFsn5a+FJ10sXG4gICAgICAn55m4JzogWyfkuJEnXVxuICAgIH07XG5cbiAgICByZXR1cm4gdGlhblNoZU1hcFtzdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnmgalcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeaBqVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuRW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeaBqeS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5Fbk1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSA9IHtcbiAgICAgICfnlLInOiBbJ+eUsyddLFxuICAgICAgJ+S5mSc6IFsn6YWJJ10sXG4gICAgICAn5LiZJzogWyfmiIwnXSxcbiAgICAgICfkuIEnOiBbJ+S6pSddLFxuICAgICAgJ+aIiic6IFsn5a2QJ10sXG4gICAgICAn5bexJzogWyfkuJEnXSxcbiAgICAgICfluponOiBbJ+WvhSddLFxuICAgICAgJ+i+myc6IFsn5Y2vJ10sXG4gICAgICAn5aOsJzogWyfovrAnXSxcbiAgICAgICfnmbgnOiBbJ+W3syddXG4gICAgfTtcblxuICAgIHJldHVybiB0aWFuRW5NYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5a6YXG4gICAqIEBwYXJhbSBzdGVtIOWkqeW5slxuICAgKiBAcGFyYW0gYnJhbmNoIOWcsOaUr1xuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrlpKnlrphcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzVGlhbkd1YW4oc3RlbTogc3RyaW5nLCBicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqeWumOS4juWkqeW5suWcsOaUr+eahOWvueW6lOWFs+ezu1xuICAgIGNvbnN0IHRpYW5HdWFuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5pyqJ10sXG4gICAgICAn5LmZJzogWyfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+mFiSddLFxuICAgICAgJ+S4gSc6IFsn5oiMJ10sXG4gICAgICAn5oiKJzogWyfkuqUnXSxcbiAgICAgICflt7EnOiBbJ+WtkCddLFxuICAgICAgJ+W6mic6IFsn5LiRJ10sXG4gICAgICAn6L6bJzogWyflr4UnXSxcbiAgICAgICflo6wnOiBbJ+WNryddLFxuICAgICAgJ+eZuCc6IFsn6L6wJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5HdWFuTWFwW3N0ZW1dPy5pbmNsdWRlcyhicmFuY2gpIHx8IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuWkqeemj1xuICAgKiBAcGFyYW0gc3RlbSDlpKnlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp56aPXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5GdShzdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8g5aSp56aP5LiO5aSp5bmy5Zyw5pSv55qE5a+55bqU5YWz57O7XG4gICAgY29uc3QgdGlhbkZ1TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn6YWJJ10sXG4gICAgICAn5LmZJzogWyfnlLMnXSxcbiAgICAgICfkuJknOiBbJ+acqiddLFxuICAgICAgJ+S4gSc6IFsn5Y2IJ10sXG4gICAgICAn5oiKJzogWyflt7MnXSxcbiAgICAgICflt7EnOiBbJ+i+sCddLFxuICAgICAgJ+W6mic6IFsn5Y2vJ10sXG4gICAgICAn6L6bJzogWyflr4UnXSxcbiAgICAgICflo6wnOiBbJ+S4kSddLFxuICAgICAgJ+eZuCc6IFsn5a2QJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5GdU1hcFtzdGVtXT8uaW5jbHVkZXMoYnJhbmNoKSB8fCBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnljqhcbiAgICogQHBhcmFtIHN0ZW0g5aSp5bmyXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeWOqFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuQ2h1KHN0ZW06IHN0cmluZywgYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyDlpKnljqjkuI7lpKnlubLlnLDmlK/nmoTlr7nlupTlhbPns7tcbiAgICBjb25zdCB0aWFuQ2h1TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0ge1xuICAgICAgJ+eUsic6IFsn5bezJ10sXG4gICAgICAn5LmZJzogWyfljYgnXSxcbiAgICAgICfkuJknOiBbJ+acqiddLFxuICAgICAgJ+S4gSc6IFsn55SzJ10sXG4gICAgICAn5oiKJzogWyfphYknXSxcbiAgICAgICflt7EnOiBbJ+aIjCddLFxuICAgICAgJ+W6mic6IFsn5LqlJ10sXG4gICAgICAn6L6bJzogWyflrZAnXSxcbiAgICAgICflo6wnOiBbJ+S4kSddLFxuICAgICAgJ+eZuCc6IFsn5a+FJ11cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5DaHVNYXBbc3RlbV0/LmluY2x1ZGVzKGJyYW5jaCkgfHwgZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65aSp5berXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqeW3q1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuV3UoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyflt7MnLCAn5LqlJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnmnIhcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5Li65aSp5pyIXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1RpYW5ZdWUoYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gWyfmnKonLCAn5LiRJ10uaW5jbHVkZXMoYnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlpKnpqaxcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHBhcmFtIHllYXJCcmFuY2gg5bm05pSvXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWkqemprFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNUaWFuTWEoYnJhbmNoOiBzdHJpbmcsIHllYXJCcmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOWkqemprOS4juW5tOaUr+eahOWvueW6lOWFs+ezu1xuICAgIC8vIOWvheWNiOaIjOW5tOmprOWcqOeUs++8jOeUs+WtkOi+sOW5tOmprOWcqOWvhe+8jOW3s+mFieS4keW5tOmprOWcqOS6pe+8jOS6peWNr+acquW5tOmprOWcqOW3s1xuICAgIGNvbnN0IHRpYW5NYU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5a+FJzogJ+eUsycsXG4gICAgICAn5Y2IJzogJ+eUsycsXG4gICAgICAn5oiMJzogJ+eUsycsXG4gICAgICAn55SzJzogJ+WvhScsXG4gICAgICAn5a2QJzogJ+WvhScsXG4gICAgICAn6L6wJzogJ+WvhScsXG4gICAgICAn5bezJzogJ+S6pScsXG4gICAgICAn6YWJJzogJ+S6pScsXG4gICAgICAn5LiRJzogJ+S6pScsXG4gICAgICAn5LqlJzogJ+W3sycsXG4gICAgICAn5Y2vJzogJ+W3sycsXG4gICAgICAn5pyqJzogJ+W3sydcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpYW5NYU1hcFt5ZWFyQnJhbmNoXSA9PT0gYnJhbmNoO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICAgKiBAcGFyYW0gZGF5U3RlbSDml6XlubJcbiAgICogQHBhcmFtIGJyYW5jaCDlnLDmlK9cbiAgICogQHJldHVybnMg5Zyw5Yq/XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXREaVNoaShkYXlTdGVtOiBzdHJpbmcsIGJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDpmLPlubLvvJrnlLLkuJnmiIrluprlo6xcbiAgICAvLyDpmLTlubLvvJrkuZnkuIHlt7HovpvnmbhcbiAgICBjb25zdCB5YW5nR2FuID0gJ+eUsuS4meaIiuW6muWjrCc7XG4gICAgY29uc3QgaXNEYXlZYW5nID0geWFuZ0dhbi5pbmNsdWRlcyhkYXlTdGVtKTtcblxuICAgIC8vIOmVv+eUn+WNgeS6jOelnuihqFxuICAgIGNvbnN0IGRpU2hpTWFwOiB7W2tleTogc3RyaW5nXToge1trZXk6IHN0cmluZ106IHN0cmluZ319ID0ge1xuICAgICAgJ+eUsic6IHtcbiAgICAgICAgJ+S6pSc6ICfplb/nlJ8nLCAn5a2QJzogJ+aykOa1tCcsICfkuJEnOiAn5Yag5bimJywgJ+WvhSc6ICfkuLTlrpgnLCAn5Y2vJzogJ+W4neaXuicsXG4gICAgICAgICfovrAnOiAn6KGwJywgJ+W3syc6ICfnl4UnLCAn5Y2IJzogJ+atuycsICfmnKonOiAn5aKTJywgJ+eUsyc6ICfnu50nLFxuICAgICAgICAn6YWJJzogJ+iDjicsICfmiIwnOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfkuJnmiIonOiB7XG4gICAgICAgICflr4UnOiAn6ZW/55SfJywgJ+WNryc6ICfmspDmtbQnLCAn6L6wJzogJ+WGoOW4picsICflt7MnOiAn5Li05a6YJywgJ+WNiCc6ICfluJ3ml7onLFxuICAgICAgICAn5pyqJzogJ+ihsCcsICfnlLMnOiAn55eFJywgJ+mFiSc6ICfmrbsnLCAn5oiMJzogJ+WikycsICfkuqUnOiAn57udJyxcbiAgICAgICAgJ+WtkCc6ICfog44nLCAn5LiRJzogJ+WFuydcbiAgICAgIH0sXG4gICAgICAn5bqaJzoge1xuICAgICAgICAn5bezJzogJ+mVv+eUnycsICfljYgnOiAn5rKQ5rW0JywgJ+acqic6ICflhqDluKYnLCAn55SzJzogJ+S4tOWumCcsICfphYknOiAn5bid5pe6JyxcbiAgICAgICAgJ+aIjCc6ICfoobAnLCAn5LqlJzogJ+eXhScsICflrZAnOiAn5q27JywgJ+S4kSc6ICflopMnLCAn5a+FJzogJ+e7nScsXG4gICAgICAgICflja8nOiAn6IOOJywgJ+i+sCc6ICflhbsnXG4gICAgICB9LFxuICAgICAgJ+WjrCc6IHtcbiAgICAgICAgJ+eUsyc6ICfplb/nlJ8nLCAn6YWJJzogJ+aykOa1tCcsICfmiIwnOiAn5Yag5bimJywgJ+S6pSc6ICfkuLTlrpgnLCAn5a2QJzogJ+W4neaXuicsXG4gICAgICAgICfkuJEnOiAn6KGwJywgJ+WvhSc6ICfnl4UnLCAn5Y2vJzogJ+atuycsICfovrAnOiAn5aKTJywgJ+W3syc6ICfnu50nLFxuICAgICAgICAn5Y2IJzogJ+iDjicsICfmnKonOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfkuZknOiB7XG4gICAgICAgICfljYgnOiAn6ZW/55SfJywgJ+W3syc6ICfmspDmtbQnLCAn6L6wJzogJ+WGoOW4picsICflja8nOiAn5Li05a6YJywgJ+WvhSc6ICfluJ3ml7onLFxuICAgICAgICAn5LiRJzogJ+ihsCcsICflrZAnOiAn55eFJywgJ+S6pSc6ICfmrbsnLCAn5oiMJzogJ+WikycsICfphYknOiAn57udJyxcbiAgICAgICAgJ+eUsyc6ICfog44nLCAn5pyqJzogJ+WFuydcbiAgICAgIH0sXG4gICAgICAn5LiB5bexJzoge1xuICAgICAgICAn6YWJJzogJ+mVv+eUnycsICfnlLMnOiAn5rKQ5rW0JywgJ+acqic6ICflhqDluKYnLCAn5Y2IJzogJ+S4tOWumCcsICflt7MnOiAn5bid5pe6JyxcbiAgICAgICAgJ+i+sCc6ICfoobAnLCAn5Y2vJzogJ+eXhScsICflr4UnOiAn5q27JywgJ+S4kSc6ICflopMnLCAn5a2QJzogJ+e7nScsXG4gICAgICAgICfkuqUnOiAn6IOOJywgJ+aIjCc6ICflhbsnXG4gICAgICB9LFxuICAgICAgJ+i+myc6IHtcbiAgICAgICAgJ+WtkCc6ICfplb/nlJ8nLCAn5LqlJzogJ+aykOa1tCcsICfmiIwnOiAn5Yag5bimJywgJ+mFiSc6ICfkuLTlrpgnLCAn55SzJzogJ+W4neaXuicsXG4gICAgICAgICfmnKonOiAn6KGwJywgJ+WNiCc6ICfnl4UnLCAn5bezJzogJ+atuycsICfovrAnOiAn5aKTJywgJ+WNryc6ICfnu50nLFxuICAgICAgICAn5a+FJzogJ+iDjicsICfkuJEnOiAn5YW7J1xuICAgICAgfSxcbiAgICAgICfnmbgnOiB7XG4gICAgICAgICflja8nOiAn6ZW/55SfJywgJ+WvhSc6ICfmspDmtbQnLCAn5LiRJzogJ+WGoOW4picsICflrZAnOiAn5Li05a6YJywgJ+S6pSc6ICfluJ3ml7onLFxuICAgICAgICAn5oiMJzogJ+ihsCcsICfphYknOiAn55eFJywgJ+eUsyc6ICfmrbsnLCAn5pyqJzogJ+WikycsICfljYgnOiAn57udJyxcbiAgICAgICAgJ+W3syc6ICfog44nLCAn6L6wJzogJ+WFuydcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8g5qC55o2u5pel5bmy5p+l5om+5a+55bqU55qE5Zyw5Yq/6KGoXG4gICAgbGV0IGRpU2hpVGFibGU6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGRheVN0ZW0gPT09ICfnlLInKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+eUsiddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+S5mScpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn5LmZJ107XG4gICAgfSBlbHNlIGlmIChkYXlTdGVtID09PSAn5LiZJyB8fCBkYXlTdGVtID09PSAn5oiKJykge1xuICAgICAgZGlTaGlUYWJsZSA9IGRpU2hpTWFwWyfkuJnmiIonXTtcbiAgICB9IGVsc2UgaWYgKGRheVN0ZW0gPT09ICfkuIEnIHx8IGRheVN0ZW0gPT09ICflt7EnKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+S4geW3sSddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+W6micpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn5bqaJ107XG4gICAgfSBlbHNlIGlmIChkYXlTdGVtID09PSAn6L6bJykge1xuICAgICAgZGlTaGlUYWJsZSA9IGRpU2hpTWFwWyfovpsnXTtcbiAgICB9IGVsc2UgaWYgKGRheVN0ZW0gPT09ICflo6wnKSB7XG4gICAgICBkaVNoaVRhYmxlID0gZGlTaGlNYXBbJ+WjrCddO1xuICAgIH0gZWxzZSBpZiAoZGF5U3RlbSA9PT0gJ+eZuCcpIHtcbiAgICAgIGRpU2hpVGFibGUgPSBkaVNoaU1hcFsn55m4J107XG4gICAgfVxuXG4gICAgLy8g5aaC5p6c5om+5Yiw5a+55bqU55qE5Zyw5Yq/6KGo77yM6L+U5Zue5Zyw5Yq/XG4gICAgaWYgKGRpU2hpVGFibGUgJiYgZGlTaGlUYWJsZVticmFuY2hdKSB7XG4gICAgICByZXR1cm4gZGlTaGlUYWJsZVticmFuY2hdO1xuICAgIH1cblxuICAgIHJldHVybiAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpflhavlrZfmoLzlsYBcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5qC85bGA5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVHZUp1KGVpZ2h0Q2hhcjogRWlnaHRDaGFyKTogeyBnZUp1OiBzdHJpbmc7IGRldGFpbDogc3RyaW5nIH0ge1xuICAgIC8vIOiOt+WPluaXpeW5suWSjOS6lOihjFxuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgZGF5V3VYaW5nID0gZWlnaHRDaGFyLmdldERheVd1WGluZygpO1xuXG4gICAgLy8g6I635Y+W5Zub5p+x5aSp5bmy5ZKM5LqU6KGMXG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IHllYXJXdVhpbmcgPSBlaWdodENoYXIuZ2V0WWVhcld1WGluZygpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IG1vbnRoV3VYaW5nID0gZWlnaHRDaGFyLmdldE1vbnRoV3VYaW5nKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuICAgIGNvbnN0IHRpbWVXdVhpbmcgPSBlaWdodENoYXIuZ2V0VGltZVd1WGluZygpO1xuXG4gICAgLy8g6I635Y+W5Zub5p+x5Zyw5pSv5ZKM5LqU6KGMXG4gICAgY29uc3QgeWVhckJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRZZWFyWmhpKCk7XG4gICAgY29uc3QgeWVhckJyYW5jaFd1WGluZyA9IHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHllYXJCcmFuY2gpO1xuICAgIGNvbnN0IG1vbnRoQnJhbmNoID0gZWlnaHRDaGFyLmdldE1vbnRoWmhpKCk7XG4gICAgY29uc3QgbW9udGhCcmFuY2hXdVhpbmcgPSB0aGlzLmdldEJyYW5jaFd1WGluZyhtb250aEJyYW5jaCk7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gZWlnaHRDaGFyLmdldERheVpoaSgpO1xuICAgIGNvbnN0IGRheUJyYW5jaFd1WGluZyA9IHRoaXMuZ2V0QnJhbmNoV3VYaW5nKGRheUJyYW5jaCk7XG4gICAgY29uc3QgdGltZUJyYW5jaCA9IGVpZ2h0Q2hhci5nZXRUaW1lWmhpKCk7XG4gICAgY29uc3QgdGltZUJyYW5jaFd1WGluZyA9IHRoaXMuZ2V0QnJhbmNoV3VYaW5nKHRpbWVCcmFuY2gpO1xuXG4gICAgLy8g6K6h566X5LqU6KGM5Liq5pWwXG4gICAgY29uc3Qgd3VYaW5nQ291bnQgPSB7XG4gICAgICAn6YeRJzogMCxcbiAgICAgICfmnKgnOiAwLFxuICAgICAgJ+awtCc6IDAsXG4gICAgICAn54GrJzogMCxcbiAgICAgICflnJ8nOiAwXG4gICAgfTtcblxuICAgIC8vIOWkqeW5suS6lOihjFxuICAgIGlmICh5ZWFyV3VYaW5nID09PSAn6YeRJykgd3VYaW5nQ291bnRbJ+mHkSddKys7XG4gICAgaWYgKHllYXJXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAoeWVhcld1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmICh5ZWFyV3VYaW5nID09PSAn54GrJykgd3VYaW5nQ291bnRbJ+eBqyddKys7XG4gICAgaWYgKHllYXJXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIGlmIChtb250aFd1WGluZyA9PT0gJ+mHkScpIHd1WGluZ0NvdW50Wyfph5EnXSsrO1xuICAgIGlmIChtb250aFd1WGluZyA9PT0gJ+acqCcpIHd1WGluZ0NvdW50WyfmnKgnXSsrO1xuICAgIGlmIChtb250aFd1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmIChtb250aFd1WGluZyA9PT0gJ+eBqycpIHd1WGluZ0NvdW50WyfngasnXSsrO1xuICAgIGlmIChtb250aFd1WGluZyA9PT0gJ+WcnycpIHd1WGluZ0NvdW50WyflnJ8nXSsrO1xuXG4gICAgaWYgKGRheVd1WGluZyA9PT0gJ+mHkScpIHd1WGluZ0NvdW50Wyfph5EnXSsrO1xuICAgIGlmIChkYXlXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAoZGF5V3VYaW5nID09PSAn5rC0Jykgd3VYaW5nQ291bnRbJ+awtCddKys7XG4gICAgaWYgKGRheVd1WGluZyA9PT0gJ+eBqycpIHd1WGluZ0NvdW50WyfngasnXSsrO1xuICAgIGlmIChkYXlXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIGlmICh0aW1lV3VYaW5nID09PSAn6YeRJykgd3VYaW5nQ291bnRbJ+mHkSddKys7XG4gICAgaWYgKHRpbWVXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAodGltZVd1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmICh0aW1lV3VYaW5nID09PSAn54GrJykgd3VYaW5nQ291bnRbJ+eBqyddKys7XG4gICAgaWYgKHRpbWVXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIC8vIOWcsOaUr+S6lOihjFxuICAgIGlmICh5ZWFyQnJhbmNoV3VYaW5nID09PSAn6YeRJykgd3VYaW5nQ291bnRbJ+mHkSddKys7XG4gICAgaWYgKHllYXJCcmFuY2hXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAoeWVhckJyYW5jaFd1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmICh5ZWFyQnJhbmNoV3VYaW5nID09PSAn54GrJykgd3VYaW5nQ291bnRbJ+eBqyddKys7XG4gICAgaWYgKHllYXJCcmFuY2hXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIGlmIChtb250aEJyYW5jaFd1WGluZyA9PT0gJ+mHkScpIHd1WGluZ0NvdW50Wyfph5EnXSsrO1xuICAgIGlmIChtb250aEJyYW5jaFd1WGluZyA9PT0gJ+acqCcpIHd1WGluZ0NvdW50WyfmnKgnXSsrO1xuICAgIGlmIChtb250aEJyYW5jaFd1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmIChtb250aEJyYW5jaFd1WGluZyA9PT0gJ+eBqycpIHd1WGluZ0NvdW50WyfngasnXSsrO1xuICAgIGlmIChtb250aEJyYW5jaFd1WGluZyA9PT0gJ+WcnycpIHd1WGluZ0NvdW50WyflnJ8nXSsrO1xuXG4gICAgaWYgKGRheUJyYW5jaFd1WGluZyA9PT0gJ+mHkScpIHd1WGluZ0NvdW50Wyfph5EnXSsrO1xuICAgIGlmIChkYXlCcmFuY2hXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAoZGF5QnJhbmNoV3VYaW5nID09PSAn5rC0Jykgd3VYaW5nQ291bnRbJ+awtCddKys7XG4gICAgaWYgKGRheUJyYW5jaFd1WGluZyA9PT0gJ+eBqycpIHd1WGluZ0NvdW50WyfngasnXSsrO1xuICAgIGlmIChkYXlCcmFuY2hXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIGlmICh0aW1lQnJhbmNoV3VYaW5nID09PSAn6YeRJykgd3VYaW5nQ291bnRbJ+mHkSddKys7XG4gICAgaWYgKHRpbWVCcmFuY2hXdVhpbmcgPT09ICfmnKgnKSB3dVhpbmdDb3VudFsn5pyoJ10rKztcbiAgICBpZiAodGltZUJyYW5jaFd1WGluZyA9PT0gJ+awtCcpIHd1WGluZ0NvdW50WyfmsLQnXSsrO1xuICAgIGlmICh0aW1lQnJhbmNoV3VYaW5nID09PSAn54GrJykgd3VYaW5nQ291bnRbJ+eBqyddKys7XG4gICAgaWYgKHRpbWVCcmFuY2hXdVhpbmcgPT09ICflnJ8nKSB3dVhpbmdDb3VudFsn5ZyfJ10rKztcblxuICAgIC8vIOWIpOaWreagvOWxgFxuICAgIC8vIDEuIOaXpeS4u+aXuuihsFxuICAgIGNvbnN0IHJpWmh1U3RyZW5ndGhJbmZvID0gdGhpcy5jYWxjdWxhdGVSaVpodVN0cmVuZ3RoKGVpZ2h0Q2hhcik7XG4gICAgY29uc3QgcmlaaHVTdHJlbmd0aCA9IHJpWmh1U3RyZW5ndGhJbmZvLnJlc3VsdDtcblxuICAgIC8vIDIuIOS6lOihjOe8uuWksVxuICAgIGNvbnN0IG1pc3NpbmdXdVhpbmcgPSBPYmplY3Qua2V5cyh3dVhpbmdDb3VudCkuZmlsdGVyKGtleSA9PiB3dVhpbmdDb3VudFtrZXkgYXMga2V5b2YgdHlwZW9mIHd1WGluZ0NvdW50XSA9PT0gMCk7XG5cbiAgICAvLyAzLiDnibnmrormoLzlsYDliKTmlq1cblxuICAgIC8vIDMuMSDkuIPmnYDmoLxcbiAgICBpZiAodGhpcy5pc1FpU2hhR2UoZWlnaHRDaGFyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ2VKdTogJ+S4g+adgOagvCcsXG4gICAgICAgIGRldGFpbDogJ+WFq+Wtl+S4reacieS4g+adgO+8jOS4lOS4g+adgOacieWKm++8jOaXpeS4u+ihsOW8seOAgidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gMy4yIOato+WumOagvFxuICAgIGlmICh0aGlzLmlzWmhlbmdHdWFuR2UoZWlnaHRDaGFyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ2VKdTogJ+ato+WumOagvCcsXG4gICAgICAgIGRldGFpbDogJ+WFq+Wtl+S4reacieato+WumO+8jOS4lOato+WumOacieWKm++8jOaXpeS4u+ihsOW8seOAgidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gMy4zIOWBj+WNsOagvFxuICAgIGlmICh0aGlzLmlzUGlhbllpbkdlKGVpZ2h0Q2hhcikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICflgY/ljbDmoLwnLFxuICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mnInlgY/ljbDvvIzkuJTlgY/ljbDmnInlipvvvIzml6XkuLvoobDlvLHjgIInXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDMuNCDmraPljbDmoLxcbiAgICBpZiAodGhpcy5pc1poZW5nWWluR2UoZWlnaHRDaGFyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ2VKdTogJ+ato+WNsOagvCcsXG4gICAgICAgIGRldGFpbDogJ+WFq+Wtl+S4reacieato+WNsO+8jOS4lOato+WNsOacieWKm++8jOaXpeS4u+ihsOW8seOAgidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gMy41IOmjn+elnuagvFxuICAgIGlmICh0aGlzLmlzU2hpU2hlbkdlKGVpZ2h0Q2hhcikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfpo5/npZ7moLwnLFxuICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mnInpo5/npZ7vvIzkuJTpo5/npZ7mnInlipvvvIzml6XkuLvml7rnm5vjgIInXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDMuNiDkvKTlrpjmoLxcbiAgICBpZiAodGhpcy5pc1NoYW5nR3VhbkdlKGVpZ2h0Q2hhcikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfkvKTlrpjmoLwnLFxuICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mnInkvKTlrpjvvIzkuJTkvKTlrpjmnInlipvvvIzml6XkuLvml7rnm5vjgIInXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDMuNyDlgY/otKLmoLxcbiAgICBpZiAodGhpcy5pc1BpYW5DYWlHZShlaWdodENoYXIpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBnZUp1OiAn5YGP6LSi5qC8JyxcbiAgICAgICAgZGV0YWlsOiAn5YWr5a2X5Lit5pyJ5YGP6LSi77yM5LiU5YGP6LSi5pyJ5Yqb77yM5pel5Li75pe655ub44CCJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyAzLjgg5q2j6LSi5qC8XG4gICAgaWYgKHRoaXMuaXNaaGVuZ0NhaUdlKGVpZ2h0Q2hhcikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfmraPotKLmoLwnLFxuICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mnInmraPotKLvvIzkuJTmraPotKLmnInlipvvvIzml6XkuLvml7rnm5vjgIInXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDMuOSDmr5TogqnmoLxcbiAgICBpZiAodGhpcy5pc0JpSmlhbkdlKGVpZ2h0Q2hhcikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfmr5TogqnmoLwnLFxuICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mnInmr5TogqnvvIzkuJTmr5TogqnmnInlipvvvIzml6XkuLvml7rnm5vjgIInXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDMuMTAg5Yqr6LSi5qC8XG4gICAgaWYgKHRoaXMuaXNKaWVDYWlHZShlaWdodENoYXIpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBnZUp1OiAn5Yqr6LSi5qC8JyxcbiAgICAgICAgZGV0YWlsOiAn5YWr5a2X5Lit5pyJ5Yqr6LSi77yM5LiU5Yqr6LSi5pyJ5Yqb77yM5pel5Li75pe655ub44CCJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyDpu5jorqTmoLzlsYBcbiAgICBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+aXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+ebuCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfml6XkuLvml7rnm7gnLFxuICAgICAgICBkZXRhaWw6ICfml6XkuLvml7rnm5vmiJbnm7jml7rvvIzpnIDopoHmipHliLbjgIInXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+ihsCcgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+S8kScpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGdlSnU6ICfml6XkuLvoobDlvLEnLFxuICAgICAgICBkZXRhaWw6ICfml6XkuLvoobDlvLHmiJbkvJHlm5rvvIzpnIDopoHmibbliqnjgIInXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBnZUp1OiAn5pel5Li75bmz5ZKMJyxcbiAgICAgICAgZGV0YWlsOiAn5pel5Li75bmz5ZKM77yM6ZyA6KaB5qC55o2u5YW35L2T5oOF5Ya16LCD5pW044CCJ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65LiD5p2A5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS4g+adgOagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNRaVNoYUdlKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKTogYm9vbGVhbiB7XG4gICAgLy8g566A5YyW5Yik5pat77yM5a6e6ZmF5bqU6K+l5qC55o2u5YWr5a2X5ZG955CG6KeE5YiZ6K6h566XXG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuXG4gICAgLy8g5Yik5pat5piv5ZCm5pyJ5LiD5p2AXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSkgPT09ICfkuIPmnYAnIHx8XG4gICAgICAgICAgIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBtb250aFN0ZW0pID09PSAn5LiD5p2AJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgdGltZVN0ZW0pID09PSAn5LiD5p2AJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrmraPlrpjmoLxcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5piv5ZCm5Li65q2j5a6Y5qC8XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1poZW5nR3VhbkdlKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKTogYm9vbGVhbiB7XG4gICAgLy8g566A5YyW5Yik5pat77yM5a6e6ZmF5bqU6K+l5qC55o2u5YWr5a2X5ZG955CG6KeE5YiZ6K6h566XXG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuXG4gICAgLy8g5Yik5pat5piv5ZCm5pyJ5q2j5a6YXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSkgPT09ICfmraPlrpgnIHx8XG4gICAgICAgICAgIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBtb250aFN0ZW0pID09PSAn5q2j5a6YJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgdGltZVN0ZW0pID09PSAn5q2j5a6YJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrlgY/ljbDmoLxcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5piv5ZCm5Li65YGP5Y2w5qC8XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1BpYW5ZaW5HZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuacieWBj+WNsFxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn5YGP5Y2wJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+WBj+WNsCcgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+WBj+WNsCc7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65q2j5Y2w5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuato+WNsOagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNaaGVuZ1lpbkdlKGVpZ2h0Q2hhcjogRWlnaHRDaGFyKTogYm9vbGVhbiB7XG4gICAgLy8g566A5YyW5Yik5pat77yM5a6e6ZmF5bqU6K+l5qC55o2u5YWr5a2X5ZG955CG6KeE5YiZ6K6h566XXG4gICAgY29uc3QgZGF5U3RlbSA9IGVpZ2h0Q2hhci5nZXREYXlHYW4oKTtcbiAgICBjb25zdCB5ZWFyU3RlbSA9IGVpZ2h0Q2hhci5nZXRZZWFyR2FuKCk7XG4gICAgY29uc3QgbW9udGhTdGVtID0gZWlnaHRDaGFyLmdldE1vbnRoR2FuKCk7XG4gICAgY29uc3QgdGltZVN0ZW0gPSBlaWdodENoYXIuZ2V0VGltZUdhbigpO1xuXG4gICAgLy8g5Yik5pat5piv5ZCm5pyJ5q2j5Y2wXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB5ZWFyU3RlbSkgPT09ICfmraPljbAnIHx8XG4gICAgICAgICAgIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCBtb250aFN0ZW0pID09PSAn5q2j5Y2wJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgdGltZVN0ZW0pID09PSAn5q2j5Y2wJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3mmK/lkKbkuLrpo5/npZ7moLxcbiAgICogQHBhcmFtIGVpZ2h0Q2hhciDlhavlrZflr7nosaFcbiAgICogQHJldHVybnMg5piv5ZCm5Li66aOf56We5qC8XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1NoaVNoZW5HZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuaciemjn+elnlxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn6aOf56WeJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+mjn+elnicgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+mjn+elnic7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65Lyk5a6Y5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuS8pOWumOagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNTaGFuZ0d1YW5HZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuacieS8pOWumFxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn5Lyk5a6YJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+S8pOWumCcgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+S8pOWumCc7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65YGP6LSi5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWBj+i0ouagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNQaWFuQ2FpR2UoZWlnaHRDaGFyOiBFaWdodENoYXIpOiBib29sZWFuIHtcbiAgICAvLyDnroDljJbliKTmlq3vvIzlrp7pmYXlupTor6XmoLnmja7lhavlrZflkb3nkIbop4TliJnorqHnrpdcbiAgICBjb25zdCBkYXlTdGVtID0gZWlnaHRDaGFyLmdldERheUdhbigpO1xuICAgIGNvbnN0IHllYXJTdGVtID0gZWlnaHRDaGFyLmdldFllYXJHYW4oKTtcbiAgICBjb25zdCBtb250aFN0ZW0gPSBlaWdodENoYXIuZ2V0TW9udGhHYW4oKTtcbiAgICBjb25zdCB0aW1lU3RlbSA9IGVpZ2h0Q2hhci5nZXRUaW1lR2FuKCk7XG5cbiAgICAvLyDliKTmlq3mmK/lkKbmnInlgY/otKJcbiAgICByZXR1cm4gdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHllYXJTdGVtKSA9PT0gJ+WBj+i0oicgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIG1vbnRoU3RlbSkgPT09ICflgY/otKInIHx8XG4gICAgICAgICAgIHRoaXMuZ2V0U2hpU2hlbihkYXlTdGVtLCB0aW1lU3RlbSkgPT09ICflgY/otKInO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuS4uuato+i0ouagvFxuICAgKiBAcGFyYW0gZWlnaHRDaGFyIOWFq+Wtl+WvueixoVxuICAgKiBAcmV0dXJucyDmmK/lkKbkuLrmraPotKLmoLxcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzWmhlbmdDYWlHZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuacieato+i0olxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn5q2j6LSiJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+ato+i0oicgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+ato+i0oic7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65q+U6IKp5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuavlOiCqeagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNCaUppYW5HZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuacieavlOiCqVxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn5q+U6IKpJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+avlOiCqScgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+avlOiCqSc7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5piv5ZCm5Li65Yqr6LSi5qC8XG4gICAqIEBwYXJhbSBlaWdodENoYXIg5YWr5a2X5a+56LGhXG4gICAqIEByZXR1cm5zIOaYr+WQpuS4uuWKq+i0ouagvFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNKaWVDYWlHZShlaWdodENoYXI6IEVpZ2h0Q2hhcik6IGJvb2xlYW4ge1xuICAgIC8vIOeugOWMluWIpOaWre+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuICAgIGNvbnN0IGRheVN0ZW0gPSBlaWdodENoYXIuZ2V0RGF5R2FuKCk7XG4gICAgY29uc3QgeWVhclN0ZW0gPSBlaWdodENoYXIuZ2V0WWVhckdhbigpO1xuICAgIGNvbnN0IG1vbnRoU3RlbSA9IGVpZ2h0Q2hhci5nZXRNb250aEdhbigpO1xuICAgIGNvbnN0IHRpbWVTdGVtID0gZWlnaHRDaGFyLmdldFRpbWVHYW4oKTtcblxuICAgIC8vIOWIpOaWreaYr+WQpuacieWKq+i0olxuICAgIHJldHVybiB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgeWVhclN0ZW0pID09PSAn5Yqr6LSiJyB8fFxuICAgICAgICAgICB0aGlzLmdldFNoaVNoZW4oZGF5U3RlbSwgbW9udGhTdGVtKSA9PT0gJ+WKq+i0oicgfHxcbiAgICAgICAgICAgdGhpcy5nZXRTaGlTaGVuKGRheVN0ZW0sIHRpbWVTdGVtKSA9PT0gJ+WKq+i0oic7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5Zyw5pSv5a+55bqU55qE5LqU6KGMXG4gICAqIEBwYXJhbSBicmFuY2gg5Zyw5pSvXG4gICAqIEByZXR1cm5zIOS6lOihjFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0QnJhbmNoV3VYaW5nKGJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WtkCc6ICfmsLQnLFxuICAgICAgJ+S4kSc6ICflnJ8nLFxuICAgICAgJ+WvhSc6ICfmnKgnLFxuICAgICAgJ+WNryc6ICfmnKgnLFxuICAgICAgJ+i+sCc6ICflnJ8nLFxuICAgICAgJ+W3syc6ICfngasnLFxuICAgICAgJ+WNiCc6ICfngasnLFxuICAgICAgJ+acqic6ICflnJ8nLFxuICAgICAgJ+eUsyc6ICfph5EnLFxuICAgICAgJ+mFiSc6ICfph5EnLFxuICAgICAgJ+aIjCc6ICflnJ8nLFxuICAgICAgJ+S6pSc6ICfmsLQnXG4gICAgfTtcblxuICAgIHJldHVybiBtYXBbYnJhbmNoXSB8fCAn5pyq55+lJztcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3kupTooYzmmK/lkKbnm7jnlJ9cbiAgICogQHBhcmFtIGZyb20g5rqQ5LqU6KGMXG4gICAqIEBwYXJhbSB0byDnm67moIfkupTooYxcbiAgICogQHJldHVybnMg5piv5ZCm55u455SfXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1d1WGluZ1NoZW5nKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOS6lOihjOebuOeUn++8muacqOeUn+eBq++8jOeBq+eUn+Wcn++8jOWcn+eUn+mHke+8jOmHkeeUn+awtO+8jOawtOeUn+acqFxuICAgIHJldHVybiAoZnJvbS5pbmNsdWRlcygn5pyoJykgJiYgdG8uaW5jbHVkZXMoJ+eBqycpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn54GrJykgJiYgdG8uaW5jbHVkZXMoJ+WcnycpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn5ZyfJykgJiYgdG8uaW5jbHVkZXMoJ+mHkScpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn6YeRJykgJiYgdG8uaW5jbHVkZXMoJ+awtCcpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn5rC0JykgJiYgdG8uaW5jbHVkZXMoJ+acqCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3kupTooYzmmK/lkKbnm7jlhYtcbiAgICogQHBhcmFtIGZyb20g5rqQ5LqU6KGMXG4gICAqIEBwYXJhbSB0byDnm67moIfkupTooYxcbiAgICogQHJldHVybnMg5piv5ZCm55u45YWLXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1d1WGluZ0tlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIOS6lOihjOebuOWFi++8muacqOWFi+Wcn++8jOWcn+WFi+awtO+8jOawtOWFi+eBq++8jOeBq+WFi+mHke+8jOmHkeWFi+acqFxuICAgIHJldHVybiAoZnJvbS5pbmNsdWRlcygn5pyoJykgJiYgdG8uaW5jbHVkZXMoJ+WcnycpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn5ZyfJykgJiYgdG8uaW5jbHVkZXMoJ+awtCcpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn5rC0JykgJiYgdG8uaW5jbHVkZXMoJ+eBqycpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn54GrJykgJiYgdG8uaW5jbHVkZXMoJ+mHkScpKSB8fFxuICAgICAgICAgICAoZnJvbS5pbmNsdWRlcygn6YeRJykgJiYgdG8uaW5jbHVkZXMoJ+acqCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfotbfov5Dml7bpl7RcbiAgICogQHBhcmFtIHNvbGFyIOmYs+WOhuWvueixoVxuICAgKiBAcGFyYW0gZ2VuZGVyIOaAp+WIq++8iDEt55S377yMMC3lpbPvvIlcbiAgICogQHJldHVybnMg6LW36L+Q5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVRaVl1bihzb2xhcjogU29sYXIsIGdlbmRlcjogc3RyaW5nKTogeyBkYXRlOiBzdHJpbmc7IGFnZTogbnVtYmVyIH0ge1xuICAgIC8vIOi/memHjOeugOWMluWkhOeQhu+8jOWunumZheW6lOivpeagueaNruWFq+Wtl+WRveeQhuinhOWImeiuoeeul1xuXG4gICAgLy8g566A5Y2V56S65L6L77ya55S35ZG9M+Wygei1t+i/kO+8jOWls+WRvTTlsoHotbfov5BcbiAgICBjb25zdCBxaVl1bkFnZSA9IGdlbmRlciA9PT0gJzEnID8gMyA6IDQ7XG5cbiAgICAvLyDorqHnrpfotbfov5DlubTku71cbiAgICBjb25zdCBiaXJ0aFllYXIgPSBzb2xhci5nZXRZZWFyKCk7XG4gICAgY29uc3QgcWlZdW5ZZWFyID0gYmlydGhZZWFyICsgcWlZdW5BZ2U7XG5cbiAgICAvLyDmoLzlvI/ljJbotbfov5Dml6XmnJ9cbiAgICBjb25zdCBxaVl1bkRhdGUgPSBgJHtxaVl1blllYXJ9LSR7c29sYXIuZ2V0TW9udGgoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7c29sYXIuZ2V0RGF5KCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF0ZTogcWlZdW5EYXRlLFxuICAgICAgYWdlOiBxaVl1bkFnZVxuICAgIH07XG4gIH1cblxuXG5cblxuXG5cblxuICAvKipcbiAgICog55Sf5oiQ5Lqk5LqS5byP5YWr5a2X5ZG955uY55qESFRNTFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGv5a+56LGhXG4gICAqIEBwYXJhbSBpZCDlkb3nm5hJRFxuICAgKiBAcmV0dXJucyBIVE1M5a2X56ym5LiyXG4gICAqL1xuICBzdGF0aWMgZ2VuZXJhdGVCYXppSFRNTChiYXppSW5mbzogQmF6aUluZm8sIGlkOiBzdHJpbmcgPSAnYmF6aS12aWV3LScgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOSkpOiBzdHJpbmcge1xuICAgIHJldHVybiBgPGRpdiBpZD1cIiR7aWR9XCIgY2xhc3M9XCJiYXppLXZpZXctY29udGFpbmVyXCI+XG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaGVhZGVyXCI+XG4gICAgPGgzIGNsYXNzPVwiYmF6aS12aWV3LXRpdGxlXCI+5YWr5a2X5ZG955uYPC9oMz5cbiAgICA8YnV0dG9uIGNsYXNzPVwiYmF6aS12aWV3LXNldHRpbmdzLWJ1dHRvblwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCIgYXJpYS1sYWJlbD1cIuiuvue9rlwiPlxuICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiPjwvY2lyY2xlPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxelwiPjwvcGF0aD48L3N2Zz5cbiAgICA8L2J1dHRvbj5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uIGJhemktdmlldy1iYXNpYy1pbmZvXCI+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy1jb2xcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+5YWs5Y6G77yaJHtiYXppSW5mby5zb2xhckRhdGUgfHwgJy0tLS0nfSAke2JhemlJbmZvLnNvbGFyVGltZSB8fCAnLS06LS0nfTwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctY29sXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8taXRlbVwiPuWGnOWOhu+8miR7YmF6aUluZm8ubHVuYXJEYXRlIHx8ICctLS0tJ308L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uXCI+XG4gICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlXCI+XG4gICAgICA8dGhlYWQ+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5bm05p+xPC90aD5cbiAgICAgICAgICA8dGg+5pyI5p+xPC90aD5cbiAgICAgICAgICA8dGg+5pel5p+xPC90aD5cbiAgICAgICAgICA8dGg+5pe25p+xPC90aD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGhlYWQ+XG4gICAgICA8dGJvZHk+XG4gICAgICAgIDx0ciBjbGFzcz1cImJhemktc3RlbS1yb3dcIj5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJ3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKGJhemlJbmZvLnllYXJXdVhpbmcpfVwiPiR7YmF6aUluZm8ueWVhclN0ZW19PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJ3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKGJhemlJbmZvLm1vbnRoV3VYaW5nKX1cIj4ke2JhemlJbmZvLm1vbnRoU3RlbX08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzcz1cInd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8uZGF5V3VYaW5nKX1cIj4ke2JhemlJbmZvLmRheVN0ZW19PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9XCJ3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKGJhemlJbmZvLmhvdXJXdVhpbmcpfVwiPiR7YmF6aUluZm8uaG91clN0ZW19PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyIGNsYXNzPVwiYmF6aS1icmFuY2gtcm93XCI+XG4gICAgICAgICAgPHRkPiR7YmF6aUluZm8ueWVhckJyYW5jaH08L3RkPlxuICAgICAgICAgIDx0ZD4ke2JhemlJbmZvLm1vbnRoQnJhbmNofTwvdGQ+XG4gICAgICAgICAgPHRkPiR7YmF6aUluZm8uZGF5QnJhbmNofTwvdGQ+XG4gICAgICAgICAgPHRkPiR7YmF6aUluZm8uaG91ckJyYW5jaH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHIgY2xhc3M9XCJiYXppLWhpZGVnYW4tcm93XCI+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLnllYXJIaWRlR2FuIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8ubW9udGhIaWRlR2FuIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgICA8dGQ+PHNtYWxsPiR7YmF6aUluZm8uZGF5SGlkZUdhbiB8fCAn5pegJ308L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLmhvdXJIaWRlR2FuIHx8ICfml6AnfTwvc21hbGw+PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyIGNsYXNzPVwiYmF6aS1uYXlpbi1yb3dcIj5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby55ZWFyTmFZaW4gfHwgJ+acquefpSd9PC90ZD5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby5tb250aE5hWWluIHx8ICfmnKrnn6UnfTwvdGQ+XG4gICAgICAgICAgPHRkPiR7YmF6aUluZm8uZGF5TmFZaW4gfHwgJ+acquefpSd9PC90ZD5cbiAgICAgICAgICA8dGQ+JHtiYXppSW5mby5ob3VyTmFZaW4gfHwgJ+acquefpSd9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyIGNsYXNzPVwiYmF6aS14dW5rb25nLXJvd1wiPlxuICAgICAgICAgIDx0ZD48c21hbGw+JHtiYXppSW5mby55ZWFyWHVuS29uZyB8fCAn5pegJ308L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLm1vbnRoWHVuS29uZyB8fCAn5pegJ308L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgPHRkPjxzbWFsbD4ke2JhemlJbmZvLmRheVh1bktvbmcgfHwgJ+aXoCd9PC9zbWFsbD48L3RkPlxuICAgICAgICAgIDx0ZD48c21hbGw+JHtiYXppSW5mby50aW1lWHVuS29uZyB8fCAn5pegJ308L3NtYWxsPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3Rib2R5PlxuICAgIDwvdGFibGU+XG4gIDwvZGl2PlxuXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvblwiPlxuICAgIDxoNCBjbGFzcz1cImJhemktdmlldy1zdWJ0aXRsZVwiPuS6lOihjOWIhuaekDwvaDQ+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy13dXhpbmctbGlzdFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8ueWVhcld1WGluZyl9XCI+JHtiYXppSW5mby55ZWFyU3RlbX0oJHtiYXppSW5mby55ZWFyV3VYaW5nIHx8ICfmnKrnn6UnfSk8L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInd1eGluZy10YWcgd3V4aW5nLSR7dGhpcy5nZXRXdVhpbmdDbGFzcyhiYXppSW5mby5tb250aFd1WGluZyl9XCI+JHtiYXppSW5mby5tb250aFN0ZW19KCR7YmF6aUluZm8ubW9udGhXdVhpbmcgfHwgJ+acquefpSd9KTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwid3V4aW5nLXRhZyB3dXhpbmctJHt0aGlzLmdldFd1WGluZ0NsYXNzKGJhemlJbmZvLmRheVd1WGluZyl9XCI+JHtiYXppSW5mby5kYXlTdGVtfSgke2JhemlJbmZvLmRheVd1WGluZyB8fCAn5pyq55+lJ30pPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy0ke3RoaXMuZ2V0V3VYaW5nQ2xhc3MoYmF6aUluZm8uaG91cld1WGluZyl9XCI+JHtiYXppSW5mby5ob3VyU3RlbX0oJHtiYXppSW5mby5ob3VyV3VYaW5nIHx8ICfmnKrnn6UnfSk8L3NwYW4+XG4gICAgPC9kaXY+XG5cbiAgICAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoID8gYFxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctd3V4aW5nLXN0cmVuZ3RoXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy1oZWFkZXJcIiBkYXRhLWJhemktaWQ9XCIke2lkfVwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJhemktdmlldy13dXhpbmctdGl0bGVcIj7kupTooYzlvLrluqY6PC9zcGFuPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy1iYXJzXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXJcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwid3V4aW5nLXRhZyB3dXhpbmctamluIHd1eGluZy1jbGlja2FibGVcIiBkYXRhLXd1eGluZz1cIumHkVwiIGRhdGEtdmFsdWU9XCIke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmppbi50b0ZpeGVkKDEpfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+6YeROiAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmppbi50b0ZpeGVkKDEpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3dXhpbmctYmFyLWlubmVyIHd1eGluZy1qaW5cIiBzdHlsZT1cIndpZHRoOiAke01hdGgubWluKGJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmppbiAqIDEwLCAxMDApfSVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy1tdSB3dXhpbmctY2xpY2thYmxlXCIgZGF0YS13dXhpbmc9XCLmnKhcIiBkYXRhLXZhbHVlPVwiJHtiYXppSW5mby53dVhpbmdTdHJlbmd0aC5tdS50b0ZpeGVkKDEpfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+5pyoOiAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLm11LnRvRml4ZWQoMSl9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXItaW5uZXIgd3V4aW5nLW11XCIgc3R5bGU9XCJ3aWR0aDogJHtNYXRoLm1pbihiYXppSW5mby53dVhpbmdTdHJlbmd0aC5tdSAqIDEwLCAxMDApfSVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy1zaHVpIHd1eGluZy1jbGlja2FibGVcIiBkYXRhLXd1eGluZz1cIuawtFwiIGRhdGEtdmFsdWU9XCIke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnNodWkudG9GaXhlZCgxKX1cIiBkYXRhLWJhemktaWQ9XCIke2lkfVwiPuawtDogJHtiYXppSW5mby53dVhpbmdTdHJlbmd0aC5zaHVpLnRvRml4ZWQoMSl9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXItaW5uZXIgd3V4aW5nLXNodWlcIiBzdHlsZT1cIndpZHRoOiAke01hdGgubWluKGJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnNodWkgKiAxMCwgMTAwKX0lXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXJcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwid3V4aW5nLXRhZyB3dXhpbmctaHVvIHd1eGluZy1jbGlja2FibGVcIiBkYXRhLXd1eGluZz1cIueBq1wiIGRhdGEtdmFsdWU9XCIke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmh1by50b0ZpeGVkKDEpfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+54GrOiAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmh1by50b0ZpeGVkKDEpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3dXhpbmctYmFyLWlubmVyIHd1eGluZy1odW9cIiBzdHlsZT1cIndpZHRoOiAke01hdGgubWluKGJhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLmh1byAqIDEwLCAxMDApfSVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwid3V4aW5nLWJhclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ3dXhpbmctdGFnIHd1eGluZy10dSB3dXhpbmctY2xpY2thYmxlXCIgZGF0YS13dXhpbmc9XCLlnJ9cIiBkYXRhLXZhbHVlPVwiJHtiYXppSW5mby53dVhpbmdTdHJlbmd0aC50dS50b0ZpeGVkKDEpfVwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+5ZyfOiAke2JhemlJbmZvLnd1WGluZ1N0cmVuZ3RoLnR1LnRvRml4ZWQoMSl9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInd1eGluZy1iYXItaW5uZXIgd3V4aW5nLXR1XCIgc3R5bGU9XCJ3aWR0aDogJHtNYXRoLm1pbihiYXppSW5mby53dVhpbmdTdHJlbmd0aC50dSAqIDEwLCAxMDApfSVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmF6aS12aWV3LXd1eGluZy10b2dnbGVcIiBkYXRhLWJhemktaWQ9XCIke2lkfVwiPuafpeeci+ivpuaDhSDilrw8L3NwYW4+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImJhemktdmlldy13dXhpbmctZGV0YWlsc1wiIGlkPVwid3V4aW5nLWRldGFpbHMtJHtpZH1cIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XG4gICAgICAgIDx0YWJsZSBjbGFzcz1cImJhemktdmlldy13dXhpbmctdGFibGVcIj5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGggY29sc3Bhbj1cIjJcIj7kupTooYzlvLrluqborqHnrpfor7TmmI48L3RoPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIyXCI+5LqU6KGM5by65bqm5piv5qC55o2u5Lul5LiL5Zug57Sg57u85ZCI6K6h566X55qE77yaPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD7lpKnlubLkupTooYw8L3RkPlxuICAgICAgICAgICAgPHRkPuW5tOW5sigxLjAp44CB5pyI5bmyKDIuMCnjgIHml6XlubIoMy4wKeOAgeaXtuW5sigxLjApPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD7lnLDmlK/ol4/lubI8L3RkPlxuICAgICAgICAgICAgPHRkPuW5tOaUrygwLjcp44CB5pyI5pSvKDEuNSnjgIHml6XmlK8oMi4wKeOAgeaXtuaUrygwLjcpPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD7nurPpn7PkupTooYw8L3RkPlxuICAgICAgICAgICAgPHRkPuW5tOafsSgwLjUp44CB5pyI5p+xKDEuMCnjgIHml6Xmn7EoMS41KeOAgeaXtuafsSgwLjUpPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD7lraPoioLosIPmlbQ8L3RkPlxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICDmmKXlraPvvJrmnKjml7ooKzEuMCnjgIHngavnm7goKzAuNSk8YnI+XG4gICAgICAgICAgICAgIOWkj+Wto++8mueBq+aXuigrMS4wKeOAgeWcn+ebuCgrMC41KTxicj5cbiAgICAgICAgICAgICAg56eL5a2j77ya6YeR5pe6KCsxLjAp44CB5rC055u4KCswLjUpPGJyPlxuICAgICAgICAgICAgICDlhqzlraPvvJrmsLTml7ooKzEuMCnjgIHmnKjnm7goKzAuNSlcbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+57uE5ZCI6LCD5pW0PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAg5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5Zyf44CB5LmZ5bqa5ZCI6YeR44CB5LiZ6L6b5ZCI5rC044CB5LiB5aOs5ZCI5pyo44CB5oiK55m45ZCI54GrKCswLjUpPGJyPlxuICAgICAgICAgICAgICDlnLDmlK/kuInlkIjvvJrlr4XljYjmiIzlkIjngavjgIHkuqXlja/mnKrlkIjmnKjjgIHnlLPlrZDovrDlkIjmsLTjgIHlt7PphYnkuJHlkIjph5EoKzEuMClcbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGAgOiAnJ31cblxuICAgICR7YmF6aUluZm8ucmlaaHVTdHJlbmd0aCA/IGBcbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXJpemh1LXN0cmVuZ3RoXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXJpemh1LWhlYWRlclwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmF6aS12aWV3LXJpemh1LXRpdGxlXCI+5pel5Li75pe66KGwOiA8c3BhbiBjbGFzcz1cInNoZW5zaGEtdGFnIHJpemh1LWNsaWNrYWJsZVwiIGRhdGEtcml6aHU9XCIke2JhemlJbmZvLnJpWmh1U3RyZW5ndGh9XCIgZGF0YS13dXhpbmc9XCIke2JhemlJbmZvLmRheVd1WGluZ31cIiBkYXRhLWJhemktaWQ9XCIke2lkfVwiIHN0eWxlPVwiY3Vyc29yOiBwb2ludGVyO1wiPiR7YmF6aUluZm8ucmlaaHVTdHJlbmd0aH08L3NwYW4+PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYCA6ICcnfVxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb25cIj5cbiAgICA8aDQgY2xhc3M9XCJiYXppLXZpZXctc3VidGl0bGVcIj7nibnmrorkv6Hmga88L2g0PlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1saXN0XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8taXRlbVwiPuiDjuWFg++8miR7YmF6aUluZm8udGFpWXVhbiB8fCAn5pyq55+lJ30ke2JhemlJbmZvLnRhaVl1YW5OYVlpbiA/IGDvvIgke2JhemlJbmZvLnRhaVl1YW5OYVlpbn3vvIlgIDogJyd9PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8taXRlbVwiPuWRveWuq++8miR7YmF6aUluZm8ubWluZ0dvbmcgfHwgJ+acquefpSd9JHtiYXppSW5mby5taW5nR29uZ05hWWluID8gYO+8iCR7YmF6aUluZm8ubWluZ0dvbmdOYVlpbn3vvIlgIDogJyd9PC9kaXY+XG4gICAgICAke2JhemlJbmZvLnNoZW5Hb25nID8gYDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+6Lqr5a6r77yaJHtiYXppSW5mby5zaGVuR29uZ308L2Rpdj5gIDogJyd9XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuXG4gICR7YmF6aUluZm8ucWlZdW5ZZWFyIHx8IGJhemlJbmZvLnFpWXVuRGF0ZSA/IGBcbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uXCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+6LW36L+Q5L+h5oGvPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWluZm8tbGlzdFwiPlxuICAgICAgJHtiYXppSW5mby5xaVl1blllYXIgPyBgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWl0ZW1cIj7otbfov5Dml7bpl7TvvJrlh7rnlJ8ke2JhemlJbmZvLnFpWXVuWWVhcn3lubQke2JhemlJbmZvLnFpWXVuTW9udGggfHwgMH3kuKrmnIgke2JhemlJbmZvLnFpWXVuRGF5IHx8IDB95aSpJHtiYXppSW5mby5xaVl1bkhvdXIgJiYgYmF6aUluZm8ucWlZdW5Ib3VyID4gMCA/IGJhemlJbmZvLnFpWXVuSG91ciArICflsI/ml7YnIDogJyd95ZCOPC9kaXY+YCA6ICcnfVxuICAgICAgJHtiYXppSW5mby5xaVl1bkRhdGUgPyBgPGRpdiBjbGFzcz1cImJhemktdmlldy1pbmZvLWl0ZW1cIj7otbfov5Dml6XmnJ/vvJoke2JhemlJbmZvLnFpWXVuRGF0ZX08L2Rpdj5gIDogJyd9XG4gICAgICAke2JhemlJbmZvLnFpWXVuQWdlID8gYDxkaXYgY2xhc3M9XCJiYXppLXZpZXctaW5mby1pdGVtXCI+6LW36L+Q5bm06b6E77yaJHtiYXppSW5mby5xaVl1bkFnZX3lsoE8L2Rpdj5gIDogJyd9XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICBgIDogJyd9XG5cbiAgJHtiYXppSW5mby5kYVl1biAmJiBiYXppSW5mby5kYVl1bi5sZW5ndGggPiAwID8gYFxuICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXNlY3Rpb25cIj5cbiAgICA8aDQgY2xhc3M9XCJiYXppLXZpZXctc3VidGl0bGVcIj7lpKfov5Dkv6Hmga88L2g0PlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctdGFibGUtY29udGFpbmVyXCI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJiYXppLXZpZXctdGFibGUgYmF6aS12aWV3LWRheXVuLXRhYmxlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5aSn6L+QPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLmRhWXVuLnNsaWNlKDAsIDEwKS5tYXAoZHkgPT4gYDx0ZD4ke2R5LnN0YXJ0WWVhcn08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5tOm+hDwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5kYVl1bi5zbGljZSgwLCAxMCkubWFwKGR5ID0+IGA8dGQ+JHtkeS5zdGFydEFnZX08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5suaUrzwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5kYVl1bi5zbGljZSgwLCAxMCkubWFwKChkeSwgaW5kZXgpID0+IGBcbiAgICAgICAgICAgIDx0ZCBjbGFzcz1cImJhemktZGF5dW4tY2VsbFwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiPiR7ZHkuZ2FuWmhpfTwvdGQ+XG4gICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYCA6ICcnfVxuXG4gICR7YmF6aUluZm8ubGl1TmlhbiAmJiBiYXppSW5mby5saXVOaWFuLmxlbmd0aCA+IDAgPyBgXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvbiBiYXppLWxpdW5pYW4tc2VjdGlvblwiIGRhdGEtYmF6aS1pZD1cIiR7aWR9XCI+XG4gICAgPGg0IGNsYXNzPVwiYmF6aS12aWV3LXN1YnRpdGxlXCI+5rWB5bm05L+h5oGvPC9oND5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlLWNvbnRhaW5lclwiPlxuICAgICAgPHRhYmxlIGNsYXNzPVwiYmF6aS12aWV3LXRhYmxlIGJhemktdmlldy1saXVuaWFuLXRhYmxlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5rWB5bm0PC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLmxpdU5pYW4uc2xpY2UoMCwgMTApLm1hcChsbiA9PiBgPHRkPiR7bG4ueWVhcn08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5tOm+hDwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5saXVOaWFuLnNsaWNlKDAsIDEwKS5tYXAobG4gPT4gYDx0ZD4ke2xuLmFnZX08L3RkPmApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPuW5suaUrzwvdGg+XG4gICAgICAgICAgJHtiYXppSW5mby5saXVOaWFuLnNsaWNlKDAsIDEwKS5tYXAobG4gPT4gYFxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiYmF6aS1saXVuaWFuLWNlbGxcIiBkYXRhLXllYXI9XCIke2xuLnllYXJ9XCI+JHtsbi5nYW5aaGl9PC90ZD5cbiAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICBgIDogJyd9XG5cbiAgJHtiYXppSW5mby54aWFvWXVuICYmIGJhemlJbmZvLnhpYW9ZdW4ubGVuZ3RoID4gMCA/IGBcbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uIGJhemkteGlhb3l1bi1zZWN0aW9uXCIgZGF0YS1iYXppLWlkPVwiJHtpZH1cIj5cbiAgICA8aDQgY2xhc3M9XCJiYXppLXZpZXctc3VidGl0bGVcIj7lsI/ov5Dkv6Hmga88L2g0PlxuICAgIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctdGFibGUtY29udGFpbmVyXCI+XG4gICAgICA8dGFibGUgY2xhc3M9XCJiYXppLXZpZXctdGFibGUgYmF6aS12aWV3LXhpYW95dW4tdGFibGVcIj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD7lsI/ov5A8L3RoPlxuICAgICAgICAgICR7YmF6aUluZm8ueGlhb1l1bi5zbGljZSgwLCAxMCkubWFwKHh5ID0+IGA8dGQ+JHt4eS55ZWFyfTwvdGQ+YCkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5bm06b6EPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLnhpYW9ZdW4uc2xpY2UoMCwgMTApLm1hcCh4eSA9PiBgPHRkPiR7eHkuYWdlfTwvdGQ+YCkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5bmy5pSvPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLnhpYW9ZdW4uc2xpY2UoMCwgMTApLm1hcCh4eSA9PiBgXG4gICAgICAgICAgICA8dGQgY2xhc3M9XCJiYXppLXhpYW95dW4tY2VsbFwiIGRhdGEteWVhcj1cIiR7eHkueWVhcn1cIj4ke3h5LmdhblpoaX08L3RkPlxuICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIGAgOiAnJ31cblxuICAke2JhemlJbmZvLmxpdVl1ZSAmJiBiYXppSW5mby5saXVZdWUubGVuZ3RoID4gMCA/IGBcbiAgPGRpdiBjbGFzcz1cImJhemktdmlldy1zZWN0aW9uIGJhemktbGl1eXVlLXNlY3Rpb25cIiBkYXRhLWJhemktaWQ9XCIke2lkfVwiPlxuICAgIDxoNCBjbGFzcz1cImJhemktdmlldy1zdWJ0aXRsZVwiPua1geaciOS/oeaBrzwvaDQ+XG4gICAgPGRpdiBjbGFzcz1cImJhemktdmlldy10YWJsZS1jb250YWluZXJcIj5cbiAgICAgIDx0YWJsZSBjbGFzcz1cImJhemktdmlldy10YWJsZSBiYXppLXZpZXctbGl1eXVlLXRhYmxlXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5rWB5pyIPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLmxpdVl1ZS5tYXAobHkgPT4gYDx0ZD4ke2x5Lm1vbnRofTwvdGQ+YCkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+5bmy5pSvPC90aD5cbiAgICAgICAgICAke2JhemlJbmZvLmxpdVl1ZS5tYXAobHkgPT4gYFxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiYmF6aS1saXV5dWUtY2VsbFwiIGRhdGEtbW9udGg9XCIke2x5Lm1vbnRofVwiPiR7bHkuZ2FuWmhpfTwvdGQ+XG4gICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYCA6ICcnfVxuXG4gIDxkaXYgY2xhc3M9XCJiYXppLXZpZXctc2VjdGlvblwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cbiAgICA8ZGl2IGNsYXNzPVwiYmF6aS12aWV3LWRhdGFcIlxuICAgICAgZGF0YS15ZWFyPVwiJHtiYXppSW5mby5zb2xhckRhdGUgJiYgYmF6aUluZm8uc29sYXJEYXRlLmluY2x1ZGVzKCctJykgPyBiYXppSW5mby5zb2xhckRhdGUuc3BsaXQoJy0nKVswXSA6ICcyMDIzJ31cIlxuICAgICAgZGF0YS1tb250aD1cIiR7YmF6aUluZm8uc29sYXJEYXRlICYmIGJhemlJbmZvLnNvbGFyRGF0ZS5pbmNsdWRlcygnLScpID8gYmF6aUluZm8uc29sYXJEYXRlLnNwbGl0KCctJylbMV0gOiAnMSd9XCJcbiAgICAgIGRhdGEtZGF5PVwiJHtiYXppSW5mby5zb2xhckRhdGUgJiYgYmF6aUluZm8uc29sYXJEYXRlLmluY2x1ZGVzKCctJykgPyBiYXppSW5mby5zb2xhckRhdGUuc3BsaXQoJy0nKVsyXSA6ICcxJ31cIlxuICAgICAgZGF0YS1ob3VyPVwiJHtiYXppSW5mby5zb2xhclRpbWUgJiYgYmF6aUluZm8uc29sYXJUaW1lLmluY2x1ZGVzKCc6JykgPyBiYXppSW5mby5zb2xhclRpbWUuc3BsaXQoJzonKVswXSA6ICcwJ31cIlxuICAgICAgZGF0YS1hbGwtZGF5dW49JyR7SlNPTi5zdHJpbmdpZnkoYmF6aUluZm8uZGFZdW4gfHwgW10pfSdcbiAgICAgIGRhdGEtYWxsLWxpdW5pYW49JyR7SlNPTi5zdHJpbmdpZnkoYmF6aUluZm8ubGl1TmlhbiB8fCBbXSl9J1xuICAgICAgZGF0YS1hbGwteGlhb3l1bj0nJHtKU09OLnN0cmluZ2lmeShiYXppSW5mby54aWFvWXVuIHx8IFtdKX0nXG4gICAgICBkYXRhLWFsbC1saXV5dWU9JyR7SlNPTi5zdHJpbmdpZnkoYmF6aUluZm8ubGl1WXVlIHx8IFtdKX0nPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvZGl2PmA7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPluS6lOihjOWvueW6lOeahENTU+exu+WQjVxuICAgKiBAcGFyYW0gd3V4aW5nIOS6lOihjOWQjeensFxuICAgKiBAcmV0dXJucyBDU1PnsbvlkI1cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFd1WGluZ0NsYXNzKHd1eGluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlpoLmnpx3dXhpbmfmnKrlrprkuYnvvIzov5Tlm57nqbrlrZfnrKbkuLJcbiAgICBpZiAoIXd1eGluZykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn6YeRJzogJ2ppbicsXG4gICAgICAn5pyoJzogJ211JyxcbiAgICAgICfmsLQnOiAnc2h1aScsXG4gICAgICAn54GrJzogJ2h1bycsXG4gICAgICAn5ZyfJzogJ3R1J1xuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXApIHtcbiAgICAgIGlmICh3dXhpbmcuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICByZXR1cm4gbWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKlxuICog5YWr5a2X5L+h5oGv5o6l5Y+jXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmF6aUluZm8ge1xuICAvLyDln7rmnKzkv6Hmga9cbiAgc29sYXJEYXRlOiBzdHJpbmc7XG4gIGx1bmFyRGF0ZTogc3RyaW5nO1xuICBzb2xhclRpbWU6IHN0cmluZztcblxuICAvLyDlhavlrZfkv6Hmga9cbiAgeWVhclBpbGxhcjogc3RyaW5nO1xuICB5ZWFyU3RlbTogc3RyaW5nO1xuICB5ZWFyQnJhbmNoOiBzdHJpbmc7XG4gIHllYXJIaWRlR2FuOiBzdHJpbmc7XG4gIHllYXJXdVhpbmc6IHN0cmluZztcbiAgeWVhck5hWWluOiBzdHJpbmc7XG5cbiAgbW9udGhQaWxsYXI6IHN0cmluZztcbiAgbW9udGhTdGVtOiBzdHJpbmc7XG4gIG1vbnRoQnJhbmNoOiBzdHJpbmc7XG4gIG1vbnRoSGlkZUdhbjogc3RyaW5nO1xuICBtb250aFd1WGluZzogc3RyaW5nO1xuICBtb250aE5hWWluOiBzdHJpbmc7XG5cbiAgZGF5UGlsbGFyOiBzdHJpbmc7XG4gIGRheVN0ZW06IHN0cmluZztcbiAgZGF5QnJhbmNoOiBzdHJpbmc7XG4gIGRheUhpZGVHYW46IHN0cmluZztcbiAgZGF5V3VYaW5nOiBzdHJpbmc7XG4gIGRheU5hWWluOiBzdHJpbmc7XG5cbiAgaG91clBpbGxhcjogc3RyaW5nO1xuICBob3VyU3RlbTogc3RyaW5nO1xuICBob3VyQnJhbmNoOiBzdHJpbmc7XG4gIGhvdXJIaWRlR2FuOiBzdHJpbmc7XG4gIGhvdXJXdVhpbmc6IHN0cmluZztcbiAgaG91ck5hWWluOiBzdHJpbmc7XG5cbiAgLy8g54m55q6K5L+h5oGvXG4gIHRhaVl1YW46IHN0cmluZztcbiAgdGFpWXVhbk5hWWluOiBzdHJpbmc7XG4gIG1pbmdHb25nOiBzdHJpbmc7XG4gIG1pbmdHb25nTmFZaW46IHN0cmluZztcbiAgc2hlbkdvbmc/OiBzdHJpbmc7ICAgICAgIC8vIOi6q+Wuq1xuXG4gIC8vIOWujOaVtOS/oeaBr1xuICBmdWxsU3RyaW5nOiBzdHJpbmc7XG5cbiAgLy8g5Y+v6YCJ5bGe5oCnIC0g55So5LqO6K6+572u5ZKM5pi+56S6XG4gIHNob3dXdXhpbmc/OiBib29sZWFuO1xuICBzaG93U3BlY2lhbEluZm8/OiBib29sZWFuO1xuICBnZW5kZXI/OiBzdHJpbmc7XG4gIGNhbGN1bGF0aW9uTWV0aG9kPzogc3RyaW5nO1xuICBiYXppU2VjdD86IHN0cmluZzsgICAgICAgLy8g5YWr5a2X5rWB5rS+IDHmiJYyXG5cbiAgLy8g5Y6f5aeL5pel5pyf5L+h5oGvIC0g55So5LqO5Luj56CB5Z2X5pu05pawXG4gIG9yaWdpbmFsRGF0ZT86IHtcbiAgICB5ZWFyOiBudW1iZXI7XG4gICAgbW9udGg6IG51bWJlcjtcbiAgICBkYXk6IG51bWJlcjtcbiAgICBob3VyOiBudW1iZXI7XG4gIH07XG5cbiAgLy8g5omp5bGV5L+h5oGvIC0g5Y+C6ICDNnRhaWwuY24gQVBJXG4gIC8vIOWNgeS6jOmVv+eUn1xuICB5ZWFyU2hlbmdYaWFvPzogc3RyaW5nOyAgLy8g5bm055Sf6IKWXG4gIG1vbnRoU2hlbmdYaWFvPzogc3RyaW5nOyAvLyDmnIjnlJ/ogpZcbiAgZGF5U2hlbmdYaWFvPzogc3RyaW5nOyAgIC8vIOaXpeeUn+iCllxuICBob3VyU2hlbmdYaWFvPzogc3RyaW5nOyAgLy8g5pe255Sf6IKWXG5cbiAgLy8g5Y2B56WeXG4gIHllYXJTaGlTaGVuPzogc3RyaW5nOyAgICAvLyDlubTljYHnpZ5cbiAgbW9udGhTaGlTaGVuPzogc3RyaW5nOyAgIC8vIOaciOWNgeelnlxuICBkYXlTaGlTaGVuPzogc3RyaW5nOyAgICAgLy8g5pel5Y2B56WeXG4gIGhvdXJTaGlTaGVuPzogc3RyaW5nOyAgICAvLyDml7bljYHnpZ5cblxuICAvLyDlnLDmlK/ljYHnpZ7vvIjol4/lubLvvIlcbiAgeWVhclNoaVNoZW5aaGk/OiBzdHJpbmdbXTsgIC8vIOW5tOaUr+WNgeelnlxuICBtb250aFNoaVNoZW5aaGk/OiBzdHJpbmdbXTsgLy8g5pyI5pSv5Y2B56WeXG4gIGRheVNoaVNoZW5aaGk/OiBzdHJpbmdbXTsgICAvLyDml6XmlK/ljYHnpZ5cbiAgaG91clNoaVNoZW5aaGk/OiBzdHJpbmdbXTsgIC8vIOaXtuaUr+WNgeelnlxuXG4gIC8vIOWcsOWKv++8iOmVv+eUn+WNgeS6jOelnu+8iVxuICB5ZWFyRGlTaGk/OiBzdHJpbmc7ICAgICAgLy8g5bm05p+x5Zyw5Yq/XG4gIG1vbnRoRGlTaGk/OiBzdHJpbmc7ICAgICAvLyDmnIjmn7HlnLDlir9cbiAgZGF5RGlTaGk/OiBzdHJpbmc7ICAgICAgIC8vIOaXpeafseWcsOWKv1xuICB0aW1lRGlTaGk/OiBzdHJpbmc7ICAgICAgLy8g5pe25p+x5Zyw5Yq/XG5cbiAgLy8g5pes56m677yI56m65Lqh77yJXG4gIHllYXJYdW5Lb25nPzogc3RyaW5nOyAgICAvLyDlubTmn7Hml6znqbpcbiAgbW9udGhYdW5Lb25nPzogc3RyaW5nOyAgIC8vIOaciOafseaXrOepulxuICBkYXlYdW5Lb25nPzogc3RyaW5nOyAgICAgLy8g5pel5p+x5pes56m6XG4gIHRpbWVYdW5Lb25nPzogc3RyaW5nOyAgICAvLyDml7bmn7Hml6znqbpcblxuICAvLyDmmJ/luqdcbiAgem9kaWFjPzogc3RyaW5nOyAgICAgICAgIC8vIOaYn+W6p1xuXG4gIC8vIOiKguawlFxuICBqaWVRaT86IHN0cmluZzsgICAgICAgICAgLy8g6IqC5rCUXG4gIG5leHRKaWVRaT86IHN0cmluZzsgICAgICAvLyDkuIvkuIDoioLmsJRcblxuICAvLyDlkInlh7ZcbiAgZGF5WWk/OiBzdHJpbmdbXTsgICAgICAgIC8vIOWunFxuICBkYXlKaT86IHN0cmluZ1tdOyAgICAgICAgLy8g5b+MXG5cbiAgLy8g56We54WeXG4gIHNoZW5TaGE/OiBzdHJpbmdbXTsgICAgICAvLyDnpZ7nhZ5cblxuICAvLyDog47mga9cbiAgdGFpWGk/OiBzdHJpbmc7ICAgICAgICAgIC8vIOiDjuaBr1xuXG4gIC8vIOi1t+i/kOS/oeaBr1xuICBxaVl1blllYXI/OiBudW1iZXI7ICAgICAgLy8g6LW36L+Q5bm05pWwXG4gIHFpWXVuTW9udGg/OiBudW1iZXI7ICAgICAvLyDotbfov5DmnIjmlbBcbiAgcWlZdW5EYXk/OiBudW1iZXI7ICAgICAgIC8vIOi1t+i/kOWkqeaVsFxuICBxaVl1bkhvdXI/OiBudW1iZXI7ICAgICAgLy8g6LW36L+Q5bCP5pe25pWwXG4gIHFpWXVuRGF0ZT86IHN0cmluZzsgICAgICAvLyDotbfov5Dml6XmnJ9cbiAgcWlZdW5BZ2U/OiBudW1iZXI7ICAgICAgIC8vIOi1t+i/kOW5tOm+hFxuXG4gIC8vIOWkp+i/kFxuICBkYVl1bj86IHtcbiAgICBzdGFydFllYXI6IG51bWJlcjsgICAgIC8vIOWkp+i/kOi1t+Wni+W5tFxuICAgIGVuZFllYXI6IG51bWJlcjsgICAgICAgLy8g5aSn6L+Q57uT5p2f5bm0XG4gICAgc3RhcnRBZ2U6IG51bWJlcjsgICAgICAvLyDlpKfov5Dotbflp4vlubTpvoRcbiAgICBlbmRBZ2U6IG51bWJlcjsgICAgICAgIC8vIOWkp+i/kOe7k+adn+W5tOm+hFxuICAgIGluZGV4OiBudW1iZXI7ICAgICAgICAgLy8g56ys5Yeg6L2u5aSn6L+QXG4gICAgZ2FuWmhpOiBzdHJpbmc7ICAgICAgICAvLyDlpKfov5DlubLmlK9cbiAgICBuYVlpbjogc3RyaW5nOyAgICAgICAgIC8vIOWkp+i/kOe6s+mfs1xuICAgIHh1bktvbmc/OiBzdHJpbmc7ICAgICAgLy8g5pes56m6XG4gIH1bXTtcblxuICAvLyDmtYHlubRcbiAgbGl1Tmlhbj86IHtcbiAgICB5ZWFyOiBudW1iZXI7ICAgICAgICAgIC8vIOa1geW5tFxuICAgIGFnZTogbnVtYmVyOyAgICAgICAgICAgLy8g5bm06b6EXG4gICAgaW5kZXg6IG51bWJlcjsgICAgICAgICAvLyDkvY3kuo7lvZPliY3lpKfov5DkuK3nmoTluo/lj7dcbiAgICBnYW5aaGk6IHN0cmluZzsgICAgICAgIC8vIOa1geW5tOW5suaUr1xuICAgIG5hWWluOiBzdHJpbmc7ICAgICAgICAgLy8g5rWB5bm057qz6Z+zXG4gICAgeHVuS29uZz86IHN0cmluZzsgICAgICAvLyDml6znqbpcbiAgfVtdO1xuXG4gIC8vIOWwj+i/kFxuICB4aWFvWXVuPzoge1xuICAgIHllYXI6IG51bWJlcjsgICAgICAgICAgLy8g5bm05Lu9XG4gICAgYWdlOiBudW1iZXI7ICAgICAgICAgICAvLyDlubTpvoRcbiAgICBpbmRleDogbnVtYmVyOyAgICAgICAgIC8vIOS9jeS6juW9k+WJjeWkp+i/kOS4reeahOW6j+WPt1xuICAgIGdhblpoaTogc3RyaW5nOyAgICAgICAgLy8g5bmy5pSvXG4gICAgeHVuS29uZz86IHN0cmluZzsgICAgICAvLyDml6znqbpcbiAgfVtdO1xuXG4gIC8vIOa1geaciFxuICBsaXVZdWU/OiB7XG4gICAgbW9udGg6IHN0cmluZzsgICAgICAgICAvLyDkuK3mlofmnIjku71cbiAgICBpbmRleDogbnVtYmVyOyAgICAgICAgIC8vIOaciOW6j+WPt1xuICAgIGdhblpoaTogc3RyaW5nOyAgICAgICAgLy8g5bmy5pSvXG4gICAgeHVuS29uZz86IHN0cmluZzsgICAgICAvLyDml6znqbpcbiAgfVtdO1xuXG4gIC8vIOWbm+afseS6lOihjOW8uuW6plxuICB3dVhpbmdTdHJlbmd0aD86IHtcbiAgICBqaW46IG51bWJlcjsgICAgICAgICAgIC8vIOmHkVxuICAgIG11OiBudW1iZXI7ICAgICAgICAgICAgLy8g5pyoXG4gICAgc2h1aTogbnVtYmVyOyAgICAgICAgICAvLyDmsLRcbiAgICBodW86IG51bWJlcjsgICAgICAgICAgIC8vIOeBq1xuICAgIHR1OiBudW1iZXI7ICAgICAgICAgICAgLy8g5ZyfXG4gIH07XG5cbiAgLy8g5pel5Li75pe66KGwXG4gIHJpWmh1U3RyZW5ndGg/OiBzdHJpbmc7ICAvLyDml6XkuLvml7roobBcbiAgcmlaaHVTdHJlbmd0aERldGFpbHM/OiB7XG4gICAgZGF5V3VYaW5nOiBzdHJpbmc7XG4gICAgc2Vhc29uOiBzdHJpbmc7XG4gICAgYmFzZVNjb3JlOiBudW1iZXI7XG4gICAgc2Vhc29uRWZmZWN0OiBzdHJpbmc7XG4gICAgZ2FuUmVsYXRpb246IHN0cmluZztcbiAgICB6aGlSZWxhdGlvbjogc3RyaW5nO1xuICAgIHNwZWNpYWxSZWxhdGlvbjogc3RyaW5nO1xuICAgIHRvdGFsU2NvcmU6IG51bWJlcjtcbiAgfTtcbn1cbiJdfQ==