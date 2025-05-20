/**
 * 格局服务类
 * 提供格局的详细解释和分析
 */
export class GeJuService {
  /**
   * 获取格局的详细信息
   * @param geJu 格局名称
   * @returns 格局的详细信息
   */
  public static getGeJuInfo(geJu: string): {
    name: string;
    explanation: string;
    influence: string;
    career: string;
    health: string;
    relationship: string;
    wealth: string;
    type: 'good' | 'bad' | 'neutral' | 'mixed';
    source?: string;
  } | null {
    const explanations: {
      [key: string]: {
        name: string;
        explanation: string;
        influence: string;
        career: string;
        health: string;
        relationship: string;
        wealth: string;
        type: 'good' | 'bad' | 'neutral' | 'mixed';
        source?: string;
      }
    } = {
      '正印格': {
        name: '正印格',
        explanation: '正印格是指八字中正印星当令或有力，且日主偏弱，取正印为用神的格局。正印代表母亲、学业、文凭、贵人、智慧等。',
        influence: '正印格的人通常聪明好学，性格温和，有文化修养，得长辈提携，适合从事文化、教育、行政等工作。',
        career: '适合从事教育、文化、行政、公务员、医生、律师等需要专业知识和文凭的工作。',
        health: '体质较弱，容易有肺部、呼吸系统疾病，应注意保养。',
        relationship: '与长辈关系良好，得到长辈提携，但可能对子女过于严格。',
        wealth: '财运稳定，但不会大富大贵，适合稳定收入的工作。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '偏印格': {
        name: '偏印格',
        explanation: '偏印格是指八字中偏印星当令或有力，且日主偏弱，取偏印为用神的格局。偏印代表智慧、学术、文艺、灵感等。',
        influence: '偏印格的人通常聪明灵秀，有文艺天赋，思维活跃，但性格较为孤傲，不善交际。',
        career: '适合从事文学、艺术、设计、研究、宗教等需要创造力和灵感的工作。',
        health: '体质较弱，容易有神经系统、精神方面的问题，应注意调节情绪。',
        relationship: '人际关系较为淡薄，不善交际，但有忠实的朋友。',
        wealth: '财运不稳定，但可能在特定领域有所成就。',
        type: 'neutral',
        source: '《渊海子平》、《三命通会》'
      },
      '正官格': {
        name: '正官格',
        explanation: '正官格是指八字中正官星当令或有力，且日主旺盛，取正官为用神的格局。正官代表权威、规矩、纪律、职位等。',
        influence: '正官格的人通常正直守规，有责任感，做事有条理，适合从事行政、管理等工作。',
        career: '适合从事政府机关、军警、司法、行政管理等需要权威和规范的工作。',
        health: '体质较好，但容易有肝胆方面的问题，应注意调节情绪。',
        relationship: '家庭关系和谐，尊重长辈，但可能对子女要求严格。',
        wealth: '财运稳定，通过正当途径获取财富，适合稳定收入的工作。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '七杀格': {
        name: '七杀格',
        explanation: '七杀格是指八字中七杀星当令或有力，且日主旺盛，取七杀为用神的格局。七杀代表权力、竞争、决断、勇气等。',
        influence: '七杀格的人通常性格刚强，有决断力，敢于竞争，但可能过于强势，不善沟通。',
        career: '适合从事军警、竞技、体育、销售、创业等需要竞争和决断的工作。',
        health: '体质较好，但容易有肝胆方面的问题，应注意调节情绪。',
        relationship: '人际关系较为复杂，容易与人发生冲突，但也有忠实的追随者。',
        wealth: '财运波动较大，可能通过竞争获取财富，但也可能因冲动而失财。',
        type: 'mixed',
        source: '《渊海子平》、《三命通会》'
      },
      '正财格': {
        name: '正财格',
        explanation: '正财格是指八字中正财星当令或有力，且日主旺盛，取正财为用神的格局。正财代表财富、物质、享受等。',
        influence: '正财格的人通常重视物质享受，善于理财，做事稳重，适合从事商业、金融等工作。',
        career: '适合从事商业、金融、会计、房地产等与财富相关的工作。',
        health: '体质较好，但容易有消化系统问题，应注意饮食规律。',
        relationship: '家庭关系和谐，善于照顾家人，但可能过于重视物质。',
        wealth: '财运良好，能够积累财富，适合经商或投资。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '偏财格': {
        name: '偏财格',
        explanation: '偏财格是指八字中偏财星当令或有力，且日主旺盛，取偏财为用神的格局。偏财代表意外之财、投机、冒险等。',
        influence: '偏财格的人通常性格活泼，善于把握机会，敢于冒险，但可能缺乏耐心和计划性。',
        career: '适合从事投资、股票、博彩、创业等需要冒险精神的工作。',
        health: '体质较好，但容易有神经系统问题，应注意调节情绪。',
        relationship: '人际关系广泛但不深入，容易结交朋友，但也容易与人发生纠纷。',
        wealth: '财运波动较大，可能有意外之财，但也可能因冲动而失财。',
        type: 'mixed',
        source: '《渊海子平》、《三命通会》'
      },
      '食神格': {
        name: '食神格',
        explanation: '食神格是指八字中食神星当令或有力，且日主旺盛，取食神为用神的格局。食神代表才艺、享受、子女、创造力等。',
        influence: '食神格的人通常性格开朗，有才艺，善于享受生活，适合从事艺术、餐饮等工作。',
        career: '适合从事艺术、餐饮、娱乐、教育、创作等需要才艺和创造力的工作。',
        health: '体质较好，但容易有消化系统问题，应注意饮食规律。',
        relationship: '人际关系良好，善于交际，与子女关系亲密。',
        wealth: '财运稳定，能够通过才艺获取财富，适合自由职业。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '伤官格': {
        name: '伤官格',
        explanation: '伤官格是指八字中伤官星当令或有力，且日主旺盛，取伤官为用神的格局。伤官代表才华、口才、创新、叛逆等。',
        influence: '伤官格的人通常聪明伶俐，有口才，善于创新，但可能过于叛逆，不守规矩。',
        career: '适合从事演讲、销售、媒体、艺术、创新等需要口才和创造力的工作。',
        health: '体质较好，但容易有神经系统问题，应注意调节情绪。',
        relationship: '人际关系复杂，容易与权威发生冲突，但也有忠实的追随者。',
        wealth: '财运波动较大，可能通过才华获取财富，但也可能因叛逆而失财。',
        type: 'mixed',
        source: '《渊海子平》、《三命通会》'
      },
      '比肩格': {
        name: '比肩格',
        explanation: '比肩格是指八字中比肩星当令或有力，且日主偏弱，取比肩为用神的格局。比肩代表兄弟、同事、竞争、合作等。',
        influence: '比肩格的人通常性格坚强，有进取心，善于合作，但可能过于强势，不善沟通。',
        career: '适合从事团队合作、管理、销售、创业等需要合作精神的工作。',
        health: '体质较好，但容易有肝胆方面的问题，应注意调节情绪。',
        relationship: '与兄弟姐妹关系密切，善于团队合作，但可能与配偶关系紧张。',
        wealth: '财运稳定，能够通过努力获取财富，适合创业或合伙经营。',
        type: 'neutral',
        source: '《渊海子平》、《三命通会》'
      },
      '劫财格': {
        name: '劫财格',
        explanation: '劫财格是指八字中劫财星当令或有力，且日主偏弱，取劫财为用神的格局。劫财代表冲动、霸气、独立、变动等。',
        influence: '劫财格的人通常性格刚强，有独立精神，敢于冒险，但可能过于冲动，不善理财。',
        career: '适合从事冒险、创业、销售、体育等需要冲劲和独立精神的工作。',
        health: '体质较好，但容易有肝胆方面的问题，应注意调节情绪。',
        relationship: '人际关系较为复杂，容易与人发生冲突，但也有忠实的追随者。',
        wealth: '财运波动较大，可能有意外之财，但也容易破财。',
        type: 'mixed',
        source: '《渊海子平》、《三命通会》'
      },
      '专旺格': {
        name: '专旺格',
        explanation: '专旺格是指日主极旺，且有多个比劫帮扶的特殊格局。此格局日主过于强势，需要泄秀之物来平衡。',
        influence: '专旺格的人通常性格刚强，有领导能力，但可能过于强势，不善沟通。',
        career: '适合从事领导、管理、创业等需要强势和决断的工作。',
        health: '体质较好，但容易有心脑血管问题，应注意调节情绪。',
        relationship: '人际关系较为复杂，容易与人发生冲突，但也有忠实的追随者。',
        wealth: '财运波动较大，可能通过领导能力获取财富，但也可能因强势而失财。',
        type: 'mixed',
        source: '《渊海子平》、《三命通会》'
      },
      '从弱格': {
        name: '从弱格',
        explanation: '从弱格是指日主极弱，且有多个官杀克制的特殊格局。此格局日主过于弱势，需要顺从官杀之气。',
        influence: '从弱格的人通常性格温和，善于顺应环境，但可能缺乏主见，容易受人影响。',
        career: '适合从事辅助、服务、行政等需要服从和配合的工作。',
        health: '体质较弱，容易有肺部、呼吸系统疾病，应注意保养。',
        relationship: '人际关系较为和谐，善于与人相处，但可能缺乏主见。',
        wealth: '财运一般，适合稳定收入的工作，不适合冒险投资。',
        type: 'neutral',
        source: '《渊海子平》、《三命通会》'
      },
      '杂气格': {
        name: '杂气格',
        explanation: '杂气格是指八字中无明显格局特征，各种五行杂而不纯的格局。此格局需要根据具体情况选择用神。',
        influence: '杂气格的人通常性格多变，适应能力强，但可能缺乏专注和方向。',
        career: '适合从事多样化、灵活性强的工作，或者需要综合能力的工作。',
        health: '体质一般，应根据具体情况注意保养。',
        relationship: '人际关系较为复杂，可能在不同场合表现出不同的性格。',
        wealth: '财运波动较大，需要根据具体情况调整理财策略。',
        type: 'neutral',
        source: '《渊海子平》、《三命通会》'
      },
      '从旺格': {
        name: '从旺格',
        explanation: '从旺格是指日主极旺，且有多个比劫帮扶，取比劫为用神的特殊格局。此格局不泄秀日主之气，而是顺从日主之旺。',
        influence: '从旺格的人通常性格刚强，有领导能力，自信心强，做事果断，但可能过于强势，不善听取他人意见。',
        career: '适合从事领导、管理、军警、体育、竞技等需要强势和决断的工作。',
        health: '体质较好，但容易有心脑血管问题，应注意调节情绪，避免过度劳累。',
        relationship: '人际关系较为复杂，容易与人发生冲突，但也有忠实的追随者。在家庭中往往是主导者。',
        wealth: '财运波动较大，可能通过领导能力获取财富，但也可能因强势而失财。',
        type: 'mixed',
        source: '《子平真诠》、《三命通会》'
      },
      '印绶格': {
        name: '印绶格',
        explanation: '印绶格是指八字中印星特别旺盛，且日主偏弱，取印星为用神的格局。印绶代表学问、文凭、贵人、智慧等。',
        influence: '印绶格的人通常聪明好学，性格温和，有文化修养，得长辈提携，适合从事文化、教育、行政等工作。',
        career: '特别适合从事教育、文化、行政、公务员、医生、律师等需要专业知识和文凭的工作。',
        health: '体质较弱，容易有肺部、呼吸系统疾病，应注意保养。',
        relationship: '与长辈关系特别良好，得到长辈提携，但可能对子女过于严格。',
        wealth: '财运稳定，但不会大富大贵，适合稳定收入的工作。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '伤官佩印格': {
        name: '伤官佩印格',
        explanation: '伤官佩印格是指八字中同时有伤官和印星，且两者力量均衡，相互制约的格局。伤官代表才华、创新，印星代表学问、文凭。',
        influence: '伤官佩印格的人通常既有创新能力，又有学术修养，聪明灵秀，有文艺天赋，思维活跃，但性格可能较为复杂。',
        career: '适合从事教育、文化、艺术、设计、研究等需要创造力和学术背景的工作。',
        health: '体质一般，容易有神经系统、精神方面的问题，应注意调节情绪。',
        relationship: '人际关系较为复杂，既有学术圈的人脉，又有艺术圈的朋友，但可能内心矛盾。',
        wealth: '财运稳定，通过才华和学识获取财富，适合知识型工作。',
        type: 'good',
        source: '《子平真诠》、《三命通会》'
      },
      '财官双美格': {
        name: '财官双美格',
        explanation: '财官双美格是指八字中财星和官星都旺盛有力，且日主适中，能够承受财官之力的格局。财星代表财富，官星代表权力。',
        influence: '财官双美格的人通常事业有成，财运亨通，既有权力又有财富，社会地位较高。',
        career: '适合从事政商两界的工作，如企业管理、金融投资、政府机关等。',
        health: '体质较好，但容易因工作压力大而出现健康问题，应注意劳逸结合。',
        relationship: '社会关系广泛，人脉丰富，但可能因忙于事业而忽略家庭。',
        wealth: '财运极佳，能够通过正当途径获取大量财富，适合创业或高管职位。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '伤官见官格': {
        name: '伤官见官格',
        explanation: '伤官见官格是指八字中同时有伤官和官星，且伤官力量较强，官星次之的格局。伤官代表才华、创新，官星代表权力、规矩。',
        influence: '伤官见官格的人通常才华横溢，但也能守规矩，既有创新能力，又有组织纪律性，适合在体制内发挥创造力。',
        career: '适合从事教育管理、文化行政、创新研发等需要创造力但又有组织架构的工作。',
        health: '体质一般，容易因工作压力大而出现健康问题，应注意调节情绪。',
        relationship: '人际关系较为复杂，可能在不同场合表现出不同的性格，既能创新又能守规矩。',
        wealth: '财运稳定，通过才华和职位获取财富，适合体制内的创新工作。',
        type: 'mixed',
        source: '《子平真诠》、《三命通会》'
      },
      '日元建禄格': {
        name: '日元建禄格',
        explanation: '日元建禄格是指日主天干与所处月令地支构成建禄关系的格局。建禄代表权力、地位、名誉。',
        influence: '日元建禄格的人通常地位显赫，名声远播，有较高的社会地位和声望。',
        career: '适合从事政府机关、军警、司法、行政管理等需要权威和声望的工作。',
        health: '体质较好，但容易因工作压力大而出现健康问题，应注意劳逸结合。',
        relationship: '社会关系良好，受人尊敬，但可能因地位高而与普通人有距离感。',
        wealth: '财运稳定，通过职位和声望获取财富，适合体制内的高级职位。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      },
      '日元建元格': {
        name: '日元建元格',
        explanation: '日元建元格是指日主天干与所处月令地支构成建元关系的格局。建元代表根基、源头、起始。',
        influence: '日元建元格的人通常根基深厚，做事踏实，有长远规划，适合从事基础性、长期性的工作。',
        career: '适合从事教育、科研、农业、基础设施等需要长期积累和深厚根基的工作。',
        health: '体质较好，生命力强，但应注意保持规律的生活习惯。',
        relationship: '人际关系稳定，重视家庭和根基，与亲友关系密切。',
        wealth: '财运稳定，通过长期积累获取财富，适合稳健型投资。',
        type: 'good',
        source: '《渊海子平》、《三命通会》'
      }
    };

    return explanations[geJu] || null;
  }

  /**
   * 获取格局的详细解释
   * @param geJu 格局名称
   * @returns 格局的详细解释
   */
  public static getGeJuExplanation(geJu: string): {
    name: string;
    explanation: string;
    influence: string;
    career: string;
    health: string;
    relationship: string;
    wealth: string;
    type: 'good' | 'bad' | 'neutral' | 'mixed';
    source?: string;
  } {
    const info = this.getGeJuInfo(geJu);

    if (info) {
      return info;
    }

    return {
      name: geJu,
      explanation: '暂无解释',
      influence: '暂无影响',
      career: '暂无职业建议',
      health: '暂无健康建议',
      relationship: '暂无人际关系建议',
      wealth: '暂无财运建议',
      type: 'neutral'
    };
  }

  /**
   * 分析格局的吉凶
   * @param geJu 格局名称
   * @param riZhuStrength 日主旺衰
   * @returns 格局吉凶分析
   */
  public static analyzeGeJu(geJu: string, riZhuStrength: string): {
    analysis: string;
    suggestion: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  } {
    const geJuInfo = this.getGeJuInfo(geJu);

    if (!geJuInfo) {
      return {
        analysis: '无法分析此格局，请咨询专业命理师。',
        suggestion: '建议结合具体八字进行详细分析。',
        level: 'neutral'
      };
    }

    // 根据格局和日主旺衰进行分析
    let analysis = '';
    let suggestion = '';
    let level: 'good' | 'bad' | 'neutral' | 'mixed' = geJuInfo.type;

    // 根据格局类型和日主旺衰进行具体分析
    switch (geJu) {
      case '正印格':
      case '偏印格':
      case '印绶格':
        if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
          analysis = `${geJu}配合日主偏弱，印星生助日主，格局良好。`;
          suggestion = '建议发展教育、文化、行政等印星有利的事业。';
          level = 'good';
        } else {
          analysis = `${geJu}但日主并不弱，印星可能过多，导致日主更旺，不利于平衡。`;
          suggestion = '建议适当泄秀日主之气，发展财官等事业。';
          level = 'neutral';
        }
        break;

      case '正官格':
      case '七杀格':
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          analysis = `${geJu}配合日主偏旺，官杀泄秀日主，格局良好。`;
          suggestion = '建议发展行政、管理、军警等官杀有利的事业。';
          level = 'good';
        } else {
          analysis = `${geJu}但日主并不旺，官杀可能过多，导致日主更弱，不利于平衡。`;
          suggestion = '建议适当扶助日主之气，发展印比等事业。';
          level = 'neutral';
        }
        break;

      case '正财格':
      case '偏财格':
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          analysis = `${geJu}配合日主偏旺，财星耗泄日主，格局良好。`;
          suggestion = '建议发展商业、金融、投资等财星有利的事业。';
          level = 'good';
        } else {
          analysis = `${geJu}但日主并不旺，财星可能过多，导致日主更弱，不利于平衡。`;
          suggestion = '建议适当扶助日主之气，发展印比等事业。';
          level = 'neutral';
        }
        break;

