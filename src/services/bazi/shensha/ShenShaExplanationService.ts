/**
 * 神煞解释服务
 * 整合神煞解释和分析功能
 */

export interface ShenShaInfo {
  name: string;
  type: string; // 吉神、凶神、吉凶神
  explanation: string;
  influence: string;
  advice: string;
  calculation: string;
}

export interface ShenShaCombinationAnalysis {
  totalShenSha: number;
  jiShenCount: number;
  xiongShenCount: number;
  jiXiongShenCount: number;
  overallInfluence: string;
  keyPoints: string[];
  advice: string;
}

export class ShenShaExplanationService {
  /**
   * 获取神煞的详细信息
   * @param shenSha 神煞名称
   * @returns 神煞详细信息
   */
  static getShenShaInfo(shenSha: string): ShenShaInfo | null {
    const shenShaData: { [key: string]: ShenShaInfo } = {
      '天乙贵人': {
        name: '天乙贵人',
        type: '吉神',
        explanation: '天乙贵人是八字中最重要的吉神之一，代表贵人相助、逢凶化吉。',
        influence: '主贵人相助，遇到困难时容易得到帮助，事业发展顺利，社会地位较高。',
        advice: '要珍惜贵人关系，多行善事，以德报德，扩大人脉圈。',
        calculation: '以日干为主，查年支月支时支。甲戊见牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢虎马，此是贵人方。'
      },
      '羊刃': {
        name: '羊刃',
        type: '凶神',
        explanation: '羊刃是日干的强根，但过旺则凶，主性格刚烈，易有血光之灾。',
        influence: '性格刚烈，做事果断，但容易冲动，与人发生冲突，需要制化。',
        advice: '要控制脾气，避免冲动行事，多修身养性，化解刚烈之气。',
        calculation: '甲见卯、乙见寅、丙戊见午、丁己见巳、庚见酉、辛见申、壬见子、癸见亥。'
      },
      '桃花': {
        name: '桃花',
        type: '吉凶神',
        explanation: '桃花主异性缘分和艺术才华，但也可能带来感情纠纷。',
        influence: '异性缘佳，有艺术天赋，魅力十足，但容易有感情纠纷。',
        advice: '要正确处理感情关系，将艺术天赋发挥在正当途径上。',
        calculation: '寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子。'
      },
      '华盖': {
        name: '华盖',
        type: '吉凶神',
        explanation: '华盖主孤独和艺术、宗教才能，有超凡脱俗的气质。',
        influence: '有艺术天赋，喜欢神秘学，但性格孤僻，不善社交。',
        advice: '要平衡孤独与社交，将特殊才能转化为实际成就。',
        calculation: '寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未。'
      },
      '文昌': {
        name: '文昌',
        type: '吉神',
        explanation: '文昌主文学才华和学业功名，利于考试升学。',
        influence: '学业有成，文笔佳，利考试升学，适合从事文化教育工作。',
        advice: '要充分发挥文学才华，多读书学习，提升文化修养。',
        calculation: '甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯。'
      },
      '禄神': {
        name: '禄神',
        type: '吉神',
        explanation: '禄神主财禄和地位，代表稳定的收入和社会地位。',
        influence: '有稳定收入，地位尊贵，衣食无忧，事业发展稳定。',
        advice: '要珍惜现有地位，稳步发展，不要贪图不义之财。',
        calculation: '甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子。'
      },
      '将星': {
        name: '将星',
        type: '吉神',
        explanation: '将星主领导才能和权威，有统御他人的能力。',
        influence: '有领导能力，能统御他人，适合管理工作，容易获得权威地位。',
        advice: '要培养领导才能，承担责任，以德服人，建立威信。',
        calculation: '寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯。'
      },
      '孤辰': {
        name: '孤辰',
        type: '凶神',
        explanation: '孤辰主孤独，人际关系不佳，容易孤立无援。',
        influence: '性格孤僻，人际关系不佳，容易感到孤独，缺乏朋友。',
        advice: '要主动与人交往，培养社交能力，多参加集体活动。',
        calculation: '亥子丑人见寅，寅卯辰人见巳，巳午未人见申，申酉戌人见亥。'
      },
      '寡宿': {
        name: '寡宿',
        type: '凶神',
        explanation: '寡宿主孤独，特别影响婚姻感情，容易独身。',
        influence: '婚姻感情不顺，容易独身，即使结婚也容易分离。',
        advice: '要重视感情经营，多沟通理解，避免过于固执己见。',
        calculation: '亥子丑人见戌，寅卯辰人见丑，巳午未人见辰，申酉戌人见未。'
      },
      '天德': {
        name: '天德',
        type: '吉神',
        explanation: '天德是重要的吉神，主逢凶化吉，遇难呈祥。',
        influence: '逢凶化吉，遇难呈祥，一生较为平安顺利。',
        advice: '要心存善念，多行善事，积累功德，回报社会。',
        calculation: '正月生者见丁，二月生者见申，三月生者见壬，四月生者见辛，五月生者见亥，六月生者见甲，七月生者见癸，八月生者见寅，九月生者见丙，十月生者见乙，十一月生者见巳，十二月生者见庚。'
      },
      '月德': {
        name: '月德',
        type: '吉神',
        explanation: '月德是重要的吉神，主化解灾难，增加福德。',
        influence: '化解灾难，增加福德，人缘好，容易得到帮助。',
        advice: '要保持善良本性，多帮助他人，积累人脉关系。',
        calculation: '寅午戌月生者见丙，申子辰月生者见壬，巳酉丑月生者见庚，亥卯未月生者见甲。'
      },
      '天医': {
        name: '天医',
        type: '吉神',
        explanation: '天医主健康长寿，医药有缘，有治病救人的能力。',
        influence: '身体健康，长寿，有医药天赋，适合从事医疗保健工作。',
        advice: '要注重养生保健，可以学习医药知识，帮助他人治病。',
        calculation: '正月亥，二月子，三月丑，四月寅，五月卯，六月辰，七月巳，八月午，九月未，十月申，十一月酉，十二月戌。'
      },
      '金神': {
        name: '金神',
        type: '吉凶神',
        explanation: '金神主刚毅果断，有杀伐决断之能，但也主刑伤。',
        influence: '性格刚毅，有决断力，适合军警工作，但容易有刑伤。',
        advice: '要控制脾气，避免冲动行事，将刚毅用在正当途径上。',
        calculation: '乙丑、己巳、癸酉三日三时。'
      },
      '空亡': {
        name: '空亡',
        type: '凶神',
        explanation: '空亡主虚无和空虚，有空亡的人，容易感到空虚和无所依靠。',
        influence: '容易感到空虚和无所依靠，事业发展不顺，需要注意寻找精神寄托。',
        advice: '要寻找精神寄托，培养兴趣爱好，避免过于空虚。',
        calculation: '子丑空在戌亥，寅卯空在申酉，辰巳空在午未，午未空在辰巳，申酉空在寅卯，戌亥空在子丑。'
      },
      '魁罡贵人': {
        name: '魁罡贵人',
        type: '吉神',
        explanation: '魁罡贵人主权威和领导力，个性耿直，胸无城府，疾恶如仇。',
        influence: '个性耿直，胸无城府，疾恶如仇，聪明果断，善用权力，赏罚分明。',
        advice: '要发挥领导才能，但需注意过度刚强对婚姻的影响。',
        calculation: '庚辰、庚戌、壬辰、戊戌这四日出生的人。'
      },
      '金舆': {
        name: '金舆',
        type: '吉神',
        explanation: '金舆主富贵和婚姻，有金舆的人，生活富裕，婚姻美满。',
        influence: '生活富裕无忧，容易得到贤妻或受女性青睐，子孙康健。',
        advice: '要珍惜婚姻和家庭，善待配偶，维护家庭和谐。',
        calculation: '甲龙乙蛇丙戊羊，丁己见猴庚犬方；辛猪壬牛癸逢虎。'
      },
      '阴阳差错': {
        name: '阴阳差错',
        type: '凶神',
        explanation: '阴阳差错主婚姻不顺，恋爱易错失良机，有二婚迹象。',
        influence: '恋爱易错失良机，婚姻不顺，有二婚迹象。',
        advice: '要慎重对待感情，多沟通理解，避免因误解而分离。',
        calculation: '丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥。'
      },
      '太极贵人': {
        name: '太极贵人',
        type: '吉神',
        explanation: '太极贵人主地位崇高，于事业、学术方面有卓越成就。',
        influence: '地位崇高，于事业、学术方面有卓越成就，且能独树一帜，受人景仰。',
        advice: '要充分发挥才能，在专业领域深耕，建立权威地位。',
        calculation: '甲乙生人子午中，丙丁鸡兔定亨通；戊己两干临四季，庚辛寅亥禄丰隆；壬癸巳申偏喜美。'
      },
      '披麻': {
        name: '披麻',
        type: '凶神',
        explanation: '披麻主丧事和悲伤，有披麻的人，容易遭遇丧事和悲伤。',
        influence: '容易遭遇丧事和悲伤，需要注意避免丧事和悲伤。',
        advice: '要保持乐观心态，多参加积极向上的活动，避免过度悲伤。',
        calculation: '子见酉，丑见戌，寅见亥，卯见子，辰见丑，巳见寅，午见卯，未见辰，申见巳，酉见午，戌见未，亥见申。'
      },
      '十恶大败': {
        name: '十恶大败',
        type: '凶神',
        explanation: '十恶大败主败家和灾祸，有十恶大败的人，容易败家和遭遇灾祸。',
        influence: '有败家迹象，容易败家和遭遇灾祸，需要注意避免败家和灾祸。',
        advice: '要谨慎理财，避免投机冒险，稳健经营，积累财富。',
        calculation: '甲辰乙巳与壬申，丙申丁亥及庚辰，戊戌癸亥加辛巳，己丑都来十位神。'
      },
      '国印贵人': {
        name: '国印贵人',
        type: '吉神',
        explanation: '国印贵人主权力和地位，有国印贵人的人，有掌权之能。',
        influence: '有掌权之能，可在政府机关执掌实权。',
        advice: '要善用权力，为民服务，建立良好的政治声誉。',
        calculation: '甲见戌，乙见亥，丙见丑，丁见寅，戊见丑，己见寅，庚见辰，辛见巳，壬见未，癸见申。'
      },
      '吊客': {
        name: '吊客',
        type: '凶神',
        explanation: '吊客主丧事和悲伤，有吊客的人，容易遭遇丧事和悲伤。',
        influence: '容易遭遇丧事和悲伤，需要注意避免丧事和悲伤。',
        advice: '要保持积极心态，多关心家人健康，注意安全防护。',
        calculation: '子见戌，丑见亥，寅见子，卯见丑，辰见寅，巳见卯，午见辰，未见巳，申见午，酉见未，戌见申，亥见酉。'
      },
      '学堂词馆': {
        name: '学堂词馆',
        type: '吉神',
        explanation: '学堂词馆主学业和功名，有学堂词馆的人，学业好，容易取得功名。',
        influence: '学业大展宏图，登科及第，适合从事学术研究工作。',
        advice: '要努力学习，追求学术成就，发挥文学才华。',
        calculation: '甲见卯乙见辰，丙戊见巳丁己见午，庚见申辛见酉，壬见亥癸见子。'
      },
      '元辰': {
        name: '元辰',
        type: '凶神',
        explanation: '元辰(大耗)主消耗和损失，有元辰的人，容易遭遇消耗和损失。',
        influence: '容易遭遇消耗和损失，财运不佳，或见无妄之灾，官司、牢狱之灾。',
        advice: '要谨慎理财，避免投机冒险，注意法律风险。',
        calculation: '子年大耗在未，丑年大耗在申，寅年大耗在酉，卯年大耗在戌，辰年大耗在亥，巳年大耗在子。'
      },
      '孤鸾煞': {
        name: '孤鸾煞',
        type: '凶神',
        explanation: '孤鸾煞主婚姻不顺，有孤鸾煞的人，夫妻感情不好，婚姻不顺。',
        influence: '夫妻感情不好，婚姻不顺，需要注意婚姻问题。',
        advice: '要重视婚姻经营，多沟通理解，避免过于固执己见。',
        calculation: '乙巳，丁巳，辛亥，戊申，壬寅，戊午，壬子，丙午。'
      },
      '丧门': {
        name: '丧门',
        type: '凶神',
        explanation: '丧门主丧事和悲伤，有丧门的人，容易遭遇丧事和悲伤。',
        influence: '容易遭遇丧事和悲伤，需要注意避免丧事和悲伤。',
        advice: '要保持积极心态，多关心家人健康，注意安全防护。',
        calculation: '子见寅，丑见卯，寅见辰，卯见巳，辰见午，巳见未，午见申，未见酉，申见戌，酉见亥，戌见子，亥见丑。'
      },
      '三奇贵人': {
        name: '三奇贵人',
        type: '吉神',
        explanation: '三奇贵人主精神异常，襟怀卓越，好奇尚大，博学多能。',
        influence: '精神异常，襟怀卓越，好奇尚大，博学多能，乃世界之"奇人"。',
        advice: '要发挥特殊才能，在专业领域有所建树，成为行业专家。',
        calculation: '天上三奇乙丙丁；地下三奇甲戊庚；人中三奇壬癸辛。'
      },
      '福星贵人': {
        name: '福星贵人',
        type: '吉神',
        explanation: '福星贵人主福气和平安，有福星贵人的人，一生禄禄无缺。',
        influence: '一生禄禄无缺，多福多寿，金玉满堂，平安福气。',
        advice: '要珍惜福气，多行善事，回报社会，积累功德。',
        calculation: '甲丙寅子乙癸卯丑，戊申己未丁亥庚午辛巳壬辰是。'
      },
      '四废': {
        name: '四废',
        type: '凶神',
        explanation: '四废主身弱多病，做事无成，有始无终。',
        influence: '身弱多病，做事无成，有始无终，需要注意健康和事业问题。',
        advice: '要注重身体健康，坚持锻炼，做事要有恒心和毅力。',
        calculation: '春庚申，辛酉，夏壬子，癸亥，秋甲寅，乙卯，冬丙午，丁巳。'
      },
      '德秀贵人': {
        name: '德秀贵人',
        type: '吉神',
        explanation: '德秀贵人主内涵充实，精神爽朗，仪表清奇，才华出众。',
        influence: '内涵充实，精神爽朗，仪表清奇，才华出众，能逢凶化吉。',
        advice: '要培养内在修养，发挥才华，保持精神状态良好。',
        calculation: '寅午戌月，丙丁为德，戊癸为秀。申子辰月，壬癸戊己为德，丙辛甲己为秀。'
      },
      '天罗地网': {
        name: '天罗地网',
        type: '凶神',
        explanation: '天罗地网主牢狱和疾病，有天罗地网的人，容易遭遇牢狱和疾病。',
        influence: '容易遭遇牢狱和疾病，需要注意避免牢狱和疾病。',
        advice: '要遵纪守法，注意身体健康，避免违法行为。',
        calculation: '戌亥为天罗，辰巳为地网。火命见戌亥为天罗，水土命见辰巳为地网。'
      },
      '驿马': {
        name: '驿马',
        type: '吉神',
        explanation: '驿马主动态和变动，有驿马的人，行动力强，喜欢变动和旅行。',
        influence: '行动力强，喜欢变动和旅行，适合从事与交通、旅游、物流等相关的工作。',
        advice: '要善用行动力，把握机遇，但也要注意稳定发展。',
        calculation: '申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳。'
      },
      '亡神': {
        name: '亡神',
        type: '凶神',
        explanation: '亡神主失去和死亡，容易失去重要的东西。',
        influence: '容易失去重要的东西，事业发展不顺，需要注意保护重要的东西。',
        advice: '要珍惜拥有的一切，做好风险防范，避免重大损失。',
        calculation: '申子辰见亥；寅午戌见已；已酉丑见申；亥卯未见寅。'
      }
    };

    return shenShaData[shenSha] || null;
  }

