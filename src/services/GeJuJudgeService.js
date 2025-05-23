export class GeJuJudgeService {
    /**
     * 判断八字格局
     * @param baziInfo 八字信息
     * @returns 格局判断结果
     */
    static judgeGeJu(baziInfo) {
        // 初始化结果
        const result = {
            mainGeJu: '',
            mainGeJuDetail: '',
            mainGeJuStrength: 0,
            assistGeJuList: [],
            yongShen: '',
            yongShenDetail: '',
            factors: []
        };
        // 检查必要信息是否存在
        if (!baziInfo.dayStem || !baziInfo.dayWuXing || !baziInfo.riZhuStrength) {
            result.mainGeJu = '信息不足';
            result.mainGeJuDetail = '无法判断格局，缺少必要的八字信息。';
            return result;
        }
        // 1. 判断各种可能的格局及其强度
        const possibleGeJuList = this.judgePossibleGeJu(baziInfo);
        // 2. 根据优先级和强度确定主格局和辅助格局
        const { mainGeJu, assistGeJuList } = this.determineMainGeJu(possibleGeJuList, baziInfo);
        // 3. 确定用神
        const { yongShen, yongShenDetail } = this.determineYongShen(mainGeJu, baziInfo);
        // 4. 收集格局形成的关键因素
        const factors = this.collectGeJuFactors(mainGeJu, baziInfo);
        // 设置结果
        result.mainGeJu = mainGeJu.geJu;
        result.mainGeJuDetail = mainGeJu.detail;
        result.mainGeJuStrength = mainGeJu.strength;
        result.assistGeJuList = assistGeJuList;
        result.yongShen = yongShen;
        result.yongShenDetail = yongShenDetail;
        result.factors = factors;
        return result;
    }
    /**
     * 判断可能的格局列表
     * @param baziInfo 八字信息
     * @returns 可能的格局列表
     */
    static judgePossibleGeJu(baziInfo) {
        const possibleGeJuList = [];
        // 获取基本信息
        const dayStem = baziInfo.dayStem || '';
        const dayBranch = baziInfo.dayBranch || '';
        const dayWuXing = baziInfo.dayWuXing || '';
        const riZhuStrength = baziInfo.riZhuStrength || '平衡';
        const monthBranch = baziInfo.monthBranch || '';
        // 获取十神信息
        const yearShiShenGan = baziInfo.yearShiShenGan || '';
        const monthShiShenGan = baziInfo.monthShiShenGan || '';
        const timeShiShenGan = baziInfo.timeShiShenGan || '';
        // 获取地支藏干十神信息
        const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
        const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
        const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
        const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);
        // 1. 判断特殊格局
        // 1.1 财官双美格
        if (this.hasShiShen(['正财', '偏财'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]) &&
            this.hasShiShen(['正官', '七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            // 计算财星和官星的强度
            const caiStrength = this.calculateShiShenStrength(['正财', '偏财'], baziInfo);
            const guanStrength = this.calculateShiShenStrength(['正官', '七杀'], baziInfo);
            // 财官双美格需要财星和官星都较强
            if (caiStrength >= 2 && guanStrength >= 2) {
                const strength = Math.min(85, 60 + (caiStrength + guanStrength) * 5);
                const priority = this.getGeJuPriority('财官双美格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '财官双美格',
                    detail: '八字中财星和官星都旺盛有力，且日主适中，能够承受财官之力，为财官双美格。',
                    strength,
                    priority
                });
            }
        }
        // 1.2 伤官佩印格
        if (this.hasShiShen(['伤官'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]) &&
            this.hasShiShen(['正印', '偏印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            // 计算伤官和印星的强度
            const shangGuanStrength = this.calculateShiShenStrength(['伤官'], baziInfo);
            const yinStrength = this.calculateShiShenStrength(['正印', '偏印'], baziInfo);
            // 伤官佩印格需要伤官和印星都较强
            if (shangGuanStrength >= 2 && yinStrength >= 2) {
                const strength = Math.min(85, 60 + (shangGuanStrength + yinStrength) * 5);
                const priority = this.getGeJuPriority('伤官佩印格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '伤官佩印格',
                    detail: '八字中同时有伤官和印星，且两者力量均衡，相互制约，为伤官佩印格。',
                    strength,
                    priority
                });
            }
        }
        // 1.3 日元建禄格
        if (this.isDayElementBuildLu(dayStem, monthBranch)) {
            const strength = 80;
            const priority = this.getGeJuPriority('日元建禄格', riZhuStrength, monthBranch);
            possibleGeJuList.push({
                geJu: '日元建禄格',
                detail: '日主天干与所处月令地支构成建禄关系，为日元建禄格。',
                strength,
                priority
            });
        }
        // 1.4 日元建元格
        if (this.isDayElementBuildYuan(dayStem, monthBranch)) {
            const strength = 75;
            const priority = this.getGeJuPriority('日元建元格', riZhuStrength, monthBranch);
            possibleGeJuList.push({
                geJu: '日元建元格',
                detail: '日主天干与所处月令地支构成建元关系，为日元建元格。',
                strength,
                priority
            });
        }
        // 1.5 从旺格
        if (riZhuStrength === '极旺' || riZhuStrength === '旺') {
            const biJianCount = this.countShiShen(['比肩', '劫财'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]);
            if (biJianCount >= 3) {
                const strength = Math.min(90, 70 + biJianCount * 5);
                const priority = this.getGeJuPriority('从旺格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '从旺格',
                    detail: '日主极旺，且有多个比劫帮扶，为从旺格。',
                    strength,
                    priority
                });
            }
        }
        // 1.6 从弱格
        if (riZhuStrength === '极弱' || riZhuStrength === '弱') {
            const guanShaCount = this.countShiShen(['正官', '七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi]);
            if (guanShaCount >= 3) {
                const strength = Math.min(90, 70 + guanShaCount * 5);
                const priority = this.getGeJuPriority('从弱格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '从弱格',
                    detail: '日主极弱，且有多个官杀克制，为从弱格。',
                    strength,
                    priority
                });
            }
        }
        // 2. 判断基本格局
        // 2.1 正印格
        if (this.hasShiShen(['正印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            const yinStrength = this.calculateShiShenStrength(['正印'], baziInfo);
            if (yinStrength >= 2) {
                let strength = 0;
                // 根据日主旺衰调整强度
                if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
                    strength = Math.min(80, 60 + yinStrength * 5);
                }
                else {
                    strength = Math.min(60, 40 + yinStrength * 5);
                }
                const priority = this.getGeJuPriority('正印格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '正印格',
                    detail: '八字中正印星当令或有力，且日主偏弱，取正印为用神，为正印格。',
                    strength,
                    priority
                });
            }
        }
        // 2.2 偏印格
        if (this.hasShiShen(['偏印'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            const yinStrength = this.calculateShiShenStrength(['偏印'], baziInfo);
            if (yinStrength >= 2) {
                let strength = 0;
                // 根据日主旺衰调整强度
                if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
                    strength = Math.min(80, 60 + yinStrength * 5);
                }
                else {
                    strength = Math.min(60, 40 + yinStrength * 5);
                }
                const priority = this.getGeJuPriority('偏印格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '偏印格',
                    detail: '八字中偏印星当令或有力，且日主偏弱，取偏印为用神，为偏印格。',
                    strength,
                    priority
                });
            }
        }
        // 2.3 正官格
        if (this.hasShiShen(['正官'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            const guanStrength = this.calculateShiShenStrength(['正官'], baziInfo);
            if (guanStrength >= 2) {
                let strength = 0;
                // 根据日主旺衰调整强度
                if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
                    strength = Math.min(80, 60 + guanStrength * 5);
                }
                else {
                    strength = Math.min(60, 40 + guanStrength * 5);
                }
                const priority = this.getGeJuPriority('正官格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '正官格',
                    detail: '八字中正官星当令或有力，且日主旺盛，取正官为用神，为正官格。',
                    strength,
                    priority
                });
            }
        }
        // 2.4 七杀格
        if (this.hasShiShen(['七杀'], [yearShiShenGan, monthShiShenGan, timeShiShenGan, ...yearShiShenZhi, ...monthShiShenZhi, ...hourShiShenZhi])) {
            const shaStrength = this.calculateShiShenStrength(['七杀'], baziInfo);
            if (shaStrength >= 2) {
                let strength = 0;
                // 根据日主旺衰调整强度
                if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
                    strength = Math.min(80, 60 + shaStrength * 5);
                }
                else {
                    strength = Math.min(60, 40 + shaStrength * 5);
                }
                const priority = this.getGeJuPriority('七杀格', riZhuStrength, monthBranch);
                possibleGeJuList.push({
                    geJu: '七杀格',
                    detail: '八字中七杀星当令或有力，且日主旺盛，取七杀为用神，为七杀格。',
                    strength,
                    priority
                });
            }
        }
        // 如果没有找到任何格局，添加杂气格
        if (possibleGeJuList.length === 0) {
            const priority = this.getGeJuPriority('杂气格', riZhuStrength, monthBranch);
            possibleGeJuList.push({
                geJu: '杂气格',
                detail: '八字中无明显格局特征，为杂气格。',
                strength: 60,
                priority
            });
        }
        return possibleGeJuList;
    }
    /**
     * 标准化十神地支信息
     * @param shiShenZhi 十神地支信息
     * @returns 标准化后的十神地支数组
     */
    static normalizeShiShenZhi(shiShenZhi) {
        if (!shiShenZhi) {
            return [];
        }
        if (typeof shiShenZhi === 'string') {
            return [shiShenZhi];
        }
        return shiShenZhi;
    }
    /**
     * 检查是否包含指定十神
     * @param targetShiShen 目标十神数组
     * @param shiShenList 十神列表
     * @returns 是否包含
     */
    static hasShiShen(targetShiShen, shiShenList) {
        return shiShenList.some(shiShen => targetShiShen.includes(shiShen));
    }
    /**
     * 计算指定十神的数量
     * @param targetShiShen 目标十神数组
     * @param shiShenList 十神列表
     * @returns 数量
     */
    static countShiShen(targetShiShen, shiShenList) {
        return shiShenList.filter(shiShen => targetShiShen.includes(shiShen)).length;
    }
    /**
     * 计算指定十神的强度
     * @param targetShiShen 目标十神数组
     * @param baziInfo 八字信息
     * @returns 强度
     */
    static calculateShiShenStrength(targetShiShen, baziInfo) {
        let strength = 0;
        // 获取十神信息
        const yearShiShenGan = baziInfo.yearShiShenGan || '';
        const monthShiShenGan = baziInfo.monthShiShenGan || '';
        const timeShiShenGan = baziInfo.timeShiShenGan || '';
        // 获取地支藏干十神信息
        const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
        const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
        const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
        const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);
        // 天干十神
        if (targetShiShen.includes(yearShiShenGan))
            strength += 1;
        if (targetShiShen.includes(monthShiShenGan))
            strength += 2; // 月令加倍
        if (targetShiShen.includes(timeShiShenGan))
            strength += 1;
        // 地支藏干十神
        yearShiShenZhi.forEach(shiShen => {
            if (targetShiShen.includes(shiShen))
                strength += 0.5;
        });
        monthShiShenZhi.forEach(shiShen => {
            if (targetShiShen.includes(shiShen))
                strength += 1; // 月令加倍
        });
        dayShiShenZhi.forEach(shiShen => {
            if (targetShiShen.includes(shiShen))
                strength += 0.5;
        });
        hourShiShenZhi.forEach(shiShen => {
            if (targetShiShen.includes(shiShen))
                strength += 0.5;
        });
        return strength;
    }
    /**
     * 判断日元是否建禄
     * @param dayStem 日干
     * @param monthBranch 月支
     * @returns 是否建禄
     */
    static isDayElementBuildLu(dayStem, monthBranch) {
        const buildLuMap = {
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
        return buildLuMap[dayStem] === monthBranch;
    }
    /**
     * 判断日元是否建元
     * @param dayStem 日干
     * @param monthBranch 月支
     * @returns 是否建元
     */
    static isDayElementBuildYuan(dayStem, monthBranch) {
        const buildYuanMap = {
            '甲': '子',
            '乙': '丑',
            '丙': '寅',
            '丁': '卯',
            '戊': '辰',
            '己': '巳',
            '庚': '午',
            '辛': '未',
            '壬': '申',
            '癸': '酉'
        };
        return buildYuanMap[dayStem] === monthBranch;
    }
    /**
     * 获取格局优先级
     * @param geJu 格局名称
     * @param riZhuStrength 日主旺衰
     * @param monthBranch 月支
     * @returns 优先级
     */
    static getGeJuPriority(geJu, riZhuStrength, monthBranch) {
        // 查找格局配置
        const config = this.geJuPriorityConfig.find(item => item.geJu === geJu);
        if (!config) {
            return 1; // 默认最低优先级
        }
        let priority = config.basePriority;
        // 检查日主旺衰条件
        if (config.riZhuCondition && config.riZhuCondition.states.includes(riZhuStrength)) {
            priority += config.riZhuCondition.priorityBonus;
        }
        // 检查月令条件
        if (config.monthCondition && config.monthCondition.branches.includes(monthBranch)) {
            priority += config.monthCondition.priorityBonus;
        }
        return priority;
    }
    /**
     * 确定主格局和辅助格局
     * @param possibleGeJuList 可能的格局列表
     * @param baziInfo 八字信息
     * @returns 主格局和辅助格局
     */
    static determineMainGeJu(possibleGeJuList, baziInfo) {
        // 如果没有可能的格局，返回杂气格
        if (possibleGeJuList.length === 0) {
            return {
                mainGeJu: {
                    geJu: '杂气格',
                    detail: '八字中无明显格局特征，为杂气格。',
                    strength: 60
                },
                assistGeJuList: []
            };
        }
        // 按优先级和强度排序
        const sortedGeJuList = [...possibleGeJuList].sort((a, b) => {
            // 首先按优先级排序
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            // 其次按强度排序
            return b.strength - a.strength;
        });
        // 主格局是排序后的第一个
        const mainGeJu = {
            geJu: sortedGeJuList[0].geJu,
            detail: sortedGeJuList[0].detail,
            strength: sortedGeJuList[0].strength
        };
        // 辅助格局是排序后的其余格局
        const assistGeJuList = sortedGeJuList.slice(1).map(geJu => ({
            geJu: geJu.geJu,
            detail: geJu.detail,
            strength: geJu.strength
        }));
        return {
            mainGeJu,
            assistGeJuList
        };
    }
    /**
     * 确定用神
     * @param mainGeJu 主格局
     * @param baziInfo 八字信息
     * @returns 用神和用神详情
     */
    static determineYongShen(mainGeJu, baziInfo) {
        // 获取日主旺衰
        const riZhuStrength = baziInfo.riZhuStrength || '平衡';
        // 根据格局名称和日主旺衰确定用神
        switch (mainGeJu.geJu) {
            case '正印格':
            case '偏印格':
            case '印绶格':
                return {
                    yongShen: '印星',
                    yongShenDetail: '八字中印星当令或有力，且日主偏弱，取印星为用神，印星生助日主，增强日主力量。'
                };
            case '正官格':
            case '七杀格':
                return {
                    yongShen: '官杀',
                    yongShenDetail: '八字中官杀当令或有力，且日主旺盛，取官杀为用神，官杀克制日主，泄秀日主之气。'
                };
            case '正财格':
            case '偏财格':
                return {
                    yongShen: '财星',
                    yongShenDetail: '八字中财星当令或有力，且日主旺盛，取财星为用神，财星为日主所生，泄秀日主之气。'
                };
            case '食神格':
            case '伤官格':
                return {
                    yongShen: '食伤',
                    yongShenDetail: '八字中食伤当令或有力，且日主旺盛，取食伤为用神，食伤为日主所生，泄秀日主之气。'
                };
            case '比肩格':
            case '劫财格':
                return {
                    yongShen: '比劫',
                    yongShenDetail: '八字中比劫当令或有力，且日主偏弱，取比劫为用神，比劫与日主同气相助，增强日主力量。'
                };
            case '财官双美格':
                return {
                    yongShen: '财官',
                    yongShenDetail: '八字中财星和官星都旺盛有力，且日主适中，能够承受财官之力，取财官为用神，财官相生相助，形成良好格局。'
                };
            case '伤官佩印格':
                return {
                    yongShen: '伤官印',
                    yongShenDetail: '八字中同时有伤官和印星，且两者力量均衡，相互制约，取伤官印为用神，伤官代表才华创新，印星代表学问文凭，两者相互制约，形成良好平衡。'
                };
            case '从旺格':
                return {
                    yongShen: '比劫',
                    yongShenDetail: '日主极旺，且有多个比劫帮扶，顺从日主之旺，取比劫为用神，比劫与日主同气相助，增强日主力量。'
                };
            case '从弱格':
                return {
                    yongShen: '官杀',
                    yongShenDetail: '日主极弱，且有多个官杀克制，顺从日主之弱，取官杀为用神，官杀克制日主，使日主更加衰弱。'
                };
            case '日元建禄格':
            case '日元建元格':
                return {
                    yongShen: '日元',
                    yongShenDetail: '日主与月令地支构成特殊关系，日主得令，根基稳固，取日元为用神，充分发挥日主的优势。'
                };
            case '杂气格':
                // 根据日主旺衰确定用神
                if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
                    return {
                        yongShen: '财官食伤',
                        yongShenDetail: '八字中无明显格局特征，日主偏旺，取财官食伤为用神，泄秀日主之气，使八字趋于平衡。'
                    };
                }
                else if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
                    return {
                        yongShen: '印比劫',
                        yongShenDetail: '八字中无明显格局特征，日主偏弱，取印比劫为用神，生助日主之气，使八字趋于平衡。'
                    };
                }
                else {
                    return {
                        yongShen: '月令当令',
                        yongShenDetail: '八字中无明显格局特征，日主平衡，取月令当令五行为用神，顺应自然之势。'
                    };
                }
            default:
                return {
                    yongShen: '',
                    yongShenDetail: '无法确定用神，请咨询专业命理师。'
                };
        }
    }
    /**
     * 收集格局形成的关键因素
     * @param mainGeJu 主格局
     * @param baziInfo 八字信息
     * @returns 格局形成的关键因素
     */
    static collectGeJuFactors(mainGeJu, baziInfo) {
        const factors = [];
        // 获取基本信息
        const dayStem = baziInfo.dayStem || '';
        const dayBranch = baziInfo.dayBranch || '';
        const dayWuXing = baziInfo.dayWuXing || '';
        const riZhuStrength = baziInfo.riZhuStrength || '平衡';
        const monthBranch = baziInfo.monthBranch || '';
        // 1. 日主旺衰是重要因素
        factors.push({
            factor: '日主旺衰',
            description: `日主${riZhuStrength}，${this.getRiZhuDescription(riZhuStrength)}`,
            contribution: 25
        });
        // 2. 月令当令是重要因素
        factors.push({
            factor: '月令',
            description: `月支为${monthBranch}，${this.getMonthDescription(monthBranch, dayWuXing)}`,
            contribution: 20
        });
        // 3. 根据格局类型添加特定因素
        switch (mainGeJu.geJu) {
            case '正印格':
            case '偏印格':
            case '印绶格':
                // 添加印星因素
                this.addShiShenFactors(['正印', '偏印'], baziInfo, factors);
                break;
            case '正官格':
            case '七杀格':
                // 添加官杀因素
                this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
                break;
            case '正财格':
            case '偏财格':
                // 添加财星因素
                this.addShiShenFactors(['正财', '偏财'], baziInfo, factors);
                break;
            case '食神格':
            case '伤官格':
                // 添加食伤因素
                this.addShiShenFactors(['食神', '伤官'], baziInfo, factors);
                break;
            case '比肩格':
            case '劫财格':
                // 添加比劫因素
                this.addShiShenFactors(['比肩', '劫财'], baziInfo, factors);
                break;
            case '财官双美格':
                // 添加财星和官星因素
                this.addShiShenFactors(['正财', '偏财'], baziInfo, factors);
                this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
                break;
            case '伤官佩印格':
                // 添加伤官和印星因素
                this.addShiShenFactors(['伤官'], baziInfo, factors);
                this.addShiShenFactors(['正印', '偏印'], baziInfo, factors);
                break;
            case '从旺格':
                // 添加比劫因素
                this.addShiShenFactors(['比肩', '劫财'], baziInfo, factors);
                break;
            case '从弱格':
                // 添加官杀因素
                this.addShiShenFactors(['正官', '七杀'], baziInfo, factors);
                break;
            case '日元建禄格':
                // 添加建禄因素
                factors.push({
                    factor: '建禄',
                    description: `日主${dayStem}在月支${monthBranch}建禄，日主根基稳固，得令有力。`,
                    contribution: 30
                });
                break;
            case '日元建元格':
                // 添加建元因素
                factors.push({
                    factor: '建元',
                    description: `日主${dayStem}在月支${monthBranch}建元，日主根基稳固，得令有力。`,
                    contribution: 30
                });
                break;
        }
        // 4. 添加纳音五行因素
        if (baziInfo.dayNaYin) {
            factors.push({
                factor: '纳音五行',
                description: `日柱纳音为${baziInfo.dayNaYin}，对格局形成有一定影响。`,
                contribution: 10
            });
        }
        // 5. 添加三合局因素
        const sanHeJu = this.checkSanHeJu(baziInfo);
        if (sanHeJu) {
            factors.push({
                factor: '三合局',
                description: sanHeJu,
                contribution: 15
            });
        }
        // 6. 添加三会局因素
        const sanHuiJu = this.checkSanHuiJu(baziInfo);
        if (sanHuiJu) {
            factors.push({
                factor: '三会局',
                description: sanHuiJu,
                contribution: 15
            });
        }
        return factors;
    }
    /**
     * 获取日主旺衰描述
     * @param riZhuStrength 日主旺衰
     * @returns 描述
     */
    static getRiZhuDescription(riZhuStrength) {
        switch (riZhuStrength) {
            case '极旺':
                return '日主力量极其旺盛，需要泄秀之物来平衡。';
            case '旺':
                return '日主力量旺盛，需要泄秀之物来平衡。';
            case '偏旺':
                return '日主力量较为旺盛，需要适当泄秀。';
            case '平衡':
                return '日主力量适中，八字较为平衡。';
            case '偏弱':
                return '日主力量较为衰弱，需要适当扶助。';
            case '弱':
                return '日主力量衰弱，需要扶助之物来增强。';
            case '极弱':
                return '日主力量极其衰弱，需要大量扶助之物来增强。';
            default:
                return '日主旺衰状态不明。';
        }
    }
    /**
     * 获取月令描述
     * @param monthBranch 月支
     * @param dayWuXing 日主五行
     * @returns 描述
     */
    static getMonthDescription(monthBranch, dayWuXing) {
        // 定义月支所属季节
        const seasonMap = {
            '寅': '春季',
            '卯': '春季',
            '辰': '春季',
            '巳': '夏季',
            '午': '夏季',
            '未': '夏季',
            '申': '秋季',
            '酉': '秋季',
            '戌': '秋季',
            '亥': '冬季',
            '子': '冬季',
            '丑': '冬季'
        };
        // 定义月支所属五行
        const branchWuXingMap = {
            '寅': '木',
            '卯': '木',
            '辰': '土',
            '巳': '火',
            '午': '火',
            '未': '土',
            '申': '金',
            '酉': '金',
            '戌': '土',
            '亥': '水',
            '子': '水',
            '丑': '土'
        };
        // 获取月支所属季节和五行
        const season = seasonMap[monthBranch] || '未知季节';
        const monthWuXing = branchWuXingMap[monthBranch] || '未知五行';
        // 判断月令对日主的影响
        let influence = '';
        if (this.isWuXingSheng(monthWuXing, dayWuXing)) {
            influence = `${monthWuXing}生${dayWuXing}，对日主有生助作用。`;
        }
        else if (this.isWuXingKe(monthWuXing, dayWuXing)) {
            influence = `${monthWuXing}克${dayWuXing}，对日主有克制作用。`;
        }
        else if (this.isWuXingSheng(dayWuXing, monthWuXing)) {
            influence = `${dayWuXing}生${monthWuXing}，日主泄气。`;
        }
        else if (this.isWuXingKe(dayWuXing, monthWuXing)) {
            influence = `${dayWuXing}克${monthWuXing}，日主耗气。`;
        }
        else if (monthWuXing === dayWuXing) {
            influence = `与日主同气，对日主有帮扶作用。`;
        }
        return `属于${season}，五行属${monthWuXing}，${influence}`;
    }
    /**
     * 添加十神因素
     * @param targetShiShen 目标十神数组
     * @param baziInfo 八字信息
     * @param factors 因素数组
     */
    static addShiShenFactors(targetShiShen, baziInfo, factors) {
        // 获取十神信息
        const yearShiShenGan = baziInfo.yearShiShenGan || '';
        const monthShiShenGan = baziInfo.monthShiShenGan || '';
        const timeShiShenGan = baziInfo.timeShiShenGan || '';
        // 获取地支藏干十神信息
        const yearShiShenZhi = this.normalizeShiShenZhi(baziInfo.yearShiShenZhi);
        const monthShiShenZhi = this.normalizeShiShenZhi(baziInfo.monthShiShenZhi);
        const dayShiShenZhi = this.normalizeShiShenZhi(baziInfo.dayShiShenZhi);
        const hourShiShenZhi = this.normalizeShiShenZhi(baziInfo.hourShiShenZhi);
        // 检查年干
        if (targetShiShen.includes(yearShiShenGan)) {
            factors.push({
                factor: `年干${yearShiShenGan}`,
                description: `年干为${yearShiShenGan}，对格局形成有贡献。`,
                contribution: 10
            });
        }
        // 检查月干
        if (targetShiShen.includes(monthShiShenGan)) {
            factors.push({
                factor: `月干${monthShiShenGan}`,
                description: `月干为${monthShiShenGan}，月令当令，对格局形成贡献较大。`,
                contribution: 20
            });
        }
        // 检查时干
        if (targetShiShen.includes(timeShiShenGan)) {
            factors.push({
                factor: `时干${timeShiShenGan}`,
                description: `时干为${timeShiShenGan}，对格局形成有贡献。`,
                contribution: 10
            });
        }
        // 检查地支藏干
        const zhiFactors = [
            { branch: '年支', shiShen: yearShiShenZhi.filter(s => targetShiShen.includes(s)) },
            { branch: '月支', shiShen: monthShiShenZhi.filter(s => targetShiShen.includes(s)) },
            { branch: '日支', shiShen: dayShiShenZhi.filter(s => targetShiShen.includes(s)) },
            { branch: '时支', shiShen: hourShiShenZhi.filter(s => targetShiShen.includes(s)) }
        ];
        zhiFactors.forEach(factor => {
            if (factor.shiShen.length > 0) {
                factors.push({
                    factor: `${factor.branch}藏干`,
                    description: `${factor.branch}藏干中有${factor.shiShen.join('、')}，对格局形成有辅助作用。`,
                    contribution: factor.branch === '月支' ? 15 : 8
                });
            }
        });
    }
    /**
     * 检查三合局
     * @param baziInfo 八字信息
     * @returns 三合局描述
     */
    static checkSanHeJu(baziInfo) {
        const branches = [
            baziInfo.yearBranch || '',
            baziInfo.monthBranch || '',
            baziInfo.dayBranch || '',
            baziInfo.hourBranch || ''
        ].filter(branch => branch !== '');
        // 定义三合局
        const sanHeJuList = [
            { name: '寅午戌三合火局', branches: ['寅', '午', '戌'], wuXing: '火' },
            { name: '申子辰三合水局', branches: ['申', '子', '辰'], wuXing: '水' },
            { name: '亥卯未三合木局', branches: ['亥', '卯', '未'], wuXing: '木' },
            { name: '巳酉丑三合金局', branches: ['巳', '酉', '丑'], wuXing: '金' }
        ];
        // 检查是否有三合局
        for (const sanHeJu of sanHeJuList) {
            const matchCount = sanHeJu.branches.filter(branch => branches.includes(branch)).length;
            if (matchCount >= 2) {
                return `八字中有${sanHeJu.branches.filter(branch => branches.includes(branch)).join('、')}，形成${matchCount === 3 ? '完整' : '部分'}${sanHeJu.name}，增强${sanHeJu.wuXing}的力量。`;
            }
        }
        return null;
    }
    /**
     * 检查三会局
     * @param baziInfo 八字信息
     * @returns 三会局描述
     */
    static checkSanHuiJu(baziInfo) {
        const branches = [
            baziInfo.yearBranch || '',
            baziInfo.monthBranch || '',
            baziInfo.dayBranch || '',
            baziInfo.hourBranch || ''
        ].filter(branch => branch !== '');
        // 定义三会局
        const sanHuiJuList = [
            { name: '寅卯辰三会木局', branches: ['寅', '卯', '辰'], wuXing: '木' },
            { name: '巳午未三会火局', branches: ['巳', '午', '未'], wuXing: '火' },
            { name: '申酉戌三会金局', branches: ['申', '酉', '戌'], wuXing: '金' },
            { name: '亥子丑三会水局', branches: ['亥', '子', '丑'], wuXing: '水' }
        ];
        // 检查是否有三会局
        for (const sanHuiJu of sanHuiJuList) {
            const matchCount = sanHuiJu.branches.filter(branch => branches.includes(branch)).length;
            if (matchCount >= 2) {
                return `八字中有${sanHuiJu.branches.filter(branch => branches.includes(branch)).join('、')}，形成${matchCount === 3 ? '完整' : '部分'}${sanHuiJu.name}，增强${sanHuiJu.wuXing}的力量。`;
            }
        }
        return null;
    }
    /**
     * 判断五行相生关系
     * @param wuXing1 五行1
     * @param wuXing2 五行2
     * @returns 是否相生
     */
    static isWuXingSheng(wuXing1, wuXing2) {
        const shengRelations = {
            '木': '火',
            '火': '土',
            '土': '金',
            '金': '水',
            '水': '木'
        };
        return shengRelations[wuXing1] === wuXing2;
    }
    /**
     * 判断五行相克关系
     * @param wuXing1 五行1
     * @param wuXing2 五行2
     * @returns 是否相克
     */
    static isWuXingKe(wuXing1, wuXing2) {
        const keRelations = {
            '木': '土',
            '土': '水',
            '水': '火',
            '火': '金',
            '金': '木'
        };
        return keRelations[wuXing1] === wuXing2;
    }
}
/**
 * 格局优先级配置
 * 用于在多个格局同时存在时确定主导格局
 */
