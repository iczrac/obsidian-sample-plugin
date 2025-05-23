/**
 * 五行服务类
 * 提供五行强度和日主旺衰的详细解释
 */
export class WuXingService {
    /**
     * 获取五行的详细信息
     * @param wuXing 五行名称
     * @returns 五行的详细信息
     */
    static getWuXingInfo(wuXing) {
        const explanations = {
            '金': {
                name: '金',
                explanation: '金五行代表坚强、刚毅、决断力。金过强则过于刚硬，金过弱则缺乏决断力。',
                influence: '金五行强的人，性格刚毅，有决断力，做事果断，但可能过于固执；金五行弱的人，缺乏决断力，优柔寡断，但为人温和。',
                calculation: `金五行强度实际计算过程：

【天干五行】
- 年干庚、辛为金，得分1.2（年干权重）
- 月干庚、辛为金，得分3.0（月干权重，提高以强调月令重要性）
- 日干庚、辛为金，得分3.0（日干权重，日主最重要）
- 时干庚、辛为金，得分1.0（时干权重）

【地支藏干】
- 年支藏庚、辛为金，得分根据藏干数量和权重计算
- 月支藏庚、辛为金，得分根据藏干数量和权重计算
- 日支藏庚、辛为金，得分根据藏干数量和权重计算
- 时支藏庚、辛为金，得分根据藏干数量和权重计算

【纳音五行】
- 年柱纳音为金，得分0.6（年柱纳音权重）
- 月柱纳音为金，得分2.0（月柱纳音权重，提高以强调月令重要性）
- 日柱纳音为金，得分1.5（日柱纳音权重）
- 时柱纳音为金，得分0.5（时柱纳音权重）

【季节调整】
- 秋季（农历七、八、九月）金旺，得分+2.5（旺相系数，提高以强化季节影响）
- 冬季（农历十、十一、十二月）金相，得分+1.2（相旺系数，提高以强化季节影响）
- 春季（农历正、二、三月）金囚，得分-1.2（囚系数，增强以强化季节影响）
- 夏季（农历四、五、六月）金死，得分-1.8（死系数，增强以强化季节影响）

【月令当令加成】
- 秋季金当令，得分+2.0（当令加成，提高以强调月令重要性）
- 冬季金相旺，得分+1.0（相旺加成，提高以强调月令重要性）
- 春季金囚，得分-0.5（囚加成，新增负面调整）
- 夏季金死，得分-0.8（死加成，新增负面调整）

【组合调整】
- 天干五合：乙庚合化金，得分+0.8（天干五合权重，提高以增强组合影响）
- 地支三合：巳酉丑三合金局（完整），得分+1.5（地支三合权重，提高以增强组合影响）
- 地支三合：巳酉丑三合金局（部分），得分+0.9（部分三合权重，新增区分完整度）
- 地支三会：申酉戌三会金局（完整），得分+1.2（地支三会权重，提高以增强组合影响）
- 地支三会：申酉戌三会金局（部分），得分+0.7（部分三会权重，新增区分完整度）

【权重分配说明】
- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性
- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性
- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响
- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响
- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度`
            },
            '木': {
                name: '木',
                explanation: '木五行代表生长、创造、进取心。木过强则固执，木过弱则缺乏进取心。',
                influence: '木五行强的人，有进取心，创造力强，但可能过于固执；木五行弱的人，缺乏进取心，随遇而安，但为人随和。',
                calculation: `木五行强度实际计算过程：

【天干五行】
- 年干甲、乙为木，得分1.2（年干权重）
- 月干甲、乙为木，得分3.0（月干权重，提高以强调月令重要性）
- 日干甲、乙为木，得分3.0（日干权重，日主最重要）
- 时干甲、乙为木，得分1.0（时干权重）

【地支藏干】
- 年支藏甲、乙为木，得分根据藏干数量和权重计算
- 月支藏甲、乙为木，得分根据藏干数量和权重计算
- 日支藏甲、乙为木，得分根据藏干数量和权重计算
- 时支藏甲、乙为木，得分根据藏干数量和权重计算

【纳音五行】
- 年柱纳音为木，得分0.6（年柱纳音权重）
- 月柱纳音为木，得分2.0（月柱纳音权重，提高以强调月令重要性）
- 日柱纳音为木，得分1.5（日柱纳音权重）
- 时柱纳音为木，得分0.5（时柱纳音权重）

【季节调整】
- 春季（农历正、二、三月）木旺，得分+2.5（旺相系数，提高以强化季节影响）
- 冬季（农历十、十一、十二月）木相，得分+1.2（相旺系数，提高以强化季节影响）
- 秋季（农历七、八、九月）木囚，得分-1.2（囚系数，增强以强化季节影响）
- 夏季（农历四、五、六月）木死，得分-1.8（死系数，增强以强化季节影响）

【月令当令加成】
- 春季木当令，得分+2.0（当令加成，提高以强调月令重要性）
- 冬季木相旺，得分+1.0（相旺加成，提高以强调月令重要性）
- 秋季木囚，得分-0.5（囚加成，新增负面调整）
- 夏季木死，得分-0.8（死加成，新增负面调整）

【组合调整】
- 天干五合：丁壬合化木，得分+0.8（天干五合权重，提高以增强组合影响）
- 地支三合：亥卯未三合木局（完整），得分+1.5（地支三合权重，提高以增强组合影响）
- 地支三合：亥卯未三合木局（部分），得分+0.9（部分三合权重，新增区分完整度）
- 地支三会：寅卯辰三会木局（完整），得分+1.2（地支三会权重，提高以增强组合影响）
- 地支三会：寅卯辰三会木局（部分），得分+0.7（部分三会权重，新增区分完整度）

【权重分配说明】
- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性
- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性
- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响
- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响
- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度`
            },
            '水': {
                name: '水',
                explanation: '水五行代表智慧、沟通、适应力。水过强则多虑，水过弱则缺乏智慧。',
                influence: '水五行强的人，聪明智慧，善于沟通，适应力强，但可能过于多虑；水五行弱的人，缺乏智慧，沟通能力差，但为人踏实。',
                calculation: `水五行强度实际计算过程：

【天干五行】
- 年干壬、癸为水，得分1.2（年干权重）
- 月干壬、癸为水，得分3.0（月干权重，提高以强调月令重要性）
- 日干壬、癸为水，得分3.0（日干权重，日主最重要）
- 时干壬、癸为水，得分1.0（时干权重）

【地支藏干】
- 年支藏壬、癸为水，得分根据藏干数量和权重计算
- 月支藏壬、癸为水，得分根据藏干数量和权重计算
- 日支藏壬、癸为水，得分根据藏干数量和权重计算
- 时支藏壬、癸为水，得分根据藏干数量和权重计算

【纳音五行】
- 年柱纳音为水，得分0.6（年柱纳音权重）
- 月柱纳音为水，得分2.0（月柱纳音权重，提高以强调月令重要性）
- 日柱纳音为水，得分1.5（日柱纳音权重）
- 时柱纳音为水，得分0.5（时柱纳音权重）

【季节调整】
- 冬季（农历十、十一、十二月）水旺，得分+2.5（旺相系数，提高以强化季节影响）
- 秋季（农历七、八、九月）水相，得分+1.2（相旺系数，提高以强化季节影响）
- 春季（农历正、二、三月）水囚，得分-1.2（囚系数，增强以强化季节影响）
- 夏季（农历四、五、六月）水死，得分-1.8（死系数，增强以强化季节影响）

【月令当令加成】
- 冬季水当令，得分+2.0（当令加成，提高以强调月令重要性）
- 秋季水相旺，得分+1.0（相旺加成，提高以强调月令重要性）
- 春季水囚，得分-0.5（囚加成，新增负面调整）
- 夏季水死，得分-0.8（死加成，新增负面调整）

【组合调整】
- 天干五合：丙辛合化水，得分+0.8（天干五合权重，提高以增强组合影响）
- 地支三合：申子辰三合水局（完整），得分+1.5（地支三合权重，提高以增强组合影响）
- 地支三合：申子辰三合水局（部分），得分+0.9（部分三合权重，新增区分完整度）
- 地支三会：亥子丑三会水局（完整），得分+1.2（地支三会权重，提高以增强组合影响）
- 地支三会：亥子丑三会水局（部分），得分+0.7（部分三会权重，新增区分完整度）

【权重分配说明】
- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性
- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性
- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响
- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响
- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度`
            },
            '火': {
                name: '火',
                explanation: '火五行代表热情、活力、表现力。火过强则浮躁，火过弱则缺乏热情。',
                influence: '火五行强的人，热情活力，表现力强，但可能过于浮躁；火五行弱的人，缺乏热情，表现力差，但为人稳重。',
                calculation: `火五行强度实际计算过程：

【天干五行】
- 年干丙、丁为火，得分1.2（年干权重）
- 月干丙、丁为火，得分3.0（月干权重，提高以强调月令重要性）
- 日干丙、丁为火，得分3.0（日干权重，日主最重要）
- 时干丙、丁为火，得分1.0（时干权重）

【地支藏干】
- 年支藏丙、丁为火，得分根据藏干数量和权重计算
- 月支藏丙、丁为火，得分根据藏干数量和权重计算
- 日支藏丙、丁为火，得分根据藏干数量和权重计算
- 时支藏丙、丁为火，得分根据藏干数量和权重计算

【纳音五行】
- 年柱纳音为火，得分0.6（年柱纳音权重）
- 月柱纳音为火，得分2.0（月柱纳音权重，提高以强调月令重要性）
- 日柱纳音为火，得分1.5（日柱纳音权重）
- 时柱纳音为火，得分0.5（时柱纳音权重）

【季节调整】
- 夏季（农历四、五、六月）火旺，得分+2.5（旺相系数，提高以强化季节影响）
- 春季（农历正、二、三月）火相，得分+1.2（相旺系数，提高以强化季节影响）
- 秋季（农历七、八、九月）火囚，得分-1.2（囚系数，增强以强化季节影响）
- 冬季（农历十、十一、十二月）火死，得分-1.8（死系数，增强以强化季节影响）

【月令当令加成】
- 夏季火当令，得分+2.0（当令加成，提高以强调月令重要性）
- 春季火相旺，得分+1.0（相旺加成，提高以强调月令重要性）
- 秋季火囚，得分-0.5（囚加成，新增负面调整）
- 冬季火死，得分-0.8（死加成，新增负面调整）

【组合调整】
- 天干五合：戊癸合化火，得分+0.8（天干五合权重，提高以增强组合影响）
- 地支三合：寅午戌三合火局（完整），得分+1.5（地支三合权重，提高以增强组合影响）
- 地支三合：寅午戌三合火局（部分），得分+0.9（部分三合权重，新增区分完整度）
- 地支三会：巳午未三会火局（完整），得分+1.2（地支三会权重，提高以增强组合影响）
- 地支三会：巳午未三会火局（部分），得分+0.7（部分三会权重，新增区分完整度）

【权重分配说明】
- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性
- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性
- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响
- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响
- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度`
            },
            '土': {
                name: '土',
                explanation: '土五行代表稳重、踏实、包容力。土过强则保守，土过弱则缺乏稳定性。',
                influence: '土五行强的人，稳重踏实，包容力强，但可能过于保守；土五行弱的人，缺乏稳定性，做事不踏实，但为人灵活。',
                calculation: `土五行强度实际计算过程：

【天干五行】
- 年干戊、己为土，得分1.2（年干权重）
- 月干戊、己为土，得分3.0（月干权重，提高以强调月令重要性）
- 日干戊、己为土，得分3.0（日干权重，日主最重要）
- 时干戊、己为土，得分1.0（时干权重）

【地支藏干】
- 年支藏戊、己为土，得分根据藏干数量和权重计算
- 月支藏戊、己为土，得分根据藏干数量和权重计算
- 日支藏戊、己为土，得分根据藏干数量和权重计算
- 时支藏戊、己为土，得分根据藏干数量和权重计算

【纳音五行】
- 年柱纳音为土，得分0.6（年柱纳音权重）
- 月柱纳音为土，得分2.0（月柱纳音权重，提高以强调月令重要性）
- 日柱纳音为土，得分1.5（日柱纳音权重）
- 时柱纳音为土，得分0.5（时柱纳音权重）

【季节调整】
- 四季末月（农历三、六、九、十二月）土旺，得分+2.5（旺相系数，提高以强化季节影响）
- 夏季（农历四、五、六月）土相，得分+1.2（相旺系数，提高以强化季节影响）
- 冬季（农历十、十一、十二月）土囚，得分-1.2（囚系数，增强以强化季节影响）
- 秋季（农历七、八、九月）土死，得分-1.8（死系数，增强以强化季节影响）

【月令当令加成】
- 四季末月土当令，得分+2.0（当令加成，提高以强调月令重要性）
- 夏季土相旺，得分+1.0（相旺加成，提高以强调月令重要性）
- 冬季土囚，得分-0.5（囚加成，新增负面调整）
- 秋季土死，得分-0.8（死加成，新增负面调整）

【组合调整】
- 天干五合：甲己合化土，得分+0.8（天干五合权重，提高以增强组合影响）
- 地支三合：辰戌丑三合土局（完整），得分+1.5（地支三合权重，提高以增强组合影响）
- 地支三合：辰戌丑三合土局（部分），得分+0.9（部分三合权重，新增区分完整度）
- 地支三会：辰巳午三会土局（完整），得分+1.2（地支三会权重，提高以增强组合影响）
- 地支三会：辰巳午三会土局（部分），得分+0.7（部分三会权重，新增区分完整度）

【权重分配说明】
- 天干权重：年干(1.2) < 月干(3.0) = 日干(3.0) > 时干(1.0)，突出月令和日主重要性
- 地支藏干权重：年支(0.8) < 月支(2.5) > 日支(2.2) > 时支(0.7)，突出月令重要性
- 纳音五行权重：年柱(0.6) < 月柱(2.0) > 日柱(1.5) > 时柱(0.5)，突出月令重要性
- 季节调整：旺(+2.5)、相(+1.2)、平(0)、囚(-1.2)、死(-1.8)，强化季节影响
- 月令加成：当令(+2.0)、相旺(+1.0)、平和(0)、囚(-0.5)、死(-0.8)，全面考虑月令影响
- 组合关系：天干五合(+0.8)、地支三合(+1.5/+0.9)、地支三会(+1.2/+0.7)，区分完整度`
            }
        };
        return explanations[wuXing] || null;
    }
    /**
     * 获取日主旺衰的详细信息
     * @param riZhu 日主旺衰状态
     * @returns 日主旺衰的详细信息
     */
    static getRiZhuInfo(riZhu) {
        const explanations = {
            '旺': {
                name: '旺',
                explanation: '日主旺表示命主的五行力量强盛，个性刚强，自信心强，有领导能力，但可能过于自信或固执。',
                influence: '日主旺的人，性格刚强，自信心强，有领导能力，做事果断，但可能过于自信或固执，不易接受他人意见。',
                calculation: `日主旺衰计算方法：

【基础计算】
1. 计算日主五行在八字中的强度
   - 首先确定日主五行（日干所属五行）
   - 计算该五行在八字中的总得分（按照五行强度计算方法）
   - 计算所有五行的总得分
   - 计算日主五行的相对强度：日主五行得分/所有五行总得分

【季节影响】
2. 考虑季节对日主五行的影响：
   - 春季（正、二、三月）：
     * 木旺(+0.3)、火相(+0.15)、土休(0)、金囚(-0.15)、水死(-0.3)
   - 夏季（四、五、六月）：
     * 火旺(+0.3)、土相(+0.15)、金休(0)、水囚(-0.15)、木死(-0.3)
   - 秋季（七、八、九月）：
     * 金旺(+0.3)、水相(+0.15)、木休(0)、火囚(-0.15)、土死(-0.3)
   - 冬季（十、十一、十二月）：
     * 水旺(+0.3)、木相(+0.15)、火休(0)、土囚(-0.15)、金死(-0.3)

【生克关系】
3. 考虑月支对日主的生克关系
   - 月支五行生日主：+0.2
   - 月支五行克日主：-0.2
   - 日主五行克月支：+0.1
   - 日主五行生月支：-0.1

【组合影响】
4. 考虑地支三合局对日主的影响
   - 三合局五行生日主：+0.15
   - 三合局五行克日主：-0.15
   - 日主五行克三合局：+0.1
   - 日主五行生三合局：-0.1

5. 考虑天干五合对日主的影响
   - 五合化五行生日主：+0.1
   - 五合化五行克日主：-0.1
   - 日主参与五合：-0.05（日主受牵制）

6. 考虑纳音五行对日主的影响
   - 日柱纳音与日主五行相同：+0.1
   - 日柱纳音生日主五行：+0.05
   - 日柱纳音克日主五行：-0.05

【计算示例】
假设八字为：甲子 乙丑 丙寅 丁卯
- 日主为丙火
- 月令为丑月（冬季）
- 日主五行强度计算：丙火得分为3.5分，总分为20分，相对强度为0.175
- 季节影响：冬季火休，调整系数为0
- 月支丑土克火：-0.2
- 地支三合：子、丑可能与辰形成三合水局，水克火：-0.15
- 天干五合：无
- 纳音五行：丙寅为炉中火，与日主同类：+0.1

最终得分：0.175 + 0 - 0.2 - 0.15 + 0.1 = -0.075

【旺衰判定】
7. 归一化得分，计算最终旺衰状态：
   - 旺：得分 > 0.6
   - 相：0.3 < 得分 ≤ 0.6
   - 休：-0.3 ≤ 得分 ≤ 0.3
   - 囚：-0.6 ≤ 得分 < -0.3
   - 死：得分 < -0.6

根据计算结果-0.075，日主为"休"。`
            },
            '相': {
                name: '相',
                explanation: '日主相表示命主的五行力量较强，性格较为平衡，有自信但不过分，能够适应各种环境。',
                influence: '日主相的人，性格较为平衡，有自信但不过分，能够适应各种环境，做事有主见但也能接受他人意见。',
                calculation: `日主旺衰计算方法：

【基础计算】
1. 计算日主五行在八字中的强度
   - 首先确定日主五行（日干所属五行）
   - 计算该五行在八字中的总得分（按照五行强度计算方法）
   - 计算所有五行的总得分
   - 计算日主五行的相对强度：日主五行得分/所有五行总得分

【季节影响】
2. 考虑季节对日主五行的影响：
   - 春季（正、二、三月）：
     * 木旺(+0.3)、火相(+0.15)、土休(0)、金囚(-0.15)、水死(-0.3)
   - 夏季（四、五、六月）：
     * 火旺(+0.3)、土相(+0.15)、金休(0)、水囚(-0.15)、木死(-0.3)
   - 秋季（七、八、九月）：
     * 金旺(+0.3)、水相(+0.15)、木休(0)、火囚(-0.15)、土死(-0.3)
   - 冬季（十、十一、十二月）：
     * 水旺(+0.3)、木相(+0.15)、火休(0)、土囚(-0.15)、金死(-0.3)

【生克关系】
3. 考虑月支对日主的生克关系
   - 月支五行生日主：+0.2
   - 月支五行克日主：-0.2
   - 日主五行克月支：+0.1
   - 日主五行生月支：-0.1

【组合影响】
4. 考虑地支三合局对日主的影响
   - 三合局五行生日主：+0.15
   - 三合局五行克日主：-0.15
   - 日主五行克三合局：+0.1
   - 日主五行生三合局：-0.1

5. 考虑天干五合对日主的影响
   - 五合化五行生日主：+0.1
   - 五合化五行克日主：-0.1
   - 日主参与五合：-0.05（日主受牵制）

6. 考虑纳音五行对日主的影响
   - 日柱纳音与日主五行相同：+0.1
   - 日柱纳音生日主五行：+0.05
   - 日柱纳音克日主五行：-0.05

【计算示例】
假设八字为：甲子 乙丑 戊午 己未
- 日主为戊土
- 月令为丑月（冬季）
- 日主五行强度计算：戊土得分为5.5分，总分为22分，相对强度为0.25
- 季节影响：冬季土囚，调整系数为-0.15
- 月支丑土生土：+0.2
- 地支三合：无明显三合
- 天干五合：无
- 纳音五行：戊午为天上火，火生土：+0.05

最终得分：0.25 - 0.15 + 0.2 + 0.05 = 0.35

【旺衰判定】
7. 归一化得分，计算最终旺衰状态：
   - 旺：得分 > 0.6
   - 相：0.3 < 得分 ≤ 0.6
   - 休：-0.3 ≤ 得分 ≤ 0.3
   - 囚：-0.6 ≤ 得分 < -0.3
   - 死：得分 < -0.6

根据计算结果0.35，日主为"相"。`
            },
            '休': {
                name: '休',
                explanation: '日主休表示命主的五行力量适中偏弱，性格温和，适应力强，但可能缺乏主见或决断力。',
                influence: '日主休的人，性格温和，适应力强，能够融入各种环境，但可能缺乏主见或决断力，容易受他人影响。',
                calculation: `日主旺衰计算方法：

【基础计算】
1. 计算日主五行在八字中的强度
   - 首先确定日主五行（日干所属五行）
   - 计算该五行在八字中的总得分（按照五行强度计算方法）
   - 计算所有五行的总得分
   - 计算日主五行的相对强度：日主五行得分/所有五行总得分

【季节影响】
2. 考虑季节对日主五行的影响：
   - 春季（正、二、三月）：
     * 木旺(+0.3)、火相(+0.15)、土休(0)、金囚(-0.15)、水死(-0.3)
   - 夏季（四、五、六月）：
     * 火旺(+0.3)、土相(+0.15)、金休(0)、水囚(-0.15)、木死(-0.3)
   - 秋季（七、八、九月）：
     * 金旺(+0.3)、水相(+0.15)、木休(0)、火囚(-0.15)、土死(-0.3)
   - 冬季（十、十一、十二月）：
     * 水旺(+0.3)、木相(+0.15)、火休(0)、土囚(-0.15)、金死(-0.3)

【生克关系】
3. 考虑月支对日主的生克关系
   - 月支五行生日主：+0.2
   - 月支五行克日主：-0.2
   - 日主五行克月支：+0.1
   - 日主五行生月支：-0.1

【组合影响】
4. 考虑地支三合局对日主的影响
   - 三合局五行生日主：+0.15
   - 三合局五行克日主：-0.15
   - 日主五行克三合局：+0.1
   - 日主五行生三合局：-0.1

5. 考虑天干五合对日主的影响
   - 五合化五行生日主：+0.1
   - 五合化五行克日主：-0.1
   - 日主参与五合：-0.05（日主受牵制）

6. 考虑纳音五行对日主的影响
   - 日柱纳音与日主五行相同：+0.1
   - 日柱纳音生日主五行：+0.05
   - 日柱纳音克日主五行：-0.05

【计算示例】
假设八字为：丙子 丁丑 戊寅 己卯
- 日主为戊土
- 月令为丑月（冬季）
- 日主五行强度计算：戊土得分为4.0分，总分为20分，相对强度为0.2
- 季节影响：冬季土囚，调整系数为-0.15
- 月支丑土生土：+0.2
- 地支三合：寅卯可能与未形成三合木局，木克土：-0.15
- 天干五合：无
- 纳音五行：戊寅为城墙土，与日主同类：+0.1

最终得分：0.2 - 0.15 + 0.2 - 0.15 + 0.1 = 0.2

【旺衰判定】
7. 归一化得分，计算最终旺衰状态：
   - 旺：得分 > 0.6
   - 相：0.3 < 得分 ≤ 0.6
   - 休：-0.3 ≤ 得分 ≤ 0.3
   - 囚：-0.6 ≤ 得分 < -0.3
   - 死：得分 < -0.6

根据计算结果0.2，日主为"休"。`
            },
            '囚': {
                name: '囚',
                explanation: '日主囚表示命主的五行力量较弱，个性较为内向，自信心不足，容易受外界影响。',
                influence: '日主囚的人，个性较为内向，自信心不足，容易受外界影响，做事缺乏主见，但为人谦和，善于倾听。',
                calculation: `日主旺衰计算方法：

【基础计算】
1. 计算日主五行在八字中的强度
   - 首先确定日主五行（日干所属五行）
   - 计算该五行在八字中的总得分（按照五行强度计算方法）
   - 计算所有五行的总得分
   - 计算日主五行的相对强度：日主五行得分/所有五行总得分

【季节影响】
2. 考虑季节对日主五行的影响：
   - 春季（正、二、三月）：
     * 木旺(+0.3)、火相(+0.15)、土休(0)、金囚(-0.15)、水死(-0.3)
   - 夏季（四、五、六月）：
     * 火旺(+0.3)、土相(+0.15)、金休(0)、水囚(-0.15)、木死(-0.3)
   - 秋季（七、八、九月）：
     * 金旺(+0.3)、水相(+0.15)、木休(0)、火囚(-0.15)、土死(-0.3)
   - 冬季（十、十一、十二月）：
     * 水旺(+0.3)、木相(+0.15)、火休(0)、土囚(-0.15)、金死(-0.3)

【生克关系】
3. 考虑月支对日主的生克关系
   - 月支五行生日主：+0.2
   - 月支五行克日主：-0.2
   - 日主五行克月支：+0.1
   - 日主五行生月支：-0.1

【组合影响】
4. 考虑地支三合局对日主的影响
   - 三合局五行生日主：+0.15
   - 三合局五行克日主：-0.15
   - 日主五行克三合局：+0.1
   - 日主五行生三合局：-0.1

5. 考虑天干五合对日主的影响
   - 五合化五行生日主：+0.1
   - 五合化五行克日主：-0.1
   - 日主参与五合：-0.05（日主受牵制）

6. 考虑纳音五行对日主的影响
   - 日柱纳音与日主五行相同：+0.1
   - 日柱纳音生日主五行：+0.05
   - 日柱纳音克日主五行：-0.05

【计算示例】
假设八字为：甲子 乙丑 丙寅 丁卯
- 日主为丙火
- 月令为丑月（冬季）
- 日主五行强度计算：丙火得分为2.5分，总分为20分，相对强度为0.125
- 季节影响：冬季火囚，调整系数为-0.15
- 月支丑土克火：-0.2
- 地支三合：寅卯可能与未形成三合木局，木生火：+0.15
- 天干五合：无
- 纳音五行：丙寅为炉中火，与日主同类：+0.1

最终得分：0.125 - 0.15 - 0.2 + 0.15 + 0.1 = -0.475

【旺衰判定】
7. 归一化得分，计算最终旺衰状态：
   - 旺：得分 > 0.6
   - 相：0.3 < 得分 ≤ 0.6
   - 休：-0.3 ≤ 得分 ≤ 0.3
   - 囚：-0.6 ≤ 得分 < -0.3
   - 死：得分 < -0.6

根据计算结果-0.475，日主为"囚"。`
            },
            '死': {
                name: '死',
                explanation: '日主死表示命主的五行力量极弱，个性可能过于软弱，缺乏自信，容易受制于人。',
                influence: '日主死的人，个性可能过于软弱，缺乏自信，容易受制于人，做事缺乏主见，但为人谦和，善于倾听，适合辅助性工作。',
                calculation: `日主旺衰计算方法：

【基础计算】
1. 计算日主五行在八字中的强度
   - 首先确定日主五行（日干所属五行）
   - 计算该五行在八字中的总得分（按照五行强度计算方法）
   - 计算所有五行的总得分
   - 计算日主五行的相对强度：日主五行得分/所有五行总得分

【季节影响】
2. 考虑季节对日主五行的影响：
   - 春季（正、二、三月）：
     * 木旺(+0.3)、火相(+0.15)、土休(0)、金囚(-0.15)、水死(-0.3)
   - 夏季（四、五、六月）：
     * 火旺(+0.3)、土相(+0.15)、金休(0)、水囚(-0.15)、木死(-0.3)
   - 秋季（七、八、九月）：
     * 金旺(+0.3)、水相(+0.15)、木休(0)、火囚(-0.15)、土死(-0.3)
   - 冬季（十、十一、十二月）：
     * 水旺(+0.3)、木相(+0.15)、火休(0)、土囚(-0.15)、金死(-0.3)

【生克关系】
3. 考虑月支对日主的生克关系
   - 月支五行生日主：+0.2
   - 月支五行克日主：-0.2
   - 日主五行克月支：+0.1
   - 日主五行生月支：-0.1

【组合影响】
4. 考虑地支三合局对日主的影响
   - 三合局五行生日主：+0.15
   - 三合局五行克日主：-0.15
   - 日主五行克三合局：+0.1
   - 日主五行生三合局：-0.1

5. 考虑天干五合对日主的影响
   - 五合化五行生日主：+0.1
   - 五合化五行克日主：-0.1
   - 日主参与五合：-0.05（日主受牵制）

6. 考虑纳音五行对日主的影响
   - 日柱纳音与日主五行相同：+0.1
   - 日柱纳音生日主五行：+0.05
   - 日柱纳音克日主五行：-0.05

【计算示例】
假设八字为：壬子 癸丑 甲寅 乙卯
- 日主为甲木
- 月令为丑月（冬季）
- 日主五行强度计算：甲木得分为1.5分，总分为25分，相对强度为0.06
- 季节影响：冬季木相，调整系数为+0.15
- 月支丑土克木：-0.2
- 地支三合：子丑可能与辰形成三合水局，水生木：+0.15
- 天干五合：无
- 纳音五行：甲寅为大溪水，水生木：+0.05

最终得分：0.06 + 0.15 - 0.2 + 0.15 + 0.05 = -0.79

【旺衰判定】
7. 归一化得分，计算最终旺衰状态：
   - 旺：得分 > 0.6
   - 相：0.3 < 得分 ≤ 0.6
   - 休：-0.3 ≤ 得分 ≤ 0.3
   - 囚：-0.6 ≤ 得分 < -0.3
   - 死：得分 < -0.6

根据计算结果-0.79，日主为"死"。`
            }
        };
        return explanations[riZhu] || null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3VYaW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIld1WGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEI7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBYztRQUN4QyxNQUFNLFlBQVksR0FBcUc7WUFDckgsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSxvQ0FBb0M7Z0JBQ2pELFNBQVMsRUFBRSx3REFBd0Q7Z0JBQ25FLFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dEQTZDbUM7YUFDakQ7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsU0FBUyxFQUFFLG1EQUFtRDtnQkFDOUQsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0RBNkNtQzthQUNqRDtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsaUNBQWlDO2dCQUM5QyxTQUFTLEVBQUUsd0RBQXdEO2dCQUNuRSxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3REE2Q21DO2FBQ2pEO1lBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSxpQ0FBaUM7Z0JBQzlDLFNBQVMsRUFBRSxrREFBa0Q7Z0JBQzdELFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dEQTZDbUM7YUFDakQ7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsU0FBUyxFQUFFLG9EQUFvRDtnQkFDL0QsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0RBNkNtQzthQUNqRDtTQUNGLENBQUM7UUFFRixPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQWE7UUFDdEMsTUFBTSxZQUFZLEdBQXFHO1lBQ3JILEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsNENBQTRDO2dCQUN6RCxTQUFTLEVBQUUsaURBQWlEO2dCQUM1RCxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQWlFQTthQUNkO1lBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSx5Q0FBeUM7Z0JBQ3RELFNBQVMsRUFBRSwrQ0FBK0M7Z0JBQzFELFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBaUVGO2FBQ1o7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLHlDQUF5QztnQkFDdEQsU0FBUyxFQUFFLCtDQUErQztnQkFDMUQsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFpRUg7YUFDWDtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsc0NBQXNDO2dCQUNuRCxTQUFTLEVBQUUsK0NBQStDO2dCQUMxRCxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQWlFQTthQUNkO1lBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSxzQ0FBc0M7Z0JBQ25ELFNBQVMsRUFBRSx1REFBdUQ7Z0JBQ2xFLFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBaUVEO2FBQ2I7U0FDRixDQUFDO1FBRUYsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3JDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5LqU6KGM5pyN5Yqh57G7XG4gKiDmj5DkvpvkupTooYzlvLrluqblkozml6XkuLvml7roobDnmoTor6bnu4bop6Pph4pcbiAqL1xuZXhwb3J0IGNsYXNzIFd1WGluZ1NlcnZpY2Uge1xuICAvKipcbiAgICog6I635Y+W5LqU6KGM55qE6K+m57uG5L+h5oGvXG4gICAqIEBwYXJhbSB3dVhpbmcg5LqU6KGM5ZCN56ewXG4gICAqIEByZXR1cm5zIOS6lOihjOeahOivpue7huS/oeaBr1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRXdVhpbmdJbmZvKHd1WGluZzogc3RyaW5nKTogeyBuYW1lOiBzdHJpbmc7IGV4cGxhbmF0aW9uOiBzdHJpbmc7IGluZmx1ZW5jZTogc3RyaW5nOyBjYWxjdWxhdGlvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBjb25zdCBleHBsYW5hdGlvbnM6IHsgW2tleTogc3RyaW5nXTogeyBuYW1lOiBzdHJpbmc7IGV4cGxhbmF0aW9uOiBzdHJpbmc7IGluZmx1ZW5jZTogc3RyaW5nOyBjYWxjdWxhdGlvbjogc3RyaW5nIH0gfSA9IHtcbiAgICAgICfph5EnOiB7XG4gICAgICAgIG5hbWU6ICfph5EnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+mHkeS6lOihjOS7o+ihqOWdmuW8uuOAgeWImuavheOAgeWGs+aWreWKm+OAgumHkei/h+W8uuWImei/h+S6juWImuehrO+8jOmHkei/h+W8seWImee8uuS5j+WGs+aWreWKm+OAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+mHkeS6lOihjOW8uueahOS6uu+8jOaAp+agvOWImuavhe+8jOacieWGs+aWreWKm++8jOWBmuS6i+aenOaWre+8jOS9huWPr+iDvei/h+S6juWbuuaJp++8m+mHkeS6lOihjOW8seeahOS6uu+8jOe8uuS5j+WGs+aWreWKm++8jOS8mOaflOWvoeaWre+8jOS9huS4uuS6uua4qeWSjOOAgicsXG4gICAgICAgIGNhbGN1bGF0aW9uOiBg6YeR5LqU6KGM5by65bqm5a6e6ZmF6K6h566X6L+H56iL77yaXG5cbuOAkOWkqeW5suS6lOihjOOAkVxuLSDlubTlubLluprjgIHovpvkuLrph5HvvIzlvpfliIYxLjLvvIjlubTlubLmnYPph43vvIlcbi0g5pyI5bmy5bqa44CB6L6b5Li66YeR77yM5b6X5YiGMy4w77yI5pyI5bmy5p2D6YeN77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOaXpeW5suW6muOAgei+m+S4uumHke+8jOW+l+WIhjMuMO+8iOaXpeW5suadg+mHje+8jOaXpeS4u+acgOmHjeimge+8iVxuLSDml7blubLluprjgIHovpvkuLrph5HvvIzlvpfliIYxLjDvvIjml7blubLmnYPph43vvIlcblxu44CQ5Zyw5pSv6JeP5bmy44CRXG4tIOW5tOaUr+iXj+W6muOAgei+m+S4uumHke+8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuLSDmnIjmlK/ol4/luprjgIHovpvkuLrph5HvvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcbi0g5pel5pSv6JeP5bqa44CB6L6b5Li66YeR77yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG4tIOaXtuaUr+iXj+W6muOAgei+m+S4uumHke+8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuXG7jgJDnurPpn7PkupTooYzjgJFcbi0g5bm05p+x57qz6Z+z5Li66YeR77yM5b6X5YiGMC4277yI5bm05p+x57qz6Z+z5p2D6YeN77yJXG4tIOaciOafsee6s+mfs+S4uumHke+8jOW+l+WIhjIuMO+8iOaciOafsee6s+mfs+adg+mHje+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDml6Xmn7HnurPpn7PkuLrph5HvvIzlvpfliIYxLjXvvIjml6Xmn7HnurPpn7PmnYPph43vvIlcbi0g5pe25p+x57qz6Z+z5Li66YeR77yM5b6X5YiGMC4177yI5pe25p+x57qz6Z+z5p2D6YeN77yJXG5cbuOAkOWto+iKguiwg+aVtOOAkVxuLSDnp4vlraPvvIjlhpzljobkuIPjgIHlhavjgIHkuZ3mnIjvvInph5Hml7rvvIzlvpfliIYrMi4177yI5pe655u457O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG4tIOWGrOWto++8iOWGnOWOhuWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8iemHkeebuO+8jOW+l+WIhisxLjLvvIjnm7jml7rns7vmlbDvvIzmj5Dpq5jku6XlvLrljJblraPoioLlvbHlk43vvIlcbi0g5pil5a2j77yI5Yac5Y6G5q2j44CB5LqM44CB5LiJ5pyI77yJ6YeR5Zua77yM5b6X5YiGLTEuMu+8iOWbmuezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxuLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInph5HmrbvvvIzlvpfliIYtMS4477yI5q2757O75pWw77yM5aKe5by65Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG5cbuOAkOaciOS7pOW9k+S7pOWKoOaIkOOAkVxuLSDnp4vlraPph5HlvZPku6TvvIzlvpfliIYrMi4w77yI5b2T5Luk5Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOWGrOWto+mHkeebuOaXuu+8jOW+l+WIhisxLjDvvIjnm7jml7rliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g5pil5a2j6YeR5Zua77yM5b6X5YiGLTAuNe+8iOWbmuWKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxuLSDlpI/lraPph5HmrbvvvIzlvpfliIYtMC4477yI5q275Yqg5oiQ77yM5paw5aKe6LSf6Z2i6LCD5pW077yJXG5cbuOAkOe7hOWQiOiwg+aVtOOAkVxuLSDlpKnlubLkupTlkIjvvJrkuZnluprlkIjljJbph5HvvIzlvpfliIYrMC4477yI5aSp5bmy5LqU5ZCI5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieWQiO+8muW3s+mFieS4keS4ieWQiOmHkeWxgO+8iOWujOaVtO+8ie+8jOW+l+WIhisxLjXvvIjlnLDmlK/kuInlkIjmnYPph43vvIzmj5Dpq5jku6Xlop7lvLrnu4TlkIjlvbHlk43vvIlcbi0g5Zyw5pSv5LiJ5ZCI77ya5bez6YWJ5LiR5LiJ5ZCI6YeR5bGA77yI6YOo5YiG77yJ77yM5b6X5YiGKzAuOe+8iOmDqOWIhuS4ieWQiOadg+mHje+8jOaWsOWinuWMuuWIhuWujOaVtOW6pu+8iVxuLSDlnLDmlK/kuInkvJrvvJrnlLPphYnmiIzkuInkvJrph5HlsYDvvIjlrozmlbTvvInvvIzlvpfliIYrMS4y77yI5Zyw5pSv5LiJ5Lya5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieS8mu+8mueUs+mFieaIjOS4ieS8mumHkeWxgO+8iOmDqOWIhu+8ie+8jOW+l+WIhiswLjfvvIjpg6jliIbkuInkvJrmnYPph43vvIzmlrDlop7ljLrliIblrozmlbTluqbvvIlcblxu44CQ5p2D6YeN5YiG6YWN6K+05piO44CRXG4tIOWkqeW5suadg+mHje+8muW5tOW5sigxLjIpIDwg5pyI5bmyKDMuMCkgPSDml6XlubIoMy4wKSA+IOaXtuW5sigxLjAp77yM56qB5Ye65pyI5Luk5ZKM5pel5Li76YeN6KaB5oCnXG4tIOWcsOaUr+iXj+W5suadg+mHje+8muW5tOaUrygwLjgpIDwg5pyI5pSvKDIuNSkgPiDml6XmlK8oMi4yKSA+IOaXtuaUrygwLjcp77yM56qB5Ye65pyI5Luk6YeN6KaB5oCnXG4tIOe6s+mfs+S6lOihjOadg+mHje+8muW5tOafsSgwLjYpIDwg5pyI5p+xKDIuMCkgPiDml6Xmn7EoMS41KSA+IOaXtuafsSgwLjUp77yM56qB5Ye65pyI5Luk6YeN6KaB5oCnXG4tIOWto+iKguiwg+aVtO+8muaXuigrMi41KeOAgeebuCgrMS4yKeOAgeW5sygwKeOAgeWbmigtMS4yKeOAgeatuygtMS44Ke+8jOW8uuWMluWto+iKguW9seWTjVxuLSDmnIjku6TliqDmiJDvvJrlvZPku6QoKzIuMCnjgIHnm7jml7ooKzEuMCnjgIHlubPlkowoMCnjgIHlm5ooLTAuNSnjgIHmrbsoLTAuOCnvvIzlhajpnaLogIPomZHmnIjku6TlvbHlk41cbi0g57uE5ZCI5YWz57O777ya5aSp5bmy5LqU5ZCIKCswLjgp44CB5Zyw5pSv5LiJ5ZCIKCsxLjUvKzAuOSnjgIHlnLDmlK/kuInkvJooKzEuMi8rMC43Ke+8jOWMuuWIhuWujOaVtOW6pmBcbiAgICAgIH0sXG4gICAgICAn5pyoJzoge1xuICAgICAgICBuYW1lOiAn5pyoJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfmnKjkupTooYzku6PooajnlJ/plb/jgIHliJvpgKDjgIHov5vlj5blv4PjgILmnKjov4flvLrliJnlm7rmiafvvIzmnKjov4flvLHliJnnvLrkuY/ov5vlj5blv4PjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfmnKjkupTooYzlvLrnmoTkurrvvIzmnInov5vlj5blv4PvvIzliJvpgKDlipvlvLrvvIzkvYblj6/og73ov4fkuo7lm7rmiafvvJvmnKjkupTooYzlvLHnmoTkurrvvIznvLrkuY/ov5vlj5blv4PvvIzpmo/pgYfogIzlronvvIzkvYbkuLrkurrpmo/lkozjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOacqOS6lOihjOW8uuW6puWunumZheiuoeeul+i/h+eoi++8mlxuXG7jgJDlpKnlubLkupTooYzjgJFcbi0g5bm05bmy55Sy44CB5LmZ5Li65pyo77yM5b6X5YiGMS4y77yI5bm05bmy5p2D6YeN77yJXG4tIOaciOW5sueUsuOAgeS5meS4uuacqO+8jOW+l+WIhjMuMO+8iOaciOW5suadg+mHje+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDml6XlubLnlLLjgIHkuZnkuLrmnKjvvIzlvpfliIYzLjDvvIjml6XlubLmnYPph43vvIzml6XkuLvmnIDph43opoHvvIlcbi0g5pe25bmy55Sy44CB5LmZ5Li65pyo77yM5b6X5YiGMS4w77yI5pe25bmy5p2D6YeN77yJXG5cbuOAkOWcsOaUr+iXj+W5suOAkVxuLSDlubTmlK/ol4/nlLLjgIHkuZnkuLrmnKjvvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcbi0g5pyI5pSv6JeP55Sy44CB5LmZ5Li65pyo77yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG4tIOaXpeaUr+iXj+eUsuOAgeS5meS4uuacqO+8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuLSDml7bmlK/ol4/nlLLjgIHkuZnkuLrmnKjvvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcblxu44CQ57qz6Z+z5LqU6KGM44CRXG4tIOW5tOafsee6s+mfs+S4uuacqO+8jOW+l+WIhjAuNu+8iOW5tOafsee6s+mfs+adg+mHje+8iVxuLSDmnIjmn7HnurPpn7PkuLrmnKjvvIzlvpfliIYyLjDvvIjmnIjmn7HnurPpn7PmnYPph43vvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g5pel5p+x57qz6Z+z5Li65pyo77yM5b6X5YiGMS4177yI5pel5p+x57qz6Z+z5p2D6YeN77yJXG4tIOaXtuafsee6s+mfs+S4uuacqO+8jOW+l+WIhjAuNe+8iOaXtuafsee6s+mfs+adg+mHje+8iVxuXG7jgJDlraPoioLosIPmlbTjgJFcbi0g5pil5a2j77yI5Yac5Y6G5q2j44CB5LqM44CB5LiJ5pyI77yJ5pyo5pe677yM5b6X5YiGKzIuNe+8iOaXuuebuOezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxuLSDlhqzlraPvvIjlhpzljobljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInmnKjnm7jvvIzlvpfliIYrMS4y77yI55u45pe657O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG4tIOeni+Wto++8iOWGnOWOhuS4g+OAgeWFq+OAgeS5neaciO+8ieacqOWbmu+8jOW+l+WIhi0xLjLvvIjlm5rns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcbi0g5aSP5a2j77yI5Yac5Y6G5Zub44CB5LqU44CB5YWt5pyI77yJ5pyo5q2777yM5b6X5YiGLTEuOO+8iOatu+ezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxuXG7jgJDmnIjku6TlvZPku6TliqDmiJDjgJFcbi0g5pil5a2j5pyo5b2T5Luk77yM5b6X5YiGKzIuMO+8iOW9k+S7pOWKoOaIkO+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDlhqzlraPmnKjnm7jml7rvvIzlvpfliIYrMS4w77yI55u45pe65Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOeni+Wto+acqOWbmu+8jOW+l+WIhi0wLjXvvIjlm5rliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcbi0g5aSP5a2j5pyo5q2777yM5b6X5YiGLTAuOO+8iOatu+WKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxuXG7jgJDnu4TlkIjosIPmlbTjgJFcbi0g5aSp5bmy5LqU5ZCI77ya5LiB5aOs5ZCI5YyW5pyo77yM5b6X5YiGKzAuOO+8iOWkqeW5suS6lOWQiOadg+mHje+8jOaPkOmrmOS7peWinuW8uue7hOWQiOW9seWTje+8iVxuLSDlnLDmlK/kuInlkIjvvJrkuqXlja/mnKrkuInlkIjmnKjlsYDvvIjlrozmlbTvvInvvIzlvpfliIYrMS4177yI5Zyw5pSv5LiJ5ZCI5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieWQiO+8muS6peWNr+acquS4ieWQiOacqOWxgO+8iOmDqOWIhu+8ie+8jOW+l+WIhiswLjnvvIjpg6jliIbkuInlkIjmnYPph43vvIzmlrDlop7ljLrliIblrozmlbTluqbvvIlcbi0g5Zyw5pSv5LiJ5Lya77ya5a+F5Y2v6L6w5LiJ5Lya5pyo5bGA77yI5a6M5pW077yJ77yM5b6X5YiGKzEuMu+8iOWcsOaUr+S4ieS8muadg+mHje+8jOaPkOmrmOS7peWinuW8uue7hOWQiOW9seWTje+8iVxuLSDlnLDmlK/kuInkvJrvvJrlr4Xlja/ovrDkuInkvJrmnKjlsYDvvIjpg6jliIbvvInvvIzlvpfliIYrMC4377yI6YOo5YiG5LiJ5Lya5p2D6YeN77yM5paw5aKe5Yy65YiG5a6M5pW05bqm77yJXG5cbuOAkOadg+mHjeWIhumFjeivtOaYjuOAkVxuLSDlpKnlubLmnYPph43vvJrlubTlubIoMS4yKSA8IOaciOW5sigzLjApID0g5pel5bmyKDMuMCkgPiDml7blubIoMS4wKe+8jOeqgeWHuuaciOS7pOWSjOaXpeS4u+mHjeimgeaAp1xuLSDlnLDmlK/ol4/lubLmnYPph43vvJrlubTmlK8oMC44KSA8IOaciOaUrygyLjUpID4g5pel5pSvKDIuMikgPiDml7bmlK8oMC43Ke+8jOeqgeWHuuaciOS7pOmHjeimgeaAp1xuLSDnurPpn7PkupTooYzmnYPph43vvJrlubTmn7EoMC42KSA8IOaciOafsSgyLjApID4g5pel5p+xKDEuNSkgPiDml7bmn7EoMC41Ke+8jOeqgeWHuuaciOS7pOmHjeimgeaAp1xuLSDlraPoioLosIPmlbTvvJrml7ooKzIuNSnjgIHnm7goKzEuMinjgIHlubMoMCnjgIHlm5ooLTEuMinjgIHmrbsoLTEuOCnvvIzlvLrljJblraPoioLlvbHlk41cbi0g5pyI5Luk5Yqg5oiQ77ya5b2T5LukKCsyLjAp44CB55u45pe6KCsxLjAp44CB5bmz5ZKMKDAp44CB5ZuaKC0wLjUp44CB5q27KC0wLjgp77yM5YWo6Z2i6ICD6JmR5pyI5Luk5b2x5ZONXG4tIOe7hOWQiOWFs+ezu++8muWkqeW5suS6lOWQiCgrMC44KeOAgeWcsOaUr+S4ieWQiCgrMS41LyswLjkp44CB5Zyw5pSv5LiJ5LyaKCsxLjIvKzAuNynvvIzljLrliIblrozmlbTluqZgXG4gICAgICB9LFxuICAgICAgJ+awtCc6IHtcbiAgICAgICAgbmFtZTogJ+awtCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5rC05LqU6KGM5Luj6KGo5pm65oWn44CB5rKf6YCa44CB6YCC5bqU5Yqb44CC5rC06L+H5by65YiZ5aSa6JmR77yM5rC06L+H5byx5YiZ57y65LmP5pm65oWn44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5rC05LqU6KGM5by655qE5Lq677yM6IGq5piO5pm65oWn77yM5ZaE5LqO5rKf6YCa77yM6YCC5bqU5Yqb5by677yM5L2G5Y+v6IO96L+H5LqO5aSa6JmR77yb5rC05LqU6KGM5byx55qE5Lq677yM57y65LmP5pm65oWn77yM5rKf6YCa6IO95Yqb5beu77yM5L2G5Li65Lq66LiP5a6e44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDmsLTkupTooYzlvLrluqblrp7pmYXorqHnrpfov4fnqIvvvJpcblxu44CQ5aSp5bmy5LqU6KGM44CRXG4tIOW5tOW5suWjrOOAgeeZuOS4uuawtO+8jOW+l+WIhjEuMu+8iOW5tOW5suadg+mHje+8iVxuLSDmnIjlubLlo6zjgIHnmbjkuLrmsLTvvIzlvpfliIYzLjDvvIjmnIjlubLmnYPph43vvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g5pel5bmy5aOs44CB55m45Li65rC077yM5b6X5YiGMy4w77yI5pel5bmy5p2D6YeN77yM5pel5Li75pyA6YeN6KaB77yJXG4tIOaXtuW5suWjrOOAgeeZuOS4uuawtO+8jOW+l+WIhjEuMO+8iOaXtuW5suadg+mHje+8iVxuXG7jgJDlnLDmlK/ol4/lubLjgJFcbi0g5bm05pSv6JeP5aOs44CB55m45Li65rC077yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG4tIOaciOaUr+iXj+WjrOOAgeeZuOS4uuawtO+8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuLSDml6XmlK/ol4/lo6zjgIHnmbjkuLrmsLTvvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcbi0g5pe25pSv6JeP5aOs44CB55m45Li65rC077yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG5cbuOAkOe6s+mfs+S6lOihjOOAkVxuLSDlubTmn7HnurPpn7PkuLrmsLTvvIzlvpfliIYwLjbvvIjlubTmn7HnurPpn7PmnYPph43vvIlcbi0g5pyI5p+x57qz6Z+z5Li65rC077yM5b6X5YiGMi4w77yI5pyI5p+x57qz6Z+z5p2D6YeN77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOaXpeafsee6s+mfs+S4uuawtO+8jOW+l+WIhjEuNe+8iOaXpeafsee6s+mfs+adg+mHje+8iVxuLSDml7bmn7HnurPpn7PkuLrmsLTvvIzlvpfliIYwLjXvvIjml7bmn7HnurPpn7PmnYPph43vvIlcblxu44CQ5a2j6IqC6LCD5pW044CRXG4tIOWGrOWto++8iOWGnOWOhuWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ieawtOaXuu+8jOW+l+WIhisyLjXvvIjml7rnm7jns7vmlbDvvIzmj5Dpq5jku6XlvLrljJblraPoioLlvbHlk43vvIlcbi0g56eL5a2j77yI5Yac5Y6G5LiD44CB5YWr44CB5Lmd5pyI77yJ5rC055u477yM5b6X5YiGKzEuMu+8iOebuOaXuuezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxuLSDmmKXlraPvvIjlhpzljobmraPjgIHkuozjgIHkuInmnIjvvInmsLTlm5rvvIzlvpfliIYtMS4y77yI5Zua57O75pWw77yM5aKe5by65Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG4tIOWkj+Wto++8iOWGnOWOhuWbm+OAgeS6lOOAgeWFreaciO+8ieawtOatu++8jOW+l+WIhi0xLjjvvIjmrbvns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcblxu44CQ5pyI5Luk5b2T5Luk5Yqg5oiQ44CRXG4tIOWGrOWto+awtOW9k+S7pO+8jOW+l+WIhisyLjDvvIjlvZPku6TliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g56eL5a2j5rC055u45pe677yM5b6X5YiGKzEuMO+8iOebuOaXuuWKoOaIkO+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDmmKXlraPmsLTlm5rvvIzlvpfliIYtMC4177yI5Zua5Yqg5oiQ77yM5paw5aKe6LSf6Z2i6LCD5pW077yJXG4tIOWkj+Wto+awtOatu++8jOW+l+WIhi0wLjjvvIjmrbvliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcblxu44CQ57uE5ZCI6LCD5pW044CRXG4tIOWkqeW5suS6lOWQiO+8muS4mei+m+WQiOWMluawtO+8jOW+l+WIhiswLjjvvIjlpKnlubLkupTlkIjmnYPph43vvIzmj5Dpq5jku6Xlop7lvLrnu4TlkIjlvbHlk43vvIlcbi0g5Zyw5pSv5LiJ5ZCI77ya55Sz5a2Q6L6w5LiJ5ZCI5rC05bGA77yI5a6M5pW077yJ77yM5b6X5YiGKzEuNe+8iOWcsOaUr+S4ieWQiOadg+mHje+8jOaPkOmrmOS7peWinuW8uue7hOWQiOW9seWTje+8iVxuLSDlnLDmlK/kuInlkIjvvJrnlLPlrZDovrDkuInlkIjmsLTlsYDvvIjpg6jliIbvvInvvIzlvpfliIYrMC4577yI6YOo5YiG5LiJ5ZCI5p2D6YeN77yM5paw5aKe5Yy65YiG5a6M5pW05bqm77yJXG4tIOWcsOaUr+S4ieS8mu+8muS6peWtkOS4keS4ieS8muawtOWxgO+8iOWujOaVtO+8ie+8jOW+l+WIhisxLjLvvIjlnLDmlK/kuInkvJrmnYPph43vvIzmj5Dpq5jku6Xlop7lvLrnu4TlkIjlvbHlk43vvIlcbi0g5Zyw5pSv5LiJ5Lya77ya5Lql5a2Q5LiR5LiJ5Lya5rC05bGA77yI6YOo5YiG77yJ77yM5b6X5YiGKzAuN++8iOmDqOWIhuS4ieS8muadg+mHje+8jOaWsOWinuWMuuWIhuWujOaVtOW6pu+8iVxuXG7jgJDmnYPph43liIbphY3or7TmmI7jgJFcbi0g5aSp5bmy5p2D6YeN77ya5bm05bmyKDEuMikgPCDmnIjlubIoMy4wKSA9IOaXpeW5sigzLjApID4g5pe25bmyKDEuMCnvvIznqoHlh7rmnIjku6Tlkozml6XkuLvph43opoHmgKdcbi0g5Zyw5pSv6JeP5bmy5p2D6YeN77ya5bm05pSvKDAuOCkgPCDmnIjmlK8oMi41KSA+IOaXpeaUrygyLjIpID4g5pe25pSvKDAuNynvvIznqoHlh7rmnIjku6Tph43opoHmgKdcbi0g57qz6Z+z5LqU6KGM5p2D6YeN77ya5bm05p+xKDAuNikgPCDmnIjmn7EoMi4wKSA+IOaXpeafsSgxLjUpID4g5pe25p+xKDAuNSnvvIznqoHlh7rmnIjku6Tph43opoHmgKdcbi0g5a2j6IqC6LCD5pW077ya5pe6KCsyLjUp44CB55u4KCsxLjIp44CB5bmzKDAp44CB5ZuaKC0xLjIp44CB5q27KC0xLjgp77yM5by65YyW5a2j6IqC5b2x5ZONXG4tIOaciOS7pOWKoOaIkO+8muW9k+S7pCgrMi4wKeOAgeebuOaXuigrMS4wKeOAgeW5s+WSjCgwKeOAgeWbmigtMC41KeOAgeatuygtMC44Ke+8jOWFqOmdouiAg+iZkeaciOS7pOW9seWTjVxuLSDnu4TlkIjlhbPns7vvvJrlpKnlubLkupTlkIgoKzAuOCnjgIHlnLDmlK/kuInlkIgoKzEuNS8rMC45KeOAgeWcsOaUr+S4ieS8migrMS4yLyswLjcp77yM5Yy65YiG5a6M5pW05bqmYFxuICAgICAgfSxcbiAgICAgICfngasnOiB7XG4gICAgICAgIG5hbWU6ICfngasnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+eBq+S6lOihjOS7o+ihqOeDreaDheOAgea0u+WKm+OAgeihqOeOsOWKm+OAgueBq+i/h+W8uuWImea1rui6ge+8jOeBq+i/h+W8seWImee8uuS5j+eDreaDheOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+eBq+S6lOihjOW8uueahOS6uu+8jOeDreaDhea0u+WKm++8jOihqOeOsOWKm+W8uu+8jOS9huWPr+iDvei/h+S6jua1rui6ge+8m+eBq+S6lOihjOW8seeahOS6uu+8jOe8uuS5j+eDreaDhe+8jOihqOeOsOWKm+W3ru+8jOS9huS4uuS6uueos+mHjeOAgicsXG4gICAgICAgIGNhbGN1bGF0aW9uOiBg54Gr5LqU6KGM5by65bqm5a6e6ZmF6K6h566X6L+H56iL77yaXG5cbuOAkOWkqeW5suS6lOihjOOAkVxuLSDlubTlubLkuJnjgIHkuIHkuLrngavvvIzlvpfliIYxLjLvvIjlubTlubLmnYPph43vvIlcbi0g5pyI5bmy5LiZ44CB5LiB5Li654Gr77yM5b6X5YiGMy4w77yI5pyI5bmy5p2D6YeN77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOaXpeW5suS4meOAgeS4geS4uueBq++8jOW+l+WIhjMuMO+8iOaXpeW5suadg+mHje+8jOaXpeS4u+acgOmHjeimge+8iVxuLSDml7blubLkuJnjgIHkuIHkuLrngavvvIzlvpfliIYxLjDvvIjml7blubLmnYPph43vvIlcblxu44CQ5Zyw5pSv6JeP5bmy44CRXG4tIOW5tOaUr+iXj+S4meOAgeS4geS4uueBq++8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuLSDmnIjmlK/ol4/kuJnjgIHkuIHkuLrngavvvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcbi0g5pel5pSv6JeP5LiZ44CB5LiB5Li654Gr77yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG4tIOaXtuaUr+iXj+S4meOAgeS4geS4uueBq++8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuXG7jgJDnurPpn7PkupTooYzjgJFcbi0g5bm05p+x57qz6Z+z5Li654Gr77yM5b6X5YiGMC4277yI5bm05p+x57qz6Z+z5p2D6YeN77yJXG4tIOaciOafsee6s+mfs+S4uueBq++8jOW+l+WIhjIuMO+8iOaciOafsee6s+mfs+adg+mHje+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDml6Xmn7HnurPpn7PkuLrngavvvIzlvpfliIYxLjXvvIjml6Xmn7HnurPpn7PmnYPph43vvIlcbi0g5pe25p+x57qz6Z+z5Li654Gr77yM5b6X5YiGMC4177yI5pe25p+x57qz6Z+z5p2D6YeN77yJXG5cbuOAkOWto+iKguiwg+aVtOOAkVxuLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInngavml7rvvIzlvpfliIYrMi4177yI5pe655u457O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG4tIOaYpeWto++8iOWGnOWOhuato+OAgeS6jOOAgeS4ieaciO+8ieeBq+ebuO+8jOW+l+WIhisxLjLvvIjnm7jml7rns7vmlbDvvIzmj5Dpq5jku6XlvLrljJblraPoioLlvbHlk43vvIlcbi0g56eL5a2j77yI5Yac5Y6G5LiD44CB5YWr44CB5Lmd5pyI77yJ54Gr5Zua77yM5b6X5YiGLTEuMu+8iOWbmuezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxuLSDlhqzlraPvvIjlhpzljobljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInngavmrbvvvIzlvpfliIYtMS4477yI5q2757O75pWw77yM5aKe5by65Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG5cbuOAkOaciOS7pOW9k+S7pOWKoOaIkOOAkVxuLSDlpI/lraPngavlvZPku6TvvIzlvpfliIYrMi4w77yI5b2T5Luk5Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOaYpeWto+eBq+ebuOaXuu+8jOW+l+WIhisxLjDvvIjnm7jml7rliqDmiJDvvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g56eL5a2j54Gr5Zua77yM5b6X5YiGLTAuNe+8iOWbmuWKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxuLSDlhqzlraPngavmrbvvvIzlvpfliIYtMC4477yI5q275Yqg5oiQ77yM5paw5aKe6LSf6Z2i6LCD5pW077yJXG5cbuOAkOe7hOWQiOiwg+aVtOOAkVxuLSDlpKnlubLkupTlkIjvvJrmiIrnmbjlkIjljJbngavvvIzlvpfliIYrMC4477yI5aSp5bmy5LqU5ZCI5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieWQiO+8muWvheWNiOaIjOS4ieWQiOeBq+WxgO+8iOWujOaVtO+8ie+8jOW+l+WIhisxLjXvvIjlnLDmlK/kuInlkIjmnYPph43vvIzmj5Dpq5jku6Xlop7lvLrnu4TlkIjlvbHlk43vvIlcbi0g5Zyw5pSv5LiJ5ZCI77ya5a+F5Y2I5oiM5LiJ5ZCI54Gr5bGA77yI6YOo5YiG77yJ77yM5b6X5YiGKzAuOe+8iOmDqOWIhuS4ieWQiOadg+mHje+8jOaWsOWinuWMuuWIhuWujOaVtOW6pu+8iVxuLSDlnLDmlK/kuInkvJrvvJrlt7PljYjmnKrkuInkvJrngavlsYDvvIjlrozmlbTvvInvvIzlvpfliIYrMS4y77yI5Zyw5pSv5LiJ5Lya5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieS8mu+8muW3s+WNiOacquS4ieS8mueBq+WxgO+8iOmDqOWIhu+8ie+8jOW+l+WIhiswLjfvvIjpg6jliIbkuInkvJrmnYPph43vvIzmlrDlop7ljLrliIblrozmlbTluqbvvIlcblxu44CQ5p2D6YeN5YiG6YWN6K+05piO44CRXG4tIOWkqeW5suadg+mHje+8muW5tOW5sigxLjIpIDwg5pyI5bmyKDMuMCkgPSDml6XlubIoMy4wKSA+IOaXtuW5sigxLjAp77yM56qB5Ye65pyI5Luk5ZKM5pel5Li76YeN6KaB5oCnXG4tIOWcsOaUr+iXj+W5suadg+mHje+8muW5tOaUrygwLjgpIDwg5pyI5pSvKDIuNSkgPiDml6XmlK8oMi4yKSA+IOaXtuaUrygwLjcp77yM56qB5Ye65pyI5Luk6YeN6KaB5oCnXG4tIOe6s+mfs+S6lOihjOadg+mHje+8muW5tOafsSgwLjYpIDwg5pyI5p+xKDIuMCkgPiDml6Xmn7EoMS41KSA+IOaXtuafsSgwLjUp77yM56qB5Ye65pyI5Luk6YeN6KaB5oCnXG4tIOWto+iKguiwg+aVtO+8muaXuigrMi41KeOAgeebuCgrMS4yKeOAgeW5sygwKeOAgeWbmigtMS4yKeOAgeatuygtMS44Ke+8jOW8uuWMluWto+iKguW9seWTjVxuLSDmnIjku6TliqDmiJDvvJrlvZPku6QoKzIuMCnjgIHnm7jml7ooKzEuMCnjgIHlubPlkowoMCnjgIHlm5ooLTAuNSnjgIHmrbsoLTAuOCnvvIzlhajpnaLogIPomZHmnIjku6TlvbHlk41cbi0g57uE5ZCI5YWz57O777ya5aSp5bmy5LqU5ZCIKCswLjgp44CB5Zyw5pSv5LiJ5ZCIKCsxLjUvKzAuOSnjgIHlnLDmlK/kuInkvJooKzEuMi8rMC43Ke+8jOWMuuWIhuWujOaVtOW6pmBcbiAgICAgIH0sXG4gICAgICAn5ZyfJzoge1xuICAgICAgICBuYW1lOiAn5ZyfJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICflnJ/kupTooYzku6PooajnqLPph43jgIHouI/lrp7jgIHljIXlrrnlipvjgILlnJ/ov4flvLrliJnkv53lrojvvIzlnJ/ov4flvLHliJnnvLrkuY/nqLPlrprmgKfjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICflnJ/kupTooYzlvLrnmoTkurrvvIznqLPph43ouI/lrp7vvIzljIXlrrnlipvlvLrvvIzkvYblj6/og73ov4fkuo7kv53lrojvvJvlnJ/kupTooYzlvLHnmoTkurrvvIznvLrkuY/nqLPlrprmgKfvvIzlgZrkuovkuI3ouI/lrp7vvIzkvYbkuLrkurrngbXmtLvjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOWcn+S6lOihjOW8uuW6puWunumZheiuoeeul+i/h+eoi++8mlxuXG7jgJDlpKnlubLkupTooYzjgJFcbi0g5bm05bmy5oiK44CB5bex5Li65Zyf77yM5b6X5YiGMS4y77yI5bm05bmy5p2D6YeN77yJXG4tIOaciOW5suaIiuOAgeW3seS4uuWcn++8jOW+l+WIhjMuMO+8iOaciOW5suadg+mHje+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDml6XlubLmiIrjgIHlt7HkuLrlnJ/vvIzlvpfliIYzLjDvvIjml6XlubLmnYPph43vvIzml6XkuLvmnIDph43opoHvvIlcbi0g5pe25bmy5oiK44CB5bex5Li65Zyf77yM5b6X5YiGMS4w77yI5pe25bmy5p2D6YeN77yJXG5cbuOAkOWcsOaUr+iXj+W5suOAkVxuLSDlubTmlK/ol4/miIrjgIHlt7HkuLrlnJ/vvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcbi0g5pyI5pSv6JeP5oiK44CB5bex5Li65Zyf77yM5b6X5YiG5qC55o2u6JeP5bmy5pWw6YeP5ZKM5p2D6YeN6K6h566XXG4tIOaXpeaUr+iXj+aIiuOAgeW3seS4uuWcn++8jOW+l+WIhuagueaNruiXj+W5suaVsOmHj+WSjOadg+mHjeiuoeeul1xuLSDml7bmlK/ol4/miIrjgIHlt7HkuLrlnJ/vvIzlvpfliIbmoLnmja7ol4/lubLmlbDph4/lkozmnYPph43orqHnrpdcblxu44CQ57qz6Z+z5LqU6KGM44CRXG4tIOW5tOafsee6s+mfs+S4uuWcn++8jOW+l+WIhjAuNu+8iOW5tOafsee6s+mfs+adg+mHje+8iVxuLSDmnIjmn7HnurPpn7PkuLrlnJ/vvIzlvpfliIYyLjDvvIjmnIjmn7HnurPpn7PmnYPph43vvIzmj5Dpq5jku6XlvLrosIPmnIjku6Tph43opoHmgKfvvIlcbi0g5pel5p+x57qz6Z+z5Li65Zyf77yM5b6X5YiGMS4177yI5pel5p+x57qz6Z+z5p2D6YeN77yJXG4tIOaXtuafsee6s+mfs+S4uuWcn++8jOW+l+WIhjAuNe+8iOaXtuafsee6s+mfs+adg+mHje+8iVxuXG7jgJDlraPoioLosIPmlbTjgJFcbi0g5Zub5a2j5pyr5pyI77yI5Yac5Y6G5LiJ44CB5YWt44CB5Lmd44CB5Y2B5LqM5pyI77yJ5Zyf5pe677yM5b6X5YiGKzIuNe+8iOaXuuebuOezu+aVsO+8jOaPkOmrmOS7peW8uuWMluWto+iKguW9seWTje+8iVxuLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInlnJ/nm7jvvIzlvpfliIYrMS4y77yI55u45pe657O75pWw77yM5o+Q6auY5Lul5by65YyW5a2j6IqC5b2x5ZON77yJXG4tIOWGrOWto++8iOWGnOWOhuWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ieWcn+Wbmu+8jOW+l+WIhi0xLjLvvIjlm5rns7vmlbDvvIzlop7lvLrku6XlvLrljJblraPoioLlvbHlk43vvIlcbi0g56eL5a2j77yI5Yac5Y6G5LiD44CB5YWr44CB5Lmd5pyI77yJ5Zyf5q2777yM5b6X5YiGLTEuOO+8iOatu+ezu+aVsO+8jOWinuW8uuS7peW8uuWMluWto+iKguW9seWTje+8iVxuXG7jgJDmnIjku6TlvZPku6TliqDmiJDjgJFcbi0g5Zub5a2j5pyr5pyI5Zyf5b2T5Luk77yM5b6X5YiGKzIuMO+8iOW9k+S7pOWKoOaIkO+8jOaPkOmrmOS7peW8uuiwg+aciOS7pOmHjeimgeaAp++8iVxuLSDlpI/lraPlnJ/nm7jml7rvvIzlvpfliIYrMS4w77yI55u45pe65Yqg5oiQ77yM5o+Q6auY5Lul5by66LCD5pyI5Luk6YeN6KaB5oCn77yJXG4tIOWGrOWto+Wcn+Wbmu+8jOW+l+WIhi0wLjXvvIjlm5rliqDmiJDvvIzmlrDlop7otJ/pnaLosIPmlbTvvIlcbi0g56eL5a2j5Zyf5q2777yM5b6X5YiGLTAuOO+8iOatu+WKoOaIkO+8jOaWsOWinui0n+mdouiwg+aVtO+8iVxuXG7jgJDnu4TlkIjosIPmlbTjgJFcbi0g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5YyW5Zyf77yM5b6X5YiGKzAuOO+8iOWkqeW5suS6lOWQiOadg+mHje+8jOaPkOmrmOS7peWinuW8uue7hOWQiOW9seWTje+8iVxuLSDlnLDmlK/kuInlkIjvvJrovrDmiIzkuJHkuInlkIjlnJ/lsYDvvIjlrozmlbTvvInvvIzlvpfliIYrMS4177yI5Zyw5pSv5LiJ5ZCI5p2D6YeN77yM5o+Q6auY5Lul5aKe5by657uE5ZCI5b2x5ZON77yJXG4tIOWcsOaUr+S4ieWQiO+8mui+sOaIjOS4keS4ieWQiOWcn+WxgO+8iOmDqOWIhu+8ie+8jOW+l+WIhiswLjnvvIjpg6jliIbkuInlkIjmnYPph43vvIzmlrDlop7ljLrliIblrozmlbTluqbvvIlcbi0g5Zyw5pSv5LiJ5Lya77ya6L6w5bez5Y2I5LiJ5Lya5Zyf5bGA77yI5a6M5pW077yJ77yM5b6X5YiGKzEuMu+8iOWcsOaUr+S4ieS8muadg+mHje+8jOaPkOmrmOS7peWinuW8uue7hOWQiOW9seWTje+8iVxuLSDlnLDmlK/kuInkvJrvvJrovrDlt7PljYjkuInkvJrlnJ/lsYDvvIjpg6jliIbvvInvvIzlvpfliIYrMC4377yI6YOo5YiG5LiJ5Lya5p2D6YeN77yM5paw5aKe5Yy65YiG5a6M5pW05bqm77yJXG5cbuOAkOadg+mHjeWIhumFjeivtOaYjuOAkVxuLSDlpKnlubLmnYPph43vvJrlubTlubIoMS4yKSA8IOaciOW5sigzLjApID0g5pel5bmyKDMuMCkgPiDml7blubIoMS4wKe+8jOeqgeWHuuaciOS7pOWSjOaXpeS4u+mHjeimgeaAp1xuLSDlnLDmlK/ol4/lubLmnYPph43vvJrlubTmlK8oMC44KSA8IOaciOaUrygyLjUpID4g5pel5pSvKDIuMikgPiDml7bmlK8oMC43Ke+8jOeqgeWHuuaciOS7pOmHjeimgeaAp1xuLSDnurPpn7PkupTooYzmnYPph43vvJrlubTmn7EoMC42KSA8IOaciOafsSgyLjApID4g5pel5p+xKDEuNSkgPiDml7bmn7EoMC41Ke+8jOeqgeWHuuaciOS7pOmHjeimgeaAp1xuLSDlraPoioLosIPmlbTvvJrml7ooKzIuNSnjgIHnm7goKzEuMinjgIHlubMoMCnjgIHlm5ooLTEuMinjgIHmrbsoLTEuOCnvvIzlvLrljJblraPoioLlvbHlk41cbi0g5pyI5Luk5Yqg5oiQ77ya5b2T5LukKCsyLjAp44CB55u45pe6KCsxLjAp44CB5bmz5ZKMKDAp44CB5ZuaKC0wLjUp44CB5q27KC0wLjgp77yM5YWo6Z2i6ICD6JmR5pyI5Luk5b2x5ZONXG4tIOe7hOWQiOWFs+ezu++8muWkqeW5suS6lOWQiCgrMC44KeOAgeWcsOaUr+S4ieWQiCgrMS41LyswLjkp44CB5Zyw5pSv5LiJ5LyaKCsxLjIvKzAuNynvvIzljLrliIblrozmlbTluqZgXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBleHBsYW5hdGlvbnNbd3VYaW5nXSB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaXpeS4u+aXuuihsOeahOivpue7huS/oeaBr1xuICAgKiBAcGFyYW0gcmlaaHUg5pel5Li75pe66KGw54q25oCBXG4gICAqIEByZXR1cm5zIOaXpeS4u+aXuuihsOeahOivpue7huS/oeaBr1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRSaVpodUluZm8ocmlaaHU6IHN0cmluZyk6IHsgbmFtZTogc3RyaW5nOyBleHBsYW5hdGlvbjogc3RyaW5nOyBpbmZsdWVuY2U6IHN0cmluZzsgY2FsY3VsYXRpb246IHN0cmluZyB9IHwgbnVsbCB7XG4gICAgY29uc3QgZXhwbGFuYXRpb25zOiB7IFtrZXk6IHN0cmluZ106IHsgbmFtZTogc3RyaW5nOyBleHBsYW5hdGlvbjogc3RyaW5nOyBpbmZsdWVuY2U6IHN0cmluZzsgY2FsY3VsYXRpb246IHN0cmluZyB9IH0gPSB7XG4gICAgICAn5pe6Jzoge1xuICAgICAgICBuYW1lOiAn5pe6JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfml6XkuLvml7rooajnpLrlkb3kuLvnmoTkupTooYzlipvph4/lvLrnm5vvvIzkuKrmgKfliJrlvLrvvIzoh6rkv6Hlv4PlvLrvvIzmnInpooblr7zog73lipvvvIzkvYblj6/og73ov4fkuo7oh6rkv6HmiJblm7rmiafjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfml6XkuLvml7rnmoTkurrvvIzmgKfmoLzliJrlvLrvvIzoh6rkv6Hlv4PlvLrvvIzmnInpooblr7zog73lipvvvIzlgZrkuovmnpzmlq3vvIzkvYblj6/og73ov4fkuo7oh6rkv6HmiJblm7rmiafvvIzkuI3mmJPmjqXlj5fku5bkurrmhI/op4HjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOaXpeS4u+aXuuihsOiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDorqHnrpfjgJFcbjEuIOiuoeeul+aXpeS4u+S6lOihjOWcqOWFq+Wtl+S4reeahOW8uuW6plxuICAgLSDpppblhYjnoa7lrprml6XkuLvkupTooYzvvIjml6XlubLmiYDlsZ7kupTooYzvvIlcbiAgIC0g6K6h566X6K+l5LqU6KGM5Zyo5YWr5a2X5Lit55qE5oC75b6X5YiG77yI5oyJ54Wn5LqU6KGM5by65bqm6K6h566X5pa55rOV77yJXG4gICAtIOiuoeeul+aJgOacieS6lOihjOeahOaAu+W+l+WIhlxuICAgLSDorqHnrpfml6XkuLvkupTooYznmoTnm7jlr7nlvLrluqbvvJrml6XkuLvkupTooYzlvpfliIYv5omA5pyJ5LqU6KGM5oC75b6X5YiGXG5cbuOAkOWto+iKguW9seWTjeOAkVxuMi4g6ICD6JmR5a2j6IqC5a+55pel5Li75LqU6KGM55qE5b2x5ZON77yaXG4gICAtIOaYpeWto++8iOato+OAgeS6jOOAgeS4ieaciO+8ie+8mlxuICAgICAqIOacqOaXuigrMC4zKeOAgeeBq+ebuCgrMC4xNSnjgIHlnJ/kvJEoMCnjgIHph5Hlm5ooLTAuMTUp44CB5rC05q27KC0wLjMpXG4gICAtIOWkj+Wto++8iOWbm+OAgeS6lOOAgeWFreaciO+8ie+8mlxuICAgICAqIOeBq+aXuigrMC4zKeOAgeWcn+ebuCgrMC4xNSnjgIHph5HkvJEoMCnjgIHmsLTlm5ooLTAuMTUp44CB5pyo5q27KC0wLjMpXG4gICAtIOeni+Wto++8iOS4g+OAgeWFq+OAgeS5neaciO+8ie+8mlxuICAgICAqIOmHkeaXuigrMC4zKeOAgeawtOebuCgrMC4xNSnjgIHmnKjkvJEoMCnjgIHngavlm5ooLTAuMTUp44CB5Zyf5q27KC0wLjMpXG4gICAtIOWGrOWto++8iOWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ie+8mlxuICAgICAqIOawtOaXuigrMC4zKeOAgeacqOebuCgrMC4xNSnjgIHngavkvJEoMCnjgIHlnJ/lm5ooLTAuMTUp44CB6YeR5q27KC0wLjMpXG5cbuOAkOeUn+WFi+WFs+ezu+OAkVxuMy4g6ICD6JmR5pyI5pSv5a+55pel5Li755qE55Sf5YWL5YWz57O7XG4gICAtIOaciOaUr+S6lOihjOeUn+aXpeS4u++8miswLjJcbiAgIC0g5pyI5pSv5LqU6KGM5YWL5pel5Li777yaLTAuMlxuICAgLSDml6XkuLvkupTooYzlhYvmnIjmlK/vvJorMC4xXG4gICAtIOaXpeS4u+S6lOihjOeUn+aciOaUr++8mi0wLjFcblxu44CQ57uE5ZCI5b2x5ZON44CRXG40LiDogIPomZHlnLDmlK/kuInlkIjlsYDlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM55Sf5pel5Li777yaKzAuMTVcbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM5YWL5pel5Li777yaLTAuMTVcbiAgIC0g5pel5Li75LqU6KGM5YWL5LiJ5ZCI5bGA77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/kuInlkIjlsYDvvJotMC4xXG5cbjUuIOiAg+iZkeWkqeW5suS6lOWQiOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDkupTlkIjljJbkupTooYznlJ/ml6XkuLvvvJorMC4xXG4gICAtIOS6lOWQiOWMluS6lOihjOWFi+aXpeS4u++8mi0wLjFcbiAgIC0g5pel5Li75Y+C5LiO5LqU5ZCI77yaLTAuMDXvvIjml6XkuLvlj5fnibXliLbvvIlcblxuNi4g6ICD6JmR57qz6Z+z5LqU6KGM5a+55pel5Li755qE5b2x5ZONXG4gICAtIOaXpeafsee6s+mfs+S4juaXpeS4u+S6lOihjOebuOWQjO+8miswLjFcbiAgIC0g5pel5p+x57qz6Z+z55Sf5pel5Li75LqU6KGM77yaKzAuMDVcbiAgIC0g5pel5p+x57qz6Z+z5YWL5pel5Li75LqU6KGM77yaLTAuMDVcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja9cbi0g5pel5Li75Li65LiZ54GrXG4tIOaciOS7pOS4uuS4keaciO+8iOWGrOWto++8iVxuLSDml6XkuLvkupTooYzlvLrluqborqHnrpfvvJrkuJnngavlvpfliIbkuLozLjXliIbvvIzmgLvliIbkuLoyMOWIhu+8jOebuOWvueW8uuW6puS4ujAuMTc1XG4tIOWto+iKguW9seWTje+8muWGrOWto+eBq+S8ke+8jOiwg+aVtOezu+aVsOS4ujBcbi0g5pyI5pSv5LiR5Zyf5YWL54Gr77yaLTAuMlxuLSDlnLDmlK/kuInlkIjvvJrlrZDjgIHkuJHlj6/og73kuI7ovrDlvaLmiJDkuInlkIjmsLTlsYDvvIzmsLTlhYvngavvvJotMC4xNVxuLSDlpKnlubLkupTlkIjvvJrml6Bcbi0g57qz6Z+z5LqU6KGM77ya5LiZ5a+F5Li654KJ5Lit54Gr77yM5LiO5pel5Li75ZCM57G777yaKzAuMVxuXG7mnIDnu4jlvpfliIbvvJowLjE3NSArIDAgLSAwLjIgLSAwLjE1ICsgMC4xID0gLTAuMDc1XG5cbuOAkOaXuuihsOWIpOWumuOAkVxuNy4g5b2S5LiA5YyW5b6X5YiG77yM6K6h566X5pyA57uI5pe66KGw54q25oCB77yaXG4gICAtIOaXuu+8muW+l+WIhiA+IDAuNlxuICAgLSDnm7jvvJowLjMgPCDlvpfliIYg4omkIDAuNlxuICAgLSDkvJHvvJotMC4zIOKJpCDlvpfliIYg4omkIDAuM1xuICAgLSDlm5rvvJotMC42IOKJpCDlvpfliIYgPCAtMC4zXG4gICAtIOatu++8muW+l+WIhiA8IC0wLjZcblxu5qC55o2u6K6h566X57uT5p6cLTAuMDc177yM5pel5Li75Li6XCLkvJFcIuOAgmBcbiAgICAgIH0sXG4gICAgICAn55u4Jzoge1xuICAgICAgICBuYW1lOiAn55u4JyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfml6XkuLvnm7jooajnpLrlkb3kuLvnmoTkupTooYzlipvph4/ovoPlvLrvvIzmgKfmoLzovoPkuLrlubPooaHvvIzmnInoh6rkv6HkvYbkuI3ov4fliIbvvIzog73lpJ/pgILlupTlkITnp43njq/looPjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfml6XkuLvnm7jnmoTkurrvvIzmgKfmoLzovoPkuLrlubPooaHvvIzmnInoh6rkv6HkvYbkuI3ov4fliIbvvIzog73lpJ/pgILlupTlkITnp43njq/looPvvIzlgZrkuovmnInkuLvop4HkvYbkuZ/og73mjqXlj5fku5bkurrmhI/op4HjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOaXpeS4u+aXuuihsOiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDorqHnrpfjgJFcbjEuIOiuoeeul+aXpeS4u+S6lOihjOWcqOWFq+Wtl+S4reeahOW8uuW6plxuICAgLSDpppblhYjnoa7lrprml6XkuLvkupTooYzvvIjml6XlubLmiYDlsZ7kupTooYzvvIlcbiAgIC0g6K6h566X6K+l5LqU6KGM5Zyo5YWr5a2X5Lit55qE5oC75b6X5YiG77yI5oyJ54Wn5LqU6KGM5by65bqm6K6h566X5pa55rOV77yJXG4gICAtIOiuoeeul+aJgOacieS6lOihjOeahOaAu+W+l+WIhlxuICAgLSDorqHnrpfml6XkuLvkupTooYznmoTnm7jlr7nlvLrluqbvvJrml6XkuLvkupTooYzlvpfliIYv5omA5pyJ5LqU6KGM5oC75b6X5YiGXG5cbuOAkOWto+iKguW9seWTjeOAkVxuMi4g6ICD6JmR5a2j6IqC5a+55pel5Li75LqU6KGM55qE5b2x5ZON77yaXG4gICAtIOaYpeWto++8iOato+OAgeS6jOOAgeS4ieaciO+8ie+8mlxuICAgICAqIOacqOaXuigrMC4zKeOAgeeBq+ebuCgrMC4xNSnjgIHlnJ/kvJEoMCnjgIHph5Hlm5ooLTAuMTUp44CB5rC05q27KC0wLjMpXG4gICAtIOWkj+Wto++8iOWbm+OAgeS6lOOAgeWFreaciO+8ie+8mlxuICAgICAqIOeBq+aXuigrMC4zKeOAgeWcn+ebuCgrMC4xNSnjgIHph5HkvJEoMCnjgIHmsLTlm5ooLTAuMTUp44CB5pyo5q27KC0wLjMpXG4gICAtIOeni+Wto++8iOS4g+OAgeWFq+OAgeS5neaciO+8ie+8mlxuICAgICAqIOmHkeaXuigrMC4zKeOAgeawtOebuCgrMC4xNSnjgIHmnKjkvJEoMCnjgIHngavlm5ooLTAuMTUp44CB5Zyf5q27KC0wLjMpXG4gICAtIOWGrOWto++8iOWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ie+8mlxuICAgICAqIOawtOaXuigrMC4zKeOAgeacqOebuCgrMC4xNSnjgIHngavkvJEoMCnjgIHlnJ/lm5ooLTAuMTUp44CB6YeR5q27KC0wLjMpXG5cbuOAkOeUn+WFi+WFs+ezu+OAkVxuMy4g6ICD6JmR5pyI5pSv5a+55pel5Li755qE55Sf5YWL5YWz57O7XG4gICAtIOaciOaUr+S6lOihjOeUn+aXpeS4u++8miswLjJcbiAgIC0g5pyI5pSv5LqU6KGM5YWL5pel5Li777yaLTAuMlxuICAgLSDml6XkuLvkupTooYzlhYvmnIjmlK/vvJorMC4xXG4gICAtIOaXpeS4u+S6lOihjOeUn+aciOaUr++8mi0wLjFcblxu44CQ57uE5ZCI5b2x5ZON44CRXG40LiDogIPomZHlnLDmlK/kuInlkIjlsYDlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM55Sf5pel5Li777yaKzAuMTVcbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM5YWL5pel5Li777yaLTAuMTVcbiAgIC0g5pel5Li75LqU6KGM5YWL5LiJ5ZCI5bGA77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/kuInlkIjlsYDvvJotMC4xXG5cbjUuIOiAg+iZkeWkqeW5suS6lOWQiOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDkupTlkIjljJbkupTooYznlJ/ml6XkuLvvvJorMC4xXG4gICAtIOS6lOWQiOWMluS6lOihjOWFi+aXpeS4u++8mi0wLjFcbiAgIC0g5pel5Li75Y+C5LiO5LqU5ZCI77yaLTAuMDXvvIjml6XkuLvlj5fnibXliLbvvIlcblxuNi4g6ICD6JmR57qz6Z+z5LqU6KGM5a+55pel5Li755qE5b2x5ZONXG4gICAtIOaXpeafsee6s+mfs+S4juaXpeS4u+S6lOihjOebuOWQjO+8miswLjFcbiAgIC0g5pel5p+x57qz6Z+z55Sf5pel5Li75LqU6KGM77yaKzAuMDVcbiAgIC0g5pel5p+x57qz6Z+z5YWL5pel5Li75LqU6KGM77yaLTAuMDVcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrnlLLlrZAg5LmZ5LiRIOaIiuWNiCDlt7HmnKpcbi0g5pel5Li75Li65oiK5ZyfXG4tIOaciOS7pOS4uuS4keaciO+8iOWGrOWto++8iVxuLSDml6XkuLvkupTooYzlvLrluqborqHnrpfvvJrmiIrlnJ/lvpfliIbkuLo1LjXliIbvvIzmgLvliIbkuLoyMuWIhu+8jOebuOWvueW8uuW6puS4ujAuMjVcbi0g5a2j6IqC5b2x5ZON77ya5Yas5a2j5Zyf5Zua77yM6LCD5pW057O75pWw5Li6LTAuMTVcbi0g5pyI5pSv5LiR5Zyf55Sf5Zyf77yaKzAuMlxuLSDlnLDmlK/kuInlkIjvvJrml6DmmI7mmL7kuInlkIhcbi0g5aSp5bmy5LqU5ZCI77ya5pegXG4tIOe6s+mfs+S6lOihjO+8muaIiuWNiOS4uuWkqeS4iueBq++8jOeBq+eUn+Wcn++8miswLjA1XG5cbuacgOe7iOW+l+WIhu+8mjAuMjUgLSAwLjE1ICsgMC4yICsgMC4wNSA9IDAuMzVcblxu44CQ5pe66KGw5Yik5a6a44CRXG43LiDlvZLkuIDljJblvpfliIbvvIzorqHnrpfmnIDnu4jml7roobDnirbmgIHvvJpcbiAgIC0g5pe677ya5b6X5YiGID4gMC42XG4gICAtIOebuO+8mjAuMyA8IOW+l+WIhiDiiaQgMC42XG4gICAtIOS8ke+8mi0wLjMg4omkIOW+l+WIhiDiiaQgMC4zXG4gICAtIOWbmu+8mi0wLjYg4omkIOW+l+WIhiA8IC0wLjNcbiAgIC0g5q2777ya5b6X5YiGIDwgLTAuNlxuXG7moLnmja7orqHnrpfnu5PmnpwwLjM177yM5pel5Li75Li6XCLnm7hcIuOAgmBcbiAgICAgIH0sXG4gICAgICAn5LyRJzoge1xuICAgICAgICBuYW1lOiAn5LyRJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfml6XkuLvkvJHooajnpLrlkb3kuLvnmoTkupTooYzlipvph4/pgILkuK3lgY/lvLHvvIzmgKfmoLzmuKnlkozvvIzpgILlupTlipvlvLrvvIzkvYblj6/og73nvLrkuY/kuLvop4HmiJblhrPmlq3lipvjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfml6XkuLvkvJHnmoTkurrvvIzmgKfmoLzmuKnlkozvvIzpgILlupTlipvlvLrvvIzog73lpJ/ono3lhaXlkITnp43njq/looPvvIzkvYblj6/og73nvLrkuY/kuLvop4HmiJblhrPmlq3lipvvvIzlrrnmmJPlj5fku5bkurrlvbHlk43jgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOaXpeS4u+aXuuihsOiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDorqHnrpfjgJFcbjEuIOiuoeeul+aXpeS4u+S6lOihjOWcqOWFq+Wtl+S4reeahOW8uuW6plxuICAgLSDpppblhYjnoa7lrprml6XkuLvkupTooYzvvIjml6XlubLmiYDlsZ7kupTooYzvvIlcbiAgIC0g6K6h566X6K+l5LqU6KGM5Zyo5YWr5a2X5Lit55qE5oC75b6X5YiG77yI5oyJ54Wn5LqU6KGM5by65bqm6K6h566X5pa55rOV77yJXG4gICAtIOiuoeeul+aJgOacieS6lOihjOeahOaAu+W+l+WIhlxuICAgLSDorqHnrpfml6XkuLvkupTooYznmoTnm7jlr7nlvLrluqbvvJrml6XkuLvkupTooYzlvpfliIYv5omA5pyJ5LqU6KGM5oC75b6X5YiGXG5cbuOAkOWto+iKguW9seWTjeOAkVxuMi4g6ICD6JmR5a2j6IqC5a+55pel5Li75LqU6KGM55qE5b2x5ZON77yaXG4gICAtIOaYpeWto++8iOato+OAgeS6jOOAgeS4ieaciO+8ie+8mlxuICAgICAqIOacqOaXuigrMC4zKeOAgeeBq+ebuCgrMC4xNSnjgIHlnJ/kvJEoMCnjgIHph5Hlm5ooLTAuMTUp44CB5rC05q27KC0wLjMpXG4gICAtIOWkj+Wto++8iOWbm+OAgeS6lOOAgeWFreaciO+8ie+8mlxuICAgICAqIOeBq+aXuigrMC4zKeOAgeWcn+ebuCgrMC4xNSnjgIHph5HkvJEoMCnjgIHmsLTlm5ooLTAuMTUp44CB5pyo5q27KC0wLjMpXG4gICAtIOeni+Wto++8iOS4g+OAgeWFq+OAgeS5neaciO+8ie+8mlxuICAgICAqIOmHkeaXuigrMC4zKeOAgeawtOebuCgrMC4xNSnjgIHmnKjkvJEoMCnjgIHngavlm5ooLTAuMTUp44CB5Zyf5q27KC0wLjMpXG4gICAtIOWGrOWto++8iOWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ie+8mlxuICAgICAqIOawtOaXuigrMC4zKeOAgeacqOebuCgrMC4xNSnjgIHngavkvJEoMCnjgIHlnJ/lm5ooLTAuMTUp44CB6YeR5q27KC0wLjMpXG5cbuOAkOeUn+WFi+WFs+ezu+OAkVxuMy4g6ICD6JmR5pyI5pSv5a+55pel5Li755qE55Sf5YWL5YWz57O7XG4gICAtIOaciOaUr+S6lOihjOeUn+aXpeS4u++8miswLjJcbiAgIC0g5pyI5pSv5LqU6KGM5YWL5pel5Li777yaLTAuMlxuICAgLSDml6XkuLvkupTooYzlhYvmnIjmlK/vvJorMC4xXG4gICAtIOaXpeS4u+S6lOihjOeUn+aciOaUr++8mi0wLjFcblxu44CQ57uE5ZCI5b2x5ZON44CRXG40LiDogIPomZHlnLDmlK/kuInlkIjlsYDlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM55Sf5pel5Li777yaKzAuMTVcbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM5YWL5pel5Li777yaLTAuMTVcbiAgIC0g5pel5Li75LqU6KGM5YWL5LiJ5ZCI5bGA77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/kuInlkIjlsYDvvJotMC4xXG5cbjUuIOiAg+iZkeWkqeW5suS6lOWQiOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDkupTlkIjljJbkupTooYznlJ/ml6XkuLvvvJorMC4xXG4gICAtIOS6lOWQiOWMluS6lOihjOWFi+aXpeS4u++8mi0wLjFcbiAgIC0g5pel5Li75Y+C5LiO5LqU5ZCI77yaLTAuMDXvvIjml6XkuLvlj5fnibXliLbvvIlcblxuNi4g6ICD6JmR57qz6Z+z5LqU6KGM5a+55pel5Li755qE5b2x5ZONXG4gICAtIOaXpeafsee6s+mfs+S4juaXpeS4u+S6lOihjOebuOWQjO+8miswLjFcbiAgIC0g5pel5p+x57qz6Z+z55Sf5pel5Li75LqU6KGM77yaKzAuMDVcbiAgIC0g5pel5p+x57qz6Z+z5YWL5pel5Li75LqU6KGM77yaLTAuMDVcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrkuJnlrZAg5LiB5LiRIOaIiuWvhSDlt7Hlja9cbi0g5pel5Li75Li65oiK5ZyfXG4tIOaciOS7pOS4uuS4keaciO+8iOWGrOWto++8iVxuLSDml6XkuLvkupTooYzlvLrluqborqHnrpfvvJrmiIrlnJ/lvpfliIbkuLo0LjDliIbvvIzmgLvliIbkuLoyMOWIhu+8jOebuOWvueW8uuW6puS4ujAuMlxuLSDlraPoioLlvbHlk43vvJrlhqzlraPlnJ/lm5rvvIzosIPmlbTns7vmlbDkuLotMC4xNVxuLSDmnIjmlK/kuJHlnJ/nlJ/lnJ/vvJorMC4yXG4tIOWcsOaUr+S4ieWQiO+8muWvheWNr+WPr+iDveS4juacquW9ouaIkOS4ieWQiOacqOWxgO+8jOacqOWFi+Wcn++8mi0wLjE1XG4tIOWkqeW5suS6lOWQiO+8muaXoFxuLSDnurPpn7PkupTooYzvvJrmiIrlr4XkuLrln47lopnlnJ/vvIzkuI7ml6XkuLvlkIznsbvvvJorMC4xXG5cbuacgOe7iOW+l+WIhu+8mjAuMiAtIDAuMTUgKyAwLjIgLSAwLjE1ICsgMC4xID0gMC4yXG5cbuOAkOaXuuihsOWIpOWumuOAkVxuNy4g5b2S5LiA5YyW5b6X5YiG77yM6K6h566X5pyA57uI5pe66KGw54q25oCB77yaXG4gICAtIOaXuu+8muW+l+WIhiA+IDAuNlxuICAgLSDnm7jvvJowLjMgPCDlvpfliIYg4omkIDAuNlxuICAgLSDkvJHvvJotMC4zIOKJpCDlvpfliIYg4omkIDAuM1xuICAgLSDlm5rvvJotMC42IOKJpCDlvpfliIYgPCAtMC4zXG4gICAtIOatu++8muW+l+WIhiA8IC0wLjZcblxu5qC55o2u6K6h566X57uT5p6cMC4y77yM5pel5Li75Li6XCLkvJFcIuOAgmBcbiAgICAgIH0sXG4gICAgICAn5ZuaJzoge1xuICAgICAgICBuYW1lOiAn5ZuaJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfml6XkuLvlm5rooajnpLrlkb3kuLvnmoTkupTooYzlipvph4/ovoPlvLHvvIzkuKrmgKfovoPkuLrlhoXlkJHvvIzoh6rkv6Hlv4PkuI3otrPvvIzlrrnmmJPlj5flpJbnlYzlvbHlk43jgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfml6XkuLvlm5rnmoTkurrvvIzkuKrmgKfovoPkuLrlhoXlkJHvvIzoh6rkv6Hlv4PkuI3otrPvvIzlrrnmmJPlj5flpJbnlYzlvbHlk43vvIzlgZrkuovnvLrkuY/kuLvop4HvvIzkvYbkuLrkurrosKblkozvvIzlloTkuo7lgL7lkKzjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOaXpeS4u+aXuuihsOiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDorqHnrpfjgJFcbjEuIOiuoeeul+aXpeS4u+S6lOihjOWcqOWFq+Wtl+S4reeahOW8uuW6plxuICAgLSDpppblhYjnoa7lrprml6XkuLvkupTooYzvvIjml6XlubLmiYDlsZ7kupTooYzvvIlcbiAgIC0g6K6h566X6K+l5LqU6KGM5Zyo5YWr5a2X5Lit55qE5oC75b6X5YiG77yI5oyJ54Wn5LqU6KGM5by65bqm6K6h566X5pa55rOV77yJXG4gICAtIOiuoeeul+aJgOacieS6lOihjOeahOaAu+W+l+WIhlxuICAgLSDorqHnrpfml6XkuLvkupTooYznmoTnm7jlr7nlvLrluqbvvJrml6XkuLvkupTooYzlvpfliIYv5omA5pyJ5LqU6KGM5oC75b6X5YiGXG5cbuOAkOWto+iKguW9seWTjeOAkVxuMi4g6ICD6JmR5a2j6IqC5a+55pel5Li75LqU6KGM55qE5b2x5ZON77yaXG4gICAtIOaYpeWto++8iOato+OAgeS6jOOAgeS4ieaciO+8ie+8mlxuICAgICAqIOacqOaXuigrMC4zKeOAgeeBq+ebuCgrMC4xNSnjgIHlnJ/kvJEoMCnjgIHph5Hlm5ooLTAuMTUp44CB5rC05q27KC0wLjMpXG4gICAtIOWkj+Wto++8iOWbm+OAgeS6lOOAgeWFreaciO+8ie+8mlxuICAgICAqIOeBq+aXuigrMC4zKeOAgeWcn+ebuCgrMC4xNSnjgIHph5HkvJEoMCnjgIHmsLTlm5ooLTAuMTUp44CB5pyo5q27KC0wLjMpXG4gICAtIOeni+Wto++8iOS4g+OAgeWFq+OAgeS5neaciO+8ie+8mlxuICAgICAqIOmHkeaXuigrMC4zKeOAgeawtOebuCgrMC4xNSnjgIHmnKjkvJEoMCnjgIHngavlm5ooLTAuMTUp44CB5Zyf5q27KC0wLjMpXG4gICAtIOWGrOWto++8iOWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ie+8mlxuICAgICAqIOawtOaXuigrMC4zKeOAgeacqOebuCgrMC4xNSnjgIHngavkvJEoMCnjgIHlnJ/lm5ooLTAuMTUp44CB6YeR5q27KC0wLjMpXG5cbuOAkOeUn+WFi+WFs+ezu+OAkVxuMy4g6ICD6JmR5pyI5pSv5a+55pel5Li755qE55Sf5YWL5YWz57O7XG4gICAtIOaciOaUr+S6lOihjOeUn+aXpeS4u++8miswLjJcbiAgIC0g5pyI5pSv5LqU6KGM5YWL5pel5Li777yaLTAuMlxuICAgLSDml6XkuLvkupTooYzlhYvmnIjmlK/vvJorMC4xXG4gICAtIOaXpeS4u+S6lOihjOeUn+aciOaUr++8mi0wLjFcblxu44CQ57uE5ZCI5b2x5ZON44CRXG40LiDogIPomZHlnLDmlK/kuInlkIjlsYDlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM55Sf5pel5Li777yaKzAuMTVcbiAgIC0g5LiJ5ZCI5bGA5LqU6KGM5YWL5pel5Li777yaLTAuMTVcbiAgIC0g5pel5Li75LqU6KGM5YWL5LiJ5ZCI5bGA77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/kuInlkIjlsYDvvJotMC4xXG5cbjUuIOiAg+iZkeWkqeW5suS6lOWQiOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDkupTlkIjljJbkupTooYznlJ/ml6XkuLvvvJorMC4xXG4gICAtIOS6lOWQiOWMluS6lOihjOWFi+aXpeS4u++8mi0wLjFcbiAgIC0g5pel5Li75Y+C5LiO5LqU5ZCI77yaLTAuMDXvvIjml6XkuLvlj5fnibXliLbvvIlcblxuNi4g6ICD6JmR57qz6Z+z5LqU6KGM5a+55pel5Li755qE5b2x5ZONXG4gICAtIOaXpeafsee6s+mfs+S4juaXpeS4u+S6lOihjOebuOWQjO+8miswLjFcbiAgIC0g5pel5p+x57qz6Z+z55Sf5pel5Li75LqU6KGM77yaKzAuMDVcbiAgIC0g5pel5p+x57qz6Z+z5YWL5pel5Li75LqU6KGM77yaLTAuMDVcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrnlLLlrZAg5LmZ5LiRIOS4meWvhSDkuIHlja9cbi0g5pel5Li75Li65LiZ54GrXG4tIOaciOS7pOS4uuS4keaciO+8iOWGrOWto++8iVxuLSDml6XkuLvkupTooYzlvLrluqborqHnrpfvvJrkuJnngavlvpfliIbkuLoyLjXliIbvvIzmgLvliIbkuLoyMOWIhu+8jOebuOWvueW8uuW6puS4ujAuMTI1XG4tIOWto+iKguW9seWTje+8muWGrOWto+eBq+Wbmu+8jOiwg+aVtOezu+aVsOS4ui0wLjE1XG4tIOaciOaUr+S4keWcn+WFi+eBq++8mi0wLjJcbi0g5Zyw5pSv5LiJ5ZCI77ya5a+F5Y2v5Y+v6IO95LiO5pyq5b2i5oiQ5LiJ5ZCI5pyo5bGA77yM5pyo55Sf54Gr77yaKzAuMTVcbi0g5aSp5bmy5LqU5ZCI77ya5pegXG4tIOe6s+mfs+S6lOihjO+8muS4meWvheS4uueCieS4reeBq++8jOS4juaXpeS4u+WQjOexu++8miswLjFcblxu5pyA57uI5b6X5YiG77yaMC4xMjUgLSAwLjE1IC0gMC4yICsgMC4xNSArIDAuMSA9IC0wLjQ3NVxuXG7jgJDml7roobDliKTlrprjgJFcbjcuIOW9kuS4gOWMluW+l+WIhu+8jOiuoeeul+acgOe7iOaXuuihsOeKtuaAge+8mlxuICAgLSDml7rvvJrlvpfliIYgPiAwLjZcbiAgIC0g55u477yaMC4zIDwg5b6X5YiGIOKJpCAwLjZcbiAgIC0g5LyR77yaLTAuMyDiiaQg5b6X5YiGIOKJpCAwLjNcbiAgIC0g5Zua77yaLTAuNiDiiaQg5b6X5YiGIDwgLTAuM1xuICAgLSDmrbvvvJrlvpfliIYgPCAtMC42XG5cbuagueaNruiuoeeul+e7k+aenC0wLjQ3Ne+8jOaXpeS4u+S4ulwi5ZuaXCLjgIJgXG4gICAgICB9LFxuICAgICAgJ+atuyc6IHtcbiAgICAgICAgbmFtZTogJ+atuycsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5pel5Li75q276KGo56S65ZG95Li755qE5LqU6KGM5Yqb6YeP5p6B5byx77yM5Liq5oCn5Y+v6IO96L+H5LqO6L2v5byx77yM57y65LmP6Ieq5L+h77yM5a655piT5Y+X5Yi25LqO5Lq644CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5pel5Li75q2755qE5Lq677yM5Liq5oCn5Y+v6IO96L+H5LqO6L2v5byx77yM57y65LmP6Ieq5L+h77yM5a655piT5Y+X5Yi25LqO5Lq677yM5YGa5LqL57y65LmP5Li76KeB77yM5L2G5Li65Lq66LCm5ZKM77yM5ZaE5LqO5YC+5ZCs77yM6YCC5ZCI6L6F5Yqp5oCn5bel5L2c44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDml6XkuLvml7roobDorqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA6K6h566X44CRXG4xLiDorqHnrpfml6XkuLvkupTooYzlnKjlhavlrZfkuK3nmoTlvLrluqZcbiAgIC0g6aaW5YWI56Gu5a6a5pel5Li75LqU6KGM77yI5pel5bmy5omA5bGe5LqU6KGM77yJXG4gICAtIOiuoeeul+ivpeS6lOihjOWcqOWFq+Wtl+S4reeahOaAu+W+l+WIhu+8iOaMieeFp+S6lOihjOW8uuW6puiuoeeul+aWueazle+8iVxuICAgLSDorqHnrpfmiYDmnInkupTooYznmoTmgLvlvpfliIZcbiAgIC0g6K6h566X5pel5Li75LqU6KGM55qE55u45a+55by65bqm77ya5pel5Li75LqU6KGM5b6X5YiGL+aJgOacieS6lOihjOaAu+W+l+WIhlxuXG7jgJDlraPoioLlvbHlk43jgJFcbjIuIOiAg+iZkeWto+iKguWvueaXpeS4u+S6lOihjOeahOW9seWTje+8mlxuICAgLSDmmKXlraPvvIjmraPjgIHkuozjgIHkuInmnIjvvInvvJpcbiAgICAgKiDmnKjml7ooKzAuMynjgIHngavnm7goKzAuMTUp44CB5Zyf5LyRKDAp44CB6YeR5ZuaKC0wLjE1KeOAgeawtOatuygtMC4zKVxuICAgLSDlpI/lraPvvIjlm5vjgIHkupTjgIHlha3mnIjvvInvvJpcbiAgICAgKiDngavml7ooKzAuMynjgIHlnJ/nm7goKzAuMTUp44CB6YeR5LyRKDAp44CB5rC05ZuaKC0wLjE1KeOAgeacqOatuygtMC4zKVxuICAgLSDnp4vlraPvvIjkuIPjgIHlhavjgIHkuZ3mnIjvvInvvJpcbiAgICAgKiDph5Hml7ooKzAuMynjgIHmsLTnm7goKzAuMTUp44CB5pyo5LyRKDAp44CB54Gr5ZuaKC0wLjE1KeOAgeWcn+atuygtMC4zKVxuICAgLSDlhqzlraPvvIjljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInvvJpcbiAgICAgKiDmsLTml7ooKzAuMynjgIHmnKjnm7goKzAuMTUp44CB54Gr5LyRKDAp44CB5Zyf5ZuaKC0wLjE1KeOAgemHkeatuygtMC4zKVxuXG7jgJDnlJ/lhYvlhbPns7vjgJFcbjMuIOiAg+iZkeaciOaUr+WvueaXpeS4u+eahOeUn+WFi+WFs+ezu1xuICAgLSDmnIjmlK/kupTooYznlJ/ml6XkuLvvvJorMC4yXG4gICAtIOaciOaUr+S6lOihjOWFi+aXpeS4u++8mi0wLjJcbiAgIC0g5pel5Li75LqU6KGM5YWL5pyI5pSv77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/mnIjmlK/vvJotMC4xXG5cbuOAkOe7hOWQiOW9seWTjeOAkVxuNC4g6ICD6JmR5Zyw5pSv5LiJ5ZCI5bGA5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS4ieWQiOWxgOS6lOihjOeUn+aXpeS4u++8miswLjE1XG4gICAtIOS4ieWQiOWxgOS6lOihjOWFi+aXpeS4u++8mi0wLjE1XG4gICAtIOaXpeS4u+S6lOihjOWFi+S4ieWQiOWxgO+8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5LiJ5ZCI5bGA77yaLTAuMVxuXG41LiDogIPomZHlpKnlubLkupTlkIjlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LqU5ZCI5YyW5LqU6KGM55Sf5pel5Li777yaKzAuMVxuICAgLSDkupTlkIjljJbkupTooYzlhYvml6XkuLvvvJotMC4xXG4gICAtIOaXpeS4u+WPguS4juS6lOWQiO+8mi0wLjA177yI5pel5Li75Y+X54m15Yi277yJXG5cbjYuIOiAg+iZkee6s+mfs+S6lOihjOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDml6Xmn7HnurPpn7PkuI7ml6XkuLvkupTooYznm7jlkIzvvJorMC4xXG4gICAtIOaXpeafsee6s+mfs+eUn+aXpeS4u+S6lOihjO+8miswLjA1XG4gICAtIOaXpeafsee6s+mfs+WFi+aXpeS4u+S6lOihjO+8mi0wLjA1XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya5aOs5a2QIOeZuOS4kSDnlLLlr4Ug5LmZ5Y2vXG4tIOaXpeS4u+S4uueUsuacqFxuLSDmnIjku6TkuLrkuJHmnIjvvIjlhqzlraPvvIlcbi0g5pel5Li75LqU6KGM5by65bqm6K6h566X77ya55Sy5pyo5b6X5YiG5Li6MS415YiG77yM5oC75YiG5Li6MjXliIbvvIznm7jlr7nlvLrluqbkuLowLjA2XG4tIOWto+iKguW9seWTje+8muWGrOWto+acqOebuO+8jOiwg+aVtOezu+aVsOS4uiswLjE1XG4tIOaciOaUr+S4keWcn+WFi+acqO+8mi0wLjJcbi0g5Zyw5pSv5LiJ5ZCI77ya5a2Q5LiR5Y+v6IO95LiO6L6w5b2i5oiQ5LiJ5ZCI5rC05bGA77yM5rC055Sf5pyo77yaKzAuMTVcbi0g5aSp5bmy5LqU5ZCI77ya5pegXG4tIOe6s+mfs+S6lOihjO+8mueUsuWvheS4uuWkp+a6quawtO+8jOawtOeUn+acqO+8miswLjA1XG5cbuacgOe7iOW+l+WIhu+8mjAuMDYgKyAwLjE1IC0gMC4yICsgMC4xNSArIDAuMDUgPSAtMC43OVxuXG7jgJDml7roobDliKTlrprjgJFcbjcuIOW9kuS4gOWMluW+l+WIhu+8jOiuoeeul+acgOe7iOaXuuihsOeKtuaAge+8mlxuICAgLSDml7rvvJrlvpfliIYgPiAwLjZcbiAgIC0g55u477yaMC4zIDwg5b6X5YiGIOKJpCAwLjZcbiAgIC0g5LyR77yaLTAuMyDiiaQg5b6X5YiGIOKJpCAwLjNcbiAgIC0g5Zua77yaLTAuNiDiiaQg5b6X5YiGIDwgLTAuM1xuICAgLSDmrbvvvJrlvpfliIYgPCAtMC42XG5cbuagueaNruiuoeeul+e7k+aenC0wLjc577yM5pel5Li75Li6XCLmrbtcIuOAgmBcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGV4cGxhbmF0aW9uc1tyaVpodV0gfHwgbnVsbDtcbiAgfVxufVxuIl19