      case '食神格':
      case '伤官格':
        if (riZhuStrength === '旺' || riZhuStrength === '极旺' || riZhuStrength === '偏旺') {
          analysis = `${geJu}配合日主偏旺，食伤泄秀日主，格局良好。`;
          suggestion = '建议发展艺术、教育、餐饮、创作等食伤有利的事业。';
          level = 'good';
        } else {
          analysis = `${geJu}但日主并不旺，食伤可能过多，导致日主更弱，不利于平衡。`;
          suggestion = '建议适当扶助日主之气，发展印比等事业。';
          level = 'neutral';
        }
        break;

      case '比肩格':
      case '劫财格':
        if (riZhuStrength === '弱' || riZhuStrength === '极弱' || riZhuStrength === '偏弱') {
          analysis = `${geJu}配合日主偏弱，比劫帮扶日主，格局良好。`;
          suggestion = '建议发展团队合作、管理、销售等比劫有利的事业。';
          level = 'good';
        } else {
          analysis = `${geJu}但日主并不弱，比劫可能过多，导致日主更旺，不利于平衡。`;
          suggestion = '建议适当泄秀日主之气，发展财官等事业。';
          level = 'neutral';
        }
        break;

      case '专旺格':
      case '从旺格':
        analysis = `${geJu}日主极旺，且有多个比劫帮扶，格局特殊。需要注意大运流年是否有财官食伤来制约日主的过旺。`;
        suggestion = '建议发展领导、管理、创业等需要强势和决断的工作，但需注意调和人际关系。';
        level = 'mixed';
        break;