  /**
   * 获取神煞建议
   * @param shenSha 神煞名称
   * @returns 神煞建议
   */
  static getShenShaAdvice(shenSha: string): string {
    const info = this.getShenShaInfo(shenSha);
    return info ? info.advice : '建议根据具体情况进行分析。';
  }

  /**
   * 分析神煞组合
   * @param shenShaList 神煞列表
   * @returns 组合分析
   */
  static analyzeShenShaCombination(shenShaList: string[]): ShenShaCombinationAnalysis {
    let jiShenCount = 0;
    let xiongShenCount = 0;
    let jiXiongShenCount = 0;
    const keyPoints: string[] = [];

    // 统计各类神煞
    shenShaList.forEach(shenSha => {
      const info = this.getShenShaInfo(shenSha);
      if (info) {
        switch (info.type) {
          case '吉神':
            jiShenCount++;
            break;
          case '凶神':
            xiongShenCount++;
            break;
          case '吉凶神':
            jiXiongShenCount++;
            break;
        }
      }
    });

    // 分析关键神煞
    if (shenShaList.includes('天乙贵人')) {
      keyPoints.push('有天乙贵人相助，遇困难时容易得到帮助');
    }
    if (shenShaList.includes('羊刃')) {
      keyPoints.push('有羊刃，性格刚烈，需要制化');
    }
    if (shenShaList.includes('桃花')) {
      keyPoints.push('有桃花，异性缘佳，但需注意感情纠纷');
    }
    if (shenShaList.includes('华盖')) {
      keyPoints.push('有华盖，有艺术天赋，但性格孤僻');
    }

    // 综合评价
    let overallInfluence = '';
    let advice = '';

    const totalScore = jiShenCount * 2 + jiXiongShenCount - xiongShenCount;
    
    if (totalScore >= 3) {
      overallInfluence = '神煞配置较好，整体偏吉';
      advice = '要充分发挥吉神的作用，注意化解凶神的不利影响。';
    } else if (totalScore >= 0) {
      overallInfluence = '神煞配置平衡，吉凶参半';
      advice = '要平衡发展，既要发挥优势，也要注意防范风险。';
    } else {
      overallInfluence = '神煞配置偏弱，需要注意化解';
      advice = '要特别注意化解凶神的影响，多行善事，积累功德。';
    }

    return {
      totalShenSha: shenShaList.length,
      jiShenCount,
      xiongShenCount,
      jiXiongShenCount,
      overallInfluence,
      keyPoints,
      advice
    };
  }

