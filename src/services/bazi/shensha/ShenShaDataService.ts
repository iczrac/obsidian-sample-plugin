/**
 * 神煞数据管理服务
 * 统一管理神煞的详细信息、分类、化解方法等数据
 */

export interface ShenShaDetail {
  name: string;
  type: string;
  description: string;
  effect: string;
  calculation: string;
  category: string;
  level: number; // 重要程度 1-10
}

export interface ResolutionMethod {
  method: string;
  items: string[];
  timing: string;
  precautions: string[];
  effectiveness: number; // 有效性 1-10
}

export interface ImpactLevel {
  positive: number; // 正面影响 0-10
  negative: number; // 负面影响 0-10
  overall: number;  // 综合影响 -10到10
  description: string;
}

export class ShenShaDataService {

  /**
   * 缓存机制
   */
  private static cache: Map<string, any> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 神煞详细信息数据库
   */
  private static readonly SHENSHA_DETAILS: {[key: string]: ShenShaDetail} = {
    '天乙贵人': {
      name: '天乙贵人',
      type: '吉神',
      description: '命中贵人，主得贵人相助',
      effect: '逢凶化吉，遇难呈祥，多得贵人扶持，事业有成',
      calculation: '甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎',
      category: '贵人类',
      level: 10
    },
    '禄神': {
      name: '禄神',
      type: '吉神',
      description: '天干之禄，主财禄丰厚',
      effect: '财运亨通，衣食无忧，事业有成，收入稳定',
      calculation: '甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子',
      category: '财禄类',
      level: 9
    },
    '羊刃': {
      name: '羊刃',
      type: '凶神',
      description: '刚强之星，主性格刚烈',
      effect: '性格急躁，易有血光之灾，但也主武勇，有领导才能',
      calculation: '甲刃在卯，乙刃在寅，丙戊刃在午，丁己刃在巳，庚刃在酉，辛刃在申，壬刃在子，癸刃在亥',
      category: '刑冲类',
      level: 8
    },
    '桃花': {
      name: '桃花',
      type: '吉凶神',
      description: '异性缘星，主感情丰富',
      effect: '异性缘佳，魅力十足，但易有感情纠纷，婚姻波折',
      calculation: '寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子',
      category: '感情类',
      level: 6
    },
    '华盖': {
      name: '华盖',
      type: '吉凶神',
      description: '艺术之星，主聪明孤高',
      effect: '聪明好学，有艺术天赋，宗教缘分深，但性格孤僻，不善交际',
      calculation: '寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未',
      category: '才艺类',
      level: 7
    },
    '文昌': {
      name: '文昌',
      type: '吉神',
      description: '文学之星，主聪明好学',
      effect: '学业有成，文思敏捷，利考试升学，文笔出众',
      calculation: '甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯',
      category: '学业类',
      level: 8
    },
    '将星': {
      name: '将星',
      type: '吉凶神',
      description: '权威之星，主领导才能',
      effect: '有领导才能，权威性强，但易孤独，责任重大',
      calculation: '寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯',
      category: '权威类',
      level: 7
    },
    '驿马': {
      name: '驿马',
      type: '吉神',
      description: '奔波之星，主变动迁移',
      effect: '多变动，利远行，事业多变化，但也主奔波劳碌',
      calculation: '申子辰见寅，寅午戌见申，巳酉丑见亥，亥卯未见巳',
      category: '变动类',
      level: 6
    },
    '天德': {
      name: '天德',
      type: '吉神',
      description: '天德之星，主逢凶化吉',
      effect: '逢凶化吉，遇难呈祥，天德护佑，灾难自消',
      calculation: '正月生见丁，二月生见申，三月生见壬，四月生见辛，五月生见亥，六月生见甲，七月生见癸，八月生见寅，九月生见丙，十月生见乙，十一月生见巳，十二月生见庚',
      category: '德星类',
      level: 9
    },
    '月德': {
      name: '月德',
      type: '吉神',
      description: '月德之星，主品德高尚',
      effect: '品德高尚，人缘好，逢凶化吉，多得人助',
      calculation: '寅午戌月生见丙，申子辰月生见壬，巳酉丑月生见庚，亥卯未月生见甲',
      category: '德星类',
      level: 8
    },
    '天医': {
      name: '天医',
      type: '吉神',
      description: '医药之星，主健康长寿',
      effect: '身体健康，长寿，有医药缘分，能治病救人',
      calculation: '正月亥，二月子，三月丑，四月寅，五月卯，六月辰，七月巳，八月午，九月未，十月申，十一月酉，十二月戌',
      category: '健康类',
      level: 7
    },
    '劫煞': {
      name: '劫煞',
      type: '凶神',
      description: '劫夺之星，主破财损失',
      effect: '易破财，多劫夺，投资失利，财来财去',
      calculation: '申子辰见巳，寅午戌见亥，巳酉丑见寅，亥卯未见申',
      category: '破财类',
      level: 7
    },
    '灾煞': {
      name: '灾煞',
      type: '凶神',
      description: '灾难之星，主意外灾祸',
      effect: '易有意外灾祸，疾病缠身，需注意安全',
      calculation: '申子辰见午，寅午戌见子，巳酉丑见卯，亥卯未见酉',
      category: '灾祸类',
      level: 8
    },
    '天刑': {
      name: '天刑',
      type: '凶神',
      description: '刑罚之星，主官司诉讼',
      effect: '易有官司诉讼，刑罚之灾，需谨慎行事',
      calculation: '寅见巳，巳见申，申见亥，亥见寅',
      category: '刑罚类',
      level: 8
    },
    '孤辰': {
      name: '孤辰',
      type: '凶神',
      description: '孤独之星，主孤独无依',
      effect: '性格孤僻，人际关系差，易孤独终老',
      calculation: '亥子丑人见寅，寅卯辰人见巳，巳午未人见申，申酉戌人见亥',
      category: '孤独类',
      level: 6
    },
    '寡宿': {
      name: '寡宿',
      type: '凶神',
      description: '寡居之星，主婚姻不利',
      effect: '婚姻不利，易寡居，感情波折多',
      calculation: '亥子丑人见戌，寅卯辰人见丑，巳午未人见辰，申酉戌人见未',
      category: '婚姻类',
      level: 6
    },
    '魁罡': {
      name: '魁罡',
      type: '凶神',
      description: '刚强之星，主性格刚烈',
      effect: '性格刚烈，有领导才能，但易孤独，婚姻不顺',
      calculation: '庚戌、庚辰、戊戌、壬辰四日',
      category: '刚强类',
      level: 7
    },
    '阴差阳错': {
      name: '阴差阳错',
      type: '凶神',
      description: '婚姻不顺之星',
      effect: '婚姻感情容易出现波折，夫妻不和，易有第三者',
      calculation: '丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥',
      category: '婚姻类',
      level: 7
    },
    '空亡': {
      name: '空亡',
      type: '凶神',
      description: '虚无空虚之星，主事业不顺',
      effect: '八字若逢空亡在时为重，在日次之。空亡主虚无和空虚，容易感到空虚和无所依靠，事业发展不顺',
      calculation: '以日柱为主，柱中年、月、时支见者为空亡。子丑空在戌亥，寅卯空在申酉，辰巳空在午未，午未空在辰巳，申酉空在寅卯，戌亥空在子丑',
      category: '虚空类',
      level: 8
    },
    '太极贵人': {
      name: '太极贵人',
      type: '吉神',
      description: '地位崇高之星，主事业学术成就',
      effect: '人命若带太极贵人，主地位崇高，于事业、学术方面有卓越成就，且能独树一帜，受人景仰',
      calculation: '甲乙日干见子午，丙丁日干见酉卯，戊己日干见辰戌丑未，庚辛日干见寅亥，壬癸日干见巳申',
      category: '贵人类',
      level: 9
    },
    '金舆': {
      name: '金舆',
      type: '吉神',
      description: '富贵婚姻之星，主得妻财',
      effect: '金舆主富贵，得妻财。女命逢之，主性格温柔善良，容貌美丽，生活富裕无忧；男命遇此，主得贤妻或受女性青睐',
      calculation: '甲日干金舆在辰，乙日干金舆在巳，丙戊日干金舆在未，丁己日干金舆在申，庚日干金舆在戌，辛日干金舆在亥，壬日干金舆在丑，癸日干金舆在寅',
      category: '富贵类',
      level: 8
    },
    '国印贵人': {
      name: '国印贵人',
      type: '吉神',
      description: '权力地位之星，主掌权执政',
      effect: '命带国印贵人，又逢生旺或有其他吉神相助，其人有掌权之能，可在政府机关执掌实权',
      calculation: '以年干和日干查，甲见戌，乙见亥，丙见丑，丁见寅，戊见丑，己见寅，庚见辰，辛见巳，壬见未，癸见申',
      category: '权威类',
      level: 8
    },
    '三奇贵人': {
      name: '三奇贵人',
      type: '吉神',
      description: '奇才异能之星，主博学多能',
      effect: '得三奇之命者，不同凡俗，精神异常，襟怀卓越，好奇尚大，博学多能，乃世界之"奇人"',
      calculation: '天上三奇乙丙丁；地下三奇甲戊庚；人中三奇壬癸辛',
      category: '才能类',
      level: 8
    },
    '福星贵人': {
      name: '福星贵人',
      type: '吉神',
      description: '福气平安之星，主多福多寿',
      effect: '人命若带福星，主一生禄禄无缺，格局配合得当，必然多福多寿，金玉满堂。此星多主平安福气而不主富贵',
      calculation: '甲丙两干见寅或子，乙癸两干见卯或丑，戊干见申，己干见未，丁干见亥，庚干见午，辛干见巳，壬干见辰',
      category: '福德类',
      level: 7
    },
    '文曲': {
      name: '文曲',
      type: '吉神',
      description: '文学才华之星，主文学创作',
      effect: '文曲星主文学才华，适合从事文学创作、艺术表达等工作，容易在文学艺术领域取得成就',
      calculation: '寅午戌年支见丑，申子辰年支见未，亥卯未年支见辰，巳酉丑年支见戌',
      category: '学业类',
      level: 7
    },
    '天德合': {
      name: '天德合',
      type: '吉神',
      description: '天德配偶星，主和合团结',
      effect: '天德合是天德的配偶，主和合、团结、协作。有天德合的人，人际关系好，容易得到他人的帮助，生活和谐美满',
      calculation: '寅午戌月支见辰，申子辰月支见戌，亥卯未月支见丑，巳酉丑月支见未',
      category: '德星类',
      level: 7
    },
    '学堂词馆': {
      name: '学堂词馆',
      type: '吉神',
      description: '学业功名之星，主登科及第',
      effect: '称文星，主学业功名之事，凡此星入命，主登科及第，学业大展宏图',
      calculation: '甲见卯乙见辰，丙戊见巳丁己见午，庚见申辛见酉，壬见亥癸见子',
      category: '学业类',
      level: 8
    },
    '德秀贵人': {
      name: '德秀贵人',
      type: '吉神',
      description: '品德才华之星，主内涵充实',
      effect: '德秀也是一种贵人，它能逢凶化吉，献瑞呈祥，人命带之，主内涵充实，精神爽朗，仪表清奇，才华出众',
      calculation: '寅午戌月丙丁为德戊癸为秀，申子辰月壬癸戊己为德丙辛甲己为秀，巳酉丑月庚辛为德乙庚为秀，亥卯未月甲乙为德丁壬为秀',
      category: '德才类',
      level: 7
    },
    '天喜': {
      name: '天喜',
      type: '吉神',
      description: '喜庆婚姻之星，主喜事连连',
      effect: '天喜主喜庆和婚姻，利于婚姻和喜事。有天喜的人，婚姻美满，容易有喜事，人生充满欢乐',
      calculation: '子年支天喜在酉，丑年支天喜在申，寅年支天喜在未，卯年支天喜在午，辰年支天喜在巳，巳年支天喜在辰，午年支天喜在卯，未年支天喜在寅，申年支天喜在丑，酉年支天喜在子，戌年支天喜在亥，亥年支天喜在戌',
      category: '喜庆类',
      level: 6
    },
    '红鸾': {
      name: '红鸾',
      type: '吉凶神',
      description: '婚姻姻缘之星，主感情运势',
      effect: '红鸾主婚姻和姻缘，利于婚姻和感情，但也容易因感情而烦恼。有红鸾的人，婚姻和感情运势好，容易遇到良缘',
      calculation: '子年支红鸾在酉，丑年支红鸾在申，寅年支红鸾在未，卯年支红鸾在午，辰年支红鸾在巳，巳年支红鸾在辰，午年支红鸾在卯，未年支红鸾在寅，申年支红鸾在丑，酉年支红鸾在子，戌年支红鸾在亥，亥年支红鸾在戌',
      category: '感情类',
      level: 6
    },
    '红艳': {
      name: '红艳',
      type: '吉凶神',
      description: '艳遇桃花之星，主异性缘',
      effect: '红艳主艳遇和桃花运，利于感情但也容易因感情而烦恼。有红艳的人，异性缘好，感情丰富，但也容易因感情而烦恼',
      calculation: '子年支红艳在酉，丑年支红艳在申，寅年支红艳在未，卯年支红艳在午，辰年支红艳在巳，巳年支红艳在辰，午年支红艳在卯，未年支红艳在寅，申年支红艳在丑，酉年支红艳在子，戌年支红艳在亥，亥年支红艳在戌',
      category: '感情类',
      level: 5
    },
    '天姚': {
      name: '天姚',
      type: '吉凶神',
      description: '感情桃花之星，主感情丰富',
      effect: '天姚主感情和桃花，利于感情但也容易因感情而烦恼。有天姚的人，感情丰富，异性缘好，但也容易因感情而烦恼',
      calculation: '子年支天姚在巳，丑年支天姚在午，寅年支天姚在未，卯年支天姚在申，辰年支天姚在酉，巳年支天姚在戌，午年支天姚在亥，未年支天姚在子，申年支天姚在丑，酉年支天姚在寅，戌年支天姚在卯，亥年支天姚在辰',
      category: '感情类',
      level: 5
    },
    '十恶大败': {
      name: '十恶大败',
      type: '凶神',
      description: '败家灾祸之星，主败家迹象',
      effect: '这十天出生的人，不但年支和日支彼此相冲，并且禄地碰上空亡。有此煞，有败家迹象',
      calculation: '甲辰、乙巳、丙申、丁亥、戊戌、己丑、庚辰、辛巳、壬申、癸亥日柱',
      category: '败家类',
      level: 8
    },
    '解神': {
      name: '解神',
      type: '吉神',
      description: '解除灾难之星，主化解困境',
      effect: '解神主解除灾难和困境，有解神的人，容易化解灾难和困境，逢凶化吉，遇难呈祥',
      calculation: '寅月见申，卯月见酉，辰月见戌，巳月见亥，午月见子，未月见丑，申月见寅，酉月见卯，戌月见辰，亥月见巳，子月见午，丑月见未',
      category: '化解类',
      level: 7
    },
    '金神': {
      name: '金神',
      type: '吉神',
      description: '财富权力之星，主富贵显达',
      effect: '金神主财富和权力，有金神的人，财运好，事业有成，容易获得财富和地位',
      calculation: '甲日干金神在申，乙日干金神在酉，丙日干金神在亥，丁日干金神在子，戊日干金神在寅，己日干金神在卯，庚日干金神在巳，辛日干金神在午，壬日干金神在申，癸日干金神在未',
      category: '财富类',
      level: 7
    },
    '天空': {
      name: '天空',
      type: '凶神',
      description: '虚无空虚之星，主事业不顺',
      effect: '有天空的人，容易感到空虚和无所依靠，事业发展不顺，需要注意寻找精神寄托',
      calculation: '天空固定在戌位。即戌地支中有天空神煞',
      category: '虚空类',
      level: 6
    },
    '地劫': {
      name: '地劫',
      type: '凶神',
      description: '劫难灾祸之星，主遭遇劫难',
      effect: '有地劫的人，容易遭遇劫难和灾祸，事业发展不顺，需要注意避免灾祸',
      calculation: '地劫固定在辰位。即辰地支中有地劫神煞',
      category: '劫难类',
      level: 6
    },
    '天哭': {
      name: '天哭',
      type: '凶神',
      description: '悲伤哭泣之星，主情绪不稳',
      effect: '有天哭的人，容易悲伤和哭泣，情绪不稳定，需要注意调节情绪',
      calculation: '天哭固定在未位。即未地支中有天哭神煞',
      category: '情绪类',
      level: 5
    },
    '天虚': {
      name: '天虚',
      type: '凶神',
      description: '虚弱疾病之星，主身体虚弱',
      effect: '有天虚的人，容易身体虚弱和生病，需要注意保养身体',
      calculation: '天虚固定在丑位。即丑地支中有天虚神煞',
      category: '健康类',
      level: 5
    },
    '咸池': {
      name: '咸池',
      type: '吉凶神',
      description: '感情艺术之星，主艺术天赋',
      effect: '有咸池的人，感情丰富，艺术天赋好，适合从事艺术工作，但也容易因感情而烦恼',
      calculation: '咸池固定在丑、未、辰、戌四个地支中。即这四个地支中有咸池神煞',
      category: '艺术类',
      level: 6
    },
    '亡神': {
      name: '亡神',
      type: '凶神',
      description: '失去死亡之星，主失去重要事物',
      effect: '亡神为四柱八字中的一个神煞，为凶时主人奸诈，多诡计，巧言令色，有牢狱之灾；为吉时则主人头脑精明，反应敏捷，有智谋奇计，善于随机应变',
      calculation: '申子辰见亥，寅午戌见巳，巳酉丑见申，亥卯未见寅，即为亡神',
      category: '失去类',
      level: 7
    },
    '披麻': {
      name: '披麻',
      type: '凶神',
      description: '丧事悲伤之星，主遭遇丧事',
      effect: '披麻主丧事和悲伤，有披麻的人，容易遭遇丧事和悲伤，需要注意避免丧事和悲伤',
      calculation: '年日支后三位为披麻。子见酉，丑见戌，寅见亥，卯见子，辰见丑，巳见寅，午见卯，未见辰，申见巳，酉见午，戌见未，亥见申',
      category: '丧事类',
      level: 6
    },
    '吊客': {
      name: '吊客',
      type: '凶神',
      description: '丧事悲伤之星，主吊丧之事',
      effect: '吊客主丧事和悲伤，有吊客的人，容易遭遇丧事和悲伤，需要注意避免丧事和悲伤',
      calculation: '年支后两位为吊客。子见戌，丑见亥，寅见子，卯见丑，辰见寅，巳见卯，午见辰，未见巳，申见午，酉见未，戌见申，亥见酉',
      category: '丧事类',
      level: 6
    },
    '丧门': {
      name: '丧门',
      type: '凶神',
      description: '丧事悲伤之星，主遭遇丧事',
      effect: '丧门主丧事和悲伤，有丧门的人，容易遭遇丧事和悲伤，需要注意避免丧事和悲伤',
      calculation: '年支前两位为丧门。子见寅，丑见卯，寅见辰，卯见巳，辰见午，巳见未，午见申，未见酉，申见戌，酉见亥，戌见子，亥见丑',
      category: '丧事类',
      level: 6
    },
    '元辰': {
      name: '元辰',
      type: '凶神',
      description: '消耗损失之星，主财运不佳',
      effect: '元辰隶属于八字神煞，也叫大耗，其凶可想而知。元辰入命的男女，一生最怕情事桃花或酒色之灾，或见无妄之灾，官司、牢狱之灾亦或有之',
      calculation: '子年大耗在未，丑年大耗在申，寅年大耗在酉，卯年大耗在戌，辰年大耗在亥，巳年大耗在子，午年大耗在丑，未年大耗在寅，申年大耗在卯，酉年大耗在辰，戌年大耗在巳，亥年大耗在午',
      category: '消耗类',
      level: 7
    },
    '孤鸾煞': {
      name: '孤鸾煞',
      type: '凶神',
      description: '婚姻不顺之星，主夫妻不和',
      effect: '孤鸾煞，又名呻吟煞，主要论男女婚姻之事，有时特指女命。命犯孤鸾煞主夫妻感情不好，婚姻不顺，如果遇其它吉星同柱，可适当减轻命中不顺',
      calculation: '乙巳，丁巳，辛亥，戊申，壬寅，戊午，壬子，丙午日柱为孤鸾煞',
      category: '婚姻类',
      level: 7
    },
    '四废': {
      name: '四废',
      type: '凶神',
      description: '身弱多病之星，主做事无成',
      effect: '命遇四废，主身弱多病，做事无成，有始无终',
      calculation: '春庚申，辛酉，夏壬子，癸亥，秋甲寅，乙卯，冬丙午，丁巳',
      category: '疾病类',
      level: 6
    },
    '天罗地网': {
      name: '天罗地网',
      type: '凶神',
      description: '牢狱疾病之星，主牢狱之灾',
      effect: '天罗地网是一个主凶的神煞，如在先天命局中出现，或大运、流年中遇之，主有牢狱、疾病之灾',
      calculation: '戌亥为天罗，辰巳为地网。凡纳音火命，见戌亥日为天罗；纳音水土命，见辰巳日为地网，纳音金木二命无之',
      category: '牢狱类',
      level: 8
    },

    '日德': {
      name: '日德',
      type: '吉神',
      description: '仁慈德行之星，主心地善良',
      effect: '日德主人心地善良，品德高尚，乐善好施，有慈悲心，多得贵人相助，晚年安康',
      calculation: '甲寅、戊辰、丙辰、庚辰、壬戌日',
      category: '德神类',
      level: 7
    }
  };