      case '从弱格':
        analysis = `${geJu}日主极弱，且有多个官杀克制，格局特殊。需要注意大运流年是否有印比来扶助日主的过弱。`;
        suggestion = '建议发展辅助、服务、行政等需要服从和配合的工作，避免过于强势的环境。';
        level = 'mixed';
        break;

      case '伤官佩印格':
        analysis = `${geJu}伤官和印星同时存在，且力量均衡，格局特殊。伤官代表才华创新，印星代表学问文凭，两者相互制约，形成良好平衡。`;
        suggestion = '建议发展教育、文化、艺术、设计、研究等需要创造力和学术背景的工作。';
        level = 'good';
        break;

      case '财官双美格':
        if (riZhuStrength === '平衡' || riZhuStrength === '偏旺') {
          analysis = `${geJu}财星和官星都旺盛有力，且日主适中，能够承受财官之力，格局极佳。`;
          suggestion = '建议发展政商两界的工作，如企业管理、金融投资、政府机关等。';
          level = 'good';
        } else {
          analysis = `${geJu}财星和官星都旺盛有力，但日主过弱或过旺，不能很好地平衡财官之力，需要注意调整。`;
          suggestion = '建议根据日主旺衰情况，适当调整事业方向，避免财官过旺或不及。';
          level = 'mixed';
        }
        break;