  /**
   * 获取神煞类型
   * @param shenSha 神煞名称
   * @returns 神煞类型
   */
  static getShenShaType(shenSha: string): string {
    const info = this.getShenShaInfo(shenSha);
    return info ? info.type : '未知';
  }

  /**
   * 获取所有支持的神煞列表
   * @returns 神煞列表
   */
  static getAllSupportedShenSha(): string[] {
    return [
      '天乙贵人', '羊刃', '桃花', '华盖', '文昌', '禄神', '将星',
      '孤辰', '寡宿', '天德', '月德', '天医', '红艳', '天罗',
      '地网', '天空', '地劫', '天刑', '天哭', '天虚', '咸池',
      '亡神', '劫煞', '灾煞', '驿马', '天喜', '红鸾', '天狗',
      '吊客', '丧门', '披麻', '元辰', '空亡', '十恶大败',
      '金神', '魁罡贵人', '金舆', '阴阳差错', '太极贵人',
      '国印贵人', '学堂词馆', '孤鸾煞', '三奇贵人', '福星贵人',
      '四废', '德秀贵人', '天罗地网'
    ];
  }

  /**
   * 检查神煞是否为重要神煞
   * @param shenSha 神煞名称
   * @returns 是否为重要神煞
   */
  static isImportantShenSha(shenSha: string): boolean {
    const importantShenSha = [
      '天乙贵人', '羊刃', '桃花', '华盖', '文昌', '禄神',
      '将星', '天德', '月德', '孤辰', '寡宿', '魁罡贵人',
      '太极贵人', '国印贵人', '三奇贵人', '福星贵人', '德秀贵人'
    ];
    return importantShenSha.includes(shenSha);
  }

