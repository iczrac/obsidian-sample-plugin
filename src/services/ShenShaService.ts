/**
 * 神煞服务类
 * 提供神煞的详细解释和组合分析
 */
export class ShenShaService {
  /**
   * 获取神煞的详细解释
   * @param shenSha 神煞名称
   * @returns 神煞的详细解释
   */
  public static getShenShaExplanation(shenSha: string): { name: string; type: string; explanation: string; influence: string } {
    const explanations: { [key: string]: { name: string; type: string; explanation: string; influence: string } } = {
      '天乙贵人': {
        name: '天乙贵人',
        type: '吉神',
        explanation: '天乙贵人是最大的吉神，主贵人扶持，逢凶化吉，遇难呈祥。',
        influence: '有天乙贵人的人，一生得贵人相助，逢凶化吉，遇难呈祥，能够化解灾难，增加福气。'
      },
      '文昌': {
        name: '文昌',
        type: '吉神',
        explanation: '文昌星主文章秀丽，学业有成，利于考试、文职工作。',
        influence: '有文昌星的人，聪明好学，文思敏捷，利于学业、文职工作，容易在考试中取得好成绩。'
      },
      '华盖': {
        name: '华盖',
        type: '吉凶神',
        explanation: '华盖星主清高孤傲，有才华但不善交际，利于宗教、艺术、学术研究。',
        influence: '有华盖星的人，清高孤傲，有才华但不善交际，适合从事宗教、艺术、学术研究等工作，但容易孤独。'
      },
      '禄神': {
        name: '禄神',
        type: '吉神',
        explanation: '禄神主财禄丰厚，事业有成，官运亨通。',
        influence: '有禄神的人，财运好，事业有成，官运亨通，容易获得财富和地位。'
      },
      '桃花': {
        name: '桃花',
        type: '吉凶神',
        explanation: '桃花星主感情丰富，异性缘好，但也容易因感情而烦恼。',
        influence: '有桃花星的人，异性缘好，感情丰富，但也容易因感情而烦恼，需要注意感情问题。'
      },
      '孤辰': {
        name: '孤辰',
        type: '凶神',
        explanation: '孤辰主孤独，人际关系不佳，容易孤立无援。',
        influence: '有孤辰的人，容易孤独，人际关系不佳，容易孤立无援，需要注意人际关系的经营。'
      },
      '寡宿': {
        name: '寡宿',
        type: '凶神',
        explanation: '寡宿主孤独，婚姻不顺，容易丧偶或离异。',
        influence: '有寡宿的人，容易孤独，婚姻不顺，容易丧偶或离异，需要注意婚姻问题。'
      },
      '驿马': {
        name: '驿马',
        type: '吉神',
        explanation: '驿马主行动、变动、旅行，利于事业发展和变动。',
        influence: '有驿马的人，行动力强，适合经商、旅行、变动，事业发展顺利，但也容易漂泊不定。'
      },
      '将星': {
        name: '将星',
        type: '吉神',
        explanation: '将星主权威、领导、决策能力强，利于事业发展和领导工作。',
        influence: '有将星的人，权威、领导、决策能力强，适合从事领导工作，事业发展顺利，但也容易独断专行。'
      },
      '金神': {
        name: '金神',
        type: '吉神',
        explanation: '金神主财富和金钱，利于财运和事业发展。',
        influence: '有金神的人，财运好，容易获得财富，事业发展顺利，但也容易因财而烦恼。'
      },
      '天德': {
        name: '天德',
        type: '吉神',
        explanation: '天德主德行和善良，利于人际关系和事业发展。',
        influence: '有天德的人，德行好，善良，人际关系好，事业发展顺利，容易得到他人的帮助。'
      },
      '天德合': {
        name: '天德合',
        type: '吉神',
        explanation: '天德合是天德的配偶，主和谐与合作，利于婚姻和合作关系。',
        influence: '有天德合的人，婚姻和合作关系好，容易得到配偶和合作伙伴的帮助，事业发展顺利。'
      },
      '月德': {
        name: '月德',
        type: '吉神',
        explanation: '月德主温柔和善良，利于人际关系和婚姻。',
        influence: '有月德的人，温柔善良，人际关系好，婚姻美满，容易得到他人的帮助。'
      },
      '天医': {
        name: '天医',
        type: '吉神',
        explanation: '天医主健康和医疗，利于健康和医疗工作。',
        influence: '有天医的人，健康好，适合从事医疗工作，容易得到医疗方面的帮助。'
      },
      '天喜': {
        name: '天喜',
        type: '吉神',
        explanation: '天喜主喜庆和婚姻，利于婚姻和喜事。',
        influence: '有天喜的人，婚姻美满，容易有喜事，人生充满欢乐。'
      },
      '红艳': {
        name: '红艳',
        type: '吉凶神',
        explanation: '红艳主艳遇和桃花运，利于感情但也容易因感情而烦恼。',
        influence: '有红艳的人，异性缘好，感情丰富，但也容易因感情而烦恼，需要注意感情问题。'
      },
      '天罗': {
        name: '天罗',
        type: '凶神',
        explanation: '天罗主困境和阻碍，容易陷入困境和阻碍。',
        influence: '有天罗的人，容易陷入困境和阻碍，事业发展不顺，需要注意避免陷入困境。'
      },
      '地网': {
        name: '地网',
        type: '凶神',
        explanation: '地网主陷阱和困境，容易陷入陷阱和困境。',
        influence: '有地网的人，容易陷入陷阱和困境，事业发展不顺，需要注意避免陷入陷阱。'
      },
      '羊刃': {
        name: '羊刃',
        type: '凶神',
        explanation: '羊刃主锋芒和冲动，容易因冲动而惹祸。',
        influence: '有羊刃的人，锋芒毕露，容易冲动，容易因冲动而惹祸，需要注意控制情绪。'
      },
      '天空': {
        name: '天空',
        type: '凶神',
        explanation: '天空主虚无和空虚，容易感到空虚和无所依靠。',
        influence: '有天空的人，容易感到空虚和无所依靠，事业发展不顺，需要注意寻找精神寄托。'
      },
      '地劫': {
        name: '地劫',
        type: '凶神',
        explanation: '地劫主劫难和灾祸，容易遭遇劫难和灾祸。',
        influence: '有地劫的人，容易遭遇劫难和灾祸，事业发展不顺，需要注意避免灾祸。'
      },
      '天刑': {
        name: '天刑',
        type: '凶神',
        explanation: '天刑主刑罚和伤害，容易遭受刑罚和伤害。',
        influence: '有天刑的人，容易遭受刑罚和伤害，事业发展不顺，需要注意避免刑罚和伤害。'
      },
      '天哭': {
        name: '天哭',
        type: '凶神',
        explanation: '天哭主悲伤和哭泣，容易因悲伤而哭泣。',
        influence: '有天哭的人，容易悲伤和哭泣，情绪不稳定，需要注意调节情绪。'
      },
      '天虚': {
        name: '天虚',
        type: '凶神',
        explanation: '天虚主虚弱和疾病，容易身体虚弱和生病。',
        influence: '有天虚的人，容易身体虚弱和生病，需要注意保养身体。'
      },
      '咸池': {
        name: '咸池',
        type: '吉凶神',
        explanation: '咸池主感情和艺术，利于艺术创作但也容易因感情而烦恼。',
        influence: '有咸池的人，感情丰富，艺术天赋好，适合从事艺术工作，但也容易因感情而烦恼。'
      },
      '亡神': {
        name: '亡神',
        type: '凶神',
        explanation: '亡神主失去和死亡，容易失去重要的东西。',
        influence: '有亡神的人，容易失去重要的东西，事业发展不顺，需要注意保护重要的东西。'
      },
      '劫煞': {
        name: '劫煞',
        type: '凶神',
        explanation: '劫煞主劫难和灾祸，容易遭遇劫难和灾祸。',
        influence: '有劫煞的人，容易遭遇劫难和灾祸，事业发展不顺，需要注意避免灾祸。'
      },
      '灾煞': {
        name: '灾煞',
        type: '凶神',
        explanation: '灾煞主灾难和祸害，容易遭遇灾难和祸害。',
        influence: '有灾煞的人，容易遭遇灾难和祸害，事业发展不顺，需要注意避免灾难和祸害。'
      },
      '岁破': {
        name: '岁破',
        type: '凶神',
        explanation: '岁破主破坏和损失，容易遭遇破坏和损失。',
        influence: '有岁破的人，容易遭遇破坏和损失，事业发展不顺，需要注意避免破坏和损失。'
      },
      '大耗': {
        name: '大耗',
        type: '凶神',
        explanation: '大耗主消耗和损失，容易遭遇消耗和损失。',
        influence: '有大耗的人，容易遭遇消耗和损失，财运不佳，需要注意节约和保护财产。'
      },
      '五鬼': {
        name: '五鬼',
        type: '凶神',
        explanation: '五鬼主邪祟和灾祸，容易遭遇邪祟和灾祸。',
        influence: '有五鬼的人，容易遭遇邪祟和灾祸，事业发展不顺，需要注意避免邪祟和灾祸。'
      },
      '天德贵人': {
        name: '天德贵人',
        type: '吉神',
        explanation: '天德贵人是天德与贵人的结合，主德行高尚，得贵人相助，逢凶化吉。',
        influence: '有天德贵人的人，德行高尚，得贵人相助，逢凶化吉，能够化解灾难，增加福气。'
      },
      '月德贵人': {
        name: '月德贵人',
        type: '吉神',
        explanation: '月德贵人是月德与贵人的结合，主温柔善良，得贵人相助，逢凶化吉。',
        influence: '有月德贵人的人，温柔善良，得贵人相助，逢凶化吉，能够化解灾难，增加福气。'
      },
      '天赦': {
        name: '天赦',
        type: '吉神',
        explanation: '天赦主赦免和宽恕，能够赦免罪过，化解灾难。',
        influence: '有天赦的人，能够得到赦免和宽恕，化解灾难，增加福气，适合从事法律、宗教等工作。'
      },
      '天恩': {
        name: '天恩',
        type: '吉神',
        explanation: '天恩主恩惠和恩典，能够得到上天的恩惠和恩典。',
        influence: '有天恩的人，能够得到上天的恩惠和恩典，事业发展顺利，容易得到他人的帮助。'
      },
      '天官': {
        name: '天官',
        type: '吉神',
        explanation: '天官主官运亨通，能够得到官职和地位。',
        influence: '有天官的人，官运亨通，能够得到官职和地位，事业发展顺利，适合从事政府、行政等工作。'
      },
      '天福': {
        name: '天福',
        type: '吉神',
        explanation: '天福主福气和福运，能够得到福气和福运。',
        influence: '有天福的人，福气和福运好，事业发展顺利，容易得到他人的帮助，生活幸福美满。'
      },
      '天厨': {
        name: '天厨',
        type: '吉神',
        explanation: '天厨主饮食丰富，能够得到丰富的饮食和物质享受。',
        influence: '有天厨的人，饮食丰富，物质享受好，生活幸福美满，适合从事餐饮、烹饪等工作。'
      },
      '天巫': {
        name: '天巫',
        type: '吉凶神',
        explanation: '天巫主神秘和灵异，能够感知神秘和灵异的事物。',
        influence: '有天巫的人，神秘和灵异感知能力强，适合从事宗教、占卜、心理等工作，但也容易陷入迷信和幻想。'
      },
      '天月': {
        name: '天月',
        type: '吉神',
        explanation: '天月主温柔和善良，能够得到月亮的庇护和温柔。',
        influence: '有天月的人，温柔善良，人际关系好，婚姻美满，适合从事艺术、文学等工作。'
      },
      '天马': {
        name: '天马',
        type: '吉神',
        explanation: '天马主行动和变动，能够得到行动和变动的机会。',
        influence: '有天马的人，行动力强，适合经商、旅行、变动，事业发展顺利，但也容易漂泊不定。'
      }
    };

    return explanations[shenSha] || {
      name: shenSha,
      type: '未知',
      explanation: '暂无解释',
      influence: '暂无影响'
    };
  }