  /**
   * 化解方法数据库
   */
  private static readonly RESOLUTION_METHODS: {[key: string]: ResolutionMethod} = {
    '羊刃': {
      method: '佩戴化解物品，修身养性',
      items: ['玉器', '佛珠', '平安符'],
      timing: '日常佩戴',
      precautions: ['控制脾气', '避免冲动', '多行善事'],
      effectiveness: 7
    },
    '桃花': {
      method: '正确处理感情，避免滥情',
      items: ['粉水晶', '和合符', '红绳'],
      timing: '感情期间',
      precautions: ['专一感情', '避免暧昧', '正当交往'],
      effectiveness: 6
    },
    '劫煞': {
      method: '谨慎理财，避免投机',
      items: ['貔貅', '五帝钱', '聚宝盆'],
      timing: '投资理财时',
      precautions: ['谨慎投资', '避免借贷', '稳健理财'],
      effectiveness: 7
    },
    '魁罡': {
      method: '修身养性，积德行善',
      items: ['佛珠', '经书', '善书'],
      timing: '日常修持',
      precautions: ['控制脾气', '多行善事', '避免争斗'],
      effectiveness: 8
    },
    '阴差阳错': {
      method: '择吉结婚，和谐相处',
      items: ['和合符', '鸳鸯玉', '红绳'],
      timing: '结婚前后',
      precautions: ['选择良辰吉日', '夫妻和睦', '互相包容'],
      effectiveness: 6
    },
    '空亡': {
      method: '充实精神生活，寻找人生目标',
      items: ['水晶', '佛珠', '护身符'],
      timing: '日常佩戴',
      precautions: ['充实精神生活', '寻找人生目标', '多行善事'],
      effectiveness: 6
    },
    '十恶大败': {
      method: '积德行善，谨慎理财',
      items: ['护身符', '五帝钱', '聚宝盆'],
      timing: '日常佩戴',
      precautions: ['积德行善', '谨慎理财', '避免投机'],
      effectiveness: 7
    },
    '孤鸾煞': {
      method: '择吉结婚，夫妻和睦',
      items: ['和合符', '鸳鸯玉', '红绳'],
      timing: '结婚前后',
      precautions: ['择吉结婚', '夫妻和睦', '互相包容'],
      effectiveness: 6
    },
    '天罗地网': {
      method: '谨慎行事，避免官司',
      items: ['护身符', '平安符', '观音像'],
      timing: '日常佩戴',
      precautions: ['谨慎行事', '避免官司', '多行善事'],
      effectiveness: 7
    },
    '元辰': {
      method: '节约开支，避免浪费',
      items: ['聚宝盆', '五帝钱', '貔貅'],
      timing: '理财时',
      precautions: ['节约开支', '避免浪费', '谨慎投资'],
      effectiveness: 6
    },

    '日德': {
      method: '继续行善积德，保持善心',
      items: ['佛珠', '善书', '慈善证书'],
      timing: '日常修持',
      precautions: ['继续行善', '保持慈悲心', '多做好事'],
      effectiveness: 8
    }
  };