      case '日元建禄格':
      case '日元建元格':
        analysis = `${geJu}日主与月令地支构成特殊关系，格局良好。日主得令，根基稳固，有利于事业发展。`;
        suggestion = '建议发展与日主五行相关的事业，充分发挥日主的优势。';
        level = 'good';
        break;

      default:
        analysis = `${geJu}需要结合具体八字进行详细分析。`;
        suggestion = '建议咨询专业命理师进行详细分析。';
    }

    return {
      analysis,
      suggestion,
      level
    };
  }

  /**
   * 分析大运对格局的影响
   * @param geJu 格局名称
   * @param daYunGanZhi 大运干支
   * @param riZhuWuXing 日主五行
   * @returns 大运对格局的影响分析
   */
  public static analyzeDaYunEffect(geJu: string, daYunGanZhi: string, riZhuWuXing: string): {
    effect: string;
    suggestion: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  } {
    if (!geJu || !daYunGanZhi || !riZhuWuXing || daYunGanZhi.length < 2) {
      return {
        effect: '无法分析大运对格局的影响，信息不足。',
        suggestion: '请提供完整的格局、大运干支和日主五行信息。',
        level: 'neutral'
      };
    }

    // 获取大运天干和地支
    const daYunGan = daYunGanZhi[0]; // 天干
    const daYunZhi = daYunGanZhi[1]; // 地支

    // 获取大运天干五行
    const daYunWuXing = this.getStemWuXing(daYunGan);

    // 分析大运五行与日主五行的关系
    const relationship = this.getWuXingRelationship(daYunWuXing, riZhuWuXing);

    // 根据格局类型和大运五行关系进行分析
    let effect = '';
    let suggestion = '';
    let level: 'good' | 'bad' | 'neutral' | 'mixed' = 'neutral';

    // 根据格局类型和大运五行关系进行具体分析
    switch (geJu) {
      case '正印格':
      case '偏印格':
      case '印绶格':
        if (relationship === '生') {
          effect = `大运五行${daYunWuXing}生日主五行${riZhuWuXing}，增强印星生助日主的力量，对${geJu}有利。`;
          suggestion = '此大运期间，可以重点发展教育、文化、行政等印星有利的事业。';
          level = 'good';
        } else if (relationship === '克') {
          effect = `大运五行${daYunWuXing}克日主五行${riZhuWuXing}，削弱印星生助日主的力量，对${geJu}不利。`;
          suggestion = '此大运期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
          level = 'bad';
        } else if (relationship === '被生') {
          effect = `大运五行${daYunWuXing}被日主五行${riZhuWuXing}所生，日主泄气过多，对${geJu}不利。`;
          suggestion = '此大运期间，需要注意保存实力，避免过度付出，适当调整事业方向。';
          level = 'bad';
        } else if (relationship === '被克') {
          effect = `大运五行${daYunWuXing}被日主五行${riZhuWuXing}所克，日主得以发挥，对${geJu}中性影响。`;
          suggestion = '此大运期间，可以适度发展事业，但需要注意平衡各方面的关系。';
          level = 'neutral';
        } else {
          effect = `大运五行${daYunWuXing}与日主五行${riZhuWuXing}相同，增强日主力量，对${geJu}中性影响。`;
          suggestion = '此大运期间，需要注意避免日主过旺，适当发展泄秀之事业。';
          level = 'neutral';
        }
        break;

      // 可以继续添加其他格局类型的分析...

      default:
        effect = `需要结合具体八字和大运干支进行详细分析。`;
        suggestion = '建议咨询专业命理师进行详细分析。';
        level = 'neutral';
    }

    return {
      effect,
      suggestion,
      level
    };
  }

  /**
   * 获取天干五行
   * @param stem 天干
   * @returns 五行
   */
  private static getStemWuXing(stem: string): string {
    const stemWuXingMap: {[key: string]: string} = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };

    return stemWuXingMap[stem] || '未知';
  }

  /**
   * 分析流年对格局的影响
   * @param geJu 格局名称
   * @param liuNianGanZhi 流年干支
   * @param riZhuWuXing 日主五行
   * @returns 流年对格局的影响分析
   */
  public static analyzeLiuNianEffect(geJu: string, liuNianGanZhi: string, riZhuWuXing: string): {
    effect: string;
    suggestion: string;
    level: 'good' | 'bad' | 'neutral' | 'mixed';
  } {
    if (!geJu || !liuNianGanZhi || !riZhuWuXing || liuNianGanZhi.length < 2) {
      return {
        effect: '无法分析流年对格局的影响，信息不足。',
        suggestion: '请提供完整的格局、流年干支和日主五行信息。',
        level: 'neutral'
      };
    }

    // 获取流年天干和地支
    const liuNianGan = liuNianGanZhi[0]; // 天干
    const liuNianZhi = liuNianGanZhi[1]; // 地支

    // 获取流年天干五行
    const liuNianWuXing = this.getStemWuXing(liuNianGan);

    // 分析流年五行与日主五行的关系
    const relationship = this.getWuXingRelationship(liuNianWuXing, riZhuWuXing);

    // 根据格局类型和流年五行关系进行分析
    let effect = '';
    let suggestion = '';
    let level: 'good' | 'bad' | 'neutral' | 'mixed' = 'neutral';

    // 根据格局类型和流年五行关系进行具体分析
    switch (geJu) {
      case '正印格':
      case '偏印格':
      case '印绶格':
        if (relationship === '生') {
          effect = `流年五行${liuNianWuXing}生日主五行${riZhuWuXing}，增强印星生助日主的力量，对${geJu}有利。`;
          suggestion = '此流年期间，可以重点发展教育、文化、行政等印星有利的事业。';
          level = 'good';
        } else if (relationship === '克') {
          effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，削弱印星生助日主的力量，对${geJu}不利。`;
          suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
          level = 'bad';
        } else if (relationship === '被生') {
          effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所生，日主泄气过多，对${geJu}不利。`;
          suggestion = '此流年期间，需要注意保存实力，避免过度付出，适当调整事业方向。';
          level = 'bad';
        } else if (relationship === '被克') {
          effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所克，日主得以发挥，对${geJu}中性影响。`;
          suggestion = '此流年期间，可以适度发展事业，但需要注意平衡各方面的关系。';
          level = 'neutral';
        } else {
          effect = `流年五行${liuNianWuXing}与日主五行${riZhuWuXing}相同，增强日主力量，对${geJu}中性影响。`;
          suggestion = '此流年期间，需要注意避免日主过旺，适当发展泄秀之事业。';
          level = 'neutral';
        }
        break;

      case '正官格':
      case '七杀格':
        if (relationship === '被克') {
          effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所克，增强日主对官杀的克制，对${geJu}有利。`;
          suggestion = '此流年期间，可以重点发展行政、管理、军警等官杀有利的事业。';
          level = 'good';
        } else if (relationship === '克') {
          effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，增强官杀对日主的克制，对${geJu}不利。`;
          suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
          level = 'bad';
        } else if (relationship === '生') {
          effect = `流年五行${liuNianWuXing}生日主五行${riZhuWuXing}，增强日主力量，对${geJu}中性影响。`;
          suggestion = '此流年期间，可以适度发展事业，但需要注意平衡各方面的关系。';
          level = 'neutral';
        } else {
          effect = `流年五行${liuNianWuXing}与日主五行${riZhuWuXing}关系较为复杂，需要具体分析。`;
          suggestion = '此流年期间，需要根据具体情况调整事业方向。';
          level = 'neutral';
        }
        break;

      case '财官双美格':
        if (relationship === '被克' || relationship === '被生') {
          effect = `流年五行${liuNianWuXing}被日主五行${riZhuWuXing}所克或所生，增强日主对财官的控制，对${geJu}有利。`;
          suggestion = '此流年期间，可以重点发展政商两界的工作，如企业管理、金融投资、政府机关等。';
          level = 'good';
        } else if (relationship === '克') {
          effect = `流年五行${liuNianWuXing}克日主五行${riZhuWuXing}，削弱日主对财官的控制，对${geJu}不利。`;
          suggestion = '此流年期间，需要注意保护自己，避免过度劳累，适当调整事业方向。';
          level = 'bad';
        } else {
          effect = `流年五行${liuNianWuXing}与日主五行${riZhuWuXing}关系较为复杂，需要具体分析。`;
          suggestion = '此流年期间，需要根据具体情况调整事业方向。';
          level = 'neutral';
        }
        break;

      // 可以继续添加其他格局类型的分析...

      default:
        effect = `需要结合具体八字和流年干支进行详细分析。`;
        suggestion = '建议咨询专业命理师进行详细分析。';
        level = 'neutral';
    }

    return {
      effect,
      suggestion,
      level
    };
  }

  /**
   * 分析格局变化趋势
   * @param geJu 格局名称
   * @param riZhuWuXing 日主五行
   * @param daYunList 大运列表，每个元素包含干支和年份
   * @returns 格局变化趋势分析
   */
  public static analyzeGeJuTrend(
    geJu: string,
    riZhuWuXing: string,
    daYunList: {ganZhi: string; startYear: number; endYear: number}[]
  ): {
    trend: string;
    keyYears: {year: number; event: string; level: 'good' | 'bad' | 'neutral' | 'mixed'}[];
    suggestion: string;
  } {
    if (!geJu || !riZhuWuXing || !daYunList || daYunList.length === 0) {
      return {
        trend: '无法分析格局变化趋势，信息不足。',
        keyYears: [],
        suggestion: '请提供完整的格局、日主五行和大运信息。'
      };
    }

    // 分析每个大运对格局的影响
    const daYunEffects = daYunList.map(daYun => {
      const effect = this.analyzeDaYunEffect(geJu, daYun.ganZhi, riZhuWuXing);
      return {
        ...effect,
        startYear: daYun.startYear,
        endYear: daYun.endYear,
        ganZhi: daYun.ganZhi
      };
    });

    // 找出关键年份（大运交接年）
    const keyYears = daYunEffects.map((effect, index) => {
      if (index === 0) {
        return {
          year: effect.startYear,
          event: `进入${effect.ganZhi}大运，${effect.effect}`,
          level: effect.level
        };
      } else {
        return {
          year: effect.startYear,
          event: `从${daYunEffects[index-1].ganZhi}大运进入${effect.ganZhi}大运，${effect.effect}`,
          level: effect.level
        };
      }
    });

    // 分析整体趋势
    let trend = '';
    const goodDaYun = daYunEffects.filter(effect => effect.level === 'good').length;
    const badDaYun = daYunEffects.filter(effect => effect.level === 'bad').length;
    const neutralDaYun = daYunEffects.filter(effect => effect.level === 'neutral' || effect.level === 'mixed').length;

    if (goodDaYun > badDaYun && goodDaYun > neutralDaYun) {
      trend = `整体来看，${geJu}在未来大运中发展趋势良好，有利于事业发展和个人成长。`;
    } else if (badDaYun > goodDaYun && badDaYun > neutralDaYun) {
      trend = `整体来看，${geJu}在未来大运中发展趋势不佳，需要注意调整和应对。`;
    } else {
      trend = `整体来看，${geJu}在未来大运中发展趋势起伏不定，需要根据具体大运灵活调整。`;
    }

    // 提供建议
    let suggestion = '';
    if (goodDaYun > badDaYun) {
      suggestion = `建议在有利大运期间积极发展事业，在不利大运期间注意调整和保守。特别是在${keyYears.filter(year => year.level === 'good').map(year => year.year).join('年、')}年等关键年份，可以有所作为。`;
    } else if (badDaYun > goodDaYun) {
      suggestion = `建议在不利大运期间保守行事，注意调整心态和方向。特别是在${keyYears.filter(year => year.level === 'bad').map(year => year.year).join('年、')}年等关键年份，需要特别谨慎。`;
    } else {
      suggestion = `建议根据具体大运灵活调整策略，在有利时期积极进取，在不利时期保守行事。`;
    }

    return {
      trend,
      keyYears,
      suggestion
    };
  }

  /**
   * 获取五行之间的关系
   * @param wuXing1 五行1
   * @param wuXing2 五行2
   * @returns 关系类型：'生'、'克'、'被生'、'被克'、'同'
   */
  private static getWuXingRelationship(wuXing1: string, wuXing2: string): string {
    if (wuXing1 === wuXing2) {
      return '同';
    }

    // 五行相生关系：木生火，火生土，土生金，金生水，水生木
    const shengRelations: {[key: string]: string} = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };

    // 五行相克关系：木克土，土克水，水克火，火克金，金克木
    const keRelations: {[key: string]: string} = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };

    if (shengRelations[wuXing1] === wuXing2) {
      return '生';
    } else if (keRelations[wuXing1] === wuXing2) {
      return '克';
    } else if (shengRelations[wuXing2] === wuXing1) {
      return '被生';
    } else if (keRelations[wuXing2] === wuXing1) {
      return '被克';
    }

    return '未知';
  }
}
