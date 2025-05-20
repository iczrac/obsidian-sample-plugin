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
                calculation: `金五行强度计算方法：

【基础得分】
1. 天干五行：
   - 年干为庚、辛，得分1.0
   - 月干为庚、辛，得分2.0
   - 日干为庚、辛，得分3.0
   - 时干为庚、辛，得分1.0

2. 地支藏干：
   - 年支藏庚、辛，得分0.7
   - 月支藏庚、辛，得分1.5
   - 日支藏庚、辛，得分2.0
   - 时支藏庚、辛，得分0.7

3. 纳音五行：
   - 年柱纳音为金，得分0.5
   - 月柱纳音为金，得分1.0
   - 日柱纳音为金，得分1.5
   - 时柱纳音为金，得分0.5

【调整系数】
4. 季节调整：
   - 秋季（农历七、八、九月）金旺，得分+1.0
   - 冬季（农历十、十一、十二月）金相对弱，得分-0.5
   - 春季（农历正、二、三月）金死，得分-1.0
   - 夏季（农历四、五、六月）金囚，得分-0.8

5. 组合调整：
   - 天干五合：乙庚合化金，得分+0.5
   - 地支三合：巳酉丑三合金局，得分+1.0
   - 地支半三合：巳酉半合金，得分+0.5
   - 地支三会：申酉戌三会金，得分+0.8

【计算示例】
假设八字为：庚子 辛丑 庚午 辛未
1. 天干：庚(年干)+辛(月干)+庚(日干)+辛(时干) = 1.0+2.0+3.0+1.0 = 7.0分
2. 地支藏干：
   - 子藏癸(水)，无金藏干
   - 丑藏己(土)、辛(金)、癸(水)，辛得分1.5
   - 午藏丁(火)、己(土)，无金藏干
   - 未藏乙(木)、己(土)、丁(火)，无金藏干
   地支藏干得分：0+1.5+0+0 = 1.5分
3. 纳音：
   - 庚子为壁上土，无金
   - 辛丑为壁上土，无金
   - 庚午为路旁土，无金
   - 辛未为路旁土，无金
   纳音得分：0分
4. 季节：八字月柱为辛丑，农历为丑月(冬季)，金相对弱，得分-0.5
5. 组合：
   - 天干：无五合
   - 地支：子、丑、午、未无三合金局
   组合得分：0分

金五行总得分：7.0+1.5+0-0.5+0 = 8.0分

【归一化处理】
最后将所有五行得分归一化，计算相对强度：
金五行相对强度 = 金五行总分 / (金+木+水+火+土总分) * 10`
            },
            '木': {
                name: '木',
                explanation: '木五行代表生长、创造、进取心。木过强则固执，木过弱则缺乏进取心。',
                influence: '木五行强的人，有进取心，创造力强，但可能过于固执；木五行弱的人，缺乏进取心，随遇而安，但为人随和。',
                calculation: `木五行强度计算方法：

【基础得分】
1. 天干五行：
   - 年干为甲、乙，得分1.0
   - 月干为甲、乙，得分2.0
   - 日干为甲、乙，得分3.0
   - 时干为甲、乙，得分1.0

2. 地支藏干：
   - 年支藏甲、乙，得分0.7
   - 月支藏甲、乙，得分1.5
   - 日支藏甲、乙，得分2.0
   - 时支藏甲、乙，得分0.7

3. 纳音五行：
   - 年柱纳音为木，得分0.5
   - 月柱纳音为木，得分1.0
   - 日柱纳音为木，得分1.5
   - 时柱纳音为木，得分0.5

【调整系数】
4. 季节调整：
   - 春季（农历正、二、三月）木旺，得分+1.0
   - 冬季（农历十、十一、十二月）木相对强，得分+0.5
   - 夏季（农历四、五、六月）木死，得分-1.0
   - 秋季（农历七、八、九月）木囚，得分-0.8

5. 组合调整：
   - 天干五合：丁壬合化木，得分+0.5
   - 地支三合：亥卯未三合木局，得分+1.0
   - 地支半三合：亥卯半合木，得分+0.5
   - 地支三会：寅卯辰三会木，得分+0.8

【计算示例】
假设八字为：甲寅 乙卯 丙辰 丁巳
1. 天干：甲(年干)+乙(月干)+丙(日干)+丁(时干) = 1.0+2.0+0+0 = 3.0分
2. 地支藏干：
   - 寅藏甲(木)、丙(火)、戊(土)，甲得分0.7
   - 卯藏乙(木)，乙得分1.5
   - 辰藏戊(土)、乙(木)、癸(水)，乙得分2.0
   - 巳藏丙(火)、庚(金)、戊(土)，无木藏干
   地支藏干得分：0.7+1.5+2.0+0 = 4.2分
3. 纳音：
   - 甲寅为大溪水，无木
   - 乙卯为大溪水，无木
   - 丙辰为沙中土，无木
   - 丁巳为沙中土，无木
   纳音得分：0分
4. 季节：八字月柱为乙卯，农历为卯月(春季)，木旺，得分+1.0
5. 组合：
   - 天干：无五合
   - 地支：寅、卯、辰三会木局，得分+0.8
   组合得分：0.8分

木五行总得分：3.0+4.2+0+1.0+0.8 = 9.0分

【归一化处理】
最后将所有五行得分归一化，计算相对强度：
木五行相对强度 = 木五行总分 / (金+木+水+火+土总分) * 10`
            },
            '水': {
                name: '水',
                explanation: '水五行代表智慧、沟通、适应力。水过强则多虑，水过弱则缺乏智慧。',
                influence: '水五行强的人，聪明智慧，善于沟通，适应力强，但可能过于多虑；水五行弱的人，缺乏智慧，沟通能力差，但为人踏实。',
                calculation: `水五行强度计算方法：

【基础得分】
1. 天干五行：
   - 年干为壬、癸，得分1.0
   - 月干为壬、癸，得分2.0
   - 日干为壬、癸，得分3.0
   - 时干为壬、癸，得分1.0

2. 地支藏干：
   - 年支藏壬、癸，得分0.7
   - 月支藏壬、癸，得分1.5
   - 日支藏壬、癸，得分2.0
   - 时支藏壬、癸，得分0.7

3. 纳音五行：
   - 年柱纳音为水，得分0.5
   - 月柱纳音为水，得分1.0
   - 日柱纳音为水，得分1.5
   - 时柱纳音为水，得分0.5

【调整系数】
4. 季节调整：
   - 冬季（农历十、十一、十二月）水旺，得分+1.0
   - 秋季（农历七、八、九月）水相对强，得分+0.5
   - 春季（农历正、二、三月）水囚，得分-0.8
   - 夏季（农历四、五、六月）水死，得分-1.0

5. 组合调整：
   - 天干五合：丙辛合化水，得分+0.5
   - 地支三合：申子辰三合水局，得分+1.0
   - 地支半三合：申子半合水，得分+0.5
   - 地支三会：亥子丑三会水，得分+0.8

【计算示例】
假设八字为：壬子 癸丑 甲寅 乙卯
1. 天干：壬(年干)+癸(月干)+甲(日干)+乙(时干) = 1.0+2.0+0+0 = 3.0分
2. 地支藏干：
   - 子藏癸(水)，癸得分0.7
   - 丑藏己(土)、辛(金)、癸(水)，癸得分1.5
   - 寅藏甲(木)、丙(火)、戊(土)，无水藏干
   - 卯藏乙(木)，无水藏干
   地支藏干得分：0.7+1.5+0+0 = 2.2分
3. 纳音：
   - 壬子为桑松木，无水
   - 癸丑为桑松木，无水
   - 甲寅为大溪水，得分1.5
   - 乙卯为大溪水，得分0.5
   纳音得分：0+0+1.5+0.5 = 2.0分
4. 季节：八字月柱为癸丑，农历为丑月(冬季)，水旺，得分+1.0
5. 组合：
   - 天干：无五合
   - 地支：子、丑与亥子丑三会水局相关，得分+0.4
   组合得分：0.4分

水五行总得分：3.0+2.2+2.0+1.0+0.4 = 8.6分

【归一化处理】
最后将所有五行得分归一化，计算相对强度：
水五行相对强度 = 水五行总分 / (金+木+水+火+土总分) * 10`
            },
            '火': {
                name: '火',
                explanation: '火五行代表热情、活力、表现力。火过强则浮躁，火过弱则缺乏热情。',
                influence: '火五行强的人，热情活力，表现力强，但可能过于浮躁；火五行弱的人，缺乏热情，表现力差，但为人稳重。',
                calculation: `火五行强度计算方法：

【基础得分】
1. 天干五行：
   - 年干为丙、丁，得分1.0
   - 月干为丙、丁，得分2.0
   - 日干为丙、丁，得分3.0
   - 时干为丙、丁，得分1.0

2. 地支藏干：
   - 年支藏丙、丁，得分0.7
   - 月支藏丙、丁，得分1.5
   - 日支藏丙、丁，得分2.0
   - 时支藏丙、丁，得分0.7

3. 纳音五行：
   - 年柱纳音为火，得分0.5
   - 月柱纳音为火，得分1.0
   - 日柱纳音为火，得分1.5
   - 时柱纳音为火，得分0.5

【调整系数】
4. 季节调整：
   - 夏季（农历四、五、六月）火旺，得分+1.0
   - 春季（农历正、二、三月）火相对强，得分+0.5
   - 秋季（农历七、八、九月）火死，得分-1.0
   - 冬季（农历十、十一、十二月）火囚，得分-0.8

5. 组合调整：
   - 天干五合：戊癸合化火，得分+0.5
   - 地支三合：寅午戌三合火局，得分+1.0
   - 地支半三合：寅午半合火，得分+0.5
   - 地支三会：巳午未三会火，得分+0.8

【计算示例】
假设八字为：丙午 丁未 戊申 己酉
1. 天干：丙(年干)+丁(月干)+戊(日干)+己(时干) = 1.0+2.0+0+0 = 3.0分
2. 地支藏干：
   - 午藏丁(火)、己(土)，丁得分0.7
   - 未藏乙(木)、己(土)、丁(火)，丁得分1.5
   - 申藏庚(金)、壬(水)、戊(土)，无火藏干
   - 酉藏辛(金)，无火藏干
   地支藏干得分：0.7+1.5+0+0 = 2.2分
3. 纳音：
   - 丙午为天河水，无火
   - 丁未为天河水，无火
   - 戊申为大驿土，无火
   - 己酉为大驿土，无火
   纳音得分：0分
4. 季节：八字月柱为丁未，农历为未月(夏季)，火旺，得分+1.0
5. 组合：
   - 天干：无五合
   - 地支：午、未与巳午未三会火局相关，得分+0.6
   组合得分：0.6分

火五行总得分：3.0+2.2+0+1.0+0.6 = 6.8分

【归一化处理】
最后将所有五行得分归一化，计算相对强度：
火五行相对强度 = 火五行总分 / (金+木+水+火+土总分) * 10`
            },
            '土': {
                name: '土',
                explanation: '土五行代表稳重、踏实、包容力。土过强则保守，土过弱则缺乏稳定性。',
                influence: '土五行强的人，稳重踏实，包容力强，但可能过于保守；土五行弱的人，缺乏稳定性，做事不踏实，但为人灵活。',
                calculation: `土五行强度计算方法：

【基础得分】
1. 天干五行：
   - 年干为戊、己，得分1.0
   - 月干为戊、己，得分2.0
   - 日干为戊、己，得分3.0
   - 时干为戊、己，得分1.0

2. 地支藏干：
   - 年支藏戊、己，得分0.7
   - 月支藏戊、己，得分1.5
   - 日支藏戊、己，得分2.0
   - 时支藏戊、己，得分0.7

3. 纳音五行：
   - 年柱纳音为土，得分0.5
   - 月柱纳音为土，得分1.0
   - 日柱纳音为土，得分1.5
   - 时柱纳音为土，得分0.5

【调整系数】
4. 季节调整：
   - 每季最后一个月（农历三、六、九、十二月）土旺，得分+1.0
   - 夏季（农历四、五、六月）土相对强，得分+0.5
   - 冬季（农历十、十一、十二月）土死，得分-1.0
   - 秋季（农历七、八、九月）土囚，得分-0.8

5. 组合调整：
   - 天干五合：甲己合化土，得分+0.5
   - 地支三合：辰戌丑三合土局，得分+1.0
   - 地支半三合：辰戌半合土，得分+0.5
   - 地支三会：辰巳午三会土，得分+0.8

【计算示例】
假设八字为：戊辰 己巳 庚午 辛未
1. 天干：戊(年干)+己(月干)+庚(日干)+辛(时干) = 1.0+2.0+0+0 = 3.0分
2. 地支藏干：
   - 辰藏戊(土)、乙(木)、癸(水)，戊得分0.7
   - 巳藏丙(火)、庚(金)、戊(土)，戊得分1.5
   - 午藏丁(火)、己(土)，己得分2.0
   - 未藏乙(木)、己(土)、丁(火)，己得分0.7
   地支藏干得分：0.7+1.5+2.0+0.7 = 4.9分
3. 纳音：
   - 戊辰为大林木，无土
   - 己巳为大林木，无土
   - 庚午为路旁土，得分1.5
   - 辛未为路旁土，得分0.5
   纳音得分：0+0+1.5+0.5 = 2.0分
4. 季节：八字月柱为己巳，农历为巳月(夏季)，土相对强，得分+0.5
5. 组合：
   - 天干：无五合
   - 地支：辰、巳与辰巳午三会土局相关，得分+0.6
   组合得分：0.6分

土五行总得分：3.0+4.9+2.0+0.5+0.6 = 11.0分

【归一化处理】
最后将所有五行得分归一化，计算相对强度：
土五行相对强度 = 土五行总分 / (金+木+水+火+土总分) * 10`
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3VYaW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIld1WGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEI7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBYztRQUN4QyxNQUFNLFlBQVksR0FBcUc7WUFDckgsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSxvQ0FBb0M7Z0JBQ2pELFNBQVMsRUFBRSx3REFBd0Q7Z0JBQ25FLFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBMkRnQjthQUM5QjtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsa0NBQWtDO2dCQUMvQyxTQUFTLEVBQUUsbURBQW1EO2dCQUM5RCxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQTJEZ0I7YUFDOUI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLGlDQUFpQztnQkFDOUMsU0FBUyxFQUFFLHdEQUF3RDtnQkFDbkUsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQ0EyRGdCO2FBQzlCO1lBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSxpQ0FBaUM7Z0JBQzlDLFNBQVMsRUFBRSxrREFBa0Q7Z0JBQzdELFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBMkRnQjthQUM5QjtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsa0NBQWtDO2dCQUMvQyxTQUFTLEVBQUUsb0RBQW9EO2dCQUMvRCxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQTJEZ0I7YUFDOUI7U0FDRixDQUFDO1FBRUYsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFhO1FBQ3RDLE1BQU0sWUFBWSxHQUFxRztZQUNySCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLDRDQUE0QztnQkFDekQsU0FBUyxFQUFFLGlEQUFpRDtnQkFDNUQsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFpRUE7YUFDZDtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUseUNBQXlDO2dCQUN0RCxTQUFTLEVBQUUsK0NBQStDO2dCQUMxRCxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWlFRjthQUNaO1lBQ0QsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULFdBQVcsRUFBRSx5Q0FBeUM7Z0JBQ3RELFNBQVMsRUFBRSwrQ0FBK0M7Z0JBQzFELFdBQVcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBaUVIO2FBQ1g7WUFDRCxHQUFHLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsV0FBVyxFQUFFLHNDQUFzQztnQkFDbkQsU0FBUyxFQUFFLCtDQUErQztnQkFDMUQsV0FBVyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFpRUE7YUFDZDtZQUNELEdBQUcsRUFBRTtnQkFDSCxJQUFJLEVBQUUsR0FBRztnQkFDVCxXQUFXLEVBQUUsc0NBQXNDO2dCQUNuRCxTQUFTLEVBQUUsdURBQXVEO2dCQUNsRSxXQUFXLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWlFRDthQUNiO1NBQ0YsQ0FBQztRQUVGLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNyQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOS6lOihjOacjeWKoeexu1xuICog5o+Q5L6b5LqU6KGM5by65bqm5ZKM5pel5Li75pe66KGw55qE6K+m57uG6Kej6YeKXG4gKi9cbmV4cG9ydCBjbGFzcyBXdVhpbmdTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIOiOt+WPluS6lOihjOeahOivpue7huS/oeaBr1xuICAgKiBAcGFyYW0gd3VYaW5nIOS6lOihjOWQjeensFxuICAgKiBAcmV0dXJucyDkupTooYznmoTor6bnu4bkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0V3VYaW5nSW5mbyh3dVhpbmc6IHN0cmluZyk6IHsgbmFtZTogc3RyaW5nOyBleHBsYW5hdGlvbjogc3RyaW5nOyBpbmZsdWVuY2U6IHN0cmluZzsgY2FsY3VsYXRpb246IHN0cmluZyB9IHwgbnVsbCB7XG4gICAgY29uc3QgZXhwbGFuYXRpb25zOiB7IFtrZXk6IHN0cmluZ106IHsgbmFtZTogc3RyaW5nOyBleHBsYW5hdGlvbjogc3RyaW5nOyBpbmZsdWVuY2U6IHN0cmluZzsgY2FsY3VsYXRpb246IHN0cmluZyB9IH0gPSB7XG4gICAgICAn6YeRJzoge1xuICAgICAgICBuYW1lOiAn6YeRJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfph5HkupTooYzku6PooajlnZrlvLrjgIHliJrmr4XjgIHlhrPmlq3lipvjgILph5Hov4flvLrliJnov4fkuo7liJrnoazvvIzph5Hov4flvLHliJnnvLrkuY/lhrPmlq3lipvjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfph5HkupTooYzlvLrnmoTkurrvvIzmgKfmoLzliJrmr4XvvIzmnInlhrPmlq3lipvvvIzlgZrkuovmnpzmlq3vvIzkvYblj6/og73ov4fkuo7lm7rmiafvvJvph5HkupTooYzlvLHnmoTkurrvvIznvLrkuY/lhrPmlq3lipvvvIzkvJjmn5Tlr6Hmlq3vvIzkvYbkuLrkurrmuKnlkozjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOmHkeS6lOihjOW8uuW6puiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDlvpfliIbjgJFcbjEuIOWkqeW5suS6lOihjO+8mlxuICAgLSDlubTlubLkuLrluprjgIHovpvvvIzlvpfliIYxLjBcbiAgIC0g5pyI5bmy5Li65bqa44CB6L6b77yM5b6X5YiGMi4wXG4gICAtIOaXpeW5suS4uuW6muOAgei+m++8jOW+l+WIhjMuMFxuICAgLSDml7blubLkuLrluprjgIHovpvvvIzlvpfliIYxLjBcblxuMi4g5Zyw5pSv6JeP5bmy77yaXG4gICAtIOW5tOaUr+iXj+W6muOAgei+m++8jOW+l+WIhjAuN1xuICAgLSDmnIjmlK/ol4/luprjgIHovpvvvIzlvpfliIYxLjVcbiAgIC0g5pel5pSv6JeP5bqa44CB6L6b77yM5b6X5YiGMi4wXG4gICAtIOaXtuaUr+iXj+W6muOAgei+m++8jOW+l+WIhjAuN1xuXG4zLiDnurPpn7PkupTooYzvvJpcbiAgIC0g5bm05p+x57qz6Z+z5Li66YeR77yM5b6X5YiGMC41XG4gICAtIOaciOafsee6s+mfs+S4uumHke+8jOW+l+WIhjEuMFxuICAgLSDml6Xmn7HnurPpn7PkuLrph5HvvIzlvpfliIYxLjVcbiAgIC0g5pe25p+x57qz6Z+z5Li66YeR77yM5b6X5YiGMC41XG5cbuOAkOiwg+aVtOezu+aVsOOAkVxuNC4g5a2j6IqC6LCD5pW077yaXG4gICAtIOeni+Wto++8iOWGnOWOhuS4g+OAgeWFq+OAgeS5neaciO+8iemHkeaXuu+8jOW+l+WIhisxLjBcbiAgIC0g5Yas5a2j77yI5Yac5Y6G5Y2B44CB5Y2B5LiA44CB5Y2B5LqM5pyI77yJ6YeR55u45a+55byx77yM5b6X5YiGLTAuNVxuICAgLSDmmKXlraPvvIjlhpzljobmraPjgIHkuozjgIHkuInmnIjvvInph5HmrbvvvIzlvpfliIYtMS4wXG4gICAtIOWkj+Wto++8iOWGnOWOhuWbm+OAgeS6lOOAgeWFreaciO+8iemHkeWbmu+8jOW+l+WIhi0wLjhcblxuNS4g57uE5ZCI6LCD5pW077yaXG4gICAtIOWkqeW5suS6lOWQiO+8muS5meW6muWQiOWMlumHke+8jOW+l+WIhiswLjVcbiAgIC0g5Zyw5pSv5LiJ5ZCI77ya5bez6YWJ5LiR5LiJ5ZCI6YeR5bGA77yM5b6X5YiGKzEuMFxuICAgLSDlnLDmlK/ljYrkuInlkIjvvJrlt7PphYnljYrlkIjph5HvvIzlvpfliIYrMC41XG4gICAtIOWcsOaUr+S4ieS8mu+8mueUs+mFieaIjOS4ieS8mumHke+8jOW+l+WIhiswLjhcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrluprlrZAg6L6b5LiRIOW6muWNiCDovpvmnKpcbjEuIOWkqeW5su+8muW6mijlubTlubIpK+i+myjmnIjlubIpK+W6mijml6XlubIpK+i+myjml7blubIpID0gMS4wKzIuMCszLjArMS4wID0gNy4w5YiGXG4yLiDlnLDmlK/ol4/lubLvvJpcbiAgIC0g5a2Q6JeP55m4KOawtCnvvIzml6Dph5Hol4/lubJcbiAgIC0g5LiR6JeP5bexKOWcnynjgIHovpso6YeRKeOAgeeZuCjmsLQp77yM6L6b5b6X5YiGMS41XG4gICAtIOWNiOiXj+S4gSjngasp44CB5bexKOWcnynvvIzml6Dph5Hol4/lubJcbiAgIC0g5pyq6JeP5LmZKOacqCnjgIHlt7Eo5ZyfKeOAgeS4gSjngasp77yM5peg6YeR6JeP5bmyXG4gICDlnLDmlK/ol4/lubLlvpfliIbvvJowKzEuNSswKzAgPSAxLjXliIZcbjMuIOe6s+mfs++8mlxuICAgLSDluprlrZDkuLrlo4HkuIrlnJ/vvIzml6Dph5FcbiAgIC0g6L6b5LiR5Li65aOB5LiK5Zyf77yM5peg6YeRXG4gICAtIOW6muWNiOS4uui3r+aXgeWcn++8jOaXoOmHkVxuICAgLSDovpvmnKrkuLrot6/ml4HlnJ/vvIzml6Dph5FcbiAgIOe6s+mfs+W+l+WIhu+8mjDliIZcbjQuIOWto+iKgu+8muWFq+Wtl+aciOafseS4uui+m+S4ke+8jOWGnOWOhuS4uuS4keaciCjlhqzlraMp77yM6YeR55u45a+55byx77yM5b6X5YiGLTAuNVxuNS4g57uE5ZCI77yaXG4gICAtIOWkqeW5su+8muaXoOS6lOWQiFxuICAgLSDlnLDmlK/vvJrlrZDjgIHkuJHjgIHljYjjgIHmnKrml6DkuInlkIjph5HlsYBcbiAgIOe7hOWQiOW+l+WIhu+8mjDliIZcblxu6YeR5LqU6KGM5oC75b6X5YiG77yaNy4wKzEuNSswLTAuNSswID0gOC4w5YiGXG5cbuOAkOW9kuS4gOWMluWkhOeQhuOAkVxu5pyA5ZCO5bCG5omA5pyJ5LqU6KGM5b6X5YiG5b2S5LiA5YyW77yM6K6h566X55u45a+55by65bqm77yaXG7ph5HkupTooYznm7jlr7nlvLrluqYgPSDph5HkupTooYzmgLvliIYgLyAo6YeRK+acqCvmsLQr54GrK+Wcn+aAu+WIhikgKiAxMGBcbiAgICAgIH0sXG4gICAgICAn5pyoJzoge1xuICAgICAgICBuYW1lOiAn5pyoJyxcbiAgICAgICAgZXhwbGFuYXRpb246ICfmnKjkupTooYzku6PooajnlJ/plb/jgIHliJvpgKDjgIHov5vlj5blv4PjgILmnKjov4flvLrliJnlm7rmiafvvIzmnKjov4flvLHliJnnvLrkuY/ov5vlj5blv4PjgIInLFxuICAgICAgICBpbmZsdWVuY2U6ICfmnKjkupTooYzlvLrnmoTkurrvvIzmnInov5vlj5blv4PvvIzliJvpgKDlipvlvLrvvIzkvYblj6/og73ov4fkuo7lm7rmiafvvJvmnKjkupTooYzlvLHnmoTkurrvvIznvLrkuY/ov5vlj5blv4PvvIzpmo/pgYfogIzlronvvIzkvYbkuLrkurrpmo/lkozjgIInLFxuICAgICAgICBjYWxjdWxhdGlvbjogYOacqOS6lOihjOW8uuW6puiuoeeul+aWueazle+8mlxuXG7jgJDln7rnoYDlvpfliIbjgJFcbjEuIOWkqeW5suS6lOihjO+8mlxuICAgLSDlubTlubLkuLrnlLLjgIHkuZnvvIzlvpfliIYxLjBcbiAgIC0g5pyI5bmy5Li655Sy44CB5LmZ77yM5b6X5YiGMi4wXG4gICAtIOaXpeW5suS4uueUsuOAgeS5me+8jOW+l+WIhjMuMFxuICAgLSDml7blubLkuLrnlLLjgIHkuZnvvIzlvpfliIYxLjBcblxuMi4g5Zyw5pSv6JeP5bmy77yaXG4gICAtIOW5tOaUr+iXj+eUsuOAgeS5me+8jOW+l+WIhjAuN1xuICAgLSDmnIjmlK/ol4/nlLLjgIHkuZnvvIzlvpfliIYxLjVcbiAgIC0g5pel5pSv6JeP55Sy44CB5LmZ77yM5b6X5YiGMi4wXG4gICAtIOaXtuaUr+iXj+eUsuOAgeS5me+8jOW+l+WIhjAuN1xuXG4zLiDnurPpn7PkupTooYzvvJpcbiAgIC0g5bm05p+x57qz6Z+z5Li65pyo77yM5b6X5YiGMC41XG4gICAtIOaciOafsee6s+mfs+S4uuacqO+8jOW+l+WIhjEuMFxuICAgLSDml6Xmn7HnurPpn7PkuLrmnKjvvIzlvpfliIYxLjVcbiAgIC0g5pe25p+x57qz6Z+z5Li65pyo77yM5b6X5YiGMC41XG5cbuOAkOiwg+aVtOezu+aVsOOAkVxuNC4g5a2j6IqC6LCD5pW077yaXG4gICAtIOaYpeWto++8iOWGnOWOhuato+OAgeS6jOOAgeS4ieaciO+8ieacqOaXuu+8jOW+l+WIhisxLjBcbiAgIC0g5Yas5a2j77yI5Yac5Y6G5Y2B44CB5Y2B5LiA44CB5Y2B5LqM5pyI77yJ5pyo55u45a+55by677yM5b6X5YiGKzAuNVxuICAgLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInmnKjmrbvvvIzlvpfliIYtMS4wXG4gICAtIOeni+Wto++8iOWGnOWOhuS4g+OAgeWFq+OAgeS5neaciO+8ieacqOWbmu+8jOW+l+WIhi0wLjhcblxuNS4g57uE5ZCI6LCD5pW077yaXG4gICAtIOWkqeW5suS6lOWQiO+8muS4geWjrOWQiOWMluacqO+8jOW+l+WIhiswLjVcbiAgIC0g5Zyw5pSv5LiJ5ZCI77ya5Lql5Y2v5pyq5LiJ5ZCI5pyo5bGA77yM5b6X5YiGKzEuMFxuICAgLSDlnLDmlK/ljYrkuInlkIjvvJrkuqXlja/ljYrlkIjmnKjvvIzlvpfliIYrMC41XG4gICAtIOWcsOaUr+S4ieS8mu+8muWvheWNr+i+sOS4ieS8muacqO+8jOW+l+WIhiswLjhcblxu44CQ6K6h566X56S65L6L44CRXG7lgYforr7lhavlrZfkuLrvvJrnlLLlr4Ug5LmZ5Y2vIOS4mei+sCDkuIHlt7NcbjEuIOWkqeW5su+8mueUsijlubTlubIpK+S5mSjmnIjlubIpK+S4mSjml6XlubIpK+S4gSjml7blubIpID0gMS4wKzIuMCswKzAgPSAzLjDliIZcbjIuIOWcsOaUr+iXj+W5su+8mlxuICAgLSDlr4Xol4/nlLIo5pyoKeOAgeS4mSjngasp44CB5oiKKOWcnynvvIznlLLlvpfliIYwLjdcbiAgIC0g5Y2v6JeP5LmZKOacqCnvvIzkuZnlvpfliIYxLjVcbiAgIC0g6L6w6JeP5oiKKOWcnynjgIHkuZko5pyoKeOAgeeZuCjmsLQp77yM5LmZ5b6X5YiGMi4wXG4gICAtIOW3s+iXj+S4mSjngasp44CB5bqaKOmHkSnjgIHmiIoo5ZyfKe+8jOaXoOacqOiXj+W5slxuICAg5Zyw5pSv6JeP5bmy5b6X5YiG77yaMC43KzEuNSsyLjArMCA9IDQuMuWIhlxuMy4g57qz6Z+z77yaXG4gICAtIOeUsuWvheS4uuWkp+a6quawtO+8jOaXoOacqFxuICAgLSDkuZnlja/kuLrlpKfmuqrmsLTvvIzml6DmnKhcbiAgIC0g5LiZ6L6w5Li65rKZ5Lit5Zyf77yM5peg5pyoXG4gICAtIOS4geW3s+S4uuaymeS4reWcn++8jOaXoOacqFxuICAg57qz6Z+z5b6X5YiG77yaMOWIhlxuNC4g5a2j6IqC77ya5YWr5a2X5pyI5p+x5Li65LmZ5Y2v77yM5Yac5Y6G5Li65Y2v5pyIKOaYpeWtoynvvIzmnKjml7rvvIzlvpfliIYrMS4wXG41LiDnu4TlkIjvvJpcbiAgIC0g5aSp5bmy77ya5peg5LqU5ZCIXG4gICAtIOWcsOaUr++8muWvheOAgeWNr+OAgei+sOS4ieS8muacqOWxgO+8jOW+l+WIhiswLjhcbiAgIOe7hOWQiOW+l+WIhu+8mjAuOOWIhlxuXG7mnKjkupTooYzmgLvlvpfliIbvvJozLjArNC4yKzArMS4wKzAuOCA9IDkuMOWIhlxuXG7jgJDlvZLkuIDljJblpITnkIbjgJFcbuacgOWQjuWwhuaJgOacieS6lOihjOW+l+WIhuW9kuS4gOWMlu+8jOiuoeeul+ebuOWvueW8uuW6pu+8mlxu5pyo5LqU6KGM55u45a+55by65bqmID0g5pyo5LqU6KGM5oC75YiGIC8gKOmHkSvmnKgr5rC0K+eBqyvlnJ/mgLvliIYpICogMTBgXG4gICAgICB9LFxuICAgICAgJ+awtCc6IHtcbiAgICAgICAgbmFtZTogJ+awtCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5rC05LqU6KGM5Luj6KGo5pm65oWn44CB5rKf6YCa44CB6YCC5bqU5Yqb44CC5rC06L+H5by65YiZ5aSa6JmR77yM5rC06L+H5byx5YiZ57y65LmP5pm65oWn44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5rC05LqU6KGM5by655qE5Lq677yM6IGq5piO5pm65oWn77yM5ZaE5LqO5rKf6YCa77yM6YCC5bqU5Yqb5by677yM5L2G5Y+v6IO96L+H5LqO5aSa6JmR77yb5rC05LqU6KGM5byx55qE5Lq677yM57y65LmP5pm65oWn77yM5rKf6YCa6IO95Yqb5beu77yM5L2G5Li65Lq66LiP5a6e44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDmsLTkupTooYzlvLrluqborqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA5b6X5YiG44CRXG4xLiDlpKnlubLkupTooYzvvJpcbiAgIC0g5bm05bmy5Li65aOs44CB55m477yM5b6X5YiGMS4wXG4gICAtIOaciOW5suS4uuWjrOOAgeeZuO+8jOW+l+WIhjIuMFxuICAgLSDml6XlubLkuLrlo6zjgIHnmbjvvIzlvpfliIYzLjBcbiAgIC0g5pe25bmy5Li65aOs44CB55m477yM5b6X5YiGMS4wXG5cbjIuIOWcsOaUr+iXj+W5su+8mlxuICAgLSDlubTmlK/ol4/lo6zjgIHnmbjvvIzlvpfliIYwLjdcbiAgIC0g5pyI5pSv6JeP5aOs44CB55m477yM5b6X5YiGMS41XG4gICAtIOaXpeaUr+iXj+WjrOOAgeeZuO+8jOW+l+WIhjIuMFxuICAgLSDml7bmlK/ol4/lo6zjgIHnmbjvvIzlvpfliIYwLjdcblxuMy4g57qz6Z+z5LqU6KGM77yaXG4gICAtIOW5tOafsee6s+mfs+S4uuawtO+8jOW+l+WIhjAuNVxuICAgLSDmnIjmn7HnurPpn7PkuLrmsLTvvIzlvpfliIYxLjBcbiAgIC0g5pel5p+x57qz6Z+z5Li65rC077yM5b6X5YiGMS41XG4gICAtIOaXtuafsee6s+mfs+S4uuawtO+8jOW+l+WIhjAuNVxuXG7jgJDosIPmlbTns7vmlbDjgJFcbjQuIOWto+iKguiwg+aVtO+8mlxuICAgLSDlhqzlraPvvIjlhpzljobljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInmsLTml7rvvIzlvpfliIYrMS4wXG4gICAtIOeni+Wto++8iOWGnOWOhuS4g+OAgeWFq+OAgeS5neaciO+8ieawtOebuOWvueW8uu+8jOW+l+WIhiswLjVcbiAgIC0g5pil5a2j77yI5Yac5Y6G5q2j44CB5LqM44CB5LiJ5pyI77yJ5rC05Zua77yM5b6X5YiGLTAuOFxuICAgLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInmsLTmrbvvvIzlvpfliIYtMS4wXG5cbjUuIOe7hOWQiOiwg+aVtO+8mlxuICAgLSDlpKnlubLkupTlkIjvvJrkuJnovpvlkIjljJbmsLTvvIzlvpfliIYrMC41XG4gICAtIOWcsOaUr+S4ieWQiO+8mueUs+WtkOi+sOS4ieWQiOawtOWxgO+8jOW+l+WIhisxLjBcbiAgIC0g5Zyw5pSv5Y2K5LiJ5ZCI77ya55Sz5a2Q5Y2K5ZCI5rC077yM5b6X5YiGKzAuNVxuICAgLSDlnLDmlK/kuInkvJrvvJrkuqXlrZDkuJHkuInkvJrmsLTvvIzlvpfliIYrMC44XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya5aOs5a2QIOeZuOS4kSDnlLLlr4Ug5LmZ5Y2vXG4xLiDlpKnlubLvvJrlo6wo5bm05bmyKSvnmbgo5pyI5bmyKSvnlLIo5pel5bmyKSvkuZko5pe25bmyKSA9IDEuMCsyLjArMCswID0gMy4w5YiGXG4yLiDlnLDmlK/ol4/lubLvvJpcbiAgIC0g5a2Q6JeP55m4KOawtCnvvIznmbjlvpfliIYwLjdcbiAgIC0g5LiR6JeP5bexKOWcnynjgIHovpso6YeRKeOAgeeZuCjmsLQp77yM55m45b6X5YiGMS41XG4gICAtIOWvheiXj+eUsijmnKgp44CB5LiZKOeBqynjgIHmiIoo5ZyfKe+8jOaXoOawtOiXj+W5slxuICAgLSDlja/ol4/kuZko5pyoKe+8jOaXoOawtOiXj+W5slxuICAg5Zyw5pSv6JeP5bmy5b6X5YiG77yaMC43KzEuNSswKzAgPSAyLjLliIZcbjMuIOe6s+mfs++8mlxuICAgLSDlo6zlrZDkuLrmoZHmnb7mnKjvvIzml6DmsLRcbiAgIC0g55m45LiR5Li65qGR5p2+5pyo77yM5peg5rC0XG4gICAtIOeUsuWvheS4uuWkp+a6quawtO+8jOW+l+WIhjEuNVxuICAgLSDkuZnlja/kuLrlpKfmuqrmsLTvvIzlvpfliIYwLjVcbiAgIOe6s+mfs+W+l+WIhu+8mjArMCsxLjUrMC41ID0gMi4w5YiGXG40LiDlraPoioLvvJrlhavlrZfmnIjmn7HkuLrnmbjkuJHvvIzlhpzljobkuLrkuJHmnIgo5Yas5a2jKe+8jOawtOaXuu+8jOW+l+WIhisxLjBcbjUuIOe7hOWQiO+8mlxuICAgLSDlpKnlubLvvJrml6DkupTlkIhcbiAgIC0g5Zyw5pSv77ya5a2Q44CB5LiR5LiO5Lql5a2Q5LiR5LiJ5Lya5rC05bGA55u45YWz77yM5b6X5YiGKzAuNFxuICAg57uE5ZCI5b6X5YiG77yaMC405YiGXG5cbuawtOS6lOihjOaAu+W+l+WIhu+8mjMuMCsyLjIrMi4wKzEuMCswLjQgPSA4LjbliIZcblxu44CQ5b2S5LiA5YyW5aSE55CG44CRXG7mnIDlkI7lsIbmiYDmnInkupTooYzlvpfliIblvZLkuIDljJbvvIzorqHnrpfnm7jlr7nlvLrluqbvvJpcbuawtOS6lOihjOebuOWvueW8uuW6piA9IOawtOS6lOihjOaAu+WIhiAvICjph5Er5pyoK+awtCvngasr5Zyf5oC75YiGKSAqIDEwYFxuICAgICAgfSxcbiAgICAgICfngasnOiB7XG4gICAgICAgIG5hbWU6ICfngasnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+eBq+S6lOihjOS7o+ihqOeDreaDheOAgea0u+WKm+OAgeihqOeOsOWKm+OAgueBq+i/h+W8uuWImea1rui6ge+8jOeBq+i/h+W8seWImee8uuS5j+eDreaDheOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+eBq+S6lOihjOW8uueahOS6uu+8jOeDreaDhea0u+WKm++8jOihqOeOsOWKm+W8uu+8jOS9huWPr+iDvei/h+S6jua1rui6ge+8m+eBq+S6lOihjOW8seeahOS6uu+8jOe8uuS5j+eDreaDhe+8jOihqOeOsOWKm+W3ru+8jOS9huS4uuS6uueos+mHjeOAgicsXG4gICAgICAgIGNhbGN1bGF0aW9uOiBg54Gr5LqU6KGM5by65bqm6K6h566X5pa55rOV77yaXG5cbuOAkOWfuuehgOW+l+WIhuOAkVxuMS4g5aSp5bmy5LqU6KGM77yaXG4gICAtIOW5tOW5suS4uuS4meOAgeS4ge+8jOW+l+WIhjEuMFxuICAgLSDmnIjlubLkuLrkuJnjgIHkuIHvvIzlvpfliIYyLjBcbiAgIC0g5pel5bmy5Li65LiZ44CB5LiB77yM5b6X5YiGMy4wXG4gICAtIOaXtuW5suS4uuS4meOAgeS4ge+8jOW+l+WIhjEuMFxuXG4yLiDlnLDmlK/ol4/lubLvvJpcbiAgIC0g5bm05pSv6JeP5LiZ44CB5LiB77yM5b6X5YiGMC43XG4gICAtIOaciOaUr+iXj+S4meOAgeS4ge+8jOW+l+WIhjEuNVxuICAgLSDml6XmlK/ol4/kuJnjgIHkuIHvvIzlvpfliIYyLjBcbiAgIC0g5pe25pSv6JeP5LiZ44CB5LiB77yM5b6X5YiGMC43XG5cbjMuIOe6s+mfs+S6lOihjO+8mlxuICAgLSDlubTmn7HnurPpn7PkuLrngavvvIzlvpfliIYwLjVcbiAgIC0g5pyI5p+x57qz6Z+z5Li654Gr77yM5b6X5YiGMS4wXG4gICAtIOaXpeafsee6s+mfs+S4uueBq++8jOW+l+WIhjEuNVxuICAgLSDml7bmn7HnurPpn7PkuLrngavvvIzlvpfliIYwLjVcblxu44CQ6LCD5pW057O75pWw44CRXG40LiDlraPoioLosIPmlbTvvJpcbiAgIC0g5aSP5a2j77yI5Yac5Y6G5Zub44CB5LqU44CB5YWt5pyI77yJ54Gr5pe677yM5b6X5YiGKzEuMFxuICAgLSDmmKXlraPvvIjlhpzljobmraPjgIHkuozjgIHkuInmnIjvvInngavnm7jlr7nlvLrvvIzlvpfliIYrMC41XG4gICAtIOeni+Wto++8iOWGnOWOhuS4g+OAgeWFq+OAgeS5neaciO+8ieeBq+atu++8jOW+l+WIhi0xLjBcbiAgIC0g5Yas5a2j77yI5Yac5Y6G5Y2B44CB5Y2B5LiA44CB5Y2B5LqM5pyI77yJ54Gr5Zua77yM5b6X5YiGLTAuOFxuXG41LiDnu4TlkIjosIPmlbTvvJpcbiAgIC0g5aSp5bmy5LqU5ZCI77ya5oiK55m45ZCI5YyW54Gr77yM5b6X5YiGKzAuNVxuICAgLSDlnLDmlK/kuInlkIjvvJrlr4XljYjmiIzkuInlkIjngavlsYDvvIzlvpfliIYrMS4wXG4gICAtIOWcsOaUr+WNiuS4ieWQiO+8muWvheWNiOWNiuWQiOeBq++8jOW+l+WIhiswLjVcbiAgIC0g5Zyw5pSv5LiJ5Lya77ya5bez5Y2I5pyq5LiJ5Lya54Gr77yM5b6X5YiGKzAuOFxuXG7jgJDorqHnrpfnpLrkvovjgJFcbuWBh+iuvuWFq+Wtl+S4uu+8muS4meWNiCDkuIHmnKog5oiK55SzIOW3semFiVxuMS4g5aSp5bmy77ya5LiZKOW5tOW5sikr5LiBKOaciOW5sikr5oiKKOaXpeW5sikr5bexKOaXtuW5sikgPSAxLjArMi4wKzArMCA9IDMuMOWIhlxuMi4g5Zyw5pSv6JeP5bmy77yaXG4gICAtIOWNiOiXj+S4gSjngasp44CB5bexKOWcnynvvIzkuIHlvpfliIYwLjdcbiAgIC0g5pyq6JeP5LmZKOacqCnjgIHlt7Eo5ZyfKeOAgeS4gSjngasp77yM5LiB5b6X5YiGMS41XG4gICAtIOeUs+iXj+W6mijph5Ep44CB5aOsKOawtCnjgIHmiIoo5ZyfKe+8jOaXoOeBq+iXj+W5slxuICAgLSDphYnol4/ovpso6YeRKe+8jOaXoOeBq+iXj+W5slxuICAg5Zyw5pSv6JeP5bmy5b6X5YiG77yaMC43KzEuNSswKzAgPSAyLjLliIZcbjMuIOe6s+mfs++8mlxuICAgLSDkuJnljYjkuLrlpKnmsrPmsLTvvIzml6DngatcbiAgIC0g5LiB5pyq5Li65aSp5rKz5rC077yM5peg54GrXG4gICAtIOaIiueUs+S4uuWkp+mpv+Wcn++8jOaXoOeBq1xuICAgLSDlt7HphYnkuLrlpKfpqb/lnJ/vvIzml6DngatcbiAgIOe6s+mfs+W+l+WIhu+8mjDliIZcbjQuIOWto+iKgu+8muWFq+Wtl+aciOafseS4uuS4geacqu+8jOWGnOWOhuS4uuacquaciCjlpI/lraMp77yM54Gr5pe677yM5b6X5YiGKzEuMFxuNS4g57uE5ZCI77yaXG4gICAtIOWkqeW5su+8muaXoOS6lOWQiFxuICAgLSDlnLDmlK/vvJrljYjjgIHmnKrkuI7lt7PljYjmnKrkuInkvJrngavlsYDnm7jlhbPvvIzlvpfliIYrMC42XG4gICDnu4TlkIjlvpfliIbvvJowLjbliIZcblxu54Gr5LqU6KGM5oC75b6X5YiG77yaMy4wKzIuMiswKzEuMCswLjYgPSA2LjjliIZcblxu44CQ5b2S5LiA5YyW5aSE55CG44CRXG7mnIDlkI7lsIbmiYDmnInkupTooYzlvpfliIblvZLkuIDljJbvvIzorqHnrpfnm7jlr7nlvLrluqbvvJpcbueBq+S6lOihjOebuOWvueW8uuW6piA9IOeBq+S6lOihjOaAu+WIhiAvICjph5Er5pyoK+awtCvngasr5Zyf5oC75YiGKSAqIDEwYFxuICAgICAgfSxcbiAgICAgICflnJ8nOiB7XG4gICAgICAgIG5hbWU6ICflnJ8nLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+Wcn+S6lOihjOS7o+ihqOeos+mHjeOAgei4j+WunuOAgeWMheWuueWKm+OAguWcn+i/h+W8uuWImeS/neWuiO+8jOWcn+i/h+W8seWImee8uuS5j+eos+WumuaAp+OAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+Wcn+S6lOihjOW8uueahOS6uu+8jOeos+mHjei4j+Wunu+8jOWMheWuueWKm+W8uu+8jOS9huWPr+iDvei/h+S6juS/neWuiO+8m+Wcn+S6lOihjOW8seeahOS6uu+8jOe8uuS5j+eos+WumuaAp++8jOWBmuS6i+S4jei4j+Wunu+8jOS9huS4uuS6uueBtea0u+OAgicsXG4gICAgICAgIGNhbGN1bGF0aW9uOiBg5Zyf5LqU6KGM5by65bqm6K6h566X5pa55rOV77yaXG5cbuOAkOWfuuehgOW+l+WIhuOAkVxuMS4g5aSp5bmy5LqU6KGM77yaXG4gICAtIOW5tOW5suS4uuaIiuOAgeW3se+8jOW+l+WIhjEuMFxuICAgLSDmnIjlubLkuLrmiIrjgIHlt7HvvIzlvpfliIYyLjBcbiAgIC0g5pel5bmy5Li65oiK44CB5bex77yM5b6X5YiGMy4wXG4gICAtIOaXtuW5suS4uuaIiuOAgeW3se+8jOW+l+WIhjEuMFxuXG4yLiDlnLDmlK/ol4/lubLvvJpcbiAgIC0g5bm05pSv6JeP5oiK44CB5bex77yM5b6X5YiGMC43XG4gICAtIOaciOaUr+iXj+aIiuOAgeW3se+8jOW+l+WIhjEuNVxuICAgLSDml6XmlK/ol4/miIrjgIHlt7HvvIzlvpfliIYyLjBcbiAgIC0g5pe25pSv6JeP5oiK44CB5bex77yM5b6X5YiGMC43XG5cbjMuIOe6s+mfs+S6lOihjO+8mlxuICAgLSDlubTmn7HnurPpn7PkuLrlnJ/vvIzlvpfliIYwLjVcbiAgIC0g5pyI5p+x57qz6Z+z5Li65Zyf77yM5b6X5YiGMS4wXG4gICAtIOaXpeafsee6s+mfs+S4uuWcn++8jOW+l+WIhjEuNVxuICAgLSDml7bmn7HnurPpn7PkuLrlnJ/vvIzlvpfliIYwLjVcblxu44CQ6LCD5pW057O75pWw44CRXG40LiDlraPoioLosIPmlbTvvJpcbiAgIC0g5q+P5a2j5pyA5ZCO5LiA5Liq5pyI77yI5Yac5Y6G5LiJ44CB5YWt44CB5Lmd44CB5Y2B5LqM5pyI77yJ5Zyf5pe677yM5b6X5YiGKzEuMFxuICAgLSDlpI/lraPvvIjlhpzljoblm5vjgIHkupTjgIHlha3mnIjvvInlnJ/nm7jlr7nlvLrvvIzlvpfliIYrMC41XG4gICAtIOWGrOWto++8iOWGnOWOhuWNgeOAgeWNgeS4gOOAgeWNgeS6jOaciO+8ieWcn+atu++8jOW+l+WIhi0xLjBcbiAgIC0g56eL5a2j77yI5Yac5Y6G5LiD44CB5YWr44CB5Lmd5pyI77yJ5Zyf5Zua77yM5b6X5YiGLTAuOFxuXG41LiDnu4TlkIjosIPmlbTvvJpcbiAgIC0g5aSp5bmy5LqU5ZCI77ya55Sy5bex5ZCI5YyW5Zyf77yM5b6X5YiGKzAuNVxuICAgLSDlnLDmlK/kuInlkIjvvJrovrDmiIzkuJHkuInlkIjlnJ/lsYDvvIzlvpfliIYrMS4wXG4gICAtIOWcsOaUr+WNiuS4ieWQiO+8mui+sOaIjOWNiuWQiOWcn++8jOW+l+WIhiswLjVcbiAgIC0g5Zyw5pSv5LiJ5Lya77ya6L6w5bez5Y2I5LiJ5Lya5Zyf77yM5b6X5YiGKzAuOFxuXG7jgJDorqHnrpfnpLrkvovjgJFcbuWBh+iuvuWFq+Wtl+S4uu+8muaIiui+sCDlt7Hlt7Mg5bqa5Y2IIOi+m+acqlxuMS4g5aSp5bmy77ya5oiKKOW5tOW5sikr5bexKOaciOW5sikr5bqaKOaXpeW5sikr6L6bKOaXtuW5sikgPSAxLjArMi4wKzArMCA9IDMuMOWIhlxuMi4g5Zyw5pSv6JeP5bmy77yaXG4gICAtIOi+sOiXj+aIiijlnJ8p44CB5LmZKOacqCnjgIHnmbgo5rC0Ke+8jOaIiuW+l+WIhjAuN1xuICAgLSDlt7Pol4/kuJko54GrKeOAgeW6mijph5Ep44CB5oiKKOWcnynvvIzmiIrlvpfliIYxLjVcbiAgIC0g5Y2I6JeP5LiBKOeBqynjgIHlt7Eo5ZyfKe+8jOW3seW+l+WIhjIuMFxuICAgLSDmnKrol4/kuZko5pyoKeOAgeW3sSjlnJ8p44CB5LiBKOeBqynvvIzlt7HlvpfliIYwLjdcbiAgIOWcsOaUr+iXj+W5suW+l+WIhu+8mjAuNysxLjUrMi4wKzAuNyA9IDQuOeWIhlxuMy4g57qz6Z+z77yaXG4gICAtIOaIiui+sOS4uuWkp+ael+acqO+8jOaXoOWcn1xuICAgLSDlt7Hlt7PkuLrlpKfmnpfmnKjvvIzml6DlnJ9cbiAgIC0g5bqa5Y2I5Li66Lev5peB5Zyf77yM5b6X5YiGMS41XG4gICAtIOi+m+acquS4uui3r+aXgeWcn++8jOW+l+WIhjAuNVxuICAg57qz6Z+z5b6X5YiG77yaMCswKzEuNSswLjUgPSAyLjDliIZcbjQuIOWto+iKgu+8muWFq+Wtl+aciOafseS4uuW3seW3s++8jOWGnOWOhuS4uuW3s+aciCjlpI/lraMp77yM5Zyf55u45a+55by677yM5b6X5YiGKzAuNVxuNS4g57uE5ZCI77yaXG4gICAtIOWkqeW5su+8muaXoOS6lOWQiFxuICAgLSDlnLDmlK/vvJrovrDjgIHlt7PkuI7ovrDlt7PljYjkuInkvJrlnJ/lsYDnm7jlhbPvvIzlvpfliIYrMC42XG4gICDnu4TlkIjlvpfliIbvvJowLjbliIZcblxu5Zyf5LqU6KGM5oC75b6X5YiG77yaMy4wKzQuOSsyLjArMC41KzAuNiA9IDExLjDliIZcblxu44CQ5b2S5LiA5YyW5aSE55CG44CRXG7mnIDlkI7lsIbmiYDmnInkupTooYzlvpfliIblvZLkuIDljJbvvIzorqHnrpfnm7jlr7nlvLrluqbvvJpcbuWcn+S6lOihjOebuOWvueW8uuW6piA9IOWcn+S6lOihjOaAu+WIhiAvICjph5Er5pyoK+awtCvngasr5Zyf5oC75YiGKSAqIDEwYFxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZXhwbGFuYXRpb25zW3d1WGluZ10gfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bml6XkuLvml7roobDnmoTor6bnu4bkv6Hmga9cbiAgICogQHBhcmFtIHJpWmh1IOaXpeS4u+aXuuihsOeKtuaAgVxuICAgKiBAcmV0dXJucyDml6XkuLvml7roobDnmoTor6bnu4bkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0UmlaaHVJbmZvKHJpWmh1OiBzdHJpbmcpOiB7IG5hbWU6IHN0cmluZzsgZXhwbGFuYXRpb246IHN0cmluZzsgaW5mbHVlbmNlOiBzdHJpbmc7IGNhbGN1bGF0aW9uOiBzdHJpbmcgfSB8IG51bGwge1xuICAgIGNvbnN0IGV4cGxhbmF0aW9uczogeyBba2V5OiBzdHJpbmddOiB7IG5hbWU6IHN0cmluZzsgZXhwbGFuYXRpb246IHN0cmluZzsgaW5mbHVlbmNlOiBzdHJpbmc7IGNhbGN1bGF0aW9uOiBzdHJpbmcgfSB9ID0ge1xuICAgICAgJ+aXuic6IHtcbiAgICAgICAgbmFtZTogJ+aXuicsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5pel5Li75pe66KGo56S65ZG95Li755qE5LqU6KGM5Yqb6YeP5by655ub77yM5Liq5oCn5Yia5by677yM6Ieq5L+h5b+D5by677yM5pyJ6aKG5a+86IO95Yqb77yM5L2G5Y+v6IO96L+H5LqO6Ieq5L+h5oiW5Zu65omn44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5pel5Li75pe655qE5Lq677yM5oCn5qC85Yia5by677yM6Ieq5L+h5b+D5by677yM5pyJ6aKG5a+86IO95Yqb77yM5YGa5LqL5p6c5pat77yM5L2G5Y+v6IO96L+H5LqO6Ieq5L+h5oiW5Zu65omn77yM5LiN5piT5o6l5Y+X5LuW5Lq65oSP6KeB44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDml6XkuLvml7roobDorqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA6K6h566X44CRXG4xLiDorqHnrpfml6XkuLvkupTooYzlnKjlhavlrZfkuK3nmoTlvLrluqZcbiAgIC0g6aaW5YWI56Gu5a6a5pel5Li75LqU6KGM77yI5pel5bmy5omA5bGe5LqU6KGM77yJXG4gICAtIOiuoeeul+ivpeS6lOihjOWcqOWFq+Wtl+S4reeahOaAu+W+l+WIhu+8iOaMieeFp+S6lOihjOW8uuW6puiuoeeul+aWueazle+8iVxuICAgLSDorqHnrpfmiYDmnInkupTooYznmoTmgLvlvpfliIZcbiAgIC0g6K6h566X5pel5Li75LqU6KGM55qE55u45a+55by65bqm77ya5pel5Li75LqU6KGM5b6X5YiGL+aJgOacieS6lOihjOaAu+W+l+WIhlxuXG7jgJDlraPoioLlvbHlk43jgJFcbjIuIOiAg+iZkeWto+iKguWvueaXpeS4u+S6lOihjOeahOW9seWTje+8mlxuICAgLSDmmKXlraPvvIjmraPjgIHkuozjgIHkuInmnIjvvInvvJpcbiAgICAgKiDmnKjml7ooKzAuMynjgIHngavnm7goKzAuMTUp44CB5Zyf5LyRKDAp44CB6YeR5ZuaKC0wLjE1KeOAgeawtOatuygtMC4zKVxuICAgLSDlpI/lraPvvIjlm5vjgIHkupTjgIHlha3mnIjvvInvvJpcbiAgICAgKiDngavml7ooKzAuMynjgIHlnJ/nm7goKzAuMTUp44CB6YeR5LyRKDAp44CB5rC05ZuaKC0wLjE1KeOAgeacqOatuygtMC4zKVxuICAgLSDnp4vlraPvvIjkuIPjgIHlhavjgIHkuZ3mnIjvvInvvJpcbiAgICAgKiDph5Hml7ooKzAuMynjgIHmsLTnm7goKzAuMTUp44CB5pyo5LyRKDAp44CB54Gr5ZuaKC0wLjE1KeOAgeWcn+atuygtMC4zKVxuICAgLSDlhqzlraPvvIjljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInvvJpcbiAgICAgKiDmsLTml7ooKzAuMynjgIHmnKjnm7goKzAuMTUp44CB54Gr5LyRKDAp44CB5Zyf5ZuaKC0wLjE1KeOAgemHkeatuygtMC4zKVxuXG7jgJDnlJ/lhYvlhbPns7vjgJFcbjMuIOiAg+iZkeaciOaUr+WvueaXpeS4u+eahOeUn+WFi+WFs+ezu1xuICAgLSDmnIjmlK/kupTooYznlJ/ml6XkuLvvvJorMC4yXG4gICAtIOaciOaUr+S6lOihjOWFi+aXpeS4u++8mi0wLjJcbiAgIC0g5pel5Li75LqU6KGM5YWL5pyI5pSv77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/mnIjmlK/vvJotMC4xXG5cbuOAkOe7hOWQiOW9seWTjeOAkVxuNC4g6ICD6JmR5Zyw5pSv5LiJ5ZCI5bGA5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS4ieWQiOWxgOS6lOihjOeUn+aXpeS4u++8miswLjE1XG4gICAtIOS4ieWQiOWxgOS6lOihjOWFi+aXpeS4u++8mi0wLjE1XG4gICAtIOaXpeS4u+S6lOihjOWFi+S4ieWQiOWxgO+8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5LiJ5ZCI5bGA77yaLTAuMVxuXG41LiDogIPomZHlpKnlubLkupTlkIjlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LqU5ZCI5YyW5LqU6KGM55Sf5pel5Li777yaKzAuMVxuICAgLSDkupTlkIjljJbkupTooYzlhYvml6XkuLvvvJotMC4xXG4gICAtIOaXpeS4u+WPguS4juS6lOWQiO+8mi0wLjA177yI5pel5Li75Y+X54m15Yi277yJXG5cbjYuIOiAg+iZkee6s+mfs+S6lOihjOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDml6Xmn7HnurPpn7PkuI7ml6XkuLvkupTooYznm7jlkIzvvJorMC4xXG4gICAtIOaXpeafsee6s+mfs+eUn+aXpeS4u+S6lOihjO+8miswLjA1XG4gICAtIOaXpeafsee6s+mfs+WFi+aXpeS4u+S6lOihjO+8mi0wLjA1XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vXG4tIOaXpeS4u+S4uuS4meeBq1xuLSDmnIjku6TkuLrkuJHmnIjvvIjlhqzlraPvvIlcbi0g5pel5Li75LqU6KGM5by65bqm6K6h566X77ya5LiZ54Gr5b6X5YiG5Li6My415YiG77yM5oC75YiG5Li6MjDliIbvvIznm7jlr7nlvLrluqbkuLowLjE3NVxuLSDlraPoioLlvbHlk43vvJrlhqzlraPngavkvJHvvIzosIPmlbTns7vmlbDkuLowXG4tIOaciOaUr+S4keWcn+WFi+eBq++8mi0wLjJcbi0g5Zyw5pSv5LiJ5ZCI77ya5a2Q44CB5LiR5Y+v6IO95LiO6L6w5b2i5oiQ5LiJ5ZCI5rC05bGA77yM5rC05YWL54Gr77yaLTAuMTVcbi0g5aSp5bmy5LqU5ZCI77ya5pegXG4tIOe6s+mfs+S6lOihjO+8muS4meWvheS4uueCieS4reeBq++8jOS4juaXpeS4u+WQjOexu++8miswLjFcblxu5pyA57uI5b6X5YiG77yaMC4xNzUgKyAwIC0gMC4yIC0gMC4xNSArIDAuMSA9IC0wLjA3NVxuXG7jgJDml7roobDliKTlrprjgJFcbjcuIOW9kuS4gOWMluW+l+WIhu+8jOiuoeeul+acgOe7iOaXuuihsOeKtuaAge+8mlxuICAgLSDml7rvvJrlvpfliIYgPiAwLjZcbiAgIC0g55u477yaMC4zIDwg5b6X5YiGIOKJpCAwLjZcbiAgIC0g5LyR77yaLTAuMyDiiaQg5b6X5YiGIOKJpCAwLjNcbiAgIC0g5Zua77yaLTAuNiDiiaQg5b6X5YiGIDwgLTAuM1xuICAgLSDmrbvvvJrlvpfliIYgPCAtMC42XG5cbuagueaNruiuoeeul+e7k+aenC0wLjA3Ne+8jOaXpeS4u+S4ulwi5LyRXCLjgIJgXG4gICAgICB9LFxuICAgICAgJ+ebuCc6IHtcbiAgICAgICAgbmFtZTogJ+ebuCcsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5pel5Li755u46KGo56S65ZG95Li755qE5LqU6KGM5Yqb6YeP6L6D5by677yM5oCn5qC86L6D5Li65bmz6KGh77yM5pyJ6Ieq5L+h5L2G5LiN6L+H5YiG77yM6IO95aSf6YCC5bqU5ZCE56eN546v5aKD44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5pel5Li755u455qE5Lq677yM5oCn5qC86L6D5Li65bmz6KGh77yM5pyJ6Ieq5L+h5L2G5LiN6L+H5YiG77yM6IO95aSf6YCC5bqU5ZCE56eN546v5aKD77yM5YGa5LqL5pyJ5Li76KeB5L2G5Lmf6IO95o6l5Y+X5LuW5Lq65oSP6KeB44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDml6XkuLvml7roobDorqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA6K6h566X44CRXG4xLiDorqHnrpfml6XkuLvkupTooYzlnKjlhavlrZfkuK3nmoTlvLrluqZcbiAgIC0g6aaW5YWI56Gu5a6a5pel5Li75LqU6KGM77yI5pel5bmy5omA5bGe5LqU6KGM77yJXG4gICAtIOiuoeeul+ivpeS6lOihjOWcqOWFq+Wtl+S4reeahOaAu+W+l+WIhu+8iOaMieeFp+S6lOihjOW8uuW6puiuoeeul+aWueazle+8iVxuICAgLSDorqHnrpfmiYDmnInkupTooYznmoTmgLvlvpfliIZcbiAgIC0g6K6h566X5pel5Li75LqU6KGM55qE55u45a+55by65bqm77ya5pel5Li75LqU6KGM5b6X5YiGL+aJgOacieS6lOihjOaAu+W+l+WIhlxuXG7jgJDlraPoioLlvbHlk43jgJFcbjIuIOiAg+iZkeWto+iKguWvueaXpeS4u+S6lOihjOeahOW9seWTje+8mlxuICAgLSDmmKXlraPvvIjmraPjgIHkuozjgIHkuInmnIjvvInvvJpcbiAgICAgKiDmnKjml7ooKzAuMynjgIHngavnm7goKzAuMTUp44CB5Zyf5LyRKDAp44CB6YeR5ZuaKC0wLjE1KeOAgeawtOatuygtMC4zKVxuICAgLSDlpI/lraPvvIjlm5vjgIHkupTjgIHlha3mnIjvvInvvJpcbiAgICAgKiDngavml7ooKzAuMynjgIHlnJ/nm7goKzAuMTUp44CB6YeR5LyRKDAp44CB5rC05ZuaKC0wLjE1KeOAgeacqOatuygtMC4zKVxuICAgLSDnp4vlraPvvIjkuIPjgIHlhavjgIHkuZ3mnIjvvInvvJpcbiAgICAgKiDph5Hml7ooKzAuMynjgIHmsLTnm7goKzAuMTUp44CB5pyo5LyRKDAp44CB54Gr5ZuaKC0wLjE1KeOAgeWcn+atuygtMC4zKVxuICAgLSDlhqzlraPvvIjljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInvvJpcbiAgICAgKiDmsLTml7ooKzAuMynjgIHmnKjnm7goKzAuMTUp44CB54Gr5LyRKDAp44CB5Zyf5ZuaKC0wLjE1KeOAgemHkeatuygtMC4zKVxuXG7jgJDnlJ/lhYvlhbPns7vjgJFcbjMuIOiAg+iZkeaciOaUr+WvueaXpeS4u+eahOeUn+WFi+WFs+ezu1xuICAgLSDmnIjmlK/kupTooYznlJ/ml6XkuLvvvJorMC4yXG4gICAtIOaciOaUr+S6lOihjOWFi+aXpeS4u++8mi0wLjJcbiAgIC0g5pel5Li75LqU6KGM5YWL5pyI5pSv77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/mnIjmlK/vvJotMC4xXG5cbuOAkOe7hOWQiOW9seWTjeOAkVxuNC4g6ICD6JmR5Zyw5pSv5LiJ5ZCI5bGA5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS4ieWQiOWxgOS6lOihjOeUn+aXpeS4u++8miswLjE1XG4gICAtIOS4ieWQiOWxgOS6lOihjOWFi+aXpeS4u++8mi0wLjE1XG4gICAtIOaXpeS4u+S6lOihjOWFi+S4ieWQiOWxgO+8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5LiJ5ZCI5bGA77yaLTAuMVxuXG41LiDogIPomZHlpKnlubLkupTlkIjlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LqU5ZCI5YyW5LqU6KGM55Sf5pel5Li777yaKzAuMVxuICAgLSDkupTlkIjljJbkupTooYzlhYvml6XkuLvvvJotMC4xXG4gICAtIOaXpeS4u+WPguS4juS6lOWQiO+8mi0wLjA177yI5pel5Li75Y+X54m15Yi277yJXG5cbjYuIOiAg+iZkee6s+mfs+S6lOihjOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDml6Xmn7HnurPpn7PkuI7ml6XkuLvkupTooYznm7jlkIzvvJorMC4xXG4gICAtIOaXpeafsee6s+mfs+eUn+aXpeS4u+S6lOihjO+8miswLjA1XG4gICAtIOaXpeafsee6s+mfs+WFi+aXpeS4u+S6lOihjO+8mi0wLjA1XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya55Sy5a2QIOS5meS4kSDmiIrljYgg5bex5pyqXG4tIOaXpeS4u+S4uuaIiuWcn1xuLSDmnIjku6TkuLrkuJHmnIjvvIjlhqzlraPvvIlcbi0g5pel5Li75LqU6KGM5by65bqm6K6h566X77ya5oiK5Zyf5b6X5YiG5Li6NS415YiG77yM5oC75YiG5Li6MjLliIbvvIznm7jlr7nlvLrluqbkuLowLjI1XG4tIOWto+iKguW9seWTje+8muWGrOWto+Wcn+Wbmu+8jOiwg+aVtOezu+aVsOS4ui0wLjE1XG4tIOaciOaUr+S4keWcn+eUn+Wcn++8miswLjJcbi0g5Zyw5pSv5LiJ5ZCI77ya5peg5piO5pi+5LiJ5ZCIXG4tIOWkqeW5suS6lOWQiO+8muaXoFxuLSDnurPpn7PkupTooYzvvJrmiIrljYjkuLrlpKnkuIrngavvvIzngavnlJ/lnJ/vvJorMC4wNVxuXG7mnIDnu4jlvpfliIbvvJowLjI1IC0gMC4xNSArIDAuMiArIDAuMDUgPSAwLjM1XG5cbuOAkOaXuuihsOWIpOWumuOAkVxuNy4g5b2S5LiA5YyW5b6X5YiG77yM6K6h566X5pyA57uI5pe66KGw54q25oCB77yaXG4gICAtIOaXuu+8muW+l+WIhiA+IDAuNlxuICAgLSDnm7jvvJowLjMgPCDlvpfliIYg4omkIDAuNlxuICAgLSDkvJHvvJotMC4zIOKJpCDlvpfliIYg4omkIDAuM1xuICAgLSDlm5rvvJotMC42IOKJpCDlvpfliIYgPCAtMC4zXG4gICAtIOatu++8muW+l+WIhiA8IC0wLjZcblxu5qC55o2u6K6h566X57uT5p6cMC4zNe+8jOaXpeS4u+S4ulwi55u4XCLjgIJgXG4gICAgICB9LFxuICAgICAgJ+S8kSc6IHtcbiAgICAgICAgbmFtZTogJ+S8kScsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5pel5Li75LyR6KGo56S65ZG95Li755qE5LqU6KGM5Yqb6YeP6YCC5Lit5YGP5byx77yM5oCn5qC85rip5ZKM77yM6YCC5bqU5Yqb5by677yM5L2G5Y+v6IO957y65LmP5Li76KeB5oiW5Yaz5pat5Yqb44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5pel5Li75LyR55qE5Lq677yM5oCn5qC85rip5ZKM77yM6YCC5bqU5Yqb5by677yM6IO95aSf6J6N5YWl5ZCE56eN546v5aKD77yM5L2G5Y+v6IO957y65LmP5Li76KeB5oiW5Yaz5pat5Yqb77yM5a655piT5Y+X5LuW5Lq65b2x5ZON44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDml6XkuLvml7roobDorqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA6K6h566X44CRXG4xLiDorqHnrpfml6XkuLvkupTooYzlnKjlhavlrZfkuK3nmoTlvLrluqZcbiAgIC0g6aaW5YWI56Gu5a6a5pel5Li75LqU6KGM77yI5pel5bmy5omA5bGe5LqU6KGM77yJXG4gICAtIOiuoeeul+ivpeS6lOihjOWcqOWFq+Wtl+S4reeahOaAu+W+l+WIhu+8iOaMieeFp+S6lOihjOW8uuW6puiuoeeul+aWueazle+8iVxuICAgLSDorqHnrpfmiYDmnInkupTooYznmoTmgLvlvpfliIZcbiAgIC0g6K6h566X5pel5Li75LqU6KGM55qE55u45a+55by65bqm77ya5pel5Li75LqU6KGM5b6X5YiGL+aJgOacieS6lOihjOaAu+W+l+WIhlxuXG7jgJDlraPoioLlvbHlk43jgJFcbjIuIOiAg+iZkeWto+iKguWvueaXpeS4u+S6lOihjOeahOW9seWTje+8mlxuICAgLSDmmKXlraPvvIjmraPjgIHkuozjgIHkuInmnIjvvInvvJpcbiAgICAgKiDmnKjml7ooKzAuMynjgIHngavnm7goKzAuMTUp44CB5Zyf5LyRKDAp44CB6YeR5ZuaKC0wLjE1KeOAgeawtOatuygtMC4zKVxuICAgLSDlpI/lraPvvIjlm5vjgIHkupTjgIHlha3mnIjvvInvvJpcbiAgICAgKiDngavml7ooKzAuMynjgIHlnJ/nm7goKzAuMTUp44CB6YeR5LyRKDAp44CB5rC05ZuaKC0wLjE1KeOAgeacqOatuygtMC4zKVxuICAgLSDnp4vlraPvvIjkuIPjgIHlhavjgIHkuZ3mnIjvvInvvJpcbiAgICAgKiDph5Hml7ooKzAuMynjgIHmsLTnm7goKzAuMTUp44CB5pyo5LyRKDAp44CB54Gr5ZuaKC0wLjE1KeOAgeWcn+atuygtMC4zKVxuICAgLSDlhqzlraPvvIjljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInvvJpcbiAgICAgKiDmsLTml7ooKzAuMynjgIHmnKjnm7goKzAuMTUp44CB54Gr5LyRKDAp44CB5Zyf5ZuaKC0wLjE1KeOAgemHkeatuygtMC4zKVxuXG7jgJDnlJ/lhYvlhbPns7vjgJFcbjMuIOiAg+iZkeaciOaUr+WvueaXpeS4u+eahOeUn+WFi+WFs+ezu1xuICAgLSDmnIjmlK/kupTooYznlJ/ml6XkuLvvvJorMC4yXG4gICAtIOaciOaUr+S6lOihjOWFi+aXpeS4u++8mi0wLjJcbiAgIC0g5pel5Li75LqU6KGM5YWL5pyI5pSv77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/mnIjmlK/vvJotMC4xXG5cbuOAkOe7hOWQiOW9seWTjeOAkVxuNC4g6ICD6JmR5Zyw5pSv5LiJ5ZCI5bGA5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS4ieWQiOWxgOS6lOihjOeUn+aXpeS4u++8miswLjE1XG4gICAtIOS4ieWQiOWxgOS6lOihjOWFi+aXpeS4u++8mi0wLjE1XG4gICAtIOaXpeS4u+S6lOihjOWFi+S4ieWQiOWxgO+8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5LiJ5ZCI5bGA77yaLTAuMVxuXG41LiDogIPomZHlpKnlubLkupTlkIjlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LqU5ZCI5YyW5LqU6KGM55Sf5pel5Li777yaKzAuMVxuICAgLSDkupTlkIjljJbkupTooYzlhYvml6XkuLvvvJotMC4xXG4gICAtIOaXpeS4u+WPguS4juS6lOWQiO+8mi0wLjA177yI5pel5Li75Y+X54m15Yi277yJXG5cbjYuIOiAg+iZkee6s+mfs+S6lOihjOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDml6Xmn7HnurPpn7PkuI7ml6XkuLvkupTooYznm7jlkIzvvJorMC4xXG4gICAtIOaXpeafsee6s+mfs+eUn+aXpeS4u+S6lOihjO+8miswLjA1XG4gICAtIOaXpeafsee6s+mfs+WFi+aXpeS4u+S6lOihjO+8mi0wLjA1XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya5LiZ5a2QIOS4geS4kSDmiIrlr4Ug5bex5Y2vXG4tIOaXpeS4u+S4uuaIiuWcn1xuLSDmnIjku6TkuLrkuJHmnIjvvIjlhqzlraPvvIlcbi0g5pel5Li75LqU6KGM5by65bqm6K6h566X77ya5oiK5Zyf5b6X5YiG5Li6NC4w5YiG77yM5oC75YiG5Li6MjDliIbvvIznm7jlr7nlvLrluqbkuLowLjJcbi0g5a2j6IqC5b2x5ZON77ya5Yas5a2j5Zyf5Zua77yM6LCD5pW057O75pWw5Li6LTAuMTVcbi0g5pyI5pSv5LiR5Zyf55Sf5Zyf77yaKzAuMlxuLSDlnLDmlK/kuInlkIjvvJrlr4Xlja/lj6/og73kuI7mnKrlvaLmiJDkuInlkIjmnKjlsYDvvIzmnKjlhYvlnJ/vvJotMC4xNVxuLSDlpKnlubLkupTlkIjvvJrml6Bcbi0g57qz6Z+z5LqU6KGM77ya5oiK5a+F5Li65Z+O5aKZ5Zyf77yM5LiO5pel5Li75ZCM57G777yaKzAuMVxuXG7mnIDnu4jlvpfliIbvvJowLjIgLSAwLjE1ICsgMC4yIC0gMC4xNSArIDAuMSA9IDAuMlxuXG7jgJDml7roobDliKTlrprjgJFcbjcuIOW9kuS4gOWMluW+l+WIhu+8jOiuoeeul+acgOe7iOaXuuihsOeKtuaAge+8mlxuICAgLSDml7rvvJrlvpfliIYgPiAwLjZcbiAgIC0g55u477yaMC4zIDwg5b6X5YiGIOKJpCAwLjZcbiAgIC0g5LyR77yaLTAuMyDiiaQg5b6X5YiGIOKJpCAwLjNcbiAgIC0g5Zua77yaLTAuNiDiiaQg5b6X5YiGIDwgLTAuM1xuICAgLSDmrbvvvJrlvpfliIYgPCAtMC42XG5cbuagueaNruiuoeeul+e7k+aenDAuMu+8jOaXpeS4u+S4ulwi5LyRXCLjgIJgXG4gICAgICB9LFxuICAgICAgJ+Wbmic6IHtcbiAgICAgICAgbmFtZTogJ+WbmicsXG4gICAgICAgIGV4cGxhbmF0aW9uOiAn5pel5Li75Zua6KGo56S65ZG95Li755qE5LqU6KGM5Yqb6YeP6L6D5byx77yM5Liq5oCn6L6D5Li65YaF5ZCR77yM6Ieq5L+h5b+D5LiN6Laz77yM5a655piT5Y+X5aSW55WM5b2x5ZON44CCJyxcbiAgICAgICAgaW5mbHVlbmNlOiAn5pel5Li75Zua55qE5Lq677yM5Liq5oCn6L6D5Li65YaF5ZCR77yM6Ieq5L+h5b+D5LiN6Laz77yM5a655piT5Y+X5aSW55WM5b2x5ZON77yM5YGa5LqL57y65LmP5Li76KeB77yM5L2G5Li65Lq66LCm5ZKM77yM5ZaE5LqO5YC+5ZCs44CCJyxcbiAgICAgICAgY2FsY3VsYXRpb246IGDml6XkuLvml7roobDorqHnrpfmlrnms5XvvJpcblxu44CQ5Z+656GA6K6h566X44CRXG4xLiDorqHnrpfml6XkuLvkupTooYzlnKjlhavlrZfkuK3nmoTlvLrluqZcbiAgIC0g6aaW5YWI56Gu5a6a5pel5Li75LqU6KGM77yI5pel5bmy5omA5bGe5LqU6KGM77yJXG4gICAtIOiuoeeul+ivpeS6lOihjOWcqOWFq+Wtl+S4reeahOaAu+W+l+WIhu+8iOaMieeFp+S6lOihjOW8uuW6puiuoeeul+aWueazle+8iVxuICAgLSDorqHnrpfmiYDmnInkupTooYznmoTmgLvlvpfliIZcbiAgIC0g6K6h566X5pel5Li75LqU6KGM55qE55u45a+55by65bqm77ya5pel5Li75LqU6KGM5b6X5YiGL+aJgOacieS6lOihjOaAu+W+l+WIhlxuXG7jgJDlraPoioLlvbHlk43jgJFcbjIuIOiAg+iZkeWto+iKguWvueaXpeS4u+S6lOihjOeahOW9seWTje+8mlxuICAgLSDmmKXlraPvvIjmraPjgIHkuozjgIHkuInmnIjvvInvvJpcbiAgICAgKiDmnKjml7ooKzAuMynjgIHngavnm7goKzAuMTUp44CB5Zyf5LyRKDAp44CB6YeR5ZuaKC0wLjE1KeOAgeawtOatuygtMC4zKVxuICAgLSDlpI/lraPvvIjlm5vjgIHkupTjgIHlha3mnIjvvInvvJpcbiAgICAgKiDngavml7ooKzAuMynjgIHlnJ/nm7goKzAuMTUp44CB6YeR5LyRKDAp44CB5rC05ZuaKC0wLjE1KeOAgeacqOatuygtMC4zKVxuICAgLSDnp4vlraPvvIjkuIPjgIHlhavjgIHkuZ3mnIjvvInvvJpcbiAgICAgKiDph5Hml7ooKzAuMynjgIHmsLTnm7goKzAuMTUp44CB5pyo5LyRKDAp44CB54Gr5ZuaKC0wLjE1KeOAgeWcn+atuygtMC4zKVxuICAgLSDlhqzlraPvvIjljYHjgIHljYHkuIDjgIHljYHkuozmnIjvvInvvJpcbiAgICAgKiDmsLTml7ooKzAuMynjgIHmnKjnm7goKzAuMTUp44CB54Gr5LyRKDAp44CB5Zyf5ZuaKC0wLjE1KeOAgemHkeatuygtMC4zKVxuXG7jgJDnlJ/lhYvlhbPns7vjgJFcbjMuIOiAg+iZkeaciOaUr+WvueaXpeS4u+eahOeUn+WFi+WFs+ezu1xuICAgLSDmnIjmlK/kupTooYznlJ/ml6XkuLvvvJorMC4yXG4gICAtIOaciOaUr+S6lOihjOWFi+aXpeS4u++8mi0wLjJcbiAgIC0g5pel5Li75LqU6KGM5YWL5pyI5pSv77yaKzAuMVxuICAgLSDml6XkuLvkupTooYznlJ/mnIjmlK/vvJotMC4xXG5cbuOAkOe7hOWQiOW9seWTjeOAkVxuNC4g6ICD6JmR5Zyw5pSv5LiJ5ZCI5bGA5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS4ieWQiOWxgOS6lOihjOeUn+aXpeS4u++8miswLjE1XG4gICAtIOS4ieWQiOWxgOS6lOihjOWFi+aXpeS4u++8mi0wLjE1XG4gICAtIOaXpeS4u+S6lOihjOWFi+S4ieWQiOWxgO+8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5LiJ5ZCI5bGA77yaLTAuMVxuXG41LiDogIPomZHlpKnlubLkupTlkIjlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5LqU5ZCI5YyW5LqU6KGM55Sf5pel5Li777yaKzAuMVxuICAgLSDkupTlkIjljJbkupTooYzlhYvml6XkuLvvvJotMC4xXG4gICAtIOaXpeS4u+WPguS4juS6lOWQiO+8mi0wLjA177yI5pel5Li75Y+X54m15Yi277yJXG5cbjYuIOiAg+iZkee6s+mfs+S6lOihjOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDml6Xmn7HnurPpn7PkuI7ml6XkuLvkupTooYznm7jlkIzvvJorMC4xXG4gICAtIOaXpeafsee6s+mfs+eUn+aXpeS4u+S6lOihjO+8miswLjA1XG4gICAtIOaXpeafsee6s+mfs+WFi+aXpeS4u+S6lOihjO+8mi0wLjA1XG5cbuOAkOiuoeeul+ekuuS+i+OAkVxu5YGH6K6+5YWr5a2X5Li677ya55Sy5a2QIOS5meS4kSDkuJnlr4Ug5LiB5Y2vXG4tIOaXpeS4u+S4uuS4meeBq1xuLSDmnIjku6TkuLrkuJHmnIjvvIjlhqzlraPvvIlcbi0g5pel5Li75LqU6KGM5by65bqm6K6h566X77ya5LiZ54Gr5b6X5YiG5Li6Mi415YiG77yM5oC75YiG5Li6MjDliIbvvIznm7jlr7nlvLrluqbkuLowLjEyNVxuLSDlraPoioLlvbHlk43vvJrlhqzlraPngavlm5rvvIzosIPmlbTns7vmlbDkuLotMC4xNVxuLSDmnIjmlK/kuJHlnJ/lhYvngavvvJotMC4yXG4tIOWcsOaUr+S4ieWQiO+8muWvheWNr+WPr+iDveS4juacquW9ouaIkOS4ieWQiOacqOWxgO+8jOacqOeUn+eBq++8miswLjE1XG4tIOWkqeW5suS6lOWQiO+8muaXoFxuLSDnurPpn7PkupTooYzvvJrkuJnlr4XkuLrngonkuK3ngavvvIzkuI7ml6XkuLvlkIznsbvvvJorMC4xXG5cbuacgOe7iOW+l+WIhu+8mjAuMTI1IC0gMC4xNSAtIDAuMiArIDAuMTUgKyAwLjEgPSAtMC40NzVcblxu44CQ5pe66KGw5Yik5a6a44CRXG43LiDlvZLkuIDljJblvpfliIbvvIzorqHnrpfmnIDnu4jml7roobDnirbmgIHvvJpcbiAgIC0g5pe677ya5b6X5YiGID4gMC42XG4gICAtIOebuO+8mjAuMyA8IOW+l+WIhiDiiaQgMC42XG4gICAtIOS8ke+8mi0wLjMg4omkIOW+l+WIhiDiiaQgMC4zXG4gICAtIOWbmu+8mi0wLjYg4omkIOW+l+WIhiA8IC0wLjNcbiAgIC0g5q2777ya5b6X5YiGIDwgLTAuNlxuXG7moLnmja7orqHnrpfnu5PmnpwtMC40NzXvvIzml6XkuLvkuLpcIuWbmlwi44CCYFxuICAgICAgfSxcbiAgICAgICfmrbsnOiB7XG4gICAgICAgIG5hbWU6ICfmrbsnLFxuICAgICAgICBleHBsYW5hdGlvbjogJ+aXpeS4u+atu+ihqOekuuWRveS4u+eahOS6lOihjOWKm+mHj+aegeW8se+8jOS4quaAp+WPr+iDvei/h+S6jui9r+W8se+8jOe8uuS5j+iHquS/oe+8jOWuueaYk+WPl+WItuS6juS6uuOAgicsXG4gICAgICAgIGluZmx1ZW5jZTogJ+aXpeS4u+atu+eahOS6uu+8jOS4quaAp+WPr+iDvei/h+S6jui9r+W8se+8jOe8uuS5j+iHquS/oe+8jOWuueaYk+WPl+WItuS6juS6uu+8jOWBmuS6i+e8uuS5j+S4u+inge+8jOS9huS4uuS6uuiwpuWSjO+8jOWWhOS6juWAvuWQrO+8jOmAguWQiOi+heWKqeaAp+W3peS9nOOAgicsXG4gICAgICAgIGNhbGN1bGF0aW9uOiBg5pel5Li75pe66KGw6K6h566X5pa55rOV77yaXG5cbuOAkOWfuuehgOiuoeeul+OAkVxuMS4g6K6h566X5pel5Li75LqU6KGM5Zyo5YWr5a2X5Lit55qE5by65bqmXG4gICAtIOmmluWFiOehruWumuaXpeS4u+S6lOihjO+8iOaXpeW5suaJgOWxnuS6lOihjO+8iVxuICAgLSDorqHnrpfor6XkupTooYzlnKjlhavlrZfkuK3nmoTmgLvlvpfliIbvvIjmjInnhafkupTooYzlvLrluqborqHnrpfmlrnms5XvvIlcbiAgIC0g6K6h566X5omA5pyJ5LqU6KGM55qE5oC75b6X5YiGXG4gICAtIOiuoeeul+aXpeS4u+S6lOihjOeahOebuOWvueW8uuW6pu+8muaXpeS4u+S6lOihjOW+l+WIhi/miYDmnInkupTooYzmgLvlvpfliIZcblxu44CQ5a2j6IqC5b2x5ZON44CRXG4yLiDogIPomZHlraPoioLlr7nml6XkuLvkupTooYznmoTlvbHlk43vvJpcbiAgIC0g5pil5a2j77yI5q2j44CB5LqM44CB5LiJ5pyI77yJ77yaXG4gICAgICog5pyo5pe6KCswLjMp44CB54Gr55u4KCswLjE1KeOAgeWcn+S8kSgwKeOAgemHkeWbmigtMC4xNSnjgIHmsLTmrbsoLTAuMylcbiAgIC0g5aSP5a2j77yI5Zub44CB5LqU44CB5YWt5pyI77yJ77yaXG4gICAgICog54Gr5pe6KCswLjMp44CB5Zyf55u4KCswLjE1KeOAgemHkeS8kSgwKeOAgeawtOWbmigtMC4xNSnjgIHmnKjmrbsoLTAuMylcbiAgIC0g56eL5a2j77yI5LiD44CB5YWr44CB5Lmd5pyI77yJ77yaXG4gICAgICog6YeR5pe6KCswLjMp44CB5rC055u4KCswLjE1KeOAgeacqOS8kSgwKeOAgeeBq+WbmigtMC4xNSnjgIHlnJ/mrbsoLTAuMylcbiAgIC0g5Yas5a2j77yI5Y2B44CB5Y2B5LiA44CB5Y2B5LqM5pyI77yJ77yaXG4gICAgICog5rC05pe6KCswLjMp44CB5pyo55u4KCswLjE1KeOAgeeBq+S8kSgwKeOAgeWcn+WbmigtMC4xNSnjgIHph5HmrbsoLTAuMylcblxu44CQ55Sf5YWL5YWz57O744CRXG4zLiDogIPomZHmnIjmlK/lr7nml6XkuLvnmoTnlJ/lhYvlhbPns7tcbiAgIC0g5pyI5pSv5LqU6KGM55Sf5pel5Li777yaKzAuMlxuICAgLSDmnIjmlK/kupTooYzlhYvml6XkuLvvvJotMC4yXG4gICAtIOaXpeS4u+S6lOihjOWFi+aciOaUr++8miswLjFcbiAgIC0g5pel5Li75LqU6KGM55Sf5pyI5pSv77yaLTAuMVxuXG7jgJDnu4TlkIjlvbHlk43jgJFcbjQuIOiAg+iZkeWcsOaUr+S4ieWQiOWxgOWvueaXpeS4u+eahOW9seWTjVxuICAgLSDkuInlkIjlsYDkupTooYznlJ/ml6XkuLvvvJorMC4xNVxuICAgLSDkuInlkIjlsYDkupTooYzlhYvml6XkuLvvvJotMC4xNVxuICAgLSDml6XkuLvkupTooYzlhYvkuInlkIjlsYDvvJorMC4xXG4gICAtIOaXpeS4u+S6lOihjOeUn+S4ieWQiOWxgO+8mi0wLjFcblxuNS4g6ICD6JmR5aSp5bmy5LqU5ZCI5a+55pel5Li755qE5b2x5ZONXG4gICAtIOS6lOWQiOWMluS6lOihjOeUn+aXpeS4u++8miswLjFcbiAgIC0g5LqU5ZCI5YyW5LqU6KGM5YWL5pel5Li777yaLTAuMVxuICAgLSDml6XkuLvlj4LkuI7kupTlkIjvvJotMC4wNe+8iOaXpeS4u+WPl+eJteWItu+8iVxuXG42LiDogIPomZHnurPpn7PkupTooYzlr7nml6XkuLvnmoTlvbHlk41cbiAgIC0g5pel5p+x57qz6Z+z5LiO5pel5Li75LqU6KGM55u45ZCM77yaKzAuMVxuICAgLSDml6Xmn7HnurPpn7PnlJ/ml6XkuLvkupTooYzvvJorMC4wNVxuICAgLSDml6Xmn7HnurPpn7PlhYvml6XkuLvkupTooYzvvJotMC4wNVxuXG7jgJDorqHnrpfnpLrkvovjgJFcbuWBh+iuvuWFq+Wtl+S4uu+8muWjrOWtkCDnmbjkuJEg55Sy5a+FIOS5meWNr1xuLSDml6XkuLvkuLrnlLLmnKhcbi0g5pyI5Luk5Li65LiR5pyI77yI5Yas5a2j77yJXG4tIOaXpeS4u+S6lOihjOW8uuW6puiuoeeul++8mueUsuacqOW+l+WIhuS4ujEuNeWIhu+8jOaAu+WIhuS4ujI15YiG77yM55u45a+55by65bqm5Li6MC4wNlxuLSDlraPoioLlvbHlk43vvJrlhqzlraPmnKjnm7jvvIzosIPmlbTns7vmlbDkuLorMC4xNVxuLSDmnIjmlK/kuJHlnJ/lhYvmnKjvvJotMC4yXG4tIOWcsOaUr+S4ieWQiO+8muWtkOS4keWPr+iDveS4jui+sOW9ouaIkOS4ieWQiOawtOWxgO+8jOawtOeUn+acqO+8miswLjE1XG4tIOWkqeW5suS6lOWQiO+8muaXoFxuLSDnurPpn7PkupTooYzvvJrnlLLlr4XkuLrlpKfmuqrmsLTvvIzmsLTnlJ/mnKjvvJorMC4wNVxuXG7mnIDnu4jlvpfliIbvvJowLjA2ICsgMC4xNSAtIDAuMiArIDAuMTUgKyAwLjA1ID0gLTAuNzlcblxu44CQ5pe66KGw5Yik5a6a44CRXG43LiDlvZLkuIDljJblvpfliIbvvIzorqHnrpfmnIDnu4jml7roobDnirbmgIHvvJpcbiAgIC0g5pe677ya5b6X5YiGID4gMC42XG4gICAtIOebuO+8mjAuMyA8IOW+l+WIhiDiiaQgMC42XG4gICAtIOS8ke+8mi0wLjMg4omkIOW+l+WIhiDiiaQgMC4zXG4gICAtIOWbmu+8mi0wLjYg4omkIOW+l+WIhiA8IC0wLjNcbiAgIC0g5q2777ya5b6X5YiGIDwgLTAuNlxuXG7moLnmja7orqHnrpfnu5PmnpwtMC43Oe+8jOaXpeS4u+S4ulwi5q27XCLjgIJgXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBleHBsYW5hdGlvbnNbcmlaaHVdIHx8IG51bGw7XG4gIH1cbn1cbiJdfQ==