  /**
   * 获取神煞的影响强度
   * @param shenSha 神煞名称
   * @returns 影响强度（1-10）
   */
  static getShenShaStrength(shenSha: string): number {
    const strengthMap: { [key: string]: number } = {
      '天乙贵人': 9,
      '羊刃': 8,
      '桃花': 7,
      '华盖': 6,
      '文昌': 7,
      '禄神': 8,
      '将星': 7,
      '天德': 9,
      '月德': 8,
      '孤辰': 6,
      '寡宿': 6,
      '魁罡贵人': 8,
      '太极贵人': 8,
      '国印贵人': 7,
      '三奇贵人': 8,
      '福星贵人': 7,
      '德秀贵人': 7,
      '金舆': 6,
      '学堂词馆': 6,
      '天医': 6,
      '空亡': 5,
      '十恶大败': 7,
      '阴阳差错': 6,
      '孤鸾煞': 6,
      '四废': 5,
      '天罗地网': 6
    };
    return strengthMap[shenSha] || 5;
  }

  /**
   * 获取神煞组合分析（兼容旧接口）
   * @param shenShaList 神煞列表
   * @returns 神煞组合分析数组
   */
  static getShenShaCombinationAnalysis(shenShaList: string[]): Array<{
    combination: string;
    level: number;
    type: string;
    description: string;
    analysis: string;
    source?: string;
    influence?: string;
  }> {
    const combinations: Array<{
      combination: string;
      level: number;
      type: string;
      description: string;
      analysis: string;
      source?: string;
      influence?: string;
    }> = [];

    // 检查重要的神煞组合
    if (shenShaList.includes('天乙贵人') && shenShaList.includes('文昌')) {
      combinations.push({
        combination: '天乙贵人+文昌',
        level: 4,
        type: 'good',
        description: '贵人相助，文昌加持，学业事业双丰收',
        analysis: '天乙贵人主贵人相助，文昌主文学才华，两者结合形成极佳的学业事业运势。',
        source: '古籍记载：天乙文昌同现，主文贵双全',
        influence: '学业有成，事业顺利，容易得到权威人士的赏识和提拔'
      });
    }

    if (shenShaList.includes('羊刃') && shenShaList.includes('将星')) {
      combinations.push({
        combination: '羊刃+将星',
        level: 3,
        type: 'good',
        description: '刚毅果断，有领导才能，但需控制脾气',
        analysis: '羊刃主刚烈果断，将星主统御能力，两者结合形成强势的领导格局。',
        source: '命理典籍：羊刃将星，威权显赫',
        influence: '具有强烈的领导欲望和能力，但需要注意控制脾气，避免过于专断'
      });
    }

    if (shenShaList.includes('桃花') && shenShaList.includes('华盖')) {
      combinations.push({
        combination: '桃花+华盖',
        level: 3,
        type: 'mixed',
        description: '艺术天赋突出，但感情复杂，性格孤僻',
        analysis: '桃花主异性缘和艺术才华，华盖主孤独和超凡脱俗，形成矛盾的性格特征。',
        source: '命理古书：桃花华盖，艺术超群而情感孤独',
        influence: '在艺术领域容易有突出成就，但感情生活复杂，容易感到孤独'
      });
    }

    if (shenShaList.includes('孤辰') && shenShaList.includes('寡宿')) {
      combinations.push({
        combination: '孤辰+寡宿',
        level: 2,
        type: 'bad',
        description: '容易孤独，人际关系不佳，需要主动社交',
        analysis: '孤辰寡宿同现，主孤独之象，人际关系较为困难。',
        source: '古籍云：孤辰寡宿，六亲无靠',
        influence: '容易感到孤独，人际关系不佳，需要主动改善社交能力'
      });
    }

    return combinations;
  }

  /**
   * 获取神煞详细解释（兼容旧接口）
   * @param shenSha 神煞名称
   * @returns 神煞详细解释
   */
  static getShenShaExplanation(shenSha: string): {
    name: string;
    type: string;
    description: string;
    detailDescription: string;
    calculation?: string;
    influence?: string[];
  } | null {
    const info = this.getShenShaInfo(shenSha);
    if (!info) return null;

    return {
      name: info.name,
      type: info.type,
      description: info.explanation,
      detailDescription: info.influence,
      calculation: info.calculation,
      influence: [info.advice]
    };
  }
}