GeJuJudgeService.geJuPriorityConfig = [
    {
        geJu: '财官双美格',
        basePriority: 10,
        riZhuCondition: {
            states: ['平衡', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '伤官佩印格',
        basePriority: 9,
        riZhuCondition: {
            states: ['平衡'],
            priorityBonus: 2
        }
    },
    {
        geJu: '日元建禄格',
        basePriority: 8,
        monthCondition: {
            branches: ['寅', '巳', '申', '亥'],
            priorityBonus: 2
        }
    },
    {
        geJu: '日元建元格',
        basePriority: 8,
        monthCondition: {
            branches: ['子', '卯', '午', '酉'],
            priorityBonus: 2
        }
    },
    {
        geJu: '从旺格',
        basePriority: 7,
        riZhuCondition: {
            states: ['极旺', '旺'],
            priorityBonus: 3
        }
    },
    {
        geJu: '从弱格',
        basePriority: 7,
        riZhuCondition: {
            states: ['极弱', '弱'],
            priorityBonus: 3
        }
    },
    {
        geJu: '七杀格',
        basePriority: 6,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '正官格',
        basePriority: 6,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '偏财格',
        basePriority: 5,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '正财格',
        basePriority: 5,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '食神格',
        basePriority: 5,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '伤官格',
        basePriority: 5,
        riZhuCondition: {
            states: ['旺', '极旺', '偏旺'],
            priorityBonus: 2
        }
    },
    {
        geJu: '正印格',
        basePriority: 4,
        riZhuCondition: {
            states: ['弱', '极弱', '偏弱'],
            priorityBonus: 2
        }
    },
    {
        geJu: '偏印格',
        basePriority: 4,
        riZhuCondition: {
            states: ['弱', '极弱', '偏弱'],
            priorityBonus: 2
        }
    },
    {
        geJu: '印绶格',
        basePriority: 4,
        riZhuCondition: {
            states: ['弱', '极弱', '偏弱'],
            priorityBonus: 2
        }
    },
    {
        geJu: '比肩格',
        basePriority: 3,
        riZhuCondition: {
            states: ['弱', '极弱', '偏弱'],
            priorityBonus: 2
        }
    },
    {
        geJu: '劫财格',
        basePriority: 3,
        riZhuCondition: {
            states: ['弱', '极弱', '偏弱'],
            priorityBonus: 2
        }
    },
    {
        geJu: '专旺格',
        basePriority: 3,
        riZhuCondition: {
            states: ['极旺'],
            priorityBonus: 3
        }
    },
    {
        geJu: '杂气格',
        basePriority: 1
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VKdUp1ZGdlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdlSnVKdWRnZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0RBLE1BQU0sT0FBTyxnQkFBZ0I7SUE0SjNCOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQWtCO1FBQ3hDLFFBQVE7UUFDUixNQUFNLE1BQU0sR0FBb0I7WUFDOUIsUUFBUSxFQUFFLEVBQUU7WUFDWixjQUFjLEVBQUUsRUFBRTtZQUNsQixnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLFFBQVEsRUFBRSxFQUFFO1lBQ1osY0FBYyxFQUFFLEVBQUU7WUFDbEIsT0FBTyxFQUFFLEVBQUU7U0FDWixDQUFDO1FBRUYsYUFBYTtRQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUU7WUFDdkUsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7WUFDekIsTUFBTSxDQUFDLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztZQUM1QyxPQUFPLE1BQU0sQ0FBQztTQUNmO1FBRUQsbUJBQW1CO1FBQ25CLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTFELHdCQUF3QjtRQUN4QixNQUFNLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV4RixVQUFVO1FBQ1YsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWhGLGlCQUFpQjtRQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFB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Q2QsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDekIsYUFBYSxFQUFFLENBQUM7U0FDakI7S0FDRjtJQUNEO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxZQUFZLEVBQUUsQ0FBQztRQUNmLGNBQWMsRUFBRTtZQUNkLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQ3pCLGFBQWEsRUFBRSxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRDtRQUNFLElBQUksRUFBRSxLQUFLO1FBQ1gsWUFBWSxFQUFFLENBQUM7UUFDZixjQUFjLEVBQUU7WUFDZCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUN6QixhQUFhLEVBQUUsQ0FBQztTQUNqQjtLQUNGO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsS0FBSztRQUNYLFlBQVksRUFBRSxDQUFDO1FBQ2YsY0FBYyxFQUFFO1lBQ2QsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2QsYUFBYSxFQUFFLENBQUM7U0FDakI7S0FDRjtJQUNEO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxZQUFZLEVBQUUsQ0FBQztLQUNoQjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOagvOWxgOWIpOaWreacjeWKoeexu1xuICog5o+Q5L6b5pu05aSN5p2C55qE5qC85bGA5Yik5pat6YC76L6R77yM5YyF5ous57uE5ZCI5qC85bGA5Yik5pat44CB5qC85bGA5LyY5YWI57qn5Yik5pat562JXG4gKi9cbmltcG9ydCB7IEJhemlJbmZvIH0gZnJvbSAnLi4vdHlwZXMvQmF6aUluZm8nO1xuXG4vKipcbiAqIOagvOWxgOWIpOaWree7k+aenOaOpeWPo1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEdlSnVKdWRnZVJlc3VsdCB7XG4gIC8vIOS4u+agvOWxgFxuICBtYWluR2VKdTogc3RyaW5nO1xuICAvLyDkuLvmoLzlsYDor6bmg4VcbiAgbWFpbkdlSnVEZXRhaWw6IHN0cmluZztcbiAgLy8g5Li75qC85bGA5by65bqm77yIMC0xMDDvvIlcbiAgbWFpbkdlSnVTdHJlbmd0aDogbnVtYmVyO1xuICAvLyDovoXliqnmoLzlsYDliJfooahcbiAgYXNzaXN0R2VKdUxpc3Q6IHtcbiAgICBnZUp1OiBzdHJpbmc7XG4gICAgZGV0YWlsOiBzdHJpbmc7XG4gICAgc3RyZW5ndGg6IG51bWJlcjtcbiAgfVtdO1xuICAvLyDnlKjnpZ5cbiAgeW9uZ1NoZW46IHN0cmluZztcbiAgLy8g55So56We6K+m5oOFXG4gIHlvbmdTaGVuRGV0YWlsOiBzdHJpbmc7XG4gIC8vIOagvOWxgOW9ouaIkOWboOe0oFxuICBmYWN0b3JzOiB7XG4gICAgZmFjdG9yOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBjb250cmlidXRpb246IG51bWJlcjtcbiAgfVtdO1xufVxuXG4vKipcbiAqIOagvOWxgOS8mOWFiOe6p+mFjee9rlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdlSnVQcmlvcml0eUNvbmZpZyB7XG4gIC8vIOagvOWxgOWQjeensFxuICBnZUp1OiBzdHJpbmc7XG4gIC8vIOWfuuehgOS8mOWFiOe6p++8iDEtMTDvvIzmlbDlrZfotorlpKfkvJjlhYjnuqfotorpq5jvvIlcbiAgYmFzZVByaW9yaXR5OiBudW1iZXI7XG4gIC8vIOaXpeS4u+aXuuihsOadoeS7tu+8iOWmguaenOespuWQiOWImeWinuWKoOS8mOWFiOe6p++8iVxuICByaVpodUNvbmRpdGlvbj86IHtcbiAgICBzdGF0ZXM6IHN0cmluZ1tdO1xuICAgIHByaW9yaXR5Qm9udXM6IG51bWJlcjtcbiAgfTtcbiAgLy8g5pyI5Luk5p2h5Lu277yI5aaC5p6c56ym5ZCI5YiZ5aKe5Yqg5LyY5YWI57qn77yJXG4gIG1vbnRoQ29uZGl0aW9uPzoge1xuICAgIGJyYW5jaGVzOiBzdHJpbmdbXTtcbiAgICBwcmlvcml0eUJvbnVzOiBudW1iZXI7XG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBHZUp1SnVkZ2VTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIOagvOWxgOS8mOWFiOe6p+mFjee9rlxuICAgKiDnlKjkuo7lnKjlpJrkuKrmoLzlsYDlkIzml7blrZjlnKjml7bnoa7lrprkuLvlr7zmoLzlsYBcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdlSnVQcmlvcml0eUNvbmZpZzogR2VKdVByaW9yaXR5Q29uZmlnW10gPSBbXG4gICAge1xuICAgICAgZ2VKdTogJ+i0ouWumOWPjOe+juagvCcsXG4gICAgICBiYXNlUHJpb3JpdHk6IDEwLFxuICAgICAgcmlaaHVDb25kaXRpb246IHtcbiAgICAgICAgc3RhdGVzOiBbJ+W5s+ihoScsICflgY/ml7onXSxcbiAgICAgICAgcHJpb3JpdHlCb251czogMlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgZ2VKdTogJ+S8pOWumOS9qeWNsOagvCcsXG4gICAgICBiYXNlUHJpb3JpdHk6IDksXG4gICAgICByaVpodUNvbmRpdGlvbjoge1xuICAgICAgICBzdGF0ZXM6IFsn5bmz6KGhJ10sXG4gICAgICAgIHByaW9yaXR5Qm9udXM6IDJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIGdlSnU6ICfml6XlhYPlu7rnpoTmoLwnLFxuICAgICAgYmFzZVByaW9yaXR5OiA4LFxuICAgICAgbW9udGhDb25kaXRpb246IHtcbiAgICAgICAgYnJhbmNoZXM6IFsn5a+FJywgJ+W3sycsICfnlLMnLCAn5LqlJ10sXG4gICAgICAgIHByaW9yaXR5Qm9udXM6IDJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIGdlSnU6ICfml6XlhYPlu7rlhYPmoLwnLFxuICAgICAgYmFzZVByaW9yaXR5OiA4LFxuICAgICAgbW9udGhDb25kaXRpb246IHtcbiAgICAgICAgYnJhbmNoZXM6IFsn5a2QJywgJ+WNrycsICfljYgnLCAn6YWJJ10sXG4gICAgICAgIHByaW9yaXR5Qm9udXM6IDJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIGdlSnU6ICfku47ml7rmoLwnLFxuICAgICAgYmFzZVByaW9yaXR5OiA3LFxuICAgICAgcmlaaHVDb25kaXRpb246IHtcbiAgICAgICAgc3RhdGVzOiBbJ+aegeaXuicsICfml7onXSxcbiAgICAgICAgcHJpb3JpdHlCb251czogM1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgZ2VKdTogJ+S7juW8seagvCcsXG4gICAgICBiYXNlUHJpb3JpdHk6IDcsXG4gICAgICByaVpodUNvbmRpdGlvbjoge1xuICAgICAgICBzdGF0ZXM6IFsn5p6B5byxJywgJ+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAzXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5LiD5p2A5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNixcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5q2j5a6Y5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNixcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5YGP6LSi5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNSxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5q2j6LSi5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNSxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn6aOf56We5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNSxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5Lyk5a6Y5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNSxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfml7onLCAn5p6B5pe6JywgJ+WBj+aXuiddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5q2j5Y2w5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNCxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyflvLEnLCAn5p6B5byxJywgJ+WBj+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5YGP5Y2w5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNCxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyflvLEnLCAn5p6B5byxJywgJ+WBj+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5Y2w57u25qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogNCxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyflvLEnLCAn5p6B5byxJywgJ+WBj+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5q+U6IKp5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogMyxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyflvLEnLCAn5p6B5byxJywgJ+WBj+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5Yqr6LSi5qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogMyxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyflvLEnLCAn5p6B5byxJywgJ+WBj+W8sSddLFxuICAgICAgICBwcmlvcml0eUJvbnVzOiAyXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBnZUp1OiAn5LiT5pe65qC8JyxcbiAgICAgIGJhc2VQcmlvcml0eTogMyxcbiAgICAgIHJpWmh1Q29uZGl0aW9uOiB7XG4gICAgICAgIHN0YXRlczogWyfmnoHml7onXSxcbiAgICAgICAgcHJpb3JpdHlCb251czogM1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgZ2VKdTogJ+adguawlOagvCcsXG4gICAgICBiYXNlUHJpb3JpdHk6IDFcbiAgICB9XG4gIF07XG5cbiAgLyoqXG4gICAqIOWIpOaWreWFq+Wtl+agvOWxgFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEByZXR1cm5zIOagvOWxgOWIpOaWree7k+aenFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqdWRnZUdlSnUoYmF6aUluZm86IEJhemlJbmZvKTogR2VKdUp1ZGdlUmVzdWx0IHtcbiAgICAvLyDliJ3lp4vljJbnu5PmnpxcbiAgICBjb25zdCByZXN1bHQ6IEdlSnVKdWRnZVJlc3VsdCA9IHtcbiAgICAgIG1haW5HZUp1OiAnJyxcbiAgICAgIG1haW5HZUp1RGV0YWlsOiAnJyxcbiAgICAgIG1haW5HZUp1U3RyZW5ndGg6IDAsXG4gICAgICBhc3Npc3RHZUp1TGlzdDogW10sXG4gICAgICB5b25nU2hlbjogJycsXG4gICAgICB5b25nU2hlbkRldGFpbDogJycsXG4gICAgICBmYWN0b3JzOiBbXVxuICAgIH07XG5cbiAgICAvLyDmo4Dmn6Xlv4XopoHkv6Hmga/mmK/lkKblrZjlnKhcbiAgICBpZiAoIWJhemlJbmZvLmRheVN0ZW0gfHwgIWJhemlJbmZvLmRheVd1WGluZyB8fCAhYmF6aUluZm8ucmlaaHVTdHJlbmd0aCkge1xuICAgICAgcmVzdWx0Lm1haW5HZUp1ID0gJ+S/oeaBr+S4jei2syc7XG4gICAgICByZXN1bHQubWFpbkdlSnVEZXRhaWwgPSAn5peg5rOV5Yik5pat5qC85bGA77yM57y65bCR5b+F6KaB55qE5YWr5a2X5L+h5oGv44CCJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gMS4g5Yik5pat5ZCE56eN5Y+v6IO955qE5qC85bGA5Y+K5YW25by65bqmXG4gICAgY29uc3QgcG9zc2libGVHZUp1TGlzdCA9IHRoaXMuanVkZ2VQb3NzaWJsZUdlSnUoYmF6aUluZm8pO1xuXG4gICAgLy8gMi4g5qC55o2u5LyY5YWI57qn5ZKM5by65bqm56Gu5a6a5Li75qC85bGA5ZKM6L6F5Yqp5qC85bGAXG4gICAgY29uc3QgeyBtYWluR2VKdSwgYXNzaXN0R2VKdUxpc3QgfSA9IHRoaXMuZGV0ZXJtaW5lTWFpbkdlSnUocG9zc2libGVHZUp1TGlzdCwgYmF6aUluZm8pO1xuXG4gICAgLy8gMy4g56Gu5a6a55So56WeXG4gICAgY29uc3QgeyB5b25nU2hlbiwgeW9uZ1NoZW5EZXRhaWwgfSA9IHRoaXMuZGV0ZXJtaW5lWW9uZ1NoZW4obWFpbkdlSnUsIGJhemlJbmZvKTtcblxuICAgIC8vIDQuIOaUtumbhuagvOWxgOW9ouaIkOeahOWFs+mUruWboOe0oFxuICAgIGNvbnN0IGZhY3RvcnMgPSB0aGlzLmNvbGxlY3RHZUp1RmFjdG9ycyhtYWluR2VKdSwgYmF6aUluZm8pO1xuXG4gICAgLy8g6K6+572u57uT5p6cXG4gICAgcmVzdWx0Lm1haW5HZUp1ID0gbWFpbkdlSnUuZ2VKdTtcbiAgICByZXN1bHQubWFpbkdlSnVEZXRhaWwgPSBtYWluR2VKdS5kZXRhaWw7XG4gICAgcmVzdWx0Lm1haW5HZUp1U3RyZW5ndGggPSBtYWluR2VKdS5zdHJlbmd0aDtcbiAgICByZXN1bHQuYXNzaXN0R2VKdUxpc3QgPSBhc3Npc3RHZUp1TGlzdDtcbiAgICByZXN1bHQueW9uZ1NoZW4gPSB5b25nU2hlbjtcbiAgICByZXN1bHQueW9uZ1NoZW5EZXRhaWwgPSB5b25nU2hlbkRldGFpbDtcbiAgICByZXN1bHQuZmFjdG9ycyA9IGZhY3RvcnM7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreWPr+iDveeahOagvOWxgOWIl+ihqFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEByZXR1cm5zIOWPr+iDveeahOagvOWxgOWIl+ihqFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMganVkZ2VQb3NzaWJsZUdlSnUoYmF6aUluZm86IEJhemlJbmZvKToge1xuICAgIGdlSnU6IHN0cmluZztcbiAgICBkZXRhaWw6IHN0cmluZztcbiAgICBzdHJlbmd0aDogbnVtYmVyO1xuICAgIHByaW9yaXR5OiBudW1iZXI7XG4gIH1bXSB7XG4gICAgY29uc3QgcG9zc2libGVHZUp1TGlzdDoge1xuICAgICAgZ2VKdTogc3RyaW5nO1xuICAgICAgZGV0YWlsOiBzdHJpbmc7XG4gICAgICBzdHJlbmd0aDogbnVtYmVyO1xuICAgICAgcHJpb3JpdHk6IG51bWJlcjtcbiAgICB9W10gPSBbXTtcblxuICAgIC8vIOiOt+WPluWfuuacrOS/oeaBr1xuICAgIGNvbnN0IGRheVN0ZW0gPSBiYXppSW5mby5kYXlTdGVtIHx8ICcnO1xuICAgIGNvbnN0IGRheUJyYW5jaCA9IGJhemlJbmZvLmRheUJyYW5jaCB8fCAnJztcbiAgICBjb25zdCBkYXlXdVhpbmcgPSBiYXppSW5mby5kYXlXdVhpbmcgfHwgJyc7XG4gICAgY29uc3QgcmlaaHVTdHJlbmd0aCA9IGJhemlJbmZvLnJpWmh1U3RyZW5ndGggfHwgJ+W5s+ihoSc7XG4gICAgY29uc3QgbW9udGhCcmFuY2ggPSBiYXppSW5mby5tb250aEJyYW5jaCB8fCAnJztcblxuICAgIC8vIOiOt+WPluWNgeelnuS/oeaBr1xuICAgIGNvbnN0IHllYXJTaGlTaGVuR2FuID0gYmF6aUluZm8ueWVhclNoaVNoZW5HYW4gfHwgJyc7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuR2FuID0gYmF6aUluZm8ubW9udGhTaGlTaGVuR2FuIHx8ICcnO1xuICAgIGNvbnN0IHRpbWVTaGlTaGVuR2FuID0gYmF6aUluZm8udGltZVNoaVNoZW5HYW4gfHwgJyc7XG5cbiAgICAvLyDojrflj5blnLDmlK/ol4/lubLljYHnpZ7kv6Hmga9cbiAgICBjb25zdCB5ZWFyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby55ZWFyU2hpU2hlblpoaSk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gdGhpcy5ub3JtYWxpemVTaGlTaGVuWmhpKGJhemlJbmZvLm1vbnRoU2hpU2hlblpoaSk7XG4gICAgY29uc3QgZGF5U2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5kYXlTaGlTaGVuWmhpKTtcbiAgICBjb25zdCBob3VyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5ob3VyU2hpU2hlblpoaSk7XG5cbiAgICAvLyAxLiDliKTmlq3nibnmrormoLzlsYBcblxuICAgIC8vIDEuMSDotKLlrpjlj4znvo7moLxcbiAgICBpZiAodGhpcy5oYXNTaGlTaGVuKFsn5q2j6LSiJywgJ+WBj+i0oiddLCBbeWVhclNoaVNoZW5HYW4sIG1vbnRoU2hpU2hlbkdhbiwgdGltZVNoaVNoZW5HYW4sIC4uLnllYXJTaGlTaGVuWmhpLCAuLi5tb250aFNoaVNoZW5aaGksIC4uLmhvdXJTaGlTaGVuWmhpXSkgJiZcbiAgICAgICAgdGhpcy5oYXNTaGlTaGVuKFsn5q2j5a6YJywgJ+S4g+adgCddLCBbeWVhclNoaVNoZW5HYW4sIG1vbnRoU2hpU2hlbkdhbiwgdGltZVNoaVNoZW5HYW4sIC4uLnllYXJTaGlTaGVuWmhpLCAuLi5tb250aFNoaVNoZW5aaGksIC4uLmhvdXJTaGlTaGVuWmhpXSkpIHtcblxuICAgICAgLy8g6K6h566X6LSi5pif5ZKM5a6Y5pif55qE5by65bqmXG4gICAgICBjb25zdCBjYWlTdHJlbmd0aCA9IHRoaXMuY2FsY3VsYXRlU2hpU2hlblN0cmVuZ3RoKFsn5q2j6LSiJywgJ+WBj+i0oiddLCBiYXppSW5mbyk7XG4gICAgICBjb25zdCBndWFuU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVNoaVNoZW5TdHJlbmd0aChbJ+ato+WumCcsICfkuIPmnYAnXSwgYmF6aUluZm8pO1xuXG4gICAgICAvLyDotKLlrpjlj4znvo7moLzpnIDopoHotKLmmJ/lkozlrpjmmJ/pg73ovoPlvLpcbiAgICAgIGlmIChjYWlTdHJlbmd0aCA+PSAyICYmIGd1YW5TdHJlbmd0aCA+PSAyKSB7XG4gICAgICAgIGNvbnN0IHN0cmVuZ3RoID0gTWF0aC5taW4oODUsIDYwICsgKGNhaVN0cmVuZ3RoICsgZ3VhblN0cmVuZ3RoKSAqIDUpO1xuICAgICAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuZ2V0R2VKdVByaW9yaXR5KCfotKLlrpjlj4znvo7moLwnLCByaVpodVN0cmVuZ3RoLCBtb250aEJyYW5jaCk7XG5cbiAgICAgICAgcG9zc2libGVHZUp1TGlzdC5wdXNoKHtcbiAgICAgICAgICBnZUp1OiAn6LSi5a6Y5Y+M576O5qC8JyxcbiAgICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3otKLmmJ/lkozlrpjmmJ/pg73ml7rnm5vmnInlipvvvIzkuJTml6XkuLvpgILkuK3vvIzog73lpJ/mib/lj5fotKLlrpjkuYvlipvvvIzkuLrotKLlrpjlj4znvo7moLzjgIInLFxuICAgICAgICAgIHN0cmVuZ3RoLFxuICAgICAgICAgIHByaW9yaXR5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDEuMiDkvKTlrpjkvanljbDmoLxcbiAgICBpZiAodGhpcy5oYXNTaGlTaGVuKFsn5Lyk5a6YJ10sIFt5ZWFyU2hpU2hlbkdhbiwgbW9udGhTaGlTaGVuR2FuLCB0aW1lU2hpU2hlbkdhbiwgLi4ueWVhclNoaVNoZW5aaGksIC4uLm1vbnRoU2hpU2hlblpoaSwgLi4uaG91clNoaVNoZW5aaGldKSAmJlxuICAgICAgICB0aGlzLmhhc1NoaVNoZW4oWyfmraPljbAnLCAn5YGP5Y2wJ10sIFt5ZWFyU2hpU2hlbkdhbiwgbW9udGhTaGlTaGVuR2FuLCB0aW1lU2hpU2hlbkdhbiwgLi4ueWVhclNoaVNoZW5aaGksIC4uLm1vbnRoU2hpU2hlblpoaSwgLi4uaG91clNoaVNoZW5aaGldKSkge1xuXG4gICAgICAvLyDorqHnrpfkvKTlrpjlkozljbDmmJ/nmoTlvLrluqZcbiAgICAgIGNvbnN0IHNoYW5nR3VhblN0cmVuZ3RoID0gdGhpcy5jYWxjdWxhdGVTaGlTaGVuU3RyZW5ndGgoWyfkvKTlrpgnXSwgYmF6aUluZm8pO1xuICAgICAgY29uc3QgeWluU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVNoaVNoZW5TdHJlbmd0aChbJ+ato+WNsCcsICflgY/ljbAnXSwgYmF6aUluZm8pO1xuXG4gICAgICAvLyDkvKTlrpjkvanljbDmoLzpnIDopoHkvKTlrpjlkozljbDmmJ/pg73ovoPlvLpcbiAgICAgIGlmIChzaGFuZ0d1YW5TdHJlbmd0aCA+PSAyICYmIHlpblN0cmVuZ3RoID49IDIpIHtcbiAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBNYXRoLm1pbig4NSwgNjAgKyAoc2hhbmdHdWFuU3RyZW5ndGggKyB5aW5TdHJlbmd0aCkgKiA1KTtcbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5Lyk5a6Y5L2p5Y2w5qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgICAgZ2VKdTogJ+S8pOWumOS9qeWNsOagvCcsXG4gICAgICAgICAgZGV0YWlsOiAn5YWr5a2X5Lit5ZCM5pe25pyJ5Lyk5a6Y5ZKM5Y2w5pif77yM5LiU5Lik6ICF5Yqb6YeP5Z2H6KGh77yM55u45LqS5Yi257qm77yM5Li65Lyk5a6Y5L2p5Y2w5qC844CCJyxcbiAgICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgICBwcmlvcml0eVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAxLjMg5pel5YWD5bu656aE5qC8XG4gICAgaWYgKHRoaXMuaXNEYXlFbGVtZW50QnVpbGRMdShkYXlTdGVtLCBtb250aEJyYW5jaCkpIHtcbiAgICAgIGNvbnN0IHN0cmVuZ3RoID0gODA7XG4gICAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuZ2V0R2VKdVByaW9yaXR5KCfml6XlhYPlu7rnpoTmoLwnLCByaVpodVN0cmVuZ3RoLCBtb250aEJyYW5jaCk7XG5cbiAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgIGdlSnU6ICfml6XlhYPlu7rnpoTmoLwnLFxuICAgICAgICBkZXRhaWw6ICfml6XkuLvlpKnlubLkuI7miYDlpITmnIjku6TlnLDmlK/mnoTmiJDlu7rnpoTlhbPns7vvvIzkuLrml6XlhYPlu7rnpoTmoLzjgIInLFxuICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgcHJpb3JpdHlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDEuNCDml6XlhYPlu7rlhYPmoLxcbiAgICBpZiAodGhpcy5pc0RheUVsZW1lbnRCdWlsZFl1YW4oZGF5U3RlbSwgbW9udGhCcmFuY2gpKSB7XG4gICAgICBjb25zdCBzdHJlbmd0aCA9IDc1O1xuICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5pel5YWD5bu65YWD5qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICBwb3NzaWJsZUdlSnVMaXN0LnB1c2goe1xuICAgICAgICBnZUp1OiAn5pel5YWD5bu65YWD5qC8JyxcbiAgICAgICAgZGV0YWlsOiAn5pel5Li75aSp5bmy5LiO5omA5aSE5pyI5Luk5Zyw5pSv5p6E5oiQ5bu65YWD5YWz57O777yM5Li65pel5YWD5bu65YWD5qC844CCJyxcbiAgICAgICAgc3RyZW5ndGgsXG4gICAgICAgIHByaW9yaXR5XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAxLjUg5LuO5pe65qC8XG4gICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICfmnoHml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICfml7onKSB7XG4gICAgICBjb25zdCBiaUppYW5Db3VudCA9IHRoaXMuY291bnRTaGlTaGVuKFsn5q+U6IKpJywgJ+WKq+i0oiddLCBbeWVhclNoaVNoZW5HYW4sIG1vbnRoU2hpU2hlbkdhbiwgdGltZVNoaVNoZW5HYW4sIC4uLnllYXJTaGlTaGVuWmhpLCAuLi5tb250aFNoaVNoZW5aaGksIC4uLmhvdXJTaGlTaGVuWmhpXSk7XG5cbiAgICAgIGlmIChiaUppYW5Db3VudCA+PSAzKSB7XG4gICAgICAgIGNvbnN0IHN0cmVuZ3RoID0gTWF0aC5taW4oOTAsIDcwICsgYmlKaWFuQ291bnQgKiA1KTtcbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5LuO5pe65qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgICAgZ2VKdTogJ+S7juaXuuagvCcsXG4gICAgICAgICAgZGV0YWlsOiAn5pel5Li75p6B5pe677yM5LiU5pyJ5aSa5Liq5q+U5Yqr5biu5om277yM5Li65LuO5pe65qC844CCJyxcbiAgICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgICBwcmlvcml0eVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAxLjYg5LuO5byx5qC8XG4gICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICfmnoHlvLEnIHx8IHJpWmh1U3RyZW5ndGggPT09ICflvLEnKSB7XG4gICAgICBjb25zdCBndWFuU2hhQ291bnQgPSB0aGlzLmNvdW50U2hpU2hlbihbJ+ato+WumCcsICfkuIPmnYAnXSwgW3llYXJTaGlTaGVuR2FuLCBtb250aFNoaVNoZW5HYW4sIHRpbWVTaGlTaGVuR2FuLCAuLi55ZWFyU2hpU2hlblpoaSwgLi4ubW9udGhTaGlTaGVuWmhpLCAuLi5ob3VyU2hpU2hlblpoaV0pO1xuXG4gICAgICBpZiAoZ3VhblNoYUNvdW50ID49IDMpIHtcbiAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBNYXRoLm1pbig5MCwgNzAgKyBndWFuU2hhQ291bnQgKiA1KTtcbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5LuO5byx5qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgICAgZ2VKdTogJ+S7juW8seagvCcsXG4gICAgICAgICAgZGV0YWlsOiAn5pel5Li75p6B5byx77yM5LiU5pyJ5aSa5Liq5a6Y5p2A5YWL5Yi277yM5Li65LuO5byx5qC844CCJyxcbiAgICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgICBwcmlvcml0eVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiDliKTmlq3ln7rmnKzmoLzlsYBcblxuICAgIC8vIDIuMSDmraPljbDmoLxcbiAgICBpZiAodGhpcy5oYXNTaGlTaGVuKFsn5q2j5Y2wJ10sIFt5ZWFyU2hpU2hlbkdhbiwgbW9udGhTaGlTaGVuR2FuLCB0aW1lU2hpU2hlbkdhbiwgLi4ueWVhclNoaVNoZW5aaGksIC4uLm1vbnRoU2hpU2hlblpoaSwgLi4uaG91clNoaVNoZW5aaGldKSkge1xuICAgICAgY29uc3QgeWluU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVNoaVNoZW5TdHJlbmd0aChbJ+ato+WNsCddLCBiYXppSW5mbyk7XG5cbiAgICAgIGlmICh5aW5TdHJlbmd0aCA+PSAyKSB7XG4gICAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgLy8g5qC55o2u5pel5Li75pe66KGw6LCD5pW05by65bqmXG4gICAgICAgIGlmIChyaVpodVN0cmVuZ3RoID09PSAn5byxJyB8fCByaVpodVN0cmVuZ3RoID09PSAn5p6B5byxJyB8fCByaVpodVN0cmVuZ3RoID09PSAn5YGP5byxJykge1xuICAgICAgICAgIHN0cmVuZ3RoID0gTWF0aC5taW4oODAsIDYwICsgeWluU3RyZW5ndGggKiA1KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJlbmd0aCA9IE1hdGgubWluKDYwLCA0MCArIHlpblN0cmVuZ3RoICogNSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuZ2V0R2VKdVByaW9yaXR5KCfmraPljbDmoLwnLCByaVpodVN0cmVuZ3RoLCBtb250aEJyYW5jaCk7XG5cbiAgICAgICAgcG9zc2libGVHZUp1TGlzdC5wdXNoKHtcbiAgICAgICAgICBnZUp1OiAn5q2j5Y2w5qC8JyxcbiAgICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3mraPljbDmmJ/lvZPku6TmiJbmnInlipvvvIzkuJTml6XkuLvlgY/lvLHvvIzlj5bmraPljbDkuLrnlKjnpZ7vvIzkuLrmraPljbDmoLzjgIInLFxuICAgICAgICAgIHN0cmVuZ3RoLFxuICAgICAgICAgIHByaW9yaXR5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIuMiDlgY/ljbDmoLxcbiAgICBpZiAodGhpcy5oYXNTaGlTaGVuKFsn5YGP5Y2wJ10sIFt5ZWFyU2hpU2hlbkdhbiwgbW9udGhTaGlTaGVuR2FuLCB0aW1lU2hpU2hlbkdhbiwgLi4ueWVhclNoaVNoZW5aaGksIC4uLm1vbnRoU2hpU2hlblpoaSwgLi4uaG91clNoaVNoZW5aaGldKSkge1xuICAgICAgY29uc3QgeWluU3RyZW5ndGggPSB0aGlzLmNhbGN1bGF0ZVNoaVNoZW5TdHJlbmd0aChbJ+WBj+WNsCddLCBiYXppSW5mbyk7XG5cbiAgICAgIGlmICh5aW5TdHJlbmd0aCA+PSAyKSB7XG4gICAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgLy8g5qC55o2u5pel5Li75pe66KGw6LCD5pW05by65bqmXG4gICAgICAgIGlmIChyaVpodVN0cmVuZ3RoID09PSAn5byxJyB8fCByaVpodVN0cmVuZ3RoID09PSAn5p6B5byxJyB8fCByaVpodVN0cmVuZ3RoID09PSAn5YGP5byxJykge1xuICAgICAgICAgIHN0cmVuZ3RoID0gTWF0aC5taW4oODAsIDYwICsgeWluU3RyZW5ndGggKiA1KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJlbmd0aCA9IE1hdGgubWluKDYwLCA0MCArIHlpblN0cmVuZ3RoICogNSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuZ2V0R2VKdVByaW9yaXR5KCflgY/ljbDmoLwnLCByaVpodVN0cmVuZ3RoLCBtb250aEJyYW5jaCk7XG5cbiAgICAgICAgcG9zc2libGVHZUp1TGlzdC5wdXNoKHtcbiAgICAgICAgICBnZUp1OiAn5YGP5Y2w5qC8JyxcbiAgICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3lgY/ljbDmmJ/lvZPku6TmiJbmnInlipvvvIzkuJTml6XkuLvlgY/lvLHvvIzlj5blgY/ljbDkuLrnlKjnpZ7vvIzkuLrlgY/ljbDmoLzjgIInLFxuICAgICAgICAgIHN0cmVuZ3RoLFxuICAgICAgICAgIHByaW9yaXR5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIuMyDmraPlrpjmoLxcbiAgICBpZiAodGhpcy5oYXNTaGlTaGVuKFsn5q2j5a6YJ10sIFt5ZWFyU2hpU2hlbkdhbiwgbW9udGhTaGlTaGVuR2FuLCB0aW1lU2hpU2hlbkdhbiwgLi4ueWVhclNoaVNoZW5aaGksIC4uLm1vbnRoU2hpU2hlblpoaSwgLi4uaG91clNoaVNoZW5aaGldKSkge1xuICAgICAgY29uc3QgZ3VhblN0cmVuZ3RoID0gdGhpcy5jYWxjdWxhdGVTaGlTaGVuU3RyZW5ndGgoWyfmraPlrpgnXSwgYmF6aUluZm8pO1xuXG4gICAgICBpZiAoZ3VhblN0cmVuZ3RoID49IDIpIHtcbiAgICAgICAgbGV0IHN0cmVuZ3RoID0gMDtcblxuICAgICAgICAvLyDmoLnmja7ml6XkuLvml7roobDosIPmlbTlvLrluqZcbiAgICAgICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICfml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICfmnoHml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/ml7onKSB7XG4gICAgICAgICAgc3RyZW5ndGggPSBNYXRoLm1pbig4MCwgNjAgKyBndWFuU3RyZW5ndGggKiA1KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJlbmd0aCA9IE1hdGgubWluKDYwLCA0MCArIGd1YW5TdHJlbmd0aCAqIDUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5q2j5a6Y5qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgICAgZ2VKdTogJ+ato+WumOagvCcsXG4gICAgICAgICAgZGV0YWlsOiAn5YWr5a2X5Lit5q2j5a6Y5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75pe655ub77yM5Y+W5q2j5a6Y5Li655So56We77yM5Li65q2j5a6Y5qC844CCJyxcbiAgICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgICBwcmlvcml0eVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLjQg5LiD5p2A5qC8XG4gICAgaWYgKHRoaXMuaGFzU2hpU2hlbihbJ+S4g+adgCddLCBbeWVhclNoaVNoZW5HYW4sIG1vbnRoU2hpU2hlbkdhbiwgdGltZVNoaVNoZW5HYW4sIC4uLnllYXJTaGlTaGVuWmhpLCAuLi5tb250aFNoaVNoZW5aaGksIC4uLmhvdXJTaGlTaGVuWmhpXSkpIHtcbiAgICAgIGNvbnN0IHNoYVN0cmVuZ3RoID0gdGhpcy5jYWxjdWxhdGVTaGlTaGVuU3RyZW5ndGgoWyfkuIPmnYAnXSwgYmF6aUluZm8pO1xuXG4gICAgICBpZiAoc2hhU3RyZW5ndGggPj0gMikge1xuICAgICAgICBsZXQgc3RyZW5ndGggPSAwO1xuXG4gICAgICAgIC8vIOagueaNruaXpeS4u+aXuuihsOiwg+aVtOW8uuW6plxuICAgICAgICBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+aXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aegeaXuicgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+aXuicpIHtcbiAgICAgICAgICBzdHJlbmd0aCA9IE1hdGgubWluKDgwLCA2MCArIHNoYVN0cmVuZ3RoICogNSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyZW5ndGggPSBNYXRoLm1pbig2MCwgNDAgKyBzaGFTdHJlbmd0aCAqIDUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmdldEdlSnVQcmlvcml0eSgn5LiD5p2A5qC8JywgcmlaaHVTdHJlbmd0aCwgbW9udGhCcmFuY2gpO1xuXG4gICAgICAgIHBvc3NpYmxlR2VKdUxpc3QucHVzaCh7XG4gICAgICAgICAgZ2VKdTogJ+S4g+adgOagvCcsXG4gICAgICAgICAgZGV0YWlsOiAn5YWr5a2X5Lit5LiD5p2A5pif5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75pe655ub77yM5Y+W5LiD5p2A5Li655So56We77yM5Li65LiD5p2A5qC844CCJyxcbiAgICAgICAgICBzdHJlbmd0aCxcbiAgICAgICAgICBwcmlvcml0eVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlpoLmnpzmsqHmnInmib7liLDku7vkvZXmoLzlsYDvvIzmt7vliqDmnYLmsJTmoLxcbiAgICBpZiAocG9zc2libGVHZUp1TGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IHByaW9yaXR5ID0gdGhpcy5nZXRHZUp1UHJpb3JpdHkoJ+adguawlOagvCcsIHJpWmh1U3RyZW5ndGgsIG1vbnRoQnJhbmNoKTtcblxuICAgICAgcG9zc2libGVHZUp1TGlzdC5wdXNoKHtcbiAgICAgICAgZ2VKdTogJ+adguawlOagvCcsXG4gICAgICAgIGRldGFpbDogJ+WFq+Wtl+S4reaXoOaYjuaYvuagvOWxgOeJueW+ge+8jOS4uuadguawlOagvOOAgicsXG4gICAgICAgIHN0cmVuZ3RoOiA2MCxcbiAgICAgICAgcHJpb3JpdHlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NzaWJsZUdlSnVMaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIOagh+WHhuWMluWNgeelnuWcsOaUr+S/oeaBr1xuICAgKiBAcGFyYW0gc2hpU2hlblpoaSDljYHnpZ7lnLDmlK/kv6Hmga9cbiAgICogQHJldHVybnMg5qCH5YeG5YyW5ZCO55qE5Y2B56We5Zyw5pSv5pWw57uEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBub3JtYWxpemVTaGlTaGVuWmhpKHNoaVNoZW5aaGk6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKTogc3RyaW5nW10ge1xuICAgIGlmICghc2hpU2hlblpoaSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygc2hpU2hlblpoaSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBbc2hpU2hlblpoaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoaVNoZW5aaGk7XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5piv5ZCm5YyF5ZCr5oyH5a6a5Y2B56WeXG4gICAqIEBwYXJhbSB0YXJnZXRTaGlTaGVuIOebruagh+WNgeelnuaVsOe7hFxuICAgKiBAcGFyYW0gc2hpU2hlbkxpc3Qg5Y2B56We5YiX6KGoXG4gICAqIEByZXR1cm5zIOaYr+WQpuWMheWQq1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaGFzU2hpU2hlbih0YXJnZXRTaGlTaGVuOiBzdHJpbmdbXSwgc2hpU2hlbkxpc3Q6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHNoaVNoZW5MaXN0LnNvbWUoc2hpU2hlbiA9PiB0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHNoaVNoZW4pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfmjIflrprljYHnpZ7nmoTmlbDph49cbiAgICogQHBhcmFtIHRhcmdldFNoaVNoZW4g55uu5qCH5Y2B56We5pWw57uEXG4gICAqIEBwYXJhbSBzaGlTaGVuTGlzdCDljYHnpZ7liJfooahcbiAgICogQHJldHVybnMg5pWw6YePXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjb3VudFNoaVNoZW4odGFyZ2V0U2hpU2hlbjogc3RyaW5nW10sIHNoaVNoZW5MaXN0OiBzdHJpbmdbXSk6IG51bWJlciB7XG4gICAgcmV0dXJuIHNoaVNoZW5MaXN0LmZpbHRlcihzaGlTaGVuID0+IHRhcmdldFNoaVNoZW4uaW5jbHVkZXMoc2hpU2hlbikpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiDorqHnrpfmjIflrprljYHnpZ7nmoTlvLrluqZcbiAgICogQHBhcmFtIHRhcmdldFNoaVNoZW4g55uu5qCH5Y2B56We5pWw57uEXG4gICAqIEBwYXJhbSBiYXppSW5mbyDlhavlrZfkv6Hmga9cbiAgICogQHJldHVybnMg5by65bqmXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVTaGlTaGVuU3RyZW5ndGgodGFyZ2V0U2hpU2hlbjogc3RyaW5nW10sIGJhemlJbmZvOiBCYXppSW5mbyk6IG51bWJlciB7XG4gICAgbGV0IHN0cmVuZ3RoID0gMDtcblxuICAgIC8vIOiOt+WPluWNgeelnuS/oeaBr1xuICAgIGNvbnN0IHllYXJTaGlTaGVuR2FuID0gYmF6aUluZm8ueWVhclNoaVNoZW5HYW4gfHwgJyc7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuR2FuID0gYmF6aUluZm8ubW9udGhTaGlTaGVuR2FuIHx8ICcnO1xuICAgIGNvbnN0IHRpbWVTaGlTaGVuR2FuID0gYmF6aUluZm8udGltZVNoaVNoZW5HYW4gfHwgJyc7XG5cbiAgICAvLyDojrflj5blnLDmlK/ol4/lubLljYHnpZ7kv6Hmga9cbiAgICBjb25zdCB5ZWFyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby55ZWFyU2hpU2hlblpoaSk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gdGhpcy5ub3JtYWxpemVTaGlTaGVuWmhpKGJhemlJbmZvLm1vbnRoU2hpU2hlblpoaSk7XG4gICAgY29uc3QgZGF5U2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5kYXlTaGlTaGVuWmhpKTtcbiAgICBjb25zdCBob3VyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5ob3VyU2hpU2hlblpoaSk7XG5cbiAgICAvLyDlpKnlubLljYHnpZ5cbiAgICBpZiAodGFyZ2V0U2hpU2hlbi5pbmNsdWRlcyh5ZWFyU2hpU2hlbkdhbikpIHN0cmVuZ3RoICs9IDE7XG4gICAgaWYgKHRhcmdldFNoaVNoZW4uaW5jbHVkZXMobW9udGhTaGlTaGVuR2FuKSkgc3RyZW5ndGggKz0gMjsgLy8g5pyI5Luk5Yqg5YCNXG4gICAgaWYgKHRhcmdldFNoaVNoZW4uaW5jbHVkZXModGltZVNoaVNoZW5HYW4pKSBzdHJlbmd0aCArPSAxO1xuXG4gICAgLy8g5Zyw5pSv6JeP5bmy5Y2B56WeXG4gICAgeWVhclNoaVNoZW5aaGkuZm9yRWFjaChzaGlTaGVuID0+IHtcbiAgICAgIGlmICh0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHNoaVNoZW4pKSBzdHJlbmd0aCArPSAwLjU7XG4gICAgfSk7XG5cbiAgICBtb250aFNoaVNoZW5aaGkuZm9yRWFjaChzaGlTaGVuID0+IHtcbiAgICAgIGlmICh0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHNoaVNoZW4pKSBzdHJlbmd0aCArPSAxOyAvLyDmnIjku6TliqDlgI1cbiAgICB9KTtcblxuICAgIGRheVNoaVNoZW5aaGkuZm9yRWFjaChzaGlTaGVuID0+IHtcbiAgICAgIGlmICh0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHNoaVNoZW4pKSBzdHJlbmd0aCArPSAwLjU7XG4gICAgfSk7XG5cbiAgICBob3VyU2hpU2hlblpoaS5mb3JFYWNoKHNoaVNoZW4gPT4ge1xuICAgICAgaWYgKHRhcmdldFNoaVNoZW4uaW5jbHVkZXMoc2hpU2hlbikpIHN0cmVuZ3RoICs9IDAuNTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzdHJlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3ml6XlhYPmmK/lkKblu7rnpoRcbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmyXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5bu656aEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RheUVsZW1lbnRCdWlsZEx1KGRheVN0ZW06IHN0cmluZywgbW9udGhCcmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGJ1aWxkTHVNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+eUsic6ICflr4UnLFxuICAgICAgJ+S5mSc6ICflja8nLFxuICAgICAgJ+S4mSc6ICflt7MnLFxuICAgICAgJ+S4gSc6ICfljYgnLFxuICAgICAgJ+aIiic6ICflt7MnLFxuICAgICAgJ+W3sSc6ICfljYgnLFxuICAgICAgJ+W6mic6ICfnlLMnLFxuICAgICAgJ+i+myc6ICfphYknLFxuICAgICAgJ+WjrCc6ICfkuqUnLFxuICAgICAgJ+eZuCc6ICflrZAnXG4gICAgfTtcblxuICAgIHJldHVybiBidWlsZEx1TWFwW2RheVN0ZW1dID09PSBtb250aEJyYW5jaDtcbiAgfVxuXG4gIC8qKlxuICAgKiDliKTmlq3ml6XlhYPmmK/lkKblu7rlhYNcbiAgICogQHBhcmFtIGRheVN0ZW0g5pel5bmyXG4gICAqIEBwYXJhbSBtb250aEJyYW5jaCDmnIjmlK9cbiAgICogQHJldHVybnMg5piv5ZCm5bu65YWDXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc0RheUVsZW1lbnRCdWlsZFl1YW4oZGF5U3RlbTogc3RyaW5nLCBtb250aEJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgYnVpbGRZdWFuTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICfnlLInOiAn5a2QJyxcbiAgICAgICfkuZknOiAn5LiRJyxcbiAgICAgICfkuJknOiAn5a+FJyxcbiAgICAgICfkuIEnOiAn5Y2vJyxcbiAgICAgICfmiIonOiAn6L6wJyxcbiAgICAgICflt7EnOiAn5bezJyxcbiAgICAgICfluponOiAn5Y2IJyxcbiAgICAgICfovpsnOiAn5pyqJyxcbiAgICAgICflo6wnOiAn55SzJyxcbiAgICAgICfnmbgnOiAn6YWJJ1xuICAgIH07XG5cbiAgICByZXR1cm4gYnVpbGRZdWFuTWFwW2RheVN0ZW1dID09PSBtb250aEJyYW5jaDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bmoLzlsYDkvJjlhYjnuqdcbiAgICogQHBhcmFtIGdlSnUg5qC85bGA5ZCN56ewXG4gICAqIEBwYXJhbSByaVpodVN0cmVuZ3RoIOaXpeS4u+aXuuihsFxuICAgKiBAcGFyYW0gbW9udGhCcmFuY2gg5pyI5pSvXG4gICAqIEByZXR1cm5zIOS8mOWFiOe6p1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0R2VKdVByaW9yaXR5KGdlSnU6IHN0cmluZywgcmlaaHVTdHJlbmd0aDogc3RyaW5nLCBtb250aEJyYW5jaDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAvLyDmn6Xmib7moLzlsYDphY3nva5cbiAgICBjb25zdCBjb25maWcgPSB0aGlzLmdlSnVQcmlvcml0eUNvbmZpZy5maW5kKGl0ZW0gPT4gaXRlbS5nZUp1ID09PSBnZUp1KTtcblxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICByZXR1cm4gMTsgLy8g6buY6K6k5pyA5L2O5LyY5YWI57qnXG4gICAgfVxuXG4gICAgbGV0IHByaW9yaXR5ID0gY29uZmlnLmJhc2VQcmlvcml0eTtcblxuICAgIC8vIOajgOafpeaXpeS4u+aXuuihsOadoeS7tlxuICAgIGlmIChjb25maWcucmlaaHVDb25kaXRpb24gJiYgY29uZmlnLnJpWmh1Q29uZGl0aW9uLnN0YXRlcy5pbmNsdWRlcyhyaVpodVN0cmVuZ3RoKSkge1xuICAgICAgcHJpb3JpdHkgKz0gY29uZmlnLnJpWmh1Q29uZGl0aW9uLnByaW9yaXR5Qm9udXM7XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5pyI5Luk5p2h5Lu2XG4gICAgaWYgKGNvbmZpZy5tb250aENvbmRpdGlvbiAmJiBjb25maWcubW9udGhDb25kaXRpb24uYnJhbmNoZXMuaW5jbHVkZXMobW9udGhCcmFuY2gpKSB7XG4gICAgICBwcmlvcml0eSArPSBjb25maWcubW9udGhDb25kaXRpb24ucHJpb3JpdHlCb251cztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJpb3JpdHk7XG4gIH1cblxuICAvKipcbiAgICog56Gu5a6a5Li75qC85bGA5ZKM6L6F5Yqp5qC85bGAXG4gICAqIEBwYXJhbSBwb3NzaWJsZUdlSnVMaXN0IOWPr+iDveeahOagvOWxgOWIl+ihqFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEByZXR1cm5zIOS4u+agvOWxgOWSjOi+heWKqeagvOWxgFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZGV0ZXJtaW5lTWFpbkdlSnUoXG4gICAgcG9zc2libGVHZUp1TGlzdDoge1xuICAgICAgZ2VKdTogc3RyaW5nO1xuICAgICAgZGV0YWlsOiBzdHJpbmc7XG4gICAgICBzdHJlbmd0aDogbnVtYmVyO1xuICAgICAgcHJpb3JpdHk6IG51bWJlcjtcbiAgICB9W10sXG4gICAgYmF6aUluZm86IEJhemlJbmZvXG4gICk6IHtcbiAgICBtYWluR2VKdToge1xuICAgICAgZ2VKdTogc3RyaW5nO1xuICAgICAgZGV0YWlsOiBzdHJpbmc7XG4gICAgICBzdHJlbmd0aDogbnVtYmVyO1xuICAgIH07XG4gICAgYXNzaXN0R2VKdUxpc3Q6IHtcbiAgICAgIGdlSnU6IHN0cmluZztcbiAgICAgIGRldGFpbDogc3RyaW5nO1xuICAgICAgc3RyZW5ndGg6IG51bWJlcjtcbiAgICB9W107XG4gIH0ge1xuICAgIC8vIOWmguaenOayoeacieWPr+iDveeahOagvOWxgO+8jOi/lOWbnuadguawlOagvFxuICAgIGlmIChwb3NzaWJsZUdlSnVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFpbkdlSnU6IHtcbiAgICAgICAgICBnZUp1OiAn5p2C5rCU5qC8JyxcbiAgICAgICAgICBkZXRhaWw6ICflhavlrZfkuK3ml6DmmI7mmL7moLzlsYDnibnlvoHvvIzkuLrmnYLmsJTmoLzjgIInLFxuICAgICAgICAgIHN0cmVuZ3RoOiA2MFxuICAgICAgICB9LFxuICAgICAgICBhc3Npc3RHZUp1TGlzdDogW11cbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5oyJ5LyY5YWI57qn5ZKM5by65bqm5o6S5bqPXG4gICAgY29uc3Qgc29ydGVkR2VKdUxpc3QgPSBbLi4ucG9zc2libGVHZUp1TGlzdF0uc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8g6aaW5YWI5oyJ5LyY5YWI57qn5o6S5bqPXG4gICAgICBpZiAoYS5wcmlvcml0eSAhPT0gYi5wcmlvcml0eSkge1xuICAgICAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHk7XG4gICAgICB9XG4gICAgICAvLyDlhbbmrKHmjInlvLrluqbmjpLluo9cbiAgICAgIHJldHVybiBiLnN0cmVuZ3RoIC0gYS5zdHJlbmd0aDtcbiAgICB9KTtcblxuICAgIC8vIOS4u+agvOWxgOaYr+aOkuW6j+WQjueahOesrOS4gOS4qlxuICAgIGNvbnN0IG1haW5HZUp1ID0ge1xuICAgICAgZ2VKdTogc29ydGVkR2VKdUxpc3RbMF0uZ2VKdSxcbiAgICAgIGRldGFpbDogc29ydGVkR2VKdUxpc3RbMF0uZGV0YWlsLFxuICAgICAgc3RyZW5ndGg6IHNvcnRlZEdlSnVMaXN0WzBdLnN0cmVuZ3RoXG4gICAgfTtcblxuICAgIC8vIOi+heWKqeagvOWxgOaYr+aOkuW6j+WQjueahOWFtuS9meagvOWxgFxuICAgIGNvbnN0IGFzc2lzdEdlSnVMaXN0ID0gc29ydGVkR2VKdUxpc3Quc2xpY2UoMSkubWFwKGdlSnUgPT4gKHtcbiAgICAgIGdlSnU6IGdlSnUuZ2VKdSxcbiAgICAgIGRldGFpbDogZ2VKdS5kZXRhaWwsXG4gICAgICBzdHJlbmd0aDogZ2VKdS5zdHJlbmd0aFxuICAgIH0pKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtYWluR2VKdSxcbiAgICAgIGFzc2lzdEdlSnVMaXN0XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDnoa7lrprnlKjnpZ5cbiAgICogQHBhcmFtIG1haW5HZUp1IOS4u+agvOWxgFxuICAgKiBAcGFyYW0gYmF6aUluZm8g5YWr5a2X5L+h5oGvXG4gICAqIEByZXR1cm5zIOeUqOelnuWSjOeUqOelnuivpuaDhVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZGV0ZXJtaW5lWW9uZ1NoZW4oXG4gICAgbWFpbkdlSnU6IHtcbiAgICAgIGdlSnU6IHN0cmluZztcbiAgICAgIGRldGFpbDogc3RyaW5nO1xuICAgICAgc3RyZW5ndGg6IG51bWJlcjtcbiAgICB9LFxuICAgIGJhemlJbmZvOiBCYXppSW5mb1xuICApOiB7XG4gICAgeW9uZ1NoZW46IHN0cmluZztcbiAgICB5b25nU2hlbkRldGFpbDogc3RyaW5nO1xuICB9IHtcbiAgICAvLyDojrflj5bml6XkuLvml7roobBcbiAgICBjb25zdCByaVpodVN0cmVuZ3RoID0gYmF6aUluZm8ucmlaaHVTdHJlbmd0aCB8fCAn5bmz6KGhJztcblxuICAgIC8vIOagueaNruagvOWxgOWQjeensOWSjOaXpeS4u+aXuuihsOehruWumueUqOelnlxuICAgIHN3aXRjaCAobWFpbkdlSnUuZ2VKdSkge1xuICAgICAgY2FzZSAn5q2j5Y2w5qC8JzpcbiAgICAgIGNhc2UgJ+WBj+WNsOagvCc6XG4gICAgICBjYXNlICfljbDnu7bmoLwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHlvbmdTaGVuOiAn5Y2w5pifJyxcbiAgICAgICAgICB5b25nU2hlbkRldGFpbDogJ+WFq+Wtl+S4reWNsOaYn+W9k+S7pOaIluacieWKm++8jOS4lOaXpeS4u+WBj+W8se+8jOWPluWNsOaYn+S4uueUqOelnu+8jOWNsOaYn+eUn+WKqeaXpeS4u++8jOWinuW8uuaXpeS4u+WKm+mHj+OAgidcbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAn5q2j5a6Y5qC8JzpcbiAgICAgIGNhc2UgJ+S4g+adgOagvCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeW9uZ1NoZW46ICflrpjmnYAnLFxuICAgICAgICAgIHlvbmdTaGVuRGV0YWlsOiAn5YWr5a2X5Lit5a6Y5p2A5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75pe655ub77yM5Y+W5a6Y5p2A5Li655So56We77yM5a6Y5p2A5YWL5Yi25pel5Li777yM5rOE56eA5pel5Li75LmL5rCU44CCJ1xuICAgICAgICB9O1xuXG4gICAgICBjYXNlICfmraPotKLmoLwnOlxuICAgICAgY2FzZSAn5YGP6LSi5qC8JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB5b25nU2hlbjogJ+i0ouaYnycsXG4gICAgICAgICAgeW9uZ1NoZW5EZXRhaWw6ICflhavlrZfkuK3otKLmmJ/lvZPku6TmiJbmnInlipvvvIzkuJTml6XkuLvml7rnm5vvvIzlj5botKLmmJ/kuLrnlKjnpZ7vvIzotKLmmJ/kuLrml6XkuLvmiYDnlJ/vvIzms4Tnp4Dml6XkuLvkuYvmsJTjgIInXG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ+mjn+elnuagvCc6XG4gICAgICBjYXNlICfkvKTlrpjmoLwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHlvbmdTaGVuOiAn6aOf5LykJyxcbiAgICAgICAgICB5b25nU2hlbkRldGFpbDogJ+WFq+Wtl+S4remjn+S8pOW9k+S7pOaIluacieWKm++8jOS4lOaXpeS4u+aXuuebm++8jOWPlumjn+S8pOS4uueUqOelnu+8jOmjn+S8pOS4uuaXpeS4u+aJgOeUn++8jOazhOengOaXpeS4u+S5i+awlOOAgidcbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAn5q+U6IKp5qC8JzpcbiAgICAgIGNhc2UgJ+WKq+i0ouagvCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeW9uZ1NoZW46ICfmr5TliqsnLFxuICAgICAgICAgIHlvbmdTaGVuRGV0YWlsOiAn5YWr5a2X5Lit5q+U5Yqr5b2T5Luk5oiW5pyJ5Yqb77yM5LiU5pel5Li75YGP5byx77yM5Y+W5q+U5Yqr5Li655So56We77yM5q+U5Yqr5LiO5pel5Li75ZCM5rCU55u45Yqp77yM5aKe5by65pel5Li75Yqb6YeP44CCJ1xuICAgICAgICB9O1xuXG4gICAgICBjYXNlICfotKLlrpjlj4znvo7moLwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHlvbmdTaGVuOiAn6LSi5a6YJyxcbiAgICAgICAgICB5b25nU2hlbkRldGFpbDogJ+WFq+Wtl+S4rei0ouaYn+WSjOWumOaYn+mDveaXuuebm+acieWKm++8jOS4lOaXpeS4u+mAguS4re+8jOiDveWkn+aJv+WPl+i0ouWumOS5i+WKm++8jOWPlui0ouWumOS4uueUqOelnu+8jOi0ouWumOebuOeUn+ebuOWKqe+8jOW9ouaIkOiJr+WlveagvOWxgOOAgidcbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAn5Lyk5a6Y5L2p5Y2w5qC8JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB5b25nU2hlbjogJ+S8pOWumOWNsCcsXG4gICAgICAgICAgeW9uZ1NoZW5EZXRhaWw6ICflhavlrZfkuK3lkIzml7bmnInkvKTlrpjlkozljbDmmJ/vvIzkuJTkuKTogIXlipvph4/lnYfooaHvvIznm7jkupLliLbnuqbvvIzlj5bkvKTlrpjljbDkuLrnlKjnpZ7vvIzkvKTlrpjku6PooajmiY3ljY7liJvmlrDvvIzljbDmmJ/ku6Pooajlrabpl67mloflh63vvIzkuKTogIXnm7jkupLliLbnuqbvvIzlvaLmiJDoia/lpb3lubPooaHjgIInXG4gICAgICAgIH07XG5cbiAgICAgIGNhc2UgJ+S7juaXuuagvCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeW9uZ1NoZW46ICfmr5TliqsnLFxuICAgICAgICAgIHlvbmdTaGVuRGV0YWlsOiAn5pel5Li75p6B5pe677yM5LiU5pyJ5aSa5Liq5q+U5Yqr5biu5om277yM6aG65LuO5pel5Li75LmL5pe677yM5Y+W5q+U5Yqr5Li655So56We77yM5q+U5Yqr5LiO5pel5Li75ZCM5rCU55u45Yqp77yM5aKe5by65pel5Li75Yqb6YeP44CCJ1xuICAgICAgICB9O1xuXG4gICAgICBjYXNlICfku47lvLHmoLwnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHlvbmdTaGVuOiAn5a6Y5p2AJyxcbiAgICAgICAgICB5b25nU2hlbkRldGFpbDogJ+aXpeS4u+aegeW8se+8jOS4lOacieWkmuS4quWumOadgOWFi+WItu+8jOmhuuS7juaXpeS4u+S5i+W8se+8jOWPluWumOadgOS4uueUqOelnu+8jOWumOadgOWFi+WItuaXpeS4u++8jOS9v+aXpeS4u+abtOWKoOihsOW8seOAgidcbiAgICAgICAgfTtcblxuICAgICAgY2FzZSAn5pel5YWD5bu656aE5qC8JzpcbiAgICAgIGNhc2UgJ+aXpeWFg+W7uuWFg+agvCc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeW9uZ1NoZW46ICfml6XlhYMnLFxuICAgICAgICAgIHlvbmdTaGVuRGV0YWlsOiAn5pel5Li75LiO5pyI5Luk5Zyw5pSv5p6E5oiQ54m55q6K5YWz57O777yM5pel5Li75b6X5Luk77yM5qC55Z+656iz5Zu677yM5Y+W5pel5YWD5Li655So56We77yM5YWF5YiG5Y+R5oyl5pel5Li755qE5LyY5Yq/44CCJ1xuICAgICAgICB9O1xuXG4gICAgICBjYXNlICfmnYLmsJTmoLwnOlxuICAgICAgICAvLyDmoLnmja7ml6XkuLvml7roobDnoa7lrprnlKjnpZ5cbiAgICAgICAgaWYgKHJpWmh1U3RyZW5ndGggPT09ICfml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICfmnoHml7onIHx8IHJpWmh1U3RyZW5ndGggPT09ICflgY/ml7onKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHlvbmdTaGVuOiAn6LSi5a6Y6aOf5LykJyxcbiAgICAgICAgICAgIHlvbmdTaGVuRGV0YWlsOiAn5YWr5a2X5Lit5peg5piO5pi+5qC85bGA54m55b6B77yM5pel5Li75YGP5pe677yM5Y+W6LSi5a6Y6aOf5Lyk5Li655So56We77yM5rOE56eA5pel5Li75LmL5rCU77yM5L2/5YWr5a2X6LaL5LqO5bmz6KGh44CCJ1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmlaaHVTdHJlbmd0aCA9PT0gJ+W8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+aegeW8sScgfHwgcmlaaHVTdHJlbmd0aCA9PT0gJ+WBj+W8sScpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeW9uZ1NoZW46ICfljbDmr5TliqsnLFxuICAgICAgICAgICAgeW9uZ1NoZW5EZXRhaWw6ICflhavlrZfkuK3ml6DmmI7mmL7moLzlsYDnibnlvoHvvIzml6XkuLvlgY/lvLHvvIzlj5bljbDmr5TliqvkuLrnlKjnpZ7vvIznlJ/liqnml6XkuLvkuYvmsJTvvIzkvb/lhavlrZfotovkuo7lubPooaHjgIInXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeW9uZ1NoZW46ICfmnIjku6TlvZPku6QnLFxuICAgICAgICAgICAgeW9uZ1NoZW5EZXRhaWw6ICflhavlrZfkuK3ml6DmmI7mmL7moLzlsYDnibnlvoHvvIzml6XkuLvlubPooaHvvIzlj5bmnIjku6TlvZPku6TkupTooYzkuLrnlKjnpZ7vvIzpobrlupToh6rnhLbkuYvlir/jgIInXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHlvbmdTaGVuOiAnJyxcbiAgICAgICAgICB5b25nU2hlbkRldGFpbDogJ+aXoOazleehruWumueUqOelnu+8jOivt+WSqOivouS4k+S4muWRveeQhuW4iOOAgidcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5pS26ZuG5qC85bGA5b2i5oiQ55qE5YWz6ZSu5Zug57SgXG4gICAqIEBwYXJhbSBtYWluR2VKdSDkuLvmoLzlsYBcbiAgICogQHBhcmFtIGJhemlJbmZvIOWFq+Wtl+S/oeaBr1xuICAgKiBAcmV0dXJucyDmoLzlsYDlvaLmiJDnmoTlhbPplK7lm6DntKBcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNvbGxlY3RHZUp1RmFjdG9ycyhcbiAgICBtYWluR2VKdToge1xuICAgICAgZ2VKdTogc3RyaW5nO1xuICAgICAgZGV0YWlsOiBzdHJpbmc7XG4gICAgICBzdHJlbmd0aDogbnVtYmVyO1xuICAgIH0sXG4gICAgYmF6aUluZm86IEJhemlJbmZvXG4gICk6IHtcbiAgICBmYWN0b3I6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGNvbnRyaWJ1dGlvbjogbnVtYmVyO1xuICB9W10ge1xuICAgIGNvbnN0IGZhY3RvcnM6IHtcbiAgICAgIGZhY3Rvcjogc3RyaW5nO1xuICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgIGNvbnRyaWJ1dGlvbjogbnVtYmVyO1xuICAgIH1bXSA9IFtdO1xuXG4gICAgLy8g6I635Y+W5Z+65pys5L+h5oGvXG4gICAgY29uc3QgZGF5U3RlbSA9IGJhemlJbmZvLmRheVN0ZW0gfHwgJyc7XG4gICAgY29uc3QgZGF5QnJhbmNoID0gYmF6aUluZm8uZGF5QnJhbmNoIHx8ICcnO1xuICAgIGNvbnN0IGRheVd1WGluZyA9IGJhemlJbmZvLmRheVd1WGluZyB8fCAnJztcbiAgICBjb25zdCByaVpodVN0cmVuZ3RoID0gYmF6aUluZm8ucmlaaHVTdHJlbmd0aCB8fCAn5bmz6KGhJztcbiAgICBjb25zdCBtb250aEJyYW5jaCA9IGJhemlJbmZvLm1vbnRoQnJhbmNoIHx8ICcnO1xuXG4gICAgLy8gMS4g5pel5Li75pe66KGw5piv6YeN6KaB5Zug57SgXG4gICAgZmFjdG9ycy5wdXNoKHtcbiAgICAgIGZhY3RvcjogJ+aXpeS4u+aXuuihsCcsXG4gICAgICBkZXNjcmlwdGlvbjogYOaXpeS4uyR7cmlaaHVTdHJlbmd0aH3vvIwke3RoaXMuZ2V0UmlaaHVEZXNjcmlwdGlvbihyaVpodVN0cmVuZ3RoKX1gLFxuICAgICAgY29udHJpYnV0aW9uOiAyNVxuICAgIH0pO1xuXG4gICAgLy8gMi4g5pyI5Luk5b2T5Luk5piv6YeN6KaB5Zug57SgXG4gICAgZmFjdG9ycy5wdXNoKHtcbiAgICAgIGZhY3RvcjogJ+aciOS7pCcsXG4gICAgICBkZXNjcmlwdGlvbjogYOaciOaUr+S4uiR7bW9udGhCcmFuY2h977yMJHt0aGlzLmdldE1vbnRoRGVzY3JpcHRpb24obW9udGhCcmFuY2gsIGRheVd1WGluZyl9YCxcbiAgICAgIGNvbnRyaWJ1dGlvbjogMjBcbiAgICB9KTtcblxuICAgIC8vIDMuIOagueaNruagvOWxgOexu+Wei+a3u+WKoOeJueWumuWboOe0oFxuICAgIHN3aXRjaCAobWFpbkdlSnUuZ2VKdSkge1xuICAgICAgY2FzZSAn5q2j5Y2w5qC8JzpcbiAgICAgIGNhc2UgJ+WBj+WNsOagvCc6XG4gICAgICBjYXNlICfljbDnu7bmoLwnOlxuICAgICAgICAvLyDmt7vliqDljbDmmJ/lm6DntKBcbiAgICAgICAgdGhpcy5hZGRTaGlTaGVuRmFjdG9ycyhbJ+ato+WNsCcsICflgY/ljbAnXSwgYmF6aUluZm8sIGZhY3RvcnMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn5q2j5a6Y5qC8JzpcbiAgICAgIGNhc2UgJ+S4g+adgOagvCc6XG4gICAgICAgIC8vIOa3u+WKoOWumOadgOWboOe0oFxuICAgICAgICB0aGlzLmFkZFNoaVNoZW5GYWN0b3JzKFsn5q2j5a6YJywgJ+S4g+adgCddLCBiYXppSW5mbywgZmFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfmraPotKLmoLwnOlxuICAgICAgY2FzZSAn5YGP6LSi5qC8JzpcbiAgICAgICAgLy8g5re75Yqg6LSi5pif5Zug57SgXG4gICAgICAgIHRoaXMuYWRkU2hpU2hlbkZhY3RvcnMoWyfmraPotKInLCAn5YGP6LSiJ10sIGJhemlJbmZvLCBmYWN0b3JzKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+mjn+elnuagvCc6XG4gICAgICBjYXNlICfkvKTlrpjmoLwnOlxuICAgICAgICAvLyDmt7vliqDpo5/kvKTlm6DntKBcbiAgICAgICAgdGhpcy5hZGRTaGlTaGVuRmFjdG9ycyhbJ+mjn+elnicsICfkvKTlrpgnXSwgYmF6aUluZm8sIGZhY3RvcnMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn5q+U6IKp5qC8JzpcbiAgICAgIGNhc2UgJ+WKq+i0ouagvCc6XG4gICAgICAgIC8vIOa3u+WKoOavlOWKq+WboOe0oFxuICAgICAgICB0aGlzLmFkZFNoaVNoZW5GYWN0b3JzKFsn5q+U6IKpJywgJ+WKq+i0oiddLCBiYXppSW5mbywgZmFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfotKLlrpjlj4znvo7moLwnOlxuICAgICAgICAvLyDmt7vliqDotKLmmJ/lkozlrpjmmJ/lm6DntKBcbiAgICAgICAgdGhpcy5hZGRTaGlTaGVuRmFjdG9ycyhbJ+ato+i0oicsICflgY/otKInXSwgYmF6aUluZm8sIGZhY3RvcnMpO1xuICAgICAgICB0aGlzLmFkZFNoaVNoZW5GYWN0b3JzKFsn5q2j5a6YJywgJ+S4g+adgCddLCBiYXppSW5mbywgZmFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfkvKTlrpjkvanljbDmoLwnOlxuICAgICAgICAvLyDmt7vliqDkvKTlrpjlkozljbDmmJ/lm6DntKBcbiAgICAgICAgdGhpcy5hZGRTaGlTaGVuRmFjdG9ycyhbJ+S8pOWumCddLCBiYXppSW5mbywgZmFjdG9ycyk7XG4gICAgICAgIHRoaXMuYWRkU2hpU2hlbkZhY3RvcnMoWyfmraPljbAnLCAn5YGP5Y2wJ10sIGJhemlJbmZvLCBmYWN0b3JzKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+S7juaXuuagvCc6XG4gICAgICAgIC8vIOa3u+WKoOavlOWKq+WboOe0oFxuICAgICAgICB0aGlzLmFkZFNoaVNoZW5GYWN0b3JzKFsn5q+U6IKpJywgJ+WKq+i0oiddLCBiYXppSW5mbywgZmFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICfku47lvLHmoLwnOlxuICAgICAgICAvLyDmt7vliqDlrpjmnYDlm6DntKBcbiAgICAgICAgdGhpcy5hZGRTaGlTaGVuRmFjdG9ycyhbJ+ato+WumCcsICfkuIPmnYAnXSwgYmF6aUluZm8sIGZhY3RvcnMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAn5pel5YWD5bu656aE5qC8JzpcbiAgICAgICAgLy8g5re75Yqg5bu656aE5Zug57SgXG4gICAgICAgIGZhY3RvcnMucHVzaCh7XG4gICAgICAgICAgZmFjdG9yOiAn5bu656aEJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogYOaXpeS4uyR7ZGF5U3RlbX3lnKjmnIjmlK8ke21vbnRoQnJhbmNofeW7uuemhO+8jOaXpeS4u+agueWfuueos+Wbuu+8jOW+l+S7pOacieWKm+OAgmAsXG4gICAgICAgICAgY29udHJpYnV0aW9uOiAzMFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ+aXpeWFg+W7uuWFg+agvCc6XG4gICAgICAgIC8vIOa3u+WKoOW7uuWFg+WboOe0oFxuICAgICAgICBmYWN0b3JzLnB1c2goe1xuICAgICAgICAgIGZhY3RvcjogJ+W7uuWFgycsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGDml6XkuLske2RheVN0ZW195Zyo5pyI5pSvJHttb250aEJyYW5jaH3lu7rlhYPvvIzml6XkuLvmoLnln7rnqLPlm7rvvIzlvpfku6TmnInlipvjgIJgLFxuICAgICAgICAgIGNvbnRyaWJ1dGlvbjogMzBcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIDQuIOa3u+WKoOe6s+mfs+S6lOihjOWboOe0oFxuICAgIGlmIChiYXppSW5mby5kYXlOYVlpbikge1xuICAgICAgZmFjdG9ycy5wdXNoKHtcbiAgICAgICAgZmFjdG9yOiAn57qz6Z+z5LqU6KGMJyxcbiAgICAgICAgZGVzY3JpcHRpb246IGDml6Xmn7HnurPpn7PkuLoke2JhemlJbmZvLmRheU5hWWlufe+8jOWvueagvOWxgOW9ouaIkOacieS4gOWumuW9seWTjeOAgmAsXG4gICAgICAgIGNvbnRyaWJ1dGlvbjogMTBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDUuIOa3u+WKoOS4ieWQiOWxgOWboOe0oFxuICAgIGNvbnN0IHNhbkhlSnUgPSB0aGlzLmNoZWNrU2FuSGVKdShiYXppSW5mbyk7XG4gICAgaWYgKHNhbkhlSnUpIHtcbiAgICAgIGZhY3RvcnMucHVzaCh7XG4gICAgICAgIGZhY3RvcjogJ+S4ieWQiOWxgCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBzYW5IZUp1LFxuICAgICAgICBjb250cmlidXRpb246IDE1XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyA2LiDmt7vliqDkuInkvJrlsYDlm6DntKBcbiAgICBjb25zdCBzYW5IdWlKdSA9IHRoaXMuY2hlY2tTYW5IdWlKdShiYXppSW5mbyk7XG4gICAgaWYgKHNhbkh1aUp1KSB7XG4gICAgICBmYWN0b3JzLnB1c2goe1xuICAgICAgICBmYWN0b3I6ICfkuInkvJrlsYAnLFxuICAgICAgICBkZXNjcmlwdGlvbjogc2FuSHVpSnUsXG4gICAgICAgIGNvbnRyaWJ1dGlvbjogMTVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmYWN0b3JzO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaXpeS4u+aXuuihsOaPj+i/sFxuICAgKiBAcGFyYW0gcmlaaHVTdHJlbmd0aCDml6XkuLvml7roobBcbiAgICogQHJldHVybnMg5o+P6L+wXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRSaVpodURlc2NyaXB0aW9uKHJpWmh1U3RyZW5ndGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChyaVpodVN0cmVuZ3RoKSB7XG4gICAgICBjYXNlICfmnoHml7onOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+aegeWFtuaXuuebm++8jOmcgOimgeazhOengOS5i+eJqeadpeW5s+ihoeOAgic7XG4gICAgICBjYXNlICfml7onOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+aXuuebm++8jOmcgOimgeazhOengOS5i+eJqeadpeW5s+ihoeOAgic7XG4gICAgICBjYXNlICflgY/ml7onOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+i+g+S4uuaXuuebm++8jOmcgOimgemAguW9k+azhOengOOAgic7XG4gICAgICBjYXNlICflubPooaEnOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+mAguS4re+8jOWFq+Wtl+i+g+S4uuW5s+ihoeOAgic7XG4gICAgICBjYXNlICflgY/lvLEnOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+i+g+S4uuihsOW8se+8jOmcgOimgemAguW9k+aJtuWKqeOAgic7XG4gICAgICBjYXNlICflvLEnOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+ihsOW8se+8jOmcgOimgeaJtuWKqeS5i+eJqeadpeWinuW8uuOAgic7XG4gICAgICBjYXNlICfmnoHlvLEnOlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+WKm+mHj+aegeWFtuihsOW8se+8jOmcgOimgeWkp+mHj+aJtuWKqeS5i+eJqeadpeWinuW8uuOAgic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ+aXpeS4u+aXuuihsOeKtuaAgeS4jeaYjuOAgic7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaciOS7pOaPj+i/sFxuICAgKiBAcGFyYW0gbW9udGhCcmFuY2gg5pyI5pSvXG4gICAqIEBwYXJhbSBkYXlXdVhpbmcg5pel5Li75LqU6KGMXG4gICAqIEByZXR1cm5zIOaPj+i/sFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0TW9udGhEZXNjcmlwdGlvbihtb250aEJyYW5jaDogc3RyaW5nLCBkYXlXdVhpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5a6a5LmJ5pyI5pSv5omA5bGe5a2j6IqCXG4gICAgY29uc3Qgc2Vhc29uTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAgICflr4UnOiAn5pil5a2jJyxcbiAgICAgICflja8nOiAn5pil5a2jJyxcbiAgICAgICfovrAnOiAn5pil5a2jJyxcbiAgICAgICflt7MnOiAn5aSP5a2jJyxcbiAgICAgICfljYgnOiAn5aSP5a2jJyxcbiAgICAgICfmnKonOiAn5aSP5a2jJyxcbiAgICAgICfnlLMnOiAn56eL5a2jJyxcbiAgICAgICfphYknOiAn56eL5a2jJyxcbiAgICAgICfmiIwnOiAn56eL5a2jJyxcbiAgICAgICfkuqUnOiAn5Yas5a2jJyxcbiAgICAgICflrZAnOiAn5Yas5a2jJyxcbiAgICAgICfkuJEnOiAn5Yas5a2jJ1xuICAgIH07XG5cbiAgICAvLyDlrprkuYnmnIjmlK/miYDlsZ7kupTooYxcbiAgICBjb25zdCBicmFuY2hXdVhpbmdNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+WvhSc6ICfmnKgnLFxuICAgICAgJ+WNryc6ICfmnKgnLFxuICAgICAgJ+i+sCc6ICflnJ8nLFxuICAgICAgJ+W3syc6ICfngasnLFxuICAgICAgJ+WNiCc6ICfngasnLFxuICAgICAgJ+acqic6ICflnJ8nLFxuICAgICAgJ+eUsyc6ICfph5EnLFxuICAgICAgJ+mFiSc6ICfph5EnLFxuICAgICAgJ+aIjCc6ICflnJ8nLFxuICAgICAgJ+S6pSc6ICfmsLQnLFxuICAgICAgJ+WtkCc6ICfmsLQnLFxuICAgICAgJ+S4kSc6ICflnJ8nXG4gICAgfTtcblxuICAgIC8vIOiOt+WPluaciOaUr+aJgOWxnuWto+iKguWSjOS6lOihjFxuICAgIGNvbnN0IHNlYXNvbiA9IHNlYXNvbk1hcFttb250aEJyYW5jaF0gfHwgJ+acquefpeWto+iKgic7XG4gICAgY29uc3QgbW9udGhXdVhpbmcgPSBicmFuY2hXdVhpbmdNYXBbbW9udGhCcmFuY2hdIHx8ICfmnKrnn6XkupTooYwnO1xuXG4gICAgLy8g5Yik5pat5pyI5Luk5a+55pel5Li755qE5b2x5ZONXG4gICAgbGV0IGluZmx1ZW5jZSA9ICcnO1xuICAgIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcobW9udGhXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIGluZmx1ZW5jZSA9IGAke21vbnRoV3VYaW5nfeeUnyR7ZGF5V3VYaW5nfe+8jOWvueaXpeS4u+acieeUn+WKqeS9nOeUqOOAgmA7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UobW9udGhXdVhpbmcsIGRheVd1WGluZykpIHtcbiAgICAgIGluZmx1ZW5jZSA9IGAke21vbnRoV3VYaW5nfeWFiyR7ZGF5V3VYaW5nfe+8jOWvueaXpeS4u+acieWFi+WItuS9nOeUqOOAgmA7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nU2hlbmcoZGF5V3VYaW5nLCBtb250aFd1WGluZykpIHtcbiAgICAgIGluZmx1ZW5jZSA9IGAke2RheVd1WGluZ33nlJ8ke21vbnRoV3VYaW5nfe+8jOaXpeS4u+azhOawlOOAgmA7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzV3VYaW5nS2UoZGF5V3VYaW5nLCBtb250aFd1WGluZykpIHtcbiAgICAgIGluZmx1ZW5jZSA9IGAke2RheVd1WGluZ33lhYske21vbnRoV3VYaW5nfe+8jOaXpeS4u+iAl+awlOOAgmA7XG4gICAgfSBlbHNlIGlmIChtb250aFd1WGluZyA9PT0gZGF5V3VYaW5nKSB7XG4gICAgICBpbmZsdWVuY2UgPSBg5LiO5pel5Li75ZCM5rCU77yM5a+55pel5Li75pyJ5biu5om25L2c55So44CCYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYOWxnuS6jiR7c2Vhc29ufe+8jOS6lOihjOWxniR7bW9udGhXdVhpbmd977yMJHtpbmZsdWVuY2V9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiDmt7vliqDljYHnpZ7lm6DntKBcbiAgICogQHBhcmFtIHRhcmdldFNoaVNoZW4g55uu5qCH5Y2B56We5pWw57uEXG4gICAqIEBwYXJhbSBiYXppSW5mbyDlhavlrZfkv6Hmga9cbiAgICogQHBhcmFtIGZhY3RvcnMg5Zug57Sg5pWw57uEXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhZGRTaGlTaGVuRmFjdG9ycyhcbiAgICB0YXJnZXRTaGlTaGVuOiBzdHJpbmdbXSxcbiAgICBiYXppSW5mbzogQmF6aUluZm8sXG4gICAgZmFjdG9yczoge1xuICAgICAgZmFjdG9yOiBzdHJpbmc7XG4gICAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgICAgY29udHJpYnV0aW9uOiBudW1iZXI7XG4gICAgfVtdXG4gICk6IHZvaWQge1xuICAgIC8vIOiOt+WPluWNgeelnuS/oeaBr1xuICAgIGNvbnN0IHllYXJTaGlTaGVuR2FuID0gYmF6aUluZm8ueWVhclNoaVNoZW5HYW4gfHwgJyc7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuR2FuID0gYmF6aUluZm8ubW9udGhTaGlTaGVuR2FuIHx8ICcnO1xuICAgIGNvbnN0IHRpbWVTaGlTaGVuR2FuID0gYmF6aUluZm8udGltZVNoaVNoZW5HYW4gfHwgJyc7XG5cbiAgICAvLyDojrflj5blnLDmlK/ol4/lubLljYHnpZ7kv6Hmga9cbiAgICBjb25zdCB5ZWFyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby55ZWFyU2hpU2hlblpoaSk7XG4gICAgY29uc3QgbW9udGhTaGlTaGVuWmhpID0gdGhpcy5ub3JtYWxpemVTaGlTaGVuWmhpKGJhemlJbmZvLm1vbnRoU2hpU2hlblpoaSk7XG4gICAgY29uc3QgZGF5U2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5kYXlTaGlTaGVuWmhpKTtcbiAgICBjb25zdCBob3VyU2hpU2hlblpoaSA9IHRoaXMubm9ybWFsaXplU2hpU2hlblpoaShiYXppSW5mby5ob3VyU2hpU2hlblpoaSk7XG5cbiAgICAvLyDmo4Dmn6XlubTlubJcbiAgICBpZiAodGFyZ2V0U2hpU2hlbi5pbmNsdWRlcyh5ZWFyU2hpU2hlbkdhbikpIHtcbiAgICAgIGZhY3RvcnMucHVzaCh7XG4gICAgICAgIGZhY3RvcjogYOW5tOW5siR7eWVhclNoaVNoZW5HYW59YCxcbiAgICAgICAgZGVzY3JpcHRpb246IGDlubTlubLkuLoke3llYXJTaGlTaGVuR2Fufe+8jOWvueagvOWxgOW9ouaIkOaciei0oeeMruOAgmAsXG4gICAgICAgIGNvbnRyaWJ1dGlvbjogMTBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOajgOafpeaciOW5slxuICAgIGlmICh0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKG1vbnRoU2hpU2hlbkdhbikpIHtcbiAgICAgIGZhY3RvcnMucHVzaCh7XG4gICAgICAgIGZhY3RvcjogYOaciOW5siR7bW9udGhTaGlTaGVuR2FufWAsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBg5pyI5bmy5Li6JHttb250aFNoaVNoZW5HYW5977yM5pyI5Luk5b2T5Luk77yM5a+55qC85bGA5b2i5oiQ6LSh54yu6L6D5aSn44CCYCxcbiAgICAgICAgY29udHJpYnV0aW9uOiAyMFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5pe25bmyXG4gICAgaWYgKHRhcmdldFNoaVNoZW4uaW5jbHVkZXModGltZVNoaVNoZW5HYW4pKSB7XG4gICAgICBmYWN0b3JzLnB1c2goe1xuICAgICAgICBmYWN0b3I6IGDml7blubIke3RpbWVTaGlTaGVuR2FufWAsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBg5pe25bmy5Li6JHt0aW1lU2hpU2hlbkdhbn3vvIzlr7nmoLzlsYDlvaLmiJDmnInotKHnjK7jgIJgLFxuICAgICAgICBjb250cmlidXRpb246IDEwXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XlnLDmlK/ol4/lubJcbiAgICBjb25zdCB6aGlGYWN0b3JzOiB7YnJhbmNoOiBzdHJpbmc7IHNoaVNoZW46IHN0cmluZ1tdfVtdID0gW1xuICAgICAgeyBicmFuY2g6ICflubTmlK8nLCBzaGlTaGVuOiB5ZWFyU2hpU2hlblpoaS5maWx0ZXIocyA9PiB0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHMpKSB9LFxuICAgICAgeyBicmFuY2g6ICfmnIjmlK8nLCBzaGlTaGVuOiBtb250aFNoaVNoZW5aaGkuZmlsdGVyKHMgPT4gdGFyZ2V0U2hpU2hlbi5pbmNsdWRlcyhzKSkgfSxcbiAgICAgIHsgYnJhbmNoOiAn5pel5pSvJywgc2hpU2hlbjogZGF5U2hpU2hlblpoaS5maWx0ZXIocyA9PiB0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHMpKSB9LFxuICAgICAgeyBicmFuY2g6ICfml7bmlK8nLCBzaGlTaGVuOiBob3VyU2hpU2hlblpoaS5maWx0ZXIocyA9PiB0YXJnZXRTaGlTaGVuLmluY2x1ZGVzKHMpKSB9XG4gICAgXTtcblxuICAgIHpoaUZhY3RvcnMuZm9yRWFjaChmYWN0b3IgPT4ge1xuICAgICAgaWYgKGZhY3Rvci5zaGlTaGVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZmFjdG9ycy5wdXNoKHtcbiAgICAgICAgICBmYWN0b3I6IGAke2ZhY3Rvci5icmFuY2h96JeP5bmyYCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7ZmFjdG9yLmJyYW5jaH3ol4/lubLkuK3mnIkke2ZhY3Rvci5zaGlTaGVuLmpvaW4oJ+OAgScpfe+8jOWvueagvOWxgOW9ouaIkOaciei+heWKqeS9nOeUqOOAgmAsXG4gICAgICAgICAgY29udHJpYnV0aW9uOiBmYWN0b3IuYnJhbmNoID09PSAn5pyI5pSvJyA/IDE1IDogOFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmo4Dmn6XkuInlkIjlsYBcbiAgICogQHBhcmFtIGJhemlJbmZvIOWFq+Wtl+S/oeaBr1xuICAgKiBAcmV0dXJucyDkuInlkIjlsYDmj4/ov7BcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGNoZWNrU2FuSGVKdShiYXppSW5mbzogQmF6aUluZm8pOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBicmFuY2hlcyA9IFtcbiAgICAgIGJhemlJbmZvLnllYXJCcmFuY2ggfHwgJycsXG4gICAgICBiYXppSW5mby5tb250aEJyYW5jaCB8fCAnJyxcbiAgICAgIGJhemlJbmZvLmRheUJyYW5jaCB8fCAnJyxcbiAgICAgIGJhemlJbmZvLmhvdXJCcmFuY2ggfHwgJydcbiAgICBdLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoICE9PSAnJyk7XG5cbiAgICAvLyDlrprkuYnkuInlkIjlsYBcbiAgICBjb25zdCBzYW5IZUp1TGlzdCA9IFtcbiAgICAgIHsgbmFtZTogJ+WvheWNiOaIjOS4ieWQiOeBq+WxgCcsIGJyYW5jaGVzOiBbJ+WvhScsICfljYgnLCAn5oiMJ10sIHd1WGluZzogJ+eBqycgfSxcbiAgICAgIHsgbmFtZTogJ+eUs+WtkOi+sOS4ieWQiOawtOWxgCcsIGJyYW5jaGVzOiBbJ+eUsycsICflrZAnLCAn6L6wJ10sIHd1WGluZzogJ+awtCcgfSxcbiAgICAgIHsgbmFtZTogJ+S6peWNr+acquS4ieWQiOacqOWxgCcsIGJyYW5jaGVzOiBbJ+S6pScsICflja8nLCAn5pyqJ10sIHd1WGluZzogJ+acqCcgfSxcbiAgICAgIHsgbmFtZTogJ+W3s+mFieS4keS4ieWQiOmHkeWxgCcsIGJyYW5jaGVzOiBbJ+W3sycsICfphYknLCAn5LiRJ10sIHd1WGluZzogJ+mHkScgfVxuICAgIF07XG5cbiAgICAvLyDmo4Dmn6XmmK/lkKbmnInkuInlkIjlsYBcbiAgICBmb3IgKGNvbnN0IHNhbkhlSnUgb2Ygc2FuSGVKdUxpc3QpIHtcbiAgICAgIGNvbnN0IG1hdGNoQ291bnQgPSBzYW5IZUp1LmJyYW5jaGVzLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoZXMuaW5jbHVkZXMoYnJhbmNoKSkubGVuZ3RoO1xuXG4gICAgICBpZiAobWF0Y2hDb3VudCA+PSAyKSB7XG4gICAgICAgIHJldHVybiBg5YWr5a2X5Lit5pyJJHtzYW5IZUp1LmJyYW5jaGVzLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoZXMuaW5jbHVkZXMoYnJhbmNoKSkuam9pbign44CBJyl977yM5b2i5oiQJHttYXRjaENvdW50ID09PSAzID8gJ+WujOaVtCcgOiAn6YOo5YiGJ30ke3NhbkhlSnUubmFtZX3vvIzlop7lvLoke3NhbkhlSnUud3VYaW5nfeeahOWKm+mHj+OAgmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICog5qOA5p+l5LiJ5Lya5bGAXG4gICAqIEBwYXJhbSBiYXppSW5mbyDlhavlrZfkv6Hmga9cbiAgICogQHJldHVybnMg5LiJ5Lya5bGA5o+P6L+wXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjaGVja1Nhbkh1aUp1KGJhemlJbmZvOiBCYXppSW5mbyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGJyYW5jaGVzID0gW1xuICAgICAgYmF6aUluZm8ueWVhckJyYW5jaCB8fCAnJyxcbiAgICAgIGJhemlJbmZvLm1vbnRoQnJhbmNoIHx8ICcnLFxuICAgICAgYmF6aUluZm8uZGF5QnJhbmNoIHx8ICcnLFxuICAgICAgYmF6aUluZm8uaG91ckJyYW5jaCB8fCAnJ1xuICAgIF0uZmlsdGVyKGJyYW5jaCA9PiBicmFuY2ggIT09ICcnKTtcblxuICAgIC8vIOWumuS5ieS4ieS8muWxgFxuICAgIGNvbnN0IHNhbkh1aUp1TGlzdCA9IFtcbiAgICAgIHsgbmFtZTogJ+WvheWNr+i+sOS4ieS8muacqOWxgCcsIGJyYW5jaGVzOiBbJ+WvhScsICflja8nLCAn6L6wJ10sIHd1WGluZzogJ+acqCcgfSxcbiAgICAgIHsgbmFtZTogJ+W3s+WNiOacquS4ieS8mueBq+WxgCcsIGJyYW5jaGVzOiBbJ+W3sycsICfljYgnLCAn5pyqJ10sIHd1WGluZzogJ+eBqycgfSxcbiAgICAgIHsgbmFtZTogJ+eUs+mFieaIjOS4ieS8mumHkeWxgCcsIGJyYW5jaGVzOiBbJ+eUsycsICfphYknLCAn5oiMJ10sIHd1WGluZzogJ+mHkScgfSxcbiAgICAgIHsgbmFtZTogJ+S6peWtkOS4keS4ieS8muawtOWxgCcsIGJyYW5jaGVzOiBbJ+S6pScsICflrZAnLCAn5LiRJ10sIHd1WGluZzogJ+awtCcgfVxuICAgIF07XG5cbiAgICAvLyDmo4Dmn6XmmK/lkKbmnInkuInkvJrlsYBcbiAgICBmb3IgKGNvbnN0IHNhbkh1aUp1IG9mIHNhbkh1aUp1TGlzdCkge1xuICAgICAgY29uc3QgbWF0Y2hDb3VudCA9IHNhbkh1aUp1LmJyYW5jaGVzLmZpbHRlcihicmFuY2ggPT4gYnJhbmNoZXMuaW5jbHVkZXMoYnJhbmNoKSkubGVuZ3RoO1xuXG4gICAgICBpZiAobWF0Y2hDb3VudCA+PSAyKSB7XG4gICAgICAgIHJldHVybiBg5YWr5a2X5Lit5pyJJHtzYW5IdWlKdS5icmFuY2hlcy5maWx0ZXIoYnJhbmNoID0+IGJyYW5jaGVzLmluY2x1ZGVzKGJyYW5jaCkpLmpvaW4oJ+OAgScpfe+8jOW9ouaIkCR7bWF0Y2hDb3VudCA9PT0gMyA/ICflrozmlbQnIDogJ+mDqOWIhid9JHtzYW5IdWlKdS5uYW1lfe+8jOWinuW8uiR7c2FuSHVpSnUud3VYaW5nfeeahOWKm+mHj+OAgmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICog5Yik5pat5LqU6KGM55u455Sf5YWz57O7XG4gICAqIEBwYXJhbSB3dVhpbmcxIOS6lOihjDFcbiAgICogQHBhcmFtIHd1WGluZzIg5LqU6KGMMlxuICAgKiBAcmV0dXJucyDmmK/lkKbnm7jnlJ9cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGlzV3VYaW5nU2hlbmcod3VYaW5nMTogc3RyaW5nLCB3dVhpbmcyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBzaGVuZ1JlbGF0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAn5pyoJzogJ+eBqycsXG4gICAgICAn54GrJzogJ+WcnycsXG4gICAgICAn5ZyfJzogJ+mHkScsXG4gICAgICAn6YeRJzogJ+awtCcsXG4gICAgICAn5rC0JzogJ+acqCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNoZW5nUmVsYXRpb25zW3d1WGluZzFdID09PSB3dVhpbmcyO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreS6lOihjOebuOWFi+WFs+ezu1xuICAgKiBAcGFyYW0gd3VYaW5nMSDkupTooYwxXG4gICAqIEBwYXJhbSB3dVhpbmcyIOS6lOihjDJcbiAgICogQHJldHVybnMg5piv5ZCm55u45YWLXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1d1WGluZ0tlKHd1WGluZzE6IHN0cmluZywgd3VYaW5nMjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qga2VSZWxhdGlvbnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgJ+acqCc6ICflnJ8nLFxuICAgICAgJ+Wcnyc6ICfmsLQnLFxuICAgICAgJ+awtCc6ICfngasnLFxuICAgICAgJ+eBqyc6ICfph5EnLFxuICAgICAgJ+mHkSc6ICfmnKgnXG4gICAgfTtcblxuICAgIHJldHVybiBrZVJlbGF0aW9uc1t3dVhpbmcxXSA9PT0gd3VYaW5nMjtcbiAgfVxufVxuIl19