  /**
   * 获取神煞组合的分析
   * @param shenShaList 神煞列表
   * @returns 神煞组合的分析
   */
  public static getShenShaCombinationAnalysis(shenShaList: string[]): { combination: string; analysis: string }[] {
    const combinations: { combination: string; analysis: string }[] = [];

    // 天乙贵人 + 文昌
    if (shenShaList.includes('天乙贵人') && shenShaList.includes('文昌')) {
      combinations.push({
        combination: '天乙贵人 + 文昌',
        analysis: '天乙贵人与文昌同时出现，主学业有成，仕途顺利，文职工作发展良好，容易得到贵人相助，学业和事业双丰收。'
      });
    }

    // 天乙贵人 + 禄神
    if (shenShaList.includes('天乙贵人') && shenShaList.includes('禄神')) {
      combinations.push({
        combination: '天乙贵人 + 禄神',
        analysis: '天乙贵人与禄神同时出现，主财运亨通，官运亨通，事业有成，容易得到贵人相助，财富和地位双丰收。'
      });
    }

    // 天乙贵人 + 驿马
    if (shenShaList.includes('天乙贵人') && shenShaList.includes('驿马')) {
      combinations.push({
        combination: '天乙贵人 + 驿马',
        analysis: '天乙贵人与驿马同时出现，主行动顺利，事业发展顺利，容易得到贵人相助，适合经商、旅行、变动，事业发展顺利。'
      });
    }

    // 文昌 + 华盖
    if (shenShaList.includes('文昌') && shenShaList.includes('华盖')) {
      combinations.push({
        combination: '文昌 + 华盖',
        analysis: '文昌与华盖同时出现，主学术研究有成，适合从事学术、艺术、宗教等工作，有才华但不善交际，需要注意人际关系。'
      });
    }

    // 桃花 + 红艳
    if (shenShaList.includes('桃花') && shenShaList.includes('红艳')) {
      combinations.push({
        combination: '桃花 + 红艳',
        analysis: '桃花与红艳同时出现，主感情丰富，异性缘好，但也容易因感情而烦恼，需要注意感情问题，避免因感情而影响事业和生活。'
      });
    }

    // 天罗 + 地网
    if (shenShaList.includes('天罗') && shenShaList.includes('地网')) {
      combinations.push({
        combination: '天罗 + 地网',
        analysis: '天罗与地网同时出现，主困境重重，容易陷入困境和陷阱，事业发展不顺，需要注意避免陷入困境和陷阱，谨慎行事。'
      });
    }

    // 羊刃 + 劫煞
    if (shenShaList.includes('羊刃') && shenShaList.includes('劫煞')) {
      combinations.push({
        combination: '羊刃 + 劫煞',
        analysis: '羊刃与劫煞同时出现，主冲动易怒，容易因冲动而惹祸，容易遭遇劫难和灾祸，需要注意控制情绪，避免冲动行事。'
      });
    }

    // 天德 + 月德
    if (shenShaList.includes('天德') && shenShaList.includes('月德')) {
      combinations.push({
        combination: '天德 + 月德',
        analysis: '天德与月德同时出现，主德行好，善良，人际关系好，婚姻美满，容易得到他人的帮助，事业发展顺利。'
      });
    }

    // 天医 + 天喜
    if (shenShaList.includes('天医') && shenShaList.includes('天喜')) {
      combinations.push({
        combination: '天医 + 天喜',
        analysis: '天医与天喜同时出现，主健康好，婚姻美满，容易有喜事，适合从事医疗工作，人生充满欢乐。'
      });
    }

    // 孤辰 + 寡宿
    if (shenShaList.includes('孤辰') && shenShaList.includes('寡宿')) {
      combinations.push({
        combination: '孤辰 + 寡宿',
        analysis: '孤辰与寡宿同时出现，主孤独，人际关系不佳，婚姻不顺，容易孤立无援，需要注意人际关系和婚姻问题。'
      });
    }

    // 天德贵人 + 月德贵人
    if (shenShaList.includes('天德贵人') && shenShaList.includes('月德贵人')) {
      combinations.push({
        combination: '天德贵人 + 月德贵人',
        analysis: '天德贵人与月德贵人同时出现，主德行高尚，温柔善良，得贵人相助，逢凶化吉，能够化解灾难，增加福气，人际关系好，婚姻美满。'
      });
    }

    // 天德贵人 + 天乙贵人
    if (shenShaList.includes('天德贵人') && shenShaList.includes('天乙贵人')) {
      combinations.push({
        combination: '天德贵人 + 天乙贵人',
        analysis: '天德贵人与天乙贵人同时出现，主德行高尚，得贵人相助，逢凶化吉，能够化解灾难，增加福气，事业发展顺利，容易得到他人的帮助。'
      });
    }

    // 天赦 + 天恩
    if (shenShaList.includes('天赦') && shenShaList.includes('天恩')) {
      combinations.push({
        combination: '天赦 + 天恩',
        analysis: '天赦与天恩同时出现，主赦免和宽恕，恩惠和恩典，能够赦免罪过，化解灾难，得到上天的恩惠和恩典，事业发展顺利，容易得到他人的帮助。'
      });
    }

    // 天官 + 天福
    if (shenShaList.includes('天官') && shenShaList.includes('天福')) {
      combinations.push({
        combination: '天官 + 天福',
        analysis: '天官与天福同时出现，主官运亨通，福气和福运好，能够得到官职和地位，事业发展顺利，容易得到他人的帮助，生活幸福美满。'
      });
    }

    // 天厨 + 天月
    if (shenShaList.includes('天厨') && shenShaList.includes('天月')) {
      combinations.push({
        combination: '天厨 + 天月',
        analysis: '天厨与天月同时出现，主饮食丰富，温柔善良，能够得到丰富的饮食和物质享受，人际关系好，婚姻美满，生活幸福美满。'
      });
    }

    // 天巫 + 天月
    if (shenShaList.includes('天巫') && shenShaList.includes('天月')) {
      combinations.push({
        combination: '天巫 + 天月',
        analysis: '天巫与天月同时出现，主神秘和灵异，温柔善良，能够感知神秘和灵异的事物，人际关系好，婚姻美满，适合从事宗教、占卜、心理等工作。'
      });
    }

    // 天马 + 驿马
    if (shenShaList.includes('天马') && shenShaList.includes('驿马')) {
      combinations.push({
        combination: '天马 + 驿马',
        analysis: '天马与驿马同时出现，主行动和变动，能够得到行动和变动的机会，行动力强，适合经商、旅行、变动，事业发展顺利，但也容易漂泊不定。'
      });
    }

    // 天空 + 地劫
    if (shenShaList.includes('天空') && shenShaList.includes('地劫')) {
      combinations.push({
        combination: '天空 + 地劫',
        analysis: '天空与地劫同时出现，主虚无和空虚，劫难和灾祸，容易感到空虚和无所依靠，容易遭遇劫难和灾祸，事业发展不顺，需要注意寻找精神寄托和避免灾祸。'
      });
    }

    // 天刑 + 天哭
    if (shenShaList.includes('天刑') && shenShaList.includes('天哭')) {
      combinations.push({
        combination: '天刑 + 天哭',
        analysis: '天刑与天哭同时出现，主刑罚和伤害，悲伤和哭泣，容易遭受刑罚和伤害，容易悲伤和哭泣，事业发展不顺，需要注意避免刑罚和伤害，调节情绪。'
      });
    }

    return combinations;
  }
}