  /**
   * 缓存管理方法
   */
  private static getFromCache<T>(key: string): T | null {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key);

    if (expiry && now > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  private static setCache<T>(key: string, value: T): void {
    const expiry = Date.now() + this.CACHE_TTL;
    this.cache.set(key, value);
    this.cacheExpiry.set(key, expiry);
  }

  private static clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 获取神煞详细信息
   * @param shenShaName 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaDetail(shenShaName: string): ShenShaDetail {
    // 去除可能的前缀（如"年柱:"）
    const pureName = shenShaName.includes(':') ? shenShaName.split(':')[1] : shenShaName;
    
    return this.SHENSHA_DETAILS[pureName] || {
      name: pureName,
      type: '未知',
      description: '暂无详细信息',
      effect: '暂无详细信息',
      calculation: '暂无详细信息',
      category: '其他',
      level: 5
    };
  }

  /**
   * 获取神煞分类
   * @param shenShaName 神煞名称
   * @returns 神煞分类
   */
  static getShenShaCategory(shenShaName: string): string {
    const detail = this.getShenShaDetail(shenShaName);
    return detail.category;
  }

  /**
   * 获取化解方法
   * @param shenShaName 神煞名称
   * @returns 化解方法
   */
  static getResolutionMethod(shenShaName: string): ResolutionMethod | null {
    const pureName = shenShaName.includes(':') ? shenShaName.split(':')[1] : shenShaName;
    return this.RESOLUTION_METHODS[pureName] || null;
  }

  /**
   * 获取神煞影响程度
   * @param shenShaName 神煞名称
   * @returns 影响程度评估
   */
  static getShenShaImpact(shenShaName: string): ImpactLevel {
    const detail = this.getShenShaDetail(shenShaName);
    
    let positive = 0;
    let negative = 0;
    
    switch (detail.type) {
      case '吉神':
        positive = detail.level;
        negative = 0;
        break;
      case '凶神':
        positive = 0;
        negative = detail.level;
        break;
      case '吉凶神':
        positive = Math.floor(detail.level * 0.6);
        negative = Math.floor(detail.level * 0.4);
        break;
    }
    
    const overall = positive - negative;
    
    let description = '';
    if (overall >= 7) {
      description = '影响极为有利';
    } else if (overall >= 4) {
      description = '影响较为有利';
    } else if (overall >= 1) {
      description = '影响略为有利';
    } else if (overall >= -1) {
      description = '影响中性';
    } else if (overall >= -4) {
      description = '影响略为不利';
    } else if (overall >= -7) {
      description = '影响较为不利';
    } else {
      description = '影响极为不利';
    }
    
    return {
      positive,
      negative,
      overall,
      description
    };
  }

  /**
   * 获取所有神煞分类列表
   * @returns 分类列表
   */
  static getAllCategories(): string[] {
    const cacheKey = 'all_categories';
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = new Set<string>();
    Object.values(this.SHENSHA_DETAILS).forEach(detail => {
      categories.add(detail.category);
    });
    const result = Array.from(categories);
    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * 根据分类获取神煞列表
   * @param category 分类名称
   * @returns 该分类下的神煞列表
   */
  static getShenShaByCategory(category: string): string[] {
    const cacheKey = `category_${category}`;
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = Object.entries(this.SHENSHA_DETAILS)
      .filter(([_, detail]) => detail.category === category)
      .map(([name, _]) => name);
    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * 获取所有有化解方法的神煞
   * @returns 可化解的神煞列表
   */
  static getResolvableShenSha(): string[] {
    return Object.keys(this.RESOLUTION_METHODS);
  }

  /**
   * 获取神煞统计信息
   * @returns 统计信息
   */
  static getShenShaStatistics(): {
    total: number;
    byType: {[key: string]: number};
    byCategory: {[key: string]: number};
    resolvable: number;
  } {
    const cacheKey = 'statistics';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const total = Object.keys(this.SHENSHA_DETAILS).length;
    const byType: {[key: string]: number} = {};
    const byCategory: {[key: string]: number} = {};

    Object.values(this.SHENSHA_DETAILS).forEach(detail => {
      byType[detail.type] = (byType[detail.type] || 0) + 1;
      byCategory[detail.category] = (byCategory[detail.category] || 0) + 1;
    });

    const resolvable = Object.keys(this.RESOLUTION_METHODS).length;

    const result = {
      total,
      byType,
      byCategory,
      resolvable
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * 清理缓存
   */
  static clearAllCache(): void {
    this.clearCache();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
